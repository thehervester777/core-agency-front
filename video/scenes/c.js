/* C · reason 1 — two times cheaper (8.5 – 14.5 s) */
AD.build(() => {
  const { $, $$, words, bn, ease } = AD.u, { wordsIn, inOut } = AD.common, TL = AD.tl;
  const A0 = 8.5, DUR = 6.0;
  const s = AD.scene('C', A0, A0 + DUR, { pre: 0.02, post: 0.7 });
  const box = (c) => `<div class="box ${c}"><i class="fr"></i><i class="bk"></i><i class="rt"></i><i class="lf"></i><i class="tp"></i></div>`;
  s.root.innerHTML = `
    <div class="rig">
      <div class="copy">
        <div class="kick">কারণ ০১</div>
        <h2 class="hd">
          <div class="hd-num"><span class="w"><span class="wi"><span class="em">২ গুণ</span></span></span></div>
          <div class="hd-l2">${words('সাশ্রয়ী')}</div>
        </h2>
        <p class="sub">${words('অন্য ম্যানেজমেন্ট সিস্টেমের চেয়ে *অর্ধেক খরচে*।')}</p>
      </div>
      <div class="c-stage">
        <div class="c-bignum">২×</div>
        <div class="c-world">
          <div class="c-floor"></div>
          ${box('bx-o')}${box('bx-u')}
          <div class="c-level"></div>
          <div class="bb c-tag glass t-o"><small>অন্য সিস্টেম</small><b>০%</b></div>
          <div class="bb c-tag glass t-u"><small>Core Agency</small><b>০%</b></div>
          <div class="bb c-badgewrap"><div class="c-badge">${bn(2)}× কম খরচ</div></div>
        </div>
      </div>
    </div>`;
  const q = (sel) => $(sel, s.root);
  const kick = q('.kick'), num = q('.hd-num'), l2 = q('.hd-l2'), sub = q('.sub');
  const world = q('.c-world'), bignum = q('.c-bignum'), bxO = q('.bx-o'), bxU = q('.bx-u');
  const tagO = q('.t-o'), tagU = q('.t-u'), level = q('.c-level'), badgeW = q('.c-badgewrap'), badge = q('.c-badge');
  const vO = $('b', tagO), vU = $('b', tagU);

  gsap.set(bxO, { x: -200 }); gsap.set(bxU, { x: 200 });
  gsap.set(tagO, { '--x': '-200px', '--z': '20px' }); gsap.set(tagU, { '--x': '200px', '--z': '20px' });
  gsap.set(level, { y: 30, z: 112 });
  gsap.set(badgeW, { '--x': '0px', '--z': '150px' });

  const tl = gsap.timeline();
  inOut(tl, s, DUR);

  // copy
  tl.fromTo(kick, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.6 }, 0.25);
  wordsIn(tl, num, 0.3, { d: 1.1, rot: 8 });
  tl.fromTo($('.wi', num), { scale: 1.3, transformOrigin: '0 60%' }, { scale: 1, duration: 1.3, ease: 'expo.out' }, 0.3);
  wordsIn(tl, l2, 0.55);
  wordsIn(tl, sub, 1.05, { s: 0.055 });

  // camera: swings in from the side, then drifts
  tl.fromTo(world, { '--ry': -58, '--rx': -26 }, { '--ry': -30, '--rx': -17, duration: 1.9, ease: 'expo.out' }, 0)
    .to(world, { '--ry': -14, '--rx': -12, duration: 4.4, ease: 'sine.inOut' }, 1.9)
    .fromTo(bignum, { x: 90, opacity: 0 }, { x: 0, opacity: 1, duration: 1.5, ease: 'power3.out' }, 0.3)
    .to(bignum, { x: -70, duration: 5, ease: 'none' }, 1.8);

  // 1 · "the others": a tall pillar climbs to 100 %
  tl.fromTo(bxO, { scaleY: 0.001 }, { scaleY: 1, duration: 1.5, ease: 'power3.out' }, 0.6)
    .fromTo(tagO, { '--y': '150px', opacity: 0 }, { '--y': '-290px', opacity: 1, duration: 1.5, ease: 'power3.out' }, 0.6);
  AD.counter(vO, A0 + 0.6, A0 + 2.0, 0, 100, (v) => bn(Math.round(v)) + '%', ease.out3);

  // 2 · Core Agency: climbs and stops at half
  tl.fromTo(bxU, { scaleY: 0.001 }, { scaleY: 0.5, duration: 1.1, ease: 'back.out(1.5)' }, 1.45)
    .fromTo(tagU, { '--y': '150px', opacity: 0 }, { '--y': '-70px', opacity: 1, duration: 1.1, ease: 'back.out(1.5)' }, 1.45);
  AD.counter(vU, A0 + 1.45, A0 + 2.5, 0, 50, (v) => bn(Math.round(v)) + '%', ease.out3);

  // 3 · the comparison line and the "২× কম খরচ" badge
  tl.fromTo(level, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.inOut' }, 2.75)
    .fromTo(badgeW, { '--y': '40px' }, { '--y': '-12px', duration: 0.8, ease: 'power3.out' }, 3.15)
    .fromTo(badge, { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(2.4)' }, 3.15)
    .fromTo(badge, { boxShadow: '0 0 0px rgba(47,107,235,0)' }, { boxShadow: '0 0 90px rgba(80,140,255,1)', duration: 0.6, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 3.4);
  AD.flash(A0 + 3.18, 0.3, 0.28, '90,140,255', 0.7, 0.55);
  TL.add(tl, A0);
});
