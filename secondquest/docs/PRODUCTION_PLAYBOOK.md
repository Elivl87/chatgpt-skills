# SecondQuest: production playbook (how an episode is made)

Written 2026-10-08, after EP002 (Ocarina of Time) was finished and uploaded as Private. It is the starting point for
EP003 and every later episode: **repeat what worked, improve it, never repeat a mistake listed here.**
Binding rules stay in `CLAUDE.md`; this file is the method and the lessons behind them. Every Producer decision of
EP002, with its date and words, is in `docs/ep002/PRODUCER_DECISIONS.md`.

## 0. Working with the Producer

- Spanish in every reply. Short reports: what was done, what it shows, what is pending, improvements with their cost.
- **Always bring ideas, not only fixes.** The Producer asked for this explicitly (block H). The best blocks came from
  2–3 options (A/B/C) shown as previews before building; then "Sí, constrúyelo así".
- **Approval words are literal.** "Apruebo con mejoras 1 y 3" means exactly 1 and 3. "Tal cual" means no change.
  "No me entregues el animatic" means do it, do not send it.
- **The Producer reviews by timestamp** ("00:58–01:05", "03:35–03:43"). Check exactly that interval, fix exactly
  that, and prove the rest of the file did not change (diff the before/after; EP002 dub v3.1 changed only 56.8–64.0 s).
  When asked for "only that interval", touch nothing else; offer the rest as an option.
- When a fix is rejected ("No quedó bien"), go back to the version the Producer names, byte-identical, and record it.
- "Lo importante es que siempre se escuche/vea natural": natural beats technically perfect.
- Every spend is quoted first (`tools/credits/credits.py`, `docs/credits/ledger.json`), then generated, then the
  ledger gets the actual cost, job ids and balance. Ledger ids are unique: check the last id before quoting (EP002 had
  a spoken "Q011" that was really Q041). Balance after EP002: **28.25 credits**.

## 1. Order of work for an episode

| # | Stage | How | Approval |
|---|---|---|---|
| 1 | Script EN + ES-419 | Producer delivers both, approved. Used verbatim forever (`docs/publish/<EP>/script_es.json` aligned 1:1 with the English cues). Checks only report. | Producer |
| 2 | **Packaging first** | Title A (curiosity) + B (search) + thumbnail idea, before production (PUBLISHING_STANDARD §1, THUMBNAIL_RULES 1). The thumbnail's picture must be on screen in the first seconds. EP002 did this at the end: do it at the start. | Producer |
| 3 | English narration | Bram, blocks <= 5,000 chars (`audio/bram/<ep>/NARRATION_PLAN.json`), ~3.2 credits / 1,000 chars. STT QC against the script (`ep002-bram-qc.py`), assemble (`ep002-bram-assemble.py`): never stretched, static gain -20 LUFS, one cue per line in `episodes/<ep>/timings.json`. | Quote + Producer |
| 4 | Asset fit | `docs/<ep>/asset_needs.json`, `npm run assets:find`. | — |
| 5 | Animatic, block by block | One script per block (`scripts/<ep>-block<X>-animatic.py`), QUALITY=draft, design units S()/Si()/P()/F(). Before sending: `scale_check.py`, `framing_qc.py`. Send only that block. Stand-ins labelled MISSING, listed in `docs/<ep>/MISSING_ART.md`. | Each block |
| 6 | Art quote | All MISSING art quoted together at the end (`ART_QUOTE_v1.md`). Anchor image first (costume), shown, then the rest using it as reference. | Producer |
| 7 | Art into the animatic | `lib.final(key)`: overlays and 3D parts composited at load, generated files untouched. | Producer |
| 8 | Full animatic | `QUALITY=review` join (`ep002-join-animatic.py`, VERSION + APPROVED list). | Producer |
| 9 | Final render | Only on approval: `scripts/ep002-render-final.sh` (resumable). 2560x1440. Deliver by Release. | Producer |
| 10 | Publish package | `docs/publish/<EP>/<EP>_PUBLISH_PACKAGE.md`: titles, 3 thumbnails, description EN+ES, chapters, tags, .srt EN/ES, Short, settings, order. | Producer |
| 11 | Spanish dub | §5 below. | Quote + Producer |
| 12 | Upload Private, then Public | Producer. Analytics screenshots at 24–48 h and ~5 days -> `docs/publish/<EP>/ANALYTICS_*.md`. | Producer |

## 2. Picture: what the Producer approved in EP002 (keep doing it)

- **Characters:** Quest is "you" (the player). In the game world he wears his own hero tunic (similar, never equal);
  his face, curly hair, freckles, human ears never change (costume rule). Pixie plays every female role (friend,
  princess), face 0.9 x Quest's. The villain is recurring, hooded, own design (`VILLAIN_V1_PROMPT_SPEC.md`), name
  still open. Third-party characters are evoked, never replicated; places and objects may be recognisable.
- **One reusable back view per character and era** (young Quest #3, adult Quest #4/#4b, Pixie #2f): saves credits.
- **Gear never drawn into the art:** shield, sword and scabbard are our 3D, laid on top so they never swap shoulders
  (`gear.py`, `lib._sword_swap`, `shield_mount.py` with its "old shield still visible" check). Gear stays rigid in the
  breeze (`lib.gear_mask`).
- **One castle per episode** (the plates' castle; our 3D one retinted to match).
- **Walks are real walks:** alternating steps (`lib.step`, mirrored back view), one pace (`STEP_RATE`, `SLOW_RATE`
  for long scenes), walking down the road in the plate's perspective (`lib.road_walk`), no treadmill.
- **Camera continuity** (CLAUDE.md) and moves only where the script asks.
- **Vary the places.** Hyrule Field only where the script is about the field.
- **Video-game language** is the channel's visual voice: in-game HUD whenever we are in the game world (hearts, magic,
  rupees low, buttons solid with blended gloss), area cards once per place, lock-on, choice boxes, save files,
  CONTINUE? end menu, heart containers that behave like the real game's. HUD off in real life and on comparisons.
- **On-screen text** from `ui_kit` only (game text box in the game world, signpost/parchment in the world, EP001 gold
  marker in real life; Anton + Inter 800; DejaVu only for ♪ ★ ♥ →).
- **Clean video:** no burned subtitles, no planning tags, no slot guides in deliveries (`SUBS=1`, `PLANNING=1` only
  for review).
- **Homages are welcome as our own drawing** (the one-eyed spider in the cobweb), never a copy.
- **Thought bubbles:** the "memory" look (warm glow, dissolving edge, sparkles), not ink-outlined circles.
- **The wordmark** with its gold bar on "So, why?"/"why?" and Navi flying into the star of the "o": the channel's
  signature, used at the opening and the end, and in the trailer Short.
- **The end** keeps the channel's identity: the two of them from behind looking at the horizon, golden hour, clean
  thirds for YouTube's end screen.

## 3. Picture: mistakes not to repeat

- A see-through hole in UI drawn with alpha gloss (HUD v1). Draw solid shapes and blend highlights on top.
- A 9:16 Short cut straight from 16:9 art: it crops the story. Use framing B (frame at 160 % width, blurred fill).
- A snap-back camera on the same background; a walk where the background does not move; a person half out of frame.
- A modern controller in the 1998 story (Q008, #10): our 3D N64 pad is composited over it.
- Prompts with third-party names or "sword" (Higgsfield's filter blocked it, uncharged): use "scabbard … handle".
- Two different castles in one episode.

## 4. Sound

- Bram (`549ff70a-3ee7-4f04-a4d9-89a24fab7709`, `text2speech_v2` / `elevenlabs`) is the only voice, EN and ES.
- Sounds are free; Producer-supplied game clips only as directed, with the risk recorded (Navi: HELLO at 0.16 ≈ -9 dB
  and SFX_01 at 0.14 ≈ -14 dB under Bram). All other sound effects are decided at the end, not per block.
- STT checks: faster-whisper **medium** (the small model mishears Spanish: "estaba/estabas", "quizá", "cuesta").
  A word the full-track pass misses must be checked on the isolated passage before calling it a defect.

## 5. Spanish dub (YouTube "Idiomas → Doblaje"): the method that worked

Scripts: `ep002-es-lines.py` (cuts) -> `ep002-es-schedule.py` (timing) -> `ep002-es-audio.py` (mix) ->
`ep002-es-qc.py` (full-track STT). Final: **v3.1** (`EP002_audio_espanol_v3_1.wav`). Cost: 22.2 + 0.3 retake.

What the Producer heard, and the rule each one produced:
1. **v1 "cortes / narración montada"** -> cut a take only **inside a real pause found in the audio** (-30 dB, >= 60 ms),
   never at STT word times. Segments are laid end to end and **never overlap**, across blocks too.
2. **v2 "doble o con eco desde 1:30"** -> a time-stretch over a long stretch is heard as an echo. **Plan the whole track
   backwards** (a line may start up to 2.5 s early or 1.5 s late) so speed-up is the last resort; when needed, at most
   ~1.075 and only with rubberband **R3** (`rubberband --fine`), never ffmpeg's filter.
3. **v2 "fondo… y después muy cortado en los espacios"** -> slice the decoded takes by sample, so lines that were
   together play exactly as recorded; every other join falls inside a pause (equal-power crossfade, or 40 ms fades);
   a soft gate (-14 dB under -40 dB, 30 ms look-ahead, 60 ms release) makes all pauses alike.
4. **v3 "0:58–1:05 no natural"** -> **never split one breath**: where Bram runs lines together (natural gap ~0), they
   stay one segment (`KEEP_WITH_PREVIOUS`) and the segment is centred on its English lines.
5. **v3.2 (filling a long pause with Bram's pause air) was rejected: "No quedó bien".** Do not fill pauses with
   room tone; v3.1 stands.
6. A take that ends while the vowel still sounds is **re-recorded** (approved, 0.3), not patched with a fade.

**Improve for EP003:** generate the Spanish narration with the English one (step 3), and check its length per block
against the English before the animatic is locked: where Spanish is much longer (EP002 block 3: +11 %), the Producer
can decide early (longer pauses in the English edit, or accept leads) instead of stretching later.

## 6. Packaging and publishing (EP002 decisions on top of PUBLISHING_STANDARD)

- **Title:** curiosity first (A), search as B in Test & Compare; "Ocarina of Time" (the game's short name) near the
  start, ~60 characters, the full official name is not needed.
- **Thumbnail 1d pattern:** Quest in the red hoodie with the era's real controller, face big on the left, looking at
  the subject; 1–3 extreme words; three variants that change only the words. Made from existing art first (free).
- **File name** of the upload: descriptive (`<game>_<topic>_SecondQuest.mp4`); it is a weak signal, never harmful.
- **Subtitles:** EN and ES .srt uploaded, never burned in the episode. Shorts: EN burned in.
- **Spanish audio:** the Bram dub as a dubbed track (Idiomas → Español → Doblaje), plus the ES title/description.
- **End screen:** subscribe + the previous episode as the specific video, over the clean last ~5–10 s.
- **Trailer Short:** hook line in the first second, approved lines only, Navi into the wordmark star, card FULL
  EPISODE ON THE CHANNEL, related video = the episode, uploaded after the episode.
- Lessons from EP001's numbers (`docs/publish/EP001/ANALYTICS_D5.md`): first 30 s decide distribution; a concrete
  visual beat every 60–90 s; Shorts need an extreme, concrete claim.

## 7. Delivery and housekeeping

- Files over 30 MB: draft Release via `publish-file.yml` (several files in one pack: names separated by spaces;
  each split as `.part.NNN` with `.sha256` on branch `deliver/<tag>`). The Producer must be logged in as Elivl87 to
  download. Auto-deleted after 7 days. GitHub sometimes answers 500 on push: retry.
- Keep repo-worthy tools in the repo (EP002's resumable render script lived only in a temp folder until the end:
  now `scripts/ep002-render-final.sh` + `scripts/animatic/clip_ok.py`).
- Never delete art. Old block clips and old takes stay (`audio/bram/ep002_es/rejected/`).
- At the end of each episode, ask whether to delete its deliveries.

## 8. EP003 kickoff checklist

1. Read this file, `CLAUDE.md`, the standards, and the last analytics file.
2. Ask for EP003's approved EN + ES-419 script; do the originality/structure report (report only).
3. Packaging (title + thumbnail concept) agreed **before** the animatic.
4. Quote EN + ES narration together (~3.2 credits / 1,000 chars each); check the balance (28.25 after EP002).
5. Make the EP002 scripts reusable for any episode before copying them (join, render-final, es-lines/schedule/audio/qc,
   short trailer, thumbnails take the episode as a parameter): free, saves time on every episode. Proposed, Producer
   decides.
6. Asset fit, then block-by-block animatic with options and improvements in every report.

Open items carried over: the villain's name; EP002 analytics at 24–48 h after it goes public; whether to delete
EP002's deliveries once it is public.
