# Authoring spec — "Five Proofs" mastery course

You are writing ONE module of an exhaustive self-study course on Edward Feser's
*Five Proofs of the Existence of God* (Ignatius Press, 2017). The learner wants to
**(1) understand** every argument deeply, **(2) explain** it clearly to anyone, and
**(3) persuade** thoughtful skeptics honestly and effectively.

Source text (extracted from the PDF, with `=====PAGE n=====` markers — page n in
the markers is the PDF page, the printed page number usually appears in running
heads) lives in:
`C:\Users\mleet\AppData\Local\Temp\claude\C--Users-mleet-Desktop-house\06017739-d316-49e3-acef-54ca2c6333bb\scratchpad\ch\`

Read your assigned source file(s) **completely and carefully** before writing
(use Read with offset/limit in chunks — the files are long). Accuracy to Feser's
actual reasoning, terminology, examples and replies is the top priority. Do not
invent claims and attribute them to Feser. Where you add your own analogies or
persuasion advice, that is fine — mark illustrations with `"source": "course"`.

## Copyright rules (mandatory)
- Write everything **in your own words**. Do NOT copy sentences or paragraphs
  from the book. Do not transcribe Feser's numbered formal argument verbatim —
  restate each step in fresh wording (keeping the logical structure and step
  count is fine).
- Short quotations of a key phrase are allowed only rarely: under 15 words each,
  in quotation marks, at most ~3 per module.

## Output 1 — module JSON
Path: `C:\Users\mleet\Desktop\house\five-proofs-course\content\<id>.json`

Because the file is large, build it in parts to avoid giant single writes:
write `content\_parts\<id>\p1.json` … `p5.json` (each a JSON object holding some
of the top-level keys below), then merge them with a small Python script into
`content\<id>.json`, then validate:
`python -c "import json;d=json.load(open(r'...\\content\\<id>.json',encoding='utf-8'));print(list(d))"`
Fix any JSON errors until it loads. (Watch out for unescaped double quotes
inside strings — prefer typographic quotes “ ” ‘ ’ inside prose.)

Text fields marked **md** use a tiny Markdown subset that the site renders:
paragraphs separated by a blank line (`\n\n`), `**bold**`, `*italic*`,
lines starting `- ` for bullets, `1. ` for numbered lists, `> ` for a callout.
No HTML, no headings inside md fields, no links.

```jsonc
{
  "id": "ch1",                       // given in your assignment
  "order": 1,                        // given
  "label": "Chapter 1",              // given
  "title": "The Aristotelian Proof", // given
  "tagline": "From change to the Unmoved Mover",   // short, evocative
  "bookPages": "17–68",              // printed page range, given
  "estMinutes": 150,                 // realistic study time for this module
  "oneSentence": "The chapter's thesis in one sentence.",
  "bigPicture": "md — 2–4 paragraphs: what this chapter does, where it fits in the book's overall project, why it matters, what makes it distinctive among the five proofs.",
  "objectives": ["Explain why …", "Distinguish …", "Answer the objection that …"],   // 6–9 concrete, testable

  "summary": [                       // THE DETAILED CHAPTER SUMMARY — follows the book's own section order
    { "heading": "Stage 1: …", "body": "md" }
  ],
  // Summary must be genuinely detailed: every section/subsection of the chapter
  // covered, every important example, distinction, argument move, and objection
  // represented. Target total length: ~250 words per 5 book pages (so a
  // 50-page chapter ≈ 3,000–4,000 words). Explain, don't just list.

  "argument": {                      // the chapter's formal argument (or, for non-proof modules, the main line of reasoning)
    "name": "…",
    "overview": "md — how the argument is organized (stages, what each stage secures)",
    "stages": [ { "title": "Stage 1 — …", "range": "1–14", "gist": "one or two sentences" } ],
    "steps": [
      { "n": 1, "kind": "premise",    "text": "restated step", "why": "plain-English support: why this is true / which earlier steps it follows from / what Feser says to defend it" },
      { "n": 3, "kind": "inference",  "text": "…", "why": "follows from 1 and 2 because …" },
      { "n": 14, "kind": "conclusion", "text": "…", "why": "…" }
    ]
    // kind ∈ premise | inference | conclusion. Include EVERY step of Feser's formal statement (paraphrased).
  },

  "keyTerms": [ { "term": "Actuality", "definition": "…", "example": "…" } ],   // 15–30
  "distinctions": [                  // 3–8 crucial conceptual contrasts
    { "name": "Per se vs. per accidens causal series",
      "left":  { "label": "Per accidens (linear)",       "desc": "…" },
      "right": { "label": "Per se (hierarchical)",       "desc": "…" },
      "whyItMatters": "…" }
  ],
  "illustrations": [                 // 5–10: the book's key examples retold in your words + your own new analogies
    { "title": "The hand, the stick, and the stone", "body": "md", "source": "book" }
  ],

  "objections": [                    // EVERY objection the chapter discusses, plus 1–3 common modern ones it equips you to answer
    { "title": "short name",
      "whoRaises": "Hume / Russell / Dawkins / typical skeptic …",
      "objection": "md — the objection stated at its strongest",
      "reply": "md — Feser's reply, step by step, in your words",
      "pushback": "md — what to say if the objector presses further",
      "difficulty": 2 }              // 1 easy, 2 moderate, 3 hard
  ],
  "misconceptions": [ { "myth": "…", "correction": "…" } ],   // 6–10

  "explain": {
    "tweet": "≤ 280 characters",
    "elevator": "a spoken 30-second version (≈80 words)",
    "twoMinute": "md — ≈300–400 word spoken explanation for a smart friend",
    "eli12": "md — explanation a 12-year-old could follow",
    "whiteboard": ["what to draw/write first and what to say", "…"],   // 6–10 steps
    "keyAnalogy": "the single best analogy for this chapter and how to use it"
  },

  "persuade": {
    "coreInsight": "md — the one idea that, once someone grasps it, makes the argument click (and the usual reason it fails to click)",
    "audiences": [                   // 4–6 kinds of listener
      { "who": "Science-minded naturalist", "startingPoint": "what they already believe/assume",
        "approach": "md — how to present the argument to them", "openingQuestion": "a question to open with",
        "avoid": "what not to do with this audience" }
    ],
    "dialogue": [ { "speaker": "Skeptic", "line": "…" }, { "speaker": "You", "line": "…" } ],   // 16–26 turns, realistic, the skeptic is smart and raises real objections; you answer using the chapter
    "socratic": ["question that leads someone to see a premise for themselves", "…"],   // 8–12
    "traps": [ { "trap": "a common way people botch presenting this", "fix": "…" } ]   // 5–8
  },

  "connections": [ { "to": "ch6a", "note": "how this module relates to another module" } ],   // valid ids: intro, ch1, ch2, ch3, ch4, ch5, ch6a, ch6b, ch7a, ch7b, capstone

  "quiz": [                          // 18–25 multiple choice; vary the position of the correct answer (0–3) evenly
    { "q": "…", "options": ["…","…","…","…"], "answer": 2, "explanation": "why the right answer is right and the tempting wrong one wrong", "level": "recall" }
    // level ∈ recall | understand | apply | analyze — mix them; at least 40% understand/apply/analyze. Distractors should be plausible misreadings, not jokes.
  ],
  "shortAnswer": [ { "q": "…", "model": "md — a model answer", "rubric": ["point a strong answer must include", "…"] } ],   // 8–12
  "flashcards": [ { "front": "…", "back": "…" } ],   // 25–40
  "teachBack": "md — a Feynman-style challenge: what to explain out loud, to whom, with what constraints, and how to check yourself",
  "videoPrompt": "Text the learner pastes into NotebookLM's Video Overview 'customize' box — tell it the audience, the key ideas to emphasize in order, the examples to use, the misconceptions to correct, and the tone (≈80–150 words)."
}
```

## Output 2 — NotebookLM source document
Path: `C:\Users\mleet\Desktop\house\five-proofs-course\notebooklm\<NN>-<slug>.md` (given in your assignment)

A **standalone, very detailed** study document the learner will upload to Google
NotebookLM to generate a video overview. NotebookLM will see ONLY this file, so it
must be self-contained and richly explanatory. Plain Markdown (headings allowed).
Length: 4,000–7,000 words (scale with chapter length). Structure:

1. Title, one-paragraph orientation (book, chapter, where it sits in the course)
2. Why this chapter matters
3. Key concepts and vocabulary (defined clearly, with examples)
4. The argument told as a story — informally, stage by stage, with the book's examples
5. The formal argument, step by step (paraphrased), with a one-line justification per step
6. Every objection discussed and the reply to each
7. Common misunderstandings
8. How to explain it to others (simple version + best analogy)
9. Key takeaways (bullet list) and 10 review questions with brief answers

Write in your own words (copyright rules above apply). Make it vivid and teachable.

## EXPANSION PASS (second round — the learner asked for exhaustive coverage)
Only start this after your original assignment (JSON + NotebookLM doc) is finished.
Edit `content\<id>.json` IN PLACE with a Python script that loads it, appends, and
saves (`json.dump(d, f, ensure_ascii=False, indent=1)`). Keep everything already
there (fix errors if you spot any). Re-read chapter sections as needed so every
addition is accurate. New minimums (capstone targets in brackets):

1. **keyTerms ≥ 40 [60, whole book]** — a real vocabulary list. Cover every technical
   term, named principle (with abbreviation: PC, PSR, PPC …), Latin/Greek phrase,
   named position (nominalism, deism, occasionalism …) and named thinker's view
   used in the chapter. EVERY entry has:
   - `term`
   - `definition` — 1–3 precise sentences, in plain English
   - `example` — a concrete example of the term in use (everyday or from the book),
     NOT a restatement of the definition
   - `origin` — NEW: the Latin/Greek original and its literal meaning, or which
     thinker/tradition the term comes from; `""` if nothing useful to say
   - `confuseWith` — NEW: the term it is most often confused with, and the
     difference in one sentence; `""` if none
   Backfill `origin` and `confuseWith` on the existing entries too.
2. **quiz ≥ 40 [70]** — new questions cover sections, argument steps, objections and
   terms not yet tested; ≥ 50% understand/apply/analyze; include "which step
   secures X", "what would Feser reply to…", "which distinction does this
   objection ignore" and scenario-application questions. Keep answer positions
   evenly spread across 0–3. Plausible distractors; explanation on every one.
3. **shortAnswer ≥ 15 [20]** — each with model answer and 3–5 rubric points.
4. **flashcards ≥ 60 [90]** — terms, each important argument step ("What does step 7
   claim and why?"), each objection → one-line reply, distinctions, examples.
5. **misconceptions ≥ 10, persuade.socratic ≥ 12, illustrations ≥ 8,
   distinctions ≥ 6.**
6. Check the summary covers every section and subsection of the chapter; add any
   that were skipped.

Validate that the JSON loads, then reply with the new counts.

## DEPTH PASS (third round — the learner wants to REALLY understand every section)
Edit `content\<id>.json` IN PLACE with a Python script (load → modify → `json.dump(d, f,
ensure_ascii=False, indent=1)`); never re-merge old part files. Re-read the chapter
text for each section as you go so everything is accurate to Feser. Add these
fields — do not remove anything:

**A. Every object in `summary` gets:**
- `takeaway` — one sentence: the single thing to remember from this section.
- `deepDive` — md, 250–450 words. Go beyond the summary: slowly unpack the
  hardest idea in the section; give a worked example or thought experiment;
  note the qualifications and nuances Feser adds; say how it feeds the formal
  argument (cite step numbers, e.g. “this is what secures step 11”); name the
  usual confusion (“people often think X, but …”). Teach it like a patient tutor.
- `checks` — 2–3 multiple-choice questions on THIS section only, same shape as
  quiz items (`q`, `options`×4, `answer` 0–3, `explanation`, `level`); spread
  answer positions.
- `terms` — the exact `term` strings of the keyTerms that this section uses
  (add any missing technical term to `keyTerms` first, with all five fields).
- If a section's `body` is under 250 words, expand it so it genuinely explains.

**B. Every object in `argument.steps` gets:**
- `example` — 1–3 sentences: a concrete illustration of what this step says
  (book example where possible, otherwise your own).
- `challenge` — the most natural objection to THIS step, one sentence
  (`""` only for purely mechanical inferences).
- `answer` — the reply to that challenge, 1–3 sentences, grounded in the book.

**C. `keyTerms`:** make sure every technical word used anywhere in the module's
prose has an entry — including adjective/noun forms people will look up
(e.g. both the idea of omnipotence and the word “omnipotent” are covered by one
entry whose definition mentions both forms). All five fields as before.

**D. BEGINNER HAND-HOLDING (the learner has NEVER studied philosophy and will work
through this module BEFORE reading the chapter):**
- Every object in `summary` also gets `plain` — 2–4 sentences in everyday language,
  zero jargon (or jargon immediately explained), as if to a smart friend who has
  never taken a philosophy class. This is shown FIRST, before the full body.
- New top-level field `readingGuide`:
  ```jsonc
  "readingGuide": {
    "beforeYouRead": "md — 250–400 words, plain English: what this chapter is trying to do, why anyone would care, what the reader will be asked to accept, and reassurance about the hard parts",
    "knowFirst": [ { "term": "Actuality", "plain": "one or two plain sentences" } ],   // 6–10 words to learn before reading (use keyTerms' exact term strings)
    "questionsToHold": ["a question to keep in mind while reading", "…"],   // 5–7
    "map": [ { "pages": "17–24", "section": "the book's section heading", "what": "what happens in these pages, plainly", "difficulty": 2, "tip": "where to slow down / what to reread / what can be skimmed on first read" } ],   // cover the whole chapter in order, 6–14 rows; difficulty 1 easy – 3 hard
    "afterReading": ["a self-check prompt to do right after finishing the chapter", "…"]   // 5–8
  }
  ```
  Page numbers must be the book's printed pages (PDF page − 3).

Validate the JSON loads, then reply with: sections enriched, steps enriched,
new keyTerms count, total `checks` questions, readingGuide map rows.

## Finish
When both files exist and the JSON validates, reply with: file paths, word count
of the NotebookLM doc, counts of summary sections / steps / objections / quiz /
flashcards, and any places where the extracted text was garbled so you had to
infer.
