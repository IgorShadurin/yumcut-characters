# lipsync:togetherai

Create a talking video with Together AI from a reference image and audio file.

Supported hardcoded models (image + audio -> video):
- `Wan-AI/wan2.7-i2v`
- `google/veo-3.0-audio`
- `google/veo-3.0-fast-audio`

## Example

```bash
npm run lipsync:togetherai -- /path/to/reference-image.png --audio /path/to/audio.wav --model Wan-AI/wan2.7-i2v
```

## Full Params

```bash
npm run lipsync:togetherai -- \
  --image /path/to/reference-image.png \
  --audio /path/to/audio.wav \
  --output /path/to/output.mp4 \
  --model google/veo-3.0-audio \
  --prompt "Emotion: neutral. Calm balanced expression, steady eye line, minimal facial change." \
  --prompt-file /path/to/performance-default.md \
  --seconds 6 \
  --include-cost=true \
  --include-report=true \
  --poll-interval-ms=5000 \
  --timeout-ms=900000
```

## Model Notes

- `--model` is required.
- `--seconds` supports: `4`, `6`, `8`.
- Uses Together `media.frame_images` + `media.audio_inputs` payload for image+audio video generation.

## Notes

- Requires `TOGETHER_API_KEY` in `.env`.
- Default prompt template path: `scripts/lipsync-togetherai/prompts/performance-default.md`.
- Add per-run direction (for example emotion): `--prompt "Emotion: happy..."`.
- By default, creates a sidecar JSON report with task info, generation price (if available), and execution time.
- Sidecar path format: `tmp/lipsync-togetherai/avatar-lipsync.json`.
- Disable cost fields: `--no-cost`.
- Disable JSON report creation: `--no-report`.
