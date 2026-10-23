# Brief de grabación para el Productor · voz del narrador con emoción · 2026-10-23

**Por qué:** Chatterbox clona en "cero disparos": no aprende tu voz, la **imita escuchando la referencia en cada frase**.
Copia el timbre, pero también **la forma de decir**: el ritmo, la energía, cuánto sube y baja la melodía. La toma actual
(`voice/producer/producer_reference_clean.flac`, 19,6 s) está leída con calma y bajito, y por eso la narración salió plana,
"sin empatía". La dirección por frase (`direction.py`) ayuda, pero **la referencia viva es la palanca más grande**: una
toma contada con ganas vale más que cualquier ajuste.

## Qué grabar (4 clips, ~2,5 minutos en total)

### 1 · La toma principal: 60-90 s contando una historia emocionante a un amigo
Lee el gancho del guion (abajo) **como si le contaras a un amigo algo que te pasó hoy y todavía no te lo crees**. No es
locución: es conversación con chispa.
- **Sonríe mientras hablas** (se oye). Sube la voz en lo que sorprende, bájala para los secretos ("Apenas un poquito.").
- **Pausas de verdad** antes del remate (medio segundo de silencio antes de "…Eli." o de "la razón ya se fue a cenar").
- Varía la velocidad: rápido cuando la cosa se acelera ("Más fuerte. Más fuerte…"), lento cuando frenas ("Vamos más despacio.").
- Las frases cortas, con intención: "Una sola vez." (seco), "Pero allá no hay nada." (sorprendido), "Es una ola." (remate).
- Si te trabas, **no pares**: respira y repite la frase; recortamos después. Mejor dos o tres tomas completas y escogemos.

Texto sugerido (del guion bloqueado; puedes cambiar el orden, lo que importa es cómo lo cuentas):

> Una carretera despejada. Allá adelante, un conductor toca el freno. Una sola vez. Apenas un poquito.
> Detrás, cada auto frena un poco más fuerte que el anterior. Más fuerte. Más fuerte… hasta que alguien se queda quieto: Eli.
> Eli está seguro: alguien allá adelante tiene la culpa. Pero allá no hay nada. Ni choque, ni conos, ni semáforo.
> Mila, su amiga, mira atrás. Entonces, ¿por qué hay embotellamientos sin razón aparente?
> Vamos más despacio. Estiremos el círculo hasta volverlo una línea recta. El primer conductor toca el freno. El segundo lo
> nota un instante tarde. En ese instante ya se acercó, así que tiene que frenar un poco más fuerte. El tercero, más tarde y
> más fuerte todavía. Para el auto número diez: alto total.
> Ese conductor ya llegó a su casa. Seguro ya está cenando. Por eso no ves ninguna razón: la razón ya se fue a cenar.

### 2 · Tres clips de estado de ánimo, 15 s cada uno (para elegir la referencia por tramo)
Con estos podemos darle a cada beat la referencia que le toca (gancho = entusiasmado, misterio = intrigado, explicación = tranquilo).

| Clip | Cómo | Texto sugerido |
|---|---|---|
| **Entusiasmado** | como si acabaras de descubrir algo y quisieras que lo vean ya; voz arriba, rápido, sonrisa grande | "¡Mira esto! Una ola de luces rojas viaja hacia atrás por toda la autopista. Nadie la empujó. Nadie la planeó. Y sin embargo, ahí va, a veinte por hora, como una bicicleta." |
| **Intrigado** | como contando un misterio en voz medio baja, con pausas, cejas arriba | "Y aquí viene lo raro… Allá adelante no hay nada. Ni choque, ni conos, ni semáforo. Entonces, ¿quién frenó? Nadie lo sabe. Ni siquiera el que frenó." |
| **Tranquilo** | como explicándole algo con cariño a alguien que no entiende; lento, cálido, sin prisa | "Vamos más despacio. Un espacio libre es un amortiguador: se come el frenazo antes de que llegue a los demás. Ser paciente no es ir lento. Es ir al promedio." |

## Cómo grabar (lo técnico, en corto)
- **El celular sirve.** App de grabadora normal, formato WAV o M4A a la máxima calidad; **sin** "reducción de ruido", "modo voz",
  "mejora de audio" ni filtros (la toma anterior traía una puerta de ruido que corta los silencios). Nada de Bluetooth ni WhatsApp.
- **Cuarto chico y callado**, con cosas blandas (cortinas, cama, ropa en el clóset), puerta cerrada; apaga ventilador / aire /
  nevera cercana. Nada de baño, cocina ni cuarto vacío (eco).
- Celular a **un palmo de la boca (15-20 cm)**, un poco de lado, quieto (en un soporte o apoyado): no lo muevas ni lo toques.
- Nivel: habla con la energía real de la historia; que no sature (si la app marca rojo, aléjate 5 cm). Mejor fuerte que susurrado.
- Antes de empezar, **2 segundos de silencio** y luego arranca. Al final, otros 2 segundos.
- De pie o sentado derecho, con el guion a la altura de los ojos (si bajas la cabeza, la voz se apaga).
- Graba cada clip en un archivo aparte y mándalos tal cual (sin recortar ni "limpiar"): nosotros los preparamos.

## Qué NO hace falta
- No hace falta "voz de locutor" ni leer perfecto: los tropiezos se cortan. Lo que no se puede fabricar después es la **emoción**.
- No hace falta más de 90 s por toma: el clon usa sobre todo **los primeros 10 segundos**, así que **arranca con energía**, no
  calientes al principio del clip.

Con esto rehacemos el clon (variante A2 del informe `NOTES.md` muestra ya el efecto de una referencia más viva) y
re-renderizamos el episodio completo con la dirección por frase (`build_voice_cb.py --direction --voice-characters`).
