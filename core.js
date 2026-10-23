/* ============================================================
 * NihongoDojo — core.js
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
        "づ": ["du", "dzu"], "ヅ": ["du", "dzu"], // du Kunrei; dzu Hepburn tradicional
        "を": ["o"], "ヲ": ["o"],               // CORRECCIÓN: 'o' ahora aceptado
        "ん": ["nn"], "ン": ["nn"],             // CORRECCIÓN: 'nn' ahora aceptado
        // Yōon: alternativas Kunrei (sya/tya/zya…), IME (cya…) y shya/shyu/shyo.
        "しゃ": ["sya", "shya"], "シャ": ["sya", "shya"],
        "しゅ": ["syu", "shyu"], "シュ": ["syu", "shyu"],
        "しょ": ["syo", "shyo"], "ショ": ["syo", "shyo"],
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
    const DIRECTIONS = { KANA_ROMAJI: "kana-romaji", ROMAJI_KANA: "romaji-kana" };
    const DEFAULT_DIRECTION = DIRECTIONS.KANA_ROMAJI;

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
            result: null,
            choices: null
        }));
    }

    function readingCollision(target, pool) {
        if (!target || !pool) return false;
        for (let i = 0; i < pool.length; i++) {
            const k = pool[i];
            if (k && k.char !== target.char && k.type === target.type && k.romaji === target.romaji) {
                return true;
            }
        }
        return false;
    }

    // Opciones del modo inverso: el kana correcto y hasta 3 distractores
    // de otra lectura. Un homófono (じ/ぢ) no puede ser la respuesta falsa.
    function buildChoices(target, pool, rng, count) {
        const wanted = count === undefined ? 4 : count;
        const others = [];
        const seen = new Set([target.char]);
        const source = pool || [];
        for (let i = 0; i < source.length; i++) {
            const k = source[i] && source[i].kanaObj ? source[i].kanaObj : source[i];
            if (!k || k.type !== target.type || seen.has(k.char)) continue;
            if (k.romaji === target.romaji) continue;
            seen.add(k.char);
            others.push(k);
        }
        function rank(k) {
            if (k.fila === target.fila) return 0;
            if (k.category === target.category) return 1;
            return 2;
        }
        const groups = [[], [], []];
        others.forEach((k) => groups[rank(k)].push(k));
        const ranked = groups.reduce((acc, group) => acc.concat(shuffle(group, rng)), []);
        const picked = ranked.slice(0, Math.max(0, wanted - 1));
        return shuffle([target].concat(picked), rng);
    }

    function ensureChoices(queue, rng) {
        const pool = queue.map((item) => item.kanaObj);
        queue.forEach((item) => {
            const hasTarget = item.choices && item.choices.some((k) => k.char === item.kanaObj.char);
            if (!hasTarget) item.choices = buildChoices(item.kanaObj, pool, rng);
        });
        return queue;
    }

    function checkChoice(target, chosenChar) {
        const chosen = findKana(target.type, chosenChar);
        if (!chosen) {
            return { user: "", expected: target.char, correct: false, empty: true, skipped: false };
        }
        // El acierto es el carácter pedido, no otro con la misma lectura.
        // じ y ぢ se distinguen en la pregunta; no se dan por buenos entre sí.
        return {
            user: chosen.char,
            expected: target.char,
            correct: chosen.char === target.char,
            empty: false,
            skipped: false
        };
    }

    function findKana(type, ch) {
        for (let i = 0; i < KANA_DB.length; i++) {
            if (KANA_DB[i].type === type && KANA_DB[i].char === ch) return KANA_DB[i];
        }
        return null;
    }

    // Recorte por puntos de código (no parte un emoji sustituto).
    function clipCodePoints(text, max) {
        const chars = Array.from(text == null ? "" : String(text));
        if (chars.length <= max) return chars.join("");
        if (max <= 1) return chars.slice(0, max).join("");
        return chars.slice(0, max - 1).join("") + "…";
    }

    function oneLine(text) {
        return String(text == null ? "" : text).replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
    }

    // Textos de sendUpdate dentro de los límites de la spec webxdc:
    // info ≈ 50 caracteres, summary ≈ 20. Sin saltos de línea.
    function buildShareText(correct, total, scope, direction) {
        const safeTotal = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
        let safeCorrect = Number.isFinite(correct) && correct > 0 ? Math.floor(correct) : 0;
        if (safeCorrect > safeTotal) safeCorrect = safeTotal;
        const pct = safeTotal === 0 ? 0 : Math.round((safeCorrect / safeTotal) * 100);
        const score = pct + "% (" + safeCorrect + "/" + safeTotal + ")";
        const syll = scope === "katakana" ? "katakana"
            : scope === "palabras" ? "palabras"
            : scope === "kanji" ? "kanji"
            : scope === "frases" ? "frases"
            : scope === "conjugación" ? "conjugación"
            : scope === "gramática" ? "gramática"
            : scope === "escucha" ? "escucha"
            : scope === "lectura" ? "lectura"
            : scope === "repaso" ? "repaso"
            : "hiragana";
        const suffix = direction === DIRECTIONS.ROMAJI_KANA ? " · inv" : "";
        return {
            summary: clipCodePoints(oneLine(score), 20),
            info: clipCodePoints(oneLine(score + " en " + syll + suffix), 50)
        };
    }

    // Ordena un repaso ya estudiado. No inventa ítems: solo fallos y vistos.
    function planReview(misses, seen, now, options) {
        const limit = options && options.limit > 0 ? Math.floor(options.limit) : 20;
        const dueMs = options && options.dueMs > 0 ? options.dueMs : 3 * 86400000;
        const picked = [];
        const used = new Set();
        function add(row, reason) {
            if (!row || typeof row.id !== "string" || !row.id || typeof row.practice !== "string" || !row.practice) return;
            const key = row.practice + "\n" + row.id;
            if (used.has(key) || picked.length >= limit) return;
            used.add(key);
            picked.push({ id: row.id, practice: row.practice, reason: reason });
        }
        (Array.isArray(misses) ? misses : []).forEach(function (row) { add(row, "miss"); });
        const due = (Array.isArray(seen) ? seen : []).filter(function (row) {
            return row && typeof row.t === "number" && now - row.t >= dueMs;
        }).slice().sort(function (a, b) { return a.t - b.t; });
        due.forEach(function (row) { add(row, "due"); });
        return picked;
    }

    // Aviso de una lección. info ≤ 50 y summary ≤ 20, sin saltos de línea.
    // No usa el alcance del examen: un nivel no debe colarse como silabario.
    function buildLessonShareText(correct, total, lesson) {
        const safeTotal = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
        let safeCorrect = Number.isFinite(correct) && correct > 0 ? Math.floor(correct) : 0;
        if (safeCorrect > safeTotal) safeCorrect = safeTotal;
        const pct = safeTotal === 0 ? 0 : Math.round((safeCorrect / safeTotal) * 100);
        const number = lesson && Number.isFinite(lesson.number) && lesson.number > 0
            ? Math.floor(lesson.number) : 1;
        const pass = lesson && Number.isFinite(lesson.pass) ? lesson.pass : 70;
        const title = oneLine(lesson && lesson.title ? lesson.title : "");
        const head = "Lección " + number + ". ";
        const tail = pct >= pass ? " superada al " + pct + "%" : " al " + pct + "%";
        const room = 50 - Array.from(head).length - Array.from(tail).length;
        const shown = room > 1 ? clipCodePoints(title, room) : "";
        return {
            summary: clipCodePoints(oneLine("L" + number + " " + pct + "%"), 20),
            info: clipCodePoints(oneLine(head + shown + tail), 50)
        };
    }

    // Reconstruye un examen guardado. Descarta instantáneas corruptas
    // o de otra versión en lugar de reanudar a medias.
    function parseExamSnapshot(data) {
        if (!data || (data.v !== 1 && data.v !== 2)) return null;
        if (data.type !== "hiragana" && data.type !== "katakana") return null;
        if (data.mode !== MODES.STRICT && data.mode !== MODES.FLEXIBLE) return null;
        const direction = data.direction === DIRECTIONS.ROMAJI_KANA
            ? DIRECTIONS.ROMAJI_KANA
            : DIRECTIONS.KANA_ROMAJI;
        const reverse = direction === DIRECTIONS.ROMAJI_KANA;
        if (!Array.isArray(data.items) || data.items.length === 0 || data.items.length > 300) return null;
        if (typeof data.index !== "number" || data.index !== Math.floor(data.index)) return null;
        if (data.index < 0 || data.index >= data.items.length) return null;

        const queue = [];
        for (let i = 0; i < data.items.length; i++) {
            const it = data.items[i];
            if (!it || typeof it.char !== "string" || it.char.length > 8) return null;
            const kana = findKana(typeof it.type === "string" ? it.type : data.type, it.char);
            if (!kana || kana.type !== data.type) return null;
            const item = { kanaObj: kana, userAnswer: null, result: null, choices: null };
            const skipped = it.skipped === true;
            const markedCorrect = it.correct === true && !skipped;
            const hasUser = typeof it.user === "string";
            if (skipped || markedCorrect || hasUser) {
                let user = "";
                if (hasUser) {
                    user = reverse ? String(it.user).slice(0, 8) : sanitizeRomaji(it.user);
                    if (!reverse && user.length > 80) user = user.slice(0, 80);
                }
                item.result = {
                    user: user,
                    expected: reverse ? kana.char : String(kana.romaji).toLowerCase(),
                    correct: markedCorrect,
                    empty: false,
                    skipped: skipped
                };
                item.userAnswer = skipped ? null : user;
            }
            if (reverse && Array.isArray(it.choices)) {
                const seen = new Set();
                const resolved = [];
                for (let c = 0; c < it.choices.length && resolved.length < 6; c++) {
                    const choiceChar = it.choices[c];
                    if (typeof choiceChar !== "string" || seen.has(choiceChar)) continue;
                    const choice = findKana(data.type, choiceChar);
                    if (!choice || choice.type !== data.type) continue;
                    if (choice.romaji === kana.romaji && choice.char !== kana.char) continue;
                    seen.add(choiceChar);
                    resolved.push(choice);
                }
                if (!seen.has(kana.char)) resolved.unshift(kana);
                if (resolved.length) item.choices = resolved;
            }
            queue.push(item);
        }

        // No repreguntar un ítem ya respondido, ni contar respuestas
        // que un almacén manipulado hubiera puesto por delante del índice.
        for (let i = data.index + 1; i < queue.length; i++) {
            queue[i].result = null;
            queue[i].userAnswer = null;
        }
        const waitingNext = !!queue[data.index].result;
        if (reverse) ensureChoices(queue);
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
            type: data.type,
            mode: data.mode,
            queue: queue,
            index: data.index,
            waitingNext: waitingNext,
            direction: direction,
            lessonId: lessonIdOf(data),
            correct: correct,
            wrong: wrong,
            skipped: skipped
        };
    }

    function lessonIdOf(data) {
        if (!data || typeof data.lessonId !== "string") return "";
        return /^[a-z0-9-]{1,80}$/.test(data.lessonId) ? data.lessonId : "";
    }

    // Copia del progreso. No es un aviso de puntuación: es un archivo para otra versión.
    const BACKUP_KEY = /^(?:lessons(?:\.n[1-5])?|seen\.n[1-5]|miss\.kana|miss\.n[1-5]\.(?:words|kanji|phrases|conj|grammar|reading)|exam|mode|type|direction|audio|practice|answerMode|level|home|(?:word|kanji|phrase|conj|grammar)Direction|sel\.(?:hiragana|katakana)\.(?:basic|rendaku|yoon)|sel\.(?:words|kanji|phrases|conj|grammar)|sel\.n[1-5]\.(?:words|kanji|phrases|conj|grammar))$/;
    const BACKUP_VALUE_MAX = 2000000;
    const BACKUP_TOTAL_MAX = 4000000;
    const BACKUP_KEYS_MAX = 200;

    function isBackupKey(name) {
        return typeof name === "string" && BACKUP_KEY.test(name);
    }

    function takeBackupKeys(source) {
        if (!source || typeof source !== "object" || Array.isArray(source)) return null;
        const names = Object.keys(source);
        if (names.length > BACKUP_KEYS_MAX) return null;
        const keys = {};
        let total = 0;
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            if (!isBackupKey(name)) continue;
            const value = source[name];
            if (typeof value !== "string" || value.length > BACKUP_VALUE_MAX) return null;
            total += value.length;
            if (total > BACKUP_TOTAL_MAX) return null;
            keys[name] = value;
        }
        return keys;
    }

    function buildBackup(entries, meta) {
        const keys = takeBackupKeys(entries || {});
        if (!keys || !Object.keys(keys).length) return null;
        const app = meta && typeof meta.app === "string" ? oneLine(meta.app).slice(0, 20) : "";
        const exportedAt = meta && typeof meta.exportedAt === "string" ? oneLine(meta.exportedAt).slice(0, 40) : "";
        return { kind: "nihongodojo-backup", v: 1, app: app, exportedAt: exportedAt, keys: keys };
    }

    function parseBackup(data) {
        if (!data || data.kind !== "nihongodojo-backup" || data.v !== 1) return null;
        const keys = takeBackupKeys(data.keys);
        if (!keys || !Object.keys(keys).length) return null;
        return {
            v: 1,
            app: typeof data.app === "string" ? oneLine(data.app).slice(0, 20) : "",
            keys: keys
        };
    }

    function backupSummary(keys) {
        const passed = { n5: 0, n4: 0, n3: 0, n2: 0, n1: 0 };
        function count(raw, level) {
            if (typeof raw !== "string") return;
            let data;
            try { data = JSON.parse(raw); } catch (e) { return; }
            if (!data || typeof data !== "object" || Array.isArray(data)) return;
            Object.keys(data).forEach(function (id) {
                if (data[id] && data[id].passed === true) passed[level] += 1;
            });
        }
        count(keys && keys.lessons, "n5");
        ["n4", "n3", "n2", "n1"].forEach(function (level) {
            count(keys && keys["lessons." + level], level);
        });
        let misses = 0;
        Object.keys(keys || {}).forEach(function (name) {
            if (name.indexOf("miss.") !== 0) return;
            try {
                const arr = JSON.parse(keys[name]);
                if (Array.isArray(arr)) misses += arr.length;
            } catch (e) { /* un fallo ilegible no infla el resumen */ }
        });
        return { passed: passed, misses: misses };
    }

    function backupLine(summary) {
        const parts = [];
        let total = 0;
        ["n5", "n4", "n3", "n2", "n1"].forEach(function (level) {
            const n = summary && summary.passed ? summary.passed[level] : 0;
            if (!n) return;
            total += n;
            parts.push(level.toUpperCase() + " " + n);
        });
        const lessons = parts.length
            ? parts.join(", ") + (total === 1 ? " superada" : " superadas")
            : "sin lecciones superadas";
        const n = summary && summary.misses ? summary.misses : 0;
        const misses = n ? n + (n === 1 ? " fallo" : " fallos") : "sin fallos";
        return oneLine(lessons + ". " + misses + ".");
    }

    function backupChatText(summary) {
        return clipCodePoints(oneLine("Copia de NihongoDojo. " + backupLine(summary) + " Ábrela en la versión nueva con Restaurar copia."), 500);
    }

    function backupFileName(iso) {
        const day = String(iso || "").slice(0, 10);
        return /^\d{4}-\d{2}-\d{2}$/.test(day) ? "nihongodojo-copia-" + day + ".json" : "nihongodojo-copia.json";
    }

    // API pública
    const api = {
        MODES,
        DEFAULT_MODE,
        DIRECTIONS,
        DEFAULT_DIRECTION,
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
        buildQueue,
        buildChoices,
        ensureChoices,
        checkChoice,
        readingCollision,
        findKana,
        clipCodePoints,
        buildShareText,
        buildLessonShareText,
        planReview,
        parseExamSnapshot,
        buildBackup,
        parseBackup,
        backupSummary,
        backupLine,
        backupChatText,
        backupFileName
    };

    root.NihongoDojoCore = api;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }
})(typeof window !== "undefined" ? window : globalThis);
