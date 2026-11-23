# Registro de videos — sesión `version-3`

Plan de la sesión: **3 ideas × 9 estilos visuales**, desarrollando **una idea con un estilo a la vez**.
Cada video tiene su bitácora en `docs/videos/` (decisiones, aciertos, fallos, feedback e iteraciones).

## Tablero

| # | Idea | Estilo visual | Iteración | Duración | Puntaje | Estado | Bitácora |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 01 | A — El motor invisible | 2 — Pizarra / dibujo a mano | v1 | 89,8 s | _pendiente_ | Entregado, esperando feedback | [v01](videos/v01-motor-invisible-pizarra.md) |

## Feedback del usuario (histórico)

> Se registra textual o resumido, con fecha, para que las siguientes versiones aprendan de él.

| Fecha | Video | Iteración | Puntaje | Le gustó | No le gustó / pidió cambiar |
| :-- | :-- | :-- | :-- | :-- | :-- |
| — | — | — | — | — | — |

## Lecciones acumuladas (aplican a todos los videos)

Técnicas:
1. **Manim escribe alfa premultiplicado.** Siempre renderizar a `.mov` y pasar por `ffmpeg unpremultiply` antes de componer.
2. **`-qh` = 60 fps.** Forzar `--frame_rate 30` si la línea de tiempo es de 30.
3. **Desactivar la caché de Manim** cuando las escenas registran eventos desde updaters.
4. **Fusionar trazos por estilo** en un solo `VMobject` (subtrayectorias): es la mayor ganancia de rendimiento.
5. **Anclar textos y audio a marcas reales del render**, nunca a tiempos escritos a mano.
6. Motion Canvas no tiene CLI de render: usar `scripts/mc-render.mjs` (Playwright + editor).

Creativas (se irán completando con el feedback):
- _pendiente de feedback del usuario_
