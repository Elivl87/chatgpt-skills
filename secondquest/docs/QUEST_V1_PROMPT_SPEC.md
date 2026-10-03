# Quest_v1: mandatory spec for every Higgsfield generation

This spec exists because of a mistake on 2026-10-02. EP001 thumbnail 1 came out with Quest wearing brown boots, and thumbnail 2 put the text "night" on a sunset scene. Both were errors in the prompt and in QC, and they cost credits.

## 1. Required identity block in every prompt that shows Quest

```
The SAME cartoon character as in the reference images (Quest_v1): young man, dark brown curly hair, light freckles, same face and proportions.
Outfit (never change): plain red hoodie with white drawstrings, no logos; blue denim jeans; RED canvas sneakers with white soles and white laces.
Same 2D cartoon style: bold ink outlines, flat cel shading.
```

**References (corrected 2026-10-03):**
- Use the Higgsfield reference element **Quest-v1-6ref** (`755771c5-9283-4473-a037-a4a983c75238`), approved by the Producer on 2026-10-03. Put `<<<755771c5-9283-4473-a037-a4a983c75238>>>` in the prompt.
  - Its six default-outfit images are holding_paycheck, gaming_excited, phone_overwhelmed, exhausted_slumped, wrench_fixing and arms_up_back.
  - If a model does not support elements, attach job `ab2219a6-ee5c-4c3e-bb8e-10f4866781b2` as an `image_reference` instead.
- Elements `Quest_v1` (89051d04), `Quest-limit-test-24` and `Quest-sheet-test` are superseded or test elements: do not use them.
- **Never use `f42c30bd-ce09-4ada-81c2-f2e33b6943fb` for the default outfit.** That job shows the **farming outfit** (overalls and **brown boots**). It is the likely cause of the brown boots on EP001 thumbnail 1. Use it only for the farming costume.
- If the shot shows the feet or the full body, also say so in the prompt: "his RED sneakers are visible".

## 1a. Accepted details of the look
- A dark grey/black undershirt shows at the hoodie's neckline: it is in every approved Quest asset, so it is part of
  his look (confirmed by the Producer, 2026-10-03), not a defect.

## 1b. Costumes (Producer rule, 2026-10-03)
In a costume (e.g. EP002 Hero-of-Time-like green tunic and cap, similar but not equal to Link's) only the clothes
change: same face, curly dark brown hair, freckles, **human ears**, same body. Add to the prompt:
"Same face, hair and human ears as Quest_v1; only the outfit changes."

## 1c. Proportions with Pixie (Producer, 2026-10-03)
- Quest is about **5.5 heads tall**, sturdy build: big curly hair, roomy hoodie, wide jeans, big sneakers.
- Pixie is about **5.8 heads tall**, slimmer, and **95% of Quest's height** (she is a little shorter, never exaggerated).
- In the animatic/engine, scale is set by face width: **Pixie's face = 0.90 x Quest's** in every pose (sitting,
  standing, pointing), plus perspective only for depth. Comparison sheet: `docs/ep002/quest_pixie_proportions.jpg`.
- New art (young versions, costumes) must keep these proportions; QC checks them side by side with Pixie.

## 2. Text and scene must match

Before generating, check that any text that will go on the image agrees with what the scene shows:
- **Time of day:** night, day or sunset.
- **Weather.**
- **Objects:** if the text names a tractor or a price, the image must show it.

If they do not agree, fix the prompt or the text **before** spending credits.

## 3. QC before showing anything to the Producer (all items must pass)

- [ ] Face matches Quest_v1: curly dark hair, freckles, eyes.
- [ ] Red hoodie, blue jeans, **red sneakers**. Check the feet whenever they are in frame.
- [ ] No logos, brands or stray text in the generated image.
- [ ] Overlaid text agrees with the scene (time of day, objects).
- [ ] Readable at phone size (168x94 and 246x138).

If an item fails, report it to the Producer as a defect. Never present a failing image as "acceptable".
