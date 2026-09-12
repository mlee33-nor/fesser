const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const state = JSON.parse(localStorage.getItem('fiveProofsState') || '{"checks":{},"scores":{},"notes":{},"last":1}');
const VIDEO_FILES = ['','chapter-1-aristotelian-proof.mp4','chapter-2-neo-platonic-proof.mp4','chapter-3-augustinian-proof.mp4','chapter-4-thomistic-proof.mp4','chapter-5-rationalist-proof.mp4','chapter-6-nature-of-god.mp4','chapter-7-common-objections.mp4'];
const save = () => { localStorage.setItem('fiveProofsState', JSON.stringify(state)); updateProgress(); };
const toast = (msg) => { const el=$('#toast'); el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2200); };
const totalChecks = COURSE.length * 5;

function chapterProgress(id){
  const checks=(state.checks[id]||[]).filter(Boolean).length;
  const quiz=(state.scores[id]||0)>=80 ? 1 : 0;
  return Math.min(5, checks + quiz);
}
function updateProgress(){
  const earned=COURSE.reduce((n,c)=>n+chapterProgress(c.id),0);
  const pct=Math.round(earned/totalChecks*100);
  $('#overall-percent').textContent=`${pct}%`; $('#overall-bar').style.width=`${pct}%`;
  $('#overall-detail').textContent=`${earned} of ${totalChecks} mastery checks complete`;
  $$('.nav-item').forEach((el,i)=>el.classList.toggle('complete',chapterProgress(i+1)===5));
}

function buildNav(){
  $('#chapter-nav').innerHTML=`<button class="nav-item active" data-home><span>⌂</span><strong>Course map</strong></button>`+
    COURSE.map(c=>`<button class="nav-item" data-chapter="${c.id}"><span>${String(c.id).padStart(2,'0')}</span><strong>${c.title.replace('The ','')}</strong></button>`).join('');
  $('#course-grid').innerHTML=COURSE.map(c=>`<article class="course-card" data-chapter="${c.id}" tabindex="0">
    <div class="num">${String(c.id).padStart(2,'0')}</div><div><div class="card-status">${chapterProgress(c.id)===5?'Mastered':`${chapterProgress(c.id)}/5 checks`}</div><h3>${c.title}</h3><p>${c.question}</p></div><div>→</div></article>`).join('');
}

function showHome(){
  $('#course-view').hidden=false; $('#chapter-view').hidden=true; $('#capstone-view').hidden=true; $('#crumb-title').textContent='Course map';
  $$('.nav-item').forEach(x=>x.classList.toggle('active',x.hasAttribute('data-home'))); window.scrollTo(0,0); buildNav(); updateProgress();
}

function showChapter(id, tab='summary'){
  const c=COURSE.find(x=>x.id===Number(id)); if(!c)return; state.last=c.id; save();
  $('#course-view').hidden=true; $('#capstone-view').hidden=true; $('#chapter-view').hidden=false; $('#crumb-title').textContent=c.title;
  $$('.nav-item').forEach(x=>x.classList.toggle('active',Number(x.dataset.chapter)===c.id));
  $('#chapter-view').innerHTML=`
    <section class="chapter-hero"><div class="chapter-kicker"><span>${c.icon}</span> Chapter ${c.id} · Book pages ${c.pages}</div><h1>${c.title}</h1><p class="thesis">${c.thesis}</p><div class="chapter-meta"><span>◷ ${c.duration}</span><span>◎ ${c.objectives.length} outcomes</span><span>✓ Quiz: ${state.scores[c.id]||'not taken'}${state.scores[c.id]?'%':''}</span></div></section>
    <div class="lesson-tabs">${[['summary','Deep summary'],['map','Argument map'],['quiz','Quiz'],['cards','Flashcards'],['practice','Practice'],['video','Video + NotebookLM']].map(([k,l])=>`<button class="lesson-tab ${tab===k?'active':''}" data-tab="${k}">${l}</button>`).join('')}</div>
    <section class="lesson-content" id="lesson-content"></section>`;
  renderTab(c,tab); window.scrollTo(0,0);
}

function masteryChecklist(c){
  const labels=['I can define the key terms','I can reconstruct the argument','I can identify the weakest premise','I can answer a serious objection'];
  return `<div class="checklist"><h3>Mastery checks</h3>${labels.map((x,i)=>`<label><input type="checkbox" data-check="${i}" ${state.checks[c.id]?.[i]?'checked':''}>${x}</label>`).join('')}<label><input type="checkbox" disabled ${(state.scores[c.id]||0)>=80?'checked':''}>I scored 80% or higher</label></div>`;
}

function renderTab(c,tab){
  const root=$('#lesson-content');
  if(tab==='summary') root.innerHTML=`<div class="content-grid"><article class="reading-panel"><div class="eyebrow">Guided reading</div><h2>The chapter, rebuilt</h2><div class="key-idea"><strong>Governing question</strong><br>${c.question}</div>${c.summary.map(([h,p])=>`<h3>${h}</h3><p>${p}</p>`).join('')}</article><aside class="side-panel"><h3>Learning outcomes</h3><ul>${c.objectives.map(x=>`<li>${x}</li>`).join('')}</ul><h3>Key vocabulary</h3><div class="vocab-list">${c.vocabulary.map(([t,d])=>`<button>${t}<span>${d}<em>Example: ${VOCAB_EXAMPLES[t]||'Build your own example.'}</em></span></button>`).join('')}</div>${masteryChecklist(c)}</aside></div>`;
  if(tab==='map') root.innerHTML=`<article class="argument-map"><div class="eyebrow">Reconstruction</div><h2>The argument in six moves</h2><p>Do not memorize a slogan. Be able to justify the transition between every pair of steps.</p><div class="argument-chain">${c.chain.map(([h,p],i)=>`<div class="premise"><b>${i+1}</b><div><strong>${h}</strong><span>${p}</span></div></div>`).join('')}</div><div class="key-idea"><strong>Misconception firewall</strong><ul>${c.misconceptions.map(x=>`<li>${x}</li>`).join('')}</ul></div></article>`;
  if(tab==='quiz'){ const questions=[...c.quizzes,...(EXTRA_QUIZZES[c.id]||[])]; root.innerHTML=`<article class="quiz-panel"><div class="eyebrow">Retrieval practice</div><h2>Chapter assessment · ${questions.length} questions</h2><p>Choose once before revealing the explanation. A score of 80% completes the fifth mastery check.</p>${questions.map((q,i)=>`<div class="quiz-question" data-q="${i}"><h3>${i+1}. ${q.q}</h3><div class="choices">${q.a.map((a,j)=>`<button class="choice" data-choice="${j}">${a}</button>`).join('')}</div><div class="explanation">${q.why}</div></div>`).join('')}<div class="button-row"><button class="primary" id="score-quiz">Score quiz</button><strong id="quiz-result"></strong></div></article>`; }
  if(tab==='cards') root.innerHTML=`<article class="flashcard-panel"><div class="eyebrow">Active recall</div><h2>Concept glossary cards</h2><p>Say the definition and invent an example before flipping.</p><div class="flashcard-deck">${c.vocabulary.map(([t,d])=>`<button class="flashcard"><strong class="prompt">${t}<br><small>Tap to reveal definition + example</small></strong><span class="answer"><b>${d}</b><br><br><em>Example: ${VOCAB_EXAMPLES[t]||'Build your own example.'}</em></span></button>`).join('')}</div></article>`;
  if(tab==='practice') root.innerHTML=`<article class="practice-panel"><div class="eyebrow">Explain · challenge · persuade</div><h2>Deliberate practice lab</h2><div class="practice-grid">${c.drills.map((d,i)=>`<div class="drill"><h3>Drill ${i+1}</h3><p>${d}</p><button class="chip-button" data-fill="${i}">Use as note prompt</button></div>`).join('')}</div></article><article class="notes-panel" style="margin-top:22px"><h2>Your teach-back notes</h2><textarea id="chapter-notes" placeholder="Explain the proof in your own words. Mark every premise you cannot yet defend.">${state.notes[c.id]||''}</textarea><div class="button-row"><button class="primary" id="save-notes">Save notes</button><button class="secondary" id="copy-notes">Copy notes</button></div></article>`;
  if(tab==='video') root.innerHTML=`<article class="video-panel"><div class="eyebrow">Multimedia study</div><h2>Chapter ${c.id} explainer</h2><video controls preload="metadata" style="width:100%;aspect-ratio:16/9;background:#0e1c34;border-radius:10px" src="videos/${VIDEO_FILES[c.id]}">Your browser does not support embedded video.</video><h3>NotebookLM production brief</h3><div class="notebook-prompt" id="video-prompt">${c.videoPrompt}</div><div class="button-row"><a class="primary" style="text-decoration:none;display:inline-flex;align-items:center" href="https://notebook.google.com/notebook/63b7a110-ed59-49e4-b61e-5fd8ad08befe" target="_blank" rel="noopener">Open course notebook</a><button class="secondary" id="copy-video">Copy video brief</button><button class="secondary" id="download-packet">Download chapter packet</button></div><div class="key-idea"><strong>How to study the video</strong><br>Pause after each major inference and restate it without looking. Then write the strongest objection you can. Use the production brief to regenerate a different version in NotebookLM whenever a premise remains unclear.</div><textarea id="chapter-notes" placeholder="Write your teach-back notes and unresolved objections here.">${state.notes[c.id]||''}</textarea><div class="button-row"><button class="primary" id="save-notes">Save notes</button></div></article>`;
  bindTab(c,tab);
}

function bindTab(c,tab){
  $$('.lesson-tab').forEach(b=>b.onclick=()=>{ $$('.lesson-tab').forEach(x=>x.classList.remove('active')); b.classList.add('active'); renderTab(c,b.dataset.tab); window.scrollTo({top:$('.chapter-hero').offsetHeight,behavior:'smooth'}); });
  $$('.vocab-list button').forEach(b=>b.onclick=()=>b.classList.toggle('open'));
  $$('[data-check]').forEach(b=>b.onchange=()=>{state.checks[c.id]=state.checks[c.id]||[];state.checks[c.id][Number(b.dataset.check)]=b.checked;save();});
  $$('.flashcard').forEach(b=>b.onclick=()=>b.classList.toggle('flipped'));
  if(tab==='quiz'){
    const questions=[...c.quizzes,...(EXTRA_QUIZZES[c.id]||[])];
    $$('.quiz-question').forEach(q=>$$('.choice',q).forEach(b=>b.onclick=()=>{if(q.dataset.selected!==undefined)return;q.dataset.selected=b.dataset.choice; b.classList.add(Number(b.dataset.choice)===questions[Number(q.dataset.q)].correct?'correct':'incorrect'); $$('.choice',q)[questions[Number(q.dataset.q)].correct].classList.add('correct'); $('.explanation',q).classList.add('show');}));
    $('#score-quiz').onclick=()=>{const qs=$$('.quiz-question');const right=qs.filter((q,i)=>Number(q.dataset.selected)===questions[i].correct).length;const score=Math.round(right/qs.length*100);state.scores[c.id]=Math.max(state.scores[c.id]||0,score);save();$('#quiz-result').textContent=`${score}% — ${score>=80?'passed':'review and retry'}`;toast(score>=80?'Mastery check complete':'Review the explanations, then retry');};
  }
  if($('#save-notes')) $('#save-notes').onclick=()=>{state.notes[c.id]=$('#chapter-notes').value;save();toast('Notes saved on this device');};
  if($('#copy-notes')) $('#copy-notes').onclick=()=>navigator.clipboard.writeText($('#chapter-notes').value).then(()=>toast('Notes copied'));
  $$('[data-fill]').forEach(b=>b.onclick=()=>{const t=$('#chapter-notes');t.value+=(t.value?'\n\n':'')+c.drills[Number(b.dataset.fill)]+'\n';t.focus();});
  if($('#copy-video')) $('#copy-video').onclick=()=>navigator.clipboard.writeText(c.videoPrompt).then(()=>toast('Video brief copied'));
  if($('#download-packet')) $('#download-packet').onclick=()=>downloadPacket(c);
}

function packetText(c){
  return `# Chapter ${c.id}: ${c.title}\n\nBook pages: ${c.pages}\n\n## Governing question\n${c.question}\n\n## Core thesis\n${c.thesis}\n\n## Detailed summary\n${c.summary.map(([h,p])=>`### ${h}\n${p}`).join('\n\n')}\n\n## Argument map\n${c.chain.map(([h,p],i)=>`${i+1}. **${h}:** ${p}`).join('\n')}\n\n## Key vocabulary with examples\n${c.vocabulary.map(([t,d])=>`- **${t}:** ${d} Example: ${VOCAB_EXAMPLES[t]||'Build your own example.'}`).join('\n')}\n\n## Misconceptions to prevent\n${c.misconceptions.map(x=>`- ${x}`).join('\n')}\n\n## Mastery drills\n${c.drills.map((x,i)=>`${i+1}. ${x}`).join('\n')}\n\n## Video overview instruction\n${c.videoPrompt}\n\n## Source note\nThis is an original study guide keyed to Edward Feser, Five Proofs of the Existence of God. Verify precise formulations against the source text.`;
}
function downloadPacket(c){const blob=new Blob([packetText(c)],{type:'text/markdown'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`chapter-${c.id}-${c.title.toLowerCase().replace(/[^a-z]+/g,'-')}.md`;a.click();URL.revokeObjectURL(a.href);toast('Chapter packet downloaded');}

function showCapstone(){
  $('#course-view').hidden=true;$('#chapter-view').hidden=true;$('#capstone-view').hidden=false;$('#crumb-title').textContent='Final oral defense';$$('.nav-item').forEach(x=>x.classList.remove('active'));
  $('#capstone-view').innerHTML=`<section class="chapter-hero"><div class="chapter-kicker">◇ Capstone assessment</div><h1>${CAPSTONE.title}</h1><p class="thesis">${CAPSTONE.intro}</p></section><section class="lesson-content"><article class="capstone-panel"><h2>Ten-part defense</h2>${CAPSTONE.questions.map((q,i)=>`<div class="quiz-question"><h3>${String(i+1).padStart(2,'0')} · ${q}</h3><textarea placeholder="Outline your answer or paste a transcript..."></textarea></div>`).join('')}<div class="key-idea"><strong>Scoring standard</strong><br>24–30: ready to teach · 18–23: strong, revisit weak premises · 10–17: rebuild argument maps · 0–9: return to summaries and vocabulary.</div></article></section>`;window.scrollTo(0,0);
}

function showGlossary(){
  $('#course-view').hidden=true;$('#chapter-view').hidden=true;$('#capstone-view').hidden=false;$('#crumb-title').textContent='Course glossary';$$('.nav-item').forEach(x=>x.classList.remove('active'));
  const entries=Object.entries(VOCAB_EXAMPLES).sort((a,b)=>a[0].localeCompare(b[0]));
  const definitions={}; COURSE.forEach(c=>c.vocabulary.forEach(([t,d])=>definitions[t]=d));
  $('#capstone-view').innerHTML=`<section class="chapter-hero"><div class="chapter-kicker">A–Z reference</div><h1>Course glossary</h1><p class="thesis">${entries.length} essential terms, each with a plain-language definition and a concrete example.</p></section><section class="lesson-content"><article class="capstone-panel"><label for="glossary-search"><strong>Search the glossary</strong></label><input id="glossary-search" style="width:100%;padding:13px;margin:12px 0 22px;border:1px solid #cbd5df;border-radius:8px;font:inherit" placeholder="Try: causality, essence, miracle…"><div id="glossary-list">${entries.map(([t,e])=>`<div class="quiz-question glossary-entry" data-term="${t.toLowerCase()}"><h3>${t}</h3><p>${definitions[t]||''}</p><div class="key-idea"><strong>Example</strong><br>${e}</div></div>`).join('')}</div></article></section>`;
  $('#glossary-search').oninput=e=>$$('.glossary-entry').forEach(x=>x.hidden=!x.textContent.toLowerCase().includes(e.target.value.toLowerCase()));window.scrollTo(0,0);
}

document.addEventListener('click',e=>{const ch=e.target.closest('[data-chapter]');if(ch)showChapter(ch.dataset.chapter);const home=e.target.closest('[data-home]');if(home)showHome();});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('.course-card'))showChapter(e.target.dataset.chapter);});
$('#begin-course').onclick=()=>showChapter(1);$('#resume-course').onclick=()=>showChapter(state.last||1);$('#open-capstone').onclick=showCapstone;
$('#open-glossary').onclick=showGlossary;
$('#reset-progress').onclick=()=>{if(confirm('Reset all mastery checks, quiz scores, and saved notes?')){localStorage.removeItem('fiveProofsState');location.reload();}};
$('#mobile-menu').onclick=()=>$('.sidebar').classList.toggle('open');
buildNav();updateProgress();
