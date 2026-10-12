"""Agrega al simulador las hojas: Método, Reconciliación, Medido y supuesto, Sensibilidad, Pendientes."""
import sys, json
from openpyxl import load_workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as CL

PATH, SENS = sys.argv[1], sys.argv[2]
S = json.load(open(SENS))
wb = load_workbook(PATH)
F = "Arial"
B = Font(name=F, size=10, bold=True); N = Font(name=F, size=10); NOTE = Font(name=F, size=9, italic=True, color="595959")
TITLE = Font(name=F, size=14, bold=True, color="1F3864"); H1 = Font(name=F, size=11, bold=True, color="FFFFFF")
GRN = Font(name=F, size=10, color="008000"); BLUE = Font(name=F, size=10, color="0000FF")
F_H1 = PatternFill("solid", fgColor="1F3864"); F_H2 = PatternFill("solid", fgColor="D9E1F2"); F_Y = PatternFill("solid", fgColor="FFFF00")
thin = Side(style="thin", color="BFBFBF"); BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
USD = '$#,##0;($#,##0);"-"'; USD2 = '$#,##0.00;($#,##0.00);"-"'
WR = Alignment(wrap_text=True, vertical="top")


def sheet(name, widths, title, sub=None):
    s = wb.create_sheet(name); s.sheet_view.showGridLines = False
    for i, w in enumerate(widths): s.column_dimensions[CL(i + 1)].width = w
    s["B1"] = title; s["B1"].font = TITLE
    if sub: s["B2"] = sub; s["B2"].font = NOTE
    return s


def table(s, r0, headers, rows, fmts=None, height=None):
    for i, h in enumerate(headers):
        c = s.cell(r0, 2 + i, h); c.font = B; c.fill = F_H2; c.border = BOX; c.alignment = WR
    for j, row in enumerate(rows):
        for i, v in enumerate(row):
            c = s.cell(r0 + 1 + j, 2 + i, v); c.border = BOX; c.alignment = WR
            c.font = GRN if isinstance(v, str) and v.startswith("=Simulador") else N
            if fmts and fmts[i]: c.number_format = fmts[i]
        if height: s.row_dimensions[r0 + 1 + j].height = height
    return r0 + 1 + len(rows)


def h1(s, r, text, last):
    s.merge_cells(f"B{r}:{last}{r}"); c = s[f"B{r}"]; c.value = text; c.font = H1; c.fill = F_H1


# ================= MÉTODO =================
m = sheet("Método", [2, 34, 22, 22, 30, 60], "Método: cómo está armado el costo de cada modelo y qué se cancela",
          "Se lee antes del simulador. Los umbrales son el estudio; el promedio no.")
h1(m, 4, "1. CLASIFICACIÓN DE CADA RENGLÓN DE COSTO", "F")
rows = [
    ("Tarifa por movilización (Work Order)", "Work Order", "Variable por movilización; escalón por rango", "Límites de rango 0,2 / 5 / 10 km", "No es monótona: 5–10 km (95.374) cuesta menos que 0,1–5 km (98.663)."),
    ("Tarifa con tope", "Work Order", "Acotada arriba y abajo", "Tope superior = tarifa del Excel (movilización rápida); si tarda más, tarifa fija menor", "El WO nunca paga más que la tarifa del Excel, tarde lo que tarde. Comparar contra el tope es el escenario más caro del WO, es decir, el más favorable al tercerizado."),
    ("Recargo de señalizadoras faltantes", "Work Order", "Variable; escalón 1 o 2 turnos", "12 h = 1 turno; más de 12 h = 2 turnos", "4 personas por turno × 375.000 COP (Cot. 1255 p. 5)."),
    ("Tarifa del transportador", "Tercerizado", "Variable; escalón por rango", "0,2 / 5 / 10 / 20 km", "Petro Star no cotiza más de 20 km: acantilado de cobertura."),
    ("Descuento desde la 6ª del mes", "Tercerizado", "Acantilado por número de movilización del mes", "6ª movilización del mes", "Petro Star: 50 % de la tarifa. Ecotransur: solo equipos. Lump Sum: sin descuento (evaluación principal)."),
    ("Cargo fijo mensual (nómina + disponibilidad)", "Tercerizado", "Escalón decreciente; fijo mensual", "Petro Star 0–5 movs; Ecotransur 0–4 movs", "Petro Star todavía cobra con 5 movs (p. 4); Ecotransur no cobra desde la 5ª."),
    ("Taladro durante la movilización", "Tercerizado", "Variable por hora", "Horas por rango (12/18/24/28)", "34.944 USD/día. Bajo el WO no se paga (premisa SierraCol)."),
    ("Mes bloqueado (no se puede mover)", "Tercerizado", "Fijo mensual", "Mes con 0 movilizaciones y contrato vigente", "Petro Star 176.968 · Ecotransur 242.534 USD por mes (cargo de 0 movilizaciones + Truck Manager). Con el WO, 0."),
    ("Truck Manager", "Tercerizado", "Fijo mensual (así se modela)", "60 M COP por cada mes de campaña", "El Excel lo prorratea a 6 movs/mes (2.702,70 USD); con menos de 6 movs/mes ese prorrateo lo subestima. Por encima lo sobreestima."),
    ("Horas excedidas sobre el tiempo estipulado", "Tercerizado", "Acantilado", "Tiempo total 12/24/36/36 h", "Se paga el taladro por hora (1.456 USD) y además equipos y señalizadores por hora (~1.357 USD; Cot. 1255 p. 5). Con el WO, 0."),
    ("Bandas de horas por ítem (Opción A/B)", "Tercerizado (Ecotransur)", "Acantilado", "8–12 / ≤14 / 14–18 / 18–24 / ≤22 h", "El formato del Ítem 1 no viene adjunto: el Excel usa ítems 'más de X horas'."),
    ("Personal, turnos o equipos fuera del mínimo", "Ambos", "Variable", "Lo que exceda el equipo mínimo", "Premisa: se cancela entre modelos (adicionales 0 %). Ver Pendientes."),
]
r = table(m, 5, ["Renglón", "Modelo", "Tipo", "Umbral", "Nota"], rows, height=42)
h1(m, r + 1, "2. ¿QUÉ VARIABLE AFECTA A LOS DOS MODELOS Y QUÉ SE CANCELA?", "F")
rows = [
    ("Número de pozos de la campaña", "Ambos", "No", "El WO crece lineal; el tercerizado tiene umbrales mensuales. Entra completo al diferencial."),
    ("Frecuencia mensual de movilizaciones", "Solo tercerizado", "No", "El WO cobra por movilización, no por mes. Es la variable que define la frontera."),
    ("Rango de distancia", "Ambos, distinto", "No", "Las tarifas no se mueven igual: pasar de 0,1–5 a 5–10 km abarata el WO y encarece el tercerizado."),
    ("Adicionales / imprevistos", "Ambos", "Sí (premisa)", "Se pone 0 % en ambos. Si no se cancelan, el residuo cae sobre el tercerizado (ver Sensibilidad)."),
    ("Taladro parado por NPT de perforación", "Ambos", "Sí", "La tarifa del taladro durante la perforación la rige su contrato en los dos modelos."),
    ("Demoras dentro de la movilización", "Solo tercerizado", "No", "El WO es suma cerrada. En el tercerizado se paga el taladro por hora y, con Petro Star, equipos y nómina (cláusula 7)."),
    ("TRM", "Solo tercerizado", "No", "Las ofertas están en COP; el WO en USD. TRM alta favorece al tercerizado."),
    ("Tarifa del taladro", "Solo tercerizado", "No", "Bajo el WO no se pagan horas de taladro."),
    ("Señalizadoras", "Solo WO (recargo)", "No", "Las ofertas ya incluyen 20; el WO tiene 12."),
    ("Truck Manager", "Solo tercerizado", "No", "Premisa SierraCol."),
]
r = table(m, r + 2, ["Variable", "¿A quién afecta?", "¿Se cancela?", "Por qué"], rows, height=30)
h1(m, r + 1, "3. NPT: POR QUÉ CANAL AFECTA A CADA MODELO", "F")
txt = [
    "NPT de perforación (pozo): el taladro está parado o perforando más días. Su tarifa diaria se paga igual en los dos modelos, así que ese costo se cancela. Lo que NO se cancela es el efecto sobre la frecuencia: menos movilizaciones por mes. Al WO no le pasa nada (paga por movilización). Al tercerizado le cambia la factura: si el mes cae por debajo de 5 (Ecotransur) o de 6 (Petro Star), aparece el cargo fijo y se pierde el descuento. Canal: frecuencia, no horas.",
    "NPT de movilización (demora en el traslado): en el WO lo absorbe el contratista del taladro (suma global cerrada). En el tercerizado carga horas de taladro (1.456 USD/h) y, con Petro Star, si la demora no es atribuible al transportador, también equipos y nómina (Cot. 1255 p. 5, cláusula 7; a tarifas horarias de la p. 5 la flota mínima más 20 señalizadores suma unos 1.357 USD/h). Ecotransur no trae esa cláusula, pero factura aparte turnos extra. Canal: horas, residuo completo sobre el tercerizado.",
    "Lo único medido en los archivos es el sobretiempo de movilización de los logs (hojas Real 2024 / Real 2025): misma localización excede las 12 h del Excel en 10 de 23 movs (2024) y 10 de 11 (2025); 0,1–5 km excede las 18 h en 11 de 28 y 10 de 17; 5–10 km y más de 10 km en 2024 quedaron por debajo de lo supuesto. No hay NPT de perforación ni plan de pozos: se deja editable en 0 % (Simulador C23) y se muestra su sensibilidad.",
]
for i, t in enumerate(txt):
    rr = r + 2 + i; m.merge_cells(f"B{rr}:F{rr}"); c = m[f"B{rr}"]; c.value = t; c.font = N; c.alignment = WR; m.row_dimensions[rr].height = 66
r = r + 2 + len(txt)
h1(m, r + 1, "4. VERIFICACIONES OBLIGATORIAS", "F")
rows = [
    ("Recalcular fórmulas heredadas", "Hecho", "Las filas amarillas 'Costo Suma Global' (31, 57, 83, 109) se reproducen al centavo (hoja Reconciliación). El recargo de señalizadoras da 405,41 / 810,81 USD. El total WO de la campaña es 3.130.187 USD (= M18); la nota J55 cita 3.107.890."),
    ("Monotonía de tarifas con la distancia", "Hallazgo", "Petro Star, Lump Sum y Ecotransur crecen con la distancia. El WO no: 5–10 km < 0,1–5 km. Si los 20 pozos fueran de 5–10 km, el ahorro de Petro Star cae unos 324.000 USD y el de Ecotransur unos 430.000 USD."),
    ("Cobertura de más de 20 km", "Brecha", "Petro Star cotiza 10–20 km. El log 2024 tiene 1 movimiento de 22,1 km (pozo 5681); 2025 ninguno (máx. 14,6 km). Se valoró con la tarifa de 10–20 km y queda marcado."),
    ("Horas de Petro Star vs Excel", "Diferencia", "Cotización: 12 / 24 / 36 / 36 h. Excel: 12 / 18 / 24 / 28 h. Por movilización: 0 / 8.736 / 17.472 / 11.648 USD de taladro. En la campaña base (20 pozos en 0,1–5 km): 174.720 USD. Editable en Simulador fila 39."),
    ("IVA del Lump Sum", "Fuera de alcance", "Por instrucción de SierraCol se trabaja sin IVA. Si el IVA del 50 % de alquiler no fuera descontable, el Lump Sum costaría unos 225.000 USD más en la campaña base."),
    ("Celdas sueltas F155 y F156", "No usadas", "Valores 8 y 15 sin rótulo, dentro del bloque 5.6. No entran en ningún cálculo de este simulador."),
]
table(m, r + 2, ["Verificación", "Resultado", "Detalle"], rows, height=54)

# ================= RECONCILIACIÓN =================
rc = sheet("Reconciliación", [2, 46, 16, 16, 12, 52, 20], "Reconciliación: de dónde sale cada parámetro",
           "Valor en simulador = enlace vivo (verde). Valor en fuente = copiado del archivo original. Control = OK si coinciden; el control solo es válido con los valores por defecto del simulador.")
rows = []
def add(lab, ref, val, src, cls, fmt=None):
    rows.append((lab, f"=Simulador!{ref}", val, f'=IF(ABS(C{5+len(rows)}-D{5+len(rows)})<0.005,"OK","DIFERENCIA")', src, cls))
add("TRM (COP/USD)", "C7", 3700, "Tarifas.xlsx · E3", "Medido")
add("Taladro (USD/día)", "C8", 34944, "Tarifas.xlsx · E5", "Medido")
add("Taladro (USD/h)", "C9", 1456, "Tarifas.xlsx · E6", "Medido")
add("Adicionales base (%)", "C11", 0, "Tarifas.xlsx · E7", "Premisa")
add("Adicionales Lump Sum (%)", "C12", 0, "Tarifas.xlsx · E8", "Premisa")
add("Truck Manager prorrateado a 6 movs (USD) = 60 M COP / TRM / 6", "C14/Simulador!C7/Simulador!C15", 2702.7027027027, "Tarifas.xlsx · C29", "Medido")
for g, (col, rr) in enumerate(zip("CDEF", [26, 52, 78, 104])):
    add(f"Horas rango {g+1}", f"{col}39", [12, 18, 24, 28][g], f"Tarifas.xlsx · C{rr}", "Dato Excel")
for g, col in enumerate("CDEF"):
    add(f"WO base rango {g+1} (USD)", f"{col}43", [75642, 98663, 95374, 110174][g], f"Tarifas.xlsx · K{4+g} (dato SierraCol)", "Premisa")
for g, (col, rr) in enumerate(zip("CDEF", [25, 51, 77, 103])):
    add(f"Petro Star normal rango {g+1} (COP)", f"{col}44", [140385441, 220853084, 238462998, 246462998][g], f"Tarifas.xlsx · E{rr}", "Medido")
    add(f"Lump Sum rango {g+1} (COP)", f"{col}45", [178363885, 304284690, 373649874, 414800928][g], f"Tarifas.xlsx · F{rr} (≠ Cot. 1255 p.1–2)", "Medido")
    add(f"Ecotransur rango {g+1} (COP)", f"{col}46", [140233002, 207703002, 249003002, 253060002][g], f"Tarifas.xlsx · G{rr}", "Medido")
add("Señalizador turno 12 h (COP)", "C21", 375000, "Cot. 1255 p. 5", "Medido")
add("Recargo señalizadoras misma loc. (USD)", "C50", 405.405405405405, "Tarifas.xlsx · K11 (verificado)", "Cálculo")
add("Recargo señalizadoras otros rangos (USD)", "D50", 810.810810810811, "Tarifas.xlsx · L11 (verificado)", "Cálculo")
yel = {"PS": ([58116.71378378378, 88600.7254054054, 102096.16162162162, 110082.3237837838], 62, "E"),
       "LS": ([68381.15810810811, 111149.80810810812, 138633.15513513514, 155579.06162162163], 64, "F"),
       "EC": ([58075.51405405405, 85046.6491891892, 104944.81135135135, 111865.29783783785], 66, "G")}
for o, (vals, row, xc) in yel.items():
    for g, col in enumerate("CDEF"):
        add(f"Costo Suma Global {o} rango {g+1} (USD)", f"{col}{row}+IF(Simulador!$C$16=\"Mensual fijo\",Simulador!$C$14/Simulador!$C$7/Simulador!$C$15,0)", vals[g], f"Tarifas.xlsx · {xc}{[31,57,83,109][g]} (fila amarilla; se suma el TM prorrateado si es mensual)", "Control")
add("WO de la campaña 15+20 (USD)", "C83", 3130187.2972973, "Tarifas.xlsx · M18 (la nota J55 dice 3.107.890)", "Control")
for i, v in enumerate([430000000, 164780000, 327959522, 166920000]):
    pass
r = table(rc, 4, ["Parámetro", "Valor en simulador", "Valor en fuente", "Control", "Fuente (archivo · celda o página)", "Clase"], rows, [None, USD2, USD2, None, None, None])
rc.cell(r + 1, 2, "Cargos fijos mensuales: Simulador C72:D78 transcritos de Cot. 1255 p. 4 (nómina + disponibilidad) y Ecotransur p. 2–3 (nómina + stand-by). Equipos Ecotransur 6ª+: p. 3–4. Perfiles de frecuencia: logs C11:C21 (2024) y C11:C19 (2025).").font = NOTE

# ================= MEDIDO Y SUPUESTO =================
ms = sheet("Medido y supuesto", [2, 50, 30, 60], "Lo medido y lo supuesto, separados",
           "Ningún supuesto tiene la autoridad de un dato medido. Los supuestos están en amarillo en el simulador.")
med = [("Bloqueos durante movilización 2025: 22,25 h social/escolar en fase 01MIRU (4 movs con paro, 3 con restricción escolar)", "Evaluacion_Drilling_IM_Jul_2026_v5.xlsx · NPT Social 2025 (OpenWells)", "Los bloqueos largos (17–72 h) cayeron en perforación: ambos modelos pagan igual."),
       ("Tarifas de las tres ofertas por rango", "Tarifas.xlsx E/F/G", "Precios tal cual SCM los pasó (F no coincide con la Cot. 1255)."),
       ("TRM y tarifa del taladro", "Tarifas.xlsx E3, E5", ""),
       ("Cargo fijo mensual por número de movilizaciones", "Cot. 1255 p. 4 · Ecotransur p. 2–3", ""),
       ("Descuento desde la 6ª (Petro Star 50 %; Ecotransur solo equipos)", "Cot. 1255 p. 2 · Ecotransur p. 3–4", ""),
       ("Tarifa del señalizador (375.000 COP/turno)", "Cot. 1255 p. 5", ""),
       ("Frecuencia mensual 2024 y 2025", "Logs, tabla por mes", "Dos observaciones independientes; no se promedian."),
       ("Mezcla por rango 2024 (23/29/14/4) y 2025 (11/17/10/7)", "Logs, resumen por rango", ""),
       ("Horas reales por movilización", "Logs, columna Tiempo mov hr", "Pozo 5136 sin horas."),
       ("Horas totales declaradas por Petro Star (12/24/36/36)", "Cot. 1255 p. 1–2", "Referencia; el simulador usa las del Excel."),
       ("Cláusula de demoras no atribuibles (Petro Star)", "Cot. 1255 p. 5, condición 7", "Ecotransur no la trae.")]
sup = [("Work Order base y 12 señalizadoras", "Premisa SierraCol", "No está en los archivos."),
       ("Adicionales 0 % en ambos modelos", "Premisa SierraCol", "Sensibilidad: +5 % solo en tercerizado."),
       ("Truck Manager mensual: 60 M COP por mes de campaña", "Premisa SierraCol (evaluación v5)", "El Excel lo prorratea a 6 movs/mes; se deja como sensibilidad."),
       ("Campaña 15 misma loc. + 20 otra loc.", "Premisa SierraCol", "No sale de los logs."),
       ("Rango de los 20 pozos: 0,1–5 km", "Premisa SierraCol", "Confirmado por SierraCol."),
       ("Frecuencia esperada 5–6 movs/mes", "Premisa SierraCol", "Sensibilidad de 4 a 8 movs/mes."),
       ("TRM 3.700", "Premisa SierraCol", "Fija para el ejercicio."),
       ("Tiempo estipulado de Ecotransur = el de Petro Star (12/24/36/36 h) y mismas tarifas por hora", "Supuesto", "Su carta no declara tiempos ni tarifas horarias."),
       ("WO a su tarifa tope en todas las movilizaciones", "Premisa SierraCol", "Es el WO más caro posible: favorece al tercerizado. Si alguna tarda más, el WO paga menos."),
       ("Meses bloqueados = 0", "Riesgo operativo", "Cada mes bloqueado paga el cargo fijo de 0 movilizaciones."),
       ("Bloqueo social/escolar en movilización: 17,3 h por campaña, pagadas con taladro + equipos (condición 7); el WO no paga", "Medido (OpenWells 2025) escalado", "22,25 h en 45 movs de 2025 → 35/45. Si el contrato WO cobrara stand-by por bloqueos, el efecto se cancela en parte."),
       ("Lump Sum sin descuento (principal)", "Premisa SierraCol", "Con descuento: solo referencia."),
       ("Ecotransur 6ª+ en misma loc. = equipos 0–5 km", "Supuesto", "El PDF no trae valor."),
       ("Orden de los pozos dentro del mes: intercalado", "Supuesto", "Sensibilidad: misma loc. primero / otra primero."),
       ("Horas pagadas al taladro = horas del Excel", "Dato del Excel", "Los logs muestran más horas en misma loc. y 0,1–5 km (2025)."),
       ("NPT de perforación 0 %", "Supuesto (sin dato)", "Barrido 0–20 % en Sensibilidad."),
       ("Fin de campaña = fin del contrato (no se cobra)", "Premisa SierraCol", "Solo los bloqueos con contrato vigente pagan cargo fijo."),
       ("Más de 20 km se paga con la tarifa de 10–20 km", "Supuesto", "1 movimiento en 2024."),
       ("IVA fuera del análisis", "Premisa SierraCol", "")]
r = table(ms, 4, ["MEDIDO", "Fuente", "Nota"], med, height=28)
table(ms, r + 2, ["SUPUESTO O PREMISA", "Origen", "Nota"], sup, height=28)

# ================= SENSIBILIDAD =================
se = sheet("Sensibilidad", [2, 46, 18, 22, 26, 16, 26, 16, 16, 16], "Sensibilidad: de qué depende que haya o no ahorro",
           "Ahorro = costo WO − costo tercerizado (USD); positivo = el tercerizado cuesta menos. Campaña 15 misma loc. + 20 en 0,1–5 km, TRM 3.700, 17,3 h de bloqueo social en movilización (OpenWells 2025). Valores calculados con tools/sensibilidad.py (mismo motor que el simulador); no se recalculan al editar.")
h1(se, 4, "1. FRECUENCIA: AHORRO DE LA CAMPAÑA SEGÚN MOVILIZACIONES POR MES (esperado 5–6)", "I")
FQ = [[("%g" % x[0]).replace(".", ",")] + x[1:] for x in S["frecuencias"]]
r = table(se, 5, ["Movs/mes", "PS normal · horas Excel", "Lump Sum · horas Excel", "Ecotransur · horas Excel", "PS normal · horas cotizadas", "Lump Sum · horas cotizadas", "Ecotransur · horas cotizadas"], FQ,
          [None, USD, USD, USD, USD, USD, USD], height=18)
se.cell(r, 2, "Horas cotizadas = 12/24/36/36 h (Cot. 1255). Con frecuencias no enteras se alternan meses (p. ej. 5,5 = meses de 6 y de 5). El último mes de la campaña puede quedar corto y pagar cargo fijo: por eso la curva tiene dientes.").font = NOTE
r += 2
h1(se, r, "2. PUNTOS DE QUIEBRE: CUÁNTO AGUANTA EL AHORRO ANTES DE DESAPARECER", "J"); r += 1
QB = [[q[0], q[1], q[2], q[3], q[4], q[5], q[6], q[7], q[8], q[9]] for q in S["quiebres"]]
r = table(se, r, ["Movs/mes", "Oferta", "Ahorro campaña (USD)", "Ahorro por pozo (USD)", "% del costo de un pozo (600 k)", "Horas extra de taladro por movilización que lo anulan",
                  "Horas sobre el tiempo estipulado que lo anulan (taladro + equipos)", "Días de taladro de demora en toda la campaña que lo anulan", "Meses bloqueados que lo anulan", "Horas de bloqueo en movilización que lo anulan (campaña)"], QB,
          ['0', None, USD, USD, '0.0%', '0.0', '0.0', '0.0', '0.0', '0'], height=30)
se.cell(r, 2, f"Hora excedida en el tercerizado: taladro 1.456 + equipos y señalizadores {S['hora_exceso_usd']['transportador']:,.0f} = {S['hora_exceso_usd']['total']:,.0f} USD/h (Cot. 1255 p. 5). En el Work Order cuesta 0. Un mes bloqueado: Petro Star {S['mes_bloqueado_usd']['PS']:,.0f} · Ecotransur {S['mes_bloqueado_usd']['EC']:,.0f} USD.".replace(",", ".")).font = NOTE
r += 2
h1(se, r, "3. LO QUE PASÓ CON LAS HORAS REALES (logs): campañas 2024 y 2025 repetidas con cada modelo", "J"); r += 1
RE = []
for y in ("2024", "2025"):
    v = S["reales"][y]
    for o, nm in (("PS", "Petro Star normal"), ("EC", "Ecotransur"), ("LS", "Lump Sum")):
        RE.append([y, nm, v["excel"][o], v["reales_sin_equipos"][o], v["reales_con_equipos"][o], v["movs_exceden"], v["horas_excedidas"], v["equipos_usd"], v["taladro_usd"]])
r = table(se, r, ["Año", "Oferta", "Ahorro con horas Excel", "Ahorro con horas reales (solo taladro)", "Ahorro con horas reales + equipos por hora excedida",
                  "Movilizaciones que exceden el tiempo estipulado", "Horas excedidas", "Equipos y señalizadores (USD)", "Taladro en esas horas (USD)"], RE,
          [None, None, USD, USD, USD, '0', '0.0', USD, USD], height=30)
se.cell(r, 2, "Horas reales: el taladro se paga por las horas reales (más o menos que el Excel). Las horas por encima de 12/24/36/36 h se cobran además en equipos y señalizadores (Cot. 1255 p. 5; Ecotransur con las mismas tarifas, supuesto).").font = NOTE
r += 2
names = {"PS": "Petro Star tarifa normal", "LS": "Petro Star Lump Sum (sin descuento)", "EC": "Ecotransur"}
for fq in ("5", "6"):
    for o in ("PS", "LS", "EC"):
        rows_o = sorted([x for x in S[fq]["rows"] if x["oferta"] == o and x["efecto_usd"] > 0.5], key=lambda x: -x["efecto_usd"])
        h1(se, r, f"4. TORNADO · {names[o]} · {fq} movs/mes · ahorro base {S[fq]['base'][o]:,.0f} USD".replace(",", "."), "I")
        data = [(x["variable"], x["clase"], x["base"], x["favorable_txt"], x["favorable_usd"], x["desfavorable_txt"], x["desfavorable_usd"], x["efecto_usd"]) for x in rows_o]
        r = table(se, r + 1, ["Variable", "Clase", "Valor base", "Extremo que mejora", "Ahorro (USD)", "Extremo que empeora", "Ahorro (USD)", "Efecto (USD)"], data,
                  [None, None, None, None, USD, None, USD, USD], height=28) + 1

# ================= PENDIENTES =================
pe = sheet("Pendientes", [2, 50, 24, 28, 18, 16, 16, 34], "Pendientes por confirmar: valor de trabajo y lo que está en juego",
           "En juego = cambio del ahorro del tercerizado (USD) si el valor de trabajo cambia por la alternativa. Negativo = el tercerizado pierde ventaja. Campaña 15 + 20 en 0,1–5 km; columnas con 5 y 6 movs/mes. Valores fijos de tools/sensibilidad.py.")
P = {str(int(x["frec"])): x for x in S["pendientes"]}
def st(k, o): return (P["5"][k][o], P["6"][k][o])
rows = []
def addp(item, trabajo, alt, k, o, quien, ofname):
    a, b = st(k, o); rows.append((item, trabajo, alt, ofname, a, b, quien))
rows.append(("Tarifa WO cuando la movilización tarda más (tarifa fija menor que el tope)", "Tope del Excel en todas", "Tarifa fija menor en las lentas", "Todas (favorece al WO)",
             -P["5"]["bono5"]["PS"], -P["6"]["bono5"]["PS"], "SierraCol (contrato WO). Valor mostrado: −5 % al WO"))
addp("Horas que se pagan al taladro", "Excel 12/18/24/28", "Petro Star 12/24/36/36", "horas_ps", "PS", "SierraCol / Petro Star", "Todas (igual)")
rows.append(("Mes bloqueado (no se puede mover; contrato vigente)", "0 meses", "1 mes", "Petro Star (ambas)", P["5"]["bloqueo"]["PS"], P["6"]["bloqueo"]["PS"], "Operaciones / contrato (¿cláusula de suspensión?)"))
rows.append(("Mes bloqueado (no se puede mover; contrato vigente)", "0 meses", "1 mes", "Ecotransur", P["5"]["bloqueo"]["EC"], P["6"]["bloqueo"]["EC"], "Operaciones / contrato"))
rows.append(("Hora por encima del tiempo estipulado (por hora y movilización)", "Sin exceso", "1 hora", "Todas", -S["hora_exceso_usd"]["total"], -S["hora_exceso_usd"]["total"], "Cot. 1255 p. 5 y condición 7 · Ecotransur: mismas tarifas (supuesto)"))
rows.append(("Tiempo perdido en perforación (NPT) que baja la frecuencia", "0 %", "20 %", "Petro Star normal", P["5"]["npt20"]["PS"], P["6"]["npt20"]["PS"], "SierraCol (plan de pozos)"))
rows.append(("Tiempo perdido en perforación (NPT) que baja la frecuencia", "0 %", "20 %", "Ecotransur", P["5"]["npt20"]["EC"], P["6"]["npt20"]["EC"], "SierraCol (plan de pozos)"))
addp("Lump Sum: valores del Excel vs Cot. 1255", "Excel (F)", "Cot. 1255 p. 1–2", "LS_pdf", "LS", "Compras (SCM)", "Lump Sum")
addp("Lump Sum con descuento desde la 6ª (solo referencia)", "Sin descuento", "50 % desde la 6ª", "LS_desc", "LS", "Petro Star", "Lump Sum")
addp("Petro Star: ¿cobra cargo fijo con 5 movs?", "Sí (tabla p. 4)", "No (mínimo 5 cumplido)", "fijo5", "PS", "Petro Star", "Petro Star (ambas)")
addp("Ecotransur 6ª+ en misma localización", "Equipos 0–5 km", "Tarifa plena", "ec_misma", "EC", "Ecotransur", "Ecotransur")
rows.append(("Ecotransur 6ª+: ¿cobra además el personal operativo usado (señaleras, supervisión)?", "No (solo equipos)", "Sí", "Ecotransur", None, None, "Ecotransur (carta p. 4)"))
addp("Truck Manager", "60 M COP por mes", "2.702,70 USD por movilización (Excel C29)", "tm_pormov", "PS", "SierraCol", "Todas (igual)")
addp("Adicionales: ¿se cancelan?", "0 % ambos", "+5 % solo tercerizado", "adic5", "PS", "SierraCol", "Petro Star normal")
addp("Recargo de señalizadoras al WO", "Se carga (8 personas-turno)", "No se carga", "senal_no", "PS", "SierraCol (contrato WO)", "Todas (igual)")
rows.append(("Movilizaciones de más de 20 km", "Tarifa 10–20 km", "Sin tarifa", "Petro Star", None, None, "Petro Star (cotizar)"))
rows.append(("Formato Ítem 1 y 2 de Ecotransur (bandas de horas A/B, tiempos estipulados)", "Ítems 1.3/1.9/1.15/1.21 del Excel", "Ítem según horas reales", "Ecotransur", None, None, "Ecotransur (enviar formato)"))
rows.append(("Riesgos no cuantificados: coordinación taladro–transportador, HSE y daños (pólizas), disponibilidad, salida del contrato, pago en COP", "Sin valorar", "—", "Todas", None, None, "Contratos / HSE"))
table(pe, 4, ["Pendiente", "Valor de trabajo", "Alternativa", "Oferta afectada", "En juego con 5 movs/mes (USD)", "En juego con 6 movs/mes (USD)", "Quién confirma"], rows,
      [None, None, None, None, USD, USD, None], height=32)

# ================= VERIFICACIÓN EXCEL =================
ve = sheet("Verificación Excel", [2, 30, 14, 34, 16, 16, 16, 16, 16, 14, 40], "Verificación línea por línea de Tarifas.xlsx (Zona 1 y tarifas WO)",
           "Cada línea se recalculó desde sus componentes. 'Suma global' = tarifa + taladro + Truck Manager + adicionales. Control = OK si la suma reproduce la celda amarilla.")
VR = []
TAR = {"E": [140385441, 220853084, 238462998, 246462998], "F": [178363885, 304284690, 373649874, 414800928], "G": [140233002, 207703002, 249003002, 253060002]}
YEL = {"E": [58116.71378378378, 88600.7254054054, 102096.16162162162, 110082.3237837838], "F": [68381.15810810811, 111149.80810810812, 138633.15513513514, 155579.06162162163],
       "G": [58075.51405405405, 85046.6491891892, 104944.81135135135, 111865.29783783785]}
NOM = {"E": "Petro Star normal", "F": "Petro Star Lump Sum", "G": "Ecotransur"}
ROWS = [25, 51, 77, 103]; HRS = [12, 18, 24, 28]; RG = ["Misma loc. (<0,2 km)", "0,1–5 km", "5–10 km", "Más de 10 km"]
WOB = [75642, 98663, 95374, 110174]; SEN = [405.4054054054054, 810.8108108108108, 810.8108108108108, 810.8108108108108]
for g in range(4):
    for c in "EFG":
        tar = TAR[c][g] / 3700; rig = HRS[g] * 1456; tm = 60000000 / 3700 / 6; tot = tar + rig + tm
        VR.append((RG[g], NOM[c], f"{c}{ROWS[g]} = {TAR[c][g]:,} COP / E3".replace(",", "."), tar, rig, tm, tot, WOB[g] + SEN[g], "OK" if abs(tot - YEL[c][g]) < 0.01 else "DIFERENCIA",
                   "Sin descuento en el Excel (Zona 1 es tarifa plena)" + ("" if c != "F" else "; ≠ Cot. 1255 (ver Pendientes)")))
table(ve, 4, ["Rango", "Oferta", "Celda de tarifa", "Tarifa (USD)", "Taladro (USD)", "Truck Manager (USD)", "Suma global (USD)", "WO + señalizadoras (USD)", "Control", "Nota"], VR,
      [None, None, None, USD2, USD, USD2, USD2, USD2, None, None], height=30)
r = 6 + len(VR)
h1(ve, r, "SEÑALIZADORAS Y DESCUENTOS: DÓNDE SE APLICAN", "K")
NOTAS = [
    ("Señalizadoras", "Ofertas: 20 incluidas (10 por turno). WO: 12 (6 por turno). Faltan 4 por turno = 8 personas en plantilla. Recargo al WO: 4 × 375.000 COP × 1 turno = 405,41 USD (misma loc., 12 h) y × 2 turnos = 810,81 USD (demás rangos). Tarifas.xlsx K8:L11 y Simulador fila 50. No se cobran del lado tercerizado. Observación: el rango de más de 10 km dura 28 h (> 24 h): estrictamente serían 3 turnos (+405 USD por movilización)."),
    ("Descuento Petro Star normal", "50 % de la tarifa desde la 6ª movilización del mes (Cot. 1255 p. 2). Solo sobre la tarifa del transportador; el taladro y el Truck Manager se pagan completos. Simulador fila 56/63."),
    ("Lump Sum", "Evaluación principal sin descuento (SierraCol). La columna 'con descuento' es solo referencia."),
    ("Ecotransur", "Desde la 5ª no cobra cargo fijo; desde la 6ª cobra solo equipos (123,18 / 139,005 / 167,055 M COP). Simulador filas 60/67."),
    ("Cargo fijo mensual", "Petro Star: tabla p. 4 de 0 a 5 movilizaciones (con 5 todavía cobra). Ecotransur: 80/60/40/20 % de 1 a 4. Simulador filas 72–78."),
    ("Horas excedidas", "Si una movilización supera el tiempo estipulado (12/24/36/36 h), se paga el taladro por esas horas y además equipos de la flota mínima y señalizadores por hora (Cot. 1255 p. 5). Simulador filas 41, 68, 69 y panel 1b."),
    ("Tope del Work Order", "Confirmado por SierraCol: las tarifas WO del Excel son el tope (lo máximo que se paga, con movilización rápida). Si la movilización tarda más, se paga una tarifa fija menor. El tercerizado no tiene tope: cada hora extra se paga (taladro + equipos). Simulador N10 = 0 %."),
]
table(ve, r + 1, ["Concepto", "Cómo está aplicado"], [(a, b) for a, b in NOTAS], height=60)
for rr in range(r + 2, r + 2 + len(NOTAS)):
    ve.merge_cells(start_row=rr, start_column=3, end_row=rr, end_column=11)


# ================= RESUMEN =================
from openpyxl.chart import BarChart, LineChart, Reference, Series
def M(v): return ("+" if v >= 0 else "−") + f"{abs(v)/1e6:.2f}".replace(".", ",") + " M"
def D1(v): return f"{v:.1f}".replace(".", ",")
def K(v): return ("+" if v >= 0 else "−") + f"{abs(v)/1e3:,.0f}".replace(",", ".") + " k"
b5, b6 = S["5"]["base"], S["6"]["base"]; R25, R24 = S["reales"]["2025"], S["reales"]["2024"]
QB = {(q[0], q[1]): q for q in S["quiebres"]}
rs = wb.create_sheet("Resumen")
rs.sheet_view.showGridLines = False
for c, w in zip("ABCDEFG", [2, 34, 22, 22, 22, 22, 30]): rs.column_dimensions[c].width = w
rs["B1"] = "Movilización del taladro GRS 110 en La Cira Infantas: Work Order frente a modelo tercerizado"; rs["B1"].font = TITLE
rs["B2"] = "Evaluación para decidir si se mantiene el Work Order o se contrata directamente al transportador. No es un proceso de adjudicación."; rs["B2"].font = NOTE
r = 4
def para(text, height=30, bold=False):
    global r
    rs.merge_cells(start_row=r, start_column=2, end_row=r, end_column=7)
    c = rs.cell(r, 2, text); c.font = B if bold else N; c.alignment = WR; rs.row_dimensions[r].height = height; r += 1
def head(text):
    global r
    r += 1; h1(rs, r, text, "G"); r += 1

head("1. QUÉ SE EVALUÓ")
para("Dos formas de pagar las movilizaciones del taladro GRS 110. Work Order (modelo directo): el contratista del taladro cobra una suma global por movilización según la distancia, con tarifa tope, y no se pagan horas de taladro. Modelo tercerizado: SierraCol contrata al transportador y paga además el taladro por cada hora que dura la movilización y un coordinador de transporte (Truck Manager).", 44)
para("Ofertas evaluadas: Petro Star tarifa normal, Petro Star Lump Sum (precio cerrado) y Ecotransur. MTI y Transtecol quedan por fuera porque sus tarifas no se actualizaron a julio de 2026.", 30)

head("2. ARCHIVO DE TRABAJO Y FUENTES")
para("Este libro es el archivo de trabajo del ejercicio. Las hojas Simulador, Real 2024 y Real 2025 calculan con fórmulas; las demás documentan y verifican.", 30)
fuentes = [("Tarifas con evaluaciones minimas.xlsx", "Tarifas de las tres ofertas (filas amarillas 'Costo Suma Global'), TRM, tarifa del taladro, horas por rango y Truck Manager."),
           ("Cotización 1255 de Petro Star (17-jul-2026)", "Tiempos por rango, descuento desde la 6ª, cargo fijo de 0 a 5 movilizaciones, tarifas por hora de equipos y señalizadores, condición 7 sobre demoras."),
           ("Ajuste de tarifas de Ecotransur (27-jul-2026)", "Nómina y stand-by de 0 a 4 movilizaciones, sin cargo fijo desde la 5ª, solo equipos desde la 6ª."),
           ("Movilizaciones 2024 y 2025 (GRS 110)", "Frecuencia mensual, mezcla por distancia y horas reales de cada movilización."),
           ("Evaluación SierraCol v5, hoja NPT Social 2025", "Bloqueos registrados en OpenWells durante la fase de movilización (01MIRU)."),
           ("Premisas de SierraCol", "Tarifas WO y sus 12 señalizadoras, campaña de 35 pozos, 5 a 6 movilizaciones por mes, TRM 3.700, costo de pozo 600 k.")]
r = table(rs, r, ["Fuente", "Qué se tomó de ella"], [(a, b) for a, b in fuentes], height=30)
for rr in range(r - len(fuentes), r): rs.merge_cells(start_row=rr, start_column=3, end_row=rr, end_column=7)
rs.merge_cells(start_row=r - len(fuentes) - 1, start_column=3, end_row=r - len(fuentes) - 1, end_column=7)

head("3. CONSIDERACIONES DEL EJERCICIO")
cons = [
    "Campaña proyectada: 35 pozos, 15 en la misma localización y 20 entre 0,1 y 5 km. Frecuencia esperada de 5 a 6 movilizaciones por mes; se analiza de 4 a 8.",
    "Las movilizaciones se asignan a meses enteros. El número de la movilización dentro del mes define si hay cargo fijo (hasta la 5ª en Petro Star, hasta la 4ª en Ecotransur) y si hay descuento (desde la 6ª).",
    "Work Order: tarifa del Excel por rango más 8 señalizadoras que faltan (4 por turno a 375.000 COP). Esa tarifa es el tope: si la movilización tarda más, el WO paga una tarifa menor. Se compara contra el WO más caro posible.",
    "Tercerizado: tarifa del transportador + taladro a 1.456 USD/h por las horas de cada rango (12/18/24/28 h) + Truck Manager de 60 M COP por mes de campaña.",
    "Si una movilización supera el tiempo cotizado (12/24/36/36 h) se paga el taladro por esas horas y además equipos y señalizadores por hora: unos 2.813 USD por hora en total. El WO no paga nada extra.",
    "Bloqueos sociales y escolares durante movilizaciones: 22,25 h en 45 movilizaciones de 2025 (OpenWells), es decir 17,3 h en una campaña de 35 pozos. En el tercerizado los paga SierraCol (condición 7); en el WO no.",
    "Petro Star normal: 50 % de descuento sobre su tarifa desde la 6ª movilización del mes. Lump Sum: sin descuento en la evaluación principal. Ecotransur: desde la 6ª solo cobra equipos.",
    "Un mes sin poder mover con el contrato vigente paga el cargo fijo completo más el Truck Manager (Petro Star 177 k, Ecotransur 243 k). El fin de la campaña termina el contrato y no genera cobro.",
    "Adicionales en 0 % en ambos modelos (se cancelan). TRM fija en 3.700. Sin IVA.",
    "Las campañas reales de 2024 y 2025 se repiten movilización por movilización con las tarifas de julio de 2026 y las horas reales del log.",
]
for i, t in enumerate(cons): para(f"{i+1}. {t}", 30)

head("4. RESULTADOS (USD; ahorro = costo WO − costo tercerizado; positivo = el tercerizado cuesta menos)")
res = [("Campaña proyectada, 5 movs/mes", b5["PS"], b5["EC"], b5["LS"], "Tabla fija (motor de cálculo). Ver Sensibilidad, sección 1."),
       ("Campaña proyectada, 6 movs/mes", b6["PS"], b6["EC"], b6["LS"], "Tabla fija (motor de cálculo)."),
       ("Escenario cargado hoy en el Simulador", "=Simulador!D84", "=Simulador!D87", "=Simulador!D85", "Enlace vivo: cambia al editar el Simulador."),
       ("Campaña real 2025, horas reales", "='Real 2025'!AA5", "='Real 2025'!AA8", "='Real 2025'!AA6", "Enlace vivo. Incluye equipos por horas excedidas."),
       ("Campaña real 2024, horas reales", "='Real 2024'!AA5", "='Real 2024'!AA8", "='Real 2024'!AA6", "Enlace vivo.")]
r = table(rs, r, ["Escenario", "Petro Star normal", "Ecotransur", "Petro Star Lump Sum", "Nota"], res, [None, USD, USD, USD, None], height=30)
rs.merge_cells(start_row=r - len(res) - 1, start_column=6, end_row=r - len(res) - 1, end_column=7)
for rr in range(r - len(res), r): rs.merge_cells(start_row=rr, start_column=6, end_row=rr, end_column=7)
para(f"En una campaña de 35 pozos (≈ 21 M USD a 600 k por pozo) el ahorro posible va de {M(b5['PS'])} a {M(b6['EC'])}: entre 4 k y 17 k por pozo, menos del 3 % del costo del pozo.", 30)

head("5. VENTAJAS Y DESVENTAJAS DE CADA MODELO")
pc = [("Costo por movilización", "Más alto por movilización.", "Más bajo por movilización si el mes llega a 5–6 movilizaciones."),
      ("Demoras en la movilización", "Las absorbe el contratista: la tarifa tiene tope.", "Las paga SierraCol: taladro + equipos ≈ 2.813 USD por hora."),
      ("Meses con pocas movilizaciones", "Sin costo fijo: se paga solo lo que se mueve.", "Cargo fijo de nómina y equipos hasta la 4ª (Ecotransur) o 5ª (Petro Star) movilización."),
      ("Bloqueos sociales o problemas operativos", "Sin costo adicional.", "Pagan taladro y equipos; un mes sin mover cuesta 177–243 k."),
      ("Gestión", "Un solo contratista responde por todo.", "Dos contratistas: coordinación taladro–transportador, HSE, pólizas y disponibilidad a cargo de SierraCol."),
      ("Control y flexibilidad", "Menos control directo sobre el transportador.", "Más control sobre flota y tiempos; puede negociar topes y penalidades."),
      ("Previsibilidad del presupuesto", "Alta: costo cerrado por movilización.", "Baja: depende de la frecuencia mensual y de cumplir los tiempos.")]
r = table(rs, r, ["Aspecto", "Work Order (directo)", "Tercerizado"], pc, height=30)
for rr in range(r - len(pc) - 1, r):
    rs.merge_cells(start_row=rr, start_column=3, end_row=rr, end_column=4); rs.merge_cells(start_row=rr, start_column=5, end_row=rr, end_column=7)
    rs.cell(rr, 5).value = rs.cell(rr, 5).value if rs.cell(rr, 5).value else None

head("6. CONCLUSIÓN")
concl = [
    f"El tercerizado solo ahorra si la campaña sostiene 5 a 6 movilizaciones todos los meses y cada movilización cumple el tiempo cotizado. En ese caso el ahorro de la campaña es de {M(b5['PS'])} a {M(b6['PS'])} con Petro Star normal y de {M(b5['EC'])} a {M(b6['EC'])} con Ecotransur.",
    "El margen es delgado. Con 5 movilizaciones por mes, Petro Star pierde la ventaja con " + D1(QB[(5, 'Petro Star normal')][6]) + " h de más por movilización sobre el tiempo cotizado o con un mes bloqueado; Ecotransur aguanta " + D1(QB[(5, 'Ecotransur')][6]) + " h o " + D1(QB[(5, 'Ecotransur')][8]) + " meses bloqueados.",
    f"La campaña real de 2025 (45 movilizaciones, 3 meses por debajo de 5) habría costado más con el tercerizado: Petro Star {K(R25['reales_con_equipos']['PS'])}, Ecotransur {K(R25['reales_con_equipos']['EC'])}. En 2024, con 9 de 11 meses en 6 o más y movilizaciones más rápidas, habría ahorrado {M(R24['reales_con_equipos']['PS'])} y {M(R24['reales_con_equipos']['EC'])}.",
    "El Lump Sum de Petro Star pierde en todos los escenarios con los precios del Excel.",
    "La diferencia de fondo es el riesgo: el Work Order tiene tarifa tope y absorbe demoras, bloqueos y meses lentos; el tercerizado traslada todo eso a SierraCol.",
]
for t in concl: para("• " + t, 32)

head("7. RECOMENDACIÓN")
reco = ["Mantener el Work Order.",
        "Volver a evaluar el tercerizado solo si se cumplen tres condiciones: (1) un plan de pozos que asegure 6 o más movilizaciones todos los meses; (2) un contrato con tope de horas o penalidad al transportador por exceder el tiempo cotizado; (3) una cláusula que suspenda el cargo fijo en meses con bloqueos o problemas operativos.",
        "Antes de cualquier negociación, Compras debe aclarar los precios del Lump Sum: los del Excel están por encima de la cotización 1255."]
para(reco[0], 20, bold=True); para(reco[1], 44); para(reco[2], 20)

head("8. HOJAS DE ESTE LIBRO")
hojas = [("Resumen", "Esta hoja."), ("Gráficas", "Gráficos del ejercicio, con sus datos."), ("Simulador", "Modelo editable: parámetros, costo por movilización, cargos fijos, frontera y campaña mes a mes."),
         ("Método", "Cómo se clasifica cada costo, qué se cancela entre modelos y cómo entra el NPT."), ("Real 2024 / Real 2025", "Las campañas reales repetidas con cada modelo."),
         ("Reconciliación", "De dónde sale cada parámetro y control contra la fuente."), ("Medido y supuesto", "Qué es dato y qué es supuesto."),
         ("Sensibilidad", "Frecuencia de 4 a 8, puntos de quiebre, horas reales y tornado."), ("Pendientes", "Lo que falta confirmar y cuánto está en juego."),
         ("Verificación Excel", "Revisión línea por línea del archivo de tarifas.")]
r = table(rs, r, ["Hoja", "Contenido"], hojas, height=18)
for rr in range(r - len(hojas) - 1, r): rs.merge_cells(start_row=rr, start_column=3, end_row=rr, end_column=7)

# ================= GRÁFICAS =================
gs = wb.create_sheet("Gráficas")
gs.sheet_view.showGridLines = False
for c, w in zip("ABCDEFGHI", [2, 30, 16, 16, 16, 16, 16, 16, 16]): gs.column_dimensions[c].width = w
gs["B1"] = "Gráficas del ejercicio"; gs["B1"].font = TITLE
gs["B2"] = "Cada gráfico se alimenta de la tabla que tiene al lado. Las tablas en verde están enlazadas al Simulador o a las hojas Real; la de frecuencias es fija (motor de cálculo)."; gs["B2"].font = NOTE
def gtable(r0, hdr, rows, fmts):
    for i, t in enumerate(hdr):
        c = gs.cell(r0, 2 + i, t); c.font = B; c.fill = F_H2; c.border = BOX; c.alignment = WR
    for j, row in enumerate(rows):
        for i, v in enumerate(row):
            c = gs.cell(r0 + 1 + j, 2 + i, v); c.border = BOX
            c.font = GRN if isinstance(v, str) and v.startswith("=") else N
            if fmts[i]: c.number_format = fmts[i]
    return r0 + len(rows)
def style(ch, title, ytitle, w=17, h=8.5):
    ch.title = title; ch.y_axis.title = ytitle; ch.width = w; ch.height = h; ch.legend.position = "b"
    ch.y_axis.majorGridlines = None; ch.y_axis.number_format = '#,##0'
    ch.x_axis.delete = False; ch.y_axis.delete = False
    ch.x_axis.tickLblPos = "low"
COLS = ["C8860A", "2E7D5B", "7A8A99", "1F2A36", "B03A2E"]
# 1. frecuencia
r0 = 4; h1(gs, r0, "1. AHORRO DE LA CAMPAÑA DE 35 POZOS SEGÚN MOVILIZACIONES POR MES", "I")
FQ = [[("%g" % x[0]).replace(".", ","), x[1], x[3], x[2]] for x in S["frecuencias"]]
e = gtable(r0 + 1, ["Movs/mes", "Petro Star normal", "Ecotransur", "Lump Sum"], FQ, [None, USD, USD, USD])
ch = LineChart(); style(ch, "Ahorro frente al WO según frecuencia (USD)", "USD")
ch.add_data(Reference(gs, min_col=3, max_col=5, min_row=r0 + 1, max_row=e), titles_from_data=True)
ch.set_categories(Reference(gs, min_col=2, min_row=r0 + 2, max_row=e)); ch.x_axis.title = "Movilizaciones por mes"
for i, sr in enumerate(ch.series): sr.graphicalProperties.line.solidFill = COLS[i]; sr.graphicalProperties.line.width = 28000; sr.smooth = False
gs.add_chart(ch, f"G{r0+1}")
# 2. costo por movilización 0,1–5 km (vivo)
r0 = 24; h1(gs, r0, "2. COSTO DE UNA MOVILIZACIÓN DE 0,1–5 km (USD, enlazado al Simulador)", "I")
TMc = "Simulador!$C$14/Simulador!$C$7/Simulador!$C$32"
CR = [("Work Order", "=Simulador!D43", "=Simulador!D50", 0, 0),
      ("Petro Star 1ª–5ª", "=Simulador!D55", 0, "=Simulador!D53", f"={TMc}"),
      ("Petro Star 6ª+", "=Simulador!D56", 0, "=Simulador!D53", f"={TMc}"),
      ("Ecotransur 1ª–5ª", "=Simulador!D59", 0, "=Simulador!D53", f"={TMc}"),
      ("Ecotransur 6ª+", "=Simulador!D60", 0, "=Simulador!D53", f"={TMc}"),
      ("Lump Sum", "=Simulador!D57", 0, "=Simulador!D53", f"={TMc}")]
e = gtable(r0 + 1, ["Concepto", "Tarifa", "Señalizadoras (WO)", "Taladro", "Truck Manager (60 M / movs del mes)"], CR, [None, USD, USD, USD, USD])
ch = BarChart(); ch.type = "col"; ch.grouping = "stacked"; ch.overlap = 100; style(ch, "Costo de una movilización de 0,1–5 km (USD)", "USD")
ch.add_data(Reference(gs, min_col=3, max_col=6, min_row=r0 + 1, max_row=e), titles_from_data=True)
ch.set_categories(Reference(gs, min_col=2, min_row=r0 + 2, max_row=e))
for i, sr in enumerate(ch.series): sr.graphicalProperties.solidFill = ["1F2A36", "B03A2E", "C8860A", "A9B4BF"][i]; sr.graphicalProperties.line.noFill = True
gs.add_chart(ch, f"G{r0+1}")
# 3 y 4. campañas reales mes a mes (vivo)
def real_block(r0, anio, info):
    h1(gs, r0, f"{3 if anio == 2025 else 4}. CAMPAÑA REAL {anio}: AHORRO MES A MES CON HORAS REALES (USD, enlazado a Real {anio})", "I")
    rows = []
    for j in range(info["n"]):
        rr = info["MT"] + 2 + j
        rows.append((f"='Real {anio}'!K{rr}", f"='Real {anio}'!C{rr}", f"='Real {anio}'!P{rr}", f"='Real {anio}'!Q{rr}"))
    e = gtable(r0 + 1, ["Mes", "Movilizaciones", "Ahorro Petro Star", "Ahorro Ecotransur"], rows, [None, '0', USD, USD])
    ch = BarChart(); ch.type = "col"; style(ch, f"Campaña real {anio}: ahorro del tercerizado por mes (USD)", "USD")
    ch.add_data(Reference(gs, min_col=4, max_col=5, min_row=r0 + 1, max_row=e), titles_from_data=True)
    ch.set_categories(Reference(gs, min_col=2, min_row=r0 + 2, max_row=e))
    for i, sr in enumerate(ch.series): sr.graphicalProperties.solidFill = COLS[i]; sr.graphicalProperties.line.noFill = True
    gs.add_chart(ch, f"G{r0+1}")
REALINFO = {}
for anio in (2024, 2025):
    ws_ = wb[f"Real {anio}"]
    mt = next(rr for rr in range(1, ws_.max_row + 1) if ws_.cell(rr, 2).value == "Meses con movilizaciones")
    nmes = 0
    while isinstance(ws_.cell(mt + 2 + nmes, 2).value, int): nmes += 1
    REALINFO[anio] = {"MT": mt, "n": nmes}
real_block(44, 2025, REALINFO[2025]); real_block(64, 2024, REALINFO[2024])
# 5. meses por número de movilizaciones (vivo)
r0 = 84; h1(gs, r0, "5. MESES SEGÚN CUÁNTAS MOVILIZACIONES TUVIERON (logs)", "I")
def cnt(anio, crit):
    i = REALINFO[anio]; a, b = i["MT"] + 2, i["MT"] + 1 + i["n"]
    return f"=COUNTIFS('Real {anio}'!$C${a}:$C${b},\"{crit[0]}\"" + (f",'Real {anio}'!$C${a}:$C${b},\"{crit[1]}\")" if len(crit) > 1 else ")")
BIN = [("1 a 3", ("<=3",)), ("4", ("=4",)), ("5", ("=5",)), ("6 o más", (">=6",))]
rows = [(nm, cnt(2024, c), cnt(2025, c)) for nm, c in BIN]
e = gtable(r0 + 1, ["Movilizaciones en el mes", "Meses 2024", "Meses 2025"], rows, [None, '0', '0'])
ch = BarChart(); ch.type = "col"; style(ch, "Meses según movilizaciones (logs 2024 y 2025)", "Meses")
ch.add_data(Reference(gs, min_col=3, max_col=4, min_row=r0 + 1, max_row=e), titles_from_data=True)
ch.set_categories(Reference(gs, min_col=2, min_row=r0 + 2, max_row=e))
for i, sr in enumerate(ch.series): sr.graphicalProperties.solidFill = ["1F2A36", "C8860A"][i]; sr.graphicalProperties.line.noFill = True
gs.add_chart(ch, f"G{r0+1}")
gs.cell(e + 2, 2, "Con menos de 5 movilizaciones en el mes el tercerizado paga cargo fijo; desde la 6ª Petro Star descuenta el 50 %.").font = NOTE

order = ["Resumen", "Gráficas", "Simulador", "Método", "Real 2024", "Real 2025", "Reconciliación", "Medido y supuesto", "Sensibilidad", "Pendientes", "Verificación Excel"]
wb._sheets = [wb[n] for n in order]
wb.active = 0
wb.save(PATH)
print(wb.sheetnames)
