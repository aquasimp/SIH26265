import pypdf

reader = pypdf.PdfReader('docs/PROJECT_CONTEXT.pdf')
print(f"Total pages: {len(reader.pages)}")

sections = [
    ("Title Block & Executive Summary", "PART A: SIH IDEA SUBMISSION PACK"),
    ("1. Title & Problem Identification", "1. Title & Problem Identification"),
    ("2. Proposed Solution & Technical Innovation", "2. Proposed Solution & Technical Innovation"),
    ("3. Technical Approach, Architecture & Methodology", "3. Technical Approach, Architecture & Methodology"),
    ("4. Feasibility, Integration Roadmap & Risk Mitigation", "4. Feasibility, Integration Roadmap & Risk Mitigation"),
    ("5. Impact, Benefits & Measurable Outcomes", "5. Impact, Benefits & Measurable Outcomes"),
    ("6. Research Foundations & References", "6. Research Foundations & References"),
    ("PART B: Full Technical Context Deep Dive", "PART B: FULL TECHNICAL CONTEXT"),
    ("7. Comprehensive Product Screen Walkthrough", "7. Comprehensive Product Screen Walkthrough"),
    ("8. Canonical Data Model & Lifecycle State Machine", "8. Canonical Data Model & Lifecycle State Machine"),
    ("9. Deterministic Rules, Attention Scoring & Escalation", "9. Deterministic Rules, Attention Scoring & Escalation"),
    ("10. Role-Based Access Control & Security Architecture", "10. Role-Based Access Control & Security Architecture"),
    ("11. Deliberate Seed Edge Cases", "11. Deliberate Seed Edge Cases"),
    ("12. Design System Tokens & Animation Inventory", "12. Design System Tokens & Animation Inventory"),
    ("13. Standard Operating Procedures", "13. Standard Operating Procedures"),
    ("14. Integration Truth Table: Real vs. Mock", "14. Integration Truth Table: What is Real vs. Mock"),
    ("15. 3-Minute Live Demonstration Script", "15. 3-Minute Live Demonstration Script"),
    ("16. Quality Assurance, Automated Tests & Responsiveness", "16. Quality Assurance, Automated Tests & Responsiveness"),
    ("17. Installation, Deployment & Configuration Guide", "17. Installation, Deployment & Configuration Guide"),
    ("18. Technical Appendix, API Catalog & Regulatory Glossary", "18. Technical Appendix, REST API Catalog & Regulatory Glossary"),
    ("PART C: Jury Preparation & Defense Questions", "PART C: JURY PREPARATION & DEFENSE QUESTIONS"),
    ("19. 15 Critical Jury Defense Questions & Truthful Answers", "19. 15 Critical Jury Defense Questions & Truthful Answers"),
    ("20. 90-Second & 3-Minute Official Pitch Scripts", "20. 90-Second & 3-Minute Official Pitch Scripts"),
]

for name, query in sections:
    found_page = None
    # Skip pages 0 and 1 (Cover is page 1, TOC is page 2)
    for idx in range(2, len(reader.pages)):
        page = reader.pages[idx]
        t = page.extract_text() or ''
        if query.lower() in t.lower():
            found_page = idx + 1
            break
    print(f"{name:<55} -> Page {found_page}")

