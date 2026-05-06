# AGENTS

A small set of tools for yumcut.com.

Rules:
- Keep every script in `scripts/NAME/*`.
- Write scripts in TypeScript (`.ts`) only.
- Execute scripts with `tsx` (not plain `node`).
- Keep code modular in separate directories (for example `helpers`, `interfaces`, etc.).
- Keep every file under 400 lines.
- Never commit secrets; store local secrets in `.env`.
- When a requested change is done, commit only if tests, lint, and type checks pass.
