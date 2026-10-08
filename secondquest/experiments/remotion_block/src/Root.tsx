import React from 'react';
import { Composition, continueRender, delayRender, staticFile } from 'remotion';
import { Block, DURATION, FPS } from './Block';

// load the house fonts before any frame is captured
const fonts: [string, string, string][] = [['Anton', 'fonts/Anton-Regular.woff2', '400'], ['Inter', 'fonts/Inter-800.woff2', '800'], ['Inter', 'fonts/Inter-600.woff2', '600']];
const handle = delayRender('fonts');
Promise.all(fonts.map(([family, file, weight]) => new FontFace(family, `url(${staticFile(file)})`, { weight }).load().then((ff) => document.fonts.add(ff))))
  .then(() => continueRender(handle));

export const Root: React.FC = () => (
  <Composition id="block" component={Block} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
);
