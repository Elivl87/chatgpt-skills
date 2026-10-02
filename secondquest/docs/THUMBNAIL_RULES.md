# SecondQuest: thumbnail rules (the Producer's standard)

The model to follow is **EP001 thumbnail 3**, `docs/publish/EP001/thumbnails/SecondQuest_EP001_thumb_3.jpg`. The Producer approved it as the reference.

The rules come from MrBeast (his production guide), Paddy Galloway and YouTube's own guidance. Together with `QUEST_V1_PROMPT_SPEC.md`, they apply to every episode.

## Rules

1. **Plan the title and the thumbnail together, before production.** The text on the thumbnail does not repeat the title; it adds to it.
2. **Quest's face is big.** It fills about 30–40% of the frame and sits in the left third, close to the camera. One extreme, readable emotion: amazement, disbelief or joy.
3. **One clear subject that pays off the hook.** In thumbnail 3 it is the giant tractor Quest is pointing at. There are no secondary elements.
4. **Text: 1–3 extreme words.** The more extreme, the better: a figure, a superlative or a contradiction, e.g. "$500,000 TRACTOR".
5. **Text style:** Fredoka Bold, white and yellow #FFD600, a thick dark outline and a soft shadow. It goes on a clean area, usually the sky in the upper right, and never covers the face.
6. **High contrast and saturated colour:** red hoodie against blue or green, and a warm background.
7. **Readable on a phone:** the face and the text must be clear at 168x94 and 246x138. Check this on the review sheet before delivery.
8. **Accurate:** the thumbnail promises something the video delivers, with no misleading clickbait.
9. **Three variants for Test & Compare.** The scene stays the same and only the emotion or text changes, so the test measures the message. YouTube picks the winner by watch time.

## How each thumbnail is produced

1. **The image:** Higgsfield `gpt_image_2_5`, 16:9, 1k, 0.5 credits, generated **without text**. The prompt includes the Quest_v1 identity block and the references from `QUEST_V1_PROMPT_SPEC.md`.
2. **The text:** set programmatically by Claude in Fredoka. It is pixel-sharp and can be changed at no cost.
3. **QC:** run the checklist in `QUEST_V1_PROMPT_SPEC.md`, then build the phone-size review sheet. Only then is it shown to the Producer.
