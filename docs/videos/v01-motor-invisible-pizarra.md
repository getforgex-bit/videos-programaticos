# Video 01 — "El motor invisible" · Estilo 2: Pizarra / dibujo a mano

| Campo | Valor |
| :--- | :--- |
| **Idea** | A — El motor invisible (cinematográfico, revelación, precisión mecánica) |
| **Estilo visual** | 2 — Whiteboard / dibujo a mano |
| **Rama** | `version-3` |
| **Iteración** | v1 (primera entrega) |
| **Archivo final** | `output/v01-motor-invisible-pizarra.mp4` (no versionado; se regenera con `scripts/v01/build.sh`) |
| **Formato** | 1920×1080 · 30 fps · H.264 (CRF 18) + AAC 192k · 89,8 s · 20 MB |
| **Puntaje del usuario** | _pendiente_ |

---

## 1. Objetivo y lectura de la idea

- **Qué debe entender el espectador:** por qué gira un motor de corriente continua: corriente + campo magnético = fuerza; dos fuerzas opuestas = giro; el conmutador invierte la corriente cada media vuelta para que el giro no se detenga.
- **Qué debe sentir:** la sorpresa de "ver a través" de algo cotidiano, y la satisfacción de verlo rearmarse y funcionar.
- **Interpretación del estilo pizarra:** no es "un dibujo plano": es un **cuaderno de ingeniero con rotulador**. Todo se dibuja trazo a trazo, pero las piezas tienen geometría 3D real proyectada, así que la mecánica es exacta (la bobina gira de verdad dentro de la carcasa transparente).

## 2. Escaleta (89,8 s)

| # | Segmento | Capa | Qué pasa |
| :-- | :-- | :-- | :-- |
| 1 | Apertura | Manim M1 | Se dibuja el motor en 3/4 con pila y cables; título manuscrito "El motor invisible". |
| 2 | Funciona | Manim M1 | Arranca: hélice girando con líneas de velocidad y vibración. "Gira… pero ¿qué lo hace girar?" |
| 3 | Revelación | Manim M1 | Se frena; la carcasa pasa de tinta sólida a **línea punteada gris** (convención de dibujo técnico para "oculto/transparente"). |
| 4 | Piezas | Manim M1 | El rotulador dibuja imanes N/S (rayado), bobina, conmutador y escobillas, con rótulos y flechas. |
| 5 | Por dentro | Manim M1 | El motor vuelve a girar en modo rayos-X: la bobina y el conmutador rotan en 3D. |
| — | Borrador | Remotion | Un borrador de pizarra limpia el dibujo. |
| 6 | Vista frontal | Manim M2 | Carcasa, imanes, **campo B** con flechas que fluyen de N a S. |
| 7 | Corriente | Manim M2 | Escobillas (+/−), conmutador, bobina; ⊙ corriente saliendo, ⊗ entrando. |
| 8 | Fuerza | Manim M2 | Flechas verdes de fuerza y `F = B · I · L` con colores codificados. |
| 9 | Giro y punto muerto | Manim M2 | La bobina gira 90°; en la horizontal las fuerzas ya no producen giro. |
| 10 | El truco | Manim M2 | Zoom al conmutador: la ranura pasa bajo la escobilla, chispa, ⊙/⊗ se invierten. |
| 11 | Giro continuo | Manim M2 | Dos vueltas con la gráfica de empuje: `|sen θ|` (con conmutador) vs `sen θ` punteada (sin él). |
| — | Borrador | Remotion | |
| 12 | Resumen | Motion Canvas | Diagrama: corriente + campo → fuerza → giro, y el bucle del conmutador. |
| — | Borrador | Remotion | |
| 13 | Reconstrucción | Manim M3 | Despiece → ensamblado con *push-in* de cámara → el rotulador repasa la carcasa y se vuelve sólida → gira. |
| 14 | Cierre | Remotion | Título final: "El motor invisible — electricidad + magnetismo = movimiento". |

## 3. Dirección visual

- **Superficie:** pizarra blanca cálida `#F6F3EB`, grano fino, "fantasmas" de borrado muy tenues y viñeta suave (procedural en SVG, sin imágenes).
- **Rotuladores (paleta semántica, coherente en todo el video):**
  - Negro-azulado `#1E2430` — estructura.
  - Rojo `#D6402F` — **corriente** y polo **N**.
  - Azul `#2D6BB3` — **campo magnético** y polo **S**.
  - Verde `#23905E` — **fuerza**.
  - Naranja `#E07A1F` — **giro**.
  - Gris lápiz `#8C929B` — lo transparente / oculto / "sin conmutador".
- **Tipografía:** Kalam (SIL OFL), la misma en las tres herramientas (Manim/Pango, Motion Canvas/CSS, Remotion/FontFace).
- **Trazo:** polilínea densa con ruido suave a lo largo de la normal (3 octavas, semilla fija por trazo), sobrepaso en los extremos, círculos que se solapan al cerrar, flechas de cabeza abierta y rellenos con **rayado** (no colores planos).
- **Rotulador en pantalla:** un marcador que sigue la punta **real** del trazo, frame a frame, y cambia de color según la tinta que dibuja.
- **Line boil:** desplazamiento de 1,4 px que cambia cada 4 frames, para el "temblor" de animación dibujada a mano.
- **Transiciones:** borrador de pizarra que barre en zig-zag.

## 4. Reparto por capas (y por qué)

| Capa | Qué aporta | Por qué esa herramienta |
| :-- | :-- | :-- |
| **Manim** (`layers/manim/scenes/v01_motor/`) | Motor 3D proyectado a mano, física (campo, ⊙/⊗, fuerzas, conmutador), gráfica de par, cámara (zoom, push-in). | Precisión geométrica y matemática; trackers para controlar ángulo, explosión, transparencia y progreso de dibujo. |
| **Motion Canvas** (`layers/motion-canvas/src/v01_motor/`) | Diagrama-resumen de causa-efecto. | Diagramas de nodos/flechas y texto tipeado; trazos con `end` animable. |
| **Remotion** (`layers/remotion/src/v01/`) | Pizarra, títulos, subtítulos, rotulador, borrador, line boil, audio y render final. | Composición, tipografía y sincronización maestra. |

## 5. Decisiones técnicas clave

1. **Modelo 3D propio en vez de `ThreeDScene`:** se definen las piezas en 3D (eje X = eje del motor) y se proyectan con una cámara ortográfica (yaw −34°, pitch 19°). Las siluetas de los cilindros y los arcos visibles se calculan analíticamente. Así el estilo "a mano" se aplica sobre geometría exacta y todo es 2D para Cairo (rápido y con alfa).
2. **Física coherente entre vistas:** imanes arriba (N) y abajo (S) → campo vertical; escobillas a izquierda/derecha → la corriente se invierte cuando los lados de la bobina pasan por la horizontal (posición de par cero). `F = I·L × B` se verificó a mano para ambos lados: arriba ⊙ → fuerza a la derecha; abajo ⊗ → fuerza a la izquierda → giro horario.
3. **Todo dirigido por `ValueTracker`s:** progreso de dibujo de cada pieza, ángulo del rotor, velocidad, transparencia, explosión. El dibujo progresivo no usa `Create`: cada `Drawing` sabe renderizarse parcialmente y dónde está la punta del rotulador.
4. **Línea de tiempo basada en lo renderizado:** cada escena Manim exporta `events.json` con marcas, sonidos, posición del rotulador por frame y velocidad del motor por frame. Remotion ancla los subtítulos a esas marcas y el audio se sintetiza a partir de ellas. Cambiar la duración de una animación no desincroniza nada.
5. **Audio 100 % sintetizado (sin samples):** rotulador (ruido filtrado con envolvente de trazos), zumbido del motor (sigue la velocidad real), clic del conmutador (cada inversión real), revelado, borrador, ensamblado y una base musical suave (pad + arpegio Karplus-Strong a 84 BPM).
6. **Render headless de Motion Canvas:** no tiene CLI; `scripts/mc-render.mjs` levanta Vite, abre el editor con Playwright y pulsa "Render".

## 6. Aciertos

- La **revelación** (carcasa sólida → punteada) se lee de inmediato y respeta una convención real de dibujo técnico.
- Ver la **bobina girando en 3D dentro de la carcasa transparente** aporta la "precisión mecánica" pedida.
- El **zoom al conmutador** explica el "truco" de forma visual: la ranura pasa bajo la escobilla y ⊙/⊗ se invierten en ese instante, con chispa y clic sincronizados.
- La **gráfica `|sen θ|` vs `sen θ`** da el argumento cuantitativo sin fórmulas extra.
- El **rotulador que sigue la punta real del trazo** vende el estilo pizarra sin necesidad de una mano dibujada.
- Pipeline reutilizable: `common/sketch.py`, `common/timed_scene.py`, componentes Remotion (`Paper`, `Handwritten`, `MarkerPen`, `EraserWipe`, `LineBoil`) y `scripts/mc-render.mjs` sirven para los próximos videos.

## 7. Fallos encontrados (y cómo se resolvieron)

| Fallo | Síntoma | Causa | Solución |
| :-- | :-- | :-- | :-- |
| Config de Vite del scaffold | `motionCanvas is not a function` | El plugin es CJS y con `"type": "module"` el default queda anidado. | Shim `module.default ?? module` en `vite.config.ts`. |
| Alfa premultiplicado | Amarillo `255,216,74` salía `165,139,48`; bordes oscuros. | Manim escribe el alfa premultiplicado en el video. | Render a `.mov` (qtrle, sin pérdida) + `ffmpeg unpremultiply` antes de VP9. |
| Caché de Manim | Menos muestras del rotulador que frames. | La caché reutilizaba animaciones y se saltaba los updaters que registran eventos. | `disable_caching = True` + registro por índice de frame. |
| Rendimiento | 1,5 s por frame en M2. | ~300 `VMobject` por frame (uno por trazo). | Un `VMobject` por estilo con subtrayectorias y Bézier construidas con numpy (~2,5× más rápido). |
| 60 fps inesperados | Línea de tiempo de 163 s. | `-qh` implica 60 fps aunque el cfg diga 30. | `--frame_rate 30` explícito en el script. |
| Escobillas ilegibles | Placas vistas de canto. | Eran planos en el plano axial. | Bloques 3D (envolvente convexa + 3 aristas del vértice más cercano). |
| Cables enredados | Cable negro cruzaba la carcasa. | Pila horizontal detrás del motor. | Pila vertical a la izquierda; cables en "U". |
| Despiece fuera de cuadro | Hélice e imanes cortados en M3. | Explosión demasiado amplia para la cámara. | Cámara abierta al inicio y *push-in* durante el ensamblado. |
| Letras N/S sobre el rayado | Parche visible detrás de la letra. | Un rectángulo "color papel" nunca coincide con la textura. | El rayado deja un **hueco** circular donde va la letra. |
| Subtítulo ilegible en el zoom | Texto encima de imanes y líneas de campo. | El zoom llena todo el cuadro. | Franja difusa color pizarra detrás de cada subtítulo. |
| Subtítulos de 2 líneas | Segunda línea chocaba con la gráfica. | Textos de > 65 caracteres. | Textos ≤ 62 caracteres. |
| Cierre demasiado corto | El lema final se leía ~1 s antes del fundido. | Pocas pausas al final de M3. | +1,6 s de motor girando con el título. |
| Zumbido dominante | El motor sonaba ~5 dB por encima del resto. | Ganancia del zumbido. | Ganancia 0,16 → 0,10. |
| Ecuación y "vueltas" cortadas | Texto fuera del borde derecho. | Posiciones fijas sin margen. | Texto más corto y etiquetas reubicadas. |

## 8. Métricas de producción (v1)

| Paso | Tiempo (4 núcleos, sin GPU) |
| :-- | :-- |
| Manim (3 escenas en paralelo, 1080p30) | ≈ 6 min |
| Motion Canvas (headless) | ≈ 40 s |
| Línea de tiempo + audio sintetizado | ≈ 6 s |
| Remotion (2 693 frames) | ≈ 4 min |
| **Total `scripts/v01/build.sh`** | **≈ 11 min** |

Audio final: −17,8 LUFS integrados, pico −1,1 dBFS (conservador; se puede subir a −16/−14 LUFS si se publica en redes).

## 9. Riesgos / puntos a validar con el usuario

- **Duración (~90 s):** la parte de física (M2) es la más densa; si se siente larga, recortar el punto muerto o la segunda vuelta de la gráfica.
- **Rotulador en pantalla:** aporta vida pero puede distraer; se puede desactivar con la prop `showPen`.
- **Line boil:** si se percibe como "temblor" en vez de estilo, bajar `boil` a 0–0,8.
- **Música sintetizada:** sobria a propósito; podría reemplazarse por una pista licenciada o un TTS de narración.
- **Sin voz en off:** el guion está en subtítulos manuscritos. Una narración subiría la retención, pero agrega costo y otra capa a validar.

## 10. Cómo regenerarlo

```bash
scripts/v01/build.sh
```

Variantes: `SKIP_MANIM=1 SKIP_MC=1 scripts/v01/build.sh` (sólo re-componer), `QUALITY=l scripts/v01/render-manim.sh V01_M2_Fisica` (borrador rápido de una escena).

## 11. Feedback del usuario e iteraciones

| Iteración | Puntaje | Le gustó | No le gustó | Cambios aplicados |
| :-- | :-- | :-- | :-- | :-- |
| v1 | _pendiente_ | _pendiente_ | _pendiente_ | — |
