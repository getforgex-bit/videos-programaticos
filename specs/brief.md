# Brief del Video — Serie de Experimentación Visual (`version-1`)

> Este documento define las especificaciones técnicas, estructura narrativa y matriz de producción para los videos desarrollados en la rama `version-1`.

## 1. Marco General de la Sesión
- **Rama activa:** `version-1` (estrictamente aislada según `AGENTS.md`)
- **Dinámica de trabajo:** Desarrollo iterativo de **3 ideas de video** a través de **9 estilos visuales**, construyendo y evaluando **1 idea con 1 estilo visual a la vez**.
- **Documentación y Evaluación:** Cada video registra su toma de decisiones bajo criterio propio, aciertos técnicos/artísticos, fallos detectados en autocrítica, puntaje otorgado por el usuario y bitácora de correcciones.

---

## 2. Video Activo (#1): Idea A + Estilo 2 (`v2.0` — Boceto Grafito/Sepia Dopaminérgico)

### Concepto General
- **Idea:** **Idea A — El motor invisible**
  - *Sinopsis:* Comenzamos con un motor funcionando. Su carcasa se vuelve transparente, aparecen sus componentes internos y descubrimos cómo una corriente eléctrica provoca la rotación. Al final, reconstruimos el motor.
  - *Enfoque:* Cinematográfico, revelación progresiva, precisión mecánica y alto impacto dopaminérgico.
- **Estilo Visual:** **2. Whiteboard / Dibujo a mano (Boceto de Carboncillo y Grafito Sepia sobre Pergamino)**
  - *Lenguaje gráfico (inspirado en `image.png`):* Papel pergamino envejecido (`#EFE1C6` → `#C8AE86`), trazos gruesos de carboncillo/grafito sepia (`#362312`) con sombreado diagonal denso a mano (`///`), imanes gigantes en herradura a izquierda (`N`) y derecha (`S`), cámara central cuadrada redondeada de doble pared con 4 terminales de escobillas, flechas `F` de doble contorno y **1 sola idea cinética en pantalla a la vez**.

### Especificaciones Técnicas
- **Resolución:** `1920x1080` (16:9 Full HD)
- **FPS:** `30`
- **Duración:** `30 segundos` (`900 frames`)
- **Audio:** Pista dopaminérgica sincronizada (`layers/remotion/public/audio/whiteboard_motor_sfx.wav`) con *whooshes* de cámara en cada cambio de escena, impactos *sub-bass*, trazos rápidos de carboncillo, chispazos eléctricos cada $180^\circ$ y pulso rítmico de motor.

---

## 3. Escaleta Dopaminérgica de 6 Escenas (900 Frames @ 30 FPS)

| Escena | Tiempo | Frames | Movimiento de Cámara y Acción Visual | Título Cinético Único |
| :--- | :--- | :--- | :--- | :--- |
| **Escena 1: Motor en Marcha** | `0:00 - 0:04` | `0 - 120` | Punch-in rápido (`1.38x -> 1.02x`) + sacudida de arranque en frame 38. Se traza la carcasa blindada con aletas y los ejes laterales escalonados girando a `3,000 RPM` con líneas de velocidad radiales. | `01 · EL MOTOR EN MARCHA — ACERO SELLADO · 3,000 RPM` |
| **Escena 2: Revelación Rayos-X** | `0:04 - 0:08` | `120 - 240` | Onda de choque circular disuelve la carcasa a líneas fantasma (`14%`). Whip-pan a izquierda al clavarse el imán en herradura `N`, whip-pan a derecha al clavarse el imán `S` y aparición del núcleo central cuadrado redondeado con 4 terminales. | `02 · REVELACIÓN RAYOS-X — IMANES (N / S) + NÚCLEO INTERNO` |
| **Escena 3: Macro Zoom Corriente** | `0:08 - 0:12.5` | `240 - 375` | Macro zoom (`1.50x`) + paneo diagonal sobre los postes de escobillas. Entran las flechas curvas de corriente (`+I / -I`, **Capa 2**), se encienden los conductores internos y cruzan las ondas de campo magnético $\vec{B}$ ($N \to S$). | `03 · ENERGÍA INVISIBLE — LA CORRIENTE (I) CRUZA EL CAMPO (N → S)` |
| **Escena 4: Explosión de Fuerza `F`** | `0:12.5 - 0:18` | `375 - 540` | Snap-zoom con sacudida de impacto (`26px`) y órbita dinámica. Estallan las dos flechas gigantes **`F`** de doble contorno con ondas expansivas doradas y los arcos punteados en `N` (`↑`) y `S` (`↓`) acelerando el rotor. | `04 · LEY DE LORENTZ: F = I × B — ¡EXPLOSIÓN DE FUERZA (F) Y PAR DE GIRO!` |
| **Escena 5: Conmutación 180°** | `0:18 - 0:24` | `540 - 720` | Zoom rítmico sincronizado con las explosiones de chispas en los 4 contactos cada $180^\circ$. Las flechas internas invierten sentido y **Capa 1 (Manim)** traza una cinta limpia de pulso de torque (`/\ /\ /\`) al pie del pergamino. | `05 · EL SECRETO DEL COLECTOR — INVERSIÓN CADA 180° → ¡EMPUJE CONTINUO!` |
| **Escena 6: Reconstrucción** | `0:24 - 0:30` | `720 - 900` | Pullback dramático (`1.26x -> 1.00x`) con 3 golpes mecánicos secos mientras las placas blindadas exteriores se re-ensamblan sobre el núcleo activo a `3,000 RPM`. | `06 · MOTOR RECONSTRUIDO — ELECTRICIDAD CONVERTIDA EN ROTACIÓN` |
