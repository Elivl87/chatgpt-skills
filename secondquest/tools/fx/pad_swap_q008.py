# Engine composite (Producer OK, 2026-10-04): our 3D N64 controller over the modern one in Q008, the near hand kept on top.
# Writes a derived file; the generated original stays untouched. Usage: python3 tools/fx/pad_swap_q008.py 210 662 668 664 preview.jpg
from PIL import Image, ImageFilter
import numpy as np, sys
q=Image.open('docs/art_orders/quest/ep002_tv/results/09_floor_profile_tv.png').convert('RGBA')
pad=Image.open('public/art/ep002/props3d/n64_pad_profile.png').convert('RGBA')
pw=int(sys.argv[1]); cx=int(sys.argv[2]); cy=int(sys.argv[3]); xcut=int(sys.argv[4])
pad=pad.resize((pw,int(pad.height*pw/pad.width)),Image.LANCZOS)
a=np.asarray(q).astype(int); R,G,B,A=a[...,0],a[...,1],a[...,2],a[...,3]
skin=(R>170)&(G>110)&(G<225)&(B>70)&(B<190)&(R-B>40)&(A>200)
box=np.zeros(R.shape,bool); box[590:750,500:xcut]=True
hand=np.asarray(Image.fromarray(((skin&box)*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)))>0
hand&=box
out=q.copy(); out.alpha_composite(pad,(cx-pw//2,cy-pad.height//2))
ha=a.copy(); ha[...,3]=np.where(hand,A,0); out.alpha_composite(Image.fromarray(ha.astype(np.uint8),'RGBA'))
out.save('docs/art_orders/quest/ep002_tv/results/09_floor_profile_tv_n64pad.png')
bg=Image.new('RGBA',q.size,(120,120,130,255)); bg.alpha_composite(out); bg.crop((450,520,850,800)).resize((800,560)).convert('RGB').save(sys.argv[5])
