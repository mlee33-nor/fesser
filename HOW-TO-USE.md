# Five Proofs Mastery

A self-study course on Edward Feser's *Five Proofs of the Existence of God*.

## Open it
Double-click `index.html`. It runs entirely offline in your browser (fonts load from Google when online).

## What's inside each module
Overview → Video → Summary → Argument → Concepts → Objections → Explain → Persuade → Practice
(quiz, short answers with rubrics, flashcards). Progress saves automatically in your browser.
There's also a cross-book **Objection finder** and a **Glossary** in the sidebar.

## Making the chapter videos (NotebookLM)
1. The source documents are in `notebooklm/` (one per module). You can also copy or download each one from its module's **Video** tab.
2. At notebooklm.google.com, make one notebook per chapter and add that chapter's `.md` file as its only source.
3. In **Studio → Video Overview → Customize**, paste the focus prompt from the module's Video tab.
4. Download the finished video.
5. Attach it in one of these ways:
   - Drop it onto the module's **Video** tab (it's kept in this browser), or
   - Save it into `videos/` using the module id as the filename, so it attaches automatically:
     `intro.mp4, ch1.mp4, ch2.mp4, ch3.mp4, ch4.mp4, ch5.mp4, ch6a.mp4, ch6b.mp4, ch7a.mp4, ch7b.mp4, capstone.mp4`, or
   - Paste a YouTube (unlisted) or Google Drive link.

## Editing / rebuilding
Content lives in `content/<id>.json` and `notebooklm/*.md`. After editing either, run:

```
python build.py
```

This regenerates `data/course-data.js`, `index.html`, and `artifact.html` (the published version).
