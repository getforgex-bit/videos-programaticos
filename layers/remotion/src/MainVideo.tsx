import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {IsometricMotorWhiteboard} from './IsometricMotorWhiteboard';
import {ManimOscilloscopeLayer} from './ManimOscilloscopeLayer';
import {MotionCanvasCircuitLayer} from './MotionCanvasCircuitLayer';
import {WhiteboardAnnotations} from './WhiteboardAnnotations';
import {getMotorStateAtFrame, smoothstep} from './handDrawnUtils';

/**
 * Compositor Maestro por Capas (Remotion — Capa 3)
 * Video 1: Idea A ("El motor invisible") · Estilo 2 ("Whiteboard / Dibujo a mano")
 *
 * Capas integradas:
 * - Capa 0: Superficie de pizarrón técnico de porcelana + retícula milimétrica
 * - Capa 1 (Manim): Osciloscopio de Par Motor Rectificado τ(θ) sincronizado con manim_physics_telemetry.json
 *   (clip pre-renderizado también disponible en public/layers/manim_torque_wave.webm)
 * - Capa 2 (Motion Canvas): Diagrama Esquemático de Circuito DC y Conmutador de Delgas
 *   (clip pre-renderizado también disponible en public/layers/motion_canvas_circuit.webm)
 * - Capa 3 (Remotion): Motor isométrico 2.5D trazado a mano, revelación Rayos-X, vectores de Lorentz,
 *   reconstrucción mecánica, etiquetas manuscritas y pista de diseño sonoro procedural.
 */
export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const state = getMotorStateAtFrame(frame);

  // Movimiento cinematográfico sutil de cámara sobre el motor central:
  // Push-in suave durante la revelación (Actos II-IV) y pull-back en la reconstrucción (Acto V)
  const zoomIn = smoothstep(180, 260, frame);
  const zoomOut = smoothstep(730, 830, frame);
  const motorCameraScale = 1 + 0.055 * (zoomIn - zoomOut);

  // Fade-in inicial y cierre suave
  const masterOpacity = interpolate(
    frame,
    [0, 12, 885, 899],
    [0, 1, 1, 0.96],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F6F4EC',
        color: '#181A1F',
        overflow: 'hidden',
        opacity: masterOpacity,
      }}
    >
      {/* Carga determinista de tipografías manuscritas desde public/fonts */}
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

      {/* Pista de audio procedural sincronizada */}
      <Audio src={staticFile('audio/whiteboard_motor_sfx.wav')} volume={0.85} />

      {/* =====================================================================
          CAPA 0: SUPERFICIE DE PIZARRÓN Y CUADRÍCULA DE INGENIERÍA
         ===================================================================== */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.65) 0%, rgba(235, 231, 220, 0.85) 100%),
            linear-gradient(to right, rgba(30, 58, 138, 0.055) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(30, 58, 138, 0.055) 1px, transparent 1px),
            linear-gradient(to right, rgba(30, 58, 138, 0.11) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(30, 58, 138, 0.11) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 24px 24px, 24px 24px, 120px 120px, 120px 120px',
        }}
      />

      {/* Marco perimetral dibujado a mano del pizarrón */}
      <div
        style={{
          position: 'absolute',
          inset: 14,
          border: '2.5px solid rgba(24, 26, 31, 0.35)',
          borderRadius: 14,
          pointerEvents: 'none',
        }}
      />

      {/* =====================================================================
          CAPA 1 (MANIM): OSCILOSCOPIO CIENTÍFICO DE PAR MOTOR τ(θ)
         ===================================================================== */}
      <ManimOscilloscopeLayer state={state} />

      {/* =====================================================================
          CAPA 2 (MOTION CANVAS): CIRCUITO DC Y CONMUTADOR DE DELGAS
         ===================================================================== */}
      <MotionCanvasCircuitLayer state={state} />

      {/* =====================================================================
          CAPA 3A (REMOTION HERO): MOTOR ISOMÉTRICO 2.5D DIBUJADO A MANO
         ===================================================================== */}
      <AbsoluteFill
        style={{
          transform: `scale(${motorCameraScale.toFixed(4)})`,
          transformOrigin: '955px 430px',
        }}
      >
        <IsometricMotorWhiteboard state={state} />
      </AbsoluteFill>

      {/* =====================================================================
          CAPA 3B (REMOTION HUD): ANOTACIONES MANUSCRITAS, COTAS Y LÍNEA DE TIEMPO
         ===================================================================== */}
      <WhiteboardAnnotations state={state} />
    </AbsoluteFill>
  );
};
