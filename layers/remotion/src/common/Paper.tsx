import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PAPER} from './palette';

/**
 * Pizarra blanca procedural: color base + grano fino + "fantasmas" de borrado
 * (manchas muy tenues de baja frecuencia) + viñeta suave. Todo estático.
 */
export const Paper: React.FC<{ghosts?: number}> = ({ghosts = 0.05}) => (
  <AbsoluteFill style={{backgroundColor: PAPER}}>
    <svg width="100%" height="100%" style={{position: 'absolute'}}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="table" tableValues="0 0.06" />
        </feComponentTransfer>
      </filter>
      <filter id="ghosts">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.009" numOctaves="3" seed="11" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.45  0 0 0 0 0.47  0 0 0 0 0.52  0 0 0 -2.2 1.25"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#ghosts)" opacity={ghosts} />
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(60,50,30,0.10) 100%)',
      }}
    />
  </AbsoluteFill>
);
