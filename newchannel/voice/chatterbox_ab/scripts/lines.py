"""Test lines for the Chatterbox vs Kokoro A/B (exact words of the locked SCRIPT_ES419.md).
tts = the text sent to the TTS (same as production build_voice.py OPTS); opt = Kokoro production options."""
LINES = [
    # id, speaker, script text, tts text, kokoro opts (from build_voice.OPTS)
    ("N1", "narrator", "Una carretera despejada. Allá adelante, un conductor toca el freno. Una sola vez.",
     "Una carretera despejada. Allá adelante, un conductor toca el freno. Una sola vez.", {}),
    ("N2", "narrator", "Lo que importa es cuántos autos hay en cada tramo de pista: los ingenieros le dicen densidad.",
     "Lo que importa es cuántos autos hay en cada tramo de pista: los ingenieros le dicen densidad.", {}),
    ("E1", "eli", "¡¿Quién fue?!", "¡¿Quién fue?!", {"speed": 1.05, "semitones": 1}),
    ("E2", "eli", "…Fue el viento.", "…Fue el viento.", {"speed": 0.9}),
    ("E3", "eli", "¡Hay un hueco! ¡Un hueco enorme!", "¡Hay un hueco! ¡Un hueco enorme!", {"speed": 1.15}),
    ("M1", "mila", "Eli… va para atrás.", "Eli. Va para atrás.", {"tts": "Eli. Va para atrás.", "speed": 0.95}),
    ("M2", "mila", "Ese hueco es mi amigo.", "Ese hueco es mi amigo.", {"speed": 0.92}),
    ("M3", "mila", "Fuiste tú.", "Fuiste tú.", {"speed": 0.92}),
]
MILA_REF_TEXT = ("Esta es la parte favorita de Mila. En otra prueba no hubo computadora. Solo un conductor entrenado, "
                 "con un único número: la velocidad promedio.")
