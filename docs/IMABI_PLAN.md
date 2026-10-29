# NihongoDojo → Plan IMABI — Propuesta de reestructuración

`IMABI` no es JLPT N5/N4. Es un currículo **propio por dificultad gramatical**, 400+ lecciones. No podemos copiar sus textos, pero sí seguir su **orden pedagógico**, que es excelente.

Fuente verificada: https://imabi.org/table-of-contents-%E7%9B%AE%E6%AC%A1 (7 páginas, 0-400+)

## Estructura IMABI real

**Beginners I (第0-50课) — fundamentos**
0 Intro Japanese, 1 Vowels, 2 Consonants, 3 Pitch & Devoicing, 4 Hiragana, 5 Katakana, 6 Kana Orthography, 7 Kanji I, 8 Kanji II, 9 Nouns & Pronouns, 10 Copula Plain, 11 Copula Polite, 12 が (sujeto), 13 は (tema), 14 Adj i, 15 Adj-na I, 16 を, 17 Ichidan, 18 Godan, 19 する/来る, 20 か, 21 か+neg, 22 が objeto, 23 も, 24-26 こそあど I-III, 27 と, 28 の, 29 に locativo, 30 へ, 31 で, 32 ある/いる, 33 て afirmativo, 34 て final, 35 なくて/ないで, 36 ている, 37 てある, 38-42 Numerales+contadores (～円・つ etc), 43-46 Tiempo deíctico/no-deíctico, 47-49 Contadores tiempo/frecuencia, 50 ～たものだ

**Beginners II (第51-100) — ampliar base**
51 ～時, 52 ～頃, 53 ～前, 54 ～あと/てから, 55-56 ～間/うちに, 57 Fields, 58 Geography, 59 Greetings, 60 はい, 61 いいえ, 62 から, 63 まで, 64 を transición, 65 Adverbs, 66 Adv←Adj, 67 よい/いい, 68 adj-na II, 69 adnominal i/na, 70 trans/intrans, 71 多い/少ない, 72 同じ, 73-74 こそあど IV-V, 75 と cita, 76-78 に/と resultado/estándar/propósito, 79 ～始める/出す, 80 Interrogativos I, 81 か indirecta, 82 も II, 83 から/ので, 84 のに, 85 だけ, 86 でも, 87 や, 88 など/なんか, 89 し, 90 Giving ～てあげる/くれる/もらう, 91 ～てもいい, 92 が/けれど, 93 よ/ね, 94 な/と, 95 ～かける, 96 ～終わる, 97 Potential, 98 できる, 100 あげる/くれる/もらう

**Intermediate I-III, Advanced I-III** → 101-400+ cubre かもしれない, たい/がる, たり, のだ, ながら, こと nominalización, ～そうだ/らしい, pasiva, causativa, volitivo, ～ば/たら, 敬語 (176-184), より/ほど, 中, etc hasta 古典.

## Qué cambia para NihongoDojo

Hoy NihongoDojo está partido por **JLPT** (`n5.js` 214, `n4.js` 199...). Eso mezcla kana, copula, て y contadores sin orden didáctico. IMABI demuestra:

1. **Kana+pitch antes que gramática** (Imabi 1-6 → tu `l-h-vocales` está bien, pero falta `Pitch Accent & Devoicing` como lección propia — hoy no existe)
2. **Copula 10-11 antes que partículas** (tú ya tienes `l-g-desu` pero lo tienes mezclado con vocab)
3. **が/は separados** (12 y 13) — tú los tienes juntos en `l-wx-n5-01-wa`, hay que dividir
4. **Adjetivos i/na antes que verbos** (14-15 → 17-19) — tú enseñas verbos ichidan/godan antes que adj-na, invierte
5. **Contadores agrupados 38-49** — tú los dispersas por niveles, IMABI los da seguidos para no olvidar
6. **て familia junta 33-37** — tú tienes `l-cj-1` (て) suelto, falta て-aru/ている como bloque

## Propuesta concreta (sin copiar textos)

**Opción A — Reindexar sin reescribir (rápida, segura):**
No toco `n5.js` contenido. Creo `imabi_index.js` que **reordena IDs** al orden Imabi 0-100 y lo expone como `NihongoDojoImabi = { BEGINNERS_I: [...IDs], BEGINNERS_II: [...] }`. `app.js` añade selector `Camino JLPT | Camino IMABI`. 0 riesgo, mantiene <10MB, spec intacta.

**Opción B — Reescribir lecciones al estilo IMABI (profunda):**
Regenero `n5.js` con 50 lecciones nuevas `l-imabi-010`...`l-imabi-050` siguiendo títulos IMABI pero con **mis textos Clarity 3.0 originales** (objetivo→fórmula→tabla→ejemplos desglosados). Ej: `第16課 を I` no copio explicación IMABI, escribo: `Fórmula 【Aは Bを V】` + ejemplos `本を読む` desglosados + error `を≠が`. Mantiene tu formato 400 palabras, 2 listening puro, SRS.

Mi recomendación: **A ahora + B iterativa.** IMABI tiene 400 lecciones, hacerlo de golpe rompería tests y <10MB.

## Ejemplo de mapeo (Beginners I 12-20)

| IMABI | Título IMABI | Tu lección actual | Acción |
|-------|--------------|-------------------|--------|
| 12 | が sujeto | `l-g-ga` (dentro de N5) | Reindexar, añadir contraste は/が explícito |
| 13 | は tema | `l-wx-n5-01-wa` (truncada, ya reparada) | Dividir en 2 lecciones: は tema vs は contraste |
| 14 | Adj i | `l-v-adj-...` disperso | Crear `l-imabi-014` con tabla `高い/高くない/高かった` |
| 16 | を I | `l-g-wo` | Mantener, mover tras adj |
| 17-19 | Ichidan/Godan/する | `l-cj-...` | Reordenar 17→19 y añadir pitch |

## Próximo paso

¿Quieres que ejecute **Opción A** ahora? Genero `imabi_index.js` + parche `app.js` para selector IMABI/JLPT y `docs/IMABI_CREDITS.md` (atribución, sin copiar textos).

Si prefieres B, dime nivel para empezar (ej: `Beginners I 0-20`) y lo genero con tus scripts `wexdc_upgrade_*_clarity.py` adaptados a títulos IMABI.

Licencia: IMABI no es CC BY, solo seguimos estructura (títulos son hechos), no textos.
