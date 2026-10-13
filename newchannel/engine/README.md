# engine/ · Ten Thousand Dots / Diez Mil Puntos

Shared code for every episode: **a sim module + a shot list tied to narration words → video.**
Python 3 + numpy + Pillow + system ffmpeg (no Hyperframes: the print look is per-pixel work that Pillow/numpy
already do well, and a browser would add a dependency with no gain). Everything is deterministic (seeded); frames can
render in any order, in parallel.

Proof: `demo/demo.mp4` (the 20 s phantom-jam test rebuilt with the engine), `demo/wordmark_en.mp4`,
`demo/wordmark_es.mp4`, `demo/QC_demo.md`, `demo/contact_sheet_demo.jpg`.

## Make an episode

```
ep/NNN/
  sim/<topic>.py        the simulation (deterministic, seeded): returns per-frame arrays
  audio/narration.wav   from engine/voice.py (locked script, word for word)
  audio/timings.json    word timings (script spelling)
  episode.py            Episode class: shots + draw functions + audio()   (copy engine/demo/episode.py as a start)
  build.py              voice -> render -> QC                              (copy engine/demo/build.py)
```

1. **Voice** (needs the voice venv once: `bash engine/setup_voice_env.sh`, ~2.4 GB in /tmp/claude-0/ttdenv):
   `OMP_NUM_THREADS=2 /tmp/claude-0/ttdenv/venv/bin/python engine/voice.py --lang en --script ep/NNN/narration_en.txt --out ep/NNN/audio`
   (`--lang es` for ES-419). Check the log: wpm, `aligned N/N`, unmatched words.
2. **Shots**: write the shot list against words (`T.at("tap")`), never hand-typed seconds. Print `tl.report()`:
   shots > 4 s are flagged.
3. **Animatic**: `python3 engine/render.py ep/NNN/episode.py:episode ep/NNN/renders/animatic.mp4 --preview`
   (854x480), then `python3 engine/qc.py ep/NNN/renders/animatic.mp4 --out ep/NNN --timings ep/NNN/audio/timings.json`
   (`pacing_qc` must pass).
4. **Final**: `render_episode(ep, final.mp4, also_preview=review_480p.mp4)` → `qc.run(...)` → read `QC_*.md`, LOOK at
   the contact sheet (Read the jpg), fix, repeat.

Machine rules: max 3 processes (render default = 2 frame workers + ffmpeg `-threads 2`), `OMP_NUM_THREADS=2`,
temp files only in `/tmp/claude-0/` (frames are piped, never written). Videos > 30 MB go by Release.

## Measured (4 CPU, shared)

| What | Speed |
|---|---|
| `look.finish()` alone, 1920x1080, busy benchmark frame | 66 ms → **15 fps** per process |
| demo frame (ring + 2 300-dot live diagram + mascot SDF + finish) | ~146 ms → ~6.8 fps per process |
| full pipeline, 2 workers + x264 `slow` (1080p + 480p outputs) | wordmark clips ~15 fps streaming; demo 6.9 fps streaming, 546 frames in 84 s (6.5 fps end to end) |
| demo build (audio + render 1080p + 480p + QC) | ~1 min 50 s for 18.2 s of video |
| voice: 7 s line (Kokoro synth + whisper small alignment), 2 threads | ~40 s (model load dominates) |

## Modules (API)

### `look.py` · print finishing
- `Frame(w=1920, h=1080, ss=2)`: one coverage image per plate, drawn at `ss`x and box-reduced (anti-aliasing).
  Coordinates/sizes are always output px. Plates: `tint` (paper_shadow), `second`, `accent` (**the companion only**),
  `face`, `ink`, `shade` (ink halftone 15°; plate value = tone), `shade2` (second halftone 75°).
- Drawing: `disc, ellipse, ring, line(pts, width), arrow(pts, width), polygon, rect, text(plate, xy, s, role, size,
  anchor, v) -> bbox, label(...)` (text on a paper knock-out, for labels over busy art), `text_size`,
  `mask(plate, array_or_L, x, y)` (union a patch at plate resolution), `stamp(masks, x, y)` (mascot/wordmark masks),
  `clear_rect`. Value `v` 0-255 = coverage (fades = less ink, never transparency tricks).
- `finish(fr, frame_index, look=Look()) -> HxWx3 uint8`: paper (brandkit `printfx.paper`) × vignette × live grain
  (new crop every 2 frames, seeded) × each plate multiplied in (brandkit's overprint model), riso mottle
  (`printfx.ink_texture`), 1 px misregistration of the colour plates vs the ink plate. Only plate bounding boxes are
  composited. `Look(grain, misreg, texture, vignette, halftone_cell, seed, live_grain)`.
- `palette()` (reads `brand/palette.json` at run time), `rgb(name)`, `font(role, size)` with roles `display`,
  `display_wide`, `label`, `label_bold`, `body`, `body_bold` (Martian Mono / Space Grotesk from `brand/fonts`).
- Easing: `smooth`, `smoother`, `ease_out_back`, `window(t, t0, t1, fade_in, fade_out)`.

### `camera.py` · breathing camera
- `Cam(cx, cy, zoom)`: `pt(x, y)`, `pts`, `s(r)`, `inv`, `visible`. World px → screen px.
- `CameraTrack(W, H, seed, fps).add_setup(t0, t1, frame=(cx, cy, zoom), bg, moves, push, drift, follow, follow_lag,
  follow_offset)`; `at(t) -> Cam`; `cuts()`.
- Rules built in: push 2.2-3 % per setup (direction alternates), drift ≤ 1.5 % (default 0.6-1.2 %) with a seeded
  phase per setup; `Move(t0, t1, target, ease)` for eased moves; `follow=t -> (x, y)` tracks a point with a critically
  damped spring. **Consecutive setups with the same `bg` merge** (framing continues, a new framing becomes an eased
  move): the framing never resets between two shots with the same background.

### `mascot.py` · the companion, animated (wraps `brandkit.mascot`)
- `Mascot(seed, t_end, blinks=True)`: `set_expr(t, name)`, `blink_at(t)`, `expr_at(t)`,
  `draw(fr, x, y, d, t, expr=None, look=(lx, ly), sx, sy, extras=None, hero=False, ground=True, look_at=None)`.
- Blinks on a seeded schedule (2.2-5.5 s, 130 ms, 20 % double blinks); expression changes = 0.22 s squash pop with a
  blink, face swaps mid-pop; `look` clamped to ±0.12 R; `ground=True` keeps the bottom on the surface when squashed.
- Size rules: `MIN_HERO_D = 70` px (hero shots are enlarged to it with a warning; the 43 px style test was too small),
  extras only ≥ 48 px (auto ≥ 110 px), brand minimum 24 px.
- `render_masks(d, expr, sx, sy, look, blink, extras)` (SDF; eyes close via an elliptical eyelid),
  `HopPath(points, times, d, heights).state(t) -> (x, y, sx, sy, airborne, since_contact)` for hops with contact squash
  and flight stretch, `draw_static(...)`.

### `wordmark.py` · the 2.5 s sting
- `Sting(lang="en"|"es", center=(960, 570), width=1700)`: `draw(fr, t, tagline_at=None)`, `events` (the 3 contact
  times → motif notes), `rest_px()`.
- Path, contacts and keyframes come from `brand/src/build_brand.py` (`_contacts`, `_path`, `_seg_pos`) and the
  storyboard timing (f06/14/22/30/37/42/47/60 @24 fps); EN lands as the full stop, ES bounces on the i-dot of "Diez",
  the M, lands on the i stem of "Mil" and rebounds into the tittle. Letters print with a 0.42 s wipe, dotted trail in
  second ink, ink ticks at contacts. Companion: 92 px (EN) / 71 px (ES) at 1080p.
- `python3 engine/wordmark.py` renders `demo/wordmark_en.mp4` / `wordmark_es.mp4` (3.5 s incl. 1 s hold + tagline).

### `timeline.py` · shots tied to words
- `Timings.load(path, offset)`: `at(word, n=1, edge="start"|"end"|"mid", after=0)` → video seconds; `phrase("nobody
  caused") -> (start, end)`; `word_at(t)`; `start`, `end`. Matching ignores case, punctuation and accents.
- `Shot(name, start, draw, bg, frame, follow, zoom, follow_offset, moves, push, drift, data)`.
- `Timeline(shots, duration, fps, overlay=fn)`: `ctx(fi) -> Ctx(t, fi, shot, index, lt, u, cam, tl)` (+ `since`,
  `env`), `render(fi)`, `cuts()`, `report()`. `python3 engine/timeline.py` prints the example shot list.

### `voice.py` · narration (voice venv)
- Channel voices: **EN = G** (`af_heart` 0.7 + `ef_dora` 0.3, speed 0.84, misaki EN-US) · **ES = D** (`ef_dora`
  0.6 + `af_heart` 0.4, speed 0.92, espeak-ng `es-419`: seseo/yeísmo).
- `narrate(text, lang, out, whisper="small", gap_sentence=0.28, gap_paragraph=0.75)`; CLI `--text|--script`,
  `--realign`. Kokoro's per-segment padding is trimmed, so the script's gaps are the only air; `[pause 1.2]` lines
  insert silence. Post: trim, 70 Hz HPF, 2.5:1 comp, two-pass loudnorm −16 LUFS → 48 kHz 24-bit mono.
- Timings: faster-whisper word timestamps aligned to the script (sub-token SequenceMatcher, digits spelled out, script
  spelling wins; unmatched words interpolated, `conf: 0`), then onsets refined on the waveform (Whisper's starts
  swallow the pause before a word). `voice_meta.json` logs wpm, phonemes, model SHA256 prefixes.
- Weights live in `$HF_HOME` = `/tmp/claude-0/ttdenv/hf`, never in git.

### `sound.py` · sonification, motif, mix, master (numpy)
- Synths: `pluck, marimba, tick, thunk, chime, glide, whoosh, pop, hum(n, f0, amount_curve), pad(n, chord)`,
  `note("F#3")`, `PENTA` (G major pentatonic; the channel key is G).
- **Channel motif** `STING_NOTES = ("D5", "A5", "G5")` (up a fifth, settle on the tonic), played by the sting's three
  contacts: `sting_sfx(bus, sting.events, drop_t, offset, gain)`; `motif_notes(octave_shift)` to quote it elsewhere.
- `Bus(n)` / `Bus.seconds(d)`: `add(t, sig, pan, gain)`, `add_stereo`.
- `mix(voice, music, sfx, sfx_rel_db=-7, music_rel_db=-17, duck_db=6, voice_offset)`: SFX bus set 7 dB under the voice
  (integrated, ebur128), music 17 dB under and ducked 6 dB while the voice speaks.
- `master(x, path, target=-14, ceiling=-1.5)`: gain + look-ahead limiter on a 4x-oversampled peak estimate, iterated
  against ffmpeg ebur128 → −14 LUFS integrated, TP ≤ −1.5 dBTP (margin for AAC). `measure_file`, `load_audio`,
  `write_wav`.

### `qc.py` · checks
- `run(video, out_dir, timings=None, every=1.0, name, declared={"freeze": [(s, e)], "silence": [(s, e)]}, notes)` →
  `QC_<name>.md`, `qc_<name>.json`, `contact_sheet_<name>.jpg`. Checks: H.264/yuv420p, resolution, ≤ 30 MB, AAC 48 kHz,
  −14 ±1 LUFS, TP ≤ −1 dBTP, blackdetect, freezedetect, silencedetect (declared ranges allowed, e.g. the 1 s of air
  after the sting).
- Pacing: runs `secondquest/scripts/style_bible.py` + `pacing_qc.py` **unchanged** (an `imageio_ffmpeg` stub points
  at `/usr/bin/ffmpeg`; output redirected to a temp dir). Its cut detector under-counts cuts between mostly-paper
  framings, so episodes also print `tl.report()` (the real cut list).
- `contact_sheet(video, out, every, cols, tile_w)`, `detect(video)`, `probe(video)`.

### `render.py` · orchestration
- Episode protocol: `W, H, fps, n_frames, frame(fi) -> uint8 HxWx3`, optional `audio(path)`.
- `render_episode(ep, out, preview=False, also_preview=None, frames=None, workers=2, audio=True, crf=None)`:
  fork workers stream raw RGB in order into one ffmpeg (H.264 High, yuv420p, crf 18, maxrate 10M, AAC 192k; preview
  854x480 crf 23). `also_preview` writes both from one pass. The mp4 is written in /tmp/claude-0 and moved into
  place only after ffmpeg exits cleanly.
- CLI: `python3 engine/render.py path/episode.py:episode out.mp4 [--preview] [--range a:b] [--workers 2]`.

## Demo (`demo/`)

`sim_ring.py` (IDM ring road, Sugiyama setup, tap as a parameter, pre-roll, ×3 clock), `episode.py` (7 shots tied to
"tap", "Twenty-two", "And", "jam", "rolling", "backwards"), `build.py`. Narration (placeholder line, channel voice EN G):
"One tap of the brakes. Twenty-two drivers. And a jam that nobody caused, rolling backwards." (6.9 s, 141 wpm).

## Known limits

- Nobody has listened to the audio: mix balance (hum vs plucks vs voice), the motif and the voice were measured, not
  heard. The E2 hum is thin on phone speakers.
- Text drawn through a moving camera is re-rasterised every frame at fractional sizes; at 2x supersampling this is
  smooth in the decoded frames, but very slow pushes on large type could show sub-pixel shimmer on some displays.
- `style_bible.py`'s cut detector misses cuts between similar paper framings (demo: 9.9/min measured vs 19.8/min
  real).
- Kokoro/torch install is ~2.4 GB in /tmp and disappears with the machine; `setup_voice_env.sh` recreates it
  (~3 min). The uv resolver picked a CUDA torch wheel (works on CPU, just bigger).
- The sting's ES companion (tittle) is 71 px, right at the hero minimum; wider lockups would crowd the 90 % safe area.
