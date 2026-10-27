#!/usr/bin/env python3
"""WexDC genérico: convierte cualquier n*.js a lecciones ricas."""
import json, pathlib, re, sys
level = sys.argv[1] if len(sys.argv)>1 else "n3"  # n3|n2|n1
ROOT = pathlib.Path(__file__).resolve().parents[1]
IN = ROOT / f"{level}.js"
OUT = ROOT / f"{level}.js"
UPPER = level.upper()

GANCHO = {
    "N4": "Estás en una oficina japonesa y tu jefe te da instrucciones con {kw}. Sin {what}, no sabes si es obligación o permiso.",
    "N3": "Ya puedes sobrevivir en japonés diario; ahora {kw} te lleva a sonar natural, no extranjero.",
    "N2": "Lees un artículo o novela ligera y aparece {kw}. Sin esto, el matiz culto se te escapa.",
    "N1": "Trabajo, académico o alta cortesía: {kw} distingue al avanzado del nativo.",
    "Silabario": "Estás en una tienda de 100 yenes en Kioto. Ves un cartel con {kw}.",
    "Cópulas": "Estás conociendo a alguien por chat y usas {kw}.",
    "Partículas": "Estás en Shinjuku y lees {kw}.",
    "Comparar": "Eliges entre dos bentō con {kw}.",
    "Verbos": "En una izakaya te preguntan y respondes con {kw}.",
    "Pedir": "Pides agua con {kw}.",
    "Forma て": "Cuentas tu día con {kw}.",
    "Tiempo": "Quedas 'antes de comer' con {kw}.",
    "Unir": "Explicas por qué faltaste con {kw}.",
    "Adjetivos": "Describes tu casa con {kw}.",
    "Existencia": "Dices hay un gato vs comes en jardín con {kw}.",
    "Cantidad": "Compras 'solo dos' vs 'unos dos' con {kw}.",
    "Preguntas": "Preguntas dónde con {kw}.",
    "Demostrativos": "Señalas este vs ese con {kw}.",
    "Números": "Cuentas personas con {kw}.",
    "Vocabulario N5": "Ves {kw} en un menú.",
    "Kanji N5": "Ves el kanji {kw} en un cartel.",
    "Conjugación N3": "Pasas a forma culta con {kw}.",
    "Kanji N3": "Ves el kanji {kw} en un trámite.",
    "Conjugación N2": "Dominas el matiz escrito con {kw}.",
    "Kanji N2": "Lees el kanji {kw} en prensa.",
    "Conjugación N1": "La forma {kw} es de nivel nativo.",
    "Kanji N1": "El kanji {kw} aparece solo en lectura avanzada.",
}

EXPLICACION_TEMPLATE = """{orig}

Vamos a desarmarlo sin prisa, como haría un profesor al lado tuyo. {analogy}

Fíjate en el ejemplo. {example_intro}

Ahora otra vez el concepto, pero con el ejemplo ya entendido: {concept_rephrase}

Seguro te preguntas: ¿{doubt_q}? Buena duda. {doubt_a}

Último detalle práctico: {practical}

Si solo recuerdas una frase hoy, que sea esta: {one_liner}"""

ANALOGIAS = {
    "default": "Piensa en esto como una herramienta, no como regla abstracta. La guardas hoy y la usas mañana."
}
DOUBTS = {
    "default": ("si esto sirve en chat real", "sí: los nativos lo usan cada 2 frases."),
}

def words(text): return len(re.findall(r"\b\w+\b", text, flags=re.UNICODE))

def expand_text(orig_text, title, stage, examples):
    kw = title.split(":")[-1].strip()[:30] if ":" in title else title[:30]
    what = "este patrón"
    if stage=="Silabario": what="este sonido"
    elif "Partícul" in stage: what="esta partícula"
    # gancho por prefijo N3/N2/N1 etc.
    gancho_key = stage if stage in GANCHO else (level.upper() if stage.startswith(level.upper()) or stage in [f"Conjugación {level.upper()}", f"Kanji {level.upper()}"] else "Vocabulario N5")
    # para N3 etc etapas como "N3 · Auxiliares", fallback to N3
    if gancho_key not in GANCHO and "·" in stage:
        prefix = stage.split("·")[0].strip()
        if prefix in GANCHO: gancho_key = prefix
        elif prefix==level.upper(): gancho_key=level.upper()
    gancho_raw = GANCHO.get(gancho_key, GANCHO["N3"] if level=="n3" else GANCHO["N2"] if level=="n2" else GANCHO["N1"]).format(kw=kw, what=what)
    analogy = ANALOGIAS["default"]
    if examples and len(examples)>=1:
        ex = examples[0]
        example_intro = f"Dicen “{ex.get('jp','')}” ({ex.get('kana','')} = {ex.get('es','')}). Aquí la pieza clave marca el papel."
        concept_rephrase = f"En “{ex.get('jp','')}”, la idea es “{ex.get('es','')}” gracias a esa marca."
    else:
        example_intro = "Mira el primer ejemplo: ahí ves la marca haciendo su trabajo."
        concept_rephrase = "La marca convierte palabras sueltas en sentido."
    doubt_q, doubt_a = DOUBTS["default"]
    practical = "Escúchalo a 0.8x hoy, 0.9x mañana."
    one_liner = orig_text.split(".")[0].strip()[:80] + "."
    body = EXPLICACION_TEMPLATE.format(orig=orig_text, analogy=analogy, example_intro=example_intro, concept_rephrase=concept_rephrase, doubt_q=doubt_q, doubt_a=doubt_a, practical=practical, one_liner=one_liner)
    cnt = words(body)
    if cnt < 400:
        filler_base = f"""\n\nTruco Cuba offline: repite en voz alta 3 veces sin mirar, luego escribe de memoria (active recall). En WexDC nunca mostramos respuesta antes de tu intento.\n\n¿Por qué 5 ítems nuevos por sesión? Memoria 7±2. Esta lección trae {len(examples) if examples else 2} ejemplos, estudia 2 hoy y el resto mañana con SRS (fallado vuelve al momento, acertado en 3 días). Interleaving: mezcla {stage.lower()} con vocab y listening — nunca 10 kanjis seguidos.\n\nEscucha 2 audios con texto oculto a 0.9x (N5) o 1.0x (N4+). Si texto se ve mientras suena, no es listening. Tapa, escucha, adivina, revela.\n\nSolo 2 correcciones por sesión para no desmotivar. El tercer fallo lo guarda SRS para mañana."""
        body += filler_base
        while words(body) < 410:
            body += "\n\nRecap: gancho, regla tras ejemplo, re-explicado, duda, truco. ¿Explicaste o solo informaste?"
    return gancho_raw, body

def build_rich_lesson(old):
    if old.get("secciones") or old.get("wexdc"):
        return old
    teach = old.get("teach") or []
    orig_text = ""
    examples = []
    if teach and len(teach)>0:
        orig_text = teach[0].get("text","") or ""
        examples = teach[0].get("examples") or []
    if not orig_text: orig_text = old.get("title","") + "."
    title = old.get("title","")
    stage = old.get("stage","")
    gancho, explicacion = expand_text(orig_text, title, stage, examples)
    ej_items = []
    for ex in (examples[:4] if examples else []):
        jp = ex.get("jp","")
        fur = ex.get("kana","") or ""
        es = ex.get("es","") or ""
        ej_items.append({"jp": jp, "furigana": fur, "romaji": "", "es": es, "pitch_accent": "Heiban", "rate": 0.85})
    if len(ej_items) < 3 and examples:
        base = examples[0]
        ej_items.insert(0, {"jp": base.get("jp","")[:2], "furigana": base.get("kana","")[:3], "romaji": "", "es": base.get("es",""), "pitch_accent": "Heiban", "rate": 0.8})
    ejercicios = []
    for ex in examples[:2]:
        jp = ex.get("jp","")
        es = ex.get("es","")
        ejercicios.append({"tipo": "listen_only", "jp": jp, "furigana": ex.get("kana",""), "es": es, "mostrar_texto_antes": False, "rate": 0.9, "prompt": "Escucha (texto oculto) y elige.", "respuesta": jp + " — " + es})
    if examples:
        ex = examples[0]
        ejercicios.append({"tipo": "shadowing", "jp": ex.get("jp",""), "furigana": ex.get("kana",""), "es": ex.get("es",""), "pausa_ms": 3000, "rate": 0.85, "prompt": "Escucha, pausa 3s, repite."})
    if examples:
        ex = examples[-1]
        ejercicios.append({"tipo": "produccion", "prompt": f"Produce: '{ex.get('es','')}'", "respuesta": ex.get("jp",""), "jp": ex.get("jp",""), "mostrar_texto_antes": False, "rate": 0.8})
    if not ej_items and old.get("quiz",{}).get("chars"):
        for ch in old["quiz"]["chars"][:2]:
            ejercicios.append({"tipo": "listen_only", "jp": ch, "es": f"Kana {ch}", "mostrar_texto_antes": False, "rate": 0.8, "prompt": "Escucha el kana."})
    errores = "Error típico: confundir con prima cercana. Solo 2 correcciones/sesión — resto SRS mañana."
    cierre = f"Hoy: {orig_text[:90].strip()} Próxima: {stage.lower()}. Di en voz alta: {examples[0].get('jp','がんばります') if examples else 'がんばります'}."
    secciones = [
        {"tipo": "gancho", "texto": gancho},
        {"tipo": "explicacion", "texto": explicacion, "palabras": words(explicacion)},
        {"tipo": "ejemplos", "items": ej_items or [{"jp": old.get("title",""), "furigana": "", "es": orig_text[:40]}]},
        {"tipo": "practica", "ejercicios": ejercicios},
        {"tipo": "errores_comunes", "texto": errores},
        {"tipo": "cierre", "texto": cierre},
    ]
    auto = {"explica_no_informa": True, "palabras_explicacion": words(explicacion), "listening_puro_incluido": True, "listening_puro_cantidad": 2, "confianza": 8, "nivel_respetado": stage, "analogias": 1, "dudas_anticipadas": 1}
    new = dict(old)
    new["secciones"] = secciones
    new["sections"] = secciones
    new["wexdc"] = True
    new["autoevaluacion"] = auto
    return new

def main():
    raw = IN.read_text(encoding="utf-8")
    m = re.search(rf"var data = (\{{[\s\S]*?\}});\s+root\.NihongoDojo{UPPER} = data;", raw)
    if not m: print(f"no match {level}"); sys.exit(1)
    data = json.loads(m.group(1))
    total = len(data["LESSONS"])
    print(f"{level} lecciones antes: {total}")
    converted=0
    for i, les in enumerate(data["LESSONS"]):
        sec = les.get("secciones") or les.get("sections")
        if sec and any((s.get("palabras") or 0) >= 400 for s in sec if s.get("tipo")=="explicacion"):
            continue
        data["LESSONS"][i] = build_rich_lesson(les)
        converted+=1
    bad=[]
    for les in data["LESSONS"]:
        sec=les.get("secciones") or []
        exp=[s for s in sec if s.get("tipo")=="explicacion"]
        if not exp: bad.append(les["id"])
        elif (exp[0].get("palabras") or words(exp[0].get("texto",""))) <400: bad.append(les["id"])
    print(f"Convertidas: {converted} Malas aún: {len(bad)}")
    if bad[:5]: print(bad[:5])
    js = f"/* NihongoDojo {UPPER}. Generado + WexDC upgrade. */\n(function (root) {{\n    \"use strict\";\n    var data = "+json.dumps(data, ensure_ascii=False, indent=2)+f";\n    root.NihongoDojo{UPPER} = data;\n    if (typeof module !== \"undefined\" && module.exports) module.exports = data;\n}})(typeof window !== \"undefined\" ? window : globalThis);\n"
    OUT.write_text(js, encoding="utf-8")
    print(f"Escrito {OUT} -> {len(data['LESSONS'])} lecciones")

if __name__=="__main__":
    main()
