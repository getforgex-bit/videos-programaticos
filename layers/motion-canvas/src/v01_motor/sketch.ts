/**
 * Trazos "a mano" para Motion Canvas (equivalente de common/sketch.py).
 * Puntos densos + desplazamiento suave a lo largo de la normal, con semilla
 * fija para que el dibujo sea estable entre frames.
 */
import {Vector2} from '@motion-canvas/core';

export const INK = '#1E2430';
export const RED = '#D6402F';
export const BLUE = '#2D6BB3';
export const GREEN = '#23905E';
export const ORANGE = '#E07A1F';
export const PENCIL = '#8C929B';

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Re-muestrea una polilínea a paso ~constante (px). */
export function resample(pts: Vector2[], step = 4): Vector2[] {
  const out: Vector2[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const len = a.sub(b).magnitude;
    const n = Math.max(1, Math.ceil(len / step));
    for (let k = 1; k <= n; k++) out.push(Vector2.lerp(a, b, k / n));
  }
  return out;
}

/** Temblor de rotulador: ruido suave (3 octavas) a lo largo de la normal. */
export function wobble(pts: Vector2[], amp = 2.6, seed = 1, closed = false) {
  const p = resample(pts);
  const r = rng(seed);
  const s: number[] = [0];
  for (let i = 1; i < p.length; i++) s.push(s[i - 1] + p[i].sub(p[i - 1]).magnitude);
  const total = s[s.length - 1] || 1;
  const oct = [
    [1 / 260, 1.0],
    [1 / 85, 0.45],
    [1 / 30, 0.18],
  ].map(([f, a]) => ({
    f: closed ? Math.max(1, Math.round(f * total)) / total : f * (0.8 + r() * 0.45),
    a,
    ph: r() * Math.PI * 2,
  }));
  return p.map((pt, i) => {
    const prev = p[Math.max(0, i - 1)];
    const next = p[Math.min(p.length - 1, i + 1)];
    const t = next.sub(prev).normalized;
    const n = new Vector2(-t.y, t.x);
    let d = 0;
    for (const o of oct) d += o.a * Math.sin(2 * Math.PI * o.f * s[i] + o.ph);
    const ramp = closed ? 1 : Math.min(1, Math.max(0.35, Math.min(s[i], total - s[i]) / 20));
    return pt.add(n.scale(d * amp * ramp));
  });
}

/** Línea a mano: se pasa un poco de los extremos y se arquea levemente. */
export function roughLine(a: Vector2, b: Vector2, seed = 1, overshoot = 4) {
  const r = rng(seed * 7 + 3);
  const d = b.sub(a);
  const u = d.normalized;
  const n = new Vector2(-u.y, u.x);
  const bow = (r() - 0.5) * 0.03 * d.magnitude;
  const pts: Vector2[] = [];
  const o1 = overshoot * (0.3 + r());
  const o2 = overshoot * (0.3 + r());
  const N = 24;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const base = Vector2.lerp(a.sub(u.scale(o1)), b.add(u.scale(o2)), t);
    pts.push(base.add(n.scale(Math.sin(Math.PI * t) * bow)));
  }
  return wobble(pts, 1.6, seed);
}

/** Rectángulo a mano: un solo gesto que cierra pasándose de la esquina. */
export function roughRect(w: number, h: number, seed = 1) {
  const r = rng(seed);
  const j = () => (r() - 0.5) * 6;
  const x = w / 2;
  const y = h / 2;
  const c = [
    new Vector2(-x + j(), -y + j()),
    new Vector2(x + j(), -y + j()),
    new Vector2(x + j(), y + j()),
    new Vector2(-x + j(), y + j()),
  ];
  const start = Vector2.lerp(c[0], c[1], 0.08);
  const pts = [start, c[1], c[2], c[3], c[0], Vector2.lerp(c[0], c[1], 0.22)];
  return wobble(pts, 2.2, seed + 11);
}

/** Arco/círculo a mano (ángulos en radianes, sentido horario en pantalla). */
export function roughArc(cx: number, cy: number, rad: number, a0: number, a1: number, seed = 1) {
  const pts: Vector2[] = [];
  const N = 60;
  for (let i = 0; i <= N; i++) {
    const a = a0 + ((a1 - a0) * i) / N;
    pts.push(new Vector2(cx + rad * Math.cos(a), cy + rad * Math.sin(a)));
  }
  return wobble(pts, 1.8, seed);
}

/** Puntas de flecha abiertas (dos trazos) en `tip`, dirección `dir`. */
export function arrowHead(tip: Vector2, dir: Vector2, size = 22, seed = 1) {
  const d = dir.normalized;
  const ang = (28 * Math.PI) / 180;
  const heads: Vector2[][] = [];
  for (const sgn of [1, -1]) {
    const c = Math.cos(Math.PI - sgn * ang);
    const s = Math.sin(Math.PI - sgn * ang);
    const v = new Vector2(c * d.x - s * d.y, s * d.x + c * d.y);
    heads.push(roughLine(tip, tip.add(v.scale(size)), seed + sgn, 0));
  }
  return heads;
}

/** Bezier cuadrática a mano entre a y b, curvada `bend` (fracción). */
export function roughCurve(a: Vector2, b: Vector2, bend = 0.25, seed = 1) {
  const d = b.sub(a);
  const n = new Vector2(-d.y, d.x);
  const ctrl = Vector2.lerp(a, b, 0.5).add(n.scale(bend));
  const pts: Vector2[] = [];
  const N = 50;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push(
      a.scale((1 - t) * (1 - t)).add(ctrl.scale(2 * (1 - t) * t)).add(b.scale(t * t)),
    );
  }
  return wobble(pts, 1.8, seed);
}
