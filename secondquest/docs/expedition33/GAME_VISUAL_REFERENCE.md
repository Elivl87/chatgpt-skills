# EP004 · Game visual reference: Clair Obscur: Expedition 33 (Sandfall Interactive, 2025)

Producer rule (CLAUDE.md, 2026-10-12): every episode studies the game's graphics, HUD, objects and places in detail and
brings them into our art, redrawn in our style.

Channel constraint: we never download, embed or use the game's footage, screenshots, logo, key art or assets. This file is
a TEXT reference only. Everything is redrawn in our style (painterly cartoon plates + procedural 3D props in
`tools/props3d` + HUD drawn in code). No image or video from the game was downloaded or stored. All sources were read as
text and treated as untrusted data. Names go in the narration, never as branding.

Research date: 2026-10-18. Tags: **[V]** two+ sources or a first-party/wiki source · **[1S]** one secondary source ·
**[FAN]** fan theory/forum, not developer-confirmed · **[UNVERIFIED]** not found in any text source · **[OURS]** our own
design proposal · **(SPOILER)** reveals plot after script ¶42.

> **Honest limit.** Public text describes mechanics and story well, but almost never exact colour, font, screen position
> or silhouette details. Wiki pages for Gommage, Esquie and Lumière gave no appearance text (checked). So many cells below
> are [UNVERIFIED] and §8 is an eyes-on checklist (10 min on the Steam trailer, nothing saved) that the Producer ticks
> before the HUD and plates are final. Every hex here is [OURS], never measured.

---

## 1. Facts check (visual-relevant, against locked-candidate script A_v2_3)

| Fact | Value | Source | Status |
|---|---|---|---|
| Setting | Dark fantasy, **Belle Époque**-inspired; city of Lumière cut off from the mainland by the "Fracture" | [Wikipedia][wiki], RESEARCH 3.1 | [V] |
| Art direction | Art director **Nicholas** Maxson-Francombe (sources spell "Nicholas"; the research file says "Nicolas"); Belle Époque + Victorian motifs + Art Deco; background in theatre and circus arts (Cirque du Soleil); surreal artists | [CreativeBloq][cb], [Wikipedia][wiki] | [V] |
| First concept | "We Lost": steampunk, Victorian England, zombies and aliens; reset to Belle Époque after investor feedback | [Wikipedia][wiki] | [V] |
| Title meaning | "Clair obscur" = chiaroscuro (light/dark contrast) | [Wikipedia][wiki], Steam discussion | [V] |
| Tech | Unreal Engine 4, moved to **UE5** (Nanite, Lumen; lighting reworked for Lumen) | [Wikipedia][wiki] | [V] |
| Awards | Best Art Direction, The Game Awards 2025; D.I.C.E. art direction; GDC Best Visual Art | [Wikipedia][wiki] | [V] |
| Painting-the-number premise | Once a year the Paintress paints a number on the Monolith; everyone that age or older vanishes (Gommage); the number drops by one each year | RESEARCH 3.2 (PlayStation page, Giant Bomb, Wikipedia) | [V] |
| Gommage look | People dissolve into **petals (and ash)**; "the flowers are an artistic choice" | RESEARCH 3.4 (alucare.fr, Steam discussion) | [V] |
| Petal colour | Fan reading: Renoir's petals red, Aline's white; speculation | [Steam thread][steam1] | [FAN] |
| Script ¶06 "Eight million copies" | Not a visual item; not re-checked here | — | out of scope |
| Script ¶13 quote "I've lived 33 good years. Look around." | Not re-checked here (RESEARCH holds the quote check) | — | out of scope |

Script lines that need no art fact: ¶07-¶09, ¶15-¶17, ¶22, ¶28, ¶34, ¶39-¶40, ¶73-¶78, ¶82-¶91 (narration over
callbacks to earlier images).

---

## 2. Art style and palette

| Aspect | What text sources say | Status |
|---|---|---|
| Overall look | "Dreamily intoxicating" art direction (Edge, via Wikipedia); realistic-leaning 3D, painterly lighting; "surreal beauty of painted aesthetics rather than hyper-realism" (opinion piece). Art director joked about a "realistic version of SpongeBob" (stylised proportions on real materials) | [V] praise; [1S] painterly (opinion); [1S] SpongeBob quote ([CreativeBloq][cb]) |
| Characters | "Elegant and surreal"; Expeditioner outfits took about four years of exploration; long coats, period tailoring | [1S] ([CreativeBloq][cb], gamerguides summary) |
| Architecture | Belle Époque + Art Deco: iron lamps, cafés, wrought-iron ornament, theatre/opera language | [V] ([Wikipedia][wiki], script ¶10) |
| Chiaroscuro | The title is the style: strong light/dark contrast, pools of warm light against dark | [V] for the name; how it is lit per scene [UNVERIFIED] |
| Lighting | UE5 Lumen global illumination; "gorgeous, shifting lighting" in the underwater Flying Waters area | [V] ([Xbox preview][xbox]) |
| Colours per place | **No text source gives palettes.** Proposed, all [OURS], for our plates: Lumière golden-hour `#E8B964` lamps on `#3A4660` slate dusk; Monolith/sea cold `#5C6E8C`; meadows `#8FBF6A` + `#F2E4B8`; Flying Waters teal `#2E8C9A` with drifting light; night camp `#1B2338` + fire `#F29A3A`; Old Lumière ash `#7B7F88` with `#C8A25A` dust; cliff storm `#4A4F63`; real-world house `#CFC8B8` bleached and cold; opera house `#7A1E2B` red velvet + gold `#D9B25A` | places [V]; palette [OURS] |
| Mood contrast | Beautiful world, tragic story; "no grey hair" city; petals as beauty-in-loss | script ¶10-¶14 |

**How we use this:** our painterly cartoon (cleaner, warmer, outline-light) with strong chiaroscuro: dark frame edges, one
warm light source per shot. We borrow the *idea* (pools of gold in blue dusk, petals, iron lace), not its renders,
character faces, costumes or compositions.

---

## 3. HUD / UI (battle, world, menus)

Combat is turn-based menus plus real-time dodge/parry/jump/QTE ([Wikipedia][wiki], [Xbox preview][xbox]). Inspirations
named by the team: Final Fantasy VIII/IX/X, **Persona 5** (UI and battle camerawork), Sekiro (dodge/parry).

| Element | What exists | Position / shape / colour | Status |
|---|---|---|---|
| **Turn order (Timeline)** | A bar showing who acts next, visible at all times so you can plan | **Left side** of the screen ([Fextralife Combat][fexc]); style/colours [UNVERIFIED] | [V] |
| **Action menu ("Battle Wheel")** | At the character's turn: **Attack, Skills, Items, (Free) Aim**; Gradient Attacks added later. Skills opens a "Skill Wheel" of up to 6 skills | Wheel shape [V] (named Wheel); on-screen position, colours [UNVERIFIED] | [V] ([Fextralife Combat][fexc], [Maxroll][maxroll]) |
| **AP (Ability Points)** | Skills cost 1 AP; parry restores 1 AP; Gradient charge built at 5% per 1 AP | Fextralife: "a **blue bar** above the right side of the Battle Wheel, or on the character's icon below the health bar". **We found no source saying "pips"**; the brief's "AP pips" is an assumption | AP [V]; display [1S]; "pips" [UNVERIFIED] |
| **HP bars** | Player HP under each character portrait; boss has a "very large health bar" | Shape/position [UNVERIFIED] ([Xbox preview][xbox] says only "very large") | [UNVERIFIED] |
| **Enemy intent / telegraph** | Centre-screen text such as "The enemy attacks slowly"; plus the enemy's weapon movement is the real cue | Centre-screen text [1S] ([Maxroll][maxroll]); one player says text is at the top [FAN] | [1S] |
| **Dodge / parry prompts** | Dodge on one button, parry on another; each enemy attack shows an onscreen button prompt at the right moment; a last-moment dodge reads "Perfect Dodge" (flavour text) | Prompt visuals [UNVERIFIED]; "Perfect Dodge" [1S] ([Fextralife Combat][fexc]); the fan figure of ~0.15-0.22 s parry window [FAN] | mixed |
| **Jump prompt** | An **icon on the enemy** signals an attack to jump | Shape/colour not stated | [1S] |
| **QTE widget** | A cursor moving **clockwise**; press when it reaches the **yellow upper-left** zone | Yellow upper-left [1S] ([Fextralife Combat][fexc]) | [1S] |
| **Dark-screen cue** | The screen going dark signals a dangerous attack type (Gradient Counter) | [Maxroll][maxroll] | [1S] |
| **Damage numbers** | Capped at 9,999 for most of the story; style [UNVERIFIED] | — | cap [1S] |
| **Break** | A stamina-like meter that, when emptied, stuns enemies | Visual [UNVERIFIED] | mechanic [V] |
| **Gradient gauge** | Shared team gauge; Gradient Attacks do not cost a turn | Visual [UNVERIFIED] | mechanic [V] |
| **Character-specific** | Lune's Stains, Maelle's Stances, Sciel's Foretell (cards), Gustave's charges, Verso's Perfection ranks | Icons [UNVERIFIED] | [V] |
| **Status icons** | Burn, Slow, Stun, Defenseless, Exhaust; buffs Shell, Rush | Icons [UNVERIFIED] | names [1S] |
| **Victory** | A results screen: highest damage, successful parries/dodges, a no-damage bonus | ([Xbox preview][xbox]). **"We continue / Seguimos" victory text: NOT documented** | results [1S]; text [UNVERIFIED] |
| **Pictos menu** | Open Character Overview, pick a Pictos slot (lower-left of the overview). **Three equip slots in the middle of the screen, collected list on the left**. 3 Pictos per character, no duplicates across characters; 210 Pictos total | [Fextralife Pictos][fexp] | [V] layout |
| **Lumina** | A mastered Picto becomes a Lumina after **four won battles**; the icon gets a **gold border that fills segment by segment** until it is a complete **diamond-shaped gold outline**; limited by Lumina Points | [Fextralife Pictos][fexp], [Wikipedia][wiki] | [V] |
| **World map ("Continent")** | An overworld map connecting levels; an Interactive Map exists on the wiki; Esquie is the mount for water/air/underwater | Map art [UNVERIFIED] | [V] existence |
| **Camp** | Talk to party members, raise relationship levels (Esquie max 7), rest; journals are collectibles | Menu look [UNVERIFIED] | [V] mechanics |
| **Fonts** | Not described anywhere. Persona-like stylised menus are the stated inspiration, not a font | [UNVERIFIED]. Ours: elegant high-contrast serif for titles, rounded sans for numbers | — |

---

## 4. Signature objects

Each row: what the text says → what we do. "Look" is [UNVERIFIED] unless a source is given.

| Object | Verified text facts | Look details | Status |
|---|---|---|---|
| **Monolith + painted number** | A massive rock formation across the continent where the Paintress paints the yearly number ([Wikipedia][wiki]). Expedition numbering follows the Monolith's number | Shape, colour, number lettering style [UNVERIFIED]. Ours: a black stone tower, hand-painted white number (RESEARCH line 161 already decides this) | facts [V] |
| **Gommage petals** | Dissolve into petals and ash | Colour fan-only: red (Renoir), white (Aline) [FAN]. Ours: pale rose petals with a trail of ash | [V]/[FAN] |
| **Gustave's mechanical arm** | Wikipedia: "Gustave has a mechanical arm" (engineer). Weapons: sword and pistol ([keengamer summary][weap]) | Arm design [UNVERIFIED] | arm [1S]; weapons [1S] |
| **Gustave's journal** | Journals are collectibles; **49** exist ([game-checklists][jr]). Script ¶25: he writes at night for his apprentices | Cover/handwriting [UNVERIFIED]. Ours: a worn leather notebook, ink | [1S] |
| **Maelle's rapier** | Primary weapon "Rapière-Fleuret" ([keengamer][weap]) | Hilt [UNVERIFIED]. Ours: a slim fencing foil, gold guard | [1S] |
| **Verso's sword** | Verso shares Gustave's weapon type (sword) ([keengamer][weap]) | [UNVERIFIED] | [1S] |
| **Lune's weapon/pictos** | Primary weapon "Lunerim"; shape not confirmed as a staff; she uses Stains (elemental marks) | [UNVERIFIED] | name [1S] |
| **Pictos / Lumina** | Equippable charms; gold diamond border = Lumina learned | Icons [UNVERIFIED]; border [V] | [V] |
| **Expedition flags/banners** | Nothing documented in sources found | [UNVERIFIED]. Ours: cream banner with a painted number and a black stripe | — |
| **Harbor boats** | Lumière is a port ("sails out"; script ¶16). Sources found give no boat description | [UNVERIFIED] | — |
| **Lumière lamps** | "Iron lamps" is our script line; Art Deco/Belle Époque iron | Lamp shape [UNVERIFIED] | style [V] |
| **"33" painting** | The number is painted on the Monolith; a hand-painted number is the premise | Style [UNVERIFIED] | premise [V] |
| **Paintress + brush** | Giant woman who paints; voiced by Tracy Wiles ([Wikipedia][wiki]); her heart resembles the Curator (SPOILER). Brush: no text source | Giant brush/hand, off-frame | name [V]; look [UNVERIFIED] |
| **Paint / canvas** | The world is a canvas created by Verso Dessendre (SPOILER); in the Renoir fight he summons a large canvas, tears off part of it and steps inside ([Fextralife Renoir][fexr]) (SPOILER) | — | [V] |
| **Opera house** | Fixing it up is the party's plan; Verso plays there in Maelle's ending (SPOILER, script ¶41, ¶69) | Interior [UNVERIFIED]. Ours: red velvet, gold, a lone piano | [V] story |
| **Esquie + rocks** | Huge, gentle; found at Esquie's Nest (Act I); mount across the Continent; modelled on a plush toy Verso had as a child (SPOILER); magic rocks: Florrie (swim), Dorrie (reefs), Soarrie (flight, first), Urrie (underwater dive) ([Fextralife Esquie][fexe]) | **Colour, body, face, size not given in any text source** | facts [V]; look [UNVERIFIED] |
| **Gestrals** | Mostly friendly creatures settled on the mainland; Gestral Village; Monoco is a Gestral who can transform into enemies ([Wikipedia][wiki]). Created by Verso as imagined beings (SPOILER, [Destructoid][destr]) | Look [UNVERIFIED] | [V] |
| **Nevrons** | Hostile monsters, created by Clea Dessendre (SPOILER) ([Wikipedia][wiki]). Notable: Goblu (first boss shown in preview, very large HP bar, [Xbox preview][xbox]); Mimes (silent enemy variety); a "colossal Nevron" in Flying Waters | Looks [UNVERIFIED] | names [V] |
| **Renoir's look** | **White-haired** man, appears "like a normal human"; carries a **cane**; conjures a sword of light; outfit names "Renoir's Suit Outfit" ([Fextralife Renoir][fexr]). Coat details not stated; script ¶29 calls him "an old man with white hair" | Coat colour [UNVERIFIED] | hair, cane [1S] |
| **Dessendre family / real world** | Early-20th-century **Paris**; the **Dessendre mansion** is a key location; a fire killed Verso (SPOILER) ([Wikipedia][wiki]) | Mansion exterior, fire look [UNVERIFIED] | [V] setting |

---

## 5. Places in script order

| ¶ | Place | What text sources say | Status |
|---|---|---|---|
| ¶01-¶03, ¶10-¶14 | **Lumière harbor / city / Gommage festival** | A port city "cut off from the mainland"; Belle Époque + Art Deco; iron lamps, cafés, long coats (script). The Monolith is across the sea on the continent. A "Festival Token" exists in the Prologue ([search result][locs]). Festival look, harbor boats [UNVERIFIED] | place [V]; look [UNVERIFIED] |
| ¶20 | **Landing beach** | Expedition lands; Renoir kills most of the expedition within minutes (RESEARCH 3.12) (Act 1 opening). Look [UNVERIFIED] | event [V] |
| ¶23 | **Spring Meadows** | Act One area ([deltias zone order][locs]); a Mime stands among four broken pillars at the end of a cliffside path. Palette [UNVERIFIED] | [1S] |
| ¶23 | **Flying Waters** | Act One; "gorgeous, shifting lighting" underwater feel ([Xbox preview][xbox]); a colossal Nevron | [1S] |
| ¶24 | **Esquie's Nest** | Where Esquie is recruited, Act I ([Fextralife Esquie][fexe]) | [V] |
| ¶25 | **Camp at night** | Camp exists as a hub; "night" tone [UNVERIFIED] (our script scene) | [UNVERIFIED] |
| ¶29, ¶52 | **Old Lumière** | Act Two area; Renoir fights at the manor front yard; a sewer gate / old key in the Prologue ([Fextralife Renoir][fexr], [locs]) | [1S] |
| ¶31-¶33 | **The cliff (Stone Wave Cliffs)** | Renoir appears at the end of Stone Wave Cliffs as the party leaves to sail with Esquie ([Fextralife Renoir][fexr]). **Caveat:** the script says "end of the first act"; the wiki places this at Stone Wave Cliffs. Gustave's death is in RESEARCH 3.12. Check order in-game | place [1S]; act placement see RESEARCH |
| ¶42-¶43 | **Monolith ascent / Paintress tower** | Tunnel past the "Tower Peak" checkpoint, "Tainted Lumière" area, a "Crooked Tower Walkway" and a round platform near the tower ([Fextralife Renoir][fexr]) | [1S] |
| ¶47-¶53 | **Real world / Dessendre house** (SPOILER) | Early-20th-century Paris; Dessendre mansion; fire (RESEARCH 3.15, [Wikipedia][wiki]) | [V] |
| ¶41, ¶69 | **Opera house** (SPOILER) | See §4 | story [V] |

---

## 6. Community memes / icons

| Item | Status |
|---|---|
| **"Tomorrow comes"** — the in-world saying (script ¶14, ¶83); RESEARCH carries the check | [V] per RESEARCH |
| **Motto "When one falls, we continue" / "For those who come after"** — the in-world oath and Gustave's sign-off (script ¶21, ¶27) | [V] per RESEARCH |
| **Esquie** — "a fan icon, actively protected": Sandfall warned about counterfeit Esquie plushes and promised an official version ([millenium.org][mill]) | [V] |
| **Esquie "Art of Napping"** quote, "losing a rock" line (script ¶24, ¶38) | quotes: RESEARCH |
| Mimes, Gestrals as named memes | RESEARCH 138: UNVERIFIED as memes; **not used** |
| "Sekiro in a turn-based RPG" parry framing | [V] inspiration; fan parry-window figures [FAN] |

---

## 7. Translation table: item → our redraw → where → what we must NOT copy

Priority P1 needed, P2 adds a lot, P3 nice. Our character art is Quest and Pixie in Belle Époque costume; they stand in
for the game's cast.

| # | Game reference | Our redraw (style, method) | Where (script ¶) | Prio | Must NOT copy |
|---|---|---|---|---|---|
| 1 | Monolith + painted number | Black stone tower on a cold sea horizon; big hand-painted white "33" (brush strokes, drips), drawn in code or paint | ¶02, ¶04, ¶15, ¶55 | P1 | Their exact rock silhouette, number lettering, composition |
| 2 | Gommage petals + ash | Pale-rose petal particles (code), ash trail; a coat that stays standing as the person dissolves | ¶03, ¶45, ¶67 | P1 | Their petal sprite sheet; do not show gore |
| 3 | Lumière: harbor, iron lamps, cafés | Our painted Belle Époque port at golden hour: iron lamps (own 3D prop), café awnings, long coats, no grey hair (crowd of dark-haired silhouettes) | ¶10-¶14, ¶88 | P1 | Their street layout, lamp design, storefront art, any named signage |
| 4 | Harbor boats | Our procedural sailing boat/steamer prop (props3d), flags up | ¶16, ¶18, ¶88 | P1 | Their ship model |
| 5 | Expedition flags/banners | Cream cloth banner, painted "33", black bar; hung on a mast/poster | ¶16-¶17 (the "recruitment poster" gag) | P2 | Their emblem (unknown; avoid any guessed copy) |
| 6 | Paintress (giant woman, brush) | **Never her design.** Off-frame giant hand + brush tip over the Monolith, or a pure silhouette that is not her | ¶02, ¶15, ¶46, ¶50 | P1 | Her face, dress, hair, pose |
| 7 | Battle screen, turn bar | Our HUD: vertical turn bar left (portraits as small coins), a bottom-left action fan of 3 labels "Attack / Skill / Item", blue AP bar, HP bars | ¶20-¶22, ¶42-¶43 | P1 | Their wheel graphics, icons, bar shapes |
| 8 | Parry/dodge prompts + QTE cursor | A flash ring on the enemy that tightens, then a white ping; a clockwise gold cursor on a ring (code) | ¶42, ¶53 | P1 | Their prompt icons and colours as measured (unknown anyway) |
| 9 | Damage numbers (9,999 cap) | Rounded numeral pop-ups, white with dark outline | ¶42-¶43 | P2 | Their number font |
| 10 | Victory screen | Our own "We continue" gold line on a dark band (**our** wording; the game's victory text is UNVERIFIED) | ¶22, ¶35 | P2 | Their results screen layout |
| 11 | Pictos/Lumina menu | 3 round slots centre, list on left, gold diamond border that fills in four segments (as a 4-battle gag) | ¶84 callback "a rock you were lucky to have" | P3 | Their icon art, UI frame |
| 12 | Gustave's arm, journal | Quest wears a brass mechanical-arm prop (own design); a leather journal with ink and drawn monsters, last page "For those who come after" | ¶18, ¶25-¶27, ¶80, ¶89 | P1 | Their arm design and journal cover |
| 13 | Maelle's rapier / Verso's sword | Generic fencing foil with gold guard; plain longsword | ¶31, ¶36 | P2 | Their blade profiles |
| 14 | Esquie + rocks | **Not drawn as Esquie.** A big gentle sleeping plush-like creature of our own design with three coloured rocks in a bag; name in VO only. The brand is protected (counterfeit warning) | ¶23-¶24, ¶37-¶39, ¶74 | P1 | His shape, face, colour, rocks |
| 15 | Renoir (white hair, cane, coat) | A silhouette: white hair, long dark coat, cane, seen far away at the cliff; a shape not a portrait | ¶29, ¶31-¶33, ¶52-¶54 | P1 | His face, coat cut, light-sword |
| 16 | Gestrals/Nevrons | Shown at most as small shapes in a battle crowd; none named by look | ¶20 | P3 | Any named creature design |
| 17 | Camp at night | Our fire, tents, a seated figure writing; warm vs deep blue chiaroscuro | ¶25, ¶41 | P1 | Their camp layout |
| 18 | Old Lumière | Our ash-grey ruined street with dust and a gate | ¶29, ¶49 | P2 | Their level geometry |
| 19 | Cliff | Our storm cliff, long coat figure above; Gustave falls | ¶31-¶33 | P1 | Their cutscene framing |
| 20 | Tower ascent | Spiral stair/tower interior, cold stone, a dark window | ¶42-¶43 | P2 | Their tower layout |
| 21 | Real-world manor, fire (SPOILER) | A muted pale house with one lit window, a child's drawing on a wall; the fire only as warm-red light on a wall, not shown burning people | ¶47-¶51, ¶60-¶61, ¶70 | P1 | Their mansion design |
| 22 | Opera house (SPOILER) | Red velvet, gold balconies, a lone piano on a stage lit by one lamp | ¶41, ¶69-¶71 | P1 | Their interior |
| 23 | Painted-world metaphor | A paintbrush in the corner, a canvas edge of a scene tearing at the corner to reveal the real room | ¶47, ¶63-¶64 | P1 | Their canvas VFX |
| 24 | Logo/title | **Never shown.** Title as plain type in our font, once at the hook | ¶05 | rule | Logo, key art, capsule |

---

## 8. Needs list

**HUD / graphic components in code (one shared "expedition HUD" module):**
1. `hud_turnbar_left` — vertical turn-order bar (P1). 2. `hud_action_fan` — Attack/Skill/Item labels (P1).
3. `hud_ap_bar_hp` — blue AP bar + HP bars (P1). 4. `hud_parry_ring` — tightening ring + white ping + clockwise gold
cursor (P1). 5. `hud_damage_pop` (P2). 6. `hud_victory_band` — our "We continue" (P2). 7. `hud_pictos_3slot` + gold-diamond
border fill (P3). 8. `number_painted_33` — animated brush-stroke number (P1). 9. `petals_fx` and `ash_fx` — particles (P1).
10. `title_card_serif` — plain type (P1).

**3D props (tools/props3d, procedural, our style):**
11. `iron_lamp` Art Deco street lamp (P1). 12. `harbor_boat` (steamer/sailboat) with flags (P1). 13. `banner_33` cloth
banner (P2). 14. `monolith` black tower with scaffold (P1). 15. `brass_arm` mechanical arm (P1). 16. `journal` leather
book (P1). 17. `foil_rapier` + `longsword` (P2). 18. `brush_giant` (P1). 19. `easel_canvas` (P2). 20. `piano_upright`
and `opera_balcony` (P1, SPOILER). 21. `camp_tent_fire` (P1). 22. `cane` + white-hair silhouette figure (P1).
23. `plush_creature_big` + three coloured rocks (our own sleeping giant, P1). 24. `manor_house_pale` (P1, SPOILER).

**Backgrounds to paint (plates):**
A. Lumière harbor, golden hour, Monolith across the sea (P1). B. Lumière street/crowd, no grey hair (P1).
C. Landing beach, mist (P2). D. Spring Meadows with broken pillars (P2). E. Underwater-light forest "Flying Waters" (P3).
F. Camp at night (P1). G. Old Lumière ruins (P2). H. Cliff, storm (P1). I. Tower stair interior (P2).
J. Real-world house, pale (P1, SPOILER). K. Opera house interior (P1, SPOILER). L. Empty room with a window (P1, SPOILER).

**Spoiler marks:** items 20, 24, A-L J/K/L, all of Dessendre/real-world, canvas and opera rows are post-¶47. The hook (¶01-¶09)
and pre-¶42 plates must not reveal them.

---

## 9. Eyes-on checklist (10 min, trailer/store page, nothing saved)

- [ ] Colours of the HUD (turn bar, AP bar, HP bar) and where they sit. - [ ] Is AP a bar or pips?
- [ ] Parry/dodge prompt: shape, colour, size. - [ ] Damage-number font style. - [ ] Victory text wording (is there "We continue"?).
- [ ] Petal colour at Gommage. - [ ] Monolith number lettering (brush? stencil?). - [ ] Harbor: boats and flags.
- [ ] Renoir's coat colour. - [ ] Do any of our redraws sit too close to the original silhouettes?

---

## Sources
[wiki]: https://en.wikipedia.org/wiki/Clair_Obscur:_Expedition_33
[fexc]: https://expedition33.wiki.fextralife.com/Combat
[fexp]: https://expedition33.wiki.fextralife.com/Pictos
[fexe]: https://expedition33.wiki.fextralife.com/Esquie
[fexr]: https://expedition33.wiki.fextralife.com/Renoir
[xbox]: https://news.xbox.com/en-us/2024/08/28/clair-obscur-expedition-33-combat-breakdown-preview/
[maxroll]: https://maxroll.gg/clair-obscur-expedition-33/guides/combat-guide
[cb]: https://creativebloq.com/3d/video-game-design/clair-obscur-expedition-33s-art-director-jokes-how-he-wanted-to-make-a-realistic-version-of-spongebob
[weap]: https://keengamer.com/articles/guides/clair-obscur-expedition-33-best-early-weapons-guide-how-to-get-them-best-build-and-advanced-strategies/
[jr]: https://game-checklists.com/expedition33/all-expedition-journals.html
[locs]: https://deltiasgaming.com/?p=221264 · https://www.rpgsite.net/guide/17262-clair-obscur-expedition-33-all-journal-locations
[steam1]: https://steamcommunity.com/app/1903340/discussions/0/592898197782815459
[destr]: https://www.destructoid.com/clair-obscur-expedition-33-ending-explained/
[mill]: https://www.millenium.org/news/424570.html
- Not reachable (no data): Fextralife Gommage page (no appearance text), Fextralife Lumière (404), ArtStation Art Blast (403).
- Already-verified facts reused from `docs/expedition33/RESEARCH.md` and `PRODUCER_RESEARCH_DOSSIER.txt` (rows 1.10, 1.12, 3.1-3.4, 3.12, 3.15, 3.22-3.26).
