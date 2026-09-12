# Visual breakdown spec — content/diagrams.json

The site renders data-driven, interactive visuals. Write ONE json file:
`C:\Users\mleet\Desktop\house\five-proofs-course\content\diagrams.json`

```jsonc
{
  "<moduleId>": [ <diagram>, <diagram>, ... ]
}
```
Each `<diagram>` has: `id` (kebab-case, unique in module), `title`, `caption`
(1–2 sentences, plain English, says what the picture shows), `where` (optional:
the exact `heading` string of the summary section it belongs with, or an
objection `title`, so the site can show it in place), and `kind` + its fields:

1. **compare** — two or three columns set against each other.
```jsonc
{ "kind": "compare",
  "columns": [ { "label": "Actuality", "sub": "the way a thing already is",
                 "items": ["The coffee is actually hot — 90 °C right now", "…"] },
               { "label": "Potentiality", "sub": "the ways it could be but isn't yet", "items": ["…"] } ],
  "note": "One sentence on why the contrast matters." }
```
2. **chain** — a causal series, drawn as linked boxes, top to bottom.
```jsonc
{ "kind": "chain",
  "series": "per se",                     // "per se" | "per accidens"
  "links": [ { "text": "The stone moves", "role": "effect", "note": "only while…" },
             { "text": "…the stick pushes it", "role": "instrument" },
             { "text": "…the hand moves the stick", "role": "instrument" },
             { "text": "The one who moves without being moved", "role": "first" } ],
  "collapse": "What happens if you take the first member away: nothing moves at all." }
```
   (`role` ∈ effect | instrument | first. The site lets the learner pull the
   first member out and watch the rest grey out, so `collapse` must say what that shows.)
3. **flow** — numbered reasoning, each box leading to the next, optionally citing steps.
```jsonc
{ "kind": "flow",
  "nodes": [ { "text": "Change is real", "step": 1, "note": "optional aside" },
             { "text": "Change = a potential being actualized", "step": 2 } ] }
```
4. **tree** — one root idea with what follows from it.
```jsonc
{ "kind": "tree",
  "root": { "text": "Purely actual actualizer", "note": "no unrealized potential at all" },
  "branches": [ { "text": "One", "why": "Two would need a difference, and a difference means a potential unrealized in one of them." } ] }
```
5. **sorter** — an interactive drill: the learner taps which bucket each item belongs in.
```jsonc
{ "kind": "sorter",
  "prompt": "Actuality or potentiality?",
  "buckets": ["Actuality", "Potentiality"],
  "items": [ { "text": "The rubber ball's roundness", "bucket": 0, "why": "It is round right now — that's how it actually is." } ] }
```
   8–12 items, mixed, each with a `why` shown after answering.
6. **anatomy** — an objection taken apart (use for the module's hardest objections).
```jsonc
{ "kind": "anatomy",
  "says": "What the objector actually says, in their own voice.",
  "assumes": ["The hidden assumption", "…"],
  "breaks": "Where exactly it goes wrong (name the distinction or premise it misses).",
  "reply": "What you say back, in 2–3 sentences you could speak aloud.",
  "where": "the exact objections[].title this belongs to" }
```

Rules: plain English, concrete, faithful to Feser (read the chapter text in the
scratchpad `ch\` folder). Box text ≤ 90 characters — these are picture labels, not
paragraphs. `note`/`why`/`caption` may be longer. No Markdown, no HTML.
Validate: `python -c "import json;d=json.load(open(r'content\diagrams.json',encoding='utf-8'));print({k:len(v) for k,v in d.items()})"`
