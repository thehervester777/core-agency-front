// Core Agency ad film — frame renderer
//
//   node render.mjs --stills 0.5,2.2,5          PNG stills of those timestamps  → frames/stills/
//   node render.mjs --frames [--workers 4]      every frame, 1/60 s apart         → frames/00000.png …
//   node render.mjs --encode [--audio a.m4a]    ffmpeg → out/core-agency-ad-bn.mp4
//
// Each frame is produced by loading index.html?render, calling AD.seek(t) and taking a
// screenshot, so output is exactly 60 fps no matter how heavy a frame is to draw.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf('--' + n); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };

const FPS = 60, DUR = Number(flag('dur', 43)), TOTAL = Math.round(DUR * FPS);
const FRAMES = path.join(ROOT, 'frames');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json' };

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(p).pipe(res);
    }).listen(0, '127.0.0.1', () => resolve(srv));
  });
}

async function openPage(port) {
  let chromium;
  try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
  const browser = await chromium.launch({ args: ['--disable-gpu', '--font-render-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars', '--disable-lcd-text'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.error('[page]', m.type(), m.text()); });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/index.html?render`);
  await page.waitForFunction(() => window.AD && window.AD.ready, null, { timeout: 60000 });
  return { browser, page };
}

const pad = (n) => String(n).padStart(5, '0');
const shot = (page, file, fmt) => page.screenshot({ path: file, type: fmt, ...(fmt === 'jpeg' ? { quality: 96 } : {}) });

async function stills(list) {
  const srv = await serve();
  const { browser, page } = await openPage(srv.address().port);
  const dir = path.join(FRAMES, 'stills'); fs.mkdirSync(dir, { recursive: true });
  for (const t of list) {
    const t0 = Date.now();
    await page.evaluate((x) => window.AD.seek(x), t);
    const f = path.join(dir, `t${String(t).replace('.', '_')}.png`);
    await shot(page, f, 'png');
    console.log(`t=${t}s → ${path.relative(ROOT, f)}  (${Date.now() - t0} ms)`);
  }
  await browser.close(); srv.close();
}

async function worker(k, n, from, to, fmt) {
  const srv = await serve();
  const { browser, page } = await openPage(srv.address().port);
  fs.mkdirSync(FRAMES, { recursive: true });
  let done = 0; const t0 = Date.now();
  for (let f = from + k; f < to; f += n) {
    await page.evaluate((x) => window.AD.seek(x), f / FPS);
    await shot(page, path.join(FRAMES, `${pad(f)}.${fmt === 'jpeg' ? 'jpg' : 'png'}`), fmt);
    if (++done % 25 === 0) process.stdout.write(`[w${k}] ${done} frames, ${((Date.now() - t0) / done).toFixed(0)} ms/frame\n`);
  }
  await browser.close(); srv.close();
}

async function frames() {
  const n = Number(flag('workers', 4)), from = Number(flag('from', 0)), to = Number(flag('to', TOTAL)), fmt = flag('format', 'png');
  if (!flag('keep', false) && from === 0 && to === TOTAL) fs.rmSync(FRAMES, { recursive: true, force: true });
  fs.mkdirSync(FRAMES, { recursive: true });
  console.log(`rendering frames ${from}–${to - 1} with ${n} workers (${fmt})`);
  const t0 = Date.now();
  await Promise.all(Array.from({ length: n }, (_, k) => new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [fileURLToPath(import.meta.url), '--worker', String(k), String(n), String(from), String(to), fmt, '--dur', String(DUR)], { stdio: 'inherit' });
    p.on('exit', (c) => (c === 0 ? resolve() : reject(new Error(`worker ${k} exited ${c}`))));
  })));
  console.log(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}

function encode() {
  const out = path.join(ROOT, 'out'); fs.mkdirSync(out, { recursive: true });
  const ext = fs.existsSync(path.join(FRAMES, '00000.png')) ? 'png' : 'jpg';
  const audio = flag('audio', null), file = path.join(out, flag('name', 'core-agency-ad-bn-1080p60.mp4'));
  const a = ['-y', '-framerate', String(FPS), '-i', path.join(FRAMES, `%05d.${ext}`)];
  if (audio) a.push('-i', audio);
  a.push('-vf', 'noise=alls=3:allf=t,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(flag('crf', 16)), '-profile:v', 'high', '-level', '4.2',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-r', String(FPS), '-g', '120', '-bf', '3');
  if (audio) a.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
  a.push('-movflags', '+faststart', file);
  const r = spawnSync('ffmpeg', a, { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
  console.log('wrote', file);
}

if (flag('worker', false)) {
  const i = args.indexOf('--worker');
  worker(Number(args[i + 1]), Number(args[i + 2]), Number(args[i + 3]), Number(args[i + 4]), args[i + 5]).catch((e) => { console.error(e); process.exit(1); });
} else if (flag('stills', false)) {
  stills(String(flag('stills')).split(',').map(Number)).catch((e) => { console.error(e); process.exit(1); });
} else if (flag('frames', false)) {
  frames().catch((e) => { console.error(e); process.exit(1); });
} else if (flag('encode', false)) {
  encode();
} else {
  console.log('usage: node render.mjs --stills 0.5,2.2 | --frames [--workers 4 --format png|jpeg] | --encode [--audio file]');
}
