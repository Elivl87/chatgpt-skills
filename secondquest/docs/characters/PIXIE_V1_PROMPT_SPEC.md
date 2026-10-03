# Pixie_v1: Quest's friend, recurring channel character (spec, design not generated yet)

Approved by the Producer on 2026-10-03: name **Pixie**, look of direction **A**, personality of direction **B**.

**Role:** Quest's friend and partner whenever an episode needs a girl, a friend or a companion. In-game roles are
costumes (EP002: the forest friend and the princess).

**Personality (B):** warm, curious, the friend who lives the stories; expressive, kind smile, wide-eyed wonder.

## Identity block (every prompt that shows Pixie)
```
The SAME cartoon character as in the reference images (Pixie_v1): young woman, long straight black hair in a high
ponytail with a few loose strands framing her face, warm brown eyes, light freckles, warm tan skin, same face and
proportions, warm and curious expression.
Default outfit (never change unless a costume is asked): blue-teal oversized hoodie with white drawstrings, no logos;
black leggings; plain white sneakers with no stripes and no logos.
Same 2D cartoon style as Quest_v1: bold ink outlines, flat cel shading.
```

## Costume rule (Producer, 2026-10-03; same rule for Quest)
When Pixie or Quest wear a costume, **only the clothes change**: face, hair, eyes, skin, ears and body stay exactly
the same. They are themselves in an outfit, never transformed into the game character (no elf ears, no new face).

## Proportions with Quest (Producer, 2026-10-03)
- Pixie is about **5.8 heads tall**, slim build, and **95% of Quest's height** (a little shorter, never exaggerated).
- Quest is about **5.5 heads tall**, sturdier (big curly hair, roomy hoodie, wide jeans).
- In the animatic/engine, scale is set by face width: **Pixie's face = 0.90 x Quest's** in every pose, plus perspective
  only for depth. Comparison sheet: `docs/ep002/quest_pixie_proportions.jpg`.
- New art (young versions, costumes) must keep these proportions; QC checks them side by side with Quest.

## References
- **Design approved by the Producer (2026-10-03): option B**, Higgsfield job `9526ebfd-dcb1-4a71-a766-9ac6fca1385d`
  (`docs/art_orders/pixie/results/pixie_design_B.png`), standing next to Quest.
- Known defect of that image, never to be copied: a curved swoosh-like stripe on her left sneaker. Her sneakers are
  always plain white (say it in every prompt where her feet show).
- **Reference element Pixie-v1-6ref `1015661a-8b38-4caa-a4e8-8e3a2eef9ba8`** (Producer pick, 2026-10-03): library
  poses 1 wave_happy, 2 gaming_excited, 3 looking_up_awe, 4 laughing_pointing, 7 surprised_shocked, 9 determined_fists.
  Put `<<<1015661a-8b38-4caa-a4e8-8e3a2eef9ba8>>>` in every prompt that shows Pixie.
- Library (10 transparent poses, Q006): `docs/art_orders/pixie/library/results/` (jobs in `jobs.json`).
