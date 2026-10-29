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

    function buildQueue(lesson, Core, Lex, rng) {
        if (!lesson || !lesson.quiz) return [];
        const quiz = lesson.quiz;
        if (quiz.practice === "reading") {
            const Readings = readingsOf();
            if (!Readings || !Readings.findQuestion) return [];
            const queue = [];
            const ids = quiz.ids || [];
            for (let i = 0; i < ids.length; i++) {
                const question = Readings.findQuestion(ids[i]);
                if (!question || question.level !== (lesson.level || "n5")) return [];
                queue.push({ reading: question, userAnswer: null, result: null, choices: null });
            }
            return shuffle(queue, rng);
        }
        if (quiz.practice === "kana") {
            const queue = [];
            const chars = quiz.chars || [];
            for (let i = 0; i < chars.length; i++) {
                const kana = Core.findKana(quiz.type, chars[i]);
                if (!kana) return [];
                queue.push({ kanaObj: kana, userAnswer: null, result: null, choices: null });
            }
            const shuffled = shuffle(queue, rng);
            if (quiz.direction === "romaji-kana") Core.ensureChoices(shuffled, rng);
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
        const queue = shuffle(items, rng).map(function (lex) {
            return { lex: lex, userAnswer: null, result: null, choices: null };
        });
        return Lex.ensureChoices(queue, quiz.direction, rng);
    }

    function validate(Core, Lex) {
        const errors = [];
        const ids = new Set();
        LESSONS.forEach(function (lesson) {
            if (ids.has(lesson.id)) errors.push("id repetido " + lesson.id);
            ids.add(lesson.id);
            if (!lesson.teach || !lesson.teach.length) errors.push(lesson.id + " sin explicación");
            const queue = buildQueue(lesson, Core, Lex, function () { return 0.1; });
            const expected = lesson.quiz.practice === "kana" ? lesson.quiz.chars.length : lesson.quiz.ids.length;
            if (queue.length !== expected) errors.push(lesson.id + " cola " + queue.length + "/" + expected);
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

    // --- Camino IMABI (https://imabi.org) — SEPARADO de JLPT, archivo propio ---
    function imabiDataLessons() {
        if (root.NihongoDojoImabiData && root.NihongoDojoImabiData.LESSONS) return root.NihongoDojoImabiData.LESSONS;
        if (typeof require !== "undefined") {
            try { var d = require("./imabi-data.js"); if (d && d.LESSONS) return d.LESSONS; } catch(e){}
        }
        return [];
    }
    function locateImabi(id) {
        var jlpt = locate(id);
        if (jlpt) return jlpt;
        var list = imabiDataLessons();
        for (var i = 0; i < list.length; i++) if (list[i].id === id) return { lesson: list[i], number: i + 1, level: 'imabi' };
        return null;
    }
    function imabiLevelIds(imabiLevel) {
        var Imabi = root.NihongoDojoImabi;
        if (!Imabi) return [];
        if (Imabi.idsForLevel) return Imabi.idsForLevel(imabiLevel);
        if (Imabi.orderedIds) return Imabi.orderedIds();
        return [];
    }
    function lessonsForImabi(imabiLevel) {
        var ids = imabiLevelIds(imabiLevel);
        if (!ids.length) return [];
        var out = [];
        var seen = {};
        ids.forEach(function(id){
            if (seen[id]) return;
            seen[id] = true;
            var found = locateImabi(id);
            if (found && found.lesson) out.push(found.lesson);
        });
        return out;
    }
    function imabiStatsForLevel(levelKey) {
        var Imabi = root.NihongoDojoImabi;
        if (!Imabi) return { total: 0, mapped: 0, pending: 0 };
        if (Imabi.entriesForLevel) {
            var entries = Imabi.entriesForLevel(levelKey);
            var total = entries.length;
            var mapped = 0;
            for (var i = 0; i < entries.length; i++) {
                var e = entries[i];
                if (e.ids && e.ids.length) {
                    // al menos un id resuelve a lección real
                    var ok = false;
                    for (var j = 0; j < e.ids.length; j++) if (locateImabi(e.ids[j])) { ok = true; break; }
                    if (ok) mapped++;
                }
            }
            return { total: total, mapped: mapped, pending: total - mapped };
        }
        return Imabi.stats ? Imabi.stats() : { total: 0, mapped: 0, pending: 0 };
    }
    function imabiStats() {
        var Imabi = root.NihongoDojoImabi;
        return Imabi && Imabi.stats ? Imabi.stats() : { total: 0, mapped: 0, pending: 0 };
    }
    function findLessonAny(id) {
        var f = locate(id);
        if (f) return f.lesson;
        var g = locateImabi(id);
        return g ? g.lesson : null;
    }

    const api = {
        PASS_PERCENT,
        LESSONS,
        lessonsFor,
        lessonsForImabi,
        imabiLevelIds,
        imabiStats,
        imabiStatsForLevel,
        locateImabi,
        findLessonAny,
        attach,
        ready,
        findLesson: function (id) {
            const found = locate(id);
            if (found) return found.lesson;
            var alt = locateImabi(id);
            return alt ? alt.lesson : null;
        },
        locate,
        locateAny: function(id){ var a=locate(id); if(a) return a; return locateImabi(id); },
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
