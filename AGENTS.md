# Reglas de Aislamiento de Sesiones (`AGENTS.md`)

Este repositorio está diseñado para producir **3 versiones independientes y aisladas** de un mismo video programático (`version-1`, `version-2`, `version-3`) y luego combinar lo mejor de cada una en `version-4`.

## Roles de las ramas

- **`version-1`, `version-2`, `version-3` (Aisladas):** Cada sesión trabaja de forma completamente independiente y **NO puede ver ni consultar** las otras ramas `version-*`.
- **`version-4` (Integración / Mejores versiones):** Rama reservada para evaluar, seleccionar y combinar las mejores capas/escenas provenientes de `version-1`, `version-2` y `version-3`. Solo la sesión asignada a `version-4` tiene permiso para inspeccionar las otras 3 ramas.

## Reglas estrictas para sesiones en `version-1`, `version-2` y `version-3`

1. **Trabaja ÚNICAMENTE en tu rama asignada** (por ejemplo, `version-1`).
   - Al iniciar tu sesión, ejecuta:
     ```bash
     ./scripts/isolate-session.sh <tu-rama>
     ```
   - Esto restringe el clon local a tu rama asignada y elimina las referencias locales de las demás ramas `version-*`.

2. **PROHIBIDO inspeccionar otras ramas `version-*`**:
   - **NO** ejecutes `git checkout`, `git switch`, `git diff`, `git log`, `git show`, `git fetch --all` ni `git ls-remote` contra otras ramas `version-*`.
   - **NO** uses `gh` ni la API de GitHub para leer commits, archivos o PRs de otras ramas `version-*`.
   - **NO** modifiques `main` ni `version-4` desde una sesión de `version-1`, `version-2` o `version-3`.

3. **Independencia creativa**:
   - Toma tus propias decisiones de diseño, ritmo, paleta, transiciones y distribución de capas (Manim / Motion Canvas / Remotion) a partir del brief en `specs/brief.md`.
   - Documenta tu enfoque creativo y decisiones en el archivo `SESSION.md` de tu rama.

4. **Entrega limpia**:
   - Haz commits únicamente en tu rama asignada y haz `git push origin <tu-rama>`.
   - Mantén los archivos de video pesados fuera de Git (usa `output/` y `layers/remotion/public/layers/`, ambos en `.gitignore`).
