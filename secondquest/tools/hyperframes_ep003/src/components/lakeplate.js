      /* ------------------------------------------------------------------ the lake plate (new art v1, 2026-10-13)
         docs/art_orders/ep003/new_art_v1/01_lake_dusk_plate.png (+ derived grades) replaces the engine-drawn sky,
         hills, island and water. The art is never edited: it is shown as is (<img>), and a WebGL canvas on top of
         its water re-samples the SAME pixels with a gentle, seek-driven ripple displacement (zero at the horizon, so
         the seam is invisible) plus a flicker on the sun/moon glitter. Grades crossfade with k (0 = first image).
         PlateLake(host, ["assets/lake_dusk.png", "assets/lake_night.png"]) -> { draw(t, k), imgs, set(k) } */
      function PlateLake(host, srcs, o) {
        o = Object.assign({ left: -196, top: -108, w: 1673, h: 936, hor: .4556, cTop: 296, amp: 1 }, o || {});
        const imgs = srcs.map((s, i) => { const im = document.createElement("img"); im.src = s; im.alt = "";
          im.style.cssText = `position:absolute; left:${o.left}px; top:${o.top}px; width:${o.w}px; height:${o.h}px; opacity:${i ? 0 : 1}`;
          host.appendChild(im); return im; });
        const cH = o.top + o.h - o.cTop;
        const cv = document.createElement("canvas"); cv.width = o.w; cv.height = cH;
        cv.style.cssText = `position:absolute; left:${o.left}px; top:${o.cTop}px; width:${o.w}px; height:${cH}px`;
        host.appendChild(cv);
        const gl = cv.getContext("webgl", { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false });
        const api = { imgs, canvas: cv, draw() {}, set(k) { imgs.forEach((im, i) => { im.style.opacity = i === 0 ? 1 : Math.max(0, Math.min(1, k - i + 1)); }); } };
        if (!gl) return api;
        const vs = "attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }";
        const fs = `precision highp float; uniform float t, k, amp; uniform vec2 res; uniform sampler2D A, B; uniform vec4 geo;
          float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
          float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
            return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x), mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x), f.y); }
          void main(){
            vec2 fc = gl_FragCoord.xy; float u = fc.x/res.x;
            float y = geo.x + (res.y - fc.y)/res.y*geo.y;              // frame y of this pixel
            float v = (y - geo.z)/geo.w;                                // plate v (0 top .. 1 bottom)
            float d = clamp((v - ${o.hor.toFixed(4)})/(1. - ${o.hor.toFixed(4)}), 0., 1.);
            float a = amp * .0042 * pow(d, 1.15);
            float sw = sin(v*(620. - 380.*d) + t*1.25 + sin(u*6.3 + t*.37)*1.6);
            float nz = vn(vec2(u*11./(.25 + d), v*170. - t*.85)) - .5;
            vec2 uv = vec2(u + a*(sw*.65 + nz*.9), v + a*.32*sin(u*23. + t*.9 + v*260.));
            vec3 c = mix(texture2D(A, uv).rgb, texture2D(B, uv).rgb, k);
            float L = dot(c, vec3(.299,.587,.114));
            float gl = smoothstep(.62, .9, L) * d;                      // the glitter path flickers
            float fl = vn(vec2(u*260., v*520. - t*2.6));
            c *= 1. + gl*(fl - .45)*.45;
            gl_FragColor = vec4(c, 1.);
          }`;
        function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
        const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
        const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const U = (n) => gl.getUniformLocation(pr, n);
        const texs = [null, null];
        function upload(i) {
          const im = imgs[Math.min(i, imgs.length - 1)];
          if (!im.complete || !im.naturalWidth) return false;
          const tx = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tx);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im); texs[i] = tx; return true;
        }
        gl.viewport(0, 0, cv.width, cv.height);
        api.draw = function (t, k) {
          k = k || 0;
          if (!texs[0] && !upload(0)) { cv.style.opacity = 0; return; }
          if (!texs[1] && !upload(1)) { cv.style.opacity = 0; return; }
          cv.style.opacity = 1;
          gl.uniform1i(U("A"), 0); gl.uniform1i(U("B"), 1);
          gl.uniform1f(U("t"), t); gl.uniform1f(U("k"), Math.max(0, Math.min(1, k))); gl.uniform1f(U("amp"), o.amp);
          gl.uniform2f(U("res"), cv.width, cv.height); gl.uniform4f(U("geo"), o.cTop, cH, o.top, o.h);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          api.set(k);
        };
        return api;
      }
