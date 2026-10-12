"""Construye Simulador_Movilizacion_GRS110.xlsx (fórmulas vivas)."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule
from openpyxl.utils import get_column_letter as CL
from logs import leer

OUT = sys.argv[1]; INS = sys.argv[2]
F = "Arial"
BLUE = Font(name=F, size=10, color="0000FF"); BLK = Font(name=F, size=10); GRN = Font(name=F, size=10, color="008000")
B = Font(name=F, size=10, bold=True); TITLE = Font(name=F, size=14, bold=True, color="1F3864")
H1 = Font(name=F, size=11, bold=True, color="FFFFFF"); NOTE = Font(name=F, size=9, italic=True, color="595959")
F_H1 = PatternFill("solid", fgColor="1F3864"); F_H2 = PatternFill("solid", fgColor="D9E1F2")
F_Y = PatternFill("solid", fgColor="FFFF00"); F_TOT = PatternFill("solid", fgColor="F2F2F2")
thin = Side(style="thin", color="BFBFBF"); BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
USD = '$#,##0;($#,##0);"-"'; USD2 = '$#,##0.00;($#,##0.00);"-"'; COP = '#,##0;(#,##0);"-"'; PCT = '0.0%;(0.0%);"-"'; NUM = '#,##0.0;(#,##0.0);"-"'
RANGOS = ["Misma localización", "0,1–5 km", "5–10 km", "Más de 10 km"]
OFERTAS = ["Petro Star tarifa normal", "Petro Star Lump Sum (sin descuento)", "Lump Sum con descuento (solo referencia)", "Ecotransur"]

wb = Workbook()
ws = wb.active; ws.title = "Simulador"
ws.sheet_view.showGridLines = False
for col, w in zip("ABCDEFGHIJKLMNOP", [2, 52, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 14, 14]):
    ws.column_dimensions[col].width = w


def put(c, v, font=BLK, fmt=None, fill=None, bold=False, wrap=False, border=True):
    cell = ws[c]; cell.value = v; cell.font = Font(name=F, size=10, bold=True, color=font.color) if bold else font
    if fmt: cell.number_format = fmt
    if fill: cell.fill = fill
    if border: cell.border = BOX
    if wrap: cell.alignment = Alignment(wrap_text=True, vertical="top")
    return cell


def h1(r, text, last="I"):
    ws.merge_cells(f"B{r}:{last}{r}")
    c = ws[f"B{r}"]; c.value = text; c.font = H1; c.fill = F_H1


def note(r, text, last="I"):
    ws.merge_cells(f"B{r}:{last}{r}")
    c = ws[f"B{r}"]; c.value = text; c.font = NOTE; c.alignment = Alignment(wrap_text=True, vertical="top")
    ws.row_dimensions[r].height = 28


ws["B1"] = "Simulador de movilización del taladro GRS 110 · La Cira Infantas"; ws["B1"].font = TITLE
ws["B2"] = "Work Order (suma global por movilización) frente a modelo tercerizado (transportador + taladro por hora + Truck Manager). Todo en USD salvo donde dice COP."
ws["B2"].font = NOTE
ws["B3"] = "Cómo leerlo: azul = dato editable · fondo amarillo = supuesto clave a confirmar · verde = viene de otra hoja · negro = cálculo. Ahorro positivo = el tercerizado cuesta menos que el Work Order."
ws["B3"].font = NOTE

# ---------- 1. Parámetros generales
h1(5, "1. PARÁMETROS GENERALES")
for c, t in zip("BCDEF", ["Variable", "Valor", "Unidad", "Clase", "Fuente"]):
    put(f"{c}6", t, B, fill=F_H2)
ws.merge_cells("F6:I6")
P = [
    (7, "TRM", 3700, "COP/USD", "Premisa SierraCol", "Tarifas.xlsx · E3 (fija para el ejercicio)", COP, False),
    (8, "Tarifa del taladro (24 h)", 34944, "USD/día", "Medido", "Tarifas.xlsx · E5", USD, False),
    (9, "Tarifa del taladro por hora", "=C8/24", "USD/h", "Cálculo", "Tarifas.xlsx · E6 (= E5/24)", USD2, False),
    (10, "Oferta que se muestra en la fila 88 (solo detalle)", OFERTAS[0], "", "Selección", "Lista: las 3 ofertas (Lump Sum con y sin descuento)", None, False),
    (11, "Adicionales sobre tarifa base (Petro Star normal y Ecotransur)", 0, "%", "Premisa SierraCol", "Tarifas.xlsx · E7. Se cancela con el WO; ver Pendientes", PCT, True),
    (12, "Adicionales sobre Lump Sum", 0, "%", "Premisa SierraCol", "Tarifas.xlsx · E8", PCT, True),
    (13, "Adicionales sobre Work Order", 0, "%", "Premisa SierraCol", "Simetría: los imprevistos también se pagan en el WO", PCT, True),
    (14, "Truck Manager: valor mensual", 60000000, "COP/mes", "Medido", "Tarifas.xlsx · C29 = (60.000.000/E3)/6", COP, False),
    (15, "Truck Manager: movilizaciones/mes con que se prorratea", 6, "movs/mes", "Medido (fórmula Excel)", "Tarifas.xlsx · C29", '0', False),
    (16, "Truck Manager: forma de cobro", "Por movilización (Excel)", "", "Premisa SierraCol", "Por movilización = 2.702,70 USD fijo por mov. Mensual fijo = 60 M COP por mes con movilizaciones", None, True),
    (17, "Descuento Petro Star tarifa normal desde la 6ª del mes", 0.5, "%", "Medido", "Cot. 1255 p. 2: '50% de cada escenario'", PCT, False),
    (18, "Descuento Lump Sum (solo para la columna de referencia)", 0.5, "%", "Referencia aparte", "Evaluación principal: Lump Sum SIN descuento (SierraCol). Esta columna se muestra aparte", PCT, True),
    (19, "Movilización del mes desde la que aplica el descuento", 6, "nº", "Medido", "Cot. 1255 p. 2 · Ecotransur p. 3–4", '0', False),
    (20, "Señalizadoras que faltan en el WO, por turno", 4, "personas", "Premisa SierraCol", "Ofertas: 10 por turno · WO: 6 por turno (dato SierraCol)", '0', False),
    (21, "Tarifa señalizador vial, turno 12 h", 375000, "COP/persona", "Medido", "Cot. 1255 p. 5, fila Señalizador vial, columna Turno 12 horas", COP, False),
    (22, "¿Cargar el recargo de señalizadoras al Work Order?", "Sí", "", "Decisión de modelo", "Aplica a toda movilización: misma loc. 1 turno, demás rangos 2 turnos", None, False),
    (23, "Reducción de la frecuencia por tiempo no productivo (NPT) de perforación", 0, "%", "Supuesto (sin dato)", "No hay plan de pozos ni NPT operativo en los archivos: se deja en 0 y se sensibiliza", PCT, True),
]
for r, lab, val, uni, cls, src, fmt, key in P:
    put(f"B{r}", lab); put(f"C{r}", val, BLUE if not str(val).startswith("=") else BLK, fmt, F_Y if key else None)
    put(f"D{r}", uni); put(f"E{r}", cls); put(f"F{r}", src); ws.merge_cells(f"F{r}:I{r}")
# ---------- 1b. Riesgos operativos (panel lateral)
ws.merge_cells("K5:N5"); c = ws["K5"]; c.value = "1b. HORAS EXCEDIDAS, BLOQUEOS, BONO WO Y COSTO DEL POZO"; c.font = H1; c.fill = F_H1
ws.merge_cells("K6:M6"); put("K6", "Variable", B, fill=F_H2); put("N6", "Valor", B, fill=F_H2)
SIDE = [(7, "¿Se cobran equipos y señalizadores por hora por encima del tiempo estipulado? (Cot. 1255 p. 5)", "Sí", None),
        (8, "Señalizadores por hora excedida: 20 × 54.375 COP (Cot. 1255 p. 5)", 1087500, COP),
        (9, "Meses bloqueados en la campaña (no se puede mover; contrato vigente)", 0, '0'),
        (10, "Bono del Work Order por mover más rápido (% sobre la tarifa) · tabla WO por horas pendiente", 0, PCT),
        (11, "Costo de un pozo en LCI, solo perforación (USD) · SierraCol: 500–600 k", 550000, USD)]
for r, lab, val, fmt in SIDE:
    ws.merge_cells(f"K{r}:M{r}"); put(f"K{r}", lab, wrap=True); put(f"N{r}", val, BLUE, fmt, F_Y)
    ws.row_dimensions[r].height = 30
dvs = DataValidation(type="list", formula1='"Sí,No"'); ws.add_data_validation(dvs); dvs.add("N7")
dv = DataValidation(type="list", formula1='"' + ",".join([OFERTAS[0], OFERTAS[1], OFERTAS[3]]) + '"'); ws.add_data_validation(dv); dv.add("C10")
dv2 = DataValidation(type="list", formula1='"Por movilización (Excel),Mensual fijo"'); ws.add_data_validation(dv2); dv2.add("C16")
dv3 = DataValidation(type="list", formula1='"Sí,No"'); ws.add_data_validation(dv3); dv3.add("C22")

# ---------- 2. Campaña
h1(25, "2. CAMPAÑA A EVALUAR")
for c, t in zip("BCDEF", ["Variable", "Valor", "Unidad", "Clase", "Fuente"]):
    put(f"{c}26", t, B, fill=F_H2)
ws.merge_cells("F26:I26")
C = [
    (27, "Pozos en la misma localización", 15, "pozos", "Premisa SierraCol", "Proyección de campaña entregada por SierraCol", '0'),
    (28, "Pozos en otra localización", 20, "pozos", "Premisa SierraCol", "Proyección de campaña entregada por SierraCol", '0'),
    (29, "Rango de los pozos en otra localización (2 = 0,1–5 km · 3 = 5–10 km · 4 = más de 10 km)", 2, "1–4", "Premisa SierraCol", "Confirmado por SierraCol: 0,1–5 km", '0'),
    (30, "Total de pozos (movilizaciones)", "=C27+C28", "pozos", "Cálculo", "Máximo 60 en la tabla de detalle", '0'),
    (31, "Frecuencia mensual", "Constante", "", "Premisa SierraCol", "Esperado: 5 a 6 movs/mes (SierraCol). Perfil 2024 / Perfil 2025 = meses reales de los logs", None),
    (32, "Movilizaciones por mes si la frecuencia es constante", 5, "movs/mes", "Premisa SierraCol", "Rango esperado 5–6; ver Sensibilidad (4 a 8)", NUM),
]
for r, lab, val, uni, cls, src, fmt in C:
    put(f"B{r}", lab, wrap=(r == 29)); put(f"C{r}", val, BLUE if not str(val).startswith("=") else BLK, fmt, F_Y if r in (29, 31) else None)
    put(f"D{r}", uni); put(f"E{r}", cls); put(f"F{r}", src); ws.merge_cells(f"F{r}:I{r}")
ws.row_dimensions[29].height = 26
ws["D29"] = '=INDEX({"Misma localización","0,1–5 km","5–10 km","Más de 10 km"},C29)'
dv4 = DataValidation(type="list", formula1='"Perfil 2024,Perfil 2025,Constante"'); ws.add_data_validation(dv4); dv4.add("C31")
dv5 = DataValidation(type="whole", operator="between", formula1="2", formula2="4"); ws.add_data_validation(dv5); dv5.add("C29")
dv6 = DataValidation(type="custom", formula1="AND(C27>=0,C28>=0,C27+C28<=60)", showErrorMessage=True, error="Máximo 60 pozos en total"); ws.add_data_validation(dv6); dv6.add("C27:C28")
dv7 = DataValidation(type="decimal", operator="between", formula1="0", formula2="0.9", showErrorMessage=True, error="Entre 0 % y 90 %"); ws.add_data_validation(dv7); dv7.add("C23")
dv8 = DataValidation(type="decimal", operator="greaterThanOrEqual", formula1="1", showErrorMessage=True, error="Al menos 1"); ws.add_data_validation(dv8); dv8.add("C32")
dv9 = DataValidation(type="whole", operator="between", formula1="2", formula2="12"); ws.add_data_validation(dv9); dv9.add("C19")
p24 = [7, 8, 7, 7, 7, 9, 7, 3, 6, 6, 3]; p25 = [1, 4, 7, 5, 6, 7, 7, 5, 3]
put("B33", "Perfil 2024: movilizaciones por mes (ene–nov, log)")
for i, v in enumerate(p24): put(f"{CL(3+i)}33", v, BLUE, '0')
put("B34", "Perfil 2025: movilizaciones por mes (feb–oct, log)")
for i, v in enumerate(p25): put(f"{CL(3+i)}34", v, BLUE, '0')
note(35, "Los perfiles salen de Movilizaciones_2024.xlsx (C11:C21) y Movilizaciones_2025.xlsx (C11:C19). Los meses sin registro se tratan como campaña parada (premisa SierraCol) y no entran.", "M")

# ---------- 3. Tarifas por rango
h1(37, "3. TARIFAS Y COSTO POR MOVILIZACIÓN, POR RANGO DE DISTANCIA")
for c, t in zip("BCDEFGH", ["Concepto"] + RANGOS + ["Clase", "Fuente"]):
    put(f"{c}38", t, B, fill=F_H2)
ws.merge_cells("H38:I38")
T = [
    (39, "Horas de movilización que se le pagan al taladro (tercerizado)", [12, 18, 24, 28], "Dato del Excel", "Tarifas.xlsx · C26, C52, C78, C104", '0.0', True),
    (40, "Horas extra por movilización (NPT de movilización)", [0, 0, 0, 0], "Supuesto (0)", "Logs: ver hojas Real 2024 / Real 2025", '0.0', True),
    (41, "Tiempo estipulado por el transportador (h): por encima se cobran equipos y señalizadores por hora", [12, 24, 36, 36], "Medido · Ecotransur = supuesto", "Cot. 1255 p. 1–2 'Tiempo total' y p. 5 (Ecotransur no declara tiempos)", '0', False),
    (42, "Turnos de señalizadoras por movilización", [1, 2, 2, 2], "Premisa SierraCol", "12 h = 1 turno; 18/24/28 h = 2 turnos", '0', False),
    (43, "Work Order base (USD por movilización)", [75642, 98663, 95374, 110174], "Premisa SierraCol", "Tarifas.xlsx · K4:K7 (dato SierraCol)", USD, False),
    (44, "Tarifa Petro Star normal (COP)", [140385441, 220853084, 238462998, 246462998], "Medido", "Tarifas.xlsx · E25, E51, E77, E103", COP, False),
    (45, "Tarifa Petro Star Lump Sum (COP)", [178363885, 304284690, 373649874, 414800928], "Medido", "Tarifas.xlsx · F25, F51, F77, F103 (≠ Cot. 1255: ver Pendientes)", COP, False),
    (46, "Tarifa Ecotransur (COP)", [140233002, 207703002, 249003002, 253060002], "Medido", "Tarifas.xlsx · G25, G51, G77, G103", COP, False),
    (47, "Ecotransur desde la 6ª: solo equipos (COP)", [123180000, 123180000, 139005000, 167055000], "Medido · misma loc. = supuesto", "Ecotransur p. 3–4 (no trae valor para misma localización)", COP, True),
]
for r, lab, vals, cls, src, fmt, key in T:
    put(f"B{r}", lab)
    for i, v in enumerate(vals):
        put(f"{CL(3+i)}{r}", v, BLUE, fmt, F_Y if (key and not (r == 47 and i > 0)) else None)
    put(f"G{r}", cls); put(f"H{r}", src); ws.merge_cells(f"H{r}:I{r}")

def calc_row(r, lab, f, fmt=USD, bold=False, src=""):
    put(f"B{r}", lab, bold=bold)
    for i in range(4):
        col = CL(3 + i)
        put(f"{col}{r}", f.replace("#", col), BLK, fmt, F_TOT if bold else None, bold=bold)
    if src:
        put(f"G{r}", src); ws.merge_cells(f"G{r}:I{r}")

put("B49", "Work Order (USD por movilización)", B, fill=F_H2)
calc_row(50, "Recargo de señalizadoras faltantes", '=IF($C$22="Sí",$C$20*$C$21*#42/$C$7,0)', USD2, src="Personas por turno × tarifa turno × turnos / TRM")
calc_row(51, "Work Order total por movilización", "=#43*(1+$C$13+$N$10)+#50", USD, True)
put("B52", "Tercerizado (USD por movilización)", B, fill=F_H2)
calc_row(53, "Taladro durante la movilización", "=(#39+#40)*$C$9", USD, src="(Horas + horas extra) × tarifa por hora")
calc_row(54, "Truck Manager por movilización", '=IF($C$16="Mensual fijo",0,$C$14/$C$7/$C$15)', USD2, src="Si es mensual fijo se suma por mes (sección 6)")
calc_row(55, "Petro Star normal: tarifa, 1ª a 5ª del mes", "=#44/$C$7*(1+$C$11)")
calc_row(56, "Petro Star normal: tarifa, 6ª en adelante", "=#55*(1-$C$17)")
calc_row(57, "Lump Sum: tarifa (sin descuento)", "=#45/$C$7*(1+$C$12)")
calc_row(58, "Lump Sum: tarifa 6ª en adelante (columna con descuento)", "=#57*(1-$C$18)")
calc_row(59, "Ecotransur: tarifa, 1ª a 5ª del mes", "=#46/$C$7*(1+$C$11)")
calc_row(60, "Ecotransur: 6ª en adelante (solo equipos)", "=#47/$C$7*(1+$C$11)")
put("B61", "Costo total por movilización tercerizada = tarifa + taladro + Truck Manager", B, fill=F_H2)
calc_row(62, "Petro Star normal, 1ª a 5ª  (= fila amarilla del Excel)", "=#55+#53+#54+#69", USD, True)
calc_row(63, "Petro Star normal, 6ª en adelante", "=#56+#53+#54+#69", USD, True)
calc_row(64, "Lump Sum sin descuento  (= fila amarilla del Excel)", "=#57+#53+#54+#69", USD, True)
calc_row(65, "Lump Sum con descuento, 6ª en adelante", "=#58+#53+#54+#69", USD, True)
calc_row(66, "Ecotransur, 1ª a 5ª  (= fila amarilla del Excel)", "=#59+#53+#54+#69", USD, True)
calc_row(67, "Ecotransur, 6ª en adelante", "=#60+#53+#54+#69", USD, True)
put("B68", "Equipos de la flota mínima por hora excedida (COP/h)")
for i in range(4): put(f"{CL(3+i)}68", 3934000, BLUE, COP, F_Y)
put("G68", "Estimado"); put("H68", "Flota mínima Cot. 1255 p. 1–2 a tarifa por hora p. 5 (Ecotransur: mismas tarifas, supuesto)"); ws.merge_cells("H68:I68")
calc_row(69, "Cobro por horas excedidas (equipos + señalizadores), por movilización", '=IF($N$7="Sí",MAX(0,#39+#40-#41)*(#68+$N$8)/$C$7,0)', USD, src="Cero con las horas del Excel; aparece si las horas superan el tiempo estipulado")

# ---------- 4. Cargo fijo mensual
h1(70, "4. CARGO FIJO MENSUAL DEL TRANSPORTADOR (nómina + disponibilidad o stand-by), según movilizaciones del mes")
for c, t in zip("BCDEFG", ["Movilizaciones en el mes", "Petro Star (COP)", "Ecotransur (COP)", "Petro Star (USD)", "Ecotransur (USD)", "Fuente"]):
    put(f"{c}71", t, B, fill=F_H2)
ws.merge_cells("G71:I71")
ps_fijo = [430000000 + 164780000, 327959522 + 166920000, 226825000 + 125190000, 174643162 + 83460000, 142153566 + 66768000, 93102391 + 58422000, 0]
ec_fijo = [717374835 + 120000000, 573899868 + 96000000, 430424901 + 72000000, 286949934 + 48000000, 143474967 + 24000000, 0, 0]
for i in range(7):
    r = 72 + i
    put(f"B{r}", i if i < 6 else "6 o más", BLK, '0')
    put(f"C{r}", ps_fijo[i], BLUE, COP, F_Y if i == 5 else None); put(f"D{r}", ec_fijo[i], BLUE, COP)
    put(f"E{r}", f"=C{r}/$C$7", BLK, USD); put(f"F{r}", f"=D{r}/$C$7", BLK, USD)
    put(f"G{r}", ["Cot. 1255 p. 4 · Ecotransur p. 2–3 (0 movs: el mes no cuenta, campaña parada)", "Nómina + disponibilidad (PS) · nómina 80% + stand-by 80% (EC)", "", "", "", "PS: la tabla de 5 movs aún cobra (amarillo). EC: desde la 5ª no cobra", "Sin cargo fijo"][i])
    ws.merge_cells(f"G{r}:I{r}")
note(79, "El cargo de Petro Star aplica igual a la tarifa normal y al Lump Sum (la tabla de la p. 4 es condición general de la oferta). Un mes sin movilizaciones no se cobra porque SierraCol lo trata como campaña parada; si el contrato sigue vigente, se cobraría la fila 0 (ver Pendientes).")

# ---------- 5. Resultado
h1(81, "5. COSTO DE LA CAMPAÑA CON EL PERFIL ELEGIDO (ilustrativo; el resultado es la frontera, sección 6)")
for c, t in zip("BCDEFGH", ["Modelo", "Costo de la campaña (USD)", "Ahorro frente al WO (USD)", "Ahorro %", "Movilizaciones con descuento", "Cargo fijo pagado (USD)", "Meses de campaña"]):
    put(f"{c}82", t, B, fill=F_H2, wrap=True)
ws.row_dimensions[82].height = 28
# detalle: filas de movimientos 157..216, meses 115..150
MV0, MV1 = 157, 216; M0, M1 = 115, 150
rows = [
    (83, "Work Order (modelo directo)", f"=SUM(G{MV0}:G{MV1})", None, None),
    (84, OFERTAS[0], f"=SUM(H{MV0}:H{MV1})+G{M1+1}+I{M1+1}+$N$9*$E$72", f"G{M1+1}+$N$9*$E$72", True),
    (85, OFERTAS[1], f"=SUM(I{MV0}:I{MV1})+G{M1+1}+I{M1+1}+$N$9*$E$72", f"G{M1+1}+$N$9*$E$72", False),
    (86, OFERTAS[2], f"=SUM(J{MV0}:J{MV1})+G{M1+1}+I{M1+1}+$N$9*$E$72", f"G{M1+1}+$N$9*$E$72", True),
    (87, OFERTAS[3], f"=SUM(K{MV0}:K{MV1})+H{M1+1}+I{M1+1}+$N$9*$F$72", f"H{M1+1}+$N$9*$F$72", True),
]
for r, lab, f, fijo, desc in rows:
    put(f"B{r}", lab, bold=(r == 83)); put(f"C{r}", f, BLK, USD)
    if r > 83:
        put(f"D{r}", f"=$C$83-C{r}", BLK, USD); put(f"E{r}", f"=IF($C$83=0,0,D{r}/$C$83)", BLK, PCT)
        put(f"F{r}", f'=COUNTIF($F${MV0}:$F${MV1},">="&$C$19)' if desc else 0, BLK, '0')
        put(f"G{r}", f"={fijo}", BLK, USD)
    put(f"H{r}", f'=COUNTIF($F${M0}:$F${M1},">0")', BLK, '0')
put("L82", "Ahorro por pozo (USD)", B, fill=F_H2, wrap=True); put("M82", "Ahorro como % del costo de un pozo", B, fill=F_H2, wrap=True)
for rr in range(84, 88):
    put(f"L{rr}", f"=IF($C$30=0,0,D{rr}/$C$30)", BLK, USD); put(f"M{rr}", f"=IF($N$11=0,0,L{rr}/$N$11)", BLK, PCT)
put("B88", "Oferta elegida en C10 (detalle)", bold=True, fill=F_Y)
put("C88", "=INDEX(C84:C87,MATCH($C$10,$B$84:$B$87,0))", BLK, USD, F_Y, bold=True)
put("D88", "=INDEX(D84:D87,MATCH($C$10,$B$84:$B$87,0))", BLK, USD, F_Y, bold=True)
put("E88", "=INDEX(E84:E87,MATCH($C$10,$B$84:$B$87,0))", BLK, PCT, F_Y, bold=True)
ws.conditional_formatting.add("D84:E88", CellIsRule(operator="lessThan", formula=["0"], font=Font(name=F, color="C00000")))
put("I82", "Control", B, fill=F_H2)
put("I83", f'=IF(COUNT(D{MV0}:D{MV1})<>$C$30,"CAMPAÑA RECORTADA (máx. 60 pozos)",IF(MAX(E{MV0}:E{MV1})>36,"CAMPAÑA DE MÁS DE 36 MESES: AMPLIAR",IF(COUNTIFS(F{M0}:F{M1},0,B{M0}:B{M1},"<="&MAX(E{MV0}:E{MV1}))>0,"OK · hay meses sin movilización que pagan cargo fijo","OK")))', BLK, None, F_Y, bold=True, wrap=True)
ws.merge_cells("I83:K84")
note(89, "La fila 'Lump Sum con descuento' es solo referencia; la evaluación principal usa el Lump Sum sin descuento. Esta cifra depende de la frecuencia, de la mezcla por rango y del orden de los pozos dentro del mes. No es el resultado del estudio: el resultado es la frontera (sección 6).")

# ---------- 6. Frontera
h1(91, "6. FRONTERA DE DECISIÓN · ahorro del mes si en él hay n movilizaciones, todas del mismo rango (USD)", "P")
put("B92", "Oferta · rango   /   movilizaciones en el mes →", B, fill=F_H2)
for n in range(1, 13):
    put(f"{CL(2+n)}92", n, B, '0', F_H2)
put("O92", "Equilibrio (movs/mes)", B, fill=F_H2, wrap=True); ws.row_dimensions[92].height = 28
full = {0: 62, 1: 64, 2: 64, 3: 66}; disc = {0: 63, 1: 64, 2: 65, 3: 67}; fijocol = {0: "E", 1: "E", 2: "E", 3: "F"}
r = 93
for o in range(4):
    for g in range(4):
        rc = CL(3 + g)
        put(f"B{r}", f"{OFERTAS[o]} · {RANGOS[g]}")
        for n in range(1, 13):
            nc = f"{CL(2+n)}$92"
            f = (f"=({nc}*{rc}$51)-(MIN({nc},$C$19-1)*{rc}${full[o]}+MAX(0,{nc}-($C$19-1))*{rc}${disc[o]}"
                 f"+INDEX(${fijocol[o]}$72:${fijocol[o]}$78,MIN({nc},6)+1)+IF($C$16=\"Mensual fijo\",$C$14/$C$7,0))")
            put(f"{CL(2+n)}{r}", f, BLK, USD)
        put(f"O{r}", f'=IFERROR(INDEX($C$92:$N$92,MATCH(1,INDEX(--(C{r}:N{r}>=0),0),0)),"no cruza")', BLK, '0', bold=True)
        r += 1
ws.conditional_formatting.add("C93:N108", CellIsRule(operator="lessThan", formula=["0"], fill=PatternFill("solid", fgColor="F8CBAD")))
ws.conditional_formatting.add("C93:N108", CellIsRule(operator="greaterThanOrEqual", formula=["0"], fill=PatternFill("solid", fgColor="C6EFCE")))
note(109, "Verde = el tercerizado cuesta menos ese mes; rojo = cuesta más. Equilibrio = primera frecuencia mensual en que el tercerizado deja de perder. Los saltos entre columnas son los umbrales (cargo fijo hasta la 4ª/5ª, descuento desde la 6ª).", "O")

# ---------- 7. Detalle: meses
h1(111, "7. DETALLE DE LA CAMPAÑA · meses (asignación de movilizaciones según la frecuencia)", "K")
note(112, "Cada mes recibe las movilizaciones del perfil elegido (C31), reducidas por el NPT de perforación (C23). Con NPT la campaña se alarga; un mes que queda sin movilizaciones dentro de la campaña paga el cargo fijo de 0 movilizaciones (contrato vigente).", "K")
for c, t in zip("BCDEFGHI", ["Mes de campaña", "Movs/mes del perfil (movs)", "Capacidad con NPT (movs)", "Capacidad acumulada (movs)", "Movilizaciones del mes", "Cargo fijo Petro Star (USD)", "Cargo fijo Ecotransur (USD)", "Truck Manager mensual (USD)"]):
    put(f"{c}114", t, B, fill=F_H2, wrap=True)
ws.row_dimensions[114].height = 28
for m in range(1, 37):
    r = M0 + m - 1
    put(f"B{r}", m, BLK, '0')
    put(f"C{r}", f'=IF($C$31="Constante",$C$32,IF($C$31="Perfil 2024",INDEX($C$33:$M$33,MOD(B{r}-1,COUNT($C$33:$M$33))+1),INDEX($C$34:$M$34,MOD(B{r}-1,COUNT($C$34:$M$34))+1)))', BLK, NUM)
    put(f"D{r}", f"=C{r}*(1-$C$23)", BLK, NUM)
    put(f"E{r}", f"=D{r}" if m == 1 else f"=E{r-1}+D{r}", BLK, NUM)
    put(f"F{r}", f"=COUNTIF($E${MV0}:$E${MV1},B{r})", BLK, '0')
    put(f"G{r}", f"=IF(F{r}=0,IF(B{r}<=MAX($E${MV0}:$E${MV1}),$E$72,0),INDEX($E$72:$E$78,MIN(F{r},6)+1))", BLK, USD)
    put(f"H{r}", f"=IF(F{r}=0,IF(B{r}<=MAX($E${MV0}:$E${MV1}),$F$72,0),INDEX($F$72:$F$78,MIN(F{r},6)+1))", BLK, USD)
    put(f"I{r}", f'=IF(AND($C$16="Mensual fijo",F{r}>0),$C$14/$C$7,0)', BLK, USD)
put(f"B{M1+1}", "Total", bold=True, fill=F_TOT)
for c in "FGHI":
    put(f"{c}{M1+1}", f"=SUM({c}{M0}:{c}{M1})", BLK, USD if c != "F" else '0', F_TOT, bold=True)

# ---------- 8. Detalle: movilizaciones
h1(153, "8. DETALLE DE LA CAMPAÑA · movilización por movilización (USD)", "K")
note(154, "Tipo de pozo: los pozos en la misma localización se intercalan en proporción a lo largo de la campaña (supuesto de orden). Puede escribir encima de Rango o Mes para modelar cualquier campaña.", "K")
for c, t in zip("BCDEFGHIJK", ["Pozo nº", "Tipo de pozo", "Rango (1–4)", "Mes de campaña", "Nº de la movilización en el mes", "Work Order", OFERTAS[0], OFERTAS[1], OFERTAS[2], OFERTAS[3]]):
    put(f"{c}156", t, B, fill=F_H2, wrap=True)
ws.row_dimensions[156].height = 40
for i in range(1, 61):
    r = MV0 + i - 1
    put(f"B{r}", i, BLK, '0')
    put(f"C{r}", f'=IF(B{r}>$C$30,"",IF(INT(B{r}*$C$27/$C$30)>INT((B{r}-1)*$C$27/$C$30),"Misma loc.","Otra loc."))')
    put(f"D{r}", f'=IF(C{r}="","",IF(C{r}="Misma loc.",1,$C$29))', BLK, '0')
    put(f"E{r}", f'=IF(C{r}="","",COUNTIF($E${M0}:$E${M1},"<"&(B{r}-0.000001))+1)', BLK, '0')
    put(f"F{r}", f'=IF(C{r}="","",COUNTIF($E${MV0}:E{r},E{r}))', BLK, '0')
    put(f"G{r}", f'=IF(C{r}="","",INDEX($C$51:$F$51,D{r}))', BLK, USD)
    put(f"H{r}", f'=IF(C{r}="","",IF(F{r}>=$C$19,INDEX($C$63:$F$63,D{r}),INDEX($C$62:$F$62,D{r})))', BLK, USD)
    put(f"I{r}", f'=IF(C{r}="","",INDEX($C$64:$F$64,D{r}))', BLK, USD)
    put(f"J{r}", f'=IF(C{r}="","",IF(F{r}>=$C$19,INDEX($C$65:$F$65,D{r}),INDEX($C$64:$F$64,D{r})))', BLK, USD)
    put(f"K{r}", f'=IF(C{r}="","",IF(F{r}>=$C$19,INDEX($C$67:$F$67,D{r}),INDEX($C$66:$F$66,D{r})))', BLK, USD)
put(f"B{MV1+1}", "Total movilizaciones (sin cargo fijo ni TM mensual)", bold=True, fill=F_TOT)
for c in "GHIJK":
    put(f"{c}{MV1+1}", f"=SUM({c}{MV0}:{c}{MV1})", BLK, USD, F_TOT, bold=True)
ws.freeze_panes = "C5"

# ---------- Hojas de campaña real
def hoja_real(anio, path):
    L = leer(path)
    s = wb.create_sheet(f"Real {anio}")
    s.sheet_view.showGridLines = False
    widths = [2, 12, 12, 9, 15, 8, 7, 9, 10, 10, 11, 14, 14, 14, 14, 14, 14, 14, 14, 14, 30]
    for i, w in enumerate(widths): s.column_dimensions[CL(i + 1)].width = w
    s["B1"] = f"Campaña real {anio} · taladro GRS 110 · cómo habría funcionado cada modelo"; s["B1"].font = TITLE
    s["B2"] = (f"Movimientos de Movilizaciones_{anio}.xlsx (detalle, columnas D, C, F, G, H), en orden de fecha. Los meses sin registro no se cuentan (campaña parada). "
               "Parámetros y tarifas vienen de la hoja Simulador (verde). Columnas M–P usan las horas del Excel; Q–T, las horas reales del log. Ahorro positivo = el tercerizado cuesta menos.")
    s["B2"].font = NOTE
    n = len(L); R0 = 8; R1 = R0 + n - 1
    hdr = ["Fecha", "Pozo", "Km", "Rango (log)", "Rango nº", "Mes", "Nº en el mes", "Horas reales", "Horas Excel", "Sobretiempo (h)", "Work Order (USD)",
           "PS normal, horas Excel (USD)", "LS sin desc., horas Excel (USD)", "LS con desc. (ref.), horas Excel (USD)", "Ecotransur, horas Excel (USD)",
           "PS normal, horas reales (USD)", "LS sin desc., horas reales (USD)", "LS con desc. (ref.), horas reales (USD)", "Ecotransur, horas reales (USD)", "Nota"]
    for i, t in enumerate(hdr):
        c = s.cell(7, 2 + i, t); c.font = B; c.fill = F_H2; c.border = BOX; c.alignment = Alignment(wrap_text=True, vertical="center")
    s.row_dimensions[7].height = 54
    def S(ref): return f"Simulador!{ref}"
    for j, m in enumerate(L):
        r = R0 + j
        vals = [(m["fecha"], 'dd-mmm-yy', BLUE), (m["pozo"], None, BLUE), (m["km"], '0.00', BLUE), (["Misma locación", "0.15 - 5 km", "5 - 10 km", "10+ km"][m["rango"]], None, BLUE)]
        for i, (v, fmt, fnt) in enumerate(vals):
            c = s.cell(r, 2 + i, v); c.font = fnt; c.border = BOX
            if fmt: c.number_format = fmt
        fl = {"F": f'=MATCH(E{r},{{"Misma locación","0.15 - 5 km","5 - 10 km","10+ km"}},0)', "G": f"=MONTH(B{r})", "H": f"=COUNTIF($G${R0}:G{r},G{r})",
              "J": f"=INDEX({S('$C$39:$F$39')},F{r})", "K": f'=IF(I{r}="","",I{r}-J{r})',
              "L": f"=INDEX({S('$C$51:$F$51')},F{r})",
              "M": f"=IF(H{r}>={S('$C$19')},INDEX({S('$C$63:$F$63')},F{r}),INDEX({S('$C$62:$F$62')},F{r}))",
              "N": f"=INDEX({S('$C$64:$F$64')},F{r})",
              "O": f"=IF(H{r}>={S('$C$19')},INDEX({S('$C$65:$F$65')},F{r}),INDEX({S('$C$64:$F$64')},F{r}))",
              "P": f"=IF(H{r}>={S('$C$19')},INDEX({S('$C$67:$F$67')},F{r}),INDEX({S('$C$66:$F$66')},F{r}))"}
        hr = f"(IF(I{r}=\"\",J{r}+INDEX({S('$C$40:$F$40')},F{r}),I{r})-J{r}-INDEX({S('$C$40:$F$40')},F{r}))*{S('$C$9')}"
        hreal = f"IF(I{r}=\"\",J{r}+INDEX({S('$C$40:$F$40')},F{r}),I{r})"
        hr += (f"-INDEX({S('$C$69:$F$69')},F{r})+IF({S('$N$7')}=\"Sí\",MAX(0,{hreal}-INDEX({S('$C$41:$F$41')},F{r}))"
               f"*(INDEX({S('$C$68:$F$68')},F{r})+{S('$N$8')})/{S('$C$7')},0)")
        for a, bcol in zip("MNOP", "QRST"):
            fl[bcol] = f"={a}{r}+{hr}"
        for col, f in fl.items():
            c = s[f"{col}{r}"]; c.value = f; c.font = GRN if col in "JL" else BLK; c.border = BOX
            c.number_format = '0' if col in "FGH" else ('0.0' if col in "JK" else USD)
        c = s[f"I{r}"]; c.value = m["horas"]; c.font = BLUE; c.border = BOX; c.number_format = '0.00'
        nota = []
        if m["km"] > 20: nota.append("Más de 20 km: Petro Star no tiene tarifa (se usa la de 10–20 km)")
        if m["horas"] is None: nota.append("Sin horas en el log: se usan las del Excel")
        c = s[f"U{r}"]; c.value = "; ".join(nota); c.font = NOTE
    # Totales y resumen
    T0 = R1 + 2
    s[f"B{T0}"] = "Totales por movimiento (sin cargo fijo)"; s[f"B{T0}"].font = B
    for col in "LMNOPQRST":
        c = s[f"{col}{T0}"]; c.value = f"=SUM({col}{R0}:{col}{R1})"; c.number_format = USD; c.font = B; c.fill = F_TOT; c.border = BOX
    # Meses
    s["B4"] = "Resumen"; s["B4"].font = B
    MT = T0 + 3
    s[f"B{MT}"] = "Meses con movilizaciones"; s[f"B{MT}"].font = B
    for i, t in enumerate(["Mes", "Movilizaciones", "Misma loc.", "0,15–5 km", "5–10 km", "Más de 10 km", "Cargo fijo PS (USD)", "Cargo fijo EC (USD)", "TM mensual (USD)"]):
        c = s.cell(MT + 1, 2 + i, t); c.font = B; c.fill = F_H2; c.border = BOX; c.alignment = Alignment(wrap_text=True)
    meses = sorted({m["mes"] for m in L})
    for j, mm in enumerate(meses):
        r = MT + 2 + j
        s[f"B{r}"] = mm
        s[f"C{r}"] = f"=COUNTIF($G${R0}:$G${R1},B{r})"
        for k, col in enumerate("DEFG"):
            s[f"{col}{r}"] = f"=COUNTIFS($G${R0}:$G${R1},B{r},$F${R0}:$F${R1},{k+1})"
        s[f"H{r}"] = f"=IF(C{r}=0,0,INDEX({S('$E$72:$E$78')},MIN(C{r},6)+1))"
        s[f"I{r}"] = f"=IF(C{r}=0,0,INDEX({S('$F$72:$F$78')},MIN(C{r},6)+1))"
        s[f"J{r}"] = f'=IF(AND(C{r}>0,{S("$C$16")}="Mensual fijo"),{S("$C$14")}/{S("$C$7")},0)'
        for col in "BCDEFGHIJ":
            c = s[f"{col}{r}"]; c.border = BOX; c.font = BLK; c.number_format = USD if col in "HIJ" else '0'
    ME = MT + 2 + len(meses) - 1
    s[f"B{ME+1}"] = "Total"; s[f"B{ME+1}"].font = B
    for col in "CDEFGHIJ":
        c = s[f"{col}{ME+1}"]; c.value = f"=SUM({col}{MT+2}:{col}{ME})"; c.font = B; c.fill = F_TOT; c.border = BOX
        c.number_format = USD if col in "HIJ" else '0'
    # Resumen arriba (filas 4-5): tabla compacta a la derecha
    labels = ["Modelo", "Work Order", "PS normal", "LS sin desc.", "LS con desc.", "Ecotransur"]
    for i, t in enumerate(labels):
        c = s.cell(3 + i, 23, t); c.font = B if i == 0 else BLK; c.border = BOX
        if i == 0: c.fill = F_H2
    s.column_dimensions["W"].width = 16
    for j, t in enumerate(["Costo con horas Excel (USD)", "Ahorro con horas Excel (USD)", "Costo con horas reales (USD)", "Ahorro con horas reales (USD)"]):
        c = s.cell(3, 24 + j, t); c.font = B; c.fill = F_H2; c.border = BOX; c.alignment = Alignment(wrap_text=True)
        s.column_dimensions[CL(24 + j)].width = 16
    s.row_dimensions[3].height = 30
    fijo = {"PS": f"$H${ME+1}", "EC": f"$I${ME+1}"}; tm = f"$J${ME+1}"
    mapA = {5: ("M", "PS"), 6: ("N", "PS"), 7: ("O", "PS"), 8: ("P", "EC")}; mapB = {5: "Q", 6: "R", 7: "S", 8: "T"}
    s["X4"] = f"=L{T0}"; s["Z4"] = f"=L{T0}"
    for r, (ca, fo) in mapA.items():
        s[f"X{r}"] = f"={ca}{T0}+{fijo[fo]}+{tm}"; s[f"Y{r}"] = f"=$X$4-X{r}"
        s[f"Z{r}"] = f"={mapB[r]}{T0}+{fijo[fo]}+{tm}"; s[f"AA{r}"] = f"=$Z$4-Z{r}"
    for r in range(4, 9):
        for col in ["X", "Y", "Z", "AA"]:
            c = s[f"{col}{r}"]; c.number_format = USD; c.border = BOX; c.font = BLK
    s["W9"] = "Movilizaciones"; s["X9"] = f"=COUNT(B{R0}:B{R1})"; s["W10"] = "Meses con movilizaciones"; s["X10"] = f'=COUNTIF(C{MT+2}:C{ME},">0")'
    s["W11"] = "Promedio movs/mes (meses activos)"; s["X11"] = f"=X9/X10"; s["X11"].number_format = '0.00'
    s["W12"] = "Meses con 6 o más movilizaciones"; s["X12"] = f'=COUNTIF(C{MT+2}:C{ME},">=6")'
    s["W13"] = "Meses con menos de 5 movilizaciones"; s["X13"] = f'=COUNTIF(C{MT+2}:C{ME},"<5")'
    for rr in range(9, 14):
        s[f"W{rr}"].font = BLK; s[f"X{rr}"].font = BLK
    s.freeze_panes = "B8"
    return {"R0": R0, "R1": R1, "T0": T0, "MT": MT, "ME": ME, "n": n}

info24 = hoja_real(2024, os.path.join(INS, "Movilizaciones_2024.xlsx"))
info25 = hoja_real(2025, os.path.join(INS, "Movilizaciones_2025.xlsx"))
wb.save(OUT)
print("ok", info24, info25)
