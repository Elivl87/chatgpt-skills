# Third-party resources · registry

Every font, library, model, sound or asset not written by us. One row each: what, where it is used, source URL, license.
Allowed: MIT, Apache-2.0, BSD, CC0, OFL, ISC, HPND (and LGPL only as a separate binary). Never NC, GPL/AGPL code copied in.

| What | Used for | Source | License |
|---|---|---|---|
| numpy | simulations, drawing | https://numpy.org | BSD-3-Clause |
| Pillow | drawing | https://python-pillow.org | HPND (MIT-CMU) |
| ffmpeg (system binary) | encoding | https://ffmpeg.org | LGPL-2.1+ (separate binary) |
| Inter (system font, /usr/share/fonts/opentype/inter) | on-screen label in pilot/sim_test (fallback until brand/fonts exists) | https://github.com/rsms/inter | OFL-1.1 |
| Martian Mono (variable, wght+wdth) | brand wordmark, display and labels (`brand/fonts/MartianMono/`) | https://github.com/google/fonts/tree/main/ofl/martianmono · https://github.com/evilmartians/mono | SIL OFL 1.1 (`brand/fonts/MartianMono/OFL.txt`) |
| Space Grotesk (variable, wght) | brand body text, taglines (`brand/fonts/SpaceGrotesk/`) | https://github.com/google/fonts/tree/main/ofl/spacegrotesk · https://github.com/floriankarsten/space-grotesk | SIL OFL 1.1 (`brand/fonts/SpaceGrotesk/OFL.txt`) |
| Kokoro-82M v1.0 weights (`kokoro-v1_0.pth`, sha256 496dba11…) | channel narration TTS (voice tests `voice/`) | https://huggingface.co/hexgrad/Kokoro-82M | Apache-2.0 (model card). Trained on permissive/public-domain/synthetic audio, no voice clones |
| Kokoro voices `af_heart`, `af_bella`, `am_michael`, `am_fenrir`, `bm_george`, `ef_dora`, `em_alex`, `em_santa`, `bf_emma` (in Mila's blend, ep/001) (+ `af_nicole` as A/B announcer); blends of these tensors are channel-owned voices | voice candidates `voice/samples/`; ep/001 narrator + Eli + Mila (`ep/001/audio/`) | https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md | Apache-2.0 (shipped in the same repo; sha256 prefixes checked against VOICES.md). The CC BY training data (SIWIS, Koniwa) only applies to French/Japanese voices, which we don't use |
| kokoro (Python package) 0.9.4 | TTS inference | https://github.com/hexgrad/kokoro | Apache-2.0 |
| misaki 0.9.4 (G2P) | text → phonemes (EN; ES through espeak-ng `es-419`) | https://github.com/hexgrad/misaki | Apache-2.0 |
| spaCy 3.8 + `en_core_web_sm` 3.8.0 | English G2P (used by misaki) | https://spacy.io | MIT |
| espeak-ng (libespeak-ng loaded by `espeakng-loader` 0.2.4; also the apt package 1.51) | Spanish phonemes (`es-419`), English fallback | https://github.com/espeak-ng/espeak-ng | GPL-3.0: used as an unmodified separate tool at render time in a local venv. None of its code is copied into our repo; the audio we produce isn't covered by the GPL |
| phonemizer-fork 3.3.2 | misaki's wrapper around espeak-ng | https://github.com/thewh1teagle/phonemizer-fork | GPL-3.0: separate tool at render time, not copied into our code |
| PyTorch 2.14 (CPU) | TTS inference | https://pytorch.org | BSD-3-Clause |
| faster-whisper 1.2.1 + CTranslate2 4.8 | QC: transcription / WER, later subtitles | https://github.com/SYSTRAN/faster-whisper | MIT |
| Resemblyzer 0.1.4 (speaker encoder, weights shipped in the package) | QC only: speaker-similarity between narrator / Eli / Mila (`ep/001/audio/VOICE_QC.md`); nothing it touches is published | https://github.com/resemble-ai/Resemblyzer | Apache-2.0 |
| Whisper small/base, CTranslate2 conversions (`Systran/faster-whisper-small`, `-base`) | QC transcription models | https://huggingface.co/Systran/faster-whisper-small | MIT |
| pyloudnorm 0.2 | loudness measurement | https://github.com/csteinmetz1/pyloudnorm | MIT |
| librosa 1.0 | F0 / timbre measurement (QC) | https://librosa.org | ISC |
| jiwer 4.0 | word error rate (QC) | https://github.com/jitsi/jiwer | Apache-2.0 |
| SciPy, soundfile | filters, WAV I/O | https://scipy.org · https://github.com/bastibe/python-soundfile | BSD-3-Clause |
| Playwright 1.56.1 (preinstalled global Node package, not vendored) | headless frame stepping for the JS art (`art/render/render.mjs`) | https://github.com/microsoft/playwright | Apache-2.0 |
| Chromium headless shell 1194 (preinstalled in /opt/pw-browsers, separate binary) | Canvas 2D rasteriser for `art/` scenes | https://www.chromium.org | BSD-3-Clause (+ bundled third-party notices; used as an unmodified separate tool) |
| Martian Mono + Space Grotesk (already listed above) | `art/` wordmark, thumbnail words, tagline, via `@font-face` from `brand/fonts/` (no new font added: the brand display face already fits the illustrated style) | see rows above | SIL OFL 1.1 |
| chatterbox-tts 0.1.7 (Resemble AI, Python package, in a throwaway venv) | voice A/B test only (`voice/chatterbox_ab/`), not used in any published audio yet | https://github.com/resemble-ai/chatterbox · https://pypi.org/project/chatterbox-tts/ | MIT |
| Chatterbox Multilingual weights v2 (`ResembleAI/chatterbox`: `t3_mtl23ls_v2.safetensors`, `s3gen.pt`, `ve.pt`, tokenizer) | voice A/B test (B side); reference prompts = our own Kokoro clips, built-in `conds.pt` voice not used | https://huggingface.co/ResembleAI/chatterbox | MIT (model card). Outputs carry the Perth watermark (see next rows) |
| Chatterbox Multilingual LatAm Spanish pack (`ResembleAI/Chatterbox-Multilingual-es-mx-latam`, `t3_es_mx_latam.safetensors`, sha256 c66c4517…) | voice A/B test (C side), loaded into the v2 pipeline | https://huggingface.co/ResembleAI/Chatterbox-Multilingual-es-mx-latam | MIT (model card) |
| resemble-perth 1.0.1 (PerthNet implicit watermarker, weights in the package) | applied automatically by Chatterbox to every output (imperceptible, survives MP3); also used to verify detection | https://github.com/resemble-ai/perth | MIT |
| Chatterbox dependencies: s3tokenizer 0.3.0, conformer 0.3.2, diffusers 0.29.0, transformers 5.2.0, librosa 0.11.0, PyTorch 2.6.0 CPU, setuptools 79 (for `pkg_resources`) | Chatterbox inference (test venv) | PyPI | Apache-2.0 / MIT / Apache-2.0 / Apache-2.0 / ISC / BSD-3-Clause / MIT |
| Chatterbox install-time extras not used for Spanish: gradio 6.8 (Apache-2.0), spacy-pkuseg (MIT, auto-downloads its Chinese model at import), pykakasi 2.3.0 (**GPL-3.0**, Japanese only) | nothing (pulled in by the package; never called for `es`) | PyPI | pykakasi is GPL: an unmodified separate dependency in a throwaway venv, never copied into our code; it does not touch our audio |
| FluidSynth 2.3.4 (apt package `fluidsynth`, separate binary) | renders our own MIDI to audio (`ep/001/audio/music/compose_bed.py`, `compose_score.py`; the wordmark sting notes in `engine/cine_suave.py`) | https://www.fluidsynth.org | LGPL-2.1+ (separate binary, unmodified) |
| FluidR3_GM.sf2 (Frank Wen; apt package `fluid-soundfont-gm` 3.1) | General MIDI instrument samples for the music beds and the "Cine suave" score + sting (celesta, harp, strings, nylon guitar, pizzicato, marimba, piano, cello, glockenspiel, warm pad) | https://packages.ubuntu.com/noble/fluid-soundfont-gm (`/usr/share/doc/fluid-soundfont-gm/copyright`) | MIT ("I hereby release Fluid under the MIT license") |
| pretty_midi 0.2.11 + mido 1.3.3 | writing the MIDI of our compositions | https://github.com/craffel/pretty-midi · https://github.com/mido/mido | MIT / MIT |
| (no third-party audio) "Cine suave" ambience + effects (wind, birds, crickets, distant traffic, crowd murmur, idling engines, room tone, brake squeak, whoosh, paper pop, bike bell) | ep/001 sound, `engine/cine_suave.py` | synthesised by our own numpy code (seeded, deterministic); no recordings, no CC0 packs, no Freesound items used | ours (nothing to license). If a CC0 recording is ever added, it gets its own row + a licence file next to it |
