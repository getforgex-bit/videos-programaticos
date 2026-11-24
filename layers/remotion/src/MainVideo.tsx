import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  AbsoluteFill,
  Audio,
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {drawFilm} from './motor/film';

const fonts = [
  ['Kalam', 'fonts/kalam/Kalam-Regular.ttf'],
  ['MotorDisplay', 'fonts/dm-serif-display/DMSerifDisplay-Regular.ttf'],
];

export const MainVideo: React.FC = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('Cargando las tipografías del cuaderno'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all(
      fonts.map(async ([family, file]) => {
        const font = new FontFace(family, 'url(' + staticFile(file) + ')');
        document.fonts.add(await font.load());
      }),
    )
      .then(() => {
        if (active) setReady(true);
      })
      .catch(cancelRender);
    return () => {
      active = false;
    };
  }, []);
  useLayoutEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx || !ready) return;
    ctx.setTransform(width / 1280, 0, 0, height / 720, 0, 0);
    drawFilm(ctx, frame / fps);
    continueRender(handle);
  }, [frame, ready, fps, height, width, handle]);
  return (
    <AbsoluteFill style={{backgroundColor: '#f7f3e8'}}>
      <canvas ref={canvas} width={width} height={height} />
      <Audio src={staticFile('layers/motor-a02.wav')} />
    </AbsoluteFill>
  );
};
