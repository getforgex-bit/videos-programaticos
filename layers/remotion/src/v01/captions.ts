/**
 * Guion en pantalla del video 01. Cada texto se ancla a una marca REAL que
 * Manim registró durante el render ({seg, mark}), más un desfase en segundos.
 * Así los textos no se desincronizan aunque cambie la duración de una escena.
 *
 * Marcado de color: "{texto|red}" (red, blue, green, orange, ink, pencil).
 */
export type CaptionCue = {
  seg: 'M1' | 'M2' | 'MC' | 'M3';
  mark: string;
  delay?: number; // segundos tras la marca
  text: string;
};

export const CAPTIONS: CaptionCue[] = [
  // M1 — revelación
  {seg: 'M1', mark: 'run', delay: 0.3, text: 'Un motor eléctrico, funcionando.'},
  {seg: 'M1', mark: 'question', text: 'Gira… pero ¿qué lo hace girar?'},
  {seg: 'M1', mark: 'xray', text: 'Volvamos {transparente|pencil} su carcasa.'},
  {seg: 'M1', mark: 'inside', delay: 0.2, text: 'Adentro: {imanes|red}, una {bobina|red}, un conmutador y escobillas.'},
  {seg: 'M1', mark: 'run_xray', delay: 0.4, text: 'Todo gira gracias a ellas. ¿Pero cómo?'},
  // M2 — física
  {seg: 'M2', mark: 'front_view', delay: 0.3, text: 'Miremos el motor de frente.'},
  {seg: 'M2', mark: 'field', text: 'Los imanes crean un {campo magnético|blue}: de N a S.'},
  {seg: 'M2', mark: 'rotor', text: 'En el centro, la bobina gira junto con el eje.'},
  {seg: 'M2', mark: 'current', text: 'La {corriente|red} sale por un lado de la bobina y entra por otro.'},
  {seg: 'M2', mark: 'force', text: 'Corriente dentro de un campo magnético = {fuerza|green}.'},
  {seg: 'M2', mark: 'torque', text: 'Dos fuerzas en sentidos opuestos: la bobina {gira|orange}.'},
  {seg: 'M2', mark: 'dead_spot', text: 'Pero aquí las fuerzas ya casi no la hacen girar…'},
  {seg: 'M2', mark: 'commutator', text: 'El truco: el conmutador invierte la {corriente|red} justo aquí.'},
  {seg: 'M2', mark: 'continuous', text: 'Cada ½ vuelta se invierte: el empuje nunca cambia de lado.'},
  // MC — resumen
  {seg: 'MC', mark: 'summary', delay: 0.2, text: 'En resumen:'},
  {seg: 'MC', mark: 'summary', delay: 9.8, text: '…y el ciclo se repite mientras haya corriente.'},
  // M3 — reconstrucción
  {seg: 'M3', mark: 'exploded', delay: 0.3, text: 'Ahora, volvamos a armarlo.'},
  {seg: 'M3', mark: 'solidify', text: 'Cerramos la carcasa…'},
  {seg: 'M3', mark: 'spin', text: '…y el motor invisible vuelve a girar.'},
];
