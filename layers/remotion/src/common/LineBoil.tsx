import React from 'react';
import {useCurrentFrame} from 'remotion';

/**
 * "Line boil": leve desplazamiento del trazo que cambia cada `every` frames,
 * como en la animación dibujada a mano. Se aplica con filter: url(#id).
 */
export const LineBoilDefs: React.FC<{id: string; scale?: number; every?: number}> = ({
  id,
  scale = 1.6,
  every = 4,
}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / every) % 7;
  return (
    <svg width="0" height="0" style={{position: 'absolute'}}>
      <filter id={id} x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed={seed} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
};
