# YumCut Characters

YumCut Characters is a project for generating animated character videos from user requests by combining different AI tools across scripting, visuals, voice, and production flow automation, with modular scripts and secure environment-based configuration for reliable integration with YumCut workflows.

[YumCut GitHub](https://github.com/IgorShadurin/app.yumcut.com)
Main open-source app repo: prompt-to-video pipeline for Shorts/Reels/TikTok with scripts, scenes, voiceover, subtitles, and rendering workflows.

[YumCut](https://yumcut.com/?utm_source=yumcut_characters_readme)
Official YumCut website and product landing page for creating viral short-form clips fast.

## Tools

### [lipsync:runware]((scripts/lipsync-runware/README.md))

Runware lip-sync generation from reference video and audio.
Path: `scripts/lipsync-runware/index.ts`

### [lipsync:vmodel]((scripts/lipsync-vmodel/README.md))

VModel talking-photo lip-sync generation from image and audio.
Path: `scripts/lipsync-vmodel/index.ts`

### [character:new]((scripts/character-new/README.md))

Generate one 9:16 styled character image from a text prompt using Codex subscription image generation.
Path: `scripts/character-new/index.ts`
