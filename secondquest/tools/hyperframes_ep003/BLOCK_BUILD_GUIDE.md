# EP003 in Hyperframes — block build guide (B..G)

Engine: Hyperframes 0.8.147 (HTML + GSAP 3.14, Apache-2.0), project per block. The hook (block A) in
`src/index.template.html` → `hook/` is the reference implementation: read it first (structure, camera `cam()`/`focus()`,
lake shader canvas, mates rig, fish `buddy` with expression faces, splash helper, motion-blur, word tokens).

## Files of a block X
- `src/blockX.template.html` — the composition you write (copy the hook's head/CSS conventions you need).
- `src/blockX.assets.json` — extra art to stage: `{"name.png": ["repo/relative/path.png", max_h_or_null]}`.
- Build: `cd tools/hyperframes_ep003 && source ./env.sh && python3 stage_assets.py --block X && python3 build.py --block X`
  → `blockX/index.html` (+ `blockX/assets/`, gitignored). Shared art (fish v2 faces, boat halves, props v2, Quest/Pixie
  laughs, wordmark, fonts, gsap) is staged automatically — see `ART` in `stage_assets.py`.
- Check: `hyperframes snapshot blockX -o <scratchpad dir> --at t1,t2,... --no-end` and LOOK at every contact sheet.
- Do NOT run `hyperframes render` (CPU is shared; the main session renders blocks one by one).

## Timing (non-negotiable)
- The composition starts at 0 = block start. Every time is a word token resolved by build.py, block-relative:
  `{{l09.w11}}` (start of word 11 of line l09, 1-based), `{{l09.w11.end}}`, `{{l09}}`, `{{l09.end}}`, `{{DUR}}`, with
  arithmetic `{{l09.w11-0.2}}`. Never type raw seconds for a beat. Root/audio/world clips use `{{DUR}}`.
- Audio: `<audio src="assets/narration.wav" data-start="0" data-duration="{{DUR}}">` (narration v3 + SFX mix already cut).
- Words/lines: `episodes/ep003/script.json` (LOCKED v3.2, never change a word) and `episodes/ep003/timings.json`.

## What to build
- Your block's beats from `docs/ep003/hyperframes/DOPAMINE_PLAN.md` (all adopted) and the relevant
  `docs/ep003/QUALITY_AUDIT.md` items (chat ≥ 82 % frame height and legible, doorway room, corkboard, etc.).
  The Python animatic `scripts/ep003-blockX-animatic.py` shows what exists today (content, order) — exceed it.
- `docs/ep003/GAME_VISUAL_REFERENCE.md` (when present) for anything in the game world (HUD redrawn in our style).
- Rules: CLAUDE.md — quality bar (no shot > ~4 s without a change, comedy timing, callbacks), camera breathes 2–3 %
  (+ drift ≤ 1.5 %, own phase), HUD only in the game world, no game footage/logo/UI copies, no burned-in subtitles,
  music off, title-safe framing, nothing cut by the frame unless deliberate, art never edited (layers around it ok).
- Companion fish v2 faces: `assets/fish_34.png` (deadpan) + `fish_34_{blink,wide,lookup,yawn,sweat,wince}.png`,
  side view `fish_side*.png`; swap faces with opacity steps (see the hook's `buddyFace`).
- Boat: `rowboat_side_back.png` behind the crew, `rowboat_side_front.png` in front (same box) — crew seated inside.
- Grain/vignette are NOT in the composition: `finish_post.py` adds the approved finish after render.
- Fonts available: `assets/fonts/` (Anton, Inter 800/600). Need another free OFL font? put it in
  `public/shared/fonts/` with its licence and list it in the block's assets json.

## Done means
Snapshots at every beat look spectacular and correct (framing, legibility, no overlaps, nothing off-frame), the block
builds without errors (`hyperframes lint blockX` / `validate` if useful), and you report: beats built (with token
triggers), snapshots path, known gaps. Don't commit — the main session reviews and commits.
