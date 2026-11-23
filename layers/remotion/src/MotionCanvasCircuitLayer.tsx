import React from 'react';
import {MotorFrameState, smoothstep} from './handDrawnUtils';

interface Props {
  state: MotorFrameState;
}

/**
 * Capa 2 (Motion Canvas Vector Energy Overlay — v2.0 Minimalista)
 * Se activa en la Escena 3 (frames 240..375) cuando la cámara hace Macro Zoom a los terminales,
 * mostrando los pulsos de corriente (+I / -I) que entran por las escobillas sin saturar la pantalla con cajas.
 */
export const MotionCanvasCircuitLayer: React.FC<Props> = ({state}) => {
  const {frame, currentActive, polarity} = state;

  const enterP = smoothstep(245, 275, frame);
  const exitP = 1 - smoothstep(355, 375, frame);
  const opacity = enterP * exitP * currentActive;

  if (opacity <= 0.01) return null;

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
      {/* Símbolos grandes dibujados a mano de polaridad en los terminales durante el Macro Zoom */}
      <g transform="translate(755, 195)">
        <text
          x={0}
          y={0}
          fill="#991B1B"
          fontFamily="'Humor Sans', cursive"
          fontSize={52}
          fontWeight="bold"
        >
          {polarity > 0 ? '+I' : '-I'}
        </text>
      </g>
      <g transform="translate(1135, 885)">
        <text
          x={0}
          y={0}
          fill="#1E3A8A"
          fontFamily="'Humor Sans', cursive"
          fontSize={52}
          fontWeight="bold"
        >
          {polarity > 0 ? '-I' : '+I'}
        </text>
      </g>
    </svg>
  );
};
