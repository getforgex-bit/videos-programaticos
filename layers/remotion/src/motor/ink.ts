export type Point = [number, number];
export type Pen = CanvasRenderingContext2D;

export const color = {
  paper: '#edddb9',
  ink: '#503824',
  muted: '#785e43',
  guide: '#b59a74',
  light: '#e9d8b5',
  shade: '#ceba96',
  teal: '#765236',
  paleTeal: '#dac59f',
  copper: '#833f24',
  orange: '#a15730',
  paleCopper: '#d8aa79',
  white: '#f4e7ca',
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

function canvasOf(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
function prng(seed: number) {
  return () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
}
// The tooth of the paper breaks up the pigment even on long, heavy outlines.
const pencils = new Map<string, CanvasPattern>();
function pencil(p: Pen, tone: string) {
  const found = pencils.get(tone);
  if (found) return found;
  const tile = canvasOf(59, 59),
    ctx = tile.getContext('2d')!;
  ctx.fillStyle = tone;
  ctx.fillRect(0, 0, 59, 59);
  ctx.globalCompositeOperation = 'destination-out';
  const rand = prng(385);
  for (let i = 0; i < 1200; i++) {
    const x = rand() * 59,
      y = rand() * 59;
    ctx.fillStyle = 'rgba(0,0,0,' + (0.18 + rand() * 0.48) + ')';
    ctx.fillRect(x, y, 0.28 + rand() * 0.87, 0.3 + rand() * 0.88);
  }
  const pattern = p.createPattern(tile, 'repeat')!;
  pencils.set(tone, pattern);
  return pattern;
}

// A small, stationary deviation along each stroke gives the pen a grain.
// Coordinates, rather than frame numbers, seed it so still contours stay still.
export function line(p: Pen, pts: Point[], tone: string = color.ink, width = 1.5, progress = 1) {
  if (progress <= 0 || pts.length < 2) return;
  p.strokeStyle = pencil(p, tone);
  p.lineWidth = width * 1.18;
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
  if (width >= 1.05) {
    // Edge of a broad lead catching on the paper, alongside its darker core.
    p.save();
    p.globalAlpha *= 0.27;
    p.translate(-0.51, 0.44);
    p.lineWidth = width * 1.45;
    p.stroke();
    p.restore();
  }
}
let hatchTile: CanvasPattern | null = null;
function hatching(p: Pen) {
  if (hatchTile) return hatchTile;
  const tile = canvasOf(132, 132),
    ctx = tile.getContext('2d')!,
    rng = prng(75);
  // Parallel passes of a sharpened pencil with occasional gaps and doubled lines.
  for (let d = -132; d < 266; d += 4.4) {
    let x = d,
      y = 140;
    while (y > -12) {
      const length = 5 + rng() * 19;
      ctx.strokeStyle = 'rgba(91,61,34,' + (0.18 + rng() * 0.34) + ')';
      ctx.lineWidth = 0.43 + rng() * 0.65;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + length * 0.49 + 0.65, y - length * 0.48, x + length, y - length);
      ctx.stroke();
      const gap = rng() * 2.6;
      x += length + gap;
      y -= length + gap;
    }
  }
  hatchTile = p.createPattern(tile, 'repeat');
  return hatchTile!;
}
export function face(p: Pen, pts: Point[], fill: string, stroke = color.ink, width = 1.35) {
  p.beginPath();
  pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
  p.closePath();
  p.fillStyle = fill;
  p.fill();
  if (fill !== color.ink && fill !== color.paper && fill !== color.white) {
    p.save();
    p.globalAlpha *= fill === color.light ? 0.43 : 0.87;
    p.fillStyle = hatching(p);
    p.fill();
    p.restore();
  }
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

let sheet: HTMLCanvasElement | null = null;
let tooth: CanvasPattern | null = null;
// Large stains, individual fibres and fine grain live at separate scales.
function makePaper(p: Pen) {
  sheet = canvasOf(1280, 720);
  const ctx = sheet.getContext('2d')!,
    rng = prng(214);
  const vignette = ctx.createRadialGradient(680, 305, 120, 640, 365, 830);
  vignette.addColorStop(0, '#f3e7c9');
  vignette.addColorStop(0.63, '#edddbc');
  vignette.addColorStop(1, '#d6bf97');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 1280, 720);
  const clouds = canvasOf(62, 36),
    cc = clouds.getContext('2d')!;
  for (let i = 0; i < 62 * 36; i++) {
    const n = Math.floor(130 + 110 * rng());
    cc.fillStyle = 'rgb(' + n + ',' + Math.floor(n * 0.91) + ',' + Math.floor(n * 0.77) + ')';
    cc.fillRect(i % 62, Math.floor(i / 62), 1, 1);
  }
  ctx.globalAlpha = 0.155;
  ctx.drawImage(clouds, 0, 0, 1280, 720);
  ctx.globalAlpha = 1;
  const tile = canvasOf(251, 251),
    tc = tile.getContext('2d')!,
    img = tc.createImageData(tile.width, tile.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = rng();
    const light = v > 0.52;
    img.data[i] = light ? 255 : 82;
    img.data[i + 1] = light ? 250 : 56;
    img.data[i + 2] = light ? 224 : 34;
    img.data[i + 3] = Math.round(3 + Math.pow(Math.abs(2 * v - 1), 1.9) * 33);
  }
  tc.putImageData(img, 0, 0);
  for (let i = 0; i < 1700; i++) {
    const x = rng() * 251,
      y = rng() * 251;
    tc.strokeStyle = i % 3 ? 'rgba(79,56,32,.10)' : 'rgba(255,248,214,.33)';
    tc.lineWidth = 0.32 + rng() * 0.55;
    tc.beginPath();
    tc.moveTo(x, y);
    tc.lineTo(x + 1 + rng() * 5, y - 0.3 - rng() * 2);
    tc.stroke();
  }
  tooth = p.createPattern(tile, 'repeat');
}
export function paperGround(p: Pen) {
  if (!sheet) makePaper(p);
  p.drawImage(sheet!, 0, 0);
}
let captionPaper: HTMLCanvasElement | null = null;
export function clearCaptionArea(p: Pen, width: number, opacity: number) {
  if (!sheet || !opacity) return;
  if (!captionPaper) {
    // An eraser bed feathers out before the tip of each letter, without a caption box.
    captionPaper = canvasOf(1280, 144);
    const ctx = captionPaper.getContext('2d')!;
    ctx.drawImage(sheet, 0, 570, 1280, 144, 0, 0, 1280, 144);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.translate(640, 81);
    ctx.scale(635, 72);
    const mask = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    mask.addColorStop(0, '#000');
    mask.addColorStop(0.72, '#000');
    mask.addColorStop(1, 'transparent');
    ctx.fillStyle = mask;
    ctx.fillRect(-1, -1, 2, 2);
  }
  const w = Math.min(1180, (width + 45) * 1.58);
  layer(p, opacity, () => p.drawImage(captionPaper!, 640 - w / 2, 570, w, 144));
}
export function paperTooth(p: Pen) {
  if (tooth) {
    p.fillStyle = tooth;
    p.fillRect(0, 0, 1280, 720);
  }
}
