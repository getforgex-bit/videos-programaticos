# Sesión Aislada — `version-1`

> **Cumplimiento de Aislamiento (`AGENTS.md`):**
> Entorno local aislado exclusivamente a `version-1` mediante `./scripts/isolate-session.sh version-1`. Ninguna otra rama `version-*` ha sido ni será consultada.

---

## 1. Índice de Documentación y Bitácoras (`.md`)

1. **[`SESSION.md`](./SESSION.md)** _(este archivo)_ — Resumen ejecutivo de la dirección creativa, arquitectura de capas y estado actual de la sesión.
2. **[`specs/brief.md`](./specs/brief.md)** — Brief técnico y escaleta del video en desarrollo.
3. **[`docs/BITACORA_EVALUACION.md`](./docs/BITACORA_EVALUACION.md)** — Tabla maestra de puntajes (3 Ideas × 9 Estilos Visuales), registro histórico de calificaciones del usuario, qué gustó, qué no gustó y control de versiones corregidas (`v1.0` → `v2.0`).
4. **[`docs/video-01-idea-a-estilo-02-whiteboard.md`](./docs/video-01-idea-a-estilo-02-whiteboard.md)** — Documentación exhaustiva del **Video #1 (`Idea A: El motor invisible` + `Estilo 2: Whiteboard / Dibujo a mano — Edición Boceto Sepia Dopaminérgico v2.0`)**.

---

## 2. Video Activo (#1): Idea A — El motor invisible | Estilo 2 — Boceto Grafito/Sepia Dopaminérgico (`v2.0`)

### Dirección Creativa (`v2.0` tras feedback del usuario y boceto `image.png`)
- **Concepto visual:** *"Boceto Mecánico de Carboncillo y Grafito Sepia de Alta Energía"*. Sobre papel pergamino envejecido (`#EFE1C6` → `#C8AE86`), trazos gruesos de lápiz y carboncillo sepia (`#362312`) con sombreado diagonal denso (`///`) construyen el motor blindado a `3,000 RPM`. Una onda de choque circular disuelve la carcasa a líneas fantasma y revela los dos imanes gigantes en herradura (`N` izquierdo y `S` derecho), la cámara central cuadrada redondeada de doble pared con 4 postes de escobillas, el lazo interno de corriente y las flechas gigantes de Fuerza de Lorentz (`F`) de doble contorno.
- **Coreografía de Cámara Dopaminérgica (6 Escenas Dinámicas):**
  - Whip-pans entre el imán `N`, el imán `S` y el núcleo central.
  - Macro zoom (`1.50x`) hacia los terminales de escobillas cuando entra la corriente eléctrica ($I$) y el campo magnético ($\vec{B}$).
  - Sacudidas de cámara en impactos (*camera shake*), ondas de choque expansivas, líneas radiales de velocidad y explosiones de chispas cada $180^\circ$.
- **Mínima Carga Cognitiva:**
  - Cero paneles estáticos o tablas saturadas; solo **1 título cinético corto a la vez** con animación elástica.

---

## 3. Distribución por Capas

- **Capa 1 — Manim / Python Científico (`layers/manim/`):**
  - [`layers/manim/generate_whiteboard_layer.py`](./layers/manim/generate_whiteboard_layer.py) y [`layers/remotion/src/ManimOscilloscopeLayer.tsx`](./layers/remotion/src/ManimOscilloscopeLayer.tsx).
  - Calcula la telemetría de las 6 escenas, renderiza la cinta minimalista de pulso de torque rectificado $\tau(\theta) = |\sin\theta|$ durante la escena de conmutación y sintetiza la pista de audio dopaminérgica `whiteboard_motor_sfx.wav` (*whooshes*, impactos *sub-bass*, carboncillo y chispazos).
- **Capa 2 — Motion Canvas (`layers/motion-canvas/`):**
  - [`layers/motion-canvas/render_circuit_layer.py`](./layers/motion-canvas/render_circuit_layer.py) y [`layers/remotion/src/MotionCanvasCircuitLayer.tsx`](./layers/remotion/src/MotionCanvasCircuitLayer.tsx).
  - Superpone dinámicamente los indicadores de polaridad (`+I / -I`) en los terminales durante el Macro Zoom de la Escena 3.
- **Capa 3 — Remotion (`layers/remotion/`):**
  - [`layers/remotion/src/MainVideo.tsx`](./layers/remotion/src/MainVideo.tsx), [`layers/remotion/src/IsometricMotorWhiteboard.tsx`](./layers/remotion/src/IsometricMotorWhiteboard.tsx), [`layers/remotion/src/handDrawnUtils.ts`](./layers/remotion/src/handDrawnUtils.ts) y [`layers/remotion/src/WhiteboardAnnotations.tsx`](./layers/remotion/src/WhiteboardAnnotations.tsx).
