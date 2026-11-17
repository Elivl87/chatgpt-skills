// Paso 13: gas real. Z contra la carta de Standing y Katz, densidad del gas, y conservación de la cantidad de gas.
module.exports=(W,{run})=>{
  const res=[];const Tpc=168+325*.65-12.5*.65*.65,Ppc=677+15*.65-37.5*.65*.65;
  for(const [Tr,Pr,z] of [[1.5,2,0.823],[2.0,5,0.964],[1.3,1,0.853],[1.8,8,1.016],[2.0,0.1,0.997],[1.2,3,0.52]]){
    const got=W.zFactor(Pr*Ppc,Tr*Tpc);res.push(['Z(Tpr='+Tr+', Ppr='+Pr+') = '+got.toFixed(3)+' (carta '+z+')',Math.abs(got-z)<0.025])}
  const Tb=W.tempR(10000),Zb=W.zFactor(5500,Tb);
  res.push(['gradiente del gas a 5500 psi y 10 000 ft cerca de 0,1 psi/ft',Math.abs(0.052*W.gasPpg(5500,Zb,Tb)-0.1)<0.02]);
  res.push(['en superficie a 500 psi es mucho más liviano',0.052*W.gasPpg(500,W.zFactor(500,540),540)<0.02]);
  // Cantidad de gas constante con el pozo cerrado y mientras circula sin llegar al choke.
  W.load(W.PRESETS[0],()=>0.5);const S=W.S,c=W.c;
  while(S.gain<8)run(W,1);S.wob=0;S.rpm=0;S.hoist=30;while(W.jointNear(c.bUpr)<4||S.off<3)run(W,1);S.hoist=0;S.spmSet=[0,0];run(W,20);
  W.act('upr');run(W,10);W.act('hcr');run(W,900);
  const N=()=>S.ann.reduce((a,s)=>a+(s.gas?s.n:0),0),n0=N(),v0=S.gasVol,p0=S.ann.find(s=>s.gas).h+S.pc+14.7;
  res.push(['hay gas y el pozo está estabilizado',n0>0&&Math.abs(S.bhp-S.pf)<3]);
  S.spmSet=[30,0];S.chRSet=30;run(W,3600);
  res.push(['la cantidad de gas no cambia al circularlo hacia arriba',Math.abs(N()-n0)/n0<1e-6&&S.gasVol>v0]);
  const g=S.ann.filter(s=>s.gas),P=g[0].h+S.pc+14.7,ideal=v0*p0/P;
  res.push(['el gas se expande menos que un gas ideal (Z·T baja al subir)',S.gasVol<ideal&&S.gasVol>ideal*0.5]);
  let ok=true;for(const s of g){const Pm=S.pc+s.h+14.7;if(Math.abs(s.v-s.n*s.zt/Pm)/s.v>0.02)ok=false}
  res.push(['cada bache cumple P·V = n·Z·T',ok]);
  // Instante antiguo (n = P·V): se convierte sin cambiar el volumen de gas.
  const sn=JSON.parse(JSON.stringify(W.save()));for(const s of sn.S.ann)if(s.gas){s.n=s.n*s.zt;delete s.zt;delete s.ppg}
  const vBefore=S.gasVol;W.restore(sn);run(W,2);
  res.push(['un instante con la definición antigua de n conserva el volumen de gas',Math.abs(W.S.gasVol-vBefore)/vBefore<0.03]);
  return res;
};
