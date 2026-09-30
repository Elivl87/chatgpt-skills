# Current official EP001 Art Order / Scene Rewire

**EP001_v2_3** (`ART_KIT_ORDER_v2_3_FINAL_ART_ONLY` + `SCENE_REWIRE_v2_3`). Specification loop closed.

- Supersedes v2.1 and v2.2 (kept in this folder as history only).
- Validated by Engine V3 against the FINAL_ART intake contract:
  - 121 assets, all under `public/art/`, no duplicate paths;
  - kinds mapped; `used_in` M01–M46; ASCII `x` resolutions;
  - 39 `replaces`, all real engine keys;
  - 4 swap sets with identical canvases (incl. `sitting_back_swap` 1600x1800 ×2);
  - `quest.tractor_heroic` → layered `genre.farming.quest.heroic` + `genre.farming.machine.tractor_huge`;
  - 13 `CANDIDATE_PENDING_QC` get real WIDTHxHEIGHT only on FINAL_ART delivery.
- Next: FINAL_ART packages → `npm run art:intake`. No EP001 render until the Producer asks.
