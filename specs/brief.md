# Brief del Video — Serie de Experimentación Visual (`version-1`)

> Este documento define las especificaciones técnicas, estructura narrativa y matriz de producción para los videos desarrollados en la rama `version-1`.

## 1. Marco General de la Sesión
- **Rama activa:** `version-1` (estrictamente aislada según `AGENTS.md`)
- **Dinámica de trabajo:** Desarrollo iterativo de **3 ideas de video** a través de **9 estilos visuales**, construyendo y evaluando **1 idea con 1 estilo visual a la vez**.
- **Documentación y Evaluación:** Cada video registra su toma de decisiones bajo criterio propio, aciertos técnicos/artísticos, fallos detectados en autocrítica, puntaje otorgado por el usuario y bitácora de correcciones.

---

## 2. Video Activo (#1): Idea A + Estilo 2

### Concepto General
- **Idea:** **Idea A — El motor invisible**
  - *Sinopsis:* Comenzamos con un motor funcionando. Su carcasa se vuelve transparente, aparecen sus componentes internos y descubrimos cómo una corriente eléctrica provoca la rotación. Al final, reconstruimos el motor.
  - *Enfoque:* Cinematográfico, revelación progresiva y precisión mecánica.
- **Estilo Visual:** **2. Whiteboard / Dibujo a mano**
  - *Lenguaje gráfico:* Trazos que aparecen progresivamente, diagramas dibujados a mano con marcadores de pizarrón (tinta negra carbón, grafito de construcción, azul cobalto magnético, rojo carmesí eléctrico, cobre/ámbar para bobinas y verde esmeralda para vectores de fuerza de Lorentz) y explicaciones físicas que se construyen visualmente en tiempo real.

### Especificaciones Técnicas
- **Resolución:** `1920x1080` (16:9 Full HD)
- **FPS:** `30`
- **Duración:** `30 segundos` (`900 frames`)
- **Audio:** Pista procedural sincronizada (`assets/whiteboard_motor_sfx.wav` / `layers/remotion/public/audio/whiteboard_motor_sfx.wav`) con sonido de trazos de marcador sobre pizarrón, zumbido electromagnético al inyectar corriente, chasquido de conmutación y aceleración mecánica del rotor.

---

## 3. Escaleta Cinematográfica (900 Frames @ 30 FPS)

| Acto | Tiempo | Frames | Escena / Acción Principal | Capas Activas |
| :--- | :--- | :--- | :--- | :--- |
| **Acto I: El Motor en Marcha** | `0:00 - 0:06` | `0 - 180` | Un marcador traza en vivo los ejes isométricos y dibuja la carcasa aleteada del motor, sus soportes y el eje. Al completarse el trazo, el eje cobra vida girando a `3,000 RPM` con arcos cinéticos y marcas de vibración dibujadas a mano. | **Remotion** (Pizarrón + Motor Exterior) + **Manim** (Telemetría cinemática) |
| **Acto II: La Revelación (Carcasa Transparente)** | `0:06 - 0:12` | `180 - 360` | Barrido de rayos X / borrador parcial: la carcasa sólida pasa a líneas fantasma punteadas (`20%` opacidad). En su interior se dibujan progresivamente el **Estator** (imanes $N$ rojo / $S$ azul), el **Rotor bobinado** (cobre) y el **Conmutador con escobillas**. | **Remotion** (Transición X-Ray) + **Motion Canvas** (Cotas y esquema de despiece) |
| **Acto III: El Secreto Electromagnético (Fuerza de Lorentz)** | `0:12 - 0:19` | `360 - 570` | Se trazan las líneas de campo magnético $\vec{B}$ ($N \to S$). Al cerrarse el circuito DC, pulsos de corriente $I$ recorren las escobillas y la espira. Surgen los vectores de Fuerza de Lorentz ($\vec{F} = I\vec{L} \times \vec{B}$) creando el par de rotación ($\vec{\tau}$). | **Manim** (Vectores $\vec{B}, \vec{I}, \vec{F}$ y ecuación de Lorentz) + **Motion Canvas** (Circuito eléctrico) + **Remotion** |
| **Acto IV: Conmutación y Rotación Continua** | `0:19 - 0:24` | `570 - 720` | Detalle sincronizado del colector de delgas: al cruzar los $180^\circ$, el conmutador invierte la polaridad de la corriente en la espira para mantener el torque siempre positivo ($\tau \propto |\sin\theta|$). Osciloscopio dibujado a mano en tiempo real. | **Manim** (Osciloscopio de torque rectificado $\tau(\theta)$) + **Motion Canvas** (Diagrama de inversión de delgas) |
| **Acto V: Reconstrucción Mecánica** | `0:24 - 0:30` | `720 - 900` | La cámara hace pullback cinematográfico. Mientras el núcleo electromagnético sigue girando con sus vectores activos, los trazos de la carcasa exterior, tapas y pernos se vuelven a dibujar y ensamblar con ventana de memoria translúcida. | **Remotion** + **Manim** + **Motion Canvas** (Cierre de plano maestro y sello de ingeniería) |

---

## 4. Distribución de la Arquitectura Híbrida por Capas
- **Capa 1 — Manim / Python Científico (`layers/manim/`):**
  - Escena Manim (`layers/manim/scenes/motor_physics_scene.py`) y generador matemático de precisión (`layers/manim/generate_whiteboard_layer.py`).
  - Produce el clip de pizarrón científico (`layers/remotion/public/layers/manim_whiteboard_physics.webm`) con la gráfica del osciloscopio de par motor rectificado $\tau(\theta) = \tau_{\max}|\sin\theta|$, el diagrama vectorial 3D de la Regla de la Mano Derecha ($\vec{I} \times \vec{B} = \vec{F}$) y exporta las trayectorias físicas exactas (`manim_physics_data.json`).
- **Capa 2 — Motion Canvas (`layers/motion-canvas/`):**
  - Escena vectorial (`layers/motion-canvas/src/scenes/motorCircuitWhiteboard.tsx`) y exportador de capa (`layers/motion-canvas/render_circuit_layer.mjs`).
  - Produce el diagrama esquemático animado de alimentación DC, flujo de electrones y conmutación de escobillas (`layers/remotion/public/layers/motion_canvas_circuit.webm`).
- **Capa 3 — Remotion (`layers/remotion/`):**
  - Compositor maestro 1080p a 30fps (`MainVideo.tsx`), superficie de pizarrón con textura de cuadrícula milimétrica, motor isométrico 2.5D dibujado trazo a trazo con cursor de marcador dinámico, integración de capas `.webm` con modo de fusión de tinta (`multiply`), caligrafía técnica manuscrita y pista de audio procedural.
