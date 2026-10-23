/* ============================================================
 * Kana Dojo — app.js
 * Capa de presentación y estado (DOM). Depende de core.js
 * (window.KanaDojoCore) para TODA la lógica pura.
 *
 * Correcciones aplicadas respecto al original:
 *  - CRÍTICO-2: cero innerHTML con datos dinámicos. Todo resultado
 *    se construye con createElement/textContent (los datos del
 *    usuario nunca se interpretan como HTML).
 *  - MEDIO-3: el markup del quiz vive en un único <template>
 *    (antes estaba duplicado en el HTML y en resetToConfigMode).
 *  - ALTO-3: listener con 'keydown' (no 'keypress', deprecado) y
 *    adjuntado una única vez por input recién creado.
 *  - ALTO-1/2: botones "Saltar" y "Salir del examen"; Enter con
 *    campo vacío avisa en lugar de contar fallo.
 *  - MEDIO-5: alert() sustituido por aviso inline (role="alert").
 *  - MEDIO-4: progreso humano "Pregunta X de N" (antes 0-based).
 *  - ALTO-4: accesibilidad — chips como <button aria-pressed>,
 *    feedback aria-live, kana con lang="ja", foco gestionado.
 *  - BAJO-1/6: persistencia validada en localStorage (guardada
 *    con try/catch: algunos WebView la restringen) y selecciones
 *    independientes por silabario.
 *
 * v1.2.0 (mejoras autorizadas):
 *  - Categoría yōon (拗音): tercer grupo de chips con selecciones,
 *    persistencia y filtrado propios (cierra MEDIO-1 de raíz).
 *  - Integración webxdc: al terminar el examen se ofrece «Compartir
 *    en el chat» vía window.webxdc.sendUpdate (botón optativo, con
 *    doble-envío bloqueado y degradación silenciosa fuera de
 *    Delta Chat/ArcaneChat).
 *
 * v1.2.1 — correcciones de la segunda auditoría (con evidencia E2E):
 *  - MEDIO-7: onAnswerKeydown ignora Enter en plena composición IME
 *    (e.isComposing / keyCode 229). Con un IME japonés activo, el
 *    Enter que confirma la conversión kanji enviaba la respuesta
 *    a medio escribir.
 *  - MEDIO-8: renderChips() reconstruye los chips y destruía el
 *    botón con foco → el foco caía a <body> y un usuario de teclado
 *    no podía conmutar dos chips seguidos (WCAG 2.4.3). Ahora cada
 *    chip lleva data-row y se re-enfoca tras el re-render.
 *  - BAJO-4: el aviso «siguiente en 2 segundos» era texto fijo;
 *    ahora se calcula de ADVANCE_MS (consistente con la costura de
 *    prueba).
 *  - BAJO-5: exitExam() no restauraba el foco al volver al panel
 *    (quedaba en <body>); ahora lo mueve al botón INICIAR EXAMEN.
 *  - BAJO-6: las respuestas de usuario muy largas deformaban la
 *    lista de resultados; se truncan a 40 caracteres.
 * ============================================================ */
(function () {
    'use strict';

    const Core = window.KanaDojoCore;
    if (!Core) {
        // core.js debe cargarse antes; sin él la app no puede funcionar.
        document.addEventListener('DOMContentLoaded', function () {
            var panel = document.getElementById('optionsPanel');
            if (panel) { panel.textContent = 'Error interno: no se cargó core.js.'; }
        });
        return;
    }

    // Costura de prueba: los tests reducen el avance automático de 2 s a
    // milisegundos. En producción window.__KANA_ADVANCE_MS no existe.
    var ADVANCE_MS = (typeof window.__KANA_ADVANCE_MS === 'number' && window.__KANA_ADVANCE_MS >= 0)
        ? window.__KANA_ADVANCE_MS : 2000;

    var STORAGE_PREFIX = 'kanadojo.';
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
        catch (e) { /* sin almacenamiento: la app sigue funcionando en memoria */ }
    }

    // ---------- Referencias DOM (estáticas) ----------
    function $(id) { return document.getElementById(id); }

    var optionsPanel = $('optionsPanel');
    var quizArea = $('quizArea');
    var filaContainer = $('filaContainer');
    var rendakuContainer = $('rendakuContainer');
    var yoonContainer = $('yoonContainer');
    var startBtn = $('startExamBtn');
    var selectAllBasicBtn = $('selectAllBasicBtn');
    var selectAllRendakuBtn = $('selectAllRendakuBtn');
    var selectAllYoonBtn = $('selectAllYoonBtn');
    var clearAllBtn = $('clearAllBtn');
    // CORRECCIÓN (propia, detectada en revisión): el selector debe limitarse a
    // los botones de silabario (con data-type); los botones de modo de
    // romanización también usan la clase .type-btn y no deben ser tocados
    // por updateTypeButtonsUI().
    var typeBtns = Array.prototype.slice.call(document.querySelectorAll('.type-btn[data-type]'));
    var strictBtn = $('strictModeBtn');
    var flexibleBtn = $('flexibleModeBtn');
    var modeNote = $('modeNote');
    var configWarning = $('configWarning');
    var quizTemplate = $('quizCardTemplate');

    // ---------- Estado ----------
    // Selecciones INDEPENDIENTES por silabario (BAJO-6): cambiar de
    // silabario ya no borra lo que el usuario había elegido antes.
    var state = {
        currentType: 'hiragana',
        romajiMode: Core.DEFAULT_MODE,
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
        correct: 0,
        wrong: 0
    };

    // Referencias al quiz actual (elementos creados desde el template)
    var quizEls = {
        kanaChar: null, input: null, feedback: null, progress: null,
        total: null, skipBtn: null, exitBtn: null
    };

    // ---------- Utilidades DOM ----------
    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = text; // nunca innerHTML
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
    function setFeedback(message) {
        if (quizEls.feedback) quizEls.feedback.textContent = message;
    }
    function updateStatsUI() {
        if (quizEls.progress) {
            quizEls.progress.textContent = '📋 Pregunta ' +
                Math.min(exam.index + 1, exam.queue.length) + ' de ' + exam.queue.length;
        }
        if (quizEls.total) {
            quizEls.total.textContent = '✅ ' + exam.correct + ' · ❌ ' + exam.wrong;
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

    // ---------- Persistencia (BAJO-1) ----------
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

    function loadStoredNames(key, validRows) {
        var raw = storageGet(key);
        if (raw === null) return null; // sin dato → quien llama aplica por defecto
        var valid = new Set(validRows);
        try {
            var parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return null;
            // Validación: se descartan nombres desconocidos (almacén corrupto).
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

        ['hiragana', 'katakana'].forEach(function (type) {
            var storedBasic = loadStoredNames('sel.' + type + '.basic', Core.getBasicRowsByType(type));
            var storedRendaku = loadStoredNames('sel.' + type + '.rendaku', Core.getRendakuRowsByType(type));
            var storedYoon = loadStoredNames('sel.' + type + '.yoon', Core.getYoonRowsByType(type));
            // Sin dato guardado (null) → todas las filas seleccionadas (comportamiento original).
            state.selections[type].basic = storedBasic ||
                new Set(Core.getBasicRowsByType(type));
            state.selections[type].rendaku = storedRendaku ||
                new Set(Core.getRendakuRowsByType(type));
            state.selections[type].yoon = storedYoon ||
                new Set(Core.getYoonRowsByType(type));
        });
    }

    // ---------- Render del panel de configuración ----------
    // Fábrica común para los tres grupos de chips (basic/rendaku/yoon):
    // mismo comportamiento, distinta clase CSS y contenedor.
    function renderChipGroup(container, rows, cssClass, category) {
        rows.forEach(function (row) {
            var chip = el('button', 'fila-chip ' + cssClass);
            chip.type = 'button';                                   // accesible por teclado (ALTO-4)
            chip.setAttribute('data-row', row); // v1.2.1 (MEDIO-8): ancla para re-enfocar
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
                // v1.2.1 (MEDIO-8): renderChips destruye y recrea los chips,
                // lo que dejaba el foco en <body>. Se restaura al chip
                // conmutado para que la navegación por teclado (Tab/Enter)
                // pueda continuar desde el mismo punto (WCAG 2.4.3).
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
                : 'Flexible: también acepta si, ti, tu, hu, zi, di, du, o, nn y sya/tya/jya…';
        }
    }

    // ---------- Examen ----------
    function mountQuiz() {
        // Fuente única de markup (MEDIO-3): clona el <template>.
        var clone = quizTemplate.content.cloneNode(true);
        quizArea.replaceChildren ? quizArea.replaceChildren(clone) : (function () {
            while (quizArea.firstChild) quizArea.removeChild(quizArea.firstChild);
            quizArea.appendChild(clone);
        })();

        quizEls.kanaChar = $('kanaChar');
        quizEls.input = $('answerInput');
        quizEls.feedback = $('feedbackMsg');
        quizEls.progress = $('quizProgress');
        quizEls.total = $('quizScore');
        quizEls.skipBtn = $('skipBtn');
        quizEls.exitBtn = $('exitBtn');

        quizEls.input.addEventListener('keydown', onAnswerKeydown); // keydown, no keypress
        quizEls.skipBtn.addEventListener('click', skipQuestion);
        quizEls.exitBtn.addEventListener('click', exitExam);
    }

    function onAnswerKeydown(e) {
        if (e.key !== 'Enter') return;
        // v1.2.1 (MEDIO-7): Enter durante una composición IME (confirmar
        // la conversión del IME japonés/chino) NO debe enviar la respuesta.
        // keyCode 229 es el código legacy que usan los WebViews antiguos.
        if (e.isComposing || e.keyCode === 229) return;
        e.preventDefault();
        submitAnswer();
    }

    function startExam() {
        if (exam.active) return;
        clearTimer();
        clearConfigWarning();

        var sel = state.selections[state.currentType];
        if (sel.basic.size + sel.rendaku.size + sel.yoon.size === 0) {
            showConfigWarning('⚠️ Selecciona al menos una fila básica, algún grupo de rendaku o de yōon.');
            return;
        }
        var queue = Core.buildQueue(state.currentType, sel.basic, sel.rendaku, sel.yoon);
        if (queue.length === 0) {
            showConfigWarning('⚠️ No hay caracteres disponibles con esa selección.');
            return;
        }

        exam.active = true;
        exam.queue = queue;
        exam.index = 0;
        exam.correct = 0;
        exam.wrong = 0;
        exam.waitingNext = false;

        setHidden(optionsPanel, true);
        setHidden(quizArea, false);
        mountQuiz();
        renderQuestion();
    }

    function renderQuestion() {
        if (!exam.active) return;
        if (exam.index >= exam.queue.length) { finishExam(); return; }
        var item = exam.queue[exam.index];
        quizEls.kanaChar.textContent = item.kanaObj.char;
        quizEls.input.value = '';
        quizEls.input.disabled = false;
        quizEls.input.focus(); // foco listo para la siguiente respuesta
        setFeedback('✍️ Escribe el romaji y pulsa Enter.');
        updateStatsUI();
        exam.waitingNext = false;
    }

    function submitAnswer() {
        if (!exam.active || exam.waitingNext) return;
        if (exam.index >= exam.queue.length) return;

        var item = exam.queue[exam.index];
        var result = Core.checkAnswer(item.kanaObj, quizEls.input.value, state.romajiMode);

        if (result.empty) {
            // ALTO-2: campo vacío NO cuenta como fallo; se avisa.
            setFeedback('⚠️ Escribe una respuesta o pulsa «Saltar».');
            return;
        }

        item.userAnswer = result.user;
        item.result = result;
        if (result.correct) { exam.correct++; } else { exam.wrong++; }

        setFeedback(result.correct
            ? ('✅ ¡Correcto! «' + result.expected + '» — siguiente en ' +
                advanceSeconds() + '.')
            : ('❌ Fallo. Respuesta: «' + result.expected + '» (' + item.kanaObj.char + ').'));
        updateStatsUI();
        scheduleNext();
    }

    // v1.2.1 (BAJO-4): el texto del aviso se deriva de ADVANCE_MS en
    // lugar de estar clavado a "2 segundos" (coherencia con la costura
    // de prueba; en producción sigue siendo 2 segundos).
    function advanceSeconds() {
        var s = Math.round((ADVANCE_MS / 1000) * 10) / 10;
        return (s === 1) ? '1 segundo' : s + ' segundos';
    }

    function skipQuestion() {
        if (!exam.active || exam.waitingNext) return;
        if (exam.index >= exam.queue.length) return;
        var item = exam.queue[exam.index];
        item.userAnswer = null;
        item.result = Core.markSkipped(item.kanaObj);
        exam.wrong++;
        setFeedback('⏭️ Saltado. Respuesta: «' + item.result.expected + '» (' + item.kanaObj.char + ').');
        updateStatsUI();
        scheduleNext();
    }

    function scheduleNext() {
        exam.waitingNext = true;
        quizEls.input.disabled = true; // evita teclear durante la espera
        clearTimer();
        exam.timerId = window.setTimeout(function () {
            exam.timerId = null;
            if (!exam.active) return; // guarda: el examen pudo salir mientras esperaba
            exam.index++;
            if (exam.index < exam.queue.length) renderQuestion();
            else finishExam();
        }, ADVANCE_MS);
    }

    // ---------- Integración webxdc (v1.2.0) ----------
    // En Delta Chat/ArcaneChat existe window.webxdc; en navegador puro no,
    // y la app funciona igual (el botón de compartir simplemente no aparece).
    function webxdcAvailable() {
        return typeof window !== 'undefined' &&
            window.webxdc && typeof window.webxdc.sendUpdate === 'function';
    }

    function shareResultToChat(total) {
        var selfName = (window.webxdc && window.webxdc.selfName) || 'Alguien';
        var percent = total === 0 ? 0 : (exam.correct / total) * 100;
        var pct = percent.toFixed(0);
        var scope = state.currentType === 'katakana' ? 'katakana' : 'hiragana';
        window.webxdc.sendUpdate({
            payload: {
                kind: 'kanadojo-score',
                syllabary: scope,
                mode: state.romajiMode,
                correct: exam.correct,
                wrong: exam.wrong,
                total: total,
                percent: percent,
                selfName: selfName
            },
            info: '🎓 ' + selfName + ' obtuvo ' + pct + '% en Kana Dojo (' +
                scope + ': ' + exam.correct + '/' + total + ')',
            summary: 'Kana Dojo: ' + pct + '% (' + exam.correct + '/' + total + ')'
        }, 'resultado del examen');
    }

    function finishExam() {
        clearTimer();
        exam.active = false;
        exam.waitingNext = false;

        var total = exam.queue.length;
        var percent = total === 0 ? 0 : (exam.correct / total) * 100;

        // Resultado construido 100% con DOM seguro (CRÍTICO-2)
        var card = el('div', 'quiz-card');
        var summary = el('div', 'summary');
        summary.appendChild(el('h3', null, '📊 RESULTADO FINAL'));
        summary.appendChild(el('p', null,
            '✅ Aciertos: ' + exam.correct + '  |  ❌ Fallos: ' + exam.wrong + '  |  📋 Total: ' + total));
        var grade = el('p');
        var strong = el('strong', null, 'Calificación: ' + percent.toFixed(1) + '% ');
        grade.appendChild(strong);
        grade.appendChild(document.createTextNode(percent >= 70 ? '🎉 ¡Muy bien!' : '📚 Sigue practicando.'));
        summary.appendChild(grade);
        summary.appendChild(document.createElement('hr'));

        var list = el('div', 'results-list');
        exam.queue.forEach(function (item, idx) {
            var k = item.kanaObj;
            var status = item.result && item.result.correct ? '✅' : '❌';
            // v1.2.1 (BAJO-6): se trunca la respuesta mostrada para que una
            // entrada larguísima no deforme la lista (siguió siendo segura:
            // textContent, sin HTML).
            var shownAnswer = item.result && item.result.user ? truncate(item.result.user, 40) : '—';
            list.appendChild(el('div', null,
                status + ' ' + (idx + 1) + '. ' + k.char + ' → ' + k.romaji + ' (Tú: ' + shownAnswer + ')'));
        });
        summary.appendChild(list);

        var restartBtn = el('button', 'btn restart-btn', '🔄 NUEVO EXAMEN');
        restartBtn.type = 'button';
        restartBtn.addEventListener('click', exitExam);
        summary.appendChild(restartBtn);

        // v1.2.0: botón optativo «Compartir en el chat» (solo en webxdc).
        // Se envía UNA sola vez: el botón se desactiva tras el envío para
        // evitar spam al chat por doble clic.
        if (webxdcAvailable()) {
            var shareBtn = el('button', 'btn share-btn', '📤 COMPARTIR EN EL CHAT');
            shareBtn.type = 'button';
            var sent = false;
            shareBtn.addEventListener('click', function () {
                if (sent) return;
                sent = true;
                try {
                    shareResultToChat(total);
                    shareBtn.textContent = '✅ Enviado al chat';
                    shareBtn.disabled = true;
                } catch (e) {
                    // Envío fallido (host antiguo, permiso…): la app sigue
                    // usable; se permite reintentar.
                    sent = false;
                    shareBtn.textContent = '⚠️ No se pudo enviar · reintentar';
                }
            });
            summary.appendChild(shareBtn);
        }

        card.appendChild(summary);
        card.appendChild(el('div', 'small-note', 'Podrás elegir filas básicas, rendakus y yōon nuevamente.'));
        quizArea.replaceChildren ? quizArea.replaceChildren(card) : (function () {
            while (quizArea.firstChild) quizArea.removeChild(quizArea.firstChild);
            quizArea.appendChild(card);
        })();

        quizEls = { kanaChar: null, input: null, feedback: null, progress: null, total: null, skipBtn: null, exitBtn: null };
        restartBtn.focus(); // foco accesible tras destruir el input (ALTO-4)
    }

    function exitExam() {
        clearTimer();
        exam.active = false;
        exam.waitingNext = false;
        exam.queue = [];
        exam.index = 0;
        exam.correct = 0;
        exam.wrong = 0;
        quizEls = { kanaChar: null, input: null, feedback: null, progress: null, total: null, skipBtn: null, exitBtn: null };
        setHidden(quizArea, true);
        setHidden(optionsPanel, false);
        renderChips();
        updateTypeButtonsUI();
        updateModeButtonsUI();
        // v1.2.1 (BAJO-5): el elemento enfocado (p. ej. «Salir del examen»)
        // fue destruido al vaciar quizArea; sin esta línea el foco quedaba
        // en <body> y la navegación por teclado se reiniciaba desde arriba.
        if (startBtn) startBtn.focus();
    }

    // v1.2.1 (BAJO-6): truncado seguro por unidades de código UTF-16
    // (los kana yōon miden 2 unidades; el corte nunca parte un emoji
    // sustituto porque la respuesta ya está saneada a a-z).
    function truncate(text, max) {
        if (typeof text !== 'string') return '—';
        return text.length <= max ? text : text.slice(0, max - 1) + '…';
    }

    // ---------- Eventos del panel ----------
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

        typeBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (exam.active) return;
                var type = btn.getAttribute('data-type');
                if (type !== 'hiragana' && type !== 'katakana') return;
                if (type === state.currentType) return;
                state.currentType = type;
                renderChips();
                updateTypeButtonsUI();
                // Las selecciones del otro silabario se conservan (BAJO-6).
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
    }

    function init() {
        loadState();
        renderChips();
        updateTypeButtonsUI();
        updateModeButtonsUI();
        bindEvents();
        setHidden(quizArea, true);
        setHidden(optionsPanel, false);
    }

    init();
})();
