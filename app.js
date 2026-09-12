/* Five Proofs Mastery — app */
(function () {
  'use strict';

  const DATA = window.COURSE_DATA || { modules: [], docs: {} };

  const OUTLINE = [
    { id: 'primer', n: '✦', group: 'Start here', latin: 'Prolegomena', title: 'Philosophy Foundations', short: 'Foundations' },
    { id: 'intro', n: '0', group: 'Start here', latin: 'Praeambula', title: 'Introduction', short: 'Introduction' },
    { id: 'ch1', n: '1', group: 'The five proofs', latin: 'Actus Purus', title: 'The Aristotelian Proof', short: 'Aristotelian', from: 'Change' },
    { id: 'ch2', n: '2', group: 'The five proofs', latin: 'Τὸ Ἕν · The One', title: 'The Neo-Platonic Proof', short: 'Neo-Platonic', from: 'Composition' },
    { id: 'ch3', n: '3', group: 'The five proofs', latin: 'Rationes Aeternae', title: 'The Augustinian Proof', short: 'Augustinian', from: 'Abstract objects' },
    { id: 'ch4', n: '4', group: 'The five proofs', latin: 'Ipsum Esse Subsistens', title: 'The Thomistic Proof', short: 'Thomistic', from: 'Essence and existence' },
    { id: 'ch5', n: '5', group: 'The five proofs', latin: 'Ens Necessarium', title: 'The Rationalist Proof', short: 'Rationalist', from: 'Sufficient reason' },
    { id: 'ch6a', n: '6A', group: 'The nature of God', latin: 'De Natura Dei', title: 'The Nature of God I', short: 'Nature of God I' },
    { id: 'ch6b', n: '6B', group: 'The nature of God', latin: 'De Deo et Mundo', title: 'The Nature of God II', short: 'Nature of God II' },
    { id: 'ch7a', n: '7A', group: 'Objections', latin: 'Videtur Quod…', title: 'Common Objections I', short: 'Objections I' },
    { id: 'ch7b', n: '7B', group: 'Objections', latin: 'Respondeo', title: 'Common Objections II', short: 'Objections II' },
    { id: 'capstone', n: '∑', group: 'Capstone', latin: 'Summa', title: 'Mastery Capstone', short: 'Capstone' }
  ];
  const MOD = {};
  (DATA.modules || []).forEach(m => { MOD[m.id] = m; });
  const OUT = Object.fromEntries(OUTLINE.map(o => [o.id, o]));
  const AVAIL = OUTLINE.filter(o => MOD[o.id]);

  const TABS = [
    { id: 'overview', label: 'Start here', g: 1 },
    { id: 'video', label: 'Video', g: 1 },
    { id: 'summary', label: 'Lessons', g: 1 },
    { id: 'argument', label: 'Argument', g: 2 },
    { id: 'concepts', label: 'Concepts', g: 2 },
    { id: 'objections', label: 'Objections', g: 3 },
    { id: 'explain', label: 'Explain', g: 3 },
    { id: 'persuade', label: 'Persuade', g: 3 },
    { id: 'practice', label: 'Practice', g: 4 }
  ];
  const tabLabel = id => (TABS.find(t => t.id === id) || TABS[0]).label;

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const main = $('#main');
  const arr = x => Array.isArray(x) ? x : [];
  const plain = s => String(s || '').replace(/\*\*|\*|_/g, '');
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fmtTime = m => { m = +m || 0; if (m < 90) return m + ' min'; const h = Math.round(m / 30) / 2; return (h % 1 ? Math.floor(h) + '½' : h) + ' hours'; };
  const typing = e => /INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '');

  /* ---------------- storage ---------------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  const P = store.get('fp.progress.v1', null) || { m: {}, last: null };
  function mp(id) {
    const x = P.m[id] || (P.m[id] = {});
    ['done', 'qa', 'sa', 'rub', 'fc', 'goals', 'read', 'chk', 'after'].forEach(k => { x[k] = x[k] || {}; });
    return x;
  }
  let saveTimer = null;
  function save() { clearTimeout(saveTimer); saveTimer = setTimeout(() => store.set('fp.progress.v1', P), 150); }
  function modPct(id) { const d = mp(id).done; return Math.round(100 * TABS.filter(t => d[t.id]).length / TABS.length); }

  /* ---------------- text ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*(?!\s)([^*]+?)\*(?!\*)/g, '$1<em>$2</em>')
      .replace(/(^|[^_\w])_(?!\s)([^_]+?)_(?![_\w])/g, '$1<em>$2</em>');
  }
  function md(src, opts) {
    if (!src) return '';
    opts = opts || {};
    const lines = String(src).replace(/\r/g, '').split('\n');
    const out = []; let para = [], list = null, quote = [], table = [];
    const fPara = () => { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } };
    const fList = () => { if (list) { out.push('<' + list.t + '>' + list.items.map(i => '<li>' + inline(i) + '</li>').join('') + '</' + list.t + '>'); list = null; } };
    const fQuote = () => { if (quote.length) { out.push('<blockquote>' + inline(quote.join(' ')) + '</blockquote>'); quote = []; } };
    const fTable = () => {
      if (!table.length) return;
      const cells = r => r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
      const real = table.filter(r => /[^-|:\s]/.test(r));
      if (real.length) {
        out.push('<div class="tbl"><table><thead><tr>' + cells(real[0]).map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' +
          real.slice(1).map(r => '<tr>' + cells(r).map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>');
      }
      table = [];
    };
    const fAll = () => { fPara(); fList(); fQuote(); fTable(); };
    for (const raw of lines) {
      const l = raw.trim(); let m;
      if (!l) { fAll(); continue; }
      if (l.startsWith('|')) { fPara(); fList(); fQuote(); table.push(l); continue; } else if (table.length) fTable();
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(l)) { fAll(); out.push('<hr>'); continue; }
      if (opts.headings && (m = l.match(/^(#{1,5})\s+(.*)$/))) { fAll(); const lv = Math.min(m[1].length + 1, 5); out.push('<h' + lv + '>' + inline(m[2].replace(/#+$/, '')) + '</h' + lv + '>'); continue; }
      if ((m = l.match(/^[-*•]\s+(.*)$/))) { fPara(); fQuote(); if (!list || list.t !== 'ul') { fList(); list = { t: 'ul', items: [] }; } list.items.push(m[1]); continue; }
      if ((m = l.match(/^\d+[.)]\s+(.*)$/))) { fPara(); fQuote(); if (!list || list.t !== 'ol') { fList(); list = { t: 'ol', items: [] }; } list.items.push(m[1]); continue; }
      if ((m = l.match(/^>\s?(.*)$/))) { fPara(); fList(); quote.push(m[1]); continue; }
      if (list && /^\s{2,}/.test(raw)) { list.items[list.items.length - 1] += ' ' + l; continue; }
      fList(); fQuote(); para.push(l);
    }
    fAll();
    return out.join('');
  }
  const P_ = (s, cls) => '<div class="prose' + (cls ? ' ' + cls : '') + '">' + md(s) + '</div>';

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400);
  }
  async function copyText(text, label) {
    try { await navigator.clipboard.writeText(text); toast((label || 'Text') + ' copied'); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      ta.remove(); toast(ok ? (label || 'Text') + ' copied' : 'Copy was blocked — select the text and press Ctrl+C');
    }
  }
  function ring(pct, cls) {
    const r = 6, c = 2 * Math.PI * r, p = Math.max(0, Math.min(100, pct || 0));
    return '<svg class="ring' + (p >= 100 ? ' done' : '') + (cls ? ' ' + cls : '') + '" viewBox="0 0 16 16" aria-label="' + p + '% complete"><circle class="t" cx="8" cy="8" r="' + r + '"/>' +
      (p > 0 ? '<circle class="p" cx="8" cy="8" r="' + r + '" stroke-dasharray="' + (c * p / 100).toFixed(2) + ' ' + c.toFixed(2) + '" transform="rotate(-90 8 8)"/>' : '') + '</svg>';
  }
  const dots = (n, of) => '<span class="dots" title="Difficulty ' + n + ' of ' + (of || 3) + '">' + Array.from({ length: of || 3 }, (_, k) => '<i class="' + (k < n ? 'on' : '') + '"></i>').join('') + '</span>';

  /* ---------------- platform capabilities (published version) ---------------- */
  const IS_HOSTED = !!(window.claude && typeof window.claude.use === 'function');
  const Caps = { db: null, assets: null, sample: null, downloads: null };
  let videoDocs = {};
  async function initCaps() {
    if (!IS_HOSTED) return;
    await Promise.all(['db', 'assets', 'sample', 'downloads'].map(async n => { try { Caps[n] = await window.claude.use(n); } catch (e) { Caps[n] = null; } }));
    if (Caps.db) {
      try {
        Caps.db.collection('videos').onSnapshot(snap => {
          const next = {}; snap.docs.forEach(d => { next[d.id] = d.data(); });
          videoDocs = next; renderNav(); refreshVideoIfShown();
        }, () => {});
      } catch (e) { /* db unavailable */ }
    }
    render();
  }
  async function downloadText(filename, text) {
    if (IS_HOSTED) {
      if (!Caps.downloads) { toast('Downloads are not available here — use Copy instead'); return; }
      try { await Caps.downloads.save({ filename, data: text }); toast('Saved ' + filename); }
      catch (e) { toast(e && e.code === 'declined' ? 'Download cancelled' : 'Download failed — use Copy instead'); }
      return;
    }
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  /* ---------------- video storage ---------------- */
  const IDB = {
    _db: null,
    open() {
      if (this._db) return Promise.resolve(this._db);
      return new Promise((res, rej) => {
        try { const r = indexedDB.open('fp-videos', 1); r.onupgradeneeded = () => r.result.createObjectStore('v'); r.onsuccess = () => { this._db = r.result; res(r.result); }; r.onerror = () => rej(r.error); }
        catch (e) { rej(e); }
      });
    },
    async op(mode, fn) {
      const db = await this.open();
      return new Promise((res, rej) => { const tx = db.transaction('v', mode); const r = fn(tx.objectStore('v')); tx.oncomplete = () => res(r && r.result); tx.onerror = () => rej(tx.error); });
    },
    get(k) { return this.op('readonly', s => s.get(k)).catch(() => null); },
    set(k, v) { return this.op('readwrite', s => s.put(v, k)); },
    del(k) { return this.op('readwrite', s => s.delete(k)).catch(() => null); }
  };
  function embedFor(url) {
    let m;
    if ((m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/))) return 'https://www.youtube-nocookie.com/embed/' + m[1];
    if ((m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]{10,})/))) return 'https://drive.google.com/file/d/' + m[1] + '/preview';
    if ((m = url.match(/vimeo\.com\/(\d+)/))) return 'https://player.vimeo.com/video/' + m[1];
    return null;
  }
  const isDirectVideo = url => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);
  const folderVideo = id => (IS_HOSTED ? (DATA.hostedVideos || {}) : (DATA.videoFiles || {}))[id] || null;
  let localVidFlags = store.get('fp.vidflags', {});
  function setLocalFlag(id, on) { if (on) localVidFlags[id] = 1; else delete localVidFlags[id]; store.set('fp.vidflags', localVidFlags); }
  const hasVideo = id => !!videoDocs[id] || !!localVidFlags[id] || !!folderVideo(id);
  let objUrl = null;
  async function getVideo(id) {
    const d = videoDocs[id];
    if (d && d.kind === 'asset' && d.assetId) return { kind: 'file', url: '/_blob/' + d.assetId, name: d.name, where: 'Saved to this course page' };
    if (d && d.kind === 'link' && d.url) return { kind: 'link', url: d.url, where: 'Linked video' };
    const rec = await IDB.get(id);
    if (rec && rec.blob) { if (objUrl) URL.revokeObjectURL(objUrl); objUrl = URL.createObjectURL(rec.blob); return { kind: 'file', url: objUrl, name: rec.name, where: 'Saved in this browser' }; }
    if (rec && rec.link) return { kind: 'link', url: rec.link, where: 'Linked video' };
    const f = folderVideo(id);
    if (f) return { kind: 'file', url: f, name: f.split('/').pop(), where: 'From the course’s videos folder' };
    return null;
  }
  async function attachFile(id, file) {
    if (!file) return;
    if (!/^video\//.test(file.type) && !/\.(mp4|webm|mov|m4v)$/i.test(file.name)) { toast('That file isn’t a video — choose an .mp4, .webm or .mov'); return; }
    if (Caps.assets && Caps.db) {
      if (file.size > 20 * 1024 * 1024) toast('Over 20 MB — keeping it in this browser only');
      else {
        try {
          toast('Uploading ' + file.name + '…');
          const r = await Caps.assets.upload(file);
          await Caps.db.collection('videos').doc(id).set({ kind: 'asset', assetId: r.id, name: file.name, size: r.sizeBytes, addedAt: new Date().toISOString() });
          toast('Video attached to ' + OUT[id].short); return;
        } catch (e) { toast((e && e.message ? e.message : 'Upload failed') + ' — keeping it in this browser instead'); }
      }
    }
    try { await IDB.set(id, { blob: file, name: file.name, addedAt: Date.now() }); setLocalFlag(id, true); toast('Video attached to ' + OUT[id].short); renderNav(); refreshVideoIfShown(); }
    catch (e) { toast('This browser blocked video storage — try a link instead'); }
  }
  async function attachLink(id, url) {
    url = (url || '').trim();
    if (!/^https?:\/\//i.test(url)) { toast('Paste a full link starting with https://'); return; }
    if (Caps.db) { try { await Caps.db.collection('videos').doc(id).set({ kind: 'link', url, addedAt: new Date().toISOString() }); toast('Video linked'); return; } catch (e) { /* fall back */ } }
    await IDB.set(id, { link: url, addedAt: Date.now() }).catch(() => {});
    setLocalFlag(id, true); toast('Video linked'); renderNav(); refreshVideoIfShown();
  }
  async function removeVideo(id) {
    const d = videoDocs[id];
    if (d && Caps.db) {
      try { await Caps.db.collection('videos').doc(id).delete(); if (d.kind === 'asset' && d.assetId && Caps.assets) { try { await Caps.assets.delete(d.assetId); } catch (e) { /* gone */ } } }
      catch (e) { toast('Could not remove the video'); return; }
    }
    await IDB.del(id); setLocalFlag(id, false); toast('Video removed'); renderNav(); refreshVideoIfShown();
  }

  /* ---------------- AI coach (published version only) ---------------- */
  const aiOn = () => !!Caps.sample;
  function modContext(m, limit) {
    const steps = arr(m.argument && m.argument.steps).map(s => s.n + '. ' + plain(s.text)).join('\n');
    const objs = arr(m.objections).map(o => '- ' + plain(o.title) + ': ' + plain(o.reply).slice(0, 500)).join('\n');
    return ('Module: ' + m.title + ' (Edward Feser, Five Proofs of the Existence of God)\nThesis: ' + plain(m.oneSentence) + '\n\nArgument steps:\n' + steps + '\n\nObjections and Feser-style replies:\n' + objs).slice(0, limit || 14000);
  }
  function aiError(e) {
    const c = e && e.code;
    if (c === 'not_granted') return 'The AI coach needs your permission — allow it when prompted.';
    if (c === 'rate_limited') return 'Too many requests just now — wait a minute and try again.';
    if (c === 'cancelled') return 'Stopped.';
    return (e && e.message) || 'The AI coach couldn’t respond.';
  }
  const listBlock = (label, items) => arr(items).length ? '<div><strong>' + esc(label) + '</strong><ul>' + items.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' : '';

  /* ---------------- glossary + clickable definitions ---------------- */
  const baseTerm = t => String(t.term || '').replace(/\s*\(.*?\)\s*/g, ' ').trim();
  const sortKey = s => String(s || '').replace(/^[“"‘'(\s]+/, '').replace(/^(the|a|an)\s+/i, '').toLowerCase();
  const termKey = t => sortKey(baseTerm(t)).replace(/[^a-z0-9α-ω]+/g, ' ').trim();
  const normForm = s => String(s).toLowerCase().replace(/[\s\u2010-\u2014-]+/g, ' ').trim();
  let GLOSS = null;
  function glossaryEntries() {
    if (GLOSS) return GLOSS;
    const lex = DATA.lexicon || {};
    const merge = lex.merge || {};
    const map = new Map();
    const score = x => String(x.definition || '').length + String(x.example || '').length + (x.origin ? 40 : 0) + (x.confuseWith ? 40 : 0);
    OUTLINE.forEach(o => {
      const m = MOD[o.id]; if (!m) return;
      arr(m.keyTerms).forEach(t => {
        if (!t || !t.term) return;
        let k = termKey(t); let guard = 0; while (merge[k] && guard++ < 4) k = merge[k];
        const e = map.get(k);
        if (!e) map.set(k, { key: k, t, mods: [o.id], all: [{ t, from: o.id }] });
        else { if (!e.mods.includes(o.id)) e.mods.push(o.id); e.all.push({ t, from: o.id }); if (score(t) > score(e.t)) e.t = t; }
      });
    });
    GLOSS = Array.from(map.values()).sort((a, b) => sortKey(a.t.term).localeCompare(sortKey(b.t.term)));
    return GLOSS;
  }
  let GL = null;
  function buildGL() {
    const entries = glossaryEntries();
    const lex = DATA.lexicon || {};
    const forms = lex.forms || {}; const merge = lex.merge || {};
    const stop = new Set(arr(lex.stop).map(normForm));
    const byKey = new Map(entries.map(e => [e.key, e]));
    const canon = k => { let c = k, g = 0; while (merge[c] && g++ < 4) c = merge[c]; return byKey.has(c) ? c : null; };
    const formToKey = new Map();
    const add = (f, k) => { f = normForm(f); if (!f || !k || stop.has(f)) return; if (f.length < 3 && !/^[a-z]{2}$/.test(f)) return; if (!formToKey.has(f)) formToKey.set(f, k); };
    Object.keys(forms).forEach(k => { const c = canon(k); if (c) arr(forms[k]).forEach(f => add(f, c)); });
    entries.forEach(e => {
      e.all.forEach(x => {
        const ab = String(x.t.term).match(/\(([A-Z]{2,5})\)/); if (ab) add(ab[1], e.key);
        if (!forms[termKey(x.t)]) { const b = baseTerm(x.t); if (/\s/.test(b) || b.length >= 7) add(b, e.key); }
      });
    });
    const list = Array.from(formToKey.keys()).sort((a, b) => b.length - a.length).map(f => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '[\\s\\u2010-\\u2014-]+'));
    let re = null;
    try { re = list.length ? new RegExp('(^|[^\\p{L}\\p{N}_-])(' + list.join('|') + ')(?![\\p{L}\\p{N}_-])', 'giu') : null; } catch (e) { re = null; }
    GL = { byKey, formToKey, re };
  }
  function linkify(root) {
    if (!root) return;
    if (!GL) buildGL();
    if (!GL.re) return;
    $$('.prose, .lk', root).forEach(scope => {
      if (scope.closest('.gpop, .doc')) return;
      if (scope.parentElement && scope.parentElement.closest('.prose, .lk')) return;
      const seen = new Set();
      const skip = scope.getAttribute('data-self'); if (skip) seen.add(skip);
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
        acceptNode(n) { const p = n.parentElement; if (!p || p.closest('button, a, h1, h2, h3, .gl, .opt, textarea, input')) return NodeFilter.FILTER_REJECT; return n.nodeValue.length > 2 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
      });
      const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        const text = node.nodeValue; GL.re.lastIndex = 0; let m, last = 0, frag = null;
        while ((m = GL.re.exec(text))) {
          const word = m[2]; const key = GL.formToKey.get(normForm(word)); const start = m.index + m[1].length;
          if (!key || seen.has(key)) continue;
          seen.add(key);
          frag = frag || document.createDocumentFragment();
          frag.appendChild(document.createTextNode(text.slice(last, start)));
          const b = document.createElement('button'); b.type = 'button'; b.className = 'gl'; b.dataset.k = key; b.textContent = word; frag.appendChild(b);
          last = start + word.length;
        }
        if (frag) { frag.appendChild(document.createTextNode(text.slice(last))); node.parentNode.replaceChild(frag, node); }
      });
    });
  }
  const pop = document.createElement('div'); pop.className = 'gpop'; pop.hidden = true; pop.setAttribute('role', 'dialog'); document.body.appendChild(pop);
  let popFor = null, hoverT = null, leaveT = null;
  function popHTML(e) {
    const t = e.t;
    return '<div class="gp-h"><span class="gp-k">Definition</span><button class="gp-x" type="button" aria-label="Close">×</button></div><h4>' + esc(t.term) + '</h4>' +
      (t.origin ? '<p class="gp-o">' + inline(t.origin) + '</p>' : '') + '<p class="gp-d">' + inline(t.definition) + '</p>' +
      (t.example ? '<p class="gp-e"><i>Example</i>' + inline(t.example) + '</p>' : '') +
      (t.confuseWith ? '<p class="gp-e"><i>Don’t confuse with</i>' + inline(t.confuseWith) + '</p>' : '') +
      '<div class="gp-f"><span>' + e.mods.filter(x => OUT[x]).map(x => '<a href="#/m/' + x + '/concepts">' + esc(OUT[x].short) + '</a>').join('') + '</span><a href="#/glossary/find/' + encodeURIComponent(baseTerm(t)) + '">All vocabulary →</a></div>';
  }
  function showPop(btn) {
    if (!GL) buildGL();
    const e = GL.byKey.get(btn.dataset.k); if (!e) return;
    popFor = btn; pop.innerHTML = popHTML(e); pop.hidden = false;
    const sheet = window.innerWidth <= 680; pop.classList.toggle('sheet', sheet);
    if (!sheet) {
      const r = btn.getBoundingClientRect(); const w = Math.min(400, window.innerWidth - 24);
      pop.style.width = w + 'px';
      let left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), window.innerWidth - w - 12);
      pop.style.maxHeight = '';
      const h = pop.offsetHeight; const below = window.innerHeight - r.bottom - 22, above = r.top - 22;
      let top;
      if (h <= below || below >= above) { top = r.bottom + 10; pop.style.maxHeight = Math.max(180, below) + 'px'; }
      else { const hh = Math.min(h, above); top = r.top - 10 - hh; pop.style.maxHeight = hh + 'px'; }
      pop.style.left = left + 'px'; pop.style.top = Math.max(12, top) + 'px';
    } else { pop.style.left = ''; pop.style.top = ''; pop.style.width = ''; pop.style.maxHeight = ''; }
  }
  function hidePop() { pop.hidden = true; popFor = null; }
  document.addEventListener('click', e => {
    const g = e.target.closest('.gl');
    if (g) { e.preventDefault(); if (popFor === g && !pop.hidden) hidePop(); else showPop(g); return; }
    if (e.target.closest('.gp-x')) { hidePop(); return; }
    if (!e.target.closest('.gpop')) hidePop();
    else if (e.target.closest('a')) hidePop();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) hidePop(); });
  window.addEventListener('scroll', () => { if (!pop.hidden && !pop.classList.contains('sheet')) hidePop(); }, { passive: true });
  if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('mouseover', e => {
      const g = e.target.closest && e.target.closest('.gl');
      if (g) { clearTimeout(leaveT); clearTimeout(hoverT); hoverT = setTimeout(() => showPop(g), 320); }
      else if (e.target.closest && e.target.closest('.gpop')) clearTimeout(leaveT);
    });
    document.addEventListener('mouseout', e => {
      const g = e.target.closest && (e.target.closest('.gl') || e.target.closest('.gpop'));
      if (g) { clearTimeout(hoverT); clearTimeout(leaveT); leaveT = setTimeout(() => { if (!pop.matches(':hover')) hidePop(); }, 260); }
    });
  }
  function termChips(terms) {
    if (!GL) buildGL();
    const seen = new Set();
    const chips = arr(terms).map(s => { let k = termKey({ term: s }); const lex = (DATA.lexicon || {}).merge || {}; let g = 0; while (lex[k] && g++ < 4) k = lex[k]; return GL.byKey.has(k) && !seen.has(k) ? (seen.add(k), '<button class="chip-term gl" type="button" data-k="' + esc(k) + '">' + esc(GL.byKey.get(k).t.term.replace(/\s*\(.*?\)\s*/g, ' ').trim()) + '</button>') : ''; }).join('');
    return chips ? '<div class="term-chips"><span class="note">Key words</span>' + chips + '</div>' : '';
  }

  /* ---------------- navigation ---------------- */
  function groupsOf(list) { const g = []; list.forEach(o => { let x = g.find(y => y.name === o.group); if (!x) g.push(x = { name: o.group, items: [] }); x.items.push(o); }); return g; }
  function renderNav() {
    const cur = parseRoute();
    $('#navList').innerHTML = groupsOf(OUTLINE).map(g => '<div class="nav-group"><p class="nav-h">' + esc(g.name) + '</p>' + g.items.map(o => {
      const has = !!MOD[o.id];
      return '<a class="nav-item' + (cur.mod === o.id ? ' active' : '') + (has ? '' : ' pending') + '" href="#/m/' + o.id + '/' + (has ? (mp(o.id).lastTab || 'overview') : 'overview') + '"' + (cur.mod === o.id ? ' aria-current="page"' : '') + '>' +
        '<span class="num">' + esc(o.n) + '</span><span>' + esc(o.short) + '</span>' + (has ? ring(modPct(o.id)) : '<span></span>') + '</a>';
    }).join('') + '</div>').join('');
    const total = AVAIL.length ? Math.round(AVAIL.reduce((s, o) => s + modPct(o.id), 0) / AVAIL.length) : 0;
    const vids = OUTLINE.filter(o => hasVideo(o.id)).length;
    $('#sideProgress').innerHTML = '<div class="row"><span>Your progress</span><b>' + total + '%</b></div><div class="bar"><i style="width:' + total + '%"></i></div><div class="row"><span>Videos attached</span><b>' + vids + ' of ' + OUTLINE.length + '</b></div>';
    $$('.side-tools a').forEach(a => a.classList.toggle('active', a.dataset.route === cur.page));
  }
  function parseRoute() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    const p = h.split('/').filter(Boolean);
    if (p[0] === 'm' && OUT[p[1]]) return { page: 'module', mod: p[1], tab: TABS.some(t => t.id === p[2]) ? p[2] : 'overview', sub: p[3], arg: p[4] };
    if (p[0] === 'glossary') return { page: 'glossary', sub: p[1], arg: p.slice(2).join('/') };
    if (p[0] === 'objections') return { page: 'objections' };
    if (p[0] === 'review') return { page: 'review' };
    return { page: 'home' };
  }
  let lastKey = '';
  function render() {
    const r = parseRoute();
    hidePop(); renderNav();
    const key = r.page + '/' + (r.mod || '') + '/' + (r.tab || '') + '/' + (r.page === 'glossary' ? (r.sub || '') : '');
    const sameModule = r.page === 'module' && lastKey.startsWith('module/' + r.mod + '/');
    if (r.page === 'module') renderModule(r);
    else if (r.page === 'glossary') renderGlossary(r);
    else if (r.page === 'objections') renderFinder();
    else if (r.page === 'review') renderReview();
    else renderHome();
    if (key !== lastKey) {
      const tabs = $('.tabs');
      if (sameModule && tabs) { const top = tabs.getBoundingClientRect().top + window.scrollY - (window.innerWidth <= 960 ? 57 : 0); window.scrollTo({ top: Math.min(window.scrollY, top), behavior: 'auto' }); }
      else window.scrollTo(0, 0);
      lastKey = key;
    }
    $('#shell').classList.remove('nav-open'); $('#navToggle').setAttribute('aria-expanded', 'false');
  }

  /* ---------------- home ---------------- */
  function renderHome() {
    const proofs = OUTLINE.filter(o => o.from);
    const last = P.last && MOD[P.last.mod] ? P.last : null;
    const first = MOD.primer ? 'primer' : (AVAIL[0] && AVAIL[0].id);
    const cap = MOD.capstone;
    const count = k => AVAIL.reduce((s, o) => s + arr(MOD[o.id][k]).length, 0);
    main.innerHTML = '<div class="page fade">' +
      '<section class="hero">' +
        '<p class="kicker">A guided course on Edward Feser’s <em>Five Proofs of the Existence of God</em></p>' +
        '<h1>Five proofs,<br><em>one</em> God.</h1>' +
        '<p class="lede">No philosophy background needed. Each chapter is prepared for you before you read it — plain-English lessons, every word defined, every step of every argument explained — then practised until you can explain it and defend it yourself.</p>' +
        '<div class="actions">' +
          (last ? '<a class="btn primary" href="#/m/' + last.mod + '/' + last.tab + '">Continue · ' + esc(OUT[last.mod].short) + ' · ' + esc(tabLabel(last.tab)) + '</a>' : '') +
          (first ? '<a class="btn' + (last ? '' : ' primary') + '" href="#/m/' + first + '/overview">' + (last ? 'Back to the start' : 'Begin with the foundations') + '</a>' : '') +
        '</div>' +
        '<p class="stats"><span><b>' + AVAIL.length + '</b> modules</span><span><b>' + glossaryEntries().length + '</b> defined terms</span><span><b>' + count('quiz') + '</b> quiz questions</span><span><b>' + count('objections') + '</b> objections answered</span></p>' +
      '</section>' +
      '<section class="converge" aria-label="How the five proofs converge">' +
        '<div class="starts">' + proofs.map(o => '<a class="start" href="#/m/' + o.id + '/overview"><span class="from">from ' + esc(o.from.toLowerCase()) + '</span><strong>' + esc(o.short) + '</strong></a>').join('') + '</div>' +
        '<svg viewBox="0 0 1000 72" preserveAspectRatio="none" aria-hidden="true">' + [100, 300, 500, 700, 900].map(x => '<path vector-effect="non-scaling-stroke" d="M' + x + ' 0 C ' + x + ' 44, 500 26, 500 72"/>').join('') + '</svg>' +
        '<div class="end"><strong>one and the same God</strong><span>purely actual · absolutely simple · all-knowing · being itself · necessary</span></div>' +
      '</section>' +
      '<div class="stack" style="margin-top:72px">' +
      '<section class="sec"><div class="sec-head"><h2>The course</h2><p class="note">For each chapter: prepare here → read the chapter in the book → come back to practise.</p></div><div class="modules">' +
        groupsOf(OUTLINE).map(g => '<div class="mgroup"><h3>' + esc(g.name) + '</h3>' + g.items.map(o => {
          const m = MOD[o.id];
          return '<a class="mrow' + (m ? '' : ' pending') + '" href="#/m/' + o.id + '/overview"><span class="n">' + esc(o.n) + '</span><span class="mt"><span class="lat">' + esc(o.latin) + '</span><strong>' + esc(m ? m.title : o.title) + '</strong><span class="tg">' + esc(m ? (m.tagline || '') : 'In preparation') + '</span></span>' +
            '<span class="mm">' + (m ? 'pp. ' + esc(m.bookPages) + '<br>' + fmtTime(m.estMinutes) + (hasVideo(o.id) ? ' · video' : '') : '') + '</span>' + (m ? ring(modPct(o.id)) : '<span></span>') + '</a>';
        }).join('') + '</div>').join('') + '</div></section>' +
      '<section class="sec"><h2>Review anytime</h2><div class="tool-links">' +
        '<a class="tool" href="#/glossary"><span class="k">Vocabulary</span><strong>' + glossaryEntries().length + ' terms</strong><span>Every word defined with an example, its origin, and the word it gets confused with.</span></a>' +
        '<a class="tool" href="#/review"><span class="k">Mixed review</span><strong>' + AVAIL.filter(o => o.id !== 'capstone').reduce((s, o) => s + arr(MOD[o.id].quiz).length, 0) + ' questions</strong><span>Random sets from every chapter, one question at a time.</span></a>' +
        '<a class="tool" href="#/objections"><span class="k">Objection finder</span><strong>' + count('objections') + ' replies</strong><span>Type what someone said; get the answer and the follow-up.</span></a>' +
      '</div></section>' +
      (cap && arr(cap.comparison).length ? '<section class="sec"><h2>The five proofs side by side</h2>' + compareTable(cap.comparison) + '</section>' : '') +
      '</div></div>';
  }
  function compareTable(rows) {
    const cols = [['startingPoint', 'Starts from'], ['keyPrinciple', 'Key principle'], ['conclusion', 'Concludes to'], ['keyDistinction', 'Crucial distinction'], ['bestFor', 'Best for'], ['mostCommonObjection', 'Usual objection'], ['quickReply', 'Quick reply']];
    return '<div class="table-wrap"><table class="compare"><thead><tr><th>Proof</th>' + cols.map(c => '<th>' + c[1] + '</th>').join('') + '</tr></thead><tbody>' +
      rows.map(r => '<tr><th>' + (r.chapter && OUT[r.chapter] ? '<a href="#/m/' + r.chapter + '/overview">' + esc(r.proof) + '</a>' : esc(r.proof)) + '</th>' + cols.map(c => '<td>' + inline(r[c[0]] || '') + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
  }

  /* ---------------- module shell ---------------- */
  function renderModule(r) {
    const o = OUT[r.mod], m = MOD[r.mod];
    if (!m) { main.innerHTML = '<div class="page"><div class="coming"><p class="kicker">' + esc(o.latin) + '</p><h1>' + esc(o.title) + '</h1><p>This module is still being written.</p></div></div>'; return; }
    const st = mp(m.id); st.lastTab = r.tab; P.last = { mod: m.id, tab: r.tab }; save();
    const pct = modPct(m.id);
    let prevG = 0;
    main.innerHTML =
      '<div class="page"><header class="mhead"><a class="crumb" href="#/">← All modules</a><p class="lat">' + esc(o.latin) + '</p><h1>' + esc(m.title) + '</h1>' +
        (m.tagline ? '<p class="tag">' + esc(m.tagline) + '</p>' : '') +
        '<div class="meta"><span>' + esc(m.label || '') + '</span><span>Book pages ' + esc(m.bookPages) + '</span><span>About ' + fmtTime(m.estMinutes) + ' of study</span><span>' + pct + '% complete</span></div>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div></header></div>' +
      '<nav class="tabs" aria-label="Module sections"><div class="tabs-in">' + TABS.map(t => {
        const sep = prevG && t.g !== prevG ? '<span class="tab-sep" aria-hidden="true"></span>' : ''; prevG = t.g;
        return sep + '<a class="tab' + (t.id === r.tab ? ' active' : '') + '" href="#/m/' + m.id + '/' + t.id + '"' + (t.id === r.tab ? ' aria-current="page"' : '') + '>' + esc(t.label) + (st.done[t.id] ? '<span class="dot" aria-label="complete"></span>' : '') + '</a>';
      }).join('') + '</div></nav>' +
      '<div id="paneWrap"></div>';
    const wrap = $('#paneWrap');
    const fn = { overview: tOverview, video: tVideo, summary: tLessons, argument: tArgument, concepts: tConcepts, objections: tObjections, explain: tExplain, persuade: tPersuade, practice: tPractice }[r.tab];
    fn(wrap, m, r);
    const pane = $('.pane', wrap) || wrap;
    pane.insertAdjacentHTML('beforeend', paneFoot(m, r.tab));
    const db = $('#doneBtn');
    if (db) db.addEventListener('click', () => { st.done[r.tab] = !st.done[r.tab]; save(); render(); if (st.done[r.tab]) toast(tabLabel(r.tab) + ' marked complete'); });
    linkify(wrap);
    const at = $('.tab.active'); if (at) at.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  function paneFoot(m, tab) {
    const i = TABS.findIndex(t => t.id === tab); const next = TABS[i + 1];
    const nextMod = OUTLINE[OUTLINE.findIndex(o => o.id === m.id) + 1];
    const done = mp(m.id).done[tab];
    return '<div class="pane-foot"><button class="btn' + (done ? ' done' : '') + '" id="doneBtn">' + (done ? '✓ Completed' : 'Mark “' + esc(tabLabel(tab)) + '” complete') + '</button>' +
      (next ? '<a class="btn primary" href="#/m/' + m.id + '/' + next.id + '">Next: ' + esc(next.label) + ' →</a>'
        : (nextMod && MOD[nextMod.id] ? '<a class="btn primary" href="#/m/' + nextMod.id + '/overview">Next module: ' + esc(nextMod.short) + ' →</a>' : '<a class="btn primary" href="#/">Back to the course</a>')) + '</div>';
  }
  const pane = (wrap, html, wide) => { wrap.innerHTML = '<div class="pane fade' + (wide ? ' wide' : '') + '">' + html + '</div>'; return $('.pane', wrap); };

  /* Start here */
  function tOverview(wrap, m) {
    const st = mp(m.id); const g = m.readingGuide || {};
    let h = '';
    if (g.beforeYouRead) h += '<section class="sec"><p class="kicker">Before you read pp. ' + esc(m.bookPages) + '</p><h2>What this chapter is about</h2>' + P_(g.beforeYouRead) + '</section>';
    h += '<div class="thesis lk">' + inline(m.oneSentence) + '</div>';
    h += '<section class="sec"><h2>How to work through this module</h2><ol class="steps">' +
      '<li><span><b>Read this page</b> — the preview, the words to know, and the reading map.</span></li>' +
      '<li><span><b>Watch the video</b> for a first, friendly pass over the whole chapter.</span></li>' +
      '<li><span><b>Go through the Lessons</b> one section at a time — plain English first, then the detail, then a quick check.</span></li>' +
      '<li><span><b>Read the chapter in the book</b> with the reading map beside you.</span></li>' +
      '<li><span><b>Walk the Argument</b> step by step, then the <b>Concepts</b> and <b>Objections</b>.</span></li>' +
      '<li><span><b>Explain, Persuade, Practice</b> — until you could teach it.</span></li></ol></section>';
    if (arr(g.knowFirst).length) h += '<section class="sec"><h2>Words to know first</h2><p class="lead-in">Learn these before you start. Tap any word in the course for its full definition.</p><div class="know">' +
      g.knowFirst.map(k => '<div class="know-row"><b>' + esc(k.term) + '</b><span class="lk">' + inline(k.plain) + '</span></div>').join('') + '</div></section>';
    if (arr(g.questionsToHold).length) h += '<section class="sec"><h2>Questions to hold while reading</h2><ol class="socratic">' + g.questionsToHold.map(q => '<li class="lk">' + inline(q) + '</li>').join('') + '</ol></section>';
    if (arr(g.map).length) h += '<section class="sec"><h2>Reading map</h2><p class="lead-in">What happens where in the chapter, how hard it is, and where to slow down.</p><div class="rmap">' +
      g.map.map(x => '<div class="rm"><div class="rm-p">pp. ' + esc(x.pages) + '</div><div class="rm-b"><div class="rm-h"><b>' + esc(x.section) + '</b>' + dots(Math.max(1, Math.min(3, +x.difficulty || 1))) + '</div><p class="lk">' + inline(x.what) + '</p>' + (x.tip ? '<p class="rm-tip lk">' + inline(x.tip) + '</p>' : '') + '</div></div>').join('') + '</div></section>';
    h += '<section class="sec"><h2>' + (g.beforeYouRead ? 'Where this fits' : 'The big picture') + '</h2>' + P_(m.bigPicture) + '</section>';
    if (arr(m.objectives).length) h += '<section class="sec"><h2>By the end you’ll be able to…</h2><ul class="checklist">' +
      m.objectives.map((x, i) => '<li><label><input type="checkbox" data-goal="' + i + '"' + (st.goals[i] ? ' checked' : '') + '><span>' + inline(x) + '</span></label></li>').join('') + '</ul></section>';
    if (arr(g.afterReading).length) h += '<section class="sec"><h2>After you read the chapter</h2><ul class="checklist">' +
      g.afterReading.map((x, i) => '<li><label><input type="checkbox" data-after="' + i + '"' + (st.after[i] ? ' checked' : '') + '><span>' + inline(x) + '</span></label></li>').join('') + '</ul></section>';
    if (arr(m.comparison).length) h += '<section class="sec"><h2>The five proofs side by side</h2>' + compareTable(m.comparison) + '</section>';
    if (arr(m.studyPlan).length) h += '<section class="sec"><h2>Study plan</h2><div class="plan">' + m.studyPlan.map(w => '<div class="wk"><span class="w">Week ' + esc(w.week) + '</span><div><h3>' + esc(w.focus) + '</h3><div class="prose sm"><ul>' + arr(w.tasks).map(t => '<li>' + inline(t) + '</li>').join('') + '</ul></div></div></div>').join('') + '</div></section>';
    if (arr(m.connections).length) h += '<section class="sec"><h2>Connections</h2><div class="links">' + m.connections.filter(c => OUT[c.to] && MOD[c.to]).map(c => '<a href="#/m/' + c.to + '/overview"><b>' + esc(OUT[c.to].short) + '</b><span>' + inline(c.note) + '</span></a>').join('') + '</div></section>';
    const p = pane(wrap, h, arr(m.comparison).length > 0);
    $$('[data-goal]', p).forEach(cb => cb.addEventListener('change', () => { st.goals[cb.dataset.goal] = cb.checked; save(); }));
    $$('[data-after]', p).forEach(cb => cb.addEventListener('change', () => { st.after[cb.dataset.after] = cb.checked; save(); }));
  }

  /* Video + NotebookLM */
  let videoPaneMod = null;
  function refreshVideoIfShown() { const r = parseRoute(); if (r.page === 'module' && r.tab === 'video' && videoPaneMod === r.mod) paintVideo(r.mod); }
  function tVideo(wrap, m) {
    videoPaneMod = m.id;
    const doc = DATA.docs && DATA.docs[m.id];
    const words = doc ? doc.text.split(/\s+/).length : 0;
    pane(wrap,
      '<section class="sec"><div class="sec-head"><h2>Chapter video</h2><span id="vidWhere" class="note"></span></div><div id="vidSlot"><p class="note">Loading…</p></div></section>' +
      '<section class="sec"><h2>Making the video in NotebookLM</h2><ol class="steps">' +
        '<li><span><b>Get the source document</b> below' + (doc ? ' — about ' + words.toLocaleString() + ' words' : '') + '. Download it, or copy it and paste it into NotebookLM as “Copied text”.</span></li>' +
        '<li><span>Open <b>notebooklm.google.com</b>, create a notebook for this chapter, and add the document as its only source.</span></li>' +
        '<li><span>In <b>Studio</b>, choose <b>Video Overview</b> → <b>Customize</b>, and paste the focus prompt below.</span></li>' +
        '<li><span>When it’s ready, <b>download</b> the video and drop it in the box above — or paste a YouTube (unlisted) or Google Drive link.</span></li></ol>' +
        (m.videoPrompt ? '<div class="sec-head" style="margin-top:8px"><h3>Focus prompt</h3><button class="btn sm" id="copyPrompt">Copy prompt</button></div><div class="prompt">' + esc(m.videoPrompt) + '</div>' : '') +
      '</section>' +
      (doc ? '<section class="sec"><div class="sec-head"><h2>Source document</h2><div class="actions"><button class="btn sm" id="copyDoc">Copy</button><button class="btn sm" id="dlDoc">Download .md</button></div></div>' +
        '<p class="lead-in">It’s also the single fullest write-up of the chapter in this course — a good read on its own.</p>' +
        '<details class="doc"><summary>Preview the document</summary><div class="prose">' + md(doc.text, { headings: true }) + '</div></details></section>' : ''));
    const cp = $('#copyPrompt'); if (cp) cp.addEventListener('click', () => copyText(m.videoPrompt, 'Focus prompt'));
    if (doc) { $('#copyDoc').addEventListener('click', () => copyText(doc.text, 'Document')); $('#dlDoc').addEventListener('click', () => downloadText(doc.file, doc.text)); }
    paintVideo(m.id);
  }
  async function paintVideo(id) {
    const slot = $('#vidSlot'); if (!slot) return;
    const v = await getVideo(id);
    if (!$('#vidSlot') || videoPaneMod !== id) return;
    const where = $('#vidWhere');
    if (v) {
      let player;
      if (v.kind === 'file' || isDirectVideo(v.url)) player = '<div class="video-frame"><video controls preload="metadata" playsinline src="' + esc(v.url) + '"></video></div>';
      else {
        const e = embedFor(v.url);
        player = (e && !IS_HOSTED) ? '<div class="video-frame"><iframe src="' + esc(e) + '" allow="fullscreen; picture-in-picture" allowfullscreen title="Chapter video"></iframe></div>'
          : '<div class="drop"><h3>This chapter’s video is linked</h3><a class="btn primary" href="' + esc(v.url) + '" target="_blank" rel="noopener">Open the video ↗</a><p class="note" style="word-break:break-all">' + esc(v.url) + '</p></div>';
      }
      slot.innerHTML = player + '<div class="actions" style="margin-top:14px"><button class="btn sm quiet" id="vidReplace">Replace video</button><button class="btn sm quiet" id="vidRemove">Remove</button></div><div id="attachBox" hidden style="margin-top:14px"></div>';
      if (where) where.textContent = v.where;
      $('#vidReplace').addEventListener('click', () => { const b = $('#attachBox'); b.hidden = false; b.innerHTML = attachHTML(); wireAttach(id); });
      const rm = $('#vidRemove');
      if (!videoDocs[id] && !localVidFlags[id] && folderVideo(id)) rm.remove();
      else rm.addEventListener('click', () => { if (confirm('Remove the video from this chapter?')) removeVideo(id); });
    } else { if (where) where.textContent = ''; slot.innerHTML = attachHTML(); wireAttach(id); }
  }
  function attachHTML() {
    const cloud = Caps.assets && Caps.db;
    return '<div class="drop" id="dropZone"><h3>Add this chapter’s video</h3>' +
      '<p>' + (cloud ? 'Drop an .mp4 here. Files up to 20 MB are saved to the course on every device; bigger files stay in this browser.' : 'Drop an .mp4 here — it’s kept in this browser.') + '</p>' +
      '<label class="btn primary">Choose a video file<input type="file" accept="video/*" id="vidFile" class="sr-only"></label>' +
      '<span class="or">or paste a link</span><div class="linkrow"><input class="field" id="vidLink" type="url" placeholder="YouTube or Google Drive link" aria-label="Video link"><button class="btn" id="vidLinkBtn">Attach</button></div></div>';
  }
  function wireAttach(id) {
    const z = $('#dropZone'); if (!z) return;
    $('#vidFile').addEventListener('change', e => attachFile(id, e.target.files[0]).then(() => paintVideo(id)));
    $('#vidLinkBtn').addEventListener('click', () => attachLink(id, $('#vidLink').value).then(() => paintVideo(id)));
    ['dragenter', 'dragover'].forEach(ev => z.addEventListener(ev, e => { e.preventDefault(); z.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach(ev => z.addEventListener(ev, e => { e.preventDefault(); z.classList.remove('drag'); }));
    z.addEventListener('drop', e => { const f = e.dataTransfer && e.dataTransfer.files[0]; if (f) attachFile(id, f).then(() => paintVideo(id)); });
  }

  /* Lessons — one section at a time */
  function checksHTML(list, prefix, st) {
    return arr(list).map((q, k) => {
      const key = prefix + ':' + k; const a = st.chk[key]; const done = a != null;
      return '<div class="check" data-ck="' + esc(key) + '"><p class="check-q">' + inline(q.q) + '</p><div class="opts">' +
        arr(q.options).map((o, j) => '<button class="opt' + (done ? (j === q.answer ? ' right' : (j === a ? ' wrong' : ' dim')) : '') + '" data-j="' + j + '"' + (done ? ' disabled' : '') + '><span class="k">' + 'ABCD'[j] + '</span><span>' + inline(o) + '</span></button>').join('') +
        '</div>' + (done ? '<div class="expl lk' + (a === q.answer ? '' : ' miss') + '"><b>' + (a === q.answer ? 'Right. ' : 'Not quite. ') + '</b>' + inline(q.explanation) + '</div>' : '') + '</div>';
    }).join('');
  }
  function tLessons(wrap, m, r) {
    const secs = arr(m.summary); const st = mp(m.id);
    let i = parseInt(r.sub, 10); if (isNaN(i)) i = st.lessonPos || 0; i = Math.max(0, Math.min(secs.length - 1, i));
    st.lessonPos = i; save();
    const s = secs[i] || {};
    const readN = secs.filter((_, k) => st.read[k]).length;
    const toc = '<nav class="toc" aria-label="Lessons"><p>' + readN + ' of ' + secs.length + ' lessons read</p>' + secs.map((x, k) => '<a href="#/m/' + m.id + '/summary/' + k + '" class="' + (k === i ? 'on' : '') + '">' + (st.read[k] ? '✓ ' : '') + esc(x.heading) + '</a>').join('') + '</nav>';
    const inlineToc = '<details class="toc-inline"><summary>Lesson ' + (i + 1) + ' of ' + secs.length + ' · all lessons</summary><ol>' + secs.map((x, k) => '<li><a href="#/m/' + m.id + '/summary/' + k + '">' + (st.read[k] ? '✓ ' : '') + esc(x.heading) + '</a></li>').join('') + '</ol></details>';
    wrap.innerHTML = '<div class="sum-layout rail pane-host"><div class="pane fade lesson" style="padding-inline:0;max-width:none">' + inlineToc +
      '<article class="sum-sec"><h2><small>Lesson ' + (i + 1) + ' of ' + secs.length + '</small>' + esc(s.heading) + '</h2>' +
        (s.plain ? '<div class="plain"><span class="lbl">In plain English</span><div class="lk">' + inline(s.plain) + '</div></div>' : '') +
        P_(s.body) +
        (s.takeaway ? '<div class="takeaway"><span class="lbl">Remember</span><p class="lk">' + inline(s.takeaway) + '</p></div>' : '') +
        termChips(s.terms) +
        (s.deepDive ? '<details class="deeper"' + (st.deepOpen ? ' open' : '') + '><summary><span>Go deeper</span><span class="note">the hardest idea here, slowly</span></summary>' + P_(s.deepDive) + '</details>' : '') +
        (arr(s.checks).length ? '<div class="checks"><h3>Check yourself</h3>' + checksHTML(s.checks, 'L' + i, st) + '</div>' : '') +
      '</article>' +
      '<div class="lesson-nav">' + (i > 0 ? '<a class="btn" href="#/m/' + m.id + '/summary/' + (i - 1) + '">← ' + esc(secs[i - 1].heading) + '</a>' : '<span></span>') +
        (i < secs.length - 1 ? '<a class="btn primary" id="nextLesson" href="#/m/' + m.id + '/summary/' + (i + 1) + '">Next lesson →</a>' : '<a class="btn primary" id="nextLesson" href="#/m/' + m.id + '/argument">Lessons done — on to the Argument →</a>') + '</div>' +
      '</div>' + toc + '</div>';
    $('#nextLesson', wrap).addEventListener('click', () => { st.read[i] = true; if (secs.every((_, k) => st.read[k])) st.done.summary = true; save(); });
    const dd = $('.deeper', wrap); if (dd) dd.addEventListener('toggle', () => { st.deepOpen = dd.open; save(); });
    wireChecks(wrap, s.checks, 'L' + i, st);
    const t = $('.toc a.on', wrap); if (t) t.scrollIntoView({ block: 'nearest' });
    lessonKeys(m, i, secs.length);
  }
  function wireChecks(root, list, prefix, st) {
    $$('.check', root).forEach(c => {
      const key = c.dataset.ck; const k = +key.split(':').pop(); const q = arr(list)[k];
      $$('.opt', c).forEach(b => b.addEventListener('click', () => {
        st.chk[key] = +b.dataset.j; save();
        const tmp = document.createElement('div'); tmp.innerHTML = checksHTML([q], prefix + '_tmp', { chk: { [prefix + '_tmp:0']: +b.dataset.j } });
        const fresh = tmp.firstElementChild; fresh.dataset.ck = key; c.replaceWith(fresh); linkify(fresh.parentElement);
      }));
    });
  }
  let lessonKeyH = null;
  function lessonKeys(m, i, n) {
    if (lessonKeyH) document.removeEventListener('keydown', lessonKeyH);
    lessonKeyH = e => {
      const r = parseRoute(); if (r.page !== 'module' || r.tab !== 'summary' || r.mod !== m.id || typing(e)) return;
      if (e.key === 'ArrowRight' && i < n - 1) { mp(m.id).read[i] = true; save(); location.hash = '#/m/' + m.id + '/summary/' + (i + 1); }
      else if (e.key === 'ArrowLeft' && i > 0) location.hash = '#/m/' + m.id + '/summary/' + (i - 1);
    };
    document.addEventListener('keydown', lessonKeyH);
  }

  /* Argument */
  function tArgument(wrap, m) {
    const a = m.argument || {}; const steps = arr(a.steps); const stages = arr(a.stages);
    const stageAt = {}; stages.forEach(s => { const n = parseInt(String(s.range || '').split(/[–-]/)[0], 10); if (!isNaN(n)) stageAt[n] = s.title; });
    const p = pane(wrap,
      '<section class="sec"><h2>' + esc(a.name || 'The argument') + '</h2>' + P_(a.overview) + '</section>' +
      (stages.length ? '<section class="sec"><h3>The stages at a glance</h3><div class="stages">' + stages.map(s => '<div class="stage"><span class="r">Steps ' + esc(s.range) + '</span><div><b>' + esc(s.title) + '</b><span class="lk">' + inline(s.gist) + '</span></div></div>').join('') + '</div></section>' : '') +
      '<section class="sec"><div class="sec-head"><h3>Every step (' + steps.length + ')</h3><div class="seg" role="group" aria-label="View"><button class="on" data-v="full">Full explanation</button><button data-v="lean">Steps only</button><button data-v="recall">Recall mode</button></div></div>' +
      '<div class="ledger" id="ledger">' + steps.map(s => (stageAt[s.n] ? '<div class="stage-sep">' + esc(stageAt[s.n]) + '</div>' : '') +
        '<div class="step ' + esc(s.kind || 'premise') + '"><div class="no">' + esc(s.n) + '</div><div class="body"><span class="kind">' + esc(s.kind || 'premise') + '</span><div class="txt lk">' + inline(s.text) + '</div>' +
        (s.why ? '<div class="why lk">' + inline(s.why) + '</div>' : '') +
        (s.example ? '<div class="why step-ex lk"><i>For example</i>' + inline(s.example) + '</div>' : '') +
        (s.challenge ? '<details class="step-ch"><summary>A skeptic might say…</summary><p class="lk"><i>“' + inline(String(s.challenge).replace(/^[“"]|[”"]$/g, '')) + '”</i></p>' + (s.answer ? '<p class="lk"><b>Reply:</b> ' + inline(s.answer) + '</p>' : '') + '</details>' : '') +
        '</div></div>').join('') + '</div></section>');
    const L = $('#ledger', p);
    $$('[data-v]', p).forEach(b => b.addEventListener('click', () => {
      $$('[data-v]', p).forEach(x => x.classList.toggle('on', x === b));
      L.classList.toggle('hide-why', b.dataset.v !== 'full'); L.classList.toggle('recall', b.dataset.v === 'recall');
      $$('.step', L).forEach(s => s.classList.remove('shown'));
    }));
    L.addEventListener('click', e => { const s = e.target.closest('.step'); if (s && L.classList.contains('recall') && !e.target.closest('.gl')) s.classList.add('shown'); });
  }

  /* Concepts */
  function entryHTML(t, mods, self) {
    return '<div class="entry"><div><h3>' + esc(t.term) + '</h3>' + (t.origin ? '<p class="origin">' + inline(t.origin) + '</p>' : '') + '</div><div class="body">' +
      '<p class="def lk" data-self="' + esc(self || '') + '">' + inline(t.definition) + '</p>' +
      (t.example ? '<p class="ex lk"><i>Example</i>' + inline(t.example) + '</p>' : '') +
      (t.confuseWith ? '<p class="cw lk"><i>Don’t confuse with</i>' + inline(t.confuseWith) + '</p>' : '') +
      (mods && mods.length ? '<p class="mods">' + mods.filter(x => OUT[x]).map(x => '<a href="#/m/' + x + '/concepts">' + esc(OUT[x].short) + '</a>').join('') + '</p>' : '') + '</div></div>';
  }
  function tConcepts(wrap, m, r) {
    const views = [['terms', 'Vocabulary (' + arr(m.keyTerms).length + ')'], ['distinctions', 'Distinctions'], ['examples', 'Examples & analogies'], ['myths', 'Misconceptions']];
    const v = views.some(x => x[0] === r.sub) ? r.sub : 'terms';
    let h = '<div class="seg" role="group">' + views.map(x => '<a class="' + (x[0] === v ? 'on' : '') + '" href="#/m/' + m.id + '/concepts/' + x[0] + '">' + x[1] + '</a>').join('') + '</div>';
    if (v === 'terms') {
      const terms = arr(m.keyTerms).slice().sort((a, b) => sortKey(a.term).localeCompare(sortKey(b.term)));
      h += '<section class="sec"><input class="field search" id="termQ" type="search" placeholder="Search these ' + terms.length + ' terms…" aria-label="Search terms"><div class="dict" id="termList">' + terms.map(t => entryHTML(t, null, termKey(t))).join('') + '</div></section>';
    } else if (v === 'distinctions') {
      h += '<section class="sec" style="gap:40px">' + arr(m.distinctions).map(d => '<div class="sec" style="gap:14px"><h3 class="vs-title">' + esc(d.name) + '</h3><div class="vs"><div><b>' + esc(d.left && d.left.label) + '</b><span class="lk">' + inline(d.left && d.left.desc) + '</span></div><div><b>' + esc(d.right && d.right.label) + '</b><span class="lk">' + inline(d.right && d.right.desc) + '</span></div>' +
        (d.whyItMatters ? '<div class="why lk"><strong>Why it matters.</strong> ' + inline(d.whyItMatters) + '</div>' : '') + '</div></div>').join('') + '</section>';
    } else if (v === 'examples') {
      h += '<section class="acc">' + arr(m.illustrations).map((x, i) => '<details' + (i === 0 ? ' open' : '') + '><summary><span>' + esc(x.title) + '</span><span class="src">' + (x.source === 'book' ? 'from the book' : 'course analogy') + '</span></summary>' + P_(x.body) + '</details>').join('') + '</section>';
    } else {
      h += '<section class="myths">' + arr(m.misconceptions).map(x => '<div class="myth"><p class="m">' + inline(x.myth) + '</p><p class="c lk">' + inline(x.correction) + '</p></div>').join('') + '</section>';
    }
    const p = pane(wrap, h);
    const q = $('#termQ', p);
    if (q) q.addEventListener('input', () => {
      const w = q.value.trim().toLowerCase();
      const list = arr(m.keyTerms).filter(t => !w || (t.term + ' ' + t.definition + ' ' + (t.example || '')).toLowerCase().includes(w)).sort((a, b) => sortKey(a.term).localeCompare(sortKey(b.term)));
      $('#termList', p).innerHTML = list.map(t => entryHTML(t, null, termKey(t))).join('') || '<p class="empty">No matching terms.</p>';
      linkify($('#termList', p));
    });
  }

  /* Objections */
  function objHTML(o, i, m, withFrom) {
    const d = Math.max(1, Math.min(3, parseInt(o.difficulty, 10) || 2));
    return '<article class="obj"><div class="obj-meta"><span class="n">Objection ' + (i + 1) + '</span>' + (o.whoRaises ? '<span>raised by ' + esc(o.whoRaises) + '</span>' : '') + dots(d) +
      (withFrom ? '<a class="from" href="#/m/' + m.id + '/objections">' + esc(OUT[m.id].short) + '</a>' : '') + '</div>' +
      '<h3>' + esc(o.title) + '</h3>' + P_(o.objection) +
      '<div class="actions"><button class="btn sm" data-toggle>Try answering first — then show the reply</button></div>' +
      '<div class="reveal"><div><div class="reply"><span class="lbl">The reply</span>' + P_(o.reply) +
        (o.pushback ? '<div class="press"><span class="lbl">If they press further</span>' + P_(o.pushback) + '</div>' : '') + '</div></div></div></article>';
  }
  function wireObjs(root) {
    $$('[data-toggle]', root).forEach(b => b.addEventListener('click', () => {
      const rv = b.closest('.obj').querySelector('.reveal'); const open = rv.classList.toggle('open');
      b.textContent = open ? 'Hide the reply' : 'Show the reply';
    }));
  }
  function tObjections(wrap, m) {
    const list = arr(m.objections);
    const p = pane(wrap, '<section class="sec"><div class="sec-head"><h2>Objections & replies</h2><div class="actions"><button class="btn sm quiet" id="openAll">Show all replies</button></div></div>' +
      '<p class="lead-in">Each objection at full strength, then the reply. Say your own answer out loud before you reveal it — that’s where the learning happens.</p></section>' +
      '<div class="objs">' + list.map((o, i) => objHTML(o, i, m)).join('') + '</div>');
    wireObjs(p);
    $('#openAll', p).addEventListener('click', e => { const open = !e.target.dataset.open; e.target.dataset.open = open ? '1' : ''; $$('.reveal', p).forEach(r => r.classList.toggle('open', open)); $$('[data-toggle]', p).forEach(b => { b.textContent = open ? 'Hide the reply' : 'Show the reply'; }); e.target.textContent = open ? 'Hide all replies' : 'Show all replies'; });
  }

  /* Explain */
  function tExplain(wrap, m) {
    const e = m.explain || {}; const st = mp(m.id);
    const lens = [['tweet', 'One sentence'], ['elevator', '30 seconds'], ['twoMinute', '2 minutes'], ['eli12', 'To a 12-year-old']].filter(x => e[x[0]]);
    const card = k => k === 'tweet' || k === 'elevator'
      ? '<div class="say-card"><div class="meta"><span>' + (k === 'tweet' ? String(e.tweet).length + ' characters' : 'about 30 seconds, spoken') + '</span><button class="btn sm quiet" id="copySay">Copy</button></div><p class="quote lk">' + inline(e[k]) + '</p></div>'
      : '<div class="say-card"><div class="meta"><span>' + (k === 'twoMinute' ? 'about two minutes, spoken' : 'for a twelve-year-old') + '</span><button class="btn sm quiet" id="copySay">Copy</button></div>' + P_(e[k]) + '</div>';
    const p = pane(wrap,
      '<section class="sec"><h2>Say it at every length</h2><p class="lead-in">Practise each version out loud until it feels natural.</p><div class="seg" role="group">' + lens.map((x, i) => '<button class="' + (i === 0 ? 'on' : '') + '" data-len="' + x[0] + '">' + x[1] + '</button>').join('') + '</div><div id="sayBox">' + (lens[0] ? card(lens[0][0]) : '') + '</div></section>' +
      (e.keyAnalogy ? '<section class="sec"><h2>The analogy to reach for</h2><p class="analogy lk">' + inline(e.keyAnalogy) + '</p></section>' : '') +
      (arr(e.whiteboard).length ? '<section class="sec"><h2>At the whiteboard</h2><p class="lead-in">What to draw and say, in order.</p><ol class="board">' + e.whiteboard.map(x => '<li><span>' + inline(x) + '</span></li>').join('') + '</ol></section>' : '') +
      '<section class="sec"><h2>Teach it back</h2>' + P_(m.teachBack) +
        '<textarea class="field" id="tbText" placeholder="Explain it in your own words, as if to a friend…" style="min-height:200px">' + esc(st.teach || '') + '</textarea>' +
        '<div class="actions">' + (aiOn() ? '<button class="btn primary" id="tbAI">Get feedback from the AI coach</button>' : '') + '<span class="note" id="tbCount"></span></div><div id="tbOut"></div></section>');
    let cur = lens[0] && lens[0][0];
    const wireCopy = () => { const c = $('#copySay', p); if (c) c.onclick = () => copyText(plain(e[cur]), 'Text'); };
    wireCopy();
    $$('[data-len]', p).forEach(b => b.addEventListener('click', () => { cur = b.dataset.len; $$('[data-len]', p).forEach(x => x.classList.toggle('on', x === b)); $('#sayBox', p).innerHTML = card(cur); $('#sayBox', p).firstElementChild.classList.add('fade'); wireCopy(); linkify($('#sayBox', p)); }));
    const ta = $('#tbText', p); const cnt = () => { $('#tbCount', p).textContent = (ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0) + ' words · saved as you type'; };
    ta.addEventListener('input', () => { st.teach = ta.value; save(); cnt(); }); cnt();
    const b = $('#tbAI', p);
    if (b) b.addEventListener('click', async () => {
      if (ta.value.trim().split(/\s+/).length < 40) { toast('Write a few sentences first'); return; }
      b.disabled = true; $('#tbOut', p).innerHTML = '<p class="note">Reading your explanation…</p>';
      try {
        const res = await Caps.sample.json('You are a patient, encouraging tutor for a complete beginner learning Edward Feser\'s "Five Proofs of the Existence of God".\n\nReference material (the standard for accuracy):\n' + modContext(m, 9000) +
          '\n\nTask given to the student:\n' + plain(m.teachBack) + '\n\nStudent\'s explanation:\n"""' + ta.value.slice(0, 6000) + '"""\n\nReturn JSON only: {"accuracy": 0-10, "clarity": 0-10, "persuasiveness": 0-10, "strengths": [2-3 short strings], "errors": [misstatements of Feser\'s argument], "missing": [key steps or distinctions left out], "nextTry": "one concrete instruction for the next attempt"}', { modelTier: 'default' });
        $('#tbOut', p).innerHTML = '<div class="ai-out"><span class="lbl">AI coach</span><p>Accuracy ' + esc(res.accuracy) + '/10 · Clarity ' + esc(res.clarity) + '/10 · Persuasiveness ' + esc(res.persuasiveness) + '/10</p>' +
          listBlock('Strengths', res.strengths) + listBlock('Errors', res.errors) + listBlock('Missing', res.missing) + (res.nextTry ? '<p><strong>Next time:</strong> ' + esc(res.nextTry) + '</p>' : '') + '</div>';
      } catch (err) { $('#tbOut', p).innerHTML = '<p class="note">' + esc(aiError(err)) + '</p>'; }
      b.disabled = false;
    });
  }

  /* Persuade */
  const PERSONAS = {
    friend: 'a curious, friendly agnostic who has never studied philosophy and gets lost in jargon',
    naturalist: 'a confident science-minded naturalist who thinks physics explains everything and that philosophy is mostly word games',
    newatheist: 'a sharp, sardonic New Atheist — quick with “what caused God?” and “god of the gaps” lines',
    student: 'a well-read philosophy graduate student who knows Hume, Kant and analytic metaphysics and pushes on technical premises'
  };
  const spars = {};
  function tPersuade(wrap, m) {
    const ps = m.persuade || {}; const auds = arr(ps.audiences);
    const audCard = a => '<div class="aud fade"><div class="start"><i>Where they’re starting from</i><span class="lk">' + inline(a.startingPoint || '') + '</span></div>' + P_(a.approach) +
      (a.openingQuestion ? '<p class="open lk">“' + inline(String(a.openingQuestion).replace(/^[“"]|[”"]$/g, '')) + '”</p>' : '') + (a.avoid ? '<p class="avoid lk"><i>Avoid:</i> ' + inline(a.avoid) + '</p>' : '') + '</div>';
    const p = pane(wrap,
      (ps.coreInsight ? '<section class="sec"><h2>The insight that makes it click</h2>' + P_(ps.coreInsight) + '</section>' : '') +
      (auds.length ? '<section class="sec"><h2>Know your listener</h2><div class="seg" role="group">' + auds.map((a, i) => '<button class="' + (i === 0 ? 'on' : '') + '" data-aud="' + i + '">' + esc(a.who) + '</button>').join('') + '</div><div id="audBox">' + audCard(auds[0]) + '</div></section>' : '') +
      (arr(ps.dialogue).length ? '<section class="sec"><h2>A model conversation</h2><p class="lead-in">Read both parts aloud. Notice how each reply goes back to a premise instead of scoring a point.</p><div class="dialogue">' + ps.dialogue.map(l => '<div class="line ' + (/^you$/i.test(l.speaker) ? 'you' : 'them') + '"><span class="who">' + esc(l.speaker) + '</span><span class="lk">' + inline(l.line) + '</span></div>').join('') + '</div></section>' : '') +
      (arr(ps.socratic).length ? '<section class="sec"><h2>Questions to ask instead of claims to make</h2><ol class="socratic">' + ps.socratic.map(q => '<li class="lk">' + inline(q) + '</li>').join('') + '</ol></section>' : '') +
      (arr(ps.traps).length ? '<section class="sec"><h2>Common ways people botch it</h2><div class="traps">' + ps.traps.map(t => '<div class="trap"><p class="t lk">' + inline(t.trap) + '</p><p class="f lk">' + inline(t.fix) + '</p></div>').join('') + '</div></section>' : '') +
      (aiOn() ? sparHTML() : ''));
    $$('[data-aud]', p).forEach(b => b.addEventListener('click', () => { $$('[data-aud]', p).forEach(x => x.classList.toggle('on', x === b)); $('#audBox', p).innerHTML = audCard(auds[+b.dataset.aud]); linkify($('#audBox', p)); }));
    if (aiOn()) wireSpar(m);
  }
  function sparHTML() {
    return '<section class="sec"><div class="sec-head"><h2>Spar with a skeptic</h2><span class="note">AI practice partner</span></div>' +
      '<p class="lead-in">The skeptic pushes back with real objections; you answer using this chapter. Ask the coach for a verdict whenever you like.</p>' +
      '<div class="actions"><select class="field" id="spPersona" style="max-width:320px" aria-label="Skeptic type"><option value="friend">Curious agnostic friend</option><option value="naturalist">Science-minded naturalist</option><option value="newatheist">Sharp New Atheist</option><option value="student">Philosophy grad student</option></select><button class="btn primary" id="spStart">Start a conversation</button></div>' +
      '<div class="dialogue" id="spLog" style="max-height:560px;overflow-y:auto"></div>' +
      '<div id="spInput" hidden><textarea class="field" id="spText" placeholder="Your reply…" style="min-height:110px"></textarea><div class="actions" style="margin-top:10px"><button class="btn primary" id="spSend">Send</button><button class="btn" id="spCoach">How am I doing?</button><button class="btn quiet" id="spStop" hidden>Stop</button></div></div></section>';
  }
  function wireSpar(m) {
    const S = spars[m.id] || (spars[m.id] = { turns: [], persona: 'friend', ctrl: null });
    const log = $('#spLog');
    const draw = extra => {
      log.innerHTML = S.turns.slice(1).map(t => '<div class="line ' + (t.role === 'user' ? 'you' : 'them') + '"><span class="who">' + (t.role === 'user' ? 'You' : 'Skeptic') + '</span><div class="prose">' + md(t.content) + '</div></div>').join('') + (extra || '');
      log.scrollTop = log.scrollHeight; $('#spInput').hidden = S.turns.length === 0;
    };
    $('#spPersona').value = S.persona;
    const run = async () => {
      const stop = $('#spStop'); stop.hidden = false; $('#spSend').disabled = true;
      S.ctrl = new AbortController(); stop.onclick = () => S.ctrl.abort();
      draw('<div class="line them"><span class="who">Skeptic</span><div class="prose" id="spLive"><p class="note">Thinking…</p></div></div>');
      try {
        const r = await Caps.sample(S.turns, { signal: S.ctrl.signal, cache: false, onText: u => { const el = $('#spLive'); if (el) { el.innerHTML = md(u.text); log.scrollTop = log.scrollHeight; } } });
        S.turns.push({ role: 'assistant', content: r.text });
      } catch (e) {
        if (e && e.text) S.turns.push({ role: 'assistant', content: e.text }); else toast(aiError(e));
        if (S.turns[S.turns.length - 1].role === 'user' && S.turns.length > 1) S.turns.pop();
      }
      stop.hidden = true; $('#spSend').disabled = false; draw();
    };
    $('#spStart').addEventListener('click', () => {
      S.persona = $('#spPersona').value;
      S.turns = [{ role: 'user', content: 'Role-play for debate practice. You are ' + PERSONAS[S.persona] + '. I am a beginner learning to explain and defend the arguments in Edward Feser\'s "Five Proofs of the Existence of God". Challenge me on the material below, one point at a time. Stay in character, be intellectually honest, keep each reply under 120 words. If I answer well, concede honestly and move to a harder point; if I misstate the argument, press on it. Never lecture me about the answer.\n\n' + modContext(m, 12000) + '\n\nOpen with your first challenge (1–3 sentences).' }];
      draw(); run();
    });
    $('#spSend').addEventListener('click', () => { const t = $('#spText'); const v = t.value.trim(); if (!v) return; S.turns.push({ role: 'user', content: v }); t.value = ''; run(); });
    $('#spCoach').addEventListener('click', async () => {
      if (!S.turns.some((t, i) => i > 0 && t.role === 'user')) { toast('Reply to the skeptic at least once first'); return; }
      const convo = S.turns.slice(1).map(t => (t.role === 'user' ? 'STUDENT: ' : 'SKEPTIC: ') + t.content).join('\n\n');
      const b = $('#spCoach'); b.disabled = true;
      draw('<div class="ai-out"><span class="lbl">Coach</span><div class="prose" id="coachLive"><p class="note">Reviewing…</p></div></div>');
      try {
        const r = await Caps.sample('You are a kind debate coach for a beginner learning Edward Feser\'s "Five Proofs of the Existence of God". Reference:\n' + modContext(m, 8000) + '\n\nPractice debate:\n' + convo.slice(-9000) +
          '\n\nCoach the STUDENT in 4 short parts: (1) what landed, (2) anywhere they misstated Feser, (3) the best reply to the skeptic\'s latest point, as 2–3 sentences they could say, (4) one tip on tone. Short Markdown bullets.', { cache: false, onText: u => { const el = $('#coachLive'); if (el) el.innerHTML = md(u.text); } });
        const el = $('#coachLive'); if (el) el.innerHTML = md(r.text);
      } catch (e) { const el = $('#coachLive'); if (el) el.textContent = aiError(e); }
      b.disabled = false;
    });
    draw();
  }

  /* Practice */
  function tPractice(wrap, m, r) {
    const views = [['quiz', 'Quiz · ' + arr(m.quiz).length], ['short', 'Short answer · ' + arr(m.shortAnswer).length], ['cards', 'Flashcards · ' + arr(m.flashcards).length], ['vocab', 'Vocabulary drill']];
    const v = views.some(x => x[0] === r.sub) ? r.sub : 'quiz';
    const p = pane(wrap, '<div class="seg" role="group">' + views.map(x => '<a class="' + (x[0] === v ? 'on' : '') + '" href="#/m/' + m.id + '/practice/' + x[0] + '">' + x[1] + '</a>').join('') + '</div><div id="prac"></div>');
    const box = $('#prac', p); const st = mp(m.id);
    if (v === 'quiz') {
      st.qpos = st.qpos || 0;
      runner(box, arr(m.quiz).map(q => ({ q })), { ans: st.qa, get pos() { return st.qpos; }, set pos(x) { st.qpos = x; } }, {
        save, title: 'Chapter quiz',
        reset() { st.qa = {}; st.qpos = 0; save(); render(); },
        onFinish(pct) { st.quizBest = Math.max(st.quizBest || 0, pct); save(); renderNav(); },
        best: st.quizBest
      });
    } else if (v === 'short') pShort(box, m);
    else if (v === 'cards') pCards(box, m);
    else drill(box, arr(m.keyTerms).map(t => ({ t, from: m.id })), m.id);
  }

  /* One-question-at-a-time runner */
  function runner(box, items, S, opts) {
    const letters = 'ABCD';
    let reviewing = false, subset = null;
    const n = () => (subset || items).length;
    const it = i => (subset || items)[i];
    const ansKey = i => subset ? 's' + subset[i].__i : i;
    const draw = () => {
      const list = subset || items; const N = list.length;
      const answered = list.filter((_, i) => S.ans[ansKey(i)] != null).length;
      const right = list.filter((x, i) => S.ans[ansKey(i)] === x.q.answer).length;
      if (S.pos >= N) return drawResults(right, N);
      const i = S.pos; const x = it(i); const q = x.q; const a = S.ans[ansKey(i)]; const done = a != null;
      box.innerHTML = '<div class="runner fade"><div class="run-top"><div class="row"><span>Question <b>' + (i + 1) + '</b> of ' + N + (subset ? ' · retrying misses' : '') + '</span><span><b>' + right + '</b> right · ' + answered + ' answered' + (opts.best != null && !subset ? ' · best ' + opts.best + '%' : '') + '</span></div><div class="bar"><i style="width:' + (100 * answered / N) + '%"></i></div></div>' +
        '<div class="qcard"><div class="qmeta">' + (q.level ? '<span>' + esc(q.level) + '</span>' : '') + (x.from ? '<a href="#/m/' + x.from + '/overview">' + esc(OUT[x.from].short) + '</a>' : '') + '</div><div class="qt">' + inline(q.q) + '</div><div class="opts">' +
          arr(q.options).map((o, k) => '<button class="opt' + (done ? (k === q.answer ? ' right' : (k === a ? ' wrong' : ' dim')) : '') + '" data-k="' + k + '"' + (done ? ' disabled' : '') + '><span class="k">' + letters[k] + '</span><span>' + inline(o) + '</span></button>').join('') + '</div>' +
          (done ? '<div class="expl lk' + (a === q.answer ? '' : ' miss') + '"><b>' + (a === q.answer ? 'Correct. ' : 'The answer is ' + letters[q.answer] + '. ') + '</b>' + inline(q.explanation) + '</div>' : '') + '</div>' +
        '<div class="run-nav"><button class="btn quiet" id="rPrev"' + (i === 0 ? ' disabled' : '') + '>← Back</button><span class="note">keys 1–4 answer · ← → move</span><button class="btn primary" id="rNext">' + (i === N - 1 ? 'See results' : (done ? 'Next →' : 'Skip →')) + '</button></div></div>';
      $$('.opt', box).forEach(b => b.addEventListener('click', () => pick(+b.dataset.k)));
      $('#rPrev', box).onclick = () => { S.pos = Math.max(0, S.pos - 1); opts.save(); draw(); };
      $('#rNext', box).onclick = () => { S.pos++; opts.save(); draw(); };
      linkify(box);
    };
    const pick = k => {
      const i = S.pos; if (i >= n() || S.ans[ansKey(i)] != null) return;
      S.ans[ansKey(i)] = k; opts.save();
      const list = subset || items;
      if (!subset && list.every((_, j) => S.ans[j] != null)) { const pct = Math.round(100 * list.filter((x, j) => S.ans[j] === x.q.answer).length / list.length); opts.onFinish && opts.onFinish(pct); }
      draw();
    };
    const drawResults = (right, N) => {
      const pct = N ? Math.round(100 * right / N) : 0;
      const missed = (subset || items).map((x, i) => ({ x, i })).filter(o => S.ans[ansKey(o.i)] !== o.x.q.answer);
      const msg = pct >= 90 ? 'Excellent — you’ve got this chapter.' : pct >= 75 ? 'Solid. Review the misses below and you’ll have it.' : pct >= 50 ? 'Good start. Revisit the lessons for the questions you missed, then retry.' : 'Worth another pass through the lessons — then try again.';
      box.innerHTML = '<div class="runner fade"><div class="result"><span class="note">' + esc(opts.title || 'Results') + '</span><span class="big">' + pct + '%</span><p>' + right + ' of ' + N + ' correct. ' + msg + '</p><div class="actions" style="justify-content:center">' +
        (missed.length ? '<button class="btn primary" id="rMiss">Retry the ' + missed.length + ' I missed</button>' : '') + '<button class="btn" id="rAgain">Start over</button><button class="btn quiet" id="rReview">' + (reviewing ? 'Hide' : 'Review') + ' answers</button></div></div>' +
        (reviewing ? '<div class="missed">' + (subset || items).map((x, i) => { const a = S.ans[ansKey(i)]; const ok = a === x.q.answer; return '<div class="mi"><p class="q">' + (ok ? '✓ ' : '✗ ') + inline(x.q.q) + '</p><p class="a">' + letters[x.q.answer] + '. ' + inline(x.q.options[x.q.answer]) + '</p><p class="e lk">' + inline(x.q.explanation) + '</p></div>'; }).join('') + '</div>' : '') + '</div>';
      const rm = $('#rMiss', box); if (rm) rm.onclick = () => { subset = missed.map(o => Object.assign({ __i: o.i }, o.x)); subset.forEach((_, j) => delete S.ans['s' + subset[j].__i]); S.pos = 0; reviewing = false; draw(); };
      $('#rAgain', box).onclick = () => { if (subset) { subset = null; } opts.reset ? opts.reset() : (Object.keys(S.ans).forEach(k => delete S.ans[k]), S.pos = 0, draw()); };
      $('#rReview', box).onclick = () => { reviewing = !reviewing; draw(); };
      linkify(box);
    };
    const keyh = e => {
      if (!document.body.contains(box)) { document.removeEventListener('keydown', keyh); return; }
      if (typing(e) || S.pos >= n()) return;
      if (/^[1-4]$/.test(e.key)) pick(+e.key - 1);
      else if (e.key === 'ArrowRight') { S.pos++; opts.save(); draw(); }
      else if (e.key === 'ArrowLeft' && S.pos > 0) { S.pos--; opts.save(); draw(); }
    };
    document.addEventListener('keydown', keyh);
    draw();
  }

  function pShort(box, m) {
    const st = mp(m.id); const qs = arr(m.shortAnswer);
    let i = Math.min(st.saPos || 0, Math.max(0, qs.length - 1)); let shown = false;
    const draw = () => {
      const q = qs[i]; if (!q) { box.innerHTML = '<p class="empty">No short-answer questions.</p>'; return; }
      const rub = st.rub[i] || {}; const hits = arr(q.rubric).filter((_, k) => rub[k]).length;
      box.innerHTML = '<div class="runner fade"><div class="run-top"><div class="row"><span>Question <b>' + (i + 1) + '</b> of ' + qs.length + '</span><span>' + (arr(q.rubric).length ? hits + ' of ' + q.rubric.length + ' points ticked' : '') + '</span></div><div class="bar"><i style="width:' + (100 * (i + 1) / qs.length) + '%"></i></div></div>' +
        '<div class="qcard"><div class="qt lk">' + inline(q.q) + '</div><textarea class="field" id="saText" placeholder="Write your answer before you look at the model…">' + esc(st.sa[i] || '') + '</textarea>' +
        '<div class="actions"><button class="btn" id="saShow">' + (shown ? 'Hide model answer' : 'Show model answer') + '</button>' + (aiOn() ? '<button class="btn primary" id="saGrade">Grade my answer</button>' : '') + '</div><div id="saOut"></div>' +
        (shown ? '<div class="model">' + P_(q.model, 'sm') + (arr(q.rubric).length ? '<div><p class="note" style="margin-bottom:8px">Tick what your answer covered</p><ul class="rubric">' + q.rubric.map((pt, k) => '<li><label><input type="checkbox" data-rub="' + k + '"' + (rub[k] ? ' checked' : '') + '><span class="lk">' + inline(pt) + '</span></label></li>').join('') + '</ul></div>' : '') + '</div>' : '') + '</div>' +
        '<div class="run-nav"><button class="btn quiet" id="saPrev"' + (i === 0 ? ' disabled' : '') + '>← Back</button><span></span><button class="btn primary" id="saNext"' + (i === qs.length - 1 ? ' disabled' : '') + '>Next question →</button></div></div>';
      const ta = $('#saText', box); ta.addEventListener('input', () => { st.sa[i] = ta.value; save(); });
      $('#saShow', box).onclick = () => { shown = !shown; draw(); };
      $('#saPrev', box).onclick = () => { i--; st.saPos = i; shown = false; save(); draw(); };
      $('#saNext', box).onclick = () => { i++; st.saPos = i; shown = false; save(); draw(); };
      $$('[data-rub]', box).forEach(c => c.addEventListener('change', () => { (st.rub[i] = st.rub[i] || {})[c.dataset.rub] = c.checked; save(); draw(); }));
      const g = $('#saGrade', box);
      if (g) g.onclick = async () => {
        const ans = (st.sa[i] || '').trim(); const out = $('#saOut', box);
        if (ans.split(/\s+/).length < 15) { toast('Write a fuller answer first'); return; }
        g.disabled = true; out.innerHTML = '<p class="note">Grading…</p>';
        try {
          const res = await Caps.sample.json('You grade short answers for a beginner-friendly course on Edward Feser\'s "Five Proofs of the Existence of God" (' + m.title + ').\n\nQuestion: ' + plain(q.q) + '\n\nModel answer: ' + plain(q.model) + '\n\nRubric points:\n' + arr(q.rubric).map(x => '- ' + plain(x)).join('\n') + '\n\nStudent answer:\n"""' + ans.slice(0, 5000) + '"""\n\nReturn JSON only: {"score": 0-10, "covered": [rubric points covered, verbatim], "missing": [rubric points missing, verbatim], "errors": [misstatements], "feedback": "2-3 encouraging sentences on how to improve"}', { modelTier: 'default' });
          const rb = st.rub[i] = st.rub[i] || {};
          arr(q.rubric).forEach((pt, k) => { if (arr(res.covered).some(c => plain(c).trim() === plain(pt).trim())) rb[k] = true; }); save();
          out.innerHTML = '<div class="ai-out"><span class="lbl">AI grade · ' + esc(res.score) + '/10</span>' + listBlock('Covered', res.covered) + listBlock('Missing', res.missing) + listBlock('Errors', res.errors) + (res.feedback ? '<p>' + esc(res.feedback) + '</p>' : '') + '</div>';
        } catch (e) { out.innerHTML = '<p class="note">' + esc(aiError(e)) + '</p>'; }
        g.disabled = false;
      };
      linkify(box);
    };
    draw();
  }

  function pCards(box, m) {
    const st = mp(m.id); const cards = arr(m.flashcards);
    let order = [], pos = 0, flipped = false;
    const lvl = i => st.fc[i] || 0;
    const queue = () => { order = cards.map((_, i) => i).sort((a, b) => lvl(a) - lvl(b) || Math.random() - .5); pos = 0; };
    queue();
    const draw = () => {
      const i = order[pos]; const c = cards[i];
      const cnt = k => cards.filter((_, j) => (k === 3 ? lvl(j) >= 3 : lvl(j) === k)).length;
      box.innerHTML = '<div class="runner fade"><div class="run-top"><div class="row"><span>Card <b>' + (pos + 1) + '</b> of ' + cards.length + '</span><span><b>' + cards.filter((_, j) => lvl(j) >= 2).length + '</b> known</span></div><div class="bar"><i style="width:' + (100 * cards.filter((_, j) => lvl(j) >= 2).length / Math.max(1, cards.length)) + '%"></i></div></div>' +
        (c ? '<button class="flash' + (flipped ? ' flipped' : '') + '" id="card" aria-label="Flashcard — press to flip"><div class="inner"><div class="face front"><span>' + inline(c.front) + '</span><span class="hint">tap or press space to flip</span></div><div class="face back"><span>' + inline(c.back) + '</span></div></div></button>' : '<p class="empty">No flashcards.</p>') +
        '<div class="actions" style="justify-content:center"><button class="btn" id="fAgain">Still learning <span class="note">1</span></button><button class="btn primary" id="fGot">I knew it <span style="opacity:.7">2</span></button></div>' +
        '<div class="fc-stats"><span>new <b>' + cnt(0) + '</b></span><span>learning <b>' + cnt(1) + '</b></span><span>known <b>' + cnt(2) + '</b></span><span>mastered <b>' + cnt(3) + '</b></span><button class="btn sm quiet" id="fShuffle">Reshuffle</button><button class="btn sm quiet" id="fReset">Reset</button></div></div>';
      const card = $('#card', box); if (card) card.addEventListener('click', () => { flipped = !flipped; card.classList.toggle('flipped', flipped); });
      $('#fAgain', box).onclick = () => grade(false); $('#fGot', box).onclick = () => grade(true);
      $('#fShuffle', box).onclick = () => { queue(); flipped = false; draw(); };
      $('#fReset', box).onclick = () => { st.fc = {}; save(); queue(); flipped = false; draw(); };
    };
    const grade = ok => { const i = order[pos]; if (i == null) return; st.fc[i] = ok ? Math.min(3, lvl(i) + 1) : 0; save(); pos = (pos + 1) % order.length; if (pos === 0) queue(); flipped = false; draw(); };
    const keyh = e => {
      if (!document.body.contains(box) || !$('#card', box)) { document.removeEventListener('keydown', keyh); return; }
      if (typing(e)) return;
      if (e.key === ' ') { e.preventDefault(); $('#card', box).click(); } else if (e.key === '1') grade(false); else if (e.key === '2') grade(true);
    };
    document.addEventListener('keydown', keyh);
    draw();
  }

  /* Vocabulary drill */
  const DRILL_MODES = [['def2term', 'Definition → word'], ['ex2term', 'Example → word'], ['term2def', 'Word → definition']];
  function maskTerm(text, t) {
    let out = String(text || '');
    const parts = [baseTerm(t)]; const ab = String(t.term || '').match(/\(([^)]+)\)/); if (ab) parts.push(ab[1]);
    parts.filter(p => p.length > 1).forEach(p => { out = out.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '▢▢▢'); });
    return out;
  }
  const drillState = {};
  function drill(box, pool, key) {
    const D = drillState[key] || (drillState[key] = { mode: 'def2term', q: null, picked: null, right: 0, seen: 0, recent: [] });
    const usable = () => pool.filter(x => D.mode !== 'ex2term' || x.t.example);
    const next = () => {
      const u = usable(); if (u.length < 4) { D.q = null; return; }
      let target, tries = 0;
      do { target = u[Math.floor(Math.random() * u.length)]; tries++; } while (D.recent.includes(target.t.term) && tries < 30);
      D.recent = [target.t.term].concat(D.recent).slice(0, Math.min(15, Math.floor(u.length / 2)));
      const others = shuffle(u.filter(x => baseTerm(x.t).toLowerCase() !== baseTerm(target.t).toLowerCase())).slice(0, 3);
      D.q = { target, opts: shuffle([target].concat(others)) }; D.picked = null;
    };
    const draw = () => {
      if (!D.q) next();
      const q = D.q;
      let h = '<div class="runner fade"><div class="sec-head"><div class="seg" role="group">' + DRILL_MODES.map(mm => '<button class="' + (mm[0] === D.mode ? 'on' : '') + '" data-mode="' + mm[0] + '">' + mm[1] + '</button>').join('') + '</div><span class="note">' + D.right + ' of ' + D.seen + ' right · ' + pool.length + ' words</span></div>';
      if (!q) { box.innerHTML = h + '<p class="empty">Not enough words for this mode.</p></div>'; bindModes(); return; }
      const t = q.target.t; const done = D.picked != null;
      const ask = D.mode === 'def2term' ? 'Which word is being defined?' : D.mode === 'ex2term' ? 'Which word does this example illustrate?' : 'Which definition fits this word?';
      const prompt = D.mode === 'term2def' ? '<p class="drill-term">' + esc(t.term) + '</p>' : '<p class="drill-prompt">' + inline(D.mode === 'def2term' ? t.definition : maskTerm(t.example, t)) + '</p>';
      h += '<div class="qcard"><div class="qmeta"><span>' + ask + '</span></div>' + prompt + '<div class="opts">' +
        q.opts.map((o, k) => '<button class="opt' + (done ? (o === q.target ? ' right' : (k === D.picked ? ' wrong' : ' dim')) : '') + '" data-k="' + k + '"' + (done ? ' disabled' : '') + '><span class="k">' + (k + 1) + '</span><span>' + (D.mode === 'term2def' ? inline(o.t.definition) : esc(o.t.term)) + '</span></button>').join('') + '</div>' +
        (done ? '<div class="drill-entry"><h3>' + esc(t.term) + '</h3>' + (t.origin ? '<p class="origin">' + inline(t.origin) + '</p>' : '') + '<p>' + inline(t.definition) + '</p>' + (t.example ? '<p><b>Example:</b> ' + inline(t.example) + '</p>' : '') + (t.confuseWith ? '<p><b>Don’t confuse with:</b> ' + inline(t.confuseWith) + '</p>' : '') + '</div>' : '') +
        '</div><div class="run-nav"><span></span><span class="note">keys 1–4 · Enter for next</span>' + (done ? '<button class="btn primary" id="drNext">Next word →</button>' : '<span></span>') + '</div></div>';
      box.innerHTML = h; bindModes();
      $$('.opt', box).forEach(b => b.addEventListener('click', () => pick(+b.dataset.k)));
      const nb = $('#drNext', box); if (nb) nb.addEventListener('click', () => { next(); draw(); });
    };
    const pick = k => { if (D.picked != null || !D.q) return; D.picked = k; D.seen++; if (D.q.opts[k] === D.q.target) D.right++; draw(); };
    const bindModes = () => $$('[data-mode]', box).forEach(b => b.addEventListener('click', () => { D.mode = b.dataset.mode; D.q = null; draw(); }));
    const keyh = e => {
      if (!document.body.contains(box)) { document.removeEventListener('keydown', keyh); return; }
      if (typing(e)) return;
      if (/^[1-4]$/.test(e.key)) pick(+e.key - 1);
      else if (e.key === 'Enter' && D.picked != null) { e.preventDefault(); next(); draw(); }
    };
    document.addEventListener('keydown', keyh);
    draw();
  }

  /* ---------------- global pages ---------------- */
  function renderGlossary(r) {
    const entries = glossaryEntries();
    const mode = r.sub === 'drill' ? 'drill' : 'browse';
    let modFilter = 'all', q = r.sub === 'find' ? (r.arg || '') : '';
    main.innerHTML = '<div class="page fade"><header class="mhead"><a class="crumb" href="#/">← All modules</a><p class="lat">Lexicon</p><h1>Vocabulary</h1><p class="tag">Every word in the course — defined, illustrated, traced to its origin, and set beside the word it gets confused with.</p>' +
      '<div class="meta"><span>' + entries.length + ' terms</span><span>from ' + AVAIL.length + ' modules</span></div></header>' +
      '<div class="seg" role="group" style="margin-bottom:28px"><a class="' + (mode === 'browse' ? 'on' : '') + '" href="#/glossary">Browse A–Z</a><a class="' + (mode === 'drill' ? 'on' : '') + '" href="#/glossary/drill">Drill all words</a></div><div id="gbox"></div></div>';
    const box = $('#gbox');
    if (mode === 'drill') { drill(box, entries.map(e => ({ t: e.t, from: e.mods[0] })), '__all'); return; }
    box.innerHTML = '<div class="actions"><input class="field search" id="gq" type="search" placeholder="Search words, definitions, examples…" aria-label="Search vocabulary" value="' + esc(q) + '">' +
      '<select class="field" id="gm" style="max-width:230px" aria-label="Filter by module"><option value="all">All modules</option>' + AVAIL.map(o => '<option value="' + o.id + '">' + esc(o.short) + '</option>').join('') + '</select></div>' +
      '<nav class="az" id="az" aria-label="Jump to letter"></nav><p class="note" id="gc" style="margin:4px 0 20px"></p><div id="gl"></div>';
    const paint = () => {
      const words = q.toLowerCase().split(/\s+/).filter(Boolean);
      const list = entries.filter(e => (modFilter === 'all' || e.mods.includes(modFilter)) && words.every(w => e.all.some(x => (x.t.term + ' ' + x.t.definition + ' ' + (x.t.example || '') + ' ' + (x.t.origin || '')).toLowerCase().includes(w))));
      const groups = {};
      list.forEach(e => { const L = (sortKey(e.t.term)[0] || '#').toUpperCase(); (groups[/[A-Z]/.test(L) ? L : '#'] = groups[/[A-Z]/.test(L) ? L : '#'] || []).push(e); });
      const letters = Object.keys(groups).sort();
      $('#gc').textContent = list.length + ' of ' + entries.length + ' terms';
      $('#az').innerHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(L => groups[L] ? '<a href="#" data-L="' + L + '">' + L + '</a>' : '<span>' + L + '</span>').join('');
      $('#gl').innerHTML = letters.map(L => '<section class="az-group" id="L-' + L + '"><h2 class="az-letter">' + L + '</h2><div class="dict">' + groups[L].map(e => entryHTML(e.t, e.mods, e.key)).join('') + '</div></section>').join('') || '<p class="empty">No matching terms.</p>';
      $$('[data-L]', $('#az')).forEach(a => a.addEventListener('click', ev => { ev.preventDefault(); const t = document.getElementById('L-' + a.dataset.L); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
      linkify($('#gl'));
    };
    $('#gq').addEventListener('input', e => { q = e.target.value; paint(); });
    $('#gm').addEventListener('change', e => { modFilter = e.target.value; paint(); });
    paint();
  }
  function renderFinder() {
    const all = [];
    AVAIL.forEach(o => arr(MOD[o.id].objections).forEach((x, i) => all.push({ x, i, m: MOD[o.id] })));
    main.innerHTML = '<div class="page fade"><header class="mhead"><a class="crumb" href="#/">← All modules</a><p class="lat">Sed Contra</p><h1>Objection finder</h1><p class="tag">Someone just said something. Find the reply.</p></header>' +
      '<div class="read"><input class="field" id="oq" type="search" placeholder="Try “what caused God”, “evil”, “science”, “infinite regress”…" aria-label="Search objections"><p class="note" id="oc" style="margin:12px 0 30px"></p><div class="objs" id="ol"></div></div></div>';
    const paint = q => {
      const words = (q || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
      const hits = all.filter(a => { const hay = (a.x.title + ' ' + a.x.objection + ' ' + (a.x.whoRaises || '') + ' ' + a.x.reply).toLowerCase(); return words.every(w => hay.includes(w)); });
      $('#oc').textContent = hits.length + ' of ' + all.length + ' objections';
      $('#ol').innerHTML = hits.slice(0, 60).map(a => objHTML(a.x, a.i, a.m, true)).join('') || '<p class="empty">Nothing matches — try one key word.</p>';
      wireObjs($('#ol')); linkify($('#ol'));
    };
    $('#oq').addEventListener('input', e => paint(e.target.value)); paint('');
  }
  let reviewSet = null;
  function renderReview() {
    const pool = [];
    AVAIL.forEach(o => { if (o.id !== 'capstone') arr(MOD[o.id].quiz).forEach(q => pool.push({ q, from: o.id })); });
    const fresh = () => { reviewSet = { items: shuffle(pool).slice(0, 25), ans: {}, pos: 0 }; };
    if (!reviewSet) fresh();
    main.innerHTML = '<div class="page fade"><header class="mhead"><a class="crumb" href="#/">← All modules</a><p class="lat">Repetitio</p><h1>Mixed review</h1><p class="tag">25 questions at random from every chapter — ' + pool.length + ' in the pool.</p></header><div class="read" id="rv"></div></div>';
    runner($('#rv'), reviewSet.items, reviewSet, { save() {}, title: 'Mixed review', reset() { fresh(); renderReview(); } });
  }

  /* ================= visual layer (overrides earlier definitions) ================= */

  const DIAGRAMS = DATA.diagrams || {};
  const modDiagrams = id => arr(DIAGRAMS[id]);
  const diagramsWhere = (id, where) => modDiagrams(id).filter(d => d.where && String(d.where).trim().toLowerCase() === String(where || '').trim().toLowerCase());
  const diagramsLoose = id => modDiagrams(id).filter(d => !d.where);

  function diagramHTML(d, key) {
    let body = '';
    const k = d.kind;
    if (k === 'compare') {
      body = '<div class="d-cols">' + arr(d.columns).map((c, i) => '<div class="d-col c' + (i % 3) + '"><b>' + esc(c.label) + '</b>' +
        (c.sub ? '<span class="sub">' + esc(c.sub) + '</span>' : '') + '<ul>' + arr(c.items).map(x => '<li>' + inline(x) + '</li>').join('') + '</ul></div>').join('') + '</div>' +
        (d.note ? '<p class="d-note lk">' + inline(d.note) + '</p>' : '');
    } else if (k === 'chain') {
      body = '<div class="d-chain" id="' + key + '">' + arr(d.links).map(l => '<div class="d-link ' + esc(l.role || '') + '"><div class="rail"><span class="knob"></span><span class="wire"></span></div>' +
        '<div class="box"><b>' + inline(l.text) + '</b>' + (l.note ? '<span class="lk">' + inline(l.note) + '</span>' : '') + '</div></div>').join('') + '</div>' +
        (d.collapse ? '<div class="actions"><button class="btn sm" data-pull="' + key + '">Take away the first cause</button></div><div class="d-collapse lk" id="' + key + '-c" hidden>' + inline(d.collapse) + '</div>' : '');
    } else if (k === 'flow') {
      body = '<div class="d-flow">' + arr(d.nodes).map((n, i) => '<div class="d-node"><div class="idx"><b>' + (n.step != null ? esc(n.step) : (i + 1)) + '</b><span class="wire"></span></div>' +
        '<div class="nb"><b class="lk">' + inline(n.text) + '</b>' + (n.note ? '<span class="lk">' + inline(n.note) + '</span>' : '') + '</div></div>').join('') + '</div>';
    } else if (k === 'tree') {
      const r = d.root || {};
      body = '<div class="d-tree"><div class="d-root"><b>' + inline(r.text) + '</b>' + (r.note ? '<span>' + inline(r.note) + '</span>' : '') + '</div>' +
        '<div class="d-branches">' + arr(d.branches).map(b => '<div class="d-branch"><b class="lk">' + inline(b.text) + '</b>' + (b.why ? '<span class="lk">' + inline(b.why) + '</span>' : '') + '</div>').join('') + '</div></div>';
    } else if (k === 'sorter') {
      body = '<div class="d-sorter" id="' + key + '" data-sorter="' + key + '"><p class="prompt">' + inline(d.prompt || 'Which one is it?') + '</p><div id="' + key + '-i"></div>' +
        '<p class="note" id="' + key + '-s"></p></div>';
    } else if (k === 'anatomy') {
      body = anatomyHTML(d);
    }
    return '<figure class="dgm" style="margin:0">' + (d.title || d.caption ? '<figcaption class="dh">' + (d.title ? '<b>' + esc(d.title) + '</b>' : '') + (d.caption ? '<span class="lk">' + inline(d.caption) + '</span>' : '') + '</figcaption>' : '') +
      '<div class="dgm-body">' + body + '</div></figure>';
  }
  function anatomyHTML(d) {
    return '<div class="d-anatomy">' +
      (d.says ? '<div class="zone says"><span class="zl">What they say</span><p>“' + inline(String(d.says).replace(/^[“"]|[”"]$/g, '')) + '”</p></div>' : '') +
      (arr(d.assumes).length ? '<div class="zone assumes"><span class="zl">What it quietly assumes</span><ul>' + d.assumes.map(x => '<li class="lk">' + inline(x) + '</li>').join('') + '</ul></div>' : '') +
      (d.breaks ? '<div class="zone breaks"><span class="zl">Where it breaks</span><p class="lk">' + inline(d.breaks) + '</p></div>' : '') +
      (d.reply ? '<div class="zone reply"><span class="zl">What you say back</span><p class="lk">' + inline(d.reply) + '</p></div>' : '') + '</div>';
  }
  function diagramsBlock(list, keyPrefix) {
    if (!list.length) return '';
    return '<div class="sec" style="gap:26px">' + list.map((d, i) => diagramHTML(d, keyPrefix + i)).join('') + '</div>';
  }
  function wireDiagrams(root, list, keyPrefix) {
    $$('[data-pull]', root).forEach(b => b.addEventListener('click', () => {
      const el = document.getElementById(b.dataset.pull); const note = document.getElementById(b.dataset.pull + '-c');
      const on = el.classList.toggle('pulled');
      if (note) note.hidden = !on;
      b.textContent = on ? 'Put the first cause back' : 'Take away the first cause';
    }));
    arr(list).forEach((d, i) => { if (d.kind === 'sorter') wireSorter(root, d, keyPrefix + i); });
    linkify(root);
  }
  function wireSorter(root, d, key) {
    const host = document.getElementById(key); if (!host) return;
    const items = shuffle(arr(d.items)); let pos = 0, right = 0;
    const draw = () => {
      const box = document.getElementById(key + '-i'); const score = document.getElementById(key + '-s');
      if (!box) return;
      if (pos >= items.length) {
        box.innerHTML = '<div class="d-item"><p class="t"><b>' + right + ' of ' + items.length + ' right.</b> ' + (right === items.length ? 'Perfect — you have the distinction.' : 'Run it again and watch the ones you missed.') + '</p><div class="actions"><button class="btn sm" id="' + key + '-again">Shuffle and try again</button></div></div>';
        const a = document.getElementById(key + '-again'); if (a) a.onclick = () => { pos = 0; right = 0; items.sort(() => Math.random() - .5); draw(); };
        if (score) score.textContent = '';
        return;
      }
      const it = items[pos];
      box.innerHTML = '<div class="d-item"><p class="t lk">' + inline(it.text) + '</p><div class="d-buckets">' +
        arr(d.buckets).map((b, i) => '<button data-b="' + i + '">' + esc(b) + '</button>').join('') + '</div><div id="' + key + '-w"></div></div>';
      if (score) score.textContent = (pos + 1) + ' of ' + items.length + ' · ' + right + ' right so far';
      $$('[data-b]', box).forEach(btn => btn.addEventListener('click', () => {
        const ok = +btn.dataset.b === +it.bucket;
        if (ok) right++;
        $$('[data-b]', box).forEach(x => { x.disabled = true; if (+x.dataset.b === +it.bucket) x.classList.add('right'); else if (x === btn) x.classList.add('wrong'); });
        const w = document.getElementById(key + '-w');
        w.innerHTML = '<div class="d-why lk"><b>' + (ok ? 'Right. ' : 'Not quite — it is “' + esc(d.buckets[it.bucket]) + '”. ') + '</b>' + inline(it.why || '') + '</div><div class="actions" style="margin-top:10px"><button class="btn sm primary" id="' + key + '-n">Next →</button></div>';
        linkify(w);
        document.getElementById(key + '-n').onclick = () => { pos++; draw(); };
      }));
      linkify(box);
    };
    draw();
  }

  /* vocabulary cards */
  function termEntry(name) {
    if (!GL) buildGL();
    const merge = (DATA.lexicon || {}).merge || {};
    let k = termKey({ term: name }); let g = 0; while (merge[k] && g++ < 4) k = merge[k];
    return GL.byKey.get(k) || null;
  }
  function vocabCards(names, modId) {
    const seen = new Set(); const cards = [];
    arr(names).forEach(n => {
      const e = termEntry(n); if (!e || seen.has(e.key)) return; seen.add(e.key);
      const t = e.t;
      cards.push('<button class="vcard" type="button" data-v="' + esc(e.key) + '"><b>' + esc(t.term) + '</b><span class="d">' + inline(t.definition) + '</span>' +
        '<span class="x" hidden>' + (t.origin ? '<span class="org">' + inline(t.origin) + '</span>' : '') +
        (t.example ? '<span><i>Example</i><p>' + inline(t.example) + '</p></span>' : '') +
        (t.confuseWith ? '<span><i>Don’t confuse with</i><p>' + inline(t.confuseWith) + '</p></span>' : '') + '</span></button>');
    });
    if (!cards.length) return '';
    return '<section class="sec"><div class="sec-head"><h3>Words in this lesson</h3><span class="note">tap a card for the example</span></div><div class="vocab-grid">' + cards.join('') + '</div></section>';
  }
  function wireVocab(root) {
    $$('.vcard', root).forEach(c => c.addEventListener('click', () => {
      const x = $('.x', c); if (!x) return;
      const open = x.hidden; x.hidden = !open; c.classList.toggle('open', open);
    }));
  }

  /* ---------------- module shell (stepper) ---------------- */
  function renderModule(r) {
    const o = OUT[r.mod], m = MOD[r.mod];
    if (!m) { main.innerHTML = '<div class="page"><div class="coming"><p class="kicker">' + esc(o.latin) + '</p><h1>' + esc(o.title) + '</h1><p>This module is still being written.</p></div></div>'; return; }
    const st = mp(m.id); st.lastTab = r.tab; P.last = { mod: m.id, tab: r.tab }; save();
    const pct = modPct(m.id);
    let prevG = 0;
    main.innerHTML =
      '<div class="page"><header class="mhead"><a class="crumb" href="#/">← All modules</a><p class="lat">' + esc(o.latin) + '</p><h1>' + esc(m.title) + '</h1>' +
        (m.tagline ? '<p class="tag">' + esc(m.tagline) + '</p>' : '') +
        '<div class="meta"><span>' + esc(m.label || '') + '</span><span>Book pages ' + esc(m.bookPages) + '</span><span>About ' + fmtTime(m.estMinutes) + '</span><span>' + pct + '% complete</span></div>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div></header></div>' +
      '<nav class="stepper" aria-label="Module sections"><div class="stepper-in">' + TABS.map((t, i) => {
        const sep = prevG && t.g !== prevG ? '<span class="stp-sep" aria-hidden="true"></span>' : ''; prevG = t.g;
        return sep + '<a class="stp' + (t.id === r.tab ? ' active' : '') + (st.done[t.id] ? ' done' : '') + '" href="#/m/' + m.id + '/' + t.id + '"' + (t.id === r.tab ? ' aria-current="page"' : '') +
          '><span class="i">' + (st.done[t.id] ? '✓' : (i + 1)) + '</span>' + esc(t.label) + '</a>';
      }).join('') + '</div></nav>' +
      '<div id="paneWrap"></div>';
    const wrap = $('#paneWrap');
    const fn = { overview: tOverview, video: tVideo, summary: tLessons, argument: tArgument, concepts: tConcepts, objections: tObjections, explain: tExplain, persuade: tPersuade, practice: tPractice }[r.tab];
    fn(wrap, m, r);
    const host = $('.pane', wrap) || $('.lesson', wrap) || wrap;
    host.insertAdjacentHTML('beforeend', paneFoot(m, r.tab));
    const db = $('#doneBtn');
    if (db) db.addEventListener('click', () => { st.done[r.tab] = !st.done[r.tab]; save(); render(); if (st.done[r.tab]) toast(tabLabel(r.tab) + ' marked done'); });
    linkify(wrap);
    const at = $('.stp.active'); if (at) at.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  /* ---------------- lessons ---------------- */
  function tLessons(wrap, m, r) {
    const secs = arr(m.summary); const st = mp(m.id);
    let i = parseInt(r.sub, 10); if (isNaN(i)) i = st.lessonPos || 0; i = Math.max(0, Math.min(secs.length - 1, i));
    st.lessonPos = i; save();
    const s = secs[i] || {};
    const readN = secs.filter((_, k) => st.read[k]).length;
    const dias = diagramsWhere(m.id, s.heading);
    const toc = '<nav class="toc" aria-label="Lessons"><p>' + readN + ' of ' + secs.length + ' read</p>' +
      secs.map((x, k) => '<a href="#/m/' + m.id + '/summary/' + k + '" class="' + (k === i ? 'on' : '') + '"><span class="tk">' + (st.read[k] ? '✓' : '') + '</span><span>' + esc(x.heading) + '</span></a>').join('') + '</nav>';
    wrap.innerHTML = '<div class="lesson-wrap"><div class="lesson fade">' +
      '<details class="toc-inline"><summary>Lesson ' + (i + 1) + ' of ' + secs.length + ' — jump to another</summary><ol>' +
        secs.map((x, k) => '<li><a href="#/m/' + m.id + '/summary/' + k + '">' + (st.read[k] ? '✓ ' : '') + esc(x.heading) + '</a></li>').join('') + '</ol></details>' +
      '<header class="l-head"><div class="l-progress">' + secs.map((_, k) => '<i class="' + (k === i ? 'cur' : (st.read[k] ? 'on' : '')) + '"></i>').join('') + '</div>' +
        '<p class="kicker">Lesson ' + (i + 1) + ' of ' + secs.length + ' · ' + esc(m.label || '') + '</p><h2>' + esc(s.heading) + '</h2></header>' +
      (s.plain ? '<div class="callout plain"><span class="lbl">In plain English</span><p class="lk">' + inline(s.plain) + '</p></div>' : '') +
      P_(s.body) +
      diagramsBlock(dias, 'dg' + i + '-') +
      (s.takeaway ? '<div class="callout take"><span class="lbl">Remember this</span><p class="lk">' + inline(s.takeaway) + '</p></div>' : '') +
      vocabCards(s.terms, m.id) +
      (s.deepDive ? '<details class="deeper"' + (st.deepOpen ? ' open' : '') + '><summary>Go deeper <span>the hard part, slowly</span></summary>' + P_(s.deepDive) + '</details>' : '') +
      (arr(s.checks).length ? '<section class="checks"><h3>Check yourself</h3>' + checksHTML(s.checks, 'L' + i, st) + '</section>' : '') +
      '<div class="lesson-nav">' + (i > 0 ? '<a class="btn" href="#/m/' + m.id + '/summary/' + (i - 1) + '">← ' + esc(secs[i - 1].heading) + '</a>' : '<span></span>') +
        (i < secs.length - 1 ? '<a class="btn primary" id="nextLesson" href="#/m/' + m.id + '/summary/' + (i + 1) + '">Next lesson →</a>'
          : '<a class="btn primary" id="nextLesson" href="#/m/' + m.id + '/argument">Lessons done — on to the argument →</a>') + '</div>' +
      '</div>' + toc + '</div>';
    $('#nextLesson', wrap).addEventListener('click', () => { st.read[i] = true; if (secs.every((_, k) => st.read[k])) st.done.summary = true; save(); });
    const dd = $('.deeper', wrap); if (dd) dd.addEventListener('toggle', () => { st.deepOpen = dd.open; save(); });
    wireChecks(wrap, s.checks, 'L' + i, st);
    wireVocab(wrap);
    wireDiagrams(wrap, dias, 'dg' + i + '-');
    const t = $('.toc a.on', wrap); if (t) t.scrollIntoView({ block: 'nearest' });
    lessonKeys(m, i, secs.length);
  }

  /* ---------------- argument ---------------- */
  function tArgument(wrap, m, r) {
    const a = m.argument || {}; const steps = arr(a.steps); const stages = arr(a.stages);
    const stageAt = {}; stages.forEach(s => { const n = parseInt(String(s.range || '').split(/[–-]/)[0], 10); if (!isNaN(n)) stageAt[n] = s.title; });
    const mode = r.sub === 'walk' ? 'walk' : 'list';
    const head = '<section class="sec"><h2>' + esc(a.name || 'The argument') + '</h2>' + P_(a.overview) + '</section>' +
      (stages.length ? '<section class="sec"><h3>The stages</h3><div class="stage-strip">' + stages.map((s, i) => '<button class="stage-chip" data-stage="' + esc(s.range) + '"><span class="r">Steps ' + esc(s.range) + '</span><b>' + esc(s.title) + '</b><span class="note lk">' + inline(s.gist) + '</span></button>').join('') + '</div></section>' : '') +
      '<div class="seg" role="group"><a class="' + (mode === 'list' ? 'on' : '') + '" href="#/m/' + m.id + '/argument">All ' + steps.length + ' steps</a><a class="' + (mode === 'walk' ? 'on' : '') + '" href="#/m/' + m.id + '/argument/walk">Walk it one step at a time</a></div>';
    if (mode === 'walk') {
      const p = pane(wrap, head + '<div id="walk"></div>');
      walker($('#walk', p), m, steps);
      return;
    }
    const p = pane(wrap, head +
      '<section class="sec"><div class="sec-head"><h3>Every step</h3><div class="seg" role="group"><button class="on" data-v="full">With explanation</button><button data-v="lean">Steps only</button></div></div>' +
      '<div class="ledger" id="ledger">' + steps.map(s => (stageAt[s.n] ? '<div class="stage-sep" id="stg-' + esc(s.n) + '">' + esc(stageAt[s.n]) + '</div>' : '') +
        '<div class="step ' + esc(s.kind || 'premise') + '" id="step-' + esc(s.n) + '"><div class="no"><b>' + esc(s.n) + '</b></div><div class="body"><span class="kind">' + esc(s.kind || 'premise') + '</span>' +
        '<div class="txt lk">' + inline(s.text) + '</div>' +
        (s.why ? '<div class="why lk"><i>Why it holds</i>' + inline(s.why) + '</div>' : '') +
        (s.example ? '<div class="ex lk"><i>For example</i>' + inline(s.example) + '</div>' : '') +
        (s.challenge ? '<details class="step-ch"><summary>A skeptic might say…</summary><div class="in"><p class="q lk">“' + inline(String(s.challenge).replace(/^[“"]|[”"]$/g, '')) + '”</p>' + (s.answer ? '<p class="lk"><b>Reply.</b> ' + inline(s.answer) + '</p>' : '') + '</div></details>' : '') +
        '</div></div>').join('') + '</div></section>' +
      diagramsBlock(diagramsLoose(m.id).filter(d => d.kind === 'flow' || d.kind === 'tree'), 'dga-'));
    const L = $('#ledger', p);
    $$('[data-v]', p).forEach(b => b.addEventListener('click', () => { $$('[data-v]', p).forEach(x => x.classList.toggle('on', x === b)); L.classList.toggle('lean', b.dataset.v === 'lean'); }));
    $$('[data-stage]', p).forEach(b => b.addEventListener('click', () => {
      const n = parseInt(String(b.dataset.stage).split(/[–-]/)[0], 10);
      const el = document.getElementById('stg-' + n) || document.getElementById('step-' + n);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    wireDiagrams(p, diagramsLoose(m.id).filter(d => d.kind === 'flow' || d.kind === 'tree'), 'dga-');
  }
  function walker(box, m, steps) {
    const st = mp(m.id); let i = Math.min(st.walkPos || 0, Math.max(0, steps.length - 1));
    const draw = () => {
      const s = steps[i] || {};
      box.innerHTML = '<div class="runner"><div class="run-top"><div class="row"><span>Step <b>' + (i + 1) + '</b> of ' + steps.length + '</span><span>' + esc(s.kind || '') + '</span></div><div class="bar"><i style="width:' + (100 * (i + 1) / steps.length) + '%"></i></div></div>' +
        '<div class="walk-card fade"><span class="no">Step ' + esc(s.n) + '</span><p class="txt lk">' + inline(s.text) + '</p>' +
        (s.why ? '<p class="why lk"><i>Why it holds</i>' + inline(s.why) + '</p>' : '') +
        (s.example ? '<p class="ex lk"><i>For example</i>' + inline(s.example) + '</p>' : '') +
        (s.challenge ? '<details class="step-ch"><summary>A skeptic might say…</summary><div class="in"><p class="q lk">“' + inline(String(s.challenge).replace(/^[“"]|[”"]$/g, '')) + '”</p>' + (s.answer ? '<p class="lk"><b>Reply.</b> ' + inline(s.answer) + '</p>' : '') + '</div></details>' : '') +
        '</div><div class="run-nav"><button class="btn quiet" id="wPrev"' + (i === 0 ? ' disabled' : '') + '>← Back</button><span class="note">← → to move</span>' +
        (i < steps.length - 1 ? '<button class="btn primary" id="wNext">Next step →</button>' : '<a class="btn primary" href="#/m/' + m.id + '/concepts">Done — on to concepts →</a>') + '</div></div>';
      const pv = $('#wPrev', box); if (pv) pv.onclick = () => { i = Math.max(0, i - 1); st.walkPos = i; save(); draw(); };
      const nx = $('#wNext', box); if (nx) nx.onclick = () => { i = Math.min(steps.length - 1, i + 1); st.walkPos = i; save(); draw(); };
      linkify(box);
    };
    const keyh = e => {
      if (!document.body.contains(box)) { document.removeEventListener('keydown', keyh); return; }
      if (typing(e)) return;
      if (e.key === 'ArrowRight') { i = Math.min(steps.length - 1, i + 1); st.walkPos = i; save(); draw(); }
      else if (e.key === 'ArrowLeft') { i = Math.max(0, i - 1); st.walkPos = i; save(); draw(); }
    };
    document.addEventListener('keydown', keyh);
    draw();
  }

  /* ---------------- concepts ---------------- */
  function tConcepts(wrap, m, r) {
    const dias = modDiagrams(m.id);
    const views = [['terms', 'Vocabulary · ' + arr(m.keyTerms).length]];
    if (dias.length) views.push(['visual', 'Visual breakdowns · ' + dias.length]);
    views.push(['distinctions', 'Distinctions · ' + arr(m.distinctions).length], ['examples', 'Examples'], ['myths', 'Misconceptions']);
    const v = views.some(x => x[0] === r.sub) ? r.sub : 'terms';
    let h = '<div class="seg" role="group">' + views.map(x => '<a class="' + (x[0] === v ? 'on' : '') + '" href="#/m/' + m.id + '/concepts/' + x[0] + '">' + x[1] + '</a>').join('') + '</div>';
    if (v === 'terms') {
      const terms = arr(m.keyTerms).slice().sort((a, b) => sortKey(a.term).localeCompare(sortKey(b.term)));
      h += '<section class="sec"><input class="field search" id="termQ" type="search" placeholder="Search these ' + terms.length + ' words…" aria-label="Search words"><div class="vocab-grid" id="termList">' + terms.map(t => vcardHTML(t)).join('') + '</div></section>';
    } else if (v === 'visual') {
      h += '<section class="sec"><p class="lead-in">Every idea in this chapter, drawn. Tap the interactive ones.</p></section>' + diagramsBlock(dias, 'dgc-');
    } else if (v === 'distinctions') {
      h += '<section class="sec" style="gap:36px">' + arr(m.distinctions).map(d => '<div class="sec" style="gap:12px"><h3>' + esc(d.name) + '</h3><div class="vs"><div><b>' + esc(d.left && d.left.label) + '</b><span class="lk">' + inline(d.left && d.left.desc) + '</span></div><div><b>' + esc(d.right && d.right.label) + '</b><span class="lk">' + inline(d.right && d.right.desc) + '</span></div>' +
        (d.whyItMatters ? '<div class="why lk"><strong>Why it matters.</strong> ' + inline(d.whyItMatters) + '</div>' : '') + '</div></div>').join('') + '</section>';
    } else if (v === 'examples') {
      h += '<section class="acc">' + arr(m.illustrations).map((x, i) => '<details' + (i === 0 ? ' open' : '') + '><summary><span>' + esc(x.title) + '</span><span class="src">' + (x.source === 'book' ? 'from the book' : 'course analogy') + '</span></summary>' + P_(x.body) + '</details>').join('') + '</section>';
    } else {
      h += '<section class="sec">' + arr(m.misconceptions).map(x => '<div class="myth"><p class="m">' + inline(x.myth) + '</p><p class="c lk">' + inline(x.correction) + '</p></div>').join('') + '</section>';
    }
    const p = pane(wrap, h, v === 'visual');
    wireVocab(p);
    if (v === 'visual') wireDiagrams(p, dias, 'dgc-');
    const q = $('#termQ', p);
    if (q) q.addEventListener('input', () => {
      const w = q.value.trim().toLowerCase();
      const list = arr(m.keyTerms).filter(t => !w || (t.term + ' ' + t.definition + ' ' + (t.example || '')).toLowerCase().includes(w)).sort((a, b) => sortKey(a.term).localeCompare(sortKey(b.term)));
      $('#termList', p).innerHTML = list.map(t => vcardHTML(t)).join('') || '<p class="empty">No matching words.</p>';
      wireVocab($('#termList', p)); linkify($('#termList', p));
    });
  }
  function vcardHTML(t) {
    return '<button class="vcard" type="button"><b>' + esc(t.term) + '</b><span class="d">' + inline(t.definition) + '</span>' +
      '<span class="x" hidden>' + (t.origin ? '<span class="org">' + inline(t.origin) + '</span>' : '') +
      (t.example ? '<span><i>Example</i><p>' + inline(t.example) + '</p></span>' : '') +
      (t.confuseWith ? '<span><i>Don’t confuse with</i><p>' + inline(t.confuseWith) + '</p></span>' : '') + '</span></button>';
  }

  /* ---------------- objections ---------------- */
  function objHTML(o, i, m, withFrom) {
    const d = Math.max(1, Math.min(3, parseInt(o.difficulty, 10) || 2));
    const anat = diagramsWhere(m.id, o.title).filter(x => x.kind === 'anatomy')[0];
    return '<article class="obj"><div class="obj-meta"><span class="n">Objection ' + (i + 1) + '</span>' + (o.whoRaises ? '<span>raised by ' + esc(o.whoRaises) + '</span>' : '') +
      '<span>difficulty</span>' + '<span class="dots" title="' + d + ' of 3">' + [1, 2, 3].map(k => '<i class="' + (k <= d ? 'on' : '') + '"></i>').join('') + '</span>' +
      (withFrom ? '<a class="from" href="#/m/' + m.id + '/objections">' + esc(OUT[m.id].short) + '</a>' : '') + '</div>' +
      '<h3>' + esc(o.title) + '</h3>' +
      '<div class="zone says"><span class="zl">What they say</span><p class="lk">' + (anat && anat.says ? inline(String(anat.says).replace(/^[“"]|[”"]$/g, '')) : md(o.objection).replace(/<\/?p>/g, ' ')) + '</p></div>' +
      '<div class="actions"><button class="btn sm" data-toggle>Answer it yourself first — then show the reply</button></div>' +
      '<div class="reveal"><div><div class="reply-wrap">' +
        (anat && arr(anat.assumes).length ? '<div class="zone assumes"><span class="zl">What it quietly assumes</span><ul>' + anat.assumes.map(x => '<li class="lk">' + inline(x) + '</li>').join('') + '</ul></div>' : '') +
        (anat && anat.breaks ? '<div class="zone breaks"><span class="zl">Where it breaks</span><p class="lk">' + inline(anat.breaks) + '</p></div>' : '') +
        '<div class="zone reply"><span class="zl">The reply</span>' + P_(o.reply) + '</div>' +
        (o.pushback ? '<div class="press"><span class="zl">If they press further</span>' + P_(o.pushback) + '</div>' : '') +
      '</div></div></div></article>';
  }
  function tObjections(wrap, m, r) {
    const list = arr(m.objections);
    const sub = r.sub === 'trainer' ? 'trainer' : 'read';
    const head = '<div class="seg" role="group"><a class="' + (sub === 'read' ? 'on' : '') + '" href="#/m/' + m.id + '/objections">All ' + list.length + ' objections</a><a class="' + (sub === 'trainer' ? 'on' : '') + '" href="#/m/' + m.id + '/objections/trainer">Reply trainer</a></div>';
    if (sub === 'trainer') { const p = pane(wrap, head + '<div id="trainer"></div>'); replyTrainer($('#trainer', p), m, list); return; }
    const p = pane(wrap, head +
      '<section class="sec"><div class="sec-head"><h2>Objections & replies</h2><button class="btn sm quiet" id="openAll">Show all replies</button></div>' +
      '<p class="lead-in">Each one is broken into four parts: what they say, what it assumes, where it breaks, and what you say back. Try your own answer before you reveal it.</p></section>' +
      '<div class="objs">' + list.map((o, i) => objHTML(o, i, m)).join('') + '</div>');
    wireObjs(p);
    $('#openAll', p).addEventListener('click', e => {
      const open = !e.target.dataset.open; e.target.dataset.open = open ? '1' : '';
      $$('.reveal', p).forEach(x => x.classList.toggle('open', open));
      $$('[data-toggle]', p).forEach(b => { b.textContent = open ? 'Hide the reply' : 'Show the reply'; });
      e.target.textContent = open ? 'Hide all replies' : 'Show all replies';
    });
  }
  function replyTrainer(box, m, list) {
    const pool = list.filter(o => o.reply);
    let order = shuffle(pool.map((_, i) => i)), pos = 0, right = 0, picked = null;
    const oneLine = o => { const t = plain(md(o.reply).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim(); const s = t.split(/(?<=[.!?])\s/); return (s[0] + (s[1] ? ' ' + s[1] : '')).slice(0, 230); };
    const draw = () => {
      if (pos >= order.length) {
        box.innerHTML = '<div class="result"><span class="big">' + Math.round(100 * right / Math.max(1, order.length)) + '%</span><p>' + right + ' of ' + order.length + ' right. Run it again — the replies stick after a few passes.</p><div class="actions" style="justify-content:center"><button class="btn primary" id="tAgain">Go again</button></div></div>';
        $('#tAgain', box).onclick = () => { order = shuffle(order); pos = 0; right = 0; picked = null; draw(); };
        return;
      }
      const o = pool[order[pos]];
      const wrongs = shuffle(pool.filter(x => x !== o)).slice(0, 2);
      const opts = picked ? picked.opts : shuffle([{ t: oneLine(o), ok: true }].concat(wrongs.map(w => ({ t: oneLine(w), ok: false }))));
      if (!picked) drawState.opts = opts;
      box.innerHTML = '<div class="runner"><div class="run-top"><div class="row"><span>Objection <b>' + (pos + 1) + '</b> of ' + order.length + '</span><span><b>' + right + '</b> right</span></div><div class="bar"><i style="width:' + (100 * pos / order.length) + '%"></i></div></div>' +
        '<div class="qcard"><div class="zone says"><span class="zl">Someone says</span><p class="lk">' + inline(plain(md(o.objection).replace(/<[^>]+>/g, ' ')).slice(0, 320)) + '</p></div>' +
        '<p class="note">Which reply is the right one?</p><div class="opts">' +
        opts.map((x, k) => '<button class="opt' + (picked ? (x.ok ? ' right' : (k === picked.k ? ' wrong' : ' dim')) : '') + '" data-k="' + k + '"' + (picked ? ' disabled' : '') + '><span class="k">' + 'ABC'[k] + '</span><span>' + inline(x.t) + '</span></button>').join('') + '</div>' +
        (picked ? '<div class="expl lk' + (opts[picked.k].ok ? '' : ' miss') + '"><b>' + (opts[picked.k].ok ? 'Right. ' : 'That was a reply to a different objection. ') + '</b>' + inline(o.title) + ' — ' + inline(oneLine(o)) + '</div>' : '') +
        '</div><div class="run-nav"><span></span>' + (picked ? '<button class="btn primary" id="tNext">Next →</button>' : '<span class="note">keys 1–3</span>') + '</div></div>';
      $$('.opt', box).forEach(b => b.addEventListener('click', () => { const k = +b.dataset.k; picked = { k, opts }; if (opts[k].ok) right++; draw(); }));
      const n = $('#tNext', box); if (n) n.onclick = () => { pos++; picked = null; draw(); };
      linkify(box);
    };
    const drawState = {};
    const keyh = e => {
      if (!document.body.contains(box)) { document.removeEventListener('keydown', keyh); return; }
      if (typing(e)) return;
      if (/^[1-3]$/.test(e.key)) { const b = $$('.opt', box)[+e.key - 1]; if (b && !b.disabled) b.click(); }
      else if (e.key === 'Enter') { const n = $('#tNext', box); if (n) n.click(); }
    };
    document.addEventListener('keydown', keyh);
    if (pool.length < 3) { box.innerHTML = '<p class="empty">Not enough objections in this module for the trainer.</p>'; return; }
    draw();
  }


  /* ---------------- boot ---------------- */
  $('#navToggle').addEventListener('click', () => { const s = $('#shell'); const o = s.classList.toggle('nav-open'); $('#navToggle').setAttribute('aria-expanded', String(o)); });
  $('#scrim').addEventListener('click', () => { $('#shell').classList.remove('nav-open'); $('#navToggle').setAttribute('aria-expanded', 'false'); });
  window.addEventListener('hashchange', render);
  window.__fp = { linkify, gl: () => GL };
  render();
  initCaps();
})();
