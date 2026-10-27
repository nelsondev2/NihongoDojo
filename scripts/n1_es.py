# Glosas españolas del vocabulario N1.
# Una línea por palabra de OpenJLPT, en el mismo orden. No se copia el inglés.
from pathlib import Path

HERE = Path(__file__).resolve().parent


def load():
    rows = []
    for path in sorted(HERE.glob("n1_es_*.tsv")):
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            word, reading, es, note = line.split("\t")
            rows.append((word, reading, es, note))
    return rows
