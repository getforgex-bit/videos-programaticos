import React from 'react';
import {
  MotorFrameState,
  clamp,
  sketchArrow,
  sketchEllipseArc,
  sketchLine,
  smoothstep,
} from './handDrawnUtils';

interface Props {
  state: MotorFrameState;
}

/**
 * Motor Isométrico 2.5D dibujado a mano sobre pizarrón (Idea A · Estilo 2 Whiteboard).
 * Incluye:
 * - Ejes de construcción y cotas de ingeniería
 * - Carcasa aleteada exterior (Trazo progresivo Acto I -> Transparente Acto II -> Reconstrucción Acto V)
 * - Estator magnético (Polos N rojo y S azul con achurado a mano)
 * - Rotor bobinado 3D con espiras de cobre y pulsos de corriente eléctrica (I)
 * - Colector de delgas (conmutador) y escobillas de carbón con chispazo de inversión a 180°
 * - Vectores de Fuerza de Lorentz (F = I L x B) y arcos de Par Motor (τ)
 * - Cursor de marcador dibujando en vivo durante las fases de construcción
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

  // Proyección isométrica del eje longitudinal del motor
  // Centro geométrico del conjunto en el pizarrón: (960, 435)
  const axisAngle = 0.14; // Ligera inclinación isométrica (8 grados)
  const cosA = Math.cos(axisAngle);
  const sinA = Math.sin(axisAngle);

  // Convierte coordenadas cilíndricas del motor (z: posición a lo largo del eje, y, x_depth) a 2D pantalla
  const cx0 = 955;
  const cy0 = 430;
  const isoPoint = (zAxial: number, rHoriz: number, rVert: number) => {
    // Perspectiva 3/4: zAxial avanza de izquierda-atrás (-240) a derecha-frente (+240)
    const x = cx0 + zAxial * cosA + rHoriz * 0.56;
    const y = cy0 + zAxial * sinA + rVert;
    return {x, y};
  };

  // Progreso de trazado inicial en Acto I (frames 5 a 85)
  const drawAxesP = smoothstep(2, 28, frame);
  const drawCasingOutlineP = smoothstep(15, 65, frame);
  const drawFinsP = smoothstep(42, 85, frame);
  const drawShaftP = smoothstep(55, 92, frame);

  // Barrido de Rayos X en Acto II (frames 185 a 255) y Reconstrucción en Acto V (frames 735 a 835)
  const xrayScanP = smoothstep(185, 255, frame);
  const rebuildScanP = smoothstep(735, 835, frame);

  // Progreso individual de componentes internos en Acto II
  const drawStatorP = smoothstep(205, 265, frame);
  const drawRotorP = smoothstep(245, 305, frame);
  const drawCommutatorP = smoothstep(285, 340, frame);

  // Dimensiones principales del motor
  const zRear = -220;
  const zFront = 185;
  const outerRx = 92;
  const outerRy = 162;

  // Geometría de las bobinas 3D del rotor (3 devanados desfasados para volumen + 1 espira maestra destacada)
  const zCoilRear = -95;
  const zCoilFront = 115;
  const rotorR = 104;

  // Posición 3D proyectada de los dos conductores activos de la espira maestra (A y B opuestos 180°)
  const c1Horiz = Math.cos(thetaRad) * rotorR;
  const c1Vert = Math.sin(thetaRad) * rotorR;
  const c2Horiz = -c1Horiz;
  const c2Vert = -c1Vert;

  const p1Rear = isoPoint(zCoilRear, c1Horiz, c1Vert);
  const p1Front = isoPoint(zCoilFront, c1Horiz, c1Vert);
  const p2Rear = isoPoint(zCoilRear, c2Horiz, c2Vert);
  const p2Front = isoPoint(zCoilFront, c2Horiz, c2Vert);

  // Seleccionamos el conductor superior (menor y) para el vector ↑F que empuja hacia arriba/derecha
  // y el conductor inferior (mayor y) para el vector ↓-F que empuja hacia abajo/izquierda,
  // evitando que las flechas se crucen por el centro de la bobina cuando θ ≈ 90° o 270°.
  const p1Mid = {
    x: (p1Rear.x + p1Front.x) * 0.5,
    y: (p1Rear.y + p1Front.y) * 0.5,
  };
  const p2Mid = {
    x: (p2Rear.x + p2Front.x) * 0.5,
    y: (p2Rear.y + p2Front.y) * 0.5,
  };

  const leftAnchor = p1Mid.y <= p2Mid.y ? p1Mid : p2Mid;
  const rightAnchor = p1Mid.y <= p2Mid.y ? p2Mid : p1Mid;

  // Magnitud visual de la Fuerza de Lorentz F = I (L x B) modulada por el ángulo de la espira
  const forceScale = (0.42 + 0.58 * Math.abs(Math.sin(thetaRad))) * lorentzProgress;
  const forceLen = 86 * forceScale;

  const arrowUp = sketchArrow(
    leftAnchor.x,
    leftAnchor.y,
    leftAnchor.x,
    leftAnchor.y - forceLen,
    18,
    301,
  );
  const arrowDown = sketchArrow(
    rightAnchor.x,
    rightAnchor.y,
    rightAnchor.x,
    rightAnchor.y + forceLen,
    18,
    302,
  );

  // Líneas de aletas de enfriamiento sobre la carcasa exterior
  const finLines: string[] = [];
  for (let i = -4; i <= 4; i++) {
    const angle = (i * 18 * Math.PI) / 180;
    const pStart = isoPoint(
      zRear + 28,
      Math.cos(angle) * outerRx * 0.4,
      Math.sin(angle) * outerRy,
    );
    const pEnd = isoPoint(
      zFront - 24,
      Math.cos(angle) * outerRx * 0.4,
      Math.sin(angle) * outerRy,
    );
    finLines.push(sketchLine(pStart.x, pStart.y, pEnd.x, pEnd.y, 40 + i, 1.1, 2));
  }

  // Líneas de campo magnético B (de Polo Norte izquierdo a Polo Sur derecho)
  const bLines: {shaft: string; head: string; yOff: number}[] = [];
  for (let k = -2; k <= 2; k++) {
    const yOff = k * 42;
    const bx1 = cx0 - 175;
    const bx2 = cx0 + 155;
    const by = cy0 + yOff;
    const arr = sketchArrow(bx1, by, bx2, by, 14, 500 + k);
    bLines.push({...arr, yOff});
  }

  // Posición del marcador animado (Dry-Erase Marker Nib) cuando está dibujando trazos nuevos
  let markerTip: {x: number; y: number; color: string; label: string} | null = null;
  if (frame >= 5 && frame <= 85) {
    const a = ((frame - 5) / 80) * Math.PI * 2;
    markerTip = {
      x: cx0 + Math.cos(a) * 190,
      y: cy0 + Math.sin(a) * 155,
      color: '#181A1F',
      label: 'Trazando carcasa y eje...',
    };
  } else if (frame >= 205 && frame <= 335) {
    const a = ((frame - 205) / 130) * Math.PI * 3;
    markerTip = {
      x: cx0 + Math.cos(a) * 125,
      y: cy0 + Math.sin(a) * 105,
      color: frame < 260 ? '#DC2626' : '#D97706',
      label: frame < 260 ? 'Dibujando Estator (N/S)...' : 'Dibujando Bobinado y Colector...',
    };
  } else if (frame >= 365 && frame <= 495) {
    const u = (frame - 365) / 130;
    markerTip = {
      x: cx0 - 160 + u * 320,
      y: cy0 - 60 + Math.sin(u * 10) * 75,
      color: frame < 435 ? '#1D4ED8' : '#059669',
      label: frame < 435 ? 'Trazando Campo Magnético B...' : 'Calculando Fuerza de Lorentz F...',
    };
  } else if (frame >= 735 && frame <= 835) {
    const u = (frame - 735) / 100;
    markerTip = {
      x: cx0 - 210 + u * 420,
      y: cy0 - 150 + Math.sin(u * 14) * 130,
      color: '#181A1F',
      label: 'Reconstruyendo carcasa mecánica...',
    };
  }

  const rearCenter = isoPoint(zRear, 0, 0);
  const frontCenter = isoPoint(zFront, 0, 0);
  const shaftTip = isoPoint(zFront + 145, 0, 0);
  const commCenter = isoPoint(zRear + 48, 0, 0);

  // En Acto V (frame >= 735), dejamos una ventana de corte arquitectónico (35%) para seguir viendo el interior activo
  const isReconstructed = frame >= 735;

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{position: 'absolute', top: 0, left: 0, pointerEvents: 'none'}}
    >
      <defs>
        {/* Patrón de achurado a mano para acero/carcasa */}
        <pattern
          id="charcoalHatch"
          width="14"
          height="14"
          patternTransform="rotate(35 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="14"
            stroke="#181A1F"
            strokeWidth="1.6"
            strokeOpacity="0.22"
          />
        </pattern>
        {/* Achurado rojo para Polo Norte */}
        <pattern
          id="redHatch"
          width="12"
          height="12"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="12"
            stroke="#DC2626"
            strokeWidth="2"
            strokeOpacity="0.26"
          />
        </pattern>
        {/* Achurado azul para Polo Sur */}
        <pattern
          id="blueHatch"
          width="12"
          height="12"
          patternTransform="rotate(-45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="12"
            stroke="#1D4ED8"
            strokeWidth="2"
            strokeOpacity="0.26"
          />
        </pattern>
      </defs>

      {/* =====================================================================
          1. EJES DE CONSTRUCCIÓN ISOMÉTRICOS Y COTAS DE INGENIERÍA (GRAFITO)
         ===================================================================== */}
      <g opacity={drawAxesP}>
        {/* Eje longitudinal central (Centerline dash-dot) */}
        <path
          d={sketchLine(
            cx0 - 340 * cosA,
            cy0 - 340 * sinA,
            cx0 + 390 * cosA,
            cy0 + 390 * sinA,
            1,
            0.8,
            0,
          )}
          stroke="#64748B"
          strokeWidth={1.8}
          strokeDasharray="18 8 4 8"
          fill="none"
        />
        {/* Eje vertical de simetría */}
        <path
          d={sketchLine(cx0, cy0 - 235, cx0, cy0 + 235, 2, 0.8, 0)}
          stroke="#64748B"
          strokeWidth={1.5}
          strokeDasharray="10 8"
          fill="none"
        />
        {/* Cota superior de longitud de carcasa (L = 210 mm) */}
        <path
          d={sketchLine(
            rearCenter.x,
            rearCenter.y - outerRy - 36,
            frontCenter.x,
            frontCenter.y - outerRy - 36,
            3,
            0.9,
            0,
          )}
          stroke="#64748B"
          strokeWidth={1.6}
          fill="none"
          pathLength={1000}
          strokeDasharray={1000}
          strokeDashoffset={1000 * (1 - drawAxesP)}
        />
        <line
          x1={rearCenter.x}
          y1={rearCenter.y - outerRy - 46}
          x2={rearCenter.x}
          y2={rearCenter.y - outerRy - 14}
          stroke="#64748B"
          strokeWidth={1.5}
        />
        <line
          x1={frontCenter.x}
          y1={frontCenter.y - outerRy - 46}
          x2={frontCenter.x}
          y2={frontCenter.y - outerRy - 14}
          stroke="#64748B"
          strokeWidth={1.5}
        />
        <text
          x={(rearCenter.x + frontCenter.x) * 0.5}
          y={(rearCenter.y + frontCenter.y) * 0.5 - outerRy - 45}
          textAnchor="middle"
          fill="#475569"
          fontFamily="'Comic Neue', sans-serif"
          fontWeight="bold"
          fontSize={17}
        >
          ← L = 210 mm (CÁMARA DEL ESTATOR) →
        </text>
      </g>

      {/* =====================================================================
          2. ANATOMÍA INTERNA DEL MOTOR (Revelada en Acto II, activa hasta Acto V)
         ===================================================================== */}
      {internalsVisibility > 0.01 && (
        <g opacity={internalsVisibility}>
          {/* 2A. ESTATOR MAGNÉTICO: POLO NORTE (ROJO, IZQUIERDA) Y POLO SUR (AZUL, DERECHA) */}
          <g opacity={drawStatorP}>
            {/* Polo Norte (N) — Imán curvo izquierdo */}
            <path
              d={`M ${cx0 - 155} ${cy0 - 125} A 145 145 0 0 0 ${cx0 - 155} ${cy0 + 125} L ${cx0 - 115} ${cy0 + 98} A 110 110 0 0 1 ${cx0 - 115} ${cy0 - 98} Z`}
              fill="url(#redHatch)"
              stroke="#DC2626"
              strokeWidth={3.5}
              strokeLinejoin="round"
            />
            <rect
              x={cx0 - 188}
              y={cy0 - 132}
              width={40}
              height={40}
              rx={8}
              fill="#FEE2E2"
              stroke="#DC2626"
              strokeWidth={3}
            />
            <text
              x={cx0 - 168}
              y={cy0 - 102}
              textAnchor="middle"
              fill="#DC2626"
              fontFamily="'Humor Sans', cursive"
              fontSize={28}
              fontWeight="bold"
            >
              N
            </text>

            {/* Polo Sur (S) — Imán curvo derecho */}
            <path
              d={`M ${cx0 + 145} ${cy0 - 125} A 145 145 0 0 1 ${cx0 + 145} ${cy0 + 125} L ${cx0 + 105} ${cy0 + 98} A 110 110 0 0 0 ${cx0 + 105} ${cy0 - 98} Z`}
              fill="url(#blueHatch)"
              stroke="#1D4ED8"
              strokeWidth={3.5}
              strokeLinejoin="round"
            />
            <rect
              x={cx0 + 142}
              y={cy0 - 132}
              width={40}
              height={40}
              rx={8}
              fill="#DBEAFE"
              stroke="#1D4ED8"
              strokeWidth={3}
            />
            <text
              x={cx0 + 162}
              y={cy0 - 102}
              textAnchor="middle"
              fill="#1D4ED8"
              fontFamily="'Humor Sans', cursive"
              fontSize={28}
              fontWeight="bold"
            >
              S
            </text>
          </g>

          {/* 2B. LÍNEAS DE CAMPO MAGNÉTICO B (N -> S) en Acto III-V */}
          {bFieldProgress > 0.01 && (
            <g opacity={bFieldProgress}>
              {bLines.map((b, idx) => (
                <g key={idx}>
                  <path
                    d={b.shaft}
                    stroke="#1D4ED8"
                    strokeWidth={2.4}
                    strokeDasharray="12 8"
                    fill="none"
                    pathLength={1000}
                    strokeDashoffset={1000 * (1 - bFieldProgress)}
                  />
                  <path
                    d={b.head}
                    stroke="#1D4ED8"
                    strokeWidth={2.8}
                    fill="none"
                  />
                </g>
              ))}
              {/* Etiqueta flotante del vector B */}
              <rect
                x={cx0 - 65}
                y={cy0 - 148}
                width={126}
                height={32}
                rx={6}
                fill="#EFF6FF"
                stroke="#1D4ED8"
                strokeWidth={2}
              />
              <text
                x={cx0 - 2}
                y={cy0 - 126}
                textAnchor="middle"
                fill="#1D4ED8"
                fontFamily="'Comic Neue', sans-serif"
                fontWeight="bold"
                fontSize={19}
              >
                Campo B (N→S)
              </text>
            </g>
          )}

          {/* 2C. NÚCLEO LAMINADO DEL ROTOR Y DEVANADOS SECUNDARIOS */}
          <g opacity={drawRotorP}>
            {/* Cilindro del núcleo ferromagnético del rotor (líneas de construcción) */}
            <path
              d={sketchEllipseArc(
                cx0,
                cy0,
                68,
                96,
                0,
                365,
                19,
                1.0,
              )}
              stroke="#64748B"
              strokeWidth={2}
              strokeDasharray="6 6"
              fill="rgba(226, 232, 240, 0.25)"
            />

            {/* Espira secundaria auxiliar (desfasada 90°) para dar volumen 3D al inducido */}
            {(() => {
              const secRad = thetaRad + Math.PI * 0.5;
              const s1H = Math.cos(secRad) * rotorR * 0.85;
              const s1V = Math.sin(secRad) * rotorR * 0.85;
              const sp1R = isoPoint(zCoilRear, s1H, s1V);
              const sp1F = isoPoint(zCoilFront, s1H, s1V);
              const sp2R = isoPoint(zCoilRear, -s1H, -s1V);
              const sp2F = isoPoint(zCoilFront, -s1H, -s1V);
              return (
                <path
                  d={`M ${sp1R.x} ${sp1R.y} L ${sp1F.x} ${sp1F.y} L ${sp2F.x} ${sp2F.y} L ${sp2R.x} ${sp2R.y} Z`}
                  stroke="#D97706"
                  strokeWidth={2.5}
                  strokeOpacity={0.38}
                  fill="none"
                />
              );
            })()}

            {/* ESPIRA MAESTRA DE COBRE (ROTOR BOBINADO 3D) */}
            <path
              d={`M ${p1Rear.x.toFixed(1)} ${p1Rear.y.toFixed(1)} L ${p1Front.x.toFixed(1)} ${p1Front.y.toFixed(1)} L ${p2Front.x.toFixed(1)} ${p2Front.y.toFixed(1)} L ${p2Rear.x.toFixed(1)} ${p2Rear.y.toFixed(1)} Z`}
              stroke="#B45309"
              strokeWidth={7}
              strokeLinejoin="round"
              fill="rgba(245, 158, 11, 0.10)"
            />
            <path
              d={`M ${p1Rear.x.toFixed(1)} ${p1Rear.y.toFixed(1)} L ${p1Front.x.toFixed(1)} ${p1Front.y.toFixed(1)} L ${p2Front.x.toFixed(1)} ${p2Front.y.toFixed(1)} L ${p2Rear.x.toFixed(1)} ${p2Rear.y.toFixed(1)} Z`}
              stroke="#F59E0B"
              strokeWidth={3.5}
              strokeLinejoin="round"
              fill="none"
            />

            {/* Pulsos animados de Corriente Eléctrica (I) viajando por la espira en Actos III-V */}
            {currentActive > 0.05 && (
              <path
                d={`M ${p1Rear.x.toFixed(1)} ${p1Rear.y.toFixed(1)} L ${p1Front.x.toFixed(1)} ${p1Front.y.toFixed(1)} L ${p2Front.x.toFixed(1)} ${p2Front.y.toFixed(1)} L ${p2Rear.x.toFixed(1)} ${p2Rear.y.toFixed(1)} Z`}
                stroke="#DC2626"
                strokeWidth={5}
                strokeDasharray="18 22"
                strokeDashoffset={-frame * 4.5}
                strokeLinecap="round"
                fill="none"
                opacity={currentActive}
              />
            )}
          </g>

          {/* 2D. COLECTOR DE DELGAS (CONMUTADOR) Y ESCOBILLAS DE CARBÓN */}
          <g opacity={drawCommutatorP}>
            {/* Anillo del colector partido en 2 delgas de cobre */}
            <path
              d={sketchEllipseArc(
                commCenter.x,
                commCenter.y,
                26,
                46,
                thetaDeg,
                thetaDeg + 162,
                77,
                0.8,
              )}
              stroke="#D97706"
              strokeWidth={8}
              fill="none"
            />
            <path
              d={sketchEllipseArc(
                commCenter.x,
                commCenter.y,
                26,
                46,
                thetaDeg + 180,
                thetaDeg + 342,
                78,
                0.8,
              )}
              stroke="#92400E"
              strokeWidth={8}
              fill="none"
            />
            {/* Escobilla superior (+) y escobilla inferior (-) */}
            <rect
              x={commCenter.x - 14}
              y={commCenter.y - 64}
              width={28}
              height={16}
              rx={3}
              fill="#334155"
              stroke="#181A1F"
              strokeWidth={2.5}
            />
            <rect
              x={commCenter.x - 14}
              y={commCenter.y + 48}
              width={28}
              height={16}
              rx={3}
              fill="#334155"
              stroke="#181A1F"
              strokeWidth={2.5}
            />
            {/* Cables de alimentación a las escobillas */}
            <path
              d={sketchLine(
                commCenter.x,
                commCenter.y - 64,
                commCenter.x - 55,
                commCenter.y - 115,
                91,
                1.0,
                0,
              )}
              stroke="#DC2626"
              strokeWidth={3.5}
              fill="none"
            />
            <path
              d={sketchLine(
                commCenter.x,
                commCenter.y + 64,
                commCenter.x - 55,
                commCenter.y + 115,
                92,
                1.0,
                0,
              )}
              stroke="#1D4ED8"
              strokeWidth={3.5}
              fill="none"
            />

            {/* Chispazo de conmutación cuando la espira pasa por el plano vertical (180°) */}
            {commutationFlash > 0.3 && (
              <g opacity={commutationFlash}>
                <circle
                  cx={commCenter.x}
                  cy={commCenter.y - 46}
                  r={14 * commutationFlash}
                  fill="rgba(245, 158, 11, 0.35)"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                />
                <circle
                  cx={commCenter.x}
                  cy={commCenter.y + 46}
                  r={14 * commutationFlash}
                  fill="rgba(245, 158, 11, 0.35)"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                />
              </g>
            )}
          </g>

          {/* 2E. VECTORES DE FUERZA DE LORENTZ (F1 arriba, F2 abajo) Y PAR DE GIRO (τ) */}
          {lorentzProgress > 0.01 && (
            <g opacity={lorentzProgress}>
              {/* Punto de aplicación izquierdo (sube) */}
              <circle
                cx={leftAnchor.x}
                cy={leftAnchor.y}
                r={8}
                fill="#059669"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <path
                d={arrowUp.shaft}
                stroke="#059669"
                strokeWidth={6}
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={arrowUp.head}
                stroke="#059669"
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <rect
                x={leftAnchor.x - 54}
                y={leftAnchor.y - forceLen - 36}
                width={108}
                height={30}
                rx={6}
                fill="#ECFDF5"
                stroke="#059669"
                strokeWidth={2.2}
              />
              <text
                x={leftAnchor.x}
                y={leftAnchor.y - forceLen - 15}
                textAnchor="middle"
                fill="#059669"
                fontFamily="'Comic Neue', sans-serif"
                fontWeight="bold"
                fontSize={18}
              >
                ↑ F = I(L×B)
              </text>

              {/* Punto de aplicación derecho (baja) */}
              <circle
                cx={rightAnchor.x}
                cy={rightAnchor.y}
                r={8}
                fill="#059669"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <path
                d={arrowDown.shaft}
                stroke="#059669"
                strokeWidth={6}
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={arrowDown.head}
                stroke="#059669"
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <rect
                x={rightAnchor.x - 54}
                y={rightAnchor.y + forceLen + 8}
                width={108}
                height={30}
                rx={6}
                fill="#ECFDF5"
                stroke="#059669"
                strokeWidth={2.2}
              />
              <text
                x={rightAnchor.x}
                y={rightAnchor.y + forceLen + 29}
                textAnchor="middle"
                fill="#059669"
                fontFamily="'Comic Neue', sans-serif"
                fontWeight="bold"
                fontSize={18}
              >
                ↓ -F (Par τ)
              </text>

              {/* Arco circular de Torque (τ) indicando rotación continua */}
              <path
                d={sketchEllipseArc(cx0, cy0, 52, 85, -70, 55, 412, 1.0)}
                stroke="#059669"
                strokeWidth={3.5}
                strokeDasharray="8 6"
                fill="none"
              />
            </g>
          )}
        </g>
      )}

      {/* =====================================================================
          3. CARCASA EXTERIOR ALETEADA Y EJE MECÁNICO
          (Sólida en Acto I -> Fantasma transparente en Actos II-IV -> Reconstruida con ventana en Acto V)
         ===================================================================== */}
      <g>
        {/* Relleno achurado de la carcasa (se desvanece cuando la carcasa se vuelve transparente) */}
        <path
          d={`M ${rearCenter.x} ${rearCenter.y - outerRy} L ${frontCenter.x} ${frontCenter.y - outerRy} A ${outerRx} ${outerRy} 0 0 1 ${frontCenter.x} ${frontCenter.y + outerRy} L ${rearCenter.x} ${rearCenter.y + outerRy} A ${outerRx} ${outerRy} 0 0 1 ${rearCenter.x} ${rearCenter.y - outerRy} Z`}
          fill="url(#charcoalHatch)"
          opacity={
            isReconstructed
              ? Math.max(0.18, casingOpacity * 0.45)
              : Math.max(0, (casingOpacity - 0.18) * 0.95)
          }
        />

        {/* Contorno cilíndrico superior e inferior de la carcasa */}
        <path
          d={sketchLine(
            rearCenter.x,
            rearCenter.y - outerRy,
            frontCenter.x,
            frontCenter.y - outerRy,
            10,
            1.4,
            4,
          )}
          stroke="#181A1F"
          strokeWidth={casingOpacity > 0.4 ? 4 : 2.2}
          strokeOpacity={Math.max(0.25, casingOpacity)}
          strokeDasharray={casingOpacity < 0.35 ? '12 8' : undefined}
          fill="none"
          pathLength={1000}
          strokeDashoffset={1000 * (1 - drawCasingOutlineP)}
        />
        <path
          d={sketchLine(
            rearCenter.x,
            rearCenter.y + outerRy,
            frontCenter.x,
            frontCenter.y + outerRy,
            11,
            1.4,
            4,
          )}
          stroke="#181A1F"
          strokeWidth={casingOpacity > 0.4 ? 4 : 2.2}
          strokeOpacity={Math.max(0.25, casingOpacity)}
          strokeDasharray={casingOpacity < 0.35 ? '12 8' : undefined}
          fill="none"
          pathLength={1000}
          strokeDashoffset={1000 * (1 - drawCasingOutlineP)}
        />

        {/* Tapa trasera (Rear End-Bell) */}
        <path
          d={sketchEllipseArc(
            rearCenter.x,
            rearCenter.y,
            outerRx,
            outerRy,
            90,
            270,
            12,
            1.3,
          )}
          stroke="#181A1F"
          strokeWidth={casingOpacity > 0.4 ? 4 : 2.2}
          strokeOpacity={Math.max(0.25, casingOpacity)}
          strokeDasharray={casingOpacity < 0.35 ? '10 8' : undefined}
          fill="none"
          pathLength={1000}
          strokeDashoffset={1000 * (1 - drawCasingOutlineP)}
        />

        {/* Tapa delantera (Front End-Bell) */}
        <path
          d={sketchEllipseArc(
            frontCenter.x,
            frontCenter.y,
            outerRx,
            outerRy,
            0,
            365,
            13,
            1.3,
          )}
          stroke="#181A1F"
          strokeWidth={casingOpacity > 0.4 ? 3.8 : 2.2}
          strokeOpacity={Math.max(0.28, casingOpacity)}
          strokeDasharray={casingOpacity < 0.35 ? '10 8' : undefined}
          fill={
            casingOpacity > 0.65 && !isReconstructed
              ? 'rgba(247, 245, 238, 0.72)'
              : 'none'
          }
          pathLength={1000}
          strokeDashoffset={1000 * (1 - drawCasingOutlineP)}
        />

        {/* Aletas de enfriamiento (Cooling Fins) sobre la carcasa */}
        <g opacity={drawFinsP * Math.max(0.18, casingOpacity)}>
          {finLines.map((fl, idx) => {
            // En Acto V (Reconstrucción) dejamos una ventana central abierta (índices -1, 0, 1) para ver el rotor
            if (isReconstructed && idx >= 3 && idx <= 5) {
              return (
                <path
                  key={idx}
                  d={fl}
                  stroke="#64748B"
                  strokeWidth={1.6}
                  strokeDasharray="8 10"
                  fill="none"
                />
              );
            }
            return (
              <path
                key={idx}
                d={fl}
                stroke="#181A1F"
                strokeWidth={2.4}
                strokeDasharray={casingOpacity < 0.35 ? '8 8' : undefined}
                fill="none"
                pathLength={1000}
                strokeDashoffset={1000 * (1 - drawFinsP)}
              />
            );
          })}
        </g>

        {/* Base / Patas de montaje atornilladas */}
        <g opacity={drawFinsP * Math.max(0.3, casingOpacity)}>
          <path
            d={sketchLine(
              rearCenter.x - 25,
              rearCenter.y + outerRy + 12,
              frontCenter.x + 35,
              frontCenter.y + outerRy + 12,
              21,
              1.2,
              4,
            )}
            stroke="#181A1F"
            strokeWidth={3.5}
            fill="none"
          />
          <path
            d={sketchLine(
              rearCenter.x + 15,
              rearCenter.y + outerRy,
              rearCenter.x - 10,
              rearCenter.y + outerRy + 12,
              22,
              1.0,
              0,
            )}
            stroke="#181A1F"
            strokeWidth={3}
            fill="none"
          />
          <path
            d={sketchLine(
              frontCenter.x - 15,
              frontCenter.y + outerRy,
              frontCenter.x + 20,
              frontCenter.y + outerRy + 12,
              23,
              1.0,
              0,
            )}
            stroke="#181A1F"
            strokeWidth={3}
            fill="none"
          />
        </g>

        {/* EJE DE SALIDA (SHAFT) Y ARCOS DE ROTACIÓN MECÁNICA */}
        <g opacity={drawShaftP}>
          {/* Eje central atravesando el motor cuando es transparente */}
          <path
            d={sketchLine(
              rearCenter.x - 25,
              rearCenter.y - 4,
              frontCenter.x,
              frontCenter.y,
              30,
              0.7,
              0,
            )}
            stroke="#334155"
            strokeWidth={7}
            strokeOpacity={internalsVisibility * 0.75}
            fill="none"
          />

          {/* Rodamiento delantero (Front Bearing Collar) */}
          <path
            d={sketchEllipseArc(
              frontCenter.x,
              frontCenter.y,
              22,
              38,
              0,
              365,
              31,
              0.9,
            )}
            stroke="#181A1F"
            strokeWidth={3.5}
            fill="#E2E8F0"
          />

          {/* Eje saliente frontal (Output Shaft) */}
          <path
            d={sketchLine(
              frontCenter.x,
              frontCenter.y - 13,
              shaftTip.x,
              shaftTip.y - 13,
              32,
              0.8,
              0,
            )}
            stroke="#181A1F"
            strokeWidth={3.5}
            fill="none"
          />
          <path
            d={sketchLine(
              frontCenter.x,
              frontCenter.y + 13,
              shaftTip.x,
              shaftTip.y + 13,
              33,
              0.8,
              0,
            )}
            stroke="#181A1F"
            strokeWidth={3.5}
            fill="none"
          />
          <path
            d={sketchEllipseArc(
              shaftTip.x,
              shaftTip.y,
              9,
              14,
              0,
              365,
              34,
              0.6,
            )}
            stroke="#181A1F"
            strokeWidth={3}
            fill="#94A3B8"
          />

          {/* Indicador radial giratorio en la punta del eje (chavetero / bandera mecánica) */}
          {(() => {
            const flagX = shaftTip.x + Math.cos(thetaRad) * 26;
            const flagY = shaftTip.y + Math.sin(thetaRad) * 44;
            return (
              <g>
                <line
                  x1={shaftTip.x}
                  y1={shaftTip.y}
                  x2={flagX}
                  y2={flagY}
                  stroke="#DC2626"
                  strokeWidth={4.5}
                  strokeLinecap="round"
                />
                <circle
                  cx={flagX}
                  cy={flagY}
                  r={5.5}
                  fill="#DC2626"
                />
              </g>
            );
          })()}

          {/* Arcos cinéticos de velocidad alrededor del eje cuando RPM > 100 */}
          {rpm > 100 && (
            <g opacity={clamp(rpm / 1500, 0.25, 0.95)}>
              <path
                d={sketchEllipseArc(
                  shaftTip.x + 8,
                  shaftTip.y,
                  36,
                  62,
                  thetaDeg,
                  thetaDeg + 115,
                  35,
                  1.1,
                )}
                stroke="#0D6EFD"
                strokeWidth={3}
                strokeDasharray="10 6"
                fill="none"
              />
              <path
                d={sketchEllipseArc(
                  shaftTip.x + 8,
                  shaftTip.y,
                  46,
                  78,
                  thetaDeg + 180,
                  thetaDeg + 285,
                  36,
                  1.1,
                )}
                stroke="#181A1F"
                strokeWidth={2.5}
                strokeDasharray="8 8"
                fill="none"
              />
            </g>
          )}
        </g>
      </g>

      {/* =====================================================================
          4. LÍNEA DE ESCANEO X-RAY (Acto II) Y RECONSTRUCCIÓN (Acto V)
         ===================================================================== */}
      {xrayScanP > 0.01 && xrayScanP < 0.99 && (
        <g>
          {(() => {
            const scanX = 650 + xrayScanP * 640;
            return (
              <>
                <line
                  x1={scanX}
                  y1={cy0 - 210}
                  x2={scanX}
                  y2={cy0 + 210}
                  stroke="#0D6EFD"
                  strokeWidth={3.5}
                  strokeDasharray="10 6"
                />
                <rect
                  x={scanX - 75}
                  y={cy0 - 236}
                  width={150}
                  height={26}
                  rx={5}
                  fill="#DBEAFE"
                  stroke="#1D4ED8"
                  strokeWidth={2}
                />
                <text
                  x={scanX}
                  y={cy0 - 218}
                  textAnchor="middle"
                  fill="#1D4ED8"
                  fontFamily="'Comic Neue', sans-serif"
                  fontWeight="bold"
                  fontSize={15}
                >
                  MODO RAYOS-X
                </text>
              </>
            );
          })()}
        </g>
      )}

      {rebuildScanP > 0.01 && rebuildScanP < 0.99 && (
        <g>
          {(() => {
            const scanX = 1290 - rebuildScanP * 640;
            return (
              <>
                <line
                  x1={scanX}
                  y1={cy0 - 210}
                  x2={scanX}
                  y2={cy0 + 210}
                  stroke="#059669"
                  strokeWidth={3.5}
                  strokeDasharray="10 6"
                />
                <rect
                  x={scanX - 90}
                  y={cy0 - 236}
                  width={180}
                  height={26}
                  rx={5}
                  fill="#ECFDF5"
                  stroke="#059669"
                  strokeWidth={2}
                />
                <text
                  x={scanX}
                  y={cy0 - 218}
                  textAnchor="middle"
                  fill="#059669"
                  fontFamily="'Comic Neue', sans-serif"
                  fontWeight="bold"
                  fontSize={15}
                >
                  RECONSTRUYENDO
                </text>
              </>
            );
          })()}
        </g>
      )}

      {/* =====================================================================
          5. CURSOR DE MARCADOR DIBUJANDO EN VIVO (ESTILO WHITEBOARD)
         ===================================================================== */}
      {markerTip && (
        <g transform={`translate(${markerTip.x.toFixed(1)}, ${markerTip.y.toFixed(1)})`}>
          {/* Halo de tinta húmeda */}
          <circle cx={0} cy={0} r={9} fill={markerTip.color} opacity={0.22} />
          {/* Cuerpo inclinado del marcador de pizarrón */}
          <g transform="rotate(-38)">
            <polygon
              points="0,0 10,-6 18,-6 14,6 0,0"
              fill={markerTip.color}
            />
            <rect
              x={14}
              y={-9}
              width={68}
              height={18}
              rx={4}
              fill="#FFFFFF"
              stroke="#181A1F"
              strokeWidth={2.5}
            />
            <rect
              x={14}
              y={-9}
              width={16}
              height={18}
              fill={markerTip.color}
            />
          </g>
        </g>
      )}
    </svg>
  );
};
