"""Bundle course content into data/course-data.js and write index.html + artifact.html.

Run:  python build.py
"""
import glob
import json
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
HOSTED_VIDEO_LIMIT = 15 * 1024 * 1024  # published artifact files must be <= 15 MB

DOCS = {
    "primer": "000-philosophy-foundations.md",
    "intro": "00-introduction.md",
    "ch1": "01-aristotelian-proof.md",
    "ch2": "02-neo-platonic-proof.md",
    "ch3": "03-augustinian-proof.md",
    "ch4": "04-thomistic-proof.md",
    "ch5": "05-rationalist-proof.md",
    "ch6a": "06a-nature-of-god-part-1.md",
    "ch6b": "06b-nature-of-god-part-2.md",
    "ch7a": "07a-common-objections-part-1.md",
    "ch7b": "07b-common-objections-part-2.md",
    "capstone": "10-capstone-synthesis.md",
}


def main():
    modules, problems = [], []
    lexicon = None
    for path in sorted(glob.glob(os.path.join(ROOT, "content", "*.json"))):
        try:
            with open(path, encoding="utf-8") as f:
                d = json.load(f)
        except Exception as e:  # keep building with what is valid
            problems.append(f"{os.path.basename(path)}: {e}")
            continue
        if os.path.basename(path) == "lexicon.json":
            lexicon = d
        elif isinstance(d, dict) and d.get("id") and "summary" in d:
            modules.append(d)

    docs = {}
    for mid, name in DOCS.items():
        p = os.path.join(ROOT, "notebooklm", name)
        if os.path.exists(p):
            with open(p, encoding="utf-8") as f:
                docs[mid] = {"file": name, "text": f.read()}

    video_files, hosted_videos = {}, {}
    for mid in DOCS:
        for ext in ("mp4", "webm", "m4v", "mov"):
            p = os.path.join(ROOT, "videos", f"{mid}.{ext}")
            if os.path.exists(p):
                video_files[mid] = f"videos/{mid}.{ext}"
                if os.path.getsize(p) <= HOSTED_VIDEO_LIMIT:
                    hosted_videos[mid] = f"videos/{mid}.{ext}"
                break

    data = {"modules": modules, "docs": docs, "videoFiles": video_files, "hostedVideos": hosted_videos}
    dpath = os.path.join(ROOT, "content", "diagrams.json")
    if os.path.exists(dpath):
        with open(dpath, encoding="utf-8") as f:
            data["diagrams"] = json.load(f)
    if lexicon:
        data["lexicon"] = lexicon
    os.makedirs(os.path.join(ROOT, "data"), exist_ok=True)
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(ROOT, "data", "course-data.js"), "w", encoding="utf-8") as f:
        f.write("window.COURSE_DATA=" + payload + ";\n")

    with open(os.path.join(ROOT, "src", "page.html"), encoding="utf-8") as f:
        frag = f.read()
    with open(os.path.join(ROOT, "artifact.html"), "w", encoding="utf-8") as f:
        f.write(frag)
    with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8") as f:
        f.write('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
                '<meta name="viewport" content="width=device-width, initial-scale=1">\n</head>\n<body>\n'
                + frag + "\n</body>\n</html>\n")

    print(f"modules: {len(modules)} {sorted(m['id'] for m in modules)}")
    print(f"notebooklm docs: {len(docs)}; lexicon: {'yes' if lexicon else 'no'}")
    print(f"videos: local {sorted(video_files)}; publishable {sorted(hosted_videos)}")
    print(f"course-data.js: {len(payload) / 1024:.0f} KB")
    for p in problems:
        print("SKIPPED", p)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
