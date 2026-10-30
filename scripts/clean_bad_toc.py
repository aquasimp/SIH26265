with open('docs/rendered_document.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's see if <div class="toc-container"> is at the end of the file
bad_block = '<div class="toc-container">\n  <div class="toc-title">TABLE OF CONTENTS</div>'
pos = text.find(bad_block)
print("pos of bad_block:", pos)
if pos != -1:
    text = text[:pos] + '</body>\n</html>\n'
    with open('docs/rendered_document.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Removed duplicate/misplaced TOC block successfully!")

