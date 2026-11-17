// Paso 12: guarda. Se midió que el paso de gas por el choke no produce saltos (4,2 psi por paso); mezclar densidades no lo mejoró y no se adoptó.
module.exports=(W,{run})=>{
  const res=[];W.load(W.PRESETS[0],()=>0.5);const S=W.S,c=W.c;
  while(S.gain<8)run(W,1);
  S.wob=0;S.rpm=0;S.hoist=30;while(W.jointNear(c.bUpr)<4||S.off<3)run(W,1);S.hoist=0;S.spmSet=[0,0];run(W,20);
  W.act('upr');run(W,10);W.act('hcr');run(W,600);
  S.spmSet=[30,0];S.chRSet=32;if(!('chRSet' in S))S.chR=32;
  let maxJump=0,prev=null,sawGas=false,g=0,maxPc=0;
  while(g++<40000){W.step(0.5);
    const top=S.ann[S.ann.length-1];if(top.gas)sawGas=true;
    if(prev!=null&&S.gasVol>0.01)maxJump=Math.max(maxJump,Math.abs(S.pc-prev));
    prev=S.pc;maxPc=Math.max(maxPc,S.pc);
    if(sawGas&&S.gasVol<0.01)break}
  res.push(['el gas llegó a superficie y salió por el choke',sawGas&&S.gasVol<0.01]);
  res.push(['mayor salto de presión entre pasos de 0,5 s: '+maxJump.toFixed(2)+' psi (guarda: menos de 6)',maxJump<6]);
  res.push(['valores finitos durante la salida del gas',Number.isFinite(maxPc)&&Number.isFinite(S.spp)]);
  return res;
};
