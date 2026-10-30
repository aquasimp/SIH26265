import re

with open('docs/rendered_document.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS for pre/code-block to allow breaking inside if long
content = content.replace(
    'pre, .code-block {\n      background: #F4F1EA;\n      border: 1px solid #D5D1C8;\n      border-radius: 4px;\n      padding: 7px 9px;\n      font-size: 7.2pt;\n      line-height: 1.35;\n      white-space: pre-wrap;\n      word-break: break-all;\n      margin: 6px 0 10px 0;\n      page-break-inside: avoid;\n    }',
    'pre, .code-block {\n      background: #F4F1EA;\n      border: 1px solid #D5D1C8;\n      border-radius: 4px;\n      padding: 7px 9px;\n      font-size: 7.2pt;\n      line-height: 1.35;\n      white-space: pre-wrap;\n      word-break: break-all;\n      margin: 6px 0 10px 0;\n      page-break-inside: auto;\n    }'
)

# 2. Split jury questions: replace the single giant avoid-break wrapping all 15 questions
q_pos = content.find('19. 15 Critical Jury Defense Questions & Truthful Answers</h2>')
if q_pos != -1:
    after_h2 = content[q_pos:]
    # find <div class="avoid-break" style="font-size: 8pt; margin-bottom: 8px;">
    giant_open = '<div class="avoid-break" style="font-size: 8pt; margin-bottom: 8px;">\n    <p><strong>Q1:'
    if giant_open in after_h2:
        # replace with individual avoid-break divs for each question
        # We find each <p><strong>Q and wrap it in <div class="avoid-break" style="margin-bottom: 8px; font-size: 8pt;">...</div>
        part_c_content = content[q_pos:content.find('<h2 class="section-header" id="sec-20">')]
        
        # remove the outer <div class="avoid-break" ...> and its closing </div>
        cleaned_part_c = part_c_content.replace(
            '<div class="avoid-break" style="font-size: 8pt; margin-bottom: 8px;">\n',
            ''
        )
        # remove the last </div> before sec-20
        last_div_idx = cleaned_part_c.rfind('</div>')
        if last_div_idx != -1:
            cleaned_part_c = cleaned_part_c[:last_div_idx] + cleaned_part_c[last_div_idx+6:]
        
        # now wrap each Q\d+ paragraph pair in avoid-break
        # Pattern: <p><strong>Q\d+:.*?</em></p>
        def wrap_qa(m):
            return f'<div class="avoid-break" style="font-size: 8pt; margin-bottom: 8px;">{m.group(0)}</div>'
        
        cleaned_part_c = re.sub(r'<p><strong>Q\d+:.*?</em></p>', wrap_qa, cleaned_part_c, flags=re.DOTALL)
        content = content[:q_pos] + cleaned_part_c + content[content.find('<h2 class="section-header" id="sec-20">'):]
        print('Successfully broke Jury Questions into individual avoid-break units')

# 3. In Section 6 (References): split the single giant avoid-break
ref_open = '<div class="avoid-break">\n  <ol class="ref-list">\n    <li id="ref-1">'
if ref_open in content:
    # replace outer avoid-break
    content = content.replace('<div class="avoid-break">\n  <ol class="ref-list">', '<ol class="ref-list">')
    # and remove closing </div> for it
    # find where </ol> is in references
    ol_pos = content.find('</ol>\n</div>\n\n  <h3 style="font-size: 9pt;')
    if ol_pos != -1:
        content = content[:ol_pos] + '</ol>\n\n  <h3 style="font-size: 9pt;' + content[ol_pos+len('</ol>\n</div>\n\n  <h3 style="font-size: 9pt;'):]
        print('Successfully un-nested References list from giant avoid-break')

with open('docs/rendered_document.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated docs/rendered_document.html successfully')

