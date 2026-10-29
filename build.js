// Une src/shell.html + src/engine.js + src/diagrama.js en una sola página:
//  - index.html: archivo independiente (GitHub Pages o doble clic en cualquier navegador)
//  - dist/arbol-problemas.html: versión para publicar como Artifact de Claude (sin <!doctype>, el visor la envuelve)
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const read = f => fs.readFileSync(path.join(dir, 'src', f), 'utf8');
const shell = read('shell.html');
const page = shell
  .replace('/*ENGINE*/', () => read('engine.js'))
  .replace('/*APP*/', () => read('diagrama.js'));
if (/<\/script/i.test(read('engine.js') + read('diagrama.js'))) throw new Error('</script> dentro del JS');
fs.mkdirSync(path.join(dir, 'dist'), { recursive: true });
fs.writeFileSync(path.join(dir, 'dist', 'arbol-problemas.html'), page);
const cut = page.indexOf('<div class="app">');
if (cut < 0) throw new Error('falta <div class="app">');
const standalone = '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  + '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n'
  + page.slice(0, cut) + '</head>\n<body>\n' + page.slice(cut) + '\n</body>\n</html>\n';
fs.writeFileSync(path.join(dir, 'index.html'), standalone);
console.log('ok', page.length, standalone.length);
