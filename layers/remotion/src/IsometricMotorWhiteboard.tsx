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
 * Boceto Mecánico de Grafito/Sepia v4.0 — Carga/Descarga Bajo Demanda (Spotlight Staging),
 * Continuidad Espacial al Abrir, Explicación Visual Auto-Contenida de Vórtices + Campo Tensado,
 * y Trazo Humano Multipaso ("Cuaderno de Inventor").
 */
export const IsometricMotorWhiteboard: React.FC<Props> = ({state}) => {
  const {
    frame,
    thetaDeg,
    thetaRad,
    rpm,
    casingOpacity,
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

  const drawExteriorP = smoothstep(2, 32, frame);

  // CONTINUIDAD ESPACIAL TOTAL: El núcleo interno ya está presente detrás del blindaje desde el frame 100,
  // de modo que al abrirse las valvas en el frame 120 se descubre inmediatamente sin ningún vacío temporal.
  const corePreLoaded = smoothstep(100, 118, frame);
  const drawLeftMagnetP = smoothstep(115, 148, frame);
  const drawRightMagnetP = smoothstep(128, 162, frame);

  // =========================================================================
  // SISTEMA DE CARGA Y DESCARGA BAJO DEMANDA (SPOTLIGHT STAGING)
  // Cada subsistema brilla al 100% en su momento protagonista y se atenúa cuando otro toma el foco.
  // =========================================================================
  // Imanes N/S: protagonistas en Escena 2A (120-185) y Escena 6; se atenúan en Escenas 3-5 para dar aire al centro
  const magnetsSpotlight =
    frame < 190
      ? 1.0
      : frame < 245
        ? 1.0 - 0.35 * smoothstep(190, 235, frame)
        : frame < 540
          ? 0.42
          : frame < 720
            ? 0.38
            : 0.38 + 0.62 * smoothstep(720, 760, frame);

  // Pared cuadrada del estator central: se atenúa en Escenas 3 y 4 para que las líneas de campo y vórtices se lean limpios
  const chamberWallSpotlight =
    frame >= 245 && frame <= 535
      ? 1.0 - 0.55 * smoothstep(245, 275, frame) * (1 - smoothstep(515, 538, frame))
      : 1.0;

  // Etiquetas manuscritas de Escena 2 (se cargan en Escena 2 y se DESCARGAN antes de Escena 3)
  const scene2LabelsOpacity =
    smoothstep(145, 168, frame) * (1 - smoothstep(222, 238, frame));

  // Explicación visual paso a paso de Vórtice (B_I) vs Campo (B):
  // Se CARGA en Escena 3-4 (frames 270..525) y se DESCARGA por completo en Escena 5 (frame 535)
  const vortexExplainOpacity =
    smoothstep(268, 295, frame) * (1 - smoothstep(518, 536, frame));

  // Etiqueta explicativa de la Catapulta Magnética (Fuerza F):
  // Se CARGA en Escena 4 (frames 380..525) y se DESCARGA en Escena 5
  const catapultExplainOpacity =
    smoothstep(380, 405, frame) * (1 - smoothstep(518, 536, frame));

  // Foco y etiqueta del Colector Horizontal en Escena 5 (se CARGA en frame 545 y se DESCARGA en frame 712)
  const scene5CommutatorOpacity =
    smoothstep(545, 568, frame) * (1 - smoothstep(698, 715, frame));

  // Apertura tipo Clamshell de la carcasa exterior en Escena 2 y cierre en Escena 6
  const clamshellOpen =
    frame < 720
      ? smoothstep(118, 168, frame)
      : 1 - smoothstep(722, 778, frame);

  const xrayShockP = smoothstep(118, 150, frame);
  const lorentzShockP = smoothstep(375, 408, frame);

  const fPulse =
    lorentzProgress * (1 + 0.12 * Math.sin(frame * 0.45) + 0.15 * commutationFlash);

  const shaftScroll = (frame * (rpm / 3000) * 10) % 28;

  // Geometría 3D del Tambor Cilíndrico Horizontal del Rotor (montado sobre el eje horizontal y = 540)
  const drumX1 = 875;
  const drumX2 = 1155;
  const drumR = 130;
  const commX1 = 795;
  const commX2 = 862;
  const commR = 64;

  const coilBars = [0, 90, 180, 270].map((offsetDeg, idx) => {
    const ang = thetaRad + (offsetDeg * Math.PI) / 180;
    const y = 540 - drumR * Math.sin(ang);
    const z = drumR * Math.cos(ang);
    const isPrimary = idx === 0 || idx === 2;
    const isFront = z >= 0;
    return {idx, ang, y, z, isPrimary, isFront};
  });

  const backBars = coilBars.filter((b) => !b.isFront);
  const frontBars = coilBars.filter((b) => b.isFront);

  const activeFrontBar =
    coilBars[0].z >= coilBars[2].z ? coilBars[0] : coilBars[2];

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

        {/* Sombreado ámbar de alta presión magnética (colchón de catapulta debajo del cable) */}
        <pattern
          id="amberPressureHatch"
          width="8"
          height="8"
          patternTransform="rotate(25 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="8"
            stroke="#D97706"
            strokeWidth="2.8"
            strokeOpacity="0.42"
          />
        </pattern>
      </defs>

      {/* =====================================================================
          0. LÍNEAS DE CONSTRUCCIÓN DE CUADERNO DE INVENTOR (CON OVERSHOOTS +)
         ===================================================================== */}
      <g opacity={0.45}>
        <path
          d={sketchLine(80, 540, 1840, 540, 1, 1.3, 0)}
          stroke={inkLight}
          strokeWidth={2}
          strokeDasharray="16 10 5 10"
          fill="none"
        />
        <path
          d={sketchLine(960, 60, 960, 1020, 2, 1.3, 0)}
          stroke={inkLight}
          strokeWidth={1.8}
          strokeDasharray="14 12"
          fill="none"
        />
        {/* Marcas de registro manual (+) en esquinas del dibujo técnico */}
        {[
          [560, 180],
          [1360, 180],
          [560, 900],
          [1360, 900],
        ].map(([rx, ry], i) => (
          <g key={i} stroke={inkLight} strokeWidth={2}>
            <line x1={rx - 14} y1={ry} x2={rx + 14} y2={ry} />
            <line x1={rx} y1={ry - 14} x2={rx} y2={ry + 14} />
          </g>
        ))}
      </g>

      {/* =====================================================================
          1. ANATOMÍA INTERNA CON CARGA/DESCARGA BAJO DEMANDA (SPOTLIGHT STAGING)
         ===================================================================== */}
      {corePreLoaded > 0.01 && (
        <g opacity={corePreLoaded}>
          {/* -----------------------------------------------------------------
              1A. IMANES EN HERRADURA (N / S) — Se atenúan cuando el foco pasa al centro
             ----------------------------------------------------------------- */}
          <g opacity={magnetsSpotlight}>
            {/* Polo Norte Izquierdo (N) */}
            <g
              opacity={drawLeftMagnetP}
              transform={`translate(${(1 - drawLeftMagnetP) * -90}, 0)`}
            >
              <path
                d="M 584 115 L 410 115 C 235 115, 165 250, 165 540 L 295 540 C 295 315, 345 235, 435 235 L 584 235 Z"
                fill="url(#sepiaDenseHatch)"
                stroke={inkDark}
                strokeWidth={6.5}
                strokeLinejoin="round"
              />
              {/* Trazo de segunda pasada a lápiz para aspecto humano */}
              <path
                d="M 588 111 L 406 113 C 230 118, 160 255, 162 544"
                fill="none"
                stroke={inkMid}
                strokeWidth={2.2}
                strokeOpacity={0.55}
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
                fillOpacity={0.9}
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
                d={sketchRoundedRect(584, 92, 42, 896, 6, 11, 1.5)}
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

            {/* Polo Sur Derecho (S) */}
            <g
              opacity={drawRightMagnetP}
              transform={`translate(${(1 - drawRightMagnetP) * 90}, 0)`}
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
              <path
                d="M 1758 536 C 1759 834, 1680 969, 1506 968"
                fill="none"
                stroke={inkMid}
                strokeWidth={2.2}
                strokeOpacity={0.55}
              />
              <rect
                x={1654}
                y={502}
                width={72}
                height={76}
                rx={10}
                fill="#EADBC2"
                fillOpacity={0.9}
              />
              <path
                d="M 1708 520 C 1695 508, 1670 512, 1670 526 C 1670 542, 1712 538, 1712 556 C 1712 570, 1682 572, 1668 560"
                fill="none"
                stroke={inkDark}
                strokeWidth={7.5}
                strokeLinecap="round"
              />
              <path
                d={sketchRoundedRect(1294, 92, 42, 896, 6, 12, 1.5)}
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
          </g>

          {/* -----------------------------------------------------------------
              1B. CÁMARA CENTRAL Y COMPONENTES INTERNOS
             ----------------------------------------------------------------- */}
          <g>
            {/* Pared cuadrada redondeada (se atenúa cuando explicamos los vórtices en Escenas 3-4) */}
            <g opacity={chamberWallSpotlight}>
              <path
                d={sketchRoundedRect(680, 260, 560, 560, 62, 21, 2.0)}
                fill="url(#sepiaDenseHatch)"
                stroke={inkDark}
                strokeWidth={7}
              />
              {/* Segunda pasada de lápiz con overshoot */}
              <path
                d={sketchRoundedRect(677, 258, 566, 564, 64, 29, 2.4)}
                fill="none"
                stroke={inkMid}
                strokeWidth={2}
                strokeOpacity={0.48}
              />
              <path
                d={sketchRoundedRect(724, 304, 472, 472, 38, 22, 1.6)}
                fill="#EADAC0"
                stroke={inkDark}
                strokeWidth={6.5}
              />
            </g>

            {/* ===============================================================
                1C. CAMPO MAGNÉTICO DEFORMABLE + COLCHÓN DE ALTA PRESIÓN (+ +)
               =============================================================== */}
            {bFieldProgress > 0.01 && (
              <g opacity={bFieldProgress}>
                {/* Colchón sombreado de Alta Presión Magnética (+ +) DEBAJO de la barra frontal */}
                {currentActive > 0.15 && (
                  <ellipse
                    cx={1015}
                    cy={activeFrontBar.y + 42}
                    rx={135}
                    ry={34}
                    fill="url(#amberPressureHatch)"
                    stroke="#D97706"
                    strokeWidth={2.5}
                    strokeDasharray="10 6"
                    opacity={currentActive * 0.88}
                  />
                )}

                {[-165, -110, -55, 0, 55, 110, 165].map((dy, idx) => {
                  const yBase = 540 + dy;
                  const distFront = yBase - activeFrontBar.y;
                  // Las líneas de campo se comprimen hacia abajo debajo del cable formando la catapulta
                  const bendFront =
                    currentActive *
                    58 *
                    Math.exp(-(distFront * distFront) / 3200) *
                    (activeFrontBar.z / drumR);

                  const cyCtrl1 = yBase + dy * 0.18 + bendFront;
                  const cyCtrl2 = yBase - dy * 0.14 + bendFront * 0.8;
                  const pathD = `M 626 ${yBase + dy * 0.3} C 790 ${cyCtrl1.toFixed(1)}, 1130 ${cyCtrl2.toFixed(1)}, 1294 ${yBase + dy * 0.3}`;

                  const uFlow = ((frame * 0.024 + idx * 0.19) % 1 + 1) % 1;
                  const fx = 645 + uFlow * 620;
                  const fy =
                    yBase +
                    Math.sin(uFlow * Math.PI) * (bendFront * 0.85) +
                    (1 - Math.sin(uFlow * Math.PI)) * dy * 0.22;

                  return (
                    <g key={idx}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={inkBlue}
                        strokeWidth={idx % 2 === 0 ? 3.2 : 2.4}
                        strokeOpacity={0.68}
                        strokeDasharray="16 10"
                        strokeDashoffset={-frame * 3.8}
                      />
                      <path
                        d={`M ${fx - 10} ${fy - 6} L ${fx + 5} ${fy} L ${fx - 10} ${fy + 6}`}
                        fill="none"
                        stroke={inkBlue}
                        strokeWidth={3}
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* Barras traseras ocultas detrás del tambor horizontal */}
            {backBars.map((bar) => (
              <g key={bar.idx} opacity={0.45}>
                <line
                  x1={drumX1}
                  y1={bar.y}
                  x2={drumX2}
                  y2={bar.y}
                  stroke={bar.isPrimary ? inkGold : inkMid}
                  strokeWidth={bar.isPrimary ? 5.5 : 3.5}
                  strokeDasharray="10 8"
                />
              </g>
            ))}

            {/* ===============================================================
                1D. TAMBOR CILÍNDRICO HORIZONTAL 3D + EJE CONTINUO + COLECTOR
               =============================================================== */}
            <g>
              {/* Eje central continuo horizontal (y = 540) */}
              <path
                d={sketchRoundedRect(724, 524, 472, 32, 3, 50, 0.9)}
                fill="url(#sepiaDenseHatch)"
                stroke={inkDark}
                strokeWidth={4.5}
              />

              {/* Tambor cilíndrico horizontal del rotor */}
              <path
                d={sketchRoundedRect(
                  drumX1,
                  540 - drumR,
                  drumX2 - drumX1,
                  drumR * 2,
                  18,
                  51,
                  1.4,
                )}
                fill="rgba(233, 217, 190, 0.82)"
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

              {/* Ranuras horizontales girando con el cilindro */}
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const slotAng = thetaRad + ((idx * 30) * Math.PI) / 180;
                const sy = 540 - (drumR - 10) * Math.sin(slotAng);
                const sz = Math.cos(slotAng);
                if (sz < -0.1) return null;
                return (
                  <line
                    key={idx}
                    x1={drumX1 + 14}
                    y1={sy}
                    x2={drumX2 - 14}
                    y2={sy}
                    stroke={inkMid}
                    strokeWidth={2.2}
                    strokeOpacity={0.32 + 0.35 * sz}
                  />
                );
              })}

              {/* Tapas elípticas 3D del tambor horizontal */}
              <ellipse
                cx={drumX1}
                cy={540}
                rx={22}
                ry={drumR}
                fill="rgba(220, 200, 168, 0.88)"
                stroke={inkDark}
                strokeWidth={5}
              />
              <ellipse
                cx={drumX2}
                cy={540}
                rx={22}
                ry={drumR}
                fill="rgba(220, 200, 168, 0.68)"
                stroke={inkDark}
                strokeWidth={5}
              />

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

              {/* Colector de Delgas Cilíndrico sobre el mismo eje horizontal */}
              <path
                d={sketchRoundedRect(
                  commX1,
                  540 - commR,
                  commX2 - commX1,
                  commR * 2,
                  10,
                  55,
                  1.2,
                )}
                fill="#D97706"
                fillOpacity={0.38}
                stroke={inkDark}
                strokeWidth={5.5}
              />
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
                1E. BARRAS CONDUCTORAS FRONTALES (z >= 0)
               =============================================================== */}
            {frontBars.map((bar) => (
              <g key={bar.idx}>
                <line
                  x1={commX2}
                  y1={540 - commR * Math.sin(bar.ang)}
                  x2={drumX1}
                  y2={bar.y}
                  stroke={bar.isPrimary ? inkGold : inkMid}
                  strokeWidth={bar.isPrimary ? 6.5 : 4.2}
                />
                <line
                  x1={drumX1}
                  y1={bar.y}
                  x2={drumX2}
                  y2={bar.y}
                  stroke={bar.isPrimary ? inkDark : inkMid}
                  strokeWidth={bar.isPrimary ? 11.5 : 6}
                  strokeLinecap="round"
                />
                <line
                  x1={drumX1}
                  y1={bar.y}
                  x2={drumX2}
                  y2={bar.y}
                  stroke={bar.isPrimary ? '#F59E0B' : '#B45309'}
                  strokeWidth={bar.isPrimary ? 6.5 : 3.5}
                  strokeLinecap="round"
                />

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

            {/* ===============================================================
                1F. EXPLICACIÓN VISUAL AUTO-CONTENIDA DEL VÓRTICE (B_I) Y CAMPO TENSADO (B)
                (Se CARGA en Escenas 3-4 y se DESCARGA al terminar la Escena 4)
               =============================================================== */}
            {vortexExplainOpacity > 0.01 && (
              <g opacity={vortexExplainOpacity}>
                {/* Anillo de vórtice magnético alrededor de la barra frontal activa */}
                <ellipse
                  cx={1015}
                  cy={activeFrontBar.y}
                  rx={68}
                  ry={44}
                  fill="none"
                  stroke={inkCrimson}
                  strokeWidth={3.5}
                  strokeDasharray="12 8"
                  strokeDashoffset={-frame * 4.5}
                />
                {/* Flecha superior del remolino apuntando a la IZQUIERDA (◄─── opuesta al campo B) */}
                <path
                  d={`M 1030 ${activeFrontBar.y - 44} L 1000 ${activeFrontBar.y - 44} M 1014 ${activeFrontBar.y - 53} L 998 ${activeFrontBar.y - 44} L 1014 ${activeFrontBar.y - 35}`}
                  fill="none"
                  stroke={inkCrimson}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Flecha inferior del remolino apuntando a la DERECHA (───► mismo sentido que el campo B) */}
                <path
                  d={`M 1000 ${activeFrontBar.y + 44} L 1030 ${activeFrontBar.y + 44} M 1016 ${activeFrontBar.y + 35} L 1032 ${activeFrontBar.y + 44} L 1016 ${activeFrontBar.y + 53}`}
                  fill="none"
                  stroke={inkCrimson}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* NOTA MANUSCRITA 1 (ARRIBA DEL CABLE): Cancelación de campos = Vacío (-) */}
                <g transform={`translate(1015, ${activeFrontBar.y - 78})`}>
                  <path
                    d={sketchRoundedRect(-175, -24, 350, 38, 6, 301, 1.2)}
                    fill="rgba(239, 225, 198, 0.94)"
                    stroke={inkBlue}
                    strokeWidth={2.5}
                  />
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    fill={inkBlue}
                    fontFamily="'Comic Neue', sans-serif"
                    fontWeight="bold"
                    fontSize={17}
                  >
                    ARRIBA: Opuestos (◄─ vs ─►) = SE RESTAN (-)
                  </text>
                </g>

                {/* NOTA MANUSCRITA 2 (DEBAJO DEL CABLE): Suma de campos = Colchón de Alta Presión (+ +) */}
                <g transform={`translate(1015, ${activeFrontBar.y + 84})`}>
                  <path
                    d={sketchRoundedRect(-190, -18, 380, 40, 6, 302, 1.2)}
                    fill="rgba(254, 243, 199, 0.95)"
                    stroke={inkCrimson}
                    strokeWidth={3}
                  />
                  <text
                    x={0}
                    y={8}
                    textAnchor="middle"
                    fill={inkCrimson}
                    fontFamily="'Comic Neue', sans-serif"
                    fontWeight="bold"
                    fontSize={17.5}
                  >
                    ABAJO: Mismo sentido (─► + ─►) = ¡EMPUJE (+ +)!
                  </text>
                </g>
              </g>
            )}

            {/* Vector verde esmeralda de Fuerza de Lorentz ↑F (Catapulta hacia arriba) */}
            {lorentzProgress > 0.05 && (
              <g opacity={lorentzProgress}>
                <line
                  x1={1015}
                  y1={activeFrontBar.y}
                  x2={1015}
                  y2={activeFrontBar.y - 92}
                  stroke={inkEmerald}
                  strokeWidth={9}
                  strokeLinecap="round"
                />
                <path
                  d={`M 992 ${activeFrontBar.y - 64} L 1015 ${activeFrontBar.y - 96} L 1038 ${activeFrontBar.y - 64}`}
                  fill="none"
                  stroke={inkEmerald}
                  strokeWidth={8.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {catapultExplainOpacity > 0.05 && (
                  <g
                    opacity={catapultExplainOpacity}
                    transform={`translate(1155, ${activeFrontBar.y - 52})`}
                  >
                    <path
                      d={sketchRoundedRect(-115, -22, 230, 38, 6, 309, 1.1)}
                      fill="rgba(236, 253, 245, 0.95)"
                      stroke={inkEmerald}
                      strokeWidth={3}
                    />
                    <text
                      x={0}
                      y={3}
                      textAnchor="middle"
                      fill={inkEmerald}
                      fontFamily="'Humor Sans', cursive"
                      fontSize={22}
                    >
                      ↑ CATAPULTA LORENTZ (F)
                    </text>
                  </g>
                )}
              </g>
            )}

            {/* ===============================================================
                1G. NOTAS MANUSCRITAS BAJO DEMANDA PARA ESCENA 2 Y ESCENA 5
               =============================================================== */}
            {/* Notas de Escena 2 (se cargan al abrir la carcasa y se descargan en frame 235) */}
            {scene2LabelsOpacity > 0.01 && (
              <g opacity={scene2LabelsOpacity}>
                <g transform="translate(828, 395)">
                  <path
                    d={sketchRoundedRect(-115, -24, 230, 38, 6, 401, 1.1)}
                    fill="rgba(239, 225, 198, 0.94)"
                    stroke={inkDark}
                    strokeWidth={2.5}
                  />
                  <text
                    x={0}
                    y={1}
                    textAnchor="middle"
                    fill={inkDark}
                    fontFamily="'Comic Neue', sans-serif"
                    fontWeight="bold"
                    fontSize={17}
                  >
                    1. Colector en el eje horizontal
                  </text>
                </g>
                <g transform="translate(1025, 375)">
                  <path
                    d={sketchRoundedRect(-115, -24, 230, 38, 6, 402, 1.1)}
                    fill="rgba(239, 225, 198, 0.94)"
                    stroke={inkDark}
                    strokeWidth={2.5}
                  />
                  <text
                    x={0}
                    y={1}
                    textAnchor="middle"
                    fill={inkDark}
                    fontFamily="'Comic Neue', sans-serif"
                    fontWeight="bold"
                    fontSize={17}
                  >
                    2. Tambor Cilíndrico 3D
                  </text>
                </g>
              </g>
            )}

            {/* Nota de Escena 5 (se carga en frame 545 para explicar el colector y se descarga en frame 712) */}
            {scene5CommutatorOpacity > 0.01 && (
              <g opacity={scene5CommutatorOpacity} transform="translate(828, 385)">
                <path
                  d={sketchRoundedRect(-170, -24, 340, 42, 6, 405, 1.2)}
                  fill="rgba(254, 243, 199, 0.96)"
                  stroke={inkGold}
                  strokeWidth={3}
                />
                <text
                  x={0}
                  y={3}
                  textAnchor="middle"
                  fill={inkDark}
                  fontFamily="'Comic Neue', sans-serif"
                  fontWeight="bold"
                  fontSize={18}
                >
                  ¡Cada 180° las delgas invierten +I ↔ -I!
                </text>
              </g>
            )}

            {/* POSTES TERMINALES Y ESCOBILLAS */}
            <g>
              {[828, 1085].map((tx, idx) => (
                <React.Fragment key={idx}>
                  <path
                    d={sketchRoundedRect(tx - 34, 155, 68, 106, 4, 31 + idx, 1.2)}
                    fill="url(#sepiaLightHatch)"
                    stroke={inkDark}
                    strokeWidth={5.5}
                  />
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

                  <path
                    d={sketchRoundedRect(tx - 34, 819, 68, 106, 4, 35 + idx, 1.2)}
                    fill="url(#sepiaLightHatch)"
                    stroke={inkDark}
                    strokeWidth={5.5}
                  />
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

          {/* Flechas exteriores F de doble contorno */}
          {lorentzProgress > 0.01 && (
            <g opacity={lorentzProgress}>
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
          2. EJES HORIZONTALES ESCALONADOS Y RODAMIENTOS
         ===================================================================== */}
      <g opacity={drawExteriorP}>
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
          3. CARCASA BLINDADA EXTERIOR CON DESPIECE TIPO CLAMSHELL
         ===================================================================== */}
      {casingOpacity > 0.05 && (
        <g opacity={casingOpacity}>
          {/* Mitad Superior */}
          <g transform={`translate(0, ${(-clamshellOpen * 175).toFixed(1)})`}>
            <path
              d={sketchRoundedRect(580, 195, 760, 345, 36, 91, 1.8)}
              fill={
                casingOpacity > 0.45
                  ? frame >= 720
                    ? 'rgba(234, 219, 194, 0.52)'
                    : '#E3D1B0'
                  : 'none'
              }
              stroke={inkDark}
              strokeWidth={casingOpacity > 0.4 ? 7 : 2.8}
              strokeDasharray={casingOpacity < 0.35 ? '18 14' : undefined}
            />
            <path
              d={sketchRoundedRect(580, 195, 760, 345, 36, 92, 1.2)}
              fill="url(#sepiaArmorHatch)"
              opacity={
                frame >= 720
                  ? Math.min(0.4, casingOpacity * 0.4)
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

          {/* Mitad Inferior */}
          <g transform={`translate(0, ${(clamshellOpen * 175).toFixed(1)})`}>
            <path
              d={sketchRoundedRect(580, 540, 760, 345, 36, 93, 1.8)}
              fill={
                casingOpacity > 0.45
                  ? frame >= 720
                    ? 'rgba(234, 219, 194, 0.52)'
                    : '#E3D1B0'
                  : 'none'
              }
              stroke={inkDark}
              strokeWidth={casingOpacity > 0.4 ? 7 : 2.8}
              strokeDasharray={casingOpacity < 0.35 ? '18 14' : undefined}
            />
            <path
              d={sketchRoundedRect(580, 540, 760, 345, 36, 94, 1.2)}
              fill="url(#sepiaArmorHatch)"
              opacity={
                frame >= 720
                  ? Math.min(0.4, casingOpacity * 0.4)
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
