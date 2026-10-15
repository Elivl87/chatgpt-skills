"""QC for the A/B clips: trim, -16 LUFS normalisation (48 kHz), Whisper-small WER (production normaliser from
build_voice.py), seseo check (HF fricative energy of z/ce/ci words vs /s/ words), Resemblyzer similarity to the
reference prompt. usage: qc.py CLIPDIR"""
import json, os, re, sys
from pathlib import Path
os.environ["OMP_NUM_THREADS"] = "2"
os.environ.setdefault("HF_HOME", "/tmp/claude-0/ttdenv/hf")
AUD = Path("/home/user/chatgpt-skills/newchannel/ep/001/audio")
sys.path[:0] = [str(Path(__file__).parent), str(AUD), str(AUD.parents[2] / "engine")]
import numpy as np, soundfile as sf, librosa, pyloudnorm as pyln
import build_voice as bv
import voice as ev
from lines import LINES

D = Path(sys.argv[1]); NORM = D / "norm"; NORM.mkdir(exist_ok=True)
SR = 48000
from resemblyzer import VoiceEncoder, preprocess_wav
VE = VoiceEncoder("cpu")
def emb(x, sr):
    return VE.embed_utterance(preprocess_wav(librosa.resample(x, orig_sr=sr, target_sr=16000), 16000))
REF = {spk: emb(*sf.read(D / f"ref_{spk}.wav", dtype="float32")[::1]) for spk in ("narrator", "eli", "mila")}

def trim(x, sr, rel_db=-30.0, fr=0.02, gap=0.35, blip=0.3, tail=0.15, head=0.03):
    """Same rule for every clip: 20 ms frames above peak-30 dB are speech; a speech island shorter than 0.3 s after
    a >= 0.35 s silence at the end is a stray artefact (breath/click/babble) and is dropped. Returns x, dropped_s."""
    h = int(fr * sr)
    e = np.array([np.sqrt((x[i:i + h] ** 2).mean()) for i in range(0, len(x) - h + 1, h)])
    on = 20 * np.log10(e + 1e-9) > 20 * np.log10(e.max() + 1e-9) + rel_db
    idx = np.flatnonzero(on)
    i0, i1 = idx[0], idx[-1]
    dropped = 0.0
    while True:                       # peel stray islands off the end
        seg_end = i1
        k = i1
        while k > i0 and on[k - 1]:
            k -= 1
        j = k - 1
        while j > i0 and not on[j]:
            j -= 1
        if (seg_end - k + 1) * fr < blip and (k - j - 1) * fr >= gap and j > i0:
            dropped += (seg_end - j) * fr
            i1 = j
        else:
            break
    a = max(0, i0 * h - int(head * sr)); b = min(len(x), (i1 + 1) * h + int(tail * sr))
    y = x[a:b].copy()
    f = int(0.01 * sr); y[-f:] *= np.linspace(1, 0, f)
    return y, round(dropped, 2)


def lufs(a, sr):
    reps = int(np.ceil(1.5 * sr / max(1, len(a)))) + 1
    return pyln.Meter(sr).integrated_loudness(np.tile(a, reps) if reps > 1 else a)

def hf_peak(x, sr, t0, t1):
    a = x[int(t0 * sr): int(t1 * sr)]
    n = int(0.012 * sr)
    if len(a) < n:
        return -99.0
    S = np.abs(librosa.stft(a, n_fft=512, hop_length=n // 2)) ** 2
    f = librosa.fft_frequencies(sr=sr, n_fft=512)
    hf = S[(f >= 4000) & (f <= 11000)].sum(0)
    return float(10 * np.log10(hf.max() + 1e-12))

files = sorted(D.glob("kokoro_*.wav")) + sorted(D.glob("cb_*.wav"))
res = {}
for f in files:
    lid = f.stem.split("_")[-1]
    line = next(l for l in LINES if l[0] == lid)
    _, spk, text, tts, _ = line
    x, sr = sf.read(f, dtype="float32")
    raw_dur = len(x) / sr
    x, dropped = trim(x, sr)
    x48 = librosa.resample(x, orig_sr=sr, target_sr=SR)
    g = -16.0 - lufs(x48, SR)
    x48 = (x48 * 10 ** (g / 20)).astype(np.float32)
    pk = np.abs(x48).max()
    if pk > 0.89:                     # keep a little headroom (very short shouts)
        x48 *= 0.89 / pk
    sf.write(NORM / f"{f.stem}.wav", x48, SR, subtype="PCM_24")
    a16 = librosa.resample(x48, orig_sr=SR, target_sr=16000)
    words = bv.whisper(a16)
    hyp = " ".join(w["text"] for w in words)
    ref_t, hyp_t = bv.canon(bv.toks(text)), bv.canon(bv.toks(hyp, True))
    w = bv.wer(ref_t, hyp_t)
    r = {"line": lid, "speaker": spk, "raw_dur": round(raw_dur, 2), "stray_tail_s": dropped, "dur": round(len(x48) / SR, 2),
         "hyp": hyp, "ref_words": len(ref_t), "wer": w if not isinstance(w, tuple) else None}
    if isinstance(w, tuple):
        r["wer"], r["errors"] = w[0], w[1]
    # seseo: z / ce / ci words vs plain-s words
    zs, ss = [], []
    for wd in words:
        t = ev.strip_accents(re.sub(r"[^\w]", "", wd["text"].lower()))
        if re.search(r"z|c[ei]", t):
            zs.append((t, hf_peak(x48, SR, wd["start"], wd["end"] + 0.05)))
        elif "s" in t:
            ss.append(hf_peak(x48, SR, wd["start"], wd["end"] + 0.05))
    if zs and ss:
        r["seseo_db"] = {t: round(v - float(np.median(ss)), 1) for t, v in zs}
    r["sim_ref"] = round(float(np.dot(emb(x48, SR), REF[spk])), 3)
    res[f.stem] = r
    print(f.stem, r, flush=True)
(D / "qc.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
