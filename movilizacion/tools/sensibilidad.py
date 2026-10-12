"""Sensibilidades, puntos de quiebre y pendientes con el motor de referencia (mismo cálculo que el simulador).
Base fijada por SierraCol: campaña 15 misma loc. + 20 en 0,1–5 km, frecuencia esperada 5–6 movs/mes, TRM 3.700."""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from modelo import BASE, campana, proyeccion, con
from logs import leer

HB = round(22.25 * 35 / 45, 1)  # horas de bloqueo social/escolar en movilización (OpenWells 2025), escaladas a 35 pozos
BASE = con(BASE, horas_bloqueo=HB)

OF = {"PS": "Petro Star normal", "LS": "Petro Star Lump Sum", "EC": "Ecotransur"}
EQH = lambda p: (p["equipo_h_cop"][1] + p["personal_h_cop"]) / p["trm"]


def ahorro(p=None, frec=5.0, orden=None):
    p = p or BASE
    movs = proyeccion(frec=frec)
    if orden is not None:
        out = []
        for mes in sorted({m for m, _, _ in movs}):
            g = [x for x in movs if x[0] == mes]; g.sort(key=lambda x: (x[1] != 0) if orden else (x[1] == 0)); out += g
        movs = out
    t = campana(p, movs, desde_mes=1)
    return {o: t["WO"] - t[o] for o in OF}


def tornado(frec):
    b = ahorro(frec=frec)
    V = [
        ("Frecuencia mensual", "Premisa (5–6)", f"{frec:g}/mes", "6/mes", "5/mes", lambda: ahorro(frec=6), lambda: ahorro(frec=5)),
        ("Horas de taladro por movilización", "Dato Excel vs cotización", "Excel 12/18/24/28", "Excel 12/18/24/28", "Petro Star 12/24/36/36", lambda: b, lambda: ahorro(con(BASE, horas=[12, 24, 36, 36]), frec)),
        ("Sobretiempo en cada movilización (solo taladro)", "Medido (logs)", "0 h", "0 h", "+3,5 h", lambda: b, lambda: ahorro(con(BASE, horas_extra=[3.5] * 4), frec)),
        ("Horas por encima del tiempo estipulado (taladro + equipos)", "Medido (logs)", "0 h", "0 h", "+2 h sobre 12/24/36/36", lambda: b,
         lambda: ahorro(con(BASE, horas=[14, 26, 38, 38]), frec)),
        ("Bloqueo social/escolar durante movilizaciones (h por campaña)", "Medido (OpenWells 2025)", f"{HB:g} h", "0 h", f"{2*HB:g} h (el doble)", lambda: ahorro(con(BASE, horas_bloqueo=0), frec), lambda: ahorro(con(BASE, horas_bloqueo=2 * HB), frec)),
        ("Meses bloqueados (contrato vigente)", "Riesgo operativo", "0", "0", "1 mes", lambda: b, lambda: ahorro(con(BASE, meses_bloqueados=1), frec)),
        ("Bono del Work Order por mover más rápido", "Pendiente (tabla WO)", "0 %", "+5 % al WO", "0 %", lambda: ahorro(con(BASE, bono_wo=0.05), frec), lambda: b),
        ("NPT de perforación (baja la frecuencia)", "Sin dato: barrido", "0 %", "0 %", "20 %", lambda: b, lambda: ahorro(frec=frec * 0.8)),
        ("Tarifa del taladro", "Medido", "34.944 USD/día", "−10 %", "+10 %", lambda: ahorro(con(BASE, taladro_dia=34944 * 0.9), frec), lambda: ahorro(con(BASE, taladro_dia=34944 * 1.1), frec)),
        ("Truck Manager", "Premisa SierraCol", "por movilización", "por movilización", "60 M COP fijo por mes", lambda: b, lambda: ahorro(con(BASE, tm_modo="mensual"), frec)),
        ("Adicionales: ¿se cancelan entre modelos?", "Premisa SierraCol", "0 % / 0 %", "se cancelan", "+5 % solo en tercerizado", lambda: b, lambda: ahorro(con(BASE, adic_base=0.05, adic_ls=0.05), frec)),
        ("Recargo de señalizadoras al WO", "Premisa SierraCol", "se carga", "se carga", "no se carga", lambda: b, lambda: ahorro(con(BASE, senal_aplica=False), frec)),
        ("Cargo fijo de Petro Star con 5 movs/mes", "Medido (contradicción PDF)", "se cobra (p. 4)", "no se cobra", "se cobra", lambda: ahorro(con(BASE, fijo_ps_cop=BASE["fijo_ps_cop"][:5] + [0]), frec), lambda: b),
        ("Ecotransur 6ª+ en misma localización", "Supuesto", "equipos 0–5 km", "equipos 0–5 km", "tarifa plena", lambda: b, lambda: ahorro(con(BASE, eq_ec_cop=[140233002] + BASE["eq_ec_cop"][1:]), frec)),
        ("Orden de los pozos dentro del mes", "Supuesto", "intercalado", "misma loc. primero", "otra loc. primero", lambda: ahorro(frec=frec, orden=True), lambda: ahorro(frec=frec, orden=False)),
    ]
    rows = []
    for nombre, clase, base, ta, tb, fa, fb in V:
        a, c = fa(), fb()
        for o in OF:
            lo, hi = sorted([a[o], c[o]])
            rows.append({"variable": nombre, "clase": clase, "base": base, "oferta": o, "base_usd": b[o], "favorable_usd": hi, "desfavorable_usd": lo,
                         "favorable_txt": ta if a[o] >= c[o] else tb, "desfavorable_txt": tb if a[o] >= c[o] else ta, "efecto_usd": hi - lo})
    return b, rows


def frecuencias():
    out = []
    for f in (4, 4.5, 5, 5.5, 6, 6.5, 7, 8):
        a = ahorro(frec=f); h = ahorro(con(BASE, horas=[12, 24, 36, 36]), f)
        out.append([f, a["PS"], a["LS"], a["EC"], h["PS"], h["LS"], h["EC"]])
    return out


def quiebres():
    out = []
    for f in (5, 6):
        b = ahorro(frec=f); p = BASE
        for o in ("PS", "EC"):
            S = b[o]; fijo0 = (p["fijo_ec_cop"] if o == "EC" else p["fijo_ps_cop"])[0] / p["trm"]
            out.append([f, OF[o], S, S / 35, S / 35 / 550000, S / (35 * 1456), S / (35 * (1456 + EQH(p))), S / 34944, S / fijo0, S / (1456 + EQH(p))])
    return out


def reales():
    out = {}
    for y in (2024, 2025):
        L = leer(os.path.join(os.path.dirname(__file__), "..", "insumos", f"Movilizaciones_{y}.xlsx"))
        movs = [(m["mes"], m["rango"], m["horas"]) for m in L]
        P0 = con(BASE, horas_bloqueo=0)
        a = campana(P0, movs); r0 = campana(con(P0, cobra_exceso=False), movs, usar_horas_reales=True); r1 = campana(P0, movs, usar_horas_reales=True)
        exc = [m for m in L if m["horas"] and m["horas"] > BASE["horas_estipuladas"][m["rango"]]]
        hx = sum(m["horas"] - BASE["horas_estipuladas"][m["rango"]] for m in exc)
        out[str(y)] = {"excel": {o: a["WO"] - a[o] for o in OF}, "reales_sin_equipos": {o: r0["WO"] - r0[o] for o in OF},
                       "reales_con_equipos": {o: r1["WO"] - r1[o] for o in OF}, "movs_exceden": len(exc), "horas_excedidas": hx,
                       "equipos_usd": hx * EQH(BASE), "taladro_usd": hx * 1456}
    return out


def pendientes():
    out = []
    for f in (5, 6):
        b = ahorro(frec=f)
        it = {"horas_ps": ahorro(con(BASE, horas=[12, 24, 36, 36]), f), "LS_pdf": ahorro(con(BASE, tarifa_cop={**BASE["tarifa_cop"], "LS": [140385441, 251155192, 311369322, 346822484]}), f),
              "fijo5": ahorro(con(BASE, fijo_ps_cop=BASE["fijo_ps_cop"][:5] + [0]), f), "ec_misma": ahorro(con(BASE, eq_ec_cop=[140233002] + BASE["eq_ec_cop"][1:]), f),
              "tm_mensual": ahorro(con(BASE, tm_modo="mensual"), f), "adic5": ahorro(con(BASE, adic_base=0.05, adic_ls=0.05), f), "senal_no": ahorro(con(BASE, senal_aplica=False), f),
              "bloqueo": ahorro(con(BASE, meses_bloqueados=1), f), "bono5": ahorro(con(BASE, bono_wo=0.05), f), "npt20": ahorro(frec=f * 0.8)}
        t = campana(BASE, proyeccion(frec=f), desde_mes=1)
        it["LS_desc"] = {**b, "LS": t["WO"] - t["LSD"]}
        out.append({"frec": f, "base": b, **{k: {o: v[o] - b[o] for o in OF} for k, v in it.items()}})
    return out


if __name__ == "__main__":
    res = {}
    for f in (5, 6):
        b, rows = tornado(f); res[str(f)] = {"base": b, "rows": rows}
    res["frecuencias"] = frecuencias(); res["quiebres"] = quiebres(); res["reales"] = reales(); res["pendientes"] = pendientes()
    res["mes_bloqueado_usd"] = {"PS": BASE["fijo_ps_cop"][0] / BASE["trm"], "EC": BASE["fijo_ec_cop"][0] / BASE["trm"]}
    res["horas_bloqueo"] = HB
    res["hora_exceso_usd"] = {"transportador": EQH(BASE), "taladro": 1456.0, "total": EQH(BASE) + 1456}
    json.dump(res, open(sys.argv[1], "w"), indent=1, ensure_ascii=False, default=float)
    for f in ("5", "6"):
        print("== frec", f, {o: round(v) for o, v in res[f]["base"].items()})
    for r in res["quiebres"]: print("quiebre", [round(x, 2) if isinstance(x, float) else x for x in r])
    for y, v in res["reales"].items(): print(y, {k: ({o: round(x) for o, x in w.items()} if isinstance(w, dict) else round(w, 1)) for k, w in v.items()})
