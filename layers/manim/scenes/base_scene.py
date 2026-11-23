from manim import *


class BaseMathLayer(Scene):
    """Escena base de ejemplo para renderizar con fondo transparente hacia Remotion.

    Renderizar y copiar al compositor:
        manim -qh -t scenes/base_scene.py BaseMathLayer
    """

    def construct(self):
        axes = Axes(
            x_range=[-4, 4, 1],
            y_range=[-2, 2, 1],
            x_length=8,
            y_length=4,
            axis_config={"color": WHITE, "stroke_opacity": 0.6},
        )
        wave = axes.plot(lambda x: np.sin(x), color=BLUE_C, stroke_width=4)

        self.play(Create(axes), run_time=1.0)
        self.play(Create(wave), run_time=1.5)
        self.wait(1.0)
