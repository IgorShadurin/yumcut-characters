import path from 'node:path';

import { parseCliArgs } from './helpers/cli';
import { readVmodelApiKey } from './helpers/env';
import {
  assertFileExists,
  defaultOutputPath,
  downloadToFile,
  sidecarJsonPath,
  writeJsonFile,
} from './helpers/files';
import { probeMediaDurationSec } from './helpers/media';
import { uploadToTmpfiles } from './helpers/upload';
import {
  createVmodelTask,
  creditsToUsd,
  VMODEL_MODELS,
  waitForVmodelTask,
} from './helpers/vmodel';

async function main(): Promise<void> {
  const scriptStartedAtMs = Date.now();
  const scriptStartedAtIso = new Date(scriptStartedAtMs).toISOString();
  const options = parseCliArgs(process.argv.slice(2));

  await assertFileExists(options.imagePath);
  await assertFileExists(options.audioPath);

  const projectRoot = path.resolve(process.cwd());
  const outputPath = options.outputPath || defaultOutputPath(projectRoot, options.imagePath);

  const apiKey = readVmodelApiKey();
  const modelConfig = VMODEL_MODELS[options.model];
  const audioDurationSec = await probeMediaDurationSec(options.audioPath);

  console.log('Uploading input files to temporary URLs...');
  const [avatarUrl, speechUrl] = await Promise.all([
    uploadToTmpfiles(options.imagePath),
    uploadToTmpfiles(options.audioPath),
  ]);

  console.log(`Submitting VModel lip sync task with model: ${options.model}`);
  if (modelConfig.supportsResolution) {
    console.log(`Using resolution: ${options.resolution}`);
  } else {
    console.log(`Model does not support resolution override. Ignoring requested resolution: ${options.resolution}`);
  }

  const createResult = await createVmodelTask(apiKey, options, avatarUrl, speechUrl);
  console.log(`Task created: ${createResult.taskId}`);

  const taskResult = await waitForVmodelTask(apiKey, createResult.taskId, options);
  console.log(`Task completed: ${taskResult.taskId}`);
  console.log(`Downloading result from: ${taskResult.outputUrl}`);

  await downloadToFile(taskResult.outputUrl as string, outputPath, apiKey);

  const scriptFinishedAtMs = Date.now();
  const scriptFinishedAtIso = new Date(scriptFinishedAtMs).toISOString();
  const durationMs = scriptFinishedAtMs - scriptStartedAtMs;
  const durationSec = Number((durationMs / 1000).toFixed(3));
  const reportPath = sidecarJsonPath(outputPath);

  const createTaskCostCredits = createResult.taskCostCredits;
  const createTaskCostUsd =
    typeof createTaskCostCredits === 'number' ? creditsToUsd(createTaskCostCredits) : undefined;

  const estimatedCostUsd =
    typeof audioDurationSec === 'number'
      ? Number(((modelConfig.taskCostPerSecondCredits[options.resolution] * audioDurationSec) / 100000).toFixed(6))
      : undefined;

  if (options.includeReport) {
    await writeJsonFile(reportPath, {
      model: options.model,
      version: modelConfig.version,
      resolution: options.resolution,
      resolutionApplied: modelConfig.supportsResolution ? options.resolution : null,
      includeCostRequested: options.includeCost,
      vmodel: {
        taskId: taskResult.taskId,
        status: taskResult.status,
        outputUrl: taskResult.outputUrl,
        taskCostCredits: options.includeCost ? createTaskCostCredits ?? null : null,
        taskCostUsd: options.includeCost ? createTaskCostUsd ?? null : null,
        estimatedCostUsd: options.includeCost ? estimatedCostUsd ?? null : null,
        predictTimeSec: taskResult.predictTimeSec ?? null,
        totalTimeSec: taskResult.totalTimeSec ?? null,
      },
      input: {
        imagePath: options.imagePath,
        audioPath: options.audioPath,
        audioDurationSec: audioDurationSec ?? null,
        uploadedAvatarUrl: avatarUrl,
        uploadedSpeechUrl: speechUrl,
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
  if (options.includeCost) {
    if (typeof createTaskCostUsd === 'number') {
      console.log(`VModel cost from task creation (USD): ${createTaskCostUsd}`);
    }
    if (typeof estimatedCostUsd === 'number') {
      console.log(`Estimated VModel cost from model pricing (USD): ${estimatedCostUsd}`);
    }
  }
  console.log(`Execution time: ${durationSec}s`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`lipsync:vmodel failed: ${message}`);
  process.exit(1);
});
