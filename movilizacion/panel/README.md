# Sala de Agentes — Movilización

Panel en vivo de la evaluación de movilización del taladro (lump sum con el contratista vs. transporte tercerizado).
Artefacto publicado (privado): https://claude.ai/artifact/PePkWHjpNz14CtHcGZzHZv

Reutiliza el renderer pixel-art de `secondquest/tools/agent_panel/pixel/` (mismos archivos js/css/ttf/office-data,
publicados junto a este `index.html`). Claude lo actualiza con ArtifactData:
- `agents/<id>`: {name, role, task, status: working|done|waiting|stuck, progress 0-100, order, updated ISO}
- `status/now`: {episode: "Movilización", headline, progress, updated, log: [{t, msg}] más reciente primero, máx 12}
Reglas: lectura view, escritura admin.

Agentes: tarifas, costos, riesgos, sensibilidad, revisor-numeros, revisor-comite, integrador.
