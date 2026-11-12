"""Rend les mockups d'un projet à partir de son interface HTML à plat.

1. Chrome capture la page à plat, en haute définition (rendu/plat.png), et la capture est vérifiée.
2. Chaque visuel de vitrine.json place une caméra au-dessus de cette capture.
3. Les « pages directes » (planche d'identité...) sont capturées telles quelles.

Usage :
  python mockups.py <projet> --plat            capture à plat seule si vitrine.json n'a pas encore de visuels
  python mockups.py <projet> --apercu          aperçus 800 px + planche (rapide, pour régler)
  python mockups.py <projet>                   rendu final dans presentation/
  python mockups.py <projet> --plat 2 5        recapture la page, puis ne rend que les visuels 2 et 5

La page est recapturée d'office quand la finesse demandée par les visuels a changé.
"""
import json, math, pathlib, subprocess, sys
import numpy as np
from PIL import Image
from camera import rendre, zoom_px, chrome, ambiance_de

Image.MAX_IMAGE_PIXELS = None


def capture(page, sortie, taille, echelle):
    subprocess.run([chrome(), "--headless=new", "--disable-gpu", "--hide-scrollbars",
                    f"--force-device-scale-factor={echelle}", f"--window-size={taille[0]},{taille[1]}",
                    "--virtual-time-budget=8000", "--allow-file-access-from-files",
                    f"--screenshot={sortie}", page.as_uri()], check=True, capture_output=True)
    im = Image.open(sortie)
    attendu = (round(taille[0] * echelle), round(taille[1] * echelle))
    if im.size != attendu:
        raise SystemExit(f"capture {im.size}, attendu {attendu} : la page dépasse-t-elle de sa taille fixe ?")
    return im


def capture_verifiee(page, sortie, taille, echelle, essais=2):
    """Une très grande capture sort parfois à moitié peinte, sans erreur de Chrome. On la compare,
    bande par bande, à une capture en 1x (toujours complète) et on recommence si elles divergent."""
    temoin = sortie.with_name("plat-1x.png")
    ref = np.asarray(capture(page, temoin, taille, 1).convert("L").resize((400, 260), Image.BILINEAR), dtype=np.float32)
    for essai in range(1, essais + 1):
        im = capture(page, sortie, taille, echelle)
        a = np.asarray(im.convert("L").resize((400, 260), Image.BILINEAR), dtype=np.float32)
        ecarts = [float(np.abs(a[i:i + 13] - ref[i:i + 13]).mean()) for i in range(0, 260, 13)]
        if max(ecarts) < 10:
            temoin.unlink()
            return im
        print(f"capture en {echelle}x incomplète (essai {essai})")
    temoin.unlink()
    return None


def planche(fichiers, sortie, cols=4, w=1200):
    if not fichiers:
        return
    h = round(w * Image.open(fichiers[0]).size[1] / Image.open(fichiers[0]).size[0])
    g = 24
    rows = math.ceil(len(fichiers) / cols)
    p = Image.new("RGB", (cols * w + (cols + 1) * g, rows * h + (rows + 1) * g), (8, 8, 9))
    for i, f in enumerate(fichiers):
        p.paste(Image.open(f).convert("RGB").resize((w, h), Image.LANCZOS), (g + (i % cols) * (w + g), g + (i // cols) * (h + g)))
    p.save(sortie, quality=90)


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        raise SystemExit(__doc__)
    projet = pathlib.Path(args[0]).resolve()
    cfg = json.loads((projet / "vitrine.json").read_text(encoding="utf-8"))
    monde = cfg["monde"]
    apercu = "--apercu" in args
    choix = [int(a) for a in args[1:] if a.isdigit()]
    rendu = projet / "rendu"
    rendu.mkdir(exist_ok=True)
    visuels = cfg.get("visuels", {}).get("liste", [])
    Wf, Hf = cfg.get("visuels", {}).get("format", [3200, 2400])
    page = projet / cfg.get("page", "index.html")
    plat = rendu / "plat.png"

    # échelle de capture : assez fine pour le plus gros plan, sinon le texte serait agrandi et flou
    besoin = max((zoom_px(v, Wf) for v in visuels), default=2)
    ech = cfg.get("echelle_plat") or min(8, max(2, math.ceil(besoin - .05)))
    if besoin > ech * 1.15:
        print(f"attention : le plus gros plan demande {besoin:.1f} px par px CSS, la capture en donne {ech}. Élargir ce plan ou augmenter echelle_plat.")
    # Au-delà d'une certaine taille (vers 14 000 px de large), Chrome ne peint plus toute la page : on
    # redescend alors d'un cran, quitte à agrandir très légèrement le plus gros plan.
    note = rendu / "plat.json"
    faite = json.loads(note.read_text(encoding="utf-8")) if note.exists() else {}
    if "--plat" in args or not plat.exists() or faite.get("demandee") != ech:
        for e in range(ech, max(1, ech - 4), -1):
            im = capture_verifiee(page, plat, monde, e)
            if im:
                break
        else:
            raise SystemExit("capture à plat incomplète à toutes les échelles essayées : réduire `monde` ou relancer.")
        note.write_text(json.dumps({"demandee": ech, "obtenue": e}), encoding="utf-8")
        print("plat", im.size, "->", plat, "" if e == ech else f"(échelle {e} au lieu de {ech} : le plus gros plan sera agrandi de {besoin / e:.2f} fois)")
    src = Image.open(plat).convert("RGB")
    clair = float(np.asarray(src.resize((200, 130))).mean()) > 120
    if clair and cfg.get("theme") != "clair":
        print('interface claire détectée : ajouter "theme": "clair" dans vitrine.json, sinon le halo brûle les blancs.')
    if not visuels:
        print("pas encore de visuels dans vitrine.json : capture à plat seule. Regarder rendu/plat.png.")
        sys.exit(0)

    W, H = (800, round(800 * Hf / Wf)) if apercu else (Wf, Hf)
    zone = {"x": 0, "y": 0, "w": monde[0], "h": monde[1]}
    amb = ambiance_de(cfg)
    dossier = rendu / "apercus" if apercu else projet / "presentation"
    dossier.mkdir(exist_ok=True)
    for n, v in enumerate(visuels, 1):
        if choix and n not in choix:
            continue
        res = rendre(src, v, W, H, zone, amb, graine=100 + n)
        res.save(dossier / f"{n:02d}-{v['nom']}.png", optimize=not apercu)
        print(n, v["nom"], res.size)

    # pages rendues telles quelles, sans caméra (planche d'identité, etc.)
    n0 = len(visuels)
    for i, d in enumerate(cfg.get("pages_directes", []), 1):
        if choix and n0 + i not in choix:
            continue
        t = d.get("taille", [1600, 1200])
        e = 1 if apercu else d.get("echelle", 2)
        im = capture(projet / d["page"], dossier / f"{n0 + i:02d}-{d['nom']}.png", t, e)
        print(n0 + i, d["nom"], im.size)

    fichiers = sorted(dossier.glob("[0-9][0-9]-*.png"))
    planche(fichiers, dossier / "planche.jpg", w=400 if apercu else 1200)
    print("planche :", dossier / "planche.jpg")
