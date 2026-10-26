# INCIDENTES.md — Registro de fallos y lecciones aprendidas

Formato: cada incidente con fecha, síntoma, causa, impacto pedagógico, fix, prevención.

---

## 001 — Lecciones-ficha (2024 → 2026-10-26 detectado)

- **Síntoma**: Todas las lecciones N5 actuales tienen `teach.text` de 1 frase (≈15–40 palabras).
  Ejemplo `l-h-vocales`: "Cinco vocales, cada una una sílaba. あ es a, い es i, う es u, え es e, お es o."
  Es un diccionario, no una clase. No hay gancho, analogía, errores comunes, ni listening puro.
- **Causa**: El generador `scripts/build_n5.py` priorizó cobertura (357 lecciones) sobre pedagogía.
- **Impacto**: Violación directa de **Regla Crítica #1** (400+ palabras, 6 secciones). El usuario en Cuba sin profesor no aprende con fichas.
- **Fix propuesto**: Reescribir generador para plantilla de 6 secciones con `gancho`, `explicacion` (≥400 palabras), `ejemplos_progresivos`, `practica` (≥2 listening puro), `errores_comunes`, `cierre`. Dividir silabarios en microlecciones de 5 caracteres pero con explicación completa, no ficha. Ejemplo de referencia: `ejemplos/N5-01-wa.json` (ver).
- **Prevención**: Añadir test `scripts/test-lessons.js` que falle si `explicacion.palabras < 400` o `listening_puro < 2`.
- **Estado**: 🔴 ABIERTO — iniciado en esta iteración (commit WexDC-01).

## 002 — SRS improvisado (2024 → 2026-10-26 detectado)

- **Síntoma**: `core.js:planReview` y `app.js:REVIEW_DUE_MS = 3*86400000` hardcodeado. No hay `Again/Hard/Good/Easy`, ni facilidad, ni intervalo por ítem. Todo lo acertado vuelve a los 3 días, lo falle inmediatamente, sin importar si era fácil o difícil. No es SM-2, es FIFO.
- **Causa**: Atajo MVP temprano; se dejó como "suficiente".
- **Impacto**: Violación **SRS DETERMINISTA**. El usuario no recibe repetición espaciada real; olvida a los 2 días lo que creyó fácil y repasa innecesariamente lo ya sabido. Ineficiencia crítica offline (cada repaso desperdiciado cuesta datos/tiempo móvil).
- **Fix**: Implementar SM-2 simplificado determinista en `core.js` (`docs/ALGORITMO_SRS.md`), con persistencia `srs.v2.*`, intervalos calculados, colas `due` + `miss`. Mantener compatibilidad migrando `seen.*` antiguo.
- **Prevención**: Test `test-srs.js` que valide intervalos para cada calidad y que nunca improvise (misma entrada → misma salida).
- **Estado**: 🔴 ABIERTO — iniciado (commit WexDC-01).

## 003 — Audio sin prioridades ni velocidades por nivel (2024 → 2026-10-26 detectado)

- **Síntoma**: `app.js:japaneseVoice()` solo filtra `localService` y `^ja`, sin priorizar `Neural > Enhanced > Google > Kyoko`. `speakJapanese()` usa `rate = 0.88/0.92` fijo, no 0.8/0.85/0.9/1.0 según tipo. No hay `wakeEngine()` ni cola robusta con `onend` por chunks de 80 chars (existía pero incompleta). Primer toque no garantiza `speechSynthesis` en webxdc WebKit.
- **Causa**: Implementación inicial funcional pero no pedagógica.
- **Impacto**: Violación **Regla Audio**. Voces robóticas en vez de neurales cuando existen; listening N5 demasiado rápido; solapamiento si usuario pulsa rápido; primer audio mudo en algunos Android.
- **Fix**: Reescribir `japaneseVoice()` con scoring, `speakJapanese(text, {rate, onEnd})`, `wakeEngine()`, cancel previa, cola onend, desbloquear en primer interacción. Añadir `rate` por tipo en JSON de lección.
- **Prevención**: Test manual en webxdc con 3 voces ja instaladas; lint que falle si `rate` fuera de [0.8,1.0].
- **Estado**: 🔴 ABIERTO — iniciado.

## 004 — Listening falso (2024 → 2026-10-26 detectado)

- **Síntoma**: Ejercicios marcados "Escuchar → español" muestran el texto japonés debajo mientras suena el TTS (porque `view.speak` se renderiza visible). El usuario lee, no escucha.
- **Causa**: Falta distinción `mostrar_texto_antes: false` vs `true`.
- **Impacto**: Violación **Regla de oro del listening**. No entrena oído.
- **Fix**: Nuevo campo `mostrar_texto_antes` y `tipo: listen_only` en práctica; CSS `hidden` hasta revelar tras intento. Al menos 2 por lección obligatorio.
- **Prevención**: Test de UI que compruebe que `listen_only` oculta `teach-jp` antes de responder.
- **Estado**: 🔴 ABIERTO.

## 005 — Sin interleaving ni límite i+1 (2024 → 2026-10-26 detectado)

- **Síntoma**: Sesiones libres permiten 10 kanjis seguidos, o 12 palabras nuevas de golpe. Lecciones `l-v-numeros-1` meten 12 palabras nuevas sin repaso mezclado.
- **Causa**: Falta `buildSessionQueue()` con mezcla.
- **Impacto**: Sobrecarga cognitiva; aprendizaje en bloque, no durable.
- **Fix**: Limitar a 5 ítems nuevos por sesión; interleaving obligatorio (≥2 tipos por sesión de ≥8 preguntas). Si el usuario pide 12 palabras, se le sirven 5 nuevas + 7 repasos variados.
- **Prevención**: Test que valide que ninguna sesión generada ponga >5 `isNew` seguidos ni 1 solo `practice`.
- **Estado**: 🔴 ABIERTO.

---

## Plantilla para nuevos incidentes

```md
## NNN — Título corto (YYYY-MM-DD detectado)
- Síntoma:
- Causa:
- Impacto pedagógico:
- Fix:
- Prevención:
- Estado: 🔴 ABIERTO / 🟡 EN CURSO / 🟢 CERRADO
```
