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
    var Lex = window.NihongoDojoLexicon;

    var state = {
        currentType: 'hiragana',
        romajiMode: Core.DEFAULT_MODE,
        direction: Core.DEFAULT_DIRECTION,
        practice: 'kana',
        wordDirection: 'word-es',
        kanjiDirection: 'kanji-es',
        phraseDirection: 'phrase-es',
        wordGroups: new Set(),
        kanjiGroups: new Set(),
        phraseGroups: new Set(),
        audioOn: true,
        selections: {
            hiragana: { basic: new Set(), rendaku: new Set(), yoon: new Set() },
            katakana: { basic: new Set(), rendaku: new Set(), yoon: new Set() }
        }
    };

    var exam = {
        active: false,
        queue: [],
        index: 0,
        waitingNext: false,
        timerId: null,
        deadline: null,
        direction: null,
        practice: null,
        correct: 0,
        wrong: 0,
        skipped: 0
    };

    var quizEls = emptyQuizEls();

    function emptyQuizEls() {
        return {
            kanaChar: null, hint: null, input: null, inputArea: null,
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
        return name === 'words' || name === 'kanji' || name === 'phrases';
    }
    function isLexicon() {
        return isNamedPractice(exam.practice);
    }
    function usesChoices() {
        return isReverse() || isLexicon();
    }
    function activeDirection() {
        if (state.practice === 'words') return state.wordDirection;
        if (state.practice === 'kanji') return state.kanjiDirection;
        if (state.practice === 'phrases') return state.phraseDirection;
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
    function shareScope() {
        if (exam.practice === 'words') return 'palabras';
        if (exam.practice === 'kanji') return 'kanji';
        if (exam.practice === 'phrases') return 'frases';
        return state.currentType === 'katakana' ? 'katakana' : 'hiragana';
    }
    function practiceScope(practice, type) {
        if (practice === 'words') return 'palabras';
        if (practice === 'kanji') return 'kanji';
        if (practice === 'phrases') return 'frases';
        return type === 'katakana' ? 'katakana' : 'hiragana';
    }
    function lexView(item) {
        return Lex.view(item.lex, exam.direction || activeDirection());
    }
    function lexiconHint(view, settled) {
        var parts = [];
        if (view.furigana) parts.push(view.furigana);
        if (!settled && view.note) parts.push(view.note);
        if (settled && view.settledNote) parts.push(view.settledNote);
        else if (settled && view.note) parts.push(view.note);
        return parts.join(' · ');
    }
    function speakItem(item, settled) {
        if (!item) return;
        if (item.kanaObj) { speakKana(item.kanaObj.char); return; }
        if (!item.lex) return;
        var view = lexView(item);
        if (view.speakOnShow || settled) speakKana(view.speak);
        else noteAudio('En esta dirección el sonido se oye al corregir, para no revelar la respuesta.');
    }
    function maybeSpeakItem(item, settled) {
        if (!state.audioOn || !item || !item.lex) return;
        var view = lexView(item);
        if (view.speakOnShow && !settled) speakKana(view.speak);
        else if (!view.speakOnShow && settled) speakKana(view.speak);
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
            if (!r) return 'Elige la respuesta.';
            if (r.skipped) return 'Saltada. ' + view.prompt + ' → ' + view.answer + '.' + tail;
            if (r.correct) return 'Correcto: ' + view.answer + '.' + tail;
            var yours = Lex.textForId(exam.practice, r.user, exam.direction) || '—';
            return 'Fallo. ' + view.prompt + ' → ' + view.answer + '. Tú: ' + yours + '.' + tail;
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
    function persistLexGroups() {
        storageSet('sel.words', JSON.stringify(Array.from(state.wordGroups)));
        storageSet('sel.kanji', JSON.stringify(Array.from(state.kanjiGroups)));
        storageSet('sel.phrases', JSON.stringify(Array.from(state.phraseGroups)));
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
        state.practice = storedPractice === 'words' || storedPractice === 'kanji' ? storedPractice : 'kana';
        if (Lex) {
            var storedWordDir = storageGet('wordDirection');
            state.wordDirection = Lex.validDirection('words', storedWordDir) ? storedWordDir : 'word-es';
            var storedKanjiDir = storageGet('kanjiDirection');
            state.kanjiDirection = Lex.validDirection('kanji', storedKanjiDir) ? storedKanjiDir : 'kanji-es';
            var storedWords = loadStoredNames('sel.words', Lex.WORD_GROUPS.map(function (g) { return g.id; }));
            var storedKanji = loadStoredNames('sel.kanji', Lex.KANJI_GROUPS.map(function (g) { return g.id; }));
            state.wordGroups = storedWords !== null ? storedWords : new Set(Lex.WORD_STARTER);
            state.kanjiGroups = storedKanji !== null ? storedKanji : new Set(Lex.KANJI_STARTER);
            var storedPhraseDir = storageGet('phraseDirection');
            state.phraseDirection = Lex.validDirection('phrases', storedPhraseDir) ? storedPhraseDir : 'phrase-es';
            var storedPhrases = loadStoredNames('sel.phrases', Lex.PHRASE_GROUPS.map(function (g) { return g.id; }));
            state.phraseGroups = storedPhrases !== null ? storedPhrases : new Set(Lex.PHRASE_STARTER);
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
            practice: exam.practice,
            direction: exam.direction,
            index: exam.index,
            waitingNext: exam.waitingNext === true,
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
    function examSnapshot() {
        if (isLexicon()) return lexiconSnapshot();
        return {
            v: 2,
            type: state.currentType,
            mode: state.romajiMode,
            direction: exam.direction || state.direction,
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
            parsed = data && data.v === 3 && Lex
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
        var way = isNamedPractice(saved.practice) && Lex
            ? Lex.directionLabel(saved.direction)
            : directionLabel(saved.direction);
        if (resumeText) {
            resumeText.textContent = 'Examen a medias (' + scope + ', ' +
                way + '): pregunta ' + n +
                ' de ' + saved.queue.length + '. ' +
                plural(saved.correct, 'acierto', 'aciertos') + ', ' +
                plural(saved.wrong, 'fallo', 'fallos') + ', ' +
                plural(saved.skipped, 'saltada', 'saltadas') + '.';
        }
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
        if (state.practice === 'words' && Lex) return Lex.filterByGroups('words', state.wordGroups, state.wordDirection).length;
        if (state.practice === 'kanji' && Lex) return Lex.filterByGroups('kanji', state.kanjiGroups, state.kanjiDirection).length;
        if (state.practice === 'phrases' && Lex) return Lex.filterByGroups('phrases', state.phraseGroups, state.phraseDirection).length;
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
            } else {
                examCount.textContent = n === 0
                    ? 'Ninguna pregunta con esta selección.'
                    : (n === 1 ? '1 pregunta con esta selección.' : n + ' preguntas con esta selección.');
            }
        }
        if (startLabel) {
            startLabel.textContent = n > 0 ? 'INICIAR EXAMEN (' + n + ')' : 'INICIAR EXAMEN';
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
    }
    function paintLexChips(container, practice, selected) {
        if (!container) return;
        if (container.replaceChildren) container.replaceChildren();
        else container.textContent = '';
        Lex.groupsOf(practice).forEach(function (group) {
            var chip = el('button', 'fila-chip');
            chip.type = 'button';
            chip.setAttribute('data-group', group.id);
            var on = selected.has(group.id);
            chip.setAttribute('aria-pressed', on ? 'true' : 'false');
            if (on) chip.classList.add('selected');
            var total = practice === 'phrases'
                ? Lex.filterByGroups(practice, [group.id], state.phraseDirection).length
                : Lex.countInGroup(practice, group.id);
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
    function updateLexDirectionUI() {
        var wordReverse = state.wordDirection === 'es-word';
        if (wordToEsBtn && esToWordBtn) {
            wordToEsBtn.classList.toggle('active', !wordReverse);
            esToWordBtn.classList.toggle('active', wordReverse);
            wordToEsBtn.setAttribute('aria-pressed', wordReverse ? 'false' : 'true');
            esToWordBtn.setAttribute('aria-pressed', wordReverse ? 'true' : 'false');
        }
        if (wordDirNote) {
            wordDirNote.textContent = wordReverse
                ? 'Ves el español y eliges la palabra. El sonido se oye al corregir.'
                : 'Ves la palabra. Si lleva kanji, la lectura va debajo.';
        }
        [kanjiToEsBtn, esToKanjiBtn, kanjiReadingBtn].forEach(function (btn) {
            if (!btn) return;
            var on = btn.getAttribute('data-kanji-direction') === state.kanjiDirection;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        if (kanjiDirNote) {
            kanjiDirNote.textContent = state.kanjiDirection === 'kanji-reading'
                ? 'Ves el kanji y eliges su lectura principal. Otras lecturas salen al corregir.'
                : state.kanjiDirection === 'es-kanji'
                    ? 'Ves el significado y eliges el kanji. El sonido se oye al corregir.'
                    : 'Ves el kanji y eliges el significado. La lectura se oye, no se revela.';
        }
        [phraseToEsBtn, esToPhraseBtn, particleBtn].forEach(function (btn) {
            if (!btn) return;
            var on = btn.getAttribute('data-phrase-direction') === state.phraseDirection;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        if (phraseDirNote) {
            phraseDirNote.textContent = state.phraseDirection === 'particle'
                ? 'Ves el significado y la frase con un hueco. Elige la partícula.'
                : state.phraseDirection === 'es-phrase'
                    ? 'Ves el español y eliges la frase. El sonido se oye al corregir.'
                    : 'Ves la frase. La lectura va debajo. Elige el significado.';
        }
    }
    function updatePracticeUI() {
        var practice = isNamedPractice(state.practice) ? state.practice : 'kana';
        [practiceKanaBtn, practiceWordsBtn, practiceKanjiBtn, practicePhrasesBtn].forEach(function (btn) {
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
        setHidden(wordPanel, practice !== 'words');
        setHidden(kanjiPanel, practice !== 'kanji');
        setHidden(phrasePanel, practice !== 'phrases');
        if (practiceNote) {
            practiceNote.textContent = practice === 'words'
                ? 'Palabras de uso diario. El kanji, si lo hay, sale con su lectura.'
                : practice === 'kanji'
                    ? 'Kanji de principiante: significado o lectura. No es la lista completa.'
                    : practice === 'phrases'
                        ? 'Frases cortas: traducirlas o elegir la partícula que falta.'
                        : 'Hiragana y katakana, carácter por carácter.';
        }
        updateLexDirectionUI();
        renderLexChips();
        updateExamCount();
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

    function japaneseVoice() {
        if (!window.speechSynthesis || typeof window.speechSynthesis.getVoices !== 'function') return null;
        var voices = [];
        try { voices = window.speechSynthesis.getVoices() || []; }
        catch (e) { return null; }
        var ja = voices.filter(function (v) { return v && /^ja([-_]|$)/i.test(v.lang || ''); });
        return ja.filter(function (v) { return v.localService; })[0] || ja[0] || null;
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
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        } catch (e) { /* el dispositivo no tiene voz */ }
    }
    function speakKana(ch) {
        if (!ch) return false;
        if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== 'function') {
            noteAudio('Este dispositivo no tiene síntesis de voz.');
            return false;
        }
        var voice = japaneseVoice();
        var listed = 0;
        try { listed = (window.speechSynthesis.getVoices() || []).length; }
        catch (e) { listed = 0; }
        if (!voice && listed) {
            noteAudio('No hay una voz japonesa instalada. Puede no oírse, o sonar en otro idioma.');
        }
        // cancel() y speak() en el mismo instante se pierden en algunos WebView.
        stopSpeech();
        var gen = speechGen;
        window.setTimeout(function () {
            if (gen !== speechGen) return;
            try {
                if (window.speechSynthesis.paused) window.speechSynthesis.resume();
                var utterance = new window.SpeechSynthesisUtterance(ch);
                utterance.lang = 'ja-JP';
                utterance.rate = 0.88;
                if (voice) utterance.voice = voice;
                utterance.onerror = function () {
                    noteAudio('No se pudo reproducir la pronunciación.');
                };
                window.speechSynthesis.speak(utterance);
            } catch (e) {
                noteAudio('No se pudo reproducir la pronunciación.');
            }
        }, 40);
        return true;
    }
    function updateAudioUI() {
        if (audioOnBtn && audioOffBtn) {
            audioOnBtn.classList.toggle('active', state.audioOn);
            audioOffBtn.classList.toggle('active', !state.audioOn);
            audioOnBtn.setAttribute('aria-pressed', state.audioOn ? 'true' : 'false');
            audioOffBtn.setAttribute('aria-pressed', state.audioOn ? 'false' : 'true');
        }
        if (!audioNote) return;
        if (!window.speechSynthesis) {
            audioNote.textContent = 'Este dispositivo no tiene síntesis de voz.';
            if (audioTestBtn) audioTestBtn.disabled = true;
            return;
        }
        var voice = japaneseVoice();
        var when = state.audioOn
            ? 'Se oye al mostrar cada pregunta. También puedes pulsar Escuchar.'
            : 'Solo suena si pulsas Escuchar.';
        audioNote.textContent = voice
            ? when + ' Voz: ' + voice.name + '.'
            : when + ' Si no hay voz japonesa en el sistema, puede no oírse.';
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
            quizEls.choiceArea.setAttribute('aria-label', isLexicon() ? 'Elige la respuesta' : 'Elige el kana');
        }
        if (quizEls.help) {
            quizEls.help.textContent = usesChoices()
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
        if (item.lex) paintLexChoices(item, true);
        else paintChoices(item, true);
    }

    function clearPromptClasses() {
        if (!quizEls.kanaChar) return;
        quizEls.kanaChar.classList.remove('prompt-romaji', 'prompt-es', 'prompt-long', 'prompt-xlong', 'prompt-sentence');
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
    function paintLexiconPrompt(item) {
        var view = lexView(item);
        clearPromptClasses();
        if (quizEls.kanaChar) {
            quizEls.kanaChar.textContent = view.prompt;
            quizEls.kanaChar.lang = view.promptLang;
            if (view.promptLang === 'es') quizEls.kanaChar.classList.add('prompt-es');
            else {
                var len = Array.from(view.prompt).length;
                if (len > 10) quizEls.kanaChar.classList.add('prompt-sentence');
                else if (len > 6) quizEls.kanaChar.classList.add('prompt-xlong');
                else if (len > 3) quizEls.kanaChar.classList.add('prompt-long');
            }
        }
        setHidden(quizEls.inputArea, true);
        setHidden(quizEls.choiceArea, false);
        if (quizEls.audioStatus) {
            quizEls.audioStatus.textContent = '';
            setHidden(quizEls.audioStatus, true);
        }
        paintLexChoices(item, !!item.result);
        return applyNote(lexiconHint(view, !!item.result));
    }

    function paintPrompt(item) {
        if (item.lex) return paintLexiconPrompt(item);
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
        if (item.lex) {
            text += lexView(item).prompt + '. Elige la respuesta.';
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

    function beginExam(queue, index, counters, waiting) {
        exam.active = true;
        exam.queue = queue;
        exam.index = index || 0;
        exam.correct = counters.correct || 0;
        exam.wrong = counters.wrong || 0;
        exam.skipped = counters.skipped || 0;
        exam.waitingNext = false;
        exam.deadline = null;
        exam.practice = isNamedPractice(state.practice) ? state.practice : 'kana';
        exam.direction = activeDirection();
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

        if (isNamedPractice(state.practice)) {
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

    function startLexiconExam() {
        var groups = state.practice === 'kanji' ? state.kanjiGroups
            : state.practice === 'phrases' ? state.phraseGroups
            : state.wordGroups;
        if (!groups || !groups.size) {
            showConfigWarning('Selecciona al menos un tema.');
            return;
        }
        var queue = Lex.buildQueue(state.practice, groups, activeDirection());
        if (!queue.length) {
            showConfigWarning('No hay preguntas con esa selección.');
            return;
        }
        beginExam(queue, 0, { correct: 0, wrong: 0, skipped: 0 }, false);
    }

    function resumeExam() {
        var saved = loadSavedExam();
        if (!saved) { refreshResumePanel(); return; }
        if (isNamedPractice(saved.practice)) {
            state.practice = saved.practice;
            if (saved.practice === 'words') state.wordDirection = saved.direction;
            else if (saved.practice === 'kanji') state.kanjiDirection = saved.direction;
            else state.phraseDirection = saved.direction;
            persistPractice();
            persistWordDirection();
            persistKanjiDirection();
            persistPhraseDirection();
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
        updatePracticeUI();
        beginExam(saved.queue, saved.index, saved, saved.waitingNext);
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
        setFeedback(isLexicon() ? 'Elige la respuesta.' : (isReverse() ? 'Elige el kana.' : 'Escribe el romaji y pulsa Enter.'));
        updateStatsUI();
        announceQuestion(item, note);
        if (usesChoices()) {
            if (quizEls.listenBtn) quizEls.listenBtn.focus();
        } else if (quizEls.input) {
            quizEls.input.focus();
        }
        saveExam();
        if (item.lex) maybeSpeakItem(item, false);
        else maybeSpeak(item.kanaObj.char);
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
        var result = Core.checkAnswer(item.kanaObj, quizEls.input.value, state.romajiMode);
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
        saveExam();
        maybeScheduleAutoAdvance();
    }

    function skipQuestion() {
        if (!exam.active || exam.waitingNext || dialogOpen()) return;
        if (exam.index >= exam.queue.length) return;
        var item = exam.queue[exam.index];
        item.userAnswer = null;
        item.result = item.lex
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
        var result = item.lex ? Lex.checkChoice(item.lex, id) : Core.checkChoice(item.kanaObj, id);
        if (result.empty) return;
        item.userAnswer = result.user;
        item.result = result;
        if (result.correct) exam.correct++;
        else exam.wrong++;
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

    function shareResultToChat(total) {
        var texts = Core.buildShareText(exam.correct, total, shareScope(), exam.direction || state.direction);
        var selfName = '';
        try { selfName = (window.webxdc && window.webxdc.selfName) || ''; }
        catch (e) { selfName = ''; }
        selfName = String(selfName).replace(/[\r\n]+/g, ' ').trim();
        window.webxdc.sendUpdate({
            payload: {
                kind: 'nihongodojo-score',
                practice: exam.practice || 'kana',
                syllabary: shareScope(),
                mode: state.romajiMode,
                direction: exam.direction || state.direction,
                correct: exam.correct,
                wrong: exam.wrong,
                skipped: exam.skipped,
                total: total,
                percent: total === 0 ? 0 : (exam.correct / total) * 100,
                selfName: selfName
            },
            info: texts.info,
            summary: texts.summary
        }, '');
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
        summary.appendChild(el('p', null, isLexicon()
            ? scope + ' · ' + way
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
        summary.appendChild(document.createElement('hr'));

        var list = el('ol', 'results-list');
        exam.queue.forEach(function (item) {
            var li = el('li');
            if (item.lex) {
                var view = lexView(item);
                var yours = item.result && item.result.skipped
                    ? '—'
                    : (Lex.textForId(exam.practice, item.result && item.result.user, exam.direction) || '—');
                li.appendChild(document.createTextNode(resultStatus(item) + '. ' + view.prompt + ' → ' + view.answer + '. Tú: ' + yours));
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

        var restartBtn = buttonWithIcon('btn restart-btn', '🔄', 'Nuevo examen');
        restartBtn.addEventListener('click', exitExam);
        summary.appendChild(restartBtn);

        if (webxdcAvailable()) {
            var shareBtn = buttonWithIcon('btn share-btn', '📤', 'Compartir en el chat');
            var sent = false;
            shareBtn.addEventListener('click', function () {
                if (sent) return;
                sent = true;
                try {
                    shareResultToChat(total);
                    shareBtn.textContent = 'Enviado al chat';
                    shareBtn.disabled = true;
                } catch (e) {
                    sent = false;
                    shareBtn.textContent = 'No se pudo enviar. Reintentar';
                }
            });
            summary.appendChild(shareBtn);
        }

        card.appendChild(summary);
        card.appendChild(el('div', 'small-note', isLexicon()
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

    function exitExam() {
        stopSpeech();
        clearTimer();
        if (exam.active) saveExam();
        exam.active = false;
        exam.waitingNext = false;
        exam.deadline = null;
        exam.direction = null;
        exam.practice = null;
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
        [practiceKanaBtn, practiceWordsBtn, practiceKanjiBtn, practicePhrasesBtn].forEach(function (btn) {
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
        [wordToEsBtn, esToWordBtn].forEach(function (btn) {
            if (!btn) return;
            btn.addEventListener('click', function () {
                if (exam.active) return;
                state.wordDirection = btn.getAttribute('data-word-direction');
                persistWordDirection();
                updateLexDirectionUI();
            });
        });
        [kanjiToEsBtn, esToKanjiBtn, kanjiReadingBtn].forEach(function (btn) {
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
            Lex.WORD_GROUPS.forEach(function (g) { state.wordGroups.add(g.id); });
            persistLexGroups(); clearConfigWarning(); renderLexChips(); updateExamCount();
        });
        if (wordNoneBtn) wordNoneBtn.addEventListener('click', function () {
            if (exam.active) return;
            state.wordGroups.clear();
            persistLexGroups(); clearConfigWarning(); renderLexChips(); updateExamCount();
        });
        if (kanjiAllBtn) kanjiAllBtn.addEventListener('click', function () {
            if (exam.active || !Lex) return;
            Lex.KANJI_GROUPS.forEach(function (g) { state.kanjiGroups.add(g.id); });
            persistLexGroups(); clearConfigWarning(); renderLexChips(); updateExamCount();
        });
        if (kanjiNoneBtn) kanjiNoneBtn.addEventListener('click', function () {
            if (exam.active) return;
            state.kanjiGroups.clear();
            persistLexGroups(); clearConfigWarning(); renderLexChips(); updateExamCount();
        });
        [phraseToEsBtn, esToPhraseBtn, particleBtn].forEach(function (btn) {
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
            Lex.PHRASE_GROUPS.forEach(function (g) { state.phraseGroups.add(g.id); });
            persistLexGroups(); clearConfigWarning(); renderLexChips(); updateExamCount();
        });
        if (phraseNoneBtn) phraseNoneBtn.addEventListener('click', function () {
            if (exam.active) return;
            state.phraseGroups.clear();
            persistLexGroups(); clearConfigWarning(); renderLexChips(); updateExamCount();
        });
        if (window.speechSynthesis && window.speechSynthesis.addEventListener) {
            window.speechSynthesis.addEventListener('voiceschanged', updateAudioUI);
            try { window.speechSynthesis.getVoices(); } catch (e) { /* aún no hay voces */ }
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
        updateAudioUI();
        refreshResumePanel();
        bindEvents();
        setHidden(quizArea, true);
        setHidden(optionsPanel, false);
    }

    init();
})();
