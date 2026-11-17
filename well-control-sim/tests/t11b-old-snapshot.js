// Paso 11 (2.ª auditoría): un instante guardado sin los campos nuevos se restaura sin romper la simulación.
module.exports=(W,{run})=>{
  W.load(W.PRESETS[0],()=>0.5);run(W,30);const sn=JSON.parse(JSON.stringify(W.save()));
  for(const k of ['chRSet','chMSet','dly','lost','gDp','gCp','gCpOn'])delete sn.S[k];
  W.restore(sn);run(W,60);const S=W.S;
  return [['instante antiguo: la simulación sigue con valores finitos',[S.chR,S.chM,S.gDp,S.gCp,S.spp,S.bhp,S.lost].every(Number.isFinite)]];
};
