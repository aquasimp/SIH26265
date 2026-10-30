with open('docs/PROJECT_CONTEXT.md', 'r', encoding='utf-8') as f:
    text = f.read()

exec_summary_pos = text.find('## Executive Summary')
next_part_pos = text.find('# PART A: SIH IDEA SUBMISSION PACK')

toc_markdown = """

---

## Table of Contents & PDF Page Mapping

| Part | Section | Description | Corresponding PDF Page |
| :--- | :--- | :--- | :--- |
| **PART A** | **[1. Title & Problem Identification](#1-title--problem-identification)** | Statutory AICTE Context, APH Norms & 6 Operational Failure Points | Page 3 |
| | **[2. Proposed Solution & Traceability](#2-proposed-solution)** | End-to-End Governance Architecture, 10-Capability Traceability Matrix & 6 Core Innovations | Page 3 |
| | **[3. Technical Approach & Architecture](#3-technical-approach--architecture)** | Full System Architecture, Data Flow Diagrams, Tech Stack & Operational Methodology | Page 5 |
| | **[4. Feasibility, Roadmap & Mitigations](#4-feasibility-integration-roadmap--risk-mitigations)** | Implementation Feasibility, External Integration Roadmap, Risk Matrix & Rollout Plan | Page 7 |
| | **[5. Impact, Benefits & Measurable Outcomes](#5-impact-benefits--measurable-outcomes)** | Stakeholder Impact, Simulated Operational Benchmarks (n = 38/140), Sustainability & Future Work | Page 9 |
| | **[6. Research Foundations & References](#6-research-foundations--references)** | 13 Verified Primary Statutory Citations, Research Finding Decisions & Government Gap Analysis | Page 10 |
| **PART B** | **[7. Comprehensive Product Screen Walkthrough](#7-comprehensive-product-screen-walkthrough)** | 10 High-Density Operational Screens with Annotated Screenshots & Persona Workflows | Page 11 |
| | **[8. Canonical Data Model & Lifecycle State Machine](#8-canonical-data-model--lifecycle-state-machine)** | TypeScript Entity Interfaces (`FdrInstrument`, `AuditEvent`) & Valid State Transitions | Page 16 |
| | **[9. Deterministic Rules & Attention Scoring](#9-deterministic-rules-attention-scoring--escalation-engines)** | 8 Discrepancy Rules, 100-Point Formula, Escalation Timetable & Tesseract OCR Flow | Page 18 |
| | **[10. Role-Based Access Control Architecture](#10-role-based-access-control-rbac-architecture)** | Role x Action Privilege Matrix across 5 Administrative Personas | Page 19 |
| | **[11. Data Protection & Cryptographic Audit Ledger](#11-data-protection-masking--cryptographic-audit-ledger)** | DPDP 2023 Masking Rules & SHA-256 Merkle-Style Hash Chaining | Page 19 |
| | **[12. Design System Tokens & Animation Inventory](#12-design-system-tokens-typography--animation-inventory)** | Warm Paper Tokens, Typography Scale, WCAG 2.1 AA Compliance & Micro-Animations | Page 20 |
| | **[13. Synthetic Seed Dataset & Edge Case Catalog](#13-synthetic-seed-dataset--edge-case-catalog)** | Deterministic Dataset (n = 140) & 6 Deliberate Statutory Edge Cases | Page 20 |
| | **[14. Integration Truth Table: Real vs. Mock](#14-integration-truth-table-what-is-real-vs-mock)** | Comprehensive Boundary Matrix (Live Core Stack vs Simulated CBS/SMS Gateways) | Page 21 |
| | **[15. Click-by-Click 3-Minute Evaluation Script](#15-click-by-click-3-minute-live-evaluation-script)** | 7 Sequential Demonstration Test Steps for Hackathon Jury Evaluation | Page 21 |
| | **[16. Quality Assurance & Automated Tests](#16-quality-assurance-automated-tests--responsive-audit)** | Test Results (45/45 Passed), Zero ESLint Warnings, Zero Type Errors & Viewport Audit | Page 22 |
| | **[17. Execution, Configuration & Deployment Guide](#17-execution-configuration--deployment-guide)** | Exact Terminal Setup, Production Build Commands & Environment Variable Specifications | Page 22 |
| | **[18. Technical Appendix & API Catalog](#18-technical-appendix-api-catalog--regulatory-glossary)** | Repository File Purpose Map, REST API Route Specifications & Regulatory Glossary | Page 22 |
| **PART C** | **[19. 15 Critical Jury Defense Questions & Answers](#19-15-critical-jury-defense-questions--truthful-answers)** | Rigorous Technical Defenses covering Architecture, False Positives, Costs & Privacy | Page 23 |
| | **[20. Pitch Scripts (90-Second & 3-Minute)](#20-pitch-scripts)** | Word-for-Word Juror Presentation Scripts with Empirical Proof Points | Page 24 |

---

"""

# Check if TOC already exists
if '## Table of Contents & PDF Page Mapping' not in text:
    # insert before '# PART A: SIH IDEA SUBMISSION PACK'
    text = text[:next_part_pos] + toc_markdown + text[next_part_pos:]
    with open('docs/PROJECT_CONTEXT.md', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Inserted Table of Contents into docs/PROJECT_CONTEXT.md successfully!")
else:
    print("TOC already exists in PROJECT_CONTEXT.md")

