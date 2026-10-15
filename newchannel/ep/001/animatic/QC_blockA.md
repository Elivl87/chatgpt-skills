# QC · Block A (hook + wordmark, beats 1-5) · draft 854x480 · 2026-10-15

**Files:** `blockA_draft.mp4` (42.03 s, 30 fps, H.264 + AAC, 10.7 MB) · `blockA_contact_small.jpg` (1 frame/s, 322 KB) ·
numbers in `qc/` (`QC_blockA.md` = engine/qc.py, `shots_blockA.md` = shot table, `summary_blockA.json`).
Rebuild: `TMPD=<scratch> newchannel/ep/001/animatic/build_block.sh A draft` (`review` = 1280x720, `final` = 1920x1080).

## How it is built (rules met)

- **Everything keyed to words or sim events.** `shots_blockA.js` computes every cut, acting beat, label and sound cue
  with `A.at(word, n, {beat, speaker, edge})` from `audio/timings_es.json` or `A.ev('S1', event)` from the true S1 run
  (`sim/states.js`, loaded in the page). No typed seconds. Examples: the tap starts on «freno»; the 4th car behind the
  tapper lights up on «más»; Eli's leader on the 2nd «Más» (×2); Eli stops on «quieto» (×1, his brake onset then falls
  on the 3rd «Más» by itself); the stop running back down the queue is anchored on car 15's stop at Mila's «atrás».
- **Sim honesty:** wide wave shots ×3 (label), the over-the-shoulder ×2 (label), from Eli's brake to the end of the hook
  ×1 with no label (PRODUCTION_NOTES 6); Eli's stop is held (sim time clamped before his restart, not faked motion); the
  look back is ×3 with the label. Cuts may re-show a sim instant from another angle (overlap) but never fake one.
- **Camera:** each shot breathes (push 2-3 %, alternating in/out, drift ≤ 0.8 % of the width, own seeded phase); no two
  consecutive shots share a background framing (same-world shots always change angle or scale).
- **Resolution-independent:** scenes draw in 1920x1080 design units; `?out=WxH` scales the frame (stage.js).
- **Sound:** real narration cut for 0-42.03 s + a temporary bed (engine/sound.py): wind/road, a pad that cuts dead on
  «quieto», brake marimba ladder on the sim onsets, squeal + thunk on Eli's stop, flump (ponytail), pop (balloon), pen
  scratches, crickets on «allá no hay nada», flutter + «pío», swish (arrow), plink (lens), suspended chord to
  «aparente», wordmark sting on flick / boink / tin, then 1 s of total silence.

## Measured

| | |
|---|---|
| Duration | 42.03 s (block ends on the first word of block B) |
| Shots / cuts | 21 / 20 → **28.5 cuts/min** (≥ 12) |
| Longest shot | 3.73 s (A17 back-to-back, a slow push on the question); every shot ≤ 4 s |
| Average shot | 2.0 s |
| style_bible + pacing_qc | cuts/min 28.6 PASS · avg 2.0 PASS · longest 3.84 PASS · motion share 0.96 PASS · still runs 0 PASS · wpm 111 FLAG (informational: a hook with gag pauses and a 4.5 s wordmark) |
| Loudness | −14.1 LUFS, TP −1.5 dBTP |
| Black / freeze | none |
| Silence | only the declared 1 s after the sting (41.0-42.0) |

## Looked at (contact sheet + full frames at every gag)

- **Tap → cascade → stop:** readable. The ring around the tapper (A02), the tapper's contented face with music notes
  (A03), the red lights running toward camera (A05, reframed so Eli and Mila sit inside the frame), the leader's lights
  blazing over their heads (A06), both surprised at the hard brake, nose dip + lurch at the stop (A07).
- **Ponytail gag:** the ponytail swings up and lands on Mila's face at the stop; she blows it away after Eli's yell.
- **«¡¿QUIÉN FUE?!»:** Eli rises (anticipation: grumpy inhale), stands on the seat, fist up, furious, anger mark + puffs,
  paper balloon over his head; clear at phone size.
- **Ni choque, ni conos, ni semáforo:** three paper cards pop in on each noun and get crossed on each word end.
- **Bird gag:** anticipation (Eli squints up at the bird on the wire, same shot) → hit (cut: the bird, caught, sweat)
  → hold (silence) → reaction (wing shrug, «pío»).
- **The question:** Mila turns in her seat (head first, then the snap) and faces camera, curious → awe while saying
  «Eli…»; reverse over her shoulder: the stop runs back down the queue (drivers' faces turn surprised one after the
  other, red spill behind each car), a teal arrow draws back down the empty lane; «¿Qué?»: Eli, front, with the
  magnifier enlarging his eye; back-to-back two-shot on the question.
- **Wordmark:** letters drop, Mila flicks the dot, it bonks Eli's beanie (punch-in shot), he flinches late and rubs his
  head, the dot lands on the «i», tagline, grudging smile.

## Detail QC checklist (Eli + Mila) — at draft resolution

- Eyes: whites clean in every light (no slabs), pupils inside, surprise = round open eyes + «o» (A07), lidded emotions
  read (annoyed / smug). ✔
- Mouths: yell with teeth above the collar (A08) ✔; talk visemes on Mila's «Eli…» and Eli's «¿Qué?» ✔.
- Hands: wheel grip, fist, point, visor, magnifier, crossed arms read; no blobs seen at draft size ✔ (to re-check at 1080).
- Clothing: apron straps / collar / beanie ribs / Mila's straps and earrings consistent in front, 3/4, profile, back ✔.
- No vermilion on the characters (only the brand dot) ✔; yellow / purple visible in every shot ✔.

## Weaknesses (honest)

- **A09 visor:** the arm reaches up across the side of his face; it reads as a salute/visor but not elegantly.
- **A15 / A16:** Mila seen from behind is a tall dark hair shape (back view of the ponytail); it reads, but it is not
  pretty. Her chin-on-the-seat-back pose is approximated with crossed arms.
- **A15 arrow:** the teal arrow runs on the empty lane (the queue covers the travel lane); thin at draft size.
- **A19 punch-in:** the wordmark letters are baked at 1920 px; at the final 1080p render the 2.3× punch-in will be soft.
- **Characters in the wide wordmark (A20)** are small next to the letters (same as the v4 style test).
- **Finger drumming** on the wheel (A04) is a head bob, not hand drumming (the drive pose holds the wheel).
- The sound bed is temporary (no character foley beyond the cues listed; final mix later).
- Kit changes for this block are additive and were smoke-tested: style frames a-e, model sheet and emotion sheet
  render pixel-identical to the previous commit.
