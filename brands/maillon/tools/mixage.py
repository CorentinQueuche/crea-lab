"""Mixe la bande-son d'un film et la monte sur la vidéo.

Ce n'est pas un simple empilement : chaque son est filtré, placé dans une réverbération commune,
la musique s'efface sous les bruitages, et l'ensemble passe par un compresseur doux et un limiteur
avant d'être ramené au niveau visé. Voir references/son.md.

Lit <projet>/son/mix.json et les sons de <projet>/son/sons/*.wav (48 kHz) :
  {"duree": 22.8,
   "musique": {"son": "musique", "decalage": 1.53, "gain": 0.62, "debut": 0, "fondu_entree": 0, "fondu_sortie": 0,
               "creuse_db": 3.5},
   "reverb": {"duree": 1.3, "retour": 0.5},
   "traitements": {"clic": {"hp": 250, "lp": 6000, "doux": 3, "rev": 0.1},
                   "impact": {"hp": 30, "lp": 9000, "rev": 0.35}},
   "poses": [{"son": "clic", "t": 4.25, "gain": 0.13, "pan": -0.2},
             {"son": "impact", "t": 12.49, "gain": 0.45, "creuse_db": 6}],
   "maitre": {"lufs": -15, "crete_db": -1.5}}

Pose :
  t       instant de l'attaque, en secondes (le silence avant l'attaque du fichier est coupé)
  gain    niveau, le son étant d'abord ramené à une crête de 1
  pan     de -1 (gauche) à 1 (droite) ; ton : transposition en demi-tons (rester sous 3 : au-delà,
          le timbre se déforme) ; fin : durée gardée ; entree / sortie : fondus en secondes
  alea    variation aléatoire de gain et de ton (frappes de clavier)
  creuse_db  la musique s'efface d'autant de dB autour de ce son (moments forts)
Geste : un mouvement continu (courbe qui se trace, élément qu'on fait glisser, caméra qui recule) ne se
  couvre pas avec un son tout fait, dont la durée ne correspond jamais. Une pose "geste" fabrique un
  souffle à la durée exacte du mouvement, qui monte ou descend et se déplace avec lui :
    {"geste": "trace", "t": 2.0, "duree": 3.6, "de": 500, "a": 2600, "pan": -0.4, "pan_a": 0.4, "gain": 0.14}
  de / a : couleur du souffle au début et à la fin, en Hz (monter = avancer, descendre = reculer) ;
  pan / pan_a : position gauche-droite au début et à la fin ; note : part de note tenue qui suit la
  montée (0 = souffle pur, 0,4 = plus chantant) ; forme : lineaire, accel, decel ou doux.
Traitement d'un son (dans "traitements", ou directement dans une pose) :
  hp, lp  coupe-bas et coupe-haut en Hz ; doux : atténuation en dB autour de 3,2 kHz (dureté) ;
  rev     part envoyée dans la réverbération commune (0 à 1)
Musique : decalage = instant du film où elle commence ; debut = point de départ dans le fichier ;
  creuse_db = effacement automatique sous les bruitages ; hp / lp possibles.

Usage :
  python mixage.py <projet>            -> son/bande-son.wav, avec niveau et profil mesurés
  python mixage.py <projet> --monter   -> en plus, presentation/film.mp4 à partir de film-muet.mp4
                                          (autres noms : clés "film_muet" et "film" de mix.json)
"""
import json, pathlib, subprocess, sys
import numpy as np
from scipy import signal
from scipy.io import wavfile
from scipy.ndimage import minimum_filter1d

SR = 48000
BLOC = 48                       # 1 ms : cadence de calcul des enveloppes
DEFAUT = {"hp": 90, "lp": 11000, "doux": 0, "rev": .15}


def charge(chemin, seuil=.06, marge=.004):
    sr, x = wavfile.read(chemin)
    if sr != SR:
        raise SystemExit(f"{chemin.name} : {sr} Hz, attendu {SR} (convertir avec ffmpeg -ar 48000 -ac 2)")
    x = x.astype(np.float64) / 32768
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    x /= max(1e-9, np.abs(x).max())
    m = np.abs(x).max(axis=1)
    return x[max(0, int(np.argmax(m > seuil)) - int(marge * SR)):]


def filtre(x, hp=None, lp=None, doux=0):
    if hp:
        x = signal.sosfilt(signal.butter(2, hp / (SR / 2), "high", output="sos"), x, axis=0)
    if lp and lp < SR / 2 - 500:
        x = signal.sosfilt(signal.butter(2, lp / (SR / 2), "low", output="sos"), x, axis=0)
    if doux:                                            # cloche de -doux dB à 3,2 kHz (formules RBJ)
        A, w0, q = 10 ** (-doux / 40), 2 * np.pi * 3200 / SR, 1.0
        al = np.sin(w0) / (2 * q)
        b = np.array([1 + al * A, -2 * np.cos(w0), 1 - al * A])
        a = np.array([1 + al / A, -2 * np.cos(w0), 1 - al / A])
        x = signal.lfilter(b / a[0], a / a[0], x, axis=0)
    return x


def geste(p):
    """Souffle synthétisé à la durée exacte d'un mouvement, dont la couleur glisse de `de` à `a`."""
    n = int(p["duree"] * SR)
    k = np.linspace(0, 1, n)
    pos = {"lineaire": k, "accel": k ** 2, "decel": 1 - (1 - k) ** 2, "doux": k * k * (3 - 2 * k)}[p.get("forme", "doux")]
    fc = np.exp(np.log(p.get("de", 500)) + (np.log(p.get("a", 2500)) - np.log(p.get("de", 500))) * pos)
    rng = np.random.default_rng(int(p["t"] * 1000))
    bruit = rng.normal(0, 1, (n, 2))
    x = np.zeros((n, 2))
    for c in np.geomspace(140, 9000, 12):          # banc de filtres fondus entre eux
        w = np.exp(-((np.log(fc) - np.log(c)) ** 2) / (2 * .42 ** 2))
        sos = signal.butter(2, [c * .8 / (SR / 2), min(.98, c * 1.25 / (SR / 2))], "band", output="sos")
        x += signal.sosfilt(sos, bruit, axis=0) * w[:, None]
    x /= max(1e-9, np.abs(x).max())
    note = p.get("note", .25)
    if note:                                       # une note douce qui suit la montée, une octave plus bas
        ph = 2 * np.pi * np.cumsum(np.clip(fc * .5, 120, 1600)) / SR
        x += note * (np.sin(ph) + .2 * np.sin(2 * ph))[:, None]
    na, nr = max(1, int(min(.3 * p["duree"], .35) * SR)), max(1, int(min(.4 * p["duree"], .6) * SR))
    env = np.ones(n)
    env[:na] = np.sin(np.linspace(0, np.pi / 2, na)) ** 2
    env[-nr:] *= np.cos(np.linspace(0, np.pi / 2, nr)) ** 2
    x *= env[:, None]
    return x / max(1e-9, np.abs(x).max())


def reponse_reverb(duree=1.3, lp=5500, hp=300, predelai=.018):
    """Réponse d'une salle douce : bruit qui s'éteint en `duree` secondes, sans aigus ni graves."""
    rng = np.random.default_rng(7)
    n = int(duree * SR)
    t = np.arange(n) / SR
    ri = rng.normal(0, 1, (n, 2)) * np.exp(-6.9 * t / duree)[:, None]
    ri = filtre(ri, hp, lp)
    ri = np.vstack([np.zeros((int(predelai * SR), 2)), ri])
    return ri / np.sqrt((ri ** 2).sum(axis=0, keepdims=True))


def suivi(v, attaque, relache):
    """Enveloppe à attaque et relâche distinctes, sur un signal à 1 valeur par milliseconde."""
    ka, kr = np.exp(-1 / (attaque * 1000)), np.exp(-1 / (relache * 1000))
    out = np.empty_like(v)
    e = 0.0
    for i, x in enumerate(v):
        k = ka if x > e else kr
        e = k * e + (1 - k) * x
        out[i] = e
    return out


def blocs(x, f=np.max):
    n = len(x) // BLOC
    return f(np.abs(x[:n * BLOC]).max(axis=1).reshape(n, BLOC), axis=1)


def vers_echantillons(g, n):
    return np.interp(np.arange(n), np.arange(len(g)) * BLOC + BLOC / 2, g)


def lufs(x, chemin):
    wavfile.write(chemin, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(chemin), "-af", "ebur128", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    v = [l.split()[1] for l in r.stderr.splitlines() if l.strip().startswith("I:")]
    return float(v[-1]) if v else None


def maitre(x, plafond):
    """Compresseur doux (2:1 au-dessus de -16 dB) puis limiteur à anticipation."""
    niv = suivi(np.sqrt(blocs(x ** 2, np.mean)), .015, .22)
    db = 20 * np.log10(niv + 1e-9)
    red = np.where(db > -16, (db + 16) * .5, 0)                      # dB retirés
    x = x * vers_echantillons(10 ** (-red / 20), len(x))[:, None]
    pic = blocs(x)
    g = np.minimum(1, plafond / np.maximum(pic, 1e-9))
    g = minimum_filter1d(g, 7)                                       # anticipe de quelques ms
    g = 1 - suivi((1 - g)[::-1], .001, .08)[::-1]                    # la réduction s'installe avant le pic
    g = np.minimum(g, 1 - suivi(1 - g, .001, .12))                   # et se relâche en douceur après
    x = x * vers_echantillons(g, len(x))[:, None]
    return np.clip(x, -plafond, plafond)


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        raise SystemExit(__doc__)
    projet = pathlib.Path(args[0]).resolve()
    cfg = json.loads((projet / "son" / "mix.json").read_text(encoding="utf-8"))
    sons = projet / "son" / "sons"
    N = int(cfg["duree"] * SR)
    rng = np.random.default_rng(118)
    cache = {}
    brut = cfg.get("brut", False)                # "brut": true = ancien empilement sans traitement
    regles = cfg.get("traitements", {})
    direct, envoi = np.zeros((N, 2)), np.zeros((N, 2))
    creux = np.zeros(N // BLOC)                  # effacements demandés par les moments forts, en dB

    for p in cfg.get("poses", []):
        nom = p.get("son", "geste")
        base = dict(DEFAUT, hp=150, lp=9000, rev=.3) if "geste" in p else DEFAUT
        r = dict(base, **regles.get(nom, {}), **{k: p[k] for k in ("hp", "lp", "doux", "rev") if k in p})
        if "geste" in p:
            x = filtre(geste(p), r["hp"], r["lp"], r["doux"])
        else:
            cle = (nom, r["hp"], r["lp"], r["doux"])
            if cle not in cache:
                x = charge(sons / f"{nom}.wav")
                cache[cle] = x if brut else filtre(x, r["hp"], r["lp"], r["doux"])
            x = cache[cle]
        a = p.get("alea", 0)
        ton = p.get("ton", 0) + (rng.uniform(-1.5, 1.5) * a if a else 0)
        gain = p.get("gain", .2) * (1 + rng.uniform(-.18, .18) * a if a else 1)
        if ton and "geste" not in p:
            x = signal.resample_poly(x, 1000, int(round(1000 * 2 ** (ton / 12))), axis=0)
        x = x[:int(p["fin"] * SR)].copy() if p.get("fin") else x.copy()
        ns = min(len(x), int(p.get("sortie", .06 if p.get("fin") else .012) * SR))
        if ns > 1:
            x[-ns:] *= np.linspace(1, 0, ns)[:, None]
        ne = max(1, min(len(x), int(p.get("entree", .003) * SR)))
        x[:ne] *= np.linspace(0, 1, ne)[:, None]
        i = int(p["t"] * SR)
        if i < 0:
            x, i = x[-i:], 0
        n = min(len(x), N - i)
        if n <= 0:
            continue
        pan = np.linspace(p.get("pan", 0), p.get("pan_a", p.get("pan", 0)), len(x))[:n]      # le son se déplace avec le geste
        y = x[:n] * gain * np.stack([np.clip(1 - pan, 0, 1), np.clip(1 + pan, 0, 1)], axis=1)
        direct[i:i + n] += y
        envoi[i:i + n] += y * r["rev"]
        if p.get("creuse_db"):                   # creux : descente en 40 ms, tenue, remontée en 0,9 s
            k = np.arange(len(creux)) - i / BLOC
            forme = np.where(k < 0, np.exp(k / 40), np.where(k < 180, 1, np.exp(-(k - 180) / 900)))
            creux = np.maximum(creux, p["creuse_db"] * forme)

    if brut:
        bruitages = direct
    else:
        rv = cfg.get("reverb", {})
        ri = reponse_reverb(rv.get("duree", 1.3), rv.get("lp", 5500), rv.get("hp", 300), rv.get("predelai", .018))
        queue = np.stack([signal.fftconvolve(envoi[:, c], ri[:, c])[:N] for c in range(2)], axis=1)
        bruitages = direct + queue * rv.get("retour", .5)

    mix = bruitages.copy()
    mus = cfg.get("musique")
    efface = None
    if mus:
        sr, x = wavfile.read(sons / f"{mus['son']}.wav")
        x = x.astype(np.float64) / 32768
        x = x[int(mus.get("debut", 0) * SR):]
        if not brut and (mus.get("hp") or mus.get("lp")):
            x = filtre(x, mus.get("hp"), mus.get("lp"))
        i0 = int(mus.get("decalage", 0) * SR)
        if i0 < 0:
            x, i0 = x[-i0:], 0
        n = min(len(x), N - i0)
        piste = np.zeros((N, 2))
        piste[i0:i0 + n] = x[:n] * mus.get("gain", .6)
        fe, fs = int(mus.get("fondu_entree", 0) * SR), int(mus.get("fondu_sortie", 0) * SR)
        if fe:
            piste[i0:i0 + fe] *= np.linspace(0, 1, fe)[:, None]
        if fs and i0 + n >= N:
            piste[-fs:] *= (np.cos(np.linspace(0, np.pi / 2, fs)) ** 2)[:, None]
        if not brut:
            # la musique s'efface sous les bruitages : suivi de leur niveau, plus les creux demandés
            niv = np.sqrt(blocs(bruitages ** 2, np.mean))
            ref = np.percentile(niv[niv > 1e-4], 85) if (niv > 1e-4).any() else 1
            auto = mus.get("creuse_db", 3.5) * np.clip(suivi(niv, .025, .45) / ref, 0, 1) ** .7
            efface = np.maximum(auto, creux[:len(auto)])
            piste *= vers_echantillons(10 ** (-efface / 20), N)[:, None]
        mix += piste

    mix = signal.sosfilt(signal.butter(2, 28 / (SR / 2), "high", output="sos"), mix, axis=0)
    nf = int(cfg.get("fondu_fin", 1.0) * SR)
    mix[-nf:] *= (np.cos(np.linspace(0, np.pi / 2, nf)) ** 2)[:, None]
    m = cfg.get("maitre", {})
    plafond = 10 ** (m.get("crete_db", cfg.get("crete_db", -1.5)) / 20)
    sortie = projet / "son" / "bande-son.wav"
    if brut:
        fini = np.tanh(mix * 1.25) / 1.25
        fini *= plafond / np.abs(fini).max()
        niveau = lufs(fini, sortie)
    else:
        cible = m.get("lufs", -15)
        g = .7 / max(1e-9, np.abs(mix).max())
        for _ in range(3):                       # ajuste le gain d'entrée jusqu'au niveau visé
            fini = maitre(mix * g, plafond)
            niveau = lufs(fini, sortie)
            if niveau is None or abs(niveau - cible) < .3:
                break
            g *= 10 ** (np.clip(cible - niveau, -8, 8) / 20)
    wavfile.write(sortie, SR, (fini * 32767).astype(np.int16))

    h = SR // 2
    profil = [20 * np.log10(np.sqrt((fini[i:i + h] ** 2).mean()) + 1e-9) for i in range(0, N - h + 1, h)]
    print("niveau par demi-seconde (dB) :", " ".join(f"{v:.0f}" for v in profil))
    print(f"niveau intégré : {niveau} LUFS ; crête {20 * np.log10(np.abs(fini).max() + 1e-9):.1f} dB ; {len(cfg.get('poses', []))} sons posés")
    if efface is not None:
        print(f"musique effacée de {efface.mean():.1f} dB en moyenne, {efface.max():.1f} dB au plus")
    print("bande-son :", sortie)

    if "--monter" in args:
        muet = projet / "presentation" / cfg.get("film_muet", "film-muet.mp4")
        film = projet / "presentation" / cfg.get("film", "film.mp4")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(muet), "-i", str(sortie), "-c:v", "copy", "-c:a", "aac", "-b:a", "256k",
                        "-movflags", "+faststart", "-shortest", str(film)], check=True)
        print("film :", film)
