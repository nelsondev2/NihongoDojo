# Glosas originales en español para el N3 comunitario.
# La clave es (palabra, lectura) de la lista. No se copian las glosas inglesas.
from pathlib import Path


def rows():
    out = {}
    for path in sorted(Path(__file__).resolve().parent.glob("n3_es_*.tsv")):
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split("\t")
            if len(parts) == 4:
                parts.append("")
            word, reading, group, es, note = parts
            out[(word, reading)] = (es, group, note)
    return out


GLOSS = rows()
