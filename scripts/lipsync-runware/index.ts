import path from 'node:path';

import { parseCliArgs } from './helpers/cli';
import { readRunwareApiKey } from './helpers/env';
import {
  assertFileExists,
  defaultOutputPath,
  downloadToFile,
  fileToDataUri,
  readTextFile,
  sidecarJsonPath,
  writeJsonFile,
} from './helpers/files';
import { renderLipsyncPrompt } from './helpers/prompt';
import { generateLipsyncVideo } from './helpers/runware';

async function main(): Promise<void> {
  const scriptStartedAtMs = Date.now();
  const scriptStartedAtIso = new Date(scriptStartedAtMs).toISOString();
  const projectRoot = path.resolve(process.cwd());
  const options = parseCliArgs(process.argv.slice(2), projectRoot);

  if (options.videoPath) {
    await assertFileExists(options.videoPath);
  }
  if (options.imagePath) {
    await assertFileExists(options.imagePath);
  }
  await assertFileExists(options.audioPath);
  await assertFileExists(options.promptFilePath);
  const outputPath = options.outputPath || defaultOutputPath(projectRoot);

  const [referenceVideoDataUri, referenceImageDataUri, audioDataUri, promptTemplate] = await Promise.all([
    options.videoPath ? fileToDataUri(options.videoPath) : Promise.resolve(undefined),
    options.imagePath ? fileToDataUri(options.imagePath) : Promise.resolve(undefined),
    fileToDataUri(options.audioPath),
    readTextFile(options.promptFilePath),
  ]);

  const apiKey = readRunwareApiKey();
  const prompt = renderLipsyncPrompt(promptTemplate, options.additionalPrompt);
  options.prompt = prompt;

  console.log(`Submitting Runware lip sync task with model: ${options.model}`);
  console.log(`Prompt file: ${options.promptFilePath}`);
  if (options.additionalPrompt) {
    console.log(`Additional prompt: ${options.additionalPrompt}`);
  }
  const result = await generateLipsyncVideo(apiKey, options, referenceVideoDataUri, referenceImageDataUri, audioDataUri);

  console.log(`Task completed: ${result.taskUUID}`);
  console.log(`Downloading result from: ${result.videoURL}`);

  await downloadToFile(result.videoURL, outputPath);

  const scriptFinishedAtMs = Date.now();
  const scriptFinishedAtIso = new Date(scriptFinishedAtMs).toISOString();
  const durationMs = scriptFinishedAtMs - scriptStartedAtMs;
  const durationSec = Number((durationMs / 1000).toFixed(3));
  const reportPath = sidecarJsonPath(outputPath);

  if (options.includeReport) {
    await writeJsonFile(reportPath, {
      model: options.model,
      includeCostRequested: options.includeCost,
      runware: {
        taskUUID: result.taskUUID,
        videoURL: result.videoURL,
        costUSD: typeof result.cost === 'number' ? result.cost : null,
      },
      input: {
        videoPath: options.videoPath || null,
        imagePath: options.imagePath || null,
        audioPath: options.audioPath,
        promptFilePath: options.promptFilePath,
        additionalPrompt: options.additionalPrompt || null,
        prompt,
      },
      output: {
        videoPath: outputPath,
        reportPath,
      },
      timing: {
        startedAt: scriptStartedAtIso,
        finishedAt: scriptFinishedAtIso,
        durationMs,
        durationSec,
      },
    });
  }

  console.log(`Saved output: ${outputPath}`);
  if (options.includeReport) {
    console.log(`Saved report: ${reportPath}`);
  }
  if (typeof result.cost === 'number') {
    console.log(`Runware cost (USD): ${result.cost}`);
  }
  console.log(`Execution time: ${durationSec}s`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`lipsync:runware failed: ${message}`);
  process.exit(1);
});
