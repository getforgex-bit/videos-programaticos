#!/usr/bin/env python3
"""
Generador de Capa 1 (Manim / Física Matemática y Audio Procedural)
Proyecto: Idea A — El motor invisible | Estilo 2 — Whiteboard / Dibujo a mano

Produce:
1. layers/remotion/public/layers/manim_torque_wave.webm
   (Osciloscopio científico dibujado a mano de Torque Rectificado tau(theta) = |sin(theta)|
    y Corriente Conmutada I(theta), sincronizado frame a frame con el ángulo del rotor)
2. layers/remotion/public/layers/manim_physics_telemetry.json
   (Telemetría cinemática y electromagnética exacta para los 900 frames @ 30fps)
3. layers/remotion/public/audio/whiteboard_motor_sfx.wav
   (Diseño sonoro procedural: trazos de marcador en pizarrón, zumbido magnético,
    pulsos de conmutación cada 180° y giro mecánico del motor)
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
    """Calcula el estado físico del motor para cada uno de los 900 frames."""
    frames = []
    theta_deg = 25.0  # Ángulo inicial de la espira

    for f in range(TOTAL_FRAMES):
        t = f / FPS

        # Acto actual (1 a 5)
        if f < 180:
            act = 1
        elif f < 360:
            act = 2
        elif f < 570:
            act = 3
        elif f < 720:
            act = 4
        else:
            act = 5

        # RPM y velocidad angular según la narrativa:
        # Acto I (0-6s): Se dibuja el motor (0-2.5s), luego arranca hasta 2800 RPM (2.5-6s)
        # Acto II (6-12s): Carcasa se vuelve transparente, motor desacelera a cámara lenta (600 RPM) para inspeccionar piezas
        # Acto III (12-19s): Pausa/cámara ultra-lenta al inicio para mostrar B, I y Fuerza de Lorentz, luego acelera al empujar el par
        # Acto IV (19-24s): Demostración clara de conmutación cada 180° acelerando de 1200 a 3000 RPM
        # Acto V (24-30s): Motor a régimen nominal 3000 RPM mientras la carcasa se reconstruye
        if f < 75:
            rpm = 0.0
        elif f < 180:
            rpm = 2800.0 * smoothstep(75, 135, f)
        elif f < 360:
            rpm = 2800.0 - 2350.0 * smoothstep(180, 240, f)  # Baja a 450 RPM
        elif f < 435:
            rpm = 450.0 * (1.0 - 0.75 * smoothstep(360, 395, f))  # Cámara lenta ~112 RPM
        elif f < 570:
            rpm = 112.0 + 1100.0 * smoothstep(435, 550, f)  # Sube a ~1212 RPM
        elif f < 720:
            rpm = 1212.0 + 1788.0 * smoothstep(580, 700, f)  # Sube a 3000 RPM
        else:
            rpm = 3000.0

        # Avance angular visual (escalado para que la rotación sea cinematográficamente legible a 30fps)
        deg_per_frame = (rpm / 3000.0) * 11.5
        theta_deg = (theta_deg + deg_per_frame) % 360.0
        theta_rad = math.radians(theta_deg)

        # Opacidad de la carcasa exterior:
        # Acto I: Se dibuja y es sólida (1.0)
        # Acto II: Se vuelve transparente modo Rayos X (0.18)
        # Acto III-IV: Permanece transparente (0.14)
        # Acto V: Se reconstruye sólidamente (1.0) dejando ventana de memoria
        if f < 180:
            casing_opacity = smoothstep(10, 80, f)
        elif f < 360:
            casing_opacity = 1.0 - 0.82 * smoothstep(190, 260, f)
        elif f < 720:
            casing_opacity = 0.18 - 0.04 * smoothstep(360, 400, f)
        else:
            casing_opacity = 0.14 + 0.86 * smoothstep(735, 835, f)

        # Visibilidad de componentes internos (Estator, Rotor, Colector)
        internals_draw = smoothstep(210, 330, f)
        # En Acto V quedan parcialmente visibles a través del corte de sección (0.65)
        if f >= 740:
            internals_visibility = 1.0 - 0.35 * smoothstep(750, 845, f)
        else:
            internals_visibility = internals_draw

        # Campo magnético B (Acto III en adelante)
        b_field_progress = smoothstep(365, 425, f)

        # Corriente eléctrica I (Acto III en adelante)
        current_active = smoothstep(415, 465, f)

        # Vectores de Fuerza de Lorentz F y Torque (Acto III en adelante)
        lorentz_progress = smoothstep(455, 510, f)

        # Polaridad del conmutador (+1 cuando 0 <= theta < 180, -1 cuando 180 <= theta < 360)
        polarity = 1 if (theta_deg < 180.0) else -1
        # Chispa/evento de conmutación cerca de 0° o 180°
        dist_to_switch = min(
            abs(theta_deg - 0.0),
            abs(theta_deg - 180.0),
            abs(theta_deg - 360.0),
        )
        commutation_flash = clamp(1.0 - dist_to_switch / 14.0) * current_active

        # Magnitud física instantánea del torque rectificado: |sin(theta)|
        # Con un pequeño piso por devanado multipolar para realismo visual
        torque_norm = abs(math.sin(theta_rad)) * current_active
        raw_ac_sin = math.sin(theta_rad) * current_active

        frames.append(
            {
                "frame": f,
                "time": round(t, 3),
                "act": act,
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


def draw_sketch_line(draw: ImageDraw.ImageDraw, p1, p2, color, width=3, seed=0):
    """Dibuja una línea con ligero temblor orgánico de marcador a mano alzada."""
    x1, y1 = p1
    x2, y2 = p2
    dist = math.hypot(x2 - x1, y2 - y1)
    steps = max(2, int(dist / 12))
    pts = []
    for i in range(steps + 1):
        u = i / steps
        # Perturbación determinista suave que se anula en los extremos
        wobble = math.sin(u * math.pi) * 1.3 * math.sin(u * 19.0 + seed)
        nx = -(y2 - y1) / max(1e-6, dist)
        ny = (x2 - x1) / max(1e-6, dist)
        px = x1 + (x2 - x1) * u + nx * wobble
        py = y1 + (y2 - y1) * u + ny * wobble
        pts.append((px, py))
    draw.line(pts, fill=color, width=width, joint="curve")


def render_manim_oscilloscope_video(telemetry):
    """Renderiza el clip de Capa 1 (manim_torque_wave.webm) con fondo blanco #FFFFFF
    para integrarse con mix-blend-mode: multiply sobre el pizarrón en Remotion.
    El panel del osciloscopio se ubica en la esquina inferior derecha (x: 1320..1865, y: 585..995).
    """
    out_path = LAYERS_OUT / "manim_torque_wave.webm"
    container = av.open(str(out_path), mode="w")
    stream = container.add_stream("libvpx-vp9", rate=FPS)
    stream.width = WIDTH
    stream.height = HEIGHT
    stream.pix_fmt = "yuv420p"
    stream.options = {"crf": "24", "b:v": "0", "speed": "4"}

    try:
        font_title = ImageFont.truetype(str(FONTS_DIR / "Humor-Sans.ttf"), 24)
        font_label = ImageFont.truetype(str(FONTS_DIR / "ComicNeue-Bold.otf"), 19)
        font_math = ImageFont.truetype(str(FONTS_DIR / "ComicNeue-Regular.otf"), 17)
    except Exception:
        font_title = ImageFont.load_default()
        font_label = ImageFont.load_default()
        font_math = ImageFont.load_default()

    # Coordenadas del panel científico en 1920x1080
    px0, py0, px1, py1 = 1315, 595, 1865, 985
    pw = px1 - px0
    ph = py1 - py0

    # Historial de muestras para la onda del osciloscopio
    history_tau = []
    history_ac = []
    history_flip = []
    max_samples = 145

    for item in telemetry:
        f = item["frame"]
        img = Image.new("RGB", (WIDTH, HEIGHT), (255, 255, 255))

        # El osciloscopio empieza a dibujarse en el Acto III (frame 375)
        appear = smoothstep(375, 430, f)
        if appear <= 0.001:
            av_frame = av.VideoFrame.from_image(img)
            for packet in stream.encode(av_frame):
                container.mux(packet)
            continue

        history_tau.append(item["torque_norm"])
        history_ac.append(item["raw_ac_sin"])
        history_flip.append(item["commutation_flash"])
        if len(history_tau) > max_samples:
            history_tau.pop(0)
            history_ac.pop(0)
            history_flip.pop(0)

        # Dibujamos sobre un lienzo local del panel para eficiencia y nitidez
        panel = Image.new("RGB", (pw, ph), (255, 255, 255))
        d = ImageDraw.Draw(panel)

        # Marco dibujado a mano del módulo Manim (Capa 1)
        ink_dark = (24, 26, 31)
        ink_gray = (130, 140, 155)
        ink_emerald = (5, 150, 105)
        ink_amber = (217, 119, 6)
        ink_red = (220, 38, 38)
        ink_blue = (29, 78, 216)

        # Trazo progresivo de la caja del osciloscopio
        draw_sketch_line(d, (12, 12), (pw - 12, 12), ink_dark, 3, seed=1)
        draw_sketch_line(d, (pw - 12, 12), (pw - 12, ph - 12), ink_dark, 3, seed=2)
        draw_sketch_line(d, (pw - 12, ph - 12), (12, ph - 12), ink_dark, 3, seed=3)
        draw_sketch_line(d, (12, ph - 12), (12, 12), ink_dark, 3, seed=4)

        # Encabezado de Capa 1 (Manim)
        d.text((26, 22), "CAPA 1 [MANIM] · CURVA DE PAR MOTOR", fill=ink_dark, font=font_title)
        d.text(
            (26, 52),
            "τ(θ) = N·I·A·B · |sin(θ)|   [Rectificado por Colector]",
            fill=ink_emerald,
            font=font_label,
        )

        # Ejes del osciloscopio
        ox0, oy_mid = 58, 215
        ox1 = pw - 32
        amp_y = 92

        # Líneas guía horizontales punteadas (τ_max, 0, -τ_max)
        for gx in range(ox0, ox1, 18):
            d.line([(gx, oy_mid - amp_y), (min(gx + 9, ox1), oy_mid - amp_y)], fill=(205, 213, 224), width=1)
            d.line([(gx, oy_mid + amp_y), (min(gx + 9, ox1), oy_mid + amp_y)], fill=(205, 213, 224), width=1)

        # Eje horizontal (tiempo / ángulo θ) y eje vertical (Torque τ)
        draw_sketch_line(d, (ox0, oy_mid), (ox1, oy_mid), ink_gray, 2, seed=7)
        draw_sketch_line(d, (ox0, oy_mid - amp_y - 20), (ox0, oy_mid + amp_y + 20), ink_dark, 3, seed=8)

        d.text((18, oy_mid - amp_y - 10), "+τ", fill=ink_emerald, font=font_label)
        d.text((22, oy_mid - 10), "0", fill=ink_gray, font=font_math)
        d.text((18, oy_mid + amp_y - 10), "-τ", fill=ink_gray, font=font_math)
        d.text((ox1 - 36, oy_mid + 8), "θ(t)", fill=ink_dark, font=font_math)

        # Curva fantasma sin conmutador (AC puro sin rectificar, gris punteado)
        if len(history_ac) >= 2:
            ac_pts = []
            for idx, val in enumerate(history_ac):
                x = ox0 + (idx / max(1, max_samples - 1)) * (ox1 - ox0)
                y = oy_mid - val * amp_y
                ac_pts.append((x, y))
            for idx in range(0, len(ac_pts) - 1, 2):
                d.line([ac_pts[idx], ac_pts[idx + 1]], fill=(160, 174, 192), width=2)

        # Curva principal de Torque Rectificado τ(θ) = |sin(θ)| en verde esmeralda
        if len(history_tau) >= 2:
            tau_pts = []
            for idx, val in enumerate(history_tau):
                x = ox0 + (idx / max(1, max_samples - 1)) * (ox1 - ox0)
                y = oy_mid - val * amp_y
                tau_pts.append((x, y))

                # Marca de conmutación (180°) cuando el colector invierte la corriente
                if history_flip[idx] > 0.72 and idx % 4 == 0:
                    d.ellipse([x - 4, oy_mid - 4, x + 4, oy_mid + 4], outline=ink_amber, width=2)

            d.line(tau_pts, fill=ink_emerald, width=4, joint="curve")

            # Punto trazador activo (punta del marcador verde)
            lx, ly = tau_pts[-1]
            d.ellipse([lx - 7, ly - 7, lx + 7, ly + 7], fill=ink_emerald, outline=ink_dark, width=2)

        # Barra inferior de estado vectorial (Regla de la mano derecha: I x B = F)
        by = ph - 52
        d.line([(24, by - 10), (pw - 24, by - 10)], fill=(220, 224, 230), width=2)
        pol_str = "+I (Directa)" if item["polarity"] > 0 else "-I (Invertida 180°)"
        pol_color = ink_red if item["polarity"] > 0 else ink_amber
        d.text((26, by), f"Corriente Espira: {pol_str}", fill=pol_color, font=font_label)
        d.text(
            (305, by),
            f"θ = {int(item['theta_deg']):03d}°  |  Par: {item['torque_norm']*100:04.1f}%",
            fill=ink_blue,
            font=font_label,
        )

        # Si está apareciendo gradualmente, atenuamos hacia blanco
        if appear < 1.0:
            white_bg = Image.new("RGB", (pw, ph), (255, 255, 255))
            panel = Image.blend(white_bg, panel, appear)

        img.paste(panel, (px0, py0))

        av_frame = av.VideoFrame.from_image(img)
        for packet in stream.encode(av_frame):
            container.mux(packet)

    for packet in stream.encode():
        container.mux(packet)
    container.close()
    print(f"✅ Capa 1 (Manim video) generada en: {out_path}")


def generate_whiteboard_audio(telemetry):
    """Genera diseño sonoro procedural en WAV (44.1 kHz, 16-bit estéreo) sincronizado con los 5 actos:
    - Sonido de marcador dibujando en pizarrón (fricción filtrada suave en fases de dibujo)
    - Zumbido eléctrico suave al activarse la corriente (Acto III-V)
    - Pulsos de conmutación en las escobillas cada 180°
    - Giro mecánico armónico proporcional a las RPM del motor
    """
    sample_rate = 44100
    total_samples = sample_rate * DURATION_SEC
    t = np.linspace(0, DURATION_SEC, total_samples, endpoint=False)

    # Interpolamos variables de telemetría a frecuencia de audio
    frame_times = np.array([item["time"] for item in telemetry])
    rpms = np.interp(t, frame_times, [item["rpm"] for item in telemetry])
    currents = np.interp(t, frame_times, [item["current_active"] for item in telemetry])
    flashes = np.interp(t, frame_times, [item["commutation_flash"] for item in telemetry])

    # 1. Sonido de marcador sobre pizarrón (fases de trazado activo)
    rng = np.random.default_rng(42)
    raw_noise = rng.normal(0, 1.0, total_samples)
    # Filtro paso-banda simple por media móvil para textura de marcador de fieltro
    kernel = np.ones(18) / 18.0
    felt_noise = np.convolve(raw_noise, kernel, mode="same")

    # Ventanas donde el marcador dibuja intensamente:
    # Acto I (0.2-2.7s), Acto II (6.2-10.5s), Acto III (12.2-16.5s), Acto V (24.5-28.0s)
    draw_env = (
        np.exp(-((t - 1.4) ** 2) / 0.9) * (0.5 + 0.5 * np.sin(2 * np.pi * 6.5 * t))
        + np.exp(-((t - 8.4) ** 2) / 1.8) * (0.5 + 0.5 * np.sin(2 * np.pi * 5.5 * t))
        + np.exp(-((t - 14.2) ** 2) / 1.6) * (0.5 + 0.5 * np.sin(2 * np.pi * 7.0 * t))
        + np.exp(-((t - 26.2) ** 2) / 1.2) * (0.5 + 0.5 * np.sin(2 * np.pi * 6.0 * t))
    )
    marker_sound = felt_noise * np.clip(draw_env, 0.0, 1.0) * 0.09

    # 2. Giro mecánico del motor (frecuencia fundamental proporcional a RPM)
    freq_motor = 55.0 + (rpms / 3000.0) * 145.0
    phase_motor = 2.0 * np.pi * np.cumsum(freq_motor) / sample_rate
    motor_amp = np.clip(rpms / 3000.0, 0.0, 1.0) * 0.11
    motor_hum = motor_amp * (
        0.65 * np.sin(phase_motor)
        + 0.25 * np.sin(2.0 * phase_motor)
        + 0.10 * np.sin(3.0 * phase_motor)
    )

    # 3. Campo electromagnético y corriente DC (acorde cálido sutil en Actos III-V)
    em_drone = currents * 0.06 * (
        np.sin(2.0 * np.pi * 110.0 * t) + 0.5 * np.sin(2.0 * np.pi * 165.0 * t)
    )

    # 4. Chasquido sutil del conmutador cada 180°
    comm_click = flashes * felt_noise * 0.08

    # 5. Campanilla / acorde de revelación al volverse transparente (t=6.3s) y al reconstruir (t=24.5s)
    chime_reveal = np.exp(-np.maximum(0, t - 6.2) * 2.2) * (t >= 6.2) * 0.08 * np.sin(2 * np.pi * 528.0 * t)
    chime_rebuild = np.exp(-np.maximum(0, t - 24.4) * 2.0) * (t >= 24.4) * 0.08 * np.sin(2 * np.pi * 660.0 * t)

    mix = marker_sound + motor_hum + em_drone + comm_click + chime_reveal + chime_rebuild

    # Fade in / Fade out maestro
    fade_in = np.clip(t / 0.4, 0.0, 1.0)
    fade_out = np.clip((DURATION_SEC - t) / 0.6, 0.0, 1.0)
    mix = np.clip(mix * fade_in * fade_out, -0.95, 0.95)

    # Estéreo con ligera apertura espacial
    left = (mix * 32767).astype(np.int16)
    right = (np.roll(mix, 12) * 32767).astype(np.int16)
    stereo = np.column_stack((left, right)).ravel()

    wav_path = AUDIO_OUT / "whiteboard_motor_sfx.wav"
    with wave.open(str(wav_path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(stereo.tobytes())

    print(f"✅ Audio procedural generado en: {wav_path}")


def main():
    os.makedirs(LAYERS_OUT, exist_ok=True)
    os.makedirs(AUDIO_OUT, exist_ok=True)

    print("⚙️ Calculando telemetría física y electromagnética (900 frames)...")
    telemetry = compute_telemetry()

    telemetry_path = LAYERS_OUT / "manim_physics_telemetry.json"
    with open(telemetry_path, "w", encoding="utf-8") as f:
        json.dump(telemetry, f, indent=2)
    print(f"✅ Telemetría exportada en: {telemetry_path}")

    print("🎨 Renderizando Capa 1 (Manim osciloscopio científico en pizarrón)...")
    render_manim_oscilloscope_video(telemetry)

    print("🔊 Sintetizando pista de audio procedural whiteboard_motor_sfx.wav...")
    generate_whiteboard_audio(telemetry)


if __name__ == "__main__":
    main()
