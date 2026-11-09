"""Distribución PERT (Beta-PERT) de tres puntos: mínimo, más probable, máximo."""
import numpy as np
from scipy import stats


def pert(minimo, probable, maximo, lamb=4.0):
    """Devuelve una distribución scipy congelada PERT(min, moda, max)."""
    if not minimo <= probable <= maximo or minimo == maximo:
        raise ValueError("Se requiere minimo <= probable <= maximo y minimo < maximo")
    rango = maximo - minimo
    a = 1 + lamb * (probable - minimo) / rango
    b = 1 + lamb * (maximo - probable) / rango
    return stats.beta(a, b, loc=minimo, scale=rango)


def pert_media(minimo, probable, maximo, lamb=4.0):
    return (minimo + lamb * probable + maximo) / (lamb + 2)


def muestrear(minimo, probable, maximo, n, rng=None, lamb=4.0):
    rng = rng or np.random.default_rng()
    return pert(minimo, probable, maximo, lamb).rvs(size=n, random_state=rng)
