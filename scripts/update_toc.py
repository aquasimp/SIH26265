with open('docs/rendered_document.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Current TOC replacement mapping
toc_replacements = [
    ('<span>Page 3</span>', '<span>Page 3</span>'),
    ('<span>3</span>', '<span>3</span>'),
    ('<span>4</span>', '<span>3</span>'),
    ('<span>6</span>', '<span>5</span>'),
    ('<span>8</span>', '<span>7</span>'),
    ('<span>10</span>', '<span>9</span>'),
    ('<span>11</span>', '<span>10</span>'),
    ('<span>Page 13</span>', '<span>Page 11</span>'),
    ('<span>13</span>', '<span>11</span>'),
    ('<span>18</span>', '<span>16</span>'),
    ('<span>20</span>', '<span>18</span>'),
    ('<span>22</span>', '<span>19</span>'),
    ('<span>23</span>', '<span>19</span>'),
    ('<span>25</span>', '<span>20</span>'),
    ('<span>26</span>', '<span>20</span>'),
    ('<span>27</span>', '<span>21</span>'),
    ('<span>28</span>', '<span>21</span>'),
    ('<span>29</span>', '<span>22</span>'),
    ('<span>30</span>', '<span>22</span>'),
    ('<span>31</span>', '<span>22</span>'),
    ('<span>Page 33</span>', '<span>Page 23</span>'),
    ('<span>33</span>', '<span>23</span>'),
    ('<span>35</span>', '<span>24</span>'),
]

# Let's inspect the exact TOC block in HTML
toc_start = text.find('<div class="toc-container">')
toc_end = text.find('<!-- ========================================================================= -->\n<!-- PART A:')

toc_html = text[toc_start:toc_end]

# Replace TOC block cleanly
exact_new_toc = """<div class="toc-container">
  <div class="toc-title">TABLE OF CONTENTS</div>
  
  <div class="toc-item level-1"><span>PART A: SIH IDEA SUBMISSION PACK</span><span>Page 3</span></div>
  <div class="toc-item level-2"><a href="#sec-1">1. Title & Problem Identification (Statutory Context & 6 Pain Points)</a><span>3</span></div>
  <div class="toc-item level-2"><a href="#sec-2">2. Proposed Solution (Traceability Matrix & 6 Core Innovations)</a><span>3</span></div>
  <div class="toc-item level-2"><a href="#sec-3">3. Technical Approach (Architecture & Data Flow Diagrams, Methodology)</a><span>5</span></div>
  <div class="toc-item level-2"><a href="#sec-4">4. Feasibility & Viability (Implementation Reality, Integration Roadmap)</a><span>7</span></div>
  <div class="toc-item level-2"><a href="#sec-5">5. Impact & Measurable Outcomes (Simulated Benchmarks, Benefits)</a><span>9</span></div>
  <div class="toc-item level-2"><a href="#sec-6">6. Research & References (13 Primary Citations, Gap Analysis)</a><span>10</span></div>

  <div class="toc-item level-1"><span>PART B: FULL TECHNICAL CONTEXT</span><span>Page 11</span></div>
  <div class="toc-item level-2"><a href="#sec-7">7. Comprehensive Product Screen Walkthrough (10 Screens with Screenshots)</a><span>11</span></div>
  <div class="toc-item level-2"><a href="#sec-8">8. Canonical Data Model & Lifecycle State Machine (TypeScript Schemas)</a><span>16</span></div>
  <div class="toc-item level-2"><a href="#sec-9">9. Deterministic Rules, Attention Scoring & Escalation Engines</a><span>18</span></div>
  <div class="toc-item level-2"><a href="#sec-10">10. Role-Based Access Control Architecture (Privilege Matrix)</a><span>19</span></div>
  <div class="toc-item level-2"><a href="#sec-11">11. Data Protection, Masking & Cryptographic Audit Ledger (SHA-256)</a><span>19</span></div>
  <div class="toc-item level-2"><a href="#sec-12">12. Design System Tokens, Typography & Animation Inventory</a><span>20</span></div>
  <div class="toc-item level-2"><a href="#sec-13">13. Synthetic Seed Dataset & Edge Case Catalog (6 Edge Cases)</a><span>20</span></div>
  <div class="toc-item level-2"><a href="#sec-14">14. Integration Truth Table: What is Real vs. Mock</a><span>21</span></div>
  <div class="toc-item level-2"><a href="#sec-15">15. Click-by-Click 3-Minute Live Evaluation Script</a><span>21</span></div>
  <div class="toc-item level-2"><a href="#sec-16">16. Quality Assurance, Automated Tests & Responsive Viewport Audit</a><span>22</span></div>
  <div class="toc-item level-2"><a href="#sec-17">17. Execution, Configuration & Deployment Guide</a><span>22</span></div>
  <div class="toc-item level-2"><a href="#sec-18">18. Technical Appendix, REST API Catalog & Regulatory Glossary</a><span>22</span></div>

  <div class="toc-item level-1"><span>PART C: JURY PREPARATION & DEFENSE</span><span>Page 23</span></div>
  <div class="toc-item level-2"><a href="#sec-19">19. 15 Critical Jury Defense Questions & Truthful Answers</a><span>23</span></div>
  <div class="toc-item level-2"><a href="#sec-20">20. 90-Second & 3-Minute Official Pitch Scripts</a><span>24</span></div>
</div>
</div>
"""

text = text[:toc_start] + exact_new_toc + text[toc_end:]

with open('docs/rendered_document.html', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated TOC in docs/rendered_document.html')

