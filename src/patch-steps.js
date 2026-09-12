  /* ================= step cross-links + rebuild drill ================= */

  const STEP_RE = /\bsteps?\s+(\d{1,2})(\s*(?:–|—|-|to|and|,)\s*\d{1,2})?/gi;
  function stepLinkify(root, modId) {
    const m = MOD[modId]; if (!m || !arr(m.argument && m.argument.steps).length) return;
    const valid = new Set(arr(m.argument.steps).map(s => String(s.n)));
    $$('.prose, .lk', root).forEach(scope => {
      if (scope.closest('.gpop, .doc')) return;
      if (scope.parentElement && scope.parentElement.closest('.prose, .lk')) return;
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
        acceptNode(n) { const p = n.parentElement; if (!p || p.closest('a, button, .gl, .step-link, h1, h2, h3')) return NodeFilter.FILTER_REJECT; return /step/i.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
      });
      const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        const text = node.nodeValue; STEP_RE.lastIndex = 0; let mm, last = 0, frag = null;
        while ((mm = STEP_RE.exec(text))) {
          const n = mm[1];
          if (!valid.has(n)) continue;
          frag = frag || document.createDocumentFragment();
          frag.appendChild(document.createTextNode(text.slice(last, mm.index)));
          const a = document.createElement('a');
          a.className = 'step-link'; a.href = '#/m/' + modId + '/argument/s' + n; a.textContent = mm[0];
          a.title = 'Go to step ' + n;
          frag.appendChild(a);
          last = mm.index + mm[0].length;
        }
        if (frag) { frag.appendChild(document.createTextNode(text.slice(last))); node.parentNode.replaceChild(frag, node); }
      });
    });
  }

  /* rebuild-the-argument drill: what does the argument need next? */
  function rebuildDrill(box, m) {
    const steps = arr(m.argument && m.argument.steps).filter(s => s.text);
    if (steps.length < 6) { box.innerHTML = '<p class="empty">This module has no step-by-step argument to rebuild.</p>'; return; }
    let round = 0, right = 0, picked = null, q = null;
    const make = () => {
      const i = 1 + Math.floor(Math.random() * (steps.length - 1));
      const wrong = shuffle(steps.filter((_, j) => j !== i && Math.abs(j - i) > 1)).slice(0, 3);
      q = { i, opts: shuffle([steps[i]].concat(wrong)) }; picked = null;
    };
    const draw = () => {
      if (!q) make();
      const i = q.i; const prev = steps.slice(Math.max(0, i - 2), i);
      box.innerHTML = '<div class="runner fade"><div class="run-top"><div class="row"><span>Round <b>' + (round + 1) + '</b></span><span><b>' + right + '</b> of ' + round + ' right</span></div></div>' +
        '<div class="qcard"><p class="note">The argument has reached this point:</p>' +
        '<div class="d-flow">' + prev.map(s => '<div class="d-node"><div class="idx"><b>' + esc(s.n) + '</b><span class="wire"></span></div><div class="nb"><b class="lk">' + inline(s.text) + '</b></div></div>').join('') +
        '<div class="d-node"><div class="idx"><b>?</b></div><div class="nb"><b>What must come next?</b></div></div></div>' +
        '<div class="opts">' + q.opts.map((s, k) => '<button class="opt' + (picked != null ? (s === steps[i] ? ' right' : (k === picked ? ' wrong' : ' dim')) : '') + '" data-k="' + k + '"' + (picked != null ? ' disabled' : '') + '><span class="k">' + 'ABCD'[k] + '</span><span>' + inline(s.text) + '</span></button>').join('') + '</div>' +
        (picked != null ? '<div class="expl lk' + (q.opts[picked] === steps[i] ? '' : ' miss') + '"><b>' + (q.opts[picked] === steps[i] ? 'Right — step ' + esc(steps[i].n) + '. ' : 'The next step is ' + esc(steps[i].n) + '. ') + '</b>' + inline(steps[i].why || steps[i].text) + '</div>' : '') +
        '</div><div class="run-nav"><span class="note">keys 1–4</span>' + (picked != null ? '<button class="btn primary" id="rbNext">Next →</button>' : '<span></span>') + '</div></div>';
      $$('.opt', box).forEach(b => b.addEventListener('click', () => { if (picked != null) return; picked = +b.dataset.k; round++; if (q.opts[picked] === steps[q.i]) right++; draw(); }));
      const n = $('#rbNext', box); if (n) n.onclick = () => { make(); draw(); };
      linkify(box);
    };
    const keyh = e => {
      if (!document.body.contains(box)) { document.removeEventListener('keydown', keyh); return; }
      if (typing(e)) return;
      if (/^[1-4]$/.test(e.key)) { const b = $$('.opt', box)[+e.key - 1]; if (b && !b.disabled) b.click(); }
      else if (e.key === 'Enter') { const n = $('#rbNext', box); if (n) n.click(); }
    };
    document.addEventListener('keydown', keyh);
    draw();
  }

  /* practice gains the rebuild drill; module render gains step links */
  function tPractice(wrap, m, r) {
    const hasSteps = arr(m.argument && m.argument.steps).length >= 6;
    const views = [['quiz', 'Quiz · ' + arr(m.quiz).length], ['short', 'Short answer · ' + arr(m.shortAnswer).length],
      ['cards', 'Flashcards · ' + arr(m.flashcards).length], ['vocab', 'Vocabulary · ' + arr(m.keyTerms).length]];
    if (hasSteps) views.push(['rebuild', 'Rebuild the argument']);
    const v = views.some(x => x[0] === r.sub) ? r.sub : 'quiz';
    const p = pane(wrap, '<div class="seg" role="group">' + views.map(x => '<a class="' + (x[0] === v ? 'on' : '') + '" href="#/m/' + m.id + '/practice/' + x[0] + '">' + x[1] + '</a>').join('') + '</div><div id="prac"></div>');
    const box = $('#prac', p); const st = mp(m.id);
    if (v === 'quiz') {
      st.qpos = st.qpos || 0;
      runner(box, arr(m.quiz).map(q => ({ q })), { ans: st.qa, get pos() { return st.qpos; }, set pos(x) { st.qpos = x; } }, {
        save, title: 'Chapter quiz', best: st.quizBest,
        reset() { st.qa = {}; st.qpos = 0; save(); render(); },
        onFinish(pct) { st.quizBest = Math.max(st.quizBest || 0, pct); save(); renderNav(); }
      });
    } else if (v === 'short') pShort(box, m);
    else if (v === 'cards') pCards(box, m, 'chapter');
    else if (v === 'rebuild') rebuildDrill(box, m);
    else {
      const mode = r.arg === 'drill' ? 'drill' : 'cards';
      box.innerHTML = '<div class="seg" role="group" style="margin-bottom:18px"><a class="' + (mode === 'cards' ? 'on' : '') + '" href="#/m/' + m.id + '/practice/vocab">Flashcards</a>' +
        '<a class="' + (mode === 'drill' ? 'on' : '') + '" href="#/m/' + m.id + '/practice/vocab/drill">Multiple choice drill</a></div><div id="vbox"></div>';
      const vb = $('#vbox', box);
      if (mode === 'drill') drill(vb, arr(m.keyTerms).map(t => ({ t, from: m.id })), m.id);
      else pCards(vb, m, 'vocab');
    }
  }

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
    stepLinkify(wrap, m.id);
    const at = $('.stp.active'); if (at) at.scrollIntoView({ block: 'nearest', inline: 'center' });
    const want = /^s(\d+)$/.exec(r.sub || '');
    if (want && r.tab === 'argument') {
      const el = document.getElementById('step-' + want[1]);
      if (el) { el.classList.add('step-target'); setTimeout(function () { el.scrollIntoView({ block: 'center' }); }, 60); }
    }
  }

