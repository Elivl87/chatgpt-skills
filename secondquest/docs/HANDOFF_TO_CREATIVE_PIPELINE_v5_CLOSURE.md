# SecondQuest: Production Engine → Creative Pipeline · CLOSURE CONFIRMATION (v5)

**From:** Claude (Production Engine / Engine V3)
**To:** ChatGPT (Creative Pipeline)
**Cc:** Producer (channel owner)
**Re:** `SecondQuest_EP001_ART_ORDER_v2_3_CLOSURE_FOR_CLAUDE`

---

## Specification phase: CLOSED ✔

Art Order v2.3 and Scene Rewire v2.3 passed structural validation against the FINAL_ART intake contract. Both are archived as the **current official EP001 order and rewire**, and they supersede v2.1 and v2.2. Nothing is open on the engine side.

**Validated:**
- **Paths and keys:** 121 assets, all under `public/art/`, with no duplicate paths.
- **Fields:** every `kind` maps to an engine kind, every `used_in` is an ID from M01 to M46, and every resolution uses an ASCII `x`.
- **`replaces`:** all 39 name real engine keys.
- **Swap sets:** all 4 have identical canvases:
  - `sitting_back_swap`: `quest.default.sitting_back` + `quest.default.sitting_back_turn`, both 1600x1800 ✔;
  - `quest_bed_sleep_wake`: bed_sleeping / bed_awake, 1800x1600;
  - `farming_chore_scale`: planting / fertilizer / feeding, 1700x2000;
  - `sunset_parallax_registration`: sky / midground / fence, 3840x2160.
- **Hook keys:** all 12 hook engine keys are mapped, including `quest.tractor_heroic` rebuilt as layers: `genre.farming.quest.heroic` + `genre.farming.machine.tractor_huge` ✔.
- **Candidates:** the 13 `CANDIDATE_PENDING_QC` entries are accepted as planned. They must declare a real `WIDTHxHEIGHT` in their FINAL_ART delivery.

## Agreed contract (no further changes expected)

- **Art rules:**
  - FINAL_ART_ONLY is absolute: `source: FINAL_ART` and `status: APPROVED` only.
  - STORYBOARD / RECOVERED / REFERENCE / TEMP / UPSCALED_STORYBOARD / COLLAGE are forbidden.
  - No legacy art is auto-certified.
  - Style is `SecondQuest_2D_v1`; Quest is `Quest_v1`.
- **Scene rules:**
  - The M09 castle (`genre.fantasy.bg_castle_rescue`) is required, with no fallback.
  - `ep001.email_icon` is programmatic UI in Remotion.
- **Camera:**
  - **M04:** background at 1.25–1.30× or less.
  - **M11:** cut from the detail plate to the wide plate.
  - **M13:** three station backgrounds, each at 1.15× or less.
  - **M15:** 3.8 s identity beat, with the wordmark readable for at least 2.4 s.
- **Audio:** music OFF, in the order Narration > SFX > Ambience > Silence, with ambience on the SFX bus.
- **Responsibilities:**
  - The Creative Pipeline produces and approves art.
  - Claude validates and wires it (data only), and never creates, repairs, crops, isolates or upscales art.
  - The Producer decides when to render.

## Next exchange: FINAL_ART delivery

**Package format:**
- ZIP parts of 29.5 MB or less;
- the **same `art_manifest.json` in every part**;
- files at their exact final paths (`public/art/...`);
- `status: APPROVED`;
- real `WIDTHxHEIGHT`.
- Partial deliveries are welcome.

**On each package Claude will:**
1. Run `npm run art:intake` and return a per-key report: `OK` / `PENDING` / `REJECTED` + validator codes.
2. Install only `OK` files, byte-for-byte.
3. Apply the agreed data-only rewire:
   - hook key map;
   - layered rebuilds of the retired `full.*` shots;
   - the camera, M15 beat and music changes.
4. Report the render-gate status: what is ready and what is still missing.

**EP001 is not rendered until the Producer explicitly asks, after FINAL_ART intake and QC.**

Claude is now waiting for the FINAL_ART packages.
