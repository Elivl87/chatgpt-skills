"""Motor de referencia del modelo de movilización (mismo cálculo que el simulador Excel).

Sirve para verificar el Excel celda contra celda y para correr sensibilidades.
Unidades: USD salvo donde dice COP. Rangos: 0=misma localización, 1=0,1-5 km, 2=5-10 km, 3=más de 10 km.
"""
from collections import Counter
from copy import deepcopy

OFERTAS = ["PS", "LS", "LSD", "EC"]  # Petro Star normal, Lump Sum sin desc., Lump Sum con desc., Ecotransur

BASE = {
    "trm": 3700.0,                                   # Excel E3
    "taladro_dia": 34944.0,                          # Excel E5
    "horas": [12, 18, 24, 28],                       # Excel C26, C52, C78, C104
    "horas_extra": [0, 0, 0, 0],                     # NPT de movilización (supuesto editable, 0)
    "tm_cop_mes": 60_000_000, "tm_movs_base": 6,     # Excel C29 = (60.000.000/E3)/6
    "tm_modo": "por_mov",                            # "por_mov" (Excel) o "mensual"
    "adic_base": 0.0, "adic_ls": 0.0, "adic_wo": 0.0,  # E7, E8 y simetría en el WO
    # Tarifas del transportador en COP (constantes de las fórmulas de las filas 25/51/77/103)
    "tarifa_cop": {
        "PS":  [140385441, 220853084, 238462998, 246462998],
        "LS":  [178363885, 304284690, 373649874, 414800928],
        "LSD": [178363885, 304284690, 373649874, 414800928],
        "EC":  [140233002, 207703002, 249003002, 253060002],
    },
    "desc_ps": 0.50, "desc_ls": 0.50,               # Cot. 1255 p.2: 50% desde la 6ª
    "eq_ec_cop": [123180000, 123180000, 139005000, 167055000],  # Ecotransur 6ª+ (misma loc = supuesto 0-5 km)
    "desde_desc": 6,
    # Cargo fijo mensual (nómina + disponibilidad/stand-by) en COP según movilizaciones del mes
    "fijo_ps_cop": [430000000 + 164780000, 327959522 + 166920000, 226825000 + 125190000,
                    174643162 + 83460000, 142153566 + 66768000, 93102391 + 58422000],  # 0..5; 6+ = 0
    "fijo_ec_cop": [717374835 + 120000000, 573899868 + 96000000, 430424901 + 72000000,
                    286949934 + 48000000, 143474967 + 24000000],                         # 0..4; 5+ = 0
    "meses_cero_cobran": False,                      # meses sin movilización = campaña parada (SierraCol)
    # Horas excedidas sobre el tiempo estipulado (Cot. 1255 p. 1–2: 12/24/36/36 h; Ecotransur: supuesto igual)
    "horas_estipuladas": [12, 24, 36, 36],
    "cobra_exceso": True,
    # Flota mínima por escenario (Cot. 1255 p. 1–2) a tarifa por hora (p. 5): 2 cabezotes/3 camas altas/1 cama baja (misma loc.)
    # o 4 cabezotes/1 cama alta/1 cama baja (demás), grúa 80 t, cargador, 2 camionetas, 4 torres (tarifa planta estadio), 2 baños
    "equipo_h_cop": [3934000, 3934000, 3934000, 3934000],
    "personal_h_cop": 20 * 54375,                    # 20 señalizadores a tarifa por hora (p. 5)
    "meses_bloqueados": 0,                           # meses sin poder mover con contrato vigente (bloqueo / operación)
    "bono_wo": 0.0,
    "horas_bloqueo": 0.0,                            # horas de bloqueo social/escolar durante movilizaciones en la campaña
                                                     # (OpenWells 2025: 22,25 h en 45 movs, fase 01MIRU). Proyección 35 pozos: 17,3 h                                  # bono del WO por mover más rápido (tabla WO por horas: pendiente)
    # Work Order
    "wo": [75642, 98663, 95374, 110174],
    "senal_pers_turno": 4, "senal_cop_turno": 375000, "senal_turnos": [1, 2, 2, 2], "senal_aplica": True,
}


def fijo_mes(p, oferta, n):
    tabla = p["fijo_ec_cop"] if oferta == "EC" else p["fijo_ps_cop"]
    if n == 0 and not p["meses_cero_cobran"]:
        return 0.0
    return (tabla[n] if n < len(tabla) else 0) / p["trm"]


def costo_mov(p, oferta, rango, k, horas=None):
    """Costo de una movilización tercerizada: k = número de la movilización dentro del mes."""
    trm = p["trm"]
    tarifa = p["tarifa_cop"][oferta][rango] / trm
    if k >= p["desde_desc"]:
        if oferta == "PS":
            tarifa *= 1 - p["desc_ps"]
        elif oferta == "LSD":
            tarifa *= 1 - p["desc_ls"]
        elif oferta == "EC":
            tarifa = p["eq_ec_cop"][rango] / trm
    adic = p["adic_ls"] if oferta in ("LS", "LSD") else p["adic_base"]
    h = p["horas"][rango] + p["horas_extra"][rango] if horas is None else horas
    tm = p["tm_cop_mes"] / trm / p["tm_movs_base"] if p["tm_modo"] == "por_mov" else 0.0
    exceso = max(0.0, h - p["horas_estipuladas"][rango]) * (p["equipo_h_cop"][rango] + p["personal_h_cop"]) / trm if p["cobra_exceso"] else 0.0
    return tarifa * (1 + adic) + h * p["taladro_dia"] / 24 + tm + exceso


def costo_wo(p, rango):
    senal = p["senal_pers_turno"] * p["senal_cop_turno"] * p["senal_turnos"][rango] / p["trm"] if p["senal_aplica"] else 0
    return p["wo"][rango] * (1 + p["adic_wo"] + p["bono_wo"]) + senal


def campana(p, movs, usar_horas_reales=False, desde_mes=None):
    """movs: lista ordenada de (mes, rango, horas_reales). Devuelve totales por modelo.
    desde_mes: primer mes de la campaña (proyección = 1). Por defecto, el primer mes con movilizaciones (campañas reales)."""
    por_mes = Counter(m for m, _, _ in movs)
    vistos = Counter()
    tot = {o: 0.0 for o in OFERTAS}
    tot["WO"] = 0.0
    for mes, r, h in movs:
        vistos[mes] += 1
        k = vistos[mes]
        hh = h if (usar_horas_reales and h is not None) else None
        for o in OFERTAS:
            tot[o] += costo_mov(p, o, r, k, hh)
        tot["WO"] += costo_wo(p, r)
    if p.get("vacios_internos_cobran", True) and por_mes:
        for mes in range(desde_mes or min(por_mes), max(por_mes) + 1):
            if mes not in por_mes:  # mes sin movilización dentro de la campaña (p. ej. por NPT): contrato vigente
                for o in OFERTAS:
                    tot[o] += (p["fijo_ec_cop"] if o == "EC" else p["fijo_ps_cop"])[0] / p["trm"]
    hb = p["horas_bloqueo"] * (p["taladro_dia"] / 24 + ((p["equipo_h_cop"][1] + p["personal_h_cop"]) / p["trm"] if p["cobra_exceso"] else 0))
    for o in OFERTAS:  # bloqueos durante la movilización: taladro + equipos (Cot. 1255 condición 7); el WO no paga
        tot[o] += hb
    for o in OFERTAS:  # meses bloqueados: no se puede mover pero el contrato sigue vigente
        tot[o] += p["meses_bloqueados"] * (p["fijo_ec_cop"] if o == "EC" else p["fijo_ps_cop"])[0] / p["trm"]
    for mes, n in por_mes.items():
        for o in OFERTAS:
            tot[o] += fijo_mes(p, o, n)
            if p["tm_modo"] == "mensual":
                tot[o] += p["tm_cop_mes"] / p["trm"]
    return tot


def proyeccion(n_misma=15, n_otra=20, rango_otra=1, frec=6.0, npt=0.0, perfil=None):
    """Campaña proyectada: intercala misma loc / otra loc de forma proporcional y asigna meses."""
    n = n_misma + n_otra
    movs = []
    # meses: acumulado de capacidad mensual efectiva
    cap = []
    m = 0
    acum = 0.0
    while acum < n - 1e-9:
        m += 1
        f = (perfil[(m - 1) % len(perfil)] if perfil else frec) * (1 - npt)
        acum += f
        cap.append(acum)
    for i in range(1, n + 1):
        es_misma = int(i * n_misma / n) > int((i - 1) * n_misma / n)
        mes = next(j + 1 for j, c in enumerate(cap) if c >= i - 1e-9)
        movs.append((mes, 0 if es_misma else rango_otra, None))
    return movs


def con(p=None, **cambios):
    q = deepcopy(p or BASE)
    q.update(cambios)
    return q
