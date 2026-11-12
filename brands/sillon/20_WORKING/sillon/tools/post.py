# Finition d'un rendu : halo lumineux (bloom), vignette, grain.
# python tools/post.py entree.png sortie.png [--bloom 0.6] [--seuil 0.55] [--vignette 0.25] [--grain 0.018] [--w 2800]
import sys
try: sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
except Exception: pass
import sys
import numpy as np
from PIL import Image, ImageFilter

a = sys.argv[1:]
src, dst = a[0], a[1]
def opt(k, d):
    return float(a[a.index('--' + k) + 1]) if ('--' + k) in a else d
bloom, seuil, vig, grain, W = opt('bloom', 0.6), opt('seuil', 0.55), opt('vignette', 0.25), opt('grain', 0.018), int(opt('w', 0))

im = Image.open(src).convert('RGB')
if W and im.width != W:
    im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
x = np.asarray(im).astype(np.float32) / 255.0
if bloom > 0:
    lum = x.max(axis=2, keepdims=True)
    hi = x * np.clip((lum - seuil) / (1 - seuil), 0, 1)
    hi_im = Image.fromarray((hi * 255).astype(np.uint8))
    acc = np.zeros_like(x)
    for r, wgt in ((im.width / 220, 0.5), (im.width / 70, 0.35), (im.width / 22, 0.3), (im.width / 9, 0.22)):
        small = hi_im.resize((max(1, im.width // 4), max(1, im.height // 4)), Image.BILINEAR).filter(ImageFilter.GaussianBlur(r / 4))
        acc += np.asarray(small.resize(im.size, Image.BILINEAR)).astype(np.float32) / 255.0 * wgt
    x = 1 - (1 - x) * (1 - np.clip(acc * bloom, 0, 1))
if vig > 0:
    h, w = x.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / np.sqrt(2)
    x *= (1 - vig * np.clip(d, 0, 1) ** 2.2)[..., None]
if grain > 0:
    rng = np.random.default_rng(7)
    x += rng.normal(0, grain, x.shape[:2])[..., None].astype(np.float32)
Image.fromarray((np.clip(x, 0, 1) * 255 + 0.5).astype(np.uint8)).save(dst)
print(dst, im.size)
