// Paso 3: los datos personalizados guardados se cargan al abrir la página.
module.exports=async p=>{
  const res=[];
  await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(300);
  res.push(['sin datos guardados abre el ejercicio base',await p.evaluate(()=>SIM.c.tvd===10000&&document.getElementById('preset').value==='0')]);
  await p.fill('#c_tvd','8000');await p.fill('#c_mw','11.2');await p.click('#apply');
  res.push(['aplicar guarda en el navegador',await p.evaluate(()=>JSON.parse(localStorage.getItem('wcs-cfg')).tvd===8000)]);
  await p.reload();await p.waitForTimeout(300);
  res.push(['al recargar se usan los datos guardados',await p.evaluate(()=>SIM.c.tvd===8000&&SIM.c.mw===11.2)]);
  res.push(['la lista muestra el ejercicio personalizado',await p.evaluate(()=>document.getElementById('preset').value==='custom')]);
  await p.selectOption('#preset','0');await p.click('#load');
  res.push(['se puede volver a un ejercicio de la lista',await p.evaluate(()=>SIM.c.tvd===10000)]);
  await p.selectOption('#preset','custom');await p.click('#load');
  res.push(['y regresar al personalizado',await p.evaluate(()=>SIM.c.tvd===8000)]);
  await p.evaluate(()=>localStorage.setItem('wcs-cfg','{"tvd":"basura","mw":null}'));await p.reload();await p.waitForTimeout(300);
  res.push(['datos guardados dañados no rompen la página',await p.evaluate(()=>Number.isFinite(SIM.S.bhp)&&SIM.S.bhp>0)]);
  await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(300);
  return res;
};
