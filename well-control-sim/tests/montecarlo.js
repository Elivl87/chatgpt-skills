// Corridas aleatorias: node tests/montecarlo.js [N=100] [semilla=1]
// Cada corrida arma un pozo distinto y un perforador distinto (umbral de detección y margen), y controla el pozo con Esperar y Densificar.
const fs=require('fs'),path=require('path');const {loadCore,killScenario}=require('./lib');
const N=+(process.argv[2]||100);let seed=+(process.argv[3]||1);
const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296},U=(a,b)=>a+(b-a)*rnd(),pick=a=>a[Math.floor(rnd()*a.length)];
const W=loadCore(),rows=[];
for(let i=0;i<N;i++){
  const base=W.PRESETS[pick([0,0,1,2,3])],c={...base};
  c.tvd=Math.round(base.tvd*U(0.8,1.2)/10)*10;c.shoe=Math.round(c.tvd*U(0.5,0.85)/10)*10;c.dcLen=Math.round(U(300,800)/10)*10;
  c.mw=Math.round(base.mw*U(0.95,1.05)*10)/10;c.pv=Math.round(U(10,35));c.yp=Math.round(U(5,20));
  const ki=Math.round(U(0.3,1.2)*10)/10;c.kickEMW=Math.round((c.mw+ki)*10)/10;c.normEMW=Math.round((c.mw-0.8)*10)/10;
  c.lot=Math.round((c.kickEMW+U(0.8,3.5))*10)/10;c.prod=pick([1,2,2,3]);c.migr=rnd()<0.2?1:0;c.noz=pick([10,11,12,13,14]);c.ahead=Math.round(U(8,25));
  const cfg=W.validate(c),opt={margin:Math.round(U(50,150)),detect:Math.round(U(3,15))};
  const row={i,cfg,tvd:cfg.tvd,shoe:cfg.shoe,mw:cfg.mw,ki,lot:cfg.lot,prod:cfg.prod,migr:cfg.migr,...opt};
  try{const r=killScenario(W,cfg,opt),sc=W.score();
    Object.assign(row,{killed:r.killed,frac:r.frac,finite:r.finite,volErr:+r.volErr.toFixed(4),sidpp:Math.round(r.sidpp),sicp:Math.round(r.sicp),kmw:r.kmw,
      expSidpp:Math.round(0.052*ki*W.S.zoneTop),gain:+r.gainShutIn.toFixed(1),minOver:Math.round(r.minOver),maxOver:Math.round(r.maxOver),maxPc:Math.round(r.maxPc),
      lost:+W.S.lost.toFixed(1),lostShut:+(r.lostAtShutIn||0).toFixed(1),flowCheck:!!r.flowCheck,inf2:+W.S.sc.inf2.toFixed(2),score:sc.total,over:W.S.over,hours:+(r.tEnd/3600).toFixed(1),slugs:W.S.ann.length})}
  catch(e){row.error=String(e&&e.stack||e).split('\n').slice(0,2).join(' | ')}
  rows.push(row);
}
const out=path.join(process.env.MC_OUT||__dirname,'montecarlo-'+N+'.json');fs.writeFileSync(out,JSON.stringify(rows));
const ok=rows.filter(r=>!r.error),q=(k,p)=>{const v=ok.map(r=>r[k]).sort((a,b)=>a-b);return v[Math.min(v.length-1,Math.floor(p*v.length))]};
const cnt=f=>rows.filter(f).length;
console.log('corridas',N,'| errores de ejecución',cnt(r=>r.error),'| no finitos',cnt(r=>r.finite===false),'| error de volumen >0,05',cnt(r=>r.volErr>0.05));
console.log('controlados',cnt(r=>r.killed),'| zapata fracturada',cnt(r=>r.frac),'| reventón/fin',cnt(r=>r.over),'| bajo balance (<-20 psi)',cnt(r=>r.minOver<-20));
for(const k of ['gain','minOver','maxOver','maxPc','score','hours','inf2'])console.log(k.padEnd(8),'mín',q(k,0),'p25',q(k,.25),'mediana',q(k,.5),'p75',q(k,.75),'máx',q(k,.999));
console.log('SIDPP leída vs esperada: desvío máx',Math.max(...ok.map(r=>Math.abs(r.sidpp-r.expSidpp))),'psi');
console.log('KMW insuficiente:',cnt(r=>r.kmw<r.mw+r.ki-1e-9));
// "Sin tolerancia": la zapata cedió con el pozo cerrado, antes de empezar a circular. Ese pozo no se puede matar por el método convencional.
const noTol=r=>r.lostShut>0.5,able=rows.filter(r=>!r.error&&!noTol(r));
console.log('sin tolerancia al influjo (zapata cede al cerrar):',cnt(noTol),'| detectados solo con verificación de flujo:',cnt(r=>r.flowCheck));
console.log('de los',able.length,'pozos matables: controlados',able.filter(r=>r.killed).length,'| con pérdidas durante la circulación',able.filter(r=>r.frac).length,'| nota mediana',able.map(r=>r.score).sort((a,b)=>a-b)[able.length>>1]);
const bad=rows.filter(r=>r.error||r.finite===false||r.volErr>0.05||(!noTol(r)&&(!r.killed||r.minOver<-20)));
console.log('--- corridas con problema:',bad.length);for(const r of bad){const {cfg,...x}=r;console.log(JSON.stringify(x))}
