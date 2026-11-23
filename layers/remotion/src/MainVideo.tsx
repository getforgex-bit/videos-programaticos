import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {CreativeSceneTransitions} from './CreativeSceneTransitions';
import {IsometricMotorWhiteboard} from './IsometricMotorWhiteboard';
import {ManimOscilloscopeLayer} from './ManimOscilloscopeLayer';
import {MotionCanvasCircuitLayer} from './MotionCanvasCircuitLayer';
import {ReactiveParchmentBackground} from './ReactiveParchmentBackground';
import {WhiteboardAnnotations} from './WhiteboardAnnotations';
import {getMotorStateAtFrame} from './handDrawnUtils';

/**
 * Compositor Maestro por Capas (Remotion — Capa 3 · v4.0 Edición Pulido Maestro)
 * Video 1: Idea A ("El motor invisible") · Estilo 2 ("Boceto Grafito/Sepia Dopaminérgico v4.0")
 */
export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const state = getMotorStateAtFrame(frame);
  const {camera} = state;

  const masterOpacity = interpolate(
    frame,
    [0, 8, 888, 899],
    [0, 1, 1, 0.96],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#E3D1B1',
        color: '#362312',
        overflow: 'hidden',
        opacity: masterOpacity,
      }}
    >
      <style>
        {`
          @font-face {
            font-family: 'Humor Sans';
            src: url('${staticFile('fonts/Humor-Sans.ttf')}') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
          @font-face {
            font-family: 'Comic Neue';
            src: url('${staticFile('fonts/ComicNeue-Regular.otf')}') format('opentype');
            font-weight: 400;
            font-style: normal;
          }
          @font-face {
            font-family: 'Comic Neue';
            src: url('${staticFile('fonts/ComicNeue-Bold.otf')}') format('opentype');
            font-weight: 700;
            font-style: normal;
          }
        `}
      </style>

      <Audio src={staticFile('audio/whiteboard_motor_sfx.wav')} volume={0.92} />

      {/* CAPA 0A: PAPEL PERGAMINO / CUADERNO DE BOCETO SEPIA */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, #EFE1C6 0%, #E2CFAF 58%, #C8AE86 100%),
            repeating-linear-gradient(36deg, rgba(74, 50, 25, 0.025) 0px, rgba(74, 50, 25, 0.025) 2px, transparent 2px, transparent 9px),
            repeating-linear-gradient(-54deg, rgba(74, 50, 25, 0.02) 0px, rgba(74, 50, 25, 0.02) 1px, transparent 1px, transparent 11px)
          `,
        }}
      />

      {/* CAPA 0B: ELEMENTOS DE FONDO REACTIVOS Y SUTILES */}
      <ReactiveParchmentBackground state={state} />

      {/* MUNDO CON CÁMARA DINÁMICA + CARGA/DESCARGA BAJO DEMANDA */}
      <AbsoluteFill
        style={{
          transform: `translate(${camera.tx.toFixed(1)}px, ${camera.ty.toFixed(1)}px) scale(${camera.scale.toFixed(4)}) rotate(${camera.rotateDeg.toFixed(2)}deg)`,
          transformOrigin: '960px 540px',
        }}
      >
        <IsometricMotorWhiteboard state={state} />
        <MotionCanvasCircuitLayer state={state} />
      </AbsoluteFill>

      {/* CAPA 1 (MANIM): CINTA DE PULSO DE TORQUE RECTIFICADO (Escena 5) */}
      <ManimOscilloscopeLayer state={state} />

      {/* CAPA DE 5 TRANSICIONES ARTESANALES ENTRE ESCENAS (Compás, Carboncillo, Lupa, Relámpago, Reglas T) */}
      <CreativeSceneTransitions state={state} />

      {/* VIÑETA CINEMATOGRÁFICA Y DESTELLO DE IMPACTO DOPAMINÉRGICO */}
      <AbsoluteFill
        style={{
          boxShadow: `inset 0 0 ${110 + camera.vignettePulse * 70}px rgba(42, 24, 10, ${0.38 + camera.vignettePulse * 0.22})`,
          pointerEvents: 'none',
        }}
      />
      {camera.flash > 0.01 && (
        <AbsoluteFill
          style={{
            backgroundColor: `rgba(255, 243, 214, ${(camera.flash * 0.32).toFixed(3)})`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* CAPA 3B: CARTELA MANUSCRITA DE CUADERNO DE INVENTOR */}
      <WhiteboardAnnotations state={state} />
    </AbsoluteFill>
  );
};
