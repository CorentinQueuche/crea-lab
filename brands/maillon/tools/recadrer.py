"""Recadre une image à 100 % pour contrôler la netteté d'un texte, ou tire une image d'une vidéo.

Usage :
  python recadrer.py <image> [x y [largeur hauteur]]      zone de 1600 x 1000 par défaut, centrée sans x y
  python recadrer.py <video.mp4> --t 12.6 [x y [l h]]     image de la vidéo à 12,6 s, entière sans x y
Le résultat est écrit à côté de la source, dans un dossier ctrl/, en JPEG : l'ouvrir pour le regarder.
"""
import pathlib, subprocess, sys
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        raise SystemExit(__doc__)
    src = pathlib.Path(args[0]).resolve()
    t = args[args.index("--t") + 1] if "--t" in args else None
    nums = [int(a) for a in args[1:] if a.lstrip("-").isdigit()]
    ctrl = src.parent / "ctrl"
    ctrl.mkdir(exist_ok=True)
    if t is not None:
        tmp = ctrl / f"{src.stem}-{float(t):.2f}s.png"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", str(src), "-frames:v", "1", str(tmp)], check=True)
        im = Image.open(tmp).convert("RGB")
        nom = tmp.stem
    else:
        im = Image.open(src).convert("RGB")
        nom = src.stem
    if t is not None and not nums:
        zone = (0, 0, *im.size)
    else:
        l, h = (nums[2], nums[3]) if len(nums) >= 4 else (min(1600, im.size[0]), min(1000, im.size[1]))
        x, y = (nums[0], nums[1]) if len(nums) >= 2 else ((im.size[0] - l) // 2, (im.size[1] - h) // 2)
        zone = (x, y, min(im.size[0], x + l), min(im.size[1], y + h))
    sortie = ctrl / f"{nom}-{zone[0]}-{zone[1]}.jpg"
    im.crop(zone).save(sortie, quality=92)
    if t is not None:
        tmp.unlink()
    print(sortie, im.crop(zone).size)
