"""Maillon : caméra 3D, profondeur de champ, halo, vignette et grain sur les images capturées.

Usage : python post.py [--apercu] [--src src] [--sortie images]
"""
import json, math, sys, pathlib
from multiprocessing import Pool
import numpy as np
from PIL import Image, ImageFilter

ICI = pathlib.Path(__file__).resolve().parent
MONDE = (2000, 1300)
FOND = (3, 3, 4)
_cache = {}


def rot(tilt, yaw, roll):
    a, b, c = (math.radians(v) for v in (tilt, yaw, roll))
    rx = np.array([[1, 0, 0], [0, math.cos(a), -math.sin(a)], [0, math.sin(a), math.cos(a)]])
    ry = np.array([[math.cos(b), 0, math.sin(b)], [0, 1, 0], [-math.sin(b), 0, math.cos(b)]])
    rz = np.array([[math.cos(c), -math.sin(c), 0], [math.sin(c), math.cos(c), 0], [0, 0, 1]])
    return rz @ rx @ ry


def flou(arr, r):
    if r <= 0:
        return arr
    im = Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), dtype=np.float32) / 255


def grilles(W, H):
    if (W, H) not in _cache:
        uu, vv = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
        gx, gy = uu / W, vv / H
        amb = np.exp(-(((gx - .12) ** 2) / .12 + ((gy - .05) ** 2) / .10))[..., None] * np.array([.10, .05, .012], dtype=np.float32)
        amb += np.exp(-(((gx - .95) ** 2) / .10 + ((gy - 1.0) ** 2) / .10))[..., None] * np.array([.02, .022, .07], dtype=np.float32)
        d2 = ((gx - .5) / .8) ** 2 + ((gy - .5) / .8) ** 2
        vig = (1 - .36 * np.clip(d2, 0, 1) ** 1.5)[..., None].astype(np.float32)
        _cache[(W, H)] = (uu, vv, amb.astype(np.float32), vig)
    return _cache[(W, H)]


def image(tache):
    src_dir, out_dir, W, H, m = tache
    cam, z = m["cam"], m["zone"]
    k = W / 1600
    zoom = cam["zoom"] * k
    f = cam["focale"] * W
    D = f / zoom
    R = rot(cam["tilt"], cam["yaw"], cam["roll"])
    tx, ty = cam["cible"]
    cx, cy = W / 2, H / 2
    r1, r2 = R[:, 0], R[:, 1]
    o = -(r1 * tx + r2 * ty)
    M = np.array([
        [f * r1[0] + cx * r1[2], f * r2[0] + cx * r2[2], f * o[0] + cx * (D + o[2])],
        [f * r1[1] + cy * r1[2], f * r2[1] + cy * r2[2], f * o[1] + cy * (D + o[2])],
        [r1[2], r2[2], D + o[2]],
    ])
    src = Image.open(pathlib.Path(src_dir) / m["fichier"]).convert("RGB")
    sx, sy = src.size[0] / z["w"], src.size[1] / z["h"]
    # réduire la source si elle est bien plus fine que la sortie (aperçus)
    besoin = max(zoom * 1.3, .5)
    if besoin < sx * .8:
        src = src.resize((max(2, round(z["w"] * besoin)), max(2, round(z["h"] * besoin))), Image.LANCZOS)
        sx, sy = src.size[0] / z["w"], src.size[1] / z["h"]
    T = np.array([[1 / sx, 0, z["x"]], [0, 1 / sy, z["y"]], [0, 0, 1]])
    inv = np.linalg.inv(M @ T)
    inv = inv / inv[2, 2]
    coeffs = (inv[0, 0], inv[0, 1], inv[0, 2], inv[1, 0], inv[1, 1], inv[1, 2], inv[2, 0], inv[2, 1])
    im = src.transform((W, H), Image.PERSPECTIVE, coeffs, Image.BICUBIC, fillcolor=FOND)
    img = np.asarray(im, dtype=np.float32) / 255

    uu, vv, amb, vig = grilles(W, H)
    if cam["flou"] > .01 and (abs(cam["tilt"]) + abs(cam["yaw"])) > .5:
        iM = np.linalg.inv(M)
        den = iM[2, 0] * uu + iM[2, 1] * vv + iM[2, 2]
        wx = (iM[0, 0] * uu + iM[0, 1] * vv + iM[0, 2]) / den
        wy = (iM[1, 0] * uu + iM[1, 1] * vv + iM[1, 2]) / den
        zz = r1[2] * (wx - tx) + r2[2] * (wy - ty)
        zz = np.where(den > 0, zz, 1e4)
        bande = 60 / cam["zoom"]
        coc = np.maximum(np.abs(zz) - bande, 0) * .042 * cam["zoom"] * cam["flou"] * k
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
                msk = (coc > lo) & (coc <= r)
                w[msk] = (coc[msk] - lo) / (r - lo)
            if hi is not None:
                msk = (coc >= r) & (coc < hi)
                w[msk] = (hi - coc[msk]) / (hi - r)
            else:
                w[coc >= r] = 1
            if i == 0:
                w[coc <= 0] = 1
            out += flou(img, r) * w[..., None]
        img = out

    lum = img.max(axis=2, keepdims=True)
    vif = img * np.clip((lum - .6) / .4, 0, 1) ** 1.6
    # halo calculé à demi-résolution : plus rapide, même rendu
    pet = Image.fromarray(np.clip(vif * 255, 0, 255).astype(np.uint8)).resize((W // 2, H // 2), Image.BILINEAR)
    h1 = np.asarray(pet.filter(ImageFilter.GaussianBlur(6 * k)).resize((W, H), Image.BILINEAR), dtype=np.float32) / 255
    h2 = np.asarray(pet.filter(ImageFilter.GaussianBlur(30 * k)).resize((W, H), Image.BILINEAR), dtype=np.float32) / 255
    img = img + h1 * .3 + h2 * .32
    img = img + amb * (0.55 + 0.45 * (1 - np.clip(lum * 3, 0, 1)))
    img = img * vig
    rng = np.random.default_rng(1000 + m["i"])
    img = img + rng.normal(0, 2.0 / 255, (H, W, 1)).astype(np.float32)
    res = Image.fromarray(np.clip(img * 255 + .5, 0, 255).astype(np.uint8))
    res.save(pathlib.Path(out_dir) / m["fichier"], compress_level=1)
    return m["i"]


if __name__ == "__main__":
    args = sys.argv[1:]
    val = lambda n, d: args[args.index("--" + n) + 1] if "--" + n in args else d
    src = ICI / val("src", "src")
    out = ICI / val("sortie", "images")
    out.mkdir(exist_ok=True)
    meta = json.loads((src / "meta.json").read_text(encoding="utf-8"))
    apercu = "--apercu" in args
    W, H = (640, 360) if apercu else (meta["W"], meta["H"])
    taches = [(str(src), str(out), W, H, m) for m in meta["images"]]
    with Pool(12) as pool:
        for n, _ in enumerate(pool.imap_unordered(image, taches, chunksize=4), 1):
            if n % 120 == 0:
                print(n, "/", len(taches), flush=True)
    print("images :", len(taches), (W, H))
    if apercu:
        fs = sorted(out.glob("f*.png"))
        cols = 6
        rows = math.ceil(len(fs) / cols)
        sheet = Image.new("RGB", (cols * 400, rows * 225), (0, 0, 0))
        for i, fch in enumerate(fs):
            sheet.paste(Image.open(fch).resize((400, 225), Image.LANCZOS), ((i % cols) * 400, (i // cols) * 225))
        sheet.save(out / "_planche.jpg", quality=88)
