# Lectura de trabajo y glosa original de cada kanji del N4 comunitario.
# Una lectura principal. Las otras salen en la nota.

def rows():
    out = {}
    for line in TEXT.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) == 4:
            parts.append("")
        ch, reading, group, es, note = parts
        out[ch] = (reading, es, group, note)
    return out


TEXT = r"""
会	かい	sociedad	reunión	On. 会う es あう.
同	どう	otros	igual	同じ es おなじ.
事	じ	otros	asunto	こと es la lectura kun.
自	じ	otros	uno mismo	自分.
社	しゃ	trabajo	empresa	神社 se lee じんじゃ.
発	はつ	verbos	salida, emitir	出発, 発音.
者	しゃ	gente	persona, sufijo	医者, 記者.
地	ち	lugares	tierra, suelo	地下, 地図.
業	ぎょう	trabajo	oficio, industria	工業, 授業.
方	ほう	otros	lado, dirección	かた es la persona, cortés. ほう compara.
新	あたら	adjetivos	nuevo	新しい. On: シン.
場	ば	lugares	lugar	場所, 工場.
員	いん	trabajo	miembro	店員, 会社員.
立	た	verbos	ponerse de pie	立つ. On: リツ.
開	ひら	verbos	abrir	開く es ひらく o あく. On: カイ.
手	て	cuerpo	mano	上手 es じょうず.
力	ちから	otros	fuerza	On: リョク, リキ.
問	もん	escuela	pregunta	質問. 問う es とう.
代	だい	otros	época, sustituto	時代. 代わる es かわる.
明	あか	adjetivos	claro, brillante	明るい. On: メイ.
動	うご	verbos	moverse	動く. On: ドウ.
京	きょう	lugares	capital	東京. On: ケイ en 京都市 no es la lectura de este nivel.
目	め	cuerpo	ojo	On: モク.
通	とお	verbos	pasar	通る. On: ツウ.
言	い	verbos	decir	言う. On: ゲン.
理	り	escuela	razón, principio	料理, 理由.
体	からだ	cuerpo	cuerpo	On: タイ.
田	た	naturaleza	arrozal	
主	ぬし	otros	dueño, principal	On: シュ, como en 主人.
題	だい	escuela	tema	問題.
意	い	otros	intención, idea	意味, 注意.
不	ふ	otros	no, prefijo	不便, 不安.
作	さく	verbos	hacer, obra	作る es つくる.
用	よう	otros	uso	用いる es もちいる.
度	ど	otros	vez, grado	一度. たび es vez, kun.
強	つよ	adjetivos	fuerte	強い. On: キョウ.
公	こう	sociedad	público	公園 ya es N5. 公務員.
持	も	verbos	sostener	持つ.
野	の	naturaleza	campo	野原.
以	い	otros	a partir de, por medio de	以上, 以下.
思	おも	verbos	pensar	思う.
家	いえ	casa	casa	On: カ, como en 家族.
世	よ	sociedad	mundo, generación	世界 usa セ. 世の中 es よのなか.
多	おお	adjetivos	mucho	多い.
正	ただ	adjetivos	correcto	正しい. On: セイ.
安	やす	adjetivos	barato, tranquilo	安い. On: アン.
院	いん	lugares	institución	病院, 医院.
心	こころ	cuerpo	corazón, mente	On: シン, como en 安心.
界	かい	lugares	mundo, esfera	世界.
教	おし	verbos	enseñar	教える. On: キョウ.
文	ぶん	escuela	texto, letra	On: モン en 文字.
元	もと	otros	origen	On: ゲン.
重	おも	adjetivos	pesado	重い. On: ジュウ.
近	ちか	adjetivos	cerca	近い. On: キン.
考	かんが	verbos	pensar	考える.
画	え	otros	dibujo, trazo	On: ガ, como en 映画.
海	うみ	naturaleza	mar	On: カイ.
売	う	verbos	vender	売る.
知	し	verbos	saber	知る.
道	みち	lugares	camino	On: ドウ.
集	あつ	verbos	reunir	集める. On: シュウ.
別	わか	otros	separar, otro	別れる. On: ベツ.
物	もの	otros	cosa	On: ブツ.
使	つか	verbos	usar	使う.
品	しな	otros	artículo	On: ヒン.
計	けい	otros	medir, plan	計画.
死	し	verbos	muerte	死ぬ.
特	とく	otros	especial	特別.
私	わたし	gente	yo, privado	On: シ, privado.
始	はじ	verbos	empezar	始める.
朝	あさ	tiempo	mañana	On: チョウ.
運	はこ	verbos	transportar	運ぶ. On: ウン.
終	お	verbos	terminar	終わる. On: シュウ.
台	だい	otros	contador, pedestal	一台. También plataforma.
広	ひろ	adjetivos	ancho	広い.
住	す	verbos	vivir en	住む.
真	ま	otros	verdad	真面目. On: シン.
有	あ	verbos	haber, tener	有る. On: ユウ.
口	くち	cuerpo	boca	On: コウ.
少	すく	adjetivos	poco	少ない.
町	まち	lugares	barrio	On: チョウ.
料	りょう	otros	tarifa, material	料理, 料金.
工	こう	trabajo	obra, industria	工場.
建	た	verbos	construir	建てる. On: ケン.
空	そら	naturaleza	cielo, vacío	空く es あく. On: クウ.
急	いそ	adjetivos	prisa	急ぐ. On: キュウ.
止	と	verbos	parar	止める, 止まる. On: シ.
送	おく	verbos	enviar	送る.
切	き	verbos	cortar	切る. On: セツ.
転	てん	verbos	girar, cambiar	自転車 ya es N5.
研	けん	escuela	pulir, investigar	研究.
足	あし	cuerpo	pie, pierna	足りる es bastar. On: ソク.
究	きゅう	escuela	investigar a fondo	研究.
楽	たの	adjetivos	agradable	楽しい. On: ガク, música.
起	お	verbos	levantarse	起きる.
着	き	verbos	ponerse, llegar	着る, 着く.
店	みせ	lugares	tienda	On: テン.
病	びょう	cuerpo	enfermedad	病気.
質	しつ	otros	calidad	質問 usa otra lectura, しつ de preguntar no es este sentido único.
待	ま	verbos	esperar	待つ.
試	ため	verbos	probar	試す. On: シ, 試験.
族	ぞく	gente	familia, grupo	家族.
銀	ぎん	otros	plata	銀行.
早	はや	adjetivos	pronto	早い.
映	うつ	verbos	reflejarse	映画 es えいが.
親	おや	gente	padre, madre	On: シン, 親切.
験	けん	escuela	prueba	試験, 経験.
英	えい	escuela	Inglaterra, inglés	英語.
医	い	trabajo	medicina	医者, 医院.
仕	つか	verbos	servir	仕える. On: シ.
去	さ	verbos	irse	去る.
味	あじ	comida	sabor	On: ミ.
写	うつ	verbos	copiar	写真 es しゃしん.
字	じ	escuela	carácter	
答	こた	escuela	respuesta	答える.
夜	よる	tiempo	noche	On: ヤ.
音	おと	otros	sonido	On: オン.
注	ちゅう	verbos	verter, prestar atención	注意.
帰	かえ	verbos	volver	帰る.
古	ふる	adjetivos	viejo	古い.
歌	うた	otros	canción	歌う.
買	か	verbos	comprar	買う.
悪	わる	adjetivos	malo	悪い.
図	ず	otros	diagrama	地図.
週	しゅう	tiempo	semana	
室	しつ	lugares	habitación	教室.
歩	ある	verbos	caminar	歩く. On: ホ.
風	かぜ	naturaleza	viento	On: フウ.
紙	かみ	otros	papel	On: シ.
黒	くろ	naturaleza	negro	黒い.
花	はな	naturaleza	flor	On: カ.
春	はる	tiempo	primavera	
赤	あか	naturaleza	rojo	赤い.
青	あお	naturaleza	azul	青い.
館	かん	lugares	edificio público	図書館, 映画館.
屋	や	lugares	tienda, techo	本屋.
色	いろ	naturaleza	color	On: ショク.
走	はし	verbos	correr	走る.
秋	あき	tiempo	otoño	
夏	なつ	tiempo	verano	
習	なら	verbos	aprender	習う.
駅	えき	transporte	estación	
洋	よう	lugares	océano, occidental	西洋.
旅	たび	otros	viaje	旅行.
服	ふく	ropa	ropa	
夕	ゆう	tiempo	atardecer	夕方.
借	か	verbos	pedir prestado	借りる.
曜	よう	tiempo	día de la semana	日曜日.
飲	の	verbos	beber	飲む.
肉	にく	comida	carne	
貸	か	verbos	prestar	貸す.
堂	どう	lugares	sala	食堂.
鳥	とり	naturaleza	ave	
飯	はん	comida	comida	ご飯 es はん en compuestos.
勉	べん	escuela	esforzarse	勉強.
冬	ふゆ	tiempo	invierno	
昼	ひる	tiempo	mediodía	
茶	ちゃ	comida	té	
弟	おとうと	gente	hermano menor	On: テイ.
牛	うし	naturaleza	vaca	On: ギュウ.
魚	さかな	comida	pez	On: ギョ.
兄	あに	gente	hermano mayor	On: ケイ.
犬	いぬ	naturaleza	perro	
妹	いもうと	gente	hermana menor	
姉	あね	gente	hermana mayor	
漢	かん	escuela	China, han	漢字.
坊	ぼう	gente	chico	赤ん坊.
凄	すご	adjetivos	tremendo	すごい es la escritura habitual.
痩	や	verbos	adelgazar	痩せる.
"""

KANJI = rows()
