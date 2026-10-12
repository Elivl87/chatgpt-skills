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
const fmtK = v => "$" + Math.round(v).toLocaleString("es-CO");
let n = 0;
function card(s, x, y, w, h, fill) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill || C.background2 }, line: { color: fill || C.background2 }, rectRadius: 0.08, objectName: `card${++n}` });
}

// ---------------- Diapositiva 1: qué se decide
pres.addSection({ title: "Decisión" });
let s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Decisión" });
s.addText("Tercerizar solo conviene si la frecuencia se sostiene todos los meses", { placeholder: "title" });
s.addText([
  { text: "Qué se decide", options: { bold: true, fontSize: 16, color: C.accent1, breakLine: true } },
  { text: "Mantener el Work Order (suma global por movilización, sin horas de taladro) o pasar a contratar directamente al transportador, pagando además el taladro por hora y un Truck Manager.", options: { fontSize: 14, breakLine: true, paraSpaceAfter: 10 } },
  { text: "Qué no se decide", options: { bold: true, fontSize: 16, color: C.accent1, breakLine: true } },
  { text: "No se adjudica proveedor ni se declara un ahorro único. Se evalúan tres ofertas: Petro Star tarifa normal, Petro Star Lump Sum y Ecotransur.", options: { fontSize: 14, breakLine: true, paraSpaceAfter: 10 } },
  { text: "Por qué la respuesta es una frontera", options: { bold: true, fontSize: 16, color: C.accent1, breakLine: true } },
  { text: "El Work Order cuesta lo mismo por movilización haya 1 o 9 en el mes. El tercerizado cobra cargo fijo hasta la 4ª o 5ª movilización del mes y descuenta desde la 6ª: el resultado lo decide cuántas movilizaciones caen en cada mes, no el promedio.", options: { fontSize: 14 } },
], { x: 0.6, y: 1.45, w: 6.2, h: 3.3, valign: "top", color: C.text1, margin: 0, isTextBox: true });
s.addChart(pres.charts.BAR, [
  { name: "2024", labels: ["1 a 3", "4", "5", "6 o más"], values: [2, 0, 0, 9] },
  { name: "2025", labels: ["1 a 3", "4", "5", "6 o más"], values: [2, 1, 2, 4] },
], { x: 0.6, y: 4.85, w: 6.2, h: 2.0, barDir: "col", barGrouping: "clustered", chartColors: [HEX.ink, HEX.amber],
  showTitle: true, title: "Meses según cuántas movilizaciones tuvieron (logs)", titleFontSize: 12, titleColor: HEX.ink, titleFontFace: "+mn-lt",
  showLegend: true, legendPos: "r", legendFontSize: 10, legendFontFace: "+mn-lt", legendColor: HEX.mute,
  showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 10, dataLabelColor: HEX.mute, dataLabelFontFace: "+mn-lt",
  catAxisLabelColor: HEX.mute, catAxisLabelFontSize: 10, catAxisLabelFontFace: "+mn-lt", valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" } });
const stats = [
  ["≥ 5", "movilizaciones todos los meses", "Petro Star tarifa normal deja de perder frente al Work Order (campaña 15 + 20 pozos en 0,1–5 km)"],
  ["≥ 4", "movilizaciones todos los meses", "Ecotransur deja de perder frente al Work Order (misma campaña)"],
  ["No cruza", "en ninguna frecuencia", "Petro Star Lump Sum sin descuento: solo cruza con pozos en la misma localización"],
];
stats.forEach((t, i) => {
  const y = 1.45 + i * 1.62;
  card(s, 7.3, y, 5.4, 1.42);
  s.addText(t[0], { x: 7.5, y: y + 0.12, w: 1.9, h: 1.15, fontSize: t[0].length > 4 ? 26 : 40, bold: true, color: i == 2 ? C.accent5 : C.accent4, fontFace: "Cambria", valign: "middle", margin: 0, isTextBox: true });
  s.addText([{ text: t[1], options: { bold: true, fontSize: 14, breakLine: true } }, { text: t[2], options: { fontSize: 12, color: C.text2 } }],
    { x: 9.5, y: y + 0.12, w: 3.05, h: 1.18, valign: "middle", color: C.text1, margin: 0, isTextBox: true });
});
s.addText("Evidencia de frecuencia (logs): 2024 tuvo 6 o más movilizaciones en 9 de 11 meses; 2025, en 4 de 9 meses, con meses de 1, 3 y 4.",
  { x: 7.3, y: 6.38, w: 5.4, h: 0.5, fontSize: 11, italic: true, color: C.text2, margin: 0, isTextBox: true });
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
  { name: "Truck Manager", labels: cats, values: [0, D.PS1[2], D.PS6[2], D.EC1[2], D.EC6[2], D.LS1[2]] },
], { x: 0.6, y: 1.4, w: 7.4, h: 5.4, barDir: "col", barGrouping: "stacked", chartColors: [HEX.ink, HEX.red, HEX.amber, HEX.pale],
  showTitle: true, title: "Costo de una movilización de 0,1–5 km (USD)", titleFontSize: 13, titleColor: HEX.ink, titleFontFace: "+mn-lt",
  showLegend: true, legendPos: "b", legendFontSize: 10, legendFontFace: "+mn-lt", legendColor: HEX.mute,
  catAxisLabelColor: HEX.mute, valAxisLabelColor: HEX.mute, catAxisLabelFontSize: 10, valAxisLabelFontSize: 10, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
  valAxisLabelFormatCode: "$#,##0", valGridLine: { color: HEX.grid, size: 0.5 }, catGridLine: { style: "none" },
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
s.addText("La frontera está entre 4 y 5 movilizaciones por mes, sostenidas", { placeholder: "title" });
const fx = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const pick = k => fx.map(f => FR[k][f - 1]);
s.addChart(pres.charts.LINE, [
  { name: "Petro Star tarifa normal", labels: fx.map(String), values: pick("PS|1") },
  { name: "Ecotransur", labels: fx.map(String), values: pick("EC|1") },
  { name: "Petro Star Lump Sum (sin descuento)", labels: fx.map(String), values: pick("LS|1") },
], { x: 0.6, y: 1.4, w: 7.4, h: 5.4, chartColors: [HEX.amber, HEX.green, HEX.slate], lineSize: 2.5, lineDataSymbol: "circle", lineDataSymbolSize: 7,
  showTitle: true, title: "Ahorro de la campaña 15 + 20 pozos frente al Work Order, según movilizaciones por mes (USD)", titleFontSize: 13, titleColor: HEX.ink, titleFontFace: "+mn-lt",
  showLegend: true, legendPos: "b", legendFontSize: 10, legendFontFace: "+mn-lt", legendColor: HEX.mute,
  catAxisTitle: "Movilizaciones por mes (constante)", showCatAxisTitle: true, catAxisTitleFontSize: 10, catAxisTitleColor: HEX.mute,
  catAxisLabelColor: HEX.mute, valAxisLabelColor: HEX.mute, catAxisLabelFontSize: 10, valAxisLabelFontSize: 10, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
  valAxisLabelFormatCode: "$#,##0", valGridLine: { color: HEX.grid, size: 0.5 }, catGridLine: { style: "none" } });
card(s, 8.4, 1.4, 4.3, 5.4);
s.addText("Repetición de las campañas reales con cada modelo", { x: 8.6, y: 1.55, w: 3.9, h: 0.6, fontSize: 14, bold: true, color: C.text1, margin: 0, isTextBox: true });
const R = PEND.reales;
const rr = [[{ text: "Ahorro vs WO (USD)", options: { bold: true } }, { text: "2024", options: { bold: true, align: "right" } }, { text: "2025", options: { bold: true, align: "right" } }]];
[["Petro Star normal", "PS"], ["Ecotransur", "EC"], ["Lump Sum", "LS"]].forEach(([lab, k]) =>
  rr.push([lab, { text: fmtM(R["2024"][k]), options: { align: "right", color: R["2024"][k] >= 0 ? HEX.green : HEX.red } }, { text: fmtM(R["2025"][k]), options: { align: "right", color: R["2025"][k] >= 0 ? HEX.green : HEX.red } }]));
s.addTable(rr, { x: 8.6, y: 2.2, w: 3.9, colW: [1.7, 1.1, 1.1], fontSize: 12, fontFace: "Calibri", color: HEX.ink, border: { type: "solid", pt: 0.5, color: HEX.grid }, rowH: 0.34 });
s.addText([
  { text: "2024: 70 movilizaciones, 6,4 por mes activo. 2025: 45, 5,0 por mes activo.", options: { breakLine: true, paraSpaceAfter: 6 } },
  { text: "En 2025 los meses de 1, 3 y 4 movilizaciones se comieron casi todo lo que ganaron los meses de 6 y 7.", options: { bold: true, color: C.text1, breakLine: true, paraSpaceAfter: 6 } },
  { text: "Escenario prudente (frecuencia y mezcla de 2025, horas cotizadas por Petro Star): Petro Star −0,02 M y Ecotransur −0,01 M. Es el punto de equilibrio.", options: { bold: true, color: C.accent5 } },
], { x: 8.6, y: 3.75, w: 3.9, h: 2.9, fontSize: 12, color: C.text2, valign: "top", margin: 0, isTextBox: true });
s.addNotes("Gráfico: frecuencia constante; con 1 movilización por mes las pérdidas son de −4,2 a −5,8 M (fuera de escala). Tabla: hojas Real 2024 / Real 2025 del simulador, horas del Excel.");

// ---------------- Diapositiva 4: qué falta confirmar
pres.addSection({ title: "Pendientes" });
s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Pendientes" });
s.addText("Faltan siete datos y casi todos restan ventaja al tercerizado", { placeholder: "title" });
const tb = [[{ text: "Qué falta confirmar", options: { bold: true } }, { text: "Valor de trabajo", options: { bold: true } }, { text: "En juego (USD)", options: { bold: true, align: "right" } }, { text: "Quién", options: { bold: true } }]];
PEND.top.forEach(p => tb.push([p[0], p[1], { text: p[2], options: { align: "right", color: p[2].startsWith("+") ? HEX.green : HEX.red } }, p[3]]));
s.addTable(tb, { x: 0.6, y: 1.4, w: 8.0, colW: [3.4, 1.9, 1.5, 1.2], fontSize: 12, fontFace: "Calibri", color: HEX.ink, border: { type: "solid", pt: 0.5, color: HEX.grid }, rowH: 0.42, valign: "middle" });
card(s, 9.0, 1.4, 3.7, 3.6, HEX.ink);
s.addText([
  { text: "Lectura", options: { bold: true, fontSize: 16, color: C.accent1, breakLine: true, paraSpaceAfter: 6 } },
  { text: PEND.lectura, options: { fontSize: 13, color: C.background1 } },
], { x: 9.2, y: 1.6, w: 3.3, h: 3.3, valign: "top", margin: 0, isTextBox: true });
s.addNotes("Detalle completo con valor de trabajo, alternativa y monto en juego por perfil de frecuencia: hoja Pendientes del simulador. Auditoría de la evaluación previa: archivo Auditoria_Evaluacion_Previa.xlsx.");

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("ok", OUT);
})();
