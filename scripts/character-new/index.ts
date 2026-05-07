import path from 'node:path';

import { readCodexAuth } from './helpers/auth';
import { parseCliArgs } from './helpers/cli';
import { generateCharacterImage } from './helpers/codex-image';
import {
  assertFileExists,
  defaultOutputPath,
  readImageFileAsDataUrl,
  readTextFile,
  sidecarJsonPath,
  writeBinaryFile,
  writeJsonFile,
} from './helpers/files';
import { parseStylePreset, renderPromptTemplate } from './helpers/prompt';

function renderRedrawPrompt(template: string, userPrompt: string): string {
  return template.replaceAll('{{USER_PROMPT}}', userPrompt.trim());
}

async function main(): Promise<void> {
  const startedAtMs = Date.now();
  const startedAtIso = new Date(startedAtMs).toISOString();
  const projectRoot = path.resolve(process.cwd());
  const options = parseCliArgs(process.argv.slice(2), projectRoot);

  await assertFileExists(options.authPath);
  await assertFileExists(options.promptFilePath);
  if (options.mode === 'generate') {
    await assertFileExists(options.styleFilePath);
  }
  if (options.sourceImagePath) {
    await assertFileExists(options.sourceImagePath);
  }
  if (options.guideImagePath) {
    await assertFileExists(options.guideImagePath);
  }

  const [promptTemplate, styleRaw, auth, sourceImageDataUrl, guideImageDataUrl] = await Promise.all([
    readTextFile(options.promptFilePath),
    options.mode === 'generate' ? readTextFile(options.styleFilePath) : Promise.resolve(''),
    readCodexAuth(options.authPath),
    options.sourceImagePath ? readImageFileAsDataUrl(options.sourceImagePath) : Promise.resolve(undefined),
    options.guideImagePath ? readImageFileAsDataUrl(options.guideImagePath) : Promise.resolve(undefined),
  ]);

  const stylePreset =
    options.mode === 'generate'
      ? parseStylePreset(styleRaw)
      : {
          name: 'source-style',
          description: 'derived from --source-image',
        };
  const finalPrompt =
    options.mode === 'generate'
      ? renderPromptTemplate(promptTemplate, stylePreset, options.prompt)
      : renderRedrawPrompt(promptTemplate, options.prompt);

  const outputPath = options.outputPath || defaultOutputPath(projectRoot, options.prompt);
  const reportPath = sidecarJsonPath(outputPath);

  console.log(`Generating character (${options.mode}) with model: ${options.model}`);
  console.log(`Quality: ${options.quality}`);
  if (options.mode === 'generate') {
    console.log(`Style preset: ${stylePreset.name}`);
  }
  if (options.sourceImagePath) {
    console.log(`Source image: ${options.sourceImagePath}`);
  }
  if (options.guideImagePath) {
    console.log(`Guide image: ${options.guideImagePath}`);
  }

  const result = await generateCharacterImage(auth, options.model, {
    mode: options.mode,
    quality: options.quality,
    prompt: finalPrompt,
    sourceImageDataUrl,
    guideImageDataUrl,
  });
  const imageBytes = Buffer.from(result.imageBase64, 'base64');
  await writeBinaryFile(outputPath, imageBytes);

  const finishedAtMs = Date.now();
  const finishedAtIso = new Date(finishedAtMs).toISOString();
  const durationMs = finishedAtMs - startedAtMs;
  const durationSec = Number((durationMs / 1000).toFixed(3));

  if (options.includeReport) {
    await writeJsonFile(reportPath, {
      mode: options.mode,
      model: options.model,
      quality: options.quality,
      style: {
        name: stylePreset.name,
        filePath: options.mode === 'generate' ? options.styleFilePath : null,
      },
      includeCostRequested: options.includeCost,
      generation: {
        outputPath,
        revisedPrompt: result.revisedPrompt,
        costUsd: options.includeCost ? result.costUsd : null,
      },
      prompt: {
        input: options.prompt,
        templatePath: options.promptFilePath,
        sourceImagePath: options.sourceImagePath || null,
        guideImagePath: options.guideImagePath || null,
      },
      auth: {
        authPath: options.authPath,
      },
      timing: {
        startedAt: startedAtIso,
        finishedAt: finishedAtIso,
        durationMs,
        durationSec,
      },
    });
  }

  console.log(`Saved image: ${outputPath}`);
  if (options.includeReport) {
    console.log(`Saved report: ${reportPath}`);
  }
  if (options.includeCost && typeof result.costUsd === 'number') {
    console.log(`Generation cost (USD): ${result.costUsd}`);
  }
  console.log(`Execution time: ${durationSec}s`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`character:new failed: ${message}`);
  process.exit(1);
});
