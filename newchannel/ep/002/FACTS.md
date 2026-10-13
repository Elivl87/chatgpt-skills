# Pilot · FACTS · "Why do buses come in threes?" · 2026-10-13

Every number or claim the narration uses (EN and ES-419), its primary source, and its status.
Status: **verified** = matches the primary source as worded · **reworded** = narration changed to match what the source
supports · **dropped** = not in the script. "Model" = a property of our own simulation, not a claim about the world
(the script calls it a toy model). Sources accessed 2026-10-13.

## Primary sources

- **[B&E]** Bartholdi, J.J. III & Eisenstein, D.D. (2012). "A self-coördinating bus route to resist bus bunching."
  *Transportation Research Part B* 46: 481-491. doi:10.1016/j.trb.2011.11.001. Full text read via
  https://gwern.net/doc/reinforcement-learning/multi-agent/2012-bartholdi.pdf (pages 481-491).
- **[B&E-web]** Bartholdi's project page, Georgia Tech ISyE: https://www2.isye.gatech.edu/~jjb/buses/buses.html
- **[L&O]** Larson, R.C. & Odoni, A.R. *Urban Operations Research* (Prentice-Hall, 1981; free online edition hosted by
  MIT), section 2.13 "Random incidence": https://web.mit.edu/course/other/urban_or_book/OldFiles/www/book/chapter2/2.13.html
  Supporting: MIT 1.041 lecture (C. Wu, Spring 2026), "Expected waiting time / inspection paradox", citing L&O ch. 2:
  https://web.mit.edu/1.041/www/lectures/L6-probabilistic-concepts-2026sp.pdf
- **[F&E]** Fletcher, G. & El-Geneidy, A. (2013). "Effects of fare payment types and crowding on dwell time."
  *Transportation Research Record* 2351: 124-132. https://tram.mcgill.ca/Research/Publications/Translink_Dwell_Analysis.pdf
- **[N&P]** Newell, G.F. & Potts, R.B. (1964). "Maintaining a bus schedule." *Proceedings of the 2nd Australian Road
  Research Board Conference*, vol. 2, pp. 388-393. (Original not online; citation and dating taken from the reference
  list of [B&E], p. 491, which states "Bus bunching has long been understood (for example, Newell and Potts, 1964)".)
- **[Hud]** Mayers, M. & Bamford, D. (University of Huddersfield), "Transport experts explain why buses come in threes –
  and which one you should get on", *The Conversation*, 30 July 2018:
  https://theconversation.com/transport-experts-explain-why-buses-come-in-threes-and-which-one-you-should-get-on-99348
- Supporting (mechanism, agency voice): Sound Transit, "Q: My bus was late, then two came at once. Why?"
  https://www.soundtransit.org/q-my-bus-was-late-then-two-came-once-why ; Berkeley Engineering (2015)
  https://engineering.berkeley.edu/2015/06/why-do-buses-always-come-bunches

## Claim table

| # | Claim in the script (EN wording) | Source | Status | Note |
|---|---|---|---|---|
| 1 | Toy route: 12 stops, 6 buses, one every 6 minutes | Model | model | Chosen to echo the real Georgia Tech route (#14). Script says "toy route". |
| 2 | One slow boarding costs one bus ~20 s, and that alone leads to bunching (in our sim) | Model | model | Simulator must pick a seed where a single 20 s disturbance visibly grows into a 3-bus clump; if not reproducible, change the narrated number to the one the sim uses. |
| 3 | "Headway" = the time between one bus and the next; service is best when headways are equal | [B&E] p. 481: "service is best when times between successive bus arrivals (headways) are equal" | verified | |
| 4 | When buses come every few minutes, almost nobody checks the timetable; people just turn up | [B&E] p. 481: "riders typically ignore schedules with headways less than 10–12 min (Minser, 2009)" (CTA market research) | reworded | Script says "almost nobody checks the timetable", not a %; ES same. |
| 5 | Getting on a bus takes roughly two to four seconds per person (pass, card, coins) | [F&E] p. 129: pass 2.2 s, magnetic swipe 3.0 s, cash 4.2 s per passenger (Vancouver, TransLink) | verified | "Researchers in Vancouver timed it". Rounded range 2-4 s is faithful (2.2-4.2). |
| 6 | A late bus meets more passengers, stops longer, falls further behind; the bus behind meets fewer, catches up; big gaps grow, small gaps shrink | [B&E] p. 481: "the larger the headway, the more strongly it tends to grow, because the trailing bus will likely meet more passengers than average… a headway that has become smaller will tend to shrink even more" | verified | Also [Hud], Sound Transit. Note: B&E use "trailing bus" for the bus at the end of the big gap; script avoids the jargon. |
| 7 | This is called a feedback loop ("positive" feedback, not good for you) | Standard term; mechanism per #6 | verified | Wording is explanatory, not a cited claim. |
| 8 | Buses often come in twos or threes | [Hud] ("buses… often come in threes"); Sound Transit ("two came at once") | reworded | Hook asks "why do buses come in threes?" (the searched phrase); body says "two, three, sometimes more" — never "always three". |
| 9 | Bunching wastes capacity: front bus packed, bus behind nearly empty | [B&E] p. 481: "Bunching also wastes capacity because trailing buses may be nearly empty"; [Hud] first bus "vicious circle of delay and overcrowding" | verified | |
| 10 | With evenly spaced buses every 6 min, a person arriving at a random time waits 3 min on average (half a gap) | [L&O] 2.13: perfectly regular headway T0 → wait uniform on [0, T0], mean T0/2 | verified | 6/2 = 3. |
| 11 | Same 6 buses bunched in pairs (gaps of 0 and 12 min, same 6-min average) → average wait doubles to 6 min | [L&O] 2.13: E[wait] depends only on mean and variance of the gap: E[V] = E[Y]/2 + Var(Y)/(2E[Y]) (= E[Y²]/2E[Y]); L&O's own example uses buses "in pairs" with gaps 0 and 20 min. Our arithmetic: E[Y]=6, E[Y²]=(0²+12²)/2=72 → 72/12 = **6 min** | verified | L&O's worked example is a half-day-pairs mix (50 % worse); full-day pairs = 100 % worse, same formula. Arithmetic checked. |
| 12 | Most random arrivals land in the long gaps "because that's where most of the time is" (random incidence / inspection paradox) | [L&O] 2.13; MIT 1.041 lecture: "The inspection paradox arises whenever the probability of observing a quantity is related to the quantity being observed" | verified | 10,000-dot drop is a sim visual (model); with 0/12 gaps, 100 % of arrivals land in the 12-min gaps. |
| 13 | Bus bunching was described by researchers back in 1964 | [N&P] via [B&E] p. 482 | verified | Script: "described it in 1964", no claim that they were the first. |
| 14 | Georgia Tech, Atlanta: main campus route, ~5,000 riders a day, 6 buses, scheduled every 6 minutes | [B&E] p. 486: "most heavily traveled of the campus bus routes with around 5000 riders each day"; "six buses circulating the route, and the target schedule calls for 6 min headways" | verified | "During most of the day during the academic year". Script says "around five thousand riders a day". |
| 15 | On a scheduled day, the shortest gap between two buses was 1 second; the longest almost 20 minutes | [B&E] p. 487: "The smallest headway under our scheme was 2 min 28 s, compared to only 1 s under scheduled service on a comparable day… largest headway under our scheme was 14 min 59 s, but 19 min 45 s under scheduled service" | verified | 19:45 → "almost twenty minutes". |
| 16 | Researchers John Bartholdi and Don Eisenstein told drivers to forget the schedule and just drive | [B&E] p. 486: "we instructed the drivers to abandon the schedule and ignore headways. Instead, they were to simply drive with the flow of traffic"; [B&E-web] "Abandon the schedule!" | verified | Public academics named as authors of a published paper; not portrayed (no likeness, they are never drawn). Eisenstein's first name appears as "Don" on [B&E-web] and "Donald D." on the paper. |
| 17 | At the end of the line each bus checks how far back the next bus is and waits about half of that time, then goes | [B&E] p. 482-483: bus 1 pauses at the control point for time a·h (h = headway of the trailing bus, i.e. time until the next bus arrives); p. 490: "an a near 0.5… means that at equilibrium each bus is delayed by half the natural headway"; in the experiment a = 7/12 ≈ 0.58 | reworded | Script: "about half". Real experiment used two control points and a minimum gap b = 5 min; script simplifies to "the end of the line" (the control points were at the two ends). In the field, a student at each control point computed departure times from NextBus GPS predictions; the tablet signal came later ([B&E-web]). Script does not claim a tablet. |
| 18 | The rule makes each bus's gap an average of its own and its follower's, so spacing evens out; each bus only needs to "look back" | [B&E] p. 483: "changes the headway of each newly arrived bus to a weighted average of its former headway and the former headway of the trailing bus"; [B&E-web]: needs only "the estimated time until the next bus arrives" | verified | |
| 19 | Shortest gap went from 1 s to almost two and a half minutes; longest to about fifteen | [B&E] p. 487 (2 min 28 s; 14 min 59 s) | verified | |
| 20 | The average gap got shorter, so people waited less | [B&E] p. 486-487 Fig. 2 (avg headway 6:00 on the trial day vs 6:18 and 6:28 the two previous weeks; "passenger waiting times were shorter and more reliable") | verified | |
| 21 | They removed a bus on purpose; the two remaining buses re-spaced themselves on their own, no dispatcher | [B&E] p. 487 Experiment 2: summer, three buses, one removed on 21 July; "headways of successive arrivals reëqualized at about 17 min"; [B&E-web]: "without management intervention" | verified | "No radio calls" is our gloss of "without any direction by management or intention of the drivers". |
| 22 | Drivers said they liked not having to watch the clock | [B&E] p. 487: "they liked not having to check the clock constantly… freed them to concentrate on safe driving" | verified | |
| 23 | Georgia Tech then used it full time (from 2013) | [B&E-web]: full-time use began August 2013 | verified | Author's own page (not independent). Script keeps it to "kept using it". |
| 24 | If three buses arrive together, researchers suggest taking the second; the third may be told to skip stops | [Hud] | reworded | Framed as advice from named-institution researchers ("transport researchers in the UK suggest"), not as a law. Their caveat (first bus is fine if it has empty seats) kept in ES/EN as "unless the first one has seats". |
| 25 | 10,000 dots ≈ about two days of riders on that route | [B&E] p. 486 (~5,000/day) | verified | Optional line (nod to the channel name); 2 × 5,000 = 10,000. |
| 26 | Planners pad timetables with spare minutes and tell early buses to wait for their slot; it helps a little but can't stop the loop | [B&E] p. 482: under target schedules buses are delayed "at certain key stops" if ahead of schedule, and "if behind, a bus can forfeit some or all of the planned delay"; schedule adherence "is undermined by the tendency of headways to collapse" (abstract) | verified | "Helps a little" is our summary of B&E's comparison (schedule was the first to bunch in their simulation, p. 488-489). |
| 27 | The two-four-second figures, the six-bus route, the 1964 date, and Atlanta numbers are identical in the ES-419 script | — | verified | ES-419 adds only regional bus names (camión, colectivo, micro, guagua), which are vocabulary, not claims. |

## Dropped or not used

| Claim seen during research | Why not used |
|---|---|
| "Bus bunching is the most common customer complaint at the Chicago Transit Authority" ([B&E] p. 481, "at the time of this writing", citing a 2009 personal communication) | Time-bound (c. 2011) and second-hand; can't be verified as current. **Dropped.** |
| TCQSM per-passenger boarding times (2.5-4.2 s) | Only found via secondary papers citing the 2003 edition; replaced by the primary measurement [F&E]. **Dropped (replaced).** |
| "Buses always come in threes / studies show threes" | [Hud] asserts it without a cited study. **Reworded** to "two, three, sometimes more". |
| "Japan fixed bus bunching" (title of a recent agent-channel video) | No primary source found. **Dropped.** |
| Exact jam/disturbance timings from secondary write-ups (e.g. "jam in about a minute") | Belong to the traffic topic; not used. |
| Holding at stops reduces but cannot eliminate bunching (Berkeley 2015) | True per source but not needed; omitted for length. |
| Chicago route 63 simulation results in [B&E] | Simulation, not field data; omitted to keep the story to the real route. |

## People
No private individuals portrayed. Named: John J. Bartholdi III and Donald (Don) D. Eisenstein, as authors of a
published paper (public, professional capacity); never drawn, voiced or impersonated. Drivers and riders are anonymous
dots. No third-party logos (Georgia Tech, MARTA, NextBus are not shown as marks; the route is drawn as our own map).
