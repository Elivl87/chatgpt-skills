"""Parse the LOCKED script ep/001/SCRIPT_ES419.md into ordered voice segments (word for word, never edited here)."""
import re
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "SCRIPT_ES419.md"


def _clean(s: str) -> str:
    s = re.sub(r"\s*(\[\d+\])+\s*$", "", s.strip())      # source refs [3][2]
    return s.strip()


def parse_episode(path=SCRIPT):
    """-> list of dict(beat, speaker, text). Beat ids '01'..'24', 'end'. Pause markers -> speaker 'pause'."""
    lines = path.read_text(encoding="utf-8").splitlines()
    segs, beat = [], None
    for ln in lines:
        m = re.match(r"^### Beat (\d+) ·", ln)
        if m:
            beat = f"{int(m.group(1)):02d}"
            continue
        if ln.startswith("### Pantalla final"):
            beat = "end"
            continue
        if ln.startswith("## SOLO NARRACI"):
            break
        if beat is None or not ln.startswith(">"):
            continue
        body = ln[1:].strip()
        if not body:
            continue
        m = re.match(r"^\*\*(ELI|MILA):\*\*\s*(.+)$", body)
        if m:
            segs.append({"beat": beat, "speaker": m.group(1).lower(), "text": _clean(m.group(2))})
        elif re.match(r"^\*\(.*\)\*$", body):
            segs.append({"beat": beat, "speaker": "pause", "text": body.strip("*()")})
        else:
            segs.append({"beat": beat, "speaker": "narrator", "text": _clean(body)})
    return segs


def solo_narration(path=SCRIPT):
    t = path.read_text(encoding="utf-8")
    block = t.split("## SOLO NARRACI", 1)[1].split("\n---", 1)[0]
    block = block.split("\n", 1)[1].replace("*(Pantalla final)*", "")
    return " ".join(block.split())


def parse_short(path=SCRIPT):
    t = path.read_text(encoding="utf-8")
    m = re.search(r"Texto completo \(\d+ palabras\): \*(.+?)\*\n", t, re.S)
    parts = [p.strip() for p in " ".join(m.group(1).split()).split(" / ")]
    segs = []
    for p in parts:
        mm = re.match(r"^(ELI|MILA): (.+)$", p)
        if mm:
            segs.append({"beat": "S", "speaker": mm.group(1).lower(), "text": mm.group(2)})
        else:
            segs.append({"beat": "S", "speaker": "narrator", "text": p})
    return segs


if __name__ == "__main__":
    segs = parse_episode()
    for i, s in enumerate(segs):
        print(i, s["beat"], s["speaker"], "|", s["text"])
    narr = " ".join(s["text"] for s in segs if s["speaker"] == "narrator")
    solo = solo_narration()
    print("narration == SOLO NARRACIÓN:", narr == solo, len(narr.split()), len(solo.split()))
    if narr != solo:
        a, b = narr.split(), solo.split()
        for k, (x, y) in enumerate(zip(a, b)):
            if x != y:
                print("first diff at word", k, a[k-3:k+4], b[k-3:k+4]); break
    for s in parse_short():
        print("SHORT", s["speaker"], "|", s["text"])
