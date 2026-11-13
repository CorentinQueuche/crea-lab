"""Trouve les quatre coins d'un écran clair dans une photo de mockup : zone claire la plus grande, trous bouchés,
puis une droite ajustée sur chacun des quatre bords et leurs intersections.   python _prep/coins.py photo.png [seuil] [bas_coupe]"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
im = Image.open(sys.argv[1]).convert('RGB'); a = np.asarray(im).astype(int); seuil = int(sys.argv[2]) if len(sys.argv) > 2 else 240
lum = a.sum(axis=2) / 3; sat = a.max(axis=2) - a.min(axis=2)
m = ndi.binary_closing((lum > seuil) & (sat < 24), iterations=6)
lab, n = ndi.label(m); k = int(np.argmax(ndi.sum(m, lab, range(1, n + 1)))) + 1
reg = ndi.binary_fill_holes(lab == k); ys, xs = np.nonzero(reg)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
def droite(pts):   # ajuste a*x + b*y = c sur des points
    p = np.array(pts, dtype=float); c = p.mean(axis=0); u, s, vt = np.linalg.svd(p - c); d = vt[0]; nrm = np.array([-d[1], d[0]]); return nrm[0], nrm[1], nrm @ c
def inter(l1, l2):
    A = np.array([[l1[0], l1[1]], [l2[0], l2[1]]]); return np.linalg.solve(A, np.array([l1[2], l2[2]]))
W = x1 - x0; Hh = y1 - y0
haut = [(x, np.nonzero(reg[:, x])[0].min()) for x in range(int(x0 + W * .2), int(x0 + W * .8), 4) if reg[:, x].any()]
bas = [(x, np.nonzero(reg[:, x])[0].max()) for x in range(int(x0 + W * .2), int(x0 + W * .8), 4) if reg[:, x].any()]
gauche = [(np.nonzero(reg[y, :])[0].min(), y) for y in range(int(y0 + Hh * .25), int(y0 + Hh * .75), 4) if reg[y, :].any()]
droit = [(np.nonzero(reg[y, :])[0].max(), y) for y in range(int(y0 + Hh * .25), int(y0 + Hh * .75), 4) if reg[y, :].any()]
lh, lb, lg, ld = droite(haut), droite(bas), droite(gauche), droite(droit)
c = [inter(lh, lg), inter(lh, ld), inter(lb, ld), inter(lb, lg)]
print('bbox', x0, y0, x1, y1)
print('coins HG HD BD BG :', ' '.join(f'{p[0]:.1f},{p[1]:.1f}' for p in c))
