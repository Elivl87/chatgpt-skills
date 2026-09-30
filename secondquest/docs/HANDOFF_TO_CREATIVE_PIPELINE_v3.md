# SecondQuest: Production Engine → Creative Pipeline handoff v3

**From:** Claude (Production Engine / Engine V3)
**To:** ChatGPT (Creative Pipeline)
**Cc:** Producer (channel owner)
**Re:** Validation of `SecondQuest_EP001_ART_ORDER_v2_1_FOR_CLAUDE`

---

## 1. Verdict

**Art Order v2.1 is compatible with the current intake and is accepted.**

To check this, every one of the 121 entries went through the same validator that `npm run art:intake` uses. The test simulated a perfect delivery: each file present at its declared size and alpha, with status `APPROVED`.

**What passed:**
- All 121 paths live under `public/art/`, with no duplicate paths.
- Every `kind` maps to an engine kind, and `brand` is placed as an overlay (confirmed).
- Every `used_in` is a valid master ID from `M01` to `M46`.
- `style_version` is `SecondQuest_2D_v1` on all 121 entries, and all 36 Quest assets declare `Quest_v1`.
- All 4 swap sets declare identical canvases.
- **M11:** `genre.farming.bg_field_huge_detail` and `genre.farming.bg_field_huge_wide` are present.
- **M13:** the three dedicated station backgrounds are present, each with `safe_zoom` 1.15.
- **Accepted as written:** the identity beat (3.8 s total, wordmark readable for at least 2.4 s), ambience on the SFX bus, and music OFF.

**Engine fix made during this check:** the validator used to treat any key containing `quest_` as Quest art. Because of that, `core.bg.quest_bedroom_morning` (a background) was asked for a `character_version`. Now only `kind: character` art is treated as Quest. Tests: 59 passed, 0 failed. The order is archived in the repo under `docs/art_orders/EP001_v2_1/`.

**Unchanged:** no images were created, modified or recovered. No legacy candidate was certified, and EP001 was not rendered.

---

## 2. Items for the Creative Pipeline (none blocks the order)

### 2.1 Candidates must declare their real resolution on delivery
13 entries have `"resolution": "PENDING_SOURCE_QC"`. That is fine inside the order. However, a FINAL_ART delivery needs a real `WIDTHxHEIGHT`, otherwise intake rejects the key with `MANIFEST_FIELD`.

These are the 13 entries:
- `fear.peeking`
- `grind.wheel`
- `progress.cheering`
- `quest.default.desk_typing`
- `quest.default.exhausted_slumped`
- `quest.default.gaming_excited`
- `quest.default.holding_paycheck`
- `wallet.fainted`
- `wallet.happy`
- `wallet.worried`
- `genre.fantasy.dragon`
- `genre.farming.machine.tractor_bigger`
- `genre.farming.machine.tractor_huge`

### 2.2 Use `x`, not `×`, in `resolution`
75 entries write the size as `3840×2160` (Unicode multiplication sign). The engine accepts both, but the schema is `3840x2160`. Please use a plain `x` in delivery manifests.

### 2.3 `replaces` must name engine keys
99 entries carry `replaces`.
- **29** point to real engine keys. These are fine.
- **70** point to names from the old ART_KIT_ORDER_v2 that **do not exist in the engine**, for example:
  - `kit.bg_city_traffic`, `kit.bg_field_golden`, `kit.combine`, `kit.cow`;
  - `quest.arms_up_back`, `quest.drive_calm`, `quest.vacuum`;
  - `npc.banker`;
  - `core.env.quest_bedroom_morning`.

**Proposal (Claude):** those scenes are re-wired using `used_in` (the M01–M46 IDs), as a data-only change. Please either confirm this, or re-issue `replaces` with engine keys. The full list of the 70 entries is available on request.

### 2.4 Hook: 11 engine keys with no `replaces`
The EP001 hook uses 11 keys that no entry replaces. Each one has an obvious counterpart in the order. **Please confirm or correct each row:**

| Engine key used by the hook | Proposed Art Order key |
|---|---|
| `ep001.bg_bedroom` | `core.bg.quest_bedroom_morning` |
| `quest.desk_typing` | `quest.default.desk_typing` |
| `quest.holding_paycheck` | `quest.default.holding_paycheck` |
| `quest.exhausted_slumped` | `quest.default.exhausted_slumped` |
| `quest.farmer_gaming` | `quest.default.gaming_excited` |
| `ep001.dragon` | `genre.fantasy.dragon` |
| `ep001.tractor_huge` | `genre.farming.machine.tractor_huge` |
| `ep001.tractor_bigger` | `genre.farming.machine.tractor_bigger` |
| `ep001.bg_action` | `genre.war.bg_battlefield_city` |
| `quest.action_hero` | `genre.war.quest_tactical_action` |
| `ep001.bg_castle` | `genre.fantasy.bg_castle_rescue` (see 2.5) |

### 2.5 Castle background is conditional
`genre.fantasy.bg_castle_rescue` says *"Use if existing hook castle background is not sufficiently cinematic/interactive."* No legacy art is certified, so no castle background exists for M09. **Please confirm it is delivered unconditionally.** Otherwise M09 will be blocked with `ASSET_MISSING`.

### 2.6 `sitting_back_swap` has one member
`sitting_back_swap` contains only `quest.default.sitting_back` (1600x1800). A swap needs at least two states with identical canvases. **Please add the missing pose** (e.g. the turn-around state), or remove the `swap_set`.

### 2.7 Full episode: retired plates, rebuilt as layers
The full episode currently uses 82 `full.*` keys. These are the retired full-frame plates, and the order does not cover them, which is correct. When FINAL_ART arrives, those M01–M46 scenes will be rebuilt as layered compositions from the individual assets, using `used_in`. No action is needed from you, except making sure every asset a composition needs is in the order.

---

## 3. What Claude will apply when FINAL_ART arrives (data only, no render)

- Remove the EP001 hook music cues (`ep001full` is already done).
- Set the M15 identity beat to 3.8 s total, with the wordmark readable for at least 2.4 s.
- Reframe the camera:
  - **M04:** background at 1.25–1.30× or less;
  - **M11:** cut from the detail plate to the wide plate, no 5.5× zoom;
  - **M13:** three station backgrounds, each at 1.15× or less.
- Build `ep001.email_icon` as programmatic UI in Remotion.
- Re-point scenes to the new keys, per sections 2.3 and 2.4.
- Run `npm run art:intake` on each package, return the per-key report (`OK` / `PENDING` / `REJECTED` + codes), then report the render gate result.

Claude renders only when the Producer asks.

---

## 4. What Claude needs from you

1. **Answers to 2.3 (rewire method), 2.4 (the 11 mappings), 2.5 (castle) and 2.6 (swap set).** These can go in the next package's notes.
2. **FINAL_ART packages:**
   - ZIP parts of 29.5 MB or less;
   - the same `art_manifest.json` in every part;
   - exact final paths;
   - `status: APPROVED`;
   - real `resolution`, written with `x`.
   - Partial deliveries are welcome.
