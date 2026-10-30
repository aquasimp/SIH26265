import re

with open('docs/rendered_document.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Un-nest references
ref_header = '<h2 class="section-header" id="sec-6">6. Research Foundations & References</h2>'
sec7_header = '<h2 class="section-header" id="sec-7">'

if ref_header in content and sec7_header in content:
    ref_start = content.find(ref_header)
    sec7_start = content.find(sec7_header)
    ref_section = content[ref_start:sec7_start]

    # Find the giant avoid-break wrapping references
    # <div class="avoid-break" style="font-size: 7.6pt; line-height: 1.45;">
    giant_ref_open = '<div class="avoid-break" style="font-size: 7.6pt; line-height: 1.45;">'
    if giant_ref_open in ref_section:
        ref_section = ref_section.replace(giant_ref_open, '')
        # find the matching closing </div> right before <h3 style="font-size: 9pt;
        h3_pos = ref_section.find('<h3 style="font-size: 9pt;')
        if h3_pos != -1:
            # find last </div> before h3_pos
            last_div = ref_section.rfind('</div>', 0, h3_pos)
            if last_div != -1:
                ref_section = ref_section[:last_div] + ref_section[last_div+6:]
        
        # wrap each <p><strong>[\d+] in avoid-break
        def wrap_ref(m):
            return f'<div class="avoid-break" style="font-size: 7.6pt; line-height: 1.45; margin-bottom: 5px;">{m.group(0)}</div>'
        
        ref_section = re.sub(r'<p><strong>\[\d+\]</strong>.*?</p>', wrap_ref, ref_section, flags=re.DOTALL)
        content = content[:ref_start] + ref_section + content[sec7_start:]
        print('Updated references to individual avoid-break items')

# 2. In Section 1, un-nest 6 pain points
pain_header = 'Six Systemic Failure Points in Current Deposit Governance:'
if pain_header in content:
    pos = content.find(pain_header)
    div_start = content.rfind('<div class="avoid-break"', 0, pos)
    if div_start != -1:
        # find closing div after </ul>
        ul_end = content.find('</ul>', pos)
        if ul_end != -1:
            div_end = content.find('</div>', ul_end)
            if div_end != -1:
                # remove the outer avoid break
                content = content[:div_start] + content[div_start+len('<div class="avoid-break" style="margin-top: 10px;">'):div_end] + content[div_end+6:]
                print('Un-nested 6 pain points')

with open('docs/rendered_document.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')

