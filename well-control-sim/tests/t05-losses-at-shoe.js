// Paso 5: cuando la zapata se fractura, el lodo perdido sale del anular a la altura de la zapata y no por superficie.
module.exports=(W,{run})=>{
  const res=[];W.load(W.PRESETS[4],()=>0.5);const S=W.S,c=W.c,Va=W.geo.Va;
  S.wob=0;S.rpm=0;S.spmSet=[0,0];run(W,30);
  // Tres baches marcados por densidad: A en el fondo, B cruzando la zapata, C arriba hasta superficie.
  const cap=W.geo.annSecs[W.geo.annSecs.length-1].cap, vTop=(c.shoe-1500)*cap, vMid=3000*cap;   // B queda de zapata-1500 ft hasta debajo de la zapata
  S.ann=[{gas:false,rho:c.mw,v:Va-vTop-vMid},{gas:false,rho:c.mw+0.02,v:vMid},{gas:false,rho:c.mw+0.04,v:vTop}];
  W.act('ann');run(W,20);
  res.push(['pozo cerrado con el anular',S.sealed]);
  const B0=S.ann[1].v,C0=S.ann[2].v,g0=S.gain,s0=S.strokes;
  S.spmSet=[10,0];let g=0;while(!S.flags.frac&&g++<3000)run(W,1);
  res.push(['bombear contra el pozo cerrado fractura la zapata',!!S.flags.frac]);
  run(W,300);
  const B=S.ann.find(s=>Math.abs(s.rho-(c.mw+0.02))<0.005),C=S.ann.find(s=>Math.abs(s.rho-(c.mw+0.04))<0.005);
  res.push(['hay volumen perdido registrado',S.lost>1]);
  res.push(['el bache de superficie no pierde volumen',Math.abs(C.v-C0)<0.02]);
  res.push(['el bache frente a la zapata sí lo pierde',B0-B.v>S.lost*0.9]);
  res.push(['la presión en la zapata queda limitada cerca de la de fractura',S.shoe<c.frac+250]);
  const pumped=(S.strokes-s0)*W.geo.STK;
  res.push(['nada retorna a tanques: la ganancia baja lo bombeado',Math.abs((g0-S.gain)-pumped)<0.3]);
  let tot=0;for(const s of S.ann)tot+=s.v;
  res.push(['se conserva el volumen del anular',Math.abs(tot-Va-(W.geo.CW??0.0015)*S.pc)<0.05]);
  return res;
};
