/* Comprobaciones de los textos cortos. node scripts/test-readings.js */
'use strict';

const assert = require('assert');
const Readings = require('../readings.js');

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

check('cada nivel tiene textos propios y respuestas distintas', () => {
    const ids = new Set();
    for (const level of ['n5', 'n4', 'n3', 'n2', 'n1']) {
        const questions = Readings.questionsFor(level);
        assert.strictEqual(questions.length, 4, level);
        const answers = new Set();
        for (const question of questions) {
            assert.strictEqual(ids.has(question.id), false, question.id);
            ids.add(question.id);
            assert.strictEqual(question.choices.length, 4, question.id);
            assert.ok(question.answer >= 0 && question.answer < 4, question.id);
            assert.ok(question.jp && question.kana && question.ask, question.id);
            answers.add(question.answer);
            assert.strictEqual(Readings.check(question, String(question.answer)).correct, true);
            assert.strictEqual(Readings.check(question, String((question.answer + 1) % 4)).correct, false);
            assert.strictEqual(Readings.check(question, '').empty, true);
        }
        assert.ok(answers.size > 1, level);
    }
    assert.strictEqual(ids.size, 20);
});

check('una instantánea de lectura no repregunta lo ya respondido', () => {
    const first = Readings.questionsFor('n5')[0];
    const saved = Readings.parseExamSnapshot({
        v: 4,
        practice: 'reading',
        level: 'n5',
        index: 0,
        items: [{ id: first.id, user: String(first.answer), correct: true, skipped: false }]
    });
    assert.ok(saved);
    assert.strictEqual(saved.queue.length, 1);
    assert.strictEqual(saved.waitingNext, true);
    assert.strictEqual(saved.correct, 1);
    assert.strictEqual(saved.wrong, 0);
    assert.strictEqual(saved.skipped, 0);
    assert.strictEqual(Readings.parseExamSnapshot({ v: 4, practice: 'words', items: [{ id: first.id }] }), null);
});

if (failed) {
    console.error('\n' + failed + ' comprobaciones fallaron');
    process.exit(1);
}
console.log('\ntodas las comprobaciones pasaron');
