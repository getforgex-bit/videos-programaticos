#!/usr/bin/env node
/**
 * Render headless de un proyecto Motion Canvas (v3.x).
 *
 * Motion Canvas no tiene CLI de render: el editor (servido por Vite) exporta
 * cada frame como PNG a través del websocket del dev-server. Este script:
 *   1. Levanta `vite` en layers/motion-canvas.
 *   2. Abre el editor del proyecto con Chromium (Playwright) y pulsa "Render".
 *   3. Espera a que el número de PNG escritos deje de crecer y termina.
 *
 * Uso:
 *   node scripts/mc-render.mjs <proyecto> [puerto]
 *   node scripts/mc-render.mjs v01_motor
 *
 * Salida: layers/motion-canvas/output/<proyecto>/000000.png ...
 */
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MC_DIR = path.join(ROOT, 'layers/motion-canvas');
const project = process.argv[2];
const port = Number(process.argv[3] ?? 9123);
if (!project) {
  console.error('Uso: node scripts/mc-render.mjs <proyecto> [puerto]');
  process.exit(1);
}

// El exportador de imágenes escribe en output/<nombre-de-archivo-del-proyecto>/
const outDir = path.join(MC_DIR, 'output', project);
fs.rmSync(outDir, {recursive: true, force: true});

const sleep = ms => new Promise(r => setTimeout(r, ms));
const countFrames = () =>
  fs.existsSync(outDir)
    ? fs.readdirSync(outDir).filter(f => f.endsWith('.png')).length
    : 0;

const vite = spawn(
  'npx',
  ['vite', '--port', String(port), '--strictPort'],
  {cwd: MC_DIR, stdio: ['ignore', 'pipe', 'pipe']},
);
let viteLog = '';
vite.stdout.on('data', d => (viteLog += d));
vite.stderr.on('data', d => (viteLog += d));

const shutdown = async (browser, code) => {
  if (browser) await browser.close().catch(() => {});
  vite.kill('SIGTERM');
  process.exit(code);
};

let browser;
try {
  // Espera a que Vite responda.
  const url = `http://localhost:${port}/src/${project}`;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) break;
    } catch {}
    await sleep(500);
  }

  browser = await chromium.launch({args: ['--use-gl=swiftshader']});
  const page = await browser.newPage({viewport: {width: 1600, height: 900}});
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  page.on('console', m => {
    if (m.type() === 'error') console.error('[console]', m.text());
  });
  // La primera carga puede disparar una re-optimización de dependencias de
  // Vite que recarga la página: se espera y se vuelve a cargar.
  await page.goto(url, {waitUntil: 'networkidle'});
  await sleep(3000);
  await page.goto(url, {waitUntil: 'networkidle'});

  // El botón "Render" vive en la pestaña "Video Settings" del editor.
  const btnWithText = re => page.locator('button').filter({hasText: re});
  const renderBtn = btnWithText(/^\s*render\s*$/i);
  if (!(await renderBtn.count())) {
    const tab = page.locator('[title="Video Settings"]');
    if (await tab.count()) await tab.first().click();
  }
  await renderBtn.first().waitFor({timeout: 30000});
  await renderBtn.first().click();
  console.log(`▶ Render iniciado: ${project} → ${path.relative(ROOT, outDir)}`);

  // Considera terminado cuando el conteo no cambia durante 6 s
  // y el botón vuelve a decir "Render".
  let last = -1;
  let stableSince = Date.now();
  const started = Date.now();
  while (true) {
    await sleep(1000);
    const n = countFrames();
    if (n !== last) {
      last = n;
      stableSince = Date.now();
      process.stdout.write(`\r  frames: ${n}   `);
    }
    const idle = (await btnWithText(/^\s*render\s*$/i).count()) > 0;
    if (n > 0 && idle && Date.now() - stableSince > 6000) break;
    if (Date.now() - started > 30 * 60 * 1000) throw new Error('Timeout de render');
  }
  console.log(`\n✅ ${last} frames exportados.`);
  await shutdown(browser, 0);
} catch (err) {
  console.error('\n❌ Error en render Motion Canvas:', err);
  console.error(viteLog.slice(-2000));
  await shutdown(browser, 1);
}
