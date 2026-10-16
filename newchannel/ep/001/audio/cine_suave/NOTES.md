# EP001 · Sound direction "Cine suave" (Producer, 2026-10-16)

The new direction: a constant warm music bed under everything, real-sounding ambience, and few soft effects that never
compete with the narration. The characters are silent now and speak only through text boxes.

## Samples for the Producer

| File | What | Range | I | TP | LRA |
|---|---|---|---|---|---|
| `sample_hook.mp3` | hook + wordmark (block A). Character lines muted; their slots carry only music and ambience, plus a soft paper pop for the text box | 0:00 → 0:42.0 (to the first word of beat 06) | −14.1 LUFS | −1.7 dBTP | 9.2 LU |
| `sample_night_hill.mp3` | 31 s from the first night-hill shot (beat 13) | 3:11.2 → 3:42.2 | −14.1 LUFS | −1.7 dBTP | 2.1 LU |

Both use the current Kokoro narration (`narration_es.wav`), measured on the mp3 (`samples_measurements.json`). Rebuild
with `python3 make_samples.py` (add `--events-a` / `--events-night` to reuse exported page events).

## Music: one continuous score, keyed to the timings

`../music/compose_score.py` composes the whole episode (479 s with the 20 s end card) in code. It writes our own MIDI
(`../music/score_es.mid`, section plan in `score_es_plan.json`) and renders it with FluidSynth + FluidR3_GM. It is in G
major and uses the channel motif D5 → A5 → G5. **No section start is typed by hand**: each one is placed 0.9 s before
the first word of its beat in `timings_es.json`, and bars are stretched by a few % so a whole number of bars fits. When
the Chatterbox take lands, the score re-times itself: the cache key is a hash of the timings plus the composer.

| Act / beats | Section | Arrangement |
|---|---|---|
| Hook 01-02 | **Ruta dorada** 92 bpm | nylon guitar fingerpicking, acoustic bass, warm pad + slow strings, glockenspiel motif in bar 2 |
| 03 → «Entonces» | hush | the guitar drops out: pad, strings, bass, a few guitar notes and harp ("allá no hay nada") |
| «Entonces» → wordmark | ask | a Dsus4 that swells under the question (CC11 ramp) and hangs |
| Wordmark | sting hold | Dsus4 stays soft under the sting. The motif notes are chord tones, so the sting fits even if the art timing moves |
| 06-12 | **Curiosidad** 100 bpm | pizzicato ostinato / marimba offbeats / rising harp, rotating through 4 variants and progressions; a soft celesta motif per section |
| 13 | **Noche** 66 bpm | sparse piano, slow harp rolls, cello, warm strings; the motif once on the piano |
| 14-17 | Curiosidad | as above |
| 18-19 | warm 88 bpm | piano + guitar ("una persona paciente") |
| 20-21 | Ruta dorada, fuller | adds a cello line and the glock motif |
| 22-23 | Ruta dorada, softer | |
| 24 + end card | **lift** 90 bpm | strings open up an octave, glock and celesta motif, final G(add9) with a harp roll; fades over the last 3 s |

Voice band: no sustained part above ~1 kHz (only the sparse glock/celesta motif goes higher). The render is
high-passed at 40 Hz and carved −2.5 dB at 2-3.5 kHz. In the mix, a slow leveler (`level_ride`) keeps 45 % of the
act-to-act dynamics, so quiet sections like the hush or the night stay audible in silent slots.

Soundfonts: FluidR3_GM (MIT) is already registered. I did not use GeneralUser GS or other "free" SoundFonts: their
licences are custom, not plainly permissive, so I skipped them.

## Ambience: synthesised, one bed per scene type (`engine/cine_suave.py`)

Everything is synthesised in numpy, seeded and deterministic. No recordings are used, so there is nothing to license
(see `LICENSES.md`). Each bed is made from these sources:

- **Wind**: noise whose band opens and closes with slow random gusts, plus a grass/leaf rustle (around 2.6 kHz) that flutters in the gusts.
- **Birds**: individual birds of 4 song types (descending whistles, trills, two-tone calls, chips). Each bird has its own pitch, distance, pan and interval, with variation from one syllable to the next and outdoor reflections.
- **Distant traffic**: a low brown rumble with slow swells, plus passing cars whose spectrum brightens and pans as they go by.
- **Crickets**: 6-7 individuals (4.2-5.4 kHz, 3-5 pulses per chirp, each at its own rate) and a faint far chorus.
- **Crowd murmur**: a speech-shaped spectrum with syllabic flutter in 10 bands and slow swells.
- **Engines**: idling cars as a low harmonic hum.
- **Room tone**: for the dome.

| Scene (shot `bg`) | Bed |
|---|---|
| golden highway (`hw*`, `close*`) | grass wind, a few birds, the road with pass-bys |
| ring field (`ring*`, `field*`, `two*`, `close9*`) | grass wind, more birds, very distant road |
| cloudy queue (`line*` in acts 1-2) | stronger wind, fewer birds |
| stadium (`stadium*`) | crowd murmur + light wind |
| dome (`dome*`) | softer murmur in a 3.2 s room + ventilation |
| night hill (`night*`, `window*`) | crickets, faint breeze, the highway hum down in the valley |
| toll plaza (`toll*`) | idling engines, gusty wind, road |
| footbridge (`bridge*`, `i24*`, `busstop*`) | steady highway roar with pass-bys, wind, a rare bird |
| wordmark (`wm*`) | warm air only |

Insert shots (paper, graphs, hands, plates, laptop, split screens, the bird insert) keep the ambience of the shot
before them. Scene changes crossfade over 0.6 s. The hook's «allá no hay nada» keeps its daytime crickets (from the
page's ambience list).

## Effects: few and soft

The new list is rebuilt from the shot cues in `cue_list()`:

- **Key brakes only**: Eli's hard brake (`squeal`) becomes a low, soft squeak (~750 Hz), and the full stop (`stop_thunk`) becomes a soft suspension bump. The brake-note cascade is gone.
- **Gentle whoosh**: only on big camera moves (camera turns, the spin, the wordmark reveal, crane shots), never closer than 8 s apart.
- **Paper pop**: one very soft pop for each text box (each silent character line, from `segments_es.json` / `timings_es.json`, plus the page's `pop` cues). None during the wordmark.
- **Wordmark sting**: the 3-note motif on the 3 contacts (FluidSynth celesta doubled by harp; harp + cello G under the landing note).
- **Kept because the script asks for them and they sound real**: a soft bike bell ("bicicleta"), a crowd "ooh" swell for the stadium wave, a wind gust.
- **Dropped**: every cartoony, loud or repetitive cue (boinks, springs, dings, ticks, chimes, scratches, whistles, horns, plates, chains and the like).

## Levels (relative to the narration of the same block)

| Bus | Level | Under narration |
|---|---|---|
| Music | −12 LU integrated before ducking (about −17 LU after) | ducked −7 dB (attack 80 ms, release 600 ms), plus a further −3 dB at 2-3.5 kHz |
| Ambience | −21 LU (about −24 LU after ducking) | ducked −4 dB |
| Effects | measured as 400 ms RMS against the narration's median 400 ms RMS | brakes / whoosh −14 dB, bell / crowd swell −15, gust −16, paper pop −19; sting −6 (only where nobody speaks) |
| Master | −14 LUFS integrated, limiter ceiling −1.5 dBTP (mp3 measures −1.7) | |

All levels are constants at the top of `engine/cine_suave.py` (`LEVELS`, `SFX_REL`).

## In the animatic builder

`animatic/sound_block.py` now defaults to `--sound cine_suave`, so `build_block.sh` uses it with no change. `--sound
temp` keeps the old bed for comparison. The builder:

1. mutes the character segments of the narration;
2. cuts the block's range out of the cached score (`$TTD_SCORE_CACHE`, default `/tmp/claude-0/cine_suave_cache`; the first build after a new voice take renders it once, about 2 min on 1 core);
3. builds the ambience from the shots' `bg`;
4. adds the soft effects from the cues;
5. mixes and masters.

## Known limits / next

- I can't listen here. Balance was checked by measurement (momentary loudness, band energy, spectrograms). The Producer's ear decides the music level: with the bed at about 14 LU under the narration, gaps sit around −28 LUFS momentary.
- The score's sting hold starts at «aparente» end + 0.32 s (the wordmark cut in `shots_blockA.js`). The sting itself follows the page's cues.
- The ambience is synthetic. If the Producer wants more realism, the next step is CC0 field recordings (each with a licence file next to it and a `LICENSES.md` row).
