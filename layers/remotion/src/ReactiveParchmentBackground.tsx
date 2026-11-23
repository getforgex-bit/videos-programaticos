import React from 'react';
import {MotorFrameState, clamp} from './handDrawnUtils';

interface Props {
  state: MotorFrameState;
}

interface IronFiling {
  id: number;
  x: number;
  y: number;
  baseAngle: number;
  dipoleAngle: number;
  len: number;
  ringNorm: number;
}

/**
 * Precalcula 68 limaduras de grafito/hierro distribuidas en la periferia del papel pergamino
 * (fuera del área central del motor para jamás sobrecargar ni ensuciar el dibujo principal).
 */
const buildPeripheralFilings = (): IronFiling[] => {
  const filings: IronFiling[] = [];
  const cx = 960;
  const cy = 540;

  // Dos anillos elípticos periféricos alrededor de los imanes en herradura
  const rings = [
    {count: 32, rx: 835, ry: 445},
    {count: 36, rx: 910, ry: 495},
  ];

  let id = 0;
  rings.forEach((ring, rIdx) => {
    for (let i = 0; i < ring.count; i++) {
      const a = (i / ring.count) * Math.PI * 2 + rIdx * 0.09;
      // Evitamos la zona central superior/inferior de los carteles de título
      if (Math.abs(Math.cos(a)) < 0.28) continue;

      const jx = Math.sin(i * 7.3 + rIdx) * 18;
      const jy = Math.cos(i * 5.1 + rIdx) * 14;
      const x = cx + Math.cos(a) * ring.rx + jx;
      const y = cy + Math.sin(a) * ring.ry + jy;

      // Ángulo en reposo (disperso orgánicamente sobre el papel)
      const baseAngle = ((i * 57 + rIdx * 83) % 180) - 90;

      // Ángulo magnético dipolar (orientado desde Polo N izquierdo hacia Polo S derecho)
      const dxN = x - 320;
      const dyN = y - 540;
      const dxS = 1600 - x;
      const dyS = 540 - y;
      const rN = Math.hypot(dxN, dyN) + 1;
      const rS = Math.hypot(dxS, dyS) + 1;
      const bx = dxN / (rN * rN) + dxS / (rS * rS);
      const by = dyN / (rN * rN) + dyS / (rS * rS);
      const dipoleAngle = (Math.atan2(by, bx) * 180) / Math.PI;

      filings.push({
        id: id++,
        x,
        y,
        baseAngle,
        dipoleAngle,
        len: 14 + (i % 3) * 5,
        ringNorm: rIdx,
      });
    }
  });

  return filings;
};

const PERIPHERAL_FILINGS = buildPeripheralFilings();

/**
 * Fondo de Papel Pergamino Reactivo y Sutil (v3.0):
 * - Reacciona a las RPM del motor con ondas estacionarias sutiles sobre el papel.
 * - Reacciona al Campo Magnético (B) alineando sutilmente las limaduras de grafito periféricas.
 * - Reacciona al Torque (τ) y a la Conmutación (180°) con anillos de compás Da Vinci que respiran y giran en contrafase.
 */
export const ReactiveParchmentBackground: React.FC<Props> = ({state}) => {
  const {
    frame,
    rpm,
    thetaDeg,
    bFieldProgress,
    currentActive,
    lorentzProgress,
    commutationFlash,
    torqueNorm,
  } = state;

  const rpmFactor = clamp(rpm / 3000, 0, 1);

  // Expansión sutil de los anillos de compás de fondo con el par motor y la conmutación
  const compassScale = 1 + 0.025 * torqueNorm + 0.018 * commutationFlash;
  const compassRot = -thetaDeg * 0.15;

  // Onda expansiva sutil sobre el papel cada medio giro (180°) o durante el arranque
  const rippleProgress = ((frame * (0.015 + rpmFactor * 0.025)) % 1 + 1) % 1;
  const rippleRadius = 320 + rippleProgress * 640;
  const rippleOpacity =
    (1 - rippleProgress) * (0.12 * rpmFactor + 0.16 * currentActive);

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
    >
      {/* 1. Halo cálido reactivo en el papel pergamino cuando fluye corriente y fuerza de Lorentz */}
      {(currentActive > 0.05 || rpmFactor > 0.1) && (
        <ellipse
          cx={960}
          cy={540}
          rx={560 + 65 * torqueNorm}
          ry={390 + 45 * torqueNorm}
          fill={
            lorentzProgress > 0.2
              ? 'rgba(217, 119, 6, 0.075)'
              : 'rgba(153, 27, 27, 0.055)'
          }
        />
      )}

      {/* 2. Anillos de Compás y Transportador Da Vinci grabados sutilmente en el papel */}
      <g
        transform={`translate(960, 540) scale(${compassScale.toFixed(4)}) rotate(${compassRot.toFixed(2)})`}
        opacity={0.13 + 0.08 * bFieldProgress}
      >
        <circle
          cx={0}
          cy={0}
          r={430}
          fill="none"
          stroke="#5C3F24"
          strokeWidth={1.6}
          strokeDasharray="10 14"
        />
        <circle
          cx={0}
          cy={0}
          r={590}
          fill="none"
          stroke="#5C3F24"
          strokeWidth={1.4}
          strokeDasharray="24 12 4 12"
        />
        <circle
          cx={0}
          cy={0}
          r={760}
          fill="none"
          stroke="#5C3F24"
          strokeWidth={1.2}
          strokeDasharray="6 18"
        />
        {/* Marcas de graduación del compás cada 30° */}
        {Array.from({length: 12}).map((_, idx) => {
          const ang = (idx * 30 * Math.PI) / 180;
          const x1 = Math.cos(ang) * 575;
          const y1 = Math.sin(ang) * 575;
          const x2 = Math.cos(ang) * 605;
          const y2 = Math.sin(ang) * 605;
          return (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#5C3F24"
              strokeWidth={1.8}
            />
          );
        })}
      </g>

      {/* 3. Onda acústica / electromagnética sutil que viaja por el papel pergamino */}
      {rippleOpacity > 0.01 && (
        <ellipse
          cx={960}
          cy={540}
          rx={rippleRadius}
          ry={rippleRadius * 0.62}
          fill="none"
          stroke={bFieldProgress > 0.3 ? '#1E3A8A' : '#5C3F24'}
          strokeWidth={2.2}
          strokeDasharray="18 14"
          opacity={rippleOpacity}
        />
      )}

      {/* 4. Limaduras de Grafito Periféricas: vibran con las RPM y se alinean con el Campo Magnético B */}
      <g>
        {PERIPHERAL_FILINGS.map((f) => {
          // Interpola suavemente entre el ángulo en reposo y el ángulo dipolar magnético cuando B se activa
          const alignAngle =
            f.baseAngle * (1 - bFieldProgress) + f.dipoleAngle * bFieldProgress;

          // Vibración acústica sutil cuando el motor gira a altas RPM
          const vib =
            rpmFactor * 3.2 * Math.sin(frame * 0.55 + f.id * 1.7) +
            commutationFlash * 5.0 * Math.cos(f.id);

          const curLen = f.len * (1 + 0.35 * bFieldProgress + 0.25 * torqueNorm);
          const alpha =
            0.16 +
            0.14 * rpmFactor +
            0.22 * bFieldProgress +
            0.15 * commutationFlash;

          return (
            <g
              key={f.id}
              transform={`translate(${(f.x + vib).toFixed(1)}, ${(f.y + vib * 0.6).toFixed(1)}) rotate(${alignAngle.toFixed(1)})`}
              opacity={clamp(alpha, 0.12, 0.55)}
            >
              <line
                x1={-curLen * 0.5}
                y1={0}
                x2={curLen * 0.5}
                y2={0}
                stroke={bFieldProgress > 0.4 ? '#2B3A55' : '#4A3219'}
                strokeWidth={2.4}
                strokeLinecap="round"
              />
              <circle
                cx={curLen * 0.5}
                cy={0}
                r={1.8}
                fill={bFieldProgress > 0.4 ? '#1E3A8A' : '#362312'}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
};
