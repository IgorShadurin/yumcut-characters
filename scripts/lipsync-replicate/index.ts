import path from 'node:path';

import { parseCliArgs } from './helpers/cli';
import { readReplicateApiToken } from './helpers/env';
import {
  assertFileExists,
  defaultOutputPath,
  downloadToFile,
  fileToDataUri,
  readTextFile,
  sidecarJsonPath,
  writeJsonFile,
} from './helpers/files';
import { probeMediaDurationSec } from './helpers/media';
import { renderLipsyncPrompt } from './helpers/prompt';
import {
  createReplicatePrediction,
  estimateCostUsd,
  REPLICATE_MODELS,
  waitForReplicatePrediction,
} from './helpers/replicate';

async function main(): Promise<void> {
  const scriptStartedAtMs = Date.now();
  const scriptStartedAtIso = new Date(scriptStartedAtMs).toISOString();
  const projectRoot = path.resolve(process.cwd());
  const options = parseCliArgs(process.argv.slice(2), projectRoot);

  await assertFileExists(options.imagePath);
  await assertFileExists(options.audioPath);
  await assertFileExists(options.promptFilePath);

  const outputPath = options.outputPath || defaultOutputPath(projectRoot, options.imagePath);

  const [imageDataUri, audioDataUri, promptTemplate, audioDurationSec] = await Promise.all([
    fileToDataUri(options.imagePath),
    fileToDataUri(options.audioPath),
    readTextFile(options.promptFilePath),
    probeMediaDurationSec(options.audioPath),
  ]);

  const apiToken = readReplicateApiToken();
  const prompt = renderLipsyncPrompt(promptTemplate, options.additionalPrompt);
  options.prompt = prompt;

  console.log(`Submitting Replicate prediction with model: ${options.model}`);
  console.log(`Prompt file: ${options.promptFilePath}`);
  if (options.additionalPrompt) {
    console.log(`Additional prompt: ${options.additionalPrompt}`);
  }

  const created = await createReplicatePrediction(apiToken, options, imageDataUri, audioDataUri);
  if (!created.id) {
    throw new Error('Replicate create response did not include prediction id.');
  }
  console.log(`Prediction created: ${created.id}`);

  const result = await waitForReplicatePrediction(apiToken, created.id, options);
  console.log(`Prediction completed: ${result.predictionId}`);
  console.log(`Downloading result from: ${result.outputUrl}`);

  await downloadToFile(result.outputUrl, outputPath, apiToken);

  const scriptFinishedAtMs = Date.now();
  const scriptFinishedAtIso = new Date(scriptFinishedAtMs).toISOString();
  const durationMs = scriptFinishedAtMs - scriptStartedAtMs;
  const durationSec = Number((durationMs / 1000).toFixed(3));
  const reportPath = sidecarJsonPath(outputPath);
  const estimatedCostUsd = estimateCostUsd(options.model, audioDurationSec);
  const modelConfig = REPLICATE_MODELS[options.model];

  if (options.includeReport) {
    await writeJsonFile(reportPath, {
      model: options.model,
      includeCostRequested: options.includeCost,
      replicate: {
        predictionId: result.predictionId,
        status: result.status,
        outputUrl: result.outputUrl,
        predictTimeSec: result.metrics.predict_time ?? null,
        totalTimeSec: result.metrics.total_time ?? null,
      },
      pricing: {
        usdPerSecond: options.includeCost ? modelConfig.costUsdPerSecond : null,
        estimatedCostUsd: options.includeCost ? estimatedCostUsd : null,
        estimatedFromAudioDurationSec: options.includeCost ? audioDurationSec ?? null : null,
      },
      input: {
        imagePath: options.imagePath,
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
  if (options.includeCost) {
    console.log(`Model pricing (USD/sec): ${modelConfig.costUsdPerSecond}`);
    if (typeof estimatedCostUsd === 'number') {
      console.log(`Estimated cost (USD): ${estimatedCostUsd}`);
    }
  }
  console.log(`Execution time: ${durationSec}s`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`lipsync:replicate failed: ${message}`);
  process.exit(1);
});
