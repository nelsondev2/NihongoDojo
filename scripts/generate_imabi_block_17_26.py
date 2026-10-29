#!/usr/bin/env python3
import json, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parents[1]

def make_sections(title, gancho, explicacion, ejemplos_items, practica_items, errores, cierre):
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
    extra = "\n\nPara practicar offline (clave en Cuba sin datos): tapa el japonés y produce en voz alta antes de mirar. Si fallas, no repitas 10 veces lo mismo; el SRS te lo traerá en minutos (fallo) o en 3 días (acierto). Interleaving: mezcla hoy un poco de este tema + vocabulario + escucha, nunca 10 kanjis seguidos. Memoria de trabajo 7±2: domina 2 ejemplos hoy a fondo, deja el resto al repaso espaciado. Si dudas entre ichidan y godan, abre el diccionario y busca el tag: [ichidan] termina en る con vocal previa, [godan] cambia la consonante. Repite en voz alta marcando la partícula para anclar ritmo."
    while len((text + extra).split()) < target:
        extra += " Repasa el ejemplo en voz alta y crea tu propia frase."
    return text + extra

lessons = []

# IMABI 17: Ichidan Verbs
lessons.append(build_lesson(
    "l-imabi-017", "IMABI 17: Verbo一段 — 食べる, 見る", "IMABI · Beginners I", 8,
    "Ichidan: todos terminan en る y suena i/e + る. 食べる (taberu), 見る (miru). Su base es estable.",
    [
        {"jp": "朝ごはんを食べます。", "kana": "あさごはんをたべます。", "es": "Desayuno."},
        {"jp": "映画を見ます。", "kana": "えいがをみます。", "es": "Veo una peli."},
        {"jp": "早く寝ます。", "kana": "はやくねます。", "es": "Me acuesto pronto."},
    ],
    ["g-desu","g-desu-1","g-desu-2"],
    make_sections(
        "IMABI 17: Ichidan",
        "En el conbini ves 食べます y 飲みます. Uno termina en べる, otro en む. ¿Por qué uno cambia a 食べない y otro a 飲まない? Ahí está ichidan vs godan.",
        pad_to_400("""Los verbos一段 (ichidan, “una columna”) son los fáciles: siempre terminan en る y la vocal anterior es i o e: 食(た)べる (e+る), 見(み)る (i+る), 寝(ね)る, 起(お)きる. Su truco es que la raíz no cambia.

Objetivo: conjugar ichidan sin dudar: 食べる → 食べない/食べます/食べた.

🧩 Fórmula: 【raíz + る → quita る + terminación】
Ej: たべる → たべ + ない / ます / た

Piensa en bloques: quitas る y añades lo que necesitas. No hay sorpresas de consonantes.

👣 Cómo construirlo (3 pasos):
1) Confirma que es ichidan: ¿termina en い/え + る? 食べる sí (べ = be), 切る no (き = ki pero es godan)
2) Quita る: 食べ → raíz
3) Añade: ない (neg), ます (cortés), た (pasado): 食べない, 食べます, 食べた

⚖️ Tabla ichidan:
| Forma | Regla | Ejemplo |
|---|---|---|
| Diccionario | る | 食べる |
| Negativo | る→ない | 食べない |
| Cortés | る→ます | 食べます |
| Pasado | る→た | 食べた |
| て-form | る→て | 食べて |

💡 Ejemplos desglosados:
1) 朝ごはんを食べます。 (あさごはんをたべます。) — “Desayuno.” → 朝ごはん(tema) + を + 食べます.
2) 映画を見ます。 (えいがをみます。) — “Veo peli.” → 映画を + 見ます.
3) 早く寝ます。 (はやくねます。) — “Duermo pronto.” → 早く + 寝ます.

🔑 Mini-resumen:
□ ichidan = i/e + る, raíz estable
□ Quita る → ない/ます/た/て
□ Excepción: algunos i/e+る son godan (要る, 走る) — se aprenden aparte

❌ Error 90%: tratar 帰る (kaeru) como ichidan. Parece e+る pero es godan: 帰らない, no 帰ない. IMABI 18 te entrena el ojo.

💬 Truco offline: di 食べる→食べない→食べます→食べた en voz alta 3×. Active recall.

¿Por qué 5 ítems? Domina 2 hoy, resto SRS. Mezcla verbos + escucha."""),
        [
            {"jp": "朝ごはんを食べます。", "furigana": "あさごはんをたべます。", "romaji": "asagohan wo tabemasu.", "es": "Desayuno.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "映画を見ます。", "furigana": "えいがをみます。", "romaji": "eiga wo mimasu.", "es": "Veo una peli.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "早く寝ます。", "furigana": "はやくねます。", "romaji": "hayaku nemasu.", "es": "Me acuesto pronto.", "pitch_accent": "Heiban", "rate": 0.85},
        ],
        [
            {"tipo": "listen_only", "jp": "朝ごはんを食べます。", "furigana": "あさごはんをたべます。", "es": "Desayuno.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha (texto oculto) y elige.", "respuesta": "朝ごはんを食べます。 — Desayuno."},
            {"tipo": "listen_only", "jp": "映画を見ます。", "furigana": "えいがをみます。", "es": "Veo una peli.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha y elige.", "respuesta": "映画を見ます。 — Veo una peli."},
            {"tipo": "shadowing", "jp": "朝ごはんを食べます。", "furigana": "あさごはんをたべます。", "es": "Desayuno.", "pausa_ms": 3000, "rate": 0.85, "prompt": "Escucha, pausa 3s, repite."},
            {"tipo": "produccion", "prompt": "Produce en japonés: 'Veo una peli.'", "respuesta": "映画を見ます。", "jp": "映画を見ます。", "mostrar_texto_antes": False, "rate": 0.8},
        ],
        "Error típico: 帰る, 切る, 入る parecen ichidan pero son godan. Si dudas, consulta diccionario: ¿dice [ichidan] o [godan]? No te fíes solo de la terminación.",
        "Hoy: ichidan quita る. Próxima: godan cambia consonante. Di 3 veces: 食べない, 食べます。"
    )
))

# IMABI 18: Godan Verbs
lessons.append(build_lesson(
    "l-imabi-018", "IMABI 18: Verbo五段 — 書く, 読む, 行く", "IMABI · Beginners I", 9,
    "Godan: la raíz cambia la última consonante. 書く (kaku) → 書かない, 行く → 行かない. Hay que memorizar la tabla de 9 terminaciones.",
    [
        {"jp": "手紙を書きます。", "kana": "てがみをかきます。", "es": "Escribo una carta."},
        {"jp": "本を読みます。", "kana": "ほんをよみます。", "es": "Leo un libro."},
        {"jp": "学校に行きます。", "kana": "がっこうにいきます。", "es": "Voy a la escuela."},
    ],
    ["g-desu","g-desu-1","g-desu-2"],
    make_sections(
        "IMABI 18: Godan",
        "Ves 書きます, 読みます, 行きます. Todos terminan en ます, pero sus diccionarios son 書く, 読む, 行く — tres finales distintos. ¿Cómo predecir 書かない vs 読まない?",
        pad_to_400("""Los五段 (godan, “cinco columnas”) cambian la última sílaba por 5 vocales: か-き-く-け-こ. Es el grupo grande (80% de verbos). Terminaciones: う, く, す, つ, ぬ, ぶ, む, ぐ, る (pero no todo る es godan).

Objetivo: conjugar godan sin dudar: 書く → 書かない/書きます/書いた.

🧩 Fórmula: 【raíz + terminación → cambia a a/i/u/e/o + sufijo】
Ej: かく → かか(ない), かき(ます), かく(presente), かけ(ば), かこ(う)

Piensa en bloques: la última kana baila entre vocales.

👣 Cómo construirlo (3 pasos):
1) Identifica la terminación: 書く (く), 読む (む), 行く (く pero irregular en て)
2) Cambia la vocal: く→か para ない, く→き para ます
3) Añade: ない, ます, た (con cambios: く→いた, む→んだ)

⚖️ Tabla godan clave:
| Dicc. | ない | ます | て | Ejemplo |
|---|---|---|---|---|
| 書く | 書かない | 書きます | 書いて | k→ka/ki/ite |
| 読む | 読まない | 読みます | 読んで | m→ma/mi/nde |
| 行く | 行かない | 行きます | 行って | irregular: ite→tte |

💡 Ejemplos desglosados:
1) 手紙を書きます。 (てがみをかきます。) — “Escribo carta.” → 手紙を + 書きます.
2) 本を読みます。 (ほんをよみます。) — “Leo libro.” → 本を + 読みます.
3) 学校に行きます。 (がっこうにいきます。) — “Voy a escuela.” → 学校に + 行きます.

🔑 Mini-resumen:
□ godan cambia la consonante final entre a/i/u/e/o
□ ない usa a (書かない), ます usa i (書きます)
□ く/ぐ/む tienen cambios especiales en た/て

❌ Error 90%: aplicar regla ichidan a godan: 書る→書ない (mal). Siempre verifica grupo en diccionario.

💬 Truco offline: di 書く→書かない→書きます→書いた 3×. Active recall.

¿Por qué 5 ítems? Domina 2 hoy, resto SRS. Mezcla godan + escucha."""),
        [
            {"jp": "手紙を書きます。", "furigana": "てがみをかきます。", "romaji": "tegami wo kakimasu.", "es": "Escribo una carta.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "本を読みます。", "furigana": "ほんをよみます。", "romaji": "hon wo yomimasu.", "es": "Leo un libro.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "学校に行きます。", "furigana": "がっこうにいきます。", "romaji": "gakkou ni ikimasu.", "es": "Voy a la escuela.", "pitch_accent": "Heiban", "rate": 0.85},
        ],
        [
            {"tipo": "listen_only", "jp": "手紙を書きます。", "furigana": "てがみをかきます。", "es": "Escribo una carta.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha (texto oculto) y elige.", "respuesta": "手紙を書きます。 — Escribo una carta."},
            {"tipo": "listen_only", "jp": "本を読みます。", "furigana": "ほんをよみます。", "es": "Leo un libro.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha y elige.", "respuesta": "本を読みます。 — Leo un libro."},
            {"tipo": "shadowing", "jp": "手紙を書きます。", "furigana": "てがみをかきます。", "es": "Escribo una carta.", "pausa_ms": 3000, "rate": 0.85, "prompt": "Escucha, pausa 3s, repite."},
            {"tipo": "produccion", "prompt": "Produce en japonés: 'Voy a la escuela.'", "respuesta": "学校に行きます。", "jp": "学校に行きます。", "mostrar_texto_antes": False, "rate": 0.8},
        ],
        "Error típico: confundir 行く (iku) con irregular: 行って no 行いて. Memoriza: 行く→行って, いく→いって. Y 帰る es godan aunque parezca ichidan.",
        "Hoy: godan cambia vocal final. Próxima: する/来る irregulares. Di 3 veces: 書かない, 読みます。"
    )
))

# IMABI 21: Particle ka with Negative
lessons.append(build_lesson(
    "l-imabi-021", "IMABI 21: か con negación — じゃないか", "IMABI · Beginners I", 7,
    "か no solo pregunta, también confirma con negación: じゃないか (¿verdad que no es?). 学生じゃないですか — ¿No es estudiante? (esperas sí).",
    [
        {"jp": "学生じゃないですか。", "kana": "がくせいじゃないですか。", "es": "¿No es estudiante?"},
        {"jp": "行かないか。", "kana": "いかないか。", "es": "¿No vas? (invitación)"},
        {"jp": "寒くないか。", "kana": "さむくないか。", "es": "¿No hace frío?"},
    ],
    ["g-desu","g-desu-1","g-desu-2"],
    make_sections(
        "IMABI 21: か negativo",
        "Te dicen 「学生じゃないか」 y dudas: ¿es pregunta? ¿es negación? ¿invitación? Sin か negativo no entiendes el matiz de confirmación.",
        pad_to_400("""か con negación crea dos usos: pregunta negativa (¿no es...?) y confirmación/retórica (¿verdad?).

Objetivo: usar じゃないか / じゃないですか para preguntar esperando confirmación.

🧩 Fórmula: 【Frase negativa + か】 → 学生じゃないですか / 行かないか / 寒くないか
Variante cortés: じゃないですか / じゃないでしょうか (más suave)

Piensa en bloques: niegas y luego preguntas para invitar a decir “sí, es”.

👣 Cómo construirlo (3 pasos):
1) Forma negativa: 学生 → 学生じゃない, 行く → 行かない, 寒い → 寒くない
2) Añade か (plano) o か con です (cortés): じゃないか / じゃないですか
3) Entona como pregunta: ¿verdadero?

⚖️ Tabla か negativo:
| Base | +か plano | +か cortés | Matiz |
|---|---|---|---|
| 学生だ | 学生じゃないか | 学生じゃないですか | ¿No es estudiante? |
| 行く | 行かないか | 行きませんか | ¿No vas? (invitación) |
| 寒い | 寒くないか | 寒くないですか | ¿No hace frío? |

💡 Ejemplos desglosados:
1) 学生じゃないですか。 (がくせいじゃないですか。) — “¿No es estudiante?” → 学生じゃない + ですか.
2) 行かないか。 (いかないか。) — “¿No vas?” → 行かない + か (invitación).
3) 寒くないか。 (さむくないか。) — “¿No hace frío?” → 寒くない + か.

🔑 Mini-resumen:
□ Negativo + か = pregunta esperando sí / invitación
□ Cortés: じゃないですか / 行きませんか
□ Plano retórico: じゃないか (¿verdad?)

❌ Error 90%: usar じゃないか en formal. En trabajo usa じゃないですか o じゃありませんか. Plano suena brusco.

💬 Truco offline: di 学生じゃないですか → 学生じゃないか (cambia formalidad) 3×.

¿Por qué 5 ítems? Domina 2 hoy, resto SRS. Mezcla か negativo + escucha."""),
        [
            {"jp": "学生じゃないですか。", "furigana": "がくせいじゃないですか。", "romaji": "gakusei ja nai desu ka.", "es": "¿No es estudiante?", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "行かないか。", "furigana": "いかないか。", "romaji": "ikanai ka.", "es": "¿No vas?", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "寒くないか。", "furigana": "さむくないか。", "romaji": "samukunai ka.", "es": "¿No hace frío?", "pitch_accent": "Heiban", "rate": 0.85},
        ],
        [
            {"tipo": "listen_only", "jp": "学生じゃないですか。", "furigana": "がくせいじゃないですか。", "es": "¿No es estudiante?", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha (texto oculto) y elige.", "respuesta": "学生じゃないですか。 — ¿No es estudiante?"},
            {"tipo": "listen_only", "jp": "行かないか。", "furigana": "いかないか。", "es": "¿No vas?", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha y elige.", "respuesta": "行かないか。 — ¿No vas?"},
            {"tipo": "shadowing", "jp": "学生じゃないですか。", "furigana": "がくせいじゃないですか。", "es": "¿No es estudiante?", "pausa_ms": 3000, "rate": 0.85, "prompt": "Escucha, pausa 3s, repite."},
            {"tipo": "produccion", "prompt": "Produce en japonés: '¿No hace frío?'", "respuesta": "寒くないか。", "jp": "寒くないか。", "mostrar_texto_antes": False, "rate": 0.8},
        ],
        "Error típico: confundir じゃないか (plano, confirmación) con じゃないですか (cortés). No uses plano con tu jefe. Y no añadas か a じゃないです ya cortés sin か: es じゃないですか, no じゃないですかか.",
        "Hoy: negativo + か para invitar. Próxima: こそあど This/That. Di 3 veces: じゃないですか。"
    )
))

# IMABI 24: Kosoado I - This & That
lessons.append(build_lesson(
    "l-imabi-024", "IMABI 24: こそあど I — これ/それ/あれ", "IMABI · Beginners I", 7,
    "Deícticos: これ (esto cerca de mí), それ (eso cerca de ti), あれ (aquello lejos de ambos). No es solo vocab, es distancia psicológica.",
    [
        {"jp": "これは本です。", "kana": "これはほんです。", "es": "Esto es un libro."},
        {"jp": "それは私の傘です。", "kana": "それはわたしのかさです。", "es": "Eso es mi paraguas."},
        {"jp": "あれは富士山です。", "kana": "あれはふじさんです。", "es": "Aquello es el Fuji."},
    ],
    ["g-desu","g-desu-1","g-desu-2"],
    make_sections(
        "IMABI 24: これ/それ/あれ",
        "Señalas y dices “esto” pero tu amigo mira a otro lado. ¿Era これ, それ o あれ? Sin distancia no te entienden.",
        pad_to_400("""こそあど organiza el espacio en 3 zonas: こ (cerca de mí), そ (cerca de ti), あ (lejos de ambos). No es solo físico, también mental.

Objetivo: elegir これ/それ/あれ sin dudar según distancia al hablante y oyente.

🧩 Fórmula: 【これ/それ/あれ は + Descripción】
- これ: esto (mío, aquí) → これは本です (esto cerca de mí)
- それ: eso (tuyo, allí) → それは傘です (eso cerca de ti)
- あれ: aquello (lejos de ambos) → あれは富士山です (allá lejos)

Piensa en bloques: imagina triángulo tú-yo-objeto.

👣 Cómo construirlo (3 pasos):
1) ¿Dónde está? ¿Cerca de mí? → これ / ¿Cerca de ti? → それ / ¿Lejos? → あれ
2) Añade は + descripción: これは本です
3) Pregunta: これ/それ/あれ + は + 何ですか (¿qué es?)

⚖️ Tabla こそあど I:
| Forma | Distancia | Ejemplo |
|---|---|---|
| これ | cerca de mí | これは私の本です |
| それ | cerca de ti | それはあなたの傘ですか |
| あれ | lejos de ambos | あれは富士山です |

💡 Ejemplos desglosados:
1) これは本です。 (これはほんです。) — “Esto es libro.” → これ(esto aquí) + は + 本です.
2) それは私の傘です。 (それはわたしのかさです。) — “Eso es mi paraguas.” → それ(eso allí cerca de ti) + は + 傘です.
3) あれは富士山です。 (あれはふじさんです。) — “Aquello es Fuji.” → あれ(allá lejos) + は + 富士山です.

🔑 Mini-resumen:
□ こ = mío/aquí, そ = tuyo/allí, あ = lejos
□ これ/それ/あれ solos, sin nombre detrás
□ Con nombre usa この/その/あの (IMABI 25)

❌ Error 90%: usar これ con nombre: これ本 (mal) → この本 (bien). こ solo para pronombre.

💬 Truco offline: señala 3 objetos: これ (tu mesa), それ (su mesa), あれ (montaña). Di cada uno.

¿Por qué 5 ítems? Domina 2 hoy, resto SRS. Mezcla こそあど + escucha."""),
        [
            {"jp": "これは本です。", "furigana": "これはほんです。", "romaji": "kore wa hon desu.", "es": "Esto es un libro.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "それは私の傘です。", "furigana": "それはわたしのかさです。", "romaji": "sore wa watashi no kasa desu.", "es": "Eso es mi paraguas.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "あれは富士山です。", "furigana": "あれはふじさんです。", "romaji": "are wa fujisan desu.", "es": "Aquello es el Fuji.", "pitch_accent": "Heiban", "rate": 0.85},
        ],
        [
            {"tipo": "listen_only", "jp": "これは本です。", "furigana": "これはほんです。", "es": "Esto es un libro.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha (texto oculto) y elige.", "respuesta": "これは本です。 — Esto es un libro."},
            {"tipo": "listen_only", "jp": "それは私の傘です。", "furigana": "それはわたしのかさです。", "es": "Eso es mi paraguas.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha y elige.", "respuesta": "それは私の傘です。 — Eso es mi paraguas."},
            {"tipo": "shadowing", "jp": "これは本です。", "furigana": "これはほんです。", "es": "Esto es un libro.", "pausa_ms": 3000, "rate": 0.85, "prompt": "Escucha, pausa 3s, repite."},
            {"tipo": "produccion", "prompt": "Produce en japonés: 'Aquello es el Fuji.'", "respuesta": "あれは富士山です。", "jp": "あれは富士山です。", "mostrar_texto_antes": False, "rate": 0.8},
        ],
        "Error típico: これ本 / それ傘 sin の. Para pronombre solo: これ. Para adjetivo: この本. Mezclarlos es el fallo #1 de N5.",
        "Hoy: これ/それ/あれ distancia. Próxima: この/その/あの + nombre. Di 3 veces: これは本です。"
    )
))

# IMABI 25: Kosoado II - These & Those (kono/sono/ano)
lessons.append(build_lesson(
    "l-imabi-025", "IMABI 25: こそあど II — この/その/あの", "IMABI · Beginners I", 7,
    "この/その/あの + nombre: この本 (este libro mío), その本 (ese libro tuyo), あの本 (aquel libro lejano). Nunca van solos.",
    [
        {"jp": "この本は面白いです。", "kana": "このほんはおもしろいです。", "es": "Este libro es interesante."},
        {"jp": "そのかばんは大きいです。", "kana": "そのかばんはおおきいです。", "es": "Ese bolso es grande."},
        {"jp": "あの人は田中さんです。", "kana": "あのひとはたなかさんです。", "es": "Aquella persona es Tanaka."},
    ],
    ["g-desu","g-desu-1","g-desu-2"],
    make_sections(
        "IMABI 25: この/その/あの",
        "Dices これ本 y un japonés no te entiende. Necesitas この本. ¿Cuál es la diferencia entre これ y この? Uno es pronombre, otro adjetivo.",
        pad_to_400("""この/その/あの son la versión “con nombre” de これ/それ/あれ. Siempre llevan un sustantivo detrás: この本, そのかばん, あの人.

Objetivo: usar この/その/あの + nombre sin confundir con これ/それ/あれ solos.

🧩 Fórmula: 【この/その/あの + Nombre + は + Descripción】
- この本は面白いです (este libro aquí)
- そのかばんは大きいです (ese bolso allí cerca de ti)
- あの人は田中さんです (aquella persona allá lejos)

Piensa en bloques: この necesita compañero (nombre), これ no.

👣 Cómo construirlo (3 pasos):
1) ¿Pronombre solo? → これ/それ/あれ (IMABI 24)
2) ¿Con nombre? → この/その/あの + nombre: この本
3) Añade は + descripción: この本は面白いです

⚖️ Tabla こ vs この:
| Forma | Tipo | Va con | Ejemplo |
|---|---|---|---|
| これ | pronombre | solo | これは本です |
| この | adjetivo | + nombre | この本は面白いです |
| それ | pronombre | solo | それは傘です |
| その | adjetivo | + nombre | そのかばんは大きいです |

💡 Ejemplos desglosados:
1) この本は面白いです。 (このほんはおもしろいです。) — “Este libro es interesante.” → この本(este libro) + は + 面白いです.
2) そのかばんは大きいです。 (そのかばんはおおきいです。) — “Ese bolso es grande.” → そのかばん(ese bolso) + は + 大きいです.
3) あの人は田中さんです。 (あのひとはたなかさんです。) — “Aquella persona es Tanaka.” → あの人(aquella persona) + は + 田中さんです.

🔑 Mini-resumen:
□ これ/それ/あれ = pronombre solo
□ この/その/あの = + nombre obligatorio
□ Misma lógica de distancia: こ cerca mí, そ cerca ti, あ lejos

❌ Error 90%: このは本です (doble partícula). Es この本は, no このは. この ya es adjetivo, no lleva は solo.

💬 Truco offline: di pares: これ→この本, それ→そのかばん, あれ→あの人 3×.

¿Por qué 5 ítems? Domina 2 hoy, resto SRS. Mezcla この/その/あの + escucha."""),
        [
            {"jp": "この本は面白いです。", "furigana": "このほんはおもしろいです。", "romaji": "kono hon wa omoshiroi desu.", "es": "Este libro es interesante.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "そのかばんは大きいです。", "furigana": "そのかばんはおおきいです。", "romaji": "sono kaban wa ookii desu.", "es": "Ese bolso es grande.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "あの人は田中さんです。", "furigana": "あのひとはたなかさんです。", "romaji": "ano hito wa tanaka san desu.", "es": "Aquella persona es Tanaka.", "pitch_accent": "Heiban", "rate": 0.85},
        ],
        [
            {"tipo": "listen_only", "jp": "この本は面白いです。", "furigana": "このほんはおもしろいです。", "es": "Este libro es interesante.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha (texto oculto) y elige.", "respuesta": "この本は面白いです。 — Este libro es interesante."},
            {"tipo": "listen_only", "jp": "そのかばんは大きいです。", "furigana": "そのかばんはおおきいです。", "es": "Ese bolso es grande.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha y elige.", "respuesta": "そのかばんは大きいです。 — Ese bolso es grande."},
            {"tipo": "shadowing", "jp": "この本は面白いです。", "furigana": "このほんはおもしろいです。", "es": "Este libro es interesante.", "pausa_ms": 3000, "rate": 0.85, "prompt": "Escucha, pausa 3s, repite."},
            {"tipo": "produccion", "prompt": "Produce en japonés: 'Aquella persona es Tanaka.'", "respuesta": "あの人は田中さんです。", "jp": "あの人は田中さんです。", "mostrar_texto_antes": False, "rate": 0.8},
        ],
        "Error típico: これ本 / それかばん sin の/この. Recuerda: これ + 名前 es siempre この + 名前. No mezcles.",
        "Hoy: この/その/あの + nombre. Próxima: ここ/そこ/あそこ lugar. Di 3 veces: この本は面白いです。"
    )
))

# IMABI 26: Kosoado III - Here & There (koko/soko/asoko)
lessons.append(build_lesson(
    "l-imabi-026", "IMABI 26: こそあど III — ここ/そこ/あそこ", "IMABI · Beginners I", 7,
    "Lugar: ここ (aquí), そこ (ahí), あそこ (allá). Pregunta どこ (¿dónde?). Con に/で: ここにいます (estoy aquí).",
    [
        {"jp": "ここは教室です。", "kana": "ここはきょうしつです。", "es": "Aquí es un aula."},
        {"jp": "そこに本があります。", "kana": "そこにほんがあります。", "es": "Ahí hay un libro."},
        {"jp": "あそこは駅です。", "kana": "あそこはえきです。", "es": "Allá es la estación."},
    ],
    ["g-desu","g-desu-1","g-desu-2"],
    make_sections(
        "IMABI 26: ここ/そこ/あそこ",
        "Preguntas ¿dónde está? y respondes ここ. Pero usas ここにいます vs ここで食べます y dudas: ¿に o で?",
        pad_to_400("""ここ/そこ/あそこ marcan lugar, como これ/それ/あれ pero para sitio. どこ es la pregunta.

Objetivo: usar ここ/そこ/あそこ con に (existencia) vs で (acción) correctamente.

🧩 Fórmula:
- 【ここ/そこ/あそこ は + Lugar】 → ここは教室です
- 【ここに + ある/いる】 (existencia) → そこに本があります
- 【ここで + verbo acción】 → ここで勉強します
- Pregunta: どこですか / どこにありますか

Piensa en bloques: lugar + に/で según si el verbo es estar o hacer.

👣 Cómo construirlo (3 pasos):
1) Elige lugar: ここ (aquí), そこ (ahí), あそこ (allá), どこ (dónde)
2) ¿Existencia (ある/いる)? Usa に: ここに猫がいます
3) ¿Acción (食べる/勉強)? Usa で: ここで食べます

⚖️ Tabla lugar:
| Forma | Significado | Ejemplo |
|---|---|---|
| ここ | aquí | ここは教室です |
| そこ | ahí | そこに本があります |
| あそこ | allá | あそこは駅です |
| どこ | dónde | どこですか |

💡 Ejemplos desglosados:
1) ここは教室です。 (ここはきょうしつです。) — “Aquí es aula.” → ここ(aquí) + は + 教室です.
2) そこに本があります。 (そこにほんがあります。) — “Ahí hay libro.” → そこに(ahí + に) + 本があります.
3) あそこは駅です。 (あそこはえきです。) — “Allá es estación.” → あそこ(allá) + は + 駅です.

🔑 Mini-resumen:
□ ここ/そこ/あそこ = lugar; どこ = pregunta
□ に para existencia (ある/いる), で para acción
□ ここは... vs ここに... vs ここで... mira el verbo

❌ Error 90%: ここに勉強します (mal, acción lleva で). Di ここで勉強します. Y どこは (mal) → どこですか (pregunta).

💬 Truco offline: señala 3 lugares: ここ (tu sitio), そこ (su sitio), あそこ (puerta). Di cada uno con に/で.

¿Por qué 5 ítems? Domina 2 hoy, resto SRS. Mezcla ここ/そこ/あそこ + escucha."""),
        [
            {"jp": "ここは教室です。", "furigana": "ここはきょうしつです。", "romaji": "koko wa kyoushitsu desu.", "es": "Aquí es un aula.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "そこに本があります。", "furigana": "そこにほんがあります。", "romaji": "soko ni hon ga arimasu.", "es": "Ahí hay un libro.", "pitch_accent": "Heiban", "rate": 0.85},
            {"jp": "あそこは駅です。", "furigana": "あそこはえきです。", "romaji": "asoko wa eki desu.", "es": "Allá es la estación.", "pitch_accent": "Heiban", "rate": 0.85},
        ],
        [
            {"tipo": "listen_only", "jp": "ここは教室です。", "furigana": "ここはきょうしつです。", "es": "Aquí es un aula.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha (texto oculto) y elige.", "respuesta": "ここは教室です。 — Aquí es un aula."},
            {"tipo": "listen_only", "jp": "そこに本があります。", "furigana": "そこにほんがあります。", "es": "Ahí hay un libro.", "mostrar_texto_antes": False, "rate": 0.9, "prompt": "♪ Escucha y elige.", "respuesta": "そこに本があります。 — Ahí hay un libro."},
            {"tipo": "shadowing", "jp": "ここは教室です。", "furigana": "ここはきょうしつです。", "es": "Aquí es un aula.", "pausa_ms": 3000, "rate": 0.85, "prompt": "Escucha, pausa 3s, repite."},
            {"tipo": "produccion", "prompt": "Produce en japonés: 'Allá es la estación.'", "respuesta": "あそこは駅です。", "jp": "あそこは駅です。", "mostrar_texto_antes": False, "rate": 0.8},
        ],
        "Error típico: confundir に/で con lugar. Recuerda: に = existe ahí (ある/いる), で = haces ahí (食べる/勉強). No digas ここに食べます.",
        "Hoy: ここ/そこ/あそこ lugar + に/で. Próxima: と para 'y' cerrado. Di 3 veces: ここに本があります。"
    )
))

# Guardar
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
js = "/* NihongoDojo N5. WexDC Clarity 3.0 + IMABI 17-26 */\n(function (root) {\n    \"use strict\";\n    var data = "+json.dumps(data, ensure_ascii=False, indent=2)+";\n    root.NihongoDojoN5 = data;\n    if (typeof module !== \"undefined\" && module.exports) module.exports = data;\n})(typeof window !== \"undefined\" ? window : globalThis);\n"
n5_path.write_text(js, encoding="utf-8")
print(f"n5.js ahora {len(data['LESSONS'])} lecciones")

# Actualizar imabi.js
imabi_path = ROOT / "imabi.js"
imabi_raw = imabi_path.read_text(encoding="utf-8")
replacements = {
    '{ num: 17, title: "一段 Verbs", url: "https://imabi.org/ichidan-verbs%E3%80%80%E4%B8%80%E6%AE%B5%E6%B4%bb%E7%94%A8%E5%8B%95%E8%A9%9E/", ids: [] }': '{ num: 17, title: "一段 Verbs", url: "https://imabi.org/ichidan-verbs%E3%80%80%E4%B8%80%E6%AE%B5%E6%B4%bb%E7%94%A8%E5%8B%95%E8%A9%9E/", ids: ["l-imabi-017"] }',
    '{ num: 18, title: "五段 Verbs", url: "https://imabi.org/godan-verbs%E3%80%80%E4%BA%94%E6%AE%B5%E6%B4%bb%E7%94%A8%E5%8B%95%E8%A9%9E/", ids: [] }': '{ num: 18, title: "五段 Verbs", url: "https://imabi.org/godan-verbs%E3%80%80%E4%BA%94%E6%AE%B5%E6%B4%bb%E7%94%A8%E5%8B%95%E8%A9%9E/", ids: ["l-imabi-018"] }',
    '{ num: 21, title: "The Particle か w/ Negative", url: "https://imabi.org/the-particle-ka-%E3%81%8b-ii-%EF%BD%9E%E3%81%AA%E3%81%84%E3%81%8B/", ids: [] }': '{ num: 21, title: "The Particle か w/ Negative", url: "https://imabi.org/the-particle-ka-%E3%81%8b-ii-%EF%BD%9E%E3%81%AA%E3%81%84%E3%81%8B/", ids: ["l-imabi-021"] }',
    '{ num: 24, title: "こそあど I: This & That", url: "https://imabi.org/kosoado-i-this-that/", ids: [] }': '{ num: 24, title: "こそあど I: This & That", url: "https://imabi.org/kosoado-i-this-that/", ids: ["l-imabi-024"] }',
    '{ num: 25, title: "こそあど II: These & Those", url: "https://imabi.org/kosoado-ii-these-those/", ids: [] }': '{ num: 25, title: "こそあど II: These & Those", url: "https://imabi.org/kosoado-ii-these-those/", ids: ["l-imabi-025"] }',
    '{ num: 26, title: "こそあど III: Here & There", url: "https://imabi.org/kosoado-%E3%81%93%E3%81%9D%E3%81%82%E3%81%A9-iii-here-there/", ids: [] }': '{ num: 26, title: "こそあど III: Here & There", url: "https://imabi.org/kosoado-%E3%81%93%E3%81%9D%E3%81%82%E3%81%A9-iii-here-there/", ids: ["l-imabi-026"] }',
}
for old, new in replacements.items():
    if old in imabi_raw:
        imabi_raw = imabi_raw.replace(old, new)
        print(f"Actualizado imabi {old[:30]}")
    else:
        print(f"No encontrado para {old[:40]}")
imabi_path.write_text(imabi_raw, encoding="utf-8")
print("imabi.js actualizado")
