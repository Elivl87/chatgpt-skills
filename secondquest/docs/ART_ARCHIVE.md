# SecondQuest: permanent art archive

**Producer rule (2026-10-06, restated 2026-10-10):** no art of any episode is ever deleted. All the art of EP001 and
EP002 must stay available for the next episodes. Most generated EP002 art is versioned in git (`docs/art_orders`), but
the engine's art library (`public/art`, 804 MB) is not versioned (too big for git) and EP001's source packages lived only
in the working environment. So the art is also kept as **GitHub Release assets with tags starting `archive-`**:

- made by `.github/workflows/publish-file.yml` (the same join + checksum as deliveries);
- **never deleted**: `cleanup-deliveries.yml` only touches `deliver-*` releases, and publish-file.yml refuses
  `mode=delete` on an `archive-*` tag;
- draft releases: only the repository's collaborators see them.

## Archive 2026-10-10 (`archive-art-2026-10-10`)

| File | What | Contents |
|---|---|---|
| `SecondQuest_art_library_2026-10-10.tar` | the engine's art library + EP002 art | `public/art/` (core, genres, episodes, ep002 3D renders and overlays), `docs/art_orders/` (all generated EP002 art), the EP001 and EP002 thumbnails. 435 files |
| `SecondQuest_EP001_V3_CLEAN_packages.tar` | EP001's art as delivered | `PROD_READY/`: the V3 CLEAN production-ready packages (BASE_121, SUPPLEMENTAL_CAST_13, source payloads, index, gate, SHA256SUMS). 80 files |
| `SecondQuest_EP001_art_extras.tar` | other EP001 art | `SecondQuest_EP001_Final_Art_Assets.zip`, `SecondQuest_EP001_Final_Art_v2_Used_Assets.zip`, `originals/` (brand and core props), `art/` (background working previews). 229 files |

Every file's sha256 is in `docs/art_archive/MANIFEST_2026-10-10.txt` (column 1 = which tar). Each tar has a
`.sha256` checked by the workflow when it was published.

## Restore

1. Download the tar from the release (logged in as Elivl87).
2. `sha256sum` it and compare with the release's checksum.
3. Library: `tar -xf SecondQuest_art_library_2026-10-10.tar` from the `secondquest/` folder: it puts `public/art/`
   back exactly where the engine expects it. EP001 packages: extract anywhere and use `npm run art:intake -- <dir>`
   if the library ever has to be rebuilt from source.
4. Check files against the manifest: `grep '^A' MANIFEST_2026-10-10.txt | cut -c4- | sha256sum -c`.

## From now on

At the end of every episode, its new art goes into a new `archive-art-<date>` release (only what is not in an
earlier archive), and its manifest into `docs/art_archive/`.

## Archive 2026-10-18 (`archive-art-ep003-2026-10-18`)

| File | What | Contents |
|---|---|---|
| `SecondQuest_EP003_art_2026-10-18.tar` | EP003 3D cut-outs (our renderer, `tools/props3d`) | `public/art/ep003/` (308 files: rowboat layers, fish v2 + expressions, Max/Leo poses and boat layers, game-world props), 55.5 MB |

Restore in a new session (seconds, no re-render): download asset 652367306
(`gh api -H "Accept: application/octet-stream" repos/Elivl87/chatgpt-skills/releases/assets/652367306 > ep003_art.tar`)
and `tar -xf ep003_art.tar` from `secondquest/`. Together with `archive-art-2026-10-10` this restores all of `public/art`.
