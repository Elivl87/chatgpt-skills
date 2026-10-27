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

## Archive 2026-10-19 (`archive-art-dtd-2026-10-19`)

| File | What | Contents |
|---|---|---|
| `SecondQuest_DTD_art_2026-10-19.tar` | Dave the Diver art so far | `public/art/davethediver/` (61 files, 21.6 MB): plates (bar_interior_night, bay_exterior_dusk, Higgsfield 2.0 cr), pixel sprites, props3d cast (Leo-Cobra, Max, stool, bubbles) + pink dolphin v3 (24 cut-outs). sha256 8c907da4…dabb2; per-file list `docs/art_archive/MANIFEST_DTD_2026-10-19.txt` |

Restore: download the asset of release `archive-art-dtd-2026-10-19` and `tar -xf` it from `secondquest/` (done by `scripts/dtd_restore.sh`).

## Archive 2026-10-24 (`archive-art-dtd-2026-10-24`)

| File | What | Contents |
|---|---|---|
| `SecondQuest_DTD_art_2026-10-24.tar` | Dave the Diver art made while building block A (only what is not in the 10-19 archive) | 6 files, 1.8 MB: `props3d/diveboat_{side,side_back,side_front,34}.png` (our dive boat SECOND WIND 02, `render.py dtd_boat`), `props3d/dolphin_grey_leap_happy.png` (`render.py dtd_dolphin`), `pixel/derived/p01_quest_swim_A_blue.png` (`tools/hyperframes_davethediver/derive_art.py`) |

Manifest: `docs/art_archive/MANIFEST_DTD_2026-10-24.txt` (column 1 = `E`). Restore: download the asset of release
`archive-art-dtd-2026-10-24` and `tar -xf` it from `secondquest/` (done by `scripts/dtd_restore.sh`). All six can also
be re-rendered for free with the commands above.

## Organized backup 2026-10-27 (`archive-backup-arte-2026-10-27`)

Complete, organized copy of all SecondQuest art for the Producer to download (draft release, 10 zips). It holds the
362 Higgsfield originals (319 images + 43 TTS audios, full resolution, with prompt/model/job id) that exist nowhere
else, plus everything in `public/art`, `docs/art_orders`, the EP001/EP002 thumbnails and the 4 archive releases above
(EP001-era art that is not in the container included). Identical files (same sha256) are stored once; `INDICE.csv`
lists all origins. 1435 unique files, 2.47 GB.

| Zip | Contents | Files |
|---|---|---|
| `00_Indice.zip` | `INDICE.csv` (archivo, categoria, personaje, episodio, fecha, modelo, prompt, id_higgsfield, origen, ruta_original) + `LEEME.txt` | 2 |
| `01_Quest.zip` | `<EPISODIO>/` + `Trajes/` | 122 |
| `02_Pixie.zip` | `<EPISODIO>/` + `Trajes/` | 52 |
| `03_Otros_personajes.zip` | one folder per character (Max, Leo_Cobra, Duff, Otto, Sea_People, Dolphin, Puff_Burbuja, Wallet, Fear, Grind, Progress, Villano...) | 316 |
| `04_Objetos.zip` | props, icons, props3d, cut-outs without characters | 483 |
| `05_Fondos.zip` | backgrounds/plates by episode | 150 |
| `06_Escenas.zip` | characters in an environment, thumbnails | 52 |
| `07_Video.zip` | none (Higgsfield history had no videos) | 1 note |
| `08_Audio.zip` | Higgsfield TTS narrations by episode | 43 |
| `09_Revisar.zip` | ambiguous: EP001 working files, metadata, scripts (never executed) | 217 |

File names: `<EPISODIO>_<YYYY-MM-DD>_<slug>_<id8>.<ext>`; `_recorte` = repo-derived cut-out next to its Higgsfield original.
Episodes: BASE, EP001, EP002, EP003, DTD, GENEROS, SIN_EP. Find a file by prompt: filter the `prompt` column of `INDICE.csv`.

Verification: the `archive-art-2026-10-10` tars were checked against `docs/art_archive/MANIFEST_2026-10-10.txt` with
`sha256sum -c` per set: A 435/435 OK, B 80/80 OK, C 229/229 OK, 0 FAILED. Nested zips of sets B and C were extracted
into separate directories and classified as EP001.

Gaps: the Higgsfield 3D generation listing failed (service error), so any 3D jobs are not in the backup; the last 19
images (2026-10-01 page) have abbreviated prompts in `INDICE.csv` (files are full resolution).
