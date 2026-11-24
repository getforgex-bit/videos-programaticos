import React from 'react';
import {useCurrentFrame} from 'remotion';
import {INK} from './palette';

export type PenSample = [number, number, string | null] | [number, number] | null;

/**
 * Rotulador de pizarra que sigue la punta REAL del trazo (exportada por Manim
 * frame a frame). Huecos cortos entre trazos se interpolan (el rotulador viaja
 * "en el aire"); huecos largos lo hacen desaparecer.
 */
const GAP_TRAVEL = 12; // frames máx. para viajar entre trazos
const FADE = 7;

const nearest = (pen: PenSample[], f: number, dir: 1 | -1, max: number) => {
  for (let k = 0; k <= max; k++) {
    const i = f + k * dir;
    if (i < 0 || i >= pen.length) return null;
    if (pen[i]) return {i, s: pen[i] as [number, number, string | null]};
  }
  return null;
};

export const MarkerPen: React.FC<{
  pen: PenSample[];
  offset?: number;
  scale?: number;
  variant?: 'marker' | 'pencil';
}> = ({pen, offset = 0, scale = 1, variant = 'marker'}) => {
  const frame = useCurrentFrame() - offset;
  if (frame < 0 || frame >= pen.length + FADE) return null;
  const prev = nearest(pen, Math.min(frame, pen.length - 1), -1, GAP_TRAVEL + FADE);
  const next = nearest(pen, Math.max(0, frame), 1, GAP_TRAVEL + FADE);
  if (!prev && !next) return null;

  let x: number;
  let y: number;
  let lift = 0;
  let opacity = 1;
  let color = INK;
  const cur = frame < pen.length ? pen[frame] : null;
  if (cur) {
    [x, y] = cur as [number, number];
    color = (cur as any)[2] ?? INK;
  } else if (prev && next && next.i - prev.i <= GAP_TRAVEL) {
    const t = (frame - prev.i) / (next.i - prev.i);
    const e = t * t * (3 - 2 * t);
    x = prev.s[0] + (next.s[0] - prev.s[0]) * e;
    y = prev.s[1] + (next.s[1] - prev.s[1]) * e;
    lift = Math.sin(Math.PI * t);
    color = (t < 0.5 ? prev.s[2] : next.s[2]) ?? INK;
  } else if (prev && (!next || frame - prev.i <= next.i - frame)) {
    // se aleja tras terminar
    const k = (frame - prev.i) / FADE;
    if (k > 1) return null;
    x = prev.s[0] + 40 * k;
    y = prev.s[1] + 30 * k;
    lift = k;
    opacity = 1 - k;
    color = prev.s[2] ?? INK;
  } else if (next) {
    const k = (next.i - frame) / FADE;
    if (k > 1) return null;
    x = next.s[0] + 40 * k;
    y = next.s[1] + 30 * k;
    lift = k;
    opacity = 1 - k;
    color = next.s[2] ?? INK;
  } else {
    return null;
  }

  const L = 250 * scale; // largo del rotulador
  const up = 6 + lift * 16; // separación de la sombra (altura)
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 0,
        height: 0,
        opacity,
        pointerEvents: 'none',
      }}
    >
      {/* sombra */}
      <svg
        width={L}
        height={60}
        style={{
          position: 'absolute',
          left: up * 0.6,
          top: up - 30,
          transformOrigin: '0px 30px',
          transform: 'rotate(-38deg)',
          filter: `blur(${3 + lift * 3}px)`,
          opacity: 0.22,
          overflow: 'visible',
        }}
      >
        <rect x={10} y={14} width={L - 10} height={32} rx={14} fill="#000" />
      </svg>
      {variant === 'pencil' ? (
        <Pencil L={L} color={color} lift={lift} />
      ) : (
      <svg
        width={L}
        height={60}
        style={{
          position: 'absolute',
          left: 0,
          top: -30 - lift * 8,
          transformOrigin: '0px 30px',
          transform: 'rotate(-38deg)',
          overflow: 'visible',
        }}
      >
        {/* punta de fieltro */}
        <path d="M 0 30 L 14 24 L 14 36 Z" fill={color} />
        <rect x={13} y={22} width={14} height={16} rx={2} fill="#3b3f47" />
        {/* cuerpo */}
        <rect x={26} y={15} width={L - 60} height={30} rx={8} fill="#f4f4f2" stroke="#c9c9c4" strokeWidth={1.5} />
        <rect x={60} y={15} width={58} height={30} fill={color} opacity={0.9} />
        <rect x={26} y={18} width={L - 64} height={6} rx={3} fill="#ffffff" opacity={0.8} />
        {/* tapa trasera */}
        <rect x={L - 40} y={13} width={40} height={34} rx={12} fill={color} />
        <rect x={L - 36} y={17} width={10} height={26} rx={4} fill="#ffffff" opacity={0.25} />
      </svg>
      )}
    </div>
  );
};

/** Lápiz de madera con mina del color de la tinta (estilo sepia). */
const Pencil: React.FC<{L: number; color: string; lift: number}> = ({L, color, lift}) => (
  <svg
    width={L}
    height={60}
    style={{
      position: 'absolute',
      left: 0,
      top: -30 - lift * 8,
      transformOrigin: '0px 30px',
      transform: 'rotate(-38deg)',
      overflow: 'visible',
    }}
  >
    {/* mina */}
    <path d="M 0 30 L 12 26 L 12 34 Z" fill={color} />
    {/* madera afilada */}
    <path d="M 10 26.5 L 40 16 L 40 44 L 10 33.5 Z" fill="#E2C08C" stroke="#9C7A4C" strokeWidth={1.2} />
    {/* cuerpo hexagonal */}
    <rect x={40} y={16} width={L - 95} height={28} fill="#B9772E" />
    <rect x={40} y={16} width={L - 95} height={9} fill="#D08E3E" />
    <rect x={40} y={35} width={L - 95} height={9} fill="#94591F" />
    {/* virola y goma */}
    <rect x={L - 55} y={15} width={22} height={30} fill="#B49A62" stroke="#7A6339" strokeWidth={1} />
    <rect x={L - 33} y={16} width={30} height={28} rx={8} fill="#C9776A" />
  </svg>
);
