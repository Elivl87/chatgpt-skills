# Evaluación de movilización del taladro: lump sum vs. tercerizado

Compara el modelo actual (lump sum con el contratista del taladro, por distancia y tiempo) con contratar
directamente a la empresa de transporte. Entregables: Excel con fórmulas vivas + PowerPoint.

## Pila de herramientas (decidida 12-oct-2026)
| Etapa | Herramienta | Uso |
|---|---|---|
| Construir el Excel | XlsxWriter, openpyxl | Fórmulas vivas, nombres definidos, validaciones, gráficos nativos; relectura |
| Validar el Excel | recalc.py (LibreOffice, skill xlsx), `formulas` | Cero errores y segundo motor de cálculo |
| Auditoría | audit-xls (`referencias/financial-services`) | Checklist: insumos vs cálculos, sin valores fijos |
| Riesgo | numpy/scipy + `tools/pert.py`, SALib | Monte Carlo PERT (P10/P50/P90, P(B<A)), ranking de variables |
| Factores cualitativos | AHPy | Pesos con razón de consistencia (se replican en Excel) |
| Finanzas | numpy-financial | VPN si hay flujos en el tiempo |
| Presentación | python-pptx, matplotlib, skill pptx | Gráficos nativos editables; matriz de riesgos |
| Control de calidad | LibreOffice → PDF → pdf2image, markitdown | Revisión visual y cruce de cifras deck vs Excel |

Referencias de estructura (solo consulta, en `referencias/`, no versionadas): RigGo (plantilla de cargas;
sin licencia, no copiar código), LandBOSSE (transporte, grúas, demoras por clima), Mck-ppt-design-skill.

Descartadas: betapert (no soporta Python 3.13; reemplazada por `tools/pert.py`), monaco (numpy basta),
xlwings/XLRisk (requieren Excel de escritorio; XLRisk queda como opción para el usuario).

## Uso
`./setup.sh` en una sesión nueva; luego `python3 tools/smoke_test.py <salida> <recalc.py>`.
Catálogo completo de 123 repos: `Catalogo_repositorios_movilizacion.xlsx`. Panel: `panel/`.
