# Incruste une vidéo d'écran dans un décor 3D fixe (salle, affiche de rue…), avec un halo lumineux recalculé à chaque image.
# Le décor est rendu par Blender avec une caméra droite (cam.data.shift_x / shift_y au lieu d'une inclinaison), de sorte que
# l'écran soit un rectangle aligné ; la scène écrit ses quatre coins dans un JSON avec lib.cam_rect().
# Usage : python tools/incruster.py <decor.png> <ecran.mp4> <rect.json> <sortie.mp4> [--gamma 1.0] [--halo 0.55] [--seuil 0.55] [--flou 34]
import sys
try: sys.stdout.reconfigure(encoding='utf-8'); sys.stderr.reconfigure(encoding='utf-8')
except Exception: pass
import json, subprocess, sys
a = sys.argv[1:]
decor, ecran, rect, sortie = a[:4]
opt = lambda k, d: float(a[a.index('--' + k) + 1]) if ('--' + k) in a else d
gamma, halo, seuil, flou = opt('gamma', 1.0), opt('halo', 0.55), opt('seuil', 0.55), opt('flou', 34)
with open(rect, encoding='utf-8') as f: pts = json.load(f)['ecran']
xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
if max(abs(pts[0][1] - pts[1][1]), abs(pts[2][1] - pts[3][1])) > 1.5:
    print('ATTENTION : l\'écran n\'est pas un rectangle aligné (caméra inclinée). Redresser la caméra avec shift_x / shift_y.')
x0, y0 = int(min(xs)) - 1, int(min(ys)) - 1
w, h = int(max(xs) - min(xs)) + 3, int(max(ys) - min(ys)) + 3
w += w % 2; h += h % 2
fc = (f"[0]eq=gamma={gamma}[p];[1]scale={w}:{h}:flags=lanczos[s];[p][s]overlay={x0}:{y0}:shortest=1,format=gbrp[c];"
      f"[c]split[a][b];[b]curves=all='0/0 {seuil}/0 1/1',gblur=sigma={flou}[bl];[a][bl]blend=all_mode=screen:all_opacity={halo},format=yuv420p")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-framerate', '30', '-i', decor, '-i', ecran, '-filter_complex', fc,
                '-c:v', 'libx264', '-crf', '17', '-preset', 'slow', '-movflags', '+faststart', sortie], check=True)
print(sortie, f'écran {w}x{h} en ({x0},{y0})')
