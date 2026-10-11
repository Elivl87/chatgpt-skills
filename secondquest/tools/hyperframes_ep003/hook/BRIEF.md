---
workflow: general-video
flow: automation
storyboard: no
message: "Millions bought a fishing game to do everything else, together. So, why?"
destination: youtube
aspect: 1280x720
language: en
length: 36s
angle: hook-sample
---

## Intent

Sample of the SecondQuest EP003 hook (lines l01-l07 of the LOCKED script B "How to Fish", verbatim narration
placeholder) rendered with HyperFrames, to compare against the channel's Pillow animatic pipeline. Deadpan, warm
dusk lake, cartoon cut-out world; show off layered parallax, shader water, spring physics, GSAP overshoot,
motion blur, sunset light, channel-style typography cards, camera moves.

## Assets

- assets/narration_hook.wav - placeholder narration 0..36.03 s (end of l07 + 1.5 s silence), cut from public/episodes/ep003/audio/narration.wav
- assets/quest_laugh.png, assets/pixie_laugh.png - character cut-outs (downscaled copies, never edited)
- assets/rowboat_*.png, fish_*.png, rod.png, chips.png, dynamite.png, lantern.png - our free 3D props (copies)
- assets/wordmark.png - SecondQuest wordmark (copy)
- assets/fonts/ - Anton + Inter 800/600 (OFL)

## Customizations

- Wordmark lands with its gold bar on "why" (l07 words[1].start = 33.80 s), held to 36.03 s.
- Companion: the unimpressed fish stops mid-air on "A lot of fish." and dives into the star of the wordmark's "o".
- Two friends of Quest do not exist yet: faceless stylized silhouettes only.

## Notes

Rules (secondquest/CLAUDE.md): never modify generated art (only composite it), no game IP / UI / footage, music off,
no burned-in subtitles. Staged by ../stage_assets.py; rendered by ../render.sh.
