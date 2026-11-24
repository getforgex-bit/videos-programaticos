"""Video 01 · iteración v2 — "El motor invisible" en estilo SEPIA dinámico.

Feedback de v1: el estilo debía ser tinta sepia sobre pergamino (no pizarra),
y el video era aburrido: faltaba ritmo, movimiento entre escenas y sobraba
información a la vez. Cambios de esta versión:

  · Tema sepia (themes.apply("sepia")): rellenos tostados, sombreado rayado,
    doble trazo de boceto y tintas antiguas apagadas.
  · Todo cuadrado a un pulso de 100 BPM: cada duración es múltiplo de B = 0,3 s
    (medio pulso), así los golpes visuales caen sobre la música.
  · Cámara siempre viva (SmoothCam): seguimiento suave, empujes y barridos.
  · Revelado por ESCÁNER (recorte por X) en vez de dibujar pieza a pieza.
  · Una idea por pantalla: recorrido de enfoque con UNA etiqueta a la vez; la
    ecuación y la gráfica viven en otras zonas del pergamino.

Escenas: V01v2_M1 (revelación), V01v2_M2 (física), V01v2_M3 (reconstrucción).
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
sys.path.insert(0, str(HERE))

import numpy as np  # noqa: E402
from manim import (BOLD, FadeIn, FadeOut, Text, UpdateFromAlphaFunc,  # noqa: E402
                   ValueTracker, VGroup, VMobject, always_redraw, linear,
                   rate_functions, smooth)

from common import themes  # noqa: E402
from common.sketch import (BLUE, GREEN, HILITE, INK, ORANGE, PENCIL, RED,  # noqa: E402
                           Drawing, Fill, FILL, hcircle, hline, live, restyle)
from common.timed_scene import TimedScene  # noqa: E402
from endview import EndView, TorqueGraph  # noqa: E402
from model import X_BELL, X_FRONT, MotorModel, MotorState  # noqa: E402

themes.apply("sepia")
C = themes.SEPIA_NAMED
B = 0.3                          # medio pulso a 100 BPM
W_MAX = 2 * math.pi * 1.55       # rad/s "funcionando"


def kt(text, size=40, color="ink", weight=BOLD):
    return Text(text, font="Kalam", font_size=size, color=C[color], weight=weight)


# ======================================================================
# Cámara con seguimiento suave
# ======================================================================
class SmoothCam:
    """La cámara persigue un objetivo con suavizado exponencial (arranque
    rápido, llegada suave) y una deriva tipo "cámara en mano"."""

    def __init__(self, scene, center=(0, 0), width=14.22, k=3.0, drift=0.03):
        self.scene = scene
        self.frame = scene.camera.frame
        self.c = np.array([center[0], center[1], 0.0])
        self.w = float(width)
        self.tc, self.tw, self.k = self.c.copy(), self.w, k
        self.drift = drift
        self.frame.move_to(self.c)
        self.frame.set(width=self.w)
        scene.add_updater(self._update)

    def go(self, center=None, width=None, k=None):
        if center is not None:
            self.tc = np.array([center[0], center[1], 0.0])
        if width is not None:
            self.tw = float(width)
        if k is not None:
            self.k = k

    def snap(self, center=None, width=None):
        self.go(center, width)
        self.c, self.w = self.tc.copy(), self.tw

    def _update(self, dt):
        a = 1 - math.exp(-self.k * dt) if dt > 0 else 0
        self.c += (self.tc - self.c) * a
        self.w += (self.tw - self.w) * a
        t = self.scene.t
        d = self.drift * self.w / 14.22
        off = np.array([d * math.sin(t * 0.9) + 0.5 * d * math.sin(t * 2.3 + 1),
                        d * math.cos(t * 0.7) + 0.5 * d * math.sin(t * 1.9), 0])
        self.frame.move_to(self.c + off)
        self.frame.set(width=self.w)


def pop(scene, *mobs, rt=B, sfx=True):
    if sfx:
        scene.sfx("pop", 0.1)
    scene.play(*[FadeIn(m, scale=0.45, rate_func=rate_functions.ease_out_back)
                 for m in mobs], run_time=rt)


def unpop(*mobs):
    return [FadeOut(m, scale=1.3, rate_func=rate_functions.ease_in_quad) for m in mobs]


# ======================================================================
# Rig del motor v2 (sepia + escáner + enfoque)
# ======================================================================
class MotorRigV2:
    STATIC = ("body", "bands", "terminals", "shaft", "battery", "wires")
    INTERIOR = ("magS", "iwires", "brushes", "comm", "coil", "magN", "shaft_in")
    GROUPS = {"magnets": ("magN", "magS"), "coil": ("coil", "shaft_in"),
              "comm": ("comm",), "brushes": ("brushes", "iwires")}
    BBOX = {"magnets": ("magN", "magS"), "coil": ("coil",), "comm": ("comm",),
            "brushes": ("brushes",)}

    def __init__(self, scene: TimedScene, theta0=math.radians(64)):
        self.scene = scene
        self.m = m = MotorModel(width=6.2)
        self.ang = ValueTracker(theta0)
        self.omega = ValueTracker(0.0)
        self.explode = ValueTracker(0.0)
        self.scan = ValueTracker(-100.0)     # x del escáner (mundo)
        self.solid_op = ValueTracker(1.0)
        self.ghost_op = ValueTracker(1.0)
        self.interior_op = ValueTracker(1.0)
        self.p = {k: ValueTracker(0.0) for k in self.STATIC + ("prop",)}
        self.focus = {k: ValueTracker(1.0) for k in self.INTERIOR}
        self.speed = 0.0
        self._last = theta0

        st0 = MotorState()
        body = Drawing()
        body.add(m.casing(st0), m.body_fill(st0), m.body_shade(st0))
        bat = Drawing().add(m.battery(st0), m.battery_fill(st0))
        self.cache = {"body": body, "bands": m.bands(st0),
                      "terminals": m.terminals(st0),
                      "shaft": m.shaft(st0, through=False), "battery": bat,
                      "wires": m.outer_wires(st0)}
        self.ghost = restyle(m.casing(st0), width_mul=0.55)
        self.ghost.add(restyle(m.casing(st0, hidden=True), width_mul=0.55))

        def spin(dt):
            self.ang.increment_value(-self.omega.get_value() * dt)
            a = self.ang.get_value()
            if dt > 0:
                self.speed = abs(self._last - a) / dt
            self._last = a
        scene.add_updater(spin)
        scene.track("motor", lambda: self.speed / W_MAX)
        scene.track("scan_px", lambda: scene.px(self.scan.get_value())[0]
                    if -50 < self.scan.get_value() < 50 else -1.0)
        self.mob = live(self.build)

    def state(self):
        th = self.ang.get_value()
        return MotorState(theta=th, prop=th + 0.35, explode=self.explode.get_value(),
                          spin_blur=min(1.0, self.speed / W_MAX))

    def drawing(self, key, st=None) -> Drawing:
        if key in self.cache:
            return self.cache[key]
        st = st or self.state()
        m = self.m
        if key in ("magN", "magS"):
            return m.magnets(st, which=(key[-1],))[key[-1]]
        if key == "coil":
            return m.coil(st)
        if key == "comm":
            return m.commutator(st)
        if key == "brushes":
            return m.brushes(st)
        if key == "iwires":
            return m.inner_wires(st)
        if key == "shaft_in":
            d = m.shaft(st, x0=X_BELL - 0.2, x1=X_FRONT + 0.12)
            d.strokes = d.strokes[:-1]
            return d
        if key == "prop":
            return m.propeller(st)
        raise KeyError(key)

    def pairs(self, *keys):
        return [(self.drawing(k), self.p[k]) for k in keys]

    def bbox(self, keys):
        st = self.state()
        pts = np.vstack([s.points for k in keys for s in self.drawing(k, st).strokes
                         if not isinstance(s, Fill)])
        lo, hi = pts.min(0), pts.max(0)
        return (lo + hi) / 2, (hi - lo)

    def build(self):
        st = self.state()
        P = {k: v.get_value() for k, v in self.p.items()}
        scan = self.scan.get_value()
        xray_clip, solid_clip = (-1e9, scan), (scan, 1e9)
        sop, gop, iop = (self.solid_op.get_value(), self.ghost_op.get_value(),
                         self.interior_op.get_value())
        motor = VGroup()
        if scan > -50 and gop > 0.001:
            dim = min(self.focus[k].get_value() for k in self.INTERIOR)
            motor.add(self.ghost.render(1.0, gop * (0.55 + 0.45 * dim), xclip=xray_clip))
            for k in self.INTERIOR:
                op = iop * self.focus[k].get_value()
                if op > 0.01:
                    motor.add(self.drawing(k, st).render(1.0, op, xclip=xray_clip))
        if scan < 50 and sop > 0.001:
            motor.add(self.cache["body"].render(P["body"], sop, xclip=solid_clip))
            motor.add(self.cache["bands"].render(P["bands"], sop, xclip=solid_clip))
        motor.add(self.cache["terminals"].render(P["terminals"]))
        motor.add(self.cache["shaft"].render(P["shaft"]))
        if P["prop"] > 0:
            motor.add(self.drawing("prop", st).render(P["prop"]))
            motor.add(self.m.speed_lines(st).render(1.0))
        a = 0.02 * st.spin_blur
        t = self.scene.t
        motor.shift([a * math.sin(t * 47.0), a * math.cos(t * 61.0), 0])
        return VGroup(self.cache["battery"].render(P["battery"]),
                      self.cache["wires"].render(P["wires"]), motor)

    # movimiento ------------------------------------------------------------
    def spin_up(self, w=W_MAX, beats=1):
        self.scene.sfx("motor_start", beats * B)
        self.scene.play(self.omega.animate.set_value(w), run_time=beats * B,
                        rate_func=rate_functions.ease_in_quad)

    def spin_down_to(self, target, beats=(3, 4)):
        """Frena en n medios pulsos y aterriza en `target` (mod π, la bobina es
        simétrica). Se conduce el ángulo directamente con ease-out."""
        w0 = self.omega.get_value()
        th = self.ang.get_value()
        best = None
        for n in beats:
            T = n * B
            ideal = w0 * T / 2
            base = (th - target) % math.pi
            k = round((ideal - base) / math.pi)
            delta = base + max(0, k) * math.pi
            err = abs(delta - ideal)
            if best is None or err < best[0]:
                best = (err, T, delta)
        _, T, delta = best
        self.omega.set_value(0)
        self.scene.sfx("motor_stop", T)
        self.scene.play(self.ang.animate(rate_func=rate_functions.ease_out_quad)
                        .set_value(th - delta), run_time=T)


# ======================================================================
# M1 — Gancho + revelación por escáner + enfoque pieza a pieza
# ======================================================================
class V01v2_M1(TimedScene):
    events_name = "M1"

    def beat(self, n=1):
        self.wait(n * B)

    def construct(self):
        rig = MotorRigV2(self, theta0=math.radians(64))
        m = rig.m
        cam = SmoothCam(self, center=(0.9, 0.25), width=11.4, k=0.9)
        cam.go(width=13.4)
        self.track_camera()
        self.add(rig.mob)

        # 1) Dibujo relámpago (2,7 s) ------------------------------------
        self.mark("draw")
        self.draw(*rig.pairs("body"), run_time=3 * B, sfx="pencil")
        self.draw(*rig.pairs("bands", "terminals"), run_time=B, sfx="pencil")
        self.draw(*rig.pairs("shaft", "prop"), run_time=B, sfx="pencil")
        self.draw(*rig.pairs("battery"), run_time=2 * B, sfx="pencil")
        self.draw(*rig.pairs("wires"), run_time=B, sfx="pencil")
        plus, minus = m.battery_marks(rig.state())
        signs = VGroup(kt("+", 46, "red").move_to(plus), kt("−", 46, "ink").move_to(minus))
        pop(self, *signs)

        # 2) ¡Arranca! (gancho) -------------------------------------------
        self.mark("run")
        self.sfx("impact", 0.5)
        cam.go(center=(0.9, 0.25), width=12.2, k=3.5)
        rig.spin_up(beats=1)
        self.beat(5)

        # 3) Escáner de rayos X ----------------------------------------------
        self.mark("look")
        self.sfx("riser", 2 * B)
        cam.go(center=(0.7, 0.2), width=11.4, k=1.6)
        self.beat(2)
        self.mark("scan")
        self.sfx("scan", 4 * B)
        rig.scan.set_value(-3.2)
        self.play(rig.scan.animate.set_value(4.6), run_time=4 * B, rate_func=linear)
        rig.scan.set_value(60)
        self.mark("xray_hit")
        self.sfx("impact", 0.6)
        cam.go(width=12.4, k=4)
        self.beat(3)

        # 4) Frena y enfoque pieza por pieza (una etiqueta a la vez) -------
        self.mark("slow")
        rig.spin_down_to(math.radians(58), beats=(3, 4))
        st = rig.state()
        # (pieza, etiqueta, color, lado de la etiqueta)
        tour = [("magnets", "imanes", "red", "right"),
                ("coil", "bobina", "red", "upright"),
                ("comm", "conmutador", "ink", "up"),
                ("brushes", "escobillas", "ink", "down")]
        prev = []
        for name, text, col, side in tour:
            keys = rig.GROUPS[name]
            ctr, size = rig.bbox(rig.BBOX[name])
            self.mark(f"focus_{name}")
            dims = [rig.focus[k].animate.set_value(1.0 if k in keys else 0.14)
                    for k in rig.INTERIOR]
            lab = kt(text, 54, col)
            rx, ry = max(0.55, size[0] * 0.62), max(0.45, size[1] * 0.62)
            off = {"right": [rx + 0.75 + lab.width / 2, 0.15],
                   "upright": [rx * 0.55 + lab.width / 2, ry + 0.25],
                   "up": [0, ry + 0.45], "down": [0, -ry - 0.45]}[side]
            lab.move_to(ctr + np.array([off[0], off[1], 0]))
            ring = Drawing().add(hcircle(ctr, rx, ry=ry, color=ORANGE, width=6,
                                         seed=sum(map(ord, name)), rot=-0.12,
                                         overlap=0.35))
            tr = ValueTracker(0)
            ring_mob = live(lambda d=ring, tr=tr: d.render(tr.get_value()))
            focus_c = (ctr + lab.get_center()) / 2
            cam.go(center=focus_c[:2], width=max(7.2, size[0] * 2.6 + 3.5), k=5.5)
            self.sfx("whoosh", B)
            self.play(*dims, *unpop(*prev), run_time=B)
            self.remove(*prev)
            self.add(ring_mob)
            extra = [FadeIn(lab, scale=0.45, rate_func=rate_functions.ease_out_back)]
            self.sfx("pop", 0.1)
            self.draw((ring, tr), run_time=B, sfx="pencil", extra=extra)
            self.beat(1)
            prev = [lab, ring_mob]

        # 5) Todo junto, vuelve a girar -------------------------------------
        self.mark("unfocus")
        cam.go(center=(0.7, 0.2), width=12.8, k=4)
        self.sfx("whoosh", B)
        self.play(*[rig.focus[k].animate.set_value(1.0) for k in rig.INTERIOR],
                  *unpop(*prev), run_time=B)
        self.remove(*prev)
        rig.spin_up(w=W_MAX * 0.6, beats=1)
        self.mark("how")
        self.beat(4)
        # punto focal para la transición "zoom a través" (cara frontal)
        fx, fy = self.px(*m._p([[X_FRONT + 0.12, 0, 0]], rig.state())[0][:2])
        self.mark("end", fx=round(fx, 1), fy=round(fy, 1))


# ======================================================================
# M2 — La física, una idea por golpe
# ======================================================================
EQ_WORLD = np.array([19.0, 0.3, 0])
GRAPH_WORLD = np.array([0.0, -12.0, 0])


class V01v2_M2(TimedScene):
    events_name = "M2"

    def beat(self, n=1):
        self.wait(n * B)

    def construct(self):
        ev = EndView(center=(0, 0.15), W=6.0)
        gr = TorqueGraph(origin=(GRAPH_WORLD[0] - 3.1, GRAPH_WORLD[1] - 0.35), w=6.0,
                         h=1.55, W=6.0)
        th = ValueTracker(math.radians(90))
        phase = ValueTracker(0.0)
        flow_op = ValueTracker(0.0)
        field_op = ValueTracker(1.0)
        graph_phi = ValueTracker(0.0)
        P = {k: ValueTracker(0.0) for k in (
            "casing", "magN", "magS", "field", "brushes", "rotor", "sides",
            "symbols", "forces", "rot_arrow", "axes", "hl")}
        state = {"last_sign": 1, "flash_t": -10.0, "pulses": []}

        def currents():
            s = 1 if math.sin(th.get_value()) > 1e-9 else -1
            return {"A": s, "B": -s}

        def watch(dt):
            phase.increment_value(dt * 0.6)
            s = 1 if math.sin(th.get_value()) > 1e-9 else -1
            if s != state["last_sign"]:
                state["last_sign"] = s
                state["flash_t"] = self.t
                self.sfx("spark", 0.25)
                if not state.get("flipped"):
                    state["flipped"] = True
                    self.mark("flip")
        self.add_updater(watch)

        cam = SmoothCam(self, center=(0, 0.15), width=2.6, k=4.0, drift=0.025)
        cam.go(width=11.6)
        self.track_camera()

        hl_d = Drawing().add(hcircle(ev.c, ev.r_comm + 0.42, color=HILITE,
                                     width=18, seed=77, opacity=0.6))

        def build():
            theta = th.get_value()
            cur = currents()
            v = {k: t.get_value() for k, t in P.items()}
            g = VGroup()
            g.add(hl_d.render(v["hl"]))
            g.add(ev.casing().render(v["casing"]))
            g.add(ev.magnet("N").render(v["magN"]))
            g.add(ev.magnet("S").render(v["magS"]))
            g.add(ev.field_lines().render(v["field"], field_op.get_value()))
            if flow_op.get_value() > 0:
                g.add(ev.field_arrows(phase.get_value()).render(
                    1.0, flow_op.get_value() * field_op.get_value()))
            g.add(ev.brushes().render(v["brushes"]))
            g.add(ev.rotor(theta).render(v["rotor"]))
            g.add(ev.coil_sides(theta, cur).render(v["sides"]))
            g.add(ev.current_symbols(theta, cur).render(v["symbols"]))
            g.add(ev.forces(theta, cur).render(v["forces"]))
            g.add(ev.rotation_arrow().render(v["rot_arrow"]))
            # pulsos (anillos que se expanden) en los lados de la bobina
            for t0 in state["pulses"]:
                age = self.t - t0
                if 0 <= age < 0.7:
                    for which in ("A", "B"):
                        p = ev.side_pos(theta, which)
                        r = 0.32 + age * 1.3
                        s = hcircle(p, r, color=RED, width=5, seed=1400, amp=0.0)
                        g.add(s.to_mobject(1.0, (1 - age / 0.7) * 0.8))
            # chispas en el conmutador
            age = self.t - state["flash_t"]
            if 0 <= age < 0.5:
                k = 1 - age / 0.5
                for sgn in (1, -1):
                    c = ev.c + [sgn * (ev.r_comm + 0.06), 0, 0]
                    for j, a in enumerate(np.linspace(-1.2, 1.2, 7)):
                        dvec = np.array([sgn * math.cos(a), math.sin(a), 0])
                        s = hline(c + dvec * 0.12, c + dvec * (0.3 + 0.45 * k),
                                  color=ORANGE, width=5, seed=1300 + j, amp=0.0)
                        g.add(s.to_mobject(1.0, k))
            g.add(gr.axes().render(v["axes"]))
            phi = graph_phi.get_value()
            if phi > 0.01:
                curves = [c for c in (gr.curve(math.pi / 2, phi, rectified=r)
                                      for r in (False, True)) if c is not None]
                area = curves[-1].points
                poly = np.vstack([area, [area[-1][0], gr.o[1], 0], [area[0][0], gr.o[1], 0]])
                g.add(Drawing([Fill(poly, color=FILL, opacity=0.9, fade=0.01)] + curves).render(1.0))
            return g

        self.add(live(build))

        def pair(key, drawing):
            return (drawing, P[key])

        # 1) Llegada (zoom-out desde dentro del motor) -----------------------
        self.mark("arrive")
        self.sfx("whoosh", 2 * B)
        self.draw(pair("casing", ev.casing()), pair("magN", ev.magnet("N")),
                  pair("magS", ev.magnet("S")), run_time=2 * B, sfx="pencil")
        tN = kt("N", 60, "red").move_to(ev.magnet_label_pos("N"))
        tS = kt("S", 60, "blue").move_to(ev.magnet_label_pos("S"))
        pop(self, tN, tS)

        # 2) Campo magnético ----------------------------------------------
        self.mark("field")
        self.draw(pair("field", ev.field_lines()), run_time=2 * B, sfx="pencil")
        flow_op.set_value(1)
        tB = kt("B", 56, "blue").move_to(ev.c + [1.55, 0.95, 0])
        pop(self, tB)
        self.beat(1)

        # 3) Rotor --------------------------------------------------------
        self.mark("rotor")
        self.play(field_op.animate.set_value(0.35), FadeOut(tB), run_time=B)
        self.draw(pair("brushes", ev.brushes()), pair("rotor", ev.rotor(th.get_value())),
                  pair("sides", ev.coil_sides(th.get_value(), currents())),
                  run_time=2 * B, sfx="pencil")

        # 4) Corriente ------------------------------------------------------
        self.mark("current")
        state["pulses"].append(self.t)
        tp = kt("+", 56, "red").move_to(ev.brush_wire_end(-1) + [0.1, 0, 0])
        tm = kt("−", 56, "ink").move_to(ev.brush_wire_end(1) + [-0.1, 0, 0])
        cam.go(center=(0, 0.35), width=10.8, k=3)
        self.draw(pair("symbols", ev.current_symbols(th.get_value(), currents())),
                  run_time=B, sfx="pop",
                  extra=[FadeIn(tp, scale=0.4), FadeIn(tm, scale=0.4)])
        self.beat(1)
        state["pulses"].append(self.t)
        self.beat(2)

        # 5) ¡Fuerza! --------------------------------------------------------
        self.mark("force")
        self.sfx("impact", 0.5)
        cam.go(center=(0, 0.15), width=10.6, k=7)
        self.draw(pair("forces", ev.forces(th.get_value(), currents())),
                  run_time=B, sfx=None)
        self.beat(3)

        # 6) La ecuación, sola en su zona del pergamino --------------------
        self.mark("eq")
        self.sfx("whoosh", 2 * B)
        cam.go(center=EQ_WORLD[:2], width=11.6, k=8)
        parts = [("F", "green"), ("=", "ink"), ("B", "blue"), ("·", "ink"),
                 ("I", "red"), ("·", "ink"), ("L", "ink")]
        eq = VGroup(*[kt(t, 150, c) for t, c in parts]).arrange(buff=0.62)
        eq.move_to(EQ_WORLD + [0, 0.55, 0])
        subs = VGroup(kt("fuerza", 36, "green"), kt("campo", 36, "blue"),
                      kt("corriente", 36, "red"), kt("longitud", 36, "ink"))
        for s, idx in zip(subs, (0, 2, 4, 6)):
            s.next_to(eq[idx], np.array([0, -1, 0]), buff=0.35)
        self.beat(1)
        for grp in ((0,), (1, 2), (3, 4), (5, 6)):
            pop(self, *[eq[i] for i in grp])
        pop(self, *subs)
        self.beat(2)

        # 7) De vuelta: ¡gira! ---------------------------------------------
        self.mark("back")
        self.sfx("whoosh", B)
        cam.go(center=(0, 0.15), width=11.0, k=8)
        self.play(field_op.animate.set_value(0.55), run_time=B)
        self.remove(eq, subs)
        self.mark("torque")
        self.draw(pair("rot_arrow", ev.rotation_arrow()), run_time=B, sfx="pencil")
        self.sfx("rotate", 4 * B)
        self.play(th.animate.set_value(math.radians(8)), run_time=4 * B, rate_func=smooth)

        # 8) Punto muerto ------------------------------------------------------
        self.mark("dead")
        base = th.get_value()

        def wob(_, a):
            th.set_value(base + 0.10 * math.sin(a * 4 * math.pi) * (1 - a))
        self.play(UpdateFromAlphaFunc(VMobject(), wob), run_time=2 * B, rate_func=linear)
        self.beat(2)

        # 9) El truco: zoom al conmutador -----------------------------------
        self.mark("comm")
        self.sfx("riser", 3 * B)
        cam.go(center=(ev.c[0] + 0.25, ev.c[1] + 0.05), width=3.7, k=6)
        self.beat(2)
        self.draw(pair("hl", hl_d), run_time=B, sfx="pencil")
        self.mark("switch")
        self.play(th.animate.set_value(math.radians(-20)), run_time=3 * B, rate_func=linear)
        self.beat(1)

        # 10) Giro continuo ---------------------------------------------------
        self.mark("drop")
        self.sfx("impact", 0.5)
        cam.go(center=(0, 0.15), width=11.6, k=5)
        start = th.get_value()
        total = 2 * 2 * math.pi
        self.play(P["hl"].animate.set_value(0), run_time=B)

        def drive(_, a):
            th.set_value(start - total * (0.55 * a * a + 0.45 * a))
        self.play(UpdateFromAlphaFunc(VMobject(), drive), run_time=8 * B, rate_func=linear)

        # 11) La gráfica, sola ------------------------------------------------
        self.mark("graph")
        self.sfx("whoosh", 2 * B)
        cam.go(center=GRAPH_WORLD[:2], width=11.6, k=8)
        self.beat(1)
        self.draw(pair("axes", gr.axes()), run_time=2 * B, sfx="pencil")
        ty = kt("empuje de giro", 34, "ink").next_to(
            gr.o + [0, gr.h + 0.4, 0], np.array([1, 0, 0]), buff=0.18)
        tx = kt("vueltas", 34, "ink").move_to(gr.o + [gr.w - 0.5, -0.45, 0])
        self.sfx("rotate", 5 * B)
        self.play(graph_phi.animate.set_value(2 * 2 * math.pi), FadeIn(ty), FadeIn(tx),
                  run_time=5 * B, rate_func=linear)
        tg = kt("con conmutador: siempre empuja", 36, "green")
        tgh = kt("sin conmutador: frenaría", 36, "pencil")
        tg.move_to(gr.o + [gr.w / 2, gr.h + 1.2, 0])
        tgh.move_to(gr.o + [gr.w / 2, -gr.h - 0.55, 0])
        pop(self, tg)
        pop(self, tgh)
        self.mark("end")
        self.beat(3)


# ======================================================================
# M3 — Reconstrucción explosiva
# ======================================================================
class V01v2_M3(TimedScene):
    events_name = "M3"

    def beat(self, n=1):
        self.wait(n * B)

    def construct(self):
        rig = MotorRigV2(self, theta0=math.radians(58))
        m = rig.m
        for k in rig.STATIC + ("prop",):
            rig.p[k].set_value(1.0)
        rig.scan.set_value(60)           # todo en rayos X
        rig.explode.set_value(2.6)       # piezas fuera de cuadro
        cam = SmoothCam(self, center=(1.2, 0.2), width=19.0, k=3)
        self.track_camera()
        self.add(rig.mob)
        plus, minus = m.battery_marks(rig.state())
        self.add(kt("+", 46, "red").move_to(plus), kt("−", 46, "ink").move_to(minus))

        # 1) Las piezas llegan volando ---------------------------------------
        self.mark("fly")
        self.sfx("whoosh", 2 * B)
        self.play(rig.explode.animate.set_value(1.0), run_time=2 * B,
                  rate_func=rate_functions.ease_out_cubic)
        self.beat(1)

        # 2) ¡Ensamblado! (golpe seco) ----------------------------------------
        self.mark("assemble")
        self.sfx("whoosh", 3 * B)
        cam.go(center=(0.8, 0.2), width=13.4, k=2.2)
        self.play(rig.explode.animate.set_value(0.0), run_time=3 * B,
                  rate_func=rate_functions.ease_in_cubic)
        self.mark("slam")
        self.sfx("clack", 0.2)
        self.sfx("impact", 0.5)
        cam.go(width=12.6, k=6)
        self.beat(1)

        # 3) La carcasa vuelve: escáner inverso -----------------------------
        self.mark("solid")
        self.sfx("scan", 3 * B)
        rig.scan.set_value(4.6)
        self.play(rig.scan.animate.set_value(-3.2), run_time=3 * B, rate_func=linear)
        rig.scan.set_value(-100)
        self.beat(1)

        # 4) ¡Funciona! -------------------------------------------------------
        self.mark("spin")
        self.sfx("impact", 0.5)
        cam.go(width=12.0, k=6)
        rig.spin_up(beats=1)
        self.beat(4)

        # 5) Título --------------------------------------------------------------
        self.mark("title")
        cam.go(center=(0.8, 1.55), width=16.2, k=2.6)
        self.beat(16)
        self.mark("end")
