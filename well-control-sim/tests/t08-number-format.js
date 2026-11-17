// Paso 8: un solo formato numérico, el mismo de los rótulos (coma decimal, espacio de millares desde cinco cifras).
module.exports=(W)=>{
  const f=W.fmt,sp=' ';
  const cases=[[0,0,'0'],[5460,0,'5460'],[10025.7,1,'10'+sp+'025,7'],[0.1018,4,'0,1018'],[10.5,1,'10,5'],[-9.4,0,'−9'],[-0.04,1,'0,0'],
    [1234567.891,2,'1'+sp+'234'+sp+'567,89'],[999.95,1,'1000,0'],[NaN,0,'–'],[Infinity,1,'–'],[-12345,0,'−12'+sp+'345']];
  const res=cases.map(([x,d,want])=>['fmt('+x+','+d+') = '+want,f(x,d)===want]);
  W.load(W.PRESETS[0],()=>0.5);const msgs=W.S.ev.map(e=>e.m||'').join(' ');
  res.push(['ningún número con punto decimal o coma de millares en los avisos',!/\d\.\d|\d,\d{3}\b/.test(msgs)]);
  return res;
};
