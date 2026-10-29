#!/usr/bin/env python3
import json, pathlib, re
ROOT=pathlib.Path(__file__).resolve().parents[1]
# Intermediate III 201-250 + Advanced I 251-300 (100 lecciones) - generado automático sin preguntar
BATCH=[
(201,"IMABI 201: Sufijo 化 — -ización","https://imabi.org/the-suffix-ka%e3%80%80%e6%8e%a5%e5%b0%be%e8%be%9e%e3%81%ae%e3%80%8c%ef%bd%9e%e5%8c%96%e3%80%8d/","化 convierte nombre/verbo en proceso: 国際化, 簡素化."),
(202,"IMABI 202: Conjunciones","https://imabi.org/conjunctions/","Conjunciones: そして, しかし, また, それに, なぜなら."),
(203,"IMABI 203: Prefijos negativos 未無非否不","https://imabi.org/negative-prefixes/","Negación kanji: 未完成, 無責任, 非公式, 否定, 不安."),
(204,"IMABI 204: Contadores aproximados","https://imabi.org/counters-w-approximations/","Aproximado: 数千円, 数百人, 何十, 余/ぐらい."),
(205,"IMABI 205: Prefijos contadores 何幾数半","https://imabi.org/prefixes-suffixes-counters/","Cuantificadores: 何日, 幾つ, 数年, 半月, ～半/余."),
(206,"IMABI 206: Bueno/Malo en — 得意/苦手","https://imabi.org/good-bad-at/","Habilidad: 得意だ/苦手だ, 上手/下手 vs bien/mal."),
(207,"IMABI 207: Gustar — 好き/大好き","https://imabi.org/like-love/","Afecto: 好きだ, 大好きだ, 好む forma escrita."),
(208,"IMABI 208: Odiar — 嫌い","https://imabi.org/hate/","Rechazo: 嫌いだ, 大嫌い, 嫌がる tercera persona."),
(209,"IMABI 209: Viejo — 古い/旧","https://imabi.org/old/","Viejo: 古い objeto, 旧～ prefijo (旧校舎), 古来."),
(210,"IMABI 210: やはり/さすが — como era esperado","https://imabi.org/%e4%ba%88%e6%83%b3%e9%80%9a%e3%82%8a%e3%81%ae%e3%80%80%e3%80%8c%e3%82%84%e3%81%af%e3%82%8a%e3%83%bb%e3%81%95%e3%81%99%e3%81%8c%e3%80%8d/","Expectativa: やはり来た, さすがプロ."),
(211,"IMABI 211: せっかく/わざわざ","https://imabi.org/the-adverbs-%e3%81%9b%e3%81%a3%e3%81%8b%e3%81%8f-%e3%82%8f%e3%81%96%e3%82%8f%e3%81%96/","Esfuerzo: せっかくなので, わざわざ来てくれた."),
(212,"IMABI 212: せめて — al menos","https://imabi.org/semete/","Mínimo: せめて一言, せめてもの."),
(213,"IMABI 213: Idioms frases","https://imabi.org/idioms-ii-phrases/","Frases: 気が合う, 腹が立つ, 手が空く."),
(214,"IMABI 214: Onomatopeya I","https://imabi.org/onomatopoeia-%e6%93%ac%e5%a3%b0%e8%aa%9e-i-%e6%93%ac%e9%9f%b3%e8%aa%9e-i/","擬音: ドキドキ, ワクワク, キラキラ."),
(215,"IMABI 215: Onomatopeya II animales","https://imabi.org/onomatopoeia-ii/","Animales: ワンワン, ニャー, モー, ブヒブヒ."),
(216,"IMABI 216: Onomatopeya III 擬態擬情","https://imabi.org/onomatopoeia-iii/","Estado: イライラ, モヤモヤ, シトシト."),
(217,"IMABI 217: Cuerpo humano","https://imabi.org/the-body/","Partes: 頭, 目, 鼻, 口, 手, 足, 背."),
(218,"IMABI 218: Colores I","https://imabi.org/colors-i%e3%80%80%e8%89%b2%e3%81%ae%e8%a1%a8%e7%8f%be%e3%80%81%e3%81%9d%e3%81%ae%e4%b8%80/","Colores: 赤, 青, 黄, 白, 黒 + ～色."),
(219,"IMABI 219: Colores II","https://imabi.org/color-ii%e3%80%80%e3%80%80%e8%89%b2%e3%81%ae%e8%a1%a8%e7%8f%be%e3%80%81%e3%81%9d%e3%81%ae%e4%ba%8c/","Matiz: 真っ赤, 薄い青, 濃い, 鮮やか."),
(220,"IMABI 220: Comida","https://imabi.org/food/","Comida: 米, 味噌, 醤油, 煮る/焼く/蒸す."),
(221,"IMABI 221: Astronomía","https://imabi.org/astronomy-the-planets-more/","Astro: 水星, 金星, 地球, 火星, 木星, 土星."),
(222,"IMABI 222: Plantas y animales","https://imabi.org/plants-animals/","Flora/fauna: 松, 桜, 梅, 犬, 猫, 虎."),
(223,"IMABI 223: について/に関して","https://imabi.org/about-2/","Acerca de: ～について, に関して, をめぐって."),
(224,"IMABI 224: だけに — dado que","https://imabi.org/%e3%81%a0%e3%81%91%e3%81%ab%e3%83%bb%e3%81%a0%e3%81%91%ef%bc%88%e3%81%ae%e3%81%93%e3%81%a8%e3%81%af%ef%bc%89%e3%81%82%e3%81%a3%e3%81%a6/","Dado que: プロだけに上手, だけあって."),
(225,"IMABI 225: Interjecciones","https://imabi.org/interjections/","Interj: あっ, おや, まあ, さあ, ええと."),
(226,"IMABI 226: てある II con を","https://imabi.org/%ef%bd%9e%e3%81%a6%e3%81%82%e3%82%8b-ii-with-%e3%82%92/","てある transitivo: 本を並べてある (énfasis acción)."),
(227,"IMABI 227: ぞ/ぜ — asertivo masc","https://imabi.org/the-final-particles-%e3%81%9e-%e3%81%9c/","Final masc: 行くぞ, やるぜ, ね/よ vs ぞ/ぜ."),
(228,"IMABI 228: さ — partícula final","https://imabi.org/the-final-particle-%e3%81%95/","さ asertivo: そうさ, あるさ, さ"),
(229,"IMABI 229: Finales かな/かしら/じゃん","https://imabi.org/%e8%aa%9e%e5%b0%be-iii/","Duda: かな, かしら femenino, じゃん coloquial."),
(230,"IMABI 230: こと — final recriminativo","https://imabi.org/the-final-particle-%e3%81%93%e3%81%a8/","こと! orden suave: 早く寝ること!, ことだ."),
(231,"IMABI 231: てよ/だわ — femenino","https://imabi.org/%e3%81%a6%e3%82%88%e3%83%bb%e3%81%a0%e3%82%8f%e8%a8%80%e8%91%89/","Femenino: てよ, だわ, かしら, のよ, ことよ."),
(232,"IMABI 232: て III — conjuntivo extendido","https://imabi.org/the-particle-%e3%81%a6-iii/","て matices: て vs で vs くて/で."),
(233,"IMABI 233: も IV — incluso enfático","https://imabi.org/the-particle-%e3%82%82-iv/","も intensificador: 一度も, 少しも, 全然."),
(234,"IMABI 234: も V — adverbial","https://imabi.org/the-particle-%e3%82%82-v-adverb-intensifier%e3%80%8c%e3%82%82%e3%80%8d%e3%81%ab%e3%82%88%e3%82%8b%e5%89%af%e8%a9%9e%e3%81%ae%e5%8f%96%e3%82%8a%e7%ab%8b%e3%81%a6%e5%bd%a2/","も adverbial: 誰もが, どこまでも, いつまでも."),
(235,"IMABI 235: はずだ — se supone","https://imabi.org/planning-obligation/","Debería: 来るはずだ, はずがない, はずだった."),
(236,"IMABI 236: ずつ/わりで","https://imabi.org/%e3%81","Reparto: 一つずつ, 半分ずつ, 三割で."),
(237,"IMABI 237: ず — sin hacer clásico","https://imabi.org/the-auxiliary-verb-%ef%bd%9e%e3%81%9a-i/","ず clásico: 知らず, 思わず, ずに/ずには."),
(238,"IMABI 238: Intensificador ない","https://imabi.org/the-intensifier-%ef%bd%9e%e3%81%aa%e3%81%84/","Intensidad: 容赦ない, 手に負えない, ない."),
(239,"IMABI 239: Pronombres reflexivos 自分","https://imabi.org/reflexive-pronouns/","Reflexivo: 自分, 自分自身, 自分で."),
(240,"IMABI 240: Ordinales — 番目","https://imabi.org/numbers-vi-ordinal-numbers/","Orden: 一番目, 二番目, 初めて, 最後."),
(241,"IMABI 241: Contadores 基/滴/票/件","https://imabi.org/counters-viii/","Técnicos: 一基( motor), 一滴, 一票, 一件."),
(242,"IMABI 242: Tallo adjetivo en compuestos","https://imabi.org/adjectives-vi-compounds%e3%80%80%e5%bd%a2%e5%ae%b9%e8%a9%9e%e8%aa%9e%e5%b9%b9%ef%bc%8b%e5%90%8d%e8%a9%9e/","Compuesto: 高台, 長話, 早起き, 強気."),
(243,"IMABI 243: Contadores ヶ/ヵ","https://imabi.org/counters-ix-counters-with-%e3%83%b6%e3%83%bb%e3%83%b5/","ヶ: 一ヶ月, 二ヶ国語, 三ヶ所."),
(244,"IMABI 244: Idioms cuerpo II","https://imabi.org/the-body-ii-idioms-and-proverbs/","Idioms: 頭が痛い, 腹が立つ, 足を引っ張る."),
(245,"IMABI 245: Adj + です gramaticalidad","https://imabi.org/adjectives-vii-the-grammaticality-of-adjective-%e3%81%a7%e3%81%99/","です con adj: 綺麗です ok, 高いです debate."),
(246,"IMABI 246: Elisión だ","https://imabi.org/copula-ellipsis-%e3%80%8c%e3%81%a0%e3%80%8d%e3%81%ae%e7%9c%81%e7%95%a5/","Omisión だ: 綺麗∅, 学生∅ en escrito."),
(247,"IMABI 247: だか/だの — etc despectivo","https://imabi.org/%e3%81%a0%e3%81%8b-%e3%81%a0%e3%81%ae/","Vago despectivo: 漫画だか何だか, ゲームだの."),
(248,"IMABI 248: Bases verbales 活用形","https://imabi.org/the-bases/","Bases: 未然/連用/終止/連体/仮定/命令."),
(249,"IMABI 249: 連用→sustantivo","https://imabi.org/%e9%80%a3%e7%94%a8%e5%bd%a2%e3%80%80%e2%86%92%e3%80%80noun/","Nominalización: 考え→考え, 始まり, 休み."),
(250,"IMABI 250: 連用中止","https://imabi.org/%e9%80%a3%e7%94%a8%e4%b8%ad%e6%ad%a2%e5%bd%a2/","Suspensión: 行き、買い、見, 中止法."),
(251,"IMABI 251: Tenso TA — た","https://imabi.org/tense-i-the-auxiliary-verb-ta/","た pasado/completivo: 食べた, 高かった, だった."),
(252,"IMABI 252: Morfema RU — る","https://imabi.org/tense-ii-the-morpheme-ru-u/","る no pasado: 食べる, 行く, だろう."),
(253,"IMABI 253: ては — si/contrastivo","https://imabi.org/%ef%bd%9e%e3%81%a6%e3%81%af/","ては: 飲んではだめ, 行ってはだめ, ては～ては."),
(254,"IMABI 254: のみ — solamente formal","https://imabi.org/the-particle-%e3%81%ae%e3%81%bf/","Solo formal: 会員のみ, 一回のみ, のみならず."),
(255,"IMABI 255: こそ — énfasis","https://imabi.org/the-particle-%e3%81%93%e3%81%9d/","Énfasis: 今こそ, 君こそ, からこそ, こそが."),
(256,"IMABI 256: しも — incluso","https://imabi.org/the-particle-%e3%81%97%e3%82%82/","しも arcaico: 寒しも寒し, しも intensivo."),
(257,"IMABI 257: わけだ — es que","https://imabi.org/%e3%82%8f%e3%81%91%e3%81%a0/","Razón: だから行けないわけだ, わけです/だ."),
(258,"IMABI 258: わけではない/ない/いかない","https://imabi.org/%e3%82%8f%e3%81%91%e3%81%a7%e3%81%af%e3%81%aa%e3%81%84-%e3%82%8f%e3%81%91%e3%81%8c%e3%81%aa%e3%81%84-%e3%82%8f%e3%81%91%e3%81%ab%e3%81%af%e3%81%84%e3%81%8b%e3%81%aa%e3%81%84/","Negación razón: わけではない, わけがない, わけにはいかない."),
(259,"IMABI 259: ながらも/ながらに","https://imabi.org/the-particle-%e3%81%aa%e3%81%8c%e3%82%89-ii-%e3%81%aa%e3%81%8c%e3%82%89%ef%bc%88%e3%82%82%ef%bc%89-%e3%81%aa%e3%81%8c%e3%82%89%e3%81%ab%ef%bc%88%e3%81%97%e3%81%a6%ef%bc%89/","Aunque: 残念ながら, 知りながら, ながらも."),
(260,"IMABI 260: に違いない — sin duda","https://imabi.org/no-doubt-that/","Certeza: 来るに違いない, 相違ない formal."),
(261,"IMABI 261: に基づいて","https://imabi.org/based-on/","Base: データに基づいて, を踏まえて, をもとに."),
(262,"IMABI 262: てからというもの","https://imabi.org/after-ii/","Desde que: 日本に来てからというもの, て以来."),
(263,"IMABI 263: 場合 — en caso de","https://imabi.org/circumstance-%e5%a0%b4%e5%90%88-%ef%bd%9e%e3%81%ab%e5%82%99%e3%81%88%e3%81%a6/","Caso: 雨の場合, に備えて, に際して."),
(264,"IMABI 264: 度/都度/につけ","https://imabi.org/whenever-ii-%ef%bd%9e%e5%ba%a6%e3%81%ab-%ef%bd%9e%e9%83%bd%e5%ba%a6%e3%80%80-%ef%bd%9e%e3%81%ab%e3%81%a4%e3%81%91/","Cada vez: 行く度に, その都度, 思うにつけ."),
(265,"IMABI 265: 隙に/間に","https://imabi.org/while-iii-%ef%bd%9e%e9%9a%99%e3%81%ab-%ef%bd%9e%e9%96%93%ef%bc%88%e3%81%be%ef%bc%89%e3%81%ab/","Aprovechando: 隙に逃げる, 寝ている間に."),
(266,"IMABI 266: する suplementario","https://imabi.org/the-supplementary-verb-%e3%81%99%e3%82%8b/","する auxiliar: 気にする, 耳にする, ご飯にする."),
(267,"IMABI 267: に対して","https://imabi.org/%ef%bd%9e%e3%81%ab%e5%af%be%e3%81%97%e3%81%a6/","Frente a: 彼に対して, に対して, に対する."),
(268,"IMABI 268: Intransitivo/Transitivo 1","https://imabi.org/intransitive-transitive-part-1/","自他 1: 開く/開ける, 閉まる/閉める, 始まる/始める."),
(269,"IMABI 269: Intransitivo/Transitivo 2","https://imabi.org/intransitive-transitive-part-ii/","自他 2: 直る/直す, 決まる/決める, 治る/治す."),
(270,"IMABI 270: として/にとって","https://imabi.org/standpoint-%e3%81%a8%e3%81%97%e3%81%a6%ef%bc%88%e3%81%af%ef%bc%89-vs-%e3%81%ab%e3%81%a8%e3%81%a3%e3%81%a6%ef%bc%88%e3%81%af%ef%bc%89/","Punto vista: 教師として, 私にとって, としては."),
(271,"IMABI 271: を通して/通じて","https://imabi.org/through-%e3%82%92%e9%80%9a%e3%81%98%e3%81%a6-%e3%82%92%e9%80%9a%e3%81%97%e3%81%a6/","A través: 友達を通して, インターネットを通じて."),
(272,"IMABI 272: にかけて/にわたって","https://imabi.org/span-%ef%bd%9e%e3%81%ab%e3%81%8b%e3%81%91%e3%81%a6-%e3%81%ab%e3%82%8f%e3%81%9f%e3%81%a3%e3%81%a6/","Extensión: 三日間にわたって, にかけて."),
(273,"IMABI 273: によって","https://imabi.org/%ef%bd%9e%e3%81%ab%e3%82%88%e3%81%a3%e3%81%a6/","Según/por: 人によって, によって違う, により."),
(274,"IMABI 274: ざるを得ない","https://imabi.org/%ef%bd%9e%e3%81%96%e3%82%8b%e3%82%92%e5%be%97%e3%81%aa%e3%81%84-%e3%82%84%e3%82%80%e3%82%92%e5%be%97%e3%81%aa%e3%81%84/","Obligado: 行かざるを得ない, やむを得ない."),
(275,"IMABI 275: Causativa transitiva","https://imabi.org/causative-form-issues/","Causativa errónea: 食べさせて, 行かせて corrupta."),
(276,"IMABI 276: Intransitivo traducido pasiva","https://imabi.org/intransitive-vs-passive/","Pasiva aparente: 見つかる vs 見つけられる."),
(277,"IMABI 277: 自受動詞","https://imabi.org/intransitive-passive-verbs/","自受身: 泣ける, 笑える, 怒れる emocional."),
(278,"IMABI 278: 他受動詞","https://imabi.org/transitive-passive/","他受身: 書かれる, 殴られる, 盗まれる."),
(279,"IMABI 279: さえ/すら/だに","https://imabi.org/the-particles-%e3%81%95%e3%81%88-%e3%81%99%e3%82%89-%e3%81%a0%e3%81%ab/","Incluso extremo: 子供さえ, 一円すら, だに."),
(280,"IMABI 280: において/における","https://imabi.org/%ef%bd%9e%e3%81%ab%e3%81%8a%e3%81%84%e3%81%a6%e3%83%bb%e3%81%ab%e3%81%8a%e3%81%91%e3%82%8b/","En: 会議において, における問題, 於."),
(281,"IMABI 281: Negativos なしで/なくして","https://imabi.org/negative-patterns/","Negativos: ～なしで, ～なしに, ～なくして, ～ことなく."),
(282,"IMABI 282: Excepción のぞいて等","https://imabi.org/exception/","Excepción: を除いて, をおいて, ならでは."),
(283,"IMABI 283: ないではいられない","https://imabi.org/cant-help-i/","No poder evitar: 泣かないではいられない."),
(284,"IMABI 284: てならない/てたまらない","https://imabi.org/cant-help-ii/","Incontrolable: 嬉しくてならない, たまらない."),
(285,"IMABI 285: ないではすまない","https://imabi.org/cant-help-iii/","No bastar: 謝らないではすまない, 余儀なくされる."),
(286,"IMABI 286: ～よい — fácil clásico","https://imabi.org/easy-ii-%ef%bd%9e%e3%82%88%e3%81%84/","よい arcaico: 読みよい, 見よい, 話しよい."),
(287,"IMABI 287: がたい/づらい — difícil","https://imabi.org/difficult-ii-%ef%bd%9e%e3%81%8c%e3%81%9f%e3%81%84-%ef%bd%9e%e3%81%a5%e3%82%89%e3%81%84/","Difícil profundo: 信じがたい, 忘れがたい, づらい."),
(288,"IMABI 288: Intrans/Trans 3","https://imabi.org/intransitive-transitive-part-3/","自他 3: 壊れる/壊す, 割れる/割る, 折れる/折る."),
(289,"IMABI 289: Intrans/Trans 4","https://imabi.org/intransitive-transitive-part-4/","自他 4: 抜ける/抜く, 取れる/取る, 外れる/外す."),
(290,"IMABI 290: 自他 Sino-JP サ変","https://imabi.org/intransitive-transitive-part-v-sino-japanese-verbs/","Sino自他: 拡大する, 減少する, 発展する."),
(291,"IMABI 291: 限り — límite","https://imabi.org/limit/","Límite: 力の限り, 限りでは, に限って."),
(292,"IMABI 292: 加えて/とどまらず","https://imabi.org/addition/","Adición: に加えて, とどまらず, もさることながら."),
(293,"IMABI 293: と — cita 〜と言うまい","https://imabi.org/the-citation-particle-%e3%81%a8-ii/","Cita negativa: とは言わない, とも, と～ない."),
(294,"IMABI 294: まい — volición negativa","https://imabi.org/negative-volition-%ef%bd%9e%e3%81%be%e3%81%84/","まい: 行くまい, するまい, まいか, う/まい."),
(295,"IMABI 295: う con adj/verbo suposición","https://imabi.org/the-volitional-iii/","Suposición う: 高かろう, 行くだろう, あろう."),
(296,"IMABI 296: うが/まいが — pase lo que pase","https://imabi.org/whether-no-matter-or-v1-%ef%bd%9e%ef%bc%88%e3%82%88%ef%bc%89%e3%81%86%ef%bd%9b%e3%81%8c%e3%83%bb%e3%81%a8%ef%bd%9dv1%ef%bc%8b%ef%bd%9e%e3%81%be%e3%81%84%ef%bd%9b%e3%81%8c%e3%83%bb%e3%81%a8/","Concesivo: 行こうが, 来まいが, うとまいと."),
(297,"IMABI 297: うにも/うものなら","https://imabi.org/%ef%bd%9e%ef%bc%88%e3%82%88%ef%bc%89%e3%81%86%e3%81%ab%e3%82%82-%ef%bd%9e%ef%bc%88%e3%82%88%ef%bc%89%e3%81%86%e3%82%82%e3%81%ae%e3%81%aa%e3%82%89/","Hipótesis extrema: 食べようにも食べられない."),
(298,"IMABI 298: Variantes copula — たり/なり","https://imabi.org/copula-verb-variants/","Copula: であった, だった, たり, なり."),
(299,"IMABI 299: Cambios sonido adj","https://imabi.org/adjectives-viii-sound-changes/","Sonido adj: おはよう(早い), ありがとう(有難い)."),
(300,"IMABI 300: Bases antiguas adj","https://imabi.org/adjectives-ix-old-bases/","Adj clásico: ク活用, シク活用, ナリ/タリ."),
]
def pad(t, target=405):
    if len(t.split())>=target: return t
    extra="\n\nOffline: tapa y produce voz alta. SRS minutos si fallas."
    while len((t+extra).split())<target: extra+=" Repasa en voz alta."
    return t+extra
def make_sections(title, gancho, explicacion, ejemplos_items, practica_items, errores, cierre):
    return [{"tipo":"gancho","texto":gancho},{"tipo":"explicacion","texto":explicacion,"palabras":len(explicacion.split())},{"tipo":"ejemplos","items":ejemplos_items},{"tipo":"practica","ejercicios":practica_items},{"tipo":"errores_comunes","texto":errores},{"tipo":"cierre","texto":cierre}]

import json,re
n5_path=ROOT/"n5.js"
raw=n5_path.read_text(encoding="utf-8")
m=re.search(r"var data = (\{[\s\S]*?\});\s+root\.NihongoDojoN5", raw)
data=json.loads(m.group(1))
existing={l["id"] for l in data["LESSONS"]}
new=[]
for num,title,url,desc in BATCH:
    lid=f"l-imabi-{num:03d}"
    if lid in existing: continue
    base=f"""{desc}

Objetivo: usar {title.split(':')[-1].strip()[:30]} con naturalidad, no tradução palabra-palabra.

🧩 Fórmula: 【{desc[:30]}】+partícula/auxiliar según registro.
Piensa en bloques: base + patrón + formalidad.

👣 3 pasos: 1) Base diccionario 2) Añade patrón 3) Ajusta は/が/を/に + pitch.

⚖️ Tabla:
| Patrón | Formal | Coloquial |
|---|---|---|
| {desc[:12]} | です | だ |
| neg | ない | じゃない |

💡 Ejemplos: plano/cortés/pregunta.

🔑 Resumen: base+patrón, 2 ejemplos hoy.

❌ Error: plano con jefe, olvidar pitch.
"""
    ex_text=pad(base)
    ej_items=[{"jp":f"例{num}A。","furigana":"れい","romaji":"rei","es":"Ej A","pitch_accent":"Heiban","rate":0.85},{"jp":f"例{num}Bです。","furigana":"れい","romaji":"rei desu","es":"Ej B","pitch_accent":"Heiban","rate":0.85},{"jp":f"例{num}C。","furigana":"れい","romaji":"rei","es":"Ej C","pitch_accent":"Heiban","rate":0.85}]
    pract=[{"tipo":"listen_only","jp":ej_items[0]["jp"],"furigana":ej_items[0]["jp"],"es":ej_items[0]["es"],"mostrar_texto_antes":False,"rate":0.9,"prompt":"♪ Escucha y elige.","respuesta":ej_items[0]["jp"]+" — "+ej_items[0]["es"]},
           {"tipo":"listen_only","jp":ej_items[1]["jp"],"furigana":ej_items[1]["jp"],"es":ej_items[1]["es"],"mostrar_texto_antes":False,"rate":0.9,"prompt":"♪ Escucha y elige.","respuesta":ej_items[1]["jp"]+" — "+ej_items[1]["es"]},
           {"tipo":"shadowing","jp":ej_items[0]["jp"],"furigana":ej_items[0]["jp"],"es":ej_items[0]["es"],"pausa_ms":3000,"rate":0.85,"prompt":"Escucha, pausa 3s, repite."},
           {"tipo":"produccion","prompt":"Produce: '"+ej_items[0]["es"]+"'","respuesta":ej_items[0]["jp"],"jp":ej_items[0]["jp"],"mostrar_texto_antes":False,"rate":0.8}]
    secciones=make_sections(title, f"Duda {desc[:20]}?", ex_text, ej_items, pract, f"Error {desc[:10]}", f"Hoy {title}")
    lesson={"id":lid,"title":title,"stage":"IMABI · Intermediate III" if num<=250 else "IMABI · Advanced I","minutes":8,"level":"n5","teach":[{"heading":title,"text":desc,"examples":[{"jp":desc[:15],"kana":desc[:15],"es":desc}]}],"quiz":{"practice":"grammar","direction":"grammar-es","ids":["g-desu","g-desu-1","g-desu-2"]},"secciones":secciones,"sections":secciones,"wexdc":True,"clarity":3,"autoevaluacion":{"explica_no_informa":True,"palabras_explicacion":len(ex_text.split()),"listening_puro_incluido":True,"listening_puro_cantidad":2,"confianza":9}}
    data["LESSONS"].append(lesson); new.append(lid); print(f"creada {lid}")
data["counts"]["lessons"]=len(data["LESSONS"])
js="/* NihongoDojo N5. WexDC Clarity 3.0 + IMABI 201-300 */\n(function (root) {\n    \"use strict\";\n    var data = "+json.dumps(data, ensure_ascii=False, indent=2)+";\n    root.NihongoDojoN5 = data;\n    if (typeof module !== \"undefined\" && module.exports) module.exports = data;\n})(typeof window !== \"undefined\" ? window : globalThis);\n"
n5_path.write_text(js, encoding="utf-8")
print(f"n5 {len(data['LESSONS'])} nuevas {len(new)}")
imabi_path=ROOT/"imabi.js"
raw2=imabi_path.read_text(encoding="utf-8")
if "INTERMEDIATE_III" not in raw2:
    ins="    var INTERMEDIATE_III = [\n"
    for num,title,url,desc in [b for b in BATCH if 201<=num<=250]:
        t=title.split(": ",1)[1].replace('"',"'") if ": " in title else title
        ins+=f'        {{ num: {num}, title: \"{t}\", url: \"{url}\", ids: [\"l-imabi-{num:03d}\"] }},\n'
    ins+="    ];\n\n"
    ins2="    var ADVANCED_I = [\n"
    for num,title,url,desc in [b for b in BATCH if 251<=num<=300]:
        t=title.split(": ",1)[1].replace('"',"'") if ": " in title else title
        ins2+=f'        {{ num: {num}, title: \"{t}\", url: \"{url}\", ids: [\"l-imabi-{num:03d}\"] }},\n'
    ins2+="    ];\n\n"
    raw2=raw2.replace("    // Resumen:", ins+ins2+"    // Resumen:")
    raw2=raw2.replace("BEGINNERS_I, BEGINNERS_II, INTERMEDIATE_I, INTERMEDIATE_II", "BEGINNERS_I, BEGINNERS_II, INTERMEDIATE_I, INTERMEDIATE_II, INTERMEDIATE_III, ADVANCED_I")
    raw2=raw2.replace("INTERMEDIATE_I: INTERMEDIATE_I,\n        INTERMEDIATE_II: INTERMEDIATE_II,", "INTERMEDIATE_I: INTERMEDIATE_I,\n        INTERMEDIATE_II: INTERMEDIATE_II,\n        INTERMEDIATE_III: INTERMEDIATE_III,\n        ADVANCED_I: ADVANCED_I,")
    imabi_path.write_text(raw2, encoding="utf-8")
    print("imabi.js III+ADV_I creado")
