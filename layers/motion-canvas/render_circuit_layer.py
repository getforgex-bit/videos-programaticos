#!/usr/bin/env python3
"""
Exportador de Capa 2 (Motion Canvas Vector Circuit & Commutator Layer)
Proyecto: Idea A — El motor invisible | Estilo 2 — Whiteboard / Dibujo a mano

Produce:
- layers/remotion/public/layers/motion_canvas_circuit.webm
  (Diagrama esquemático dibujado progresivamente en la esquina inferior izquierda x: 55..605, y: 595..985:
   Fuente DC, interruptor que se cierra en Acto III, escobillas de carbón, delgas del colector girando
   a θ(t) e inversión automática del sentido de la corriente cada 180°).
"""

import json
import math
from pathlib import Path

import av
from PIL import Image, ImageDraw, ImageFont

FPS = 30
WIDTH = 1920
HEIGHT = 1080

REPO_ROOT = Path(__file__).resolve().parents[2]
LAYERS_OUT = REPO_ROOT / "layers" / "remotion" / "public" / "layers"
FONTS_DIR = REPO_ROOT / "layers" / "remotion" / "public" / "fonts"


def clamp(val: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, val))


def smoothstep(edge0: float, edge1: float, x: float) -> float:
    t = clamp((x - edge0) / max(1e-6, (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)


def draw_progressive_sketch_line(draw, p1, p2, color, width=3, progress=1.0, seed=0):
    if progress <= 0.01:
        return
    x1, y1 = p1
    x2 = x1 + (p2[0] - x1) * clamp(progress)
    y2 = y1 + (p2[1] - y1) * clamp(progress)
    dist = math.hypot(x2 - x1, y2 - y1)
    steps = max(2, int(dist / 10))
    pts = []
    for i in range(steps + 1):
        u = i / steps
        wobble = math.sin(u * math.pi) * 1.2 * math.sin(u * 17.0 + seed)
        nx = -(y2 - y1) / max(1e-6, dist)
        ny = (x2 - x1) / max(1e-6, dist)
        pts.append((x1 + (x2 - x1) * u + nx * wobble, y1 + (y2 - y1) * u + ny * wobble))
    draw.line(pts, fill=color, width=width, joint="curve")


def main():
    telemetry_path = LAYERS_OUT / "manim_physics_telemetry.json"
    with open(telemetry_path, "r", encoding="utf-8") as f:
        telemetry = json.load(f)

    out_path = LAYERS_OUT / "motion_canvas_circuit.webm"
    container = av.open(str(out_path), mode="w")
    stream = container.add_stream("libvpx-vp9", rate=FPS)
    stream.width = WIDTH
    stream.height = HEIGHT
    stream.pix_fmt = "yuv420p"
    stream.options = {"crf": "24", "b:v": "0", "speed": "4"}

    try:
        font_title = ImageFont.truetype(str(FONTS_DIR / "Humor-Sans.ttf"), 24)
        font_label = ImageFont.truetype(str(FONTS_DIR / "ComicNeue-Bold.otf"), 19)
        font_small = ImageFont.truetype(str(FONTS_DIR / "ComicNeue-Regular.otf"), 17)
    except Exception:
        font_title = ImageFont.load_default()
        font_label = ImageFont.load_default()
        font_small = ImageFont.load_default()

    px0, py0, px1, py1 = 55, 595, 605, 985
    pw = px1 - px0
    ph = py1 - py0

    ink_dark = (24, 26, 31)
    ink_gray = (130, 140, 155)
    ink_red = (220, 38, 38)
    ink_blue = (29, 78, 216)
    ink_amber = (217, 119, 6)
    ink_emerald = (5, 150, 105)

    for item in telemetry:
        f = item["frame"]
        img = Image.new("RGB", (WIDTH, HEIGHT), (255, 255, 255))

        # El esquema del circuito y colector comienza a trazarse en Acto II (frame 235)
        appear = smoothstep(235, 290, f)
        if appear <= 0.001:
            av_frame = av.VideoFrame.from_image(img)
            for packet in stream.encode(av_frame):
                container.mux(packet)
            continue

        panel = Image.new("RGB", (pw, ph), (255, 255, 255))
        d = ImageDraw.Draw(panel)

        # Marco dibujado progresivamente
        box_p = smoothstep(235, 275, f)
        draw_progressive_sketch_line(d, (12, 12), (pw - 12, 12), ink_dark, 3, box_p, 11)
        draw_progressive_sketch_line(d, (pw - 12, 12), (pw - 12, ph - 12), ink_dark, 3, box_p, 12)
        draw_progressive_sketch_line(d, (pw - 12, ph - 12), (12, ph - 12), ink_dark, 3, box_p, 13)
        draw_progressive_sketch_line(d, (12, ph - 12), (12, 12), ink_dark, 3, box_p, 14)

        d.text((26, 22), "CAPA 2 [MOTION CANVAS] · CIRCUITO DC", fill=ink_dark, font=font_title)

        # Estado del interruptor: Abierto en Acto II, se cierra en Acto III (frame 405..425)
        sw_close = smoothstep(405, 428, f)
        status_txt = "INTERRUPTOR CERRADO → FLUJO ACTIVO (I)" if sw_close > 0.7 else "ESQUEMA DE EXCITACIÓN Y COLECTOR"
        status_col = ink_red if sw_close > 0.7 else ink_gray
        d.text((26, 52), status_txt, fill=status_col, font=font_label)

        # Coordenadas del circuito esquemático a mano alzada
        # Fuente DC a la izquierda (x=85, y=205)
        bx, by = 85, 205
        wire_p = smoothstep(260, 325, f)

        # Cable superior (+) desde fuente pasando por interruptor hasta escobilla superior/izquierda
        draw_progressive_sketch_line(d, (bx, by - 25), (bx, 112), ink_red, 3, wire_p, 21)
        draw_progressive_sketch_line(d, (bx, 112), (185, 112), ink_red, 3, wire_p, 22)

        # Interruptor de cuchilla (x=185 a 245, y=112)
        sw_angle = (1.0 - sw_close) * 0.48
        sw_x2 = 185 + 60 * math.cos(sw_angle)
        sw_y2 = 112 - 60 * math.sin(sw_angle)
        draw_progressive_sketch_line(d, (185, 112), (sw_x2, sw_y2), ink_red, 4, wire_p, 23)
        d.ellipse([181, 108, 189, 116], fill=ink_dark)
        d.ellipse([241, 108, 249, 116], fill=ink_dark)
        d.text((192, 82), "SW1", fill=ink_dark, font=font_small)

        # Continuación cable (+) hasta escobilla izquierda del colector
        cx, cy = 370, 205  # Centro del conmutador de delgas
        comm_r = 66
        draw_progressive_sketch_line(d, (245, 112), (cx - comm_r - 18, 112), ink_red, 3, wire_p, 24)
        draw_progressive_sketch_line(d, (cx - comm_r - 18, 112), (cx - comm_r - 18, cy), ink_red, 3, wire_p, 25)

        # Cable inferior (-) desde fuente hasta escobilla derecha del colector
        draw_progressive_sketch_line(d, (bx, by + 25), (bx, 305), ink_blue, 3, wire_p, 26)
        draw_progressive_sketch_line(d, (bx, 305), (cx + comm_r + 18, 305), ink_blue, 3, wire_p, 27)
        draw_progressive_sketch_line(d, (cx + comm_r + 18, 305), (cx + comm_r + 18, cy), ink_blue, 3, wire_p, 28)

        # Símbolo de Batería / Fuente DC en (bx, by)
        if wire_p > 0.2:
            d.line([(bx - 22, by - 12), (bx + 22, by - 12)], fill=ink_red, width=4)
            d.line([(bx - 12, by + 2), (bx + 12, by + 2)], fill=ink_dark, width=3)
            d.line([(bx - 22, by + 14), (bx + 22, by + 14)], fill=ink_red, width=4)
            d.line([(bx - 12, by + 26), (bx + 12, by + 26)], fill=ink_blue, width=3)
            d.text((bx - 64, by - 28), "+V", fill=ink_red, font=font_label)
            d.text((bx - 64, by + 10), "-V", fill=ink_blue, font=font_label)

        # Dibujo del Conmutador de Delgas (C1 y C2) y Escobillas (B1, B2)
        if wire_p > 0.45:
            # Escobillas fijas de carbón (izquierda B+ y derecha B-)
            d.rectangle([cx - comm_r - 24, cy - 16, cx - comm_r - 4, cy + 16], fill=(55, 65, 81), outline=ink_dark, width=2)
            d.rectangle([cx + comm_r + 4, cy - 16, cx + comm_r + 24, cy + 16], fill=(55, 65, 81), outline=ink_dark, width=2)
            d.text((cx - comm_r - 58, cy - 10), "B+", fill=ink_red, font=font_label)
            d.text((cx + comm_r + 30, cy - 10), "B-", fill=ink_blue, font=font_label)

            # Anillo partido giratorio (Delga A y Delga B rotando con theta_deg)
            theta = item["theta_deg"]
            bbox = [cx - comm_r, cy - comm_r, cx + comm_r, cy + comm_r]
            # Delga 1 (160° de extensión)
            a1 = (theta - 80) % 360
            d.arc(bbox, start=a1, end=a1 + 160, fill=ink_amber, width=10)
            # Delga 2 (opuesta)
            a2 = (theta + 100) % 360
            d.arc(bbox, start=a2, end=a2 + 160, fill=(180, 83, 9), width=10)

            # Vector de espira interior rotando con el colector
            rad = math.radians(theta)
            rx = math.cos(rad) * (comm_r - 18)
            ry = math.sin(rad) * (comm_r - 18)
            d.line([(cx - rx, cy - ry), (cx + rx, cy + ry)], fill=ink_dark, width=4)

            # Conductores A y B de la espira (símbolos ⊙ saliendo y ⊗ entrando)
            c1x, c1y = cx - rx, cy - ry
            c2x, c2y = cx + rx, cy + ry
            d.ellipse([c1x - 11, c1y - 11, c1x + 11, c1y + 11], fill=(254, 243, 199), outline=ink_red, width=3)
            d.ellipse([c2x - 11, c2y - 11, c2x + 11, c2y + 11], fill=(219, 234, 254), outline=ink_blue, width=3)

            # Destello de conmutación a los 180°
            if item["commutation_flash"] > 0.35:
                fl_r = int(10 + 10 * item["commutation_flash"])
                d.ellipse([cx - comm_r - 6 - fl_r, cy - fl_r, cx - comm_r - 6 + fl_r, cy + fl_r], outline=ink_amber, width=3)
                d.ellipse([cx + comm_r + 6 - fl_r, cy - fl_r, cx + comm_r + 6 + fl_r, cy + fl_r], outline=ink_amber, width=3)

        # Animación de partículas de corriente (I) cuando el interruptor está cerrado
        if item["current_active"] > 0.05:
            phase = (f * 0.08) % 1.0
            # Puntos rojos avanzando por la rama superior (+)
            for k in range(4):
                u = (phase + k * 0.25) % 1.0
                px = bx + u * (cx - comm_r - 18 - bx)
                d.ellipse([px - 5, 112 - 5, px + 5, 112 + 5], fill=ink_red)
            # Puntos azules regresando por la rama inferior (-)
            for k in range(4):
                u = (phase + k * 0.25) % 1.0
                px = (cx + comm_r + 18) - u * (cx + comm_r + 18 - bx)
                d.ellipse([px - 5, 305 - 5, px + 5, 305 + 5], fill=ink_blue)

        # Pie del módulo
        by_foot = ph - 52
        d.line([(24, by_foot - 10), (pw - 24, by_foot - 10)], fill=(220, 224, 230), width=2)
        d.text((26, by_foot), "Escobillas B+/B- fijas → Delgas invierten I cada 180°", fill=ink_emerald, font=font_label)

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
    print(f"✅ Capa 2 (Motion Canvas circuit video) generada en: {out_path}")


if __name__ == "__main__":
    main()
