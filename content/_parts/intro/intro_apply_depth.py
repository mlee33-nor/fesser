import json, glob, os, re, sys
base = os.path.dirname(os.path.abspath(__file__))
ip = os.path.join(base, '..', '..', 'intro.json')
d = json.load(open(ip, encoding='utf-8'))

# A + D: summary sections
for f in sorted(glob.glob(os.path.join(base, 'intro_depth_summary_*.json'))):
    for e in json.load(open(f, encoding='utf-8')):
        s = d['summary'][e['i']]
        for k in ('body', 'plain', 'takeaway', 'deepDive', 'checks', 'terms'):
            if k in e:
                s[k] = e[k]

# C: new / modified key terms
tf = os.path.join(base, 'intro_depth_terms.json')
if os.path.exists(tf):
    t = json.load(open(tf, encoding='utf-8'))
    byterm = {k['term']: k for k in d['keyTerms']}
    for term, newdef in t.get('modifyDefinitions', {}).items():
        byterm[term]['definition'] = newdef
    for k in t.get('newTerms', []):
        if k['term'] in byterm:
            byterm[k['term']].update(k)
        else:
            d['keyTerms'].append(k)
            byterm[k['term']] = k

# B: argument steps
sf = os.path.join(base, 'intro_depth_steps.json')
if os.path.exists(sf):
    steps = {s['n']: s for s in json.load(open(sf, encoding='utf-8'))}
    for st in d['argument']['steps']:
        e = steps[st['n']]
        for k in ('example', 'challenge', 'answer'):
            st[k] = e[k]

# D: reading guide
rf = os.path.join(base, 'intro_depth_readingguide.json')
if os.path.exists(rf):
    d['readingGuide'] = json.load(open(rf, encoding='utf-8'))

json.dump(d, open(ip, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
d = json.load(open(ip, encoding='utf-8'))
print('saved; summary enriched:', sum('deepDive' in s for s in d['summary']), '/', len(d['summary']))
