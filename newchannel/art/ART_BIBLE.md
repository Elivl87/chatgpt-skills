# Diez Mil Puntos · Art Bible v2 (2026-10-14) · characters v4 (2026-10-15)

> **v5 characters (2026-10-29, design locked):** Eli = skin `#d9a66c` (same as Mila) + wine plaid flannel open over a yellow
> tee + cargo pants + a red baseball cap worn backwards (no logo); Mila = denim jacket over a purple-striped tee + purple
> skirt over leggings. One switch: `lib/canon.js`; the workshop look stays as `eli1_taller` / `mila1_taller`. Signature
> colours: Eli = yellow tee + red cap against the wine flannel; Mila = purple. Spec: `characters/leo_mila/CHARACTERS.md` §0.

> **v4 changes (2026-10-15, characters only; the world style is unchanged):** the channel's characters are **Eli + Mila**
> (Alt 1 «Taller», `characters/leo_mila/CHARACTERS.md`); the dot mascot is **dropped**; vermilion now belongs to the
> wordmark dot / brand accent; a new §3b sets the **emotion rule** for every character; the paper speech balloon is
> added (§3c). Frames: `styleframes/v4/`, comparison `styleframes/v4/compare_v2_v4.jpg`, test `test/style_test_v4.mp4`,
> QC `test/QC_v4.md`.

> **v2 changes** (same day, after the v1 review): painterly lobed clouds, world-anchored ground brushwork, foreground
> framing, full-body characters with poses, mascot ink gestures, rounded top-down cars, night life, an ambient-motion
> rule, a baked wordmark, and the overcast-noon recipe drawn (style frame e, toll plaza). Frames: `styleframes/v2/`,
> comparison `styleframes/v2/compare_v1_v2.jpg`, test `test/style_test_v2.mp4`, QC `test/QC_v2.md`.

The Producer set the new art direction on 2026-10-14: **cinematic illustrated scenes drawn 100 % in JavaScript.** The
reference is a 2-minute short whose frames are all made with JavaScript and whose characters are drawn by Claude. We
take its **technique only**. Its content (Tolkien characters, the ring) is third-party IP and never appears in our art,
our prompts or our files.

Our subject doesn't change: everyday systems explained with **real simulations**. What changes is that each simulation
now plays inside an illustrated world. **The art is a skin over a true simulation.** Every car you see is an agent of a
deterministic model (IDM, fixed seed), and the brake light, the gap, Eli and Mila's expressions and the sound cue all come
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
   shot carries one readable idea: the wave arrives, Eli and Mila react, the name lands.
6. **Slow camera.** Push-ins of 3–25 %, crane rises, drifts of ≤ 4 px. One fast element at most (motion blur on the
   foreground when we track a moving car).

## 2 · Shapes

- Hills are fbm silhouettes (`K.terrain.ridge`), with 3–4 ridges per scene, a lit top edge when backlit, and haze at the foot.
- Trees are clusters of circles split into a shadow mass, a lit mass, a rim crescent and a few leaf flecks
  (`K.terrain.tree`: round / poplar / pine). Their size follows perspective.
- **Clouds (v2)** are painterly lobed cumulus (`K.sky.cloudSprite` + `K.sky.drawClouds`): a back tier of big lobes and a
  front tier along a flat base. The whole mass is filled in shade, the body is the same silhouette pushed toward the
  light, the big lobes get a lit cap, and the sun-facing contour gets a thin rim (silhouette minus itself pushed away from
  the light). Each cloud's light angle points at the scene's sun (`K.sky.angTo`), so near a low sun the bellies glow
  and the tops stay violet; at noon tops are lit and bellies grey (`under`, `contours`). Sprites are baked once and
  **drift** every frame (4-7 px/s, parallax with the camera yaw). The v1 capsule banks (`K.sky.bank`) are retired:
  they read as stripes.
- **Ground brushwork (v2)** is world-anchored, never screen-fixed: `K.terrain.brush` lays short dabs on the ground plane
  in cells (2 m near, 16 m far), oriented across the terrain and foreshortened by the camera, so they travel with the
  camera. Fields also get 1-3 local colour patches each (warm / darker blobs), plus wildflower dots, meadow tufts and a
  fence along the verge near the camera. The close-up uses scrolling tiles at the right parallax (verge with tufts and
  flowers, a worn-asphalt tile scrolling with the road).
- **Foreground framing (v2)**: every wide frame has 1-2 out-of-focus framing elements at the edges (a leafy branch
  hanging in from a top corner, reeds / tall grass in a bottom corner, a bush), drawn from blurred sprites
  (`K.terrain.branchSprite`, `K.terrain.reedSprite`) and swayed (`drawSway`, `drawWind`). They never cover the subject or
  the progress-bar band.
- Cars are **tiny open-top bubble cars** (`K.car.rear / front / side / top`). The v2 top view is a bean-shaped footprint
  with one smooth side wall, a domed top with a sun-side highlight and rim, a cockpit hollow, a curved windshield,
  headlights, wheels peeking out, a soft contact shadow, and tail lamps that glow and spill red on the ground. Because they are open, every driver's round
  head is visible from every angle: *a road of cars is a road of dots*, which is the channel's name made literal.
- Corners are always rounded, and there are no hard 1-px lines on objects. The only line work is the character outline
  and fine wires.

## 3 · Characters

**The protagonists (v4): Eli + Mila.** Eli (0.95 units, short wide capsule head, yellow beanie, white tee, brown apron,
jeans, black boots, dark brown skin, big grin) is the loud, impatient gap-closer; Mila (1.08 units, tall capsule head,
tan skin, sleepy lids, high ponytail with a mustard tie, purple sweater, mustard overalls, green boots, small gold drop
earrings) is the calm, curious, patient one. Capsule heads keep them apart from the round-headed extras; yellow / purple
read apart at phone size in every palette. Full spec, API, colours and QC: `characters/leo_mila/CHARACTERS.md`; sheets
`model_sheet.png`, `emotion_sheet.png`. Engine: `lib/cast.js` (layers, scene light, soft IK arms, mitten hands with a
thumb, walk cycle, back views, sitting, props) + `lib/cast_alts.js` (the specs, ids `eli1`, `mila1`). Light on the cast
(detail pass 2026-10-15): the rim is a thin light edge just inside the ink line (<= 0.75x the ink width), on the side
facing the light only, computed once on the whole silhouette (never on internal edges); the shade crescent is capped
(<= 0.028 units); eyes are masked from shade, rim and grain. Every delivery runs the **Detail QC checklist** in
`CHARACTERS.md` §6 (close-ups: `scenes/detail_lab.js`).

**Generic people (the extras)** keep the construction below.

**Construction** (`K.char`):
- The head is a true circle of radius R. The brand face construction is kept exactly. Eyes are at x = ±0.32 R,
  y = −0.14 R, r = 0.135 R. The mouth is at y = +0.30 R with stroke 0.144 R and round caps. `look` slides the whole face
  ±0.12 R toward where the character looks.
- **Full body (v2, `K.char.person`)**: about 2.6 heads tall. A big round head, a small bell-shaped body, short legs with
  round shoes, noodle arms (two segments, round caps) with round hands, all with the ink line. Ten poses: stand, point,
  shrug, wave, clipboard (with a pencil that wiggles), sit, walk, hips, cheer, think. Every pose breathes and bobs
  (`t`), the wave and walk cycle, so no figure is ever frozen. Props: clipboard, safety vest (lime `#d8e04a` with a
  reflective band; never orange-red, which would compete with the brand vermilion). Shading is one flat shade on the side away
  from the light plus an optional rim. Acting is driven by the sim (ring observers point / shrug when a car stops; toll
  attendants hand the ticket while a car is served and wave it off when the barrier opens).
- Proportions are a big head, a small body and simple hands. A seated driver is a head of 0.34–0.62 m against a 3.3 m
  car (cartoon scale). A standing figure is about 2.2 heads tall (`K.char.torso`).
- **Generic people** have warm skin tones (6), simple hair shapes (short, bob, curly, bun, cap, none) and a thin
  warm-dark outline of 0.07 R (ink line over gouache). They have dot eyes, blush only above 10 px, and **no real person
  is ever portrayed**. Each person is a deterministic `persona(i)`.
- **Expressions (16):** neutral, content, curious, surprised, shocked, worried, delighted, smug, sleepy, dizzy, wink,
  sad, focused, laughing, annoyed, grumpy, plus `blink` on top of any of them. Extras sit outside the head in ink, teal
  or paper and never in vermilion: ticks, sweat, steam puffs, anger mark, sparkles, `!`. See `scenes/lab.js` for the
  sheet.
- Acting is driven by the simulation, not by keyframes. Example from the close-up (v2 wording; v4 does the same with Eli
  and Mila: surprised -> worried -> set jaw while tailgating -> annoyed shrug at the stop -> furious «¡¿Quién fue?!»,
  while Mila turns round to look back): the car ahead's brake onset made
  the mascot surprised (ticks). Its own onset makes it worried (sweat), then focused. Coming to a stop makes it annoyed
  (puffs), and 0.9 s later grumpy (anger mark). The nose dip follows the simulated deceleration, with a spring rebound
  at the stop.

## 3b · Emotions (Producer's standing rule, 2026-10-15)

"Always keep improving details; every character in this universe must express emotions well, in profile, front and
3/4, happy, angry, everything." So:

- **Every character, every view.** Eli, Mila and the extras share one 13-emotion vocabulary (neutral, happy, laugh,
  surprised, curious, awe, sly, thinking, worried, sheepish, annoyed, furious/yelling, determined) and each one must read
  in front, 3/4 and profile (and from the back through body language). `characters/leo_mila/emotion_sheet.png` is the
  test: every cell must read at phone size.
- **Four layers, strongest first:** brows + lids (the eye shape), mouth, head (tilt, squash/stretch, lean), body
  (shoulders, arms, posture). Secondary cues (sweat, anger mark, steam puffs, sparkles, ticks) at most two at a time,
  never vermilion.
- **Profile is not a downgrade:** one eye drawn 25 % bigger, one brow, the mouth on the face edge (open = a wedge with
  teeth, closed = a curl), the extras get a nose bump. When a beat must land, turn the body toward the camera.
- **Acting comes from the simulation** (brake onsets, stop, gap, speed), poses cross-fade, big moves get anticipation.

## 3c · Text boxes (the characters are silent) — v2, 2026-10-16

Producer (2026-10-16): «no quiero que tengan voces los personajes (solo en cuadro de texto que estén más acorde al
arte)». Eli and Mila never speak aloud: every line they have is a **text box** drawn as part of the illustrated world
(`art/lib/textbox.js`, `K.tbox`; lab `art/scenes/textbox_lab.js`; style sheet `art/textboxes/textbox_sheet_small.jpg`).
The old generic comic pill (Space Grotesk on a flat cream capsule) is retired.

**Look**
- **Paper, cut by hand:** warm paper (`#f8eedb` golden, `#e7e2d8` cooler and dimmer at night, `#f6f2ea` at noon), a
  wobbly edge seeded by the text (never boils frame to frame), paper tooth + horizontal fibres in soft-light, a warm
  glow from the light side, an inner thickness shade on the shadow side.
- **Ink brush outline:** a variable-width ring (≈ 0.09 × the letter size; 0.12 for shouts) that breathes along the edge
  with 3 dry-brush breaks; a thin rim of scene light just inside the lit top edge (not at noon).
- **Tail = the same brush stroke:** a curved flick tapering to a point, aimed at the speaker's head and **stopping
  outside the head zone** (±1.15 r wide, 1.75 r up, 1.2 r down, + 8 px): it never crosses the beanie, ponytail, eyes or
  mouth. No tail if the box already touches that zone.
- **Shadow:** the box silhouette blurred 6 px, offset away from the light, in the scene's shadow colour (golden
  `#3a2050` α .32, night `#03040c` α .5, noon `#4a5068` α .24 straight down, dusk `#2a1838`).
- **Lettering:** **Shantell Sans** (SIL OFL 1.1, `brand/fonts/ShantellSans/`, static instances made with fontTools):
  *Speech* (wght 600, informal 60, bounce 35), *Shout* (800 / 100 / 90), *Soft* (450 / 45 / 20). A hand-lettered comic
  face fits the painted world better than the brand's techy faces (Martian Mono / Space Grotesk stay for the wordmark,
  labels and data). Ink colour, centred, wrapped at 620 px (shout 820 px).

**Variants (`kind`)**
| kind | when | size @1080p | edge | motion |
|---|---|---|---|---|
| `speech` | normal lines | 50 px | hand-cut rounded card | pop-in 0.2 s: scale 0.7 → 1 with a small overshoot + a 2° settle; out: fade + 0.92 in 0.16 s |
| `shout` | «¡¿QUIÉN FUE?!», «¡NOOO!», «¡DALE, DALE!», «¡¿QUE YO QUÉ?!» | 70 px, CAPITALS, words slightly rotated | jagged but painterly: broad brushy swells rising to soft points (no razor spikes) | same pop + a small shake (±3 px, decays over 0.5 s to a light tremble) |
| `whisper` | asides («¿…quién fue?», «…Fue el viento.») | 40 px, Soft | dotted ink, paper 90 % opaque | slow fade-in 0.28 s, no overshoot |
| `thought` | thoughts / imagined lines | 44 px, Soft | lobed cloud; three small inked dots toward the thinker instead of a tail | gentle float (±3 px) |

**Rules**
- **Reading time:** a box stays up for `max(slot, 0.4 s + 0.06 s × characters)` (`K.tbox.readTime`), from 0.06 s before
  the slot starts; the slot is the line's span in `audio/timings_es.json` (the voice agent removes the character audio
  but keeps the slots).
- **Placement** (`K.tbox.place`): beside the speaker's head on the open side (toward the frame centre), inside a 48 px
  margin, never in the bottom 12 % (progress-bar band) or the duration-chip corner (top-right 300 × 100), never over any
  head zone (both characters) or the shot's label pill; a shot may add `sayAvoid` rects (important action) or a
  per-line `say` override. Off-screen speaker: the box sits upper-left with no tail.
- **Readable on a phone:** ≥ 40 px letters at 1080p (≥ 3.7 % of the frame height), ink on paper contrast > 12:1.
- **Automatic in the animatic:** `A.drawLines` (ep/001/animatic/anim.js) draws every Eli / Mila line from the word
  timings; style per line in `A.LINES`; the kit reports where each head was drawn (or a shot pins it with `A.speaker`).
- Sound-effect callouts («pío», «¡pop!», «tap») are not character lines and keep their own style; illustrated thought
  clouds holding drawings use the same paper + brush panel (`K.tbox.panel`).

## 4 · The mascot (dropped, 2026-10-15)

The vermilion dot mascot is **dropped** (Producer: "No me gusta nuestra mascota"). Its rules are kept in git history
(v2 of this file) for reference only. What survives of it: the **brand dot** itself, a flat vermilion `#E8553A` disc
with no face and no outline, which lives only as the dot of the «i» of «Mil» in the wordmark (in the end sting Mila
flicks it into place) and as the brand accent in graphics. The pilot's teal car (`#23746C`) is now Eli and Mila's car.

## 5 · Lighting recipes

| Mood | Sky (top → horizon) | Key | Shadows | Glows | Grade |
|---|---|---|---|---|---|
| **Golden hour** (pilot default) | `#5d6aa3` → `#b48aa8` → `#f0a77f` → `#ffe2a8` | Low sun (elev ≈ 5°) ahead of the camera, so everything is **backlit**: rim `#ffd88f` on top edges, camera-facing sides mixed 32 % toward `#3c2a52` | Long (≈ 8 × height), toward the camera, multiplied violet, α 0.45 | God rays (11, screen, α 0.10), sun wash, dust motes | soft-light `#ff9a5a` 22 %, multiply `#3a2050` 10 %, vignette `#2a1330` |
| **Late afternoon, high angle** (ring) | `#93a9c4` → `#ffe0aa` strip | Sun upper left (elev ≈ 15°), front-lit | Swept footprints, violet α 0.55 on a separate layer (overlaps never double-darken) | Brake glows, shafts | warm-to-cool diagonal soft-light, `#ffb070` 20 % |
| **Night with brake lights** | `#0b1030` → `#463f6e`, stars, faint milky way, moon with a cool wash, moon-rimmed clouds | Moon rim `#9fb4ff` on silhouettes only | None (moonlit silhouettes) | Tail lights always on at 60 %, brake → 100 % with a big red glow; headlight cones on the asphalt; wet-road reflection streaks under every lamp; town clusters with halos and a blinking mast; a lit farmhouse (windows, porch lamp, TV flicker, chimney smoke); fireflies; bloom 0.45 | soft-light `#3a4aa0` 25 %, vignette `#03040c` 0.55 |
| **Overcast noon** (explainer beats; drawn in v2 as frame e, `scenes/toll_plaza.js`) | flat `#b9c2cf` → `#d3d7dc` → `#e8e6df`, grey stratocumulus with lit tops | Soft top light, no rim | Short, soft radial pools under objects only (α 0.22-0.3) | Lane signals only (green), brake lights small (glow ×2.2) | `saturation` grey 15 %, soft-light `#9fb6c8` 12 % |
| **Dusk title** (wordmark) | `#2a2b58` → `#a8657f` → `#ffcb8e` | Sun just under the horizon behind the letters | — | Rays fan up behind the name | soft-light `#ff9a5a` 15 % |

## 6 · Palette per scene, and how the brand survives

- Brand inks keep their roles. Vermilion `#E8553A` is **only the wordmark dot / brand accent** (v4; it used to be the
  mascot). Teal `#23746C` is Eli and Mila's car and the extras. Ink `#1C2433` is faces, hands and type shadows. Paper `#F3ECDD` is letters, puffs and plates.
- Scene palettes live in `scenes/ep001_world.js` (`E.PAL.golden / night / field`). Generic cars use 10 desaturated
  pastels (`K.car.COLORS`), with no vermilion-like hue (the terracotta was removed for that reason).
- Brake and tail lights are a *light* red (`#ff4a36` with glow), not an ink. They are always a glow, never a flat disc of
  vermilion.
- **Wordmark in the new style** (`K.type`; v2: the lit glyphs are baked once into sprites with `K.type.bake` and blitted
  with `K.type.drawBaked`, about 4x cheaper per frame than v1; the dusk sky behind the letters is kept deep violet,
  measured ≥ 3.5:1 against the cream letters, and a soft violet pool sits behind the tagline): Martian Mono 800, word spaces 0.55 cell, the dotless ı with **true circle
  tittles**, and the brand dot as the dot on the i of "Mil" (v4: Mila flicks it in; it bonks Eli's beanie and lands). The letters are cream paper lit by the scene: a soft warm glow
  behind them, a soft low cast shadow, and a thin rim of scene light on their top edge (`K.type.draw`). The plain dot of
  "Diez" is a plain round tittle. Periods drawn in titles (thumbnail
  "PUNTO.") are circles too.

## 7 · Texture and finish

- v2: the screen-space ground mottle is gone. Large ground areas get world-anchored brush dabs (§2); cached layers
  (ridges, sky, tiles) keep the mottle because they move as one plane.
- `K.tex.paint(layer)` is a brush mottle (fbm, sx 0.004–0.006, sy 0.02–0.05) masked to the layer's alpha, soft-light at
  35–55 %.
- `K.tex.fillPath` adds fine noise inside dynamic shapes (characters, car bodies) at 22–28 %.
- Grain is overlay at 13 % on 4 seeded 512² tiles, with the offset re-seeded every 2 frames. Bloom (quarter resolution,
  x³ highlight key) is 0.18–0.45. The vignette uses multiply with the scene colour.

## 7b · Ambient motion (v2 rule: no frame is ever static)

Every shot carries at least four of these, all pure functions of `t` (deterministic):
cloud drift (sprites, 4-7 px/s); tree sway (`K.terrain.tree({ sway })`, a skew about the trunk base, per-tree phase);
grass and reed wind (`tuft({ wind })`, `drawWind`); framing branch sway (`drawSway`); dust motes and bokeh
(`K.particles.motes`); heat shimmer over the far road at golden hour (`K.light.shimmer`, rows slid by a travelling
sine); birds (and their shadows on the ring field); drifting cloud shadows over the high-angle field; chimney smoke,
TV flicker, twinkling town lights and fireflies at night; a windsock and a walking worker at the toll plaza; breathing,
bobbing characters. A held shot with nothing moving is a bug.

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
- No 3D blobs, no glossy gradients on characters, no bevels, no specular highlights on characters.
- No real people, and no real brands on cars or signs.
- No fake simulation: if it moves like traffic, an IDM (or the episode's model) moves it. Hand animation is reserved for
  the camera and pure character acting.
- No vermilion on anything but the wordmark dot / brand accent; no mascot (dropped).
- No round heads on the protagonists; never change Eli and Mila's silhouettes, colours or wardrobe without the Producer.
- No blank face in a story beat: every character emotes, in every view (§3b).
- No text over the bottom 12 % (progress bar), and no faces under the end-screen area.
- Any shot that plays the sim faster than real time says so on screen: the "ACELERADO ×2" pill (`K.light.speedLabel`,
  Martian Mono 700, paper on a 62 % ink pill with a round dot, top-left safe area).

## 10 · Kit map (reusable for future worlds)

| File | What it gives you |
|---|---|
| `lib/core.js` | seeded RNG, value noise / fbm, easing, colour mix/tint, canvases, rounded rect / blob paths |
| `lib/texture.js` | grain, brush mottle, in-shape texture |
| `lib/sky.js` | gradient sky, sun with halo rings, cloud banks / streaks / puffs, stars, moon |
| `lib/light.js` | god rays, parallel shafts, glows, haze bands, grade, vignette, bloom |
| `lib/terrain.js` | ridges, trees (3 kinds), grass tufts, poles + wires |
| `lib/character.js` | faces (16 + v4 emotion set, front / 3/4 / profile), people heads, torso, extras with body language (`EMO_POSE`) |
| `lib/cast.js`, `lib/cast_alts.js` | v4: Eli + Mila engine and specs (see `characters/leo_mila/CHARACTERS.md`) |
| `lib/car.js` | open-top cars in 4 views, lamps with glow, personas |
| `lib/world.js` | perspective camera, roads, near-clipped ground polygons, 2D camera, particles |
| `lib/sim.js` | IDM on a closed lane: positions, speeds, brake intensity, onsets (deterministic) |
| `lib/type.js` | wordmark layout with round tittles + the brand-dot slot, lit cream type |
| `lib/stage.js` | scene registry, post chain, renderer contract (`__frame(t)`, `__grab`, `__events`) |
| v2 additions | `sky.cloudSprite / drawClouds / angTo`, `terrain.brush / branchSprite / reedSprite / drawSway / drawWind / house / fireflies`, tree `sway`, `char.person` + `POSES`, `char.mascotArms / mascotLegs`, new `car.top`, `light.shimmer / speedLabel`, `type.bake / drawBaked`, `sim.queue` (IDM queue at a booth with seeded service times). Parts sheet: `scenes/lab2.js` (`?part=clouds|people|cars`) |

A new world (a supermarket queue, a bus line, a rumour on a city grid) reuses sky, light, terrain, characters, texture,
camera and stage. It only needs its own props and its own model in `sim.js` style: deterministic arrays read by the
scene.

## 11 · Build

```
cd newchannel/art/render
node render.mjs --scene highway_golden --still 5.8 --png out.png      # any scene, any time (several: --still 1,2,3)
./build_stills.sh                                                     # v2: the 5 style frames (a-e) + thumbnail B + compare_v1_v2.jpg -> styleframes/v2/
TMPD=/tmp/claude-0/art_tmp ./build_test.sh                            # style_test_v2.mp4: 2 Chromium workers -> sound -> H.264
./build_stills_v4.sh                                                  # v4: frames a-e (Eli + Mila), compare_v2_v4, model + emotion sheets, small JPGs
TMPD=<tmp> ./build_test_v4.sh                                         # style_test_v4.mp4 (19.6 s)
```
Needs node 22, the preinstalled Playwright and Chromium (`/opt/pw-browsers`, never `playwright install`), ffmpeg, and
python3 with numpy (the sound bed imports `engine/sound.py` read-only). Time only ever comes from the renderer
(`t = frame / fps`), so the same inputs give the same pixels.
