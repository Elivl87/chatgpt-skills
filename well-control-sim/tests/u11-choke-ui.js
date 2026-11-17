// Paso 11 (pantalla): el deslizador fija la consigna y la lectura muestra la posición real avanzando hacia ella.
module.exports=async p=>{
  const res=[];await p.selectOption('#preset','4');await p.click('#load');
  await p.$eval('#chR',e=>{e.value=40;e.dispatchEvent(new Event('input',{bubbles:true}))});
  res.push(['el deslizador cambia la consigna, no la posición',await p.evaluate(()=>SIM.S.chRSet===40&&SIM.S.chR===0)]);
  await p.evaluate(()=>{for(let i=0;i<4;i++)SIM.step(0.5)});await p.waitForTimeout(200);
  const t=await p.$eval('#chRV',e=>e.textContent);
  res.push(['la lectura muestra posición real y consigna ('+t+')',t.startsWith('8,0')&&t.includes('40,0')]);
  await p.click('[data-c="5"]');res.push(['los botones ±  mueven la consigna',await p.evaluate(()=>SIM.S.chRSet===45)]);
  await p.evaluate(()=>{for(let i=0;i<40;i++)SIM.step(0.5)});await p.waitForTimeout(200);
  res.push(['al llegar, la lectura muestra solo la posición',(await p.$eval('#chRV',e=>e.textContent))==='45,0']);
  return res;
};
