"""Rend le film d'un projet : capture image par image, caméra 3D, encodage.

La page film.html (créée à partir de index.html + film.css + film.js) expose window.film(t),
qui pose l'interface à l'instant t et renvoie la caméra. Voir references/film.md.

Usage :
  python film.py <projet> --apercu            1 image sur 30, sur une planche (moins d'une minute)
  python film.py <projet> --apercu --de 9 --a 14 --pas 15 --vignette 640     un passage, en plus grand
  python film.py <projet> --image 4.6         une seule image en pleine résolution, à 4,6 s
  python film.py <projet>                     rendu complet -> presentation/film-muet.mp4
  python film.py <projet> --de 2.4 --a 3.6    refait seulement ce passage, puis réencode
  python film.py <projet> --nettoyer          supprime les images intermédiaires (plusieurs Go)

Le rendu complet garde ses images dans rendu/ pour permettre de refaire un passage et de lancer
verif_film.py : faire --nettoyer quand le film est validé.
"""
import json, math, os, pathlib, shutil, subprocess, sys
from multiprocessing import Pool
from PIL import Image
from camera import rendre, ambiance_de

ICI = pathlib.Path(__file__).resolve().parent


def image(tache):
    src_dir, out_dir, W, H, m, amb = tache
    src = Image.open(pathlib.Path(src_dir) / m["fichier"])
    res = rendre(src, m["cam"], W, H, m["zone"], amb, graine=1000 + m["i"])
    res.save(pathlib.Path(out_dir) / m["fichier"], compress_level=1)
    return m["i"]


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        raise SystemExit(__doc__)
    projet = pathlib.Path(args[0]).resolve()
    val = lambda n, d=None: args[args.index("--" + n) + 1] if "--" + n in args else d
    rendu = projet / "rendu"
    rendu.mkdir(exist_ok=True)
    if "--nettoyer" in args:
        for d in ("film-src", "film-images", "film-apercu-src", "film-apercu", "film-essai-src", "film-essai", "apercus", "ctrl"):
            if (rendu / d).is_dir():
                shutil.rmtree(rendu / d)
                print("supprimé :", rendu / d)
        print("gardés : rendu/plat.png, rendu/reperes.json et film.html (recréé à chaque capture).")
        sys.exit(0)

    cfg = json.loads((projet / "vitrine.json").read_text(encoding="utf-8"))
    ips = cfg.get("film", {}).get("ips", 60)
    apercu = "--apercu" in args
    seule = val("image")
    de, a = val("de"), val("a")
    if seule:
        de, a = seule, str(float(seule) + .5 / ips)
    pas = val("pas", "30" if apercu else "1")
    genre = "film-apercu" if apercu else "film-essai" if seule else "film"
    src = rendu / (genre + "-src")
    out = rendu / (genre if genre != "film" else "film-images")
    if apercu or seule:
        for d in (src, out):
            if d.is_dir():
                shutil.rmtree(d)
    out.mkdir(exist_ok=True)

    cmd = ["node", str(ICI / "capturer.mjs"), "--projet", str(projet), "--pas", pas, "--sortie", str(src)]
    if de:
        cmd += ["--de", de]
    if a:
        cmd += ["--a", a]
    if subprocess.run(cmd).returncode:
        raise SystemExit("la capture a échoué")
    meta = json.loads((src / "meta.json").read_text(encoding="utf-8"))
    W, H = (640, round(640 * meta["H"] / meta["W"])) if apercu else (meta["W"], meta["H"])
    amb = ambiance_de(cfg)
    taches = [(str(src), str(out), W, H, m, amb) for m in meta["images"]]
    with Pool(min(12, max(2, (os.cpu_count() or 4) - 2))) as pool:
        for n, _ in enumerate(pool.imap_unordered(image, taches, chunksize=4), 1):
            if n % 240 == 0:
                print(f"{n} / {len(taches)} images rendues", flush=True)
    print("images rendues :", len(taches), (W, H))

    if seule:
        print("image :", out / meta["images"][0]["fichier"])
        sys.exit(0)
    if apercu:
        fs = sorted(out.glob("f*.png"))
        w = int(val("vignette", "400"))
        cols = 6 if w <= 400 else 4
        h = round(w * H / W)
        p = Image.new("RGB", (cols * w, math.ceil(len(fs) / cols) * h), (0, 0, 0))
        for i, f in enumerate(fs):
            p.paste(Image.open(f).resize((w, h), Image.LANCZOS), ((i % cols) * w, (i // cols) * h))
        p.save(out / "_planche.jpg", quality=88)
        t = [m["t"] for m in meta["images"]]
        print(f"planche : {out / '_planche.jpg'} ({len(fs)} images, de {t[0]:.2f} s à {t[-1]:.2f} s, une toutes les {int(pas) / meta['ips']:.2f} s, {cols} par ligne)")
        sys.exit(0)

    presentes = len(list(out.glob("f*.png")))
    if int(pas) != 1 or presentes < meta["total"]:
        print(f"{presentes} images sur {meta['total']} : pas d'encodage (il faut toutes les images, rendues avec --pas 1).")
        sys.exit(0)
    (projet / "presentation").mkdir(exist_ok=True)
    sortie = projet / "presentation" / "film-muet.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(meta["ips"]), "-i", str(out / "f%05d.png"),
                    "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(sortie)], check=True)
    print(f"film : {sortie} ({sortie.stat().st_size / 1e6:.1f} Mo, {meta['total'] / meta['ips']:.1f} s)")
    print("ensuite : `verif_film.py <projet>` pour chercher les sauts d'image, puis `film.py <projet> --nettoyer` une fois le film validé.")
