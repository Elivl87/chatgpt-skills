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
  let guard=0;while(S.gain<5&&guard++<14400)run(W,1);
  r.tKick=S.t;r.detected=S.gain>=5;
  S.wob=0;S.rpm=0;S.hoist=30;
  guard=0;while((W.jointNear(c.bUpr)<4||S.off<3)&&guard++<400)run(W,1);
  S.hoist=0;S.spmSet=[0,0];run(W,20);
  W.act('upr');run(W,10);W.act('hcr');run(W,opt.wait??900);
  r.gainShutIn=S.gain;r.sidpp=dpGauge(S);r.sicp=csgGauge(S);
  const sh=W.sheet(Math.round(r.sidpp/5)*5,Math.round(r.sicp/5)*5);r.kmw=sh.kmw;r.icp=sh.icp;r.fcp=sh.fcp;
  S.mwIn=sh.kmw;S.strokes=0;S.spmSet=[30,0];
  const setCh=v=>{if('chRSet' in S)S.chRSet=v;else S.chR=v},getCh=()=>('chRSet' in S?S.chRSet:S.chR);
  setCh(30);
  let n=0;r.minOver=1e9;r.maxOver=-1e9;r.maxShoe=0;const margin=opt.margin??75,every=opt.every??10;
  const ctl=()=>{const tg=margin+sh.icp+(sh.fcp-sh.icp)*Math.min(1,S.strokes/sh.stb);
    if(++n%every===0&&S.spm[0]>29){const e=dpGauge(S)-tg;setCh(Math.max(2,Math.min(100,getCh()+Math.max(-1,Math.min(1,e*(opt.gain??0.01))))))}
    if(S.spm[0]>29){r.minOver=Math.min(r.minOver,S.bhp-S.pf);r.maxOver=Math.max(r.maxOver,S.bhp-S.pf)}
    r.maxShoe=Math.max(r.maxShoe,S.shoe)};
  run(W,(sh.stb+sh.btsf)*1.25/30*60,ctl);
  S.spmSet=[0,0];setCh(0);run(W,60);setCh(8);run(W,600);setCh(0);run(W,60);
  r.killed=S.killed;r.frac=!!S.flags.frac;r.maxPc=S.maxPc;r.tEnd=S.t;r.finalPc=S.pc;r.gasLeft=S.gasVol;
  let tot=0;for(const s of S.ann)tot+=s.v;r.volErr=Math.abs(tot-W.geo.Va-(W.geo.CW??0.0015)*S.pc);
  r.finite=[S.spp,S.pc,S.bhp,S.gain,S.shoe].every(Number.isFinite);
  return r;
}
module.exports={loadCore,run,killScenario,dpGauge,csgGauge,HTML};
