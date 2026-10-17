# Scene render cache (EP003, 2026-10-17, Producer item 2 "renderizar más rápido")

`tools/hyperframes_ep003/scene_cache.py <X>` replaces `render_block.sh <X>` for iteration and review renders.

- **Scenes:** a cut wherever the visible top-level clips change, merged to ≥ 2 s, split to ≤ 6 s (G: 6 scenes of 5.7 s).
- **Key per scene:** the fingerprint of every frame (`scene_fp.cjs`: the real runtime seeks each frame in order and
  hashes boxes, transforms, opacity, colours, text, image src, pseudo-elements and canvases) + the block's art/fonts/vendor
  files + quality + the finish pass + the Hyperframes version. Run-to-run: 1035/1035 identical fingerprints on G.
- **A missing scene** renders alone: a copy of index.html with the clips shifted, the main timeline played up to t0
  frame by frame (as a whole-block render does) and then t0 → t1; Hyperframes render, finish pass, into
  `renders/scene_cache/<block>/`. The block = the scenes decoded and encoded once + its narration.
- **Draft:** `QUALITY=draft` → 854x480, 15 fps, Hyperframes draft quality (`EP003_block<X>_480p.mp4`, not versioned).

## Proof on block G (review quality, 1035 frames)

| Run | What changed | Scenes rendered | Time |
|---|---|---|---|
| 1 | nothing cached | 6 / 6 | 22.5 min (fingerprint 2 min + ~3.4 min per scene) |
| 2 | nothing | 0 / 6 | 2.3 min (fingerprint + concat) |
| 3 | `#sendBtn` tweens (G 17.3–23.0 s) | 1 / 6 | 5.6 min |

Against the previous whole-block render (`EP003_blockG.mp4` of 8e4889e): PSNR median 45.7 dB (encode noise only)
on 1019 of 1035 frames. The 16 other frames are defects **of the old render**, now fixed:
- 22.97–23.43 s (frames 691, 695, 699, 703): the send button vanished every 4th frame (one render worker cold-seeked
  `tl.to` tweens; `scene_cache_proof_sendBtn.png`, top = new, bottom = old). Template fix: explicit `fromTo` starts.
- 28.83–28.93 s (frames 865–868): the wordmark drips read `#wmMove`'s y one frame late; `frame(t)` now runs after every
  tween of its frame.
- 22.70–22.97 s (frames 681–688): the button's scale-out now starts from its real value (seek-safe), a 2-px change.

Limits: the fingerprint follows the composition's sequential state; a render-only fault (a cold-seek bug like the one
above) is not in the key, so after fixing one, delete that block's cache entries for the affected scenes.
