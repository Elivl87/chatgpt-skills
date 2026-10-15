// Extracts the data layers of Rig Inspection Pocket V2.0 into clean JSON.
const fs=require('fs'),vm=require('vm');
const [src,out]=process.argv.slice(2);
const L=fs.readFileSync(src,'utf8').split('\n');
const ln=(a,b=a)=>L.slice(a-1,b).join('\n');
const code=[
 ln(224).replace('const DB','var DB'),
 ln(226).replace('const GUIDES','var GUIDES'), ln(227).replace('const TERMS_GLOSSARY','var TERMS_GLOSSARY'),
 'var byId=id=>DB.records.find(r=>r.id===id);',
 ln(357).replace('const DEEP','var DEEP'), ln(358), ln(359),
 ln(371,387).replace('const VERIFIED','var VERIFIED'), ln(388,395).replace('const TECH_ATLAS','var TECH_ATLAS'),
 ln(396,409).replace('const DEFECTS','var DEFECTS'), ln(410,418).replace('const NDT_DETAILS','var NDT_DETAILS'),
 ln(419,427).replace('const STANDARD_INDEX','var STANDARD_INDEX'),
 ln(468,495), ln(497,554),
 ln(559).replace('const API_V15_CATALOG','var API_V15_CATALOG'),
 ln(592).replace('const COL_V16','var COL_V16'), ln(593).replace('const PORT_V16','var PORT_V16'),
 ln(635,680).replace('const V18_SOURCE_CHECKED','var V18_SOURCE_CHECKED'),
 ln(729,730).replace('const V19','var V19'),
 ln(818).replace('const V2_AUDIT','var V2_AUDIT'), ln(819).replace('const V2_CLAIMS','var V2_CLAIMS'),
 ln(820).replace('const V2_API_EVIDENCE','var V2_API_EVIDENCE'), ln(861).replace('const V2_CO_REG','var V2_CO_REG'),
].join('\n');
const ctx={};vm.createContext(ctx);vm.runInContext(code,ctx);
const D=ctx.DB;
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(out+'/images.json',JSON.stringify(D.images));
const data={records:D.records,modules:D.modules,ocr:D.ocr,guides:ctx.GUIDES,glossary:ctx.TERMS_GLOSSARY,deep:ctx.DEEP,
 verified:ctx.VERIFIED,atlas:ctx.TECH_ATLAS,defects:ctx.DEFECTS,ndt:ctx.NDT_DETAILS,api:ctx.API_V15_CATALOG,
 colombia:ctx.COL_V16,portals:ctx.PORT_V16,evidence:ctx.V18_SOURCE_CHECKED,audit:ctx.V2_AUDIT,claims:ctx.V2_CLAIMS,
 apiCheck:ctx.V2_API_EVIDENCE,coReg:ctx.V2_CO_REG};
fs.writeFileSync(out+'/data.raw.json',JSON.stringify(data,null,1));
for(const k in data)console.log(k,Array.isArray(data[k])?data[k].length:Object.keys(data[k]).length);
