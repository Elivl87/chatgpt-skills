import onnxruntime as ort, numpy as np, time, sys
from PIL import Image
sess=ort.InferenceSession("da2s.onnx",providers=["CPUExecutionProvider"])
inp=sess.get_inputs()[0]; print(inp.name, inp.shape)
src=sys.argv[1]; im=Image.open(src).convert("RGB"); print(im.size)
for H in (518, 1036):
    W=int(round(im.width/im.height*H/14))*14
    x=np.asarray(im.resize((W,H),Image.BICUBIC),dtype=np.float32)/255
    x=(x-[0.485,0.456,0.406])/[0.229,0.224,0.225]
    x=x.transpose(2,0,1)[None].astype(np.float32)
    t=time.time(); d=sess.run(None,{inp.name:x})[0]; dt=time.time()-t
    d=d.squeeze(); d=(d-d.min())/(d.max()-d.min())
    Image.fromarray((d*255).astype(np.uint8)).resize(im.size).save(f"depth_{H}.png")
    print(H,W,"sec",round(dt,2))
