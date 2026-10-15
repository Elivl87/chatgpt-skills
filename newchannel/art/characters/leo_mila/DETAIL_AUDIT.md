# Eli + Mila · detail audit (2026-10-15)

Producer: «los detalles son raros, de la ropa o de ellos. Ese tipo de cosas toca cuidar. La de va hacia atrás me
gustaba pero sus ojos de sorpresa estaban mal diseñados». Thumbnail A stays the locked choice; everything below is a
quality fix inside the approved Alt 1 «Taller» design (same silhouettes, colours, proportions, wardrobe, emotion API).

Evidence: `audit_crops_small.jpg` (numbered crops of the **before** state; the numbers match this list).
Result: `detail_before_after_small.jpg` (C, A, B, Eli's three views, hands, Eli's wardrobe, Mila's wardrobe, rim
light, before / after). Close-up QC scene: `art/scenes/detail_lab.js`
(`?scene=detail_lab&part=faces|hands|clothes|rim&W=2400&H=1350`).

**30 issues found, 30 fixed.** Root causes in code are named so they don't come back.

## Eyes and faces

| # | What was odd | Cause | Fix (file) |
|---|---|---|---|
| 1 | C: a grey slab over half of every eye white, so the surprise read sleepy or dead | the shade crescent had no cap (`shadeW·u` = 148 px in C) and was applied to the eyes too | shade capped at `shadeMax` 0.028 units; eyes masked out of shade, rim and grain (`cast.js` `lightLayer`, `eyeMask`) |
| 2 | Awe: the "sparkle" was 0.75× the pupil, so only a dark crescent showed and it read as a closing lid | catchlight radius 0.75·pupil | catchlight 0.3× (default) / 0.36× (surprise) / 0.4× + a 0.17× second sparkle (awe), always inside the pupil (`drawEye`) |
| 3 | Pupils pushed to the edge of the eye and cut by the outline (look `[0.9, …]`) | the look offset was never clamped | the pupil (or iris) is clamped inside the white with a margin; wide emotions scale the look by 0.55 (`lookK`) |
| 4 | Surprise: pinpoint pupils (0.55×) drifting apart | tiny pupil + Eli's "goofy" drift kept in surprise | surprise pupil 0.82× and centred a touch up; `agree: 1` cancels the goofy drift in surprise and awe (`EXPR`) |
| 5 | Lids looked like spectacles (B Mila, smug, happy, annoyed): a full ring stayed over the lid skin | the full eye ellipse was stroked after the lids | the white, pupil and outline are drawn only inside the open region between the lid lines; lids are the face itself (no skin patch, no ring, no bleed) |
| 6 | In 3/4 (and front surprise) the near eye popped half out of the face | face shift + 1.24× eye, no limit | eyes may pop at most 0.22× the eye radius past the head edge (0.5× in profile, deliberate googly style); otherwise they are pulled in and may touch each other (`C.face`) |
| 7 | C: the beanie and the far side of the face split into half yellow / half dark blocks | same uncapped shade as #1 | shade cap (see #1); the crescent now follows the edge as a narrow band |
| 8 | Eli's brows rode up onto the beanie cuff (surprise, awe, caught), reading as a black stripe on the hat | brows are drawn over the hat and the cuff sits right above the eyes | the beanie **pops up** with the brows (`H.browTop`, lift <= 0.034): brows always stay on the skin, and the hat-pop sells the surprise (`cast_alts.js` `beanie`) |
| 9 | A: the yell ran below the collar, so the lower teeth and tongue were hidden under the torso | mouth depth ignored the neckline | the shout is lifted to sit just under the nose and its depth is capped to the room above the collar (`H.chin`); both rows of teeth and the tongue always show (`drawMouth` yell, `openMouth`) |
| 10 | Profile «o» / awe mouth was a notch cut into the face outline | ellipse centred on the face edge | the «o» sits just inside the edge, with a tongue for awe (`profileMouth`) |
| 11 | Worried mouth was a zigzag scribble | `lineTo` zigzag | a smooth four-hump wave (`drawMouth` wobble) |

## Hands

| # | What was odd | Fix (`cast.js` `hand`) |
|---|---|---|
| 12 | Fist = a ball with an arc (A) | soft block with knuckles at the front, two short creases, thumb wrapped across |
| 13 | Pointing hand = a ball with a stub (B) | curled fingers + a straight index + the thumb tucked on it |
| 14 | Relaxed / open / palm hands = blobs | relaxed mitten with a thumb along the front; open hand with three short fanned fingers and a thumb |
| 15 | Clasped hands = two balls (B Eli, C Mila, awe, worried) | two real fists overlapping (creases + thumbs) |
| 16 | Grip on the wheel / knee / board (`mitt`) fell back to a plain circle | a grip: the fist shape with one crease and the thumb over the fingers |
| — | (size) the new hands were first as wide as the forearm and read as stumps | the whole hand set is drawn at 1.45× `arm.hand` (about 1.5× the forearm), consistent for both characters |

## Clothing

| # | What was odd | Fix |
|---|---|---|
| 17 | Eli: the apron neck cord was two thin dark lines that poked out of the silhouette as stubs in 3/4 and profile | one flat strap per side (apron-dark band with ink edges) from the bib corner over the collar to the back of the neck, clipped to the torso (`apron`) |
| 18 | Eli: the collar crescent was drawn on top of the cords and was nearly as wide as the shoulders (the "rope across the neck") | the neckline is drawn **before** the apron / straps (`biped` draw order: outfit, collar, outfitTop); the crew collar is a narrow rib band that hugs the neck, ink only on its lower edge, clipped to the torso (`crewCollar`) |
| 19 | Eli: the tee sleeves ballooned into round sausages with shoulder lumps (worst with the arm up) | sleeve width 0.066 → 0.058; one tube from the round shoulder, slightly flared, cut square at the hem with a hem line (`drawArm`) |
| 20 | Eli: the apron waist band poked past the torso with a halo | band exactly the torso width (`apron`) |
| 21 | Eli: the beanie read as a striped melon (9 + 13 dark ribs) | 7 soft ribs in a tone of the yarn, cuff ribs aligned with them, one light edge on the fold (`beanie`) |
| 22 | Mila: the sweater collar stuck out in front of the neck in 3/4 and profile | same narrow rib collar clipped to the torso (`crewCollar`) |
| 23 | Mila: the overall straps ran **under** the collar and vanished in a muddle at the neck | straps moved to their own top layer (`overallStraps`), over the collar, clipped at the shoulder line; brass buttons with a highlight |
| 24 | Mila (back): the crossed straps over the narrow bib top formed a letter «A» | the straps leave the bib at its centre under a stitched patch (a clean yoke); bib top squared (`outfitBack`) |
| 25 | Mila: the bib pocket was a flat box with a line | patch pocket with a flap (one flap line) (`overalls`) |
| 26 | Mila: the ponytail tie was oversized and read as a cap | smaller wrapped band with one wrap line (`headTop`) |

## Light

| # | What was odd | Cause | Fix (`cast.js`) |
|---|---|---|---|
| 27 | Rim read as a thick red / cream double outline (C, A, B) | up to 16 px (1.5× the visible ink) and saturated, so it read as a second line | rim width capped at 0.75× the visible ink (`lw·u`; the fill covers the inner half of every 2·lw stroke), starts exactly where the ink ends, alpha × 0.9 (`rimLight`) |
| 28 | Rim lines on internal edges (arm over torso, hair over face) | rim computed per layer | rim computed **once on the whole silhouette** after the layers are composited, light-facing side only |

## Acting / poses

| # | What was odd | Fix (`cast.js` poses / anchors) |
|---|---|---|
| 29 | Sheepish: the scratching hand covered an eye | `nape` anchor moved to the side / back of the head, above the eye line, in every view |
| 30 | Curious: the pointing finger crossed the mouth and read as «shh» | curled fingers resting just under the chin (`chinTap` anchor, `mitt` hand) |

## Checked and kept (no change needed)

- No ears on Eli or Mila in any view (consistent by design; Mila's earrings hang at the head edge where an ear would be,
  on the back edge in 3/4, both sides in front / back).
- Brows: present and carrying the emotion in front, 3/4 and profile (one brow in profile); surprise / awe now arch.
- Blush only on laugh / sheepish / caught; cheeks otherwise clean. Furious mouth shows both rows of teeth and the tongue.
- Boots: Eli's laces and Mila's rolled lip read cleanly at every size; seams on the jeans / overall legs are single
  purposeful lines.
- Fringe and hair strand highlight: one line each; reads at phone size.

## Still imperfect (honest)

- Mila's ponytail is a separate shape from the head; in hard side light its inner edge catches the rim (correct
  lighting, but at 1:1 it reads as a coloured line inside the hair mass).
- The red key in C still tints the eye whites slightly pink (scene grading, not the kit); they read as white at phone
  size.
- In profile the googly eye still pops past the face edge (deliberate style, kept small and clean).
- Style frames v4 and the test video still use the old kit render; they are re-rendered in the animatic stage.
