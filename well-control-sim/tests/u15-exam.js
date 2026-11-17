// Paso 15 (pantalla): el modo examen oculta la información de fondo y la calificación se muestra en una tabla.
module.exports=async p=>{
  const res=[];await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(300);
  const vis=()=>p.evaluate(()=>['rBhpBox','rPfBox','rOver','rShoe'].map(i=>getComputedStyle(document.getElementById(i)).display!=='none'));
  res.push(['modo normal: se ven fondo, formación, sobrebalance y zapata',(await vis()).every(x=>x)]);
  await p.click('#exam');res.push(['modo examen: esas cuatro lecturas se ocultan',(await vis()).every(x=>!x)]);
  res.push(['la ganancia en tanques sigue visible',await p.evaluate(()=>getComputedStyle(document.getElementById('rGain')).display!=='none')]);
  await p.reload();await p.waitForTimeout(300);
  res.push(['el modo examen se recuerda al recargar',(await vis()).every(x=>!x)&&await p.$eval('#exam',b=>b.getAttribute('aria-pressed')==='true')]);
  res.push(['la calificación está oculta al inicio',await p.$eval('#report',e=>e.hidden)]);
  await p.click('#grade');
  res.push(['Calificar muestra la tabla con cuatro rubros',await p.evaluate(()=>!document.getElementById('report').hidden&&document.querySelectorAll('#repTable tr').length===5)]);
  res.push(['la nota tiene formato N / 100',/^\d+ \/ 100$/.test(await p.$eval('#repTotal',e=>e.textContent))]);
  await p.click('#load');res.push(['cargar un ejercicio oculta la calificación',await p.$eval('#report',e=>e.hidden)]);
  await p.click('#exam');await p.evaluate(()=>localStorage.clear());
  return res;
};
