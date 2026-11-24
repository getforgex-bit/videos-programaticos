import React from 'react';
import {useCurrentFrame} from 'remotion';

/**
 * Filtros SVG para que los trazos parezcan tinta sobre papel rugoso:
 *  - #ink:  temblor ("line boil", cambia cada `every` frames) + grano en el
 *           alfa + leve suavizado.
 *  - #mblur: desenfoque direccional según la velocidad de cámara (px/frame).
 * Se aplican con  filter: 'url(#ink) url(#mblur)'.
 */
export const InkDefs: React.FC<{boil?: number; every?: number; blurX?: number; blurY?: number}> = ({
  boil = 1.3,
  every = 4,
  blurX = 0,
  blurY = 0,
}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / every) % 9;
  return (
    <svg width="0" height="0" style={{position: 'absolute'}}>
      <filter id="ink" x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed={seed} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={boil} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="1" seed="3" result="g" />
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.5 0 0 0 1.62" result="gm" />
        <feComposite in="d" in2="gm" operator="in" result="grainy" />
        <feGaussianBlur in="grainy" stdDeviation="0.35" />
      </filter>
      <filter id="mblur" x="-5%" y="-5%" width="110%" height="110%">
        <feGaussianBlur stdDeviation={`${Math.min(40, blurX).toFixed(2)} ${Math.min(40, blurY).toFixed(2)}`} />
      </filter>
    </svg>
  );
};
