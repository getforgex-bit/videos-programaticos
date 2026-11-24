import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {parseMarkup} from './Handwritten';

export type KineticProps = {
  words: string[]; // cada palabra admite marcado {texto|color}
  start: number; // frame de la primera palabra
  end: number; // frame de salida
  x: number; // centro (px)
  y: number;
  size?: number;
  step?: number; // frames entre palabras (por defecto medio pulso = 9)
  stack?: boolean; // una palabra por línea
  stamp?: boolean; // entra como sello (desde grande)
  splat?: boolean; // aguada de tinta detrás
  colors: Record<string, string>;
  ink: string;
  wash: string;
};

/** Texto cinético: cada palabra entra a golpe (resorte con rebote). */
export const Kinetic: React.FC<KineticProps> = ({
  words,
  start,
  end,
  x,
  y,
  size = 96,
  step = 9,
  stack = false,
  stamp = false,
  splat = true,
  colors,
  ink,
  wash,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < start - 1 || frame > end + 8) return null;
  const out = interpolate(frame, [end, end + 7], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const outScale = interpolate(frame, [end, end + 7], [1, 0.7], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const sp0 = spring({frame: frame - start, fps, config: {damping: 9, stiffness: 160, mass: 0.7}});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${outScale})`,
        opacity: out,
        display: 'flex',
        flexDirection: stack ? 'column' : 'row',
        alignItems: 'center',
        gap: stack ? 0 : size * 0.4,
        whiteSpace: 'nowrap',
        mixBlendMode: 'multiply',
      }}
    >
      {splat && (() => {
        // "nota de papel" detrás del texto: legible sobre cualquier dibujo
        const longest = Math.max(...words.map(w => strip(w).length));
        const total = words.reduce((a, w) => a + strip(w).length, 0) + words.length;
        const w = (stack ? longest : total) * size * 0.52 + size * 0.9;
        const h = (stack ? words.length : 1) * size * 1.05 + size * 0.5;
        return (
          <svg
            width={w + 40}
            height={h + 40}
            viewBox={`${-(w + 40) / 2} ${-(h + 40) / 2} ${w + 40} ${h + 40}`}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) scale(${0.3 + 0.7 * sp0}) rotate(-2deg)`,
              zIndex: -1,
              overflow: 'visible',
            }}
          >
            <path d={blobPath(start, w / 2, h / 2, 0.07)} fill="#4E321B" opacity={0.18} transform="translate(7 8)" />
            <path d={blobPath(start, w / 2, h / 2, 0.07)} fill={wash} opacity={0.94} stroke="#4E321B" strokeOpacity={0.35} strokeWidth={3} />
          </svg>
        );
      })()}
      {words.map((w, i) => {
        const f = frame - (start + i * step);
        if (f < 0) return <span key={i} style={{visibility: 'hidden', fontFamily: 'Kalam', fontWeight: 700, fontSize: size}}>{strip(w)}</span>;
        const sp = spring({frame: f, fps, config: stamp ? {damping: 12, stiffness: 260, mass: 0.9} : {damping: 8, stiffness: 190, mass: 0.6}});
        const scale = stamp ? interpolate(sp, [0, 1], [2.4, 1]) : interpolate(sp, [0, 1], [0.15, 1]);
        const rot = interpolate(sp, [0, 1], [stamp ? 0 : -14, ((i * 37 + start) % 7) - 3]);
        const op = stamp ? Math.min(1, f / 2) : Math.min(1, f / 1.5);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              fontFamily: 'Kalam',
              fontWeight: 700,
              fontSize: size,
              lineHeight: 1.0,
              color: ink,
              transform: `scale(${scale}) rotate(${rot}deg)`,
              opacity: op,
              textShadow: `3px 3px 0 rgba(78,50,27,0.22)`,
              filter: 'url(#ink)',
            }}
          >
            {parseMarkup(w).map((p, k) => (
              <span key={k} style={p.color ? {color: colors[p.color.replace('#', '')] ?? p.color} : undefined}>
                {p.t}
              </span>
            ))}
          </span>
        );
      })}
    </div>
  );
};

const strip = (w: string) => parseMarkup(w).map(p => p.t).join('');

/** Mancha orgánica (radio con ruido suave). */
export const blobPath = (seed: number, rx: number, ry: number, rough = 0.2, n = 48) => {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k =
      1 +
      rough *
        (0.6 * Math.sin(a * 3 + seed) + 0.3 * Math.sin(a * 7 + seed * 1.7) + 0.15 * Math.sin(a * 13 + seed * 0.3));
    pts.push(`${(Math.cos(a) * rx * k).toFixed(1)},${(Math.sin(a) * ry * k).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
};
