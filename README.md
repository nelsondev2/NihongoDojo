# NihongoDojo

Quiz sin conexión para practicar japonés de principiante: **silabarios**, **palabras**, **kanji** y **frases**. En los silabarios ves el carácter y escribes el romaji, o al revés. En palabras, kanji y frases eliges entre opciones. Si el dispositivo tiene voz japonesa, también se oye.

Es una mini-app [webxdc](https://webxdc.org/) para Delta Chat y ArcaneChat (versión 1.6.0). También se abre sola en el navegador: no tiene servidor, dependencias ni conexión de red.

## Qué practica

Por silabario hay 104 caracteres:

| Grupo | Cantidad | Ejemplos |
|---|---:|---|
| Filas básicas (gojūon moderno, sin ゐ/ゑ) | 46 | あ, し, ん / ア, シ, ン |
| Sonoras y semi-sonoras (濁音・半濁音) | 25 | が, じ, ぱ / ガ, ジ, パ |
| Combinadas (拗音, yōon) | 33 | きゃ, しゃ, じゃ / キャ, シャ, ジャ |

Esos grupos sonoros no son rendaku. Rendaku es la sonorización en compuestos (ひと + ひと → ひとびと). Aquí se practica el silabario: dakuon y handakuon.

La primera vez solo están marcadas las filas básicas (46 preguntas). Sonoras y yōon se añaden aparte. Hiragana y katakana no se mezclan, y cada uno recuerda su selección. El botón de inicio dice cuántas preguntas salen.

No incluye っ/ッ, el alargador ー ni el katakana extendido (ファ, ティ, ヴ…). Las frases cubren los primeros patrones, no un curso de gramática ni el JLPT completo. El audio no se descarga: lo pronuncia la voz del propio dispositivo.

### Palabras

112 palabras en diez temas: saludos, gente, números, tiempo, lugares, comida, verbos, adjetivos, naturaleza y partículas. La primera vez están marcados saludos, números y gente.

Si la palabra se escribe con kanji, el examen muestra el carácter y, debajo, la lectura. No hace falta conocer el kanji para elegir el significado. En la otra dirección ves el español y eliges la palabra.

は y を, como partículas, se leen `wa` y `o`. El examen lo dice, y la voz intenta esa lectura, no la del carácter suelto.

### Kanji

78 kanji de principiante, agrupados por tema. No es la lista entera de ningún nivel. Cada uno tiene un significado en español y una lectura principal. Las otras lecturas aparecen al corregir, para no fingir que un kanji se lee de una sola manera.

Tres direcciones: kanji → significado, significado → kanji, y kanji → lectura. En la de lectura, 日 y 火 no salen como trampas una de la otra: las dos se leen `ひ`.

### Frases

51 frases cortas con las palabras del dojo. Siete patrones: です, ます, lugar, preguntas, adjetivos, tiempo, y も・の. La primera vez solo está marcado です.

Tres direcciones:

- **Frase → español:** ves la frase, con la lectura debajo, y eliges el significado.
- **Español → frase:** ves el significado y eliges la frase. El sonido se oye al corregir.
- **Partícula:** la frase tiene un hueco. El significado está debajo para que は y も no se confundan. Eliges は, を, に, で, が, と, も o の. No se repite la misma partícula entre las opciones.

駅へ行きます no entra en el hueco: con 行く también vale に. La nota lo dice en la traducción. 学生ですか y お元気ですか tampoco tienen hueco: la pregunta la cierra か.

## Cómo usarla

1. Elige qué practicas: silabarios, palabras, kanji o frases. Luego la dirección.
   - **Silabarios:** kana → romaji, o romaji → kana.
   - **Palabras:** palabra → español, o español → palabra.
   - **Kanji:** kanji → significado, significado → kanji, o kanji → lectura.
   - **Frases:** frase → español, español → frase, o la partícula que falta.
2. En silabarios, elige también el silabario y el modo de romanización.
   - **Kana → romaji:** ves el carácter y escribes la lectura.
   - **Romaji → kana:** ves la lectura y eliges el carácter. No hace falta teclado japonés. Las teclas 1 a 4 también eligen.
3. Marca filas o temas. El texto encima del botón dice el tamaño del examen.
4. Pulsa **Iniciar examen**. El orden es aleatorio y no se repite en esa sesión.
5. Responde.
   - En silabarios, si el campo de romaji está vacío, avisa y no cuenta el fallo.
   - En palabras y kanji se elige una opción. Las teclas 1 a 4 también valen.
   - **Saltar** muestra la respuesta y cuenta como saltada, no como fallo.
   - La corrección se queda en pantalla. **Siguiente** o Enter pasa a la otra pregunta.
   - **Escuchar** reproduce el sonido. Si «Al mostrar» está activo, suena al aparecer la pregunta, salvo cuando eso revelaría la respuesta: entonces suena al corregir.
6. Al terminar ves aciertos, fallos, saltadas y el porcentaje (`aciertos / total`). Si hubo errores, **Repasar fallos** arma otro examen solo con esos elementos.
7. **Salir del examen** pide confirmación. Si el dispositivo permite guardar, la sesión queda a medias y se puede continuar desde la pantalla inicial.

El silabario, el modo, la práctica, los temas y las filas se recuerdan en `localStorage`. Si el almacenamiento no está disponible, la app sigue en memoria, pero al salir se pierde la sesión: el diálogo lo dice.

は, へ, を, ぢ y づ muestran una pista en la propia pregunta. は es `ha` (no `wa`) y へ es `he` (no `e`): esas otras lecturas son de partícula, no del carácter.

En romaji → kana, じ y ぢ no salen como opciones una de la otra: las dos se leen `ji`. Si las dos están en el examen, la pregunta añade la fila (`ざ行` o `だ行`) para que se puedan distinguir.

### Pronunciación

El sonido lo pone la voz japonesa del dispositivo, con la API de voz del navegador. No se descarga nada y no se manda audio a la red. **Probar voz** dice あ antes de empezar.

Si el sistema no tiene una voz `ja-JP`, el botón lo dice y puede no oírse. En el móvil suele hacer falta instalar el idioma japonés en los ajustes de texto a voz. Dentro de Delta Chat depende de que el WebView exponga esa API.

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
```

## Empaquetar para Delta Chat o ArcaneChat

Un `.xdc` es un ZIP con esa extensión. `index.html` tiene que estar en la raíz del archivo, no dentro de una carpeta. El HTML debe referenciar `webxdc.js` para activar la API, pero ese archivo lo sirve el cliente: no lo metas en el ZIP.

Desde la raíz del repositorio:

```bash
zip -9 -X NihongoDojo.xdc \
  index.html \
  core.js \
  lexicon.js \
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

Dentro del chat, al terminar el examen aparece **Compartir en el chat**. El envío es voluntario, se hace una sola vez y, si la llamada falla, se puede reintentar. Los textos caben en los límites de [`sendUpdate`](https://webxdc.org/docs/spec/sendUpdate.html): el resumen junto al icono es `80% (83/104)` (como mucho 20 caracteres) y la línea del chat es `80% (83/104) en hiragana` (como mucho 50). En romaji → kana se añade ` · inv`. En palabras, kanji o frases la línea dice `en palabras`, `en kanji` o `en frases`, por ejemplo `80% (8/10) en palabras`. No se manda el detalle de cada respuesta. La app no lee los resultados de otras personas ni mantiene un ranking.

## Estructura

```
index.html      Pantalla, plantilla del examen y política de seguridad
core.js         Base de kana, filtros, cola aleatoria y corrección
lexicon.js      Palabras, kanji y sus exámenes de opción
app.js          Interfaz, estado, almacenamiento y envío al chat
styles.css      Estilos
manifest.toml   Nombre y enlace al código para el cliente webxdc
icon.png        Icono de la app (256×256)
scripts/        Comprobaciones de core.js; no van en el .xdc
```

No hay paso de compilación. `core.js` no toca el DOM y también se puede cargar desde Node con `require("./core.js")`.

## Privacidad

La página no hace peticiones de red. La política de contenido solo permite scripts y estilos propios. Lo que escribes se queda en el dispositivo, salvo que pulses compartir: entonces se envía el resumen de esa sesión al chat, no cada respuesta. La pronunciación usa la síntesis de voz del sistema; la app no envía el audio a ningún servidor.

## Licencia

MIT. Ver [LICENSE](LICENSE).
