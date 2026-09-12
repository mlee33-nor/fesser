  /* ================= vocabulary layer (overrides earlier definitions) ================= */

  function knowFirstHTML(m, g) {
    const rows = arr(g.knowFirst);
    if (!rows.length) return '';
    const cards = rows.map(k => {
      const e = termEntry(k.term);
      const t = e ? e.t : null;
      return '<button class="vcard" type="button"><b>' + esc(k.term) + '</b><span class="d">' + inline(k.plain || (t && t.definition) || '') + '</span>' +
        '<span class="x" hidden>' + (t && t.origin ? '<span class="org">' + inline(t.origin) + '</span>' : '') +
        (t && t.definition && k.plain ? '<span><i>More precisely</i><p>' + inline(t.definition) + '</p></span>' : '') +
        (t && t.example ? '<span><i>Example</i><p>' + inline(t.example) + '</p></span>' : '') +
        (t && t.confuseWith ? '<span><i>Don’t confuse with</i><p>' + inline(t.confuseWith) + '</p></span>' : '') + '</span></button>';
    }).join('');
    return '<section class="sec"><div class="sec-head"><h2>Learn these ' + rows.length + ' words before you read</h2>' +
      '<a class="btn sm" href="#/m/' + m.id + '/practice/vocab">Drill them as flashcards →</a></div>' +
      '<p class="lead-in">Tap a card for the precise definition, an example, and the word it gets confused with. These are the words the chapter leans on.</p>' +
      '<div class="vocab-grid">' + cards + '</div></section>';
  }

  function tOverview(wrap, m) {
    const st = mp(m.id); const g = m.readingGuide || {};
    let h = '';
    if (g.beforeYouRead) h += '<section class="sec"><p class="kicker">Before you read pages ' + esc(m.bookPages) + '</p><h2>What this chapter is about</h2>' + P_(g.beforeYouRead) + '</section>';
    h += '<div class="thesis lk"><span class="lbl">The thesis in one sentence</span>' + inline(m.oneSentence) + '</div>';
    h += knowFirstHTML(m, g);
    if (arr(g.questionsToHold).length) h += '<section class="sec"><h2>Questions to hold in your head while you read</h2><ol class="socratic">' + g.questionsToHold.map(q => '<li class="lk">' + inline(q) + '</li>').join('') + '</ol></section>';
    if (arr(g.map).length) h += '<section class="sec"><h2>Reading map</h2><p class="lead-in">What happens on which pages, how hard it gets, and where to slow down.</p><div class="rmap">' +
      g.map.map(x => '<div class="rm"><div class="rm-p">pp. ' + esc(x.pages) + '</div><div class="rm-b"><div class="rm-h"><b>' + esc(x.section) + '</b>' + dots(Math.max(1, Math.min(3, +x.difficulty || 1))) + '</div><p class="lk">' + inline(x.what) + '</p>' + (x.tip ? '<p class="rm-tip lk">' + inline(x.tip) + '</p>' : '') + '</div></div>').join('') + '</div></section>';
    h += '<section class="sec"><h2>How to work through this module</h2><ol class="steps">' +
      '<li><span><b>Read this page</b> — the preview, the words, the reading map.</span></li>' +
      '<li><span><b>Watch the video</b> for a friendly first pass.</span></li>' +
      '<li><span><b>Work the Lessons</b> one at a time — plain English, then the detail, then a check.</span></li>' +
      '<li><span><b>Read the chapter in the book</b> with the reading map beside you.</span></li>' +
      '<li><span><b>Walk the Argument</b>, then Concepts and Objections.</span></li>' +
      '<li><span><b>Explain, Persuade, Practice</b> — until you could teach it.</span></li></ol></section>';
    h += '<section class="sec"><h2>' + (g.beforeYouRead ? 'Where this fits in the book' : 'The big picture') + '</h2>' + P_(m.bigPicture) + '</section>';
    if (arr(m.objectives).length) h += '<section class="sec"><h2>By the end you’ll be able to…</h2><ul class="checklist">' +
      m.objectives.map((x, i) => '<li><label><input type="checkbox" data-goal="' + i + '"' + (st.goals[i] ? ' checked' : '') + '><span>' + inline(x) + '</span></label></li>').join('') + '</ul></section>';
    if (arr(g.afterReading).length) h += '<section class="sec"><h2>After you read the chapter</h2><ul class="checklist">' +
      g.afterReading.map((x, i) => '<li><label><input type="checkbox" data-after="' + i + '"' + (st.after[i] ? ' checked' : '') + '><span>' + inline(x) + '</span></label></li>').join('') + '</ul></section>';
    if (arr(m.comparison).length) h += '<section class="sec"><h2>The five proofs side by side</h2>' + compareTable(m.comparison) + '</section>';
    if (arr(m.studyPlan).length) h += '<section class="sec"><h2>Study plan</h2><div class="plan">' + m.studyPlan.map(w => '<div class="wk"><span class="w">Week ' + esc(w.week) + '</span><div><h3>' + esc(w.focus) + '</h3><div class="prose sm"><ul>' + arr(w.tasks).map(t => '<li>' + inline(t) + '</li>').join('') + '</ul></div></div></div>').join('') + '</div></section>';
    if (arr(m.connections).length) h += '<section class="sec"><h2>Connections</h2><div class="links">' + m.connections.filter(c => OUT[c.to] && MOD[c.to]).map(c => '<a href="#/m/' + c.to + '/overview"><b>' + esc(OUT[c.to].short) + '</b><span>' + inline(c.note) + '</span></a>').join('') + '</div></section>';
    const p = pane(wrap, h, arr(m.comparison).length > 0);
    wireVocab(p);
    $$('[data-goal]', p).forEach(cb => cb.addEventListener('change', () => { st.goals[cb.dataset.goal] = cb.checked; save(); }));
    $$('[data-after]', p).forEach(cb => cb.addEventListener('change', () => { st.after[cb.dataset.after] = cb.checked; save(); }));
  }

  /* practice: chapter flashcards + vocabulary flashcards + vocabulary drill */
  function tPractice(wrap, m, r) {
    const views = [['quiz', 'Quiz · ' + arr(m.quiz).length], ['short', 'Short answer · ' + arr(m.shortAnswer).length],
      ['cards', 'Flashcards · ' + arr(m.flashcards).length], ['vocab', 'Vocabulary · ' + arr(m.keyTerms).length]];
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
    else {
      const mode = r.arg === 'drill' ? 'drill' : 'cards';
      box.innerHTML = '<div class="seg" role="group" style="margin-bottom:18px"><a class="' + (mode === 'cards' ? 'on' : '') + '" href="#/m/' + m.id + '/practice/vocab">Flashcards</a>' +
        '<a class="' + (mode === 'drill' ? 'on' : '') + '" href="#/m/' + m.id + '/practice/vocab/drill">Multiple choice drill</a></div><div id="vbox"></div>';
      const vb = $('#vbox', box);
      if (mode === 'drill') drill(vb, arr(m.keyTerms).map(t => ({ t, from: m.id })), m.id);
      else pCards(vb, m, 'vocab');
    }
  }

  function pCards(box, m, deck) {
    const st = mp(m.id);
    const vocab = deck === 'vocab';
    st.fcv = st.fcv || {};
    const store2 = vocab ? st.fcv : st.fc;
    const cards = vocab
      ? arr(m.keyTerms).map(t => ({
          front: t.term,
          back: t.definition + (t.example ? '\n\n**Example.** ' + t.example : ''),
          origin: t.origin, cw: t.confuseWith
        }))
      : arr(m.flashcards);
    let order = [], pos = 0, flipped = false;
    const lvl = i => store2[i] || 0;
    const queue = () => { order = cards.map((_, i) => i).sort((a, b) => lvl(a) - lvl(b) || Math.random() - .5); pos = 0; };
    queue();
    const draw = () => {
      const i = order[pos]; const c = cards[i];
      const cnt = k => cards.filter((_, j) => (k === 3 ? lvl(j) >= 3 : lvl(j) === k)).length;
      const known = cards.filter((_, j) => lvl(j) >= 2).length;
      box.innerHTML = '<div class="runner fade"><div class="run-top"><div class="row"><span>' + (vocab ? 'Word' : 'Card') + ' <b>' + (pos + 1) + '</b> of ' + cards.length + '</span><span><b>' + known + '</b> known</span></div>' +
        '<div class="bar"><i style="width:' + (100 * known / Math.max(1, cards.length)) + '%"></i></div></div>' +
        (c ? '<button class="flash' + (flipped ? ' flipped' : '') + '" id="card" aria-label="Flashcard — press to flip"><div class="inner">' +
          '<div class="face front"><span>' + inline(c.front) + '</span><span class="hint">tap or press space to flip</span></div>' +
          '<div class="face back"><span>' + md(c.back).replace(/<\/?p>/g, ' ') + '</span>' +
          (c.cw ? '<span class="hint">Don’t confuse with: ' + esc(String(c.cw).slice(0, 90)) + '</span>' : '') + '</div></div></button>'
          : '<p class="empty">No cards.</p>') +
        '<div class="actions" style="justify-content:center"><button class="btn" id="fAgain">Still learning <span style="opacity:.6">1</span></button><button class="btn primary" id="fGot">I knew it <span style="opacity:.7">2</span></button></div>' +
        '<div class="fc-stats"><span>new <b>' + cnt(0) + '</b></span><span>learning <b>' + cnt(1) + '</b></span><span>known <b>' + cnt(2) + '</b></span><span>mastered <b>' + cnt(3) + '</b></span>' +
        '<button class="btn sm quiet" id="fShuffle">Reshuffle</button><button class="btn sm quiet" id="fReset">Reset</button></div></div>';
      const card = $('#card', box); if (card) card.addEventListener('click', () => { flipped = !flipped; card.classList.toggle('flipped', flipped); });
      $('#fAgain', box).onclick = () => grade(false);
      $('#fGot', box).onclick = () => grade(true);
      $('#fShuffle', box).onclick = () => { queue(); flipped = false; draw(); };
      $('#fReset', box).onclick = () => { if (vocab) st.fcv = {}; else st.fc = {}; save(); location.reload(); };
    };
    const grade = ok => {
      const i = order[pos]; if (i == null) return;
      store2[i] = ok ? Math.min(3, lvl(i) + 1) : 0; save();
      pos = (pos + 1) % Math.max(1, order.length); if (pos === 0) queue();
      flipped = false; draw();
    };
    const keyh = e => {
      if (!document.body.contains(box) || !$('#card', box)) { document.removeEventListener('keydown', keyh); return; }
      if (typing(e)) return;
      if (e.key === ' ') { e.preventDefault(); $('#card', box).click(); } else if (e.key === '1') grade(false); else if (e.key === '2') grade(true);
    };
    document.addEventListener('keydown', keyh);
    draw();
  }

