# Fichas originales en español para el kanji N2 comunitario.
from pathlib import Path


def rows():
    out = {}
    for path in sorted(Path(__file__).resolve().parent.glob("n2_kanji_*.tsv")):
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split("\t")
            if len(parts) == 4:
                parts.append("")
            ch, reading, group, es, note = parts
            out[ch] = (reading, es, group, note)
    return out


KANJI = rows()
