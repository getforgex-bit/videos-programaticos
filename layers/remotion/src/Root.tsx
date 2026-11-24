import React from 'react';
import {Composition} from 'remotion';
import {MainVideo} from './MainVideo';
import {DURATION, FPS} from './motor/film';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MainVideo"
    component={MainVideo}
    durationInFrames={DURATION * FPS}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
