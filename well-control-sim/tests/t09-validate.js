// Paso 9: la validación simplificada de lastrabarrenas se comporta igual que la anterior y los demás límites siguen vigentes.
module.exports=(W)=>{
  const res=[],B=W.BASE,old=n=>Math.max(30,Math.min(n.dcLen,n.tvd-n.shoe>60?Math.min(n.dcLen,n.tvd-100):n.tvd-100));
  let same=true;
  for(const tvd of [1000,1200,4500,10000,25000])for(const shoe of [300,900,4000,9900])for(const dcLen of [0,30,200,600,950,5000,30000]){
    const raw={...B,tvd,shoe,dcLen},v=W.validate(raw),ref={...raw,shoe:Math.max(300,Math.min(shoe,tvd-200))};
    if(v.dcLen!==old(ref))same=false;
    if(!(v.dcLen>=30&&v.dcLen<=v.tvd-100&&v.shoe<=v.tvd-200))same=false;
  }
  res.push(['dcLen: mismo resultado que la fórmula anterior en 140 combinaciones',same]);
  for(const p of W.PRESETS)res.push(['el ejercicio "'+p.name.slice(0,22)+'…" pasa la validación sin cambios',JSON.stringify(W.validate(p))===JSON.stringify(p)]);
  const v=W.validate({...B,mw:30,hole:5,dpID:9,bUpr:1,prod:7,migr:5});
  res.push(['valores absurdos quedan dentro de rango',v.mw===19&&v.hole>=v.dcOD+.5&&v.dpID<v.dpOD&&v.bUpr>=v.bAnn+3&&v.prod===3&&v.migr===1&&v.csgID>=v.hole]);
  return res;
};
