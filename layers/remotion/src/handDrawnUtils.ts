/**
 * Motor de Trazado a Lápiz / Carboncillo Sepia y Cámara Dopaminérgica (v2.0)
 * Inspirado en el boceto de referencia (image.png): papel pergamino, trazos gruesos de grafito/sepia,
 * sombreado diagonal a mano y transiciones de cámara de alta energía con mínima carga de texto.
 */

export const clamp = (val: number, lo = 0, hi = 1): number =>
  Math.max(lo, Math.min(hi, val));

export const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp((x - edge0) / Math.max(1e-6, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

export interface CameraTransform {
  scale: number;
  tx: number;
  ty: number;
  rotateDeg: number;
  flash: number;
  vignettePulse: number;
}

export interface MotorFrameState {
  frame: number;
  time: number;
  act: 1 | 2 | 3 | 4 | 5 | 6;
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
  camera: CameraTransform;
}

/**
 * Calcula la sacudida de cámara (camera shake) amortiguada en los instantes de impacto.
 */
const computeImpactShake = (
  frame: number,
): {sx: number; sy: number; sr: number; flash: number} => {
  // Frames exactos de impacto dopaminérgico (encendido, rayos-X, golpe de imanes, corriente, explosión F, conmutación, reconstrucción)
  const impacts: {f: number; amp: number}[] = [
    {f: 38, amp: 18}, // Arranque explosivo del motor
    {f: 122, amp: 22}, // Onda de choque Rayos-X
    {f: 148, amp: 15}, // Entra imán N
    {f: 168, amp: 15}, // Entra imán S
    {f: 188, amp: 14}, // Entra cámara central y escobillas
    {f: 242, amp: 18}, // Whip-zoom a terminales
    {f: 288, amp: 16}, // Choque de corriente eléctrica I
    {f: 376, amp: 26}, // ¡EXPLOSIÓN DE FUERZA DE LORENTZ F!
    {f: 542, amp: 20}, // Inicio de hiper-rotación
    {f: 722, amp: 22}, // Pullback de reconstrucción
    {f: 748, amp: 18}, // Cierre de blindaje exterior 1
    {f: 775, amp: 20}, // Cierre de blindaje exterior 2
  ];

  let sx = 0;
  let sy = 0;
  let sr = 0;
  let flash = 0;

  for (const imp of impacts) {
    const df = frame - imp.f;
    if (df >= 0 && df < 18) {
      const decay = Math.exp(-df * 0.28);
      sx += Math.sin(df * 2.7 + imp.f) * imp.amp * decay;
      sy += Math.cos(df * 3.4 + imp.f) * imp.amp * 0.8 * decay;
      sr += Math.sin(df * 2.1) * (imp.amp * 0.08) * decay;
      if (df < 5) {
        flash = Math.max(flash, (1 - df / 5) * (imp.amp / 26));
      }
    }
  }
  return {sx, sy, sr, flash};
};

/**
 * Coreografía de cámara dinámica entre las 6 escenas (zooms, paneos, inclinaciones y sacudidas).
 */
const computeCameraAtFrame = (
  f: number,
  rpm: number,
  commutationFlash: number,
): CameraTransform => {
  // Base camera targets por escena
  let scale = 1.0;
  let tx = 0;
  let ty = 0;
  let rot = 0;

  if (f < 120) {
    // Escena 1: Punch-in rápido desde 1.38x -> 1.02x + vibración de motor
    const p = smoothstep(0, 24, f);
    scale = 1.38 - 0.36 * p + 0.04 * smoothstep(38, 118, f);
    rot = (1 - p) * -3.5;
  } else if (f < 240) {
    // Escena 2: Revelación Rayos-X — Paneo de izquierda (Imán N) a derecha (Imán S) y centro
    const p1 = smoothstep(120, 145, f);
    const p2 = smoothstep(152, 178, f);
    const p3 = smoothstep(185, 225, f);
    scale = 1.06 + 0.22 * p1 - 0.16 * p3;
    tx = 160 * p1 - 310 * p2 + 150 * p3;
    ty = -25 * p1 + 25 * p3;
    rot = -2.2 * p1 + 4.0 * p2 - 1.8 * p3;
  } else if (f < 375) {
    // Escena 3: Macro Zoom al núcleo central y terminales de escobillas (entra I y B)
    const pIn = smoothstep(240, 266, f);
    const pPan = smoothstep(275, 355, f);
    scale = 1.12 + 0.38 * pIn; // Macro zoom 1.50x
    tx = -45 + 90 * pPan;
    ty = 55 - 110 * pPan;
    rot = 1.8 * Math.sin((f - 240) * 0.045);
  } else if (f < 540) {
    // Escena 4: Explosión de Vectores F (Arriba-Derecha y Abajo-Izquierda) + Arcos en N y S
    const pSnap = smoothstep(375, 395, f);
    const pOrbit = smoothstep(405, 530, f);
    scale = 1.50 - 0.34 * pSnap + 0.08 * Math.sin(pOrbit * Math.PI);
    tx = -55 * Math.cos(pOrbit * Math.PI);
    ty = 35 * Math.sin(pOrbit * Math.PI * 2);
    rot = 2.4 * Math.sin(pOrbit * Math.PI * 2);
  } else if (f < 720) {
    // Escena 5: Hiper-rotación y conmutación 180° (pulso rítmico con cada chispazo)
    const pZoom = smoothstep(540, 565, f);
    scale = 1.16 + 0.10 * pZoom + 0.05 * commutationFlash;
    tx = Math.sin(f * 0.08) * 18;
    ty = -18 * pZoom + Math.cos(f * 0.08) * 12;
    rot = Math.sin(f * 0.06) * 1.4;
  } else {
    // Escena 6: Pullback dramático y reconstrucción mecánica
    const pOut = smoothstep(720, 755, f);
    const pFinal = smoothstep(785, 880, f);
    scale = 1.26 - 0.26 * pOut + 0.04 * pFinal;
    tx = 0;
    ty = 12 * (1 - pOut);
    rot = (1 - pOut) * -2.0;
  }

  // Vibración continua de alta frecuencia proporcional a las RPM
  const engineVib = (rpm / 3000) * 2.2;
  const vx = Math.sin(f * 1.9) * engineVib;
  const vy = Math.cos(f * 2.3) * engineVib;

  const {sx, sy, sr, flash} = computeImpactShake(f);

  return {
    scale,
    tx: tx + sx + vx,
    ty: ty + sy + vy,
    rotateDeg: rot + sr,
    flash: Math.max(flash, commutationFlash * 0.28),
    vignettePulse: clamp((scale - 1.0) * 1.5 + flash * 0.6, 0, 1),
  };
};

const buildAllMotorStates = (totalFrames = 905): MotorFrameState[] => {
  const states: MotorFrameState[] = [];
  let thetaDeg = 15.0;

  for (let f = 0; f < totalFrames; f++) {
    const t = f / 30;
    const act: 1 | 2 | 3 | 4 | 5 | 6 =
      f < 120
        ? 1
        : f < 240
          ? 2
          : f < 375
            ? 3
            : f < 540
              ? 4
              : f < 720
                ? 5
                : 6;

    let rpm = 0;
    if (f < 38) {
      rpm = 0;
    } else if (f < 120) {
      rpm = 3000 * smoothstep(38, 72, f);
    } else if (f < 240) {
      rpm = 3000 * (1 - 0.85 * smoothstep(120, 155, f));
    } else if (f < 395) {
      rpm = 450 * (1 - 0.65 * smoothstep(240, 275, f));
    } else if (f < 540) {
      rpm = 157 + 1350 * smoothstep(410, 520, f);
    } else if (f < 720) {
      rpm = 1507 + 1693 * smoothstep(545, 665, f);
    } else {
      rpm = 3000;
    }

    const degPerFrame = (rpm / 3000) * 13.5;
    thetaDeg = (thetaDeg + degPerFrame) % 360;
    const thetaRad = (thetaDeg * Math.PI) / 180;

    let casingOpacity = 1;
    if (f < 120) {
      casingOpacity = smoothstep(5, 42, f);
    } else if (f < 240) {
      casingOpacity = 1.0 - 0.86 * smoothstep(125, 168, f);
    } else if (f < 720) {
      casingOpacity = 0.14;
    } else {
      casingOpacity = 0.14 + 0.86 * smoothstep(730, 785, f);
    }

    const internalsVisibility = smoothstep(135, 215, f);
    const bFieldProgress = smoothstep(250, 305, f);
    const currentActive = smoothstep(285, 335, f);
    const lorentzProgress = smoothstep(380, 425, f);

    const polarity: 1 | -1 = thetaDeg < 180 ? 1 : -1;
    const distToSwitch = Math.min(
      Math.abs(thetaDeg - 0),
      Math.abs(thetaDeg - 180),
      Math.abs(thetaDeg - 360),
    );
    const commutationFlash = clamp(1 - distToSwitch / 16) * currentActive;
    const torqueNorm = Math.abs(Math.sin(thetaRad)) * currentActive;
    const rawAcSin = Math.sin(thetaRad) * currentActive;
    const camera = computeCameraAtFrame(f, rpm, commutationFlash);

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
      camera,
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
 * Genera un path SVG con textura de lápiz/carboncillo a mano alzada.
 */
export const sketchLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed = 1,
  wobbleAmp = 1.6,
  overshoot = 4.0,
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

  const steps = Math.max(4, Math.floor(len / 12));
  const cmds: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const env = Math.sin(u * Math.PI);
    const w =
      env *
      wobbleAmp *
      (Math.sin(u * 19.3 + seed * 2.3) * 0.68 +
        Math.cos(u * 33.7 + seed * 4.1) * 0.32);
    const px = sx1 + (sx2 - sx1) * u + nx * w;
    const py = sy1 + (sy2 - sy1) * u + ny * w;
    cmds.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  return cmds.join(' ');
};

/**
 * Genera un rectángulo redondeado con trazo de boceto a mano (doble pasada opcional cambiando seed).
 */
export const sketchRoundedRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  seed = 1,
  wobble = 1.8,
): string => {
  const rad = Math.min(r, w * 0.45, h * 0.45);
  // Generamos puntos alrededor del perímetro redondeado con ligera perturbación orgánica
  const pts: {px: number; py: number}[] = [];
  const addArc = (cx: number, cy: number, a0: number, a1: number, n = 7) => {
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      pts.push({cx, cy, a} as unknown as {px: number; py: number});
      pts[pts.length - 1] = {
        px: cx + Math.cos(a) * rad,
        py: cy + Math.sin(a) * rad,
      };
    }
  };
  const addSeg = (x0: number, y0: number, x1: number, y1: number, n = 10) => {
    for (let i = 1; i < n; i++) {
      const u = i / n;
      pts.push({px: x0 + (x1 - x0) * u, py: y0 + (y1 - y0) * u});
    }
  };

  addArc(x + w - rad, y + rad, -Math.PI / 2, 0);
  addSeg(x + w, y + rad, x + w, y + h - rad);
  addArc(x + w - rad, y + h - rad, 0, Math.PI / 2);
  addSeg(x + w - rad, y + h, x + rad, y + h);
  addArc(x + rad, y + h - rad, Math.PI / 2, Math.PI);
  addSeg(x, y + h - rad, x, y + rad);
  addArc(x + rad, y + rad, Math.PI, (3 * Math.PI) / 2);
  addSeg(x + rad, y, x + w - rad, y);

  return (
    pts
      .map((p, idx) => {
        const jx = Math.sin(idx * 1.9 + seed * 3.1) * wobble;
        const jy = Math.cos(idx * 2.3 + seed * 1.7) * wobble;
        return `${idx === 0 ? 'M' : 'L'} ${(p.px + jx).toFixed(1)} ${(p.py + jy).toFixed(1)}`;
      })
      .join(' ') + ' Z'
  );
};

/**
 * Genera un arco elíptico o circular con trazo de lápiz a mano.
 */
export const sketchEllipseArc = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  startDeg = 0,
  endDeg = 368,
  seed = 1,
  wobbleAmp = 1.4,
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
 * Genera una flecha vectorial dibujada a mano con lápiz grueso.
 */
export const sketchArrow = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  headLen = 22,
  seed = 1,
): {shaft: string; head: string} => {
  const shaft = sketchLine(x1, y1, x2, y2, seed, 1.4, 0);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const a1 = angle + Math.PI * 0.8;
  const a2 = angle - Math.PI * 0.8;
  const hx1 = x2 + Math.cos(a1) * headLen;
  const hy1 = y2 + Math.sin(a1) * headLen;
  const hx2 = x2 + Math.cos(a2) * headLen;
  const hy2 = y2 + Math.sin(a2) * headLen;
  const head = `M ${hx1.toFixed(1)} ${hy1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} L ${hx2.toFixed(1)} ${hy2.toFixed(1)}`;
  return {shaft, head};
};
