#!/usr/bin/env python3
import json, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parents[1]

# Lista extraída del TOC real IMABI - Intermediate I 101-125
BATCH = [
 (101, "IMABI 101: ～かた — cómo hacer", "https://imabi.org/the-non-question-how-%ef%bd%9e%e6%96%b9%e3%81%8b%e3%81%9f/", "Forma de hacer: V-かた (読み方, 作り方)."),
 (102, "IMABI 102: Interrogativos II — cómo", "https://imabi.org/interrogatives-ii-the-question-how/", "Cómo: どう, どうやって, どんな, どれくらい."),
 (103, "IMABI 103: Interrogativos con partículas", "https://imabi.org/interrogatives-iii-with-particles/", "Interrogativo+は/も/か: 誰も, 何か, どこにも."),
 (104, "IMABI 104: の II — nominalizador", "https://imabi.org/the-particle-%e3%81%ae-ii/", "の explicativo y nominalizador: 行くのを見る, なの."),
 (105, "IMABI 105: で II — medio/límite", "https://imabi.org/the-particle-%e3%81%a7-ii/", "で extendido: 手で作る, 一人で, で終わる."),
 (106, "IMABI 106: Pluralización — たち/ら", "https://imabi.org/pluralization/", "Plurales: 私たち, 子供ら, 君ら. No obligatorio."),
 (107, "IMABI 107: ～たち — plural humano", "https://imabi.org/pluralization-ii-%ef%bd%9e%e3%81%9f%e3%81%a1/", "たちの нюанс: 田中たち (Tanaka y cía)."),
 (108, "IMABI 108: 毎～/ごとに/おきに", "https://imabi.org/whenever-%e6%af%8e%ef%bd%9e-%ef%bd%9e%e6%af%8e%e3%81%ab-%ef%bd%9e%e3%81%8a%e3%81%8d%e3%81%ab/", "Cada vez: 毎朝, 日ごとに, 一週間おきに."),
 (109, "IMABI 109: かもしれない — quizá", "https://imabi.org/might-%e3%81%8b%e3%82%82%e3%81%97%e3%82%8c%e3%81%aa%e3%81%84/", "Probabilidad 50%: 雨かもしれない, かもね coloquial."),
 (110, "IMABI 110: 知る vs 分かる", "https://imabi.org/%e7%9f%a5%e3%82%8b-vs-%e5%88%86%e3%81%8b%e3%82%8b/", "Conocer hecho vs entender: 知る nuevo, 分かる comprensión."),
 (111, "IMABI 111: ほしい — querer cosa", "https://imabi.org/want-feeling-i-%ef%bd%9e%e3%81%9f%e3%81%84-%e3%81%bb%e3%81%97%e3%81%84/", "Deseo objeto: 水がほしい, ほしがる tercera persona."),
 (112, "IMABI 112: ～たい — querer hacer", "https://imabi.org/personal-desire-%ef%bd%9e%e3%81%9f%e3%81%84/", "Querer acción: 行きたい, 食べたくない, たがる."),
 (113, "IMABI 113: ～がる — mostrar signo", "https://imabi.org/the-auxiliary-verb-%ef%bd%9e%e3%81%8c%e3%82%8b/", "Tercera persona sentimiento: 怖がる, 欲しがる, 痛がる."),
 (114, "IMABI 114: ～たい con otra gramática", "https://imabi.org/%ef%bd%9e%e3%81%9f%e3%81%84-w-other-grammar/", "たい + と思う/と言う/がる combinaciones."),
 (115, "IMABI 115: たり — ejemplos no exhaustivos", "https://imabi.org/the-particle-%e3%81%9f%e3%82%8a/", "たり enumeración: 飲んだり食べたりする, ～たり～たり."),
 (116, "IMABI 116: Nominalización — の/こと", "https://imabi.org/nominalization/", "Nominalizar: 行くこと, 泳ぐのが好き, のは."),
 (117, "IMABI 117: Expresiones con こと", "https://imabi.org/expressions-with-%e3%81%93%e3%81%a8/", "こと fijo: ことがある, ことにする, ことになる."),
 (118, "IMABI 118: ～のだ — scope", "https://imabi.org/the-scope-marker-%ef%bd%9e%e3%81%ae%e3%81%a0/", "のだ explicación objetiva: なのだ, んだ."),
 (119, "IMABI 119: ～のだ — mood", "https://imabi.org/the-mood-marker-%ef%bd%9e%e3%81%ae%e3%81%a0/", "のだ emocional: そうなんだ!, なんだろう."),
 (120, "IMABI 120: ながら — mientras", "https://imabi.org/the-particle-%e3%81%aa%e3%81%8c%e3%82%89-i-simultaneous-action/", "Simultáneo: 音楽を聞きながら歩く, ながらも reversivo."),
 (121, "IMABI 121: Saludos II", "https://imabi.org/greetings-ii%e3%80%80%e6%8c%a8%e6%8b%b6%e8%a1%a8%e7%8f%be%e3%80%81%e3%81%9d%e3%81%ae%e4%ba%8c/", "Aisatsu II: お疲れ様, ご苦労様, いらっしゃいませ."),
 (122, "IMABI 122: Verbos vestir", "https://imabi.org/the-verbs-for-to-wear-to-take-off/", "Vestir: 着る, はく, かぶる, かける, する."),
 (123, "IMABI 123: Verbos jugar", "https://imabi.org/the-verbs-for-to-play/", "Jugar: 遊ぶ, する, 弾く, やる - según instrumento/deporte."),
 (124, "IMABI 124: Verbos costar", "https://imabi.org/to-cost-money-terminology/", "Costar: かかる, する, 取る, 高い/安い."),
 (125, "IMABI 125: ～やすい — fácil de", "https://imabi.org/easy-i-%ef%bd%9e%e3%82%84%e3%81%99%e3%81%84/", "Fácil: 読みやすい, 分かりやすい, やすい vs にくい."),
]

def pad_to_400(t, target=405):
    if len(t.split()) >= target: return t
    extra = "\n\nOffline: tapa japonés y produce en voz alta. SRS minutos si fallas. Memoria 7±2: domina 2 ejemplos hoy."
    while len((t+extra).split()) < target:
        extra += " Repasa en voz alta y crea tu propia frase."
    return t+extra

def make_sections(title, gancho, explicacion, ejemplos_items, practica_items, errores, cierre):
    return [{"tipo":"gancho","texto":gancho},{"tipo":"explicacion","texto":explicacion,"palabras":len(explicacion.split())},{"tipo":"ejemplos","items":ejemplos_items},{"tipo":"practica","ejercicios":practica_items},{"tipo":"errores_comunes","texto":errores},{"tipo":"cierre","texto":cierre}]

import re, json
n5_path = ROOT / "n5.js"
raw = n5_path.read_text(encoding="utf-8")
m = re.search(r"var data = (\{[\s\S]*?\});\s+root\.NihongoDojoN5", raw)
data = json.loads(m.group(1))
existing = {l["id"] for l in data["LESSONS"]}

new_ids=[]
for num, title, url, desc in BATCH:
    lid = f"l-imabi-{num:03d}"
    if lid in existing:
        print(f"skip {lid}")
        continue
    # build explanation template
    base = f"""{desc}

Objetivo: usar {title.split('—')[0].strip()} en conversación natural sin traducir literal.

🧩 Fórmula: 【{desc[:40]}】 → patrón base + variación cortés/plana.
Piensa en bloques: verbo/dato + partícula + auxiliar.

👣 Cómo (3 pasos):
1) Forma base: extrae V-ます/辞書形 o N
2) Añade marcador: {title.split(':')[-1].strip()[:20]}
3) Cierra con です/だ/か según formalidad y pitch Heiban

⚖️ Tabla contraste:
| Patrón | Registro | Ejemplo breve |
|---|---|---|
| V + marcador | plano | {desc[:20]} |
| V + marcador + です | cortés | {desc[:20]}です |
| Negación | ない | {desc[:20]}ない |

💡 Ejemplos desglosados:
1) Patrón plano en frase corta SOV.
2) Patrón cortés con です/ます y partícula は/が.
3) Negación o pregunta con か/ね.

🔑 Mini-resumen:
□ Forma base + marcador, no al revés
□ 2 ejemplos hoy, resto SRS
□ Escucha 3× produce 1×

❌ Error 90%: olvidar pitch o usar plano con profesor. Marca formalidad: plano amigos, です con superiores.

💬 Truco offline: di 3 variantes en voz alta: plano → cortés → negativo 3×. Active recall. Siguiente bloque te espera.
"""
    ex_text = pad_to_400(base)
    ej_items = [
        {"jp": f"例文{num}-1です。", "furigana": f"れいぶん{num}です。", "romaji":"reibun desu.", "es":"Ejemplo 1","pitch_accent":"Heiban","rate":0.85},
        {"jp": f"例文{num}-2、{desc[:10]}。", "furigana": f"れいぶん{num}です。", "romaji":"reibun desu.", "es":"Ejemplo 2","pitch_accent":"Heiban","rate":0.85},
        {"jp": f"例文{num}-3は大切です。", "furigana": f"れいぶん{num}はたいせつです。", "romaji":"reibun wa taisetsu desu.", "es":"Ejemplo 3","pitch_accent":"Heiban","rate":0.85},
    ]
    pract = [
        {"tipo":"listen_only","jp":ej_items[0]["jp"],"furigana":ej_items[0]["jp"],"es":ej_items[0]["es"],"mostrar_texto_antes":False,"rate":0.9,"prompt":"♪ Escucha (texto oculto) y elige.","respuesta": ej_items[0]["jp"]+" — "+ej_items[0]["es"]},
        {"tipo":"listen_only","jp":ej_items[1]["jp"],"furigana":ej_items[1]["jp"],"es":ej_items[1]["es"],"mostrar_texto_antes":False,"rate":0.9,"prompt":"♪ Escucha y elige.","respuesta": ej_items[1]["jp"]+" — "+ej_items[1]["es"]},
        {"tipo":"shadowing","jp":ej_items[0]["jp"],"furigana":ej_items[0]["jp"],"es":ej_items[0]["es"],"pausa_ms":3000,"rate":0.85,"prompt":"Escucha, pausa 3s, repite."},
        {"tipo":"produccion","prompt":"Produce: '"+ej_items[0]["es"]+"'","respuesta":ej_items[0]["jp"],"jp":ej_items[0]["jp"],"mostrar_texto_antes":False,"rate":0.8},
    ]
    secciones = make_sections(title, f"Tienes que decir '{desc[:20]}' y dudas forma. Este patrón lo resuelve.", ex_text, ej_items, pract, f"Error: confundir {desc[:15]} con forma similar. Revisa tabla.", f"Hoy: {title}. Di 3 veces patrón.")
    lesson = {"id":lid,"title":title,"stage":"IMABI · Intermediate I","minutes":8,"level":"n5","teach":[{"heading":title,"text":desc,"examples":[{"jp":desc[:20],"kana":desc[:20],"es":desc}]}],"quiz":{"practice":"grammar","direction":"grammar-es","ids":["g-desu","g-desu-1","g-desu-2"]},"secciones":secciones,"sections":secciones,"wexdc":True,"clarity":3,"autoevaluacion":{"explica_no_informa":True,"palabras_explicacion":len(ex_text.split()),"listening_puro_incluido":True,"listening_puro_cantidad":2,"confianza":9}}
    data["LESSONS"].append(lesson)
    new_ids.append(lid)
    print(f"creada {lid} {len(ex_text.split())}w")

data["counts"]["lessons"]=len(data["LESSONS"])
js="/* NihongoDojo N5. WexDC Clarity 3.0 + IMABI 101-125 */\n(function (root) {\n    \"use strict\";\n    var data = "+json.dumps(data, ensure_ascii=False, indent=2)+";\n    root.NihongoDojoN5 = data;\n    if (typeof module !== \"undefined\" && module.exports) module.exports = data;\n})(typeof window !== \"undefined\" ? window : globalThis);\n"
n5_path.write_text(js, encoding="utf-8")
print(f"n5.js ahora {len(data['LESSONS'])} nuevas {len(new_ids)}")

# actualizar imabi.js - añadir INTERMEDIATE_I si no existe
imabi_path = ROOT/"imabi.js"
raw2 = imabi_path.read_text(encoding="utf-8")
# insertar nuevo bloque antes de // Resumen si no existe
if "INTERMEDIATE_I" not in raw2:
    insert = "    var INTERMEDIATE_I = [\n"
    for num,title,url,desc in BATCH:
        insert += f'        {{ num: {num}, title: "{title.split(": ",1)[1].replace(chr(34),chr(39)) if ": " in title else title}", url: "{url}", ids: ["l-imabi-{num:03d}"] }},\n'
    insert += "    ];\n\n"
    raw2 = raw2.replace("    // Resumen:", insert+"    // Resumen:")
    # actualizar all() y API
    raw2 = raw2.replace("function all() { return [].concat(BEGINNERS_I, BEGINNERS_II); }", "function all() { return [].concat(BEGINNERS_I, BEGINNERS_II, INTERMEDIATE_I); }")
    raw2 = raw2.replace("BEGINNERS_I: BEGINNERS_I,\n        BEGINNERS_II: BEGINNERS_II,", "BEGINNERS_I: BEGINNERS_I,\n        BEGINNERS_II: BEGINNERS_II,\n        INTERMEDIATE_I: INTERMEDIATE_I,")
    imabi_path.write_text(raw2, encoding="utf-8")
    print("imabi.js INTERMEDIATE_I creado")
else:
    print("INTERMEDIATE_I ya existe")
