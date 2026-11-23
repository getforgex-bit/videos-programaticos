import {continueRender, delayRender, staticFile} from 'remotion';

/** Carga Kalam (misma fuente que Manim/Motion Canvas) antes de renderizar. */
let loaded = false;
export const ensureKalam = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Cargando tipografía Kalam');
  const faces = [
    new FontFace('Kalam', `url(${staticFile('fonts/Kalam-Regular.ttf')})`, {weight: '400'}),
    new FontFace('Kalam', `url(${staticFile('fonts/Kalam-Bold.ttf')})`, {weight: '700'}),
    new FontFace('Kalam', `url(${staticFile('fonts/Kalam-Light.ttf')})`, {weight: '300'}),
  ];
  Promise.all(faces.map(f => f.load()))
    .then(fs => {
      fs.forEach(f => document.fonts.add(f));
      continueRender(handle);
    })
    .catch(err => {
      console.error(err);
      continueRender(handle);
    });
};
