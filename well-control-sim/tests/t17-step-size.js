// Paso 17: con paso fino (0,1 s, usado a 1× y 5×) la física da lo mismo que con paso de 0,5 s.
module.exports=(W,{run})=>{
  const out={};
  for(const dt of [0.5,0.1]){
    W.load(W.PRESETS[0],()=>0.5);const S=W.S,c=W.c;
    while(S.gain<5)run(W,1,null,dt);
    S.wob=0;S.rpm=0;S.hoist=30;while(W.jointNear(c.bUpr)<4||S.off<3)run(W,1,null,dt);S.hoist=0;S.spmSet=[0,0];run(W,20,null,dt);
    W.act('upr');run(W,10,null,dt);W.act('hcr');run(W,900,null,dt);
    const sh={sidpp:S.gDp,sicp:S.gCp,gain:S.gain,t:S.t};
    S.spmSet=[30,0];S.chRSet=30;run(W,1200,null,dt);
    out[dt]={...sh,pc:S.pc,spp:S.spp,gas:S.gasVol};
  }
  const a=out[0.5],b=out[0.1],rel=(x,y)=>Math.abs(x-y)/Math.max(1,Math.abs(x));
  return [['SIDPP igual con ambos pasos ('+a.sidpp.toFixed(0)+' / '+b.sidpp.toFixed(0)+')',rel(a.sidpp,b.sidpp)<0.01],
    ['SICP igual ('+a.sicp.toFixed(0)+' / '+b.sicp.toFixed(0)+')',rel(a.sicp,b.sicp)<0.03],
    ['ganancia al cierre igual ('+a.gain.toFixed(2)+' / '+b.gain.toFixed(2)+')',rel(a.gain,b.gain)<0.05],
    ['tras 20 min circulando, presiones y gas coinciden',rel(a.pc,b.pc)<0.03&&rel(a.spp,b.spp)<0.03&&rel(a.gas,b.gas)<0.03]];
};
