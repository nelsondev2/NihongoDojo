/* ============================================================
 * NihongoDojo — app.js
 * Capa de presentación y estado (DOM). Depende de core.js
 * (window.NihongoDojoCore) para la lógica pura.
 *
 * Invariantes:
 *  - Ningún dato dinámico pasa por innerHTML. Solo textContent.
 *  - El markup del examen vive en un único <template>.
 *  - Enter durante composición IME no envía la respuesta.
 *  - La clave de almacenamiento "rendaku" es histórica: en pantalla
 *    esos grupos se llaman sonoras (濁音・半濁音), no rendaku.
 * ============================================================ */
(function () {
    'use strict';

    const Core = window.NihongoDojoCore;
    if (!Core) {
        document.addEventListener('DOMContentLoaded', function () {
            var panel = document.getElementById('optionsPanel');
            if (panel) { panel.textContent = 'Error interno: no se cargó core.js.'; }
        });
        return;
    }

    // Solo los tests fijan este gancho. En la app la corrección no
    // desaparece sola: se avanza con Siguiente o Enter.
    var AUTO_ADVANCE = (typeof window.__KANA_ADVANCE_MS === 'number' && window.__KANA_ADVANCE_MS >= 0);
    var ADVANCE_MS = AUTO_ADVANCE ? window.__KANA_ADVANCE_MS : 0;

    var STORAGE_PREFIX = 'nihongodojo.';
    var storageOk = (function () {
        try {
            var probe = STORAGE_PREFIX + 'probe';
            window.localStorage.setItem(probe, '1');
            window.localStorage.removeItem(probe);
            return true;
        } catch (e) { return false; }
    })();

    function storageGet(key) {
        if (!storageOk) return null;
        try { return window.localStorage.getItem(STORAGE_PREFIX + key); }
        catch (e) { return null; }
    }
    function storageSet(key, value) {
        if (!storageOk) return;
        try { window.localStorage.setItem(STORAGE_PREFIX + key, value); }
        catch (e) { /* sin almacenamiento: la app sigue en memoria */ }
    }
    function storageRemove(key) {
        if (!storageOk) return;
        try { window.localStorage.removeItem(STORAGE_PREFIX + key); }
        catch (e) { /* igual que arriba */ }
    }

    function $(id) { return document.getElementById(id); }

    var optionsPanel = $('optionsPanel');
    var quizArea = $('quizArea');
    var filaContainer = $('filaContainer');
    var rendakuContainer = $('rendakuContainer');
    var yoonContainer = $('yoonContainer');
    var startBtn = $('startExamBtn');
    var startLabel = $('startExamLabel');
    var examCount = $('examCount');
    var selectAllBasicBtn = $('selectAllBasicBtn');
    var selectAllRendakuBtn = $('selectAllRendakuBtn');
    var selectAllYoonBtn = $('selectAllYoonBtn');
    var clearAllBtn = $('clearAllBtn');
    var typeBtns = Array.prototype.slice.call(document.querySelectorAll('.type-btn[data-type]'));
    var strictBtn = $('strictModeBtn');
    var flexibleBtn = $('flexibleModeBtn');
    var modeNote = $('modeNote');
    var directBtn = $('directBtn');
    var reverseBtn = $('reverseBtn');
    var directionNote = $('directionNote');
    var audioOnBtn = $('audioOnBtn');
    var audioOffBtn = $('audioOffBtn');
    var audioNote = $('audioNote');
    var audioTestBtn = $('audioTestBtn');
    var configWarning = $('configWarning');
    var quizTemplate = $('quizCardTemplate');
    var resumePanel = $('resumePanel');
    var resumeText = $('resumeText');
    var resumeBtn = $('resumeBtn');
    var discardBtn = $('discardBtn');
    var practiceKanaBtn = $('practiceKanaBtn');
    var practiceWordsBtn = $('practiceWordsBtn');
    var practiceKanjiBtn = $('practiceKanjiBtn');
    var practicePhrasesBtn = $('practicePhrasesBtn');
    var practiceNote = $('practiceNote');
    var silabarioGroup = $('silabarioGroup');
    var modeGroup = $('modeGroup');
    var directionGroup = $('directionGroup');
    var basicGroup = $('basicGroup');
    var rendakuGroup = $('rendakuGroup');
    var yoonGroup = $('yoonGroup');
    var kanaBulkActions = $('kanaBulkActions');
    var wordPanel = $('wordPanel');
    var kanjiPanel = $('kanjiPanel');
    var wordChipContainer = $('wordChipContainer');
    var kanjiChipContainer = $('kanjiChipContainer');
    var wordToEsBtn = $('wordToEsBtn');
    var esToWordBtn = $('esToWordBtn');
    var wordDirNote = $('wordDirNote');
    var kanjiToEsBtn = $('kanjiToEsBtn');
    var esToKanjiBtn = $('esToKanjiBtn');
    var kanjiReadingBtn = $('kanjiReadingBtn');
    var kanjiDirNote = $('kanjiDirNote');
    var wordAllBtn = $('wordAllBtn');
    var wordNoneBtn = $('wordNoneBtn');
    var kanjiAllBtn = $('kanjiAllBtn');
    var kanjiNoneBtn = $('kanjiNoneBtn');
    var phrasePanel = $('phrasePanel');
    var phraseChipContainer = $('phraseChipContainer');
    var phraseToEsBtn = $('phraseToEsBtn');
    var esToPhraseBtn = $('esToPhraseBtn');
    var particleBtn = $('particleBtn');
    var phraseDirNote = $('phraseDirNote');
    var phraseAllBtn = $('phraseAllBtn');
    var phraseNoneBtn = $('phraseNoneBtn');
    var practiceConjBtn = $('practiceConjBtn');
    var conjPanel = $('conjPanel');
    var conjChipContainer = $('conjChipContainer');
    var conjToEsBtn = $('conjToEsBtn');
    var esToConjBtn = $('esToConjBtn');
    var conjDirNote = $('conjDirNote');
    var conjAllBtn = $('conjAllBtn');
    var conjNoneBtn = $('conjNoneBtn');
    var practiceGrammarBtn = $('practiceGrammarBtn');
    var practiceReadingBtn = $('practiceReadingBtn');
    var answerModeGroup = $('answerModeGroup');
    var answerChoiceBtn = $('answerChoiceBtn');
    var answerWriteBtn = $('answerWriteBtn');
    var answerModeNote = $('answerModeNote');
    var readingPanel = $('readingPanel');
    var reviewMissBtn = $('reviewMissBtn');
    var listenWordBtn = $('listenWordBtn');
    var listenKanjiBtn = $('listenKanjiBtn');
    var listenPhraseBtn = $('listenPhraseBtn');
    var Readings = window.NihongoDojoReadings;
    var grammarPanel = $('grammarPanel');
    var grammarChipContainer = $('grammarChipContainer');
    var grammarToEsBtn = $('grammarToEsBtn');
    var esToGrammarBtn = $('esToGrammarBtn');
    var grammarBlankBtn = $('grammarBlankBtn');
    var grammarDirNote = $('grammarDirNote');
    var grammarAllBtn = $('grammarAllBtn');
    var grammarNoneBtn = $('grammarNoneBtn');
    var pathList = $('pathList');
    var pathIntro = $('pathIntro');
    var homePathBtn = $('homePathBtn');
    var homeFreeBtn = $('homeFreeBtn');
    var pathListToggle = $('pathListToggle');
    var levelN5Btn = $('levelN5Btn');
    var levelN4Btn = $('levelN4Btn');
    var pathProgress = $('pathProgress');
    var pathContinueBtn = $('pathContinueBtn');
    var reviewDueBtn = $('reviewDueBtn');
    var reviewDueNote = $('reviewDueNote');
    var exportBackupBtn = $('exportBackupBtn');
    var importBackupBtn = $('importBackupBtn');
    var backupNote = $('backupNote');
    var backupFile = $('backupFile');
    var APP_VERSION = '1.13.4';
    var lessonView = $('lessonView');
    var lessonBackBtn = $('lessonBackBtn');
    var lessonTitle = $('lessonTitle');
    var lessonMeta = $('lessonMeta');
    var lessonTeach = $('lessonTeach');
    var lessonStatus = $('lessonStatus');
    var lessonStartBtn = $('lessonStartBtn');
    var lessonWarning = $('lessonWarning');
    var Lex = window.NihongoDojoLexicon;
    var Lessons = window.NihongoDojoLessons;
    var openLessonId = '';

    var state = {
        currentType: 'hiragana',
        romajiMode: Core.DEFAULT_MODE,
        direction: Core.DEFAULT_DIRECTION,
        practice: 'kana',
        level: 'n5',
        wordDirection: 'word-es',
        kanjiDirection: 'kanji-es',
        phraseDirection: 'phrase-es',
        conjDirection: 'conj-es',
        grammarDirection: 'grammar-es',
        answerMode: 'choice',
        wordGroups: new Set(),
        kanjiGroups: new Set(),
        phraseGroups: new Set(),
        conjGroups: new Set(),
        grammarGroups: new Set(),
        audioOn: true,
        home: 'path',
        pathOpen: false,
        selections: {
            hiragana: { basic: new Set(), rendaku: new Set(), yoon: new Set() },
            katakana: { basic: new Set(), rendaku: new Set(), yoon: new Set() }
        }
    };

    function knownLevel(level) {
        if (Lex && Lex.LEVELS && Lex.LEVELS.indexOf(level) !== -1) return level;
        return 'n5';
    }
    function bag() {
        return Lex && Lex.forLevel ? Lex.forLevel(knownLevel(state.level)) : Lex;
    }
    function examPack() {
        var level = exam && exam.level ? knownLevel(exam.level) : knownLevel(state.level);
        return Lex && Lex.forLevel ? Lex.forLevel(level) : Lex;
    }
    function progressKey(level) {
        var use = knownLevel(level || state.level);
        return use === 'n5' ? 'lessons' : 'lessons.' + use;
    }
    function selKey(name) {
        return state.level === 'n5' ? 'sel.' + name : 'sel.' + state.level + '.' + name;
    }
    function levelName() {
        return (knownLevel(state.level) || 'n5').toUpperCase();
    }

    var exam = {
        active: false,
        queue: [],
        index: 0,
        waitingNext: false,
        timerId: null,
        deadline: null,
        direction: null,
        practice: null,
        lessonId: '',
        level: 'n5',
        answerMode: 'choice',
        correct: 0,
        wrong: 0,
        skipped: 0
    };

    var quizEls = emptyQuizEls();

    function emptyQuizEls() {
        return {
            kanaChar: null, hint: null, input: null, inputArea: null, passage: null,
            choiceArea: null, listenBtn: null, audioStatus: null, help: null,
            feedback: null, announcer: null, progress: null, total: null,
            skipBtn: null, nextBtn: null, exitBtn: null,
            exitDialog: null, exitDialogText: null,
            exitCancelBtn: null, exitConfirmBtn: null
        };
    }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = text;
        return node;
    }
    function setHidden(node, hidden) {
        if (!node) return;
        if (hidden) node.classList.add('hidden');
        else node.classList.remove('hidden');
    }
    function clearTimer() {
        if (exam.timerId !== null) {
            window.clearTimeout(exam.timerId);
            exam.timerId = null;
        }
    }
    function setFeedback(message, kind) {
        if (!quizEls.feedback) return;
        quizEls.feedback.textContent = message;
        quizEls.feedback.classList.remove('feedback-ok', 'feedback-bad', 'feedback-skip');
        if (kind) quizEls.feedback.classList.add('feedback-' + kind);
    }
    function resultKind(item) {
        if (!item.result) return '';
        if (item.result.skipped) return 'skip';
        return item.result.correct ? 'ok' : 'bad';
    }
    function plural(n, singular, pluralWord) {
        return n + ' ' + (n === 1 ? singular : pluralWord);
    }
    function updateStatsUI() {
        if (quizEls.progress) {
            quizEls.progress.textContent = 'Pregunta ' +
                Math.min(exam.index + 1, exam.queue.length) + ' de ' + exam.queue.length;
        }
        if (quizEls.total) {
            quizEls.total.textContent = plural(exam.correct, 'acierto', 'aciertos') +
                ' · ' + plural(exam.wrong, 'fallo', 'fallos') +
                ' · ' + plural(exam.skipped, 'saltada', 'saltadas');
        }
    }
    function showConfigWarning(message) {
        if (!configWarning) return;
        configWarning.textContent = message;
        setHidden(configWarning, false);
    }
    function clearConfigWarning() {
        if (configWarning) { configWarning.textContent = ''; setHidden(configWarning, true); }
    }
    function dialogOpen() {
        return !!(quizEls.exitDialog && !quizEls.exitDialog.classList.contains('hidden'));
    }

    // Pistas de lectura que el carácter solo no enseña. No se acepta
    // la lectura de partícula: el ejercicio es el silabario.
    function readingNote(kana, mode) {
        var ch = kana.char;
        if (ch === 'は' || ch === 'ハ') {
            return 'Lectura del carácter: ha. Como partícula se lee wa; aquí no.';
        }
        if (ch === 'へ' || ch === 'ヘ') {
            return 'Lectura del carácter: he. Como partícula se lee e; aquí no.';
        }
        if (ch === 'を' || ch === 'ヲ') {
            return mode === Core.MODES.STRICT
                ? 'En modo estricto solo vale wo.'
                : 'Vale wo. En este modo flexible también vale o.';
        }
        if (ch === 'ぢ' || ch === 'ヂ') {
            return 'Se lee ji, igual que じ/ジ. En japonés moderno suenan igual.';
        }
        if (ch === 'づ' || ch === 'ヅ') {
            return mode === Core.MODES.STRICT
                ? 'Se lee zu, igual que ず/ズ. En japonés moderno suenan igual.'
                : 'Se lee zu, igual que ず/ズ. Aquí también vale du y dzu.';
        }
        return '';
    }

    function isReverse() {
        var dir = exam.direction || state.direction;
        return dir === Core.DIRECTIONS.ROMAJI_KANA;
    }
    function isNamedPractice(name) {
        return name === 'words' || name === 'kanji' || name === 'phrases' || name === 'conj' || name === 'grammar';
    }
    function isReadingPractice(name) {
        return name === 'reading';
    }
    function isLexicon() {
        return isNamedPractice(exam.practice);
    }
    function isWrite() {
        return isLexicon() && exam.answerMode === 'write';
    }
    function usesChoices(item) {
        if (!item && exam.queue) item = exam.queue[exam.index];
        if (item && item.reading) return true;
        if (item && item.lex) return exam.practice === 'review' || !isWrite();
        if (item && item.kanaObj) {
            var kanaDir = item.reviewDirection || exam.direction || state.direction;
            return kanaDir === Core.DIRECTIONS.ROMAJI_KANA;
        }
        if (exam.practice === 'reading') return true;
        if (isWrite()) return false;
        return isReverse() || isLexicon();
    }
    function activeDirection() {
        if (state.practice === 'words') return state.wordDirection;
        if (state.practice === 'kanji') return state.kanjiDirection;
        if (state.practice === 'phrases') return state.phraseDirection;
        if (state.practice === 'conj') return state.conjDirection;
        if (state.practice === 'grammar') return state.grammarDirection;
        return state.direction;
    }
    function directionLabel(dir) {
        if (dir === Core.DIRECTIONS.ROMAJI_KANA) return 'romaji → kana';
        if (Lex && Lex.validDirection(state.practice, dir)) return Lex.directionLabel(dir);
        if (dir === 'word-es' || dir === 'es-word' || dir === 'kanji-es' || dir === 'es-kanji' || dir === 'kanji-reading' || dir === 'phrase-es' || dir === 'es-phrase' || dir === 'particle') {
            return Lex ? Lex.directionLabel(dir) : dir;
        }
        return 'kana → romaji';
    }
    function itemPractice(item) {
        if (item && item.reviewPractice) return item.reviewPractice;
        if (item && item.reading) return 'reading';
        if (item && item.kanaObj && !item.lex) return 'kana';
        return exam.practice;
    }
    function itemDirection(item) {
        if (item && item.reviewDirection) return item.reviewDirection;
        if (item && item.reading) return 'lectura';
        return exam.direction || activeDirection();
    }
    function shareScope() {
        if (exam.practice === 'review') return 'repaso';
        if (exam.practice === 'reading') return 'lectura';
        if ((exam.direction || '') === 'listen-es') return 'escucha';
        if (exam.practice === 'words') return 'palabras';
        if (exam.practice === 'kanji') return 'kanji';
        if (exam.practice === 'phrases') return 'frases';
        if (exam.practice === 'conj') return 'conjugación';
        if (exam.practice === 'grammar') return 'gramática';
        return state.currentType === 'katakana' ? 'katakana' : 'hiragana';
    }
    function practiceScope(practice, type) {
        if (practice === 'reading') return 'lectura';
        if (practice === 'words') return 'palabras';
        if (practice === 'kanji') return 'kanji';
        if (practice === 'phrases') return 'frases';
        if (practice === 'conj') return 'conjugación';
        if (practice === 'grammar') return 'gramática';
        return type === 'katakana' ? 'katakana' : 'hiragana';
    }
    function lexView(item) {
        return Lex.view(item.lex, itemDirection(item));
    }
    function lexiconHint(view, settled) {
        var parts = [];
        if (view.furigana) parts.push(view.furigana);
        if (!settled && view.note) parts.push(view.note);
        if (settled && view.settledNote) parts.push(view.settledNote);
        else if (settled && view.note) parts.push(view.note);
        return parts.join(' · ');
    }
    function spokenText(item, settled) {
        if (!item) return '';
        if (item.kanaObj) return item.kanaObj.char;
        if (item.reading) return item.reading.kana || item.reading.jp;
        if (!item.lex) return '';
        var view = lexView(item);
        if (!settled && !view.speakOnShow && exam.direction !== 'listen-es') return '';
        return view.speak || '';
    }
    function speakItem(item, settled) {
        var text = item && item.reading ? (item.reading.kana || item.reading.jp) : spokenText(item, true);
        if (item && item.lex && !item.reading) {
            var view = lexView(item);
            if (!view.speakOnShow && !settled && exam.direction !== 'listen-es') {
                noteAudio('En esta dirección el sonido se oye al corregir, para no revelar la respuesta.');
                return;
            }
            text = view.speak;
        }
        if (!text) return;
        if (!speakJapanese(text) && exam.direction === 'listen-es' && systemSpeech()) {
            noteAudio('Pulsa Oír. Hace falta la síntesis de voz del sistema.');
        }
    }
    function maybeSpeakItem(item, settled) {
        if (!item) return;
        var listen = exam.direction === 'listen-es';
        if (item.reading) {
            if (!state.audioOn || settled) return;
            var passageId = String(item.reading.id || '').replace(/-\d+$/, '');
            if (exam.spokenPassage === passageId) return;
            exam.spokenPassage = passageId;
            speakJapanese(item.reading.kana || item.reading.jp);
            return;
        }
        if (!item.lex) return;
        var view = lexView(item);
        if (!state.audioOn && !listen) return;
        if ((view.speakOnShow || listen) && !settled) speakJapanese(view.speak);
        else if (!view.speakOnShow && settled) speakJapanese(view.speak);
    }

    function reverseNote(item) {
        var pool = exam.queue.map(function (q) { return q.kanaObj; });
        if (Core.readingCollision(item.kanaObj, pool)) {
            return 'Misma lectura que otro carácter de este examen. Fila: ' + item.kanaObj.fila + '.';
        }
        var ch = item.kanaObj.char;
        if (ch === 'は' || ch === 'ハ') return 'Esta lectura es ha, no la partícula wa.';
        if (ch === 'へ' || ch === 'ヘ') return 'Esta lectura es he, no la partícula e.';
        if (ch === 'を' || ch === 'ヲ') return 'Elige el carácter de wo, no una vocal suelta.';
        return '';
    }

    function feedbackFor(item) {
        var r = item.result;
        var tail = ' Pulsa Siguiente o Enter.';
        if (item.lex) {
            var view = lexView(item);
            var shown = view.reveal && r ? view.reveal : view.prompt;
            if (!r) return isWrite() ? 'Escribe la respuesta y pulsa Enter.' : 'Elige la respuesta.';
            if (r.skipped) return 'Saltada. ' + (view.reveal || view.prompt) + ' → ' + view.answer + '.' + tail;
            if (r.correct) return 'Correcto: ' + view.answer + '.' + tail;
            var yours = r.written ? (r.user || '—') : (examPack().textForId(itemPractice(item), r.user, itemDirection(item)) || '—');
            return 'Fallo. ' + shown + ' → ' + view.answer + '. Tú: ' + yours + '.' + tail;
        }
        if (item.reading) {
            if (!r) return 'Elige la respuesta.';
            if (r.skipped) return 'Saltada. ' + item.reading.ask + '.' + tail;
            var picked = item.reading.choices[Number(r.user)];
            var right = item.reading.choices[item.reading.answer];
            if (r.correct) return 'Correcto: ' + right + '.' + tail;
            return 'Fallo. ' + right + '. Tú: ' + (picked || '—') + '.' + tail;
        }
        var k = item.kanaObj;
        if (!r) return isReverse() ? 'Elige el kana.' : 'Escribe el romaji y pulsa Enter.';
        if (isReverse()) {
            if (r.skipped) return 'Saltada. «' + k.romaji + '» es ' + k.char + '.' + tail;
            if (r.correct) return 'Correcto: ' + k.char + ' («' + k.romaji + '»).' + tail;
            return 'Fallo. «' + k.romaji + '» es ' + k.char + '. Tú: ' + (r.user || '—') + '.' + tail;
        }
        if (r.skipped) {
            return 'Saltada. Respuesta: «' + r.expected + '» (' + k.char + ').' + tail;
        }
        if (r.correct) return 'Correcto: «' + r.expected + '».' + tail;
        return 'Fallo. Respuesta: «' + r.expected + '» (' + k.char + ').' + tail;
    }

    // ---------- Persistencia ----------
    var CATEGORY_KEYS = ['basic', 'rendaku', 'yoon'];
    function persistSelections() {
        ['hiragana', 'katakana'].forEach(function (type) {
            CATEGORY_KEYS.forEach(function (cat) {
                storageSet('sel.' + type + '.' + cat,
                    JSON.stringify(Array.from(state.selections[type][cat])));
            });
        });
    }
    function persistMode() {
        storageSet('mode', state.romajiMode);
    }
    function persistType() {
        storageSet('type', state.currentType);
    }
    function persistDirection() {
        storageSet('direction', state.direction);
    }
    function persistAudio() {
        storageSet('audio', state.audioOn ? 'on' : 'off');
    }
    function persistPractice() {
        storageSet('practice', state.practice);
    }
    function persistWordDirection() {
        storageSet('wordDirection', state.wordDirection);
    }
    function persistKanjiDirection() {
        storageSet('kanjiDirection', state.kanjiDirection);
    }
    function persistPhraseDirection() {
        storageSet('phraseDirection', state.phraseDirection);
    }
    function persistConjDirection() {
        storageSet('conjDirection', state.conjDirection);
    }
    function persistGrammarDirection() {
        storageSet('grammarDirection', state.grammarDirection);
    }
    function persistLexGroups() {
        storageSet(selKey('words'), JSON.stringify(Array.from(state.wordGroups)));
        storageSet(selKey('kanji'), JSON.stringify(Array.from(state.kanjiGroups)));
        storageSet(selKey('phrases'), JSON.stringify(Array.from(state.phraseGroups)));
        storageSet(selKey('conj'), JSON.stringify(Array.from(state.conjGroups)));
        storageSet(selKey('grammar'), JSON.stringify(Array.from(state.grammarGroups)));
    }
    function persistAnswerMode() { storageSet('answerMode', state.answerMode === 'write' ? 'write' : 'choice'); }
    function persistLevel() {
        storageSet('level', state.level);
    }
    function persistHome() {
        storageSet('home', state.home === 'free' ? 'free' : 'path');
    }

    function loadStoredNames(key, validRows) {
        var raw = storageGet(key);
        if (raw === null) return null;
        var valid = new Set(validRows);
        try {
            var parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return null;
            var clean = parsed.filter(function (name) { return valid.has(name); });
            return new Set(clean);
        } catch (e) {
            return null;
        }
    }

    function reloadLexSelections() {
        if (!Lex) return;
        var pack = bag();
        var storedWords = loadStoredNames(selKey('words'), pack.WORD_GROUPS.map(function (g) { return g.id; }));
        var storedKanji = loadStoredNames(selKey('kanji'), pack.KANJI_GROUPS.map(function (g) { return g.id; }));
        state.wordGroups = storedWords !== null ? storedWords : new Set(pack.WORD_STARTER);
        state.kanjiGroups = storedKanji !== null ? storedKanji : new Set(pack.KANJI_STARTER);
        var storedPhrases = loadStoredNames(selKey('phrases'), pack.PHRASE_GROUPS.map(function (g) { return g.id; }));
        state.phraseGroups = storedPhrases !== null ? storedPhrases : new Set(pack.PHRASE_STARTER);
        var storedConj = loadStoredNames(selKey('conj'), pack.CONJ_GROUPS.map(function (g) { return g.id; }));
        state.conjGroups = storedConj !== null ? storedConj : new Set(pack.CONJ_STARTER);
        var storedGrammar = loadStoredNames(selKey('grammar'), pack.GRAMMAR_GROUPS.map(function (g) { return g.id; }));
        state.grammarGroups = storedGrammar !== null ? storedGrammar : new Set(pack.GRAMMAR_STARTER);
    }
    function loadState() {
        var storedMode = storageGet('mode');
        state.romajiMode = (storedMode === Core.MODES.STRICT || storedMode === Core.MODES.FLEXIBLE)
            ? storedMode : Core.DEFAULT_MODE;
        var storedType = storageGet('type');
        if (storedType === 'hiragana' || storedType === 'katakana') state.currentType = storedType;
        var storedDirection = storageGet('direction');
        state.direction = storedDirection === Core.DIRECTIONS.ROMAJI_KANA
            ? Core.DIRECTIONS.ROMAJI_KANA : Core.DEFAULT_DIRECTION;
        var storedAudio = storageGet('audio');
        if (storedAudio === 'on') state.audioOn = true;
        if (storedAudio === 'off') state.audioOn = false;
        var storedPractice = storageGet('practice');
        state.practice = storedPractice === 'words' || storedPractice === 'kanji' || storedPractice === 'phrases' || storedPractice === 'conj' || storedPractice === 'grammar' || storedPractice === 'reading'
            ? storedPractice : 'kana';
        state.answerMode = storageGet('answerMode') === 'write' ? 'write' : 'choice';
        var storedLevel = storageGet('level');
        state.level = knownLevel(storedLevel);
        state.home = storageGet('home') === 'free' ? 'free' : 'path';
        if (Lex) {
            var storedWordDir = storageGet('wordDirection');
            state.wordDirection = Lex.validDirection('words', storedWordDir) ? storedWordDir : 'word-es';
            var storedKanjiDir = storageGet('kanjiDirection');
            state.kanjiDirection = Lex.validDirection('kanji', storedKanjiDir) ? storedKanjiDir : 'kanji-es';
            var storedPhraseDir = storageGet('phraseDirection');
            state.phraseDirection = Lex.validDirection('phrases', storedPhraseDir) ? storedPhraseDir : 'phrase-es';
            var storedConjDir = storageGet('conjDirection');
            state.conjDirection = Lex.validDirection('conj', storedConjDir) ? storedConjDir : 'conj-es';
            var storedGrammarDir = storageGet('grammarDirection');
            state.grammarDirection = Lex.validDirection('grammar', storedGrammarDir) ? storedGrammarDir : 'grammar-es';
            reloadLexSelections();
        }

        ['hiragana', 'katakana'].forEach(function (type) {
            var storedBasic = loadStoredNames('sel.' + type + '.basic', Core.getBasicRowsByType(type));
            var storedRendaku = loadStoredNames('sel.' + type + '.rendaku', Core.getRendakuRowsByType(type));
            var storedYoon = loadStoredNames('sel.' + type + '.yoon', Core.getYoonRowsByType(type));
            // Sin dato: solo las filas básicas. Un Set vacío guardado
            // sí se respeta (el usuario desmarcó a propósito).
            state.selections[type].basic = storedBasic !== null
                ? storedBasic : new Set(Core.getBasicRowsByType(type));
            state.selections[type].rendaku = storedRendaku !== null ? storedRendaku : new Set();
            state.selections[type].yoon = storedYoon !== null ? storedYoon : new Set();
        });
    }

    function lexiconSnapshot() {
        return {
            v: 3,
            level: exam.level || state.level || 'n5',
            practice: exam.practice,
            direction: exam.direction,
            lessonId: exam.lessonId || '',
            index: exam.index,
            waitingNext: exam.waitingNext === true,
            answerMode: exam.answerMode === 'write' ? 'write' : 'choice',
            items: exam.queue.map(function (item) {
                var r = item.result;
                return {
                    id: item.lex.id,
                    user: r ? r.user : null,
                    correct: r ? r.correct === true : null,
                    skipped: r ? r.skipped === true : null,
                    choices: item.choices ? item.choices.map(function (c) { return c.id; }) : null
                };
            })
        };
    }
    function readingSnapshot() {
        return {
            v: 4,
            level: exam.level || state.level || 'n5',
            practice: 'reading',
            index: exam.index,
            waitingNext: exam.waitingNext === true,
            items: exam.queue.map(function (item) {
                var r = item.result;
                return {
                    id: item.reading.id,
                    user: r ? r.user : null,
                    correct: r ? r.correct === true : null,
                    skipped: r ? r.skipped === true : null
                };
            })
        };
    }
    function reviewSnapshot() {
        return {
            v: 5,
            level: knownLevel(exam.level),
            practice: 'review',
            index: exam.index,
            waitingNext: exam.waitingNext === true,
            items: exam.queue.map(function (item) {
                var r = item.result;
                return {
                    practice: item.reviewPractice,
                    direction: item.reviewDirection,
                    id: item.lex ? item.lex.id : item.reading ? item.reading.id : (item.kanaObj.type + ':' + item.kanaObj.char),
                    user: r ? r.user : null,
                    correct: r ? r.correct === true : null,
                    skipped: r ? r.skipped === true : null,
                    choices: item.lex && item.choices ? item.choices.map(function (c) { return c.id; }) : null
                };
            })
        };
    }
    function parseReviewSnapshot(data) {
        if (!data || data.v !== 5 || data.practice !== 'review') return null;
        if (!Lex || !Lex.LEVELS || Lex.LEVELS.indexOf(data.level) === -1) return null;
        if (!Array.isArray(data.items) || data.items.length === 0 || data.items.length > 40) return null;
        if (typeof data.index !== 'number' || data.index !== Math.floor(data.index)) return null;
        if (data.index < 0 || data.index >= data.items.length) return null;
        var queue = [];
        for (var i = 0; i < data.items.length; i++) {
            var it = data.items[i];
            if (!it || typeof it.id !== 'string' || typeof it.practice !== 'string') return null;
            var item = buildReviewItem(data.level, it);
            if (!item) return null;
            var skipped = it.skipped === true;
            var markedCorrect = it.correct === true && !skipped;
            var hasUser = typeof it.user === 'string';
            if (skipped || markedCorrect || hasUser) {
                item.result = {
                    user: hasUser ? String(it.user).slice(0, 160) : '',
                    expected: item.lex ? item.lex.id : it.id,
                    correct: markedCorrect,
                    empty: false,
                    skipped: skipped
                };
                item.userAnswer = skipped ? null : item.result.user;
            }
            queue.push(item);
        }
        for (var j = data.index + 1; j < queue.length; j++) {
            queue[j].result = null;
            queue[j].userAnswer = null;
        }
        var waitingNext = !!queue[data.index].result;
        var correct = 0;
        var wrong = 0;
        var skippedCount = 0;
        var last = waitingNext ? data.index : data.index - 1;
        for (var n = 0; n <= last; n++) {
            var result = queue[n].result;
            if (!result) continue;
            if (result.skipped) skippedCount++;
            else if (result.correct) correct++;
            else wrong++;
        }
        return {
            queue: queue,
            index: data.index,
            waitingNext: waitingNext,
            correct: correct,
            wrong: wrong,
            skipped: skippedCount,
            practice: 'review',
            direction: 'repaso',
            level: data.level,
            lessonId: '',
            answerMode: 'choice'
        };
    }
    function examSnapshot() {
        if (exam.practice === 'review') return reviewSnapshot();
        if (exam.practice === 'reading') return readingSnapshot();
        if (isLexicon()) return lexiconSnapshot();
        return {
            v: 2,
            type: state.currentType,
            mode: state.romajiMode,
            direction: exam.direction || state.direction,
            lessonId: exam.lessonId || '',
            index: exam.index,
            waitingNext: exam.waitingNext === true,
            items: exam.queue.map(function (item) {
                var r = item.result;
                return {
                    char: item.kanaObj.char,
                    type: item.kanaObj.type,
                    user: r ? r.user : null,
                    correct: r ? r.correct === true : null,
                    skipped: r ? r.skipped === true : null,
                    choices: item.choices ? item.choices.map(function (k) { return k.char; }) : null
                };
            })
        };
    }
    function saveExam() {
        if (!exam.active || !exam.queue.length) return;
        storageSet('exam', JSON.stringify(examSnapshot()));
    }
    function clearSavedExam() {
        storageRemove('exam');
    }
    function loadSavedExam() {
        var raw = storageGet('exam');
        if (!raw) return null;
        var parsed = null;
        try {
            var data = JSON.parse(raw);
            parsed = data && data.v === 5
                ? parseReviewSnapshot(data)
                : data && data.v === 4 && Readings
                ? Readings.parseExamSnapshot(data)
                : data && data.v === 3 && Lex
                ? Lex.parseExamSnapshot(data)
                : Core.parseExamSnapshot(data);
        }
        catch (e) { parsed = null; }
        if (!parsed) clearSavedExam();
        return parsed;
    }

    function refreshResumePanel() {
        var saved = loadSavedExam();
        if (!resumePanel) return;
        if (!saved) {
            setHidden(resumePanel, true);
            if (resumeText) resumeText.textContent = '';
            return;
        }
        var n = saved.index + 1;
        var scope = practiceScope(saved.practice, saved.type);
        var way = saved.practice === 'reading'
            ? 'lectura'
            : isNamedPractice(saved.practice) && Lex
            ? Lex.directionLabel(saved.direction)
            : directionLabel(saved.direction);
        var lesson = saved.lessonId && Lessons ? Lessons.findLesson(saved.lessonId) : null;
        if (saved.practice === 'review') {
            scope = 'repaso';
            way = 'del ' + String(saved.level || '').toUpperCase();
        }
        if (resumeText) {
            resumeText.textContent = (saved.practice === 'review'
                ? 'Repaso a medias del ' + String(saved.level || 'n5').toUpperCase()
                : (lesson ? 'Lección «' + lesson.title + '» a medias' : 'Examen a medias') + ' (' + scope + ', ' + way + ')') + ': pregunta ' + n +
                ' de ' + saved.queue.length + '. ' +
                plural(saved.correct, 'acierto', 'aciertos') + ', ' +
                plural(saved.wrong, 'fallo', 'fallos') + ', ' +
                plural(saved.skipped, 'saltada', 'saltadas') + '.';
        }
        if (resumeBtn) resumeBtn.textContent = saved.practice === 'review' ? 'Continuar repaso' : 'Continuar examen';
        setHidden(resumePanel, false);
    }

    // ---------- Panel de configuración ----------
    function renderChipGroup(container, rows, cssClass, category) {
        rows.forEach(function (row) {
            var chip = el('button', 'fila-chip ' + cssClass);
            chip.type = 'button';
            chip.lang = 'ja';
            chip.setAttribute('data-row', row);
            chip.setAttribute('aria-pressed', state.selections[state.currentType][category].has(row) ? 'true' : 'false');
            if (state.selections[state.currentType][category].has(row)) chip.classList.add('selected');
            chip.textContent = row;
            chip.addEventListener('click', function () {
                if (exam.active) return;
                var sel = state.selections[state.currentType][category];
                if (sel.has(row)) { sel.delete(row); } else { sel.add(row); }
                persistSelections();
                clearConfigWarning();
                renderChips();
                var chips = container.querySelectorAll('.fila-chip');
                for (var i = 0; i < chips.length; i++) {
                    if (chips[i].getAttribute('data-row') === row) { chips[i].focus(); break; }
                }
            });
            container.appendChild(chip);
        });
    }

    function renderChips() {
        filaContainer.replaceChildren ? filaContainer.replaceChildren() : (filaContainer.textContent = '');
        rendakuContainer.replaceChildren ? rendakuContainer.replaceChildren() : (rendakuContainer.textContent = '');
        yoonContainer.replaceChildren ? yoonContainer.replaceChildren() : (yoonContainer.textContent = '');

        renderChipGroup(filaContainer, Core.getBasicRowsByType(state.currentType), '', 'basic');
        renderChipGroup(rendakuContainer, Core.getRendakuRowsByType(state.currentType), 'rendaku-chip', 'rendaku');
        renderChipGroup(yoonContainer, Core.getYoonRowsByType(state.currentType), 'yoon-chip', 'yoon');
        updateExamCount();
    }

    function selectedCount() {
        if (state.practice === 'reading' && Readings) return Readings.questionsFor(state.level).length;
        if (state.practice === 'words' && Lex) return bag().filterByGroups('words', state.wordGroups, state.wordDirection).length;
        if (state.practice === 'kanji' && Lex) return bag().filterByGroups('kanji', state.kanjiGroups, state.kanjiDirection).length;
        if (state.practice === 'phrases' && Lex) return bag().filterByGroups('phrases', state.phraseGroups, state.phraseDirection).length;
        if (state.practice === 'conj' && Lex) return bag().filterByGroups('conj', state.conjGroups, state.conjDirection).length;
        if (state.practice === 'grammar' && Lex) return bag().filterByGroups('grammar', state.grammarGroups, state.grammarDirection).length;
        var sel = state.selections[state.currentType];
        return Core.getFilteredKana(state.currentType, sel.basic, sel.rendaku, sel.yoon).length;
    }
    function updateExamCount() {
        var n = selectedCount();
        if (examCount) {
            if (state.practice === 'words') {
                examCount.textContent = n === 0
                    ? 'Ninguna palabra con esta selección.'
                    : (n === 1 ? '1 palabra con esta selección.' : n + ' palabras con esta selección.');
            } else if (state.practice === 'kanji') {
                examCount.textContent = n === 0
                    ? 'Ningún kanji con esta selección.'
                    : (n === 1 ? '1 kanji con esta selección.' : n + ' kanji con esta selección.');
            } else if (state.practice === 'phrases') {
                examCount.textContent = n === 0
                    ? 'Ninguna frase con esta selección.'
                    : (n === 1 ? '1 frase con esta selección.' : n + ' frases con esta selección.');
            } else if (state.practice === 'conj') {
                examCount.textContent = n === 0
                    ? 'Ninguna forma con esta selección.'
                    : (n === 1 ? '1 forma con esta selección.' : n + ' formas con esta selección.');
            } else if (state.practice === 'reading') {
                examCount.textContent = n === 0
                    ? 'Este nivel no tiene textos.'
                    : (n === 1 ? '1 pregunta de lectura.' : n + ' preguntas de lectura.');
            } else if (state.practice === 'grammar') {
                examCount.textContent = n === 0
                    ? 'Ningún patrón con esta selección.'
                    : (n === 1 ? '1 patrón con esta selección.' : n + ' patrones con esta selección.');
            } else {
                examCount.textContent = n === 0
                    ? 'Ninguna pregunta con esta selección.'
                    : (n === 1 ? '1 pregunta con esta selección.' : n + ' preguntas con esta selección.');
            }
        }
        if (startLabel) {
            startLabel.textContent = n > 0 ? 'Empezar (' + n + ')' : 'Empezar';
        }
    }

    function updateTypeButtonsUI() {
        typeBtns.forEach(function (btn) {
            var active = btn.getAttribute('data-type') === state.currentType;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function updateModeButtonsUI() {
        var isStrict = state.romajiMode === Core.MODES.STRICT;
        if (strictBtn && flexibleBtn) {
            strictBtn.classList.toggle('active', isStrict);
            flexibleBtn.classList.toggle('active', !isStrict);
            strictBtn.setAttribute('aria-pressed', isStrict ? 'true' : 'false');
            flexibleBtn.setAttribute('aria-pressed', isStrict ? 'false' : 'true');
        }
        if (modeNote) {
            modeNote.textContent = isStrict
                ? 'Estricto: solo Hepburn (shi, chi, tsu, fu, ji, zu, wo, sha, ja…).'
                : 'Flexible: también acepta si, ti, tu, hu, zi, di, du, dzu, o, nn, sya/shya y tya/jya…';
        }
    }

    function renderLexChips() {
        if (!Lex) return;
        paintLexChips(wordChipContainer, 'words', state.wordGroups);
        paintLexChips(kanjiChipContainer, 'kanji', state.kanjiGroups);
        paintLexChips(phraseChipContainer, 'phrases', state.phraseGroups);
        paintLexChips(conjChipContainer, 'conj', state.conjGroups);
        paintLexChips(grammarChipContainer, 'grammar', state.grammarGroups);
    }
    function paintLexChips(container, practice, selected) {
        if (!container) return;
        if (container.replaceChildren) container.replaceChildren();
        else container.textContent = '';
        bag().groupsOf(practice).forEach(function (group) {
            var chip = el('button', 'fila-chip');
            chip.type = 'button';
            chip.setAttribute('data-group', group.id);
            var on = selected.has(group.id);
            chip.setAttribute('aria-pressed', on ? 'true' : 'false');
            if (on) chip.classList.add('selected');
            var dir = practice === 'phrases' ? state.phraseDirection
                : practice === 'grammar' ? state.grammarDirection
                : null;
            var total = dir
                ? bag().filterByGroups(practice, [group.id], dir).length
                : bag().countInGroup(practice, group.id);
            if (practice === 'conj') chip.lang = 'ja';
            chip.textContent = group.label + ' (' + total + ')';
            chip.addEventListener('click', function () {
                if (exam.active) return;
                if (selected.has(group.id)) selected.delete(group.id);
                else selected.add(group.id);
                persistLexGroups();
                clearConfigWarning();
                renderLexChips();
                updateExamCount();
            });
            container.appendChild(chip);
        });
    }
    function updateAnswerModeUI() {
        var write = state.answerMode === 'write';
        [answerChoiceBtn, answerWriteBtn].forEach(function (btn) {
            if (!btn) return;
            var on = btn.getAttribute('data-answer-mode') === (write ? 'write' : 'choice');
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        if (answerModeNote) {
            answerModeNote.textContent = write
                ? 'Escribes la respuesta y pulsas Enter. En japonés vale el kanji o el hiragana. Un salto no cuenta como fallo.'
                : 'Elegir muestra opciones. Escribir pide la respuesta. Un salto no cuenta como fallo.';
        }
    }
    function updateLexDirectionUI() {
        [wordToEsBtn, esToWordBtn, listenWordBtn].forEach(function (btn) {
            if (!btn) return;
            var on = btn.getAttribute('data-word-direction') === state.wordDirection;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        if (wordDirNote) {
            wordDirNote.textContent = state.wordDirection === 'listen-es'
                ? 'No ves la palabra. La dice la síntesis de voz del sistema, también en webxdc, y respondes el significado.'
                : state.wordDirection === 'es-word'
                    ? 'Ves el español y eliges la palabra. El sonido se oye al corregir.'
                    : 'Ves la palabra. Si lleva kanji, la lectura va debajo.';
        }
        [kanjiToEsBtn, esToKanjiBtn, kanjiReadingBtn, listenKanjiBtn].forEach(function (btn) {
            if (!btn) return;
            var on = btn.getAttribute('data-kanji-direction') === state.kanjiDirection;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        if (kanjiDirNote) {
            kanjiDirNote.textContent = state.kanjiDirection === 'listen-es'
                ? 'No ves el kanji. La lectura la dice la voz del sistema y eliges el significado.'
                : state.kanjiDirection === 'kanji-reading'
                ? 'Ves el kanji y eliges su lectura principal. Otras lecturas salen al corregir.'
                : state.kanjiDirection === 'es-kanji'
                    ? 'Ves el significado y eliges el kanji. El sonido se oye al corregir.'
                    : 'Ves el kanji y eliges el significado. La lectura se oye, no se revela.';
        }
        [phraseToEsBtn, esToPhraseBtn, particleBtn, listenPhraseBtn].forEach(function (btn) {
            if (!btn) return;
            var on = btn.getAttribute('data-phrase-direction') === state.phraseDirection;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        if (phraseDirNote) {
            phraseDirNote.textContent = state.phraseDirection === 'listen-es'
                ? 'No ves la frase. La dice la voz del sistema y eliges el significado.'
                : state.phraseDirection === 'particle'
                ? 'Ves el significado y la frase con un hueco. Elige la partícula.'
                : state.phraseDirection === 'es-phrase'
                    ? 'Ves el español y eliges la frase. El sonido se oye al corregir.'
                    : 'Ves la frase. La lectura va debajo. Elige el significado.';
        }
        [conjToEsBtn, esToConjBtn].forEach(function (btn) {
            if (!btn) return;
            var on = btn.getAttribute('data-conj-direction') === state.conjDirection;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        if (conjDirNote) {
            conjDirNote.textContent = state.conjDirection === 'es-conj'
                ? 'Ves el español y eliges la forma. El sonido se oye al corregir.'
                : 'Ves la forma. La lectura va debajo. Elige el significado.';
        }
        [grammarToEsBtn, esToGrammarBtn, grammarBlankBtn].forEach(function (btn) {
            if (!btn) return;
            var on = btn.getAttribute('data-grammar-direction') === state.grammarDirection;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        if (grammarDirNote) {
            grammarDirNote.textContent = state.grammarDirection === 'grammar-blank'
                ? 'Ves la frase con un hueco y eliges la pieza que falta.'
                : state.grammarDirection === 'es-grammar'
                    ? 'Ves el español y eliges el patrón. El sonido se oye al corregir.'
                    : 'Ves el patrón. La lectura va debajo. Elige el significado.';
        }
    }
    function updatePracticeUI() {
        var practice = isNamedPractice(state.practice) ? state.practice : 'kana';
        [practiceKanaBtn, practiceWordsBtn, practiceKanjiBtn, practicePhrasesBtn, practiceConjBtn, practiceGrammarBtn, practiceReadingBtn].forEach(function (btn) {
            if (!btn) return;
            var on = btn.getAttribute('data-practice') === practice;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        var kana = practice === 'kana';
        setHidden(silabarioGroup, !kana);
        setHidden(modeGroup, !kana);
        setHidden(directionGroup, !kana);
        setHidden(basicGroup, !kana);
        setHidden(rendakuGroup, !kana);
        setHidden(yoonGroup, !kana);
        setHidden(kanaBulkActions, !kana);
        setHidden($('kanaRows'), !kana);
        setHidden(wordPanel, practice !== 'words');
        setHidden(kanjiPanel, practice !== 'kanji');
        setHidden(phrasePanel, practice !== 'phrases');
        setHidden(conjPanel, practice !== 'conj');
        setHidden(grammarPanel, practice !== 'grammar');
        setHidden(readingPanel, practice !== 'reading');
        setHidden(answerModeGroup, !isNamedPractice(practice));
        if (practiceNote) {
            practiceNote.textContent = practice === 'words'
                ? 'Vocabulario del ' + levelName() + '. La lectura va debajo del kanji.'
                : practice === 'kanji'
                    ? 'Kanji del ' + levelName() + '. Lista comunitaria, no oficial.'
                    : practice === 'phrases'
                        ? 'Frases del ' + levelName() + '.'
                        : practice === 'conj'
                            ? 'Verbos del ' + levelName() + '.'
                            : practice === 'grammar'
                                ? 'Patrones del ' + levelName() + '. Lista comunitaria, no oficial.'
                                : practice === 'reading'
                                    ? 'Textos cortos del ' + levelName() + '. No es el examen.'
                                    : 'Hiragana y katakana. El silabario no cambia de nivel.';
        }
        updateLevelUI();
        updateLexDirectionUI();
        updateAnswerModeUI();
        renderLexChips();
        updateExamCount();
        updateMissButton();
    }

    function updateHomeUI() {
        var free = state.home === 'free';
        setHidden($('pathPanel'), free || !!openLessonId);
        setHidden($('freeExam'), !free || !!openLessonId);
        setHidden($('homeBar'), !!openLessonId);
        if (homePathBtn) {
            homePathBtn.classList.toggle('active', !free);
            homePathBtn.setAttribute('aria-pressed', free ? 'false' : 'true');
        }
        if (homeFreeBtn) {
            homeFreeBtn.classList.toggle('active', free);
            homeFreeBtn.setAttribute('aria-pressed', free ? 'true' : 'false');
        }
    }
    function setHome(next) {
        if (exam.active) return;
        state.home = next === 'free' ? 'free' : 'path';
        persistHome();
        updateHomeUI();
    }
    function updateLevelUI() {
        document.querySelectorAll('#homeBar [data-level]').forEach(function (btn) {
            if (!btn) return;
            var on = btn.getAttribute('data-level') === (state.level || 'n5');
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
    }
    function setLevel(level) {
        if (exam.active) return;
        var next = knownLevel(level);
        if (next === state.level) return;
        state.level = next;
        persistLevel();
        reloadLexSelections();
        closeLesson();
        updatePracticeUI();
        renderPath();
    }
    function updateDirectionUI() {
        var reverse = state.direction === Core.DIRECTIONS.ROMAJI_KANA;
        if (directBtn && reverseBtn) {
            directBtn.classList.toggle('active', !reverse);
            reverseBtn.classList.toggle('active', reverse);
            directBtn.setAttribute('aria-pressed', reverse ? 'false' : 'true');
            reverseBtn.setAttribute('aria-pressed', reverse ? 'true' : 'false');
        }
        if (directionNote) {
            directionNote.textContent = reverse
                ? 'Ves el romaji y eliges el kana. El modo estricto no cambia esta dirección.'
                : 'Ves el kana y escribes el romaji.';
        }
    }

    function speechSynth() {
        return window.speechSynthesis || window.webkitSpeechSynthesis || null;
    }
    function UtteranceCtor() {
        return window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance || null;
    }
    function systemSpeech() {
        var synth = speechSynth();
        return !!(synth && typeof synth.speak === 'function' && UtteranceCtor());
    }
    function systemVoices() {
        var synth = speechSynth();
        if (!synth || typeof synth.getVoices !== 'function') return [];
        try { return synth.getVoices() || []; }
        catch (e) { return []; }
    }
    function japaneseVoice() {
        var ja = systemVoices().filter(function (v) { return v && /^ja([-_]|$)/i.test(v.lang || ''); });
        return ja.filter(function (v) { return v.localService; })[0] || null;
    }
    function noteAudio(message) {
        if (quizEls.audioStatus) {
            quizEls.audioStatus.textContent = message || '';
            setHidden(quizEls.audioStatus, !message);
        }
        if (message && audioNote && !exam.active) audioNote.textContent = message;
    }
    var speechGen = 0;
    function stopSpeech() {
        speechGen++;
        try {
            var synth = speechSynth();
            if (synth) synth.cancel();
        } catch (e) { /* el dispositivo no tiene voz */ }
    }
    function speechChunks(text) {
        var src = String(text || '').trim();
        if (!src) return [];
        if (Array.from(src).length <= 80) return [src];
        var out = [];
        var buf = '';
        for (var i = 0; i < src.length; i++) {
            var ch = src.charAt(i);
            buf += ch;
            var end = ch === '。' || ch === '！' || ch === '？';
            var pause = Array.from(buf).length >= 80 && (ch === '、' || ch === '，' || ch === ',' || ch === ' ');
            if (end || pause) {
                if (buf.trim()) out.push(buf.trim());
                buf = '';
            }
        }
        if (buf.trim()) out.push(buf.trim());
        return out.length ? out : [src];
    }
    function speakJapanese(text) {
        if (!text) return false;
        if (!systemSpeech()) {
            noteAudio('Este cliente no expone la síntesis de voz del sistema. El resto del examen sigue disponible.');
            return false;
        }
        var synth = speechSynth();
        try { if (typeof synth.getVoices === 'function') synth.getVoices(); } catch (e) { /* la lista llega en voiceschanged */ }
        var voice = japaneseVoice();
        if (!voice && systemVoices().length) {
            noteAudio('No hay voz japonesa del sistema. Instálala en los ajustes de texto a voz.');
        }
        var busy = false;
        try { busy = synth.speaking || synth.pending; } catch (e) { busy = false; }
        if (busy) stopSpeech();
        else speechGen++;
        var gen = speechGen;
        var chunks = speechChunks(text);
        function fire(retry) {
            if (gen !== speechGen || !chunks.length) return;
            try {
                if (synth.paused) synth.resume();
                var utterance = new (UtteranceCtor())(chunks[0]);
                utterance.lang = 'ja-JP';
                utterance.rate = chunks[0].length > 40 ? 0.92 : 0.88;
                var picked = japaneseVoice();
                if (picked) {
                    utterance.voice = picked;
                    if (exam.active) exam.voiceReadyIndex = exam.index;
                }
                utterance.onend = function () {
                    if (gen !== speechGen) return;
                    chunks.shift();
                    if (chunks.length) fire(false);
                };
                utterance.onerror = function (ev) {
                    if (gen !== speechGen) return;
                    var code = ev && ev.error;
                    if (code === 'interrupted' || code === 'canceled') return;
                    noteAudio('No se pudo reproducir la voz del sistema. Pulsa Oír.');
                };
                synth.speak(utterance);
            } catch (e) {
                if (!retry) noteAudio('No se pudo reproducir la voz del sistema. Pulsa Oír.');
            }
        }
        // El primer speak va en este turno: webxdc y WebKit solo hablan dentro del toque.
        fire(false);
        window.setTimeout(function () {
            if (gen !== speechGen) return;
            try { if (synth.speaking || synth.pending) return; } catch (e) { return; }
            fire(true);
        }, 50);
        return true;
    }
    function speakKana(ch) { return speakJapanese(ch); }
    function updateAudioUI() {
        if (audioOnBtn && audioOffBtn) {
            audioOnBtn.classList.toggle('active', state.audioOn);
            audioOffBtn.classList.toggle('active', !state.audioOn);
            audioOnBtn.setAttribute('aria-pressed', state.audioOn ? 'true' : 'false');
            audioOffBtn.setAttribute('aria-pressed', state.audioOn ? 'false' : 'true');
        }
        if (!audioNote) return;
        if (!systemSpeech()) {
            audioNote.textContent = 'Este cliente no expone la síntesis de voz del sistema. El resto del examen sigue disponible.';
            if (audioTestBtn) audioTestBtn.disabled = true;
            return;
        }
        if (audioTestBtn) audioTestBtn.disabled = false;
        var voice = japaneseVoice();
        var when = state.audioOn
            ? 'La voz del sistema suena al mostrar, además de lo que ves. También puedes pulsar Oír.'
            : 'La voz del sistema solo suena si pulsas Oír.';
        audioNote.textContent = voice
            ? when + ' Voz local: ' + voice.name + '.'
            : when + ' Si no hay voz japonesa instalada, puede no oírse.';
    }
    function maybeSpeak(ch) {
        if (state.audioOn) speakKana(ch);
    }

    // ---------- Examen ----------
    function replaceChildren(node, child) {
        if (node.replaceChildren) node.replaceChildren(child);
        else {
            while (node.firstChild) node.removeChild(node.firstChild);
            node.appendChild(child);
        }
    }

    function mountQuiz() {
        var clone = quizTemplate.content.cloneNode(true);
        replaceChildren(quizArea, clone);

        quizEls.passage = $('passageBox');
        quizEls.kanaChar = $('kanaChar');
        quizEls.hint = $('kanaHint');
        quizEls.input = $('answerInput');
        quizEls.inputArea = $('inputArea');
        quizEls.choiceArea = $('choiceArea');
        quizEls.listenBtn = $('listenBtn');
        quizEls.audioStatus = $('audioStatus');
        quizEls.help = $('quizHelp');
        quizEls.feedback = $('feedbackMsg');
        quizEls.announcer = $('questionAnnouncer');
        quizEls.progress = $('quizProgress');
        quizEls.total = $('quizScore');
        quizEls.skipBtn = $('skipBtn');
        quizEls.nextBtn = $('nextBtn');
        quizEls.exitBtn = $('exitBtn');
        quizEls.exitDialog = $('exitDialog');
        quizEls.exitDialogText = $('exitDialogText');
        quizEls.exitCancelBtn = $('exitCancelBtn');
        quizEls.exitConfirmBtn = $('exitConfirmBtn');

        quizEls.input.addEventListener('keydown', onAnswerKeydown);
        if (quizEls.listenBtn) quizEls.listenBtn.addEventListener('click', function () {
            var item = exam.queue[exam.index];
            if (item) speakItem(item, exam.waitingNext);
        });
        if (quizEls.choiceArea) {
            quizEls.choiceArea.setAttribute('aria-label', exam.practice === 'review' || isLexicon() ? 'Elige la respuesta' : 'Elige el kana');
        }
        if (quizEls.help) {
            quizEls.help.textContent = exam.practice === 'review'
                ? 'Repaso del nivel. Primero lo fallado. Un salto no es un fallo. Tras responder, pulsa Siguiente.'
                : exam.practice === 'reading'
                ? 'Lee el texto y elige. Las teclas 1 a 4 también valen. Tras responder, pulsa Siguiente.'
                : isWrite()
                    ? 'Escribe la respuesta y pulsa Enter. Tras corregir, pulsa Siguiente. Un salto no es un fallo.'
                    : usesChoices()
                        ? 'Elige una opción. Las teclas 1 a 4 también valen. Escuchar reproduce el sonido.'
                        : 'Respuesta en romaji. Tras responder, pulsa Siguiente o Enter. Escuchar reproduce el sonido.';
        }
        quizEls.skipBtn.addEventListener('click', skipQuestion);
        quizEls.nextBtn.addEventListener('click', advanceNow);
        quizEls.exitBtn.addEventListener('click', openExitDialog);
        quizEls.exitCancelBtn.addEventListener('click', closeExitDialog);
        quizEls.exitConfirmBtn.addEventListener('click', confirmExit);
    }

    function onAnswerKeydown(e) {
        if (dialogOpen()) return;
        if (e.key !== 'Enter' && e.key !== 'NumpadEnter') return;
        if (e.isComposing || e.keyCode === 229) return;
        e.preventDefault();
        // La repetición automática de Enter no debe saltarse la corrección
        // que acaba de mostrarse en el primer keydown.
        if (e.repeat) return;
        if (exam.waitingNext) advanceNow();
        else submitAnswer();
    }

    function applyNote(note) {
        if (quizEls.hint) {
            quizEls.hint.textContent = note || '';
            setHidden(quizEls.hint, !note);
        }
        if (quizEls.input && !isReverse()) {
            if (note) quizEls.input.setAttribute('aria-describedby', 'kanaHint');
            else quizEls.input.removeAttribute('aria-describedby');
        }
        return note || '';
    }

    function clearChoices() {
        if (!quizEls.choiceArea) return;
        quizEls.choiceArea.classList.remove('choice-stack');
        if (quizEls.choiceArea.replaceChildren) quizEls.choiceArea.replaceChildren();
        else quizEls.choiceArea.textContent = '';
    }

    function paintChoices(item, locked) {
        clearChoices();
        if (!quizEls.choiceArea || !item.choices) return;
        item.choices.forEach(function (k, i) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'choice-btn';
            btn.lang = 'ja';
            btn.textContent = k.char;
            btn.setAttribute('data-char', k.char);
            btn.setAttribute('aria-label', 'Opción ' + (i + 1) + ', ' + k.char);
            var key = el('span', 'choice-key', String(i + 1));
            key.setAttribute('aria-hidden', 'true');
            btn.appendChild(key);
            if (locked && item.result) {
                btn.disabled = true;
                if (k.char === item.kanaObj.char) btn.classList.add('choice-ok');
                else if (!item.result.skipped && item.result.user === k.char && !item.result.correct) {
                    btn.classList.add('choice-bad');
                }
            } else {
                btn.addEventListener('click', function () { chooseKana(k.char); });
            }
            quizEls.choiceArea.appendChild(btn);
        });
    }

    function markChoicesSettled(item) {
        if (item.reading) paintReading(item);
        else if (item.lex) paintLexChoices(item, true);
        else paintChoices(item, true);
    }

    function clearPromptClasses() {
        if (!quizEls.kanaChar) return;
        quizEls.kanaChar.classList.remove('prompt-romaji', 'prompt-es', 'prompt-long', 'prompt-xlong', 'prompt-sentence', 'prompt-listen');
    }
    function paintLexChoices(item, locked) {
        clearChoices();
        if (!quizEls.choiceArea || !item.choices) return;
        var stack = item.choices.some(function (choice) {
            return Array.from(Lex.view(choice, exam.direction || activeDirection()).choiceText).length > 6;
        });
        quizEls.choiceArea.classList.toggle('choice-stack', stack);
        item.choices.forEach(function (choice, i) {
            var shown = Lex.view(choice, exam.direction || activeDirection());
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'choice-btn choice-lex';
            var choiceLen = Array.from(shown.choiceText).length;
            if (choiceLen > 12) btn.classList.add('choice-sentence');
            else if (choiceLen > 8) btn.classList.add('choice-compact');
            btn.lang = shown.choiceLang;
            btn.textContent = shown.choiceText;
            if (shown.choiceSub) btn.appendChild(el('span', 'choice-sub', shown.choiceSub));
            var key = el('span', 'choice-key', String(i + 1));
            key.setAttribute('aria-hidden', 'true');
            btn.appendChild(key);
            btn.setAttribute('data-id', choice.id);
            btn.setAttribute('aria-label', 'Opción ' + (i + 1) + ', ' + shown.choiceText + (shown.choiceSub ? ', ' + shown.choiceSub : ''));
            if (locked && item.result) {
                btn.disabled = true;
                if (choice.id === item.lex.id) btn.classList.add('choice-ok');
                else if (!item.result.skipped && item.result.user === choice.id && !item.result.correct) {
                    btn.classList.add('choice-bad');
                }
            } else {
                btn.addEventListener('click', function () { chooseOption(choice.id); });
            }
            quizEls.choiceArea.appendChild(btn);
        });
    }
    function hidePassage() {
        if (!quizEls.passage) return;
        quizEls.passage.textContent = '';
        setHidden(quizEls.passage, true);
    }
    function paintPassage(question) {
        if (!quizEls.passage || !question) return;
        if (quizEls.passage.replaceChildren) quizEls.passage.replaceChildren();
        else quizEls.passage.textContent = '';
        quizEls.passage.appendChild(el('p', 'passage-title', question.title));
        var jp = el('p', 'passage-jp', question.jp);
        jp.lang = 'ja';
        quizEls.passage.appendChild(jp);
        var kana = el('p', 'passage-kana', question.kana);
        kana.lang = 'ja';
        quizEls.passage.appendChild(kana);
        setHidden(quizEls.passage, false);
    }
    function paintReading(item) {
        var question = item.reading;
        hidePassage();
        paintPassage(question);
        clearPromptClasses();
        if (quizEls.kanaChar) {
            quizEls.kanaChar.textContent = question.ask;
            quizEls.kanaChar.lang = 'es';
            quizEls.kanaChar.classList.add('prompt-es');
        }
        setHidden(quizEls.inputArea, true);
        setHidden(quizEls.choiceArea, false);
        clearChoices();
        if (quizEls.choiceArea) quizEls.choiceArea.classList.add('choice-stack');
        question.choices.forEach(function (text, i) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'choice-btn choice-lex choice-sentence';
            btn.lang = 'es';
            btn.textContent = text;
            var key = el('span', 'choice-key', String(i + 1));
            key.setAttribute('aria-hidden', 'true');
            btn.appendChild(key);
            btn.setAttribute('data-id', String(i));
            btn.setAttribute('aria-label', 'Opción ' + (i + 1) + ', ' + text);
            if (item.result) {
                btn.disabled = true;
                if (String(i) === String(question.answer)) btn.classList.add('choice-ok');
                else if (!item.result.skipped && item.result.user === String(i) && !item.result.correct) btn.classList.add('choice-bad');
            } else {
                btn.addEventListener('click', function () { chooseOption(String(i)); });
            }
            quizEls.choiceArea.appendChild(btn);
        });
        item.choices = question.choices.map(function (text, i) { return { id: String(i), char: text }; });
        return applyNote('');
    }
    function paintLexiconPrompt(item) {
        var view = lexView(item);
        var write = isWrite();
        hidePassage();
        clearPromptClasses();
        if (quizEls.kanaChar) {
            var reveal = item.result && view.reveal ? view.reveal : view.prompt;
            quizEls.kanaChar.textContent = reveal;
            quizEls.kanaChar.lang = item.result && view.reveal ? 'ja' : view.promptLang;
            if (!item.result && view.reveal) quizEls.kanaChar.classList.add('prompt-listen');
            else if ((item.result && view.reveal) || view.promptLang !== 'es') {
                var len = Array.from(reveal).length;
                if (len > 10) quizEls.kanaChar.classList.add('prompt-sentence');
                else if (len > 6) quizEls.kanaChar.classList.add('prompt-xlong');
                else if (len > 3) quizEls.kanaChar.classList.add('prompt-long');
            } else {
                quizEls.kanaChar.classList.add('prompt-es');
            }
        }
        setHidden(quizEls.inputArea, !write);
        setHidden(quizEls.choiceArea, write);
        if (write && quizEls.input) {
            quizEls.input.lang = view.choiceLang === 'ja' ? 'ja' : 'es';
            quizEls.input.placeholder = view.choiceLang === 'ja'
                ? 'Escribe en japonés o en hiragana'
                : 'Escribe el significado';
            if (!item.result) quizEls.input.value = '';
        }
        if (quizEls.audioStatus) {
            quizEls.audioStatus.textContent = '';
            setHidden(quizEls.audioStatus, true);
        }
        if (!write) paintLexChoices(item, !!item.result);
        var note = lexiconHint(view, !!item.result);
        if (write && !item.result && view.choiceLang === 'ja') {
            note = note ? note + ' · Vale el kanji o el hiragana.' : 'Vale el kanji o el hiragana.';
        }
        return applyNote(note);
    }

    function paintPrompt(item) {
        if (item.reading) return paintReading(item);
        if (item.lex) return paintLexiconPrompt(item);
        hidePassage();
        var reverse = isReverse();
        clearPromptClasses();
        if (quizEls.kanaChar) {
            quizEls.kanaChar.textContent = reverse ? item.kanaObj.romaji : item.kanaObj.char;
            quizEls.kanaChar.lang = reverse ? 'en' : 'ja';
            quizEls.kanaChar.classList.toggle('prompt-romaji', reverse);
        }
        setHidden(quizEls.inputArea, reverse);
        setHidden(quizEls.choiceArea, !reverse);
        if (quizEls.audioStatus) {
            quizEls.audioStatus.textContent = '';
            setHidden(quizEls.audioStatus, true);
        }
        if (reverse) paintChoices(item, !!item.result);
        return applyNote(reverse ? reverseNote(item) : readingNote(item.kanaObj, state.romajiMode));
    }

    function announceQuestion(item, note) {
        if (!quizEls.announcer) return;
        var n = Math.min(exam.index + 1, exam.queue.length);
        var text = 'Pregunta ' + n + ' de ' + exam.queue.length + '. ';
        if (item.reading) {
            text += item.reading.ask + '. Elige la respuesta.';
        } else if (item.lex) {
            var heard = lexView(item);
            text += (heard.reveal && !item.result ? 'Escucha. ' : heard.prompt + '. ') + (isWrite() ? 'Escribe la respuesta.' : 'Elige la respuesta.');
        } else if (isReverse()) {
            text += 'Romaji ' + item.kanaObj.romaji + '. Elige el kana.';
        } else {
            text += 'Carácter ' + item.kanaObj.char + '.';
            if (!note) text += ' Escribe el romaji.';
        }
        if (note) text += ' ' + note;
        quizEls.announcer.textContent = text;
    }

    function unlockAnswerUI() {
        exam.waitingNext = false;
        if (quizEls.input) {
            quizEls.input.readOnly = false;
            quizEls.input.disabled = false;
        }
        if (quizEls.skipBtn) quizEls.skipBtn.disabled = false;
        if (quizEls.nextBtn) quizEls.nextBtn.disabled = true;
    }

    function lockAnswerUI() {
        exam.waitingNext = true;
        if (quizEls.input) {
            quizEls.input.readOnly = true;
            quizEls.input.disabled = false;
        }
        if (quizEls.skipBtn) quizEls.skipBtn.disabled = true;
        if (quizEls.nextBtn) quizEls.nextBtn.disabled = false;
    }

    function armTimer(ms) {
        clearTimer();
        exam.timerId = window.setTimeout(function () {
            exam.timerId = null;
            exam.deadline = null;
            advanceNow();
        }, ms);
    }
    function maybeScheduleAutoAdvance() {
        if (!AUTO_ADVANCE) return;
        exam.deadline = Date.now() + ADVANCE_MS;
        armTimer(ADVANCE_MS);
    }

    var MISS_CAP = 80;
    function missStorageKey(level, practice) {
        if (practice === 'kana') return 'miss.kana';
        return 'miss.' + knownLevel(level) + '.' + practice;
    }
    function loadMissIds(level, practice) {
        var raw = storageGet(missStorageKey(level, practice));
        if (!raw) return [];
        try {
            var parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed.filter(function (id) { return typeof id === 'string' && id.length > 0 && id.length < 120; }).slice(0, MISS_CAP);
        } catch (e) { return []; }
    }
    function saveMissIds(level, practice, ids) {
        storageSet(missStorageKey(level, practice), JSON.stringify(ids.slice(0, MISS_CAP)));
    }
    function noteOutcome(item) {
        if (!item || !item.result || item.result.skipped || !Lex) return;
        var id = item.lex ? item.lex.id : item.reading ? item.reading.id : (item.kanaObj ? item.kanaObj.type + ':' + item.kanaObj.char : '');
        if (!id) return;
        var practice = itemPractice(item);
        if (!practice || practice === 'review') return;
        var missLevel = practice === 'kana' ? 'kana' : knownLevel(exam.level);
        var next = Lex.applyMiss(loadMissIds(missLevel, practice), id, item.result.correct === true, MISS_CAP);
        saveMissIds(missLevel, practice, next);
        seedSeen(knownLevel(exam.level));
        touchSeen(knownLevel(exam.level), practice, id, item.result.correct === true);
        updateMissButton();
        updateReviewButton();
    }
    function visibleMissIds() {
        var practice = state.practice === 'reading' ? 'reading' : (isNamedPractice(state.practice) ? state.practice : 'kana');
        var ids = loadMissIds(practice === 'kana' ? 'kana' : state.level, practice);
        if (practice === 'kana') {
            return ids.filter(function (id) { return id.indexOf(state.currentType + ':') === 0; });
        }
        return ids;
    }
    function updateMissButton() {
        if (!reviewMissBtn) return;
        var n = visibleMissIds().length;
        reviewMissBtn.textContent = n === 1 ? 'Repasar 1 fallo' : 'Repasar fallos (' + n + ')';
        setHidden(reviewMissBtn, n === 0);
    }
    function startMissReview() {
        if (exam.active) return;
        var ids = visibleMissIds();
        if (!ids.length) { updateMissButton(); return; }
        if (loadSavedExam()) {
            var discard = window.confirm('Hay un examen guardado. Si repasas los fallos, se descarta. ¿Continuar?');
            if (!discard) return;
            clearSavedExam();
            refreshResumePanel();
        }
        if (state.practice === 'reading' && Readings) {
            var readingQueue = [];
            ids.forEach(function (id) {
                var question = Readings.findQuestion(id);
                if (question && question.level === state.level) readingQueue.push({ reading: question, userAnswer: null, result: null, choices: null });
            });
            if (!readingQueue.length) { showConfigWarning('Esos fallos ya no están en este nivel.'); return; }
            beginExam(readingQueue, 0, { correct: 0, wrong: 0, skipped: 0, answerMode: 'choice' }, false);
            return;
        }
        if (state.practice === 'kana') {
            var kanaQueue = [];
            ids.forEach(function (id) {
                var cut = id.indexOf(':');
                var kana = Core.findKana(id.slice(0, cut), id.slice(cut + 1));
                if (kana) kanaQueue.push({ kanaObj: kana, userAnswer: null, result: null, choices: null });
            });
            if (!kanaQueue.length) { showConfigWarning('No quedan fallos de este silabario.'); return; }
            if (state.direction === Core.DIRECTIONS.ROMAJI_KANA) Core.ensureChoices(kanaQueue);
            beginExam(kanaQueue, 0, { correct: 0, wrong: 0, skipped: 0 }, false);
            return;
        }
        var pack = bag();
        var catalog = state.practice === 'kanji' ? pack.KANJI
            : state.practice === 'phrases' ? pack.PHRASES
            : state.practice === 'conj' ? pack.CONJ
            : state.practice === 'grammar' ? pack.GRAMMAR
            : pack.WORDS;
        var lexQueue = [];
        ids.forEach(function (id) {
            var found = pack.findById(catalog, id);
            if (found) lexQueue.push({ lex: found, userAnswer: null, result: null, choices: null });
        });
        if (!lexQueue.length) { showConfigWarning('Esos fallos ya no están en este nivel.'); return; }
        if (state.answerMode !== 'write') pack.ensureChoices(lexQueue, activeDirection());
        beginExam(lexQueue, 0, { correct: 0, wrong: 0, skipped: 0, answerMode: state.answerMode }, false);
    }

    var REVIEW_LIMIT = 20;
    var REVIEW_DUE_MS = 3 * 86400000;
    var REVIEW_DIR = {
        words: 'word-es',
        kanji: 'kanji-es',
        phrases: 'phrase-es',
        conj: 'conj-es',
        grammar: 'grammar-es',
        reading: 'lectura',
        kana: 'kana-romaji'
    };
    function seenKey(level) {
        return 'seen.' + knownLevel(level);
    }
    function loadSeenMap(level) {
        var raw = storageGet(seenKey(level));
        if (!raw) return null;
        try {
            var parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
            return parsed;
        } catch (e) { return {}; }
    }
    function saveSeenMap(level, map) {
        storageSet(seenKey(level), JSON.stringify(map));
    }
    function touchSeen(level, practice, id, correct) {
        if (!practice || !id) return;
        var map = loadSeenMap(level) || {};
        map[practice + '\n' + id] = [Date.now(), correct ? 1 : 0];
        saveSeenMap(level, map);
    }
    function seedSeen(level) {
        if (storageGet(seenKey(level)) !== null || !Lessons) return;
        var map = {};
        var progress = loadProgress(level);
        var list = Lessons.lessonsFor ? Lessons.lessonsFor(level) : [];
        var old = Date.now() - REVIEW_DUE_MS - 86400000;
        list.forEach(function (lesson) {
            var row = progress[lesson.id];
            if (!row || row.passed !== true || !lesson.quiz) return;
            var quiz = lesson.quiz;
            if (quiz.practice === 'kana') {
                (quiz.chars || []).forEach(function (ch) {
                    map['kana\n' + quiz.type + ':' + ch] = [old, 1];
                });
            } else if (quiz.practice === 'reading' || isNamedPractice(quiz.practice)) {
                (quiz.ids || []).forEach(function (id) {
                    map[quiz.practice + '\n' + id] = [old, 1];
                });
            }
        });
        saveSeenMap(level, map);
    }
    function seenRows(level) {
        var map = loadSeenMap(level) || {};
        return Object.keys(map).map(function (key) {
            var cut = key.indexOf('\n');
            var rec = map[key];
            if (cut < 1 || !Array.isArray(rec) || typeof rec[0] !== 'number') return null;
            return { practice: key.slice(0, cut), id: key.slice(cut + 1), t: rec[0], ok: rec[1] === 1 };
        }).filter(Boolean);
    }
    function reviewMisses(level) {
        var lists = ['words', 'kanji', 'phrases', 'conj', 'grammar', 'reading'].map(function (practice) {
            return loadMissIds(level, practice).map(function (id) {
                return { id: id, practice: practice };
            });
        });
        var seen = loadSeenMap(level) || {};
        lists.push(loadMissIds('kana', 'kana').filter(function (id) {
            return !!seen['kana\n' + id];
        }).map(function (id) {
            return { id: id, practice: 'kana' };
        }));
        var rows = [];
        var more = true;
        while (more) {
            more = false;
            lists.forEach(function (list) {
                if (!list.length) return;
                rows.push(list.shift());
                more = true;
            });
        }
        return rows;
    }
    function reviewPlan(level) {
        seedSeen(level);
        if (!Core.planReview) return [];
        return Core.planReview(reviewMisses(level), seenRows(level), Date.now(), {
            limit: REVIEW_LIMIT,
            dueMs: REVIEW_DUE_MS
        });
    }
    function buildReviewItem(level, row) {
        if (!row || !row.id || !row.practice) return null;
        var direction = REVIEW_DIR[row.practice];
        if (!direction) return null;
        if (row.practice === 'kana') {
            var cut = row.id.indexOf(':');
            if (cut < 1) return null;
            var kana = Core.findKana(row.id.slice(0, cut), row.id.slice(cut + 1));
            if (!kana) return null;
            return { kanaObj: kana, reviewPractice: 'kana', reviewDirection: direction, userAnswer: null, result: null, choices: null };
        }
        if (row.practice === 'reading') {
            if (!Readings || typeof Readings.findQuestion !== 'function') return null;
            var question = Readings.findQuestion(row.id);
            if (!question || question.level !== level) return null;
            return { reading: question, reviewPractice: 'reading', reviewDirection: direction, userAnswer: null, result: null, choices: null };
        }
        if (!isNamedPractice(row.practice) || !Lex) return null;
        var pack = Lex.forLevel(level);
        var catalog = row.practice === 'kanji' ? pack.KANJI
            : row.practice === 'phrases' ? pack.PHRASES
            : row.practice === 'conj' ? pack.CONJ
            : row.practice === 'grammar' ? pack.GRAMMAR
            : pack.WORDS;
        var found = pack.findById(catalog, row.id);
        if (!found) return null;
        var item = { lex: found, reviewPractice: row.practice, reviewDirection: direction, userAnswer: null, result: null, choices: null };
        if (Array.isArray(row.choices) && row.choices.length) {
            var restored = [];
            row.choices.forEach(function (id) {
                if (typeof id !== 'string') return;
                var choice = pack.findById(catalog, id);
                if (choice) restored.push(choice);
            });
            if (restored.some(function (choice) { return choice.id === found.id; })) item.choices = restored;
        }
        if (!item.choices) pack.ensureChoices([item], direction);
        return item;
    }
    function updateReviewButton() {
        if (!reviewDueBtn) return;
        var plan = reviewPlan(state.level);
        var misses = plan.filter(function (row) { return row.reason === 'miss'; }).length;
        var due = plan.length - misses;
        reviewDueBtn.disabled = plan.length === 0;
        reviewDueBtn.textContent = plan.length
            ? 'Repaso de hoy · ' + plan.length
            : 'Repaso de hoy';
        if (reviewDueNote) {
            reviewDueNote.textContent = plan.length
                ? (misses ? misses + (misses === 1 ? ' fallo' : ' fallos') : 'Sin fallos pendientes')
                    + (due ? ' · ' + due + ' de hace días' : '')
                    + '. Unos 10 minutos. No es el examen.'
                : 'Nada pendiente en este nivel. Lo fallado vuelve al momento. Lo acertado, a los 3 días.';
        }
    }
    function startReview() {
        if (exam.active || !Lex) return;
        var plan = reviewPlan(state.level);
        if (!plan.length) { updateReviewButton(); return; }
        if (loadSavedExam()) {
            var discard = window.confirm('Hay un examen guardado. Si empiezas el repaso, se descarta. ¿Continuar?');
            if (!discard) return;
            clearSavedExam();
            refreshResumePanel();
        }
        var queue = [];
        plan.forEach(function (row) {
            var item = buildReviewItem(state.level, row);
            if (item) queue.push(item);
        });
        if (!queue.length) {
            showConfigWarning('Esos repasos ya no están en este nivel.');
            return;
        }
        closeLesson();
        beginExam(queue, 0, {
            correct: 0, wrong: 0, skipped: 0,
            answerMode: 'choice',
            practice: 'review',
            level: state.level
        }, false);
    }

    function beginExam(queue, index, counters, waiting, lessonId) {
        exam.active = true;
        exam.queue = queue;
        exam.index = index || 0;
        exam.correct = counters.correct || 0;
        exam.wrong = counters.wrong || 0;
        exam.skipped = counters.skipped || 0;
        exam.waitingNext = false;
        exam.deadline = null;
        exam.lessonId = typeof lessonId === 'string' ? lessonId : '';
        exam.level = counters && counters.level ? knownLevel(counters.level) : knownLevel(state.level);
        if (counters && counters.practice === 'review') {
            exam.practice = 'review';
            exam.direction = 'repaso';
            exam.answerMode = 'choice';
            exam.lessonId = '';
        } else {
            exam.practice = state.practice === 'reading' ? 'reading' : (isNamedPractice(state.practice) ? state.practice : 'kana');
            exam.direction = state.practice === 'reading' ? 'lectura' : activeDirection();
            exam.answerMode = counters && counters.answerMode === 'write' ? 'write'
                : counters && counters.answerMode === 'choice' ? 'choice'
                : (state.answerMode === 'write' ? 'write' : 'choice');
        }
        exam.spokenPassage = '';
        exam.voiceReadyIndex = -1;
        clearTimer();
        setHidden(optionsPanel, true);
        setHidden(quizArea, false);
        mountQuiz();
        if (waiting) showSettledQuestion();
        else renderQuestion();
    }

    function startExam() {
        if (exam.active) return;
        clearTimer();
        clearConfigWarning();
        if (loadSavedExam()) {
            var discard = window.confirm('Hay un examen guardado. Si empiezas otro, se descarta. ¿Continuar?');
            if (!discard) return;
            clearSavedExam();
            refreshResumePanel();
        }

        if (state.practice === 'reading') {
            startReadingExam();
            return;
        }
        if (isNamedPractice(state.practice)) {
            if (activeDirection() === 'listen-es' && !systemSpeech()) {
                showConfigWarning('Este cliente no expone la síntesis de voz del sistema. Elige otra dirección: el resto sigue disponible.');
                return;
            }
            startLexiconExam();
            return;
        }

        var sel = state.selections[state.currentType];
        if (sel.basic.size + sel.rendaku.size + sel.yoon.size === 0) {
            showConfigWarning('Selecciona al menos una fila básica, un grupo sonoro o de yōon.');
            return;
        }
        var queue = Core.buildQueue(state.currentType, sel.basic, sel.rendaku, sel.yoon);
        if (queue.length === 0) {
            showConfigWarning('No hay caracteres disponibles con esa selección.');
            return;
        }
        if (state.direction === Core.DIRECTIONS.ROMAJI_KANA) Core.ensureChoices(queue);
        beginExam(queue, 0, { correct: 0, wrong: 0, skipped: 0 }, false);
    }

    function startReadingExam() {
        if (!Readings) { showConfigWarning('No se cargó la lectura.'); return; }
        var questions = Readings.questionsFor(state.level);
        if (!questions.length) { showConfigWarning('Este nivel no tiene textos.'); return; }
        var queue = Lex.shuffle(questions).map(function (question) {
            return { reading: question, userAnswer: null, result: null, choices: null };
        });
        beginExam(queue, 0, { correct: 0, wrong: 0, skipped: 0, answerMode: 'choice' }, false);
    }

    function startLexiconExam() {
        var groups = state.practice === 'kanji' ? state.kanjiGroups
            : state.practice === 'phrases' ? state.phraseGroups
            : state.practice === 'conj' ? state.conjGroups
            : state.practice === 'grammar' ? state.grammarGroups
            : state.wordGroups;
        if (!groups || !groups.size) {
            showConfigWarning(state.practice === 'conj' ? 'Selecciona al menos un verbo.' : 'Selecciona al menos un tema.');
            return;
        }
        var queue = bag().buildQueue(state.practice, groups, activeDirection());
        if (!queue.length) {
            showConfigWarning('No hay preguntas con esa selección.');
            return;
        }
        beginExam(queue, 0, { correct: 0, wrong: 0, skipped: 0 }, false);
    }

    function resumeExam() {
        var saved = loadSavedExam();
        if (!saved) { refreshResumePanel(); return; }
        if (saved.practice === 'review') {
            if (saved.level && knownLevel(saved.level) === saved.level) {
                state.level = saved.level;
                persistLevel();
                reloadLexSelections();
            }
        } else if (saved.practice === 'reading') {
            state.practice = 'reading';
            persistPractice();
        } else if (isNamedPractice(saved.practice)) {
            state.practice = saved.practice;
            if (saved.practice === 'words') state.wordDirection = saved.direction;
            else if (saved.practice === 'kanji') state.kanjiDirection = saved.direction;
            else if (saved.practice === 'conj') state.conjDirection = saved.direction;
            else if (saved.practice === 'grammar') state.grammarDirection = saved.direction;
            else state.phraseDirection = saved.direction;
            persistPractice();
            persistWordDirection();
            persistKanjiDirection();
            persistPhraseDirection();
            persistConjDirection();
            persistGrammarDirection();
        } else {
            state.practice = 'kana';
            state.currentType = saved.type;
            state.romajiMode = saved.mode;
            state.direction = saved.direction || Core.DEFAULT_DIRECTION;
            persistPractice();
            persistType();
            persistMode();
            persistDirection();
        }
        if (saved.answerMode === 'write' || saved.answerMode === 'choice') {
            state.answerMode = saved.answerMode;
            persistAnswerMode();
        }
        if (saved.level && knownLevel(saved.level) === saved.level) {
            state.level = saved.level;
            persistLevel();
            reloadLexSelections();
        }
        updatePracticeUI();
        closeLesson();
        beginExam(saved.queue, saved.index, saved, saved.waitingNext, saved.lessonId || '');
    }

    function discardSaved() {
        if (!loadSavedExam()) { refreshResumePanel(); return; }
        if (!window.confirm('¿Descartar el examen guardado?')) return;
        clearSavedExam();
        refreshResumePanel();
    }

    function renderQuestion() {
        if (!exam.active) return;
        if (exam.index >= exam.queue.length) { finishExam(); return; }
        var item = exam.queue[exam.index];
        if (item.result) { showSettledQuestion(); return; }
        clearTimer();
        unlockAnswerUI();
        var note = paintPrompt(item);
        if (quizEls.input) quizEls.input.value = '';
        setFeedback(usesChoices(item)
            ? (item.kanaObj && !item.lex && !item.reading ? 'Elige el kana.' : 'Elige la respuesta.')
            : (isWrite() ? 'Escribe la respuesta y pulsa Enter.' : 'Escribe el romaji y pulsa Enter.'));
        updateStatsUI();
        announceQuestion(item, note);
        if (usesChoices()) {
            if (quizEls.listenBtn) quizEls.listenBtn.focus();
        } else if (quizEls.input) {
            quizEls.input.focus();
        }
        saveExam();
        if (item.reading || item.lex) maybeSpeakItem(item, false);
        else if (item.kanaObj) maybeSpeak(item.kanaObj.char);
    }

    function showSettledQuestion() {
        if (!exam.active) return;
        var item = exam.queue[exam.index];
        if (!item || !item.result) { renderQuestion(); return; }
        clearTimer();
        var note = paintPrompt(item);
        if (quizEls.input) quizEls.input.value = usesChoices() ? '' : (item.result.user || '');
        lockAnswerUI();
        setFeedback(feedbackFor(item), resultKind(item));
        updateStatsUI();
        announceQuestion(item, note);
        if (item.lex) maybeSpeakItem(item, true);
        saveExam();
        maybeScheduleAutoAdvance();
        if (quizEls.nextBtn) quizEls.nextBtn.focus();
    }

    function submitAnswer() {
        if (!exam.active || exam.waitingNext || dialogOpen()) return;
        if (exam.index >= exam.queue.length || usesChoices()) return;

        var item = exam.queue[exam.index];
        var result = item.lex
            ? Lex.checkWritten(item.lex, exam.direction, quizEls.input.value)
            : Core.checkAnswer(item.kanaObj, quizEls.input.value, state.romajiMode);
        if (result.empty) {
            setFeedback('Escribe una respuesta o pulsa Saltar.');
            return;
        }

        item.userAnswer = result.user;
        item.result = result;
        if (result.correct) exam.correct++;
        else exam.wrong++;
        lockAnswerUI();
        setFeedback(feedbackFor(item), resultKind(item));
        updateStatsUI();
        noteOutcome(item);
        saveExam();
        maybeScheduleAutoAdvance();
    }

    function skipQuestion() {
        if (!exam.active || exam.waitingNext || dialogOpen()) return;
        if (exam.index >= exam.queue.length) return;
        var item = exam.queue[exam.index];
        item.userAnswer = null;
        item.result = item.reading
            ? { user: '', expected: String(item.reading.answer), correct: false, empty: false, skipped: true }
            : item.lex
            ? { user: '', expected: item.lex.id, correct: false, empty: false, skipped: true }
            : Core.markSkipped(item.kanaObj);
        exam.skipped++;
        if (usesChoices()) markChoicesSettled(item);
        lockAnswerUI();
        setFeedback(feedbackFor(item), 'skip');
        updateStatsUI();
        saveExam();
        if (item.lex) maybeSpeakItem(item, true);
        maybeScheduleAutoAdvance();
        if (!usesChoices() && quizEls.input) quizEls.input.focus();
    }

    function chooseOption(id) {
        if (!exam.active || exam.waitingNext || dialogOpen() || !usesChoices()) return;
        if (exam.index >= exam.queue.length) return;
        var item = exam.queue[exam.index];
        var result = item.reading ? Readings.check(item.reading, id)
            : item.lex ? Lex.checkChoice(item.lex, id)
            : Core.checkChoice(item.kanaObj, id);
        if (result.empty) return;
        item.userAnswer = result.user;
        item.result = result;
        if (result.correct) exam.correct++;
        else exam.wrong++;
        noteOutcome(item);
        markChoicesSettled(item);
        lockAnswerUI();
        setFeedback(feedbackFor(item), resultKind(item));
        updateStatsUI();
        saveExam();
        if (item.lex) maybeSpeakItem(item, true);
        maybeScheduleAutoAdvance();
    }
    function chooseKana(ch) { chooseOption(ch); }

    function advanceNow() {
        if (!exam.active || !exam.waitingNext || dialogOpen()) return;
        stopSpeech();
        clearTimer();
        exam.deadline = null;
        exam.waitingNext = false;
        exam.index++;
        if (exam.index < exam.queue.length) renderQuestion();
        else finishExam();
    }

    function openExitDialog() {
        if (!exam.active || !quizEls.exitDialog) return;
        stopSpeech();
        clearTimer();
        if (quizEls.exitDialogText) {
            quizEls.exitDialogText.textContent = storageOk
                ? 'El progreso queda guardado en este dispositivo. Podrás continuar desde la pantalla inicial.'
                : 'Aquí no se puede guardar el progreso. Si sales, esta sesión se pierde.';
        }
        if (quizEls.exitConfirmBtn) {
            quizEls.exitConfirmBtn.textContent = storageOk ? 'Salir y guardar' : 'Salir sin guardar';
        }
        setHidden(quizEls.exitDialog, false);
        if (quizEls.exitCancelBtn) quizEls.exitCancelBtn.focus();
    }
    function closeExitDialog() {
        setHidden(quizEls.exitDialog, true);
        if (quizEls.exitBtn) quizEls.exitBtn.focus();
    }
    function confirmExit() {
        closeExitDialog();
        exitExam();
    }

    function onDocumentKeydown(e) {
        if (!dialogOpen() && exam.active && exam.waitingNext && !e.repeat &&
            (e.key === 'Enter' || e.key === 'NumpadEnter') && e.target !== quizEls.input) {
            if (e.isComposing || e.keyCode === 229) return;
            e.preventDefault();
            advanceNow();
            return;
        }
        if (!dialogOpen() && exam.active && usesChoices() && !exam.waitingNext && !e.repeat) {
            var index = { '1': 0, '2': 1, '3': 2, '4': 3 }[e.key];
            var item = exam.queue[exam.index];
            if (index !== undefined && item && item.choices && item.choices[index]) {
                e.preventDefault();
                var choice = item.choices[index];
                chooseOption(choice.id || choice.char);
                return;
            }
        }
        if (!dialogOpen()) return;
        if (e.key === 'Escape') {
            e.preventDefault();
            closeExitDialog();
            return;
        }
        if (e.key !== 'Tab' || !quizEls.exitDialog) return;
        var nodes = quizEls.exitDialog.querySelectorAll('button');
        if (!nodes.length) return;
        var first = nodes[0];
        var last = nodes[nodes.length - 1];
        if (!quizEls.exitDialog.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
            return;
        }
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    var lastShareAt = 0;
    function shareInterval() {
        var interval = 10000;
        try {
            var n = window.webxdc && window.webxdc.sendUpdateInterval;
            if (typeof n === 'number' && isFinite(n) && n >= 0 && n <= 60000) interval = n;
        } catch (e) { /* el cliente no publica el intervalo */ }
        return interval;
    }
    function currentLessonShare() {
        if (!exam.lessonId || !Lessons || typeof Lessons.locate !== 'function') return null;
        var found = Lessons.locate(exam.lessonId);
        if (!found || !found.lesson) return null;
        return {
            title: found.lesson.title,
            number: found.number,
            level: found.level,
            pass: Lessons.PASS_PERCENT
        };
    }
    function shareTextsFor(total) {
        var lesson = currentLessonShare();
        if (lesson && Core.buildLessonShareText) return Core.buildLessonShareText(exam.correct, total, lesson);
        return Core.buildShareText(exam.correct, total, shareScope(), exam.direction || state.direction);
    }
    function shareResultToChat(total, texts) {
        var ready = texts || shareTextsFor(total);
        var lesson = currentLessonShare();
        var selfName = '';
        try { selfName = (window.webxdc && window.webxdc.selfName) || ''; }
        catch (e) { selfName = ''; }
        selfName = String(selfName).replace(/[\r\n]+/g, ' ').trim();
        window.webxdc.sendUpdate({
            payload: {
                kind: 'nihongodojo-score',
                practice: exam.practice || 'kana',
                syllabary: shareScope(),
                lessonId: exam.lessonId || '',
                lessonNumber: lesson ? lesson.number : 0,
                lessonTitle: lesson ? lesson.title : '',
                mode: state.romajiMode,
                direction: exam.direction || state.direction,
                correct: exam.correct,
                wrong: exam.wrong,
                skipped: exam.skipped,
                total: total,
                percent: total === 0 ? 0 : (exam.correct / total) * 100,
                selfName: selfName
            },
            info: ready.info,
            summary: ready.summary
        }, '');
        lastShareAt = Date.now();
        return ready;
    }

    function resultStatus(item) {
        if (item.result && item.result.skipped) return 'Saltada';
        if (item.result && item.result.correct) return 'Correcta';
        return 'Fallo';
    }
    function shownAnswer(item) {
        if (item.result && item.result.skipped) return '—';
        if (item.result && item.result.user) return truncate(item.result.user, 40);
        return '—';
    }
    function buttonWithIcon(className, icon, label) {
        var btn = el('button', className);
        btn.type = 'button';
        var ico = el('span', null, icon);
        ico.setAttribute('aria-hidden', 'true');
        btn.appendChild(ico);
        btn.appendChild(document.createTextNode(' ' + label));
        return btn;
    }

    function reviewLabel() {
        if (exam.wrong && exam.skipped) return 'Repasar fallos y saltadas';
        if (exam.skipped) return 'Repasar saltadas';
        return 'Repasar fallos';
    }

    function reviewMistakes() {
        var misses = exam.queue.filter(function (item) {
            return item.result && !item.result.correct;
        });
        if (!misses.length) return;
        if (exam.practice === 'review') {
            var again = misses.map(function (item) {
                return {
                    kanaObj: item.kanaObj || null,
                    lex: item.lex || null,
                    reading: item.reading || null,
                    reviewPractice: item.reviewPractice,
                    reviewDirection: item.reviewDirection,
                    userAnswer: null,
                    result: null,
                    choices: null
                };
            });
            again.forEach(function (item) {
                if (!item.lex || !Lex) return;
                Lex.forLevel(exam.level).ensureChoices([item], item.reviewDirection);
            });
            clearSavedExam();
            beginExam(again, 0, {
                correct: 0, wrong: 0, skipped: 0,
                answerMode: 'choice',
                practice: 'review',
                level: exam.level
            }, false);
            return;
        }
        if (isLexicon()) {
            var lexQueue = Lex.shuffle(misses.map(function (item) { return item.lex; })).map(function (lex) {
                return { lex: lex, userAnswer: null, result: null, choices: null };
            });
            Lex.ensureChoices(lexQueue, exam.direction || activeDirection());
            clearSavedExam();
            beginExam(lexQueue, 0, { correct: 0, wrong: 0, skipped: 0 }, false);
            return;
        }
        var queue = Core.shuffle(misses.map(function (item) { return item.kanaObj; })).map(function (k) {
            return { kanaObj: k, userAnswer: null, result: null, choices: null };
        });
        if (isReverse()) Core.ensureChoices(queue);
        clearSavedExam();
        beginExam(queue, 0, { correct: 0, wrong: 0, skipped: 0 }, false);
    }

    function finishExam() {
        stopSpeech();
        clearTimer();
        exam.active = false;
        exam.waitingNext = false;
        exam.deadline = null;
        clearSavedExam();

        var total = exam.queue.length;
        var percent = total === 0 ? 0 : (exam.correct / total) * 100;
        var scope = shareScope();
        var way = isLexicon() && Lex
            ? Lex.directionLabel(exam.direction)
            : directionLabel(exam.direction || state.direction);
        var modeLabel = state.romajiMode === Core.MODES.STRICT ? 'estricto' : 'flexible';

        var card = el('div', 'quiz-card');
        var summary = el('div', 'summary');
        summary.appendChild(el('h3', null, 'Resultado final'));
        summary.appendChild(el('p', null, exam.practice === 'review'
            ? (exam.level || state.level || 'n5').toUpperCase() + ' · repaso · no es el examen'
            : isLexicon()
            ? levelName() + ' · ' + scope + ' · ' + way
            : scope + ' · ' + way + ' · modo ' + modeLabel));
        summary.appendChild(el('p', null,
            plural(exam.correct, 'acierto', 'aciertos') + ' · ' +
            plural(exam.wrong, 'fallo', 'fallos') + ' · ' +
            plural(exam.skipped, 'saltada', 'saltadas') + ' · ' +
            plural(total, 'pregunta', 'preguntas')));
        var grade = el('p');
        grade.appendChild(el('strong', null, 'Calificación: ' + percent.toFixed(1) + '% '));
        grade.appendChild(document.createTextNode(percent >= 70 ? 'Muy bien.' : 'Sigue practicando.'));
        summary.appendChild(grade);
        var lessonLine = lessonResultLine(percent);
        if (lessonLine) summary.appendChild(el('p', null, lessonLine));
        summary.appendChild(document.createElement('hr'));

        var list = el('ol', 'results-list');
        exam.queue.forEach(function (item) {
            var li = el('li');
            if (item.reading) {
                var question = item.reading;
                var picked = item.result && !item.result.skipped ? question.choices[Number(item.result.user)] : '—';
                li.appendChild(document.createTextNode(resultStatus(item) + '. ' + question.ask + ' → ' + question.choices[question.answer] + '. Tú: ' + (picked || '—')));
                list.appendChild(li);
                return;
            }
            if (item.lex) {
                var view = lexView(item);
                var yours = item.result && item.result.skipped
                    ? '—'
                    : item.result && item.result.written
                        ? (item.result.user || '—')
                        : (examPack().textForId(itemPractice(item), item.result && item.result.user, itemDirection(item)) || '—');
                var prompt = item.result && view.reveal ? view.reveal : view.prompt;
                li.appendChild(document.createTextNode(resultStatus(item) + '. ' + prompt + ' → ' + view.answer + '. Tú: ' + yours));
                list.appendChild(li);
                return;
            }
            var k = item.kanaObj;
            var answer = shownAnswer(item);
            if (isReverse()) {
                li.appendChild(document.createTextNode(resultStatus(item) + '. ' + k.romaji + ' → '));
                var glyph = el('span', null, k.char);
                glyph.lang = 'ja';
                li.appendChild(glyph);
                li.appendChild(document.createTextNode('. Tú: '));
                if (answer !== '—') {
                    var yours = el('span', null, answer);
                    yours.lang = 'ja';
                    li.appendChild(yours);
                } else {
                    li.appendChild(document.createTextNode(answer));
                }
            } else {
                li.appendChild(document.createTextNode(resultStatus(item) + '. '));
                var ch = el('span', null, k.char);
                ch.lang = 'ja';
                li.appendChild(ch);
                li.appendChild(document.createTextNode(' → ' + k.romaji + '. Tú: ' + answer));
            }
            list.appendChild(li);
        });
        summary.appendChild(list);

        var reviewBtn = null;
        if (exam.wrong + exam.skipped > 0) {
            reviewBtn = buttonWithIcon('btn btn-primary btn-block', '🔁', reviewLabel());
            reviewBtn.addEventListener('click', reviewMistakes);
            summary.appendChild(reviewBtn);
        }

        var restartBtn = buttonWithIcon('btn restart-btn', '🔄', exam.lessonId || exam.practice === 'review' ? 'Volver al camino' : 'Nuevo examen');
        restartBtn.addEventListener('click', exitExam);
        summary.appendChild(restartBtn);

        if (webxdcAvailable()) {
            var shareBtn = buttonWithIcon('btn share-btn', '📤', 'Compartir en el chat');
            var shareNote = el('p', 'mode-note', '');
            var sent = false;
            shareBtn.addEventListener('click', function () {
                if (sent) return;
                sent = true;
                shareBtn.disabled = true;
                var texts = shareTextsFor(total);
                var wait = Math.max(0, shareInterval() - (Date.now() - lastShareAt));
                function go() {
                    try {
                        var sentTexts = shareResultToChat(total, texts);
                        shareBtn.textContent = 'Enviado al chat';
                        shareNote.textContent = sentTexts.info;
                    } catch (e) {
                        sent = false;
                        shareBtn.disabled = false;
                        shareBtn.textContent = 'No se pudo enviar. Reintentar';
                        shareNote.textContent = '';
                    }
                }
                if (wait > 0) {
                    shareBtn.textContent = 'Se envía en ' + Math.ceil(wait / 1000) + ' s';
                    window.setTimeout(go, wait);
                } else {
                    go();
                }
            });
            summary.appendChild(shareBtn);
            summary.appendChild(shareNote);
        }

        card.appendChild(summary);
        card.appendChild(el('div', 'small-note', exam.practice === 'review'
            ? 'El repaso no marca lecciones. Un acierto lo quita de los fallos. Lo acertado vuelve a los 3 días.'
            : exam.lessonId
            ? 'El camino recuerda si superaste la lección. Un intento peor no borra una ya superada.'
            : isLexicon()
                ? 'Podrás elegir temas nuevamente.'
                : 'Podrás elegir filas básicas, sonoras y yōon nuevamente.'));
        replaceChildren(quizArea, card);
        quizEls = emptyQuizEls();
        (reviewBtn || restartBtn).focus();
    }

    function webxdcAvailable() {
        return typeof window !== 'undefined' &&
            window.webxdc && typeof window.webxdc.sendUpdate === 'function';
    }
    function canSendToChat() {
        try { return !!(window.webxdc && typeof window.webxdc.sendToChat === 'function'); }
        catch (e) { return false; }
    }
    function canImportFiles() {
        try { return !!(window.webxdc && typeof window.webxdc.importFiles === 'function'); }
        catch (e) { return false; }
    }
    function setBackupNote(text) {
        if (backupNote) backupNote.textContent = text || '';
    }
    function eachStoredName(fn) {
        if (!storageOk || !window.localStorage) return;
        var names = [];
        try {
            for (var i = 0; i < window.localStorage.length; i++) {
                var full = window.localStorage.key(i);
                if (full && full.indexOf(STORAGE_PREFIX) === 0) names.push(full.slice(STORAGE_PREFIX.length));
            }
        } catch (e) { return; }
        names.forEach(fn);
    }
    function collectBackupEntries() {
        var out = {};
        eachStoredName(function (name) {
            if (name === 'probe') return;
            var value = storageGet(name);
            if (typeof value === 'string') out[name] = value;
        });
        return out;
    }
    function downloadBackup(name, json) {
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    }
    function exportBackup() {
        if (!Core.buildBackup) return;
        var entries = collectBackupEntries();
        var exportedAt = new Date().toISOString();
        var backup = Core.buildBackup(entries, { app: APP_VERSION, exportedAt: exportedAt });
        if (!backup) {
            setBackupNote('No hay progreso que copiar.');
            return;
        }
        var json = JSON.stringify(backup);
        var name = Core.backupFileName(exportedAt);
        var text = Core.backupChatText(Core.backupSummary(backup.keys));
        if (canSendToChat()) {
            if (exportBackupBtn) exportBackupBtn.disabled = true;
            setBackupNote('Elige el chat. Mensajes guardados sirve. En la versión nueva, pulsa Restaurar copia.');
            window.webxdc.sendToChat({
                file: { name: name, plainText: json },
                text: text
            }).then(function () {
                if (exportBackupBtn) exportBackupBtn.disabled = false;
                setBackupNote('Copia lista. En la versión nueva, pulsa Restaurar copia.');
            }).catch(function () {
                if (exportBackupBtn) exportBackupBtn.disabled = false;
                setBackupNote('No se mandó la copia. Si cancelaste, no pasa nada. Si no, inténtalo otra vez.');
            });
            return;
        }
        downloadBackup(name, json);
        setBackupNote('Este cliente no manda archivos al chat. Se descargó la copia. En la versión nueva, pulsa Restaurar copia.');
    }
    function applyBackupText(text) {
        var data;
        try { data = JSON.parse(text); }
        catch (e) {
            setBackupNote('Ese archivo no es una copia de NihongoDojo.');
            return;
        }
        var parsed = Core.parseBackup ? Core.parseBackup(data) : null;
        if (!parsed) {
            setBackupNote('Esa copia no se puede restaurar.');
            return;
        }
        var line = Core.backupLine(Core.backupSummary(parsed.keys));
        if (!window.confirm('Restaurar sustituye el progreso de este dispositivo. ' + line + ' ¿Continuar?')) return;
        eachStoredName(function (name) {
            if (name !== 'probe') storageRemove(name);
        });
        Object.keys(parsed.keys).forEach(function (name) {
            storageSet(name, parsed.keys[name]);
        });
        window.location.reload();
    }
    function readBackupFile(file) {
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () { applyBackupText(String(reader.result || '')); };
        reader.onerror = function () { setBackupNote('No se pudo leer la copia.'); };
        reader.readAsText(file);
    }
    function importBackup() {
        if (canImportFiles()) {
            window.webxdc.importFiles({
                extensions: ['.json'],
                mimeTypes: ['application/json', 'text/plain']
            }).then(function (files) {
                if (files && files.length) readBackupFile(files[0]);
            }).catch(function () {
                setBackupNote('No se pudo abrir la copia.');
            });
            return;
        }
        if (backupFile) backupFile.click();
    }
    function updateBackupUI() {
        if (!exportBackupBtn) return;
        var lead = document.querySelector('#backupBar > .mode-note');
        if (canSendToChat()) {
            exportBackupBtn.textContent = 'Mandar copia al chat';
            return;
        }
        exportBackupBtn.textContent = 'Descargar copia';
        if (lead) lead.textContent = 'Al cambiar de versión, este dispositivo no se lleva el progreso. Descarga la copia y ábrela en la versión nueva con Restaurar copia.';
    }

    function exitExam() {
        stopSpeech();
        clearTimer();
        if (exam.active) saveExam();
        exam.active = false;
        exam.waitingNext = false;
        exam.deadline = null;
        exam.direction = null;
        exam.practice = null;
        exam.lessonId = '';
        exam.queue = [];
        exam.index = 0;
        exam.correct = 0;
        exam.wrong = 0;
        exam.skipped = 0;
        quizEls = emptyQuizEls();
        setHidden(quizArea, true);
        setHidden(optionsPanel, false);
        renderChips();
        updateTypeButtonsUI();
        updateModeButtonsUI();
        updateDirectionUI();
        updatePracticeUI();
        updateAudioUI();
        closeLesson();
        renderPath();
        refreshResumePanel();
        if (startBtn) startBtn.focus();
    }

    function truncate(text, max) {
        if (typeof text !== 'string') return '—';
        return text.length <= max ? text : text.slice(0, max - 1) + '…';
    }

    function onPageHide() {
        if (exam.active) saveExam();
    }
    function onVisibility() {
        if (document.hidden) {
            if (exam.active) saveExam();
            if (exam.timerId !== null) clearTimer();
            return;
        }
        if (exam.active && exam.waitingNext && AUTO_ADVANCE && exam.deadline) {
            armTimer(Math.max(0, exam.deadline - Date.now()));
        }
    }

    function loadProgress(level) {
        var out = {};
        if (!Lessons) return out;
        var use = level || state.level || 'n5';
        var raw = storageGet(progressKey(use));
        if (!raw) return out;
        try {
            var data = JSON.parse(raw);
            if (!data || typeof data !== 'object') return out;
            var list = Lessons.lessonsFor ? Lessons.lessonsFor(use) : Lessons.LESSONS;
            list.forEach(function (lesson) {
                var row = data[lesson.id];
                if (!row || typeof row !== 'object') return;
                var best = Number(row.best);
                var last = Number(row.last);
                out[lesson.id] = {
                    passed: row.passed === true,
                    best: Number.isFinite(best) ? Math.max(0, Math.min(100, Math.round(best))) : 0,
                    last: Number.isFinite(last) ? Math.max(0, Math.min(100, Math.round(last))) : 0
                };
            });
        } catch (e) { return {}; }
        return out;
    }
    function recordLesson(id, percent) {
        if (!Lessons || !Lessons.findLesson(id)) return;
        var lesson = Lessons.findLesson(id);
        var use = lesson && lesson.level ? lesson.level : state.level;
        var progress = loadProgress(use);
        var prev = progress[id] || { passed: false, best: 0, last: 0 };
        var score = Math.max(0, Math.min(100, Math.round(percent)));
        progress[id] = {
            passed: prev.passed === true || percent >= Lessons.PASS_PERCENT,
            best: Math.max(prev.best || 0, score),
            last: score
        };
        storageSet(progressKey(use), JSON.stringify(progress));
    }
    function lessonResultLine(percent) {
        if (!exam.lessonId || !Lessons) return '';
        var found = Lessons.locate ? Lessons.locate(exam.lessonId) : null;
        var lesson = found ? found.lesson : Lessons.findLesson(exam.lessonId);
        if (!lesson) return '';
        var label = found ? 'Lección ' + found.number + ' · ' + lesson.title : lesson.title;
        var prev = loadProgress(lesson.level)[lesson.id];
        recordLesson(lesson.id, percent);
        var score = Math.round(percent);
        if (percent >= Lessons.PASS_PERCENT) return label + ' superada al ' + score + '%. Queda marcada en el camino.';
        if (prev && prev.passed) return label + ' queda en ' + score + '%. Sigue superada.';
        return label + ' queda en ' + score + '%. El camino todavía no la marca.';
    }
    function closeLesson() {
        openLessonId = '';
        setHidden(lessonView, true);
        if (optionsPanel) optionsPanel.classList.remove('studying');
        if (lessonWarning) {
            lessonWarning.textContent = '';
            setHidden(lessonWarning, true);
        }
        updateHomeUI();
    }
    function renderPath() {
        if (!pathList || !Lessons) return;
        if (pathList.replaceChildren) pathList.replaceChildren();
        else pathList.textContent = '';
        var list = Lessons.lessonsFor ? Lessons.lessonsFor(state.level) : Lessons.LESSONS;
        var progress = loadProgress(state.level);
        var passed = Lessons.passedCount(progress, state.level);
        if (pathIntro) pathIntro.textContent = 'Lista comunitaria. No es el examen oficial.';
        if (pathProgress) {
            var due = reviewPlan(state.level).length;
            pathProgress.textContent = passed + ' de ' + list.length + ' superadas · ' + Lessons.PASS_PERCENT + '%'
                + (due ? ' · ' + due + ' para repasar' : '');
        }
        var next = Lessons.nextLesson(progress, state.level);
        var allPassed = passed === list.length;
        if (pathContinueBtn) {
            pathContinueBtn.textContent = allPassed ? 'Repetir desde el principio' : 'Seguir: ' + next.title;
        }
        if (pathListToggle) {
            pathListToggle.textContent = state.pathOpen ? 'Ocultar lecciones' : 'Ver las ' + list.length + ' lecciones';
            pathListToggle.setAttribute('aria-expanded', state.pathOpen ? 'true' : 'false');
        }
        setHidden(pathList, !state.pathOpen);
        updateReviewButton();
        if (!state.pathOpen) return;
        var lastStage = '';
        list.forEach(function (lesson, i) {
            if (lesson.stage !== lastStage) {
                lastStage = lesson.stage;
                pathList.appendChild(el('h3', 'path-stage-head', lesson.stage));
            }
            var card = el('button', 'path-card');
            card.type = 'button';
            var row = progress[lesson.id];
            if (row && row.passed) card.classList.add('path-passed');
            var head = el('div', 'path-card-head');
            head.appendChild(el('span', 'path-index', String(i + 1)));
            head.appendChild(el('span', 'path-title', lesson.title));
            card.appendChild(head);
            if (row && row.passed) card.appendChild(el('span', 'path-status', row.best + '%'));
            else if (row && row.last) card.appendChild(el('span', 'path-status path-status-last', row.last + '%'));
            card.addEventListener('click', function () { openLesson(lesson.id); });
            pathList.appendChild(card);
        });
    }
    function quizSize(lesson) {
        if (!lesson || !lesson.quiz) return 0;
        return lesson.quiz.practice === 'kana' ? lesson.quiz.chars.length : lesson.quiz.ids.length;
    }
    function kanaReading(ch) {
        if (!ch || !Core || typeof Core.findKana !== 'function') return '';
        var type = /[ァ-ヶー]/.test(ch) ? 'katakana' : 'hiragana';
        var hit = Core.findKana(type, ch);
        return hit && hit.romaji ? hit.romaji : '';
    }
    function openLesson(id) {
        if (!Lessons) return;
        var lesson = Lessons.findLesson(id);
        if (!lesson) return;
        openLessonId = id;
        if (lessonTitle) lessonTitle.textContent = lesson.title;
        if (lessonMeta) {
            lessonMeta.textContent = lesson.stage + ' · ' + lesson.minutes + ' min · ' +
                quizSize(lesson) + ' preguntas · ' + Lessons.PASS_PERCENT + '%';
        }
        if (lessonTeach) {
            if (lessonTeach.replaceChildren) lessonTeach.replaceChildren();
            else lessonTeach.textContent = '';
            lesson.teach.forEach(function (block) {
                var section = el('section', 'teach-block');
                if (block.heading && block.heading !== lesson.title) {
                    section.appendChild(el('h3', null, block.heading));
                }
                section.appendChild(el('p', null, block.text));
                if (block.examples && block.examples.length) {
                    var list = el('ul', 'teach-examples');
                    block.examples.forEach(function (example) {
                        var li = el('li');
                        var jp = el('span', 'teach-jp', example.jp);
                        jp.lang = 'ja';
                        li.appendChild(jp);
                        if (example.kana && example.kana !== example.jp) {
                            li.appendChild(document.createTextNode(' '));
                            li.appendChild(el('span', 'teach-kana', example.kana));
                        }
                        var gloss = example.es || kanaReading(example.jp);
                        if (gloss) {
                            li.appendChild(document.createTextNode(' · '));
                            li.appendChild(el('span', 'teach-es', gloss));
                        }
                        list.appendChild(li);
                    });
                    section.appendChild(list);
                }
                lessonTeach.appendChild(section);
            });
        }
        var row = loadProgress()[id];
        if (lessonStatus) {
            lessonStatus.textContent = row && row.passed
                ? 'Ya la superaste (mejor ' + row.best + '%). Puedes repetirla.'
                : 'Al terminar, el quiz cuenta para el camino.';
        }
        if (lessonWarning) {
            lessonWarning.textContent = '';
            setHidden(lessonWarning, true);
        }
        if (optionsPanel) optionsPanel.classList.add('studying');
        setHidden(lessonView, false);
        if (lessonBackBtn) lessonBackBtn.focus();
        updateHomeUI();
    }
    function applyQuizSettings(practice, direction, type) {
        state.practice = isNamedPractice(practice) ? practice : 'kana';
        if (practice === 'words') state.wordDirection = direction;
        else if (practice === 'kanji') state.kanjiDirection = direction;
        else if (practice === 'phrases') state.phraseDirection = direction;
        else if (practice === 'conj') state.conjDirection = direction;
        else if (practice === 'grammar') state.grammarDirection = direction;
        else {
            if (type === 'hiragana' || type === 'katakana') state.currentType = type;
            if (direction === Core.DIRECTIONS.ROMAJI_KANA || direction === Core.DIRECTIONS.KANA_ROMAJI) {
                state.direction = direction;
            }
        }
    }
    function startLessonQuiz() {
        if (exam.active || !Lessons || !openLessonId) return;
        var lesson = Lessons.findLesson(openLessonId);
        if (!lesson) return;
        if (lessonWarning) {
            lessonWarning.textContent = '';
            setHidden(lessonWarning, true);
        }
        if (loadSavedExam()) {
            var discard = window.confirm('Hay un examen guardado. Si empiezas la lección, se descarta. ¿Continuar?');
            if (!discard) return;
            clearSavedExam();
            refreshResumePanel();
        }
        var queue = Lessons.buildQueue(lesson, Core, Lex);
        if (!queue.length) {
            if (lessonWarning) {
                lessonWarning.textContent = 'Esta lección no pudo armar el quiz.';
                setHidden(lessonWarning, false);
            }
            return;
        }
        applyQuizSettings(lesson.quiz.practice, lesson.quiz.direction, lesson.quiz.type);
        persistPractice();
        persistType();
        persistDirection();
        persistWordDirection();
        persistKanjiDirection();
        persistPhraseDirection();
        persistConjDirection();
        persistGrammarDirection();
        var lessonId = lesson.id;
        if (lesson.level && knownLevel(lesson.level) === lesson.level) {
            state.level = lesson.level;
            persistLevel();
        }
        closeLesson();
        beginExam(queue, 0, { correct: 0, wrong: 0, skipped: 0 }, false, lessonId);
    }

    function bindEvents() {
        selectAllBasicBtn.addEventListener('click', function () {
            if (exam.active) return;
            Core.getBasicRowsByType(state.currentType).forEach(function (r) {
                state.selections[state.currentType].basic.add(r);
            });
            persistSelections(); clearConfigWarning(); renderChips();
        });
        selectAllRendakuBtn.addEventListener('click', function () {
            if (exam.active) return;
            Core.getRendakuRowsByType(state.currentType).forEach(function (g) {
                state.selections[state.currentType].rendaku.add(g);
            });
            persistSelections(); clearConfigWarning(); renderChips();
        });
        if (selectAllYoonBtn) {
            selectAllYoonBtn.addEventListener('click', function () {
                if (exam.active) return;
                Core.getYoonRowsByType(state.currentType).forEach(function (g) {
                    state.selections[state.currentType].yoon.add(g);
                });
                persistSelections(); clearConfigWarning(); renderChips();
            });
        }
        clearAllBtn.addEventListener('click', function () {
            if (exam.active) return;
            state.selections[state.currentType].basic.clear();
            state.selections[state.currentType].rendaku.clear();
            state.selections[state.currentType].yoon.clear();
            persistSelections(); clearConfigWarning(); renderChips();
        });
        startBtn.addEventListener('click', startExam);
        if (resumeBtn) resumeBtn.addEventListener('click', resumeExam);
        if (discardBtn) discardBtn.addEventListener('click', discardSaved);

        typeBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (exam.active) return;
                var type = btn.getAttribute('data-type');
                if (type !== 'hiragana' && type !== 'katakana') return;
                if (type === state.currentType) return;
                state.currentType = type;
                persistType();
                renderChips();
                updateTypeButtonsUI();
            });
        });

        if (strictBtn) {
            strictBtn.addEventListener('click', function () {
                if (exam.active) return;
                state.romajiMode = Core.MODES.STRICT;
                persistMode(); updateModeButtonsUI();
            });
        }
        if (flexibleBtn) {
            flexibleBtn.addEventListener('click', function () {
                if (exam.active) return;
                state.romajiMode = Core.MODES.FLEXIBLE;
                persistMode(); updateModeButtonsUI();
            });
        }
        [directBtn, reverseBtn].forEach(function (btn) {
            if (!btn) return;
            btn.addEventListener('click', function () {
                if (exam.active) return;
                var dir = btn.getAttribute('data-direction');
                if (dir !== Core.DIRECTIONS.KANA_ROMAJI && dir !== Core.DIRECTIONS.ROMAJI_KANA) return;
                state.direction = dir;
                persistDirection();
                updateDirectionUI();
            });
        });
        if (audioOnBtn) {
            audioOnBtn.addEventListener('click', function () {
                state.audioOn = true;
                persistAudio();
                updateAudioUI();
            });
        }
        if (audioOffBtn) {
            audioOffBtn.addEventListener('click', function () {
                state.audioOn = false;
                persistAudio();
                updateAudioUI();
            });
        }
        if (audioTestBtn) {
            audioTestBtn.addEventListener('click', function () { speakKana('あ'); });
        }
        [practiceKanaBtn, practiceWordsBtn, practiceKanjiBtn, practicePhrasesBtn, practiceConjBtn, practiceGrammarBtn, practiceReadingBtn].forEach(function (btn) {
            if (!btn) return;
            btn.addEventListener('click', function () {
                if (exam.active) return;
                var next = btn.getAttribute('data-practice');
                if (next !== 'kana' && !isNamedPractice(next)) return;
                if (isNamedPractice(next) && !Lex) return;
                state.practice = next;
                persistPractice();
                clearConfigWarning();
                updatePracticeUI();
            });
        });
        [wordToEsBtn, esToWordBtn, listenWordBtn].forEach(function (btn) {
            if (!btn) return;
            btn.addEventListener('click', function () {
                if (exam.active) return;
                state.wordDirection = btn.getAttribute('data-word-direction');
                persistWordDirection();
                updateLexDirectionUI();
            });
        });
        [kanjiToEsBtn, esToKanjiBtn, kanjiReadingBtn, listenKanjiBtn].forEach(function (btn) {
            if (!btn) return;
            btn.addEventListener('click', function () {
                if (exam.active) return;
                state.kanjiDirection = btn.getAttribute('data-kanji-direction');
                persistKanjiDirection();
                updateLexDirectionUI();
            });
        });
        if (wordAllBtn) wordAllBtn.addEventListener('click', function () {
            if (exam.active || !Lex) return;
            bag().WORD_GROUPS.forEach(function (g) { state.wordGroups.add(g.id); });
            persistLexGroups(); clearConfigWarning(); renderLexChips(); updateExamCount();
        });
        if (wordNoneBtn) wordNoneBtn.addEventListener('click', function () {
            if (exam.active) return;
            state.wordGroups.clear();
            persistLexGroups(); clearConfigWarning(); renderLexChips(); updateExamCount();
        });
        if (kanjiAllBtn) kanjiAllBtn.addEventListener('click', function () {
            if (exam.active || !Lex) return;
            bag().KANJI_GROUPS.forEach(function (g) { state.kanjiGroups.add(g.id); });
            persistLexGroups(); clearConfigWarning(); renderLexChips(); updateExamCount();
        });
        if (kanjiNoneBtn) kanjiNoneBtn.addEventListener('click', function () {
            if (exam.active) return;
            state.kanjiGroups.clear();
            persistLexGroups(); clearConfigWarning(); renderLexChips(); updateExamCount();
        });
        [phraseToEsBtn, esToPhraseBtn, particleBtn, listenPhraseBtn].forEach(function (btn) {
            if (!btn) return;
            btn.addEventListener('click', function () {
                if (exam.active) return;
                state.phraseDirection = btn.getAttribute('data-phrase-direction');
                persistPhraseDirection();
                updateLexDirectionUI();
                renderLexChips();
                updateExamCount();
            });
        });
        if (phraseAllBtn) phraseAllBtn.addEventListener('click', function () {
            if (exam.active || !Lex) return;
            bag().PHRASE_GROUPS.forEach(function (g) { state.phraseGroups.add(g.id); });
            persistLexGroups(); clearConfigWarning(); renderLexChips(); updateExamCount();
        });
        if (phraseNoneBtn) phraseNoneBtn.addEventListener('click', function () {
            if (exam.active) return;
            state.phraseGroups.clear();
            persistLexGroups(); clearConfigWarning(); renderLexChips(); updateExamCount();
        });
        [conjToEsBtn, esToConjBtn].forEach(function (btn) {
            if (!btn) return;
            btn.addEventListener('click', function () {
                if (exam.active) return;
                state.conjDirection = btn.getAttribute('data-conj-direction');
                persistConjDirection();
                updateLexDirectionUI();
                renderLexChips();
                updateExamCount();
            });
        });
        if (conjAllBtn) conjAllBtn.addEventListener('click', function () {
            if (exam.active || !Lex) return;
            bag().CONJ_GROUPS.forEach(function (g) { state.conjGroups.add(g.id); });
            persistLexGroups(); clearConfigWarning(); renderLexChips(); updateExamCount();
        });
        if (conjNoneBtn) conjNoneBtn.addEventListener('click', function () {
            if (exam.active) return;
            state.conjGroups.clear();
            persistLexGroups(); clearConfigWarning(); renderLexChips(); updateExamCount();
        });
        [grammarToEsBtn, esToGrammarBtn, grammarBlankBtn].forEach(function (btn) {
            if (!btn) return;
            btn.addEventListener('click', function () {
                if (exam.active) return;
                state.grammarDirection = btn.getAttribute('data-grammar-direction');
                persistGrammarDirection();
                updateLexDirectionUI();
                renderLexChips();
                updateExamCount();
            });
        });
        if (grammarAllBtn) grammarAllBtn.addEventListener('click', function () {
            if (exam.active || !Lex) return;
            bag().GRAMMAR_GROUPS.forEach(function (g) { state.grammarGroups.add(g.id); });
            persistLexGroups(); clearConfigWarning(); renderLexChips(); updateExamCount();
        });
        if (grammarNoneBtn) grammarNoneBtn.addEventListener('click', function () {
            if (exam.active) return;
            state.grammarGroups.clear();
            persistLexGroups(); clearConfigWarning(); renderLexChips(); updateExamCount();
        });
        document.querySelectorAll('#homeBar [data-level]').forEach(function (btn) {
            if (!btn) return;
            btn.addEventListener('click', function () {
                setLevel(btn.getAttribute('data-level'));
            });
        });
        if (homePathBtn) homePathBtn.addEventListener('click', function () { setHome('path'); });
        if (homeFreeBtn) homeFreeBtn.addEventListener('click', function () { setHome('free'); });
        if (reviewDueBtn) reviewDueBtn.addEventListener('click', startReview);
        if (exportBackupBtn) exportBackupBtn.addEventListener('click', exportBackup);
        if (importBackupBtn) importBackupBtn.addEventListener('click', importBackup);
        if (backupFile) backupFile.addEventListener('change', function () {
            var file = backupFile.files && backupFile.files[0];
            backupFile.value = '';
            readBackupFile(file);
        });
        if (pathListToggle) pathListToggle.addEventListener('click', function () {
            state.pathOpen = !state.pathOpen;
            renderPath();
        });
        if (pathContinueBtn) pathContinueBtn.addEventListener('click', function () {
            if (exam.active || !Lessons) return;
            var list = Lessons.lessonsFor ? Lessons.lessonsFor(state.level) : Lessons.LESSONS;
            var progress = loadProgress(state.level);
            var next = Lessons.passedCount(progress, state.level) === list.length
                ? list[0]
                : Lessons.nextLesson(progress, state.level);
            openLesson(next.id);
        });
        if (lessonBackBtn) lessonBackBtn.addEventListener('click', function () {
            if (exam.active) return;
            closeLesson();
            renderPath();
            if (pathContinueBtn) pathContinueBtn.focus();
        });
        [answerChoiceBtn, answerWriteBtn].forEach(function (btn) {
            if (!btn) return;
            btn.addEventListener('click', function () {
                if (exam.active) return;
                state.answerMode = btn.getAttribute('data-answer-mode') === 'write' ? 'write' : 'choice';
                persistAnswerMode();
                updateAnswerModeUI();
            });
        });
        if (reviewMissBtn) reviewMissBtn.addEventListener('click', startMissReview);
        if (lessonStartBtn) lessonStartBtn.addEventListener('click', startLessonQuiz);
        var synth = speechSynth();
        if (synth && synth.addEventListener) {
            synth.addEventListener('voiceschanged', function () {
                updateAudioUI();
                if (!exam.active || exam.waitingNext || !japaneseVoice()) return;
                if (exam.voiceReadyIndex === exam.index) return;
                try {
                    if (synth.speaking || synth.pending) return;
                } catch (e) { return; }
                var item = exam.queue[exam.index];
                if (!item) return;
                var listen = exam.direction === 'listen-es';
                var readAloud = !!(item.reading && state.audioOn);
                if (!listen && !readAloud) return;
                exam.voiceReadyIndex = exam.index;
                if (readAloud) exam.spokenPassage = '';
                maybeSpeakItem(item, false);
            });
            try { if (typeof synth.getVoices === 'function') synth.getVoices(); } catch (e) { /* aún no hay voces */ }
        }
        document.addEventListener('keydown', onDocumentKeydown);
        window.addEventListener('pagehide', onPageHide);
        document.addEventListener('visibilitychange', onVisibility);
    }

    function init() {
        loadState();
        renderChips();
        updateTypeButtonsUI();
        updateModeButtonsUI();
        updateDirectionUI();
        updatePracticeUI();
        updateHomeUI();
        updateAudioUI();
        renderPath();
        refreshResumePanel();
        updateBackupUI();
        bindEvents();
        setHidden(quizArea, true);
        setHidden(optionsPanel, false);
    }

    init();
})();
