import re

with open('docs/rendered_document.html', 'r', encoding='utf-8') as f:
    html = f.read()

pattern = re.compile(r'<div class="avoid-break"[^>]*>(.*?)</div>', re.DOTALL)
matches = pattern.finditer(html)

for i, m in enumerate(matches):
    content = m.group(1)
    text = re.sub(r'<[^>]+>', ' ', content)
    words = text.split()
    if len(text) > 400:
        print(f"Match {i} at pos {m.start()}: len={len(text)} chars, words={len(words)} | {' '.join(words[:10])}")

