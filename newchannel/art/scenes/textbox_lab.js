/* Text-box lab (2026-10-16): the four variants of K.tbox next to Eli and Mila, in one scene light.
   ?scene=textbox_lab&light=golden|night|noon|dusk|field&age=<s since the box appeared> */
(function (root) {
  const K = root.K, C = K.cast;
  const BG = { golden: ['#e9a77f', '#ffe2a8'], night: ['#0b1030', '#463f6e'], noon: ['#b9c2cf', '#e8e6df'], dusk: ['#2a2b58', '#ffcb8e'], field: ['#93a9c4', '#ffe0aa'] };
  K.scene('textbox_lab', {
    setup(ctx, o) { this.light = o.light || 'golden'; this.age = o.age != null ? Number(o.age) : null; },
    draw(ctx, t) {
      const b = BG[this.light] || BG.golden, g = ctx.createLinearGradient(0, 0, 0, K.H); g.addColorStop(0, b[0]); g.addColorStop(1, b[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, K.H);
      const L = C.LIGHT[this.light === 'field' ? 'golden' : this.light] || C.LIGHT.golden, age = this.age ?? t;
      const e = C.draw(ctx, 'eli1', 420, 1000, 620, { view: 'q', dir: 1, pose: 'fist', expr: 'furious', t, light: L });
      const m = C.draw(ctx, 'mila1', 1500, 1000, 560, { view: 'q', dir: -1, pose: 'crossed', expr: 'smug', t, light: L });
      const av = [[e.head[0] - e.head[2] * 1.2, e.head[1] - e.head[2] * 1.8, e.head[0] + e.head[2] * 1.2, e.head[1] + e.head[2] * 1.2], [m.head[0] - m.head[2] * 1.2, m.head[1] - m.head[2] * 1.8, m.head[0] + m.head[2] * 1.2, m.head[1] + m.head[2] * 1.2]];
      K.tbox.draw(ctx, { text: '¡¿QUIÉN FUE?!', kind: 'shout', head: e.head, light: this.light, age, avoid: av, at: [760, 170] });
      K.tbox.draw(ctx, { text: 'Fuiste tú.', kind: 'speech', head: m.head, light: this.light, age, avoid: av, at: [1180, 300] });
      K.tbox.draw(ctx, { text: '¿…quién fue?', kind: 'whisper', head: e.head, light: this.light, age, avoid: av, at: [820, 520] });
      K.tbox.draw(ctx, { text: 'hmm… el hueco', kind: 'thought', head: m.head, light: this.light, age, avoid: av, at: [1180, 640] });
    },
    post: { grain: 0.1, vignette: 0.3 },
  });
})(typeof window !== 'undefined' ? window : globalThis);
