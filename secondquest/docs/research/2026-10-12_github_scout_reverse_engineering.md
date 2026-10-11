# GitHub scout: reverse engineering what works on YouTube (2026-10-12)

Scope: outlier finding, packaging/hook/pacing analysis, reference-video skills, YouTube strategy skills. Nothing was installed or run.
Method: web search plus README/LICENSE fetches (raw.githubusercontent.com). Items marked (V) were verified from the README/LICENSE; items marked (U) come only from search snippets or my own prior knowledge and must be checked before adoption.
Our situation (EP001, D6): CTR 3.5 %, 96 % Home traffic, 43 % retention at 0:30, AVD 19 %. The weakest links are packaging and the first 30 s, so the ranking favours tools that inform those two.

## Ranking (best first)

| # | Candidate | Role | Licence | Keys / cookies | CPU | Verdict |
|---|---|---|---|---|---|---|
| 1 | AdesiaHQ/bangermap-integrations (MCP + skill `youtube-outlier-research`) (V) | Outlier finder: video views / channel median of the last 30 uploads (>=7 days old, Shorts and long-form split at 180 s). Tools: find_outliers, channel_baseline, compare_channels, sweep_niche | MIT | Free YouTube Data API v3 key (10k units/day). No cookies, no middle server | Yes (API only) | ADOPT. Best direct fit for "find outliers in our niche" |
| 2 | yt-dlp (metadata mode) (V) | Metadata, thumbnails, subtitles, chapters, heatmap ("most replayed") fields without a key | Unlicense (git/PyPI). Release binaries bundle GPLv3+ code, so use the pip package | None for public videos. NEVER use `--cookies` / `--cookies-from-browser` | Yes | ADOPT with limits (see ToS section) |
| 3 | AgriciDaniel/claude-youtube (V) | 14 sub-skills: analyze (funnel diagnosis, retention-curve classes, traffic sources), hook (5 variants + drop-off risk), thumbnail brief (3 A/B variants), seo, competitor, ideate | MIT | None required. Optional: Data API key; OAuth (own channel only); DataForSEO and NanoBanana are paid/extra, skip | Yes | ADOPT as a prompt library. Read the SKILL.md files first and cherry-pick; do not install wholesale |
| 4 | PySceneDetect (Breakthrough) (V) | Cut detection (ContentDetector/AdaptiveDetector). Gives shots per minute and the cut-rhythm of reference videos | BSD-3-Clause | None | Yes, fast | ADOPT. Pacing metric for reference videos |
| 5 | SystemRandom faster-whisper (CTranslate2) (U) | Local transcripts with word timestamps, so words per minute, pauses and hook text | MIT (my knowledge) | None | Yes with `small`/`base` int8; slow-ish for 10 min, fine | ADOPT as fallback when captions are missing |
| 6 | jdepoix/youtube-transcript-api (V) | Fetches existing captions fast | MIT badge (V) | None; no cookies (feature broken) | Yes | USE WITH CAUTION. Uses an undocumented endpoint; cloud IPs are often blocked. Fallback chain: yt-dlp subtitles -> faster-whisper |
| 7 | TheWhiteWater/tube-bridge (V) | Self-hosted YouTube MCP: search, video info, trending, transcripts, single frames, comments, local semantic corpus (SQLite + sqlite-vec, BGE-small via fastembed) | MIT | 14 of 17 tools need no key; comments/channel tools need the Data API key | Probably (small embedder; untested) | CONSIDER. Overlaps with 1 + 2 + 6 but one MCP; same ToS notes as yt-dlp and transcript-api. Maintenance unknown |
| 8 | shipshitdev youtube-video-analyst skill (U) | Transcript-only deconstruction: hook architecture, structure blueprint, retention mechanics, pacing (11 sections) | Not stated in the root README (V) | None | Yes | CONSIDER as a prompt template. Its repo listing could not be confirmed (README does not list it); verify the path and licence before reuse |
| 9 | OpenMontage (calesthio) (V) | Reference-video analysis (transcript, pacing, scenes, keyframes, style) feeding a production plan; uses PySceneDetect + faster-whisper | **AGPL-3.0** | All keys optional | Free path plausibly CPU | STUDY ONLY. Do not copy code into our pipeline (AGPL). Read the approach, re-implement with 4 + 5 |
| 10 | bradautomates/head-of-content (youtube-research) (V) | Outlier detection via TubeLab API, Gemini video analysis of hooks/structure, thumbnails and transcripts, content plans | MIT | TubeLab key (free tier, paid from about $29/mo), Gemini key (free tier), Apify (paid for X) | Yes | MIT for the structure. Method worth copying (outlier -> download metadata -> analyse top N -> hook formulas); but it depends on third-party paid or keyed services. Skip the TubeLab part, use 1 instead |
| 11 | Krudev/TubeCLIP (Hugging Face, not GitHub) (V) | Fine-tuned CLIP Large predicting view tier (10k-100k / 100k-1M / 1M+) from thumbnail + title; 67 % test accuracy on 3 classes | **CC BY-NC 4.0** | None | Inference on CPU possible but heavy | REJECT for production (non-commercial, channel is monetised; weak signal; trained without channel-size context). Fine as a curiosity only if the Producer accepts the licence risk |
| 12 | Generic building blocks: open_clip (MIT), EasyOCR / Tesseract (Apache-2.0), MediaPipe face detection (Apache-2.0), HueHunter (MIT) (U) | DIY thumbnail features: colour palette, text size/contrast, face count and size, CLIP similarity to outlier thumbs | See left (my knowledge; verify) | None | Yes | BUILD small scripts. Avoid InsightFace pretrained models (non-commercial terms) |
| 13 | manojbajaj95/claude-gtm-plugin youtube-video-hook (U) | Hook psychology for first 5-15 s | Repo MIT (V); skill not confirmed in the README | None | Yes | LOW PRIORITY. Could not confirm the skill exists in the repo; lift ideas only |
| 14 | jeremylongshore/claude-code-plugins-plus-skills (yt-research etc.) (V licence) | Large skill collection with a YouTube research skill | MIT | Unknown | Yes | LOW PRIORITY. Quality unverified, bulk collection |
| 15 | ishuagrawal/skills video-by-reference | Already known to the team | n/a | n/a | n/a | Keep for style/cuts/palette/audio of a single reference video |

Note on row 5: the "SystemRandom" label is a typo for nothing; the tool is simply faster-whisper (SYSTRAN/faster-whisper).

## Rejected or not found

- Apify "YouTube Outlier Finder" actors, OutlierKit, 1of10, Chrome extensions: commercial, paid per run or per month. Excluded by the "no paid APIs" rule.
- Kaggle-style trending-video notebooks (ashutoshkrris, waittim, meyhaa, piyush033): student analyses of the old US/IN trending dataset. Not applicable to gaming video essays in 2026.
- Hosted thumbnail "CTR predictors" (tubethumb, fundy, CreatorML, HF Space with runtime error): closed, unverifiable, and CTR is not predictable from the image alone.
- Not found: an open-source end-to-end retention-structure analyser from real audience-retention curves, and an open-source CLIP+OCR+face thumbnail scorer. The market has no strong repo here, so we build thin scripts (item 12).
- Search snippets claim the Reel Deep Dive / ootto-watch / claude-real-video skills do pacing analysis; none were opened, so they are not ranked.

## ToS and risk notes

- Official Data API v3 (item 1): the cleanest path. Quota 10,000 units/day; a search call costs 100 units, channel/video list calls cost 1. Store only the minimum needed and respect the API Services ToS (no long-term caching of API data beyond the policy window; delete or refresh stored statistics periodically).
- yt-dlp / youtube-transcript-api / tube-bridge: they fetch public pages through unofficial routes; this is a grey area under the YouTube ToS (no downloading of content without permission). Our safe use: metadata, thumbnails and captions only, low rate (a few dozen videos, sleeps), no downloading of video for redistribution, no cookies, no logged-in sessions. Downloading full video for scene analysis of someone else's video is the highest-risk step: keep it to a handful of references, local and temporary (the container is ephemeral), do not republish frames. Cloud IPs may be blocked; do not respond with proxies.
- Own-channel data: the real retention curve, CTR and traffic sources are only in YouTube Studio / the Analytics API (OAuth, own channel). Producer screenshots or CSV exports are the zero-risk route; OAuth is optional and needs a Producer-owned Google Cloud project.
- Licence flags: OpenMontage = AGPL-3.0 (study only); TubeCLIP = CC BY-NC; yt-dlp release binaries embed GPLv3+ (use the pip package); InsightFace model weights non-commercial.
- Skill supply-chain: install nothing wholesale from skill registries. Read every SKILL.md and script, pin a commit, and copy the few useful prompts into our own repo.

## Recommended use for SecondQuest

1. Outlier set: with a free Data API key (Producer adds `YOUTUBE_API_KEY`), run bangermap `sweep_niche` from 5-8 seed channels (animated game video essays) and keep outliers with a multiple of 3x or more. Output: a CSV of video id, title, views, multiple, duration, published date.
2. Packaging dataset: for the top 30-50 outliers, collect title and thumbnail through the API (thumbnail URLs are in the snippet). Compute by script: title length, number words, question marks, curiosity words, named game; thumbnail palette, face count, text word count and size, contrast. Compare with the non-outliers from the same channels (the baseline matters more than the outliers alone). Compare with our EP001/EP002 thumbnails.
3. Hook and structure: for 10-15 outliers, get captions (yt-dlp subtitles, fallback faster-whisper). Take the first 30 s: words per minute, first-sentence type (question, claim, cold open), time to the first payoff or promise, plus PySceneDetect cut count in the first 30 s. Use the claude-youtube hook prompts and the shipshitdev rubric (after reading them) as the rubric, not as a black box.
4. Close the loop: record each EP's CTR, retention at 0:30 and AVD in a small CSV next to the packaging features, so after 10-20 videos we have our own data instead of a generic model.

## Caveats

- Several facts (stars, maintenance activity, quality of the individual SKILL.md files) were not verified; the GitHub API and HTML pages are blocked from here.
- Outlier multiple = views / median; it ignores impressions and CTR, so it is correlational. Treat patterns as hypotheses to test with Test & Compare, not rules.
- Small sample: with 596 views on EP001, our own metrics are noisy; do not over-fit to one video.
