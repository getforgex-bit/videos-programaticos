import React from 'react';
import {
  ALL_MOTOR_STATES,
  MotorFrameState,
  sketchLine,
  smoothstep,
} from './handDrawnUtils';

interface Props {
  state: MotorFrameState;
}

/**
 * Capa 1 (Manim Scientific Layer — Vectorial Sincronizado con manim_physics_telemetry.json)
 * Osciloscopio dibujado a mano de la curva de Par Motor Rectificado τ(θ) = N·I·A·B·|sin(θ)|
 * frente a la onda AC sin conmutar.
 */
export const ManimOscilloscopeLayer: React.FC<Props> = ({state}) => {
  const {frame, thetaDeg, polarity, torqueNorm} = state;

  const appear = smoothstep(375, 430, frame);
  if (appear <= 0.01) return null;

  const px0 = 1315;
  const py0 = 595;
  const pw = 550;
  const ph = 390;

  const ox0 = 58;
  const ox1 = pw - 32;
  const oyMid = 215;
  const ampY = 90;

  const maxSamples = 140;
  const startIdx = Math.max(375, frame - maxSamples + 1);
  const samples = ALL_MOTOR_STATES.slice(startIdx, frame + 1);

  const acPoints: string[] = [];
  const tauPoints: string[] = [];
  const switchDots: {x: number; y: number}[] = [];

  samples.forEach((item, idx) => {
    const u = idx / Math.max(1, maxSamples - 1);
    const x = ox0 + u * (ox1 - ox0);
    const yAc = oyMid - item.rawAcSin * ampY;
    const yTau = oyMid - item.torqueNorm * ampY;

    acPoints.push(`${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yAc.toFixed(1)}`);
    tauPoints.push(`${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yTau.toFixed(1)}`);

    if (item.commutationFlash > 0.72 && item.frame % 4 === 0) {
      switchDots.push({x, y: oyMid});
    }
  });

  const lastSample = samples[samples.length - 1];
  const lastU = Math.max(0, samples.length - 1) / Math.max(1, maxSamples - 1);
  const tipX = ox0 + lastU * (ox1 - ox0);
  const tipY = oyMid - (lastSample ? lastSample.torqueNorm : 0) * ampY;

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
          d={sketchLine(8, 8, pw - 8, 8, 1, 1.1, 2)}
          stroke="#181A1F"
          strokeWidth={3}
          fill="none"
        />
        <path
          d={sketchLine(pw - 8, 8, pw - 8, ph - 8, 2, 1.1, 2)}
          stroke="#181A1F"
          strokeWidth={3}
          fill="none"
        />
        <path
          d={sketchLine(pw - 8, ph - 8, 8, ph - 8, 3, 1.1, 2)}
          stroke="#181A1F"
          strokeWidth={3}
          fill="none"
        />
        <path
          d={sketchLine(8, ph - 8, 8, 8, 4, 1.1, 2)}
          stroke="#181A1F"
          strokeWidth={3}
          fill="none"
        />

        {/* Títulos */}
        <text
          x={24}
          y={38}
          fill="#181A1F"
          fontFamily="'Humor Sans', cursive"
          fontSize={23}
        >
          CAPA 1 [MANIM] · CURVA DE PAR MOTOR
        </text>
        <text
          x={24}
          y={66}
          fill="#059669"
          fontFamily="'Comic Neue', sans-serif"
          fontWeight="bold"
          fontSize={18}
        >
          τ(θ) = N·I·A·B · |sin(θ)| [Rectificado por Colector]
        </text>

        {/* Guías horizontales punteadas */}
        <line
          x1={ox0}
          y1={oyMid - ampY}
          x2={ox1}
          y2={oyMid - ampY}
          stroke="#CBD5E1"
          strokeWidth={1.5}
          strokeDasharray="8 6"
        />
        <line
          x1={ox0}
          y1={oyMid + ampY}
          x2={ox1}
          y2={oyMid + ampY}
          stroke="#CBD5E1"
          strokeWidth={1.5}
          strokeDasharray="8 6"
        />

        {/* Ejes X / Y dibujados a mano */}
        <path
          d={sketchLine(ox0, oyMid, ox1, oyMid, 7, 0.9, 0)}
          stroke="#64748B"
          strokeWidth={2}
          fill="none"
        />
        <path
          d={sketchLine(ox0, oyMid - ampY - 18, ox0, oyMid + ampY + 18, 8, 0.9, 0)}
          stroke="#181A1F"
          strokeWidth={3}
          fill="none"
        />

        <text
          x={18}
          y={oyMid - ampY + 5}
          fill="#059669"
          fontFamily="'Comic Neue', sans-serif"
          fontWeight="bold"
          fontSize={17}
        >
          +τ
        </text>
        <text
          x={24}
          y={oyMid + 5}
          fill="#64748B"
          fontFamily="'Comic Neue', sans-serif"
          fontWeight="bold"
          fontSize={16}
        >
          0
        </text>
        <text
          x={18}
          y={oyMid + ampY + 5}
          fill="#94A3B8"
          fontFamily="'Comic Neue', sans-serif"
          fontWeight="bold"
          fontSize={17}
        >
          -τ
        </text>
        <text
          x={ox1 - 36}
          y={oyMid + 22}
          fill="#181A1F"
          fontFamily="'Comic Neue', sans-serif"
          fontWeight="bold"
          fontSize={16}
        >
          θ(t)
        </text>

        {/* Curva fantasma sin conmutador (AC sin rectificar) */}
        {acPoints.length > 1 && (
          <path
            d={acPoints.join(' ')}
            stroke="#94A3B8"
            strokeWidth={2.2}
            strokeDasharray="6 6"
            fill="none"
          />
        )}

        {/* Curva principal de Torque Rectificado τ(θ) = |sin(θ)| */}
        {tauPoints.length > 1 && (
          <path
            d={tauPoints.join(' ')}
            stroke="#059669"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}

        {/* Marcas de inversión del colector a 180° */}
        {switchDots.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={4.5}
            fill="#FEF3C7"
            stroke="#D97706"
            strokeWidth={2}
          />
        ))}

        {/* Punta trazadora activa */}
        {samples.length > 0 && (
          <circle
            cx={tipX}
            cy={tipY}
            r={7}
            fill="#059669"
            stroke="#181A1F"
            strokeWidth={2}
          />
        )}

        {/* Pie de telemetría */}
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
          fill={polarity > 0 ? '#DC2626' : '#D97706'}
          fontFamily="'Comic Neue', sans-serif"
          fontWeight="bold"
          fontSize={18}
        >
          Espira: {polarity > 0 ? '+I (Directa 0°-180°)' : '-I (Invertida 180°-360°)'}
        </text>
        <text
          x={315}
          y={ph - 24}
          fill="#1D4ED8"
          fontFamily="'Comic Neue', sans-serif"
          fontWeight="bold"
          fontSize={18}
        >
          θ = {Math.round(thetaDeg).toString().padStart(3, '0')}° | Par:{' '}
          {Math.round(torqueNorm * 100)}%
        </text>
      </svg>
    </div>
  );
};
