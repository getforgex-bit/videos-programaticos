import {defineConfig} from 'vite';
import motionCanvasModule from '@motion-canvas/vite-plugin';

// El plugin se publica como CJS: bajo "type": "module" el export por defecto
// queda anidado en `.default`. Este shim funciona en ambos casos.
const motionCanvas =
  (motionCanvasModule as unknown as {default?: typeof motionCanvasModule})
    .default ?? motionCanvasModule;

export default defineConfig({
  // Permite servir las tipografías compartidas de /assets (fuera de esta capa).
  server: {fs: {allow: ['../..']}},
  plugins: [
    motionCanvas({
      // Cada video tiene su propio proyecto Motion Canvas.
      project: ['./src/project.ts', './src/v01_motor.ts', './src/v01_motor_v2.ts'],
    }),
  ],
});
