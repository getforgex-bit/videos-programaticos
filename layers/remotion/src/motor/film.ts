import {
  Pen,
  Point,
  arc,
  arrow,
  clamp,
  color as c,
  dot,
  hand,
  layer,
  line,
  mixPoint,
  paperGround,
  clearCaptionArea,
  paperTooth,
  ramp,
  textAt,
  tau,
} from './ink';
import {machine, target} from './machine';
import {commutator, forces} from './section';

export const FPS = 30;
export const DURATION = 30;

// Each pose pins a point on the drawing to a point on the page. Moving the pin
// to the next component produces a travelling shot rather than a slide change.
type Pose = {t: number; subject: Point; page: Point; zoom: number; roll: number};
const pose = (t: number, subject: Point, page: Point, zoom: number, roll = 0): Pose => ({
  t,
  subject,
  page,
  zoom,
  roll,
});
const exterior: Pose[] = [
  pose(0, [0, 2], [815, 315], 1.93, -0.055),
  pose(1.20, [0, 2], [821, 313], 2.01, -0.038),
  pose(2.23, target.shaft, [835, 325], 4.05, 0.03),
  pose(2.88, target.shaft, [814, 321], 4.15, 0.041),
  pose(4.05, [0, 3], [660, 318], 1.75, -0.052),
  pose(5.22, [-8, 4], [668, 305], 1.88, -0.025),
  pose(6.42, [-147, -11], [621, 326], 2.52, 0.055),
  pose(7.46, [-130, -16], [616, 323], 2.64, 0.047),
  pose(8.92, [-15, -3], [653, 317], 2.45, -0.057),
  pose(9.82, [6, 1], [656, 314], 2.59, -0.038),
  pose(11.24, [63, 10], [644, 326], 4.23, 0.12),
];
const fieldCamera: Pose[] = [
  pose(10.65, [0, 0], [648, 325], 2.5, -0.1),
  pose(11.7, [0, 0], [643, 318], 1.65, -0.018),
  pose(12.85, [0, 0], [648, 317], 1.72, 0),
  pose(13.55, [-49, -4], [631, 312], 2.09, 0),
  pose(14.86, [-53, -9], [623, 309], 2.12, 0),
  pose(15.6, [52, 8], [656, 310], 2.05, 0),
  pose(16.65, [55, 8], [661, 312], 2.06, 0),
  pose(17.55, [0, 0], [649, 310], 1.64, 0),
  pose(18.95, [0, 0], [647, 307], 1.71, 0),
  pose(20.07, [0, 0], [645, 318], 3.35, -0.13),
];
const ringCamera: Pose[] = [
  pose(19.55, [0, 0], [645, 318], 2.94, -0.13),
  pose(20.48, [0, 0], [645, 312], 1.68, 0),
  pose(21.62, [-8, 0], [642, 312], 1.78, 0),
  pose(22.58, [-26, 0], [625, 312], 1.96, 0),
  pose(23.54, [2, 0], [641, 313], 1.74, 0),
  pose(24.8, [0, 0], [643, 315], 1.74, 0),
  pose(25.62, [0, 0], [642, 303], 2.45, 0.085),
];
const assembly: Pose[] = [
  pose(24.84, [-69, -9], [608, 315], 3.32, 0.1),
  pose(25.73, [0, 3], [665, 311], 1.83, -0.085),
  pose(26.28, [0, 3], [656, 310], 1.8, -0.052),
  pose(27.15, [14, -2], [696, 300], 1.96, -0.025),
  pose(28.27, [4, 3], [669, 315], 1.85, 0.016),
  pose(29.99, [0, 3], [644, 313], 1.94, -0.013),
];

function camera(p: Pen, t: number, keys: Pose[], draw: () => void) {
  let index = keys.findIndex((k) => k.t > t);
  if (index < 0) index = keys.length;
  const a = keys[Math.max(0, index - 1)],
    b = keys[Math.min(index, keys.length - 1)];
  const u = a === b ? 0 : ramp(t, a.t, b.t);
  const page = mixPoint(a.page, b.page, u),
    subject = mixPoint(a.subject, b.subject, u);
  const zoom = a.zoom + (b.zoom - a.zoom) * u;
  p.save();
  p.translate(...page);
  p.rotate(a.roll + (b.roll - a.roll) * u);
  p.scale(zoom, zoom);
  p.translate(-subject[0], -subject[1]);
  draw();
  p.restore();
}

// Leads are drawn in model space so both ends stay attached through the pan.
const positive: Point[] = [[-181, 49], [-160, 49], [-151, 40], [-151, -5], target.brush];
const negative: Point[] = [
  target.returnBrush,
  [-107, -66],
  [-206, -66],
  [-216, -54],
  [-216, 49],
  [-190, 49],
];
function bead(p: Pen, pts: Point[], u: number) {
  const lengths = pts.slice(1).map((b, i) => Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1]));
  let dist = clamp(u) * lengths.reduce((n, v) => n + v, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (dist <= lengths[i]) {
      const at = mixPoint(pts[i], pts[i + 1], dist / lengths[i]);
      dot(p, ...at, 3.6, c.copper);
      dot(p, ...at, 1.8, c.white);
      return;
    }
    dist -= lengths[i];
  }
}
function circuit(p: Pen, t: number) {
  const show = ramp(t, 5.42, 5.86) * (1 - ramp(t, 9.36, 10.0));
  layer(p, show, () => {
    line(p, positive, c.copper, 1.9, ramp(t, 5.6, 6.45));
    line(p, negative, c.muted, 1.4, ramp(t, 5.83, 6.76));
    line(
      p,
      [
        [-181, 39],
        [-181, 59],
      ],
      c.ink,
      2.4,
    );
    line(
      p,
      [
        [-190, 44],
        [-190, 54],
      ],
      c.ink,
      2.2,
    );
    textAt(p, '+', -177, 39, hand(12), c.copper);
    textAt(p, '−', -201, 39, hand(12), c.muted);
    if (t > 6.08) bead(p, positive, ((t - 6.08) * 0.9) % 1);
    if (t > 6.82) bead(p, negative, ((t - 6.82) * 0.85) % 1);
  });
}
function pencilBurst(p: Pen, at: Point, t: number, when: number, radius: number) {
  if (t < when || t > when + 0.4) return;
  const u = (t - when) / 0.4;
  layer(p, Math.sin(Math.PI * u) * 0.85, () => {
    for (let i = 0; i < 6; i++) {
      const a = 0.35 + (i * tau) / 6,
        r = radius * (0.7 + u * 0.8);
      line(
        p,
        [
          [at[0] + r * Math.cos(a), at[1] + r * Math.sin(a)],
          [at[0] + (r + radius * 0.31) * Math.cos(a), at[1] + (r + radius * 0.31) * Math.sin(a)],
        ],
        c.copper,
        1.5,
      );
    }
  });
}
function rotationMarks(p: Pen, t: number, opacity: number) {
  const [x, y] = target.shaft;
  layer(p, opacity, () => {
    for (let i = 0; i < 2; i++) {
      const a = t * 4.9 + i * 2.79;
      line(p, arc(x, y, 23 + i * 2, 36 + i * 4, a, a + 0.55), c.muted, 1.1);
    }
    arrow(p, arc(x, y, 28, 43, -1.45, 0.27), c.copper, 1.45, 5.2);
  });
}
function erasingShell(p: Pen, t: number, phase: number) {
  const wipe = ramp(t, 3.28, 5.02);
  if (wipe === 0) {
    machine(p, t, phase, 0, 0);
    return;
  }
  machine(p, t, phase, 1, 0, ramp(t, 5.95, 7.55));
  if (wipe === 1) return;
  const edge = -255 + 510 * wipe,
    boundary: Point[] = [];
  for (let y = -230; y <= 230; y += 6)
    boundary.push([edge + y * 0.36 + 2 * Math.sin(y * 0.31) + 1.17 * Math.sin(y * 0.73), y]);
  p.save();
  p.beginPath();
  p.moveTo(...boundary[0]);
  boundary.slice(1).forEach((pt) => p.lineTo(...pt));
  p.lineTo(520, 230);
  p.lineTo(520, -230);
  p.closePath();
  p.clip();
  machine(p, t, phase, 0, 0);
  p.restore();
  layer(p, 0.45 * Math.sin(Math.PI * wipe), () => {
    // Crumbs from the eraser stay close to the silhouette being lifted.
    for (let j = 0; j < 18; j++) {
      const y = -95 + ((j * 37) % 184),
        x = edge + y * 0.36 - 3 - ((j * 11) % 16);
      if (Math.abs(x) < 147)
        line(
          p,
          [
            [x, y],
            [x + 2 + (j % 5), y - 1.3],
          ],
          c.muted,
          0.72,
        );
    }
  });
}
function motorShot(p: Pen, t: number, closing = false) {
  const phase = closing
    ? -1.78 - (t - 25) * 4.4
    : -2.2 - 4.6 * Math.min(t, 4) - 0.78 * Math.max(0, t - 4);
  camera(p, t, closing ? assembly : exterior, () => {
    if (closing) {
      const rebuild = ramp(t, 25.66, 28.36);
      machine(p, t, phase, 1 - rebuild, rebuild);
      pencilBurst(p, [82, 20], t, 27.53, 15);
      pencilBurst(p, [-45, -86], t, 28.12, 10);
      rotationMarks(p, t, ramp(t, 28.3, 28.64));
    } else {
      erasingShell(p, t, phase);
      rotationMarks(p, t, (1 - ramp(t, 3.1, 3.45)) * 0.92);
      circuit(p, t);
      pencilBurst(p, target.brush, t, 7.15, 8);
    }
  });
}

function fieldShot(p: Pen, t: number) {
  camera(p, t, fieldCamera, () => forces(p, t));
}
function ringShot(p: Pen, t: number) {
  camera(p, t, ringCamera, () => {
    commutator(p, t);
    for (const x of [-110, 110]) pencilBurst(p, [x, 0], t, 22.32, 12);
  });
}

// A growing pencil circle matches the output shaft to the two frontal details.
function iris(p: Pen, t: number, start: number, end: number, draw: () => void) {
  const u = ramp(t, start, end);
  if (u <= 0) return;
  if (u >= 1) {
    paperGround(p);
    draw();
    return;
  }
  const r = 8 + u * 832;
  p.save();
  p.beginPath();
  p.ellipse(645, 316, r, r * 0.94, 0, 0, tau);
  p.clip();
  paperGround(p);
  draw();
  p.restore();
  layer(p, 0.78 * (1 - u), () => line(p, arc(645, 316, r, r * 0.94), c.muted, 1.8));
}
// The return to the exterior is drawn across the page in the direction of the shaft.
function pencilSweep(p: Pen, t: number, draw: () => void) {
  const u = ramp(t, 24.92, 25.62);
  const edge = -200 + 1650 * u;
  const path: Point[] = Array.from({length: 81}, (_, i) => {
    const y = i * 9;
    return [edge + (y - 360) * 0.33 + 3 * Math.sin(i * 0.66) + 2 * Math.sin(i * 1.64), y];
  });
  p.save();
  p.beginPath();
  p.moveTo(-10, 0);
  path.forEach((pt) => p.lineTo(...pt));
  p.lineTo(-10, 720);
  p.closePath();
  p.clip();
  paperGround(p);
  draw();
  p.restore();
  layer(p, 0.58 * Math.sin(Math.PI * u), () => {
    for (let j = 0; j < 44; j++) {
      const y = (j * 127) % 722,
        x = edge + (y - 360) * 0.33;
      line(
        p,
        [
          [x - 6, y + 3],
          [x + 10 + (j % 7) * 4, y - 5 - (j % 8)],
        ],
        c.muted,
        0.7 + (j % 3) * 0.27,
      );
    }
  });
}
type Cue = {from: number; end: number; text: string};
const cues: Cue[] = [
  {from: 1.85, end: 4.42, text: '¿Qué lo hace girar?'},
  {from: 4.48, end: 5.95, text: 'Mira bajo la carcasa.'},
  {from: 5.97, end: 8.05, text: 'De la pila a la escobilla.'},
  {from: 8.07, end: 10.88, text: 'La corriente recorre la bobina.'},
  {from: 10.94, end: 13.28, text: 'El campo va de norte a sur.'},
  {from: 13.31, end: 15.09, text: 'La corriente sale. Este lado sube.'},
  {from: 15.12, end: 17.1, text: 'La corriente entra. El otro lado baja.'},
  {from: 17.13, end: 19.64, text: 'Dos fuerzas hacen girar el eje.'},
  {from: 19.68, end: 22.28, text: 'El conmutador gira entre las escobillas.'},
  {from: 22.3, end: 25.62, text: 'Cada media vuelta, la corriente se invierte.'},
  {from: 25.66, end: 28.09, text: 'La carcasa vuelve a su sitio.'},
  {from: 28.13, end: 30.15, text: 'Y el giro continúa.'},
];
function lettering(p: Pen, t: number) {
  if (t < 1.86) {
    const alpha = 1 - ramp(t, 1.02, 1.48);
    layer(p, alpha, () => {
      p.save();
      p.translate(59 - 27 * (1 - alpha), 275);
      p.rotate(-0.061);
      textAt(p, 'El motor', 0, 0, hand(65), c.muted);
      textAt(p, 'invisible', -4, 94, hand(106), c.ink);
      line(
        p,
        [
          [3, 108],
          [90, 105],
          [185, 107],
          [303, 100],
        ],
        c.copper,
        3.2,
        ramp(t, 0, 0.59),
      );
      p.restore();
    });
  }
  const cue = cues.find((q) => t >= q.from && t < q.end);
  if (!cue) return;
  const u = ramp(t, cue.from, cue.from + 0.21),
    leave = ramp(t, cue.end - 0.13, cue.end);
  layer(p, 1 - leave, () => {
    p.save();
    p.font = hand(40);
    const w = p.measureText(cue.text).width;
    clearCaptionArea(p, w, u);
    p.translate(640, 653 + 8 * (1 - u));
    p.rotate(-0.012);
    p.beginPath();
    p.rect(-w / 2 - 6, -57, (w + 15) * u, 78);
    p.clip();
    textAt(p, cue.text, 0, 0, hand(40), c.ink, 'center');
    p.restore();
  });
}
export function drawFilm(p: Pen, t: number) {
  paperGround(p);
  if (t < 11.25) {
    motorShot(p, t);
    if (t > 10.68) iris(p, t, 10.68, 11.25, () => fieldShot(p, t));
  } else if (t < 20.1) {
    fieldShot(p, t);
    if (t > 19.55) iris(p, t, 19.55, 20.1, () => ringShot(p, t));
  } else if (t < 25.62) {
    ringShot(p, t);
    if (t > 24.92) pencilSweep(p, t, () => motorShot(p, t, true));
  } else motorShot(p, t, true);
  lettering(p, t);
  paperTooth(p);
}
