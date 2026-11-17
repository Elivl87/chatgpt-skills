// Paso 20 (pantalla): productividad como lista y migración como casilla.
module.exports=async p=>{
  const res=[];await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(300);
  res.push(['productividad es una lista con Baja, Media y Alta',await p.$eval('#c_prod',e=>e.tagName==='SELECT'&&[...e.options].map(o=>o.textContent).join()==='Baja,Media,Alta'&&e.value==='2')]);
  res.push(['migración es una casilla sin marcar',await p.$eval('#c_migr',e=>e.type==='checkbox'&&!e.checked)]);
  await p.selectOption('#c_prod','3');await p.check('#c_migr');await p.click('#apply');
  res.push(['aplicar lleva ambos valores al ejercicio',await p.evaluate(()=>SIM.c.prod===3&&SIM.c.migr===1)]);
  res.push(['el formulario reconstruido conserva la elección',await p.evaluate(()=>document.getElementById('c_prod').value==='3'&&document.getElementById('c_migr').checked)]);
  await p.uncheck('#c_migr');await p.selectOption('#c_prod','1');await p.click('#apply');
  res.push(['desmarcar y bajar la productividad también se aplica',await p.evaluate(()=>SIM.c.prod===1&&SIM.c.migr===0)]);
  await p.selectOption('#preset','1');await p.click('#load');
  res.push(['cargar un ejercicio de la lista refleja su productividad alta',await p.$eval('#c_prod',e=>e.value==='3')]);
  await p.evaluate(()=>localStorage.clear());return res;
};
