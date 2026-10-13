import sys, json, glob, numpy as np, soundfile as sf
W = {'EN': 80, 'ES': 93}
for m in sorted(glob.glob(sys.argv[1] + '/*_meta.json')):
    c = json.load(open(m)); y, sr = sf.read(m.replace('_meta.json', '_raw.wav'))
    env = np.abs(y) > 10 ** (-45 / 20); start = np.argmax(env) / sr
    d = c['hook_end_s'] - start
    print(f"{c['name']:16s} speed={c['speed']:.2f} hook={d:5.2f}s wpm={W[c['name'][:2]] / d * 60:5.1f}")
