# EP001 thumbnails v2 · "Phantom traffic jams" (2026-10-13)

Files: `thumb_{A,B,C}_{en,es}.png` (1280x720, 0.75-1.2 MB each) and `preview_sheet.png` (all six at 50 %, and each at
168x94 in a white feed and a dark `#0F0F0F` feed, with grey bars as fake titles and an `11:42` duration chip).
Generator: `python3 src/thumbs.py` (`--only A|B|C`). numpy + Pillow only, deterministic (two runs give identical md5s),
about 40 s on one core. It imports `brand/src/brandkit` for paper, grain, ink texture, halftone and the companion SDF.

## Lessons from the rejected bus set

The bus set failed because it was a template: text top left and subject bottom right every time, flat cream paper that
melts into a white feed, a small mascot and clip-art buses. These three share only the inks:

| | A · WHO DID THIS? | B · BE THIS DOT. | C · BACKWARDS?! |
|---|---|---|---|
| Ground | paper sky + mid-grey halftone road | **full-bleed ink** | paper infield inside a solid ink track, halftone corners |
| Value | light top, mid bottom, darkest mass in the cars | dark, with cream and one vermilion | a black ring frames a light centre |
| Layout | face on the left, words top right, perspective diagonal | words in a column on the left, arc on the right | centred and symmetric, words inside |
| Companion | **530 px tall (74 % of height)**, squashed, annoyed | 290 px, calm and confident, alone | 196 px, surprised, inside the jam |
| Tone | comic outrage | quiet, heroic | graphic poster, "wait, what?" |
| Cars | upright ink discs receding to a vanishing point | cream discs that flatten into ovals in the jam | paper capsules on the road, chevrons show the flow |

## What each one says

- **A · "WHO DID THIS?" / "¿QUIÉN FUE?"**: the companion is crushed sideways (sx 0.85, sy 1.07) between a huge cropped
  car behind it and the car in front. Behind that car, a queue of discs recedes to a vanishing point. It wears an
  annoyed face, with pressure ticks at both contacts and steam ticks above. Words sit in the sky. It pays off beat 12
  (the driver who caused it is long gone). At 168x94 it is the most immediate of the three: a face and a queue.
- **B · "BE THIS DOT." / "SÉ ESTE PUNTO."**: dark ground. The left arc of the ring runs in cream (a halftone road with
  hairline kerbs). Below the companion (ahead of it, since the flow runs down the left side), the cars bunch and flatten
  into a jam. Above it, cars run free. The vermilion companion is the only colour, with a clean gap in front of it. The
  full stop is a true disc, echoing the wordmark. This is the thesis in one image, and it is the inverse of every cream
  thumbnail.
- **C · "BACKWARDS?!" / "¡AL REVÉS!"**: a stadium track seen from above fills the frame. The cars flow counter-clockwise
  (chevrons) and pack together at about 1 o'clock around the surprised companion. A thick teal arrow starts under the
  jam and runs clockwise around the right-hand curve, against the cars. The words fill the infield. I used a stadium
  rather than a circle on purpose: a circle that touches the top and bottom edges leaves only about 440 px inside for
  the words, and the stadium roughly doubles the type size.

Vermilion appears only on the companion. Teal appears only on C's arrow. No brands, no lettering on the cars. No
thumbnail word repeats a title.

## Test & Compare order

1. **B (lead)** · the script's pick, and I agree. It is the channel's thesis, and it is the most distinctive tile in
   both feeds: a dark block with one orange face. It pairs best with title 2 ("...One Patient Driver Can Erase Them").
2. **A** · the strongest emotion and the biggest face. It will probably pull the most raw curiosity, and it pairs with
   title 1 or 3. If B's CTR is low, A is the safest swap.
3. **C** · the most "diagram" of the three. It sells the surprise (the wave moves backwards) to viewers who already know
   the phenomenon, so it fits search traffic on "phantom traffic jam circle".

## Weaknesses (honest)

- **"annoyed" and "calm" are new expressions**, not part of the brand's 12. They are built from brand primitives and
  registered on top of `brandkit.mascot.expression` in `src/thumbs.py`. The brand agent should add them to the sheet or
  swap them (`focused` / `wink` are the nearest).
- **Paper halos.** Every object has a 5-9 px paper (or ink) trap. It reads as a print sticker, but on A it comes close to
  an outline around the companion, which the brand forbids. It is there to separate vermilion from the ink cars.
- **A's queue** is a row of identical discs. It reads as "stuck dots", but not explicitly as "cars". The vanishing point
  sits under the words, so the right side is busy at full size (fine at 168x94).
- **B's ring is only partly visible.** At 168x94 the arc reads as "a road with dots", and the jam (bottom right) is small.
  The idea rests on the word plus the lone face, so B needs the title to explain the ring. At 168x94 the face is about 38 px.
- **C's companion is small** (about 26 px at 168x94) and touches the top edge. The words dominate. "BACK / WARDS?!"
  splits one word across two lines. In ES, monospace leaves a wide gap after "¡".
- **Duration chip:** clear of every face and every word. It covers grey road in A, the bottom of the jam in B, and the
  track in C.
- The `?` and `!` keep the font's square dots. Only full stops are swapped for discs.
