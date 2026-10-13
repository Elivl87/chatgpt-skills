      /* ------------------------------------------------------------------ the friends Max and Leo (our 3D, 2026-10-13)
         docs/ep003/characters/FRIENDS_MAX_LEO.md. Cut-outs staged as assets/<who>_<pose>_<expr>.png. Scale is keyed to
         the 2D Quest in the same shot: hq = Quest's standing height on screen (px); Max stands 1.08 x Quest, Leo 0.95 x,
         and every pose keeps the same px per cm (the sit/cheer canvases are converted, see render.py friend_span).
         Friend(host, "max", { pose: "sit_34", exprs: ["neutral", "laugh"], hq: 286, x: 532, base: 150, id: "frMax" })
           x = centre, base = the feet line (both in host px). Returns { el, face(tl, expr, at, fade) }.
         The rig keeps the .pop/.lean/.breathe/.sway nesting of the old silhouettes, so the old moves still apply. */
      const FR_REL = { max: { sit_34: .707, sit_side: .707, "34": 1.08, front: 1.08, cheer_34: 1.116, phone_34: 1.035, point_34: 1.081 },
                       leo: { sit_34: .642, sit_side: .642, "34": .95, front: .95, cheer_34: .975, phone_34: .915, point_34: .95 } };
      const FR_ASPECT = { max: { sit_34: .482, sit_side: .55, "34": .2243, front: .30, cheer_34: .441, phone_34: .341, point_34: .441 },
                          leo: { sit_34: .535, sit_side: .58, "34": .274, front: .33, cheer_34: .502, phone_34: .398, point_34: .505 } };
      function Friend(host, who, o) {
        o = Object.assign({ pose: "sit_34", exprs: ["neutral"], hq: 286, x: 0, base: 0, flip: false, cls: "" }, o);
        const fileOf = (e) => o.pose === "34" || o.pose === "front" ? `${who}_${o.pose}_${e}` : `${who}_${o.pose}_${e}`;
        const h = o.hq * FR_REL[who][o.pose] * 1.016, w = h * FR_ASPECT[who][o.pose];
        const el = document.createElement("div"); el.className = "mate fr " + o.cls; if (o.id) el.id = o.id;
        el.style.cssText = `position:absolute; left:${o.x - w / 2}px; top:${o.base - h}px; width:${w}px; height:${h}px; bottom:auto`;
        el.innerHTML = `<div class="pop"><div class="lean"><div class="breathe"><div class="sway"><div class="flip"></div></div></div></div></div>`;
        host.appendChild(el);
        const fl = el.querySelector(".flip"); fl.style.cssText = "position:absolute; inset:0" + (o.flip ? "; transform:scaleX(-1)" : "");
        const imgs = {}, lids = {}, sched = [[0, o.exprs[0]]];
        const canBlink = o.pose === "sit_34";                             // rendered blink frames exist for the seated 3/4 set
        o.exprs.forEach((e, i) => { const im = document.createElement("img"); im.src = `assets/${fileOf(e)}.png`; im.alt = "";
          im.style.opacity = i ? 0 : 1; fl.appendChild(im); imgs[e] = im;
          if (canBlink) { const b = document.createElement("img"); b.src = `assets/${fileOf(e)}_blink.png`; b.alt = ""; b.style.opacity = 0; fl.appendChild(b); lids[e] = b; } });
        return { el, imgs, w, h,
          face(tl, e, at) { sched.push([at, e]); Object.entries(imgs).forEach(([k, im]) => tl.set(im, { opacity: k === e ? 1 : 0 }, at)); },
          // idle blinks (every 2.4-4.6 s, seeded) on whichever face is showing; call after the last face()
          blinks(tl, t0, t1, seed) { if (!canBlink) return; let r = seed || 7; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
            const ss = sched.slice().sort((a, b) => a[0] - b[0]);
            Object.values(lids).forEach((b) => tl.set(b, { opacity: 0 }, 0));
            for (let t = t0 + .8 + rnd() * 1.5; t < t1 - .3; t += 2.4 + rnd() * 2.2) {
              let e = ss[0][1]; for (const [tt, ee] of ss) if (tt <= t) e = ee;
              if (ss.some(([tt]) => Math.abs(tt - t) < .25)) continue;     // never on a face change
              tl.set(lids[e], { opacity: 1 }, t); tl.set(lids[e], { opacity: 0 }, t + .12); } } };
      }
