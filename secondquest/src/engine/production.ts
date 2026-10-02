import type { EpisodeBundle } from '../episodes';
import type { Issue } from './validate';

/**
 * Production policy (shared/production.json).
 *
 * English is the production + default output language. Other locales are fully
 * supported but only rendered when explicitly requested (--locale <code>).
 */

export interface VoiceConfig {
  status: string;
  name?: string;
  engine: 'kokoro';
  model?: string;
  /** Kokoro voice id ("am_michael") or native embedding blend ("am_michael:0.4,em_alex:0.6"). */
  voice: string;
  speed: number;
  /** espeak-ng language used to phonemize ("en-us", "es-419"). */
  lang: string;
  note?: string;
}

export interface ProductionConfig {
  defaultLocale: string;
  render: { defaultLocale: string; policy?: string };
  voices: Record<string, VoiceConfig>;
  episodeDefaults: {
    fps: number;
    width: number;
    height: number;
    narration: { audio: string; volume: number };
    music: {
      duck: { to: number; attack: number; release: number; lookahead: number; sfxTo: number };
      bed: { id: string; src: string; placeholder: string; volume: number; fadeIn: number; fadeOut: number; loop: boolean };
    };
  };
  mastering: { integratedLufs: number; truePeakDbtp: number };
  audio?: { music: 'off' | 'on'; hierarchy?: string[]; policy?: string };
  art?: ArtPolicy;
}

/** Art contract (shared/production.json "art"). See src/engine/artContract.ts. */
export interface ArtPolicy {
  contract: 'FINAL_ART_ONLY' | 'LEGACY';
  manifestSchema?: string;
  styleVersion: string;
  characterVersion: string;
  /** Approved path convention, relative to public/ ("art/"). */
  pathRoot: string;
  requiredFields: string[];
  kinds: string[];
  forbiddenSources: string[];
  safeZoomDefaults: { background: number; character: number; object: number };
  /** Largest render the channel publishes [w, h] (1080p). Minimum background = maxOutput × safeZoomDefaults.background. */
  maxOutput: [number, number];
  policy?: string;
}

export interface PronunciationEntry {
  match: string;
  say?: string;
  lang?: string;
  phonemes?: string;
  note?: string;
}

export type PronunciationLexicon = Record<string, PronunciationEntry[] | string>;

/** The locale a render/still/stem uses when none is requested. */
export const renderLocale = (p: ProductionConfig, requested?: string): string => requested ?? p.render.defaultLocale ?? p.defaultLocale;

export interface VoiceSpec {
  kind: 'id' | 'blend';
  parts: Array<{ id: string; weight: number }>;
}

/** Parse "am_michael" or "am_michael:0.4,em_alex:0.6". Throws on malformed specs. */
export const parseVoiceSpec = (spec: string): VoiceSpec => {
  if (!spec.includes(':')) {
    if (!/^[a-z]{2}_[a-z]+$/.test(spec)) throw new Error(`Invalid voice id "${spec}"`);
    return { kind: 'id', parts: [{ id: spec, weight: 1 }] };
  }
  const parts = spec.split(',').map((p) => {
    const [id, w] = p.split(':');
    const weight = Number(w);
    if (!/^[a-z]{2}_[a-z]+$/.test(id) || !(weight > 0 && weight <= 1)) throw new Error(`Invalid blend part "${p}" in "${spec}"`);
    return { id, weight };
  });
  const sum = parts.reduce((a, p) => a + p.weight, 0);
  if (Math.abs(sum - 1) > 1e-6) throw new Error(`Blend weights in "${spec}" sum to ${sum}, expected 1`);
  return { kind: 'blend', parts };
};

/** Canonical label written into timings.json by the TTS tool ("placeholder-tts:kokoro:<voice>@<speed>"). */
export const voiceLabel = (v: Pick<VoiceConfig, 'voice' | 'speed'>) => `placeholder-tts:kokoro:${v.voice}@${v.speed}`;

/** Checks the production config itself. */
export const validateProduction = (p: ProductionConfig): Issue[] => {
  const issues: Issue[] = [];
  if (!p.voices[p.defaultLocale]) issues.push({ level: 'error', where: 'production.voices', message: `no voice configured for the default locale "${p.defaultLocale}"` });
  if (p.render.defaultLocale !== p.defaultLocale)
    issues.push({ level: 'error', where: 'production.render', message: `render.defaultLocale (${p.render.defaultLocale}) differs from defaultLocale (${p.defaultLocale})` });
  for (const [loc, v] of Object.entries(p.voices)) {
    try {
      parseVoiceSpec(v.voice);
    } catch (e) {
      issues.push({ level: 'error', where: `production.voices.${loc}`, message: (e as Error).message });
    }
    if (!(v.speed >= 0.5 && v.speed <= 2)) issues.push({ level: 'error', where: `production.voices.${loc}`, message: `speed ${v.speed} out of Kokoro range 0.5–2` });
    if (!/official/i.test(v.status) || /provisional/i.test(v.status)) issues.push({ level: 'warn', where: `production.voices.${loc}`, message: `voice status: ${v.status}` });
  }
  return issues;
};

/** Checks one lexicon (shared or episode) against the scripts it will be applied to. */
export const validatePronunciation = (lex: PronunciationLexicon, b: EpisodeBundle, locales: string[], where: string): Issue[] => {
  const issues: Issue[] = [];
  for (const [loc, entries] of Object.entries(lex)) {
    if (!Array.isArray(entries)) continue; // "notes"
    const script = loc === b.episode.locale ? b.script : b.localized?.[loc]?.script;
    const text = script ? script.lines.map((l) => (typeof l.text === 'string' ? l.text : Object.values(l.text).join(' '))).join('\n') : '';
    entries.forEach((e, i) => {
      const w = `${where}.${loc}[${i}]`;
      const modes = ['say', 'lang', 'phonemes'].filter((k) => (e as unknown as Record<string, unknown>)[k] !== undefined);
      if (!e.match) issues.push({ level: 'error', where: w, message: 'missing "match"' });
      if (modes.length !== 1) issues.push({ level: 'error', where: w, message: `needs exactly one of say | lang | phonemes (got ${modes.join(', ') || 'none'})` });
      if (script && locales.includes(loc) && e.match && !text.includes(e.match))
        issues.push({ level: 'warn', where: w, message: `"${e.match}" does not occur in the ${loc} script of ${b.episode.id} (unused here)` });
    });
  }
  return issues;
};

/**
 * Warns when a locale's narration was generated with a different voice than the
 * one production.json now specifies (real recordings / aligned audio are skipped).
 */
export const validateNarrationVoice = (
  p: ProductionConfig,
  b: EpisodeBundle,
  locale: string,
  generatedBy?: string,
  tts?: { voice: string; speed: number; lang?: string },
): Issue[] => {
  const v = p.voices[locale];
  if (!v || !generatedBy || !generatedBy.startsWith('placeholder-tts:')) return [];
  const m = /^placeholder-tts:kokoro:(.+)@([\d.]+)$/.exec(generatedBy);
  const used = tts ?? (m ? { voice: m[1], speed: Number(m[2]) } : undefined);
  const same = used && used.voice === v.voice && Math.abs(used.speed - v.speed) < 1e-6 && (!used.lang || used.lang === v.lang);
  return same
    ? []
    : [
        {
          level: 'warn',
          where: `narration.${locale}`,
          message: `generated with ${used ? `${used.voice}@${used.speed}${used.lang ? ` (${used.lang})` : ''}` : generatedBy} but production voice is ${v.voice}@${v.speed} (${v.lang}) — regenerate (npm run narration:tts -- ${b.episode.id} --locale ${locale})`,
        },
      ];
};
