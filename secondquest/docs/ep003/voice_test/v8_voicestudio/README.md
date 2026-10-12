# v8 — VoiceStudio (OmniVoice) Bram clone A/B — INTERNAL ONLY

**INTERNAL PLACEHOLDER. Never in any published video, Short or delivery.** A cloned Bram voice is only for review cuts;
Bram's real voice is licensed through a paid platform. The OmniVoice weights (k2-fsa/OmniVoice) are CC-BY-NC
(non-commercial) — another reason this can only be an internal placeholder.

Same three passages in each version (hook l01–l07 with the 1.5 s wordmark pause, boat silence l24–l26, ending l49–l52):

| file | what |
|---|---|
| `INTERNAL_*_v3_moss.mp3` | v3: MOSS-TTS-Nano clone (previous placeholder) |
| `INTERNAL_*_v4_voicestudio.mp3` | v4: VoiceStudio/OmniVoice, one 10.75 s EP002 reference (`scripts/ep003-narration-v4.py`) |
| `INTERNAL_*_v5_bram_clone.mp3` | v5: OmniVoice cloned from all of Bram (EP001 + EP002): per-sentence-type references, Bram's pace/melody per type, Bram's acoustic pauses, best-of-3 by Bram-likeness (`scripts/ep003-narration-v5.py`) |
| `INTERNAL_bram_ep002_*_REAL_BRAM.mp3` | real Bram, EP002 hook and ending, for reference |

Metrics: `INTERNAL_ab_v4_v5_bram_metrics.json` (passages), `INTERNAL_ab_sentence_metrics.json` (first sentence-level
A/B, v3 vs OmniVoice settings). Speaker cosine = WavLM-base-plus-SV x-vector vs the centroid of 190 clean Bram sentences;
UTMOS = VoiceStudio's bundled UTMOS22 naturalness predictor; wpm measured while speaking.
