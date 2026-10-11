# Analysis: "World Brief" Short made by an agent (x.com/lordoftheapp, 2026-10-10)

33.7 s, 720x1280, 30 fps. 6 scenes (globe -> Nobel -> road timeline -> earthquake map -> cathedral -> follow card).
Looked at 1 frame/s plus full-resolution frames and zoomed crops.

## How it gets that level of detail (all of it is code, not generated art)
| Technique | What it does | Where seen |
|---|---|---|
| **3-ink palette** (navy, cream, mustard + tiny red/green accents) | everything looks printed by the same press; no clash | whole video |
| **Halftone dot screen** as shading and texture | dot density instead of gradients: a print/risograph look that hides how simple the shapes are | backgrounds, road, photos |
| **Duotone photos** | real photos are converted to navy dots on cream, so they belong to the same world | the cathedral photo, portrait |
| **Paper grain + vignette + soft light leak** | removes the "flat vector" feel | every frame |
| **Hard offset shadows + thick ink outlines** on every card | a consistent sticker/card system | all labels |
| **Props of the craft**: tape strips, clipboards, rubber stamps ("TOWER COLLAPSED"), checkboxes that tick | tactile, physical feeling; each fact becomes an object | timeline, damage card |
| **Karaoke captions**: the spoken word gets a yellow highlight | word-level timing (whisper) drives it | captions |
| **Personified objects** (sleepy globe with Zzz, cathedral with a shocked face) | humor and warmth with zero character art | globe, cathedral |
| **Micro-motion everywhere**: clouds drift, the LIVE clock ticks every second, seismograph line draws, cards pop | nothing is ever still | whole video |
| **Persistent frame** (WORLD BRIEF badge + LIVE clock) | identity and pacing | top bar |

Probable pipeline: HTML/CSS/SVG components animated with a timeline (Remotion/Hyperframes-style), voice + whisper word
timings, rendered to MP4. The detail comes from a strict design system applied to every element, not from heavy art.

## What SecondQuest already has
Word-level timings (faster-whisper), cards with ink outlines and drop shadows (ui_kit), marker/parchment/sign families,
personified gag objects (the unimpressed fish), entrance pops, camera push.

## What we could take (ideas, our own code, 0 credits) — proposals, nothing applied
1. **A unifying "finish" pass** over every frame: light paper grain + vignette + a very subtle halftone only in the
   shadows. Goal: make 3D props, procedural plates and generated art read as one world. Must be tested against the
   EP001/EP002 painted look (the Producer decides; it could also be EP003-only to match the fishing-trip mood).
2. **Duotone/halftone treatment for anything that is not our art** (charts, data cards, the founders' "yearbook"),
   instead of flat fills.
3. **Physical props for facts**: tape, rubber stamps, ticking checkboxes (we have parchment ticks; stamps would suit
   "ALIBI", "FAILURE", "NOT DESIGNED FOR FISH").
4. **Karaoke word highlight in the Shorts' captions** (Shorts keep burned-in English captions; the episode stays clean).
5. **"Nothing is ever still" rule**: animate the water ripples, clouds and lantern flicker in every shot (our lake
   ripples are static today).
Not for us: the persistent LIVE header (news format), the 3-ink palette for the whole channel (it would break the
EP001/EP002 identity).
