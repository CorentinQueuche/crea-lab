# Planche 24 — caisson lumineux blanc, debout, avec son câble orange.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

reset(2800, 1892, samples=360)
W, H, D = 1.0, 2.0, 0.3
blanc = mat_emit('blanc', (1, 0.985, 0.97, 1), 0.82)
box('caisson', W, D, H, (0, 0, H / 2 + 0.004), mat=blanc, bevel=0.012)
screen_v('face', W - 0.004, H - 0.004, (0, -D / 2 - 0.0015, H / 2 + 0.004), mat_screen('face', os.path.join(ART, 'lightbox.png'), 0.96, gloss=0.0))
cable = mat_pbr('cable', '#FF632B', rough=0.45, emit='#FF632B', emit_strength=1.6)
tube('cable', [(0.42, 0.16, 0.012), (0.9, 0.3, 0.012), (1.6, -0.25, 0.012), (2.6, -0.75, 0.012), (3.8, -0.55, 0.012), (5.5, -0.9, 0.012), (9, -0.6, 0.012)], 0.012, cable)

plane('sol', 90, 90, (0, 0, 0), mat=mat_floor(color='#0b0b0d', rough=0.24, var=0.1, bump=0.015, scale=2.0))
plane('fond', 90, 30, (0, 9, 15), (math.radians(90), 0, 0), mat=mat_pbr('fond', '#0e0e11', rough=0.9))
area('haut', (-4, -3, 6), (0, 2, 0), 520, size=7, color=hex_rgb('#c8cfe0'))
camera((-3.7, -6.6, 1.05), (0.28, 0, 1.0), lens=60)
render('24-caisson.png')
