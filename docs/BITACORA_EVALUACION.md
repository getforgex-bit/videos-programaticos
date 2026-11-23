# Bitácora Maestra de Evaluación, Puntajes y Correcciones (`version-1`)

Este documento centraliza el seguimiento de todos los videos producidos en la rama `version-1` a lo largo de la sesión (3 Ideas × 9 Estilos Visuales, desarrollados uno a la vez), registrando:
- **Puntaje otorgado por el usuario (desglosado por criterio y promedio final)**
- **Qué le gustó al usuario (Aciertos validados)**
- **Qué no le gustó al usuario (Puntos a corregir)**
- **Decisiones tomadas, aciertos y fallos técnicos por iteración**

---

## 1. Matriz de Seguimiento de Videos (Sesión `version-1`)

| # | Idea | Estilo Visual | Versión | Estado | Puntaje Promedio | Meta Mínima | Documento Detallado |
| :-: | :--- | :--- | :-: | :-: | :-: | :-: | :--- |
| **01** | **Idea A — El motor invisible** | **2. Whiteboard / Dibujo a mano (Boceto Sepia)** | `v1.0` | 🔄 Reemplazada por cambio de estilo | _S/C_ | `85/100` | [`docs/video-01-idea-a-estilo-02-whiteboard.md`](./video-01-idea-a-estilo-02-whiteboard.md) |
| **01** | **Idea A — El motor invisible** | **2. Whiteboard / Dibujo a mano (Boceto Sepia)** | `v2.0` | ⚠️ Evaluada (`69.5/100` < `85`) | **`69.5 / 100`** | `85/100` | [`docs/video-01-idea-a-estilo-02-whiteboard.md`](./video-01-idea-a-estilo-02-whiteboard.md) |
| **01** | **Idea A — El motor invisible** | **2. Whiteboard / Dibujo a mano (Boceto Sepia)** | `v3.0` | 🚀 Corregida (Rotor Horizontal 3D + Campo Magnético Deformable + Fondo Reactivo) | _Pendiente_ | `85/100` | [`docs/video-01-idea-a-estilo-02-whiteboard.md`](./video-01-idea-a-estilo-02-whiteboard.md) |

---

## 2. Registro Oficial de Puntuaciones del Usuario

### Video 01 — Idea A (El motor invisible) · Estilo 2 (Whiteboard / Dibujo a mano)

#### Evaluación de la Versión `v2.0`
| Criterio Evaluado | Puntaje | Comentario Textual del Usuario |
| :--- | :-: | :--- |
| **Creatividad** | **`40 / 100`** | Requiere soluciones visuales más ingeniosas y menos literales/planas. |
| **Diseño** | **`85 / 100`** | *"Bastante apegado a lo esperado pero puede mejorarse aún."* |
| **Animaciones** | **`75 / 100`** | *"Se notan muy fluidas e impresionan, también el ritmo es el correcto, sin embargo siguen siendo muy básicas (tipo girar, rotar, mover de A a B lo cual no es malo pero hay algunos elementos que se sienten que deberían tener otras animaciones cómo los campos electromagnéticos que no se entienden)."* |
| **Coherencia temporal** | **`99 / 100`** | *"Me parece muy coherente y eso está bien, aunque quizás hayan detalles finos que no he notado."* |
| **Coherencia visual** | **`89 / 100`** | *"Me parece muy coherente y eso está bien, aunque quizás hayan detalles finos que no he notado. Pero aún le hace falta refinar pequeños detalles."* |
| **Coherencia de conceptos y diseño visual** | **`29 / 100`** | *"Hay elementos que no tienen sentido, cómo el rotor que está horizontal y el giro que se muestra en el centro más adelante en el video se muestra cómo si fuera el rotor vertical."* |
| **PROMEDIO FINAL (`v2.0`)** | **`69.5 / 100`** | *"Es insuficiente, debes de alcanzar por lo menos el 85/100."* |

- **Observación adicional clave sobre el fondo (`v2.0`):**
  > *"El fondo parece monótono y no reacciona a las animaciones del motor, está bien y la verdad no me gustaría sobrecargar la imagen pero si tuviera elementos sutiles que reaccionen a los elementos principales siento que le daría puntos."*

---

## 3. Correcciones Implementadas en `v3.0` para Superar el `85/100`

1. **Corrección Total de Coherencia Mecánica y Física (`29/100` → Objetivo `95+/100`):**
   - **Problema en `v2.0`:** Los ejes laterales eran **horizontales**, pero la espira central se estrechaba horizontalmente ($\cos\theta$ en $X$) como si girara alrededor de un eje **vertical**, contradiciendo la mecánica del motor.
   - **Solución en `v3.0`:** Construimos un **Tambor de Rotor Cilíndrico Horizontal 3D** montado sobre el **eje horizontal continuo (`y = 540`)**, con el **colector de delgas cilíndrico** sobre ese mismo eje tocando las escobillas superiores e inferiores. Las 4 bobinas de cobre recorren el tambor horizontalmente y **giran alrededor del eje horizontal** ($y(\theta) = 540 + R\sin\theta$, profundidad $z(\theta) = R\cos\theta$), pasando por delante del eje central cuando $z > 0$ y por detrás cuando $z < 0$, en perfecta sincronía con los ejes salientes izquierdo y derecho.
2. **Nueva Animación Física Comprensible del Campo Electromagnético (`75/100` → Objetivo `95+/100`):**
   - **Problema en `v2.0`:** El campo magnético eran solo 5 líneas rectas punteadas azules que no explicaban cómo empujan al rotor.
   - **Solución en `v3.0`:**
     - **Líneas de flujo dipolar curvas (`N → S`)** con partículas de limadura de hierro que fluyen desde los polos en herradura hacia el entrehierro.
     - **Vórtices magnéticos concéntricos ($\vec{B}_I$)** alrededor de los conductores cuando entra la corriente $I$, y **deformación elástica ("efecto catapulta magnética")** de las líneas de campo $\vec{B}$, mostrando visualmente cómo las líneas de flujo se comprimen bajo un conductor y se tensan para catapultarlo hacia arriba/abajo generando el par de Lorentz ($\vec{F} = I\vec{L} \times \vec{B}$).
3. **Fondo Pergamino Reactivo y Sutil (`Otras observaciones`):**
   - **Anillos de compás Da Vinci y partículas de limadura de grafito** sutiles en el papel pergamino que:
     - Vibran con ondas acústicas concéntricas cuando el motor arranca a `3,000 RPM`.
     - Se orientan siguiendo las líneas de flujo dipolar cuando se activa el campo magnético.
     - Emiten una onda de presión sutil sobre la fibra del papel en cada conmutación de $180^\circ$ y en cada impacto mecánico, sin sobrecargar la imagen.
4. **Salto en Creatividad y Refinamiento de Diseño (`40/100` y `85/100` → Objetivo `92+/100`):**
   - **Despiece mecánico creativo (Clamshell X-Ray Peel):** En la Escena 2, los 4 pernos de la carcasa giran, se desenroscan y las mitades superior e inferior del blindaje se abren físicamente hacia arriba y hacia abajo antes de quedar como contorno fantasma.
   - **Eliminación de solapamientos finos:** Los rótulos cinéticos se posicionan con margen limpio sin tocar las flechas `F` de doble contorno.
