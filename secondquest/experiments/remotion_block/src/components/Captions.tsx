/**
 * Word-by-word captions from Bram's own word timings (@remotion/captions). The engine computed these timings in EP001
 * and threw them away; here every word lights up exactly when Bram says it.
 */
import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { createTikTokStyleCaptions, type Caption } from '@remotion/captions';

type W = { line: string; text: string; start: number; end: number };
const INK = '#16161f';

export const Captions: React.FC<{ words: readonly W[]; hideAfter?: number }> = ({ words, hideAfter }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (f / fps) * 1000;
  // one page per script line (long lines split every ~6 words), so a caption never mixes two sentences
  const { pages } = useMemo(() => {
    const captions: Caption[] = [];
    let n = 0;
    words.forEach((w, i) => {
      const newLine = i > 0 && words[i - 1].line !== w.line;
      n = newLine ? 0 : n + 1;
      captions.push({ text: (i ? ' ' : '') + w.text, startMs: w.start * 1000, endMs: w.end * 1000, timestampMs: null, confidence: 1 });
      const next = words[i + 1];
      if (next && (next.line !== w.line || n >= 5)) { captions[captions.length - 1].pageBreakAfter = true; n = -1; }
    });
    return createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 100000 });
  }, [words]);
  if (hideAfter !== undefined && f / fps > hideAfter) return null;
  const page = [...pages].reverse().find((p) => p.startMs <= ms);
  if (!page || ms > page.startMs + page.durationMs + 400) return null;
  const pin = spring({ frame: f - Math.round((page.startMs / 1000) * fps), fps, config: { damping: 14, stiffness: 180 } });
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', transform: `translateY(${(1 - pin) * 24}px)`, opacity: pin }}>
      <span style={{ display: 'inline-block', padding: '14px 28px 16px', borderRadius: 18, background: 'rgba(14,16,32,0.72)', boxShadow: `0 6px 0 ${INK}` }}>
        {page.tokens.map((t, i) => {
          const text = i === 0 ? t.text.trimStart() : t.text;
          const active = ms >= t.fromMs && ms < t.toMs + 60;
          const said = ms >= t.fromMs;
          return (
            <span key={i} style={{ font: '800 46px Inter, sans-serif', textTransform: 'uppercase', whiteSpace: 'pre',
              color: active ? '#ffc83d' : said ? '#ffffff' : 'rgba(255,255,255,0.45)', display: 'inline-block',
              transform: `scale(${active ? 1.08 : 1})`, textShadow: `0 4px 0 ${INK}` }}>{text}</span>
          );
        })}
      </span>
    </div>
  );
};
