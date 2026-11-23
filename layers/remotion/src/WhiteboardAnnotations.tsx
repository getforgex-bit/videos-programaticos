import React from 'react';
import {
  MotorFrameState,
  sketchArrow,
  sketchLine,
  smoothstep,
} from './handDrawnUtils';

interface Props {
  state: MotorFrameState;
}

interface ActCopy {
  badge: string;
  title: string;
  subtitle: string;
  accent: string;
}

const ACT_INFO: Record<1 | 2 | 3 | 4 | 5, ActCopy> = {
  1: {
    badge: 'ACTO I · 0:00 - 0:06 · PRECISIÓN MECÁNICA',
    title: '01. EL MOTOR EN FUNCIONAMIENTO',
    subtitle:
      'Trazamos la carcasa de acero y el eje girando a 2,800 RPM. Por fuera todo parece sólido, pero la fuerza que lo mueve es invisible.',
    accent: '#181A1F',
  },
  2: {
    badge: 'ACTO II · 0:06 - 0:12 · REVELACIÓN INTERNA',
    title: '02. CARCASA TRANSPARENTE (RAYOS-X)',
    subtitle:
      'La carcasa se vuelve translúcida y aparecen sus 3 piezas clave: Estator magnético (N/S), Rotor de cobre y Colector con escobillas.',
    accent: '#1D4ED8',
  },
  3: {
    badge: 'ACTO III · 0:12 - 0:19 · DESCUBRIMIENTO FÍSICO',
    title: '03. CORRIENTE + CAMPO = FUERZA DE LORENTZ',
    subtitle:
      'Al inyectar corriente (I) dentro del campo magnético (B), surge un par de fuerzas opuestas F = I(L×B) que empuja la espira.',
    accent: '#059669',
  },
  4: {
    badge: 'ACTO IV · 0:19 - 0:24 · SINCRONÍA DEL COLECTOR',
    title: '04. INVERSIÓN CADA 180° Y ROTACIÓN CONTINUA',
    subtitle:
      'Para que el rotor no se frene a mitad de vuelta, las delgas del conmutador invierten la corriente cada 180° manteniendo el torque positivo.',
    accent: '#D97706',
  },
  5: {
    badge: 'ACTO V · 0:24 - 0:30 · SÍNTESIS CINEMATOGRÁFICA',
    title: '05. RECONSTRUCCIÓN DEL MOTOR',
    subtitle:
      'Volvemos a ensamblar la carcasa exterior sabiendo cómo la energía eléctrica invisible se transforma en potencia mecánica.',
    accent: '#181A1F',
  },
};

export const WhiteboardAnnotations: React.FC<Props> = ({state}) => {
  const {
    frame,
    act,
    rpm,
    thetaDeg,
    casingOpacity,
    internalsVisibility,
    bFieldProgress,
    currentActive,
    lorentzProgress,
  } = state;

  const copy = ACT_INFO[act];

  // Progresos de aparición de llamadas (callouts)
  const callout1P = smoothstep(35, 75, frame);
  const callout4P = smoothstep(70, 110, frame);
  const callout2P = smoothstep(220, 265, frame);
  const callout3P = smoothstep(260, 310, frame);

  // Diagrama causal inferior central (5 nodos que se iluminan progresivamente)
  const steps = [
    {
      id: '01',
      label: 'Motor Activo',
      sub: 'Giro Mecánico',
      active: frame >= 20,
      color: '#181A1F',
    },
    {
      id: '02',
      label: 'Rayos-X',
      sub: 'Estator + Rotor',
      active: frame >= 185,
      color: '#1D4ED8',
    },
    {
      id: '03',
      label: 'Corriente I × B',
      sub: 'Fuerza Lorentz',
      active: frame >= 370,
      color: '#059669',
    },
    {
      id: '04',
      label: 'Conmutador',
      sub: 'Inversión 180°',
      active: frame >= 570,
      color: '#D97706',
    },
    {
      id: '05',
      label: 'Ensamble',
      sub: '3,000 RPM',
      active: frame >= 725,
      color: '#DC2626',
    },
  ];

  // Etiqueta dinámica de la carcasa según el acto
  const casingLabel =
    act === 1
      ? '1. CARCASA ALETEADA (SÓLIDA)'
      : act === 5
        ? '1. CARCASA RECONSTRUIDA (CON CORTE)'
        : '1. CARCASA TRANSPARENTE (FANTASMA 18%)';

  // Opacidad del recuadro previo en esquina inferior izquierda antes de que entre Capa 2 (frame 235)
  const preLeftCardOpacity =
    frame < 235 ? smoothstep(20, 55, frame) * (1 - smoothstep(205, 232, frame)) : 0;

  // Opacidad del recuadro previo en esquina inferior derecha antes de que entre Capa 1 (frame 375)
  const preRightCardOpacity =
    frame < 375 ? smoothstep(45, 85, frame) * (1 - smoothstep(345, 372, frame)) : 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        fontFamily: "'Comic Neue', sans-serif",
        color: '#181A1F',
      }}
    >
      {/* =====================================================================
          1. ENCABEZADO NARRATIVO DE PIZARRÓN (ARRIBA IZQUIERDA)
         ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: 34,
          left: 55,
          width: 1180,
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          border: '3px solid #181A1F',
          borderRadius: 10,
          padding: '14px 22px',
          boxShadow: '4px 4px 0px rgba(24, 26, 31, 0.14)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 1.2,
              color: copy.accent,
              backgroundColor: 'rgba(24, 26, 31, 0.06)',
              padding: '3px 10px',
              borderRadius: 5,
              border: `1.5px dashed ${copy.accent}`,
            }}
          >
            {copy.badge}
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#64748B',
            }}
          >
            IDEA A: EL MOTOR INVISIBLE · ESTILO 02: WHITEBOARD / DIBUJO A MANO
          </span>
        </div>

        <div
          style={{
            fontFamily: "'Humor Sans', cursive",
            fontSize: 34,
            color: copy.accent,
            letterSpacing: 0.5,
            lineHeight: 1.15,
          }}
        >
          {copy.title}
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#334155',
            marginTop: 4,
            lineHeight: 1.28,
          }}
        >
          {copy.subtitle}
        </div>
      </div>

      {/* =====================================================================
          2. TARJETA DE TELEMETRÍA Y FÓRMULA DE LORENTZ (ARRIBA DERECHA)
         ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: 34,
          left: 1315,
          width: 550,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '3px solid #181A1F',
          borderRadius: 10,
          padding: '14px 20px',
          boxShadow: '4px 4px 0px rgba(24, 26, 31, 0.14)',
        }}
      >
        <div
          style={{
            fontFamily: "'Humor Sans', cursive",
            fontSize: 22,
            color: '#181A1F',
            borderBottom: '2px dashed #CBD5E1',
            paddingBottom: 6,
            marginBottom: 8,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>TELEMETRÍA DE PIZARRÓN</span>
          <span style={{color: '#DC2626'}}>RPM: {Math.round(rpm)}</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px 14px',
            fontSize: 17,
            fontWeight: 700,
          }}
        >
          <div>
            Ángulo Rotor (θ):{' '}
            <span style={{color: '#1D4ED8'}}>
              {Math.round(thetaDeg).toString().padStart(3, '0')}°
            </span>
          </div>
          <div>
            Opacidad Carcasa:{' '}
            <span style={{color: '#475569'}}>
              {Math.round(casingOpacity * 100)}%
            </span>
          </div>
          <div>
            Campo Magnético B:{' '}
            <span style={{color: bFieldProgress > 0.3 ? '#1D4ED8' : '#94A3B8'}}>
              {bFieldProgress > 0.3 ? 'ACTIVO (N→S)' : 'EN ESPERA'}
            </span>
          </div>
          <div>
            Corriente DC (I):{' '}
            <span style={{color: currentActive > 0.3 ? '#DC2626' : '#94A3B8'}}>
              {currentActive > 0.3 ? 'FLUJO ACTIVO' : 'CIRCUITO ABIERTO'}
            </span>
          </div>
        </div>

        {/* Ecuación vectorial de Fuerza de Lorentz dibujada a mano desde Acto III */}
        <div
          style={{
            marginTop: 10,
            padding: '8px 12px',
            borderRadius: 7,
            backgroundColor: lorentzProgress > 0.1 ? '#ECFDF5' : '#F8FAFC',
            border: `2px solid ${lorentzProgress > 0.1 ? '#059669' : '#CBD5E1'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              fontFamily: "'Humor Sans', cursive",
              fontSize: 20,
              color: lorentzProgress > 0.1 ? '#059669' : '#64748B',
            }}
          >
            Lorentz: F = I · (L × B)
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#059669',
            }}
          >
            {lorentzProgress > 0.1 ? 'Par τ > 0 (Giro Horario)' : 'Pendiente de corriente'}
          </span>
        </div>
      </div>

      {/* =====================================================================
          3. LÍNEAS GUÍA Y ETIQUETAS DE COMPONENTES SOBRE EL MOTOR (SVG)
         ===================================================================== */}
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{position: 'absolute', inset: 0}}
      >
        {/* Callout 1: Carcasa Exterior (Arriba Izquierda del Motor) */}
        {callout1P > 0.01 && (
          <g opacity={callout1P}>
            <path
              d={sketchLine(815, 290, 620, 235, 101, 1.0, 0)}
              stroke="#181A1F"
              strokeWidth={2.5}
              fill="none"
            />
            <path
              d={sketchLine(620, 235, 285, 235, 102, 1.0, 0)}
              stroke="#181A1F"
              strokeWidth={2.5}
              fill="none"
            />
            <circle cx={815} cy={290} r={5.5} fill="#181A1F" />
            <rect
              x={285}
              y={196}
              width={335}
              height={34}
              rx={6}
              fill="rgba(255,255,255,0.94)"
              stroke="#181A1F"
              strokeWidth={2}
            />
            <text
              x={452}
              y={219}
              textAnchor="middle"
              fill="#181A1F"
              fontWeight="bold"
              fontSize={15.5}
            >
              {casingLabel}
            </text>
          </g>
        )}

        {/* Callout 2: Colector de Delgas y Escobillas (Centro Izquierda) */}
        {callout2P > 0.01 && internalsVisibility > 0.1 && (
          <g opacity={callout2P * internalsVisibility}>
            <path
              d={sketchLine(780, 445, 610, 415, 103, 1.0, 0)}
              stroke="#D97706"
              strokeWidth={2.5}
              fill="none"
            />
            <path
              d={sketchLine(610, 415, 330, 415, 104, 1.0, 0)}
              stroke="#D97706"
              strokeWidth={2.5}
              fill="none"
            />
            <circle cx={780} cy={445} r={5.5} fill="#D97706" />
            <rect
              x={330}
              y={376}
              width={280}
              height={34}
              rx={6}
              fill="#FFFBEB"
              stroke="#D97706"
              strokeWidth={2.2}
            />
            <text
              x={470}
              y={399}
              textAnchor="middle"
              fill="#B45309"
              fontWeight="bold"
              fontSize={16}
            >
              2. COLECTOR + ESCOBILLAS (B+/B-)
            </text>
          </g>
        )}

        {/* Callout 3: Estator Magnético N/S (Centro Derecha Superior) */}
        {callout3P > 0.01 && internalsVisibility > 0.1 && (
          <g opacity={callout3P * internalsVisibility}>
            <path
              d={sketchLine(1095, 340, 1295, 305, 105, 1.0, 0)}
              stroke="#1D4ED8"
              strokeWidth={2.5}
              fill="none"
            />
            <path
              d={sketchLine(1295, 305, 1590, 305, 106, 1.0, 0)}
              stroke="#1D4ED8"
              strokeWidth={2.5}
              fill="none"
            />
            <circle cx={1095} cy={340} r={5.5} fill="#1D4ED8" />
            <rect
              x={1300}
              y={266}
              width={290}
              height={34}
              rx={6}
              fill="#EFF6FF"
              stroke="#1D4ED8"
              strokeWidth={2.2}
            />
            <text
              x={1445}
              y={289}
              textAnchor="middle"
              fill="#1D4ED8"
              fontWeight="bold"
              fontSize={16}
            >
              3. ESTATOR: IMANES FIJOS (N / S)
            </text>
          </g>
        )}

        {/* Callout 4: Eje de Salida y Rotor Bobinado (Centro Derecha Inferior) */}
        {callout4P > 0.01 && (
          <g opacity={callout4P}>
            <path
              d={sketchLine(1245, 472, 1345, 515, 107, 1.0, 0)}
              stroke="#DC2626"
              strokeWidth={2.5}
              fill="none"
            />
            <path
              d={sketchLine(1345, 515, 1635, 515, 108, 1.0, 0)}
              stroke="#DC2626"
              strokeWidth={2.5}
              fill="none"
            />
            <circle cx={1245} cy={472} r={5.5} fill="#DC2626" />
            <rect
              x={1345}
              y={476}
              width={290}
              height={34}
              rx={6}
              fill="#FEF2F2"
              stroke="#DC2626"
              strokeWidth={2.2}
            />
            <text
              x={1490}
              y={499}
              textAnchor="middle"
              fill="#DC2626"
              fontWeight="bold"
              fontSize={16}
            >
              4. EJE MECÁNICO + ROTOR (3000 RPM)
            </text>
          </g>
        )}
      </svg>

      {/* =====================================================================
          4. TARJETAS DE BOCETO INICIAL ANTES DE QUE ENTREN CAPA 2 Y CAPA 1
         ===================================================================== */}
      {preLeftCardOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: 65,
            top: 605,
            width: 530,
            height: 365,
            opacity: preLeftCardOpacity,
            backgroundColor: 'rgba(255, 255, 255, 0.78)',
            border: '3px dashed #64748B',
            borderRadius: 10,
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Humor Sans', cursive",
                fontSize: 25,
                color: '#181A1F',
                marginBottom: 10,
              }}
            >
              OBSERVACIÓN EXTERIOR (ACTO I)
            </div>
            <div style={{fontSize: 19, fontWeight: 700, color: '#334155', lineHeight: 1.45}}>
              • Carcasa cilíndrica con aletas de disipación térmica.
              <br />
              • Eje de acero acoplado sobre rodamientos frontales.
              <br />• Sin combustión ni contacto mecánico visible: ¿cómo nace el giro?
            </div>
          </div>
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#F1F5F9',
              borderRadius: 8,
              border: '2px solid #94A3B8',
              fontSize: 17,
              fontWeight: 700,
              color: '#1E293B',
            }}
          >
            Siguiente paso (0:06s): Volver transparente la carcasa para revelar el circuito interior.
          </div>
        </div>
      )}

      {preRightCardOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: 1325,
            top: 605,
            width: 530,
            height: 365,
            opacity: preRightCardOpacity,
            backgroundColor: 'rgba(255, 255, 255, 0.78)',
            border: '3px dashed #64748B',
            borderRadius: 10,
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Humor Sans', cursive",
                fontSize: 25,
                color: '#1D4ED8',
                marginBottom: 10,
              }}
            >
              ANATOMÍA INTERNA (CÁMARA DE RAYOS-X)
            </div>
            <div style={{fontSize: 19, fontWeight: 700, color: '#334155', lineHeight: 1.45}}>
              • <span style={{color: '#DC2626'}}>Polo Norte (N)</span> y{' '}
              <span style={{color: '#1D4ED8'}}>Polo Sur (S)</span> crean un campo magnético fijo.
              <br />• <span style={{color: '#D97706'}}>Bobinado del Rotor</span>: espiras de cobre libres de girar en el entrehierro.
              <br />• <span style={{color: '#059669'}}>Conmutador</span>: anillo partido que alimenta la bobina en movimiento.
            </div>
          </div>
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#EFF6FF',
              borderRadius: 8,
              border: '2px solid #93C5FD',
              fontSize: 17,
              fontWeight: 700,
              color: '#1E3A8A',
            }}
          >
            En 0:12s: Activamos Capa 1 [Manim] con el osciloscopio de Fuerza de Lorentz.
          </div>
        </div>
      )}

      {/* =====================================================================
          5. PANEL CENTRAL INFERIOR: CADENA CAUSAL DIBUJADA A MANO
         ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          left: 630,
          top: 742,
          width: 660,
          height: 242,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          border: '3px solid #181A1F',
          borderRadius: 10,
          padding: '14px 18px',
          boxShadow: '4px 4px 0px rgba(24, 26, 31, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontFamily: "'Humor Sans', cursive",
            fontSize: 22,
            color: '#181A1F',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>SÍNTESIS VISUAL · ¿CÓMO PROVOCA GIRO LA CORRIENTE?</span>
          <span style={{fontSize: 15, fontFamily: "'Comic Neue', sans-serif", color: '#64748B'}}>
            PASO {act} DE 5
          </span>
        </div>

        {/* 5 Cajas de Flujo Conectadas */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
          }}
        >
          {steps.map((st, i) => (
            <React.Fragment key={st.id}>
              <div
                style={{
                  flex: 1,
                  padding: '8px 6px',
                  borderRadius: 8,
                  border: `2.5px solid ${st.active ? st.color : '#CBD5E1'}`,
                  backgroundColor: st.active ? 'rgba(24,26,31,0.04)' : '#F8FAFC',
                  textAlign: 'center',
                  opacity: st.active ? 1 : 0.48,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Humor Sans', cursive",
                    fontSize: 16,
                    color: st.active ? st.color : '#94A3B8',
                  }}
                >
                  {st.id}. {st.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#475569',
                    marginTop: 2,
                  }}
                >
                  {st.sub}
                </div>
              </div>
              {i < steps.length - 1 && (
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: steps[i + 1].active ? '#181A1F' : '#CBD5E1',
                  }}
                >
                  →
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Nota de conclusión física al pie del cuadro central */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#1E293B',
            backgroundColor: '#F8FAFC',
            border: '1.5px dashed #94A3B8',
            borderRadius: 6,
            padding: '7px 12px',
            textAlign: 'center',
          }}
        >
          {act === 1 && '1° Observamos el movimiento mecánico externo: 2,800 RPM en el eje.'}
          {act === 2 && '2° Descubrimos el Estator (imanes N/S) rodeando al Rotor de cobre.'}
          {act === 3 && '3° La corriente (I) cruza el campo (B) y genera el par de fuerzas de Lorentz (↑F, ↓-F).'}
          {act === 4 && '4° El conmutador invierte I cada 180° para que el empuje jamás cambie de sentido.'}
          {act === 5 && '5° Motor reconstruido: Electricidad + Magnetismo convertidos en Rotación Continua.'}
        </div>
      </div>

      {/* =====================================================================
          6. BARRA INFERIOR DE LÍNEA DE TIEMPO Y PROGRESO DE LOS 5 ACTOS
         ===================================================================== */}
      <div
        style={{
          position: 'absolute',
          left: 55,
          right: 55,
          bottom: 18,
          height: 36,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '2.5px solid #181A1F',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          padding: '0 14px',
          justifyContent: 'space-between',
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        {/* Barra de relleno de progreso */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${(frame / 899) * 100}%`,
            backgroundColor: 'rgba(13, 110, 253, 0.13)',
            borderRight: '3px solid #0D6EFD',
          }}
        />
        <span style={{zIndex: 1}}>0:00 · I. MOTOR ACTIVO</span>
        <span style={{zIndex: 1, color: act === 2 ? '#1D4ED8' : '#64748B'}}>
          0:06 · II. TRANSPARENCIA
        </span>
        <span style={{zIndex: 1, color: act === 3 ? '#059669' : '#64748B'}}>
          0:12 · III. FUERZA LORENTZ
        </span>
        <span style={{zIndex: 1, color: act === 4 ? '#D97706' : '#64748B'}}>
          0:19 · IV. CONMUTACIÓN 180°
        </span>
        <span style={{zIndex: 1, color: act === 5 ? '#DC2626' : '#64748B'}}>
          0:24 · V. RECONSTRUCCIÓN · 0:30
        </span>
      </div>
    </div>
  );
};
