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

async function main(): Promise<void> {
  const startedAtMs = Date.now();
  const startedAtIso = new Date(startedAtMs).toISOString();
  const projectRoot = path.resolve(process.cwd());
  const options = parseCliArgs(process.argv.slice(2), projectRoot);

  await assertFileExists(options.authPath);
  await assertFileExists(options.promptFilePath);
  await assertFileExists(options.styleFilePath);
  if (options.guideImagePath) {
    await assertFileExists(options.guideImagePath);
  }

  const [promptTemplate, styleRaw, auth, guideImageDataUrl] = await Promise.all([
    readTextFile(options.promptFilePath),
    readTextFile(options.styleFilePath),
    readCodexAuth(options.authPath),
    options.guideImagePath ? readImageFileAsDataUrl(options.guideImagePath) : Promise.resolve(undefined),
  ]);

  const stylePreset = parseStylePreset(styleRaw);
  const finalPrompt = renderPromptTemplate(promptTemplate, stylePreset, options.prompt);

  const outputPath = options.outputPath || defaultOutputPath(projectRoot, options.prompt);
  const reportPath = sidecarJsonPath(outputPath);

  console.log(`Generating character with model: ${options.model}`);
  console.log(`Style preset: ${stylePreset.name}`);
  if (options.guideImagePath) {
    console.log(`Guide image: ${options.guideImagePath}`);
  }

  const result = await generateCharacterImage(auth, options.model, finalPrompt, guideImageDataUrl);
  const imageBytes = Buffer.from(result.imageBase64, 'base64');
  await writeBinaryFile(outputPath, imageBytes);

  const finishedAtMs = Date.now();
  const finishedAtIso = new Date(finishedAtMs).toISOString();
  const durationMs = finishedAtMs - startedAtMs;
  const durationSec = Number((durationMs / 1000).toFixed(3));

  if (options.includeReport) {
    await writeJsonFile(reportPath, {
      model: options.model,
      style: {
        name: stylePreset.name,
        filePath: options.styleFilePath,
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
