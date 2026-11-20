/* HUD (brand mark + reason progress) and start-up */
AD.build(() => {
  const { $, $$, bn } = AD.u, { lockup } = AD.common, TL = AD.tl;
  const bug = $('.bug'), steps = $('.steps'), lbl = $('.lbl em', steps), bars = $$('i', steps);
  bug.innerHTML = lockup('lock-s');

  // the brand mark lands here when the big logo flies into the corner (end of the logo reveal)
  TL.set(bug, { opacity: 1 }, 6.9);

  // reasons 1–4 fill their own bar while their scene plays
  const R = [[8.5, 6], [14.5, 6], [20.5, 6], [26.5, 4]];
  TL.fromTo(steps, { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.5 }, 8.6)
    .to(steps, { opacity: 0, duration: 0.4 }, 30.2);
  R.forEach(([t, d], i) => TL.fromTo(bars[i], { '--p': 0 }, { '--p': 1, duration: d, ease: 'none' }, t));
  let last = -1;
  AD.hooks.push((t) => {
    const i = t < 14.5 ? 0 : t < 20.5 ? 1 : t < 26.5 ? 2 : 3;
    if (i !== last) { lbl.textContent = bn(`0${i + 1}`); last = i; }
  });
});
AD.boot();
