# El motor invisible

Rama `version-2` · Idea A · Estilo 2, dibujo a mano · Revisión actual **R02**.

## Valoraciones

| Entrega | Puntaje | Qué gustó | Qué cambiar | Resultado |
| --- | --- | --- | --- | --- |
| R01 · 45 s | Sin puntaje numérico | “Los tuyos me agradan”, en referencia a los diseños del motor. | El acabado se alejaba del ejemplo. El ritmo resultaba aburrido. Pidió más cambios, efectos y movimiento entre escenas, y repartir la información a lo largo del video. | R02 conserva el motor original, cambia el acabado y remonta la explicación. |
| R02 · 30 s | Pendiente | Pendiente | Pendiente | Primera entrega con las correcciones de R01. |

## R02 · Del eje a la escobilla

La imagen de referencia orientó el tratamiento del papel, el peso de la línea, el color sepia y el rayado diagonal. La carcasa con aletas, las patas, la bobina, los polos curvos y el anillo partido proceden de los dibujos de R01.

| Tiempo | Acción en pantalla | Decisión de montaje |
| --- | --- | --- |
| 0–3,3 s | El motor ya gira bajo el título manuscrito. La cámara se acerca a la marca del eje. | Plantear una sola pregunta en el primer acercamiento. |
| 3,3–6 s | Una pasada de goma descubre el interior y deja el contorno de la carcasa a lápiz. | Conservar un único punto de vista durante la revelación para poder reconocer dónde estaba cada pieza. |
| 6–10,9 s | La cámara viaja a la pila, sigue el contacto de la escobilla y se acerca al devanado. | Atenuar las patas, la carcasa y el imán delantero cuando la corriente pasa al primer plano. |
| 10,9–19,7 s | El extremo circular del eje da paso al corte frontal. Aparecen el campo, la fuerza de la izquierda y la de la derecha. Después gira el conjunto. | Darle un momento propio a cada flecha. El paneo acompaña al lado de la bobina que se está explicando. |
| 19,7–25,6 s | Otro acercamiento al eje conduce al conmutador. La escobilla cambia de delga y se invierte la corriente en la bobina. | Usar un golpe de contacto y unas marcas cortas de lápiz en el instante del cambio. |
| 25,6–30 s | Un barrido oblicuo recupera la perspectiva exterior. Vuelven el cuerpo, la tapa y la caja de bornes. | Resolver con tres acentos de montaje y sostener la vista del motor ya cerrado, con el eje aún en movimiento. |

La rotulación usa una frase manuscrita por vez. Los párrafos, números de lámina y pies de figura de R01 cedieron su lugar al dibujo. El sonido conserva el zumbido del eje y añade roces, desplazamientos en estéreo y una pequeña secuencia de golpes afinados.

### Aciertos y fallos de la revisión interna

| Observación | Resolución |
| --- | --- |
| En el primer montaje de R02, las patas y sus rayas de sombra cruzaban el texto durante el seguimiento de la corriente. | Atenué el soporte al acercarme al devanado y despejé el papel bajo las letras con un borrado suave. |
| La primera textura tenía un grano tan marcado que competía con las tramas diagonales. | Reduje el contraste del grano fino y mantuve los trazos de sombreado dentro de cada cara. |
| El primer acercamiento pisaba el título antes de que terminara de salir. | Retrasé el arranque de la cámara y adelanté la salida de la rotulación. |
| La transición al corte frontal abría un círculo de papel vacío antes de dibujar el rotor. | Adelanté el dibujo del rotor hasta que su centro apareciera dentro del círculo desde que se abre. El eje se puede seguir durante el cambio de perspectiva. |
| En la primera mezcla, el pico de los golpes llegaba a −0,2 dB. | Bajé la ganancia antes de codificar la pista estéreo. |

### Comprobación de R02

El MP4 contiene 900 fotogramas H.264 a 1920 × 1080 y 30 fps. La imagen dura 30 s y la pista AAC es estéreo a 48 kHz. Se decodificó la exportación completa y se revisaron 15 instantes del MP4, incluidos la apertura, el cambio de contacto y el cierre. La mezcla codificada mide −16,9 LUFS integrados y −2,4 dB de pico verdadero.

Para comprobar el cambio de ritmo, se tomaron seis muestras por segundo de ambos MP4 a 320 × 180. Se contó qué proporción de píxeles cambió más de 12 niveles de gris entre muestras consecutivas. La mediana pasó de 0,78 % en R01 a 8,68 % en R02. La valoración del ritmo queda abierta a tus comentarios.

## Reproducir el render

Desde la raíz del repositorio, con Node.js, npm y Python 3 disponibles, ejecutar lo siguiente. La composición genera su pista de sonido antes de abrir el estudio o exportar.

```sh
npm run install:remotion
npm --prefix layers/remotion run typecheck
npm run render:remotion
```

La salida de esta revisión se guarda en `output/el-motor-invisible-a02-r02.mp4`. En este entorno, el siguiente comando utiliza Chromium instalado en el sistema y limita el render a dos fotogramas concurrentes.

```sh
npm --prefix layers/remotion run render -- --browser-executable=/usr/lib/chromium/chromium --concurrency=2 --image-format=jpeg --jpeg-quality=95 --crf=18
```

R01 conserva su MP4 en `output/el-motor-invisible-a02-r01.mp4`. Sus fuentes y su comando de render corresponden al commit `1d344a2` de esta rama.

## Archivo de R01

### Montaje de R01

| Tiempo | Lo que aparece en el dibujo | Decisión de dirección |
| --- | --- | --- |
| 0–5,6 s | Un motor montado. Una marca de cobre da vueltas en el extremo del eje. | Abrir en movimiento. La marca hace visible el giro de una pieza circular incluso con el sonido apagado. |
| 5,6–12,1 s | La carcasa pierde opacidad hasta quedar en línea discontinua. Aparecen los imanes, la bobina y el colector. | Mantener las patas y el eje en el mismo sitio para que el espectador conserve su orientación. |
| 12,1–19,6 s | Se dibujan la pila y sus dos cables. Los puntos recorren el devanado. | Seguir un circuito cerrado en el sentido convencional de la corriente. El cobre identifica el recorrido. |
| 19,6–27,9 s | En el corte frontal se trazan el campo de N a S y las dos fuerzas. Un punto señala corriente saliente y una cruz señala corriente entrante. | Introducir los símbolos antes que las flechas de fuerza. La pausa permite anticipar el sentido del giro. |
| 27,9–37,2 s | Las dos delgas, marcadas con *a* y *b*, intercambian escobillas al girar 180°. | Seguir la misma delga durante la media vuelta. En el instante de separación desaparecen las marcas de corriente. |
| 37,2–45 s | Regresa la perspectiva inicial. Se recompone el cuerpo, se asienta la tapa y desciende la caja de bornes. | Recuperar la marca del eje en el último plano para reconocer desde fuera el ciclo que acabamos de ver. |

### Decisiones de R01

- Elegí un motor de corriente continua con imanes permanentes y escobillas. Una bobina y dos delgas bastan para explicar la conmutación. El despiece y la velocidad están simplificados para poder seguir una vuelta.
- Usé papel marfil, tinta oscura para las piezas y las fuerzas, verde azulado para el campo y cobre para la corriente. Las anotaciones en Kalam se distinguen de los títulos en DM Serif Display. Ambas fuentes y sus licencias SIL Open Font License están incluidas en la composición.
- Dibujé las vistas a partir de coordenadas del motor. El aspecto manual procede de las pequeñas variaciones del trazo, las líneas de construcción y el rayado. Las anotaciones se trazan en pantalla a medida que entra cada explicación.
- Elegí texto en español y sonido de taller sin locución. El zumbido baja al entrar en los cortes, el roce acompaña el dibujo y tres golpes marcan la reconstrucción. El sonido se sintetiza con una semilla fija.
- Reuní geometría, rotulación, tiempo y sonido en la composición maestra de Remotion. Compartir el ángulo del rotor permite mantener unidas las espiras y sus llamadas mientras cambia el encuadre.

### Pruebas de R01

| Observación en la prueba | Corrección aplicada en R01 |
| --- | --- |
| La etiqueta del eje se superponía al acoplamiento y las patas llegaban a la línea del pie de figura. | Reduje la escala de la vista exterior, subí el conjunto y llevé la llamada del eje al espacio superior derecho. |
| La llamada de la bobina apuntaba a una posición fija aunque la espira giraba. | Calculé el anclaje con el mismo ángulo que la espira y lo fijé al conductor exterior. |
| Los puntos de corriente parecían saltar entre dos lados del devanado. | Dibujé los cuatro giros como un camino continuo y calculé el avance de los puntos según la longitud de sus tramos. |
| La flecha de giro se acercaba demasiado a la fuerza del lado izquierdo. | Trasladé el arco de giro al cuadrante superior derecho del corte frontal. |

**Aciertos observados en la revisión interna.** La marca del acoplamiento permite reconocer el mismo eje al abrir y cerrar. En el corte frontal se pueden leer simultáneamente el sentido del campo, la corriente de cada lado y las dos fuerzas. En el detalle del conmutador, la letra de cada delga permite seguirla cuando cambia de escobilla.

**Comprobación de R01.** El archivo exportado contiene 1.350 fotogramas H.264 a 1920 × 1080 y 30 fps, con audio AAC a 48 kHz. Se revisó un fotograma de cada uno de los seis planos y se decodificó el MP4 completo con FFmpeg.
