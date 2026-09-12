import fs from 'node:fs';
import vm from 'node:vm';

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../dist/course-data.js', import.meta.url), 'utf8'), context);
const { COURSE, VOCAB_EXAMPLES, CAPSTONE, EXTRA_QUIZZES } = context.window;
const sections = COURSE.map((c) => {
  const questions = [...c.quizzes, ...(EXTRA_QUIZZES[c.id] || [])];
  return `# Chapter ${c.id}: ${c.title}\n\nBook pages: ${c.pages}\n\n## Governing question\n${c.question}\n\n## Core thesis\n${c.thesis}\n\n## Learning outcomes\n${c.objectives.map(x => `- ${x}`).join('\n')}\n\n## Detailed chapter breakdown\n${c.summary.map(([h,p]) => `### ${h}\n${p}`).join('\n\n')}\n\n## Argument map\n${c.chain.map(([h,p],i) => `${i+1}. **${h}:** ${p}`).join('\n')}\n\n## Vocabulary and examples\n${c.vocabulary.map(([t,d]) => `- **${t}:** ${d} Example: ${VOCAB_EXAMPLES[t]}`).join('\n')}\n\n## Misconceptions\n${c.misconceptions.map(x=>`- ${x}`).join('\n')}\n\n## Assessment bank\n${questions.map((q,i)=>`${i+1}. ${q.q}\n   - Answer: ${q.a[q.correct]}\n   - Explanation: ${q.why}`).join('\n')}\n\n## Deliberate-practice prompts\n${c.drills.map((x,i)=>`${i+1}. ${x}`).join('\n')}\n\n## NotebookLM video instruction\n${c.videoPrompt}`;
});
const capstone = `# Final oral defense\n\n${CAPSTONE.intro}\n\n${CAPSTONE.questions.map((x,i)=>`${i+1}. ${x}`).join('\n')}`;
const header = `# Five Proofs Mastery Course — NotebookLM Source Pack\n\nThis original study guide is keyed to Edward Feser's *Five Proofs of the Existence of God*. It is a learning aid, not a replacement for the book. Ask NotebookLM to distinguish the author's arguments from the guide's pedagogical framing and to cite the original source whenever precision matters.\n\n`;
fs.writeFileSync(new URL('../dist/five-proofs-notebooklm-course-pack.md', import.meta.url), header + sections.join('\n\n---\n\n') + '\n\n---\n\n' + capstone);
