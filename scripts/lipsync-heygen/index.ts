import path from 'node:path';

import { parseCliArgs } from './helpers/cli';
import { readHeygenApiKey } from './helpers/env';
import {
  assertFileExists,
  defaultOutputPath,
  downloadToFile,
  readTextFile,
  sidecarJsonPath,
  writeJsonFile,
} from './helpers/files';
import { createHeygenVideo, estimateCostUsd, pickHeygenVoiceId, waitForHeygenVideo } from './helpers/heygen';
import { probeMediaDurationSec } from './helpers/media';
import { renderLipsyncPrompt } from './helpers/prompt';
import { uploadToTmpfiles } from './helpers/upload';

async function main(): Promise<void> {
  const scriptStartedAtMs = Date.now();
  const scriptStartedAtIso = new Date(scriptStartedAtMs).toISOString();
  const projectRoot = path.resolve(process.cwd());
  const options = parseCliArgs(process.argv.slice(2), projectRoot);

  await assertFileExists(options.imagePath);
  if (options.audioPath) {
    await assertFileExists(options.audioPath);
  }
  await assertFileExists(options.promptFilePath);
  await assertFileExists(options.scriptFilePath);

  const outputPath = options.outputPath || defaultOutputPath(projectRoot, options.imagePath);

  const [promptTemplate, fallbackScriptFromFile, audioDurationSec] = await Promise.all([
    readTextFile(options.promptFilePath),
    readTextFile(options.scriptFilePath),
    options.audioPath ? probeMediaDurationSec(options.audioPath) : Promise.resolve(undefined),
  ]);

  const apiKey = readHeygenApiKey();
  const prompt = renderLipsyncPrompt(promptTemplate, options.additionalPrompt);
  options.prompt = prompt;
  options.scriptText = options.inlineScript?.trim() || fallbackScriptFromFile.trim();

  console.log('Uploading image to temporary URL...');
  const imageUrl = await uploadToTmpfiles(options.imagePath);

  let audioUrl: string | undefined;
  if (options.audioPath) {
    console.log('Uploading audio to temporary URL...');
    audioUrl = await uploadToTmpfiles(options.audioPath);
  }

  if (!audioUrl && !options.voiceId) {
    console.log('No audio mode detected. Fetching default HeyGen voice_id...');
    options.voiceId = await pickHeygenVoiceId(apiKey);
    console.log(`Using voice_id: ${options.voiceId}`);
  }

  console.log('Submitting HeyGen Avatar IV generation task...');
  console.log(`Prompt file: ${options.promptFilePath}`);
  if (options.additionalPrompt) {
    console.log(`Additional prompt: ${options.additionalPrompt}`);
  }
  if (audioUrl) {
    console.log('Mode: audio_url (own audio).');
  } else {
    console.log('Mode: text + voice_id.');
  }

  const createResult = await createHeygenVideo(apiKey, options, imageUrl, audioUrl);
  console.log(`Video task created: ${createResult.videoId}`);

  const result = await waitForHeygenVideo(apiKey, createResult.videoId, options);
  if (!result.videoUrl) {
    throw new Error(`HeyGen returned no video URL for completed task: ${createResult.videoId}`);
  }

  console.log(`Task completed: ${result.videoId}`);
  console.log(`Downloading result from: ${result.videoUrl}`);
  await downloadToFile(result.videoUrl, outputPath);

  const scriptFinishedAtMs = Date.now();
  const scriptFinishedAtIso = new Date(scriptFinishedAtMs).toISOString();
  const durationMs = scriptFinishedAtMs - scriptStartedAtMs;
  const durationSec = Number((durationMs / 1000).toFixed(3));
  const reportPath = sidecarJsonPath(outputPath);
  const estimatedCost = options.includeCost ? estimateCostUsd(result.rawData) : null;

  if (options.includeReport) {
    await writeJsonFile(reportPath, {
      provider: 'heygen',
      model: 'avatar-iv',
      includeCostRequested: options.includeCost,
      heygen: {
        videoId: result.videoId,
        status: result.status,
        videoUrl: result.videoUrl,
        thumbnailUrl: result.thumbnailUrl ?? null,
        outputDurationSec: result.durationSec ?? null,
        estimatedCostUsd: estimatedCost,
      },
      input: {
        imagePath: options.imagePath,
        audioPath: options.audioPath || null,
        audioDurationSec: audioDurationSec ?? null,
        promptFilePath: options.promptFilePath,
        prompt,
        scriptFilePath: options.scriptFilePath,
        scriptTextUsed: audioUrl ? null : options.scriptText,
        additionalPrompt: options.additionalPrompt || null,
        voiceId: options.voiceId || null,
        mode: audioUrl ? 'audio_url' : 'text',
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
    if (typeof estimatedCost === 'number') {
      console.log(`Estimated cost (USD): ${estimatedCost}`);
    } else {
      console.log('Estimated cost (USD): unavailable in current HeyGen response.');
    }
  }
  console.log(`Execution time: ${durationSec}s`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`lipsync:heygen failed: ${message}`);
  process.exit(1);
});
