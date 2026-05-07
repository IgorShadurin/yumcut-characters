import path from 'node:path';

import { parseCliArgs } from './helpers/cli';
import { readTogetherApiKey } from './helpers/env';
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
import { createTogetherVideoTask, waitForTogetherVideo } from './helpers/together';

async function main(): Promise<void> {
  const scriptStartedAtMs = Date.now();
  const scriptStartedAtIso = new Date(scriptStartedAtMs).toISOString();
  const projectRoot = path.resolve(process.cwd());
  const options = parseCliArgs(process.argv.slice(2), projectRoot);

  await assertFileExists(options.imagePath);
  await assertFileExists(options.audioPath);
  await assertFileExists(options.promptFilePath);

  const outputPath = options.outputPath || defaultOutputPath(projectRoot, options.imagePath);

  const [imageDataUri, audioDataUri, promptTemplate] = await Promise.all([
    fileToDataUri(options.imagePath),
    fileToDataUri(options.audioPath),
    readTextFile(options.promptFilePath),
  ]);

  const apiKey = readTogetherApiKey();
  const prompt = renderLipsyncPrompt(promptTemplate, options.additionalPrompt);
  options.prompt = prompt;

  console.log(`Submitting Together AI video task with model: ${options.model}`);
  console.log(`Prompt file: ${options.promptFilePath}`);
  if (options.additionalPrompt) {
    console.log(`Additional prompt: ${options.additionalPrompt}`);
  }

  const created = await createTogetherVideoTask(apiKey, options, imageDataUri, audioDataUri);
  if (!created.id) {
    throw new Error('Together create response did not include task id.');
  }

  console.log(`Task created: ${created.id}`);

  const result = await waitForTogetherVideo(apiKey, created.id, options);
  if (!result.outputs?.video_url) {
    throw new Error(`Together task completed without output video URL for task ${created.id}.`);
  }

  console.log(`Task completed: ${result.id}`);
  console.log(`Downloading result from: ${result.outputs.video_url}`);

  await downloadToFile(result.outputs.video_url, outputPath, apiKey);

  const scriptFinishedAtMs = Date.now();
  const scriptFinishedAtIso = new Date(scriptFinishedAtMs).toISOString();
  const durationMs = scriptFinishedAtMs - scriptStartedAtMs;
  const durationSec = Number((durationMs / 1000).toFixed(3));
  const reportPath = sidecarJsonPath(outputPath);

  if (options.includeReport) {
    await writeJsonFile(reportPath, {
      model: options.model,
      includeCostRequested: options.includeCost,
      together: {
        taskId: result.id,
        status: result.status,
        outputUrl: result.outputs.video_url,
        costUsd: options.includeCost ? result.outputs.cost ?? null : null,
      },
      input: {
        imagePath: options.imagePath,
        audioPath: options.audioPath,
        promptFilePath: options.promptFilePath,
        additionalPrompt: options.additionalPrompt || null,
        prompt,
        seconds: options.seconds,
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
  if (options.includeCost && typeof result.outputs.cost === 'number') {
    console.log(`Together AI cost (USD): ${result.outputs.cost}`);
  }
  console.log(`Execution time: ${durationSec}s`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`lipsync:togetherai failed: ${message}`);
  process.exit(1);
});
