# Rig Inspection Pocket 2.1

Interfaz nueva de la referencia técnica offline de inspección de taladros.

- `src/` — interfaz: `index.html` (plantilla), `app.css` (sistema visual "Field Sheet"), `app.js` (router por hash, motor de búsqueda único, vistas).
- `build/extract.js` — extrae las capas de datos del archivo V2.0.
- `build/build.py` — limpia los datos (ediciones API, evidencias unificadas, títulos de página) y genera un único HTML offline.

El manual escaneado, el OCR y las fichas **no** están en este repositorio: se leen del archivo V2.0 original.

```bash
python3 build/build.py Rig_Inspection_Pocket_V2_0_OFFLINE.html <carpeta_fuentes_woff2> Rig_Inspection_Pocket_V2_1_OFFLINE.html
```

Fuentes (OFL, de `@fontsource`): Barlow Condensed 500/600/700, IBM Plex Sans 400/500/600, IBM Plex Mono 400/500 (subconjunto latin).
