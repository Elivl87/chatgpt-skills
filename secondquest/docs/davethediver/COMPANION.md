# Dave the Diver · Companion detail (RULE, Producer 2026-10-11)

Every episode has its own companion, our own design, free first (EP002: Navi into the star of the "o"; EP003: the
unimpressed fish, `tools/props3d/scene.ts` `fish2`, 7 expressions rendered in `public/art/ep003/props3d/fish2_*`:
deadpan, blink, lookup, sweat, wide, wince, yawn). Test: (1) reads as the game's world without copying its art,
(2) carries the thesis or a running gag, (3) can move into the wordmark, (4) costs 0 (our 3D) or one image.
Thesis it must serve (`RESONANCE.md` §6, recommended): **"a game about two jobs, played after your real one"**: work
that ends, that you can see, and where someone is glad you came.

## Options
| Option | What it is | Thesis / gags | Wordmark move | Cost | Verdict |
|---|---|---|---|---|---|
| **A · The air bubble** ("Puff") | One round air bubble with a face, born from Quest's regulator. Its size **is** the oxygen left: it shrinks during a dive, refills at the surface. Our design (no tank HUD copy). Built on fish v2's eye/lid rig on a glassy toon sphere | The thesis's "it ends": the dive has a clock you can see, unlike your inbox. Gags: shrinks while Quest says "just one more dive", sweats as it gets tiny; panics near a shark; at the night bar it floats over the steam of a bowl, out of place; gets popped by Bancho's chopstick shadow (reforms, offended); at the CTA it waits for the viewer to log off | **Hook:** on "So, why?" it rises from the bottom of frame, wobbles up and **becomes the "o"** of the wordmark (the star twinkles inside the bubble), held 1.5 s. **End:** it rises again, slips into the "o", and the "o" goes *pop* into the gold bar (the dive is over, the shift is done) | 0 (our 3D: sphere + reused eye rig + refraction-ish rim; a new prop in `scene.ts`) | **Recommended** |
| B · The fish, back for a second job | EP003's unimpressed fish v2, re-cast: now wearing a tiny paper sushi-chef hat / staff apron, "hired" at the bar. Recolour to a tropical palette | Running gag: the fish knows exactly where fish go in a sushi game. Deadpan at every harpoon; at night it serves plates, sweating; "same fish, different shift" | Leaps into the "o" like EP003, but lands wearing the hat | 0 (done; only a hat prop + recolour) | Strong backup / cameo. Risk: M1/M5 reuse warnings (EP003's whole ocean is already planned ~70 % reuse) and it imports EP003's thesis ("nobody came for the fish"). Best as a one-shot cameo: the EP003 fish in the bar's tank, unimpressed |
| C · The nigiri | A single salmon nigiri with tiny eyes on the fish slab, sitting on our own geta board. The product of both shifts: caught by day, served at night | "Someone receives what you made": it is the thing that lands on a plate. Gags: rides the conveyor of the night; trembles at Bancho's knife; at the end is finally eaten and the customer smiles (warm) | Slides along the gold bar like a conveyor and hops into the "o" | 0 (simple 3D: rice block + slab + band) | Cute, but edible-with-a-face is a dark gag that repeats EP003's fish joke; weaker in the sea half |

## Why the bubble
It is the one object that lives in both halves and **is the thesis**. In the sea, it is the clock that makes work end
("the dive must end": oxygen). At night, it is still there, a little bubble that rose into the bar and is useless
except to watch, which mirrors the viewer: a tired adult whose day is finally measured in something visible. When the
payoff says the work "fits in a day", the bubble pops into the gold bar. It never copies Mintrocket's art: a bubble is
generic; the face is ours (the fish v2 eye/lid language, so it reads as SecondQuest's house style).

## Expression set (7, same rig as fish v2: lid 0..1, look [up, side], mouth pout/o/flat, sweat)
| Expression | Use |
|---|---|
| content (lid .42, small smile) | the default, floating beside Quest |
| wide (lid 0, mouth o) | the Blue Hole opens up; first shark |
| sweat (tiny size + drop) | "one more dive", oxygen low |
| squish/wince | popped by a chopstick shadow, a door, a fish's tail |
| lookup | watches the wordmark land / a whale shadow pass |
| sleepy (lid .9, yawn) | the sofa at night (hook and CTA) |
| proud (lid .3, chest out, a glint) | the full bar at the end; it rises into the "o" |
Size is the eighth "expression": scale 1.0 full air → 0.35 nearly empty. Animate in our 3D renderer, render cut-outs per
expression and size like `fish2_side_*`.

## Where it appears (plan; no line is stolen, it moves in pauses or at the frame edge)
| Beat | What it does |
|---|---|
| Hook, frame 0 | rises out of Quest's glass of soda on the sofa: a bubble from the real-life evening |
| Hook, "So, why?" | **floats up and becomes the "o" of the wordmark**; star twinkles inside; 1.5 s silence |
| The dive | beside Quest's regulator, shrinking; sweats on "one more dive"; one gulp of a refill on surfacing |
| Cobra's contracts | gets stuck to a contract and signs it by accident (a wet ring) |
| The night bar | hovers over a steaming bowl; popped by a chopstick shadow, reforms, offended |
| The village / being needed | many small bubbles join it, a little crowd |
| Payoff + CTA | sleepy on the sofa again; then **rises into the "o" and pops into the gold bar** (book-end) |
| Trailer Short | the hook rise into the wordmark |

Build note: free, our 3D (`tools/props3d`, CLAUDE.md rule); no credits. One quick key frame of A and B side by side for
the Producer's pick before animating.
