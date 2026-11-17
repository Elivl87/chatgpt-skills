// Paso 17 (pantalla): en pausa no se redibuja; cada lienzo se repinta solo cuando cambia; el tema se relee al cambiar.
module.exports=async p=>{
  const res=[];await p.selectOption('#preset','0');await p.click('#load');await p.waitForTimeout(400);
  const d=()=>p.evaluate(()=>({...SIM.draws}));
  let a=await d();await p.waitForTimeout(800);let b=await d();
  res.push(['en pausa: ningún redibujo en 0,8 s',JSON.stringify(a)===JSON.stringify(b)]);
  await p.click('#mb_vm');await p.waitForTimeout(250);let c=await d();
  res.push(['abrir una válvula repinta el esquema una vez',c.mani===b.mani+1]);
  res.push(['y no repinta el registro ni los diales',c.chart===b.chart&&c.dial===b.dial]);
  await p.click('#speeds [data-s="1"]');await p.waitForTimeout(1200);await p.click('#speeds [data-s="0"]');let e=await d();
  res.push(['corriendo a 1× el esquema del BOP no se repinta si nada cambia en él',e.mani<=c.mani+1]);
  res.push(['a 1× el tiempo avanza en pasos de 0,1 s',await p.evaluate(()=>SIM.stepFor(1)===0.1&&SIM.stepFor(5)===0.1&&SIM.stepFor(20)===0.5&&Math.abs(SIM.S.t*10-Math.round(SIM.S.t*10))<1e-6&&SIM.S.t>0.5)]);
  const bg=await p.evaluate(()=>SIM.C.bg);await p.emulateMedia({colorScheme:'dark'});await p.waitForTimeout(300);
  const bg2=await p.evaluate(()=>SIM.C.bg),f=await d();
  res.push(['cambiar a tema oscuro relee los colores',bg!==bg2]);
  res.push(['y repinta todos los lienzos',f.mani>e.mani&&f.well>e.well&&f.chart>e.chart&&f.dial>=e.dial+2&&f.space>e.space]);
  await p.emulateMedia({colorScheme:'light'});await p.waitForTimeout(200);
  return res;
};
