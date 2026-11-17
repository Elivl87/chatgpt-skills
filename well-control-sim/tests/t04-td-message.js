// Paso 4: al llegar a la profundidad final del ejercicio se avisa que la barrena ya no avanza.
module.exports=(W,{run})=>{
  const res=[];W.load(W.PRESETS[4],()=>0.5);const S=W.S;   // práctica libre: no hay influjo que interrumpa
  const msgs=[];const pump=()=>{for(const e of S.ev)if(e.m)msgs.push(e.m);S.ev.length=0};
  let g=0;while(S.depth<S.zoneTop+40&&g++<40000){run(W,1);pump()}
  res.push(['se llega al límite perforando',S.depth>=S.zoneTop+40-1e-6]);
  run(W,5);pump();
  const hit=msgs.filter(m=>m.includes('profundidad final'));
  res.push(['aparece el aviso de profundidad final',hit.length===1]);
  res.push(['la ROP queda en cero',S.rop===0]);
  run(W,600);pump();
  res.push(['el aviso no se repite',msgs.filter(m=>m.includes('profundidad final')).length===1]);
  const d=S.depth;run(W,60);res.push(['la profundidad no cambia',S.depth===d]);
  return res;
};
