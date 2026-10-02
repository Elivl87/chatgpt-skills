# Quest_v1: mandatory spec for every Higgsfield generation

This spec exists because of a mistake on 2026-10-02. EP001 thumbnail 1 came out with Quest wearing brown boots, and thumbnail 2 put the text "night" on a sunset scene. Both were errors in the prompt and in QC, and they cost credits.

## 1. Required identity block in every prompt that shows Quest

```
The SAME cartoon character as in the reference images (Quest_v1): young man, dark brown curly hair, light freckles, same face and proportions.
Outfit (never change): plain red hoodie with white drawstrings, no logos; blue denim jeans; RED canvas sneakers with white soles and white laces.
Same 2D cartoon style: bold ink outlines, flat cel shading.
```

**References:**
- Always attach the approved Quest_v1 jobs `ab2219a6-ee5c-4c3e-bb8e-10f4866781b2` and `f42c30bd-ce09-4ada-81c2-f2e33b6943fb` as `image_references`.
- If the shot shows the feet or the full body, also say so in the prompt: "his RED sneakers are visible".

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
