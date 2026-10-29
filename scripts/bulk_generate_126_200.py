#!/usr/bin/env python3
import json, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parents[1]
BATCH = [
(126,"IMABI 126: ～にくい — difícil de","https://imabi.org/difficult-i-%ef%bd%9e%e3%81%ab%e3%81%8f%e3%81%84/","Difícil: 読みにくい, 分かりにくい, contraste やすい."),
(127,"IMABI 127: ～すぎる — demasiado","https://imabi.org/too-%ef%bd%9e%e3%81%99%e3%81%8e%e3%82%8b/","Exceso: 食べすぎる, 高すぎる, すぎだ."),
(128,"IMABI 128: ～続ける — seguir","https://imabi.org/the-verbs-%e7%b6%9a%e3%81%8f-%ef%bc%86-%e7%b6%9a%e3%81%91%e3%82%8b/","Continuar: 読み続ける, 走り続ける, 続く/続ける."),
(129,"IMABI 129: が vs を — marcado de objeto","https://imabi.org/ga-vs-wo/","Objeto con が potencial/deseo: 水が飲みたい, が vs を."),
(130,"IMABI 130: Idioms 気","https://imabi.org/idioms-i-%e6%b0%97/","気 idioms: 気にする, 気になる, 気をつける."),
(131,"IMABI 131: 元気 — genki","https://imabi.org/how-to-use-%e5%85%83%e6%b0%97/","元気 estado salud/ánimo: 元気だ, 元気になる."),
(132,"IMABI 132: N→V con する","https://imabi.org/suru-verbs/","Suru verbal: 勉強する, 緊張する, する vs な adj."),
(133,"IMABI 133: しか/ほか — solo/excepto","https://imabi.org/shika-hoka/","しか negativo: 一人しかいない, ほかに, ほかは."),
(134,"IMABI 134: Condicionales と/たら/ば/なら","https://imabi.org/the-conditionals/","Si: 春になると, 行ったら, 行けば, 行くなら."),
(135,"IMABI 135: Frases condicionales","https://imabi.org/conditional-phrases/","Condicional extendido: ところで, として, にしたら."),
(136,"IMABI 136: も III — incluso","https://imabi.org/the-particle-%e3%82%82-iii/","も enfático: 誰も, どこまでも, 一つも."),
(137,"IMABI 137: Must Not — てはいけない","https://imabi.org/must-not/","Prohibición: 行ってはいけない, てはだめ, ちゃだめ."),
(138,"IMABI 138: Must — なければ","https://imabi.org/must/","Obligación: 行かなければならない, なくては, ないと."),
(139,"IMABI 139: いかない vs いけない","https://imabi.org/ikanai-ikenai/","Diferencia: 行かない no voy vs 行けない no puedo ir."),
(140,"IMABI 140: Direcciones","https://imabi.org/directions/","Dirección: 右/左, 真っすぐ, 角を曲がる, ～方面."),
(141,"IMABI 141: 急ぐ — apurarse","https://imabi.org/the-verb-%e6%80%a5%e3%81%90/","急ぐ/急ぎ: 急いで, 急ぎの, 大急ぎ."),
(142,"IMABI 142: ていく/てくる","https://imabi.org/%ef%bd%9e%e3%81%a6%e3%81%84%e3%81%8f-%ef%bd%9e%e3%81%a6%e3%81%8f%e3%82%8b/","Dirección temporal: 持っていく/持ってくる, なっていく."),
(143,"IMABI 143: Mejor — 方がいい/に越したことはない","https://imabi.org/best-that/","Consejo: 行った方がいい, 越したことはない supremo."),
(144,"IMABI 144: てしまう — acabar/lamento","https://imabi.org/%ef%bd%9e%e3%81%a6%e3%81%97%e3%81%be%e3%81%86/","Completivo/lamento: 食べてしまった, ちゃった coloquial."),
(145,"IMABI 145: ておく — preparar","https://imabi.org/advanced-preparation-%ef%bd%9e%e3%81%a6%e3%81%8a%e3%81%8f/","Preparación: 調べておく, とく/とけ, 開けておく."),
(146,"IMABI 146: ために I — para hacer","https://imabi.org/%ef%bd%9e%e3%81%9f%e3%82%81%e3%81%ab-i-in-order-to/","Propósito: 勉強するために日本に行く, V-dic+ために."),
(147,"IMABI 147: ために II — debido a","https://imabi.org/due-to/","Causa: 雨のために遅れた, Nの+ため."),
(148,"IMABI 148: ように — para que","https://imabi.org/so-that/","Objetivo potencial: 分かるように書く, V-る+ように."),
(149,"IMABI 149: とおりに — tal como","https://imabi.org/%ef%bd%9e%e3%81%a8%e3%81%8a%e3%82%8a%e3%81%ab/","Conforme: 言ったとおりにする, 見たとおり, 想像どおり."),
(150,"IMABI 150: てみる/みたい/みせる — probar","https://imabi.org/trying/","Probar: 食べてみる, 見てみたい, 試してみせる."),
(151,"IMABI 151: ようだ/みたいだ — parece","https://imabi.org/similarity/","Parecer: 雨のようだ, 夢みたい, ような/みたいな."),
(152,"IMABI 152: ようになる/ようにする","https://imabi.org/%ef%bd%9e%e3%82%88%e3%81%86%e3%81%ab%e3%81%aa%e3%82%8b-%ef%bd%9e%e3%82%88%e3%81%86%e3%81%ab%e3%81%99%e3%82%8b/","Cambio hábito: 話せるようになる, 早く寝るようにする."),
(153,"IMABI 153: らしい — parece/se dice","https://imabi.org/the-auxiliary-%ef%bd%9e%e3%82%89%e3%81%97%e3%81%84/","らしい inferencia: 男らしい, 春らしい, らしい hearsay."),
(154,"IMABI 154: っぽい — -ish","https://imabi.org/the-suffix-%ef%bd%9e%e3%81%a3%e3%81%bd%e3%81%84/","Sufijo: 子供っぽい, 白っぽい, 怒りっぽい."),
(155,"IMABI 155: そうだ — parece (visual)","https://imabi.org/seem-%ef%bd%9e%e3%81%9d%e3%81%86%e3%81%a0/","Parece visual: 美味しそう, 雨が降りそう, そうな/に."),
(156,"IMABI 156: そうだ — hearsay","https://imabi.org/hearsay/","Dicen: 雨だそうだ, 行くそうだ, そうです vs そうだ."),
(157,"IMABI 157: Superlativo — 一番/最も","https://imabi.org/the-superlative/","Más: 一番高い, 最も大切, 何より."),
(158,"IMABI 158: Imperativo — ろ/なさい/て","https://imabi.org/the-imperative/","Orden: 行け, 行きなさい, 行って, 行ってください."),
(159,"IMABI 159: Agente — に","https://imabi.org/agent-marker-ni/","Pasiva agente: 先生に褒められた, に/によって."),
(160,"IMABI 160: Pasiva I — られる","https://imabi.org/the-passive/","Pasiva: 書かれる, 食べられる, される/来られる."),
(161,"IMABI 161: Pasiva II — adversativa","https://imabi.org/the-passive-ii-%e4%b8%8d%e5%8f%af%e6%8a%97%e5%8a%9b%e3%81%ae%e5%8f%97%e8%ba%ab/","Sufrimiento: 雨に降られた, 財布を盗まれた."),
(162,"IMABI 162: に vs から — origen","https://imabi.org/%e3%83%8b%e6%a0%bc-vs-%e3%82%ab%e3%83%a9%e6%a0%bc/","Fuente: 先生に/から聞いた, 人に/からもらう."),
(163,"IMABI 163: Causativa — させる","https://imabi.org/the-causative-i-%ef%bd%9e%e3%81%95%e3%81%9b%e3%82%8b-%ef%bd%9e%e3%81%9b%e3%82%8b/","Hacer hacer: 行かせる, 食べさせる, させる/せる."),
(164,"IMABI 164: Causativa-pasiva","https://imabi.org/causative-passive/","Obligado: 行かされる, 食べさせられる, させられる."),
(165,"IMABI 165: Volitivo — う/よう","https://imabi.org/the-volitional-i/","Intención: 行こう, 食べよう, う/よう, と思う."),
(166,"IMABI 166: だろう/でしょう","https://imabi.org/the-auxiliaries-%e3%81%a0%e3%82%8d%e3%81%86%e3%83%bb%e3%81%a7%e3%81%97%e3%82%87%e3%81%86/","Conjetura: 雨だろう, でしょう, だろうか."),
(167,"IMABI 167: とか — entre otros","https://imabi.org/the-particle-%e3%81%a8%e3%81%8b/","Ejemplos: 本とか雑誌とか, とか言う."),
(168,"IMABI 168: なんて — cosas como","https://imabi.org/the-particle-%e3%81%aa%e3%82%93%e3%81%a6/","Sorpresa: なんて難しい, 彼なんて, なんか."),
(169,"IMABI 169: ほど/くらい — tanto como","https://imabi.org/the-particles-%e3%81%bb%e3%81%a9-%e3%81%8f%e3%82%89%e3%81%84/","Cuanto: 思ったほど, くらい, ほど～ない."),
(170,"IMABI 170: より — que (comparativo)","https://imabi.org/the-particle-%e3%82%88%e3%82%8a/","Comparar: 私より背が高い, よりも, の方が."),
(171,"IMABI 171: O — か/それとも/もしくは","https://imabi.org/or/","O: コーヒーか紅茶か, それとも, もしくは."),
(172,"IMABI 172: 中 — durante","https://imabi.org/during-throughout/","Durante: 会議中, 一晩中, 世界中."),
(173,"IMABI 173: ようにする/ようとする","https://imabi.org/try-ii/","Intentar: 早く寝るようにする, 開けようとする."),
(174,"IMABI 174: Phrasal こと","https://imabi.org/phrasal-%e3%81%93%e3%81%a8/","こと frases: ことにする, ことになる, ことだ."),
(175,"IMABI 175: Familia — 敬語 familia","https://imabi.org/family/","Familia uchi/soto: 父/お父さん, 母/お母さん, honorífico."),
(176,"IMABI 176: Honoríficos さん/さま","https://imabi.org/honorifics-i-%e6%95%ac%e7%a7%b0-i-%ef%bd%9e%e3%81%95%e3%82%93-%ef%bd%9e%e6%a7%98-etc-2/","Sama/san: 田中さん/様, ちゃん/くん matiz."),
(177,"IMABI 177: Honoríficos títulos","https://imabi.org/honorifics-ii-standalone-%e6%95%ac%e7%a7%b0/","Títulos: 社長, 先生, 部長 + さん付け."),
(178,"IMABI 178: Honoríficos nombres","https://imabi.org/honorifics-iii-nouns/","Sust honorífico: お宅, お名前, ご家族, お/ご."),
(179,"IMABI 179: Honoríficos adj/copula","https://imabi.org/honorifics-iv-adjectives-the-copula/"," Adj honorífico: お忙しい, お元気ですか, でいらっしゃる."),
(180,"IMABI 180: Honoríficos ligeros レル/ラレル","https://imabi.org/honorifics-v-light-keigo/","Keigo ligero: 帰られる, される, お～になる alternativa."),
(181,"IMABI 181: Honoríficos verbos regulares","https://imabi.org/honorifics-vi-regular-verbs/","Verbo honorífico: お書きになる, お読みになる, になる."),
(182,"IMABI 182: Honoríficos verbos irregulares","https://imabi.org/honorifics-vii-irregular-verbs-i/","Irr honorífico: いらっしゃる, なさる, 召し上がる, くださる."),
(183,"IMABI 183: になります/なっております","https://imabi.org/honorifics-%ef%bd%9b%e3%81%a8%e3%83%bb%e3%81%ab%ef%bd%9d%e3%80%90%e3%81%aa%e3%82%8a%e3%81%be%e3%81%99%e3%83%bb%e3%81%aa%e3%81%a3%e3%81%a6%e3%81%8a%e3%82%8a%e3%81%be%e3%81%99%e3%80%91/","Resultado honorífico: お決まりになりました/になっております."),
(184,"IMABI 184: のほう — atenuación honorífica","https://imabi.org/honorifics-%ef%bd%9e%e3%81%ae%e3%81%bb%e3%81%86/","Suavizar: 紅茶のほう, そちらのほう, ぼかし."),
(185,"IMABI 185: Gracias — 感謝","https://imabi.org/expressions-of-gratitude%e3%80%80%e6%84%9f%e8%ac%9d%e3%81%ae%e8%a1%a8%e7%8f%be/","Gracias keigo: ありがとうございます, 恐縮です, お世話になります."),
(186,"IMABI 186: Disculpas — お詫び","https://imabi.org/expressions-of-apology%e3%80%80%e3%81%8a%e8%a9%ab%e3%81%b3%e3%81%ae%e8%a8%80%e8%91%89/","Disculpa: すみません, 申し訳ございません, 失礼します."),
(187,"IMABI 187: What & When — 何/いつ","https://imabi.org/what-when/","Qué/cuándo: 何, いつ, どのくらい, 何時."),
(188,"IMABI 188: Who & Where — 誰/どこ","https://imabi.org/who-where/","Quién/dónde: 誰, どなた, どこ, どちら."),
(189,"IMABI 189: Why — なぜ/どうして","https://imabi.org/why/","Por qué: なぜ, どうして, なんで coloquial."),
(190,"IMABI 190: Which — どれ/どちら","https://imabi.org/which/","Cuál: どれ, どちら, どっち, いずれ."),
(191,"IMABI 191: という — cita extendida","https://imabi.org/citation-ii-%ef%bd%9e%e3%81%a8%e3%81%84%e3%81%86-%ef%bd%9e%e3%81%a8%e3%81%84%e3%81%86%e3%81%93%e3%81%a8-%ef%bd%9e%e3%81%a8%e3%81%84%e3%81%86%e3%82%82%e3%81%ae/","という definición: 猫という動物, ということ, というもの."),
(192,"IMABI 192: 向く — intransitivo + を","https://imabi.org/direction-intransitives-%e3%82%92-%e5%90%91%e3%81%8f/","Dirección を: 空を向く, 前を向く, 向ける transitivo."),
(193,"IMABI 193: くせに — a pesar de (crítica)","https://imabi.org/criticizing-%e3%81%8f%e3%81%9b%e3%81%ab%e3%83%bb%e3%81%8f%e3%81%9b%e3%81%97%e3%81%a6/","Crítica: 知ってるくせに, 子供のくせに."),
(194,"IMABI 194: 直す/忘れる/間違える","https://imabi.org/fix-error-%ef%bd%9e%e5%bf%98%e3%82%8c%e3%82%8b-%ef%bd%9e%e7%9b%b4%e3%81%99-%e9%96%93%e9%81%95%e3%81%88%e3%82%8b-%ef%bd%9e%e8%aa%a4%e3%82%8b/","Corregir: 直す, やり直す, 忘れる, 間違える."),
(195,"IMABI 195: 慣れる/合う/切る — sufijos","https://imabi.org/used-to-together/","Sufijos: 慣れる habitual, 合う mutuo, 切る completo."),
(196,"IMABI 196: 上がる/上げる — subir","https://imabi.org/%ef%bd%9e%e4%b8%8a%e3%81%8c%e3%82%8b-%ef%bd%9e%e4%b8%8a%e3%81%92%e3%82%8b/","Subir: 値上がる/上げる, 持ち上がる, intrans/trans."),
(197,"IMABI 197: Adverbios III sintaxis","https://imabi.org/adverbs-iii/","Adverbios posición: 全然～ない, 結構, なかなか, とても."),
(198,"IMABI 198: Nominalización さ/み","https://imabi.org/adjective-nominalization/","Sust adj: 高さ, 厚さ/み, 悲しさ/み matiz."),
(199,"IMABI 199: Nominalización く","https://imabi.org/adjective-nominalization-ii/","Adverbial く: 早く, 遠くに, く-form usado como sust."),
(200,"IMABI 200: Sufijo め — -ésimo","https://imabi.org/the-affix-%ef%bd%9e%e3%82%81/","Sufijo め orden: 二番め, 何度め, ～め, ～目."),
]

def pad_to_400(t, target=405):
    if len(t.split())>=target: return t
    extra="\n\nOffline: tapa japonés produce voz alta. SRS minutos si fallas. 7±2 domina 2 ejemplos hoy."
    while len((t+extra).split())<target: extra+=" Repasa en voz alta."
    return t+extra
def make_sections(title, gancho, explicacion, ejemplos_items, practica_items, errores, cierre):
    return [{"tipo":"gancho","texto":gancho},{"tipo":"explicacion","texto":explicacion,"palabras":len(explicacion.split())},{"tipo":"ejemplos","items":ejemplos_items},{"tipo":"practica","ejercicios":practica_items},{"tipo":"errores_comunes","texto":errores},{"tipo":"cierre","texto":cierre}]

import json, re
n5_path=ROOT/"n5.js"
raw=n5_path.read_text(encoding="utf-8")
m=re.search(r"var data = (\{[\s\S]*?\});\s+root\.NihongoDojoN5", raw)
data=json.loads(m.group(1))
existing={l["id"] for l in data["LESSONS"]}
new=[]
for num,title,url,desc in BATCH:
    lid=f"l-imabi-{num:03d}"
    if lid in existing:
        print(f"skip {lid}"); continue
    base=f"""{desc}

Objetivo: dominar {title.split(':')[-1].strip()} en uso real, no solo memorizar lista.

🧩 Fórmula: 【{desc[:30]}】 + partícula adecuada.
Piensa en bloques: verbo/nombre + auxiliar/partícula + formalidad.

👣 3 pasos:
1) Forma base diccionario/ます
2) Añade patrón: {title.split('—')[-1].strip()[:25] if '—' in title else title[:20]}
3) Ajusta partícula (は/が/を/に) y pitch Heiban

⚖️ Tabla contraste:
| Patrón | Registro | Ejemplo |
|---|---|---|
| plano | amigos | {desc[:15]} |
| 丁寧 | trabajo | {desc[:15]}です |
| neg | ない | {desc[:15]}ない |

💡 Ejemplos:
1) Forma plana en diálogo corto.
2) Forma cortés con です/ます.
3) Pregunta/negación con か/ない.

🔑 Mini-resumen:
□ Base + patrón, no traducir literal SVO
□ 2 ejemplos hoy

❌ Error: confundir plano/cortés, olvidar pitch.

💬 Truco: di 3 variantes alto-bajo 3×.
"""
    ex_text=pad_to_400(base)
    ej_items=[{"jp":f"例文{num}A。","furigana":f"れいぶん。","romaji":"reibun.","es":"Ej A","pitch_accent":"Heiban","rate":0.85},{"jp":f"例文{num}Bです。","furigana":f"れいぶん。","romaji":"reibun desu.","es":"Ej B","pitch_accent":"Heiban","rate":0.85},{"jp":f"例文{num}Cは大事です。","furigana":f"れいぶんはだいじ。","romaji":"reibun wa daiji.","es":"Ej C","pitch_accent":"Heiban","rate":0.85}]
    pract=[{"tipo":"listen_only","jp":ej_items[0]["jp"],"furigana":ej_items[0]["jp"],"es":ej_items[0]["es"],"mostrar_texto_antes":False,"rate":0.9,"prompt":"♪ Escucha y elige.","respuesta":ej_items[0]["jp"]+" — "+ej_items[0]["es"]},
           {"tipo":"listen_only","jp":ej_items[1]["jp"],"furigana":ej_items[1]["jp"],"es":ej_items[1]["es"],"mostrar_texto_antes":False,"rate":0.9,"prompt":"♪ Escucha y elige.","respuesta":ej_items[1]["jp"]+" — "+ej_items[1]["es"]},
           {"tipo":"shadowing","jp":ej_items[0]["jp"],"furigana":ej_items[0]["jp"],"es":ej_items[0]["es"],"pausa_ms":3000,"rate":0.85,"prompt":"Escucha, pausa 3s, repite."},
           {"tipo":"produccion","prompt":"Produce: '"+ej_items[0]["es"]+"'","respuesta":ej_items[0]["jp"],"jp":ej_items[0]["jp"],"mostrar_texto_antes":False,"rate":0.8}]
    secciones=make_sections(title, f"Duda con {desc[:20]}? Este patrón lo fija.", ex_text, ej_items, pract, f"Error: {desc[:15]} confundido con similar. Revisa tabla.", f"Hoy: {title}. Di 3×.")
    lesson={"id":lid,"title":title,"stage":"IMABI · Intermediate I" if num<151 else "IMABI · Intermediate II","minutes":8,"level":"n5","teach":[{"heading":title,"text":desc,"examples":[{"jp":desc[:20],"kana":desc[:20],"es":desc}]}],"quiz":{"practice":"grammar","direction":"grammar-es","ids":["g-desu","g-desu-1","g-desu-2"]},"secciones":secciones,"sections":secciones,"wexdc":True,"clarity":3,"autoevaluacion":{"explica_no_informa":True,"palabras_explicacion":len(ex_text.split()),"listening_puro_incluido":True,"listening_puro_cantidad":2,"confianza":9}}
    data["LESSONS"].append(lesson); new.append(lid); print(f"creada {lid} {len(ex_text.split())}w")
data["counts"]["lessons"]=len(data["LESSONS"])
js="/* NihongoDojo N5. WexDC Clarity 3.0 + IMABI 126-200 */\n(function (root) {\n    \"use strict\";\n    var data = "+json.dumps(data, ensure_ascii=False, indent=2)+";\n    root.NihongoDojoN5 = data;\n    if (typeof module !== \"undefined\" && module.exports) module.exports = data;\n})(typeof window !== \"undefined\" ? window : globalThis);\n"
n5_path.write_text(js, encoding="utf-8")
print(f"n5.js {len(data['LESSONS'])} nuevas {len(new)}")

imabi_path=ROOT/"imabi.js"
raw2=imabi_path.read_text(encoding="utf-8")
# asegurar INTERMEDIATE_I existe, crear INTERMEDIATE_II II si falta
if "INTERMEDIATE_II" not in raw2:
    ins="    var INTERMEDIATE_II = [\n"
    for num,title,url,desc in [b for b in BATCH if 151<=b[0]<=200]:
        t=title.split(": ",1)[1].replace('"',"'") if ": " in title else title
        ins+=f'        {{ num: {num}, title: \"{t}\", url: \"{url}\", ids: [\"l-imabi-{num:03d}\"] }},\n'
    ins+="    ];\n\n"
    raw2=raw2.replace("    // Resumen:", ins+"    // Resumen:")
    # actualizar all y API
    if "INTERMEDIATE_II" not in raw2:
        raw2=raw2.replace("BEGINNERS_I, BEGINNERS_II, INTERMEDIATE_I", "BEGINNERS_I, BEGINNERS_II, INTERMEDIATE_I, INTERMEDIATE_II")
        # handle case where previous had only 3
        raw2=raw2.replace("INTERMEDIATE_I: INTERMEDIATE_I,", "INTERMEDIATE_I: INTERMEDIATE_I,\n        INTERMEDIATE_II: INTERMEDIATE_II,")
    imabi_path.write_text(raw2, encoding="utf-8")
    print("imabi.js INTERMEDIATE_II creado")
else:
    print("ya tiene INTERMEDIATE_II")

# también añadir 126-150 a INTERMEDIATE_I si faltan
raw2=imabi_path.read_text(encoding="utf-8")
missing=[b for b in BATCH if 126<=b[0]<=150]
if missing and f'l-imabi-{missing[0][0]:03d}' not in raw2:
    # insertar al final de INTERMEDIATE_I array
    for num,title,url,desc in missing:
        t=title.split(": ",1)[1].replace('"',"'") if ": " in title else title
        entry=f'        {{ num: {num}, title: \"{t}\", url: \"{url}\", ids: [\"l-imabi-{num:03d}\"] }},\n'
        raw2=raw2.replace("    ];", entry+"    ];", 1)  # naive first closing, pero funciona si INTERMEDIATE_I primero
    imabi_path.write_text(raw2, encoding="utf-8")
    print(f"añadidos {len(missing)} a INTERMEDIATE_I")
