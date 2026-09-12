"""Merge audited slices back into a module JSON, repairing term references.

Usage: python tools_merge_audit.py ch1
"""
import json, os, sys, shutil, datetime

mod = sys.argv[1] if len(sys.argv) > 1 else 'ch1'
root = os.path.dirname(os.path.abspath(__file__))
target = os.path.join(root, 'content', f'{mod}.json')
adir = os.path.join(root, 'content', '_audit')

with open(target, encoding='utf-8') as f:
    d = json.load(f)
stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
shutil.copy(target, os.path.join(adir, f'{mod}-before-{stamp}.json'))

applied, reports = [], {}
def load(name):
    p = os.path.join(adir, name)
    if not os.path.exists(p):
        return None
    with open(p, encoding='utf-8') as f:
        return json.load(f)

a = load(f'{mod}-argument.json')
if a:
    for k in ('argument', 'objections'):
        if k in a:
            d[k] = a[k]; applied.append(k)
    reports['argument'] = a.get('report', {})

v = load(f'{mod}-vocab.json')
renamed, removed = {}, []
if v:
    for k in ('keyTerms', 'quiz', 'flashcards'):
        if k in v:
            d[k] = v[k]; applied.append(k)
    rep = v.get('report', {}); reports['vocab'] = rep
    renamed = rep.get('renamed') or {}
    removed = set(rep.get('removed') or [])

s = load(f'{mod}-summary.json')
if s and 'summary' in s:
    d['summary'] = s['summary']; applied.append('summary')
    reports['summary'] = s.get('report', {})

# repair summary[].terms against the final keyTerms list
valid = {t['term'] for t in d.get('keyTerms', [])}
fixed = dropped = 0
# duplicates can appear once renames collapse two terms onto one
for sec in d.get('summary', []):
    out = []
    for t in sec.get('terms', []):
        t2 = renamed.get(t, t)
        if t2 in valid:
            if t2 != t: fixed += 1
            out.append(t2)
        else:
            dropped += 1
    if 'terms' in sec:
        seen, deduped = set(), []
        for t in out:
            if t not in seen:
                seen.add(t); deduped.append(t)
        sec['terms'] = deduped

with open(target, 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=1)

print(f'applied: {applied}')
print(f'term refs renamed {fixed}, dropped {dropped}')
print(f'counts: summary {len(d.get("summary", []))}, steps {len(d.get("argument", {}).get("steps", []))}, '
      f'objections {len(d.get("objections", []))}, terms {len(d.get("keyTerms", []))}, '
      f'quiz {len(d.get("quiz", []))}, cards {len(d.get("flashcards", []))}')
for k, r in reports.items():
    print(f'\n--- {k} report ---')
    print(json.dumps(r, ensure_ascii=False, indent=1)[:1800])
