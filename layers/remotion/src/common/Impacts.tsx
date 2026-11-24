import {interpolate} from 'remotion';

/** Efectos de "golpe": sacudida, destello y empuje de zoom que decaen. */
export const impactAt = (frame: number, impacts: number[]) => {
  let shakeX = 0;
  let shakeY = 0;
  let flash = 0;
  let punch = 0;
  for (const f0 of impacts) {
    const age = frame - f0;
    if (age < 0 || age > 14) continue;
    const k = Math.exp(-age / 3.2);
    shakeX += Math.sin(age * 2.7 + f0) * 15 * k;
    shakeY += Math.cos(age * 3.3 + f0 * 1.7) * 11 * k;
    flash = Math.max(flash, interpolate(age, [0, 1, 7], [0.55, 0.45, 0], {extrapolateRight: 'clamp'}));
    punch = Math.max(punch, 0.045 * k);
  }
  return {shakeX, shakeY, flash, punch};
};
