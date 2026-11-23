import React from 'react';
import {
  ALL_MOTOR_STATES,
  MotorFrameState,
  sketchLine,
  smoothstep,
} from './handDrawnUtils';

interface Props {
  state: MotorFrameState;
}

/**
 * Capa 1 (Manim Scientific Ribbon — v2.0 Minimalista y Dopaminérgico)
 * En vez de un recuadro estático permanente, aparece únicamente en la Escena 5 (Conmutación 180°, frames 540..715)
 * como un trazo libre de carboncillo y cobre directamente sobre el papel pergamino.
 */
export const ManimOscilloscopeLayer: React.FC<Props> = ({state}) => {
  const {frame} = state;

  const enterP = smoothstep(542, 565, frame);
  const exitP = 1 - smoothstep(695, 718, frame);
  const opacity = enterP * exitP;

  if (opacity <= 0.01) return null;

  const ox0 = 490;
  const ox1 = 1430;
  const oyMid = 965;
  const ampY = 58;

  const maxSamples = 95;
  const startIdx = Math.max(535, frame - maxSamples + 1);
  const samples = ALL_MOTOR_STATES.slice(startIdx, frame + 1);

  const tauPoints: string[] = [];
  const sparkDots: {x: number; y: number}[] = [];

  samples.forEach((item, idx) => {
    const u = idx / Math.max(1, maxSamples - 1);
    const x = ox0 + u * (ox1 - ox0);
    const yTau = oyMid - item.torqueNorm * ampY;
    tauPoints.push(`${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yTau.toFixed(1)}`);

    if (item.commutationFlash > 0.72 && item.frame % 3 === 0) {
      sparkDots.push({x, y: oyMid});
    }
  });

  const lastSample = samples[samples.length - 1];
  const lastU = Math.max(0, samples.length - 1) / Math.max(1, maxSamples - 1);
  const tipX = ox0 + lastU * (ox1 - ox0);
  const tipY = oyMid - (lastSample ? lastSample.torqueNorm : 0) * ampY;

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        pointerEvents: 'none',
      }}
    >
      {/* Línea base dibujada a lápiz sin cajas contenedoras */}
      <path
        d={sketchLine(ox0, oyMid, ox1, oyMid, 77, 1.3, 6)}
        stroke="#5C3F24"
        strokeWidth={3.5}
        strokeDasharray="14 8"
        fill="none"
      />

      {/* Onda de pulso de torque rectificado |sin(θ)| */}
      {tauPoints.length > 1 && (
        <path
          d={tauPoints.join(' ')}
          stroke="#991B1B"
          strokeWidth={6.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}

      {/* Puntos de chispazo cada 180° */}
      {sparkDots.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r={7}
          fill="#D97706"
          stroke="#362312"
          strokeWidth={2.5}
        />
      ))}

      {/* Punta activa */}
      {samples.length > 0 && (
        <circle
          cx={tipX}
          cy={tipY}
          r={10}
          fill="#D97706"
          stroke="#362312"
          strokeWidth={3}
        />
      )}
    </svg>
  );
};
