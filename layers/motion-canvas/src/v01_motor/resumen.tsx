/**
 * Video 01 · Capa 2 (Motion Canvas) — "En resumen".
 *
 * Diagrama de causa-efecto dibujado a mano, fondo transparente:
 *   [corriente] + [campo magnético] → [fuerza] → [giro]
 *        ↑_____ el conmutador invierte la corriente cada ½ vuelta ____|
 *
 * Coordenadas: origen al centro, y hacia abajo (1920×1080). La franja
 * inferior (y > 380) queda libre para los subtítulos de Remotion.
 */
import {Line, Node, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  ThreadGenerator,
  Vector2,
  all,
  createRef,
  easeInOutCubic,
  linear,
  waitFor,
} from '@motion-canvas/core';
import {
  BLUE,
  GREEN,
  INK,
  ORANGE,
  RED,
  arrowHead,
  roughArc,
  roughCurve,
  roughLine,
  roughRect,
} from './sketch';

const V = (x: number, y: number) => new Vector2(x, y);

export default makeScene2D(function* (view) {
  // La tipografía se carga antes del primer frame.
  yield document.fonts.load('700 48px Kalam');
  yield document.fonts.load('400 48px Kalam');

  // ----------------------------------------------------------- utilidades
  const stroke = (
    parent: Node,
    pts: Vector2[],
    color: string,
    width = 6,
    opacity = 0.95,
  ) => {
    const ref = createRef<Line>();
    parent.add(
      <Line
        ref={ref}
        points={pts}
        stroke={color}
        lineWidth={width}
        lineCap="round"
        lineJoin="round"
        opacity={opacity}
        end={0}
      />,
    );
    return ref;
  };

  /** Dibuja trazos en secuencia, a velocidad ~constante (px/s). */
  function* draw(
    refs: ReturnType<typeof stroke>[],
    duration: number,
  ): ThreadGenerator {
    const lens = refs.map(r => Math.max(1, r().arcLength()));
    const total = lens.reduce((a, b) => a + b, 0);
    for (let i = 0; i < refs.length; i++) {
      yield* refs[i]().end(1, (duration * lens[i]) / total, linear);
    }
  }

  const label = (parent: Node, pos: Vector2, color: string, size = 50) => {
    const ref = createRef<Txt>();
    parent.add(
      <Txt
        ref={ref}
        position={pos}
        text=""
        fontFamily="Kalam"
        fontWeight={700}
        fontSize={size}
        fill={color}
      />,
    );
    return ref;
  };

  const root = new Node({});
  view.add(root);

  // ------------------------------------------------------------- cajas
  type Box = {node: Node; box: ReturnType<typeof stroke>};
  const makeBox = (x: number, y: number, w: number, h: number, color: string, seed: number): Box => {
    const node = new Node({position: V(x, y)});
    root.add(node);
    const box = stroke(node, roughRect(w, h, seed), color, 6);
    return {node, box};
  };

  const cur = makeBox(-560, -105, 370, 200, RED, 3);
  const fld = makeBox(-560, 215, 370, 200, BLUE, 5);
  const frc = makeBox(40, 55, 290, 200, GREEN, 7);
  const rot = makeBox(560, 55, 290, 200, ORANGE, 9);

  // Iconos ----------------------------------------------------------------
  // pila: placa larga (+) y corta (−) con cables
  const bat = [
    stroke(cur.node, roughLine(V(-70, -40), V(-12, -40), 21), RED, 5),
    stroke(cur.node, roughLine(V(-12, -78), V(-12, -2), 22), RED, 6),
    stroke(cur.node, roughLine(V(14, -62), V(14, -18), 23), RED, 10),
    stroke(cur.node, roughLine(V(14, -40), V(72, -40), 24), RED, 5),
  ];
  const curTxt = label(cur.node, V(0, 48), RED);

  // imán de herradura (U invertida) con polos N / S
  const mag = [
    stroke(fld.node, [
      ...roughLine(V(-42, -2), V(-42, -40), 31),
    ], BLUE, 9),
    stroke(fld.node, roughArc(0, -40, 42, Math.PI, 2 * Math.PI, 32), BLUE, 9),
    stroke(fld.node, roughLine(V(42, -40), V(42, -2), 33), BLUE, 9),
  ];
  const magN = label(fld.node, V(-42, 22), RED, 30);
  const magS = label(fld.node, V(42, 22), BLUE, 30);
  const fldTxt = label(fld.node, V(0, 62), BLUE, 42);

  // fuerza: flecha gruesa
  const fArrow = [
    stroke(frc.node, roughLine(V(-60, -40), V(56, -40), 41), GREEN, 9),
    ...arrowHead(V(60, -40), V(1, 0), 30, 42).map(p => stroke(frc.node, p, GREEN, 9)),
  ];
  const frcTxt = label(frc.node, V(0, 48), GREEN);

  // giro: flecha circular (gira al final)
  const spin = new Node({position: V(0, -38)});
  rot.node.add(spin);
  const arcPts = roughArc(0, 0, 40, -Math.PI * 0.35, Math.PI * 1.25, 51);
  const rArrow = [
    stroke(spin, arcPts, ORANGE, 8),
    ...arrowHead(
      arcPts[arcPts.length - 1],
      arcPts[arcPts.length - 1].sub(arcPts[arcPts.length - 4]),
      24,
      52,
    ).map(p => stroke(spin, p, ORANGE, 8)),
  ];
  const rotTxt = label(rot.node, V(0, 48), ORANGE);

  // Conectores ------------------------------------------------------------
  const plusSign = [
    stroke(root, roughLine(V(-560, 38), V(-560, 72), 61), INK, 7),
    stroke(root, roughLine(V(-577, 55), V(-543, 55), 62), INK, 7),
  ];
  const a1 = roughCurve(V(-365, -95), V(-120, 20), -0.18, 71);
  const a2 = roughCurve(V(-365, 205), V(-120, 90), 0.18, 72);
  const arrIn = [
    stroke(root, a1, INK, 6),
    ...arrowHead(a1[a1.length - 1], a1[a1.length - 1].sub(a1[a1.length - 5]), 24, 73).map(p =>
      stroke(root, p, INK, 6),
    ),
    stroke(root, a2, INK, 6),
    ...arrowHead(a2[a2.length - 1], a2[a2.length - 1].sub(a2[a2.length - 5]), 24, 74).map(p =>
      stroke(root, p, INK, 6),
    ),
  ];
  const a3 = roughLine(V(205, 55), V(395, 55), 75, 0);
  const arrOut = [
    stroke(root, a3, INK, 6),
    ...arrowHead(V(398, 55), V(1, 0), 24, 76).map(p => stroke(root, p, INK, 6)),
  ];
  // bucle: del giro de vuelta a la corriente (por arriba)
  const loop = roughCurve(V(560, -60), V(-470, -222), 0.3, 81);
  const loopArr = [
    stroke(root, loop, ORANGE, 6),
    ...arrowHead(loop[loop.length - 1], loop[loop.length - 1].sub(loop[loop.length - 5]), 26, 82).map(
      p => stroke(root, p, ORANGE, 6),
    ),
  ];
  const loopTxt = label(root, V(60, -388), ORANGE, 42);

  // ---------------------------------------------------------- animación
  yield* waitFor(0.3);
  yield* draw([cur.box], 0.55);
  yield* draw(bat, 0.45);
  yield* curTxt().text('corriente', 0.45);

  yield* draw(plusSign, 0.25);

  yield* draw([fld.box], 0.55);
  yield* draw(mag, 0.5);
  yield* all(magN().text('N', 0.1), magS().text('S', 0.1));
  yield* fldTxt().text('campo magnético', 0.6);

  yield* draw(arrIn, 0.7);

  yield* draw([frc.box], 0.5);
  yield* draw(fArrow, 0.35);
  yield* frcTxt().text('fuerza', 0.35);

  yield* draw(arrOut, 0.35);

  yield* draw([rot.box], 0.5);
  yield* draw(rArrow, 0.45);
  yield* all(
    rotTxt().text('giro', 0.3),
    spin.rotation(360, 1.6, easeInOutCubic),
  );

  yield* draw(loopArr, 0.9);
  yield* all(
    loopTxt().text('el conmutador invierte la corriente cada ½ vuelta', 1.3),
    spin.rotation(720, 1.3, linear),
  );
  yield* spin.rotation(1170, 1.1, linear);
});
