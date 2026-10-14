# EP002 Short #2 v3 (22.6 s): design gate + builder critique

Producer, 2026-10-14:
- "Evitaría colocar a Pixie caminando..." Nobody fakes an action any more: no walk, no hop, no lean, no glide.
- "Busquemos que los shorts duren 20 seg... de dinamismo, de dopamina, de impacto. PERO CON COHERENCIA", max 25 s.
- "finalizar con la miniatura. Aprovecha a Pixie princesa con Quest... ¿El fondo de Deku Tree? ... haz esto explosivo."

## The arc (whole approved lines, verbatim; every cut inside a measured pause)

| Part | Time (s) | Lines | Picture | Why this art |
|---|---|---|---|---|
| Hook | 0-8.6 | l51-l53 | Hyrule field (#11). Silent young Quest (#3b) with his empty balloon; frame 0 is the finished title still. Pixie (#2c -> #2e) is revealed when the balloon pops, and she is the one who "has to decide". | The point lands in frame 0: the title plus a hero whose balloon is empty. |
| Escalation | 8.6-15.1 | l42-l46 | The giant tree (#14) in its N64 look (low-poly, flat light). On each word it upgrades and the camera whips to it: polygons (punch-in, its face appears), lighting (whip to the sun, flare and flash), animation (leaves fall), sound (a flock bursts out). | Producer's pick (Deku Tree): one landmark that gets "better" word by word. |
| Twist | 15.1-17.7 | l47 | Real life, 1998: the childhood bedroom (kid Quest #6a, kid Pixie #6b pointing the way at our CRT). Navi circles her hand. | "Familiar" is this Saturday, not the polygons. |
| Payoff | 17.7-19.8 | l60 | The remake's epic new look (#17+18: adult Quest and princess Pixie on the outcrop, golden hour) on "That is the". A hard cut on "impossible" goes to the castle in the sun, with the one bass-drop impact, a flash, a flare, a shake and the kinetic title (THAT IS THE rises, IMPOSSIBLE JOB slams 1.2 -> 1, then pulses on "job"). | The Producer's princess shot, used where the line asks for something epic. |
| End | 19.8-22.6 | - | The wordmark lands; Navi circles it into its star. Then the end card: the EP002 v3 thumbnail B1, whole, as a signboard in Hyrule field, with Pixie (#2c, waving) standing under it, FULL EPISODE / ON THE CHANNEL, and Navi flying into the sign ("Look!"). | It ends on the thumbnail. |

Dropped from v2 (the arc did not need them):
- the 1998/today field and the camera gag, both off the spine;
- "Probably.", which does not fit a 20 s arc;
- the night room. The vista replaces it as the payoff.

## Rhythm

There are 13 visual change events in 22.6 s (pacing read on the render), and the longest hold is 3.6 s (the hook title, by design). From 8.6 s on, something changes every 0.6-1.2 s, on the word.

## Rules checked

- **No fake actions:** Pixie no longer walks in. The balloon pops and she is revealed (a hard reveal with a small settle). Quest and Pixie never hop, lean or glide. Every movement is the world, the light, the camera or a cut between real poses.
- **One focal point per beat; titles never on the HUD:** the HUD is on only in the game world (A after the title, and B). It is off in the payoff, which is cinematic.
- **No text over faces:** captions are dropped while the l60 title is up, and every caption ends at its cut.
- **Characters full figure and sitting right:**
  - the hook's two stand on the road with contact shadows;
  - the kids are on the floor;
  - the vista is the plate as drawn. Known: the hem of the princess's dress touches the right edge at 17.8-18.7 s, because the two characters are wider than a 9:16 frame at z = 1.
  - On the card, Pixie stands on the grass under the sign.
- **Sound:** 6 onsets including Navi (16/min, 83 % rest):
  - Navi HELLO;
  - polygons swell;
  - birds on "sound";
  - the one bass-drop impact on the payoff cut;
  - the wordmark bell with Navi's trail;
  - Navi LOOK.

  The hook keeps Bram alone ("a silent character"). The "lighting" bell was cut (the flash and flare carry it). Master -14.2 LUFS, -4.7 dBTP.

## Gates (tools/hyperframes_ep002_short2/gates.sh): PASS

- `hyperframes lint`: 0 errors.
- frame_critic: 0.25 s sweep plus 1/30 s windows over the hook title, the title exit, every cut, the escalation, the payoff + wordmark, and the card. 0 errors. One warning: CHAR_SMALL for one frame at 21.2 s, while Pixie lands on the card.
- sfx_audit: 0/0.
- `hyperframes check`: ok.

## Issues found and fixed in this pass

- The 1998 tree read as a brown blur. It now uses finer facets and is not darkened.
- The lighting streak read as a glitch line, so it was removed.
- On "animation" the HUD covered the tree's face, so that shot is reframed lower.
- At the castle cut a sliver of the princess's dress showed, so the framing is now clear of it.
- Navi sat on the tree's moustache; her path was moved.
- The title slam overshot the safe area for one frame; the slam now starts at 1.2.
