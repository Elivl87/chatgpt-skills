# Dave the Diver · Character poses (cast + quote), v1 (2026-10-19)

Cast (Producer, 2026-10-18/19): **Quest = Dave** (pixel in the game world, painted in real life) · **Pixie = Bancho**
(chef, epic cooking cutscenes) · **Leo = Cobra** · **Max = bar regular** · EP003 fish = cameo in the aquarium tank ·
companion = air bubble. Costumes keep identity (only clothes/accessories change).

Bancho's cutscenes, from the Producer's references + press (Yahoo/GamesRadar+): **big close-ups in hi-detail pixel
art**, dark grey void with smoke and light streaks, chiaroscuro; side-profile slicing with motion streaks and a sake
bottle; low-angle hero shot holding the finished nigiri up; glasses flashing white (eyes hidden) mid-cut; a knife
sharpened, a falling petal sliced in mid-air, then a terrified catfish in the tank. They play on every new/upgraded dish.

Method: painted source at 1k (Quest/Pixie specs, identity QC) → our pixel pass (`tools/pixel/pixelate.py`): full-body
sprites at ~150 px, cutscene close-ups at ~300–360 px (more detail, like the game). Leo/Max: our 3D (props3d), new
outfit/pose in code, rendered + pixel pass. Rates: 0.5 per image at 1k. Balance 9.25.

| # | Who | Pose (purpose · script ¶) | Source | Credits |
|---|---|---|---|---|
| 1 | Quest | Dive suit, swimming side view, kick frame A (the dive · ¶03, ¶22) | new art | 0.5 |
| 2 | Quest | Same framing, kick frame B (A/B = a real swim cycle, no gliding a static pose) | new art | 0.5 |
| 3 | Quest | Dive suit, aiming the harpoon gun, side (action, sharks · ¶18) | new art | 0.5 |
| 4 | Quest | Dive suit on the boat's stern rail, mask up, ready to dive (morning · ¶22) | new art | 0.5 |
| 5 | Quest | Dive suit, surfacing with a big fish in both arms, proud and out of breath (you can see it · ¶23, ¶33) | new art | 0.5 |
| 6 | Pixie | Chef: side profile slicing a fish, knife streaks, sake bottle (cutscene · ¶31) | new art | 0.5 |
| 7 | Pixie | Chef: low-angle hero shot raising a finished nigiri, light streaks (cutscene · ¶31) | new art | 0.5 |
| 8 | Pixie | Chef: intense close-up mid-cut, glasses flashing white (cutscene gag · ¶31) *needs OK: round glasses as costume* | new art | 0.5 |
| 9 | Pixie | Chef, full body behind the counter, presenting a plate (service · ¶32, ¶36) | new art | 0.5 |
| 10 | Quest | Serving tray, running (night floor · ¶32) | REUSE `core/quest/holding_tray` + pixel pass | 0 |
| 11 | Quest | Real-life sofa / office / phone (¶01, ¶24, ¶34, ¶50) | REUSE painted library | 0 |
| 12 | Leo | Cobra outfit (red Hawaiian shirt, sunglasses, his yellow beanie): arms crossed on deck · on the phone ("the promise of sushi") · pointing (contracts) · cheer (party) | our 3D, new outfit + arms-crossed pose in code | 0 |
| 13 | Max | Bar regular on a stool: eating · sleepy side-eye · laugh (party) | our 3D (sit pose exists; stool + chopsticks in code) | 0 |
| 14 | Fish | In the bar's aquarium tank, terrified when Pixie's knife flashes (callback to the catfish gag) | EP003 fish2 expressions | 0 |

**Poses with new art: 9 → 4.5 credits** (balance after: 4.75). Minimum viable: drop #2 (swim via camera) and #8
→ 3.5 (balance 5.75). Backgrounds (bar interior, bay with karst cliffs) are quoted separately in the shot plan: our
3D/code first, a painted plate only where code can't reach the quality.
