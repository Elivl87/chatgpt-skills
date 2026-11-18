// Carga el núcleo físico directamente desde el HTML y ofrece un "perforador automático" para las pruebas.
const fs=require('fs'),path=require('path');
const HTML=path.join(__dirname,'..','well-control-sim.html');
function loadCore(){
  const src=fs.readFileSync(HTML,'utf8');
  const a=src.indexOf('/*CORE-BEGIN*/'),b=src.indexOf('/*CORE-END*/');
  if(a<0||b<0)throw new Error('No se encontró el bloque CORE en el HTML');
  const code=src.slice(a,b).replace("if(typeof module!=='undefined')module.exports=WCS;","");
  return new Function(code+';return WCS;')();
}
// Avanza `sec` segundos de simulación; fn se llama tras cada paso.
function run(W,sec,fn,dt=0.5){for(let i=0;i<Math.round(sec/dt);i++){W.step(dt);fn&&fn()}}
// Lecturas que ve el perforador (los manómetros), con respaldo a los valores internos.
const dpGauge=S=>S.gDp??S.spp, csgGauge=S=>S.gCp??S.pc;
// Ejercicio completo: SCR, influjo, espaciado, cierre con rams superiores, Esperar y Densificar.
function killScenario(W,preset,opt={}){
  W.load(typeof preset==='number'?W.PRESETS[preset]:preset,()=>0.5);
  const S=W.S,c=W.c,r={};
  S.wob=0;S.spmSet=[30,0];run(W,60);W.recordScr();r.scr=(S.scrs?S.scrs[S.scrs.length-1]:S.scr).p;
  S.spmSet=[80,0];S.wob=25;run(W,20);
  // Detección: por ganancia, o al llegar a la profundidad final con una verificación de flujo con bombas paradas.
  let guard=0;while(S.gain<(opt.detect??5)&&!S.flags.tdMax&&!S.over&&guard++<14400)run(W,1);
  r.tKick=S.t;r.detected=S.gain>=(opt.detect??5);
  S.wob=0;S.rpm=0;S.hoist=30;
  guard=0;while((W.jointNear(c.bUpr)<4||S.off<3)&&guard++<400)run(W,1);
  S.hoist=0;S.spmSet=[0,0];run(W,20);
  if(!r.detected){const g0=S.gain;run(W,180);r.flowCheck=S.gain-g0>0.5;r.detected=r.flowCheck}
  W.act('upr');run(W,10);W.act('hcr');
  // Lectura de presiones de cierre, mirando los dos manómetros cada 2 min (mínimo 6 min, máximo 4 h):
  //  - estables: ninguno cambia más de 2 psi;
  //  - o con migración de gas: ya pasó la subida rápida y ambos suben a ritmo lento y constante. Ahí se lee, sin esperar más.
  {let pd=dpGauge(S),pc=csgGauge(S),dPrev=null,dMax=0;
   for(let k=0;k<120;k++){run(W,120);const dd=dpGauge(S)-pd,dc=csgGauge(S)-pc;pd=dpGauge(S);pc=csgGauge(S);dMax=Math.max(dMax,Math.abs(dc));
     if(k>=2&&pd>0){if(Math.abs(dd)<2&&Math.abs(dc)<2)break;
       if(dPrev!=null&&dc>0&&Math.abs(dc-dPrev)<0.15*dc+1&&dc<0.3*dMax&&Math.abs(dd-dc)<0.3*dc+2)break}
     dPrev=dc}}
  if(opt.wait!=null)run(W,opt.wait);
  r.gainShutIn=S.gain;r.sidpp=dpGauge(S);r.sicp=csgGauge(S);r.lostAtShutIn=S.lost;
  const sh=W.sheet(Math.round(r.sidpp/5)*5,Math.round(r.sicp/5)*5);r.kmw=sh.kmw;r.icp=sh.icp;r.fcp=sh.fcp;
  const setCh=v=>{if('chRSet' in S)S.chRSet=v;else S.chR=v},getCh=()=>('chRSet' in S?S.chRSet:S.chR);
  const margin=opt.margin??75,lag=W.geo.lag??0,every=opt.every??10;
  let n=0;const cpHist=[];r.minOver=1e9;r.maxOver=-1e9;r.maxShoe=0;
  const track=()=>{n++;cpHist.push([S.t,csgGauge(S)]);while(cpHist.length>1&&cpHist[1][0]<=S.t-lag)cpHist.shift();
    r.minOver=Math.min(r.minOver,S.bhp-S.pf);r.maxOver=Math.max(r.maxOver,S.bhp-S.pf);r.maxShoe=Math.max(r.maxShoe,S.shoe)};
  // Mantener el revestidor en un valor con el choke (arranque y parada de bomba).
  let ePrev=null;const holdCsg=tgt=>{track();if(n%4===0){const e=csgGauge(S)-tgt,de=ePrev==null?0:e-ePrev;ePrev=e;   // corrige por el error y por su tendencia, para no pasarse
    setCh(Math.max(0,Math.min(100,getCh()+Math.max(-2,Math.min(2,e*0.004+de*0.06)))))}};
  // Arranque: bomba a la tasa de matar manteniendo constante la presión del revestidor (SICP + margen).
  S.mwIn=sh.kmw;S.strokes=0;S.spmSet=[30,0];setCh(0);   // choke cerrado: se abre solo cuando la bomba ya subió la presión
  const cp0=r.sicp+margin;run(W,30+lag*1.5,()=>holdCsg(cp0));
  // Circulación: juzga la tubería y le suma lo que el revestidor ya cambió durante el retardo, para no corregir dos veces.
  const ctl=()=>{track();
    const tg=margin+sh.icp+(sh.fcp-sh.icp)*Math.min(1,S.strokes/sh.stb);
    if(n%every===0){const e=dpGauge(S)+(csgGauge(S)-cpHist[0][1])-tg;setCh(Math.max(2,Math.min(100,getCh()+Math.max(-1,Math.min(1,e*(opt.gain??0.01))))))}};
  run(W,(sh.stb+sh.btsf)*1.25/30*60,ctl);
  // Parada: bajar la bomba manteniendo el revestidor, cerrar el choke, y purgar la presión atrapada por etapas.
  const cpEnd=csgGauge(S);S.spmSet=[0,0];run(W,12,()=>holdCsg(cpEnd));setCh(0);run(W,60);
  for(let k=0;k<12&&csgGauge(S)>10;k++){const before=csgGauge(S);setCh(6);run(W,20);setCh(0);run(W,60+lag);if(csgGauge(S)>before-3)break}
  setCh(6);run(W,300);setCh(0);run(W,60);
  r.killed=S.killed;r.frac=!!S.flags.frac;r.maxPc=S.maxPc;r.tEnd=S.t;r.finalPc=S.pc;r.gasLeft=S.gasVol;
  let tot=0;for(const s of S.ann)tot+=s.v;r.volErr=Math.abs(tot-W.geo.Va-(W.geo.CW??0.0015)*S.pc);
  r.finite=[S.spp,S.pc,S.bhp,S.gain,S.shoe].every(Number.isFinite);
  return r;
}
module.exports={loadCore,run,killScenario,dpGauge,csgGauge,HTML};
