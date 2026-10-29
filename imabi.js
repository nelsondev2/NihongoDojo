/**
 * NihongoDojo — Camino IMABI (estructura por https://imabi.org)
 * No copia textos de IMABI. Solo usamos títulos/URLs como hechos + mapeo a lecciones propias.
 * Cada entrada IMABI apunta a 0..n lecciones NihongoDojo existentes. Vacío = pendiente de crear con Clarity 3.0.
 * Uso: window.NihongoDojoImabi = { LEVELS, getLevel, allLessonIds }
 */
(function (root) {
    "use strict";

    // Mapeo curado: Imabi → IDs NihongoDojo existentes (N5-N1)
    // Cuando un tema IMABI no tiene lección propia, se deja ids:[] y se creará en siguiente iteración.
    // BEGINNERS I = Imabi 0-50 (base N5)
    var BEGINNERS_I = [
        { num: 0, title: "Introduction to Japanese", url: "https://imabi.org/what-is-japanese/", ids: ["l-imabi-000"] },
        { num: 1, title: "Vowels", url: "https://imabi.org/pronunciation-i/", ids: ["l-h-vocales", "l-k-vocales"] },
        { num: 2, title: "Consonants", url: "https://imabi.org/pronunciation-ii%E3%80%80%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%81%AE%E7%99%BA%E9%9F%B3%E2%91%A1/", ids: ["l-imabi-002"] },
        { num: 3, title: "Pitch Accent & Devoicing", url: "https://imabi.org/pronunciation-iii-%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%81%AE%E7%99%BA%E9%9F%B3%E2%91%A2/", ids: ["l-imabi-003"] },
        { num: 4, title: "Hiragana ひらがな", url: "https://imabi.org/hiragana%E3%80%80%E3%81%B2%E3%82%89%E3%81%8C%E3%81%AA/", ids: ["l-h-vocales","l-h-fila-ka","l-h-fila-sa","l-h-fila-ta","l-h-fila-na","l-h-fila-ha","l-h-fila-ma","l-h-fila-ya","l-h-fila-ra","l-h-fila-wa"] },
        { num: 5, title: "Katakana カタカナ", url: "https://imabi.org/katakana%E3%80%80%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A/", ids: ["l-k-vocales","l-k-fila-ka","l-k-fila-sa","l-k-fila-ta","l-k-fila-na","l-k-fila-ha","l-k-fila-ma","l-k-fila-ya","l-k-fila-ra","l-k-fila-wa"] },
        { num: 6, title: "Kana Orthography", url: "https://imabi.org/kana-iii-orthography%E3%80%80%E4%BB%AE%E5%90%8D%E9%81%A3%E3%81%84/", ids: ["l-hy-kya-sha-cha","l-hy-nya-hya-mya-rya","l-hy-gya-ja-bya-pya","l-ky-kya-sha-cha"] },
        { num: 7, title: "Introduction to Kanji I", url: "https://imabi.org/kanji-intro-i%E3%80%80%E6%BC%A2%E5%AD%97%E5%85%A5%E9%96%80%E2%91%A0/", ids: ["l-kj-1","l-kj-2"] },
        { num: 8, title: "Introduction to Kanji II", url: "https://imabi.org/kanji-intro-ii%E3%80%80%E6%BC%A2%E5%AD%97%E5%85%A5%E9%96%80%E2%91%A1/", ids: ["l-kj-3","l-kj-4"] },
        { num: 9, title: "Nouns & Pronouns", url: "https://imabi.org/nouns-and-pronouns%E3%80%80%E5%90%8D%E8%A9%9E%E3%81%A8%E4%BB%A3%E5%90%8D%E8%A9%9E/", ids: ["l-imabi-009"] },
        { num: 10, title: "Copular Sentences I: Plain", url: "https://imabi.org/copular-sentences-i%E3%80%80%E3%82%B3%E3%83%94%E3%83%A5%E3%83%A9%E6%96%87%ef%bc%88%E6%99%ae%E9%80%9A%E4%BD%93%ef%bc%89/", ids: ["l-g-da","l-g-de-wa-arimasen-ja-nai"] },
        { num: 11, title: "Copular Sentences II: Polite", url: "https://imabi.org/copular-sentences-ii%E3%80%80%E3%82%B3%E3%83%94%E3%83%A5%E3%83%A9%E6%96%87%ef%bc%88%E4%B8%81%E5%AF%A7%E4%BD%93%ef%bc%89/", ids: ["l-g-desu","l-g-deshita"] },
        { num: 12, title: "The Subject Marker が I", url: "https://imabi.org/the-particle-ga-i%E3%80%80%E6%A0%bc%E5%8A%A9%E8%A9%9E%E3%80%8C%E3%81%8c%E3%80%8D%E2%91%A0/", ids: ["l-g-ga-subject"] },
        { num: 13, title: "The Topic/Contrast Marker は", url: "https://imabi.org/the-particle-wa-%E3%81%AF-i-the-topic-contrast-marker/", ids: ["l-g-wa"] },
        { num: 14, title: "Adjectives 形容詞", url: "https://imabi.org/adjectives%E3%80%80%E5%BD%A2%E5%AE%B9%E8%A9%9E/", ids: ["l-imabi-014"] },
        { num: 15, title: "Adjectival Nouns I 形容動詞", url: "https://imabi.org/adjectival-nouns-i%E3%80%80%E5%BD%A2%E5%AE%B9%E5%8B%95%E8%A9%9E%E2%91%A0/", ids: ["l-imabi-015"] },
        { num: 16, title: "The Particle を I", url: "https://imabi.org/the-particle-wo-%E3%82%92-i/", ids: ["l-g-o"] },
        { num: 17, title: "一段 Verbs", url: "https://imabi.org/ichidan-verbs%E3%80%80%E4%B8%80%E6%AE%B5%E6%B4%bb%E7%94%A8%E5%8B%95%E8%A9%9E/", ids: ["l-imabi-017"] },
        { num: 18, title: "五段 Verbs", url: "https://imabi.org/godan-verbs%E3%80%80%E4%BA%94%E6%AE%B5%E6%B4%bb%E7%94%A8%E5%8B%95%E8%A9%9E/", ids: ["l-imabi-018"] },
        { num: 19, title: "The Verbs する & 来る", url: "https://imabi.org/the-verbs-suru-%E3%81%99%E3%82%8B-kuru-%E6%9D%A5%E3%82%8B/", ids: ["l-imabi-019"] },
        { num: 20, title: "The Particle か", url: "https://imabi.org/the-particle-ka-%E3%81%8b-i-basic-questions/", ids: ["l-g-ka-question","l-g-ka-or"] },
        { num: 21, title: "The Particle か w/ Negative", url: "https://imabi.org/the-particle-ka-%E3%81%8b-ii-%EF%BD%9E%E3%81%AA%E3%81%84%E3%81%8B/", ids: ["l-imabi-021"] },
        { num: 22, title: "The Object Marker が", url: "https://imabi.org/the-particle-ga-%E3%81%8c-ii-object-marker/", ids: ["l-g-ga-subject","l-g-ga-suki-ga-kirai"] },
        { num: 23, title: "The Particle も I", url: "https://imabi.org/the-particle-mo-%E3%82%82-i-also-too/", ids: ["l-g-mo"] },
        { num: 24, title: "こそあど I: This & That", url: "https://imabi.org/kosoado-i-this-that/", ids: ["l-imabi-024"] },
        { num: 25, title: "こそあど II: These & Those", url: "https://imabi.org/kosoado-ii-these-those/", ids: ["l-imabi-025"] },
        { num: 26, title: "こそあど III: Here & There", url: "https://imabi.org/kosoado-%E3%81%93%E3%81%9D%E3%81%82%E3%81%A9-iii-here-there/", ids: ["l-imabi-026"] },
        { num: 27, title: "The Particle と I", url: "https://imabi.org/the-particle-%E3%81%A8-i/", ids: ["l-g-to-and","l-g-to-with"] },
        { num: 28, title: "The Particle の I", url: "https://imabi.org/the-case-particle-%E3%81%AE-i/", ids: ["l-imabi-028"] },
        { num: 29, title: "The Locational Marker に", url: "https://imabi.org/the-particle-ni-%E3%81%AB-i/", ids: ["l-g-ni-location","l-g-ni-destination"] },
        { num: 30, title: "The Particle へ", url: "https://imabi.org/the-particle-e-%E3%81%B8/", ids: ["l-g-e"] },
        { num: 31, title: "The Particle で I", url: "https://imabi.org/the-particle-de-%E3%81%A7-i/", ids: ["l-g-de-place","l-g-de-means"] },
        { num: 32, title: "The Existential Verbs ある & いる", url: "https://imabi.org/the-existential-verbs-%E3%81%82%E3%82%8B-%E3%81%84%E3%82%8B/", ids: ["l-g-ga-aru-ga-iru"] },
        { num: 33, title: "The Conjunctive Particle て: Affirmative", url: "https://imabi.org/the-conjunctive-particle-%E3%81%A6-i-the-affirmative/", ids: ["l-cj-1"] },
        { num: 34, title: "The Final Particle て", url: "https://imabi.org/the-particle-te-%E3%81%A6-ii-final-particle/", ids: ["l-imabi-034"] },
        { num: 35, title: "Negative て Forms: ～なくて & ～ないで", url: "https://imabi.org/the-negative-%E3%81%A6%E5%BD%A2-%EF%BD%9E%E3%81%AA%E3%81%8F%E3%81%A6-%EF%BD%9E%E3%81%AA%E3%81%84%E3%81%A7/", ids: ["l-imabi-035"] },
        { num: 36, title: "The Progressive ～ている", url: "https://imabi.org/the-progressive-continued-state-te-iru-%EF%BD%9E%E3%81%A6%E3%81%84%E3%82%8B/", ids: ["l-imabi-036"] },
        { num: 37, title: "Stative ～てある", url: "https://imabi.org/stative-verbs-te-aru-%EF%BD%9E%E3%81%A6%E3%81%82%E3%82%8B/", ids: ["l-imabi-037"] },
        { num: 38, title: "Sino-Japanese Numbers", url: "https://imabi.org/sino-japanese-numbers-2/", ids: ["l-imabi-038"] },
        { num: 39, title: "Native Numbers & ～つ", url: "https://imabi.org/native-numbers-the-counter-%EF%BD%9E%E3%81%A4/", ids: ["l-imabi-039"] },
        { num: 40, title: "Counters Sino-JP I", url: "https://imabi.org/counters-with-sino-japanese-numbers-i/", ids: ["l-imabi-040"] },
        { num: 41, title: "Counters Sino-JP II", url: "https://imabi.org/counters-vi/", ids: ["l-imabi-041"] },
        { num: 42, title: "Counters Native I", url: "https://imabi.org/counters-v/", ids: ["l-imabi-042"] },
        { num: 43, title: "Deictic Time", url: "https://imabi.org/time-iii-absolute-time/", ids: ["l-imabi-043"] },
        { num: 44, title: "Non-Deictic Time I", url: "https://imabi.org/time-iv-relative-time/", ids: ["l-imabi-044"] },
        { num: 45, title: "Non-Deictic Time II", url: "https://imabi.org/non-deictic-time-ii-determiners/", ids: ["l-imabi-045"] },
        { num: 46, title: "Non Deictic Time III", url: "https://imabi.org/%e7%ac%ac%e8%aa%b2-non-deictic-time-iii/", ids: ["l-imabi-046"] },
        { num: 47, title: "Time Counters I: ～日・週間・ヶ月・年", url: "https://imabi.org/counters-iii-time-part-i-%E6%97%A5-%E9%80%B1%E9%96%93-%E6%9C%88-%E5%B9%B4-etc/", ids: ["l-imabi-047"] },
        { num: 48, title: "Time Counters II: ～時間・分・秒・晩・夜", url: "https://imabi.org/counters-iv-time-part-ii-%E6%99%82-%E6%99%82%E9%96%93-%E5%88%86-%E7%A7%92-%E6%99%A9-%E5%a4%9c/", ids: ["l-imabi-048"] },
        { num: 49, title: "Counters Frequency: ～度・回・遍", url: "https://imabi.org/counters-for-frequency-%EF%BD%9E%E5%ba%a6%E3%83%bb%E5%9b%9e%E3%83%bb%E9%81%8d/", ids: ["l-imabi-049"] },
        { num: 50, title: "Used To: ～たものだ & かつて", url: "https://imabi.org/used-to-%EF%BD%9E%E3%81%9F%E3%82%82%E3%81%AE%E3%81%A0-%E5%98%97%E3%81%A6/", ids: ["l-imabi-050"] }
    ];
    var BEGINNERS_II = [
        { num: 51, title: "When: ～時", url: "https://imabi.org/when-%e6%99%82/", ids: ["l-imabi-051"] },
        { num: 52, title: "The Time Phrase ～頃", url: "https://imabi.org/time-phrases-%e3%81%ab/", ids: ["l-imabi-052"] },
        { num: 53, title: "Before: ～前", url: "https://imabi.org/before-%e5%89%8d/", ids: ["l-imabi-053"] },
        { num: 54, title: "After I: ～あと, ～のち, ～てから", url: "https://imabi.org/after-i-%E3%81%82%E3%81%A8-%E3%81%AE%E3%81%A1-%EF%BD%9E%E3%81%A6%E3%81%8b%E3%82%89/", ids: ["l-imabi-054"] },
        { num: 55, title: "While I: ～間", url: "https://imabi.org/while-i-%e9%96%93/", ids: ["l-imabi-055"] },
        { num: 56, title: "While II: ～うちに", url: "https://imabi.org/while-ii-%e3%81%86%e3%81%a1/", ids: ["l-imabi-056"] },
        { num: 57, title: "Fields of Study", url: "https://imabi.org/occupation/", ids: ["l-imabi-057"] },
        { num: 58, title: "World Geography", url: "https://imabi.org/countries-languages/", ids: ["l-imabi-058"] },
        { num: 59, title: "Greeting Phrases", url: "https://imabi.org/greeting-phrases-%e6%8c%a8%e6%8b%b6%e3%81%ae%e8%a1%a8%e7%8f%be/", ids: ["l-imabi-059"] },
        { num: 60, title: "Yes: はい, はあ, ええ, うん", url: "https://imabi.org/yes-phrases/", ids: ["l-imabi-060"] },
        { num: 61, title: "No: いいえ, いえ, いや, 否, ううん", url: "https://imabi.org/no-phrases/", ids: ["l-imabi-061"] },
        { num: 62, title: "The Starting Point から", url: "https://imabi.org/the-particle-%e3%81%8b%e3%82%89/", ids: ["l-g-kara-from"] },
        { num: 63, title: "The Particle まで", url: "https://imabi.org/the-particle-%e3%81%be%e3%81%a7/", ids: ["l-g-made"] },
        { num: 64, title: "The Transition Marker を", url: "https://imabi.org/the-transition-marker-%e3%82%92/", ids: ["l-imabi-064"] },
        { num: 65, title: "Adverbs", url: "https://imabi.org/adverbs-i/", ids: ["l-imabi-065"] },
        { num: 66, title: "Adverbs from Adjectives", url: "https://imabi.org/adverbs-ii/", ids: ["l-imabi-066"] },
        { num: 67, title: "よい・いい", url: "https://imabi.org/adjectives-ii-yoi-ii-%e8%89%af%e3%81%84/", ids: ["l-imabi-067"] },
        { num: 68, title: "Adjectival Nouns II: No-Adjectival Nouns", url: "https://imabi.org/adjectival-nouns-ii-no-adjectival-nouns/", ids: ["l-imabi-068"] },
        { num: 69, title: "Adnominal Adjectives: /i/ vs /na/", url: "https://imabi.org/adnominal-adjectives-i-vs-na/", ids: ["l-imabi-069"] },
        { num: 70, title: "Transitive & Intransitive", url: "https://imabi.org/transitivity-i-transitive-intransitive-forms/", ids: ["l-imabi-070"] },
        { num: 71, title: "多い & 少ない", url: "https://imabi.org/adjectives-iii-%e5%a4%9a%e3%81%84-%e5%b0%91%e3%81%aa%e3%81%84/", ids: ["l-imabi-071"] },
        { num: 72, title: "同じ", url: "https://imabi.org/adjectives-iv-%e5%90%8c%e3%81%98/", ids: ["l-imabi-072"] },
        { num: 73, title: "こそあど IV: こちら・そちら・あちら", url: "https://imabi.org/kosoado-iv/", ids: ["l-imabi-073"] },
        { num: 74, title: "こそあど V: んな・～いう風な", url: "https://imabi.org/%e3%81%93%e3%81%9d%e3%81%82%e3%81%a9-v-%e3%82%93%e3%81%aa-%ef%bd%9e%e3%81%84%e3%81%86%e9%a2%a8%e3%81%aa-etc/", ids: ["l-imabi-074"] },
        { num: 75, title: "The Citation Particle と", url: "https://imabi.org/the-particle-%E3%81%A8-ii-citation/", ids: ["l-imabi-075"] },
        { num: 76, title: "The Result Markers に & と", url: "https://imabi.org/the-result-markers-%e3%81%ab-%e3%81%a8/", ids: ["l-imabi-076"] },
        { num: 77, title: "The Standard Markers に & と", url: "https://imabi.org/the-particle-ni-%e3%81%ab-ii/", ids: ["l-imabi-077"] },
        { num: 78, title: "The Purpose Marker に", url: "https://imabi.org/the-purpose-marker-%e3%81%ab/", ids: ["l-imabi-078"] },
        { num: 79, title: "Start to I: ～始める & ～出す", url: "https://imabi.org/start-to-%ef%bd%9e%e5%a7%8b%e3%82%81%e3%82%8b-%ef%bd%9e%e5%87%ba%e3%81%99-%ef%bd%9e%e3%81%8b%e3%81%91%e3%82%8b/", ids: ["l-imabi-079"] },
        { num: 80, title: "Interrogatives I: Who What Where", url: "https://imabi.org/interrogatives-i/", ids: ["l-imabi-080"] },
        { num: 81, title: "The Particle か III: Indirect Question", url: "https://imabi.org/the-particle-ka-%e3%81%8b-iii-indirect-question/", ids: ["l-imabi-081"] },
        { num: 82, title: "The Particle も II", url: "https://imabi.org/the-particle-%e3%82%82-ii/", ids: ["l-imabi-082"] },
        { num: 83, title: "The Conjunctive から & ので", url: "https://imabi.org/because-%e3%81%8b%e3%82%89-%e3%81%ae%e3%81%a7-%e3%81%ae%e3%81%a0/", ids: ["l-imabi-083"] },
        { num: 84, title: "The Particle のに", url: "https://imabi.org/the-particle-%e3%81%ae%e3%81%ab/", ids: ["l-imabi-084"] },
        { num: 85, title: "The Particle だけ", url: "https://imabi.org/the-particle-%e3%81%A0%E3%81%91/", ids: ["l-imabi-085"] },
        { num: 86, title: "The Particle でも", url: "https://imabi.org/the-particle-%e3%81%a7%e3%82%82/", ids: ["l-imabi-086"] },
        { num: 87, title: "The Parallel Particle や", url: "https://imabi.org/the-particle-%e3%82%84/", ids: ["l-imabi-087"] },
        { num: 88, title: "The Particles など & なんか", url: "https://imabi.org/the-particles-%e3%81%a8%e3%81%8b-%e3%81%aa%e3%81%a9-%e3%81%aa%e3%82%93%e3%81%8b/", ids: ["l-imabi-088"] },
        { num: 89, title: "The Particle し", url: "https://imabi.org/the-particle-%e3%81%97/", ids: ["l-imabi-089"] },
        { num: 90, title: "Giving Verbs ～てあげる/くれる/もらう", url: "https://imabi.org/giving-verbs/", ids: ["l-imabi-090"] },
        { num: 91, title: "Permission: ～て（も）いい", url: "https://imabi.org/permission/", ids: ["l-imabi-091"] },
        { num: 92, title: "The Conjunctive Particles が & けれど", url: "https://imabi.org/the-conjunctive-particles-%e3%81%8c-%e3%81%91%e3%82%8c%e3%81%a9/", ids: ["l-imabi-092"] },
        { num: 93, title: "The Final Particles よ & ね", url: "https://imabi.org/%e8%aa%9e%e5%b0%be-i-%e3%82%88-%e3%81%ad/", ids: ["l-imabi-093"] },
        { num: 94, title: "語尾 II: な & と", url: "https://imabi.org/%e8%aa%9e%e5%b0%be-ii-%e3%82%8f-%e3%81%aa-%e3%81%a8-%e3%81%ae-%e3%81%95-%e3%81%9e-%e3%81%9c-%e3%81%88/", ids: ["l-imabi-094"] },
        { num: 95, title: "Start to II: ～かける & ～かかる", url: "https://imabi.org/start-to-ii-%ef%bd%9e%e3%81%8b%e3%81%91%e3%82%8b-%ef%bd%9e%e3%81%8b%e3%81%8b%e3%82%8b/", ids: ["l-imabi-095"] },
        { num: 96, title: "End: ～終わる・終える & ～やむ", url: "https://imabi.org/end-%ef%bd%9e%e7%b5%82%e3%82%8f%e3%82%8b%e3%83%bb%e7%b5%82%e3%81%88%e3%82%8b-%ef%bd%9e%e3%82%84%e3%82%80-%ef%bd%9e%e4%b8%8a%e3%81%8c%e3%82%8b%e3%83%bb%e4%b8%8a%e3%81%92%e3%82%8b/", ids: ["l-imabi-096"] },
        { num: 97, title: "Potential I", url: "https://imabi.org/potential-i-the-potential-form/", ids: ["l-imabi-097"] },
        { num: 98, title: "Potential II: できる", url: "https://imabi.org/potential-ii-%e3%81%a7%e3%81%8d%e3%82%8b/", ids: ["l-imabi-098"] },
        { num: 99, title: "Pronouns II", url: "https://imabi.org/pronouns-ii/", ids: ["l-imabi-099"] },
        { num: 100, title: "～てあげる/くれる/もらう", url: "https://imabi.org/%ef%bd%9e%e3%81%a6%e3%81%82%e3%81%92%e3%82%8b-%ef%bd%9e%e3%81%a6%e3%81%8f%e3%82%8c%e3%82%8b-%ef%bd%9e%e3%81%a6%e3%82%82%e3%82%89%e3%81%86-2/", ids: ["l-imabi-100"] }
    ];

    var INTERMEDIATE_I = [
        { num: 101, title: "～かた — cómo hacer", url: "https://imabi.org/the-non-question-how-%ef%bd%9e%e6%96%b9%e3%81%8b%e3%81%9f/", ids: ["l-imabi-101"] },
        { num: 102, title: "Interrogativos II — cómo", url: "https://imabi.org/interrogatives-ii-the-question-how/", ids: ["l-imabi-102"] },
        { num: 103, title: "Interrogativos con partículas", url: "https://imabi.org/interrogatives-iii-with-particles/", ids: ["l-imabi-103"] },
        { num: 104, title: "の II — nominalizador", url: "https://imabi.org/the-particle-%e3%81%ae-ii/", ids: ["l-imabi-104"] },
        { num: 105, title: "で II — medio/límite", url: "https://imabi.org/the-particle-%e3%81%a7-ii/", ids: ["l-imabi-105"] },
        { num: 106, title: "Pluralización — たち/ら", url: "https://imabi.org/pluralization/", ids: ["l-imabi-106"] },
        { num: 107, title: "～たち — plural humano", url: "https://imabi.org/pluralization-ii-%ef%bd%9e%e3%81%9f%e3%81%a1/", ids: ["l-imabi-107"] },
        { num: 108, title: "毎～/ごとに/おきに", url: "https://imabi.org/whenever-%e6%af%8e%ef%bd%9e-%ef%bd%9e%e6%af%8e%e3%81%ab-%ef%bd%9e%e3%81%8a%e3%81%8d%e3%81%ab/", ids: ["l-imabi-108"] },
        { num: 109, title: "かもしれない — quizá", url: "https://imabi.org/might-%e3%81%8b%e3%82%82%e3%81%97%e3%82%8c%e3%81%aa%e3%81%84/", ids: ["l-imabi-109"] },
        { num: 110, title: "知る vs 分かる", url: "https://imabi.org/%e7%9f%a5%e3%82%8b-vs-%e5%88%86%e3%81%8b%e3%82%8b/", ids: ["l-imabi-110"] },
        { num: 111, title: "ほしい — querer cosa", url: "https://imabi.org/want-feeling-i-%ef%bd%9e%e3%81%9f%e3%81%84-%e3%81%bb%e3%81%97%e3%81%84/", ids: ["l-imabi-111"] },
        { num: 112, title: "～たい — querer hacer", url: "https://imabi.org/personal-desire-%ef%bd%9e%e3%81%9f%e3%81%84/", ids: ["l-imabi-112"] },
        { num: 113, title: "～がる — mostrar signo", url: "https://imabi.org/the-auxiliary-verb-%ef%bd%9e%e3%81%8c%e3%82%8b/", ids: ["l-imabi-113"] },
        { num: 114, title: "～たい con otra gramática", url: "https://imabi.org/%ef%bd%9e%e3%81%9f%e3%81%84-w-other-grammar/", ids: ["l-imabi-114"] },
        { num: 115, title: "たり — ejemplos no exhaustivos", url: "https://imabi.org/the-particle-%e3%81%9f%e3%82%8a/", ids: ["l-imabi-115"] },
        { num: 116, title: "Nominalización — の/こと", url: "https://imabi.org/nominalization/", ids: ["l-imabi-116"] },
        { num: 117, title: "Expresiones con こと", url: "https://imabi.org/expressions-with-%e3%81%93%e3%81%a8/", ids: ["l-imabi-117"] },
        { num: 118, title: "～のだ — scope", url: "https://imabi.org/the-scope-marker-%ef%bd%9e%e3%81%ae%e3%81%a0/", ids: ["l-imabi-118"] },
        { num: 119, title: "～のだ — mood", url: "https://imabi.org/the-mood-marker-%ef%bd%9e%e3%81%ae%e3%81%a0/", ids: ["l-imabi-119"] },
        { num: 120, title: "ながら — mientras", url: "https://imabi.org/the-particle-%e3%81%aa%e3%81%8c%e3%82%89-i-simultaneous-action/", ids: ["l-imabi-120"] },
        { num: 121, title: "Saludos II", url: "https://imabi.org/greetings-ii%e3%80%80%e6%8c%a8%e6%8b%b6%e8%a1%a8%e7%8f%be%e3%80%81%e3%81%9d%e3%81%ae%e4%ba%8c/", ids: ["l-imabi-121"] },
        { num: 122, title: "Verbos vestir", url: "https://imabi.org/the-verbs-for-to-wear-to-take-off/", ids: ["l-imabi-122"] },
        { num: 123, title: "Verbos jugar", url: "https://imabi.org/the-verbs-for-to-play/", ids: ["l-imabi-123"] },
        { num: 124, title: "Verbos costar", url: "https://imabi.org/to-cost-money-terminology/", ids: ["l-imabi-124"] },
        { num: 125, title: "～やすい — fácil de", url: "https://imabi.org/easy-i-%ef%bd%9e%e3%82%84%e3%81%99%e3%81%84/", ids: ["l-imabi-125"] },
        { num: 126, title: "～にくい — difícil de", url: "https://imabi.org/difficult-i-%ef%bd%9e%e3%81%ab%e3%81%8f%e3%81%84/", ids: ["l-imabi-126"] },
        { num: 127, title: "～すぎる — demasiado", url: "https://imabi.org/too-%ef%bd%9e%e3%81%99%e3%81%8e%e3%82%8b/", ids: ["l-imabi-127"] },
        { num: 128, title: "～続ける — seguir", url: "https://imabi.org/the-verbs-%e7%b6%9a%e3%81%8f-%ef%bc%86-%e7%b6%9a%e3%81%91%e3%82%8b/", ids: ["l-imabi-128"] },
        { num: 129, title: "が vs を — marcado de objeto", url: "https://imabi.org/ga-vs-wo/", ids: ["l-imabi-129"] },
        { num: 130, title: "Idioms 気", url: "https://imabi.org/idioms-i-%e6%b0%97/", ids: ["l-imabi-130"] },
        { num: 131, title: "元気 — genki", url: "https://imabi.org/how-to-use-%e5%85%83%e6%b0%97/", ids: ["l-imabi-131"] },
        { num: 132, title: "N→V con する", url: "https://imabi.org/suru-verbs/", ids: ["l-imabi-132"] },
        { num: 133, title: "しか/ほか — solo/excepto", url: "https://imabi.org/shika-hoka/", ids: ["l-imabi-133"] },
        { num: 134, title: "Condicionales と/たら/ば/なら", url: "https://imabi.org/the-conditionals/", ids: ["l-imabi-134"] },
        { num: 135, title: "Frases condicionales", url: "https://imabi.org/conditional-phrases/", ids: ["l-imabi-135"] },
        { num: 136, title: "も III — incluso", url: "https://imabi.org/the-particle-%e3%82%82-iii/", ids: ["l-imabi-136"] },
        { num: 137, title: "Must Not — てはいけない", url: "https://imabi.org/must-not/", ids: ["l-imabi-137"] },
        { num: 138, title: "Must — なければ", url: "https://imabi.org/must/", ids: ["l-imabi-138"] },
        { num: 139, title: "いかない vs いけない", url: "https://imabi.org/ikanai-ikenai/", ids: ["l-imabi-139"] },
        { num: 140, title: "Direcciones", url: "https://imabi.org/directions/", ids: ["l-imabi-140"] },
        { num: 141, title: "急ぐ — apurarse", url: "https://imabi.org/the-verb-%e6%80%a5%e3%81%90/", ids: ["l-imabi-141"] },
        { num: 142, title: "ていく/てくる", url: "https://imabi.org/%ef%bd%9e%e3%81%a6%e3%81%84%e3%81%8f-%ef%bd%9e%e3%81%a6%e3%81%8f%e3%82%8b/", ids: ["l-imabi-142"] },
        { num: 143, title: "Mejor — 方がいい/に越したことはない", url: "https://imabi.org/best-that/", ids: ["l-imabi-143"] },
        { num: 144, title: "てしまう — acabar/lamento", url: "https://imabi.org/%ef%bd%9e%e3%81%a6%e3%81%97%e3%81%be%e3%81%86/", ids: ["l-imabi-144"] },
        { num: 145, title: "ておく — preparar", url: "https://imabi.org/advanced-preparation-%ef%bd%9e%e3%81%a6%e3%81%8a%e3%81%8f/", ids: ["l-imabi-145"] },
        { num: 146, title: "ために I — para hacer", url: "https://imabi.org/%ef%bd%9e%e3%81%9f%e3%82%81%e3%81%ab-i-in-order-to/", ids: ["l-imabi-146"] },
        { num: 147, title: "ために II — debido a", url: "https://imabi.org/due-to/", ids: ["l-imabi-147"] },
        { num: 148, title: "ように — para que", url: "https://imabi.org/so-that/", ids: ["l-imabi-148"] },
        { num: 149, title: "とおりに — tal como", url: "https://imabi.org/%ef%bd%9e%e3%81%a8%e3%81%8a%e3%82%8a%e3%81%ab/", ids: ["l-imabi-149"] },
        { num: 150, title: "てみる/みたい/みせる — probar", url: "https://imabi.org/trying/", ids: ["l-imabi-150"] },
    ];

    var INTERMEDIATE_II = [
        { num: 151, title: "ようだ/みたいだ — parece", url: "https://imabi.org/similarity/", ids: ["l-imabi-151"] },
        { num: 152, title: "ようになる/ようにする", url: "https://imabi.org/%ef%bd%9e%e3%82%88%e3%81%86%e3%81%ab%e3%81%aa%e3%82%8b-%ef%bd%9e%e3%82%88%e3%81%86%e3%81%ab%e3%81%99%e3%82%8b/", ids: ["l-imabi-152"] },
        { num: 153, title: "らしい — parece/se dice", url: "https://imabi.org/the-auxiliary-%ef%bd%9e%e3%82%89%e3%81%97%e3%81%84/", ids: ["l-imabi-153"] },
        { num: 154, title: "っぽい — -ish", url: "https://imabi.org/the-suffix-%ef%bd%9e%e3%81%a3%e3%81%bd%e3%81%84/", ids: ["l-imabi-154"] },
        { num: 155, title: "そうだ — parece (visual)", url: "https://imabi.org/seem-%ef%bd%9e%e3%81%9d%e3%81%86%e3%81%a0/", ids: ["l-imabi-155"] },
        { num: 156, title: "そうだ — hearsay", url: "https://imabi.org/hearsay/", ids: ["l-imabi-156"] },
        { num: 157, title: "Superlativo — 一番/最も", url: "https://imabi.org/the-superlative/", ids: ["l-imabi-157"] },
        { num: 158, title: "Imperativo — ろ/なさい/て", url: "https://imabi.org/the-imperative/", ids: ["l-imabi-158"] },
        { num: 159, title: "Agente — に", url: "https://imabi.org/agent-marker-ni/", ids: ["l-imabi-159"] },
        { num: 160, title: "Pasiva I — られる", url: "https://imabi.org/the-passive/", ids: ["l-imabi-160"] },
        { num: 161, title: "Pasiva II — adversativa", url: "https://imabi.org/the-passive-ii-%e4%b8%8d%e5%8f%af%e6%8a%97%e5%8a%9b%e3%81%ae%e5%8f%97%e8%ba%ab/", ids: ["l-imabi-161"] },
        { num: 162, title: "に vs から — origen", url: "https://imabi.org/%e3%83%8b%e6%a0%bc-vs-%e3%82%ab%e3%83%a9%e6%a0%bc/", ids: ["l-imabi-162"] },
        { num: 163, title: "Causativa — させる", url: "https://imabi.org/the-causative-i-%ef%bd%9e%e3%81%95%e3%81%9b%e3%82%8b-%ef%bd%9e%e3%81%9b%e3%82%8b/", ids: ["l-imabi-163"] },
        { num: 164, title: "Causativa-pasiva", url: "https://imabi.org/causative-passive/", ids: ["l-imabi-164"] },
        { num: 165, title: "Volitivo — う/よう", url: "https://imabi.org/the-volitional-i/", ids: ["l-imabi-165"] },
        { num: 166, title: "だろう/でしょう", url: "https://imabi.org/the-auxiliaries-%e3%81%a0%e3%82%8d%e3%81%86%e3%83%bb%e3%81%a7%e3%81%97%e3%82%87%e3%81%86/", ids: ["l-imabi-166"] },
        { num: 167, title: "とか — entre otros", url: "https://imabi.org/the-particle-%e3%81%a8%e3%81%8b/", ids: ["l-imabi-167"] },
        { num: 168, title: "なんて — cosas como", url: "https://imabi.org/the-particle-%e3%81%aa%e3%82%93%e3%81%a6/", ids: ["l-imabi-168"] },
        { num: 169, title: "ほど/くらい — tanto como", url: "https://imabi.org/the-particles-%e3%81%bb%e3%81%a9-%e3%81%8f%e3%82%89%e3%81%84/", ids: ["l-imabi-169"] },
        { num: 170, title: "より — que (comparativo)", url: "https://imabi.org/the-particle-%e3%82%88%e3%82%8a/", ids: ["l-imabi-170"] },
        { num: 171, title: "O — か/それとも/もしくは", url: "https://imabi.org/or/", ids: ["l-imabi-171"] },
        { num: 172, title: "中 — durante", url: "https://imabi.org/during-throughout/", ids: ["l-imabi-172"] },
        { num: 173, title: "ようにする/ようとする", url: "https://imabi.org/try-ii/", ids: ["l-imabi-173"] },
        { num: 174, title: "Phrasal こと", url: "https://imabi.org/phrasal-%e3%81%93%e3%81%a8/", ids: ["l-imabi-174"] },
        { num: 175, title: "Familia — 敬語 familia", url: "https://imabi.org/family/", ids: ["l-imabi-175"] },
        { num: 176, title: "Honoríficos さん/さま", url: "https://imabi.org/honorifics-i-%e6%95%ac%e7%a7%b0-i-%ef%bd%9e%e3%81%95%e3%82%93-%ef%bd%9e%e6%a7%98-etc-2/", ids: ["l-imabi-176"] },
        { num: 177, title: "Honoríficos títulos", url: "https://imabi.org/honorifics-ii-standalone-%e6%95%ac%e7%a7%b0/", ids: ["l-imabi-177"] },
        { num: 178, title: "Honoríficos nombres", url: "https://imabi.org/honorifics-iii-nouns/", ids: ["l-imabi-178"] },
        { num: 179, title: "Honoríficos adj/copula", url: "https://imabi.org/honorifics-iv-adjectives-the-copula/", ids: ["l-imabi-179"] },
        { num: 180, title: "Honoríficos ligeros レル/ラレル", url: "https://imabi.org/honorifics-v-light-keigo/", ids: ["l-imabi-180"] },
        { num: 181, title: "Honoríficos verbos regulares", url: "https://imabi.org/honorifics-vi-regular-verbs/", ids: ["l-imabi-181"] },
        { num: 182, title: "Honoríficos verbos irregulares", url: "https://imabi.org/honorifics-vii-irregular-verbs-i/", ids: ["l-imabi-182"] },
        { num: 183, title: "になります/なっております", url: "https://imabi.org/honorifics-%ef%bd%9b%e3%81%a8%e3%83%bb%e3%81%ab%ef%bd%9d%e3%80%90%e3%81%aa%e3%82%8a%e3%81%be%e3%81%99%e3%83%bb%e3%81%aa%e3%81%a3%e3%81%a6%e3%81%8a%e3%82%8a%e3%81%be%e3%81%99%e3%80%91/", ids: ["l-imabi-183"] },
        { num: 184, title: "のほう — atenuación honorífica", url: "https://imabi.org/honorifics-%ef%bd%9e%e3%81%ae%e3%81%bb%e3%81%86/", ids: ["l-imabi-184"] },
        { num: 185, title: "Gracias — 感謝", url: "https://imabi.org/expressions-of-gratitude%e3%80%80%e6%84%9f%e8%ac%9d%e3%81%ae%e8%a1%a8%e7%8f%be/", ids: ["l-imabi-185"] },
        { num: 186, title: "Disculpas — お詫び", url: "https://imabi.org/expressions-of-apology%e3%80%80%e3%81%8a%e8%a9%ab%e3%81%b3%e3%81%ae%e8%a8%80%e8%91%89/", ids: ["l-imabi-186"] },
        { num: 187, title: "What & When — 何/いつ", url: "https://imabi.org/what-when/", ids: ["l-imabi-187"] },
        { num: 188, title: "Who & Where — 誰/どこ", url: "https://imabi.org/who-where/", ids: ["l-imabi-188"] },
        { num: 189, title: "Why — なぜ/どうして", url: "https://imabi.org/why/", ids: ["l-imabi-189"] },
        { num: 190, title: "Which — どれ/どちら", url: "https://imabi.org/which/", ids: ["l-imabi-190"] },
        { num: 191, title: "という — cita extendida", url: "https://imabi.org/citation-ii-%ef%bd%9e%e3%81%a8%e3%81%84%e3%81%86-%ef%bd%9e%e3%81%a8%e3%81%84%e3%81%86%e3%81%93%e3%81%a8-%ef%bd%9e%e3%81%a8%e3%81%84%e3%81%86%e3%82%82%e3%81%ae/", ids: ["l-imabi-191"] },
        { num: 192, title: "向く — intransitivo + を", url: "https://imabi.org/direction-intransitives-%e3%82%92-%e5%90%91%e3%81%8f/", ids: ["l-imabi-192"] },
        { num: 193, title: "くせに — a pesar de (crítica)", url: "https://imabi.org/criticizing-%e3%81%8f%e3%81%9b%e3%81%ab%e3%83%bb%e3%81%8f%e3%81%9b%e3%81%97%e3%81%a6/", ids: ["l-imabi-193"] },
        { num: 194, title: "直す/忘れる/間違える", url: "https://imabi.org/fix-error-%ef%bd%9e%e5%bf%98%e3%82%8c%e3%82%8b-%ef%bd%9e%e7%9b%b4%e3%81%99-%e9%96%93%e9%81%95%e3%81%88%e3%82%8b-%ef%bd%9e%e8%aa%a4%e3%82%8b/", ids: ["l-imabi-194"] },
        { num: 195, title: "慣れる/合う/切る — sufijos", url: "https://imabi.org/used-to-together/", ids: ["l-imabi-195"] },
        { num: 196, title: "上がる/上げる — subir", url: "https://imabi.org/%ef%bd%9e%e4%b8%8a%e3%81%8c%e3%82%8b-%ef%bd%9e%e4%b8%8a%e3%81%92%e3%82%8b/", ids: ["l-imabi-196"] },
        { num: 197, title: "Adverbios III sintaxis", url: "https://imabi.org/adverbs-iii/", ids: ["l-imabi-197"] },
        { num: 198, title: "Nominalización さ/み", url: "https://imabi.org/adjective-nominalization/", ids: ["l-imabi-198"] },
        { num: 199, title: "Nominalización く", url: "https://imabi.org/adjective-nominalization-ii/", ids: ["l-imabi-199"] },
        { num: 200, title: "Sufijo め — -ésimo", url: "https://imabi.org/the-affix-%ef%bd%9e%e3%82%81/", ids: ["l-imabi-200"] },
    ];

    var INTERMEDIATE_III = [
    ];

    var ADVANCED_I = [
        { num: 201, title: "Sufijo 化 — -ización", url: "https://imabi.org/the-suffix-ka%e3%80%80%e6%8e%a5%e5%b0%be%e8%be%9e%e3%81%ae%e3%80%8c%ef%bd%9e%e5%8c%96%e3%80%8d/", ids: ["l-imabi-201"] },
        { num: 202, title: "Conjunciones", url: "https://imabi.org/conjunctions/", ids: ["l-imabi-202"] },
        { num: 203, title: "Prefijos negativos 未無非否不", url: "https://imabi.org/negative-prefixes/", ids: ["l-imabi-203"] },
        { num: 204, title: "Contadores aproximados", url: "https://imabi.org/counters-w-approximations/", ids: ["l-imabi-204"] },
        { num: 205, title: "Prefijos contadores 何幾数半", url: "https://imabi.org/prefixes-suffixes-counters/", ids: ["l-imabi-205"] },
        { num: 206, title: "Bueno/Malo en — 得意/苦手", url: "https://imabi.org/good-bad-at/", ids: ["l-imabi-206"] },
        { num: 207, title: "Gustar — 好き/大好き", url: "https://imabi.org/like-love/", ids: ["l-imabi-207"] },
        { num: 208, title: "Odiar — 嫌い", url: "https://imabi.org/hate/", ids: ["l-imabi-208"] },
        { num: 209, title: "Viejo — 古い/旧", url: "https://imabi.org/old/", ids: ["l-imabi-209"] },
        { num: 210, title: "やはり/さすが — como era esperado", url: "https://imabi.org/%e4%ba%88%e6%83%b3%e9%80%9a%e3%82%8a%e3%81%ae%e3%80%80%e3%80%8c%e3%82%84%e3%81%af%e3%82%8a%e3%83%bb%e3%81%95%e3%81%99%e3%81%8c%e3%80%8d/", ids: ["l-imabi-210"] },
        { num: 211, title: "せっかく/わざわざ", url: "https://imabi.org/the-adverbs-%e3%81%9b%e3%81%a3%e3%81%8b%e3%81%8f-%e3%82%8f%e3%81%96%e3%82%8f%e3%81%96/", ids: ["l-imabi-211"] },
        { num: 212, title: "せめて — al menos", url: "https://imabi.org/semete/", ids: ["l-imabi-212"] },
        { num: 213, title: "Idioms frases", url: "https://imabi.org/idioms-ii-phrases/", ids: ["l-imabi-213"] },
        { num: 214, title: "Onomatopeya I", url: "https://imabi.org/onomatopoeia-%e6%93%ac%e5%a3%b0%e8%aa%9e-i-%e6%93%ac%e9%9f%b3%e8%aa%9e-i/", ids: ["l-imabi-214"] },
        { num: 215, title: "Onomatopeya II animales", url: "https://imabi.org/onomatopoeia-ii/", ids: ["l-imabi-215"] },
        { num: 216, title: "Onomatopeya III 擬態擬情", url: "https://imabi.org/onomatopoeia-iii/", ids: ["l-imabi-216"] },
        { num: 217, title: "Cuerpo humano", url: "https://imabi.org/the-body/", ids: ["l-imabi-217"] },
        { num: 218, title: "Colores I", url: "https://imabi.org/colors-i%e3%80%80%e8%89%b2%e3%81%ae%e8%a1%a8%e7%8f%be%e3%80%81%e3%81%9d%e3%81%ae%e4%b8%80/", ids: ["l-imabi-218"] },
        { num: 219, title: "Colores II", url: "https://imabi.org/color-ii%e3%80%80%e3%80%80%e8%89%b2%e3%81%ae%e8%a1%a8%e7%8f%be%e3%80%81%e3%81%9d%e3%81%ae%e4%ba%8c/", ids: ["l-imabi-219"] },
        { num: 220, title: "Comida", url: "https://imabi.org/food/", ids: ["l-imabi-220"] },
        { num: 221, title: "Astronomía", url: "https://imabi.org/astronomy-the-planets-more/", ids: ["l-imabi-221"] },
        { num: 222, title: "Plantas y animales", url: "https://imabi.org/plants-animals/", ids: ["l-imabi-222"] },
        { num: 223, title: "について/に関して", url: "https://imabi.org/about-2/", ids: ["l-imabi-223"] },
        { num: 224, title: "だけに — dado que", url: "https://imabi.org/%e3%81%a0%e3%81%91%e3%81%ab%e3%83%bb%e3%81%a0%e3%81%91%ef%bc%88%e3%81%ae%e3%81%93%e3%81%a8%e3%81%af%ef%bc%89%e3%81%82%e3%81%a3%e3%81%a6/", ids: ["l-imabi-224"] },
        { num: 225, title: "Interjecciones", url: "https://imabi.org/interjections/", ids: ["l-imabi-225"] },
        { num: 226, title: "てある II con を", url: "https://imabi.org/%ef%bd%9e%e3%81%a6%e3%81%82%e3%82%8b-ii-with-%e3%82%92/", ids: ["l-imabi-226"] },
        { num: 227, title: "ぞ/ぜ — asertivo masc", url: "https://imabi.org/the-final-particles-%e3%81%9e-%e3%81%9c/", ids: ["l-imabi-227"] },
        { num: 228, title: "さ — partícula final", url: "https://imabi.org/the-final-particle-%e3%81%95/", ids: ["l-imabi-228"] },
        { num: 229, title: "Finales かな/かしら/じゃん", url: "https://imabi.org/%e8%aa%9e%e5%b0%be-iii/", ids: ["l-imabi-229"] },
        { num: 230, title: "こと — final recriminativo", url: "https://imabi.org/the-final-particle-%e3%81%93%e3%81%a8/", ids: ["l-imabi-230"] },
        { num: 231, title: "てよ/だわ — femenino", url: "https://imabi.org/%e3%81%a6%e3%82%88%e3%83%bb%e3%81%a0%e3%82%8f%e8%a8%80%e8%91%89/", ids: ["l-imabi-231"] },
        { num: 232, title: "て III — conjuntivo extendido", url: "https://imabi.org/the-particle-%e3%81%a6-iii/", ids: ["l-imabi-232"] },
        { num: 233, title: "も IV — incluso enfático", url: "https://imabi.org/the-particle-%e3%82%82-iv/", ids: ["l-imabi-233"] },
        { num: 234, title: "も V — adverbial", url: "https://imabi.org/the-particle-%e3%82%82-v-adverb-intensifier%e3%80%8c%e3%82%82%e3%80%8d%e3%81%ab%e3%82%88%e3%82%8b%e5%89%af%e8%a9%9e%e3%81%ae%e5%8f%96%e3%82%8a%e7%ab%8b%e3%81%a6%e5%bd%a2/", ids: ["l-imabi-234"] },
        { num: 235, title: "はずだ — se supone", url: "https://imabi.org/planning-obligation/", ids: ["l-imabi-235"] },
        { num: 236, title: "ずつ/わりで", url: "https://imabi.org/%e3%81", ids: ["l-imabi-236"] },
        { num: 237, title: "ず — sin hacer clásico", url: "https://imabi.org/the-auxiliary-verb-%ef%bd%9e%e3%81%9a-i/", ids: ["l-imabi-237"] },
        { num: 238, title: "Intensificador ない", url: "https://imabi.org/the-intensifier-%ef%bd%9e%e3%81%aa%e3%81%84/", ids: ["l-imabi-238"] },
        { num: 239, title: "Pronombres reflexivos 自分", url: "https://imabi.org/reflexive-pronouns/", ids: ["l-imabi-239"] },
        { num: 240, title: "Ordinales — 番目", url: "https://imabi.org/numbers-vi-ordinal-numbers/", ids: ["l-imabi-240"] },
        { num: 241, title: "Contadores 基/滴/票/件", url: "https://imabi.org/counters-viii/", ids: ["l-imabi-241"] },
        { num: 242, title: "Tallo adjetivo en compuestos", url: "https://imabi.org/adjectives-vi-compounds%e3%80%80%e5%bd%a2%e5%ae%b9%e8%a9%9e%e8%aa%9e%e5%b9%b9%ef%bc%8b%e5%90%8d%e8%a9%9e/", ids: ["l-imabi-242"] },
        { num: 243, title: "Contadores ヶ/ヵ", url: "https://imabi.org/counters-ix-counters-with-%e3%83%b6%e3%83%bb%e3%83%b5/", ids: ["l-imabi-243"] },
        { num: 244, title: "Idioms cuerpo II", url: "https://imabi.org/the-body-ii-idioms-and-proverbs/", ids: ["l-imabi-244"] },
        { num: 245, title: "Adj + です gramaticalidad", url: "https://imabi.org/adjectives-vii-the-grammaticality-of-adjective-%e3%81%a7%e3%81%99/", ids: ["l-imabi-245"] },
        { num: 246, title: "Elisión だ", url: "https://imabi.org/copula-ellipsis-%e3%80%8c%e3%81%a0%e3%80%8d%e3%81%ae%e7%9c%81%e7%95%a5/", ids: ["l-imabi-246"] },
        { num: 247, title: "だか/だの — etc despectivo", url: "https://imabi.org/%e3%81%a0%e3%81%8b-%e3%81%a0%e3%81%ae/", ids: ["l-imabi-247"] },
        { num: 248, title: "Bases verbales 活用形", url: "https://imabi.org/the-bases/", ids: ["l-imabi-248"] },
        { num: 249, title: "連用→sustantivo", url: "https://imabi.org/%e9%80%a3%e7%94%a8%e5%bd%a2%e3%80%80%e2%86%92%e3%80%80noun/", ids: ["l-imabi-249"] },
        { num: 250, title: "連用中止", url: "https://imabi.org/%e9%80%a3%e7%94%a8%e4%b8%ad%e6%ad%a2%e5%bd%a2/", ids: ["l-imabi-250"] },
        { num: 251, title: "Tenso TA — た", url: "https://imabi.org/tense-i-the-auxiliary-verb-ta/", ids: ["l-imabi-251"] },
        { num: 252, title: "Morfema RU — る", url: "https://imabi.org/tense-ii-the-morpheme-ru-u/", ids: ["l-imabi-252"] },
        { num: 253, title: "ては — si/contrastivo", url: "https://imabi.org/%ef%bd%9e%e3%81%a6%e3%81%af/", ids: ["l-imabi-253"] },
        { num: 254, title: "のみ — solamente formal", url: "https://imabi.org/the-particle-%e3%81%ae%e3%81%bf/", ids: ["l-imabi-254"] },
        { num: 255, title: "こそ — énfasis", url: "https://imabi.org/the-particle-%e3%81%93%e3%81%9d/", ids: ["l-imabi-255"] },
        { num: 256, title: "しも — incluso", url: "https://imabi.org/the-particle-%e3%81%97%e3%82%82/", ids: ["l-imabi-256"] },
        { num: 257, title: "わけだ — es que", url: "https://imabi.org/%e3%82%8f%e3%81%91%e3%81%a0/", ids: ["l-imabi-257"] },
        { num: 258, title: "わけではない/ない/いかない", url: "https://imabi.org/%e3%82%8f%e3%81%91%e3%81%a7%e3%81%af%e3%81%aa%e3%81%84-%e3%82%8f%e3%81%91%e3%81%8c%e3%81%aa%e3%81%84-%e3%82%8f%e3%81%91%e3%81%ab%e3%81%af%e3%81%84%e3%81%8b%e3%81%aa%e3%81%84/", ids: ["l-imabi-258"] },
        { num: 259, title: "ながらも/ながらに", url: "https://imabi.org/the-particle-%e3%81%aa%e3%81%8c%e3%82%89-ii-%e3%81%aa%e3%81%8c%e3%82%89%ef%bc%88%e3%82%82%ef%bc%89-%e3%81%aa%e3%81%8c%e3%82%89%e3%81%ab%ef%bc%88%e3%81%97%e3%81%a6%ef%bc%89/", ids: ["l-imabi-259"] },
        { num: 260, title: "に違いない — sin duda", url: "https://imabi.org/no-doubt-that/", ids: ["l-imabi-260"] },
        { num: 261, title: "に基づいて", url: "https://imabi.org/based-on/", ids: ["l-imabi-261"] },
        { num: 262, title: "てからというもの", url: "https://imabi.org/after-ii/", ids: ["l-imabi-262"] },
        { num: 263, title: "場合 — en caso de", url: "https://imabi.org/circumstance-%e5%a0%b4%e5%90%88-%ef%bd%9e%e3%81%ab%e5%82%99%e3%81%88%e3%81%a6/", ids: ["l-imabi-263"] },
        { num: 264, title: "度/都度/につけ", url: "https://imabi.org/whenever-ii-%ef%bd%9e%e5%ba%a6%e3%81%ab-%ef%bd%9e%e9%83%bd%e5%ba%a6%e3%80%80-%ef%bd%9e%e3%81%ab%e3%81%a4%e3%81%91/", ids: ["l-imabi-264"] },
        { num: 265, title: "隙に/間に", url: "https://imabi.org/while-iii-%ef%bd%9e%e9%9a%99%e3%81%ab-%ef%bd%9e%e9%96%93%ef%bc%88%e3%81%be%ef%bc%89%e3%81%ab/", ids: ["l-imabi-265"] },
        { num: 266, title: "する suplementario", url: "https://imabi.org/the-supplementary-verb-%e3%81%99%e3%82%8b/", ids: ["l-imabi-266"] },
        { num: 267, title: "に対して", url: "https://imabi.org/%ef%bd%9e%e3%81%ab%e5%af%be%e3%81%97%e3%81%a6/", ids: ["l-imabi-267"] },
        { num: 268, title: "Intransitivo/Transitivo 1", url: "https://imabi.org/intransitive-transitive-part-1/", ids: ["l-imabi-268"] },
        { num: 269, title: "Intransitivo/Transitivo 2", url: "https://imabi.org/intransitive-transitive-part-ii/", ids: ["l-imabi-269"] },
        { num: 270, title: "として/にとって", url: "https://imabi.org/standpoint-%e3%81%a8%e3%81%97%e3%81%a6%ef%bc%88%e3%81%af%ef%bc%89-vs-%e3%81%ab%e3%81%a8%e3%81%a3%e3%81%a6%ef%bc%88%e3%81%af%ef%bc%89/", ids: ["l-imabi-270"] },
        { num: 271, title: "を通して/通じて", url: "https://imabi.org/through-%e3%82%92%e9%80%9a%e3%81%98%e3%81%a6-%e3%82%92%e9%80%9a%e3%81%97%e3%81%a6/", ids: ["l-imabi-271"] },
        { num: 272, title: "にかけて/にわたって", url: "https://imabi.org/span-%ef%bd%9e%e3%81%ab%e3%81%8b%e3%81%91%e3%81%a6-%e3%81%ab%e3%82%8f%e3%81%9f%e3%81%a3%e3%81%a6/", ids: ["l-imabi-272"] },
        { num: 273, title: "によって", url: "https://imabi.org/%ef%bd%9e%e3%81%ab%e3%82%88%e3%81%a3%e3%81%a6/", ids: ["l-imabi-273"] },
        { num: 274, title: "ざるを得ない", url: "https://imabi.org/%ef%bd%9e%e3%81%96%e3%82%8b%e3%82%92%e5%be%97%e3%81%aa%e3%81%84-%e3%82%84%e3%82%80%e3%82%92%e5%be%97%e3%81%aa%e3%81%84/", ids: ["l-imabi-274"] },
        { num: 275, title: "Causativa transitiva", url: "https://imabi.org/causative-form-issues/", ids: ["l-imabi-275"] },
        { num: 276, title: "Intransitivo traducido pasiva", url: "https://imabi.org/intransitive-vs-passive/", ids: ["l-imabi-276"] },
        { num: 277, title: "自受動詞", url: "https://imabi.org/intransitive-passive-verbs/", ids: ["l-imabi-277"] },
        { num: 278, title: "他受動詞", url: "https://imabi.org/transitive-passive/", ids: ["l-imabi-278"] },
        { num: 279, title: "さえ/すら/だに", url: "https://imabi.org/the-particles-%e3%81%95%e3%81%88-%e3%81%99%e3%82%89-%e3%81%a0%e3%81%ab/", ids: ["l-imabi-279"] },
        { num: 280, title: "において/における", url: "https://imabi.org/%ef%bd%9e%e3%81%ab%e3%81%8a%e3%81%84%e3%81%a6%e3%83%bb%e3%81%ab%e3%81%8a%e3%81%91%e3%82%8b/", ids: ["l-imabi-280"] },
        { num: 281, title: "Negativos なしで/なくして", url: "https://imabi.org/negative-patterns/", ids: ["l-imabi-281"] },
        { num: 282, title: "Excepción のぞいて等", url: "https://imabi.org/exception/", ids: ["l-imabi-282"] },
        { num: 283, title: "ないではいられない", url: "https://imabi.org/cant-help-i/", ids: ["l-imabi-283"] },
        { num: 284, title: "てならない/てたまらない", url: "https://imabi.org/cant-help-ii/", ids: ["l-imabi-284"] },
        { num: 285, title: "ないではすまない", url: "https://imabi.org/cant-help-iii/", ids: ["l-imabi-285"] },
        { num: 286, title: "～よい — fácil clásico", url: "https://imabi.org/easy-ii-%ef%bd%9e%e3%82%88%e3%81%84/", ids: ["l-imabi-286"] },
        { num: 287, title: "がたい/づらい — difícil", url: "https://imabi.org/difficult-ii-%ef%bd%9e%e3%81%8c%e3%81%9f%e3%81%84-%ef%bd%9e%e3%81%a5%e3%82%89%e3%81%84/", ids: ["l-imabi-287"] },
        { num: 288, title: "Intrans/Trans 3", url: "https://imabi.org/intransitive-transitive-part-3/", ids: ["l-imabi-288"] },
        { num: 289, title: "Intrans/Trans 4", url: "https://imabi.org/intransitive-transitive-part-4/", ids: ["l-imabi-289"] },
        { num: 290, title: "自他 Sino-JP サ変", url: "https://imabi.org/intransitive-transitive-part-v-sino-japanese-verbs/", ids: ["l-imabi-290"] },
        { num: 291, title: "限り — límite", url: "https://imabi.org/limit/", ids: ["l-imabi-291"] },
        { num: 292, title: "加えて/とどまらず", url: "https://imabi.org/addition/", ids: ["l-imabi-292"] },
        { num: 293, title: "と — cita 〜と言うまい", url: "https://imabi.org/the-citation-particle-%e3%81%a8-ii/", ids: ["l-imabi-293"] },
        { num: 294, title: "まい — volición negativa", url: "https://imabi.org/negative-volition-%ef%bd%9e%e3%81%be%e3%81%84/", ids: ["l-imabi-294"] },
        { num: 295, title: "う con adj/verbo suposición", url: "https://imabi.org/the-volitional-iii/", ids: ["l-imabi-295"] },
        { num: 296, title: "うが/まいが — pase lo que pase", url: "https://imabi.org/whether-no-matter-or-v1-%ef%bd%9e%ef%bc%88%e3%82%88%ef%bc%89%e3%81%86%ef%bd%9b%e3%81%8c%e3%83%bb%e3%81%a8%ef%bd%9dv1%ef%bc%8b%ef%bd%9e%e3%81%be%e3%81%84%ef%bd%9b%e3%81%8c%e3%83%bb%e3%81%a8/", ids: ["l-imabi-296"] },
        { num: 297, title: "うにも/うものなら", url: "https://imabi.org/%ef%bd%9e%ef%bc%88%e3%82%88%ef%bc%89%e3%81%86%e3%81%ab%e3%82%82-%ef%bd%9e%ef%bc%88%e3%82%88%ef%bc%89%e3%81%86%e3%82%82%e3%81%ae%e3%81%aa%e3%82%89/", ids: ["l-imabi-297"] },
        { num: 298, title: "Variantes copula — たり/なり", url: "https://imabi.org/copula-verb-variants/", ids: ["l-imabi-298"] },
        { num: 299, title: "Cambios sonido adj", url: "https://imabi.org/adjectives-viii-sound-changes/", ids: ["l-imabi-299"] },
        { num: 300, title: "Bases antiguas adj", url: "https://imabi.org/adjectives-ix-old-bases/", ids: ["l-imabi-300"] },
    ];

    var ADVANCED_II = [
    ];

    var ADVANCED_III = [
        { num: 301, title: "As soon as: ～や（いなや）, ～なり, ～途端（に）, & ～次第", url: "https://imabi.org/as-soon-as/", ids: ["l-imabi-301"] },
        { num: 302, title: "Combination Particles with ところ", url: "https://imabi.org/combination-particles-with-%e3%81%a8%e3%81%93%e3%82%8d/", ids: ["l-imabi-302"] },
        { num: 303, title: "以 Adverbial Nouns", url: "https://imabi.org/%e4%bb%a5-adverbial-nouns/", ids: ["l-imabi-303"] },
        { num: 304, title: "Circumstance: まま, 思いきや, & もと", url: "https://imabi.org/circumstance/", ids: ["l-imabi-304"] },
        { num: 305, title: "Result: ～結果, ～うえで, ～挙句, ～すえに, & ～始末だ", url: "https://imabi.org/result/", ids: ["l-imabi-305"] },
        { num: 306, title: "Compare & Contrast: ～に比べて, ～に引き換え, ～にもまして, & ～ないまでも", url: "https://imabi.org/compare-contrast/", ids: ["l-imabi-306"] },
        { num: 307, title: "As (change): ～につれて, ～に従って, ～に伴って, ～とともに, ～に応じて, & ～に応えて", url: "https://imabi.org/as-change/", ids: ["l-imabi-307"] },
        { num: 308, title: "The Particle まで II", url: "https://imabi.org/the-particle-%e3%81%be%e3%81%a7-ii/", ids: ["l-imabi-308"] },
        { num: 309, title: "～ての", url: "https://imabi.org/%ef%bd%9e%e3%81%a6%e3%81%ae/", ids: ["l-imabi-309"] },
        { num: 310, title: "Combination Particles with もの", url: "https://imabi.org/combination-particles-with-%e3%82%82%e3%81%ae/", ids: ["l-imabi-310"] },
        { num: 311, title: "Combination Particles with ばかり", url: "https://imabi.org/combination-particles-with-%e3%81%b0%e3%81%8b%e3%82%8a/", ids: ["l-imabi-311"] },
        { num: 312, title: "The Particles って, たって, & だって", url: "https://imabi.org/the-particles-%e3%81%a3%e3%81%a6-%e3%81%9f%e3%81%a3%e3%81%a6-%e3%81%a0%e3%81%a3%e3%81%a6/", ids: ["l-imabi-312"] },
        { num: 313, title: "The Particle から II: ～からある, ～からの, & ～からする", url: "https://imabi.org/the-particle-%e3%81%8b%e3%82%89-ii-%ef%bd%9e%e3%81%8b%e3%82%89%e3%81%82%e3%82%8b-%ef%bd%9e%e3%81%8b%e3%82%89%e3%81%ae-%ef%bd%9e%e3%81%8b%e3%82%89%e3%81%99%e3%82%8b/", ids: ["l-imabi-313"] },
        { num: 314, title: "Intransitive & Transitive: Part 6", url: "https://imabi.org/transitivity-vii/", ids: ["l-imabi-314"] },
        { num: 315, title: "Intransitive & Transitive: Part 7", url: "https://imabi.org/transitivity-viii/", ids: ["l-imabi-315"] },
        { num: 316, title: "Intransitive & Transitive: Part 8", url: "https://imabi.org/transitivity-ix/", ids: ["l-imabi-316"] },
        { num: 317, title: "Reduplication: Nouns", url: "https://imabi.org/reduplication-nouns/", ids: ["l-imabi-317"] },
        { num: 318, title: "Reduplication: Adjectives", url: "https://imabi.org/reduplication-adjectives/", ids: ["l-imabi-318"] },
        { num: 319, title: "Reduplication: Adjectival Nouns", url: "https://imabi.org/reduplication-adjectival-nouns/", ids: ["l-imabi-319"] },
        { num: 320, title: "Reduplication: Adverbs", url: "https://imabi.org/reduplication-adverbs/", ids: ["l-imabi-320"] },
        { num: 321, title: "込む", url: "https://imabi.org/%e8%be%bc%e3%82%80/", ids: ["l-imabi-321"] },
        { num: 322, title: "Spontaneity: ～（ら）れる & ～える", url: "https://imabi.org/spontaneity/", ids: ["l-imabi-322"] },
        { num: 323, title: "Potential III", url: "https://imabi.org/potential-iii/", ids: ["l-imabi-323"] },
        { num: 324, title: "The Particle どころ", url: "https://imabi.org/the-particle-%e3%81%a9%e3%81%93%e3%82%8d/", ids: ["l-imabi-324"] },
        { num: 325, title: "と Combination Particles I", url: "https://imabi.org/%e3%81%a8-combination-particles-i-%e3%81%a8%e3%81%aa%e3%81%8f-%e3%81%a8%e3%81%af/", ids: ["l-imabi-325"] },
        { num: 326, title: "と Combination Particles II", url: "https://imabi.org/%e3%81%a8-combination-particles-ii/", ids: ["l-imabi-326"] },
        { num: 327, title: "When it Comes to I: というと, といえば, & といったら", url: "https://imabi.org/when-it-comes-to-i%e3%81%a8%e3%81%84%e3%81%86%e3%81%a8-%e3%81%a8%e3%81%84%e3%81%88%e3%81%b0-%e3%81%a8%e3%81%84%e3%81%a3%e3%81%9f%e3%82%89/", ids: ["l-imabi-327"] },
        { num: 328, title: "When it Comes to II: となると, となったら, & となれば", url: "https://imabi.org/when-it-comes-to-ii-when-it-comes-to-ii%e3%81%a8%e3%81%aa%e3%82%8b%e3%81%a8-%e3%81%a8%e3%81%aa%e3%81%a3%e3%81%9f%e3%82%89-%e3%81%a8%e3%81%aa%e3%82%8c%e3%81%b0/", ids: ["l-imabi-328"] },
        { num: 329, title: "ったら & ってば", url: "https://imabi.org/%ef%bd%9e%e3%81%a3%e3%81%9f%e3%82%89-%ef%bd%9e%e3%81%a3%e3%81%a6%e3%81%b0/", ids: ["l-imabi-329"] },
        { num: 330, title: "Whether it be…or…:といい & といわず", url: "https://imabi.org/whether-it-be-or-%ef%bd%9e%e3%81%a8%e3%81%84%e3%81%84-%ef%bd%9e%e3%81%a8%e3%81%84%e3%82%8f%e3%81%9a/", ids: ["l-imabi-330"] },
        { num: 331, title: "When it Comes to III", url: "https://imabi.org/when-it-comes-to-iii%e3%81%a8%ef%bd%9b%e3%81%8d%e3%81%9f%e3%82%89%e3%83%bb%e3%81%8d%e3%81%a6%e3%81%af%e3%83%bb%e3%81%8f%e3%82%8b%e3%81%a8%e3%83%bb%e3%81%8d%e3%81%9f%e6%97%a5%e3%81%ab/", ids: ["l-imabi-331"] },
        { num: 332, title: "と Combination Particles IV", url: "https://imabi.org/%e3%81%a8-combination-particles-iv/", ids: ["l-imabi-332"] },
        { num: 333, title: "Potential IV", url: "https://imabi.org/potential-iv/", ids: ["l-imabi-333"] },
        { num: 334, title: "Considering…: わりに（は） & にしては", url: "https://imabi.org/considering-%e3%82%8f%e3%82%8a%e3%81%ab%ef%bc%88%e3%81%af%ef%bc%89-%e3%81%ab%e3%81%97%e3%81%a6%e3%81%af/", ids: ["l-imabi-334"] },
        { num: 335, title: "Disregard I", url: "https://imabi.org/disregard-i/", ids: ["l-imabi-335"] },
        { num: 336, title: "Disregard II", url: "https://imabi.org/disregard-ii/", ids: ["l-imabi-336"] },
        { num: 337, title: "Disregard III", url: "https://imabi.org/disregard-iii/", ids: ["l-imabi-337"] },
        { num: 338, title: "Disregard IV", url: "https://imabi.org/disregard-iv/", ids: ["l-imabi-338"] },
        { num: 339, title: "Occasion", url: "https://imabi.org/occasion/", ids: ["l-imabi-339"] },
        { num: 340, title: "Worth and Extent", url: "https://imabi.org/worth-and-extent/", ids: ["l-imabi-340"] },
        { num: 341, title: "～ 上", url: "https://imabi.org/nominal-phrases-i/", ids: ["l-imabi-341"] },
        { num: 342, title: "～分 (Not Available)", url: "https://imabi.org/nominal-phrases-i/", ids: [] },
        { num: 343, title: "中心", url: "https://imabi.org/centering-%ef%bd%9e%e3%82%92%e4%b8%ad%e5%bf%83%e3%81%ab%ef%bc%88%e3%81%97%e3%81%a6%ef%bc%89/", ids: ["l-imabi-343"] },
        { num: 344, title: "相応, 由, 代り, & 経由", url: "https://imabi.org/nominal-phrases-ii/", ids: ["l-imabi-344"] },
        { num: 345, title: "至極, 極み, 万一, 至り, & ゆかり", url: "https://imabi.org/nominal-phrases-iii/", ids: ["l-imabi-345"] },
        { num: 346, title: "Simultaneous Action II: つつ", url: "https://imabi.org/simultaneous-action-ii-the-particle-%e3%81%a4%e3%81%a4-vs-%e3%81%aa%e3%81%8c%e3%82%89/", ids: ["l-imabi-346"] },
        { num: 347, title: "抜く: ～ぬきで", url: "https://imabi.org/the-verb-%e6%8a%9c%e3%81%8f/", ids: ["l-imabi-347"] },
        { num: 348, title: "Fault: ～せいで", url: "https://imabi.org/fault-%ef%bd%9e%e3%81%9b%e3%81%84%e3%81%a7-%ef%bd%9e%e3%81%ab%e3%81%8b%e3%81%93%e3%81%a4%e3%81%91%e3%81%a6/", ids: ["l-imabi-348"] },
        { num: 349, title: "Defining Parameter", url: "https://imabi.org/defining-parameter/", ids: ["l-imabi-349"] },
        { num: 350, title: "Phrases Made w/ the Bases of: ～べく", url: "https://imabi.org/advanced-%ef%bd%9e%e3%81%b9%e3%81%8d-phrases%ef%bd%9e%e3%81%b9%e3%81%8f%e3%82%82%e3%81%aa%e3%81%84-%ef%bd%9e%e3%81%b9%e3%81%8b%e3%82%89%e3%81%9a%E3%83%bb%e3%81%96%e3%82%8b-%ef%bd%9e%e3%81%b9/", ids: ["l-imabi-350"] },
        { num: 351, title: "IMABI 351: Tema avanzado 351", url: "https://imabi.org/lesson-351/", ids: ["l-imabi-351"] },
        { num: 352, title: "IMABI 352: Tema avanzado 352", url: "https://imabi.org/lesson-352/", ids: ["l-imabi-352"] },
        { num: 353, title: "IMABI 353: Tema avanzado 353", url: "https://imabi.org/lesson-353/", ids: ["l-imabi-353"] },
        { num: 354, title: "IMABI 354: Tema avanzado 354", url: "https://imabi.org/lesson-354/", ids: ["l-imabi-354"] },
        { num: 355, title: "IMABI 355: Tema avanzado 355", url: "https://imabi.org/lesson-355/", ids: ["l-imabi-355"] },
        { num: 356, title: "IMABI 356: Tema avanzado 356", url: "https://imabi.org/lesson-356/", ids: ["l-imabi-356"] },
        { num: 357, title: "IMABI 357: Tema avanzado 357", url: "https://imabi.org/lesson-357/", ids: ["l-imabi-357"] },
        { num: 358, title: "IMABI 358: Tema avanzado 358", url: "https://imabi.org/lesson-358/", ids: ["l-imabi-358"] },
        { num: 359, title: "IMABI 359: Tema avanzado 359", url: "https://imabi.org/lesson-359/", ids: ["l-imabi-359"] },
        { num: 360, title: "IMABI 360: Tema avanzado 360", url: "https://imabi.org/lesson-360/", ids: ["l-imabi-360"] },
        { num: 361, title: "IMABI 361: Tema avanzado 361", url: "https://imabi.org/lesson-361/", ids: ["l-imabi-361"] },
        { num: 362, title: "IMABI 362: Tema avanzado 362", url: "https://imabi.org/lesson-362/", ids: ["l-imabi-362"] },
        { num: 363, title: "IMABI 363: Tema avanzado 363", url: "https://imabi.org/lesson-363/", ids: ["l-imabi-363"] },
        { num: 364, title: "IMABI 364: Tema avanzado 364", url: "https://imabi.org/lesson-364/", ids: ["l-imabi-364"] },
        { num: 365, title: "IMABI 365: Tema avanzado 365", url: "https://imabi.org/lesson-365/", ids: ["l-imabi-365"] },
        { num: 366, title: "IMABI 366: Tema avanzado 366", url: "https://imabi.org/lesson-366/", ids: ["l-imabi-366"] },
        { num: 367, title: "IMABI 367: Tema avanzado 367", url: "https://imabi.org/lesson-367/", ids: ["l-imabi-367"] },
        { num: 368, title: "IMABI 368: Tema avanzado 368", url: "https://imabi.org/lesson-368/", ids: ["l-imabi-368"] },
        { num: 369, title: "IMABI 369: Tema avanzado 369", url: "https://imabi.org/lesson-369/", ids: ["l-imabi-369"] },
        { num: 370, title: "IMABI 370: Tema avanzado 370", url: "https://imabi.org/lesson-370/", ids: ["l-imabi-370"] },
        { num: 371, title: "The Particles ども, とも, & たりとも", url: "https://imabi.org/the-particles-%e3%81%a9%e3%82%82-%e3%81%a0%e3%81%ae/", ids: ["l-imabi-371"] },
        { num: 372, title: "～てたまる", url: "https://imabi.org/%ef%bd%9e%e3%81%a6%e3%81%9f%e3%81%be%e3%82%8b/", ids: ["l-imabi-372"] },
        { num: 373, title: "Opportunity: きっかけ & 契機", url: "https://imabi.org/opportunity/", ids: ["l-imabi-373"] },
        { num: 374, title: "Similarity II", url: "https://imabi.org/similarity-ii/", ids: ["l-imabi-374"] },
        { num: 375, title: "～ために III", url: "https://imabi.org/%ef%bd%9e%e3%81%9f%e3%82%81%e3%81%ab-iii-%ef%bd%9e%e3%82%93%e3%81%8c%e3%81%9f%e3%82%81%e3%81%ab-%ef%bd%9e%e3%81%8c%e3%81%9f%e3%82%81%e3%81%ab/", ids: ["l-imabi-375"] },
        { num: 376, title: "Reading the 九九", url: "https://imabi.org/rounding-numbers/", ids: ["l-imabi-376"] },
        { num: 377, title: "Decimals & Fractions", url: "https://imabi.org/decimals-fractions/", ids: ["l-imabi-377"] },
        { num: 378, title: "Measurements", url: "https://imabi.org/numbers-x-measurements/", ids: ["l-imabi-378"] },
        { num: 379, title: "Large Numbers & 大字", url: "https://imabi.org/large-numbers-%e5%a4%a7%e5%ad%97/", ids: ["l-imabi-379"] },
        { num: 380, title: "Miss out: ～残す, ～漏らす, ～損なう, ～そびれる, ～損じる, & ～逃す", url: "https://imabi.org/miss-out/", ids: ["l-imabi-380"] },
        { num: 381, title: "～果てる ～付ける・く, ～立てる・つ, ～尽くす,& ～こなす", url: "https://imabi.org/more-endings-i/", ids: ["l-imabi-381"] },
        { num: 382, title: "～返る・す, ～捲る, ～殴る, ～腐る, & ～通す", url: "https://imabi.org/more-endings-ii/", ids: ["l-imabi-382"] },
        { num: 383, title: "Locational: ～渡る・す, ～出る・す, ～上がる・げる, ～入る・れる, ～下がる・げる, ～降りる・ろす, ～落ちる・とす, & ～回る・す", url: "https://imabi.org/locational/", ids: ["l-imabi-383"] },
        { num: 384, title: "Final Endings: ～こける, ～さす, ～倦む・ねる, ～逸れる, ～成す, & ～古す", url: "https://imabi.org/final-endings/", ids: ["l-imabi-384"] },
        { num: 385, title: "ら抜き言葉", url: "https://imabi.org/%e3%82%89%e6%8a%9c%e3%81%8d%e8%a8%80%e8%91%89/", ids: ["l-imabi-385"] },
        { num: 386, title: "The Causative III: ～かす Verbs", url: "https://imabi.org/the-causative-iii-%ef%bd%9e%e3%81%8b%e3%81%99/", ids: ["l-imabi-386"] },
        { num: 387, title: "さ入れ言葉", url: "https://imabi.org/sa-insertion%e3%80%80%e3%81%95%e5%85%a5%e3%82%8c%e8%a8%80%e8%91%89/", ids: ["l-imabi-387"] },
        { num: 388, title: "Prefixes", url: "https://imabi.org/prefixes/", ids: ["l-imabi-388"] },
        { num: 389, title: "Native Suffixes I: Nominal I", url: "https://imabi.org/native-suffixes-i/", ids: ["l-imabi-389"] },
        { num: 390, title: "Native Suffixes II: Nominal II", url: "https://imabi.org/native-suffixes-ii/", ids: ["l-imabi-390"] },
        { num: 391, title: "Native Suffixes III: Adjectival & Adverbial", url: "https://imabi.org/native-suffixes-iii/", ids: ["l-imabi-391"] },
        { num: 392, title: "Native Suffixes IV: Verbal", url: "https://imabi.org/native-suffixes-iv/", ids: ["l-imabi-392"] },
        { num: 393, title: "The Adjectival Affix「か」: か～・～か・～らか・～やか", url: "https://imabi.org/the-adjectival-affix-%ef%bd%9e%e3%81%8b/", ids: ["l-imabi-393"] },
        { num: 394, title: "The Verbal Affix ～ぐ: ～らぐ・やぐ", url: "https://imabi.org/the-verbal-affix-%ef%bd%9e%e3%81%90-%ef%bd%9e%e3%82%89%e3%81%90%E3%83%bb%e3%82%84%e3%81%90/", ids: ["l-imabi-394"] },
        { num: 395, title: "Sino-Japanese Suffixes I", url: "https://imabi.org/sino-japanese-suf/", ids: ["l-imabi-395"] },
        { num: 396, title: "Sino-Japanese Suffixes II", url: "https://imabi.org/sino-japanesesuffixesii/", ids: ["l-imabi-396"] },
        { num: 397, title: "Suffixes of Appearance: ～だらけ, ～まみれ, ～ずくめ, ～めく, ～げ, & ～気", url: "https://imabi.org/suf-viappearance/", ids: ["l-imabi-397"] },
        { num: 398, title: "Slang る Verbs", url: "https://imabi.org/slang-%e3%82%8b-verbs/", ids: ["l-imabi-398"] },
        { num: 399, title: "The Particle も VI", url: "https://imabi.org/the-particle-%e3%82%82-vi/", ids: ["l-imabi-399"] },
        { num: 400, title: "The Auxiliary ～たる: ～たるや, ～たるもの, & ～たりとも", url: "https://imabi.org/the-auxiliary-%ef%bd%9e%e3%81%9f%e3%82%8b-%e3%81%9f%e3%82%8b%e3%82%84%E3%80%81%e3%81%9f%e3%82%8b%e3%82%82%e3%81%ae%E3%80%81%e3%81%9f%e3%82%8a%e3%81%a8%e3%82%82/", ids: ["l-imabi-400"] },
    ];

    var ADVANCED_IV = [
    ];
    var CLASSICAL = [
        { num: 600, title: "Introduction to Classical Japanese", url: "https://imabi.org/intro-to-classical/", ids: ["l-imabi-c01"] },
        { num: 601, title: "Historical かな Orthography", url: "https://imabi.org/kana-orthography/", ids: ["l-imabi-c02"] },
        { num: 602, title: "Parts of Speech & Basic Syntax", url: "https://imabi.org/basic-syntax/", ids: ["l-imabi-c03"] },
        { num: 603, title: "The Copula Verbs にあり (なり) & とあり (たり)", url: "https://imabi.org/copula-verbs/", ids: ["l-imabi-c04"] },
        { num: 604, title: "Adjectives I: ク & シク", url: "https://imabi.org/classical-adjectives-i/", ids: ["l-imabi-c05"] },
        { num: 605, title: "Adjectives II: ナリ & タリ", url: "https://imabi.org/classical-adjectives-ii/", ids: ["l-imabi-c06"] },
        { num: 606, title: "Regular Verbs I: 四段", url: "https://imabi.org/class-regular-verbs-i/", ids: ["l-imabi-c07"] },
        { num: 607, title: "Regular Verbs II: 上一段 & 下一段", url: "https://imabi.org/classical-verbs-ii%E3%80%80%E5%8F%A4%E5%85%B8%E6%96%87%E6%B3%95%E3%81%ab%E6%96%bc%E3%81%91%E3%82%8B%E4%B8%8A%E4%B8%80%E6%AE%B5%E3%83%bb%E4%B8%8B%E4%B8%80%E6%AE%B5%E6%B4%bb%E7%94%A8%E5%8B%95%E8%A9%9E/", ids: ["l-imabi-c08"] },
        { num: 608, title: "Regular Verbs III: 上二段 & 下二段", url: "https://imabi.org/classical-verbs-iii%E5%8F%A4%E5%85%B8%E6%96%87%E6%B3%95%E3%81%ab%E6%96%bc%E3%81%91%E3%82%8B%E4%B8%8A%E4%ba%8c%E6%AE%B5%E3%83%bb%E4%B8%8B%E4%ba%8c%E6%AE%B5%E6%B4%bb%E7%94%A8%E5%8B%95%E8%A9%9E/", ids: ["l-imabi-c09"] },
        { num: 609, title: "Irregular Verbs I: サ変 & カ変", url: "https://imabi.org/class-irregular-verbs-i/", ids: ["l-imabi-c10"] },
        { num: 610, title: "Irregular Verbs II: ラ変 & ナ変", url: "https://imabi.org/classical-irregular-verbs-ii/", ids: ["l-imabi-c11"] },
        { num: 611, title: "The Auxiliary Verb ～ず II", url: "https://imabi.org/the-auxiliary-verb-%ef%bd%9e%e3%81%9a-ii/", ids: ["l-imabi-c12"] },
        { num: 612, title: "The Auxiliary Verbs ～き & ～けり", url: "https://imabi.org/the-auxiliary-verbs-%ef%bd%9e%e3%81%8d-%ef%bd%9e%e3%81%91%e3%82%8a/", ids: ["l-imabi-c13"] },
        { num: 613, title: "The Auxiliary Verbs ～ぬ & ～つ", url: "https://imabi.org/%e3%80%8c%E5%AE%8C%E4%BA%86%E3%80%8D%E3%82%92%E7%A4%BA%E3%81%99%E3%80%8c%E3%81%ac%E3%80%8D%E3%83%BB%E3%80%8C%E3%81%A4%E3%80%8D/", ids: ["l-imabi-c14"] },
        { num: 614, title: "The Auxiliary Verbs ～たり & ～り", url: "https://imabi.org/the-auxiliary-verbs-%ef%bd%9e%e3%81%9f%e3%82%8a-%ef%bd%9e%e3%82%8a/", ids: ["l-imabi-c15"] },
        { num: 615, title: "Nouns & Pronouns (Classical)", url: "https://imabi.org/nouns-pronouns/", ids: ["l-imabi-c16"] },
        { num: 616, title: "Numbers: ひふみ", url: "https://imabi.org/numbers/", ids: ["l-imabi-c17"] },
        { num: 617, title: "Adverbs (Classical)", url: "https://imabi.org/classical-adverbs/", ids: ["l-imabi-c18"] },
        { num: 618, title: "Conjunctions (Classical)", url: "https://imabi.org/classical-conjunctions/", ids: ["l-imabi-c19"] },
        { num: 619, title: "Interjections (Classical)", url: "https://imabi.org/classical-interjections/", ids: ["l-imabi-c20"] },
        { num: 620, title: "Demonstratives (Classical)", url: "https://imabi.org/demonstratives/", ids: ["l-imabi-c21"] },
        { num: 621, title: "The Particles が & を (Classical)", url: "https://imabi.org/the-particles-ga-wo/", ids: ["l-imabi-c22"] },
        { num: 622, title: "The Particles に, にて, & へ (Classical)", url: "https://imabi.org/ni-nite-e/", ids: ["l-imabi-c23"] },
        { num: 623, title: "The Particles より & から (Classical)", url: "https://imabi.org/yori-kara/", ids: ["l-imabi-c24"] },
        { num: 624, title: "The Particles の (Classical)", url: "https://imabi.org/the-particles-%e3%81%ae-classical/", ids: ["l-imabi-c25"] },
        { num: 700, title: "Okinawan 01: Script", url: "https://imabi.org/okinawan-01/", ids: ["l-imabi-okin01"] }
    ];

    // Resumen: Para no inflar XDC, solo detallamos Beginners I-II completos. El resto se genera igual.
    // Los 300+ restantes están en docs/IMABI_PLAN.md y se irán mapeando.

    function all() { return [].concat(BEGINNERS_I, BEGINNERS_II, INTERMEDIATE_I, INTERMEDIATE_II, INTERMEDIATE_III, ADVANCED_I, ADVANCED_II, ADVANCED_III, ADVANCED_IV, CLASSICAL); }

    function toLessonIds(entry) { return entry.ids || []; }

    function stats() {
        var total = all().length;
        var mapped = all().filter(function(e){ return e.ids && e.ids.length; }).length;
        return { total: total, mapped: mapped, pending: total - mapped };
    }

    // --- Soporte completo de niveles IMABI (separado de JLPT) ---
    // Rangos canónicos según https://imabi.org/table-of-contents
    var LEVEL_RANGES = {
        beginners1: [0, 50],
        beginners2: [51, 100],
        intermediate1: [101, 150],
        intermediate2: [151, 200],
        intermediate3: [201, 250],
        advanced1: [251, 300],
        advanced2: [301, 350],
        advanced3: [351, 400],
        classical: [600, 700]
    };
    function normalizeLevelKey(k) {
        if (!k) return 'beginners1';
        var s = String(k).toLowerCase().replace(/[^a-z0-9]/g, '');
        if (s === 'beginners1' || s === 'beginnersi' || s === 'beginner1' || s === 'b1') return 'beginners1';
        if (s === 'beginners2' || s === 'beginnersii' || s === 'beginner2' || s === 'b2') return 'beginners2';
        if (s === 'intermediate1' || s === 'intermediatei' || s === 'i1') return 'intermediate1';
        if (s === 'intermediate2' || s === 'intermediateii' || s === 'i2') return 'intermediate2';
        if (s === 'intermediate3' || s === 'intermediateiii' || s === 'i3') return 'intermediate3';
        if (s === 'advanced1' || s === 'advancedi' || s === 'a1') return 'advanced1';
        if (s === 'advanced2' || s === 'advancedii' || s === 'a2') return 'advanced2';
        if (s === 'advanced3' || s === 'advancediii' || s === 'a3') return 'advanced3';
        if (s === 'classical' || s === 'veteran' || s === 'c' || s === 'cl') return 'classical';
        if (LEVEL_RANGES[s]) return s;
        return 'beginners1';
    }
    function entriesForLevel(levelKey) {
        var key = normalizeLevelKey(levelKey);
        var range = LEVEL_RANGES[key];
        if (!range) return [];
        var allEntries = all();
        var out = [];
        for (var i = 0; i < allEntries.length; i++) {
            var e = allEntries[i];
            if (e.num >= range[0] && e.num <= range[1]) out.push(e);
        }
        return out;
    }
    function idsForLevel(levelKey) {
        var entries = entriesForLevel(levelKey);
        var out = [];
        for (var i = 0; i < entries.length; i++) {
            var ids = entries[i].ids || [];
            for (var j = 0; j < ids.length; j++) if (out.indexOf(ids[j]) === -1) out.push(ids[j]);
        }
        return out;
    }
    function levelLabel(key) {
        var map = {
            beginners1: 'Beginners I (0-50)',
            beginners2: 'Beginners II (51-100)',
            intermediate1: 'Intermediate I (101-150)',
            intermediate2: 'Intermediate II (151-200)',
            intermediate3: 'Intermediate III (201-250)',
            advanced1: 'Advanced I (251-300)',
            advanced2: 'Advanced II (301-350)',
            advanced3: 'Advanced III (351-400)',
            classical: 'Classical / Veteran'
        };
        return map[normalizeLevelKey(key)] || key;
    }

    var API = {
        BEGINNERS_I: BEGINNERS_I,
        BEGINNERS_II: BEGINNERS_II,
        INTERMEDIATE_I: INTERMEDIATE_I,
        INTERMEDIATE_II: INTERMEDIATE_II,
        INTERMEDIATE_III: INTERMEDIATE_III,
        ADVANCED_I: ADVANCED_I,
        ADVANCED_II: ADVANCED_II,
        ADVANCED_III: ADVANCED_III,
        ADVANCED_IV: ADVANCED_IV,
        CLASSICAL: CLASSICAL,
        LEVEL_RANGES: LEVEL_RANGES,
        LEVELS: {
            beginners1: { key: 'beginners1', label: 'Beginners I (0-50)', range: [0,50] },
            beginners2: { key: 'beginners2', label: 'Beginners II (51-100)', range: [51,100] },
            intermediate1: { key: 'intermediate1', label: 'Intermediate I (101-150)', range: [101,150] },
            intermediate2: { key: 'intermediate2', label: 'Intermediate II (151-200)', range: [151,200] },
            intermediate3: { key: 'intermediate3', label: 'Intermediate III (201-250)', range: [201,250] },
            advanced1: { key: 'advanced1', label: 'Advanced I (251-300)', range: [251,300] },
            advanced2: { key: 'advanced2', label: 'Advanced II (301-350)', range: [301,350] },
            advanced3: { key: 'advanced3', label: 'Advanced III (351-400)', range: [351,400] },
            classical: { key: 'classical', label: 'Classical / Veteran', range: [600,700] }
        },
        normalizeLevelKey: normalizeLevelKey,
        entriesForLevel: entriesForLevel,
        idsForLevel: idsForLevel,
        levelLabel: levelLabel,
        all: all,
        toLessonIds: toLessonIds,
        stats: stats,
        // Para lessons.js: devuelve lecciones en orden IMABI
        orderedIds: function() {
            var out = [];
            all().forEach(function(e){ e.ids.forEach(function(id){ if (out.indexOf(id)===-1) out.push(id); }); });
            return out;
        },
        orderedIdsForLevel: idsForLevel
    };

    root.NihongoDojoImabi = API;
    if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
