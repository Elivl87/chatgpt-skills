# Dave the Diver · Game visual reference (MINTROCKET / NEXON, 2023)

Producer rule (2026-10-18, PRODUCER_DECISIONS.md): research "complete and exact" (protagonists, fish types, sea floors/zones,
the sushi restaurant, who comes to it, the exact boat) so the world can be rebuilt faithfully "like How to Fish".

Channel constraint: we never use the game's footage, screenshots, logo, names-as-branding or ripped assets. We redraw in
our own style (painterly cartoon + procedural 3D props + HUD drawn in code). **Quest plays Dave in costume; Quest's identity
is kept** (his face, his proportions, his colours). No image or video from the game was downloaded or stored. Everything
here comes from text: the Fandom wiki (read as wikitext through its public API), the Steam page, Wikipedia, dev interviews,
reviews and guides. All of it was treated as untrusted data.

Research date: 2026-10-18. Status tags: **[V]** first-party text or 2+ independent sources · **[W]** the Fandom wiki only
(fan-written but detailed, often quoting in-game text) · **[1S]** one secondary source · **[UNVERIFIED]** not found in any
text; a recollection or best guess to check eyes-on (§8) · **[OURS]** our design proposal, not a fact about the game.

> **Honest limit.** Text sources describe what exists (characters, zones, fish, apps, mechanics) very well, and in-game
> item descriptions give some colours (spider crab, oarfish). They almost never give a character's outfit colours, the
> HUD layout or the exact look of the boat. The wiki's appearance fields are mostly blank (hair/eye colour only).
> TV Tropes and NamuWiki were blocked (403). So **every outfit colour, HUD position and the boat's shape below is
> [UNVERIFIED]** until the §8 eyes-on pass. Do not build final art from an [UNVERIFIED] line without that check.

---

## 0. Eyes-on, from official images (Producer: "Busca en la web el bote, el traje, y hazlo tú", 2026-10-18)
Studied (not saved, not used in the video) from the official Steam store screenshots
(https://store.steampowered.com/app/1868140/) and the fan wiki's official character art. These override the
UNVERIFIED items below for the boat, Dave's suit, Cobra, Bancho and the sushi bar.

**Dave (dive suit):** very round body on thin legs; full-body **navy-blue** wetsuit with an integrated **hood**; a
**yellow mask pushed up on the hood**; **dark beard and moustache**, brown eyes; **black gloves**; **black belt** with grey
weight/buckle blocks; **yellow tank** on black harness straps (regulator hose over the shoulder); **yellow fins**.
Big easy grin. Off duty: light grey short-sleeve shirt over a pink tee, dark trousers, a khaki bucket/straw hat.
→ Producer, 2026-10-19: Quest wears **Dave's outfits** (dive suit and off-duty restaurant clothes), keeping his face and
his curly fringe visible (costume rule). Painted fresh by us, never traced from the game's sprite.

**Cobra's boat ("Nodens 68" on the hull):** a mid-size dive/cabin boat seen side-on. Upper hull and cabin **pale aqua /
white**; lower hull **dark maroon-red**, the name in teal letters with the number in gold near the bow; **wheelhouse with
wide windows** at the front; a **big teal-and-chrome searchlight drum** on the cabin roof inside a railing, plus a whip
antenna; the aft open deck under a **yellow canvas canopy** on a dark-teal frame; **scuba tanks (grey and yellow)** standing
on deck; the **yellow equipment box** (opens gear/boat-skin menus); **tan rope coils** hanging over the side; a stern rail
where Dave sits before diving; Cobra stands on deck. Skins only repaint it (default "Basic"; blue unlocks early).
→ Our props3d boat is a NEW model (the EP003 rowboat does not fit): same family (cabin + canopy + searchlight), our
proportions, our name on the hull (never "Nodens 68"), our colours.

**Cobra:** white swept-back hair, dark sunglasses, white goatee; open **red/orange Hawaiian shirt** (banana print) over a
grey tee, gold chain. **Bancho:** dark skin, bald with a **blue hachimaki headband**, small round dark glasses, black beard,
light-blue kimono/robe (white chef top with a red sash in cooking scenes). **Otto:** straw hat, red scarf, scar.
**Yoshie:** hair bun, red glasses, dark suit. (We evoke them; we do not redraw them 1:1.)

**Bancho Sushi, exterior (night):** a floating restaurant on a pontoon ringed with **black tyres**, at the foot of
**limestone karst cliffs with jungle** (Ha Long Bay-like); red Japanese roof, a big **pink neon sign** and **"SUSHI" letters**
on the roof, two gold fish ornaments, red paper lanterns; small boats moored beside it. Daytime bay: turquoise water, the
same karst towers, palms.
**Bancho Sushi, interior (service):** side view of a **long wooden counter** with ~13 stools; customers in a row, each with
a **grey order bubble** showing the dish and short reactions under them ("This looks good!"); hanging **globe lamps**;
**pink neon "OPEN"** sign, a neon **"EAT DRINK LOVE"**, an **orange neon kanji sign** (Bancho Sushi); a shelf of sake
bottles; speakers with pink neon trim; menu boards; pink drapes and a **cherry-blossom tree** at the top right; an
**aquarium tank** at the right end; the kitchen behind the counter. Daytime view: wooden beams, a big window onto a fish tank.
**Restaurant HUD (bar):** gold counter top-left ("6,000"); Cooksta handle + follower bar ("#bancho_sushi", 0/500) next to
it; quest list under it; **date + weather top-right** ("Tue 10.25" + sun) above a **round day/evening clock dial**; a
**vertical wasabi gauge** with a leaf icon at the right edge; bottom bar: Phone (left), Menu, Research, Staff,
Ingredients, Interior.
**Dive look:** blocky low-poly 3D reefs (stepped stone shelves, sand tops, coral fans, kelp), pixel-art Dave as a tiny
yellow-tanked figure, light shafts; deeper = teal → navy with marine snow. (Dive HUD is not in the store shots: keep §HUD.)

## 1. Facts check

| Fact | Value | Sources | Status |
|---|---|---|---|
| Title | **DAVE THE DIVER** (stylised in caps) | [Steam][steam], [wiki game page](https://davethediver.fandom.com/wiki/DAVE_THE_DIVER) | [V] |
| Developer / publisher | **MINTROCKET** (a NEXON sub-brand); the store lists MINTROCKET for both | [Steam][steam], [Wikipedia](https://en.wikipedia.org/wiki/Dave_the_Diver) | [V] |
| Release | Early Access Oct 26/27 2022; 1.0 **June 28 2023** (PC/Mac); Switch Oct 26 2023; PS4/PS5 Apr 16 2024; Switch 2 Nov 6 2025; Xbox Nov 20 2025; iOS/Android Sep 17 2026 | [Steam][steam], [wiki game page](https://davethediver.fandom.com/wiki/DAVE_THE_DIVER) | [V] |
| Engine | Unity | [wiki game page](https://davethediver.fandom.com/wiki/DAVE_THE_DIVER), [Wikipedia](https://en.wikipedia.org/wiki/Dave_the_Diver) | [V] |
| Director | **Jaeho Hwang** (Hwang Jae-ho). Artist credit: Kiyeop Chung | [Wikipedia](https://en.wikipedia.org/wiki/Dave_the_Diver), [Game Developer][gd] | [V] |
| Origin | A real Jeju Island restaurant whose owner dives for ingredients by day and serves them at night. Influences: *Torneko's Great Adventure*, *Abzu*, *Metal Gear Solid* | [Wikipedia](https://en.wikipedia.org/wiki/Dave_the_Diver) | [1S] |
| Store blurb (excerpt) | "a casual, singleplayer adventure RPG featuring deep-sea exploration and fishing during the day and sushi restaurant management at night" | [Steam][steam] | [V] |
| Art blurb (verbatim) | "A combination of pixel and 3D graphics provides a stunning art style that showcases breathtaking underwater scenery." "...a Blue Hole filled with over 200 kinds of sea creatures." | [Steam][steam], [wiki game page](https://davethediver.fandom.com/wiki/DAVE_THE_DIVER) | [V] |
| Reviews / awards | Steam Overwhelmingly Positive (96% of 51,427 English); Metacritic 90; Steam Award 2023 "Sit Back and Relax" | [Steam][steam] | [V] |
| Sales | 1M in 10 days; 3M by Jan 2024; 5M+ all platforms by Nov 2024 | [Wikipedia](https://en.wikipedia.org/wiki/Dave_the_Diver) | [1S] |
| Steam tags | Pixel Graphics, Management, Casual, Adventure, Relaxing, Exploration, Fishing, Underwater, Roguelite, 2D, Funny | [Steam][steam] | [V] |
| DLC / collabs | DREDGE pack (free, Dec 15 2023: red-fog nights, aberrant fish, Hooded Figures); Godzilla pack (time-limited); Ichiban's Holiday (Like a Dragon); Guilty Gear Strive pack; **In the Jungle** (paid, June 18 2026); cameo in *Balatro*, *Potion Craft*, Fortnite skin | [wiki game page](https://davethediver.fandom.com/wiki/DAVE_THE_DIVER), [wiki Dave](https://davethediver.fandom.com/wiki/Dave), [games.gg][fn] | [V] |
| Prequel | *Bancho the Chef* (announced June 2 2026, PC/PS5), young Bancho with hair, leaves pixel art for a "renewed" look | [Wikipedia](https://en.wikipedia.org/wiki/Dave_the_Diver), [gaming.net][bancho2] | [1S] |

---

## 2. Art style and palette

| Aspect | What the sources say | Status |
|---|---|---|
| Core recipe | **2D pixel-art characters and small fish over 3D background objects.** Hwang: flat 2D pixels underwater were "not that aesthetically pleasing"; adding 3D background objects "felt much deeper and looked unique". Later the 3D spread to big sea creatures: "making 2D Dave fight 3D sharks" was "the most difficult task" | [Game Developer][gd] | [V] |
| Who is pixel, who is 3D | A player reading: Dave and smaller characters pixel art; larger bosses, environments, boats and buildings 3D | [Steam forum (search snippet)](https://steamcommunity.com/app/1868140/discussions/0/3814034217016826784) | [1S] |
| Animation | "the art-style from pixel games like Pokémon Black and White has been perfected in the animation of its creatures"; "many quirky animations"; "googly-eyed fish" | [NWR][nwr], [Rogueliker][rl], [Inven][inven] | [V] |
| Cutscenes | "over the top anime montages with a more traditional pixel-art style" (NWR); "two to four cutscenes for every recurring event" (one per unlocked mechanic: tea, beer, cocktails, research); "manga cutscenes and near-photorealistic close-ups" (one review); players praised them "for their style and humour" | [NWR][nwr], [Epilogue][epi], [Wikipedia](https://en.wikipedia.org/wiki/Dave_the_Diver) | [V] |
| Bancho cutscenes | Routine meal prep turns into a dramatic animation; Yoshie's reaction to the shark head is a wiki GIF ("Yoshie after eating Whole-Roasted Shark Head"); "One of Bancho's cutscene animations" GIF | [wiki Bancho](https://davethediver.fandom.com/wiki/Bancho), [wiki Yoshie](https://davethediver.fandom.com/wiki/Yoshie) | [W] |
| Mood | "calm and tense": scenic photo-taking vs risky looting; a "closed but changing environment" (the Blue Hole re-rolls each dive) | [Game Developer][gd], [wiki Blue Hole](https://davethediver.fandom.com/wiki/Blue_Hole) | [V] |
| Palette (game) | Only text: a "2D, bright blue ocean background" caption; "charming environments with tons of color"; "balmy tropical locations"; art "differentiating the different depths" | [Game Developer][gd], [Scalzi][scalzi], [Rogueliker][rl], [NWR][nwr] | [1S] |
| Palette per zone | Not described in text. Plausible from zone content: shallows turquoise + coral; medium deeper blue + limestone caves; depths near-black navy with bioluminescence; glacial pale cyan/white ice; vents dark rock with orange/red glow | [UNVERIFIED] |
| Light shafts / caustics | Not described in text. Recalled: god rays and surface shimmer in the shallows, darkness and a headlamp cone below | [UNVERIFIED] |
| Proposed palette | **[OURS], not measured:** surface `#7FE3E8` → shallows `#2BB3C0` → medium `#1A6E8E` → depths `#0E2E4F` → abyss `#071528`; glacial `#BFEFFF`/`#E9FBFF`; vents rock `#2A1E22` + glow `#FF7A2E`; coral pinks `#FF7FA0`/`#FFB347`; sushi-bar wood `#C08A52`, noren indigo `#24407A` | [OURS] |

**How we use this:** our painterly plates are the "3D background" layer and our procedural props are the foreground. We
keep the game's *idea* (flat cartoon character on deep, layered water) and redraw everything. We never imitate the pixel
sprites; Quest stays Quest.

---

## 3. Characters (looks in words)

| Character | Role | Look (text-confirmed) | Look to check eyes-on [UNVERIFIED] | Sources |
|---|---|---|---|---|
| **Dave** | Protagonist, diver, sushi-bar helper; "a big fan of food" | **Portly / rotund / plump**, "pudgy every-man" yet "a pretty agile swimmer"; hair **brown**, eyes listed brown; "tiny beady eyes" (TV Tropes, via search). Has a non-diving outfit. Fortnite skin: "classic wetsuit look" + **oxygen-tank back bling**. Figure: five heads (cheerful, neutral, focused, two with a **regulator**, one strained), **head-mounted mask** and full mask, harpoon gun, thumbs-up hands | Short beard/stubble, **no glasses**; default wetsuit dark blue/black with light-blue trim; yellow/grey tank on the back; fins; hood. Upgraded suits are stats (Lv1 40 m → Lv6 540 m), plus a **cold-resistant suit** (Glacial) and a Jungle suit. Whether suit colour changes per level: unknown | [wiki Dave](https://davethediver.fandom.com/wiki/Dave), [Rogueliker][rl], [toy-people][toy], [Sideshow][side], [games.gg][fn], [wiki Equipment](https://davethediver.fandom.com/wiki/Equipment) |
| **Cobra** | Investor, drives the boat, runs the **Cobra Shop** on deck (morning/afternoon only); hires Dave out without asking | Hair **white**; a "retired special forces agent and 2026-Josh Homme lookalike"; "former arms dealer" (one review). Came from Nexon's *EVIL FACTORY* | Sunglasses, tanned, sleeveless/casual top | [wiki Cobra](https://davethediver.fandom.com/wiki/Cobra), [Rogueliker][rl] |
| **Bancho** | Head chef of Bancho Sushi; trained in Japan, ex-Dugong Hotel | **Bald** ("hair-free", stoic); had an afro in the prequel. Rants about "the soul of the sea and land"; never serves the same dish twice; name = "delinquent leader" | Tall and broad, white chef's coat, headband/towel, stern face, knife flourishes | [wiki Bancho](https://davethediver.fandom.com/wiki/Bancho), [gaming.net][bancho2] |
| **Yoshie** | Recruiter (hires staff), Bancho's old manager | Hair **black** | Business suit, glasses | [wiki Yoshie](https://davethediver.fandom.com/wiki/Yoshie) |
| **Duff** | Weapon expert, "full time otaku", seen only by **video call**; loves the anime *Stra Stella* and his **Leahs-chan figure** | Hair **blond**; "He made my skin crawl" (a player) | Glasses, plump, room full of figures | [wiki Duff](https://davethediver.fandom.com/wiki/Duff), [Scalzi][scalzi] |
| **Dr. Bacon** | Archeologist of the Sea People; arrives on **his own motorboat**; gives iDiver, radar, camera, gloves | (no text) gets drunk and vomits into the sea (Sea Blue blames Dave) | Lab coat, moustache, glasses | [wiki Bacon](https://davethediver.fandom.com/wiki/Dr._Bacon), [wiki Watson](https://davethediver.fandom.com/wiki/John_Watson) |
| **Otto** | Farmer: fish farm, rice paddy, vegetables; ex-diver "until he took a harpoon to the knee" | **Straw hat, curved scar under the eye, red scarf, blue overalls** (a Luffy nod) | — | [wiki Otto](https://davethediver.fandom.com/wiki/Otto) |
| **MC Sammy** | Rapper VIP, Otto's son; later runs the chicken farm | A Dennis Rodman nod (wiki trivia) | Dyed hair, chains | [wiki Sammy](https://davethediver.fandom.com/wiki/Sammy) |
| **John Watson** | Leader of eco-group **Sea Blue** (a front); boss 3 times | Alleged ex-Navy SEAL; fights with a **grenade launcher**, then "Eco-friendly Sea Blue Armor RX-93" (a mech suit), then a **submersible** firing missiles; flees "literally in his underwear" | Sea Blue logo, crew cut | [wiki Watson](https://davethediver.fandom.com/wiki/John_Watson), [wiki Sea Blue](https://davethediver.fandom.com/wiki/Sea_Blue) |
| **Ellie** | Biology grad student, Ecowatcher app; video calls | Hair and eyes **brown**; brings her Ecowatcher bag | — | [wiki Ellie](https://davethediver.fandom.com/wiki/Ellie) |
| **Sato** | MarinCa card collector, a Satoshi/Ash parody | Hair **black**; arrives on a **pedal boat / paddleboat** | Cap | [wiki Sato](https://davethediver.fandom.com/wiki/Sato) |
| **Udo** | Reporter, *Weekly Fish*; buys photos | Hair **black**; camera with flash | — | [wiki Udo](https://davethediver.fandom.com/wiki/Udo) |
| **Momo** (cat) | Restaurant mascot | **Black and white** cat; lounges on **the far end of the bar counter** by day, leaves at night; kitten **Mochi** | — | [wiki Momo](https://davethediver.fandom.com/wiki/Momo) |
| **Maki** | Silent girl, best cook on staff | Hair black, eyes grey | — | [wiki Maki](https://davethediver.fandom.com/wiki/Maki) |
| **Sea People** ("Low-Dwellers") | Village under the Depths | **Humanoid torsos with fish-like lower bodies**. Ramo (chief's daughter, **blonde**), Suwam (guardian, black hair, brags), Tenzhin (chief; mistakes Dave for "a blue manatee"), Mima (dumpling cook), Duwa (smith), Junak, Yami, Gumo | Mer-people with fins and tribal ornaments | [wiki Sea People](https://davethediver.fandom.com/wiki/Sea_People), [wiki Ramo](https://davethediver.fandom.com/wiki/Ramo), [wiki Tenzhin](https://davethediver.fandom.com/wiki/Tenzhin) |
| **VIPs** | Recurring "boss customers" | Vincent "The Gourmet" Yamaoka (blond, TV judge) + presenter Yui (brown hair, show "Star★The Chef"); **Michael Bang** (a Michael Bay nod, film *The Stone*); MC Sammy; chef rivals Wang Pang, Alex Cooper "The Fish Frier", Pastro Antogiovani; actress-critic **Lois Crawford** (blonde, blue eyes); Bartender (Yakuza DLC) | — | [wiki Characters](https://davethediver.fandom.com/wiki/Characters), [wiki Vincent](https://davethediver.fandom.com/wiki/Vincent), [wiki Lois](https://davethediver.fandom.com/wiki/Lois_Crawford), [wiki Bang](https://davethediver.fandom.com/wiki/Michael_Bang) |
| **Staff** | 24 hireable staff (Kyoko is the first server) | Cooks and servers, levelled with stats Cooking / Serving / Procure / Appeal | — | [wiki Staff](https://davethediver.fandom.com/wiki/Sushi_Staff) |

Running gag (text): Dave is the butt of fat jokes ("too many jokes about Dave being overweight", [Epilogue][epi]). **We do
NOT carry this gag over** onto Quest.

---

## 4. The boat

| Item | What the sources say | Status |
|---|---|---|
| Owner / role | **Cobra drives the boat** and runs a small shop from it; "Cobra's plan seems to be mainly sitting in the boat while Dave dives" | [Rogueliker][rl] [1S]; shop [W] ([wiki Cobra](https://davethediver.fandom.com/wiki/Cobra)) |
| Where it sits | On the surface over the **Blue Hole**; every dive starts and ends there ("sent back to Cobra's boat"); **Escape Pods** "escape to your boat" | [Rogueliker][rl], [wiki Escape Pod](https://davethediver.fandom.com/wiki/Escape_Pod) [V] |
| Upgrades | "**While the boat can't be upgraded**, one can change the skin" | [wiki Equipment](https://davethediver.fandom.com/wiki/Equipment) [W] |
| Skins (paint jobs) | Basic (default), Big Wave, Poseidon (trident), Thunderstorm, Stra Stella, GYAO!, Godzilla, Sweet Dream (Dave's dream), Bancho Sushi (promo), Dave Supporter (Dave+Bancho+Cobra), The Diver (Dave's costume), **Banana** ("a boat skin that Cobra likes"), Monster of Blue Hole (Lusca), Sea Blue logo, and collab skins | [wiki Equipment](https://davethediver.fandom.com/wiki/Equipment) [W] |
| Other boats | Dr. Bacon's **motorboat**; Sato's **paddleboat** (pedal boat, Agumon-shaped in the Jungle DLC); Sea Blue's **submersible**; a speedboat chase sequence ([inkl review snippet](https://www.inkl.com/news/dave-the-diver-review)) | [wiki Bacon](https://davethediver.fandom.com/wiki/Dr._Bacon), [wiki Sato](https://davethediver.fandom.com/wiki/Sato), [wiki Watson](https://davethediver.fandom.com/wiki/John_Watson) [W]/[1S] |
| Shape, colour, size, deck props, dive animation | Not in any text. Recalled: a small white-and-blue motorboat seen side-on at the top of the screen, Cobra standing on deck, Dave rolling backward into the water | [UNVERIFIED] |

Our redraw: keep **our rowboat** (props3d) for Quest and friends, or add a small outboard. Do not copy the paint skins.

---

## 5. The Blue Hole (zones in order)

| # | Zone | Depth | Content and landmarks (text) | Look (colours) | Sources |
|---|---|---|---|---|---|
| 0 | Surface | 0 m | Boat; Cobra's shop; dolphins, humpback mother whale "taking the majority of the surface area of the background" | Sunlit tropical sea [UNVERIFIED] | [wiki Humpback](https://davethediver.fandom.com/wiki/Humpback_Whale) |
| 1 | **Blue Hole Shallows** | 0-50 m | Small, pretty fish; a special **tall-seaweed map variant** (Sheepshead, Striped Catfish); Pink Dolphin photo spot (bottom east); manta (top east, night); loggerhead turtle (west); **vortex/whirlpool** on stormy nights to a cave of shipping containers and an **overturned dump truck** (Truck Hermit Crab lair) | Turquoise + coral [UNVERIFIED] | [wiki Shallows](https://davethediver.fandom.com/wiki/Blue_Hole_Shallows), [wiki Camera](https://davethediver.fandom.com/wiki/Underwater_Camera), [wiki Stormy Night](https://davethediver.fandom.com/wiki/Stormy_Night) |
| 2 | **Blue Hole Medium Depth** | 50-130 m | **Limestone/Stalactite Cave** with strong currents and **thorn patches**; **Sea People Record Chamber** (murals, stone records, mural of King Long); **Under Sunken Ship / Shipwreck Interior**; kelp; **lowest level for night dives** even with the Deep Sea Headlamp | Deeper blue, rock caves [UNVERIFIED] | [wiki Medium](https://davethediver.fandom.com/wiki/Blue_Hole_Medium_Depth), [wiki Kelp](https://davethediver.fandom.com/wiki/Kelp) |
| 3 | **Blue Hole Depths** | 130-250 m | Fixed layouts (2 maps); **large clams that give air**; Escape Pods; a seaweed farm; **entrance to the Sea People Village**; no night access ("too dark to see") | Near-black, bioluminescent [UNVERIFIED] | [wiki Depths](https://davethediver.fandom.com/wiki/Blue_Hole_Depths) |
| 4 | **Sea People Village** | (hub) | Safe zone, no O₂ loss, autosave; **magic mirror** to the surface (works by day, by sun or Divine Tree fruit light); Mima's Restaurant, Seed Shop, Blacksmith (Duwa), **Game Parlor** with **seahorse racecourse**, shark-teeth game, hermit-crab shell game; Tenzhin's House; King Long Shrine; Divine Fruit Tree | Warm glow [UNVERIFIED] | [wiki Village](https://davethediver.fandom.com/wiki/Sea_People_Village), [wiki Mirror](https://davethediver.fandom.com/wiki/Sea_People_Mirror), [wiki Parlor](https://davethediver.fandom.com/wiki/Game_Parlor) |
| 5 | **Glacier Passage** | ~420 m (fish-farm label) | Small; only via the village; **gadons**, boss Giant Gadon (a chase through stalactites and falling ice) | Ice blue [UNVERIFIED] | [wiki Passage](https://davethediver.fandom.com/wiki/Glacier_Passage), [wiki Gadon](https://davethediver.fandom.com/wiki/Giant_Gadon) |
| 6 | **Glacial Area / Glacier Zone** | ~540 m (label) | Arctic fauna; **large icicles**; massive Lion's Mane Jellyfish; three glacial caves (doors marked square / circle / diamond; traps, a **beluga ride**, Phantom Jellyfish, Helicoprion); Ice Hollow; Glacial Seaweed Cave; needs the cold-resistant suit; **giant mirror** access | Pale cyan/white [UNVERIFIED] | [wiki Glacial](https://davethediver.fandom.com/wiki/Glacial_Area) |
| 7 | **Hydrothermal Vents** | (below the icicles) | Prehistoric fauna (Kronosaurus, Dunkleosteus, Anomalocaris, Coelacanth...); **Ancient Control Room** (finale), rubies; too hot at first until the Control Room is fixed | Dark rock + volcanic glow [UNVERIFIED] | [wiki Vents](https://davethediver.fandom.com/wiki/Hydrothermal_Vents), [wiki Control Room](https://davethediver.fandom.com/wiki/Ancient_Control_Room_(finale)) |
| — | Sea Blue base | hidden in the Hole | Secret dolphin-meat facility, a night infiltration (stealth, MGS nod) | — | [wiki Sea Blue](https://davethediver.fandom.com/wiki/Sea_Blue) |

Night dives: unlocked by Otto's moray-eel request; nocturnal fish (moray, mantis shrimp, box jellyfish, lobsters, manta,
Klaus, Lusca). **Weather app**: stormy nights (whirlpools, boss vortices), DREDGE **red fog** nights ([wiki Phone](https://davethediver.fandom.com/wiki/Smartphone)) [W].

---

## 6. Fish and creatures

**How fish look and get caught.** Pixel sprites; big creatures 3D ([Game Developer][gd]) [V]. Small fish harpooned go
straight into inventory; harpoon hit then a struggle (players mention "button mashing", [Steam forum][tuna]) [1S]. Quality
stars: ★ dead, ★★ alive by harpoon, ★★★ alive without harpoon (net, tranquilizer); large fish need cutting with the knife
or the **Salvage Drone** (dead 15 portions, alive 27) ([wiki Fish](https://davethediver.fandom.com/wiki/Fish)) [W]. Running out of O₂ = lose the haul but one
item ([Steam][steam]) [V]. Sushi art keeps "iconic parts of each fish", like the angler's lantern ([Game Developer][gd]) [V].

| Zone | Iconic species the game uses (wiki category lists) | Sources |
|---|---|---|
| Shallows | Clownfish, Blue Tang, Yellow Tang, Emperor & Flame Angelfish, Red Lionfish (invasive cull mission), Redtoothed/Titan Triggerfish, parrotfish, batfish (Red-Lipped, Orbicular, Longfin), seahorses, Starry Puffer, Longspine Porcupinefish, Moray Eel, Stingray, Manta Ray, Marbled Electric Ray, Loggerhead Turtle, Pink Dolphin ("Pinky", albino), Blacktip/Whitetip Reef Shark, Zebra Shark, Shortfin Mako, Thresher, Copper Shark, Bluefin & Yellowfin Tuna, Marlin, Box/Barrel/Fried Egg Jellyfish, White & Whiteleg Shrimp, Mantis Shrimp (boss), lobsters (American, Blue, European), sea urchins | [wiki cat. Shallows](https://davethediver.fandom.com/wiki/Category:Shallows_Fish) |
| Medium | Atlantic Anglerfish, Bigeye Scad, Great & Blackfin Barracuda, Dusky Grouper, Giant Trevally, Sailfish, Smooth Hammerhead, Tiger Shark, Longnose Sawshark, Humboldt Squid, Spear Squid, Cuttlefish, Clown Frogfish, Devil Scorpionfish, Crystal Lobster, Sally Lightfoot Crab, Giraffe/Zebra/Hedgehog Seahorse | [wiki cat. Medium](https://davethediver.fandom.com/wiki/Category:Medium_Depth_Fish) |
| Depths | Goblin Shark (7 m), Frilled Shark, Megamouth (350 cm), Cookiecutter Shark, **Oarfish** (11 m, "silver-white body, red fins, sky-colored vertical stripes"), Fangtooth, Viperfish, Chambered Nautilus, Clione, Comb Jelly, Opah, Sea Toad, **Spider Crab** ("long legs, an orange color, and white spots"; harpoon-proof, kill with dropped boulders) | [wiki cat. Depths](https://davethediver.fandom.com/wiki/Category:Depths_Fish), [wiki Oarfish](https://davethediver.fandom.com/wiki/Oarfish), [wiki Spider Crab](https://davethediver.fandom.com/wiki/Spider_Crab) |
| Glacial | Narwhal, Greenland Shark, Porbeagle, Antarctic Octopus, Ice Fish, Arctic Cod, Snow/Golden King Crab, Bathynomus, Leafy & Weedy Seadragon, Lion's Mane Jellyfish, Southern Right Whale Dolphin, Lumpfish | [wiki cat. Glacier](https://davethediver.fandom.com/wiki/Category:Glacier_Zone_Fish) |
| Vents | Coelacanth, Dunkleosteus, Anomalocaris, Helicoprion, Kronosaurus, Arandaspis, Pikaia, Xenacanthus, Megalograptus, Ruby Seadragon | [wiki cat. Vents](https://davethediver.fandom.com/wiki/Category:Hydrothermal_Vents_Fish) |

**Bosses** ([wiki cat. Bosses](https://davethediver.fandom.com/wiki/Category:Bosses)) [W]: **Giant Squid** (ink blast, wall tentacles, hit the eye; holds Duff's figure) ·
**Clione Queen** ("cute appearance" turns monstrous, tries to swallow Dave) · **Giant Wolf Eel** · **Goblin Shark** ·
**Mantis Shrimp** ("ultrasonic punch") · **Truck Hermit Crab** (lives in an abandoned dump truck; knock barrels onto it) ·
**Great White Shark Klaus** (night, whirlpools, a widow's revenge) · **Lusca** ("upper body of a shark, lower body of an
octopus", stormy night) · **Giant Gadon** (chase) · **Phantom Jellyfish** · **Helicoprion** (spiral teeth) · **Yawie**
(Cambrian, pincers) · **Kronosaurus** (10 m plesiosaur, eats Watson's sub) · **John Watson** · DLC: Ebirah, Torben.
Gentle giants: humpback whale and calf, whale shark (GYAO! pet), manta, beluga.

---

## 7. Bancho Sushi (evening)

| Item | What the sources say | Status |
|---|---|---|
| Who runs it | Cobra (money), Bancho (cooks), Dave (serves), Yoshie (hiring); later a **branch** location | [wiki Bancho Sushi](https://davethediver.fandom.com/wiki/Bancho_Sushi) [W] |
| Layout | **One long horizontal counter lane**, staff and customers along it (the Jungle "Bancho Grill" swaps this for an isometric floor) | [GameBrief][brief] [1S] |
| Early story | A tremor wrecks the interior on day one; Cobra repairs it; then **Interior** decorations unlock | [wiki Bancho](https://davethediver.fandom.com/wiki/Bancho), [wiki Bancho Sushi](https://davethediver.fandom.com/wiki/Bancho_Sushi) [W] |
| Décor slots | Tables, Chairs, Ceilings, Speakers, Lighting, Deco 1-3; Cooksta ranks add "Interior Items" | [wiki Decorations](https://davethediver.fandom.com/wiki/Decorations), [wiki Cooksta](https://davethediver.fandom.com/wiki/Cooksta) [W] |
| Service loop | Customers rush in at opening; Dave **dashes** (Left Shift, stamina gauge; slower carrying food) between Bancho and seats; **wasabi** depletes, Dave grinds/refills; **dirty dishes** must be cleared or new customers leave; **green tea** pour to a marked line (GOOD+ = green aura, +30%); **beer** ~20% foam (after Vincent's fridge); **cocktail dispenser** (colour layers), shaker (DLC); no menu = **Norimaki** for 1 gold | [wiki Bancho Sushi](https://davethediver.fandom.com/wiki/Bancho_Sushi) [W], [digitec (search snippet)](https://www.digitec.ch/en/page/dave-the-diver-tested-a-culinary-diving-adventure-28609) [1S] |
| Order bubbles | Customers order dishes "from the Menu"; the bubble/icon look is not described | [UNVERIFIED] |
| Results | "Today's Score" **1-5** (gives **Artisan's Flame** for Research); Sales: Cooking / Others / Tips; Expenses: Operational / Pay / Maintenance; Net Profit; best-selling dish | [wiki Bancho Sushi](https://davethediver.fandom.com/wiki/Bancho_Sushi) [W], [gameluster][gl] [1S] |
| Cooksta | Social app + rank ladder: **Coal → Bronze (10 followers) → Silver (20) → Gold (100, 125 Best Taste) → Platinum (200) → Diamond (720)**; max customers 10/15/21/28/36/45; posts appear when new dishes sell | [wiki Cooksta](https://davethediver.fandom.com/wiki/Cooksta) [W] |
| Seasonal parties | Jellyfish, Tuna, Cucumber, Lobster parties; icon top-right with countdown; pink bow-tie on qualifying recipes | [wiki Events](https://davethediver.fandom.com/wiki/Seasonal_Events) [W] |
| Signature dish | **Whole-Roasted Shark Head** (Bancho's career-ending dish for critic Lois, then his comeback) | [wiki Bancho](https://davethediver.fandom.com/wiki/Bancho) [W] |

---

## 8. HUD / UI

| Element | What exists (text) | Position / look | Status |
|---|---|---|---|
| **Oxygen = HP** | O₂ in **Bar** (Lv1 90 → Lv11 530 Bar); damage drains it; a "countdown on screen" | **Bottom-left round dial** (navy disc, blue ring that empties, "O₂" + big number); beside it "Normal Depth" + cargo icon and weight ("9.2/9.0kg", red when over) | [V] Producer screenshot 2026-10-19 |
| **Depth meter** | Turns **red** past the suit's limit, O₂ drains faster | "**bottom left**" (one guide) | [1S] |
| **Weight** | Cargo box **kg**: viable vs max weight (9/13 kg at Lv1); overweight slows Dave | Readout look unknown | Mechanic [W]; look [UNVERIFIED] |
| **Weapons** | Harpoon gun (∞, struggle QTE), melee slot (Dive Knife), gun slot (rifles, net guns, ammo), consumables (O₂ capsule, scooter, drone uses) | Slot strip position unknown | [W] / [UNVERIFIED] |
| **Map** | A fan interactive map exists; in-game minimap not described | — | [UNVERIFIED] |
| **Dive Log** (dive end) | DIVE NO, DATE (day 1 = Saturday, Oct 1), TEMP., WEATHER (sun/moon icon); TIME, DEPTH, CAUGHT, OBTAINED with **current row in pink, best row in blue**; BIGGEST FISH (icon, name, length, quality); ITEMS | Written like a logbook card | [wiki Dive Log](https://davethediver.fandom.com/wiki/Dive_Log) [W] |
| **Phone** | Whole menu is "designed to resemble a smartphone filled with apps"; **phone charms** dangle on it (Dave charm by default) | Apps: To-Do, Call, Mail, Weapon Shop (Duff), **iDiver**, **Cooksta**, Management, FarmNow, Calendar, MarinCa, Weather, Music, Minigames, Calculator, Album, Ecowatcher, FishMon, Tips, Settings | [NWR][nwr] [1S], [wiki Phone](https://davethediver.fandom.com/wiki/Smartphone) [W] |
| Fonts / hexes | Not documented anywhere | — | [UNVERIFIED] |

---

## 9. Signature objects

Harpoon gun (Old → Steel → Pump → Shark → Dragonbite → Super Alloy; "A Harpoon Gun from Cobra... very old, but has been
maintained well") · **yellow supply chests** / weapon crates (melee gag weapons: baseball bat, **rubber chicken**, golf
club, tennis racket, **frozen cod**, toy hammer, Mjölnir) · Salvage **drone** (lifts big fish to the boat) · net guns
(net closes in ~1 s, 7+ fish) · **O₂ barrels** and O₂ capsules · waterproof cargo box · underwater scooter · camera ·
deep-sea headlamp · grip gloves (lift boulders) · crab trap · bug net (clione) · Sea People **mirror** · gold (Gold, plus
Bei for Sea People) · Bancho's dishes and the wasabi grinder · Momo the cat · fish farm tanks, rice paddy, chicken coop ·
GYAO! (tamagotchi fish), MarinCa cards · Leahs-chan figure. Sources: [wiki Harpoon](https://davethediver.fandom.com/wiki/Harpoon_Gun), [wiki Weapons](https://davethediver.fandom.com/wiki/Weapons),
[wiki Equipment](https://davethediver.fandom.com/wiki/Equipment), [gameluster][gl], [wiki Mirror](https://davethediver.fandom.com/wiki/Sea_People_Mirror), [wiki Momo](https://davethediver.fandom.com/wiki/Momo), [wiki Fish Farm](https://davethediver.fandom.com/wiki/Fish_Farm) [W].

---

## 10. Community moments and memes

1. **Bancho's dramatic cooking** and the over-the-top cutscenes are the most praised element ([NWR][nwr], [Scalzi][scalzi]: "just the right kind of 'OMG-crazy!'"); Bancho is a fan favourite, hence the prequel ([gaming.net][bancho2]).
2. **Cobra signs contracts for Dave** without asking ([wiki Cobra](https://davethediver.fandom.com/wiki/Cobra)). Dave came for free sushi and became the supplier ([wiki Dave](https://davethediver.fandom.com/wiki/Dave)).
3. **"Dave" means "broken toilet lid"** in the Sea People language ([wiki Dave](https://davethediver.fandom.com/wiki/Dave)).
4. **Rubber chicken / frozen cod as weapons** ([wiki Weapons](https://davethediver.fandom.com/wiki/Weapons)).
5. **Duff's otaku rescue mission**: the Giant Squid steals his Leahs-chan figure ([wiki Ramo](https://davethediver.fandom.com/wiki/Ramo)).
6. **Sea Blue blames Dave** for Dr. Bacon's vomit ([wiki Watson](https://davethediver.fandom.com/wiki/John_Watson)); Watson swims off in his underwear.
7. **Otto took "a harpoon to the knee"** (Skyrim nod) ([wiki Otto](https://davethediver.fandom.com/wiki/Otto)).
8. Collabs everywhere: Balatro cards (Dave, Cobra, Bancho), Godzilla, Like a Dragon, DREDGE ([wiki game page](https://davethediver.fandom.com/wiki/DAVE_THE_DIVER)).
"Dave's dance" and a "Dave meme face": **no text source found** [UNVERIFIED]; do not script them as facts.

---

## 11. Translation table: their thing → our redraw

No script yet, so "Where" is a suggested beat. P1 = needed for the cut, P2 = adds a lot, P3 = nice.

| # | Game reference | Our redraw (style, method) | Where (suggested) | Prio | Must NOT copy |
|---|---|---|---|---|---|
| 1 | Dave in wetsuit | **Quest in a diver costume**: our own suit colours (teal `#2BB3C0` + cream trim [OURS]), mask pushed up on the forehead, small tank, fins | everywhere | P1 | Dave's face, beard, body, pixel sprite; no fat jokes |
| 2 | O₂ = HP gauge | **Round O₂ dial bottom-left** (verified 2026-10-19), number in "BAR", drains on hits, flashes red low | dive beats | P1 | Their gauge art, font, exact layout |
| 3 | Depth meter turning red | Depth counter "38 m" bottom-left that goes red past a limit line | descent | P1 | — (generic) |
| 4 | Cargo weight kg | Small crate icon "7.2 / 9 kg" that wobbles when full | haul beat | P2 | Their icon |
| 5 | Harpoon + struggle | Our **toy harpoon gun** (props3d) + a code "mash!" ring around the fish | catch beat | P1 | Their gun model |
| 6 | Quality stars ★/★★/★★★ | Three stars pop over the catch | catch | P1 | Generic |
| 7 | Dive Log (pink now / blue best) | **Our dive-log card**: TIME, DEPTH, CAUGHT, BIGGEST FISH, two rows (now vs best) in our colours | dive end | P1 | Their layout, labels' exact set, pink/blue pairing as-is |
| 8 | Phone of apps | **Quest's phone** with 5-6 of our own app icons (map, fish-dex, sushi stars, weather, upgrades), a charm dangling | menus | P1 | App names (iDiver, Cooksta, MarinCa), icons |
| 9 | Cooksta ranks | A "stars" ladder Coal → Diamond **renamed** (e.g. Pebble → Pearl) | restaurant | P2 | The word Cooksta, its UI |
| 10 | Sushi-bar counter lane | **Our sushi counter** side-on: wood counter, 6 stools, noren curtain, lanterns, cat on the end | night | P1 | Their room layout and décor 1:1 |
| 11 | Tea pour to a line | Teacup with a dashed fill line; "GOOD" green halo | service | P2 | Generic mechanic |
| 12 | Wasabi meter | Green paste bar on the counter that empties | service | P2 | Generic |
| 13 | Order bubbles | Speech bubble with a nigiri icon over Leo / Max | service | P1 | Generic |
| 14 | Boat | **Our rowboat** (+ optional outboard) over a dark round "hole" in the reef | surface | P1 | Their boat, skins |
| 15 | Blue Hole zones | 4-5 painted depth plates + procedural gradient between them | descent | P1 | Their maps |
| 16 | Bancho's cooking cutscene | Our chef silhouette doing a speed-lines knife flourish (anime frame in our style) | night | P2 | Bancho's design, his face, the shark-head dish as a copy |
| 17 | Bosses (Giant Squid, Klaus, Lusca) | **One "giant shadow"** (squid eye + tentacles) behind rock; red eye glint | danger beat | P2 | Their boss models |
| 18 | Cat on the counter | **Our cat** (orange or grey, not black-and-white) | night | P3 | Momo's colours |
| 19 | Sea People village | A warm-lit grotto with seaweed huts, no characters | deep beat | P3 | Mer-people designs |
| 20 | Title/logo | Plain type "DAVE THE DIVER" in our font only | title | rule | Logo, key art |

---

## 12. Needs list (free first: props3d + HUD in code + painted plates)

**Reuse (EP003):** cartoon fish with 7 expressions (becomes the catch, the struggle, the sushi customer), rowboat, lighthouse
(far shore), lantern (sushi-bar lanterns), kettle grill (skip or Otto-ish farm gag), first-person hands (aim the harpoon), Leo
& Max (customers / dive buddies).

**3D props (tools/props3d, toy style):** 1. `harpoon_gun` (P1) · 2. `dive_mask` + `air_tank` + `fins` costume pieces for
Quest (P1) · 3. `sushi_counter` (lane + stools + noren) (P1) · 4. `nigiri` set (3 kinds) + `sushi_plate` + `teacup` (P1) ·
5. `supply_chest` yellow (P2) · 6. `o2_barrel` (P2) · 7. `salvage_drone` (P2) · 8. `wasabi_grinder` (P2) · 9. `kelp_strand`
(could be code) (P2) · 10. `coral_set` (brain, fan, branch) (P2) · 11. `giant_squid_shadow` (P2) · 12. `cat` (P3) ·
13. `outboard_motor` (P3) · 14. `phone` with charm (P2, or 2D in code).

**HUD in code (one "dive HUD" module):** `hud_o2_dial` (P1) · `hud_depth` with red limit (P1) · `hud_cargo_kg` (P2) ·
`hud_weapon_slots` harpoon/knife/gun (P2) · `catch_struggle_ring` (P1) · `quality_stars` (P1) · `dive_log_card` (P1) ·
`phone_home` with 6 app icons (P1) · `restaurant_hud`: order bubbles, tea line, wasabi bar, stars ladder (P1/P2) ·
`night_results_card` sales/tips/1-5 score (P2).

**Backgrounds to paint:** P1 surface + boat over the hole at noon · P1 shallows coral reef with light shafts · P1 sushi
bar interior at night · P2 medium-depth limestone cave/wreck · P2 the deep (black, bioluminescent) · P2 sushi bar exterior on
the beach at dusk · P3 glacial icicles · P3 vents glow · P3 Sea People grotto.

**Procedural in code (no credits):** vertical underwater gradient driven by depth (palette §2) · animated caustics
(noise texture on the floor and props) · god rays (additive cones from the surface) · rising bubbles (particles from the
mask and vents) · swaying kelp (bezier strands with sine) · marine snow (slow particles in the deep) · headlamp cone + vignette
for night/depths · surface shimmer line · schools of fish (boids using the reused fish).

**Companion detail (CLAUDE.md rule; to decide in `COMPANION.md`):** candidates [OURS]: (a) our EP003 fish in a tiny diving
mask (reuse, recommended), (b) our own sushi-bar cat, (c) a small salvage drone. Never Momo's look.

**Paid (quote first, only if needed):** none required for P1.

---

## 13. Eyes-on checklist (10 min on the Steam page, nothing saved)
- [ ] Dave: beard? glasses? hood? suit colours, tank colour, fins colour (so Quest's costume stays clearly different).
- [ ] Cobra, Bancho, Duff, Dr. Bacon, Yoshie outfits (we will not draw them; only to keep our cast away from them).
- [ ] The boat: shape, colours, where Cobra stands, how Dave enters the water.
- [ ] HUD: O₂ gauge shape/position; depth (bottom-left?); weight; weapon slots; any minimap.
- [ ] Zone colours (shallows → vents); light shafts; night darkness.
- [ ] Sushi bar: counter direction, seats count, order bubble style, star rating art.

---

## Sources
[steam]: https://store.steampowered.com/app/1868140/DAVE_THE_DIVER/
[gd]: https://www.gamedeveloper.com/design/dave-the-diver
[nwr]: https://nintendoworldreport.com/review/65313/dave-the-diver-switch-review
[rl]: https://rogueliker.com/dave-the-diver-review-diver-dave/
[epi]: https://epiloguegaming.com/the-shallow-depths-of-dave-the-diver/
[scalzi]: https://whatever.scalzi.com/2025/11/06/actually-playing-games-in-my-steam-library-dave-the-diver/
[inven]: https://www.invenglobal.com/articles/22989/the-food-of-dave-the-diver
[bancho2]: https://www.gaming.net/bancho-the-chef-everything-we-know/
[brief]: https://www.gamebrief.net/blog/dave-the-diver-bancho-grill-recipes-jungle-2026
[gl]: https://gameluster.com/dave-the-diver-tips-tricks-quality-oxygen-sushi-phone-treasure-guide/
[tuna]: https://steamcommunity.com/app/1868140/discussions/0/3496509339504243642
[fn]: https://games.gg/de/news/dave-the-diver-kommt-zu-fortnite-feier-zum-dritten-geburtstag/
[toy]: https://www.toy-people.com/en/?p=111949
[side]: https://www.sideshow.com/collectibles/beautiful-chemistry-dave-the-diver-underverse-915907

- Wiki pages (each linked inline above) follow https://davethediver.fandom.com/wiki/<Page>.
- Fish-by-zone lists come from the wiki categories Shallows Fish, Medium Depth Fish, Depths Fish, Glacier Zone Fish,
  Hydrothermal Vents Fish, Bosses, Nocturnal Fish (https://davethediver.fandom.com/wiki/Category:Shallows_Fish, etc.).
- Wiki text was read via `https://davethediver.fandom.com/api.php?action=parse&prop=wikitext` (text only, no images).
- Blocked, not used: TV Tropes (403; its lines above are quoted from search snippets only, marked [1S]), NamuWiki (403).
- Fan site (not official, not used for facts): https://davethediver.net/en/character/dave/
