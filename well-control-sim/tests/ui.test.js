// Prueba de pantalla: node tests/ui.test.js  (usa el Chromium preinstalado; --shot archivo.png guarda una captura)
const {chromium}=require('playwright');const fs=require('fs');const {HTML}=require('./lib');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:1000}});
  const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
  const page='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body>'+fs.readFileSync(HTML,'utf8')+'</body></html>';
  await p.route('http://wcs.test/',r=>r.fulfill({contentType:'text/html',body:page}));
  await p.goto('http://wcs.test/');
  await p.waitForTimeout(500);let fails=0;const ok=(c,m)=>{if(!c){fails++;console.log('  FALLA: '+m)}};
  await p.click('#speeds [data-s="60"]');await p.waitForTimeout(700);
  ok(await p.evaluate(()=>SIM.S.t>5),'el tiempo no avanza a 60×');
  await p.evaluate(()=>document.getElementById('mani').scrollIntoView({block:'center'}));
  const bx=await (await p.$('#mani')).boundingBox(),k=bx.width/790;
  await p.mouse.click(bx.x+330*k,bx.y+150*k);await p.waitForTimeout(600);
  ok(await p.evaluate(()=>SIM.S.el.ann.t===1),'clic en el anular no lo cierra');
  await p.click('#mb_hcr');ok(await p.evaluate(()=>SIM.S.v.hcr===true),'botón HCR no abre');
  ok((await p.$$('#log li')).length>=2,'la bitácora no recibe avisos');
  await p.click('#scrBtn');await p.click('#ksRead');
  await p.selectOption('#preset','2');await p.click('#load');await p.waitForTimeout(200);
  ok(await p.evaluate(()=>SIM.c.tvd===4500),'no carga otro ejercicio');
  // Pruebas específicas de cada corrección (uNN-*.js): reciben la página y devuelven [[mensaje, pasó], ...]
  for(const f of fs.readdirSync(__dirname).filter(f=>/^u\d+.*\.js$/.test(f)).sort()){
    const res=await require('./'+f)(p);for(const [m,c] of res){if(!c){fails++;console.log('  FALLA ['+f+']: '+m)}}
    console.log(f+': '+res.filter(x=>x[1]).length+'/'+res.length+' ok');
  }
  await p.setViewportSize({width:400,height:800});await p.waitForTimeout(300);
  ok(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'desborde horizontal en teléfono');
  ok(errs.length===0,'errores de consola: '+errs.join(' | '));
  const i=process.argv.indexOf('--shot');
  if(i>0){await p.setViewportSize({width:1300,height:1000});await p.waitForTimeout(300);await p.screenshot({path:process.argv[i+1],fullPage:true})}
  console.log(fails?fails+' FALLAS':'PANTALLA OK');await b.close();process.exit(fails?1:0);
})();
