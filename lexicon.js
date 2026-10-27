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
        GRAMMAR_BLANK: "grammar-blank",
        LISTEN_ES: "listen-es"
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
        const conj = verbs.reduce(function (acc, verb) { return acc.concat(conjFromVerb(verb)); }, []);
        if (level === "n1") splitSharedConj(conj, verbs);
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
            CONJ: tagLevel(conj, level)
        };
    }
    function splitSharedConj(items, verbs) {
        const dictOf = {};
        verbs.forEach(function (verb) { dictOf[verb.id] = verb.dict; });
        const buckets = {};
        items.forEach(function (item) {
            const key = item.jp + "\n" + item.kana;
            if (!buckets[key]) buckets[key] = [];
            buckets[key].push(item);
        });
        Object.keys(buckets).forEach(function (key) {
            const list = buckets[key];
            const verbsIn = {};
            list.forEach(function (item) { verbsIn[item.group] = true; });
            if (Object.keys(verbsIn).length < 2) return;
            list.forEach(function (item) {
                const dict = dictOf[item.group];
                if (dict) item.jp = item.jp + "（" + dict + "）";
            });
        });
    }
    loadBundle("NihongoDojoN4", "./n4.js", "n4");
    loadBundle("NihongoDojoN3", "./n3.js", "n3");
    loadBundle("NihongoDojoN2", "./n2.js", "n2");
    loadBundle("NihongoDojoN1", "./n1.js", "n1");
    function emptyBundle(level) {
        const none = [];
        return {
            level: level || "",
            WORD_GROUPS: none.slice(), KANJI_GROUPS: none.slice(), PHRASE_GROUPS: none.slice(),
            GRAMMAR_GROUPS: none.slice(), CONJ_GROUPS: none.slice(),
            WORD_STARTER: none.slice(), KANJI_STARTER: none.slice(), PHRASE_STARTER: none.slice(),
            GRAMMAR_STARTER: none.slice(), CONJ_STARTER: none.slice(),
            WORDS: none.slice(), KANJI: none.slice(), PHRASES: none.slice(),
            GRAMMAR: none.slice(), CONJ: none.slice()
        };
    }
    function bundleFor(level) {
        if (!level || level === "n5") return BUNDLES.n5;
        return BUNDLES[level] || emptyBundle(level);
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
        loadBundle(spec[0], spec[1], level);
        return !!BUNDLES[level];
    }
    function loaded(level) {
        if (!level || level === "n5") return true;
        return !!BUNDLES[level];
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
            return direction === DIRECTIONS.KANJI_ES || direction === DIRECTIONS.ES_KANJI || direction === DIRECTIONS.KANJI_READING || direction === DIRECTIONS.LISTEN_ES;
        }
        if (practice === PRACTICES.WORDS) {
            return direction === DIRECTIONS.WORD_ES || direction === DIRECTIONS.ES_WORD || direction === DIRECTIONS.LISTEN_ES;
        }
        if (practice === PRACTICES.PHRASES) {
            return direction === DIRECTIONS.PHRASE_ES || direction === DIRECTIONS.ES_PHRASE || direction === DIRECTIONS.PARTICLE || direction === DIRECTIONS.LISTEN_ES;
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
        if (direction === DIRECTIONS.LISTEN_ES) return "escuchar → español";
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
        if (direction === DIRECTIONS.LISTEN_ES) {
            return {
                prompt: "♪",
                promptLang: "ja",
                furigana: "",
                answer: item.es,
                speak: item.kana || item.speak,
                speakOnShow: true,
                note: "No ves la frase. La dice la voz del sistema.",
                settledNote: item.jp + " · " + item.kana,
                choiceText: item.es,
                choiceSub: "",
                choiceLang: "es",
                reveal: item.jp
            };
        }
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
        if (direction === DIRECTIONS.LISTEN_ES) {
            return {
                prompt: "♪",
                promptLang: "ja",
                furigana: "",
                answer: word.es,
                speak: word.speak,
                speakOnShow: true,
                note: "La palabra no se muestra. Escucha y responde.",
                settledNote: furigana ? jp + " · " + furigana : jp,
                choiceText: word.es,
                choiceSub: "",
                choiceLang: "es",
                reveal: jp
            };
        }
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
        if (direction === DIRECTIONS.LISTEN_ES) {
            return {
                prompt: "♪",
                promptLang: "ja",
                furigana: "",
                answer: kanji.es,
                speak: kanji.reading,
                speakOnShow: true,
                note: "No ves el kanji. La lectura la dice la voz del sistema.",
                settledNote: kanji.char + " · " + kanji.reading,
                choiceText: kanji.es,
                choiceSub: "",
                choiceLang: "es",
                reveal: kanji.char
            };
        }
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
                const user = hasUser ? String(it.user).slice(0, 160) : "";
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
            answerMode: data.answerMode === "write" ? "write" : "choice",
            correct: correct,
            wrong: wrong,
            skipped: skipped
        };
    }

    function foldJa(text) {
        const src = String(text == null ? "" : text).normalize("NFKC");
        let out = "";
        for (const ch of src) {
            if (" \t\r\n　。、．，,.！？!?「」『』（）()・…〜~".indexOf(ch) !== -1) continue;
            const code = ch.codePointAt(0);
            if (ch === "ヴ") out += "ゔ";
            else if (code >= 0x30A1 && code <= 0x30F6) out += String.fromCharCode(code - 0x60);
            else out += ch;
        }
        return out;
    }
    function foldEs(text) {
        return String(text == null ? "" : text).normalize("NFKC").toLowerCase()
            .replace(/[ \t\r\n　]+/g, " ")
            .replace(/[.,;:!?¿¡。、！？]/g, "")
            .trim();
    }
    function baseGloss(es) {
        return String(es || "").split(" · ")[0].replace(/\s*\([^)]*\)\s*$/, "").trim();
    }
    function expectsSpanish(direction) {
        return direction === DIRECTIONS.WORD_ES || direction === DIRECTIONS.KANJI_ES
            || direction === DIRECTIONS.PHRASE_ES || direction === DIRECTIONS.CONJ_ES
            || direction === DIRECTIONS.GRAMMAR_ES || direction === DIRECTIONS.LISTEN_ES;
    }
    function addForm(list, value) {
        if (value) list.push(String(value));
    }
    function jaForms(item, direction) {
        const forms = [];
        if (isKanji(item)) {
            if (direction === DIRECTIONS.ES_KANJI) addForm(forms, item.char);
            if (direction === DIRECTIONS.KANJI_READING) addForm(forms, item.reading);
            return forms;
        }
        if (isPhrase(item)) {
            if (direction === DIRECTIONS.ES_PHRASE) {
                addForm(forms, item.jp);
                addForm(forms, item.kana);
            }
            if (direction === DIRECTIONS.PARTICLE) addForm(forms, item.particle);
            return forms;
        }
        if (isConj(item)) {
            if (direction === DIRECTIONS.ES_CONJ) {
                addForm(forms, item.jp);
                addForm(forms, item.kana);
                addForm(forms, String(item.jp).split("（")[0]);
            }
            return forms;
        }
        if (isGrammar(item)) {
            if (direction === DIRECTIONS.ES_GRAMMAR) {
                addForm(forms, item.pattern);
                addForm(forms, String(item.pattern || "").replace(/〜/g, ""));
                addForm(forms, item.jp);
            }
            if (direction === DIRECTIONS.GRAMMAR_BLANK) addForm(forms, item.piece);
            return forms;
        }
        if (direction === DIRECTIONS.ES_WORD) {
            addForm(forms, item.kana);
            addForm(forms, item.kanji);
        }
        return forms;
    }
    function checkWritten(item, direction, raw) {
        if (!item || typeof raw !== "string" || !raw.trim()) {
            return { user: "", expected: "", correct: false, empty: true, skipped: false, written: true };
        }
        const user = raw.trim().slice(0, 160);
        let correct = false;
        if (expectsSpanish(direction)) {
            const folded = foldEs(user);
            const forms = [item.es, baseGloss(item.es)];
            correct = !!folded && forms.some(function (form) { return foldEs(form) === folded; });
        } else {
            const folded = foldJa(user);
            correct = !!folded && jaForms(item, direction).some(function (form) { return foldJa(form) === folded; });
        }
        return {
            user: user,
            expected: item.id,
            correct: correct,
            empty: false,
            skipped: false,
            written: true
        };
    }
    function applyMiss(list, id, correct, cap) {
        const max = cap > 0 ? cap : 80;
        const out = Array.isArray(list) ? list.filter(function (item) { return typeof item === "string" && item !== id; }) : [];
        if (!correct && typeof id === "string" && id) out.unshift(id);
        return out.slice(0, max);
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
            checkWritten: checkWritten,
            applyMiss: applyMiss,
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
        checkWritten,
        applyMiss,
        filterByGroups,
        buildQueue,
        parseExamSnapshot,
        textForId,
        findById,
        catalogOf,
        shuffle,
        forLevel,
        attach,
        loaded,
        LEVELS: ["n5", "n4", "n3", "n2", "n1"]
    };

    root.NihongoDojoLexicon = api;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }
})(typeof window !== "undefined" ? window : globalThis);
