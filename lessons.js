/**
 * NihongoDojo — camino del JLPT N5, N4, N3, N2 y N1.
 * Las lecciones viven en n5.js, n4.js, n3.js, n2.js y n1.js. El corte no es una lista oficial.
 */
(function (root) {
    "use strict";

    const PASS_PERCENT = 70;

    let N5 = root.NihongoDojoN5;
    if (!N5 && typeof require !== "undefined") {
        N5 = require("./n5.js");
        root.NihongoDojoN5 = N5;
    }
    if (!N5 || !N5.LESSONS) throw new Error("Falta n5.js");
    N5.LESSONS.forEach(function (lesson) {
        if (!lesson.level) lesson.level = "n5";
    });
    const LESSONS = N5.LESSONS;
    const EXTRA = {};
    function loadLessons(globalName, file, level) {
        let data = root[globalName];
        if (!data && typeof require !== "undefined") {
            try {
                data = require(file);
                root[globalName] = data;
            } catch (e) {
                data = null;
            }
        }
        EXTRA[level] = data && data.LESSONS ? data.LESSONS : [];
    }
    loadLessons("NihongoDojoN4", "./n4.js", "n4");
    loadLessons("NihongoDojoN3", "./n3.js", "n3");
    loadLessons("NihongoDojoN2", "./n2.js", "n2");
    loadLessons("NihongoDojoN1", "./n1.js", "n1");

    const PATH = {};
    function lexiconOf() {
        if (root.NihongoDojoLexicon && root.NihongoDojoLexicon.forLevel) return root.NihongoDojoLexicon;
        if (typeof require !== "undefined") {
            try {
                const api = require("./lexicon.js");
                root.NihongoDojoLexicon = api;
                return api;
            } catch (e) { return null; }
        }
        return null;
    }
    function readingsOf() {
        if (root.NihongoDojoReadings && root.NihongoDojoReadings.questionsFor) return root.NihongoDojoReadings;
        if (typeof require !== "undefined") {
            try {
                const api = require("./readings.js");
                root.NihongoDojoReadings = api;
                return api;
            } catch (e) { return null; }
        }
        return null;
    }
    function chunks(ids, size) {
        const out = [];
        for (let i = 0; i < ids.length; i += size) out.push(ids.slice(i, i + size));
        return out;
    }
    function groupedIds(catalog, groups) {
        const known = {};
        const out = [];
        (groups || []).forEach(function (group) {
            known[group.id] = true;
            const ids = [];
            (catalog || []).forEach(function (item) {
                if (item.group === group.id) ids.push(item.id);
            });
            if (ids.length) out.push({ label: group.label || group.id, ids: ids });
        });
        const orphan = [];
        (catalog || []).forEach(function (item) {
            if (!known[item.group]) orphan.push(item.id);
        });
        if (orphan.length) out.push({ label: "Otros", ids: orphan });
        return out;
    }
    function pushChunks(out, level, kind, stage, prefix, practice, direction, groups, size, blurb) {
        let n = 0;
        groups.forEach(function (group) {
            const parts = chunks(group.ids, size);
            parts.forEach(function (ids, index) {
                n += 1;
                const title = prefix + ": " + group.label + (parts.length > 1 ? " " + (index + 1) : "");
                out.push({
                    id: "l-" + level + "-" + kind + "-" + n,
                    level: level,
                    stage: stage,
                    title: title,
                    minutes: practice === "reading" ? 8 : 6,
                    teach: [{ heading: title, text: blurb }],
                    quiz: { practice: practice, direction: direction, ids: ids }
                });
            });
        });
    }
    function pathExtras(level) {
        const Lex = lexiconOf();
        if (!Lex || !Lex.forLevel) return [];
        const pack = Lex.forLevel(level);
        if (!pack || pack.level !== level || !pack.PHRASES) return [];
        const listen = Lex.DIRECTIONS && Lex.DIRECTIONS.LISTEN_ES ? Lex.DIRECTIONS.LISTEN_ES : "listen-es";
        const phraseEs = Lex.DIRECTIONS && Lex.DIRECTIONS.PHRASE_ES ? Lex.DIRECTIONS.PHRASE_ES : "phrase-es";
        const out = [];
        pushChunks(out, level, "fr", "Frases", "Frases", "phrases", phraseEs,
            groupedIds(pack.PHRASES, pack.PHRASE_GROUPS), 8,
            "Ves la frase y eliges el significado. Lista comunitaria: no es el examen.");
        pushChunks(out, level, "lw", "Escucha", "Escucha", "words", listen,
            groupedIds(pack.WORDS, pack.WORD_GROUPS), 12,
            "No ves la palabra. La voz del sistema la dice y eliges el significado. Si no hay voz japonesa, esta lección no empieza. No se descarga audio.");
        pushChunks(out, level, "lk", "Escucha", "Escucha kanji", "kanji", listen,
            groupedIds(pack.KANJI, pack.KANJI_GROUPS), 10,
            "No ves el kanji. La voz del sistema dice la lectura y eliges el significado. Si no hay voz japonesa, esta lección no empieza.");
        pushChunks(out, level, "lp", "Escucha", "Escucha frases", "phrases", listen,
            groupedIds(pack.PHRASES, pack.PHRASE_GROUPS), 8,
            "No ves la frase. La voz del sistema la dice y eliges el significado. Si no hay voz japonesa, esta lección no empieza.");
        const Readings = readingsOf();
        if (Readings && Readings.questionsFor) {
            const byText = [];
            const index = {};
            Readings.questionsFor(level).forEach(function (question) {
                const key = String(question.id).replace(/-\d+$/, "");
                if (index[key] === undefined) {
                    index[key] = byText.length;
                    byText.push({ label: question.title || ("Texto " + (byText.length + 1)), ids: [] });
                }
                byText[index[key]].ids.push(question.id);
            });
            pushChunks(out, level, "rd", "Lectura", "Lectura", "reading", "lectura", byText, 8,
                "Lees un texto corto y eliges. El japonés y las preguntas son de este dojo. No es el examen.");
        }
        return out;
    }
    function lessonsFor(level) {
        const key = !level ? "n5" : level;
        if (key !== "n5" && key !== "n4" && key !== "n3" && key !== "n2" && key !== "n1") return [];
        if (key !== "n5" && !(EXTRA[key] && EXTRA[key].length)) return [];
        if (PATH[key]) return PATH[key];
        const base = key === "n5" ? LESSONS : EXTRA[key];
        PATH[key] = base.concat(pathExtras(key));
        return PATH[key];
    }
    function attach(level) {
        const files = {
            n4: ["NihongoDojoN4", "./n4.js"],
            n3: ["NihongoDojoN3", "./n3.js"],
            n2: ["NihongoDojoN2", "./n2.js"],
            n1: ["NihongoDojoN1", "./n1.js"]
        };
        const spec = files[level];
        if (!spec) return false;
        loadLessons(spec[0], spec[1], level);
        delete PATH[level];
        return !!(EXTRA[level] && EXTRA[level].length);
    }
    function ready(level) {
        if (!level || level === "n5") return true;
        return !!(EXTRA[level] && EXTRA[level].length);
    }
    function locate(id) {
        const levels = ["n5", "n4", "n3", "n2", "n1"];
        for (let n = 0; n < levels.length; n++) {
            const list = lessonsFor(levels[n]);
            for (let i = 0; i < list.length; i++) {
                if (list[i].id === id) return { lesson: list[i], number: i + 1, level: levels[n] };
            }
        }
        return null;
    }

    function shuffle(list, rng) {
        const rand = rng || Math.random;
        const out = list.slice();
        for (let i = out.length - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            const tmp = out[i];
            out[i] = out[j];
            out[j] = tmp;
        }
        return out;
    }

    function getQuizEngine() {
        if (root.NihongoDojoQuizEngine) return root.NihongoDojoQuizEngine;
        if (root.QuizEngine) return root.QuizEngine;
        if (typeof require !== "undefined") {
            try {
                const qe = require("./quiz_engine.js");
                root.NihongoDojoQuizEngine = qe;
                return qe;
            } catch (e) { return null; }
        }
        return null;
    }
    function buildQueue(lesson, Core, Lex, rng) {
        if (!lesson || !lesson.quiz) return [];
        const quiz = lesson.quiz;
        // Reading stays as before (text-based)
        if (quiz.practice === "reading") {
            const Readings = readingsOf();
            if (!Readings || !Readings.findQuestion) return [];
            const queue = [];
            const ids = quiz.ids || [];
            for (let i = 0; i < ids.length; i++) {
                const question = Readings.findQuestion(ids[i]);
                if (!question || question.level !== (lesson.level || "n5")) return [];
                queue.push({ reading: question, userAnswer: null, result: null, choices: null, exerciseType: "reading" });
            }
            // Varied reading could interleave, but keep at least 20 if possible by shuffling with repeats
            let out = shuffle(queue, rng);
            if (out.length && out.length < 20) {
                const QE = getQuizEngine();
                if (QE && QE.TARGET_COUNT) {
                    const need = QE.TARGET_COUNT - out.length;
                    const extra = [];
                    for (let k = 0; k < need; k++) extra.push(Object.assign({}, out[k % out.length]));
                    out = out.concat(extra);
                    out = QE.shuffle ? QE.shuffle(out, rng) : shuffle(out, rng);
                }
            }
            return out;
        }
        // Try varied engine for all other practices (kana, words, kanji, phrases, conj, grammar)
        const QE = getQuizEngine();
        if (QE && QE.buildVariedQueue) {
            try {
                const varied = QE.buildVariedQueue(lesson, Core, Lex, rng);
                if (varied && varied.length === QE.TARGET_COUNT) return varied;
                if (varied && varied.length >= 10) {
                    // Pad/truncate to TARGET_COUNT if engine returned less (legacy)
                    const target = QE.TARGET_COUNT || 20;
                    let out = varied.slice();
                    while (out.length < target) out = out.concat(varied.slice(0, Math.min(varied.length, target - out.length)));
                    return out.slice(0, target);
                }
            } catch (e) { /* fallback */ }
        }
        // Fallback legacy (ensures 20 by duplication)
        if (quiz.practice === "kana") {
            const queue = [];
            const chars = quiz.chars || [];
            for (let i = 0; i < chars.length; i++) {
                const kana = Core.findKana(quiz.type, chars[i]);
                if (!kana) return [];
                queue.push({ kanaObj: kana, userAnswer: null, result: null, choices: null, exerciseType: "kana" });
            }
            let shuffled = shuffle(queue, rng);
            if (quiz.direction === "romaji-kana") shuffled = Core.ensureChoices(shuffled, rng) || shuffled;
            // pad to 20 duplicating with fresh choices
            const target = QE && QE.TARGET_COUNT ? QE.TARGET_COUNT : 20;
            if (shuffled.length < target) {
                let out = shuffled.slice();
                while (out.length < target) {
                    const dup = shuffle(queue.slice(), rng);
                    const ensured = quiz.direction === "romaji-kana" ? (Core.ensureChoices(dup, rng) || dup) : dup;
                    out = out.concat(ensured.slice(0, target - out.length));
                }
                return out.slice(0, target);
            }
            return shuffled;
        }
        const pack = Lex.forLevel ? Lex.forLevel(lesson.level || "n5") : Lex;
        const source = quiz.practice === "kanji" ? pack.KANJI
            : quiz.practice === "phrases" ? pack.PHRASES
            : quiz.practice === "conj" ? pack.CONJ
            : quiz.practice === "grammar" ? pack.GRAMMAR
            : pack.WORDS;
        const items = [];
        for (let i = 0; i < quiz.ids.length; i++) {
            const found = Lex.findById(source, quiz.ids[i]);
            if (!found) return [];
            items.push(found);
        }
        let queue = shuffle(items, rng).map(function (lex) {
            return { lex: lex, userAnswer: null, result: null, choices: null };
        });
        queue = Lex.ensureChoices(queue, quiz.direction, rng) || queue;
        const target = QE && QE.TARGET_COUNT ? QE.TARGET_COUNT : 20;
        if (queue.length < target) {
            let out = queue.slice();
            while (out.length < target) {
                const dup = shuffle(items.slice(), rng).map(function (lex) {
                    return { lex: lex, userAnswer: null, result: null, choices: null };
                });
                const ensured = Lex.ensureChoices(dup, quiz.direction, rng) || dup;
                out = out.concat(ensured.slice(0, target - out.length));
            }
            return out.slice(0, target);
        }
        return queue.slice(0, target);
    }

    function validate(Core, Lex) {
        const errors = [];
        const ids = new Set();
        const allLevels = ["n5", "n4", "n3", "n2", "n1"];
        const QE = (typeof getQuizEngine === "function" ? getQuizEngine() : null);
        const target = QE && QE.TARGET_COUNT ? QE.TARGET_COUNT : 20;
        function checkList(list, level) {
            list.forEach(function (lesson) {
                if (ids.has(lesson.id)) errors.push("id repetido " + lesson.id);
                ids.add(lesson.id);
                if (!lesson.teach || !lesson.teach.length) errors.push(lesson.id + " sin explicación");
                // WexDC 2.0: solo las lecciones ricas (secciones) requieren 400+ palabras; legacy queda exento
                if (lesson.secciones || lesson.sections) {
                    const teachWords = (lesson.teach || []).reduce(function (acc, b) { return acc + (b.text ? String(b.text).split(/\s+/).length : 0); }, 0);
                    const altWords = (lesson.secciones || lesson.sections || []).reduce(function (acc, s) { return acc + ((s.texto || s.text || '').split(/\s+/).length); }, 0);
                    const words = Math.max(teachWords, altWords);
                    if (words && words < 400) errors.push(lesson.id + " explicación corta " + words);
                }
                const queue = buildQueue(lesson, Core, Lex, function () { return 0.1; });
                // WexDC spec: 20 varied questions per lesson (reading keeps its own count, but ideally 20 too)
                let expected = target;
                if (lesson.quiz.practice === "reading" && lesson.quiz.ids && lesson.quiz.ids.length < target) expected = lesson.quiz.ids.length;
                if (queue.length !== expected && !(lesson.quiz.practice === "reading" && queue.length >= lesson.quiz.ids.length)) {
                    // Allow reading to be less if not enough questions, but other practices must be 20
                    if (lesson.quiz.practice !== "reading" && queue.length !== target) errors.push(lesson.id + " cola " + queue.length + "/" + target);
                }
            });
        }
        checkList(LESSONS, "n5");
        allLevels.forEach(function (lv) {
            if (lv === "n5") return;
            if (EXTRA[lv] && EXTRA[lv].length) checkList(EXTRA[lv], lv);
        });
        return errors;
    }

    function nextLesson(progress, level) {
        const list = lessonsFor(level);
        const done = progress || {};
        for (let i = 0; i < list.length; i++) {
            if (!done[list[i].id] || !done[list[i].id].passed) return list[i];
        }
        return list[0] || null;
    }

    function passedCount(progress, level) {
        const list = lessonsFor(level);
        const done = progress || {};
        let n = 0;
        list.forEach(function (lesson) {
            if (done[lesson.id] && done[lesson.id].passed) n++;
        });
        return n;
    }

    const api = {
        PASS_PERCENT,
        LESSONS,
        lessonsFor,
        attach,
        ready,
        findLesson: function (id) {
            const found = locate(id);
            return found ? found.lesson : null;
        },
        locate,
        buildQueue,
        validate,
        nextLesson,
        passedCount
    };

    root.NihongoDojoLessons = api;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }
})(typeof window !== "undefined" ? window : globalThis);
