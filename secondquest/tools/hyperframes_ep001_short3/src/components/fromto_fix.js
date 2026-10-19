      // every fromTo also carries its from-only properties in the "to" vars (same value): GSAP keeps from-only props in
      // startAt, and the motion-blur sub-frame seeks can revert a startAt mid-tween (seen: SLAP!/REVIVED vanishing)
      { const ft = tl.fromTo.bind(tl);
        tl.fromTo = (t, f, to, at) => { const T = Object.assign({}, to); if (!T.keyframes) for (const k in f) if (!(k in T)) T[k] = f[k]; return ft(t, f, T, at); }; }
