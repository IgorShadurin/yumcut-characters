# lipsync:runware

Create a lip-synced video with Runware `pixverse:lipsync@1` from a reference video and an audio file.

## Required (shortest)

```bash
npm run lipsync:runware -- /path/to/reference-video.mp4 --audio /path/to/audio.wav
```

## Full Params

```bash
npm run lipsync:runware -- \
  --video /path/to/reference-video.mp4 \
  --audio /path/to/audio.wav \
  --output /path/to/output.mp4 \
  --model pixverse:lipsync@1 \
  --include-cost=true \
  --include-report=true \
  --poll-interval-ms=5000 \
  --timeout-ms=600000
```

## Notes

- Default model: `pixverse:lipsync@1`.
- Requires `RUNWARE_API_KEY` in `.env`.
- By default, creates a sidecar JSON report with task info, generation price (if available), and execution time.
- Sidecar path format: `tmp/lipsync-runware/video-3-lipsync.json`.
- Disable cost field request: `--no-cost`.
- Disable JSON report creation: `--no-report`.
