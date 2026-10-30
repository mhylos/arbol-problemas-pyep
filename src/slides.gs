/**
 * Árbol PYEP para Google Slides
 * Dibuja en la presentación los árboles copiados desde la app (Archivo → Copiar para Google Slides),
 * con rectángulos y conectores nativos de Slides: se pueden mover, editar y recolorear.
 *
 * Instalación (una vez por presentación):
 *  1. En Google Slides: Extensiones → Apps Script.
 *  2. Borren lo que haya, peguen este código y guarden (Ctrl+S).
 *  3. Vuelvan a la presentación y recárguenla: aparece el menú «Árbol PYEP».
 *
 * @OnlyCurrentDoc  (el script solo puede trabajar en la presentación donde se instala)
 */

function onOpen() {
  SlidesApp.getUi().createMenu('Árbol PYEP').addItem('Pegar árbol…', 'abrirDialogo').addToUi();
}

function abrirDialogo() {
  var html = HtmlService.createHtmlOutput(DIALOGO).setWidth(470).setHeight(340);
  SlidesApp.getUi().showModalDialog(html, 'Pegar árbol desde la app');
}

var DIALOGO = '<!doctype html><html><body style="font-family:Arial,sans-serif;font-size:13px;margin:10px 14px">'
  + '<p style="margin-top:0">Peguen aquí (Ctrl+V) el código copiado en la app con <b>Archivo → Copiar para Google Slides</b>.</p>'
  + '<textarea id="c" style="width:100%;height:160px;box-sizing:border-box;font-family:monospace;font-size:11px" placeholder="ARBOL-SLIDES:…"></textarea>'
  + '<p id="m" style="color:#555;min-height:18px"></p>'
  + '<button id="b" style="padding:7px 14px" onclick="go()">Insertar diapositivas</button>'
  + '<script>'
  + 'function go(){var v=document.getElementById("c").value.trim();var m=document.getElementById("m");if(!v){m.textContent="Primero peguen el código.";return;}'
  + 'var b=document.getElementById("b");b.disabled=true;m.textContent="Dibujando…";'
  + 'google.script.run.withSuccessHandler(function(n){m.textContent="Listo: "+n+(n===1?" diapositiva agregada.":" diapositivas agregadas.");setTimeout(function(){google.script.host.close();},1500);})'
  + '.withFailureHandler(function(e){b.disabled=false;m.textContent="Error: "+e.message;}).insertarArbol(v);}'
  + '</script></body></html>';

function insertarArbol(codigo) {
  var m = String(codigo || '').match(/ARBOL-SLIDES:([\s\S]+)$/);
  if (!m) throw new Error('No se reconoce el código. Cópienlo de nuevo desde la app (Archivo → Copiar para Google Slides).');
  var data;
  try { data = JSON.parse(m[1].trim()); } catch (e) { throw new Error('El código está incompleto. Cópienlo de nuevo desde la app.'); }
  var pres = SlidesApp.getActivePresentation();
  var W = pres.getPageWidth(), H = pres.getPageHeight();
  var arboles = data.arboles || [];
  for (var i = 0; i < arboles.length; i++) dibujarArbol(pres, arboles[i], W, H);
  return arboles.length;
}

function dibujarArbol(pres, arbol, W, H) {
  var slide = pres.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  var M = 14, TOP = 42;
  var titulo = slide.insertTextBox(arbol.titulo || 'Árbol', M, 8, W - 2 * M, 28);
  estilo(titulo, 15, true, '#1F2A2A', SlidesApp.ParagraphAlignment.START);
  var b = arbol.bbox;
  var k = Math.min((W - 2 * M) / b.w, (H - TOP - M) / b.h, 0.9);
  var ox = M + ((W - 2 * M) - b.w * k) / 2, oy = TOP + ((H - TOP - M) - b.h * k) / 2;
  var formas = {};
  for (var i = 0; i < arbol.cajas.length; i++) {
    var c = arbol.cajas[i];
    var s = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, ox + (c.x - b.x) * k, oy + (c.y - b.y) * k, c.w * k, c.h * k);
    s.getFill().setSolidFill(c.fill);
    var borde = s.getBorder();
    borde.getLineFill().setSolidFill(c.stroke);
    borde.setWeight(0.75);
    if (c.t) {
      s.getText().setText(c.t);
      estilo(s, Math.max(5, Math.round(c.size * k * 0.95 * 10) / 10), true, c.ink, SlidesApp.ParagraphAlignment.CENTER);
    }
    s.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);
    formas[c.id] = s;
  }
  for (var j = 0; j < arbol.flechas.length; j++) {
    var f = arbol.flechas[j], A = formas[f.de], B = formas[f.a];
    if (!A || !B) continue;
    var sitios = sitiosDeConexion(A, B);
    var linea = slide.insertLine(SlidesApp.LineCategory.BENT, A.getConnectionSites()[sitios[0]], B.getConnectionSites()[sitios[1]]);
    linea.setEndArrow(SlidesApp.ArrowStyle.FILL_ARROW);
    linea.getLineFill().setSolidFill(f.color);
    linea.setWeight(1.25);
    if (f.dash) linea.setDashStyle(SlidesApp.DashStyle.DASH);
  }
}

// Sitios de conexión de un rectángulo: 0 arriba, 1 izquierda, 2 abajo, 3 derecha.
function sitiosDeConexion(A, B) {
  var aTop = A.getTop(), aBot = aTop + A.getHeight(), bTop = B.getTop(), bBot = bTop + B.getHeight();
  if (bBot <= aTop) return [0, 2];
  if (aBot <= bTop) return [2, 0];
  return B.getLeft() > A.getLeft() ? [3, 1] : [1, 3];
}

function estilo(forma, tamano, negrita, color, alineacion) {
  var texto = forma.getText();
  texto.getTextStyle().setFontFamily('Calibri').setFontSize(tamano).setBold(negrita).setForegroundColor(color);
  texto.getParagraphStyle().setParagraphAlignment(alineacion);
}
