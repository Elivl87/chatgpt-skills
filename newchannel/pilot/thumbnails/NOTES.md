# Pilot thumbnails · "Why do buses come in threes?" · v1 (2026-10-13)

Files: `thumb_{1,2,3}_{en,es}.png` (1280x720, about 1.1 MB each) and `preview_sheet.png` (all six at 50 %, plus each one at
168x94 in a light feed and a dark `#0F0F0F` feed, with grey bars standing in for the title and a generic duration chip).
Generator: `python3 src/thumbs.py`. It is deterministic (two runs give identical md5s), uses numpy and Pillow only, and
imports `brand/src/brandkit` for the paper, grain, multiply inks, halftone and the mascot SDF. One run takes about 35 s.

## What each one says

| # | EN / ES | Scene | Mascot |
|---|---|---|---|
| 1 | **1 SECOND APART** / **A 1 SEGUNDO** | Three ink capsule buses nose to tail on a rising diagonal. The companion is buried up to the chin in a heap of waiting dots in the foreground. | "peek": one eye open, deadpan (see below) |
| 2 | **THEN THREE** / **Y LUEGO TRES** | The companion stands alone at a stop whose pole is topped by a clock. Between it and the buses is a stretch of empty road. Then three buses cascade in from the right edge. | surprised (with ticks) |
| 3 | **JUST WAIT.** / **ESPERA.** | One big bus is parked with its door open and a late rider (a teal dot) stepping in. The companion stands in front holding up a "hold" paddle (a pause sign, so no text). Small faint halftone buses pull apart in the back. | smug |

The 1-3 words never repeat any of the three titles. "1 second" is the real shortest gap from the script (beat 18, FACTS).
All text is set in Martian Mono wght 800 / wdth 100, ink on paper, with word spaces tightened to 0.55 cell (the brand rule).
Vermilion appears only on the companion. Buses are generic rounded capsules in ink: no lettering, logos or route numbers.

## Pick for Test & Compare

- **A (lead): 2 · THEN THREE.** It tells the whole hook without the title: nothing, then everything. At 168x94 it reads in
  under a second: a face on the left, a stack of buses on the right, empty space between them. It has the strongest emotion
  (the surprised face) and the clearest single subject (the clump).
- **B: 1 · 1 SECOND APART.** It is the most specific and surprising claim, a number that makes you doubt it. It has the
  most ink mass, so it pops on the white feed. It is the most crowded of the three.
- **C: 3 · JUST WAIT.** The contrarian one. It pays off beat 25, and the smug face is the most "character" of the set. It
  works best with title 3 ("The Bus That Waits Gets You Home Sooner"), but its text does not say why buses bunch, so I
  expect it to win fewer clicks from search.

Pair each with title 1 (the exact search phrase). Thumbnail 3 is the only one that also fits title 3.

## Weaknesses / to watch

- **Shared layout.** All three put the text top left and the subject bottom right. That is consistent for a test, but it
  looks templated next to each other. Someone could try a dark (ink-ground) variant of #2 for contrast on the dark feed.
- **White feed.** Paper `#F3ECDD` on a white feed separates only through the ink mass. #1 holds up best; #3 has the most
  paper.
- **Background buses in #3.** The halftone buses that pull apart turn into a grey smudge at 168x94. They still read as
  "faint stuff", but not as "pulling apart". The paddle is not visibly held, because the companion has no arms by brand.
- **Expression.** "peek" (one eye open, deadpan) is not one of the 12 brand expressions. It is built from the same
  primitives (a sleepy eye, an open eye and the neutral mouth), and it is registered on top of `brandkit.mascot.expression`
  in `src/thumbs.py`. The brand agent should add it to the sheet, or swap it for `sleepy` or `neutral`.
- **Duration chip.** In #1 the chip covers part of the dot heap, but not the face. In #3 it covers the rear of the bus.
- **Clock.** The clock in #2 reads 7:45 (a nod to the 19:45 gap). It is decoration and is not legible at small sizes.
- **Mascot size.** At 168x94 the faces are 28-30 px across, which is above the 14 px minimum. In #2 and #3 they are still
  smaller than an ideal "face thumbnail" would be. If CTR is low, try a crop with the companion at about 35 % of the
  height.
