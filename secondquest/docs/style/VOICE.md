# SecondQuest: writing voice

Derived only from the locked scripts: EP001 (`episodes/ep001full/script.json`), EP002 (`episodes/ep002/script.json`,
ES-419 `docs/publish/EP002/script_es.json`), EP003 LOCKED v3.2 (`episodes/ep003/script.json` + `script.es.json`).
It guides **drafting and review before lock**. Locked scripts are never edited (CLAUDE.md); this file never justifies a
change to one. Idea re-implemented from the MIT `youtube-agent-skill` voice template (`docs/research/2026-10-12_youtube-agent-skill_REVIEW.md`).

## 1. Who we talk to

One person: an adult (25–40) who grew up with games and plays less now than they would like. Smart, a bit tired, on
the sofa at night. They know the game or have heard of it; they do not need it explained, they need it *understood*.
We talk to them like a friend who noticed something about their own life. We never talk to "gamers", "guys" or "chat".

## 2. How we actually talk

| Measure (EN) | EP001 | EP002 | EP003 |
|---|---|---|---|
| Words | 1,333 | 1,018 | 887 |
| Avg words / sentence | 6.5 | 7.3 | 7.6 |
| Sentences of ≤ 4 words | 43 % | 29 % | 26 % |
| Sentences of ≥ 20 words | 1 % | 1 % | 3 % |
| Questions | 2.9 % | 4.3 % | 5.2 % |
| Pace (Bram, incl. pauses) | 137 wpm | 148 wpm | 157 wpm (placeholder) |

**Target:** avg 6.5–8 words/sentence, questions ≈ 3–5 %, Bram ≈ 140–150 wpm, so ~1,000 words ≈ 7 min.

- **Short, then one long.** Fragments stack up; one long sentence carries the joke or the turn.
  "Traffic happens. People change their minds. Prices move. Plans collapse. Your internet provider decides today is
  apparently the perfect day to discover new and creative ways to disappoint you."
- **Lists of three, then a twist.** "Gambling the fish money. Fishing with a sniper rifle." / "A loan. A tractor. And
  a field that needs cultivating."
- **The ellipsis is a held breath before the punch.** "Make something they already know... feel like discovery
  again." (EP001: 30, EP002: 19, EP003: 5; use where Bram should pause, not as decoration.)
- **Second person, present tense.** "you" carries the essay (EP001: 64×); "we" for shared human behaviour ("We named
  a whole genre after the word for garbage."); "I"/"me" only in the CTA.
- **Humour = dry understatement and literal readings**, never mockery of the player. "Your fantasy is agricultural
  debt." / "That is an extremely large tree with an extremely personal problem." / "He will not get it later."
- **A "why" is built in steps:** strange fact → "So, why?" → first answer ("Start with the price.") → "But why
  fishing?" (second question, deeper) → the real reason is human, not mechanical ("Nobody in that boat came for the
  fish.") → a turn that reframes the title ("How to Fish sounds like a tutorial. And maybe it is. Just not for fishing.").
- **Connectives start lines:** And, But, Because, Which, So. ("Which, if we're honest, is how most friendships handle
  feelings.")
- **Callbacks** pay off the hook's images in the closing: the room, the TV, the Saturday (EP002 l13–16 → l140–143);
  "a bigger tractor" → "a really expensive tractor" (EP001); the group chat (EP003 l09 → l43).
- **Endings** restate the question, answer it in one quiet line, then land a small, warm image:
  "And this time... you both grew up." / "How to say "I miss you"... without ever having to say it."

## 3. Words and moves we never use

Absent from all three scripts, keep them out: exclamation marks in narration (only inside quoted dialogue),
"guys", "gamers", "welcome back", "in this video", "let's dive in", "smash that like", "you won't believe",
"insane / crazy / epic / legendary / masterpiece / iconic", "dopamine", "studies show", "scientists say", percentages,
"toxic", "addictive". No sneering at players or at the game. No listicle numbering. Never a bare "Why?" to close the hook.

## 4. Words and moves we do use

"Which", "Because", "somehow", "almost", "maybe", "probably" (one-word doubt: "Which is good. Probably."),
"Nobody…" as an opener ("Nobody wakes up thinking:"), "the strange part", "here's where things get interesting",
deadpan adverbs ("extremely", "incredibly", "surprisingly", "apparently"), quoted inner voices and chat dialogue,
"the game is about X; it was never about Y" reframes, "Same road. Different person." two-beat contrasts.

## 5. What we never claim

- **Every figure has a source** in the script's factual notes, rechecked at lock (EP003: $7.99 list price; 200k
  hope, Sweden Game Arena; 10 M estimate, Alinea, 1 Oct).
- **Estimates are labelled as estimates and attributed:** "one analytics firm estimated more than ten million", "It
  costs about eight dollars".
- **Quotes are verbatim and said to be:** "The developers' own description on Steam reads, word for word: …". No
  invented quotes from real people; imagined voices are clearly ours ("Nobody wakes up thinking: …").
- **No game IP on screen:** no capsule art, logos, title lettering or footage; characters evoked, never copied
  (`MONETIZATION_SAFETY_STANDARD.md`).
- No claims about a team's size, sales or intent beyond the source; comic exaggeration is allowed only when it
  reads as a joke and the Producer approved it (EP003 "launched across the island").

## 6. Our format

- **Hook (0–30 s):** concrete, visual, strange fact in line 1 (the thumbnail made real), 5–10 short lines, ends on
  exactly **"So, why?"** (ES-419 **"Entonces, ¿por qué?"**); the wordmark lands with its gold bar and the companion,
  then **1.5 s of silence**.
- **Blocks:** 5–8 acts of ~40–90 s, each opened by a question or a turn ("But why fishing?", "And Nintendo has
  another problem."), a concrete visual beat every 60–90 s (EP003: A Hook · B Invitation · C Adult way · D Why
  fishing · E Alibi · F Friendslop · G Payoff + CTA).
- **Payoff:** "So... why did millions…?" restated, answered in 1–3 lines, final image callback.
- **CTA shape:** an episode-specific question ("So who would you put in your boat?") + "And what game deserves a
  "why?" next?" + "Tell me in the comments." + "Maybe that's our next quest."
- **Companion detail:** our own small creature/object from the game's world (Navi, the unimpressed fish); in pauses
  and frame edges, never stealing a line; into the wordmark at the hook and the end.
- **Runtime:** 6–7 min (~900–1,050 words).

## 7. ES-419

Neutral Latin American, *tú* (never *usted/vosotros*), curly quotes “ ”, games' official Spanish names (Trifuerza,
Gran Árbol Deku), English proper names kept (Hyrule Field, Master Sword, How to Fish). Words: *bote, auto,
cachetada, utilería, chat del grupo*; no *vale, tío, coche, mola, ahorita, chévere, che*. Same line ids 1:1, length
ES/EN ≈ 1.05 (EP003), at most ~1.15. Same rhythm (EP002 ES avg 7.8 words/sentence, EP003 ES 7.6).

- Hook: "Entonces, ¿por qué?" · payoff: "Entonces... ¿por qué millones compraron un juego de pesca y no pescaron?"
- Fragments survive: "Comprado. Comprado. Comprado." / "El mismo camino. Otra persona."
- Dry humour translated, not literal: "Ese es un árbol extremadamente grande con un problema extremadamente personal."
  / "No lo va a comprar después." / "la última y ya". Doubt is *quizá*: "Lo cual es bueno. Probablemente."
- Verbatim quotes are translated and flagged: "dice, textualmente: “violencia caricaturesca contra peces…”".
- CTA: "¿Y qué juego merece ser nuestro próximo “por qué”? Dímelo en los comentarios." / "Quizá esa sea nuestra
  próxima quest." (sign-off keeps "quest").

## 8. Voice check (drafts before lock only)

- [ ] Line 1 is a concrete, strange, visual fact; hook ≤ ~30 s; last hook line exactly "So, why?" / "Entonces, ¿por qué?".
- [ ] Avg 6.5–8 words/sentence; one long sentence per run of fragments, not two in a row.
- [ ] "you" carries it; "I" only in the CTA; no exclamation marks outside quoted dialogue.
- [ ] Each block opens on a question or a turn; a visual beat every 60–90 s.
- [ ] The answer is about people, not mechanics; the ending calls back a hook image.
- [ ] No word from §3; humour is understatement, never at the player's expense.
- [ ] Every figure sourced, estimates labelled and attributed, quotes verbatim with "word for word".
- [ ] CTA shape intact; companion beats planned; ~900–1,050 words.
- [ ] ES-419: *tú*, no regionalisms, ids 1:1, ES/EN ≤ ~1.15.
