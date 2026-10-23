/* ============================================================
 * Kana Dojo — core.js
 * Lógica pura (sin DOM): base de datos de kana (básicos, rendaku
 * 濁音/半濁音 y yōon 拗音), filtros por fila, cola aleatoria y
 * corrección de respuestas en romaji.
 *
 * v1.2.0: se añade la categoría "yoon" (きゃ, しゃ, ちゃ…, 11 grupos
 * × 3 combinaciones por silabario) — cierra MEDIO-1: el placeholder
 * original prometía "bya" y la BD no contenía ningún yōon.
 *
 * CORRECCIÓN (CRÍTICO-1): la validación de romaji del código original
 * era inconsistente:
 *   - `correctRom === 'ji' && (userRaw === 'zi' || userRaw === 'ji')`
 *     contenía una rama muerta ('ji' ya coincidía con la igualdad exacta).
 *   - 'di' para ぢ/ヂ nunca se aceptaba (a diferencia de 'du' para づ/ヅ).
 *   - を/ヲ no aceptaban 'o' y ん no aceptaba 'nn'.
 * Ahora los alias son POR CARÁCTER (no por romaji) y solo se aplican en
 * modo flexible; en modo estricto se exige la romanización Hepburn.
 *
 * v1.2.1 — CORRECCIÓN (BAJO-3, hallada por la suite de pruebas):
 *   sanitizeRomaji() aceptaba cualquier tipo y hacía String(raw):
 *   un objeto producía "objectobject", `true` producía "true" y un
 *   array como ['k','a'] producía "ka" (¡respuesta válida!).
 *   Ahora cualquier entrada no-string devuelve "" (equivale a vacío:
 *   la UI avisa sin contar fallo). Desde la UI no era explotable
 *   (input.value siempre es string), pero la API es pública.
 *
 * Este archivo no toca el DOM: se carga en el navegador (script clásico,
 * sin módulos, máxima compatibilidad con WebViews) y en Node.js (require)
 * para las pruebas automatizadas.
 * ============================================================ */
(function (root) {
    'use strict';

    // ---------------------------------------------------------
    // 1. BASE DE DATOS: kana básicos + rendaku (濁音) y handaku (半濁音)
    //    Estructura: fila → pares [carácter, romaji Hepburn]
    // ---------------------------------------------------------
    const HIRAGANA_BASIC_ROWS = {
        "あ行": [["あ", "a"], ["い", "i"], ["う", "u"], ["え", "e"], ["お", "o"]],
        "か行": [["か", "ka"], ["き", "ki"], ["く", "ku"], ["け", "ke"], ["こ", "ko"]],
        "さ行": [["さ", "sa"], ["し", "shi"], ["す", "su"], ["せ", "se"], ["そ", "so"]],
        "た行": [["た", "ta"], ["ち", "chi"], ["つ", "tsu"], ["て", "te"], ["と", "to"]],
        "な行": [["な", "na"], ["に", "ni"], ["ぬ", "nu"], ["ね", "ne"], ["の", "no"]],
        "は行": [["は", "ha"], ["ひ", "hi"], ["ふ", "fu"], ["へ", "he"], ["ほ", "ho"]],
        "ま行": [["ま", "ma"], ["み", "mi"], ["む", "mu"], ["め", "me"], ["も", "mo"]],
        "や行": [["や", "ya"], ["ゆ", "yu"], ["よ", "yo"]],
        "ら行": [["ら", "ra"], ["り", "ri"], ["る", "ru"], ["れ", "re"], ["ろ", "ro"]],
        "わ行": [["わ", "wa"], ["を", "wo"], ["ん", "n"]]
    };

    const KATAKANA_BASIC_ROWS = {
        "ア行": [["ア", "a"], ["イ", "i"], ["ウ", "u"], ["エ", "e"], ["オ", "o"]],
        "カ行": [["カ", "ka"], ["キ", "ki"], ["ク", "ku"], ["ケ", "ke"], ["コ", "ko"]],
        "サ行": [["サ", "sa"], ["シ", "shi"], ["ス", "su"], ["セ", "se"], ["ソ", "so"]],
        "タ行": [["タ", "ta"], ["チ", "chi"], ["ツ", "tsu"], ["テ", "te"], ["ト", "to"]],
        "ナ行": [["ナ", "na"], ["ニ", "ni"], ["ヌ", "nu"], ["ネ", "ne"], ["ノ", "no"]],
        "ハ行": [["ハ", "ha"], ["ヒ", "hi"], ["フ", "fu"], ["ヘ", "he"], ["ホ", "ho"]],
        "マ行": [["マ", "ma"], ["ミ", "mi"], ["ム", "mu"], ["メ", "me"], ["モ", "mo"]],
        "ヤ行": [["ヤ", "ya"], ["ユ", "yu"], ["ヨ", "yo"]],
        "ラ行": [["ラ", "ra"], ["リ", "ri"], ["ル", "ru"], ["レ", "re"], ["ロ", "ro"]],
        "ワ行": [["ワ", "wa"], ["ヲ", "wo"], ["ン", "n"]]
    };

    // Grupos sonorizados (rendaku) y semi-sonorizados (handaku = ぱ行)
    const RENDAKU_DATA = {
        hiragana: {
            "が行 (G)": [["が", "ga"], ["ぎ", "gi"], ["ぐ", "gu"], ["げ", "ge"], ["ご", "go"]],
            "ざ行 (Z/J)": [["ざ", "za"], ["じ", "ji"], ["ず", "zu"], ["ぜ", "ze"], ["ぞ", "zo"]],
            "だ行 (D)": [["だ", "da"], ["ぢ", "ji"], ["づ", "zu"], ["で", "de"], ["ど", "do"]],
            "ば行 (B)": [["ば", "ba"], ["び", "bi"], ["ぶ", "bu"], ["べ", "be"], ["ぼ", "bo"]],
            "ぱ行 (P)": [["ぱ", "pa"], ["ぴ", "pi"], ["ぷ", "pu"], ["ぺ", "pe"], ["ぽ", "po"]]
        },
        katakana: {
            "ガ行 (G)": [["ガ", "ga"], ["ギ", "gi"], ["グ", "gu"], ["ゲ", "ge"], ["ゴ", "go"]],
            "ザ行 (Z/J)": [["ザ", "za"], ["ジ", "ji"], ["ズ", "zu"], ["ゼ", "ze"], ["ゾ", "zo"]],
            "ダ行 (D)": [["ダ", "da"], ["ヂ", "ji"], ["ヅ", "zu"], ["デ", "de"], ["ド", "do"]],
            "バ行 (B)": [["バ", "ba"], ["ビ", "bi"], ["ブ", "bu"], ["ベ", "be"], ["ボ", "bo"]],
            "パ行 (P)": [["パ", "pa"], ["ピ", "pi"], ["プ", "pu"], ["ペ", "pe"], ["ポ", "po"]]
        }
    };

    // ---------------------------------------------------------
    // 1b. YŌON (拗音): combinaciones consonante + ゃ/ゅ/ょ.
    //     11 grupos × 3 por silabario (la tabla estándar; se excluyen
    //     las formas raras con ぢ). NOTA: cada "carácter" mide 2
    //     unidades UTF-16 (kana base + kana pequeña).
    // ---------------------------------------------------------
    const YOON_DATA = {
        hiragana: {
            "きゃ行 (KY)": [["きゃ", "kya"], ["きゅ", "kyu"], ["きょ", "kyo"]],
            "しゃ行 (SH)": [["しゃ", "sha"], ["しゅ", "shu"], ["しょ", "sho"]],
            "ちゃ行 (CH)": [["ちゃ", "cha"], ["ちゅ", "chu"], ["ちょ", "cho"]],
            "にゃ行 (NY)": [["にゃ", "nya"], ["にゅ", "nyu"], ["にょ", "nyo"]],
            "ひゃ行 (HY)": [["ひゃ", "hya"], ["ひゅ", "hyu"], ["ひょ", "hyo"]],
            "みゃ行 (MY)": [["みゃ", "mya"], ["みゅ", "myu"], ["みょ", "myo"]],
            "りゃ行 (RY)": [["りゃ", "rya"], ["りゅ", "ryu"], ["りょ", "ryo"]],
            "ぎゃ行 (GY)": [["ぎゃ", "gya"], ["ぎゅ", "gyu"], ["ぎょ", "gyo"]],
            "じゃ行 (J)":  [["じゃ", "ja"], ["じゅ", "ju"], ["じょ", "jo"]],
            "びゃ行 (BY)": [["びゃ", "bya"], ["びゅ", "byu"], ["びょ", "byo"]],
            "ぴゃ行 (PY)": [["ぴゃ", "pya"], ["ぴゅ", "pyu"], ["ぴょ", "pyo"]]
        },
        katakana: {
            "キャ行 (KY)": [["キャ", "kya"], ["キュ", "kyu"], ["キョ", "kyo"]],
            "シャ行 (SH)": [["シャ", "sha"], ["シュ", "shu"], ["ショ", "sho"]],
            "チャ行 (CH)": [["チャ", "cha"], ["チュ", "chu"], ["チョ", "cho"]],
            "ニャ行 (NY)": [["ニャ", "nya"], ["ニュ", "nyu"], ["ニョ", "nyo"]],
            "ヒャ行 (HY)": [["ヒャ", "hya"], ["ヒュ", "hyu"], ["ヒョ", "hyo"]],
            "ミャ行 (MY)": [["ミャ", "mya"], ["ミュ", "myu"], ["ミョ", "myo"]],
            "リャ行 (RY)": [["リャ", "rya"], ["リュ", "ryu"], ["リョ", "ryo"]],
            "ギャ行 (GY)": [["ギャ", "gya"], ["ギュ", "gyu"], ["ギョ", "gyo"]],
            "ジャ行 (J)":  [["ジャ", "ja"], ["ジュ", "ju"], ["ジョ", "jo"]],
            "ビャ行 (BY)": [["ビャ", "bya"], ["ビュ", "byu"], ["ビョ", "byo"]],
            "ピャ行 (PY)": [["ピャ", "pya"], ["ピュ", "pyu"], ["ピョ", "pyo"]]
        }
    };

    // Alias de romanización POR CARÁCTER (Kunrei-shiki y variantes comunes).
    // Solo se aplican en modo flexible; el modo estricto exige Hepburn.
    // Las claves miden 1 unidad (kana simple) o 2 (yōon).
    const ROMAJI_ALIASES = {
        "し": ["si"], "シ": ["si"],
        "ち": ["ti"], "チ": ["ti"],
        "つ": ["tu"], "ツ": ["tu"],
        "ふ": ["hu"], "フ": ["hu"],
        "じ": ["zi"], "ジ": ["zi"],
        "ぢ": ["di", "zi"], "ヂ": ["di", "zi"], // CORRECCIÓN: 'di' ahora aceptado
        "づ": ["du"], "ヅ": ["du"],
        "を": ["o"], "ヲ": ["o"],               // CORRECCIÓN: 'o' ahora aceptado
        "ん": ["nn"], "ン": ["nn"],             // CORRECCIÓN: 'nn' ahora aceptado
        // Yōon: alternativas Kunrei (sya/tya/zya…) e IME (cya…).
        "しゃ": ["sya"], "シャ": ["sya"],
        "しゅ": ["syu"], "シュ": ["syu"],
        "しょ": ["syo"], "ショ": ["syo"],
        "ちゃ": ["tya", "cya"], "チャ": ["tya", "cya"],
        "ちゅ": ["tyu", "cyu"], "チュ": ["tyu", "cyu"],
        "ちょ": ["tyo", "cyo"], "チョ": ["tyo", "cyo"],
        "じゃ": ["jya", "zya"], "ジャ": ["jya", "zya"],
        "じゅ": ["jyu", "zyu"], "ジュ": ["jyu", "zyu"],
        "じょ": ["jyo", "zyo"], "ジョ": ["jyo", "zyo"]
    };

    const MODES = { STRICT: "strict", FLEXIBLE: "flexible" };
    // Por defecto, flexible: es el comportamiento más cercano al original
    // (que ya aceptaba si/ti/tu/hu/zi/du) pero ahora consistente.
    const DEFAULT_MODE = MODES.FLEXIBLE;

    function buildDatabase() {
        const db = [];
        for (const [fila, kanaList] of Object.entries(HIRAGANA_BASIC_ROWS)) {
            for (const [ch, rom] of kanaList) {
                db.push({ char: ch, romaji: rom, type: "hiragana", category: "basic", fila: fila });
            }
        }
        for (const [fila, kanaList] of Object.entries(KATAKANA_BASIC_ROWS)) {
            for (const [ch, rom] of kanaList) {
                db.push({ char: ch, romaji: rom, type: "katakana", category: "basic", fila: fila });
            }
        }
        for (const [type, groups] of Object.entries(RENDAKU_DATA)) {
            for (const [grupo, items] of Object.entries(groups)) {
                for (const [ch, rom] of items) {
                    db.push({ char: ch, romaji: rom, type: type, category: "rendaku", fila: grupo });
                }
            }
        }
        for (const [type, groups] of Object.entries(YOON_DATA)) {
            for (const [grupo, items] of Object.entries(groups)) {
                for (const [ch, rom] of items) {
                    db.push({ char: ch, romaji: rom, type: type, category: "yoon", fila: grupo });
                }
            }
        }
        return db;
    }
    const KANA_DB = buildDatabase();

    // ---------------------------------------------------------
    // 2. Saneamiento de la entrada de usuario
    //    v1.2.1 (BAJO-3): solo se aceptan strings; cualquier otro
    //    tipo devuelve "" (antes String(raw) convertía objetos en
    //    "objectobject" y arrays podían validar como respuesta).
    //    NFKD descompone letras a ancho completo (ｇａ→ga) y tildes
    //    (á→a+◌́); se eliminan los diacríticos y todo lo que no sea
    //    a-z. Así " SHI!" y "ｓｈｉ" valen "shi".
    // ---------------------------------------------------------
    function sanitizeRomaji(raw) {
        if (typeof raw !== "string") return "";
        return raw
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "") // diacríticos
            .toLowerCase()
            .replace(/[^a-z]/g, "");         // solo letras ASCII
    }

    // ---------------------------------------------------------
    // 3. Corrección de respuestas
    //    Devuelve un objeto resultado inmutable-ish en lugar de
    //    mutar estados dispersos (el original mezclaba isCorrect,
    //    userAnswer y contadores en varios sitios).
    // ---------------------------------------------------------
    function checkAnswer(kana, rawInput, mode) {
        const user = sanitizeRomaji(rawInput);
        const expected = String(kana.romaji).toLowerCase();
        if (user === "") {
            // Entrada vacía: señalada aparte para que la UI avise sin
            // contarla como fallo (el original la contaba como error).
            return { user, expected, correct: false, empty: true, skipped: false };
        }
        let correct = user === expected;
        if (!correct && mode !== MODES.STRICT) {
            correct = (ROMAJI_ALIASES[kana.char] || []).indexOf(user) !== -1;
        }
        return { user, expected, correct, empty: false, skipped: false };
    }

    function markSkipped(kana) {
        return {
            user: "",
            expected: String(kana.romaji).toLowerCase(),
            correct: false,
            empty: false,
            skipped: true
        };
    }

    // ---------------------------------------------------------
    // 4. Filtrado por silabario / filas
    // ---------------------------------------------------------
    function getBasicRowsByType(type) {
        const present = new Set();
        for (const k of KANA_DB) {
            if (k.type === type && k.category === "basic") present.add(k.fila);
        }
        const reference = type === "katakana" ? KATAKANA_BASIC_ROWS : HIRAGANA_BASIC_ROWS;
        return Object.keys(reference).filter((row) => present.has(row));
    }

    function getRendakuRowsByType(type) {
        const present = new Set();
        for (const k of KANA_DB) {
            if (k.type === type && k.category === "rendaku") present.add(k.fila);
        }
        const groups = type === "katakana" ? RENDAKU_DATA.katakana : RENDAKU_DATA.hiragana;
        return Object.keys(groups).filter((g) => present.has(g));
    }

    function getYoonRowsByType(type) {
        const present = new Set();
        for (const k of KANA_DB) {
            if (k.type === type && k.category === "yoon") present.add(k.fila);
        }
        const groups = type === "katakana" ? YOON_DATA.katakana : YOON_DATA.hiragana;
        return Object.keys(groups).filter((g) => present.has(g));
    }

    function toNameArray(selection) {
        if (!selection) return [];
        if (Array.isArray(selection)) return selection;
        if (typeof selection.has === "function") return Array.from(selection); // admite Set
        return [];
    }

    function getFilteredKana(type, basicRows, rendakuRows, yoonRows) {
        const basic = toNameArray(basicRows);
        const rendaku = toNameArray(rendakuRows);
        const yoon = toNameArray(yoonRows);
        return KANA_DB.filter((k) => {
            if (k.type !== type) return false;
            if (k.category === "basic" && basic.indexOf(k.fila) !== -1) return true;
            if (k.category === "rendaku" && rendaku.indexOf(k.fila) !== -1) return true;
            if (k.category === "yoon" && yoon.indexOf(k.fila) !== -1) return true;
            return false;
        });
    }

    // ---------------------------------------------------------
    // 5. Cola aleatoria
    //    Fisher-Yates sobre copia (no muta la entrada). El generador
    //    aleatorio es inyectable para pruebas deterministas.
    // ---------------------------------------------------------
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

    // v1.2.0: la selección de yōon es un parámetro explícito (4º) y el
    // RNG pasa a 5º (inyectable para pruebas deterministas).
    function buildQueue(type, basicRows, rendakuRows, yoonRows, rng) {
        const available = getFilteredKana(type, basicRows, rendakuRows, yoonRows);
        if (available.length === 0) return [];
        return shuffle(available, rng).map((k) => ({
            kanaObj: k,
            userAnswer: null,
            result: null
        }));
    }

    // API pública
    const api = {
        MODES,
        DEFAULT_MODE,
        KANA_DB,
        HIRAGANA_BASIC_ROWS,
        KATAKANA_BASIC_ROWS,
        RENDAKU_DATA,
        YOON_DATA,
        ROMAJI_ALIASES,
        sanitizeRomaji,
        checkAnswer,
        markSkipped,
        getBasicRowsByType,
        getRendakuRowsByType,
        getYoonRowsByType,
        getFilteredKana,
        shuffle,
        buildQueue
    };

    root.KanaDojoCore = api;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }
})(typeof window !== "undefined" ? window : globalThis);
