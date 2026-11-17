# Simulador de Well Control

Simulador de control de pozos en una sola página (`well-control-sim.html`), en unidades de campo y para pozos verticales con BOP de superficie.

- El bloque entre `/*CORE-BEGIN*/` y `/*CORE-END*/` es el núcleo físico (`WCS`): no toca la pantalla, avanza con `WCS.step(dt)` y deja sus avisos en `S.ev`.
- El resto del script es la pantalla: mandos, lienzos, hoja de matar, modo examen.

## Pruebas

```
node tests/core.test.js          # núcleo: cuatro ejercicios completos + pruebas tNN de cada corrección
node tests/core.test.js --update # reescribe tests/baseline.json tras un cambio físico intencional
node tests/ui.test.js            # pantalla, con Chromium (Playwright): pruebas uNN
```

`core.test.js` compara cada corrida con `tests/baseline.json` y lista cualquier número que cambie.

## Límites conocidos del modelo

Pozos verticales con BOP de superficie; sin viajes ni conexiones (la sarta se mueve hasta 93 ft sobre el fondo); no se bombea por la línea de matar; la densidad del lodo cambia al instante; el gas pasa por el choke como un fluido de 2 ppg.
