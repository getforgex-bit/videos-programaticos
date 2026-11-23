# Documentación de Producción — Video 01 (`version-1`)

- **Idea:** **Idea A — El motor invisible**
  > *"Comenzamos con un motor funcionando. Su carcasa se vuelve transparente, aparecen sus componentes internos y descubrimos cómo una corriente eléctrica provoca la rotación. Al final, reconstruimos el motor. Enfoque: cinematográfico, revelación y precisión mecánica."*
- **Estilo Visual:** **2. Whiteboard / Dibujo a mano**
  > *"Trazos que aparecen progresivamente, diagramas dibujados y explicaciones que se construyen visualmente."*
- **Rama:** `version-1` (Aislada)
- **Especificaciones:** `1920x1080` · `30 FPS` · `30.0 segundos (900 frames)` · Audio Estéreo Procedural (`44.1 kHz`)

---

## 1. Toma de Decisiones (Criterio Propio)

### 1.1. Estructura Narrativa y Ritmo Cinematográfico (5 Actos en 30 Segundos)
Para honrar simultáneamente el **enfoque cinematográfico de revelación y precisión mecánica** de la *Idea A* y la **construcción progresiva** del *Estilo 2 (Whiteboard / Dibujo a mano)*, dividí los 30 segundos (`900 frames`) en 5 actos con modulaciones deliberadas de velocidad angular ($\text{RPM}$) y escala de cámara:

1. **Acto I (`0:00 - 0:06` | `Frames 0 - 180`) — El Motor en Funcionamiento:**
   - *Decisión:* En vez de aparecer ya dibujado, el marcador traza en los primeros `2.5s` los ejes de simetría isométricos (`— · —`), la cota maestra (`L = 210 mm`), la carcasa cilíndrica con aletas de enfriamiento y el eje de salida. En el segundo `2.5s` el motor cobra vida acelerando hasta `2,800 RPM` con arcos cinéticos de rotación alrededor del eje.
   - *Por qué:* Establece de inmediato el lenguaje "dibujo a mano que cobra vida física" y plantea la incógnita narrativa: *por fuera solo vemos acero sellado y rotación pura; ¿qué fuerza invisible mueve el eje?*
2. **Acto II (`0:06 - 0:12` | `Frames 180 - 360`) — La Revelación (Carcasa Transparente / Rayos-X):**
   - *Decisión:* Un barrido vertical azul (`MODO RAYOS-X`) recorre el motor de izquierda a derecha mientras la cámara hace un *push-in* suave (`1.00x -> 1.055x`) y el motor desacelera a cámara lenta (`450 RPM`) para permitir la inspección mecánica. El achurado carbón de la carcasa se disuelve y su contorno pasa a línea punteada fantasma (`18%` de opacidad). Dentro se dibujan progresivamente:
     - **Estator magnético:** Polo Norte ($N$) en rojo carmesí con achurado a $45^\circ$ y Polo Sur ($S$) en azul cobalto.
     - **Rotor bobinado:** Núcleo ferromagnético y espiras de cobre en perspectiva 3D.
     - **Colector de delgas y escobillas ($B_+/B_-$):** En el cuello posterior del eje.
3. **Acto III (`0:12 - 0:19` | `Frames 360 - 570`) — El Secreto Físico (Corriente, Campo y Fuerza de Lorentz):**
   - *Decisión:* Ralentizamos el rotor a cámara ultra-lenta (`~112 RPM`) en los primeros segundos del acto para construir visualmente la cadena causal física:
     1. Se trazan 5 líneas de flujo magnético $\vec{B}$ de Norte ($N$) a Sur ($S$).
     2. En el panel inferior izquierdo (**Capa 2 — Motion Canvas**), el interruptor `SW1` se cierra e inyecta corriente directa ($I$).
     3. Pulsos rojos de corriente recorren la espira de cobre en 3D.
     4. Nacen dos vectores opuestos en verde esmeralda ($\uparrow \vec{F} = I(\vec{L} \times \vec{B})$ en el conductor izquierdo y $\downarrow -\vec{F}$ en el conductor derecho), generando el par de rotación ($\vec{\tau}$) que vuelve a acelerar el rotor.
4. **Acto IV (`0:19 - 0:24` | `Frames 570 - 720`) — Conmutación cada 180° y Rotación Continua:**
   - *Decisión:* Explicar un detalle mecánico que la mayoría de animaciones omiten: si la corriente nunca cambiara de sentido, la bobina se detendría a los $180^\circ$. Mostramos cómo las dos delgas del colector giran rozando las escobillas fijas ($B_+/B_-$) e invierten la corriente cada media vuelta con un destello ámbar sincronizado en el motor 3D, en el circuito de Capa 2 y en la curva rectificada $\tau(\theta) = |\sin\theta|$ de Capa 1 (**Manim**).
5. **Acto V (`0:24 - 0:30` | `Frames 720 - 900`) — Reconstrucción Mecánica con Ventana de Memoria:**
   - *Decisión:* Al reconstruir la carcasa exterior con un barrido inverso (`RECONSTRUYENDO`) y *pull-back* de cámara (`1.055x -> 1.00x`), decidí **dejar una ventana central de corte arquitectónico** con líneas de construcción punteadas.
   - *Por qué:* Si cerráramos la carcasa al 100% opaca como en el segundo 0, perderíamos la conexión visual con el aprendizaje. El corte parcial permite ver la carcasa sólida reconstruida y, a la vez, recordar las fuerzas invisibles que siguen operando en su interior a `3,000 RPM`.

---

### 1.2. Decisiones Técnicas para el Estilo "Whiteboard / Dibujo a Mano"
- **Algoritmo de Trazado Orgánico (`handDrawnUtils.ts`):**
  - En lugar de usar líneas rectas y elipses geométricamente estériles, implementé generadores SVG (`sketchLine`, `sketchEllipseArc`, `sketchArrow`) que añaden una perturbación sinusoidal armónica determinista (sin parpadeo aleatorio desagradable entre frames) más un ligero *overshoot* (`3.5 px`) en los vértices, imitando el trazo real de un ingeniero dibujando con marcador sobre pizarrón.
- **Integración de Capas con Fusión de Tinta (`mix-blend-mode: multiply`):**
  - Tanto el video de **Capa 1 (`manim_torque_wave.webm`)** como el de **Capa 2 (`motion_canvas_circuit.webm`)** se renderizan sobre fondo blanco puro (`#FFFFFF`) y se componen en **Remotion** con `mixBlendMode: 'multiply'`.
  - *Ventaja técnica:* El blanco (`1.0`) se vuelve 100% transparente dejando intacta la textura porcelana (`#F6F4EC`) y la cuadrícula milimétrica del pizarrón, mientras que los trazos oscuros y de color se funden como tinta real sobre el tablero sin artefactos de premultiplicación alfa.
- **Fuente Única de Verdad Física (`manim_physics_telemetry.json`):**
  - El ángulo del rotor $\theta(t)$, las $\text{RPM}(t)$, la polaridad del conmutador $p(t) \in \{+1, -1\}$, el destello de conmutación y el torque $\tau(t)$ se calculan con la misma función determinista en Python (para Capa 1, Capa 2 y el audio WAV) y en TypeScript (para Capa 3 en Remotion). Así, cada vez que el rotor cruza $180^\circ$, el chispazo en el motor 3D, el destello en el diagrama del colector, el cero de la onda en el osciloscopio y el chasquido en la pista de audio ocurren exactamente en el mismo frame.

---

## 2. Aciertos (Lo que funcionó bien en `v1.0`)

1. **Coherencia del Lenguaje de Pizarrón de Ingeniería:**
   - La combinación de fondo porcelana cálido (`#F6F4EC`), cuadrícula milimétrica azul tenue, achurados diagonales (`///`) para diferenciar materiales (acero carbón, imán Norte rojo, imán Sur azul) y tipografía manuscrita local (`Humor Sans` + `Comic Neue`) logra una estética auténtica de pizarrón técnico sin sacrificar legibilidad.
2. **Transición de Carcasa Transparente (Acto II) y Reconstrucción (Acto V):**
   - El paso de líneas sólidas de `4px` con relleno achurado a líneas punteadas de `2.2px` al `18%` de opacidad detrás de la barra de escaneo `MODO RAYOS-X` comunica instantáneamente que la carcasa se volvió transparente sin desaparecer por completo.
3. **Explicación Visual Tripartita (Motor 3D + Circuito 2D + Osciloscopio Matemático):**
   - Ver al mismo tiempo el fenómeno espacial (la bobina girando entre los polos $N$ y $S$ con las flechas verdes de Lorentz), el fenómeno eléctrico (el interruptor cerrándose y las delgas invirtiendo la corriente) y la demostración matemática (la onda $\tau(\theta) = |\sin\theta|$ frente a la onda punteada sin rectificar) hace que la explicación sea auto-contenida incluso sin voz en off.
4. **Cursor de Marcador en Vivo y Diseño Sonoro:**
   - El marcador inclinado que acompaña los trazos nuevos junto con la fricción sonora de fieltro sobre pizarrón y el zumbido armónico proporcional a las RPM refuerzan la sensación táctil del estilo *Whiteboard*.

---

## 3. Fallos Detectados, Autocrítica y Limitaciones (`v1.0`)

### 3.1. Fallos Detectados en el Primer Render de Prueba (`v1.0-alpha`) y Corregidos antes de Entrega
Al extraer e inspeccionar los 5 cuadros clave del primer render encontramos 4 fallos geométricos y de maquetación que fueron corregidos para la versión `v1.0`:
1. **Desbordamiento en la etiqueta `Callout 1`:** Cuando el texto cambiaba a `"1. CARCASA TRANSPARENTE (FANTASMA 18%)"`, la caja de `275px` quedaba corta y el texto sobresalía por ambos bordes. *(Corregido ampliando la caja a `335px` con `fontSize: 15.5`)*.
2. **Solapamiento entre la insignia roja del Polo Norte (`N`) y el anillo del colector:** En el eje central izquierdo (`cy0`), el recuadro `N` tocaba el anillo naranja del conmutador. *(Corregido reubicando las insignias `N` y `S` en las coronas superiores de los imanes a `cy0 - 132`)*.
3. **Cruce interno de los vectores verdes de Fuerza de Lorentz ($\vec{F}$) cerca de $\theta = 90^\circ$:** Al anclar las fuerzas según la coordenada horizontal `x`, cuando la espira pasaba por la vertical ($\theta \approx 90^\circ$), ambas flechas apuntaban hacia el interior de la bobina cruzándose con sus etiquetas. *(Corregido anclando $\uparrow \vec{F}$ siempre al conductor superior y $\downarrow -\vec{F}$ al conductor inferior para que los vectores apunten siempre hacia el exterior de la espira)*.
4. **Salto de línea en la ecuación de Lorentz del panel de Telemetría:** La cadena `"Ley de Lorentz: F = I · (L × B)"` partía `"B)"` en una segunda línea. *(Corregido con `whiteSpace: 'nowrap'` y ajuste tipográfico a `20px`)*.

### 3.2. Limitaciones y Puntos Abiertos de `v1.0` (Para Evaluar con el Usuario)
1. **Alta Densidad Informativa en los Actos III–V:**
   - A partir del segundo `12.5s`, coexisten simultáneamente el motor isométrico central, el circuito DC inferior izquierdo (**Capa 2**), la cadena causal de 5 pasos al centro y el osciloscopio de torque inferior derecho (**Capa 1**). Aunque no hay colisiones visuales, requiere atención dividida.
2. **Simplificación Didáctica del Bobinado 2.5D:**
   - El rotor representa 1 espira maestra de cobre de alto grosor y 1 espira secundaria a $90^\circ$ con un colector de 2 delgas para que la inversión de corriente cada $180^\circ$ sea perfectamente comprensible, en lugar de un inducido industrial multipolar complejo.
3. **Trayectoria Cinemática del Marcador:**
   - El marcador animado acompaña las zonas activas de dibujo con una curva paramétrica suave, en lugar de trazar micro-segmento por micro-segmento cada línea de achurado.
4. **Proximidad entre la Etiqueta Superior `↑ F = I(L×B)` y la Cota `L = 210 mm` en Máxima Amplitud ($\theta \approx 90^\circ / 270^\circ$):**
   - Cuando la espira alcanza su punto más alto ($\sin\theta \approx \pm 1$), la pastilla verde `↑ F = I(L×B)` roza la línea de cota superior `← L = 210 mm (CÁMARA DEL ESTATOR) →` y el rótulo `Campo B (N→S)`. Es un punto claro a ajustar en `v1.1` junto con las observaciones del usuario.

---

## 4. Evaluación del Usuario y Registro de Correcciones

> **Instrucciones:** Esta sección se actualiza inmediatamente cuando el usuario indique el **puntaje del video**, **qué le gustó** y **qué no le gustó / qué debemos corregir**.

### 4.1. Calificación de la Versión `v1.0`
- **Puntaje otorgado por el usuario:** _Pendiente_
- **¿Qué le gustó al usuario?:**
  - _(Pendiente de feedback del usuario)_
- **¿Qué NO le gustó al usuario?:**
  - _(Pendiente de feedback del usuario)_

### 4.2. Plan y Registro de Correcciones (`v1.1`, `v1.2`...)
- _(Se registrarán aquí todas las modificaciones de código, tiempos, trazos o composición aplicadas tras la revisión del usuario)._
