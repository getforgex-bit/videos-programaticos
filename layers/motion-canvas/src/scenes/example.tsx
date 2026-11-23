import {Circle, Line, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {all, createRef, createSignal, linear} from '@motion-canvas/core';

/**
 * Capa 2 (Motion Canvas): Diagrama Esquemático Dibujado a Mano
 * Circuito de excitación DC, escobillas y conmutador de delgas (Idea A · Estilo 2 Whiteboard)
 */
export default makeScene2D(function* (view) {
  const frameBox = createRef<Rect>();
  const wireLoop = createRef<Line>();
  const commutatorRing = createRef<Circle>();
  const rotorAngle = createSignal(0);

  view.add(
    <Rect
      ref={frameBox}
      x={-620}
      y={250}
      width={550}
      height={390}
      stroke="#181A1F"
      lineWidth={3}
      radius={8}
    >
      <Txt
        text="CAPA 2 [MOTION CANVAS] · CIRCUITO Y CONMUTADOR"
        y={-160}
        fill="#181A1F"
        fontFamily="Humor Sans"
        fontSize={22}
      />
      <Line
        ref={wireLoop}
        points={[
          [-210, 110],
          [-210, -70],
          [-65, -70],
        ]}
        stroke="#DC2626"
        lineWidth={4}
        end={0}
      />
      <Circle
        ref={commutatorRing}
        x={35}
        y={10}
        width={130}
        height={130}
        stroke="#D97706"
        lineWidth={6}
        rotation={() => rotorAngle()}
      />
    </Rect>,
  );

  yield* all(
    wireLoop().end(1, 2.0),
    rotorAngle(720, 6.0, linear),
  );
});
