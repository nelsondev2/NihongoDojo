# METODO_PEDAGOGICO.md — WexDC NihongoDojo

> Fuente de verdad pedagógica. Todo código y contenido que contradiga este archivo es un bug.

## 1. Principios innegociables

### 1.1 SRS Determinista (SM-2 simplificado)
- **Nunca improvisar intervalos.** El cálculo es matemático, puro, testeable.
- Persistencia en `localStorage` bajo `nihongodojo.srs.v2.<nivel>.<id>`.
- Respuestas: `Again / Hard / Good / Easy` → intervalos fijos.
- Fórmula SM-2 simplificada (ver `docs/ALGORITMO_SRS.md`):
  ```
  si Again:   intervalo = 0 días (reaparece en la misma sesión, luego 1 día)
  si Hard:    intervalo = 1.2 * intervalo_anterior (mín 1 día)
  si Good:    intervalo = 2.5 * intervalo_anterior (mín 3 días)
  si Easy:    intervalo = 3.5 * intervalo_anterior (mín 4 días)
  facilidad e = e + (0.1 - (5 - calidad) * (0.08 + (5-calidad)*0.02)) clamped [1.3, 2.8]
  próximo_repazo = ahora + intervalo * 86400000
  ```
- Los vencidos (`próximo_repazo <= ahora`) entran a "Repaso de hoy" priorizados por antigüedad.
- Los fallos (`Again`) tienen prioridad absoluta: vuelven al momento (interleaved dentro de la misma sesión), no mañana.

### 1.2 Active Recall Obligatorio
- Flujo de hierro en CÓDIGO, no en sugerencia:
  1. `pregunta` (texto japonés oculto si es listening, o visible si es lectura)
  2. `intento` del usuario (escribir/elegir — nunca autocompletar)
  3. `revelar respuesta` solo tras intento (botón "Ver respuesta" o envío)
  4. `autoevaluación` → SRS actualiza
- Prohibido mostrar `jp` + `traducción` simultáneamente antes del intento en ejercicios de producción.

### 1.3 Nivel del usuario es ley (i+1)
- Antes de generar contenido: consultar `state.level` y `historial`.
- Prohibido introducir vocabulario/gramática por encima de `nivel + 1`.
- Máximo **5 ítems nuevos por sesión** (evitar sobrecarga). El resto es repaso interleaved.

### 1.4 Interleaving
- Nunca 10 kanjis seguidos. Cada sesión debe alternar al menos **2 tipos** (ej: 3 kanji + 2 gramática + 2 listening).
- Implementado en `buildSessionQueue()` que mezcla `vocab`, `kanji`, `gramática`, `listening` en orden aleatorio ponderado, no por bloques.

### 1.5 Corrección amable
- Máximo **2 correcciones por sesión**. La tercera se pospone ("Ya lo pulimos mañana").
- Estructura: `error → por qué → ejemplo correcto → sigue`. Nunca lista larga de fallos.

### 1.6 Input comprensible
- Cada lección nueva introduce vocabulario ya visto + 1 estructura nueva.
- Si aparece palabra desconocida, lleva furigana + glosa; no cuenta como ítem nuevo si solo es soporte.

---

## 2. Estructura de lección (400+ palabras)

Cada lección dura 3–5 min y tiene **6 secciones obligatorias** (ver `REGLAS_ESTILO.md`):

1. **Gancho situacional** (30–60s) — escena real donde el usuario sufre sin esto.
2. **Explicación guiada con analogías** (2–3 min) — regla DESPUÉS del ejemplo, no antes. Párrafos cortos + 1 ejemplo tras cada idea. Anticipar 1 duda.
3. **Ejemplos progresivos** (1–2 min) — 3 ejemplos: ultra simple (2 palabras) → +1 elemento → diálogo real. Cada uno: `jp + furigana + romaji + es + pitch + rate`.
4. **Práctica activa** (2–3 min) — 3–5 ejercicios de active recall, al menos 2 de **listening puro** (`listen_only` con `mostrar_texto_antes: false`).
5. **Errores comunes** (30–60s) — confusión típica X vs Y, por qué importa.
6. **Cierre + repaso** (30s) — recap 3 frases + frase para decir en voz alta + avance próxima lección.

**Autoevaluación antes de entregar** (obligatoria):
- ¿Explico o solo informo? → si informo, reescribir.
- ¿Un profesor humano diría esto así? → si no, reescribir.
- ¿Anticipé ≥1 duda? → si no, reescribir.
- ¿400+ palabras de explicación? → si no, reescribir (dividir en microlecciones).
- ¿≥1 analogía? → si no, reescribir.
- ¿Empecé con gancho, no con regla? → si no, reescribir.

---

## 3. Audio — speechSynthesis exclusivo

Ver `REGLAS_ESTILO.md` sección Audio. Reglas clave:
- Velocidades: vocab nuevo 0.8, ejemplos 0.85, listening 0.9, listening avanzado N4+ 1.0
- Priorizar voz: Neural > Enhanced/Premium > Google > Kyoko/Otoya > resto, filtrando `lang.startsWith("ja")`
- Cancelar previa antes de cada nueva; cola con `onend`; despertar motor con utterance vacía `volume=0`
- Primer toque habilita audio (política webxdc móvil)
- **Regla de oro listening**: si el texto japonés está visible mientras suena, NO es listening. Ocultar texto.

---

## 4. Workflow obligatorio por tarea

1. **Clasificar**: ¿determinista (SRS, validación, flujo) → código puro? ¿creativa (explicación) → ir a 2?
2. **Consultar**: `METODO_PEDAGOGICO.md`, `REGLAS_ESTILO.md`, `INCIDENTES.md`, `localStorage` (nivel/historial)
3. **Generar borrador**
4. **Autocrítica**: Nivel ✅/❌, furigana ✅/❌, traducción natural ✅/❌, ejemplo real ✅/❌, regla inventada ✅/❌, explico/no-informo ✅/❌, 400+ palabras ✅/❌, listening puro ✅/❌, confianza 1–10 (<8 → reescribir)
5. **Entregar en formato estándar** (ver manifiesto WexDC)

---

## 5. Restricciones técnicas webxdc offline

- `.xdc` zip con HTML/JS/CSS/manifest.toml/icon.png, <10MB ideal.
- 100% offline: sin fetch externo, sin APIs de pago, sin MP3 pregenerado.
- JS vanilla, `localStorage` persistente, HTML semántico, CSS mobile-first.
- Sin Service Workers (webxdc ya es offline).
- Código editable desde móvil (GitHub web): sin minificación, comentarios claros.

---

## 6. Niveles N5→N1

- N5: hiragana, katakana, partículas básicas (は, が, を, に, で, へ), です/だ, ます/ない/た/て, contadores, 300 palabras base. Este es el **i** inicial.
- N4: potencial, condicionales たら/ば, volitivo, pasiva/causativa, 1500 palabras.
- N3: keigo básico, forma ず, discurso indirecto, 3000 palabras.
- N2/N1: registro avanzado, sutilezas, 6000–10000 palabras. Nunca introducir N2 en una lección N5+1 (máx N4).

---

## 7. Métricas de calidad

- Lección <400 palabras → **RECHAZADA**
- Lección sin listening puro (≥2) → **RECHAZADA**
- SRS no determinista → **RECHAZADA**
- Active recall no obligatorio en código → **RECHAZADA**
- Confianza <8/10 → **REESCRIBIR**

Última revisión: 2026-10-26 — Agente WexDC
