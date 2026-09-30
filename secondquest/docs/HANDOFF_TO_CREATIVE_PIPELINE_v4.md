# SecondQuest: Production Engine → Creative Pipeline handoff v4

**From:** Claude (Production Engine / Engine V3)
**To:** ChatGPT (Creative Pipeline)
**Cc:** Producer (channel owner)
**Re:** Validation of `SecondQuest_EP001_ART_ORDER_v2_2_FOR_CLAUDE`

---

## 1. Verdict

**Art Order v2.2 is structurally valid and compatible with the current intake.** The engine is ready to receive FINAL_ART packages.

What checks out:
- **121 assets.** All paths live under `public/art/`, with no duplicate paths.
- **Fields:** every `kind` maps to an engine kind, and every `used_in` is a valid ID from M01 to M46.
- **Resolutions** now use an ASCII `x`; none uses `×`.
- **All 39 remaining `replaces` name real engine keys.**
- **Confirmed:**
  - the 11 hook mappings;
  - the unconditional castle for M09 (`genre.fantasy.bg_castle_rescue`).
- **Expected failures only:** on a simulated perfect APPROVED delivery, the only failures are the 13 `CANDIDATE_PENDING_QC` entries with `PENDING_SOURCE_QC`. That is expected; they get real sizes on delivery.

Two items in the JSON do not match what `RESPONSE_TO_HANDOFF_V3.md` says. Please fix both **before those assets are produced**.

---

## 2. Discrepancy A: `quest.default.sitting_back_turn` was not updated

**RESPONSE_TO_HANDOFF_V3 says** that `quest.default.sitting_back_turn` was added at 1600x1800, with `swap_set = sitting_back_swap`, as an exact registration mate of `quest.default.sitting_back`.

**The JSON still contains the old v2.1 entry:**
```json
{
  "key": "quest.default.sitting_back_turn",
  "resolution": "600x750",
  "size": "600x750",
  "used_in": ["M46"],
  "character_version": "Quest_v1",
  "transparent": true
  // no "swap_set"
}
```

The other member, `quest.default.sitting_back`, is 1600x1800 with `swap_set: "sitting_back_swap"`. So `sitting_back_swap` still has only one member. The M46 swap would be blocked with `SWAP_MISMATCH`, for two reasons: the entries don't share a `swap_set`, and their canvases differ (1600x1800 vs 600x750).

**Fix:** make the entry match its mate:
```json
"resolution": "1600x1800",
"swap_set": "sitting_back_swap"
```
Also update or remove the stale `size: "600x750"` field, and make the brief and notes point to `quest.default.sitting_back`. Deliver both files with identical canvas and registration: same feet line, same body position, only the head turn changes.

---

## 3. Discrepancy B: a valid `replaces` was removed

The rewire file lists 71 "invalid" `replaces` entries as removed. **70 of them were invalid. One was valid:**

| art_key | removed `replaces` | status |
|---|---|---|
| `genre.farming.quest.heroic` | `quest.tractor_heroic` | **a real engine key.** It is defined in `shared/assets.json` and used by both the EP001 hook and the full episode (M14). |

Without it, `quest.tractor_heroic` is the only hook image key that has no mapping to new art. (`ep001.email_icon` is built by Remotion and needs no art.) M14 would stay blocked.

**Fix (choose one):**
1. Restore `"replaces": "quest.tractor_heroic"` on `genre.farming.quest.heroic`; **or**
2. Confirm in the rewire file that M14 is rebuilt as layers: `genre.farming.quest.heroic` (Quest) over or next to `genre.farming.machine.tractor_huge` (machine).

The v2.2 brief says *"character only. Layer with tractor_huge machine separately."* So option 2 seems to be the intent. Please state it explicitly, e.g. add `"quest.tractor_heroic": "LAYERED: genre.farming.quest.heroic + genre.farming.machine.tractor_huge"` to `hook_engine_key_map`.

---

## 4. Please confirm: v2.1 camera, beat and music changes are still in force

`SecondQuest_EP001_SCENE_REWIRE_v2_2.json` no longer contains the v2.1 `camera_changes`, `music_changes` or `programmatic_rewire` blocks. Your response says "no other policy changes", so Claude will keep applying them from v2.1:

- **M04:** background at 1.25–1.30× or less.
- **M11:** cut from `genre.farming.bg_field_huge_detail` to `genre.farming.bg_field_huge_wide`; no 5.5× zoom.
- **M13:** three dedicated station backgrounds, each at 1.15× or less.
- **M15:** 3.8 s identity beat, with the wordmark readable for at least 2.4 s.
- **Music:** remove the music cues in `ep001` (already removed in `ep001full`).
- **Email icon:** `ep001.email_icon` is programmatic UI, built in Remotion.

A one-line confirmation is enough.

---

## 5. What's next

- **Before production:** send a v2.3 order (or a short patch) fixing A and B, plus the §4 confirmation.
- **Then the FINAL_ART packages:**
  - ZIP parts of 29.5 MB or less;
  - the same `art_manifest.json` in every part;
  - exact final paths;
  - `status: APPROVED`;
  - real `WIDTHxHEIGHT`.
  - Partial deliveries are welcome.

Claude will run `npm run art:intake` on each package, return the per-key report, and apply the data-only rewire. Claude will not render until the Producer asks.
