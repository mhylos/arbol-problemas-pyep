(function () {
'use strict';

/* ============================================================
   Utilidades
   ============================================================ */
const $ = (s, r) => (r || document).querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const clone = o => JSON.parse(JSON.stringify(o));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => Antonimos.strip(String(s || '')).replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const arr = v => Array.isArray(v) ? v : [];
const str = v => typeof v === 'string' ? v : '';
const num = v => (typeof v === 'number' && isFinite(v)) ? v : 0;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const f1 = v => Math.round(v * 10) / 10;

const ICON = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5M10 11v5M14 11v5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  tidy: '<rect x="9" y="3" width="6" height="4" rx="1"/><rect x="3" y="17" width="6" height="4" rx="1"/><rect x="15" y="17" width="6" height="4" rx="1"/><path d="M12 7v5M6 17v-5h12v5"/>',
  file: '<path d="M6.5 3.5h7l4 4v13h-11z"/><path d="M13.5 3.5v4h4"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 20V9M7 13.5l5-5 5 5M5 4h14"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.6M12 16.8v.2"/>',
  zin: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3M8.5 11h5M11 8.5v5"/>',
  zout: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3M8.5 11h5"/>',
  fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  spark: '<path d="M11 3.5l1.7 4.8 4.8 1.7-4.8 1.7L11 16.5l-1.7-4.8L4.5 10l4.8-1.7z"/><path d="M18 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  image: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M20.5 16l-5-5-8.5 8"/>',
  slides: '<rect x="3" y="4.5" width="18" height="12.5" rx="1.5"/><path d="M12 17v3M8.5 20h7"/>',
  x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  box: '<rect x="4" y="7" width="16" height="10" rx="1.5"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>',
  wand: '<path d="M4 20l10-10"/><path d="M15 3.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/><path d="M19.5 11l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6"/>',
};
function icon(name) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor');
  s.setAttribute('stroke-width', '1.8'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
  s.setAttribute('aria-hidden', 'true'); s.innerHTML = ICON[name] || '';
  return s;
}
function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) for (const k of Object.keys(props)) {
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'value' || k === 'disabled' || k === 'readOnly') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) { if (c == null || c === false || c === true) continue; el.append(c instanceof Node ? c : document.createTextNode(String(c))); }
  return el;
}

/* ============================================================
   Modelo: cuadros y flechas
   ============================================================ */
const COLLS = ['cuadros', 'flechas'];
const GRID = 10, W_NODE = 170, W_CENTRAL = 380, W_ACT = 160, FS = 13, LH = 17, RFS = 16, RLH = 21, PADX = 10, PADY = 10, VGAP = 56, HGAP = 24;
const DFONT = "'Segoe UI', Calibri, Carlito, 'Helvetica Neue', Arial, sans-serif";
const NF = '600 ' + FS + 'px ' + DFONT, RF = '700 ' + RFS + 'px ' + DFONT;
const snapv = v => Math.round(v / GRID) * GRID;
const defW = t => t === 'central' ? W_CENTRAL : t === 'accion' ? W_ACT : W_NODE;

function emptyProject() { return { meta: { titulo: '', ejemplo: false }, cuadros: {}, flechas: {} }; }
function mkNode(id, tipo, texto, x, y, w) { return { id, tipo, texto: texto || '', x: snapv(x), y: snapv(y), w: w || defW(tipo), obj: null }; }
function freshProject() { const p = emptyProject(); const id = uid(); p.cuadros[id] = mkNode(id, 'central', '', -W_CENTRAL / 2, 0); return p; }
function objOverride(o) { return o && typeof o === 'object' && typeof o.texto === 'string' ? { texto: o.texto, base: str(o.base) } : null; }
function sanitize(raw) {
  if (raw && raw.nodos && !raw.cuadros) return fromOldFormat(raw);
  const p = emptyProject();
  if (!raw || typeof raw !== 'object') return p;
  const m = raw.meta || {};
  p.meta.titulo = str(m.titulo); p.meta.ejemplo = !!m.ejemplo;
  for (const [k, n] of Object.entries(raw.cuadros || {})) {
    if (!n || typeof n !== 'object') continue;
    const id = str(n.id) || k, tipo = ['central', 'normal', 'accion'].indexOf(n.tipo) > -1 ? n.tipo : 'normal';
    p.cuadros[id] = { id, tipo, texto: str(n.texto), x: num(n.x), y: num(n.y), w: clamp(num(n.w) || defW(tipo), 100, 640), obj: objOverride(n.obj) };
  }
  for (const [k, e] of Object.entries(raw.flechas || {})) {
    if (!e || typeof e !== 'object') continue;
    const id = str(e.id) || k;
    if (typeof e.de === 'string' && typeof e.a === 'string' && e.de !== e.a) p.flechas[id] = { id, de: e.de, a: e.a };
  }
  return p;
}
// Proyectos guardados con la versión anterior (lista por pasos)
function fromOldFormat(raw) {
  const p = emptyProject(), m = raw.meta || {};
  p.meta.titulo = str(m.titulo); p.meta.ejemplo = !!m.ejemplo;
  const cid = uid();
  p.cuadros[cid] = mkNode(cid, 'central', str(m.problema), -W_CENTRAL / 2, 0);
  if (m.objCentral) p.cuadros[cid].obj = objOverride(m.objCentral);
  const link = (de, a) => { const id = uid(); p.flechas[id] = { id, de, a }; };
  for (const n of Object.values(raw.nodos || {})) { if (n && n.id) { p.cuadros[n.id] = mkNode(n.id, 'normal', str(n.texto), 0, 0); p.cuadros[n.id].obj = objOverride(n.obj); } }
  for (const n of Object.values(raw.nodos || {})) {
    if (!n || !n.id) continue;
    const par = n.parent && p.cuadros[n.parent] ? n.parent : cid;
    if (n.side === 'causa') link(n.id, par); else link(par, n.id);
    for (const l of arr(n.links)) if (p.cuadros[l]) link(n.id, l);
  }
  for (const a of Object.values(raw.acciones || {})) { if (a && a.id && p.cuadros[a.medio]) { p.cuadros[a.id] = mkNode(a.id, 'accion', str(a.texto), 0, 0); link(a.id, a.medio); } }
  tidy(p);
  return p;
}
function exampleProject() {
  const p = emptyProject();
  p.meta.titulo = 'Ejemplo del curso · Localidad X'; p.meta.ejemplo = true;
  let x = 0;
  const add = (tipo, texto) => { const id = uid(); p.cuadros[id] = mkNode(id, tipo, texto, x, 0); x += 200; return id; };
  const link = (de, a) => { const id = uid(); p.flechas[id] = { id, de, a }; };
  const c = add('central', 'Alta incidencia de enfermedades infecciosas en la localidad X');
  p.cuadros[c].x = -280; p.cuadros[c].w = 560;
  const e1 = add('normal', 'Mayor inasistencia y repitencia escolar'), e11 = add('normal', 'Menor logro educativo'), e111 = add('normal', 'Baja calificación laboral'), e1111 = add('normal', 'Menores ingresos');
  const e2 = add('normal', 'Mayor ausentismo laboral'), e21 = add('normal', 'Menor productividad'), e22 = add('normal', 'Aumento de costos por ausentismo');
  const e3 = add('normal', 'Mayores gastos de los hogares en salud'), e31 = add('normal', 'Postergación de otras necesidades');
  link(c, e1); link(e1, e11); link(e11, e111); link(e111, e1111); link(c, e2); link(e2, e21); link(e2, e22); link(e111, e21); link(c, e3); link(e3, e31);
  const c1 = add('normal', 'Malos hábitos de higiene'), c11 = add('normal', 'Insuficiente educación en higiene');
  const c2 = add('normal', 'Atención de salud insuficiente y/o tardía'), c21 = add('normal', 'Deficiente acceso a centros de salud'), c211 = add('normal', 'Vías de acceso deficientes/inseguras'), c212 = add('normal', 'No hay atención de salud en la localidad');
  const c3 = add('normal', 'Medioambiente contaminado e insalubre'), c31 = add('normal', 'Inadecuada disposición de aguas servidas'), c32 = add('normal', 'Mal manejo de residuos sólidos');
  link(c1, c); link(c11, c1); link(c2, c); link(c21, c2); link(c211, c21); link(c212, c21); link(c3, c); link(c31, c3); link(c32, c3);
  const acts = [[c11, 'Capacitación en higiene personal y manejo de alimentos'], [c211, 'Mejoramiento de caminos en la localidad'], [c212, 'Construcción de centro de salud'], [c31, 'Construcción de sistema de disposición de aguas servidas'], [c32, 'Creación de sistema de recolección y disposición de RSU']];
  for (const [medio, t] of acts) link(add('accion', t), medio);
  tidy(p);
  return p;
}

/* ---------- conversión a positivo ---------- */
const convCache = new Map();
function conv(text) {
  const k = text || ''; let r = convCache.get(k);
  if (!r) { r = Antonimos.convert(k); if (convCache.size > 3000) convCache.clear(); convCache.set(k, r); }
  return r;
}
function objInfo(n) {
  const c = conv(n.texto);
  if (n.obj) return { text: n.obj.texto, status: n.obj.base === n.texto ? 'editado' : 'cambio', conv: c };
  return { text: c.text, status: c.status === 'ok' ? 'auto' : c.status === 'vacio' ? 'vacio' : 'revisar', conv: c };
}
const needsReview = n => n.tipo !== 'accion' && !!n.texto.trim() && ['revisar', 'cambio'].indexOf(objInfo(n).status) > -1;

/* ---------- roles: efectos (arriba del problema) y causas (abajo) ---------- */
function roles(p) {
  const role = new Map(), parent = new Map(), order = [];
  const central = Object.values(p.cuadros).find(n => n.tipo === 'central');
  if (!central) return { role, parent, order, central: null };
  const out = new Map(), inc = new Map();
  for (const e of Object.values(p.flechas)) {
    if (!p.cuadros[e.de] || !p.cuadros[e.a]) continue;
    if (!out.has(e.de)) out.set(e.de, []); out.get(e.de).push(e.a);
    if (!inc.has(e.a)) inc.set(e.a, []); inc.get(e.a).push(e.de);
  }
  role.set(central.id, 'central'); order.push(central.id);
  const walk = (map, r) => {
    const q = [central.id];
    while (q.length) {
      const cur = q.shift();
      for (const nx of (map.get(cur) || [])) {
        if (role.has(nx) || p.cuadros[nx].tipo !== 'normal') continue;
        role.set(nx, r); parent.set(nx, cur); order.push(nx); q.push(nx);
      }
    }
  };
  walk(out, 'efecto'); walk(inc, 'causa');
  // Un cuadro con varias flechas de llegada se ubica sobre la más lejana (camino más largo),
  // así el fin último queda arriba de todo y la causa más profunda abajo de todo.
  for (const [map, r] of [[out, 'efecto'], [inc, 'causa']]) {
    const depth = new Map([[central.id, 0]]);
    for (const id of order) if (role.get(id) === r) depth.set(id, 0);
    for (let pass = 0; pass < order.length; pass++) {
      let changed = false;
      for (const u of [central.id].concat(order.filter(id => role.get(id) === r))) {
        for (const v of (map.get(u) || [])) {
          if (role.get(v) !== r || !depth.has(u)) continue;
          if (depth.get(u) + 1 > depth.get(v)) { depth.set(v, depth.get(u) + 1); parent.set(v, u); changed = true; }
        }
      }
      if (!changed) break;
    }
  }
  return { role, parent, order, central };
}

/* ---------- geometría ---------- */
const mctx = document.createElement('canvas').getContext('2d');
function wrapText(text, maxW, font) {
  mctx.font = font;
  const words = String(text || '').split(/\s+/).filter(Boolean), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (!cur || mctx.measureText(t).width <= maxW) cur = t; else { lines.push(cur); cur = w; } }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}
function displayText(n, v) { return v === 'o' && n.tipo !== 'accion' ? objInfo(n).text : n.texto; }
function placeholder(n, v) {
  if (n.tipo === 'central') return v === 'o' ? 'Objetivo central' : 'Problema central · doble clic para escribir';
  return n.tipo === 'accion' ? 'Acción · doble clic' : 'Doble clic para escribir';
}
function geom(n, v) {
  const w = n.w || defW(n.tipo), central = n.tipo === 'central', t = displayText(n, v);
  const lines = wrapText(t || placeholder(n, v), w - 2 * PADX, central ? RF : NF);
  const hh = central ? Math.max(56, lines.length * RLH + 24) : Math.max(46, lines.length * LH + 2 * PADY);
  return { id: n.id, n, x: n.x, y: n.y, w, h: hh, lines, empty: !t, central };
}
function route(A, B) { // flecha desde A hacia B
  const ar = A.x + A.w, br = B.x + B.w, acx = A.x + A.w / 2, bcx = B.x + B.w / 2;
  const vertical = (y1, y2) => {
    const lo = Math.max(A.x, B.x) + 14, hi = Math.min(ar, br) - 14, narA = A.w <= B.w;
    if (lo <= hi) { const x = clamp(narA ? acx : bcx, lo, hi); return [[x, y1], [x, y2]]; }
    const x1 = narA ? acx : clamp(bcx, A.x + 14, ar - 14), x2 = narA ? clamp(acx, B.x + 14, br - 14) : bcx, my = (y1 + y2) / 2;
    return [[x1, y1], [x1, my], [x2, my], [x2, y2]];
  };
  if (B.y + B.h <= A.y - 6) return vertical(A.y, B.y + B.h);
  if (A.y + A.h <= B.y - 6) return vertical(A.y + A.h, B.y);
  const ay = A.y + A.h / 2, by = B.y + B.h / 2;
  if (bcx >= acx) { const mx = (ar + B.x) / 2; return [[ar, ay], [mx, ay], [mx, by], [B.x, by]]; }
  const mx = (A.x + br) / 2; return [[A.x, ay], [mx, ay], [mx, by], [br, by]];
}

/* ---------- ordenar automáticamente ---------- */
function tidy(p) {
  const { role, parent, central } = roles(p);
  if (!central) return;
  const H = n => Math.max(geom(n, 'p').h, geom(n, 'o').h);
  const kids = new Map();
  for (const [id, par] of parent) { if (!kids.has(par)) kids.set(par, []); kids.get(par).push(p.cuadros[id]); }
  for (const list of kids.values()) list.sort((a, b) => (a.x + a.w / 2) - (b.x + b.w / 2));
  const width = new Map(), pos = new Map();
  const measure = n => { const ch = kids.get(n.id) || []; let w = n.w; if (ch.length) w = Math.max(w, ch.reduce((a, c) => a + measure(c), 0) + HGAP * (ch.length - 1)); width.set(n.id, w); return w; };
  const place = (n, left, depth) => {
    const ch = kids.get(n.id) || [], w = width.get(n.id); let cx;
    if (ch.length) {
      const sum = ch.reduce((a, c) => a + width.get(c.id), 0) + HGAP * (ch.length - 1);
      let x = left + (w - sum) / 2; const cs = [];
      for (const c of ch) { place(c, x, depth + 1); cs.push(pos.get(c.id).cx); x += width.get(c.id) + HGAP; }
      cx = (cs[0] + cs[cs.length - 1]) / 2;
    } else cx = left + w / 2;
    pos.set(n.id, { cx, depth });
  };
  const cx0 = central.x + central.w / 2;
  for (const r of ['efecto', 'causa']) {
    const roots = (kids.get(central.id) || []).filter(n => role.get(n.id) === r);
    const tot = roots.reduce((a, n) => a + measure(n), 0) + HGAP * Math.max(0, roots.length - 1);
    let x = cx0 - tot / 2;
    for (const n of roots) { place(n, x, 1); x += width.get(n.id) + HGAP; }
  }
  const rowH = { efecto: [], causa: [] };
  for (const [id, ps] of pos) { const r = role.get(id); rowH[r][ps.depth] = Math.max(rowH[r][ps.depth] || 0, H(p.cuadros[id])); }
  const eTop = [], cTop = [];
  let yb = central.y - VGAP;
  for (let d = 1; d < rowH.efecto.length; d++) { if (!rowH.efecto[d]) continue; eTop[d] = yb - rowH.efecto[d]; yb = eTop[d] - VGAP; }
  let yt = central.y + H(central) + VGAP;
  for (let d = 1; d < rowH.causa.length; d++) { if (!rowH.causa[d]) continue; cTop[d] = yt; yt += rowH.causa[d] + VGAP; }
  for (const [id, ps] of pos) {
    const n = p.cuadros[id];
    n.x = snapv(ps.cx - n.w / 2);
    n.y = snapv(role.get(id) === 'efecto' ? eTop[ps.depth] + (rowH.efecto[ps.depth] - H(n)) : cTop[ps.depth]);
  }
  // acciones debajo de sus medios
  const target = a => { const e = Object.values(p.flechas).find(f => f.de === a.id && p.cuadros[f.a] && p.cuadros[f.a].tipo !== 'accion'); return e ? p.cuadros[e.a] : null; };
  const acts = Object.values(p.cuadros).filter(n => n.tipo === 'accion').map(a => ({ a, m: target(a) })).filter(x => x.m)
    .sort((u, v) => (u.m.x + u.m.w / 2) - (v.m.x + v.m.w / 2));
  let prevR = -Infinity, want = 0, got = 0;
  const top = Math.max(yt, ...Object.values(p.cuadros).filter(n => n.tipo !== 'accion').map(n => n.y + H(n) + VGAP));
  const xs = acts.map(({ a, m }) => { const x = Math.max(m.x + m.w / 2 - a.w / 2, prevR + 16); want += m.x + m.w / 2 - a.w / 2; got += x; prevR = x + a.w; return x; });
  const off = acts.length ? (want - got) / acts.length : 0;
  acts.forEach(({ a }, i) => { a.x = snapv(xs[i] + off); a.y = snapv(top); });
}

/* ============================================================
   Estado
   ============================================================ */
let P = freshProject();
let view = 'p';
const cam = { x: 0, y: 0, k: 1 };
let sel = { nodes: new Set(), edge: null };
let drag = null, editing = null, spaceDown = false, menuOpen = false, rafPending = false, lastDown = { id: null, t: 0 };
const touches = new Map();
const caps = { inViewer: !!(window.claude && window.claude.use), downloads: null, sample: null };
const LS_KEY = 'arbol-pyep-diagrama-v1', LS_OLD = 'arbol-pyep-proyecto-v1';
// Trabajo en grupo en vivo fuera de Claude (GitHub Pages): pegar aquí la configuración web de un proyecto de Firebase (ver README).
const FIREBASE = {
  apiKey: 'AIzaSyDoiZt4ExEjOn98nuRlkrMBHGn0_w3QKj0',
  authDomain: 'arbol-pyep.firebaseapp.com',
  projectId: 'arbol-pyep',
  storageBucket: 'arbol-pyep.firebasestorage.app',
  messagingSenderId: '372126917549',
  appId: '1:372126917549:web:0569116d9e3f185262f724',
};
const FB_SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
const PUBLIC_URL = 'https://mhylos.github.io/arbol-problemas-pyep/';
const svg = $('#canvas'), stage = $('#stage');
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

/* ============================================================
   Guardado: este navegador o proyecto compartido del grupo
   ============================================================ */
const Sync = {
  mode: 'local', db: null, ro: false, ready: true, state: 'local', metaExists: false,
  timers: new Map(), inflight: new Set(), again: new Set(), queue: [], active: 0, busy: new Set(),
  key(coll, id) { return coll === 'proyecto' ? 'proyecto/meta' : coll + '/' + id; },
  pending(key) { return this.busy.has(key) || this.timers.has(key) || this.inflight.has(key) || this.again.has(key) || this.queue.indexOf(key) > -1; },
  touch(coll, id) {
    if (this.ro) return;
    if (this.mode === 'local') { saveLocalSoon(); return; }
    const key = this.key(coll, id);
    clearTimeout(this.timers.get(key));
    this.timers.set(key, setTimeout(() => { this.timers.delete(key); this.enqueue(key); }, 500));
    setSyncState('saving');
  },
  enqueue(key) {
    if (this.inflight.has(key)) { this.again.add(key); return; }
    if (this.queue.indexOf(key) < 0) this.queue.push(key);
    this.pump();
  },
  pump() {
    while (this.active < 4 && this.queue.length) {
      const key = this.queue.shift();
      this.active++; this.inflight.add(key);
      this.write(key).catch(e => this.onError(e)).finally(() => {
        this.active--; this.inflight.delete(key);
        if (this.again.has(key)) { this.again.delete(key); this.enqueue(key); }
        this.pump();
        if (!this.timers.size && !this.inflight.size && !this.queue.length && this.state !== 'error' && !this.ro) setSyncState('saved');
      });
    }
  },
  async write(key) {
    const ref = this.db.doc(key);
    if (key === 'proyecto/meta') { await ref.set(clone(P.meta)); this.metaExists = true; return; }
    const i = key.indexOf('/'), coll = key.slice(0, i), id = key.slice(i + 1);
    const data = P[coll][id];
    if (data) await ref.set(clone(data)); else await ref.delete();
  },
  onError(e) {
    const code = e && e.code;
    if (code === 'invalid_argument' || code === 'not_granted' || code === 'revoked' || code === 'permission-denied') { setReadOnly(true); return; }
    if (code === 'quota_exceeded' || code === 'resource-exhausted') toast('El proyecto compartido llegó a su límite de tamaño.');
    setSyncState('error');
  },
};
const saveLocalSoon = debounce(() => { if (Sync.mode === 'local') setSyncState(lsSet(LS_KEY, JSON.stringify(P)) ? 'local' : 'error'); }, 300);
const touch = (c, id) => Sync.touch(c, id);
function setSyncState(s) { Sync.state = s; paintDot(); }
function setReadOnly(v) { Sync.ro = v; document.body.classList.toggle('ro', v); paintDot(); render(); }
// seed: diagrama que se sube si el proyecto compartido está vacío (null = no subir nada; sin indicar = el de este navegador)
function startShared(db, canWrite, seed) {
  Sync.mode = 'shared'; Sync.db = db; Sync.ready = false;
  P = emptyProject(); render();
  let left = COLLS.length + 1;
  const first = () => {
    if (--left > 0) return;
    Sync.ready = true; setSyncState('saved');
    if (!Object.keys(P.cuadros).length && canWrite !== false && seed !== null) {
      const local = seed || loadLocal();
      const useLocal = !!(local && (seed || Object.keys(local.cuadros).length > 1 && !local.meta.ejemplo));
      replaceProject(useLocal ? local : freshProject(), { noSnap: true });
      if (useLocal) toast('Se subió al proyecto compartido el diagrama que tenían en este navegador.');
    }
    fit(); render();
  };
  const remote = debounce(() => render(), 80);
  for (const c of COLLS) {
    let isFirst = true;
    db.collection(c).onSnapshot(snap => {
      for (const ch of snap.docChanges()) {
        const id = ch.doc.id;
        if (Sync.pending(c + '/' + id)) continue;
        if (ch.type === 'removed') delete P[c][id];
        else { const one = sanitize({ [c]: { [id]: Object.assign({}, ch.doc.data(), { id }) } }); if (one[c][id]) P[c][id] = one[c][id]; }
      }
      if (isFirst) { isFirst = false; first(); } else remote();
    }, err => Sync.onError(err));
  }
  let mf = true;
  db.doc('proyecto/meta').onSnapshot(s => {
    Sync.metaExists = s.exists;
    if (s.exists && !Sync.pending('proyecto/meta')) { P.meta = sanitize({ meta: s.data() }).meta; paintTitle(); }
    if (mf) { mf = false; first(); } else remote();
  }, err => Sync.onError(err));
  setTimeout(() => { if (!Sync.ready) { Sync.ready = true; render(); } }, 8000);
}

/* ---------- grupo en vivo con Firebase: la sala va en el enlace (#sala=…) y hace de contraseña ---------- */
const roomId = () => (location.hash.match(/^#sala=([\w-]{16,64})$/) || [])[1];
const roomLink = () => (/^https?:$/.test(location.protocol) ? location.href.split('#')[0] : PUBLIC_URL) + location.hash;
async function joinRoom(sala, upload) {
  Sync.ready = false; render();
  try { await loadScript(FB_SDK + 'firebase-app-compat.js'); await loadScript(FB_SDK + 'firebase-firestore-compat.js'); }
  catch (e) { Sync.ready = true; render(); toast('No se pudo conectar con el grupo (se necesita internet). Por ahora se guarda solo en este navegador.'); return; }
  const fs = firebase.initializeApp(FIREBASE).firestore(), base = 'salas/' + sala + '/';
  // solo quien crea la sala sube su diagrama: quien se une a una sala aún vacía espera a que llegue
  startShared({ collection: c => fs.collection(base + c), doc: k => fs.doc(base + k) }, true, upload ? clone(P) : null);
}
async function copyRoomLink() { if (await copyText(roomLink())) toast('Enlace copiado. Envíenlo al grupo: quien lo abra edita este mismo diagrama en vivo.'); }
function createRoom() {
  history.replaceState(null, '', '#sala=' + b64url(crypto.getRandomValues(new Uint8Array(16))));
  copyRoomLink();
  joinRoom(roomId(), true);
}
function leaveRoom() {
  if (Sync.state === 'saving') { toast('Esperen a que se guarde el último cambio.'); return; }
  history.replaceState(null, '', location.pathname + location.search);
  location.reload();
}

/* ---------- deshacer: solo lo que cambió cada persona ---------- */
const undoStack = [];
let editSnap = null;
function diffKeys(a, b) {
  const keys = [];
  for (const c of COLLS) {
    const ids = new Set(Object.keys(a[c] || {}).concat(Object.keys(b[c] || {})));
    for (const id of ids) if (JSON.stringify(a[c][id]) !== JSON.stringify(b[c][id])) keys.push(c + '/' + id);
  }
  if (JSON.stringify(a.meta) !== JSON.stringify(b.meta)) keys.push('meta/');
  return keys;
}
function pushUndo(before) {
  const entry = { before, keys: null };
  undoStack.push(entry); if (undoStack.length > 80) undoStack.shift();
  setTimeout(() => { entry.keys = diffKeys(JSON.parse(before), P); }, 0);
}
function snap() { pushUndo(JSON.stringify(P)); editSnap = null; }
function armEdit() { editSnap = JSON.stringify(P); }
function beginEdit() { if (editSnap) { pushUndo(editSnap); editSnap = null; } }
function undo() {
  if (Sync.ro) return;
  commitEdit();
  while (undoStack.length) {
    const e = undoStack.pop(), before = JSON.parse(e.before), keys = e.keys || diffKeys(before, P);
    if (!keys.length) continue;
    const next = clone(P);
    for (const k of keys) {
      const i = k.indexOf('/'), c = k.slice(0, i), id = k.slice(i + 1);
      if (c === 'meta') next.meta = before.meta;
      else if (before[c][id]) next[c][id] = before[c][id]; else delete next[c][id];
    }
    replaceProject(next, { noSnap: true });
    for (const id of Array.from(sel.nodes)) if (!P.cuadros[id]) sel.nodes.delete(id);
    if (sel.edge && !P.flechas[sel.edge]) sel.edge = null;
    render();
    return;
  }
  toast('No hay más cambios para deshacer.');
}
function replaceProject(next, opts) {
  if (!(opts && opts.noSnap)) snap();
  next = sanitize(next);
  const prev = P; P = next;
  if (Sync.mode === 'shared') {
    for (const c of COLLS) {
      const ids = new Set(Object.keys(prev[c]).concat(Object.keys(next[c])));
      for (const id of ids) if (JSON.stringify(prev[c][id]) !== JSON.stringify(next[c][id])) touch(c, id);
    }
    if (JSON.stringify(prev.meta) !== JSON.stringify(next.meta)) touch('proyecto');
  } else saveLocalSoon();
  paintTitle();
}

/* ============================================================
   Dibujo
   ============================================================ */
function livePalette() {
  const cs = getComputedStyle(document.documentElement), g = v => cs.getPropertyValue(v).trim();
  return { pbNode: g('--pb-node'), pbStroke: g('--pb-stroke'), pbInk: g('--pb-ink'), pbRoot: g('--pb-root'), pbRootInk: g('--pb-root-ink'), obNode: g('--ob-node'), obStroke: g('--ob-stroke'), obInk: g('--ob-ink'), obRoot: g('--ob-root'), obRootInk: g('--ob-root-ink'), acNode: g('--ac-node'), acStroke: g('--ac-stroke'), acInk: g('--ac-ink'), edge: g('--edge'), sel: g('--diag-sel'), warn: g('--diag-warn'), handle: g('--handle'), grid: g('--grid') };
}
const EXPORT_PAL = { pbNode: '#DCE7F6', pbStroke: '#7095CF', pbInk: '#1B4A97', pbRoot: '#2F5DA8', pbRootInk: '#FFFFFF', obNode: '#DDF0D5', obStroke: '#79AE69', obInk: '#245A1C', obRoot: '#1F5A24', obRootInk: '#FFFFFF', acNode: '#FCE6CF', acStroke: '#DE9A52', acInk: '#7E440A', edge: '#5D88CC', sel: '#E07A10', warn: '#C98A00', handle: '#1F5FBF', grid: '#C9D3CF' };
function visibleNodes(v) { return Object.values(P.cuadros).filter(n => v === 'o' || n.tipo !== 'accion'); }
function buildG(v) { const G = new Map(); for (const n of visibleNodes(v)) G.set(n.id, geom(n, v)); return G; }
function visibleEdges(G) { return Object.values(P.flechas).filter(e => G.has(e.de) && G.has(e.a)); }
function nodeStyle(g, v, pal, clean) {
  const n = g.n, o = v === 'o';
  if (n.tipo === 'accion') return { fill: pal.acNode, stroke: pal.acStroke, ink: pal.acInk };
  if (n.tipo === 'central') return { fill: o ? pal.obRoot : pal.pbRoot, stroke: o ? pal.obRoot : pal.pbRoot, ink: o ? pal.obRootInk : pal.pbRootInk, warn: o && !clean && needsReview(n) };
  return { fill: o ? pal.obNode : pal.pbNode, stroke: o ? pal.obStroke : pal.pbStroke, ink: o ? pal.obInk : pal.pbInk, warn: o && !clean && needsReview(n) };
}
function markers(pal, pre) {
  return '<marker id="' + pre + '-ah" viewBox="0 0 10 10" refX="9.4" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse"><path d="M0,0.6 L10,5 L0,9.4 z" fill="' + pal.edge + '"/></marker>'
    + '<marker id="' + pre + '-ac" viewBox="0 0 10 10" refX="9.4" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0.6 L10,5 L0,9.4 z" fill="' + pal.acStroke + '"/></marker>'
    + '<marker id="' + pre + '-as" viewBox="0 0 10 10" refX="9.4" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0.6 L10,5 L0,9.4 z" fill="' + pal.sel + '"/></marker>';
}
function diagramMarkup(G, v, pal, opts) {
  opts = opts || {};
  const pre = opts.prefix || 'c';
  let s = '';
  for (const e of visibleEdges(G)) {
    const A = G.get(e.de), B = G.get(e.a), act = A.n.tipo === 'accion' || B.n.tipo === 'accion';
    const d = 'M' + route(A, B).map(p => f1(p[0]) + ',' + f1(p[1])).join(' L');
    const isSel = !opts.clean && sel.edge === e.id;
    const col = isSel ? pal.sel : act ? pal.acStroke : pal.edge;
    s += '<g data-e="' + e.id + '">' + (opts.clean ? '' : '<path d="' + d + '" fill="none" stroke="transparent" stroke-width="14"/>')
      + '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + (isSel ? 2.6 : 1.6) + '"' + (act ? ' stroke-dasharray="5 4"' : '') + ' marker-end="url(#' + pre + '-' + (isSel ? 'as' : act ? 'ac' : 'ah') + ')"/></g>';
  }
  for (const g of G.values()) {
    const st = nodeStyle(g, v, pal, opts.clean), isSel = !opts.clean && sel.nodes.has(g.id), hide = opts.editingId === g.id;
    s += '<g data-n="' + g.id + '">';
    if (isSel) s += '<rect x="' + f1(g.x - 4) + '" y="' + f1(g.y - 4) + '" width="' + f1(g.w + 8) + '" height="' + f1(g.h + 8) + '" rx="6" fill="none" stroke="' + pal.sel + '" stroke-width="2.2"/>';
    s += '<rect x="' + f1(g.x) + '" y="' + f1(g.y) + '" width="' + f1(g.w) + '" height="' + f1(g.h) + '" rx="3" fill="' + st.fill + '" stroke="' + (st.warn ? pal.warn : st.stroke) + '" stroke-width="' + (st.warn ? 2.2 : 1.2) + '"' + (st.warn ? ' stroke-dasharray="6 3"' : '') + '/>';
    if (!hide) {
      const fs = g.central ? RFS : FS, lh = g.central ? RLH : LH, y0 = g.y + (g.h - g.lines.length * lh) / 2 + lh * 0.76;
      s += '<text text-anchor="middle" font-size="' + fs + '" font-weight="' + (g.central ? 700 : 600) + '" fill="' + st.ink + '"' + (g.empty ? ' font-style="italic" opacity=".62"' : '') + '>';
      g.lines.forEach((ln, i) => { s += '<tspan x="' + f1(g.x + g.w / 2) + '" y="' + f1(y0 + i * lh) + '">' + esc(ln) + '</tspan>'; });
      s += '</text>';
    }
    s += '</g>';
  }
  return s;
}
function handleMarkup(g, pal) {
  const k = clamp(1 / cam.k, 0.7, 2.2), out = [];
  const plus = (kind, cx, cy, title) => '<g data-h="' + kind + '" data-id="' + g.id + '" transform="translate(' + f1(cx) + ' ' + f1(cy) + ') scale(' + (Math.round(k * 100) / 100) + ')"><title>' + esc(title) + '</title><circle r="11" fill="' + pal.handle + '"/><path d="M-5 0h10M0 -5v10" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>';
  if (view === 'p') {
    out.push(plus('up', g.x + g.w / 2, g.y - 20 * k, 'Agregar efecto arriba (o arrastrar hasta otro cuadro para conectar)'));
    out.push(plus('down', g.x + g.w / 2, g.y + g.h + 20 * k, 'Agregar causa abajo (o arrastrar hasta otro cuadro para conectar)'));
  } else if (g.n.tipo !== 'accion') out.push(plus('down', g.x + g.w / 2, g.y + g.h + 20 * k, 'Agregar una acción para este medio'));
  out.push('<g data-h="resize" data-id="' + g.id + '"><title>Cambiar el ancho</title><rect x="' + f1(g.x + g.w - 4) + '" y="' + f1(g.y + g.h / 2 - 9) + '" width="8" height="18" rx="2" fill="' + pal.handle + '"/></g>');
  return out.join('');
}

function requestRender() { if (rafPending) return; rafPending = true; requestAnimationFrame(() => { rafPending = false; render(); }); }
function render() {
  const pal = livePalette(), G = buildG(view);
  let s = '<defs>' + markers(pal, 'c') + '<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="translate(' + f1(cam.x) + ' ' + f1(cam.y) + ') scale(' + cam.k + ')"><circle cx="1" cy="1" r="1" fill="' + pal.grid + '"/></pattern></defs>';
  s += '<rect width="100%" height="100%" fill="url(#grid)"/>';
  s += '<g transform="translate(' + f1(cam.x) + ' ' + f1(cam.y) + ') scale(' + cam.k + ')">';
  s += diagramMarkup(G, view, pal, { prefix: 'c', editingId: editing && editing.id });
  if (drag && drag.type === 'connect' && drag.moved) {
    const g = G.get(drag.id);
    if (g) { const sx = g.x + g.w / 2, sy = drag.dir === 'up' ? g.y : g.y + g.h; s += '<path d="M' + f1(sx) + ',' + f1(sy) + ' L' + f1(drag.cur.x) + ',' + f1(drag.cur.y) + '" stroke="' + pal.handle + '" stroke-width="2" stroke-dasharray="5 4" fill="none" pointer-events="none"/>'; }
  }
  if (drag && drag.type === 'band') {
    const x = Math.min(drag.start.x, drag.cur.x), y = Math.min(drag.start.y, drag.cur.y);
    s += '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(Math.abs(drag.cur.x - drag.start.x)) + '" height="' + f1(Math.abs(drag.cur.y - drag.start.y)) + '" fill="' + pal.handle + '" fill-opacity=".08" stroke="' + pal.handle + '" stroke-dasharray="4 3" pointer-events="none"/>';
  }
  if (!Sync.ro && sel.nodes.size === 1 && !editing && !(drag && drag.moved)) { const g = G.get(Array.from(sel.nodes)[0]); if (g) s += handleMarkup(g, pal); }
  s += '</g>';
  svg.innerHTML = s;
  positionEditor(G);
  paintStrip(); paintTabs(); paintTools(); paintZoom(); paintBanner(); paintDot();
  const ld = $('#loading');
  if (!Sync.ready && !ld) stage.append(h('div', { class: 'loading', id: 'loading' }, 'Cargando el proyecto del grupo…'));
  if (Sync.ready && ld) ld.remove();
}

/* ============================================================
   Cámara
   ============================================================ */
function toWorld(e) { const r = svg.getBoundingClientRect(); return { x: (e.clientX - r.left - cam.x) / cam.k, y: (e.clientY - r.top - cam.y) / cam.k }; }
function bbox(G) {
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const g of G.values()) { x1 = Math.min(x1, g.x); y1 = Math.min(y1, g.y); x2 = Math.max(x2, g.x + g.w); y2 = Math.max(y2, g.y + g.h); }
  return isFinite(x1) ? { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } : { x: -200, y: -100, w: 400, h: 200 };
}
function fit() {
  const r = svg.getBoundingClientRect(); if (!r.width) return;
  const b = bbox(buildG(view)), padB = 70, padT = P.meta.ejemplo ? 50 : 0;
  cam.k = clamp(Math.min((r.width - 60) / b.w, (r.height - 60 - padB - padT) / b.h), 0.2, 1.3);
  cam.x = r.width / 2 - (b.x + b.w / 2) * cam.k;
  cam.y = padT + (r.height - padB - padT) / 2 - (b.y + b.h / 2) * cam.k + 10;
}
function zoomAt(factor, sx, sy) {
  const r = svg.getBoundingClientRect();
  if (sx == null) { sx = r.width / 2; sy = r.height / 2; }
  const k2 = clamp(cam.k * factor, 0.15, 3);
  const wx = (sx - cam.x) / cam.k, wy = (sy - cam.y) / cam.k;
  cam.k = k2; cam.x = sx - wx * k2; cam.y = sy - wy * k2;
  requestRender();
}
function ensureVisible(id) {
  const n = P.cuadros[id]; if (!n) return;
  const g = geom(n, view), r = svg.getBoundingClientRect();
  const sx = g.x * cam.k + cam.x, sy = g.y * cam.k + cam.y, sw = g.w * cam.k, sh = g.h * cam.k;
  if (sx < 20) cam.x += 20 - sx; else if (sx + sw > r.width - 20) cam.x -= sx + sw - r.width + 20;
  if (sy < 30) cam.y += 30 - sy; else if (sy + sh > r.height - 90) cam.y -= sy + sh - r.height + 90;
}
function viewCenter() { const r = svg.getBoundingClientRect(); return { x: (r.width / 2 - cam.x) / cam.k, y: (r.height / 2 - 40 - cam.y) / cam.k }; }

/* ============================================================
   Acciones de edición
   ============================================================ */
function overlaps(x, y, w, hh) {
  for (const g of buildG(view).values()) if (x < g.x + g.w + 10 && x + w + 10 > g.x && y < g.y + g.h + 10 && y + hh + 10 > g.y) return true;
  return false;
}
function findFree(x, y, w, hh) {
  for (let i = 0; i < 14; i++) { const dx = (i % 2 ? 1 : -1) * Math.ceil(i / 2) * (w + 20); if (!overlaps(x + dx, y, w, hh)) return x + dx; }
  return x;
}
function addBox() {
  if (Sync.ro) return;
  commitEdit();
  const hasCentral = Object.values(P.cuadros).some(n => n.tipo === 'central');
  const tipo = view === 'o' ? 'accion' : hasCentral ? 'normal' : 'central';
  const w = defW(tipo), c = viewCenter();
  snap();
  const id = uid(), x = findFree(snapv(c.x - w / 2), snapv(c.y - 23), w, 46);
  P.cuadros[id] = mkNode(id, tipo, '', x, c.y - 23, w); touch('cuadros', id);
  sel = { nodes: new Set([id]), edge: null };
  startEdit(id);
}
function quickAdd(id, dir, at) {
  const src = P.cuadros[id]; if (!src || Sync.ro) return;
  commitEdit();
  const tipo = view === 'o' ? 'accion' : 'normal', w = defW(tipo), gs = geom(src, view);
  let x, y;
  if (at) { x = at.x - w / 2; y = at.y - 23; }
  else { x = src.x + src.w / 2 - w / 2; y = dir === 'up' ? src.y - VGAP - 46 : src.y + gs.h + VGAP; x = findFree(snapv(x), snapv(y), w, 46); }
  snap();
  const nid = uid(); P.cuadros[nid] = mkNode(nid, tipo, '', x, y, w); touch('cuadros', nid);
  const eid = uid(); P.flechas[eid] = dir === 'up' ? { id: eid, de: id, a: nid } : { id: eid, de: nid, a: id }; touch('flechas', eid);
  sel = { nodes: new Set([nid]), edge: null };
  ensureVisible(nid);
  startEdit(nid);
}
function connect(srcId, dir, targetId) {
  if (srcId === targetId || Sync.ro) return;
  const de = dir === 'up' ? srcId : targetId, a = dir === 'up' ? targetId : srcId;
  if (view === 'o' && P.cuadros[de].tipo !== 'accion') { toast('En el árbol de objetivos solo se conectan acciones a sus medios. Las demás flechas se dibujan en el árbol de problemas.'); render(); return; }
  if (Object.values(P.flechas).some(e => (e.de === de && e.a === a) || (e.de === a && e.a === de))) { toast('Esos cuadros ya están conectados.'); render(); return; }
  snap();
  const id = uid(); P.flechas[id] = { id, de, a }; touch('flechas', id);
  sel = { nodes: new Set(), edge: id };
  render();
}
function deleteSelection() {
  if (Sync.ro) return;
  const nodes = Array.from(sel.nodes).filter(id => P.cuadros[id]);
  let edges = sel.edge && P.flechas[sel.edge] ? [sel.edge] : [];
  if (!nodes.length && !edges.length) return;
  if (view === 'o') {
    if (nodes.some(id => P.cuadros[id].tipo !== 'accion')) { toast('Los cuadros se agregan y eliminan en el árbol de problemas. Aquí solo se eliminan acciones.'); return; }
    if (edges.some(id => P.cuadros[P.flechas[id].de].tipo !== 'accion' && P.cuadros[P.flechas[id].a].tipo !== 'accion')) { toast('Esa flecha se elimina en el árbol de problemas.'); return; }
  }
  snap();
  const dead = new Set(nodes);
  // las acciones que quedan sin medio también se eliminan
  for (const n of Object.values(P.cuadros)) if (n.tipo === 'accion' && !dead.has(n.id)) {
    const links = Object.values(P.flechas).filter(e => e.de === n.id || e.a === n.id);
    if (links.length && links.every(e => dead.has(e.de) || dead.has(e.a))) dead.add(n.id);
  }
  for (const e of Object.values(P.flechas)) if (dead.has(e.de) || dead.has(e.a)) edges.push(e.id);
  edges = Array.from(new Set(edges));
  for (const id of dead) { delete P.cuadros[id]; touch('cuadros', id); }
  for (const id of edges) { delete P.flechas[id]; touch('flechas', id); }
  sel = { nodes: new Set(), edge: null };
  render();
  toast(dead.size ? 'Se eliminó ' + (dead.size === 1 ? '1 cuadro.' : dead.size + ' cuadros.') : 'Se eliminó la flecha.', { action: 'Deshacer', fn: undo });
}
function doTidy() {
  if (Sync.ro) return;
  commitEdit();
  snap();
  const before = clone(P.cuadros);
  tidy(P);
  for (const id of Object.keys(P.cuadros)) { const a = before[id], b = P.cuadros[id]; if (a.x !== b.x || a.y !== b.y) touch('cuadros', id); }
  const { role } = roles(P);
  const unc = Object.values(P.cuadros).filter(n => n.tipo === 'normal' && !role.has(n.id)).length;
  fit(); render();
  if (unc) toast(unc === 1 ? 'Hay 1 cuadro sin conectar: conéctenlo con una flecha para ubicarlo en el árbol.' : 'Hay ' + unc + ' cuadros sin conectar: conéctenlos con flechas para ubicarlos en el árbol.');
}
function setObjText(id, v) {
  const n = P.cuadros[id]; if (!n) return;
  n.obj = v === conv(n.texto).text ? null : { texto: v, base: n.texto };
  touch('cuadros', id);
}

/* ---------- edición de texto sobre el cuadro ---------- */
function startEdit(id) {
  if (Sync.ro) return;
  const n = P.cuadros[id]; if (!n) return;
  commitEdit();
  sel = { nodes: new Set([id]), edge: null };
  armEdit();
  const isObj = view === 'o' && n.tipo !== 'accion';
  const ta = h('textarea', { class: 'editor', value: isObj ? objInfo(n).text : n.texto, 'aria-label': 'Texto del cuadro', spellcheck: 'true' });
  ta.addEventListener('input', () => {
    beginEdit();
    const v = ta.value.replace(/\s*\n\s*/g, ' ');
    if (!P.cuadros[id]) return;
    if (isObj) setObjText(id, v); else { P.cuadros[id].texto = v; touch('cuadros', id); }
    requestRender();
  });
  ta.addEventListener('keydown', e => {
    e.stopPropagation();
    if ((e.key === 'Enter' && !e.shiftKey && !e.isComposing) || e.key === 'Escape') { e.preventDefault(); commitEdit(); }
  });
  ta.addEventListener('blur', () => commitEdit());
  editing = { id, ta };
  stage.append(ta);
  render();
  ta.focus(); ta.select();
}
function commitEdit() {
  if (!editing) return;
  const ta = editing.ta; editing = null; ta.remove();
  requestRender();
}
function positionEditor(G) {
  if (!editing) return;
  const g = G.get(editing.id); if (!g) { commitEdit(); return; }
  const st = nodeStyle(g, view, livePalette()), k = cam.k, lh = (g.central ? RLH : LH) * k;
  Object.assign(editing.ta.style, {
    left: (g.x * k + cam.x) + 'px', top: (g.y * k + cam.y) + 'px', width: (g.w * k) + 'px', height: (g.h * k) + 'px',
    fontSize: ((g.central ? RFS : FS) * k) + 'px', lineHeight: lh + 'px', fontWeight: g.central ? '700' : '600',
    padding: Math.max(1, (g.h * k - g.lines.length * lh) / 2 - 2) + 'px ' + Math.max(2, PADX * k - 2) + 'px 0', background: st.fill, color: st.ink,
  });
}

/* ============================================================
   Puntero y teclado
   ============================================================ */
svg.addEventListener('pointerdown', e => {
  e.preventDefault(); // evita que el navegador robe el foco del cuadro que se está editando
  const ae = document.activeElement;
  if (ae && ae !== document.body && (!editing || ae !== editing.ta) && ae.blur) ae.blur();
  if (menuOpen) closeMenu();
  if (editing) commitEdit();
  const pt = toWorld(e);
  const hEl = e.target.closest('[data-h]'), nEl = e.target.closest('[data-n]'), eEl = e.target.closest('[data-e]');
  try { svg.setPointerCapture(e.pointerId); } catch (x) { /* sin captura */ }
  if (e.pointerType === 'touch') {
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 2) { const [a, b] = Array.from(touches.values()); drag = { type: 'pinch', d: Math.hypot(a.x - b.x, a.y - b.y) || 1, k: cam.k }; return; }
  }
  if (e.button === 1 || spaceDown) { drag = { type: 'pan', sx: e.clientX, sy: e.clientY, cx: cam.x, cy: cam.y, moved: false }; return; }
  if (hEl && !Sync.ro) {
    const id = hEl.getAttribute('data-id'), kind = hEl.getAttribute('data-h');
    if (kind === 'resize') { drag = { type: 'resize', id, start: pt, w: P.cuadros[id].w, moved: false }; return; }
    drag = { type: 'connect', id, dir: kind, start: pt, cur: pt, moved: false }; return;
  }
  if (nEl) {
    const id = nEl.getAttribute('data-n'), now = Date.now();
    if (lastDown.id === id && now - lastDown.t < 420 && !e.shiftKey) { lastDown = { id: null, t: 0 }; drag = null; setTimeout(() => startEdit(id), 0); return; }
    lastDown = { id, t: now };
    if (e.shiftKey) { if (sel.nodes.has(id)) sel.nodes.delete(id); else sel.nodes.add(id); }
    else if (!sel.nodes.has(id)) sel.nodes = new Set([id]);
    sel.edge = null;
    const orig = new Map(); for (const sid of sel.nodes) if (P.cuadros[sid]) orig.set(sid, { x: P.cuadros[sid].x, y: P.cuadros[sid].y });
    drag = { type: 'move', id, start: pt, orig, moved: false, sx: e.clientX, sy: e.clientY };
    render(); return;
  }
  if (eEl) { sel = { nodes: new Set(), edge: eEl.getAttribute('data-e') }; drag = null; render(); return; }
  if (e.shiftKey) { drag = { type: 'band', start: pt, cur: pt, moved: false }; return; }
  sel = { nodes: new Set(), edge: null };
  drag = { type: 'pan', sx: e.clientX, sy: e.clientY, cx: cam.x, cy: cam.y, moved: false };
  render();
});
svg.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch' && touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (!drag) return;
  if (drag.type === 'pinch') {
    if (touches.size < 2) return;
    const [a, b] = Array.from(touches.values()), d = Math.hypot(a.x - b.x, a.y - b.y), r = svg.getBoundingClientRect();
    zoomAt((drag.k * d / drag.d) / cam.k, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top); return;
  }
  if (drag.type === 'pan') { cam.x = drag.cx + e.clientX - drag.sx; cam.y = drag.cy + e.clientY - drag.sy; drag.moved = true; requestRender(); return; }
  const pt = toWorld(e);
  if (drag.type === 'move') {
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4) return;
    if (Sync.ro) return;
    if (!drag.moved) { drag.moved = true; snap(); for (const id of drag.orig.keys()) Sync.busy.add('cuadros/' + id); }
    const dx = pt.x - drag.start.x, dy = pt.y - drag.start.y;
    for (const [id, o] of drag.orig) { const n = P.cuadros[id]; if (n) { n.x = snapv(o.x + dx); n.y = snapv(o.y + dy); } }
    requestRender(); return;
  }
  if (drag.type === 'resize') {
    if (!drag.moved) { drag.moved = true; snap(); Sync.busy.add('cuadros/' + drag.id); }
    const n = P.cuadros[drag.id]; if (n) n.w = clamp(snapv(drag.w + pt.x - drag.start.x), 100, 640);
    requestRender(); return;
  }
  if (drag.type === 'connect' || drag.type === 'band') {
    drag.cur = pt;
    if (Math.hypot(pt.x - drag.start.x, pt.y - drag.start.y) * cam.k > 5) drag.moved = true;
    requestRender();
  }
});
function endPointer(e) {
  touches.delete(e.pointerId);
  const d = drag; drag = null;
  if (!d) return;
  if (d.type === 'pinch') { touches.clear(); return; }
  if (d.type === 'move' || d.type === 'resize') {
    const ids = d.type === 'move' ? Array.from(d.orig.keys()) : [d.id];
    for (const id of ids) Sync.busy.delete('cuadros/' + id);
    if (d.moved) for (const id of ids) touch('cuadros', id);
    render(); return;
  }
  if (d.type === 'connect') {
    if (e.type === 'pointercancel') { render(); return; }
    if (!d.moved) { setTimeout(() => quickAdd(d.id, d.dir), 0); return; }
    const t = document.elementFromPoint(e.clientX, e.clientY), tn = t && t.closest ? t.closest('[data-n]') : null;
    if (tn && tn.getAttribute('data-n') !== d.id) connect(d.id, d.dir, tn.getAttribute('data-n'));
    else if (!tn) { const at = toWorld(e); setTimeout(() => quickAdd(d.id, d.dir, at), 0); }
    else render();
    return;
  }
  if (d.type === 'band') {
    const x1 = Math.min(d.start.x, d.cur.x), x2 = Math.max(d.start.x, d.cur.x), y1 = Math.min(d.start.y, d.cur.y), y2 = Math.max(d.start.y, d.cur.y);
    for (const g of buildG(view).values()) if (g.x < x2 && g.x + g.w > x1 && g.y < y2 && g.y + g.h > y1) sel.nodes.add(g.id);
    render(); return;
  }
  render();
}
svg.addEventListener('pointerup', endPointer);
svg.addEventListener('pointercancel', endPointer);
svg.addEventListener('dblclick', e => { const nEl = e.target.closest('[data-n]'); if (nEl && !editing) startEdit(nEl.getAttribute('data-n')); });
svg.addEventListener('wheel', e => {
  e.preventDefault();
  if (editing) commitEdit();
  const r = svg.getBoundingClientRect();
  if (e.ctrlKey || e.metaKey) zoomAt(Math.exp(-e.deltaY * 0.0022), e.clientX - r.left, e.clientY - r.top);
  else { cam.x -= e.deltaX; cam.y -= e.deltaY; requestRender(); }
}, { passive: false });
window.addEventListener('resize', () => requestRender());

document.addEventListener('keydown', e => {
  const t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
  if ($('#modal-root').children.length) return;
  if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); undo(); return; }
  if (typing) return;
  if (e.key === ' ' && !spaceDown) { spaceDown = true; svg.style.cursor = 'grab'; e.preventDefault(); return; }
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelection(); return; }
  if ((e.key === 'Enter' || e.key === 'F2') && sel.nodes.size === 1) { e.preventDefault(); startEdit(Array.from(sel.nodes)[0]); return; }
  if (e.key === 'Escape') { sel = { nodes: new Set(), edge: null }; closeMenu(); render(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); sel = { nodes: new Set(buildG(view).keys()), edge: null }; render(); return; }
  const arrows = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
  if (arrows[e.key] && sel.nodes.size && !Sync.ro) {
    e.preventDefault(); snap();
    const st = GRID * (e.shiftKey ? 5 : 1);
    for (const id of sel.nodes) { const n = P.cuadros[id]; if (n) { n.x += arrows[e.key][0] * st; n.y += arrows[e.key][1] * st; touch('cuadros', id); } }
    render();
  }
});
document.addEventListener('keyup', e => { if (e.key === ' ') { spaceDown = false; svg.style.cursor = ''; } });

/* ============================================================
   Barra, franja de información, zoom
   ============================================================ */
function tb(label, ic, onclick, opts) {
  opts = opts || {};
  return h('button', { type: 'button', class: 'tb ' + (opts.cls || ''), title: opts.title || label, 'aria-label': opts.title || label, id: opts.id || null, onclick }, icon(ic), h('span', { class: 'lbl' }, label));
}
function buildBar() {
  const bar = $('#bar');
  const logo = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  logo.setAttribute('viewBox', '0 0 32 32'); logo.setAttribute('aria-hidden', 'true');
  logo.innerHTML = '<rect x="3" y="3" width="11" height="7" rx="1.5" fill="var(--prob)" opacity=".35"/><rect x="18" y="3" width="11" height="7" rx="1.5" fill="var(--prob)" opacity=".35"/><rect x="4" y="13" width="24" height="6" rx="1.5" fill="var(--prob)"/><rect x="3" y="22" width="11" height="7" rx="1.5" fill="var(--obj)" opacity=".55"/><rect x="18" y="22" width="11" height="7" rx="1.5" fill="var(--obj)" opacity=".55"/><path d="M8.5 10v3M23.5 10v3M8.5 19v3M23.5 19v3" stroke="var(--ink)" stroke-width="1.4"/>';
  const title = h('input', { class: 'title', id: 'titulo', placeholder: 'Nombre del proyecto', 'aria-label': 'Nombre del proyecto', value: P.meta.titulo,
    onfocus: armEdit, oninput: e => { if (Sync.ro) return; beginEdit(); P.meta.titulo = e.target.value; touch('proyecto'); } });
  const tabs = h('div', { class: 'tabs', role: 'tablist', id: 'tabs' });
  const fileMenu = h('div', { class: 'menu-wrap' }, tb('Archivo', 'file', e => { e.stopPropagation(); toggleMenu(); }, { id: 'file-btn', title: 'Archivo: nuevo, ejemplo, exportar, guardar' }));
  bar.append(h('div', { class: 'brand' }, logo), title, tabs, h('div', { class: 'spacer' }),
    h('div', { class: 'tools' },
      tb('Cuadro', 'plus', addBox, { cls: 'w', id: 'add-btn', title: 'Agregar un cuadro' }),
      tb('Ordenar', 'tidy', doTidy, { cls: 'w', title: 'Ordenar el árbol automáticamente' }),
      tb('Mejorar con IA', 'wand', improveDialog, { cls: 'ai w', title: 'Mejorar el árbol de problemas con una IA, según las guías del SNI y lo que ustedes le pidan' }),
      tb('Transformar con IA', 'spark', aiDialog, { cls: 'ai w', title: 'Transformar el árbol de problemas en objetivos con una IA (ChatGPT, Claude, Gemini)' }),
      h('span', { class: 'sep' }),
      tb('Editar', 'edit', () => { if (sel.nodes.size === 1) startEdit(Array.from(sel.nodes)[0]); }, { cls: 'w', id: 'edit-btn', title: 'Editar el texto (doble clic o Enter)' }),
      tb('Eliminar', 'trash', deleteSelection, { cls: 'w', id: 'del-btn', title: 'Eliminar lo seleccionado (Supr)' }),
      tb('Deshacer', 'undo', undo, { cls: 'w', id: 'undo-btn', title: 'Deshacer (Ctrl+Z)' }),
      h('span', { class: 'sep' }),
      fileMenu,
      tb('Ayuda', 'help', showHelp, { title: 'Cómo se usa' }),
      h('span', { class: 'dot', id: 'sync-dot' })));
  document.addEventListener('click', e => { if (menuOpen && !e.target.closest('.menu-wrap')) closeMenu(); });
}
function paintTitle() { const t = $('#titulo'); if (t && document.activeElement !== t) t.value = P.meta.titulo; }
function paintTabs() {
  const tabs = $('#tabs'); if (!tabs) return;
  const rev = Object.values(P.cuadros).filter(needsReview).length;
  tabs.innerHTML = '';
  tabs.append(
    h('button', { type: 'button', role: 'tab', class: view === 'p' ? 'on' : '', 'aria-selected': view === 'p' ? 'true' : 'false', onclick: () => setView('p') }, h('span', { class: 'sw', style: 'background:var(--pb-root)' }), 'Problemas'),
    h('button', { type: 'button', role: 'tab', class: view === 'o' ? 'on' : '', 'aria-selected': view === 'o' ? 'true' : 'false', onclick: () => setView('o') }, h('span', { class: 'sw', style: 'background:var(--ob-root)' }), 'Objetivos', rev ? h('span', { class: 'badge', title: rev + ' para revisar' }, rev) : null));
}
function paintTools() {
  const one = sel.nodes.size === 1, any = sel.nodes.size > 0 || !!sel.edge;
  const e = $('#edit-btn'), d = $('#del-btn'), u = $('#undo-btn'), a = $('#add-btn');
  if (e) e.disabled = !one;
  if (d) d.disabled = !any;
  if (u) u.disabled = !undoStack.length;
  if (a) { const l = a.querySelector('.lbl'); if (l) l.textContent = view === 'o' ? 'Acción' : 'Cuadro'; a.title = view === 'o' ? 'Agregar una acción' : 'Agregar un cuadro'; }
}
function paintDot() {
  const d = $('#sync-dot'); if (!d) return;
  const m = { local: ['ok', 'Guardado en este navegador'], saving: ['busy', 'Guardando…'], saved: ['ok', 'Proyecto compartido del grupo: al día'], error: ['err', 'No se pudo guardar el último cambio'] };
  const [cls, t] = Sync.ro ? ['', 'Solo lectura'] : !Sync.ready ? ['busy', 'Cargando…'] : (m[Sync.state] || m.local);
  d.className = 'dot ' + cls; d.title = t; d.setAttribute('aria-label', t);
}
function paintZoom() {
  const z = $('#zoom');
  if (!z.children.length) {
    const b = (ic, t, fn) => h('button', { type: 'button', title: t, 'aria-label': t, onclick: fn }, icon(ic));
    z.append(b('zout', 'Alejar', () => zoomAt(0.8)), h('span', { class: 'pct', id: 'pct' }), b('zin', 'Acercar', () => zoomAt(1.25)), b('fit', 'Ver todo', () => { fit(); render(); }));
  }
  $('#pct').textContent = Math.round(cam.k * 100) + '%';
}
function paintBanner() {
  let b = $('#banner');
  if (!P.meta.ejemplo || Sync.ro) { if (b) b.remove(); return; }
  if (b) return;
  b = h('div', { class: 'banner', id: 'banner' }, h('span', null, 'Ejemplo del curso. Explórenlo y luego empiecen el suyo.'), h('button', { type: 'button', onclick: newDiagram }, 'Nuevo diagrama'));
  stage.append(b);
}
function setView(v) { commitEdit(); view = v; sel = { nodes: new Set(), edge: null }; render(); }
function centralWarnings(t) {
  const n = norm(t), w = [];
  if (/^(falta|faltan|hace falta|carencia|ausencia|inexistencia|no hay|no existe|no existen)\b|\b(hace falta|falta de|carencia de|ausencia de)\b/.test(n)) w.push('Parece la «falta de» una solución. Describan el estado negativo que vive la población (ej.: «hace falta una posta» → «alta tasa de enfermedades»).');
  if (/^(construir|construccion|mejorar|mejoramiento|implementar|crear|habilitar|instalar|ampliar|reparar|aumentar|disminuir|reducir|realizar|desarrollar|fortalecer|capacitar|dotar|adquirir|reponer)\b/.test(n)) w.push('Empieza como una acción. Un problema describe una situación negativa, no lo que hay que hacer.');
  return w;
}
function paintStrip() {
  const el = $('#strip'); el.innerHTML = '';
  if ((drag && drag.moved) || editing) return;
  const one = sel.nodes.size === 1 ? P.cuadros[Array.from(sel.nodes)[0]] : null;
  const chip = (label, fn, title) => h('button', { type: 'button', class: 'chip w', title: title || null, onclick: fn }, label);
  if (one && one.tipo === 'accion') { el.append(h('span', { class: 'muted' }, 'Acción · doble clic para escribir · arrastra el cuadro para moverlo')); return; }
  if (one && view === 'p') {
    const t = one.texto.trim();
    if (!t) { el.append(h('span', { class: 'muted' }, 'Doble clic (o Enter) para escribir. Usa ⊕ arriba para un efecto y ⊕ abajo para una causa.')); return; }
    el.append(h('span', { class: 'muted' }, 'En el árbol de objetivos:'), h('b', { class: 'obj' }, objInfo(one).text));
    if (needsReview(one)) el.append(h('span', { class: 'warn' }, '· revisar'));
    if (one.tipo === 'central') for (const w of centralWarnings(t)) el.append(h('div', { class: 'warn', style: 'flex-basis:100%' }, w));
    return;
  }
  if (one && view === 'o') {
    const oi = objInfo(one);
    if (!one.texto.trim()) { el.append(h('span', { class: 'muted' }, 'Este cuadro aún no tiene texto en el árbol de problemas.')); return; }
    const stl = { auto: ['ok', 'Automático'], editado: ['ok', 'Editado'], revisar: ['wn', 'Revisar'], cambio: ['wn', 'El problema cambió'] }[oi.status] || ['', ''];
    el.append(h('span', { class: 'muted' }, 'Desde:'), h('b', { class: 'prob' }, one.texto), h('span', { class: 'chip st ' + stl[0] }, stl[1]));
    const alts = (oi.status === 'cambio' ? [oi.conv.text] : []).concat(oi.conv.variants || []).filter((v, i, a) => v && v !== oi.text && a.indexOf(v) === i).slice(0, 3);
    for (const v of alts) el.append(chip(v, () => { snap(); setObjText(one.id, v); render(); }, 'Usar esta versión'));
    if (one.obj) el.append(chip('↺ Automático', () => { snap(); one.obj = null; touch('cuadros', one.id); render(); }, 'Volver a la conversión automática'));
    if (oi.status === 'revisar') el.append(h('div', { class: 'warn', style: 'flex-basis:100%' }, 'Sin positivo inmediato: quizás el enunciado del problema está mal planteado. Corríjanlo con doble clic o usen «Transformar con IA».'));
    return;
  }
  if (sel.edge) { el.append(h('span', { class: 'muted' }, 'Flecha seleccionada · Supr para eliminarla')); return; }
  if (sel.nodes.size > 1) { el.append(h('span', { class: 'muted' }, sel.nodes.size + ' cuadros seleccionados · arrástrenlos juntos o Supr para eliminarlos')); return; }
  if (view === 'p') {
    const empty = !Object.values(P.cuadros).some(n => n.texto.trim());
    if (empty) el.append(h('span', null, h('b', null, 'Para empezar: '), 'doble clic en el cuadro azul y escriban el problema central. Luego selecciónenlo y usen ⊕ arriba (efectos) y ⊕ abajo (causas).'), chip('Ver el ejemplo del curso', loadExample));
    else el.append(h('span', { class: 'muted' }, 'Doble clic: escribir · ⊕ arriba: efecto · ⊕ abajo: causa · arrastra un ⊕ hasta otro cuadro para conectar · Shift+arrastrar: seleccionar varios'));
  } else {
    const rev = Object.values(P.cuadros).filter(needsReview);
    el.append(h('span', { class: 'muted' }, 'Se genera solo a partir del árbol de problemas. Doble clic en un cuadro para ajustar su texto · ⊕ abajo de un medio: acción.'));
    if (rev.length) el.append(chip(rev.length + ' para revisar', () => { sel = { nodes: new Set([rev[0].id]), edge: null }; ensureVisible(rev[0].id); render(); }));
  }
}
function toggleMenu() { if (menuOpen) closeMenu(); else openMenu(); }
function closeMenu() { const m = $('#file-menu'); if (m) m.remove(); menuOpen = false; }
function openMenu() {
  menuOpen = true;
  const item = (ic, label, fn, cls) => h('button', { type: 'button', class: cls || null, onclick: () => { closeMenu(); fn(); } }, icon(ic), label);
  const m = h('div', { class: 'menu', id: 'file-menu', role: 'menu' },
    item('box', 'Nuevo diagrama', newDiagram, 'w'),
    item('book', 'Cargar el ejemplo del curso', loadExample, 'w'),
    h('hr'),
    item('image', 'Imagen del árbol de problemas (PNG)', () => exportPNG('p')),
    item('image', 'Imagen del árbol de objetivos (PNG)', () => exportPNG('o')),
    item('slides', 'Presentación editable (PowerPoint)', exportPPTX),
    item('slides', 'Copiar para Google Slides (editable)', slidesDialog),
    h('hr'),
    item('download', 'Guardar proyecto (.json)', exportJSON),
    item('upload', 'Abrir proyecto o pegar código', importDialog, 'w'),
    item('copy', 'Copiar código para compartir', copyShareCode),
    FIREBASE && !caps.inViewer && (Sync.mode === 'shared'
      ? [h('hr'), item('users', 'Copiar enlace del grupo', copyRoomLink), item('x', 'Salir del grupo (volver a este navegador)', leaveRoom)]
      : Sync.ready && [h('hr'), item('users', 'Trabajar en grupo en vivo', createRoom, 'w')]));
  $('#file-btn').parentNode.append(m);
}

/* ============================================================
   Proyecto: nuevo, ejemplo, abrir, guardar, exportar
   ============================================================ */
function hasWork() { return Object.values(P.cuadros).some(n => n.texto.trim()) && !P.meta.ejemplo; }
function newDiagram() {
  const go = () => { replaceProject(freshProject()); sel = { nodes: new Set(), edge: null }; fit(); render(); toast('Diagrama nuevo.', { action: 'Deshacer', fn: undo }); };
  if (hasWork()) confirmBox('¿Empezar un diagrama nuevo?', 'Se borrará el diagrama actual' + (Sync.mode === 'shared' ? ' para todo el grupo' : '') + '. Pueden deshacerlo justo después.', 'Empezar de nuevo', go); else go();
}
function loadExample() {
  const go = () => { replaceProject(exampleProject()); sel = { nodes: new Set(), edge: null }; fit(); render(); toast('Se cargó el ejemplo del curso.', { action: 'Deshacer', fn: undo }); };
  if (hasWork()) confirmBox('¿Cargar el ejemplo?', 'Reemplazará el diagrama actual' + (Sync.mode === 'shared' ? ' para todo el grupo' : '') + '. Pueden deshacerlo justo después.', 'Cargar ejemplo', go); else go();
}
function slug(s) { return (Antonimos.strip(s || 'proyecto').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'proyecto').slice(0, 40); }
async function saveFile(filename, data, mime) {
  if (caps.downloads) {
    try { await caps.downloads.save({ filename, data }); toast('Archivo listo: ' + filename); }
    catch (e) { if (e && e.code === 'declined') return; toast('No se pudo descargar en esta vista. Usen «Copiar código para compartir».'); }
    return;
  }
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'application/octet-stream' });
  const url = URL.createObjectURL(blob), a = h('a', { href: url, download: filename, style: 'display:none' });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
function exportSVGString(v) {
  const G = buildG(v), b = bbox(G), M = 30, top = 50;
  const title = (v === 'p' ? 'Árbol de problemas' : 'Árbol de objetivos') + (P.meta.titulo ? ' · ' + P.meta.titulo : '');
  const W = Math.ceil(b.w + 2 * M), H = Math.ceil(b.h + 2 * M + top);
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" font-family="' + esc(DFONT) + '">'
    + '<rect width="' + W + '" height="' + H + '" fill="#FFFFFF"/><defs>' + markers(EXPORT_PAL, 'x') + '</defs>'
    + '<text x="' + M + '" y="34" font-size="20" font-weight="700" fill="#1F2A2A">' + esc(title) + '</text>'
    + '<g transform="translate(' + f1(M - b.x) + ' ' + f1(M + top - b.y) + ')">' + diagramMarkup(G, v, EXPORT_PAL, { prefix: 'x', clean: true }) + '</g></svg>';
}
async function svgToCanvas(svgStr, scale) {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('svg')); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr); });
  const c = document.createElement('canvas'); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
  const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
  return c;
}
async function exportPNG(v) {
  try {
    const c = await svgToCanvas(exportSVGString(v), 2);
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    await saveFile((v === 'p' ? 'arbol-de-problemas-' : 'arbol-de-objetivos-') + slug(P.meta.titulo) + '.png', blob, 'image/png');
  } catch (e) { console.error(e); toast('No se pudo generar la imagen.'); }
}
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('script')); document.head.append(s); }); }
async function exportPPTX() {
  toast('Preparando la presentación…');
  try { if (!window.PptxGenJS) await loadScript('https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js'); }
  catch (e) { toast('No se pudo cargar el generador de PowerPoint (se necesita internet). Usen las imágenes PNG.'); return; }
  try {
    const pptx = new window.PptxGenJS(), FONT = 'Calibri', X = c => c.replace('#', ''), pal = EXPORT_PAL;
    pptx.layout = 'LAYOUT_WIDE'; pptx.title = P.meta.titulo || 'Árbol de problemas';
    for (const v of ['p', 'o']) {
      const G = buildG(v), b = bbox(G), s = pptx.addSlide();
      s.addText((v === 'p' ? 'Árbol de problemas' : 'Árbol de objetivos') + (P.meta.titulo ? ' · ' + P.meta.titulo : ''), { x: 0.4, y: 0.2, w: 12.5, h: 0.5, fontFace: FONT, fontSize: 22, bold: true, color: '1F2A2A' });
      const aX = 0.3, aY = 0.85, aW = 12.73, aH = 6.45, k = Math.min(aW / b.w, aH / b.h, 0.0115);
      const ox = aX + (aW - b.w * k) / 2, oy = aY + (aH - b.h * k) / 2, px = x => ox + (x - b.x) * k, py = y => oy + (y - b.y) * k;
      for (const e of visibleEdges(G)) {
        const A = G.get(e.de), B = G.get(e.a), act = A.n.tipo === 'accion' || B.n.tipo === 'accion', pts = route(A, B);
        for (let i = 0; i < pts.length - 1; i++) {
          const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
          if (Math.abs(x1 - x2) < 0.01 && Math.abs(y1 - y2) < 0.01) continue;
          s.addShape(pptx.ShapeType.line, { x: px(Math.min(x1, x2)), y: py(Math.min(y1, y2)), w: Math.max(0.001, Math.abs(x2 - x1) * k), h: Math.max(0.001, Math.abs(y2 - y1) * k), flipH: x2 < x1, flipV: y2 < y1,
            line: { color: X(act ? pal.acStroke : pal.edge), width: 1.25, dashType: act ? 'dash' : 'solid', endArrowType: i === pts.length - 2 ? 'triangle' : undefined } });
        }
      }
      for (const g of G.values()) {
        const st = nodeStyle(g, v, pal, true);
        s.addText(g.lines.join(' '), { shape: pptx.ShapeType.rect, x: px(g.x), y: py(g.y), w: g.w * k, h: g.h * k, fill: { color: X(st.fill) }, line: { color: X(st.stroke), width: 0.75 }, color: X(st.ink), fontFace: FONT, fontSize: clamp((g.central ? RFS : FS) * k * 72, 6, 18), bold: true, align: 'center', valign: 'middle', margin: 2 });
      }
    }
    const { role, order } = roles(P);
    const rows = [[{ text: 'Árbol de problemas', options: { bold: true, color: 'FFFFFF', fill: { color: '2F5DA8' } } }, { text: 'Árbol de objetivos', options: { bold: true, color: 'FFFFFF', fill: { color: '1F5A24' } } }]];
    const lab = { central: ['Problema central', 'Objetivo central'], efecto: ['Efecto', 'Fin'], causa: ['Causa', 'Medio'] };
    for (const id of order) { const n = P.cuadros[id], r = lab[role.get(id)]; if (n.texto.trim()) rows.push([{ text: r[0] + ': ' + n.texto }, { text: r[1] + ': ' + objInfo(n).text }]); }
    for (let i = 1; i < rows.length; i += 14) {
      const s = pptx.addSlide();
      s.addText('Del problema al objetivo', { x: 0.5, y: 0.3, w: 12, h: 0.6, fontFace: FONT, fontSize: 24, bold: true, color: '1F2A2A' });
      s.addTable([rows[0]].concat(rows.slice(i, i + 14)), { x: 0.5, y: 1.1, w: 12.3, colW: [6.15, 6.15], fontFace: FONT, fontSize: 11, border: { type: 'solid', color: 'D2DAD7', pt: 0.75 } });
    }
    const blob = await pptx.write({ outputType: 'blob' });
    await saveFile('arbol-' + slug(P.meta.titulo) + '.pptx', blob);
  } catch (e) { console.error(e); toast('No se pudo generar la presentación.'); }
}
function exportData() { return { app: 'arbol-problemas-pyep', version: 2, meta: P.meta, cuadros: P.cuadros, flechas: P.flechas }; }
function exportJSON() { saveFile('arbol-' + slug(P.meta.titulo) + '.json', JSON.stringify(exportData(), null, 2), 'application/json'); }
function b64url(bytes) { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function unb64url(t) { t = t.replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; const s = atob(t), b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }
async function encodeShare() {
  const bytes = new TextEncoder().encode(JSON.stringify(exportData()));
  if (window.CompressionStream) { try { const buf = await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer(); return 'ARBOL1.' + b64url(new Uint8Array(buf)); } catch (e) { /* sin compresión */ } }
  return 'ARBOL0.' + b64url(bytes);
}
async function decodeShare(code) {
  const m = code.replace(/\s+/g, '').match(/ARBOL([01])\.([A-Za-z0-9_-]+)/);
  if (!m) throw new Error('formato');
  let bytes = unb64url(m[2]);
  if (m[1] === '1') bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  return JSON.parse(new TextDecoder().decode(bytes));
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch (e) { modal('Copiar', [h('p', { class: 'hint' }, 'Seleccionen el texto y cópienlo con Ctrl+C.'), h('textarea', { class: 'ta', value: text, readOnly: true, onfocus: ev => ev.target.select() })]); return false; }
}
async function copyShareCode() { const code = await encodeShare(); if (await copyText(code)) toast('Código copiado. Péguenlo en el chat del grupo; se abre con Archivo → Abrir proyecto.'); }
function importDialog() {
  let parsed = null;
  const info = h('div', { class: 'hint' });
  const ta = h('textarea', { class: 'ta', placeholder: 'Peguen aquí el código ARBOL1.… que les enviaron', 'aria-label': 'Código del proyecto' });
  const file = h('input', { type: 'file', accept: '.json,application/json', 'aria-label': 'Archivo .json' });
  const go = h('button', { type: 'button', class: 'btn primary', disabled: true }, 'Abrir (reemplaza el actual)');
  const show = raw => {
    try {
      if (!raw || (!raw.cuadros && !raw.nodos)) throw new Error('vacío');
      parsed = sanitize(raw);
      info.textContent = '«' + (parsed.meta.titulo || 'Sin nombre') + '» · ' + Object.keys(parsed.cuadros).length + ' cuadros.'; info.className = 'hint ok-t'; go.disabled = false;
    } catch (e) { parsed = null; info.textContent = 'No se reconoce. Revisen que el código esté completo o que el archivo sea de esta herramienta.'; info.className = 'hint bad-t'; go.disabled = true; }
  };
  ta.addEventListener('input', debounce(async () => { const v = ta.value.trim(); if (!v) { info.textContent = ''; go.disabled = true; return; } try { show(v.charAt(0) === '{' ? JSON.parse(v) : await decodeShare(v)); } catch (e) { show(null); } }, 250));
  file.addEventListener('change', () => { const f = file.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { show(JSON.parse(r.result)); } catch (e) { show(null); } }; r.readAsText(f); });
  modal('Abrir proyecto', [h('p', { class: 'hint' }, 'Peguen un código o elijan un archivo .json guardado con esta herramienta.'), ta, file, info],
    close => { go.onclick = () => { if (!parsed) return; close(); replaceProject(parsed); sel = { nodes: new Set(), edge: null }; fit(); render(); toast('Proyecto abierto.', { action: 'Deshacer', fn: undo }); }; return [h('button', { type: 'button', class: 'btn', onclick: close }, 'Cancelar'), go]; });
}

/* ============================================================
   Google Slides: la app copia un código y un script de la presentación dibuja formas nativas
   ============================================================ */
const SLIDES_GS = /*SLIDES_GS*/'';
function slidesCode() {
  const arboles = ['p', 'o'].map(v => {
    const G = buildG(v), b = bbox(G);
    const cajas = Array.from(G.values()).map(g => {
      const st = nodeStyle(g, v, EXPORT_PAL, true);
      return { id: g.id, x: Math.round(g.x), y: Math.round(g.y), w: Math.round(g.w), h: Math.round(g.h), t: displayText(g.n, v), fill: st.fill, stroke: st.stroke, ink: st.ink, size: g.central ? RFS : FS };
    });
    const flechas = visibleEdges(G).map(e => {
      const act = G.get(e.de).n.tipo === 'accion' || G.get(e.a).n.tipo === 'accion';
      return { de: e.de, a: e.a, color: act ? EXPORT_PAL.acStroke : EXPORT_PAL.edge, dash: act };
    });
    return { titulo: (v === 'p' ? 'Árbol de problemas' : 'Árbol de objetivos') + (P.meta.titulo ? ' · ' + P.meta.titulo : ''), bbox: { x: b.x, y: b.y, w: b.w, h: b.h }, cajas, flechas };
  });
  return 'ARBOL-SLIDES:' + JSON.stringify({ v: 1, arboles });
}
function slidesDialog() {
  commitEdit();
  if (!Object.values(P.cuadros).some(n => n.texto.trim())) { toast('Primero escriban el árbol de problemas.'); return; }
  const step = (n, t) => h('h3', null, h('span', { class: 'n' }, n), t);
  modal('Copiar para Google Slides', [
    h('p', { class: 'hint' }, 'Google Slides no acepta formas pegadas desde otra página, solo imágenes. Por eso un pequeño script dentro de su presentación dibuja los dos árboles con rectángulos y conectores de Slides, que se pueden mover y editar como cualquier forma.'),
    step('1', 'Solo la primera vez: instalen el script en su presentación'),
    h('ul', { class: 'hint' },
      h('li', null, 'En Google Slides: Extensiones → Apps Script.'),
      h('li', null, 'Borren lo que haya, peguen el script y guarden (Ctrl+S).'),
      h('li', null, 'Vuelvan a la presentación y recárguenla: aparece el menú «Árbol PYEP». La primera vez Google pide autorizar el script (es de ustedes y solo trabaja en esa presentación).')),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn', onclick: async () => { if (await copyText(SLIDES_GS)) toast('Script copiado. Péguenlo en Extensiones → Apps Script.'); } }, icon('copy'), 'Copiar script de instalación')),
    step('2', 'Copien los árboles'),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn primary', onclick: async () => { if (await copyText(slidesCode())) toast('Árboles copiados. En Slides: Árbol PYEP → Pegar árbol…'); } }, icon('copy'), 'Copiar árboles')),
    step('3', 'En Google Slides: Árbol PYEP → Pegar árbol…'),
    h('p', { class: 'hint' }, 'Peguen con Ctrl+V y presionen «Insertar diapositivas». Se agregan dos diapositivas al final: árbol de problemas y árbol de objetivos.'),
    h('p', { class: 'hint' }, 'Sin instalar nada: Archivo → Presentación editable (PowerPoint), y en Google Slides, Archivo → Importar diapositivas.')],
    close => [h('button', { type: 'button', class: 'btn', onclick: close }, 'Cerrar')]);
}

/* ============================================================
   Transformar con IA (sin claves: copiar el pedido y pegar la respuesta)
   ============================================================ */
function treeText() {
  const { role, parent, order } = roles(P);
  const lines = [];
  for (const id of order) {
    const n = P.cuadros[id], r = role.get(id);
    if (!n.texto.trim()) continue;
    if (r === 'central') lines.push(id + ' | problema central | ' + n.texto);
    else lines.push(id + ' | ' + r + ' | ' + n.texto + ' | ' + (r === 'efecto' ? 'consecuencia de ' : 'causa de ') + parent.get(id));
  }
  for (const n of Object.values(P.cuadros)) if (n.tipo === 'normal' && !role.has(n.id) && n.texto.trim()) lines.push(n.id + ' | sin conectar | ' + n.texto);
  const links = Object.values(P.flechas).filter(e => role.has(e.de) && role.has(e.a) && parent.get(e.a) !== e.de && parent.get(e.de) !== e.a).map(e => e.de + ' también provoca ' + e.a);
  return { order, empty: !lines.length, text: 'Árbol de problemas (cada línea: id | tipo | enunciado | relación):\n' + lines.join('\n') + (links.length ? '\nOtras relaciones: ' + links.join('; ') : '') };
}
function aiPrompt() {
  const { order, text } = treeText();
  return 'Eres tutor del curso de Preparación y Evaluación de Proyectos (PYEP) del Sistema Nacional de Inversiones de Chile.\n'
    + 'Tengo un árbol de problemas y necesito el árbol de objetivos. Reglas:\n'
    + '- Cada enunciado negativo se transforma en la situación positiva deseada (su contrario): el problema central pasa a objetivo central, los efectos a fines y las causas a medios.\n'
    + '- Mantén el sentido y el resto de la frase; cambia solo lo necesario. Ejemplos: "Alta incidencia de enfermedades infecciosas en la localidad X" → "Baja incidencia de enfermedades infecciosas en la localidad X"; "Insuficiente educación en higiene" → "Suficiente educación en higiene"; "No hay atención de salud en la localidad" → "Hay atención de salud en la localidad"; "Medioambiente contaminado e insalubre" → "Medioambiente no contaminado y salubre".\n'
    + '- No escribas soluciones ni acciones (nada de "construir" o "implementar"): describe la situación ya lograda.\n'
    + '- Enunciados breves, en español de Chile.\n'
    + '- Si ves enunciados mal planteados en el árbol de problemas (la "falta de" una solución, efectos demasiado abstractos, relaciones causa-efecto que no se sostienen o repeticiones), anótalos en "observaciones" de forma breve.\n\n'
    + text + '\n\n'
    + 'Responde SOLO con un JSON válido, sin texto antes ni después, con este formato exacto y un objeto por cada id:\n'
    + '{"objetivos": [{"id": "' + (order[0] || 'id') + '", "objetivo": "texto positivo"}], "observaciones": ["..."]}';
}
function extractJSON(t) {
  t = String(t || '').trim();
  const tries = [t];
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i); if (fence) tries.push(fence[1]);
  const a = t.indexOf('{'), b = t.lastIndexOf('}'); if (a > -1 && b > a) tries.push(t.slice(a, b + 1));
  const c = t.indexOf('['), d = t.lastIndexOf(']'); if (c > -1 && d > c) tries.push(t.slice(c, d + 1));
  for (const s of tries) for (const fix of [x => x, x => x.replace(/[“”]/g, '"').replace(/,\s*([}\]])/g, '$1')]) { try { return JSON.parse(fix(s)); } catch (e) { /* siguiente intento */ } }
  return null;
}
function readAIAnswer(text) {
  const j = extractJSON(text);
  if (!j) return null;
  const items = Array.isArray(j) ? j : arr(j.objetivos || j.objectives || j.items || j.resultado);
  const map = new Map();
  for (const x of items) {
    if (!x || typeof x !== 'object') continue;
    const id = String(x.id || '').trim(), t = String(x.objetivo || x.objective || x.texto || x.positivo || '').trim();
    if (P.cuadros[id] && P.cuadros[id].tipo !== 'accion' && t) map.set(id, t);
  }
  return { map, obs: Array.isArray(j) ? [] : arr(j.observaciones || j.observations).map(String).filter(Boolean) };
}
function applyAI(res) {
  if (!res || !res.map.size) return false;
  snap();
  for (const [id, t] of res.map) setObjText(id, t);
  view = 'o'; sel = { nodes: new Set(), edge: null };
  render();
  toast(res.map.size === 1 ? 'Se actualizó 1 objetivo con la IA.' : 'Se actualizaron ' + res.map.size + ' objetivos con la IA.', { action: 'Deshacer', fn: undo });
  if (res.obs.length) modal('Observaciones de la IA', [h('p', { class: 'hint' }, 'Sobre el árbol de problemas. Revísenlas en grupo: son sugerencias, no verdades.'), h('ul', null, res.obs.map(o => h('li', null, o)))], close => [h('button', { type: 'button', class: 'btn primary', onclick: close }, 'Entendido')]);
  return true;
}
// Diálogo común: copiar el pedido a una IA y pegar su respuesta, o pedírsela a Claude dentro del Artifact.
// o.summary(res) devuelve el texto de lo reconocido, o null si la respuesta no sirve.
function aiModal(o) {
  const step = (n, t) => h('h3', null, h('span', { class: 'n' }, String(n)), t), k = o.before ? 1 : 0;
  const promptBox = h('textarea', { class: 'ta short', value: o.prompt(), readOnly: true, 'aria-label': 'Pedido para la IA', onfocus: e => e.target.select() });
  if (o.before) o.before.addEventListener('input', () => { promptBox.value = o.prompt(); });
  const answer = h('textarea', { class: 'ta', placeholder: 'Peguen aquí la respuesta completa de la IA', 'aria-label': 'Respuesta de la IA' });
  const info = h('div', { class: 'hint' });
  const apply = h('button', { type: 'button', class: 'btn primary', disabled: true }, o.applyLabel);
  let parsed = null;
  answer.addEventListener('input', debounce(() => {
    const res = o.read(answer.value), msg = res && o.summary(res);
    parsed = msg ? res : null;
    if (!answer.value.trim()) { info.textContent = ''; apply.disabled = true; return; }
    info.textContent = msg || o.bad; info.className = msg ? 'hint ok-t' : 'hint bad-t'; apply.disabled = !msg;
  }, 200));
  const directBtn = caps.sample ? h('button', { type: 'button', class: 'btn' }, icon('spark'), h('span', null, o.directLabel)) : null;
  modal(o.title, [
    h('p', { class: 'hint' }, o.intro),
    o.before,
    step(k + 1, 'Copien el pedido y péguenlo en el chat de la IA'),
    h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn primary', onclick: async () => { if (await copyText(o.prompt())) toast('Pedido copiado. Péguenlo en ChatGPT, Claude o Gemini.'); } }, icon('copy'), 'Copiar pedido'),
      h('a', { href: 'https://chatgpt.com/', target: '_blank', rel: 'noopener', class: 'hint' }, 'chatgpt.com'), h('a', { href: 'https://claude.ai/new', target: '_blank', rel: 'noopener', class: 'hint' }, 'claude.ai'), h('a', { href: 'https://gemini.google.com/', target: '_blank', rel: 'noopener', class: 'hint' }, 'gemini.google.com')),
    promptBox,
    step(k + 2, 'Peguen aquí la respuesta'),
    answer, info,
    directBtn ? h('div', { class: 'row' }, h('span', { class: 'hint' }, 'O háganlo aquí mismo, con su cuenta de Claude:'), directBtn) : null], close => {
    apply.onclick = () => { if (!parsed) return; close(); o.apply(parsed); };
    if (directBtn) directBtn.onclick = async () => {
      directBtn.disabled = true; directBtn.lastChild.textContent = 'Pensando…';
      try {
        const res = o.read(JSON.stringify(await caps.sample.json(o.prompt(), { modelTier: 'default' })));
        if (res && o.summary(res)) { close(); o.apply(res); } else toast(o.empty);
      } catch (e) {
        if (e && ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].indexOf(e.code) > -1) caps.sample = null;
        toast(e && e.code === 'rate_limited' ? 'Demasiadas consultas seguidas; esperen un momento.' : 'No se pudo consultar a Claude aquí. Usen el método de copiar y pegar.');
      } finally { directBtn.disabled = false; directBtn.lastChild.textContent = o.directLabel; }
    };
    return [h('button', { type: 'button', class: 'btn', onclick: close }, 'Cancelar'), apply];
  });
}
function aiDialog() {
  commitEdit();
  const count = Object.values(P.cuadros).filter(n => n.tipo !== 'accion' && n.texto.trim()).length;
  if (!count) { toast('Primero escriban el árbol de problemas.'); return; }
  aiModal({
    title: 'Transformar con IA', directLabel: 'Transformar aquí con Claude', applyLabel: 'Aplicar al árbol de objetivos',
    intro: 'Funciona con ChatGPT, Claude o Gemini en su versión gratuita, sin claves ni configuración. La IA devuelve los objetivos en un formato que esta herramienta lee sola.',
    prompt: aiPrompt, read: readAIAnswer, apply: applyAI,
    summary: r => r.map.size ? 'Se reconocieron ' + r.map.size + ' de ' + count + ' objetivos' + (r.obs.length ? ' y ' + r.obs.length + ' observaciones' : '') + '.' : null,
    bad: 'No se encontró el JSON con los objetivos. Copien la respuesta completa de la IA.',
    empty: 'La respuesta no trajo objetivos. Intenten de nuevo.',
  });
}

/* ---------- mejorar el árbol de problemas con una instrucción, según las guías del SNI ---------- */
// Resumen de: Metodología General de Formulación y Evaluación de Proyectos de Inversión Pública (MDSF, 2025, cap. II.2)
// y Metodología de Edificación Pública (MDSF, 2024).
const GUIAS_SNI = [
  'Problema: estado negativo que afecta a una población o grupo de usuarios respecto de un bien o servicio, una condición de riesgo o una oportunidad desaprovechada. Nunca la «ausencia de una solución» («falta un edificio», «inexistencia de oficinas»): eso es solo una de las alternativas de solución y sesga el análisis.',
  'En proyectos de inversión el problema central suele ser de cobertura insuficiente (las instalaciones no existen o su capacidad no alcanza para la demanda) o de calidad deficiente (el servicio no cumple los estándares por causas de infraestructura, equipos o equipamiento). Hay un solo problema central: el que origina la idea de proyecto.',
  'Efectos: consecuencias presentes y futuras del problema sobre la población o los usuarios, que se puedan respaldar con evidencia. Muestran la relevancia del problema y anticipan los beneficios de resolverlo.',
  'Causas: explican el origen del problema y permiten proponer alternativas de solución. Cada causa debe sostenerse como causa real de lo que provoca; sin repeticiones.',
  'Redacción: frases breves y simples, medibles cuando se pueda; cuando corresponda, a quién afecta y dónde.',
  'Edificación pública (edificios institucionales): la finalidad es elevar el nivel de servicio a la comunidad aprovechando la infraestructura. Causas típicas: superficie insuficiente para la dotación de funcionarios según estándares, dependencias dispersas en varios inmuebles, deterioro o incumplimiento de normas de construcción y funcionamiento, distribución interna inadecuada. Efectos típicos: mayores costos de operación, conservación, reparación y arriendo; menor eficiencia del personal por desplazamientos; mayor tiempo de los usuarios en trámites.',
];
function improvePrompt(instr) {
  const { empty, text } = treeText();
  return 'Eres tutor del curso de Preparación y Evaluación de Proyectos (PYEP) del Sistema Nacional de Inversiones (SNI) de Chile.\n'
    + 'Mejora este árbol de problemas siguiendo las guías del SNI y la instrucción del grupo.\n\n'
    + 'Guías del SNI (Metodología General 2025 y Metodología de Edificación Pública 2024):\n- ' + GUIAS_SNI.join('\n- ') + '\n\n'
    + 'Instrucción del grupo: ' + (instr.trim() ? '«' + instr.trim() + '»' : 'revisen el árbol completo según las guías.') + '\n\n'
    + (empty ? 'El árbol está vacío: constrúyelo a partir de la instrucción.' : text) + '\n\n'
    + 'Reglas de la respuesta:\n'
    + '- Devuelve el árbol COMPLETO ya mejorado. Conserva el id de cada cuadro que mantengas (aunque cambies su texto); a los cuadros nuevos dales ids "n1", "n2"… Los cuadros que no incluyas se eliminan.\n'
    + '- Mantén lo que ya cumple las guías; cambia solo lo necesario. No inventes cifras ni datos.\n'
    + '- Cada flecha va desde lo que provoca hacia lo provocado: causa → problema central → efecto.\n'
    + '- Enunciados breves, en español de Chile.\n\n'
    + 'Responde SOLO con un JSON válido, sin texto antes ni después, con este formato:\n'
    + '{"cuadros": [{"id": "id", "tipo": "central|efecto|causa", "texto": "enunciado"}], "flechas": [{"de": "id", "a": "id"}], "cambios": ["qué cambiaste y por qué, según las guías"]}';
}
function readImprove(text) {
  const j = extractJSON(text);
  if (!j || Array.isArray(j)) return null;
  const shown = new Set(Object.values(P.cuadros).filter(n => n.tipo !== 'accion' && n.texto.trim()).map(n => n.id));
  const bottom = Math.max(0, ...Object.values(P.cuadros).map(n => n.y)) + 200;
  const next = { meta: clone(P.meta), cuadros: {}, flechas: {} }, ids = new Map(), seen = new Set();
  let central = null, added = 0, edited = 0;
  for (const x of arr(j.cuadros || j.nodos).slice(0, 80)) {
    if (!x || typeof x !== 'object') continue;
    const key = String(x.id || '').trim(), texto = str(x.texto).replace(/\s+/g, ' ').trim().slice(0, 300);
    if (!texto || (key && ids.has(key))) continue;
    const old = shown.has(key) ? P.cuadros[key] : null, id = old ? key : uid();
    const tipo = !central && /central/i.test(str(x.tipo)) ? 'central' : 'normal';
    if (key) ids.set(key, id);
    if (tipo === 'central') central = id;
    next.cuadros[id] = old ? Object.assign(clone(old), { tipo, texto }) : mkNode(id, tipo, texto, added * (W_NODE + 20), bottom);
    if (!old) added++; else if (old.texto !== texto) edited++;
  }
  if (!central) return null;
  const link = (de, a) => {
    if (!de || !a || de === a || !next.cuadros[de] || !next.cuadros[a] || seen.has(de + '>' + a) || seen.has(a + '>' + de)) return;
    seen.add(de + '>' + a); const id = uid(); next.flechas[id] = { id, de, a };
  };
  for (const e of arr(j.flechas)) if (e && typeof e === 'object') link(ids.get(String(e.de || '')), ids.get(String(e.a || '')));
  // lo que la IA no vio (acciones, cuadros vacíos) se conserva con sus flechas; las acciones que pierden su medio se van
  for (const n of Object.values(P.cuadros)) if (!shown.has(n.id) && n.tipo !== 'central') next.cuadros[n.id] = clone(n);
  for (const e of Object.values(P.flechas)) if (!shown.has(e.de) || !shown.has(e.a)) link(e.de, e.a);
  const linked = new Set(Object.values(next.flechas).flatMap(e => [e.de, e.a]));
  for (const n of Object.values(next.cuadros)) if (n.tipo === 'accion' && !linked.has(n.id) && Object.values(P.flechas).some(e => e.de === n.id || e.a === n.id)) delete next.cuadros[n.id];
  const removed = Array.from(shown).filter(id => !next.cuadros[id]).length;
  return { next, added, edited, removed, total: Object.values(next.cuadros).filter(n => n.tipo !== 'accion').length, cambios: arr(j.cambios || j.observaciones).map(String).filter(Boolean) };
}
function applyImprove(res) {
  tidy(res.next);
  replaceProject(res.next);
  view = 'p'; sel = { nodes: new Set(), edge: null };
  fit(); render();
  toast('Se mejoró el árbol de problemas con la IA.', { action: 'Deshacer', fn: undo });
  if (res.cambios.length) modal('Cambios de la IA', [h('p', { class: 'hint' }, 'Revísenlos en grupo: son sugerencias según las guías del SNI, no verdades. Los objetivos de los cuadros que cambiaron quedan marcados para revisar.'), h('ul', null, res.cambios.map(c => h('li', null, c)))], close => [h('button', { type: 'button', class: 'btn primary', onclick: close }, 'Entendido')]);
}
function improveDialog() {
  commitEdit();
  const instr = h('textarea', { class: 'ta', style: 'min-height:70px;font-family:inherit;font-size:13.5px', 'aria-label': 'Qué quieren mejorar',
    placeholder: 'Ej.: el problema central está planteado como «falta de un edificio»; corríjanlo. Agreguen efectos sobre los usuarios y los funcionarios. (Si lo dejan vacío, la IA revisa todo según las guías.)' });
  aiModal({
    title: 'Mejorar con IA', directLabel: 'Mejorar aquí con Claude', applyLabel: 'Reemplazar el árbol de problemas',
    intro: 'La IA revisa el árbol de problemas según las guías del SNI (Metodología General y de Edificación Pública) y lo que ustedes le pidan, y lo devuelve completo. Se puede deshacer.',
    before: h('div', { style: 'display:grid;gap:8px' }, h('h3', null, h('span', { class: 'n' }, '1'), '¿Qué quieren mejorar?'), instr),
    prompt: () => improvePrompt(instr.value), read: readImprove, apply: applyImprove,
    summary: r => r.total + ' cuadros: ' + r.added + ' nuevos, ' + r.edited + ' con texto cambiado y ' + r.removed + ' eliminados' + (r.cambios.length ? ', con ' + r.cambios.length + ' explicaciones' : '') + '.',
    bad: 'No se encontró el árbol en la respuesta (falta el JSON o el problema central). Copien la respuesta completa de la IA.',
    empty: 'La respuesta no trajo un árbol. Intenten de nuevo.',
  });
}

/* ============================================================
   Diálogos y avisos
   ============================================================ */
function toast(msg, opt) {
  const root = $('#toast');
  const t = h('div', { class: 'toast', role: 'status' }, h('span', { style: 'flex:1' }, msg), opt && opt.action ? h('button', { type: 'button', onclick: () => { t.remove(); opt.fn(); } }, opt.action) : null);
  root.append(t);
  while (root.children.length > 2) root.firstChild.remove();
  setTimeout(() => t.remove(), opt && opt.action ? 7000 : 4500);
}
function modal(title, body, foot) {
  const root = $('#modal-root');
  const close = () => { root.innerHTML = ''; document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  const ov = h('div', { class: 'overlay', onclick: e => { if (e.target === ov) close(); } },
    h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('div', { class: 'modal-head' }, h('h2', null, title), h('button', { type: 'button', class: 'ib', 'aria-label': 'Cerrar', onclick: close }, icon('x'))),
      body, foot ? h('div', { class: 'foot' }, foot(close)) : null));
  root.innerHTML = ''; root.append(ov);
  return close;
}
function confirmBox(title, text, ok, fn) {
  modal(title, h('p', null, text), close => [h('button', { type: 'button', class: 'btn', onclick: close }, 'Cancelar'), h('button', { type: 'button', class: 'btn primary', onclick: () => { close(); fn(); } }, ok)]);
}
function showHelp() {
  modal('Cómo se usa', [
    h('ul', null,
      h('li', null, h('b', null, 'Problema central: '), 'doble clic en el cuadro azul y escriban.'),
      h('li', null, h('b', null, 'Efectos y causas: '), 'seleccionen un cuadro y hagan clic en ⊕ arriba (efecto) o ⊕ abajo (causa). Arrastren un ⊕ hasta otro cuadro para conectarlos con una flecha.'),
      h('li', null, h('b', null, 'Mover: '), 'arrastren los cuadros. Arrastrar el fondo mueve la vista; Shift + arrastrar selecciona varios. «Ordenar» acomoda todo como árbol.'),
      h('li', null, h('b', null, 'Árbol de objetivos: '), 'pestaña «Objetivos». Se genera solo cambiando cada enunciado por su contrario (alta → baja, insuficiente → suficiente, mal → buen…). Lo amarillo hay que revisarlo: doble clic para corregir.'),
      h('li', null, h('b', null, 'Mejorar con IA: '), 'escriban qué quieren mejorar; la IA revisa el árbol de problemas según las guías del SNI y lo devuelve completo (se puede deshacer).'),
      h('li', null, h('b', null, 'Transformar con IA: '), 'copia un pedido para ChatGPT, Claude o Gemini y luego pegan la respuesta: la herramienta reemplaza los objetivos por los de la IA (se puede deshacer).'),
      h('li', null, h('b', null, 'Acciones: '), 'en «Objetivos», ⊕ abajo de un medio agrega una acción.'),
      h('li', null, h('b', null, 'Google Slides: '), 'Archivo → Copiar para Google Slides dibuja los árboles con formas editables en su presentación.'),
      h('li', null, h('b', null, 'Guardar y compartir: '), Sync.mode === 'shared' ? 'este enlace es el proyecto compartido del grupo: los cambios se guardan solos y se ven en vivo.' : FIREBASE && !caps.inViewer ? 'se guarda solo en este navegador. Para editarlo en grupo y en vivo: Archivo → Trabajar en grupo en vivo, y envíen el enlace.' : 'se guarda solo en este navegador. Para pasarlo al grupo: Archivo → Copiar código, y quien lo recibe usa Archivo → Abrir proyecto.')),
    h('p', { class: 'hint' }, h('span', { class: 'kbd' }, 'Supr'), ' eliminar · ', h('span', { class: 'kbd' }, 'Enter'), ' editar · ', h('span', { class: 'kbd' }, 'Ctrl+Z'), ' deshacer · ', h('span', { class: 'kbd' }, 'Ctrl+rueda'), ' zoom · ', h('span', { class: 'kbd' }, 'flechas'), ' mover lo seleccionado')],
    close => [h('button', { type: 'button', class: 'btn primary', onclick: close }, 'Entendido')]);
}

/* ============================================================
   Inicio
   ============================================================ */
function loadLocal() {
  for (const k of [LS_KEY, LS_OLD]) {
    const raw = lsGet(k); if (!raw) continue;
    try { const p = sanitize(JSON.parse(raw)); if (Object.keys(p.cuadros).length) return p; } catch (e) { /* ignorar */ }
  }
  return null;
}
window.addEventListener('storage', e => { if (e.key === LS_KEY && Sync.mode === 'local' && e.newValue && !editing && !drag) { try { P = sanitize(JSON.parse(e.newValue)); paintTitle(); render(); } catch (x) { /* ignorar */ } } });
if (window.matchMedia) { const mq = window.matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', () => render()); }
new MutationObserver(() => render()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

function boot() {
  P = loadLocal() || freshProject();
  const sala = FIREBASE && !caps.inViewer && roomId();
  if (sala) Sync.ready = false;
  buildBar();
  render();
  requestAnimationFrame(() => { fit(); render(); });
  if (FIREBASE && !caps.inViewer) window.addEventListener('hashchange', () => location.reload());
  if (sala) joinRoom(sala, false);
  if (!caps.inViewer) return;
  const use = name => window.claude.use(name).catch(() => null);
  use('downloads').then(d => { caps.downloads = d; });
  use('sample').then(s => { caps.sample = s; });
  Promise.all([use('db'), use('user')]).then(async ([db, user]) => {
    if (!db) return;
    let canWrite = null;
    try { canWrite = user ? await user.can('data.write') : null; } catch (e) { canWrite = null; }
    startShared(db, canWrite);
    if (canWrite === false) setReadOnly(true);
  });
}
boot();
})();
