# lipsync:vmodel

Create a lip-synced video with VModel from a reference image and audio file.

Supported hardcoded models:
- ✅ `vmodel/talking-photo-turbo-pro`
- `vmodel/talking-photo-turbo`
- `lipsync/talk-photo`

Current status for your provided content:
- `vmodel/talking-photo-turbo` fails with `faceTalking.Avatar.Failed` (model backend rejected source material during avatar synthesis).
- `lipsync/talk-photo` fails with `faceTalking.Avatar.Failed` (model backend rejected source material during avatar synthesis).

## Example

```bash
npm run lipsync:vmodel -- /path/to/avatar.png --audio /path/to/audio.wav
```

## Full Params

```bash
npm run lipsync:vmodel -- \
  --image /path/to/avatar.png \
  --audio /path/to/audio.wav \
  --output /path/to/output.mp4 \
  --model vmodel/talking-photo-turbo-pro \
  --resolution 720 \
  --include-cost=true \
  --include-report=true \
  --poll-interval-ms=5000 \
  --timeout-ms=600000
```

## Model Notes

- `--model` default: `vmodel/talking-photo-turbo-pro`.
- `--resolution` default: `720`.
- Supported `--resolution` values: `480`, `720`.
- `vmodel/talking-photo-turbo-pro` supports `resolution`.
- `vmodel/talking-photo-turbo` and `lipsync/talk-photo` ignore `--resolution` (no model-side resolution parameter).
- This model supports up to ~40s input audio.

## VModel Pricing Comparison (30s / 60s)

| Platform | Model | Model ID | USD Pricing Basis | 30s (USD) | 60s (USD) | Notes |
|---|---|---|---:|---:|---:|---|
| [VModel](https://vmodel.ai/models/) | [Talk Photo](https://vmodel.ai/models/lipsync/talk-photo/) | `lipsync/talk-photo` | $0.002/sec | $0.06 | $0.12 | Bad. |
| [VModel](https://vmodel.ai/models/) | [Talking Photo Turbo](https://vmodel.ai/models/vmodel/talking-photo-turbo/) | `vmodel/talking-photo-turbo` | $0.002/sec | $0.06 | $0.12 | Bad, static final image. |
| [VModel](https://vmodel.ai/models/) | [Talk Photo Pro](https://vmodel.ai/models/lipsync/talk-photo-pro/) | `lipsync/talk-photo-pro` | $0.012/sec | $0.36 | $0.72 | Good but pretty expensive. |
| [VModel](https://vmodel.ai/models/) | [Talking Photo Turbo Pro](https://vmodel.ai/models/vmodel/talking-photo-turbo-pro/) | `vmodel/talking-photo-turbo-pro` | $0.012/sec | $0.36 | $0.72 | Good but pretty expensive. |
| [VModel](https://vmodel.ai/models/) | [Talking Photo Sonic](https://vmodel.ai/models/vmodel/talking-photo-sonic/) | `vmodel/talking-photo-sonic` | $0.3/sec | $9.00 | $18.00 | Photo + audio talking-face animation (Sonic model). |

## Notes

- Requires `VMODEL_API_KEY` in `.env`.
- VModel task API requires HTTP URLs for files, so this script uploads local input files to temporary public URLs via `tmpfiles.org` before generation.
- By default, creates a sidecar JSON report with task info, price data (if enabled), and execution time.
- Sidecar path format: `tmp/lipsync-vmodel/avatar-lipsync.json`.
- Disable cost fields: `--no-cost`.
- Disable JSON report creation: `--no-report`.
- `vmodel/talking-photo-turbo`: bad, static final image.
- `lipsync/talk-photo`: bad.
- `lipsync/talk-photo-pro` and `vmodel/talking-photo-turbo-pro`: good but pretty expensive.
