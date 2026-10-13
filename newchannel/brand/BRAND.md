# Ten Thousand Dots / Diez Mil Puntos · brand v1 (2026-10-13)

Name chosen by the Producer: **Ten Thousand Dots** (EN, `@tenthousanddots`) / **Diez Mil Puntos** (ES-419,
`@diezmilpuntos`). Tagline EN *"Tiny systems, explained with dots."* · ES-419 *"Pequeños sistemas, explicados con puntos."*
Every image in this folder comes from `src/build_brand.py` (see section 9). Edit the config, re-run, and you get the same
pixels every time.

## 1 · Idea

The channel looks like **a small print run on uncoated paper**: three inks (ink, vermilion, teal) plus paper, halftone for
tone, paper grain, and a faint misregistration where the mascot's face overprints its body. Agents are **flat printed discs**.
There are no gradients, no lighting and no soft 3D blobs (Primer's look is the thing to avoid). One disc in the whole brand
is alive: **the companion**, the only vermilion dot, with a face of two dots and one line.

The core rule, which works in both languages: **the companion is the last dot of the name.**
- EN `Ten Thousand Dots.`: the name has no "i", so the companion is the **full stop**.
- ES `Diez Mil Puntos`: the companion is the **dot on the i of "Mil"**, which is the last dot in the name. The i of "Diez" keeps
  a plain round ink dot, and the companion uses it as a stepping stone in the animation.

Every dot in a wordmark is a true circle. The font's square tittles and periods are swapped for discs.

## 2 · Palette (`palette.json`)

| Token | Hex | Role |
|---|---|---|
| paper | `#F3ECDD` | background of everything (always carries grain) |
| ink | `#1C2433` | type, crowd agents, rules, the companion's face |
| accent | `#E8553A` | **the companion only**: one vermilion dot per frame is the protagonist. Rare highlight otherwise |
| second | `#23746C` | a second group of agents, trails, sparkles, the handle, data highlights |
| paper_shadow | `#E4DAC6` | panels and cards (a flat tint, never a soft drop shadow) |

**Change from the seed:** `second` went from `#2E8C83` to `#23746C`. The old teal had almost exactly the same luminance as the
vermilion (contrast 1.11:1), so the "protagonist vs. other group" split vanished in grayscale and for some colour-blind
viewers. The new teal reaches 1.53:1 against the accent and 4.72:1 on paper, so it can now carry small text such as the
handle. Nothing else changed.

WCAG contrast ratios (generator: `python3 src/build_brand.py --only contrast`):

| on \ fg | paper | ink | accent | second | paper_shadow |
|---|---|---|---|---|---|
| paper | — | 13.23 | 3.08 | 4.72 | 1.18 |
| ink | 13.23 | — | 4.29 | 2.81 | 11.22 |
| accent | 3.08 | 4.29 | — | 1.53 | 2.61 |
| second | 4.72 | 2.81 | 1.53 | — | 4.00 |
| paper_shadow | 1.18 | 11.22 | 2.61 | 4.00 | — |

What follows from the table:
- Text goes in **ink on paper** (13.2:1). Second on paper (4.7:1) is fine for labels and the handle.
- Never set text in accent. Vermilion on paper is 3.08:1, which is enough for a large disc and too low for text.
- The face is ink on accent (4.29:1), so it reads down to 24 px.
- Accent and second must never be the *only* difference between two groups. Also vary size, the face, or the grouping.

Compositing model: inks **multiply** like real overprint (`printfx.composite`). Ink on vermilion goes darker, it does not
cover. Avoid large teal-over-vermilion overlaps, because they turn muddy brown.

## 3 · Typography (all SIL OFL 1.1, files and licences in `fonts/`)

| Use | Font | Settings | Source |
|---|---|---|---|
| Wordmark / display | **Martian Mono** (Evil Martians) | variable: wght 800, wdth 100 (one-line) / 112 (stacked) | https://fonts.google.com/specimen/Martian+Mono · https://github.com/evilmartians/mono |
| Labels, numbers, sim readouts | Martian Mono | wght 500, wdth 100 | same |
| Body, taglines, captions | **Space Grotesk** (Florian Karsten) | variable: wght 500 (700 for headings) | https://fonts.google.com/specimen/Space+Grotesk · https://github.com/floriankarsten/space-grotesk |

Why this pair: a monospace face fits a channel about counting and simulating (every glyph is one cell, like an agent on a
grid). Martian Mono ExtraBold is wide and round, so it stays friendly at the size of a channel name, and it has `ı` (dotless
i), which the wordmark needs. Space Grotesk shares its geometric DNA, reads better in sentences, and covers Spanish (ñ, ¿, ¡,
accents).

Wordmark spacing: monospace advance, but word spaces tightened to 0.55 of a cell. Stacked lockups use a line gap of 0.42 ×
cap height.

## 4 · The companion (mascot)

Construction is in dot units, with R = radius (`src/brandkit/mascot.py`):
- Body: a flat accent disc. **No outline, no shading, no highlight.** Its ink texture comes from the print model only.
- Eyes: two ink dots at x = ±0.32 R, y = −0.14 R, radius 0.135 R. Mouth: one ink line at y = +0.30 R, stroke 0.144 R, round caps.
  The face overprints with a 1 px misregistration at large sizes (the print feel).
- Extras (sweat drop, sparkles, zzz, "?", motion ticks, orbiting dots) sit **outside** the disc, in ink or second. They are
  never in accent, and they are left out below ~120 px.
- Size: in the wordmark, the companion is **1.04 × x-height** as a full stop and **0.80 × x-height** as a tittle. Minimum
  24 px diameter. Below 48 px, use expressions without extras.
- 12 expressions (`mascot_expressions.png`): neutral, curious, surprised, worried, delighted, smug, sleepy, dizzy, wink, sad,
  focused, laughing. Each one is checked at 48 px and 24 px on the sheet.
- Motion: it squashes and stretches (sx/sy) like a rubber stamp, never rotates in 3D, and keeps the bottom on the surface
  when squashed. Its face moves with `look` (±0.12 R) to show where it is looking.
- In simulations, it is the one agent the story follows: the same size or slightly bigger than the crowd, the only vermilion
  dot, and the only one with a face. Crowd agents are ink (and second for a second group), with no faces.

## 5 · Wordmarks and animation

- `wordmark_tenthousanddots.png`, `wordmark_diezmilpuntos.png` (one line), plus `_stacked` lockups. Each has a `_transparent`
  version (ink letters, for light backgrounds).
- `wordmark_storyboard_tenthousanddots.png` / `wordmark_storyboard_diezmilpuntos.png` (frames in
  `wordmark_animation_frames/<slug>/kf01-08.png`). The beats run 2.5 s at 24 fps: drop in (surprised) → bounce on the "T" of
  Thousand / on the i-dot of "Diez" (worried) → hop (delighted) → bounce on "D" / "M" (laughing) → aim (curious) → impact on
  the baseline / on the i stem → small rebound → settle as the logo with a wink. The trail is dotted in second ink. Ticks mark
  the contacts. In ES, the companion lands on the stem and then rebounds up to its floating tittle position.
- Use: at the end of the cold-open hook, the companion lands, then 1 s of silence. At the end card, it can come back
  (sleepy / wink).

## 6 · Icon and banners

- `logo_icon_800.png`: textless. A crowd of ink dots (14 % second) parts around one big companion (curious, 56 % of the
  width). In a circle crop it reads at 98 px, at 48 px, and as a vermilion dot with a face at 24 px
  (`logo_icon_preview.png`, light and dark UI).
- `banner_2560x1440.png` (EN) and `banner_2560x1440_es.png` (ES): a stacked wordmark, a rule, then the tagline and handle,
  centred in the **1546 × 423 safe area**. Around it, a crowd of agents whose size is a halftone of the distance from the
  lockup ("a halftone made of agents"). `banner_safe_preview*.png` shows the TV / desktop / all-devices areas. File size is
  about 2.5 MB, under YouTube's 6 MB limit.

## 7 · Halftone and grain spec (`src/brandkit/printfx.py`)

- **Halftone**: round amplitude-modulated dots, dot area ∝ tone. Angles: ink 15°, second 75°, accent 45° (when ever needed).
  Cell 12 px at 1080p (16 px at 1440p, 8 px for small insets). Use halftone for tone, shadows and backgrounds, **never for
  the companion's body**.
- **Paper grain** (`paper()`): fine tooth ±1.1 %, cloud ±0.5 % (features ~1/6 of the frame), mid mottle ±0.6 % (~18 px),
  horizontal fibres ±0.8 %, rare dark flecks. Grain on paper is always on. For video, regenerate it every 2 frames (seed =
  frame // 2) so it lives without boiling.
- **Ink texture**: coverage × (1 − 0.07 × noise), giving a riso mottle inside solids (0.04 for small or animated frames).
- **Misregistration**: the face layer is offset 1 px (1080p) from the body. Never offset type.
- Contact shadow (if a scene needs one): a flat halftone ellipse in ink at 25 % tone. Never a blur.

## 8 · Do / don't, safe zones

Do: flat discs; one vermilion protagonist per frame; crowds in ink and second; halftone for tone; grain on paper; mono
labels for numbers (`N = 10 000`, `t = 0.42 s`); generous paper.
Don't: soft 3D blobs, glow, gradients, drop shadows, bevels, outlines on the dot, two companions (or two faces) in one
frame, vermilion text, recolouring the companion, stretching the wordmark non-uniformly, setting the wordmark in another font.

Safe zones:
- Wordmark clear space = 1 companion diameter on every side (built into the PNGs).
- Banner: everything that matters inside 1546 × 423, centred.
- Icon: the companion inside the central 60 % (the circle crop takes the corners).
- Video (16:9): titles and labels inside the 90 % action-safe area. The companion's face never sits under the YouTube
  progress bar (bottom 12 %) or the end-screen elements (right 40 % in the last 20 s).
- Shorts (9:16): keep text between 15 % from the top and 25 % from the bottom, and away from the right-hand 15 % (UI buttons).

## 9 · Generator (`src/`)

```
cd newchannel/brand/src
python3 build_brand.py                      # everything (≈ 45 s on 1 CPU)
python3 build_brand.py --only wordmark,icon # steps: expressions, wordmark, storyboard, icon, banner, board, contrast
python3 build_brand.py --config my.json --out /tmp/test   # another name, same system
```

- `brand_config.json`: names (text, stacked lines, `anchor` = `period` or `tittle:N`, handle, tagline, bounce path for the
  storyboard), font files and axes, palette path, seed.
- `brandkit/printfx.py`: paper, inks, multiply compositing, halftone, grain. `brandkit/mascot.py`: the companion (SDF, any
  size, squash and stretch). `brandkit/wordmark.py`: name-agnostic layout with round dots and a companion slot.
  `brandkit/canvas.py`: per-ink canvas.
- Dependencies: Python 3, numpy, Pillow (with FreeType variable-font support). Deterministic (seeded RNG).
- For video, import `brandkit` from the engine. `mascot.render(d, expr, sx, sy, look, ...)` returns per-ink masks, and
  `printfx.composite` prints them.

## 10 · Known limits (v1)

- There is no reversed (light-on-dark) wordmark yet. The brand is paper-first, so on dark scenes put the wordmark on a
  paper panel. A reversed variant takes one palette swap in `Canvas.render`.
- The storyboard is keyframes, not a rendered animation. The motion engine should interpolate the same path
  (`_path` / `_seg_pos` in `build_brand.py`).
- Trademark searches (USPTO / EUIPO / IMPI) for the chosen name are still pending (see `NAME_CHECK.md`).
