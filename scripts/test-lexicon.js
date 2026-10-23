/* Comprobaciones de palabras y kanji. node scripts/test-lexicon.js */
'use strict';

const assert = require('assert');
const Lex = require('../lexicon.js');

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

function uniq(list, key) {
    const seen = new Map();
    for (const item of list) {
        const value = key(item);
        assert.strictEqual(seen.has(value), false, 'duplicado ' + value);
        seen.set(value, item.id);
    }
}

check('la lista tiene el tamaño previsto y grupos válidos', () => {
    assert.strictEqual(Lex.WORDS.length, 112);
    assert.strictEqual(Lex.KANJI.length, 78);
    const wordGroups = new Set(Lex.WORD_GROUPS.map((g) => g.id));
    const kanjiGroups = new Set(Lex.KANJI_GROUPS.map((g) => g.id));
    uniq(Lex.WORDS, (w) => w.id);
    uniq(Lex.KANJI, (k) => k.id);
    uniq(Lex.WORDS, (w) => w.es);
    uniq(Lex.KANJI, (k) => k.es);
    uniq(Lex.KANJI, (k) => k.char);
    uniq(Lex.WORDS, (w) => w.kanji || w.kana);
    for (const word of Lex.WORDS) assert.ok(wordGroups.has(word.group), word.id);
    for (const kanji of Lex.KANJI) assert.ok(kanjiGroups.has(kanji.group), kanji.id);
    assert.ok(Lex.WORD_STARTER.every((id) => wordGroups.has(id)));
    assert.ok(Lex.KANJI_STARTER.every((id) => kanjiGroups.has(id)));
});

check('el modo inverso de lectura no usa un homófono como distractor', () => {
    const hi = Lex.KANJI.find((k) => k.char === '日');
    const choices = Lex.buildChoices(hi, Lex.DIRECTIONS.KANJI_READING, () => 0);
    assert.ok(choices.some((k) => k.id === hi.id));
    assert.strictEqual(choices.some((k) => k.char === '火'), false);
    assert.strictEqual(new Set(choices.map((k) => k.reading)).size, choices.length);
    assert.strictEqual(Lex.checkChoice(hi, hi.id).correct, true);
    assert.strictEqual(Lex.checkChoice(hi, 'k-ka').correct, false);
    assert.strictEqual(Lex.checkChoice(hi, '').empty, true);
});

check('una palabra con kanji muestra la lectura y no la esconde en español', () => {
    const mizu = Lex.WORDS.find((w) => w.id === 'mizu');
    const shown = Lex.view(mizu, Lex.DIRECTIONS.WORD_ES);
    assert.strictEqual(shown.prompt, '水');
    assert.strictEqual(shown.furigana, 'みず');
    assert.strictEqual(shown.answer, 'agua');
    assert.strictEqual(shown.speakOnShow, true);
    const back = Lex.view(mizu, Lex.DIRECTIONS.ES_WORD);
    assert.strictEqual(back.prompt, 'agua');
    assert.strictEqual(back.speakOnShow, false);
    assert.strictEqual(back.choiceText, '水');
    assert.strictEqual(back.choiceSub, 'みず');
    assert.strictEqual(Lex.WORDS.find((w) => w.id === 'wa-part').speak, 'わ');
    const sun = Lex.view(Lex.KANJI.find((k) => k.char === '日'), Lex.DIRECTIONS.KANJI_READING);
    assert.strictEqual(sun.speakOnShow, false);
    assert.strictEqual(sun.answer, 'ひ');
});

check('una instantánea de palabras conserva el id elegido', () => {
    const saved = Lex.parseExamSnapshot({
        v: 3,
        practice: 'words',
        direction: 'word-es',
        index: 0,
        items: [{
            id: 'mizu',
            user: 'kawa',
            correct: false,
            skipped: false,
            choices: ['mizu', 'kawa', 'yama']
        }, {
            id: 'yama'
        }]
    });
    assert.strictEqual(saved.practice, 'words');
    assert.strictEqual(saved.queue[0].result.user, 'kawa');
    assert.strictEqual(saved.queue[0].result.expected, 'mizu');
    assert.strictEqual(saved.wrong, 1);
    assert.deepStrictEqual(saved.queue[0].choices.map((w) => w.id), ['mizu', 'kawa', 'yama']);
    assert.ok(saved.queue[1].choices.some((w) => w.id === 'yama'));
    assert.strictEqual(saved.queue[1].result, null);
    assert.strictEqual(Lex.parseExamSnapshot({ v: 1, practice: 'words', direction: 'word-es', index: 0, items: [{ id: 'mizu' }] }), null);
    assert.strictEqual(Lex.parseExamSnapshot({
        v: 3, practice: 'kanji', direction: 'kanji-es', index: 0, items: [{ id: 'no-existe' }]
    }), null);
});

check('las frases distinguen el hueco y no repiten la partícula', () => {
    assert.strictEqual(Lex.PHRASES.length, 51);
    const groups = new Set(Lex.PHRASE_GROUPS.map((g) => g.id));
    const seenEs = new Set();
    const seenJp = new Set();
    for (const phrase of Lex.PHRASES) {
        assert.ok(groups.has(phrase.group), phrase.id);
        assert.strictEqual(seenEs.has(phrase.es), false, phrase.es);
        assert.strictEqual(seenJp.has(phrase.jp), false, phrase.jp);
        seenEs.add(phrase.es);
        seenJp.add(phrase.jp);
        if (phrase.particle) assert.ok(phrase.blank.includes('＿'), phrase.id);
    }
    const particleQueue = Lex.buildQueue('phrases', ['desu'], 'particle');
    assert.ok(particleQueue.every((item) => item.lex.particle));
    assert.strictEqual(particleQueue.some((item) => item.lex.id === 'p-genki'), false);
    assert.strictEqual(Lex.buildQueue('phrases', ['lugar'], 'particle').some((item) => item.lex.id === 'p-eki-e'), false);
    const sample = Lex.PHRASES.find((p) => p.id === 'p-gakusei');
    const choices = Lex.buildChoices(sample, 'particle', () => 0.2);
    assert.strictEqual(new Set(choices.map((p) => p.particle)).size, choices.length);
    assert.ok(choices.some((p) => p.id === 'p-gakusei'));
    const shown = Lex.view(sample, 'particle');
    assert.strictEqual(shown.prompt, '私＿学生です');
    assert.strictEqual(shown.note, 'Soy estudiante.');
    assert.strictEqual(shown.speakOnShow, false);
    assert.strictEqual(shown.choiceText, 'は');
    const meaning = Lex.view(sample, 'phrase-es');
    assert.strictEqual(meaning.speakOnShow, true);
    assert.strictEqual(meaning.furigana, 'わたしはがくせいです');
    const saved = Lex.parseExamSnapshot({
        v: 3,
        practice: 'phrases',
        direction: 'particle',
        index: 0,
        items: [{ id: 'p-gakusei', user: 'p-tabemasu', correct: false, skipped: false, choices: ['p-gakusei', 'p-tabemasu', 'p-nomimasu'] }]
    });
    assert.strictEqual(saved.queue[0].result.user, 'p-tabemasu');
    assert.strictEqual(new Set(saved.queue[0].choices.map((p) => p.particle)).size, saved.queue[0].choices.length);
});

check('la cola inicial no mezcla temas no elegidos', () => {
    const queue = Lex.buildQueue('words', ['saludos'], 'es-word', () => 0.3);
    assert.ok(queue.length > 1);
    assert.ok(queue.every((item) => item.lex.group === 'saludos'));
    assert.ok(queue.every((item) => item.choices.some((c) => c.id === item.lex.id)));
    assert.strictEqual(Lex.buildQueue('kanji', [], 'kanji-es').length, 0);
});

if (failed) {
    console.error('\n' + failed + ' comprobaciones fallaron');
    process.exit(1);
}
console.log('\ntodas las comprobaciones pasaron');
