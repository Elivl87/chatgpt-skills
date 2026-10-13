# Pilot · SCRIPT (EN) · "Why do buses come in threes?" · draft v1 · 2026-10-13

Channel: **Ten Thousand Dots** (name appears only in beat 4 and beat 27; swap there if it ever changes).
Tagline: *Tiny systems, explained with dots.* Facts: every number is in `FACTS.md` (claim # in brackets).

**Narration word count: 1,006 words → 6 min 42 s at 150 wpm**; with the wordmark sting and ~1 s of air per beat ≈ **7:12** total.
Hook (beats 1-4): 80 words ≈ 32 s of voice + sting = wordmark lands at ~0:35.

**Mascot ("the dot")**: one small ink dot with a tiny face, no voice. Arc: impatient rider who hates a bus that "just
sits there" → understands → ends as the one telling the bus to wait.
**Look**: print style, 3 inks + paper + halftone + grain. Route = a rounded loop drawn like a transit map; buses =
capsule shapes in ink A; passengers = small dots in ink B; our dot = ink C with face.
**Sound**: each boarding = a soft wooden tick (pitch rises with queue length); bus doors = two-note chime; three buses
arriving together = the chime as a chord. No stock music.
**Sim states** (for the Simulator, all seeded): `S0` even spacing · `S1` one 20 s disturbance [2] → bunching ·
`S2` 10,000-dot random-arrival timeline · `S3` holding rule on (pause = 0.5 × time until next bus) · `S4` remove a bus.

---

## HOOK

### Beat 1 · The route (0:00)
> This is a bus route. Twelve stops, six buses, and one dot who would really like to go home.

- **Visual:** cold open straight into the sim, `S0`. Camera drifts over the loop; six buses evenly spaced, gliding.
  Passenger dots pop in at stops. At the end of the line a bus sits with its doors open.
- **Mascot:** at stop 7, staring at the parked bus, bouncing impatiently (setup for the callback).
- **Sound:** gentle ticks, one door chime.

### Beat 2 · Clockwork (0:09)
> On paper, a bus comes every six minutes. Like clockwork. Now watch. One bus meets one slow passenger and loses twenty seconds. That's it. That's the whole disaster.

- **Visual:** a "6:00" label pulses between each pair of buses. Zoom on one stop: a single passenger dot fumbles
  (wobbles at the door); a small "+20 s" stamp lands on that bus. Hold a beat on "That's it."
- **Mascot:** shrugs. Twenty seconds? Fine.
- **Sound:** a slightly off-beat tick on the fumble.

### Beat 3 · The break (0:21)
> Ten minutes go by. Fifteen. Our dot is still waiting. And then… three buses. At once. Nose to tail. No crash. No strike. Nobody broke anything. So why do buses come in threes?

- **Visual:** `S1` fast-forward. A clock in the corner spins. Gaps visibly stretch on one side of the loop and pinch
  on the other. The stop-7 queue piles up around the mascot. On "three buses", three capsules arrive bumper to bumper.
  Freeze on the question.
- **Mascot:** sinks lower with each minute; buried in a little hill of waiting dots; on "three buses" one eye opens,
  deadpan.
- **Sound:** ticks thin to silence during the wait; three door chimes stack into one chord on "three buses".

### Beat 4 · Wordmark (0:35)
> *(no narration)*

- **Visual:** the paper wipes clean. Type sets: **Ten Thousand Dots** — the mascot hops out of the queue and lands as
  the full stop. Tagline fades in below, small: *Tiny systems, explained with dots.*
- **Mascot:** lands, settles, blinks.
- **Sound:** channel sting (3 notes), then **1 s of silence**.

---

## ACT 1 · THREE SMALL THINGS

### Beat 5 · Headway (0:39)
> Let's slow it down. First, a word bus people love: headway. It's just the time between one bus and the next. Here, six minutes. Keep the headways equal and everybody's happy.

- **Visual:** back to `S0`, slowed. Each gap between buses becomes a little ruler labelled "6:00"; the word HEADWAY
  is stamped once, large, then shrinks into the corner as a legend.
- **Mascot:** holds up a tiny ruler to one gap, approves.
- **Sound:** a ruler "click" per label.

### Beat 6 · Rain of people (0:52)
> Second thing: passengers. When buses come this often, almost nobody checks the timetable. People just turn up. So at every stop, dots trickle in, steady as rain.

- **Visual:** close on a stop; dots fall in from above like slow rain and queue. Wide: all 12 stops filling at the same
  steady rate. [4]
- **Mascot:** puts out a "hand" (a little nub) as if checking for rain.
- **Sound:** soft rain-like pitter of ticks, quiet.

### Beat 7 · Seconds per person (1:04)
> Third: getting on takes time. Show a pass, tap a card, count some coins. Researchers in Vancouver timed it: roughly two to four seconds per person. Tiny. Remember tiny.

- **Visual:** three dots board one after another with little icons (pass / card / coins) and stopwatch stamps 2.2 s,
  3.0 s, 4.2 s. [5] Then the word "tiny" written very small.
- **Mascot:** squints at the tiny word.
- **Sound:** one tick per boarding, coins = three tiny clinks.

---

## ACT 2 · THE LOOP

### Beat 8 · Replay the twenty seconds (1:17)
> Now replay those twenty seconds. Our bus is late, so the next stop has had twenty extra seconds of rain. More dots waiting. More dots means a longer stop. A longer stop means it's even later at the next stop, where, you guessed it, even more dots are waiting.

- **Visual:** follow-cam on the late bus (`S1`, real time). Each stop: queue counter, then a delay counter on the bus
  that grows: +20 s → +31 s → +48 s → +1:15 (values from the sim). Queues ahead visibly taller than normal.
- **Mascot:** watching from stop 7 in a picture-in-picture circle, getting worried.
- **Sound:** ticks per boarding get denser at each stop; pitch rises slightly.

### Beat 9 · Feedback loop (1:37)
> A late bus makes itself later. Engineers call this a feedback loop: the effect feeds its own cause. And no, a "positive" feedback loop is not positive for you.

- **Visual:** the loop drawn as a hand-inked circle diagram: late → more people → longer stop → later. An arrow chases
  its own tail and speeds up. [6][7]
- **Mascot:** runs around the circle diagram like a hamster wheel, dizzy.
- **Sound:** a rising whoosh that loops.

### Beat 10 · The bus behind (1:50)
> Meanwhile, the bus behind it is having the opposite day. Every stop it reaches was just emptied. Nobody to pick up, so it barely stops. So it speeds up. So the next stop is even emptier.

- **Visual:** split screen: left the late bus wading through queues; right the bus behind gliding past empty stops,
  delay counter going negative (−10 s, −25 s...). [6]
- **Mascot:** none (let the split screen breathe).
- **Sound:** left side dense ticks; right side airy, almost silent, a cheerful little whistle-like synth note.

### Beat 11 · Holiday (2:05)
> One bus is doing all the work. The one behind is basically on holiday. Big gaps get bigger, small gaps get smaller, until the small gap is… zero. And then the next bus joins the party. Two, three, sometimes more. Transit people have a name for it: bus bunching.

- **Visual:** the rear bus wears tiny sunglasses for one frame (a printed sticker). The gap ruler between the two buses
  counts down 6:00 → 2:10 → 0:40 → 0:00; they touch. Wide shot: a third bus closes in. On the other side of the loop,
  one enormous empty gap with a single lonely stop full of dots: stop 7. [6][8]
- **Mascot:** in the enormous gap, alone, tiny, under a pile of dots.
- **Sound:** a "bonk" when buses touch; chord again when the third joins.

---

## ACT 3 · WHAT IT COSTS YOU

### Beat 12 · Ask ten thousand dots (2:26)
> Here's the sneaky part. Count the buses: still six. Same road, same drivers. So does bunching actually cost you anything? Let's ask ten thousand dots.

- **Visual:** the loop unrolls into a straight timeline at one stop: a day of bus arrivals as vertical ink lines.
  A counter "10,000" appears above, waiting.
- **Mascot:** steps aside, gestures "go ahead".
- **Sound:** a held breath (short silence) before the drop.

### Beat 13 · Even buses (2:37)
> First, a day of evenly spaced buses. Drop the dots at random times, and each one waits for the next bus. Some dots get lucky and wait seconds. Some just missed one and wait the full six. On average? Half a gap. Three minutes.

- **Visual:** `S2a`: 10,000 dots rain onto the timeline at random times, each slides right to the next bus line,
  leaving a faint trail whose length = its wait. A histogram builds; average marker lands on 3:00. [10]
- **Mascot:** sits on the 3:00 marker.
- **Sound:** a wash of 10,000 micro-ticks (granular), resolving to one clean note.

### Beat 14 · Bunched buses (2:56)
> Now the same buses, bunched in pairs. Still one every six minutes on average. But look where the dots land. Almost all of them fall into the long empty stretches, because that's where almost all the time is. The average wait doubles. Six minutes. Same buses. Twice the wait.

- **Visual:** `S2b`: bus lines now in pairs (0 min apart, then 12 min gap). The dots rain again and pool in the long
  gaps; trails are visibly longer. Average marker slides from 3:00 to 6:00 and stamps "×2". [11][12]
- **Mascot:** gets pushed along the marker from 3:00 to 6:00, indignant.
- **Sound:** the same granular wash, lower and longer.

### Beat 15 · Random incidence (3:16)
> Mathematicians call this random incidence. You call it Tuesday. And when your bus finally comes, it's the packed one, while the one right behind it is nearly empty.

- **Visual:** the phrase "random incidence" set in elegant type, then a rubber stamp "TUESDAY" slaps over it. Cut to
  the clump: the front bus crammed with dots (halftone dark), the bus behind almost white. [9]
- **Mascot:** squeezed in the front bus, face pressed to the window, looking at the empty bus behind.
- **Sound:** stamp thud; a squeak of a squashed dot.

---

## ACT 4 · THE ROUTE THAT FOUGHT BACK

### Beat 16 · Old problem (3:28)
> None of this is new. Transport researchers were describing it back in 1964. And the usual weapon is the timetable. Planners pad it with spare minutes and tell early buses to wait for their slot. It helps a little. But a timetable can't stop a feedback loop. It just writes down where the buses were supposed to be.

- **Visual:** a paper timetable (our own design, no real agency) unrolls over the loop; the buses ignore it and bunch
  anyway, sliding off their printed times. "1964" appears as a small dated stamp in the margin. [13]
- **Mascot:** reads the timetable, looks at the clump, looks back at the timetable, crumples it.
- **Sound:** paper rustle; crumple.

### Beat 17 · A real route (3:53)
> So let's look at a real route: the main bus line through Georgia Tech, a university in Atlanta. Around five thousand riders a day. Six buses. Scheduled every six minutes. Basically our toy route, but real. Those ten thousand dots? That's about two days of riders here.

- **Visual:** the toy loop morphs into a simplified, hand-drawn out-and-back line (our own map, no logos, no street
  names beyond "Atlanta"). Labels: "~5,000 riders/day", "6 buses", "every 6 min". [14]
- **Mascot:** puts on a tiny backpack (student).
- **Sound:** a small "ding" as each label lands.

### Beat 18 · One second (4:12)
> On one ordinary scheduled day, the shortest gap between two buses was one second. One. Second. Practically holding hands. The longest? Almost twenty minutes.

- **Visual:** two capsules side by side with a ruler between them that reads "0:01". Then a very long ruler slides
  out of frame and back: "19:45". [15]
- **Mascot:** looks at the one-second ruler, then at the twenty-minute one, then directly at camera.
- **Sound:** two door chimes almost on top of each other (a flam); then a long, empty room tone.

### Beat 19 · Forget the schedule (4:23)
> Two researchers, John Bartholdi and Don Eisenstein, tried something that sounds like a joke. They told the drivers: forget the schedule. Just drive. When you reach the end of the line, check how far back the next bus is, and wait about half of that time. Then go.

- **Visual:** names appear as typeset text only (no portraits). The timetable from beat 16 is torn in half. At the
  end of the line, a bus stops; a dotted arrow points back along the route to the next bus with a time "8 min"; a
  little dial fills to half: "wait 4 min". [16][17]
- **Mascot:** horrified at "wait".
- **Sound:** paper tear; a soft clock tick for the waiting.

### Beat 20 · Why waiting works (4:43)
> Think about what that does. If the bus behind you is far away, you wait longer, and that big gap shrinks. If it's right on your tail, you leave almost at once and give it room. Every bus gently nudges its neighbours toward even spacing. Like dancers in a circle keeping an arm's length: no choreographer, just one simple rule. Nobody needs to see the whole route. Each bus only looks back.

- **Visual:** two clear examples at the terminal: far follower → long wait → the gap behind closes; close follower →
  quick exit → the gap opens. Then all six buses with small "look back" arrows. [18]
- **Mascot:** turns its head back and forth with each bus, starting to get it.
- **Sound:** two contrasting chime lengths (long hold / quick release).

### Beat 21 · Our sim, fixed (5:13)
> Let's try it on our toy route. Same twenty-second hiccup. Same rain of passengers. But this time, watch the clump… melt. And look at stop seven: the pile of dots never gets the chance to grow.

- **Visual:** `S3`: replay of `S1` with the rule on. The +20 s appears, the clump starts to form, then the buses peel
  apart and settle back to even rulers. A small graph in the corner: gap sizes converge.
- **Mascot:** watches the buses spread out, mouth slowly opening.
- **Sound:** the dissonant chord from the hook resolves into three separate, evenly spaced chimes.

### Beat 22 · Real results (5:28)
> On the real route, it worked. The shortest gap went from one second to almost two and a half minutes. The longest dropped to about fifteen. And the average gap actually got shorter, so people waited less, not more.

- **Visual:** the two rulers from beat 18 animate to their new values: 0:01 → 2:28, 19:45 → 14:59. A small strip shows
  the average gap: 6:28 / 6:18 / 6:00 (two previous weeks vs trial day). [19][20]
- **Mascot:** does a tiny victory hop.
- **Sound:** ruler clicks; an upward three-note motif.

### Beat 23 · Remove a bus (5:45)
> Then they pulled a bus off the route on purpose, like a breakdown. The buses that were left spread themselves out again, at a new, wider spacing. On their own. No dispatcher, no radio calls. And the drivers? They said they liked it. No more staring at the clock.

- **Visual:** `S4` on the real-line drawing: three buses, one lifts off the page like a cut-out; a big gap; the two
  remaining slide into even spacing. Then a driver's seat icon with a clock that fades away. [21][22]
- **Mascot:** salutes the departing bus.
- **Sound:** paper lift; settling chimes.

### Beat 24 · Kept (6:06)
> The university kept using it. Turns out a schedule isn't the only way to keep buses apart. Sometimes the buses can do it themselves.

- **Visual:** the line drawing calmly cycling with even spacing; a date stamp "2013 →" in the margin. [23]
- **Mascot:** sits on a bench at a stop; a bus arrives right on cue.
- **Sound:** calm motif.

---

## ACT 5 · THE TWIST, AND THE TIP

### Beat 25 · The plot twist (6:16)
> So here's the plot twist. That bus that just sits there, doors open, doing nothing? Sometimes it's the most useful bus on the road. A little waiting, at the right moment, gets everybody home sooner. It feels slower. It's faster.

- **Visual:** back to the very first shot of beat 1: the bus parked at the end of the line, doors open. This time a
  small dotted arrow looks back to the next bus, and the parked bus glows faintly.
- **Mascot:** at stop 7 again; this time it looks at the parked bus with new respect.
- **Sound:** the door chime from beat 1, warmer.

### Beat 26 · Which bus to take (6:33)
> And if three buses do show up at once, transport researchers in the UK have advice: take the second one. The first has been fighting the crowd the whole way, unless it has empty seats. And the third might be told to skip stops to catch up. Maybe yours.

- **Visual:** the three-bus clump from the hook, freeze-frame, with stamped numbers 1, 2, 3. Bus 1 dark with dots;
  bus 2 half full with a check mark; bus 3 with a dotted arrow that skips past a stop. [24]
- **Mascot:** hops onto bus 2, grabs a seat by the window.
- **Sound:** check-mark "ding".

### Beat 27 · Callback and sign-off (6:54)
> Twenty seconds. That's all it took to break our route. And half a gap is all it took to fix it. This is Ten Thousand Dots. Tiny systems, explained with dots. Next time, the same loop, but with cars, and no buses to blame.

- **Visual:** the bus ride ends at the end of the line. The mascot hops off, turns to the bus, and holds up a tiny
  "WAIT" paddle; the bus waits, happily. Pull back: six buses, perfectly spaced, "6:00" rulers glowing. On the channel
  name, the wordmark sets again and the mascot hops into place as the full stop. End screen.
- **Mascot:** arc complete: it is now the one telling the bus to wait. A satisfied blink.
- **Sound:** the three chimes play evenly spaced, then the channel sting.

*(Next-time line is a soft tease; the Producer can cut it or swap for the actual next topic. Callback: "twenty
seconds" (beat 2) and the parked bus (beat 1).)*

---

## Narration-only text (for voice and word count)

This is a bus route. Twelve stops, six buses, and one dot who would really like to go home. On paper, a bus comes
every six minutes. Like clockwork. Now watch. One bus meets one slow passenger and loses twenty seconds. That's it.
That's the whole disaster. Ten minutes go by. Fifteen. Our dot is still waiting. And then… three buses. At once. Nose
to tail. No crash. No strike. Nobody broke anything. So why do buses come in threes?

Let's slow it down. First, a word bus people love: headway. It's just the time between one bus and the next. Here, six
minutes. Keep the headways equal and everybody's happy. Second thing: passengers. When buses come this often, almost
nobody checks the timetable. People just turn up. So at every stop, dots trickle in, steady as rain. Third: getting on
takes time. Show a pass, tap a card, count some coins. Researchers in Vancouver timed it: roughly two to four seconds
per person. Tiny. Remember tiny.

Now replay those twenty seconds. Our bus is late, so the next stop has had twenty extra seconds of rain. More dots
waiting. More dots means a longer stop. A longer stop means it's even later at the next stop, where, you guessed it,
even more dots are waiting. A late bus makes itself later. Engineers call this a feedback loop: the effect feeds its
own cause. And no, a "positive" feedback loop is not positive for you. Meanwhile, the bus behind it is having the
opposite day. Every stop it reaches was just emptied. Nobody to pick up, so it barely stops. So it speeds up. So the
next stop is even emptier. One bus is doing all the work. The one behind is basically on holiday. Big gaps get bigger,
small gaps get smaller, until the small gap is… zero. And then the next bus joins the party. Two, three, sometimes
more. Transit people have a name for it: bus bunching.

Here's the sneaky part. Count the buses: still six. Same road, same drivers. So does bunching actually cost you
anything? Let's ask ten thousand dots. First, a day of evenly spaced buses. Drop the dots at random times, and each
one waits for the next bus. Some dots get lucky and wait seconds. Some just missed one and wait the full six. On
average? Half a gap. Three minutes. Now the same buses, bunched in pairs. Still one every six minutes on average. But
look where the dots land. Almost all of them fall into the long empty stretches, because that's where almost all the
time is. The average wait doubles. Six minutes. Same buses. Twice the wait. Mathematicians call this random incidence.
You call it Tuesday. And when your bus finally comes, it's the packed one, while the one right behind it is nearly
empty.

None of this is new. Transport researchers were describing it back in 1964. And the usual weapon is the timetable.
Planners pad it with spare minutes and tell early buses to wait for their slot. It helps a little. But a timetable
can't stop a feedback loop. It just writes down where the buses were supposed to be. So let's look at a real route:
the main bus line through Georgia Tech, a university in Atlanta. Around five thousand riders a day. Six buses.
Scheduled every six minutes. Basically our toy route, but real. Those ten thousand dots? That's about two days of
riders here. On one ordinary scheduled day, the shortest gap between two buses was one second. One. Second.
Practically holding hands. The longest? Almost twenty minutes. Two researchers, John Bartholdi and Don Eisenstein,
tried something that sounds like a joke. They told the drivers: forget the schedule. Just drive. When you reach the
end of the line, check how far back the next bus is, and wait about half of that time. Then go. Think about what that
does. If the bus behind you is far away, you wait longer, and that big gap shrinks. If it's right on your tail, you
leave almost at once and give it room. Every bus gently nudges its neighbours toward even spacing. Like dancers in a
circle keeping an arm's length: no choreographer, just one simple rule. Nobody needs to see the whole route. Each bus
only looks back. Let's try it on our toy route. Same twenty-second hiccup. Same rain of passengers. But this time,
watch the clump… melt. And look at stop seven: the pile of dots never gets the chance to grow. On the real route, it
worked. The shortest gap went from one second to almost two and a half minutes. The longest dropped to about fifteen.
And the average gap actually got shorter, so people waited less, not more. Then they pulled a bus off the route on
purpose, like a breakdown. The buses that were left spread themselves out again, at a new, wider spacing. On their
own. No dispatcher, no radio calls. And the drivers? They said they liked it. No more staring at the clock. The
university kept using it. Turns out a schedule isn't the only way to keep buses apart. Sometimes the buses can do it
themselves.

So here's the plot twist. That bus that just sits there, doors open, doing nothing? Sometimes it's the most useful bus
on the road. A little waiting, at the right moment, gets everybody home sooner. It feels slower. It's faster. And if
three buses do show up at once, transport researchers in the UK have advice: take the second one. The first has been
fighting the crowd the whole way, unless it has empty seats. And the third might be told to skip stops to catch up.
Maybe yours. Twenty seconds. That's all it took to break our route. And half a gap is all it took to fix it. This is
Ten Thousand Dots. Tiny systems, explained with dots. Next time, the same loop, but with cars, and no buses to blame.

---

## SHORT (vertical, 9:16, ~50 s, EN subtitles burned in)

**Narration: 127 words → ~51 s at 150 wpm.**

| # | Narration | Visual / mascot / sound |
|---|---|---|
| S1 | Why do buses come in threes? | Opens on the clump: three buses nose to tail arriving at the mascot's stop; chord. |
| S2 | Six buses, one every six minutes. One bus loses twenty seconds to a slow passenger. | Rewind wipe to `S0` (vertical crop of the loop); "+20 s" stamp. |
| S3 | Now it's late, so more people are waiting at the next stop. More people, longer stop. Even later. | Follow-cam; queue counters and delay counter growing. Ticks denser. |
| S4 | The bus behind finds empty stops, so it speeds up. | Split: empty stops, bus zooming; negative delay counter. |
| S5 | Big gaps grow, small gaps shrink, and they meet. | Buses touch: bonk; third joins: chord. |
| S6 | Worst part: with buses in pairs, your average wait doubles. Same buses. | 10,000-dot drop on a vertical timeline; marker 3:00 → 6:00, "×2". |
| S7 | One university route in Atlanta tamed it by telling drivers to ignore the schedule and wait at the end of the line: about half the time until the next bus. | Torn timetable; terminal wait dial fills to half; clump melts. |
| S8 | Shortest gap: from one second to two and a half minutes. | Ruler 0:01 → 2:28. |
| S9 | And if three show up? Take the second one. | Mascot hops on bus 2; end card: **Ten Thousand Dots.** with the mascot as the full stop. Loops back to S1. |

Short title: "Why buses come in threes (and which one to take)" · ES: "Por qué los buses llegan de a tres (y cuál tomar)".

---

## TITLES (EN)

1. **Why Do Buses Come in Threes?** (exact search phrase; safest for search)
2. **Why Buses Always Arrive Together (It's Nobody's Fault)**
3. **The Bus That Waits Gets You Home Sooner**

## TITLES (ES-419)

1. **¿Por qué los buses llegan de a tres?**
2. **¿Por qué los buses siempre llegan juntos? (No es culpa de nadie)**
3. **El bus que espera te lleva más rápido**

## THUMBNAIL CONCEPTS (same scene family for Test & Compare; text never repeats the title)

1. **"1 SECOND APART"** (ES: **"A 1 SEGUNDO"**): three ink buses nose to tail filling the frame diagonally; the mascot
   tiny in the foreground under a huge pile of waiting dots, one eye open, deadpan. High contrast: dark buses on paper
   white, mascot in the accent ink.
2. **"THEN THREE"** (ES: **"Y LUEGO TRES"**): left two-thirds an enormous empty road with a single clock reading 19:45
   and the mascot alone at a stop; right edge, three buses bursting in. Reads as "nothing… then everything".
3. **"JUST WAIT."** (ES: **"ESPERA."**): one bus parked with doors open, the mascot in front holding up a tiny "WAIT"
   paddle, smug; behind, faint bunched buses pulling apart. Contrarian hook that pays off beat 25.

Mobile check at 168×94: one subject (the clump or the parked bus), 1-3 words, mascot face must stay ≥ 14 px.
