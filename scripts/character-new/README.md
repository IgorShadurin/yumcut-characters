# character:new

Generate one 9:16 animated character image with Codex image generation using local Codex `auth.json`.

## Example

```bash
npm run character:new -- --prompt "friendly astronaut fox in mechanic overalls"
```

## Brainrot Style

Main style preset file:
`scripts/character-new/prompts/styles/brainrot.md`

Core brainrot behavior:
- Fuses normally incompatible things into one physically connected character (not separate props).
- Keeps one coherent anatomy with smooth material transitions.
- Preserves a playful, polished, social-feed-ready 3D look.

Short-input example:

```bash
npm run character:new -- \
  --prompt "macbook and banana" \
  --style-file scripts/character-new/prompts/styles/brainrot.md
```

Extended-input example:

```bash
npm run character:new -- \
  --prompt "macbook and banana, full-body character in a neon laundromat at midnight" \
  --style-file scripts/character-new/prompts/styles/brainrot.md
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

## Brainrot Generation Prompts (Exact)

1. `macbook and banana, full-body character in a neon laundromat at midnight`
2. `vintage microphone and jellyfish, full-body character on a backstage jazz club set with velvet curtains`
3. `espresso machine and hummingbird, full-body character on a rain-soaked city balcony at dawn`
4. `skateboard and crocodile, full-body character in a rooftop greenhouse with string lights`
5. `camping lantern and red panda, full-body character on a misty train-station platform at sunrise`

## Notes

- Default auth path: `~/.codex/auth.json`.
- Default style preset: `tropitoon`.
- Brainrot style preset path: `scripts/character-new/prompts/styles/brainrot.md`.
- Default prompt template path: `scripts/character-new/prompts/character-9x16.md`.
- Prompts are stored in `scripts/character-new/prompts/*`.
- By default, writes a sidecar JSON report with timing and cost (if available).
- Disable cost fields: `--no-cost`.
- Disable JSON report creation: `--no-report`.
