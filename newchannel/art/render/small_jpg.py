"""small_jpg.py in.png out.jpg [max_bytes=400000] [width=1600]: a light JPG preview for the Producer's phone."""
import io, sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
limit = int(sys.argv[3]) if len(sys.argv) > 3 else 400_000
w = int(sys.argv[4]) if len(sys.argv) > 4 else 1600
im = Image.open(src).convert("RGB")
if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
for q in (88, 84, 80, 76, 72, 68, 64, 60, 55, 50):
    b = io.BytesIO(); im.save(b, "JPEG", quality=q, optimize=True, progressive=True)
    if b.tell() <= limit: break
open(dst, "wb").write(b.getvalue()); print(dst, im.size, q, b.tell())
