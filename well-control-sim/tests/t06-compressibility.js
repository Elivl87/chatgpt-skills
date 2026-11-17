// Paso 6: la compresibilidad del pozo escala con su volumen (un pozo chico es más rígido).
module.exports=(W,{run})=>{
  const res=[];const rate={};
  for(const i of [2,0,3]){
    W.load(W.PRESETS[i],()=>0.5);const S=W.S,g=W.geo;
    res.push(['ej'+i+': CW proporcional al volumen',Math.abs(g.CW-3e-6*(g.Va+g.Vs))<1e-9]);
    S.wob=0;S.rpm=0;S.spmSet=[0,0];run(W,30);W.act('ann');run(W,20);
    const s0=S.strokes,p0=S.pc;S.spmSet=[5,0];run(W,20);S.spmSet=[0,0];run(W,10);
    const dV=(S.strokes-s0)*g.STK,dP=S.pc-p0;rate[i]=dP/dV;
    res.push(['ej'+i+': sin gas, bombear al pozo cerrado sube 1/CW psi por barril',Math.abs(dP/dV-1/g.CW)/(1/g.CW)<0.05]);
  }
  res.push(['el pozo somero es más rígido que el intermedio',rate[2]>rate[0]*1.5]);
  return res;
};
