import React from 'react';
import {
  MotorFrameState,
  clamp,
  sketchArrow,
  sketchEllipseArc,
  sketchLine,
  sketchRoundedRect,
  smoothstep,
} from './handDrawnUtils';

interface Props {
  state: MotorFrameState;
}

/**
 * Boceto Mecánico de Grafito/Sepia de Alta Energía (v2.0)
 * Inspirado directamente en la estética y arquitectura de image.png:
 * - Papel pergamino cálido con sombreado diagonal denso a lápiz (///)
 * - Imanes en herradura gigantes a izquierda (N) y derecha (S) con barras verticales de estator
 * - Ejes horizontales escalonados a izquierda y derecha girando a alta velocidad
 * - Cámara central cuadrada redondeada de doble pared con 4 postes de escobillas/terminales
 * - Lazos internos de corriente con flechas ortogonales y rotación 3D
 * - Flechas gigantes de Fuerza de Lorentz "F" de doble contorno y arcos punteados de par motor
 * - Carcasa blindada exterior en Escena 1 que se disuelve con onda de choque en Escena 2 y se reconstruye en Escena 6
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
    polarity,
    commutationFlash,
  } = state;

  // Paleta de grafito / sepia cálido fiel a image.png + acentos energéticos dopaminérgicos
  const inkDark = '#362312'; // Trazo principal de carboncillo sepia oscuro
  const inkMid = '#5C3F24'; // Trazo secundario de lápiz
  const inkLight = '#8C6C49'; // Líneas de construcción y achurado suave
  const inkCrimson = '#991B1B'; // Pulso de corriente intensa
  const inkGold = '#B45309'; // Cobre / chispazo de energía
  const inkGlow = '#D97706'; // Destello ámbar

  // Tiempos de construcción explosiva por pieza
  const drawExteriorP = smoothstep(2, 34, frame);
  const drawLeftMagnetP = smoothstep(132, 162, frame);
  const drawRightMagnetP = smoothstep(152, 182, frame);
  const drawCoreChamberP = smoothstep(172, 208, frame);
  const drawTerminalsP = smoothstep(192, 228, frame);

  // Onda de choque circular en transiciones clave
  const xrayShockP = smoothstep(120, 152, frame);
  const lorentzShockP = smoothstep(375, 408, frame);
  const rebuildSlam1 = smoothstep(725, 745, frame);
  const rebuildSlam2 = smoothstep(748, 768, frame);
  const rebuildSlam3 = smoothstep(772, 795, frame);

  // Factor de rotación 3D de la espira interna dentro de la ventana cuadrada central
  const cosT = Math.cos(thetaRad);
  const sinT = Math.sin(thetaRad);

  // Pulso dopaminérgico de las flechas de fuerza F
  const fPulse =
    lorentzProgress * (1 + 0.14 * Math.sin(frame * 0.45) + 0.18 * commutationFlash);

  // Desplazamiento animado de líneas de velocidad del eje
  const shaftScroll = (frame * (rpm / 3000) * 9) % 24;

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
    >
      <defs>
        {/* Sombreado denso a lápiz sepia (45°) para mitades oscuras de imanes N/S y paredes gruesas */}
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

        {/* Sombreado medio a lápiz sepia para mitades claras, rodamientos y rotor interior */}
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

        {/* Achurado cruzado pesado para la carcasa blindada exterior (Escenas 1 y 6) */}
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
          0. LÍNEAS DE CONSTRUCCIÓN DE BOCETO Y LÍNEAS DE VELOCIDAD RADIALES
         ===================================================================== */}
      <g opacity={0.45}>
        {/* Eje horizontal central de construcción a lápiz */}
        <path
          d={sketchLine(80, 540, 1840, 540, 1, 1.2, 0)}
          stroke={inkLight}
          strokeWidth={2}
          strokeDasharray="16 10 5 10"
          fill="none"
        />
        {/* Eje vertical central */}
        <path
          d={sketchLine(960, 60, 960, 1020, 2, 1.2, 0)}
          stroke={inkLight}
          strokeWidth={1.8}
          strokeDasharray="14 12"
          fill="none"
        />
      </g>

      {/* Líneas cinéticas radiales de velocidad (Speed Lines) cuando RPM > 1800 */}
      {rpm > 1400 && (
        <g opacity={clamp((rpm - 1400) / 1800, 0, 0.42)}>
          {Array.from({length: 16}).map((_, i) => {
            const ang = (i * 22.5 * Math.PI) / 180 + (frame % 7) * 0.02;
            const r0 = 720 + ((i * 37 + frame * 19) % 110);
            const r1 = 980;
            return (
              <line
                key={i}
                x1={960 + Math.cos(ang) * r0}
                y1={540 + Math.sin(ang) * r0 * 0.65}
                x2={960 + Math.cos(ang) * r1}
                y2={540 + Math.sin(ang) * r1 * 0.65}
                stroke={i % 2 === 0 ? inkDark : inkGold}
                strokeWidth={i % 3 === 0 ? 3.5 : 2}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      )}

      {/* =====================================================================
          1. ANATOMÍA INTERNA EN ESTILO BOCETO SEPIA (Inspirada en image.png)
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
            {/* Mitad superior del arco en herradura izquierdo (sombreado oscuro como image.png) */}
            <path
              d="M 584 115 L 410 115 C 235 115, 165 250, 165 540 L 295 540 C 295 315, 345 235, 435 235 L 584 235 Z"
              fill="url(#sepiaDenseHatch)"
              stroke={inkDark}
              strokeWidth={6.5}
              strokeLinejoin="round"
            />
            {/* Mitad inferior del arco en herradura izquierdo (sombreado claro como image.png) */}
            <path
              d="M 165 540 C 165 830, 235 965, 410 965 L 584 965 L 584 845 L 435 845 C 345 845, 295 765, 295 540 Z"
              fill="url(#sepiaLightHatch)"
              stroke={inkDark}
              strokeWidth={6.5}
              strokeLinejoin="round"
            />
            {/* Doble pasada de lápiz para textura de boceto */}
            <path
              d="M 584 115 L 410 115 C 235 115, 165 250, 165 540 C 165 830, 235 965, 410 965 L 584 965"
              fill="none"
              stroke={inkMid}
              strokeWidth={2.5}
              strokeDasharray="24 6"
            />

            {/* Letra "N" tallada a mano en la línea media del arco izquierdo */}
            <rect
              x={195}
              y={502}
              width={72}
              height={76}
              rx={10}
              fill="#EADBC2"
              fillOpacity={0.85}
            />
            <path
              d="M 212 564 L 212 514 L 250 564 L 250 514"
              fill="none"
              stroke={inkDark}
              strokeWidth={7.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Barra vertical izquierda del estator (x: 584..626) */}
            <path
              d={sketchRoundedRect(584, 92, 42, 896, 6, 11, 1.3)}
              fill="url(#sepiaLightHatch)"
              stroke={inkDark}
              strokeWidth={6}
            />

            {/* Arco punteado y flecha curva ascendente (↑) dentro de la herradura N (igual a image.png) */}
            <path
              d="M 390 450 C 375 360, 400 280, 430 245"
              fill="none"
              stroke={inkDark}
              strokeWidth={6}
              strokeDasharray="18 16"
              strokeLinecap="round"
              strokeDashoffset={-frame * 1.8}
            />
            {/* Flecha curva sólida inferior apuntando hacia arriba (↑) dentro de N */}
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
            {/* Mitad superior del arco en herradura derecho (sombreado claro como image.png) */}
            <path
              d="M 1336 115 L 1510 115 C 1685 115, 1755 250, 1755 540 L 1625 540 C 1625 315, 1575 235, 1485 235 L 1336 235 Z"
              fill="url(#sepiaLightHatch)"
              stroke={inkDark}
              strokeWidth={6.5}
              strokeLinejoin="round"
            />
            {/* Mitad inferior del arco en herradura derecho (sombreado oscuro como image.png) */}
            <path
              d="M 1755 540 C 1755 830, 1685 965, 1510 965 L 1336 965 L 1336 845 L 1485 845 C 1575 845, 1625 765, 1625 540 Z"
              fill="url(#sepiaDenseHatch)"
              stroke={inkDark}
              strokeWidth={6.5}
              strokeLinejoin="round"
            />

            {/* Letra "S" tallada a mano en la línea media del arco derecho */}
            <rect
              x={1654}
              y={502}
              width={72}
              height={76}
              rx={10}
              fill="#EADBC2"
              fillOpacity={0.85}
            />
            <path
              d="M 1708 520 C 1695 508, 1670 512, 1670 526 C 1670 542, 1712 538, 1712 556 C 1712 570, 1682 572, 1668 560"
              fill="none"
              stroke={inkDark}
              strokeWidth={7.5}
              strokeLinecap="round"
            />

            {/* Barra vertical derecha del estator (x: 1294..1336) */}
            <path
              d={sketchRoundedRect(1294, 92, 42, 896, 6, 12, 1.3)}
              fill="url(#sepiaLightHatch)"
              stroke={inkDark}
              strokeWidth={6}
            />

            {/* Flecha curva sólida superior apuntando hacia abajo (↓) dentro de S */}
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
            {/* Arco punteado inferior dentro de la herradura S */}
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
              1C. CÁMARA CENTRAL CUADRADA REDONDEADA DE DOBLE PARED + TERMINALES
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
              fill="#E9D9BE"
              stroke={inkDark}
              strokeWidth={6.5}
            />
            {/* Achurado diagonal suave del plato del rotor */}
            <path
              d={sketchRoundedRect(732, 312, 456, 456, 32, 23, 1.0)}
              fill="url(#sepiaLightHatch)"
              stroke="none"
            />

            {/* Ondas de Flujo Magnético B (N -> S) cruzando horizontalmente la ventana en Escenas 3-6 */}
            {bFieldProgress > 0.01 && (
              <g opacity={bFieldProgress * 0.72}>
                {[-140, -70, 0, 70, 140].map((dy, idx) => (
                  <g key={idx}>
                    <line
                      x1={632}
                      y1={540 + dy}
                      x2={1288}
                      y2={540 + dy}
                      stroke="#1E3A8A"
                      strokeWidth={3.2}
                      strokeDasharray="16 14"
                      strokeDashoffset={-frame * 3.5}
                    />
                  </g>
                ))}
              </g>
            )}

            {/* POSTES TERMINALES Y PORTA-ESCOBILLAS (2 ARRIBA Y 2 ABAJO, IGUAL A image.png) */}
            <g opacity={drawTerminalsP}>
              {[835, 1085].map((tx, idx) => (
                <React.Fragment key={idx}>
                  {/* Poste superior externo */}
                  <path
                    d={sketchRoundedRect(tx - 34, 155, 68, 106, 4, 31 + idx, 1.2)}
                    fill="url(#sepiaLightHatch)"
                    stroke={inkDark}
                    strokeWidth={5.5}
                  />
                  {/* Porta-escobilla superior atravesando la pared del núcleo */}
                  <path
                    d={sketchRoundedRect(tx - 28, 255, 56, 82, 4, 33 + idx, 1.1)}
                    fill="#E6D4B5"
                    stroke={inkDark}
                    strokeWidth={5.5}
                  />
                  {/* Remache / contacto de carbón superior (•) */}
                  <circle
                    cx={tx}
                    cy={298}
                    r={13}
                    fill={commutationFlash > 0.3 ? inkGlow : inkDark}
                  />

                  {/* Poste inferior externo */}
                  <path
                    d={sketchRoundedRect(tx - 34, 819, 68, 106, 4, 35 + idx, 1.2)}
                    fill="url(#sepiaLightHatch)"
                    stroke={inkDark}
                    strokeWidth={5.5}
                  />
                  {/* Porta-escobilla inferior atravesando la pared del núcleo */}
                  <path
                    d={sketchRoundedRect(tx - 28, 743, 56, 82, 4, 37 + idx, 1.1)}
                    fill="#E6D4B5"
                    stroke={inkDark}
                    strokeWidth={5.5}
                  />
                  {/* Remache / contacto de carbón inferior (•) */}
                  <circle
                    cx={tx}
                    cy={782}
                    r={13}
                    fill={commutationFlash > 0.3 ? inkGlow : inkDark}
                  />
                </React.Fragment>
              ))}

              {/* Flecha curva superior-izquierda entrando al terminal (como en image.png) */}
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

              {/* Flecha curva inferior-derecha entrando al terminal (como en image.png) */}
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

            {/* ---------------------------------------------------------------
                1D. CONDUCTORES INTERNOS, LAZO DE CORRIENTE Y ROTACIÓN 3D
               --------------------------------------------------------------- */}
            <g>
              {/* Barras conductoras verticales que bajan y suben de las escobillas */}
              {[835, 1085].map((tx, i) => (
                <React.Fragment key={i}>
                  {/* Barras superiores paralelas */}
                  <path
                    d={sketchLine(tx - 16, 337, tx - 16, 495, 41 + i, 1.0, 0)}
                    stroke={inkDark}
                    strokeWidth={5}
                    fill="none"
                  />
                  <path
                    d={sketchLine(tx + 16, 337, tx + 16, 475, 43 + i, 1.0, 0)}
                    stroke={inkDark}
                    strokeWidth={5}
                    fill="none"
                  />
                  {/* Barras inferiores paralelas */}
                  <path
                    d={sketchLine(tx - 16, 585, tx - 16, 743, 45 + i, 1.0, 0)}
                    stroke={inkDark}
                    strokeWidth={5}
                    fill="none"
                  />
                  <path
                    d={sketchLine(tx + 16, 605, tx + 16, 743, 47 + i, 1.0, 0)}
                    stroke={inkDark}
                    strokeWidth={5}
                    fill="none"
                  />
                </React.Fragment>
              ))}

              {/* Flechas ortogonales centrales (← a la izquierda y → a la derecha, idénticas a image.png) */}
              {(() => {
                const arrowColor =
                  currentActive > 0.2
                    ? polarity > 0
                      ? inkCrimson
                      : inkGold
                    : inkDark;
                // Escalado dinámico con la rotación para sensación 3D viva
                const span = 75 + 25 * Math.abs(cosT);
                return (
                  <g>
                    {/* Flecha ortogonal izquierda (baja del centro y apunta a la izquierda ←) */}
                    <path
                      d={`M 851 505 L 851 540 L ${851 - span} 540`}
                      fill="none"
                      stroke={arrowColor}
                      strokeWidth={6.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d={`M ${851 - span + 26} 518 L ${851 - span - 2} 540 L ${851 - span + 26} 562`}
                      fill="none"
                      stroke={arrowColor}
                      strokeWidth={6.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Flecha ortogonal derecha (sube del centro y apunta a la derecha →) */}
                    <path
                      d={`M 1069 575 L 1069 540 L ${1069 + span} 540`}
                      fill="none"
                      stroke={arrowColor}
                      strokeWidth={6.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d={`M ${1069 + span - 26} 518 L ${1069 + span + 2} 540 L ${1069 + span - 26} 562`}
                      fill="none"
                      stroke={arrowColor}
                      strokeWidth={6.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                );
              })()}

              {/* Espira rotatoria 3D proyectada dentro de la cámara central */}
              {(() => {
                const halfW = 165 * cosT;
                const tiltY = 28 * sinT;
                const xL = 960 - halfW;
                const xR = 960 + halfW;
                const yTopL = 355 + tiltY;
                const yTopR = 355 - tiltY;
                const yBotR = 725 - tiltY;
                const yBotL = 725 + tiltY;

                return (
                  <g>
                    <path
                      d={`M ${xL.toFixed(1)} ${yTopL.toFixed(1)} L ${xR.toFixed(1)} ${yTopR.toFixed(1)} L ${xR.toFixed(1)} ${yBotR.toFixed(1)} L ${xL.toFixed(1)} ${yBotL.toFixed(1)} Z`}
                      fill="none"
                      stroke={currentActive > 0.1 ? inkGold : inkMid}
                      strokeWidth={5.5}
                      strokeLinejoin="round"
                    />
                    {/* Pulsos luminosos de corriente corriendo por la espira */}
                    {currentActive > 0.1 && (
                      <path
                        d={`M ${xL.toFixed(1)} ${yTopL.toFixed(1)} L ${xR.toFixed(1)} ${yTopR.toFixed(1)} L ${xR.toFixed(1)} ${yBotR.toFixed(1)} L ${xL.toFixed(1)} ${yBotL.toFixed(1)} Z`}
                        fill="none"
                        stroke={inkCrimson}
                        strokeWidth={6.5}
                        strokeDasharray="24 28"
                        strokeDashoffset={-frame * 7 * polarity}
                        strokeLinecap="round"
                      />
                    )}
                  </g>
                );
              })()}

              {/* Lazo rectangular interno de flechas finas a lápiz (como en image.png) */}
              <g opacity={0.78}>
                <path
                  d={sketchLine(1125, 675, 1125, 395, 61, 1.2, 0)}
                  stroke={inkMid}
                  strokeWidth={3.5}
                  fill="none"
                />
                <path
                  d="M 1111 418 L 1125 390 L 1139 418"
                  stroke={inkMid}
                  strokeWidth={3.5}
                  fill="none"
                />
                <path
                  d={sketchLine(1110, 372, 800, 372, 62, 1.2, 0)}
                  stroke={inkMid}
                  strokeWidth={3.5}
                  fill="none"
                />
                <path
                  d={sketchLine(1110, 705, 805, 705, 63, 1.2, 0)}
                  stroke={inkMid}
                  strokeWidth={3.5}
                  fill="none"
                />
                <path
                  d="M 828 691 L 800 705 L 828 719"
                  stroke={inkMid}
                  strokeWidth={3.5}
                  fill="none"
                />
              </g>
            </g>
          </g>

          {/* -----------------------------------------------------------------
              1E. FLECHAS GIGANTES DE FUERZA DE LORENTZ "F" (DOBLE CONTORNO, image.png)
             ----------------------------------------------------------------- */}
          {lorentzProgress > 0.01 && (
            <g opacity={lorentzProgress}>
              {/* Flecha F Superior-Derecha (sale del poste derecho hacia arriba y dobla a la derecha ↱) */}
              <g
                transform={`translate(1085, 155) scale(${fPulse.toFixed(3)}) translate(-1085, -155)`}
              >
                <path
                  d="M 1085 150 L 1085 68 L 1225 68"
                  fill="none"
                  stroke={inkDark}
                  strokeWidth={14}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 1085 150 L 1085 68 L 1225 68"
                  fill="none"
                  stroke="#E8D8BE"
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 1192 42 L 1234 68 L 1192 94"
                  fill="none"
                  stroke={inkDark}
                  strokeWidth={11}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Letra "F" gruesa dibujada a mano debajo de la flecha superior */}
                <path
                  d="M 1132 142 L 1132 94 L 1168 94 M 1132 118 L 1160 118"
                  fill="none"
                  stroke={inkDark}
                  strokeWidth={8.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Flecha F Inferior-Izquierda (sale del poste izquierdo hacia abajo y dobla a la izquierda ↲) */}
              <g
                transform={`translate(835, 925) scale(${fPulse.toFixed(3)}) translate(-835, -925)`}
              >
                <path
                  d="M 835 930 L 835 1012 L 695 1012"
                  fill="none"
                  stroke={inkDark}
                  strokeWidth={14}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 835 930 L 835 1012 L 695 1012"
                  fill="none"
                  stroke="#E8D8BE"
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 728 986 L 686 1012 L 728 1038"
                  fill="none"
                  stroke={inkDark}
                  strokeWidth={11}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Letra "F" gruesa dibujada a mano encima de la flecha inferior */}
                <path
                  d="M 762 986 L 762 938 L 798 938 M 762 962 L 790 962"
                  fill="none"
                  stroke={inkDark}
                  strokeWidth={8.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </g>
          )}
        </g>
      )}

      {/* =====================================================================
          2. EJES HORIZONTALES ESCALONADOS Y RODAMIENTOS (SIEMPRE VISIBLES, GIRANDO)
          (Exactamente como los bloques escalonados izquierdo y derecho de image.png)
         ===================================================================== */}
      <g opacity={drawExteriorP}>
        {/* --- Conjunto de Rodamiento y Eje Izquierdo --- */}
        {/* Bloque escalonado 1 (grande, entre núcleo y barra vertical) */}
        <path
          d={sketchRoundedRect(606, 444, 76, 192, 5, 71, 1.3)}
          fill="url(#sepiaLightHatch)"
          stroke={inkDark}
          strokeWidth={6}
        />
        {/* Bloque escalonado 2 (mediano, a la izquierda de la barra) */}
        <path
          d={sketchRoundedRect(546, 488, 40, 104, 4, 72, 1.1)}
          fill="url(#sepiaDenseHatch)"
          stroke={inkDark}
          strokeWidth={6}
        />
        {/* Bloque escalonado 3 (collarín) */}
        <path
          d={sketchRoundedRect(518, 504, 28, 72, 3, 73, 1.0)}
          fill="url(#sepiaDenseHatch)"
          stroke={inkDark}
          strokeWidth={5.5}
        />
        {/* Eje cilíndrico izquierdo saliente */}
        <path
          d={sketchRoundedRect(385, 520, 133, 40, 4, 74, 1.0)}
          fill="url(#sepiaLightHatch)"
          stroke={inkDark}
          strokeWidth={6}
        />
        {/* Líneas de giro sobre el eje izquierdo */}
        {[-10, 2, 14].map((yo, idx) => {
          const yPos = 524 + ((yo + shaftScroll + 36) % 32);
          return (
            <line
              key={idx}
              x1={392}
              y1={yPos}
              x2={512}
              y2={yPos}
              stroke={inkDark}
              strokeWidth={2.2}
              strokeOpacity={0.65}
            />
          );
        })}

        {/* --- Conjunto de Rodamiento y Eje Derecho --- */}
        {/* Bloque escalonado 1 (grande, entre núcleo y barra vertical) */}
        <path
          d={sketchRoundedRect(1238, 444, 76, 192, 5, 75, 1.3)}
          fill="url(#sepiaLightHatch)"
          stroke={inkDark}
          strokeWidth={6}
        />
        {/* Bloque escalonado 2 (mediano) */}
        <path
          d={sketchRoundedRect(1334, 488, 40, 104, 4, 76, 1.1)}
          fill="url(#sepiaDenseHatch)"
          stroke={inkDark}
          strokeWidth={6}
        />
        {/* Bloque escalonado 3 (collarín) */}
        <path
          d={sketchRoundedRect(1374, 504, 28, 72, 3, 77, 1.0)}
          fill="url(#sepiaDenseHatch)"
          stroke={inkDark}
          strokeWidth={5.5}
        />
        {/* Eje cilíndrico derecho saliente */}
        <path
          d={sketchRoundedRect(1402, 520, 133, 40, 4, 78, 1.0)}
          fill="url(#sepiaLightHatch)"
          stroke={inkDark}
          strokeWidth={6}
        />
        {/* Líneas de giro sobre el eje derecho */}
        {[-10, 2, 14].map((yo, idx) => {
          const yPos = 524 + ((yo + shaftScroll + 36) % 32);
          return (
            <line
              key={idx}
              x1={1408}
              y1={yPos}
              x2={1528}
              y2={yPos}
              stroke={inkDark}
              strokeWidth={2.2}
              strokeOpacity={0.65}
            />
          );
        })}

        {/* Arcos cinéticos de rotación rápida alrededor de las puntas de ambos ejes */}
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
          3. CARCASA BLINDADA EXTERIOR (Sólida en Escena 1 -> Fantasma en 2-5 -> Reconstruida en 6)
         ===================================================================== */}
      {casingOpacity > 0.05 && (
        <g opacity={casingOpacity}>
          {/* Cuerpo blindado exterior con aletas horizontales de acero sepia */}
          <path
            d={sketchRoundedRect(580, 195, 760, 690, 48, 91, 2.0)}
            fill={
              casingOpacity > 0.45
                ? frame >= 720
                  ? 'rgba(234, 219, 194, 0.62)'
                  : '#E3D1B0'
                : 'none'
            }
            stroke={inkDark}
            strokeWidth={casingOpacity > 0.4 ? 7.5 : 3}
            strokeDasharray={casingOpacity < 0.35 ? '18 14' : undefined}
          />
          <path
            d={sketchRoundedRect(580, 195, 760, 690, 48, 92, 1.4)}
            fill="url(#sepiaArmorHatch)"
            opacity={
              frame >= 720
                ? Math.min(0.45, casingOpacity * 0.45)
                : Math.max(0, (casingOpacity - 0.2) * 0.9)
            }
          />

          {/* Aletas de enfriamiento horizontales y pernos remachados de la carcasa */}
          {casingOpacity > 0.25 && (
            <g
              opacity={
                frame >= 720
                  ? (rebuildSlam1 + rebuildSlam2 + rebuildSlam3) / 3
                  : drawExteriorP
              }
            >
              {[-250, -180, -110, 110, 180, 250].map((dy, idx) => (
                <path
                  key={idx}
                  d={sketchLine(615, 540 + dy, 1305, 540 + dy, 95 + idx, 1.3, 3)}
                  stroke={inkDark}
                  strokeWidth={4.5}
                  fill="none"
                />
              ))}
              {/* Ventana central de inspección con remaches */}
              <path
                d={sketchRoundedRect(710, 465, 500, 150, 18, 99, 1.2)}
                fill={
                  frame >= 720
                    ? 'rgba(234, 219, 194, 0.15)'
                    : 'rgba(54, 35, 18, 0.12)'
                }
                stroke={inkDark}
                strokeWidth={5}
              />
              {/* 4 Pernos esquineros */}
              {[
                [625, 240],
                [1295, 240],
                [625, 840],
                [1295, 840],
              ].map(([bx, by], i) => (
                <circle
                  key={i}
                  cx={bx}
                  cy={by}
                  r={14}
                  fill="#5C3F24"
                  stroke={inkDark}
                  strokeWidth={4}
                />
              ))}
            </g>
          )}
        </g>
      )}

      {/* =====================================================================
          4. EFECTOS DOPAMINÉRGICOS: ONDAS DE CHOQUE Y CHISPAZOS DE CARBONCILLO
         ===================================================================== */}
      {/* Onda de choque circular cuando se disuelve la carcasa (Escena 2) */}
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

      {/* Onda de choque dorada cuando estallan las Fuerzas de Lorentz F (Escena 4) */}
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
            cx={835}
            cy={925}
            r={30 + lorentzShockP * 340}
            fill="none"
            stroke={inkGold}
            strokeWidth={10 * (1 - lorentzShockP)}
            opacity={1 - lorentzShockP}
          />
        </>
      )}

      {/* Explosión de chispas dibujadas a mano en los 4 contactos cada 180° */}
      {commutationFlash > 0.25 && (
        <g opacity={commutationFlash}>
          {[
            [835, 298],
            [1085, 298],
            [835, 782],
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
