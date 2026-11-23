import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLOR_BY_NAME, INK} from './palette';

/**
 * Texto manuscrito con revelado tipo "se está escribiendo" (máscara de
 * izquierda a derecha) y salida por desvanecimiento.
 *
 * Marcado simple para colorear palabras: "la {corriente|red} gira".
 */
export const parseMarkup = (text: string) => {
  const parts: {t: string; color?: string}[] = [];
  const re = /\{([^|}]+)\|([a-z]+)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({t: text.slice(last, m.index)});
    parts.push({t: m[1], color: COLOR_BY_NAME[m[2]] ?? m[2]});
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({t: text.slice(last)});
  return parts;
};

export const plainLength = (text: string) =>
  parseMarkup(text).reduce((a, p) => a + p.t.length, 0);

type Props = {
  text: string;
  start: number; // frame de inicio (relativo al padre)
  end?: number; // frame de salida
  charsPerSecond?: number;
  fps?: number;
  size?: number;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
  /** Franja suave color pizarra detrás del texto (legibilidad sobre dibujos). */
  backdrop?: string;
};

export const Handwritten: React.FC<Props> = ({
  text,
  start,
  end = Infinity,
  charsPerSecond = 38,
  fps = 30,
  size = 46,
  weight = 700,
  color = INK,
  style,
  backdrop,
}) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > end + 10) return null;
  const writeFrames = Math.max(6, (plainLength(text) / charsPerSecond) * fps);
  const p = interpolate(frame, [start, start + writeFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const out = Number.isFinite(end)
    ? interpolate(frame, [end, end + 10], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;
  // máscara con borde suave que avanza como la punta del rotulador
  const edge = p * 112 - 6;
  const mask = `linear-gradient(90deg, #000 ${edge - 4}%, transparent ${edge + 4}%)`;
  const body = (
    <div
      style={{
        fontFamily: 'Kalam',
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.15,
        color,
        opacity: out,
        WebkitMaskImage: mask,
        maskImage: mask,
        whiteSpace: 'pre-wrap',
        ...style,
      }}
    >
      {parseMarkup(text).map((part, i) => (
        <span key={i} style={part.color ? {color: part.color} : undefined}>
          {part.t}
        </span>
      ))}
    </div>
  );
  if (!backdrop) return body;
  const bgIn = interpolate(frame, [start, start + 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div style={{position: 'relative', display: 'inline-block'}}>
      <div
        style={{
          position: 'absolute',
          inset: '-22px -70px',
          borderRadius: 999,
          background: backdrop,
          filter: 'blur(14px)',
          opacity: bgIn * out,
        }}
      />
      <div style={{position: 'relative'}}>{body}</div>
    </div>
  );
};

/** Subrayado dibujado a mano (trazo SVG que se dibuja con dashoffset). */
export const HandUnderline: React.FC<{
  start: number;
  duration?: number;
  width: number;
  color?: string;
  strokeWidth?: number;
  end?: number;
  seed?: number;
}> = ({start, duration = 12, width, color = INK, strokeWidth = 6, end = Infinity, seed = 1}) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > end + 10) return null;
  const p = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const out = Number.isFinite(end)
    ? interpolate(frame, [end, end + 10], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;
  const j = (k: number) => Math.sin(seed * 12.9898 + k * 78.233) * 4;
  const d = `M 4 ${14 + j(1)} C ${width * 0.3} ${8 + j(2)}, ${width * 0.65} ${18 + j(3)}, ${
    width - 4
  } ${10 + j(4)}`;
  const len = width * 1.1;
  return (
    <svg width={width} height={28} style={{display: 'block', overflow: 'visible', opacity: out}}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - p)}
      />
    </svg>
  );
};
