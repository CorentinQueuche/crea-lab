"""Mesure les sons d'un projet pour pouvoir les caler sans les écouter.

Pour chaque son de <projet>/son/sons/*.wav : durée, crête, début de l'attaque, instant du pic, fin utile.
Pour la musique (--musique <nom>, « musique » par défaut) : niveau seconde par seconde, attaques,
période du battement et entrée des graves. C'est ce qui permet de choisir le décalage de la musique
(faire tomber ses temps sur les coupes) et l'avance à donner aux sons dont le pic arrive tard.

Usage : python analyse_sons.py <projet> [--musique musique]
"""
import pathlib, sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        raise SystemExit(__doc__)
    sons = pathlib.Path(args[0]).resolve() / "son" / "sons"
    nom_mus = args[args.index("--musique") + 1] if "--musique" in args else "musique"
    print(f"{'son':20s} durée  crête   début   pic     fin utile")
    for f in sorted(sons.glob("*.wav")):
        sr, x = wavfile.read(f)
        x = x.astype(np.float64) / 32768
        m = np.abs(x).max(axis=1) if x.ndim > 1 else np.abs(x)
        pk = m.max()
        on = np.argmax(m > pk * .08) / sr
        off = (len(m) - np.argmax(m[::-1] > pk * .03)) / sr
        print(f"{f.stem:20s} {len(m) / sr:5.2f}  {20 * np.log10(pk + 1e-9):5.1f}  {on:6.3f}  {np.argmax(m) / sr:6.3f}  {off:6.2f}")

    f = sons / f"{nom_mus}.wav"
    if f.exists():
        sr, x = wavfile.read(f)
        x = x.astype(np.float64) / 32768
        mono = x.mean(axis=1) if x.ndim > 1 else x
        print(f"\n{nom_mus} : niveau par quart de seconde (dB), une ligne par seconde")
        h = sr // 4
        env = [20 * np.log10(np.sqrt((mono[i:i + h] ** 2).mean()) + 1e-9) for i in range(0, len(mono) - h, h)]
        for s in range(0, len(env), 4):
            print(f"{s // 4:3d} s ", " ".join(f"{v:4.0f}" for v in env[s:s + 4]))
        w = sr // 100

        def attaques(sig):
            e = np.array([np.sqrt((sig[i:i + w] ** 2).mean()) for i in range(0, len(sig) - w, w)])
            d = np.diff(e)
            pk, _ = signal.find_peaks(d, height=d.max() * .3, distance=12)
            return [round(float(p) / 100, 2) for p in pk]

        att = attaques(mono)
        print("attaques (s) :", att)
        if len(att) > 4:
            ecarts = np.diff(att)
            ecarts = ecarts[(ecarts > .2) & (ecarts < 1.2)]
            if len(ecarts):
                per = float(np.median(ecarts))
                print(f"battement estimé : {per:.2f} s ({60 / per:.0f} à la noire) ; phase {att[0] % per:.2f} s")
        graves = signal.sosfilt(signal.butter(4, 120 / (sr / 2), "low", output="sos"), mono)
        ag = attaques(graves)
        print("entrée des graves :", ag[0] if ag else "aucune", "s")
        fort = [i / 4 for i, v in enumerate(env) if v > max(env) - 12]
        print(f"partie audible : de {fort[0]:.2f} s à {fort[-1] + .25:.2f} s sur {len(mono) / sr:.2f} s")
        utile = fort[-1] + .25 - fort[0]
        if utile < .7 * len(mono) / sr:
            print(f"attention : seulement {utile:.1f} s utiles. Si le film est plus long, cette musique ne le portera pas : la refaire (voir son.md).")
