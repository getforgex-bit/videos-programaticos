from manim import *
import numpy as np


class MotorInvisibleWhiteboardPhysics(Scene):
    """Capa 1 (Manim): Física Electromagnética para 'Idea A — El motor invisible'
    en Estilo 2 (Whiteboard / Dibujo a mano).

    Representa:
    1. Ley de Fuerza de Lorentz: F = I (L x B)
    2. Curva de Par Motor Rectificado por el Conmutador: tau(theta) = tau_max * |sin(theta)|
    3. Corriente alternada en la espira tras cada conmutación a 180 grados.
    """

    def construct(self):
        axes = Axes(
            x_range=[0, 4 * PI, PI],
            y_range=[-1.2, 1.4, 0.5],
            x_length=7.5,
            y_length=3.2,
            axis_config={"color": "#181A1F", "stroke_width": 3},
        ).to_corner(DR, buff=0.6)

        torque_curve = axes.plot(
            lambda theta: np.abs(np.sin(theta)),
            color="#059669",
            stroke_width=4.5,
        )
        raw_ac_curve = axes.plot(
            lambda theta: np.sin(theta),
            color="#94A3B8",
            stroke_width=2.0,
        )

        self.play(Create(axes), run_time=1.2)
        self.play(Create(raw_ac_curve), Create(torque_curve), run_time=2.5)
        self.wait(1.0)
