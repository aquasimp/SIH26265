with open('docs/rendered_document.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's find where TABLE OF CONTENTS is
pos1 = text.find('<!-- TABLE OF CONTENTS')
pos2 = text.rfind('<!-- TABLE OF CONTENTS')
print('pos1:', pos1, 'pos2:', pos2)

# If duplicated, let's restore from the beginning up to pos2 or clean it up
# Let's see how many times 'PART A: SIH IDEA SUBMISSION PACK' appears
part_a_count = text.count('PART A: SIH IDEA SUBMISSION PACK')
print('part_a_count:', part_a_count)

