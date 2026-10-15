#!/usr/bin/env python3
"""Build Rig Inspection Pocket 2.1 as one offline HTML file.

usage: build.py <original_V2_0_OFFLINE.html> <fonts_dir> <out.html>

The manual scans, OCR and editorial data are taken from the V2.0 file
(they are not stored in this repository); src/ holds the new interface.
"""
import base64, json, os, re, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'src')
VERSION = '2.1'
FONTS = [('Barlow Condensed', w, f'barlow-condensed-latin-{w}-normal.woff2') for w in (500, 600, 700)] + \
        [('IBM Plex Sans', w, f'ibm-plex-sans-latin-{w}-normal.woff2') for w in (400, 500, 600)] + \
        [('IBM Plex Mono', w, f'ibm-plex-mono-latin-{w}-normal.woff2') for w in (400, 500)]

SKIP = re.compile(r'programa especializado|m\S{0,2}dulo\s*[ivxlt1!|]{1,4}\s*\.|ace\s*int|aceint|^ace\b|rig inspection|^\W*$', re.I)


def sentence(line):
    letters = [c for c in line if c.isalpha()]
    if letters and sum(c.isupper() for c in letters) / len(letters) > .8:
        words = line.split()
        out = []
        for i, w in enumerate(words):
            keep = (len(w) <= 4 and w.isalpha() and w.isupper() and w not in ('DE', 'DEL', 'LA', 'EL', 'LOS', 'LAS', 'Y', 'EN', 'CON', 'POR', 'PARA', 'QUE', 'UNA', 'UN', 'SUS', 'AL', 'O')) or any(c.isdigit() for c in w)
            out.append(w if keep else w.lower())
        line = ' '.join(out)
        line = line[:1].upper() + line[1:]
    return line


def page_title(text):
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    lines = [l for l in lines if not SKIP.search(l) and len(re.sub(r'[^A-Za-zÁÉÍÓÚÑáéíóúñ]', '', l)) >= 5]
    if not lines:
        return 'Lámina gráfica'
    t = lines[0]
    if t.isupper() and len(lines) > 1 and lines[1].isupper() and len(t) + len(lines[1]) < 70:
        t += ' ' + lines[1]
    t = re.sub(r'^[^A-Za-zÁÉÍÓÚÑ¿¡0-9]+', '', t)
    t = re.sub(r'[\s|_·:;,.-]+$', '', t)
    return sentence(t)[:80]


def clean(raw):
    d = dict(raw)
    v2_date = '14 de octubre de 2026'
    # API: apply the 14-Oct check without leaving stale fields from the older edition
    for a in d['api']:
        ck = raw['apiCheck'].get(a['code'])
        if not ck:
            continue
        a['check'] = {'date': v2_date, 'what': ck['what'], 'source': ck['source'], 'edition': ck['edition']}
        if ck['edition'] != a['edition']:
            a['edition'] = ck['edition']
            a['edition_date'] = None
            a['development'] = None
            a['changes'] = f"Reconfirmar adendas y erratas de la {ck['edition']} en el registro oficial API."
        if a['code'] == 'API Spec 16C':
            a['changes'] = 'Adenda 1 (julio 2024) y errata 3 (diciembre 2025), publicadas según API.'
    for c in d['colombia']:
        if c['id'] in raw['coReg']:
            c['reg'] = raw['coReg'][c['id']]
    # Evidence: one list. V1.4 checks are kept only where V1.8 has no entry for that fiche/page.
    sysof = {r['id']: r['system'] for r in d['records']}
    ev = [dict(e) for e in raw['evidence']]
    for v in raw['verified']:
        if any(e['page'] in v['pages'] and v['topic'] in e['ids'] for e in ev):
            continue
        ev.append({'ids': [v['topic']], 'page': v['pages'][0], 'title': v['title'], 'point': v['claim'],
                   'basis': 'Lámina' + ('s ' + ', '.join(map(str, v['pages'])) if len(v['pages']) > 1 else ' ' + str(v['pages'][0])),
                   'type': 'Cotejo visual de lámina'})
    ev.sort(key=lambda e: (e['page'], e['title']))
    for i, e in enumerate(ev, 1):
        e['id'] = f'e{i:02d}'
        e['system'] = sysof.get(e['ids'][0], 'fund')
    d['evidence'] = ev
    d['pageTitles'] = [page_title(t) for t in d['ocr']]
    d['meta'] = {'apiReview': '13 de octubre de 2026', 'coReview': '13 de octubre de 2026', 'v2Date': v2_date,
                 'links': {'catalog': 'https://www.api.org/products-and-services/standards/digital-catalog',
                           'errata': 'https://www.api.org/products-and-services/standards/addenda-and-errata',
                           'anh': 'https://www.anh.gov.co/es/normatividad2/normatividad/'}}
    for k in ('apiCheck', 'coReg', 'verified', 'standards'):
        d.pop(k, None)
    return d


def main(original, fonts_dir, out):
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(['node', os.path.join(HERE, 'extract.js'), original, tmp], check=True, stdout=subprocess.DEVNULL)
        raw = json.load(open(os.path.join(tmp, 'data.raw.json'), encoding='utf-8'))
        images = json.load(open(os.path.join(tmp, 'images.json')))
    data = clean(raw)
    css = open(os.path.join(SRC, 'app.css'), encoding='utf-8').read()
    js = open(os.path.join(SRC, 'app.js'), encoding='utf-8').read()
    tpl = open(os.path.join(SRC, 'index.html'), encoding='utf-8').read()
    faces = []
    for fam, w, fn in FONTS:
        b = base64.b64encode(open(os.path.join(fonts_dir, fn), 'rb').read()).decode()
        faces.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:swap;src:url(data:font/woff2;base64,{b}) format('woff2')}}")
    blob = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    imgs = '\n'.join(f'<script type="text/plain" id="img-{n}">{images[str(n)]}</script>' for n in range(1, len(data['ocr']) + 1))
    html = (tpl.replace('{{VERSION}}', VERSION).replace('{{FONTS}}', '\n'.join(faces)).replace('{{CSS}}', css)
            .replace('{{DATA}}', blob).replace('{{IMAGES}}', imgs).replace('{{JS}}', js))
    open(out, 'w', encoding='utf-8').write(html)
    print(f'{out}: {len(html.encode())/1e6:.1f} MB · {len(data["records"])} fichas · {len(data["evidence"])} cotejos · {len(images)} láminas')


if __name__ == '__main__':
    main(*sys.argv[1:4])
