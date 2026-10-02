# SecondQuest — Official narration voice decision v1

**Decided by:** Producer (channel owner) · 2026-10-02

**Official English voice of SecondQuest: Bram** (Higgsfield preset voice, ElevenLabs engine).

| | Previous (retired as official) | New official |
|---|---|---|
| Voice | Kokoro `am_michael` @ 1.00 | **Bram** |
| Engine | Kokoro v1.0 (local) | Higgsfield `text2speech_v2`, variant `elevenlabs` |
| Higgsfield voice | — | preset `549ff70a-3ee7-4f04-a4d9-89a24fab7709` |
| Cost | free | ≈3 credits / 1,000 characters (EP001 full script ≈ 25 credits per take) |

## Basis
- A/B test on the EP001 hook (l01–l19): Bram (ElevenLabs) vs Kokoro `am_michael`. The Producer judged Bram clearly better.
- Higgsfield's public terms state that outputs belong to the user and may be used commercially, including YouTube monetisation. The Producer should keep a dated copy of the terms and may ask Higgsfield support for written confirmation.

## Rules
- **One voice for the whole channel.** Bram is used for every episode, like Quest_v1 for the character.
- **Engine integration:** this is a data change, not an architecture change. The Bram WAV goes into `audio/narration.wav`, `npm run narration:align` rebuilds `timings.json`, and every scene follows the new cues automatically.
- **Spanish** (optional locale, on explicit request only) is not affected by this decision.
- **Kokoro** stays installed for drafts and placeholders only, never for official delivery.
- **No narration is generated** without the Producer's go-ahead, because generation spends Higgsfield credits.

## Pending (needs the Producer's go-ahead)
1. Generate the EP001 narration with Bram in blocks of 5,000 characters or less. About 25 credits per take, about 40 with retakes.
2. Import it, normalise it, and align it (`narration:align`).
3. Switch `shared/production.json` voices.en to Bram and update the tests.
4. Validate. Render only when the Producer asks.
