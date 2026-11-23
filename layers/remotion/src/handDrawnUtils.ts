/**
 * Utilidades de Geometría y Trazado a Mano Alzada (Estilo 2: Whiteboard / Dibujo a mano)
 * Proyecto: Idea A — El motor invisible
 */

export const clamp = (val: number, lo = 0, hi = 1): number =>
  Math.max(lo, Math.min(hi, val));

export const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp((x - edge0) / Math.max(1e-6, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

export interface MotorFrameState {
  frame: number;
  time: number;
  act: 1 | 2 | 3 | 4 | 5;
  rpm: number;
  thetaDeg: number;
  thetaRad: number;
  casingOpacity: number;
  internalsVisibility: number;
  bFieldProgress: number;
  currentActive: number;
  lorentzProgress: number;
  polarity: 1 | -1;
  commutationFlash: number;
  torqueNorm: number;
  rawAcSin: number;
}

const buildAllMotorStates = (totalFrames = 905): MotorFrameState[] => {
  const states: MotorFrameState[] = [];
  let thetaDeg = 25.0;

  for (let f = 0; f < totalFrames; f++) {
    const t = f / 30;
    const act: 1 | 2 | 3 | 4 | 5 =
      f < 180 ? 1 : f < 360 ? 2 : f < 570 ? 3 : f < 720 ? 4 : 5;

    let rpm = 0;
    if (f < 75) {
      rpm = 0;
    } else if (f < 180) {
      rpm = 2800 * smoothstep(75, 135, f);
    } else if (f < 360) {
      rpm = 2800 - 2350 * smoothstep(180, 240, f);
    } else if (f < 435) {
      rpm = 450 * (1 - 0.75 * smoothstep(360, 395, f));
    } else if (f < 570) {
      rpm = 112.5 + 1100 * smoothstep(435, 550, f);
    } else if (f < 720) {
      rpm = 1212.5 + 1787.5 * smoothstep(580, 700, f);
    } else {
      rpm = 3000;
    }

    const degPerFrame = (rpm / 3000) * 11.5;
    thetaDeg = (thetaDeg + degPerFrame) % 360;
    const thetaRad = (thetaDeg * Math.PI) / 180;

    let casingOpacity = 1;
    if (f < 180) {
      casingOpacity = smoothstep(10, 80, f);
    } else if (f < 360) {
      casingOpacity = 1.0 - 0.82 * smoothstep(190, 260, f);
    } else if (f < 720) {
      casingOpacity = 0.18 - 0.04 * smoothstep(360, 400, f);
    } else {
      casingOpacity = 0.14 + 0.86 * smoothstep(735, 835, f);
    }

    const internalsDraw = smoothstep(210, 330, f);
    const internalsVisibility =
      f >= 740 ? 1.0 - 0.25 * smoothstep(750, 845, f) : internalsDraw;

    const bFieldProgress = smoothstep(365, 425, f);
    const currentActive = smoothstep(415, 465, f);
    const lorentzProgress = smoothstep(455, 510, f);

    const polarity: 1 | -1 = thetaDeg < 180 ? 1 : -1;
    const distToSwitch = Math.min(
      Math.abs(thetaDeg - 0),
      Math.abs(thetaDeg - 180),
      Math.abs(thetaDeg - 360),
    );
    const commutationFlash = clamp(1 - distToSwitch / 14) * currentActive;
    const torqueNorm = Math.abs(Math.sin(thetaRad)) * currentActive;
    const rawAcSin = Math.sin(thetaRad) * currentActive;

    states.push({
      frame: f,
      time: t,
      act,
      rpm,
      thetaDeg,
      thetaRad,
      casingOpacity,
      internalsVisibility,
      bFieldProgress,
      currentActive,
      lorentzProgress,
      polarity,
      commutationFlash,
      torqueNorm,
      rawAcSin,
    });
  }
  return states;
};

export const ALL_MOTOR_STATES: MotorFrameState[] = buildAllMotorStates(905);

export const getMotorStateAtFrame = (targetFrame: number): MotorFrameState => {
  const idx = Math.max(0, Math.min(ALL_MOTOR_STATES.length - 1, targetFrame));
  return ALL_MOTOR_STATES[idx];
};

/**
 * Genera un path SVG de línea trazada a mano con imperfección controlada de marcador.
 */
export const sketchLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed = 1,
  wobbleAmp = 1.35,
  overshoot = 3.5,
): string => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1e-3) return `M ${x1} ${y1}`;

  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;

  const sx1 = x1 - ux * overshoot;
  const sy1 = y1 - uy * overshoot;
  const sx2 = x2 + ux * overshoot;
  const sy2 = y2 + uy * overshoot;

  const steps = Math.max(4, Math.floor(len / 14));
  const cmds: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const env = Math.sin(u * Math.PI);
    const w =
      env *
      wobbleAmp *
      (Math.sin(u * 17.3 + seed * 2.1) * 0.7 +
        Math.cos(u * 31.7 + seed * 4.3) * 0.3);
    const px = sx1 + (sx2 - sx1) * u + nx * w;
    const py = sy1 + (sy2 - sy1) * u + ny * w;
    cmds.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  return cmds.join(' ');
};

/**
 * Genera un arco elíptico o elipse completa con trazo de dibujo a mano.
 */
export const sketchEllipseArc = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  startDeg = 0,
  endDeg = 368,
  seed = 1,
  wobbleAmp = 1.2,
  steps = 44,
): string => {
  const cmds: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const deg = startDeg + (endDeg - startDeg) * u;
    const rad = (deg * Math.PI) / 180;
    const wR =
      wobbleAmp *
      (Math.sin(u * 19.1 + seed * 1.7) * 0.65 +
        Math.cos(u * 37.0 + seed * 3.1) * 0.35);
    const px = cx + (rx + wR) * Math.cos(rad);
    const py = cy + (ry + wR) * Math.sin(rad);
    cmds.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  return cmds.join(' ');
};

/**
 * Genera una flecha vectorial dibujada a mano (eje + punta de flecha).
 */
export const sketchArrow = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  headLen = 18,
  seed = 1,
): {shaft: string; head: string} => {
  const shaft = sketchLine(x1, y1, x2, y2, seed, 1.2, 0);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const a1 = angle + Math.PI * 0.82;
  const a2 = angle - Math.PI * 0.82;
  const hx1 = x2 + Math.cos(a1) * headLen;
  const hy1 = y2 + Math.sin(a1) * headLen;
  const hx2 = x2 + Math.cos(a2) * headLen;
  const hy2 = y2 + Math.sin(a2) * headLen;
  const head = `M ${hx1.toFixed(1)} ${hy1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} L ${hx2.toFixed(1)} ${hy2.toFixed(1)}`;
  return {shaft, head};
};
