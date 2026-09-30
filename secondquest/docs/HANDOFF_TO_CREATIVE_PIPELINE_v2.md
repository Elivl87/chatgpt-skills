# SecondQuest: Production Engine → Creative Pipeline handoff v2

**From:** Claude (Production Engine / Engine V3)
**To:** ChatGPT (Creative Pipeline: script, storyboard, art direction, final art, art QC)
**Cc:** Producer (channel owner)
**Re:** `SecondQuest_CREATIVE_DECISIONS_v1_1`: engine validation is done and ready for FINAL_ART packages

This replaces `HANDOFF_TO_CREATIVE_PIPELINE_v1.md`. It covers:
- what the engine now enforces;
- how a package must be built so it installs without human fixing;
- what each validator code means;
- which schema points still need your answer.

---

## 1. Status in one paragraph

Engine V3 now validates every image against the Creative Decisions v1.1 contract, with no architecture change (no V4).

- **Engine commit:** `d6bf1de` on `claude/secondquest-pilot-hook-4yw8xj`.
- **Tests:** 58 passed, 0 failed.
- **Legacy art is blocked.** Nothing old was auto-certified. The EP001 hook and the full preview (`ep001full`) are both **blocked** until your FINAL_ART arrives:
  - `ep001`: 47 × `NOT_FINAL_ART` + 1 × `MUSIC_POLICY`;
  - `ep001full`: 118 × `NOT_FINAL_ART`.
- **No work on EP001 until art arrives.** EP001 will not be rendered, and Claude will not produce, repair or substitute art.

## 2. Decisions now enforced in code

| Decision (v1.1) | How the engine enforces it |
|---|---|
| FINAL_ART_ONLY for the whole hook and episode | Any used image whose `source` ≠ `FINAL_ART` or `status` ≠ `APPROVED` blocks the render |
| Forbidden sources | `STORYBOARD`, `RECOVERED`, `REFERENCE`, `TEMP`, `UPSCALED_STORYBOARD`, `COLLAGE` → `FORBIDDEN_SOURCE` |
| No old assets auto-certified | Art without contract fields is `NOT_FINAL_ART`, even if the file looks fine |
| `SecondQuest_2D_v1` / `Quest_v1` | Every asset must declare `style_version: SecondQuest_2D_v1`; every Quest asset must declare `character_version: Quest_v1`; one Quest version per episode |
| Library `public/art/core → genres → episodes` | Every manifest path must live under `public/art/` |
| Extreme zooms are fixed with layered compositions or dedicated assets, never upscaling | The real camera path is measured; exceeding `safe_zoom` → `SAFE_ZOOM`; drawing art larger than its file → `BAD_RESOLUTION` |
| No continuous background music | Audio is Narration > SFX > Ambience > Silence. Any music cue without explicit Producer approval → `MUSIC_POLICY` |

## 3. How to build a FINAL_ART package

### 3.1 ZIP parts
- **Size:** each ZIP part is at most **29.5 MB**. A larger part blocks the whole package (`PART_TOO_LARGE`).
- **Manifest:** **every part carries the same `art_manifest.json`**, identical content, at the ZIP root. A mismatch blocks the whole package (`MANIFEST_MISMATCH`).
- **File locations:**
  - files sit at their **exact final path** inside the ZIP, e.g. `public/art/core/quest/quest_idle.png`;
  - a file may be in any part; the engine looks for it across all parts.
- **Partial deliveries are allowed.** An entry listed in the manifest with no file in any part becomes `PENDING` and does not block the others.
- **Naming:** use a clear package name, e.g. `SQ_FINAL_ART_EP001_hook_v1_part1of3.zip`.

### 3.2 Folder convention
```
public/art/
  core/       reusable across all episodes (Quest, recurring props, UI-safe brand)
    quest/
    objects/
    backgrounds/
  genres/<genre>/      reusable within a genre (e.g. genres/farming/)
  episodes/<epNNN>/    single-episode art
```

### 3.3 `art_manifest.json`
```json
{
  "schema_version": "SecondQuest_Art_Manifest_Schema_v1",
  "package": "SQ_FINAL_ART_EP001_hook_v1",
  "assets": [
    {
      "key": "quest.idle",
      "path": "public/art/core/quest/quest_idle.png",
      "kind": "character",
      "library_tier": "CORE",
      "source": "FINAL_ART",
      "status": "APPROVED",
      "required": true,
      "resolution": "2400x3600",
      "transparent": true,
      "safe_zoom": 1.45,
      "style_version": "SecondQuest_2D_v1",
      "character_version": "Quest_v1",
      "used_in": ["M01", "M03"],
      "label": "Quest idle, front, red hoodie"
    },
    {
      "key": "ep001.bg_bedroom",
      "path": "public/art/episodes/ep001/backgrounds/bedroom.png",
      "kind": "background",
      "library_tier": "EPISODE",
      "source": "FINAL_ART",
      "status": "APPROVED",
      "required": true,
      "resolution": "3840x2160",
      "transparent": false,
      "safe_zoom": 1.2,
      "style_version": "SecondQuest_2D_v1",
      "used_in": ["M01"]
    }
  ]
}
```

**Required fields** (a missing one → `MANIFEST_FIELD`):
`key, path, kind, library_tier, source, status, required, resolution, transparent, safe_zoom, style_version, used_in`

**Conditional and optional fields:**
- `character_version` is required for every Quest asset.
- `swap_set` is required for pose/state swaps.
- `label`, `brief` and `anchor` are optional.

**Allowed values:**
- `kind`: `background`, `character`, `object`, `animal`, `machine`, `brand`.
  - `programmatic_ui` is built in Remotion; do **not** deliver it as an image.
- `library_tier`: `CORE`, `GENRE`, `EPISODE`.

### 3.4 Technical rules per file
- **Format:** PNG (preferred), WebP or JPEG. Transparent art must be PNG or WebP with alpha.
- **Resolution:** the file's real pixel size must equal `resolution`. Backgrounds must be at least **3840×2160**.
- **Transparency:**
  - `transparent: true` requires a real alpha channel;
  - characters and objects should be delivered with transparency.
- **Swaps** (e.g. Quest asleep → awake): every member shares one `swap_set` and has an **identical canvas size and registration**. That way the swap does not jump.
- **safe_zoom** is the maximum zoom the art tolerates on screen. The defaults are background 1.2, character 1.45, object 1.35. If a shot needs more, deliver a **dedicated tighter asset** or **separate layers** instead of raising the number.
- **Keys:**
  - keep keys stable;
  - a FINAL_ART key that matches an old engine key replaces the old art automatically;
  - reusing old key names where the scene already points to them saves re-wiring.

## 4. What happens when a package arrives

1. **Intake.** Claude runs `npm run art:intake -- part1.zip part2.zip …`.
2. **Package checks.** The same-manifest and ≤ 29.5 MB checks run on the package.
3. **Per-key validation.** Each key comes out as:
   - `OK`;
   - `PENDING` (no file yet);
   - `REJECTED` + codes.
4. **Install.** Only `OK` files are copied **byte-for-byte** into `public/art/...` and registered in the engine's art catalog. Nothing is edited, cropped, resized or converted.
5. **Report.** A per-key report is sent back to you (`reports/art-intake/<package>.json`).
6. **Render gate.** The episode is validated. It renders only when every image it uses is FINAL_ART / APPROVED and within `safe_zoom`, and the audio respects the music policy.

A rejected key is **your** fix: Claude reports it and does not repair it.

## 5. Validator codes

| Code | Meaning | Fix on your side |
|---|---|---|
| `OK` | Accepted | — |
| `ASSET_MISSING` | Scene uses a key with no file (or entry pending) | Deliver the file at the exact path |
| `NOT_FINAL_ART` | Legacy/unknown art, or source ≠ FINAL_ART | Deliver as FINAL_ART |
| `NOT_APPROVED` | status ≠ APPROVED | Approve in QC before shipping |
| `FORBIDDEN_SOURCE` | STORYBOARD / RECOVERED / REFERENCE / TEMP / UPSCALED_STORYBOARD / COLLAGE | Produce real final art |
| `MANIFEST_FIELD` | Missing/invalid field, unknown kind/tier, duplicate key, bad `resolution` format | Correct the manifest |
| `BAD_PATH` | Path not under `public/art/` | Use the folder convention (§3.2) |
| `BAD_RESOLUTION` | File ≠ declared size, background < 3840×2160, or art drawn larger on screen than the file | Deliver larger art or a dedicated asset |
| `BAD_TRANSPARENCY` | Declared transparent but no alpha | Export with alpha |
| `SAFE_ZOOM` | The scene's camera exceeds the asset's `safe_zoom` | Dedicated close-up asset or layered composition |
| `SWAP_MISMATCH` | Swapped assets don't share a `swap_set` or canvas size | Same set, same canvas, same registration |
| `STYLE_VERSION_MISMATCH` | style_version ≠ SecondQuest_2D_v1 | Re-export in the approved style |
| `QUEST_VERSION_MISMATCH` | Quest asset not Quest_v1, or mixed versions | All Quest art on Quest_v1 |
| `MUSIC_POLICY` | Music cues without Producer approval | (Engine side) remove, or Producer approves |
| `MANIFEST_MISMATCH` / `PART_TOO_LARGE` | Package-level blockers | Same manifest in every part; parts ≤ 29.5 MB |

## 6. Schema conflicts that need your answer

1. **ART_KIT_ORDER_v2 paths.** 70 of the 75 entries still point to `public/episodes/ep001_farming/kit/...`. As written they will all fail `BAD_PATH`. Please re-issue the order with `public/art/{core|genres|episodes}/...` paths.
2. **Hook/episode camera vs safe_zoom.** These shots exceed safe_zoom with the current framing:

   | Shot | Current zoom |
   |---|---|
   | M11 | 5.5× |
   | M13 | 2.2× |
   | M04 | 1.45× |
   | several backgrounds | 1.14–1.30× (limit 1.2) |

   For each, please add either a **dedicated close-up asset** or a **layered version** (separate bg / midground / subject) to the next Art Order.
3. **`kind: brand`** is placed by the engine as an overlay (logo/wordmark). Please confirm this is the intent.
4. **`used_in`** is read as the scene/shot IDs `M01…M46`. Please confirm, or send the ID convention you prefer.
5. **Swaps.** Every state change (sleep → wake, etc.) needs a `swap_set` with identical canvases. Please list the swap sets in the Art Order.
6. **Ambience.** It currently plays on the SFX bus; there is no separate ambience bus. If you want ambience beds, deliver them as audio files in the SFX catalog format (non-musical).
7. **Hook identity beat.** The planned 3.5–4.0 s identity beat is a timing change that will be applied when the hook art arrives. Please confirm the target length.
8. **Scene wiring.** Where your new keys differ from the current scene keys, the scenes will be re-pointed to your keys, as a data change only. Sending a `replaces` note per key (e.g. `"quest.idle" replaces "ep001.quest_bed_awake"`) makes this exact.

## 7. What Claude needs next

1. **The next Art Order**, with the missing hook assets and the §6 fixes, all under `public/art/`.
2. **FINAL_ART packages** built as in §3. Partial deliveries are fine.
3. **Answers to §6 items 3, 4 and 7.**

Claude will then:
- run intake;
- return the per-key report;
- re-point the scenes;
- report the render gate result.

Claude renders only when the Producer asks.
