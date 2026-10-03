# Can the engine have its own "Bram"? Terms research (2026-10-03)

Question (Producer): can the engine have Bram's voice and train it episode by episode?

## Verdict
| Route | Verdict | Source |
|---|---|---|
| Train/fine-tune a local model on Bram audio | **Prohibited** | ElevenLabs Prohibited Use Policy (17 Aug 2026): no using Output "as input for any machine learning or training", nor "as part of a dataset ... for training, fine-tuning". https://elevenlabs.io/use-policy |
| Same, under Higgsfield's terms | **Prohibited** | Higgsfield Terms (26 Jul 2026) §5.2(iv): no using Outputs "to train, fine-tune, distill ... any machine-learning model"; §8: third-party provider policies apply. https://higgsfield.ai/Terms-of-Use-Agreement |
| Clone Bram with Higgsfield `create_voice` | **Prohibited** | requires owning the voice or clear permission (consent step). https://higgsfield.ai/voice-cloning |
| Keep using Bram through Higgsfield (paid) | **Allowed**, commercial use OK | Higgsfield §4.4 |

## Risk to watch
ElevenLabs states its Default voices "will expire on December 31, 2026" (help centre). Not confirmed whether
Higgsfield's Bram preset is affected. Action: before EP003, check the preset is still offered; if a migration is
needed, change voice at a natural break, never mid-series.

## What can improve episode by episode (free, allowed)
- `shared/pronunciation.json`: Bram's pronunciation lexicon grows each episode.
- STT QC (faster-whisper) + word timings: catches misreads (EP002 "is/was").
- Per-block delivery settings recorded in `audio/bram/<ep>/NARRATION_PLAN.json`.

## If a self-owned voice is ever wanted
Only with audio we own (Producer's voice or a hired narrator with a written release covering AI training and
commercial use), on commercially licensed weights: Qwen3-TTS (Apache-2.0) or Chatterbox (MIT, watermark).
Avoid F5-TTS and XTTS-v2 weights (non-commercial). Rented GPU; 20-60 min of clean speech.

Quotes come from summaries of the live pages; re-read the pages before acting on exact wording.
