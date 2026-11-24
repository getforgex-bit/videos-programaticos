import {Pen, Point, arc, arrow, color as c, dot, face, hand, layer, line, ramp, textAt} from './ink';

function symbol(p: Pen, at: Point, out: boolean, size: number) {
  const [x, y] = at;
  face(p, arc(x, y, size, size), c.paper, c.copper, 2.3);
  if (out) dot(p, x, y, size * 0.29, c.copper);
  else {
    const k = size * 0.41;
    line(
      p,
      [
        [x - k, y - k],
        [x + k, y + k],
      ],
      c.copper,
      2.2,
    );
    line(
      p,
      [
        [x + k, y - k],
        [x - k, y + k],
      ],
      c.copper,
      2.2,
    );
  }
}
function pole(p: Pen, sign: number, appear: number) {
  const a = sign < 0 ? Math.PI - 0.69 : -0.69;
  const pts = [...arc(0, 0, 226, 200, a, a + 1.38), ...arc(0, 0, 164, 150, a + 1.38, a)];
  layer(p, appear, () => {
    face(p, pts, c.paleTeal, c.teal, 1.8);
    for (let i = 0; i < 14; i++) {
      const theta = a + 0.04 + i * 0.099;
      const start: Point = [210 * Math.cos(theta), 188 * Math.sin(theta)];
      const end: Point = [222 * Math.cos(theta + 0.04), 196 * Math.sin(theta + 0.04)];
      line(p, [start, end], c.teal, 0.9);
    }
    textAt(p, sign < 0 ? 'N' : 'S', sign * 194, 10, hand(37), c.teal, 'center');
  });
}
// The field, the two forces and the resulting torque enter on successive beats.
export function forces(p: Pen, t: number) {
  const field = ramp(t, 10.9, 11.55),
    rotor = ramp(t, 10.25, 10.67);
  const theta = 0.91 * ramp(t, 17.18, 19.22);
  p.save();
  p.setLineDash([3, 8]);
  layer(p, 0.65, () => line(p, arc(0, 0, 142, 142), c.guide, 1.1, ramp(t, 10.8, 11.7)));
  p.restore();
  pole(p, -1, field);
  pole(p, 1, ramp(t, 11.17, 11.78));
  for (let row = -1; row <= 1; row++) {
    const y = row * 43;
    const progress = ramp(t, 11.2 + 0.14 * (row + 1), 12.08 + 0.14 * (row + 1));
    const emphasis = 1 - 0.62 * ramp(t, 13, 13.8);
    layer(p, emphasis, () =>
      arrow(
        p,
        [
          [-153, y],
          [-65, y - 1],
          [65, y + 0.4],
          [153, y],
        ],
        c.teal,
        1.8,
        10,
        progress,
      ),
    );
  }
  const a: Point = [-93 * Math.cos(theta), -93 * Math.sin(theta)];
  const b: Point = [-a[0], -a[1]];
  layer(p, rotor, () => {
    p.save();
    p.rotate(theta);
    const body: Point[] = [
      [-94, -13],
      [-60, -7],
      [-22, -7],
      [0, -12],
      [22, -7],
      [60, -7],
      [94, -13],
      [94, 13],
      [60, 7],
      [22, 7],
      [0, 12],
      [-22, 7],
      [-60, 7],
      [-94, 13],
    ];
    face(p, body, '#e3d8c3', c.ink, 1.25);
    for (let j = -52; j < 55; j += 9)
      line(
        p,
        [
          [j - 2, 5],
          [j + 2, -5],
        ],
        c.muted,
        0.6,
      );
    p.restore();
    face(p, arc(0, 0, 15, 15), c.paper, c.ink, 1.7);
    dot(p, 0, 0, 4, c.ink);
    symbol(p, a, true, 15);
    symbol(p, b, false, 15);
  });
  for (const [pt, dir] of [
    [a, -1],
    [b, 1],
  ] as [Point, number][]) {
    const on = dir < 0 ? ramp(t, 13.35, 13.87) : ramp(t, 15.18, 15.7);
    const [x, y] = pt;
    arrow(
      p,
      [
        [x, y + 18 * dir],
        [x + 1, y + 48 * dir],
        [x, y + 89 * dir],
      ],
      c.ink,
      3.7,
      16,
      on,
    );
  }
  arrow(p, arc(0, 0, 135, 135, -1.47, -0.2, 40), c.copper, 2.7, 13, ramp(t, 17.18, 17.95));
}
export function commutator(p: Pen, t: number) {
  const u = t - 19.65,
    appear = ramp(u, 0, 0.4);
  const turn = ramp(u, 0.75, 4.62);
  const theta = Math.PI * turn;
  const contact = Math.abs(Math.cos(theta)) > 0.105;
  layer(p, appear, () => {
    p.save();
    p.setLineDash([3, 7]);
    line(p, arc(0, 0, 143, 143), c.guide, 1.15);
    p.restore();
    for (const s of [-1, 1]) {
      const x = s * 146;
      face(
        p,
        [
          [s * 100, -17],
          [x, -17],
          [x, 17],
          [s * 100, 17],
        ],
        c.ink,
      );
      for (let j = 0; j < 5; j++)
        line(
          p,
          [
            [s * (110 + j * 6), -9],
            [s * (105 + j * 6), 6],
          ],
          c.guide,
          0.75,
        );
      line(
        p,
        [
          [x, 0],
          [s * 217, 0],
        ],
        c.ink,
        2.4,
      );
      textAt(p, s < 0 ? '+' : '−', s * 228, 8, hand(31), s < 0 ? c.copper : c.ink, 'center');
    }
    for (let i = 0; i < 2; i++) {
      const a = theta + Math.PI / 2 + i * Math.PI + 0.038;
      const b = a + Math.PI - 0.076;
      const fill = i === 0 ? '#c79c72' : '#e1c5a0';
      face(p, [...arc(0, 0, 100, 100, a, b), ...arc(0, 0, 57, 57, b, a)], fill, c.ink, 2);
      line(p, arc(0, 0, 94, 94, a + 0.02, b - 0.02), c.copper, 0.8);
      for (let j = 0; j < 24; j++) {
        const h = a + 0.045 + (j * (b - a - 0.09)) / 23;
        line(
          p,
          [
            [87 * Math.cos(h), 87 * Math.sin(h)],
            [94 * Math.cos(h + 0.045), 94 * Math.sin(h + 0.045)],
          ],
          c.copper,
          0.69,
        );
      }
      const mid = (a + b) / 2;
      textAt(
        p,
        i === 0 ? 'a' : 'b',
        77 * Math.cos(mid),
        77 * Math.sin(mid) + 7,
        hand(28),
        c.ink,
        'center',
      );
      const x = 131 * Math.cos(mid),
        y = 131 * Math.sin(mid);
      line(
        p,
        [
          [100 * Math.cos(mid), 100 * Math.sin(mid)],
          [x, y],
        ],
        c.copper,
        2.2,
      );
      if (contact) symbol(p, [x, y], x < 0, 12);
      else face(p, arc(x, y, 12, 12), c.paper, c.copper, 1.5);
    }
    face(p, arc(0, 0, 21, 21), c.light, c.ink, 1.8);
    line(p, arc(0, 0, 15, 15), c.muted, 1);
    dot(p, 0, 0, 3, c.ink);
    if (contact) {
      const q = (t * 1.6) % 1;
      dot(p, -212 + 58 * q, 0, 3.8, c.orange);
      dot(p, 154 + 58 * q, 0, 3.8, c.orange);
    }
    arrow(p, arc(0, 0, 157, 157, -2.27, -0.65), c.copper, 2.1, 12, ramp(u, 0.45, 1.55));
  });
}
