// Paso 8 (pantalla): las lecturas usan coma decimal y no quedan números en formato inglés.
module.exports=async p=>{
  const res=[];
  await p.selectOption('#preset','0');await p.click('#load');await p.fill('#ksDp','260');await p.waitForTimeout(250);
  const txt=await p.evaluate(()=>[...document.querySelectorAll('.read .v, #sub, #sched, table td.mono, .big, #scrTxt, #log')].map(e=>e.textContent).join(' | '));
  res.push(['hay lecturas con coma decimal',/\d,\d/.test(txt)]);
  res.push(['ninguna lectura con punto decimal',!/\d\.\d/.test(txt)]);
  res.push(['ninguna lectura con coma de millares',!/\d,\d{3}(?!\d)/.test(txt.replace(/\d,\d{4}/g,''))]);
  res.push(['la profundidad del hoyo usa espacio de millares',/10 000,0/.test(await p.$eval('#vDepth',e=>e.textContent))]);
  return res;
};
