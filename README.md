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

Generate or redraw one 9:16 styled character image using Codex subscription image generation.
Path: `scripts/character-new/index.ts`

#### Style Showcase

##### `brainrot-kid`

| 1 | 2 | 3 |
|---|---|---|
| <img src="assets/character-new-showcase/brainrot-kid/1-banana-rocketboots-male.jpg" alt="brainrot-kid-1" height="380" /> | <img src="assets/character-new-showcase/brainrot-kid/2-cupcake-bunny-female.jpg" alt="brainrot-kid-2" height="380" /> | <img src="assets/character-new-showcase/brainrot-kid/3-cactus-guitar-male.jpg" alt="brainrot-kid-3" height="380" /> |
| <details><summary>Prompt</summary><code>male character: banana and rocket boots hybrid, full-body in a playful science classroom with chalkboard, planet model, and desks</code></details> | <details><summary>Prompt</summary><code>female character: cupcake and bunny hybrid, full-body in a candy bakery with display case, mixers, and ingredient jars</code></details> | <details><summary>Prompt</summary><code>male character: cactus and guitar hybrid, full-body in a colorful music room with amplifiers, rugs, and wall posters</code></details> |

##### `tropitoon`

| 1 | 2 | 3 |
|---|---|---|
| <img src="assets/character-new-showcase/tropitoon/1-astronaut-fox-male.jpg" alt="tropitoon-1" height="380" /> | <img src="assets/character-new-showcase/tropitoon/2-panda-dj-female.jpg" alt="tropitoon-2" height="380" /> | <img src="assets/character-new-showcase/tropitoon/3-robotbarista-penguin-male.jpg" alt="tropitoon-3" height="380" /> |
| <details><summary>Prompt</summary><code>male character: astronaut fox hybrid, full-body in a futuristic hangar with control panels, cargo crates, and light strips</code></details> | <details><summary>Prompt</summary><code>female character: panda DJ hybrid, full-body on a rooftop party setup with DJ decks, speakers, and neon tubes</code></details> | <details><summary>Prompt</summary><code>male character: robot barista penguin hybrid, full-body in a cozy cafe with counter, shelves, and indoor plants</code></details> |

##### `brainrot-cartoon`

| 1 | 2 | 3 |
|---|---|---|
| <img src="assets/character-new-showcase/brainrot-cartoon/1-skate-crocodile-male.jpg" alt="brainrot-cartoon-1" height="380" /> | <img src="assets/character-new-showcase/brainrot-cartoon/2-camera-fox-female.jpg" alt="brainrot-cartoon-2" height="380" /> | <img src="assets/character-new-showcase/brainrot-cartoon/3-espresso-hummingbird-male.jpg" alt="brainrot-cartoon-3" height="380" /> |
| <details><summary>Prompt</summary><code>male character: skateboard and crocodile hybrid, full-body in a rooftop garden with benches, planters, and string lights</code></details> | <details><summary>Prompt</summary><code>female character: camera and fox hybrid, full-body in a city photo studio with softboxes, tripods, and prop shelves</code></details> | <details><summary>Prompt</summary><code>male character: espresso machine and hummingbird hybrid, full-body behind a cafe bar with cups, bean jars, and menu boards</code></details> |

##### `brainrot-adult`

| 1 | 2 | 3 |
|---|---|---|
| <img src="assets/character-new-showcase/brainrot-adult/1-watch-wolf-female.jpg" alt="brainrot-adult-1" height="380" /> | <img src="assets/character-new-showcase/brainrot-adult/2-violin-flamingo-female.jpg" alt="brainrot-adult-2" height="380" /> | <img src="assets/character-new-showcase/brainrot-adult/3-atomizer-cheetah-female.jpg" alt="brainrot-adult-3" height="380" /> |
| <details><summary>Prompt</summary><code>adult female character: pocket watch and arctic wolf hybrid, full-body in a luxury observatory lounge with brass telescope, bookshelves, and hanging lamps</code></details> | <details><summary>Prompt</summary><code>adult female character: violin and flamingo hybrid, full-body in a modern art museum hall with sculptures, benches, and skylights</code></details> | <details><summary>Prompt</summary><code>adult female character: perfume atomizer and cheetah hybrid, full-body in a high-end boutique interior with display tables, mirrors, and pendant lights</code></details> |

##### `brainrot-cartoon-adult`

| 1 | 2 | 3 |
|---|---|---|
| <img src="assets/character-new-showcase/brainrot-cartoon-adult/1-gramophone-swan-female.jpg" alt="brainrot-cartoon-adult-1" height="380" /> | <img src="assets/character-new-showcase/brainrot-cartoon-adult/2-typewriter-raven-male.jpg" alt="brainrot-cartoon-adult-2" height="380" /> | <img src="assets/character-new-showcase/brainrot-cartoon-adult/3-synth-butterfly-female.jpg" alt="brainrot-cartoon-adult-3" height="380" /> |
| <details><summary>Prompt</summary><code>female character: gramophone and swan hybrid, full-body on a jazz club stage with piano, drum set, and spotlight rig</code></details> | <details><summary>Prompt</summary><code>male character: typewriter and raven hybrid, full-body in a vintage newsroom with desks, desk lamps, and paper stacks</code></details> | <details><summary>Prompt</summary><code>female character: analog synthesizer and butterfly hybrid, full-body in a neon music lab with speakers, rack gear, and LED tubes</code></details> |

##### `brainrot-detailed`

| 1 | 2 | 3 |
|---|---|---|
| <img src="assets/character-new-showcase/brainrot-detailed/1-astrolabe-tiger-male.jpg" alt="brainrot-detailed-1" height="380" /> | <img src="assets/character-new-showcase/brainrot-detailed/2-pen-peacock-female.jpg" alt="brainrot-detailed-2" height="380" /> | <img src="assets/character-new-showcase/brainrot-detailed/3-camera-wolf-male.jpg" alt="brainrot-detailed-3" height="380" /> |
| <details><summary>Prompt</summary><code>male character: astrolabe and tiger hybrid, full-body in a library observatory with globe, ladder shelves, and arched windows</code></details> | <details><summary>Prompt</summary><code>female character: fountain pen and peacock hybrid, full-body in an artist atelier with easels, paint jars, and canvases</code></details> | <details><summary>Prompt</summary><code>male character: camera and wolf hybrid, full-body in a mountain lodge studio with wooden beams, lanterns, and map wall</code></details> |

#### Redraw Clones

| Tralalero_Tralala.webp | images.jpeg | Chimpanzini_Bananino.png |
|---|---|---|
| <img src="assets/character-new-redraw/clone-tralalero-tralala.png" alt="clone-tralalero-tralala" height="380" /> | <img src="assets/character-new-redraw/clone-images-jpeg.png" alt="clone-images-jpeg" height="380" /> | <img src="assets/character-new-redraw/clone-chimpanzini-bananino.png" alt="clone-chimpanzini-bananino" height="380" /> |
| <details><summary>Prompt</summary><code>same character style and identity, full-body centered, cinematic boardwalk at blue hour with neon kiosks, reflections on wet floor, and distant carnival lights</code></details> | <details><summary>Prompt</summary><code>same character style and identity, full-body centered, premium studio stage with rim lights, reflective floor, and soft volumetric haze</code></details> | <details><summary>Prompt</summary><code>same character style and identity, full-body centered, vibrant urban plaza with street murals, decorative lamps, and evening bokeh</code></details> |
