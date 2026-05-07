# character:new

Generate one 9:16 animated character image with Codex image generation using local Codex `auth.json`.

## Example

```bash
npm run character:new -- --prompt "friendly astronaut fox in mechanic overalls"
```

Redraw mode (same style from reference image, HQ by default):

```bash
npm run character:new -- \
  --mode redraw \
  --source-image /path/to/reference-image.webp \
  --prompt "same character style, new rooftop city background at sunset"
```

## Prompt Files

- `scripts/character-new/prompts/character-9x16.md` - Base 9:16 full-body character template.
- `scripts/character-new/prompts/redraw-9x16.md` - Redraw template for image-to-image mode.
- `scripts/character-new/prompts/safezone-template-9x16.png` - Composition guide image for safe-zone framing (reference only).
- `scripts/character-new/prompts/styles/tropitoon.md` - Glossy high-saturation mascot cartoon style.
- `scripts/character-new/prompts/styles/brainrot-kid.md` - Bright playful hybrid-mascot brainrot style.
- `scripts/character-new/prompts/styles/brainrot-detailed.md` - Balanced mature hybrid brainrot style.
- `scripts/character-new/prompts/styles/brainrot-adult.md` - Mature editorial hybrid brainrot style.
- `scripts/character-new/prompts/styles/brainrot-cartoon.md` - Mid-cartoon hybrid brainrot style.
- `scripts/character-new/prompts/styles/brainrot-cartoon-adult.md` - Playful cartoon-adult hybrid brainrot style.

## Brainrot Examples

Kid variation:

```bash
npm run character:new -- \
  --prompt "macbook and banana" \
  --style-file scripts/character-new/prompts/styles/brainrot-kid.md
```

Detailed variation:

```bash
npm run character:new -- \
  --prompt "macbook and banana" \
  --style-file scripts/character-new/prompts/styles/brainrot-detailed.md
```

Adult variation:

```bash
npm run character:new -- \
  --prompt "macbook and banana" \
  --style-file scripts/character-new/prompts/styles/brainrot-adult.md
```

Cartoon variation:

```bash
npm run character:new -- \
  --prompt "macbook and banana" \
  --style-file scripts/character-new/prompts/styles/brainrot-cartoon.md
```

Cartoon-adult variation:

```bash
npm run character:new -- \
  --prompt "macbook and banana" \
  --style-file scripts/character-new/prompts/styles/brainrot-cartoon-adult.md
```

## Full Params

```bash
npm run character:new -- \
  --mode generate \
  --prompt "friendly astronaut fox in mechanic overalls" \
  --output /path/to/output.png \
  --auth-path /path/to/auth.json \
  --prompt-file /path/to/character-9x16.md \
  --source-image /path/to/reference-image.png \
  --guide-image /path/to/safezone-template-9x16.png \
  --style-file /path/to/style.md \
  --model gpt-5.4 \
  --quality high \
  --include-cost=true \
  --include-report=true
```

## Safe-Zone Guide Usage

Use the guide template as an input reference so composition stays inside short-form safe zones:

```bash
npm run character:new -- \
  --prompt "adult female character: camera and cheetah hybrid, full-body in a fashion editorial set, compact silhouette" \
  --style-file scripts/character-new/prompts/styles/brainrot-adult.md \
  --guide-image scripts/character-new/prompts/safezone-template-9x16.png \
  --output tmp/character-new-brainrot-adult-v3-safezone/woman-4-camera-cheetah.png
```

The guide image is reference-only and should never appear in the final output.

## Brainrot Generation Commands (Exact)

```bash
npm run character:new -- --prompt "macbook and banana, full-body character in a neon laundromat at midnight" --style-file scripts/character-new/prompts/styles/brainrot-kid.md --output tmp/character-new/brainrot-1-macbook-banana.png
npm run character:new -- --prompt "vintage microphone and jellyfish, full-body character on a backstage jazz club set with velvet curtains" --style-file scripts/character-new/prompts/styles/brainrot-kid.md --output tmp/character-new/brainrot-2-microphone-jellyfish.png
npm run character:new -- --prompt "espresso machine and hummingbird, full-body character on a rain-soaked city balcony at dawn" --style-file scripts/character-new/prompts/styles/brainrot-kid.md --output tmp/character-new/brainrot-3-espresso-hummingbird.png
npm run character:new -- --prompt "skateboard and crocodile, full-body character in a rooftop greenhouse with string lights" --style-file scripts/character-new/prompts/styles/brainrot-kid.md --output tmp/character-new/brainrot-4-skateboard-crocodile.png
npm run character:new -- --prompt "camping lantern and red panda, full-body character on a misty train-station platform at sunrise" --style-file scripts/character-new/prompts/styles/brainrot-kid.md --output tmp/character-new/brainrot-5-lantern-redpanda.png
```

## Notes

- Default auth path: `~/.codex/auth.json`.
- Modes: `generate` (default) and `redraw` (requires `--source-image`).
- Default style preset: `tropitoon`.
- Default prompt template path: `generate` -> `scripts/character-new/prompts/character-9x16.md`, `redraw` -> `scripts/character-new/prompts/redraw-9x16.md`.
- Quality defaults: `generate` -> `medium`, `redraw` -> `high`.
- Prompts are stored in `scripts/character-new/prompts/*`.
- Optional guide image input: `--guide-image`.
- By default, writes a sidecar JSON report with timing and cost (if available).
- Disable cost fields: `--no-cost`.
- Disable JSON report creation: `--no-report`.
