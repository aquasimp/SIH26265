import pypdf
import re

reader = pypdf.PdfReader('docs/PROJECT_CONTEXT.pdf')
print(f"Total pages: {len(reader.pages)}")

sections = [
    ("Title & Problem Identification", "1. Title & Problem Identification"),
    ("Proposed Solution & Innovation", "2. Proposed Solution & Technical Innovation"),
    ("Traceability Matrix", "Traceability Matrix"),
    ("Technical Approach", "3. Technical Approach, Architecture & Methodology"),
    ("Feasibility & Viability", "4. Feasibility, Integration Roadmap & Risk Mitigation"),
    ("Impact & Measurable Outcomes", "5. Impact, Benefits & Measurable Outcomes"),
    ("Research Foundations & References", "6. Research Foundations & References"),
    ("Government Gap Analysis", "Government Gap Analysis"),
    ("Comprehensive Product Walkthrough", "7. Comprehensive Product Screen Walkthrough"),
    ("Canonical Data Model & State Machine", "8. Canonical Data Model & Lifecycle State Machine"),
    ("Deterministic Rules & Attention Scoring", "9. Deterministic Rules, Attention Scoring & Escalation Engines"),
    ("Role-Based Access Control", "10. Role-Based Access Control & Security Architecture"),
    ("Deliberate Edge Cases", "11. Deliberate Seed Edge Cases"),
    ("Design System Tokens & Animation", "12. Design System Tokens & Animation Inventory"),
    ("Standard Operating Procedures", "13. Standard Operating Procedures"),
    ("Integration Truth Table", "14. Integration Truth Table: What is Real vs. Mock"),
    ("3-Minute Live Demonstration Script", "15. 3-Minute Live Demonstration Script"),
    ("Quality Assurance & Automated Tests", "16. Quality Assurance, Automated Tests & Responsiveness"),
    ("Installation & Deployment", "17. Installation, Deployment & Configuration Guide"),
    ("Technical Appendix & API Catalog", "18. Technical Appendix, REST API Catalog & Regulatory Glossary"),
    ("15 Critical Jury Defense Questions", "19. 15 Critical Jury Defense Questions & Truthful Answers"),
    ("Pitch Scripts", "20. 90-Second & 3-Minute Official Pitch Scripts"),
]

for name, query in sections:
    found_page = None
    for idx, page in enumerate(reader.pages):
        t = page.extract_text() or ''
        if query.lower() in t.lower() or query.split('.')[0].lower() in t.lower():
            # Check if this looks like the section header on this page
            lines = [l.strip().lower() for l in t.split('\n') if l.strip()]
            for l in lines:
                if query.lower() in l or (len(query.split('.')) > 1 and query.split('.')[0].strip().lower() == l.split('.')[0].strip().lower() and len(l) < 80):
                    found_page = idx + 1
                    break
            if found_page:
                break
    print(f"{name:<45} -> Page {found_page}")

