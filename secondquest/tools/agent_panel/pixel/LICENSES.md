# Licenses and credits — Sala de Agentes (pixel office)

This page is a modified build of **Pixel Agents** (https://github.com/pablodelucca/pixel-agents,
commit in `source/UPSTREAM_COMMIT`). Our changes (serverless db transport, Spanish labels,
red "!" / amber "..." bubbles, compact name tags, viewport fit) are in `source/secondquest-fork.patch`.

## Code — MIT (Pixel Agents)

```
MIT License

Copyright (c) 2026 Pablo De Lucca

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

The bundle (`pixel-office.js`) also contains React and React DOM (MIT, Copyright (c) Meta Platforms, Inc. and affiliates)
and Tailwind CSS output in `pixel-office.css` (MIT, Copyright (c) Tailwind Labs, Inc.).

## Art

- **Characters** (`characters` in `office-data.json`, decoded from `webview-ui/public/assets/characters/char_*.png`):
  per the Pixel Agents README, "based on the amazing work of JIK-A-4, Metro City"
  (https://jik-a-4.itch.io/metrocity-free-topdown-character-pack). The itch.io page states:
  "This is a completely free asset pack for top down games. You can use it as you wish."
  and "Credits are not necessary but would be appreciated." Credit: **MetroCity character pack by JIK-A-4**.
- **Furniture, floors, walls, carpets, pets (Claudio, Gitcat), speech bubbles**: shipped inside the MIT-licensed
  Pixel Agents repository; its CHANGELOG (v1.1.0, PR #117) describes them as the "open-source assets" that replaced
  the earlier proprietary tileset. No separate asset license file exists in the repo, so they are used under the
  repository's MIT license above. The red "!" bubble is our own edit of their permission bubble.

## Font — SIL Open Font License

`pixel-office.ttf` is **FS Pixel Sans Unicode Regular**, Copyright NZWStudios2024 (2025), made with FontStruct
(https://fontstruct.com/fontstructions/show/2606508/fs-pixel-sans-unicode-regular). The font's name table states
"Open Font License". It is bundled unmodified.
