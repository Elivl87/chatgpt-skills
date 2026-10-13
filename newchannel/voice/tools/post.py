import sys, json, glob, os, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt
src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
W = {'EN': (80, 8), 'ES': (93, 8)}
sos = butter(2, 70, 'highpass', fs=24000, output='sos')
res = {}
for m in sorted(glob.glob(src + '/*_meta.json')):
    c = json.load(open(m)); n = c['name']; y, sr = sf.read(m.replace('_meta.json', '_raw.wav'))
    raw_clip = int(np.sum(np.abs(y) >= 0.999)); raw_peak = 20 * np.log10(np.abs(y).max())
    thr = 10 ** (-45 / 20); idx = np.where(np.abs(y) > thr)[0]
    a, b = max(idx[0] - int(0.15 * sr), 0), min(idx[-1] + int(0.30 * sr), len(y))
    hook_end = c['hook_end_s'] - a / sr; hook_start = (idx[0] - a) / sr
    tw = f'{dst}/{n}_trim.wav'; sf.write(tw, y[a:b], sr, subtype='FLOAT')
    ch = 'highpass=f=70:poles=2,acompressor=threshold=-24dB:ratio=2.5:attack=8:release=120:knee=4'
    p1 = subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',tw,'-af',ch+',loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
    js = json.loads(p1[p1.rindex('{'):p1.rindex('}')+1])
    ln = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
          f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    pw = f'{dst}/{n}_pp.wav'
    subprocess.run(['ffmpeg','-v','error','-y','-i',tw,'-af',ch+','+ln,'-ar','24000','-c:a','pcm_f32le',pw],check=True)
    y, _ = sf.read(pw); os.remove(tw); os.remove(pw)
    # silence gaps (20 ms frames below -45 dBFS after norm)
    f = int(0.02 * sr); fr = np.abs(y[:len(y) // f * f]).reshape(-1, f).max(1)
    sil = fr < thr; gaps = []; run = 0
    for i, s in enumerate(sil):
        if s: run += 1
        else:
            if run and i - run > 0: gaps.append(run * 0.02)
            run = 0
    clip = int(np.sum(np.abs(y) >= 0.999))
    wav = f'{dst}/{n}.wav'; sf.write(wav, y.astype(np.float32), sr, subtype='FLOAT')
    mp3 = f'{dst}/{n}.mp3'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '128k', mp3], check=True)
    e = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', mp3, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    tail = e[e.rfind('Summary'):]
    I = float(tail.split('I:')[1].split('LUFS')[0]); TP = float(tail.split('Peak:')[1].split('dBFS')[0])
    hw, tw = W[n[:2]]
    res[n] = dict(voice=c['voice'], speed=c['speed'], lang=c['lang'], dur=round(len(y) / sr, 2),
                  hook_s=round(hook_end - hook_start, 2), wpm=round(hw / (hook_end - hook_start) * 60, 1),
                  raw_peak_db=round(raw_peak, 1), raw_clip=raw_clip, clip=clip, mp3_I=I, mp3_TP=TP,
                  gaps_over_250ms=len([g for g in gaps if g >= 0.25]), max_gap=round(max(gaps), 2) if gaps else 0,
                  mp3_kb=round(os.path.getsize(mp3) / 1024))
    print(n, res[n], flush=True)
json.dump(res, open(dst + '/measure.json', 'w'), indent=1)
