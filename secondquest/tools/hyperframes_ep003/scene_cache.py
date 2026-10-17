#!/usr/bin/env python3
"""Scene-level render cache for the EP003 blocks (Producer, 2026-10-17: "renderizar más rápido").

  python3 scene_cache.py G                 # review quality (1280x720, 30 fps): the critics' pass
  QUALITY=draft python3 scene_cache.py G   # draft: 854x480, 15 fps, for iteration rounds
  python3 scene_cache.py G --dry           # only report which scenes would re-render

1. stage + build the block (as render_block.sh);
2. fingerprint every frame (scene_fp.cjs: the real runtime seeks each frame time and hashes everything that decides its
   pixels: boxes, transforms, opacity, colours, text, image src, canvases);
3. split the block into scenes: a cut wherever the set of visible top-level clips changes, merged to >= 2 s and split
   to <= 6 s, every boundary on a frame;
4. key each scene = hash(its frames' fingerprints + the block's art/fonts/vendor files + quality + the finish pass +
   the Hyperframes version); a key in renders/scene_cache/<block>/ is reused, a missing one is rendered alone: a scene
   copy of index.html (scene_<k>.html: clips shifted by -t0, the main timeline played from t0 to t1, no audio), the
   Hyperframes render, the approved finish pass (finish_post.py), into the cache;
5. concat the finished scenes (stream copy) + the block's narration -> docs/ep003/hyperframes/EP003_block<X>.mp4
   (draft: EP003_block<X>_480p.mp4, not versioned).
The finish pass is static per frame and the composition is seek-safe, so a scene rendered alone equals the same frames
of a whole-block render (proof: docs/ep003/hyperframes/SCENE_CACHE.md)."""
import hashlib, json, math, os, re, shutil, subprocess, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
from blocks import pdir  # noqa
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
QUALITY = os.environ.get('QUALITY', 'review')
Q = {'review': {'fps': 30, 'hf': 'looks', 'crf': 16, 'size': None, 'suffix': ''},
     'draft': {'fps': 15, 'hf': 'draft', 'crf': 23, 'size': (854, 480), 'suffix': '_480p'}}[QUALITY]
MIN_S, MAX_S = 2.0, 6.0
VERSION = 'scene-cache v1'                                 # bump when the scene copy or the encode changes


def sh(*a, **k):
    return subprocess.run(a, check=True, **k)


def fingerprint(proj):
    out = HERE / f'renders/fp_{proj.name}_{QUALITY}.json'
    sh('node', str(HERE / 'scene_fp.cjs'), str(proj / 'index.html'), str(Q['fps']), str(out))
    return json.loads(out.read_text())


def scenes(fp):
    """[(f0, f1)] frame ranges: cut where the visible top-level clips change, merged >= MIN_S, split <= MAX_S"""
    fps, n = fp['fps'], fp['frames']
    cuts = [0] + [i for i in range(1, n) if fp['clips'][i] != fp['clips'][i - 1]] + [n]
    segs = []
    for a, b in zip(cuts, cuts[1:]):
        if segs and (b - a < MIN_S * fps or segs[-1][1] - segs[-1][0] < MIN_S * fps):
            segs[-1] = (segs[-1][0], b)
        else:
            segs.append((a, b))
    out = []
    for a, b in segs:
        k = max(1, -(-(b - a) // int(MAX_S * fps)))
        edges = [a + round(i * (b - a) / k) for i in range(k + 1)]
        out += list(zip(edges, edges[1:]))
    return out


def file_hash(paths):
    h = hashlib.sha256()
    for p in sorted(paths):
        h.update(str(p.name).encode()); h.update(p.read_bytes())
    return h.hexdigest()


def global_key(proj):
    files = [p for p in (proj / 'assets').rglob('*') if p.is_file() and p.suffix != '.wav']
    files += [HERE / 'finish_post.py', ROOT / 'scripts/animatic/finish.py', HERE / 'scene_cache.py']
    hv = json.loads((HERE / 'node_modules/hyperframes/package.json').read_text())['version']
    return hashlib.sha256(f'{VERSION}|{QUALITY}|{json.dumps(Q)}|hf {hv}|{file_hash(files)}'.encode()).hexdigest()


def scene_html(proj, t0, t1, dur):
    """index.html for the window t0..t1 alone: clip times shifted by -t0 (clips outside the window parked after its end),
    root duration t1-t0, the narration element removed (audio is muxed after), the main timeline played t0 -> t1."""
    src = (proj / 'index.html').read_text()
    src = re.sub(r'<audio id="vo"[^>]*></audio>', '', src)

    def shift(m):
        tag = m.group(0)
        if 'data-composition-id' in tag:
            return tag.replace(m.group(1), f'data-start="0" data-duration="{math.floor((t1 - t0) * 1e6) / 1e6}"')   # a hair under the last frame end
        s, d = float(m.group(2)), float(m.group(3))
        a, b = max(s, t0) - t0, min(s + d, t1) - t0
        if b <= a:
            a, b = (t1 - t0) + 1, (t1 - t0) + 1.001                     # outside the window: never visible in it
        return tag.replace(m.group(1), f'data-start="{round(a, 4)}" data-duration="{round(b - a, 4)}"')
    src = re.sub(r'<[^<>]*?(data-start="([\d.]+)" data-duration="([\d.]+)")[^<>]*>', shift, src)
    m = list(re.finditer(r'window\.__timelines\["main"\] = (\w+);', src))[-1]
    v = m.group(1)
    src = src[:m.start()] + (f'const __scene = gsap.timeline({{ paused: true }});   // scene_cache.py: this window only\n'
                             f'      __scene.add({v}.tweenFromTo({t0!r}, {t1!r}, {{ duration: {t1 - t0!r}, ease: "none", immediateRender: false }}), 0);\n'
                             f'      window.__timelines["main"] = __scene;') + src[m.end():]
    return src


def render_scene(proj, f0, f1, fps, dur, dst):
    t0, t1 = f0 / fps, min(f1 / fps, dur)
    name = f'scene_{f0}_{f1}.html'
    (proj / name).write_text(scene_html(proj, t0, t1, dur))
    raw = HERE / f'renders/raw_{proj.name}_{f0}.mp4'
    try:
        sh('hyperframes', 'render', '-c', name, '--fps', str(fps), '--quality', Q['hf'], '--crf', str(Q['crf']), '--workers', '4',
           '--quiet', '--output', str(raw), cwd=proj)
        if Q['size']:                                       # draft: the finish pass runs on the small frames
            small = raw.with_name(raw.stem + '_s.mp4')
            sh(FF, '-y', '-v', 'error', '-i', str(raw), '-vf', f'scale={Q["size"][0]}:{Q["size"][1]}:flags=lanczos', '-c:v', 'libx264',
               '-crf', '12', '-preset', 'veryfast', str(small))
            raw.unlink(); raw = small
        sh('python3', str(HERE / 'finish_post.py'), str(raw), str(dst), stdout=subprocess.DEVNULL)
    finally:
        raw.unlink(missing_ok=True); (proj / name).unlink(missing_ok=True)


def frames_of(p):
    out = subprocess.run(['/usr/bin/ffprobe' if Path('/usr/bin/ffprobe').exists() else 'ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries', 'stream=nb_read_frames',
                          '-of', 'csv=p=0', str(p)], capture_output=True, text=True).stdout.strip()
    return int(out or 0)


def main():
    b = sys.argv[1]
    dry = '--dry' in sys.argv
    proj = pdir(b)
    t = time.time()
    sh('python3', str(HERE / 'stage_assets.py'), '--block', b, stdout=subprocess.DEVNULL)
    sh('python3', str(HERE / 'build.py'), '--block', b, stdout=subprocess.DEVNULL)
    (HERE / 'renders').mkdir(exist_ok=True)
    fp = fingerprint(proj)
    if fp['errors']:
        print('runtime errors while fingerprinting:', fp['errors'][:3])
    t_fp = time.time() - t
    fps, dur = fp['fps'], fp['dur']
    gk = global_key(proj)
    cache = HERE / f'renders/scene_cache/{proj.name}'
    cache.mkdir(parents=True, exist_ok=True)
    plan = []
    for f0, f1 in scenes(fp):
        key = hashlib.sha256(f'{gk}|{f0}|{f1}|{"".join(fp["fp"][f0:f1])}'.encode()).hexdigest()[:20]
        plan.append((f0, f1, cache / f'{f0:05d}_{f1:05d}_{key}.mp4'))
    todo = [p for p in plan if not p[2].exists()]
    print(f'block {b} [{QUALITY}]: {fp["frames"]} frames, {len(plan)} scenes, {len(todo)} to render '
          f'({sum(f1 - f0 for f0, f1, _ in todo)} frames); fingerprint {t_fp:.0f} s')
    for f0, f1, p in plan:
        print(f'  {f0 / fps:7.2f}-{f1 / fps:7.2f} s  {"RENDER" if not p.exists() else "cached"}  {p.name}')
    if dry:
        return
    for f0, f1, p in todo:
        t1 = time.time()
        tmp = p.with_suffix('.part.mp4')
        render_scene(proj, f0, f1, fps, dur, tmp)
        got = frames_of(tmp)
        if got != f1 - f0:
            raise SystemExit(f'scene {f0}-{f1}: {got} frames, expected {f1 - f0}')
        tmp.replace(p)
        print(f'  rendered {f0 / fps:.2f}-{f1 / fps:.2f} s in {time.time() - t1:.0f} s')
    lst = HERE / f'renders/concat_{proj.name}.txt'
    lst.write_text(''.join(f"file '{p}'\n" for _, _, p in plan))
    out = ROOT / f'docs/ep003/hyperframes/EP003_block{b}{Q["suffix"]}.mp4'
    sh(FF, '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', str(lst), '-i', str(proj / 'assets' / ('narration_hook.wav' if b == 'A' else 'narration.wav')),
       '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', str(out))
    lst.unlink()
    # cache entries of scenes that changed are superseded: drop them (render intermediates only, never art)
    keep = {p.name for _, _, p in plan}
    for old in cache.glob('*.mp4'):
        if old.name not in keep and not old.name.endswith('.part.mp4'):
            old.unlink()
    print(f'-> {out.relative_to(ROOT)} ({frames_of(out)} frames) in {time.time() - t:.0f} s total')


if __name__ == '__main__':
    main()
