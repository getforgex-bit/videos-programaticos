import React from 'react';
import {
  MotorFrameState,
  clamp,
  sketchEllipseArc,
  sketchLine,
  sketchRoundedRect,
  smoothstep,
} from './handDrawnUtils';

interface Props {
  state: MotorFrameState;
}

/**
 * Boceto Mecánico de Grafito/Sepia v3.0 — 100% Coherencia Mecánica y Física
 *
 * Mejoras clave de v3.0:
 * 1. COHERENCIA MECÁNICA 100% (Eje Horizontal Único y = 540):
 *    - El tambor cilíndrico del rotor, el colector de delgas y las bobinas de cobre están montados
 *      horizontalmente sobre el mismo eje (y = 540) que sale por los rodamientos izquierdo y derecho.
 *    - Al girar alrededor del eje horizontal, las barras horizontales de la bobina suben por la cara frontal
 *      del cilindro (z > 0, trazo grueso brillante) y bajan por la cara posterior (z < 0, trazo oculto punteado),
 *      manteniendo su longitud horizontal constante y proyectando su altura con sin(θ).
 * 2. ANIMACIÓN FÍSICA DEL CAMPO ELECTROMAGNÉTICO (Catapulta Magnética + Vórtices B_I):
 *    - Líneas de flujo dipolar curvas desde el imán N hasta el imán S con partículas de flujo.
 *    - Cuando fluye corriente I por las barras del rotor, nacen vórtices magnéticos concéntricos (B_I)
 *      alrededor del cable que DEFORMAN y comprimen las líneas del campo B como ligas elásticas tensadas,
 *      catapultando la barra frontal hacia arriba (↑F) y la trasera hacia abajo (↓-F).
 * 3. CREATIVIDAD MECÁNICA (Apertura y Cierre tipo Clamshell con Pernos Giratorios):
 *    - La carcasa exterior se divide en mitad superior e inferior que se desatornillan y se abren
 *      verticalmente al revelarse el interior, y se vuelven a ensamblar y atornillar en la reconstrucción.
 */
export const IsometricMotorWhiteboard: React.FC<Props> = ({state}) => {
  const {
    frame,
    thetaDeg,
    thetaRad,
    rpm,
    casingOpacity,
    internalsVisibility,
    bFieldProgress,
    currentActive,
    lorentzProgress,
    commutationFlash,
  } = state;

  const inkDark = '#362312';
  const inkMid = '#5C3F24';
  const inkLight = '#8C6C49';
  const inkCrimson = '#991B1B';
  const inkGold = '#B45309';
  const inkGlow = '#D97706';
  const inkBlue = '#1E3A8A';
  const inkEmerald = '#065F46';

  const drawExteriorP = smoothstep(2, 34, frame);
  const drawLeftMagnetP = smoothstep(132, 162, frame);
  const drawRightMagnetP = smoothstep(152, 182, frame);
  const drawCoreChamberP = smoothstep(172, 208, frame);
  const drawTerminalsP = smoothstep(192, 228, frame);

  // Apertura tipo Clamshell de la carcasa exterior en Escena 2 (frames 120..175) y cierre en Escena 6 (frames 725..785)
  const clamshellOpen =
    frame < 720
      ? smoothstep(122, 172, frame)
      : 1 - smoothstep(725, 782, frame);

  const xrayShockP = smoothstep(120, 152, frame);
  const lorentzShockP = smoothstep(375, 408, frame);

  const fPulse =
    lorentzProgress * (1 + 0.13 * Math.sin(frame * 0.45) + 0.16 * commutationFlash);

  // Desplazamiento vertical de las líneas de rotación en los ejes y el tambor horizontal (giro alrededor del eje X horizontal)
  const shaftScroll = (frame * (rpm / 3000) * 10) % 28;

  // Geometría 3D del Tambor Cilíndrico Horizontal del Rotor (montado sobre y = 540)
  const drumX1 = 875;
  const drumX2 = 1155;
  const drumR = 132;
  const commX1 = 795;
  const commX2 = 862;
  const commR = 64;

  // Calculamos las posiciones 3D de 2 espiras ortogonales (4 barras conductoras horizontales a θ, θ+90°, θ+180°, θ+270°)
  // Al girar alrededor del eje horizontal y = 540:
  // y = 540 - R * sin(angle)  (sube cuando sin > 0)
  // z = R * cos(angle)        (z > 0 está en la cara FRONTAL hacia el espectador; z < 0 está en la cara TRASERA)
  const coilBars = [0, 90, 180, 270].map((offsetDeg, idx) => {
    const ang = thetaRad + (offsetDeg * Math.PI) / 180;
    const y = 540 - drumR * Math.sin(ang);
    const z = drumR * Math.cos(ang); // > 0 frente, < 0 atrás
    const isPrimary = idx === 0 || idx === 2;
    // Gracias al colector de delgas, toda barra que pasa por la cara FRONTAL (z >= 0) lleva corriente de izquierda a derecha (→)
    // y recibe Fuerza de Lorentz hacia ARRIBA (↑F), mientras toda barra en la cara TRASERA (z < 0) lleva corriente (←) y baja (↓-F).
    const isFront = z >= 0;
    return {
      idx,
      ang,
      y,
      z,
      isPrimary,
      isFront,
    };
  });

  const backBars = coilBars.filter((b) => !b.isFront);
  const frontBars = coilBars.filter((b) => b.isFront);

  // Barra primaria actualmente en la cara frontal (para mostrar su vórtice magnético B_I y la catapulta de campo B)
  const activeFrontBar =
    coilBars[0].z >= coilBars[2].z ? coilBars[0] : coilBars[2];
  const activeBackBar =
    coilBars[0].z >= coilBars[2].z ? coilBars[2] : coilBars[0];

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
    >
      <defs>
        <pattern
          id="sepiaDenseHatch"
          width="9"
          height="9"
          patternTransform="rotate(38 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="9"
            stroke="#3B2614"
            strokeWidth="2.4"
            strokeOpacity="0.44"
          />
          <line
            x1="4.5"
            y1="0"
            x2="4.5"
            y2="9"
            stroke="#5C3F24"
            strokeWidth="1.4"
            strokeOpacity="0.28"
          />
        </pattern>

        <pattern
          id="sepiaLightHatch"
          width="11"
          height="11"
          patternTransform="rotate(38 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="11"
            stroke="#5C3F24"
            strokeWidth="1.8"
            strokeOpacity="0.24"
          />
        </pattern>

        <pattern
          id="sepiaArmorHatch"
          width="12"
          height="12"
          patternTransform="rotate(32 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="12"
            stroke="#2E1C0E"
            strokeWidth="2.6"
            strokeOpacity="0.48"
          />
          <line
            x1="0"
            y1="6"
            x2="12"
            y2="6"
            stroke="#5C3F24"
            strokeWidth="1.2"
            strokeOpacity="0.22"
          />
        </pattern>
      </defs>

      {/* =====================================================================
          0. EJES DE CONSTRUCCIÓN Y LÍNEAS DE VELOCIDAD RADIALES
         ===================================================================== */}
      <g opacity={0.42}>
        <path
          d={sketchLine(80, 540, 1840, 540, 1, 1.1, 0)}
          stroke={inkLight}
          strokeWidth={2}
          strokeDasharray="16 10 5 10"
          fill="none"
        />
        <path
          d={sketchLine(960, 60, 960, 1020, 2, 1.1, 0)}
          stroke={inkLight}
          strokeWidth={1.8}
          strokeDasharray="14 12"
          fill="none"
        />
      </g>

      {rpm > 1400 && (
        <g opacity={clamp((rpm - 1400) / 1800, 0, 0.38)}>
          {Array.from({length: 14}).map((_, i) => {
            const ang = (i * 25.7 * Math.PI) / 180 + (frame % 7) * 0.02;
            const r0 = 740 + ((i * 37 + frame * 19) % 100);
            const r1 = 960;
            return (
              <line
                key={i}
                x1={960 + Math.cos(ang) * r0}
                y1={540 + Math.sin(ang) * r0 * 0.65}
                x2={960 + Math.cos(ang) * r1}
                y2={540 + Math.sin(ang) * r1 * 0.65}
                stroke={i % 2 === 0 ? inkDark : inkGold}
                strokeWidth={i % 3 === 0 ? 3.2 : 2}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      )}

      {/* =====================================================================
          1. ANATOMÍA INTERNA: IMANES EN HERRADURA (N / S) + TAMBOR HORIZONTAL 3D
         ===================================================================== */}
      {internalsVisibility > 0.01 && (
        <g opacity={internalsVisibility}>
          {/* -----------------------------------------------------------------
              1A. IMÁN EN HERRADURA IZQUIERDO (POLO NORTE "N") + BARRA VERTICAL
             ----------------------------------------------------------------- */}
          <g
            opacity={drawLeftMagnetP}
            transform={`translate(${(1 - drawLeftMagnetP) * -140}, 0)`}
          >
            <path
              d="M 584 115 L 410 115 C 235 115, 165 250, 165 540 L 295 540 C 295 315, 345 235, 435 235 L 584 235 Z"
              fill="url(#sepiaDenseHatch)"
              stroke={inkDark}
              strokeWidth={6.5}
              strokeLinejoin="round"
            />
            <path
              d="M 165 540 C 165 830, 235 965, 410 965 L 584 965 L 584 845 L 435 845 C 345 845, 295 765, 295 540 Z"
              fill="url(#sepiaLightHatch)"
              stroke={inkDark}
              strokeWidth={6.5}
              strokeLinejoin="round"
            />
            <rect
              x={195}
              y={502}
              width={72}
              height={76}
              rx={10}
              fill="#EADBC2"
              fillOpacity={0.88}
            />
            <path
              d="M 212 564 L 212 514 L 250 564 L 250 514"
              fill="none"
              stroke={inkDark}
              strokeWidth={7.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={sketchRoundedRect(584, 92, 42, 896, 6, 11, 1.3)}
              fill="url(#sepiaLightHatch)"
              stroke={inkDark}
              strokeWidth={6}
            />
            <path
              d="M 390 450 C 375 360, 400 280, 430 245"
              fill="none"
              stroke={inkDark}
              strokeWidth={6}
              strokeDasharray="18 16"
              strokeLinecap="round"
              strokeDashoffset={-frame * 1.8}
            />
            <path
              d="M 388 765 C 365 710, 355 655, 362 600"
              fill="none"
              stroke={inkDark}
              strokeWidth={6.5}
              strokeLinecap="round"
            />
            <path
              d="M 336 635 L 362 595 L 392 632"
              fill="none"
              stroke={inkDark}
              strokeWidth={6.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* -----------------------------------------------------------------
              1B. IMÁN EN HERRADURA DERECHO (POLO SUR "S") + BARRA VERTICAL
             ----------------------------------------------------------------- */}
          <g
            opacity={drawRightMagnetP}
            transform={`translate(${(1 - drawRightMagnetP) * 140}, 0)`}
          >
            <path
              d="M 1336 115 L 1510 115 C 1685 115, 1755 250, 1755 540 L 1625 540 C 1625 315, 1575 235, 1485 235 L 1336 235 Z"
              fill="url(#sepiaLightHatch)"
              stroke={inkDark}
              strokeWidth={6.5}
              strokeLinejoin="round"
            />
            <path
              d="M 1755 540 C 1755 830, 1685 965, 1510 965 L 1336 965 L 1336 845 L 1485 845 C 1575 845, 1625 765, 1625 540 Z"
              fill="url(#sepiaDenseHatch)"
              stroke={inkDark}
              strokeWidth={6.5}
              strokeLinejoin="round"
            />
            <rect
              x={1654}
              y={502}
              width={72}
              height={76}
              rx={10}
              fill="#EADBC2"
              fillOpacity={0.88}
            />
            <path
              d="M 1708 520 C 1695 508, 1670 512, 1670 526 C 1670 542, 1712 538, 1712 556 C 1712 570, 1682 572, 1668 560"
              fill="none"
              stroke={inkDark}
              strokeWidth={7.5}
              strokeLinecap="round"
            />
            <path
              d={sketchRoundedRect(1294, 92, 42, 896, 6, 12, 1.3)}
              fill="url(#sepiaLightHatch)"
              stroke={inkDark}
              strokeWidth={6}
            />
            <path
              d="M 1525 310 C 1552 365, 1562 420, 1556 475"
              fill="none"
              stroke={inkDark}
              strokeWidth={6.5}
              strokeLinecap="round"
            />
            <path
              d="M 1528 442 L 1556 482 L 1584 444"
              fill="none"
              stroke={inkDark}
              strokeWidth={6.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 1552 630 C 1545 725, 1515 795, 1485 835"
              fill="none"
              stroke={inkDark}
              strokeWidth={6}
              strokeDasharray="18 16"
              strokeLinecap="round"
              strokeDashoffset={-frame * 1.8}
            />
          </g>

          {/* -----------------------------------------------------------------
              1C. CÁMARA CENTRAL DE DOBLE PARED + CAMPO MAGNÉTICO DEFORMABLE (CATAPULTA)
             ----------------------------------------------------------------- */}
          <g
            opacity={drawCoreChamberP}
            transform={`scale(${0.88 + 0.12 * drawCoreChamberP})`}
            style={{transformOrigin: '960px 540px'}}
          >
            {/* Pared exterior gruesa del núcleo (x: 680..1240, y: 260..820) */}
            <path
              d={sketchRoundedRect(680, 260, 560, 560, 62, 21, 1.8)}
              fill="url(#sepiaDenseHatch)"
              stroke={inkDark}
              strokeWidth={7}
            />
            {/* Ventana interior clara del rotor (x: 724..1196, y: 304..776) */}
            <path
              d={sketchRoundedRect(724, 304, 472, 472, 38, 22, 1.5)}
              fill="#EADAC0"
              stroke={inkDark}
              strokeWidth={6.5}
            />

            {/* ===============================================================
                1D. ANIMACIÓN FÍSICA DEL CAMPO ELECTROMAGNÉTICO (B + B_I)
                Líneas de flujo dipolar curvas N -> S que se DEFORMAN como ligas
                elásticas ("efecto catapulta") alrededor de las barras con corriente
               =============================================================== */}
            {bFieldProgress > 0.01 && (
              <g opacity={bFieldProgress}>
                {[-175, -130, -85, -40, 0, 40, 85, 130, 175].map((dy, idx) => {
                  const yBase = 540 + dy;
                  // Deformación elástica ("Catapulta Magnética"): cuando fluye corriente I,
                  // el vórtice magnético B_I comprime y curva las líneas de campo B debajo de la barra frontal
                  // para empujarla hacia ARRIBA (↑F) y encima de la barra trasera para empujarla hacia ABAJO (↓-F).
                  const distFront = yBase - activeFrontBar.y;
                  const bendFront =
                    currentActive *
                    48 *
                    Math.exp(-(distFront * distFront) / 2800) *
                    (activeFrontBar.z / drumR);

                  const cyCtrl1 = yBase + dy * 0.22 + bendFront;
                  const cyCtrl2 = yBase - dy * 0.18 + bendFront * 0.7;

                  const pathD = `M 626 ${yBase + dy * 0.35} C 770 ${cyCtrl1.toFixed(1)}, 1140 ${cyCtrl2.toFixed(1)}, 1294 ${yBase + dy * 0.35}`;

                  // Posición animada de partículas/flechas de flujo magnético viajando de N a S
                  const uFlow = ((frame * 0.025 + idx * 0.17) % 1 + 1) % 1;
                  const fx = 640 + uFlow * 630;
                  const fy =
                    yBase +
                    Math.sin(uFlow * Math.PI) * (bendFront * 0.85) +
                    (1 - Math.sin(uFlow * Math.PI)) * dy * 0.25;

                  return (
                    <g key={idx}>
                      {/* Línea de flujo magnético curva deformable */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={inkBlue}
                        strokeWidth={idx % 2 === 0 ? 3.0 : 2.2}
                        strokeOpacity={0.62}
                        strokeDasharray="16 10"
                        strokeDashoffset={-frame * 3.8}
                      />
                      {/* Punta de flecha de flujo magnético (N -> S) */}
                      <path
                        d={`M ${fx - 9} ${fy - 6} L ${fx + 5} ${fy} L ${fx - 9} ${fy + 6}`}
                        fill="none"
                        stroke={inkBlue}
                        strokeWidth={2.8}
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* ===============================================================
                1E. BARRAS TRASERAS DE LA BOBINA (z < 0, DETRÁS DEL TAMBOR HORIZONTAL)
               =============================================================== */}
            {backBars.map((bar) => (
              <g key={bar.idx} opacity={0.52}>
                <line
                  x1={drumX1}
                  y1={bar.y}
                  x2={drumX2}
                  y2={bar.y}
                  stroke={bar.isPrimary ? inkGold : inkMid}
                  strokeWidth={bar.isPrimary ? 6 : 4}
                  strokeDasharray="10 8"
                />
                {/* Corriente regresando de derecha a izquierda (←) por detrás del tambor */}
                {currentActive > 0.1 && bar.isPrimary && (
                  <line
                    x1={drumX1}
                    y1={bar.y}
                    x2={drumX2}
                    y2={bar.y}
                    stroke={inkBlue}
                    strokeWidth={5}
                    strokeDasharray="16 18"
                    strokeDashoffset={frame * 6}
                  />
                )}
              </g>
            ))}

            {/* ===============================================================
                1F. TAMBOR CILÍNDRICO HORIZONTAL DEL ROTOR + EJE CENTRAL CONTINUO (y = 540)
                (100% coherente con los ejes horizontales izquierdo y derecho)
               =============================================================== */}
            <g>
              {/* Eje central de acero continuo a lo largo de y = 540 */}
              <path
                d={sketchRoundedRect(724, 524, 472, 32, 3, 50, 0.8)}
                fill="url(#sepiaDenseHatch)"
                stroke={inkDark}
                strokeWidth={4.5}
              />

              {/* Cuerpo cilíndrico horizontal del rotor (x: 875..1155, y: 408..672) */}
              <path
                d={sketchRoundedRect(
                  drumX1,
                  540 - drumR,
                  drumX2 - drumX1,
                  drumR * 2,
                  18,
                  51,
                  1.3,
                )}
                fill="rgba(233, 217, 190, 0.78)"
                stroke={inkDark}
                strokeWidth={5.5}
              />
              <path
                d={sketchRoundedRect(
                  drumX1,
                  540 - drumR,
                  drumX2 - drumX1,
                  drumR * 2,
                  18,
                  52,
                  1.0,
                )}
                fill="url(#sepiaLightHatch)"
              />

              {/* Ranuras horizontales de laminación del tambor que suben/bajan al girar el cilindro horizontal */}
              {[-95, -55, -15, 25, 65, 105].map((baseY, idx) => {
                const slotAng =
                  thetaRad + ((idx * 30) * Math.PI) / 180;
                const sy = 540 - (drumR - 10) * Math.sin(slotAng);
                const sz = Math.cos(slotAng);
                if (sz < -0.1) return null; // Solo ranuras visibles en la cara frontal del cilindro
                return (
                  <line
                    key={idx}
                    x1={drumX1 + 14}
                    y1={sy}
                    x2={drumX2 - 14}
                    y2={sy}
                    stroke={inkMid}
                    strokeWidth={2.2}
                    strokeOpacity={0.35 + 0.35 * sz}
                  />
                );
              })}

              {/* Tapas elípticas 3D izquierda y derecha del tambor cilíndrico horizontal */}
              <ellipse
                cx={drumX1}
                cy={540}
                rx={22}
                ry={drumR}
                fill="rgba(220, 200, 168, 0.85)"
                stroke={inkDark}
                strokeWidth={5}
              />
              <ellipse
                cx={drumX2}
                cy={540}
                rx={22}
                ry={drumR}
                fill="rgba(220, 200, 168, 0.65)"
                stroke={inkDark}
                strokeWidth={5}
              />

              {/* Radios 3D girando dentro de las tapas elípticas del cilindro horizontal */}
              {[0, 90, 180, 270].map((deg) => {
                const rad = thetaRad + (deg * Math.PI) / 180;
                const ex = 20 * Math.cos(rad);
                const ey = (drumR - 4) * Math.sin(rad);
                return (
                  <React.Fragment key={deg}>
                    <line
                      x1={drumX1}
                      y1={540}
                      x2={drumX1 + ex}
                      y2={540 - ey}
                      stroke={inkDark}
                      strokeWidth={3.5}
                    />
                    <line
                      x1={drumX2}
                      y1={540}
                      x2={drumX2 + ex}
                      y2={540 - ey}
                      stroke={inkDark}
                      strokeWidth={3.5}
                    />
                  </React.Fragment>
                );
              })}

              {/* =============================================================
                  1G. COLECTOR DE DELGAS CILÍNDRICO HORIZONTAL (x: 795..862, y: 540 ± 64)
                  Montado sobre el mismo eje horizontal y tocado por las escobillas arriba y abajo
                 ============================================================= */}
              <path
                d={sketchRoundedRect(
                  commX1,
                  540 - commR,
                  commX2 - commX1,
                  commR * 2,
                  10,
                  55,
                  1.1,
                )}
                fill="#D97706"
                fillOpacity={0.32}
                stroke={inkDark}
                strokeWidth={5}
              />
              {/* Líneas divisorias de las delgas de cobre girando verticalmente sobre el colector horizontal */}
              {[0, 60, 120, 180, 240, 300].map((deg) => {
                const rad = thetaRad + (deg * Math.PI) / 180;
                if (Math.cos(rad) < 0) return null;
                const cySeg = 540 - commR * Math.sin(rad);
                return (
                  <line
                    key={deg}
                    x1={commX1 + 4}
                    y1={cySeg}
                    x2={commX2 - 4}
                    y2={cySeg}
                    stroke={inkDark}
                    strokeWidth={3.5}
                  />
                );
              })}
            </g>

            {/* ===============================================================
                1H. BARRAS FRONTALES DE LA BOBINA (z >= 0, DELANTE DEL TAMBOR HORIZONTAL)
                + VÓRTICES MAGNÉTICOS B_I + FLECHAS DE FUERZA DE LORENTZ (↑F)
               =============================================================== */}
            {frontBars.map((bar) => (
              <g key={bar.idx}>
                {/* Conexiones laterales de la espira hacia el colector */}
                <line
                  x1={commX2}
                  y1={540 - commR * Math.sin(bar.ang)}
                  x2={drumX1}
                  y2={bar.y}
                  stroke={bar.isPrimary ? inkGold : inkMid}
                  strokeWidth={bar.isPrimary ? 6.5 : 4.5}
                />
                {/* Barra conductora horizontal activa en la cara frontal del cilindro */}
                <line
                  x1={drumX1}
                  y1={bar.y}
                  x2={drumX2}
                  y2={bar.y}
                  stroke={bar.isPrimary ? inkDark : inkMid}
                  strokeWidth={bar.isPrimary ? 11 : 6.5}
                  strokeLinecap="round"
                />
                <line
                  x1={drumX1}
                  y1={bar.y}
                  x2={drumX2}
                  y2={bar.y}
                  stroke={bar.isPrimary ? '#F59E0B' : '#B45309'}
                  strokeWidth={bar.isPrimary ? 6 : 3.5}
                  strokeLinecap="round"
                />

                {/* Pulsos de corriente fluyendo horizontalmente (───►) por la barra frontal */}
                {currentActive > 0.1 && bar.isPrimary && (
                  <>
                    <line
                      x1={drumX1}
                      y1={bar.y}
                      x2={drumX2}
                      y2={bar.y}
                      stroke={inkCrimson}
                      strokeWidth={6.5}
                      strokeDasharray="20 20"
                      strokeDashoffset={-frame * 7}
                      strokeLinecap="round"
                    />
                    {/* Flecha clara de dirección de corriente I (───►) sobre la barra frontal */}
                    <path
                      d={`M 995 ${bar.y - 12} L 1020 ${bar.y} L 995 ${bar.y + 12}`}
                      fill="none"
                      stroke={inkCrimson}
                      strokeWidth={5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}
              </g>
            ))}

            {/* VÓRTICES MAGNÉTICOS CONCÉNTRICOS (B_I) Y VECTOR DE EMPUJE VERTICAL (↑F) SOBRE EL TAMBOR */}
            {currentActive > 0.15 && (
              <g opacity={currentActive}>
                {/* Vórtice magnético concéntrico B_I alrededor de la barra frontal activa */}
                {[24, 44].map((vr, i) => (
                  <ellipse
                    key={i}
                    cx={1015}
                    cy={activeFrontBar.y}
                    rx={vr * 1.45}
                    ry={vr}
                    fill="none"
                    stroke={inkCrimson}
                    strokeWidth={2.6}
                    strokeDasharray="10 8"
                    strokeDashoffset={-frame * 4.5}
                    opacity={0.75 - i * 0.2}
                  />
                ))}
                {/* Vórtice magnético alrededor de la barra trasera */}
                <ellipse
                  cx={1015}
                  cy={activeBackBar.y}
                  rx={32}
                  ry={22}
                  fill="none"
                  stroke={inkBlue}
                  strokeWidth={2.2}
                  strokeDasharray="8 8"
                  strokeDashoffset={frame * 4.5}
                  opacity={0.5}
                />
              </g>
            )}

            {/* Vector verde esmeralda de Fuerza de Lorentz ↑F levantando la cara frontal del cilindro horizontal */}
            {lorentzProgress > 0.05 && (
              <g opacity={lorentzProgress}>
                <line
                  x1={1015}
                  y1={activeFrontBar.y}
                  x2={1015}
                  y2={activeFrontBar.y - 78}
                  stroke={inkEmerald}
                  strokeWidth={8}
                  strokeLinecap="round"
                />
                <path
                  d={`M 995 ${activeFrontBar.y - 54} L 1015 ${activeFrontBar.y - 82} L 1035 ${activeFrontBar.y - 54}`}
                  fill="none"
                  stroke={inkEmerald}
                  strokeWidth={7.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}

            {/* POSTES TERMINALES Y ESCOBILLAS QUE TOCAN EL COLECTOR Y EL TAMBOR (IGUAL A image.png) */}
            <g opacity={drawTerminalsP}>
              {[828, 1085].map((tx, idx) => (
                <React.Fragment key={idx}>
                  {/* Poste superior externo */}
                  <path
                    d={sketchRoundedRect(tx - 34, 155, 68, 106, 4, 31 + idx, 1.2)}
                    fill="url(#sepiaLightHatch)"
                    stroke={inkDark}
                    strokeWidth={5.5}
                  />
                  {/* Porta-escobilla superior */}
                  <path
                    d={sketchRoundedRect(tx - 28, 255, 56, 82, 4, 33 + idx, 1.1)}
                    fill="#E6D4B5"
                    stroke={inkDark}
                    strokeWidth={5.5}
                  />
                  <circle
                    cx={tx}
                    cy={298}
                    r={13}
                    fill={commutationFlash > 0.3 ? inkGlow : inkDark}
                  />
                  {/* Escobilla de carbón que baja hasta hacer contacto físico con el colector horizontal */}
                  <line
                    x1={tx - 12}
                    y1={337}
                    x2={tx - 12}
                    y2={idx === 0 ? 540 - commR : 540 - drumR}
                    stroke={inkDark}
                    strokeWidth={5}
                  />
                  <line
                    x1={tx + 12}
                    y1={337}
                    x2={tx + 12}
                    y2={idx === 0 ? 540 - commR : 540 - drumR}
                    stroke={inkDark}
                    strokeWidth={5}
                  />

                  {/* Poste inferior externo */}
                  <path
                    d={sketchRoundedRect(tx - 34, 819, 68, 106, 4, 35 + idx, 1.2)}
                    fill="url(#sepiaLightHatch)"
                    stroke={inkDark}
                    strokeWidth={5.5}
                  />
                  {/* Porta-escobilla inferior */}
                  <path
                    d={sketchRoundedRect(tx - 28, 743, 56, 82, 4, 37 + idx, 1.1)}
                    fill="#E6D4B5"
                    stroke={inkDark}
                    strokeWidth={5.5}
                  />
                  <circle
                    cx={tx}
                    cy={782}
                    r={13}
                    fill={commutationFlash > 0.3 ? inkGlow : inkDark}
                  />
                  {/* Escobilla inferior que sube hasta tocar la base del colector horizontal */}
                  <line
                    x1={tx - 12}
                    y1={743}
                    x2={tx - 12}
                    y2={idx === 0 ? 540 + commR : 540 + drumR}
                    stroke={inkDark}
                    strokeWidth={5}
                  />
                  <line
                    x1={tx + 12}
                    y1={743}
                    x2={tx + 12}
                    y2={idx === 0 ? 540 + commR : 540 + drumR}
                    stroke={inkDark}
                    strokeWidth={5}
                  />
                </React.Fragment>
              ))}

              {/* Flecha curva superior-izquierda entrando al terminal del colector */}
              <path
                d="M 632 145 C 705 152, 748 195, 775 245"
                fill="none"
                stroke={currentActive > 0.2 ? inkCrimson : inkDark}
                strokeWidth={6.5}
                strokeLinecap="round"
              />
              <path
                d="M 744 226 L 778 250 L 784 208"
                fill="none"
                stroke={currentActive > 0.2 ? inkCrimson : inkDark}
                strokeWidth={6.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Flecha curva inferior-derecha saliendo del terminal inferior */}
              <path
                d="M 1288 935 C 1215 928, 1172 885, 1145 835"
                fill="none"
                stroke={currentActive > 0.2 ? inkCrimson : inkDark}
                strokeWidth={6.5}
                strokeLinecap="round"
              />
              <path
                d="M 1136 872 L 1142 830 L 1176 854"
                fill="none"
                stroke={currentActive > 0.2 ? inkCrimson : inkDark}
                strokeWidth={6.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>

          {/* -----------------------------------------------------------------
              1I. FLECHAS GIGANTES DE FUERZA DE LORENTZ "F" (DOBLE CONTORNO, SIN SOLAPAR TÍTULOS)
             ----------------------------------------------------------------- */}
          {lorentzProgress > 0.01 && (
            <g opacity={lorentzProgress}>
              {/* Flecha F Superior-Derecha (compactada a y=96 para nunca chocar con carteles superiores) */}
              <g
                transform={`translate(1085, 155) scale(${fPulse.toFixed(3)}) translate(-1085, -155)`}
              >
                <path
                  d="M 1085 152 L 1085 92 L 1225 92"
                  fill="none"
                  stroke={inkDark}
                  strokeWidth={13}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 1085 152 L 1085 92 L 1225 92"
                  fill="none"
                  stroke="#E8D8BE"
                  strokeWidth={4.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 1194 68 L 1234 92 L 1194 116"
                  fill="none"
                  stroke={inkDark}
                  strokeWidth={10.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 1132 152 L 1132 110 L 1166 110 M 1132 131 L 1158 131"
                  fill="none"
                  stroke={inkDark}
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Flecha F Inferior-Izquierda (compactada a y=988 para nunca chocar con carteles inferiores) */}
              <g
                transform={`translate(828, 925) scale(${fPulse.toFixed(3)}) translate(-828, -925)`}
              >
                <path
                  d="M 828 928 L 828 988 L 688 988"
                  fill="none"
                  stroke={inkDark}
                  strokeWidth={13}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 828 928 L 828 988 L 688 988"
                  fill="none"
                  stroke="#E8D8BE"
                  strokeWidth={4.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 719 964 L 679 988 L 719 1012"
                  fill="none"
                  stroke={inkDark}
                  strokeWidth={10.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 755 974 L 755 932 L 789 932 M 755 953 L 781 953"
                  fill="none"
                  stroke={inkDark}
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </g>
          )}
        </g>
      )}

      {/* =====================================================================
          2. EJES HORIZONTALES ESCALONADOS Y RODAMIENTOS (GIRAN EN EL MISMO EJE y = 540)
         ===================================================================== */}
      <g opacity={drawExteriorP}>
        {/* Rodamiento y Eje Izquierdo */}
        <path
          d={sketchRoundedRect(606, 444, 76, 192, 5, 71, 1.3)}
          fill="url(#sepiaLightHatch)"
          stroke={inkDark}
          strokeWidth={6}
        />
        <path
          d={sketchRoundedRect(546, 488, 40, 104, 4, 72, 1.1)}
          fill="url(#sepiaDenseHatch)"
          stroke={inkDark}
          strokeWidth={6}
        />
        <path
          d={sketchRoundedRect(518, 504, 28, 72, 3, 73, 1.0)}
          fill="url(#sepiaDenseHatch)"
          stroke={inkDark}
          strokeWidth={5.5}
        />
        <path
          d={sketchRoundedRect(385, 520, 133, 40, 4, 74, 1.0)}
          fill="url(#sepiaLightHatch)"
          stroke={inkDark}
          strokeWidth={6}
        />
        {[-10, 2, 14].map((yo, idx) => {
          const yPos = 556 - ((yo + shaftScroll + 36) % 32);
          return (
            <line
              key={idx}
              x1={392}
              y1={yPos}
              x2={512}
              y2={yPos}
              stroke={inkDark}
              strokeWidth={2.4}
              strokeOpacity={0.68}
            />
          );
        })}

        {/* Rodamiento y Eje Derecho */}
        <path
          d={sketchRoundedRect(1238, 444, 76, 192, 5, 75, 1.3)}
          fill="url(#sepiaLightHatch)"
          stroke={inkDark}
          strokeWidth={6}
        />
        <path
          d={sketchRoundedRect(1334, 488, 40, 104, 4, 76, 1.1)}
          fill="url(#sepiaDenseHatch)"
          stroke={inkDark}
          strokeWidth={6}
        />
        <path
          d={sketchRoundedRect(1374, 504, 28, 72, 3, 77, 1.0)}
          fill="url(#sepiaDenseHatch)"
          stroke={inkDark}
          strokeWidth={5.5}
        />
        <path
          d={sketchRoundedRect(1402, 520, 133, 40, 4, 78, 1.0)}
          fill="url(#sepiaLightHatch)"
          stroke={inkDark}
          strokeWidth={6}
        />
        {[-10, 2, 14].map((yo, idx) => {
          const yPos = 556 - ((yo + shaftScroll + 36) % 32);
          return (
            <line
              key={idx}
              x1={1408}
              y1={yPos}
              x2={1528}
              y2={yPos}
              stroke={inkDark}
              strokeWidth={2.4}
              strokeOpacity={0.68}
            />
          );
        })}

        {rpm > 120 && (
          <g opacity={clamp(rpm / 1400, 0.3, 0.95)}>
            <path
              d={sketchEllipseArc(375, 540, 26, 68, thetaDeg, thetaDeg + 140, 81, 1.2)}
              stroke={inkDark}
              strokeWidth={4.5}
              strokeDasharray="12 8"
              fill="none"
            />
            <path
              d={sketchEllipseArc(
                1545,
                540,
                26,
                68,
                thetaDeg + 180,
                thetaDeg + 320,
                82,
                1.2,
              )}
              stroke={inkDark}
              strokeWidth={4.5}
              strokeDasharray="12 8"
              fill="none"
            />
          </g>
        )}
      </g>

      {/* =====================================================================
          3. CARCASA BLINDADA EXTERIOR CON DESPIECE CREATIVO TIPO CLAMSHELL
          (En Escena 2 los pernos giran y las mitades superior e inferior se abren verticalmente;
           en Escena 6 se cierran de golpe y se re-atornillan)
         ===================================================================== */}
      {casingOpacity > 0.05 && (
        <g opacity={casingOpacity}>
          {/* Mitad Superior de la Carcasa Blindada (se desliza hacia arriba al abrirse) */}
          <g transform={`translate(0, ${(-clamshellOpen * 165).toFixed(1)})`}>
            <path
              d={sketchRoundedRect(580, 195, 760, 345, 36, 91, 1.8)}
              fill={
                casingOpacity > 0.45
                  ? frame >= 720
                    ? 'rgba(234, 219, 194, 0.55)'
                    : '#E3D1B0'
                  : 'none'
              }
              stroke={inkDark}
              strokeWidth={casingOpacity > 0.4 ? 7 : 3}
              strokeDasharray={casingOpacity < 0.35 ? '18 14' : undefined}
            />
            <path
              d={sketchRoundedRect(580, 195, 760, 345, 36, 92, 1.2)}
              fill="url(#sepiaArmorHatch)"
              opacity={
                frame >= 720
                  ? Math.min(0.42, casingOpacity * 0.42)
                  : Math.max(0, (casingOpacity - 0.2) * 0.88)
              }
            />
            {casingOpacity > 0.25 &&
              [-250, -180, -110].map((dy, idx) => (
                <path
                  key={idx}
                  d={sketchLine(615, 540 + dy, 1305, 540 + dy, 95 + idx, 1.3, 3)}
                  stroke={inkDark}
                  strokeWidth={4.5}
                  fill="none"
                />
              ))}
            {/* Pernos superiores giratorios */}
            {[
              [625, 240],
              [1295, 240],
            ].map(([bx, by], i) => (
              <g
                key={i}
                transform={`translate(${bx}, ${by - clamshellOpen * 35}) rotate(${(clamshellOpen * 540).toFixed(0)})`}
              >
                <circle
                  cx={0}
                  cy={0}
                  r={15}
                  fill="#5C3F24"
                  stroke={inkDark}
                  strokeWidth={4}
                />
                <line
                  x1={-9}
                  y1={0}
                  x2={9}
                  y2={0}
                  stroke="#EADAC0"
                  strokeWidth={3}
                />
              </g>
            ))}
          </g>

          {/* Mitad Inferior de la Carcasa Blindada (se desliza hacia abajo al abrirse) */}
          <g transform={`translate(0, ${(clamshellOpen * 165).toFixed(1)})`}>
            <path
              d={sketchRoundedRect(580, 540, 760, 345, 36, 93, 1.8)}
              fill={
                casingOpacity > 0.45
                  ? frame >= 720
                    ? 'rgba(234, 219, 194, 0.55)'
                    : '#E3D1B0'
                  : 'none'
              }
              stroke={inkDark}
              strokeWidth={casingOpacity > 0.4 ? 7 : 3}
              strokeDasharray={casingOpacity < 0.35 ? '18 14' : undefined}
            />
            <path
              d={sketchRoundedRect(580, 540, 760, 345, 36, 94, 1.2)}
              fill="url(#sepiaArmorHatch)"
              opacity={
                frame >= 720
                  ? Math.min(0.42, casingOpacity * 0.42)
                  : Math.max(0, (casingOpacity - 0.2) * 0.88)
              }
            />
            {casingOpacity > 0.25 &&
              [110, 180, 250].map((dy, idx) => (
                <path
                  key={idx}
                  d={sketchLine(615, 540 + dy, 1305, 540 + dy, 98 + idx, 1.3, 3)}
                  stroke={inkDark}
                  strokeWidth={4.5}
                  fill="none"
                />
              ))}
            {/* Pernos inferiores giratorios */}
            {[
              [625, 840],
              [1295, 840],
            ].map(([bx, by], i) => (
              <g
                key={i}
                transform={`translate(${bx}, ${by + clamshellOpen * 35}) rotate(${(-clamshellOpen * 540).toFixed(0)})`}
              >
                <circle
                  cx={0}
                  cy={0}
                  r={15}
                  fill="#5C3F24"
                  stroke={inkDark}
                  strokeWidth={4}
                />
                <line
                  x1={-9}
                  y1={0}
                  x2={9}
                  y2={0}
                  stroke="#EADAC0"
                  strokeWidth={3}
                />
              </g>
            ))}
          </g>
        </g>
      )}

      {/* =====================================================================
          4. ONDAS DE CHOQUE Y CHISPAZOS DE CONMUTACIÓN CADA 180°
         ===================================================================== */}
      {xrayShockP > 0.01 && xrayShockP < 0.99 && (
        <circle
          cx={960}
          cy={540}
          r={120 + xrayShockP * 820}
          fill="none"
          stroke={inkDark}
          strokeWidth={12 * (1 - xrayShockP)}
          strokeDasharray="28 18"
          opacity={1 - xrayShockP}
        />
      )}

      {lorentzShockP > 0.01 && lorentzShockP < 0.99 && (
        <>
          <circle
            cx={1085}
            cy={155}
            r={30 + lorentzShockP * 340}
            fill="none"
            stroke={inkGold}
            strokeWidth={10 * (1 - lorentzShockP)}
            opacity={1 - lorentzShockP}
          />
          <circle
            cx={828}
            cy={925}
            r={30 + lorentzShockP * 340}
            fill="none"
            stroke={inkGold}
            strokeWidth={10 * (1 - lorentzShockP)}
            opacity={1 - lorentzShockP}
          />
        </>
      )}

      {commutationFlash > 0.25 && (
        <g opacity={commutationFlash}>
          {[
            [828, 298],
            [1085, 298],
            [828, 782],
            [1085, 782],
          ].map(([sx, sy], idx) => (
            <g key={idx} transform={`translate(${sx}, ${sy})`}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => {
                const rad = (ang * Math.PI) / 180;
                const r1 = 16;
                const r2 = 28 + 26 * commutationFlash;
                return (
                  <line
                    key={ang}
                    x1={Math.cos(rad) * r1}
                    y1={Math.sin(rad) * r1}
                    x2={Math.cos(rad) * r2}
                    y2={Math.sin(rad) * r2}
                    stroke={ang % 90 === 0 ? inkCrimson : inkGlow}
                    strokeWidth={4.5}
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
          ))}
        </g>
      )}
    </svg>
  );
};
