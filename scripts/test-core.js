/* Comprobaciones de la lógica pura. node scripts/test-core.js */
'use strict';

const assert = require('assert');
const Core = require('../core.js');

let failed = 0;
function check(name, fn) {
    try {
        fn();
        console.log('ok  ' + name);
    } catch (err) {
        failed++;
        console.error('FAIL ' + name);
        console.error('     ' + err.message);
    }
}

function kana(ch) {
    const hit = Core.KANA_DB.find((k) => k.char === ch);
    assert.ok(hit, 'falta ' + ch);
    return hit;
}

check('la base no duplica type+carácter', () => {
    const seen = new Set();
    for (const k of Core.KANA_DB) {
        const id = k.type + ':' + k.char;
        assert.strictEqual(seen.has(id), false, id);
        seen.add(id);
    }
    assert.strictEqual(Core.KANA_DB.length, 208);
});

check('は no acepta wa; へ no acepta e', () => {
    for (const mode of ['strict', 'flexible']) {
        assert.strictEqual(Core.checkAnswer(kana('は'), 'wa', mode).correct, false);
        assert.strictEqual(Core.checkAnswer(kana('は'), 'ha', mode).correct, true);
        assert.strictEqual(Core.checkAnswer(kana('へ'), 'e', mode).correct, false);
        assert.strictEqual(Core.checkAnswer(kana('へ'), 'he', mode).correct, true);
    }
});

check('aliases flexibles nuevos y el estricto no los hereda', () => {
    const cases = [
        ['づ', 'dzu'],
        ['ヅ', 'dzu'],
        ['しゃ', 'shya'],
        ['シュ', 'shyu'],
        ['しょ', 'shyo']
    ];
    for (const [ch, alias] of cases) {
        assert.strictEqual(Core.checkAnswer(kana(ch), alias, 'flexible').correct, true, ch + ' ' + alias);
        assert.strictEqual(Core.checkAnswer(kana(ch), alias, 'strict').correct, false, ch + ' strict ' + alias);
    }
    assert.strictEqual(Core.checkAnswer(kana('を'), 'o', 'strict').correct, false);
    assert.strictEqual(Core.checkAnswer(kana('を'), 'o', 'flexible').correct, true);
    assert.strictEqual(Core.checkAnswer(kana('を'), 'wo', 'strict').correct, true);
});

check('sanitize rechaza no-strings y normaliza ancho completo', () => {
    assert.strictEqual(Core.sanitizeRomaji(['k', 'a']), '');
    assert.strictEqual(Core.sanitizeRomaji(true), '');
    assert.strictEqual(Core.sanitizeRomaji('ＳＨＩ!'), 'shi');
    assert.strictEqual(Core.sanitizeRomaji("n'"), 'n');
});

check('textos de compartir caben en los límites de la spec', () => {
    const samples = [
        [83, 104, 'hiragana', '80% (83/104)', '80% (83/104) en hiragana'],
        [104, 104, 'katakana', '100% (104/104)', '100% (104/104) en katakana'],
        [0, 1, 'katakana', '0% (0/1)', '0% (0/1) en katakana'],
        [0, 0, 'hiragana', '0% (0/0)', '0% (0/0) en hiragana']
    ];
    for (const [correct, total, scope, summary, info] of samples) {
        const text = Core.buildShareText(correct, total, scope);
        assert.strictEqual(text.summary, summary);
        assert.strictEqual(text.info, info);
        assert.ok([...text.summary].length <= 20, text.summary);
        assert.ok([...text.info].length <= 50, text.info);
        assert.strictEqual(/[\r\n]/.test(text.info + text.summary), false);
    }
    const words = Core.buildShareText(8, 10, 'palabras');
    assert.strictEqual(words.summary, '80% (8/10)');
    assert.strictEqual(words.info, '80% (8/10) en palabras');
    const kanji = Core.buildShareText(78, 78, 'kanji');
    assert.strictEqual(kanji.info, '100% (78/78) en kanji');
    const frases = Core.buildShareText(5, 7, 'frases');
    assert.strictEqual(frases.info, '71% (5/7) en frases');
    const conj = Core.buildShareText(55, 55, 'conjugación');
    assert.strictEqual(conj.info, '100% (55/55) en conjugación');
    const grammar = Core.buildShareText(8, 10, 'gramática');
    assert.strictEqual(grammar.info, '80% (8/10) en gramática');
    const listen = Core.buildShareText(8, 10, 'escucha');
    assert.strictEqual(listen.info, '80% (8/10) en escucha');
    const reading = Core.buildShareText(4, 4, 'lectura');
    assert.strictEqual(reading.info, '100% (4/4) en lectura');
    assert.strictEqual(Core.buildShareText(8, 10, 'n1').info, '80% (8/10) en hiragana');
    assert.strictEqual(Core.buildShareText(16, 20, 'repaso').info, '80% (16/20) en repaso');
    const now = 1_000_000_000_000;
    const day = 86400000;
    const plan = Core.planReview(
        [{ id: 'fallo', practice: 'words' }],
        [
            { id: 'fallo', practice: 'words', t: now - day },
            { id: 'viejo', practice: 'kanji', t: now - 4 * day },
            { id: 'reciente', practice: 'words', t: now - day },
            { id: 'otro-nivel', practice: 'phrases', t: now - 9 * day }
        ],
        now,
        { limit: 2, dueMs: 3 * day }
    );
    assert.deepStrictEqual(plan.map((row) => row.id), ['fallo', 'otro-nivel']);
    assert.strictEqual(plan[0].reason, 'miss');
    assert.strictEqual(plan[1].reason, 'due');
    assert.ok(!plan.some((row) => row.id === 'reciente' || row.id === 'viejo'));
    assert.strictEqual(Core.planReview([], [{ id: 'reciente', practice: 'words', t: now - day }], now, { dueMs: 3 * day }).length, 0);
    const lesson = Core.buildLessonShareText(5, 5, { number: 1, title: 'Hiragana: Vocales', pass: 70 });
    assert.strictEqual(lesson.info, 'Lección 1. Hiragana: Vocales superada al 100%');
    assert.strictEqual(lesson.summary, 'L1 100%');
    const later = Core.buildLessonShareText(5, 5, { number: 2, title: 'Hiragana: Fila ka', pass: 70 });
    assert.notStrictEqual(later.info, lesson.info);
    assert.ok(later.info.includes('Fila ka'));
    assert.ok(later.info.includes('superada al 100%'));
    const missed = Core.buildLessonShareText(2, 5, { number: 3, title: 'Hiragana: Fila sa', pass: 70 });
    assert.strictEqual(missed.info.includes('superada'), false);
    assert.ok(missed.info.includes('al 40%'));
    const long = Core.buildLessonShareText(3, 3, {
        number: 213,
        title: 'Hiragana combinado: nya, hya, mya, rya',
        pass: 70
    });
    assert.ok([...long.info].length <= 50, long.info);
    assert.ok([...long.summary].length <= 20, long.summary);
    assert.ok(long.info.startsWith('Lección 213. '));
    assert.ok(long.info.endsWith(' superada al 100%'));
    assert.strictEqual(/[\r\n]/.test(long.info + long.summary), false);
    assert.ok([...grammar.info].length <= 50);
    assert.ok([...conj.info].length <= 50, conj.info);
    assert.ok([...frases.info].length <= 50);
    assert.ok([...kanji.info].length <= 50);
    const huge = Core.buildShareText(99999, 99999, 'hiragana\nkatakana');
    assert.ok([...huge.summary].length <= 20);
    assert.ok([...huge.info].length <= 50);
    assert.strictEqual(huge.info.includes('\n'), false);
});

check('una instantánea válida se reanuda sin repreguntar lo ya respondido', () => {
    const saved = Core.parseExamSnapshot({
        v: 1,
        type: 'hiragana',
        mode: 'flexible',
        index: 1,
        waitingNext: false,
        items: [
            { char: 'あ', type: 'hiragana', user: 'a', correct: true, skipped: false },
            { char: 'か', type: 'hiragana', user: 'ga', correct: false, skipped: false },
            { char: 'さ', type: 'hiragana', user: null, correct: null, skipped: null }
        ]
    });
    assert.ok(saved);
    assert.strictEqual(saved.waitingNext, true);
    assert.strictEqual(saved.correct, 1);
    assert.strictEqual(saved.wrong, 1);
    assert.strictEqual(saved.skipped, 0);
    assert.strictEqual(saved.queue[2].result, null);
    assert.strictEqual(saved.queue[1].result.expected, 'ka');
    assert.strictEqual(saved.direction, 'kana-romaji');
});

check('una saltada no cuenta como acierto ni como fallo', () => {
    const saved = Core.parseExamSnapshot({
        v: 1,
        type: 'katakana',
        mode: 'strict',
        index: 0,
        waitingNext: true,
        items: [
            { char: 'ア', type: 'katakana', user: '', correct: false, skipped: true }
        ]
    });
    assert.strictEqual(saved.skipped, 1);
    assert.strictEqual(saved.wrong, 0);
    assert.strictEqual(saved.correct, 0);
    assert.strictEqual(saved.queue[0].result.skipped, true);
    assert.strictEqual(saved.queue[0].result.correct, false);
});

check('instantáneas corruptas se rechazan', () => {
    assert.strictEqual(Core.parseExamSnapshot(null), null);
    const withLesson = Core.parseExamSnapshot({
        v: 2,
        type: 'hiragana',
        mode: 'flexible',
        lessonId: 'l-hiragana',
        index: 0,
        items: [{ char: 'あ', type: 'hiragana', user: null, correct: null, skipped: null }]
    });
    assert.strictEqual(withLesson.lessonId, 'l-hiragana');
    const badLesson = Core.parseExamSnapshot({
        v: 2,
        type: 'hiragana',
        mode: 'flexible',
        lessonId: 'Lección',
        index: 0,
        items: [{ char: 'あ', type: 'hiragana', user: null, correct: null, skipped: null }]
    });
    assert.strictEqual(badLesson.lessonId, '');
    assert.strictEqual(Core.parseExamSnapshot({ v: 2, type: 'hiragana', mode: 'strict', index: 0, items: [] }), null);
    assert.strictEqual(Core.parseExamSnapshot({
        v: 1, type: 'hiragana', mode: 'strict', index: 0,
        items: [{ char: 'ア', type: 'katakana', user: null, correct: null, skipped: null }]
    }), null);
    assert.strictEqual(Core.parseExamSnapshot({
        v: 1, type: 'hiragana', mode: 'nope', index: 0,
        items: [{ char: 'あ', type: 'hiragana' }]
    }), null);
});

check('el modo inverso no usa un homófono como distractor', () => {
    const pool = Core.getFilteredKana('hiragana', [], Core.getRendakuRowsByType('hiragana'), []);
    const ji = pool.find((k) => k.char === 'じ');
    const di = pool.find((k) => k.char === 'ぢ');
    assert.strictEqual(Core.readingCollision(ji, pool), true);
    const choices = Core.buildChoices(ji, pool, () => 0);
    assert.ok(choices.some((k) => k.char === 'じ'));
    assert.strictEqual(choices.some((k) => k.char === 'ぢ'), false);
    assert.ok(choices.length >= 2 && choices.length <= 4);
    assert.strictEqual(new Set(choices.map((k) => k.char)).size, choices.length);
    assert.strictEqual(Core.checkChoice(ji, 'じ').correct, true);
    assert.strictEqual(Core.checkChoice(ji, 'ぎ').correct, false);
    assert.strictEqual(Core.checkChoice(ji, di.char).correct, false);
    assert.strictEqual(Core.checkChoice(ji, 'no').empty, true);
    const alone = Core.buildChoices(kana('あ'), [kana('あ')], () => 0.2);
    assert.deepStrictEqual(alone.map((k) => k.char), ['あ']);
});

check('una instantánea inversa conserva el kana elegido', () => {
    const saved = Core.parseExamSnapshot({
        v: 2,
        type: 'hiragana',
        mode: 'flexible',
        direction: 'romaji-kana',
        index: 0,
        waitingNext: true,
        items: [{
            char: 'か',
            type: 'hiragana',
            user: 'き',
            correct: false,
            skipped: false,
            choices: ['か', 'き', 'く', 'が']
        }, {
            char: 'じ',
            type: 'hiragana'
        }]
    });
    assert.strictEqual(saved.direction, 'romaji-kana');
    assert.strictEqual(saved.queue[0].result.user, 'き');
    assert.strictEqual(saved.queue[0].result.expected, 'か');
    assert.strictEqual(saved.wrong, 1);
    assert.deepStrictEqual(saved.queue[0].choices.map((k) => k.char), ['か', 'き', 'く', 'が']);
    assert.ok(saved.queue[1].choices.some((k) => k.char === 'じ'));
    assert.strictEqual(saved.queue[1].choices.some((k) => k.char === 'ぢ'), false);
    const text = Core.buildShareText(0, 1, 'hiragana', 'romaji-kana');
    assert.strictEqual(text.info, '0% (0/1) en hiragana · inv');
    assert.ok([...text.info].length <= 50);
    assert.ok([...text.summary].length <= 20);
});

check('la cola básica de hiragana tiene 46 y no repite', () => {
    const rows = Core.getBasicRowsByType('hiragana');
    const queue = Core.buildQueue('hiragana', rows, [], [], () => 0);
    assert.strictEqual(queue.length, 46);
    const chars = queue.map((item) => item.kanaObj.char);
    assert.strictEqual(new Set(chars).size, 46);
    assert.ok(queue.every((item) => item.kanaObj.category === 'basic'));
});

if (failed) {
    console.error('\n' + failed + ' comprobación(es) fallida(s)');
    process.exit(1);
}
console.log('\ntodas las comprobaciones pasaron');
