/**
 * Video 01 · v2 · Capa 2 (Motion Canvas) — resumen SEPIA y cinético.
 *
 * Cambios respecto a v1 (feedback: "aburrido", "mucha info a la vez"):
 *  - Los nodos entran a golpe (escala con rebote) en el pulso de 100 BPM
 *    (B = 0,3 s), en vez de dibujarse lentamente.
 *  - Sombra de tinta desplazada + relleno tostado, como en la referencia.
 *  - Un pulso de corriente recorre el ciclo completo (corriente → fuerza →
 *    giro → conmutador → corriente) y cada nodo "late" al recibirlo.
 */
import {Circle, Line, Node, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  ThreadGenerator,
  Vector2,
  all,
  createRef,
  createSignal,
  easeOutBack,
  easeInOutCubic,
  linear,
  waitFor,
} from '@motion-canvas/core';
import {arrowHead, roughArc, roughCurve, roughLine, roughRect} from './sketch';

// Paleta sepia (idéntica a common/themes.py)
const INK = '#4E321B';
const RED = '#A3432A';
const BLUE = '#3B5B6E';
const GREEN = '#4F6B2C';
const ORANGE = '#B06E1E';
const FILL = '#DCC7A1';
const FILL_DARK = '#C4A679';

const B = 0.3; // medio pulso a 100 BPM
const V = (x: number, y: number) => new Vector2(x, y);

export default makeScene2D(function* (view) {
  yield document.fonts.load('700 48px Kalam');

  const root = new Node({});
  view.add(root);

  const stroke = (parent: Node, pts: Vector2[], color: string, width = 7, end = 0) => {
    const ref = createRef<Line>();
    parent.add(
      <Line ref={ref} points={pts} stroke={color} lineWidth={width} lineCap="round" lineJoin="round" end={end} />,
    );
    return ref;
  };

  /** Flechas: primero los astiles, luego las puntas (como se dibujan a mano). */
  function* draw(refs: ReturnType<typeof stroke>[], duration: number): ThreadGenerator {
    const isHead = (r: ReturnType<typeof stroke>) => r().arcLength() < 60;
    const shafts = refs.filter(r => !isHead(r));
    const heads = refs.filter(r => isHead(r));
    yield* all(...shafts.map(r => r().end(1, duration * 0.75, linear)));
    yield* all(...heads.map(r => r().end(1, duration * 0.25, linear)));
  }

  type Box = {node: Node; label: ReturnType<typeof createRef<Txt>>};
  const makeBox = (x: number, y: number, w: number, h: number, color: string, text: string, seed: number): Box => {
    const node = new Node({position: V(x, y), scale: 0});
    root.add(node);
    const outline = roughRect(w, h, seed);
    // sombra de tinta desplazada
    node.add(<Line points={outline} closed fill={FILL_DARK} opacity={0.75} position={V(12, 12)} />);
    node.add(<Line points={outline} closed fill={FILL} />);
    stroke(node, outline, color, 7, 1);
    // segundo trazo de boceto
    stroke(node, roughRect(w - 10, h - 10, seed + 50), color, 3, 1)().opacity(0.45);
    const label = createRef<Txt>();
    node.add(
      <Txt ref={label} position={V(0, 52)} text={text} fontFamily="Kalam" fontWeight={700} fontSize={text.length > 10 ? 40 : 50} fill={color} />,
    );
    return {node, label};
  };

  const cur = makeBox(-560, -105, 370, 200, RED, 'corriente', 3);
  const fld = makeBox(-560, 230, 370, 200, BLUE, 'campo magnético', 5);
  const frc = makeBox(40, 62, 290, 200, GREEN, 'fuerza', 7);
  const rot = makeBox(560, 62, 290, 200, ORANGE, 'giro', 9);

  // iconos (ya dibujados dentro de cada caja: entran con la caja)
  stroke(cur.node, roughLine(V(-70, -40), V(-12, -40), 21), RED, 6, 1);
  stroke(cur.node, roughLine(V(-12, -78), V(-12, -2), 22), RED, 7, 1);
  stroke(cur.node, roughLine(V(14, -62), V(14, -18), 23), RED, 11, 1);
  stroke(cur.node, roughLine(V(14, -40), V(72, -40), 24), RED, 6, 1);

  stroke(fld.node, roughLine(V(-42, -2), V(-42, -40), 31), BLUE, 10, 1);
  stroke(fld.node, roughArc(0, -40, 42, Math.PI, 2 * Math.PI, 32), BLUE, 10, 1);
  stroke(fld.node, roughLine(V(42, -40), V(42, -2), 33), BLUE, 10, 1);
  fld.node.add(<Txt position={V(-42, 22)} text="N" fontFamily="Kalam" fontWeight={700} fontSize={30} fill={RED} />);
  fld.node.add(<Txt position={V(42, 22)} text="S" fontFamily="Kalam" fontWeight={700} fontSize={30} fill={BLUE} />);

  stroke(frc.node, roughLine(V(-60, -40), V(56, -40), 41), GREEN, 10, 1);
  arrowHead(V(60, -40), V(1, 0), 30, 42).forEach(p => stroke(frc.node, p, GREEN, 10, 1));

  const spin = new Node({position: V(0, -38)});
  rot.node.add(spin);
  const arcPts = roughArc(0, 0, 40, -Math.PI * 0.35, Math.PI * 1.25, 51);
  stroke(spin, arcPts, ORANGE, 9, 1);
  arrowHead(arcPts[arcPts.length - 1], arcPts[arcPts.length - 1].sub(arcPts[arcPts.length - 4]), 24, 52).forEach(p =>
    stroke(spin, p, ORANGE, 9, 1),
  );

  // conectores
  const plus = new Node({position: V(-560, 62), scale: 0});
  root.add(plus);
  stroke(plus, roughLine(V(0, -20), V(0, 20), 61), INK, 9, 1);
  stroke(plus, roughLine(V(-20, 0), V(20, 0), 62), INK, 9, 1);

  const a1 = roughCurve(V(-365, -95), V(-120, 25), -0.18, 71);
  const a2 = roughCurve(V(-365, 215), V(-120, 98), 0.18, 72);
  const a3 = roughLine(V(205, 62), V(395, 62), 75, 0);
  const arrIn = [
    stroke(root, a1, INK, 7),
    ...arrowHead(a1[a1.length - 1], a1[a1.length - 1].sub(a1[a1.length - 5]), 26, 73).map(p => stroke(root, p, INK, 7)),
    stroke(root, a2, INK, 7),
    ...arrowHead(a2[a2.length - 1], a2[a2.length - 1].sub(a2[a2.length - 5]), 26, 74).map(p => stroke(root, p, INK, 7)),
  ];
  const arrOut = [stroke(root, a3, INK, 7), ...arrowHead(V(398, 62), V(1, 0), 26, 76).map(p => stroke(root, p, INK, 7))];
  const loop = roughCurve(V(560, -50), V(-470, -222), 0.3, 81);
  const loopArr = [
    stroke(root, loop, ORANGE, 7),
    ...arrowHead(loop[loop.length - 1], loop[loop.length - 1].sub(loop[loop.length - 5]), 28, 82).map(p =>
      stroke(root, p, ORANGE, 7),
    ),
  ];
  const loopTxt = createRef<Txt>();
  root.add(<Txt ref={loopTxt} position={V(60, -392)} text="" fontFamily="Kalam" fontWeight={700} fontSize={44} fill={ORANGE} />);

  // pulso de corriente que recorre el ciclo
  const cycle = [
    ...roughCurve(V(-470, -105), V(-120, 25), -0.18, 91),
    V(40, 62),
    V(395, 62),
    V(560, 62),
    ...loop,
    V(-560, -105),
  ];
  const path = createRef<Line>();
  root.add(<Line ref={path} points={cycle} stroke="#0000" lineWidth={1} />);
  const t = createSignal(0);
  const dot = createRef<Circle>();
  root.add(
    <Circle
      ref={dot}
      size={30}
      fill={RED}
      opacity={0}
      shadowColor={'#E9A24C'}
      shadowBlur={26}
      position={() => path().getPointAtPercentage(t()).position}
    />,
  );

  const popIn = (n: Node) => n.scale(1, 2 * B, easeOutBack);
  const pulse = (n: Node) => n.scale(1.12, B / 2, easeInOutCubic).to(1, B / 2, easeInOutCubic);

  // ------------------------------------------------------------ animación
  yield* waitFor(B);
  yield* popIn(cur.node);
  yield* popIn(plus);
  yield* popIn(fld.node);
  yield* draw(arrIn, B);
  yield* popIn(frc.node);
  yield* draw(arrOut, B);
  yield* all(popIn(rot.node), spin.rotation(360, 4 * B, linear));
  yield* all(draw(loopArr, 2 * B), spin.rotation(720, 2 * B, linear));
  yield* all(loopTxt().text('el conmutador invierte la corriente cada ½ vuelta', 2 * B), spin.rotation(1080, 2 * B, linear));
  dot().opacity(1);
  // dos vueltas del pulso, los nodos laten a su paso
  for (let lap = 0; lap < 2; lap++) {
    t(0);
    yield* all(
      t(1, 4 * B, linear),
      spin.rotation(spin.rotation() + 360 * 2, 4 * B, linear),
      (function* () {
        yield* pulse(cur.node);
        yield* pulse(frc.node);
        yield* pulse(rot.node);
      })(),
    );
  }
  yield* all(dot().opacity(0, B), spin.rotation(spin.rotation() + 360, 2 * B, linear));
});
