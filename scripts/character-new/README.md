# character:new

Generate one 9:16 animated character image with Codex image generation using local Codex `auth.json`.

## Example

```bash
npm run character:new -- --prompt "friendly astronaut fox in mechanic overalls"
```

## Full Params

```bash
npm run character:new -- \
  --prompt "friendly astronaut fox in mechanic overalls" \
  --output /path/to/output.png \
  --auth-path /Users/your-user/.codex/auth.json \
  --prompt-file /path/to/character-9x16.md \
  --style-file /path/to/style.md \
  --model gpt-5.4 \
  --include-cost=true \
  --include-report=true
```

## Notes

- Default auth path: `~/.codex/auth.json`.
- Default style preset: `tropitoon`.
- Default prompt template path: `scripts/character-new/prompts/character-9x16.md`.
- Prompts are stored in `scripts/character-new/prompts/*`.
- By default, writes a sidecar JSON report with timing and cost (if available).
- Disable cost fields: `--no-cost`.
- Disable JSON report creation: `--no-report`.
