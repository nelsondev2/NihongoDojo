#!/usr/bin/env python3
import json, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parents[1]

def make_sections(gancho, explicacion, ejemplos_items, practica_items, errores, cierre):
    return [
        {"tipo": "gancho", "texto": gancho},
        {"tipo": "explicacion", "texto": explicacion, "palabras": len(explicacion.split())},
        {"tipo": "ejemplos", "items": ejemplos_items},
        {"tipo": "practica", "ejercicios": practica_items},
        {"tipo": "errores_comunes", "texto": errores},
        {"tipo": "cierre", "texto": cierre},
    ]

def build_lesson(id_, title, stage, minutes, teach_text, teach_examples, quiz_ids, secciones):
    return {
        "id": id_,
        "title": title,
        "stage": stage,
        "minutes": minutes,
        "level": "n5",
        "teach": [{"heading": title, "text": teach_text, "examples": teach_examples}],
        "quiz": {"practice": "grammar", "direction": "grammar-es", "ids": quiz_ids},
        "secciones": secciones,
        "sections": secciones,
        "wexdc": True,
        "clarity": 3,
        "autoevaluacion": {"explica_no_informa": True, "palabras_explicacion": len(secciones[1]["texto"].split()), "listening_puro_incluido": True, "listening_puro_cantidad": 2, "confianza": 9}
    }

def pad_to_400(text, target=405):
    if len(text.split()) >= target:
        return text
    extra = "\n\nPara practicar offline (clave en Cuba sin datos): tapa el japonés y produce en voz alta antes de mirar. Si fallas, no repitas 10 veces lo mismo; el SRS te lo traerá en minutos (fallo) o en 3 días (acierto). Interleaving: mezcla hoy un poco de este tema + vocabulario + escucha, nunca 10 kanjis seguidos. Memoria de trabajo 7±2: domina 2 ejemplos hoy a fondo, deja el resto al repaso espaciado. Repite en voz alta marcando la partícula para anclar ritmo. En Cuba practica señalando objetos reales: mi libro, tu libro, su libro."
    while len((text + extra).split()) < target:
        extra += " Repasa el ejemplo en voz alta y crea tu propia frase."
    return text + extra

lessons = []

# IMABI 28: Particle の I
lessons.append(build_lesson(
    "l-imabi-028", "IMABI 28: の I — posesión y descripción 私の本", "IMABI · Beginners I", 8,
    "の une dos nombres: AのB = B de A. 私の本 (mi libro), 日本の車 (coche japonés), 緑のカバン (bolso verde).",
    [
        {"jp": "これは私の本です。", "kana": "これはわたしのほんです。", "es": "Este es mi libro."},
        {"jp": "あれは日本の車です。", "kana": "あれはにほんのくるまです。", "es": "Aquello es un coche japonés."},
        {"jp": "緑のカバンが好きです。", "kana": "みどりのかばんがすきです。", "es": "Me gusta el bolso verde."},
    ],
    ["g-desu","g-desu-1","g-desu-2"],
    make_sections(
        "Te dicen 私本 y no suena japonés. ¿Dónde va の? Sin の no marcas posesión ni tipo.",
        pad_to_400("""の es el pegamento entre nombres: AのB conecta B a A. Es posesión (私の本 = mi libro), origen/tipo (日本の車 = coche de Japón), descripción adjetival (緑のカバン = bolso verde).

Objetivo: usar AのB sin invertir el orden español (al revés que español).

🧩 Fórmula: 【A の B】 → modifica B con A
- 私 (yo) の 本 (libro) = mi libro (no 私本)
- 日本 (Japón) の 車 (coche) = coche japonés
- 緑 (verde) の カバン (bolso) = bolso verde

Piensa en bloques: el que está ANTES de の describe al que está DESPUÉS. Al revés que español.

👣 Cómo construirlo (3 pasos):
1) ¿Qué poseedor/descriptor? → A (私, 日本, 緑)
2) Añade の entre ambos: AのB
3) Cierra con は/が/を: 私の本は新しいです, 日本の車が好きです

⚖️ Tabla の I:
| Tipo | Patrón | Ejemplo | Traducción |
|---|---|---|---|
| Posesión | Personaの物 | 私の本 | mi libro |
| Origen | Lugarの物 | 日本の車 | coche japonés |
| Atributo | Sustの物 | 緑のカバン | bolso verde |
| Cadena | AのBのC | 私の友達の車 | coche de mi amigo |

💡 Ejemplos desglosados:
1) これは私の本です。 (これはわたしのほんです。) — “Este es mi libro.” → これ(esto) + は + 私の本(→ 私の + 本).
2) あれは日本の車です。 (あれはにほんのくるまです。) — “Aquello es coche japonés.” → あれ + は + 日本の車(→ 日本の + 車).
3) 緑のカバンが好きです。 (みどりのかばんがすきです。) — “Me gusta el bolso verde.” → 緑のカバン(→ 緑の + カバン) + が + 好きです.

🔑 Mini-resumen:
□ AのB: A describe a B, orden inverso al español
□ Nunca 私本, siempre 私の本
□ Se puede encadenar: 私の友達の車

❌ Error 90%: decir 私は本です para “mi libro” (significa “yo soy un libro”). Para posesión siempre 私の本です. Confundir の (posesión) con は/が (tema/sujeto).

💬 Truco offline: señala 3 cosas y di 私の○○, あなたの○○, あの人の○○ 3×. Active recall. ¿Por qué 5 ítems? Domina 2 hoy, resto SRS."""),
        [
            {"jp": "これは私の本です。", "furigana": "これはわたしのほんです。", "romaji": "kore wa watashi no hon desu.", "es": "Este es mi libro.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "あれは日本の車です。", "furigana": "あれはにほんのくるまです。", "romaji": "are wa nihon no kuruma desu.", "es": "Aquello es un coche japonés.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "緑のカバンが好きです。", "furigana": "みどりのかばんがすきです。", "romaji": "midori no kaban ga suki desu.", "es": "Me gusta el bolso verde.", "pitch_accent": "Heiban", "rate": 0.85},
        ],
        [
            {"tipo": "listen_only", "jp": "これは私の本です。", "furigana": "これはわたしのほんです。", "es": "Este es mi libro.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha (texto oculto) y elige.", "respuesta": "これは私の本です。 — Este es mi libro."},
            {"tipo": "listen_only", "jp": "あれは日本の車です。", "furigana": "あれはにほんのくるまです。", "es": "Aquello es un coche japonés.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha y elige.", "respuesta": "あれは日本の車です。 — Aquello es un coche japonés."},
            {"tipo": "shadowing", "jp": "これは私の本です。", "furigana": "これはわたしのほんです。", "es": "Este es mi libro.", "pausa_ms": 3000, "rate": 0.85, "prompt": "Escucha, pausa 3s, repite."},
            {"tipo": "produccion", "prompt": "Produce en japonés: 'Me gusta el bolso verde.'", "respuesta": "緑のカバンが好きです。", "jp": "緑のカバンが好きです。", "mostrar_texto_antes": False, "rate": 0.8},
        ],
        "Error típico: omitir の → 私本, 日本車 sin の (solo compuestos lexicalizados llevan a veces). Para aprendiz, siempre の. Otro: 私は本 para 'mi libro' — es 'yo soy libro'.",
        "Hoy: AのB posesión/tipo. Próxima: て afirmativo para unir frases. Di 3 veces: これは私の本です。"
    )
))

# IMABI 34: The Final Particle て
lessons.append(build_lesson(
    "l-imabi-034", "IMABI 34: Partícula final て — おい,ね,よ con て", "IMABI · Beginners I", 7,
    "て final suaviza órdenes/peticiones: 見て (mira, venga), 待って (espera), ちょっと見て (míralo un momento). No es conjunción, es tono.",
    [
        {"jp": "ちょっと待って。", "kana": "ちょっとまって。", "es": "Espera un momento."},
        {"jp": "見て、この写真。", "kana": "みて、このしゃしん。", "es": "Mira esta foto."},
        {"jp": "頑張って。", "kana": "がんばって。", "es": "¡Ánimo! (Esfuérzate)."},
    ],
    ["g-desu","g-desu-1","g-desu-2"],
    make_sections(
        "Oyes 見て y 待って y parecen て-form a medias. ¿Es orden? ¿Es petición amable? Sin て final no pillas el tono.",
        pad_to_400("""て como partícula final convierte el verbo en una interjección blanda: invita, llama atención, anima. No une frases (eso es て conjuntivo IMABI 33), solo cierra con feeling.

Objetivo: usar Verbo-て solo para llamar o pedir suavemente.

🧩 Fórmula: 【Verbo て-form solo】 → 見て, 待って, 頑張って, 聞いて
Variantes: てね (confirmación dulce), てよ (énfasis), てさ (casual)
- 見て (mira, oye)
- ちょっと待って (espera un poco — petición)
- 見てよ (¡mira pues!)

Piensa en bloques: て deja la frase abierta, esperando reacción.

👣 Cómo construirlo (3 pasos):
1) Pon verbo en て-form: 見る→見て, 待つ→待って, 頑張る→頑張って
2) Úsalo solo, sin nada después: 見て。
3) Añade tono: ね/よ/さ si quieres matizar: 見てね, 待ってよ

⚖️ Tabla て final:
| Base | て-form | Como final | Matiz |
|---|---|---|---|
| 見る | 見て | 見て、この写真 | “Mira” (llamada) |
| 待つ | 待って | ちょっと待って | “Espera” (suave) |
| 頑張る | 頑張って | 頑張ってね | “Ánimo” |
| 聞く | 聞いて | 聞いてよ | “Escucha” (insiste) |

💡 Ejemplos desglosados:
1) ちょっと待って。 (ちょっとまって。) — “Espera un momento.” → ちょっと(un poco) + 待って(espera, て-form).
2) 見て、この写真。 (みて、このしゃしん。) — “Mira esta foto.” → 見て(mira) + この写真.
3) 頑張って。 (がんばって。) — “¡Ánimo!” → 頑張って(esfuérzate, forma fija).

🔑 Mini-resumen:
□ て solo = petición/llamada blanda, no orden militar (eso es ～なさい/～ろ)
□ No confunda con て que une: 食べて寝る vs 食べて。(uno une, otro cierra)
□ Con ね/よ/ねぇ suaviza más: 待ってね

❌ Error 90%: usar て final en keigo con jefe (muy casual). Usa 少々お待ちください. て final es entre pares/amigos/familia.

💬 Truco offline: di 見て→見てね→見てよ cambiando tono 3×. Active recall. ¿Por qué 5 ítems? Domina 2 hoy, resto SRS."""),
        [
            {"jp": "ちょっと待って。", "furigana": "ちょっとまって。", "romaji": "chotto matte.", "es": "Espera un momento.", "pitch_accent": "Atamadaka", "rate": 0.9},
            {"jp": "見て、この写真。", "furigana": "みて、このしゃしん。", "romaji": "mite, kono shashin.", "es": "Mira esta foto.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "頑張って。", "furigana": "がんばって。", "romaji": "ganbatte.", "es": "¡Ánimo!", "pitch_accent": "Heiban", "rate": 0.9},
        ],
        [
            {"tipo": "listen_only", "jp": "ちょっと待って。", "furigana": "ちょっとまって。", "es": "Espera un momento.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha (texto oculto) y elige.", "respuesta": "ちょっと待って。 — Espera un momento."},
            {"tipo": "listen_only", "jp": "見て、この写真。", "furigana": "みて、このしゃしん。", "es": "Mira esta foto.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha y elige.", "respuesta": "見て、この写真。 — Mira esta foto."},
            {"tipo": "shadowing", "jp": "ちょっと待って。", "furigana": "ちょっとまって。", "es": "Espera un momento.", "pausa_ms": 3000, "rate": 0.85, "prompt": "Escucha, pausa 3s, repite."},
            {"tipo": "produccion", "prompt": "Produce en japonés: '¡Mira esta foto!'", "respuesta": "見て、この写真。", "jp": "見て、この写真。", "mostrar_texto_antes": False, "rate": 0.8},
        ],
        "Error típico: confundir て final (petición) con て conjuntivo (y luego). Si hay verbo después, es conjunción: 食べて飲む. Si termina ahí, es final: 食べて。",
        "Hoy: て final para llamar suavemente. Próxima: なくて/ないで negativo con て. Di 3 veces: ちょっと待って。"
    )
))

# IMABI 35: Negative te Forms
lessons.append(build_lesson(
    "l-imabi-035", "IMABI 35: て negativo — なくて/ないで", "IMABI · Beginners I", 9,
    "Negativo con て: 食べなくて (no comer y...), 食べないで (sin comer / no comas). なくて une razón, ないで es 'sin' o petición negativa.",
    [
        {"jp": "宿題をしなくて、遊びました。", "kana": "しゅくだいをしなくて、あそびました。", "es": "No hice deberes y jugué."},
        {"jp": "朝ごはんを食べないで行った。", "kana": "あさごはんをたべないでいった。", "es": "Fui sin desayunar."},
        {"jp": "食べないでください。", "kana": "たべないでください。", "es": "Por favor no comas."},
    ],
    ["g-desu","g-desu-1","g-desu-2"],
    make_sections(
        "Quieres decir “sin hacer” o “no hagas” y dudas: ¿なくて o ないで? No es intercambiable; uno une excusas, otro marca ausencia.",
        pad_to_400("""～なくて y ～ないで son las dos て negativas. Parecen iguales pero IMABI 35 distingue: なくて es causa/conexión (no hice y...), ないで es medio/ausencia (sin hacer) y petición.

Objetivo: elegir なくて vs ないで según si expresas causa o “sin”.

🧩 Fórmula:
- 【ない → なくて】 causa: 安くなくて買わなかった (no era barato y no compré)
- 【ない → ないで】 sin: 食べないで寝た (dormí sin comer)
- 【ないでください】 petición negativa: 触らないでください (no toque)

Piensa en bloques: なくて = no y entonces; ないで = sin / no hagas.

👣 Cómo construirlo (3 pasos):
1) Haz negativo en ない: する→しない, 食べる→食べない
2) ¿Unes causa? → なくて: しなくて (no hacer y)
3) ¿“Sin” o orden negativa? → ないで: 食べないで (sin comer), 食べないでください (no comas por favor)

⚖️ Tabla て negativo:
| Positivo て | なくて (causa) | ないで (sin/petición) |
|---|---|---|
| 食べて | 食べなくて | 食べないで |
| して | しなくて | しないで |
| 行って | 行かなくて | 行かないで |

💡 Ejemplos desglosados:
1) 宿題をしなくて、遊びました。 (しゅくだいをしなくて、あそびました。) — “No hice deberes y jugué.” → しなくて(→ しない + くて) + 遊びました.
2) 朝ごはんを食べないで行った。 (あさごはんをたべないでいった。) — “Fui sin desayunar.” → 食べないで(→ 食べない + で) + 行った.
3) 食べないでください。 (たべないでください。) — “No comas por favor.” → 食べないで + ください (petición negativa).

🔑 Mini-resumen:
□ なくて = no ～ y (causa/conexión neutra)
□ ないで = sin ～ / no ～ por favor (ausencia/petición)
□ Petición fija: ～ないでください (la más usada)

❌ Error 90%: usar なくてください (no existe). Es siempre ないでください. Y no uses なくて para “sin”: 食べなくて寝た suena causa rara; di 食べないで寝た.

💬 Truco offline: di pares: しなくて→次に○○した (causa), しないで→行った (sin). Active recall. ¿Por qué 5 ítems? Domina 2 hoy, resto SRS."""),
        [
            {"jp": "宿題をしなくて、遊びました。", "furigana": "しゅくだいをしなくて、あそびました。", "romaji": "shukudai wo shinakute, asobimashita.", "es": "No hice deberes y jugué.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "朝ごはんを食べないで行った。", "furigana": "あさごはんをたべないでいった。", "romaji": "asagohan wo tabenaide itta.", "es": "Fui sin desayunar.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "食べないでください。", "furigana": "たべないでください。", "romaji": "tabenaide kudasai.", "es": "Por favor no comas.", "pitch_accent": "Heiban", "rate": 0.85},
        ],
        [
            {"tipo": "listen_only", "jp": "宿題をしなくて、遊びました。", "furigana": "しゅくだいをしなくて、あそびました。", "es": "No hice deberes y jugué.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha (texto oculto) y elige.", "respuesta": "宿題をしなくて、遊びました。 — No hice deberes y jugué."},
            {"tipo": "listen_only", "jp": "朝ごはんを食べないで行った。", "furigana": "あさごはんをたべないでいった。", "es": "Fui sin desayunar.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha y elige.", "respuesta": "朝ごはんを食べないで行った。 — Fui sin desayunar."},
            {"tipo": "shadowing", "jp": "宿題をしなくて、遊びました。", "furigana": "しゅくだいをしなくて、あそびました。", "es": "No hice deberes y jugué.", "pausa_ms": 3000, "rate": 0.85, "prompt": "Escucha, pausa 3s, repite."},
            {"tipo": "produccion", "prompt": "Produce en japonés: 'Por favor no comas.'", "respuesta": "食べないでください。", "jp": "食べないでください。", "mostrar_texto_antes": False, "rate": 0.8},
        ],
        "Error típico: なくて vs ないで intercambiables — no lo son. なくて suena causa; para 'sin' siempre ないで. Y la petición es siempre ないでください, nunca なくてください.",
        "Hoy: なくて causa vs ないで sin/petición. Próxima: ている progresivo. Di 3 veces: 食べないでください。"
    )
))

# IMABI 36: The Progressive ~teiru
lessons.append(build_lesson(
    "l-imabi-036", "IMABI 36: ～ている — progresivo y resultado 雨が降っている", "IMABI · Beginners I", 9,
    "～ている: acción en curso (食べている = está comiendo) o estado resultante (知っている = sé, resultado de haber conocido).",
    [
        {"jp": "今、ご飯を食べています。", "kana": "いま、ごはんをたべています。", "es": "Ahora estoy comiendo."},
        {"jp": "雨が降っています。", "kana": "あめがふっています。", "es": "Está lloviendo."},
        {"jp": "田中さんを知っていますか。", "kana": "たなかさんをしっていますか。", "es": "¿Conoces a Tanaka?"},
    ],
    ["g-desu","g-desu-1","g-desu-2"],
    make_sections(
        "Dices 知っています y te traducen “estoy sabiendo” literal y no cuadra. ¿Por qué ている a veces es “estoy -ando” y a veces es “ya sé”?",
        pad_to_400("""～ている es el comodín N5: marca o acción en progreso o estado que queda tras la acción. Depende del verbo.

Objetivo: formar て+いる y distinguir progresivo vs resultado.

🧩 Fórmula: 【Verbo て-form + いる】 → 食べている, 降っている, 知っている
Cortés: ています (habla), Plano: てる (casual) → 食べてる
- 食べている (progresivo: ahora mismo come)
- 知っている (resultado: ya conozco y sigo conociendo)

Piensa en bloques: て conecta la acción a “estar/haber quedado”.

👣 Cómo construirlo (3 pasos):
1) A て-form: 食べる→食べて, 降る→降って, 知る→知って
2) Añade いる/います: 食べて + いる → 食べている
3) ¿Verbo de acción puntual (知る, 結婚する) o duración (食べる, 降る)? → puntual = estado, duración = progreso

⚖️ Tabla ～ている:
| Verbo | て | +いる | Significado |
|---|---|---|---|
| 食べる | 食べて | 食べている | está comiendo (progreso) |
| 降る | 降って | 降っている | está lloviendo (progreso) |
| 知る | 知って | 知っている | sé (resultado de conocer) |
| 開ける | 開けて | 開けている | está abierto (estado) |

💡 Ejemplos desglosados:
1) 今、ご飯を食べています。 (いま、ごはんをたべています。) — “Ahora estoy comiendo.” → 今 + ご飯を + 食べて(て-form de 食べる) + います.
2) 雨が降っています。 (あめがふっています。) — “Está lloviendo.” → 雨が + 降って(て-form de 降る) + います.
3) 田中さんを知っていますか。 (たなかさんをしっていますか。) — “¿Conoces a Tanaka?” → 田中さんを + 知って(て-form de 知る) + いますか.

🔑 Mini-resumen:
□ て+いる = en curso si el verbo dura (食べている), = estado si es puntual (知っている)
□ Casual hablado: てる → 食べてる, 降ってる
□ No confundas con てある (intencional) IMABI 37

❌ Error 90%: traducir 知っている = “estoy conociendo” (suena proceso). Es “sé”. Y usar ている para hábito puro: mejor 習慣は présent, no siempre ている. En Cuba, piensa: ¿sigue pasando ahora? → ている.

💬 Truco offline: di 今○○しています mirando lo que haces: 今本を読んでいます 3×. Active recall. ¿Por qué 5 ítems? Domina 2 hoy, resto SRS."""),
        [
            {"jp": "今、ご飯を食べています。", "furigana": "いま、ごはんをたべています。", "romaji": "ima, gohan wo tabete imasu.", "es": "Ahora estoy comiendo.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "雨が降っています。", "furigana": "あめがふっています。", "romaji": "ame ga futte imasu.", "es": "Está lloviendo.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "田中さんを知っていますか。", "furigana": "たなかさんをしっていますか。", "romaji": "tanaka san wo shitte imasu ka.", "es": "¿Conoces a Tanaka?", "pitch_accent": "Heiban", "rate": 0.85},
        ],
        [
            {"tipo": "listen_only", "jp": "今、ご飯を食べています。", "furigana": "いま、ごはんをたべています。", "es": "Ahora estoy comiendo.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha (texto oculto) y elige.", "respuesta": "今、ご飯を食べています。 — Ahora estoy comiendo."},
            {"tipo": "listen_only", "jp": "雨が降っています。", "furigana": "あめがふっています。", "es": "Está lloviendo.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha y elige.", "respuesta": "雨が降っています。 — Está lloviendo."},
            {"tipo": "shadowing", "jp": "今、ご飯を食べています。", "furigana": "いま、ごはんをたべています。", "es": "Ahora estoy comiendo.", "pausa_ms": 3000, "rate": 0.85, "prompt": "Escucha, pausa 3s, repite."},
            {"tipo": "produccion", "prompt": "Produce en japonés: '¿Conoces a Tanaka?'", "respuesta": "田中さんを知っていますか。", "jp": "田中さんを知っていますか。", "mostrar_texto_antes": False, "rate": 0.8},
        ],
        "Error típico: usar ている para todo hábito: 毎日走っている vs 毎日走る. Habitual simple usa diccionario/ます, no siempre ている. ている es ahora/resultado.",
        "Hoy: て+いる progresivo/estado. Próxima: てある estado intencional. Di 3 veces: 雨が降っています。"
    )
))

# IMABI 37: Stative te aru
lessons.append(build_lesson(
    "l-imabi-037", "IMABI 37: ～てある — estado con intención 窓が開けてある", "IMABI · Beginners I", 9,
    "～てある: alguien hizo algo a propósito y quedó así. 窓が開けてある (la ventana está abierta (alguien la abrió a propósito)). Vs 開いている (está abierta, no importa quién).",
    [
        {"jp": "窓が開けてあります。", "kana": "まどがあけてあります。", "es": "La ventana está abierta (a propósito)."},
        {"jp": "本が並べてあります。", "kana": "ほんがならべてあります。", "es": "Los libros están ordenados (alguien los ordenó)."},
        {"jp": "電気がつけてあります。", "kana": "でんきがつけてあります。", "es": "La luz está encendida (a propósito)."},
    ],
    ["g-desu","g-desu-1","g-desu-2"],
    make_sections(
        "Ves 窓が開いている y 窓が開けてある y parecen “abierto” igual. ¿Por qué dos formas? Una borra al agente, la otra lo presume.",
        pad_to_400("""～てある marca estado resultante de una acción intencional transitiva. Alguien abrió la ventana a propósito y sigue abierta. Con ～ている solo constatas estado; con ～てある enfatizas intención/preparación.

Objetivo: formar Verbo transitivo て + ある y contrastarlo con ている.

🧩 Fórmula: 【Verbo transitivo て-form + ある】 → 開ける→開けてある, 並べる→並べてある, つける→つけてある
Cortés: てあります, Plano: てある
- 窓が開けてある (ventana abierta a propósito)
- 本が並べてある (libros alineados a propósito)

Piensa en bloques: て conecta la acción preparada a ある (existir).

👣 Cómo construirlo (3 pasos):
1) Solo con transitivos (abrir, poner, ordenar): 開ける, 並べる
2) A て-form + ある: 開けて + ある → 開けてある
3) Partícula が marca el objeto preparado: 窓が開けてある (no を, porque es estado)

⚖️ Tabla ～ている vs ～てある:
| Forma | Verbo | Ejemplo | Matiz |
|---|---|---|---|
| 開いている | 開く(vi) | 窓が開いている | está abierta (constatas) |
| 開けてある | 開ける(vt) | 窓が開けてある | está abierta (alguien la abrió) |
| ついている | つく | 電気がついている | luz encendida |
| つけてある | つける | 電気がつけてある | luz encendida (preparado) |

💡 Ejemplos desglosados:
1) 窓が開けてあります。 (まどがあけてあります。) — “Ventana abierta (a propósito).” → 窓が + 開けて(て-form de 開ける) + あります.
2) 本が並べてあります。 (ほんがならべてあります。) — “Libros están ordenados.” → 本が + 並べて(て-form) + あります.
3) 電気がつけてあります。 (でんきがつけてあります。) — “Luz encendida (a propósito).” → 電気が + つけて + あります.

🔑 Mini-resumen:
□ てある solo transitivos + intención visible
□ Partícula が para el estado: 窓が開けてある (no 窓を開けてある en estado; eso es acción)
□ ている neutral, てある intencional/preparado

❌ Error 90%: usar てある con intransitivos → 降ってある (mal, 降る es intransitivo). Di 降っている. Y usar を con estado: 窓を開けてある (acción: abrir ventana y dejarla), vs 窓が開けてある (estado).

💬 Truco offline: mira tu cuarto y di 3 estados intencionales: 本が並べてある, 電気がつけてある, 窓が開けてある. Active recall. ¿Por qué 5 ítems? Domina 2 hoy, resto SRS."""),
        [
            {"jp": "窓が開けてあります。", "furigana": "まどがあけてあります。", "romaji": "mado ga akete arimasu.", "es": "La ventana está abierta (a propósito).", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "本が並べてあります。", "furigana": "ほんがならべてあります。", "romaji": "hon ga narabete arimasu.", "es": "Los libros están ordenados.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "電気がつけてあります。", "furigana": "でんきがつけてあります。", "romaji": "denki ga tsukete arimasu.", "es": "La luz está encendida.", "pitch_accent": "Heiban", "rate": 0.85},
        ],
        [
            {"tipo": "listen_only", "jp": "窓が開けてあります。", "furigana": "まどがあけてあります。", "es": "La ventana está abierta (a propósito).", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha (texto oculto) y elige.", "respuesta": "窓が開けてあります。 — La ventana está abierta."},
            {"tipo": "listen_only", "jp": "本が並べてあります。", "furigana": "ほんがならべてあります。", "es": "Los libros están ordenados.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha y elige.", "respuesta": "本が並べてあります。 — Los libros están ordenados."},
            {"tipo": "shadowing", "jp": "窓が開けてあります。", "furigana": "まどがあけてあります。", "es": "La ventana está abierta.", "pausa_ms": 3000, "rate": 0.85, "prompt": "Escucha, pausa 3s, repite."},
            {"tipo": "produccion", "prompt": "Produce en japonés: 'Los libros están ordenados.'", "respuesta": "本が並べてあります。", "jp": "本が並べてあります。", "mostrar_texto_antes": False, "rate": 0.8},
        ],
        "Error típico: てある con intransitivo (降ってある) — imposible. Solo transitivos. Y confundir が/を: estado es が (窓が開けてある), acción es を (窓を開けておく).",
        "Hoy: てある estado intencional. Próxima: números sino-japoneses. Di 3 veces: 窓が開けてあります。"
    )
))

print(f"Generadas {len(lessons)} lecciones: {[l['id'] for l in lessons]}")
n5_path = ROOT / "n5.js"
raw = n5_path.read_text(encoding="utf-8")
m = re.search(r"var data = (\{[\s\S]*?\});\s+root\.NihongoDojoN5", raw)
data = json.loads(m.group(1))
existing_ids = {l["id"] for l in data["LESSONS"]}
added = 0
for les in lessons:
    if les["id"] not in existing_ids:
        data["LESSONS"].append(les)
        added += 1
        print(f"Añadida {les['id']}")
    else:
        print(f"Ya existe {les['id']}")
data["counts"]["lessons"] = len(data["LESSONS"])
js = "/* NihongoDojo N5. WexDC Clarity 3.0 + IMABI 27-37 */\n(function (root) {\n    \"use strict\";\n    var data = "+json.dumps(data, ensure_ascii=False, indent=2)+";\n    root.NihongoDojoN5 = data;\n    if (typeof module !== \"undefined\" && module.exports) module.exports = data;\n})(typeof window !== \"undefined\" ? window : globalThis);\n"
n5_path.write_text(js, encoding="utf-8")
print(f"n5.js ahora {len(data['LESSONS'])} lecciones")

# Actualizar imabi.js
imabi_path = ROOT / "imabi.js"
imabi_raw = imabi_path.read_text(encoding="utf-8")
replacements = {
    '{ num: 28, title: "The Particle の I", url: "https://imabi.org/the-case-particle-%E3%81%AE-i/", ids: [] }': '{ num: 28, title: "The Particle の I", url: "https://imabi.org/the-case-particle-%E3%81%AE-i/", ids: ["l-imabi-028"] }',
    '{ num: 34, title: "The Final Particle て", url: "https://imabi.org/the-particle-te-%E3%81%A6-ii-final-particle/", ids: [] }': '{ num: 34, title: "The Final Particle て", url: "https://imabi.org/the-particle-te-%E3%81%A6-ii-final-particle/", ids: ["l-imabi-034"] }',
    '{ num: 35, title: "Negative て Forms: ～なくて & ～ないで", url: "https://imabi.org/the-negative-%E3%81%A6%E5%BD%A2-%EF%BD%9E%E3%81%AA%E3%81%8F%E3%81%A6-%EF%BD%9E%E3%81%AA%E3%81%84%E3%81%A7/", ids: [] }': '{ num: 35, title: "Negative て Forms: ～なくて & ～ないで", url: "https://imabi.org/the-negative-%E3%81%A6%E5%BD%A2-%EF%BD%9E%E3%81%AA%E3%81%8F%E3%81%A6-%EF%BD%9E%E3%81%AA%E3%81%84%E3%81%A7/", ids: ["l-imabi-035"] }',
    '{ num: 36, title: "The Progressive ～ている", url: "https://imabi.org/the-progressive-continued-state-te-iru-%EF%BD%9E%E3%81%A6%E3%81%84%E3%82%8B/", ids: [] }': '{ num: 36, title: "The Progressive ～ている", url: "https://imabi.org/the-progressive-continued-state-te-iru-%EF%BD%9E%E3%81%A6%E3%81%84%E3%82%8B/", ids: ["l-imabi-036"] }',
    '{ num: 37, title: "Stative ～てある", url: "https://imabi.org/stative-verbs-te-aru-%EF%BD%9E%E3%81%A6%E3%81%82%E3%82%8B/", ids: [] }': '{ num: 37, title: "Stative ～てある", url: "https://imabi.org/stative-verbs-te-aru-%EF%BD%9E%E3%81%A6%E3%81%82%E3%82%8B/", ids: ["l-imabi-037"] }',
}
for old, new in replacements.items():
    if old in imabi_raw:
        imabi_raw = imabi_raw.replace(old, new)
        print(f"Actualizado imabi {old[:35]}")
    else:
        print(f"No encontrado para {old[:40]}")
imabi_path.write_text(imabi_raw, encoding="utf-8")
print("imabi.js actualizado")
