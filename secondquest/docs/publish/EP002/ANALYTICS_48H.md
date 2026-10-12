# EP002: analytics at ~48 h (2026-10-12, Producer's YouTube Studio app screenshots, "since published")

Video: "Zelda Ocarina of Time Remake: The One Th…" (published 2026-10-09/10, ~6:55 long).

| Metric | EP002 (48 h) | EP001 (day 6) | Reading |
|---|---|---|---|
| Views | **7** (5 unique viewers; 1 day still processing) | 596 | Almost no distribution yet |
| Impressions | **44** (search 41, browse 2, suggested 1) | 2,742 (browse 2.6K) | YouTube has **not** tested it on Home at all |
| **Impressions CTR** | **9.1 %** | 3.5 % | 2.6× EP001; the packaging works on the people who see it (tiny sample) |
| Avg view duration | **2:47 (~40 % of 6:55)** | 1:53 (19 % of 9:45) | Twice EP001's share of the video; viewers who come stay longer |
| Retention at 0:30 | not shown ("not enough data") | 43 % | Need more views; ask again at day 7 (Studio CSV export → `scripts/retention_read.py`) |
| Watch time | 0.2–0.3 h | 3.9 h | |
| Traffic (views) | **YouTube search 4 (57 %), browse 3 (43 %)** | Home 96 % | The opposite of EP001: found by search |
| Search terms | "oot remake" 1, "zelda ocarina of time remake" 1 | — | The title's keywords are exactly what people type |
| Subtitle language | **Spanish (LatAm) 42.9 %**, none 28.6 %, English 14.3 % | ES 28 % | The Spanish-speaking audience keeps growing |
| Subscribers | 0 | — | |
| Card to EP001 | no data in the screenshots | — | |

Caveat: 7 views is far too small to be statistically meaningful; this reads direction, not proof.

## Diagnosis
- **Packaging and content are healthy where they are seen:** CTR 9.1 % (EP001 3.5 %) and ~40 % of the video watched
  on average (EP001 19 %). The EP002 rules (curiosity title with the game's searchable name, Quest 1d thumbnail, hook
  that pays the thumbnail in the first 5 s) are moving the right numbers.
- **The bottleneck is distribution, not the video:** 41 of 44 impressions came from search; Home gave 2. A small
  channel gets a first Home test from its subscribers/past viewers; with almost none, YouTube waits for search and
  external signals. EP001's Home push did not carry over (its viewers were not retained as an audience).
- **Search is a real door for this channel:** the remake/news angle ("Ocarina of Time remake") brought people who
  were looking for it. Timely, searchable topics are worth more than we assumed.
- **Spanish is the biggest single audience** (43 % via ES subtitles).

## Actions (Producer decides; all free)
1. **Seed Home:** share EP002 where its people are (Zelda/OoT remake communities, Reddit threads about the remake
   news, Discords), so YouTube gets the first non-search sessions; post the trailer Short now if not up yet (related
   video = EP002).
2. **Search on purpose:** add the remake keywords to the description's first 2 lines and to the chapters
   ("Ocarina of Time remake", "OoT remake", "Zelda remake"); keep Test & Compare on the curiosity vs search title.
3. **Reactivate EP001 now, through search, not Home** (the video stays final; packaging only): a searchable title
   B in Test & Compare ("Farming Simulator 25: why do millions play a game about work?") and a description with the
   game name + year; the EP002 card/end screen already points to it. Best moment: **this week**, while EP002 is
   bringing search visitors, and again the day EP003 publishes (EP003 end screen → EP002, EP002 → EP001 chain).
4. **For EP003 (How to Fish):** pick the title around what people search ("How to Fish game", "How to Fish 10
   million") — the 10.1 M sales news is searchable; publish while the news is warm; ES title/description and the
   Bram ES dub from day one (43 % Spanish).
5. **Day-7 check:** ask for the retention CSV (Studio → Analytics → Engagement → export) to read the 30-s mark
   with `scripts/retention_read.py --episode ep002`.
