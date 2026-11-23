import {Circle, makeScene2D} from '@motion-canvas/2d';
import {all, createRef} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  const node = createRef<Circle>();

  view.add(
    <Circle
      ref={node}
      width={180}
      height={180}
      fill="#38bdf8"
      opacity={0.9}
    />,
  );

  yield* all(
    node().scale(1.25, 0.8).to(1, 0.8),
    node().x(200, 0.8).to(0, 0.8),
  );
});
