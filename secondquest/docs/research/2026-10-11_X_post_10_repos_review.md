# Review: X post "10 repos que están explotando este mes" (@brenzhills, 2026-10-11)

Source: https://x.com/brenzhills/status/2108983461230845978 (read via the public fxtwitter mirror).
Checked: each repo's README + LICENSE (raw.githubusercontent). Star counts NOT verified (GitHub API/pages blocked
for this session); treat the post's numbers as unverified.

| # | Repo | What it really is | Licence | Use for SecondQuest |
|---|---|---|---|---|
| 1 | debpalash/VoiceStudio | Desktop app (Electron) bundling many open TTS/STT engines: cloning, voice design, dubbing, transcription | App AGPL-3.0; models separate | **Only one with real value, with conditions** (below) |
| 2 | hugohe3/ppt-master | PDF/Word -> native editable PowerPoint (agent skill, sponsored by API resellers) | MIT | No (we make video) |
| 3 | bilawalsidhu/gods-eye-view | 3D globe with live public feeds (planes, ships, cameras) | MIT | No |
| 4 | morluto/rea | Reverse-engineering MCP (binaries, apps, websites) | MIT | No; legal/ToS risk on games, never on our IP rules |
| 5 | cathrynlavery/diagram-design | Agent skill: diagrams as HTML/SVG in your brand | MIT | Low: our cards come from ui_kit in the channel style |
| 6 | paperclipai/paperclip | Server + UI to run "a company" of AI agents with budgets | MIT | No: we already have workflows + the two Producer gates |
| 7 | mattpocock/skills | Small engineering skills (grill-me, TDD, triage...) | MIT | Low: software-dev oriented |
| 8 | affaan-m/ECC | Big pack of skills/memory/security for several agents | MIT | No: heavy, overlaps our CLAUDE.md + skill |
| 9 | multica-ai/andrej-karpathy-skills | One CLAUDE.md with 4 rules (think first, simplicity, surgical changes, verifiable goals) | (no file found) | Already covered by our rules (review by timestamp, never touch outside the flagged interval, verify before sending) |
| 10 | thedotmack/claude-mem | Persistent memory across sessions via hooks + local worker | Apache-2.0 | No: default is a HOSTED memory (sends session data out); our memory is the repo (CLAUDE.md, playbook, decisions), which survives ephemeral cloud containers |

## VoiceStudio in detail
- Default engine OmniVoice (k2-fsa) is **CC-BY-NC = non-commercial**: not usable on a monetized channel. Its own
  licence registry flags every model `commercial_use: false` until reviewed; NLLB (translation) and Llama-OuteTTS are
  non-commercial too.
- Engines with permissive licences inside it (usable directly, without the app): VoxCPM2, CosyVoice 3, MOSS-TTS v1.5,
  dots.tts, Confucius4-TTS, Kokoro (Apache-2.0); GPT-SoVITS, MeloTTS (MIT).
- **Cloning Bram is not allowed**: Bram is a licensed voice on a paid platform; VoiceStudio itself says "clone voices
  only with permission". We keep paying for Bram, or we move to a voice the channel owns.
- Real opportunity (free, a test only): (a) a better free placeholder than Kokoro (CosyVoice 3 / VoxCPM2 sound more
  natural); (b) a long-term option: a channel-owned designed voice (voice design, Apache model) that could replace the
  Bram credits (~3.2 credits per 1,000 chars per language). Risks: quality and consistency vs Bram, CPU-only container
  (slow), ~5 GB of models on a limited disk, and the audience already knows Bram's voice (EP001, EP002).

## Test 2026-10-11 (Producer authorized running MOSS-TTS-Nano, ONNX CPU, Apache-2.0)
- Isolated venv in the scratchpad (CPU torch 2.7 + the repo); reference voice = our own Kokoro voice 3 (no third-party
  voice cloned; its built-in presets include a real person's voice, never used).
- Samples: `docs/ep003/voice_test/v3_moss/` (hook l01-l07, EN and ES), metrics in `metrics.json`.
- EN: timbre distance to Bram 4.68 (Kokoro voice 3: 3.81), pitch movement IQR 33 Hz (Kokoro 53, Bram 74): flatter.
  ES: STT shows slips ("que si nadie" for "casi nadie", "Pesca en") ; Kokoro ES reads "How to Fish" as "Auto Fish".
  Speed: ~1.5 min of CPU per 30 s of audio (a full episode ~15 min). Disk: ~0.8 GB.
- REA (4) and paperclip (6): not adopted (no gain over current tools; see the Producer reply).
