# Sala de Agentes — live agent panel

Producer asked (2026-10-12) for a panel showing what every agent is doing. Published artifact:
https://claude.ai/artifact/FLVZLpp3mogQhTqdPkLvM4 (private to the Producer; pixel-art desks, live via the artifact `db`).

Claude updates it with the ArtifactData tool whenever an agent starts, finishes or gets stuck:
- `agents/<id>`: {name, role, task, status: working|done|waiting|stuck, progress 0-100, order, updated ISO}
- `status/now`: {episode, headline, progress, updated, log: [{t, msg}] newest first, max 12}
Writes need edit access (rules: read view, write admin).
