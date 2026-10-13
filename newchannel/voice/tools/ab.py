import sys, glob, os, subprocess, numpy as np, soundfile as sf, torch, pyloudnorm as pyln
torch.set_num_threads(2)
from kokoro import KPipeline
from misaki import espeak
fin, dst = sys.argv[1], sys.argv[2]; SR = 24000
pa = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')
pe = KPipeline(lang_code='e', repo_id='hexgrad/Kokoro-82M'); pe.g2p = espeak.EspeakG2P(language='es-419')
meter = pyln.Meter(SR)
ANN = {'EN': 'af_nicole', 'ES': 0.5 * pe.load_single_voice('ef_dora') + 0.5 * pe.load_single_voice('em_santa')}  # announcers, not candidates
def norm(y, L): return y * 10 ** ((L - meter.integrated_loudness(y)) / 20)
def beep(n):
    t = np.arange(int(0.09 * SR)) / SR; b = 0.3 * np.sin(2 * np.pi * 880 * t) * np.hanning(len(t))
    return np.concatenate(sum([[b, np.zeros(int(0.08 * SR))] for _ in range(n)], []))
def say(p, text, voice):
    return np.concatenate([a.numpy() for _, _, a in p(text, voice=voice, speed=1.0, split_pattern=None)])
z = lambda s: np.zeros(int(s * SR), np.float32)
for lang, p, lab, intro in [('EN', pa, 'Candidate {}.', 'Ten Thousand Dots. Voice test, English. Seven candidates.'),
                            ('ES', pe, 'Candidata {}.', 'Diez Mil Puntos. Prueba de voz, español. Cinco candidatas.')]:
    files = sorted(glob.glob(f'{fin}/{lang}_*.wav')); out = [norm(say(p, intro, ANN[lang]), -20), z(1.0)]
    if lang == 'ES': out[0] = norm(say(p, f'Diez Mil Puntos. Prueba de voz en español. {len(files)} candidatas.', ANN[lang]), -20)
    for i, f in enumerate(files):
        L = os.path.basename(f).split('_')[1]
        y, _ = sf.read(f)
        out += [beep(i + 1) * 0.6, z(0.25), norm(say(p, lab.format(L), ANN[lang]), -20), z(0.7), y.astype(np.float32), z(1.5)]
        print(lang, L, os.path.basename(f), flush=True)
    y = np.concatenate(out).astype(np.float32)
    y = y / max(1.0, np.abs(y).max() / 0.89)
    w = f'{dst}/AB_{lang}.tmp.wav'; sf.write(w, y, SR, subtype='FLOAT')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '128k', f'{dst}/AB_{lang}.mp3'], check=True); os.remove(w)
