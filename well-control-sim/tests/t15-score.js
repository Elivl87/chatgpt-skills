// Paso 15: calificación. Un control bien hecho saca nota alta; los errores bajan el rubro que corresponde.
module.exports=(W,{run,killScenario})=>{
  const res=[];
  killScenario(W,0);let r=W.score();
  res.push(['control correcto: '+r.total+' puntos (≥ 90)',r.done&&r.total>=90]);
  res.push(['los rubros suman el total',r.items.reduce((a,i)=>a+i.pts,0)===r.total&&r.items.reduce((a,i)=>a+i.max,0)===100]);
  killScenario(W,2);r=W.score();
  res.push(['margen estrecho con pérdidas: la zapata pierde puntos',r.items[2].pts<20&&r.total<100]);
  // Cierre tardío, sin SCR, cerrando rams sobre una unión.
  W.load(W.PRESETS[0],()=>0.5);const S=W.S,c=W.c;
  while(S.gain<22)run(W,1);S.wob=0;S.rpm=0;S.spmSet=[0,0];run(W,10);
  S.hoist=10;while(W.jointNear(c.bUpr)>=1.4)run(W,0.5);S.hoist=0;W.act('upr');run(W,10);
  res.push(['los rams cerraron sobre una unión',S.sc.badRam===1&&!S.sealed]);
  W.act('upr');run(W,10);W.act('ann');run(W,30);r=W.score();
  res.push(['cierre tardío: pocos puntos en detección ('+r.items[0].pts+')',r.items[0].pts<=12]);
  res.push(['procedimiento descuenta la unión y la SCR faltante ('+r.items[3].pts+')',r.items[3].pts===6]);
  res.push(['sin terminar: nota limitada a 50',!r.done&&r.total<=50]);
  // Dejar el pozo bajo balance después del cierre: purgar por el choke mete más influjo.
  W.act('hcr');S.chRSet=40;run(W,600);r=W.score();
  res.push(['purgar con el pozo cerrado registra influjo adicional ('+S.sc.inf2.toFixed(1)+' bbl)',S.sc.inf2>2&&r.items[1].pts<=8]);
  // Reventón.
  W.load(W.PRESETS[0],()=>0.5);let g=0;while(!W.S.over&&g++<40000)run(W,1);r=W.score();
  res.push(['reventón: procedimiento en cero y nota baja ('+r.total+')',r.items[3].pts===0&&r.total<=50]);
  // Antes del influjo.
  W.load(W.PRESETS[0],()=>0.5);run(W,10);r=W.score();
  res.push(['antes del influjo no hay puntos de detección ni errores de formato',r.items[0].pts===0&&Number.isFinite(r.total)]);
  return res;
};
