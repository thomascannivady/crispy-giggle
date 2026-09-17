#!/usr/bin/env node
// Real tool (not mocked): merges one video + one audio file into the final render.
// Usage: node run_ffmpeg.mjs <video_path> <audio_path> <output_path>
// Prints one JSON line and exits 0 on success; exits nonzero with a JSON error on failure.
// Never claims success without a real ffmpeg run — a merge failure must surface, not be papered over.
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const [, , videoPath, audioPath, outputPath] = process.argv;
if (!videoPath || !audioPath || !outputPath) {
  console.error("Usage: run_ffmpeg.mjs <video_path> <audio_path> <output_path>");
  process.exit(1);
}
if (!existsSync(videoPath) || !existsSync(audioPath)) {
  console.error(JSON.stringify({ status: "failed", reason: "input file missing", videoPath, audioPath }));
  process.exit(1);
}
try {
  execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
} catch {
  console.error(JSON.stringify({ status: "failed", reason: "ffmpeg is not installed in this environment" }));
  process.exit(1);
}
mkdirSync(dirname(outputPath), { recursive: true });
try {
  execFileSync("ffmpeg", [
    "-y", "-i", videoPath, "-i", audioPath,
    "-c:v", "libx264", "-c:a", "aac", "-shortest", outputPath,
  ], { stdio: "ignore" });
  console.log(JSON.stringify({ status: "success", filepath: outputPath }));
} catch {
  console.error(JSON.stringify({
    status: "failed",
    reason: "ffmpeg merge failed — check both inputs are valid media (an upstream mock step may have produced a text-stub placeholder instead of real media; check real_media in its output JSON)",
  }));
  process.exit(1);
}
