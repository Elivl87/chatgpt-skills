import sys, glob, os, json, numpy as np, librosa
d = sys.argv[1]; res = {}; mf = {}
for f in sorted(glob.glob(d + '/*.wav')):
    n = os.path.basename(f)[:-4]; y, sr = librosa.load(f, sr=16000)
    f0, vf, _ = librosa.pyin(y, fmin=60, fmax=450, sr=sr, frame_length=1024)
    f0 = f0[~np.isnan(f0)]; st = 12 * np.log2(f0 / np.median(f0))
    m = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)[1:]; e = librosa.feature.rms(y=y)[0]
    mf[n] = m[:, e > np.percentile(e, 30)].mean(1)
    res[n] = dict(f0_med=round(float(np.median(f0)), 1), f0_range_st=round(float(np.percentile(st, 95) - np.percentile(st, 5)), 1),
                  f0_sd_st=round(float(st.std()), 2))
    print(n, res[n], flush=True)
en = [k for k in mf if k.startswith('EN')]; es = [k for k in mf if k.startswith('ES')]
sim = {}
for a in en:
    for b in es:
        u, v = mf[a], mf[b]; sim[f'{a}|{b}'] = round(float(np.dot(u, v) / np.linalg.norm(u) / np.linalg.norm(v)), 3)
for a in en: print(a, {b[3:]: sim[f'{a}|{b}'] for b in es})
json.dump({'prosody': res, 'timbre_cos': sim}, open(d + '/prosody.json', 'w'), indent=1)
