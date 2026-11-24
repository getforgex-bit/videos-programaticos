export type Point = [number, number];
export type Pen = CanvasRenderingContext2D;

export const color = {
  paper: '#f7f3e8',
  ink: '#243236',
  muted: '#526263',
  guide: '#aab5ac',
  light: '#e6e6d9',
  shade: '#c6d0c7',
  teal: '#246d70',
  paleTeal: '#caddd3',
  copper: '#a54628',
  orange: '#c85b34',
  paleCopper: '#e5b58b',
  white: '#fffcf3',
};
export const tau = 2 * Math.PI;
export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export function ramp(t: number, start: number, end: number) {
  const u = clamp((t - start) / (end - start));
  return u * u * (3 - 2 * u);
}
export function layer(p: Pen, opacity: number, paint: () => void) {
  if (opacity <= 0) return;
  p.save();
  p.globalAlpha *= Math.min(1, opacity);
  paint();
  p.restore();
}
export const mixPoint = (a: Point, b: Point, u: number): Point => [
  a[0] + (b[0] - a[0]) * u,
  a[1] + (b[1] - a[1]) * u,
];
export function arc(x: number, y: number, rx: number, ry: number, from = 0, to = tau, n = 70): Point[] {
  return Array.from({length: n + 1}, (_, i) => {
    const a = from + ((to - from) * i) / n;
    return [x + rx * Math.cos(a), y + ry * Math.sin(a)];
  });
}

// A small, stationary deviation along each stroke gives the pen a grain.
// Coordinates, rather than frame numbers, seed it so still contours stay still.
export function line(p: Pen, pts: Point[], tone: string = color.ink, width = 1.5, progress = 1) {
  if (progress <= 0 || pts.length < 2) return;
  p.strokeStyle = tone;
  p.lineWidth = width;
  p.lineJoin = 'round';
  p.lineCap = 'round';
  p.beginPath();
  p.moveTo(...pts[0]);
  const lengths = pts.slice(1).map((b, i) => Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1]));
  let left = progress >= 1 ? Infinity : lengths.reduce((a, b) => a + b, 0) * progress;
  for (let i = 0; i < lengths.length && left > 0; i++) {
    const a = pts[i],
      b = pts[i + 1],
      len = lengths[i];
    if (!len) continue;
    const end = Math.min(1, left / len);
    const steps = Math.ceil((len * end) / 8);
    for (let k = 1; k <= steps; k++) {
      const u = (k * end) / steps;
      const [x, y] = mixPoint(a, b, u);
      const j =
        Math.sin(Math.PI * u) *
        (Math.sin(x * 0.18 + y * 0.11) * 0.34 + Math.sin(y * 0.07 - x * 0.09) * 0.37);
      p.lineTo(x - (j * (b[1] - a[1])) / len, y + (j * (b[0] - a[0])) / len);
    }
    left -= len;
  }
  p.stroke();
}
export function face(p: Pen, pts: Point[], fill: string, stroke = color.ink, width = 1.35) {
  p.beginPath();
  pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
  p.closePath();
  p.fillStyle = fill;
  p.fill();
  if (width) line(p, [...pts, pts[0]], stroke, width);
}
export function dot(p: Pen, x: number, y: number, r: number, fill: string) {
  p.fillStyle = fill;
  p.beginPath();
  p.arc(x, y, r, 0, tau);
  p.fill();
}
export function arrow(p: Pen, pts: Point[], tone: string, width = 2, head = 10, progress = 1) {
  line(p, pts, tone, width, progress);
  if (progress < 0.89) return;
  const b = pts[pts.length - 1],
    a = pts[pts.length - 2];
  const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const wing = (s: number): Point => [
    b[0] - head * Math.cos(angle + s * 0.48),
    b[1] - head * Math.sin(angle + s * 0.48),
  ];
  line(p, [wing(-1), b, wing(1)], tone, width, clamp((progress - 0.89) / 0.11));
}
export function textAt(
  p: Pen,
  s: string,
  x: number,
  y: number,
  font: string,
  tone: string = color.ink,
  align: CanvasTextAlign = 'left',
) {
  p.font = font;
  p.fillStyle = tone;
  p.textAlign = align;
  p.fillText(s, x, y);
}
export const hand = (s: number) => s + 'px Kalam, cursive';
export const serif = (s: number) => s + 'px MotorDisplay, Georgia, serif';
export const mono = (s: number) => s + 'px "Liberation Mono", monospace';
export const sans = (s: number) => s + 'px "Liberation Sans", Arial, sans-serif';

let paper: CanvasPattern | null = null;
export function paperGround(p: Pen) {
  p.fillStyle = color.paper;
  p.fillRect(0, 0, 1280, 720);
  if (!paper) {
    const tile = document.createElement('canvas');
    tile.width = tile.height = 192;
    const c = tile.getContext('2d')!;
    const pixels = c.createImageData(192, 192);
    let seed = 3817;
    const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
    for (let i = 0; i < pixels.data.length; i += 4) {
      const n = random();
      pixels.data[i] = 76;
      pixels.data[i + 1] = 62;
      pixels.data[i + 2] = 40;
      pixels.data[i + 3] = Math.round(n * n * 17);
    }
    c.putImageData(pixels, 0, 0);
    for (let i = 0; i < 65; i++) {
      const x = random() * 192,
        y = random() * 192;
      c.strokeStyle = 'rgba(115,91,62,.075)';
      c.lineWidth = 0.65;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + random() * 5, y - random() * 1.3);
      c.stroke();
    }
    paper = p.createPattern(tile, 'repeat');
  }
  if (paper) {
    p.fillStyle = paper;
    p.fillRect(0, 0, 1280, 720);
  }
}
