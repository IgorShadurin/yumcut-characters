# lipsync:replicate

Create a lip-sync video on Replicate from a reference image and audio file.

Supported hardcoded models (image + audio -> video):
- `bytedance/omni-human`
- `bytedance/omni-human-1.5`
- `kwaivgi/kling-avatar-v2`
- `prunaai/p-video-avatar`

## Example

```bash
npm run lipsync:replicate -- /path/to/reference-image.png --audio /path/to/audio.wav
```

## Full Params

```bash
npm run lipsync:replicate -- \
  --image /path/to/reference-image.png \
  --audio /path/to/audio.wav \
  --output /path/to/output.mp4 \
  --model kwaivgi/kling-avatar-v2 \
  --prompt "Emotion: happy, friendly, and confident." \
  --prompt-file /path/to/performance-default.md \
  --include-cost=true \
  --include-report=true \
  --poll-interval-ms=5000 \
  --timeout-ms=900000
```

## Model Notes

- `--model` default: `bytedance/omni-human`.
- `bytedance/omni-human` ignores prompt fields.
- `bytedance/omni-human-1.5` and `kwaivgi/kling-avatar-v2` send prompt via `prompt`.
- `prunaai/p-video-avatar` sends prompt via `video_prompt`.

## Notes

- Requires `REPLICATE_API_TOKEN` in `.env`.
- Default prompt template path: `scripts/lipsync-replicate/prompts/performance-default.md`.
- By default, creates a sidecar JSON report with model price estimate (if available) and execution time.
- Sidecar path format: `tmp/lipsync-replicate/avatar-lipsync.json`.
- Disable cost fields: `--no-cost`.
- Disable JSON report creation: `--no-report`.
