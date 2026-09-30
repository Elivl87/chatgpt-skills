# SecondQuest EP001 — ART KIT ORDER v2.1 · FINAL ART ONLY

**Official assets tracked:** 121  
**Style:** SecondQuest_2D_v1  
**Quest:** Quest_v1  
**Music:** OFF by default

## Decisions returned to Engine V3

- `kind: brand` = confirmed engine overlay.
- `used_in` = master composition IDs M01–M46.
- Identity beat target = **3.8 s total**, wordmark fully readable for at least **2.4 s**.
- Ambience stays on the existing SFX bus; no new ambience bus required.
- All art paths now live under `public/art/`.
- M11 no longer uses 5.5× zoom: detail plate → wide reveal.
- M13 no longer uses 2.2× panorama crops: three dedicated station backgrounds.
- M04 should be reframed to keep background movement around ≤1.25–1.30×.
- Existing music cues for EP001/ep001full should be removed/disabled.

## Candidate legacy originals

No old asset is auto-certified. Candidate originals are `CANDIDATE_PENDING_QC`; Creative Pipeline either approves the untouched original and re-delivers it as FINAL_ART/APPROVED, or reproduces it.

## Production rule

Storyboards stop at planning. The render pipeline sees only approved individual FINAL_ART assets.

## Package notes

- Final art deliveries: ZIP parts ≤29.5 MB.
- Identical `art_manifest.json` in each part.
- Partial deliveries allowed.
- Claude validates but never repairs art.