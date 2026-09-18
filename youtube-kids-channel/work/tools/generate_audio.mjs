#!/usr/bin/env node
// Mock stand-in for a music/SFX generation API (e.g. Suno/Udio).
// Usage: node generate_audio.mjs "<prompt>" <duration_seconds> <output_path>
// Always prints one JSON line to stdout: { filepath, prompt, duration_seconds, real_media, source }
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const [, , prompt, durationArg, outputPath] = process.argv;
if (!prompt || !durationArg || !outputPath) {
  console.error("Usage: generate_audio.mjs <prompt> <duration_seconds> <output_path>");
  process.exit(1);
}
const duration = Math.max(1, Number(durationArg) || 5);
mkdirSync(dirname(outputPath), { recursive: true });

function hasFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Hand-built silent WAV — always a real, valid, playable (silent) audio file,
// used whenever ffmpeg isn't available to render an actual tone.
function writeSilentWav(path, seconds) {
  const sampleRate = 44100, numChannels = 1, bitsPerSample = 16;
  const numSamples = Math.floor(sampleRate * seconds);
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  writeFileSync(path, buffer);
}

let usedFfmpeg = false;
if (hasFfmpeg()) {
  try {
    execFileSync("ffmpeg", [
      "-y", "-f", "lavfi", "-i", `sine=frequency=440:duration=${duration}`, outputPath,
    ], { stdio: "ignore" });
    usedFfmpeg = existsSync(outputPath);
  } catch {
    usedFfmpeg = false;
  }
}
if (!usedFfmpeg) {
  writeSilentWav(outputPath, duration);
}
console.log(JSON.stringify({
  filepath: outputPath,
  prompt,
  duration_seconds: duration,
  real_media: true,
  source: usedFfmpeg
    ? "mock:generate_audio (ffmpeg sine-tone stand-in — no real API called)"
    : "mock:generate_audio (silent WAV fallback, ffmpeg unavailable — no real API called)",
}));
