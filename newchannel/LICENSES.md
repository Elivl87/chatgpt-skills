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
| Kokoro voices `af_heart`, `af_bella`, `am_michael`, `am_fenrir`, `bm_george`, `ef_dora`, `em_alex`, `em_santa` (+ `af_nicole` as A/B announcer); blends of these tensors are channel-owned voices | voice candidates `voice/samples/` | https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md | Apache-2.0 (shipped in the same repo; sha256 prefixes checked against VOICES.md). The CC BY training data (SIWIS, Koniwa) only applies to French/Japanese voices, which we don't use |
| kokoro (Python package) 0.9.4 | TTS inference | https://github.com/hexgrad/kokoro | Apache-2.0 |
| misaki 0.9.4 (G2P) | text → phonemes (EN; ES through espeak-ng `es-419`) | https://github.com/hexgrad/misaki | Apache-2.0 |
| spaCy 3.8 + `en_core_web_sm` 3.8.0 | English G2P (used by misaki) | https://spacy.io | MIT |
| espeak-ng (libespeak-ng loaded by `espeakng-loader` 0.2.4; also the apt package 1.51) | Spanish phonemes (`es-419`), English fallback | https://github.com/espeak-ng/espeak-ng | GPL-3.0: used as an unmodified separate tool at render time in a local venv. None of its code is copied into our repo; the audio we produce isn't covered by the GPL |
| phonemizer-fork 3.3.2 | misaki's wrapper around espeak-ng | https://github.com/thewh1teagle/phonemizer-fork | GPL-3.0: separate tool at render time, not copied into our code |
| PyTorch 2.14 (CPU) | TTS inference | https://pytorch.org | BSD-3-Clause |
| faster-whisper 1.2.1 + CTranslate2 4.8 | QC: transcription / WER, later subtitles | https://github.com/SYSTRAN/faster-whisper | MIT |
| Whisper small/base, CTranslate2 conversions (`Systran/faster-whisper-small`, `-base`) | QC transcription models | https://huggingface.co/Systran/faster-whisper-small | MIT |
| pyloudnorm 0.2 | loudness measurement | https://github.com/csteinmetz1/pyloudnorm | MIT |
| librosa 1.0 | F0 / timbre measurement (QC) | https://librosa.org | ISC |
| jiwer 4.0 | word error rate (QC) | https://github.com/jitsi/jiwer | Apache-2.0 |
| SciPy, soundfile | filters, WAV I/O | https://scipy.org · https://github.com/bastibe/python-soundfile | BSD-3-Clause |
| Playwright 1.56.1 (preinstalled global Node package, not vendored) | headless frame stepping for the JS art (`art/render/render.mjs`) | https://github.com/microsoft/playwright | Apache-2.0 |
| Chromium headless shell 1194 (preinstalled in /opt/pw-browsers, separate binary) | Canvas 2D rasteriser for `art/` scenes | https://www.chromium.org | BSD-3-Clause (+ bundled third-party notices; used as an unmodified separate tool) |
| Martian Mono + Space Grotesk (already listed above) | `art/` wordmark, thumbnail words, tagline, via `@font-face` from `brand/fonts/` (no new font added: the brand display face already fits the illustrated style) | see rows above | SIL OFL 1.1 |
