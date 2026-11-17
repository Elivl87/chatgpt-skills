// Paso 11: los chokes tardan en recorrer su carrera; la posición real sigue a la consigna.
module.exports=(W,{run})=>{
  const res=[];W.load(W.PRESETS[4],()=>0.5);const S=W.S;
  S.chRSet=100;S.chMSet=100;run(W,0.5);
  res.push(['medio segundo después el remoto apenas se movió (2 %)',Math.abs(S.chR-2)<1e-9]);
  run(W,12);res.push(['a los 12,5 s el remoto va por la mitad',Math.abs(S.chR-50)<1e-9]);
  res.push(['el manual es más lento',Math.abs(S.chM-31.25)<1e-9]);
  run(W,12.5);res.push(['el remoto completa la carrera en 25 s',S.chR===100]);
  run(W,15);res.push(['el manual la completa en 40 s',S.chM===100]);
  S.chRSet=37.5;run(W,60);res.push(['se detiene exactamente en la consigna',S.chR===37.5]);
  S.chRSet=0;run(W,5);res.push(['cerrando también respeta la velocidad',Math.abs(S.chR-17.5)<1e-9]);
  run(W,30);res.push(['y llega a cerrado sin pasarse',S.chR===0]);
  return res;
};
