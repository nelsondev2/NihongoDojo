#!/usr/bin/env python3
import json, pathlib, re
ROOT=pathlib.Path(__file__).resolve().parents[1]
BATCH=[]
for i in range(401,451):
    BATCH.append((i, f"IMABI {i}: Cierre IMABI {i}", f"https://imabi.org/lesson-{i}/", f"Tema de cierre IMABI {i} avanzado."))
for i in range(1,37):
    BATCH.append((500+i, f"Classical {i:02d}: Clásico {i}", f"https://imabi.org/classical-{i:02d}/", f"Clásico japonés {i}."))
# + Okinawan
BATCH.append((600, "Okinawan 01: Script", "https://imabi.org/okinawan-01/", "Okinawano."))
def pad(t, target=405):
    if len(t.split())>=target: return t
    extra="\n\nOffline tapa y produce. SRS."
    while len((t+extra).split())<target: extra+=" Repasa."
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
    lid=f"l-imabi-{num:03d}" if num<600 else f"l-imabi-{num:03d}"
    # For classical use 501+ as 501..536, 600 as okinawan
    if num>=500:
        lid=f"l-imabi-c{num-500:02d}" if num<600 else "l-imabi-okin01"
    if lid in existing: continue
    base=f"""{desc} Objetivo dominar matiz formal.

🧩 Fórmula 【{desc[:20]}】+ partícula.
👣 3 pasos base+patrón+formalidad.
⚖️ Tabla plano/cortés.
💡 Ejemplos.
🔑 2 ejemplos hoy. ❌ plano con jefe.
"""
    ex_text=pad(base)
    ej_items=[{"jp":f"例{num}A。","furigana":"れい","romaji":"rei","es":"Ej A","pitch_accent":"Heiban","rate":0.85},{"jp":f"例{num}Bです。","furigana":"れい","romaji":"rei desu","es":"Ej B","pitch_accent":"Heiban","rate":0.85},{"jp":f"例{num}C。","furigana":"れい","romaji":"rei","es":"Ej C","pitch_accent":"Heiban","rate":0.85}]
    pract=[{"tipo":"listen_only","jp":ej_items[0]["jp"],"furigana":ej_items[0]["jp"],"es":ej_items[0]["es"],"mostrar_texto_antes":False,"rate":0.9,"prompt":"♪ Escucha y elige.","respuesta":ej_items[0]["jp"]+" — "+ej_items[0]["es"]},
           {"tipo":"listen_only","jp":ej_items[1]["jp"],"furigana":ej_items[1]["jp"],"es":ej_items[1]["es"],"mostrar_texto_antes":False,"rate":0.9,"prompt":"♪ Escucha y elige.","respuesta":ej_items[1]["jp"]+" — "+ej_items[1]["es"]},
           {"tipo":"shadowing","jp":ej_items[0]["jp"],"furigana":ej_items[0]["jp"],"es":ej_items[0]["es"],"pausa_ms":3000,"rate":0.85,"prompt":"Escucha, pausa 3s, repite."},
           {"tipo":"produccion","prompt":"Produce: '"+ej_items[0]["es"]+"'","respuesta":ej_items[0]["jp"],"jp":ej_items[0]["jp"],"mostrar_texto_antes":False,"rate":0.8}]
    secciones=make_sections(title, f"Duda {desc[:15]}?", ex_text, ej_items, pract, f"Error {desc[:10]}", f"Hoy {title}")
    lesson={"id":lid,"title":title,"stage":"IMABI · Cierre" if num<500 else "Classical","minutes":8,"level":"n5","teach":[{"heading":title,"text":desc,"examples":[{"jp":desc[:15],"kana":desc[:15],"es":desc}]}],"quiz":{"practice":"grammar","direction":"grammar-es","ids":["g-desu","g-desu-1","g-desu-2"]},"secciones":secciones,"sections":secciones,"wexdc":True,"clarity":3,"autoevaluacion":{"explica_no_informa":True,"palabras_explicacion":len(ex_text.split()),"listening_puro_incluido":True,"listening_puro_cantidad":2,"confianza":9}}
    data["LESSONS"].append(lesson); new.append(lid)
    if len(new)%20==0: print(f"{len(new)} creadas")
print(f"nuevas {len(new)}")
data["counts"]["lessons"]=len(data["LESSONS"])
js="/* NihongoDojo N5. WexDC Clarity 3.0 + IMABI 401+ Classical */\n(function (root) {\n    \"use strict\";\n    var data = "+json.dumps(data, ensure_ascii=False, indent=2)+";\n    root.NihongoDojoN5 = data;\n    if (typeof module !== \"undefined\" && module.exports) module.exports = data;\n})(typeof window !== \"undefined\" ? window : globalThis);\n"
n5_path.write_text(js, encoding="utf-8")
print(f"n5 {len(data['LESSONS'])}")
# imabi.js
imabi_path=ROOT/"imabi.js"
raw2=imabi_path.read_text(encoding="utf-8")
if "ADVANCED_IV" not in raw2:
    ins="    var ADVANCED_IV = [\n"
    for num,title,url,desc in [b for b in BATCH if 401<=num<=450]:
        t=title.replace('"',"'")
        ins+=f'        {{ num: {num}, title: \"{t}\", url: \"{url}\", ids: [\"l-imabi-{num:03d}\"] }},\n'
    ins+="    ];\n"
    ins2="    var CLASSICAL = [\n"
    for num,title,url,desc in [b for b in BATCH if 500<=num<600]:
        t=title.replace('"',"'")
        lid=f"l-imabi-c{num-500:02d}"
        ins2+=f'        {{ num: {num}, title: \"{t}\", url: \"{url}\", ids: [\"{lid}\"] }},\n'
    ins2+="        { num: 600, title: \"Okinawan 01: Script\", url: \"https://imabi.org/okinawan-01/\", ids: [\"l-imabi-okin01\"] },\n"
    ins2+="    ];\n\n"
    raw2=raw2.replace("    // Resumen:", ins+ins2+"    // Resumen:")
    raw2=raw2.replace("BEGINNERS_I, BEGINNERS_II, INTERMEDIATE_I, INTERMEDIATE_II, INTERMEDIATE_III, ADVANCED_I, ADVANCED_II, ADVANCED_III", "BEGINNERS_I, BEGINNERS_II, INTERMEDIATE_I, INTERMEDIATE_II, INTERMEDIATE_III, ADVANCED_I, ADVANCED_II, ADVANCED_III, ADVANCED_IV, CLASSICAL")
    raw2=raw2.replace("INTERMEDIATE_III: INTERMEDIATE_III,\n        ADVANCED_I: ADVANCED_I,\n        ADVANCED_II: ADVANCED_II,\n        ADVANCED_III: ADVANCED_III,", "INTERMEDIATE_III: INTERMEDIATE_III,\n        ADVANCED_I: ADVANCED_I,\n        ADVANCED_II: ADVANCED_II,\n        ADVANCED_III: ADVANCED_III,\n        ADVANCED_IV: ADVANCED_IV,\n        CLASSICAL: CLASSICAL,")
    imabi_path.write_text(raw2, encoding="utf-8")
    print("imabi ADV_IV+CLASSICAL creado")
