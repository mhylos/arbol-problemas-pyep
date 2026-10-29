/* ==== Motor de conversión: enunciado negativo (problema) → enunciado positivo (objetivo) ==== */
var Antonimos = (function () {
  'use strict';

  var strip = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var cap = function (s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };

  // ---------- género / número ----------
  var MASC_A = ['dia', 'mapa', 'problema', 'sistema', 'programa', 'clima', 'tema', 'idioma', 'planeta', 'esquema', 'drama', 'poema', 'sofa', 'tranvia', 'agua'];
  var FEM_X = ['mano', 'foto', 'moto', 'radio', 'red', 'ley', 'sed', 'vez', 'luz', 'paz', 'voz', 'cruz', 'salud', 'calle', 'gente', 'noche', 'nube', 'muerte', 'suerte', 'fuente', 'clase', 'base', 'parte', 'sangre', 'leche', 'carne', 'llave', 'torre', 'tarde', 'nieve', 'escasez', 'vejez', 'niñez', 'ninez', 'nariz', 'raiz', 'piel', 'carcel', 'miel', 'sal', 'flor', 'labor', 'imagen', 'region', 'poblacion', 'localidad', 'comunidad', 'red', 'vivienda', 'gestion', 'atencion'];
  function singular(w) {
    if (/(ces)$/.test(w)) return w.slice(0, -3) + 'z';
    if (/(iones|ades|udes|ores|ales|eles|ares|ines|enes)$/.test(w)) return w.slice(0, -2);
    if (/s$/.test(w) && !/(is|us|sis)$/.test(w)) return w.slice(0, -1);
    return w;
  }
  function guessGender(word) {
    var w = strip(word || '');
    if (!w) return 'm';
    var s = singular(w);
    if (FEM_X.indexOf(w) > -1 || FEM_X.indexOf(s) > -1) return 'f';
    if (MASC_A.indexOf(w) > -1 || MASC_A.indexOf(s) > -1) return 'm';
    if (/(a|cion|sion|dad|tad|tud|umbre|ie|sis|itis|ez)$/.test(s)) return 'f';
    return 'm';
  }
  function isPlural(word) { var w = strip(word); return /[^aeiou\s]s$|[aeiou]s$/.test(w) && !/(is|us|sis|tis)$/.test(w) && w.length > 3; }

  function adjForms(lemma) {
    if (lemma.charAt(0) === '=') { var p = lemma.slice(1); return { ms: p, fs: p, mp: p, fp: p }; }
    var sp = lemma.lastIndexOf(' ');
    if (sp > -1) {
      var head = lemma.slice(0, sp + 1), f = adjForms(lemma.slice(sp + 1));
      return { ms: head + f.ms, fs: head + f.fs, mp: head + f.mp, fp: head + f.fp };
    }
    var l = lemma;
    if (/o$/.test(l)) { var r = l.slice(0, -1); return { ms: l, fs: r + 'a', mp: l + 's', fp: r + 'as' }; }
    if (/[aeiou]$/.test(strip(l))) return { ms: l, fs: l, mp: l + 's', fp: l + 's' };
    if (/z$/.test(l)) { var pz = l.slice(0, -1) + 'ces'; return { ms: l, fs: l, mp: pz, fp: pz }; }
    return { ms: l, fs: l, mp: l + 'es', fp: l + 'es' };
  }
  function inflect(lemma, g, n) {
    var f = adjForms(lemma);
    var k = (g === 'f' ? 'f' : 'm') + (n === 'p' ? 'p' : 's');
    return f[k];
  }

  // ---------- léxico ----------
  // Adjetivos: [negativo, positivo, alternativas, tipo]  (tipo q = cuantificador)
  var ADJ = [
    ['alto', 'bajo', [], 'q'], ['bajo', 'alto', [], 'q'],
    ['mayor', 'menor', [], 'q'], ['menor', 'mayor', [], 'q'],
    ['elevado', 'bajo', ['reducido'], 'q'], ['escaso', 'suficiente', ['abundante', 'adecuado'], 'q'],
    ['poco', 'suficiente', ['mayor'], 'q'], ['mucho', 'poco', ['menor'], 'q'],
    ['numeroso', 'poco', ['menor'], 'q'], ['excesivo', 'adecuado', ['moderado', 'razonable'], 'q'],
    ['creciente', 'menor', ['decreciente'], 'q'], ['grande', 'menor', ['reducido'], 'q'],
    ['largo', 'corto', ['breve'], 'q'], ['inferior', 'superior', [], 'q'], ['peor', 'mejor', [], 'q'],
    ['nulo', 'adecuado', ['suficiente'], 'q'], ['insuficiente', 'suficiente', ['adecuado'], 'q'],
    ['inadecuado', 'adecuado', ['apropiado']], ['malo', 'bueno', ['adecuado']],
    ['deficiente', 'suficiente', ['adecuado', 'eficiente']],
    ['tardío', 'oportuno', ['rápido']], ['contaminado', 'no contaminado', ['limpio', 'descontaminado']],
    ['insalubre', 'salubre', ['higiénico']], ['inseguro', 'seguro', []], ['peligroso', 'seguro', []],
    ['riesgoso', 'seguro', []], ['deteriorado', '=en buen estado', ['conservado', 'reparado']],
    ['dañado', '=en buen estado', ['reparado']], ['defectuoso', '=en buen estado', ['adecuado']],
    ['roto', 'reparado', ['=en buen estado']], ['precario', 'adecuado', ['digno', 'estable']],
    ['limitado', 'amplio', ['suficiente']], ['reducido', 'amplio', ['suficiente']],
    ['restringido', 'amplio', ['expedito']], ['saturado', 'descongestionado', ['=con capacidad suficiente']],
    ['congestionado', 'descongestionado', ['fluido']], ['colapsado', 'descongestionado', ['operativo']],
    ['obsoleto', 'moderno', ['actualizado']], ['antiguo', 'moderno', ['renovado']],
    ['desactualizado', 'actualizado', []], ['lento', 'rápido', ['expedito']],
    ['desordenado', 'ordenado', []], ['desorganizado', 'organizado', []], ['descoordinado', 'coordinado', []],
    ['desinformado', 'informado', []], ['desprotegido', 'protegido', []], ['desconectado', 'conectado', []],
    ['desempleado', 'empleado', []], ['desnutrido', 'bien nutrido', []], ['abandonado', '=en uso', ['recuperado', 'cuidado']],
    ['aislado', 'conectado', ['integrado']], ['inaccesible', 'accesible', []], ['irregular', 'regular', ['continuo']],
    ['discontinuo', 'continuo', []], ['intermitente', 'continuo', ['permanente']], ['ineficaz', 'eficaz', []],
    ['ineficiente', 'eficiente', []], ['inestable', 'estable', []], ['insatisfecho', 'satisfecho', []],
    ['inexistente', 'existente', ['disponible']], ['incompleto', 'completo', []], ['informal', 'formal', []],
    ['inoportuno', 'oportuno', []], ['inapropiado', 'apropiado', []], ['incorrecto', 'correcto', []],
    ['ilegal', 'legal', []], ['inequitativo', 'equitativo', []], ['desigual', 'equitativo', ['igualitario']],
    ['vulnerable', 'protegido', ['resiliente']], ['difícil', 'fácil', []], ['complicado', 'fácil', ['expedito']],
    ['costoso', 'económico', ['accesible']], ['caro', 'económico', ['accesible']], ['negativo', 'positivo', []],
    ['pobre', 'bueno', ['adecuado']], ['sucio', 'limpio', []], ['desaseado', 'aseado', []], ['oscuro', 'iluminado', []],
    ['deficitario', 'suficiente', []], ['ausente', 'presente', []], ['inactivo', 'activo', []], ['débil', 'fuerte', ['sólido']],
    ['frágil', 'sólido', ['resistente']], ['frecuente', 'poco frecuente', []], ['desfavorable', 'favorable', []],
    ['desconocido', 'conocido', []], ['improductivo', 'productivo', []], ['ocioso', 'productivo', []],
    ['subutilizado', 'aprovechado', ['bien utilizado']], ['desaprovechado', 'aprovechado', []],
    ['sobreexplotado', 'bien manejado', []], ['erosionado', 'conservado', []], ['degradado', 'recuperado', ['conservado']],
    ['hacinado', '=con espacio suficiente', []], ['desatendido', 'atendido', []], ['postergado', 'priorizado', []],
    ['marginado', 'integrado', ['incluido']], ['excluido', 'incluido', []], ['discriminado', 'incluido', []],
    ['desabastecido', 'abastecido', []], ['interrumpido', 'continuo', []], ['inundable', 'protegido', []],
    ['tóxico', 'no tóxico', []], ['ruidoso', 'tranquilo', []], ['inhabitable', 'habitable', []],
    ['angosto', 'amplio', ['ancho']], ['estrecho', 'amplio', []], ['desprovisto', 'dotado', []], ['inconcluso', 'terminado', []]
  ];
  // Sustantivos: [neg sg, neg pl, pos sg, pos pl, género neg, alternativas, tipo]
  var NOUN = [
    ['aumento', 'aumentos', 'reducción', 'reducciones', 'm', ['disminución'], 'q'],
    ['incremento', 'incrementos', 'disminución', 'disminuciones', 'm', ['reducción'], 'q'],
    ['crecimiento', null, 'disminución', null, 'm', ['reducción'], 'q'],
    ['disminución', 'disminuciones', 'aumento', 'aumentos', 'f', ['incremento'], 'q'],
    ['reducción', 'reducciones', 'aumento', 'aumentos', 'f', ['incremento'], 'q'],
    ['caída', 'caídas', 'aumento', 'aumentos', 'f', ['recuperación'], 'q'],
    ['pérdida', 'pérdidas', 'conservación', 'menores pérdidas', 'f', ['menor pérdida', 'recuperación'], 'q'],
    ['carencia', 'carencias', 'suficiencia', null, 'f', ['disponibilidad'], 'q'],
    ['falta', null, 'disponibilidad', null, 'f', ['existencia', 'suficiencia'], 'q'],
    ['ausencia', null, 'presencia', null, 'f', ['existencia', 'disponibilidad'], 'q'],
    ['escasez', null, 'disponibilidad', null, 'f', ['suficiencia', 'abundancia'], 'q'],
    ['déficit', 'déficits', 'suficiencia', null, 'm', [], 'q'],
    ['exceso', 'excesos', 'nivel adecuado', null, 'm', ['control', 'menor cantidad'], 'q'],
    ['inexistencia', null, 'existencia', null, 'f', [], 'q'],
    ['insuficiencia', null, 'suficiencia', null, 'f', [], 'q'],
    ['deficiencia', 'deficiencias', 'suficiencia', null, 'f', ['eficiencia', 'calidad', 'buen funcionamiento']],
    ['inseguridad', null, 'seguridad', null, 'f', []], ['insatisfacción', null, 'satisfacción', null, 'f', []],
    ['inasistencia', null, 'asistencia', null, 'f', []], ['incumplimiento', 'incumplimientos', 'cumplimiento', null, 'm', []],
    ['inestabilidad', null, 'estabilidad', null, 'f', []], ['ineficiencia', 'ineficiencias', 'eficiencia', null, 'f', []],
    ['ineficacia', null, 'eficacia', null, 'f', []], ['inequidad', 'inequidades', 'equidad', null, 'f', []],
    ['desigualdad', 'desigualdades', 'igualdad', null, 'f', ['equidad']],
    ['desconocimiento', null, 'conocimiento', null, 'm', []], ['desinformación', null, 'información', null, 'f', []],
    ['desempleo', null, 'empleo', null, 'm', []], ['desnutrición', null, 'nutrición adecuada', null, 'f', []],
    ['deserción', null, 'permanencia', null, 'f', ['retención']], ['abandono', null, 'permanencia', null, 'm', ['cuidado', 'uso']],
    ['hacinamiento', null, 'espacio suficiente', null, 'm', ['condiciones adecuadas de habitabilidad']],
    ['congestión', null, 'descongestión', null, 'f', ['fluidez']],
    ['saturación', null, 'descongestión', null, 'f', ['capacidad suficiente']],
    ['contaminación', null, 'descontaminación', null, 'f', ['bajos niveles de contaminación', 'control de la contaminación']],
    ['dificultad', 'dificultades', 'facilidad', 'facilidades', 'f', []],
    ['aislamiento', null, 'conectividad', null, 'm', ['integración']],
    ['deterioro', null, 'buen estado', null, 'm', ['conservación', 'mejoramiento']],
    ['postergación', null, 'priorización', null, 'f', []],
    ['subutilización', null, 'aprovechamiento', null, 'f', ['uso adecuado']],
    ['desaprovechamiento', null, 'aprovechamiento', null, 'm', []],
    ['sobreexplotación', null, 'uso sostenible', null, 'f', []], ['informalidad', null, 'formalidad', null, 'f', []],
    ['inaccesibilidad', null, 'accesibilidad', null, 'f', []], ['discontinuidad', null, 'continuidad', null, 'f', []],
    ['interrupción', 'interrupciones', 'continuidad', null, 'f', []], ['intermitencia', null, 'continuidad', null, 'f', []],
    ['desorden', null, 'orden', null, 'm', []], ['desorganización', null, 'organización', null, 'f', []],
    ['descoordinación', null, 'coordinación', null, 'f', []], ['desarticulación', null, 'articulación', null, 'f', []],
    ['desactualización', null, 'actualización', null, 'f', []], ['desconfianza', null, 'confianza', null, 'f', []],
    ['desprotección', null, 'protección', null, 'f', []], ['desinterés', null, 'interés', null, 'm', []],
    ['descontento', null, 'satisfacción', null, 'm', []], ['desmotivación', null, 'motivación', null, 'f', []],
    ['desabastecimiento', null, 'abastecimiento', null, 'm', []], ['descuido', null, 'cuidado', null, 'm', []],
    ['precariedad', null, 'estabilidad', null, 'f', ['calidad', 'condiciones adecuadas']],
    ['exclusión', null, 'inclusión', null, 'f', []], ['marginación', null, 'integración', null, 'f', ['inclusión']],
    ['discriminación', null, 'inclusión', null, 'f', ['trato igualitario']],
    ['vulnerabilidad', null, 'resiliencia', null, 'f', ['protección']],
    ['obsolescencia', null, 'actualización', null, 'f', ['modernidad']], ['lentitud', null, 'rapidez', null, 'f', ['agilidad']],
    ['ilegalidad', null, 'legalidad', null, 'f', []], ['irregularidad', 'irregularidades', 'regularidad', null, 'f', []],
    ['improductividad', null, 'productividad', null, 'f', []], ['desatención', null, 'atención', null, 'f', []],
    ['sedentarismo', null, 'actividad física', null, 'm', []], ['analfabetismo', null, 'alfabetización', null, 'm', []],
    ['ausentismo', null, 'asistencia', null, 'm', []], ['morosidad', null, 'pago oportuno', null, 'f', []],
    ['delincuencia', null, 'seguridad', null, 'f', ['menor delincuencia']],
    ['pobreza', null, 'menor pobreza', null, 'f', ['superación de la pobreza']],
    ['violencia', null, 'menor violencia', null, 'f', ['convivencia pacífica']]
  ];
  // Verbos y palabras sueltas
  var WORD = [
    ['aumenta', 'disminuye'], ['aumentan', 'disminuyen'], ['disminuye', 'aumenta'], ['disminuyen', 'aumentan'],
    ['empeora', 'mejora'], ['empeoran', 'mejoran'], ['crece', 'disminuye'], ['crecen', 'disminuyen'],
    ['carece', 'dispone'], ['carecen', 'disponen'], ['impide', 'permite'], ['impiden', 'permiten'],
    ['dificulta', 'facilita'], ['dificultan', 'facilitan'], ['faltan', 'hay', ['existen']], ['sin', 'con']
  ];
  // Frases de varias palabras: [negativo, positivo, alternativas]
  var PHRASE = [
    ['no hay', 'hay', ['existe']], ['no existe', 'existe', []], ['no existen', 'existen', []],
    ['hace falta', 'existe', []], ['hacen falta', 'existen', []],
    ['fuera de norma', 'dentro de norma', ['conforme a norma']], ['fuera de servicio', 'en servicio', ['operativo']],
    ['fuera de plazo', 'dentro de plazo', []]
  ];
  // Zonas neutras (no se convierten)
  var NEUTRAL = ['adulto mayor', 'adultos mayores', 'adulta mayor', 'adultas mayores', 'persona mayor', 'personas mayores',
    'menor de edad', 'menores de edad', 'mayor de edad', 'mayores de edad', 'tercera edad', 'baja visión', 'educación media'];
  var CONJ = { y: 1, e: 1, o: 1, u: 1, ni: 1 };
  var NOT_INF = ['lugar', 'hogar', 'bienestar', 'nivel', 'familiar', 'escolar', 'regular', 'popular', 'similar', 'particular', 'titular', 'militar', 'solar', 'polar', 'celular', 'muscular', 'vulgar', 'singular', 'mujer', 'placer', 'poder', 'deber', 'taller', 'alfiler'];
  var PART_IRREG = { hacer: 'hecho', deshacer: 'deshecho', cubrir: 'cubierto', descubrir: 'descubierto', abrir: 'abierto', resolver: 'resuelto', escribir: 'escrito', inscribir: 'inscrito', romper: 'roto', poner: 'puesto', ver: 'visto', volver: 'vuelto', devolver: 'devuelto', decir: 'dicho', morir: 'muerto', imprimir: 'impreso', proveer: 'provisto' };
  function participle(inf) {
    var k = strip(inf);
    if (PART_IRREG[k]) return PART_IRREG[k];
    return inf.slice(0, -2) + (/ar$/.test(k) ? 'ado' : 'ido');
  }
  var ARTICLES = { el: ['el', 'la'], la: ['el', 'la'], un: ['un', 'una'], una: ['un', 'una'], del: ['del', 'de la'], al: ['al', 'a la'], los: ['los', 'las'], las: ['los', 'las'] };
  var POSITIVE_HINT = ['adecuado', 'adecuada', 'suficiente', 'bueno', 'buena', 'buen', 'eficiente', 'mejor', 'oportuno', 'oportuna', 'seguro', 'segura', 'mayor acceso', 'aumento', 'mejoramiento', 'disponibilidad'];

  // ---------- índices ----------
  var LEX = {}; // clave sin tildes → lista de entradas
  function add(key, entry) { var k = strip(key); (LEX[k] = LEX[k] || []).push(entry); }
  ADJ.forEach(function (a) {
    var neg = a[0], pos = a[1], alts = a[2] || [], q = a[3] === 'q';
    var f = adjForms(neg);
    var gendered = /o$/.test(neg);
    [['ms', 'm', 's'], ['fs', 'f', 's'], ['mp', 'm', 'p'], ['fp', 'f', 'p']].forEach(function (x) {
      add(f[x[0]], { kind: q ? 'quant' : 'adj', cls: 'adj', pos: pos, alts: alts, g: gendered ? x[1] : null, n: x[2] });
    });
  });
  NOUN.forEach(function (a) {
    var e = { neg: a[0], posSg: a[2], posPl: a[3], ng: a[4], alts: a[5] || [], kind: a[6] === 'q' ? 'quant' : 'noun', cls: 'noun' };
    add(a[0], Object.assign({ n: 's' }, e));
    if (a[1]) add(a[1], Object.assign({ n: 'p' }, e));
  });
  WORD.forEach(function (a) { add(a[0], { kind: 'adj', cls: 'word', pos: a[1], alts: a[2] || [] }); });
  var PHRASES = PHRASE.map(function (p) { return { words: strip(p[0]).split(' '), pos: p[1], alts: p[2] || [] }; })
    .sort(function (a, b) { return b.words.length - a.words.length; });
  var NEUTRALS = NEUTRAL.map(function (p) { return strip(p).split(' '); }).sort(function (a, b) { return b.length - a.length; });

  // ---------- tokenización ----------
  var WORD_RE = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g;
  function tokenize(text) {
    var toks = [], last = 0, m;
    WORD_RE.lastIndex = 0;
    while ((m = WORD_RE.exec(text))) {
      if (m.index > last) toks.push({ t: text.slice(last, m.index), w: false });
      toks.push({ t: m[0], w: true, k: strip(m[0]) });
      last = m.index + m[0].length;
    }
    if (last < text.length) toks.push({ t: text.slice(last), w: false });
    return toks;
  }

  function isAdjLike(k) {
    if (!k) return false;
    return /(nte|ntes|ble|bles|do|da|dos|das|vo|va|vos|vas|oso|osa|osos|osas|ico|ica|icos|icas|al|ales|ar|ares|ente|ido|ida)$/.test(k);
  }

  // concordancia de conjunciones: y→e, o→u (sobre una lista de tokens {t, w})
  function fixConj(list) {
    var words = [];
    list.forEach(function (o, i) { if (o.w && o.t) words.push(i); });
    for (var a = 0; a < words.length - 1; a++) {
      var cur = list[words[a]], nxt = strip(list[words[a + 1]].t);
      var lc = cur.t.toLowerCase();
      if (lc === 'y' || lc === 'e') {
        var want = /^(i|hi)/.test(nxt) && !/^(hi[aeou])/.test(nxt) ? 'e' : 'y';
        if (lc !== want) { cur.t = want; cur.ch = true; }
      } else if (lc === 'o' || lc === 'u') {
        var w2 = /^(o|ho)/.test(nxt) ? 'u' : 'o';
        if (lc !== w2) { cur.t = w2; cur.ch = true; }
      }
    }
  }

  // ---------- conversión ----------
  function convert(input) {
    var text = (input || '').replace(/\s+/g, ' ').trim();
    if (!text) return { text: '', status: 'vacio', changes: [], variants: [], segments: [], note: '' };
    var toks = tokenize(text);
    var W = []; // índices de palabras en toks
    toks.forEach(function (t, i) { if (t.w) W.push(i); });
    var out = toks.map(function (t) { return { t: t.t, w: t.w, ch: false }; });
    var changes = [];
    var head = null, lastEnd = -1, skipUntil = -1;

    function wordAt(j) { return j >= 0 && j < W.length ? toks[W[j]] : null; }
    function sepBetween(a, b) { // texto entre palabra a y b (índices en W)
      var s = '';
      for (var x = W[a] + 1; x < W[b]; x++) s += toks[x].t;
      return s;
    }
    function onlyConjBetween(a, b) {
      for (var j = a + 1; j < b; j++) if (!CONJ[wordAt(j).k]) return false;
      for (var j2 = a; j2 < b; j2++) if (!/^[\s\/,\-]*$/.test(sepBetween(j2, j2 + 1))) return false;
      return b > a + 1 || /[\/,]/.test(sepBetween(a, b));
    }
    function isProper(j) {
      var t = wordAt(j); if (!t) return false;
      if (!/^[A-ZÁÉÍÓÚÑ]/.test(t.t) || t.t === t.t.toUpperCase()) return false;
      if (j > 0) return true;
      var nx = wordAt(j + 1);
      return !!(nx && /^[A-ZÁÉÍÓÚÑ]/.test(nx.t) && nx.t !== nx.t.toUpperCase() && !LEX[nx.k]);
    }
    function matchSeq(j, seq) {
      for (var x = 0; x < seq.length; x++) {
        var t = wordAt(j + x); if (!t || t.k !== seq[x]) return false;
        if (x > 0 && !/^\s+$/.test(sepBetween(j + x - 1, j + x))) return false;
      }
      return true;
    }

    function cueAt(j) {
      var t = wordAt(j);
      // frases
      for (var p = 0; p < PHRASES.length; p++) {
        if (matchSeq(j, PHRASES[p].words)) {
          var ph = PHRASES[p];
          return { len: ph.words.length, kind: 'adj', render: function (lemma) { return lemma; }, pos: ph.pos, alts: ph.alts };
        }
      }
      var k = t.k, nx = wordAt(j + 1), pv = wordAt(j - 1);
      // "mal" adjetivo apocopado o adverbio
      if (k === 'mal') {
        if (nx && /(ado|ada|ados|adas|ido|ida|idos|idas)$/.test(nx.k)) return { len: 1, kind: 'adj', pos: 'bien', alts: [], render: function (l) { return l; } };
        return { len: 1, kind: 'adj', pos: 'buen', alts: ['adecuado'], render: function (l) { return l === 'buen' ? l : inflect(l, 'm', 's'); } };
      }
      if (k === 'gran') return { len: 1, kind: 'quant', pos: 'menor', alts: ['bajo'], render: function (l) { return inflect(l, guessGender(nx && nx.t), 's'); } };
      // "bajo" como preposición
      if (k === 'bajo' && nx && /^(el|la|los|las|su|sus|un|una|nivel)$/.test(nx.k) && j > 0) return { len: 1, kind: 'adj', pos: 'sobre', alts: [], render: function (l) { return l; } };
      // "poco" adverbio delante de adjetivo → se elimina
      if (k === 'poco' && nx && isAdjLike(nx.k) && !LEX[nx.k]) return { len: 1, kind: 'adj', pos: '', alts: [], drop: true, render: function () { return ''; } };
      // "sin" + infinitivo → participio que concuerda con el sustantivo anterior ("curvas sin señalizar" → "curvas señalizadas")
      if (k === 'sin' && nx && /[aei]r$/.test(nx.k) && nx.k.length > 4 && NOT_INF.indexOf(nx.k) < 0) {
        var pg = pv ? guessGender(pv.t) : 'm', pn = pv && isPlural(pv.t) ? 'p' : 's';
        return { len: 2, kind: 'adj', strong: true, pos: participle(nx.t.toLowerCase()), alts: [], render: function (l) { return inflect(l, pg, pn); } };
      }
      // "no" genérico
      if (k === 'no' && nx) return { len: 1, kind: 'adj', strong: true, pos: '', alts: [], drop: true, render: function () { return ''; } };
      // "falta" como verbo (sin "de")
      if (k === 'falta' && !(nx && nx.k === 'de')) return { len: 1, kind: 'adj', pos: 'hay', alts: ['existe'], render: function (l) { return l; } };
      var list = LEX[k];
      if (!list) return null;
      var e = list[0];
      if (e.cls === 'adj') {
        var prenominal = !!(nx && !CONJ[nx.k] && (j === 0 || (pv && (ARTICLES[pv.k] || CONJ[pv.k] || pv.k === 'muy'))));
        var g = e.g, n = e.n;
        if (!g) {
          // género por contexto: sustantivo siguiente (prenominal) o primera palabra del enunciado
          var noun = prenominal ? nx : wordAt(0);
          if (noun && noun === t) noun = nx;
          g = guessGender(noun && noun.t);
          if (!n || n === 's') n = isPlural(t.t) ? 'p' : 's';
        }
        return {
          len: 1, kind: e.kind, pos: e.pos, alts: e.alts,
          render: function (lemma) {
            var f = inflect(lemma, g, n);
            if (prenominal && g === 'm' && n === 's') { if (f === 'bueno') f = 'buen'; if (f === 'malo') f = 'mal'; }
            return f;
          }
        };
      }
      if (e.cls === 'noun') {
        return {
          len: 1, kind: e.kind, pos: e.n === 'p' && e.posPl ? e.posPl : e.posSg, alts: e.n === 'p' && e.posPl ? [] : e.alts, noun: e,
          render: function (lemma) { return lemma; }
        };
      }
      return { len: 1, kind: e.kind, pos: e.pos, alts: e.alts, render: function (l) { return l; } };
    }

    function apply(j, cue) {
      var first = W[j], lastTok = W[j + cue.len - 1];
      var orig = toks.slice(first, lastTok + 1).map(function (t) { return t.t; }).join('');
      var to = cue.drop ? '' : cue.render(cue.pos);
      var alts = (cue.alts || []).map(function (a) { return cue.render(a); }).filter(function (a) { return a && a !== to; });
      var wasCap = /^[A-ZÁÉÍÓÚÑ]/.test(orig) && orig !== orig.toUpperCase();
      if (wasCap) { to = cap(to); alts = alts.map(cap); }
      // ajuste de artículo por cambio de género del sustantivo
      if (cue.noun) {
        var pg = guessGender(cue.pos.split(' ')[0]);
        var pv = wordAt(j - 1);
        if (pv && ARTICLES[pv.k] && pg !== cue.noun.ng) {
          var pair = ARTICLES[pv.k], nw = pg === 'f' ? pair[1] : pair[0];
          var isCap = /^[A-Z]/.test(pv.t);
          out[W[j - 1]].t = isCap ? cap(nw) : nw; out[W[j - 1]].ch = true;
        }
      }
      out[first].t = to; out[first].ch = true; out[first].w = !!to;
      for (var x = first + 1; x <= lastTok; x++) { out[x].t = ''; out[x].w = false; }
      if (cue.drop && first + 1 < out.length && /^\s+$/.test(out[first + 1].t)) out[first + 1].t = '';
      changes.push({ from: orig, to: to || '(se elimina)', alts: alts, idx: first });
    }

    for (var j = 0; j < W.length; j++) {
      if (j <= skipUntil) continue;
      var neu = null;
      for (var nn = 0; nn < NEUTRALS.length; nn++) if (matchSeq(j, NEUTRALS[nn])) { neu = NEUTRALS[nn]; break; }
      if (neu) { skipUntil = j + neu.length - 1; continue; }
      if (isProper(j)) continue;
      var cue = cueAt(j);
      if (!cue) continue;
      var end = j + cue.len - 1;
      if (!head) { apply(j, cue); head = cue; lastEnd = end; skipUntil = end; continue; }
      var coord = onlyConjBetween(lastEnd, j);
      var afterConj = j > 0 && CONJ[wordAt(j - 1).k];
      var ok = false;
      if (coord) ok = !(cue.kind === 'noun' && head.kind === 'quant' && !head.noun);
      else if (afterConj) ok = cue.kind !== 'noun' || head.kind === 'noun';
      else if (cue.strong && head.kind === 'adj') ok = true;
      if (ok) { apply(j, cue); lastEnd = end; skipUntil = end; }
    }

    var status = 'ok', note = '', result;
    if (!changes.length) {
      // conversión genérica
      var low = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñü]/.test(text) && !isProper(0) ? text.charAt(0).toLowerCase() + text.slice(1) : text;
      var prefix = 'Disminución de ';
      if (/^el\s/i.test(low)) { low = low.replace(/^el\s/i, ''); prefix = 'Disminución del '; }
      result = prefix + low;
      var looksPositive = POSITIVE_HINT.some(function (p) { return (' ' + strip(text) + ' ').indexOf(' ' + strip(p) + ' ') > -1; });
      status = 'revisar';
      note = looksPositive
        ? 'El enunciado parece positivo. En el árbol de problemas debe describir un estado negativo.'
        : 'No se encontró una palabra negativa clara (alto, insuficiente, deficiente…). Se propuso una conversión genérica: revisen si el positivo es inmediato.';
      return { text: result, status: status, changes: [], variants: [], segments: [{ t: result, ch: true }], note: note };
    }

    fixConj(out);
    result = out.map(function (o) { return o.t; }).join('').replace(/\s{2,}/g, ' ').trim();
    if (/^[a-záéíóúñ]/.test(result) && /^[A-ZÁÉÍÓÚÑ]/.test(text)) result = cap(result);
    // segmentos para resaltar
    var segments = [];
    out.forEach(function (o) {
      if (!o.t) return;
      var last = segments[segments.length - 1];
      if (last && last.ch === o.ch) last.t += o.t; else segments.push({ t: o.t, ch: o.ch });
    });
    if (segments.length && segments[0].t !== result.slice(0, segments[0].t.length)) segments = [{ t: result, ch: false }];
    // variantes con las alternativas
    var variants = [];
    var used = changes.map(function (c) { return strip(c.to); });
    changes.forEach(function (c) {
      c.alts.forEach(function (alt) {
        if (variants.length >= 4 || used.indexOf(strip(alt)) > -1) return;
        var vt = tokenize(result.replace(c.to, alt)).map(function (t) { return { t: t.t, w: t.w }; });
        fixConj(vt);
        var v = vt.map(function (t) { return t.t; }).join('');
        if (v !== result && variants.indexOf(v) < 0) variants.push(v);
      });
    });
    return { text: result, status: status, changes: changes, variants: variants, segments: segments, note: note };
  }

  return { convert: convert, guessGender: guessGender, strip: strip };
})();
if (typeof module !== 'undefined') module.exports = Antonimos;
