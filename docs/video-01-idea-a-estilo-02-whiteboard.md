# Documentación de Producción — Video 01 (`version-1`)

- **Idea:** **Idea A — El motor invisible**
  > *"Comenzamos con un motor funcionando. Su carcasa se vuelve transparente, aparecen sus componentes internos y descubrimos cómo una corriente eléctrica provoca la rotación. Al final, reconstruimos el motor. Enfoque: cinematográfico, revelación y precisión mecánica."*
- **Estilo Visual:** **2. Whiteboard / Dibujo a mano (Boceto Grafito/Sepia Dopaminérgico `v3.0`)**
- **Rama:** `version-1` (Aislada)
- **Especificaciones:** `1920x1080` · `30 FPS` · `30.0 segundos (900 frames)` · Audio Estéreo Dopaminérgico (`44.1 kHz`)

---

## 1. Historial de Iteraciones, Puntajes del Usuario y Toma de Decisiones

### 1.1. Versión `v1.0` (Pizarrón Blanco de Ingeniería)
- **Enfoque inicial:** Pizarrón blanco porcelana con layout tipo dashboard multipanel.
- **Feedback del usuario:** Solicitó cambiar la estética hacia el boceto de referencia (`image.png`, carboncillo/sepia sobre papel pergamino), aumentar drásticamente el ritmo dopaminérgico con movimiento de cámara entre escenas y reducir la información mostrada simultáneamente.

---

### 1.2. Versión `v2.0` (Primer Rediseño Sepia Dopaminérgico) — Puntaje: `69.5 / 100`

#### Calificación Oficial Otorgada por el Usuario a `v2.0`
| Rubro | Puntaje | Evaluación y Diagnóstico del Usuario |
| :--- | :-: | :--- |
| **Creatividad** | `40 / 100` | Insuficiente; las apariciones de piezas aún dependían de traslaciones/escalas simples. |
| **Diseño** | `85 / 100` | *"Bastante apegado a lo esperado pero puede mejorarse aún."* |
| **Animaciones** | `75 / 100` | *"Se notan muy fluidas e impresionan, también el ritmo es el correcto, sin embargo siguen siendo muy básicas (tipo girar, rotar, mover de A a B lo cual no es malo pero hay algunos elementos que se sienten que deberían tener otras animaciones cómo los campos electromagnéticos que no se entienden)."* |
| **Coherencia temporal** | `99 / 100` | *"Me parece muy coherente y eso está bien, aunque quizás hayan detalles finos que no he notado."* |
| **Coherencia visual** | `89 / 100` | *"Me parece muy coherente y eso está bien... Pero aún le hace falta refinar pequeños detalles."* |
| **Coherencia de conceptos y diseño visual** | `29 / 100` | *"Hay elementos que no tienen sentido, cómo el rotor que está horizontal y el giro que se muestra en el centro más adelante en el video se muestra cómo si fuera el rotor vertical."* |
| **PROMEDIO FINAL `v2.0`** | **`69.5 / 100`** | **Insuficiente (Meta mínima requerida: `85 / 100`).** |

- **Observación adicional del usuario sobre el fondo:**
  > *"El fondo parece monótono y no reacciona a las animaciones del motor, está bien y la verdad no me gustaría sobrecargar la imagen pero si tuviera elementos sutiles que reaccionen a los elementos principales siento que le daría puntos."*

---

### 1.3. Toma de Decisiones e Ingeniería de la Versión `v3.0` (Objetivo: `> 85/100`)

Para resolver de raíz cada punto débil diagnosticado en `v2.0`, rediseñé la física interna, las animaciones de campos y el fondo del pergamino:

#### A. Solución al Fallo de Coherencia Mecánica (`29/100` → Rotor Cilíndrico Horizontal 3D Coherente)
- **Qué fallaba en `v2.0`:** Los ejes salientes izquierdo y derecho eran **horizontales** (`y = 540`), pero la espira central se estrechaba horizontalmente (`halfW = 165 * cos(θ)`) como si rotara alrededor de un eje **vertical**. Eso creaba una contradicción física grave entre el eje del motor y el giro del rotor.
- **Cómo se resolvió en `v3.0` (`IsometricMotorWhiteboard.tsx`):**
  1. **Eje Central Horizontal Continuo (`y = 540`):** El eje de acero atraviesa de lado a lado toda la cámara del rotor sobre la línea media `y = 540`.
  2. **Tambor Cilíndrico Horizontal 3D (`drumX1 = 875` a `drumX2 = 1155`, radio $R = 132\text{ px}$):** Montado coaxialmente sobre el eje horizontal, con tapas elípticas 3D a izquierda y derecha cuyos radios giran alrededor del eje horizontal, y ranuras de laminación que suben por la cara frontal y bajan por la trasera.
  3. **Colector de Delgas Cilíndrico Horizontal (`commX1 = 795` a `commX2 = 862`, radio $R = 64\text{ px}$):** Montado sobre el cuello izquierdo del mismo eje horizontal, de modo que las escobillas superiores e inferiores hacen contacto físico real con la superficie superior e inferior del colector.
  4. **Bobinas Horizontales con Rotación 3D Alrededor del Eje Horizontal:** Las 4 barras conductoras de cobre mantienen su longitud horizontal constante (`x: 875..1155`) y **giran verticalmente alrededor del eje horizontal** ($y(\theta) = 540 - R\sin\theta$, profundidad $z(\theta) = R\cos\theta$). Cuando una barra pasa por la cara **frontal** ($z \ge 0$), se dibuja con trazo grueso delante del tambor llevando corriente hacia la derecha (`───►`) y recibiendo Fuerza de Lorentz hacia arriba (`↑F`); cuando pasa por la cara **trasera** ($z < 0$), pasa oculta/punteada detrás del tambor llevando corriente de regreso (`◄───`).

#### B. Solución a la Animación de los Campos Electromagnéticos (`75/100` → Catapulta Magnética + Vórtices $\vec{B}_I$)
- **Qué fallaba en `v2.0`:** 5 líneas rectas punteadas azules moviéndose horizontalmente no explicaban qué es el campo magnético ni por qué empuja a la bobina.
- **Cómo se resolvió en `v3.0`:**
  1. **Flujo Dipolar Curvo (`N → S`) con Partículas de Flujo:** 9 líneas de campo curvas que nacen del arco del imán Norte (`N`), se concentran a través del tambor del rotor y entran al imán Sur (`S`), acompañadas por cabezas de vector que fluyen de `N` a `S`.
  2. **Vórtices Magnéticos Concéntricos ($\vec{B}_I$) alrededor del Cable:** Al inyectarse corriente $I$ en las barras horizontales del rotor, aparecen anillos magnéticos elípticos concéntricos girando alrededor de la barra conductora.
  3. **Deformación Elástica del Campo ("Efecto Catapulta Magnética"):** Las líneas de campo magnético del estator ($\vec{B}$) se **curvan y comprimen elásticamente debajo de la barra frontal con corriente** (`bendFront` proporcional a $I \cdot e^{-d^2}$), mostrando visualmente cómo el campo magnético actúa como una cuerda elástica tensada que **catapulta la barra frontal hacia arriba (`↑F`)** haciendo girar el cilindro horizontal.

#### C. Solución a la Creatividad Mecánica (`40/100` → Apertura/Cierre Clamshell con Pernos Giratorios)
- En vez de que la carcasa exterior simplemente cambie de opacidad, en `v3.0` el blindaje está dividido en **Mitad Superior** y **Mitad Inferior** sujetas por **4 pernos con ranura**.
- En la Escena 2, los 4 pernos **giran $540^\circ$ desenroscándose** mientras la mitad superior de la carcasa se eleva (`-165 px`) y la mitad inferior desciende (`+165 px`) como una valva mecánica (*clamshell*) que se abre para revelar el interior. En la Escena 6, ambas mitades se cierran verticalmente y los pernos se vuelven a atornillar.

#### D. Fondo de Papel Pergamino Reactivo y Sutil (`ReactiveParchmentBackground.tsx`)
- Sin recargar el área central del motor, añadimos tres elementos sutiles grabados en el papel pergamino:
  1. **60 Limaduras de Grafito Periféricas:** En reposo están dispersas orgánicamente en los bordes del papel; cuando el motor gira a `3,000 RPM` vibran suavemente, y cuando se activa el campo magnético (`bFieldProgress`) **rotan suavemente hasta alinearse con las líneas de flujo dipolar `N → S`**.
  2. **Anillos de Compás y Transportador Da Vinci:** Grabados a baja opacidad (`13%–21%`) en la fibra del papel; giran lentamente en contrafase con el rotor y se expanden ligeramente con cada pulso de torque.
  3. **Ondas Acústicas/Magnéticas en el Papel:** Aros sutiles que se propagan por el pergamino al ritmo de las RPM y de los chispazos de conmutación.

---

## 2. Evaluación Pendiente de `v3.0`
- **Puntaje otorgado por el usuario (`v3.0`):** _Pendiente de calificación_
