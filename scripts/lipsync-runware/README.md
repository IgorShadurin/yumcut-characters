# lipsync:runware

Create a lip-synced video with Runware from a reference video and an audio file.

Supported hardcoded models:
- `pixverse:lipsync@1`
- `klingai:7@1`

## Example

```bash
npm run lipsync:runware -- /path/to/reference-video.mp4 --audio /path/to/audio.wav --model pixverse:lipsync@1
```

## Full Params

```bash
npm run lipsync:runware -- \
  --video /path/to/reference-video.mp4 \
  --audio /path/to/audio.wav \
  --output /path/to/output.mp4 \
  --model klingai:7@1 \
  --include-cost=true \
  --include-report=true \
  --poll-interval-ms=5000 \
  --timeout-ms=600000
```

## Model Notes

- `--model` is required.
- Supported hardcoded models:
  - `pixverse:lipsync@1`
  - `klingai:7@1`
- Model request mapping:
  - `pixverse:lipsync@1` -> `referenceVideos` + `inputAudios`
  - `klingai:7@1` -> `inputs.video` + `inputs.audio`
- `klingai:7@1` does not extend output duration to full audio length; it keeps the input video timing window.
- `klingai:7@1` output quality/motion is usually less smooth than `pixverse:lipsync@1` (still usable for many cases).

## Notes

- Requires `RUNWARE_API_KEY` in `.env`.
- By default, creates a sidecar JSON report with task info, generation price (if available), and execution time.
- Sidecar path format: `tmp/lipsync-runware/video-3-lipsync.json`.
- Disable cost field request: `--no-cost`.
- Disable JSON report creation: `--no-report`.

## Pricing Comparison (30s / 60s)

| Model | Model ID | Pricing Basis | 30s | 60s |
|---|---|---:|---:|---:|
| [KlingAI Lip-Sync](https://runware.ai/models/klingai-lip-sync) | [`klingai:7@1`](https://runware.ai/docs/models/klingai-lip-sync) | tiered: $0.0462 (1-5s), $0.0924 (6-10s), then +$0.0092/sec | $0.2764 | $0.5524 |
| [PixVerse LipSync](https://runware.ai/models/pixverse-lipsync) | [`pixverse:lipsync@1`](https://runware.ai/docs/models/pixverse-lipsync) | $0.0136/sec | $0.4080 | $0.8160 |
| [P-Video-Avatar (720p)](https://runware.ai/models/prunaai-p-video-avatar) | [`prunaai:p-video@avatar`](https://runware.ai/models/prunaai-p-video-avatar) | $0.0250/sec (1s shown) | $0.7500 | $1.5000 |
| [lipsync-2](https://runware.ai/models/sync-lipsync-2) | [`sync:lipsync-2@1`](https://runware.ai/docs/models/sync-lipsync-2) | $0.0440/sec | $1.3200 | $2.6400 |
| [KlingAI Avatar 2.0 Standard](https://runware.ai/models/klingai-avatar-2-0-standard) | [Kling Avatar Standard page](https://runware.ai/models/klingai-avatar-2-0-standard) | $0.0440/sec | $1.3200 | $2.6400 |
| [P-Video-Avatar (1080p)](https://runware.ai/models/prunaai-p-video-avatar) | [`prunaai:p-video@avatar`](https://runware.ai/models/prunaai-p-video-avatar) | $0.0450/sec (1s shown) | $1.3500 | $2.7000 |
| [lipsync-2-pro](https://runware.ai/models/sync-lipsync-2-pro) | [`sync:lipsync-2-pro@1`](https://runware.ai/docs/en/providers/sync) | $0.0733/sec | $2.1990 | $4.3980 |
| [KlingAI Avatar 2.0 Pro](https://runware.ai/models/klingai-avatar-2-0-pro) | [`klingai:avatar@2.0-pro`](https://runware.ai/docs/models/klingai-avatar-2-0-pro) | $0.0870/sec | $2.6100 | $5.2200 |
| [sync-3](https://runware.ai/models/sync-3) | [`sync:3@0`](https://runware.ai/models/sync-3) | $0.1330/sec | $3.9900 | $7.9800 |
| [react-1 (includes lip-sync region)](https://runware.ai/models/sync-react-1) | [`sync:react-1@1`](https://runware.ai/docs/models/sync-react-1) | $0.1467/sec | $4.4010 | $8.8020 |

## Photo + Audio Avatar Models

Models below are focused on generating talking video from a reference photo/image and audio, sorted by lower estimated 30s cost first.

| Model | AIR ID | Photo + Audio Fit | 30s (est.) | 60s (est.) | Duration Notes |
|---|---|---|---:|---:|---|
| [P-Video](https://runware.ai/models/prunaai-p-video) | `prunaai:p-video@0` | Image-to-video with audio input support | $0.60 | $1.20 | Docs: `inputs.image` + `inputs.audio`; `duration` max is 10s per clip. |
| [Seedance 1.5 Pro](https://runware.ai/models/bytedance-seedance-1-5-pro) | `bytedance:seedance@1.5-pro` | Native synchronized audio video from image/text | $0.72 | $1.44 | Pricing shown at `480p · 5s · audio = $0.12`; short-form clip workflow. |
| [Aurora v1 Fast](https://runware.ai/models/creatify-aurora-v1-fast) | `creatify:aurora@fast` | Talking-head from single image + audio | $2.10 | $4.20 | Price shown as `480p · 1s = $0.07`; explicit max duration not shown in fetched docs snippets. |
| [OmniHuman-1](https://runware.ai/models/bytedance-omnihuman-1) | `bytedance:5@1` | Talking human video from single image + audio | $2.904 | $5.808 | Provider docs: audio input max 30s (15s recommended). |
| [HeyGen Avatar IV](https://runware.ai/models/heygen-avatar-iv) | `heygen:avatar@4` | Talking avatar from single photo + script/audio | $3.00 | $6.00 | Price shown as `1s = $0.10`; explicit max duration not shown in fetched docs snippets. |
| [OmniHuman-1.5](https://runware.ai/models/bytedance-omnihuman-1-5) | `bytedance:5@2` | Avatar video from single image + audio (+ optional text) | $3.9741 | $7.9482 | Provider docs: audio input max 30s (15s recommended). |
| [Aurora v1](https://runware.ai/models/creatify-aurora-v1) | `creatify:aurora@0` | Talking-head from single image + audio | $4.20 | $8.40 | Price shown as `720p · 1s = $0.14`; explicit max duration not shown in fetched docs snippets. |
