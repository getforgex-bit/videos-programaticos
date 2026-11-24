"""Escena base que registra una línea de tiempo de eventos durante el render.

Salidas (JSON junto al video, en $EVENTS_DIR o ./media/events):
  - marks:  hitos con nombre (para sincronizar subtítulos en Remotion)
  - sfx:    eventos de sonido {t, dur, kind, ...} (para el sintetizador de audio)
  - pen:    posición de la punta del rotulador por frame en píxeles (o null)

Así el audio, los textos y el "rotulador" de Remotion se alinean con lo que
Manim realmente renderizó, en lugar de con tiempos escritos a mano.
"""
from __future__ import annotations

import json
import os
from pathlib import Path

from manim import MovingCameraScene, ValueTracker, config, linear

from .sketch import Drawing, Stroke, handwriting_path


class TimedScene(MovingCameraScene):
    events_name: str | None = None

    def setup(self):
        super().setup()
        self._marks: list[dict] = []
        self._sfx: list[dict] = []
        self._pen: dict = {}
        self._active: list[tuple[Drawing, ValueTracker]] = []
        self._channels: dict = {}
        self._channel_data: dict = {}
        self.add_updater(self._record_pen)

    def track(self, name: str, fn):
        """Registra por frame el valor de `fn()` (p. ej. velocidad del motor)."""
        self._channels[name] = fn
        self._channel_data[name] = {}

    # ------------------------------------------------------------------ time
    @property
    def t(self) -> float:
        return float(self.renderer.time)

    def mark(self, name: str, **data):
        self._marks.append({"t": round(self.t, 4), "id": name, **data})

    def sfx(self, kind: str, dur: float = 0.0, at: float | None = None, **data):
        self._sfx.append({"t": round(self.t if at is None else at, 4),
                          "dur": round(dur, 4), "kind": kind, **data})

    # ------------------------------------------------------------- drawing
    def draw(self, *pairs, run_time=1.0, rate_func=linear, sfx="marker",
             extra=(), **kw):
        """Anima pares (Drawing, ValueTracker) de 0→1 registrando el sonido
        de rotulador y la punta para el overlay del rotulador en Remotion."""
        for d, tr in pairs:
            self._active.append((d, tr))
        if sfx:
            total_len = sum(d.length for d, _ in pairs)
            self.sfx(sfx, run_time, intensity=min(1.0, total_len / max(run_time, 0.1) / 6))
        anims = [tr.animate(rate_func=rate_func).set_value(1) for _, tr in pairs]
        self.play(*anims, *extra, run_time=run_time, **kw)
        for pair in pairs:
            if pair in self._active:
                self._active.remove(pair)

    def write(self, *mobs, run_time=0.8, anim=None, **kw):
        """Escribe textos (Write) registrando sonido y trayectoria del rotulador."""
        from manim import Write
        pairs = []
        for m in mobs:
            col = m.get_color().to_hex() if hasattr(m.get_color(), "to_hex") else str(m.get_color())
            path = Drawing([Stroke(handwriting_path(m), color=col)], pause=0.0)
            pairs.append((path, ValueTracker(0)))
        for pair in pairs:
            self._active.append(pair)
        self.sfx("marker", run_time, intensity=0.55, write=True)
        n = len(pairs)
        anims = []
        for i, (m, (d, tr)) in enumerate(zip(mobs, pairs)):
            anims.append(anim(m) if anim else Write(m))
        # trayectorias en secuencia (un texto tras otro)
        def upd(_, alpha):
            for i, (d, tr) in enumerate(pairs):
                tr.set_value(min(1, max(0, alpha * n - i)))
        from manim import UpdateFromAlphaFunc, VMobject
        driver = UpdateFromAlphaFunc(VMobject(), upd)
        from manim import LaggedStart
        self.play(LaggedStart(*anims, lag_ratio=1.0), driver, run_time=run_time, **kw)
        for pair in pairs:
            self._active.remove(pair)

    @property
    def frame_index(self) -> int:
        return int(round(self.t * config.frame_rate))

    def _record_pen(self, dt):
        fi = self.frame_index
        for name, fn in self._channels.items():
            self._channel_data[name][fi] = round(float(fn()), 4)
        tip = None
        color = None
        for d, tr in self._active:
            v = tr.get_value()
            if 0 < v < 1:
                hit = d.tip_stroke(v)
                if hit is not None:
                    from .sketch import tc
                    tip, color = hit[0], tc(hit[1].color)
                    break
        if tip is None:
            self._pen[fi] = None
            return
        frame = self.camera.frame
        cx, cy = frame.get_center()[:2]
        fw, fh = frame.width, frame.height
        px = ((tip[0] - cx) / fw + 0.5) * config.pixel_width
        py = (0.5 - (tip[1] - cy) / fh) * config.pixel_height
        self._pen[fi] = [round(float(px), 1), round(float(py), 1), color]

    # ---------------------------------------------------------- cámara
    def px(self, x, y=0.0):
        """Coordenadas de mundo → píxeles de pantalla (cámara actual)."""
        frame = self.camera.frame
        cx, cy = frame.get_center()[:2]
        return (((x - cx) / frame.width + 0.5) * config.pixel_width,
                (0.5 - (y - cy) / frame.height) * config.pixel_height)

    def track_camera(self):
        """Exporta la cámara por frame (para desenfoque de movimiento)."""
        f = self.camera.frame
        self.track("cam_x", lambda: f.get_center()[0])
        self.track("cam_y", lambda: f.get_center()[1])
        self.track("cam_w", lambda: f.width)

    # --------------------------------------------------------------- export
    def tear_down(self):
        super().tear_down()
        out_dir = Path(os.environ.get("EVENTS_DIR", "media/events"))
        out_dir.mkdir(parents=True, exist_ok=True)
        name = self.events_name or type(self).__name__
        n = int(round(self.t * config.frame_rate))

        def dense(d, fill):
            out, last = [], fill
            for i in range(n):
                if i in d:
                    last = d[i]
                out.append(last if i in d or fill is not None else None)
            return out
        data = {
            "scene": name,
            "fps": config.frame_rate,
            "duration": round(self.t, 4),
            "marks": self._marks,
            "sfx": self._sfx,
            "frames": n,
            "pen": [self._pen.get(i) for i in range(n)],
            "channels": {k: dense(v, 0.0) for k, v in self._channel_data.items()},
        }
        (out_dir / f"{name}.events.json").write_text(
            json.dumps(data, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8")
