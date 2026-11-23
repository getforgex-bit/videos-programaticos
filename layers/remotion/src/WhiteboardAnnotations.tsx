import React from 'react';
import {MotorFrameState, clamp, smoothstep} from './handDrawnUtils';

interface Props {
  state: MotorFrameState;
}

interface KineticCue {
  start: number;
  end: number;
  kicker: string;
  headline: string;
  position: 'top' | 'bottom';
  accent: string;
}

/**
 * Guion de Tipografía Cinética Dopaminérgica (v2.0):
 * - UNA SOLA idea corta y potente en pantalla a la vez.
 * - Cero paneles estáticos, cero tablas saturadas.
 * - Títulos grandes estilo boceto a lápiz sobre el pergamino que entran con impacto y salen limpiamente.
 */
const KINETIC_CUES: KineticCue[] = [
  {
    start: 8,
    end: 114,
    kicker: '01 · EL MOTOR EN MARCHA',
    headline: 'ACERO SELLADO · 3,000 RPM',
    position: 'top',
    accent: '#362312',
  },
  {
    start: 124,
    end: 234,
    kicker: '02 · REVELACIÓN RAYOS-X',
    headline: 'IMANES (N / S) + NÚCLEO INTERNO',
    position: 'top',
    accent: '#5C3F24',
  },
  {
    start: 244,
    end: 368,
    kicker: '03 · ENERGÍA INVISIBLE',
    headline: 'LA CORRIENTE (I) CRUZA EL CAMPO (N → S)',
    position: 'bottom',
    accent: '#991B1B',
  },
  {
    start: 378,
    end: 534,
    kicker: '04 · LEY DE LORENTZ: F = I × B',
    headline: '¡EXPLOSIÓN DE FUERZA (F) Y PAR DE GIRO!',
    position: 'bottom',
    accent: '#362312',
  },
  {
    start: 544,
    end: 714,
    kicker: '05 · EL SECRETO DEL COLECTOR',
    headline: 'INVERSIÓN CADA 180° → ¡EMPUJE CONTINUO!',
    position: 'top',
    accent: '#B45309',
  },
  {
    start: 724,
    end: 895,
    kicker: '06 · MOTOR RECONSTRUIDO',
    headline: 'ELECTRICIDAD CONVERTIDA EN ROTACIÓN',
    position: 'top',
    accent: '#362312',
  },
];

export const WhiteboardAnnotations: React.FC<Props> = ({state}) => {
  const {frame} = state;

  const activeCue = KINETIC_CUES.find(
    (c) => frame >= c.start && frame <= c.end,
  );

  let cueScale = 1;
  let cueOpacity = 0;
  let cueYOffset = 0;

  if (activeCue) {
    const enter = smoothstep(activeCue.start, activeCue.start + 12, frame);
    const exit = 1 - smoothstep(activeCue.end - 12, activeCue.end, frame);
    cueOpacity = enter * exit;
    // Efecto pop elástico al entrar
    const over =
      frame < activeCue.start + 16
        ? Math.sin(((frame - activeCue.start) / 16) * Math.PI) * 0.12
        : 0;
    cueScale = 0.82 + 0.18 * enter + over;
    cueYOffset = (1 - enter) * (activeCue.position === 'top' ? -28 : 28);
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        fontFamily: "'Humor Sans', cursive",
        color: '#362312',
      }}
    >
      {/* TÍTULO CINÉTICO ÚNICO (1 sola idea en pantalla a la vez) */}
      {activeCue && cueOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: activeCue.position === 'top' ? 36 : undefined,
            bottom: activeCue.position === 'bottom' ? 46 : undefined,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: cueOpacity,
            transform: `translateY(${cueYOffset.toFixed(1)}px) scale(${cueScale.toFixed(3)})`,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(234, 219, 194, 0.92)',
              border: `4px solid ${activeCue.accent}`,
              borderRadius: 14,
              padding: '10px 34px 12px',
              boxShadow: '6px 6px 0px rgba(54, 35, 18, 0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'Comic Neue', sans-serif",
                fontWeight: 700,
                fontSize: 19,
                letterSpacing: 2.5,
                color: '#6B4E31',
                marginBottom: 2,
              }}
            >
              {activeCue.kicker}
            </div>
            <div
              style={{
                fontSize: 44,
                lineHeight: 1.08,
                color: activeCue.accent,
                letterSpacing: 1,
              }}
            >
              {activeCue.headline}
            </div>
          </div>
        </div>
      )}

      {/* Línea de progreso minimalista a lápiz al borde inferior */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          bottom: 14,
          height: 5,
          backgroundColor: 'rgba(92, 63, 36, 0.22)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${clamp(frame / 899, 0, 1) * 100}%`,
            height: '100%',
            backgroundColor: '#362312',
          }}
        />
      </div>
    </div>
  );
};
