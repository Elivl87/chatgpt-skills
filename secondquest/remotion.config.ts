import { Config } from '@remotion/cli/config';

// Deterministic, high-quality defaults for SecondQuest renders.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
Config.setPublicDir('public');
Config.setEntryPoint('src/index.ts');

// Use a pre-installed Chrome/Chromium when available (CI, containers).
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
