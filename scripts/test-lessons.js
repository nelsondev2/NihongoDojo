/* Comprobaciones del camino. node scripts/test-lessons.js */
'use strict';

const assert = require('assert');
const Core = require('../core.js');
const Lex = require('../lexicon.js');
const Lessons = require('../lessons.js');

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

check('cada lección arma su quiz con ítems que ya existen', () => {
    assert.strictEqual(Lessons.PASS_PERCENT, 70);
    assert.strictEqual(Lessons.LESSONS.length, 213);
    const errors = Lessons.validate(Core, Lex);
    assert.deepStrictEqual(errors, []);
    const ids = new Set();
    for (const lesson of Lessons.LESSONS) {
        assert.strictEqual(ids.has(lesson.id), false, lesson.id);
        ids.add(lesson.id);
        const queue = Lessons.buildQueue(lesson, Core, Lex, () => 0.2);
        const expected = lesson.quiz.practice === 'kana' ? lesson.quiz.chars.length : lesson.quiz.ids.length;
        assert.strictEqual(queue.length, expected, lesson.id);
        if (lesson.quiz.practice === 'kana') {
            assert.ok(queue.every((item) => item.kanaObj && item.kanaObj.type === lesson.quiz.type));
        } else {
            assert.ok(queue.every((item) => item.lex && item.choices && item.choices.some((choice) => choice.id === item.lex.id)));
        }
    }
});

check('el camino propone la primera no superada y no bloquea el resto', () => {
    assert.strictEqual(Lessons.nextLesson({}).id, 'l-h-vocales');
    assert.strictEqual(Lessons.nextLesson({ 'l-h-vocales': { passed: true } }).id, 'l-h-fila-ka');
    const first = Lessons.locate('l-h-vocales');
    assert.strictEqual(first.number, 1);
    assert.strictEqual(first.lesson.title, 'Hiragana: Vocales');
    assert.strictEqual(Lessons.locate('l-h-fila-ka').number, 2);
    const ka = Lessons.findLesson('l-h-fila-ka');
    assert.ok(!ka.teach[0].text.includes('し'));
    assert.ok(ka.teach[0].text.includes('か es ka'));
    assert.ok(ka.quiz.chars.every((ch) => ch.length === 1 && ch !== 'ー'));
    const all = {};
    Lessons.lessonsFor('n5').forEach((lesson) => { all[lesson.id] = { passed: true }; });
    assert.strictEqual(Lessons.nextLesson(all).id, 'l-h-vocales');
    assert.strictEqual(Lessons.passedCount(all), Lessons.lessonsFor('n5').length);
    assert.strictEqual(Lessons.passedCount({ 'l-g-desu': { passed: false } }), 0);
    const conj = Lessons.findLesson('l-cj-1');
    const queue = Lessons.buildQueue(conj, Core, Lex, () => 0.1);
    assert.ok(queue.some((item) => item.lex.form === 'て'));
    assert.ok(queue.some((item) => item.lex.form === 'ます'));
    const grammar = Lessons.findLesson('l-g-desu');
    assert.strictEqual(grammar.quiz.practice, 'grammar');
    assert.ok(Lessons.buildQueue(grammar, Core, Lex, () => 0.1).length > 0);
});

check('el N4 no mezcla el camino ni el catálogo del N5', () => {
    const n4 = Lessons.lessonsFor('n4');
    assert.ok(n4.length > 199);
    assert.strictEqual(Lessons.nextLesson({}, 'n4').id, 'l-n4-puente');
    assert.strictEqual(Lessons.passedCount({}, 'n4'), 0);
    assert.strictEqual(Lessons.passedCount({ 'l-n4-puente': { passed: true } }, 'n5'), 0);
    const n5ids = new Set(Lessons.LESSONS.map((lesson) => lesson.id));
    for (const lesson of n4) {
        assert.strictEqual(lesson.level, 'n4');
        assert.strictEqual(n5ids.has(lesson.id), false, lesson.id);
        assert.ok(lesson.id.length <= 80, lesson.id);
        const queue = Lessons.buildQueue(lesson, Core, Lex, () => 0.2);
        const expected = lesson.quiz.ids.length;
        assert.strictEqual(queue.length, expected, lesson.id);
        if (lesson.quiz.practice === 'reading') {
            assert.ok(queue.every((item) => item.reading && item.reading.level === 'n4'), lesson.id);
        } else {
            assert.ok(queue.every((item) => item.lex && item.lex.level === 'n4'), lesson.id);
        }
    }
    const pack = Lex.forLevel('n4');
    assert.strictEqual(pack.WORDS.length, 630);
    assert.strictEqual(pack.KANJI.length, 169);
    assert.strictEqual(Lex.WORDS.length, 699);
});

check('el N3 no mezcla el camino ni el catálogo del N4', () => {
    const n3 = Lessons.lessonsFor('n3');
    assert.ok(n3.length > 317);
    assert.strictEqual(Lessons.nextLesson({}, 'n3').id, 'l-n3-puente');
    assert.strictEqual(Lessons.passedCount({ 'l-n3-puente': { passed: true } }, 'n4'), 0);
    const other = new Set(Lessons.LESSONS.concat(Lessons.lessonsFor('n4')).map((lesson) => lesson.id));
    for (const lesson of n3) {
        assert.strictEqual(lesson.level, 'n3');
        assert.strictEqual(other.has(lesson.id), false, lesson.id);
        const queue = Lessons.buildQueue(lesson, Core, Lex, () => 0.2);
        assert.strictEqual(queue.length, lesson.quiz.ids.length, lesson.id);
        if (lesson.quiz.practice === 'reading') {
            assert.ok(queue.every((item) => item.reading && item.reading.level === 'n3'), lesson.id);
        } else {
            assert.ok(queue.every((item) => item.lex && item.lex.level === 'n3'), lesson.id);
        }
    }
    const pack = Lex.forLevel('n3');
    assert.strictEqual(pack.WORDS.length, 1659);
    assert.strictEqual(pack.KANJI.length, 387);
    assert.ok(pack.CONJ.some((item) => item.form === 'ず'));
    assert.ok(!Lex.CONJ.some((item) => item.form === 'ず'));
});

check('el N2 no mezcla el camino ni el catálogo del N3', () => {
    const n2 = Lessons.lessonsFor('n2');
    assert.ok(n2.length > 369);
    assert.strictEqual(Lessons.nextLesson({}, 'n2').id, 'l-n2-puente');
    assert.strictEqual(Lessons.passedCount({ 'l-n2-puente': { passed: true } }, 'n3'), 0);
    const other = new Set(Lessons.LESSONS.concat(Lessons.lessonsFor('n4'), Lessons.lessonsFor('n3')).map((lesson) => lesson.id));
    for (const lesson of n2) {
        assert.strictEqual(lesson.level, 'n2');
        assert.strictEqual(other.has(lesson.id), false, lesson.id);
        const queue = Lessons.buildQueue(lesson, Core, Lex, () => 0.2);
        assert.strictEqual(queue.length, lesson.quiz.ids.length, lesson.id);
        if (lesson.quiz.practice === 'reading') {
            assert.ok(queue.every((item) => item.reading && item.reading.level === 'n2'), lesson.id);
        } else {
            assert.ok(queue.every((item) => item.lex && item.lex.level === 'n2'), lesson.id);
        }
    }
    const pack = Lex.forLevel('n2');
    assert.strictEqual(pack.WORDS.length, 1778);
    assert.strictEqual(pack.KANJI.length, 398);
    assert.ok(pack.CONJ.some((item) => item.jp === '刷ります' || item.kana === 'すります'));
    assert.ok(pack.CONJ.some((item) => item.form === 'まい' && item.jp === '応ずるまい'));
});

check('el N1 no mezcla el camino ni el catálogo del N2', () => {
    const n1 = Lessons.lessonsFor('n1');
    assert.ok(n1.length > 574);
    assert.strictEqual(Lessons.nextLesson({}, 'n1').id, 'l-n1-puente');
    assert.strictEqual(Lessons.passedCount({ 'l-n1-puente': { passed: true } }, 'n2'), 0);
    const other = new Set(Lessons.LESSONS.concat(Lessons.lessonsFor('n4'), Lessons.lessonsFor('n3'), Lessons.lessonsFor('n2')).map((lesson) => lesson.id));
    for (const lesson of n1) {
        assert.strictEqual(lesson.level, 'n1');
        assert.strictEqual(other.has(lesson.id), false, lesson.id);
        const queue = Lessons.buildQueue(lesson, Core, Lex, () => 0.2);
        assert.strictEqual(queue.length, lesson.quiz.ids.length, lesson.id);
        if (lesson.quiz.practice === 'reading') {
            assert.ok(queue.every((item) => item.reading && item.reading.level === 'n1'), lesson.id);
        } else {
            assert.ok(queue.every((item) => item.lex && item.lex.level === 'n1'), lesson.id);
        }
    }
    const pack = Lex.forLevel('n1');
    assert.strictEqual(pack.WORDS.length, 3070);
    assert.strictEqual(pack.KANJI.length, 1345);
    assert.ok(pack.CONJ.some((item) => item.jp === '擦ります' || item.kana === 'かすります'));
    assert.ok(pack.CONJ.some((item) => item.jp === '演じます（演ずる）'));
    assert.ok(pack.CONJ.some((item) => item.jp === '演じます（演じる）'));
    assert.ok(pack.CONJ.some((item) => item.jp === '問うて'));
    assert.ok(pack.CONJ.some((item) => item.jp === '来って' && item.kana === 'きたって'));
    assert.ok(!pack.CONJ.some((item) => item.jp === '御覧なさい'));
});

check('cada nivel practica frases, escucha y lectura, y un nivel ausente no es el N5', () => {
    assert.deepStrictEqual(Lessons.lessonsFor('n9'), []);
    assert.notStrictEqual(Lessons.lessonsFor('n9'), Lessons.LESSONS);
    for (const level of ['n5', 'n4', 'n3', 'n2', 'n1']) {
        const list = Lessons.lessonsFor(level);
        assert.ok(list.some((lesson) => lesson.quiz.practice === 'phrases' && lesson.quiz.direction === 'phrase-es'), level);
        assert.ok(list.some((lesson) => lesson.quiz.direction === 'listen-es'), level);
        assert.ok(list.some((lesson) => lesson.quiz.practice === 'reading'), level);
        assert.ok(list.every((lesson) => lesson.level === level && lesson.id.length <= 80), level);
        const reading = list.filter((lesson) => lesson.quiz.practice === 'reading');
        const covered = new Set(reading.flatMap((lesson) => lesson.quiz.ids));
        assert.ok(covered.size >= 12, level + ' ' + covered.size);
        const pack = Lex.forLevel(level);
        function coveredIds(practice, direction) {
            const ids = new Set();
            list.filter((lesson) => lesson.quiz.practice === practice && lesson.quiz.direction === direction)
                .forEach((lesson) => lesson.quiz.ids.forEach((id) => ids.add(id)));
            return ids.size;
        }
        assert.strictEqual(coveredIds('words', 'listen-es'), pack.WORDS.length, level);
        assert.strictEqual(coveredIds('kanji', 'listen-es'), pack.KANJI.length, level);
        assert.strictEqual(coveredIds('phrases', 'phrase-es'), pack.PHRASES.length, level);
    }
    const first = Lessons.lessonsFor('n5')[0];
    assert.strictEqual(first.id, 'l-h-vocales');
    assert.strictEqual(Lessons.lessonsFor('n4')[0].id, 'l-n4-puente');
});

if (failed) {
    console.error('\n' + failed + ' comprobaciones fallaron');
    process.exit(1);
}
console.log('\ntodas las comprobaciones pasaron');
