# ALGORITMO_SRS.md — SM-2 simplificado determinista (WexDC)

Este archivo es la **fuente de verdad matemática**. Cualquier cambio a la fórmula requiere actualizar aquí, en `core.js` y en `scripts/test-srs.js`.

## Objetivo

- 100% offline, sin servidor, sin ML.
- Determinista: misma entrada → mismo intervalo, siempre.
- Persistente en `localStorage` (webxdc no tiene backend).
- Sencillo de explicar al usuario cubano: "si fallas, vuelve ahora; si aciertas fácil, tarda más".

## Estado por ítem

```js
{
  id: "w-123",               // id de palabra/kanji/frase/conj/grammar/kana:tipo+char
  practice: "words",         // words | kanji | phrases | conj | grammar | kana | reading
  ease: 2.5,                 // facilidad [1.3, 2.8] — inicia 2.5
  interval: 0,               // días — inicia 0 (nuevo)
  reps: 0,                   // repeticiones acertadas consecutivas
  due: 0,                    // timestamp ms de próximo repaso (0 = nuevo, debe estudiarse)
  lastSeen: 0                // último intento (para ordenar vencidos por antigüedad)
}
```

LocalStorage key: `nihongodojo.srs.v2.<level>.<practice>.<id>` o mapa `nihongodojo.srs.v2.<level>` (JSON).
Migración: si existe `seen.<level>` antiguo, convertir `t` → `due = t + 3*86400000`.

## Calidades (botones del usuario)

Después de intentar recordar (active recall) y ver la respuesta, el usuario evalúa:

- **Again (1)** — No me acordaba en absoluto. (interval → 0, reps=0, due = ahora)
- **Hard (3)** — Me costó, tardé >10s o dudé mucho.
- **Good (4)** — Bien, con esfuerzo normal.
- **Easy (5)** — Inmediato, sin dudar.

> En la UI de WexDC, los 4 botones aparecen solo DESPUÉS de revelar. Nunca antes.

## Fórmula SM-2 simplificada

```
function srsNext(state, quality, nowMs) {
  // quality: 1=Again, 3=Hard, 4=Good, 5=Easy
  let {ease, interval, reps} = state;
  if (quality === 1) {
    // Fallo: reseteo suave
    reps = 0;
    interval = 0;                 // vuelve en la misma sesión
    ease = Math.max(1.3, ease - 0.20);
    due = nowMs;                  // inmediato (reaparece mezclado en la cola)
  } else {
    if (reps === 0) {
      interval = 1;               // primer acierto: mañana
    } else if (reps === 1) {
      interval = 3;               // segundo acierto: en 3 días
    } else {
      // reps >=2: aplicar factor
      let factor = quality === 3 ? 1.2 : quality === 4 ? ease : ease * 1.3;
      // Hard usa 1.2 fijo para no castigar; Good usa ease; Easy usa ease*1.3
      interval = Math.round(interval * factor);
    }
    reps += 1;
    // Actualizar facilidad (SM-2 original)
    ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    ease = Math.max(1.3, Math.min(2.8, ease));
    // Límites razonables
    if (quality === 3) interval = Math.max(1, interval);
    if (quality === 4) interval = Math.max(3, interval);
    if (quality === 5) interval = Math.max(4, interval);
    due = nowMs + interval * 86400000;
  }
  return {ease, interval, reps, due, lastSeen: nowMs};
}
```

### Ejemplos deterministas

- Nuevo, acierta Good: `0 días → 1 día → 3 días → 7 días (2.5*3) → 17 días (2.5*7)` …
- Nuevo, acierta Hard dos veces: `0 → 1 → 1*1.2=1 → 1*1.2=1` (lento, porque duda)
- Acierta Easy en racha: `0 → 1 → 3 → 3*2.5*1.3=9 → 9*2.5*1.3=29` …
- Falla tras 30 días: `interval=30, ease=2.5 → ease=2.3, reps=0, due=ahora` (re-empieza)

## Construcción de "Repaso de hoy"

```
function planReviewToday(allItems, now, limit=20) {
  const miss = allItems.filter(i => i.due <= now && i.interval===0 && i.reps===0) // fallados recientes
  const due  = allItems.filter(i => i.due <= now && i.interval>0).sort((a,b)=>a.due-b.due)
  // Prioridad: miss (orden de fallo) → due (más vencido primero)
  // Interleaving: mezclar practices (no 10 words seguidos)
  return interleave(miss.concat(due)).slice(0, limit)
}
```

### Interleaving concreto
- Si la cola tiene 6 words, 4 kanji, 4 grammar, 2 listening → ordenar alternando `words, kanji, grammar, listening, words, kanji…` no por bloques.
- Cada sesión de repaso toca ≥2 practices.

## Límites

- Nunca intervalos inventados ("mostrar mañana porque suena bien") — siempre fórmula.
- Nunca más de 5 ítems nuevos por sesión (los nuevos tienen `interval=0, reps=0, due=0` y entran primero, pero si hay >5, el resto se difiere).
- Nunca más de 2 correcciones por sesión (la 3ª se guarda como `Again` pero no se explica en profundidad hasta mañana).

## Migración desde v1 (planReview antiguo)

- `seen.<level>` con `t` y `ok` → `due = t + 3d`, `ease=2.5`, `interval=3 si ok else 0`, `reps= ok?1:0`
- `miss.<level>.*` → `interval=0, reps=0, due=now` (prioridad miss)

## Tests deterministas

```js
assert.deepEqual(srsNext({ease:2.5, interval:0, reps:0}, Good, t0), {ease:2.5, interval:1, reps:1, due:t0+1d})
assert.deepEqual(srsNext({ease:2.5, interval:1, reps:1}, Good, t0), {ease:2.5, interval:3, reps:2, due:t0+3d})
assert.deepEqual(srsNext({ease:2.5, interval:3, reps:2}, Again, t0), {ease:2.3, interval:0, reps:0, due:t0})
```

Si algún test cambia la fórmula, actualizar este archivo primero.

