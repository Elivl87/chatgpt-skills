"""Emotional direction layer for the Chatterbox narrator (Diez Mil Puntos, EP001).

Maps every sentence of the locked script to a *delivery profile* and turns it into Chatterbox settings
(exaggeration / cfg_weight / temperature), a pace (atempo factor), pauses before/after and a gain. The text itself is
never changed (locked script, word for word); only its TTS punctuation may be adapted (`tts`), as the Kokoro build did.

Sources: the script's own notes per beat (emotion / rhythm / gag structure: preparación → golpe → pausa → reacción),
punctuation (? ! … :), sentence length, and the Producer's rule for the character lines read by the narrator
(2026-10-23): Eli = louder, impatient; Mila = calmer, softer; no cartoon voices; a short breath before and after.

Chatterbox notes: exaggeration ↑ = more emotion (and a faster, more variable delivery; above ~0.8 it hallucinates more
→ more retries); cfg_weight ↓ = freer, faster pacing (Resemble: lower cfg to ~0.3 when exaggeration is high);
temperature ↑ = more variety between takes.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

# name: exaggeration, cfg_weight, temperature, speed (atempo), pause_before (s), pause_scale (x PUNCT_PAUSE), gain_db
PROFILES = {
    "calm":      dict(ex=0.50, cfg=0.50, temp=0.70, speed=0.95, before=0.00, pscale=1.15, gain=0.0),
    "curious":   dict(ex=0.60, cfg=0.40, temp=0.80, speed=0.98, before=0.00, pscale=1.00, gain=0.0),
    "warm":      dict(ex=0.60, cfg=0.45, temp=0.75, speed=0.95, before=0.00, pscale=1.10, gain=0.0),
    "building":  dict(ex=0.70, cfg=0.35, temp=0.80, speed=1.00, before=0.00, pscale=0.85, gain=0.0),
    "surprised": dict(ex=0.80, cfg=0.30, temp=0.85, speed=1.00, before=0.10, pscale=1.00, gain=0.5),
    "urgent":    dict(ex=0.85, cfg=0.30, temp=0.80, speed=1.03, before=0.00, pscale=0.80, gain=1.0),
    "deadpan":   dict(ex=0.55, cfg=0.50, temp=0.70, speed=0.92, before=0.45, pscale=1.30, gain=0.0),
    "question":  dict(ex=0.65, cfg=0.40, temp=0.80, speed=0.95, before=0.15, pscale=1.20, gain=0.0),
    "intimate":  dict(ex=0.55, cfg=0.50, temp=0.70, speed=0.92, before=0.20, pscale=1.20, gain=-1.0),
    # character lines, read by the narrator (storyteller): the same voice, a light change of delivery
    "eli":       dict(ex=0.90, cfg=0.30, temp=0.85, speed=1.03, before=0.30, pscale=1.00, gain=2.5, breath=0.30),
    "eli_hurt":  dict(ex=0.75, cfg=0.40, temp=0.80, speed=0.93, before=0.30, pscale=1.00, gain=1.0, breath=0.30),
    "mila":      dict(ex=0.45, cfg=0.55, temp=0.70, speed=0.92, before=0.30, pscale=1.10, gain=-2.0, breath=0.30),
}

# Beat-level default profile for the narrator (from the script's tone per beat).
BEAT_DEFAULT = {
    "01": "curious", "02": "building", "03": "curious", "04": "warm", "06": "curious", "07": "building",
    "08": "warm", "09": "calm", "10": "curious", "11": "curious", "12": "curious", "13": "warm", "14": "question",
    "15": "curious", "16": "warm", "17": "curious", "18": "warm", "19": "curious", "20": "curious", "21": "building",
    "22": "curious", "23": "intimate", "24": "warm", "end": "warm",
}

# Sentence-level overrides (exact sentence text from the locked script → profile[, tts punctuation]).
OVERRIDES = {
    # beat 1: a quiet, intriguing opening; "Una sola vez. Apenas un poquito." are the setup, said small
    "Una carretera despejada.": "calm",
    "Allá adelante, un conductor toca el freno.": "curious",
    "Una sola vez.": "deadpan",
    "Apenas un poquito.": "intimate",
    # beat 2: the wave builds and breaks on Eli
    "Detrás, cada auto frena un poco más fuerte que el anterior.": "building",
    "Más fuerte. Más fuerte… hasta que alguien se queda quieto: Eli.": "urgent",
    # beat 3: amused storyteller, then the mystery
    "Eli está seguro: alguien allá adelante tiene la culpa.": "warm",
    "Pero allá no hay nada.": "surprised",
    "Ni choque, ni conos, ni semáforo.": ("deadpan", "Ni choque… ni conos… ni semáforo."),
    # beat 4
    "Mila, su amiga, mira atrás.": "warm",
    "Entonces, ¿por qué hay embotellamientos sin razón aparente?": "question",
    # beat 9: slow down, then the chain reaction builds
    "Vamos más despacio.": "calm",
    "Estiremos el círculo hasta volverlo una línea recta.": "calm",
    "El primer conductor toca el freno.": "curious",
    "El segundo lo nota un instante tarde.": "building",
    "En ese instante ya se acercó, así que tiene que frenar un poco más fuerte.": "building",
    "El tercero, más tarde y más fuerte todavía.": "urgent",
    "Para el auto número diez: alto total.": "deadpan",
    # beat 13: the dinner punchline
    "Ese conductor ya llegó a su casa.": "warm",
    "Seguro ya está cenando.": "deadpan",
    "Por eso no ves ninguna razón: la razón ya se fue a cenar.": "deadpan",
    # other punchlines of the episode (so the full re-render lands them too)
    "Es una ola.": "deadpan",
    "Un embotellamiento no es un lugar.": "intimate",
    "Tres autos de más.": "deadpan",
    "En una pista vacía.": "deadpan",
    "La ola volvió.": "surprised",
    "Ser paciente no es ir lento.": "intimate",
    "Es ir al promedio.": "deadpan",
    "Por una vez, llegar tarde es la jugada.": "deadpan",
    "Una sola persona paciente.": "intimate",
    "Ojo: no es magia.": "surprised",
    "Es complicado.": "deadpan",
    "La ola se derritió.": "surprised",
}

# character line overrides (speaker, text) → profile[, tts]
CHAR_OVERRIDES = {
    ("eli", "¿Qué?"): ("eli_hurt", "¿Qué…?"),
    ("eli", "¿Ni un perdón?"): "eli_hurt",
    ("eli", "…Fue el viento."): "eli_hurt",
    ("eli", "¡¿Quién f…?"): "eli",
    ("mila", "Eli… va para atrás."): ("mila", "Eli. Va para atrás."),
}


def split_directed(line):
    """Narrator line → sentence groups for per-sentence direction. Splits at . ! ? … only before a new sentence
    (capital / ¡ ¿), so "Más fuerte… hasta que" stays whole; tiny sentences (< 3 words) join the NEXT sentence (the
    autoregressive model hallucinates on tiny inputs), e.g. "Más fuerte. Más fuerte… hasta que alguien se queda quieto: Eli."."""
    sents = [x.strip() for x in re.split(r"(?<=[.!?…])\s+(?=[A-ZÁÉÍÓÚÑ¡¿«\"])", line.strip()) if x.strip()]
    out, carry = [], ""
    for x in sents:
        x = f"{carry} {x}".strip()
        carry = ""
        if len(re.findall(r"\w+", x)) < 3:
            carry = x
        else:
            out.append(x)
    if carry:
        if out:
            out[-1] = f"{out[-1]} {carry}"
        else:
            out.append(carry)
    return out


def _entry(v):
    return (v, None) if isinstance(v, str) else (v[0], v[1])


def auto_profile(text, beat="", speaker="narrator"):
    """Heuristic profile from punctuation / length when a sentence has no override."""
    t = text.strip()
    if speaker == "eli":
        return "eli_hurt" if ("?" in t and "!" not in t) else "eli"
    if speaker == "mila":
        return "mila"
    nw = len(re.findall(r"\w+", t))
    if t.endswith("?"):
        return "question"
    if "!" in t:
        return "surprised"
    if t.endswith("…"):
        return "building"
    if nw <= 4:
        return "deadpan"
    if re.match(r"^(Vamos|Ahora|Entonces|Pero)\b", t):
        return "calm" if t.startswith("Vamos") else "curious"
    return BEAT_DEFAULT.get(beat, "curious")


def direct(text, beat="", speaker="narrator"):
    """-> dict(profile, tts, ex, cfg, temp, speed, before, pscale, gain, breath)."""
    t = text.strip()
    tts = None
    if speaker != "narrator" and (speaker, t) in CHAR_OVERRIDES:
        prof, tts = _entry(CHAR_OVERRIDES[(speaker, t)])
    elif speaker == "narrator" and t in OVERRIDES:
        prof, tts = _entry(OVERRIDES[t])
    else:
        prof = auto_profile(t, beat, speaker)
    p = dict(PROFILES[prof])
    p.setdefault("breath", 0.0)
    return {"profile": prof, "tts": tts or t, **p}


if __name__ == "__main__":
    import sys
    for s in sys.argv[1:]:
        print(json.dumps(direct(s), ensure_ascii=False))
