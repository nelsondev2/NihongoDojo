# Glosas españolas del kanji N1, en el orden del índice. Sin columna de carácter.
from pathlib import Path

HERE = Path(__file__).resolve().parent


def load():
    glosses = []
    for path in sorted(HERE.glob("n1_kanji_es_*.txt")):
        for line in path.read_text(encoding="utf-8").splitlines():
            text = line.strip()
            if text:
                glosses.append(text)
    return glosses
