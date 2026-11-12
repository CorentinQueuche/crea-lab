"""Caméra 3D appliquée à une capture à plat d'interface : perspective, profondeur de champ,
halo des zones lumineuses, lueurs d'ambiance, vignette et grain.

Partagé par mockups.py (images fixes) et film.py (film image par image).

Une caméra est un dictionnaire :
  cible   [x, y]  point de l'interface (px CSS) placé au centre de l'image, et plan de mise au point
  largeur         largeur d'interface visible au niveau de la cible, en px CSS (petit = gros plan)
  tilt            bascule vers l'arrière, en degrés (0 = de face)
  yaw             rotation gauche/droite, en degrés
  roll            inclinaison de l'horizon, en degrés
  flou            force de la profondeur de champ (0 = tout net, 1 = marqué)
  focale          optionnel, en largeurs d'image (2.1 par défaut ; plus grand = perspective plus plate)
"""
import math
import numpy as np
from PIL import Image, ImageFilter

Image.MAX_IMAGE_PIXELS = None

AMBIANCE = {
    "fond": [3, 3, 4],       # couleur hors de l'interface
    "lueurs": [],            # [{"x": .12, "y": .05, "rx": .12, "ry": .10, "rvb": [.10, .05, .012]}]
    "vignette": .38,
    "grain": 2.4,            # écart-type en niveaux sur 255
    "halo": .3,              # force du halo des zones claires
    "seuil_halo": .6,
}
# Une interface claire : le halo ne doit prendre que les vrais éclats, sinon tout le papier brûle.
AMBIANCE_CLAIRE = dict(AMBIANCE, fond=[14, 16, 18], halo=.12, seuil_halo=.93, vignette=.3, grain=2.0)
_cache = {}


def ambiance_de(cfg):
    """Ambiance d'un projet : défauts selon "theme" ("sombre" ou "clair"), puis clés de "ambiance"."""
    base = AMBIANCE_CLAIRE if cfg.get("theme") == "clair" else AMBIANCE
    return dict(base, **cfg.get("ambiance", {}))


def rot(tilt, yaw, roll):
    a, b, c = (math.radians(v) for v in (tilt, yaw, roll))
    rx = np.array([[1, 0, 0], [0, math.cos(a), -math.sin(a)], [0, math.sin(a), math.cos(a)]])
    ry = np.array([[math.cos(b), 0, math.sin(b)], [0, 1, 0], [-math.sin(b), 0, math.cos(b)]])
    rz = np.array([[math.cos(c), -math.sin(c), 0], [math.sin(c), math.cos(c), 0], [0, 0, 1]])
    return rz @ rx @ ry


def zoom_px(cam, W):
    """Pixels de sortie par px CSS au niveau de la cible."""
    if "largeur" in cam:
        return W / cam["largeur"]
    return cam["zoom"] * W / 1600          # ancienne convention


def matrice(cam, W, H):
    """Matrice 3x3 interface (x, y, 1) -> écran homogène, et vecteurs utiles à la profondeur."""
    z = zoom_px(cam, W)
    f = cam.get("focale", 2.1) * W
    D = f / z
    R = rot(cam.get("tilt", 0), cam.get("yaw", 0), cam.get("roll", 0))
    tx, ty = cam["cible"]
    cx, cy = W / 2, H / 2
    r1, r2 = R[:, 0], R[:, 1]
    o = -(r1 * tx + r2 * ty)
    M = np.array([
        [f * r1[0] + cx * r1[2], f * r2[0] + cx * r2[2], f * o[0] + cx * (D + o[2])],
        [f * r1[1] + cy * r1[2], f * r2[1] + cy * r2[2], f * o[1] + cy * (D + o[2])],
        [r1[2], r2[2], D + o[2]],
    ])
    return M, r1, r2


def _flou(arr, r):
    if r <= 0:
        return arr
    im = Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), dtype=np.float32) / 255


def _grilles(W, H, amb):
    cle = (W, H, repr(amb["lueurs"]), amb["vignette"])
    if cle not in _cache:
        uu, vv = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
        gx, gy = uu / W, vv / H
        lue = np.zeros((H, W, 3), dtype=np.float32)
        for l in amb["lueurs"]:
            lue += np.exp(-(((gx - l["x"]) ** 2) / l["rx"] + ((gy - l["y"]) ** 2) / l["ry"]))[..., None] * np.array(l["rvb"], dtype=np.float32)
        d2 = ((gx - .5) / .78) ** 2 + ((gy - .5) / .78) ** 2
        vig = (1 - amb["vignette"] * np.clip(d2, 0, 1) ** 1.5)[..., None].astype(np.float32)
        _cache.clear()
        _cache[cle] = (uu, vv, lue, vig)
    return _cache[cle]


def rendre(src, cam, W, H, zone, ambiance=None, graine=0):
    """src : image PIL de la zone capturée. zone : {"x","y","w","h"} en px CSS. Renvoie une image PIL W x H."""
    amb = dict(AMBIANCE, **(ambiance or {}))
    M, r1, r2 = matrice(cam, W, H)
    tx, ty = cam["cible"]
    z = zoom_px(cam, W)
    src = src.convert("RGB")
    sx = src.size[0] / zone["w"]
    # une source bien plus fine que la sortie crénelle : la réduire au juste besoin
    besoin = max(z * 1.3, .5)
    if besoin < sx * .8:
        src = src.resize((max(2, round(zone["w"] * besoin)), max(2, round(zone["h"] * besoin))), Image.LANCZOS)
    sx, sy = src.size[0] / zone["w"], src.size[1] / zone["h"]
    T = np.array([[1 / sx, 0, zone["x"]], [0, 1 / sy, zone["y"]], [0, 0, 1]])
    inv = np.linalg.inv(M @ T)
    inv = inv / inv[2, 2]
    coeffs = (inv[0, 0], inv[0, 1], inv[0, 2], inv[1, 0], inv[1, 1], inv[1, 2], inv[2, 0], inv[2, 1])
    im = src.transform((W, H), Image.PERSPECTIVE, coeffs, Image.BICUBIC, fillcolor=tuple(amb["fond"]))
    img = np.asarray(im, dtype=np.float32) / 255
    uu, vv, lue, vig = _grilles(W, H, amb)
    k = W / 1600
    z16 = z / k                                            # zoom ramené à une image de 1600 de large

    force = cam.get("flou", 0)
    if force > .01 and abs(cam.get("tilt", 0)) + abs(cam.get("yaw", 0)) > .5:
        iM = np.linalg.inv(M)
        den = iM[2, 0] * uu + iM[2, 1] * vv + iM[2, 2]
        wx = (iM[0, 0] * uu + iM[0, 1] * vv + iM[0, 2]) / den
        wy = (iM[1, 0] * uu + iM[1, 1] * vv + iM[1, 2]) / den
        prof = r1[2] * (wx - tx) + r2[2] * (wy - ty)      # 0 sur le plan de mise au point
        prof = np.where(den > 0, prof, 1e4)
        bande = 60 / z16                                   # demi-épaisseur de la zone nette
        coc = np.maximum(np.abs(prof - cam.get("dz", 0)) - bande, 0) * .042 * z16 * force * k
        coc = np.minimum(coc, 30 * k)
        rayons = [0, 1.2 * k, 2.6 * k, 5 * k, 9 * k, 15 * k, 22 * k, 30 * k]
        cmax = float(coc.max())
        out = np.zeros_like(img)
        for i, r in enumerate(rayons):
            lo = rayons[i - 1] if i else None
            hi = rayons[i + 1] if i + 1 < len(rayons) else None
            if lo is not None and cmax <= lo:
                break
            w = np.zeros_like(coc)
            if lo is not None:
                m = (coc > lo) & (coc <= r)
                w[m] = (coc[m] - lo) / (r - lo)
            if hi is not None:
                m = (coc >= r) & (coc < hi)
                w[m] = (hi - coc[m]) / (hi - r)
            else:
                w[coc >= r] = 1
            if i == 0:
                w[coc <= 0] = 1
            out += _flou(img, r) * w[..., None]
        img = out

    lum = img.max(axis=2, keepdims=True)
    if amb["halo"] > 0:
        s = amb["seuil_halo"]
        vif = img * np.clip((lum - s) / (1 - s), 0, 1) ** 1.6
        pet = Image.fromarray(np.clip(vif * 255, 0, 255).astype(np.uint8)).resize((W // 2, H // 2), Image.BILINEAR)
        h1 = np.asarray(pet.filter(ImageFilter.GaussianBlur(6 * k)).resize((W, H), Image.BILINEAR), dtype=np.float32) / 255
        h2 = np.asarray(pet.filter(ImageFilter.GaussianBlur(30 * k)).resize((W, H), Image.BILINEAR), dtype=np.float32) / 255
        img = img + (h1 + h2 * 1.07) * amb["halo"]
    img = img + lue * (0.55 + 0.45 * (1 - np.clip(lum * 3, 0, 1)))
    img = img * vig
    if amb["grain"] > 0:
        rng = np.random.default_rng(graine)
        img = img + rng.normal(0, amb["grain"] / 255, (H, W, 1)).astype(np.float32)
    return Image.fromarray(np.clip(img * 255 + .5, 0, 255).astype(np.uint8))


def chrome():
    """Chemin de Chrome ou Chromium : variable CHROME, puis emplacements habituels."""
    import os, shutil
    cands = [os.environ.get("CHROME"),
             r"C:\Program Files\Google\Chrome\Application\chrome.exe",
             r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
             "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
             shutil.which("google-chrome"), shutil.which("chromium"), shutil.which("chromium-browser"), shutil.which("chrome")]
    for c in cands:
        if c and os.path.exists(c):
            return c
    raise SystemExit("Chrome introuvable : définir la variable d'environnement CHROME.")
