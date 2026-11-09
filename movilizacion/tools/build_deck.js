// Presentación gerencial de 4 diapositivas: Work Order vs tercerizado (GRS 110, LCI)
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");
const OUT = process.argv[2];
const FR = JSON.parse(fs.readFileSync(process.argv[3]));   // frontera.json
const PEND = JSON.parse(fs.readFileSync(process.argv[4])); // pendientes para la diapositiva 4

const THEME = { name: "Movilizacion GRS110", headFontFace: "Cambria", bodyFontFace: "Calibri",
  colors: { dk1: "1F2A36", lt1: "FFFFFF", dk2: "3B4754", lt2: "EEF1F4", accent1: "C8860A", accent2: "1F2A36",
            accent3: "7A8A99", accent4: "2E7D5B", accent5: "B03A2E", accent6: "A9B4BF", hlink: "1F6FB2", folHlink: "6B4E9B" } };
const HEX = { ink: "1F2A36", mute: "5D6B78", grid: "D5DBE1", amber: "C8860A", green: "2E7D5B", red: "B03A2E", slate: "7A8A99", light: "EEF1F4", pale: "A9B4BF" };

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Movilización GRS 110: Work Order vs tercerizado";
const C = pres.SchemeColor;

pres.defineSlideMaster({
  title: "CONTENIDO", background: { color: "FFFFFF" },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.35, w: 12.1, h: 0.95, fontSize: 24, bold: true, color: C.text1, valign: "top", align: "left", margin: 0 }, text: "" } },
    { text: { text: "SierraCol · Movilización del taladro GRS 110 · La Cira Infantas · Evaluación de modelo de contratación (no es adjudicación)",
              options: { x: 0.6, y: 7.0, w: 10.5, h: 0.3, fontSize: 9, color: C.text2, margin: 0 } } },
  ],
  slideNumber: { x: 12.3, y: 7.0, w: 0.5, h: 0.3, fontSize: 9, color: C.text2 },
});

const fmtM = v => (v >= 0 ? "+" : "−") + (Math.abs(v) / 1e6).toFixed(2).replace(".", ",") + " M";
const fmtK = v => Math.round(v).toLocaleString("es-CO");
let n = 0;
function card(s, x, y, w, h, fill) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill || C.background2 }, line: { color: fill || C.background2 }, rectRadius: 0.08, objectName: `card${++n}` });
}

// ---------------- Diapositiva 1: qué se decide
pres.addSection({ title: "Decisión" });
let s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Decisión" });
s.addText("Tercerizar ahorra poco y solo si se sostienen 5–6 movilizaciones y los tiempos", { placeholder: "title" });
s.addText([
  { text: "Qué se decide", options: { bold: true, fontSize: 16, color: C.accent1, breakLine: true } },
  { text: "Mantener el Work Order (modelo directo: suma global por movilización, sin horas de taladro) o pasar al modelo tercerizado: SierraCol contrata aparte al transportador y paga además el taladro por hora durante la movilización y un coordinador de transporte (Truck Manager).", options: { fontSize: 13, breakLine: true, paraSpaceAfter: 8 } },
  { text: "Qué no se decide", options: { bold: true, fontSize: 16, color: C.accent1, breakLine: true } },
  { text: "No se adjudica proveedor ni se declara un ahorro único. Se evalúan tres ofertas: Petro Star tarifa normal, Petro Star precio cerrado (Lump Sum) y Ecotransur.", options: { fontSize: 13, breakLine: true, paraSpaceAfter: 8 } },
  { text: "Por qué decide la cantidad de movilizaciones de cada mes", options: { bold: true, fontSize: 16, color: C.accent1, breakLine: true } },
  { text: "El Work Order cuesta lo mismo por movilización haya 1 o 9 en el mes. El tercerizado cobra cargo fijo hasta la 4ª o 5ª movilización del mes y descuenta desde la 6ª: el resultado lo decide cuántas movilizaciones caen en cada mes, no el promedio.", options: { fontSize: 13 } },
], { x: 0.6, y: 1.45, w: 6.2, h: 3.5, valign: "top", color: C.text1, margin: 0, isTextBox: true, fontSize: 13 });
s.addChart(pres.charts.BAR, [
  { name: "2024", labels: ["1 a 3", "4", "5", "6 o más"], values: [2, 0, 0, 9] },
  { name: "2025", labels: ["1 a 3", "4", "5", "6 o más"], values: [2, 1, 2, 4] },
], { x: 0.6, y: 5.05, w: 6.2, h: 1.85, barDir: "col", barGrouping: "clustered", chartColors: [HEX.ink, HEX.amber],
  showTitle: true, title: "Meses según cuántas movilizaciones tuvieron (logs)", titleFontSize: 12, titleColor: HEX.ink, titleFontFace: "+mn-lt",
  showLegend: true, legendPos: "r", legendFontSize: 10, legendFontFace: "+mn-lt", legendColor: HEX.mute,
  showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 10, dataLabelColor: HEX.mute, dataLabelFontFace: "+mn-lt",
  catAxisLabelColor: HEX.mute, catAxisLabelFontSize: 10, catAxisLabelFontFace: "+mn-lt", valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" } });
const stats = [
  [PEND.kpi.pct, "del costo de la campaña", PEND.kpi.rango],
  [PEND.kpi.h5, "de más por movilización", `sobre el tiempo cotizado borran el ahorro de Petro Star con 5 movs/mes; con 6, unas ${PEND.kpi.h6} h (taladro + equipos)`],
  ["Pierde siempre", "Petro Star Lump Sum", PEND.kpi.ls],
];
stats.forEach((t, i) => {
  const y = 1.45 + i * 1.62;
  card(s, 7.3, y, 5.4, 1.42);
  s.addText(t[0], { x: 7.5, y: y + 0.12, w: 1.9, h: 1.15, fontSize: t[0].length > 5 ? 26 : 36, bold: true, color: i == 0 ? C.accent4 : C.accent5, fontFace: "Cambria", valign: "middle", margin: 0, isTextBox: true });
  s.addText([{ text: t[1], options: { bold: true, fontSize: 14, breakLine: true } }, { text: t[2], options: { fontSize: 12, color: C.text2 } }],
    { x: 9.5, y: y + 0.12, w: 3.05, h: 1.18, valign: "middle", color: C.text1, margin: 0, isTextBox: true });
});
s.addText("Campaña 15 + 20 pozos (0,1–5 km), 5–6 movs/mes, TRM 3.700, Truck Manager mensual y 17,3 h de bloqueo social medido (OpenWells 2025). Con 4 movs/mes Petro Star pierde. Logs: 2024 tuvo 6 o más en 9 de 11 meses; 2025, en 4 de 9.",
  { x: 7.3, y: 6.33, w: 5.4, h: 0.6, fontSize: 10.5, italic: true, color: C.text2, margin: 0, isTextBox: true });
s.addNotes("Frontera calculada con el simulador (hoja Simulador, sección 6, y campaña con frecuencia constante). Los umbrales salen de Cot. 1255 p. 2 y p. 4 y de la carta de Ecotransur p. 2–4.");

// ---------------- Diapositiva 2: cómo está armado el costo
pres.addSection({ title: "Estructura de costo" });
s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Estructura de costo" });
s.addText("El tercerizado suma taladro y cargo fijo; a cambio descuenta desde la 6ª", { placeholder: "title" });
const D = PEND.componentes;
const cats = ["Work Order", "Petro Star 1ª–5ª", "Petro Star 6ª+", "Ecotransur 1ª–5ª", "Ecotransur 6ª+", "Lump Sum"];
s.addChart(pres.charts.BAR, [
  { name: "Tarifa (WO o transportador)", labels: cats, values: [D.WO[0], D.PS1[0], D.PS6[0], D.EC1[0], D.EC6[0], D.LS1[0]] },
  { name: "Señalizadoras faltantes (WO)", labels: cats, values: [D.WO[1], 0, 0, 0, 0, 0] },
  { name: "Taladro 18 h × 1.456 USD/h", labels: cats, values: [0, D.PS1[1], D.PS6[1], D.EC1[1], D.EC6[1], D.LS1[1]] },
  { name: "Truck Manager (60 M COP/mes ÷ 5 movs)", labels: cats, values: [0, D.PS1[2], D.PS6[2], D.EC1[2], D.EC6[2], D.LS1[2]] },
], { x: 0.6, y: 1.4, w: 7.4, h: 5.4, barDir: "col", barGrouping: "stacked", chartColors: [HEX.ink, HEX.red, HEX.amber, HEX.pale],
  showTitle: true, title: "Costo de una movilización de 0,1–5 km (USD)", titleFontSize: 13, titleColor: HEX.ink, titleFontFace: "+mn-lt",
  showLegend: true, legendPos: "b", legendFontSize: 10, legendFontFace: "+mn-lt", legendColor: HEX.mute,
  catAxisLabelColor: HEX.mute, valAxisLabelColor: HEX.mute, catAxisLabelFontSize: 10, valAxisLabelFontSize: 10, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
  valAxisLabelFormatCode: "#,##0", valGridLine: { color: HEX.grid, size: 0.5 }, catGridLine: { style: "none" },
  showValue: false });
card(s, 8.4, 1.4, 4.3, 5.4);
s.addText("Cargo fijo mensual si el mes no llega al mínimo (USD)", { x: 8.6, y: 1.55, w: 3.9, h: 0.6, fontSize: 14, bold: true, color: C.text1, margin: 0, isTextBox: true });
const rows = [[{ text: "Movs en el mes", options: { bold: true } }, { text: "Petro Star", options: { bold: true, align: "right" } }, { text: "Ecotransur", options: { bold: true, align: "right" } }]];
PEND.fijos.forEach(f => rows.push([String(f[0]), { text: f[1] ? fmtK(f[1]) : "—", options: { align: "right" } }, { text: f[2] ? fmtK(f[2]) : "—", options: { align: "right" } }]));
s.addTable(rows, { x: 8.6, y: 2.2, w: 3.9, colW: [1.3, 1.3, 1.3], fontSize: 12, fontFace: "Calibri", color: HEX.ink, border: { type: "solid", pt: 0.5, color: HEX.grid }, rowH: 0.34 });
s.addText([
  { text: "Lo que no se ve en la barra: ", options: { bold: true } },
  { text: "el Work Order es igual en cualquier mes; el tercerizado suma este cargo mientras el mes no llegue a 5 (Ecotransur) o a 6 (Petro Star). Lump Sum: sin descuento en la evaluación principal." },
], { x: 8.6, y: 4.65, w: 3.9, h: 1.9, fontSize: 12, color: C.text2, valign: "top", margin: 0, isTextBox: true });
s.addNotes("Fuente: Simulador filas 51 y 53–67; cargo fijo Cot. 1255 p. 4 y Ecotransur p. 2–3 a TRM 3.700. Ecotransur 6ª+ = solo equipos (p. 3–4).");

// ---------------- Diapositiva 3: la frontera
pres.addSection({ title: "Frontera" });
s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Frontera" });
s.addText("Entre 5 y 6 movilizaciones por mes está el escalón que más pesa", { placeholder: "title" });
const FQ = PEND.frec; const lab = FQ.map(x => String(x[0]).replace(".", ","));
s.addChart(pres.charts.LINE, [
  { name: "Petro Star tarifa normal", labels: lab, values: FQ.map(x => x[1]) },
  { name: "Ecotransur", labels: lab, values: FQ.map(x => x[3]) },
  { name: "Petro Star Lump Sum (sin descuento)", labels: lab, values: FQ.map(x => x[2]) },
], { x: 0.6, y: 1.4, w: 7.4, h: 5.4, chartColors: [HEX.amber, HEX.green, HEX.slate], lineSize: 2.5, lineDataSymbol: "circle", lineDataSymbolSize: 7,
  showTitle: true, title: "Ahorro de la campaña 15 + 20 pozos frente al Work Order (USD; + = tercerizado más barato)", titleFontSize: 13, titleColor: HEX.ink, titleFontFace: "+mn-lt",
  showLegend: true, legendPos: "b", legendFontSize: 10, legendFontFace: "+mn-lt", legendColor: HEX.mute,
  catAxisTitle: "Movilizaciones por mes (esperado: 5 a 6)", showCatAxisTitle: true, catAxisTitleFontSize: 10, catAxisTitleColor: HEX.mute,
  catAxisLabelColor: HEX.mute, valAxisLabelColor: HEX.mute, catAxisLabelFontSize: 10, valAxisLabelFontSize: 10, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
  valAxisLabelFormatCode: "#,##0", valGridLine: { color: HEX.grid, size: 0.5 }, catGridLine: { style: "none" } });
card(s, 8.4, 1.4, 4.3, 5.4);
s.addText("Campañas reales 2024 y 2025 repetidas con horas reales", { x: 8.6, y: 1.55, w: 3.9, h: 0.6, fontSize: 14, bold: true, color: C.text1, margin: 0, isTextBox: true });
const R2 = PEND.reales2;
const rr = [[{ text: "+ = tercerizado más barato", options: { bold: true } }, { text: "2024", options: { bold: true, align: "right" } }, { text: "2025", options: { bold: true, align: "right" } }]];
[["Petro Star tarifa normal", "PS"], ["Ecotransur", "EC"], ["Petro Star Lump Sum", "LS"]].forEach(([l, k]) =>
  rr.push([l, { text: fmtM(R2["2024"].reales_con_equipos[k]), options: { align: "right", color: R2["2024"].reales_con_equipos[k] >= 0 ? HEX.green : HEX.red } },
              { text: fmtM(R2["2025"].reales_con_equipos[k]), options: { align: "right", color: R2["2025"].reales_con_equipos[k] >= 0 ? HEX.green : HEX.red } }]));
s.addTable(rr, { x: 8.6, y: 2.2, w: 3.9, colW: [1.7, 1.1, 1.1], fontSize: 12, fontFace: "Calibri", color: HEX.ink, border: { type: "solid", pt: 0.5, color: HEX.grid }, rowH: 0.34 });
s.addText([
  { text: "Taladro por horas reales y equipos por cada hora sobre el tiempo cotizado.", options: { breakLine: true, paraSpaceAfter: 6 } },
  { text: `2025: ${R2["2025"].movs_exceden} movilizaciones se pasaron del tiempo (${Math.round(R2["2025"].horas_excedidas)} h). Con eso el tercerizado habría costado más que el Work Order.`, options: { bold: true, color: C.text1, breakLine: true, paraSpaceAfter: 6 } },
  { text: `2024 se movió más rápido que lo supuesto en el Excel y el ahorro se mantiene, aun con ${R2["2024"].movs_exceden} excesos (${Math.round(R2["2024"].horas_excedidas)} h).` },
], { x: 8.6, y: 3.75, w: 3.9, h: 2.9, fontSize: 12, color: C.text2, valign: "top", margin: 0, isTextBox: true });
s.addNotes("Gráfico: hoja Sensibilidad, sección 1 (horas del Excel). La curva sube y baja porque el último mes de la campaña puede quedar corto y vuelve a pagar cargo fijo. Tabla: hoja Sensibilidad, sección 3, y hojas Real 2024 / Real 2025.");

// ---------------- Diapositiva 4: qué falta confirmar
pres.addSection({ title: "Pendientes" });
s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Pendientes" });
s.addText("El margen se pierde con pocas horas de más o un mes sin mover", { placeholder: "title" });
const fx = v => v.toFixed(1).replace(".", ",");
const QB = PEND.quiebres;
const tq = [[{ text: "Qué borra el ahorro", options: { bold: true } }, { text: "Petro Star · 5/mes", options: { bold: true, align: "right" } }, { text: "Petro Star · 6/mes", options: { bold: true, align: "right" } }, { text: "Ecotransur · 5/mes", options: { bold: true, align: "right" } }, { text: "Ecotransur · 6/mes", options: { bold: true, align: "right" } }]];
const pick = (f, o) => QB.find(q => q[0] == f && q[1] == o);
const cols = [pick(5, "Petro Star normal"), pick(6, "Petro Star normal"), pick(5, "Ecotransur"), pick(6, "Ecotransur")];
[["Ahorro de la campaña (USD)", q => fmtM(q[2])], ["Ahorro por pozo (% de un pozo de 600 k)", q => (q[4] * 100).toFixed(1).replace(".", ",") + " %"],
 ["Horas extra de taladro por movilización", q => fx(q[5]) + " h"], ["Horas sobre el tiempo cotizado (taladro + equipos)", q => fx(q[6]) + " h"],
 ["Días de taladro de demora en toda la campaña", q => fx(q[7]) + " d"], ["Meses bloqueados con contrato vigente", q => fx(q[8])]].forEach(([l, fn]) =>
  tq.push([l, ...cols.map(q => ({ text: fn(q), options: { align: "right" } }))]));
s.addTable(tq, { x: 0.6, y: 1.4, w: 8.0, colW: [3.2, 1.2, 1.2, 1.2, 1.2], fontSize: 11, fontFace: "Calibri", color: HEX.ink, border: { type: "solid", pt: 0.5, color: HEX.grid }, rowH: 0.42, valign: "middle" });
s.addText([
  { text: "Por qué: ", options: { bold: true } },
  { text: "en el Work Order una demora, un bloqueo o un mes sin mover no cuesta nada. En el tercerizado cada hora sobre el tiempo cotizado cuesta unos 2.813 USD (taladro 1.456 + equipos y señalizadores 1.357) y un mes bloqueado paga el cargo fijo más el Truck Manager (Petro Star 177 k, Ecotransur 243 k)." },
], { x: 0.6, y: 4.55, w: 8.0, h: 1.1, fontSize: 12, color: C.text2, valign: "top", margin: 0, isTextBox: true });
card(s, 9.0, 1.4, 3.7, 4.3, HEX.ink);
s.addText([
  { text: "A tener en cuenta", options: { bold: true, fontSize: 16, color: C.accent1, breakLine: true, paraSpaceAfter: 6 } },
  { text: "El Work Order tiene tope: lo comparamos contra su tarifa máxima. El tercerizado no tiene tope; el riesgo de cada hora extra queda en SierraCol.", options: { bullet: true, breakLine: true, paraSpaceAfter: 6 } },
  { text: "Horas que se pagarán al taladro: con las cotizadas (24 h en 0,1–5 km) el ahorro baja 0,17 M.", options: { bullet: true, breakLine: true, paraSpaceAfter: 6 } },
  { text: "Precios del Lump Sum: el Excel está por encima de la cotización 1255 (+0,44 M). Lo aclara Compras.", options: { bullet: true, breakLine: true, paraSpaceAfter: 6 } },
  { text: "Si Petro Star no cobra cargo fijo con 5 movilizaciones, su ahorro sube unos 0,29 M con 5 movs/mes.", options: { bullet: true, breakLine: true, paraSpaceAfter: 6 } },
  { text: "Riesgos no valorados: coordinación de dos contratistas, HSE y daños, disponibilidad, pago en COP.", options: { bullet: true } },
], { x: 9.2, y: 1.6, w: 3.3, h: 4.0, fontSize: 12, color: C.background1, valign: "top", margin: 0, isTextBox: true });
s.addNotes("Puntos de quiebre: hoja Sensibilidad, sección 2. Pendientes completos con montos: hoja Pendientes. Auditoría de la evaluación previa: Auditoria_Evaluacion_Previa.xlsx.");

// ---------------- Diapositiva 5: conclusión y recomendación
pres.addSection({ title: "Recomendación" });
s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Recomendación" });
s.addText("Recomendación: mantener el Work Order", { placeholder: "title" });
s.addText([
  { text: "Conclusión", options: { bold: true, fontSize: 16, color: C.accent1, breakLine: true, paraSpaceAfter: 4 } },
  ...PEND.concl.map((t, i, a) => ({ text: t, options: { bullet: true, breakLine: i < a.length - 1, paraSpaceAfter: 8 } })),
], { x: 0.6, y: 1.4, w: 7.4, h: 5.3, fontSize: 13, color: C.text1, valign: "top", margin: 0, isTextBox: true });
card(s, 8.4, 1.4, 4.3, 3.6, HEX.ink);
s.addText([
  { text: "Se reconsidera el tercerizado solo si:", options: { bold: true, fontSize: 15, color: C.accent1, breakLine: true, paraSpaceAfter: 6 } },
  { text: "Hay un plan de pozos con 6 o más movilizaciones todos los meses.", options: { bullet: { type: "number" }, breakLine: true, paraSpaceAfter: 6 } },
  { text: "El contrato pone tope de horas o penalidad al transportador por pasarse del tiempo cotizado.", options: { bullet: { type: "number" }, breakLine: true, paraSpaceAfter: 6 } },
  { text: "Una cláusula suspende el cargo fijo en meses con bloqueos o problemas operativos.", options: { bullet: { type: "number" }, breakLine: true, paraSpaceAfter: 12 } },
  { text: "Antes de negociar: Compras aclara los precios del Lump Sum y Petro Star confirma si cobra cargo fijo con 5 movilizaciones.", options: { fontSize: 12 } },
], { x: 8.6, y: 1.6, w: 3.9, h: 3.3, fontSize: 13, color: C.background1, valign: "top", margin: 0, isTextBox: true });
s.addNotes("Texto completo en Simulador_Movilizacion_GRS110.xlsx, hoja Resumen, secciones 6 y 7.");

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("ok", OUT);
})();
