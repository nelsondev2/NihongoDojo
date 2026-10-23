/**
 * NihongoDojo — palabras y kanji de principiante.
 * Sin red: la lista vive en la app. Las lecturas principales son las
 * que un curso inicial enseña; `note` / `also` guardan las otras
 * para no fingir que un kanji tiene una sola lectura.
 *
 * No es el JLPT completo ni un diccionario. Es el siguiente paso
 * después de los silabarios.
 */
(function (root) {
    "use strict";

    const PRACTICES = { WORDS: "words", KANJI: "kanji", PHRASES: "phrases" };
    const DIRECTIONS = {
        WORD_ES: "word-es",
        ES_WORD: "es-word",
        KANJI_ES: "kanji-es",
        ES_KANJI: "es-kanji",
        KANJI_READING: "kanji-reading",
        PHRASE_ES: "phrase-es",
        ES_PHRASE: "es-phrase",
        PARTICLE: "particle"
    };

    const WORD_GROUPS = [
        { id: "saludos", label: "Saludos" },
        { id: "gente", label: "Gente" },
        { id: "numeros", label: "Números" },
        { id: "tiempo", label: "Tiempo" },
        { id: "lugares", label: "Lugares" },
        { id: "comida", label: "Comida" },
        { id: "verbos", label: "Verbos" },
        { id: "adjetivos", label: "Adjetivos" },
        { id: "naturaleza", label: "Naturaleza" },
        { id: "particulas", label: "Partículas" }
    ];
    const KANJI_GROUPS = [
        { id: "numeros", label: "Números" },
        { id: "tiempo", label: "Tiempo" },
        { id: "gente", label: "Gente" },
        { id: "cuerpo", label: "Cuerpo" },
        { id: "lugares", label: "Lugares" },
        { id: "verbos", label: "Verbos" },
        { id: "adjetivos", label: "Adjetivos" },
        { id: "naturaleza", label: "Naturaleza" }
    ];
    const WORD_STARTER = ["saludos", "numeros", "gente"];
    const KANJI_STARTER = ["numeros", "cuerpo"];
    const PHRASE_GROUPS = [
        { id: "desu", label: "です" },
        { id: "masu", label: "ます" },
        { id: "lugar", label: "Lugar" },
        { id: "pregunta", label: "Preguntas" },
        { id: "adjetivo", label: "Adjetivos" },
        { id: "tiempo", label: "Tiempo" },
        { id: "enlace", label: "も・の" }
    ];
    const PHRASE_STARTER = ["desu"];

    // id, kana, kanji, romaji, es, group, note
    const WORD_ROWS = [
        ["konnichiwa", "こんにちは", "", "konnichiwa", "hola", "saludos", "Saludo de día. Por la mañana se usa おはよう."],
        ["ohayou", "おはよう", "", "ohayou", "buenos días", "saludos", "Más formal: おはようございます."],
        ["konbanwa", "こんばんは", "", "konbanwa", "buenas noches", "saludos", "Al llegar, no al despedirse."],
        ["sayounara", "さようなら", "", "sayounara", "adiós", "saludos", ""],
        ["arigatou", "ありがとう", "", "arigatou", "gracias", "saludos", "Más formal: ありがとうございます."],
        ["sumimasen", "すみません", "", "sumimasen", "disculpa", "saludos", ""],
        ["gomen", "ごめんなさい", "", "gomen nasai", "lo siento", "saludos", ""],
        ["hai", "はい", "", "hai", "sí", "saludos", ""],
        ["iie", "いいえ", "", "iie", "no", "saludos", ""],
        ["onegai", "おねがいします", "", "onegai shimasu", "por favor", "saludos", ""],
        ["hajimemashite", "はじめまして", "", "hajimemashite", "mucho gusto", "saludos", ""],

        ["watashi", "わたし", "私", "watashi", "yo", "gente", ""],
        ["anata", "あなた", "", "anata", "tú", "gente", "Suele evitarse. Es más natural decir el nombre."],
        ["hito", "ひと", "人", "hito", "persona", "gente", ""],
        ["tomodachi", "ともだち", "友達", "tomodachi", "amigo", "gente", ""],
        ["kazoku", "かぞく", "家族", "kazoku", "familia", "gente", ""],
        ["sensei", "せんせい", "先生", "sensei", "profesor", "gente", ""],
        ["gakusei", "がくせい", "学生", "gakusei", "estudiante", "gente", ""],
        ["kodomo", "こども", "子供", "kodomo", "niño", "gente", ""],
        ["onna", "おんな", "女", "onna", "mujer", "gente", ""],
        ["otoko", "おとこ", "男", "otoko", "hombre", "gente", ""],
        ["namae", "なまえ", "名前", "namae", "nombre", "gente", ""],

        ["ichi", "いち", "一", "ichi", "uno", "numeros", ""],
        ["ni", "に", "二", "ni", "dos", "numeros", ""],
        ["san", "さん", "三", "san", "tres", "numeros", ""],
        ["yon", "よん", "四", "yon", "cuatro", "numeros", "También se lee し."],
        ["go", "ご", "五", "go", "cinco", "numeros", ""],
        ["roku", "ろく", "六", "roku", "seis", "numeros", ""],
        ["nana", "なな", "七", "nana", "siete", "numeros", "También se lee しち."],
        ["hachi", "はち", "八", "hachi", "ocho", "numeros", ""],
        ["kyuu", "きゅう", "九", "kyuu", "nueve", "numeros", "También se lee く."],
        ["juu", "じゅう", "十", "juu", "diez", "numeros", ""],
        ["hyaku", "ひゃく", "百", "hyaku", "cien", "numeros", ""],
        ["sen", "せん", "千", "sen", "mil", "numeros", ""],
        ["man", "まん", "万", "man", "diez mil", "numeros", ""],
        ["en", "えん", "円", "en", "yen", "numeros", ""],

        ["ima", "いま", "今", "ima", "ahora", "tiempo", ""],
        ["kyou", "きょう", "今日", "kyou", "hoy", "tiempo", ""],
        ["ashita", "あした", "明日", "ashita", "mañana", "tiempo", "El día siguiente, no el saludo. También existe あす."],
        ["kinou", "きのう", "昨日", "kinou", "ayer", "tiempo", ""],
        ["mainichi", "まいにち", "毎日", "mainichi", "todos los días", "tiempo", ""],
        ["getsuyoubi", "げつようび", "月曜日", "getsuyoubi", "lunes", "tiempo", ""],
        ["kayoubi", "かようび", "火曜日", "kayoubi", "martes", "tiempo", ""],
        ["suiyoubi", "すいようび", "水曜日", "suiyoubi", "miércoles", "tiempo", ""],
        ["mokuyoubi", "もくようび", "木曜日", "mokuyoubi", "jueves", "tiempo", ""],
        ["kinyoubi", "きんようび", "金曜日", "kinyoubi", "viernes", "tiempo", ""],
        ["doyoubi", "どようび", "土曜日", "doyoubi", "sábado", "tiempo", ""],
        ["nichiyoubi", "にちようび", "日曜日", "nichiyoubi", "domingo", "tiempo", ""],
        ["jikan", "じかん", "時間", "jikan", "hora", "tiempo", ""],

        ["ie", "いえ", "家", "ie", "casa", "lugares", "También se dice うち."],
        ["heya", "へや", "部屋", "heya", "habitación", "lugares", ""],
        ["gakkou", "がっこう", "学校", "gakkou", "escuela", "lugares", ""],
        ["eki", "えき", "駅", "eki", "estación", "lugares", ""],
        ["kuni", "くに", "国", "kuni", "país", "lugares", ""],
        ["machi", "まち", "町", "machi", "pueblo", "lugares", ""],
        ["mise", "みせ", "店", "mise", "tienda", "lugares", ""],
        ["toshokan", "としょかん", "図書館", "toshokan", "biblioteca", "lugares", ""],
        ["byouin", "びょういん", "病院", "byouin", "hospital", "lugares", ""],
        ["ginkou", "ぎんこう", "銀行", "ginkou", "banco", "lugares", ""],

        ["mizu", "みず", "水", "mizu", "agua", "comida", ""],
        ["gohan", "ごはん", "ご飯", "gohan", "arroz", "comida", "También nombra la comida del día."],
        ["ocha", "おちゃ", "お茶", "ocha", "té", "comida", ""],
        ["sakana", "さかな", "魚", "sakana", "pescado", "comida", ""],
        ["niku", "にく", "肉", "niku", "carne", "comida", ""],
        ["yasai", "やさい", "野菜", "yasai", "verdura", "comida", ""],
        ["kudamono", "くだもの", "果物", "kudamono", "fruta", "comida", ""],
        ["pan", "パン", "", "pan", "pan", "comida", ""],
        ["gyuunyuu", "ぎゅうにゅう", "牛乳", "gyuunyuu", "leche", "comida", ""],
        ["tamago", "たまご", "卵", "tamago", "huevo", "comida", ""],

        ["taberu", "たべる", "食べる", "taberu", "comer", "verbos", ""],
        ["nomu", "のむ", "飲む", "nomu", "beber", "verbos", ""],
        ["iku", "いく", "行く", "iku", "ir", "verbos", ""],
        ["kuru", "くる", "来る", "kuru", "venir", "verbos", ""],
        ["miru", "みる", "見る", "miru", "ver", "verbos", ""],
        ["suru", "する", "", "suru", "hacer", "verbos", ""],
        ["kiku", "きく", "聞く", "kiku", "escuchar", "verbos", "Con otra intención, preguntar."],
        ["hanasu", "はなす", "話す", "hanasu", "hablar", "verbos", ""],
        ["yomu", "よむ", "読む", "yomu", "leer", "verbos", ""],
        ["kaku", "かく", "書く", "kaku", "escribir", "verbos", ""],
        ["kau", "かう", "買う", "kau", "comprar", "verbos", ""],

        ["ookii", "おおきい", "大きい", "ookii", "grande", "adjetivos", ""],
        ["chiisai", "ちいさい", "小さい", "chiisai", "pequeño", "adjetivos", ""],
        ["ii", "いい", "", "ii", "bueno", "adjetivos", "También se dice よい."],
        ["warui", "わるい", "悪い", "warui", "malo", "adjetivos", ""],
        ["atarashii", "あたらしい", "新しい", "atarashii", "nuevo", "adjetivos", ""],
        ["furui", "ふるい", "古い", "furui", "viejo", "adjetivos", "Para cosas, no para la edad de una persona."],
        ["takai", "たかい", "高い", "takai", "alto o caro", "adjetivos", "El mismo kanji vale para la medida y para el precio."],
        ["yasui", "やすい", "安い", "yasui", "barato", "adjetivos", ""],
        ["atsui", "あつい", "暑い", "atsui", "caluroso", "adjetivos", "Es el calor del clima. Al tacto se escribe 熱い."],
        ["samui", "さむい", "寒い", "samui", "frío", "adjetivos", "Es el frío del clima. Al tacto se dice 冷たい."],
        ["oishii", "おいしい", "美味しい", "oishii", "sabroso", "adjetivos", ""],
        ["tanoshii", "たのしい", "楽しい", "tanoshii", "divertido", "adjetivos", ""],

        ["yama", "やま", "山", "yama", "montaña", "naturaleza", ""],
        ["kawa", "かわ", "川", "kawa", "río", "naturaleza", ""],
        ["umi", "うみ", "海", "umi", "mar", "naturaleza", ""],
        ["ame", "あめ", "雨", "ame", "lluvia", "naturaleza", ""],
        ["yuki", "ゆき", "雪", "yuki", "nieve", "naturaleza", ""],
        ["hana", "はな", "花", "hana", "flor", "naturaleza", ""],
        ["hana-nose", "はな", "鼻", "hana", "nariz", "naturaleza", "花, flor, se lee igual. El kanji las distingue."],
        ["neko", "ねこ", "猫", "neko", "gato", "naturaleza", ""],
        ["inu", "いぬ", "犬", "inu", "perro", "naturaleza", ""],
        ["sora", "そら", "空", "sora", "cielo", "naturaleza", ""],
        ["hi-sun", "ひ", "日", "hi", "sol", "naturaleza", "También significa día. 火, fuego, se lee igual."],
        ["hi-fire", "ひ", "火", "hi", "fuego", "naturaleza", "日, sol, se lee igual. El kanji las distingue."],

        ["wa-part", "は", "", "wa", "partícula de tema", "particulas", "Se escribe は y, como partícula, se lee wa. El carácter suelto se lee ha."],
        ["ga-part", "が", "", "ga", "partícula de sujeto", "particulas", "Marca el sujeto o la información nueva."],
        ["wo-part", "を", "", "o", "partícula de objeto", "particulas", "Se escribe を y, como partícula, se lee o."],
        ["ni-part", "に", "", "ni", "partícula de destino", "particulas", "Destino, momento o punto de llegada."],
        ["de-part", "で", "", "de", "partícula de lugar", "particulas", "Lugar donde ocurre la acción, o el medio."],
        ["to-part", "と", "", "to", "partícula de compañía", "particulas", "Compañía, o una cita entre comillas."],
        ["mo-part", "も", "", "mo", "partícula de inclusión", "particulas", "Añade algo al mismo grupo: también."],
        ["no-part", "の", "", "no", "partícula de posesión", "particulas", "Une un nombre con otro."]
    ];

    // id, char, es, reading, group, also
    const KANJI_ROWS = [
        ["k-ichi", "一", "uno", "いち", "numeros", ""],
        ["k-ni", "二", "dos", "に", "numeros", ""],
        ["k-san", "三", "tres", "さん", "numeros", ""],
        ["k-yon", "四", "cuatro", "よん", "numeros", "También し y シ."],
        ["k-go", "五", "cinco", "ご", "numeros", ""],
        ["k-roku", "六", "seis", "ろく", "numeros", ""],
        ["k-nana", "七", "siete", "なな", "numeros", "También しち y シチ."],
        ["k-hachi", "八", "ocho", "はち", "numeros", ""],
        ["k-kyuu", "九", "nueve", "きゅう", "numeros", "También く."],
        ["k-juu", "十", "diez", "じゅう", "numeros", ""],
        ["k-hyaku", "百", "cien", "ひゃく", "numeros", ""],
        ["k-sen", "千", "mil", "せん", "numeros", ""],
        ["k-man", "万", "diez mil", "まん", "numeros", ""],
        ["k-en", "円", "yen", "えん", "numeros", "También círculo."],

        ["k-ima", "今", "ahora", "いま", "tiempo", ""],
        ["k-hi", "日", "sol", "ひ", "tiempo", "También día. En compuestos, ニチ o ジツ."],
        ["k-tsuki", "月", "luna", "つき", "tiempo", "También mes. En 月曜日 se lee ゲツ."],
        ["k-ka", "火", "fuego", "ひ", "tiempo", "En 火曜日 se lee カ."],
        ["k-mizu", "水", "agua", "みず", "tiempo", "En 水曜日 se lee スイ."],
        ["k-ki", "木", "árbol", "き", "tiempo", "En 木曜日 se lee モク."],
        ["k-kin", "金", "dinero", "かね", "tiempo", "También metal y oro. En 金曜日 se lee キン."],
        ["k-tsuchi", "土", "tierra", "つち", "tiempo", "En 土曜日 se lee ド."],
        ["k-toshi", "年", "año", "とし", "tiempo", "En compuestos, ネン."],
        ["k-toki", "時", "momento", "とき", "tiempo", "En 時間 se lee ジ."],
        ["k-shuu", "週", "semana", "しゅう", "tiempo", ""],
        ["k-mai", "毎", "cada", "まい", "tiempo", ""],
        ["k-nani", "何", "qué", "なに", "tiempo", "En 何曜日 se lee ナン."],

        ["k-hito", "人", "persona", "ひと", "gente", "En compuestos, ジン o ニン."],
        ["k-ko", "子", "hijo", "こ", "gente", ""],
        ["k-onna", "女", "mujer", "おんな", "gente", "En compuestos, ジョ."],
        ["k-otoko", "男", "hombre", "おとこ", "gente", "En compuestos, ダン."],
        ["k-tomo", "友", "amigo", "とも", "gente", "En 友達 se lee とも."],
        ["k-chichi", "父", "padre", "ちち", "gente", ""],
        ["k-haha", "母", "madre", "はは", "gente", ""],
        ["k-na", "名", "nombre", "な", "gente", "En compuestos, メイ."],
        ["k-saki", "先", "antes", "さき", "gente", "En 先生 se lee セン."],
        ["k-sei", "生", "vida", "せい", "gente", "También なま, crudo, e いきる, vivir."],

        ["k-me", "目", "ojo", "め", "cuerpo", ""],
        ["k-kuchi", "口", "boca", "くち", "cuerpo", ""],
        ["k-te", "手", "mano", "て", "cuerpo", ""],
        ["k-ashi", "足", "pie", "あし", "cuerpo", "También pierna."],
        ["k-mimi", "耳", "oreja", "みみ", "cuerpo", ""],

        ["k-ie", "家", "casa", "いえ", "lugares", "También うち."],
        ["k-mise", "店", "tienda", "みせ", "lugares", ""],
        ["k-eki", "駅", "estación", "えき", "lugares", ""],
        ["k-kuni", "国", "país", "くに", "lugares", "En compuestos, コク."],
        ["k-gaku", "学", "estudio", "がく", "lugares", "まなぶ es aprender."],
        ["k-kou", "校", "escuela", "こう", "lugares", "Casi solo en compuestos, como 学校."],
        ["k-machi", "町", "pueblo", "まち", "lugares", ""],
        ["k-hon", "本", "libro", "ほん", "lugares", "También origen, もと."],
        ["k-den", "電", "electricidad", "でん", "lugares", "Aparece en 電話 y 電車."],
        ["k-kuruma", "車", "coche", "くるま", "lugares", "En 電車 se lee シャ."],

        ["k-iku", "行", "ir", "いく", "verbos", "También おこなう. En compuestos, コウ o ギョウ."],
        ["k-kuru", "来", "venir", "くる", "verbos", "En compuestos, ライ."],
        ["k-miru", "見", "ver", "みる", "verbos", "En compuestos, ケン."],
        ["k-taberu", "食", "comer", "たべる", "verbos", "También くう. En compuestos, ショク."],
        ["k-nomu", "飲", "beber", "のむ", "verbos", ""],
        ["k-kiku", "聞", "escuchar", "きく", "verbos", "También preguntar."],
        ["k-hanasu", "話", "hablar", "はなす", "verbos", ""],
        ["k-yomu", "読", "leer", "よむ", "verbos", ""],
        ["k-kaku", "書", "escribir", "かく", "verbos", ""],
        ["k-kau", "買", "comprar", "かう", "verbos", ""],

        ["k-oo", "大", "grande", "おおきい", "adjetivos", "El kanji solo se lee おお."],
        ["k-chii", "小", "pequeño", "ちいさい", "adjetivos", "El kanji solo se lee ちい."],
        ["k-taka", "高", "alto", "たかい", "adjetivos", "También caro. El kanji solo se lee たか."],
        ["k-yasu", "安", "barato", "やすい", "adjetivos", "El kanji solo se lee やす."],
        ["k-atara", "新", "nuevo", "あたらしい", "adjetivos", "En compuestos, シン."],
        ["k-furu", "古", "viejo", "ふるい", "adjetivos", "Para cosas. El kanji solo se lee ふる."],

        ["k-yama", "山", "montaña", "やま", "naturaleza", "En compuestos, サン."],
        ["k-kawa", "川", "río", "かわ", "naturaleza", ""],
        ["k-ame", "雨", "lluvia", "あめ", "naturaleza", ""],
        ["k-umi", "海", "mar", "うみ", "naturaleza", "En compuestos, カイ."],
        ["k-hana", "花", "flor", "はな", "naturaleza", ""],
        ["k-inu", "犬", "perro", "いぬ", "naturaleza", ""],
        ["k-sakana", "魚", "pescado", "さかな", "naturaleza", "En compuestos, ギョ."],
        ["k-sora", "空", "cielo", "そら", "naturaleza", "En compuestos, クウ."],
        ["k-neko", "猫", "gato", "ねこ", "naturaleza", ""],
        ["k-yuki", "雪", "nieve", "ゆき", "naturaleza", ""]
    ];

    // id, jp, kana, es, group, particle, note
    // particle vacío: solo entra en traducción, no en el hueco.
    // へ no se pregunta en el hueco: con 行く también vale に.
    const PHRASE_ROWS = [
        ["p-gakusei", "私は学生です", "わたしはがくせいです", "Soy estudiante.", "desu", "は", "は marca el tema. です afirma con cortesía."],
        ["p-kore-mizu", "これは水です", "これはみずです", "Esto es agua.", "desu", "は", "これ es esto, cerca de quien habla."],
        ["p-sore-hon", "それは本です", "それはほんです", "Eso es un libro.", "desu", "は", "それ es eso, cerca de quien escucha."],
        ["p-are-yama", "あれは山です", "あれはやまです", "Aquello es una montaña.", "desu", "は", "あれ es aquello, lejos de los dos."],
        ["p-janai", "私は先生じゃないです", "わたしはせんせいじゃないです", "No soy profesor.", "desu", "は", "じゃないです niega un nombre. Más formal: ではありません."],
        ["p-desu-ka", "学生ですか", "がくせいですか", "¿Eres estudiante?", "desu", "", "か hace la pregunta. El sujeto se omite si ya se entiende."],
        ["p-genki", "お元気ですか", "おげんきですか", "¿Qué tal?", "desu", "", "Saludo. 元気 es ánimo o salud."],

        ["p-tabemasu", "ご飯を食べます", "ごはんをたべます", "Como arroz.", "masu", "を", "を marca el objeto. 食べます es 食べる en cortés."],
        ["p-nomimasu", "水を飲みます", "みずをのみます", "Bebo agua.", "masu", "を", "飲みます es el presente o futuro cortés de 飲む."],
        ["p-yomimasu", "本を読みます", "ほんをよみます", "Leo un libro.", "masu", "を", ""],
        ["p-kakimasu", "名前を書きます", "なまえをかきます", "Escribo el nombre.", "masu", "を", ""],
        ["p-kikimasu", "先生に聞きます", "せんせいにききます", "Le pregunto al profesor.", "masu", "に", "に marca a quién. Aquí 聞く es preguntar."],
        ["p-hanashimasu", "友達と話します", "ともだちとはなします", "Hablo con un amigo.", "masu", "と", "と es compañía: con."],
        ["p-ikimasu", "学校に行きます", "がっこうにいきます", "Voy a la escuela.", "masu", "に", "に marca el destino con 行く."],
        ["p-kimasu", "家に来ます", "いえにきます", "Vengo a casa.", "masu", "に", "来る es irregular: 来ます, no 来ります."],
        ["p-mimasu", "山を見ます", "やまをみます", "Veo la montaña.", "masu", "を", ""],
        ["p-tabemasen", "ご飯を食べません", "ごはんをたべません", "No como arroz.", "masu", "を", "ません es la negación cortés."],
        ["p-nomimashita", "水を飲みました", "みずをのみました", "Bebí agua.", "masu", "を", "ました es el pasado cortés."],
        ["p-ikimasen", "学校に行きませんでした", "がっこうにいきませんでした", "No fui a la escuela.", "masu", "に", "ませんでした es el pasado negativo cortés."],
        ["p-shimasu", "何をしますか", "なにをしますか", "¿Qué haces?", "masu", "を", "します es する en cortés."],

        ["p-gakkou-de", "学校で本を読みます", "がっこうでほんをよみます", "Leo en la escuela.", "lugar", "で", "で es el lugar de la acción. に sería el destino."],
        ["p-ie-de", "家で食べます", "いえでたべます", "Como en casa.", "lugar", "で", ""],
        ["p-eki-e", "駅へ行きます", "えきへいきます", "Voy hacia la estación.", "lugar", "", "へ marca dirección. Con 行く también vale に, por eso aquí no se pregunta el hueco."],
        ["p-mise-de", "店で買います", "みせでかいます", "Compro en la tienda.", "lugar", "で", ""],
        ["p-umi-ni", "海に行きます", "うみにいきます", "Voy al mar.", "lugar", "に", ""],
        ["p-neko-iru", "猫がいます", "ねこがいます", "Hay un gato.", "lugar", "が", "いる es para seres vivos. が marca lo que hay."],
        ["p-hon-aru", "本があります", "ほんがあります", "Hay un libro.", "lugar", "が", "ある es para cosas, no para personas ni animales."],
        ["p-ie-inu", "家に犬がいます", "いえにいぬがいます", "En casa hay un perro.", "lugar", "に", "に marca dónde está. いる porque el perro está vivo."],
        ["p-heya-hon", "部屋に本があります", "へやにほんがあります", "En la habitación hay un libro.", "lugar", "に", ""],
        ["p-gakkou-sensei", "学校に先生がいます", "がっこうにせんせいがいます", "En la escuela hay un profesor.", "lugar", "に", ""],

        ["p-doko", "学校はどこですか", "がっこうはどこですか", "¿Dónde está la escuela?", "pregunta", "は", "どこ es dónde. か cierra la pregunta."],
        ["p-nani", "何を食べますか", "なにをたべますか", "¿Qué comes?", "pregunta", "を", "何 es qué. Delante de を se lee なに."],
        ["p-dare", "あの人はだれですか", "あのひとはだれですか", "¿Quién es esa persona?", "pregunta", "は", "だれ es quién. あの va delante del nombre."],
        ["p-itsu", "いつ学校に行きますか", "いつがっこうにいきますか", "¿Cuándo vas a la escuela?", "pregunta", "に", "いつ es cuándo. A menudo va al principio."],
        ["p-nanji", "今は何時ですか", "いまはなんじですか", "¿Qué hora es?", "pregunta", "は", "何時 se lee なんじ."],

        ["p-atarashii", "この本は新しいです", "このほんはあたらしいです", "Este libro es nuevo.", "adjetivo", "は", "この va delante del nombre. これ no puede."],
        ["p-ookii", "家は大きいです", "いえはおおきいです", "La casa es grande.", "adjetivo", "は", "El い-adjetivo cortés es 大きいです, no 大きいだ."],
        ["p-chiisai", "猫は小さいです", "ねこはちいさいです", "El gato es pequeño.", "adjetivo", "は", ""],
        ["p-atsui", "今日は暑いです", "きょうはあついです", "Hoy hace calor.", "adjetivo", "は", "暑い es el calor del clima, no el del tacto."],
        ["p-samui", "今日は寒いです", "きょうはさむいです", "Hoy hace frío.", "adjetivo", "は", ""],
        ["p-oishii", "このご飯は美味しいです", "このごはんはおいしいです", "Este arroz está rico.", "adjetivo", "は", ""],
        ["p-takai", "この本は高いです", "このほんはたかいです", "Este libro es caro.", "adjetivo", "は", "Con 本, 高い es el precio, no la altura."],
        ["p-yasui", "この店は安いです", "このみせはやすいです", "Esta tienda es barata.", "adjetivo", "は", ""],

        ["p-kyou-iku", "今日は学校に行きます", "きょうはがっこうにいきます", "Hoy voy a la escuela.", "tiempo", "は", ""],
        ["p-ashita", "明日友達が来ます", "あしたともだちがきます", "Mañana viene un amigo.", "tiempo", "が", "が marca quién, cuando esa información es nueva."],
        ["p-kinou", "昨日本を読みました", "きのうほんをよみました", "Ayer leí un libro.", "tiempo", "を", ""],
        ["p-mainichi", "毎日水を飲みます", "まいにちみずをのみます", "Todos los días bebo agua.", "tiempo", "を", ""],
        ["p-nichiyou", "日曜日は家にいます", "にちようびはいえにいます", "El domingo estoy en casa.", "tiempo", "は", "います es estar, de いる."],

        ["p-mo", "私も学生です", "わたしもがくせいです", "Yo también soy estudiante.", "enlace", "も", "も sustituye a は cuando el sentido es también."],
        ["p-no", "私の本です", "わたしのほんです", "Es mi libro.", "enlace", "の", "の une dos nombres: posesión."],
        ["p-suki", "私は猫が好きです", "わたしはねこがすきです", "Me gustan los gatos.", "enlace", "が", "が marca lo que gusta. 好きです no lleva な en medio."]
    ];

    function wordFromRow(row) {
        const speak = row[0] === "wa-part" ? "わ" : (row[0] === "wo-part" ? "お" : row[1]);
        return {
            id: row[0],
            kana: row[1],
            kanji: row[2],
            romaji: row[3],
            es: row[4],
            group: row[5],
            note: row[6] || "",
            speak: speak
        };
    }
    function kanjiFromRow(row) {
        return {
            id: row[0],
            char: row[1],
            es: row[2],
            reading: row[3],
            group: row[4],
            also: row[5] || "",
            speak: row[3]
        };
    }

    function phraseFromRow(row) {
        const particle = row[5] || "";
        const jp = row[1];
        let blank = "";
        if (particle) {
            const at = jp.indexOf(particle);
            if (at < 0) throw new Error("falta la partícula en " + row[0]);
            blank = jp.slice(0, at) + "＿" + jp.slice(at + particle.length);
        }
        return {
            id: row[0],
            jp: jp,
            kana: row[2],
            es: row[3],
            group: row[4],
            particle: particle,
            blank: blank,
            note: row[6] || "",
            speak: row[2]
        };
    }

    const WORDS = WORD_ROWS.map(wordFromRow);
    const KANJI = KANJI_ROWS.map(kanjiFromRow);
    const PHRASES = PHRASE_ROWS.map(phraseFromRow);

    function isKanji(item) {
        return !!(item && item.char && !item.kana);
    }
    function isPhrase(item) {
        return !!(item && item.jp);
    }
    function catalogFor(practice) {
        if (practice === PRACTICES.KANJI) return KANJI;
        if (practice === PRACTICES.PHRASES) return PHRASES;
        return WORDS;
    }
    function catalogOf(item) {
        if (isKanji(item)) return KANJI;
        if (isPhrase(item)) return PHRASES;
        return WORDS;
    }
    function findById(catalog, id) {
        for (let i = 0; i < catalog.length; i++) {
            if (catalog[i].id === id) return catalog[i];
        }
        return null;
    }
    function groupsOf(practice) {
        if (practice === PRACTICES.KANJI) return KANJI_GROUPS;
        if (practice === PRACTICES.PHRASES) return PHRASE_GROUPS;
        return WORD_GROUPS;
    }
    function starterOf(practice) {
        if (practice === PRACTICES.KANJI) return KANJI_STARTER;
        if (practice === PRACTICES.PHRASES) return PHRASE_STARTER;
        return WORD_STARTER;
    }
    function countInGroup(practice, groupId) {
        const catalog = catalogFor(practice);
        let n = 0;
        for (let i = 0; i < catalog.length; i++) {
            if (catalog[i].group === groupId) n++;
        }
        return n;
    }
    function validDirection(practice, direction) {
        if (practice === PRACTICES.KANJI) {
            return direction === DIRECTIONS.KANJI_ES || direction === DIRECTIONS.ES_KANJI || direction === DIRECTIONS.KANJI_READING;
        }
        if (practice === PRACTICES.WORDS) {
            return direction === DIRECTIONS.WORD_ES || direction === DIRECTIONS.ES_WORD;
        }
        if (practice === PRACTICES.PHRASES) {
            return direction === DIRECTIONS.PHRASE_ES || direction === DIRECTIONS.ES_PHRASE || direction === DIRECTIONS.PARTICLE;
        }
        return false;
    }
    function directionLabel(direction) {
        if (direction === DIRECTIONS.WORD_ES) return "palabra → español";
        if (direction === DIRECTIONS.ES_WORD) return "español → palabra";
        if (direction === DIRECTIONS.KANJI_ES) return "kanji → significado";
        if (direction === DIRECTIONS.ES_KANJI) return "significado → kanji";
        if (direction === DIRECTIONS.KANJI_READING) return "kanji → lectura";
        if (direction === DIRECTIONS.PHRASE_ES) return "frase → español";
        if (direction === DIRECTIONS.ES_PHRASE) return "español → frase";
        if (direction === DIRECTIONS.PARTICLE) return "partícula";
        return "kana → romaji";
    }

    function view(item, direction) {
        if (isKanji(item)) return kanjiView(item, direction);
        if (isPhrase(item)) return phraseView(item, direction);
        return wordView(item, direction);
    }
    function phraseView(item, direction) {
        if (direction === DIRECTIONS.PARTICLE) {
            return {
                prompt: item.blank || item.jp,
                promptLang: "ja",
                furigana: "",
                answer: item.particle + " · " + item.jp,
                speak: item.speak,
                speakOnShow: false,
                note: item.es,
                settledNote: item.note,
                choiceText: item.particle,
                choiceSub: "",
                choiceLang: "ja"
            };
        }
        if (direction === DIRECTIONS.ES_PHRASE) {
            return {
                prompt: item.es,
                promptLang: "es",
                furigana: "",
                answer: item.jp + "（" + item.kana + "）",
                speak: item.speak,
                speakOnShow: false,
                note: "",
                settledNote: item.note,
                choiceText: item.jp,
                choiceSub: item.kana,
                choiceLang: "ja"
            };
        }
        return {
            prompt: item.jp,
            promptLang: "ja",
            furigana: item.kana,
            answer: item.es,
            speak: item.speak,
            speakOnShow: true,
            note: "",
            settledNote: item.note,
            choiceText: item.es,
            choiceSub: "",
            choiceLang: "es"
        };
    }
    function wordView(word, direction) {
        const jp = word.kanji || word.kana;
        const furigana = word.kanji ? word.kana : "";
        if (direction === DIRECTIONS.ES_WORD) {
            return {
                prompt: word.es,
                promptLang: "es",
                furigana: "",
                answer: furigana ? jp + "（" + furigana + "）" : jp,
                speak: word.speak,
                speakOnShow: false,
                note: "",
                settledNote: word.note,
                choiceText: jp,
                choiceSub: furigana,
                choiceLang: "ja"
            };
        }
        return {
            prompt: jp,
            promptLang: "ja",
            furigana: furigana,
            answer: word.es,
            speak: word.speak,
            speakOnShow: true,
            note: word.note,
            settledNote: "",
            choiceText: word.es,
            choiceSub: "",
            choiceLang: "es"
        };
    }
    function kanjiView(kanji, direction) {
        if (direction === DIRECTIONS.ES_KANJI) {
            return {
                prompt: kanji.es,
                promptLang: "es",
                furigana: "",
                answer: kanji.char + "（" + kanji.reading + "）",
                speak: kanji.speak,
                speakOnShow: false,
                note: "",
                settledNote: kanji.also,
                choiceText: kanji.char,
                choiceSub: "",
                choiceLang: "ja"
            };
        }
        if (direction === DIRECTIONS.KANJI_READING) {
            return {
                prompt: kanji.char,
                promptLang: "ja",
                furigana: "",
                answer: kanji.reading,
                speak: kanji.speak,
                speakOnShow: false,
                note: "",
                settledNote: kanji.also,
                choiceText: kanji.reading,
                choiceSub: "",
                choiceLang: "ja"
            };
        }
        return {
            prompt: kanji.char,
            promptLang: "ja",
            furigana: "",
            answer: kanji.es,
            speak: kanji.speak,
            speakOnShow: true,
            note: kanji.also,
            settledNote: "",
            choiceText: kanji.es,
            choiceSub: "",
            choiceLang: "es"
        };
    }
    function choiceText(item, direction) {
        return view(item, direction).choiceText;
    }

    function shuffle(list, rng) {
        const random = typeof rng === "function" ? rng : Math.random;
        const arr = list.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    // El acierto va incluido. Un distractor no puede tener el mismo
    // texto: 日 y 火 se leen ひ, así que no se hacen trampas mutuas.
    function buildChoices(target, direction, rng, count) {
        const wanted = count === undefined ? 4 : count;
        const catalog = catalogOf(target);
        const targetLabel = choiceText(target, direction);
        const same = [];
        const rest = [];
        const seen = new Set([target.id]);
        const usedLabels = new Set([targetLabel]);
        for (let i = 0; i < catalog.length; i++) {
            const item = catalog[i];
            if (!item || seen.has(item.id)) continue;
            if (direction === DIRECTIONS.PARTICLE && !item.particle) continue;
            const label = choiceText(item, direction);
            if (!label || usedLabels.has(label)) continue;
            seen.add(item.id);
            usedLabels.add(label);
            if (item.group === target.group) same.push(item);
            else rest.push(item);
        }
        const ranked = shuffle(same, rng).concat(shuffle(rest, rng));
        const picked = ranked.slice(0, Math.max(0, wanted - 1));
        return shuffle([target].concat(picked), rng);
    }

    function ensureChoices(queue, direction, rng) {
        queue.forEach(function (item) {
            const label = choiceText(item.lex, direction);
            const labels = new Set();
            const usable = item.choices && item.choices.some(function (c) { return c.id === item.lex.id; })
                && item.choices.every(function (c) {
                    const text = choiceText(c, direction);
                    if (!text || labels.has(text)) return false;
                    labels.add(text);
                    return c.id === item.lex.id || text !== label;
                });
            if (!usable) item.choices = buildChoices(item.lex, direction, rng);
        });
        return queue;
    }

    function checkChoice(target, chosenId) {
        if (typeof chosenId !== "string" || !chosenId) {
            return { user: "", expected: target.id, correct: false, empty: true, skipped: false };
        }
        return {
            user: chosenId,
            expected: target.id,
            correct: chosenId === target.id,
            empty: false,
            skipped: false
        };
    }

    function filterByGroups(practice, groupIds, direction) {
        const catalog = catalogFor(practice);
        const wanted = new Set(groupIds || []);
        return catalog.filter(function (item) {
            if (!wanted.has(item.group)) return false;
            if (direction === DIRECTIONS.PARTICLE && !item.particle) return false;
            return true;
        });
    }
    function buildQueue(practice, groupIds, direction, rng) {
        const available = filterByGroups(practice, groupIds, direction);
        if (!available.length) return [];
        const queue = shuffle(available, rng).map(function (lex) {
            return { lex: lex, userAnswer: null, result: null, choices: null };
        });
        return ensureChoices(queue, direction, rng);
    }

    function parseExamSnapshot(data) {
        if (!data || data.v !== 3) return null;
        if (data.practice !== PRACTICES.WORDS && data.practice !== PRACTICES.KANJI && data.practice !== PRACTICES.PHRASES) return null;
        if (!validDirection(data.practice, data.direction)) return null;
        if (!Array.isArray(data.items) || data.items.length === 0 || data.items.length > 300) return null;
        if (typeof data.index !== "number" || data.index !== Math.floor(data.index)) return null;
        if (data.index < 0 || data.index >= data.items.length) return null;

        const catalog = catalogFor(data.practice);
        const queue = [];
        for (let i = 0; i < data.items.length; i++) {
            const it = data.items[i];
            if (!it || typeof it.id !== "string") return null;
            const lex = findById(catalog, it.id);
            if (!lex) return null;
            const item = { lex: lex, userAnswer: null, result: null, choices: null };
            const skipped = it.skipped === true;
            const markedCorrect = it.correct === true && !skipped;
            const hasUser = typeof it.user === "string";
            if (skipped || markedCorrect || hasUser) {
                const user = hasUser ? String(it.user).slice(0, 40) : "";
                item.result = {
                    user: user,
                    expected: lex.id,
                    correct: markedCorrect,
                    empty: false,
                    skipped: skipped
                };
                item.userAnswer = skipped ? null : user;
            }
            if (Array.isArray(it.choices)) {
                const resolved = [];
                const seen = new Set();
                const label = choiceText(lex, data.direction);
                for (let c = 0; c < it.choices.length && resolved.length < 6; c++) {
                    const id = it.choices[c];
                    if (typeof id !== "string" || seen.has(id)) continue;
                    const choice = findById(catalog, id);
                    if (!choice) continue;
                    if (choice.id !== lex.id && choiceText(choice, data.direction) === label) continue;
                    seen.add(id);
                    resolved.push(choice);
                }
                if (!seen.has(lex.id)) resolved.unshift(lex);
                if (resolved.length) item.choices = resolved;
            }
            queue.push(item);
        }
        for (let i = data.index + 1; i < queue.length; i++) {
            queue[i].result = null;
            queue[i].userAnswer = null;
        }
        const waitingNext = !!queue[data.index].result;
        ensureChoices(queue, data.direction);
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
        return {
            practice: data.practice,
            direction: data.direction,
            queue: queue,
            index: data.index,
            waitingNext: waitingNext,
            correct: correct,
            wrong: wrong,
            skipped: skipped
        };
    }

    function textForId(practice, id, direction) {
        const catalog = catalogFor(practice);
        const item = findById(catalog, id);
        if (!item) return "";
        return choiceText(item, direction);
    }

    const api = {
        PRACTICES,
        DIRECTIONS,
        WORD_GROUPS,
        KANJI_GROUPS,
        PHRASE_GROUPS,
        WORD_STARTER,
        KANJI_STARTER,
        PHRASE_STARTER,
        WORDS,
        KANJI,
        PHRASES,
        groupsOf,
        starterOf,
        countInGroup,
        validDirection,
        directionLabel,
        view,
        choiceText,
        buildChoices,
        ensureChoices,
        checkChoice,
        filterByGroups,
        buildQueue,
        parseExamSnapshot,
        textForId,
        findById,
        shuffle
    };

    root.NihongoDojoLexicon = api;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }
})(typeof window !== "undefined" ? window : globalThis);
