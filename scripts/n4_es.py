# Glosas originales en español para el N4 comunitario.
# La clave es (palabra, lectura) de la lista. No se copian las glosas inglesas.

def rows():
    out = {}
    for line in TEXT.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) == 4:
            parts.append("")
        word, reading, group, es, note = parts
        out[(word, reading)] = (es, group, note)
    return out


TEXT = r"""
あ	あ	otros	ah	Interjección. No es la vocal del silabario.
ああ	ああ	otros	así, de esa manera	Señala algo lejano del hablante y del oyente.
あいさつする	あいさつする	verbos	saludar	
間	あいだ	tiempo	intervalo, mientras	
合う	あう	verbos	coincidir	No es 会う, verse con alguien.
あかちゃん	あかちゃん	gente	bebé	
上がる	あがる	verbos	subir	Intransitivo. Subir algo es 上げる.
赤ん坊	あかんぼう	gente	bebé, coloquial	
空く	あく	verbos	quedar vacío	No es 開く, abrirse.
アクセサリー	アクセサリー	ropa	accesorio	
浅い	あさい	adjetivos	poco profundo	
味	あじ	comida	sabor	
アジア	アジア	lugares	Asia	
明日	あす	tiempo	mañana, formal	Más formal que あした. Tampoco lleva に.
遊び	あそび	otros	el juego	
集まる	あつまる	verbos	reunirse	
集める	あつめる	verbos	reunir	
アナウンサー	アナウンサー	trabajo	locutor	
アフリカ	アフリカ	lugares	África	
アメリカ	アメリカ	lugares	América, Estados Unidos	En la calle suele ser Estados Unidos.
謝る	あやまる	verbos	disculparse	
アルコール	アルコール	comida	alcohol	
アルバイト	アルバイト	trabajo	trabajo a tiempo parcial	También se dice アルバイトする.
安心	あんしん	adjetivos	alivio, tranquilo	
安全	あんぜん	adjetivos	seguridad, seguro	
あんな	あんな	preguntas	ese tipo de, lejos	Va delante del nombre.
案内	あんない	verbos	guiar, informar	
以下	いか	otros	por debajo de	
以外	いがい	otros	excepto	
医学	いがく	escuela	medicina, la ciencia	
生きる	いきる	verbos	vivir, estar vivo	
意見	いけん	sociedad	opinión	
石	いし	naturaleza	piedra	
いじめる	いじめる	verbos	maltratar, burlarse	
以上	いじょう	otros	por encima de	
急ぐ	いそぐ	verbos	darse prisa	
致す	いたす	verbos	hacer, humilde	El humilde de する.
いただく	いただく	verbos	recibir, humilde	También comer, con humildad.
一度	いちど	tiempo	una vez	
一生懸命	いっしょうけんめい	otros	con todas las fuerzas	
いっぱい	いっぱい	otros	lleno	
糸	いと	otros	hilo	
以内	いない	otros	dentro de un límite	
田舎	いなか	lugares	el campo, zona rural	
祈る	いのる	verbos	rezar	
いらっしゃる	いらっしゃる	verbos	estar, ir o venir, de respeto	ます es いらっしゃいます, no いらっしゃります.
植える	うえる	verbos	plantar	
うかがう	うかがう	verbos	visitar o preguntar, humilde	
受付	うけつけ	lugares	recepción	
受ける	うける	verbos	recibir, hacer un examen	
動く	うごく	verbos	moverse	
うそ	うそ	otros	mentira	
うち	うち	casa	casa de uno, o dentro de	
打つ	うつ	verbos	golpear	
美しい	うつくしい	adjetivos	hermoso	
写す	うつす	verbos	copiar, fotografiar	
移る	うつる	verbos	mudarse, pasar a	
腕	うで	cuerpo	brazo	
うまい	うまい	adjetivos	rico, o hábil	De la comida, o de una destreza.
裏	うら	lugares	el reverso	
売り場	うりば	lugares	sección de venta	
うれしい	うれしい	adjetivos	contento	
うん	うん	otros	sí, informal	
運転	うんてん	verbos	conducir	
運転手	うんてんしゅ	trabajo	conductor	
運動	うんどう	verbos	hacer ejercicio	
エスカレーター	エスカレーター	lugares	escalera mecánica	
枝	えだ	naturaleza	rama	
選ぶ	えらぶ	verbos	elegir	
遠慮	えんりょ	verbos	reservarse, declinar	ご遠慮ください es un aviso de no hacer algo.
おいでになる	おいでになる	verbos	estar o ir, de respeto	Otra forma de いらっしゃる.
お祝い	おいわい	sociedad	felicitación	
オートバイ	オートバイ	transporte	motocicleta	
おかげ	おかげ	otros	gracias a	
おかしい	おかしい	adjetivos	raro, o gracioso	
お金持ち	おかねもち	gente	persona rica	
億	おく	numeros	cien millones	
屋上	おくじょう	lugares	azotea	
贈り物	おくりもの	otros	regalo	
送る	おくる	verbos	enviar	
遅れる	おくれる	verbos	llegar tarde	
起す	おこす	verbos	despertar a alguien	Se escribe también 起こす.
行う	おこなう	verbos	llevar a cabo	La forma て es 行って, leída おこなって. No es 行く.
怒る	おこる	verbos	enfadarse	
押し入れ	おしいれ	casa	armario empotrado	
お嬢さん	おじょうさん	gente	su hija, cortés	
お宅	おたく	casa	su casa, cortés	
落ちる	おちる	verbos	caerse	
おっしゃる	おっしゃる	verbos	decir, de respeto	ます es おっしゃいます.
夫	おっと	gente	esposo	
おつり	おつり	otros	el cambio, dinero	
音	おと	otros	sonido	
落す	おとす	verbos	dejar caer	Se escribe también 落とす.
踊り	おどり	otros	baile	
踊る	おどる	verbos	bailar	
驚く	おどろく	verbos	sorprenderse	
お祭り	おまつり	sociedad	festival	
お見舞い	おみまい	sociedad	visita a un enfermo	
お土産	おみやげ	otros	recuerdo de viaje	
思い出す	おもいだす	verbos	recordar	
思う	おもう	verbos	pensar, opinar	
おもちゃ	おもちゃ	otros	juguete	
表	おもて	lugares	el anverso	
親	おや	gente	padres	
泳ぎ方	およぎかた	otros	manera de nadar	
下りる	おりる	verbos	bajar de un vehículo	No es 降りる si el tren es el sujeto: aquí baja la persona.
折る	おる	verbos	doblar, partir	
お礼	おれい	sociedad	agradecimiento	
折れる	おれる	verbos	doblarse, partirse	
終わり	おわり	tiempo	el final	
カーテン	カーテン	casa	cortina	
海岸	かいがん	lugares	costa	
会議	かいぎ	trabajo	reunión	
会議室	かいぎしつ	lugares	sala de reuniones	
会場	かいじょう	lugares	sede del acto	
会話	かいわ	escuela	conversación	
帰り	かえり	tiempo	la vuelta	
変える	かえる	verbos	cambiar algo	
科学	かがく	escuela	ciencia	
鏡	かがみ	casa	espejo	
飾る	かざる	verbos	decorar	
火事	かじ	sociedad	incendio	
ガス	ガス	casa	gas	No es gasolina. Eso es ガソリン.
ガソリン	ガソリン	transporte	gasolina	
ガソリンスタンド	ガソリンスタンド	lugares	gasolinera	
堅い	かたい	adjetivos	duro, firme	
形	かたち	otros	forma	
片付ける	かたづける	verbos	ordenar	
課長	かちょう	trabajo	jefe de sección	
勝つ	かつ	verbos	ganar	
かっこう	かっこう	otros	aspecto, pinta	
家内	かない	gente	mi esposa, formal	Habla de la propia. La de otro es 奥さん.
悲しい	かなしい	adjetivos	triste	
必ず	かならず	otros	sin falta	
彼女	かのじょ	gente	ella, o novia	
壁	かべ	casa	pared	
かまう	かまう	verbos	importar	かまわない es no importa.
髪	かみ	cuerpo	pelo, cabello	
噛む	かむ	verbos	morder	
通う	かよう	verbos	ir habitualmente	
ガラス	ガラス	casa	cristal	
彼	かれ	gente	él	
彼ら	かれら	gente	ellos	
乾く	かわく	verbos	secarse	
代わり	かわり	otros	en lugar de	
変わる	かわる	verbos	cambiar	
考える	かんがえる	verbos	pensar, considerar	
関係	かんけい	sociedad	relación	
看護婦	かんごふ	trabajo	enfermera	Hoy se dice 看護師. La lista antigua usa esta forma.
簡単	かんたん	adjetivos	sencillo	
気	き	otros	ánimo	
機会	きかい	tiempo	ocasión	
危険	きけん	adjetivos	peligro, peligroso	
聞こえる	きこえる	verbos	oírse	Ya expresa que el sonido llega. No hace falta otra potencial.
汽車	きしゃ	transporte	tren de vapor	
技術	ぎじゅつ	escuela	técnica	
季節	きせつ	tiempo	estación del año	
規則	きそく	escuela	regla	
きっと	きっと	otros	seguro que	
絹	きぬ	ropa	seda	
厳しい	きびしい	adjetivos	estricto	
気分	きぶん	cuerpo	humor, cómo se siente uno	
決まる	きまる	verbos	quedar decidido	
君	きみ	gente	tú, informal	
決める	きめる	verbos	decidir	
気持ち	きもち	otros	sentimiento	
着物	きもの	ropa	kimono	
客	きゃく	gente	cliente, invitado	
急	きゅう	adjetivos	urgente	
急行	きゅうこう	transporte	tren rápido	
教育	きょういく	escuela	educación	
教会	きょうかい	lugares	iglesia	
競争	きょうそう	sociedad	competición	
興味	きょうみ	otros	interés	
近所	きんじょ	lugares	vecindario	
具合	ぐあい	cuerpo	estado, cómo va	
空気	くうき	naturaleza	aire	
空港	くうこう	lugares	aeropuerto	
草	くさ	naturaleza	hierba	
くださる	くださる	verbos	dar, de respeto	ます es くださいます. Alguien respetado da al hablante.
首	くび	cuerpo	cuello	
雲	くも	naturaleza	nube	
比べる	くらべる	verbos	comparar	
くれる	くれる	verbos	darme	Alguien da al hablante o a su grupo. No es 暮れる.
暮れる	くれる	verbos	anochecer	Misma lectura que くれる, dar, y otro significado.
毛	け	cuerpo	pelo, vello	
計画	けいかく	verbos	planear	
経験	けいけん	verbos	experimentar	
経済	けいざい	sociedad	economía	
警察	けいさつ	sociedad	policía	
ケーキ	ケーキ	comida	pastel	
けがする	けがする	verbos	herirse	
景色	けしき	naturaleza	paisaje	
消しゴム	けしゴム	escuela	goma de borrar	
下宿	げしゅく	casa	pensión	
決して	けっして	otros	nunca, con negativo	
けれど	けれど	otros	pero	
原因	げんいん	otros	causa	
けんかする	けんかする	verbos	pelearse	
研究	けんきゅう	escuela	investigación	
研究室	けんきゅうしつ	lugares	laboratorio	
見物	けんぶつ	verbos	ir a ver, turismo	
子	こ	gente	niño	
こう	こう	otros	así, de esta manera	
郊外	こうがい	lugares	afueras	
講義	こうぎ	escuela	clase universitaria	
工業	こうぎょう	trabajo	industria manufacturera	
高校	こうこう	escuela	instituto	
高校生	こうこうせい	gente	estudiante de instituto	
工場	こうじょう	lugares	fábrica	
校長	こうちょう	trabajo	director del colegio	
交通	こうつう	transporte	tráfico	
講堂	こうどう	lugares	auditorio	
高等学校	こうとうがっこう	escuela	instituto, nombre oficial	
公務員	こうむいん	trabajo	funcionario	
国際	こくさい	sociedad	internacional	
心	こころ	cuerpo	corazón, la mente	
御主人	ごしゅじん	gente	su esposo, cortés	
故障	こしょう	verbos	averiarse	
ご存じ	ごぞんじ	otros	saber, cortés	ご存じですか pregunta si la otra persona sabe.
答	こたえ	escuela	respuesta	
ごちそう	ごちそう	comida	banquete, invitar a comer	
こと	こと	otros	hecho, cosa abstracta	No es un objeto que se toca. Eso es もの.
小鳥	ことり	naturaleza	pajarito	
このあいだ	このあいだ	tiempo	el otro día	
このごろ	このごろ	tiempo	estos días	
細かい	こまかい	adjetivos	menudo, detallado	
ごみ	ごみ	casa	basura	
込む	こむ	verbos	estar lleno de gente	
米	こめ	comida	arroz crudo	El arroz cocido es ごはん.
ごらんになる	ごらんになる	verbos	ver, de respeto	
これから	これから	tiempo	a partir de ahora	
怖い	こわい	adjetivos	da miedo	
壊す	こわす	verbos	romper	
壊れる	こわれる	verbos	romperse	
コンサート	コンサート	sociedad	concierto	
今度	こんど	tiempo	esta vez, o la próxima	
コンピュータ	コンピュータ	otros	ordenador	
今夜	こんや	tiempo	esta noche	
最近	さいきん	tiempo	últimamente	
最後	さいご	tiempo	el último	
最初	さいしょ	tiempo	el principio	
坂	さか	lugares	cuesta	
探す	さがす	verbos	buscar	
下がる	さがる	verbos	bajar	Intransitivo.
盛ん	さかん	adjetivos	activo, en auge	
下げる	さげる	verbos	bajar algo	
差し上げる	さしあげる	verbos	dar, cortés	El hablante da a alguien respetado.
さっき	さっき	tiempo	hace un momento	
寂しい	さびしい	adjetivos	solo, con nostalgia	
再来月	さらいげつ	tiempo	dentro de dos meses	
再来週	さらいしゅう	tiempo	dentro de dos semanas	
サラダ	サラダ	comida	ensalada	
騒ぐ	さわぐ	verbos	armar ruido	
触る	さわる	verbos	tocar	Lleva に: ドアに触る.
産業	さんぎょう	trabajo	sector productivo	
サンダル	サンダル	ropa	sandalia	
サンドイッチ	サンドイッチ	comida	sándwich	
残念	ざんねん	adjetivos	qué pena	
市	し	lugares	ciudad	
字	じ	escuela	carácter, letra	
試合	しあい	sociedad	partido	
仕方	しかた	otros	manera de hacer	
しかる	しかる	otros	cierto, un determinado	No es 叱る, regañar. しかる人 es una persona determinada.
試験	しけん	escuela	examen	
事故	じこ	sociedad	accidente	
地震	じしん	naturaleza	terremoto	
時代	じだい	tiempo	época	
下着	したぎ	ropa	ropa interior	
支度	したく	verbos	prepararse	
しっかり	しっかり	otros	con firmeza	
失敗	しっぱい	verbos	fracasar	
辞典	じてん	escuela	diccionario	
品物	しなもの	otros	artículo, mercancía	
しばらく	しばらく	tiempo	un rato	
島	しま	lugares	isla	
市民	しみん	gente	ciudadano	
事務所	じむしょ	lugares	oficina	
社会	しゃかい	sociedad	sociedad	
社長	しゃちょう	trabajo	presidente de la empresa	
じゃま	じゃま	otros	estorbo	
ジャム	ジャム	comida	mermelada	
自由	じゆう	sociedad	libertad	
習慣	しゅうかん	sociedad	costumbre	
住所	じゅうしょ	otros	dirección postal	
柔道	じゅうどう	otros	judo	
十分	じゅうぶん	adjetivos	suficiente	
出席	しゅっせき	verbos	asistir	
出発	しゅっぱつ	verbos	salir, partir	
趣味	しゅみ	otros	afición	
準備	じゅんび	verbos	preparar	
紹介	しょうかい	verbos	presentar a alguien	
小学校	しょうがっこう	escuela	escuela primaria	
小説	しょうせつ	otros	novela	
招待	しょうたい	verbos	invitar	
承知	しょうち	verbos	enterarse, aceptar	承知しました es de acuerdo, en el trabajo.
将来	しょうらい	tiempo	el futuro	
食事	しょくじ	verbos	comer, una comida	
食料品	しょくりょうひん	comida	alimentos	
女性	じょせい	gente	mujer	
知らせる	しらせる	verbos	avisar	
調べる	しらべる	verbos	consultar, investigar	
人口	じんこう	sociedad	población	
神社	じんじゃ	lugares	santuario	
親切	しんせつ	adjetivos	amable	
心配	しんぱい	verbos	preocuparse	
新聞社	しんぶんしゃ	trabajo	empresa de prensa	
水泳	すいえい	otros	natación	
水道	すいどう	casa	agua corriente	
ずいぶん	ずいぶん	otros	bastante	
数学	すうがく	escuela	matemáticas	
スーツ	スーツ	ropa	traje	
スーツケース	スーツケース	otros	maleta	
過ぎる	すぎる	verbos	pasarse, exceder	
すく	すく	verbos	vaciarse	De un tren o una sala. No es 好き.
スクリーン	スクリーン	otros	pantalla	
凄い	すごい	adjetivos	increíble	A menudo se escribe すごい.
進む	すすむ	verbos	avanzar	
すっかり	すっかり	otros	por completo	
すっと	すっと	otros	de un tirón	
ステーキ	ステーキ	comida	filete	
捨てる	すてる	verbos	tirar	
ステレオ	ステレオ	otros	equipo de música	
砂	すな	naturaleza	arena	
すばらしい	すばらしい	adjetivos	maravilloso	
滑る	すべる	verbos	resbalar	
隅	すみ	lugares	rincón	
済む	すむ	verbos	terminar, bastar	No es 住む, vivir en un sitio.
すり	すり	gente	carterista	
すると	すると	otros	entonces	
生活	せいかつ	verbos	vivir el día a día	
生産	せいさん	verbos	producir	
政治	せいじ	sociedad	política	
西洋	せいよう	lugares	Occidente	
世界	せかい	lugares	el mundo	
席	せき	lugares	asiento	
説明	せつめい	verbos	explicar	
背中	せなか	cuerpo	espalda	
ぜひ	ぜひ	otros	sin falta, insistiendo	
世話	せわ	verbos	cuidar, atender	
線	せん	otros	línea	
ぜんぜん	ぜんぜん	otros	nada, con negativo	
戦争	せんそう	sociedad	guerra	
先輩	せんぱい	gente	compañero mayor	
そう	そう	otros	así es	
相談	そうだん	verbos	consultar	
育てる	そだてる	verbos	criar	
卒業	そつぎょう	verbos	graduarse	
祖父	そふ	gente	mi abuelo	De la propia familia.
ソフト	ソフト	adjetivos	suave	
祖母	そぼ	gente	mi abuela	De la propia familia.
それで	それで	otros	por eso	
それに	それに	otros	además	
それほど	それほど	otros	tanto, hasta ese punto	
そろそろ	そろそろ	tiempo	ya es hora	
そんな	そんな	preguntas	ese tipo de	
そんなに	そんなに	otros	tanto	
退院	たいいん	verbos	recibir el alta	
大学生	だいがくせい	gente	universitario	
大事	だいじ	adjetivos	importante	
大体	だいたい	otros	en general	
たいてい	たいてい	otros	normalmente	
タイプ	タイプ	otros	tipo	
大分	だいぶ	otros	bastante, bastante más	
台風	たいふう	naturaleza	tifón	
倒れる	たおれる	verbos	desplomarse	
だから	だから	otros	así que	
確か	たしか	otros	si no me equivoco	
足す	たす	verbos	sumar	
尋ねる	たずねる	verbos	preguntar	No es 訪ねる, visitar.
訪ねる	たずねる	verbos	visitar	Misma lectura que 尋ねる, y otro verbo.
正しい	ただしい	adjetivos	correcto	
畳	たたみ	casa	tatami	
建てる	たてる	verbos	construir	
立てる	たてる	verbos	poner de pie	Misma lectura que 建てる.
例えば	たとえば	otros	por ejemplo	
棚	たな	casa	estante	
楽しみ	たのしみ	otros	ilusión	
楽しむ	たのしむ	verbos	disfrutar	
たまに	たまに	tiempo	de vez en cuando	
為	ため	otros	para, por	
だめ	だめ	adjetivos	no sirve	
足りる	たりる	verbos	bastar	
男性	だんせい	gente	hombre	
暖房	だんぼう	casa	calefacción	
血	ち	cuerpo	sangre	
チェックする	チェックする	verbos	revisar	
力	ちから	otros	fuerza	
ちっとも	ちっとも	otros	nada en absoluto, con negativo	
ちゃん	ちゃん	gente	sufijo cariñoso	Se pega al nombre. No se usa solo como palabra de contenido.
注意	ちゅうい	verbos	tener cuidado, avisar	
中学校	ちゅうがっこう	escuela	secundaria	
注射	ちゅうしゃ	cuerpo	inyección	
駐車場	ちゅうしゃじょう	lugares	aparcamiento	
地理	ちり	escuela	geografía	
捕まえる	つかまえる	verbos	atrapar	
つき	つき	naturaleza	luna	
付く	つく	verbos	pegarse, encenderse	
漬ける	つける	verbos	poner en remojo	No es 付ける, poner o encender.
都合	つごう	otros	conveniencia	
伝える	つたえる	verbos	transmitir	
続く	つづく	verbos	continuar	
続ける	つづける	verbos	seguir haciendo	
包む	つつむ	verbos	envolver	
妻	つま	gente	mi esposa	Habla de la propia.
つもり	つもり	otros	intención	
釣る	つる	verbos	pescar	
連れる	つれる	verbos	llevar consigo	
丁寧	ていねい	adjetivos	cortés, con cuidado	
テキスト	テキスト	escuela	libro de texto	
適当	てきとう	adjetivos	adecuado, o a la ligera	Las dos lecturas conviven: lo justo, o hecho sin cuidado.
できるだけ	できるだけ	otros	todo lo posible	
手伝う	てつだう	verbos	ayudar	
テニス	テニス	otros	tenis	
手袋	てぶくろ	ropa	guantes	
寺	てら	lugares	templo	
点	てん	escuela	punto, nota	
店員	てんいん	trabajo	dependiente	
天気予報	てんきよほう	tiempo	pronóstico del tiempo	
電灯	でんとう	casa	lámpara	
電報	でんぽう	otros	telegrama	
展覧会	てんらんかい	sociedad	exposición	
都	と	lugares	metrópoli	
道具	どうぐ	otros	herramienta	
とうとう	とうとう	tiempo	al final	
動物園	どうぶつえん	lugares	zoo	
遠く	とおく	lugares	lejos	
通る	とおる	verbos	pasar	
特に	とくに	otros	especialmente	
特別	とくべつ	adjetivos	especial	
とこや	とこや	lugares	barbería	
途中	とちゅう	lugares	a mitad de camino	
特急	とっきゅう	transporte	tren expreso	
届ける	とどける	verbos	entregar	
泊まる	とまる	verbos	alojarse	
止める	とめる	verbos	parar algo	
取り替える	とりかえる	verbos	cambiar, sustituir	
泥棒	どろぼう	gente	ladrón	
どんどん	どんどん	otros	cada vez más	
直す	なおす	verbos	arreglar	
治る	なおる	verbos	curarse	
直る	なおる	verbos	arreglarse	Misma lectura que 治る.
中々	なかなか	otros	no fácilmente, con negativo	En afirmativo, bastante.
泣く	なく	verbos	llorar	
亡くなる	なくなる	verbos	fallecer	
無くなる	なくなる	verbos	acabarse	Misma lectura que 亡くなる.
投げる	なげる	verbos	lanzar	
なさる	なさる	verbos	hacer, de respeto	ます es なさいます.
鳴る	なる	verbos	sonar	
なるべく	なるべく	otros	en la medida de lo posible	
なるほど	なるほど	otros	ya veo	
慣れる	なれる	verbos	acostumbrarse	
におい	におい	otros	olor	
苦い	にがい	adjetivos	amargo	
二階建て	にかいだて	casa	de dos plantas	
逃げる	にげる	verbos	huir	
日記	にっき	otros	diario	
入院	にゅういん	verbos	ingresar en el hospital	
入学	にゅうがく	verbos	ingresar en un centro	
似る	にる	verbos	parecerse	Lleva に.
人形	にんぎょう	otros	muñeca	
盗む	ぬすむ	verbos	robar	
塗る	ぬる	verbos	pintar, untar	
ぬれる	ぬれる	verbos	mojarse	
ねだん	ねだん	otros	precio	
熱	ねつ	cuerpo	fiebre	
ねっしん	ねっしん	adjetivos	entusiasta	
寝坊	ねぼう	verbos	quedarse dormido	
眠い	ねむい	adjetivos	tener sueño	
眠る	ねむる	verbos	dormir	
残る	のこる	verbos	quedar	
のど	のど	cuerpo	garganta	
乗り換える	のりかえる	verbos	hacer transbordo	
乗り物	のりもの	transporte	vehículo	
葉	は	naturaleza	hoja	
場合	ばあい	otros	caso	
パート	パート	trabajo	media jornada	
倍	ばい	numeros	el doble	
拝見	はいけん	verbos	ver, humilde	拝見する. No se dice de la acción de otra persona.
歯医者	はいしゃ	trabajo	dentista	
運ぶ	はこぶ	verbos	transportar	
始める	はじめる	verbos	empezar	
場所	ばしょ	lugares	lugar	
はず	はず	otros	lo esperado	はずだ afirma lo que la lógica prevé.
恥ずかしい	はずかしい	adjetivos	da vergüenza	
パソコン	パソコン	otros	ordenador personal	
発音	はつおん	escuela	pronunciación	
はっきり	はっきり	otros	claramente	
花見	はなみ	sociedad	ver los cerezos	
林	はやし	naturaleza	bosque pequeño	
払う	はらう	verbos	pagar	
番組	ばんぐみ	otros	programa	
反対	はんたい	verbos	oponerse	
ハンドバッグ	ハンドバッグ	ropa	bolso	
火	ひ	naturaleza	fuego	
日	ひ	tiempo	día	
ピアノ	ピアノ	otros	piano	
冷える	ひえる	verbos	enfriarse	
光	ひかり	naturaleza	luz	
光る	ひかる	verbos	brillar	
引き出し	ひきだし	casa	cajón	
引き出す	ひきだす	verbos	sacar, retirar	
ひげ	ひげ	cuerpo	barba	
飛行場	ひこうじょう	lugares	aeródromo	
久しぶり	ひさしぶり	tiempo	cuánto tiempo	
美術館	びじゅつかん	lugares	museo de arte	
非常に	ひじょうに	otros	muy	
びっくりする	びっくりする	verbos	sobresaltarse	
引っ越す	ひっこす	verbos	mudarse	
必要	ひつよう	adjetivos	necesario	
ひどい	ひどい	adjetivos	terrible	
開く	ひらく	verbos	abrir, un acto o un local	Godan. No es 開く leído あく.
ビル	ビル	lugares	edificio	
昼間	ひるま	tiempo	de día	
昼休み	ひるやすみ	tiempo	pausa del mediodía	
拾う	ひろう	verbos	recoger	
ファックス	ファックス	otros	fax	
増える	ふえる	verbos	aumentar	
深い	ふかい	adjetivos	profundo	
複雑	ふくざつ	adjetivos	complicado	
復習	ふくしゅう	verbos	repasar	
部長	ぶちょう	trabajo	jefe de departamento	
普通	ふつう	otros	normal	
ぶどう	ぶどう	comida	uvas	
太る	ふとる	verbos	engordar	
布団	ふとん	casa	futón	
舟	ふね	transporte	barco	
不便	ふべん	adjetivos	incómodo	
踏む	ふむ	verbos	pisar	
降り出す	ふりだす	verbos	empezar a llover	
プレゼント	プレゼント	otros	obsequio	
文化	ぶんか	sociedad	cultura	
文学	ぶんがく	escuela	literatura	
文法	ぶんぽう	escuela	gramática	
別	べつ	adjetivos	distinto	
ベル	ベル	otros	timbre	
変	へん	adjetivos	raro	
返事	へんじ	verbos	responder	
貿易	ぼうえき	sociedad	comercio exterior	
放送	ほうそう	verbos	emitir	
法律	ほうりつ	sociedad	ley	
僕	ぼく	gente	yo, masculino	
星	ほし	naturaleza	estrella	
ほど	ほど	otros	grado	
ほとんど	ほとんど	otros	casi	
ほめる	ほめる	verbos	elogiar	
翻訳	ほんやく	verbos	traducir	
参る	まいる	verbos	ir o venir, humilde	
負ける	まける	verbos	perder	
まじめ	まじめ	adjetivos	serio	
まず	まず	otros	primero	
または	または	otros	o bien	
間違える	まちがえる	verbos	equivocarse	
間に合う	まにあう	verbos	llegar a tiempo	
周り	まわり	lugares	alrededor	
回る	まわる	verbos	dar vueltas	
漫画	まんが	otros	cómic	
真ん中	まんなか	lugares	el centro	
見える	みえる	verbos	verse	Ya expresa que algo entra en la vista.
湖	みずうみ	naturaleza	lago	
味噌	みそ	comida	miso	
見つかる	みつかる	verbos	ser encontrado	
見つける	みつける	verbos	encontrar	
皆	みな	gente	todos	
港	みなと	lugares	puerto	
向かう	むかう	verbos	dirigirse	
迎える	むかえる	verbos	ir a recibir	
昔	むかし	tiempo	antaño	
虫	むし	naturaleza	insecto	
息子	むすこ	gente	mi hijo	De la propia familia.
娘	むすめ	gente	mi hija	De la propia familia.
無理	むり	adjetivos	imposible	
召し上がる	めしあがる	verbos	comer o beber, de respeto	
珍しい	めずらしい	adjetivos	poco común	
申し上げる	もうしあげる	verbos	decir, humilde	
申す	もうす	verbos	llamarse, humilde	
もうすぐ	もうすぐ	tiempo	pronto	
もし	もし	otros	si	
もちろん	もちろん	otros	claro	
もっとも	もっとも	otros	lo más, o aunque	Como adverbio, lo más. Como enlace, aunque.
戻る	もどる	verbos	volver	
木綿	もめん	ropa	algodón	
もらう	もらう	verbos	recibir	
森	もり	naturaleza	bosque	
焼く	やく	verbos	asar, hornear	
約束	やくそく	verbos	prometer	
役に立つ	やくにたつ	verbos	ser útil	
焼ける	やける	verbos	asarse, quemarse	
優しい	やさしい	adjetivos	amable	
痩せる	やせる	verbos	adelgazar	
やっと	やっと	tiempo	por fin	
やはり	やはり	otros	como pensaba	
止む	やむ	verbos	parar, la lluvia o el dolor	
柔らかい	やわらかい	adjetivos	blando al tacto	
湯	ゆ	casa	agua caliente	
輸出	ゆしゅつ	verbos	exportar	
輸入	ゆにゅう	verbos	importar	
指	ゆび	cuerpo	dedo	
指輪	ゆびわ	ropa	anillo	
夢	ゆめ	otros	sueño	
揺れる	ゆれる	verbos	temblar	
用	よう	otros	asunto	
用意	ようい	verbos	tener listo	
用事	ようじ	otros	recado	
汚れる	よごれる	verbos	ensuciarse	
予習	よしゅう	verbos	preparar la lección	
予定	よてい	verbos	tener previsto	
予約	よやく	verbos	reservar	
寄る	よる	verbos	acercarse, pasar por	
喜ぶ	よろこぶ	verbos	alegrarse	
よろしい	よろしい	adjetivos	bien, cortés	
理由	りゆう	otros	motivo	
利用	りよう	verbos	utilizar	
両方	りょうほう	otros	ambos	
旅館	りょかん	lugares	posada japonesa	
留守	るす	otros	ausencia	
冷房	れいぼう	casa	aire acondicionado	
歴史	れきし	escuela	historia	
レジ	レジ	lugares	caja	
レポート	レポート	escuela	informe	
連絡	れんらく	verbos	contactar	
ワープロ	ワープロ	otros	procesador de textos	
沸かす	わかす	verbos	hervir algo	
別れる	わかれる	verbos	separarse	
沸く	わく	verbos	hervir	
訳	わけ	otros	el porqué	
忘れ物	わすれもの	otros	objeto olvidado	
笑う	わらう	verbos	reír	
割合	わりあい	otros	proporción	
割れる	われる	verbos	agrietarse	
"""

GLOSS = rows()
