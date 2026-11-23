#!/usr/bin/env python3
"""Video 01 — construye la línea de tiempo maestra y el audio sintetizado.

Lee lo que las capas renderizaron de verdad:
  layers/remotion/public/layers/v01/M1|M2|M3.events.json   (Manim)
  layers/remotion/public/layers/v01/MC.webm                 (Motion Canvas)
y escribe:
  layers/remotion/public/layers/v01/timeline.json  → lo consume Remotion
  layers/remotion/public/layers/v01/audio.wav      → pista de audio final

Todo el sonido está sincronizado con eventos reales del render (trazos de
rotulador, velocidad del motor por frame, inversiones del conmutador), no con
tiempos escritos a mano. No usa samples externos: todo se sintetiza.

Uso:  layers/manim/.venv/bin/python scripts/v01/build_timeline_audio.py
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
OUT = ROOT / "layers/remotion/public/layers/v01"
FPS = 30
SR = 48000
WIPE = 21           # frames de la transición "borrador" entre segmentos
OUTRO = 0           # frames extra al final

# Pasos de dibujo de la escena Motion Canvas (resumen.tsx), en segundos.
# Se duplican aquí sólo para el sonido de rotulador de ese segmento.
MC_STEPS = [(0.3, None), (0.55, "m"), (0.45, "m"), (0.45, "w"), (0.25, "m"),
            (0.55, "m"), (0.5, "m"), (0.1, "w"), (0.6, "w"), (0.7, "m"),
            (0.5, "m"), (0.35, "m"), (0.35, "w"), (0.35, "m"), (0.5, "m"),
            (0.45, "m"), (1.6, "w"), (0.9, "m"), (1.3, "w"), (1.1, None)]


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
    mc_frames = probe_frames(OUT / "MC.webm")
    order = [("M1", ev["M1"]["frames"]), ("M2", ev["M2"]["frames"]),
             ("MC", mc_frames), ("M3", ev["M3"]["frames"])]
    segments, wipes = [], []
    f = 0
    for i, (sid, n) in enumerate(order):
        segments.append({"id": sid, "src": f"layers/v01/{sid}.webm", "from": f,
                         "durationInFrames": n})
        f += n
        if i < len(order) - 1:
            wipes.append({"from": f, "durationInFrames": WIPE, "after": sid})
            f += WIPE
    total = f + OUTRO
    marks = []
    for seg in segments:
        if seg["id"] in ev:
            for m in ev[seg["id"]]["marks"]:
                marks.append({"seg": seg["id"], "id": m["id"],
                              "frame": seg["from"] + int(round(m["t"] * FPS))})
        else:
            marks.append({"seg": "MC", "id": "summary", "frame": seg["from"]})
    pen = {sid: ev[sid]["pen"] for sid in ("M1", "M2", "M3")}
    tl = {"fps": FPS, "width": 1920, "height": 1080, "durationInFrames": total,
          "segments": segments, "wipes": wipes, "marks": marks, "pen": pen}
    (OUT / "timeline.json").write_text(json.dumps(tl, ensure_ascii=False))
    return tl, ev


# ======================================================================
# Síntesis
# ======================================================================
rng = np.random.default_rng(2026)


def bandpass(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lowpass(x, fc, order=2):
    sos = signal.butter(order, fc, btype="low", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def highpass(x, fc, order=2):
    sos = signal.butter(order, fc, btype="high", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def add(buf, start_s, clip, gain=1.0, pan=0.0):
    i = int(start_s * SR)
    if i >= buf.shape[1] or len(clip) == 0:
        return
    j = min(buf.shape[1], i + len(clip))
    c = clip[: j - i] * gain
    lg = math.cos((pan + 1) * math.pi / 4)
    rg = math.sin((pan + 1) * math.pi / 4)
    buf[0, i:j] += c * lg * math.sqrt(2)
    buf[1, i:j] += c * rg * math.sqrt(2)


def marker(dur, intensity=1.0, writing=False):
    """Rotulador sobre pizarra: ruido filtrado con envolvente de "trazos"."""
    n = int(dur * SR)
    if n < 10:
        return np.zeros(0)
    noise = rng.standard_normal(n)
    body = bandpass(noise, 900, 2400) * 0.7 + bandpass(noise, 2600, 7000) * 0.55
    env = np.zeros(n)
    t = 0.0
    while t < dur:
        L = rng.uniform(0.05, 0.14) if writing else rng.uniform(0.12, 0.42)
        a = rng.uniform(0.55, 1.0)
        i0, i1 = int(t * SR), min(n, int((t + L) * SR))
        if i1 > i0:
            seg = np.ones(i1 - i0) * a
            att, rel = min(len(seg), int(0.012 * SR)), min(len(seg), int(0.035 * SR))
            seg[:att] *= np.linspace(0, 1, att)
            seg[len(seg) - rel:] *= np.linspace(1, 0, rel)
            # micro-vibración del fieltro
            tt = np.arange(len(seg)) / SR
            seg *= 0.8 + 0.2 * np.sin(2 * np.pi * rng.uniform(18, 32) * tt)
            env[i0:i1] = np.maximum(env[i0:i1], seg)
        t += L + (rng.uniform(0.015, 0.05) if writing else rng.uniform(0.02, 0.09))
    # pequeño "chirrido" ocasional
    if rng.random() < 0.45 and not writing:
        k0 = int(rng.uniform(0, max(1e-3, dur - 0.2)) * SR)
        k1 = min(n, k0 + int(0.12 * SR))
        tt = np.arange(k1 - k0) / SR
        f0 = rng.uniform(1900, 2600)
        sq = np.sin(2 * np.pi * (f0 * tt + 40 * np.sin(2 * np.pi * 9 * tt)))
        sq *= np.hanning(len(sq)) * 0.12
        body[k0:k1] += sq
    return body * env * (0.5 + 0.5 * intensity)


def click():
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    burst = rng.standard_normal(n) * np.exp(-t / 0.004)
    ping = np.sin(2 * np.pi * 2350 * t) * np.exp(-t / 0.018) * 0.6
    return highpass(burst, 1500) * 0.6 + ping


def whoosh(dur, f0=300, f1=3500, q=0.35):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 1024
    for i in range(0, n, blk):
        frac = i / max(1, n)
        fc = f0 * (f1 / f0) ** frac
        lo, hi = max(60, fc * (1 - q)), min(SR / 2 - 100, fc * (1 + q))
        b, a = signal.butter(2, [lo, hi], btype="band", fs=SR)
        out[i:i + blk] = signal.lfilter(b, a, noise[i:i + blk])
    env = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return out * env


def shimmer(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for f in (1318.5, 1567.98, 1975.5, 2637.0):
        out += np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * (0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(5, 8) * t))
    env = np.minimum(1, t / 0.25) * np.exp(-np.maximum(0, t - 0.25) / 0.6)
    return out * env * 0.08


def eraser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = lowpass(bandpass(rng.standard_normal(n), 250, 3800), 3000)
    rub = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * 4.2 * t))
    env = np.sin(np.linspace(0, np.pi, n)) ** 0.7
    return noise * rub * env


def clack():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    thud = np.sin(2 * np.pi * (140 - 60 * t) * t) * np.exp(-t / 0.05)
    tick = highpass(rng.standard_normal(n), 2000) * np.exp(-t / 0.006) * 0.5
    return thud + tick


def motor_hum(speed_per_frame, start_s, total_n):
    """Zumbido del motor a partir de la velocidad real (0..1) por frame."""
    sp = np.asarray(speed_per_frame, float)
    if sp.max() <= 0.001:
        return None
    n = int(len(sp) / FPS * SR)
    tf = np.arange(len(sp)) / FPS
    ts = np.arange(n) / SR
    v = np.interp(ts, tf, sp)
    v = lowpass(v, 8)  # suaviza
    v = np.clip(v, 0, 1.2)
    f_rot = 35 + 150 * v                    # zumbido mecánico
    f_wh = 700 + 1700 * v                   # silbido de escobillas
    ph_r = 2 * np.pi * np.cumsum(f_rot) / SR
    ph_w = 2 * np.pi * np.cumsum(f_wh) / SR
    hum = (np.sin(ph_r) + 0.5 * np.sin(2 * ph_r) + 0.3 * np.sin(3 * ph_r + 0.4)
           + 0.15 * np.sin(5 * ph_r))
    whine = np.sin(ph_w) * 0.18 + np.sin(2.01 * ph_w) * 0.06
    # rumor de escobillas (ruido modulado por el conmutador)
    brush = bandpass(rng.standard_normal(n), 1800, 6000) * (0.5 + 0.5 * np.sin(2 * ph_r)) * 0.25
    amp = v ** 0.9
    out = lowpass((hum * 0.55 + whine + brush) * amp, 5000)
    return out


# ---------------------------------------------------------------- música
NOTE = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def midi(name):
    n, octv = name[:-1], int(name[-1])
    return 12 * (octv + 1) + NOTE[n[0]] + (1 if "#" in n else 0)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def pluck(freq, dur, bright=0.5):
    """Cuerda pulsada Karplus-Strong."""
    n = int(dur * SR)
    N = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, N)
    buf = lowpass(buf, 1500 + 5000 * bright) if N > 20 else buf
    out = np.zeros(n)
    idx = 0
    decay = 0.996
    for i in range(n):
        out[i] = buf[idx]
        nxt = (idx + 1) % N
        buf[idx] = decay * 0.5 * (buf[idx] + buf[nxt])
        idx = nxt
    return out * np.exp(-np.arange(n) / SR / (dur * 0.9))


def pad(freqs, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):
            ff = f * 2 ** (det / 12)
            out += np.sin(2 * np.pi * ff * t + rng.uniform(0, 6)) + 0.25 * np.sin(4 * np.pi * ff * t)
    att = min(n, int(1.2 * SR))
    env = np.ones(n)
    env[:att] = np.linspace(0, 1, att) ** 2
    rel = min(n, int(1.5 * SR))
    env[-rel:] *= np.linspace(1, 0, rel) ** 2
    return lowpass(out * env, 1400) / (len(freqs) * 3)


def music(total_s):
    """Base suave: acordes en pad + arpegio pulsado a 84 BPM."""
    bpm = 84
    beat = 60 / bpm
    bar = 4 * beat
    prog = [["C3", "G3", "E4", "B4"], ["A2", "E3", "C4", "G4"],
            ["F2", "C3", "A3", "E4"], ["G2", "D3", "B3", "E4"]]
    arp = [0, 2, 3, 1, 2, 3, 1, 3]
    n = int(total_s * SR) + SR * 4
    out = np.zeros(n)
    plucks = np.zeros(n)
    t = 0.0
    k = 0
    cache = {}
    while t < total_s + bar:
        ch = prog[k % len(prog)]
        p = pad([hz(midi(x)) for x in ch[:3]], bar + 1.5)
        i = int(t * SR)
        out[i:i + len(p)] += p[: max(0, n - i)]
        for j, a in enumerate(arp):
            note = ch[a]
            m = midi(note) + (12 if a >= 2 else 0)
            key = (m, round(beat * 1.6, 3))
            if key not in cache:
                cache[key] = pluck(hz(m), beat * 1.6, bright=0.35)
            pl = cache[key]
            ii = int((t + j * beat / 2) * SR)
            if ii < n:
                plucks[ii:ii + len(pl)] += pl[: n - ii] * (0.9 if j % 2 == 0 else 0.65)
        t += bar
        k += 1
    mix = out * 0.9 + plucks * 0.35
    # eco suave
    d = int(beat * 0.75 * SR)
    echo = np.zeros_like(mix)
    echo[d:] = mix[:-d] * 0.28
    return (mix + echo)[: int(total_s * SR)]


# ======================================================================
def build_audio(tl, ev):
    total_s = tl["durationInFrames"] / FPS
    n = int(total_s * SR) + SR
    sfx = np.zeros((2, n))
    seg_start = {s["id"]: s["from"] / FPS for s in tl["segments"]}

    for sid in ("M1", "M2", "M3"):
        t0 = seg_start[sid]
        for e in ev[sid]["sfx"]:
            t, dur, kind = t0 + e["t"], e["dur"], e["kind"]
            if kind in ("marker", "hilite"):
                writing = bool(e.get("write"))
                add(sfx, t, marker(dur, e.get("intensity", 0.7), writing),
                    gain=0.20 if writing else 0.26, pan=rng.uniform(-0.25, 0.25))
            elif kind == "click":
                add(sfx, t, click(), gain=0.30)
            elif kind == "reveal":
                add(sfx, t, whoosh(dur, 250, 4000), gain=0.22)
                add(sfx, t + 0.1, shimmer(dur + 0.8), gain=0.9)
            elif kind == "assemble":
                add(sfx, t, whoosh(dur, 2500, 300, q=0.45), gain=0.20)
            elif kind == "clack":
                add(sfx, t, clack(), gain=0.35)
            elif kind == "rotate":
                add(sfx, t, whoosh(dur, 400, 1200, q=0.25), gain=0.06)
        hum = motor_hum(ev[sid]["channels"].get("motor", [0]), t0, n)
        if hum is not None:
            add(sfx, t0, hum, gain=0.10)

    # rotulador del segmento Motion Canvas
    t = seg_start["MC"]
    for dur, kind in MC_STEPS:
        if kind:
            add(sfx, t, marker(dur, 0.8, writing=(kind == "w")),
                gain=0.18 if kind == "w" else 0.24, pan=rng.uniform(-0.2, 0.2))
        t += dur

    # borrador en cada transición
    for w in tl["wipes"]:
        add(sfx, w["from"] / FPS - 0.05, eraser(w["durationInFrames"] / FPS + 0.15),
            gain=0.22)

    # música
    mus = music(total_s + 1)
    fade_in = np.minimum(1, np.arange(len(mus)) / (1.5 * SR))
    fade_out = np.clip((total_s - np.arange(len(mus)) / SR) / 2.5, 0, 1)
    mus *= fade_in * fade_out
    mix = sfx.copy()
    mix[0, :len(mus)] += mus[:n] * 0.16
    mix[1, :len(mus)] += mus[:n] * 0.16

    mix = mix[:, : int(total_s * SR)]
    peak = np.abs(mix).max() or 1
    mix = np.tanh(mix / peak * 1.25) / math.tanh(1.25) * 0.89   # ≈ -1 dBFS
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
        print(f"  {s['id']}: from {s['from']} · {s['durationInFrames']} f")
    print("audio.wav listo")
