#!/usr/bin/env python3
"""Genera n1.js. Español propio. La lista es el N1 comunitario, no el examen."""
import json
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from n1_es import load as load_glosses
from n1_grammar import GRAMMAR
from n1_kanji import load as load_kanji_glosses

VOCAB_PATH = Path("/tmp/openjlpt/n1-vocab.json")
KANJI_PATH = Path("/tmp/openjlpt/n1-kanji.json")
GRAMMAR_PATH = Path("/tmp/openjlpt/n1-grammar.json")
OUT = ROOT / "n1.js"

VERB_POS = {
    "v1", "v1-s", "v5b", "v5g", "v5k", "v5m", "v5n", "v5r", "v5s", "v5t", "v5u",
    "v5aru", "v5u-s",
}
GODAN = {
    "う": ("い", "って", "った", "わ", "え", "お"),
    "く": ("き", "いて", "いた", "か", "け", "こ"),
    "ぐ": ("ぎ", "いで", "いだ", "が", "げ", "ご"),
    "す": ("し", "して", "した", "さ", "せ", "そ"),
    "つ": ("ち", "って", "った", "た", "て", "と"),
    "ぬ": ("に", "んで", "んだ", "な", "ね", "の"),
    "ぶ": ("び", "んで", "んだ", "ば", "べ", "ぼ"),
    "む": ("み", "んで", "んだ", "ま", "め", "も"),
    "る": ("り", "って", "った", "ら", "れ", "ろ"),
}
SKIP_POTENTIAL = {"みえる", "きこえる"}
NOT_VERBS = {"煌々と", "嫋か", "其れ共", "中腹", "何々", "矢鱈に", "御覧なさい"}
LABELS = {
    "verbos": "Verbos",
    "adjetivos": "Adjetivos",
    "adverbios": "Adverbios",
    "sociedad": "Sociedad",
}


def slug(text):
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    out = []
    for ch in text.lower():
        if ch.isalnum() and ord(ch) < 128:
            out.append(ch)
        elif out and out[-1] != "-":
            out.append("-")
    return "".join(out).strip("-")[:24] or "x"


def hira(text):
    out = []
    for ch in text:
        code = ord(ch)
        if ch == "ヴ":
            out.append("ゔ")
        elif 0x30A1 <= code <= 0x30F6:
            out.append(chr(code - 0x60))
        else:
            out.append(ch)
    return "".join(out)


def reading_of(item):
    onyomi = item.get("onyomi") or []
    if onyomi:
        raw = onyomi[0].split(".")[0].lstrip("-").replace("・", "")
        return hira(raw)
    kun = (item.get("kunyomi") or [""])[0]
    return hira(kun.split(".")[0].lstrip("-"))


def is_verb(pos, reading):
    pos = pos or []
    if "vz" in pos:
        return reading.endswith("ずる")
    if any(p in VERB_POS or p.startswith("v5") or p.startswith("v1") for p in pos):
        ok = True
    else:
        ok = any(p.startswith("vs") for p in pos) and reading.endswith("する")
    if not ok:
        return False
    if any(p.startswith("v1") for p in pos):
        return reading.endswith("る")
    if any(p.startswith("v5") for p in pos):
        return reading[-1] in GODAN
    return reading.endswith("する")


def conj_verb(wid, surface, reading, pos, gloss):
    pos = pos or []
    kind = "godan"
    if "vz" in pos:
        kind = "zuru"
    elif "v5aru" in pos:
        kind = "v5aru"
    elif "v5u-s" in pos:
        kind = "v5u-s"
    elif any(p.startswith("v1") for p in pos):
        kind = "ichidan"
    elif reading == "くる":
        kind = "kuru"
    elif any(p.startswith("vs") for p in pos) and reading.endswith("する"):
        kind = "suru"
    last = reading[-1]
    potential = volitional = tara = ba = passive = causative = zu = mai = ""
    potential_k = volitional_k = tara_k = ba_k = passive_k = causative_k = zu_k = mai_k = ""
    if kind == "ichidan":
        stem_k, stem_j = reading[:-1], surface[:-1]
        te_k, te_j = stem_k + "て", stem_j + "て"
        nai_k, nai_j = stem_k + "ない", stem_j + "ない"
        ta_k, ta_j = stem_k + "た", stem_j + "た"
        note = "Ichidan: se quita る."
        if reading not in SKIP_POTENTIAL:
            potential, potential_k = stem_j + "られる", stem_k + "られる"
        volitional, volitional_k = stem_j + "よう", stem_k + "よう"
        ba, ba_k = stem_j + "れば", stem_k + "れば"
        passive, passive_k = potential, potential_k
        causative, causative_k = stem_j + "させる", stem_k + "させる"
        zu, zu_k = stem_j + "ず", stem_k + "ず"
        mai, mai_k = stem_j + "まい", stem_k + "まい"
    elif kind == "kuru":
        stem_k, stem_j = "き", "来"
        te_k, te_j = "きて", "来て"
        nai_k, nai_j = "こない", "来ない"
        ta_k, ta_j = "きた", "来た"
        note = "来る es irregular."
        potential, potential_k = "来られる", "こられる"
        volitional, volitional_k = "来よう", "こよう"
        ba, ba_k = "来れば", "くれば"
        passive, passive_k = "来られる", "こられる"
        causative, causative_k = "来させる", "こさせる"
        zu, zu_k = "来ず", "こず"
        mai, mai_k = "来るまい", "くるまい"
    elif kind == "suru":
        base_k, base_j = reading[:-2], surface[:-2]
        stem_k, stem_j = base_k + "し", base_j + "し"
        te_k, te_j = base_k + "して", base_j + "して"
        nai_k, nai_j = base_k + "しない", base_j + "しない"
        ta_k, ta_j = base_k + "した", base_j + "した"
        note = "する es irregular: します, できる, しよう."
        potential, potential_k = base_j + "できる", base_k + "できる"
        volitional, volitional_k = base_j + "しよう", base_k + "しよう"
        ba, ba_k = base_j + "すれば", base_k + "すれば"
        passive, passive_k = base_j + "される", base_k + "される"
        causative, causative_k = base_j + "させる", base_k + "させる"
        zu, zu_k = base_j + "せず", base_k + "せず"
        mai, mai_k = base_j + "するまい", base_k + "するまい"
    elif kind == "zuru":
        base_k, base_j = reading[:-2], surface[:-2]
        stem_k, stem_j = base_k + "じ", base_j + "じ"
        te_k, te_j = stem_k + "て", stem_j + "て"
        nai_k, nai_j = stem_k + "ない", stem_j + "ない"
        ta_k, ta_j = stem_k + "た", stem_j + "た"
        note = "ずる se conjuga por じ: じます, じて. まい va al diccionario."
        potential, potential_k = stem_j + "られる", stem_k + "られる"
        volitional, volitional_k = stem_j + "よう", stem_k + "よう"
        ba, ba_k = stem_j + "れば", stem_k + "れば"
        passive, passive_k = potential, potential_k
        causative, causative_k = stem_j + "させる", stem_k + "させる"
        zu, zu_k = stem_j + "ず", stem_k + "ず"
        mai, mai_k = surface + "まい", reading + "まい"
    elif kind == "v5aru":
        stem_k, stem_j = reading[:-1] + "い", surface[:-1] + "い"
        te_k, te_j = reading[:-1] + "って", surface[:-1] + "って"
        nai_k, nai_j = reading[:-1] + "らない", surface[:-1] + "らない"
        ta_k, ta_j = reading[:-1] + "った", surface[:-1] + "った"
        note = "Respeto en ある: ます es います, no ります."
        volitional, volitional_k = surface[:-1] + "ろう", reading[:-1] + "ろう"
        ba, ba_k = surface[:-1] + "れば", reading[:-1] + "れば"
        zu, zu_k = surface[:-1] + "らず", reading[:-1] + "らず"
        mai, mai_k = surface + "まい", reading + "まい"
    else:
        if last not in GODAN:
            raise SystemExit("godan raro " + surface + " " + reading)
        i_row, te_end, ta_end, a_row, e_row, o_row = GODAN[last]
        if kind == "v5u-s":
            te_end, ta_end = "うて", "うた"
            note = "う especial: て es うて, no って. 問うて."
        else:
            note = "Godan en " + last + "."
        stem_k, stem_j = reading[:-1] + i_row, surface[:-1] + i_row
        te_k, te_j = reading[:-1] + te_end, surface[:-1] + te_end
        nai_k, nai_j = reading[:-1] + a_row + "ない", surface[:-1] + a_row + "ない"
        ta_k, ta_j = reading[:-1] + ta_end, surface[:-1] + ta_end
        if reading not in SKIP_POTENTIAL:
            potential, potential_k = surface[:-1] + e_row + "る", reading[:-1] + e_row + "る"
        volitional, volitional_k = surface[:-1] + o_row + "う", reading[:-1] + o_row + "う"
        ba, ba_k = surface[:-1] + e_row + "ば", reading[:-1] + e_row + "ば"
        passive, passive_k = surface[:-1] + a_row + "れる", reading[:-1] + a_row + "れる"
        causative, causative_k = surface[:-1] + a_row + "せる", reading[:-1] + a_row + "せる"
        zu, zu_k = surface[:-1] + a_row + "ず", reading[:-1] + a_row + "ず"
        mai, mai_k = surface + "まい", reading + "まい"
    tara, tara_k = ta_j + "ら", ta_k + "ら"
    tai_j, tai_k = stem_j + "たい", stem_k + "たい"
    if kind == "v5aru":
        tai_j, tai_k = surface[:-1] + "りたい", reading[:-1] + "りたい"
    return {
        "id": wid, "label": surface, "dict": surface, "dictKana": reading,
        "stem": stem_j, "stemKana": stem_k, "te": te_j, "teKana": te_k,
        "nai": nai_j, "naiKana": nai_k, "ta": ta_j, "taKana": ta_k,
        "tai": tai_j, "taiKana": tai_k,
        "potential": potential, "potentialKana": potential_k,
        "volitional": volitional, "volitionalKana": volitional_k,
        "tara": tara, "taraKana": tara_k, "ba": ba, "baKana": ba_k,
        "passive": passive, "passiveKana": passive_k,
        "causative": causative, "causativeKana": causative_k,
        "zu": zu, "zuKana": zu_k,
        "mai": mai, "maiKana": mai_k,
        "gloss": gloss, "polite": gloss + ", cortés", "negative": "no " + gloss,
        "past": gloss + ", pasado cortés", "plainNeg": "no " + gloss + ", plano",
        "plainPast": gloss + ", pasado plano", "want": "quiero " + gloss,
        "teNote": note, "kind": kind,
    }


def lesson(lid, title, stage, minutes, heading, text, examples, quiz):
    return {
        "id": lid, "title": title, "stage": stage, "minutes": minutes, "level": "n1",
        "teach": [{"heading": heading, "text": text, "examples": examples}],
        "quiz": quiz,
    }


def word_group(pos, reading):
    if is_verb(pos, reading):
        return "verbos"
    if any(p.startswith("adj") for p in (pos or [])):
        return "adjetivos"
    if any(p.startswith("adv") for p in (pos or [])):
        return "adverbios"
    return "sociedad"


def main():
    vocab = json.loads(VOCAB_PATH.read_text(encoding="utf-8"))
    kanji_src = json.loads(KANJI_PATH.read_text(encoding="utf-8"))
    grammar_src = json.loads(GRAMMAR_PATH.read_text(encoding="utf-8"))
    glosses = load_glosses()
    kanji_glosses = load_kanji_glosses()
    if [g["id"] for g in GRAMMAR] != [g["id"] for g in grammar_src]:
        raise SystemExit("gramática N1 no cuadra")
    if len(glosses) != len(vocab):
        raise SystemExit("vocab " + str(len(glosses)) + " != " + str(len(vocab)))
    if len(kanji_glosses) != len(kanji_src):
        raise SystemExit("kanji " + str(len(kanji_glosses)))
    for point in GRAMMAR:
        for jp, kana, es in point["examples"]:
            if point["piece"] not in jp:
                raise SystemExit("pieza fuera de " + point["id"])

    words = []
    for item, (surface, reading, es, note) in zip(vocab, glosses):
        if surface != item["word"] or reading != item["reading"]:
            raise SystemExit("orden " + item["word"])
        group = word_group(item.get("pos") or [], reading)
        words.append({
            "id": "w-" + item["id"],
            "surface": surface,
            "kana": reading,
            "kanji": surface if any("\u4e00" <= ch <= "\u9fff" or ch == "々" for ch in surface) else "",
            "romaji": item.get("romaji") or "",
            "es": es,
            "group": "n1-" + group,
            "note": note,
            "pos": item.get("pos") or [],
        })
    if len({w["id"] for w in words}) != len(words):
        raise SystemExit("ids de palabra repetidos")
    seen = {}
    for row in words:
        if row["es"] in seen:
            row["es"] = row["es"] + " (" + row["surface"] + ")"
        seen[row["es"]] = row["id"]
    seen2 = {}
    for row in words:
        if row["es"] in seen2:
            row["es"] = row["es"] + " · " + row["kana"]
        seen2[row["es"]] = row["id"]
    word_rows = [[w["id"], w["kana"], w["kanji"], w["romaji"], w["es"], w["group"], w["note"]] for w in words]
    word_groups = [
        {"id": "n1-" + key, "label": LABELS[key]}
        for key in ("verbos", "adjetivos", "adverbios", "sociedad")
        if any(w["group"] == "n1-" + key for w in words)
    ]

    kanji_rows = []
    for item, gloss in zip(kanji_src, kanji_glosses):
        char = item["character"]
        reading = reading_of(item)
        if not reading:
            raise SystemExit("sin lectura " + char)
        kun = ""
        if item.get("kunyomi"):
            kun = hira(item["kunyomi"][0].split(".")[0].lstrip("-"))
        also = ""
        if kun and kun != reading:
            also = "Kun: " + kun
        kanji_rows.append(["k-" + char, char, gloss, reading, "n1-sociedad", also])
    seen_kes = {}
    for row in kanji_rows:
        if row[2] in seen_kes:
            row[2] = row[2] + " (" + row[1] + ")"
        seen_kes[row[2]] = row[0]
    if len({row[0] for row in kanji_rows}) != len(kanji_rows):
        raise SystemExit("kanji repetido")
    kanji_groups = [{"id": "n1-sociedad", "label": "Sociedad"}]

    grammar_items, phrase_rows, grammar_groups, seen_stage = [], [], [], []
    for point in GRAMMAR:
        stage = point["stage"]
        gid = "n1-" + slug(stage)
        if stage not in seen_stage:
            seen_stage.append(stage)
            grammar_groups.append({"id": gid, "label": stage})
        grammar_items.append({
            "id": "g-" + point["id"], "kind": "grammar", "level": "n1",
            "pattern": point["pattern"], "kana": point["kana"], "es": point["es"],
            "group": gid, "note": point["text"], "piece": point["piece"],
            "jp": point["pattern"].replace("〜", ""),
            "speak": point["examples"][0][1].replace("。", ""),
            "cloze": "", "clozeKana": "",
        })
        for n, (jp, kana, es) in enumerate(point["examples"], 1):
            piece = point["piece"] if point["piece"] in jp else ""
            grammar_items.append({
                "id": "g-" + point["id"] + "-" + str(n), "kind": "grammar", "level": "n1",
                "pattern": jp, "kana": kana, "es": es, "group": gid,
                "note": point["text"], "piece": piece or point["piece"], "jp": jp,
                "speak": kana.replace("。", ""),
                "cloze": jp.replace(piece, "＿", 1) if piece else "",
                "clozeKana": kana.replace("。", ""),
            })
            particle = piece if piece and len(piece) <= 8 else ""
            phrase_rows.append([
                "p-" + point["id"] + "-" + str(n), jp.replace("。", ""), kana.replace("。", ""),
                es, gid, particle, point["title"],
            ])
    seen_phrase = {}
    for row in phrase_rows:
        if row[3] in seen_phrase:
            row[3] = row[3] + " (" + row[0] + ")"
        seen_phrase[row[3]] = row[0]
    seen_ges = {}
    for item in grammar_items:
        if item["es"] in seen_ges:
            item["es"] = item["es"] + " · " + item["pattern"]
        seen_ges[item["es"]] = item["id"]

    verbs = []
    for w in words:
        if w["surface"] in NOT_VERBS:
            continue
        if is_verb(w["pos"], w["kana"]):
            verbs.append(conj_verb(w["id"], w["surface"], w["kana"], w["pos"], w["es"]))
    by_dict = {v["dict"]: v for v in verbs}
    for surface in NOT_VERBS:
        if surface in by_dict:
            raise SystemExit("no debía conjugarse " + surface)
    checks = {
        "演ずる": ("zuru", "演じて", "えんじて", "演じず", "演ずるまい"),
        "重んずる": ("zuru", "重んじて", "おもんじて", "重んじず", "重んずるまい"),
        "禁ずる": ("zuru", "禁じて", "きんじて", "禁じず", "禁ずるまい"),
        "準ずる": ("zuru", "準じて", "じゅんじて", "準じず", "準ずるまい"),
        "報ずる": ("zuru", "報じて", "ほうじて", "報じず", "報ずるまい"),
        "問う": ("v5u-s", "問うて", "とうて", "問わず", "問うまい"),
        "擦る": ("godan", "擦って", "かすって", "擦らず", "擦るまい"),
        "化する": ("suru", "化して", "かして", "化せず", "化するまい"),
        "入る": ("godan", "入って", "いって", "入らず", "入るまい"),
        "来る": ("godan", "来って", "きたって", "来らず", "来るまい"),
        "出切る": ("godan", "出切って", "できって", "出切らず", "出切るまい"),
        "給う": ("godan", "給って", "たまって", "給わず", "給うまい"),
        "捲る": ("godan", "捲って", "まくって", "捲らず", "捲るまい"),
    }
    for surface, expect in checks.items():
        row = by_dict.get(surface)
        if not row:
            raise SystemExit("falta verbo " + surface)
        got = (row["kind"], row["te"], row["teKana"], row["zu"], row["mai"])
        if got != expect:
            raise SystemExit(surface + " mal " + str(got))
    if by_dict["化する"]["potential"] != "化できる" or by_dict["化する"]["stem"] != "化し":
        raise SystemExit("化する mal")
    if any(row["kind"] == "kuru" for row in verbs):
        raise SystemExit("N1 no trae 来る くる")
    if len(verbs) != 445:
        raise SystemExit("verbos N1 " + str(len(verbs)))

    lessons = [lesson(
        "l-n1-puente", "El N1 empieza aquí", "N1", 6,
        "Encima del N2",
        "Este camino no repite el N5, el N4, el N3 ni el N2. El JLPT no publica lista oficial desde 2010: esto es el recorte comunitario, no el examen. Aquí entran el registro escrito, べし y まじき.",
        [{"jp": "入るべからず。", "kana": "いるべからず。", "es": "No se ha de entrar."}],
        {"practice": "words", "direction": "word-es", "ids": [w["id"] for w in words[:8]]},
    )]
    for point in GRAMMAR:
        ids = ["g-" + point["id"]] + ["g-" + point["id"] + "-" + str(n) for n in range(1, len(point["examples"]) + 1)]
        lessons.append(lesson(
            "l-n1-g-" + point["id"], point["title"], "N1 · " + point["stage"], 8,
            point["pattern"], point["text"],
            [{"jp": jp, "kana": kana, "es": es} for jp, kana, es in point["examples"]],
            {"practice": "grammar", "direction": "grammar-es", "ids": ids},
        ))
    by_group = {}
    for w in words:
        by_group.setdefault(w["group"], []).append(w)
    for gid, chunk_all in by_group.items():
        label = LABELS.get(gid[3:], gid)
        for i in range(0, len(chunk_all), 12):
            part = chunk_all[i:i + 12]
            n = i // 12 + 1
            lessons.append(lesson(
                "l-n1-v-" + gid + "-" + str(n),
                "Vocabulario N1: " + label + (" " + str(n) if len(chunk_all) > 12 else ""),
                "Vocabulario N1", 8, label,
                "Palabras del N1 comunitario que no estaban en el N5, el N4, el N3 ni el N2. Si hay kanji, la lectura va debajo.",
                [{"jp": w["surface"], "kana": w["kana"], "es": w["es"]} for w in part[:6]],
                {"practice": "words", "direction": "word-es", "ids": [w["id"] for w in part]},
            ))
    for i in range(0, len(kanji_rows), 10):
        part = kanji_rows[i:i + 10]
        n = i // 10 + 1
        lessons.append(lesson(
            "l-n1-kj-" + str(n), "Kanji N1, grupo " + str(n), "Kanji N1", 8,
            "Lectura de este nivel",
            "Estos kanji no estaban en el recorte N5, N4, N3 ni N2. Otras lecturas salen al corregir.",
            [{"jp": row[1], "kana": row[3], "es": row[2]} for row in part],
            {"practice": "kanji", "direction": "kanji-es", "ids": [row[0] for row in part]},
        ))
    for i in range(0, len(verbs), 8):
        part = verbs[i:i + 8]
        n = i // 8 + 1
        ids, examples = [], []
        for verb in part:
            if verb["potential"]:
                ids.append(verb["id"] + "-potential")
            ids.append(verb["id"] + "-tara")
            if verb["zu"]:
                ids.append(verb["id"] + "-zu")
            if verb["mai"]:
                ids.append(verb["id"] + "-mai")
            examples.append({"jp": verb["mai"] or verb["zu"], "kana": verb["maiKana"] or verb["zuKana"], "es": "forma nueva de " + verb["gloss"]})
        lessons.append(lesson(
            "l-n1-cj-" + str(n), "Conjugación N1, grupo " + str(n), "Conjugación N1", 10,
            "まい, ずる y 問う",
            "Los verbos nuevos llevan las formas del N2, incluida まい. ずる se conjuga por じ. 擦る es godan: 擦ります, no します. 問うて, no 問って. 来る, leído きたる, también es godan.",
            examples[:4],
            {"practice": "conj", "direction": "conj-es", "ids": ids},
        ))
    lessons.append(lesson(
        "l-n1-repaso", "Repaso del N1", "Repaso N1", 10,
        "Junta el nivel",
        "No añade materia. Aprobar el examen real no depende de esta app.",
        [{"jp": "入るべからず。", "kana": "いるべからず。", "es": "No se ha de entrar."}],
        {"practice": "grammar", "direction": "grammar-es", "ids": [
            "g-bekarazu-bekarazaru", "g-zu-jimai", "g-n-bakari",
            "g-o-kinjienai", "g-majiki", "g-you-ga-mai-ga-you-to-mai-to",
        ]},
    ))
    for item in lessons:
        if not (1 <= len(item["id"]) <= 80):
            raise SystemExit("id de lección fuera de rango " + item["id"])
        if any(ch.isupper() or ord(ch) > 127 for ch in item["id"]):
            raise SystemExit("id de lección inválido " + item["id"])

    data = {
        "level": "N1",
        "notice": "El JLPT no publica lista oficial desde 2010. Este N1 sigue el recorte comunitario de Jonathan Waller, vía OpenJLPT, y se estudia encima del N2. El español es de NihongoDojo.",
        "WORD_GROUPS": word_groups,
        "WORD_STARTER": ["n1-verbos", "n1-sociedad"],
        "KANJI_GROUPS": kanji_groups,
        "KANJI_STARTER": ["n1-sociedad"],
        "PHRASE_GROUPS": grammar_groups,
        "PHRASE_STARTER": [grammar_groups[0]["id"]],
        "GRAMMAR_GROUPS": grammar_groups,
        "GRAMMAR_STARTER": [grammar_groups[0]["id"]],
        "WORD_ROWS": word_rows,
        "KANJI_ROWS": kanji_rows,
        "PHRASE_ROWS": phrase_rows,
        "GRAMMAR": grammar_items,
        "CONJ_VERBS": verbs,
        "CONJ_STARTER": [by_dict["演ずる"]["id"], by_dict["問う"]["id"], by_dict["擦る"]["id"]],
        "LESSONS": lessons,
    }
    text = (
        "/* NihongoDojo N1. Generado por scripts/build_n1.py.\n"
        " * Clasificación: listas comunitarias de Jonathan Waller (CC BY), vía OpenJLPT (CC BY-SA 4.0).\n"
        " * Español, explicaciones y frases: obra de este repositorio.\n"
        " * El JLPT no publica lista oficial desde 2010. Esto no es el examen.\n"
        " */\n"
        "(function (root) {\n"
        "    \"use strict\";\n"
        "    var data = "
        + json.dumps(data, ensure_ascii=False, indent=2)
        + ";\n"
        "    root.NihongoDojoN1 = data;\n"
        "    if (typeof module !== \"undefined\" && module.exports) module.exports = data;\n"
        "})(typeof window !== \"undefined\" ? window : globalThis);\n"
    )
    OUT.write_text(text, encoding="utf-8")
    print(json.dumps({
        "words": len(word_rows), "kanji": len(kanji_rows), "phrases": len(phrase_rows),
        "grammar": len(grammar_items), "verbs": len(verbs), "lessons": len(lessons),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
