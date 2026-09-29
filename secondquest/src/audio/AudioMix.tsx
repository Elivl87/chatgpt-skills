import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import type { ResolvedCut } from '../engine/timeline';
import { automationGain, duckGain, fadeGain } from './ducking';

/**
 * Three audio buses:
 *   narration — primary, untouched
 *   music     — fades + automation + automatic ducking under narration
 *   sfx       — per-event volume, lightly ducked under narration
 * Final loudness normalisation (-14 LUFS) happens after render (scripts/render.ts).
 */
export type AudioBus = 'narration' | 'music' | 'sfx';

export const AudioMix: React.FC<{ cut: ResolvedCut; hasNarration: boolean; mute?: AudioBus[] }> = ({ cut, hasNarration, mute = [] }) => {
  const { fps } = cut;
  const { narration, speech, duck, music, sfx } = cut.audio;

  return (
    <>
      {hasNarration && !mute.includes('narration') ? (
        <Audio src={staticFile(narration.src)} volume={narration.volume} trimBefore={narration.trimBefore || undefined} name="narration" />
      ) : null}

      {(mute.includes('music') ? [] : music).map((m) => (
        <Sequence key={m.id} from={m.from} durationInFrames={m.duration} name={`music:${m.id}`} layout="none">
          <Audio
            src={staticFile(m.src)}
            loop={m.loop}
            loopVolumeCurveBehavior="extend"
            trimBefore={m.offset ? Math.round(m.offset * fps) : undefined}
            volume={(f) => {
              const t = m.startSec + f / fps;
              const g =
                m.volume *
                fadeGain(t, m.startSec, m.endSec, m.fadeIn, m.fadeOut) *
                automationGain(t, m.automation) *
                (m.duck ? duckGain(t, speech, duck) : 1);
              return Math.max(0, g);
            }}
          />
        </Sequence>
      ))}

      {(mute.includes('sfx') ? [] : sfx).map((s, i) => (
        <Sequence key={`${s.id}-${i}`} from={s.from} durationInFrames={s.duration} name={`sfx:${s.id}`} layout="none">
          <Audio
            src={staticFile(s.src)}
            playbackRate={s.rate}
            volume={(f) => {
              const local = f / fps;
              const t = s.atSec + local;
              const dur = s.duration / fps;
              const out = s.fadeOut > 0 ? Math.min(1, Math.max(0, (dur - local) / s.fadeOut)) : 1;
              return Math.max(0, s.volume * out * duckGain(t, speech, duck, duck.sfxTo ?? 0.8));
            }}
          />
        </Sequence>
      ))}
    </>
  );
};
