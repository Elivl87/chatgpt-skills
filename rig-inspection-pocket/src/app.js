/* Rig Inspection Pocket 2.1 — single-file offline field reference.
   One router, one search engine, one render path per view.
   Data comes from <script id="data" type="application/json">; page scans
   live in <script id="img-N" type="text/plain"> and are decoded on demand. */
(function(){'use strict';

const VERSION='2.1';
const D=JSON.parse(document.getElementById('data').textContent);
const TOTAL=D.ocr.length;
const $=s=>document.querySelector(s);

/* ------------------------------------------------------------ utilities */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const pad=n=>String(n).padStart(3,'0');
const pad2=n=>String(n).padStart(2,'0');
const plural=(n,a,b)=>n+' '+(n===1?a:b);
function load(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}}
let toastT=0;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2400)}
function copyText(s,ok){
  const done=()=>toast(ok),fail=()=>{const a=document.createElement('textarea');a.value=s;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();let r=false;try{r=document.execCommand('copy')}catch{}a.remove();toast(r?ok:'Este navegador no permite copiar')};
  if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(s).then(done,fail);else fail();
}
function download(text,name){const u=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000)}

/* ------------------------------------------------------------ icons */
const IC={
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
  home:'<path d="M4 10.5 12 4l8 6.5V20H4z"/><path d="M10 20v-6h4v6"/>',
  grid:'<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
  book:'<path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h11"/>',
  more:'<path d="M4 6h16M4 12h16M4 18h10"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  chev:'<path d="m9 6 6 6-6 6"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  check:'<path d="m4.5 12.5 5 5L19.5 7"/>',
  prev:'<path d="M15 6l-6 6 6 6"/>',
  next:'<path d="m9 6 6 6-6 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  mark:'<path d="M6 3h12v18l-6-4.5L6 21z"/>',
  copy:'<path d="M8 8h12v12H8z"/><path d="M16 8V4H4v12h4"/>',
  text:'<path d="M5 5h14M5 10h14M5 15h9M5 20h6"/>',
  image:'<path d="M4 4h16v16H4z"/><path d="m4 16 5-5 4 4 2-2 5 5"/><circle cx="15.5" cy="8.5" r="1.5"/>',
  alert:'<path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18v.5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5V8"/>',
  shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  external:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v6H4V6h6"/>',
  clipboard:'<path d="M8 4h8v3H8z"/><path d="M8 5H5v16h14V5h-3"/><path d="M8 12h8M8 16h5"/>',
  download:'<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',
  upload:'<path d="M12 16V5M7 10l5-5 5 5M4 20h16"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  moon:'<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  probe:'<circle cx="10" cy="10" r="6"/><path d="m14.5 14.5 6 6M7.5 10h5M10 7.5v5"/>',
  defect:'<path d="M4 4h16v16H4z"/><path d="m9 4 2 5-3 3 4 3-1 5"/>',
  faq:'<path d="M4 4h16v12H9l-5 4z"/><path d="M10 8.5a2 2 0 1 1 2.5 2c-.4.1-.5.4-.5.8v.2M12 13.5v.5"/>',
  std:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7"/>',
  law:'<path d="M12 4v16M5 20h14M4 8h16"/><path d="m6 8-3 6h6zM18 8l-3 6h6z"/>',
  cert:'<circle cx="12" cy="9" r="5"/><path d="m9 13-2 8 5-3 5 3-2-8"/>',
  evidence:'<path d="M5 3h10l4 4v14H5z"/><path d="m9 13 2 2 4-4"/>',
  audit:'<path d="M4 6h10M4 12h10M4 18h7"/><path d="m15 17 2 2 4-4"/>',
  saved:'<path d="M6 3h12v18l-6-4.5L6 21z"/><path d="m9.5 10 2 2 3.5-3.5"/>'
};
const ico=(k,s)=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true"${s?` style="width:${s}px;height:${s}px"`:''}>${IC[k]||IC.info}</svg>`;

/* ------------------------------------------------------------ indexes */
const REC=new Map(D.records.map(r=>[r.id,r]));
const MOD=new Map(D.modules.map((m,i)=>[m.id,{...m,no:i+1}]));
const byId=id=>REC.get(id);
const modOf=p=>D.modules.find(m=>p>=m.start&&p<=m.end);
const sysCode=id=>'SYS-'+pad2(MOD.get(id)?.no||0);
const recCode=id=>'F'+pad2(id.replace(/\D/g,''));
const CLAIMS=new Map();for(const c of D.claims){if(!CLAIMS.has(c.id))CLAIMS.set(c.id,[]);CLAIMS.get(c.id).push(c)}
const claimOf=(id,text)=>(CLAIMS.get(id)||[]).find(c=>c.text===text);
const AUDIT=new Map(D.audit.map(a=>[a.id,a]));
const EVID_BY_REC=new Map(),EVID_BY_PAGE=new Map();
for(const e of D.evidence){for(const id of e.ids){if(!EVID_BY_REC.has(id))EVID_BY_REC.set(id,[]);EVID_BY_REC.get(id).push(e)}if(!EVID_BY_PAGE.has(e.page))EVID_BY_PAGE.set(e.page,[]);EVID_BY_PAGE.get(e.page).push(e)}
const K_ORDER=['manual','editorial','external','warning'];
const K_LABEL={manual:'En el libro',editorial:'Síntesis editorial',external:'Verificar fuera',warning:'Precaución'};
const K_LONG={manual:'Corresponde a un apartado del manual 2023 (respaldo temático, no cita literal).',editorial:'Síntesis creada para consulta; no es una exigencia citada del libro.',external:'El manual no basta: confirmar norma, edición, OEM o procedimiento.',warning:'Advertencia de uso seguro, no cita de una norma.'};
const API_BY_CODE=new Map(D.api.map(a=>[a.code,a]));
const ROLE={insp:['Inspección y mantenimiento','INSP'],dis:['Diseño y fabricación','DISEÑO'],oper:['Instalación, operación y pruebas','OPER'],seg:['Seguridad operacional','SEG'],elec:['Instalación eléctrica','ELÉC'],ndt:['Servicios NDT','NDT'],rep:['Reparación y remanufactura','REPAR']};
const apisOf=r=>(r.apis||[]).map(c=>API_BY_CODE.get(c)).filter(Boolean);
const RECS_BY_API=new Map();for(const r of D.records)for(const c of r.apis||[]){if(!RECS_BY_API.has(c))RECS_BY_API.set(c,[]);RECS_BY_API.get(c).push(r)}
function sysApis(sys){const n=new Map();for(const r of D.records)if(r.system===sys)for(const c of r.apis||[])n.set(c,(n.get(c)||0)+1);return [...n.entries()].sort((a,b)=>b[1]-a[1]).map(([c,k])=>({a:API_BY_CODE.get(c),k})).filter(x=>x.a)}
const apiShort=c=>c.replace(/^API\s+/,'');
const kCounts=id=>{const o={manual:0,editorial:0,external:0,warning:0};for(const c of CLAIMS.get(id)||[])o[c.k]++;return o};

/* ------------------------------------------------------------ storage */
let favs=load('rig-pocket-favs',[]);if(!Array.isArray(favs))favs=[];
let recent=load('rig-pocket-recent',[]);if(!Array.isArray(recent))recent=[];
let pagesSaved=load('rig-pocket-pages-v14',[]);if(!Array.isArray(pagesSaved))pagesSaved=[];
let notes=load('rig-pocket-notes-v14',{});if(!notes||typeof notes!=='object'||Array.isArray(notes))notes={};
let reviews=load('rig-pocket-review-v21',{});if(!reviews||typeof reviews!=='object'||Array.isArray(reviews))reviews={};
favs=favs.filter(id=>REC.has(id));recent=recent.filter(id=>REC.has(id));pagesSaved=pagesSaved.filter(n=>Number.isInteger(n)&&n>=1&&n<=TOTAL);

/* ------------------------------------------------------------ theme */
const root=document.documentElement;
function effectiveTheme(){const t=root.dataset.theme;if(t)return t;return matchMedia('(prefers-color-scheme: dark)').matches?'night':'day'}
try{const t=localStorage.getItem('rig-pocket-ui-theme');if(t==='night'||t==='day')root.dataset.theme=t}catch{}
function toggleTheme(){const next=effectiveTheme()==='night'?'day':'night';root.dataset.theme=next;try{localStorage.setItem('rig-pocket-ui-theme',next)}catch{};paintChrome()}

/* ------------------------------------------------------------ page images */
const imgCache=new Map();
function imgURL(n){
  if(imgCache.has(n))return imgCache.get(n);
  const el=document.getElementById('img-'+n);if(!el)return '';
  const b=atob(el.textContent.trim()),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
  const url=URL.createObjectURL(new Blob([u],{type:'image/webp'}));imgCache.set(n,url);return url;
}

/* ============================================================ SEARCH ENGINE
   One tokenizer, one matcher, one ranker for every searchable surface. */
const PHRASES=[[/\btop\s+drive\b/g,'topdrive'],[/\bmud\s+pumps?\b/g,'bomba lodo'],[/\bpower\s+end\b/g,'powerend'],[/\bfluid\s+end\b/g,'fluidend'],
  [/\bpipe\s+handler\b/g,'pipehandler'],[/\bshale\s+shakers?\b/g,'shaker'],[/\bcontrol\s+de\s+pozos?\b/g,'bop'],[/\bbop\s+stack\b/g,'bop'],
  [/\blinea\s+muerta\b/g,'lineamuerta'],[/\bno\s+destructiv[oa]s?\b/g,'ndt'],[/\bensayos?\s+no\b/g,'ndt']];
const SYN={bombas:'bomba',pump:'bomba',pumps:'bomba',mudpump:'bomba',mud:'lodo',lodos:'lodo',top:'topdrive',drive:'topdrive',
  preventora:'bop',preventoras:'bop',blowout:'bop',annular:'anular',ram:'ariete',rams:'ariete',arietes:'ariete',
  koomey:'acumulador',acumuladora:'acumulador',acumuladores:'acumulador',torre:'mastil',torres:'mastil',derrick:'mastil',mast:'mastil',masts:'mastil',
  grua:'izaje',hoisting:'izaje',hoist:'izaje',levantamiento:'izaje',levante:'izaje',zarandas:'shaker',zaranda:'shaker',shakers:'shaker',
  mangueras:'manguera',motores:'motor',generadores:'generador',cables:'cable',poleas:'polea',valves:'valvula',valve:'valvula',valvulas:'valvula',
  destructivo:'ndt',destructivos:'ndt',destructivas:'ndt',destructiva:'ndt',end:'ndt',categorias:'categoria',category:'categoria',cat:'categoria',
  penetrantes:'pt',penetrante:'pt',magneticas:'mt',magnetica:'mt',ultrasonido:'ut',ultrasonica:'ut',radiografia:'rt',frenos:'freno',presiones:'presion',
  substructure:'subestructura',zapatas:'zapata',cunas:'cuna',slips:'cuna',elevadores:'elevador',tanques:'tanque',lineas:'linea',pruebas:'prueba'};
const STOP=new Set(('quiero necesito saber buscar dime que cual cuales como cuando cuanto cuantas cuantos verificar revisar revisa revisan revisarse inspeccionar inspeccion inspecciones inspection revision '+
  'requisito requisitos del de la el los las lo le al para por un una unos unas en con sobre hacer cada se debe debo debemos deberia deberian deben me mi su sus '+
  'equipo equipos rig taladro sistema sistemas parte partes y o mas esto esta este ese esa informacion consultar relacionado acerca general requiere requieren aplica aplican '+
  'corresponde existen especifico especifica examinar observar considerar ver mostrar procedimiento procedimientos aplicable exige hay durante tiene necesario necesaria '+
  'obligatorio donde seria and what which the of to is a chequeo metodo metodos componente componentes es son esta estan entre sin tipo tipos').split(' '));
const ROMAN=new Set(['i','ii','iii','iv','1','2','3','4','categoria']);

function toks(s){let x=norm(s);for(const[r,p]of PHRASES)x=x.replace(r,p);return x.split(' ').map(w=>SYN[w]??w).filter(w=>w&&w.length>1)}
function queryWords(q){return [...new Set(toks(q).filter(w=>!STOP.has(w)&&!ROMAN.has(w)))]}
function facets(q){
  let n=norm(q).replace(/\bcategorias\b/g,'categoria');for(const[r,p]of PHRASES)n=n.replace(r,p);
  const cat=[['IV',/\b(?:categoria|category|cat)(?:\s+de\s+inspeccion)?\s*(?:iv|4|cuatro)\b/],['III',/\b(?:categoria|category|cat)(?:\s+de\s+inspeccion)?\s*(?:iii|3|tres)\b/],['II',/\b(?:categoria|category|cat)(?:\s+de\s+inspeccion)?\s*(?:ii|2|dos)\b/],['I',/\b(?:categoria|category|cat)(?:\s+de\s+inspeccion)?\s*(?:i|1|uno)\b/]].find(([,r])=>r.test(n))?.[0]||'';
  const method=[['UT',/\b(ut|ultrasonido|ultrasonica)\b/],['MT',/\b(mt|particulas magneticas)\b/],['PT',/\b(pt|liquidos penetrantes|penetrantes)\b/],['RT',/\b(rt|radiografia)\b/],['VT',/\b(vt|inspeccion visual)\b/],['NDT',/\b(ndt|end)\b/]].filter(([,r])=>r.test(n)).map(x=>x[0]);
  const system=[['izaje',/\b(izaje|mastil|torre|malacate|corona|bloque viajero|levantamiento|cable)\b/],['circ',/\b(bomba|bombas|lodo|fluidend|powerend|succion|shaker|zaranda|tanque|circulacion)\b/],['rot',/\b(topdrive|rotaria|swivel|kelly)\b/],['pozo',/\b(bop|ariete|anular|koomey|acumulador|choke|preventora|control de pozo)\b/],['pot',/\b(scr|generador|diesel|motor)\b/]].filter(([,r])=>r.test(n)).map(x=>x[0]);
  return {category:cat,method,system,numeric:/\b(presion|psi|bar|tolerancia|cuanto|frecuencia|intervalo|capacidad|espesor|rechazo|porcentaje)\b/.test(n),
    model:/\b(pz9|pz8|pz11|pt110|t1600|cameron|nov|bomco|varco|canrig|tesco)\b/.test(n),
    apiIntent:/\b(api|rp|spec|std|norma|normas|estandar|edicion|vigente)\b/.test(n),
    legalIntent:/\b(resolucion|retie|anh|ministerio|decreto|ley|onac|certificado|licencia|copnia|reglamento)\b/.test(n)};
}
function lev1(a,b){if(Math.abs(a.length-b.length)>1)return false;let i=0,j=0,e=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue}if(++e>1)return false;if(a.length>b.length)i++;else if(b.length>a.length)j++;else{i++;j++}}return e+(a.length-i)+(b.length-j)<=1}
function field(text){const arr=[...new Set(toks(text))];return {set:new Set(arr),arr}}
function hit(f,t,fuzzy){
  if(f.set.has(t))return 1;
  if(t.length>=4)for(const s of f.arr){if(s.startsWith(t))return .85;if(s.length>=4&&t.startsWith(s)&&t.length-s.length<=2)return .85}
  if(fuzzy&&t.length>=5)for(const s of f.arr)if(s.length>=5&&lev1(s,t))return .6;
  return 0;
}
/* doc = {title:field, body:field}. Returns [{doc, s, cov}] sorted. */
function rank(docs,words,{fuzzy=true,min=.6,boost,relaxed=false}={}){
  if(!words.length)return [];
  const need=relaxed?Math.max(1,Math.ceil(words.length*.5)):words.length<=2?words.length:Math.ceil(words.length*min),out=[];
  for(const d of docs){let s=0,hits=0,th=0;
    for(const t of words){const a=hit(d.title,t,fuzzy);if(a){s+=10*a;hits++;th++;continue}const b=hit(d.body,t,fuzzy);if(b){s+=3*b;hits++}}
    if(hits<need)continue;s+=12*hits/words.length;if(th===words.length)s+=8;if(boost)s+=boost(d)||0;out.push({doc:d,s,cov:hits/words.length})}
  return out.sort((a,b)=>b.s-a.s||b.cov-a.cov);
}
/* corpora, built once */
const IDX={
  rec:D.records.map(r=>({r,title:field(r.title+' '+r.aliases.join(' ')),body:field([(r.apis||[]).join(' '),r.description,...r.checks,...r.docs,r.alert,...(D.deep[r.id]||[]).map(x=>x.slice(0,4).join(' '))].join(' '))})),
  sub:Object.entries(D.deep).flatMap(([id,rows])=>byId(id)?rows.map((x,i)=>({r:byId(id),i,row:x,title:field(x[0]+' '+byId(id).title+' '+byId(id).aliases.join(' ')),body:field(x.slice(1,4).join(' '))})):[]),
  guide:D.guides.map(g=>({g,title:field(g.q),body:field(g.a+' '+g.steps.join(' ')+' '+g.group)})),
  gloss:D.glossary.map(g=>({g,title:field(g.term),body:field(g.definition+' '+g.group)})),
  api:D.api.map(a=>({a,title:field(a.code+' '+a.title),body:field([a.scope,a.group,a.changes||''].join(' '))})),
  co:D.colombia.map(c=>({c,title:field(c.name),body:field([c.kind,c.group,c.historic,c.update,c.status].join(' '))})),
  portal:D.portals.map(p=>({p,title:field(p.name+' '+p.tag),body:field(p.desc+' '+p.tip)})),
  ev:D.evidence.map(e=>({e,title:field(e.title),body:field(e.point+' '+e.basis+' '+e.ids.map(id=>byId(id)?.title||'').join(' '))})),
  defect:D.defects.map(x=>({x,title:field(x.term+' '+x.sub),body:field(x.signal+' '+x.check+' '+x.search)})),
  page:D.ocr.map((t,i)=>({n:i+1,title:field(D.pageTitles[i]),body:field(t)}))
};
function searchPages(q,words,recHits,mod){
  if(!words.length)return [];
  const linked=new Map();recHits.slice(0,8).forEach((x,i)=>{for(const p of x.doc.r.pages)linked.set(p,Math.max(linked.get(p)||0,24-i*2))});
  const out=[];
  for(const d of IDX.page){if(mod&&modOf(d.n)?.id!==mod)continue;let c=0;for(const t of words)if(hit(d.body,t,false)||hit(d.title,t,false))c++;
    const l=linked.get(d.n)||0;if(c===words.length||(l&&c>0)||(l&&words.length===1))out.push({n:d.n,s:l+c*4+(c===words.length?6:0)})}
  return out.sort((a,b)=>b.s-a.s||a.n-b.n).map(x=>x.n);
}
function search(q,opts={}){
  const words=queryWords(q),f=facets(q);
  const recBoost=d=>(f.system.includes(d.r.system)?6:0)+(f.category&&d.r.id==='f1'?(words.length?8:30):0)+(f.method.length&&['f3','f4','f5','f6','f7'].includes(d.r.id)?4:0);
  let rec=rank(IDX.rec,words,{boost:recBoost});
  let partial=false;
  if(!rec.length&&words.length>1){rec=rank(IDX.rec,words,{boost:recBoost,relaxed:true});partial=rec.length>0}
  if(!words.length&&f.category)rec=[{doc:IDX.rec.find(d=>d.r.id==='f1'),s:40,cov:1}];
  const sub=rank(IDX.sub,words,{min:.5}).slice(0,12).map(x=>x.doc);
  const guide=rank(IDX.guide,words,{min:.7});
  const gloss=rank(IDX.gloss,words,{min:.7}).slice(0,8);
  const apiQ=words.filter(w=>!['api','rp','spec','std','norma','normas','estandar','edicion','vigente'].includes(w));
  const api=f.apiIntent||!rec.length?rank(IDX.api,f.apiIntent?words:apiQ,{fuzzy:false}).slice(0,6):[];
  const co=f.legalIntent||!rec.length?rank(IDX.co,words,{fuzzy:false}).slice(0,5):[];
  const portal=f.legalIntent||!rec.length?rank(IDX.portal,words,{fuzzy:false}).slice(0,4):[];
  const ev=rank(IDX.ev,words,{min:.66}).slice(0,4);
  const pages=opts.pages===false?[]:searchPages(q,words,rec,opts.mod);
  return {q,words,f,rec,partial,sub,guide,gloss,api,co,portal,ev,pages};
}
/* accent-insensitive highlighter for raw query words */
const ACC={a:'[aáàäâ]',e:'[eéèëê]',i:'[iíìïî]',o:'[oóòöô]',u:'[uúùüû]',n:'[nñ]',c:'[cç]'};
function hlRe(q){const ws=norm(q).split(' ').filter(w=>w.length>=3&&!STOP.has(w)).map(w=>w.replace(/[aeiouncç]/g,c=>ACC[c]||c));return ws.length?new RegExp('(^|[^\\p{L}\\p{N}])((?:'+ws.join('|')+')[\\p{L}\\p{N}]*)','giu'):null}
function hl(text,re){text=String(text??'');if(!re)return esc(text);let out='',last=0;text.replace(re,(m,pre,w,off)=>{const s=off+pre.length;out+=esc(text.slice(last,s))+'<mark>'+esc(w)+'</mark>';last=s+w.length;return m});return out+esc(text.slice(last))}
function snippet(n,q){const t=(D.ocr[n-1]||'').replace(/\s+/g,' ');if(!t.trim())return 'Lámina gráfica o de separación, sin texto reconocible.';const low=norm(t),w=queryWords(q);
  let i=-1;for(const x of norm(q).split(' ').filter(x=>x.length>=3&&!STOP.has(x))){i=low.indexOf(x);if(i>=0)break}
  if(i<0)for(const x of w){i=low.indexOf(x);if(i>=0)break}
  if(i<0)return t.slice(0,150)+'…';return (i>60?'…':'')+t.slice(Math.max(0,i-60),i+120)+'…'}

/* ============================================================ ROUTER */
let cur={parts:[],params:new URLSearchParams()},freshNav=false,readerPushed=false,lastMainKey='';
const scrollMem=new Map();
function parse(){const h=location.hash.slice(1)||'/';const[path,qs='']=h.split('?');return {parts:path.split('/').filter(Boolean).map(decodeURIComponent),params:new URLSearchParams(qs)}}
function mainKey(r){const p=new URLSearchParams(r.params);p.delete('pag');p.delete('ocr');return r.parts.join('/')+'?'+p.toString()}
function hash(parts,params){const p=params instanceof URLSearchParams?params:new URLSearchParams(Object.entries(params||{}).filter(([,v])=>v!==''&&v!=null));const qs=p.toString();return '#/'+parts.map(encodeURIComponent).join('/')+(qs?'?'+qs:'')}
const H=(path,params)=>hash(path.split('/').filter(Boolean),params);
function go(h,{replace=false}={}){freshNav=true;if(replace){history.replaceState(null,'',h);route()}else if(location.hash===h)route();else location.hash=h}
function setParams(obj,{push=false}={}){const p=new URLSearchParams(cur.params);for(const[k,v]of Object.entries(obj)){if(v===''||v==null)p.delete(k);else p.set(k,v)}const h=hash(cur.parts,p);if(push)go(h);else{history.replaceState(null,'',h);cur=parse();lastMainKey=mainKey(cur)}}

function route(){
  const prevKey=lastMainKey;scrollMem.set(prevKey,window.scrollY);
  cur=parse();const key=mainKey(cur);
  if(key!==lastMainKey){const swap=()=>renderMain();if(freshNav&&document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.startViewTransition(swap);else swap();lastMainKey=key;
    if(freshNav)window.scrollTo(0,0);else window.scrollTo(0,scrollMem.get(key)||0);
    if(freshNav&&prevKey)setTimeout(focusHead,80)}
  renderReader();freshNav=false;
}
function focusHead(){const h=$('main h1');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}}

/* ============================================================ SHARED PARTS */
const NAV=[['','Inicio','home'],['buscar','Buscar','search'],['sistemas','Sistemas','grid'],['manual','Manual','book'],['mas','Más','more']];
function section0(){const p=cur.parts[0]||'';if(['sistema','ficha'].includes(p))return 'sistemas';if(['guias','guia','atlas','defectos','ndt','api','colombia','certificados','evidencia','auditoria','guardados'].includes(p))return 'mas';return p}
function paintChrome(){
  const s=section0(),night=effectiveTheme()==='night';
  $('#top').innerHTML=`<div class="top-in"><a class="wordmark" href="#/" aria-label="Rig Inspection Pocket, inicio">${DERRICK_MARK}<span class="wm-name">Rig<span>/</span>Inspection</span><span class="wm-ver">POCKET ${VERSION}</span></a>
   <nav class="top-links" aria-label="Secciones">${NAV.map(([p,l])=>`<a href="#/${p}" class="${s===p?'on':''}">${l}</a>`).join('')}</nav>
   <a class="tbtn" href="#/buscar" aria-label="Buscar">${ico('search',20)}</a>
   <button class="tbtn" data-a="theme" aria-label="${night?'Cambiar a tema de día':'Cambiar a tema de noche'}" aria-pressed="${night}">${ico(night?'sun':'moon',20)}</button></div>`;
  $('#nav').innerHTML=`<div class="nav-in">${NAV.map(([p,l,i])=>`<a href="#/${p}" class="${s===p?'on':''}" ${s===p?'aria-current="page"':''}>${ico(i)}<span>${l}</span></a>`).join('')}</div>`;
}
const DERRICK_MARK='<svg viewBox="0 0 22 26" aria-hidden="true"><path d="M11 1 3 25M11 1l8 24M6.2 16h9.6M8 10.5h6M3 25h16M6.2 16l7.8-5.5M15.8 16 8 10.5"/></svg>';
const foot=()=>`<p class="foot">RIG INSPECTION POCKET ${VERSION} · Fichas editoriales basadas en el manual de capacitación ACE Internacional / Ecopetrol (2023). Guía de estudio y consulta: no es acta de inspección, no certifica ni libera equipos. Normas, ediciones y OEM se verifican en su fuente.</p>`;
const head=(mono,title,lede,backHref)=>`${backHref?`<a class="back" href="${backHref}">${ico('back',14)} Volver</a>`:''}<header class="head"><span class="mono">${mono}</span><h1>${title}</h1>${lede?`<p>${lede}</p>`:''}</header>`;
const sec=(n,title,aside='')=>`<div class="sec-h"><span class="n">§${pad2(n)}</span><h2>${title}</h2>${aside?`<span class="aside">${aside}</span>`:''}</div>`;
const pgBtn=(n,label)=>Number.isInteger(n)&&n>=1&&n<=TOTAL?`<button class="pg" data-pg="${n}" aria-label="Abrir página ${n} del manual">${label||'PDF '+pad(n)}</button>`:'';
const pgList=ps=>`<div class="pgs">${[...new Set(ps)].map(n=>pgBtn(n)).join('')}</div>`;
const kGlyph=k=>`<i class="k k-${k}" aria-hidden="true"></i>`;
const kTag=k=>`<span class="tag">${kGlyph(k)}${K_LABEL[k]}</span>`;
const legend=()=>`<div class="legend">${K_ORDER.map(k=>`<span>${kGlyph(k)}${K_LABEL[k]}</span>`).join('')}</div>`;
function kBar(c){const t=K_ORDER.reduce((a,k)=>a+c[k],0)||1;return `<div class="bar" role="img" aria-label="${K_ORDER.map(k=>c[k]+' '+K_LABEL[k].toLowerCase()).join(', ')}">${K_ORDER.map(k=>c[k]?`<i class="b-${k}" style="width:${(c[k]/t*100).toFixed(1)}%"></i>`:'').join('')}</div>`}
function recRow(r,re){const m=MOD.get(r.system),c=kCounts(r.id);
  return `<a class="row" href="#/ficha/${r.id}"><span class="code">${recCode(r.id)}</span><span class="body"><span class="t">${hl(r.title,re)}</span><span class="d">${hl(r.description.length>150?r.description.slice(0,148)+'…':r.description,re)}</span><span class="m mono">${esc(m.name)}${r.apis?.length?' · <b>'+esc(r.apis.slice(0,2).map(apiShort).join(' · '))+'</b>':''} · PDF ${r.pages.map(pad).join(' ')} · ${c.manual}/${c.manual+c.editorial+c.external+c.warning} en el libro${favs.includes(r.id)?' · <b>guardada</b>':''}</span></span>${ico('chev',16).replace('class="i"','class="i go"')}</a>`}
function pageRow(n,q,re){const m=modOf(n);return `<button class="row" data-pg="${n}"><span class="code">PDF<br>${pad(n)}</span><span class="body"><span class="t">${hl(D.pageTitles[n-1],re)}</span><span class="d">${q?hl(snippet(n,q),re):esc(m?m.name:'Preliminares / cierre')}</span>${pagesSaved.includes(n)?'<span class="m mono"><b>marcada</b></span>':''}</span></button>`}
function thumbs(ps){return `<div class="thumbs">${ps.map(n=>`<button class="thumb" data-pg="${n}" aria-label="Abrir página ${n}"><span class="ph"><img loading="lazy" decoding="async" alt="" src="${imgURL(n)}"></span><span class="mono">PDF ${pad(n)}</span></button>`).join('')}</div>`}
function evBlock(e,withRecs){return `<div class="ev"><span class="mono">Cotejo visual · PDF ${pad(e.page)} · ${esc(e.basis)}</span><strong>${esc(e.title)}</strong><p>${esc(e.point)}</p><div class="pgs">${pgBtn(e.page,'Abrir lámina '+pad(e.page))}<button class="pg" data-a="cite" data-n="${e.page}" data-t="${esc(e.title)}">${ico('copy',13)} Citar</button>${withRecs?e.ids.map(id=>byId(id)?`<a class="pg" href="#/ficha/${id}">${recCode(id)} ${esc(byId(id).title)}</a>`:'').join(''):''}</div></div>`}
const apiChip=a=>`<a class="api-chip" href="#/api/${a.id}" title="${esc(ROLE[D.apiRoles[a.code]]?.[0]||'')}"><b>${esc(apiShort(a.code))}</b><span>${esc(ROLE[D.apiRoles[a.code]]?.[1]||'REF')}</span></a>`;
const scope=t=>`<p class="note"><strong>Alcance.</strong> ${t}</p>`;
const field_=(id,ph,val,label,small)=>`<label class="sr" for="${id}">${label}</label><div class="field${small?' small':''}">${ico('search',20)}<input id="${id}" data-p="q" type="search" autocomplete="off" enterkeyhint="search" placeholder="${esc(ph)}" value="${esc(val||'')}"></div>`;

/* ============================================================ VIEWS */
const V={};

V.home=()=>{
  const rc=recent.map(byId).filter(Boolean).slice(0,4),changed=D.audit.filter(a=>a.changed).length;
  const tools=[['atlas','Atlas del rig','Mapa de subconjuntos por sistema','layers'],['ndt','Centro NDT','Métodos, alcance y límites','probe'],['defectos','Defectos','Señales que piden investigar','defect'],
    ['guias','Guías y glosario',`${D.guides.length} respuestas · ${D.glossary.length} términos`,'faq'],['api','Biblioteca API',`${D.api.length} normas · ${D.api.filter(a=>a.book).length} citadas en el libro`,'std'],
    ['colombia','Normativa Colombia',`${D.colombia.length} resoluciones y entidades`,'law'],['certificados','Certificados','Portales oficiales de verificación','cert'],
    ['evidencia','Evidencia','Cotejos contra las láminas','evidence'],['auditoria','Auditoría',`${D.claims.length} enunciados clasificados`,'audit']];
  return `<section class="home-top">
   <div class="home-title"><div><span class="mono">Referencia técnica de campo · manual 2023</span><h1>Rig<br>Inspec<em>/</em>tion</h1></div>
   <svg class="derrick" viewBox="0 0 74 100" aria-hidden="true"><path d="M37 6 14 92M37 6l23 86M22 62h30M27 40h20M31 22h12M14 92h46M22 62l25-22M52 62 27 40M27 40l16-18M47 40 31 22M8 98h58M20 92v6M54 92v6"/><path class="dim" d="M68 6v86M65 6h6M65 92h6M3 6v86"/><path class="dim" d="M1 6h4M1 92h4" /></svg></div>
   <form data-a="homesearch" role="search">${field_('hq','Equipo, falla, norma o categoría','','Buscar en la biblioteca')}</form>
   <div class="quick">${['Fluid End','Koomey','Categoría IV mástil','Preventora de arietes','Cable de perforación','UT','API RP 4G'].map(t=>`<a href="${H('buscar',{q:t})}">${esc(t)}</a>`).join('')}</div>
   <div class="home-meta"><div><strong>${D.records.length}</strong><span class="mono">fichas</span></div><div><strong>${TOTAL}</strong><span class="mono">láminas</span></div><div><strong>${D.claims.length}</strong><span class="mono">enunciados auditados</span></div></div>
  </section>
  <section class="sec">${sec(1,'Sistemas del taladro',`PDF 1–${TOTAL}`)}
   ${D.modules.map(m=>{const n=D.records.filter(r=>r.system===m.id).length;return `<a class="sys" href="#/sistema/${m.id}"><span class="no">${pad2(MOD.get(m.id).no)}</span><span class="t">${esc(m.name)}</span><span class="cnt">${n} fichas</span><span class="d">${esc(m.subtitle)}<span class="sys-api">${sysApis(m.id).slice(0,3).map(x=>esc(apiShort(x.a.code))).join(' · ')}</span></span><span class="track" title="Páginas ${m.start}–${m.end}"><i style="left:${((m.start-1)/TOTAL*100).toFixed(2)}%;width:${((m.end-m.start+1)/TOTAL*100).toFixed(2)}%"></i></span></a>`}).join('')}
  </section>
  <section class="sec">${sec(2,'Herramientas')}
   <div class="tools">${tools.map(([p,t,d,i],k)=>`<a class="tool" href="#/${p}"><span class="tn"><span>T-${pad2(k+1)}</span>${ico(i,20)}</span><strong>${t}</strong><span class="d">${d}</span></a>`).join('')}</div>
  </section>
  ${(()=>{const ks=Object.keys(reviews).filter(id=>byId(id)&&Object.values(reviews[id].items||{}).some(x=>x.s)).sort((a,b)=>(reviews[b].updated||'').localeCompare(reviews[a].updated||''));if(!ks.length)return '';const id=ks[0],r=byId(id),R=reviews[id],n=r.checks.length+r.docs.length,dn=Object.values(R.items).filter(x=>x.s).length;return `<a class="resume" href="${H('ficha/'+id,{rev:1})}"><span class="mono"><b>Revisión en curso</b> · ${dn}/${n}</span><strong>${esc(r.title)}</strong><span class="d">${esc(R.equip||'Equipo sin identificar')}</span><span class="rv-prog"><i style="width:${(dn/n*100).toFixed(1)}%"></i></span></a>`})()}
  ${rc.length?`<section class="sec">${sec(3,'Consultado recientemente')}<div class="rows">${rc.map(r=>recRow(r)).join('')}</div></section>`:''}
  <section class="sec">${sec(rc.length?4:3,'Procedencia')}
   <p class="lede">Las ${D.records.length} fichas son síntesis editoriales del manual de capacitación ACE Internacional / Ecopetrol 2023. Se revisaron contra el manual: ${changed} necesitaron corregir sus páginas de referencia. Cada enunciado indica si corresponde al libro, si es síntesis o si debe verificarse fuera.</p>
   <div class="btns"><a class="btn" href="#/auditoria">${ico('audit',16)} Ver auditoría</a><a class="btn" href="#/manual">${ico('book',16)} Abrir el manual</a></div>
  </section>${foot()}`;
};

V.buscar=()=>{const q=cur.params.get('q')||'';
  return `${head('Búsqueda local · sin conexión','Buscar',`${D.records.length} fichas, ${Object.values(D.deep).reduce((a,x)=>a+x.length,0)} subconjuntos, guías, glosario, normas y el texto de las ${TOTAL} láminas.`)}
  <form data-a="noop" role="search" style="margin-top:14px">${field_('q','p. ej. fluid end, cat IV, koomey',q,'Buscar')}</form><div id="res">${V.buscar.res()}</div>`};
V.buscar.res=()=>{const q=(cur.params.get('q')||'').trim();
  if(!q)return `<section class="sec">${sec(1,'Consultas frecuentes')}<div class="rows">${['Bomba de lodo','Top Drive','BOP','NDT','Categoría IV','Acumulador','Zarandas','Generadores','Choke manifold','Cable de perforación'].map(t=>`<a class="row tight" href="${H('buscar',{q:t})}"><span class="body"><span class="t">${t}</span></span>${ico('arrow',16)}</a>`).join('')}</div>
   <p class="note">Admite sinónimos y jerga de campo (koomey, zaranda, preventora, torre, fluid end), siglas (UT, MT, BOP, SPM) y pequeños errores de escritura.</p></section>`;
  const R=search(q),re=hlRe(q),n=R.rec.length+R.sub.length+R.guide.length+R.gloss.length+R.api.length+R.co.length+R.portal.length+R.pages.length;
  if(!n)return `<div class="empty"><strong>Sin coincidencias</strong>Prueba un sinónimo, una sigla (UT, BOP, SPM) o el nombre de un equipo. También puedes <a class="link" href="${H('manual',{q})}">buscar solo en el texto del manual</a>.</div>`;
  let h=best(R,re);
  if(R.rec.length)h+=group('Fichas técnicas',R.rec.length)+`<div class="rows">${R.rec.slice(0,8).map(x=>recRow(x.doc.r,re)).join('')}</div>`+(R.rec.length>8?`<details><summary class="btn more-btn">Ver ${R.rec.length-8} fichas más</summary><div class="rows">${R.rec.slice(8).map(x=>recRow(x.doc.r,re)).join('')}</div></details>`:'');
  if(R.sub.length)h+=group('Subconjuntos',R.sub.length)+`<div class="rows">${R.sub.slice(0,6).map(x=>`<a class="row" href="${H('ficha/'+x.r.id,{sub:x.i})}"><span class="code">${recCode(x.r.id)}<br>.${pad2(x.i+1)}</span><span class="body"><span class="t">${hl(x.row[0],re)}</span><span class="d">${esc(x.r.title)} · ${hl(x.row[1],re)}</span></span></a>`).join('')}</div>`;
  if(R.guide.length)h+=group('Guías de consulta',R.guide.length)+`<div class="rows">${R.guide.slice(0,4).map(x=>guideRow(x.doc.g,re)).join('')}</div>`;
  if(R.api.length)h+=group('Normas API',R.api.length)+`<div class="rows">${R.api.map(x=>apiRow(x.doc.a,re)).join('')}</div>`;
  if(R.co.length||R.portal.length)h+=group('Normativa y portales',R.co.length+R.portal.length)+`<div class="rows">${R.co.map(x=>coRow(x.doc.c,re)).join('')}${R.portal.map(x=>`<a class="row" href="${H('certificados',{q:x.doc.p.name})}"><span class="code">PORT</span><span class="body"><span class="t">${hl(x.doc.p.name,re)}</span><span class="d">${esc(x.doc.p.tag)}</span></span></a>`).join('')}</div>`;
  if(R.gloss.length)h+=group('Glosario',R.gloss.length)+`<div class="rows">${R.gloss.slice(0,5).map(x=>glossRow(x.doc.g,re)).join('')}</div>`;
  if(R.pages.length)h+=group('Texto del manual (OCR)',R.pages.length)+`<p class="note">Coincidencias en el texto reconocido automáticamente. Abre la lámina para comprobar cifras y tablas.</p><div class="rows">${R.pages.slice(0,8).map(n=>pageRow(n,q,re)).join('')}</div>${R.pages.length>8?`<a class="btn more-btn" href="${H('manual',{q})}">${ico('book',16)} Ver las ${R.pages.length} páginas</a>`:''}`;
  return h+foot()};
const group=(t,n)=>`<div class="group-h"><h2>${t}</h2><span class="mono">${n}</span></div>`;
function best(R,re){
  const r=R.rec[0],g=R.guide[0],f=R.f;
  const chips=[f.category&&'Categoría '+f.category,...f.method,...f.system.map(s=>MOD.get(s).name)].filter(Boolean);
  const flags=[f.category&&`La categoría ${f.category} por sí sola no determina el ensayo ni el criterio de aceptación de cada equipo.`,
    f.method.length&&`Mencionar ${f.method.join('/')} no implica que ese método sea obligatorio para el equipo consultado.`,
    f.model&&'La consulta menciona un modelo o fabricante: esta biblioteca general no sustituye su manual OEM.',
    f.numeric&&'Límites, presiones y frecuencias requieren norma, edición, fabricante y procedimiento. Aquí no se infieren.'].filter(Boolean);
  const flagH=flags.map(t=>`<div class="flag">${ico('alert',16)}<span>${t}</span></div>`).join('');
  if(g&&(!r||g.s>r.s+4)){const x=g.doc.g;
    return `<article class="best"><div class="best-h"><span class="mono"><b>Respuesta de guía</b> · ${esc(x.group)}</span><span class="mono">${x.status==='manual'?'Resumen del manual':'Síntesis orientativa'}</span></div><div class="best-b"><h2>${hl(x.q,re)}</h2><p>${hl(x.a,re)}</p>${chips.length?`<div class="facets">${chips.map(c=>`<span>${esc(c)}</span>`).join('')}</div>`:''}${flagH}<div class="btns"><a class="btn solid" href="#/guia/${x.id}">Leer la guía ${ico('arrow',16)}</a>${x.pages.slice(0,3).map(n=>pgBtn(n)).join('')}</div></div></article>`}
  if(!r||r.s<14)return flagH?`<div style="margin-top:16px">${flagH}</div>`:'';
  const rr=r.doc.r,c=kCounts(rr.id),pts=rr.checks.map(t=>({t,k:claimOf(rr.id,t)?.k||'editorial'})).sort((a,b)=>K_ORDER.indexOf(a.k)-K_ORDER.indexOf(b.k)).slice(0,3);
  return `<article class="best"><div class="best-h"><span class="mono"><b>${R.partial?'Coincidencia parcial':'Mejor coincidencia'}</b> · ${recCode(rr.id)} · ${esc(MOD.get(rr.system).name)}</span><span class="mono">${c.manual} en el libro · ${c.external} a verificar</span></div>
   <div class="best-b"><h2>${hl(rr.title,re)}</h2><p>${hl(rr.description,re)}</p>${chips.length?`<div class="facets">${chips.map(c=>`<span>${esc(c)}</span>`).join('')}</div>`:''}
   <ul>${pts.map(p=>`<li>${kGlyph(p.k)}<span>${hl(p.t,re)}</span></li>`).join('')}</ul>${flagH}
   <div class="btns"><a class="btn solid" href="#/ficha/${rr.id}">Abrir ficha ${ico('arrow',16)}</a>${rr.pages.slice(0,3).map(n=>pgBtn(n)).join('')}</div></div></article>`;
}

V.sistemas=()=>{const m=cur.params.get('m')||'';const list=D.records.filter(r=>!m||r.system===m);
  return `${head('Índice de fichas','Sistemas',`${D.records.length} fichas técnicas en ${D.modules.length} sistemas, cada una enlazada a las láminas del manual.`)}
  <nav class="seg" aria-label="Filtrar por sistema" style="margin-top:16px"><a href="#/sistemas" class="${!m?'on':''}">Todos</a>${D.modules.map(x=>`<a href="${H('sistemas',{m:x.id})}" class="${m===x.id?'on':''}">${esc(x.name)}</a>`).join('')}</nav>
  <div class="group-h"><h2>${m?esc(MOD.get(m).name):'Todas las fichas'}</h2><span class="mono">${list.length}</span></div><div class="rows">${list.map(r=>recRow(r)).join('')}</div>${foot()}`};

V.sistema=()=>{const m=MOD.get(cur.parts[1]);if(!m)return V.sistemas();const list=D.records.filter(r=>r.system===m.id);
  return `${head(`${sysCode(m.id)} · Manual PDF ${m.start}–${m.end}`,esc(m.name),esc(m.subtitle),'#/')}
  <div class="btns"><a class="btn" href="${H('manual',{m:m.id})}">${ico('book',16)} Láminas del módulo (${m.end-m.start+1})</a>${pgBtn(m.start,'Abrir PDF '+pad(m.start))}</div>
  ${(()=>{const xs=sysApis(m.id);return xs.length?`<section class="sec">${sec(1,'Normas API del sistema',xs.length+' normas')}<p class="note">Normas que aparecen asociadas a las fichas de este sistema. Cuál aplica depende del componente y de si se evalúa su diseño o su condición en servicio: abre cada ficha para ver su asociación concreta.</p><div class="rows">${xs.map(({a,k})=>`<a class="row" href="#/api/${a.id}"><span class="code">${esc(ROLE[D.apiRoles[a.code]]?.[1]||'REF')}</span><span class="body"><span class="t">${esc(a.code)}</span><span class="d">${esc(a.title)}</span><span class="m mono">${k} ${k===1?'ficha':'fichas'} · ${esc(a.edition==='No confirmada'?'edición por confirmar':a.edition)}${a.book?' · <b>citada en el libro</b>':''}</span></span></a>`).join('')}</div></section>`:''})()}
  <section class="sec">${sec(2,'Fichas técnicas',list.length+' fichas')}<div class="rows">${list.map(r=>recRow(r)).join('')}</div></section>${foot()}`};

V.ficha=()=>{
  const r=byId(cur.parts[1]);if(!r)return notFound();
  recent=[r.id,...recent.filter(x=>x!==r.id)].slice(0,14);save('rig-pocket-recent',recent);
  const m=MOD.get(r.system),c=kCounts(r.id),a=AUDIT.get(r.id)||{},ev=(EVID_BY_REC.get(r.id)||[]),deep=D.deep[r.id]||[],fav=favs.includes(r.id);
  const total=K_ORDER.reduce((s,k)=>s+c[k],0),apis=apisOf(r),rv=cur.params.get('rev')==='1',R=reviews[r.id]||{items:{}};
  const items=[...r.checks.map((t,i)=>['c'+i,t]),...r.docs.map((t,i)=>['d'+i,t])],done=items.filter(([k])=>R.items[k]?.s).length,obs=items.filter(([k])=>R.items[k]?.s==='obs').length;
  const item=(t,i,key)=>{const cl=claimOf(r.id,t)||{k:'editorial'};const p=cl.page||a.main;const st=R.items[key]||{};
    const ctl=rv?`<span class="rv" role="group" aria-label="Estado del punto ${i+1}">${[['ok','Conforme','check'],['obs','Observación','alert'],['na','No aplica','minus']].map(([v,l,ic])=>`<button class="rv-b rv-${v} ${st.s===v?'on':''}" data-a="rv" data-id="${r.id}" data-k="${key}" data-v="${v}" aria-pressed="${st.s===v}">${ico(ic,15)}<span>${l}</span></button>`).join('')}</span>${st.s==='obs'?`<textarea class="ta rv-note" data-rvnote="${r.id}|${key}" rows="2" maxlength="600" placeholder="Describe la observación, ubicación o evidencia…">${esc(st.n||'')}</textarea>`:''}`:'';
    return `<li class="chk is-${cl.k}${rv&&st.s?' rv-'+st.s+'-row':''}"><span class="no">${rv&&st.s==='ok'?ico('check',14):pad2(i+1)}</span><span class="tx">${esc(t)}</span><span class="meta">${kTag(cl.k)}${pgBtn(p,'p. '+pad(p))}</span>${ctl}</li>`};
  const rel=D.records.filter(t=>t.system===r.system&&t.id!==r.id).slice(0,5);
  const warn=r.alert?`<div class="caution" role="note">${ico('alert',18)}<div><strong>Precaución técnica</strong>${esc(r.alert)}</div></div>`:'';
  return `<a class="back" href="#/sistema/${m.id}">${ico('back',14)} ${esc(m.name)}</a>
  <header class="head"><span class="mono">${sysCode(m.id)} · ${esc(m.name)} · Ficha ${recCode(r.id)}</span><h1>${esc(r.title)}</h1><p>${esc(r.description)}</p></header>
  <div class="tb">
   <div><span class="mono">Ficha</span><span class="v mono">${recCode(r.id)} · ${sysCode(m.id)}</span></div>
   <div><span class="mono">Láminas PDF</span><span class="v mono">${r.pages.map(pad).join(' · ')}</span></div>
   <div><span class="mono">Cotejos visuales</span><span class="v">${ev.length?plural(ev.length,'lámina','láminas'):'Sin cotejo puntual'}</span></div>
   <div><span class="mono">Fuente</span><span class="v">Manual 2023</span></div>
   <div class="full"><span class="mono">Normas API asociadas</span>${apis.length?`<div class="api-chips">${apis.map(apiChip).join('')}</div>`:'<span class="v">Sin norma API específica en el catálogo · seguir OEM</span>'}</div>
   <div class="full"><span class="mono">Respaldo de ${total} enunciados · ${c.manual} libro · ${c.editorial} síntesis · ${c.external} externo · ${c.warning} alerta</span>${kBar(c)}</div>
  </div>
  <div class="btns"><button class="btn ${fav?'on':''}" data-a="fav" data-id="${r.id}" aria-pressed="${fav}">${ico('mark',16)} ${fav?'Guardada':'Guardar'}</button><button class="btn" data-a="copy" data-id="${r.id}">${ico('copy',16)} Copiar resumen</button><button class="btn" data-a="tonotes">${ico('text',16)} ${notes[r.id]?'Ver nota':'Añadir nota'}</button><a class="btn ${rv?'on':'solid'}" href="${H('ficha/'+r.id,rv?{}:{rev:1})}">${ico('clipboard',16)} ${rv?'Salir de revisión':done?`Revisión ${done}/${items.length}`:'Modo revisión'}</a></div>
  ${rv?`<section class="rv-panel" aria-label="Revisión en campo"><div class="rv-head"><span class="mono"><b>Revisión en campo</b> · ${done}/${items.length} puntos · ${obs} ${obs===1?'observación':'observaciones'}</span><span class="mono">${R.updated?'Guardado '+new Date(R.updated).toLocaleString('es-CO',{dateStyle:'short',timeStyle:'short'}):'Sin iniciar'}</span></div>
   <div class="rv-prog" role="progressbar" aria-valuemin="0" aria-valuemax="${items.length}" aria-valuenow="${done}"><i style="width:${(done/items.length*100).toFixed(1)}%"></i>${obs?`<i class="o" style="width:${(obs/items.length*100).toFixed(1)}%"></i>`:''}</div>
   <div class="rv-fields"><label><span class="lbl">Equipo · serie o placa</span><input class="sel" data-rvf="${r.id}|equip" value="${esc(R.equip||'')}" placeholder="p. ej. Bomba #2, S/N…"></label><label><span class="lbl">Ubicación · taladro</span><input class="sel" data-rvf="${r.id}|place" value="${esc(R.place||'')}" placeholder="p. ej. Rig 12, pozo…"></label></div>
   <div class="btns"><button class="btn" data-a="rvcopy" data-id="${r.id}">${ico('copy',16)} Copiar informe</button><button class="btn" data-a="rvprint">${ico('download',16)} Imprimir / PDF</button><button class="btn" data-a="rvclear" data-id="${r.id}">${ico('x',16)} Borrar</button></div>
   <p class="note">Registro personal de consulta guardado en este navegador. <strong>No es un acta de inspección</strong> ni libera equipos: los criterios de aceptación salen de la norma, el OEM y el procedimiento aprobado.</p></section>`:''}
  ${warn}
  <section class="sec">${sec(1,'Qué revisar',r.checks.length+' puntos')}<ol class="rows">${r.checks.map((t,i)=>item(t,i,'c'+i)).join('')}</ol>${legend()}</section>
  <section class="sec">${sec(2,'Evidencia a solicitar')}<ol class="rows">${r.docs.map((t,i)=>item(t,i,'d'+i)).join('')}</ol></section>
  <section class="sec noprint">${sec(3,'Normas API asociadas',apis.length?apis.length+' normas':'')}${apis.length?`<div class="rows">${apis.map(x=>`<a class="row" href="#/api/${x.id}"><span class="code">${esc(ROLE[D.apiRoles[x.code]]?.[1]||'REF')}</span><span class="body"><span class="t">${esc(x.code)} <span class="mono">· ${esc(ROLE[D.apiRoles[x.code]]?.[0]||'')}</span></span><span class="d">${esc(x.title)}</span><span class="m mono">${esc(x.edition==='No confirmada'?'Edición por confirmar':x.edition)}${x.book?' · <b>citada en el libro</b>':' · complementaria'}</span></span>${ico('chev',16).replace('class="i"','class="i go"')}</a>`).join('')}</div>`:'<p class="lede">El catálogo no tiene una norma API específica para este equipo. Rigen el manual del fabricante (OEM), el procedimiento de la empresa y, si aplica, la normativa eléctrica o de seguridad.</p>'}
   <p class="note"><strong>Por qué varía.</strong> Para un mismo equipo suele haber una norma de <em>diseño y fabricación</em> (Spec) y otra de <em>inspección y mantenimiento en servicio</em> (RP). La que aplica depende de qué se evalúa, del tipo y modelo de equipo, del contrato y del regulador. Esta asociación es editorial: confirma alcance y edición en la norma.</p></section>
  ${deep.length?`<section class="sec noprint">${sec(4,'Por subconjunto',deep.length+' partes')}<p class="note">Organiza la revisión. Las alertas son señales para investigar, <strong>no</strong> criterios automáticos de rechazo.</p>${deep.map((x,i)=>`<details class="sub" id="sub-${i}"><summary><span class="code">.${pad2(i+1)}</span><strong>${esc(x[0])}</strong>${ico('chev',16)}</summary><div class="sub-body"><dl><div><dt>Qué observar</dt><dd>${esc(x[1])}</dd></div><div><dt>Alertas y posibles defectos</dt><dd>${esc(x[2])}</dd></div><div><dt>Evidencia</dt><dd>${esc(x[3])}</dd></div></dl><div>${pgBtn(x[4],'Fuente · PDF '+pad(x[4]))}</div></div></details>`).join('')}</section>`:''}
  <section class="sec noprint">${sec(deep.length?5:4,'Láminas del manual',r.pages.length+' páginas')}${thumbs(r.pages)}${ev.map(e=>evBlock(e)).join('')}</section>
  <section class="sec noprint">${sec(deep.length?6:5,'Procedencia')}<div class="prov">
   <p><b>Revisión de páginas.</b> ${esc(a.note||'Sin registro.')} ${a.changed?'<span class="st acc">Páginas corregidas en auditoría</span>':''}</p>
   <p><b>Tratamiento.</b> ${esc(a.action||'Pendiente.')}</p>
   ${K_ORDER.filter(k=>c[k]).map(k=>`<p>${kGlyph(k)} <b>${K_LABEL[k]} (${c[k]}).</b> ${K_LONG[k]}</p>`).join('')}
   <p class="note">Una página vinculada o un cotejo parcial no validan cada frase ni la vigencia de una norma. Ante cifras o límites, prioriza la lámina original, la edición vigente y el OEM.</p></div></section>
  <section class="sec noprint" id="notas">${sec(deep.length?7:6,'Nota privada')}<p class="note">Se guarda solo en este navegador. Exporta una copia desde Guardados si cambias de dispositivo.</p>
   <label class="sr" for="note">Nota sobre ${esc(r.title)}</label><textarea id="note" class="ta" maxlength="1500" placeholder="Duda pendiente, referencia, hallazgo a consultar…" style="margin-top:12px">${esc(notes[r.id]||'')}</textarea>
   <div class="btns"><button class="btn solid" data-a="note" data-id="${r.id}">Guardar nota</button></div></section>
  ${rel.length?`<section class="sec noprint">${sec(deep.length?8:7,'Mismo sistema')}<div class="rows">${rel.map(x=>recRow(x)).join('')}</div></section>`:''}${foot()}`;
};

function notFound(){return `${head('Error 404','No encontrado','Esa dirección no corresponde a ninguna ficha o sección.')}<div class="btns"><a class="btn solid" href="#/">Ir al inicio</a></div>`}

V.manual=()=>{const q=cur.params.get('q')||'',m=cur.params.get('m')||'';
  return `${head('Archivo completo · fuente primaria','Manual',`Las ${TOTAL} láminas originales del manual 2023, disponibles sin conexión, con su texto OCR.`)}
  <form data-a="jump" class="ctl" style="grid-template-columns:1fr auto;align-items:end"><div><label class="lbl" for="jumpn">Ir a la página PDF</label><input id="jumpn" class="sel" type="number" inputmode="numeric" min="1" max="${TOTAL}" placeholder="1–${TOTAL}"></div><button class="btn solid" style="height:42px">Abrir</button></form>
  <div style="margin-top:10px">${field_('mq','Buscar en el texto de las láminas',q,'Buscar en el manual',true)}</div>
  <nav class="seg" aria-label="Filtrar por módulo" style="margin-top:14px"><a href="${H('manual',{q})}" class="${!m?'on':''}">Todas</a>${D.modules.map(x=>`<a href="${H('manual',{q,m:x.id})}" class="${m===x.id?'on':''}">${esc(x.name)}</a>`).join('')}</nav>
  <div id="res">${V.manual.res()}</div>`};
V.manual.res=()=>{const q=(cur.params.get('q')||'').trim(),m=cur.params.get('m')||'',o=Math.max(0,parseInt(cur.params.get('o')||'0',10)||0),re=hlRe(q),per=15;
  let pool=Array.from({length:TOTAL},(_,i)=>i+1).filter(n=>!m||modOf(n)?.id===m);
  if(q){const R=search(q,{mod:m||null});pool=R.pages}
  const shown=pool.slice(o,o+per);
  return `<div class="group-h"><h2>${q?'Coincidencias':'Índice por página'}</h2><span class="mono">${pool.length} páginas</span></div>
  ${shown.length?`<div class="rows">${shown.map(n=>pageRow(n,q,re)).join('')}</div>`:`<div class="empty"><strong>Sin páginas</strong>Prueba otra palabra o quita el filtro de módulo. ${D.ocr.filter(t=>t.trim().length<20).length} láminas son gráficas y no tienen texto reconocible.</div>`}
  ${pool.length>per?`<div class="btns" style="justify-content:space-between;align-items:center">${o>0?`<a class="btn" href="${H('manual',{q,m,o:Math.max(0,o-per)})}">${ico('prev',16)} Anterior</a>`:'<span></span>'}<span class="mono">${o+1}–${Math.min(o+per,pool.length)} de ${pool.length}</span>${o+per<pool.length?`<a class="btn" href="${H('manual',{q,m,o:o+per})}">Siguiente ${ico('next',16)}</a>`:'<span></span>'}</div>`:''}${foot()}`};

const guideRow=(g,re)=>`<a class="row" href="#/guia/${g.id}"><span class="code">${g.id.toUpperCase()}</span><span class="body"><span class="t">${hl(g.q,re)}</span><span class="m mono">${esc(g.group)} · ${g.status==='manual'?'resumen del manual':'síntesis orientativa'} · PDF ${g.pages.map(pad).join(' ')}</span></span></a>`;
const glossRow=(g,re)=>`<a class="row" href="#/ficha/${g.record}"><span class="code">${esc(g.group.slice(0,4).toUpperCase())}</span><span class="body"><span class="t">${hl(g.term,re)}</span><span class="d">${hl(g.definition,re)}</span><span class="m mono">Ficha ${recCode(g.record)} · PDF ${g.pages.map(pad).join(' ')}</span></span></a>`;
V.guias=()=>{const tab=cur.params.get('tab')==='glosario'?'glosario':'faq',q=cur.params.get('q')||'';
  return `${head('Consulta rápida','Guías y glosario','Respuestas prácticas con páginas de referencia, y el vocabulario técnico español–inglés del taladro.')}
  <nav class="seg" style="margin-top:16px" aria-label="Sección"><a href="${H('guias',{q})}" class="${tab==='faq'?'on':''}">Preguntas (${D.guides.length})</a><a href="${H('guias',{tab:'glosario',q})}" class="${tab==='glosario'?'on':''}">Glosario (${D.glossary.length})</a><a href="#/ndt">Métodos NDT</a></nav>
  <div style="margin-top:14px">${field_('gq',tab==='glosario'?'IBOP, crosshead, SPM…':'bomba, BOP, categoría IV…',q,'Filtrar',true)}</div><div id="res">${V.guias.res()}</div>`};
V.guias.res=()=>{const tab=cur.params.get('tab')==='glosario'?'glosario':'faq',q=(cur.params.get('q')||'').trim(),w=queryWords(q),re=hlRe(q);
  if(tab==='glosario'){const list=w.length?rank(IDX.gloss,w,{min:1}).map(x=>x.doc.g):[...D.glossary].sort((a,b)=>a.term.localeCompare(b.term,'es'));
    return `<div class="group-h"><h2>Términos</h2><span class="mono">${list.length}</span></div><div class="rows">${list.map(g=>glossRow(g,re)).join('')||'<div class="empty"><strong>Sin términos</strong>Prueba otra palabra.</div>'}</div>${foot()}`}
  const list=w.length?rank(IDX.guide,w,{min:.7}).map(x=>x.doc.g):D.guides;const groups=[...new Set(list.map(g=>g.group))];
  return list.length?groups.map(gr=>`<div class="group-h"><h2>${esc(gr)}</h2><span class="mono">${list.filter(g=>g.group===gr).length}</span></div><div class="rows">${list.filter(g=>g.group===gr).map(g=>guideRow(g,re)).join('')}</div>`).join('')+foot():`<div class="empty"><strong>Sin respuestas</strong>Prueba con el nombre de un equipo.</div>`};
V.guia=()=>{const g=D.guides.find(x=>x.id===cur.parts[1]);if(!g)return notFound();
  return `${head(`Guía ${g.id.toUpperCase()} · ${esc(g.group)} · ${g.status==='manual'?'resumen del manual':'síntesis orientativa'}`,esc(g.q),'', '#/guias')}
  <section class="sec">${sec(1,'Respuesta')}<p class="lede" style="font-size:16.5px;color:var(--ink)">${esc(g.a)}</p><div class="btns"><button class="btn" data-a="copyguide" data-id="${g.id}">${ico('copy',16)} Copiar con fuente</button></div></section>
  <section class="sec">${sec(2,'Qué comprobar o preguntar')}<ol class="rows">${g.steps.map((s,i)=>`<li class="chk"><span class="no">${pad2(i+1)}</span><span class="tx">${esc(s)}</span></li>`).join('')}</ol></section>
  <section class="sec">${sec(3,'Fuentes del manual')}${thumbs(g.pages)}<p class="note">${g.status==='manual'?'Resumen editorial apoyado en las páginas indicadas; no se cotejó cada afirmación.':'Síntesis orientativa: cada punto requiere contraste con fuentes oficiales.'} Las guías no forman parte de la auditoría de ${D.claims.length} enunciados.</p></section>
  <section class="sec">${sec(4,'Fichas relacionadas')}<div class="rows">${g.ids.map(byId).filter(Boolean).map(r=>recRow(r)).join('')}</div></section>${foot()}`};

V.ndt=()=>{const id=cur.params.get('m')||'VT',t=D.ndt.find(x=>x.id===id)||D.ndt[0];
  const rec={VT:'f7',PT:'f4',MT:'f5',UT:'f6',RT:'f7',ET:'f7',AE:'f7'}[t.id];
  const cmp=[['VT','Visual','Discontinuidades visibles, condiciones superficiales y geometría accesible.','No revela defectos internos.'],['PT','Líquidos penetrantes','Indicaciones abiertas a superficie en materiales compatibles.','Requiere acceso, limpieza y superficie apta.'],['MT','Partículas magnéticas','Discontinuidades superficiales y cercanas en materiales ferromagnéticos.','No sirve para materiales no ferromagnéticos.'],['UT','Ultrasonido','Evaluación volumétrica o de espesores según técnica y calibración.','Sensible a acceso, geometría y operador.'],['RT','Radiografía','Evaluación volumétrica de ciertas discontinuidades.','Exige radioprotección y personal autorizado.'],['ET','Corrientes inducidas','Indicaciones según conductividad, geometría y técnica.','Profundidad y tipo de defecto dependen del método.'],['AE','Emisión acústica','Actividad acústica bajo estímulo controlado.','No dimensiona ni acepta por sí sola.']];
  return `${head('Ensayos no destructivos · END','Centro NDT','Qué aporta cada método, dónde está su límite y qué pedir en el informe.')}
  <nav class="seg" style="margin-top:16px" aria-label="Método">${D.ndt.map(x=>`<a href="${H('ndt',{m:x.id})}" class="${x.id===t.id?'on':''}">${x.id}</a>`).join('')}</nav>
  <section class="sec">${sec(1,`${t.id} · ${esc(t.name)}`,esc(t.depth))}<dl class="kv">
   <div><dt>Qué puede aportar</dt><dd>${esc(t.good)}</dd></div><div><dt>Límite del método</dt><dd>${esc(t.limit)}</dd></div><div><dt>Qué verificar en el informe</dt><dd>${esc(t.request)}</dd></div></dl>
   <div class="btns"><a class="btn" href="#/ficha/${rec}">Ficha ${recCode(rec)} ${ico('arrow',16)}</a>${pgBtn(28,'Clasificación · PDF 028')}</div></section>
  <section class="sec">${sec(2,'Comparador')}<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Método</th><th>Aplicación típica</th><th>Limitación</th></tr></thead><tbody>${cmp.map(m=>`<tr><th>${m[0]}<small>${m[1]}</small></th><td>${m[2]}</td><td>${m[3]}</td></tr>`).join('')}</tbody></table></div>
   <p class="note">Orientativo. El método exigido lo determinan el componente, el material, el procedimiento y la norma aplicable; no el nombre del equipo ni la categoría por sí solos.</p></section>
  <section class="sec">${sec(3,'Tres verificaciones distintas')}<dl class="kv"><div><dt>NDT / END</dt><dd>Examina una propiedad o busca indicaciones sin destruir el elemento.</dd></div><div><dt>Prueba funcional</dt><dd>Demuestra una respuesta o secuencia de operación en condiciones definidas.</dd></div><div><dt>Prueba de presión</dt><dd>Comprueba el desempeño del límite de presión según un procedimiento autorizado.</dd></div></dl></section>${foot()}`};

V.atlas=()=>{const s=cur.params.get('s')||D.atlas[0].id,a=D.atlas.find(x=>x.id===s)||D.atlas[0];
  return `${head('Mapa conceptual · no es plano OEM','Atlas del rig','Elige un sistema y entra en la ficha de cada subconjunto. La lámina de referencia abre el manual.')}
  <nav class="seg" style="margin-top:16px" aria-label="Sistema">${D.atlas.map(x=>`<a href="${H('atlas',{s:x.id})}" class="${x.id===a.id?'on':''}">${esc(x.name)}</a>`).join('')}</nav>
  <div class="atlas"><button class="atlas-img" data-pg="${a.page}" aria-label="Abrir lámina ${a.page}"><img src="${imgURL(a.page)}" alt="Lámina ${a.page} del manual: ${esc(a.name)}"><span class="mono">Lámina PDF ${pad(a.page)} · ampliar</span></button>
   <div><div class="group-h" style="margin-top:0"><h2>${esc(a.name)}</h2><span class="mono">${esc(a.group)}</span></div><p class="note">${esc(a.desc)}</p>
   <div class="rows">${a.nodes.map(([l,id],i)=>`<a class="callout" href="#/ficha/${id}"><span class="bub">${i+1}</span><span><strong>${esc(l)}</strong><span class="d" style="display:block;color:var(--muted);font-size:13px">${esc(byId(id)?.title||'')}</span></span>${ico('chev',16)}</a>`).join('')}</div></div></div>${foot()}`};

V.defectos=()=>`${head('Señales de anomalía','Defectos y hallazgos','Condiciones que piden investigar. No son diagnósticos ni criterios de rechazo.')}
  <div style="margin-top:14px">${field_('dq','desgaste, corrosión, fuga, cable…',cur.params.get('q')||'','Buscar anomalías',true)}</div><div id="res">${V.defectos.res()}</div>`;
V.defectos.res=()=>{const q=(cur.params.get('q')||'').trim(),w=queryWords(q),re=hlRe(q);const list=w.length?rank(IDX.defect,w,{min:.5}).map(x=>x.doc.x):D.defects;
  return `<div class="group-h"><h2>Condiciones</h2><span class="mono">${list.length}</span></div>${list.map((d,i)=>`<details class="sub"${w.length&&i===0?' open':''}><summary><span class="code">${d.id.toUpperCase()}</span><strong>${hl(d.term,re)}<span class="d" style="display:block;font-weight:400;color:var(--muted);font-size:13px">${esc(d.sub)}</span></strong>${ico('chev',16)}</summary><div class="sub-body"><dl><div><dt>Qué llama la atención</dt><dd>${hl(d.signal,re)}</dd></div><div><dt>Cómo investigarlo</dt><dd>${esc(d.check)}</dd></div></dl><div class="pgs">${d.pages.map(n=>pgBtn(n)).join('')}<a class="pg" href="#/ficha/${d.record}">Ficha ${recCode(d.record)}</a></div></div></details>`).join('')||'<div class="empty"><strong>Sin coincidencias</strong>Intenta otro término.</div>'}
  ${scope('las páginas sirven como punto de consulta; no todas contienen fotografías del defecto descrito.')}${foot()}`};

const apiRow=(a,re)=>`<a class="row" href="#/api/${a.id}"><span class="code">${esc(a.kind||'')}</span><span class="body"><span class="t">${hl(a.code,re)}</span><span class="d">${hl(a.title,re)}</span><span class="m mono">${esc(a.edition==='No confirmada'?'Edición por confirmar':a.edition)}${a.edition_date?' · '+esc(String(a.edition_date).slice(0,4)):''} · ${a.book?'<b>citada en el libro</b>':'complementaria'}</span></span></a>`;
V.api=()=>{if(cur.parts[1])return V.apiDetail();const g=cur.params.get('g')||'',b=cur.params.get('b')==='1';const groups=[...new Set(D.api.map(a=>a.group))];
  return `${head(`Revisión del catálogo: ${esc(D.meta.apiReview)}`,'Biblioteca API',`${D.api.length} normas: ${D.api.filter(a=>a.book).length} citadas en el manual y ${D.api.filter(a=>!a.book).length} complementarias. El texto de las normas no está incluido.`)}
  <div style="margin-top:14px">${field_('aq','API RP 4G, BOP, cable…',cur.params.get('q')||'','Buscar norma',true)}</div>
  <div class="ctl" style="grid-template-columns:1fr auto;align-items:end"><div><label class="lbl" for="ag">Grupo</label><select id="ag" class="sel" data-p="g"><option value="">Todos</option>${groups.map(x=>`<option ${g===x?'selected':''}>${esc(x)}</option>`).join('')}</select></div><label class="check"><input type="checkbox" data-p="b" ${b?'checked':''}> Solo del libro</label></div>
  <div id="res">${V.api.res()}</div>`};
V.api.res=()=>{const q=(cur.params.get('q')||'').trim(),g=cur.params.get('g')||'',b=cur.params.get('b')==='1',re=hlRe(q);
  let list=q?rank(IDX.api,queryWords(q),{fuzzy:false,min:.5}).map(x=>x.doc.a):D.api;list=list.filter(a=>(!g||a.group===g)&&(!b||a.book));
  return `<div class="group-h"><h2>Normas</h2><span class="mono">${list.length} de ${D.api.length}</span></div><div class="rows">${list.map(a=>apiRow(a,re)).join('')||'<div class="empty"><strong>Sin resultados</strong>Prueba otra sigla o un equipo.</div>'}</div>
  ${scope('una norma puede ser relevante sin ser la única aplicable. Una edición «en desarrollo» no es una edición publicada.')}${foot()}`};
V.apiDetail=()=>{const a=D.api.find(x=>x.id===cur.parts[1]);if(!a)return notFound();const ck=a.check;
  return `${head(`Biblioteca API · ${esc(a.group)} · ${a.book?'citada en el libro':'complementaria'}`,esc(a.code),esc(a.title),'#/api')}
  <dl class="kv">
   <div><dt>Edición publicada identificada · ${esc(D.meta.apiReview)}</dt><dd class="big">${esc(a.edition||'Por confirmar')}</dd><dd class="mono">${a.edition_date?'Fecha '+esc(a.edition_date):'Fecha por confirmar en el registro API'}</dd></div>
   ${ck?`<div><dt>Comprobación oficial puntual · ${esc(ck.date)}</dt><dd>${esc(ck.what)} <a class="link ext" href="${esc(ck.source)}" target="_blank" rel="noopener noreferrer">Fuente API</a></dd></div>`:''}
   ${a.changes?`<div><dt>Adendas y erratas</dt><dd>${esc(a.changes)}</dd></div>`:''}
   ${a.development?`<div><dt>En desarrollo · no publicado</dt><dd>${esc(a.development)}</dd></div>`:''}
   <div><dt>De qué trata</dt><dd>${esc(a.scope)}</dd></div>
   <div><dt>En el manual 2023</dt><dd>${a.book?`El manual menciona ${esc(a.code)}${a.code==='API RP 4G'?' e identifica la 5.ª edición (2019) y sus adendas en las páginas 53–54':'; la lista normativa no le asigna edición'}.`:'No aparece en la lista API del manual (PDF 30–31). Se añadió como referencia complementaria.'}${a.book?pgList(a.pages.slice(0,8)):''}</dd></div>
  </dl>
  <div class="btns"><a class="btn" href="${esc(a.source)}" target="_blank" rel="noopener noreferrer">${ico('external',16)} Registro API</a>${a.source2&&a.source2!==a.source?`<a class="btn" href="${esc(a.source2)}" target="_blank" rel="noopener noreferrer">${ico('external',16)} Actualizaciones</a>`:''}</div>
  ${(RECS_BY_API.get(a.code)||[]).length?`<section class="sec">${sec(1,'Fichas asociadas',RECS_BY_API.get(a.code).length)}<p class="note">Rol de esta norma en esas fichas: <strong>${esc(ROLE[D.apiRoles[a.code]]?.[0]||'referencia')}</strong>.</p><div class="rows">${RECS_BY_API.get(a.code).map(r=>recRow(r)).join('')}</div></section>`:''}
  ${scope('una especificación de fabricación no determina por sí sola pruebas, frecuencia ni aceptación en servicio. Esta ficha no da acceso al texto licenciado ni certifica vigencia jurídica.')}${foot()}`};

const coRow=(c,re)=>`<a class="row" href="#/colombia/${c.id}"><span class="code">${esc(c.kind.slice(0,4).toUpperCase())}</span><span class="body"><span class="t">${hl(c.name,re)}</span><span class="d">${hl(c.update,re)}</span><span class="m"><span class="st ${/Derogada|Sustituida|Derogaci/.test(c.status)?'alert':c.status==='Actualizado'?'ok':''}">${esc(c.status)}</span> <span class="mono">${esc(c.group)}${c.pages.length?' · libro PDF '+c.pages.map(pad).join(' '):''}</span></span></span></a>`;
V.colombia=()=>{if(cur.parts[1])return V.coDetail();const g=cur.params.get('g')||'';const groups=[...new Set(D.colombia.map(c=>c.group))];
  return `${head(`Revisión documental: ${esc(D.meta.coReview)}`,'Normativa Colombia','Resoluciones, reglamentos y entidades citados por el libro, con su estado posterior. La referencia de 2023 nunca se reemplaza en silencio.')}
  <div style="margin-top:14px">${field_('cq','181495, ANH, RETIE…',cur.params.get('q')||'','Buscar resolución o entidad',true)}</div>
  <div class="ctl"><div><label class="lbl" for="cg">Área</label><select id="cg" class="sel" data-p="g"><option value="">Todas</option>${groups.map(x=>`<option ${g===x?'selected':''}>${esc(x)}</option>`).join('')}</select></div></div><div id="res">${V.colombia.res()}</div>`};
V.colombia.res=()=>{const q=(cur.params.get('q')||'').trim(),g=cur.params.get('g')||'',re=hlRe(q);let list=q?rank(IDX.co,queryWords(q),{fuzzy:false,min:.5}).map(x=>x.doc.c):D.colombia;list=list.filter(c=>!g||c.group===g);
  return `<div class="group-h"><h2>Referencias</h2><span class="mono">${list.length}</span></div><div class="rows">${list.map(c=>coRow(c,re)).join('')||'<div class="empty"><strong>Sin resultados</strong>Prueba otra búsqueda.</div>'}</div>${scope('«Por verificar» no significa vigente. La aplicación concreta exige leer el texto completo y sus disposiciones transitorias.')}${foot()}`};
V.coDetail=()=>{const c=D.colombia.find(x=>x.id===cur.parts[1]);if(!c)return notFound();
  return `${head(`Normativa Colombia · ${esc(c.kind)} · ${esc(c.group)}`,esc(c.name),'','#/colombia')}
  <dl class="kv"><div><dt>Estado identificado</dt><dd><span class="st ${/Derog|Sustitu/.test(c.status)?'alert':''}">${esc(c.status)}</span></dd></div>
   <div><dt>Lo que cita el manual (2023)</dt><dd>${esc(c.historic)}${c.pages.length?pgList(c.pages):'<br><span class="mono">No figura en la tabla original del libro</span>'}</dd></div>
   <div><dt>Estado o cambio posterior · ${esc(D.meta.coReview)}</dt><dd>${esc(c.update)}</dd></div>
   ${c.reg?`<div><dt>${esc(c.reg.status)} · revisión ${esc(D.meta.v2Date)}</dt><dd>${esc(c.reg.desc)} <a class="link ext" href="${esc(c.reg.url)}" target="_blank" rel="noopener noreferrer">Disposición oficial</a></dd></div>`:''}</dl>
  <div class="btns"><a class="btn" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${ico('external',16)} Fuente institucional</a></div>
  ${scope('la referencia histórica del manual sigue intacta. No se verificaron individualmente todas las derogatorias; consulta la fuente primaria antes de aplicar.')}${foot()}`};

V.certificados=()=>`${head('Acceso externo directo','Verificar certificados',`Portales oficiales para contrastar licencias, acreditaciones y registros. La app no emite ni valida certificados.`)}
  <p class="note"><strong>Primero:</strong> API Composite List y ONAC, que el propio libro cita (PDF 16–17 y 23). Las instrucciones están disponibles sin conexión; los portales requieren internet.</p>
  <div style="margin-top:14px">${field_('pq','API Composite, ONAC, licencia…',cur.params.get('q')||'','Buscar portal',true)}</div><div id="res">${V.certificados.res()}</div>`;
V.certificados.res=()=>{const q=(cur.params.get('q')||'').trim(),re=hlRe(q);const list=q?rank(IDX.portal,queryWords(q),{fuzzy:false,min:.5}).map(x=>x.doc.p):D.portals;
  return `<div class="group-h"><h2>Portales</h2><span class="mono">${list.length}</span></div>${list.map(p=>`<section class="sec" style="margin-top:18px"><div class="sec-h"><span class="n">${p.important?'LIBRO':'PORT'}</span><h2 style="text-transform:none">${hl(p.name,re)}</h2></div><p class="mono" style="margin:8px 0 0">${esc(p.tag)}</p><p class="lede">${hl(p.desc,re)}</p><p class="note"><strong>Cómo usarlo.</strong> ${esc(p.tip)}</p>${p.book.length?pgList(p.book):''}<div class="btns"><a class="btn solid" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${ico('external',16)} Ir al portal</a></div></section>`).join('')||'<div class="empty"><strong>Sin portales</strong>Prueba otra palabra.</div>'}${foot()}`};

V.evidencia=()=>{const s=cur.params.get('s')||'';
  return `${head('Cotejos visuales parciales','Evidencia',`${D.evidence.length} observaciones contrastadas con láminas concretas del libro. «Cotejado» se refiere solo a la observación de cada bloque, no a toda la ficha, cada cifra ni la norma actual.`)}
  <div style="margin-top:14px">${field_('eq','Poleas, BOP, 165, Fluid End…',cur.params.get('q')||'','Buscar evidencia',true)}</div>
  <div class="ctl"><div><label class="lbl" for="es">Sistema</label><select id="es" class="sel" data-p="s"><option value="">Todos</option>${D.modules.map(m=>`<option value="${m.id}" ${s===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select></div></div><div id="res">${V.evidencia.res()}</div>`};
V.evidencia.res=()=>{const q=(cur.params.get('q')||'').trim(),s=cur.params.get('s')||'';let list;
  if(/^\d{1,3}$/.test(q))list=D.evidence.filter(e=>e.page===+q);else list=q?rank(IDX.ev,queryWords(q),{min:.5}).map(x=>x.doc.e):[...D.evidence].sort((a,b)=>a.page-b.page);
  list=list.filter(e=>!s||e.system===s);
  return `<div class="group-h"><h2>Observaciones</h2><span class="mono">${list.length}</span></div>${list.map(e=>evBlock(e,true)).join('')||`<div class="empty"><strong>Sin cotejos coincidentes</strong>Eso no significa que el tema no esté en el manual. <a class="link" href="${H('manual',{q})}">Buscar en las láminas</a>.</div>`}${foot()}`};

V.auditoria=()=>{const k=cur.params.get('k')||'',s=cur.params.get('s')||'';const tot={};for(const x of K_ORDER)tot[x]=D.claims.filter(c=>c.k===x).length;
  return `${head(`Integridad de referencias · ${esc(D.meta.v2Date)}`,'Auditoría',`${D.claims.length} enunciados de las ${D.records.length} fichas, clasificados según su respaldo en el manual.`)}
  <div class="tb" style="margin-top:18px">${K_ORDER.map(x=>`<div><span class="mono">${kGlyph(x)} ${K_LABEL[x]}</span><span class="v" style="font:700 28px/1 var(--f-display)">${tot[x]}</span></div>`).join('')}<div class="full">${kBar(tot)}</div></div>
  <p class="note"><strong>Alcance de la revisión.</strong> Se cotejó el tema principal de cada ficha con el libro y se clasificó cada enunciado de forma editorial. No equivale a validar cada frase palabra por palabra ni a comprobar todas las normas API y OEM.</p>
  <div style="margin-top:14px">${field_('vq','Power End, NDT, BOP, desgaste…',cur.params.get('q')||'','Buscar en los enunciados',true)}</div>
  <div class="ctl" style="grid-template-columns:1fr 1fr"><div><label class="lbl" for="vk">Respaldo</label><select id="vk" class="sel" data-p="k"><option value="">Todos</option>${K_ORDER.map(x=>`<option value="${x}" ${k===x?'selected':''}>${K_LABEL[x]}</option>`).join('')}</select></div><div><label class="lbl" for="vs">Sistema</label><select id="vs" class="sel" data-p="s"><option value="">Todos</option>${D.modules.map(m=>`<option value="${m.id}" ${s===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select></div></div>
  <div id="res">${V.auditoria.res()}</div>`};
V.auditoria.res=()=>{const q=(cur.params.get('q')||'').trim(),k=cur.params.get('k')||'',s=cur.params.get('s')||'',n=Math.max(40,parseInt(cur.params.get('n')||'40',10)||40),w=queryWords(q),re=hlRe(q);
  let list=D.claims.filter(c=>(!k||c.k===k)&&(!s||byId(c.id)?.system===s));
  if(w.length){const docs=list.map(c=>({c,title:field(byId(c.id)?.title||''),body:field(c.text+' '+c.type)}));list=rank(docs,w,{min:.6}).map(x=>x.doc.c)}
  return `<div class="group-h"><h2>Enunciados</h2><span class="mono">${list.length} · ${new Set(list.map(c=>c.id)).size} fichas</span></div>
  <div class="rows">${list.slice(0,n).map(c=>{const p=c.page||AUDIT.get(c.id)?.main;return `<div class="chk is-${c.k}"><span class="no">${kGlyph(c.k)}</span><span class="tx">${hl(c.text,re)}</span><span class="meta">${kTag(c.k)}<a class="pg" href="#/ficha/${c.id}">${recCode(c.id)} ${esc(byId(c.id)?.title||'')}</a>${pgBtn(p,'p. '+pad(p))}</span></div>`}).join('')}</div>
  ${list.length>n?`<button class="btn more-btn" data-a="moreaudit">Mostrar ${Math.min(40,list.length-n)} más</button>`:''}
  <section class="sec">${sec(1,'Vigencia en fuentes oficiales')}<div class="rows">${[['API · catálogo digital',D.meta.links.catalog],['API · adendas y erratas',D.meta.links.errata],['ANH · buscador normativo',D.meta.links.anh]].map(([t,u])=>`<a class="row tight" href="${u}" target="_blank" rel="noopener noreferrer"><span class="body"><span class="t ext">${t}</span></span>${ico('external',16)}</a>`).join('')}</div></section>${foot()}`};

V.guardados=()=>{const fr=favs.map(byId).filter(Boolean),nk=Object.keys(notes).filter(id=>byId(id)&&notes[id]);
  return `${head('Solo en este navegador','Guardados','Fichas, láminas marcadas y notas privadas. No hay cuentas ni servidores: exporta una copia para llevarla a otro dispositivo.')}
  <section class="sec">${sec(1,'Fichas',fr.length)}${fr.length?`<div class="rows">${fr.map(r=>recRow(r)).join('')}</div>`:'<p class="note">Guarda una ficha con el botón «Guardar» para tenerla aquí.</p>'}</section>
  <section class="sec">${sec(2,'Láminas marcadas',pagesSaved.length)}${pagesSaved.length?`<div class="rows">${pagesSaved.map(n=>pageRow(n,'',null)).join('')}</div>`:'<p class="note">Marca láminas desde el visor del manual.</p>'}</section>
  <section class="sec">${sec(3,'Notas',nk.length)}${nk.length?`<div class="rows">${nk.map(id=>`<a class="row" href="${H('ficha/'+id,{nota:1})}"><span class="code">${recCode(id)}</span><span class="body"><span class="t">${esc(byId(id).title)}</span><span class="d">${esc(notes[id].slice(0,160))}</span></span></a>`).join('')}</div>`:'<p class="note">Las notas se escriben al final de cada ficha.</p>'}</section>
  ${(()=>{const ks=Object.keys(reviews).filter(id=>byId(id)&&Object.keys(reviews[id].items||{}).length);return `<section class="sec">${sec(4,'Revisiones en campo',ks.length)}${ks.length?`<div class="rows">${ks.map(id=>{const r=byId(id),R=reviews[id],n=r.checks.length+r.docs.length,d=Object.values(R.items).filter(x=>x.s).length,o=Object.values(R.items).filter(x=>x.s==='obs').length;return `<a class="row" href="${H('ficha/'+id,{rev:1})}"><span class="code">${recCode(id)}</span><span class="body"><span class="t">${esc(r.title)}</span><span class="d">${esc(R.equip||'Equipo sin identificar')}${R.place?' · '+esc(R.place):''}</span><span class="m mono">${d}/${n} puntos · ${o} obs. · ${R.updated?new Date(R.updated).toLocaleDateString('es-CO'):''}</span></span></a>`}).join('')}</div>`:'<p class="note">Abre una ficha y pulsa «Modo revisión» para marcar cada punto en campo.</p>'}</section>`})()}
  <section class="sec">${sec(5,'Copia de seguridad')}<p class="lede">Un archivo JSON con fichas, láminas, recientes y notas. La importación también acepta copias de versiones anteriores.</p>
   <div class="btns"><button class="btn solid" data-a="export">${ico('download',16)} Exportar copia</button><button class="btn" data-a="import">${ico('upload',16)} Importar copia</button><input type="file" id="importf" accept=".json,application/json" hidden></div></section>${foot()}`};

V.mas=()=>{const items=[['guardados','Guardados',`${favs.length} fichas · ${pagesSaved.length} láminas`,'saved'],['guias','Guías y glosario',`${D.guides.length} respuestas · ${D.glossary.length} términos`,'faq'],['atlas','Atlas del rig','Subconjuntos por sistema','layers'],['ndt','Centro NDT','Métodos y límites','probe'],['defectos','Defectos y hallazgos',`${D.defects.length} condiciones`,'defect'],['api','Biblioteca API',`${D.api.length} normas`,'std'],['colombia','Normativa Colombia',`${D.colombia.length} referencias`,'law'],['certificados','Verificar certificados',`${D.portals.length} portales`,'cert'],['evidencia','Evidencia',`${D.evidence.length} cotejos visuales`,'evidence'],['auditoria','Auditoría',`${D.claims.length} enunciados`,'audit']];
  return `${head('Herramientas y fuentes','Más','')}
  <div class="rows" style="margin-top:6px">${items.map(([p,t,d,i])=>`<a class="row" href="#/${p}"><span class="code">${ico(i,20)}</span><span class="body"><span class="t">${t}</span><span class="d">${d}</span></span>${ico('chev',16)}</a>`).join('')}</div>
  <section class="sec">${sec(1,'Jerarquía de la información')}<ol class="rows">${[['Manual original','Referencia visual del contenido de 2023. No equivale a una norma actual.'],['Fichas y guías','Síntesis para orientarse rápido. No sustituyen la cláusula normativa ni el OEM.'],['Normas','Verificar norma, edición, enmiendas y alcance vigente.'],['Fabricante','Validar procedimientos y límites específicos del modelo.']].map(([t,d],i)=>`<li class="chk"><span class="no">${pad2(i+1)}</span><span class="tx"><strong>${t}.</strong> ${d}</span></li>`).join('')}</ol>
   <p class="note"><strong>Advertencia.</strong> Una ficha consultada, un ensayo ejecutado o un equipo que funciona no demuestran por sí solos conformidad, certificación ni aptitud operacional.</p></section>
  <section class="sec">${sec(2,'Consulta externa','requiere internet')}<div class="rows">${[['API — estándares oficiales','https://www.api.org/products-and-services/standards'],['IADC — publicaciones','https://store.iadc.org/'],['SLB — glosario técnico','https://glossary.slb.com/es/'],['OSHA — glosario ilustrado','https://www.osha.gov/etools/oil-and-gas/illustrated-glossary']].map(([t,u])=>`<a class="row tight" href="${u}" target="_blank" rel="noopener noreferrer"><span class="body"><span class="t">${t}</span></span>${ico('external',16)}</a>`).join('')}</div></section>
  <section class="sec">${sec(3,'Acerca de')}<dl class="kv"><div><dt>Versión</dt><dd>Rig Inspection Pocket ${VERSION} · archivo único, sin conexión</dd></div><div><dt>Contenido</dt><dd>${TOTAL} láminas del manual ACE Internacional / Ecopetrol 2023, ${D.records.length} fichas, ${D.guides.length} guías, ${D.glossary.length} términos.</dd></div><div><dt>Tema</dt><dd><button class="btn" data-a="theme">${ico(effectiveTheme()==='night'?'sun':'moon',16)} ${effectiveTheme()==='night'?'Tema de día':'Tema de noche'}</button></dd></div></dl></section>${foot()}`};

/* ============================================================ RENDER */
function viewFor(){const p=cur.parts[0]||'';if(!p)return V.home;return V[p]||notFound}
function renderMain(){
  const v=viewFor(),main=$('#main');paintChrome();
  main.className=['','sistemas'].includes(cur.parts[0]||'')?'wide':'';
  main.innerHTML=v();
  if(cur.parts[0]==='ficha'&&cur.params.get('nota'))requestAnimationFrame(()=>document.getElementById('notas')?.scrollIntoView({block:'start'}));
  const sub=cur.params.get('sub');if(cur.parts[0]==='ficha'&&sub!=null){const d=document.getElementById('sub-'+sub);if(d){d.open=true;d.classList.add('hl');requestAnimationFrame(()=>d.scrollIntoView({block:'center'}))}}
  const t=cur.parts[0]==='ficha'?byId(cur.parts[1])?.title:(main.querySelector('h1')?.textContent||'');
  document.title=(t&&cur.parts.length?t+' · ':'')+'Rig Inspection Pocket '+VERSION;
}
function refreshResults(){const v=viewFor();if(v.res){const el=$('#res');if(el)el.innerHTML=v.res()}else renderMain()}

/* ---------- reader ---------- */
let readerOpener=null,zoom=1;
function readerPage(){const n=parseInt(cur.params.get('pag')||'',10);return Number.isInteger(n)&&n>=1&&n<=TOTAL?n:null}
function renderReader(){
  const n=readerPage(),box=$('#reader');
  if(!n){if(!box.hidden){box.hidden=true;box.innerHTML='';document.body.style.overflow='';readerOpener?.focus?.({preventScroll:true});readerOpener=null}return}
  const ocr=cur.params.get('ocr')==='1',m=modOf(n),ev=EVID_BY_PAGE.get(n)||[],marked=pagesSaved.includes(n),first=box.hidden;
  const keep=box.contains(document.activeElement)?document.activeElement.dataset.a:null;
  box.hidden=false;document.body.style.overflow='hidden';
  box.innerHTML=`<div class="r-top"><button class="r-btn" data-a="rclose" aria-label="Cerrar visor">${ico('x',22)}</button>
   <div class="r-title"><b>PDF ${pad(n)} / ${TOTAL}</b><span>${esc(m?m.name:'Preliminares / cierre')} · ${esc(D.pageTitles[n-1])}</span></div>
   <button class="r-btn ${marked?'on':''}" data-a="rmark" aria-pressed="${marked}" aria-label="${marked?'Quitar marca de esta lámina':'Marcar esta lámina'}">${ico('mark',20)}</button>
   <button class="r-btn" data-a="cite" data-n="${n}" data-t="" aria-label="Copiar cita de la página">${ico('copy',20)}</button>
   <button class="r-btn" data-a="rocr" aria-pressed="${ocr}" aria-label="${ocr?'Ver lámina':'Ver texto OCR'}">${ico(ocr?'image':'text',20)}</button></div>
  ${ev.length?`<details class="r-ev"><summary>${ico('shield',15)} ${plural(ev.length,'observación cotejada','observaciones cotejadas')} en esta lámina</summary><div>${ev.map(e=>`<p><strong>${esc(e.title)}.</strong> ${esc(e.point)}</p>`).join('')}</div></details>`:''}
  <div class="r-main${zoom>1?' z':''}" id="rmain">${ocr?`<article class="r-ocr"><p class="note">Texto reconocido automáticamente: puede tener errores en caracteres, números y unidades. Verifica en la lámina.</p><pre>${esc(D.ocr[n-1]||'[Lámina sin texto reconocible]')}</pre></article>`:`<img id="rimg" src="${imgURL(n)}" alt="Lámina original, página ${n} del manual" style="width:${zoom*100}%">`}</div>
  <div class="r-bot"><button class="r-btn" data-a="rprev" ${n<=1?'disabled':''} aria-label="Página anterior">${ico('prev',22)}</button>
   <form class="r-page" data-a="rjump"><label class="sr" for="rpn">Ir a página</label><input id="rpn" type="number" inputmode="numeric" min="1" max="${TOTAL}" value="${n}"><span>/ ${TOTAL}</span></form>
   ${ocr?'<span></span>':`<span style="display:flex"><button class="r-btn" data-a="rzoom" data-d="-1" ${zoom<=1?'disabled':''} aria-label="Alejar">${ico('minus',20)}</button><button class="r-btn" data-a="rzoom" data-d="1" ${zoom>=3?'disabled':''} aria-label="Ampliar">${ico('plus',20)}</button></span>`}
   <button class="r-btn" data-a="rnext" ${n>=TOTAL?'disabled':''} aria-label="Página siguiente">${ico('next',22)}</button></div>`;
  box.setAttribute('aria-label','Visor del manual, página '+n);
  if(first){readerOpener=document.activeElement;box.querySelector('[data-a="rclose"]').focus({preventScroll:true})}
  else if(keep)(box.querySelector(`[data-a="${keep}"]:not([disabled])`)||box.querySelector('[data-a="rclose"]')).focus({preventScroll:true});
}
function openReader(n){if(!(n>=1&&n<=TOTAL))return;zoom=1;const p=new URLSearchParams(cur.params);p.set('pag',n);p.delete('ocr');readerPushed=true;freshNav=false;location.hash=hash(cur.parts,p)}
function turn(n){if(!(n>=1&&n<=TOTAL))return;zoom=1;setParams({pag:n});renderReader();$('#rmain')?.scrollTo(0,0)}
function closeReader(){if(readerPushed){readerPushed=false;history.back()}else{setParams({pag:'',ocr:''});renderReader()}}

/* ============================================================ EVENTS */
function cite(n,title){const s=`ACE Internacional / Ecopetrol. Rig Inspection, manual de capacitación (2023). Página física ${n} del PDF (${TOTAL} páginas)${title?' · '+title:''}. Verificar en la imagen original; la edición normativa vigente se comprueba por separado.`;copyText(s,'Cita copiada')}
function copyRecord(id){const r=byId(id);if(!r)return;const line=t=>{const c=claimOf(id,t);return '- '+t+(c?` [${K_LABEL[c.k]}${c.page?', PDF '+c.page:''}]`:'')};
  copyText([r.title,r.description,'','Qué revisar:',...r.checks.map(line),'','Evidencia a solicitar:',...r.docs.map(line),r.alert?'\nPrecaución: '+r.alert:'','',`Manual Rig Inspection 2023 (ACE/Ecopetrol), PDF ${r.pages.join(', ')}. Guía de consulta: verificar norma, edición y OEM.`].join('\n'),'Resumen copiado')}
function copyGuide(id){const g=D.guides.find(x=>x.id===id);if(!g)return;copyText([g.q,g.a,'','Puntos para consultar:',...g.steps.map(x=>'- '+x),'',`Manual ACE/Ecopetrol 2023, PDF ${g.pages.join(', ')}. ${g.status==='manual'?'Resumen editorial.':'Síntesis orientativa.'} Confirmar OEM, norma y procedimiento.`].join('\n'),'Guía copiada')}
function copyReview(id){const r=byId(id),R=reviews[id]||{items:{}};if(!r)return;const L={ok:'CONFORME',obs:'OBSERVACIÓN',na:'NO APLICA'};const line=(k,t)=>{const x=R.items[k]||{};return `[${x.s?L[x.s]:'PENDIENTE'}] ${t}${x.n?'\n    Obs.: '+x.n:''}`};
  copyText([`REVISIÓN EN CAMPO · ${r.title}`,`Equipo: ${R.equip||'—'} · Ubicación: ${R.place||'—'} · Fecha: ${new Date(R.updated||Date.now()).toLocaleString('es-CO')}`,`Normas asociadas: ${(r.apis||[]).join(', ')||'OEM'}`,'','Qué revisar:',...r.checks.map((t,i)=>line('c'+i,t)),'','Evidencia a solicitar:',...r.docs.map((t,i)=>line('d'+i,t)),'',`Referencia: manual Rig Inspection 2023 (ACE/Ecopetrol), PDF ${r.pages.join(', ')}.`,'Registro personal de consulta generado con Rig Inspection Pocket. No es un acta de inspección ni libera equipos.'].join('\n'),'Informe copiado')}
function exportData(){download(JSON.stringify({schema:'rig-pocket-v21',version:VERSION,exportedAt:new Date().toISOString(),favorites:favs,recent,pages:pagesSaved,notes,reviews},null,2),'rig-inspection-pocket-copia.json');toast('Copia exportada')}
async function importData(file){
  try{if(file.size>1048576)throw Error('archivo demasiado grande');const d=JSON.parse(await file.text());
    let f=[],p=[],nt={};
    if(d.schema==='rig-pocket-v21'||d.schema==='rig-pocket-v14'){f=Array.isArray(d.favorites)?d.favorites:[];p=Array.isArray(d.pages)?d.pages:[];nt=d.notes&&typeof d.notes==='object'&&!Array.isArray(d.notes)?d.notes:{}}
    else if(Array.isArray(d.favorites)){f=d.favorites.map(x=>typeof x==='string'?x:x?.id)}
    else throw Error('formato no reconocido');
    f=f.filter(id=>typeof id==='string'&&REC.has(id));p=p.filter(n=>Number.isInteger(n)&&n>=1&&n<=TOTAL);
    for(const[k,v]of Object.entries(nt))if(REC.has(k)&&typeof v==='string'&&v.length<=1500)notes[k]=v;
    if(d.reviews&&typeof d.reviews==='object'&&!Array.isArray(d.reviews))for(const[k,v]of Object.entries(d.reviews))if(REC.has(k)&&v&&typeof v.items==='object')reviews[k]={items:v.items,equip:String(v.equip||'').slice(0,120),place:String(v.place||'').slice(0,120),updated:v.updated||null};
    save('rig-pocket-review-v21',reviews);
    favs=[...new Set([...favs,...f])];pagesSaved=[...new Set([...pagesSaved,...p])].slice(0,200);
    const ok=[save('rig-pocket-favs',favs),save('rig-pocket-pages-v14',pagesSaved),save('rig-pocket-notes-v14',notes)].every(Boolean);
    renderMain();toast(ok?`Importado: ${f.length} fichas, ${p.length} láminas`:'Importado solo para esta sesión');
  }catch(e){toast('No se pudo importar: '+e.message)}
}

document.addEventListener('click',e=>{
  if(e.target.closest('a[href^="#/"]'))freshNav=true;
  const pg=e.target.closest('[data-pg]');if(pg){e.preventDefault();openReader(+pg.dataset.pg);return}
  const b=e.target.closest('[data-a]');if(!b||b.tagName==='FORM')return;const a=b.dataset.a;
  if(a==='theme'){toggleTheme();if(cur.parts[0]==='mas')renderMain();return}
  if(a==='fav'){const id=b.dataset.id;favs=favs.includes(id)?favs.filter(x=>x!==id):[id,...favs];const ok=save('rig-pocket-favs',favs);const y=window.scrollY;renderMain();window.scrollTo(0,y);toast(!ok?'Este navegador no permite guardar':favs.includes(id)?'Ficha guardada':'Ficha retirada');return}
  if(a==='copy')return copyRecord(b.dataset.id);
  if(a==='tonotes'){const t=$('#note');document.getElementById('notas')?.scrollIntoView({block:'start'});t?.focus({preventScroll:true});return}
  if(a==='copyguide')return copyGuide(b.dataset.id);
  if(a==='cite')return cite(+b.dataset.n,b.dataset.t);
  if(a==='note'){const v=($('#note')?.value||'').trim();if(v)notes[b.dataset.id]=v;else delete notes[b.dataset.id];toast(save('rig-pocket-notes-v14',notes)?(v?'Nota guardada':'Nota borrada'):'Nota solo en esta sesión: exporta una copia');return}
  if(a==='export')return exportData();
  if(a==='rv'){const id=b.dataset.id,k=b.dataset.k,v=b.dataset.v;const R=reviews[id]||(reviews[id]={items:{}});const it=R.items[k]||(R.items[k]={});it.s=it.s===v?'':v;if(!it.s&&!it.n)delete R.items[k];R.updated=new Date().toISOString();save('rig-pocket-review-v21',reviews);const y=window.scrollY;renderMain();window.scrollTo(0,y);if(v==='obs'&&it.s)document.querySelector(`[data-rvnote="${id}|${k}"]`)?.focus({preventScroll:true});return}
  if(a==='rvcopy')return copyReview(b.dataset.id);
  if(a==='rvprint'){document.body.classList.add('print-review');window.print();setTimeout(()=>document.body.classList.remove('print-review'),500);return}
  if(a==='rvclear'){if(!confirm('¿Borrar esta revisión? No se puede deshacer.'))return;delete reviews[b.dataset.id];save('rig-pocket-review-v21',reviews);const y=window.scrollY;renderMain();window.scrollTo(0,y);toast('Revisión borrada');return}
  if(a==='import')return $('#importf')?.click();
  if(a==='moreaudit'){setParams({n:(parseInt(cur.params.get('n')||'40',10)||40)+40});refreshResults();return}
  if(a==='rclose')return closeReader();
  if(a==='rprev')return turn(readerPage()-1);
  if(a==='rnext')return turn(readerPage()+1);
  if(a==='rocr'){setParams({ocr:cur.params.get('ocr')==='1'?'':'1'});renderReader();return}
  if(a==='rmark'){const n=readerPage();pagesSaved=pagesSaved.includes(n)?pagesSaved.filter(x=>x!==n):[n,...pagesSaved].slice(0,200);toast(save('rig-pocket-pages-v14',pagesSaved)?(pagesSaved.includes(n)?'Lámina marcada':'Marca retirada'):'Solo en esta sesión');renderReader();return}
  if(a==='rzoom'){zoom=Math.min(3,Math.max(1,zoom+(+b.dataset.d)*.5));const img=$('#rimg');if(img){img.style.width=zoom*100+'%';$('#rmain').classList.toggle('z',zoom>1)}b.parentElement.querySelectorAll('button').forEach(x=>x.disabled=x.dataset.d==='1'?zoom>=3:zoom<=1);return}
});
document.addEventListener('submit',e=>{const f=e.target,a=f.dataset.a;e.preventDefault();
  if(a==='homesearch'){const q=$('#hq').value.trim();go(H('buscar',q?{q}:{}));return}
  if(a==='jump'){const n=parseInt($('#jumpn').value,10);if(n>=1&&n<=TOTAL)openReader(n);else toast('Página válida: 1–'+TOTAL);return}
  if(a==='rjump'){const n=parseInt($('#rpn').value,10);if(n>=1&&n<=TOTAL)turn(n);else toast('Página válida: 1–'+TOTAL);return}
  document.activeElement?.blur?.();
});
let inT=0;
document.addEventListener('input',e=>{const t=e.target;
  if(t.dataset.rvnote||t.dataset.rvf){const[id,k]=(t.dataset.rvnote||t.dataset.rvf).split('|');const R=reviews[id]||(reviews[id]={items:{}});if(t.dataset.rvnote){(R.items[k]||(R.items[k]={})).n=t.value.slice(0,600)}else R[k]=t.value.slice(0,120);R.updated=new Date().toISOString();save('rig-pocket-review-v21',reviews);return}
  const p=t.dataset.p;if(!p||t.type==='checkbox'||t.tagName==='SELECT'||t.id==='hq')return;
  clearTimeout(inT);inT=setTimeout(()=>{setParams({[p]:t.value.trim(),o:'',n:''});refreshResults()},120)});
document.addEventListener('change',e=>{const t=e.target;
  if(t.id==='importf'&&t.files?.[0]){importData(t.files[0]);t.value='';return}
  const p=t.dataset.p;if(!p||(t.tagName!=='SELECT'&&t.type!=='checkbox'))return;setParams({[p]:t.type==='checkbox'?(t.checked?'1':''):t.value,o:'',n:''});refreshResults()});
document.addEventListener('keydown',e=>{if(!readerPage())return;
  if(e.key==='Escape'){e.preventDefault();closeReader()}
  else if(e.target.tagName!=='INPUT'&&e.key==='ArrowRight'){e.preventDefault();turn(readerPage()+1)}
  else if(e.target.tagName!=='INPUT'&&e.key==='ArrowLeft'){e.preventDefault();turn(readerPage()-1)}
  else if(e.key==='Tab'){const f=[...$('#reader').querySelectorAll('button:not([disabled]),input,summary')];if(!f.length)return;const i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}});
let sx=0,sy=0,st=0;
document.addEventListener('touchstart',e=>{if(!e.target.closest('#rmain')||e.touches.length!==1)return;sx=e.touches[0].clientX;sy=e.touches[0].clientY;st=Date.now()},{passive:true});
document.addEventListener('touchend',e=>{if(!sx||!e.target.closest('#rmain'))return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;sx=0;
  if(zoom>1||(window.visualViewport&&visualViewport.scale>1.05)||Date.now()-st>600||Math.abs(dx)<70||Math.abs(dy)>Math.abs(dx)*.6)return;turn(readerPage()+(dx<0?1:-1))},{passive:true});
window.addEventListener('hashchange',()=>{route();if(!readerPage())readerPushed=false});
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(!root.dataset.theme)paintChrome()});

/* ============================================================ QA hook */
window.RigPocketQA={version:VERSION,
  search:q=>{const R=search(q);return {records:R.rec.slice(0,5).map(x=>x.doc.r.title),subs:R.sub.slice(0,3).map(x=>x.row[0]),guides:R.guide.slice(0,3).map(x=>x.doc.g.q),api:R.api.map(x=>x.doc.a.code),co:R.co.map(x=>x.doc.c.name),pages:R.pages.slice(0,8)}},
  check:()=>{const refs=[...D.records.flatMap(r=>r.pages),...D.guides.flatMap(g=>g.pages),...D.glossary.flatMap(g=>g.pages),...D.evidence.map(e=>e.page),...Object.values(D.deep).flatMap(a=>a.map(x=>x[4])),...D.defects.flatMap(d=>d.pages),...D.api.flatMap(a=>a.pages),...D.colombia.flatMap(c=>c.pages),...D.portals.flatMap(p=>p.book),...D.claims.map(c=>c.page).filter(Boolean)];
    const ids=[...D.guides.flatMap(g=>g.ids),...D.glossary.map(g=>g.record),...Object.keys(D.deep),...D.evidence.flatMap(e=>e.ids),...D.defects.map(d=>d.record),...D.atlas.flatMap(a=>a.nodes.map(n=>n[1])),...D.claims.map(c=>c.id)];
    return {refs:refs.length,brokenPages:refs.filter(n=>!(Number.isInteger(n)&&n>=1&&n<=TOTAL)),brokenIds:ids.filter(id=>!REC.has(id)),images:Array.from({length:TOTAL},(_,i)=>i+1).filter(n=>!document.getElementById('img-'+n)),claims:D.claims.length,records:D.records.length,unclaimed:D.records.filter(r=>!(CLAIMS.get(r.id)||[]).length).map(r=>r.id)}},
  go:h=>go(h)};

route();
})();
