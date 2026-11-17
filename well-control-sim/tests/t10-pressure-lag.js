// Paso 10: un cambio en el choke tarda ~2 s por cada 1000 ft en verse en el manómetro de tubería; el de revestidor responde enseguida.
module.exports=(W,{run})=>{
  const res=[];
  for(const i of [2,0]){
    W.load(W.PRESETS[i],()=>0.5);const S=W.S,lag=W.geo.lag;
    res.push(['ej'+i+': retardo = 2 s por 1000 ft ('+lag.toFixed(1)+' s)',Math.abs(lag-2*S.depth/1000)<1e-9]);
    S.wob=0;S.rpm=0;S.spmSet=[30,0];run(W,60);W.act('ann');W.act('hcr');S.chR=60;if('chRSet' in S)S.chRSet=60;run(W,600);
    res.push(['ej'+i+': en régimen estable el manómetro iguala la presión real',Math.abs(S.gDp-S.spp)<2]);
    const dp0=S.gDp,cp0=S.gCp;S.chR=50;if('chRSet' in S){S.chRSet=50;S.chR=50}
    run(W,1.5);const cpFast=S.gCp-cp0,dpEarly=S.gDp-dp0;
    res.push(['ej'+i+': el revestidor ya responde a los 1,5 s',cpFast>4]);
    res.push(['ej'+i+': la tubería aún no se entera',Math.abs(dpEarly)<3]);
    run(W,lag*0.6-1.5);res.push(['ej'+i+': a 0,6 del retardo sigue sin cambio',Math.abs(S.gDp-dp0)<3]);
    run(W,lag*0.4+2);const dpLate=S.gDp-dp0;
    res.push(['ej'+i+': pasado el retardo la tubería sube',dpLate>10]);
    run(W,lag+600);res.push(['ej'+i+': al final ambos manómetros suben lo mismo',Math.abs((S.gDp-dp0)-(S.gCp-cp0))<8&&Math.abs(S.gDp-S.spp)<2]);
    const d1=S.gDp;S.spmSet=[40,0];run(W,4);
    res.push(['ej'+i+': un cambio de bomba se ve de inmediato en la tubería',S.gDp-d1>20]);
  }
  return res;
};
