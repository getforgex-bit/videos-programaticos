import React from 'react';
import {
  MotorFrameState,
  sketchEllipseArc,
  sketchLine,
  smoothstep,
} from './handDrawnUtils';

interface Props {
  state: MotorFrameState;
}

/**
 * Capa 2 (Motion Canvas Vector Schematic Layer)
 * Diagrama esquemático dibujado progresivamente del circuito DC, interruptor SW1,
 * escobillas fijas (B+/B-) y colector de delgas rotatorio que invierte la corriente cada 180°.
 */
export const MotionCanvasCircuitLayer: React.FC<Props> = ({state}) => {
  const {frame, thetaDeg, thetaRad, currentActive, commutationFlash} = state;

  const appear = smoothstep(235, 285, frame);
  if (appear <= 0.01) return null;

  const px0 = 55;
  const py0 = 595;
  const pw = 550;
  const ph = 390;

  const swClose = smoothstep(405, 428, frame);
  const wireP = smoothstep(255, 320, frame);

  const bx = 85;
  const by = 205;
  const cx = 370;
  const cy = 205;
  const commR = 64;

  const swAngle = (1 - swClose) * 0.48;
  const swX2 = 185 + 60 * Math.cos(swAngle);
  const swY2 = 112 - 60 * Math.sin(swAngle);

  const rx = Math.cos(thetaRad) * (commR - 18);
  const ry = Math.sin(thetaRad) * (commR - 18);

  return (
    <div
      style={{
        position: 'absolute',
        left: px0,
        top: py0,
        width: pw,
        height: ph,
        opacity: appear,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        boxShadow: '4px 4px 0px rgba(24, 26, 31, 0.12)',
        pointerEvents: 'none',
      }}
    >
      <svg width={pw} height={ph} viewBox={`0 0 ${pw} ${ph}`}>
        {/* Marco dibujado a mano */}
        <path
          d={sketchLine(8, 8, pw - 8, 8, 11, 1.1, 2)}
          stroke="#181A1F"
          strokeWidth={3}
          fill="none"
        />
        <path
          d={sketchLine(pw - 8, 8, pw - 8, ph - 8, 12, 1.1, 2)}
          stroke="#181A1F"
          strokeWidth={3}
          fill="none"
        />
        <path
          d={sketchLine(pw - 8, ph - 8, 8, ph - 8, 13, 1.1, 2)}
          stroke="#181A1F"
          strokeWidth={3}
          fill="none"
        />
        <path
          d={sketchLine(8, ph - 8, 8, 8, 14, 1.1, 2)}
          stroke="#181A1F"
          strokeWidth={3}
          fill="none"
        />

        <text
          x={24}
          y={38}
          fill="#181A1F"
          fontFamily="'Humor Sans', cursive"
          fontSize={23}
        >
          CAPA 2 [MOTION CANVAS] · CIRCUITO DC
        </text>
        <text
          x={24}
          y={66}
          fill={swClose > 0.7 ? '#DC2626' : '#64748B'}
          fontFamily="'Comic Neue', sans-serif"
          fontWeight="bold"
          fontSize={18}
        >
          {swClose > 0.7
            ? 'INTERRUPTOR SW1 CERRADO → FLUJO ACTIVO (I)'
            : 'ESQUEMA DE EXCITACIÓN Y COLECTOR DE DELGAS'}
        </text>

        {/* Cableado superior (+) y cuchilla SW1 */}
        <g opacity={wireP}>
          <path
            d={sketchLine(bx, by - 24, bx, 112, 21, 1.0, 0)}
            stroke="#DC2626"
            strokeWidth={3.5}
            fill="none"
          />
          <path
            d={sketchLine(bx, 112, 185, 112, 22, 1.0, 0)}
            stroke="#DC2626"
            strokeWidth={3.5}
            fill="none"
          />
          <path
            d={sketchLine(185, 112, swX2, swY2, 23, 0.9, 0)}
            stroke="#DC2626"
            strokeWidth={4}
            fill="none"
          />
          <circle cx={185} cy={112} r={4.5} fill="#181A1F" />
          <circle cx={245} cy={112} r={4.5} fill="#181A1F" />
          <text
            x={198}
            y={94}
            fill="#181A1F"
            fontFamily="'Comic Neue', sans-serif"
            fontWeight="bold"
            fontSize={16}
          >
            SW1
          </text>

          <path
            d={sketchLine(245, 112, cx - commR - 18, 112, 24, 1.0, 0)}
            stroke="#DC2626"
            strokeWidth={3.5}
            fill="none"
          />
          <path
            d={sketchLine(cx - commR - 18, 112, cx - commR - 18, cy, 25, 1.0, 0)}
            stroke="#DC2626"
            strokeWidth={3.5}
            fill="none"
          />

          {/* Cableado inferior (-) */}
          <path
            d={sketchLine(bx, by + 26, bx, 305, 26, 1.0, 0)}
            stroke="#1D4ED8"
            strokeWidth={3.5}
            fill="none"
          />
          <path
            d={sketchLine(bx, 305, cx + commR + 18, 305, 27, 1.0, 0)}
            stroke="#1D4ED8"
            strokeWidth={3.5}
            fill="none"
          />
          <path
            d={sketchLine(cx + commR + 18, 305, cx + commR + 18, cy, 28, 1.0, 0)}
            stroke="#1D4ED8"
            strokeWidth={3.5}
            fill="none"
          />

          {/* Símbolo de Batería DC */}
          <line
            x1={bx - 22}
            y1={by - 12}
            x2={bx + 22}
            y2={by - 12}
            stroke="#DC2626"
            strokeWidth={4}
          />
          <line
            x1={bx - 12}
            y1={by + 1}
            x2={bx + 12}
            y2={by + 1}
            stroke="#181A1F"
            strokeWidth={3}
          />
          <line
            x1={bx - 22}
            y1={by + 13}
            x2={bx + 22}
            y2={by + 13}
            stroke="#DC2626"
            strokeWidth={4}
          />
          <line
            x1={bx - 12}
            y1={by + 25}
            x2={bx + 12}
            y2={by + 25}
            stroke="#1D4ED8"
            strokeWidth={3}
          />
          <text
            x={bx - 52}
            y={by - 8}
            fill="#DC2626"
            fontFamily="'Comic Neue', sans-serif"
            fontWeight="bold"
            fontSize={18}
          >
            +V
          </text>
          <text
            x={bx - 52}
            y={by + 25}
            fill="#1D4ED8"
            fontFamily="'Comic Neue', sans-serif"
            fontWeight="bold"
            fontSize={18}
          >
            -V
          </text>

          {/* Escobillas fijas B+ y B- */}
          <rect
            x={cx - commR - 24}
            y={cy - 16}
            width={20}
            height={32}
            rx={3}
            fill="#334155"
            stroke="#181A1F"
            strokeWidth={2}
          />
          <rect
            x={cx + commR + 4}
            y={cy - 16}
            width={20}
            height={32}
            rx={3}
            fill="#334155"
            stroke="#181A1F"
            strokeWidth={2}
          />
          <text
            x={cx - commR - 56}
            y={cy + 6}
            fill="#DC2626"
            fontFamily="'Comic Neue', sans-serif"
            fontWeight="bold"
            fontSize={18}
          >
            B+
          </text>
          <text
            x={cx + commR + 30}
            y={cy + 6}
            fill="#1D4ED8"
            fontFamily="'Comic Neue', sans-serif"
            fontWeight="bold"
            fontSize={18}
          >
            B-
          </text>

          {/* Delgas giratorias del colector (Delga 1 y Delga 2) */}
          <path
            d={sketchEllipseArc(
              cx,
              cy,
              commR,
              commR,
              thetaDeg - 80,
              thetaDeg + 80,
              41,
              0.7,
              24,
            )}
            stroke="#D97706"
            strokeWidth={10}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={sketchEllipseArc(
              cx,
              cy,
              commR,
              commR,
              thetaDeg + 100,
              thetaDeg + 260,
              42,
              0.7,
              24,
            )}
            stroke="#92400E"
            strokeWidth={10}
            strokeLinecap="round"
            fill="none"
          />

          {/* Espira interior en corte transversal */}
          <line
            x1={cx - rx}
            y1={cy - ry}
            x2={cx + rx}
            y2={cy + ry}
            stroke="#181A1F"
            strokeWidth={4}
          />
          <circle
            cx={cx - rx}
            cy={cy - ry}
            r={10}
            fill="#FEF3C7"
            stroke="#DC2626"
            strokeWidth={3}
          />
          <circle
            cx={cx + rx}
            cy={cy + ry}
            r={10}
            fill="#DBEAFE"
            stroke="#1D4ED8"
            strokeWidth={3}
          />

          {/* Destello de conmutación a 180° */}
          {commutationFlash > 0.35 && (
            <g opacity={commutationFlash}>
              <circle
                cx={cx - commR - 4}
                cy={cy}
                r={14}
                fill="rgba(245, 158, 11, 0.3)"
                stroke="#F59E0B"
                strokeWidth={2.5}
              />
              <circle
                cx={cx + commR + 4}
                cy={cy}
                r={14}
                fill="rgba(245, 158, 11, 0.3)"
                stroke="#F59E0B"
                strokeWidth={2.5}
              />
            </g>
          )}
        </g>

        {/* Partículas animadas de corriente eléctrica I */}
        {currentActive > 0.05 && (
          <g opacity={currentActive}>
            {[0, 1, 2, 3].map((k) => {
              const phase = ((frame * 0.035 + k * 0.25) % 1 + 1) % 1;
              const pxTop = bx + phase * (cx - commR - 18 - bx);
              const pxBot = cx + commR + 18 - phase * (cx + commR + 18 - bx);
              return (
                <React.Fragment key={k}>
                  <circle cx={pxTop} cy={112} r={5.5} fill="#DC2626" />
                  <circle cx={pxBot} cy={305} r={5.5} fill="#1D4ED8" />
                </React.Fragment>
              );
            })}
          </g>
        )}

        {/* Pie explicativo */}
        <line
          x1={22}
          y1={ph - 52}
          x2={pw - 22}
          y2={ph - 52}
          stroke="#E2E8F0"
          strokeWidth={2}
        />
        <text
          x={24}
          y={ph - 24}
          fill="#059669"
          fontFamily="'Comic Neue', sans-serif"
          fontWeight="bold"
          fontSize={18}
        >
          Escobillas B+/B- fijas → Delgas invierten I cada 180°
        </text>
      </svg>
    </div>
  );
};
