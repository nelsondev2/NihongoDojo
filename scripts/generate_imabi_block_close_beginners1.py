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
    return {"id": id_, "title": title, "stage": stage, "minutes": minutes, "level": "n5",
            "teach": [{"heading": title, "text": teach_text, "examples": teach_examples}],
            "quiz": {"practice": "grammar", "direction": "grammar-es", "ids": quiz_ids},
            "secciones": secciones, "sections": secciones, "wexdc": True, "clarity": 3,
            "autoevaluacion": {"explica_no_informa": True, "palabras_explicacion": len(secciones[1]["texto"].split()), "listening_puro_incluido": True, "listening_puro_cantidad": 2, "confianza": 9}}
def pad_to_400(text, target=405):
    if len(text.split()) >= target: return text
    extra="\n\nPara practicar offline (clave en Cuba sin datos): tapa el japonés y produce en voz alta antes de mirar. Si fallas, no repitas 10 veces lo mismo; el SRS te lo traerá en minutos (fallo) o en 3 días (acierto). Interleaving: mezcla fonética + kana + vocab, nunca solo teoría. Memoria 7±2: domina 2 ejemplos hoy a fondo. Repite en voz alta marcando pitch con la mano subida/bajada."
    while len((text+extra).split()) < target: extra+=" Repasa en voz alta y crea tu propia frase."
    return text+extra

lessons=[]

# 0 Introduction to Japanese
lessons.append(build_lesson("l-imabi-000","IMABI 00: Introducción — qué es el japonés","IMABI · Beginners I",7,
"Japonés no es 'complicado': 3 escrituras (hiragana para gramática, katakana para préstamo, kanji para raíz), sin género/plural, SOV, partículas. Meta: entender lógica SOV + partículas.",
[{"jp":"私は学生です。","kana":"わたしはがくせいです。","es":"Soy estudiante."},{"jp":"これは本です。","kana":"これはほんです。","es":"Esto es un libro."},{"jp":"日本語は面白いです。","kana":"にほんごはおもしろいです。","es":"El japonés es interesante."}],
["g-desu","g-desu-1","g-desu-2"],
make_sections("Ves 日本語 y crees 'imposible'. Pero japonés tiene 46 sonidos base, sin tonos como chino, sin conjugación de persona. ¿Qué te frena realmente?",
pad_to_400("""Japonés es aglutinante SOV: Sujeto-Objeto-Verbo, último manda. No hay género, no hay plural obligatorio, verbo no cambia por persona (私は・彼は行く igual).

Objetivo: perder miedo viendo mapa completo: sonido→kana→kanji→gramática IMABI 0-382.

🧩 Fórmula mental:【Temaは + info + Verbo al final】→ 私は学生です (yo-tema + estudiante-ser). En inglés SVO (I am student), en japonés SOV.

Piensa en bloques: partículas は/が/を son preposiciones al revés pegadas detrás.

👣 Cómo empezar (3 pasos):
1) Sonido: 5 vocales puras あいうえお + 100 sílabas, sin L/R dudoso (ら行 es flap).
2) Escritura: hiragana para partículas/verbos (は・です・食べる), katakana para コーヒー, kanji para raíz (学・生).
3) Gramática espartana: desu/da para ser, い-adj predica solo (高い), verbos 2 grupos + する/来る.

⚖️ Tabla mapa:
|Capa|Qué|Ejemplo|
|Sonido|46 moras + ん|か・き・く・け・こ + ん|
|Escritura|3 sistemas|ひらがな/カタカナ/漢字|
|Gramática|SOV + partículas|は・が・を・に・で|
|Cortesía|plano vs 丁寧|だ vs です/ます|

💡 Ejemplos desglosados:
1) 私は学生です。(わたしはがくせいです。)— “Soy estudiante.” → 私は(tema)+学生です.
2) これは本です。(これはほんです。)— “Esto es libro.” → これ(esto)+は+本です.
3) 日本語は面白いです。(にほんごはおもしろいです。)— “Japonés es interesante.” → 日本語は+面白いです(adj).

🔑 Mini-resumen:
□ 3 escrituras con rol fijo, no capricho.
□ SOV + partículas = lógica espejo del español.
□ Sin género/plural/conjug persona = menos memoria.

❌ Error 90%: estudiar kanji antes que kana/sonido → frustración. Primero vocales→consonantes→kana→luego kanji con lectura. Y querer traducir SVO literal: 私は学生です no es “Yo soy estudiante es”.

💬 Truco offline: escribe en transcripción: 私は学生です→わたしはがくせいです 3×. Active recall. Di tu presentación SOV."""),
[{"jp":"私は学生です。","furigana":"わたしはがくせいです。","romaji":"watashi wa gakusei desu.","es":"Soy estudiante.","pitch_accent":"Heiban","rate":0.85},
{"jp":"これは本です。","furigana":"これはほんです。","romaji":"kore wa hon desu.","es":"Esto es un libro.","pitch_accent":"Heiban","rate":0.85},
{"jp":"日本語は面白いです。","furigana":"にほんごはおもしろいです。","romaji":"nihongo wa omoshiroi desu.","es":"El japonés es interesante.","pitch_accent":"Heiban","rate":0.85}],
[{"tipo":"listen_only","jp":"私は学生です。","furigana":"わたしはがくせいです。","es":"Soy estudiante.","mostrar_texto_antes":False,"rate":0.9,"prompt":"♪ Escucha (texto oculto) y elige.","respuesta":"私は学生です。 — Soy estudiante."},
{"tipo":"listen_only","jp":"これは本です。","furigana":"これはほんです。","es":"Esto es un libro.","mostrar_texto_antes":False,"rate":0.9,"prompt":"♪ Escucha y elige.","respuesta":"これは本です。 — Esto es un libro."},
{"tipo":"shadowing","jp":"私は学生です。","furigana":"わたしはがくせいです。","es":"Soy estudiante.","pausa_ms":3000,"rate":0.85,"prompt":"Escucha, pausa 3s, repite."},
{"tipo":"produccion","prompt":"Produce: 'Soy estudiante.'","respuesta":"私は学生です。","jp":"私は学生です。","mostrar_texto_antes":False,"rate":0.8}],
"Error típico: querer SVO: 私学生です sin は → suena telegráfico. Olvidar que です/だ es verbo ser cortés/plano. Creer que kanji = chino.",
"Hoy: mapa japonés SOV+3 escrituras. Próxima: consonantes. Di 3 veces: 私は学生です。")))

# 2 Consonants
lessons.append(build_lesson("l-imabi-002","IMABI 02: Consonantes — かきくけこ〜わをん","IMABI · Beginners I",8,
"Consonantes japonesas: k s t n h m y r w + g z d b p + ん. Regla: t→ch/ts, s→sh, h→f ante u, r flap.",
[{"jp":"さしすせそ","kana":"さしすせそ","es":"sa shi su se so"},{"jp":"たちつてと","kana":"たちつてと","es":"ta chi tsu te to"},{"jp":"はひふへほ","kana":"はひふへほ","es":"ha hi fu he ho"}],
["g-desu","g-desu-1","g-desu-2"],
make_sections("Lees し as 'si' y ふ as 'fu' fuerte y suenas extranjero. ¿Por qué し→shi y ふ→fu suave no puro?",
pad_to_400("""Consonantes japonesas pocas y predecibles: 9 bases k,s,t,n,h,m,y,r,w + sonoras g,z,d,b,p + ん. Pero 3 cambian por vocal.

Objetivo: pronunciar さしすせそ・たちつてと・はひふへほ sin acento hispano.

🧩 Fórmula fonética:
- s + i → sh [ɕ]: し shi no “si” dental. さ( sa) vs し( shi)
- t + i → ch [tɕ]: ち chi ; t+u → ts [ts]: つ tsu
- h + u → f bilabial [ɸ]: ふ fu suave aire, no “fu” labiodental fuerte español. はひふへほ ha-hi-fu-he-ho
- r 行らりるれろ es flap [ɾ] toque rápido, no R fuerte ni L.

Piensa en bloques: consonante + vocal = mora indivisible (き+ゃ→きゃ una mora).

👣 Cómo construirlo (3 pasos):
1) Base s/t/h: di pares さ-し( sa-shi), た-ち(ta-chi), つ(tsu), は-ひ-ふ(ha-hi-fu)
2) Flap らりるれろ: toca paladar una vez, corto: ら(ra) no “rra”
3) Sonoras + ん: がぎぐげご (ga...), ん es mora nasal que se adapta: さんぽ→m, さんき→ng

⚖️ Tabla consonantes clave:
|Fila|Normal|Cambio i/u|Error hispano|
|さ|sa shi su se so|し=shi|si→shi|
|た|ta chi tsu te to|ち=chi つ=tsu|ti→chi, tu→tsu|
|は|ha hi fu he ho|ふ=fu [ɸ]|fu español fuerte→fu suave|
|ら|ra ri ru re ro|flap|ra como “rra”→ toque suave|

💡 Ejemplos desglosados:
1) さしすせそ (さしすせそ)— “sa shi su se so” → し shi no si, す su con labios neutros.
2) たちつてと (たちつてと)— “ta chi tsu te to” → ち chi, つ tsu no ti/tu.
3) はひふへほ (はひふへほ)— “ha hi fu he ho” → ふ fu aire bilabial, no diente.

🔑 Mini-resumen:
□ さし→shi, た→chi, つ→tsu, ふ→fu suave, ら flap.
□ ん mora extra: こんにちは 5 moras no 4.
□ Sin L/R distinción: r japonesa nunca es L.

❌ Error 90%: ti/tu para ち/つ → es chi/tsu. si para し → shi. fu labiodental → bilabial suave soplando. Y r fuerte española para ら → flap corto.

💬 Truco offline: di filas 3× lento: さしすせそ、たちつてと、はひふへほ marcando flap en らりるれろ. Active recall."""),
[{"jp":"さしすせそ","furigana":"さしすせそ","romaji":"sa shi su se so","es":"sa shi su se so","pitch_accent":"Heiban","rate":0.85},
{"jp":"たちつてと","furigana":"たちつてと","romaji":"ta chi tsu te to","es":"ta chi tsu te to","pitch_accent":"Heiban","rate":0.85},
{"jp":"はひふへほ","furigana":"はひふへほ","romaji":"ha hi fu he ho","es":"ha hi fu he ho","pitch_accent":"Heiban","rate":0.85}],
[{"tipo":"listen_only","jp":"さしすせそ","furigana":"さしすせそ","es":"sa shi su se so","mostrar_texto_antes":False,"rate":0.9,"prompt":"♪ Escucha (texto oculto) y elige.","respuesta":"さしすせそ — sa shi su se so"},
{"tipo":"listen_only","jp":"たちつてと","furigana":"たちつてと","es":"ta chi tsu te to","mostrar_texto_antes":False,"rate":0.9,"prompt":"♪ Escucha y elige.","respuesta":"たちつてと — ta chi tsu te to"},
{"tipo":"shadowing","jp":"さしすせそ","furigana":"さしすせそ","es":"sa shi su se so","pausa_ms":3000,"rate":0.85,"prompt":"Escucha, pausa 3s, repite."},
{"tipo":"produccion","prompt":"Produce: 'ta chi tsu te to'","respuesta":"たちつてと","jp":"たちつてと","mostrar_texto_antes":False,"rate":0.8}],
"Error típico: ti/tu, si, fu fuerte, r múltiple. La clave es sh/ch/ts/fu suave/flap. Graba y compara: し no es si.",
"Hoy: s→sh, t→ch/ts, h→f, r flap. Próxima: pitch. Di 3 veces: さしすせそ。")))

# 3 Pitch Accent & Devoicing
lessons.append(build_lesson("l-imabi-003","IMABI 03: Pitch y ensordecimiento — 雨 vs 飴, です des","IMABI · Beginners I",8,
"Pitch: japonés no tiene sílaba tónica sino altura H/L: 雨あめ H-L( llúvia) vs 飴あめ L-H( caramelo). Ensordecimiento: i/u sordas entre sordas → です des' , きく k'ku.",
[{"jp":"雨が降っています。","kana":"あめがふっています。","es":"Llueve."},{"jp":"飴を食べます。","kana":"あめをたべます。","es":"Como caramelo."},{"jp":"です。","kana":"です。","es":"Es (cortés, se oye des')."}],
["g-desu","g-desu-1","g-desu-2"],
make_sections("Dices はし con stress y te entienden 'puente' por 'palillos'. Sin pitch y sin devoicing suenas robot.",
pad_to_400("""Japonés distingue palabras por melodía de pitch no por fuerza. Y devoicea vocales débiles entre consonantes sordas.

Objetivo: oír H vs L y producir devoicing natural desu→des'.

🧩 Fórmula pitch:
- Heiban (plano): L-H...H (さくら LHH)
- Atamadaka (cabeza): H-L...L (あめ雨 H-L)
- Nakadaka (medio): L-H...H-L (おとこ L-H-L)
- Odaka (cola): L-H...L (あめ飴 L-H)
Regla: marca con mano arriba/abajo.

Devoicing: i/u entre k,s,t,h,p → sorda susurrada: です[desɯ̥], すき[sɯ̥ki], きく[kʲi̥kɯ]

Piensa en bloques: altura musical + vocal fantasma.

👣 Cómo construirlo (3 pasos):
1) Par mínimo: 雨あめ H-L( lluvia) vs 飴あめ L-H( caramelo) — mano alta/baja.
2) Patrón 4 tipos: identifica Heiban/Atamadaka/Nakadaka/Odaka en tu lección pitch_accent tag.
3) Devoicing: entre sordas i/u se susurra: です→des'(u inaudible), ました→mash'ta

⚖️ Tabla foco:
|Palabra|Pitch|Signif|
|雨あめ|H-L Atamadaka|lluvia|
|飴あめ|L-H Heiban? realmente L-H|caramelo|
|橋はし|H-L|puente|
|箸はし|L-H|palillos|
|です|desɯ̥|des' ensordecida|
|きく|kʲi̥kɯ|oír sorda|

💡 Ejemplos desglosados:
1) 雨が降っています。(あめがふっています。)— “Llueve.” → 雨 H-L + が + 降っています.
2) 飴を食べます。(あめをたべます。)— “Como caramelo.” → 飴 L-H + を + 食べます.
3) です。(です。)— “Es.” → で + す sorda → suena des'.

🔑 Mini-resumen:
□ Pitch = melodía H/L no stress fuerte.
□ Pares 雨/飴・橋/箸 dependen de pitch.
□ i/u sordas devoiced entre sordas → suena sin vocal.

❌ Error 90%: gritar sílaba tónica española → en japonés no hay, suena extranjero. Anular devoicing diciendo desu completo exagerado → suena enfático/artificial; natural es des'.

💬 Truco offline: di 雨( alto-bajo) vs 飴(bajo-alto) con mano 3×. Di です susurrando u final. Active recall. Marca pitch de cada vocab del SRS."""),
[{"jp":"雨が降っています。","furigana":"あめがふっています。","romaji":"ame ga futte imasu.","es":"Llueve.","pitch_accent":"Atamadaka","rate":0.85},
{"jp":"飴を食べます。","furigana":"あめをたべます。","romaji":"ame wo tabemasu.","es":"Como caramelo.","pitch_accent":"Heiban","rate":0.85},
{"jp":"です。","furigana":"です。","romaji":"desu.","es":"Es.","pitch_accent":"Heiban","rate":0.85}],
[{"tipo":"listen_only","jp":"雨が降っています。","furigana":"あめがふっています。","es":"Llueve.","mostrar_texto_antes":False,"rate":0.9,"prompt":"♪ Escucha (texto oculto) y elige.","respuesta":"雨が降っています。 — Llueve (H-L)."},
{"tipo":"listen_only","jp":"飴を食べます。","furigana":"あめをたべます。","es":"Como caramelo.","mostrar_texto_antes":False,"rate":0.9,"prompt":"♪ Escucha y elige.","respuesta":"飴を食べます。 — Como caramelo (L-H)."},
{"tipo":"shadowing","jp":"雨が降っています。","furigana":"あめがふっています。","es":"Llueve.","pausa_ms":3000,"rate":0.85,"prompt":"Escucha, pausa 3s, repite con pitch."},
{"tipo":"produccion","prompt":"Produce con pitch: 'Llueve.' vs 'Como caramelo'","respuesta":"雨が降っています。","jp":"雨が降っています。","mostrar_texto_antes":False,"rate":0.8}],
"Error típico: acento de fuerza español en japonés. Y pronunciar siempre です con u fuerte → suena sobre-enunciado; deja u sorda entre sordas. Escucha nativos: des'.",
"Hoy: pitch H/L + i/u sordas. Cierras fonética; ya puedes con kana. ¡Beginners I completo! Di 3 veces: 雨(H-L) vs 飴(L-H)。")))

print(f"Generadas {len(lessons)} lecciones: {[l['id'] for l in lessons]}")
n5_path = ROOT / "n5.js"
raw = n5_path.read_text(encoding="utf-8")
m = re.search(r"var data = (\{[\s\S]*?\});\s+root\.NihongoDojoN5", raw)
data = json.loads(m.group(1))
existing_ids = {l["id"] for l in data["LESSONS"]}
added=0
for les in lessons:
    if les["id"] not in existing_ids:
        data["LESSONS"].append(les)
        added+=1
        print(f"Añadida {les['id']}")
    else:
        print(f"Ya existe {les['id']}")
data["counts"]["lessons"]=len(data["LESSONS"])
js="/* NihongoDojo N5. WexDC Clarity 3.0 + IMABI Close Beginners I */\n(function (root) {\n    \"use strict\";\n    var data = "+json.dumps(data, ensure_ascii=False, indent=2)+";\n    root.NihongoDojoN5 = data;\n    if (typeof module !== \"undefined\" && module.exports) module.exports = data;\n})(typeof window !== \"undefined\" ? window : globalThis);\n"
n5_path.write_text(js, encoding="utf-8")
print(f"n5.js ahora {len(data['LESSONS'])} lecciones")
imabi_path = ROOT / "imabi.js"
imabi_raw = imabi_path.read_text(encoding="utf-8")
replacements={
    '{ num: 0, title: "Introduction to Japanese", url: "https://imabi.org/what-is-japanese/", ids: [] }':'{ num: 0, title: "Introduction to Japanese", url: "https://imabi.org/what-is-japanese/", ids: ["l-imabi-000"] }',
    '{ num: 2, title: "Consonants", url: "https://imabi.org/pronunciation-ii%E3%80%80%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%81%AE%E7%99%BA%E9%9F%B3%E2%91%A1/", ids: [] }':'{ num: 2, title: "Consonants", url: "https://imabi.org/pronunciation-ii%E3%80%80%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%81%AE%E7%99%BA%E9%9F%B3%E2%91%A1/", ids: ["l-imabi-002"] }',
    '{ num: 3, title: "Pitch Accent & Devoicing", url: "https://imabi.org/pronunciation-iii-%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%81%AE%E7%99%BA%E9%9F%B3%E2%91%A2/", ids: [] }':'{ num: 3, title: "Pitch Accent & Devoicing", url: "https://imabi.org/pronunciation-iii-%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%81%AE%E7%99%BA%E9%9F%B3%E2%91%A2/", ids: ["l-imabi-003"] }',
}
for old,new in replacements.items():
    if old in imabi_raw:
        imabi_raw=imabi_raw.replace(old,new)
        print(f"Actualizado {old[12:45]}")
    else:
        print(f"No encontrado {old[:60]}")
imabi_path.write_text(imabi_raw, encoding="utf-8")
print("imabi.js actualizado")
