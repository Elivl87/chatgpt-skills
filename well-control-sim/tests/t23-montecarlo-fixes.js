// Defectos hallados con las 100 corridas aleatorias.
module.exports=(W,{run})=>{
  const res=[];
  // 1) Pozo somero: un poco de gas llega a superficie perforando; debe avisar, no terminar el ejercicio.
  const cfg=W.validate({...W.PRESETS[2],tvd:3940,shoe:3080,mw:9.3,kickEMW:9.7,normEMW:8.5,lot:13.1,prod:2,ahead:15});
  W.load(cfg,()=>0.5);let S=W.S,g=0,msgs=[];const pump=()=>{for(const e of S.ev)if(e.m)msgs.push(e.m);S.ev.length=0};
  while(!S.flags.gasOpen&&g++<6000){run(W,1);pump()}
  res.push(['el gas llega a la línea de flujo antes de que el pozo se descargue (venteo '+S.ventOpen.toFixed(1)+' bbl)',!!S.flags.gasOpen&&S.ventOpen<300&&S.gain<120]);
  res.push(['se avisa de lodo cortado con gas',msgs.some(m=>m.includes('cortado con gas'))]);
  res.push(['el ejercicio no termina por eso',!S.over]);
  S.wob=0;S.rpm=0;S.spmSet=[0,0];S.hoist=30;while(W.jointNear(W.c.bUpr)<4||S.off<3)run(W,1);S.hoist=0;W.act('upr');run(W,600);
  res.push(['todavía se puede cerrar el pozo y leer presiones',S.sealed&&!S.over&&S.pc>20]);
  W.load(cfg,()=>0.5);S=W.S;g=0;while(!S.over&&g++<40000)run(W,1);
  res.push(['si nunca se cierra, termina en reventón',S.over&&(S.ventOpen>300||S.gain>120)]);
  // 2) La presión de la zona sigue su gradiente: la SIDPP estabilizada es intensidad × 0,052 × profundidad del hoyo.
  W.load({...W.PRESETS[0],prod:3},()=>0.5);S=W.S;while(S.gain<5)run(W,1);
  S.wob=0;S.rpm=0;S.hoist=30;while(W.jointNear(W.c.bUpr)<4||S.off<3)run(W,1);S.hoist=0;S.spmSet=[0,0];run(W,20);W.act('upr');run(W,1800);
  const exp=0.052*(W.c.kickEMW-W.c.mw)*S.depth;
  res.push(['SIDPP estabilizada = '+S.gDp.toFixed(0)+' psi (esperada '+exp.toFixed(0)+')',Math.abs(S.gDp-exp)<3]);
  res.push(['el hoyo quedó más profundo que el tope de la zona',S.depth>S.zoneTop+2]);
  res.push(['la densidad de matar exacta equivale a la presión de poro de la zona',Math.abs(S.pfKick/(0.052*S.depth)-W.c.kickEMW)<1e-9]);
  // 3) Fragmentación: influjo continuo circulando no debe pasar del tope de baches, y conserva gas y volumen.
  W.load({...W.PRESETS[1]},()=>0.5);S=W.S;while(S.gain<5)run(W,1);
  S.wob=0;S.rpm=0;W.act('ann');W.act('hcr');S.chRSet=100;S.spmSet=[40,0];let maxS=0,ok=true;
  for(let i=0;i<7200;i++){W.step(0.5);maxS=Math.max(maxS,S.ann.length);let t=0;for(const x of S.ann)t+=x.v;if(Math.abs(t-W.geo.Va-W.geo.CW*S.pc)>0.05)ok=false}
  res.push(['máximo de baches en el anular: '+maxS+' (tope 60)',maxS<=61]);
  res.push(['se conserva el volumen del anular en todo momento',ok]);
  res.push(['valores finitos',[S.pc,S.spp,S.bhp,S.gasVol].every(Number.isFinite)]);
  return res;
};
