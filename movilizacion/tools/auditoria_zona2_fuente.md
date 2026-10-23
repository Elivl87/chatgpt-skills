# Auditoría de la Zona 2 — Tarifas.xlsx, hoja "DRL USD - Escenarios 2025"

**Alcance.** Columnas J en adelante, filas 3–186, más las celdas sueltas F155 y F156. MTI y Transtecol quedan fuera del alcance. Todas las cifras están en USD, con TRM de 3.700 (E3). Taladro a 1.456 USD/h (E6). Adicionales E7 = E8 = 0.

**Método.**
- Leí cada fórmula con openpyxl y la comparé con su valor en caché.
- Recalculé cada cifra con `tools/modelo.py`: `campana`, `proyeccion` y `costo_mov`, más variantes. Las variantes son meses discretos, Truck Manager (TM) mensual, mezcla de los logs y horas de la cotización.
- Contrasté los datos con la Cot. 1255 (páginas 1 a 5, leídas como imagen) y con la carta de Ecotransur (páginas 1 a 5, leídas con pdftotext).

**Convención.** "Su número" es el valor de la celda del Excel. "Mi número" es mi propio recálculo. ✓ significa que lo reproduje al centavo.

---

## 1. Señalizadoras — J3:L11

| Sección | Celdas | ¿Bien hecha? | ¿Sirve? | Veredicto | Evidencia y corrección | Su número | Mi número |
|---|---|---|---|---|---|---|---|
| Recargo señalizadoras WO | K8=4, K9=375.000, K10=750.000, K11, L11 | Sí | Sí: alimenta C32, C58, C84 y C110 (WO ajustado) | **CONSERVAR** | Las tarifas coinciden con la Cot. 1255 p.5: 375.000 COP por turno de 12 h y 750.000 COP por día. K11 = 4×375.000/3.700 y L11 = 4×750.000/3.700, que equivale a 8 personas × 375.000. Nota: los tramos 5–10 y >10 km duran 36 h según la cotización (3 turnos), pero el Excel cobra 2. Es un hecho fijado por SierraCol y no toca la campaña (solo usa misma localización y 0–5 km). | K11 405,41 · L11 810,81 | 405,41 ✓ · 810,81 ✓ |

## 2. Campaña de 35 pozos — J12:M46 (solo WO, PS, LS y EC)

| Sección | Celdas | ¿Bien hecha? | ¿Sirve? | Veredicto | Evidencia y corrección | Su número | Mi número |
|---|---|---|---|---|---|---|---|
| Aritmética de la campaña | M18, M35, M40, M45 | Sí, como aritmética: 15×misma localización + 20×0,1–5 km a tarifa plena, sin cargo fijo, TM/6 | Parcialmente | **CORREGIR** | Las fórmulas encadenan bien con C31/C57, E31/E57, F31/F57 y G31/G57. | WO 3.130.187 · PS 2.643.765 · LS 3.248.714 · EC 2.572.066 | Mismo cálculo: 3.130.187 ✓ · 2.643.765 ✓ · 3.248.714 ✓ · 2.572.066 ✓ |
| Mezcla de la campaña (J16=15, J17=20, K17 "Dif. Loc" llevado a C58 = 0,1–5 km) | J16, J17, L17, J46 | No está soportada | — | **CORREGIR** | **Los 15 de misma localización** son dato de SierraCol, pero son el 43 %, frente al 33 % de los logs de 2024 (23/70) y el 24 % de 2025 (11/45). **Que los 20 restantes estén todos en 0,1–5 km es un supuesto del Excel, no de SierraCol.** En los logs, los tramos 5–10 y >10 km pesan el 38 % (18/47) de los movimientos a otra localización en 2024 y el 50 % (17/34) en 2025. Son justamente los tramos donde el tercerizado pierde a tarifa plena (E85 −5.911 · G85 −8.760 · G111 −880). | 20 en 0,1–5 km | Con el perfil de 2024, 15 + 20 en 0,1–5 km da PS 763.124 · EC 750.092 de ahorro. Con 15 + 20 repartidos según 2024 (12/6/2): PS 628.949 · EC 558.054. Con 15 + 20 según 2025 (10/6/4): PS 601.594 · EC 509.604. |
| Insumos del Lump Sum (F25, F51, F77, F103; zona 1, pero alimentan K53 y 5.8) | F25 = 178.363.885 · F51 = 304.284.690 · F77 = 373.649.874 · F103 = 414.800.928 COP | **No:** no coinciden con la Cot. 1255 | — | **CORREGIR** (antes de concluir sobre LS) | La Cot. 1255 da como Tarifa LUMP SUM: misma localización 140.385.441 (p.1), 0–5 km 251.155.192 (p.1), 5–10 km 311.369.322 (p.2) y 10–20 km 346.822.484 (p.2). El Excel tiene de más 37.978.444, 53.129.498, 62.280.552 y 67.978.444 COP; los extremos difieren justo 30 M. La fuente no se puede rastrear: hay que confirmar con SierraCol si existe otra versión. La tarifa base de PS (E25 a E103) sí coincide con la cotización. | LS 3.248.714 (ahorro −118.526) | Con las tarifas de la Cot. 1255: LS 2.807.560 (**ahorro +322.627**), es decir, 441.153 menos. |

## 3. Resumen J48:M55 y notas J58:J63

| Sección | Celdas | ¿Bien hecha? | ¿Sirve? | Veredicto | Evidencia y corrección | Su número | Mi número |
|---|---|---|---|---|---|---|---|
| Resumen de ahorro | K52:N54 | La aritmética sí; la base, no | Solo como "tarifa plena" | **CORREGIR** | **Base híbrida.** El TM se calcula a 6 movilizaciones por mes (J63, C29 = 60 M/3.700/6), pero no aplica el 50 % ni el cambio de tarifa de EC desde la 6ª, que a 6 movilizaciones por mes sí ocurren. Así se contradice con 5.5, que es la base que usan 5.6, 5.7 y 5.8 (R133, X133). **Hay dos cifras "titulares" para lo mismo:** PS 486.422 en el resumen frente a 633.333 en 5.5, y EC 558.122 frente a 645.791. El titular debe ser uno solo, en meses discretos y con el perfil de los logs. | PS 486.422 (15,5 %) · LS −118.526 (−3,8 %) · EC 558.122 (17,8 %) | A 6/mes exacto (meses discretos, TM mensual): PS 570.244 · LS −162.181 · EC 633.169. Con el perfil de 2024: PS 730.502 · LS −118.526 · EC 695.386. Con el perfil de 2025: PS 352.652 · LS −390.648 · EC 427.789. |
| Nota J55 | J55 | No | — | **CORREGIR** | La nota cita "WO (3.107.890)", que es 15×75.642 + 20×98.663, es decir, el WO **sin** señalizadoras. La fórmula usa M18 = 3.130.187. La diferencia de 22.297 son exactamente las señalizadoras (15×405,41 + 20×810,81). | 3.107.890 | 3.130.187 |
| Notas J58 y J59 | J58, J59, J55 (2ª frase) | No | — | **CORREGIR** | J58 dice que el LS sale "según Cot. 1255", pero los valores no coinciden (ver sección 2). La lógica de usar E8 en vez de E7 no tiene efecto porque E7 = E8 = 0. | — | — |
| Notas J60 a J63 | J60, J61, J62, J63 | J61 sí (Cot. p.3: 20 señalizadores; carta EC p.1: 20). J63 es cierta, pero revela la base híbrida. | — | **CONSERVAR** J61 y J62; **CORREGIR** J63 | El TM es un cargo mensual: el total es 16.216 USD por mes activo. Prorratearlo entre 6 solo vale a 6 movilizaciones por mes. 5.5 sí lo varía según la frecuencia; el resumen no. | — | — |

## 4. 5.1 Reglas de descuento — J74:N79 (y parámetros J66:K72)

| Sección | Celdas | ¿Bien hecha? | ¿Sirve? | Veredicto | Evidencia y corrección | Su número | Mi número |
|---|---|---|---|---|---|---|---|
| Reglas | K76:K78, N76:N78 | Casi | Sí, como resumen contractual | **CORREGIR** | K78 coincide con la Cot. 1255 p.2 ("50 % de cada escenario"). N76 y N77 coinciden con la carta EC p.2–3. **N78 omite parte del texto:** la carta (p.4) dice "equipos **y el personal operativo efectivamente utilizado para cada turno**". El Ítem 2 incluye el personal de los equipos, pero no las 20 señaleras ni la supervisión. | — | — |
| J79: "mínimo mensual es 6 en Petro Star" | J79 | **No** | — | **CORREGIR** | La Cot. p.5, condición 2, dice "Movilizaciones mínimas al mes … 0–5 km: **5**". La tabla de p.4 cobra nómina y disponibilidad también con 5 (93.102.391 + 58.422.000 COP). El cálculo es correcto: cobra el cargo fijo con 5. Lo que está mal es el texto. Redacción correcta: "mínimo contractual 5; el cargo fijo de p.4 aplica hasta 5 inclusive; con 6 o más se infiere que no hay cargo fijo (p.4 no trae escenario de 6)". | "mínimo 6" | Mínimo 5 (p.5), con cargo fijo hasta 5 (p.4) |
| Parámetros | K68=6, K69:K72 | Fórmulas correctas | **No**: ninguna celda los referencia; 5.5 escribe J131:J135 a mano y 5.6 usa K144 | **DESCARTAR** (o enlazar) | Son celdas muertas. K72 = 5,83 meses, sin uso. | — | — |

## 5. 5.2 Tarifa plena y con descuento — J81:O87

| Sección | Celdas | ¿Bien hecha? | ¿Sirve? | Veredicto | Evidencia y corrección | Su número | Mi número |
|---|---|---|---|---|---|---|---|
| PS plena y al 50 % | K83:L86 | Sí | Sí | **CONSERVAR** | K83:K86 = E25, E51, E77, E103, que coinciden con las tarifas base de la Cot. p.1–2. L = 50 % (p.2). Que el 50 % se aplique a la tarifa base (PS normal) coincide con la evaluación principal de SierraCol. | 18.971,01 / 29.845,01 / 32.224,73 / 33.305,81 | ✓ |
| EC plena y 6ª en adelante | M83:O86, J87 | Sí, salvo un supuesto sin declarar | Sí | **CONSERVAR** con nota | Los equipos (O84:O86) coinciden con la carta p.4–5. **N83 (misma localización) = 123.180.000, el valor de 0–5 km. Es un supuesto que no está declarado** en ninguna celda: la carta no trae valor para misma localización. Los porcentajes de J87 son correctos: 1 − O/M. | "12 % a 44 %" | 12,16 % · 40,69 % · 44,18 % · 33,99 % → 12–44 % ✓ |

## 6. 5.3 Nómina y disponibilidad — J89:R100

| Sección | Celdas | ¿Bien hecha? | ¿Sirve? | Veredicto | Evidencia y corrección | Su número | Mi número |
|---|---|---|---|---|---|---|---|
| Tablas de cargo fijo | K91:R99 | Sí | Sí | **CONSERVAR** | K91:L96 coincide con la Cot. p.4 en sus 12 valores. O91:P95 coincide con la carta EC (p.2–3 y p.5, 0 movilizaciones). La nómina EC cae 80/60/40/20 %, como dice J100 ✓. Anomalía de la fuente, transcrita fielmente: la disponibilidad de PS con 1 movilización (166,92 M) es mayor que con 0 (164,78 M); conviene aclararlo con PS. Las filas 6 a 8 de PS en cero son una inferencia (p.4 termina en 5). | N91 160.751,35 … N96 40.952,54 · R91 226.317,52 … R95 45.263,50 | ✓ |
| Título J89 | J89 | No | — | **CORREGIR** | Dice "se cobra solo si no se alcanza el mínimo", pero PS cobra con 5, que es su mínimo (p.5). | — | — |

## 7. 5.4 Factura mensual — J102:P115

| Sección | Celdas | ¿Bien hecha? | ¿Sirve? | Veredicto | Evidencia y corrección | Su número | Mi número |
|---|---|---|---|---|---|---|---|
| Factura del transportador según movilizaciones | K104:N104, J107:P114, J115 | Sí: solo el transportador, sin taladro ni TM, y lo declara | Sí (informativa) | **CONSERVAR** | Usa la tarifa ponderada 15/20, que es lineal y por tanto válida para totales. Es una aproximación porque el descuento recae sobre el tramo concreto de la 6ª movilización. J115 es cierto: la factura de PS **baja** de 5 a 6 movilizaciones (desaparecen 40.953 de cargo fijo y la 6ª entra al 50 %). Esto crea un incentivo contractual no monotónico que conviene señalar a SierraCol. | K104 50.369,45 · M112 292.799,77 · M113 277.031,95 | ✓ |

## 8. Validación SCM — J117:P125

| Sección | Celdas | ¿Bien hecha? | ¿Sirve? | Veredicto | Evidencia y corrección | Su número | Mi número |
|---|---|---|---|---|---|---|---|
| Columna PS | K119:M124 | Sí | Solo como control de transcripción | **CONSERVAR** (cambiar el rótulo) | L119:L124 es la tabla de la Cot. p.4 pasada a USD; por ejemplo, 715.732.606/3.700 = 193.441,24 ✓. Cuadra al centavo, pero solo confirma que el Excel transcribió bien. **No valida la decisión**: no incluye taladro, TM ni WO. | M = 0,00 | 0,00 ✓ |
| Columna EC y nota J125 | N119:P123, J125 | **La explicación de J125 no se puede reproducir** | — | **CORREGIR** | La tabla SCM implica 51.997,84 USD por movilización (192.392.014 COP): O120 − R92 = 233.051,86 − 181.054,02. El promedio de los 4 escenarios EC del Excel (G25, G51, G77, G103) da 212.499.752 COP, o sea 57.432,37 USD. **No coincide.** SCM usó una base distinta para cada oferente (PS a 0–5 km; EC con un valor menor de origen desconocido), lo que no es una comparación homogénea: su tabla favorecía a EC en 4.138 USD por movilización. El Excel corrige bien usando 0–5 km para ambos (N119:N124). | P120 4.138 … P123 16.552 | Diferencias ✓; la causa de J125 no se puede verificar |

## 9. 5.5 Campaña según frecuencia — J129:Y138

| Sección | Celdas | ¿Bien hecha? | ¿Sirve? | Veredicto | Evidencia y corrección | Su número | Mi número (meses discretos, TM mensual) |
|---|---|---|---|---|---|---|---|
| Ahorro por frecuencia | K131:Y135 | Las fórmulas sí; el método es aproximado | Sí: **es la base real del análisis** (5.6, 5.7 y 5.8 la usan) | **CORREGIR** | (a) Usa meses fraccionarios (35/J) y una cuota uniforme de descuento (J−5)/J. A 6/mes, la realidad son 5 meses de 6 y 1 de 5: PS paga 40.953 de cargo fijo ese último mes y solo 5 movilizaciones van al 50 %, no 5,83. (b) Solo modela la mezcla misma localización + 0–5 km (ver sección 2). (c) Falta el LS sin descuento, que es la evaluación principal de SierraCol. (d) El tratamiento del TM (60 M/TRM/J) es correcto, pero no coincide con el del resumen. | J=4: PS −54.946 · EC 114.769. J=5: 180.835 · 539.203. J=6: 633.333 · 645.791. J=7: 751.783 · 721.925. | J=4: PS −86.409 · EC 54.135. J=5: 180.835 ✓ · 539.203 ✓. J=6: 570.244 · 633.169. J=7: 744.016 · 708.900. |
| Notas J137 y J138 | J137, J138 | J137 sí; J138 no | — | **CORREGIR** | J138 dice que "por debajo de 5 **el modelo directo** pierde": está mal rotulado (en J14 "directo" es el WO) y es falso para EC, que con 4 todavía ahorra (X131 +114.769). J138 dice también que las filas 5, 6 y 7 son el "rango real", pero 2025 promedió 5,0 movilizaciones por mes, con meses de 1, 3 y 4. Con el perfil real de 2025 el ahorro de 35 pozos baja a PS 352.652 y EC 427.789. | — | — |

## 10. 5.6 Riesgo por NPT — J141:Z159 y bloque auxiliar AB89:AI151

| Sección | Celdas | ¿Bien hecha? | ¿Sirve? | Veredicto | Evidencia y corrección | Su número | Mi número |
|---|---|---|---|---|---|---|---|
| Mecánica y NPT tolerable | J147:Z151, AB91:AI151, K153, N153 | La aritmética sí: AH y AI son monótonas decrecientes, así que MATCH(0;…;−1) es válido | Poco: descansa en una premisa equivocada | **CORREGIR** | Bajo sus propias premisas lo reproduzco: AH121 = 1.192 ≥ 0 y AH122 = −15.080 (PS); AI127 = 26.345 y AI128 = −8.744 (EC). | NPT tolerable: PS 30 % · EC 36 % (margen 25 % y 31 %) | 30 % ✓ · 36 % ✓ (con sus premisas) |
| Premisa J156: el NPT reduce la frecuencia | J156 | Válida solo para NPT fuera de la movilización (NPT de perforación) | — | Matizar | Si el NPT ocurre durante la perforación, alarga la campaña y el taladro se paga igual en ambos modelos. Ahí la premisa se sostiene. | — | — |
| Premisa J157: el WO no se afecta | J157 | Correcta | — | CONSERVAR | El WO es suma global por movilización y no paga horas de taladro (hecho fijado). Precisamente por eso la asimetría con el tercerizado es mayor. | — | — |
| **Premisa J159: el NPT no carga horas de taladro "por igual en ambos modelos"** | J159, L143 | **Falsa para NPT durante la movilización** (L143 incluye "bloqueos, clima") | — | **CORREGIR** | En el WO no se pagan horas de taladro. En el tercerizado, cada hora de demora cuesta 1.456 USD de taladro. En PS se suma la **cláusula 7 (Cot. p.5)**: si la demora no es atribuible al transportador, el cliente asume equipos y nómina. Estimo ≈1.063 USD/h de equipos (flota 0–5 km de p.1 a tarifa horaria de p.5) más ≈161 USD/h de nómina (430 M COP / 720 h), en total **≈2.681 USD/h**. EC no tiene cláusula expresa, pero cobra aparte los turnos y el personal extra (carta p.2), así que el piso es 1.456 USD/h. | No carga nada | NPT de movilización que anula el ahorro: PS ≈ 6,8 h por movilización (18.095/2.681); EC ≈ 12,7 h por movilización solo con taladro (18.451/1.456). Con las horas de la cotización (24 h), PS baja a ≈ 4,2 h. |
| Premisa J158: interpolar la nómina | J158, O147:O151, AF y AG | Aproximación | — | Matizar | La interpolación lineal equivale al valor esperado solo si los meses caen en dos enteros contiguos. El cargo fijo es escalonado por mes. Con meses discretos, el ahorro de PS salta de −119.377 (f = 4,3) a +46.103 (f = 4,4), así que un umbral único de "30 %" es precisión falsa. El sesgo tiene dirección indeterminada; lo correcto es simular con perfiles mensuales. | — | Corte discreto de PS ≈ 4,3–4,4 movilizaciones por mes (NPT ≈ 27–28 %) |

## 11. 5.7 Sensibilidad a demoras — J161:O169

| Sección | Celdas | ¿Bien hecha? | ¿Sirve? | Veredicto | Evidencia y corrección | Su número | Mi número |
|---|---|---|---|---|---|---|---|
| Demora sistemática en 0,1–5 km | K163:O166 | La aritmética sí (h × 20 × 1.456) | Sí, pero la fila de 6 h no es una sensibilidad: **es el caso base según la cotización** | **CORREGIR** | La Cot. p.1 da para 0–5 km 10 h de pre-movilización más 14 h de movilización: **24 h**, frente a las 18 h de C52. J169 lo admite. Las 24 h deben pasar a la base de toda la evaluación. Solo carga los 20 pozos de 0–5 km, lo cual está declarado y es correcto, porque misma localización da 12 h en ambos. Cargar solo taladro es correcto si la demora es atribuible al transportador (tarifa cerrada); si no lo es, aplica la cláusula 7 (sección 10). Hereda la sobreestimación de R133 y X133. | 6 h: PS 458.613 · EC 471.071 | 6 h con meses discretos: PS ≈ 395.500 (570.244 − 174.720); EC ≈ 458.400 si EC tiene los mismos tiempos (dato no disponible). Con el perfil de 2024 y horas de la cotización: PS 555.782 · EC 520.666. |

## 12. 5.8 Prueba de estrés del Lump Sum — J171:T186

| Sección | Celdas | ¿Bien hecha? | ¿Sirve? | Veredicto | Evidencia y corrección | Su número | Mi número |
|---|---|---|---|---|---|---|---|
| LS con el 50 % desde la 6ª | K175:T183, J185, J186 | La aritmética sí: P181 = 15×64.363,95 + 20×104.296,55 | Sí, como referencia lateral (LS con descuento) | **CORREGIR** | (a) El rótulo engaña: no es una "prueba de estrés", sino la lectura **más favorable** del LS. (b) Los insumos F25 y F51 no coinciden con la Cot. 1255 (sección 2). (c) Hereda los meses fraccionarios. (d) No muestra el LS **sin** descuento por frecuencia, que es la evaluación principal. La conclusión de J185 (LS por debajo de la ruta base) se sostiene aun con las tarifas de la cotización: LS con descuento en el perfil de 2024 da 587.181, frente a 730.502 de PS normal. | Q181 78.797 (2,5 %) · T181 554.536 | 6/mes discreto, insumos del Excel: LS con descuento 9.384. Con las tarifas de la Cot. 1255: LS sin descuento +278.971 a 6/mes y +322.627 con el perfil de 2024; LS con descuento +587.181 con el perfil de 2024. |

## 13. Celdas sueltas F155 y F156

| Sección | Celdas | ¿Bien hecha? | ¿Sirve? | Veredicto | Evidencia y corrección | Su número | Mi número |
|---|---|---|---|---|---|---|---|
| Valores sin rótulo | F155 = 8, F156 = 15 | No aplica | **No**: ninguna fórmula del libro las referencia (búsqueda de F155 y F156 en todas las celdas) | **DESCARTAR** | Posiblemente 8 = K8×2 (personas en plantilla, L8) y 15 = J16 (pozos en misma localización). Son restos de trabajo y pueden confundir. | 8 · 15 | Sin uso |

---

## Lista de hallazgos y dirección del sesgo

| # | Hallazgo | Sección | Dirección | Magnitud aprox. (USD, campaña de 35 pozos) |
|---|---|---|---|---|
| 1 | Los 20 pozos a otra localización se asumen todos en 0,1–5 km; los logs muestran 38–50 % en 5–10 y >10 km | 2, 5.5 | **Favorece tercerizado** | PS −134 k a −162 k; EC −192 k a −240 k (perfil 2024, mezcla 2024 o 2025) |
| 2 | 15 de 35 en misma localización (43 %), frente a 33 % y 24 % en los logs. Es dato de SierraCol, pero optimista | 2 | Favorece tercerizado (supuesto dado) | Con la mezcla completa de 2024: PS −161 k |
| 3 | Horas de C52 = 18 frente a 24 h cotizadas para 0–5 km (Cot. p.1); 5.7 lo trata como sensibilidad | 2, 5.5, 5.7 | **Favorece tercerizado** | −174.720 (PS; EC igual si tiene los mismos tiempos) |
| 4 | El Lump Sum (F25, F51, F77, F103) no coincide con la Cot. 1255 y está inflado | 2, 3, 5.8 | **Favorece WO** (y a PS normal frente a LS) | +441.153 de costo LS; el ahorro pasa de −118.526 a +322.627 |
| 5 | El resumen usa una base híbrida (TM a 6/mes sin descuento de la 6ª) | 3 | Favorece WO frente a 5.5 | Infravalora el ahorro: PS −84 k y EC −75 k frente a 6/mes discreto |
| 6 | 5.5 usa meses y cuota de descuento fraccionarios | 5.5 → 5.6, 5.7, 5.8 | **Favorece tercerizado** a 6/mes | PS +63 k, EC +13 k a 6/mes; a 4/mes, PS +31 k y EC +61 k |
| 7 | El titular a 5–7 movilizaciones por mes ("rango real"), mientras 2025 promedió 5,0 | 5.5 | **Favorece tercerizado** | Perfil 2025 frente a 5.5 con 6: PS −281 k · EC −218 k |
| 8 | La premisa J159 no carga taladro ni la cláusula 7 al NPT de movilización | 5.6 | **Favorece tercerizado** | ≈2.681 USD/h (PS) y ≥1.456 USD/h (EC). Unas 6,8 h por movilización anulan el ahorro de PS. |
| 9 | Nómina interpolada y umbral único de NPT de 30 % / 36 % | 5.6 | Neutro o indeterminado (precisión falsa) | El corte discreto oscila ±165 k entre f = 4,3 y 4,4 |
| 10 | EC 6ª+ en misma localización usa el valor de equipos de 0–5 km sin declararlo | 5.2 | Favorece tercerizado (frente a la lectura de tarifa plena) | ≈ −11,5 k (2,5 movilizaciones × 4.609) |
| 11 | EC 6ª+ factura "solo equipos" y omite el "personal operativo efectivamente utilizado" (carta p.4) | 5.1, 5.2 | **Favorece tercerizado** | No cuantificable con los insumos (señaleras y supervisión) |
| 12 | PS con 6 o más movilizaciones sin cargo fijo es una inferencia (p.4 termina en 5) | 5.3 | Favorece tercerizado si la lectura fuera otra | Hasta ≈ 239 k si persistiera el cargo fijo de 5 (40.953 × 5,83 meses) |
| 13 | J79 dice "mínimo 6 en PS" cuando la Cot. p.5 dice 5 | 5.1 | Neutro (el cálculo cobra el cargo fijo con 5, como p.4) | 0 (error de texto) |
| 14 | J55 cita el WO 3.107.890, que es el WO sin señalizadoras | 3 | Neutro (error de texto) | 22.297 |
| 15 | La explicación de J125 sobre el promedio SCM no se puede reproducir | Validación SCM | Neutro para el Excel; la tabla SCM favorecía a EC | 4.138 por movilización en la tabla SCM |
| 16 | TM fijo /6 en la zona 1 y el resumen, cuando es un cargo mensual | 3 | Indeterminado: favorece al tercerizado bajo 6/mes y al WO sobre 6/mes | Perfil 2025: PS −19 k; perfil 2024: +11 k |
| 17 | J138 dice que "por debajo de 5 pierde", falso para EC (X131 > 0); además "directo" está mal rotulado | 5.5 | Favorece WO (texto) | — |
| 18 | 5.8 lleva el rótulo de "estrés" pero es la lectura favorable al LS | 5.8 | Neutro (texto) | — |
| 19 | Recargo de señalizadoras a 2 turnos en tramos de 36 h | 1 | Favorece WO (hecho fijado por SierraCol) | 0 en la campaña; 405 por movilización en 5–10 y >10 km |
| 20 | PS cotiza hasta 20 km y los logs de 2024 tienen movilizaciones de 22,1 km | 5.2 | Indeterminado | Menor |

**Lectura del sesgo.** Los hallazgos de mayor magnitud empujan hacia el **tercerizado (PS normal y EC)**: 1, 2, 3, 6, 7, 8, 10, 11 y 12. Hacia el **WO** empujan sobre todo el 4, que solo afecta al Lump Sum, y el 5, que solo afecta al resumen y no a 5.5, la base real. Para PS normal y EC el sesgo es sistemático a favor del tercerizado. Con supuestos de los logs (mezcla y perfil de 2025) y las horas de la cotización, el ahorro de PS y EC cae a ~130–190 k, entre 4 y 6 %. La reconstrucción real de 2025 da PS 185 k y EC 177 k, y quedaría en cero o negativa con unas pocas horas de NPT de movilización.
