# AGENTS

A small set of tools for yumcut.com.

Rules:
- Keep every script in `scripts/NAME/*`.
- For every created/updated script, keep a short `scripts/NAME/README.md`.
- When a new tool/script is created, register it in the main `README.md` with:
  - a very short description (no examples)
  - a markdown link to `scripts/NAME/README.md`
  - a visible script path
- In that README, always provide 2 run examples:
  - required command with only required params
  - full command with all supported params
- Never use real/local absolute paths in README examples; use placeholders (for example `/path/to/input.mp4`) to avoid leaking sensitive info.
- Write scripts in TypeScript (`.ts`) only.
- Execute scripts with `tsx` (not plain `node`).
- Keep code modular in separate directories (for example `helpers`, `interfaces`, etc.).
- If a script uses text prompts, do not hardcode prompt text inside script code files.
- Store prompts in a dedicated directory inside that script folder (for example `scripts/NAME/prompts/*`) and keep them separated from code files.
- Keep every file under 400 lines.
- By default, scripts must write a final JSON report with generation price (if available) and total execution time.
- This JSON report must be disableable via a script option.
- Example report path format: `tmp/lipsync-runware/video-3-lipsync.json`.
- Never commit secrets; store local secrets in `.env`.
- When a requested change is done, commit only if tests, lint, and type checks pass.
- Use conventional commit messages (for example `feat:`, `fix:`, `docs:`, `chore:`).
