# EP001 Short #3 (Farming Simulator) · full Hyperframes · brief + handoff for a fresh session (2026-10-19)

Producer ask (2026-10-19): "uno de Farming Simulator full Hyperframe máximo". Template = EP003 Short #1
(`tools/hyperframes_ep003_short1/`: seg.py placed segments, stage_assets.py, build.py, gates.sh, render.sh with
PLATFORM=tiktok; storyboard + critics in `docs/publish/EP003/short1/`).

Read first: `secondquest/CLAUDE.md` (Shorts 20–25 s, frame 0 text + loop, every text has a source, token budget),
`docs/publish/TIKTOK_PLAN.md`, `docs/publish/CHANNEL_STATS_2026-10-15.md` (frame 0 = face + icon + conflict).

Note: the rule "EP001 is published and final" forbids re-rendering the episode. A new Short from its existing voice and
art is a new deliverable, made only because the Producer asked for it (2026-10-19). The episode itself is not touched.

Inputs: voice = `public/episodes/ep001_farming/audio/narration.wav` (word times `episodes/ep001/timings.json`
"cues"); art = `public/art/episodes/ep001/` (backgrounds, characters, props, quest) + core art; 3D in `tools/props3d`
(free; a 3D tractor is the companion candidate). 0 credits.

## Concepts (Producer picks one)
| | Concept | Frame 0 | Lines (verbatim, EP001 timings) | Loop |
|---|---|---|---|---|
| **A (recommended)** | **The work loop** | Quest close-up, exhausted grin, on the tractor; text **"A GAME ABOUT… GOING TO WORK?"** | l01–l05 "wake up… go to work… make money… buy extremely expensive equipment… and then…" → l11–l12 "your greatest enemy… is a field that's slightly larger than you expected" → l17 "getting genuinely excited about buying a bigger tractor" → l06 "go back to work." (~21 s + card) | "go back to work." → frame 0 → "wake up…": the game's own loop is the Short's loop |
| B | Your greatest enemy is a field | Quest vs a gigantic field, text **"NO DRAGONS. JUST THIS."** | l08–l12 → l13–l17 (~19 s) | the field gets bigger on the replay |
| C | The bigger tractor | Quest hugging a tractor, text **"HE'S SAVING FOR A TRACTOR"** | l13–l17 (+ l03–l04) | overlaps EP001 Short #2 (tractor price): lower priority |

A changes the line order (l06 moves to the end); that is the Producer's call at storyboard approval.

## Steps (same as EP003 Short #1)
1. Frame 0 (1080x1920) + storyboard 6–8 beats → Producer approval. 2. Build, draft iterations at 540. 3. Gates
(`gates.sh`), 720p critics' pass (frame-critic + shorts-retention-critic, final round only), fix, 1080 master + TikTok
variant (end card "FULL EPISODE ON YOUTUBE"). Send < 30 MB directly. At most one Sonnet builder; no polling.
