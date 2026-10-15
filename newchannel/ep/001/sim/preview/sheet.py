"""sheet.py DIR ID...: contact sheet sim_previews_small.jpg (<= 400 KB) from DIR/ID.png."""
import io, sys, os
from PIL import Image
d, ids = sys.argv[1], sys.argv[2:]
ims = [Image.open(os.path.join(d, i + '.png')).convert('RGB') for i in ids if os.path.exists(os.path.join(d, i + '.png'))]
cols, w = 4, 500
h = round(ims[0].height * w / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * h), (17, 17, 17))
for k, im in enumerate(ims): sheet.paste(im.resize((w, h), Image.LANCZOS), ((k % cols) * w, (k // cols) * h))
for q in (85, 78, 70, 62, 55, 48):
    b = io.BytesIO(); sheet.save(b, 'JPEG', quality=q, optimize=True, progressive=True)
    if b.tell() <= 400_000: break
open(os.path.join(d, 'sim_previews_small.jpg'), 'wb').write(b.getvalue()); print('sheet', sheet.size, q, b.tell())
