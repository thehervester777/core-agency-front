/* D · reason 2 — easy dashboard (14.5 – 20.5 s) */
AD.build(() => {
  const { $, $$, words, bn, grp, icon, ease } = AD.u, { wordsIn, inOut, cursor, click, smoothPath } = AD.common, TL = AD.tl;
  const A0 = 14.5, DUR = 6.0;
  const s = AD.scene('D', A0, A0 + DUR, { pre: 0.02, post: 0.7 });

  // chart geometry
  const data = [38, 52, 44, 66, 58, 82, 96], CW = 440, CH = 120;
  const pts = data.map((v, i) => [Math.round((i / 6) * CW), Math.round(CH - (v / 100) * (CH - 8))]);
  const line = smoothPath(pts), area = `${line} L${CW},${CH + 6} L0,${CH + 6} Z`;
  const days = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র'];
  // donut: payment mix
  const mix = [['বিকাশ', 42, '#2f6beb'], ['নগদ', 28, '#7aa2ff'], ['কার্ড', 18, '#17b27b'], ['ক্যাশ', 12, '#f4a62a']];
  const R = 46, CIRC = 2 * Math.PI * R;
  let acc = 0;
  const segs = mix.map(([, p, c]) => { const len = (p / 100) * CIRC, o = acc; acc += len; return `<circle class="sg" cx="59" cy="59" r="${R}" fill="none" stroke="${c}" stroke-width="22" stroke-dasharray="${len - 3} ${CIRC}" stroke-dashoffset="${-o}" data-len="${len - 3}"/>`; }).join('');
  const branch = [['ঢাকা প্রধান শাখা', 86, 62500], ['চট্টগ্রাম', 64, 39000], ['সিলেট', 41, 23000]];

  s.root.innerHTML = `
    <div class="rig">
      <div class="copy">
        <div class="kick">কারণ ০২</div>
        <h2 class="hd-md">${words('সহজ')}<br>${words('*ড্যাশবোর্ড*')}</h2>
        <p class="sub">${words('এক নজরেই বিক্রি, স্টক ও হিসাব — *কোনো জটিলতা নেই*।')}</p>
      </div>
      <div class="d-stage">
        <div class="d-world">
          <div class="dash">
            <div class="d-top">
              <svg class="lm" viewBox="0 0 32 32"><circle class="lm-ring" cx="16" cy="16" r="11" transform="rotate(-42 16 16)"/><circle class="lm-dot" cx="16" cy="16" r="4.4"/></svg>
              <b>ড্যাশবোর্ড</b><span class="live"><i></i>লাইভ</span><span class="grow"></span>
              <span class="d-btn">${icon('i-file')}রিপোর্ট</span><span class="d-av">${icon('i-user')}</span>
            </div>
            <div class="d-side"><i class="on">${icon('i-chart')}</i><i>${icon('i-cart')}</i><i>${icon('i-store')}</i><i>${icon('i-user')}</i><i>${icon('i-truck')}</i></div>
            <div class="d-main">
              <div class="kpis">
                <div class="card kpi"><small>আজকের বিক্রি</small><div class="v"><span class="n1">৳০</span><span class="dl">▲ ${bn(12)}%</span></div></div>
                <div class="card kpi"><small>মোট অর্ডার</small><div class="v"><span class="n2">০</span><span class="dl">▲ ${bn(8)}%</span></div></div>
                <div class="card kpi"><small>মুনাফা</small><div class="v"><span class="n3">৳০</span><span class="dl">▲ ${bn(9)}%</span></div></div>
              </div>
              <div class="d-row">
                <div class="card chart"><h4>সাপ্তাহিক বিক্রি</h4>
                  <svg viewBox="0 0 ${CW} ${CH + 8}">
                    <defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6beb" stop-opacity=".30"/><stop offset="1" stop-color="#2f6beb" stop-opacity="0"/></linearGradient></defs>
                    <g stroke="#e6edf6" stroke-width="2"><path d="M0 24H${CW}M0 64H${CW}M0 104H${CW}"/></g>
                    <path class="ar" d="${area}" fill="url(#dg)"/>
                    <path class="ln" d="${line}" fill="none" stroke="#2f6beb" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
                    <circle class="pt" cx="${pts[6][0]}" cy="${pts[6][1]}" r="9" fill="#fff" stroke="#2f6beb" stroke-width="5"/>
                  </svg>
                  <div class="ax">${days.map((d) => `<span>${d}</span>`).join('')}</div>
                </div>
                <div class="card donut"><h4>পেমেন্ট</h4>
                  <div class="dn"><svg viewBox="0 0 118 118">${segs}</svg>
                    <ul>${mix.map(([n, p, c]) => `<li><i style="background:${c}"></i>${n} ${bn(p)}%</li>`).join('')}</ul></div>
                </div>
              </div>
              <div class="card branches">${branch.map(([n, w, v]) => `<div class="br"><span>${n}</span><span class="tr"><i style="--w:${w}%"></i></span><span>৳ ${grp(v)}</span></div>`).join('')}</div>
            </div>
            <div class="d-toast">${'<span class="ico">' + icon('i-check') + '</span>'}<span>রিপোর্ট তৈরি হয়েছে</span></div>
            ${cursor()}
          </div>
          <div class="bbz fchip c1" style="left:-170px;top:70px"><span class="ico">${icon('i-bolt')}</span><span>নতুন অর্ডার #${bn(24817)}<small>বিকাশ · ৳ ${grp(2312)}</small></span></div>
          <div class="bbz fchip ok c2" style="left:560px;top:560px"><span class="ico">${icon('i-check')}</span><span>সব শাখা সিঙ্কড<small>সর্বশেষ সিঙ্ক এইমাত্র</small></span></div>
          <div class="bbz fchip warn c3" style="left:-110px;top:470px"><span class="ico">${icon('i-alert')}</span><span>স্টক কম<small>মিনিকেট চাল ৫ কেজি</small></span></div>
        </div>
      </div>
    </div>`;

  const q = (sel) => $(sel, s.root);
  const kick = q('.kick'), hd = q('.hd-md'), sub = q('.sub'), world = q('.d-world'), dash = q('.dash');
  const c1 = q('.c1'), c2 = q('.c2'), c3 = q('.c3'), cur = q('.cur'), toast = q('.d-toast'), btn = q('.d-btn');
  gsap.set(world, { rotationY: -17, rotationX: 6, transformOrigin: '50% 50%' });
  gsap.set(cur, { x: 520, y: 520, opacity: 0 });
  gsap.set(toast, { opacity: 0 });

  const tl = gsap.timeline();
  inOut(tl, s, DUR);
  tl.fromTo(kick, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.6 }, 0.25);
  wordsIn(tl, hd, 0.3, { d: 1.0, s: 0.12, rot: 7 });
  wordsIn(tl, sub, 0.95, { s: 0.05 });

  // the panel flies in from depth, then slowly drifts
  tl.fromTo(dash, { z: -700, x: 260, rotationY: -40, opacity: 0 }, { z: 0, x: 0, rotationY: 0, opacity: 1, duration: 1.4, ease: 'expo.out' }, 0.15)
    .fromTo(world, { rotationY: -30 }, { rotationY: -12, rotationX: 3, duration: 5.9, ease: 'sine.inOut' }, 0);

  // numbers, chart, donut, branches
  AD.counter($('.n1', s.root), A0 + 0.8, A0 + 2.2, 0, 124500, (v) => '৳' + grp(v), ease.out4);
  AD.counter($('.n2', s.root), A0 + 0.9, A0 + 2.2, 0, 386, (v) => bn(Math.round(v)), ease.out4);
  AD.counter($('.n3', s.root), A0 + 1.0, A0 + 2.2, 0, 38200, (v) => '৳' + grp(v), ease.out4);
  tl.fromTo($$('.kpi', s.root), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, 0.7)
    .fromTo($$('.dl', s.root), { scale: 0 }, { scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(3)' }, 1.5)
    .fromTo($('.chart', s.root), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 1.0)
    .fromTo($('.ln', s.root), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 1.3)
    .fromTo($('.ar', s.root), { opacity: 0 }, { opacity: 1, duration: 0.8 }, 2.0)
    .fromTo($('.pt', s.root), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, 2.7)
    .fromTo($('.donut', s.root), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 1.15)
    .fromTo($$('.sg', s.root), { attr: { 'stroke-dasharray': (i, el) => `0 ${CIRC}` } }, { attr: { 'stroke-dasharray': (i, el) => `${el.dataset.len} ${CIRC}` }, duration: 0.9, stagger: 0.14, ease: 'power3.out' }, 1.5)
    .fromTo($('.branches', s.root), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 1.3)
    .fromTo($$('.br .tr i', s.root), { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out' }, 1.8);

  // depth: three floating chips in front of the panel, bobbing on different phases
  [[c1, 2.1, 190, -1], [c2, 2.8, 230, 1], [c3, 3.5, 150, -1]].forEach(([c, at, z, dir]) => {
    tl.fromTo(c, { z: z - 500, y: 50, opacity: 0, scale: 0.7 }, { z, y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out' }, at)
      .to(c, { y: dir * 16, duration: 1.7, ease: 'sine.inOut', yoyo: true, repeat: 2 }, at + 0.9);
  });

  // the pointer: moves across the panel and clicks "রিপোর্ট"
  tl.fromTo(cur, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 3.0)
    .to(cur, { x: 700, y: 300, duration: 0.7, ease: 'power2.inOut' }, 3.0)
    .to(cur, { x: 722, y: 44, duration: 0.8, ease: 'power3.inOut' }, 3.75);
  click(tl, cur, 4.62);
  tl.fromTo(btn, { scale: 1 }, { scale: 0.94, duration: 0.1, yoyo: true, repeat: 1, transformOrigin: '50% 50%' }, 4.6)
    .fromTo(toast, { opacity: 0, y: -30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(2)' }, 4.75)
    .to(cur, { x: 790, y: 150, opacity: 0.0, duration: 0.8, ease: 'power2.in' }, 4.9);
  TL.add(tl, A0);
});
