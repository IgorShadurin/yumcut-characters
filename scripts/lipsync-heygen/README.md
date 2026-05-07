# lipsync:heygen

Create an Avatar IV talking video with HeyGen from a reference image and your own audio, with text fallback mode.

## Example

```bash
npm run lipsync:heygen -- \
  --image /path/to/reference-image.png \
  --audio /path/to/audio.wav
```

## Full Params

```bash
npm run lipsync:heygen -- \
  --image /path/to/reference-image.png \
  --audio /path/to/audio.wav \
  --output /path/to/output.mp4 \
  --prompt "Emotion: neutral, calm and controlled delivery." \
  --prompt-file /path/to/performance-default.md \
  --script "Fallback text when no audio is provided." \
  --script-file /path/to/script-default.md \
  --voice-id <heygen_voice_id> \
  --include-cost=true \
  --include-report=true \
  --poll-interval-ms=5000 \
  --timeout-ms=600000
```

## Notes

- Provider: HeyGen Avatar IV API.
- Uses `POST /v2/videos` and polling via `GET /v2/videos/{video_id}`.
- Own audio mode uses uploaded `audio_url` + `image_url`.
- Cartoon-character reference images are often rejected with `No face detected`; this API works best with clear human-face photos.
- If no `--audio` is provided, script uses text mode and a `voice_id` (auto-picked from `GET /v2/voices` if not passed).
- Requires `HEYGEN_API_KEY` in `.env`.
- By default, writes a JSON report with generation details, price field (if available), and execution time.
- Report path format: `tmp/lipsync-heygen/avatar-heygen.json`.
- Disable price fields: `--no-cost`.
- Disable JSON report: `--no-report`.
