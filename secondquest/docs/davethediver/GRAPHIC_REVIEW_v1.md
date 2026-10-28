# Dave the Diver · Graphic review v1 (director, 2026-10-28, on animatic 720p v4)

Goal (Producer, 2026-10-28): raise the episode graphically — scenes, characters, finish. Reviewed every block at
1 frame / 1.5 s. Route per item: **3D** = props3d/Three.js by a Sonnet builder (free) · **GPT** = image the Producer
generates in ChatGPT from our prompt (free) · **HF** = Hyperframes code (free). Nothing here costs credits.

## A. Global (every block)
| # | Problem | Fix | Route |
|---|---|---|---|
| G1 | No finish pass (grain, vignette, deep-shadow halftone) although CLAUDE.md requires it | run `scripts/animatic/finish.py` style pass on every frame (or the equivalent CSS/WebGL layer in each block) | HF |
| G2 | Hard cuts on every location change | GL Transitions (vendored, seek-safe helper) on ~18 location changes: water ripple into the sea, soft wipe bar→office, crosswarp home→game | HF |
| G3 | Underwater is one flat gradient + one rock row, reused ~70 s (A, B, C, D, F, G) | 3 depth plates (shallow reef ~10 m, kelp ~30 m, deep ~800 m) + parallax layers, light rays, caustics, drifting particles, fish schools; colour darkens with depth | GPT plates + HF |
| G4 | Bar: the same wide side shot ~25 times; characters ~120 px | new framings: counter close-up, Pixie's prep station, customer close-ups; neon flicker, steam, warm light bloom | GPT plates + HF |
| G5 | Boat: same side angle ~20 times, flat sky | moving clouds, sea sparkle, gulls, wake foam; use the 3/4 boat render for variety | 3D + HF |
| G6 | Living room: same framing ~15 times (block G) | alternate 3 framings (wide, over-shoulder to TV, close on Quest) | HF |
| G7 | Light/grade not matched per location | one grade per location (bar warm amber/pink, sea teal, office cold blue, home warm lamp, dusk violet) | HF |

## B. Characters
| # | Problem | Fix | Route |
|---|---|---|---|
| C1 | Quest diver = small stiff pixel sprites, one pose slid around | wetsuit pose set at our cartoon quality: swim, aim harpoon, hugging the big tank, carrying the crate, floating with the balloon, startled, thumbs-up, surfacing | GPT (Quest test passed QC) |
| C2 | Quest in the bar = small sprite | tray run, serving a plate, checking the phone, exhausted after close | GPT |
| C3 | Pixie only in cut-scene cards; tiny behind the counter | full-body chef poses behind the counter: slicing, presenting nigiri, laughing, arms crossed | GPT (Pixie spec) |
| C4 | Generic fans / dock queue / "Customers" tile still black silhouettes (F) | props3d worm-people/customer variants (re-dyed, no clones) | 3D |
| C5 | Duff, Otto, Sea People, Leo, Max: few expressions | +2 expressions each (surprised, embarrassed) for comic beats | 3D |
| C6 | Dolphin: good side profile, few reactions | add wink, sleepy, worried, laugh variants in side profile | 3D |

## C. Scenes and props drawn as flat code cards (read as placeholders)
| Where (approx. full-video s) | Card | Fix | Route |
|---|---|---|---|
| A ~23 | timecard IN/OUT | 3D timecard on a punch clock | 3D |
| A ~16 / ~18 | "10,000,000 copies" counter | gold 3D digits with light sweep | HF/Three |
| C ~102 | squid + bus outline | illustrated squid + bus | GPT |
| C ~103 | crab in toy truck | 3D crab + truck | 3D |
| C ~122 | coffee cup / hammock / cat cards | one illustrated cozy-life plate | GPT |
| C ~119 | "MON" calendar | 3D desk calendar | 3D |
| D ~142 | wall clock card | 3D clock on the office wall plate | 3D |
| D ~150 | phone home screen | our phone UI on a 3D phone | 3D |
| D ~165-175 | yellow tank, crate, PROMOTION balloon | 3D tank/crate/balloon with shading | 3D |
| E ~190 | hotel + stars | illustrated hotel exterior at night | GPT |
| E ~192 | shark-head platter | illustrated platter | GPT |
| E ~215 | big fish silhouette | illustrated fish | GPT |
| E ~230-236 | folders / DAY-NIGHT bars / task checkbox | styled 3D UI objects with light | HF/Three |
| F ~250 | idol poster | illustrated poster (our own idol design) | GPT |
| F ~262 | avatar grid / family stick figures | props3d crowd thumbnails / illustrated family | 3D / GPT |
| F ~286-288 | fish farm, rice paddy, seahorse race | illustrated plates | GPT |
| G ~311 | Jeju island dome | illustrated Jeju coast at dawn | GPT |
| G ~318 | fisher silhouette in boat | illustrated fisher at dawn | GPT |
| G ~306 | "MORE" clock, colour bars | keep the 3D bars; redraw the clock in 3D | 3D |

## D. Order of work (proposed)
1. G1 finish + G7 grades + G2 transitions (whole episode, code only) → one 480p block at a time for review.
2. Producer generates the GPT batch (prompts in `GPT_PROMPTS_batch1.md`, to be written on approval).
3. 3D batch (C4-C6 + 3D props).
4. G3/G4/G5 using the new plates; then 720p review render + critic on the changed windows.
