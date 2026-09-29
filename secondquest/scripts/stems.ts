/**
 * Export audio stems (narration / music / sfx) as WAV for mix review or a DAW.
 *
 *   npm run stems -- ep001 hook
 *
 * Output: renders/stems/<episode>_<cut>_<bus>.wav (unmastered, pre-loudness).
 */
import { renderMedia } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { AudioBus } from '../src/audio/AudioMix';
import { parseArgs, ROOT } from './lib';
import { prepare } from './remotion';

const BUSES: AudioBus[] = ['narration', 'music', 'sfx'];

const main = async () => {
  const { positional } = parseArgs();
  const episodeId = positional[0] ?? 'ep001';
  const cutId = positional[1] ?? 'hook';
  const outDir = join(ROOT, 'renders/stems');
  mkdirSync(outDir, { recursive: true });
  for (const bus of BUSES) {
    const inputProps = { episodeId, cutId, mute: BUSES.filter((b) => b !== bus) };
    const { serveUrl, composition, browserExecutable } = await prepare(`${episodeId}-${cutId}`, inputProps);
    const out = join(outDir, `${episodeId}_${cutId}_${bus}.wav`);
    await renderMedia({ serveUrl, composition, codec: 'wav', inputProps, outputLocation: out, browserExecutable });
    console.log(`  ${bus} → ${out.replace(ROOT + '/', '')}`);
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
