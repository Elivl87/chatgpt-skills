// Paso 21 (pantalla): si un dato queda fuera de rango, se dice cuál se ajustó y a cuánto.
module.exports=async p=>{
  const res=[];await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(300);
  await p.fill('#c_pv','22');await p.click('#apply');let t=await p.$eval('#cfgMsg',e=>e.textContent);
  res.push(['dato válido: no hay aviso de ajuste',t.includes('Datos aplicados')&&!t.includes('ajustaron')]);
  await p.fill('#c_shoe','9950');await p.fill('#c_mw','25');await p.click('#apply');t=await p.$eval('#cfgMsg',e=>e.textContent);
  res.push(['zapata demasiado profunda: se nombra y se muestra el valor final',t.includes('Zapata del revestidor: 9950 → 9800 ft')]);
  res.push(['densidad excesiva: también se informa',t.includes('Densidad: 25 → 19 ppg')]);
  res.push(['el ejercicio usa los valores ajustados',await p.evaluate(()=>SIM.c.shoe===9800&&SIM.c.mw===19)]);
  res.push(['el formulario muestra los valores ajustados',await p.evaluate(()=>document.getElementById('c_shoe').value==='9800'&&document.getElementById('c_mw').value==='19')]);
  res.push(['lo guardado no arrastra campos internos',await p.evaluate(()=>!('_adj' in JSON.parse(localStorage.getItem('wcs-cfg'))))]);
  await p.click('#apply');t=await p.$eval('#cfgMsg',e=>e.textContent);
  res.push(['al volver a aplicar sin cambios ya no hay aviso',!t.includes('ajustaron')]);
  await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(300);return res;
};
