# Sesión Aislada — `version-1`

> **Cumplimiento de Aislamiento (`AGENTS.md`):**
> Entorno local aislado exclusivamente a `version-1` mediante `./scripts/isolate-session.sh version-1`. Ninguna otra rama `version-*` ha sido ni será consultada.

---

## 1. Índice de Documentación y Bitácoras (`.md`)

Para cumplir con el registro riguroso de **toma de decisiones con criterio propio, aciertos, fallos, puntajes del usuario y correcciones iterativas**, la documentación de esta rama se organiza en:

1. **[`SESSION.md`](./SESSION.md)** _(este archivo)_ — Resumen ejecutivo de la dirección creativa, arquitectura de capas y estado actual de la sesión.
2. **[`specs/brief.md`](./specs/brief.md)** — Brief técnico, escaleta frame a frame y distribución de capas del video en desarrollo.
3. **[`docs/BITACORA_EVALUACION.md`](./docs/BITACORA_EVALUACION.md)** — Tabla maestra de puntajes (3 Ideas × 9 Estilos Visuales), registro histórico de calificaciones del usuario, qué gustó, qué no gustó y control de versiones corregidas.
4. **[`docs/video-01-idea-a-estilo-02-whiteboard.md`](./docs/video-01-idea-a-estilo-02-whiteboard.md)** — Documentación exhaustiva del **Video #1 (`Idea A: El motor invisible` + `Estilo 2: Whiteboard / Dibujo a mano`)**: decisiones de diseño, física electromagnética, aciertos, fallos detectados en autocrítica y espacio para evaluación del usuario.

---

## 2. Video Activo (#1): Idea A — El motor invisible | Estilo 2 — Whiteboard / Dibujo a mano

### Dirección Creativa
- **Concepto visual:** *"Cuaderno / Pizarrón de Ingeniería Cinemático en Vivo"*. Combinamos la claridad didáctica del dibujo a mano alzada sobre pizarrón blanco con la precisión mecánica de un plano isométrico 2.5D que cobra vida. Un marcador traza progresivamente la carcasa del motor; el eje arranca a `2,800 RPM`; un barrido de Rayos-X vuelve transparente la carcasa (`18%` opacidad en línea punteada de grafito) revelando el estator magnético ($N/S$), el rotor bobinado en cobre y el colector con escobillas; se dibuja el flujo de corriente ($I$), las líneas de campo magnético ($\vec{B}$) y el par de Fuerzas de Lorentz ($\vec{F} = I\vec{L} \times \vec{B}$); y finalmente se reconstruye la carcasa dejando una ventana de corte arquitectónico para conservar visible el principio físico.
- **Paleta de Marcadores sobre Pizarrón Porcelana (`#F6F4EC`):**
  - **Tinta Carbón (`#181A1F`):** Contornos mecánicos, carcasa aleteada, tapas, rodamientos y caligrafía principal.
  - **Grafito de Construcción (`#64748B`):** Ejes isométricos (`— · —`), cotas (`L = 210 mm`), líneas guía y carcasa fantasma en modo transparente.
  - **Rojo Carmesí (`#DC2626`):** Polo Norte magnético ($N$), potencial positivo ($+V$) y pulsos de corriente eléctrica ($+I$).
  - **Azul Cobalto (`#1D4ED8`):** Polo Sur magnético ($S$), potencial negativo ($-V$) y líneas de flujo magnético ($\vec{B}$).
  - **Ámbar / Cobre (`#D97706` / `#F59E0B`):** Espiras del bobinado del rotor, delgas del conmutador y chispazo de inversión a $180^\circ$.
  - **Verde Esmeralda (`#059669`):** Vectores de Fuerza de Lorentz ($\uparrow \vec{F}$, $\downarrow -\vec{F}$), par motor ($\vec{\tau}$) y curva rectificada en el osciloscopio.
- **Tipografía:** `'Humor Sans'` (títulos manuscritos con carácter de marcador seco) + `'Comic Neue'` (anotaciones técnicas, cotas y fórmulas legibles a 1080p).

---

## 3. Distribución por Capas (Pipeline Híbrido Real)

- **Capa 1 — Manim / Python Científico (`layers/manim/`):**
  - Escena base [`layers/manim/scenes/base_scene.py`](./layers/manim/scenes/base_scene.py) y generador [`layers/manim/generate_whiteboard_layer.py`](./layers/manim/generate_whiteboard_layer.py).
  - Exporta `layers/remotion/public/layers/manim_torque_wave.webm` (osciloscopio científico dibujado a mano que grafica en tiempo real el torque rectificado $\tau(\theta) = N \cdot I \cdot A \cdot B \cdot |\sin(\theta)|$ frente a la onda AC sin rectificar), la tabla maestra `manim_physics_telemetry.json` (900 frames de cinemática exacta) y el diseño sonoro procedural `whiteboard_motor_sfx.wav`.
- **Capa 2 — Motion Canvas (`layers/motion-canvas/`):**
  - Escena [`layers/motion-canvas/src/scenes/example.tsx`](./layers/motion-canvas/src/scenes/example.tsx) y generador [`layers/motion-canvas/render_circuit_layer.py`](./layers/motion-canvas/render_circuit_layer.py).
  - Exporta `layers/remotion/public/layers/motion_canvas_circuit.webm` (diagrama esquemático animado de la fuente DC, cierre del interruptor `SW1`, escobillas de carbón $B_+/B_-$ y rotación sincronizada del colector de delgas invirtiendo la corriente cada $180^\circ$).
- **Capa 3 — Remotion (`layers/remotion/`):**
  - Compositor maestro [`layers/remotion/src/MainVideo.tsx`](./layers/remotion/src/MainVideo.tsx), motor isométrico 2.5D trazado a mano [`layers/remotion/src/IsometricMotorWhiteboard.tsx`](./layers/remotion/src/IsometricMotorWhiteboard.tsx), generador de trazos con imperfección orgánica [`layers/remotion/src/handDrawnUtils.ts`](./layers/remotion/src/handDrawnUtils.ts) y HUD de pizarrón [`layers/remotion/src/WhiteboardAnnotations.tsx`](./layers/remotion/src/WhiteboardAnnotations.tsx).
  - Integra las capas `.webm` de Manim y Motion Canvas mediante `mixBlendMode: 'multiply'` para que la tinta de todas las herramientas se funda orgánicamente sobre la textura y retícula del pizarrón.

---

## 4. Notas de Render y Entrega
- **Pipeline completo reproducible:**
  ```bash
  python3 layers/manim/generate_whiteboard_layer.py
  python3 layers/motion-canvas/render_circuit_layer.py
  npm run render:remotion
  ```
- **Archivo de salida:** `output/final.mp4` (y copia archivada de la versión en `output/video-01-idea-a-whiteboard-v1.0.mp4`).
- **Estado actual:** Video #1 (`v1.0`) renderizado y documentado, listo para revisión y puntaje del usuario.
