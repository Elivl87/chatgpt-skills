// Paso 2: el manómetro de revestidor solo lee el pozo si la alineación lo conecta.
module.exports=(W,{run})=>{
  const res=[];W.load(W.PRESETS[0],()=>0.5);const S=W.S,c=W.c;
  while(S.gain<5)run(W,1);
  S.wob=0;S.rpm=0;S.hoist=30;while(W.jointNear(c.bUpr)<4||W.jointNear(c.bLpr)<4||S.off<3)run(W,1);S.hoist=0;S.spmSet=[0,0];run(W,20);
  W.act('upr');run(W,300);
  res.push(['pozo cerrado con presión real en el anular',S.sealed&&S.pc>100]);
  res.push(['HCR cerrada: el manómetro de revestidor marca 0',S.gCp===0&&S.gCpOn===false]);
  res.push(['el manómetro de tubería sí lee la SIDPP',Math.abs(S.gDp-S.spp)<1&&S.gDp>100]);
  W.act('hcr');run(W,5);
  res.push(['HCR abierta: el manómetro lee la presión del pozo',S.gCpOn&&Math.abs(S.gCp-S.pc)<1]);
  const before=S.gCp;W.act('lpr');run(W,10);
  res.push(['rams inferiores cerrados: manómetro aislado',S.gCpOn===false]);
  res.push(['aislado con choke cerrado: conserva la presión atrapada',Math.abs(S.gCp-before)<30]);
  S.chR=20;run(W,10);
  res.push(['aislado con choke abierto: se purga a 0 sin purgar el pozo',S.gCp===0&&S.pc>100]);
  S.chR=0;W.act('lpr');run(W,10);
  res.push(['al abrir los rams inferiores vuelve a leer el pozo',S.gCpOn&&Math.abs(S.gCp-S.pc)<1]);
  return res;
};
