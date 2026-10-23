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
    assert.strictEqual(Lex.WORDS.length, 699);
    assert.strictEqual(Lex.KANJI.length, 84);
    assert.strictEqual(Lex.PHRASES.length, 164);
    assert.strictEqual(Lex.GRAMMAR.length, 246);
    const wordGroups = new Set(Lex.WORD_GROUPS.map((g) => g.id));
    const kanjiGroups = new Set(Lex.KANJI_GROUPS.map((g) => g.id));
    uniq(Lex.WORDS, (w) => w.id);
    uniq(Lex.KANJI, (k) => k.id);
    uniq(Lex.WORDS, (w) => w.es);
    uniq(Lex.KANJI, (k) => k.es);
    uniq(Lex.KANJI, (k) => k.char);
    uniq(Lex.GRAMMAR, (g) => g.id);
    uniq(Lex.GRAMMAR, (g) => g.es);
    for (const word of Lex.WORDS) assert.ok(wordGroups.has(word.group), word.id);
    for (const kanji of Lex.KANJI) assert.ok(kanjiGroups.has(kanji.group), kanji.id);
    assert.ok(Lex.WORD_STARTER.every((id) => wordGroups.has(id)));
    assert.ok(Lex.KANJI_STARTER.every((id) => kanjiGroups.has(id)));
    const hot = Lex.WORDS.filter((w) => w.kana === 'あつい');
    assert.ok(hot.length >= 2);
    assert.strictEqual(new Set(hot.map((w) => w.es)).size, hot.length);
});

check('el modo inverso de lectura no usa un homófono como distractor', () => {
    const hi = Lex.KANJI.find((k) => k.char === '日');
    const choices = Lex.buildChoices(hi, Lex.DIRECTIONS.KANJI_READING, () => 0);
    assert.ok(choices.some((k) => k.id === hi.id));
    assert.strictEqual(choices.some((k) => k.char === '火'), false);
    assert.strictEqual(new Set(choices.map((k) => k.reading)).size, choices.length);
    assert.strictEqual(Lex.checkChoice(hi, hi.id).correct, true);
    assert.strictEqual(Lex.checkChoice(hi, 'k-火').correct, false);
    assert.strictEqual(Lex.checkChoice(hi, '').empty, true);
});

check('una palabra con kanji muestra la lectura y no la esconde en español', () => {
    const mizu = Lex.WORDS.find((w) => w.id === 'w-69a792520f');
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
    assert.strictEqual(Lex.WORDS.find((w) => w.id === 'w-wa').speak, 'わ');
    assert.strictEqual(Lex.WORDS.find((w) => w.id === 'w-wo').speak, 'お');
    assert.strictEqual(Lex.WORDS.find((w) => w.id === 'w-e').speak, 'え');
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
            id: 'w-69a792520f',
            user: 'w-bcf12e002d',
            correct: false,
            skipped: false,
            choices: ['w-69a792520f', 'w-bcf12e002d', 'w-e8a5cbdf0a']
        }, {
            id: 'w-e8a5cbdf0a'
        }]
    });
    assert.strictEqual(saved.practice, 'words');
    assert.strictEqual(saved.queue[0].result.user, 'w-bcf12e002d');
    assert.strictEqual(saved.queue[0].result.expected, 'w-69a792520f');
    assert.strictEqual(saved.wrong, 1);
    assert.deepStrictEqual(saved.queue[0].choices.map((w) => w.id), ['w-69a792520f', 'w-bcf12e002d', 'w-e8a5cbdf0a']);
    assert.ok(saved.queue[1].choices.some((w) => w.id === 'w-e8a5cbdf0a'));
    assert.strictEqual(saved.queue[1].result, null);
    assert.strictEqual(Lex.parseExamSnapshot({ v: 1, practice: 'words', direction: 'word-es', index: 0, items: [{ id: 'w-69a792520f' }] }), null);
    assert.strictEqual(Lex.parseExamSnapshot({
        v: 3, practice: 'kanji', direction: 'kanji-es', index: 0, items: [{ id: 'no-existe' }]
    }), null);
});

check('las frases distinguen el hueco y no repiten la partícula', () => {
    const groups = new Set(Lex.PHRASE_GROUPS.map((g) => g.id));
    const seenEs = new Set();
    for (const phrase of Lex.PHRASES) {
        assert.ok(groups.has(phrase.group), phrase.id);
        assert.strictEqual(seenEs.has(phrase.es), false, phrase.es);
        seenEs.add(phrase.es);
        if (phrase.particle) assert.ok(phrase.blank.includes('＿'), phrase.id);
    }
    const particleQueue = Lex.buildQueue('phrases', ['cópulas'], 'particle');
    assert.ok(particleQueue.length > 0);
    assert.ok(particleQueue.every((item) => item.lex.particle));
    assert.strictEqual(particleQueue.some((item) => item.lex.id === 'p-de-wa-arimasen-ja-nai-1'), false);
    const sample = Lex.PHRASES.find((p) => p.id === 'p-wa-1');
    const choices = Lex.buildChoices(sample, 'particle', () => 0.2);
    assert.strictEqual(new Set(choices.map((p) => p.particle)).size, choices.length);
    assert.ok(choices.some((p) => p.id === 'p-wa-1'));
    const shown = Lex.view(sample, 'particle');
    assert.strictEqual(shown.prompt, '私＿学生です');
    assert.strictEqual(shown.note, 'En cuanto a mí, soy estudiante.');
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
        items: [{ id: 'p-wa-1', user: 'p-o-1', correct: false, skipped: false, choices: ['p-wa-1', 'p-o-1', 'p-de-place-1'] }]
    });
    assert.strictEqual(saved.queue[0].result.user, 'p-o-1');
    assert.strictEqual(new Set(saved.queue[0].choices.map((p) => p.particle)).size, saved.queue[0].choices.length);
});

check('la conjugación no se guarda como frase y respeta las excepciones', () => {
    assert.strictEqual(Lex.CONJ.length, 1069);
    assert.strictEqual(Lex.CONJ_GROUPS.length, 119);
    uniq(Lex.CONJ, (item) => item.id);
    uniq(Lex.CONJ, (item) => item.es);
    const iku = Lex.CONJ.find((item) => item.jp === '行って' && item.kana === 'いって');
    assert.strictEqual(iku.jp, '行って');
    assert.notStrictEqual(iku.jp, '行いて');
    assert.strictEqual(Lex.CONJ.find((item) => item.jp === 'します' && item.kana === 'します').jp, 'します');
    assert.strictEqual(Lex.CONJ.find((item) => item.jp === '来ます').kana, 'きます');
    const aru = Lex.CONJ.find((item) => item.jp === 'ある');
    assert.strictEqual(Lex.CONJ.find((item) => item.group === aru.group && item.form === 'ない').jp, 'ない');
    assert.strictEqual(Lex.CONJ.some((item) => item.group === aru.group && item.form === 'たい'), false);
    const shown = Lex.view(iku, 'conj-es');
    assert.strictEqual(shown.prompt, '行って');
    assert.strictEqual(shown.furigana, 'いって');
    assert.strictEqual(shown.answer, 'forma て de ir');
    assert.strictEqual(shown.speakOnShow, true);
    const back = Lex.view(iku, 'es-conj');
    assert.strictEqual(back.prompt, 'forma て de ir');
    assert.strictEqual(back.speakOnShow, false);
    assert.strictEqual(back.choiceText, '行って');
    const choices = Lex.buildChoices(iku, 'conj-es', () => 0);
    assert.strictEqual(new Set(choices.map((item) => item.es)).size, choices.length);
    assert.ok(choices.every((item) => item.group === iku.group));
    assert.strictEqual(Lex.buildQueue('conj', [iku.group], 'es-conj', () => 0.4).length, 9);
    const saved = Lex.parseExamSnapshot({
        v: 3,
        practice: 'conj',
        direction: 'conj-es',
        lessonId: 'l-cj-1',
        index: 0,
        items: [{ id: iku.id, user: null, correct: null, skipped: null }]
    });
    assert.strictEqual(saved.lessonId, 'l-cj-1');
    assert.strictEqual(saved.queue[0].lex.jp, '行って');
    assert.strictEqual(Lex.parseExamSnapshot({
        v: 3, practice: 'conj', direction: 'phrase-es', index: 0, items: [{ id: iku.id }]
    }), null);
    assert.strictEqual(Lex.parseExamSnapshot({
        v: 3, practice: 'conj', direction: 'conj-es', lessonId: '../x', index: 0, items: [{ id: iku.id }]
    }).lessonId, '');
});

check('la gramática tiene hueco y no se confunde con una frase', () => {
    const point = Lex.GRAMMAR.find((item) => item.id === 'g-desu');
    assert.strictEqual(point.kind, 'grammar');
    assert.strictEqual(Lex.catalogOf(point), Lex.GRAMMAR);
    const cloze = Lex.GRAMMAR.find((item) => item.id === 'g-desu-1');
    const shown = Lex.view(cloze, 'grammar-blank');
    assert.strictEqual(shown.choiceText, cloze.piece);
    assert.strictEqual(shown.speakOnShow, false);
    const queue = Lex.buildQueue('grammar', ['cópulas'], 'grammar-blank', () => 0.2);
    assert.ok(queue.length > 0);
    assert.ok(queue.every((item) => item.lex.cloze && item.lex.kind === 'grammar'));
    assert.ok(queue.every((item) => item.choices.some((choice) => choice.id === item.lex.id)));
    const saved = Lex.parseExamSnapshot({
        v: 3,
        practice: 'grammar',
        direction: 'grammar-es',
        index: 0,
        items: [{ id: 'g-desu' }]
    });
    assert.strictEqual(saved.queue[0].lex.pattern, '〜です');
});

check('el N4 tiene catálogo propio y no alarga el N5', () => {
    const n4 = Lex.forLevel('n4');
    assert.strictEqual(n4.WORDS.length, 630);
    assert.strictEqual(n4.KANJI.length, 169);
    assert.ok(n4.CONJ.some((item) => item.form === 'potencial'));
    assert.ok(!Lex.CONJ.some((item) => item.form === 'potencial'));
    const queue = n4.buildQueue('conj', n4.CONJ_STARTER, 'conj-es', () => 0.4);
    assert.ok(queue.length > 0);
    assert.ok(queue.every((item) => item.lex.level === 'n4'));
    assert.ok(queue[0].choices.every((choice) => choice.level === 'n4'));
    const n3 = Lex.forLevel('n3');
    assert.strictEqual(n3.WORDS.length, 1659);
    assert.ok(n3.CONJ.some((item) => item.form === 'ず'));
    assert.ok(!n3.CONJ.some((item) => item.form === 'まい'));
    assert.ok(n3.buildQueue('words', n3.WORD_STARTER, 'word-es', () => 0.3).every((item) => item.lex.level === 'n3'));
    const n2 = Lex.forLevel('n2');
    assert.strictEqual(n2.WORDS.length, 1778);
    assert.strictEqual(n2.KANJI.length, 398);
    assert.ok(n2.CONJ.some((item) => item.form === 'まい'));
    assert.ok(!Lex.CONJ.some((item) => item.form === 'まい'));
    assert.ok(n2.buildQueue('conj', n2.CONJ_STARTER, 'conj-es', () => 0.2).every((item) => item.lex.level === 'n2'));
    const n1 = Lex.forLevel('n1');
    assert.strictEqual(n1.WORDS.length, 3070);
    assert.strictEqual(n1.KANJI.length, 1345);
    assert.ok(n1.CONJ.some((item) => item.form === 'まい' && item.jp === '演ずるまい'));
    assert.ok(!Lex.CONJ.some((item) => item.form === 'まい'));
    assert.ok(n1.buildQueue('words', n1.WORD_STARTER, 'word-es', () => 0.2).every((item) => item.lex.level === 'n1'));
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
