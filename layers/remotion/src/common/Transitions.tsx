import React from 'react';
import {interpolate} from 'remotion';
import {blobPath} from './Kinetic';

export type TransitionType = 'dive' | 'whip' | 'inkblot';

const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Estilo del segmento que SALE (p: 0→1 durante la transición). */
export const exitStyle = (type: TransitionType, p: number, focal?: {x: number; y: number}) => {
  if (type === 'dive') {
    const s = 1 + Math.pow(p, 2.2) * 7;
    return {
      style: {transformOrigin: `${focal?.x ?? 960}px ${focal?.y ?? 540}px`, transform: `scale(${s})`, opacity: 1 - ss(0.45, 1, p)},
      blur: {x: p * 14, y: p * 14},
    };
  }
  if (type === 'whip') {
    return {style: {transform: `translateX(${-Math.pow(p, 1.6) * 2300}px)`}, blur: {x: 8 + p * 46, y: 0}};
  }
  // inkblot: el segmento saliente desaparece bajo la mancha a mitad
  return {style: {opacity: p < 0.5 ? 1 : 0}, blur: {x: 0, y: 0}};
};

/** Estilo del segmento que ENTRA (q: 0→1 durante la transición). */
export const enterStyle = (type: TransitionType, q: number) => {
  if (type === 'dive') {
    return {style: {opacity: ss(0.0, 0.7, q)}, blur: {x: (1 - q) * 6, y: (1 - q) * 6}};
  }
  if (type === 'whip') {
    return {style: {transform: `translateX(${Math.pow(1 - q, 1.6) * 2300}px)`}, blur: {x: 8 + (1 - q) * 46, y: 0}};
  }
  return {style: {opacity: q < 0.5 ? 0 : 1}, blur: {x: 0, y: 0}};
};

/** Mancha de tinta que cubre la pantalla y se retira (transición inkblot). */
export const InkBlot: React.FC<{p: number; color: string; seed: number}> = ({p, color, seed}) => {
  if (p <= 0 || p >= 1) return null;
  const grow = p < 0.5 ? interpolate(p, [0, 0.5], [0, 1.25], {easing: t => 1 - Math.pow(1 - t, 3)}) : 1.25;
  const shrink = p >= 0.5 ? interpolate(p, [0.5, 1], [1, 0], {easing: t => t * t}) : 1;
  const drops = Array.from({length: 14}, (_, i) => {
    const a = (i / 14) * Math.PI * 2 + seed;
    const r = 520 + ((i * 97) % 300);
    return {x: Math.cos(a) * r * grow, y: Math.sin(a) * r * 0.62 * grow, s: 18 + ((i * 53) % 40)};
  });
  return (
    <svg width={1920} height={1080} viewBox="-960 -540 1920 1080" style={{position: 'absolute', inset: 0}}>
      <g transform={`scale(${grow * shrink * 1.9}) rotate(${p * 40})`} opacity={p < 0.5 ? 1 : shrink}>
        <path d={blobPath(seed, 560, 420, 0.22, 64)} fill={color} />
      </g>
      {drops.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.s * shrink} fill={color} opacity={0.9 * shrink} />
      ))}
    </svg>
  );
};
