with open('docs/rendered_document.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos1 = text.find('<div class="avoid-break page-break-after">\n  <h2 class="section-header">TABLE OF CONTENTS</h2>')
pos2 = text.find('<!-- ========================================================================= -->\n<!-- PART A:', pos1)

new_toc = """<div class="avoid-break page-break-after">
  <h2 class="section-header">TABLE OF CONTENTS</h2>
  
  <div class="toc-item level-1"><span>PART A: SIH IDEA SUBMISSION PACK</span><span>Page 3</span></div>
  <div class="toc-item level-2"><a href="#sec-1">1. Title & Problem Identification (Statutory Context & 6 Pain Points)</a><span>3</span></div>
  <div class="toc-item level-2"><a href="#sec-2">2. Proposed Solution (Architecture, Traceability Matrix & 6 Core Innovations)</a><span>3</span></div>
  <div class="toc-item level-2"><a href="#sec-3">3. Technical Approach (Architecture & Data Flow Diagrams, Tech Stack, Methodology)</a><span>5</span></div>
  <div class="toc-item level-2"><a href="#sec-4">4. Feasibility & Viability (Implementation Reality, Integration Roadmap, Risk Mitigations)</a><span>7</span></div>
  <div class="toc-item level-2"><a href="#sec-5">5. Impact & Measurable Outcomes (Simulated Benchmarks, Stakeholder Benefits)</a><span>9</span></div>
  <div class="toc-item level-2"><a href="#sec-6">6. Research & References (13 Verified Primary Citations, Design Decisions, Gap Analysis)</a><span>10</span></div>

  <div class="toc-item level-1"><span>PART B: FULL TECHNICAL CONTEXT</span><span>Page 11</span></div>
  <div class="toc-item level-2"><a href="#sec-7">7. Comprehensive Product Screen Walkthrough (10 High-Density Screens with Screenshots)</a><span>11</span></div>
  <div class="toc-item level-2"><a href="#sec-8">8. Canonical Data Model & Lifecycle State Machine (TypeScript Schemas & State Machine)</a><span>16</span></div>
  <div class="toc-item level-2"><a href="#sec-9">9. Deterministic Rules, Attention Scoring & Escalation Engines (Formulas & Logic)</a><span>18</span></div>
  <div class="toc-item level-2"><a href="#sec-10">10. Role-Based Access Control Architecture (Privilege Matrix & 5 Personas)</a><span>19</span></div>
  <div class="toc-item level-2"><a href="#sec-11">11. Data Protection, Masking & Cryptographic Audit Ledger (SHA-256 Chaining & DPDP)</a><span>19</span></div>
  <div class="toc-item level-2"><a href="#sec-12">12. Design System Tokens, Typography & Animation Inventory (Tokens & WCAG AA)</a><span>20</span></div>
  <div class="toc-item level-2"><a href="#sec-13">13. Synthetic Seed Dataset & Edge Case Catalog (6 Deliberate Regulatory Edge Cases)</a><span>20</span></div>
  <div class="toc-item level-2"><a href="#sec-14">14. Integration Truth Table: What is Real vs. Mock</a><span>21</span></div>
  <div class="toc-item level-2"><a href="#sec-15">15. Click-by-Click 3-Minute Live Evaluation Script (7 Sequential Test Steps)</a><span>21</span></div>
  <div class="toc-item level-2"><a href="#sec-16">16. Quality Assurance, Automated Tests & Responsive Viewport Audit (45 Passed Tests)</a><span>22</span></div>
  <div class="toc-item level-2"><a href="#sec-17">17. Execution, Configuration & Deployment Guide</a><span>22</span></div>
  <div class="toc-item level-2"><a href="#sec-18">18. Technical Appendix, REST API Catalog & Regulatory Glossary</a><span>22</span></div>

  <div class="toc-item level-1"><span>PART C: JURY PREPARATION & DEFENSE</span><span>Page 23</span></div>
  <div class="toc-item level-2"><a href="#sec-19">19. 15 Critical Jury Defense Questions & Truthful Answers</a><span>23</span></div>
  <div class="toc-item level-2"><a href="#sec-20">20. 90-Second & 3-Minute Official Pitch Scripts</a><span>24</span></div>
</div>
"""

text = text[:pos1] + new_toc + text[pos2:]

with open('docs/rendered_document.html', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated actual TOC block cleanly')

