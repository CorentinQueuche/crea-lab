"""Maillon : mixage de la bande-son du film à partir des sons générés avec Sunra
(ElevenLabs Music et ElevenLabs Sound Effects, prompts dans sons-sunra.json).

Chaque bruitage est posé à l'instant de l'événement correspondant dans film.js.
Usage : python mixage.py  ->  film/maillon-son.wav
"""
import pathlib
import numpy as np
from scipy import signal
from scipy.io import wavfile

ICI = pathlib.Path(__file__).resolve().parent
SR, DUREE = 48000, 22.8
N = int(DUREE * SR)
rng = np.random.default_rng(118)
mix = np.zeros((N, 2))


def charge(nom, seuil=.06, marge=.004):
    """Lit un son, le ramène à une crête de 1 et coupe le silence avant l'attaque."""
    sr, x = wavfile.read(ICI / "sons" / f"{nom}.wav")
    assert sr == SR
    x = x.astype(np.float64) / 32768
    x /= np.abs(x).max()
    m = np.abs(x).max(axis=1)
    debut = max(0, int(np.argmax(m > seuil)) - int(marge * SR))
    return x[debut:]


def pose(x, t, gain=1.0, pan=0.0, ton=0.0, fin=None, entree=.002):
    """Pose un son à t secondes. ton en demi-tons (rééchantillonnage), pan de -1 à 1."""
    if ton:
        x = signal.resample_poly(x, 1000, int(round(1000 * 2 ** (ton / 12))), axis=0)
    if fin:
        x = x[:int(fin * SR)].copy()
        nf = min(len(x), int(.06 * SR))
        x[-nf:] *= np.linspace(1, 0, nf)[:, None]
    x = x.copy()
    ne = min(len(x), int(entree * SR))
    x[:ne] *= np.linspace(0, 1, ne)[:, None]
    i = int(t * SR)
    if i < 0:
        x, i = x[-i:], 0
    n = min(len(x), N - i)
    if n <= 0:
        return
    g = np.array([min(1, 1 - pan), min(1, 1 + pan)])
    mix[i:i + n] += x[:n] * gain * g


S = {n: charge(n) for n in ["clic", "touche", "entree", "bulle", "souffle-entree", "souffle-coupe", "souffle-recul", "montee", "impact", "carillon", "trace", "crayon", "compteur", "logo"]}

# ---------- musique ----------
# La musique générée démarre à 1,03 s, pulse toutes les 0,5 s et s'éteint vers 19 s.
# Décalée de 1,53 s : elle entre pendant la plongée, ses temps tombent sur la coupe de 9,0 s,
# la validation de 12,55 s et le recul de 16,6 s, et elle s'éteint sur le carton de fin.
DECALAGE = 1.53
sr, mus = wavfile.read(ICI / "sons" / "musique.wav")
mus = mus.astype(np.float64) / 32768
i0 = int(DECALAGE * SR)
n = min(len(mus), N - i0)
mix[i0:i0 + n] += mus[:n] * .62

# ---------- bruitages, calés sur film.js ----------
# carton titre : les maillons se rejoignent, puis le nom
pose(S["souffle-entree"], .2, .22, entree=.05)
pose(S["logo"], 1.0, .4, entree=.004)
# plongée dans le canvas
pose(S["souffle-recul"], 1.85, .2, entree=.08, fin=1.3)
# blocs qui apparaissent
for t, ton, pan in [(2.5, 0, -.3), (5.12, 2, .1), (6.7, 4, .3), (7.05, 9, 0), (9.1, 0, -.2), (14.15, 2, .3), (14.45, 9, 0), (16.45, 4, .4), (17.3, 5, .5)]:
    pose(S["bulle"], t - .04, .09 if ton == 9 else .17, pan, ton)
# souris : appui, relâchement, clics
pose(S["clic"], 4.25, .2, -.2, -3); pose(S["clic"], 5.25, .17, .1, 2); pose(S["clic"], 5.95, .2, .1); pose(S["clic"], 15.3, .2, .3)
# liens qui se tracent
for t, ton, pan in [(4.3, 0, -.2), (6.0, 2, .2), (8.5, -2, -.1), (13.15, 0, .1), (15.7, 3, .3)]:
    pose(S["trace"], t, .15, pan, ton, entree=.03)
# changements de plan
pose(S["souffle-coupe"], 6.14, .26); pose(S["souffle-coupe"], 8.94, .26, ton=-2)
# le plan se dessine, puis ses trois lignes
pose(S["crayon"], 6.95, .2, .2, entree=.04)
for i in range(3):
    pose(S["clic"], 7.7 + .16 * i, .05, .3, 5 + i)
# validation : Ctrl K, palette, frappe, Entrée
pose(S["entree"], 10.5, .2, .1, -2); pose(S["touche"], 10.6, .2, .2)
pose(S["souffle-entree"], 10.7, .1, entree=.03, fin=.5, ton=5)
tf, s = 10.95, 7
for c in "Accorder 2 % de remise":                    # mêmes instants de frappe que film.js
    s = (s * 16807) % 2147483647
    tf += .03 + (s % 1000) / 1000 * .04 + (.04 if c == " " else 0)
    pose(S["touche"], tf, rng.uniform(.13, .19), rng.uniform(0, .4), -4 if c == " " else rng.uniform(-1.5, 1.5))
pose(S["entree"], 12.4, .34, .3)
pose(S["montee"], 12.5 - .82, .2, entree=.05)       # montée qui culmine à l'application
pose(S["impact"], 12.55 - .06, .55)
pose(S["carillon"], 12.62, .26, entree=.004)
# commandes fournisseurs
for i in range(3):
    pose(S["clic"], 14.4 + .14 * i, .05, .3, 4 + i)
pose(S["carillon"], 15.36, .15, .3, 3, fin=1.2)
# recul vers la vue d'ensemble, barres et compteurs
pose(S["souffle-recul"], 16.5, .3, entree=.05)
for i in range(3):
    pose(S["clic"], 16.95 + .16 * i, .045, .4, 3 + i)
pose(S["compteur"], 17.85, .15, .4, entree=.03)
# carton de fin
pose(S["souffle-recul"], 20.12, .24, entree=.05, ton=-2)
pose(S["logo"], 20.85, .42, entree=.004)

# ---------- sortie ----------
sos = signal.butter(2, 28 / (SR / 2), "high", output="sos")
mix = signal.sosfilt(sos, mix, axis=0)
nf = int(1.0 * SR)
mix[-nf:] *= (np.cos(np.linspace(0, np.pi / 2, nf)) ** 2)[:, None]
mix = np.tanh(mix * 1.25) / 1.25                     # écrêtage doux
mix *= 10 ** (-1.5 / 20) / np.abs(mix).max()
wavfile.write(ICI / "maillon-son.wav", SR, (mix * 32767).astype(np.int16))
print("crête", round(20 * np.log10(np.abs(mix).max()), 2), "dB")
