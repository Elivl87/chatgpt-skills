// Paso 16: hoja de matar con varias SCR, estimación del influjo con la SICP y Método del Perforador en dos circulaciones.
const {dpGauge,csgGauge}=require('./lib');
module.exports=(W,{run})=>{
  const res=[];W.load(W.PRESETS[0],()=>0.5);const S=W.S,c=W.c;
  // varias SCR
  S.wob=0;
  for(const spm of [40,20,30]){S.spmSet=[spm,0];run(W,60);W.recordScr()}
  res.push(['tres SCR guardadas y ordenadas por tasa',S.scrs.map(e=>e.spm).join()==='20,30,40']);
  res.push(['a mayor tasa, mayor presión',S.scrs[0].p<S.scrs[1].p&&S.scrs[1].p<S.scrs[2].p]);
  res.push(['queda seleccionada la última registrada (30 spm)',S.scrs[S.scrSel].spm===30]);
  S.spmSet=[30,0];run(W,30);const p30=S.scrs[1].p;W.recordScr();
  res.push(['repetir una tasa la reemplaza, no la duplica',S.scrs.length===3&&Math.abs(S.scrs[1].p-p30)<=5]);
  for(const spm of [50,60]){S.spmSet=[spm,0];run(W,60);W.recordScr()}
  res.push(['se conservan como máximo cuatro',S.scrs.length===4&&S.scrs[0].spm===30]);
  S.scrSel=0;const a=W.sheet(260,-1);S.scrSel=1;const b=W.sheet(260,-1);
  res.push(['la ICP usa la SCR elegida',a.icp===260+S.scrs[0].p&&b.icp===260+S.scrs[1].p&&a.icp!==b.icp]);
  S.scrSel=S.scrs.findIndex(e=>e.spm===30);
  res.push(['sin SIDPP no hay plan ni objetivo',W.setPlan('ww',-1,-1).kmw===null&&W.target()===null]);
  // influjo, cierre y estimación con la SICP
  S.spmSet=[80,0];S.wob=25;run(W,20);while(S.gain<5)run(W,1);
  S.wob=0;S.rpm=0;S.hoist=30;while(W.jointNear(c.bUpr)<4||S.off<3)run(W,1);S.hoist=0;S.spmSet=[0,0];run(W,20);
  W.act('upr');run(W,10);W.act('hcr');run(W,900);
  const sidpp=Math.round(dpGauge(S)/5)*5,sicp=Math.round(csgGauge(S)/5)*5;
  let r=W.setPlan('dm1',sidpp,sicp);
  const gasH=S.ann.filter(s=>s.gas).reduce((h,s)=>h+(s.bot-s.top),0);
  res.push(['altura estimada del influjo cerca de la real ('+r.hInf.toFixed(0)+' vs '+gasH.toFixed(0)+' ft)',Math.abs(r.hInf-gasH)/gasH<0.35]);
  res.push(['el gradiente estimado indica gas ('+r.gradInf.toFixed(2)+' psi/ft)',r.gradInf<0.2]);
  res.push(['MAASP con lodo de matar menor que con el original',r.maaspKill<(c.lot-c.mw)*0.052*c.shoe]);
  res.push(['1.ª circulación: objetivo constante = ICP',W.target()===r.icp]);
  // Método del Perforador con el perforador automático
  const hist=[];const drive=sec=>run(W,sec,()=>{hist.push([S.t,csgGauge(S)]);while(hist.length>1&&hist[1][0]<=S.t-W.geo.lag)hist.shift();
    if(hist.length%1===0&&Math.round(S.t*2)%10===0&&S.spm[0]>29){const e=dpGauge(S)+(csgGauge(S)-hist[0][1])-(75+W.target());S.chRSet=Math.max(2,Math.min(100,S.chRSet+Math.max(-1,Math.min(1,e*0.01))))}
    minOv=Math.min(minOv,S.spm[0]>29?S.bhp-S.pf:1e9)});
  let minOv=1e9;S.strokes=0;S.spmSet=[30,0];S.chRSet=30;drive(r.btsf*1.25/30*60);
  res.push(['1.ª circulación: el influjo sale con el lodo original',S.gasVol<0.01&&S.mwIn===c.mw]);
  res.push(['1.ª circulación: fondo siempre sobre balance (mín. '+minOv.toFixed(0)+' psi)',minOv>-20]);
  S.spmSet=[0,0];S.chRSet=0;run(W,120);
  res.push(['tras la 1.ª, cerrado: SIDPP ≈ SICP ≈ la SIDPP original ('+dpGauge(S).toFixed(0)+' / '+csgGauge(S).toFixed(0)+')',Math.abs(dpGauge(S)-csgGauge(S))<40&&dpGauge(S)>sidpp-30]);
  res.push(['todavía no está controlado: falta el lodo de matar',!S.killed]);
  r=W.setPlan('dm2',sidpp,sicp);S.mwIn=r.kmw;S.strokes=0;S.spmSet=[30,0];S.chRSet=30;
  run(W,20);res.push(['2.ª circulación: el objetivo arranca en ICP y baja con las emboladas',Math.abs(W.target()-r.icp)<10]);
  minOv=1e9;drive((r.stb+r.btsf)*1.2/30*60);
  res.push(['2.ª circulación: objetivo final = FCP',Math.abs(W.target()-r.fcp)<1e-9]);
  S.spmSet=[0,0];S.chRSet=0;run(W,60);S.chRSet=8;run(W,600);S.chRSet=0;run(W,60);
  res.push(['pozo controlado con el Método del Perforador',S.killed]);
  res.push(['el registro guarda el objetivo junto a las presiones',S.hist.some(h=>h[4]!=null)&&S.hist[0][4]===null]);
  return res;
};
