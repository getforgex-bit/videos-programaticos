import {
  Pen,
  Point,
  arc,
  arrow,
  color as c,
  dot,
  face,
  hand,
  layer,
  line,
  mono,
  ramp,
  serif,
  textAt,
} from './ink';

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
export function currentLegend(p: Pen, x: number, y: number) {
  symbol(p, [x + 9, y - 5], true, 9);
  textAt(p, 'sale del papel', x + 27, y, hand(21), c.copper);
  symbol(p, [x + 9, y + 30], false, 9);
  textAt(p, 'entra en el papel', x + 27, y + 35, hand(21), c.copper);
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
    textAt(p, sign < 0 ? 'N' : 'S', sign * 194, 10, serif(35), c.teal, 'center');
  });
}
export function forces(p: Pen, t: number) {
  const local = t - 19.6;
  const field = ramp(local, 0.2, 1.36);
  const rotor = ramp(local, 0.7, 1.65);
  const forcesOn = ramp(local, 2.15, 3.6);
  const theta = 0.66 * ramp(local, 4.2, 7.4);
  p.save();
  p.setLineDash([3, 7]);
  line(p, arc(0, 0, 142, 142), c.guide, 1.2, ramp(local, 0, 1));
  p.restore();
  pole(p, -1, field);
  pole(p, 1, field);
  layer(p, field, () => {
    for (let i = -1; i <= 1; i++) {
      const y = i * 44;
      const pts: Point[] = [
        [-153, y],
        [-100, y - 0.6],
        [0, y],
        [95, y + 0.7],
        [153, y],
      ];
      arrow(p, pts, c.teal, 1.35, 9, ramp(local, 0.65 + (i + 1) * 0.17, 1.9 + (i + 1) * 0.17));
    }
    textAt(p, 'campo magnético', 0, -179, hand(25), c.teal, 'center');
    arrow(
      p,
      [
        [-50, -159],
        [49, -159],
      ],
      c.teal,
      1.5,
      9,
      field,
    );
  });
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
    const x = pt[0],
      y = pt[1];
    arrow(
      p,
      [
        [x, y + 19 * dir],
        [x, y + 82 * dir],
      ],
      c.ink,
      3.7,
      15,
      forcesOn,
    );
    layer(p, forcesOn, () => textAt(p, 'F', x + 13, y + 71 * dir + 5, hand(25), c.ink));
  }
  arrow(p, arc(0, 0, 131, 131, -1.38, -0.38, 30), c.copper, 2.2, 12, ramp(local, 3.7, 5.2));
  layer(p, ramp(local, 4.1, 5.4), () => textAt(p, 'giro', 86, -116, hand(24), c.copper));
}
export function commutator(p: Pen, t: number) {
  const u = t - 27.9,
    appear = ramp(u, 0, 0.85);
  const turn = ramp(u, 1.75, 6.5);
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
      textAt(p, s < 0 ? '+' : '−', s * 228, 8, serif(29), s < 0 ? c.copper : c.ink, 'center');
    }
    for (let i = 0; i < 2; i++) {
      const a = theta + Math.PI / 2 + i * Math.PI + 0.038;
      const b = a + Math.PI - 0.076;
      const fill = i === 0 ? '#da9970' : '#ebc19a';
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
    textAt(
      p,
      turn < 0.01
        ? 'inicio de la media vuelta'
        : turn > 0.99
          ? 'media vuelta completa'
          : 'giro del conmutador',
      0,
      -174,
      hand(24),
      c.copper,
      'center',
    );
    line(
      p,
      [
        [149, 17],
        [171, 69],
        [211, 69],
      ],
      c.muted,
      1.2,
      ramp(u, 0.25, 1.4),
    );
    layer(p, ramp(u, 0.7, 1.5), () => textAt(p, 'escobilla fija', 205, 94, hand(22), c.ink, 'right'));
    textAt(p, 'a  /  b', -62, 188, mono(16), c.copper, 'right');
    textAt(p, 'dos delgas de cobre', -46, 190, hand(23), c.ink);
  });
}
