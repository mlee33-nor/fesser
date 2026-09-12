import json, collections
base = r'C:\Users\mleet\Desktop\house\five-proofs-course\content'
d = {}
for i in range(1, 6):
    with open(base + r'\_parts\ch3\p%d.json' % i, encoding='utf-8') as f:
        part = json.load(f)
    for k in part:
        assert k not in d, k
    d.update(part)
order = ["id","order","label","title","tagline","bookPages","estMinutes","oneSentence","bigPicture","objectives","summary","argument","keyTerms","distinctions","illustrations","objections","misconceptions","explain","persuade","connections","quiz","shortAnswer","flashcards","teachBack","videoPrompt"]
missing = [k for k in order if k not in d]
extra = [k for k in d if k not in order]
print("missing", missing, "extra", extra)
out = {k: d[k] for k in order if k in d}
with open(base + r'\ch3.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
q = out["quiz"]
print("summary", len(out["summary"]), "steps", len(out["argument"]["steps"]), "keyTerms", len(out["keyTerms"]), "distinctions", len(out["distinctions"]), "illus", len(out["illustrations"]), "objections", len(out["objections"]), "misc", len(out["misconceptions"]))
print("quiz", len(q), collections.Counter(x["answer"] for x in q), collections.Counter(x["level"] for x in q))
print("shortAnswer", len(out["shortAnswer"]), "flashcards", len(out["flashcards"]), "dialogue", len(out["persuade"]["dialogue"]), "socratic", len(out["persuade"]["socratic"]), "traps", len(out["persuade"]["traps"]), "audiences", len(out["persuade"]["audiences"]), "whiteboard", len(out["explain"]["whiteboard"]), "connections", len(out["connections"]))
print("tweet len", len(out["explain"]["tweet"]), "elevator words", len(out["explain"]["elevator"].split()), "twoMinute words", len(out["explain"]["twoMinute"].split()), "video words", len(out["videoPrompt"].split()))
print("summary words", sum(len(s["body"].split()) for s in out["summary"]))
assert [s["n"] for s in out["argument"]["steps"]] == list(range(1,30))
for x in q: assert len(x["options"])==4
