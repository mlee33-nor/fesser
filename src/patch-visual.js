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

