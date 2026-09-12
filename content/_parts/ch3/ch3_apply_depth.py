# Idempotent depth-pass applier for ch3.json. Re-run after each data file is added.
import json, importlib, sys, collections, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
P = r'C:\Users\mleet\Desktop\house\five-proofs-course\content\ch3.json'
d = json.load(open(P, encoding='utf-8'))

def load(name):
    try:
        return importlib.import_module(name)
    except ModuleNotFoundError:
        return None

# ---- C. keyTerms
t = load('ch3_depth_terms')
if t:
    have = {k['term'] for k in d['keyTerms']}
    for nt in t.NEW_TERMS:
        if nt['term'] not in have:
            d['keyTerms'].append(nt); have.add(nt['term'])
    for k in d['keyTerms']:
        add = t.PATCH.get(k['term'])
        if add and add.strip() not in k['definition']:
            k['definition'] = k['definition'].rstrip() + add
terms = {k['term'] for k in d['keyTerms']}

# ---- A + D. summary sections
SEC = {}
for mod in ('ch3_depth_a', 'ch3_depth_b', 'ch3_depth_c'):
    m = load(mod)
    if m: SEC.update(m.SEC)
pl = load('ch3_depth_plain')
PLAIN = pl.PLAIN if pl else {}
problems = []
for i, s in enumerate(d['summary']):
    if i in PLAIN: s['plain'] = PLAIN[i]
    if i not in SEC: continue
    x = SEC[i]
    if 'body' in x: s['body'] = x['body']
    if 'body_append' in x and x['body_append'].strip()[:40] not in s['body']:
        s['body'] = s['body'] + x['body_append']
    for f in ('takeaway', 'deepDive', 'checks', 'terms'):
        s[f] = x[f]
    missing = [tm for tm in x['terms'] if tm not in terms]
    if missing: problems.append((i, 'missing terms', missing))
    dw = len(x['deepDive'].split())
    if not 250 <= dw <= 450: problems.append((i, 'deepDive words', dw))
    bw = len(s['body'].split())
    if bw < 250: problems.append((i, 'body words', bw))
    if not 2 <= len(x['checks']) <= 3: problems.append((i, 'checks', len(x['checks'])))
    for c in x['checks']:
        if len(c['options']) != 4 or not 0 <= c['answer'] <= 3: problems.append((i, 'bad check', c['q'][:40]))

# ---- B. steps
st = load('ch3_depth_steps')
if st:
    for s in d['argument']['steps']:
        e = st.STEPS.get(s['n'])
        if e:
            s['example'], s['challenge'], s['answer'] = e
        else:
            problems.append(('step', s['n'], 'missing'))

# ---- D. reading guide
g = load('ch3_depth_guide')
if g:
    rg = g.GUIDE
    for kf in rg['knowFirst']:
        if kf['term'] not in terms: problems.append(('knowFirst', kf['term']))
    # insert readingGuide right after bigPicture for readability
    new = {}
    for k, v in d.items():
        if k == 'readingGuide': continue
        new[k] = v
        if k == 'objectives': new['readingGuide'] = rg
    d = new

json.dump(d, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
d = json.load(open(P, encoding='utf-8'))
S = d['summary']
print('sections with deepDive:', sum('deepDive' in s for s in S), '/', len(S))
print('sections with plain:', sum('plain' in s for s in S))
print('steps enriched:', sum('example' in s for s in d['argument']['steps']), '/', len(d['argument']['steps']))
print('keyTerms:', len(d['keyTerms']))
ch = [c for s in S for c in s.get('checks', [])]
print('checks:', len(ch), collections.Counter(c['answer'] for c in ch))
print('readingGuide map rows:', len(d.get('readingGuide', {}).get('map', [])))
print('PROBLEMS:', problems if problems else 'none')
