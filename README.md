# NihongoDojo

Quiz sin conexión para el **JLPT N5, N4, N3, N2 y N1**: un camino de lecciones y exámenes libres de **silabarios**, **vocabulario**, **kanji**, **frases**, **gramática** y **conjugación**. En los silabarios ves el carácter y escribes el romaji, o al revés. En el resto eliges entre opciones. La voz es la del sistema, también dentro de un webxdc, además del examen.

Es una mini-app [webxdc](https://webxdc.org/) para Delta Chat y ArcaneChat (versión 1.13.6, commit `20455cd`). También se abre sola en el navegador: no tiene servidor, dependencias ni conexión de red.

El JLPT no publica lista oficial de vocabulario, kanji ni gramática desde 2010. El N5 sigue el recorte comunitario de Jonathan Waller (el que usa Jisho), a través de OpenJLPT: 674 palabras, 84 kanji y 81 puntos de gramática, más los kana y las conjugaciones que esos ítems necesitan. El N4 añade el recorte incremental: 630 palabras, 169 kanji y 98 puntos de gramática, con potencial, condicionales y voz. El N3 añade otras 1.659 palabras, 387 kanji y 101 puntos, con la negación ず. El N2 añade el recorte siguiente: 1.778 palabras, 398 kanji y 123 puntos, con まい y los verbos en ずる. El N1 añade el último recorte: 3.070 palabras, 1.345 kanji y 123 puntos. No es el examen ni una promesa de aprobarlo.

## Qué practica

Por silabario hay 104 caracteres:

| Grupo | Cantidad | Ejemplos |
|---|---:|---|
| Filas básicas (gojūon moderno, sin ゐ/ゑ) | 46 | あ, し, ん / ア, シ, ン |
| Sonoras y semi-sonoras (濁音・半濁音) | 25 | が, じ, ぱ / ガ, ジ, パ |
| Combinadas (拗音, yōon) | 33 | きゃ, しゃ, じゃ / キャ, シャ, ジャ |

Esos grupos sonoros no son rendaku. Rendaku es la sonorización en compuestos (ひと + ひと → ひとびと). Aquí se practica el silabario: dakuon y handakuon.

La primera vez solo están marcadas las filas básicas (46 preguntas). Sonoras y yōon se añaden aparte. Hiragana y katakana no se mezclan, y cada uno recuerda su selección. El botón de inicio dice cuántas preguntas salen.

っ y ー no son sílabas sueltas del examen de kana: se practican en palabras, porque っ dobla la consonante y ー alarga la vocal. Las vocales pequeñas del katakana (ァィゥェォ) salen en las palabras que las usan, como フォーク. El audio no se descarga: lo pronuncia la voz del propio dispositivo.

### Camino

En Camino hay cinco botones, N5, N4, N3, N2 y N1. No se mezclan. Si un nivel no está en esta copia, no se muestra el N5 en su lugar. La primera pantalla carga el N5. N4, N3, N2 y N1 se cargan al elegirlos, para no leer varios megabytes antes de empezar.

El N5 tiene 357 lecciones: los dos silabarios, っ y ー, cada punto de gramática, el vocabulario en tandas de 12, los 84 kanji en tandas de 10, la conjugación, las frases, la escucha de palabras, kanji y frases, y seis textos. El N4 tiene 363. El N3 tiene 581. El N2 tiene 649. El N1 tiene 1.043. La lista se desplaza; ninguna lección está bloqueada. Una lección de escucha no empieza si el sistema no tiene voz japonesa.

Cada lección explica el paso y después abre el examen con ítems que ya están en la app. Se supera con 70%. El progreso del N5 queda en `nihongodojo.lessons`. El del N4, en `nihongodojo.lessons.n4`. El del N3, en `nihongodojo.lessons.n3`. El del N2, en `nihongodojo.lessons.n2`. El del N1, en `nihongodojo.lessons.n1`. Se puede saltar o repetir. Un intento peor no borra una lección ya superada.

### Palabras

699 entradas: las 674 del recorte N5, más わたし, las partículas sueltas, ほう y unos contadores que la gramática necesita. Diecisiete temas. La primera vez están marcados saludos, números y gente.

Si la palabra se escribe con kanji, el examen muestra el carácter y, debajo, la lectura. No hace falta conocer el kanji para elegir el significado. En la otra dirección ves el español y eliges la palabra. Los homófonos no comparten glosa: 厚い es grueso, 暑い es hace calor y 熱い es caliente al tacto.

は, へ y を, como partículas, se leen `wa`, `e` y `o`. La voz intenta esa lectura, no la del carácter suelto. Como caracteres del silabario siguen siendo `ha`, `he` y `wo`.

### Kanji

84 kanji del recorte N5, incluida la lista comunitaria con 丈 y 貼. No es una lista oficial. Cada uno tiene un significado en español y una lectura de este nivel. Las otras lecturas aparecen al corregir.

Cuatro direcciones: kanji → significado, significado → kanji, kanji → lectura, y escuchar → español. En la de lectura, 日 y 火 no salen como trampas una de la otra: las dos se leen `ひ`. En escuchar no ves el carácter: la voz del sistema dice la lectura.

### Frases y gramática

164 frases y 246 fichas de gramática, en español original. Cubren los 81 puntos del recorte y, además, los contadores. La primera vez solo está marcado el grupo de cópulas.

Cuatro direcciones en frases:

- **Frase → español:** ves la frase, con la lectura debajo, y eliges el significado.
- **Español → frase:** ves el significado y eliges la frase. El sonido se oye al corregir.
- **Partícula:** la frase tiene un hueco. El significado está debajo. No se repite la misma pieza entre las opciones.
- **Escuchar → español:** no ves la frase. La dice la voz del sistema y eliges el significado.

En gramática: patrón → español, español → patrón, o hueco. Si un ejemplo no tiene una pieza clara que tapar, no entra en Hueco.

### Conjugación

1069 formas de 119 verbos del N5: diccionario, ます, ません, ました, ませんでした, て, ない, た y たい. La primera vez están marcados 食べる, 行く y する.

Ichidan quita る. Godan cambia la última sílaba: む → んで, く → いて, す → して, う → って. 行く es la excepción: 行って, no 行いて. する y 来る son irregulares. ある niega con ない, no con あらない, y no tiene たい. 切る es godan; 着る es ichidan. El N5 no incluye potencial, pasiva ni causativa.

### N4

El botón N4 cambia el camino y los temas de los exámenes libres. No repite el N5. Son 630 palabras, 169 kanji, 196 frases y 294 fichas de los 98 puntos de gramática. La primera vez, en palabras, están marcados verbos, gente y tiempo.

La conjugación N4 tiene 2399 formas de 161 verbos. Además de ます y て, entran potencial, たら, ば, volitivo, pasiva y causativa. いらっしゃる, おっしゃる, くださる y なさる hacen います, no ります, y no llevan potencial ni pasiva. 見える y 聞こえる ya son de capacidad, así que no se les añade otra. チェックする no se conjuga: en la lista es un nombre.

El progreso y los temas marcados del N4 no pisan los del N5. Un examen a medias guarda el nivel, así que reanudarlo no mezcla catálogos.

### N3

El botón N3 cambia el camino y los temas. No repite N5 ni N4. Son 1.659 palabras, 387 kanji, 202 frases y 303 fichas de los 101 puntos de gramática. La primera vez, en palabras, están marcados verbos, gente y sociedad.

La conjugación N3 tiene las formas del N4 y, además, la negación ず, la de ずに. する hace せず. 居る es godan: 居ります, no います. よると queda como expresión fija: la lista lo marca como verbo, pero no se conjuga.

El progreso va en `nihongodojo.lessons.n3`. Los temas marcados van en `sel.n3.*`.

### N2

El botón N2 cambia el camino y los temas. No repite N5, N4 ni N3. Son 1.778 palabras, 398 kanji, 246 frases y 369 fichas de los 123 puntos de gramática. La primera vez, en palabras, están marcados verbos, gente y sociedad.

La conjugación N2 tiene las formas del N3 y, además, まい. Los ocho verbos en ずる se conjugan por じ: 応じます, 応じて, 応ずるまい. 刷る se lee する, pero es godan: 刷ります, no します. 擦る también es godan. 請う hace 請うて, no 請って. 削る es godan, no ずる. Cinco fórmulas de cortesía no se conjugan: no traen clase verbal.

El progreso va en `nihongodojo.lessons.n2`. Los temas marcados van en `sel.n2.*`.

### N1

El botón N1 cambia el camino y los temas. No repite N5, N4, N3 ni N2, salvo cinco contadores que la lista fuente vuelve a incluir: 冊, と, 匹, 分 y 枚. Son 3.070 palabras, 1.345 kanji, 246 frases y 369 fichas de los 123 puntos de gramática. La primera vez, en palabras, están marcados verbos y sociedad.

La conjugación N1 tiene las mismas formas que el N2, incluida まい. No añade una forma nueva: べし, まじき, んばかり y うものなら son puntos de gramática, no un ejercicio por verbo. Los cinco verbos en ずる se conjugan por じ: 演じます, 演じて, 演ずるまい. Si una forma coincide con la de otro verbo, el examen añade el diccionario entre paréntesis: 演じます（演ずる） y 演じます（演じる）. 擦る se lee かする, pero es godan: 擦ります, no します. 化する, con la misma lectura, sí es する. 問う hace 問うて, no 問って. 給う no: 給って. 入る se lee いる y es godan: 入ります, no います. 来る se lee きたる y también es godan: 来ります, no きます. 御覧なさい y seis entradas sin clase verbal no se conjugan.

El progreso va en `nihongodojo.lessons.n1`. Los temas marcados van en `sel.n1.*`.

## Cómo usarla

1. El inicio tiene dos pantallas: **Camino** y **Examen libre**. Elige **N5**, **N4**, **N3**, **N2** o **N1**. En Camino, **Seguir** abre la siguiente lección; **Ver lecciones** muestra la lista. **Repaso de hoy** es una sesión corta de ese nivel: primero lo fallado y después lo que lleva 3 días sin salir. El kana se escribe; el resto se elige. No marca lecciones y no es el examen. En Examen libre eliges silabarios, palabras, kanji, frases, conjugación, gramática o lectura. El nivel también cambia esos temas. Luego la dirección. En palabras, kanji, frases, conjugación y gramática puedes **Elegir** o **Escribir**. Escribir pide la respuesta: en japonés vale el kanji o el hiragana. Un salto no cuenta como fallo.
   - **Silabarios:** kana → romaji, o romaji → kana.
   - **Palabras:** palabra → español, o español → palabra.
   - **Kanji:** kanji → significado, significado → kanji, o kanji → lectura.
   - **Frases:** frase → español, español → frase, o la partícula que falta.
   - **Conjugación:** forma → español, o español → forma.
   - **Gramática:** patrón → español, español → patrón, o el hueco.
   - **Escuchar → español:** en palabras, kanji y frases, no ves el japonés. Lo dice la síntesis de voz del sistema, también en webxdc, y respondes el significado. Si ese cliente no expone la voz, no empieza; el resto sí.
   - **Lectura:** seis textos cortos por nivel, originales de este dojo. Lees y eliges. **Oír** dice la lectura con la misma voz. No es el examen.
   - **Repasar fallos:** guarda lo fallado de ese nivel y esa práctica, no los saltos. Un acierto posterior lo quita. Como mucho, 80.
2. En silabarios, elige también el silabario y el modo de romanización.
   - **Kana → romaji:** ves el carácter y escribes la lectura.
   - **Romaji → kana:** ves la lectura y eliges el carácter. No hace falta teclado japonés. Las teclas 1 a 4 también eligen.
3. Marca filas o temas. El texto encima del botón dice el tamaño del examen.
4. Pulsa **Iniciar examen**. El orden es aleatorio y no se repite en esa sesión.
5. Responde.
   - En silabarios, si el campo de romaji está vacío, avisa y no cuenta el fallo.
   - En palabras, kanji, frases, conjugación y gramática se elige una opción. Las teclas 1 a 4 también valen.
   - **Saltar** muestra la respuesta y cuenta como saltada, no como fallo.
   - La corrección se queda en pantalla. **Siguiente** o Enter pasa a la otra pregunta.
   - **Oír** pide la voz del sistema. Si «Automática» está activa, suena al aparecer la pregunta, salvo cuando eso revelaría la respuesta: entonces suena al corregir. En hiragana y katakana, también si ves el romaji, el sonido automático espera a la corrección. En un texto largo, suena una vez al empezar. Escuchar → español no empieza si no hay voz japonesa.
6. Al terminar ves aciertos, fallos, saltadas y el porcentaje (`aciertos / total`). Si hubo errores, **Repasar fallos** arma otro examen solo con esos elementos.
7. **Salir del examen** pide confirmación. Si el dispositivo permite guardar, la sesión queda a medias y se puede continuar desde la pantalla inicial.
8. Antes de cambiar de versión, pulsa **Copia del progreso** y **Mandar copia al chat**. El cliente te deja elegir el destino; Mensajes guardados sirve. El archivo se llama `nihongodojo-copia-AAAA-MM-DD.json` y no es un aviso de puntuación. En la versión nueva, **Restaurar copia** abre los archivos recientes del chat y combina: no borra una lección ya superada ni un repaso más reciente. Si el cliente no puede mandar archivos, se descarga la misma copia.

El silabario, el modo, la práctica, los temas, las filas y el camino se recuerdan en `localStorage`. Si el almacenamiento no está disponible, la app sigue en memoria, pero al salir se pierde la sesión: el diálogo lo dice.

は, へ, を, ぢ y づ muestran una pista en la propia pregunta. は es `ha` (no `wa`) y へ es `he` (no `e`): esas otras lecturas son de partícula, no del carácter.

En romaji → kana, じ y ぢ no salen como opciones una de la otra: las dos se leen `ji`. Si las dos están en el examen, la pregunta añade la fila (`ざ行` o `だ行`) para que se puedan distinguir.

### Pronunciación

El sonido lo pone la síntesis de voz del sistema (`speechSynthesis`), no un archivo de audio. No se descarga nada y no se manda audio a la red. **Probar voz** dice あ antes de empezar.

Un webxdc puede usarla además del examen, el resumen y `sendUpdate`: el anfitrión ya ejecuta la página en su WebView. El primer `speak()` va en el mismo toque, porque si no algunos WebView se quedan mudos. Se prefiere una voz local `ja-JP`. Si el sistema no la tiene, la app lo dice y el resto del examen sigue. En el móvil suele hacer falta instalar el japonés en los ajustes de texto a voz.

### Romanización

El modo **flexible** es el predeterminado. Acepta Hepburn y las variantes habituales de Kunrei-shiki y de los IME. El modo **estricto** solo acepta la forma Hepburn guardada en la base.

| Carácter | Estricto | También vale en flexible |
|---|---|---|
| し / シ | shi | si |
| ち / チ | chi | ti |
| つ / ツ | tsu | tu |
| ふ / フ | fu | hu |
| じ / ジ | ji | zi |
| ぢ / ヂ | ji | di, zi |
| づ / ヅ | zu | du, dzu |
| を / ヲ | wo | o |
| ん / ン | n | nn |
| しゃ / シャ | sha | sya, shya |
| しゅ / シュ | shu | syu, shyu |
| しょ / ショ | sho | syo, shyo |
| ちゃ / チャ | cha | tya, cya |
| じゃ / ジャ | ja | jya, zya |

じ y ぢ se leen `ji`; ず y づ se leen `zu`. No es un error de la corrección: en japonés moderno suenan igual.

Mayúsculas, espacios, signos y letras de ancho completo se ignoran: `ＳＨＩ!` cuenta como `shi`.

## Probarla en el navegador

Abre `index.html`. No hace falta un servidor. La página pide `webxdc.js` y el navegador responde 404: es normal. El botón de compartir solo aparece si `window.webxdc.sendUpdate` existe.

```bash
node scripts/test-core.js
node scripts/test-lexicon.js
node scripts/test-lessons.js
```

## Empaquetar para Delta Chat o ArcaneChat

Un `.xdc` es un ZIP con esa extensión. `index.html` tiene que estar en la raíz del archivo, no dentro de una carpeta. El HTML debe referenciar `webxdc.js` para activar la API, pero ese archivo lo sirve el cliente: no lo metas en el ZIP.

Desde la raíz del repositorio:

```bash
zip -9 -X NihongoDojo.xdc \
  index.html \
  core.js \
  n5.js \
  n4.js \
  n3.js \
  n2.js \
  n1.js \
  readings.js \
  lexicon.js \
  lessons.js \
  app.js \
  styles.css \
  manifest.toml \
  icon.png \
  LICENSE
```

`-9` usa Deflate, que es uno de los dos métodos que admite el [formato webxdc](https://webxdc.org/docs/spec/format.html) (el otro es Store, sin comprimir). Comprueba la raíz y que `webxdc.js` no haya entrado:

```bash
unzip -l NihongoDojo.xdc
```

Tienes que ver `index.html`, `manifest.toml` e `icon.png` al primer nivel. Envía el `.xdc` a un chat y ábrelo desde ahí.

`manifest.toml` define el nombre (`NihongoDojo`) y `source_code_url`, que el cliente puede mostrar en el menú de ayuda. `version` y `description` son metadatos de este repositorio; la spec no obliga a leerlos.

El icono actual es un PNG de 256×256. Si lo sustituyes, usa un cuadrado de entre 128 y 512 px, sin esquinas redondeadas: el cliente las recorta.

### Compartir la calificación

Dentro del chat, al terminar el examen aparece **Compartir en el chat**. El envío es voluntario, se hace una sola vez y, si la llamada falla, se puede reintentar. Si el cliente pide esperar entre avisos, el botón espera y luego envía. Los textos caben en los límites de [`sendUpdate`](https://webxdc.org/docs/spec/sendUpdate.html): el resumen junto al icono es `80% (83/104)` (como mucho 20 caracteres) y la línea del chat es `80% (83/104) en hiragana` (como mucho 50). En romaji → kana se añade ` · inv`. En palabras, kanji, frases, conjugación o gramática la línea dice `en palabras`, `en kanji`, `en frases`, `en conjugación` o `en gramática`. En una lección no dice solo el silabario: `Lección 1. Hiragana: Vocales superada al 100%`. El repaso dice `en repaso`, no el nombre del nivel. Si el aviso anterior sigue siendo el último del chat, ArcaneChat lo sustituye; por eso cada lección lleva su número y su título. No se manda el detalle de cada respuesta. La app no lee los resultados de otras personas ni mantiene un ranking.

## Estructura

```
index.html      Pantalla, plantilla del examen y política de seguridad
core.js         Base de kana, filtros, cola aleatoria y corrección
n5.js           Datos del N5 comunitario y su camino. Lo genera scripts/build_n5.py
n4.js           Datos del N4 comunitario y su camino. Lo genera scripts/build_n4.py
n3.js           Datos del N3 comunitario y su camino. Lo genera scripts/build_n3.py
n2.js           Datos del N2 comunitario y su camino. Lo genera scripts/build_n2.py
n1.js           Datos del N1 comunitario y su camino. Lo genera scripts/build_n1.py
readings.js     Textos cortos originales, seis por nivel
lexicon.js      Exámenes de palabras, kanji, frases, gramática y conjugación
lessons.js      Cola de cada lección y progreso del camino
app.js          Interfaz, estado, almacenamiento y envío al chat
styles.css      Estilos
manifest.toml   Nombre y enlace al código para el cliente webxdc
icon.png        Icono de la app (256×256)
scripts/        Generadores del N5, del N4, del N3, del N2 y del N1, y comprobaciones; no van en el .xdc
```

No hay paso de compilación. `core.js` no toca el DOM y también se puede cargar desde Node con `require("./core.js")`.

## Privacidad

La página no hace peticiones de red. La política de contenido solo permite scripts y estilos propios. Lo que escribes se queda en el dispositivo, salvo que pulses compartir: entonces se envía el resumen de esa sesión al chat, no cada respuesta. La copia del progreso solo sale si pulsas Mandar copia al chat y eliges el destino. Lleva el camino, los fallos, el repaso y, si lo hay, un examen a medias. No sale sola. La pronunciación usa la síntesis de voz del sistema; la app no envía el audio a ningún servidor.

## Licencia

El código de la app es MIT. Ver [LICENSE](LICENSE).

La selección de palabras, kanji y puntos de gramática es la de Jonathan Waller (CC BY), compilada en [OpenJLPT](https://github.com/evanclan/OpenJLPT) (CC BY-SA 4.0). `n5.js` no copia sus glosas ni sus ejemplos en inglés: el español, las notas y las frases son de este repositorio. Los niveles siguientes pueden añadirse con el mismo corte, sin presentarlos como lista oficial.
