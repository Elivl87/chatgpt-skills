#!/usr/bin/env bash
# Reconstruye el entorno de la evaluación de movilización en una sesión nueva.
set -euo pipefail
cd "$(dirname "$0")"
pip install -q -r requirements.txt
mkdir -p referencias
for r in anthropics/financial-services likaku/Mck-ppt-design-skill juansecorreapaez/RigGo NLRWindSystems/LandBOSSE; do
  d="referencias/$(basename "$r")"
  [ -d "$d" ] || git clone -q --depth 1 "https://github.com/$r.git" "$d"
done
echo "Entorno listo. Prueba: python3 tools/smoke_test.py <carpeta_salida> <ruta a recalc.py de la skill xlsx>"
