# Bitácora Maestra de Evaluación, Puntajes y Correcciones (`version-1`)

Este documento centraliza el seguimiento de todos los videos producidos en la rama `version-1` a lo largo de la sesión (3 Ideas × 9 Estilos Visuales, desarrollados uno a la vez), registrando:
- **Puntaje otorgado por el usuario**
- **Qué le gustó al usuario (Aciertos validados)**
- **Qué no le gustó al usuario (Puntos a corregir)**
- **Decisiones tomadas, aciertos y fallos técnicos por iteración**

---

## 1. Matriz de Seguimiento de Videos (Sesión `version-1`)

| # | Idea | Estilo Visual | Versión | Estado | Puntaje Usuario | Documento Detallado |
| :-: | :--- | :--- | :-: | :-: | :-: | :--- |
| **01** | **Idea A — El motor invisible** | **2. Whiteboard / Dibujo a mano** | `v1.0` | ✅ Renderizado / Esperando puntaje | _Pendiente_ | [`docs/video-01-idea-a-estilo-02-whiteboard.md`](./video-01-idea-a-estilo-02-whiteboard.md) |
| **02** | _Por definir con el usuario_ | _Por definir_ | — | ⏳ En espera | — | — |
| **03** | _Por definir con el usuario_ | _Por definir_ | — | ⏳ En espera | — | — |

---

## 2. Catálogo de Referencia (3 Ideas × 9 Estilos Visuales)

### Ideas de la Sesión
- **Idea A — El motor invisible:** Motor funcionando → Carcasa transparente → Revelación de componentes internos → Corriente eléctrica y campo magnético provocan la rotación → Reconstrucción del motor. *(Enfoque: cinematográfico, revelación y precisión mecánica).*
- **Idea B:** *(Pendiente de activación por el usuario)*
- **Idea C:** *(Pendiente de activación por el usuario)*

### Estilos Visuales (1 a 9)
1. *(Pendiente / según selección del usuario)*
2. **Whiteboard / Dibujo a mano:** Trazos que aparecen progresivamente, diagramas dibujados y explicaciones que se construyen visualmente. *(Activo en Video #01)*
3. *(Pendiente / según selección del usuario)*
4. *(Pendiente / según selección del usuario)*
5. *(Pendiente / según selección del usuario)*
6. *(Pendiente / según selección del usuario)*
7. *(Pendiente / según selección del usuario)*
8. *(Pendiente / según selección del usuario)*
9. *(Pendiente / según selección del usuario)*

---

## 3. Historial de Evaluaciones y Correcciones del Usuario

### Video 01 — Idea A (El motor invisible) · Estilo 2 (Whiteboard / Dibujo a mano)

#### Iteración `v1.0` (Entrega Inicial)
- **Archivo renderizado:** `output/final.mp4` (`1920x1080`, `30 FPS`, `30.0s / 900 frames`, con audio procedural)
- **Puntaje del usuario:** _Pendiente de recibir_
- **Lo que le gustó al usuario:** _Pendiente de recibir_
- **Lo que NO le gustó / Correcciones solicitadas:** _Pendiente de recibir_
- **Resumen de autocrítica previa (`v1.0`):**
  - **Aciertos:** Fusión limpia de las 3 capas (`Manim` + `Motion Canvas` + `Remotion`) sobre el pizarrón usando `mix-blend-mode: multiply`; transición de transparencia de carcasa muy clara con línea de escaneo Rayos-X; sincronía matemática exacta entre ángulo de la espira 3D, chispazo del conmutador a $180^\circ$ y onda rectificada $\tau(\theta) = |\sin\theta|$.
  - **Fallos / Puntos vigilados para iteración:** Densidad informativa alta en los Actos III y IV (coexisten el motor central, el circuito inferior izquierdo, la cadena causal inferior central y el osciloscopio inferior derecho); la perspectiva 2.5D de la espira es esquemática para priorizar legibilidad de los vectores de Lorentz ($\vec{F}$), pero podría enriquecerse con mayor número de espiras o grosor de núcleo laminado si el usuario prefiere aún más detalle mecánico.
