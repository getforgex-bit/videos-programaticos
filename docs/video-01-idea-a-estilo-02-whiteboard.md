# Documentación de Producción — Video 01 (`version-1`)

- **Idea:** **Idea A — El motor invisible**
  > *"Comenzamos con un motor funcionando. Su carcasa se vuelve transparente, aparecen sus componentes internos y descubrimos cómo una corriente eléctrica provoca la rotación. Al final, reconstruimos el motor. Enfoque: cinematográfico, revelación y precisión mecánica."*
- **Estilo Visual:** **2. Whiteboard / Dibujo a mano (Evolucionado en `v2.0` a Boceto Grafito/Sepia Dopaminérgico inspirado en `image.png`)**
- **Rama:** `version-1` (Aislada)
- **Especificaciones:** `1920x1080` · `30 FPS` · `30.0 segundos (900 frames)` · Audio Estéreo Dopaminérgico (`44.1 kHz`)

---

## 1. Historial de Iteraciones y Toma de Decisiones

### 1.1. Versión `v1.0` (Pizarrón Blanco de Ingeniería — Descartada por Estilo y Ritmo)
- **Decisiones iniciales (`v1.0`):** Se planteó un pizarrón blanco porcelana (`#F6F4EC`) con cuadrícula milimétrica y un layout tipo *dashboard* donde convivían el motor central isométrico, un panel inferior izquierdo con el circuito DC (**Capa 2**), un panel central con 5 pasos y un panel inferior derecho con el osciloscopio (**Capa 1**).
- **Feedback del Usuario sobre `v1.0`:**
  1. **Estilo Visual:** No coincidía con la visión buscada; el usuario compartió un boceto de referencia (`image.png`) con estética de **dibujo a lápiz/carboncillo sepia sobre papel pergamino envejecido**, trazos gruesos orgánicos, achurado diagonal denso (`///`), imanes en herradura laterales (`N` y `S`), núcleo central cuadrado redondeado de doble pared, ejes escalonados y flechas `F` de doble contorno.
  2. **Ritmo / Dopamina:** `v1.0` se sentía estático y aburrido. Se solicitó un video **mucho más dopaminérgico**, con constantes cambios visuales, efectos de impacto y **movimiento real de cámara entre escenas**.
  3. **Carga Cognitiva:** Había demasiada información simultánea en pantalla (confirmando el punto #1 y #5 de nuestra autocrítica de `v1.0`). Se pidió **reducir drásticamente la información mostrada a la vez** y presentarla dinámicamente a lo largo del tiempo.

---

### 1.2. Toma de Decisiones para la Versión `v2.0` (Boceto Grafito/Sepia Dopaminérgico)

Para responder al 100% a la dirección del usuario sin copiar literalmente `image.png` pero adoptando todo su ADN visual y mecánico, rediseñé el video bajo tres pilares:

#### A. Estética Táctil de Boceto a Lápiz / Carboncillo Sepia (`image.png` DNA)
- **Papel Pergamino y Textura de Fibra (`MainVideo.tsx`):** Fondo radial en tonos pergamino/kraft cálido (`#EFE1C6` → `#E2CFAF` → `#C8AE86`) con textura cruzada de fibra de papel y viñeta cinematográfica que pulsa con cada impacto.
- **Sombreado Diagonal a Mano (`IsometricMotorWhiteboard.tsx`):** Patrones SVG de achurado a lápiz a $38^\circ$ (`sepiaDenseHatch`, `sepiaLightHatch`, `sepiaArmorHatch`) con trazos de `#362312` y `#5C3F24` de `5.5px` a `7.5px`.
- **Arquitectura Mecánica Inspirada en el Boceto:**
  - **Imanes en herradura gigantes:** Polo Norte (`N`) a la izquierda con mitad superior sombreada oscura y mitad inferior clara; Polo Sur (`S`) a la derecha con mitad superior clara y mitad inferior oscura, flanqueando barras verticales de estator.
  - **Ejes horizontales con rodamientos escalonados de 3 niveles:** Sobresaliendo a izquierda y derecha del núcleo, con líneas de sombreado que se desplazan verticalmente a alta velocidad y arcos cinéticos punteados.
  - **Cámara central cuadrada redondeada de doble pared (`560×560`):** Con 4 postes terminales verticales (2 arriba y 2 abajo) y contactos circulares de escobillas (`•`).
  - **Lazo interno de corriente + Espira 3D:** Conductores verticales paralelos con flechas ortogonales (`←` y `→`) que invierten color y sentido cada $180^\circ$, más una espira 3D que gira con escorzo ($\cos\theta$).
  - **Flechas `F` de doble contorno y arcos punteados en `N` y `S`:** Exactamente en la disposición diagonal de par motor (`F ↱` arriba a la derecha y `F ↲` abajo a la izquierda).

#### B. Coreografía de Cámara Dopaminérgica en 6 Escenas (`handDrawnUtils.ts`)
Eliminé la cámara fija de `v1.0` e implementé un rig de cámara virtual 2D (`scale`, `tx`, `ty`, `rotateDeg`, `cameraShake`, `flash`) con **6 cambios de escena de alta energía**:
1. **Escena 1 (`0:00 - 0:04` | `Frames 0 - 120`) — ¡Impacto! Motor Blindado a 3,000 RPM:**
   - *Cámara:* Punch-in rápido (`1.38x -> 1.02x`) con rotación de entrada y sacudida (*camera shake*) en el frame 38 cuando el motor arranca con líneas de velocidad radiales.
2. **Escena 2 (`0:04 - 0:08` | `Frames 120 - 240`) — Onda de Choque Rayos-X y Golpe de Imanes:**
   - *Cámara:* Una onda de choque circular disuelve la carcasa blindada a líneas fantasma (`14%`). La cámara hace whip-pan a la izquierda cuando se clava el imán `N` (frame 148), whip-pan a la derecha cuando se clava el imán `S` (frame 168) y encuadra el núcleo central (frame 188).
3. **Escena 3 (`0:08 - 0:12.5` | `Frames 240 - 375`) — Macro Zoom a Escobillas y Corriente (`I`):**
   - *Cámara:* Macro zoom (`1.50x`) con paneo diagonal sobre los postes de las escobillas y el núcleo interior mientras entran las flechas curvas de corriente (`+I / -I` de **Capa 2**) y las ondas de flujo magnético ($\vec{B}$).
4. **Escena 4 (`0:12.5 - 0:18` | `Frames 375 - 540`) — ¡Explosión de Fuerza de Lorentz (`F`)!:**
   - *Cámara:* Snap-zoom (`1.16x`) con sacudida de impacto (amplitud `26px`) y órbita suave cuando estallan las dos flechas gigantes **`F`** de doble contorno con anillos de onda expansiva dorada.
5. **Escena 5 (`0:18 - 0:24` | `Frames 540 - 720`) — Hiper-Rotación e Inversión cada 180°:**
   - *Cámara:* Zoom rítmico que pulsa con cada chispazo de $180^\circ$ en los 4 contactos de las escobillas mientras **Capa 1 (Manim)** traza una cinta limpia de pulso de torque (`/\ /\ /\`) al pie del pergamino sin cajas contenedoras.
6. **Escena 6 (`0:24 - 0:30` | `Frames 720 - 900`) — Reconstrucción por Impacto:**
   - *Cámara:* Pullback dramático (`1.26x -> 1.00x`) con 3 golpes mecánicos secos (`frames 722, 748, 775`) mientras las placas blindadas exteriores y los 4 pernos se vuelven a ensamblar dejando una ventana central translúcida de memoria.

#### C. Reducción Radical de Información en Pantalla (`WhiteboardAnnotations.tsx`)
- Se eliminaron **todos** los paneles laterales permanentes, la tabla de telemetría de 6 variables y el diagrama de 5 cajas.
- En su lugar, aparece **un único cartel cinético dibujado a mano a la vez** (`KINETIC_CUES`), con animación elástica de entrada (*pop*) y salida limpia antes de la siguiente transición.

---

## 2. Aciertos de la Versión `v2.0`

1. **Fidelidad Estética al Boceto `image.png` con Vida Cinemática:**
   - La geometría de herraduras `N/S` con sombreado partido, el núcleo cuadrado redondeado de doble pared, los 4 terminales con remaches negros y las flechas `F` de doble contorno capturan de inmediato la personalidad artesanal del boceto del usuario.
2. **Ritmo Dopaminérgico Visual y Sonoro:**
   - Hay un evento cinético mayor (whip-pan, macro zoom, sacudida de cámara, onda de choque o explosión de chispas) cada `1.5 a 3 segundos`, respaldado por *whooshes*, impactos *sub-bass* y un pulso rítmico a 128 BPM en `whiteboard_motor_sfx.wav`.
3. **Claridad y Foco Visual:**
   - Al mostrar 1 sola frase corta a la vez y hacer que la cámara viaje directamente hacia la pieza protagonista de cada escena, el espectador nunca tiene que dividir su atención entre múltiples recuadros.

---

## 3. Fallos, Autocrítica y Limitaciones Detectadas en `v2.0`

1. **Intensidad del Movimiento de Cámara:**
   - Para lograr el efecto dopaminérgico solicitado, la cámara combina *whip-pans*, inclinaciones (*Dutch tilts* de $\pm 2.4^\circ$) y sacudidas de impacto (*camera shake*). Si el usuario prefiere que algún impacto sea más suave o más agresivo, los coeficientes en `computeImpactShake` y `computeCameraAtFrame` pueden calibrarse al instante.
2. **Transición entre Vista Frontal de Boceto (`image.png`) y Rotación 3D de la Espira:**
   - Dado que el boceto de referencia es un corte frontal 2D muy icónico, la rotación del rotor se representa mediante el escorzo 3D ($\cos\theta$) de la espira interior junto con la inversión de las flechas ortogonales y las líneas de giro en los ejes laterales.
3. **Solapamiento Parcial entre el Cartel Cinético Inferior y la Flecha `F` Inferior en Escena 4:**
   - Al hacer zoom (`1.16x - 1.26x`) en las Escenas 4 y 5, la flecha `F` de doble contorno en la parte inferior izquierda (`y: 930..1012`) queda parcialmente cubierta por el cartel cinético inferior (`bottom: 46px`). Si el usuario desea despejar esa zona en `v2.1`, podemos reducir ligeramente el radio vertical de los postes externos o colocar el cartel como marca de agua sin fondo opaco.

---

## 4. Evaluación del Usuario y Registro de Puntaje

### 4.1. Evaluación de `v1.0` (Registrada)
- **Veredicto del usuario:** *"Bien, pero el estilo visual no se parece a lo que yo me imaginaba [adjuntó `image.png`]... necesito que sea mucho más dopaminérgico, siento que es aburrido. Necesito más cambios y efectos además de movimiento entre escenas. Reduce la cantidad de información mostrada en pantalla a la vez y preséntala dinámicamente a lo largo del video."*
- **Estado:** Corregido integralmente en `v2.0`.

### 4.2. Evaluación de `v2.0` (En espera del usuario)
- **Puntaje otorgado por el usuario:** _Pendiente_
- **¿Qué le gustó al usuario de `v2.0`?:** _Pendiente_
- **¿Qué NO le gustó / ajustes para `v2.1`?:** _Pendiente_
