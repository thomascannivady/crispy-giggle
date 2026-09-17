#!/usr/bin/env node
// Mock stand-in for a video-generation API (e.g. Runway Gen-3).
// Usage: node generate_video.mjs "<prompt>" <duration_seconds> <output_path>
// Always prints one JSON line to stdout: { filepath, prompt, duration_seconds, real_media, source }
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const [, , prompt, durationArg, outputPath] = process.argv;
if (!prompt || !durationArg || !outputPath) {
  console.error("Usage: generate_video.mjs <prompt> <duration_seconds> <output_path>");
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

let real_media = false;
if (hasFfmpeg()) {
  try {
    const safeText = prompt.slice(0, 80).replace(/['\\:]/g, "");
    execFileSync("ffmpeg", [
      "-y", "-f", "lavfi", "-i", `testsrc2=size=640x360:duration=${duration}`,
      "-vf", `drawtext=text='${safeText}':fontcolor=white:fontsize=16:x=10:y=10`,
      "-pix_fmt", "yuv420p", outputPath,
    ], { stdio: "ignore" });
    real_media = existsSync(outputPath);
  } catch {
    real_media = false;
  }
}
if (!real_media) {
  writeFileSync(
    outputPath,
    `MOCK VIDEO PLACEHOLDER — not a real, playable video file.\n` +
      `Reason: ffmpeg unavailable in this environment, or generation failed.\n` +
      `Prompt: ${prompt}\nDuration: ${duration}s\n`
  );
}
console.log(JSON.stringify({
  filepath: outputPath,
  prompt,
  duration_seconds: duration,
  real_media,
  source: "mock:generate_video (Runway Gen-3 stand-in — no real API called)",
}));
