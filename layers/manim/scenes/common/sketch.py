"""Primitivas de dibujo "a mano" (estilo pizarra / rotulador) para Manim.

Idea central: todo trazo es una polilínea densa que se desplaza a lo largo de
su normal con un ruido suave parametrizado por longitud de arco. El ruido usa
una semilla fija por trazo, así que un mismo trazo se ve idéntico frame a frame
(no "tiembla" salvo que se quiera) aunque se redibuje con `always_redraw`.

Además, cada trazo puede dibujarse parcialmente (`progress` 0..1), lo que
permite construir modelos completos controlados por `ValueTracker`s:
dibujo progresivo, giro, explosión de piezas, etc., sin depender de
`Create` y pudiendo saber en todo momento dónde está la punta del rotulador.
"""
from __future__ import annotations

import hashlib
import math
from dataclasses import dataclass, field

import numpy as np
from manim import CapStyleType, LineJointType, VGroup, VMobject

# --------------------------------------------------------------------------
# Paleta de rotuladores (pizarra blanca cálida)
# --------------------------------------------------------------------------
INK = "#1E2430"      # rotulador negro-azulado (trazo principal)
RED = "#D6402F"      # corriente / polo N
BLUE = "#2D6BB3"     # campo magnético / polo S
GREEN = "#23905E"    # fuerza
ORANGE = "#E07A1F"   # énfasis / giro
PENCIL = "#8C929B"   # líneas fantasma / construcción
HILITE = "#FFD84A"   # resaltador


def _seed_from(key) -> int:
    h = hashlib.md5(str(key).encode()).hexdigest()
    return int(h[:8], 16)


# --------------------------------------------------------------------------
# Geometría base
# --------------------------------------------------------------------------
def resample(points: np.ndarray, step: float = 0.03) -> np.ndarray:
    """Re-muestrea una polilínea a paso ~constante (en unidades de Manim)."""
    pts = np.asarray(points, dtype=float)
    if len(pts) < 2:
        return pts
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    total = s[-1]
    if total < 1e-9:
        return pts[:1].repeat(2, axis=0)
    n = max(2, int(math.ceil(total / step)) + 1)
    t = np.linspace(0, total, n)
    out = np.empty((n, 3))
    for k in range(3):
        out[:, k] = np.interp(t, s, pts[:, k])
    return out


def arc_length(points: np.ndarray) -> float:
    pts = np.asarray(points)
    if len(pts) < 2:
        return 0.0
    return float(np.linalg.norm(np.diff(pts, axis=0), axis=1).sum())


def _normals(pts: np.ndarray) -> np.ndarray:
    tang = np.gradient(pts[:, :2], axis=0)
    norm = np.linalg.norm(tang, axis=1, keepdims=True)
    norm[norm < 1e-12] = 1
    tang /= norm
    n = np.zeros_like(pts)
    n[:, 0] = -tang[:, 1]
    n[:, 1] = tang[:, 0]
    return n


def wobble(points, amp=0.024, seed=0, closed=False) -> np.ndarray:
    """Desplaza la polilínea a lo largo de su normal con ruido suave."""
    pts = resample(points)
    if len(pts) < 3 or amp <= 0:
        return pts
    rng = np.random.default_rng(seed)
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    total = s[-1]
    disp = np.zeros(len(pts))
    # 3 octavas: ondulación lenta + temblor fino
    for freq, a in ((0.35, 1.0), (1.1, 0.45), (3.2, 0.18)):
        if closed:
            # frecuencia entera sobre el perímetro para que cierre suave
            cycles = max(1, round(freq * total))
            f = cycles / total
        else:
            f = freq * rng.uniform(0.8, 1.25)
        disp += a * np.sin(2 * np.pi * f * s + rng.uniform(0, 2 * np.pi))
    # Los extremos de trazos abiertos tiemblan algo menos (el rotulador apoya)
    if not closed:
        ramp = np.clip(np.minimum(s, total - s) / 0.15, 0.35, 1.0)
        disp *= ramp
    return pts + _normals(pts) * (disp * amp)[:, None]


# --------------------------------------------------------------------------
# Trazo
# --------------------------------------------------------------------------
@dataclass
class Stroke:
    """Un trazo de rotulador: puntos ya "temblados", color y grosor."""

    points: np.ndarray
    color: str = INK
    width: float = 5.0
    opacity: float = 0.95
    z: float = 0.0           # orden de dibujo (mayor = encima)
    dashed: bool = False
    dash: float = 0.14
    gap: float = 0.10
    tag: str = ""

    @property
    def length(self) -> float:
        return arc_length(self.points)

    def partial_points(self, p: float) -> np.ndarray:
        if p >= 1:
            return self.points
        if p <= 0:
            return self.points[:1]
        pts = self.points
        seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
        s = np.concatenate([[0], np.cumsum(seg)])
        target = p * s[-1]
        i = int(np.searchsorted(s, target))
        i = max(1, min(i, len(pts) - 1))
        t = (target - s[i - 1]) / max(seg[i - 1], 1e-12)
        end = pts[i - 1] + (pts[i] - pts[i - 1]) * t
        return np.vstack([pts[:i], end])

    def tip(self, p: float) -> np.ndarray:
        return self.partial_points(p)[-1]

    def to_mobject(self, p: float = 1.0, opacity_mul: float = 1.0) -> VMobject:
        pts = self.partial_points(p)
        if len(pts) < 2:
            return VMobject()
        if self.dashed:
            return _dashed_mob(pts, self.dash, self.gap, self.color, self.width,
                               self.opacity * opacity_mul)
        m = VMobject()
        m.set_points_as_corners(pts)
        m.set_stroke(self.color, width=self.width,
                     opacity=self.opacity * opacity_mul)
        m.set_fill(opacity=0)
        m.cap_style = CapStyleType.ROUND
        m.joint_type = LineJointType.ROUND
        return m


def _dashed_mob(pts, dash, gap, color, width, opacity) -> VMobject:
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    total = s[-1]
    m = VMobject()
    pos = 0.0
    while pos < total:
        a, b = pos, min(pos + dash, total)
        idx = (s > a) & (s < b)
        chunk = [np.array([np.interp(a, s, pts[:, k]) for k in range(3)])]
        chunk += list(pts[idx])
        chunk.append(np.array([np.interp(b, s, pts[:, k]) for k in range(3)]))
        if len(chunk) >= 2:
            sub = VMobject()
            sub.set_points_as_corners(np.array(chunk))
            m.append_points(sub.points)
        pos += dash + gap
    m.set_stroke(color, width=width, opacity=opacity)
    m.set_fill(opacity=0)
    m.cap_style = CapStyleType.ROUND
    return m


# --------------------------------------------------------------------------
# Constructores de trazos
# --------------------------------------------------------------------------
def line_pts(a, b, overshoot=0.03, bow=0.012, seed=0) -> np.ndarray:
    """Línea a mano: se pasa un poco de los extremos y se arquea levemente."""
    a = np.asarray(a, float)
    b = np.asarray(b, float)
    if len(a) == 2:
        a = np.append(a, 0)
    if len(b) == 2:
        b = np.append(b, 0)
    d = b - a
    L = np.linalg.norm(d)
    if L < 1e-9:
        return np.array([a, b])
    u = d / L
    n = np.array([-u[1], u[0], 0])
    rng = np.random.default_rng(seed)
    o1 = overshoot * rng.uniform(0.2, 1.0)
    o2 = overshoot * rng.uniform(0.4, 1.2)
    t = np.linspace(-o1 / L, 1 + o2 / L, max(8, int(L / 0.03)))
    bow_amt = bow * L * rng.choice([-1, 1]) * rng.uniform(0.5, 1.0)
    pts = a[None, :] + t[:, None] * d[None, :]
    pts += n[None, :] * (np.sin(np.clip(t, 0, 1) * np.pi) * bow_amt)[:, None]
    return pts


def ellipse_pts(center, rx, ry, rot=0.0, start=None, sweep=None,
                overlap=0.18, seed=0, n=160) -> np.ndarray:
    """Elipse/círculo a mano: empieza en ángulo aleatorio y se solapa un poco
    al cerrar (como un círculo hecho de un solo gesto)."""
    rng = np.random.default_rng(seed)
    if start is None:
        start = rng.uniform(0, 2 * np.pi)
    if sweep is None:
        sweep = 2 * np.pi + overlap * rng.uniform(0.6, 1.2)
    t = np.linspace(start, start + sweep, n)
    # leve espiral: el final queda un poquito hacia dentro/fuera
    drift = 1 + rng.uniform(-0.025, 0.025) * (t - start) / (2 * np.pi)
    x = rx * np.cos(t) * drift
    y = ry * np.sin(t) * drift
    c, s = math.cos(rot), math.sin(rot)
    pts = np.zeros((n, 3))
    pts[:, 0] = center[0] + c * x - s * y
    pts[:, 1] = center[1] + s * x + c * y
    return pts


def hline(a, b, color=INK, width=5.0, seed=None, amp=0.016, overshoot=0.03,
          bow=0.012, **kw) -> Stroke:
    seed = _seed_from((tuple(np.round(a, 3)), tuple(np.round(b, 3)))) if seed is None else seed
    pts = wobble(line_pts(a, b, overshoot=overshoot, bow=bow, seed=seed),
                 amp=amp, seed=seed + 1)
    return Stroke(pts, color=color, width=width, **kw)


def hpath(points, color=INK, width=5.0, seed=0, amp=0.02, closed=False,
          **kw) -> Stroke:
    pts = wobble(np.asarray(points, float), amp=amp, seed=seed, closed=closed)
    return Stroke(pts, color=color, width=width, **kw)


def hcircle(center, r, color=INK, width=5.0, seed=0, amp=0.018, ry=None,
            rot=0.0, start=None, sweep=None, overlap=0.18, **kw) -> Stroke:
    pts = ellipse_pts(center, r, r if ry is None else ry, rot=rot, start=start,
                      sweep=sweep, overlap=overlap, seed=seed)
    pts = wobble(pts, amp=amp, seed=seed + 7)
    return Stroke(pts, color=color, width=width, **kw)


def harrow(a, b, color=INK, width=5.0, head=0.3, seed=0, amp=0.01,
           head_angle=28, **kw) -> list[Stroke]:
    """Flecha a mano: astil + cabeza abierta en "V" (dos trazos cortos)."""
    a = np.append(np.asarray(a, float)[:2], 0)
    b = np.append(np.asarray(b, float)[:2], 0)
    shaft = hline(a, b, color=color, width=width, seed=seed, amp=amp,
                  overshoot=0.0, **kw)
    return [shaft] + arrow_head(b, b - a, color=color, width=width, head=head,
                                seed=seed + 3, head_angle=head_angle, **kw)


def arrow_head(tip, direction, color=INK, width=5.0, head=0.3, seed=0,
               head_angle=28, **kw) -> list[Stroke]:
    d = np.asarray(direction, float)[:2]
    d = d / (np.linalg.norm(d) + 1e-12)
    tip = np.append(np.asarray(tip, float)[:2], 0)
    out = []
    for k, sgn in enumerate((1, -1)):
        ang = math.radians(180 - head_angle * sgn)
        c, s = math.cos(ang), math.sin(ang)
        v = np.array([c * d[0] - s * d[1], s * d[0] + c * d[1], 0])
        out.append(hline(tip, tip + v * head, color=color, width=width,
                         seed=seed + k, amp=0.004, overshoot=0.0, bow=0.0, **kw))
    return out


def _clip_outside_circle(p, q, c, r):
    """Partes del segmento p→q que quedan FUERA del círculo (c, r)."""
    d = q - p
    f = p - c
    a = d @ d
    b = 2 * f @ d
    cc = f @ f - r * r
    disc = b * b - 4 * a * cc
    if disc <= 0 or a < 1e-12:
        return [(p, q)]
    sq = math.sqrt(disc)
    t1, t2 = (-b - sq) / (2 * a), (-b + sq) / (2 * a)
    out = []
    if t1 > 0:
        out.append((p, p + d * min(t1, 1)))
    if t2 < 1:
        out.append((p + d * max(t2, 0), q))
    return [(u, v) for u, v in out if np.linalg.norm(v - u) > 0.03]


def hatch(polygon, spacing=0.11, angle=55, color=INK, width=3.0, seed=0,
          opacity=0.85, margin=0.02, holes=(), **kw) -> list[Stroke]:
    """Rayado a mano dentro de un polígono 2D (puede ser cóncavo).
    `holes`: [(centro_xy, radio)] zonas sin rayar (p. ej. para una letra)."""
    poly = np.asarray(polygon, float)[:, :2]
    th = math.radians(angle)
    d = np.array([math.cos(th), math.sin(th)])
    n = np.array([-d[1], d[0]])
    proj_n = poly @ n
    lo, hi = proj_n.min(), proj_n.max()
    rng = np.random.default_rng(seed)
    strokes = []
    edges = list(zip(poly, np.roll(poly, -1, axis=0)))
    k = 0
    c = lo + spacing * 0.5
    while c < hi:
        hits = []
        for p, q in edges:
            a, b = p @ n - c, q @ n - c
            if (a > 0) != (b > 0):
                t = a / (a - b)
                hits.append(p + (q - p) * t)
        hits.sort(key=lambda h: h @ d)
        for i in range(0, len(hits) - 1, 2):
            p, q = hits[i], hits[i + 1]
            L = np.linalg.norm(q - p)
            if L < 2 * margin + 0.02:
                continue
            u = (q - p) / L
            jitter = rng.uniform(-0.6, 0.6) * margin
            p2 = p + u * (margin + jitter)
            q2 = q - u * (margin + rng.uniform(-0.6, 0.6) * margin)
            segs = [(p2, q2)]
            for hc, hr in holes:
                hc = np.asarray(hc, float)[:2]
                segs = [piece for a_, b_ in segs
                        for piece in _clip_outside_circle(a_, b_, hc, hr)]
            for a_, b_ in segs:
                strokes.append(hline(a_, b_, color=color, width=width,
                                     seed=seed * 1000 + k, amp=0.004,
                                     overshoot=0.0, bow=0.004, opacity=opacity,
                                     **kw))
                k += 1
        c += spacing * rng.uniform(0.85, 1.15)
    # zig-zag: alterna sentido como un trazo real de rayado
    for i, s in enumerate(strokes):
        if i % 2:
            s.points = s.points[::-1]
    return strokes


# --------------------------------------------------------------------------
# Render rápido: polilíneas → curvas Bézier "rectas" en un solo VMobject
# --------------------------------------------------------------------------
def _corner_beziers(pts: np.ndarray) -> np.ndarray:
    a, b = pts[:-1], pts[1:]
    return np.stack([a, a + (b - a) / 3, a + 2 * (b - a) / 3, b],
                    axis=1).reshape(-1, 3)


def _dash_polylines(pts, dash, gap):
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    total = s[-1]
    out = []
    pos = 0.0
    while pos < total:
        a, b = pos, min(pos + dash, total)
        i0 = int(np.searchsorted(s, a, side="right"))
        i1 = int(np.searchsorted(s, b, side="left"))
        pa = np.array([np.interp(a, s, pts[:, k]) for k in range(3)])
        pb = np.array([np.interp(b, s, pts[:, k]) for k in range(3)])
        chunk = np.vstack([pa[None], pts[i0:i1], pb[None]])
        if len(chunk) >= 2 and b - a > 1e-4:
            out.append(chunk)
        pos += dash + gap
    return out


def merge_strokes(items, opacity_mul=1.0) -> VGroup:
    groups: dict = {}
    order = []
    for s, frac in items:
        pts = s.partial_points(frac)
        if len(pts) < 2:
            continue
        key = (s.color, round(s.width, 2), round(s.opacity * opacity_mul, 3))
        if key not in groups:
            groups[key] = []
            order.append(key)
        polys = _dash_polylines(pts, s.dash, s.gap) if s.dashed else [pts]
        for poly in polys:
            groups[key].append(_corner_beziers(poly))
    g = VGroup()
    for key in order:
        if not groups[key]:
            continue
        color, width, op = key
        m = VMobject()
        m.points = np.vstack(groups[key])
        m.set_stroke(color, width=width, opacity=op)
        m.set_fill(opacity=0)
        m.cap_style = CapStyleType.ROUND
        m.joint_type = LineJointType.ROUND
        g.add(m)
    return g


# --------------------------------------------------------------------------
# Grupo de trazos con dibujo progresivo
# --------------------------------------------------------------------------
@dataclass
class Drawing:
    """Conjunto ordenado de trazos que se dibuja con un único `progress`.

    El progreso se reparte proporcional a la longitud de cada trazo (el
    rotulador va a velocidad ~constante), con una pequeña pausa entre trazos.
    """

    strokes: list = field(default_factory=list)
    pause: float = 0.06   # longitud equivalente "en el aire" entre trazos

    def add(self, *items):
        for it in items:
            if isinstance(it, (list, tuple)):
                self.strokes.extend(it)
            elif isinstance(it, Drawing):
                self.strokes.extend(it.strokes)
            else:
                self.strokes.append(it)
        return self

    def _budget(self):
        lens = [s.length + self.pause for s in self.strokes]
        total = sum(lens) or 1.0
        return lens, total

    def render(self, p: float = 1.0, opacity_mul: float = 1.0) -> VGroup:
        """Devuelve un VGroup con UN VMobject por estilo (color/grosor/opacidad):
        todos los trazos del mismo estilo van como subtrayectorias de un solo
        objeto. Es ~10x más rápido que un VMobject por trazo."""
        if p <= 0 or not self.strokes or opacity_mul <= 0.001:
            return VGroup()
        items = []
        if p >= 1:
            items = [(s, 1.0) for s in self.strokes]
        else:
            lens, total = self._budget()
            budget = p * total
            for s, L in zip(self.strokes, lens):
                if budget <= 0:
                    break
                items.append((s, min(1.0, budget / max(s.length, 1e-9))))
                budget -= L
        return merge_strokes(items, opacity_mul)

    def tip(self, p: float):
        """Posición de la punta del rotulador para un progreso dado
        (None si está "en el aire" o terminó)."""
        hit = self.tip_stroke(p)
        return None if hit is None else hit[0]

    def tip_stroke(self, p: float):
        """(posición, trazo) de la punta del rotulador, o None."""
        if p <= 0 or p >= 1 or not self.strokes:
            return None
        lens, total = self._budget()
        budget = p * total
        for s, L in zip(self.strokes, lens):
            if budget <= s.length:
                return s.tip(budget / max(s.length, 1e-9)), s
            budget -= L
            if budget <= 0:
                return None
        return None

    @property
    def length(self):
        return self._budget()[1]


# --------------------------------------------------------------------------
# Utilidades de composición
# --------------------------------------------------------------------------
def restyle(drawing: "Drawing", dashed=True, color=PENCIL, width_mul=0.7,
            opacity=None, dash=0.14, gap=0.10) -> "Drawing":
    """Copia de un dibujo con otro estilo (p. ej. carcasa "fantasma")."""
    out = Drawing(pause=drawing.pause)
    for s in drawing.strokes:
        out.strokes.append(Stroke(s.points, color=color,
                                  width=s.width * width_mul,
                                  opacity=s.opacity if opacity is None else opacity,
                                  dashed=dashed, dash=dash, gap=gap, tag=s.tag))
    return out


def curved_arrow(a, b, bend=0.25, color=INK, width=4.5, head=0.26, seed=0):
    """Flecha curva (bezier cuadrática) con cabeza abierta."""
    a = np.append(np.asarray(a, float)[:2], 0)
    b = np.append(np.asarray(b, float)[:2], 0)
    d = b - a
    n = np.array([-d[1], d[0], 0])
    ctrl = (a + b) / 2 + n * bend
    t = np.linspace(0, 1, 50)[:, None]
    pts = (1 - t) ** 2 * a + 2 * (1 - t) * t * ctrl + t ** 2 * b
    shaft = Stroke(wobble(pts, amp=0.008, seed=seed), color=color, width=width)
    return [shaft] + arrow_head(b, pts[-1] - pts[-5], color=color, width=width,
                                head=head, seed=seed + 5)


def handwriting_path(mob, rows=1) -> np.ndarray:
    """Trayectoria aproximada de la punta del rotulador al escribir un texto:
    zig-zag de izquierda a derecha dentro de la caja del texto."""
    left, right = mob.get_left()[0], mob.get_right()[0]
    bottom, top = mob.get_bottom()[1], mob.get_top()[1]
    n_chars = max(2, int((right - left) / 0.16))
    xs = np.linspace(left, right, n_chars * 4)
    ys = bottom + (top - bottom) * (0.5 + 0.42 * np.sin(np.linspace(0, n_chars * 2 * np.pi, len(xs))))
    return np.stack([xs, ys, np.zeros_like(xs)], axis=1)
