// Paso 19 (pantalla): las lecturas de los lienzos existen como texto y los avisos se anuncian.
module.exports=async p=>{
  const res=[];await p.selectOption('#preset','0');await p.click('#load');
  await p.evaluate(()=>{for(let i=0;i<40;i++)SIM.step(0.5)});await p.waitForTimeout(250);
  const g=await p.evaluate(()=>({dp:Math.round(SIM.S.gDp/5)*5,l:document.getElementById('dialDP').getAttribute('aria-label'),c:document.getElementById('dialCP').getAttribute('aria-label'),
    w:document.getElementById('well').getAttribute('aria-label'),ch:document.getElementById('chart').getAttribute('aria-label')}));
  res.push(['el manómetro de tubería dice su lectura ('+g.l+')',g.l.includes(String(g.dp))&&g.l.includes('psi')]);
  res.push(['el de revestidor dice lectura y MAASP',/revestidor: \d+ psi/.test(g.c)&&g.c.includes('MAASP')]);
  res.push(['el esquema del pozo describe estado y profundidades',g.w.includes('abierto')&&g.w.includes('barrena')]);
  res.push(['el registro resume tiempo y presiones',g.ch.includes('minutos')&&g.ch.includes('ganancia')]);
  res.push(['todos los lienzos tienen role=img y etiqueta',await p.$$eval('canvas',cs=>cs.every(c=>c.getAttribute('role')==='img'&&(c.getAttribute('aria-label')||'').length>10))]);
  res.push(['bitácora, estado y aviso con roles en vivo',await p.evaluate(()=>document.getElementById('log').getAttribute('role')==='log'&&document.getElementById('status').getAttribute('aria-live')==='polite'&&document.getElementById('banner').getAttribute('role')==='alert')]);
  await p.click('#mb_ann');await p.evaluate(()=>{for(let i=0;i<40;i++)SIM.step(0.5)});await p.waitForTimeout(250);
  res.push(['al cerrar el pozo la descripción cambia a cerrado',(await p.$eval('#well',e=>e.getAttribute('aria-label'))).includes('cerrado')]);
  res.push(['el revestidor avisa que está aislado con la HCR cerrada',(await p.$eval('#dialCP',e=>e.getAttribute('aria-label'))).includes('aislado')]);
  await p.click('#exam');await p.waitForTimeout(250);
  res.push(['en modo examen la descripción no revela el gas',!(await p.$eval('#well',e=>e.getAttribute('aria-label'))).includes('gas')]);
  await p.click('#exam');
  return res;
};
