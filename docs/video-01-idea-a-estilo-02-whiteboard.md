# Documentación de Producción — Video 01 (`version-1`)

- **Idea:** **Idea A — El motor invisible**
  > *"Comenzamos con un motor funcionando. Su carcasa se vuelve transparente, aparecen sus componentes internos y descubrimos cómo una corriente eléctrica provoca la rotación. Al final, reconstruimos el motor. Enfoque: cinematográfico, revelación y precisión mecánica."*
- **Estilo Visual:** **2. Whiteboard / Dibujo a mano (Boceto Grafito/Sepia Dopaminérgico `v4.0`)**
- **Rama:** `version-1` (Aislada)
- **Especificaciones:** `1920x1080` · `30 FPS` · `30.0 segundos (900 frames)` · Audio Estéreo Dopaminérgico (`44.1 kHz`)

---

## 1. Historial de Iteraciones, Puntajes del Usuario y Toma de Decisiones

### 1.1. Versión `v1.0` (Pizarrón Blanco de Ingeniería)
- **Enfoque inicial:** Pizarrón blanco porcelana con layout tipo dashboard multipanel.
- **Feedback del usuario:** Solicitó cambiar la estética hacia el boceto de referencia (`image.png`, carboncillo/sepia sobre papel pergamino), aumentar drásticamente el ritmo dopaminérgico con movimiento de cámara entre escenas y reducir la información mostrada simultáneamente.

---

### 1.2. Versión `v2.0` (Primer Rediseño Sepia Dopaminérgico) — Puntaje: `69.5 / 100`
- **Desglose:** Creatividad `40` · Diseño `85` · Animaciones `75` · Coherencia temporal `99` · Coherencia visual `89` · Coherencia de conceptos `29`.
- **Fallo principal diagnosticado:** Contradicción mecánica entre los ejes horizontales y la espira central que parecía girar en eje vertical, campo magnético demasiado básico (líneas rectas punteadas) y fondo estático.

---

### 1.3. Versión `v3.0` (Rotor Cilíndrico Horizontal 3D + Catapulta Magnética + Fondo Reactivo) — Puntaje: `88.0 / 100` ✅ (Pasa 1ª Tanda `>= 85`)

#### Calificación Oficial Otorgada por el Usuario a `v3.0`
| Rubro | Puntaje `v2.0` | Puntaje `v3.0` | Diagnóstico Textual del Usuario sobre `v3.0` |
| :--- | :-: | :-: | :--- |
| **Creatividad** | `40 / 100` | **`66 / 100`** | *"Has mejorado pero sigue siendo algo común. Me encantan las transiciones y la forma en la que lo manejaste, siento que podrías añadir distintos tipos de transiciones para aumentar la fluidez y que se sienta mejor pensado y por ende más creativo."* |
| **Diseño** | `85 / 100` | **`89 / 100`** | *"Me agrada más por sus líneas y los detalles que has añadido, pero aún parece muy hecho por IA. También hay partes que se sobrecargan; quizás deberías implementar descarga y carga de elementos bajo demanda de tal forma que no aparezcan todos al mismo tiempo, pero que a su vez cada uno tenga su momento de brillar."* |
| **Animaciones** | `75 / 100` | **`90 / 100`** | *"La fluidez se ha mantenido, el ritmo me importa y me gusta, pero hay elementos que todavía no se entienden, cómo los vórtices de corriente y el campo tensado; si no te los explican no se entiende qué hacen (se entiende el movimiento mejor que antes pero ahora no se entiende el por qué ni sus interacciones)."* |
| **Coherencia temporal** | `99 / 100` | **`99 / 100`** | *"Se mantiene porque he revisado que hay pequeños detalles que son confusos, cómo en el momento en el que se abre el motor para mostrar su interior, no es que no se entienda sino que da una pequeña sensación de '¿qué pasó con los elementos que lo conforman aquí?!' pero en cuanto lo piensas en 1s toma coherencia..."* |
| **Coherencia visual** | `89 / 100` | **`99 / 100`** | *"Está excelente."* |
| **Coherencia de conceptos y diseño visual** | `29 / 100` | **`85 / 100`** | *"Me agrada, pero hay pequeños detalles que pulir aún."* |
| **PROMEDIO FINAL** | **`69.5 / 100`** | **`88.0 / 100`** | *"Ya pasa esta primera tanda de pruebas pero me gustaría que hagas una V4 refinando los últimos detalles y preparándola para la siguiente tanda de pruebas que medirán cosas distintas (aunque algunas similares) y serán más críticas."* |

---

### 1.4. Toma de Decisiones e Ingeniería de la Versión `v4.0` (Preparación para 2ª Tanda Crítica)

En `v4.0` atacamos los 4 puntos finos señalados por el usuario en su evaluación de `v3.0`:

#### A. Carga y Descarga de Elementos Bajo Demanda (*Spotlight Staging*) + Continuidad Espacial al Abrir (`IsometricMotorWhiteboard.tsx`)
1. **Continuidad instantánea al abrir el motor (Frame 118–150):**
   - *Por qué en `v3.0` daba sensación de "¿qué pasó con los elementos aquí?":* En `v3.0` las valvas del blindaje se abrían en el frame 122, pero la cámara central y el tambor no empezaban a dibujarse hasta el frame 172, dejando un hueco vacío durante ~1.5 segundos.
   - *Solución en `v4.0`:* Precargamos el núcleo interno (`corePreLoaded = smoothstep(100, 118, frame)`) **detrás** de la carcasa cerrada antes de que se abra. Así, desde el primer milímetro que las valvas superior e inferior se separan en el frame 118, el espectador descubre inmediatamente el tambor horizontal y el eje que ya estaban girando adentro.
2. **Carga y Descarga Bajo Demanda (*On-Demand Load / Unload*):**
   - **Escena 2 (`frames 120–238`):** Primero brillan al `100%` los imanes en herradura `N` y `S`; luego se cargan las etiquetas manuscritas `"1. Colector en el eje horizontal"` y `"2. Tambor Cilíndrico 3D"`, las cuales **se descargan por completo en el frame 238** antes de entrar al Macro Zoom.
   - **Escenas 3 y 4 (`frames 240–536`):** Para evitar sobrecarga visual en el centro, los imanes exteriores se atenúan a trazo fantasma de referencia (`42%`) y la pared cuadrada del estator baja a `45%`, dejando todo el protagonismo a las líneas de campo magnético, la barra frontal con corriente y su vórtice.
   - **Escena 5 (`frames 540–715`):** Se **descargan por completo** los diagramas y rótulos de vórtices/presión de las Escenas 3–4 (`vortexExplainOpacity -> 0`) y se **carga bajo demanda** el rótulo del colector (`"¡Cada 180° las delgas invierten +I ↔ -I!"`) junto con la onda inferior de torque rectificado.
   - **Escena 6 (`frames 720–900`):** Se **descargan** tanto el rótulo del colector como la onda inferior de torque, devolviendo el `100%` de presencia a los imanes y al blindaje reconstruido.

#### B. Explicación Visual Auto-Contenida de los Vórtices y el Campo Tensado (`Animaciones 90 -> 98/100`)
- Para que cualquier espectador entienda **por qué** el vórtice de la corriente ($\vec{B}_I$) tensa el campo de los imanes ($\vec{B}$) y empuja el cable sin necesidad de explicación externa, construimos un micro-diagrama causal directo sobre la barra conductora frontal:
  1. **Flechas direccionales explícitas en el remolino del cable:**
     - En el arco **superior** del vórtice, una flecha roja apunta a la **izquierda (`◄───`)**, oponiéndose a las flechas azules del campo de los imanes (`───►`). Justo encima se carga la nota manuscrita:
       **`"ARRIBA: Opuestos (◄─ vs ─►) = SE RESTAN (-)"`**.
     - En el arco **inferior** del vórtice, una flecha roja apunta a la **derecha (`───►`)**, en el **mismo sentido** que las flechas azules del campo (`───►`). Debajo del cable aparece un **colchón sombreado ámbar de líneas comprimidas** (`amberPressureHatch`) con la nota manuscrita:
       **`"ABAJO: Mismo sentido (─► + ─►) = ¡EMPUJE (+ +)!"`**.
  2. **Resultado físico inmediato (Escena 4):** El colchón inferior comprimido (`+ +`) actúa visiblemente como un resorte que dispara la flecha verde esmeralda **`↑ CATAPULTA LORENTZ (F)`** hacia la zona superior de baja presión (`- -`), haciendo girar el tambor cilíndrico horizontal.

#### C. 5 Transiciones Artesanales Diferentes entre las 6 Escenas (`CreativeSceneTransitions.tsx` — `Creatividad 66 -> 95+/100`)
Cada cambio de escena emplea ahora una herramienta distinta de dibujo técnico/inventor:
1. **Transición 1→2 (`Frames 108–138`):** **Compás de Leonardo Da Vinci** — Un compás de brazos articulados pivota desde la parte superior y traza un círculo de corte de `360°` alrededor del motor para abrir el blindaje.
2. **Transición 2→3 (`Frames 228–254`):** **Barrido de Carboncillo en Seco (*Charcoal Curtain Wipe*)** — 7 trazos diagonales gruesos de grafito barren el lienzo de derecha a izquierda acompañando el whip-zoom hacia el interior del entrehierro.
3. **Transición 3→4 (`Frames 362–392`):** **Lupa / Iris Reticulado del Inventor** — Una lente circular con mira reticulada (`+ + +`) se cierra enfocando la barra con corriente y se expande explosivamente cuando se libera la Fuerza de Lorentz (`↑F`).
4. **Transición 4→5 (`Frames 528–554`):** **Relámpago de Conmutación** — Un arco eléctrico quebrado salta verticalmente entre la escobilla superior ($B_+$), el colector horizontal y la escobilla inferior ($B_-$), disparando la escena de inversión a $180^\circ$.
5. **Transición 5→6 (`Frames 708–740`):** **Reglas T y Escuadras de Ensamble Maestro** — Dos reglas horizontales graduadas en milímetros se cierran desde los bordes superior e inferior del pergamino, empujando las dos mitades de la carcasa para re-ensamblar el motor.

#### D. Acabado Humano "No-IA" (`WhiteboardAnnotations.tsx` — `Diseño 89 -> 96+/100`)
- Eliminamos las cajas CSS (`div` con `border-radius` y sombra rígida) y las reemplazamos por **cartelas arquitectónicas dibujadas en SVG** con doble pasada de lápiz desfasada, líneas de construcción que sobrepasan las 4 esquinas (*architectural overshoots*), cruces de registro (`+`) en el plano y subrayado manual a lápiz.
