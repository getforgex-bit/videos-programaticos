import {Pen, Point, color as c, tau, face, line, dot, layer, hand, textAt, ramp, arc} from './ink';

type Space = [number, number, number];
const proj = (x: number, y: number, z: number): Point => [
  x * 0.88 + y * 0.62,
  x * 0.3 - y * 0.42 - z * 0.91,
];
const polar = (x: number, r: number, a: number) => proj(x, r * Math.cos(a), r * Math.sin(a));
const rim = (x: number, r: number, a = 0, b = tau, n = 66): Point[] =>
  Array.from({length: n + 1}, (_, i) => polar(x, r, a + ((b - a) * i) / n));
const segment = (p: Pen, a: Space, b: Space, tone: string = c.ink, w = 1) =>
  line(p, [proj(...a), proj(...b)], tone, w);
const crown = 0.964;
function tube(p: Pen, back: number, front: number, r: number, side: string, end: string, w = 1.45) {
  face(
    p,
    [...rim(back, r, crown, crown + Math.PI), ...rim(front, r, crown + Math.PI, crown)],
    side,
    c.ink,
    w,
  );
  face(p, rim(front, r), end, c.ink, w);
}
function box(
  p: Pen,
  x: number,
  y: number,
  z: number,
  dx: number,
  dy: number,
  dz: number,
  top: string,
  side: string,
) {
  const q = (a: number, b: number, d: number) => proj(x + dx * a, y + dy * b, z + dz * d);
  face(p, [q(0, 0, 0), q(1, 0, 0), q(1, 0, 1), q(0, 0, 1)], side);
  face(p, [q(1, 0, 0), q(1, 1, 0), q(1, 1, 1), q(1, 0, 1)], c.light);
  face(p, [q(0, 0, 1), q(1, 0, 1), q(1, 1, 1), q(0, 1, 1)], top);
}
function bolt(p: Pen, x: number, y: number, z: number, r: number) {
  const pts: Point[] = [];
  for (let i = 0; i < 6; i++)
    pts.push(proj(x, y + r * Math.cos((i * tau) / 6), z + r * Math.sin((i * tau) / 6)));
  face(p, pts, c.light, c.ink, 1.1);
  segment(p, [x, y - r * 0.55, z - r * 0.3], [x, y + r * 0.55, z + r * 0.3], c.muted, 0.8);
}
function feet(p: Pen) {
  for (const x of [-94, 59]) {
    box(p, x - 13, -68, -114, 26, 132, 9, c.light, c.shade);
    for (const y of [35, -55]) box(p, x - 10, y, -105, 20, 22, 41, c.light, c.shade);
    for (let j = 0; j < 5; j++)
      segment(p, [x - 8 + j * 3, -55, -102], [x - 5 + j * 3, -55, -97], c.muted, 0.55);
  }
}
function housing(p: Pen) {
  tube(p, -125, -111, 83, c.shade, c.light);
  tube(p, -112, 75, 86, '#e3e6d9', c.light);
  // Longitudinal fins cast short, pen-hatched shadows onto the barrel.
  for (let j = 0; j < 11; j++) {
    const a = crown + 0.1 + j * 0.281;
    const fin = [
      polar(-102, 85, a),
      polar(-95, 92, a),
      polar(62, 92, a),
      polar(70, 86, a),
      polar(68, 85, a + 0.046),
      polar(-100, 85, a + 0.046),
    ];
    face(p, fin, j > 6 ? c.shade : '#eef0e4', c.ink, 1.08);
    line(p, [polar(-94, 89.7, a), polar(59, 89.7, a)], c.muted, 0.58);
  }
  for (let j = 0; j < 6; j++) {
    const a = 2.6 + j * 0.22;
    for (let k = 0; k < 19; k++) {
      const x = -93 + k * 8;
      line(p, [polar(x, 86.5, a), polar(x + 4, 86.5, a + 0.048)], '#96a49c', 0.58);
    }
  }
  for (let k = 0; k < 21; k++) {
    const a = 2.31 + k * 0.043;
    line(p, [polar(-121, 83, a), polar(-115, 83, a + 0.035)], c.muted, 0.7);
  }
}
function cap(p: Pen, offset: number) {
  const x = 91 + offset;
  tube(p, x - 20, x - 12, 90, c.shade, c.light);
  tube(p, x - 11, x - 4, 84, c.light, c.light);
  tube(p, x - 4, x, 76, c.shade, '#e8ebdf');
  line(p, rim(x, 72), c.muted, 0.78);
  for (const a of [0.38, 1.89, 3.52, 5.07]) {
    bolt(p, x + 1, 65 * Math.cos(a), 65 * Math.sin(a), 5);
    for (let j = 0; j < 3; j++) {
      const r = 39 + j * 6;
      line(p, rim(x, r, a + 0.25, a + 1.1, 18), c.ink, 2.5);
      line(p, rim(x, r - 1.65, a + 0.25, a + 1.08, 18), c.white, 0.65);
    }
  }
  tube(p, x, x + 7, 27, c.shade, c.light);
  line(p, rim(x + 7, 22), c.muted, 0.9);
}
function terminal(p: Pen, lift: number) {
  box(p, -73, -27, 81 + lift, 71, 52, 18, c.light, c.shade);
  box(p, -77, -31, 99 + lift, 79, 60, 6, c.white, c.light);
  for (const x of [-69, -8])
    for (const y of [-24, 20]) {
      const [sx, sy] = proj(x, y, 105 + lift);
      line(p, arc(sx, sy, 2.4, 1.35), c.muted, 0.85);
    }
  for (let j = 0; j < 9; j++)
    segment(p, [-68 + j * 7, -27, 84 + lift], [-64 + j * 7, -27, 92 + lift], c.muted, 0.6);
}
function shaft(p: Pen, phase: number, open: number) {
  tube(p, open ? 74 : 96, 151, 12, c.shade, c.light);
  // The index on this keyed output coupling makes rotation visible even at full speed.
  tube(p, 147, 162, 25, c.shade, c.light);
  line(p, rim(162, 20), c.muted, 0.9);
  for (let i = 0; i < 3; i++) {
    const a = phase + (i * tau) / 3;
    line(p, rim(162, 16, a, a + 0.62, 16), i === 0 ? c.orange : c.muted, i === 0 ? 3.4 : 2);
  }
  const [px, py] = polar(162, 18, phase + 0.28);
  dot(p, px, py, 2.2, c.orange);
  face(p, rim(163, 6), c.ink);
}
function magnet(p: Pen, y: number) {
  const s = Math.sign(y);
  const a0 = s > 0 ? -0.65 : Math.PI - 0.65;
  const back = -63,
    front = 43;
  const section = (x: number) => [...rim(x, 74, a0, a0 + 1.3, 26), ...rim(x, 61, a0 + 1.3, a0, 26)];
  face(p, [...rim(back, 74, a0, a0 + 1.3), ...rim(front, 74, a0 + 1.3, a0)], '#c3d4cb');
  face(
    p,
    [
      polar(back, 74, a0 + 1.3),
      polar(front, 74, a0 + 1.3),
      polar(front, 61, a0 + 1.3),
      polar(back, 61, a0 + 1.3),
    ],
    '#dce5d8',
  );
  face(p, section(front), c.paleTeal);
  for (let j = 0; j < 12; j++) {
    const a = a0 + 0.08 + j * 0.102;
    line(p, [polar(front, 64, a), polar(front, 72, a + 0.047)], c.teal, 0.67);
  }
}
function coil(p: Pen, phase: number, flow: number, t: number) {
  const former = (x: number): Point[] => {
    const q = (r: number, d: number) =>
      proj(x, r * Math.cos(phase) - d * Math.sin(phase), r * Math.sin(phase) + d * Math.cos(phase));
    return [q(-39, -6), q(39, -6), q(39, 6), q(-39, 6)];
  };
  const back = former(-55),
    front = former(56);
  face(p, [back[0], back[1], front[1], front[0]], '#d5d5c8', c.muted, 0.8);
  face(p, [back[2], back[3], front[3], front[2]], '#e0dfce', c.muted, 0.8);
  face(p, front, c.light, c.muted, 1.0);
  const wire: Point[] = [polar(-103, 17, phase), polar(-87, 22, phase), polar(-76, 38, phase)];
  for (let i = 0; i < 4; i++) {
    const r = 40 + i * 2.7,
      xBack = -66 + i * 1.2,
      xFront = 69 - i * 1.4;
    wire.push(
      polar(xBack, r, phase),
      polar(xFront, r, phase),
      ...rim(xFront, 12, phase, phase + Math.PI, 14),
      polar(xFront, r, phase + Math.PI),
      polar(xBack, r, phase + Math.PI),
    );
    if (i < 3) wire.push(...rim(xBack, 12, phase + Math.PI, phase + tau, 14));
  }
  wire.push(
    polar(-76, 38, phase + Math.PI),
    polar(-87, 22, phase + Math.PI),
    polar(-103, 17, phase + Math.PI),
  );
  line(p, wire, c.ink, 3.25);
  line(p, wire, c.orange, 2.15);
  layer(p, flow, () => {
    const lengths = wire.slice(1).map((v, i) => Math.hypot(v[0] - wire[i][0], v[1] - wire[i][1]));
    const total = lengths.reduce((n, v) => n + v, 0);
    const dir = Math.cos(phase) < 0 ? 1 : -1;
    for (let j = 0; j < 6; j++) {
      let d = ((((dir * t * 0.105 + j / 6) % 1) + 1) % 1) * total;
      for (let i = 0; i < lengths.length; i++) {
        if (d <= lengths[i] && lengths[i] > 0) {
          const f = d / lengths[i];
          const x = wire[i][0] + f * (wire[i + 1][0] - wire[i][0]),
            y = wire[i][1] + f * (wire[i + 1][1] - wire[i][1]);
          dot(p, x, y, 2.6, c.copper);
          dot(p, x, y, 1.55, '#ffdda6');
          break;
        }
        d -= lengths[i];
      }
    }
  });
}
function inside(p: Pen, phase: number, flow: number, t: number) {
  tube(p, -150, 98, 9, c.shade, c.light);
  magnet(p, 1);
  coil(p, phase, flow, t);
  magnet(p, -1);
  tube(p, -129, -96, 17, c.paleCopper, '#d9a078', 1);
  for (const a of [phase + Math.PI / 2, phase - Math.PI / 2]) {
    line(p, [polar(-129, 17.4, a), polar(-96, 17.4, a)], c.ink, 1.7);
  }
  // Stationary carbon brushes press against the copper ring.
  box(p, -127, 16, -7, 20, 13, 14, c.muted, c.ink);
  box(p, -127, -33, -7, 20, 16, 14, c.muted, c.ink);
}
function guideShell(p: Pen) {
  p.save();
  p.setLineDash([4, 5]);
  for (const x of [-118, 85]) line(p, rim(x, 85), c.muted, 0.9);
  for (const a of [crown, crown + Math.PI]) line(p, [polar(-118, 85, a), polar(85, 85, a)], c.muted, 0.9);
  p.restore();
}

// Expose screen-space targets for pinning the handwritten leaders to real parts.
export const target = {
  coil: (phase: number) => polar(64.8, 48.1, phase),
  brush: proj(-120, -31, 1),
  magnet: proj(28, -74, 0),
  shaft: proj(160, 0, 0),
};

export function machine(p: Pen, t: number, phase: number, open: number, rebuild: number) {
  layer(p, 0.45, () => {
    for (let j = 0; j < 17; j++) {
      const x = -136 + j * 14;
      line(p, [proj(x, -87, -117), proj(x + 8, 48, -117)], c.guide, 0.65);
    }
  });
  feet(p);
  if (open > 0.001) {
    layer(p, open, () => guideShell(p));
    layer(p, Math.min(1, open * 1.8), () => inside(p, phase, ramp(t, 12.4, 14), t));
  }
  // All full-opacity parts are reconstructed in assembly order on the same axis.
  const solid = 1 - open;
  layer(p, rebuild ? ramp(rebuild, 0, 0.6) : solid, () => housing(p));
  layer(p, rebuild ? ramp(rebuild, 0.27, 0.84) : solid, () =>
    cap(p, rebuild ? 30 * (1 - ramp(rebuild, 0.27, 0.84)) : 0),
  );
  layer(p, rebuild ? ramp(rebuild, 0.48, 1) : solid, () =>
    terminal(p, rebuild ? 32 * (1 - ramp(rebuild, 0.48, 1)) : 0),
  );
  shaft(p, phase, open > 0.5 ? 1 : 0);
}

export function leader(
  p: Pen,
  start: Point,
  elbow: Point,
  end: Point,
  words: string,
  progress: number,
  align: CanvasTextAlign = 'left',
) {
  if (progress <= 0) return;
  const join: Point = [start[0] + (elbow[0] - start[0]) * 0.62, start[1] + (elbow[1] - start[1]) * 0.42];
  line(p, [start, join, elbow, end], c.muted, 1.35, progress);
  dot(p, start[0], start[1], 2.5, c.copper);
  layer(p, ramp(progress, 0.5, 1), () => textAt(p, words, end[0], end[1] - 8, hand(23), c.ink, align));
}
