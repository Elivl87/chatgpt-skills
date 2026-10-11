# EP003 · Producer decisions

## 2026-10-11 · Gate 1: script package
- **EP003 = B "How to Fish" — LOCKED v3** (`docs/ep003/scripts/B_HowToFish.md`): script, title
  "Why Did Millions Buy a Fishing Game... and Not Fish?", thumbnail NOT FISHING (variants WHY?! / JUST GET IT).
  Used verbatim from here; any change goes in as a SCRIPT CHANGE PROPOSAL to the Producer.
  The factual lock rechecks listed in the script run before recording; if one fails, Claude proposes the minimum change
  (never edits on its own).
- **A "GTA 6" reserved for EP004** (Producer: "dejemos A para el siguiente"). Risk: GTA VI is scheduled for
  Nov 19, 2026. EP004 must publish before launch (script as is, after rechecks) or be re-written as a post-launch
  version (the "what we lose is 'before GTA 6'" payoff still works, past tense). Decide at EP004 kickoff.
- C "Bongo Cat" stays in the bank (not reserved).

## 2026-10-11 · Placeholder voice
- Producer chose **voice A: Kokoro am_fenrir**, speed 0.94, `en-us`. Free.
- Improvement test (`docs/ep003/voice_test/v2_hookB/`, hook of B): blend with am_michael did NOT get closer to Bram
  (4.82 → 5.0+). Long-term EQ match toward Bram: 4.82 → 4.00; EQ + pitch +1 semitone (rubberband R3): 3.81
  (timbre distance, lower = closer). STT clean on both. Pending Producer ear choice between 2 and 3.

## 2026-10-11 · SCRIPT CHANGE PROPOSAL 01 (fact lock)
- Producer: "Apruebo 1 y 2, el 3 déjalo como exageración". Script B is now LOCKED v3.1:
  1. Steam quote without the ellipsis ("...gambling with fish (no real money)").
  2. "You begin with almost nothing. Soon you have guns and dynamite." (ES: "Empiezas casi sin nada. Pronto tienes armas y dinamita.")
  3. "launched across the island" stays, as comic exaggeration (our own drawing, never gameplay footage).
  4. "Everyone in the boat buys their own copy": checked by eye on the live Steam page before Bram records.

## 2026-10-11 · Voice: MOSS-TTS-Nano + Bram reference (INTERNAL placeholder)
- Producer authorized running MOSS-TTS-Nano (Apache-2.0, ONNX CPU) and asked to clone Bram: "Me encantó... Perfeccionarla y continuar".
- Scope set by Claude and stated to the Producer: the Bram-referenced voice is used ONLY as the animatic/timing
  placeholder; never in a published video, Short or delivery (Bram's voice is licensed through the paid platform; a
  published clone would need written permission or a licence). EN placeholder = MOSS + Bram reference; ES stays Kokoro
  until MOSS pronounces Spanish cleanly.

## 2026-10-11 · Hook line and companion
- Producer: "No dice: So, Why? Rompe lo del EP001 y EP002." Script B -> LOCKED v3.2: l07 "Why?" -> "So, why?"
  (ES "Entonces, ¿por qué?", as EP002). Rule written: the hook always ends on exactly "So, why?", the wordmark lands on
  it, 1.5 s of silence follow.
- Companion detail (RULE): EP003 = the unimpressed fish (docs/ep003/COMPANION.md).

## 2026-10-11 · Finish pass approved
- Producer: "Si me gusta la capa de acabado." `scripts/animatic/finish.py` (soft paper grain, vignette, halftone only
  in deep shadows) goes into EP003 and later episodes, applied last on every frame (animatic and final).
- Style bible + pacing QC adopted (`docs/style/STYLE_BIBLE.md`, `scripts/pacing_qc.py`); EP003 must pass it.

## 2026-10-12 · Scout adoption
- Producer: "Si todo menos lo de los labios": adopt for SecondQuest (EP003 on) depth-map parallax (Depth Anything V2
  Small, Apache-2.0), idle-motion warp (own code), springs/motion blur/log-zoom, procedural noise for water/sky,
  post-render QC (black/frozen/silence/R128), verification-before-completion discipline. NOT lip-sync.
- New channel concept A "Tiny Systems / Pequeños Sistemas" approved: Claude and its agents create it, all free.
- Credit approval for EP003 left "for the end of everything".

## 2026-10-12 · Animatic v5 chosen
- Producer: "La v5". Breathing camera (slow push + drift) + dust on plain cards adopted; camera-continuity rule updated
  in CLAUDE.md. v5 passes the style bible (15.6 cuts/min, 3.8 s avg shot, motion 51 %, 5.0 stills/min).

## 2026-10-12 · Wordmark moment and voice
- Producer: "Para el Wordmark usa 1 para la primera vez que sale, y 2 para el final." Hook = option 1 "The catch"
  (line + hook reel the wordmark up into place, one bobber bounce; sound: reel clicks + line zip + plop). End = option 2
  "Rising from the lake" (wordmark rises out of the water, drips; the fish surfaces and blinks; sound: water swell +
  drips). The sparkle sound is dropped. The fish no longer dives into the star.
- Voice: keep the MOSS + Bram-reference voice of the Hyperframes sample, perfected (narration v3: sentence-level
  best-of-5, Bram-measured pauses). VoxCPM test stopped.

## 2026-10-12 · EP003 moves to Hyperframes
- Producer: "Y si, el EP003 pasa a Hyperframe. Te quedó muy bien, igual revisa con tus agentes si se puede cambiar
  alguna escena, mejorarla, darle vida y dinamismo. dopamina para el espectador". EP003's engine = Hyperframes
  (heygen-com, Apache-2.0, free) in `tools/hyperframes_ep003`; the Python animatic stays as the reference cut and the
  timing source. Agents review every block for livelier, more dynamic scenes (script stays LOCKED, verbatim).

## 2026-10-12 · Fish v2 adopted; "top de top" pass on everything
- Producer: "Sí, adóptalo para todo el EP003" — companion fish v2 (our procedural 3D, 7 expressions) replaces v1 in the
  animatic and in Hyperframes.
- Producer: "Así como hiciste con el pez, quiero que revises ABSOLUTAMENTE TODO, y lo mejores consigas lo top de top."
  → full quality pass on everything we build ourselves (3D props, drawn plates, UI cards/chat, type, sound, motion).
  Generated art is never edited (rule); only our own code-made layers and the engine improve.
- Producer: "Sí, bájalo al 2–3%" — breathing camera push 2–3 %, drift ≤ 1.5 %, per-shot phase (kit + Hyperframes;
  CLAUDE.md camera rule updated).

## 2026-10-12 · ES-419 script locked
- Producer: "Apruebo el español del EP003 tal cual" — `episodes/ep003/script.es.json` (with l07 "Entonces, ¿por qué?")
  is LOCKED, used verbatim for Bram's Spanish dub.

## 2026-10-12 · Autonomy + game visual reference rule
- Producer: "Por qué paras y no sigues? Eso es falta de autonomía" — Claude chains the work without stopping; it only
  waits for the two approvals (script package, credits).
- Producer: "dentro de la investigación, toca revisar al detalle las gráficas, HUD, referencias de objetos y todo al
  detalle del juego … para poderlas introducir en el arte" — new research rule (CLAUDE.md + episode skill stage 1);
  done for How to Fish → `docs/ep003/GAME_VISUAL_REFERENCE.md`.
