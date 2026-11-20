/* A · hook (0 – 4 s)   B · brand reveal (4 – 8.5 s) */
AD.build(() => {
  const { $, $$, words, icon } = AD.u, { slam, wordsIn, wordsOut, lockup, measure, inOut } = AD.common, TL = AD.tl;

  /* ================= A · hook ================= */
  {
    const s = AD.scene('A', 0, 4.0, { pre: 0, post: 0.7 });
    const pain = (cls, text) => `<div class="pain glass ${cls}"><span class="x">${icon('i-x')}</span><span class="pt">${text}</span><i class="strike"></i></div>`;
    s.root.innerHTML = `
      <div class="rig">
        <div class="a-core"></div>
        <h1 class="a-q">${words('ম্যানেজমেন্ট সিস্টেম *নেবেন?*')}</h1>
        <div class="pains">${pain('p1', 'দাম বেশি')}${pain('p2', 'ড্যাশবোর্ড জটিল')}${pain('p3', 'সিস্টেম ধীর')}</div>
        <div class="a-no">${words('*আর* নয়!')}</div>
      </div>`;
    const rig = $('.rig', s.root), q = $('.a-q', s.root), core = $('.a-core', s.root), no = $('.a-no', s.root);
    const P = ['.p1', '.p2', '.p3'].map((c) => $(c, s.root));
    P.forEach((p, i) => gsap.set(p, { top: -258 + i * 180 }));
    const tl = gsap.timeline();

    // 0 – 1.7  a point of light opens into the question
    tl.fromTo(core, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'expo.out' }, 0.05)
      .to(core, { scale: 3.2, opacity: 0, duration: 0.7, ease: 'power2.in' }, 0.5)
      .fromTo(rig, { z: -300, rotationY: -5 }, { z: 0, rotationY: 5, duration: 4.0, ease: 'power1.out' }, 0);
    wordsIn(tl, q, 0.5, { s: 0.09, d: 0.95 });
    tl.fromTo(q, { scale: 0.92 }, { scale: 1, duration: 1.6, ease: 'power2.out' }, 0.5);
    wordsOut(tl, q, 1.72, { s: 0.05 });
    AD.flash(0.62, 0.45, 0.3);

    // 1.8 – 3.0  three objections slam in out of the dark and get struck out
    P.forEach((p, i) => {
      const at = 1.78 + i * 0.42;
      tl.fromTo(p, { opacity: 0, z: -1500, scale: 0.55, rotationX: 28, rotationY: [14, 0, -14][i] },
        { opacity: 1, z: 0, scale: 1, rotationX: 0, rotationY: 0, duration: 0.5, ease: 'expo.out' }, at)
        .fromTo($('.x', p), { scale: 0.4 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, at + 0.1)
        .fromTo($('.strike', p), { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: 'power4.inOut' }, at + 0.34)
        .to($('.pt', p), { opacity: 0.42, duration: 0.3 }, at + 0.4);
      slam(tl, rig, at + 0.02, 7);
    });

    // 3.0 – 4.0  "আর নয়!" — the objections are blown past the camera
    tl.to(P, { z: 1500, opacity: 0, scale: 1.25, duration: 0.5, stagger: 0.05, ease: 'power3.in' }, 3.0);
    wordsIn(tl, no, 3.1, { s: 0.12, d: 0.6, ease: 'back.out(1.7)' });
    tl.fromTo(no, { scale: 1.9 }, { scale: 1, duration: 0.7, ease: 'expo.out' }, 3.1)
      .to(no, { scale: 2.6, opacity: 0, duration: 0.5, ease: 'power3.in' }, 3.58);
    slam(tl, rig, 3.12, 20);
    AD.flash(3.12, 0.3, 0.5, '240,90,110');
    AD.flash(3.98, 0.4, 0.8, '150,185,255');
    TL.add(tl, 0);
  }

  /* ================= B · brand reveal ================= */
  {
    const s = AD.scene('B', 4.0, 8.5, { pre: 0.02, post: 0.7 });
    const nums = ['০১', '০২', '০৩', '০৪'].map((n, i) => `<span class="n">${n}</span>${i < 3 ? '<i class="ln"></i>' : ''}`).join('');
    s.root.innerHTML = `
      <div class="rig">
        ${lockup('lock-l blk')}
        <div class="b-tag">${words('ক্লাউড POS ও ম্যানেজমেন্ট সিস্টেম')}</div>
        <h2 class="b-q">${words('কেন আমাদের')}<br>${words('ম্যানেজমেন্ট সিস্টেম *নেবেন?*')}</h2>
        <div class="b-cap">${words('চারটি কারণ')}</div>
        <div class="b-nums">${nums}</div>
      </div>`;
    const rig = $('.rig', s.root), lock = $('.blk', s.root), ring = $('.lm-ring', lock), dot = $('.lm-dot', lock);
    const chars = $$('b span', lock), tag = $('.b-tag', s.root), q = $('.b-q', s.root), cap = $('.b-cap', s.root);
    const numEls = $$('.b-nums .n', s.root), lns = $$('.b-nums .ln', s.root), nums$ = $('.b-nums', s.root);
    const w = measure(s, lock);
    gsap.set(lock, { x: (1920 - w) / 2, y: 330, transformOrigin: '0 0' });
    const tl = gsap.timeline();
    tl.fromTo(s.root, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' }, 0)
      .to(s.root, { opacity: 0, scale: 1.18, filter: 'blur(14px)', duration: 0.6, ease: 'power2.in' }, 4.38);

    // 0 – 1.8  the mark draws itself, the wordmark rises letter by letter
    tl.fromTo(ring, { strokeDasharray: '0 69.1', rotation: -160, transformOrigin: '50% 50%' }, { strokeDasharray: '52 17.2', rotation: 0, duration: 1.1, ease: 'power3.inOut' }, 0.05)
      .fromTo(dot, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.7, ease: 'back.out(2.6)' }, 0.5)
      .fromTo(chars, { yPercent: 70, opacity: 0, rotateX: -70 }, { yPercent: 0, opacity: 1, rotateX: 0, duration: 0.75, stagger: 0.035, ease: 'expo.out' }, 0.5)
      .fromTo(rig, { z: -380 }, { z: 0, duration: 2.4, ease: 'power3.out' }, 0);
    wordsIn(tl, tag, 1.1, { s: 0.07 });
    AD.sweep(4.5, 5.5, 0.5);

    // 1.9 – 2.9  the logo flies into the corner and becomes the permanent brand mark
    wordsOut(tl, tag, 1.9, { s: 0.03, d: 0.35 });
    tl.to(lock, { x: 96, y: 58, scale: 0.25, duration: 0.95, ease: 'expo.inOut' }, 1.95)
      .set(lock, { opacity: 0 }, 2.9);

    // 2.3 – 4.0  the question, then the four numbered reasons
    wordsIn(tl, q, 2.3, { s: 0.075, d: 0.85 });
    wordsIn(tl, cap, 3.05, { s: 0.09, d: 0.7 });
    tl.fromTo(numEls, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, stagger: 0.1, ease: 'back.out(2.2)' }, 3.2)
      .fromTo(lns, { scaleX: 0 }, { scaleX: 1, duration: 0.3, stagger: 0.1, ease: 'power3.out' }, 3.3);
    TL.add(tl, 4.0);
  }
});
