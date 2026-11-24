#!/usr/bin/env python3
"""Video 01 · v2 — línea de tiempo maestra + audio energético sincronizado.

Lee lo que se renderizó de verdad (layers/remotion/public/layers/v01v2/):
  M1|M2|M3.events.json (Manim) · MC.webm (Motion Canvas)
y el guion cinético compartido layers/remotion/src/v01v2/cues.json.
Escribe timeline.json (para Remotion) y audio.wav.

Todo va sobre una rejilla de 100 BPM: medio pulso B = 0,3 s = 9 frames.
Las transiciones se solapan un múltiplo de 9 frames, así cada segmento
empieza "en tiempo" y los golpes visuales caen sobre la música.
"""
from __future__ import annotations

import json
import math
import subprocess
import wave
from pathlib import Path

import numpy as np
from scipy import signal

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "layers/remotion/public/layers/v01v2"
CUES = ROOT / "layers/remotion/src/v01v2/cues.json"
FPS, SR = 30, 48000
BF = 9                      # frames por medio pulso
BEAT = 0.6                  # s por pulso (100 BPM)
ORDER = ["M1", "M2", "MC", "M3"]
TRANS = {"M1": ("dive", 18), "M2": ("whip", 9), "MC": ("inkblot", 18)}

# Golpes del resumen de Motion Canvas (resumen_v2.tsx), en s desde su inicio.
MC_POPS = [0.3, 0.9, 1.5, 2.4, 3.3]
MC_PENCIL = [(2.1, 0.3), (3.0, 0.3), (4.4, 0.6)]
MC_WRITE = [(5.0, 0.6)]
MC_BLIPS = [5.4, 5.7, 6.0, 6.6, 6.9, 7.2]

rng = np.random.default_rng(7)


# ======================================================================
# Línea de tiempo
# ======================================================================
def probe_frames(path: Path) -> int:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-count_packets", "-select_streams", "v:0",
         "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True).stdout.strip()
    return int(out)


def build_timeline():
    ev = {k: json.loads((OUT / f"{k}.events.json").read_text()) for k in ("M1", "M2", "M3")}
    mc = probe_frames(OUT / "MC.webm")
    durs = {"M1": ev["M1"]["frames"], "M2": ev["M2"]["frames"],
            "MC": (mc // BF) * BF, "M3": ev["M3"]["frames"]}
    segs, f = [], 0
    for sid in ORDER:
        seg = {"id": sid, "src": f"layers/v01v2/{sid}.webm", "from": f,
               "durationInFrames": durs[sid]}
        if sid in TRANS:
            seg["out"] = {"type": TRANS[sid][0], "frames": TRANS[sid][1]}
        segs.append(seg)
        f += durs[sid] - (TRANS[sid][1] if sid in TRANS else 0)
    total = segs[-1]["from"] + segs[-1]["durationInFrames"]
    for prev, seg in zip(segs, segs[1:]):
        seg["in"] = prev["out"]
    start = {s["id"]: s["from"] for s in segs}

    marks = [{"seg": "MC", "id": "start", "frame": start["MC"]}]
    for sid in ("M1", "M2", "M3"):
        for m in ev[sid]["marks"]:
            mk = {"seg": sid, "id": m["id"], "frame": start[sid] + round(m["t"] * FPS)}
            mk.update({k: v for k, v in m.items() if k not in ("t", "id")})
            marks.append(mk)

    def mark(seg, mid):
        for m in marks:
            if m["seg"] == seg and m["id"] == mid:
                return m
        raise KeyError((seg, mid))

    focal = mark("M1", "end")
    segs[0]["out"]["focal"] = {"x": focal.get("fx", 960), "y": focal.get("fy", 540)}

    spec = json.loads(CUES.read_text())
    cues = []
    for c in spec["cues"]:
        st = mark(c["seg"], c["mark"])["frame"] + c.get("delay", 0) * BF
        cues.append({**c, "start": st, "end": st + c.get("hold", 4) * BF})
    cues.sort(key=lambda c: c["start"])
    for a, b in zip(cues, cues[1:]):
        if a["end"] > b["start"] - 3:
            a["end"] = b["start"] - 3
    t = spec["title"]
    title = {**t, "start": mark(t["seg"], t["mark"])["frame"] + t.get("delay", 0) * BF}

    impacts = []
    for sid in ("M1", "M2", "M3"):
        for e in ev[sid]["sfx"]:
            if e["kind"] == "impact":
                impacts.append(start[sid] + round(e["t"] * FPS))
    impacts += [c["start"] for c in cues if c.get("stamp")]
    impacts += [title["start"]]
    impacts += [segs[0]["from"] + segs[0]["durationInFrames"] - 6]   # salida del dive
    impacts = sorted(set(impacts))

    seg_data = {}
    for sid in ("M1", "M2", "M3"):
        ch = ev[sid]["channels"]
        seg_data[sid] = {"pen": ev[sid]["pen"], "cam_x": ch.get("cam_x"),
                         "cam_y": ch.get("cam_y"), "cam_w": ch.get("cam_w"),
                         "scan": ch.get("scan_px")}
    tl = {"fps": FPS, "width": 1920, "height": 1080, "durationInFrames": total,
          "beatFrames": BF * 2, "segments": segs, "marks": marks, "cues": cues,
          "title": title, "impacts": impacts, "data": seg_data}
    (OUT / "timeline.json").write_text(json.dumps(tl, ensure_ascii=False))
    return tl, ev


# ======================================================================
# Síntesis: utilidades
# ======================================================================
def bp(x, lo, hi, o=2):
    return signal.sosfilt(signal.butter(o, [lo, hi], "band", fs=SR, output="sos"), x)


def lp(x, fc, o=2):
    return signal.sosfilt(signal.butter(o, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc, o=2):
    return signal.sosfilt(signal.butter(o, fc, "high", fs=SR, output="sos"), x)


def add(buf, t, clip, g=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0:
        clip, i = clip[-i:], 0
    if i >= buf.shape[1] or len(clip) == 0:
        return
    j = min(buf.shape[1], i + len(clip))
    c = clip[: j - i] * g
    buf[0, i:j] += c * math.cos((pan + 1) * math.pi / 4) * 1.414
    buf[1, i:j] += c * math.sin((pan + 1) * math.pi / 4) * 1.414


def env(n, a, d):
    e = np.ones(n)
    a, d = min(n, int(a * SR)), min(n, int(d * SR))
    if a:
        e[:a] = np.linspace(0, 1, a)
    if d:
        e[n - d:] *= np.linspace(1, 0, d)
    return e


def T(n):
    return np.arange(n) / SR


# ------------------------------------------------------------- batería
def kick():
    n = int(0.42 * SR)
    t = T(n)
    f = 46 + 110 * np.exp(-t / 0.035)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)
    click = hp(rng.standard_normal(n), 3000) * np.exp(-t / 0.004) * 0.35
    return np.tanh((body + click) * 1.6)


def clap():
    n = int(0.3 * SR)
    t = T(n)
    noise = bp(rng.standard_normal(n), 900, 5200)
    e = np.zeros(n)
    for k, off in enumerate((0, 0.011, 0.022)):
        i = int(off * SR)
        e[i:] += np.exp(-(t[: n - i]) / (0.007 if k < 2 else 0.11))
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.05) * 0.3
    return noise * e * 0.8 + tone


def snare():
    n = int(0.22 * SR)
    t = T(n)
    return bp(rng.standard_normal(n), 1200, 7000) * np.exp(-t / 0.07) + \
        np.sin(2 * np.pi * 200 * t) * np.exp(-t / 0.04) * 0.5


def hat(open_=False):
    n = int((0.25 if open_ else 0.05) * SR)
    t = T(n)
    return hp(rng.standard_normal(n), 7500, 3) * np.exp(-t / (0.09 if open_ else 0.012))


def crash():
    n = int(1.8 * SR)
    t = T(n)
    return hp(rng.standard_normal(n), 4000, 2) * np.exp(-t / 0.55) * 0.6


# ------------------------------------------------------------- tonales
NOTES = {"A": 9, "B": 11, "C": 0, "D": 2, "E": 4, "F": 5, "G": 7}


def hz(name):
    n, o = name[:-1], int(name[-1])
    return 440 * 2 ** ((12 * (o + 1) + NOTES[n[0]] + ("#" in n) - 69) / 12)


_ks = {}


def pluck(freq, dur=0.34, bright=0.55):
    key = (round(freq, 2), dur)
    if key in _ks:
        return _ks[key]
    n = int(dur * SR)
    N = max(2, int(SR / freq))
    buf = lp(rng.uniform(-1, 1, N), 2000 + 6000 * bright) if N > 24 else rng.uniform(-1, 1, N)
    out = np.zeros(n)
    idx = 0
    for i in range(n):
        out[i] = buf[idx]
        nx = (idx + 1) % N
        buf[idx] = 0.995 * 0.5 * (buf[idx] + buf[nx])
        idx = nx
    out *= np.exp(-T(n) / (dur * 0.7))
    _ks[key] = out
    return out


def bass_note(freq, dur):
    n = int(dur * SR)
    t = T(n)
    saw = sum(np.sin(2 * np.pi * freq * k * t) / k for k in range(1, 8))
    sub = np.sin(2 * np.pi * freq / 2 * t) * 0.6
    return lp(saw * 0.5 + sub, 700) * env(n, 0.005, 0.04)


def pad(freqs, dur):
    n = int(dur * SR)
    t = T(n)
    out = sum(np.sin(2 * np.pi * f * 2 ** (d / 12) * t + rng.uniform(0, 6))
              for f in freqs for d in (-0.1, 0, 0.1))
    return lp(out, 1600) / (len(freqs) * 3) * env(n, 0.5, 0.6)


# ------------------------------------------------------------- efectos
def pencil(dur, intensity=0.8):
    n = int(dur * SR)
    if n < 10:
        return np.zeros(0)
    noise = rng.standard_normal(n)
    body = bp(noise, 2500, 9000) * 0.7 + bp(noise, 800, 2200) * 0.35
    e = np.zeros(n)
    t = 0.0
    while t < dur:
        L = rng.uniform(0.04, 0.12)
        i0, i1 = int(t * SR), min(n, int((t + L) * SR))
        if i1 > i0:
            seg = np.hanning(i1 - i0) * rng.uniform(0.5, 1)
            e[i0:i1] = np.maximum(e[i0:i1], seg)
        t += L + rng.uniform(0.005, 0.03)
    return body * e * intensity


def pop():
    n = int(0.12 * SR)
    t = T(n)
    f = 380 + 700 * np.exp(-t / 0.02)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035) + \
        hp(rng.standard_normal(n), 3000) * np.exp(-t / 0.004) * 0.3


def blip(freq=880):
    n = int(0.15 * SR)
    t = T(n)
    return (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(4 * np.pi * freq * t)) * np.exp(-t / 0.05)


def whoosh(dur, f0=300, f1=3500, q=0.4):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 512
    for i in range(0, n, blk):
        fc = f0 * (f1 / f0) ** (i / max(1, n))
        b, a = signal.butter(2, [max(80, fc * (1 - q)), min(SR / 2 - 200, fc * (1 + q))], "band", fs=SR)
        out[i:i + blk] = signal.lfilter(b, a, noise[i:i + blk])
    return out * np.sin(np.linspace(0, np.pi, n)) ** 1.3


def riser(dur):
    n = int(dur * SR)
    t = T(n)
    k = t / dur
    tone = np.sin(2 * np.pi * np.cumsum(200 + 1400 * k ** 2) / SR) * 0.25
    return (whoosh(dur, 200, 6000, 0.5) + tone) * k ** 1.5


def impact():
    n = int(1.2 * SR)
    t = T(n)
    sub = np.sin(2 * np.pi * np.cumsum(30 + 70 * np.exp(-t / 0.08)) / SR) * np.exp(-t / 0.45)
    thump = lp(rng.standard_normal(n), 900) * np.exp(-t / 0.08) * 0.8
    tail = bp(rng.standard_normal(n), 300, 3000) * np.exp(-t / 0.35) * 0.25
    return np.tanh((sub * 1.2 + thump + tail) * 1.3)


def spark():
    n = int(0.3 * SR)
    t = T(n)
    cr = hp(rng.standard_normal(n), 2500) * (rng.random(n) < 0.05) * 3
    crackle = lp(cr, 9000) * np.exp(-t / 0.08)
    zap = np.sin(2 * np.pi * np.cumsum(2400 - 1800 * t / 0.3) / SR) * np.exp(-t / 0.06) * 0.4
    return crackle + zap


def scan(dur):
    n = int(dur * SR)
    t = T(n)
    hum = sum(np.sin(2 * np.pi * f * t) for f in (220, 330, 440.5)) / 3
    shimmer = hp(rng.standard_normal(n), 5000) * 0.15
    trem = 0.6 + 0.4 * np.sin(2 * np.pi * 14 * t)
    return (hum * 0.5 + shimmer) * trem * env(n, 0.05, 0.2) + whoosh(dur, 400, 5000, 0.3) * 0.6


def clack():
    n = int(0.25 * SR)
    t = T(n)
    return np.sin(2 * np.pi * (150 - 70 * t) * t) * np.exp(-t / 0.05) + \
        hp(rng.standard_normal(n), 2000) * np.exp(-t / 0.006) * 0.7


def motor_hum(speed, total_n):
    sp = np.asarray(speed, float)
    if len(sp) == 0 or sp.max() <= 0.01:
        return None
    n = int(len(sp) / FPS * SR)
    v = np.clip(lp(np.clip(np.interp(T(n), np.arange(len(sp)) / FPS, sp), 0, 1.3), 8), 0, 1.3)
    ph = 2 * np.pi * np.cumsum(40 + 150 * v) / SR
    pw = 2 * np.pi * np.cumsum(800 + 1800 * v) / SR
    hum = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)
    whine = np.sin(pw) * 0.25
    return hp(lp((hum * 0.4 + whine) * v ** 0.9, 5000), 70)


# ======================================================================
# Música por secciones
# ======================================================================
PROG = [("A2", ["A3", "C4", "E4", "A4"]), ("F2", ["F3", "A3", "C4", "F4"]),
        ("C3", ["C4", "E4", "G4", "C5"]), ("G2", ["G3", "B3", "D4", "G4"])]


def music(total_s, sections):
    """sections: lista de (t0, t1, tipo) con tipo en
    intro | groove | build | break | outro."""
    n = int(total_s * SR) + SR * 3
    drums = np.zeros((2, n))
    bass = np.zeros((2, n))
    keys = np.zeros((2, n))
    duck = np.ones(n)
    step = BEAT / 4                     # semicorcheas
    k_kick, k_clap, k_snare = kick(), clap(), snare()
    k_hat, k_ohat = hat(), hat(True)

    def sec_at(t):
        for a, b, kind in sections:
            if a <= t < b:
                return kind, (t - a) / max(1e-6, b - a), b - a
        return "outro", 1.0, 1.0

    i = 0
    while i * step < total_s + 1:
        t = i * step
        kind, prog, slen = sec_at(t)
        s16 = i % 16                    # posición en el compás (16 semicorcheas)
        bar = int(t / (4 * BEAT))
        root, chord = PROG[bar % 4]
        if kind in ("groove",):
            if s16 % 4 == 0:
                add(drums, t, k_kick, 0.62)
                d0 = int(t * SR)
                L = int(0.25 * SR)
                duck[d0:d0 + L] = np.minimum(duck[d0:d0 + L], 1 - 0.55 * np.exp(-np.arange(min(L, n - d0)) / SR / 0.08))
            if s16 in (4, 12):
                add(drums, t, k_clap, 0.5)
            add(drums, t, k_hat, 0.34 if s16 % 2 else 0.2, pan=0.3)
            if s16 % 4 == 2:
                add(drums, t, k_ohat, 0.2, pan=-0.3)
        elif kind == "intro":
            if s16 % 2 == 0:
                add(drums, t, k_hat, 0.10, pan=0.3)
        elif kind == "build":
            # redoble que se acelera: negras → corcheas → semicorcheas
            div = 4 if prog < 0.4 else (2 if prog < 0.75 else 1)
            if s16 % div == 0:
                add(drums, t, k_snare, 0.25 + 0.35 * prog)
            if s16 % 4 == 0 and prog < 0.5:
                add(drums, t, k_kick, 0.6)
        elif kind == "break":
            if s16 % 8 == 0:
                add(drums, t, k_hat, 0.08)
            if prog > 0.6 and s16 % 2 == 0:
                add(drums, t, k_snare, 0.15 + 0.4 * (prog - 0.6) / 0.4)
        # bajo
        if kind in ("groove", "build") and s16 % 2 == 0:
            f = hz(root) * (2 if s16 in (6, 14) else 1)
            add(bass, t, bass_note(f, step * 1.8), 0.2)
        elif kind == "break" and s16 == 0:
            add(bass, t, bass_note(hz(root), 4 * BEAT), 0.22)
        # arpegio pulsado
        if kind != "outro" or t < sections[-1][0] + 2:
            note = chord[[0, 2, 1, 3, 2, 1, 3, 2][s16 % 8]]
            g = {"intro": 0.22, "groove": 0.3, "build": 0.22, "break": 0.3, "outro": 0.26}[kind]
            add(keys, t, pluck(hz(note)), g, pan=0.25 * math.sin(i * 0.7))
        # pad al inicio de cada compás
        if s16 == 0:
            g = {"break": 0.35, "outro": 0.3, "intro": 0.2}.get(kind, 0.16)
            add(keys, t, pad([hz(x) for x in chord[:3]], 4 * BEAT + 0.6), g)
        i += 1
    # intro con filtro paso bajo (se "abre" al arrancar el motor)
    intro_end = sections[0][1]
    ie = int(intro_end * SR)
    keys[:, :ie] = np.stack([lp(keys[0, :ie], 1400), lp(keys[1, :ie], 1400)])
    mix = drums + (bass + keys) * duck
    mix = np.stack([hp(mix[0], 35), hp(mix[1], 35)])
    return mix[:, : int(total_s * SR)], duck[: int(total_s * SR)]


# ======================================================================
def build_audio(tl, ev):
    total_s = tl["durationInFrames"] / FPS
    n = int(total_s * SR) + SR
    sfx = np.zeros((2, n))
    seg = {s["id"]: s for s in tl["segments"]}
    st = {k: v["from"] / FPS for k, v in seg.items()}

    def mk(sid, mid):
        return next(m["frame"] for m in tl["marks"] if m["seg"] == sid and m["id"] == mid) / FPS

    for sid in ("M1", "M2", "M3"):
        for e in ev[sid]["sfx"]:
            t, d, k = st[sid] + e["t"], e["dur"], e["kind"]
            if k in ("pencil", "marker", "hilite"):
                add(sfx, t, pencil(d, 0.9 if not e.get("write") else 0.6), 0.26, rng.uniform(-.3, .3))
            elif k == "pop":
                add(sfx, t, pop(), 0.28, rng.uniform(-.2, .2))
            elif k == "whoosh":
                add(sfx, t - 0.05, whoosh(max(0.35, d + 0.15), 300, 4000), 0.22)
            elif k == "riser":
                add(sfx, t, riser(d), 0.30)
            elif k == "scan":
                add(sfx, t, scan(d), 0.28)
            elif k == "spark":
                add(sfx, t, spark(), 0.30, rng.uniform(-.4, .4))
            elif k == "clack":
                add(sfx, t, clack(), 0.45)
            elif k == "motor_start":
                add(sfx, t, whoosh(max(0.3, d + 0.2), 200, 1800, 0.3), 0.18)
            elif k == "rotate":
                add(sfx, t, whoosh(d, 300, 900, 0.25), 0.07)
        hum = motor_hum(ev[sid]["channels"].get("motor", []), n)
        if hum is not None:
            add(sfx, st[sid], hum, 0.09)

    # Motion Canvas
    for t in MC_POPS:
        add(sfx, st["MC"] + t, pop(), 0.22)
    for t, d in MC_PENCIL + MC_WRITE:
        add(sfx, st["MC"] + t, pencil(d), 0.14)
    for k, t in enumerate(MC_BLIPS):
        add(sfx, st["MC"] + t, blip([660, 880, 990][k % 3]), 0.12)

    # texto cinético: un pop por palabra (los "sellos" llevan impacto aparte)
    for c in tl["cues"]:
        for i, _ in enumerate(c["words"]):
            add(sfx, (c["start"] + i * BF) / FPS, pop(), 0.16 if c.get("stamp") else 0.2)
    # impactos (sincronizados con sacudida + destello en Remotion)
    for f in tl["impacts"]:
        add(sfx, f / FPS, impact(), 0.3)
    # transiciones
    for s in tl["segments"]:
        if "out" in s:
            tt = (s["from"] + s["durationInFrames"] - s["out"]["frames"]) / FPS
            dur = s["out"]["frames"] / FPS
            if s["out"]["type"] == "dive":
                add(sfx, tt - 0.3, whoosh(dur + 0.4, 200, 5000, 0.5), 0.35)
            elif s["out"]["type"] == "whip":
                add(sfx, tt - 0.1, whoosh(dur + 0.25, 4000, 400, 0.5), 0.35)
            else:
                add(sfx, tt, whoosh(dur, 150, 900, 0.6), 0.3)
                add(sfx, tt + dur * 0.45, impact(), 0.25)
    # título: tagline palabra a palabra
    tf = tl["title"]["start"] / FPS
    for i in range(len(tl["title"]["tagline"])):
        add(sfx, tf + 0.9 + i * 0.3, pop(), 0.18)
    add(sfx, tf, crash(), 0.4)
    # acorde final (pad + pulsado) sobre el título
    for k, note in enumerate(("A3", "C4", "E4", "A4", "C5")):
        add(sfx, tf + k * 0.03, pluck(hz(note), 1.2, 0.7), 0.22)
    add(sfx, tf, pad([hz(x) for x in ("A3", "C4", "E4")], 4.5), 0.5)

    # música
    secs = [
        (0.0, mk("M1", "run"), "intro"),
        (mk("M1", "run"), mk("M1", "look"), "groove"),
        (mk("M1", "look"), mk("M1", "xray_hit"), "build"),
        (mk("M1", "xray_hit"), mk("M2", "comm"), "groove"),
        (mk("M2", "comm"), mk("M2", "drop"), "break"),
        (mk("M2", "drop"), mk("M3", "fly"), "groove"),
        (mk("M3", "fly"), mk("M3", "slam"), "build"),
        (mk("M3", "slam"), mk("M3", "title"), "groove"),
        (mk("M3", "title"), total_s + 5, "groove"),
    ]
    mus, duck = music(total_s, secs)
    for a, b, kind in secs:
        if kind == "groove" and a > 0.5:
            add(mus, a, crash(), 0.5)
    fade = np.clip((total_s - T(mus.shape[1])) / 2.0, 0, 1)
    mus *= fade
    mix = sfx[:, : mus.shape[1]] + mus * 0.55

    mix = np.nan_to_num(mix)
    # master: ganancia a ~-14 LUFS aproximado (RMS) + limitador suave
    rms = np.sqrt(np.mean(mix ** 2)) + 1e-9
    mix *= 10 ** (-15.5 / 20) / rms
    mix = np.tanh(mix * 1.1) * 0.93
    pcm = (mix.T * 32767).astype(np.int16)
    with wave.open(str(OUT / "audio.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    return total_s


if __name__ == "__main__":
    tl, ev = build_timeline()
    secs = build_audio(tl, ev)
    print(f"timeline.json: {tl['durationInFrames']} frames ({secs:.2f} s)")
    for s in tl["segments"]:
        print(f"  {s['id']}: from {s['from']} · {s['durationInFrames']} f · out={s.get('out', {}).get('type')}")
    print(f"  cues: {len(tl['cues'])} · impactos: {len(tl['impacts'])}")
    print("audio.wav listo")
