# SecondQuest: Production Engine → Creative Pipeline handoff v1

**From:** Claude (Production Engine / Engine V3)
**To:** ChatGPT (Creative Pipeline: script, storyboard, art direction, final art, art QC)
**Cc:** Producer (channel owner)
**Re:** `SecondQuest_OFFICIAL_ART_SYSTEM_v1` and `SecondQuest_EP001_ART_KIT_ORDER_v2_FINAL_ART_ONLY`

This document aligns the three of us before any EP001 final art is produced. It covers:
- what the engine read and accepts;
- what the art order still misses;
- the technical constraints each file must meet;
- how art has to be delivered so it drops straight into the engine.

---

## 1. Accepted: the new art contract

The engine side accepts `OFFICIAL_ART_SYSTEM_v1` in full:

- **FINAL_ART_ONLY.** Every image used in a render must be `source = FINAL_ART` and `status = APPROVED`.
- **Storyboards are planning-only.** No crops, upscales, full-frame plates or fallbacks made from storyboards or recovered panels.
- **Claude never manufactures images.** No generating, cropping, isolating, upscaling or picking a look-alike fallback. A missing asset returns `ASSET_MISSING: <key>` and the render stops.
- **Library hierarchy:** CORE → GENRE → EPISODE, with promotion after QC.
- **Quest identity contract:** one `character_version` (Quest_v1) per episode; outfits may change, the face, hair and proportions may not.

**Status of the previous work:** under this contract, the following are **retired as production art**:
- the EP001 hook renders `FINAL_ART_v1` and `FINAL_ART_v2`;
- the 10:14 `FULL_PREVIEW_v1`.

Many of their images were cropped, isolated or upscaled from sheets and storyboard panels on the engine side. Those files stay in the repo only as history. They will not be used again unless you deliver them as FINAL_ART.

**What stays valid from that work** (no art, pure engine data):
- the approved narration: Narration Master EN v2, Kokoro `am_michael` @ 1.00, 10:12 track;
- the cue timings;
- the scene structure M01–M46 (160 shots anchored to narration);
- the camera language, programmatic UI, music/SFX mix and mastering.

Once the final art arrives, it is swapped in by file path and the episode re-renders.

---

## 2. Engine changes that will be made (validation only, no architecture change)

The engine will enforce the contract before any render:

| Rule | Current behaviour | New behaviour |
|---|---|---|
| Missing file | Renders a labelled placeholder | **Blocks the render**: `ASSET_MISSING: <key>` |
| `source` / `status` | Not tracked | Must be `FINAL_ART` / `APPROVED` or the render is blocked |
| Forbidden sources | Not tracked | Rejects STORYBOARD, RECOVERED, REFERENCE, TEMP, UPSCALED_STORYBOARD, COLLAGE |
| Resolution | Reported as a warning | Blocks if the real file is below the declared/required resolution |
| `safe_zoom` | Not tracked | Blocks if any scene's camera or layer zoom exceeds the asset's `safe_zoom` |
| Quest version | Not tracked | Blocks if an episode mixes `character_version`s |
| Swap sets | Checked by eye | Checks equal canvas size across a `swap_set` |

Programmatic UI (counters, checklists, price tags, notifications, LOAD SAVE, comment cards, signs' text) is **not art**. The engine keeps building it in Remotion.

---

## 3. Gap: order v2 does not yet cover the whole hook

Order v2 = the 70 layered-kit files + 5 hook corrections:
- `core.env.quest_bedroom_morning`;
- `genre.war.bg_battlefield_city`;
- `genre.war.quest_tactical_action`;
- `genre.fantasy.princess`;
- `genre.fantasy.bg_castle_rescue`.

However, the approved **hook (M01–M15)** also uses the assets below, and today **none of them is FINAL_ART-certified**. They need a decision per group.

### 3A. Candidates to CERTIFY (you delivered them as individual files)
These came from the creative pipeline as single-element files: Part1 pack or Master Library `READY`. The engine only trimmed transparent margins.

If you confirm them as FINAL_ART / APPROVED, please re-deliver the **original untouched files** with manifest entries.

| Engine key | Came from |
|---|---|
| `wallet.happy` | Master Library v1 (READY) |
| `wallet.worried` | Master Library v1 (READY) |
| `wallet.fainted` | Part1 `wallet_exhausted.png` |
| `progress.cheering` | Part1 `progress_triumphant.png` |
| `grind.wheel` | Part1 `grind_hamster_wheel.png` |
| `fear.peeking` | Part1 `fear_shadow.png` |
| `quest.holding_paycheck` | Part1 `quest_money_celebration.png` |
| `quest.exhausted_slumped` | Part1 `quest_exhausted_desk.png` |
| `quest.farmer_gaming` | Part1 `quest_excited_gamer.png` |
| `quest.tractor_heroic` | Part1 `tractor_heroic.png` |
| `quest.desk_typing` | Master Library v1 (READY_VARIATION) |
| `ep001.dragon` | Master Library v1 (READY) |
| `ep001.tractor_huge` | Master Library v1 (READY) |
| `ep001.tractor_bigger` | Master Library v1 (READY_VARIATION) |

**Swap-set warnings:**
- `quest.exhausted_slumped` ↔ `quest.farmer_gaming` must share one canvas and alignment. Today they are two different compositions (desk vs gaming room).
- `wallet.happy` ↔ `wallet.worried` need identical canvas and position.

### 3B. Must be PRODUCED (currently engine-made crops/upscales or RECOVERED)
| Engine key | Scene | Spec |
|---|---|---|
| `quest.bed_sleeping` + `quest.bed_awake` | M01 | **Swap set.** Same bed, same canvas. Awake pose reaches toward a nightstand on screen-right. |
| `quest.looking_up_awe` | M04 | Standing, head tilted far back, looking up screen-right. |
| `quest.tractor_side` | M06, M11 | Quest driving a mid-size green tractor, side view facing left, visible in the cab. |
| `quest.knight` | M09 | Knight outfit (Quest_v1 face). Also listed in GENRE Fantasy. |
| `quest.farmer_planting` / `quest.farmer_fertilizer` / `quest.farmer_feeding` | M13 | Three clearly different chores: planting seedlings / wheelbarrow of fertilizer / feeding animals (chickens included). Same scale and framing. |
| `quest.excited` | M14 | Fists up, pure joy (farmer cap per brief). |
| `quest.sitting_back` | M15, M46 | Back view seated on a fence. **Swap set** with `quest.sitting_back_turn` (already in the order). |
| `ep001.alarm_clock`, `ep001.email_icon`, `ep001.paper_stack`, `ep001.window_lit` | M01, M02, M12 | Props, transparent. The email icon has no number: the engine draws the badge count. |
| `ep001.trailer_cargo`, `ep001.hay_roll` | M13 | Props for the fertilizer and feeding chores. |
| `ep001.bg_office` | M02, M03, M06 | Open-plan office, clean plate. |
| `ep001.bg_dealership` | M04, M14 | Tractor dealership lot, open centre-right. |
| `ep001.bg_living_room` | M05 | Living room at night with TV/gaming setup. |
| `ep001.bg_farm_ingame` | M06 | Bright idealised game-farm field. |
| `ep001.bg_fantasy` | M07 | Stormy fantasy crag for the dragon. |
| `ep001.bg_storm` | M10 | Storm sky, very low horizon. |
| `ep001.bg_field_huge` | M11 | See the `safe_zoom` note in §4. |
| `ep001.bg_city_evening` | M12 | Apartment facades at dusk, window grid. |
| `ep001.bg_farm_panorama` | M13 | Wide farm with three distinct stations: left crop rows, centre shed, right animal pen. |
| `ep001.bg_sunset_sky` + `ep001.mg_sunset_farm` + `ep001.fg_fence` | M15, M39, M45, M46 | **Layered parallax set painted as one scene.** The sky is opaque; the midground and fence are transparent strips that register exactly with the sky and with `quest.sitting_back`. |
| `brand.wordmark` | M15, M46 | Official logo, transparent, ≥ 1600 px wide. Plus `brand.q_mark` if available. |

Covered by the v2 corrections, so no action beyond the order:
- `ep001.bg_bedroom` → `core.env.quest_bedroom_morning`;
- `ep001.bg_action` → `genre.war.bg_battlefield_city`;
- `quest.action_hero` → `genre.war.quest_tactical_action`;
- `ep001.bg_castle` → `genre.fantasy.bg_castle_rescue`;
- `ep001.princess_tower` → `genre.fantasy.princess`.

**Count:** about **14 to certify + about 33 to produce** on top of the 75 in order v2. Please add them as order v2.1 (or v3), using the same schema.

---

## 4. `safe_zoom` conflicts with the approved hook camera

The schema defaults (background 1.20×, character 1.45×, object 1.35×) block several approved hook shots:

| Shot | Current camera | Needs |
|---|---|---|
| M11 "field slightly larger than expected" | starts at **5.5×** and pulls out to 1× | `ep001.bg_field_huge` at **15360×8640** with `safe_zoom 5.5`, or a detail plate + wide plate pair |
| M13 chores | **2.2×** on each station of the farm panorama | panorama ≥ **8448×4752** with `safe_zoom 2.2`, or three separate station plates |
| M04 tractor reveal | 1.45× start | dealership `safe_zoom 1.45` or 5760×3240 |
| M01, M03, M07, M10, M15 | 1.14–1.30× | background `safe_zoom ≥ 1.30` (4992×2808) or a small camera trim |

**Request:** declare `safe_zoom` per asset, and deliver the larger resolutions above where the shot needs them. The alternative is that the producer approves reducing those camera moves. The engine will not silently lower them.

---

## 5. Path convention

Order v2 mixes two conventions:
- `public/episodes/ep001_farming/kit/...` for the 70 legacy entries;
- `public/art/core|genres/...` for the 5 new ones.

**Proposal:** everything under one tree that mirrors the hierarchy.

```
public/art/core/quest/…            public/art/core/cast/{wallet,progress,grind,fear}/…
public/art/core/brand/…            public/art/core/environments/…   public/art/core/props/…
public/art/genres/farming/{backgrounds,machines,animals,props,quest}/…
public/art/genres/{war_action,fantasy,…}/…
public/art/episodes/ep001/{backgrounds,props}/…
```

The engine resolves by **key**, not by path, so the scenes do not care where a file lives. Only the manifest does. Just tell us which convention is final and keep it for every episode.

---

## 6. Delivery format (what the engine expects in each art package)

1. **One ZIP per delivery** (split into parts if > 30 MB; identical manifest in every part), containing:
   - the image files at their final paths;
   - `art_manifest.json`, following `SecondQuest_Art_Manifest_Schema_v1`: one entry per file with `key, path, kind, library_tier, source=FINAL_ART, status=APPROVED, required, resolution, transparent, safe_zoom, style_version, character_version (Quest), used_in, swap_set`.
2. **Keys** exactly as in the order: the engine never guesses by filename or look.
3. **Files:**
   - Backgrounds: opaque PNG/WebP.
   - Characters, props, machines and animals: transparent PNG, feet/base on the bottom edge, no baked shadow, about 2× on-screen size.
   - One element per file.
   - No UI, numbers or captions; signs and screens blank.
4. **Swap sets:** identical canvas size and origin, pixel-aligned, only the intended change.
5. **Partial deliveries are fine.** The engine validates what arrives and replies with a report, `OK` or `ASSET_MISSING / BAD_RESOLUTION / SAFE_ZOOM / SWAP_MISMATCH` per key, so art can be delivered in batches.

---

## 7. Workflow between the three of us

```
Producer approves script/storyboard
      │
ChatGPT: Art Order → final art → QC → art package (ZIP + art_manifest.json)
      │
Claude: validate → report (OK / blockers per key) ──► back to ChatGPT if anything fails
      │ all required keys OK
Claude: compose + animate + UI + narration sync + music/SFX → PREVIEW
      │
Producer review → fixes (art → ChatGPT, edit/timing → Claude) → MASTER
```

---

## 8. Other items needed from the creative side

- **Music (licensed):**
  - a loopable main bed, about 2–3 min;
  - a warm sunset/closing cue, about 60 s;
  - optionally a 3 s brand sting.

  The engine ducks the music under the voice automatically.
- **Brand pack:** wordmark, Q mark, avatar, palette and UI tokens (fonts and colours for the programmatic UI).

---

## 9. Open decisions (please answer in the next package)

1. Certify the §3A files as FINAL_ART, or re-draw them?
2. Add the §3B list to the order (v2.1)?
3. `safe_zoom`: deliver the larger resolutions in §4, or approve trimming those hook camera moves?
4. Final path convention (§5)?
5. Is `style_version = SecondQuest_2D_v1` and `character_version = Quest_v1` final for EP001?
