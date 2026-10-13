# Pilot · 5 candidate questions · 2026-10-13

Channel: **Ten Thousand Dots / Diez Mil Puntos** (Producer's choice, 2026-10-13). Tagline: *Tiny systems, explained
with dots.* / *Pequeños sistemas, explicados con puntos.*

Method: YouTube search pages read directly on 2026-10-13 (view counts as shown that day, rounded), Google/YouTube
autocomplete (`suggestqueries.google.com`, `ds=yt`) for what people actually type, plus web search for the primary
science. Competition counts are a snapshot; they move.

Context that shapes the pick: at least three channels launched the same premise (@TinySystemsExplained,
@TinySystemsHQ, @DotSociety), and a swarm of new, probably agent-run channels is posting 2-4 minute "why does X happen"
videos every day (Curiographer, AlmostObvious, How The Day Works, Small World Explained, Wonderably, Hidden Rules,
The Math Behind It, Flow Labs, Voxplain, The Long Why, Antrivia...). Almost all sit under 300 views. So the premise is
not our edge. Our edge has to be (1) a **real, sourced story** nobody else tells, (2) a **sim that is a character**,
not a diagram, (3) a **payoff the viewer can use tomorrow**, and (4) a question where **no definitive video exists yet**.

---

## 1 · Why do buses come in threes? (bus bunching) **RECOMMENDED**

- **Break:** six buses circle a loop, perfectly spaced. One bus loses twenty seconds to a slow boarder. A few laps
  later: a long empty gap, then three buses nose to tail. Our dot has waited the whole time.
- **Aha:** a late bus finds more people waiting, so it stops longer, so it gets later (feedback loop). The bus behind
  finds empty stops and catches up. Gaps that grow keep growing. Bonus aha: bunching **doubles your average wait** with
  the same number of buses (random-incidence / inspection paradox). Twist: the fix is to make buses **wait on purpose**.
- **Real story (the winner):** Georgia Tech, Atlanta. Bartholdi & Eisenstein told drivers to *abandon the schedule*;
  each bus paused at the end of the line according to how far back the next bus was. Under the old schedule the closest
  two buses came was **1 second** apart; under the new rule, 2 min 28 s. When they pulled a bus out, the rest re-spaced
  themselves with nobody steering (Transportation Research B, 2012). Everything checkable: see `FACTS.md`.
- **Search demand:** the question is typed verbatim. YouTube autocomplete for "why do buses come" → **"why do buses
  come in threes"** (first suggestion); "bus bunching" autocompletes on its own. It is a universal, recurring annoyance
  (a book is titled after it: *Why Do Buses Come in Threes?*, Eastaway & Wyndham). Transit agencies keep answering it
  themselves (York Region Transit video 1.7K; CTA "Ask CTA: Why does bus bunching happen?" 4.2K; Sound Transit blog
  "My bus was late, then two came at once. Why?"; WBEZ Curious City), which is a strong sign riders keep asking.
- **Competition (2026-10-13):** no definitive video. Biggest: RMTransit "Bunching: A Transit User's Worst Nightmare?"
  **101K** (transit-enthusiast framing, talking-head). DoingMaths "Why Do Buses Come in Threes?" 1.3K. CTA 4.2K, YRT
  1.7K. Then ~8 agent-style videos from the last 6 weeks, all < 300 views. Interactive explainers exist (setosa.io
  "Bus Bunching Explained Visually", 2015; Lehe & Hess "Why do buses bunch?") but are not videos. Spanish: nothing
  found on "por qué los buses/camiones llegan juntos". **The canonical slot is open in both languages.**
- **How we differ:** the Georgia Tech experiment (the "1 second" number) and the counter-intuitive fix are absent from
  every video we found; the 10,000-dot random-arrival sim makes the waiting paradox visible (and nods to the name);
  a practical tip at the end (which of the three buses to take).
- **Sim feasibility (CPU, numpy, seeded):** trivial-to-moderate. 1-D ring of length L, 6 buses, 12 stops, Poisson
  passenger arrivals per stop, dwell = door time + k·boardings, no overtaking (or optional). Then the holding rule
  `pause = a × time-until-next-bus` at one control point. 10,000-dot timeline is a histogram drop. Renders in seconds.
  Fully deterministic; we can pick a seed whose bunching reads clearly.
- **Short potential:** high. "Why three buses show up at once, in 50 seconds" + the "take the second one" tip.
  Loopable: ends where it starts (three buses).
- **ES-419 appeal:** very high. Buses are daily life across Latin America (camión, colectivo, micro, guagua, bus); the
  script plays with the regional names. Zero Spanish competition found.
- **Mascot arc:** the impatient dot at stop 7 who hates when a bus "just sits there" → ends up the one telling the bus to
  wait.

## 2 · Why do traffic jams appear out of nowhere? (phantom jams)

- **Break:** cars on a ring road, no accident, no merge; a jam forms and travels backwards.
- **Aha:** over a critical density, small braking over-reactions amplify (Sugiyama et al., *New J. Phys.* 10, 033001,
  2008: 22 cars on a 230 m circle, jam forms with no bottleneck).
- **Search:** strong. Autocomplete "phantom traffic" → jam, circle, video, animation, experiment, explained.
- **Competition:** brutal. CGP Grey "Traffic Has a Perfect Solution. Humans Are the Problem." **44.6M**; New Scientist
  "Shockwave traffic jams recreated for first time" (the Sugiyama footage) **4.3M**; SotonTRG "Phantom Traffic Jams"
  3.2M; TED-Ed (Seibold) 622K; Silverfox1100 637K; agent channels posting it weekly.
- **Sim:** easy (Intelligent Driver Model or optimal-velocity model on a ring). Visually great.
- **Short:** high. **ES-419:** high (tráfico/trancón/embotellamiento).
- **Verdict:** best saved as video 2-4 once the channel has a style people recognise; as a pilot it looks like a copy of
  the most famous traffic video on YouTube.

## 3 · Why is the other line always faster?

- **Break:** you pick one of three checkout lines; the other two keep pulling ahead.
- **Aha:** with three lines you are in the fastest one only ~1/3 of the time; random service-time variance; the
  snake (single) queue fixes the unfairness but not the average.
- **Search:** strong conceptually but autocomplete is thin ("why does the other line" returns nothing); people search
  "why the other line is faster".
- **Competition:** engineerguy (Bill Hammack) "Why the other line is likely to move faster" **1.25M**; plus **six** agent
  videos in the last two weeks (The Math Behind It, Voxplain, Ancient Answers, The Long Why, Subconscious Curiosities,
  Stick & Story). Saturating fast.
- **Sim:** easy (M/G/1 queues). **Short:** very high. **ES-419:** high (la otra fila).
- **Verdict:** great Short, weak pilot: crowded right now and the classic answer is well known.

## 4 · Why do competing shops open right next to each other? (Hotelling)

- **Break:** two ice-cream dots on a beach start at the quarter marks and drift to the middle, back to back.
- **Aha:** Hotelling's "Stability in Competition" (*Economic Journal*, 1929): each seller grabs customers by moving
  toward the rival; the equilibrium is the centre, worse for beachgoers.
- **Search:** medium ("why do shops open next to each other" autocompletes).
- **Competition:** TED-Ed (Jac de Haan) **7.4M**; WSJ "The Economics Of" 1.7M on adjacent strategy; agent videos.
- **Sim:** easy (agent-based, 1-D then 2-D). **Short:** medium. **ES-419:** good (farmacias juntas, gasolineras).
- **Verdict:** the TED-Ed lesson owns the frame; our sim would be prettier but the story is the same.

## 5 · Why do crowds walking in opposite directions form lanes?

- **Break:** two crowds walk into each other in a corridor; chaos; then, with no one deciding, lanes appear.
- **Aha:** self-organisation from tiny sidestep preferences (social-force model, Helbing & Molnár, *Phys. Rev. E* 51,
  4282, 1995).
- **Search:** weak. Nobody types this question (autocomplete returns nothing useful); "pedestrian lane formation" top
  video is an ETH/physics lab clip at 20K.
- **Competition:** almost none (lab clips, one agent video at 12 views).
- **Sim:** moderate (O(n²) forces; fine for ~1,000 agents on CPU with a grid). The most beautiful of the five.
- **Short:** very high (satisfying visual). **ES-419:** medium.
- **Verdict:** a perfect Short or interlude; as a pilot it has no search door, and the README lesson is that early on
  search is the door.

---

## Recommendation: **#1, Why do buses come in threes?**

1. **The question is typed exactly as we would title it**, in both languages, and the definitive video does not exist
   (best on YouTube: 101K; nothing in Spanish).
2. **A real, fact-checked story only we tell:** a university route in Atlanta where two buses once came **one second**
   apart, a published fix that tells drivers to *ignore the schedule*, and an experiment where buses re-spaced
   themselves after one was removed. All in one open paper (numbers in `FACTS.md`).
3. **Three ahas, not one:** the feedback loop, the doubled wait (shown with 10,000 random dots: a quiet nod to the
   channel name), and the paradox that *waiting gets you there sooner*. That third one is what people share.
4. **Useful tomorrow:** which of the three buses to take.
5. **Craft wins:** the sim is a little world with characters (buses that "get tired", a dot that waits), not a chart;
   it sonifies beautifully (every boarding a tick, three buses arriving = a chord). Cheap on CPU and deterministic.
6. **Mascot arc built in:** impatient rider → the one who tells the bus to wait (callback).

Risks: agent channels are posting bus-bunching shorts; we must win on story and finish, and publish soon. Phantom
traffic (#2) is the obvious follow-up and can reference this video ("same loop, but cars").

## Sources (accessed 2026-10-13)
- YouTube search result pages (read directly): "why do buses come in threes", "bus bunching", "why do buses arrive
  together", "phantom traffic jam explained", "why is the other line always faster", "why do competing stores open next
  to each other", "friendship paradox", "pedestrian lane formation", "why crowds form lanes", "por qué los autobuses
  llegan juntos", "por qué los camiones llegan juntos".
- Autocomplete: https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=why%20do%20buses%20come
- Bartholdi & Eisenstein 2012, *Transportation Research Part B* 46: 481-491, doi:10.1016/j.trb.2011.11.001 (PDF:
  https://gwern.net/doc/reinforcement-learning/multi-agent/2012-bartholdi.pdf); project page
  https://www2.isye.gatech.edu/~jjb/buses/buses.html
- Sound Transit: https://www.soundtransit.org/q-my-bus-was-late-then-two-came-once-why ; WBEZ:
  https://www.wbez.org/stories/why-buses-arrive-in-bunches/4e768974-dd32-47f7-97e8-37951507e43d ; setosa.io/bus (via
  https://gigazine.net/gsc_news/en/20150522-bus-bunching-explained-visually); CityLab on Lehe & Hess
  https://www.citylab.com/transportation/2015/05/a-nifty-visualization-of-the-vicious-cycle-of-bus-bunching/393818/
- Sugiyama et al. 2008: https://ir.library.osaka-u.ac.jp/repo/ouka/all/93262/NewJPhys_10_033001.pdf ;
  https://sciencedaily.com/releases/2008/03/080304075707.htm
- TED-Ed Hotelling lesson: https://www.ted.com/talks/jac_de_haan_why_do_competitors_open_their_stores_next_to_one_another
