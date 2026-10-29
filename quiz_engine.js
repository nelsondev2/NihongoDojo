/* QuizEngine — WexDC variado (20 por lección)
 * Tipos: translate_jp_es, translate_es_jp, complete_blank, order_sentence, listening_jp_es
 * Offline, sin APIs, solo speechSynthesis. Determinista con rng inyectable.
 */
(function (root) {
  "use strict";

  const TYPES = {
    TRANSLATE_JP_ES: "translate_jp_es",
    TRANSLATE_ES_JP: "translate_es_jp",
    COMPLETE_BLANK: "complete_blank",
    ORDER_SENTENCE: "order_sentence",
    LISTENING_JP_ES: "listening_jp_es",
    CONJUGATION: "conjugation",
    KANA_ROMAJI: "kana_romaji",
    KANJI_READING: "kanji_reading"
  };

  function jpOf(item) {
    if (!item) return "";
    return item.jp || item.pattern || item.char || item.kanji || item.kana || item.form || item.word || item.reading || "";
  }
  function esOf(item) {
    if (!item) return "";
    return item.es || item.meaning || item.gloss || item.translation || "";
  }

  // Heurística simple para trocear japonés en 3-4 chunks para ordenar
  function splitIntoChunks(jp, n) {
    const clean = String(jp || "").replace(/[。！？\s]+$/g, "").trim();
    if (!clean) return [jp];
    const chars = Array.from(clean);
    if (chars.length <= 6) {
      // Cada 2 chars un chunk
      const chunks = [];
      for (let i = 0; i < chars.length; i += 2) chunks.push(chars.slice(i, i + 2).join(""));
      return chunks.length >= 2 ? chunks : [clean];
    }
    const chunkCount = Math.min(n || 3, Math.max(2, Math.ceil(chars.length / 3)));
    const size = Math.ceil(chars.length / chunkCount);
    const out = [];
    for (let i = 0; i < chars.length; i += size) out.push(chars.slice(i, i + size).join(""));
    return out;
  }

  function shuffle(list, rng) {
    const rand = typeof rng === "function" ? rng : Math.random;
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function interleave(lists) {
    const out = [];
    let more = true;
    const idx = lists.map(() => 0);
    while (more) {
      more = false;
      for (let i = 0; i < lists.length; i++) {
        if (idx[i] < lists[i].length) {
          out.push(lists[i][idx[i]++]);
          more = true;
        }
      }
    }
    return out;
  }

  function rateFor(type, level) {
    // WexDC: vocab 0.8, ejemplos 0.85, listening 0.9, avanzado N2+ 1.0
    if (type === TYPES.LISTENING_JP_ES) return (level === "n4" || level === "n3" || level === "n2" || level === "n1") ? 0.9 : 0.9; // N4+ could be 1.0 but we keep 0.9 for now
    if (type === TYPES.TRANSLATE_JP_ES || type === TYPES.COMPLETE_BLANK) return 0.85;
    if (type === TYPES.KANA_ROMAJI) return 0.8;
    return 0.85;
  }

  function blankFor(item) {
    if (!item) return "";
    if (item.cloze) return item.cloze;
    if (item.blank) return item.blank;
    const jp = jpOf(item);
    if (jp && item.particle) {
      const at = jp.indexOf(item.particle);
      if (at >= 0) return jp.slice(0, at) + "＿" + jp.slice(at + item.particle.length);
    }
    return jp || item.prompt || "";
  }

  function answerForBlank(item) {
    if (!item) return "";
    if (item.piece) return item.piece;
    if (item.particle) return item.particle;
    return "";
  }

  function makeTranslateJPES(item, catalog, rng) {
    const prompt = jpOf(item);
    const answer = esOf(item);
    const choices = buildChoicesForAnswer(item, catalog, (other) => esOf(other), answer, rng);
    return {
      exerciseType: TYPES.TRANSLATE_JP_ES,
      prompt: prompt,
      promptFurigana: item.kana || item.kana || "",
      answer: answer,
      choices: choices,
      speak: item.speak || item.kana || prompt,
      speakRate: rateFor(TYPES.TRANSLATE_JP_ES, item.level),
      sourceId: item.id,
      level: item.level,
      note: item.note || ""
    };
  }

  function makeTranslateESJP(item, catalog, rng) {
    const prompt = esOf(item);
    const answer = jpOf(item);
    const choices = buildChoicesForAnswer(item, catalog, (other) => jpOf(other), answer, rng);
    return {
      exerciseType: TYPES.TRANSLATE_ES_JP,
      prompt: prompt,
      promptFurigana: "",
      answer: answer,
      choices: choices,
      speak: item.speak || item.kana || answer,
      speakRate: 0.85,
      sourceId: item.id,
      level: item.level,
      note: item.note || ""
    };
  }

  function makeCompleteBlank(item, catalog, rng) {
    const blank = blankFor(item);
    if (!blank || blank.indexOf("＿") === -1) {
      // Fallback: crear hueco artificial quitando la partícula/palabra clave si no hay
      // Para vocab simple sin frase, usamos el propio término como hueco? Mejor no generar este tipo
      // Generamos un complete generico: "＿" + resto? Lo saltamos
      return null;
    }
    const answer = answerForBlank(item);
    if (!answer) return null;
    // Distractoras: otras piezas del mismo nivel/categoría
    const pool = catalog.filter(o => o.id !== item.id && answerForBlank(o));
    const distractors = shuffle(pool, rng).slice(0, 3).map(o => answerForBlank(o)).filter(Boolean);
    // Si no hay suficientes, usar partículas comunes
    const fallbackParticles = ["は","が","を","に","で","へ","と","も","から","まで"];
    while (distractors.length < 3) {
      const p = fallbackParticles[Math.floor((rng?rng():Math.random())*fallbackParticles.length)];
      if (p !== answer && distractors.indexOf(p)===-1) distractors.push(p);
    }
    const choices = shuffle([answer].concat(distractors.slice(0,3)), rng);
    return {
      exerciseType: TYPES.COMPLETE_BLANK,
      prompt: blank,
      promptFurigana: item.clozeKana || item.kana || "",
      answer: answer,
      choices: choices,
      speak: item.speak || item.kana || item.jp || blank.replace("＿", answer),
      speakRate: rateFor(TYPES.COMPLETE_BLANK, item.level),
      sourceId: item.id,
      level: item.level,
      note: item.note || item.es || ""
    };
  }

  function makeOrderSentence(item, catalog, rng) {
    const jp = jpOf(item);
    if (!jp || jp.length < 4) return null;
    const chunks = splitIntoChunks(jp, 3);
    if (chunks.length < 2) return null;
    const correct = chunks.join("");
    const punct = (String(jp).match(/[。！？]$/) || [""])[0];
    const correctWithPunct = correct + (correct.indexOf(punct)===-1 && punct ? punct : "");
    const candidates = new Set([correctWithPunct]);
    let tries = 0;
    while (candidates.size < 4 && tries < 20) {
      const perm = shuffle(chunks.slice(), rng).join("") + (punct || "");
      if (perm !== correctWithPunct) candidates.add(perm);
      tries++;
    }
    if (candidates.size < 2) return null;
    const choices = shuffle(Array.from(candidates), rng);
    return {
      exerciseType: TYPES.ORDER_SENTENCE,
      prompt: "Ordena: " + chunks.join(" / "),
      promptFurigana: item.kana || "",
      answer: correctWithPunct,
      choices: choices,
      scrambled: chunks,
      speak: item.speak || item.kana || jp,
      speakRate: 0.85,
      sourceId: item.id,
      level: item.level,
      note: esOf(item)
    };
  }

  function makeListening(item, catalog, rng) {
    const answer = esOf(item);
    if (!answer) return null;
    const prompt = "♪ Escucha";
    const choices = buildChoicesForAnswer(item, catalog, (other)=>esOf(other), answer, rng);
    return {
      exerciseType: TYPES.LISTENING_JP_ES,
      prompt: prompt,
      promptFurigana: "",
      answer: answer,
      choices: choices,
      speak: item.speak || item.kana || jpOf(item) || item.reading || "",
      speakRate: rateFor(TYPES.LISTENING_JP_ES, item.level),
      sourceId: item.id,
      level: item.level,
      note: "Solo audio — texto oculto hasta responder",
      reveal: jpOf(item)
    };
  }

  function buildChoicesForAnswer(target, catalog, getter, answer, rng) {
    const seen = new Set([answer]);
    const sameGroup = [];
    const otherGroup = [];
    for (let i=0;i<catalog.length;i++) {
      const cand = catalog[i];
      if (!cand || cand.id===target.id) continue;
      const val = getter(cand);
      if (!val || seen.has(val)) continue;
      seen.add(val);
      if (cand.group===target.group) sameGroup.push(val);
      else otherGroup.push(val);
    }
    const ranked = shuffle(sameGroup, rng).concat(shuffle(otherGroup, rng));
    const picked = ranked.slice(0, 3);
    return shuffle([answer].concat(picked), rng);
  }

  // Genera 20 ejercicios variados para una lección
  function buildVariedQueue(lesson, Core, Lex, rng) {
    if (!lesson || !lesson.quiz) return [];
    const level = lesson.level || "n5";
    const pack = Lex.forLevel ? Lex.forLevel(level) : Lex;
    const quiz = lesson.quiz;
    let practice = quiz.practice;
    let catalog = null;
    if (practice === "kana") {
      // Kana queda como antes pero con 20: duplicar con variaciones
      const chars = quiz.chars || [];
      if (!chars.length) return [];
      // For kana we do 3 types: kana->romaji, romaji->kana, listening
      const pool = [];
      const allKana = [];
      chars.forEach(ch => {
        const obj = Core.findKana(quiz.type, ch);
        if (obj) allKana.push(obj);
      });
      function kanaChoicesFor(target, mode) {
        // mode: 'romaji' -> choices are romaji strings, 'kana' -> choices are kana chars
        const vals = allKana.map(k => mode==='kana' ? k.char : k.romaji);
        const others = vals.filter(v => v !== target);
        const picked = shuffle(others, rng).slice(0,3);
        return shuffle([target].concat(picked), rng);
      }
      chars.forEach(ch => {
        const kanaObj = Core.findKana(quiz.type, ch);
        if (!kanaObj) return;
        pool.push({ exerciseType: TYPES.KANA_ROMAJI, prompt: kanaObj.char, answer: kanaObj.romaji, choices: kanaChoicesFor(kanaObj.romaji, 'romaji'), kanaObj: kanaObj, sourceId: quiz.type+":"+ch, speak: ch, speakRate: 0.8, level: level, direction: "kana-romaji" });
        pool.push({ exerciseType: TYPES.TRANSLATE_ES_JP, prompt: kanaObj.romaji, answer: kanaObj.char, choices: kanaChoicesFor(kanaObj.char, 'kana'), kanaObj: kanaObj, sourceId: quiz.type+":"+ch, speak: ch, speakRate: 0.8, level: level, direction: "romaji-kana" });
        pool.push({ exerciseType: TYPES.LISTENING_JP_ES, prompt: "♪", answer: kanaObj.romaji, choices: kanaChoicesFor(kanaObj.romaji, 'romaji'), kanaObj: kanaObj, sourceId: quiz.type+":"+ch, speak: ch, speakRate: 0.8, level: level });
      });
      let queue = interleave([pool.filter(p=>p.exerciseType===TYPES.KANA_ROMAJI), pool.filter(p=>p.exerciseType===TYPES.TRANSLATE_ES_JP), pool.filter(p=>p.exerciseType===TYPES.LISTENING_JP_ES)]);
      // Expand to 20 by cycling
      while (queue.length < 20) {
        const clone = Object.assign({}, pool[Math.floor((rng?rng():Math.random())*pool.length)]);
        // Regenerate choices for clone to keep variar
        if (clone.kanaObj) {
          if (clone.direction === 'romaji-kana') clone.choices = kanaChoicesFor(clone.answer, 'kana');
          else clone.choices = kanaChoicesFor(clone.answer, 'romaji');
        }
        queue.push(clone);
      }
      queue = queue.slice(0,20);
      return queue.map((item, idx) => {
        const base = {
          id: lesson.id + "-kana-" + idx,
          exerciseType: item.exerciseType,
          prompt: item.prompt,
          answer: item.answer,
          kanaObj: item.kanaObj,
          sourceId: item.sourceId,
          speak: item.speak,
          speakRate: item.speakRate,
          direction: item.direction,
          level: level,
          choices: item.choices,
          userAnswer: null,
          result: null
        };
        try { base._view = viewFor(base); } catch(e) { base._view = null; }
        return base;
      });
    }
    if (practice === "reading") {
      // Reading: 20 preguntas de lectura (si la lección tiene 8 textos, duplicamos)
      const ids = quiz.ids || [];
      if (!ids.length) return [];
      const pool = [];
      ids.forEach(id => {
        const q = pack ? null : null; // reading handled elsewhere; fallback
        // For now treat as translate
      });
      // No reading catalog here; defer to lessons.js original handling
      return null; // signal to fallback
    }

    // Determinar catálogo
    let source = null;
    if (practice === "kanji") source = pack.KANJI;
    else if (practice === "phrases") source = pack.PHRASES;
    else if (practice === "conj") source = pack.CONJ;
    else if (practice === "grammar") source = pack.GRAMMAR;
    else source = pack.WORDS;

    const ids = quiz.ids || [];
    if (!ids.length) return [];
    const items = [];
    for (let i=0;i<ids.length;i++) {
      const found = Lex.findById(source, ids[i]);
      if (!found) continue;
      items.push(found);
    }
    if (!items.length) return [];

    // Crear pools por tipo
    const poolTranslateJPEs = [];
    const poolTranslateESJP = [];
    const poolComplete = [];
    const poolOrder = [];
    const poolListening = [];

    items.forEach(item => {
      const t1 = makeTranslateJPES(item, source, rng);
      if (t1) poolTranslateJPEs.push(t1);
      const t2 = makeTranslateESJP(item, source, rng);
      if (t2) poolTranslateESJP.push(t2);
      const c = makeCompleteBlank(item, source, rng);
      if (c) poolComplete.push(c);
      const o = makeOrderSentence(item, source, rng);
      if (o) poolOrder.push(o);
      const l = makeListening(item, source, rng);
      if (l) poolListening.push(l);
    });

    // Si no hay completes/orders (ej: vocab sin partícula), rellenar con translates
    const pools = [poolTranslateJPEs, poolTranslateESJP, poolComplete, poolOrder, poolListening].filter(p=>p.length>0);
    if (!pools.length) return [];

    let queue = interleave(pools);
    // Si tenemos <20, ciclamos con nueva elección de distractores
    let attempts = 0;
    while (queue.length < 20 && attempts < 100) {
      const pool = pools[Math.floor((rng?rng():Math.random())*pools.length)];
      const base = pool[Math.floor((rng?rng():Math.random())*pool.length)];
      // Clonar con nuevas distractoras
      let clone = null;
      if (base.exerciseType===TYPES.TRANSLATE_JP_ES) clone = makeTranslateJPES( Lex.findById(source, base.sourceId), source, rng);
      else if (base.exerciseType===TYPES.TRANSLATE_ES_JP) clone = makeTranslateESJP( Lex.findById(source, base.sourceId), source, rng);
      else if (base.exerciseType===TYPES.COMPLETE_BLANK) clone = makeCompleteBlank( Lex.findById(source, base.sourceId), source, rng);
      else if (base.exerciseType===TYPES.ORDER_SENTENCE) clone = makeOrderSentence( Lex.findById(source, base.sourceId), source, rng);
      else if (base.exerciseType===TYPES.LISTENING_JP_ES) clone = makeListening( Lex.findById(source, base.sourceId), source, rng);
      if (clone) queue.push(clone);
      attempts++;
    }
    queue = queue.slice(0,20);
    // Asignar IDs, asegurar 20 y envolver para app.js
    return queue.map((ex, idx) => {
      const base = Object.assign({}, ex, { id: lesson.id + "-ex-" + idx, lessonId: lesson.id, userAnswer: null, result: null });
      // Attach lex reference if available for fallback/TTS detail
      const src = Lex.findById(source, ex.sourceId);
      if (src) base.lex = src;
      // Precompute view for app.js
      try { base._view = viewFor(base); } catch(e) { base._view = null; }
      return base;
    });
  }

  function viewFor(ex) {
    if (!ex) return null;
    // Unified view for app.js rendering
    if (ex.exerciseType === TYPES.KANA_ROMAJI) {
      return {
        prompt: ex.prompt,
        promptLang: ex.direction==="romaji-kana" ? "en" : "ja",
        furigana: "",
        answer: ex.answer,
        speak: ex.speak,
        speakRate: ex.speakRate,
        speakOnShow: false,
        note: ex.note || "",
        choiceText: ex.answer,
        choiceLang: ex.direction==="romaji-kana" ? "ja" : "en",
        reveal: ex.answer
      };
    }
    if (ex.exerciseType === TYPES.TRANSLATE_JP_ES) {
      return {
        prompt: ex.prompt,
        promptLang: "ja",
        furigana: ex.promptFurigana || "",
        answer: ex.answer,
        speak: ex.speak,
        speakRate: ex.speakRate,
        speakOnShow: true,
        note: ex.note || "",
        choiceText: ex.answer,
        choiceLang: "es",
        reveal: ex.answer
      };
    }
    if (ex.exerciseType === TYPES.TRANSLATE_ES_JP) {
      return {
        prompt: ex.prompt,
        promptLang: "es",
        furigana: "",
        answer: ex.answer,
        speak: ex.speak,
        speakRate: ex.speakRate,
        speakOnShow: false,
        note: ex.note || "",
        choiceText: ex.answer,
        choiceLang: "ja",
        reveal: ex.answer
      };
    }
    if (ex.exerciseType === TYPES.COMPLETE_BLANK) {
      return {
        prompt: ex.prompt, // contiene ＿
        promptLang: "ja",
        furigana: ex.promptFurigana || "",
        answer: ex.answer + " · " + (ex.note || ""),
        speak: ex.speak,
        speakRate: ex.speakRate,
        speakOnShow: false,
        note: ex.note || "Elige la pieza que falta",
        choiceText: ex.answer,
        choiceLang: "ja",
        reveal: ex.prompt.replace("＿", ex.answer)
      };
    }
    if (ex.exerciseType === TYPES.ORDER_SENTENCE) {
      return {
        prompt: ex.prompt, // "Ordena: A / B / C"
        promptLang: "ja",
        furigana: ex.promptFurigana || "",
        answer: ex.answer,
        speak: ex.speak,
        speakRate: ex.speakRate,
        speakOnShow: false,
        note: ex.note || "Elige el orden correcto",
        choiceText: ex.answer,
        choiceLang: "ja",
        reveal: ex.answer
      };
    }
    if (ex.exerciseType === TYPES.LISTENING_JP_ES) {
      return {
        prompt: "♪",
        promptLang: "ja",
        furigana: "",
        answer: ex.answer,
        speak: ex.speak,
        speakRate: ex.speakRate,
        speakOnShow: true,
        note: "Escucha — texto oculto hasta responder",
        choiceText: ex.answer,
        choiceLang: "es",
        reveal: ex.reveal || ex.answer
      };
    }
    return null;
  }

  const TARGET_COUNT = 20;
  const api = {
    TYPES,
    TARGET_COUNT,
    buildVariedQueue,
    viewFor,
    splitIntoChunks,
    interleave,
    shuffle,
    rateFor
  };

  root.NihongoDojoQuizEngine = api;
  root.QuizEngine = api; // alias legacy
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
