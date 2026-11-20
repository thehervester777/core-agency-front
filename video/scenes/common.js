/* shared scene helpers */
(() => {
  'use strict';
  const AD = window.AD, { $, $$ } = AD.u;
  const C = (AD.common = {});

  // a short, springy camera shake on a rig
  C.slam = (tl, rig, at, px = 16) => tl
    .fromTo(rig, { x: -px }, { x: 0, duration: 0.42, ease: 'elastic.out(1.4, 0.25)' }, at)
    .fromTo(rig, { y: px * 0.6 }, { y: 0, duration: 0.42, ease: 'elastic.out(1.4, 0.25)' }, at);

  // reveal / hide the masked words of a heading
  C.wordsIn = (tl, el, at, o = {}) => tl.fromTo($$('.wi', el), { yPercent: 118, rotate: o.rot ?? 5, opacity: 0 },
    { yPercent: 0, rotate: 0, opacity: 1, duration: o.d ?? 0.8, stagger: o.s ?? 0.07, ease: o.ease ?? 'expo.out' }, at);
  C.wordsOut = (tl, el, at, o = {}) => tl.to($$('.wi', el), { yPercent: -118, rotate: -4, opacity: 0, duration: o.d ?? 0.45, stagger: o.s ?? 0.04, ease: 'power3.in' }, at);

  // fly-through transition on the scene root: the old scene rushes past the camera while the new one settles in
  C.inOut = (tl, s, dur) => tl
    .fromTo(s.root, { opacity: 0, scale: 0.86, filter: 'blur(18px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out' }, 0)
    .to(s.root, { opacity: 0, scale: 1.18, filter: 'blur(14px)', duration: 0.6, ease: 'power2.in' }, dur - 0.12);

  // the Core Agency lock-up: same geometry at two sizes (small ×4 = large) so the logo can fly into the corner and back
  C.lockup = (cls) => `<div class="lockup ${cls}"><svg viewBox="0 0 32 32" aria-hidden="true"><circle class="lm-ring" cx="16" cy="16" r="11" transform="rotate(-42 16 16)" pathLength="69.1"/><circle class="lm-dot" cx="16" cy="16" r="4.4"/></svg><b>${[...'Core Agency'].map((c) => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</b></div>`;

  // width of an element inside a scene that is currently hidden
  C.measure = (s, el) => {
    const d = s.root.style.display;
    s.root.style.display = 'block'; s.root.style.visibility = 'hidden';
    const w = el.offsetWidth;
    s.root.style.display = d; s.root.style.visibility = '';
    return w;
  };

  // on-screen pointer + click ripple (position it with gsap x / y)
  C.cursor = () => `<div class="cur"><i class="cur-r"></i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 3 19 11l-6.2 1.9L9.9 19z"/></svg></div>`;
  C.click = (tl, cur, at) => tl
    .fromTo($('.cur-r', cur), { scale: 0.2, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 0.55, ease: 'power2.out' }, at)
    .fromTo($('svg', cur), { scale: 1 }, { scale: 0.82, duration: 0.09, yoyo: true, repeat: 1, ease: 'power2.inOut', transformOrigin: '0 0' }, at - 0.02);

  // smooth path through points (Catmull-Rom → cubic Bézier)
  C.smoothPath = (pts) => {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return d;
  };
})();
