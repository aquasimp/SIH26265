import pypdf
import re

reader = pypdf.PdfReader('docs/PROJECT_CONTEXT.pdf')

print("=== HEADINGS ON EVERY PAGE ===")
for i in range(len(reader.pages)):
    t = reader.pages[i].extract_text() or ''
    # find lines that start with numbers like "1.", "2.", "PART", or all caps headings
    found = []
    for line in t.split('\n'):
        line = line.strip()
        if re.match(r'^(PART [A-C]|([0-9]{1,2}\.\s+[A-Za-z0-9&,: \-\(\)]+)|TABLE OF CONTENTS)', line):
            found.append(line)
    print(f"Page {i+1:2d}: {', '.join(found) if found else 'No major heading'}")

