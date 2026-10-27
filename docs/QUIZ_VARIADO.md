# QUIZ_VARIADO — Especificación WexDC

> Ninguna lección corta, ningún quiz monótono. 20 ejercicios variados por lección, todos ligados al tema.

## Regla

- Cada lección → **20 preguntas**, mínimo **3 tipos distintos**, todos sobre el mismo punto gramatical / vocabulario / kanji enseñado.
- El quiz no es un examen genérico: es la **práctica guiada** de lo que acabas de leer en las 6 secciones.

## Tipos de ejercicio (variedad obligatoria)

| Tipo | Clave | Prompt | Respuesta | Ejemplo N5 は |
|------|-------|--------|-----------|---------------|
| `translate_jp_es` | Traducción JP→ES | `私は学生です。` + furigana | `Soy estudiante.` | Elige traducción correcta |
| `translate_es_jp` | Traducción ES→JP | `Soy estudiante.` | `私は学生です。` | Elige frase japonesa correcta |
| `complete_blank` | Completar hueco | `私は＿学生です。` | `は` | Toca hueco, elige partícula/palabra |
| `order_sentence` | Ordenar frase | Palabras desordenadas `学生 / 私は / です` + 4 oraciones candidatas | Oración correcta `私は学生です。` | Elige orden correcto |
| `listening_jp_es` | Listening puro | 🔊 audio oculto `わたしはがくせいです` (texto oculto hasta responder) | ES | Solo audio, nada visible |
| `conjugation_write` | Conjugar | `食べる → て forma` | `食べて` | Escribe / elige forma conjugada |
| `kanji_reading` | Lectura kanji | `日` | `ひ` | Elige lectura |
| `grammar_transform` | Transformar | `です → pasado` | `でした` | Elige transformación |

> **Mínimo por lección:** `translate_jp_es` + `complete_blank` + `order_sentence` + 1 de `listening`. El resto se adapta.

## Adaptación por tema

- **Partículas (は/が/を...):** 5× `translate_jp_es`, 5× `translate_es_jp`, 5× `complete_blank` (hueco partícula), 5× `order_sentence` (reordena frase con partícula).
- **Cópulas/Verbos (です/ます/ない/た):** `translate` + `complete_blank` (verbo) + `conjugation_write` + `order_sentence`.
- **Vocabulario (palabras):** `translate_jp_es` + `translate_es_jp` + `listening_jp_es` + `order_sentence` (si la palabra aparece en frase) o `complete_blank` (frase con hueco de vocabulario).
- **Kanji:** `kanji → significado` + `kanji → lectura` + `listening_jp_es` + `complete_blank` (frase con kanji).
- **Conjugación:** `conjugación_write/choice` + `translate` + `order_sentence`.
- **Silabario:** `kana→romaji` + `romaji→kana` + `listening` + `order` (ordena kana sueltos en palabra? se usa `complete`).

## 20 preguntas — construcción

```js
function buildVariedQueue(lesson, Lex, Core, rng):
  pools = { translate: [], complete: [], order: [], listening: [] }
  for each lexId in lesson.quiz.ids:
    item = findById(catalog, id)
    pools.translate.push( makeTranslate(item) )
    pools.complete.push( makeComplete(item) )
    pools.order.push( makeOrder(item) )
    pools.listening.push( makeListening(item) )
  // Interleaving: no 5 del mismo tipo seguidos
  queue = interleave([pools.translate, pools.complete, pools.order, pools.listening]) // round-robin
  // Si faltan (ej: 3 ids ×4 tipos =12), duplicar con variaciones (cambia distractoras) hasta 20
  while queue.length < 20: queue.push( cloneWithNewDistractors( randomPoolItem ) )
  return queue.slice(0,20).map(shuffleChoices)
```

## Active recall + SRS + Audio

- **Active recall:** prompt visible, respuesta oculta hasta `intento` → `revelar` → autoeval `Again/Hard/Good/Easy` → SRS.
- **Audio:**
  - `translate_jp_es` / `complete` → ejemplos a `0.85`
  - `listening_jp_es` → `0.9` (N5-N3) / `1.0` (N4+), texto japonés **oculto** (`mostrar_texto_antes:false`)
  - `vocab nuevo` → `0.8`
  - Cola `onend`, `cancel()` previa, `wakeEngine()` al primer toque (webxdc).

## Persistencia offline

- `localStorage` bajo `nihongodojo.quiz.v2.<lessonId>` guarda `queue` + `index` + `results` (para reanudar tras cerrar Delta Chat).
- `srs.v2` guarda `ease/interval/reps/due` por `lexId+direction`.

## UI

- Un solo `<template>` `quizCardTemplate`; `app.js` detecta `item.exerciseType` y renderiza:
  - `prompt` (jp + furigana si visible, es si ES→JP),
  - `choices` (2-4 botones),
  - `audio` botón `🔊 Oír` con `rate` correcto,
  - `feedback` con máx 2 correcciones por sesión (WexDC amable).

## Validación

- `scripts/test-lessons.js` debe afirmar: `queue.length === 20` para toda lección WexDC.
- `lesson.secciones` (6) + `quizV2 20` son fuentes de verdad pedagógica.
