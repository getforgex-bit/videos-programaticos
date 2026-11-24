import React from 'react';
import {AbsoluteFill} from 'remotion';

export const PARCHMENT = '#E8D7B5';

/**
 * Pergamino envejecido procedural (sin imágenes): base tostada, manchas de
 * humedad de baja frecuencia, fibras, grano fino y viñeta oscura "quemada".
 */
export const Parchment: React.FC<{textureOnly?: boolean}> = ({textureOnly = false}) => (
  <AbsoluteFill
    style={
      textureOnly
        ? {mixBlendMode: 'multiply', pointerEvents: 'none'}
        : {backgroundColor: PARCHMENT}
    }
  >
    <svg width="100%" height="100%" style={{position: 'absolute'}}>
      <defs>
        <filter id="pm-stains" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0022 0.0035" numOctaves="4" seed="21" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.55  0 0 0 0 0.38  0 0 0 0 0.18  0 0 0 -2.6 1.55"
          />
        </filter>
        <filter id="pm-blotch" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="7" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.6  0 0 0 0 0.45  0 0 0 0 0.25  0 0 0 -3.2 1.75"
          />
        </filter>
        <filter id="pm-fibers" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="2" seed="5" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0 0.16  0 0 0 -3 1.6" />
        </filter>
        <filter id="pm-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="9" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.09" />
          </feComponentTransfer>
        </filter>
        <radialGradient id="pm-vig" cx="50%" cy="48%" r="75%">
          <stop offset="55%" stopColor="#6B4A24" stopOpacity="0" />
          <stop offset="88%" stopColor="#6B4A24" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#3E2810" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" filter="url(#pm-stains)" opacity={0.28} />
      <rect width="100%" height="100%" filter="url(#pm-blotch)" opacity={0.12} />
      <rect width="100%" height="100%" filter="url(#pm-fibers)" opacity={0.035} />
      <rect width="100%" height="100%" filter="url(#pm-grain)" />
      <rect width="100%" height="100%" fill="url(#pm-vig)" />
    </svg>
  </AbsoluteFill>
);
