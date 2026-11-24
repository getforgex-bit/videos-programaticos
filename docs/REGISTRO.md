# Registro de videos — sesión `version-3`

Plan de la sesión: **3 ideas × 9 estilos visuales**, desarrollando **una idea con un estilo a la vez**.
Cada video tiene su bitácora en `docs/videos/` (decisiones, aciertos, fallos, feedback e iteraciones).

## Tablero

| # | Idea | Estilo visual | Iteración | Duración | Puntaje | Estado | Bitácora |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 01 | A — El motor invisible | 2 — Dibujo a mano (pizarra) | v1 | 89,8 s | Sin número ("bien") | Reemplazado por v2 | [v01](videos/v01-motor-invisible-pizarra.md) |
| 01 | A — El motor invisible | 2 — Dibujo a mano (sepia dinámico) | v2 | 49,2 s | _pendiente_ | Entregado, esperando feedback | [v01 · §12](videos/v01-motor-invisible-pizarra.md#12-iteración-v2--sepia-dinámico) |

## Feedback del usuario (histórico)

> Se registra textual o resumido, con fecha, para que las siguientes versiones aprendan de él.

| Fecha | Video | Iteración | Puntaje | Le gustó | No le gustó / pidió cambiar |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 2026-11-24 | 01 | v1 | Sin número ("Me agrada", "Bien") | Los diseños (motor, piezas, explicación). | El estilo no era el imaginado: quería tinta sepia sobre pergamino, con rellenos y sombreado (envió referencia). Se siente **aburrido**: pide algo mucho más **dopaminérgico**, más cambios, efectos y movimiento entre escenas, **menos información a la vez** y presentada dinámicamente. |

## Lecciones acumuladas (aplican a todos los videos)

Técnicas:
1. **Manim escribe alfa premultiplicado.** Siempre renderizar a `.mov` y pasar por `ffmpeg unpremultiply` antes de componer.
2. **`-qh` = 60 fps.** Forzar `--frame_rate 30` si la línea de tiempo es de 30.
3. **Desactivar la caché de Manim** cuando las escenas registran eventos desde updaters.
4. **Fusionar trazos por estilo** en un solo `VMobject` (subtrayectorias): es la mayor ganancia de rendimiento.
5. **Anclar textos y audio a marcas reales del render**, nunca a tiempos escritos a mano.
6. Motion Canvas no tiene CLI de render: usar `scripts/mc-render.mjs` (Playwright + editor).
7. **No usar `always_redraw` con estructuras variables**: usar `live()` (ranuras fijas) de `common/sketch.py`.
8. `mix-blend-mode` no atraviesa contenedores transformados: las texturas de papel van como capa superior en multiplicar.
9. Para ritmo musical: duraciones en múltiplos de medio pulso y transiciones que se solapan un múltiplo de 9 frames (100 BPM a 30 fps).

Creativas (se irán completando con el feedback):
1. **Ritmo ante todo.** 90 s con trazos lentos y subtítulos largos se percibe aburrido. Cambiar algo en pantalla cada 1–3 s, cuadrado a un pulso musical.
2. **Una idea por pantalla.** Etiquetas de una en una; ecuaciones y gráficas en su propio "momento", no junto al diagrama.
3. **Movimiento entre escenas.** Nada de cortes estáticos ni borrados lentos: zoom a través del objeto, barridos con desenfoque de movimiento, manchas de tinta.
4. **Texto cinético corto** (1–4 palabras, entra a golpe) en lugar de frases largas abajo.
5. **"Dibujo a mano" para este usuario = ilustración sepia sobre pergamino** (contorno grueso doble, relleno tostado, rayado de sombra, grano), no rotulador de pizarra blanca.
