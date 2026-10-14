# Diez Mil Puntos · Art Bible v1 (2026-10-14)

The Producer set the new art direction on 2026-10-14: **cinematic illustrated scenes drawn 100 % in JavaScript.** The
reference is a 2-minute short whose frames are all made with JavaScript and whose characters are drawn by Claude. We
take its **technique only**. Its content (Tolkien characters, the ring) is third-party IP and never appears in our art,
our prompts or our files.

Our subject doesn't change: everyday systems explained with **real simulations**. What changes is that each simulation
now plays inside an illustrated world. **The art is a skin over a true simulation.** Every car you see is an agent of a
deterministic model (IDM, fixed seed), and the brake light, the gap, the mascot's expression and the sound cue all come
from the same arrays.

Code: `art/lib/` is the reusable kit, `art/scenes/` holds the scenes for each episode, `art/render/` holds the headless
renderer and build scripts. The style frames are in `art/styleframes/` and the animated test is in `art/test/`.

---

## 1 · What makes the look (the six rules)

1. **Flat shapes, painterly depth.** Every form is a flat vector fill. The depth comes from what surrounds the forms:
   layered planes, haze, light and texture. Nothing is shaded like 3D.
2. **Light is the main character of every frame.** A big gradient sky, a sun or moon with a banded halo, god rays or
   light shafts, rim light on every silhouette, and glows (brake lights, fire, lamps). Light is *added* in soft flat
   shapes (screen / lighter blend), never modelled.
3. **Atmospheric perspective.** Each plane further away is mixed toward the haze colour (`fog = 1 − e^(−d/650 m)`) and
   loses contrast. The horizon is the brightest band of the ground.
4. **Texture inside shapes.** An anisotropic brush mottle (horizontal streaks) sits *inside* each painted layer
   (`K.tex.paint`), and film grain sits on top of everything (`K.tex.grain`, re-seeded every 2 frames so it lives without
   boiling).
5. **One mood colour per scene, one idea per shot.** Each scene has its own grade (golden / night / overcast) and each
   shot carries one readable idea: the wave arrives, the mascot reacts, the name lands.
6. **Slow camera.** Push-ins of 3–25 %, crane rises, drifts of ≤ 4 px. One fast element at most (motion blur on the
   foreground when we track a moving car).

## 2 · Shapes

- Hills are fbm silhouettes (`K.terrain.ridge`), with 3–4 ridges per scene, a lit top edge when backlit, and haze at the foot.
- Trees are clusters of circles split into a shadow mass, a lit mass, a rim crescent and a few leaf flecks
  (`K.terrain.tree`: round / poplar / pine). Their size follows perspective.
- Clouds are lumpy banks of stacked capsules (`K.sky.bank`). They have a flat body, a cooler top, and a lit underside
  only where they face a low sun.
- Cars are **tiny open-top bubble cars** (`K.car.rear / front / side / top`). Because they are open, every driver's round
  head is visible from every angle: *a road of cars is a road of dots*, which is the channel's name made literal.
- Corners are always rounded, and there are no hard 1-px lines on objects. The only line work is the character outline
  and fine wires.

## 3 · Characters

**Construction** (`K.char`):
- The head is a true circle of radius R. The brand face construction is kept exactly. Eyes are at x = ±0.32 R,
  y = −0.14 R, r = 0.135 R. The mouth is at y = +0.30 R with stroke 0.144 R and round caps. `look` slides the whole face
  ±0.12 R toward where the character looks.
- Proportions are a big head, a small body and simple hands. A seated driver is a head of 0.34–0.62 m against a 3.3 m
  car (cartoon scale). A standing figure is about 2.2 heads tall (`K.char.torso`).
- **Generic people** have warm skin tones (6), simple hair shapes (short, bob, curly, bun, cap, none) and a thin
  warm-dark outline of 0.07 R (ink line over gouache). They have dot eyes, blush only above 10 px, and **no real person
  is ever portrayed**. Each person is a deterministic `persona(i)`.
- **Expressions (16):** neutral, content, curious, surprised, shocked, worried, delighted, smug, sleepy, dizzy, wink,
  sad, focused, laughing, annoyed, grumpy, plus `blink` on top of any of them. Extras sit outside the head in ink, teal
  or paper and never in vermilion: ticks, sweat, steam puffs, anger mark, sparkles, `!`. See `scenes/lab.js` for the
  sheet.
- Acting is driven by the simulation, not by keyframes. Example from the close-up: the car ahead's brake onset makes
  the mascot surprised (ticks). Its own onset makes it worried (sweat), then focused. Coming to a stop makes it annoyed
  (puffs), and 0.9 s later grumpy (anger mark). The nose dip follows the simulated deceleration, with a spring rebound
  at the stop.

## 4 · The mascot in this world

- **It stays the vermilion dot with a face**: a flat `#E8553A` disc with no outline and the brand face. It is the only
  vermilion character in any frame.
- In the illustrated world it gains only light. It gets a **rim crescent** from the scene's key light and a **flat shade
  crescent** on the far side (`K.char.discLight`). It never gets a gradient blob or a specular highlight.
- **Role:** it is *one of the agents*. In the pilot it drives car 8 of the IDM run, a teal (`#23746C`, the brand second)
  open-top car, so vermilion and teal, the two brand inks, read as "our dot" in a wide shot from 40 m away. When it
  watches (the night frame) it sits on a hill, seen from behind, as a disc with a tiny ink body.
- It is the only character without an outline, which makes it pop against outlined people. It squashes and stretches
  like a rubber stamp and never rotates in 3D.

## 5 · Lighting recipes

| Mood | Sky (top → horizon) | Key | Shadows | Glows | Grade |
|---|---|---|---|---|---|
| **Golden hour** (pilot default) | `#5d6aa3` → `#b48aa8` → `#f0a77f` → `#ffe2a8` | Low sun (elev ≈ 5°) ahead of the camera, so everything is **backlit**: rim `#ffd88f` on top edges, camera-facing sides mixed 32 % toward `#3c2a52` | Long (≈ 8 × height), toward the camera, multiplied violet, α 0.45 | God rays (11, screen, α 0.10), sun wash, dust motes | soft-light `#ff9a5a` 22 %, multiply `#3a2050` 10 %, vignette `#2a1330` |
| **Late afternoon, high angle** (ring) | `#93a9c4` → `#ffe0aa` strip | Sun upper left (elev ≈ 15°), front-lit | Swept footprints, violet α 0.55 on a separate layer (overlaps never double-darken) | Brake glows, shafts | warm-to-cool diagonal soft-light, `#ffb070` 20 % |
| **Night with brake lights** | `#0b1030` → `#463f6e`, stars, faint milky way, moon with a cool wash | Moon rim `#9fb4ff` on silhouettes only | None (moonlit silhouettes) | Tail lights always on at 60 %, brake → 100 % with a big red glow; headlights `#fff1c8`; town lights; bloom 0.45 | soft-light `#3a4aa0` 25 %, vignette `#03040c` 0.55 |
| **Overcast noon** (for explainer beats, not yet drawn) | flat `#c9ced6` → `#e8e6df` | Soft top light, no rim | Short, soft, under objects only (α 0.25) | None | desaturate 15 %, soft-light `#9fb6c8` 12 % |
| **Dusk title** (wordmark) | `#2a2b58` → `#a8657f` → `#ffcb8e` | Sun just under the horizon behind the letters | — | Rays fan up behind the name | soft-light `#ff9a5a` 15 % |

## 6 · Palette per scene, and how the brand survives

- Brand inks keep their roles. Vermilion `#E8553A` is **only the mascot**. Teal `#23746C` is the mascot's car and the
  extras. Ink `#1C2433` is faces, hands and type shadows. Paper `#F3ECDD` is letters, puffs and plates.
- Scene palettes live in `scenes/ep001_world.js` (`E.PAL.golden / night / field`). Generic cars use 10 desaturated
  pastels (`K.car.COLORS`), with no vermilion-like hue (the terracotta was removed for that reason).
- Brake and tail lights are a *light* red (`#ff4a36` with glow), not an ink. They are always a glow, never a flat disc of
  vermilion.
- **Wordmark in the new style** (`K.type`): Martian Mono 800, word spaces 0.55 cell, the dotless ı with **true circle
  tittles**, and the mascot as the dot on the i of "Mil". The letters are cream paper lit by the scene: a soft warm glow
  behind them, a soft low cast shadow, and a thin rim of scene light on their top edge (`K.type.draw`). The plain dot of
  "Diez" is the stepping stone, and it squashes when the mascot lands on it. Periods drawn in titles (thumbnail
  "PUNTO.") are circles too.

## 7 · Texture and finish

- `K.tex.paint(layer)` is a brush mottle (fbm, sx 0.004–0.006, sy 0.02–0.05) masked to the layer's alpha, soft-light at
  35–55 %.
- `K.tex.fillPath` adds fine noise inside dynamic shapes (characters, car bodies) at 22–28 %.
- Grain is overlay at 13 % on 4 seeded 512² tiles, with the offset re-seeded every 2 frames. Bloom (quarter resolution,
  x³ highlight key) is 0.18–0.45. The vignette uses multiply with the scene colour.

## 8 · Camera

- Perspective scenes use `K.persp` + `K.road`: a pinhole camera over the ground plane, with the road defined by distance
  s and lateral offset l. Any metre value from a simulation lands on screen through `road.world(s, l)` →
  `rig.toCam` → `cam.proj`. Ground polygons are clipped at the near plane, so long shadows never pop.
- The tracking crane is non-causal and smoothed (`E.camS`). Free-flowing traffic therefore holds still in frame, and the
  jam visibly travels **backward** toward us.
- Flat scenes use `K.camera2d` keys plus a breathing drift. Side views use tiled parallax layers (0.01 / 0.04 / 0.12 /
  0.35 / 0.85 / 1.0) with box motion blur proportional to speed.
- High angles use an orthographic oblique view (`K.car.top` with elevation ≈ 35°). Sprites can be drawn larger than
  world scale (`k: 1.45`) while their placement stays exact.

## 9 · Never

- **No third-party IP**: no characters, logos, outfits or scenes from the reference or anywhere else. The reference
  teaches technique only.
- No stock, no photos, no AI-generated images, no traced footage.
- No 3D blobs, no glossy gradients on characters, no bevels, no specular highlights on the mascot.
- No real people, and no real brands on cars or signs.
- No fake simulation: if it moves like traffic, an IDM (or the episode's model) moves it. Hand animation is reserved for
  the camera and pure character acting.
- No vermilion on anything but the mascot. Never two mascots, and never a mascot outline.
- No text over the bottom 12 % (progress bar), and no faces under the end-screen area.

## 10 · Kit map (reusable for future worlds)

| File | What it gives you |
|---|---|
| `lib/core.js` | seeded RNG, value noise / fbm, easing, colour mix/tint, canvases, rounded rect / blob paths |
| `lib/texture.js` | grain, brush mottle, in-shape texture |
| `lib/sky.js` | gradient sky, sun with halo rings, cloud banks / streaks / puffs, stars, moon |
| `lib/light.js` | god rays, parallel shafts, glows, haze bands, grade, vignette, bloom |
| `lib/terrain.js` | ridges, trees (3 kinds), grass tufts, poles + wires |
| `lib/character.js` | faces (16 expressions), mascot, people heads, torso, extras |
| `lib/car.js` | open-top cars in 4 views, lamps with glow, personas |
| `lib/world.js` | perspective camera, roads, near-clipped ground polygons, 2D camera, particles |
| `lib/sim.js` | IDM on a closed lane: positions, speeds, brake intensity, onsets (deterministic) |
| `lib/type.js` | wordmark layout with round tittles + mascot slot, lit cream type |
| `lib/stage.js` | scene registry, post chain, renderer contract (`__frame(t)`, `__grab`, `__events`) |

A new world (a supermarket queue, a bus line, a rumour on a city grid) reuses sky, light, terrain, characters, texture,
camera and stage. It only needs its own props and its own model in `sim.js` style: deterministic arrays read by the
scene.

## 11 · Build

```
cd newchannel/art/render
node render.mjs --scene highway_golden --still 5.8 --png out.png      # any scene, any time (several: --still 1,2,3)
./build_stills.sh                                                     # the 4 style frames + thumbnail B (1280x720, 168x94)
TMPD=/tmp/claude-0/art_tmp ./build_test.sh                            # style_test.mp4: 2 Chromium workers -> sound -> H.264
```
Needs node 22, the preinstalled Playwright and Chromium (`/opt/pw-browsers`, never `playwright install`), ffmpeg, and
python3 with numpy (the sound bed imports `engine/sound.py` read-only). Time only ever comes from the renderer
(`t = frame / fps`), so the same inputs give the same pixels.
