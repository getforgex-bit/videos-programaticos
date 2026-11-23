#!/usr/bin/env python3
"""
Generador de Capa 1 (Manim / Física Matemática y Diseño Sonoro Dopaminérgico v2.0)
Proyecto: Idea A — El motor invisible | Estilo 2 — Boceto Grafito/Sepia a Mano (v2.0)

Produce:
1. layers/remotion/public/layers/manim_torque_wave.webm
   (Onda de torque y vectores F = I(L x B) en estilo boceto sepia/grafito sobre pergamino)
2. layers/remotion/public/layers/manim_physics_telemetry.json
   (Telemetría cinemática y de cámara para las 6 escenas dinámicas en 900 frames @ 30fps)
3. layers/remotion/public/audio/whiteboard_motor_sfx.wav
   (Diseño sonoro dopaminérgico: whooshes de cámara, impactos sub-bass, trazos rápidos de
    carboncillo, chispazos eléctricos de conmutación y aceleración armónica del motor)
"""

import json
import math
import os
import wave
from pathlib import Path

import av
import numpy as np
from PIL import Image, ImageDraw, ImageFont

FPS = 30
DURATION_SEC = 30
TOTAL_FRAMES = FPS * DURATION_SEC  # 900 frames
WIDTH = 1920
HEIGHT = 1080

REPO_ROOT = Path(__file__).resolve().parents[2]
LAYERS_OUT = REPO_ROOT / "layers" / "remotion" / "public" / "layers"
AUDIO_OUT = REPO_ROOT / "layers" / "remotion" / "public" / "audio"
FONTS_DIR = REPO_ROOT / "layers" / "remotion" / "public" / "fonts"


def clamp(val: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, val))


def smoothstep(edge0: float, edge1: float, x: float) -> float:
    t = clamp((x - edge0) / max(1e-6, (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)


def compute_telemetry():
    """Calcula la cinemática de alta energía para las 6 escenas de v2.0 (900 frames)."""
    frames = []
    theta_deg = 15.0

    for f in range(TOTAL_FRAMES):
        t = f / FPS

        # 6 Escenas dinámicas con cambios de cámara y ritmo:
        # Escena 1 (0-120 | 0-4s): Trazo explosivo del motor exterior + Arranque a 3000 RPM
        # Escena 2 (120-240 | 4-8s): Barrido Rayos-X + Impacto de Imanes N/S en herradura y núcleo central
        # Escena 3 (240-375 | 8-12.5s): Macro Zoom a terminales + Inyección de Corriente (I) y Campo (B)
        # Escena 4 (375-540 | 12.5-18s): Explosión de Vectores de Fuerza de Lorentz (F) + Par de giro
        # Escena 5 (540-720 | 18-24s): Conmutación cada 180° con chispazos e hiper-aceleración
        # Escena 6 (720-900 | 24-30s): Pullback y Reconstrucción por impacto de la carcasa exterior
        if f < 120:
            scene = 1
        elif f < 240:
            scene = 2
        elif f < 375:
            scene = 3
        elif f < 540:
            scene = 4
        elif f < 720:
            scene = 5
        else:
            scene = 6

        if f < 38:
            rpm = 0.0
        elif f < 120:
            rpm = 3000.0 * smoothstep(38, 72, f)
        elif f < 240:
            rpm = 3000.0 * (1.0 - 0.85 * smoothstep(120, 155, f))  # Baja a 450 RPM
        elif f < 395:
            rpm = 450.0 * (1.0 - 0.65 * smoothstep(240, 275, f))  # Cámara lenta ~157 RPM para ver I y B
        elif f < 540:
            rpm = 157.0 + 1350.0 * smoothstep(410, 520, f)  # Empuje de Lorentz acelera el rotor
        elif f < 720:
            rpm = 1507.0 + 1693.0 * smoothstep(545, 665, f)  # Hiper-rotación 3200 RPM
        else:
            rpm = 3000.0

        deg_per_frame = (rpm / 3000.0) * 13.5
        theta_deg = (theta_deg + deg_per_frame) % 360.0
        theta_rad = math.radians(theta_deg)

        # Opacidad de carcasa exterior sólida
        if f < 120:
            casing_opacity = smoothstep(5, 42, f)
        elif f < 240:
            casing_opacity = 1.0 - 0.86 * smoothstep(125, 168, f)
        elif f < 720:
            casing_opacity = 0.14
        else:
            casing_opacity = 0.14 + 0.86 * smoothstep(730, 785, f)

        internals_visibility = smoothstep(135, 215, f)
        b_field_progress = smoothstep(250, 305, f)
        current_active = smoothstep(285, 335, f)
        lorentz_progress = smoothstep(380, 425, f)

        polarity = 1 if (theta_deg < 180.0) else -1
        dist_to_switch = min(
            abs(theta_deg - 0.0),
            abs(theta_deg - 180.0),
            abs(theta_deg - 360.0),
        )
        commutation_flash = clamp(1.0 - dist_to_switch / 16.0) * current_active
        torque_norm = abs(math.sin(theta_rad)) * current_active
        raw_ac_sin = math.sin(theta_rad) * current_active

        frames.append(
            {
                "frame": f,
                "time": round(t, 3),
                "act": scene,
                "rpm": round(rpm, 1),
                "theta_deg": round(theta_deg, 2),
                "casing_opacity": round(casing_opacity, 3),
                "internals_visibility": round(internals_visibility, 3),
                "b_field_progress": round(b_field_progress, 3),
                "current_active": round(current_active, 3),
                "lorentz_progress": round(lorentz_progress, 3),
                "polarity": polarity,
                "commutation_flash": round(commutation_flash, 3),
                "torque_norm": round(torque_norm, 3),
                "raw_ac_sin": round(raw_ac_sin, 3),
            }
        )
    return frames


def render_manim_oscilloscope_video(telemetry):
    """Renderiza el clip de Capa 1 (manim_torque_wave.webm) en estética de boceto sepia."""
    out_path = LAYERS_OUT / "manim_torque_wave.webm"
    container = av.open(str(out_path), mode="w")
    stream = container.add_stream("libvpx-vp9", rate=FPS)
    stream.width = WIDTH
    stream.height = HEIGHT
    stream.pix_fmt = "yuv420p"
    stream.options = {"crf": "26", "b:v": "0", "speed": "6"}

    try:
        font_title = ImageFont.truetype(str(FONTS_DIR / "Humor-Sans.ttf"), 32)
    except Exception:
        font_title = ImageFont.load_default()

    history_tau = []
    max_samples = 120

    for item in telemetry:
        f = item["frame"]
        img = Image.new("RGB", (WIDTH, HEIGHT), (255, 255, 255))
        history_tau.append(item["torque_norm"])
        if len(history_tau) > max_samples:
            history_tau.pop(0)

        # Solo se muestra durante la Escena 5 (frames 540 a 720) como cinta de pulso cinético inferior
        if 535 <= f <= 725:
            d = ImageDraw.Draw(img)
            ink_sepia = (58, 38, 20)
            ink_amber = (180, 83, 9)
            ox0, ox1 = 420, 1500
            oy = 940
            amp = 75
            d.line([(ox0, oy), (ox1, oy)], fill=(140, 109, 70), width=3)
            pts = []
            for idx, val in enumerate(history_tau):
                x = ox0 + (idx / max(1, max_samples - 1)) * (ox1 - ox0)
                y = oy - val * amp
                pts.append((x, y))
            if len(pts) >= 2:
                d.line(pts, fill=ink_amber, width=6, joint="curve")
            d.text((ox0, oy - 115), "PULSO DE TORQUE RECTIFICADO τ(θ) = |sin(θ)|", fill=ink_sepia, font=font_title)

        av_frame = av.VideoFrame.from_image(img)
        for packet in stream.encode(av_frame):
            container.mux(packet)

    for packet in stream.encode():
        container.mux(packet)
    container.close()
    print(f"✅ Capa 1 (Manim sepia wave) generada en: {out_path}")


def generate_dopaminergic_audio(telemetry):
    """Genera una pista de audio dopaminérgica con:
    - Whooshes de transición de cámara en cada cambio de escena
    - Impactos sub-bass ('thuds') sincronizados con la aparición de piezas y vectores F
    - Trazos rápidos y rítmicos de lápiz/carboncillo sobre papel
    - Chispazos eléctricos brillantes en cada conmutación de 180°
    - Aceleración armónica del motor
    """
    sample_rate = 44100
    total_samples = sample_rate * DURATION_SEC
    t = np.linspace(0, DURATION_SEC, total_samples, endpoint=False)

    frame_times = np.array([item["time"] for item in telemetry])
    rpms = np.interp(t, frame_times, [item["rpm"] for item in telemetry])
    currents = np.interp(t, frame_times, [item["current_active"] for item in telemetry])
    flashes = np.interp(t, frame_times, [item["commutation_flash"] for item in telemetry])

    rng = np.random.default_rng(101)
    white = rng.normal(0, 1.0, total_samples)
    pencil_noise = np.convolve(white, np.ones(12) / 12.0, mode="same")
    whoosh_noise = np.convolve(white, np.ones(45) / 45.0, mode="same")

    # 1. Whooshes de transición cinematográfica de cámara (en t = 0.1, 4.0, 8.0, 12.5, 18.0, 24.0s)
    whoosh_times = [0.15, 4.0, 8.0, 12.5, 18.0, 24.0]
    whoosh_env = np.zeros_like(t)
    for wt in whoosh_times:
        whoosh_env += np.exp(-((t - wt) ** 2) / 0.035)
    whoosh_sfx = whoosh_noise * np.clip(whoosh_env, 0.0, 1.0) * 0.24

    # 2. Impactos Sub-Bass ('Thuds' dopaminérgicos al encender, clavar imanes N/S, estallar F y reconstruir)
    impact_times = [1.25, 4.35, 5.1, 5.8, 8.4, 12.8, 13.4, 18.1, 24.3, 25.4, 26.5]
    impact_sfx = np.zeros_like(t)
    for it in impact_times:
        dt = np.maximum(0.0, t - it)
        mask = (t >= it) & (t < it + 0.45)
        freq_drop = 115.0 * np.exp(-dt * 14.0) + 38.0
        env = np.exp(-dt * 9.5) * mask
        impact_sfx += env * np.sin(2.0 * np.pi * freq_drop * dt) * 0.26

    # 3. Trazos rápidos de carboncillo/lápiz sobre papel pergamino
    sketch_bursts = (
        np.exp(-((t - 0.6) ** 2) / 0.35)
        + np.exp(-((t - 4.8) ** 2) / 0.65)
        + np.exp(-((t - 8.8) ** 2) / 0.55)
        + np.exp(-((t - 13.2) ** 2) / 0.45)
        + np.exp(-((t - 24.8) ** 2) / 0.55)
    )
    cadence = 0.5 + 0.5 * np.sin(2.0 * np.pi * 11.0 * t)
    pencil_sfx = pencil_noise * np.clip(sketch_bursts * cadence, 0.0, 1.0) * 0.14

    # 4. Giro armónico del motor + pulso rítmico dopaminérgico (128 BPM = 2.133 Hz)
    freq_motor = 60.0 + (rpms / 3000.0) * 175.0
    phase_motor = 2.0 * np.pi * np.cumsum(freq_motor) / sample_rate
    motor_amp = np.clip(rpms / 3000.0, 0.0, 1.0) * 0.13
    motor_sfx = motor_amp * (
        0.6 * np.sin(phase_motor)
        + 0.28 * np.sin(2.0 * phase_motor)
        + 0.12 * np.sin(4.0 * phase_motor)
    )

    # Pulso rítmico sutil de fondo para mantener energía constante
    beat_pulse = (0.5 + 0.5 * np.sin(2.0 * np.pi * 2.2 * t)) ** 4
    rhythm_bass = beat_pulse * np.sin(2.0 * np.pi * 55.0 * t) * 0.07

    # 5. Chispazos eléctricos de conmutación cada 180° y zumbido electromagnético
    spark_crackle = flashes * (white * 0.11 + np.sin(2.0 * np.pi * 880.0 * t) * 0.06)
    em_chord = currents * 0.065 * (
        np.sin(2.0 * np.pi * 146.83 * t)  # D3
        + 0.7 * np.sin(2.0 * np.pi * 220.0 * t)  # A3
        + 0.5 * np.sin(2.0 * np.pi * 293.66 * t)  # D4
    )

    mix = whoosh_sfx + impact_sfx + pencil_sfx + motor_sfx + rhythm_bass + spark_crackle + em_chord

    fade_in = np.clip(t / 0.2, 0.0, 1.0)
    fade_out = np.clip((DURATION_SEC - t) / 0.5, 0.0, 1.0)
    mix = np.clip(mix * fade_in * fade_out, -0.96, 0.96)

    left = (mix * 32767).astype(np.int16)
    right = (np.roll(mix, 18) * 32767).astype(np.int16)
    stereo = np.column_stack((left, right)).ravel()

    wav_path = AUDIO_OUT / "whiteboard_motor_sfx.wav"
    with wave.open(str(wav_path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(stereo.tobytes())

    print(f"✅ Audio dopaminérgico v2.0 generado en: {wav_path}")


def main():
    os.makedirs(LAYERS_OUT, exist_ok=True)
    os.makedirs(AUDIO_OUT, exist_ok=True)

    telemetry = compute_telemetry()
    telemetry_path = LAYERS_OUT / "manim_physics_telemetry.json"
    with open(telemetry_path, "w", encoding="utf-8") as f:
        json.dump(telemetry, f, indent=2)
    print(f"✅ Telemetría v2.0 exportada en: {telemetry_path}")

    render_manim_oscilloscope_video(telemetry)
    generate_dopaminergic_audio(telemetry)


if __name__ == "__main__":
    main()
