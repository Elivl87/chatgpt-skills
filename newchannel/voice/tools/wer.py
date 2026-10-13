import sys, json, glob, re, os, unicodedata
os.environ.setdefault('OMP_NUM_THREADS', '2')
from faster_whisper import WhisperModel
import jiwer, subprocess, numpy as np
def load(f):
    b = subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True,check=True).stdout
    return np.frombuffer(b, np.float32)
sys.path.insert(0, os.path.dirname(__file__))
from texts import EN_BEATS, EN_TAG, ES_BEATS, ES_TAG
NUM = {'en': {'10,000': 'ten thousand', '10000': 'ten thousand', '12': 'twelve', '6': 'six', '20': 'twenty', '10': 'ten', '15': 'fifteen', '3': 'three'},
       'es': {'10.000': 'diez mil', '10,000': 'diez mil', '10000': 'diez mil', '12': 'doce', '6': 'seis', '20': 'veinte', '10': 'diez', '15': 'quince', '3': 'tres'}}
def norm(t, lang):
    t = t.lower()
    t = re.sub(r'(?<=[a-z])(?=\d)', ' ', t)  # 'A3' -> 'a 3'
    for k, v in sorted(NUM[lang].items(), key=lambda kv: -len(kv[0])): t = re.sub(r'(?<![\d.,])' + re.escape(k) + r'(?![\d])', v, t)
    t = t.replace('’', "'")
    t = re.sub(r"[^\w' ]+", ' ', t)
    if lang == 'es':  # ignore accent marks for WER (whisper often drops/adds them); keep ñ
        t = ''.join(ch for ch in unicodedata.normalize('NFD', t.replace('ñ', '\0')) if unicodedata.category(ch) != 'Mn').replace('\0', 'ñ')
    return ' '.join(t.split())
model = WhisperModel(sys.argv[2] if len(sys.argv) > 2 else 'small', device='cpu', compute_type='int8', cpu_threads=2,
                     download_root=os.environ['WHISPER_DIR'])
res = {}
for f in sorted(glob.glob(sys.argv[1] + '/*.mp3')):
    n = os.path.basename(f)[:-4]; lang = 'en' if n.startswith('EN') else 'es'
    ref_h = ' '.join(EN_BEATS if lang == 'en' else ES_BEATS); ref_t = EN_TAG if lang == 'en' else ES_TAG
    segs, _ = model.transcribe(load(f), language=lang, beam_size=5, condition_on_previous_text=False, vad_filter=False)
    hyp = ' '.join(s.text.strip() for s in segs)
    R, H = norm(ref_h + ' ' + ref_t, lang), norm(hyp, lang)
    tr = norm(ref_t, lang); htail = ' '.join(H.split()[-len(tr.split()):])
    o = jiwer.process_words(R, H)
    errs = [a for a in jiwer.visualize_alignment(o, show_measures=False).split('\n') if a.strip()]
    res[n] = dict(wer=round(o.wer * 100, 1), S=o.substitutions, D=o.deletions, I=o.insertions, N=len(R.split()),
                  hyp=hyp, tag_ok=(htail == tr), tag_heard=htail, align=errs)
    print(f"{n:30s} WER {o.wer*100:4.1f}%  S{o.substitutions} D{o.deletions} I{o.insertions}  tag_ok={htail==tr} [{htail}]", flush=True)
json.dump(res, open(sys.argv[1] + '/wer.json', 'w'), indent=1, ensure_ascii=False)
