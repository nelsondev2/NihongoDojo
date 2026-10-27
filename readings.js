/**
 * NihongoDojo — textos cortos originales.
 * Seis por nivel. No son el examen ni una lista oficial. El japonés y las preguntas son de este dojo.
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
        },
        {
            id: "rd-n5-eki", level: "n5", title: "La estación",
            jp: "駅で電車を待ちます。七時の電車に乗ります。駅の前に店があります。",
            kana: "えきででんしゃをまちます。しちじのでんしゃにのります。えきのまえにみせがあります。",
            questions: [
                { ask: "¿Qué hace a las siete?", choices: ["Se sube al tren", "Compra en la tienda", "Vuelve a casa", "Escribe una carta"], answer: 0 },
                { ask: "¿Qué hay delante de la estación?", choices: ["Una escuela", "Una tienda", "Un parque", "Un hospital"], answer: 1 }
            ]
        },
        {
            id: "rd-n5-mise", level: "n5", title: "La compra",
            jp: "スーパーでりんごを三つ買います。パンも買います。水は買いません。",
            kana: "スーパーでりんごをみっつかいます。パンもかいます。みずはかいません。",
            questions: [
                { ask: "¿Qué no compra?", choices: ["Manzanas", "Pan", "Tres", "Agua"], answer: 3 },
                { ask: "¿Cuántas manzanas compra?", choices: ["Una", "Dos", "Tres", "Cinco"], answer: 2 }
            ]
        },
        {
            id: "rd-n5-ame", level: "n5", title: "La lluvia",
            jp: "今日は雨です。傘を持って行きます。午後は図書館で本を読みます。",
            kana: "きょうはあめです。かさをもっていきます。ごごはとしょかんでほんをよみます。",
            questions: [
                { ask: "¿Qué tiempo hace hoy?", choices: ["Hace sol", "Nieva", "Llueve", "Hace viento"], answer: 2 },
                { ask: "¿Adónde va por la tarde?", choices: ["A la biblioteca", "A la estación", "A la escuela", "A la tienda"], answer: 0 }
            ]
        },
        {
            id: "rd-n5-kazoku", level: "n5", title: "La familia",
            jp: "わたしの家族は四人です。父と母と弟がいます。弟は中学生です。",
            kana: "わたしのかぞくはよにんです。ちちとははとおとうとがいます。おとうとはちゅうがくせいです。",
            questions: [
                { ask: "¿Cuántas personas hay en la familia?", choices: ["Dos", "Tres", "Cuatro", "Cinco"], answer: 2 },
                { ask: "¿Qué es el hermano menor?", choices: ["Profesor", "Estudiante de secundaria", "Empleado", "Universitario"], answer: 1 }
            ]
        },
        {
            id: "rd-n4-jitensha", level: "n4", title: "La bici",
            jp: "鈴木さんは自転車に乗れます。車はまだ運転できません。来月、練習するつもりです。",
            kana: "すずきさんはじてんしゃにのれます。くるまはまだうんてんできません。らいげつ、れんしゅうするつもりです。",
            questions: [
                { ask: "¿Qué puede hacer Suzuki?", choices: ["Conducir un coche", "Montar en bici", "Pilotar", "Nadar"], answer: 1 },
                { ask: "¿Qué piensa hacer el mes que viene?", choices: ["Vender la bici", "Dejar de estudiar", "Practicar", "Comprar un tren"], answer: 2 }
            ]
        },
        {
            id: "rd-n4-okureru", level: "n4", title: "Si llega tarde",
            jp: "この電車に遅れたら、次は三十分後です。早めに駅へ来てください。",
            kana: "このでんしゃにおくれたら、つぎはさんじゅっぷんごです。はやめにえきへきてください。",
            questions: [
                { ask: "Si pierde ese tren, ¿cuándo es el siguiente?", choices: ["En diez minutos", "En treinta minutos", "Mañana", "No hay otro"], answer: 1 },
                { ask: "¿Qué pide el texto?", choices: ["Llegar pronto a la estación", "Comprar un billete caro", "Esperar en casa", "Cambiar de ciudad"], answer: 0 }
            ]
        },
        {
            id: "rd-n4-hon", level: "n4", title: "Dos libros",
            jp: "この本のほうが面白いです。あの本は易しいですが、話は短いです。",
            kana: "このほんのほうがおもしろいです。あのほんはやさしいですが、はなしはみじかいです。",
            questions: [
                { ask: "¿Cómo es este libro?", choices: ["Más aburrido", "Más interesante que aquel", "Más corto", "Más difícil de encontrar"], answer: 1 },
                { ask: "¿Cómo es la historia de aquel libro?", choices: ["Larga", "Corta", "Triste", "No tiene historia"], answer: 1 }
            ]
        },
        {
            id: "rd-n4-yoyaku", level: "n4", title: "La reserva",
            jp: "来週、京都へ行くつもりです。新幹線で行きます。ホテルはもう予約しました。",
            kana: "らいしゅう、きょうとへいくつもりです。しんかんせんでいきます。ホテルはもうよやくしました。",
            questions: [
                { ask: "¿Qué reservó ya?", choices: ["El hotel", "El shinkansen", "Un restaurante", "El partido"], answer: 0 },
                { ask: "¿Cómo va a Kioto?", choices: ["En autobús", "En shinkansen", "A pie", "En barco"], answer: 1 }
            ]
        },
        {
            id: "rd-n3-densha", level: "n3", title: "Se le escapó",
            jp: "急いで駅へ行ったのに、電車はもう出てしまいました。次は二十分後です。",
            kana: "いそいでえきへいったのに、でんしゃはもうでてしまいました。つぎはにじゅっぷんごです。",
            questions: [
                { ask: "¿Qué pasó con el tren?", choices: ["Ya había salido", "Llegó tarde", "Se canceló el viaje", "Estaba vacío"], answer: 0 },
                { ask: "¿Cuándo es el siguiente?", choices: ["En cinco minutos", "En veinte minutos", "Mañana por la mañana", "No lo dice"], answer: 1 }
            ]
        },
        {
            id: "rd-n3-hazu", level: "n3", title: "Debería venir",
            jp: "田中さんは今日来るはずです。でも、連絡がないので、少し心配しています。",
            kana: "たなかさんはきょうくるはずです。でも、れんらくがないので、すこししんぱいしています。",
            questions: [
                { ask: "¿Qué se esperaba de Tanaka?", choices: ["Que llamara ayer", "Que viniera hoy", "Que se mudara", "Que faltara"], answer: 1 },
                { ask: "¿Por qué hay preocupación?", choices: ["Por la lluvia", "Porque no hay noticias", "Porque ya llegó", "Por el examen"], answer: 1 }
            ]
        },
        {
            id: "rd-n3-ongaku", level: "n3", title: "Con música",
            jp: "音楽を聞きながら、宿題をしています。でも、歌が始まると、集中できなくなります。",
            kana: "おんがくをききながら、しゅくだいをしています。でも、うたがはじまると、しゅうちゅうできなくなります。",
            questions: [
                { ask: "¿Qué hace mientras estudia los deberes?", choices: ["Escucha música", "Duerme", "Cocina", "Corre"], answer: 0 },
                { ask: "¿Qué pasa cuando empieza la canción?", choices: ["Termina los deberes", "Sale de casa", "Ya no puede concentrarse", "Apaga la luz"], answer: 2 }
            ]
        },
        {
            id: "rd-n3-tame", level: "n3", title: "Para usarlo",
            jp: "日本語を使うために、毎週会話のクラスに出ています。クラスのあと、ノートを見直します。",
            kana: "にほんごをつかうために、まいしゅうかいわのクラスにでています。クラスのあと、ノートをみなおします。",
            questions: [
                { ask: "¿Para qué va a clase?", choices: ["Para usar el japonés", "Para enseñar", "Para descansar", "Para comprar libros"], answer: 0 },
                { ask: "¿Qué hace después de la clase?", choices: ["Tira los apuntes", "Repasa el cuaderno", "Cancela la semana", "Vuelve al examen"], answer: 1 }
            ]
        },
        {
            id: "rd-n2-kawa", level: "n2", title: "El río",
            jp: "この川は、大雨のあとにあふれるおそれがあります。近くの人は早めに避難してください。",
            kana: "このかわは、おおあめのあとにあふれるおそれがあります。ちかくのひとははやめにひなんしてください。",
            questions: [
                { ask: "¿Qué riesgo señala?", choices: ["Que el río se desborde", "Que deje de llover", "Que no haya tren", "Que cierre la escuela"], answer: 0 },
                { ask: "¿Qué se pide a quien vive cerca?", choices: ["Quedarse a mirar", "Evacuar con tiempo", "Abrir las ventanas", "Esperar al mediodía"], answer: 1 }
            ]
        },
        {
            id: "rd-n2-keiyaku", level: "n2", title: "El contrato",
            jp: "契約するうえで、料金と解約の条件を確認してください。サインのあとでは、変更が難しいです。",
            kana: "けいやくするうえで、りょうきんとかいやくのじょうけんをかくにんしてください。サインのあとでは、へんこうがむずかしいです。",
            questions: [
                { ask: "¿Qué hay que confirmar antes de firmar?", choices: ["El tiempo y el tren", "La tarifa y cómo cancelar", "El número de asientos", "El nombre del río"], answer: 1 },
                { ask: "Después de firmar, ¿qué pasa con un cambio?", choices: ["Es fácil", "No hace falta", "Es difícil", "Lo hace el público"], answer: 2 }
            ]
        },
        {
            id: "rd-n2-setsumei", level: "n2", title: "Lo que omite",
            jp: "その説明は大事な点を省いているため、事実の一部しか伝えていません。読む人は不利な条件に気づきにくいです。",
            kana: "そのせつめいはだいじなてんをはぶいているため、じじつのいちぶしかつたえていません。よむひとはふりなじょうけんにきづきにくいです。",
            questions: [
                { ask: "¿Qué problema tiene la explicación?", choices: ["Omite puntos importantes", "Está en otro idioma", "Es demasiado larga", "Ya no existe"], answer: 0 },
                { ask: "¿Qué le cuesta ver a quien lee?", choices: ["El título", "La fecha", "Las condiciones desfavorables", "El precio del tren"], answer: 2 }
            ]
        },
        {
            id: "rd-n2-kekseki", level: "n2", title: "No puede faltar",
            jp: "今日の会議は、都合が悪くても欠席するわけにはいきません。資料だけは先に送っておきます。",
            kana: "きょうのかいぎは、つごうがわるくてもけっせきするわけにはいきません。しりょうだけはさきにおくっておきます。",
            questions: [
                { ask: "¿Qué no puede hacer con la reunión de hoy?", choices: ["Faltar", "Llegar", "Hablar", "Escuchar"], answer: 0 },
                { ask: "¿Qué manda por adelantado?", choices: ["El contrato firmado", "Solo los materiales", "La disculpa", "Nada"], answer: 1 }
            ]
        },
        {
            id: "rd-n1-uwasa", level: "n1", title: "El rumor",
            jp: "その噂をそのまま信じると、判断を誤るかねない。出典を確かめてから話すべきだ。",
            kana: "そのうわさをそのまましんじると、はんだんをあやまるかねない。しゅってんをたしかめてからはなすべきだ。",
            questions: [
                { ask: "Si se cree el rumor tal cual, ¿qué puede pasar?", choices: ["Equivocarse al juzgar", "Quedar la fuente clara", "Subir la calidad", "Hacer innecesario el acuerdo"], answer: 0 },
                { ask: "¿Qué hay que hacer antes de contarlo?", choices: ["Firmar", "Comprobar la fuente", "Borrar el texto", "Votarlo"], answer: 1 }
            ]
        },
        {
            id: "rd-n1-kisoku", level: "n1", title: "La norma",
            jp: "規則に即して処理してください。前例があるからといって、例外を認めてはいけません。",
            kana: "きそくにそくしてしょりしてください。ぜんれいがあるからといって、れいがいをみとめてはいけません。",
            questions: [
                { ask: "¿Cómo hay que tramitarlo?", choices: ["Según la norma", "A criterio de una sola persona", "Como el público vote", "Dejándolo para otro día"], answer: 0 },
                { ask: "Aunque haya un precedente, ¿qué no se debe hacer?", choices: ["Leer la norma", "Avisar", "Aceptar una excepción", "Archivar el papel"], answer: 2 }
            ]
        },
        {
            id: "rd-n1-suuji", level: "n1", title: "Sin cifras",
            jp: "数字が示されていない以上、その提案を採用するのは早い。まず根拠を出してもらいたい。",
            kana: "すうじがしめされていないいじょう、そのていあんをさいようするのははやい。まずこんきょをだしてもらいたい。",
            questions: [
                { ask: "¿Por qué es pronto adoptar la propuesta?", choices: ["Porque no hay cifras", "Porque ya se aprobó", "Porque sobra gente", "Porque el plazo acabó"], answer: 0 },
                { ask: "¿Qué pide primero?", choices: ["Una disculpa", "El fundamento", "Un precedente", "Cerrar el tema"], answer: 1 }
            ]
        },
        {
            id: "rd-n1-hatsugen", level: "n1", title: "La intervención",
            jp: "彼の発言は丁寧ではある。とはいえ、責任の所在が曖昧なままでは、合意したことにはならない。",
            kana: "かれのはつげんはていねいではある。とはいえ、せきにんのしょざいがあいまいなままでは、ごういしたことにはならない。",
            questions: [
                { ask: "¿Cómo es el tono de lo que dijo?", choices: ["Cortés", "Gritado", "En otro idioma", "Ilegible"], answer: 0 },
                { ask: "Si no está claro quién responde, ¿qué no hay?", choices: ["Un rumor", "Una norma", "Un acuerdo", "Un plazo de un día"], answer: 2 }
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
