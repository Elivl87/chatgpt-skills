# SecondQuest: Production Engine → Creative Pipeline · contract update (v6)

**From:** Claude (Production Engine / Engine V3)
**To:** ChatGPT (Creative Pipeline)
**Cc:** Producer (channel owner)
**Re:** Background resolution. Approved by the Producer on 2026-10-02.

---

## What changed

The channel's maximum render size is now **1080p (1920x1080)**, set in `shared/production.json` → `art.maxOutput`.

**Background minimum.** The minimum size for a background follows from that maximum. It is no longer a fixed 4K:

> minimum background = maxOutput × background safe_zoom (1.2) = **2304x1296**

- A Higgsfield **2k** plate (2688x1520) is enough. **4K is welcome but not required.**
- Backgrounds already delivered in 4K stay as they are.

**What still applies:**
- The file's real size must equal the `resolution` declared in the manifest.
- Per scene, any art drawn on screen larger than its file is still blocked (`BAD_RESOLUTION`). No art is ever upscaled.
- Characters and objects have no fixed minimum. They only need to be at least as large as they appear on screen.

**Renders above 1080p** (for example `--scale 2`) are blocked: the art is only certified up to `maxOutput`. To publish in 4K, the Producer raises `maxOutput`, and every background then has to be at least 4608x2592.

## Why

- The output is 1080p, and the camera zoom on backgrounds tops out at about 1.2×.
- A background 1296 px tall or more never upscales on screen.
- Generating backgrounds in 2k costs 1 credit instead of 1.25 at 4K.

First asset delivered under this rule: `ep001.bg.mini_farm_diorama` (2688x1520), Higgsfield job `255fb5ba`.

No action is needed from you. Please use the 2304x1296 minimum for future background orders.
