/**
 * Remotion block test (experiment, engine untouched): EP002 l12-l16, "It is the game... plus the room. Plus the
 * television. Plus the friend who somehow knew where to go. Plus an entire Saturday afternoon... particular miracle."
 * t = 0 is episode 34.32 s; 14.87 s; designed at 1920x1080, rendered at 2560x1440 (scale 4/3).
 *
 * What it uses from Remotion: <CameraMotionBlur> on the fast camera moves, <Trail> for Navi, GPU effects on the art
 * (@remotion/effects: CRT barrel + chromatic aberration + scanlines, ink outline + contact shadow on the cut-outs,
 * white balance + exposure for the time of day, light leak, paper, noise grain, vignette), @remotion/paths for drawn
 * strokes, @remotion/captions for word-by-word captions, <Freeze> + spring physics for the photo, and a full sound mix
 * (Bram + engine synths + CC0 + own synths) with volume curves.
 */
import React from 'react';
import { AbsoluteFill, Audio, Easing, Freeze, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { evolvePath } from '@remotion/paths';
import { noise2D } from '@remotion/noise';
import { barrelDistortion } from '@remotion/effects/barrel-distortion';
import { chromaticAberration } from '@remotion/effects/chromatic-aberration';
import { scanlines } from '@remotion/effects/scanlines';
import { outline } from '@remotion/effects/outline';
import { dropShadow } from '@remotion/effects/drop-shadow';
import { whiteBalance } from '@remotion/effects/white-balance';
import { exposure } from '@remotion/effects/exposure';
import { lightLeak } from '@remotion/effects/light-leak';
import { noise } from '@remotion/effects/noise';
import { vignette } from '@remotion/effects/vignette';
import { WORDS } from './words';
import { FlapClock, flapFrames } from './components/FlapClock';
import { Navi, type NaviKey } from './components/Navi';
import { Captions } from './components/Captions';
import { Polaroid } from './components/Polaroid';

export const FPS = 24;
export const DURATION = Math.round(14.87 * FPS);
const F = (s: number) => Math.round(s * FPS);
const INK = '#16161f';
const art = (n: string) => staticFile(`art/${n}`);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Cues (s): "It is the game" 0.10 · "plus the room" 1.02/2.16 · "Plus the television" 3.00/3.40 · "Plus the friend" 4.40/4.82 ·
// "knew where to go" 5.78-6.54 · "Plus an entire Saturday afternoon" 7.32/8.26/8.80 · "smartphones" 11.18 ·
// "not yet ruined" 12.28-12.76 · "miracle" 13.92 · end of l16 14.42 · cut 14.87.

// ---------------------------------------------------------------- camera: view centre + zoom, eased per segment
const CAM: [number, number, number, number][] = [ // [s, fx, fy, zoom]
  [0, 1670, 610, 6.6], [0.95, 1670, 610, 6.9], [2.2, 1240, 560, 1.25], [3.0, 1150, 560, 1.12], [3.7, 1371, 600, 1.75],
  [4.3, 1371, 600, 1.75], [5.15, 1000, 560, 1.0], [8.3, 980, 560, 1.0], [14.3, 960, 560, 1.08], [14.87, 960, 560, 1.08],
];
const camAt = (f: number) => {
  const t = CAM.map((k) => F(k[0]));
  const o = { ...clamp, easing: Easing.inOut(Easing.cubic) };
  const s = interpolate(f, t, CAM.map((k) => k[3]), o);
  let fx = interpolate(f, t, CAM.map((k) => k[1]), o), fy = interpolate(f, t, CAM.map((k) => k[2]), o);
  const hx = 960 / s, hy = 540 / s, k = Math.min(1, Math.max(0, (4 - s) / 1.5)); // keep the frame inside the plate once out of the TV
  fx += k * (Math.min(1920 - hx, Math.max(hx, fx)) - fx); fy += k * (Math.min(1080 - hy, Math.max(hy, fy)) - fy);
  return { fx, fy, s };
};
const BLUR_WINDOWS = [[0.95, 2.3], [3.0, 3.75], [4.3, 5.2]].map(([a, b]) => [F(a), F(b)]);

// ---------------------------------------------------------------- time of day (same plate, graded: morning -> golden afternoon)
const gradeAt = (f: number) => ({
  temperature: interpolate(f, [F(8.3), F(12.5)], [0.05, 0.55], clamp),
  tint: interpolate(f, [F(8.3), F(12.5)], [0, 0.12], clamp),
  stops: interpolate(f, [F(8.3), F(12.5)], [0, -0.35], clamp),
});
// only while the light is changing or changed (before "Saturday" the plate is shown as approved, no shader cost)
const grade = (f: number) => { if (f < F(8.3)) return []; const g = gradeAt(f); return [whiteBalance({ temperature: g.temperature, tint: g.tint }), exposure({ stops: g.stops })]; };

// ---------------------------------------------------------------- the TV (drawn in code) with the game on a real CRT shader
const TV: React.FC = () => {
  const f = useCurrentFrame();
  const flick = 0.96 + 0.04 * noise2D('tv', f * 0.4, 0);
  return (
    <div style={{ position: 'absolute', left: 1490, top: 470, width: 380, height: 300 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 26, background: 'linear-gradient(180deg,#5d5a63,#3e3c44 60%,#2d2b31)',
        border: `5px solid ${INK}`, boxShadow: `inset 0 6px 0 rgba(255,255,255,0.12), 0 10px 0 ${INK}` }} />
      <div style={{ position: 'absolute', left: 30, top: 26, width: 290, height: 218, borderRadius: '34px / 26px', overflow: 'hidden', border: `5px solid ${INK}`, background: '#0b0d10' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: flick }}>
          <Img src={art('11_field.png')} style={{ position: 'absolute', left: -6, top: -6, width: 292, height: 220, objectFit: 'cover' }}
            effects={[barrelDistortion({ amount: 0.35 }), chromaticAberration({ amount: 0.35 }), scanlines({ amount: 0.45, spacing: 3 })]} />
          <Img src={art('03_young_back.png')} style={{ position: 'absolute', left: 113, bottom: -8 - Math.abs(Math.sin(f * 0.35)) * 2, width: 62 }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 35% 25%, rgba(255,255,255,0.25), transparent 50%), radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55))' }} />
      </div>
      <div style={{ position: 'absolute', right: 18, top: 60, width: 26 }}>
        {[0, 1].map((i) => <i key={i} style={{ display: 'block', width: 26, height: 26, marginBottom: 18, borderRadius: '50%', background: '#23212a', border: `4px solid ${INK}` }} />)}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- a character: approved cut-out + ink outline + contact shadow + breathing
const Kid: React.FC<{ src: string; x: number; y: number; w: number; enterAt: number; from?: number; breathe?: number; exitAt?: number; hopAt?: number }> =
  ({ src, x, y, w, enterAt, from = -400, breathe = 1, exitAt, hopAt }) => {
    const f = useCurrentFrame();
    const { fps } = useVideoConfig();
    const inS = spring({ frame: f - enterAt, fps, config: { damping: 13, stiffness: 110 } });
    const outO = exitAt === undefined ? 1 : interpolate(f, [exitAt, exitAt + 6], [1, 0], clamp);
    const hop = hopAt === undefined ? 0 : Math.max(0, Math.sin(Math.min(1, Math.max(0, (f - hopAt) / 8)) * Math.PI)) * 18;
    const squash = hopAt === undefined ? 1 : 1 + 0.05 * Math.sin(Math.min(1, Math.max(0, (f - hopAt - 8) / 6)) * Math.PI);
    const br = 1 + 0.012 * breathe * Math.sin((f / fps) * 2 * Math.PI / 3.1);
    if (f < enterAt - 1 || outO <= 0) return null;
    return (
      <div style={{ position: 'absolute', left: x, top: y, width: w, opacity: inS * outO, transformOrigin: '50% 100%',
        transform: `translateX(${(1 - inS) * from}px) translateY(${-hop}px) scale(${1 / squash}, ${br * squash})` }}>
        <Img src={art(src)} style={{ width: '100%' }} effects={[...grade(f), outline({ width: 5, color: INK }), dropShadow({ radius: 26, offsetY: 16, opacity: 0.45 })]} />
      </div>
    );
  };

// ---------------------------------------------------------------- dust motes in the sunbeam (noise-driven drift)
const Dust: React.FC<{ on: number }> = ({ on }) => {
  const f = useCurrentFrame();
  return (<>{Array.from({ length: 34 }, (_, i) => {
    const bx = 560 + ((i * 97) % 520), by = 150 + ((i * 211) % 760);
    const x = bx + noise2D('dx' + i, f * 0.012, 0) * 60, y = by + noise2D('dy' + i, f * 0.01, 1) * 50 - f * 0.25;
    const a = on * (0.35 + 0.35 * noise2D('da' + i, f * 0.05, 2));
    return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,240,200,0.9)', boxShadow: '0 0 8px rgba(255,220,150,0.9)', opacity: Math.max(0, a) }} />;
  })}</>);
};

// ---------------------------------------------------------------- Navi's path (in stage coordinates)
const NAVI: NaviKey[] = [
  [F(0), 1600, 590, 0.35], [F(0.9), 1700, 600, 0.4], [F(1.6), 1560, 520, 0.9], [F(2.4), 1200, 360, 1.0], [F(3.2), 1500, 470, 0.9],
  [F(4.4), 1330, 440, 0.9], [F(4.9), 1000, 470, 1.0], [F(5.5), 1120, 520, 1.0], [F(5.8), 1130, 500, 1.0], [F(6.5), 1600, 560, 0.7],
  [F(7.4), 1220, 380, 0.9], [F(9.6), 900, 520, 0.9], [F(11.0), 760, 600, 0.85], [F(13.0), 820, 560, 0.85], [F(14.87), 840, 540, 0.85],
];

// ---------------------------------------------------------------- the room (everything the camera sees)
const Room: React.FC = () => {
  const f = useCurrentFrame();
  const g = grade(f);
  const beamO = interpolate(f, [F(1.6), F(3.2), F(8.3), F(12.3)], [0, 0.5, 0.5, 0.75], clamp);
  const beamR = interpolate(f, [F(1.6), F(3.2), F(8.3), F(12.3)], [14, 10, 10, -22], clamp);
  const beamX = interpolate(f, [F(8.3), F(12.3)], [0, 380], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const tvGlow = interpolate(f, [F(3.35), F(3.6), F(4.1), F(6.45), F(6.57), F(6.8)], [0, 0.9, 0.55, 0.55, 1, 0.55], clamp);
  const arrow = interpolate(f, [F(5.78), F(6.38)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const arrowFade = interpolate(f, [F(7.0), F(7.3)], [1, 0], clamp);
  const ARROW = 'M1115 520 C 1250 380, 1420 380, 1560 560';
  return (
    <AbsoluteFill>
      <Img src={art('quest_bedroom_morning.png')} style={{ position: 'absolute', inset: 0, width: 1920, height: 1080 }} effects={g} />
      <div style={{ position: 'absolute', left: 520, top: -200, width: 520, height: 1700, opacity: beamO, mixBlendMode: 'screen', filter: 'blur(18px)',
        transformOrigin: '50% 0', transform: `translateX(${beamX}px) rotate(${beamR}deg)`,
        background: 'linear-gradient(90deg, transparent, rgba(255,226,160,0.55) 30%, rgba(255,226,160,0.55) 70%, transparent)' }} />
      <div style={{ position: 'absolute', left: 1380, top: 380, width: 600, height: 560, borderRadius: '50%', opacity: tvGlow, mixBlendMode: 'screen',
        background: 'radial-gradient(circle, rgba(140,200,255,0.55), rgba(120,180,255,0.15) 45%, transparent 70%)' }} />
      <TV />
      <Kid src="6c_kid_sitting.png" x={650} y={560} w={560} enterAt={F(9.6)} from={0} hopAt={F(9.6)} />
      <Kid src="06a_kid_playing_seated.png" x={120} y={560} w={600} enterAt={F(4.35)} />
      <Kid src="6b_kid_pointing.png" x={700} y={430} w={440} enterAt={F(4.75)} from={-260} exitAt={F(9.6)} />
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: 1920, height: 1080, opacity: arrowFade }}>
        <path d={ARROW} fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" style={{ filter: `drop-shadow(0 4px 0 ${INK})` }} {...evolvePath(arrow, ARROW)} />
        {arrow > 0.97 && <path d="M1528 548 L 1566 570 L 1572 526" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
      <Dust on={interpolate(f, [F(8.3), F(9.3)], [0, 1], clamp)} />
      <Navi keys={NAVI} />
    </AbsoluteFill>
  );
};

const Camera: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const { fx, fy, s } = camAt(f);
  return <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${960 - fx * s}px, ${540 - fy * s}px) scale(${s})` }}>{children}</div>;
};

// ---------------------------------------------------------------- the phone and the red marker
const Phone: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame: f - F(11.1), fps, config: { damping: 11, stiffness: 140 } });
  const buzz = f > F(11.45) && f < F(12.05) ? Math.sin(f * 2.6) * 6 : 0;
  const drop = interpolate(f, [F(13.1), F(13.6)], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const ring = interpolate(f, [F(12.28), F(12.68)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const slash = interpolate(f, [F(12.7), F(12.88)], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  if (f < F(11.0)) return null;
  const RING = 'M135 12 C 230 14, 258 120, 252 190 C 244 280, 180 330, 120 328 C 40 324, 14 240, 18 160 C 22 70, 70 18, 150 20';
  const SLASH = 'M40 300 L 232 36';
  return (
    <div style={{ position: 'absolute', left: 1020, top: 110, width: 270, height: 340, opacity: inS * (1 - drop),
      transform: `translateY(${(1 - inS) * -280 + drop * 900}px) rotate(${(1 - inS) * 10 + buzz + drop * 18}deg)` }}>
      <div style={{ position: 'absolute', left: 60, top: 30, width: 150, height: 280, borderRadius: 26, background: '#1d1f29', border: `6px solid ${INK}`, boxShadow: `0 8px 0 ${INK}` }}>
        <div style={{ position: 'absolute', left: 10, right: 10, top: 16, bottom: 16, borderRadius: 14, background: 'linear-gradient(160deg,#6fb7ff,#3b6fe0)' }} />
        <div style={{ position: 'absolute', right: -16, top: -16, width: 40, height: 40, borderRadius: '50%', background: '#ff3b30', border: `4px solid ${INK}`, color: '#fff', font: '800 22px/32px Inter, sans-serif', textAlign: 'center' }}>1</div>
      </div>
      <svg viewBox="0 0 270 340" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path d={RING} fill="none" stroke="#e8262b" strokeWidth={16} strokeLinecap="round" {...evolvePath(ring, RING)} />
        <path d={SLASH} fill="none" stroke="#e8262b" strokeWidth={18} strokeLinecap="round" {...evolvePath(slash, SLASH)} />
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------- the whole block
const HOURS = ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];
const CLOCK_START = F(8.26), CLOCK_STEP = 10;
const SNAP = F(13.92);

export const Block: React.FC = () => {
  const f = useCurrentFrame();
  const blur = BLUR_WINDOWS.some(([a, b]) => f >= a && f <= b);
  const world = <Camera><Room /></Camera>;
  const shot = blur ? <CameraMotionBlur samples={7} shutterAngle={200}>{world}</CameraMotionBlur> : world;
  const flash = interpolate(f, [SNAP - 1, SNAP, SNAP + 10], [0, 0.9, 0], clamp);
  const leak = interpolate(f, [F(1.0), F(1.5), F(2.4)], [0, 0.6, 0], clamp);
  const clockO = interpolate(f, [F(13.2), F(13.5)], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: '#120e0c' }}>
      <Polaroid startFrame={SNAP} caption="Saturday afternoon · 1998">
        {f >= SNAP ? <Freeze frame={SNAP}><Camera><Room /></Camera></Freeze> : shot}
      </Polaroid>
      {f < SNAP && <Phone />}
      {f >= CLOCK_START && f < F(13.5) && (
        <div style={{ position: 'absolute', left: 70, top: 70, opacity: clockO }}><FlapClock label="SATURDAY" values={HOURS} startFrame={CLOCK_START} stepFrames={CLOCK_STEP} /></div>
      )}
      {/* light leak on the pull-out of the screen, film grain + vignette for the memory */}
      {leak > 0 && <Img src={art('black.png')} style={{ position: 'absolute', inset: 0, width: 1920, height: 1080, mixBlendMode: 'screen', opacity: leak }} effects={[lightLeak({ progress: interpolate(f, [F(1.0), F(2.4)], [0, 1], clamp), seed: 4 })]} />}
      <Img src={art('black.png')} style={{ position: 'absolute', inset: 0, width: 1920, height: 1080, mixBlendMode: 'screen', opacity: interpolate(f, [F(8.3), F(10.3)], [0.05, 0.16], clamp) }}
        effects={[noise({ amount: 0.6, seed: f % 9 })]} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: interpolate(f, [F(8.3), F(10.3)], [0.15, 1], clamp),
        background: 'radial-gradient(ellipse 72% 68% at 50% 50%, transparent 55%, rgba(30,14,6,0.55))' }} />
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: flash }} />
      <Captions words={WORDS} hideAfter={13.85} />

      {/* ---------------- sound: Bram + room + engine synths + CC0 + own synths, with volume curves */}
      <Audio src={staticFile('audio/bram.wav')} />
      <Audio src={staticFile('sfx/room_tone.wav')} volume={(fr) => interpolate(fr, [F(0.9), F(2.0)], [0, 0.6], clamp)} />
      <Audio src={staticFile('sfx/crt_hum.wav')} volume={(fr) => interpolate(fr, [0, F(1.2), F(2.4), F(13.9)], [0.5, 0.5, 0.18, 0.18], clamp)} />
      <Sequence from={0} durationInFrames={F(1.2)}><Audio src={staticFile('sfx/computerNoise_000.ogg')} volume={0.12} /></Sequence>
      <Sequence from={F(1.0)}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.45} /></Sequence>
      <Sequence from={F(1.25)}><Audio src={staticFile('sfx/fairy_shimmer.wav')} volume={0.35} /></Sequence>
      <Sequence from={F(1.3)} durationInFrames={F(12.5)}><Audio src={staticFile('sfx/fairy_flutter.wav')} loop volume={(fr) => interpolate(fr, [0, 10], [0, 0.12], clamp)} /></Sequence>
      <Sequence from={F(3.3)}><Audio src={staticFile('sfx/tv_on.wav')} volume={0.18} /></Sequence>
      <Sequence from={F(5.78)}><Audio src={staticFile('sfx/scratch_005.ogg')} volume={0.35} /></Sequence>
      {flapFrames(HOURS.length, CLOCK_START, CLOCK_STEP).map((fr) => <Sequence key={fr} from={fr - 1}><Audio src={staticFile('sfx/click_001.ogg')} volume={0.55} /></Sequence>)}
      <Sequence from={F(11.4)}><Audio src={staticFile('sfx/phone_buzz.wav')} volume={0.5} /></Sequence>
      <Sequence from={F(12.28)}><Audio src={staticFile('sfx/scratch_004.ogg')} volume={0.5} /></Sequence>
      <Sequence from={F(12.7)}><Audio src={staticFile('sfx/scratch_005.ogg')} volume={0.5} /></Sequence>
      <Sequence from={SNAP - 1}><Audio src={staticFile('sfx/shutter.wav')} volume={0.7} /></Sequence>
    </AbsoluteFill>
  );
};
