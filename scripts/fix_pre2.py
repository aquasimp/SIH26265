with open('docs/rendered_document.html', 'r', encoding='utf-8') as f:
    text = f.read()

target = '\n\n// Cryptographic Audit Block (src/types/audit.ts)'
replacement = '</code></pre>\n\n  <h3 class="subsection-header">Cryptographic Audit & Discrepancy Schemas</h3>\n  <pre><code>// Cryptographic Audit Block (src/types/audit.ts)'

if target in text:
    text = text.replace(target, replacement)
    print('Successfully split code block in Section 8!')
else:
    print('Target not found')

with open('docs/rendered_document.html', 'w', encoding='utf-8') as f:
    f.write(text)

