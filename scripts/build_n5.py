#!/usr/bin/env python3
"""Genera n5.js a partir de la lista comunitaria y del español propio."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from n5_es import EN_ES, OVERRIDE, GROUP_BY_POS
from n5_grammar import GRAMMAR

VOCAB_PATH = Path("/tmp/openjlpt/n5-vocab.json")
KANJI_PATH = Path("/tmp/openjlpt/n5-kanji.json")
OUT = ROOT / "n5.js"

SURFACE = {"終る": "終わる", "曲る": "曲がる", "温い": "ぬるい"}
VERB_POS = {
    "v1", "v5b", "v5g", "v5k", "v5k-s", "v5m", "v5n", "v5r", "v5r-i",
    "v5s", "v5t", "v5u", "vk", "vs-i",
}
SURU_NOUNS = ["勉強", "旅行", "掃除", "洗濯", "料理", "散歩", "結婚", "質問", "練習", "買い物", "電話"]
GODAN = {
    "う": ("い", "って", "った", "わ"),
    "く": ("き", "いて", "いた", "か"),
    "ぐ": ("ぎ", "いで", "いだ", "が"),
    "す": ("し", "して", "した", "さ"),
    "つ": ("ち", "って", "った", "た"),
    "ぬ": ("に", "んで", "んだ", "な"),
    "ぶ": ("び", "んで", "んだ", "ば"),
    "む": ("み", "んで", "んだ", "ま"),
    "る": ("り", "って", "った", "ら"),
}
TE_NOTE = {
    "う": "Godan en う: う pasa a って.",
    "つ": "Godan en つ: つ pasa a って.",
    "る": "Godan en る: る pasa a って.",
    "む": "Godan en む: la forma て es んで.",
    "ぶ": "Godan en ぶ: la forma て es んで.",
    "ぬ": "Godan en ぬ: la forma て es んで.",
    "く": "Godan en く: く pasa a いて.",
    "ぐ": "Godan en ぐ: ぐ pasa a いで.",
    "す": "Godan en す: す pasa a して.",
}

KANJI_INFO = {
    "日": ("ひ", "día, sol", "numeros", "También にち y じつ. Como contador de días cambia."),
    "一": ("いち", "uno", "numeros", "ひと- en 一つ."),
    "国": ("くに", "país", "lugares", "On: コク, como en 外国."),
    "人": ("ひと", "persona", "gente", "Contador: ひとり, ふたり, y desde tres にん."),
    "年": ("ねん", "año", "tiempo", "También とし."),
    "大": ("おお", "grande", "adjetivos", "On: ダイ, como en 大学."),
    "十": ("じゅう", "diez", "numeros", "とお es la lectura de diez cosas, とお."),
    "二": ("に", "dos", "numeros", ""),
    "本": ("ほん", "libro", "escuela", "También cuenta cosas alargadas. On: ホン."),
    "中": ("なか", "dentro", "lugares", "On: チュウ."),
    "長": ("なが", "largo", "adjetivos", "On: チョウ, jefe."),
    "出": ("で", "salir", "verbos", "出す es だす."),
    "三": ("さん", "tres", "numeros", ""),
    "時": ("じ", "hora", "tiempo", "とき es el momento."),
    "行": ("い", "ir", "verbos", "行く es la excepción de la forma て."),
    "見": ("み", "ver", "verbos", ""),
    "月": ("つき", "luna, mes", "tiempo", "がつ en los meses, げつ en 月曜日."),
    "分": ("ふん", "minuto, parte", "tiempo", "1, 3, 6, 8 y 10 suenan ぷん. On: ブン."),
    "後": ("あと", "después", "tiempo", "うしろ es detrás."),
    "前": ("まえ", "antes, delante", "tiempo", ""),
    "生": ("せい", "vida, nacer", "otros", "学生 es がくせい."),
    "五": ("ご", "cinco", "numeros", ""),
    "間": ("あいだ", "intervalo", "tiempo", "On: カン, como en 時間."),
    "上": ("うえ", "encima", "lugares", "On: ジョウ."),
    "東": ("ひがし", "este", "lugares", "On: トウ, como en 東京."),
    "四": ("よん", "cuatro", "numeros", "También し. Al contar se prefiere よん."),
    "今": ("いま", "ahora", "tiempo", "On: コン, como en 今日."),
    "金": ("かね", "dinero, oro", "otros", "On: キン, como en 金曜日."),
    "九": ("きゅう", "nueve", "numeros", "También く."),
    "入": ("はい", "entrar", "verbos", "入る se lee はいる, no いる."),
    "学": ("がく", "estudio", "escuela", "学校 es がっこう."),
    "高": ("たか", "alto, caro", "adjetivos", "On: コウ."),
    "円": ("えん", "yen", "numeros", ""),
    "子": ("こ", "niño", "gente", ""),
    "外": ("そと", "fuera", "lugares", "On: ガイ, como en 外国."),
    "八": ("はち", "ocho", "numeros", ""),
    "六": ("ろく", "seis", "numeros", ""),
    "下": ("した", "debajo", "lugares", "On: カ, como en 地下."),
    "来": ("く", "venir", "verbos", "来る es irregular. On: ライ."),
    "気": ("き", "ánimo, aire", "otros", "On: キ, como en 天気."),
    "小": ("ちい", "pequeño", "adjetivos", "On: ショウ."),
    "七": ("なな", "siete", "numeros", "También しち."),
    "山": ("やま", "montaña", "naturaleza", "On: サン."),
    "話": ("はな", "hablar", "verbos", "On: ワ."),
    "女": ("おんな", "mujer", "gente", ""),
    "北": ("きた", "norte", "lugares", "On: ホク."),
    "午": ("ご", "mediodía", "tiempo", "午前 y 午後."),
    "百": ("ひゃく", "cien", "numeros", ""),
    "書": ("か", "escribir", "verbos", "On: ショ."),
    "先": ("さき", "previo, punta", "tiempo", "On: セン, como en 先生."),
    "名": ("な", "nombre", "gente", "On: メイ."),
    "川": ("かわ", "río", "naturaleza", ""),
    "千": ("せん", "mil", "numeros", ""),
    "水": ("みず", "agua", "naturaleza", "On: スイ."),
    "半": ("はん", "medio", "numeros", ""),
    "男": ("おとこ", "hombre", "gente", ""),
    "西": ("にし", "oeste", "lugares", "On: セイ o サイ."),
    "電": ("でん", "electricidad", "otros", ""),
    "無": ("な", "no hay", "otros", "On: ム, como en 無理, que ya no es N5."),
    "校": ("こう", "escuela", "escuela", "No tiene lectura kun de uso diario."),
    "語": ("ご", "idioma", "escuela", "日本語."),
    "土": ("つち", "tierra", "naturaleza", "On: ド."),
    "木": ("き", "árbol", "naturaleza", "On: モク."),
    "聞": ("き", "oír", "verbos", ""),
    "食": ("た", "comer", "verbos", "On: ショク."),
    "車": ("くるま", "coche", "transporte", "On: シャ."),
    "何": ("なに", "qué", "preguntas", "Delante de un contador, なん."),
    "南": ("みなみ", "sur", "lugares", "On: ナン."),
    "万": ("まん", "diez mil", "numeros", ""),
    "毎": ("まい", "cada", "tiempo", ""),
    "白": ("しろ", "blanco", "naturaleza", ""),
    "天": ("てん", "cielo", "naturaleza", ""),
    "母": ("はは", "madre", "gente", "De la propia. La de otro es お母さん."),
    "火": ("ひ", "fuego", "naturaleza", "On: カ, como en 火曜日. No es 日, aunque 火 también se lee ひ."),
    "右": ("みぎ", "derecha", "lugares", ""),
    "読": ("よ", "leer", "verbos", ""),
    "友": ("とも", "amigo", "gente", ""),
    "左": ("ひだり", "izquierda", "lugares", ""),
    "休": ("やす", "descansar", "verbos", ""),
    "父": ("ちち", "padre", "gente", "De la propia. El de otro es お父さん."),
    "雨": ("あめ", "lluvia", "naturaleza", ""),
    "丈": ("たけ", "estatura, solo", "otros", "En これだけ se lee だけ. No es un kanji de uso diario fuera de eso."),
    "誰": ("だれ", "quién", "preguntas", "Casi siempre se escribe en hiragana."),
    "貼": ("は", "pegar", "verbos", "切手を貼る. Casi siempre en hiragana en este nivel."),
}

HIRA_ROWS = [
    ("Vocales", ["あ", "い", "う", "え", "お"]),
    ("Fila ka", ["か", "き", "く", "け", "こ"]),
    ("Fila sa", ["さ", "し", "す", "せ", "そ"]),
    ("Fila ta", ["た", "ち", "つ", "て", "と"]),
    ("Fila na", ["な", "に", "ぬ", "ね", "の"]),
    ("Fila ha", ["は", "ひ", "ふ", "へ", "ほ"]),
    ("Fila ma", ["ま", "み", "む", "め", "も"]),
    ("Fila ya", ["や", "ゆ", "よ"]),
    ("Fila ra", ["ら", "り", "る", "れ", "ろ"]),
    ("Fila wa", ["わ", "を", "ん"]),
]
DAKU_ROWS = [
    ("Fila ga", ["が", "ぎ", "ぐ", "げ", "ご"]),
    ("Fila za", ["ざ", "じ", "ず", "ぜ", "ぞ"]),
    ("Fila da", ["だ", "ぢ", "づ", "で", "ど"]),
    ("Fila ba", ["ば", "び", "ぶ", "べ", "ぼ"]),
    ("Fila pa", ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"]),
]
YOON_ROWS = [
    ("kya, sha, cha", ["きゃ", "きゅ", "きょ", "しゃ", "しゅ", "しょ", "ちゃ", "ちゅ", "ちょ"]),
    ("nya, hya, mya, rya", ["にゃ", "にゅ", "にょ", "ひゃ", "ひゅ", "ひょ", "みゃ", "みゅ", "みょ", "りゃ", "りゅ", "りょ"]),
    ("gya, ja, bya, pya", ["ぎゃ", "ぎゅ", "ぎょ", "じゃ", "じゅ", "じょ", "びゃ", "びゅ", "びょ", "ぴゃ", "ぴゅ", "ぴょ"]),
]
KATA = str.maketrans(
    "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん"
    "がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ"
    "ゃゅょ",
    "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"
    "ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ"
    "ャュョ",
)


def kata_of(chars):
    return [ch.translate(KATA) for ch in chars]


def slug(text):
    out = []
    for ch in text:
        if ch.isalnum():
            out.append(ch.lower())
        elif out and out[-1] != "-":
            out.append("-")
    return "".join(out).strip("-")[:24] or "x"


def unique_es(rows, key):
    seen = {}
    for row in rows:
        es = row[key]
        if es in seen:
            row[key] = es + " (" + row.get("_label", es) + ")"
        seen[row[key]] = row


def word_record(item, es, group, note):
    surface = SURFACE.get(item["word"], item["word"])
    kana = item["reading"]
    kanji = surface if any("\u4e00" <= ch <= "\u9fff" for ch in surface) else ""
    if kanji == kana:
        kanji = ""
    return {
        "id": "w-" + item["id"],
        "surface": surface,
        "kana": kana,
        "kanji": kanji,
        "romaji": item.get("romaji") or "",
        "es": es,
        "group": group,
        "note": note,
        "pos": item["pos"],
        "source_word": item["word"],
    }


def gloss_for(item):
    key = (item["word"], item["reading"])
    if key in OVERRIDE:
        es, group, note = OVERRIDE[key]
        return es, group, note
    meaning = item["meanings"][0]
    if meaning not in EN_ES:
        raise SystemExit("sin español: " + item["word"] + " / " + meaning)
    group = GROUP_BY_POS.get(item["pos"][0], "otros")
    return EN_ES[meaning], group, ""


def is_true_verb(item):
    return any(p in VERB_POS for p in item["pos"])


def conj_verb(wid, surface, reading, pos, gloss):
    kind = "godan"
    if "v1" in pos:
        kind = "ichidan"
    elif "vk" in pos or reading == "くる":
        kind = "kuru"
    elif "vs-i" in pos or reading == "する" or reading.endswith("する"):
        kind = "suru"
    last = reading[-1]
    if kind == "ichidan":
        stem_k = reading[:-1]
        stem_j = surface[:-1]
        te_k, te_j = stem_k + "て", stem_j + "て"
        nai_k, nai_j = stem_k + "ない", stem_j + "ない"
        note = "Ichidan: se quita る y se añade て."
    elif kind == "kuru":
        stem_k, stem_j = "き", "来"
        te_k, te_j = "きて", "来て"
        nai_k, nai_j = "こない", "来ない"
        note = "Irregular. No es 来ります."
    elif kind == "suru":
        base_k = reading[:-2]
        base_j = surface[:-2]
        stem_k, stem_j = base_k + "し", base_j + "し"
        te_k, te_j = base_k + "して", base_j + "して"
        nai_k, nai_j = base_k + "しない", base_j + "しない"
        note = "Irregular. No es すります."
    else:
        if last not in GODAN:
            raise SystemExit("godan raro " + surface + " " + reading)
        i_row, te_end, ta_end, a_row = GODAN[last]
        if reading in ("いく", "ゆく"):
            te_end, ta_end = "って", "った"
            note = "Excepción: 行く hace 行って, no 行いて."
        else:
            note = TE_NOTE[last]
        stem_k = reading[:-1] + i_row
        stem_j = surface[:-1] + i_row
        te_k, te_j = reading[:-1] + te_end, surface[:-1] + te_end
        if reading == "ある":
            nai_k, nai_j = "ない", "ない"
            note = "ある niega con ない, no con あらない. La forma て es あって."
        else:
            nai_k = reading[:-1] + a_row + "ない"
            nai_j = surface[:-1] + a_row + "ない"
        ta_k, ta_j = reading[:-1] + ta_end, surface[:-1] + ta_end
    if kind != "godan":
        ta_k = te_k[:-1] + "た"
        ta_j = te_j[:-1] + "た"
    tai_k = stem_k + "たい"
    tai_j = stem_j + "たい"
    skip_tai = reading in ("ある", "いる") and "v1" in pos or reading == "ある"
    return {
        "id": wid,
        "label": surface,
        "dict": surface,
        "dictKana": reading,
        "stem": stem_j,
        "stemKana": stem_k,
        "te": te_j,
        "teKana": te_k,
        "nai": nai_j,
        "naiKana": nai_k,
        "ta": ta_j,
        "taKana": ta_k,
        "tai": "" if skip_tai else tai_j,
        "taiKana": "" if skip_tai else tai_k,
        "gloss": gloss,
        "polite": gloss + ", cortés",
        "negative": "no " + gloss,
        "past": gloss + ", pasado cortés",
        "plainNeg": "no " + gloss + ", plano",
        "plainPast": gloss + ", pasado plano",
        "want": "quiero " + gloss,
        "teNote": note,
        "kind": kind,
    }


def lesson(id, title, stage, minutes, heading, text, examples, quiz):
    return {
        "id": id,
        "title": title,
        "stage": stage,
        "minutes": minutes,
        "teach": [{"heading": heading, "text": text, "examples": examples}],
        "quiz": quiz,
    }


def main():
    vocab = json.load(VOCAB_PATH.open(encoding="utf-8"))
    kanji_src = json.load(KANJI_PATH.open(encoding="utf-8"))
    words = []
    missing_meaning = []
    for item in vocab:
        es, group, note = gloss_for(item)
        words.append(word_record(item, es, group, note))
    extras = [
        ("w-watashi", "私", "わたし", "yo", "gente", "En clase se usa わたし. わたくし es más formal."),
        ("w-wa", "は", "は", "partícula de tema", "particulas", "Se escribe ha y se lee wa."),
        ("w-ga", "が", "が", "partícula de foco", "particulas", "También marca lo que gusta o lo que hay."),
        ("w-wo", "を", "を", "partícula de objeto", "particulas", "Se escribe wo y se lee o."),
        ("w-ni", "に", "に", "partícula de destino, tiempo o existencia", "particulas", "No marca el lugar de la acción: eso es で."),
        ("w-e", "へ", "へ", "partícula de dirección", "particulas", "Se escribe he y se lee e."),
        ("w-de", "で", "で", "partícula de lugar de la acción o medio", "particulas", ""),
        ("w-to", "と", "と", "y, o con", "particulas", "Lista cerrada, o compañía."),
        ("w-mo", "も", "も", "también", "particulas", "Sustituye a は cuando el sentido es también."),
        ("w-no", "の", "の", "de, entre nombres", "particulas", ""),
        ("w-ka", "か", "か", "pregunta, o", "particulas", "Al final pregunta. Entre nombres, es o."),
        ("w-ne", "ね", "ね", "¿verdad?", "particulas", ""),
        ("w-yo", "よ", "よ", "aviso", "particulas", ""),
        ("w-kara", "から", "から", "desde, porque", "particulas", "Después de un nombre es desde. Después de una frase es porque."),
        ("w-made", "まで", "まで", "hasta", "particulas", ""),
        ("w-ya", "や", "や", "y otros", "particulas", ""),
        ("w-hou", "方", "ほう", "el que más, en comparaciones", "particulas", "の方が. No es 方（かた）, persona."),
        ("w-en", "円", "えん", "yen", "numeros", ""),
        ("w-ji", "時", "じ", "hora, el contador", "numeros", "７時は しちじ o ななじ."),
        ("w-fun", "分", "ふん", "minuto", "numeros", "1, 3, 6, 8 y 10 cambian a ぷん."),
        ("w-mai", "枚", "まい", "contador de cosas planas", "numeros", "Papel, sellos, camisas."),
        ("w-kai", "回", "かい", "vez", "numeros", ""),
        ("w-satsu", "冊", "さつ", "contador de libros", "numeros", ""),
        ("w-dai", "台", "だい", "contador de máquinas", "numeros", "Coches, televisores."),
        ("w-hiki", "匹", "ひき", "contador de animales pequeños", "numeros", "1, 3, 6, 8 y 10 cambian el sonido."),
    ]
    for eid, surface, kana, es, group, note in extras:
        words.append({
            "id": eid, "surface": surface, "kana": kana,
            "kanji": surface if any("\u4e00" <= ch <= "\u9fff" for ch in surface) else "",
            "romaji": "", "es": es, "group": group, "note": note, "pos": ["extra"],
            "source_word": surface,
        })
    seen_es = {}
    for row in words:
        if row["es"] in seen_es:
            row["es"] = row["es"] + " (" + row["surface"] + ")"
        seen_es[row["es"]] = row["id"]
    # si el sufijo choca, añade la lectura
    seen2 = {}
    for row in words:
        if row["es"] in seen2:
            row["es"] = row["es"] + " · " + row["kana"]
        seen2[row["es"]] = row["id"]

    groups = []
    seen_g = []
    for row in words:
        if row["group"] not in seen_g:
            seen_g.append(row["group"])
    labels = {
        "saludos": "Saludos", "gente": "Gente", "numeros": "Números", "tiempo": "Tiempo",
        "lugares": "Lugares", "casa": "Casa", "comida": "Comida", "ropa": "Ropa",
        "escuela": "Escuela", "transporte": "Transporte", "cuerpo": "Cuerpo",
        "naturaleza": "Naturaleza", "verbos": "Verbos", "adjetivos": "Adjetivos",
        "preguntas": "Preguntas", "particulas": "Partículas", "otros": "Otros",
    }
    word_groups = [{"id": gid, "label": labels.get(gid, gid)} for gid in seen_g]

    word_rows = [[w["id"], w["kana"], w["kanji"], w["romaji"], w["es"], w["group"], w["note"]] for w in words]

    kanji_rows = []
    for item in kanji_src:
        ch = item["character"]
        if ch not in KANJI_INFO:
            raise SystemExit("sin ficha de kanji " + ch)
        reading, es, group, also = KANJI_INFO[ch]
        kanji_rows.append(["k-" + ch, ch, es, reading, group, also])
    kanji_groups = []
    seen_k = []
    for row in kanji_rows:
        if row[4] not in seen_k:
            seen_k.append(row[4])
    kanji_group_rows = [{"id": gid, "label": labels.get(gid, gid)} for gid in seen_k]

    grammar_items = []
    phrase_rows = []
    grammar_groups = []
    seen_stage = []
    for point in GRAMMAR:
        stage = point["stage"]
        if stage not in seen_stage:
            seen_stage.append(stage)
            grammar_groups.append({"id": slug(stage), "label": stage})
        gid = slug(stage)
        grammar_items.append({
            "id": "g-" + point["id"],
            "kind": "grammar",
            "pattern": point["pattern"],
            "kana": point["kana"],
            "es": point["es"],
            "group": gid,
            "note": point["text"],
            "piece": point["piece"],
            "jp": point["pattern"].replace("〜", ""),
            "speak": point["examples"][0][1].replace("。", ""),
            "cloze": "",
            "clozeKana": "",
        })
        for n, (jp, kana, es) in enumerate(point["examples"], 1):
            grammar_items.append({
                "id": "g-" + point["id"] + "-" + str(n),
                "kind": "grammar",
                "pattern": jp,
                "kana": kana,
                "es": es,
                "group": gid,
                "note": point["text"],
                "piece": point["piece"],
                "jp": jp,
                "speak": kana.replace("。", ""),
                "cloze": jp.replace(point["piece"], "＿", 1) if point["piece"] in jp else "",
                "clozeKana": kana.replace("。", ""),
            })
            particle = point["piece"] if point["piece"] in jp and len(point["piece"]) <= 2 else ""
            phrase_rows.append([
                "p-" + point["id"] + "-" + str(n), jp.replace("。", ""), kana.replace("。", ""),
                es, gid, particle, point["title"],
            ])
    seen_phrase = {}
    for row in phrase_rows:
        if row[3] in seen_phrase:
            row[3] = row[3] + " (" + row[0] + ")"
        seen_phrase[row[3]] = row[0]
    seen_g_es = {}
    for item in grammar_items:
        if item["es"] in seen_g_es:
            item["es"] = item["es"] + " · " + item["pattern"]
        seen_g_es[item["es"]] = item["id"]

    verbs = []
    for w in words:
        if not is_true_verb({"pos": w["pos"]}):
            continue
        verbs.append(conj_verb(w["id"], w["surface"], w["kana"], w["pos"], w["es"]))
    by_surface = {w["surface"]: w for w in words}
    for noun in SURU_NOUNS:
        if noun not in by_surface:
            raise SystemExit("falta nombre para する " + noun)
        base = by_surface[noun]
        if any(v["dict"] == noun + "する" for v in verbs):
            continue
        verbs.append(conj_verb(
            base["id"] + "-suru", noun + "する", base["kana"] + "する", ["vs"], base["es"]
        ))
    # comprobar excepciones
    by_id = {v["id"]: v for v in verbs}
    iku = next(v for v in verbs if v["dictKana"] == "いく" and v["dict"].endswith("行く"))
    if iku["te"] != "行って":
        raise SystemExit("行く mal conjugado " + iku["te"])
    suru = next(v for v in verbs if v["dict"] == "する")
    if suru["te"] != "して" or suru["stem"] + "ます" != "します":
        raise SystemExit("する mal conjugado")
    kuru = next(v for v in verbs if v["dict"] == "来る")
    if kuru["teKana"] != "きて" or kuru["stemKana"] + "ます" != "きます":
        raise SystemExit("来る mal conjugado")
    aru = next(v for v in verbs if v["dict"] == "ある")
    if aru["nai"] != "ない" or aru["teKana"] != "あって":
        raise SystemExit("ある mal conjugado " + aru["nai"] + " " + aru["teKana"])

    lessons = []
    def add_kana(prefix, title, stage, chars, syllabary, note):
        lessons.append(lesson(
            "l-" + prefix, title, stage, 6, title, note,
            [{"jp": ch, "kana": "", "es": ""} for ch in chars[:8]],
            {"practice": "kana", "type": syllabary, "direction": "kana-romaji", "chars": chars},
        ))
    for name, chars in HIRA_ROWS:
        add_kana("h-" + slug(name), "Hiragana: " + name, "Silabario", chars, "hiragana",
                 "Lee la sílaba, no letra por letra. し es shi, ち es chi, つ es tsu, ふ es fu, を es wo y ん es n.")
    for name, chars in DAKU_ROWS:
        add_kana("hd-" + slug(name), "Hiragana sonoro: " + name, "Silabario", chars, "hiragana",
                 "Las dos rayitas sonorizan. El círculo de la fila pa es la semi-sonora. じ y ぢ se leen ji. ず y づ se leen zu.")
    for name, chars in YOON_ROWS:
        add_kana("hy-" + slug(name), "Hiragana combinado: " + name, "Silabario", chars, "hiragana",
                 "Una sílaba pequeña ゃ, ゅ o ょ se pega a la consonante i. No son dos sílabas.")
    for name, chars in HIRA_ROWS:
        kchars = kata_of(chars)
        add_kana("k-" + slug(name), "Katakana: " + name, "Silabario", kchars, "katakana",
                 "Misma lectura que el hiragana. El katakana se usa en préstamos, nombres extranjeros y énfasis.")
    for name, chars in DAKU_ROWS:
        add_kana("kd-" + slug(name), "Katakana sonoro: " + name, "Silabario", kata_of(chars), "katakana",
                 "Las mismas sonoras, en katakana.")
    for name, chars in YOON_ROWS:
        add_kana("ky-" + slug(name), "Katakana combinado: " + name, "Silabario", kata_of(chars), "katakana",
                 "ゃゅょ pequeñas también existen en katakana.")

    soku = [w["id"] for w in words if "っ" in w["kana"] or "ッ" in w["surface"]][:12]
    chou = [w["id"] for w in words if "ー" in w["surface"]][:12]
    lessons.append(lesson(
        "l-sokuon", "っ dobla la consonante", "Silabario", 8,
        "Pequeña tsu",
        "っ no se lee tsu. Dobla la consonante siguiente: がっこう es gakkou, きって es kitte. En katakana es ッ, como en マッチ.",
        [{"jp": "学校", "kana": "がっこう", "es": "escuela"}, {"jp": "切手", "kana": "きって", "es": "sello"}],
        {"practice": "words", "direction": "word-es", "ids": soku},
    ))
    lessons.append(lesson(
        "l-chouon", "ー alarga la vocal", "Silabario", 8,
        "Alargador",
        "ー alarga la vocal anterior. コーヒー es koohii, no ko-hi. No aparece en hiragana: ahí la vocal larga se escribe con otra vocal. Una vocal pequeña, como la ィ de パーティー, cambia el sonido de la sílaba anterior; no se lee sola.",
        [{"jp": "コーヒー", "kana": "コーヒー", "es": "café"}, {"jp": "タクシー", "kana": "タクシー", "es": "taxi"}],
        {"practice": "words", "direction": "word-es", "ids": chou},
    ))
    small = [w["id"] for w in words if any(ch in w["surface"] for ch in "ァィゥェォ")]
    lessons.append(lesson(
        "l-small-vowel", "Vocales pequeñas en katakana", "Silabario", 6,
        "ァィゥェォ",
        "Una vocal pequeña se pega a la sílaba anterior: フォーク es fooku, フィルム es firumu, パーティー es paatii. No se lee como una sílaba aparte.",
        [{"jp": "フォーク", "kana": "フォーク", "es": "tenedor"}, {"jp": "フィルム", "kana": "フィルム", "es": "carrete"}, {"jp": "パーティー", "kana": "パーティー", "es": "fiesta"}],
        {"practice": "words", "direction": "word-es", "ids": small},
    ))

    for point in GRAMMAR:
        ids = ["g-" + point["id"]] + ["g-" + point["id"] + "-" + str(n) for n in range(1, len(point["examples"]) + 1)]
        lessons.append(lesson(
            "l-g-" + point["id"], point["title"], "N5 · " + point["stage"], 8,
            point["pattern"], point["text"],
            [{"jp": jp, "kana": kana, "es": es} for jp, kana, es in point["examples"]],
            {"practice": "grammar", "direction": "grammar-es", "ids": ids},
        ))

    for group in word_groups:
        chunk = [w for w in words if w["group"] == group["id"]]
        for i in range(0, len(chunk), 12):
            part = chunk[i:i + 12]
            n = i // 12 + 1
            lessons.append(lesson(
                "l-v-" + group["id"] + "-" + str(n),
                "Vocabulario: " + group["label"] + (" " + str(n) if len(chunk) > 12 else ""),
                "Vocabulario N5", 8,
                group["label"],
                "Estas palabras entran en el N5 comunitario. Si llevan kanji, la lectura va debajo: no hace falta saber ese kanji para elegir el significado.",
                [{"jp": w["surface"], "kana": w["kana"], "es": w["es"]} for w in part[:6]],
                {"practice": "words", "direction": "word-es", "ids": [w["id"] for w in part]},
            ))

    for i in range(0, len(kanji_rows), 10):
        part = kanji_rows[i:i + 10]
        n = i // 10 + 1
        lessons.append(lesson(
            "l-kj-" + str(n), "Kanji N5, grupo " + str(n), "Kanji N5", 8,
            "El carácter y su lectura de este nivel",
            "El JLPT no publica lista oficial. Estos son los kanji del N5 comunitario. Otras lecturas salen al corregir, no en la pregunta.",
            [{"jp": row[1], "kana": row[3], "es": row[2]} for row in part],
            {"practice": "kanji", "direction": "kanji-es", "ids": [row[0] for row in part]},
        ))

    for i in range(0, len(verbs), 8):
        part = verbs[i:i + 8]
        n = i // 8 + 1
        ids = []
        examples = []
        for verb in part:
            ids.append(verb["id"] + "-masu")
            ids.append(verb["id"] + "-te")
            if verb["tai"]:
                ids.append(verb["id"] + "-tai")
            examples.append({"jp": verb["te"], "kana": verb["teKana"], "es": "forma て de " + verb["gloss"]})
        lessons.append(lesson(
            "l-cj-" + str(n), "Conjugación N5, grupo " + str(n), "Conjugación N5", 10,
            "ます, て y たい",
            "Cada verbo de este grupo se pregunta en cortés, en forma て y, si tiene sentido, en たい. 行く hace 行って. する y 来る no siguen la regla godan. ある niega con ない.",
            examples[:4],
            {"practice": "conj", "direction": "conj-es", "ids": ids},
        ))

    lessons.append(lesson(
        "l-n5-repaso", "Repaso del N5", "Repaso N5", 10,
        "Junta el camino",
        "Esto no añade materia. Si fallas, la lección de ese punto sigue en el camino. Aprobar el N5 real depende del examen, no de esta app.",
        [{"jp": "私は学生です。", "kana": "わたしはがくせいです。", "es": "Soy estudiante."}],
        {"practice": "grammar", "direction": "grammar-es", "ids": [
            "g-desu", "g-wa", "g-o", "g-masu", "g-te-kudasai", "g-te-iru", "g-tai", "g-ga-aru-ga-iru"
        ]},
    ))

    data = {
        "level": "N5",
        "notice": "El JLPT no publica lista oficial de vocabulario, kanji ni gramática desde 2010. Este N5 sigue las listas comunitarias de Jonathan Waller, las que usa Jisho, a través de OpenJLPT. El español, las explicaciones y las frases son de NihongoDojo.",
        "WORD_GROUPS": word_groups,
        "WORD_STARTER": ["saludos", "numeros", "gente"],
        "KANJI_GROUPS": kanji_group_rows,
        "KANJI_STARTER": ["numeros", "tiempo"],
        "PHRASE_GROUPS": grammar_groups,
        "PHRASE_STARTER": [grammar_groups[0]["id"]],
        "GRAMMAR_GROUPS": grammar_groups,
        "GRAMMAR_STARTER": [grammar_groups[0]["id"]],
        "WORD_ROWS": word_rows,
        "KANJI_ROWS": kanji_rows,
        "PHRASE_ROWS": phrase_rows,
        "GRAMMAR": grammar_items,
        "CONJ_VERBS": verbs,
        "CONJ_STARTER": [next(v["id"] for v in verbs if v["dict"] == "食べる"), iku["id"], suru["id"]],
        "LESSONS": lessons,
        "counts": {
            "words": len(word_rows),
            "kanji": len(kanji_rows),
            "phrases": len(phrase_rows),
            "grammar": len(grammar_items),
            "verbs": len(verbs),
            "lessons": len(lessons),
        },
    }
    js = (
        "/* NihongoDojo N5. Generado por scripts/build_n5.py.\n"
        " * Clasificación: listas comunitarias de Jonathan Waller (CC BY), vía OpenJLPT (CC BY-SA 4.0).\n"
        " * Español, explicaciones y frases: obra de este repositorio.\n"
        " * El JLPT no publica lista oficial desde 2010. Esto no es el examen.\n"
        " */\n"
        "(function (root) {\n"
        "    \"use strict\";\n"
        "    var data = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
        "    root.NihongoDojoN5 = data;\n"
        "    if (typeof module !== \"undefined\" && module.exports) module.exports = data;\n"
        "})(typeof window !== \"undefined\" ? window : globalThis);\n"
    )
    OUT.write_text(js, encoding="utf-8")
    print(json.dumps(data["counts"], ensure_ascii=False))
    print("groups", [g["id"] for g in word_groups])
    print("verbs", len(verbs), "iku", iku["te"], "suru", suru["stem"] + "ます", "kuru", kuru["te"])


if __name__ == "__main__":
    main()
