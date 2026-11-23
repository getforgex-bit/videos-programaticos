import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

/**
 * Borrador de pizarra que barre de izquierda a derecha. Devuelve la máscara
 * CSS para el contenido que se está borrando y dibuja el borrador.
 */
export const eraserProgress = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: t => t * t * (3 - 2 * t),
  });

export const eraserX = (p: number) => -260 + p * (1920 + 520);

export const eraserMask = (p: number) => {
  const x = eraserX(p);
  // zona ya borrada (a la izquierda del borrador) transparente, borde suave
  return `linear-gradient(90deg, transparent ${x - 60}px, #000 ${x + 120}px)`;
};

export const Eraser: React.FC<{start: number; duration: number}> = ({start, duration}) => {
  const frame = useCurrentFrame();
  if (frame < start - 2 || frame > start + duration + 2) return null;
  const p = eraserProgress(frame, start, duration);
  const x = eraserX(p);
  const y = 540 + Math.sin(p * Math.PI * 5) * 230;
  const rot = Math.sin(p * Math.PI * 5 + 0.6) * 10 - 4;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 160,
        top: y - 90,
        width: 320,
        height: 180,
        transform: `rotate(${rot}deg)`,
        filter: 'drop-shadow(10px 18px 14px rgba(0,0,0,0.25))',
      }}
    >
      <svg width={320} height={180}>
        {/* fieltro */}
        <rect x={8} y={118} width={304} height={46} rx={8} fill="#5b5f66" />
        <rect x={8} y={150} width={304} height={14} rx={6} fill="#3f4248" />
        {/* cuerpo */}
        <path d="M 22 120 Q 26 40 80 30 L 240 30 Q 294 40 298 120 Z" fill="#2D6BB3" />
        <path d="M 40 112 Q 46 56 90 48 L 230 48 Q 272 56 280 112 Z" fill="#3f82cf" />
        <rect x={110} y={64} width={100} height={18} rx={9} fill="#f6f3eb" opacity={0.85} />
      </svg>
    </div>
  );
};
