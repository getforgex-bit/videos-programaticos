import React from 'react';
import {
  MotorFrameState,
  clamp,
  sketchLine,
  sketchRoundedRect,
  smoothstep,
} from './handDrawnUtils';

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
    end: 112,
    kicker: '01 · EL MOTOR EN MARCHA',
    headline: 'BLINDAJE SELLADO · EJE A 3,000 RPM',
    position: 'top',
    accent: '#362312',
  },
  {
    start: 126,
    end: 232,
    kicker: '02 · CORTE DE COMPÁS Y APERTURA',
    headline: 'ESTATOR (N / S) + TAMBOR HORIZONTAL INTERNO',
    position: 'top',
    accent: '#5C3F24',
  },
  {
    start: 246,
    end: 366,
    kicker: '03 · CHOQUE DE CAMPOS MAGNÉTICOS',
    headline: 'ABAJO SE SUMAN (+ +) · ARRIBA SE RESTAN (- -)',
    position: 'bottom',
    accent: '#991B1B',
  },
  {
    start: 380,
    end: 532,
    kicker: '04 · CATAPULTA MAGNÉTICA (LORENTZ: F = I × B)',
    headline: 'LA ALTA PRESIÓN (+ +) EMPUJA EL TAMBOR HACIA ARRIBA (↑F)',
    position: 'top',
    accent: '#065F46',
  },
  {
    start: 546,
    end: 712,
    kicker: '05 · COLECTOR EN EL EJE HORIZONTAL',
    headline: 'INVIERTE LA CORRIENTE CADA 180° → ¡GIRO CONTINUO!',
    position: 'top',
    accent: '#B45309',
  },
  {
    start: 726,
    end: 895,
    kicker: '06 · MOTOR RECONSTRUIDO',
    headline: 'ELECTRICIDAD Y MAGNETISMO CONVERTIDOS EN POTENCIA',
    position: 'top',
    accent: '#362312',
  },
];

/**
 * Cartela de Cuaderno de Inventor Trazada a Mano en SVG (v4.0 — Acabado Humano No-IA)
 * Elimina las cajas CSS rígidas y dibuja un rótulo arquitectónico con líneas de construcción
 * sobrepasadas (overshoots), doble pasada de grafito y subrayado manual.
 */
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
        ? Math.sin(((frame - activeCue.start) / 16) * Math.PI) * 0.08
        : 0;
    cueScale = 0.88 + 0.12 * enter + over;
    cueYOffset = (1 - enter) * (activeCue.position === 'top' ? -22 : 22);
  }

  const bw = 1040;
  const bh = 88;
  const bx = (1920 - bw) / 2;
  const by = activeCue?.position === 'bottom' ? 962 : 20;

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
    >
      {activeCue && cueOpacity > 0.01 && (
        <g
          opacity={cueOpacity}
          transform={`translate(960, ${by + bh / 2 + cueYOffset}) scale(${cueScale.toFixed(3)}) translate(-960, ${-(by + bh / 2)})`}
        >
          {/* Fondo de papel pergamino rasgado / trazado a mano */}
          <path
            d={sketchRoundedRect(bx, by, bw, bh, 8, 701, 1.8)}
            fill="rgba(238, 224, 197, 0.94)"
            stroke={activeCue.accent}
            strokeWidth={4}
          />
          {/* Segunda pasada de lápiz ligeramente desfasada para aspecto humano */}
          <path
            d={sketchRoundedRect(bx - 3, by - 2, bw + 6, bh + 4, 10, 702, 2.1)}
            fill="none"
            stroke="#5C3F24"
            strokeWidth={1.8}
            strokeOpacity={0.55}
          />
          {/* Líneas de construcción arquitectónica que sobrepasan las 4 esquinas (Overshoots) */}
          <path
            d={sketchLine(bx - 24, by, bx + bw + 24, by, 703, 1.1, 0)}
            stroke="#5C3F24"
            strokeWidth={1.6}
            strokeOpacity={0.6}
            fill="none"
          />
          <path
            d={sketchLine(bx - 24, by + bh, bx + bw + 24, by + bh, 704, 1.1, 0)}
            stroke="#5C3F24"
            strokeWidth={1.6}
            strokeOpacity={0.6}
            fill="none"
          />

          {/* Kicker superior en caligrafía técnica */}
          <text
            x={960}
            y={by + 28}
            textAnchor="middle"
            fill="#6B4E31"
            fontFamily="'Comic Neue', sans-serif"
            fontWeight="bold"
            fontSize={17}
            letterSpacing={2.4}
          >
            {activeCue.kicker}
          </text>

          {/* Título principal manuscrito */}
          <text
            x={960}
            y={by + 68}
            textAnchor="middle"
            fill={activeCue.accent}
            fontFamily="'Humor Sans', cursive"
            fontSize={34}
            letterSpacing={0.8}
          >
            {activeCue.headline}
          </text>

          {/* Subrayado rápido a lápiz debajo del título */}
          <path
            d={sketchLine(bx + 140, by + 77, bx + bw - 140, by + 77, 709, 1.2, 0)}
            stroke={activeCue.accent}
            strokeWidth={2.2}
            strokeOpacity={0.45}
            fill="none"
          />
        </g>
      )}

      {/* Barra de tiempo minimalista trazada a lápiz */}
      <path
        d={sketchLine(80, 1068, 1840, 1068, 799, 0.8, 0)}
        stroke="rgba(92, 63, 36, 0.28)"
        strokeWidth={4}
        fill="none"
      />
      <path
        d={sketchLine(
          80,
          1068,
          80 + clamp(frame / 899, 0, 1) * 1760,
          1068,
          798,
          0.8,
          0,
        )}
        stroke="#362312"
        strokeWidth={5}
        fill="none"
      />
    </svg>
  );
};
