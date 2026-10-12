"""Sensibilidades y pendientes con el motor de referencia (mismo cálculo que el simulador)."""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from modelo import BASE, campana, proyeccion, con

P24 = [7, 8, 7, 7, 7, 9, 7, 3, 6, 6, 3]; P25 = [1, 4, 7, 5, 6, 7, 7, 5, 3]
OF = {"PS": "Petro Star normal", "LS": "Petro Star Lump Sum", "EC": "Ecotransur"}


def reordenar(movs, misma_primero):
    out = []
    for mes in sorted({m for m, _, _ in movs}):
        grupo = [x for x in movs if x[0] == mes]
        grupo.sort(key=lambda x: (x[1] != 0) if misma_primero else (x[1] == 0))
        out += grupo
    return out


def ahorro(p=None, perfil=P24, rango_otra=1, npt=0.0, orden=None, extra_ps_cop=None):
    p = p or BASE
    movs = proyeccion(rango_otra=rango_otra, npt=npt, perfil=perfil)
    if orden is not None:
        movs = reordenar(movs, orden)
    t = campana(p, movs)
    if extra_ps_cop:  # adicionales requeridos de PS normal cobrados aparte (Cot. 1255, azul)
        t["PS"] += sum(extra_ps_cop[r] / p["trm"] for _, r, _ in movs)
    return {o: t["WO"] - t[o] for o in OF}


def var(nombre, clase, base_txt, a_txt, b_txt, fa, fb):
    return {"variable": nombre, "clase": clase, "base": base_txt, "a": a_txt, "b": b_txt, "fa": fa, "fb": fb}


def tornado(perfil):
    b = ahorro(perfil=perfil)
    V = [
        var("Frecuencia mensual (perfil del log)", "Medido", "perfil del año", "perfil 2024", "perfil 2025",
            lambda: ahorro(perfil=P24), lambda: ahorro(perfil=P25)),
        var("Rango de los 20 pozos en otra localización", "Supuesto", "0,1–5 km", "0,1–5 km", "5–10 km",
            lambda: ahorro(perfil=perfil, rango_otra=1), lambda: ahorro(perfil=perfil, rango_otra=2)),
        var("Rango de los 20 pozos (extremo lejano)", "Supuesto", "0,1–5 km", "0,1–5 km", "más de 10 km",
            lambda: ahorro(perfil=perfil, rango_otra=1), lambda: ahorro(perfil=perfil, rango_otra=3)),
        var("Horas de taladro por movilización", "Medido vs dato Excel", "Excel 12/18/24/28", "Excel 12/18/24/28", "Petro Star 12/24/36/36",
            lambda: b, lambda: ahorro(con(horas=[12, 24, 36, 36]), perfil)),
        var("Sobretiempo por movilización (todas)", "Medido (log)", "0 h", "0 h", "+3,5 h (sobretiempo medio misma loc. 2025)",
            lambda: b, lambda: ahorro(con(horas_extra=[3.5] * 4), perfil)),
        var("NPT de perforación (baja la frecuencia)", "Sin dato: barrido", "0 %", "0 %", "20 %",
            lambda: b, lambda: ahorro(perfil=perfil, npt=0.20)),
        var("TRM", "Medido", "3.700", "4.070 (+10 %)", "3.330 (−10 %)",
            lambda: ahorro(con(trm=4070), perfil), lambda: ahorro(con(trm=3330), perfil)),
        var("Tarifa del taladro", "Medido", "34.944 USD/día", "31.450 (−10 %)", "38.438 (+10 %)",
            lambda: ahorro(con(taladro_dia=34944 * 0.9), perfil), lambda: ahorro(con(taladro_dia=34944 * 1.1), perfil)),
        var("Truck Manager", "Premisa SierraCol", "2.702,70 USD por mov.", "por movilización", "60 M COP fijo por mes",
            lambda: b, lambda: ahorro(con(tm_modo="mensual"), perfil)),
        var("Adicionales: ¿se cancelan entre modelos?", "Premisa SierraCol", "0 % / 0 %", "se cancelan", "+5 % solo en tercerizado",
            lambda: b, lambda: ahorro(con(adic_base=0.05, adic_ls=0.05), perfil)),
        var("Recargo de señalizadoras al WO", "Premisa SierraCol", "se carga", "se carga", "no se carga",
            lambda: b, lambda: ahorro(con(senal_aplica=False), perfil)),
        var("Cargo fijo de Petro Star con 5 movs/mes", "Medido (contradicción PDF)", "se cobra (p. 4)", "no se cobra (mínimo 5)", "se cobra",
            lambda: ahorro(con(fijo_ps_cop=BASE["fijo_ps_cop"][:5] + [0]), perfil), lambda: b),
        var("Ecotransur 6ª+ en misma localización", "Supuesto", "equipos 0–5 km", "equipos 0–5 km", "tarifa plena",
            lambda: b, lambda: ahorro(con(eq_ec_cop=[140233002] + BASE["eq_ec_cop"][1:]), perfil)),
        var("Orden de los pozos dentro del mes", "Supuesto", "intercalado", "otra loc. primero", "misma loc. primero",
            lambda: ahorro(perfil=perfil, orden=False), lambda: ahorro(perfil=perfil, orden=True)),
        var("Petro Star normal: equipos adicionales requeridos cobrados aparte", "Riesgo de oferta", "no se cobran", "no se cobran", "se cobran (Cot. 1255, azul)",
            lambda: b, lambda: ahorro(perfil=perfil, extra_ps_cop=[0, 30302108, 72906324, 100359486])),
    ]
    rows = []
    for v in V:
        fa, fb = v.pop("fa")(), v.pop("fb")()
        for o in OF:
            lo, hi = sorted([fa[o], fb[o]])
            rows.append({**v, "oferta": o, "base_usd": b[o], "favorable_usd": hi, "desfavorable_usd": lo,
                         "favorable_txt": v["a"] if fa[o] >= fb[o] else v["b"], "desfavorable_txt": v["b"] if fa[o] >= fb[o] else v["a"],
                         "efecto_usd": hi - lo})
    return b, rows


def pendientes():
    out = []
    for nombre, perfil in (("2024", P24), ("2025", P25)):
        b = ahorro(perfil=perfil)
        items = {
            "LS_pdf": ahorro(con(tarifa_cop={**BASE["tarifa_cop"], "LS": [140385441, 251155192, 311369322, 346822484]}), perfil),
            "LS_desc": {o: v for o, v in campana_ls_desc(perfil).items()},
            "fijo5": ahorro(con(fijo_ps_cop=BASE["fijo_ps_cop"][:5] + [0]), perfil),
            "horas_ps": ahorro(con(horas=[12, 24, 36, 36]), perfil),
            "ps_adic": ahorro(perfil=perfil, extra_ps_cop=[0, 30302108, 72906324, 100359486]),
            "ec_misma": ahorro(con(eq_ec_cop=[140233002] + BASE["eq_ec_cop"][1:]), perfil),
            "tm_mensual": ahorro(con(tm_modo="mensual"), perfil),
            "adic5": ahorro(con(adic_base=0.05, adic_ls=0.05), perfil),
            "rango_5_10": ahorro(perfil=perfil, rango_otra=2),
            "rango_10": ahorro(perfil=perfil, rango_otra=3),
            "senal_no": ahorro(con(senal_aplica=False), perfil),
        }
        out.append({"perfil": nombre, "base": b, **{k: {o: v[o] - b[o] for o in OF} for k, v in items.items()}})
    return out


def campana_ls_desc(perfil):
    t = campana(BASE, proyeccion(perfil=perfil))
    b = ahorro(perfil=perfil)
    return {"PS": 0.0, "LS": (t["WO"] - t["LSD"]) - b["LS"] + b["LS"], "EC": 0.0} | {"LS": t["WO"] - t["LSD"]}


if __name__ == "__main__":
    res = {}
    for nombre, perfil in (("2024", P24), ("2025", P25)):
        b, rows = tornado(perfil)
        res[nombre] = {"base": b, "rows": rows}
    pend = pendientes()
    # pendiente: un mes parado con contrato vigente
    trm = BASE["trm"]
    res["mes_parado_usd"] = {"PS": BASE["fijo_ps_cop"][0] / trm, "EC": BASE["fijo_ec_cop"][0] / trm}
    res["pendientes"] = pend
    json.dump(res, open(sys.argv[1], "w"), indent=1, ensure_ascii=False, default=float)
    for nombre in ("2024", "2025"):
        print("== perfil", nombre, {o: round(v) for o, v in res[nombre]["base"].items()})
        for o in OF:
            rr = sorted([r for r in res[nombre]["rows"] if r["oferta"] == o], key=lambda r: -r["efecto_usd"])
            print(" ", o)
            for r in rr[:15]:
                print(f"    {r['variable'][:52]:52s} fav {r['favorable_usd']:>11,.0f} ({r['favorable_txt'][:22]:22s}) desf {r['desfavorable_usd']:>11,.0f} ({r['desfavorable_txt'][:26]})")
    print("mes parado", {k: round(v) for k, v in res["mes_parado_usd"].items()})
    for p in pend:
        print("pend", p["perfil"], {k: {o: round(x) for o, x in v.items()} for k, v in p.items() if k not in ("perfil",)})
