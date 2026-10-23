/**
 * NihongoDojo — camino del JLPT N5, N4, N3 y N2.
 * Las lecciones viven en n5.js, n4.js, n3.js y n2.js. El corte no es una lista oficial.
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

    function lessonsFor(level) {
        if (EXTRA[level]) return EXTRA[level];
        return LESSONS;
    }
    function findLesson(id) {
        const lists = [LESSONS, EXTRA.n4 || [], EXTRA.n3 || [], EXTRA.n2 || []];
        for (let n = 0; n < lists.length; n++) {
            for (let i = 0; i < lists[n].length; i++) {
                if (lists[n][i].id === id) return lists[n][i];
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

    const api = {
        PASS_PERCENT,
        LESSONS,
        lessonsFor,
        findLesson,
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
