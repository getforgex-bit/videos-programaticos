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
| **01** | **Idea A — El motor invisible** | **2. Whiteboard / Dibujo a mano** | `v1.0` | 🔄 Reemplazada por cambio de estilo | _S/C_ | `85/100` | [`docs/video-01-idea-a-estilo-02-whiteboard.md`](./video-01-idea-a-estilo-02-whiteboard.md) |
| **01** | **Idea A — El motor invisible** | **2. Whiteboard / Dibujo a mano (Boceto Sepia)** | `v2.0` | ⚠️ Evaluada (`69.5/100` < `85`) | **`69.5 / 100`** | `85/100` | [`docs/video-01-idea-a-estilo-02-whiteboard.md`](./video-01-idea-a-estilo-02-whiteboard.md) |
| **01** | **Idea A — El motor invisible** | **2. Whiteboard / Dibujo a mano (Boceto Sepia)** | `v3.0` | ✅ Aprobada 1ª Tanda (`88.0/100` >= `85`) | **`88.0 / 100`** | `85/100` | [`docs/video-01-idea-a-estilo-02-whiteboard.md`](./video-01-idea-a-estilo-02-whiteboard.md) |
| **01** | **Idea A — El motor invisible** | **2. Whiteboard / Dibujo a mano (Boceto Sepia)** | `v4.0` | 🌟 Pulido Maestro (Carga/Descarga Bajo Demanda + 5 Transiciones Creativas + Explicación Visual de Vórtices + Trazo Humano No-IA) | _Pendiente 2ª Tanda_ | `> 90/100` | [`docs/video-01-idea-a-estilo-02-whiteboard.md`](./video-01-idea-a-estilo-02-whiteboard.md) |

---

## 2. Registro Oficial de Puntuaciones del Usuario

### Video 01 — Idea A (El motor invisible) · Estilo 2 (Whiteboard / Dibujo a mano)

#### Evaluación Comparativa `v2.0` vs `v3.0`

| Criterio Evaluado | Puntaje `v2.0` | Puntaje `v3.0` | Evolución | Comentario Textual del Usuario sobre `v3.0` |
| :--- | :-: | :-: | :-: | :--- |
| **Creatividad** | `40 / 100` | **`66 / 100`** | `+26` | *"Has mejorado pero sigue siendo algo común. Me encantan las transiciones y la forma en la que lo manejaste, siento que podrías añadir distintos tipos de transiciones para aumentar la fluidez y que se sienta mejor pensado y por ende más creativo."* |
| **Diseño** | `85 / 100` | **`89 / 100`** | `+4` | *"Me agrada más por sus líneas y los detalles que has añadido, pero aún parece muy hecho por IA. También hay partes que se sobrecargan; quizás deberías implementar descarga y carga de elementos bajo demanda de tal forma que no aparezcan todos al mismo tiempo, pero que a su vez cada uno tenga su momento de brillar."* |
| **Animaciones** | `75 / 100` | **`90 / 100`** | `+15` | *"La fluidez se ha mantenido, el ritmo me importa y me gusta, pero hay elementos que todavía no se entienden, cómo los vórtices de corriente y el campo tensado; si no te los explican no se entiende qué hacen (se entiende el movimiento mejor que antes pero ahora no se entiende el por qué ni sus interacciones)."* |
| **Coherencia temporal** | `99 / 100` | **`99 / 100`** | `=` | *"Se mantiene porque he revisado que hay pequeños detalles que son confusos, cómo en el momento en el que se abre el motor para mostrar su interior, no es que no se entienda sino que da una pequeña sensación de '¿qué pasó con los elementos que lo conforman aquí?!' pero en cuanto lo piensas en 1s toma coherencia..."* |
| **Coherencia visual** | `89 / 100` | **`99 / 100`** | `+10` | *"Hay rasgos que se entrelazan con los datos de la coherencia temporal porque es muy similar la conclusión, pero está excelente."* |
| **Coherencia de conceptos y diseño visual** | `29 / 100` | **`85 / 100`** | `+56` | *"Me agrada, pero hay pequeños detalles que pulir aún."* |
| **PROMEDIO FINAL** | **`69.5 / 100`** | **`88.0 / 100`** | **`+18.5`** | *"Ya pasa esta primera tanda de pruebas pero me gustaría que hagas una V4 refinando los últimos detalles y preparándola para la siguiente tanda de pruebas que medirán cosas distintas (aunque algunas similares) y serán más críticas."* |

---

## 3. Plan de Ingeniería y Refinamiento Maestro en `v4.0`

1. **Sistema de Carga y Descarga Bajo Demanda (*Spotlight Staging* — Diseño `89 -> 96+`):**
   - Cada componente tiene una ventana de protagonismo (`spotlight = 1.0`) y luego se **descarga o atenúa a trazo fantasma de referencia (`0.18 - 0.30`)** cuando otro elemento pasa al frente, evitando que la pantalla acumule capas simultáneas.
   - **Continuidad temporal al abrir el motor (Escena 2):** El tambor horizontal y el eje ya están presentes dentro del blindaje desde el frame 115, de modo que al abrirse las valvas superior e inferior de la carcasa se *descubre* el interior de forma continua sin el vacío de 1 segundo detectado en `v3.0`.
2. **Explicación Visual Auto-Contenida de los Vórtices y el Campo Tensado (`Animaciones 90 -> 97+`):**
   - Durante las Escenas 3 y 4, descargamos el ruido periférico y mostramos con claridad causal **por qué** interactúan el vórtice de la corriente y el campo de los imanes:
     - **Debajo del cable (`CHOQUE DE CAMPOS + +`):** Las flechas del remolino magnético de la corriente apuntan en el **mismo sentido (`→ →`)** que el campo `N → S`, sumándose y creando un **colchón de alta presión magnética** (sombreado ámbar comprimido como un resorte) que empuja el cable hacia arriba.
     - **Encima del cable (`CANCELACIÓN - -`):** Las flechas del remolino apuntan en **sentido opuesto (`← →`)** al campo `N → S`, cancelándose y creando una zona de baja presión hacia donde el cable es lanzado (`↑ EMPUJE F`).
     - Anotaciones manuscritas directas sobre el papel con flechas curvas (`"Se suman (+ +): Alta Presión"`, `"Se restan (- -): Vacío"`, `"¡Catapulta hacia arriba ↑F!"`) que se cargan solo en ese instante y se descargan al pasar a la Escena 5.
3. **5 Transiciones Artesanales Distintas entre Escenas (`Creatividad 66 -> 95+`):**
   - **T1 (Escena 1→2):** *Trazo de Compás Da Vinci (`360°` arc wipe)* que desatornilla los pernos y abre el blindaje.
   - **T2 (Escena 2→3):** *Barrido de Carboncillo (Charcoal Brush Wipe)* con trazos diagonales de grafito que barren la escena hacia el macro zoom.
   - **T3 (Escena 3→4):** *Lupa / Iris de Leonardo* con mira reticulada que se cierra sobre el conductor con corriente y estalla al liberarse la Fuerza de Lorentz.
   - **T4 (Escena 4→5):** *Arco Eléctrico de Conmutación* (relámpago dibujado a mano que cruza verticalmente entre las escobillas $B_+$ y $B_-$).
   - **T5 (Escena 5→6):** *Pliegue de Plano Maestro (Blueprint Snap Lines)* donde reglas de construcción convergen desde las 4 esquinas para cerrar y atornillar el motor.
4. **Acabado Humano "No-IA" (`Diseño 89 -> 96+`):**
   - Se eliminan las cajas CSS con bordes redondeados uniformes de los títulos; ahora los títulos se trazan directamente sobre una **franja de papel de boceto rasgado / cinta de dibujo con líneas de construcción sobrepasadas (*architectural overshoots*) y doble pasada de lápiz**.
   - Se añaden múltiples pasadas de grafito con presión variable y marcas de construcción de cuaderno de inventor.
