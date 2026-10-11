# Deep scout: sound, music, voice (2026-10-12, second pass)

Scope: beyond Kenney / jsfxr / pyloudnorm (already in the earlier scouts and in `public/shared/sfx/SOURCES.md`).
Constraint recap: monetized, commercial-OK, CC0 preferred, CC-BY only with credit tracking, NC/ND never, CPU only, nothing installed or downloaded in this pass.
Tags: **V** = verified this pass from the project page/README; **K** = from my background knowledge, NOT verified now (check the LICENSE file before adopting); **S** = search-snippet only (secondary source).

Method note: GitHub HTML/API blocked; many READMEs do not state a licence at all (pretty_midi, Tone.js, pyo, noisereduce, rnnoise, Piper). Those are marked K and need a LICENSE-file check when we actually pull them.

## 1. SFX libraries and packs

| # | Resource | Licence | Verdict | Use |
|---|---|---|---|---|
| 1 | **OpenGameArt "40 CC0 water / splash / slime SFX"** (rubberduck, 2.3 MB: 15 splash, 3 bubble, 16 slime, 6 loops) | CC0 **V** | **ADOPT** | Direct hit for splashes. Add to `cc0/` with page URL in SOURCES.md. |
| 2 | **OpenGameArt "CC0 Sounds Library"** (ETTiNGRiNDER, ~50 entries: hits, impacts, GUI clicks, water, kitchen, ambient loops) | CC0 **V** | **ADOPT** | Slaps/impacts/clicks, ambience loops. Audition per entry. |
| 3 | **OpenGameArt "Sound Effects Pack"** (OwlishMedia, 142 MB: UI, water, paper, cloth, footsteps, impacts, synth) | CC0 **V** | **ADOPT** | We already hold "87 Clickety Clips" from the same author; this is the bigger foley pack (paper, cloth, water). Most also on author's Freesound profile. |
| 4 | **BigSoundBank** (Joseph Sardin) | CC0 / WTFPL / PD, credit optional **V** | **ADOPT** | Real recorded foley and ambiences (water, wind, rooms). Best CC0 source for "natural" textures. Manual download; no API. |
| 5 | **Sonniss GDC bundles** (2015-2024, multi-GB) | Royalty-free, commercial incl. "monetized YouTube", no attribution, no resale as standalone files, **AI/ML training prohibited** **V** (FAQ; full EULA PDF not read) | **TRY** | Highest quality whooshes/impacts/foley. Not CC0 (EULA, not redistributable), so store outside git/public repo with the EULA PDF per year; record in SOURCES.md. Needs Producer OK because it is a different licence class than CC0. Big downloads, manual. |
| 6 | **Freesound** (CC0 filter) | Per-file: CC0 / CC-BY / NC. API needs a key; original-quality download needs OAuth2, previews (ogg/mp3) do not; 60 req/min, 2000/day, 30/min 500/day for downloads **V** | **TRY** | Only CC0-tagged files. Search API has no licence filter in the docs, but the `license` field is a filterable/returned field (K); verify per file. OAuth download is awkward headless: use manual download for shortlisted ids. Never take CC-BY-NC. |
| 7 | **Pixabay sound effects** | Pixabay Content Licence: free commercial use, attribution not required, no standalone resale **V**; Content ID not addressed in the summary | **TRY** | Large whoosh/UI/foley catalog. Not CC0 and no licence file per download; keep a screenshot/URL record. Pixabay music has known Content ID claim reports (K): do not use music. |
| 8 | **Mixkit sound effects** | Mixkit Free licence: commercial incl. YouTube, attribution not required, no resale of unaltered copies **S** (licence page text not retrievable) | **TRY** | Whoosh/UI/transition fillers. Read the licence text before first use. |
| 9 | **Zapsplat free tier** | Attribution REQUIRED in description for free members; Gold removes it; claims no Content ID **S** | **SKIP** | Credit tracking cost and a paid upsell. Rule says free + low friction; CC0 sources cover the same needs. |
| 10 | **99Sounds** | Terms page 404/403; free sample libraries are royalty-free (K) | **SKIP** (unverified) | Revisit only if a specific pack is needed; check pack readme. |
| 11 | **OpenGameArt UI pack from PD sample libraries** ("UI Sound Effects: Button Clicks, User Feedback, Notifications") | CC0 listed in snippet **S** | **TRY** | UI pops. Confirm licence on the page. |
| 12 | **floraphonic whoosh packs (itch.io)** | paid | **SKIP** | Search suggested it as the whoosh source; it is paid, violates "always free". |

Gap found: no clearly CC0 whoosh pack surfaced. Cheapest fix is to synthesize whooshes (filtered noise sweeps, section 2) and keep Sonniss as the quality fallback.

## 2. Procedural / synth SFX

| # | Resource | Licence | CPU | Verdict | Use |
|---|---|---|---|---|---|
| 13 | **ZzFX** (KilledByAPixel) | MIT **V** | trivial | **TRY** | 20-param browser generator, tiny. README says browser AudioContext only (no Node); to render WAV use the web designer or run in headless Chromium / OfflineAudioContext. Good for UI pops, wordmark sting, coin/slap chirps. ZzFXM = tiny tracker for jingle motifs. |
| 14 | **Pedalboard (Spotify)** | **GPLv3** **V**; bundles JUCE/Rubber Band (GPL or commercial) | fast, multicore, no GPU | **TRY (tool only)** | GPL applies to the software, not to audio you produce; we do not distribute it. Fine as an internal render tool (reverb, compressor, limiter, pitch shift, bitcrush, VST3 hosting). Do not vendor it into any shipped/public engine package. Alternative with no GPL question: ffmpeg filters + scipy. |
| 15 | **Sound Design Toolkit (SDT)** | GPLv3 **S** | CPU | **SKIP** for now | Physically informed liquids/impacts/friction, exactly our foley use, but C/Pd/Max; heavy glue. Revisit if synthetic splashes are needed. |
| 16 | **garjan (Rust crate)** | unstated in snippet **S** | CPU | **SKIP** (unverified) | Physical-model foley incl. water drips/splashes. Check licence; Rust toolchain only worth it if no recorded splash fits. |
| 17 | **Csound** `dripwater` and PhISEM opcodes | LGPL2.1 (K) | CPU, offline render to WAV is native | **TRY** (new channel) | Offline rendering by design (`csound -o out.wav`), huge opcode set for physical models. |
| 18 | **supriya** (SuperCollider Python) / SuperCollider NRT | SC is GPLv3 (K); supriya MIT (K); README fetch 404 | CPU, NRT = faster than realtime, no audio device | **TRY** (new channel) | Best fit for "code-composed, deterministic, headless" music and sonification. GPL tool, output is ours. |
| 19 | **DawDreamer** | GPLv3 **V** (+ JUCE, Faust deps) | Linux x86_64/aarch64 wheels, `engine.render()` offline | **TRY** (new channel) | Python host for VST3/Faust, render synth patches offline. Same GPL-tool-not-output logic as Pedalboard. |
| 20 | **Pure ffmpeg/sox synthesis** (`aevalsrc`, `anoisesrc`, `sine`, filters) | LGPL/GPL tools (K) | trivial | **ADOPT** | Already the zero-dependency route (music-gen-skill uses it for beeps/sweeps). Whoosh = band-passed noise with moving cutoff + envelope. Slap = noise burst + resonant body. |

Not re-listed (earlier scouts): sfxr/jsfxr/bfxr, Kenney.

## 3. Code-composed music

| # | Resource | Licence | CPU | Verdict | Use |
|---|---|---|---|---|---|
| 21 | **music21** | BSD 3-clause **V**; corpus scores carry own terms (use no-corpus build if strict) | yes | **ADOPT** (new channel) | Theory-aware composition (chords, voice leading, scales) with MIDI/MusicXML out. Do not use its bundled corpus pieces as our music. |
| 22 | **mido** | MIT (K) | yes | **ADOPT** | Minimal MIDI writer; used by music-gen-skill. |
| 23 | **pretty_midi** | MIT (K, README silent) | yes | **ADOPT** | Friendlier note objects; its `synthesize()` is sine-only, real timbre needs FluidSynth. |
| 24 | **FluidSynth** | LGPL 2.1 **V** | yes, faster than realtime file render (`-ni sf.sf2 in.mid -F out.wav`, K) | **ADOPT** | MIDI to WAV engine. Output is not covered by LGPL. |
| 25 | **FluidR3_GM.sf2** (Frank Wen) | MIT, notices must be kept; Debian copyright file confirms **S** | n/a | **ADOPT** | Debian package `fluid-soundfont-gm` is the easiest source. Keep COPYING in `assets/licenses/`. 140 MB, dated sound. |
| 26 | **GeneralUser GS** (S. Christian Collins) | Permissive "use in commercial music, no royalty" licence (K); site text not retrievable this pass | n/a | **TRY** | Nicer GM sound at 30 MB. Must read the bundled `documentation/LICENSE.txt` before use, then ADOPT or SKIP. |
| 27 | **MuseScore_General (sf2/sf3)** | MIT / CC0 claims differ by version (K; handbook page silent; a fork note says licence "under discussion") | n/a | **SKIP until verified** | Best free GM quality, but licence history is murky; confirm LICENSE in the exact release before use. |
| 28 | **Sonic Pi** | MIT code; samples and wavetables CC0; synthdefs MIT except 5 GPL; docs CC BY-SA **V** | headless run needs a Ruby/SC build, awkward | **SKIP** as engine, **TRY** its CC0 samples | CC0 sample set is a free instrument library. For the engine, supriya/SC is cleaner. |
| 29 | **Furnace tracker** | GPLv2+/GPLv3 **V**; headless player build (`-DBUILD_GUI=OFF`) **V**; WAV render CLI not confirmed | CPU | **TRY** (new channel, chiptune) | Chiptune songs exported to WAV; no ownership claim by the tool is stated. Tool GPL, output ours. Check CLI export flag before committing. |
| 30 | **Tone.js** | MIT (K, README silent) | browser (Offline render via headless Chromium) | **TRY** | Only if the Tiny Systems pipeline is already browser-based; otherwise Python/SC is simpler. |
| 31 | **pyo** | LGPL3 (K; README silent); offline render claimed in docs (K) | CPU | **SKIP** | Realtime-oriented, build pain; supriya/Csound cover it. |
| 32 | **Surge XT** | GPL3 **V** | CPU, headless CLI not confirmed | **SKIP** for now | Excellent synth, large patch library with mixed patch licences (K). |
| 33 | **AI music models (MusicGen weights, Stable Audio Open, AudioLDM)** | CC-BY-NC / community licences (K) | slow on CPU | **SKIP** | NC or revenue-gated. Not needed; algorithmic composition is the plan. |

## 4. Audio processing / QC

| # | Resource | Licence | Verdict | Use |
|---|---|---|---|---|
| 34 | **noisereduce** | MIT (K; README silent) | **TRY** | Spectral gating for our own recordings, CPU OK (`n_jobs=-1`). Stationary mode for hiss, non-stationary for drifting noise. |
| 35 | **RNNoise (xiph)** | BSD-3 (K; README silent) | **TRY** | Speech denoise for recorded voice; raw 16-bit 48 kHz mono PCM only, build from source. ffmpeg `arnndn` filter wraps it, so no build needed. |
| 36 | **ffmpeg loudnorm / ebur128 / sidechaincompress / deesser / afftdn** | LGPL/GPL build (K) | **ADOPT** | Two-pass loudnorm to -14 LUFS/-1 dBTP; `sidechaincompress` for ducking music/ambience under VO; `deesser`, `afftdn`. Zero new dependencies. |
| 37 | **WhisperX** | BSD-2 (K); diarization models gated on HF **V** | **SKIP** here | Already covered by caption scouts. |
| 38 | **librosa** | ISC (K) | **ADOPT** (already planned) | Onset/beat tracking for syncing SFX to VO, spectral QC. |

## 5. Voice (beyond Kokoro)

| # | Resource | Licence | CPU | Verdict | Notes |
|---|---|---|---|---|---|
| 39 | **Piper voices** | HF repo tag MIT **V**; per-voice licences differ: es_MX "claude" high = Apache-2.0 **V**, es_ES "davefx" medium = CC0 **V** | very fast | **ADOPT** as free placeholder narration ES | Check the MODEL_CARD of each voice before use (some datasets are NC). Engine moved to OHF-Voice/piper1-gpl (GPL, K): tool GPL, output ours. Old `rhasspy/piper` is the prior MIT engine. |
| 40 | **Chatterbox / Chatterbox Multilingual** | MIT **V** (LICENSE read); Spanish in multilingual V3 and Latam/Spain finetunes **V**; Perth watermark on all output **V** | Nano (110M) targets CPU, ~3x realtime on 8 cores **V**; others slower | **TRY** | Best open expressive candidate with Spanish. Watermark is inaudible but present: fine, disclose in notes. No cloning of real people. |
| 41 | **OpenVoice V2** | MIT, commercial OK **V** | not stated | **TRY** (voice design) | Tone-colour converter over a base TTS; supports ES. Use only with our own reference voice, never a real person. |
| 42 | **KittenTTS** | Code Apache-2.0; KittenTTS 2 models under "Stellon Labs Community License" (read it) **V**; ONNX nano/micro/mini 15-80M are CPU-light **V** | very light | **TRY** | 20 languages incl. Spanish claimed. Verify each model's licence before use. |
| 43 | **StyleTTS2** | Code MIT; pretrained models require disclosing synthetic speech unless voices permitted **V**; GPL phonemizer dependency (MIT fallback is lower quality) **V** | slow-ish | **SKIP** | English-centric, conditions add friction. |
| 44 | **Parler-TTS** | Apache-2.0 (K, README silent); English only **V**; text-prompted voice description **V** | CPU possible, slow | **SKIP** for ES / **TRY** for EN voice design | The only one with true "describe the voice" control, but no Spanish. |
| 45 | **F5-TTS** | Code MIT, **weights CC-BY-NC** **V** | no CPU docs | **SKIP** | NC kills it. |
| 46 | **Dia (nari-labs)** | Apache-2.0 **V**; English only; no CPU support **V** | no | **SKIP** | |
| 47 | **Orpheus TTS** | repo Apache-2.0 but weights Llama 3.2 community licence per one secondary source **S** | heavy | **SKIP** | Licence ambiguity and GPU-sized. |
| 48 | **Coqui XTTS** | CPML non-commercial (K) | | **SKIP** | NC. |

## 6. Claude / agent skills for sound and music

| # | Resource | Licence | Verdict | Use |
|---|---|---|---|---|
| 49 | **sirruf/music-gen-skill** | MIT **V** | **ADOPT as the template** | mido script (editable source) -> FluidSynth render via `render.sh`, needs a GM SoundFont, ffmpeg, sox for direct synthesis (beeps, sweeps, SFX). Deterministic. Almost exactly our new-channel pipeline; fork its `render.sh` idea, supply FluidR3 or GeneralUser. |
| 50 | **rheadsh/audiovisual-production-skills** (`sc-designer`) | no licence stated **V** | **TRY** (read only) | SuperCollider SynthDefs: FM, granular, physical modelling, patterns. Unlicensed: treat as inspiration, rewrite ours. |
| 51 | **jeremyruppel/claude-collider** | MIT **V** | **TRY** | MCP server + skills for live SuperCollider; realtime only, headless/NRT not mentioned. Use for sound design auditions on a machine with audio, not in the container. |
| 52 | **SJY051/music-composition** | scripts MIT, docs CC BY 4.0 **V** | **TRY** | Pure knowledge skill (harmony, melody, form, 24+ genres); pairs with mido + FluidSynth. CC-BY docs: if we copy text, keep credit. |
| 53 | Suno-based skills (nwp/suno-song-creator, claude-ai-music-skills) | n/a | **SKIP** | Cloud text-to-music, paid, licence unclear; breaks "always free". |

## Best picks for SecondQuest right now

1. **OGA 40 CC0 water/splash/slime** -- fills the splash gap, CC0.
2. **OGA OwlishMedia Sound Effects Pack (142 MB)** + **ETTiNGRiNDER CC0 library** -- paper, cloth, water, impacts, UI, all CC0.
3. **BigSoundBank** -- natural recorded ambience and foley, CC0-like.
4. **ffmpeg synthesis + loudnorm/sidechain** -- whooshes, slaps and the sting from filters, no dependencies.
5. **Piper (es_ES davefx CC0, es_MX claude Apache) + Chatterbox Multilingual (MIT)** -- ES placeholder / candidate narrators.
6. **music-gen-skill + mido + FluidSynth + FluidR3 (MIT)** -- the Tiny Systems music pipeline, offline and deterministic.
7. **music21 (BSD)** -- theory-aware composition for that channel.
8. **Sonniss GDC** -- quality fallback; needs a Producer decision because it is an EULA, not CC0.

## Process notes

- Add each adopted pack to `public/shared/sfx/SOURCES.md` with page URL, date, licence file next to it (as done for Kenney/OwlishMedia).
- Never store GPL tools' code in the repo; only their audio output.
- Keep a sound-credit ledger only if we ever accept CC-BY (Freesound); current plan accepts none.
- Open verifications: GeneralUser GS LICENSE.txt, MuseScore_General release licence, Mixkit licence text, Sonniss EULA PDF per year, Furnace CLI export flag, supriya licence, pretty_midi/mido/noisereduce/RNNoise LICENSE files, KittenTTS 2 community licence text.
