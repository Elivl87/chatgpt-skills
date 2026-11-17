// Paso 14: mover la sarta desplaza el volumen de acero (se ve en tanques con el pozo abierto y en presión con el pozo cerrado).
module.exports=(W,{run})=>{
  const res=[];W.load(W.PRESETS[4],()=>0.5);const S=W.S,c=W.c,k=(c.dpOD**2-c.dpID**2)/1029.4;
  S.wob=0;S.rpm=0;S.spmSet=[0,0];run(W,60);
  const g0=S.gain;S.hoist=60;run(W,60);S.hoist=0;run(W,5);
  res.push(['levantar 60 ft baja el nivel '+(k*60).toFixed(3)+' bbl',Math.abs((g0-S.gain)-k*60)<0.01&&Math.abs(S.off-60)<1e-9]);
  S.hoist=-60;run(W,60);S.hoist=0;run(W,5);
  res.push(['bajar de nuevo devuelve ese volumen',Math.abs(S.gain-g0)<0.01&&S.off===0]);
  let tot=0;for(const s of S.ann)tot+=s.v;res.push(['el anular conserva su volumen',Math.abs(tot-W.geo.Va)<0.01]);
  // Pozo cerrado con el anular: bajar tubería (stripping) sube la presión dV/CW.
  S.hoist=30;run(W,80);S.hoist=0;W.act('ann');run(W,20);
  const p0=S.pc,o0=S.off;S.hoist=-30;run(W,40);S.hoist=0;run(W,5);
  const dV=k*(o0-S.off),exp=dV/W.geo.CW;
  res.push(['el anular permite bajar tubería con el pozo cerrado',o0-S.off>19]);
  res.push(['stripping: la presión sube '+(S.pc-p0).toFixed(0)+' psi (esperado '+exp.toFixed(0)+')',Math.abs((S.pc-p0)-exp)/exp<0.1]);
  const p1=S.pc;S.hoist=30;run(W,20);S.hoist=0;run(W,5);
  res.push(['levantar con el pozo cerrado baja la presión',S.pc<p1-20]);
  return res;
};
