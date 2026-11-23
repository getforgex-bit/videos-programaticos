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

const KINETIC_CUES: KineticCue[] = [
  {
    start: 8,
    end: 114,
    kicker: '01 · EL MOTOR EN MARCHA',
    headline: 'BLINDAJE SELLADO · EJE A 3,000 RPM',
    position: 'top',
    accent: '#362312',
  },
  {
    start: 124,
    end: 234,
    kicker: '02 · APERTURA MECÁNICA Y RAYOS-X',
    headline: 'ESTATOR (N / S) + TAMBOR HORIZONTAL Y COLECTOR',
    position: 'top',
    accent: '#5C3F24',
  },
  {
    start: 244,
    end: 368,
    kicker: '03 · INTERACCIÓN ELECTROMAGNÉTICA',
    headline: 'VÓRTICES DE CORRIENTE (I) CURVAN EL CAMPO (N → S)',
    position: 'bottom',
    accent: '#991B1B',
  },
  {
    start: 378,
    end: 534,
    kicker: '04 · CATAPULTA MAGNÉTICA (LORENTZ: F = I × B)',
    headline: 'EL CAMPO TENSADO EMPUJA EL TAMBOR HORIZONTAL (↑F)',
    position: 'top',
    accent: '#065F46',
  },
  {
    start: 544,
    end: 714,
    kicker: '05 · COLECTOR EN EL EJE HORIZONTAL',
    headline: 'LAS DELGAS INVIERTEN I CADA 180° → ¡GIRO CONTINUO!',
    position: 'top',
    accent: '#B45309',
  },
  {
    start: 724,
    end: 895,
    kicker: '06 · MOTOR RECONSTRUIDO',
    headline: 'ELECTRICIDAD Y MAGNETISMO CONVERTIDOS EN POTENCIA',
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
    const over =
      frame < activeCue.start + 16
        ? Math.sin(((frame - activeCue.start) / 16) * Math.PI) * 0.1
        : 0;
    cueScale = 0.85 + 0.15 * enter + over;
    cueYOffset = (1 - enter) * (activeCue.position === 'top' ? -24 : 24);
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
      {activeCue && cueOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: activeCue.position === 'top' ? 20 : undefined,
            bottom: activeCue.position === 'bottom' ? 26 : undefined,
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
              backgroundColor: 'rgba(234, 219, 194, 0.94)',
              border: `3.5px solid ${activeCue.accent}`,
              borderRadius: 12,
              padding: '7px 28px 9px',
              boxShadow: '5px 5px 0px rgba(54, 35, 18, 0.24)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'Comic Neue', sans-serif",
                fontWeight: 700,
                fontSize: 17,
                letterSpacing: 2.2,
                color: '#6B4E31',
                marginBottom: 1,
              }}
            >
              {activeCue.kicker}
            </div>
            <div
              style={{
                fontSize: 36,
                lineHeight: 1.08,
                color: activeCue.accent,
                letterSpacing: 0.8,
              }}
            >
              {activeCue.headline}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          bottom: 10,
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
