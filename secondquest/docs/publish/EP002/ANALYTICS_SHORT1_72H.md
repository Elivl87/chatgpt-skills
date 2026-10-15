# EP002 Short #1 "The one thing Nintendo can't rebuild": analytics at ~2.5 days (2026-10-15)

Source: the Producer's YouTube Studio app screenshots ("since published"). Short: 0:53, 1080x1920, published 2026-10-12.

| Metric | Value | Reading |
|---|---|---|
| Views | 1,025 (unique viewers 288, engaged views 329) | ~3.5 views per unique viewer, so loops and replays happen |
| Traffic | Shorts feed 97.8 %, search 1.4 %, other 0.7 %, channels 0.2 % | Pure feed distribution; search terms are noise |
| **Stayed to watch** | **28.0 %** (72.0 % swiped away) | The main problem: the feed tests it and most viewers swipe in the first seconds |
| Avg view duration | 0:19 (35.4 % of 0:53) | |
| Retention curve | ~100 % to ~1.5 s → ~62 % at ~5 s → ~45 % at ~10 s → ~33 % at ~18 s → ~25 % at ~26 s → ~15 % at ~50 s → steep drop in the last ~2 s | The big loss is 1.5–5 s; after ~20 s the curve is nearly flat (whoever stays, stays) |
| Watch time | 1.9 h | |
| Subscribers | +1 (from the Shorts feed) | |
| Distribution | burst of ~550 views in the first hours, a second push ~day 0.7 (to ~850), then a plateau at ~1K | The feed gave it two test waves and stopped, consistent with a 28 % stay rate |

## Diagnosis (frames 0–8 s, `EP002_short_hf_v1_light.mp4`)
- **Frame 0:** Quest from **behind** (no face, no emotion) and a caption that starts mid-sentence ("But there is one…").
  Nothing at feed size says "stop".
- **0.5–3.5 s:** an empty landscape (castle, then a road) with no character, while the line runs on. This is exactly
  where the curve falls hardest.
- **The answer "You." lands at ~4 s:** too late; most of the 72 % had already swiped.
- **4–8 s:** a list ("New graphics. An orchestra. Voices. Modern controls.") with back views and objects, so there is no face to connect with.
- **Length 53 s:** the flat tail shows whoever stayed liked it, but the length dilutes the average. This confirms the
  20–25 s rule (Producer, 2026-10-14).

## What it confirms in Short #2 v4.3 "Player Two" (22 s)
- Frame 0 = split screen with **two faces** and labels (VETERAN / NEW PLAYER): the frame-0 fix is already in.
- The 0–2 s hook is a complete line plus the meter climbing; there is no empty landscape.

## Rules taken for every next Short (added to `shorts-retention-critic`)
1. Frame 0 shows a **face with emotion** (never only a back view or an empty plate) plus a **complete** readable statement.
2. No shot without a character or a clear focal subject in 0–3 s.
3. The answer or twist the title promises arrives by ~2 s, or the open loop is stated by then.
4. Target a stay rate ≥ 50 % (feed benchmark for growth); compare every Short at 48–72 h.
