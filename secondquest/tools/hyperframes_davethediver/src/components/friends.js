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
      /* ------------------------------------------------------------------ Max and Leo INSIDE the rowboat (2026-10-14)
         The 3D builder's in-boat layers (public/art/ep003/props3d/boat_layers.json): boat_max_* / boat_leo_* share one
         1453x535 crop with rowboat_side_back/front_tall (= the v1 halves + 216 px headroom), so stacked on our two-pass
         boat (back img 620 wide at top 9) they sit on their thwarts with their legs behind the near hull. Each friend
         gets a wrapper the width of his figure (so lean/breathe pivot on him), inside a clip like #crewClip (so the old
         pop-from-below moves stay hidden under the boat). Order: back half -> these friends -> the 2D crew -> front half.
         BoatFriends(crewClipEl, { ids: ["silA", "silB"], exprs: [...], dx: { max: 150, leo: 150 }, scale: 1, cls: "" })
         dx in layer px (the builder allows +-150); sweat maps to shock (no in-boat sweat face). */
      const BF_K = 620 / 1452, BF_TOP = 9 - 216 * 620 / 1452, BF_H = 535 * 620 / 1452;
      const BF_BOX = { max: [735, 1000], leo: [955, 1215] };
      function BoatFriends(crewClipEl, o) {
        o = Object.assign({ ids: ["silA", "silB"], exprs: ["neutral"], dx: { max: 150, leo: 150 }, scale: 1, cls: "" }, o);
        const clip = document.createElement("div");
        clip.style.cssText = "position:absolute; left:-80px; top:-300px; width:780px; height:405px; overflow:hidden";
        crewClipEl.parentNode.insertBefore(clip, crewClipEl);
        const map = (e) => (e === "sweat" ? "shock" : e);
        const exprs = [...new Set(o.exprs.map(map))];
        const out = {};
        ["max", "leo"].forEach((who, wi) => {
          const [b0, b1] = BF_BOX[who], dx = o.dx[who] || 0;
          const left = (b0 + dx) * BF_K, w = (b1 - b0) * BF_K;
          const el = document.createElement("div"); el.className = "mate bf " + o.cls; el.id = o.ids[wi];
          el.style.cssText = `position:absolute; left:${left + 80}px; top:${BF_TOP + 300}px; width:${w}px; height:${BF_H}px; bottom:auto`;
          el.innerHTML = `<div class="pop"><div class="lean"><div class="breathe"><div class="sway"><div class="rx"><div class="flip"></div></div></div></div></div></div>`;
          clip.appendChild(el);
          const rx = el.querySelector(".rx"); rx.style.cssText = "position:absolute; inset:0";
          const fl = el.querySelector(".flip");
          fl.style.cssText = `position:absolute; inset:0; transform-origin:50% 100%; transform:scale(${o.scale})`;
          const frames = {};
          const mkImg = (name) => { const im = document.createElement("img"); im.src = `assets/boat_${who}_${name}.png`; im.alt = "";
            im.style.cssText = `position:absolute; left:${-b0 * BF_K}px; top:0; width:${620 * 1453 / 1452}px; height:${BF_H}px; max-width:none; opacity:0; object-fit:fill`;
            fl.appendChild(im); return im; };
          exprs.forEach((e, i) => { frames[e] = { base: mkImg(e), blink: mkImg(e + "_blink"), m: [0, 1, 2].map((k) => mkImg(`${e}_m${k}`)) };
            if (i === 0) frames[e].base.style.opacity = 1; });
          const sched = [[0, exprs[0]]], talks = [];
          const cur = (t) => { let e = exprs[0]; for (const [tt, ee] of sched.slice().sort((a, b) => a[0] - b[0])) if (tt <= t) e = ee; return e; };
          const all = () => Object.values(frames).flatMap((f) => [f.base, f.blink, ...f.m]);
          out[who] = { el, w, frames,
            // a face change is a reaction: 2-3 frames of anticipation (a small squash), then the swap with its body beat:
            // laugh = a bounce, shock = a jolt back, sweat/side-eye = a guilty sink; neutral = settle
            face(tl, e, at) { const raw = e; e = map(e); sched.push([at, e]);
              const a0 = Math.max(0, at - .08);
              if (at > .2) tl.to(rx, { scaleY: .975, scaleX: 1.01, duration: .08, ease: "power1.in", transformOrigin: "50% 100%" }, a0);
              all().forEach((im) => tl.set(im, { opacity: im === frames[e].base ? 1 : 0 }, at));
              if (at <= .2) return;
              const R = { laugh: [{ y: -7, scaleY: 1.03, scaleX: .99, duration: .12, ease: "power2.out" }, { y: 0, scaleY: 1, scaleX: 1, duration: .5, ease: "bounce.out" }],
                          shock: [{ x: 6, y: -4, rotation: 4, scaleY: 1.04, scaleX: 1, duration: .07, ease: "power3.out" }, { x: 0, y: 0, rotation: 0, scaleY: 1, duration: .55, ease: "elastic.out(1, .4)" }],
                          sweat: [{ y: 5, scaleY: .97, scaleX: 1, duration: .25, ease: "sine.out" }, { y: 0, scaleY: 1, duration: .8, ease: "sine.inOut" }],
                          sideeye: [{ rotation: -2.5, scaleY: 1, scaleX: 1, duration: .2, ease: "sine.out" }, { rotation: 0, duration: .9, ease: "sine.inOut" }],
                          neutral: [{ scaleY: 1, scaleX: 1, duration: .2, ease: "sine.out" }] }[raw] || [{ scaleY: 1, scaleX: 1, duration: .2 }];
              tl.to(rx, { keyframes: R, transformOrigin: "50% 100%" }, at); },
            // idle life (blocks that do not already breathe the crew): breathing 1.5 %, a slow sway, own phase
            idle(tl, t0, t1, ph) { ph = ph || 0; const d = t1 - t0;
              tl.fromTo(el.querySelector(".breathe"), { scaleY: 1 }, { scaleY: 1.015, duration: 1.8 + ph * .2, ease: "sine.inOut", yoyo: true, repeat: Math.ceil(d / 1.8), transformOrigin: "50% 100%", immediateRender: false }, t0);
              tl.fromTo(el.querySelector(".sway"), { rotation: -1.1 }, { rotation: 1.1, duration: 2.5 + ph * .3, ease: "sine.inOut", yoyo: true, repeat: Math.ceil(d / 2.5), transformOrigin: "50% 100%", immediateRender: false }, t0); },
            // lip-flap m0 -> m1 -> m2 -> m1 at 10 fps (laughs and talk), then back to the face
            talk(tl, t0, t1) { const e = cur(t0 + .001), f = frames[e]; const seq = [0, 1, 2, 1];
              let i = 0; for (let t = t0; t < t1; t += .1, i++) { const k = seq[i % 4];
                tl.set(f.base, { opacity: 0 }, t); f.m.forEach((im, j) => tl.set(im, { opacity: j === k ? 1 : 0 }, t)); }
              f.m.forEach((im) => tl.set(im, { opacity: 0 }, t1)); tl.set(f.base, { opacity: 1 }, t1); talks.push([t0 - .3, t1 + .3]); },
            blinks(tl, t0, t1, seed) { let r = seed || 7; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
              for (let t = t0 + .8 + rnd() * 1.5; t < t1 - .3; t += 2.4 + rnd() * 2.2) {
                if (sched.some(([tt]) => Math.abs(tt - t) < .35) || talks.some(([a, b]) => t > a && t < b)) continue;
                const f = frames[cur(t)]; tl.set(f.blink, { opacity: 1 }, t); tl.set(f.blink, { opacity: 0 }, t + .1); } } };
        });
        return out;
      }

      /* ------------------------------------------------------------------ seagulls (our 3D gull, 2026-10-14)
         public/art/ep003/props3d/seagull_34.png (staged as assets/seagull_34.png). The cut-out is a gliding pose; the
         wing-flap is a squash cycle on the wings' plane (scaleY 1 -> .5 -> 1), which reads as a flap at gull size.
         Gull(host, { w: 150 }) -> { el, fly(tl, t0, t1, pts, o) } ; pts = [[x, y], ...] frame/layer coords of the centre,
         o.flip faces left, o.flaps = [[ta, tb], ...] windows that flap (else it glides with a slow bank). */
      function Gull(host, o) {
        o = Object.assign({ w: 150 }, o);
        const h = o.w * 747 / 875;
        const el = document.createElement("div"); el.className = "gull";
        el.style.cssText = `position:absolute; left:${-o.w / 2}px; top:${-h / 2}px; width:${o.w}px; height:${h}px; opacity:0; pointer-events:none`;
        const wing = document.createElement("div"); wing.style.cssText = "position:absolute; inset:0";
        const im = document.createElement("img"); im.src = "assets/seagull_34.png"; im.alt = "";
        im.style.cssText = "position:absolute; inset:0; width:100%; height:100%" + (o.flip ? "; transform:scaleX(-1)" : "") + (o.filter ? `; filter:${o.filter}` : "");
        wing.appendChild(im); el.appendChild(wing); host.appendChild(el);
        return { el, wing,
          fly(tl, t0, t1, pts, f) { f = f || {};
            tl.set(el, { opacity: 1, x: pts[0][0], y: pts[0][1], rotation: 0 }, t0);
            const seg = (t1 - t0) / (pts.length - 1);
            pts.slice(1).forEach(([x, y], i) => tl.to(el, { x, y, duration: seg, ease: "none" }, t0 + i * seg));
            tl.fromTo(el, { rotation: -4 }, { rotation: 4, duration: 1.3, ease: "sine.inOut", yoyo: true, repeat: Math.ceil((t1 - t0) / 1.3), immediateRender: false }, t0);
            (f.flaps || [[t0, t0 + Math.min(1.2, t1 - t0)]]).forEach(([a, b]) => {
              const n = Math.max(1, Math.round((b - a) / .34));
              tl.fromTo(wing, { scaleY: 1 }, { scaleY: .5, duration: .17, ease: "sine.inOut", yoyo: true, repeat: n * 2 - 1, transformOrigin: "50% 45%", immediateRender: false }, a); });
            tl.set(el, { opacity: 0 }, t1); } };
      }
