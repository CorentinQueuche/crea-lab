"""Rhabille une photo de mockup existante : remplace le contenu d'un écran par un nouveau rendu, en perspective.

    python tools/rehabiller.py <photo> <ecran.png> <sortie> --quad x,y x,y x,y x,y   (haut gauche, haut droit, bas droit, bas gauche)
        [--masque poly|clair|aucun]   aucun : recoloriage seul ; poly : le quadrilatère lui-même ; clair : la zone claire de la photo d'origine (garde les coins
                                arrondis et ce qui passe devant l'écran : îlot, doigt, bord)
        [--seuil 240]           seuil de la zone claire          [--ilot]  garde sombre la plus grosse tache sombre du haut de l'écran
        [--ombre 0.6]           part de la lumière d'origine reportée sur le nouvel écran (0 : aucune)
        [--teinte de:vers:tol]  recolore le décor : teinte d'origine (degrés), teinte voulue, tolérance ; répétable
        [--sat 1.0] [--val 1.0] saturation et valeur du décor recoloré
        [--fond R,G,B]          teinte le fond clair et neutre (papier) : couleur voulue pour le blanc du fond

Le nouvel écran est déformé par homographie (quatre coins), mis sous la lumière de la photo d'origine, puis fondu dans le masque.
Le recoloriage ne touche que les pixels saturés dans la plage de teinte donnée : l'appareil (gris) reste tel quel.
"""
import argparse
import colorsys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

p = argparse.ArgumentParser()
p.add_argument('photo'); p.add_argument('ecran'); p.add_argument('sortie')
p.add_argument('--quad', nargs=4, required=True)
p.add_argument('--masque', default='poly'); p.add_argument('--seuil', type=int, default=240); p.add_argument('--ilot', action='store_true')
p.add_argument('--ombre', type=float, default=0.6)
p.add_argument('--teinte', action='append', default=[]); p.add_argument('--sat', type=float, default=1.0); p.add_argument('--val', type=float, default=1.0)
p.add_argument('--fond', default=None)
a = p.parse_args()

photo = Image.open(a.photo).convert('RGB'); W, H = photo.size
ecran = Image.open(a.ecran).convert('RGB'); w, h = ecran.size
quad = [tuple(float(v) for v in q.split(',')) for q in a.quad]
orig = np.asarray(photo).astype(np.float32)


def coeffs(dst, src):
    """Coefficients de Image.transform(PERSPECTIVE) : pour chaque point de sortie (dst), le point d'entrée (src)."""
    m = []
    for (x, y), (u, v) in zip(dst, src):
        m.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); m.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    A = np.array(m, dtype=np.float64); B = np.array([c for uv in src for c in uv], dtype=np.float64)
    return np.linalg.solve(A, B).tolist()


# 1. Le décor : recoloriage par plage de teinte, puis fond clair teinté
hsv = np.asarray(photo.convert('HSV')).astype(np.float32)
hh, ss, vv = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255
for regle in a.teinte:
    de, vers, tol = (float(x) for x in regle.split(':'))
    ecart = np.abs(((hh - de + 180) % 360) - 180)
    poids = np.clip(1 - (ecart - tol * 0.6) / (tol * 0.4), 0, 1) * np.clip((ss - 0.10) / 0.12, 0, 1)
    hh = (hh + poids * (((vers - de + 180) % 360) - 180)) % 360
    ss = np.clip(ss * (1 + poids * (a.sat - 1)), 0, 1); vv = np.clip(vv * (1 + poids * (a.val - 1)), 0, 1)
decor = np.asarray(Image.fromarray(np.dstack([hh * 255 / 360, ss * 255, vv * 255]).astype(np.uint8), 'HSV').convert('RGB')).astype(np.float32)
if a.fond:
    cible = np.array([float(x) for x in a.fond.split(',')], dtype=np.float32)
    lum = orig.mean(axis=2); sat = orig.max(axis=2) - orig.min(axis=2)
    poids = (np.clip((lum - 150) / 60, 0, 1) * np.clip(1 - (sat - 10) / 14, 0, 1))[..., None]
    blanc = np.percentile(lum[(lum > 150) & (sat < 14)], 80) if ((lum > 150) & (sat < 14)).any() else 235
    decor = decor * (1 - poids) + (decor * (cible / blanc)) * poids
    decor = np.clip(decor, 0, 255)

# 2. Le masque de l'écran
poly = Image.new('L', (W, H), 0); ImageDraw.Draw(poly).polygon(quad, fill=255)
if a.masque == 'clair':
    lum = orig.mean(axis=2); sat = orig.max(axis=2) - orig.min(axis=2)
    large = np.asarray(poly.filter(ImageFilter.MaxFilter(31))) > 0
    m = (lum > a.seuil) & (sat < 26) & large
    m = ndi.binary_closing(m, iterations=5)
    lab, n = ndi.label(m)
    if n:
        k = int(np.argmax(ndi.sum(m, lab, range(1, n + 1)))) + 1; m = lab == k
    plein = ndi.binary_fill_holes(m)
    if a.ilot:   # la plus grosse tache sombre dans le tiers haut de la zone : l'îlot de la caméra
        trous = plein & ~m; lab2, n2 = ndi.label(trous); ys = np.nonzero(plein)[0]; haut = ys.min() + (ys.max() - ys.min()) * 0.2
        if n2:
            tailles = ndi.sum(trous, lab2, range(1, n2 + 1)); centres = ndi.center_of_mass(trous, lab2, range(1, n2 + 1))
            cand = [(t, i + 1) for i, (t, c) in enumerate(zip(tailles, centres)) if c[0] < haut]
            if cand:
                plein &= ~ndi.binary_erosion(lab2 == max(cand)[1], iterations=3)   # un peu rentré : le nouvel écran vient jusqu'au bord de l'îlot
    masque = Image.fromarray((plein * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
else:
    masque = poly.filter(ImageFilter.GaussianBlur(1.0))

# 3. Le nouvel écran, en perspective, sous la lumière de la photo
neuf = ecran.transform((W, H), Image.PERSPECTIVE, coeffs(quad, [(0, 0), (w, 0), (w, h), (0, h)]), Image.BICUBIC)
neuf = np.asarray(neuf).astype(np.float32)
if a.ombre > 0:
    g = np.asarray(Image.fromarray(orig.mean(axis=2).astype(np.uint8)).filter(ImageFilter.GaussianBlur(70))).astype(np.float32)
    mk = np.asarray(masque) > 128
    ref = np.percentile(g[mk], 92) if mk.any() else 255.0
    lumiere = np.clip(g / ref, 0.6, 1.06)[..., None]
    neuf = neuf * (1 - a.ombre + a.ombre * lumiere)
k = (np.asarray(masque).astype(np.float32) / 255)[..., None]
if a.masque == 'aucun':   # recoloriage seul : aucun écran à remplacer
    k = k * 0
out = np.clip(decor * (1 - k) + neuf * k, 0, 255).astype(np.uint8)
Image.fromarray(out).save(a.sortie, quality=93)
print(a.sortie, f'{W}x{H}')
