// Pruebas del núcleo: node tests/core.test.js   (--update reescribe la línea base)
const fs=require('fs'),path=require('path');
const {loadCore,run,killScenario}=require('./lib');
const W=loadCore();let fails=0;
const ok=(cond,msg)=>{if(!cond){fails++;console.log('  FALLA: '+msg)}};
const BASEFILE=path.join(__dirname,'baseline.json');
const out={};
for(const i of [0,1,2,3]){
  const r=killScenario(W,i);out[i]=Object.fromEntries(Object.entries(r).map(([k,v])=>[k,typeof v==='number'?Math.round(v*100)/100:v]));
  console.log('Ejercicio '+i+': '+JSON.stringify(out[i]));
  ok(r.detected,'ej'+i+' no se detectó influjo');ok(r.finite,'ej'+i+' valores no finitos');
  ok(r.killed,'ej'+i+' el pozo no quedó controlado');ok(r.minOver>-20,'ej'+i+' fondo bajo balance durante el matar: '+r.minOver);
  ok(r.volErr<0.05,'ej'+i+' error de volumen '+r.volErr);
}
// Ejercicio sin influjo: 2 h perforando no debe dar ganancia ni gas.
W.load(W.PRESETS[4],()=>0.5);run(W,7200);
ok(W.S.gasVol===0&&W.S.gain<0.5,'práctica libre generó influjo');
// Reventón si no se cierra el pozo.
W.load(W.PRESETS[0],()=>0.5);let g=0;while(!W.S.over&&g++<40000)run(W,1);
ok(W.S.over,'no hubo reventón con el pozo abierto');
// Pruebas específicas de cada corrección (tNN-*.js): cada una devuelve [[mensaje, pasó], ...]
for(const f of fs.readdirSync(__dirname).filter(f=>/^t\d+.*\.js$/.test(f)).sort()){
  const res=require('./'+f)(loadCore(),{run,killScenario});
  for(const [m,c] of res){if(!c){fails++;console.log('  FALLA ['+f+']: '+m)}}
  console.log(f+': '+res.filter(x=>x[1]).length+'/'+res.length+' ok');
}
if(process.argv.includes('--update')){fs.writeFileSync(BASEFILE,JSON.stringify(out,null,1));console.log('Línea base actualizada.')}
else if(fs.existsSync(BASEFILE)){const b=JSON.parse(fs.readFileSync(BASEFILE));
  for(const i in out)for(const k in out[i])if(JSON.stringify(out[i][k])!==JSON.stringify(b[i]?.[k]))console.log('  cambio ej'+i+'.'+k+': '+b[i]?.[k]+' -> '+out[i][k])}
console.log(fails?fails+' FALLAS':'NÚCLEO OK');process.exit(fails?1:0);
