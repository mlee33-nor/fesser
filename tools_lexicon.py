"""Generate content/lexicon.json: surface forms that should link to each glossary entry."""
import glob, json, re
def key(term):
    b = re.sub(r'\s*\(.*?\)\s*', ' ', term).strip()
    b = re.sub(r'^[“"‘\'(\s]+', '', b)
    b = re.sub(r'^(the|a|an)\s+', '', b, flags=re.I).lower()
    return re.sub(r'[^a-z0-9α-ω]+', ' ', b).strip()
STOP = set('''act acts being beings cause causes caused change changes form forms matter good goodness nature natures world universe reason reasons mind minds will love power powers order part parts whole simple actual real necessary possible god gods thing things intellect idea ideas concept concepts existence essence essences series motion time person persons truth knowledge science faith proof proofs argument arguments premise premises conclusion explanation explanations property properties object objects substance substances fact facts theory principle principles analogy law laws purpose end ends event events accident accidents potential potency act potentiality actuality regress infinite unity creation creator making maker the one one nothing something everything existence itself'''.split())
# single words we DO want linked even though short/common-looking
ALLOW = set('''actuality potentiality potency essence existence substance accident accidents regress analogy univocal equivocal analogical nominalism realism conceptualism theism deism pantheism occasionalism scientism hylomorphism universals universal simplicity immutability eternity omnipotence omniscience omnipotent omniscient immutable eternal incorporeal immaterial contingent contingency teleology'''.split())
VARIANTS = [
    (r'omnipotence$', ['omnipotent', 'all-powerful']), (r'omniscience$', ['omniscient', 'all-knowing']),
    (r'omnipresence$', ['omnipresent']), (r'immutability$', ['immutable', 'unchangeable']),
    (r'impassibility$', ['impassible']), (r'eternity$', ['eternal', 'eternally']), (r'simplicity$', ['divine simplicity']),
    (r'necessity$', ['necessarily existent']), (r'contingency$', ['contingent']), (r'incorporeality$', ['incorporeal']),
    (r'immateriality$', ['immaterial']), (r'incomprehensibility$', ['incomprehensible']), (r'infinity$', ['infinite being']),
    (r'ism$', None),
]
def variants(base):
    out = set()
    for pat, forms in VARIANTS:
        if re.search(pat, base):
            if forms: out.update(forms)
            elif base.endswith('ism') and ' ' not in base: out.update([base[:-3] + 'ist', base[:-3] + 'ists'])
    if base.endswith('ence') and ' ' not in base and len(base) > 7: out.add(base[:-4] + 'ent')
    if base.endswith('ance') and ' ' not in base and len(base) > 7: out.add(base[:-4] + 'ant')
    if ' ' in base and not base.endswith('s'): out.add(base + 's')
    return out
forms, seen = {}, {}
for f in sorted(glob.glob('content/*.json')):
    if f.endswith('lexicon.json'): continue
    d = json.load(open(f, encoding='utf-8'))
    for t in d.get('keyTerms', []):
        term = t.get('term', ''); k = key(term)
        if not k: continue
        fs = forms.setdefault(k, set())
        for alt in re.split(r'\s*/\s*|\s*;\s*', re.sub(r'\s*\(.*?\)\s*', ' ', term).strip()):
            b = re.sub(r'^(the|a|an)\s+', '', alt.strip(), flags=re.I).lower()
            if b: fs.add(b); fs |= variants(b)
        for ab in re.findall(r'\(([^)]+)\)', term):
            for piece in re.split(r'\s*[,/;]\s*|\s+or\s+', ab):
                p = piece.strip()
                if re.fullmatch(r'[A-Z]{2,5}', p): fs.add(p.lower())
                elif re.fullmatch(r'[A-Za-z][A-Za-z \-]{3,40}', p) and (' ' in p or p.lower() in ALLOW): fs.add(p.lower())
out, owner = {}, {}
for k, fs in forms.items():
    keep = []
    for f in sorted(fs):
        f = re.sub(r'\s+', ' ', f).strip()
        if f in STOP and f not in ALLOW: continue
        if ' ' not in f and len(f) < 7 and f not in ALLOW and not re.fullmatch(r'[a-z]{2,5}', f) : continue
        if ' ' not in f and len(f) <= 5 and f not in ALLOW:
            # short single words only if they are abbreviations from parentheses (all-caps originally)
            if not any(re.search(r'\(\s*' + re.escape(f.upper()) + r'\s*\)', x) for x in [k]): pass
        if f in owner and owner[f] != k: continue
        owner[f] = k; keep.append(f)
    if keep: out[k] = keep
stop = sorted(STOP - ALLOW)
json.dump({'forms': out, 'merge': {}, 'stop': stop}, open('content/lexicon.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(out), 'keys;', sum(len(v) for v in out.values()), 'forms')
for probe in ['omnipotent', 'omniscient', 'psr', 'per se', 'nominalist', 'immutable', 'actus purus', 'contingent', 'eternal']:
    print(f"  {probe!r} ->", owner.get(probe))
