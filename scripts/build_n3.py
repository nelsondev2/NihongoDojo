#!/usr/bin/env python3
"""Genera n3.js. Español propio. La lista es el N3 comunitario, no el examen."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from n3_es import GLOSS
from n3_grammar import GRAMMAR
from n3_kanji import KANJI

VOCAB_PATH = Path("/tmp/openjlpt/n3-vocab.json")
KANJI_PATH = Path("/tmp/openjlpt/n3-kanji.json")
GRAMMAR_PATH = Path("/tmp/openjlpt/n3-grammar.json")
OUT = ROOT / "n3.js"

SURFACE = {"起す": "起こす", "落す": "落とす"}
VERB_POS = {
    "v1", "v1-s", "v5b", "v5g", "v5k", "v5m", "v5n", "v5r", "v5s", "v5t", "v5u", "v5aru",
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
LABELS = {
    "saludos": "Saludos", "gente": "Gente", "numeros": "Números", "tiempo": "Tiempo",
    "lugares": "Lugares", "casa": "Casa", "comida": "Comida", "ropa": "Ropa",
    "escuela": "Escuela", "transporte": "Transporte", "cuerpo": "Cuerpo",
    "naturaleza": "Naturaleza", "verbos": "Verbos", "adjetivos": "Adjetivos",
    "preguntas": "Preguntas", "trabajo": "Trabajo", "sociedad": "Sociedad", "otros": "Otros",
}


def slug(text):
    out = []
    for ch in text:
        if ch.isalnum():
            out.append(ch.lower())
        elif out and out[-1] != "-":
            out.append("-")
    return "".join(out).strip("-")[:24] or "x"


def is_verb(pos, reading):
    if any(p in VERB_POS or p.startswith("v5") or p.startswith("v1") for p in pos):
        ok = True
    else:
        ok = any(p.startswith("vs") for p in pos) and reading.endswith("する")
    if not ok:
        return False
    if reading.endswith("する") or reading in ("くる", "くる"):
        return True
    if any(p.startswith("v1") for p in pos):
        return reading.endswith("る")
    return reading[-1] in GODAN


def conj_verb(wid, surface, reading, pos, gloss):
    kind = "godan"
    if "v5aru" in pos:
        kind = "v5aru"
    elif any(p.startswith("v1") for p in pos):
        kind = "ichidan"
    elif reading == "くる" or surface == "来る":
        kind = "kuru"
    elif reading.endswith("する"):
        kind = "suru"
    last = reading[-1]
    potential = volitional = tara = ba = passive = causative = zu = ""
    potential_k = volitional_k = tara_k = ba_k = passive_k = causative_k = zu_k = ""
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
    elif kind == "v5aru":
        stem_k, stem_j = reading[:-1] + "い", surface[:-1] + "い"
        te_k, te_j = reading[:-1] + "って", surface[:-1] + "って"
        nai_k, nai_j = reading[:-1] + "らない", surface[:-1] + "らない"
        ta_k, ta_j = reading[:-1] + "った", surface[:-1] + "った"
        note = "Respeto en ある: ます es います, no ります."
        volitional, volitional_k = reading[:-1] + "ろう", reading[:-1] + "ろう"
        ba, ba_k = surface[:-1] + "れば", reading[:-1] + "れば"
        # la forma escrita del volitivo usa el kanji si lo hay
        if surface != reading:
            volitional = surface[:-1] + "ろう"
            ba = surface[:-1] + "れば"
        zu, zu_k = surface[:-1] + "らず", reading[:-1] + "らず"
    else:
        if last not in GODAN:
            raise SystemExit("godan raro " + surface + " " + reading)
        i_row, te_end, ta_end, a_row, e_row, o_row = GODAN[last]
        stem_k, stem_j = reading[:-1] + i_row, surface[:-1] + i_row
        te_k, te_j = reading[:-1] + te_end, surface[:-1] + te_end
        nai_k, nai_j = reading[:-1] + a_row + "ない", surface[:-1] + a_row + "ない"
        ta_k, ta_j = reading[:-1] + ta_end, surface[:-1] + ta_end
        note = "Godan en " + last + "."
        if reading not in SKIP_POTENTIAL:
            potential, potential_k = surface[:-1] + e_row + "る", reading[:-1] + e_row + "る"
        volitional, volitional_k = surface[:-1] + o_row + "う", reading[:-1] + o_row + "う"
        ba, ba_k = surface[:-1] + e_row + "ば", reading[:-1] + e_row + "ば"
        passive, passive_k = surface[:-1] + a_row + "れる", reading[:-1] + a_row + "れる"
        causative, causative_k = surface[:-1] + a_row + "せる", reading[:-1] + a_row + "せる"
        zu, zu_k = surface[:-1] + a_row + "ず", reading[:-1] + a_row + "ず"
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
        "gloss": gloss, "polite": gloss + ", cortés", "negative": "no " + gloss,
        "past": gloss + ", pasado cortés", "plainNeg": "no " + gloss + ", plano",
        "plainPast": gloss + ", pasado plano", "want": "quiero " + gloss,
        "teNote": note, "kind": kind,
    }


def lesson(lid, title, stage, minutes, heading, text, examples, quiz):
    return {
        "id": lid, "title": title, "stage": stage, "minutes": minutes, "level": "n3",
        "teach": [{"heading": heading, "text": text, "examples": examples}],
        "quiz": quiz,
    }


def main():
    vocab = json.loads(VOCAB_PATH.read_text(encoding="utf-8"))
    kanji_src = json.loads(KANJI_PATH.read_text(encoding="utf-8"))
    grammar_src = json.loads(GRAMMAR_PATH.read_text(encoding="utf-8"))
    src_ids = [g["id"] for g in grammar_src]
    ours = [g["id"] for g in GRAMMAR]
    if ours != src_ids:
        missing = [i for i in src_ids if i not in ours]
        extra = [i for i in ours if i not in src_ids]
        raise SystemExit("gramática N3 no cuadra missing=" + str(missing) + " extra=" + str(extra))

    words = []
    for item in vocab:
        key = (item["word"], item["reading"])
        if key not in GLOSS:
            raise SystemExit("sin español N3: " + item["word"] + " / " + item["reading"])
        es, group, note = GLOSS[key]
        surface = SURFACE.get(item["word"], item["word"])
        words.append({
            "id": "w-" + item["id"],
            "surface": surface,
            "kana": item["reading"],
            "kanji": surface if any("\u4e00" <= ch <= "\u9fff" for ch in surface) else "",
            "romaji": item.get("romaji") or "",
            "es": es, "group": "n3-" + group, "note": note,
            "pos": item["pos"],
        })
    if set(GLOSS) - {(i["word"], i["reading"]) for i in vocab}:
        extra = set(GLOSS) - {(i["word"], i["reading"]) for i in vocab}
        raise SystemExit("glosas de más " + str(list(extra)[:8]))
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
    seen_g = []
    for w in words:
        if w["group"] not in seen_g:
            seen_g.append(w["group"])
    word_groups = [{"id": gid, "label": LABELS.get(gid[3:], gid)} for gid in seen_g]

    kanji_rows = []
    for item in kanji_src:
        ch = item["character"]
        if ch not in KANJI:
            raise SystemExit("sin ficha de kanji N3 " + ch)
        reading, es, group, also = KANJI[ch]
        kanji_rows.append(["k-" + ch, ch, es, reading, "n3-" + group, also])
    if set(KANJI) - {i["character"] for i in kanji_src}:
        raise SystemExit("kanji de más")
    seen_k, kanji_groups = [], []
    for row in kanji_rows:
        if row[4] not in seen_k:
            seen_k.append(row[4])
            kanji_groups.append({"id": row[4], "label": LABELS.get(row[4][3:], row[4])})
    seen_kes = {}
    for row in kanji_rows:
        if row[2] in seen_kes:
            row[2] = row[2] + " (" + row[1] + ")"
        seen_kes[row[2]] = row[0]

    grammar_items, phrase_rows, grammar_groups, seen_stage = [], [], [], []
    for point in GRAMMAR:
        stage = point["stage"]
        gid = "n3-" + slug(stage)
        if stage not in seen_stage:
            seen_stage.append(stage)
            grammar_groups.append({"id": gid, "label": stage})
        grammar_items.append({
            "id": "g-" + point["id"], "kind": "grammar", "level": "n3",
            "pattern": point["pattern"], "kana": point["kana"], "es": point["es"],
            "group": gid, "note": point["text"], "piece": point["piece"],
            "jp": point["pattern"].replace("〜", ""),
            "speak": point["examples"][0][1].replace("。", ""),
            "cloze": "", "clozeKana": "",
        })
        for n, (jp, kana, es) in enumerate(point["examples"], 1):
            piece = point["piece"] if point["piece"] in jp else ""
            if not piece:
                for nlen in range(len(point["piece"]) - 1, 1, -1):
                    if point["piece"][:nlen] in jp:
                        piece = point["piece"][:nlen]
                        break
            grammar_items.append({
                "id": "g-" + point["id"] + "-" + str(n), "kind": "grammar", "level": "n3",
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
        if is_verb(w["pos"], w["kana"]):
            verbs.append(conj_verb(w["id"], w["surface"], w["kana"], w["pos"], w["es"]))
    oru = next(v for v in verbs if v["dict"] == "居る")
    if oru["stem"] + "ます" != "居ります" or oru["teKana"] != "おって" or oru["zuKana"] != "おらず":
        raise SystemExit("居る mal conjugado " + oru["stem"] + " " + oru["teKana"] + " " + oru["zuKana"])
    aisuru = next(v for v in verbs if v["dict"] == "愛する")
    if aisuru["potential"] != "愛できる" or aisuru["zu"] != "愛せず":
        raise SystemExit("愛する mal " + aisuru["potential"] + " " + aisuru["zu"])
    korosu = next(v for v in verbs if v["dict"] == "殺す")
    if korosu["potentialKana"] != "ころせる" or korosu["zuKana"] != "ころさず" or korosu["taraKana"] != "ころしたら":
        raise SystemExit("殺す mal " + korosu["potentialKana"] + " " + korosu["zuKana"])

    lessons = [lesson(
        "l-n3-puente", "El N3 empieza aquí", "N3", 6,
        "Encima del N4",
        "Este camino no repite el N5 ni el N4. El JLPT no publica lista oficial desde 2010: esto es el recorte comunitario, no el examen. Aquí entran conclusión, causa, grado y la negación ず.",
        [{"jp": "食べずに出た。", "kana": "たべずにでた。", "es": "Salió sin comer."}],
        {"practice": "words", "direction": "word-es", "ids": [w["id"] for w in words[:8]]},
    )]
    for point in GRAMMAR:
        ids = ["g-" + point["id"]] + ["g-" + point["id"] + "-" + str(n) for n in range(1, len(point["examples"]) + 1)]
        lessons.append(lesson(
            "l-n3-g-" + point["id"], point["title"], "N3 · " + point["stage"], 8,
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
                "l-n3-v-" + gid + "-" + str(n),
                "Vocabulario N3: " + label + (" " + str(n) if len(chunk_all) > 12 else ""),
                "Vocabulario N3", 8, label,
                "Palabras del N3 comunitario que no estaban en el N5 ni en el N4. Si hay kanji, la lectura va debajo.",
                [{"jp": w["surface"], "kana": w["kana"], "es": w["es"]} for w in part[:6]],
                {"practice": "words", "direction": "word-es", "ids": [w["id"] for w in part]},
            ))
    for i in range(0, len(kanji_rows), 10):
        part = kanji_rows[i:i + 10]
        n = i // 10 + 1
        lessons.append(lesson(
            "l-n3-kj-" + str(n), "Kanji N3, grupo " + str(n), "Kanji N3", 8,
            "Lectura de este nivel",
            "Estos kanji no estaban en el recorte N5 ni en el N4. Otras lecturas salen al corregir.",
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
            ids.append(verb["id"] + "-volitional")
            if verb["zu"]:
                ids.append(verb["id"] + "-zu")
            examples.append({"jp": verb["zu"] or verb["potential"] or verb["volitional"], "kana": verb["zuKana"] or verb["potentialKana"] or verb["volitionalKana"], "es": "forma nueva de " + verb["gloss"]})
        lessons.append(lesson(
            "l-n3-cj-" + str(n), "Conjugación N3, grupo " + str(n), "Conjugación N3", 10,
            "ず, potencial y たら",
            "Los verbos nuevos llevan las formas del N4 y, además, la negación ず de ずに. する hace せず. 居る es godan: 居ります.",
            examples[:4],
            {"practice": "conj", "direction": "conj-es", "ids": ids},
        ))
    lessons.append(lesson(
        "l-n3-repaso", "Repaso del N3", "Repaso N3", 10,
        "Junta el nivel",
        "No añade materia. Aprobar el examen real no depende de esta app.",
        [{"jp": "食べずに出た。", "kana": "たべずにでた。", "es": "Salió sin comer."}],
        {"practice": "grammar", "direction": "grammar-es", "ids": [
            "g-wake-da", "g-zu-ni", "g-okage-de", "g-sei-de", "g-beki-da-beki-de-wa-nai", "g-tokoro-datta"
        ]},
    ))
    for item in lessons:
        if not (1 <= len(item["id"]) <= 80):
            raise SystemExit("id de lección fuera de rango " + item["id"])

    data = {
        "level": "N3",
        "notice": "El JLPT no publica lista oficial desde 2010. Este N3 sigue el recorte comunitario de Jonathan Waller, vía OpenJLPT, y se estudia encima del N5. El español es de NihongoDojo.",
        "WORD_GROUPS": word_groups,
        "WORD_STARTER": ["n3-verbos", "n3-gente", "n3-sociedad"],
        "KANJI_GROUPS": kanji_groups,
        "KANJI_STARTER": ["n3-sociedad", "n3-verbos"],
        "PHRASE_GROUPS": grammar_groups,
        "PHRASE_STARTER": [grammar_groups[0]["id"]],
        "GRAMMAR_GROUPS": grammar_groups,
        "GRAMMAR_STARTER": [grammar_groups[0]["id"]],
        "WORD_ROWS": word_rows,
        "KANJI_ROWS": kanji_rows,
        "PHRASE_ROWS": phrase_rows,
        "GRAMMAR": grammar_items,
        "CONJ_VERBS": verbs,
        "CONJ_STARTER": [aisuru["id"], oru["id"], next(v["id"] for v in verbs if v["dict"] == "信じる")],
        "LESSONS": lessons,
    }
    text = (
        "/* NihongoDojo N3. Generado por scripts/build_n3.py.\n"
        " * Clasificación: listas comunitarias de Jonathan Waller (CC BY), vía OpenJLPT (CC BY-SA 4.0).\n"
        " * Español, explicaciones y frases: obra de este repositorio.\n"
        " * El JLPT no publica lista oficial desde 2010. Esto no es el examen.\n"
        " */\n"
        "(function (root) {\n"
        "    \"use strict\";\n"
        "    var data = "
        + json.dumps(data, ensure_ascii=False, indent=2)
        + ";\n"
        "    root.NihongoDojoN3 = data;\n"
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
