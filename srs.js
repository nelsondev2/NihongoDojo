/* NihongoDojo — srs.js
 * SM-2 simplificado determinista para webxdc offline.
 * 100% puro, sin DOM, sin fetch, testeable.
 * Ver docs/ALGORITMO_SRS.md para la fórmula canónica.
 */
(function (root) {
    'use strict';

    const DAY_MS = 86400000;

    // Calidad: Again=1, Hard=3, Good=4, Easy=5
    const Q = { AGAIN: 1, HARD: 3, GOOD: 4, EASY: 5 };
    const EASE_INIT = 2.5;
    const EASE_MIN = 1.3;
    const EASE_MAX = 2.8;

    function clampEase(e) {
        if (e < EASE_MIN) return EASE_MIN;
        if (e > EASE_MAX) return EASE_MAX;
        return e;
    }

    function srsInit() {
        return { ease: EASE_INIT, interval: 0, reps: 0, due: 0, lastSeen: 0 };
    }

    // Estado: {ease, interval, reps, due, lastSeen}
    // nowMs: timestamp ms (Date.now())
    // quality: 1|3|4|5
    function srsNext(state, quality, nowMs) {
        const now = typeof nowMs === 'number' && isFinite(nowMs) ? nowMs : Date.now();
        let ease = typeof state.ease === 'number' && isFinite(state.ease) ? state.ease : EASE_INIT;
        let interval = typeof state.interval === 'number' && isFinite(state.interval) && state.interval >= 0 ? Math.floor(state.interval) : 0;
        let reps = typeof state.reps === 'number' && isFinite(state.reps) && state.reps >= 0 ? Math.floor(state.reps) : 0;
        ease = clampEase(ease);

        if (quality === Q.AGAIN) {
            reps = 0;
            interval = 0;
            ease = clampEase(ease - 0.20);
            return { ease: ease, interval: 0, reps: 0, due: now, lastSeen: now };
        }

        if (reps === 0) {
            interval = 1;
        } else if (reps === 1) {
            interval = 3;
        } else {
            let factor;
            if (quality === Q.HARD) factor = 1.2;
            else if (quality === Q.GOOD) factor = ease;
            else factor = ease * 1.3; // EASY
            interval = Math.round(interval * factor);
        }
        reps += 1;
        // SM-2 ease update
        ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        ease = clampEase(ease);
        if (quality === Q.HARD) interval = Math.max(1, interval);
        if (quality === Q.GOOD) interval = Math.max(3, interval);
        if (quality === Q.EASY) interval = Math.max(4, interval);
        // Cap razonable: 180 días
        if (interval > 180) interval = 180;
        const due = now + interval * DAY_MS;
        return { ease: ease, interval: interval, reps: reps, due: due, lastSeen: now };
    }

    // Migración desde seen.* antiguo: { t, ok }
    function fromLegacySeen(t, ok) {
        const now = typeof t === 'number' ? t : Date.now();
        if (ok) {
            return { ease: EASE_INIT, interval: 3, reps: 1, due: now + 3 * DAY_MS, lastSeen: now };
        } else {
            return { ease: EASE_INIT, interval: 0, reps: 0, due: now, lastSeen: now };
        }
    }

    // Planifica repaso de hoy interleaved, determinista
    function planReviewV2(allItems, now, opts) {
        const limit = opts && opts.limit > 0 ? Math.floor(opts.limit) : 20;
        if (!Array.isArray(allItems) || !allItems.length) return [];
        const n = typeof now === 'number' ? now : Date.now();
        const due = [];
        const fresh = [];
        allItems.forEach(function (it) {
            if (!it || typeof it.id !== 'string' || typeof it.practice !== 'string') return;
            if (typeof it.due !== 'number' || it.due > n) return; // aún no vence
            if (it.interval === 0 && it.reps === 0) fresh.push(it);
            else due.push(it);
        });
        // fresh: prioridad Again (más reciente primero? usamos due asc)
        fresh.sort(function (a,b){ return a.due - b.due; });
        due.sort(function (a,b){ return a.due - b.due; });
        const ordered = fresh.concat(due);
        // Interleaving: alternar practices
        const byPractice = {};
        ordered.forEach(function (it){ (byPractice[it.practice] = byPractice[it.practice] || []).push(it); });
        const practices = Object.keys(byPractice);
        const out = [];
        const used = new Set();
        let more = true;
        while (more && out.length < limit) {
            more = false;
            practices.forEach(function (pr){
                const lst = byPractice[pr];
                if (!lst.length || out.length >= limit) return;
                // evita duplicados
                const cand = lst.shift();
                const key = pr + '\n' + cand.id;
                if (used.has(key)) return;
                used.add(key);
                out.push({ id: cand.id, practice: pr, reason: cand.interval===0 ? 'miss' : 'due', due: cand.due });
                more = true;
            });
        }
        // Si quedan y aún no llenamos limit, completar en orden original
        if (out.length < limit) {
            ordered.forEach(function (it){
                if (out.length >= limit) return;
                const key = it.practice + '\n' + it.id;
                if (used.has(key)) return;
                used.add(key);
                out.push({ id: it.id, practice: it.practice, reason: it.interval===0 ? 'miss' : 'due', due: it.due });
            });
        }
        return out.slice(0, limit);
    }

    const api = { DAY_MS: DAY_MS, Q: Q, EASE_INIT: EASE_INIT, EASE_MIN: EASE_MIN, EASE_MAX: EASE_MAX, srsInit: srsInit, srsNext: srsNext, fromLegacySeen: fromLegacySeen, planReviewV2: planReviewV2 };
    root.NihongoDojoSRS = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
