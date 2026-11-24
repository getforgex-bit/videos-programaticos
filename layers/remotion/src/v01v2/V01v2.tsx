/**
 * Video 01 · v2 — "El motor invisible" · estilo SEPIA dinámico (Remotion).
 *
 * Capas (de abajo arriba):
 *   1. Color base del pergamino
 *   2. Contenido con "cámara" (sacudida, empuje de zoom, pulso al ritmo):
 *        segmentos Manim / Motion Canvas (tinta con grano + desenfoque de
 *        movimiento según la cámara de Manim), resplandor del escáner, lápiz,
 *        texto cinético y título final
 *   3. Mancha de tinta (transición MC → M3)
 *   4. Textura del pergamino en modo multiplicar (manchas, fibras, viñeta)
 *   5. Destellos de impacto
 *   6. Audio sintetizado sincronizado
 * Todo el tiempo sale de public/layers/v01v2/timeline.json (build_v2.py).
 */
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {HandUnderline} from '../common/Handwritten';
import {impactAt} from '../common/Impacts';
import {InkDefs} from '../common/InkFilter';
import {Kinetic} from '../common/Kinetic';
import {MarkerPen, PenSample} from '../common/MarkerPen';
import {PARCHMENT, Parchment} from '../common/Parchment';
import {ScanGlow} from '../common/ScanGlow';
import {InkBlot, TransitionType, enterStyle, exitStyle} from '../common/Transitions';
import {ensureKalam} from '../common/fonts';

export const SEPIA = {
  ink: '#4E321B',
  red: '#A3432A',
  blue: '#3B5B6E',
  green: '#4F6B2C',
  orange: '#B06E1E',
  pencil: '#9A7E58',
  wash: '#EFE3C8',
};

type Trans = {type: TransitionType; frames: number; focal?: {x: number; y: number}};
type Seg = {id: string; src: string; from: number; durationInFrames: number; in?: Trans; out?: Trans};
type SegData = {
  pen: PenSample[];
  cam_x?: number[];
  cam_y?: number[];
  cam_w?: number[];
  scan?: number[];
};
type Cue = {
  seg: string;
  start: number;
  end: number;
  words: string[];
  x: number;
  y: number;
  size?: number;
  stack?: boolean;
  stamp?: boolean;
};
export type TimelineV2 = {
  fps: number;
  durationInFrames: number;
  beatFrames: number;
  segments: Seg[];
  cues: Cue[];
  title: {start: number; text: string; tagline: string[]};
  impacts: number[];
  data: Record<string, SegData>;
};

export type V01v2Props = {timeline: TimelineV2 | null; showPen: boolean};

// ------------------------------------------------------------ segmento
const MBlur: React.FC<{id: string; x: number; y: number}> = ({id, x, y}) => (
  <svg width="0" height="0" style={{position: 'absolute'}}>
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur stdDeviation={`${Math.min(40, x).toFixed(2)} ${Math.min(40, y).toFixed(2)}`} />
    </filter>
  </svg>
);

const camVelocity = (d: SegData | undefined, f: number) => {
  if (!d?.cam_x || !d.cam_w || !d.cam_y) return {x: 0, y: 0};
  const n = d.cam_x.length;
  const i = Math.min(n - 1, Math.max(1, f));
  const w = d.cam_w[i] || 14.22;
  const ppu = 1920 / w;
  const vx = (d.cam_x[i] - d.cam_x[i - 1]) * ppu;
  const vy = (d.cam_y[i] - d.cam_y[i - 1]) * ppu;
  const vz = Math.abs(d.cam_w[i] - d.cam_w[i - 1]) / w * 960;
  const zb = Math.min(8, vz * 0.12);
  return {x: Math.abs(vx) * 0.45 + zb, y: Math.abs(vy) * 0.45 + zb * 0.6};
};

const SegmentV2: React.FC<{seg: Seg; data?: SegData; showPen: boolean}> = ({seg, data, showPen}) => {
  const f = useCurrentFrame();
  const dur = seg.durationInFrames;
  let style: React.CSSProperties = {};
  let bx = 0;
  let by = 0;
  if (seg.in && f < seg.in.frames) {
    const e = enterStyle(seg.in.type, f / seg.in.frames);
    style = {...style, ...e.style};
    bx += e.blur.x;
    by += e.blur.y;
  }
  if (seg.out && f >= dur - seg.out.frames) {
    const e = exitStyle(seg.out.type, (f - (dur - seg.out.frames)) / seg.out.frames, seg.out.focal);
    style = {...style, ...e.style};
    bx += e.blur.x;
    by += e.blur.y;
  }
  const v = camVelocity(data, Math.min(f, dur - 1));
  bx += v.x > 1.2 ? v.x : 0;
  by += v.y > 1.2 ? v.y : 0;
  const mbId = `mb-${seg.id}`;
  const scanX = data?.scan ? data.scan[Math.min(f, data.scan.length - 1)] : -1;
  return (
    <AbsoluteFill style={style}>
      <MBlur id={mbId} x={bx} y={by} />
      <OffthreadVideo
        src={staticFile(seg.src)}
        transparent
        muted
        style={{width: '100%', height: '100%', filter: `url(#ink) url(#${mbId}) contrast(1.12) saturate(1.08)`}}
      />
      <ScanGlow x={scanX !== undefined && scanX >= 0 ? scanX : null} />
      {showPen && data?.pen && <MarkerPen pen={data.pen} variant="pencil" scale={0.95} />}
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------- título
const FinalTitle: React.FC<{start: number; text: string; tagline: string[]}> = ({start, text, tagline}) => (
  <>
    <Kinetic words={[text]} start={start} end={1e9} x={960} y={150} size={128} stamp splat={false} colors={SEPIA} ink={SEPIA.ink} wash={SEPIA.wash} />
    <div style={{position: 'absolute', left: 960 - 470, top: 222}}>
      <HandUnderline start={start + 9} duration={9} width={940} color={SEPIA.red} strokeWidth={9} seed={4} />
    </div>
    <Kinetic words={tagline} start={start + 27} end={1e9} x={960} y={318} size={60} step={9} splat={false} colors={SEPIA} ink={SEPIA.ink} wash={SEPIA.wash} />
  </>
);

// ------------------------------------------------------------ principal
export const V01v2: React.FC<V01v2Props> = ({timeline, showPen}) => {
  ensureKalam();
  const frame = useCurrentFrame();
  if (!timeline) {
    return (
      <AbsoluteFill style={{backgroundColor: PARCHMENT, justifyContent: 'center', alignItems: 'center', fontSize: 40}}>
        Falta timeline.json — ejecuta scripts/v01/build-v2.sh
      </AbsoluteFill>
    );
  }
  const tl = timeline;
  const imp = impactAt(frame, tl.impacts);
  const bf = tl.beatFrames;
  const beatAge = frame % bf;
  const beatPulse = 0.006 * Math.exp(-beatAge / 3);
  const hand = Math.sin(frame / 37) * 0.22 + Math.sin(frame / 23) * 0.1;
  const scale = 1 + imp.punch + beatPulse;

  // mancha de tinta MC → M3
  const mc = tl.segments.find(s => s.out?.type === 'inkblot');
  const blotP = mc ? (frame - (mc.from + mc.durationInFrames - mc.out!.frames)) / mc.out!.frames : -1;

  const fadeOut = Math.min(1, Math.max(0, (tl.durationInFrames - 1 - frame) / 12));

  return (
    <AbsoluteFill style={{backgroundColor: PARCHMENT}}>
      <InkDefs boil={1.25} every={4} />
      <AbsoluteFill
        style={{
          transform: `translate(${imp.shakeX}px, ${imp.shakeY}px) scale(${scale}) rotate(${hand}deg)`,
          opacity: fadeOut,
        }}
      >
        {tl.segments.map(seg => (
          <Sequence key={seg.id} from={seg.from} durationInFrames={seg.durationInFrames}>
            <SegmentV2 seg={seg} data={tl.data[seg.id]} showPen={showPen} />
          </Sequence>
        ))}
        {tl.cues.map((c, i) => (
          <Kinetic
            key={i}
            words={c.words}
            start={c.start}
            end={c.end}
            x={c.x}
            y={c.y}
            size={c.size}
            stack={c.stack}
            stamp={c.stamp}
            colors={SEPIA}
            ink={SEPIA.ink}
            wash={SEPIA.wash}
          />
        ))}
        <FinalTitle start={tl.title.start} text={tl.title.text} tagline={tl.title.tagline} />
      </AbsoluteFill>
      <InkBlot p={blotP} color="#3A2414" seed={5} />
      <Parchment textureOnly />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, rgba(255,236,196,1) 0%, rgba(255,220,160,0.6) 50%, rgba(255,210,150,0) 85%)',
          opacity: imp.flash,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
      <Audio src={staticFile('layers/v01v2/audio.wav')} />
    </AbsoluteFill>
  );
};
