"""Cherche les images anormales d'un film rendu, avant de nettoyer rendu/film-images.

Mesure l'écart entre images voisines et signale :
  - les sauts brusques qui ne sont pas des coupes annoncées (élément qui change de place ou de
    taille d'une image à l'autre, bascule de caméra visible) ;
  - les images isolées fautives (une image très différente de ses deux voisines) ;
  - les images presque unies (plan vide).
Les coupes sont lues dans rendu/reperes.json (clé « coupes » de FILM_REPERES) ou données à la main.

Usage : python verif_film.py <projet> [instants des coupes en secondes...]
"""
import json, pathlib, sys
import numpy as np
from PIL import Image

if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        raise SystemExit(__doc__)
    projet = pathlib.Path(args[0]).resolve()
    dossier = projet / "rendu" / "film-images"
    fs = sorted(dossier.glob("f*.png"))
    if len(fs) < 3:
        raise SystemExit(f"pas d'images dans {dossier} : lancer verif_film.py après le rendu complet et avant --nettoyer.")
    cfg = json.loads((projet / "vitrine.json").read_text(encoding="utf-8"))
    ips = cfg.get("film", {}).get("ips", 60)
    coupes = [float(x) for x in args[1:]]
    rep = projet / "rendu" / "reperes.json"
    if not coupes and rep.exists():
        coupes = [float(x) for x in (json.loads(rep.read_text(encoding="utf-8"))["reperes"] or {}).get("coupes", [])]
    v = [np.asarray(Image.open(f).convert("L").resize((96, 54), Image.BILINEAR), dtype=np.float32) for f in fs]
    ecarts = [float(np.abs(v[i] - v[i - 1]).mean()) for i in range(1, len(v))]
    med = float(np.median(ecarts))
    print(f"{len(fs)} images ; écart médian entre voisines {med:.2f} ; maximum {max(ecarts):.2f} ; coupes annoncées : {coupes or 'aucune'}")
    a_voir = 0
    rapides = 0
    for i, e in enumerate(ecarts, 1):
        if e > max(6, med * 8):
            t = i / ips
            # un saut ne dure qu'une image ; un mouvement de caméra rapide garde un écart voisin avant et après
            autour = [ecarts[j] for j in (i - 3, i + 1) if 0 <= j < len(ecarts)]
            if autour and e < 2.2 * max(autour):
                rapides += 1
                continue
            prevue = any(abs(t - c) < 2 / ips for c in coupes)
            a_voir += not prevue
            print(f"  saut à {t:.2f} s (image {i}) : {e:.1f}", "(coupe annoncée)" if prevue else "<-- à regarder : extraire les deux images voisines")
    if rapides:
        print(f"  {rapides} image(s) en mouvement de caméra rapide, sans saut")
    isolees = [i for i in range(1, len(v) - 1) if np.abs(v[i + 1] - v[i - 1]).mean() * 3 + 2 < min(ecarts[i - 1], ecarts[i])]
    print("images isolées fautives :", [round(i / ips, 2) for i in isolees] or "aucune")
    vides = [round(i / ips, 2) for i, x in enumerate(v) if x.std() < 4]
    print("images presque unies (s) :", vides[:20] or "aucune", "(normal sur un carton de titre encore noir)" if vides else "")
    print("verdict :", "rien d'anormal" if not a_voir and not isolees else f"{a_voir + len(isolees)} point(s) à regarder")
