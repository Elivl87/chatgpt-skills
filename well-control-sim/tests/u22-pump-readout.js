// Paso 22 (pantalla): junto al deslizador se ve la velocidad real de la bomba, y la consigna mientras no la alcanza.
module.exports=async p=>{
  const res=[];await p.selectOption('#preset','0');await p.click('#load');await p.waitForTimeout(250);
  res.push(['en régimen muestra solo la velocidad real (80)',(await p.$eval('#spm1V',e=>e.textContent))==='80']);
  await p.$eval('#spm1',e=>{e.value=30;e.dispatchEvent(new Event('input',{bubbles:true}))});
  await p.evaluate(()=>{for(let i=0;i<6;i++)SIM.step(0.5)});await p.waitForTimeout(250);
  const t=await p.$eval('#spm1V',e=>e.textContent),real=await p.evaluate(()=>Math.round(SIM.S.spm[0]));
  res.push(['mientras desacelera muestra real → consigna ('+t+')',t===real+' → 30'&&real<80&&real>30]);
  await p.evaluate(()=>{for(let i=0;i<40;i++)SIM.step(0.5)});await p.waitForTimeout(250);
  res.push(['al llegar muestra solo 30',(await p.$eval('#spm1V',e=>e.textContent))==='30']);
  await p.click('#mb_p1');await p.evaluate(()=>{for(let i=0;i<4;i++)SIM.step(0.5)});await p.waitForTimeout(250);
  res.push(['si salta el alivio, la lectura cae a 0 y el deslizador también',(await p.$eval('#spm1V',e=>e.textContent))==='0'&&(await p.$eval('#spm1',e=>e.value))==='0']);
  return res;
};
