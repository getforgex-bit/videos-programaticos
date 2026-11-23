# Sesión Aislada — `version-3`

> **IMPORTANTE:** Lee `AGENTS.md` y ejecuta `./scripts/isolate-session.sh version-3` antes de comenzar.
> No inspecciones, hagas fetch ni consultes ninguna otra rama `version-*`.

Esta sesión produce **varios videos** (3 ideas × 9 estilos visuales), uno a la vez, y registra
puntajes, feedback, aciertos y fallos para mejorar en cada iteración.

- **Tablero y lecciones acumuladas:** [`docs/REGISTRO.md`](docs/REGISTRO.md)
- **Bitácoras por video:** [`docs/videos/`](docs/videos/)

## Videos

| # | Idea · Estilo | Bitácora | Build |
| :-- | :-- | :-- | :-- |
| 01 | El motor invisible · Pizarra / dibujo a mano | [v01](docs/videos/v01-motor-invisible-pizarra.md) | `scripts/v01/build.sh` |

## 1. Dirección creativa (video 01)
- **Concepto visual:** cuaderno de ingeniero con rotulador: todo se dibuja trazo a trazo, pero sobre geometría 3D real proyectada, para que la mecánica sea exacta.
- **Paleta y tipografía:** pizarra cálida; rotuladores con significado fijo (rojo = corriente/N, azul = campo/S, verde = fuerza, naranja = giro, gris = transparente). Tipografía Kalam en las tres herramientas.
- **Diferenciador:** la carcasa se vuelve transparente con la convención de dibujo técnico (línea punteada), la bobina gira en 3D dentro de ella, un rotulador sigue la punta real de cada trazo y todo el sonido está sintetizado y sincronizado con eventos reales del render.

## 2. Distribución por capas
- **Capa 1 — Manim (`layers/manim/`):** `scenes/common/` (librería de trazos a mano y escena con registro de eventos, reutilizable) + `scenes/v01_motor/` (modelo 3D del motor, vista frontal, escenas M1/M2/M3).
- **Capa 2 — Motion Canvas (`layers/motion-canvas/`):** `src/v01_motor/` diagrama-resumen dibujado a mano; render headless con `scripts/mc-render.mjs`.
- **Capa 3 — Remotion (`layers/remotion/`):** `src/common/` (pizarra, texto manuscrito, rotulador, borrador, line boil) + `src/v01/` (composición `V01-MotorInvisible-Pizarra`).

## 3. Notas de render y entrega
- **Requisitos:** `layers/manim/.venv` con Manim 0.22 (`libpango1.0-dev` en el sistema), `npm run install:all`, Chromium de Playwright, ffmpeg.
- **Comando:** `scripts/v01/build.sh` → `output/v01-motor-invisible-pizarra.mp4`
- **Estado:** video 01 v1 entregado, esperando puntaje y feedback.
