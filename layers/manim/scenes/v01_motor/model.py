"""Modelo 3D de un motor DC de imanes permanentes, dibujado "a mano".

Coordenadas del modelo:
  - El eje del motor es X (frente = +X, donde está la hélice).
  - Vista frontal ("end view"): ángulo α medido en sentido antihorario desde
    la derecha de pantalla. E(α) = (0, sin α, -cos α).
    · Imanes arriba (N) y abajo (S)  → campo vertical.
    · Escobillas a izquierda/derecha → la corriente se invierte cuando los
      lados de la bobina pasan por la horizontal (posición de par cero).
  - θ = ángulo (en vista frontal) del lado "A" de la bobina.

Todo se proyecta con una cámara ortográfica (yaw/pitch) y se convierte en
trazos `Stroke` con semilla fija por pieza, de modo que el dibujo es estable
mientras las piezas giran o se desplazan.
"""
from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np

from common.sketch import (BLUE, FILL, FILL_DARK, INK, PENCIL, RED, SHADE,
                           Drawing, Fill, Stroke, _seed_from, hatch, hline,
                           hpath, wobble)

TAU = 2 * math.pi


def E(alpha):
    return np.array([0.0, math.sin(alpha), -math.cos(alpha)])


# ------------------------------------------------------------------ cámara
class Projector:
    def __init__(self, yaw_deg=-34, pitch_deg=19, scale=1.3, offset=(0.85, 0.12)):
        yaw, pitch = math.radians(yaw_deg), math.radians(pitch_deg)
        cy, sy = math.cos(yaw), math.sin(yaw)
        cp, sp = math.cos(pitch), math.sin(pitch)
        Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]])
        Rx = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]])
        self.R = Rx @ Ry
        self.scale = scale
        self.offset = np.array([offset[0], offset[1], 0.0])
        self.view = self.R.T @ np.array([0, 0, 1.0])  # hacia el espectador

    def __call__(self, P):
        P = np.atleast_2d(np.asarray(P, float))
        Q = P @ self.R.T
        out = np.zeros_like(Q)
        out[:, :2] = Q[:, :2] * self.scale
        return out + self.offset

    def pt(self, P):
        return self(P)[0]

    def silhouette_angles(self):
        v = self.view
        a = math.atan2(-v[2], v[1])  # E(α)·v = 0  →  sin α v_y - cos α v_z = 0
        # E(α)·v = sinα·vy - cosα·(-vz)... resolvemos numéricamente por robustez
        def f(al):
            return float(E(al) @ v)
        best = []
        grid = np.linspace(0, TAU, 721)
        vals = [f(g) for g in grid]
        for i in range(len(grid) - 1):
            if vals[i] == 0 or (vals[i] > 0) != (vals[i + 1] > 0):
                lo, hi = grid[i], grid[i + 1]
                for _ in range(40):
                    mid = (lo + hi) / 2
                    if (f(lo) > 0) == (f(mid) > 0):
                        lo = mid
                    else:
                        hi = mid
                best.append((lo + hi) / 2)
        return best[:2] if len(best) >= 2 else [a, a + math.pi]


# --------------------------------------------------------------- geometría
R_CASE = 1.5
X_FRONT, X_BACK = 1.55, -1.55
R_BELL, X_BELL = 1.18, -1.86
X_PROP = 2.72


def ring(x, r, a0=0.0, a1=TAU, n=120, center=(0, 0)):
    al = np.linspace(a0, a1, n)
    pts = np.zeros((n, 3))
    pts[:, 0] = x
    pts[:, 1] = center[0] + r * np.sin(al)
    pts[:, 2] = center[1] - r * np.cos(al)
    return pts


def facing_arcs(proj, x, r, visible=True, n=160):
    """Partes de un aro (borde de cilindro) que miran (o no) al espectador."""
    al = np.linspace(0, TAU, n, endpoint=False)
    vis = np.array([E(a) @ proj.view > 0 for a in al])
    if not visible:
        vis = ~vis
    # rotar para que el arreglo empiece en un cambio de estado
    if vis.all():
        return [ring(x, r, 0, TAU, n)]
    start = int(np.argmax(vis != np.roll(vis, 1)))
    al = np.roll(al, -start)
    vis = np.roll(vis, -start)
    arcs, cur = [], []
    for a, v in zip(al, vis):
        if v:
            cur.append(a)
        elif cur:
            arcs.append(cur)
            cur = []
    if cur:
        arcs.append(cur)
    out = []
    for arc in arcs:
        a0 = arc[0]
        a1 = arc[-1]
        if a1 < a0:
            a1 += TAU
        out.append(ring(x, r, a0, a1, max(8, len(arc))))
    return out


@dataclass
class MotorState:
    theta: float = math.pi / 2   # ángulo de la bobina (vista frontal)
    prop: float = 0.3            # ángulo de la hélice
    xray: float = 0.0            # 0 = carcasa sólida, 1 = transparente
    explode: float = 0.0         # 0 = ensamblado, 1 = despiezado
    shake: tuple = (0.0, 0.0)    # vibración en pantalla
    spin_blur: float = 0.0       # 0..1 intensidad de líneas de velocidad


class MotorModel:
    """Genera los `Drawing` de cada pieza para un estado dado."""

    def __init__(self, proj: Projector | None = None, width=5.5):
        self.proj = proj or Projector()
        self.W = width

    # utilidades -----------------------------------------------------------
    def _p(self, P, st: MotorState, offset3=(0, 0, 0)):
        pts = self.proj(np.asarray(P, float) + np.asarray(offset3, float))
        pts[:, 0] += st.shake[0]
        pts[:, 1] += st.shake[1]
        return pts

    def _s(self, P, st, key, color=INK, width=None, amp=0.018, offset3=(0, 0, 0),
           closed=False, **kw) -> Stroke:
        pts = self._p(P, st, offset3)
        return Stroke(wobble(pts, amp=amp, seed=_seed_from(key), closed=closed),
                      color=color, width=width or self.W, **kw)

    # explosión -------------------------------------------------------------
    @staticmethod
    def ease(e):
        return e

    def off_magnet(self, st, top=True):
        e = st.explode
        return (0, (1.35 if top else -1.35) * e, 0)

    def off_rotor(self, st):
        return (1.95 * st.explode, 0, 0)

    def off_brush(self, st, side):
        # side: +1 escobilla derecha (α=0 → -Z), -1 izquierda (α=π → +Z)
        return (-0.15 * st.explode, 0, -side * 0.95 * st.explode)

    # ---------------------------------------------------------- carcasa
    def casing(self, st: MotorState, hidden=False) -> Drawing:
        """Exterior del motor. hidden=True devuelve sólo las líneas ocultas
        (las que se ven al volverse transparente)."""
        p = self.proj
        d = Drawing()
        sil = p.silhouette_angles()
        if not hidden:
            # cuerpo: generatrices de silueta
            for i, a in enumerate(sil):
                d.add(self._s([E(a) * R_CASE + [X_BACK, 0, 0],
                               E(a) * R_CASE + [X_FRONT, 0, 0]], st,
                              ("body", i), amp=0.02))
            # aro trasero visible
            for i, arc in enumerate(facing_arcs(p, X_BACK, R_CASE)):
                d.add(self._s(arc, st, ("back", i)))
            # campana trasera (tapa de plástico): sólo su aro visible
            for i, arc in enumerate(facing_arcs(p, X_BELL, R_BELL)):
                d.add(self._s(arc, st, ("bellr", i), width=self.W * 0.85))
            # frente: aro + escalón + buje
            d.add(self._s(ring(X_FRONT, R_CASE, 0.4, 0.4 + TAU + 0.22), st,
                          "front"))
            d.add(self._s(ring(X_FRONT + 0.07, R_CASE * 0.86, 2.0, 2.0 + TAU + 0.15),
                          st, "front2", width=self.W * 0.7))
            d.add(self._s(ring(X_FRONT + 0.12, 0.36, 1.0, 1.0 + TAU + 0.2), st,
                          "boss", width=self.W * 0.8))
            # tornillos
            for k, a in enumerate((math.radians(35), math.radians(215))):
                c = E(a) * 0.98
                d.add(self._s(ring(X_FRONT + 0.08, 0.075, 0, TAU + 0.3, 30,
                                   center=(c[1], c[2])), st, ("screw", k),
                              width=self.W * 0.6, amp=0.004))
        else:
            for i, arc in enumerate(facing_arcs(p, X_BACK, R_CASE, visible=False)):
                d.add(self._s(arc, st, ("backh", i)))
            for i, arc in enumerate(facing_arcs(p, X_BELL, R_BELL, visible=False)):
                d.add(self._s(arc, st, ("bellh", i), width=self.W * 0.85))
        return d

    # ------------------------------------------------ volumen (estilo v2)
    def _visible_side(self, a_s):
        """Signo hacia el que la superficie mira al espectador desde la
        generatriz de silueta a_s."""
        return 1 if E(a_s + 0.3) @ self.proj.view > 0 else -1

    def body_fill(self, st, tone=FILL) -> Drawing:
        """Relleno plano del cilindro + cara frontal (más oscura)."""
        d = Drawing()
        pts = np.vstack([ring(X_BACK, R_CASE, 0, TAU, 72), ring(X_FRONT, R_CASE, 0, TAU, 72)])
        P = self._p(pts, st)
        hull = _convex_hull(P[:, :2])
        d.add(Fill(P[hull], color=tone, opacity=1.0, fade=0.4))
        front = self._p(ring(X_FRONT + 0.01, R_CASE, 0, TAU, 90), st)
        d.add(Fill(front, color=FILL_DARK, opacity=0.55, fade=0.3))
        return d

    def body_shade(self, st) -> Drawing:
        """Banda de sombra rayada en la parte baja del cilindro (y bajo la
        tapa frontal), como en una ilustración técnica a tinta."""
        d = Drawing()
        sil = self.proj.silhouette_angles()
        # la generatriz "de abajo" es la de menor y en pantalla
        ys = [self._p([E(a) * R_CASE], st)[0][1] for a in sil]
        a_s = sil[int(np.argmin(ys))]
        sg = self._visible_side(a_s)
        for k, (d0, d1, dens) in enumerate(((0.0, 0.55, 0.075), (0.55, 0.95, 0.13))):
            a0, a1 = a_s + sg * d0, a_s + sg * d1
            band = np.vstack([ring(X_BACK + 0.02, R_CASE, a0, a1, 24),
                              ring(X_FRONT - 0.02, R_CASE, a1, a0, 24)])
            poly = self._p(band, st)[:, :2]
            d.add(hatch(poly, spacing=dens, angle=-58, color=SHADE,
                        width=self.W * 0.42, seed=_seed_from(("bshade", k)),
                        opacity=0.7))
        # sombra en la cara frontal (media luna inferior)
        moon = np.vstack([ring(X_FRONT + 0.02, R_CASE * 0.97, math.radians(200), math.radians(330), 30),
                          ring(X_FRONT + 0.02, R_CASE * 0.86, math.radians(330), math.radians(200), 30)])
        d.add(hatch(self._p(moon, st)[:, :2], spacing=0.07, angle=-40, color=SHADE,
                    width=self.W * 0.38, seed=_seed_from("fshade"), opacity=0.65))
        return d

    def battery_fill(self, st) -> Drawing:
        d = Drawing()
        pts = np.vstack([self._bat_ring(self.BAT_H, self.BAT_R, 0, TAU, 48),
                         self._bat_ring(-self.BAT_H, self.BAT_R, 0, TAU, 48)])
        P = self._p(pts, st)
        hull = _convex_hull(P[:, :2])
        d.add(Fill(P[hull], color=FILL, opacity=1.0, fade=0.3))
        top = self._p(self._bat_ring(self.BAT_H, self.BAT_R, 0, TAU, 48), st)
        d.add(Fill(top, color=FILL_DARK, opacity=0.6, fade=0.2))
        # sombra lateral derecha
        v = self.proj.view
        a_s = math.atan2(-v[0], v[2])
        band = []
        for dy in (-self.BAT_H, self.BAT_H):
            al = np.linspace(a_s - 0.9, a_s, 12) if dy < 0 else np.linspace(a_s, a_s - 0.9, 12)
            for a in al:
                band.append(self.BAT + [self.BAT_R * math.cos(a), dy, self.BAT_R * math.sin(a)])
        poly = self._p(band, st)[:, :2]
        d.add(hatch(poly, spacing=0.07, angle=70, color=SHADE, width=self.W * 0.38,
                    seed=_seed_from("batsh"), opacity=0.6))
        return d

    def bands(self, st) -> Drawing:
        """Detalles del exterior que desaparecen con la transparencia."""
        d = Drawing()
        for i, arc in enumerate(facing_arcs(self.proj, 0.55, R_CASE)):
            d.add(self._s(arc, st, ("band", i), width=self.W * 0.55, opacity=0.7))
        for i, arc in enumerate(facing_arcs(self.proj, -0.35, R_CASE)):
            d.add(self._s(arc, st, ("band2", i), width=self.W * 0.55, opacity=0.7))
        return d

    TERM_A = math.radians(108)   # terminal superior  (+)
    TERM_B = math.radians(232)   # terminal inferior  (−)

    def terminal_tip(self, which):
        a = self.TERM_A if which == "A" else self.TERM_B
        return E(a) * 0.8 + [X_BELL - 0.34, 0, 0]

    def terminals(self, st) -> Drawing:
        d = Drawing()
        for k, a in enumerate((self.TERM_A, self.TERM_B)):
            c = E(a) * 0.8 + [X_BELL - 0.17, 0, 0]
            d.add(box_strokes(self, st, c, [np.array([1.0, 0, 0]), E(a),
                                            E(a + math.pi / 2)],
                              (0.17, 0.05, 0.11), ("term", k),
                              width=self.W * 0.6))
        return d

    # ---------------------------------------------------------- eje + hélice
    def shaft(self, st, x0=X_BELL - 0.2, x1=X_PROP + 0.22, through=True) -> Drawing:
        """Eje como cilindro fino. Si through=False sólo la parte exterior."""
        d = Drawing()
        off = self.off_rotor(st)
        r = 0.075
        if not through:
            x0 = X_FRONT + 0.12
        for i, a in enumerate(self.proj.silhouette_angles()):
            d.add(self._s([E(a) * r + [x0, 0, 0], E(a) * r + [x1, 0, 0]], st,
                          ("shaft", i, through), width=self.W * 0.75,
                          offset3=off, amp=0.006))
        d.add(self._s(ring(x1, r, 0, TAU + 0.2, 30), st, ("shaftend", through),
                      width=self.W * 0.6, offset3=off, amp=0.003))
        return d

    def propeller(self, st) -> Drawing:
        d = Drawing()
        off = self.off_rotor(st)
        hub = ring(X_PROP, 0.17, 0, TAU + 0.25, 40)
        d.add(self._s(hub, st, "hub", offset3=off, amp=0.004))
        for k in range(2):
            a = st.prop + k * math.pi
            u = np.linspace(0.16, 1.18, 40)
            w = 0.24 * np.sin(np.pi * (u - 0.1) / 1.12) ** 0.8 + 0.02
            side1 = [(X_PROP + 0.06 * (uu - 0.1), *self._blade(a, uu, ww))
                     for uu, ww in zip(u, w)]
            side2 = [(X_PROP - 0.06 * (uu - 0.1), *self._blade(a, uu, -ww * 0.75))
                     for uu, ww in zip(u[::-1], w[::-1])]
            outline = np.array(side1 + side2 + [side1[0]])
            d.strokes.insert(0, Fill(self._p(outline, st, off), color=FILL_DARK,
                                     opacity=0.85, fade=0.05))
            d.add(self._s(outline, st, ("blade", k), offset3=off, amp=0.008))
        return d

    @staticmethod
    def _blade(a, u, w):
        # punto en el plano Y-Z: radial u en dirección E(a), lateral w
        r = E(a) * u + E(a + math.pi / 2) * w
        return r[1], r[2]

    def speed_lines(self, st) -> Drawing:
        """Arcos de movimiento detrás de las puntas de la hélice."""
        d = Drawing()
        if st.spin_blur <= 0.12:
            return d
        off = self.off_rotor(st)
        for k in range(2):
            a = st.prop + k * math.pi
            for j, (rr, span) in enumerate(((1.28, 1.1), (1.08, 0.75), (1.45, 0.55))):
                k_b = (st.spin_blur - 0.12) / 0.88
                arc = ring(X_PROP, rr, a + 0.18, a + 0.18 + span * k_b, 40)
                d.add(self._s(arc, st, ("sl", k, j), color=PENCIL,
                              width=self.W * 0.55, offset3=off, amp=0.006,
                              opacity=0.8))
        return d

    # ------------------------------------------------------------ interior
    def magnets(self, st, which=("N", "S")) -> dict:
        """Imanes del estator: cara frontal (rayada) + aristas + arco trasero."""
        out = {}
        spec = {"N": (math.radians(48), math.radians(132), RED, True),
                "S": (math.radians(228), math.radians(312), BLUE, False)}
        r_in, r_out = 1.06, 1.36
        x_f, x_b = 1.12, -1.02
        for name in which:
            a0, a1, col, top = spec[name]
            off = self.off_magnet(st, top)
            d = Drawing()
            face = np.vstack([ring(x_f, r_out, a0, a1, 50),
                              ring(x_f, r_in, a1, a0, 50)])
            face = np.vstack([face, face[:1]])
            # relleno: superficie exterior del imán (cara + lomo)
            shell = np.vstack([ring(x_f, r_out if top else r_in, a0, a1, 30),
                               ring(x_b, r_out if top else r_in, a1, a0, 30)])
            d.strokes.append(Fill(self._p(shell, st, off), color=FILL, opacity=0.9,
                                  fade=0.2))
            d.strokes.append(Fill(self._p(face, st, off), color=FILL_DARK,
                                  opacity=0.9, fade=0.2))
            d.add(self._s(face, st, ("magface", name), color=col, offset3=off,
                          amp=0.01))
            for k, a in enumerate((a0, a1)):
                for j, r in enumerate((r_in, r_out)):
                    if top and r == r_in and False:
                        continue
                    d.add(self._s([E(a) * r + [x_f, 0, 0], E(a) * r + [x_b, 0, 0]],
                                  st, ("magedge", name, k, j), color=col,
                                  width=self.W * 0.7, offset3=off, amp=0.01))
            d.add(self._s(ring(x_b, r_out if top else r_in, a0, a1, 40), st,
                          ("magback", name), color=col, width=self.W * 0.7,
                          offset3=off, amp=0.01))
            poly = self._p(face, st, off)[:, :2]
            d.add(hatch(poly, spacing=0.1, angle=60 if top else 120, color=col,
                        width=self.W * 0.5, seed=_seed_from(("hatch", name)),
                        opacity=0.75))
            out[name] = d
        return out

    def magnet_center(self, st, name):
        a = math.radians(90 if name == "N" else 270)
        off = self.off_magnet(st, name == "N")
        return self._p(E(a) * 1.21 + [1.12, 0, 0], st, off)[0]

    def magnet_label_pos(self, st, name):
        a = math.radians(90 if name == "N" else 270)
        off = self.off_magnet(st, name == "N")
        return self._p(E(a) * 1.78 + [1.2, 0, 0], st, off)[0]

    def coil(self, st, turns=4) -> Drawing:
        """Bobina rectangular en el plano que contiene al eje, a ángulo θ."""
        d = Drawing()
        off = self.off_rotor(st)
        x1, x2 = -0.98, 1.02
        for t in range(turns):
            r = 0.76 + 0.04 * t
            xa, xb = x1 - 0.03 * t, x2 + 0.03 * t
            A = E(st.theta) * r
            B = -A
            loop = [A + [xa, 0, 0], A + [xb, 0, 0], B + [xb, 0, 0],
                    B + [xa, 0, 0], A + [xa, 0, 0] + E(st.theta + 0.5) * 0.02]
            d.add(self._s(loop, st, ("coil", t), color=RED,
                          width=self.W * (0.8 if t else 0.95), offset3=off,
                          amp=0.012))
        # terminales de la bobina hacia el conmutador
        for k, sgn in enumerate((1, -1)):
            A = E(st.theta) * 0.78 * sgn
            C = E(st.theta) * 0.27 * sgn
            d.add(self._s([A + [x1, 0, 0], (A + C) / 2 + [-1.12, 0, 0],
                           C + [-1.2, 0, 0]], st, ("lead", k), color=RED,
                          width=self.W * 0.6, offset3=off, amp=0.006))
        return d

    def coil_side_center(self, st, side=1, x=0.05):
        return self._p(E(st.theta) * 0.83 * side + [x, 0, 0], st,
                       self.off_rotor(st))[0]

    def commutator(self, st) -> Drawing:
        d = Drawing()
        off = self.off_rotor(st)
        r, xa, xb = 0.27, -1.5, -1.16
        sil = self.proj.silhouette_angles()
        d.add(self._s(ring(xb, r, 0, TAU + 0.2, 50), st, "comf", offset3=off,
                      amp=0.004, width=self.W * 0.8))
        for i, arc in enumerate(facing_arcs(self.proj, xa, r)):
            d.add(self._s(arc, st, ("comb", i), offset3=off, amp=0.004,
                          width=self.W * 0.8))
        for i, a in enumerate(sil):
            d.add(self._s([E(a) * r + [xa, 0, 0], E(a) * r + [xb, 0, 0]], st,
                          ("coms", i), offset3=off, amp=0.004, width=self.W * 0.8))
        # ranuras (gaps) alineadas con la bobina
        for k, a in enumerate((st.theta, st.theta + math.pi)):
            for j, da in enumerate((-0.12, 0.12)):
                aa = a + da
                if E(aa) @ self.proj.view > -0.05:
                    d.add(self._s([E(aa) * r + [xa, 0, 0], E(aa) * r + [xb, 0, 0]],
                                  st, ("gap", k, j), offset3=off, amp=0.002,
                                  width=self.W * 0.5))
        return d

    def commutator_center(self, st):
        return self._p([-1.33, 0, 0], st, self.off_rotor(st))[0]

    def brushes(self, st) -> Drawing:
        d = Drawing()
        for k, (a, side) in enumerate(((0.0, 1), (math.pi, -1))):
            off = np.asarray(self.off_brush(st, side), float)
            c = E(a) * 0.52 + [-1.33, 0, 0] + off
            d.add(box_strokes(self, st, c, [np.array([1.0, 0, 0]), E(a),
                                            E(a + math.pi / 2)],
                              (0.11, 0.22, 0.13), ("brush", k),
                              width=self.W * 0.75, hatch_color=INK))
        return d

    def brush_center(self, st, side):
        a = 0.0 if side > 0 else math.pi
        return self._p(E(a) * 0.5 + [-1.33, 0, 0], st, self.off_brush(st, side))[0]

    def inner_wires(self, st) -> Drawing:
        """Cables de escobillas a terminales traseros."""
        d = Drawing()
        for k, (a, side, ta) in enumerate(((0.0, 1, self.TERM_B),
                                           (math.pi, -1, self.TERM_A))):
            off = np.asarray(self.off_brush(st, side), float)
            b = E(a) * 0.74 + [-1.33, 0, 0] + off
            t = E(ta) * 0.8 + [X_BELL, 0, 0]
            mid = (b + t) / 2 + E(ta) * 0.3 + [0.1, 0, 0]
            d.add(self._s(_bezier([b, mid, t]), st, ("iw", k),
                          color=RED if ta == self.TERM_A else INK,
                          width=self.W * 0.55, amp=0.006))
        return d

    # --------------------------------------------------------- pila + cables
    BAT = np.array([-3.9, -0.55, 0.55])   # centro de la pila (eje Y)
    BAT_H, BAT_R = 0.95, 0.4

    def _bat_ring(self, dy, r, a0=0.0, a1=TAU + 0.2, n=60):
        al = np.linspace(a0, a1, n)
        pts = np.zeros((n, 3))
        pts[:, 0] = r * np.cos(al)
        pts[:, 2] = r * np.sin(al)
        return pts + self.BAT + [0, dy, 0]

    def battery(self, st) -> Drawing:
        d = Drawing()
        H, r = self.BAT_H, self.BAT_R
        v = self.proj.view
        # silueta de un cilindro vertical: normal (cos a, 0, sin a) ⟂ vista
        a_s = math.atan2(-v[0], v[2])
        sil = [a_s, a_s + math.pi]
        for i, a in enumerate(sil):
            n = np.array([math.cos(a), 0, math.sin(a)]) * r
            d.add(self._s([self.BAT + n + [0, -H, 0], self.BAT + n + [0, H, 0]],
                          st, ("bat", i)))
        d.add(self._s(self._bat_ring(H, r, 0.3, 0.3 + TAU + 0.2), st, "batt"))
        # aro inferior: sólo la mitad visible (la que mira al espectador)
        al = np.linspace(0, TAU, 200)
        vis = [a for a in al if np.array([math.cos(a), 0, math.sin(a)]) @ v > 0]
        lo, hi = min(vis), max(vis)
        if hi - lo > math.pi * 1.2:  # el intervalo cruza 0
            vis2 = [a if a > math.pi else a + TAU for a in vis]
            lo, hi = min(vis2), max(vis2)
        d.add(self._s(self._bat_ring(-H, r, lo, hi, 60), st, "batb"))
        # banda de la etiqueta
        vis_band = self._bat_ring(H * 0.35, r, lo, hi, 60)
        d.add(self._s(vis_band, st, "batl", width=self.W * 0.55))
        # borne +
        d.add(self._s(self._bat_ring(H + 0.12, 0.12, 0, TAU + 0.3, 30), st, "batp",
                      width=self.W * 0.7, amp=0.003))
        for i, a in enumerate(sil):
            n = np.array([math.cos(a), 0, math.sin(a)]) * 0.12
            d.add(self._s([self.BAT + n + [0, H, 0], self.BAT + n + [0, H + 0.12, 0]],
                          st, ("batpp", i), width=self.W * 0.7, amp=0.002))
        return d

    def battery_marks(self, st):
        plus = self._p([self.BAT + [0, self.BAT_H * 0.68, 0] + self._bat_front()], st)[0]
        minus = self._p([self.BAT + [0, -self.BAT_H * 0.4, 0] + self._bat_front()], st)[0]
        return plus, minus

    def _bat_front(self):
        v = self.proj.view
        n = np.array([v[0], 0, v[2]])
        return n / np.linalg.norm(n) * self.BAT_R * 0.98

    def battery_center(self, st):
        return self._p([self.BAT], st)[0]

    def outer_wires(self, st) -> Drawing:
        d = Drawing()
        tA, tB = self.terminal_tip("A"), self.terminal_tip("B")
        plus = self.BAT + [0, self.BAT_H + 0.12, 0]
        minus = self.BAT + [0, -self.BAT_H * 0.82, 0] + self._bat_front() * 1.02
        wa = _bezier([tA, tA + [-0.9, 0.25, 0], plus + [0.2, 1.1, 0], plus])
        wb = _bezier([tB, tB + [-0.6, -0.4, 0.1], minus + [0.9, -0.35, 0], minus])
        d.add(self._s(wa, st, "wireA", color=RED, width=self.W * 0.75, amp=0.012))
        d.add(self._s(wb, st, "wireB", color=INK, width=self.W * 0.75, amp=0.012))
        return d

    # --------------------------------------------------------------- anclas
    def anchor(self, name, st):
        p = self.proj
        table = {
            "front": [X_FRONT, 0, 0],
            "body_top": E(math.radians(95)) * R_CASE,
            "prop": [X_PROP, 0, 0],
        }
        return self._p([table[name]], st)[0]


def box_strokes(model, st, center, axes, half, key, width=4.0, color=INK,
                hatch_color=None):
    """Caja 3D a mano: contorno (envolvente convexa proyectada) + las 3
    aristas que salen del vértice más cercano al espectador."""
    import itertools
    center = np.asarray(center, float)
    signs = list(itertools.product((-1, 1), repeat=3))
    corners = [center + sum(sg * h * ax for sg, h, ax in zip(sgn, half, axes))
               for sgn in signs]
    P = model._p(corners, st)
    hull = _convex_hull(P[:, :2])
    outline = [P[i] for i in hull] + [P[hull[0]]]
    d = Drawing()
    d.add(Stroke(wobble(np.array(outline), amp=0.004, seed=_seed_from(key)),
                 color=color, width=width))
    depth = [c @ model.proj.view for c in corners]
    near = int(np.argmax(depth))
    for j in range(3):
        sg = list(signs[near])
        sg[j] *= -1
        k = signs.index(tuple(sg))
        d.add(Stroke(wobble(np.array([P[near], P[k]]), amp=0.003,
                            seed=_seed_from((key, j))), color=color,
                     width=width * 0.8))
    d.strokes.insert(0, Fill(P[hull], color=FILL_DARK, opacity=0.9, fade=0.05))
    if hatch_color:
        d.add(hatch(P[hull][:, :2], spacing=0.055, angle=35, color=hatch_color,
                    width=width * 0.4, seed=_seed_from((key, "h")), opacity=0.55))
    return d


def _convex_hull(pts):
    pts = np.asarray(pts)
    idx = sorted(range(len(pts)), key=lambda i: (pts[i][0], pts[i][1]))

    def cross(o, a, b):
        return (pts[a][0] - pts[o][0]) * (pts[b][1] - pts[o][1]) - \
               (pts[a][1] - pts[o][1]) * (pts[b][0] - pts[o][0])
    lower, upper = [], []
    for i in idx:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], i) <= 0:
            lower.pop()
        lower.append(i)
    for i in reversed(idx):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], i) <= 0:
            upper.pop()
        upper.append(i)
    return lower[:-1] + upper[:-1]


def _bezier(ctrl, n=60):
    ctrl = np.asarray(ctrl, float)
    t = np.linspace(0, 1, n)[:, None]
    pts = ctrl.copy()
    out = []
    for tt in t:
        q = ctrl.copy()
        while len(q) > 1:
            q = q[:-1] * (1 - tt) + q[1:] * tt
        out.append(q[0])
    return np.array(out)
