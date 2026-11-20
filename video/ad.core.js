/* =========================================================
   Core Agency ad film — core
   helpers · scene registry · background engine · overlay FX · seek()
   Everything is a pure function of time, so any frame can be rendered
   on its own (render.mjs calls AD.seek(t) once per output frame).
   ========================================================= */
(() => {
  'use strict';
  const W = 1920, H = 1080, FPS = 60, DUR = 43;
  const AD = (window.AD = {
    W, H, FPS, DUR,
    cfg: { url: 'coreagency.com.bd' },   // shown on the closing card — change here
    scenes: [], counters: [], fxList: [], hooks: [], builders: [], ready: false,
  });
  const TL = (AD.tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } }));
  gsap.ticker.lagSmoothing(0);

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
  const ease = {
    out3: (k) => 1 - Math.pow(1 - clamp(k), 3),
    out4: (k) => 1 - Math.pow(1 - clamp(k), 4),
    io3: (k) => { k = clamp(k); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; },
    lin: (k) => clamp(k),
  };
  const mulberry32 = (a) => () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const BN = '০১২৩৪৫৬৭৮৯';
  const bn = (v) => String(v).replace(/\d/g, (d) => BN[+d]);
  const grp = (n) => {                       // Bangladeshi digit grouping: 1,24,500
    const s = String(Math.round(Math.abs(n)));
    const last = s.slice(-3), rest = s.slice(0, -3);
    return bn((rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' : '') + last);
  };
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  // words → masked spans so a line can be revealed word by word (Bangla conjuncts stay intact);
  // *text* toggles the accent colour and may span several words
  const words = (text) => {
    let em = false;
    return text.split(' ').map((tok) => {
      let out = '', cur = '';
      const flush = () => { if (cur) { out += em ? `<span class="em">${cur}</span>` : cur; cur = ''; } };
      for (const ch of tok) { if (ch === '*') { flush(); em = !em; } else cur += ch; }
      flush();
      return `<span class="w"><span class="wi">${out}</span></span>`;
    }).join(' ');
  };
  const icon = (id, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
  AD.u = { $, $$, clamp, lerp, smooth, ease, mulberry32, bn, grp, h, words, icon };
  // scene builders run after the fonts are loaded, so anything they measure is measured with the real glyphs
  AD.build = (fn) => AD.builders.push(fn);

  /* ---------- scene + counter registry ---------- */
  AD.scene = (id, a, b, { pre = 0.5, post = 0.7 } = {}) => {
    const root = h(`<section class="scene" id="s-${id}"></section>`);
    $('#scenes').appendChild(root);
    const s = { id, a, b, pre, post, root, on: false, fx: null };
    AD.scenes.push(s);
    return s;
  };
  // a number that counts between two times; text is a pure function of t
  AD.counter = (el, a, b, from, to, fmt, e = ease.out4) => { AD.counters.push({ el, a, b, from, to, fmt, e, last: null }); el.textContent = fmt(from); };
  AD.flash = (t, dur = 0.35, a = 0.6, rgb = '120,160,255', x = 0.5, y = 0.5) => AD.fxList.push({ type: 'flash', t, dur, a, rgb, x, y });
  AD.sweep = (t0, t1, a = 0.5, tilt = -0.32) => AD.fxList.push({ type: 'sweep', t0, t1, a, tilt });

  /* ---------- background engine ---------- */
  // Keyframed "look": glow position/size/colour, brand rings, perspective grid floor, camera speed.
  const LOOK = [
    { t: 0.0,  gx: .50, gy: .50, gr: .50, ga: .05, c: [47, 107, 235], c2: [122, 162, 255], rings: 0,   grid: 0,   speed: 30,  dust: .35, streak: 0 },
    { t: 0.7,  gx: .50, gy: .50, gr: .62, ga: .26, c: [47, 107, 235], c2: [122, 162, 255], rings: .4,  grid: 0,   speed: 40,  dust: .55, streak: 0 },
    { t: 1.9,  gx: .50, gy: .52, gr: .62, ga: .17, c: [239, 68, 82],  c2: [244, 166, 42],  rings: .1,  grid: 0,   speed: 50,  dust: .5,  streak: 0 },
    { t: 3.2,  gx: .50, gy: .50, gr: .70, ga: .26, c: [239, 68, 82],  c2: [244, 166, 42],  rings: .0,  grid: 0,   speed: 70,  dust: .5,  streak: 0 },
    { t: 3.6,  gx: .50, gy: .50, gr: .80, ga: .42, c: [47, 107, 235], c2: [122, 162, 255], rings: .6,  grid: 0,   speed: 260, dust: .8,  streak: .7 },
    { t: 4.6,  gx: .50, gy: .46, gr: .66, ga: .36, c: [47, 107, 235], c2: [122, 162, 255], rings: .55, grid: 0,   speed: 90,  dust: .7,  streak: .1 },
    { t: 8.0,  gx: .50, gy: .50, gr: .60, ga: .28, c: [47, 107, 235], c2: [122, 162, 255], rings: .3,  grid: 0,   speed: 70,  dust: .6,  streak: 0 },
    { t: 9.5,  gx: .72, gy: .56, gr: .55, ga: .32, c: [47, 107, 235], c2: [122, 162, 255], rings: .12, grid: 0,   speed: 60,  dust: .6,  streak: 0 },
    { t: 14.5, gx: .70, gy: .42, gr: .55, ga: .27, c: [47, 107, 235], c2: [122, 162, 255], rings: 0,   grid: 0,   speed: 50,  dust: .55, streak: 0 },
    { t: 20.1, gx: .62, gy: .5,  gr: .55, ga: .27, c: [47, 107, 235], c2: [122, 162, 255], rings: 0,   grid: 0,   speed: 60,  dust: .6,  streak: 0 },
    { t: 21.5, gx: .50, gy: .64, gr: .62, ga: .34, c: [47, 107, 235], c2: [122, 162, 255], rings: 0,   grid: .8,  speed: 520, dust: .85, streak: 1 },
    { t: 25.9, gx: .50, gy: .60, gr: .60, ga: .30, c: [47, 107, 235], c2: [122, 162, 255], rings: 0,   grid: .55, speed: 380, dust: .8,  streak: .8 },
    { t: 27.1, gx: .50, gy: .50, gr: .58, ga: .30, c: [23, 178, 123], c2: [122, 162, 255], rings: .25, grid: 0,   speed: 70,  dust: .6,  streak: 0 },
    { t: 30.1, gx: .50, gy: .50, gr: .58, ga: .30, c: [23, 178, 123], c2: [122, 162, 255], rings: .25, grid: 0,   speed: 70,  dust: .6,  streak: 0 },
    { t: 31.1, gx: .62, gy: .5,  gr: .55, ga: .28, c: [239, 68, 82],  c2: [244, 166, 42],  rings: .2,  grid: 0,   speed: 60,  dust: .55, streak: 0 },
    { t: 32.7, gx: .66, gy: .5,  gr: .58, ga: .30, c: [47, 107, 235], c2: [122, 162, 255], rings: .1,  grid: 0,   speed: 60,  dust: .6,  streak: 0 },
    { t: 36.9, gx: .50, gy: .50, gr: .80, ga: .44, c: [47, 107, 235], c2: [122, 162, 255], rings: .85, grid: 0,   speed: 140, dust: .8,  streak: .2 },
    { t: 43.0, gx: .50, gy: .50, gr: .82, ga: .48, c: [47, 107, 235], c2: [122, 162, 255], rings: .85, grid: 0,   speed: 90,  dust: .8,  streak: 0 },
  ];
  const look = (t) => {
    let i = 0;
    while (i < LOOK.length - 1 && LOOK[i + 1].t <= t) i++;
    const a = LOOK[i], b = LOOK[Math.min(i + 1, LOOK.length - 1)];
    const k = a === b ? 0 : smooth((t - a.t) / (b.t - a.t));
    const o = {};
    for (const key in a) o[key] = Array.isArray(a[key]) ? a[key].map((v, j) => lerp(v, b[key][j], k)) : lerp(a[key], b[key], k);
    return o;
  };
  // camera depth, integrated from the speed curve so it is identical for every frame
  const ZN = DUR * FPS + 4, Z = new Float64Array(ZN);
  for (let i = 1; i < ZN; i++) Z[i] = Z[i - 1] + look((i - 1) / FPS).speed / FPS;
  const camZ = (t) => { const f = Math.min(t * FPS, ZN - 2), i = Math.floor(f); return Z[i] + (Z[i + 1] - Z[i]) * (f - i); };

  const bg = $('#bg').getContext('2d');
  const dust = Array.from({ length: 280 }, (_, i) => {
    const r = mulberry32(900 + i);
    return { x: (r() * 2 - 1) * 1600, y: (r() * 2 - 1) * 950, z: r() * 2600, s: 0.6 + r() * 1.7, ph: r() * 6.283, hot: r() > 0.82 };
  });
  const rgb = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const blob = (g, cx, cy, r, c, a) => {
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    gr.addColorStop(0, rgb(c, a)); gr.addColorStop(0.45, rgb(c, a * 0.38)); gr.addColorStop(1, rgb(c, 0));
    g.fillStyle = gr; g.fillRect(cx - r, cy - r, r * 2, r * 2);
  };

  function drawBG(t) {
    const L = look(t), g = bg;
    g.globalCompositeOperation = 'source-over';
    const base = g.createLinearGradient(0, 0, 0, H);
    base.addColorStop(0, '#050f23'); base.addColorStop(1, '#0a1b33');
    g.fillStyle = base; g.fillRect(0, 0, W, H);

    g.globalCompositeOperation = 'lighter';
    blob(g, L.gx * W + Math.sin(t * 0.4) * 40, L.gy * H + Math.cos(t * 0.33) * 30, L.gr * W, L.c, L.ga);
    blob(g, W * 0.16 + Math.sin(t * 0.27) * 90, H * 0.88, W * 0.42, L.c2, L.ga * 0.32);
    blob(g, W * 0.9, H * 0.1 + Math.cos(t * 0.21) * 40, W * 0.38, L.c, L.ga * 0.4);

    // brand rings (the website's hero motif) radiating from the glow centre
    if (L.rings > 0.01) {
      const cx = L.gx * W, cy = L.gy * H;
      for (let k = 0; k < 7; k++) {
        const ph = (t * 0.15 + k / 7) % 1;
        const r = 110 + Math.pow(ph, 1.1) * 1350;
        const a = L.rings * Math.pow(1 - ph, 1.6) * 0.55 * smooth(ph * 7);
        g.strokeStyle = `rgba(122,162,255,${a})`; g.lineWidth = 1.2 + (1 - ph) * 2.2;
        g.beginPath(); g.arc(cx, cy, r, 0, 6.2832); g.stroke();
      }
    }

    // perspective grid floor (speed scene)
    if (L.grid > 0.01) {
      const hz = H * 0.56, zc = camZ(t), off = (zc / 110) % 1, N = 24;
      const gr = g.createLinearGradient(0, hz, 0, H);
      gr.addColorStop(0, 'rgba(47,107,235,0)'); gr.addColorStop(0.35, `rgba(90,140,255,${0.5 * L.grid})`); gr.addColorStop(1, `rgba(150,190,255,${0.75 * L.grid})`);
      g.strokeStyle = gr; g.lineWidth = 1.6;
      g.beginPath();
      for (let i = 0; i < N; i++) { const z = (i + off) / N, y = hz + (H - hz) * Math.pow(z, 2.3); g.moveTo(0, y); g.lineTo(W, y); }
      for (let j = -16; j <= 16; j++) { g.moveTo(W / 2, hz); g.lineTo(W / 2 + j * 230, H + 40); }
      g.stroke();
    }

    // depth dust — stars drifting toward the camera, stretching into streaks at speed
    const zc = camZ(t), cxo = Math.sin(t * 0.21) * 70, cyo = Math.cos(t * 0.17) * 45;
    for (const p of dust) {
      const zr = ((p.z - zc) % 2600 + 2600) % 2600 + 60, sc = 900 / zr;
      const sx = W / 2 + (p.x + cxo) * sc, sy = H / 2 + (p.y + cyo) * sc;
      if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) continue;
      const vis = Math.min(1, (2600 - zr) / 700) * Math.min(1, zr / 260);
      const a = vis * (0.55 + 0.45 * Math.sin(t * 1.7 + p.ph)) * L.dust * (p.hot ? 1 : 0.55);
      if (a < 0.02) continue;
      const rad = p.s * sc * 2;
      if (L.streak > 0.03) {
        const zr2 = zr + L.speed * 0.05 * L.streak, sc2 = 900 / zr2;
        g.strokeStyle = `rgba(170,200,255,${a})`; g.lineWidth = Math.max(1, rad * 1.1); g.lineCap = 'round';
        g.beginPath(); g.moveTo(W / 2 + (p.x + cxo) * sc2, H / 2 + (p.y + cyo) * sc2); g.lineTo(sx, sy); g.stroke();
      } else {
        g.fillStyle = `rgba(190,212,255,${a})`; g.beginPath(); g.arc(sx, sy, Math.max(0.7, rad), 0, 6.2832); g.fill();
        if (p.hot && rad > 1.6) { g.fillStyle = `rgba(110,155,255,${a * 0.18})`; g.beginPath(); g.arc(sx, sy, rad * 4, 0, 6.2832); g.fill(); }
      }
    }
    g.globalCompositeOperation = 'source-over';
  }

  /* ---------- overlay FX (flashes, light sweeps) ---------- */
  const fxc = $('#fx').getContext('2d');
  function drawFX(t) {
    const g = fxc;
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    for (const e of AD.fxList) {
      if (e.type === 'flash') {
        const k = 1 - Math.abs(t - e.t) / e.dur;
        if (k <= 0) continue;
        const a = e.a * smooth(k), cx = e.x * W, cy = e.y * H;
        const gr = g.createRadialGradient(cx, cy, 0, cx, cy, W * 0.85);
        gr.addColorStop(0, `rgba(${e.rgb},${a})`); gr.addColorStop(0.35, `rgba(${e.rgb},${a * 0.45})`); gr.addColorStop(1, `rgba(${e.rgb},0)`);
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
      } else if (e.type === 'sweep') {
        const k = (t - e.t0) / (e.t1 - e.t0);
        if (k < 0 || k > 1) continue;
        const x = lerp(-0.25, 1.25, ease.io3(k)) * W, a = e.a * Math.sin(Math.PI * k);
        g.save(); g.translate(x, H / 2); g.rotate(e.tilt);
        const gr = g.createLinearGradient(-340, 0, 340, 0);
        gr.addColorStop(0, 'rgba(120,165,255,0)'); gr.addColorStop(0.5, `rgba(200,222,255,${a})`); gr.addColorStop(1, 'rgba(120,165,255,0)');
        g.fillStyle = gr; g.fillRect(-340, -H, 680, H * 2); g.restore();
      }
    }
    g.globalCompositeOperation = 'source-over';
  }

  /* ---------- seek: the one entry point the renderer uses ---------- */
  AD.seek = (t) => {
    t = clamp(t, 0, DUR - 0.0001);
    TL.time(t, false);
    for (const s of AD.scenes) {
      const on = t >= s.a - s.pre && t < s.b + s.post;
      if (on !== s.on) { s.root.style.display = on ? 'block' : 'none'; s.on = on; }
      if (on && s.fx) s.fx(t - s.a, t);
    }
    for (const c of AD.counters) {
      const v = c.fmt(lerp(c.from, c.to, c.e((t - c.a) / (c.b - c.a))));
      if (v !== c.last) { c.el.textContent = v; c.last = v; }
    }
    for (const f of AD.hooks) f(t);
    drawBG(t);
    drawFX(t);
    return t;
  };

  /* ---------- boot: fonts → first frame; ?play gives a live preview ---------- */
  const q = new URLSearchParams(location.search);
  if (q.has('render')) document.body.classList.add('render');
  const fit = () => { if (!document.body.classList.contains('render')) $('#stage').style.transform = `scale(${Math.min(innerWidth / W, innerHeight / H)})`; };
  addEventListener('resize', fit); fit();

  AD.boot = async () => {
    await Promise.all([
      document.fonts.load('800 100px "Noto Serif Bengali Variable"', 'আমাদের সিস্টেম'),
      document.fonts.load('500 40px "Noto Serif Bengali Variable"', 'আ'),
      document.fonts.load('800 100px "Aleo Variable"', 'Core Agency'),
      document.fonts.load('500 40px "Aleo Variable"', '0123 POS'),
    ]);
    await document.fonts.ready;
    for (const b of AD.builders) b();
    AD.seek(0);
    AD.ready = true;
    if (q.has('play')) {
      let t0 = performance.now(), paused = false, at = 0;
      const loop = (now) => { if (!paused) { at = ((now - t0) / 1000) % DUR; AD.seek(at); } requestAnimationFrame(loop); };
      addEventListener('keydown', (e) => {
        if (e.code === 'Space') { paused = !paused; if (!paused) t0 = performance.now() - at * 1000; }
        if (e.code === 'ArrowRight') { at = Math.min(DUR - 0.1, at + 1); t0 = performance.now() - at * 1000; AD.seek(at); }
        if (e.code === 'ArrowLeft') { at = Math.max(0, at - 1); t0 = performance.now() - at * 1000; AD.seek(at); }
        if (e.code === 'Home') { at = 0; t0 = performance.now(); AD.seek(0); }
      });
      requestAnimationFrame(loop);
    }
  };
})();
