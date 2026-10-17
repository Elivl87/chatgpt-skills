# EP003 · SCRIPT CHANGE PROPOSAL 02 — Hook / first block (Producer order 2026-10-17, "APPROVED WITH LOCKS")
Status: PROPOSAL. Master script, timeline and audio untouched until the Producer approves. 0 credits spent.

## A. Current hook (l01–l07, 34.1 s)
There is a game called How to Fish. A boat. A rod. A lot of fish. / And almost nobody seems to be fishing. / They are
slapping each other in the face. Gambling the fish money. Fishing with a sniper rifle. / It costs about eight dollars.
Its makers hoped it might sell two hundred thousand copies. By early October, one analytics firm estimated more than ten
million. / Millions of people bought a fishing game. To do everything else. / Together. / So, why?

## B. Proposed hook (~37 s; human problem lands at ~18–20 s instead of ~60 s)
| # | Line | Source |
|---|---|---|
| H1 | There is a game called How to Fish. A boat. A rod. A lot of fish. | l01 (Bram, reuse) |
| H2 | And almost nobody seems to be fishing. | l02 (reuse) |
| H3 | They are slapping each other in the face. | l03, first sentence (reuse) |
| H4 | It costs about eight dollars. | l04, first sentence (reuse) |
| H5 | A message in a group chat. "It's eight dollars. Just get it." | l09, last part (reuse) |
| H6 | Bought. Bought. Bought. | l10 without "And then, one by one:" (reuse) |
| H7 | And one friend who says "I'll get it later." He will not get it later. | l11 (reuse) |
| H8 | **Getting a few adults into the same boat is harder than anything in the game. And yet,** | **NEW** |
| H9 | millions of people bought a fishing game. To do everything else. Together. | l05 + l06 (reuse) |
| H10 | So, why? (+1.5 s silence, wordmark) | l07 (reuse) |

Function: recognition (H1–H3) → contradiction (H4, nobody fishing for $8) → human problem (H5–H8) → "So, why?".

## C/D. Script change proposals
1. CURRENT: l03 "They are slapping each other in the face. Gambling the fish money. Fishing with a sniper rifle."
   PROPOSED: "They are slapping each other in the face."
   REASON: keeps the funniest, most How-to-Fish-specific image; gambling and weapons return in the failure section.
2. CURRENT: l04 sales sentences in the hook.
   PROPOSED: moved to block B (see 5).
   REASON: numbers slow the hook; in B they explain *why* sales exploded.
3. CURRENT: l09–l11 (group chat, "I'll get it later") in block B at ~50–64 s.
   PROPOSED: moved into the hook as H5–H7, dropping "So it usually begins the same way." and "And then, one by one:".
   REASON: the human contradiction arrives at ~18 s instead of ~60 s.
4. NEW (H8): "Getting a few adults into the same boat is harder than anything in the game. And yet,"
   REASON: names the human problem in one line without revealing the thesis; "a few" because the player cap changed by
   patch (fact note). "And yet," bridges into the reused l05.
5. Block B, necessary transition (all reused audio, reordered):
   "Start with the price. Eight dollars is not really a price. It's an invitation. / Its makers hoped it might sell two
   hundred thousand copies. By early October, one analytics firm estimated more than ten million. / Because this is not
   really a game you play alone. Everyone in the boat buys their own copy. / Now compare that with the other way adults
   try to see their friends." (l13 onward unchanged.)
   REASON: "Because… everyone buys their own copy" now explains the ten million, and "compare that" still points to the
   eight-dollar invitation.
6. ES-419 (locked): mirrored change, H8 = "Juntar a unos cuantos adultos en el mismo bote es más difícil que cualquier
   cosa del juego. Y aun así," (no cost now: the Spanish dub is not recorded yet).

Unchanged: everything from l12 to the end, incl. the payoff. The payoff already has the minimal callback:
"Because nobody in that boat came for the fish. / The fish was just the thing you could say out loud. / … / How to say
'I miss you'… without ever having to say it." → no change (Producer lock 2 and 9 satisfied).

## C. Bram re-record required
Only H8 (≈85 characters, ~4 s). Location: hook, ~0:20. Everything else is cut from the existing Bram takes at word
boundaries (timings.json word times). If the splice into H9 sounds stitched (checked by ear + STT + loudness match),
fallback: one fresh Bram read of H1–H10 (~480 characters).

## D. Visual revision plan
| Beat | Plan | Material |
|---|---|---|
| H1–H2 | REUSE | current block A opening (lake plate 01, boat, title) |
| H3 | CROP/PUSH | approved art 02 slap revive |
| H4 | REUSE | $7.99 price tag (programmatic) |
| H5–H7 | RECOMPOSE + PROGRAMMATIC | block B group-chat UI, Max/Leo avatars, "Bought" bubbles |
| H8 | RECOMPOSE + PARALLAX | our 3D boat with Quest, Pixie, Max seated (in-boat layers) and one EMPTY seat; the "I'll get it later" bubble drifts over it |
| H9 | REUSE | block A "millions" shot |
| H10 | REUSE | wordmark + unimpressed fish, 1.5 s silence |
| Block B reorder | REUSE | existing block B shots retimed to the reordered lines |

## E. New-art gap
None.

## F. Credits
Expected 0.3–0.6 (H8, 1–2 takes, ~3.3 credits / 1,000 characters). Worst case (fresh full hook read) ≈ 1.6–1.8.
Hard cap 2.5 respected in every case. Balance 9.55.

## G. Timing impact
Hook 34.1 s → ~37 s (+3 s). Block B 28.8 s → ~24 s (−5 s). Episode ≈ −2 s (330.7 → ~329 s).
Blocks C–G: content and internal timing untouched; they only start ~2 s earlier (word-keyed timings, re-joined).
Only blocks A and B are rebuilt.
