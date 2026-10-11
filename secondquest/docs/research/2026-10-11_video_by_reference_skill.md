# Review: ishuagrawal/skills · video-by-reference (x.com/ishuagra02, 2026-10-08)

MIT licence. An Agent Skill (SKILL.md + references + scripts + a browser animation engine) that turns a reference video
into an original, fully code-generated animated short with a synthesized soundtrack. Requirements: Node 22, ffmpeg,
Python+numpy, headless Chromium (all present here).

## What it is, in practice
1. **Study the reference**: `scripts/analyze_media.py` measures cuts, shot lengths, holds ("on twos"), palette
   (k-means), luminance curve, loudness, onsets, tempo, silences, and builds contact sheets -> a written **style bible**
   with numbers + principles.
2. **Concept**: carry the reference's DNA (how it reveals, cuts, jokes), invent the surface (never a near-copy).
3. **Pre-production**: a cue sheet where every time is a named cue (no hard-coded seconds), beat sheet, color script.
4. **Build**: a deterministic browser engine (canvas/SVG/three.js), rigs, sets, post-pass presets (grain, etc.),
   supersampling and motion-blur subframes.
5. **Pacing rules for comprehension**: text read time ≈ 0.3 s/word + 0.5 s; title cards ≥ 2.5 s; one new idea at a
   time; held payoffs 1-2 s; review at 1 frame/s (anything visible < 3 frames there is too fast).
6. **QA** on frames of the real render.

## What we already do the same way
Named cues (`T('l12.w3')` from word timings), deterministic frame renderers, three.js props in headless Chromium,
contact-sheet review (framing_qc), facts checked before lock, "inspired, never a copy".

## What it can give us (proposals, nothing installed)
| Idea | Use for SecondQuest | Cost |
|---|---|---|
| `analyze_media.py` on **our own EP001 and EP002** | a measured SecondQuest style bible (avg shot length, holds, palette, loudness, silences) to check every new episode against our proven look and pacing | 0, ~10 min |
| **Pacing QC rules** (read time per word, title ≥ 2.5 s, 1 fps review) | add to framing_qc: flag any card that is not on screen long enough to read | 0, small code |
| **Motion quality bar** (anticipation, follow-through, secondary motion, eased everything, motion blur subframes) | upgrade the kit: idle motion for cut-outs, eased entrances, motion blur on fast moves (the fish leap, the launch) | 0, engine work |
| **Post-pass presets** (grain, vignette) | the "finish" pass also suggested by the World Brief analysis | 0, needs a look test |
| Synthesized soundtrack | not used: music is OFF by rule; SFX could be synthesized (our free-sound rule allows engine synths) | 0 |
Not adopted: replacing our pipeline with its browser engine (ours already works and the art is generated 2D, not rigs).
