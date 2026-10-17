# EP003 v3.4 · how the delivered master was made (2026-10-17)

Master: `EP003_master_1080p.mp4` (1920×1080 upscaled from 1280×720 renders, 30 fps, 328.4 s, −14.1 LUFS, peak −1.8 dB),
draft Release `deliver-ep003-master-1080p-v34`.

- 0–61.76 s: hook A + block B from this branch (script v3.3 sources; v3.4: whole chat phone in frame, Quest labels his
  own "Bought.", B beat on "alone").
- 61.76–328.4 s: blocks C–G of the Producer's base cut, commit **717b244d**, with `base_717b244d_CDEG_v34.patch`
  (text boxes fixed: recap stickers, carousel, grey phone, THE GROUP zoom, message bar, $7.99 tag, D phone/PAID/NEWEST,
  2031 roll, G mini-chat; dynamism: door knocks, two fish beats in E).
  Rebuild: `git worktree add <dir> 717b244d && git -C <dir> apply base_717b244d_CDEG_v34.patch`, then
  `scene_cache.py C|D|E|G` in `<dir>/secondquest/tools/hyperframes_ep003`.
- Audio: current mix 0–61.79 s + 717b244d mix from 65.33 s (30 ms crossfade in the pause before l12), plus the 8 CC0
  cues in `sfx_cues_v34.txt` (time, file under public/shared/sfx, dB, pan), then loudnorm −14 LUFS.
- `assemble_master.sh`: the exact join/encode.
