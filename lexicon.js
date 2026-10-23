/**
 * NihongoDojo — léxico del JLPT N5.
 * Sin red: la lista vive en n5.js. El JLPT no publica lista oficial
 * desde 2010; el recorte es el N5 comunitario, no el examen.
 */
(function (root) {
    "use strict";

    const PRACTICES = { WORDS: "words", KANJI: "kanji", PHRASES: "phrases", CONJ: "conj", GRAMMAR: "grammar" };
    const DIRECTIONS = {
        WORD_ES: "word-es",
        ES_WORD: "es-word",
        KANJI_ES: "kanji-es",
        ES_KANJI: "es-kanji",
        KANJI_READING: "kanji-reading",
        PHRASE_ES: "phrase-es",
        ES_PHRASE: "es-phrase",
        PARTICLE: "particle",
        CONJ_ES: "conj-es",
        ES_CONJ: "es-conj",
        GRAMMAR_ES: "grammar-es",
        ES_GRAMMAR: "es-grammar",
        GRAMMAR_BLANK: "grammar-blank"
    };

    let N5 = root.NihongoDojoN5;
    if (!N5 && typeof require !== "undefined") {
        N5 = require("./n5.js");
        root.NihongoDojoN5 = N5;
    }
    if (!N5 || !N5.WORD_ROWS) {
        throw new Error("Falta n5.js");
    }

    const WORD_GROUPS = N5.WORD_GROUPS;
    const KANJI_GROUPS = N5.KANJI_GROUPS;
    const WORD_STARTER = N5.WORD_STARTER;
    const KANJI_STARTER = N5.KANJI_STARTER;
    const PHRASE_GROUPS = N5.PHRASE_GROUPS;
    const PHRASE_STARTER = N5.PHRASE_STARTER;
    const GRAMMAR_GROUPS = N5.GRAMMAR_GROUPS;
    const GRAMMAR_STARTER = N5.GRAMMAR_STARTER;
    const WORD_ROWS = N5.WORD_ROWS;
    const KANJI_ROWS = N5.KANJI_ROWS;
    const PHRASE_ROWS = N5.PHRASE_ROWS;

    function wordFromRow(row) {
        const speak = row[0] === "w-wa" ? "わ" : (row[0] === "w-wo" ? "お" : (row[0] === "w-e" ? "え" : row[1]));
        return {
            id: row[0],
            kana: row[1],
            kanji: row[2],
            romaji: row[3],
            es: row[4],
            group: row[5],
            note: row[6] || "",
            speak: speak
        };
    }
    function kanjiFromRow(row) {
        return {
            id: row[0],
            char: row[1],
            es: row[2],
            reading: row[3],
            group: row[4],
            also: row[5] || "",
            speak: row[3]
        };
    }

    function phraseFromRow(row) {
        const particle = row[5] || "";
        const jp = row[1];
        let blank = "";
        if (particle) {
            const at = jp.indexOf(particle);
            if (at < 0) throw new Error("falta la partícula en " + row[0]);
            blank = jp.slice(0, at) + "＿" + jp.slice(at + particle.length);
        }
        return {
            id: row[0],
            jp: jp,
            kana: row[2],
            es: row[3],
            group: row[4],
            particle: particle,
            blank: blank,
            note: row[6] || "",
            speak: row[2]
        };
    }

    function conjFromVerb(verb) {
        const rows = [
            [verb.id + "-dict", verb.dict, verb.dictKana, verb.gloss, verb.id, "diccionario", "Forma de diccionario de " + verb.label + "."],
            [verb.id + "-masu", verb.stem + "ます", verb.stemKana + "ます", verb.polite, verb.id, "ます", "Presente o futuro cortés de " + verb.label + "."],
            [verb.id + "-masen", verb.stem + "ません", verb.stemKana + "ません", verb.negative, verb.id, "ません", "Negación cortés de " + verb.label + "."],
            [verb.id + "-mashita", verb.stem + "ました", verb.stemKana + "ました", verb.past, verb.id, "ました", "Pasado cortés de " + verb.label + "."],
            [verb.id + "-te", verb.te, verb.teKana, "forma て de " + verb.gloss, verb.id, "て", verb.teNote]
        ];
        if (verb.stem) {
            rows.push([verb.id + "-masendeshita", verb.stem + "ませんでした", verb.stemKana + "ませんでした", "no " + verb.gloss + ", pasado cortés", verb.id, "ませんでした", "Pasado negativo cortés de " + verb.label + "."]);
        }
        if (verb.nai) rows.push([verb.id + "-nai", verb.nai, verb.naiKana, verb.plainNeg, verb.id, "ない", "Negación plana de " + verb.label + "."]);
        if (verb.ta) rows.push([verb.id + "-ta", verb.ta, verb.taKana, verb.plainPast, verb.id, "た", "Pasado plano de " + verb.label + "."]);
        if (verb.tai) rows.push([verb.id + "-tai", verb.tai, verb.taiKana, verb.want, verb.id, "たい", "Querer hacer " + verb.label + ". Se conjuga como adjetivo い."]);
        if (verb.potential) rows.push([verb.id + "-potential", verb.potential, verb.potentialKana, "puedo " + verb.gloss, verb.id, "potencial", "Potencial de " + verb.label + "."]);
        if (verb.volitional) rows.push([verb.id + "-volitional", verb.volitional, verb.volitionalKana, "forma おう de " + verb.gloss, verb.id, "おう", "Volitivo de " + verb.label + "."]);
        if (verb.tara) rows.push([verb.id + "-tara", verb.tara, verb.taraKana, "si " + verb.gloss, verb.id, "たら", "Condicional たら de " + verb.label + "."]);
        if (verb.ba) rows.push([verb.id + "-ba", verb.ba, verb.baKana, "si " + verb.gloss + ", con ば", verb.id, "ば", "Condicional ば de " + verb.label + "."]);
        if (verb.passive) rows.push([verb.id + "-passive", verb.passive, verb.passiveKana, "pasiva de " + verb.gloss, verb.id, "pasiva", "Pasiva de " + verb.label + "."]);
        if (verb.causative) rows.push([verb.id + "-causative", verb.causative, verb.causativeKana, "hago que " + verb.gloss, verb.id, "causativa", "Causativa de " + verb.label + "."]);
        if (verb.zu) rows.push([verb.id + "-zu", verb.zu, verb.zuKana, "forma ず de " + verb.gloss, verb.id, "ず", "Negación ず de " + verb.label + ". Delante de に, es ずに."]);
        if (verb.mai) rows.push([verb.id + "-mai", verb.mai, verb.maiKana, "no ha de " + verb.gloss, verb.id, "まい", "Negación volitiva, o suposición negativa, de " + verb.label + "."]);
        return rows.map(function (row) {
            return {
                id: row[0],
                jp: row[1],
                kana: row[2],
                es: row[3],
                group: row[4],
                form: row[5],
                note: row[6],
                speak: row[2]
            };
        });
    }

    const CONJ_VERBS = N5.CONJ_VERBS;
    const CONJ_GROUPS = CONJ_VERBS.map(function (verb) { return { id: verb.id, label: verb.label }; });
    const CONJ_STARTER = N5.CONJ_STARTER;

    const WORDS = WORD_ROWS.map(wordFromRow);
    const KANJI = KANJI_ROWS.map(kanjiFromRow);
    const PHRASES = PHRASE_ROWS.map(phraseFromRow);
    const GRAMMAR = N5.GRAMMAR;
    const CONJ = CONJ_VERBS.reduce(function (acc, verb) { return acc.concat(conjFromVerb(verb)); }, []);

    function tagLevel(list, level) {
        for (let i = 0; i < list.length; i++) list[i].level = level;
        return list;
    }
    tagLevel(WORDS, "n5");
    tagLevel(KANJI, "n5");
    tagLevel(PHRASES, "n5");
    tagLevel(GRAMMAR, "n5");
    tagLevel(CONJ, "n5");

    const BUNDLES = {
        n5: {
            level: "n5",
            WORD_GROUPS: WORD_GROUPS, KANJI_GROUPS: KANJI_GROUPS, PHRASE_GROUPS: PHRASE_GROUPS,
            GRAMMAR_GROUPS: GRAMMAR_GROUPS, CONJ_GROUPS: CONJ_GROUPS,
            WORD_STARTER: WORD_STARTER, KANJI_STARTER: KANJI_STARTER, PHRASE_STARTER: PHRASE_STARTER,
            GRAMMAR_STARTER: GRAMMAR_STARTER, CONJ_STARTER: CONJ_STARTER,
            WORDS: WORDS, KANJI: KANJI, PHRASES: PHRASES, GRAMMAR: GRAMMAR, CONJ: CONJ
        }
    };
    function loadBundle(globalName, file, level) {
        let data = root[globalName];
        if (!data && typeof require !== "undefined") {
            try {
                data = require(file);
                root[globalName] = data;
            } catch (e) {
                data = null;
            }
        }
        if (!data || !data.WORD_ROWS) return;
        const verbs = data.CONJ_VERBS || [];
        BUNDLES[level] = {
            level: level,
            WORD_GROUPS: data.WORD_GROUPS, KANJI_GROUPS: data.KANJI_GROUPS, PHRASE_GROUPS: data.PHRASE_GROUPS,
            GRAMMAR_GROUPS: data.GRAMMAR_GROUPS,
            CONJ_GROUPS: verbs.map(function (verb) { return { id: verb.id, label: verb.label }; }),
            WORD_STARTER: data.WORD_STARTER, KANJI_STARTER: data.KANJI_STARTER, PHRASE_STARTER: data.PHRASE_STARTER,
            GRAMMAR_STARTER: data.GRAMMAR_STARTER, CONJ_STARTER: data.CONJ_STARTER,
            WORDS: tagLevel(data.WORD_ROWS.map(wordFromRow), level),
            KANJI: tagLevel(data.KANJI_ROWS.map(kanjiFromRow), level),
            PHRASES: tagLevel(data.PHRASE_ROWS.map(phraseFromRow), level),
            GRAMMAR: tagLevel(data.GRAMMAR, level),
            CONJ: tagLevel(verbs.reduce(function (acc, verb) { return acc.concat(conjFromVerb(verb)); }, []), level)
        };
    }
    loadBundle("NihongoDojoN4", "./n4.js", "n4");
    loadBundle("NihongoDojoN3", "./n3.js", "n3");
    loadBundle("NihongoDojoN2", "./n2.js", "n2");
    function bundleFor(level) {
        return BUNDLES[level] || BUNDLES.n5;
    }

    function isGrammar(item) {
        return !!(item && item.kind === "grammar");
    }
    function isKanji(item) {
        return !!(item && item.char && !item.kana && !isGrammar(item));
    }
    function isPhrase(item) {
        return !!(item && item.jp && item.blank !== undefined && !item.form && !isGrammar(item));
    }
    function isConj(item) {
        return !!(item && item.form && !isGrammar(item));
    }
    function catalogFor(practice, level) {
        const b = bundleFor(level);
        if (practice === PRACTICES.KANJI) return b.KANJI;
        if (practice === PRACTICES.PHRASES) return b.PHRASES;
        if (practice === PRACTICES.CONJ) return b.CONJ;
        if (practice === PRACTICES.GRAMMAR) return b.GRAMMAR;
        return b.WORDS;
    }
    function catalogOf(item) {
        const b = bundleFor(item && item.level);
        if (isGrammar(item)) return b.GRAMMAR;
        if (isKanji(item)) return b.KANJI;
        if (isConj(item)) return b.CONJ;
        if (isPhrase(item)) return b.PHRASES;
        return b.WORDS;
    }
    function findById(catalog, id) {
        for (let i = 0; i < catalog.length; i++) {
            if (catalog[i].id === id) return catalog[i];
        }
        return null;
    }
    function groupsOf(practice) {
        if (practice === PRACTICES.KANJI) return KANJI_GROUPS;
        if (practice === PRACTICES.PHRASES) return PHRASE_GROUPS;
        if (practice === PRACTICES.CONJ) return CONJ_GROUPS;
        if (practice === PRACTICES.GRAMMAR) return GRAMMAR_GROUPS;
        return WORD_GROUPS;
    }
    function starterOf(practice) {
        if (practice === PRACTICES.KANJI) return KANJI_STARTER;
        if (practice === PRACTICES.PHRASES) return PHRASE_STARTER;
        if (practice === PRACTICES.CONJ) return CONJ_STARTER;
        if (practice === PRACTICES.GRAMMAR) return GRAMMAR_STARTER;
        return WORD_STARTER;
    }
    function countInGroup(practice, groupId) {
        const catalog = catalogFor(practice);
        let n = 0;
        for (let i = 0; i < catalog.length; i++) {
            if (catalog[i].group === groupId) n++;
        }
        return n;
    }
    function validDirection(practice, direction) {
        if (practice === PRACTICES.KANJI) {
            return direction === DIRECTIONS.KANJI_ES || direction === DIRECTIONS.ES_KANJI || direction === DIRECTIONS.KANJI_READING;
        }
        if (practice === PRACTICES.WORDS) {
            return direction === DIRECTIONS.WORD_ES || direction === DIRECTIONS.ES_WORD;
        }
        if (practice === PRACTICES.PHRASES) {
            return direction === DIRECTIONS.PHRASE_ES || direction === DIRECTIONS.ES_PHRASE || direction === DIRECTIONS.PARTICLE;
        }
        if (practice === PRACTICES.CONJ) {
            return direction === DIRECTIONS.CONJ_ES || direction === DIRECTIONS.ES_CONJ;
        }
        if (practice === PRACTICES.GRAMMAR) {
            return direction === DIRECTIONS.GRAMMAR_ES || direction === DIRECTIONS.ES_GRAMMAR || direction === DIRECTIONS.GRAMMAR_BLANK;
        }
        return false;
    }
    function directionLabel(direction) {
        if (direction === DIRECTIONS.WORD_ES) return "palabra → español";
        if (direction === DIRECTIONS.ES_WORD) return "español → palabra";
        if (direction === DIRECTIONS.KANJI_ES) return "kanji → significado";
        if (direction === DIRECTIONS.ES_KANJI) return "significado → kanji";
        if (direction === DIRECTIONS.KANJI_READING) return "kanji → lectura";
        if (direction === DIRECTIONS.PHRASE_ES) return "frase → español";
        if (direction === DIRECTIONS.ES_PHRASE) return "español → frase";
        if (direction === DIRECTIONS.PARTICLE) return "partícula";
        if (direction === DIRECTIONS.CONJ_ES) return "forma → español";
        if (direction === DIRECTIONS.ES_CONJ) return "español → forma";
        if (direction === DIRECTIONS.GRAMMAR_ES) return "patrón → español";
        if (direction === DIRECTIONS.ES_GRAMMAR) return "español → patrón";
        if (direction === DIRECTIONS.GRAMMAR_BLANK) return "hueco";
        return "kana → romaji";
    }

    function view(item, direction) {
        if (isGrammar(item)) return grammarView(item, direction);
        if (isKanji(item)) return kanjiView(item, direction);
        if (isConj(item)) return conjView(item, direction);
        if (isPhrase(item)) return phraseView(item, direction);
        return wordView(item, direction);
    }
    function grammarView(item, direction) {
        if (direction === DIRECTIONS.GRAMMAR_BLANK && item.cloze) {
            return {
                prompt: item.cloze,
                promptLang: "ja",
                furigana: item.clozeKana || "",
                answer: item.piece,
                speak: item.speak,
                speakOnShow: false,
                note: item.es,
                settledNote: item.note,
                choiceText: item.piece,
                choiceSub: "",
                choiceLang: "ja"
            };
        }
        if (direction === DIRECTIONS.ES_GRAMMAR) {
            return {
                prompt: item.es,
                promptLang: "es",
                furigana: "",
                answer: item.pattern,
                speak: item.speak,
                speakOnShow: false,
                note: "",
                settledNote: item.note,
                choiceText: item.pattern,
                choiceSub: "",
                choiceLang: "ja"
            };
        }
        return {
            prompt: item.pattern,
            promptLang: "ja",
            furigana: item.kana || "",
            answer: item.es,
            speak: item.speak,
            speakOnShow: true,
            note: "",
            settledNote: item.note,
            choiceText: item.es,
            choiceSub: "",
            choiceLang: "es"
        };
    }
    function conjView(item, direction) {
        if (direction === DIRECTIONS.ES_CONJ) {
            return {
                prompt: item.es,
                promptLang: "es",
                furigana: "",
                answer: item.jp + "（" + item.kana + "）",
                speak: item.speak,
                speakOnShow: false,
                note: "",
                settledNote: item.note,
                choiceText: item.jp,
                choiceSub: item.kana,
                choiceLang: "ja"
            };
        }
        return {
            prompt: item.jp,
            promptLang: "ja",
            furigana: item.kana,
            answer: item.es,
            speak: item.speak,
            speakOnShow: true,
            note: "",
            settledNote: item.note,
            choiceText: item.es,
            choiceSub: "",
            choiceLang: "es"
        };
    }
    function phraseView(item, direction) {
        if (direction === DIRECTIONS.PARTICLE) {
            return {
                prompt: item.blank || item.jp,
                promptLang: "ja",
                furigana: "",
                answer: item.particle + " · " + item.jp,
                speak: item.speak,
                speakOnShow: false,
                note: item.es,
                settledNote: item.note,
                choiceText: item.particle,
                choiceSub: "",
                choiceLang: "ja"
            };
        }
        if (direction === DIRECTIONS.ES_PHRASE) {
            return {
                prompt: item.es,
                promptLang: "es",
                furigana: "",
                answer: item.jp + "（" + item.kana + "）",
                speak: item.speak,
                speakOnShow: false,
                note: "",
                settledNote: item.note,
                choiceText: item.jp,
                choiceSub: item.kana,
                choiceLang: "ja"
            };
        }
        return {
            prompt: item.jp,
            promptLang: "ja",
            furigana: item.kana,
            answer: item.es,
            speak: item.speak,
            speakOnShow: true,
            note: "",
            settledNote: item.note,
            choiceText: item.es,
            choiceSub: "",
            choiceLang: "es"
        };
    }
    function wordView(word, direction) {
        const jp = word.kanji || word.kana;
        const furigana = word.kanji ? word.kana : "";
        if (direction === DIRECTIONS.ES_WORD) {
            return {
                prompt: word.es,
                promptLang: "es",
                furigana: "",
                answer: furigana ? jp + "（" + furigana + "）" : jp,
                speak: word.speak,
                speakOnShow: false,
                note: "",
                settledNote: word.note,
                choiceText: jp,
                choiceSub: furigana,
                choiceLang: "ja"
            };
        }
        return {
            prompt: jp,
            promptLang: "ja",
            furigana: furigana,
            answer: word.es,
            speak: word.speak,
            speakOnShow: true,
            note: word.note,
            settledNote: "",
            choiceText: word.es,
            choiceSub: "",
            choiceLang: "es"
        };
    }
    function kanjiView(kanji, direction) {
        if (direction === DIRECTIONS.ES_KANJI) {
            return {
                prompt: kanji.es,
                promptLang: "es",
                furigana: "",
                answer: kanji.char + "（" + kanji.reading + "）",
                speak: kanji.speak,
                speakOnShow: false,
                note: "",
                settledNote: kanji.also,
                choiceText: kanji.char,
                choiceSub: "",
                choiceLang: "ja"
            };
        }
        if (direction === DIRECTIONS.KANJI_READING) {
            return {
                prompt: kanji.char,
                promptLang: "ja",
                furigana: "",
                answer: kanji.reading,
                speak: kanji.speak,
                speakOnShow: false,
                note: "",
                settledNote: kanji.also,
                choiceText: kanji.reading,
                choiceSub: "",
                choiceLang: "ja"
            };
        }
        return {
            prompt: kanji.char,
            promptLang: "ja",
            furigana: "",
            answer: kanji.es,
            speak: kanji.speak,
            speakOnShow: true,
            note: kanji.also,
            settledNote: "",
            choiceText: kanji.es,
            choiceSub: "",
            choiceLang: "es"
        };
    }
    function choiceText(item, direction) {
        return view(item, direction).choiceText;
    }

    function shuffle(list, rng) {
        const random = typeof rng === "function" ? rng : Math.random;
        const arr = list.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    // El acierto va incluido. Un distractor no puede tener el mismo
    // texto: 日 y 火 se leen ひ, así que no se hacen trampas mutuas.
    function buildChoices(target, direction, rng, count) {
        const wanted = count === undefined ? 4 : count;
        const catalog = catalogOf(target);
        const targetLabel = choiceText(target, direction);
        const same = [];
        const rest = [];
        const seen = new Set([target.id]);
        const usedLabels = new Set([targetLabel]);
        for (let i = 0; i < catalog.length; i++) {
            const item = catalog[i];
            if (!item || seen.has(item.id)) continue;
            if (direction === DIRECTIONS.PARTICLE && !item.particle) continue;
            if (direction === DIRECTIONS.GRAMMAR_BLANK && !item.cloze) continue;
            const label = choiceText(item, direction);
            if (!label || usedLabels.has(label)) continue;
            seen.add(item.id);
            usedLabels.add(label);
            if (item.group === target.group) same.push(item);
            else rest.push(item);
        }
        const ranked = shuffle(same, rng).concat(shuffle(rest, rng));
        const picked = ranked.slice(0, Math.max(0, wanted - 1));
        return shuffle([target].concat(picked), rng);
    }

    function ensureChoices(queue, direction, rng) {
        queue.forEach(function (item) {
            const label = choiceText(item.lex, direction);
            const labels = new Set();
            const usable = item.choices && item.choices.some(function (c) { return c.id === item.lex.id; })
                && item.choices.every(function (c) {
                    const text = choiceText(c, direction);
                    if (!text || labels.has(text)) return false;
                    labels.add(text);
                    return c.id === item.lex.id || text !== label;
                });
            if (!usable) item.choices = buildChoices(item.lex, direction, rng);
        });
        return queue;
    }

    function checkChoice(target, chosenId) {
        if (typeof chosenId !== "string" || !chosenId) {
            return { user: "", expected: target.id, correct: false, empty: true, skipped: false };
        }
        return {
            user: chosenId,
            expected: target.id,
            correct: chosenId === target.id,
            empty: false,
            skipped: false
        };
    }

    function filterByGroups(practice, groupIds, direction) {
        const catalog = catalogFor(practice);
        const wanted = new Set(groupIds || []);
        return catalog.filter(function (item) {
            if (!wanted.has(item.group)) return false;
            if (direction === DIRECTIONS.PARTICLE && !item.particle) return false;
            if (direction === DIRECTIONS.GRAMMAR_BLANK && !item.cloze) return false;
            return true;
        });
    }
    function buildQueue(practice, groupIds, direction, rng) {
        const available = filterByGroups(practice, groupIds, direction);
        if (!available.length) return [];
        const queue = shuffle(available, rng).map(function (lex) {
            return { lex: lex, userAnswer: null, result: null, choices: null };
        });
        return ensureChoices(queue, direction, rng);
    }

    function parseExamSnapshot(data) {
        if (!data || data.v !== 3) return null;
        if (data.practice !== PRACTICES.WORDS && data.practice !== PRACTICES.KANJI && data.practice !== PRACTICES.PHRASES && data.practice !== PRACTICES.CONJ && data.practice !== PRACTICES.GRAMMAR) return null;
        if (!validDirection(data.practice, data.direction)) return null;
        if (!Array.isArray(data.items) || data.items.length === 0 || data.items.length > 8000) return null;
        if (typeof data.index !== "number" || data.index !== Math.floor(data.index)) return null;
        if (data.index < 0 || data.index >= data.items.length) return null;

        const catalog = catalogFor(data.practice, data.level);
        const queue = [];
        for (let i = 0; i < data.items.length; i++) {
            const it = data.items[i];
            if (!it || typeof it.id !== "string") return null;
            const lex = findById(catalog, it.id);
            if (!lex) return null;
            const item = { lex: lex, userAnswer: null, result: null, choices: null };
            const skipped = it.skipped === true;
            const markedCorrect = it.correct === true && !skipped;
            const hasUser = typeof it.user === "string";
            if (skipped || markedCorrect || hasUser) {
                const user = hasUser ? String(it.user).slice(0, 40) : "";
                item.result = {
                    user: user,
                    expected: lex.id,
                    correct: markedCorrect,
                    empty: false,
                    skipped: skipped
                };
                item.userAnswer = skipped ? null : user;
            }
            if (Array.isArray(it.choices)) {
                const resolved = [];
                const seen = new Set();
                const label = choiceText(lex, data.direction);
                for (let c = 0; c < it.choices.length && resolved.length < 6; c++) {
                    const id = it.choices[c];
                    if (typeof id !== "string" || seen.has(id)) continue;
                    const choice = findById(catalog, id);
                    if (!choice) continue;
                    if (choice.id !== lex.id && choiceText(choice, data.direction) === label) continue;
                    seen.add(id);
                    resolved.push(choice);
                }
                if (!seen.has(lex.id)) resolved.unshift(lex);
                if (resolved.length) item.choices = resolved;
            }
            queue.push(item);
        }
        for (let i = data.index + 1; i < queue.length; i++) {
            queue[i].result = null;
            queue[i].userAnswer = null;
        }
        const waitingNext = !!queue[data.index].result;
        ensureChoices(queue, data.direction);
        let correct = 0;
        let wrong = 0;
        let skipped = 0;
        const last = waitingNext ? data.index : data.index - 1;
        for (let i = 0; i <= last; i++) {
            const result = queue[i].result;
            if (!result) continue;
            if (result.skipped) skipped++;
            else if (result.correct) correct++;
            else wrong++;
        }
        return {
            practice: data.practice,
            direction: data.direction,
            queue: queue,
            index: data.index,
            waitingNext: waitingNext,
            lessonId: lessonIdOf(data),
            level: BUNDLES[data.level] ? data.level : "n5",
            correct: correct,
            wrong: wrong,
            skipped: skipped
        };
    }

    function lessonIdOf(data) {
        if (!data || typeof data.lessonId !== "string") return "";
        return /^[a-z0-9-]{1,80}$/.test(data.lessonId) ? data.lessonId : "";
    }

    function textForId(practice, id, direction) {
        const catalog = catalogFor(practice);
        const item = findById(catalog, id);
        if (!item) return "";
        return choiceText(item, direction);
    }

    function forLevel(level) {
        const b = bundleFor(level);
        function groupsOfLevel(practice) {
            if (practice === PRACTICES.KANJI) return b.KANJI_GROUPS;
            if (practice === PRACTICES.PHRASES) return b.PHRASE_GROUPS;
            if (practice === PRACTICES.CONJ) return b.CONJ_GROUPS;
            if (practice === PRACTICES.GRAMMAR) return b.GRAMMAR_GROUPS;
            return b.WORD_GROUPS;
        }
        function starterOfLevel(practice) {
            if (practice === PRACTICES.KANJI) return b.KANJI_STARTER;
            if (practice === PRACTICES.PHRASES) return b.PHRASE_STARTER;
            if (practice === PRACTICES.CONJ) return b.CONJ_STARTER;
            if (practice === PRACTICES.GRAMMAR) return b.GRAMMAR_STARTER;
            return b.WORD_STARTER;
        }
        function filterLevel(practice, groupIds, direction) {
            const catalog = catalogFor(practice, b.level);
            const wanted = new Set(groupIds || []);
            return catalog.filter(function (item) {
                if (!wanted.has(item.group)) return false;
                if (direction === DIRECTIONS.PARTICLE && !item.particle) return false;
                if (direction === DIRECTIONS.GRAMMAR_BLANK && !item.cloze) return false;
                return true;
            });
        }
        return {
            level: b.level,
            WORD_GROUPS: b.WORD_GROUPS,
            KANJI_GROUPS: b.KANJI_GROUPS,
            PHRASE_GROUPS: b.PHRASE_GROUPS,
            GRAMMAR_GROUPS: b.GRAMMAR_GROUPS,
            CONJ_GROUPS: b.CONJ_GROUPS,
            WORD_STARTER: b.WORD_STARTER,
            KANJI_STARTER: b.KANJI_STARTER,
            PHRASE_STARTER: b.PHRASE_STARTER,
            GRAMMAR_STARTER: b.GRAMMAR_STARTER,
            CONJ_STARTER: b.CONJ_STARTER,
            WORDS: b.WORDS,
            KANJI: b.KANJI,
            PHRASES: b.PHRASES,
            GRAMMAR: b.GRAMMAR,
            CONJ: b.CONJ,
            groupsOf: groupsOfLevel,
            starterOf: starterOfLevel,
            countInGroup: function (practice, groupId) {
                const catalog = catalogFor(practice, b.level);
                let n = 0;
                for (let i = 0; i < catalog.length; i++) {
                    if (catalog[i].group === groupId) n++;
                }
                return n;
            },
            filterByGroups: filterLevel,
            buildQueue: function (practice, groupIds, direction, rng) {
                const available = filterLevel(practice, groupIds, direction);
                if (!available.length) return [];
                const queue = shuffle(available, rng).map(function (lex) {
                    return { lex: lex, userAnswer: null, result: null, choices: null };
                });
                return ensureChoices(queue, direction, rng);
            },
            parseExamSnapshot: function (data) {
                return parseExamSnapshot(Object.assign({}, data, { level: b.level }));
            },
            textForId: function (practice, id, direction) {
                const item = findById(catalogFor(practice, b.level), id);
                if (!item) return "";
                return choiceText(item, direction);
            },
            validDirection: validDirection,
            directionLabel: directionLabel,
            view: view,
            choiceText: choiceText,
            buildChoices: buildChoices,
            ensureChoices: ensureChoices,
            checkChoice: checkChoice,
            findById: findById,
            catalogOf: catalogOf,
            shuffle: shuffle
        };
    }

    const api = {
        PRACTICES,
        DIRECTIONS,
        WORD_GROUPS,
        KANJI_GROUPS,
        PHRASE_GROUPS,
        GRAMMAR_GROUPS,
        CONJ_GROUPS,
        WORD_STARTER,
        KANJI_STARTER,
        PHRASE_STARTER,
        GRAMMAR_STARTER,
        CONJ_STARTER,
        WORDS,
        KANJI,
        PHRASES,
        GRAMMAR,
        CONJ,
        groupsOf,
        starterOf,
        countInGroup,
        validDirection,
        directionLabel,
        view,
        choiceText,
        buildChoices,
        ensureChoices,
        checkChoice,
        filterByGroups,
        buildQueue,
        parseExamSnapshot,
        textForId,
        findById,
        catalogOf,
        shuffle,
        forLevel,
        LEVELS: ["n5", "n4", "n3", "n2"].filter(function (level) { return !!BUNDLES[level]; })
    };

    root.NihongoDojoLexicon = api;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }
})(typeof window !== "undefined" ? window : globalThis);
