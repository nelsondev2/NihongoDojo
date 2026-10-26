# REGLAS_ESTILO.md — Tono, nivel, furigana y audio

## 1. Tono y voz

- **Tuteo constante.** Eres un amigo paciente que sabe japonés, no un manual.
- Frases cortas (≤20 palabras). Párrafos de 2–3 líneas. Evitar jerga técnica sin explicar.
- Nunca empezar con la regla. Empezar con el **por qué te importa ahora**.
- Humor ligero permitido; sarcasmo no.
- Español natural, no literal del japonés. "Soy estudiante" no "En cuanto a mí, estudiante ser".

## 2. Nivel i+1

- Consultar `state.level` (N5→N1). El vocabulario y gramática del ejemplo no puede superar `nivel + 1`.
- Ejemplo N5: "私は学生です" ✅ — "私は学生だったら" ❌ (condicional es N4, no en lección N5 inicial).
- Máx 5 ítems nuevos por sesión. Si hay 3 palabras nuevas, la gramática debe ser ya conocida o viceversa.

## 3. Furigana y ortografía

- **Siempre** junto al kanji: formato `kanji (furigana)` en texto corrido, o campos separados en JSON:
  ```json
  { "jp": "私は学生です", "furigana": "わたしはがくせいです", "romaji": "watashi wa gakusei desu", "es": "Soy estudiante." }
  ```
- Lecturas: `は` como partícula = `wa`, `へ` = `e`, `を` = `o` (aclarar que como carácter suelto son ha/he/wo).
- Romaji Hepburn por defecto; modo flexible acepta `si/ti/tu/hu/zi` etc. pero no enseñarlos como norma.
- Pitch accent (cuando aporte): `Heiban / Atamadaka / Nakadaka / Odaka` en metadato `pitch_accent`, no visual obligatorio.

## 4. Estructura de lección (plantilla)

```json
{
  "leccion_id": "N5-01",
  "nivel": "N5",
  "duracion_estimada_min": 4,
  "secciones": [
    { "tipo": "gancho", "texto": "..." },
    { "tipo": "explicacion", "texto": "...", "palabras": 520 },
    { "tipo": "ejemplos", "items": [
        { "jp": "...", "furigana": "...", "romaji": "...", "es": "...", "pitch_accent": "Heiban", "rate": 0.85 }
    ]},
    { "tipo": "practica", "ejercicios": [
        { "tipo": "listen_only", "jp": "わたしはがくせいです", "es": "Soy estudiante.", "mostrar_texto_antes": false, "rate": 0.9 },
        { "tipo": "shadowing", "jp": "わたしはがくせいです", "pausa_ms": 3000 },
        { "tipo": "produccion", "prompt": "Di: 'En cuanto a mí, soy estudiante'", "respuesta": "私は学生です" }
    ]},
    { "tipo": "errores_comunes", "texto": "..." },
    { "tipo": "cierre", "texto": "..." }
  ],
  "autoevaluacion": {
    "explica_no_informa": true,
    "palabras_explicacion": 520,
    "listening_puro_incluido": true,
    "confianza": 9
  }
}
```

### Conteo de palabras
- Solo la sección `explicacion` cuenta (sin ejemplos, ejercicios ni código).
- 400 mínimo. Si no cabe en 1 lección, **dividir en 2 microlecciones** (ej: N5-01a y N5-01b), nunca comprimir saltándose secciones.

## 5. Audio — reglas innegociables

### Selección de voz
```js
function japaneseVoice() {
  const ja = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith("ja"));
  // Prioridad: Neural > Enhanced/Premium > Google > Kyoko/Otoya > resto
  const score = v => /neural/i.test(v.name) ? 5 : /enhanced|premium/i.test(v.name) ? 4 : /google/i.test(v.name) ? 3 : /kyoko|otoya/i.test(v.name) ? 2 : 1;
  ja.sort((a,b) => score(b)-score(a) || (b.localService - a.localService));
  return ja[0] || null;
}
```
- Filtrar `lang.startsWith("ja")` (no `ja-JP` exacto).
- Preferir `localService === true` (voces offline, clave en Cuba sin datos).

### Velocidades
- Vocabulario nuevo: `rate = 0.8`
- Ejemplos en explicación: `0.85`
- Práctica listening (N5-N3): `0.9`
- Listening avanzado N4+ / shadowing rápido: `1.0`

### Reproducción
- **Cancelar antes de cada nueva**: `speechSynthesis.cancel()`
- **Cola con onend**: no `cancel()` múltiple; encolar frases largas (>80 chars) cortando por `。`/`、` y `onend` → siguiente chunk.
- **Despertar motor** al `DOMContentLoaded` y al primer `touch`:
  ```js
  function wakeEngine() {
    const u = new SpeechSynthesisUtterance("");
    u.volume = 0; u.lang = "ja-JP"; speechSynthesis.speak(u);
  }
  ```
- **Primer toque habilita audio**: enganchar `document.addEventListener('touchend', unlock, {once:true})`.

### Tipos de ejercicio con audio
- `listen_only`: `mostrar_texto_antes: false` — texto OCULTO, solo audio → active recall auditivo. Tras responder, se revela texto.
- `read_along`: texto visible + audio → presentación (no cuenta como listening).
- `shadowing`: `audio → pausa 3000ms → audio` → usuario repite en voz alta.

**Regla de oro**: si el texto japonés está visible mientras suena, **no es listening**.

### Cantidad
- Al menos **2 ejercicios de listening puro** por lección.
- No usar TTS para todo: solo pronunciación, listening, shadowing, pitch. El exceso cansa.

### Limitaciones conocidas (diseñar alrededor)
- Voces cargan async → `getVoices()` + `onvoiceschanged`
- `cancel()` corta en curso → cola manual
- Sin pitch visual → solo entrenamiento auditivo
- Primera reproducción lenta en Android → wake
- Puede fallar en segundo plano → aceptar

## 6. Kanji, vocab y gramática en texto

- Kanji: siempre con furigana + significado + on/kun cuando aporte (ej: 日 `ひ/にち` "día/sol").
- Vocab nuevo: max 5 por sesión; cada uno con ejemplo sonoro.
- Gramática: 1 regla + 2 ejemplos + 1 contraejemplo (qué no hacer) por lección.

## 7. Interleaving y corrección

- Sesión mínima: 8 preguntas, 2 tipos distintos. Ej: 6 palabras + 4 kanji + 4 listening = 14 total pero alternados, no 10 palabras seguidas.
- Corrección: máx 2 por sesión. Formato:
  > "Aquí has puesto `が` pero querías `は`. Es normal confundirlos: `は` marca tema (de qué hablamos) y `が` marca foco (qué es nuevo). Di en voz alta: 私は学生です."

## 8. Tamaño y edición móvil

- Sin frameworks pesados. JS vanilla, CSS mobile-first.
- Sin `fetch` externo. Todo empaquetado en `.xdc` (<10MB ideal).
- Comentarios claros, sin minificación innecesaria (editable desde GitHub móvil).

## 9. Checklist de entrega de lección

- [ ] 400+ palabras explicación
- [ ] Gancho situacional (no regla)
- [ ] ≥1 analogía
- [ ] ≥1 duda anticipada
- [ ] 3 ejemplos progresivos con furigana/romaji/es/rate
- [ ] 3–5 ejercicios active recall, ≥2 listening puro
- [ ] Errores comunes (X vs Y)
- [ ] Cierre con frase para decir en voz alta
- [ ] Nivel respetado (i+1)
- [ ] Confianza ≥8/10

