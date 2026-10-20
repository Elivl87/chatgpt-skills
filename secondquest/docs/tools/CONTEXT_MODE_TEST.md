# context-mode (mksglu/context-mode) · test 2026-10-20

Run locally (npm 1.0.169, ELv2) as an MCP server over stdio, no repo/config change. Same 3 tasks done earlier in the
DTD block A session, bytes returned to the model:

| Task | Whole file/output | context-mode | What we already do (grep / line range / tail) |
|---|---|---|---|
| How the dolphin grey variant is rendered (render.py + scene.ts) | 343 KB | 26 KB (80 sections listed + matches) | ~4 KB (grep + 25-line range) |
| Result of a render log | 31 KB | 1.4 KB, and it missed the answer line | 80 B (`tail -1`, answer included) |
| Block A words from timings.json | 109 KB | 1.3 KB | 1.7 KB (same script) |

- Its "92.7 % saved" is measured against `cat`-ing whole files, which our token rules already forbid.
- With our discipline it saves nothing and twice returned more or worse text than a targeted grep/tail.
- Its automatic part (hooks that redirect tool calls) did not install here (`PreToolUse hook: FAIL`); in cloud sessions
  it would need a repo-wide `.claude/settings.json` change for every session.
- Verdict: not adopted. Where it could help: a safety net for unexpected huge outputs; our rule "grep/ranges, tail,
  contact sheets, one builder" covers that. Re-test only if sessions start blowing up on raw tool output.
