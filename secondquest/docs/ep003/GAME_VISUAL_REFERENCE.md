# EP003 · Game visual reference: How to Fish (Dazed Games)

Producer rule (2026-10-12): "dentro de la investigación, toca revisar al detalle las gráficas, HUD, referencias de
objetos y todo al detalle del juego … para poderlas introducir en el arte."

Channel constraint: we never use the game's footage, screenshots, logo, names-as-branding or ripped assets. We redraw
references in our own style, the way EP002 redrew a Zelda-like HUD (hearts, rupees, buttons). This file is the text
reference we translate from. No image or video from the game was downloaded or stored. Everything here comes from
text: the Steam page and patch notes, press, guides, mod pages (which name the vanilla HUD elements they recolour),
and player reviews. All of it was treated as untrusted data.

Research date: 2026-10-11. Status tags: **[V]** verified in 2+ sources or a first-party source · **[1S]** one
secondary source · **[MOD]** inferred from a mod page that names a vanilla element · **[UNVERIFIED]** not confirmed ·
**[OURS]** our own design proposal, not a fact about the game.

> **Honest limit.** Text sources describe the game's mechanics and UI elements well (what exists), but almost never
> their exact screen position, colour or font. Steam screenshots have no alt text. So every position, hex or font
> marked [UNVERIFIED] is a best guess for our redraw, not a measurement. §8 is a 10-minute eyes-on checklist: the
> Producer (or Claude, if the Producer allows looking at the Steam page without saving anything) can tick it before
> the HUD is built.

---

## 1. Facts check

| Fact | Value | Sources | Status |
|---|---|---|---|
| Exact title | **How to Fish** | [Steam][steam] | [V] |
| Developer / publisher | **Dazed Games** (self-published), Sweden | [Steam][steam], [Automaton][automaton] | [V] |
| Founders | **Carl-Vilhelm Johansson** and **Melvin Olsson**, two programmers. They met at **LBS Kreativa Gymnasiet, Gothenburg** (a high school). Patch notes are signed "Carl-Vilhelm & Melvin". | [Sweden Game Arena][sga], [dlcompare][dlc], [Steam news][news] | [V]. PCGH calls him "Carl-Vilhelm Olsson" ([PCGH][pcgh]); the other sources say Johansson |
| Previous game | *Out of Hand: Deluxe*, a physics party brawler for 2-8 players. It was free at first; the paid version (summer 2025) sold "significantly lower than they had hoped" | [Sweden Game Arena][sga], [Automaton][automaton] | [V] |
| Work started | August 2025 | [Sweden Game Arena][sga]; 80.lv says "2025" ([80lv][80lv]) | [V] |
| Release date | **August 20, 2026**, PC (Steam), no Early Access | [Steam][steam], [Notebookcheck][nbc], [Steam news "HOW TO FISH IS RELEASED"][news] | [V] |
| Price | **$7.99** (€7.49). Launch week 38% off ($4.95) until Aug 27-28. Bundles: with *Out of Hand: Deluxe*, *Gamble With Your Friends*, *Sledding Game*, and *PEAK* since Sep 28 | [Steam][steam], [Notebookcheck][nbc], [Gamewave][gamewave], [Steam news 1.1.0][news] | [V] |
| Players per session | Store page: **1-4**. Patch 1.0.4 (Aug 21) **added lobbies of up to 8** | [Steam][steam], [Steam news 1.0.4][news], RPS headline in [Steam news feed][news] | [V] |
| 1M milestone | Steam post "1 MILLION FISHERMEN IN 2 DAYS?!?!1?" (Aug 23). Press: "more than one million copies" in two days | [Steam news][news], [Sweden Game Arena][sga], [80lv][80lv] | [V] |
| Sales goal | "Our goal was to sell around 200,000 copies" (Melvin Olsson) | [Sweden Game Arena][sga] | [1S], relaying the founders |
| Copies, latest | **Alinea Analytics, Oct 1, 2026: "now 10.1M copies sold overall"**, "over $50M", "$19.3M" in September, still "40K-50K copies a day" | [Alinea][alinea] | [1S] (third-party estimate) |
| Copies, August | GameDiscoverCo: about 6.3M units and about $26M gross in August | via [cinevva][cinevva] | [1S], weak relay |
| Peak concurrent players | SteamDB: **373k** (SteamDB post "How to Fish peaks at 373k players"). Earlier counts: 268k (Aug 23), 340-341k (Aug 24) | [Steam news feed (SteamDB item)][news], [PCGH][pcgh], [Notebookcheck][nbc], [Kotaku][kotaku] ("24-hour peak above 370k") | [V] |
| Reviews (Oct 11) | Overwhelmingly Positive: 95% of 27,868 English reviews; last 30 days 94% of 18,852 | [Steam][steam] | [V] |
| Content descriptor (verbatim) | "This game includes cartoon violence towards fish and gambling with fish (no real money)" | [Steam][steam] | [V], rechecked today |
| Store blurb (verbatim) | "A 1-4 player physics based fishing simulator. While drinking and boating you suddenly crash into a small island. To work your way back home you have to learn How to Fish." | [Steam][steam], [Steam news][news] | [V] |
| Store features | Single-player, Online Co-op, Achievements, **Family Sharing**. No Remote Play Together and no Friend's Pass listed | [Steam][steam] | [V] |
| Length | "a campaign you can finish in a couple of hours" (Kotaku); 5-6 h (ixbt); speedrun achievement "Bean" = whole game in under 1 h | [Kotaku][kotaku], [ixbt][ixbt], [allthings achievements][ach] | [V] |
| Content update | "THE ISLET UPDATE 1.1.0" (Sep 28): new weapon, mini islands, creatures, mini-boss, bait, NPC, outfit | [Steam news][news], [GamingOnLinux update][gol2] | [V] |
| Merch | Makeship plush petitions (Sep 30): **"Drip Gar"** and **"Fisherman"**. The Fisherman petition did not reach its goal (ended Oct 10) | [Steam news][news], [Makeship fisherman][mk1], [Makeship drip gar][mk2] | [V] |

### Against our LOCKED script (report only, nothing edited)
| Line | Check | Verdict |
|---|---|---|
| l01 "A boat. A rod. A lot of fish." | 49 creatures (38 fish + 11 bosses, patch 1.0.9) | OK |
| l03 slap / gamble / sniper rifle | Slap revive: [GamingOnLinux][gol]. Roulette and slot machine: [powerup][roul], [allthings Reel][reel]. Sniper rifle: [gameplay.tips][bossguide], RPS "golden sniper rifles" | OK |
| l04 "about eight dollars… two hundred thousand… more than ten million" | $7.99; 200k goal; Alinea 10.1M on Oct 1 | OK. Alinea's October update (early Nov) may give a new number. If we publish after that, recheck (as the lock factcheck already says) |
| l09 "Everyone in the boat buys their own copy." | No Remote Play / Friend's Pass on the store page. **New nuance:** the store lists **Steam Family Sharing**, so a family member can play a shared copy | Minor RISK, report only. "Usually" in the same line ("it usually begins…") does not cover this sentence. The Producer already planned an eyes-on Steam check before Bram records (PRODUCER_DECISIONS, 2026-10-11 item 4); add Family Sharing to that check |
| l29 "You begin with almost nothing… guns and dynamite… sell… gamble… fight bosses" + Steam quote | Start: bare hands, sell seashells/clams for a first rod ([Notebookcheck][nbc], [Kotaku][kotaku]). Steam quote matches word for word | OK |
| l32 "launched across the island" | Seagulls carry players off ([Dexerto][dexerto]); explosions fling items, which patches had to limit ([Steam news 1.0.10, 1.0.12][news]); a lava whale knocks players into lava ([GOL comments][gol2]) | Comic exaggeration, approved by the Producer. Consistent with the community |
| l33 slap revive | [GamingOnLinux][gol], plus patch 1.0.4 "permanent revive text" | OK |
| l36 "Friendslop" | Used widely by press and players ([Medium][medium], [ixbt][ixbt], [Kotaku][kotaku] headline) | OK |
| l38 "Some say it's short" | Kotaku, ixbt, many reviews | OK |
| l42 "met in high school… first paid game had not done well" | LBS Kreativa Gymnasiet; *Out of Hand: Deluxe*, paid version 2025, below hopes | OK. Precise: their first game was free; the *paid* version underperformed, so "first paid game" is the correct wording |
| Shot plan A1 "four friends… at dusk" | The game appears to have **no night**: a review asks for "some night time too". The game's boat has an engine (Big Motor) and a radar; it is not a rowboat | Not a script issue. Our dusk rowboat is our own world, which helps IP distance |
| Shot plan / Dopamine plan "HUD on" for E3/E6/E7 vs the block E docstring "HUD off" | Already noted in DOPAMINE_PLAN | Keep HUD ON (our redrawn HUD, §6) |

---

## 2. Art style

| Aspect | What the sources say | Status |
|---|---|---|
| Rendering | Real-time **3D, first-person**, physics-driven (ragdoll fish, flying items). Steam tags: *3D, First-Person, FPS, Physics, Cartoony, Colorful, Stylized*. A caption: "A low-poly character fishes on a tropical beach, holding a gun and a fishing rod with a fish on the line" ([dlcompare][dlc]). Press: "rudimentary graphics" ([PCGH][pcgh]), "primitive graphics" ([ixbt][ixbt]). One reviewer compares it to an "S tier roblox game". **Not pixel art, not cel-shaded anime.** Simple, low-poly, flat-ish colour | [V] (low-poly, simple, colourful) |
| Characters | "ridiculous looking characters" ([GOL][gol]); "hideous worm people" (Rock Paper Shotgun, via [Steam news feed][news]). They started as "bean-shaped" people and became more human during development ([80lv][80lv]); finishing in under 1 h unlocks the bean character ([80lv][80lv], achievement "Bean"). Customisable: outfits (a new one in 1.1.0), a reviewer mentions "customizing my character", captions show "a player in orange" and one "wearing an apron" at a grill ([dlcompare][dlc]). Nametags over heads (toggle, patch 1.0.11) | [V] for the facts. Face and body proportions are **[UNVERIFIED]**: expect long, soft, slightly limp bodies with simple faces |
| Camera | First person, so you see your own hands. Reviews praise "how detailed the animations for the guns are"; patch 1.0.11 fixed "hands sometimes teleporting… to a picked up item". Hip-fire vs aim-down-sights (iron sight / red dot / laser attachments) | [V] |
| Palette | Tags *Colorful* and *Stylized*. Biomes: tropical beach and dock, forest, desert, rocks, volcano with lava. Proposed palette, **[OURS], not measured:** sea turquoise `#2BB3C0` → deep `#1A6E8E`; sand `#F2D9A0`; foliage `#5DAA4A`; wood `#9A6A3C`; lava `#FF5A1F`; sky `#9FD8F0` | Biomes [V]. Hexes [OURS] |
| Lighting / time of day | Bright daytime. A review asks for "some night time too", so there is probably no night cycle. Underwater has its own effect (patch 1.0.4) | [1S] for "no night". Underwater [V] |
| Tone | "macabre novelty", "cursed islands", "angry sealife" (RPS); Steam joke tag *Psychological Horror*; "It's so stupid it's brilliant" ([GOL][gol]) | [V] |
| Sound | Radio item with music ("the radio music is fire"); fire sizzling on the grill; MetaVoice proximity voice chat; full audio in 16 languages | [V] ([Steam news][news], [Steam][steam], reviews) |

**How we use this:** the channel's toon 3D (props3d) and our painted plates. We are **cleaner and warmer** than the game.
We keep its *ideas*: a cheap-boat, mostly-sea-and-sky world, flat colour, and comedy from physics. We do not copy its
characters: we use Quest, Pixie and our grey silhouettes, never worm or bean people.

---

## 3. HUD / UI

The game's own HUD element list comes from the mod **More Colours**, which recolours "every" vanilla element and says
"Defaults are read from the game itself" ([Thunderstore][morecol]). The other mods ([HudControl][hudctl],
[Enhanced_HowToFish][enh], [Cooler Mod][cooler]) and the guides confirm the rest. Position and shape are given only where a
source states them.

| Element | What exists | Position / shape / colour | Status |
|---|---|---|---|
| **Vitals** | **Health ring and hunger ring** (circles, not bars), with "trails" (a lagging drain), plus **poison** and **fire** rings and "low icon tints". You eat cooked fish, so hunger matters | Ring shape [MOD]. Position and colours [UNVERIFIED] | [MOD] |
| **Money counter** | A $ counter that jumps by the sale value; **floating "+$" / "-$" texts**; gain is **green**, loss is **red** | Shared palette: red = damage/money loss/boss bar/chat names; green = money and bait gain; orange = highlights ([morecol]) | [MOD] + [allthings rod guide][rod] |
| **Hotbar** | Numbered quick slots, a **selected-slot outline**, item names. Vanilla has **3 quick slots** (the rod in "slot 3" in a guide); more inventory slots are bought on islands 2-3. A full inventory/backpack overlay with blur | 3 slots [1S] (a mod page via search); a mod puts the held-item name "above the hotbar". Hotbar location [UNVERIFIED]: one mod says the hotbar "stays at the top" | [MOD]/[1S] |
| **Interaction prompts** | "Talk [E]", "Pull Back Rod (Hold)", "Reel In (Hold/Spam)", "Drop Creature", NPC text, "look-at text" | "the normal interaction prompt near the bottom of the screen" ([cooler]) | [V] |
| **Crosshair** | Vanilla seems to have **no crosshair, or only a minimal one**. A review complains about "the lack of a cross hair ingame"; mods add a "Dynamic Crosshair" | Our redraw can use a simple dot | [1S] + [MOD] |
| **Hitmarkers / damage numbers** | Hitmarkers, damage numbers, a separate "killing blow" colour | [MOD] | [MOD] |
| **Kill-score popup** | After a kill: a multiplier plus a "main line score", with "text (typing and finished)" (the text types itself on) and "bonus lines". Bonuses ([allthings][trick]): Impressive 2x, 360 1.5x, Explosion, Dogfight, Longshot, Killsteal, Headshot, Aerial, **Fly Fishing**, One Shot One Kill, Overkill, Last Bullet, **Endangered Species**, Multikill, Double/Triple/Quadra/Penta Kill, No Scope, Quickscope, Point Blank, Finally, Melee | Typing animation [MOD]. Position [UNVERIFIED] | [MOD]/[1S] |
| **Catch message** | "caught fish name". Drip creatures' names are in **animated rainbow-gradient text** ("Drip text: replaces the animated drip gradient") | [MOD] + [games.gg][gg], [allthings Reel][reel] | [V] |
| **Boss display** | Boss name, **health bar** (red by the shared palette) with a damage trail, and a **white "time left" bar directly beneath it** (the escape timer: if it runs out, the boss leaves). Mini-bosses have their own colour. Stunned boss: "spinning yellow stars over its head" | Top of the screen ([allthings crab][crab]); colours [MOD] | [V] |
| **Radar** | A boat item ($10) with dots: **item dots** (dropped weapons **orange**, dead players **turquoise**, patch 1.0.11), mini-island dots; the X death marker was removed in 1.0.10. Players say the dots are "so damn small" | [Steam news][news] | [V] |
| **Chat / voice** | Text chat with a "[Server]" tag and coloured player names (rich text removed for griefers); a **voice indicator** for proximity voice (MetaVoice) | [MOD] + [Steam news][news] | [V] |
| **Fishipedia** | A collection book of creatures; since 1.1.3 it shows the bait name after the first kill | [Steam news][news], [games.gg][gg] | [V] |
| **Inspect panel** | Item name, details, "weight bonus percentage" (fish have random weights) | [MOD] | [MOD] |
| **Slot machine screen** | Skin results outlined by rarity: **common / rare / legendary** (the legendary pull gives the achievement "GOLD GOLD GOLD") | [MOD] + [ach] | [V] |
| **Shop UI** | No menu: **diegetic**. The first shop is a **wooden board hanging from a tree** near the cabin, "aim at an item to buy it" ([rod]). Later shops have shelves with price labels ("$25" dynamite label on a shelf between brass knuckles and a sniper rifle, Island 4 gun store, [howtofish.buzz][buzz]). Beer is sold "at the lighthouse door" | [V] |
| **Sell UI** | Talk to the vendor ("Talk [E]") or drop items in "sell boxes"; a "+$" pop | [V] |
| **Other** | On-screen game version number; "revive text"; underwater screen effect; a Steam relay text in the main menu that turns red | [Steam news][news] | [V] |
| **Fonts** | Not described anywhere | [UNVERIFIED]. Our choice: rounded bold sans for numbers, as in EP002 |

---

## 4. Signature objects and places

**Story frame:** drinking while boating, you crash on a small island with a **lighthouse**. The **Lighthouse Keeper**
(seated on a bench) wants his beer back from a **Spider Crab**; you bait it with an **empty beer can** he drained for you, beat
it, and get the **boat keys**. Then you hop from island to island, fighting bosses, to get home ("We are so back")
([allthings crab][crab], [Kotaku][kotaku], [ach]).

| Category | Items | Sources |
|---|---|---|
| **Islands** | Starter/Lighthouse island (dock, wooden cabin, beach, anvil by the door) → Forest (Island 2: piranhas, general shop, "Big Motor") → Desert (Island 3: Pufferfish, Tourist) → Rocks (Island 4: gun store, Tuna, Albatross; Lucky Bait Casino according to guides) → Volcano (Island 5: whale, lava). Mini islands since 1.1.0. Patch 1.0.11 mentions a "roulette table on island 6" | [Dexerto wiki][dexw], [howtofish.buzz][buzz], [powerup][roul], [news] (casino island number conflicts) |
| **Boat** | A small motorboat. Engine upgrades ("Getting an upgrade", "I am speed": best engine), radar, boat skins. Can be **launched with dynamite** and "catch air" (achievement "I'm the bird now"). Players "dunked the boat into the volcano using 385 sticks of dynamite" | [gg], [ach], reviews |
| **Rods and tackle** | Starting rod, Crab-Fishing Rod ($3), "a good spinning rod" (Island 2), shiny rod skins. Bait/lures: Leech, Beginner/Standard/Professional/Scientific Lure and Boss Lure, Free Lure, **Hot Dog** ($1), **Carrot**, **Empty Beer Can**, Fish Bucket, Tuna Bait | [rod], [dexw], [ixbt] |
| **Weapons** | Fists → **Knife** ($45), **Brass Knuckles** → **Pistol** (players call it a "glock") → **SMG** ("uzi", "mac10") → **Shotgun** ($150) → **Assault Rifle** ("M4") → **Sniper Rifle** (the famous **golden** skin) → **Bow** (added around 1.1.x) → **Dynamite** ($25, thrown, can down the thrower). Attachments: iron sight (removed from sale), red dot, laser, compensator, suppressor. Weapon skins from the slot machine | [nbc], [ixbt], [allthings upgrades][upg], [buzz], [news], reviews |
| **Gambling** | **Roulette table** (red/black ×2, one green ×35; you drop an item on the table to set the bet, press E on a colour, the wheel spins; a ticking sound). Bugs: "infinite ticking at high values", the ball clipping through the wheel. **Slot machine ("Reel of Fortune")** on every island: you throw in a **dead Drip Creature** as the token; skins have common/rare/legendary outlines | [roul], [reel], [news] |
| **Fish (49)** | Bass, Bluegill, Perch, Pike, Mackerel, Cod, Catfish, Salmon, Eel, Gar, Goldfish, Clownfish, Angelfish, Anglerfish, Blobfish, Pufferfish, Seahorse, Lobster, Shrimp, Rock/Brown/**Spider Crab**, Sea Urchin, Stonefish, Sunfish, Oarfish, Goblin Shark, Blue Shark, Tuna, **Voxelfish**, **Superdwarf Fish**, **Bowlfish**, Dripper, The Old Pike… plus clams/seashells as early money | [dexw], [kotaku] |
| **Bosses** | Spider Crab (charges, then stuns itself) · Giant Piranha (flops and spews small piranhas) · Pufferfish (poison trail below 50% HP) · Old Pike, Sunfish, Goblin Shark, Blue Shark (mini/lure bosses) · Tuna (mini-boss whose death summons the Albatross) · **Albatross** (swoops and "shoots") · **Bowhead Whale** → **Mutated / Magma Whale** (the final boss, flies, covered in lava) | [bossguide], [gg], [gol], [buzz], reviews |
| **Drip creatures** | Rare "off-model" variants with **rainbow names**; the slot machine's only token; "the DRIP FISH designs… super quirky". The **Drip Gar** got a plush | [gg], [reel], [news] |
| **NPCs** | Lighthouse Keeper (bench, beer) · fish buyer outside the wooden cabin, **wearing a captain's hat** ([rod]) · the Tourist (quest "Vacation": keep him from drowning) · the lady in the forest ("Dinnertime": bring her grilled fish) · islanders (terrorizing birds) · a military operation / scientists ("Deadliest catch", Scientific lure) · the Fisherman (the plush; probably the player character's default look [UNVERIFIED]) | [ach], [rod], [mk1] |
| **Camp props** | **Grill** (cooking multiplies value; burnt food can be eaten: "Yummy in my tummy"), **anvil** (sharpening), **radio** (plays music), **beer can**, hot dog, cooler (a mod), sell boxes | [ach], [crab], [news] |
| **Hazards** | **Seagulls**: steal your catch, snatch fish off the line, carry downed friends away ("Let me go"); killing one with dynamite is "Everyone's dream" (2.1% of players) | [gol], [dexerto], [buzz] |
| **Mascot** | No official mascot. Closest: the **Fisherman** and the **Drip Gar** (plush petitions) | [news] |

---

## 5. Community moments and memes (fuel for gags)

1. **The seagull kidnapping.** The most-voted review (449 votes): "Hitting the nastiest trick shots of my life to then lose everything on black While my friend is being kidnapped by a seagull" ([Steam reviews][rev]). Also [GOL][gol], [Dexerto][dexerto].
2. **Slap revive**: "the funniest revive mechanic". Players "accidentally" kill friends just to slap them back ([GOL][gol], reviews).
3. **"BET IT ALL ON BLACK" / "Keep betting green. It'll hit. Eventually."** Hate for "LUCKY BAIT CASINO" ([rev]).
4. **"360 no scope"** fish and seagulls; "Drinking beer and 360 no scoping birds is my new hobby" ([Dexerto][dexerto]); "AWP | Fade (Factory New)" jokes.
5. **Failing at the real shop:** "when I went to a fishing shop and asked for a glock-19 and an M4 they seemed slightly confused" ([rev]).
6. **"Still don't know how to fish. 10/10"** (crab → piranha → lava whale), and "the title is misleading… I did not learn how to fish" ([rev]).
7. **"fish can take about 1000 shots from a uzi"**, "Doom with gills" ([Notebookcheck][nbc]).
8. **Friendly dynamite**: "My friend killed us both with dynamite and I lost everything betting on green" ([rev]); dynamite piles set off by a teammate ([GOL comments][gol2]).
9. **The lava whale**: a whale thrown into the volcano becomes a lava-spewing boss ([GOL comments][gol2]).
10. **"it won't let me gamble the boat"** after dunking it in the volcano with 385 dynamite ([rev]).
11. **The beer**: drinking the bait beer yourself loses the can ([Kotaku][kotaku]); the opening quest is about a stolen beer.
12. **"what kind of a fisher can't swim for more than 6 seconds?"** ([rev]).

Gag ideas for us, all within the locked script: the fish wearing a tiny "+$" bubble that pops red to "-$" at
l32 "gambles the savings"; a seagull **silhouette** (no claim in the VO) lifting one grey friend out of the frame in
the E6 failure run; a "FAIL ×N" counter that styles itself like a kill-score popup ("+FLY FISHING ×1.25" as a visual
pun); the slap with a hitmarker.

---

## 6. Translation table: their thing → our redraw

Blocks follow `docs/ep003/SHOT_PLAN.md` and `docs/ep003/hyperframes/DOPAMINE_PLAN.md`. Lines follow
`episodes/ep003/script.json`. Priority: P1 = needed for the cut, P2 = adds a lot, P3 = nice.

| # | Game reference | Our redraw (style, method) | Where (block · line) | Prio | IP-safe distance: must NOT copy |
|---|---|---|---|---|---|
| 1 | Health + hunger **rings** | **Our "SecondQuest fishing HUD", top-left:** a heart for health and a small fishbone ring for hunger, drawn in code. EP002-kit look (rounded, cream outline `#FFF4DC`, red `#E8484A`) | E3, E6, E7 · l29, l32, l33 | P1 | No ring pair in their layout; our hearts are the channel's own HUD language |
| 2 | Money counter, green "+$" / red "-$" floats | Coin pill top-right: a **fish-shaped coin** + rolling digits (number wheel already in the kit); "+$" floats green `#6BD66B`, "-$" red `#FF5A5A` | E3 "You sell your catch" (up), "You gamble the money" (rolls to 0), E6 · l29, l32 | P1 | Keep it generic (a $ amount is genre-standard); our coin icon, our font |
| 3 | 3-slot hotbar with a selected outline | **3 rounded slots, bottom-centre**, gold `#F5C542` outline on the selected slot; slots fill rod → pistol → dynamite with a slam (DOPAMINE E: "inventory HUD with empty slots + crickets, guns/dynamite slam in") | E3 · l29 "almost nothing… guns and dynamite" | P1 | Our slot shape (EP002 button style), our 3D icons; no copy of their slot art |
| 4 | Kill-score typing popup + bonus lines | **"FAIL ×N" combo card** that types on letter by letter, with bonus lines in our wording ("+SPLASH", "+WRONG TOOL", "+ALL IN", "+YEET") | E6 · l32 | P1 | Do not reuse their bonus names verbatim as a list. Generic FPS words (HEADSHOT) are fine but unnecessary |
| 5 | Boss health bar + white escape timer | Top-centre boss bar: name "???" in our type, red `#E8484A` fill, **plus a thin white timer bar under it** (a nod to the game). Over the boss shadow under the boat | E3 "You fight bosses" · l29 | P2 | Generic boss-bar idea; no boss name from the game; our frame |
| 6 | Stunned stars | Yellow KO stars `#FFD54A` circling (already in the shot plan for the slap) | E7 · l33 | P1 | Universal cartoon convention |
| 7 | Hitmarker / damage number | A white "X" hitmarker and "SLAP!" comic hit mark | A3 slap flash · l03; E7 · l33 | P2 | Universal FPS convention |
| 8 | Interaction prompt "Talk [E]" | Bottom-centre prompt pill "[E] Just get it" or "[E] Slap" (our gag) | B (phone) or E7 · l09, l33 | P3 | Our wording; key-cap in our button style |
| 9 | Rainbow drip text | The catch toast "You caught: a reason to hang out" with an animated rainbow gradient | D or G · l46 "the thing you could say out loud" | P3 | A rainbow gradient is generic; no "Drip" word |
| 10 | Diegetic shop (wooden board on a tree, shelf with price tags) | **Shop strip** as a wooden plank board with hanging price tags (`#9A6A3C` wood, cream tags): ROD $3 · PISTOL · SHOTGUN · DYNAMITE $25 | E3 · l29 | P1 | Our board design and our prices (round or omit theirs); no store logo |
| 11 | Roulette table (red/black, one green) | Our **3D roulette wheel**, a top-down mini wheel (red `#C8323A` / black `#1E1E24` / one green `#2E9E5B` slot); the ball lands on green in the "nobody admits who" gag | A3 "Gambling the fish money" · l03; E3/E6 · l29, l32 | P1 | Generic casino object; no "Lucky Bait" sign |
| 12 | Slot machine with a dead fish as the token | Our one-arm bandit: **three reels showing fish / fish / boot**; the fish companion refuses to go in the coin slot (sweat) | E3 · l29 (DOPAMINE: "slot reel to 0") | P2 | Fish-as-token is the game's idea: show it as a gag, not as their "Reel of Fortune" (no name, no art) |
| 13 | Golden sniper rifle | Our **toy-like sniper rifle** prop, gold `#E8B830` with a cream scope; the scope reticle for A3 | A3 "sniper rifle" · l03; E6 · l32 | P1 | Generic rifle silhouette, stylised and toy-like; no real gun model, no game skin |
| 14 | Pistol / SMG / shotgun | **Chunky toy-like prop set** (rounded edges, our palette, orange safety tips `#FF8A1F`) | E3 slam-in · l29; E6 "a weapon clearly not designed for fish" · l32 | P2 | Never real brands (Glock, M4, Uzi) |
| 15 | Dynamite ($25, thrown) | Existing `dynamite.png` (props3d). Add a **lit fuse spark** sprite and a cartoon blast puff | E3 · l29; E6 launch · l32 | P1 (have) | Generic |
| 16 | Small motorboat with engine/radar | Keep **our rowboat** (props3d). Optional: a tiny outboard motor to read as "upgraded" in the gear strip | A1, D, G | done | Our boat is not their boat. Do not add their radar UI |
| 17 | Lighthouse starter island | A **small island with a lighthouse silhouette** on the horizon of our lake plate (painted or a 3D cylinder, red `#D9443C` and white stripes) | D4 boat cuts, G night drift (lantern-like beam) · l24, l45 | P2 | A generic striped lighthouse; not their island layout |
| 18 | Grill (cooking fish) | **Small kettle grill** prop with smoke, for "fish night" | E8 "remember the fish night?" · l35 | P3 | Generic |
| 19 | Seagull (steals catch, carries friends) | **Seagull silhouette** gliding across the frame; at most it lifts a hat, never a claim in the VO (the seagull claim was cut) | E6 background · l32; or the A hook wide | P3 | Generic bird; no VO claim |
| 20 | Spider Crab / Giant Piranha / Lava Whale bosses | **One "boss shadow"** under the boat: a giant fish silhouette with crab-claw hints, and red eyes on the rumble | E3 · l29 "You fight bosses" | P1 | A shadow, not a model of any of their bosses |
| 21 | Beer can bait / hot dog bait | A **hot dog on a hook** (funnier, family-safe) as the bait icon in the hotbar | E3 · l29 | P3 | Avoid beer (channel tone); the hot-dog lure is a cheap generic gag |
| 22 | First-person hands | Our POV shot: **two cartoon hands** holding the rod, then the rod swaps for a rifle (a hotbar swap) | E3 · l28-l29 | P2 | Our hands (Quest's sleeve colour), not their arm models |
| 23 | Characters ("worm people", bean) | **Not used.** Quest, Pixie, grey silhouettes | everywhere | n/a | Never imitate their character designs or the bean |
| 24 | Proximity-voice indicator | A **speaker-wave icon** blinking over a silhouette in the boat (an "everyone talking" beat) | D or F5 Tuesday night · l24, l40 | P3 | Generic icon |
| 25 | Radar with dots | **Skip**, or use it as a **corkboard echo**: the D5 evidence board pins already do this job | — | — | — |
| 26 | Fishipedia | A "Fish-o-dex" card with **one** entry: our companion fish, "Seen: always. Caught: never." | G2 "nobody came for the fish" · l45 | P2 | Our name and layout |
| 27 | Title wordmark/logo | **Never shown.** Title as plain type "HOW TO FISH" in our font only (already done in A/G3) | A, G3 | rule | No logo, no capsule art |

---

## 7. Needs list for EP003 (all free: props3d + HUD in code)

**HUD components (Hyperframes/kit, drawn in code, one shared "fishing HUD" module):**
1. `hud_hearts_hunger` — heart health + fishbone hunger ring, top-left (P1).
2. `hud_coin_counter` — fish-coin pill, rolling digits, green "+$" / red "-$" floats (P1).
3. `hud_hotbar3` — 3 rounded slots, gold selected outline, slam-in fill animation (P1).
4. `hud_combo_card` — "FAIL ×N" typing popup with bonus lines (P1).
5. `hud_boss_bar` — "???" boss bar + white timer bar (P2).
6. `hud_hitmarker` + `ko_stars` + `slap_mark` (P1; stars and the slap are in the shot plan already).
7. `hud_prompt_pill` — "[E] …" key-cap prompt (P3).
8. `toast_rainbow` — catch toast with an animated gradient (P3).
9. `fishodex_card` — one-entry index card (P2).

**3D props (tools/props3d, toy style, our palette):**
10. `sniper_gold` (+ scope reticle overlay for A3) (P1).
11. `toy_guns` set: pistol, SMG, shotgun (P2).
12. `roulette_wheel` (3D, with one green slot + ball) (P1). `chips.png` already exists.
13. `slot_machine` with fish/fish/boot reels (P2).
14. `shop_board` — a wooden plank with hanging price tags (P1; could be 2D in code).
15. `dynamite` fuse-spark + blast-puff sprites (P1; dynamite exists).
16. `boss_shadow` — a giant silhouette under the boat, with red eyes (P1).
17. `lighthouse` — a striped tower for the horizon (P2).
18. `kettle_grill` with smoke (P3).
19. `seagull` silhouette with a flap cycle (P3).
20. `hotdog_lure` icon (P3).
21. `fp_hands` — two cartoon hands for the POV rod → rifle swap (P2).
22. Optional: `outboard_motor` add-on for the rowboat (P3).

Reuse (already built): rowboat (34/side), rod, dynamite, chips, fish2 expression set, lantern, trashcan, golf flag.

---

## 8. Eyes-on checklist (10 min on the Steam page, nothing saved)

Open https://store.steampowered.com/app/4001890/How_to_Fish/ screenshots and the trailer and tick:
- [ ] Where are the health/hunger rings (corner)? Their colours?
- [ ] Where is the money counter? $ icon or coin? Font (rounded/blocky/pixel)?
- [ ] Hotbar position (top or bottom) and slot shape (square/rounded), count.
- [ ] Kill-score popup position (centre or side) and colour.
- [ ] Boss bar: top-centre? Width? Colour of the timer bar.
- [ ] Player character look (head shape, eyes, default outfit colour; the "Fisherman").
- [ ] Sea/sand/sky dominant colours (replace the [OURS] palette hexes in §2 if ours read too close or too far).
- [ ] The boat's shape (motorboat, colour) so our rowboat stays clearly different.
- [ ] Is there any night or dusk in the trailer?
- [ ] Family Sharing and no Remote Play / Friend's Pass (for l09), before Bram records.

---

## Sources
[steam]: https://store.steampowered.com/app/4001890/How_to_Fish/
[news]: https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=4001890&count=40&maxlength=0&format=json
[rev]: https://store.steampowered.com/appreviews/4001890?json=1&filter=all&language=english
[sga]: https://swedengamearena.com/en/news/dazed-games-hits-one-million-copies-sold-just-two-days/
[alinea]: https://alineaanalytics.substack.com/p/steams-top-september-2026-games
[cinevva]: https://app.cinevva.com/news/2026-09-04-how-to-fish-august-indie-sales
[automaton]: https://automaton-media.com/articles/newsjp/20260821-461559/
[pcgh]: https://www.pcgameshardware.de/Indie-Games-Thema-239276/News/How-to-Fish-Spielerzahlen-Reviews-Erfolg-auf-Steam-1552013/
[dlc]: https://www.dlcompare.com/gaming-news/steam-has-a-new-obsession-how-to-fish
[80lv]: https://80.lv/articles/this-indie-fishing-simulation-game-sold-1-million-copies-in-2-days
[nbc]: https://www.notebookcheck.net/Doom-but-with-gills-Why-this-new-indie-game-is-blowing-up-on-Steam.1376899.0.html
[kotaku]: https://kotaku.com/how-to-fish-spider-crab-murder-2000728082
[ixbt]: https://ixbt.games/en/reviews/2026/08/26/glusim-rybu-vmeste-s-druziami-obzor-frendslop-how-to-fish.amp.html
[gol]: https://www.gamingonlinux.com/2026/08/how-to-fish-is-another-brilliantly-funny-online-co-op-game
[gol2]: https://www.gamingonlinux.com/2026/09/the-truly-hilarious-co-op-game-how-to-fish-gets-a-first-content-update/
[gamewave]: https://gamewave.fr/how-to-fish/le-phenomene-how-to-fish-explose-tout-et-depasse-le-million-de-ventes-en-seulement-48-heures/
[dexerto]: https://www.dexerto.com/gaming/new-hit-co-op-game-lets-you-shoot-fish-gamble-your-catch-and-fight-seagulls-3400863/
[dexw]: https://www.dexerto.com/wikis/how-to-fish/
[medium]: https://medium.com/@spencer2457/learning-how-to-fish-badly-with-guns-95e5a4030b46
[gg]: https://games.gg/how-to-fish/guides/
[rod]: https://allthings.how/how-to-use-the-fishing-rod-and-sell-your-catch/
[crab]: https://allthings.how/how-to-fish-beat-the-spider-crab-first-boss-and-get-the-boat-keys/
[reel]: https://allthings.how/how-to-fish-how-to-use-the-reel-of-fortune-for-weapon-skins/
[upg]: https://allthings.how/how-to-fish-the-upgrades-and-weapons-worth-buying-first/
[trick]: https://allthings.how/how-to-fish-trickshots-every-killscore-multiplier-and-combo/
[ach]: https://allthings.how/how-to-fish-how-to-get-all-28-achievements/
[bossguide]: https://gameplay.tips/guides/how-to-fish-boss-guide-useful-tips.html
[buzz]: https://howtofish.buzz/guides/dynamite/
[roul]: https://powerupgaming.co.uk/2026/08/26/how-to-fish-roulette-safe-betting-guide/
[morecol]: https://thunderstore.io/c/how-to-fish/p/Sopika/More_Colours/v/1.0.1/
[hudctl]: https://thunderstore.io/c/how-to-fish/p/PonyFisher/HudControl/
[enh]: https://thunderstore.io/c/how-to-fish/p/Linux_Squad/Enhanced_HowToFish/v/1.0.6/
[cooler]: https://thunderstore.io/c/how-to-fish/p/PonyFisher/Cooler_Mod/
[mk1]: https://www.makeship.com/petitions/fisherman
[mk2]: https://www.makeship.com/petitions/drip-gar

- Steam store: https://store.steampowered.com/app/4001890/How_to_Fish/
- Steam news / patch notes (API, text only): https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=4001890
- Steam reviews (API, text only): https://store.steampowered.com/appreviews/4001890?json=1
- Sweden Game Arena: https://swedengamearena.com/en/news/dazed-games-hits-one-million-copies-sold-just-two-days/
- Alinea Analytics: https://alineaanalytics.substack.com/p/steams-top-september-2026-games
- Automaton (JP): https://automaton-media.com/articles/newsjp/20260821-461559/
- PC Games Hardware (DE): https://www.pcgameshardware.de/Indie-Games-Thema-239276/News/How-to-Fish-Spielerzahlen-Reviews-Erfolg-auf-Steam-1552013/
- dlcompare: https://www.dlcompare.com/gaming-news/steam-has-a-new-obsession-how-to-fish
- 80.lv: https://80.lv/articles/this-indie-fishing-simulation-game-sold-1-million-copies-in-2-days
- Notebookcheck: https://www.notebookcheck.net/Doom-but-with-gills-Why-this-new-indie-game-is-blowing-up-on-Steam.1376899.0.html
- Kotaku: https://kotaku.com/how-to-fish-spider-crab-murder-2000728082
- ixbt.games: https://ixbt.games/en/reviews/2026/08/26/glusim-rybu-vmeste-s-druziami-obzor-frendslop-how-to-fish.amp.html
- GamingOnLinux (launch): https://www.gamingonlinux.com/2026/08/how-to-fish-is-another-brilliantly-funny-online-co-op-game
- GamingOnLinux (Islet update): https://www.gamingonlinux.com/2026/09/the-truly-hilarious-co-op-game-how-to-fish-gets-a-first-content-update/
- Rock Paper Shotgun (quoted via the Steam news feed): https://www.rockpapershotgun.com/how-to-fish-is-steams-latest-cursed-co-op-sensation-now-updated-with-private-lobbies-eight-player-support-and-anti-griefer-measures
- Gamewave (FR): https://gamewave.fr/how-to-fish/le-phenomene-how-to-fish-explose-tout-et-depasse-le-million-de-ventes-en-seulement-48-heures/
- Dexerto article and wiki: https://www.dexerto.com/gaming/new-hit-co-op-game-lets-you-shoot-fish-gamble-your-catch-and-fight-seagulls-3400863/ · https://www.dexerto.com/wikis/how-to-fish/
- Guides: https://games.gg/how-to-fish/guides/ · https://allthings.how/how-to-use-the-fishing-rod-and-sell-your-catch/ · https://allthings.how/how-to-fish-beat-the-spider-crab-first-boss-and-get-the-boat-keys/ · https://allthings.how/how-to-fish-how-to-use-the-reel-of-fortune-for-weapon-skins/ · https://allthings.how/how-to-fish-the-upgrades-and-weapons-worth-buying-first/ · https://allthings.how/how-to-fish-trickshots-every-killscore-multiplier-and-combo/ · https://allthings.how/how-to-fish-how-to-get-all-28-achievements/ · https://gameplay.tips/guides/how-to-fish-boss-guide-useful-tips.html · https://howtofish.buzz/guides/dynamite/ · https://powerupgaming.co.uk/2026/08/26/how-to-fish-roulette-safe-betting-guide/
- Mods (vanilla HUD element names): https://thunderstore.io/c/how-to-fish/p/Sopika/More_Colours/v/1.0.1/ · https://thunderstore.io/c/how-to-fish/p/PonyFisher/HudControl/ · https://thunderstore.io/c/how-to-fish/p/Linux_Squad/Enhanced_HowToFish/v/1.0.6/ · https://thunderstore.io/c/how-to-fish/p/PonyFisher/Cooler_Mod/
- Makeship: https://www.makeship.com/petitions/fisherman · https://www.makeship.com/petitions/drip-gar
- Medium (opinion): https://medium.com/@spencer2457/learning-how-to-fish-badly-with-guns-95e5a4030b46
