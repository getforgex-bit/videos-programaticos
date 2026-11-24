import React from 'react';
import {useCurrentFrame} from 'remotion';

/** Banda de luz cálida del escáner de rayos X en la posición x (px). */
export const ScanGlow: React.FC<{x: number | null}> = ({x}) => {
  const frame = useCurrentFrame();
  if (x === null || x < -200 || x > 2120) return null;
  const flick = 0.85 + 0.15 * Math.sin(frame * 2.1);
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <div
        style={{
          position: 'absolute',
          left: x - 170,
          top: 0,
          width: 340,
          height: '100%',
          background:
            'linear-gradient(90deg, rgba(255,200,120,0) 0%, rgba(255,196,110,0.22) 35%, rgba(255,236,190,0.75) 50%, rgba(255,196,110,0.22) 65%, rgba(255,200,120,0) 100%)',
          opacity: flick,
        }}
      />
      <div style={{position: 'absolute', left: x - 2, top: 0, width: 4, height: '100%', background: 'rgba(255,248,225,0.95)'}} />
    </div>
  );
};
