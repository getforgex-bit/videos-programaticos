/**
 * Video 01 — "El motor invisible" · estilo pizarra / dibujo a mano.
 * Capa 3 (Remotion): compositor maestro.
 *
 *   Paper (pizarra)  ← fondo procedural
 *   Segmentos M1 · M2 · MC · M3  ← webm con alfa de Manim / Motion Canvas
 *   Borrador entre segmentos     ← transición
 *   Títulos y subtítulos         ← Kalam, revelado "escrito"
 *   Rotulador                    ← sigue la punta real del trazo (Manim)
 *   Audio                        ← sintetizado y sincronizado a eventos reales
 *
 * Todos los tiempos vienen de public/layers/v01/timeline.json, generado por
 * scripts/v01/build_timeline_audio.py a partir de lo que se renderizó.
 */
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Freeze,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {Eraser, eraserMask, eraserProgress} from '../common/EraserWipe';
import {HandUnderline, Handwritten} from '../common/Handwritten';
import {LineBoilDefs} from '../common/LineBoil';
import {MarkerPen, PenSample} from '../common/MarkerPen';
import {Paper} from '../common/Paper';
import {ensureKalam} from '../common/fonts';
import {INK} from '../common/palette';
import {CAPTIONS} from './captions';

export type Timeline = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  segments: {id: string; src: string; from: number; durationInFrames: number}[];
  wipes: {from: number; durationInFrames: number; after: string}[];
  marks: {seg: string; id: string; frame: number}[];
  pen: Record<string, PenSample[]>;
};

export type V01Props = {
  timeline: Timeline | null;
  showPen: boolean;
  boil: number; // intensidad del "line boil" (px); 0 = desactivado
};

const markFrame = (tl: Timeline, seg: string, id: string) =>
  tl.marks.find(m => m.seg === seg && m.id === id)?.frame ?? null;

// ---------------------------------------------------------------- segmento
const SegmentLayer: React.FC<{
  src: string;
  duration: number;
  wipe: number; // frames de borrado al final (0 = sin borrado)
  boil: number;
}> = ({src, duration, wipe, boil}) => {
  const frame = useCurrentFrame();
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    filter: boil > 0 ? 'url(#boil)' : undefined,
  };
  if (frame < duration) {
    return <OffthreadVideo src={staticFile(src)} transparent muted style={style} />;
  }
  // borrado: último frame congelado y enmascarado detrás del borrador
  const p = eraserProgress(frame, duration, wipe);
  const mask = eraserMask(p);
  return (
    <AbsoluteFill style={{WebkitMaskImage: mask, maskImage: mask}}>
      <Freeze frame={duration - 1}>
        <OffthreadVideo src={staticFile(src)} transparent muted style={style} />
      </Freeze>
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------- subtítulos
const Captions: React.FC<{tl: Timeline; hideFrom: number}> = ({tl, hideFrom}) => {
  const frame = useCurrentFrame();
  const cues = CAPTIONS.map(c => {
    const base = markFrame(tl, c.seg, c.mark);
    return base === null ? null : {...c, start: base + Math.round((c.delay ?? 0) * tl.fps)};
  })
    .filter(Boolean)
    .sort((a, b) => a!.start - b!.start) as (typeof CAPTIONS[number] & {start: number})[];

  const segEnd = (seg: string) => {
    const s = tl.segments.find(x => x.id === seg)!;
    return s.from + s.durationInFrames - 4;
  };

  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center'}}>
      {cues.map((c, i) => {
        const next = cues[i + 1];
        const end = Math.min(
          next && next.seg === c.seg ? next.start - 6 : segEnd(c.seg),
          hideFrom - 4,
        );
        if (frame < c.start - 1 || frame > end + 12) return null;
        return (
          <div key={i} style={{position: 'absolute', bottom: 40, width: 1700, textAlign: 'center'}}>
            <Handwritten
              text={c.text}
              start={c.start}
              end={end}
              size={54}
              weight={700}
              style={{display: 'inline-block'}}
              backdrop="rgba(246,243,235,0.88)"
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ títulos
const OpeningTitle: React.FC<{end: number}> = ({end}) => (
  <div style={{position: 'absolute', left: 110, top: 70}}>
    <Handwritten text="El motor invisible" start={14} end={end} size={92} weight={700} charsPerSecond={22} />
    <div style={{marginTop: -6}}>
      <HandUnderline start={40} duration={14} width={700} end={end} color="#D6402F" strokeWidth={7} seed={3} />
    </div>
  </div>
);

const FinalTitle: React.FC<{start: number}> = ({start}) => (
  <AbsoluteFill style={{alignItems: 'center'}}>
    <div style={{position: 'absolute', top: 64, textAlign: 'center'}}>
      <Handwritten text="El motor invisible" start={start} size={112} weight={700} charsPerSecond={20} />
      <div style={{display: 'flex', justifyContent: 'center', marginTop: -8}}>
        <HandUnderline start={start + 26} duration={14} width={860} color="#D6402F" strokeWidth={8} seed={5} />
      </div>
      <Handwritten
        text="{electricidad|red}  +  {magnetismo|blue}  =  {movimiento|orange}"
        start={start + 36}
        size={56}
        weight={700}
        charsPerSecond={30}
        style={{marginTop: 6}}
      />
    </div>
  </AbsoluteFill>
);

// --------------------------------------------------------------- principal
export const V01MotorInvisible: React.FC<V01Props> = ({timeline, showPen, boil}) => {
  ensureKalam();
  const frame = useCurrentFrame();
  if (!timeline) {
    return (
      <AbsoluteFill style={{backgroundColor: '#fff', color: INK, justifyContent: 'center', alignItems: 'center', fontSize: 40}}>
        Falta timeline.json — ejecuta scripts/v01/build.sh
      </AbsoluteFill>
    );
  }
  const tl = timeline;
  const titleEnd = markFrame(tl, 'M1', 'xray') ?? 300;
  const finalStart = (markFrame(tl, 'M3', 'title') ?? tl.durationInFrames - 120) + 12;
  const fadeOut = interpolate(frame, [tl.durationInFrames - 14, tl.durationInFrames - 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Paper />
      <LineBoilDefs id="boil" scale={boil} />
      <AbsoluteFill style={{opacity: fadeOut}}>
        {tl.segments.map(seg => {
          const wipe = tl.wipes.find(w => w.after === seg.id);
          const total = seg.durationInFrames + (wipe ? wipe.durationInFrames : 0);
          return (
            <Sequence key={seg.id} from={seg.from} durationInFrames={total}>
              <SegmentLayer
                src={seg.src}
                duration={seg.durationInFrames}
                wipe={wipe ? wipe.durationInFrames : 0}
                boil={boil}
              />
            </Sequence>
          );
        })}

        <OpeningTitle end={titleEnd} />
        <Captions tl={tl} hideFrom={finalStart} />
        <FinalTitle start={finalStart} />

        {showPen &&
          tl.segments
            .filter(s => tl.pen[s.id])
            .map(s => (
              <Sequence key={`pen-${s.id}`} from={s.from} durationInFrames={s.durationInFrames + 12}>
                <MarkerPen pen={tl.pen[s.id]} />
              </Sequence>
            ))}

        {tl.wipes.map((w, i) => (
          <Eraser key={i} start={w.from} duration={w.durationInFrames} />
        ))}
      </AbsoluteFill>
      <Audio src={staticFile('layers/v01/audio.wav')} />
    </AbsoluteFill>
  );
};
