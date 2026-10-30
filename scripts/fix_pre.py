import re

with open('docs/rendered_document.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Change pre CSS
text = text.replace(
    'pre {\n      background: #F4F1EA;\n      border: 1px solid #D5D1C8;\n      border-radius: 4px;\n      padding: 7px 9px;\n      font-size: 7.2pt;\n      line-height: 1.35;\n      white-space: pre-wrap;\n      word-break: break-all;\n      margin: 6px 0 10px 0;\n      page-break-inside: avoid;\n    }',
    'pre {\n      background: #F4F1EA;\n      border: 1px solid #D5D1C8;\n      border-radius: 4px;\n      padding: 7px 9px;\n      font-size: 7.2pt;\n      line-height: 1.35;\n      white-space: pre-wrap;\n      word-break: break-all;\n      margin: 6px 0 10px 0;\n      page-break-inside: auto;\n    }'
)

# Split the big code block in Section 8
old_code_marker = '// FDR Instrument Schema (src/types/fdr.ts)'
audit_event_marker = '// Cryptographic Audit Event Schema (src/types/audit.ts)'

if old_code_marker in text and audit_event_marker in text:
    # Let's replace the single <pre><code>...</code></pre> with two separate blocks
    split_target = '\n\n// Cryptographic Audit Event Schema (src/types/audit.ts)'
    replacement = '</code></pre>\n\n  <h3 class="subsection-header">Audit & Verification Event Schemas</h3>\n  <pre><code>// Cryptographic Audit Event Schema (src/types/audit.ts)'
    text = text.replace(split_target, replacement)
    print('Split Section 8 schema into two focused code blocks')

with open('docs/rendered_document.html', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated pre CSS and Section 8 code blocks')

