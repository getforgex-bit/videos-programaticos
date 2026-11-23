import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';

/**
 * Compositor maestro por capas:
 * - Layer 0: Fondo / atmósfera (Remotion)
 * - Layer 1: Capa Manim (importar vía <OffthreadVideo src={staticFile('layers/manim.webm')} />)
 * - Layer 2: Capa Motion Canvas (importar vía <OffthreadVideo src={staticFile('layers/motion-canvas.webm')} />)
 * - Layer 3: Tipografía, HUD, subtítulos y overlays (React / Remotion)
 */
export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#09090b',
        color: '#f8fafc',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Layer 1: Manim (descomentar cuando exista layers/manim.webm) */}
      {/*
      <Sequence from={0}>
        <OffthreadVideo src={staticFile('layers/manim.webm')} />
      </Sequence>
      */}

      {/* Layer 2: Motion Canvas (descomentar cuando exista layers/motion-canvas.webm) */}
      {/*
      <Sequence from={0}>
        <OffthreadVideo src={staticFile('layers/motion-canvas.webm')} />
      </Sequence>
      */}

      {/* Layer 3: UI / Tipografía / HUD */}
      <Sequence from={0}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity,
          }}
        >
          <h1 style={{fontSize: 72, fontWeight: 700, letterSpacing: -2}}>
            Video Programático Híbrido
          </h1>
          <p style={{fontSize: 28, color: '#94a3b8', marginTop: 12}}>
            Manim + Motion Canvas + Remotion
          </p>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
