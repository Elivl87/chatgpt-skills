"""Auditoría de Evaluacion_Drilling_IM_Jul_2026_v5.xlsx (evaluación de SierraCol)."""
import sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

OUT = sys.argv[1]
F = "Arial"; B = Font(name=F, size=10, bold=True); N = Font(name=F, size=10); NOTE = Font(name=F, size=9, italic=True, color="595959")
TITLE = Font(name=F, size=14, bold=True, color="1F3864"); H1 = Font(name=F, size=11, bold=True, color="FFFFFF")
F_H1 = PatternFill("solid", fgColor="1F3864"); F_H2 = PatternFill("solid", fgColor="D9E1F2")
SEV = {"Alta": "F8CBAD", "Media": "FFEB9C", "Baja": "E2EFDA"}; VER = {"CONSERVAR": "C6EFCE", "CORREGIR": "FFEB9C", "DESCARTAR": "F8CBAD"}
thin = Side(style="thin", color="BFBFBF"); BOX = Border(left=thin, right=thin, top=thin, bottom=thin); WR = Alignment(wrap_text=True, vertical="top")
USD = '$#,##0;($#,##0);"-"'
wb = Workbook()


def sheet(ws, title, sub, widths):
    ws.sheet_view.showGridLines = False
    for i, w in enumerate(widths): ws.column_dimensions[chr(65 + i)].width = w
    ws["B1"] = title; ws["B1"].font = TITLE
    ws["B2"] = sub; ws["B2"].font = NOTE


def table(ws, r0, hdr, rows, fmts=None, h=None, fills=None):
    for i, t in enumerate(hdr):
        c = ws.cell(r0, 2 + i, t); c.font = B; c.fill = F_H2; c.border = BOX; c.alignment = WR
    for j, row in enumerate(rows):
        for i, v in enumerate(row):
            c = ws.cell(r0 + 1 + j, 2 + i, v); c.font = N; c.border = BOX; c.alignment = WR
            if fmts and fmts[i]: c.number_format = fmts[i]
            if fills and i in fills and isinstance(v, str):
                for k, col in fills[i].items():
                    if v.startswith(k): c.fill = PatternFill("solid", fgColor=col)
        if h: ws.row_dimensions[r0 + 1 + j].height = h
    return r0 + 1 + len(rows)


# ---------------- Resumen
ws = wb.active; ws.title = "Resumen"
sheet(ws, "Auditoría de la evaluación de SierraCol (Evaluacion_Drilling_IM_Jul_2026_v5.xlsx)",
      "Se revisaron las 9 hojas (≈4.300 celdas, 2.435 fórmulas). Cada cifra se reprodujo con el motor independiente (tools/modelo.py). 'Tu número' = valor de tu archivo.", [2, 46, 20, 24, 24, 50])
ws.merge_cells("B2:F2")
txt = [
    "La aritmética está bien: la campaña real 2025 se reproduce al dólar (Petro Star +56.743, Ecotransur +48.410, Lump Sum con descuento −1.024.254) y las hojas Escenarios y Movilizaciones 2025 son idénticas a los archivos fuente.",
    "Lo que cambia el resultado son tres cosas que la evaluación no cobra: (1) equipos y señalizadores por las horas que superan el tiempo cotizado, (2) meses enteros en lugar de fraccionarios, (3) el Lump Sum sin descuento como caso principal.",
    "Con esas correcciones la campaña real 2025 pasa de ahorro a pérdida para el tercerizado (Petro Star −70.830, Ecotransur −79.163) y la campaña proyectada a 6 movs/mes baja de 633 k a 570 k (Petro Star).",
    "Sesgo: de 17 hallazgos, 10 favorecen al tercerizado y ninguno al WO (incluido el tope del WO: se compara contra el WO más caro posible); el resto son neutros o indeterminados. Es un sesgo sistemático, igual que en la evaluación previa.",
    "Tu aporte que incorporé a mi simulador: los bloqueos medidos en OpenWells (22,25 h en fase de movilización en 2025 → 17,3 h por campaña de 35 pozos) y el Truck Manager mensual en la campaña real.",
]
for i, t in enumerate(txt):
    r = 4 + i; ws.merge_cells(f"B{r}:F{r}"); c = ws[f"B{r}"]; c.value = "• " + t; c.font = N; c.alignment = WR; ws.row_dimensions[r].height = 32
r = 10
ws.merge_cells(f"B{r}:F{r}"); c = ws[f"B{r}"]; c.value = "TU NÚMERO, REPRODUCIDO Y CORREGIDO (USD, ahorro frente al WO; + = tercerizado más barato)"; c.font = H1; c.fill = F_H1
rows = [
    ("Proyectada 35 pozos · 6 movs/mes · Petro Star normal (Resumen E25, 'caso base')", 633333, 570244, 524279, "5.5 usa meses fraccionarios; 6/mes en meses enteros = 5 meses de 6 + 1 de 5 (paga cargo fijo). Mi número incluye 17,3 h de bloqueo social y TM por movilización."),
    ("Proyectada 35 pozos · 6 movs/mes · Ecotransur (Resumen H25)", 645791, 633169, 587204, "Mismo motivo."),
    ("Proyectada · 5 movs/mes · Petro Star normal (Resumen E24)", 180835, 180835, 151087, "A 5/mes los meses son enteros: tu número es correcto. El mío resta el bloqueo social medido."),
    ("Proyectada · 5 movs/mes · Ecotransur (Resumen H24)", 539203, 539203, 509454, "Ídem."),
    ("Supuestos · caso base del tornado (6/mes, NPT 8 %, bloqueo 12 h) · Petro Star (T31)", 414014, 305587, None, "Mismas premisas en meses enteros: −108 k. El NPT 8 % no tiene fuente en el archivo."),
    ("Supuestos · 'Movilizaciones mínimo' (5/mes con NPT 8 %) · Petro Star (T34)", 76244, 25743, None, "Interpolar la nómina entre 4 y 5 movs suaviza un escalón real."),
    ("Supuestos · 'Movilizaciones máximo' (7/mes con NPT 8 %) · Petro Star (T35)", 667402, 567675, None, ""),
    ("Campaña real 2025 · Petro Star normal (Campaña Real J94)", 56743, 56743, -70830, "Reproducido al dólar. Corregido: 15 movilizaciones superaron el tiempo cotizado (94 h) → equipos y señalizadores 127.573 USD (Cot. 1255 p. 5, condición 7)."),
    ("Campaña real 2025 · Ecotransur (P94)", 48410, 48410, -79163, "Ídem (Ecotransur con las mismas tarifas horarias, supuesto)."),
    ("Campaña real 2025 · Lump Sum (M94)", -1024254, -1024254, -1448687, "Tu Lump Sum lleva 50 % de descuento (O14). Evaluación principal: sin descuento (−296.860) + horas excedidas."),
]
r = table(ws, r + 1, ["Cifra", "Tu número", "Reproducido con tus premisas", "Corregido / mi evaluación", "Por qué difiere"], rows, [None, USD, USD, USD, None], h=44)

# ---------------- Hallazgos
H = wb.create_sheet("Hallazgos")
sheet(H, "Hallazgos línea por línea", "Ordenados por severidad. Efecto = cambio del ahorro del tercerizado (USD) al corregir. Dirección = hacia dónde empuja el error.", [2, 5, 18, 22, 58, 9, 16, 22, 52])
HL = [
    ("Campaña Real 2025", "Q40:S84 · L40:L84", "No cobra equipos ni señalizadores por las horas que superan el tiempo cotizado (12/24/36/36 h). La Cot. 1255 p. 5 tarifa equipos por hora y la condición 7 traslada al cliente equipos y nómina en demoras no atribuibles al transportador. En 2025, 15 de 45 movilizaciones superaron el tiempo (94 h).", "Alta", -127573, "Favorece tercerizado", "Agregar por movilización: MAX(0; horas reales − tiempo estipulado) × (flota mínima 3.934.000 + 20 señalizadores 1.087.500 COP/h) / TRM. Resultado: PS −70.830; EC −79.163."),
    ("Supuestos · DRL 5.5–5.7 · Resumen", "Supuestos G31:L41 · DRL J131:Y159 · Resumen E23:I27, C39:D43", "Meses fraccionarios (35/frecuencia), cuota de descuento uniforme y nómina interpolada entre escenarios enteros. Con 6/mes la realidad son 5 meses de 6 y 1 de 5 (cargo fijo de 40.953); con NPT la frecuencia queda fraccionada y el escalón de la nómina se suaviza.", "Alta", -108427, "Favorece tercerizado", "Simular mes a mes con conteos enteros (como hace tu propia hoja Campaña Real). Supuestos T31: 414.014 → 305.587; Resumen E25: 633.333 → 570.244."),
    ("Resumen · Supuestos · Huracán", "Resumen B25, B46 · Supuestos D5:D9", "Dos 'casos base' para la misma campaña: Resumen 633 k (6/mes, sin NPT ni bloqueo) y Supuestos/Huracán 414 k (6/mes, NPT 8 %, bloqueo 12 h). La conclusión B46 cita 633 k.", "Alta", None, "Favorece tercerizado (titular)", "Un solo caso base y una sola cifra por frecuencia (5 y 6 movs/mes)."),
    ("Resumen", "B49", "La conclusión dice que 'las horas pesan en segundo lugar'. Con el cobro de equipos por hora excedida, las horas son de primer orden: con las horas reales de 2025 el resultado cambia de signo.", "Alta", None, "Favorece tercerizado", "Reescribir: lo que decide es la frecuencia mensual y cumplir el tiempo cotizado en cada movilización."),
    ("Campaña Real 2025", "O14 · H18:H21 · M93:M95", "El Lump Sum lleva 50 % de descuento desde la 6ª ('lectura más favorable'). La evaluación principal es sin descuento.", "Media", -296860, "Favorece tercerizado (LS)", "O14 = 0 en la evaluación principal; dejar el 50 % como sensibilidad aparte."),
    ("Supuestos", "B19", "NPT de 8 % en el caso base sin fuente en el archivo (no hay plan de pozos ni NPT de perforación). Además el rango 5–10 % se aplica a la frecuencia.", "Media", None, "Indeterminado", "Dejar NPT en 0 % en la base y mostrar su barrido; o documentar la fuente del 8 %."),
    ("Supuestos", "B24 · B26 · M31", "Bloqueo: stand-by de equipos 1.419 USD/h sin fuente y solo el 30 % del tiempo (supuesto). La Cot. 1255 p. 5 da ~1.357 USD/h (flota mínima + 20 señalizadores) y la condición 7 cobra equipos y nómina completos si la demora no es atribuible.", "Media", -11178, "Favorece tercerizado", "12 h × (1.456 + 1.357) = 33.758 en vez de 22.580; con las 17,3 h medidas (social + escolar) = 48.668."),
    ("Supuestos · NPT Social 2025", "B21 · B27 · A41", "La hoja NPT Social dice que la restricción escolar suma 6 h fijas por campaña, pero B27 = 0: no se aplica. Las horas de bloqueo base (12 h) son menores que lo medido escalado (22,25 × 35/45 = 17,3 h).", "Media", -11290, "Favorece tercerizado", "B27 = 6 con tu fórmula (−11.290); o usar las 17,3 h totales medidas a 2.813 USD/h (−48.668 en total)."),
    ("Supuestos · Huracán", "A5:O9", "El tornado solo evalúa Petro Star normal: Ecotransur y el Lump Sum no tienen sensibilidad.", "Media", None, "Neutro", "Agregar las otras ofertas al motor."),
    ("Supuestos · Huracán", "A7 · A36:A37 · E7:G7", "Distancia aparece como 2ª variable, pero SierraCol confirmó que los 20 pozos van en 0,1–5 km: no es variable de la campaña proyectada. Además los rótulos están invertidos: 'Distancia — mínimo (0 km)' calcula 10 km y 'máximo (10 km)' calcula 0 km.", "Media", None, "Neutro", "Quitar Distancia del tornado (o mostrarla como escenario) y corregir los rótulos."),
    ("Todas", "DRL K4:K7 · Campaña Real D18:D21", "CONFIRMADO por SierraCol: las tarifas WO son el tope (lo máximo, con movilización rápida); si tarda más se paga una tarifa fija menor. Ambas evaluaciones comparan contra el WO más caro posible, y el tercerizado no tiene tope. En 2025 las movilizaciones lentas habrían pagado menos en el WO.", "Media", None, "Favorece tercerizado", "Dejar el WO en su tope como cota superior y declararlo: el ahorro calculado es el máximo posible frente al WO."),
    ("Campaña Real 2025", "C26 · L26:M26", "Febrero tiene 1 movilización y paga el cargo fijo de 1 movilización: 133.751 (PS) y 181.054 (EC). CONFIRMADO por SierraCol: el pozo de enero tuvo problemas operativos y duró casi un mes; febrero sí fue mes de campaña. El cálculo es correcto y muestra el riesgo real: un pozo complicado deja un mes con pocas movilizaciones y el tercerizado cobra el cargo fijo igual.", "Baja", 0, "Neutro (correcto)", "Sin corrección. Usarlo como ejemplo del riesgo de meses con baja frecuencia."),
    ("NPT Social 2025", "E16 · E20 · E21 (01MIRU)", "Las esperas 'No social — equipos' en fase de movilización (7 h: poste eléctrico, soldadura, buldócer) se excluyen. En el tercerizado, si no son atribuibles al transportador, también las paga el cliente (taladro + equipos).", "Baja", -15316, "Favorece tercerizado", "Incluirlas escaladas a 35 pozos (7 × 35/45 = 5,4 h × 2.813)."),
    ("Resumen · Campaña Real 2025", "Resumen F7 · Campaña Real Q14, M16", "'Mínimo mensual Petro Star 6': la cotización dice 5 (p. 5, condición 2). El cálculo es correcto (cobra el cargo fijo con 5 según la tabla de la p. 4): es un rótulo.", "Baja", 0, "Neutro", "Rótulo: 'mínimo 5; con 5 aún paga cargo fijo (p. 4)'."),
    ("Resumen", "C23:C27 vs Campaña Real K40:K84", "Truck Manager prorrateado a 6/mes en la proyección y mensual en la campaña real: dos criterios distintos. El mensual es el realista.", "Baja", -2703, "Favorece tercerizado (proyección)", "Usar el criterio mensual en ambas."),
    ("Chart Data", "J2 · J11 · J19 · J27", "Textos del instructivo desactualizados: citan 'BASE = $400' y un ejemplo de Social con −650 que no corresponde a los datos.", "Baja", 0, "Neutro", "Actualizar el texto o enlazarlo a la celda."),
    ("NPT Social 2025", "G5:G25", "El costo por hora de cada evento varía entre 1.021 y 2.447 USD/h sin explicar la fuente. No entra a ningún cálculo.", "Baja", 0, "Neutro", "Indicar la fuente (OpenWells) o retirar la columna."),
]
rows = [(i + 1,) + x for i, x in enumerate(HL)]
table(H, 4, ["#", "Hoja", "Celdas", "Hallazgo", "Severidad", "Efecto USD (aprox.)", "Dirección", "Corrección"], rows, [None, None, None, None, None, USD, None, None], h=78,
      fills={4: {k: v for k, v in SEV.items()}})

# ---------------- Por hoja
P = wb.create_sheet("Por hoja")
sheet(P, "Veredicto por hoja", "¿Está bien hecha? ¿Sirve? ¿Se conserva, se corrige o se descarta?", [2, 26, 36, 54, 14])
PH = [
    ("Resumen", "Aritmética sí (todo son enlaces). Base y conclusiones no.", "Mezcla dos casos base; la conclusión subestima el peso de las horas; rótulo de mínimo 6.", "CORREGIR"),
    ("DRL USD - Escenarios 2025", "Idéntica celda por celda a Tarifas.xlsx (ya auditada).", "Ver Auditoria_Evaluacion_Previa.xlsx: 5.5–5.8 con meses fraccionarios, nota J55, mínimo 6 en J79.", "CORREGIR"),
    ("Campaña Real 2025", "Sí: se reproduce al dólar. Orden dentro del mes, cargos fijos, descuentos y TM mensual correctos.", "Es la hoja más sólida. Faltan: equipos por hora excedida, Lump Sum sin descuento, bono WO y confirmar febrero.", "CORREGIR"),
    ("Movilizaciones 2025", "Idéntica al log entregado.", "Fuente de frecuencia, mezcla y horas.", "CONSERVAR"),
    ("NPT Social 2025", "Sumas correctas (240,75 h; 22,25 h sociales en 01MIRU).", "Dato nuevo y valioso: incorporado a mi simulador. Aclarar la columna de costo.", "CONSERVAR"),
    ("Supuestos", "Fórmulas consistentes entre filas; ranking sin RANK.EQ correcto.", "Motor con meses fraccionarios, NPT 8 % sin fuente, stand-by 1.419 × 30 % sin fuente, solo Petro Star, Distancia con rótulos invertidos.", "CORREGIR"),
    ("Huracán", "Enlaces correctos al ranking de Supuestos.", "Hereda todo lo de Supuestos.", "CORREGIR"),
    ("Chart Data", "Mecánica del gráfico correcta (#N/A como separador).", "Textos del instructivo desactualizados.", "CONSERVAR"),
    ("Metodología", "Enlaces correctos.", "Hereda el ranking de Supuestos.", "CORREGIR"),
]
table(P, 4, ["Hoja", "¿Bien hecha?", "Observaciones", "Veredicto"], PH, h=48, fills={3: VER})

# ---------------- Comparación
C = wb.create_sheet("Qué consideró cada uno")
sheet(C, "Qué consideró cada evaluación y qué faltó", "Para cerrar una evaluación completa.", [2, 50, 22, 22, 50])
CM = [
    ("Tarifas por rango, señalizadoras al WO, cargos fijos y descuentos desde la 6ª", "Sí", "Sí", "Coinciden."),
    ("Campaña proyectada 35 pozos (15 + 20 en 0,1–5 km)", "Sí", "Sí", "Tú: frecuencia constante con meses fraccionarios. Yo: meses enteros."),
    ("Campaña real 2025 movilización por movilización", "Sí", "Sí (y 2024)", "Cuadran al dólar con las mismas premisas."),
    ("Horas reales de taladro en la campaña real", "Sí", "Sí", ""),
    ("Truck Manager mensual en la campaña real", "Sí", "Como sensibilidad", "Adopto tu criterio como el más realista."),
    ("Bloqueos sociales medidos (OpenWells)", "Sí", "Ahora sí", "Incorporado: 17,3 h por campaña."),
    ("Equipos y señalizadores por horas sobre el tiempo cotizado", "No", "Sí", "Cambia el signo de 2025."),
    ("Ecotransur y Lump Sum en la sensibilidad", "No", "Sí", ""),
    ("Lump Sum sin descuento como caso principal", "No (50 %)", "Sí", ""),
    ("Tope del WO (tarifa máxima, con piso si tarda más)", "No explícito", "Sí", "El WO está acotado; el tercerizado no."),
    ("Meses bloqueados con contrato vigente", "No", "Sí", "160–226 k por mes."),
    ("Precios del Lump Sum del Excel vs Cot. 1255", "No", "Sí", "+0,44 M al LS si se usara la cotización."),
    ("Horas cotizadas por Petro Star (24 h en 0,1–5 km) vs 18 h del Excel", "Parcial (rango 15–21 h)", "Sí", "−0,17 M."),
    ("Ahorro por pozo y % del costo del pozo", "No", "Sí", "1–3 % de un pozo de 500–600 k."),
    ("NPT de perforación", "Sí (8 % base)", "Barrido 0–20 %", "Falta la fuente del 8 %."),
]
table(C, 4, ["Tema", "Tu evaluación", "Mi evaluación", "Nota"], CM, h=30)
wb.save(OUT); print("ok")
