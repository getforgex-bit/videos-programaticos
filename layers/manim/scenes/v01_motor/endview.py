"""Vista frontal (2D) del motor: donde se explica la física.

Convenciones (mismas que model.py):
  - Campo B vertical, de N (arriba) a S (abajo).
  - θ = ángulo del lado A de la bobina; giro horario = θ decreciente.
  - Con conmutador: el lado que está arriba siempre lleva corriente "saliendo"
    (⊙) → fuerza hacia +x; el de abajo "entrando" (⊗) → fuerza hacia −x.
    F = I·L × B  con B = −ŷ:  ẑ × (−ŷ) = +x̂ ;  (−ẑ) × (−ŷ) = −x̂.
"""
from __future__ import annotations

import math

import numpy as np

from common.sketch import (BLUE, GREEN, INK, ORANGE, PENCIL, RED, Drawing,
                           Stroke, _seed_from, arrow_head, harrow, hatch,
                           hcircle, hline, hpath, wobble)

TAU = 2 * math.pi


def P(c, r, a):
    return np.array([c[0] + r * math.cos(a), c[1] + r * math.sin(a), 0.0])


class EndView:
    def __init__(self, center=(-3.3, 0.3), R=2.7, W=5.5):
        self.c = np.array([center[0], center[1], 0.0])
        self.R = R
        self.W = W
        self.r_in, self.r_out = 1.92, 2.42
        self.r_side = 1.42      # radio de los lados de la bobina
        self.r_comm = 0.48      # radio del conmutador

    # ------------------------------------------------------------ estáticos
    def casing(self) -> Drawing:
        d = Drawing()
        d.add(hcircle(self.c, self.R, color=PENCIL, width=self.W * 0.75, seed=11,
                      dashed=True, dash=0.16, gap=0.11, overlap=0.0))
        d.add(hcircle(self.c, self.R * 0.93, color=PENCIL, width=self.W * 0.45,
                      seed=12, dashed=True, dash=0.1, gap=0.12, overlap=0.0,
                      opacity=0.7))
        return d

    def magnet(self, name) -> Drawing:
        top = name == "N"
        a0, a1 = (math.radians(46), math.radians(134)) if top else \
                 (math.radians(226), math.radians(314))
        col = RED if top else BLUE
        al = np.linspace(a0, a1, 60)
        outer = [P(self.c, self.r_out, a) for a in al]
        inner = [P(self.c, self.r_in, a) for a in al[::-1]]
        poly = np.array(outer + inner + [outer[0]])
        d = Drawing()
        d.add(Stroke(wobble(poly, amp=0.012, seed=_seed_from(("ev_mag", name))),
                     color=col, width=self.W))
        d.add(hatch(poly[:, :2], spacing=0.12, angle=62 if top else 118,
                    color=col, width=self.W * 0.5, seed=_seed_from(("evh", name)),
                    opacity=0.7, holes=[(self.magnet_label_pos(name), 0.3)]))
        return d

    def magnet_label_pos(self, name):
        a = math.radians(90 if name == "N" else 270)
        return P(self.c, (self.r_in + self.r_out) / 2, a)

    def field_xs(self):
        return [-1.12, -0.56, 0.0, 0.56, 1.12]

    def field_lines(self) -> Drawing:
        d = Drawing()
        for k, x in enumerate(self.field_xs()):
            y = math.sqrt(self.r_in ** 2 - x ** 2) - 0.06
            a = self.c + [x, y, 0]
            b = self.c + [x, -y, 0]
            d.add(hline(a, b, color=BLUE, width=self.W * 0.6, seed=300 + k,
                        amp=0.02, overshoot=0.0, opacity=0.75))
        return d

    def field_arrows(self, phase: float) -> Drawing:
        """Cabezas de flecha que "fluyen" de N a S (phase en [0,1))."""
        d = Drawing()
        for k, x in enumerate(self.field_xs()):
            y = math.sqrt(self.r_in ** 2 - x ** 2) - 0.25
            for j in range(3):
                f = (phase + j / 3 + k * 0.13) % 1.0
                yy = y - f * 2 * y
                fade = min(1.0, f / 0.12, (1 - f) / 0.12)
                tip = self.c + [x, yy, 0]
                for s in arrow_head(tip, [0, -1], color=BLUE,
                                    width=self.W * 0.6, head=0.17,
                                    seed=900 + k * 10 + j):
                    s.opacity = 0.85 * fade
                    d.add(s)
        return d

    def brushes(self) -> Drawing:
        d = Drawing()
        for k, sgn in enumerate((1, -1)):
            x0 = sgn * (self.r_comm + 0.03)
            x1 = sgn * (self.r_comm + 0.5)
            h = 0.17
            pts = [self.c + [x0, -h, 0], self.c + [x1, -h, 0],
                   self.c + [x1, h, 0], self.c + [x0, h, 0], self.c + [x0, -h, 0]]
            d.add(Stroke(wobble(np.array(pts), amp=0.004, seed=400 + k),
                         color=INK, width=self.W * 0.8))
            d.add(hatch(np.array(pts)[:-1, :2], spacing=0.07, angle=40,
                        color=INK, width=self.W * 0.35, seed=410 + k,
                        opacity=0.6))
            # cable hacia fuera de la carcasa
            xw = sgn * (self.R + 0.55)
            d.add(hline(self.c + [x1, 0, 0], self.c + [xw, 0, 0],
                        color=RED if sgn < 0 else INK, width=self.W * 0.6,
                        seed=420 + k, amp=0.01))
        return d

    def brush_wire_end(self, sgn):
        return self.c + [sgn * (self.R + 0.85), 0, 0]

    # -------------------------------------------------------------- rotor
    def rotor(self, theta: float) -> Drawing:
        d = Drawing()
        c = self.c
        # eje
        d.add(hcircle(c, 0.13, color=INK, width=self.W * 0.7, seed=500,
                      amp=0.003))
        # conmutador: dos semianillos con ranuras alineadas con la bobina
        gap = math.radians(11)
        for k in range(2):
            a0 = theta + k * math.pi + gap
            a1 = theta + (k + 1) * math.pi - gap
            al = np.linspace(a0, a1, 50)
            outer = [P(c, self.r_comm, a) for a in al]
            inner = [P(c, self.r_comm - 0.16, a) for a in al[::-1]]
            poly = np.array(outer + inner + [outer[0]])
            d.add(Stroke(wobble(poly, amp=0.003, seed=510 + k), color=INK,
                         width=self.W * 0.7))
        # bobina vista de canto: brazo + conexiones
        for k, sgn in enumerate((1, -1)):
            u = np.array([math.cos(theta), math.sin(theta), 0]) * sgn
            d.add(Stroke(wobble(np.array([c + u * (self.r_comm + 0.12),
                                          c + u * (self.r_side - 0.31)]),
                                amp=0.004, seed=520 + k),
                         color=RED, width=self.W * 0.75))
        return d

    def side_pos(self, theta, which):
        sgn = 1 if which == "A" else -1
        return P(self.c, self.r_side, theta + (0 if sgn > 0 else math.pi))

    def coil_sides(self, theta, currents) -> Drawing:
        """currents: dict A/B → +1 (⊙ saliendo) o −1 (⊗ entrando)."""
        d = Drawing()
        for which in ("A", "B"):
            p = self.side_pos(theta, which)
            d.add(hcircle(p, 0.3, color=RED, width=self.W * 0.9,
                          seed=600 + (which == "B"), amp=0.006, start=theta))
        return d

    def current_symbols(self, theta, currents, size=1.0) -> Drawing:
        d = Drawing()
        for which in ("A", "B"):
            p = self.side_pos(theta, which)
            if currents[which] > 0:   # ⊙
                d.add(hcircle(p, 0.065 * size, color=RED, width=self.W * 1.5,
                              seed=610, amp=0.0, overlap=0.4))
            else:                     # ⊗
                r = 0.17 * size
                d.add(hline(p + [-r, -r, 0], p + [r, r, 0], color=RED,
                            width=self.W * 0.85, seed=620, amp=0.003,
                            overshoot=0.0))
                d.add(hline(p + [-r, r, 0], p + [r, -r, 0], color=RED,
                            width=self.W * 0.85, seed=621, amp=0.003,
                            overshoot=0.0))
        return d

    def forces(self, theta, currents, length=1.05) -> Drawing:
        d = Drawing()
        for k, which in enumerate(("A", "B")):
            p = self.side_pos(theta, which)
            sgn = 1 if currents[which] > 0 else -1
            a = p + [sgn * 0.36, 0, 0]
            b = p + [sgn * (0.36 + length), 0, 0]
            d.add(harrow(a, b, color=GREEN, width=self.W * 1.05, head=0.3,
                         seed=700 + k, amp=0.006))
        return d

    def force_label_pos(self, theta, currents, which):
        p = self.side_pos(theta, which)
        sgn = 1 if currents[which] > 0 else -1
        return p + [sgn * 1.0, 0.32, 0]

    def rotation_arrow(self) -> Drawing:
        """Flecha curva horaria fuera de la carcasa (arriba a la derecha)."""
        r = self.R + 0.42
        al = np.linspace(math.radians(78), math.radians(18), 50)
        pts = np.array([P(self.c, r, a) for a in al])
        d = Drawing()
        d.add(Stroke(wobble(pts, amp=0.01, seed=800), color=ORANGE,
                     width=self.W * 1.05))
        tang = pts[-1] - pts[-4]
        d.add(arrow_head(pts[-1], tang, color=ORANGE, width=self.W * 1.05,
                         head=0.34, seed=810))
        return d


# --------------------------------------------------------------- gráfica
class TorqueGraph:
    """Par (empuje de giro) vs. ángulo girado, dibujado a mano."""

    def __init__(self, origin=(1.0, -1.6), w=5.5, h=1.15, turns=2.0, W=5.5):
        self.o = np.array([origin[0], origin[1], 0.0])
        self.w, self.h, self.turns, self.W = w, h, turns, W

    def xy(self, phi, val):
        return self.o + [self.w * phi / (self.turns * TAU), self.h * val, 0]

    def axes(self) -> Drawing:
        d = Drawing()
        d.add(harrow(self.o + [-0.1, 0, 0], self.o + [self.w + 0.35, 0, 0],
                     color=INK, width=self.W * 0.7, head=0.2, seed=1000))
        d.add(harrow(self.o + [0, -self.h - 0.1, 0], self.o + [0, self.h + 0.35, 0],
                     color=INK, width=self.W * 0.7, head=0.2, seed=1003))
        # marcas de media vuelta
        for k in range(1, int(self.turns * 2) + 1):
            x = self.xy(k * math.pi, 0)
            d.add(hline(x + [0, -0.08, 0], x + [0, 0.08, 0], color=INK,
                        width=self.W * 0.5, seed=1010 + k, amp=0.0,
                        overshoot=0.0))
        return d

    def curve(self, theta0, phi_max, rectified=True) -> "Stroke | None":
        if phi_max <= 1e-3:
            return None
        phis = np.linspace(0, phi_max, max(3, int(160 * phi_max / (self.turns * TAU))))
        vals = np.sin(theta0 - phis)
        if rectified:
            vals = np.abs(vals)
        else:
            # sin conmutador la corriente no cambia: el par conserva el signo
            # inicial y se vuelve negativo (frena) tras media vuelta
            vals = vals * np.sign(math.sin(theta0 - 0.35) or 1.0)
        pts = np.array([self.xy(f, v) for f, v in zip(phis, vals)])
        return Stroke(wobble(pts, amp=0.008, seed=1100 + rectified),
                      color=GREEN if rectified else PENCIL,
                      width=self.W * (0.95 if rectified else 0.7),
                      dashed=not rectified, dash=0.12, gap=0.09)
