import { bundle } from '@remotion/bundler';
import { selectComposition } from '@remotion/renderer';
import { join } from 'node:path';
import { findBrowser, ROOT } from './lib';

/** Bundle the Remotion project once and select a composition. */
export const prepare = async (compositionId: string, inputProps: Record<string, unknown> = {}) => {
  const browserExecutable = findBrowser() ?? null;
  process.stdout.write('Bundling… ');
  const serveUrl = await bundle({ entryPoint: join(ROOT, 'src/index.ts'), publicDir: join(ROOT, 'public') });
  console.log('done');
  const composition = await selectComposition({ serveUrl, id: compositionId, inputProps, browserExecutable });
  return { serveUrl, composition, browserExecutable };
};
