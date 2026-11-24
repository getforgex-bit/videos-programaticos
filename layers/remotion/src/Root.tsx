import React from 'react';
import {CalculateMetadataFunction, Composition, staticFile} from 'remotion';
import {MainVideo} from './MainVideo';
import {Timeline, V01MotorInvisible, V01Props} from './v01/V01MotorInvisible';
import {TimelineV2, V01v2, V01v2Props} from './v01v2/V01v2';

/** Duración y datos del video 01 salen del timeline generado tras el render. */
const v01Metadata: CalculateMetadataFunction<V01Props> = async ({props}) => {
  try {
    const res = await fetch(staticFile('layers/v01/timeline.json'));
    const timeline = (await res.json()) as Timeline;
    return {
      durationInFrames: timeline.durationInFrames,
      fps: timeline.fps,
      props: {...props, timeline},
    };
  } catch {
    return {durationInFrames: 90, props: {...props, timeline: null}};
  }
};

const v01v2Metadata: CalculateMetadataFunction<V01v2Props> = async ({props}) => {
  try {
    const res = await fetch(staticFile('layers/v01v2/timeline.json'));
    const timeline = (await res.json()) as TimelineV2;
    return {durationInFrames: timeline.durationInFrames, fps: timeline.fps, props: {...props, timeline}};
  } catch {
    return {durationInFrames: 90, props: {...props, timeline: null}};
  }
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideo"
        component={MainVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="V01-MotorInvisible-Pizarra"
        component={V01MotorInvisible}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{timeline: null, showPen: true, boil: 1.4}}
        calculateMetadata={v01Metadata}
      />
      <Composition
        id="V01v2-MotorInvisible-Sepia"
        component={V01v2}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{timeline: null, showPen: true}}
        calculateMetadata={v01v2Metadata}
      />
    </>
  );
};
