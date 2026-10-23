/**
 * NihongoDojo — textos cortos originales.
 * No son el examen ni una lista oficial. El japonés y las preguntas son de este dojo.
 */
(function (root) {
    "use strict";

    const PASSAGES = [
        {
            id: "rd-n5-asa", level: "n5", title: "La mañana",
            jp: "田中さんは毎朝六時に起きます。朝ごはんを食べて、学校へ行きます。学校は八時に始まります。",
            kana: "たなかさんはまいあさろくじにおきます。あさごはんをたべて、がっこうへいきます。がっこうははちじにはじまります。",
            questions: [
                { ask: "¿A qué hora se levanta Tanaka?", choices: ["A las siete", "A las seis", "A las ocho", "A las nueve"], answer: 1 },
                { ask: "¿Adónde va después de desayunar?", choices: ["A la estación", "A casa", "A la escuela", "Al parque"], answer: 2 }
            ]
        },
        {
            id: "rd-n5-nichi", level: "n5", title: "El domingo",
            jp: "今日は日曜日です。山田さんはうちで本を読みます。午後、友達と公園へ行きます。公園はきれいです。",
            kana: "きょうはにちようびです。やまださんはうちでほんをよみます。ごご、ともだちとこうえんへいきます。こうえんはきれいです。",
            questions: [
                { ask: "¿Qué día es?", choices: ["Lunes", "Sábado", "Domingo", "Viernes"], answer: 2 },
                { ask: "¿Qué hace Yamada por la tarde?", choices: ["Estudia japonés", "Va al parque con un amigo", "Trabaja", "Duerme"], answer: 1 }
            ]
        },
        {
            id: "rd-n4-hanasu", level: "n4", title: "Puede hablar",
            jp: "田中さんは日本語が話せます。でも、漢字はまだあまり読めません。来週、日本へ行くつもりです。",
            kana: "たなかさんはにほんごがはなせます。でも、かんじはまだあまりよめません。らいしゅう、にほんへいくつもりです。",
            questions: [
                { ask: "¿Qué puede hacer Tanaka?", choices: ["Leer todos los kanji", "Hablar japonés", "Conducir", "Cocinar"], answer: 1 },
                { ask: "¿Qué piensa hacer la semana que viene?", choices: ["Volver a casa", "Dejar el japonés", "Ir a Japón", "Trabajar en la estación"], answer: 2 }
            ]
        },
        {
            id: "rd-n4-ame", level: "n4", title: "Si llueve",
            jp: "雨が降ったら、試合は中止です。晴れなら、十時に体育館へ来てください。チケットはいりません。",
            kana: "あめがふったら、しあいはちゅうしです。はれなら、じゅうじにたいいくかんへきてください。チケットはいりません。",
            questions: [
                { ask: "Si llueve, ¿qué pasa con el partido?", choices: ["Empieza a las diez", "Es en el parque", "Se suspende", "Hace falta entrada"], answer: 2 },
                { ask: "Si hace sol, ¿adónde hay que ir?", choices: ["A la estación", "Al gimnasio", "A la escuela", "A casa"], answer: 1 }
            ]
        },
        {
            id: "rd-n3-machi", level: "n3", title: "Tres años",
            jp: "この町に住んでから、三年になります。最初は言葉がわからなくて困りましたが、今は隣の人と話せるようになりました。",
            kana: "このまちにすんでから、さんねんになります。さいしょはことばがわからなくてこまりましたが、いまはとなりのひととはなせるようになりました。",
            questions: [
                { ask: "¿Cuánto lleva en ese pueblo?", choices: ["Tres meses", "Un año", "Tres años", "Diez años"], answer: 2 },
                { ask: "¿Qué le pasaba al principio?", choices: ["No tenía casa", "No entendía el idioma", "No podía caminar", "No tenía vecinos"], answer: 1 }
            ]
        },
        {
            id: "rd-n3-repo", level: "n3", title: "El informe",
            jp: "レポートを出さなければなりません。でも、資料が足りないので、図書館で調べてから書くことにしました。",
            kana: "レポートをださなければなりません。でも、しりょうがたりないので、としょかんでしらべてからかくことにしました。",
            questions: [
                { ask: "¿Qué tiene que hacer?", choices: ["Comprar un billete", "Mudarse", "Entregar un informe", "Cocinar"], answer: 2 },
                { ask: "¿Por qué irá a la biblioteca?", choices: ["La clase está cerrada", "Le faltan datos", "Perdió el tren", "Hace calor"], answer: 1 }
            ]
        },
        {
            id: "rd-n2-keikaku", level: "n2", title: "El plan",
            jp: "この計画は、費用がかかるばかりで、効果がはっきりしません。もう一度、目的を確かめてから進めたほうがいいと思います。",
            kana: "このけいかくは、ひようがかかるばかりで、こうかがはっきりしません。もういちど、もくてきをたしかめてからすすめたほうがいいとおもいます。",
            questions: [
                { ask: "¿Qué problema ve en el plan?", choices: ["Es demasiado corto", "Cuesta y el efecto no está claro", "No hay gente", "Ya terminó"], answer: 1 },
                { ask: "¿Qué recomienda?", choices: ["Cancelarlo hoy", "Publicarlo ya", "Confirmar el objetivo antes de seguir", "No hablar del tema"], answer: 2 }
            ]
        },
        {
            id: "rd-n2-yakusoku", level: "n2", title: "La cita",
            jp: "彼は約束の時間に遅れてきました。それにもかかわらず、謝る様子がなかったので、周りの人は黙ってしまいました。",
            kana: "かれはやくそくのじかんにおくれてきました。それにもかかわらず、あやまるようすがなかったので、まわりのひとはだまってしまいました。",
            questions: [
                { ask: "¿Qué hizo él?", choices: ["Llegó pronto", "Canceló la cita", "Llegó tarde y no pareció disculparse", "Se disculpó enseguida"], answer: 2 },
                { ask: "¿Qué hicieron los demás?", choices: ["Se rieron", "Se quedaron callados", "Se fueron corriendo", "Le aplaudieron"], answer: 1 }
            ]
        },
        {
            id: "rd-n1-honken", level: "n1", title: "El aviso",
            jp: "本件は、担当者の一存では決められません。関係する部署の合意を得たうえで、改めて知らせます。それまでは、今の手続きに従ってもらいたいです。",
            kana: "ほんけんは、たんとうしゃのいっそんではきめられません。かんけいするぶしょのごういをえたうえで、あらためてしらせます。それまでは、いまのてつづきにしたがってもらいたいです。",
            questions: [
                { ask: "¿Puede decidirlo el encargado solo?", choices: ["Sí, él decide", "No: hace falta el acuerdo de los departamentos", "Ya está cerrado", "No hay procedimiento"], answer: 1 },
                { ask: "Hasta el aviso, ¿qué hay que hacer?", choices: ["Pararlo todo", "Ignorar el aviso", "Seguir el procedimiento actual", "Cambiar el contrato hoy"], answer: 2 }
            ]
        },
        {
            id: "rd-n1-setsumei", level: "n1", title: "La explicación",
            jp: "その説明は、事実を曲げているわけではありません。ただ、不利な点に触れていないため、読む人を誤った判断に導くおそれがあります。",
            kana: "そのせつめいは、じじつをまげているわけではありません。ただ、ふりなてんにふれていないため、よむひとをあやまったはんだんにみちびくおそれがあります。",
            questions: [
                { ask: "¿La explicación miente?", choices: ["Es falsa de cabo a rabo", "Es un contrato", "No, pero omite lo desfavorable", "No se puede leer"], answer: 2 },
                { ask: "¿Qué riesgo señala?", choices: ["Perder el tren", "Llevar a un juicio equivocado", "No poder entrar", "Quedarse sin voz"], answer: 1 }
            ]
        }
    ];

    function questionsFor(level) {
        const out = [];
        PASSAGES.forEach(function (passage) {
            if (passage.level !== level) return;
            passage.questions.forEach(function (question, index) {
                out.push({
                    id: passage.id + "-" + (index + 1),
                    level: passage.level,
                    title: passage.title,
                    jp: passage.jp,
                    kana: passage.kana,
                    ask: question.ask,
                    choices: question.choices,
                    answer: question.answer
                });
            });
        });
        return out;
    }

    function findQuestion(id) {
        const levels = ["n5", "n4", "n3", "n2", "n1"];
        for (let i = 0; i < levels.length; i++) {
            const list = questionsFor(levels[i]);
            for (let n = 0; n < list.length; n++) {
                if (list[n].id === id) return list[n];
            }
        }
        return null;
    }

    function check(question, chosen) {
        const user = typeof chosen === "string" ? chosen : "";
        if (!question || !user) {
            return { user: "", expected: "", correct: false, empty: true, skipped: false };
        }
        return {
            user: user,
            expected: String(question.answer),
            correct: user === String(question.answer),
            empty: false,
            skipped: false
        };
    }

    function parseExamSnapshot(data) {
        if (!data || data.v !== 4 || data.practice !== "reading") return null;
        if (!Array.isArray(data.items) || data.items.length === 0 || data.items.length > 80) return null;
        if (typeof data.index !== "number" || data.index !== Math.floor(data.index)) return null;
        if (data.index < 0 || data.index >= data.items.length) return null;
        const queue = [];
        for (let i = 0; i < data.items.length; i++) {
            const it = data.items[i];
            if (!it || typeof it.id !== "string") return null;
            const reading = findQuestion(it.id);
            if (!reading) return null;
            const item = { reading: reading, userAnswer: null, result: null, choices: null };
            const skipped = it.skipped === true;
            const markedCorrect = it.correct === true && !skipped;
            const hasUser = typeof it.user === "string";
            if (skipped || markedCorrect || hasUser) {
                item.result = {
                    user: hasUser ? String(it.user).slice(0, 8) : "",
                    expected: String(reading.answer),
                    correct: markedCorrect,
                    empty: false,
                    skipped: skipped
                };
                item.userAnswer = skipped ? null : item.result.user;
            }
            queue.push(item);
        }
        for (let i = data.index + 1; i < queue.length; i++) {
            queue[i].result = null;
            queue[i].userAnswer = null;
        }
        const waitingNext = !!queue[data.index].result;
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
        const level = ["n5", "n4", "n3", "n2", "n1"].indexOf(data.level) === -1 ? "n5" : data.level;
        return {
            practice: "reading",
            direction: "lectura",
            answerMode: "choice",
            queue: queue,
            index: data.index,
            waitingNext: waitingNext,
            lessonId: "",
            level: level,
            correct: correct,
            wrong: wrong,
            skipped: skipped
        };
    }

    const api = { PASSAGES: PASSAGES, questionsFor: questionsFor, findQuestion: findQuestion, check: check, parseExamSnapshot: parseExamSnapshot };
    root.NihongoDojoReadings = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
