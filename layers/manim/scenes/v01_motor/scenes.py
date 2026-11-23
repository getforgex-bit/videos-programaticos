"""Video 01 — "El motor invisible" · Estilo pizarra / dibujo a mano.

Escenas (cada una se renderiza a un .webm con alfa + un .events.json):
  V01_M1_Revelacion      motor 3/4 → funciona → carcasa transparente → piezas
  V01_M2_Fisica          vista frontal: campo, corriente, fuerza, conmutador
  V01_M3_Reconstruccion  despiece → ensamblado → carcasa sólida → gira

Render (desde layers/manim):
  EVENTS_DIR=../remotion/public/layers/v01 \
  .venv/bin/manim -qh -t --format webm scenes/v01_motor/scenes.py V01_M1_Revelacion
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
sys.path.insert(0, str(HERE))

import numpy as np  # noqa: E402
from manim import (BOLD, NORMAL, FadeOut, Text, ValueTracker, VGroup,  # noqa: E402
                   always_redraw, linear, rate_functions, smooth)

from common.sketch import (BLUE, GREEN, HILITE, INK, ORANGE, PENCIL, RED,  # noqa: E402
                           Drawing, Stroke, curved_arrow, hcircle, hline,
                           restyle, wobble)
from common.timed_scene import TimedScene  # noqa: E402
from endview import EndView, TorqueGraph  # noqa: E402
from model import MotorModel, MotorState  # noqa: E402

W_MAX = 2 * math.pi * 1.55      # velocidad "funcionando" (rad/s)


def kalam(text, size=40, color=INK, weight=NORMAL, **kw):
    return Text(text, font="Kalam", font_size=size, color=color, weight=weight,
                **kw)


# ======================================================================
# Rig del motor 3/4 (compartido por M1 y M3)
# ======================================================================
class MotorRig:
    STATIC = ("casing", "bands", "terminals", "shaft", "battery", "wires")
    DYNAMIC = ("magN", "magS", "coil", "comm", "brushes", "iwires", "shaft_in",
               "prop")

    def __init__(self, scene: TimedScene, theta0=math.radians(70)):
        self.scene = scene
        self.m = MotorModel()
        self.ang = ValueTracker(theta0)
        self.omega = ValueTracker(0.0)
        self.explode = ValueTracker(0.0)
        self.solid_op = ValueTracker(1.0)
        self.ghost_op = ValueTracker(0.0)
        self.interior_op = ValueTracker(1.0)
        self.p = {k: ValueTracker(0.0) for k in self.STATIC + self.DYNAMIC}
        self.p["ghost"] = ValueTracker(1.0)

        st0 = MotorState()
        m = self.m
        self.cache = {
            "casing": m.casing(st0),
            "bands": m.bands(st0),
            "terminals": m.terminals(st0),
            "shaft": m.shaft(st0, through=False),
            "battery": m.battery(st0),
            "wires": m.outer_wires(st0),
        }
        self.ghost = restyle(self.cache["casing"], width_mul=0.7)
        self.ghost.add(restyle(m.casing(st0, hidden=True), width_mul=0.7))

        def spin(dt):
            self.ang.increment_value(-self.omega.get_value() * dt)
        scene.add_updater(spin)
        scene.track("motor", lambda: self.omega.get_value() / W_MAX)
        self.mob = always_redraw(self.build)

    # estado ---------------------------------------------------------------
    def state(self) -> MotorState:
        th = self.ang.get_value()
        blur = min(1.0, abs(self.omega.get_value()) / W_MAX)
        e = self.explode.get_value()
        return MotorState(theta=th, prop=th + 0.35, explode=e, spin_blur=blur)

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
            from model import X_BELL, X_FRONT
            d = m.shaft(st, x0=X_BELL - 0.2, x1=X_FRONT + 0.12)
            d.strokes = d.strokes[:-1]   # sin tapa en el extremo
            return d
        if key == "prop":
            return m.propeller(st)
        raise KeyError(key)

    def pairs(self, *keys):
        return [(self.drawing(k), self.p[k]) for k in keys]

    # construcción por frame ----------------------------------------------
    def build(self):
        st = self.state()
        P = {k: v.get_value() for k, v in self.p.items()}
        sop, gop, iop = (self.solid_op.get_value(), self.ghost_op.get_value(),
                         self.interior_op.get_value())
        motor = VGroup()
        if gop > 0.001:
            motor.add(self.ghost.render(P["ghost"], gop))
        if iop > 0.001 and gop > 0.001:
            for k in ("magS", "iwires", "brushes", "comm", "coil", "magN",
                      "shaft_in"):
                if P[k] > 0:
                    motor.add(self.drawing(k, st).render(P[k], iop * min(1, gop * 1.5)))
        if sop > 0.001:
            motor.add(self.cache["casing"].render(P["casing"], sop))
            motor.add(self.cache["bands"].render(P["bands"], sop))
        motor.add(self.cache["terminals"].render(P["terminals"]))
        motor.add(self.cache["shaft"].render(P["shaft"]))
        if P["prop"] > 0:
            motor.add(self.drawing("prop", st).render(P["prop"]))
            motor.add(self.m.speed_lines(st).render(1.0))
        a = 0.014 * st.spin_blur
        t = self.scene.t
        motor.shift([a * math.sin(t * 47.0), a * math.cos(t * 61.0), 0])
        g = VGroup(self.cache["battery"].render(P["battery"]),
                   self.cache["wires"].render(P["wires"]), motor)
        return g

    # movimiento ------------------------------------------------------------
    def spin_up(self, w=W_MAX, run_time=1.0):
        self.scene.sfx("motor_start", run_time)
        self.scene.play(self.omega.animate.set_value(w), run_time=run_time,
                        rate_func=rate_functions.ease_in_quad)

    def spin_down_to(self, target, min_time=1.0):
        w0 = self.omega.get_value()
        th = self.ang.get_value()
        # la bobina es simétrica a media vuelta: basta llegar a target mod π
        delta = (th - target) % math.pi
        while 2 * delta / w0 < min_time:
            delta += math.pi
        T = 2 * delta / w0
        self.scene.sfx("motor_stop", T)
        self.scene.play(self.omega.animate.set_value(0), run_time=T,
                        rate_func=linear)
        return T


def label_with_arrow(scene, text, pos, target, color=INK, size=40, bend=0.25,
                     run_time=0.4, seed=0, gap=0.18):
    """Escribe una etiqueta y dibuja una flecha curva hacia `target`."""
    pos = np.array([pos[0], pos[1], 0.0])
    t = kalam(text, size=size, color=color).move_to(pos)
    # la flecha sale del borde de la etiqueta más cercano al objetivo
    target = np.asarray(target, float)
    start = np.array(t.get_center())
    v = target - start
    v /= np.linalg.norm(v) + 1e-9
    w, h = t.width / 2 + 0.08, t.height / 2 + 0.08
    k = min(w / (abs(v[0]) + 1e-9), h / (abs(v[1]) + 1e-9))
    a = start + v * k
    b = target - v * gap
    d = Drawing().add(curved_arrow(a, b, bend=bend, color=color, width=4.2,
                                   seed=seed))
    tr = ValueTracker(0)
    mob = always_redraw(lambda: d.render(tr.get_value()))
    scene.add(mob)
    scene.write(t, run_time=run_time)
    scene.draw((d, tr), run_time=0.3)
    return VGroup(t, mob)


# ======================================================================
# M1 — Apertura y revelación
# ======================================================================
class V01_M1_Revelacion(TimedScene):
    events_name = "M1"

    def construct(self):
        rig = MotorRig(self, theta0=math.radians(64))
        self.add(rig.mob)
        m = rig.m

        # 1) Dibujar el motor --------------------------------------------
        self.mark("draw_motor")
        self.wait(0.4)
        self.draw(*rig.pairs("casing"), run_time=1.8)
        self.draw(*rig.pairs("bands", "terminals"), run_time=0.5)
        self.draw(*rig.pairs("shaft", "prop"), run_time=0.7)
        self.draw(*rig.pairs("battery"), run_time=0.7)
        self.draw(*rig.pairs("wires"), run_time=0.6)
        st = rig.state()
        plus, minus = m.battery_marks(st)
        tp = kalam("+", 44, RED, BOLD).move_to(plus)
        tm = kalam("−", 44, INK, BOLD).move_to(minus)
        self.write(tp, tm, run_time=0.35)
        self.wait(0.15)

        # 2) Funciona ------------------------------------------------------
        self.mark("run")
        rig.spin_up(run_time=0.9)
        self.wait(1.9)
        self.mark("question")
        self.wait(1.9)

        # 3) Se detiene y la carcasa se vuelve transparente ---------------
        self.mark("spin_down")
        rig.spin_down_to(math.radians(58), min_time=1.0)
        self.wait(0.2)
        self.mark("xray")
        self.sfx("reveal", 1.2)
        self.play(rig.solid_op.animate.set_value(0),
                  rig.ghost_op.animate.set_value(1), run_time=1.2)
        self.wait(0.1)

        # 4) Piezas internas, dibujadas y rotuladas ------------------------
        self.mark("inside")
        st = rig.state()
        labels = VGroup()
        self.draw(*rig.pairs("magN"), run_time=0.8)
        labels.add(label_with_arrow(self, "imán (N)", (3.15, 3.05),
                                    m.magnet_label_pos(st, "N") + [0.05, -0.1, 0],
                                    color=RED, seed=31, bend=-0.25))
        self.draw(*rig.pairs("magS"), run_time=0.8)
        labels.add(label_with_arrow(self, "imán (S)", (3.55, -2.45),
                                    m.magnet_center(st, "S") + [0.25, -0.05, 0],
                                    color=BLUE, seed=32, bend=0.25))
        self.mark("coil")
        self.draw(*rig.pairs("shaft_in"), run_time=0.4)
        self.draw(*rig.pairs("coil"), run_time=0.9)
        labels.add(label_with_arrow(self, "bobina", (5.0, 1.05),
                                    m.coil_side_center(st, 1, x=0.75),
                                    color=RED, seed=33, bend=-0.2))
        self.mark("comm")
        self.draw(*rig.pairs("comm"), run_time=0.6)
        labels.add(label_with_arrow(self, "conmutador", (-1.9, 3.15),
                                    m.commutator_center(st) + [0, 0.25, 0],
                                    seed=34, bend=0.3))
        self.draw(*rig.pairs("brushes", "iwires"), run_time=0.7)
        labels.add(label_with_arrow(self, "escobillas", (-1.2, -2.55),
                                    m.brush_center(st, -1), seed=35, bend=-0.3))
        self.wait(0.6)

        # 5) Funciona por dentro ------------------------------------------
        self.mark("run_xray")
        self.play(labels.animate.set_opacity(0.0), run_time=0.4)
        self.remove(labels)
        rig.spin_up(w=W_MAX * 0.55, run_time=0.8)
        self.wait(2.3)
        self.mark("end")


# ======================================================================
# M2 — La física (vista frontal)
# ======================================================================
class V01_M2_Fisica(TimedScene):
    events_name = "M2"

    def construct(self):
        ev = EndView()
        gr = TorqueGraph()
        th = ValueTracker(math.radians(90))
        phase = ValueTracker(0.0)
        flow_op = ValueTracker(0.0)
        P = {k: ValueTracker(0.0) for k in (
            "casing", "magN", "magS", "field", "brushes", "rotor", "sides",
            "symbols", "forces", "rot_arrow", "axes", "hl")}
        graph = {"on": False, "theta0": 0.0, "phi": ValueTracker(0.0)}
        state = {"last_sign": 1, "flash_t": -10.0}

        def currents():
            s = 1 if math.sin(th.get_value()) > 1e-9 else -1
            return {"A": s, "B": -s}

        def watch(dt):
            phase.increment_value(dt * 0.45)
            s = 1 if math.sin(th.get_value()) > 1e-9 else -1
            if s != state["last_sign"]:
                state["last_sign"] = s
                state["flash_t"] = self.t
                self.sfx("click", 0.15)
        self.add_updater(watch)

        hl_d = Drawing().add(hcircle(ev.c, ev.r_comm + 0.42, color=HILITE,
                                     width=16, seed=77, opacity=0.65))

        def build():
            theta = th.get_value()
            cur = currents()
            g = VGroup()
            v = {k: t.get_value() for k, t in P.items()}
            g.add(hl_d.render(v["hl"]))
            g.add(ev.casing().render(v["casing"]))
            g.add(ev.magnet("N").render(v["magN"]))
            g.add(ev.magnet("S").render(v["magS"]))
            g.add(ev.field_lines().render(v["field"]))
            if flow_op.get_value() > 0:
                g.add(ev.field_arrows(phase.get_value()).render(
                    1.0, flow_op.get_value()))
            g.add(ev.brushes().render(v["brushes"]))
            g.add(ev.rotor(theta).render(v["rotor"]))
            g.add(ev.coil_sides(theta, cur).render(v["sides"]))
            g.add(ev.current_symbols(theta, cur).render(v["symbols"]))
            g.add(ev.forces(theta, cur).render(v["forces"]))
            g.add(ev.rotation_arrow().render(v["rot_arrow"]))
            # chispa en el conmutador al invertir la corriente
            age = self.t - state["flash_t"]
            if 0 <= age < 0.45:
                k = 1 - age / 0.45
                for sgn in (1, -1):
                    c = ev.c + [sgn * (ev.r_comm + 0.06), 0, 0]
                    for j, a in enumerate(np.linspace(-1.0, 1.0, 5)):
                        dvec = np.array([sgn * math.cos(a), math.sin(a), 0])
                        s = hline(c + dvec * 0.12, c + dvec * (0.26 + 0.2 * k),
                                  color=ORANGE, width=4, seed=1300 + j, amp=0.0)
                        g.add(s.to_mobject(1.0, k))
            g.add(gr.axes().render(v["axes"]))
            if graph["on"]:
                phi = min(graph["phi"].get_value(), gr.turns * 2 * math.pi)
                curves = [c for c in (gr.curve(graph["theta0"], phi, rectified=r)
                                      for r in (False, True)) if c is not None]
                if curves:
                    g.add(Drawing(curves).render(1.0))
            return g

        self.add(always_redraw(build))

        def pair(key, drawing):
            return (drawing, P[key])

        # 1) Vista frontal -------------------------------------------------
        self.mark("front_view")
        self.wait(0.3)
        self.draw(pair("casing", ev.casing()), run_time=0.9)
        self.draw(pair("magN", ev.magnet("N")), pair("magS", ev.magnet("S")),
                  run_time=1.6, rate_func=linear)
        # las letras van en un hueco que el rayado deja libre (holes=...)
        tN = kalam("N", 52, RED, BOLD).move_to(ev.magnet_label_pos("N"))
        tS = kalam("S", 52, BLUE, BOLD).move_to(ev.magnet_label_pos("S"))
        self.write(tN, tS, run_time=0.5)
        self.wait(0.2)

        # 2) Campo magnético ----------------------------------------------
        self.mark("field")
        self.draw(pair("field", ev.field_lines()), run_time=1.3)
        self.play(flow_op.animate.set_value(1), run_time=0.4)
        lb = label_with_arrow(self, "campo B", (0.55, 2.75),
                              ev.c + [1.16, 1.0, 0], color=BLUE, seed=51,
                              bend=-0.25)
        self.wait(0.6)

        # 3) Rotor: conmutador, escobillas y bobina -----------------------
        self.mark("rotor")
        self.draw(pair("brushes", ev.brushes()), run_time=0.8)
        self.draw(pair("rotor", ev.rotor(th.get_value())), run_time=0.7)
        self.draw(pair("sides", ev.coil_sides(th.get_value(), currents())),
                  run_time=0.6)
        tp = kalam("+", 50, RED, BOLD).move_to(ev.brush_wire_end(-1) + [0.1, 0, 0])
        tm = kalam("−", 50, INK, BOLD).move_to(ev.brush_wire_end(1) + [-0.1, 0, 0])
        self.write(tp, tm, run_time=0.4)

        # 4) Corriente -------------------------------------------------------
        self.mark("current")
        self.draw(pair("symbols", ev.current_symbols(th.get_value(), currents())),
                  run_time=0.6)
        li = label_with_arrow(self, "corriente I", (0.75, 1.25),
                              ev.side_pos(th.get_value(), "A") + [0.2, 0.1, 0],
                              color=RED, seed=52, bend=0.2, size=36)
        self.wait(0.7)

        # 5) Fuerza ----------------------------------------------------------
        self.mark("force")
        self.draw(pair("forces", ev.forces(th.get_value(), currents())),
                  run_time=0.8)
        eq = Text("F = B · I · L", font="Kalam", font_size=64, weight=BOLD,
                  t2c={"F": GREEN, "B": BLUE, "I": RED}, color=INK)
        eq.move_to(np.array([3.7, 2.85, 0]))
        self.play(FadeOut(lb), FadeOut(li), run_time=0.3)
        self.write(eq, run_time=1.0)
        eq_sub = kalam("fuerza = campo · corriente · longitud", 27, PENCIL)
        eq_sub.next_to(eq, direction=np.array([0, -1, 0]), buff=0.12)
        self.write(eq_sub, run_time=0.7)
        self.wait(0.5)

        # 6) Par → giro --------------------------------------------------------
        self.mark("torque")
        self.draw(pair("rot_arrow", ev.rotation_arrow()), run_time=0.6)
        self.wait(0.3)
        self.sfx("rotate", 2.2)
        self.play(th.animate.set_value(math.radians(9)), run_time=2.2,
                  rate_func=smooth)
        self.mark("dead_spot")
        self.wait(0.9)

        # 7) El conmutador (zoom) -------------------------------------------
        self.mark("commutator")
        frame = self.camera.frame
        self.play(frame.animate.scale(0.46).move_to(ev.c + [0.35, 0.05, 0]),
                  run_time=1.0, rate_func=smooth)
        self.draw(pair("hl", hl_d), run_time=0.5, sfx="hilite")
        self.wait(0.2)
        self.play(th.animate.set_value(math.radians(-24)), run_time=2.2,
                  rate_func=linear)
        self.wait(0.4)
        self.play(frame.animate.scale(1 / 0.46).move_to(np.array([0, 0, 0])),
                  P["hl"].animate.set_value(0), run_time=1.0, rate_func=smooth)

        # 8) Giro continuo + gráfica de par -----------------------------
        self.mark("continuous")
        self.draw(pair("axes", gr.axes()), run_time=0.8)
        ty = kalam("empuje de giro", 28, INK).next_to(
            gr.o + [0, gr.h + 0.38, 0], direction=np.array([1, 0, 0]), buff=0.15)
        tx = kalam("vueltas", 28, INK).move_to(gr.o + [gr.w - 0.45, -0.42, 0])
        self.write(ty, tx, run_time=0.6)
        graph["theta0"] = th.get_value()
        graph["on"] = True
        start = th.get_value()
        total = 2 * 2 * math.pi

        def drive(mob, alpha):
            a = rate_functions.ease_in_sine(alpha) * 0.55 + alpha * 0.45
            th.set_value(start - total * a)
            graph["phi"].set_value(total * a)
        from manim import UpdateFromAlphaFunc, VMobject
        self.sfx("rotate", 5.6, fast=True)
        self.play(UpdateFromAlphaFunc(VMobject(), drive), run_time=5.6,
                  rate_func=linear)
        tg = kalam("con conmutador: siempre empuja", 28, GREEN)
        tgh = kalam("sin conmutador: frenaría", 28, PENCIL)
        right = gr.o[0] + gr.w + 0.3
        tg.move_to(np.array([right - tg.width / 2, gr.o[1] + gr.h + 1.28, 0]))
        tgh.move_to(np.array([right - tgh.width / 2, gr.o[1] + gr.h + 0.86, 0]))
        self.write(tg, tgh, run_time=1.0)
        self.mark("end")
        self.wait(1.2)


# ======================================================================
# M3 — Reconstrucción
# ======================================================================
class V01_M3_Reconstruccion(TimedScene):
    events_name = "M3"

    def construct(self):
        rig = MotorRig(self, theta0=math.radians(58))
        rig.explode.set_value(1.0)
        rig.solid_op.set_value(1.0)
        rig.ghost_op.set_value(1.0)
        rig.p["ghost"].set_value(0.0)
        self.add(rig.mob)
        m = rig.m
        frame = self.camera.frame
        frame.scale(1.32).shift([0.55, 0.0, 0])

        # 1) Despiece dibujado rápido ------------------------------------
        self.mark("exploded")
        self.wait(0.3)
        self.draw((rig.ghost, rig.p["ghost"]), run_time=1.1)
        self.draw(*rig.pairs("magN", "magS"), run_time=1.0)
        self.draw(*rig.pairs("shaft_in", "coil", "comm", "prop"), run_time=1.1)
        rig.p["shaft"].set_value(1)
        self.draw(*rig.pairs("brushes", "iwires"), run_time=0.6)
        self.draw(*rig.pairs("battery", "wires", "terminals"), run_time=0.9)
        st = rig.state()
        plus, minus = m.battery_marks(st)
        self.write(kalam("+", 44, RED, BOLD).move_to(plus),
                   kalam("−", 44, INK, BOLD).move_to(minus), run_time=0.3)
        self.wait(0.3)

        # 2) Ensamblado (con "push-in" de cámara) --------------------------
        self.mark("assemble")
        self.sfx("assemble", 1.8)
        self.play(rig.explode.animate.set_value(0),
                  frame.animate.scale(1 / 1.32).move_to(np.array([0, 0, 0])),
                  run_time=1.8, rate_func=rate_functions.ease_in_out_cubic)
        self.sfx("clack", 0.2)
        self.wait(0.4)

        # 3) La carcasa vuelve a ser sólida -------------------------------
        self.mark("solidify")
        self.draw(*rig.pairs("casing"), run_time=1.5)
        self.play(rig.ghost_op.animate.set_value(0),
                  rig.interior_op.animate.set_value(0), run_time=0.7)
        self.draw(*rig.pairs("bands"), run_time=0.4)
        self.wait(0.2)

        # 4) ¡Funciona! -------------------------------------------------------
        self.mark("spin")
        rig.spin_up(run_time=0.9)
        self.wait(1.6)
        self.mark("title")
        self.play(frame.animate.scale(1.18).shift([0.0, 0.85, 0]), run_time=1.4,
                  rate_func=smooth)
        self.wait(4.2)
        self.mark("end")
