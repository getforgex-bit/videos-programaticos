# videos-programaticos

Repositorio base para la producción de **videos programáticos híbridos por capas**, combinando lo mejor de **Manim**, **Motion Canvas** y **Remotion**, con ramas independientes para experimentar en paralelo de forma aislada y elegir la mejor versión final.

---

## Arquitectura Híbrida por Capas

Cada herramienta cumple un rol especializado dentro del pipeline:

| Capa | Herramienta | Especialidad | Salida hacia el compositor |
| :--- | :--- | :--- | :--- |
| **Capa 1** | **Manim** (`layers/manim/`) | Matemáticas, gráficos científicos, geometría, 3D y transformaciones de fórmulas | Clips con canal alfa (`-t`, `.mov`/`.webm`) o `.mp4` |
| **Capa 2** | **Motion Canvas** (`layers/motion-canvas/`) | Diagramas vectoriales, arquitectura de sistemas, código animado, animaciones procedurales | Secuencias PNG / video con transparencia |
| **Capa 3 (Master)** | **Remotion** (`layers/remotion/`) | Composición final, timeline maestro, tipografía/HUD en React, audio, subtítulos y render final | Video final en `output/` |

```
[layers/manim] ─────────┐
                        ├──► layers/remotion/public/layers/ ──► [layers/remotion] ──► output/final.mp4
[layers/motion-canvas] ─┘                                              ▲
                                                                [assets/ audio/fonts]
```

---

## Ramas Independientes (Aislamiento por Sesión)

Este repo incluye 4 ramas con roles claros:

- `version-1` — Sesión creativa aislada #1
- `version-2` — Sesión creativa aislada #2
- `version-3` — Sesión creativa aislada #3
- `version-4` — **Curación / Mejores versiones**: rama destinada a recopilar, comparar y combinar las mejores piezas y capas de `version-1`, `version-2` y `version-3`.

### Cómo iniciar cada sesión aislada (`version-1`, `version-2`, `version-3`)

1. Asigna una rama distinta a cada sesión (`version-1`, `version-2` o `version-3`).
2. Al empezar la sesión, ejecuta el script de aislamiento:

```bash
./scripts/isolate-session.sh version-1
```

Este script:
- Cambia a la rama asignada.
- Configura `remote.origin.fetch` en modo **single-branch** para esa única rama.
- Elimina referencias locales y remotas en caché de las demás ramas `version-*`, evitando que `git branch -a` o `git log --all` expongan el trabajo de otras sesiones.

> **Nota sobre Git:** En un mismo repositorio de GitHub las ramas comparten acceso a nivel remoto; el aislamiento se garantiza combinando `./scripts/isolate-session.sh` + las reglas obligatorias de [`AGENTS.md`](./AGENTS.md).

### Prompt sugerido para lanzar cada sesión aislada (`version-1` a `version-3`)

> Trabaja exclusivamente en la rama `version-X`. Lo primero que debes hacer es leer `AGENTS.md` y ejecutar `./scripts/isolate-session.sh version-X`. Bajo ninguna circunstancia inspecciones, hagas fetch ni consultes otras ramas `version-*`. Lee `specs/brief.md` y crea tu propia versión original del video usando la arquitectura por capas (Manim + Motion Canvas + Remotion). Documenta tu propuesta en `SESSION.md`.

### Prompt sugerido para la sesión de curación (`version-4`)

> Trabaja en la rama `version-4`. Revisa las propuestas, capas y resultados de `version-1`, `version-2` y `version-3`, selecciona las mejores escenas/capas de cada una e intégralas en `version-4` documentando las decisiones en `SESSION.md`.

---

## Estructura del Repositorio

```text
.
├── AGENTS.md                  # Reglas obligatorias de aislamiento entre sesiones
├── specs/
│   └── brief.md               # Brief compartido del video (guion, formato, duración, objetivos)
├── layers/
│   ├── manim/                 # Capa 1: escenas Manim (Python)
│   ├── motion-canvas/         # Capa 2: escenas Motion Canvas (TypeScript)
│   └── remotion/              # Capa 3: compositor maestro Remotion (React/TypeScript)
├── assets/                    # Audio, tipografías, imágenes y recursos compartidos
├── output/                    # Renders finales (ignorado por Git)
└── scripts/
    └── isolate-session.sh     # Aísla el clon local a una sola rama
```

---

## Flujo de Trabajo Recomendado

1. Define el guion y requisitos comunes en `specs/brief.md` en `main` (opcional: propagar a `version-1`..`version-3` antes de arrancar).
2. Lanza 3 sesiones en paralelo en `version-1`, `version-2` y `version-3`, ejecutando `./scripts/isolate-session.sh <rama>` en cada una.
3. Cada sesión diseña sus capas, renderiza las piezas de Manim y Motion Canvas dentro de `layers/remotion/public/layers/`, compone el master en Remotion y exporta a `output/`.
4. Al finalizar las 3 sesiones, abre una sesión en `version-4` para comparar resultados, tomar lo mejor de cada rama y ensamblar la versión definitiva.
5. Cuando `version-4` esté aprobada, haz merge a `main`.