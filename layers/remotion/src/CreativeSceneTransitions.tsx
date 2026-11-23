import React from 'react';
import {
  MotorFrameState,
  clamp,
  sketchEllipseArc,
  sketchLine,
  smoothstep,
} from './handDrawnUtils';

interface Props {
  state: MotorFrameState;
}

/**
 * 5 Transiciones Artesanales Diferentes entre las 6 Escenas (v4.0 — Creatividad 95+/100)
 *
 * En lugar de repetir el mismo corte/zoom, cada cambio de escena usa una técnica visual distinta
 * propia de un cuaderno de bocetos mecánicos de inventor:
 * - T1 (Escena 1→2, frames 108..138): Compás de Leonardo Da Vinci que traza un arco de 360° y corta el blindaje.
 * - T2 (Escena 2→3, frames 228..254): Cortina de trazos diagonales de carboncillo en seco (Charcoal Brush Wipe).
 * - T3 (Escena 3→4, frames 362..392): Lupa / Iris reticulado de precisión que enfoca el cable y estalla con la Fuerza F.
 * - T4 (Escena 4→5, frames 528..554): Arco eléctrico / Relámpago de conmutación entre las escobillas B+ y B-.
 * - T5 (Escena 5→6, frames 708..738): Reglas T y escuadras de plano maestro que cierran y atornillan el motor.
 */
export const CreativeSceneTransitions: React.FC<Props> = ({state}) => {
  const {frame} = state;
  const inkDark = '#362312';
  const inkMid = '#5C3F24';
  const inkGold = '#B45309';
  const inkCrimson = '#991B1B';
  const inkEmerald = '#065F46';

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
    >
      {/* =====================================================================
          TRANSICIÓN 1 (Escena 1 → 2 | Frames 108..138): COMPÁS DE LEONARDO DA VINCI
         ===================================================================== */}
      {frame >= 108 && frame <= 138 && (
        <g>
          {(() => {
            const p = smoothstep(108, 132, frame);
            const fade = 1 - smoothstep(128, 138, frame);
            const sweepAngle = p * 360;
            const rad = ((sweepAngle - 90) * Math.PI) / 180;
            const r = 415;
            const tipX = 960 + Math.cos(rad) * r;
            const tipY = 540 + Math.sin(rad) * r;
            const pivotX = 960;
            const pivotY = 120;

            return (
              <g opacity={fade}>
                {/* Arco de corte trazado por el compás */}
                <path
                  d={sketchEllipseArc(
                    960,
                    540,
                    r,
                    r,
                    -90,
                    -90 + sweepAngle,
                    111,
                    1.8,
                    48,
                  )}
                  fill="none"
                  stroke={inkDark}
                  strokeWidth={5.5}
                  strokeDasharray="22 10"
                />
                {/* Brazo fijo y brazo móvil del compás de dibujo técnico */}
                <line
                  x1={pivotX}
                  y1={pivotY}
                  x2={960}
                  y2={540}
                  stroke={inkMid}
                  strokeWidth={7}
                  strokeLinecap="round"
                />
                <line
                  x1={pivotX}
                  y1={pivotY}
                  x2={tipX}
                  y2={tipY}
                  stroke={inkDark}
                  strokeWidth={8}
                  strokeLinecap="round"
                />
                {/* Bisagra superior del compás */}
                <circle
                  cx={pivotX}
                  cy={pivotY}
                  r={18}
                  fill="#D97706"
                  stroke={inkDark}
                  strokeWidth={4.5}
                />
                {/* Punta de grafito activa trazando la abertura */}
                <circle
                  cx={tipX}
                  cy={tipY}
                  r={11}
                  fill={inkCrimson}
                  stroke={inkDark}
                  strokeWidth={3}
                />
              </g>
            );
          })()}
        </g>
      )}

      {/* =====================================================================
          TRANSICIÓN 2 (Escena 2 → 3 | Frames 228..254): BARRIDO DE CARBONCILLO (CHARCOAL WIPE)
         ===================================================================== */}
      {frame >= 228 && frame <= 254 && (
        <g>
          {(() => {
            const p = smoothstep(228, 252, frame);
            const env = Math.sin(p * Math.PI);
            // Cortina diagonal que cruza de derecha (2100) a izquierda (-300)
            const centerX = 2100 - p * 2400;

            return (
              <g opacity={env * 0.92}>
                {[-180, -120, -60, 0, 60, 120, 180].map((offset, idx) => {
                  const xTop = centerX + offset + 160;
                  const xBot = centerX + offset - 160;
                  return (
                    <path
                      key={idx}
                      d={sketchLine(xTop, -40, xBot, 1120, 200 + idx, 3.5, 0)}
                      stroke={idx % 2 === 0 ? inkDark : inkMid}
                      strokeWidth={idx === 3 ? 28 : 16}
                      strokeOpacity={0.35 + (idx % 3) * 0.15}
                      strokeLinecap="round"
                      fill="none"
                    />
                  );
                })}
              </g>
            );
          })()}
        </g>
      )}

      {/* =====================================================================
          TRANSICIÓN 3 (Escena 3 → 4 | Frames 362..392): LUPA / IRIS RETICULADO DEL INVENTOR
         ===================================================================== */}
      {frame >= 362 && frame <= 392 && (
        <g>
          {(() => {
            const pIn = smoothstep(362, 376, frame);
            const pOut = smoothstep(376, 392, frame);
            // El iris se contrae sobre la barra conductora con corriente y luego se expande al estallar F
            const r = 680 - 440 * pIn + 720 * pOut;
            const alpha = clamp(Math.sin(((frame - 362) / 30) * Math.PI) * 1.15, 0, 0.95);
            const cx = 1015;
            const cy = 445;

            return (
              <g opacity={alpha}>
                {/* Anillo exterior e interior de la lente de precisión */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={inkEmerald}
                  strokeWidth={6}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={r * 0.88}
                  fill="none"
                  stroke={inkDark}
                  strokeWidth={2.5}
                  strokeDasharray="14 10"
                />
                {/* Mira reticulada de ingeniero (+ + +) */}
                <line
                  x1={cx - r - 35}
                  y1={cy}
                  x2={cx - r * 0.72}
                  y2={cy}
                  stroke={inkDark}
                  strokeWidth={4}
                />
                <line
                  x1={cx + r * 0.72}
                  y1={cy}
                  x2={cx + r + 35}
                  y2={cy}
                  stroke={inkDark}
                  strokeWidth={4}
                />
                <line
                  x1={cx}
                  y1={cy - r - 35}
                  x2={cx}
                  y2={cy - r * 0.72}
                  stroke={inkDark}
                  strokeWidth={4}
                />
                <line
                  x1={cx}
                  y1={cy + r * 0.72}
                  x2={cx}
                  y2={cy + r + 35}
                  stroke={inkDark}
                  strokeWidth={4}
                />
              </g>
            );
          })()}
        </g>
      )}

      {/* =====================================================================
          TRANSICIÓN 4 (Escena 4 → 5 | Frames 528..554): RELÁMPAGO DE CONMUTACIÓN (B+ ↔ B-)
         ===================================================================== */}
      {frame >= 528 && frame <= 554 && (
        <g>
          {(() => {
            const p = (frame - 528) / 26;
            const alpha = Math.sin(p * Math.PI);
            // Arco quebrado que conecta la escobilla superior (828, 298) con el colector (828, 540) y la inferior (828, 782)
            const j1 = Math.sin(frame * 2.5) * 38;
            const j2 = Math.cos(frame * 3.1) * 42;
            const boltPath = `M 828 240 L ${828 + j1} 370 L ${828 - j2} 475 L 828 540 L ${828 + j2} 620 L ${828 - j1} 715 L 828 840`;

            return (
              <g opacity={alpha}>
                <path
                  d={boltPath}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={14}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.45}
                />
                <path
                  d={boltPath}
                  fill="none"
                  stroke={inkCrimson}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Onda horizontal de inversión de polaridad que barre el plano */}
                <line
                  x1={180}
                  y1={540}
                  x2={1740}
                  y2={540}
                  stroke={inkGold}
                  strokeWidth={8 * alpha}
                  strokeDasharray="32 16"
                />
              </g>
            );
          })()}
        </g>
      )}

      {/* =====================================================================
          TRANSICIÓN 5 (Escena 5 → 6 | Frames 708..740): ESCUADRAS Y REGLAS T DE ENSAMBLE
         ===================================================================== */}
      {frame >= 708 && frame <= 740 && (
        <g>
          {(() => {
            const p = smoothstep(708, 728, frame);
            const fade = 1 - smoothstep(728, 740, frame);
            const yTopRule = 40 + p * 155;
            const yBotRule = 1040 - p * 155;

            return (
              <g opacity={fade}>
                {/* Regla T superior empujando la valva superior hacia el centro */}
                <path
                  d={sketchLine(420, yTopRule, 1500, yTopRule, 501, 1.2, 12)}
                  stroke={inkDark}
                  strokeWidth={5}
                  fill="none"
                />
                {/* Regla T inferior empujando la valva inferior hacia el centro */}
                <path
                  d={sketchLine(420, yBotRule, 1500, yBotRule, 502, 1.2, 12)}
                  stroke={inkDark}
                  strokeWidth={5}
                  fill="none"
                />
                {/* Marcas de graduación milimétrica en las reglas */}
                {Array.from({length: 19}).map((_, i) => {
                  const rx = 460 + i * 55;
                  return (
                    <React.Fragment key={i}>
                      <line
                        x1={rx}
                        y1={yTopRule - 14}
                        x2={rx}
                        y2={yTopRule}
                        stroke={inkMid}
                        strokeWidth={2.5}
                      />
                      <line
                        x1={rx}
                        y1={yBotRule}
                        x2={rx}
                        y2={yBotRule + 14}
                        stroke={inkMid}
                        strokeWidth={2.5}
                      />
                    </React.Fragment>
                  );
                })}
              </g>
            );
          })()}
        </g>
      )}
    </svg>
  );
};
