import { continueRender, delayRender, staticFile } from 'remotion';

/**
 * Fonts are bundled locally (SIL OFL, public/shared/fonts) so renders never
 * depend on network access and every frame waits until glyphs are ready.
 */
const FONTS = [
  { family: 'Anton', file: 'shared/fonts/Anton-Regular.woff2', weight: '400' },
  { family: 'Inter', file: 'shared/fonts/Inter-400.woff2', weight: '400' },
  { family: 'Inter', file: 'shared/fonts/Inter-600.woff2', weight: '600' },
  { family: 'Inter', file: 'shared/fonts/Inter-800.woff2', weight: '800' },
];

let started = false;

export const ensureFonts = (): void => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Loading SecondQuest fonts');
  Promise.all(
    FONTS.map((f) =>
      new FontFace(f.family, `url(${staticFile(f.file)}) format('woff2')`, { weight: f.weight })
        .load()
        .then((face) => document.fonts.add(face)),
    ),
  )
    .catch((err) => console.error('Font loading failed', err))
    .finally(() => continueRender(handle));
};
