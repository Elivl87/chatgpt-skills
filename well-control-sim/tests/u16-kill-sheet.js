// Paso 16 (pantalla): lista de SCR elegible, selector de método y tabla de presiones.
module.exports=async p=>{
  const res=[];await p.selectOption('#preset','0');await p.click('#load');
  const adv=n=>p.evaluate(n=>{for(let i=0;i<n;i++)SIM.step(0.5)},n);
  res.push(['sin SCR la lista lo dice',(await p.$eval('#scrList',e=>e.textContent)).includes('Sin presiones')]);
  await p.evaluate(()=>{SIM.S.wob=0;SIM.S.spmSet=[30,0]});await adv(120);await p.click('#scrBtn');
  await p.evaluate(()=>{SIM.S.spmSet=[40,0]});await adv(120);await p.click('#scrBtn');
  res.push(['aparecen dos SCR como opciones',(await p.$$('#scrList input[type=radio]')).length===2]);
  await p.fill('#ksDp','260');await p.fill('#ksCp','350');
  const icp40=await p.$eval('#kIcp',e=>e.textContent);
  await p.click('#scr_30');const icp30=await p.$eval('#kIcp',e=>e.textContent);
  res.push(['elegir otra SCR cambia la ICP ('+icp40+' → '+icp30+')',icp40!==icp30&&/psi/.test(icp30)]);
  res.push(['la opción elegida queda marcada tras redibujar',await p.$eval('#scr_30',e=>e.checked)]);
  const rows=()=>p.$$eval('#sched tr',r=>r.length);
  res.push(['Esperar y Densificar: encabezado + 11 pasos + tramo final',await rows()===13]);
  await p.selectOption('#ksMethod','dm1');
  res.push(['Perforador 1.ª: una sola fila con ICP constante',await rows()===2&&(await p.$eval('#sched',e=>e.textContent)).includes('constante')]);
  res.push(['el objetivo actual se muestra',/psi/.test(await p.$eval('#kNow',e=>e.textContent))||(await adv(1),await p.waitForTimeout(150),/psi/.test(await p.$eval('#kNow',e=>e.textContent)))]);
  await p.selectOption('#ksMethod','dm2');res.push(['Perforador 2.ª: vuelve la tabla escalonada',await rows()===13]);
  res.push(['MAASP con lodo de matar calculada',/psi/.test(await p.$eval('#kMaaspK',e=>e.textContent))]);
  return res;
};
