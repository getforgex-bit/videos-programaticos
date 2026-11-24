import {
  Pen,
  Point,
  arc,
  arrow,
  color as c,
  dot,
  hand,
  layer,
  line,
  mono,
  paperGround,
  ramp,
  sans,
  serif,
  textAt,
} from './ink';
import {leader, machine, target} from './machine';
import {commutator, currentLegend, forces} from './section';

export const FPS = 30;
export const DURATION = 45;
const chapters = [
  {
    start: 0,
    end: 5.6,
    tag: 'EN MARCHA',
    title: ['El motor', 'invisible'],
    body: ['El eje ya está girando.', '¿Qué lo empuja desde dentro?'],
    foot: 'Motor de corriente continua con escobillas.',
  },
  {
    start: 5.6,
    end: 12.1,
    tag: 'BAJO LA CARCASA',
    title: ['A través', 'del metal'],
    body: ['La carcasa deja ver la bobina.', 'Los imanes están fijos.', 'La bobina gira con el eje.'],
    foot: 'La carcasa en transparencia deja ver el conjunto móvil.',
  },
  {
    start: 12.1,
    end: 19.6,
    tag: 'EL CIRCUITO',
    title: ['El camino', 'del cobre'],
    body: [
      'De la pila a la escobilla,',
      'del conmutador a la bobina.',
      'La corriente vuelve a la pila',
      'por la otra escobilla.',
    ],
    foot: 'La línea de cobre sigue el sentido convencional de la corriente.',
  },
  {
    start: 19.6,
    end: 27.9,
    tag: 'EL PAR MOTOR',
    title: ['Dos fuerzas,', 'un giro'],
    body: [
      'En el campo del imán, los dos',
      'lados de la bobina llevan corriente',
      'en sentidos opuestos. Uno sube',
      'y el otro baja. El eje gira.',
    ],
    foot: 'Corte frontal. El campo apunta del polo norte al polo sur.',
  },
  {
    start: 27.9,
    end: 37.2,
    tag: 'LA CONMUTACIÓN',
    title: ['Media', 'vuelta'],
    body: [
      'Al girar el anillo partido, cada',
      'escobilla pasa a la otra delga.',
      'La corriente se invierte en la',
      'bobina y el par conserva su sentido.',
    ],
    foot: 'El conmutador gira con el eje. Las escobillas permanecen fijas.',
  },
  {
    start: 37.2,
    end: DURATION,
    tag: 'RECONSTRUCCIÓN',
    title: ['De nuevo,', 'en marcha'],
    body: ['La tapa vuelve a su sitio.', 'Por dentro, cada media vuelta', 'repite el mismo intercambio.'],
    foot: 'Motor reensamblado. El ciclo continúa bajo la carcasa.',
  },
];
function label(p: Pen, s: string, x: number, y: number, size: number, tone: string) {
  p.font = mono(size);
  p.fillStyle = tone;
  p.textAlign = 'left';
  let at = x;
  for (const ch of s) {
    p.fillText(ch, at, y);
    at += p.measureText(ch).width + 1.45;
  }
}
function header(p: Pen) {
  const X = 57,
    Y = 44;
  for (const r of [7, 11]) line(p, arc(X + 12, Y - 3, r, r), c.teal, 1.25);
  line(
    p,
    [
      [X - 3, Y - 3],
      [X + 27, Y - 3],
    ],
    c.teal,
    1,
  );
  line(
    p,
    [
      [X + 12, Y - 18],
      [X + 12, Y + 12],
    ],
    c.teal,
    1,
  );
  label(p, 'CUADERNO DE MÁQUINAS', 95, 46, 13, c.ink);
  textAt(p, 'ELECTROMAGNETISMO   /   CC', 1223, 46, mono(13), c.muted, 'right');
  line(
    p,
    [
      [56, 68],
      [1224, 68],
    ],
    c.muted,
    0.9,
  );
}
function caption(p: Pen, i: number, t: number) {
  const s = chapters[i],
    u = t - s.start;
  const on = i === 0 ? 1 : ramp(u, 0, 0.42);
  const off = i === chapters.length - 1 ? 1 : 1 - ramp(t, s.end - 0.35, s.end);
  layer(p, on * off, () => {
    const x = 63,
      y = 170;
    line(
      p,
      [
        [x, y - 5],
        [x + 25, y - 5],
      ],
      c.copper,
      2.4,
    );
    label(p, '0' + (i + 1) + '   ' + s.tag, x + 36, y, 13, c.copper);
    const titleSize = i === 3 ? 75 : 82;
    for (let k = 0; k < s.title.length; k++) {
      textAt(p, s.title[k], x - 4, 262 + k * 80 + (1 - on) * 6, serif(titleSize), c.ink);
    }
    const len = [219, 193, 192, 168, 172, 238][i];
    line(
      p,
      [
        [x + 1, 359],
        [x + len * 0.26, 356],
        [x + len * 0.66, 357],
        [x + len, 355],
      ],
      c.orange,
      2.15,
      ramp(u, 0.12, 1.05),
    );
    line(
      p,
      [
        [x + 6, 361],
        [x + len * 0.56, 358],
        [x + len * 0.75, 359],
      ],
      c.paleCopper,
      1,
      ramp(u, 0.6, 1.25),
    );
    const words = i === 0 ? 1 : ramp(u, 0.24, 0.88);
    layer(p, words, () => s.body.forEach((v, k) => textAt(p, v, x, 410 + k * 32, sans(22), c.ink)));
    if (i === 3) layer(p, ramp(u, 0.8, 1.8), () => currentLegend(p, x + 2, 553));
    if (i === 4)
      layer(p, ramp(u, 2, 3.1), () => {
        const turn = Math.round(180 * ramp(u, 1.75, 6.5));
        textAt(p, turn + '°', x + 1, 576, serif(51), c.copper);
        textAt(p, 'giro del eje', x + 122, 573, hand(23), c.muted);
      });
    line(
      p,
      [
        [57, 637],
        [1223, 637],
      ],
      c.muted,
      0.8,
    );
    textAt(p, 'Fig. ' + String(i + 1).padStart(2, '0'), 62, 670, hand(23), c.copper);
    textAt(p, s.foot, 153, 669, sans(18), c.muted);
    for (let j = 0; j < chapters.length; j++) {
      line(
        p,
        [
          [1068 + j * 26, 664],
          [1085 + j * 26, 664],
        ],
        j <= i ? c.copper : c.guide,
        j === i ? 3.8 : 1.45,
      );
    }
  });
}
function battery(p: Pen, t: number, plus: Point, minus: Point) {
  const u = t - 12.1;
  // A single cell sits outside the frame of the machine. Each lead ends at a different brush.
  const y = 486,
    x = 571;
  const leadA: Point[] = [[x + 12, y], [x + 36, y], [x + 60, y - 18], [x + 60, plus[1] + 20], plus];
  const leadB: Point[] = [
    minus,
    [minus[0] - 15, minus[1] - 24],
    [x - 27, minus[1] - 24],
    [x - 38, minus[1] - 6],
    [x - 38, y],
    [x - 2, y],
  ];
  const progress = ramp(u, 0.45, 2.4);
  line(p, leadA, c.copper, 2.1, progress);
  line(p, leadB, c.muted, 1.8, ramp(u, 1.45, 3.15));
  line(
    p,
    [
      [x + 12, y - 14],
      [x + 12, y + 14],
    ],
    c.copper,
    2.6,
    ramp(u, 0, 0.55),
  );
  line(
    p,
    [
      [x - 2, y - 7],
      [x - 2, y + 7],
    ],
    c.ink,
    2.8,
    ramp(u, 0.15, 0.7),
  );
  layer(p, ramp(u, 0.3, 1), () => {
    textAt(p, '+', x + 17, y - 13, mono(18), c.copper);
    textAt(p, '−', x - 19, y - 13, mono(18), c.muted);
    textAt(p, 'pila', x + 4, y + 42, hand(24), c.ink, 'center');
  });
  layer(p, ramp(u, 2.35, 3.15), () => {
    const moving = (pts: Point[]) => {
      const lengths = pts.slice(1).map((b, i) => Math.hypot(pts[i][0] - b[0], pts[i][1] - b[1]));
      let d = ((u * 0.57) % 1) * lengths.reduce((a, b) => a + b, 0);
      for (let j = 0; j < lengths.length; j++) {
        if (d <= lengths[j]) {
          const f = d / lengths[j];
          dot(
            p,
            pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f,
            pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f,
            3.9,
            c.orange,
          );
          return;
        }
        d -= lengths[j];
      }
    };
    moving(leadA);
    moving(leadB);
  });
}
function mechanism(p: Pen, t: number) {
  const expose = ramp(t, 5.65, 8.15);
  const rebuild = ramp(t, 38.05, 42.65);
  const open = expose * (1 - rebuild);
  const x = 866 + 31 * ramp(t, 11.55, 13.4) - 31 * ramp(t, 37.2, 39.3);
  const y = 340 - 3 * open;
  const k = 1.61 + 0.065 * expose - 0.065 * rebuild;
  const place = (pt: Point): Point => [x + pt[0] * k, y + pt[1] * k];
  const phase = -t * 3.6 + 3.03 * Math.max(t - 5.7, 0) - 2.7 * Math.max(t - 41.4, 0);
  // Screen-space shaft rotation is clockwise from the output end.
  p.save();
  p.translate(x, y);
  p.scale(k, k);
  machine(p, t, phase, open, rebuild);
  p.restore();
  const introNote = ramp(t, 0.4, 1.7) * (1 - ramp(t, 5.1, 5.55)) + ramp(t, 42.2, 43.1);
  leader(p, place(target.shaft), [1152, 328], [1220, 328], 'eje de salida', introNote, 'right');
  const insideNote =
    ramp(t, 7.2, 8.3) * (1 - ramp(t, 11.5, 12.0)) + ramp(t, 37.4, 37.96) * (1 - ramp(t, 38.5, 39.3));
  leader(p, place(target.magnet), [734, 545], [637, 545], 'imán fijo', insideNote);
  leader(
    p,
    place(target.coil(phase)),
    [1054, 170],
    [1140, 170],
    'bobina',
    ramp(t, 8.35, 9.45) * (1 - ramp(t, 11.5, 12)),
    'right',
  );
  if (t >= 12.1 && t < 19.6) {
    battery(p, t, place(target.brush), place([-120 * 0.88 + 25 * 0.62, -120 * 0.3 - 25 * 0.42]));
    leader(
      p,
      place([-99 * 0.88 - 8 * 0.62, -99 * 0.3 + 8 * 0.42 - 11 * 0.91]),
      [751, 183],
      [628, 183],
      'conmutador',
      ramp(t, 14, 15.3),
    );
    leader(p, place(target.brush), [666, 363], [568, 363], 'escobilla', ramp(t, 15.25, 16.7));
  }
  if (t < 5.6 || t >= 41.4) {
    const op = t < 5.6 ? ramp(t, 1, 2) * (1 - ramp(t, 5.12, 5.55)) : ramp(t, 41.8, 43.2);
    const [ax, ay] = place(target.shaft);
    layer(p, op, () => arrow(p, arc(ax, ay, 43, 64, -1.48, 0.35), c.copper, 2.15, 12, op));
  }
}
export function drawFilm(p: Pen, t: number) {
  paperGround(p);
  header(p);
  const i = chapters.findIndex((s) => t < s.end);
  const index = i < 0 ? chapters.length - 1 : i;
  const machineOpacity = 1 - ramp(t, 19.25, 19.6) + ramp(t, 37.12, 37.67);
  layer(p, Math.min(1, machineOpacity), () => mechanism(p, t));
  if (t >= 19.6 && t < 27.9) {
    p.save();
    p.translate(883, 366);
    layer(p, 1 - ramp(t, 27.55, 27.9), () => forces(p, t));
    p.restore();
  }
  if (t >= 27.9 && t < 37.22) {
    p.save();
    p.translate(881, 370);
    layer(p, 1 - ramp(t, 36.82, 37.2), () => commutator(p, t));
    p.restore();
  }
  caption(p, index, t);
}
