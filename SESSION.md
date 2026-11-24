# El motor invisible

Primera entrega de la rama `version-2` · Idea A · Estilo 2, pizarra dibujada a mano · Revisión R01.

**Objetivo de la pieza.** Al volver a ver el motor cerrado, el espectador debe poder explicar qué empuja el eje y qué cambia de contacto cada media vuelta.

## Montaje

| Tiempo | Lo que aparece en el dibujo | Decisión de dirección |
| --- | --- | --- |
| 0–5,6 s | Un motor montado. Una marca de cobre da vueltas en el extremo del eje. | Abrir en movimiento. La marca hace visible el giro de una pieza circular incluso con el sonido apagado. |
| 5,6–12,1 s | La carcasa pierde opacidad hasta quedar en línea discontinua. Aparecen los imanes, la bobina y el colector. | Mantener las patas y el eje en el mismo sitio para que el espectador conserve su orientación. |
| 12,1–19,6 s | Se dibujan la pila y sus dos cables. Los puntos recorren el devanado. | Seguir un circuito cerrado en el sentido convencional de la corriente. El cobre identifica el recorrido. |
| 19,6–27,9 s | En el corte frontal se trazan el campo de N a S y las dos fuerzas. Un punto señala corriente saliente y una cruz señala corriente entrante. | Introducir los símbolos antes que las flechas de fuerza. La pausa permite anticipar el sentido del giro. |
| 27,9–37,2 s | Las dos delgas, marcadas con *a* y *b*, intercambian escobillas al girar 180°. | Seguir la misma delga durante la media vuelta. En el instante de separación desaparecen las marcas de corriente. |
| 37,2–45 s | Regresa la perspectiva inicial. Se recompone el cuerpo, se asienta la tapa y desciende la caja de bornes. | Recuperar la marca del eje en el último plano para reconocer desde fuera el ciclo que acabamos de ver. |

## Decisiones de producción

- Elegí un motor de corriente continua con imanes permanentes y escobillas. Una bobina y dos delgas bastan para explicar la conmutación. El despiece y la velocidad están simplificados para poder seguir una vuelta.
- Usé papel marfil, tinta oscura para las piezas y las fuerzas, verde azulado para el campo y cobre para la corriente. Las anotaciones en Kalam se distinguen de los títulos en DM Serif Display. Ambas fuentes y sus licencias SIL Open Font License están incluidas en la composición.
- Dibujé las vistas a partir de coordenadas del motor. El aspecto manual procede de las pequeñas variaciones del trazo, las líneas de construcción y el rayado. Las anotaciones se trazan en pantalla a medida que entra cada explicación.
- Elegí texto en español y sonido de taller sin locución. El zumbido baja al entrar en los cortes, el roce acompaña el dibujo y tres golpes marcan la reconstrucción. El sonido se sintetiza con una semilla fija.
- Reuní geometría, rotulación, tiempo y sonido en la composición maestra de Remotion. Compartir el ángulo del rotor permite mantener unidas las espiras y sus llamadas mientras cambia el encuadre.

## Revisión de producción

| Observación en la prueba | Corrección aplicada en R01 |
| --- | --- |
| La etiqueta del eje se superponía al acoplamiento y las patas llegaban a la línea del pie de figura. | Reduje la escala de la vista exterior, subí el conjunto y llevé la llamada del eje al espacio superior derecho. |
| La llamada de la bobina apuntaba a una posición fija aunque la espira giraba. | Calculé el anclaje con el mismo ángulo que la espira y lo fijé al conductor exterior. |
| Los puntos de corriente parecían saltar entre dos lados del devanado. | Dibujé los cuatro giros como un camino continuo y calculé el avance de los puntos según la longitud de sus tramos. |
| La flecha de giro se acercaba demasiado a la fuerza del lado izquierdo. | Trasladé el arco de giro al cuadrante superior derecho del corte frontal. |

**Aciertos observados en la revisión interna.** La marca del acoplamiento permite reconocer el mismo eje al abrir y cerrar. En el corte frontal se pueden leer simultáneamente el sentido del campo, la corriente de cada lado y las dos fuerzas. En el detalle del conmutador, la letra de cada delga permite seguirla cuando cambia de escobilla.

## Valoración del usuario

| Entrega | Puntaje y escala | Qué gustó | Qué no gustó | Correcciones solicitadas y resultado |
| --- | --- | --- | --- | --- |
| A · 02 · R01 | Pendiente | Pendiente | Pendiente | A la espera de comentarios |

Cada puntaje y comentario se asociará a la revisión que viste. Las correcciones posteriores llevarán su propia entrada para conservar el historial.

## Reproducir el render

Desde la raíz del repositorio, con Node.js, npm y Python 3 disponibles, ejecutar lo siguiente. La composición genera su pista de sonido antes de abrir el estudio o exportar.

```sh
npm run install:remotion
npm --prefix layers/remotion run typecheck
npm run render:remotion
```

La salida de esta revisión se guarda en `output/el-motor-invisible-a02-r01.mp4`. En este entorno, el siguiente comando utiliza Chromium instalado en el sistema y limita el render a dos fotogramas concurrentes.

```sh
npm --prefix layers/remotion run render -- --browser-executable=/usr/lib/chromium/chromium --concurrency=2 --image-format=jpeg --jpeg-quality=95 --crf=18
```

**Comprobación de R01.** El archivo exportado contiene 1.350 fotogramas H.264 a 1920 × 1080 y 30 fps, con audio AAC a 48 kHz. Se revisó un fotograma de cada uno de los seis planos y se decodificó el MP4 completo con FFmpeg.
