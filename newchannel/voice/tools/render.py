import sys, json, os, re, numpy as np, soundfile as sf, torch
torch.set_num_threads(2)
from kokoro import KPipeline
from misaki import espeak
sys.path.insert(0, os.path.dirname(__file__))
from texts import EN_BEATS, EN_TAG, ES_BEATS, ES_TAG
SR = 24000
cands = json.load(open(sys.argv[1])); out = sys.argv[2]
pipes = {}
def pipe(lang):
    if lang not in pipes:
        if lang == 'es419':
            p = KPipeline(lang_code='e', repo_id='hexgrad/Kokoro-82M')
            p.g2p = espeak.EspeakG2P(language='es-419')  # Latin-American seseo/yeismo
        else:
            p = KPipeline(lang_code=lang, repo_id='hexgrad/Kokoro-82M')
        pipes[lang] = p
    return pipes[lang]
def voice(p, recipe):
    if isinstance(recipe, str): return recipe
    return sum(w * p.load_single_voice(v) for v, w in recipe.items())
for c in cands:
    p = pipe(c['lang']); v = voice(p, c['voice'])
    beats, tag = (ES_BEATS, ES_TAG) if c['lang'] == 'es419' else (EN_BEATS, EN_TAG)
    parts, phon = [], []
    for i, t in enumerate(beats + [tag]):
        t2 = c.get('respell', {}).get(t, t)
        segs = [(ps, a.numpy()) for gs, ps, a in p(t2, voice=v, speed=c['speed'], split_pattern=None)]
        for ps, a in segs: parts.append(a); phon.append(ps)
        gap = 0.9 if i == len(beats) - 1 else 0.45
        if i < len(beats): parts.append(np.zeros(int(gap * SR), np.float32))
        if i == len(beats) - 1: hook_end = sum(len(x) for x in parts) - int(gap * SR)
    y = np.concatenate(parts)
    sf.write(f"{out}/{c['name']}_raw.wav", y, SR)
    open(f"{out}/{c['name']}_phon.txt", 'w').write('\n'.join(phon))
    json.dump({'hook_end_s': hook_end / SR, **c}, open(f"{out}/{c['name']}_meta.json", 'w'))
    print(c['name'], len(y) / SR, hook_end / SR, flush=True)
