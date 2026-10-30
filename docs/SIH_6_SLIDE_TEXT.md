# SIH 2026 Ready-to-Paste 6-Slide Idea Presentation Deck

> **Problem Statement ID:** SIH26265  
> **Title:** Streamline of Security Deposit / Fixed Deposit Receipt (FDR) Portal  
> **Target Bureau:** All India Council for Technical Education (AICTE), Regulation Bureau  
> **Theme:** Smart Automation & Digital Treasury Governance | **Category:** Software  
> **Team Name:** [Team Name Placeholder] | **Product Name:** AICTE Central Treasury Portal  
> **Tagline:** Sovereign Digital Lifecycle & Cryptographic Compliance for Technical Education Security Deposits

---

## Slide 1: Title & Regulatory Scope

- **Problem Statement ID:** SIH26265 — Streamline of Security Deposit / FDR Portal [2].
- **Target Organization:** All India Council for Technical Education (AICTE), Regulation Bureau [1].
- **Core Challenge:** Governing ₹400+ Cr across 10,000+ technical institutions holding 10-year joint FDR security deposits [1].
- **Current Bottlenecks:** Physical paper receipt routing, 30–60 day postal bank verification lags, and unmonitored maturity expiries [11], [12].
- **Our Solution:** High-density regulatory treasury terminal with OCR-assisted intake, dual-source provenance matching, transparent 100-pt attention triage, hard release gates, and SHA-256 cryptographic audit logs [10].
- **Deployment Status:** Fully functional, test-verified prototype with 140 synthetic instruments and zero console errors.

> **Visual Asset for Slide 1:**  
> Place screenshot: `docs/screenshots/01-treasury-dashboard.png` (or high-density command console overview).

---

## Slide 2: Proposed Solution & Innovations

- **OCR-Assisted Intake:** Automated field parsing with bounding box coordinate mapping and per-field confidence meters before human ledger commit [13].
- **Dual-Source Provenance:** Side-by-side auditable comparison displaying applicant-declared fields vs core banking (CBS) verified records.
- **Transparent Attention Scoring:** Explainable 100-point priority formula (Maturity Urgency + Discrepancy Severity + CBS Status + Renewal State); zero black-box AI claims.
- **Deterministic 8-Rule Discrepancy Engine:** Real-time intercept of bank/IFSC prefix mismatches [5], duplicate receipt collisions, and temporal inversions.
- **Inviolable Hard Release Gate:** Hardcoded block (HTTP 422) preventing release recommendation or sanction while any compliance flag remains open [3], [6].
- **Cryptographic Audit Ledger:** Immutable SHA-256 block-chained event log ensuring tamper-evident tracking from intake to final discharge [9], [10].

> **Visual Asset for Slide 2:**  
> Place screenshot: `docs/screenshots/03-fdr-inspection-provenance.png` (Provenance comparison) alongside `docs/diagrams/data-flow-diagram.png`.

---

## Slide 3: Technical Approach & Architecture

- **Modern Architecture:** Next.js 14 App Router, TypeScript (Strict Mode), Tailwind CSS, and Zod runtime schema validation.
- **Dual Persistence Strategy:** Production SQLite via Prisma paired with zero-config deterministic in-memory store for instant serverless evaluation.
- **Role-Based Access Control (RBAC):** Strict 5-role segregation (Institution User, Scrutiny Officer, Regional Officer, Bureau Head, Auditor) enforced at API layer [7].
- **Auditor Privacy Protection:** Automated masking of sensitive account and deposit identifiers for compliance auditors (`maskSensitiveId`) [7].
- **Universal Accessibility (GIGW 3.0):** 100% responsive across 12 viewports (320px–1440px), keyboard shortcuts (`⌘K`), and bilingual toggle (English / Hindi) [8].
- **Reliable Engineering:** 45 Vitest unit tests passing (100%), 0 ESLint warnings, and static production build verified.

> **Visual Asset for Slide 3:**  
> Place diagram: `docs/diagrams/architecture-diagram.png` (Full system architecture).

---

## Slide 4: Feasibility, Viability & Integration Roadmap

- **Demonstrated Feasibility:** Working prototype deployed and verifiable locally or on cloud; 7-step demo scenario executed in under 3 minutes.
- **Banking Integration Path:** Phase 1 uses SFMS MT760/MT767 structured messaging [11]; Phase 2 integrates with NeSL Digital Document Execution [12]; Phase 3 offers direct Open Banking CBS API adapters.
- **Risk Mitigation:** OCR misreads mitigated via human-in-the-loop validation; false positives prevented via deterministic lookup tables [5].
- **Phased Rollout:** 90-day pilot across Western Regional Office (WRO) technical colleges before nationwide phased deployment across all 8 AICTE regions.
- **Low Operating Cost:** Lightweight stateless microservice deployable on existing National Informatics Centre (NIC) cloud infrastructure with zero licensing fees.

> **Visual Asset for Slide 4:**  
> Place diagram: `docs/diagrams/release-gate-flow.png` (3-tier release governance) or `docs/screenshots/07-release-governance-queue.png`.

---

## Slide 5: Measurable Impact & Simulated Outcomes

- **Turnaround Compression:** Verification turnaround compressed from **45 days** (postal mail) to **1.5 days** (CBS query) — **96.6% reduction** *(SIMULATED, n=140)* [12].
- **100% Discrepancy Intercept:** Caught 19 regulatory defects at intake, including IFSC prefix conflicts and cross-institutional duplicate collisions *(SIMULATED, n=140)*.
- **Zero Premature Discharges:** Automated hard release gate blocked 3 high-risk encashments with unverified liens *(SIMULATED, n=140)* [3].
- **Administrative Labor Savings:** **1,120 person-hours saved** across 140 deposits, freeing regulatory officers for substantive academic inspections *(SIMULATED)*.
- **Audit Integrity:** **100% cryptographic ledger consistency** verified across all SHA-256 blocks with zero retroactive tampering [10].
- **Sustainability:** Completely paperless deposit tracking eliminating courier logistics, physical notarized files, and physical paper degradation.

> **Visual Asset for Slide 5:**  
> Place screenshot: `docs/screenshots/audit/metrics-desktop-1440.png` (Simulated operational benchmarks table).

---

## Slide 6: Research Foundations & Future Potential

- **Sourced in Regulatory Norms:** Derived from AICTE APH [1], RBI Deposit Directions [4], GFR 2017 [6], DPDP Act 2023 [7], GIGW 3.0 [8], and CERT-In [9].
- **13 Verified Primary Citations:** Every rule, threshold, and audit mechanism is anchored in official government and central bank gazettes.
- **Potential for Further Work (Production Roadmap):**
  1. Direct integration with NeSL e-BG repository and public sector Core Banking APIs.
  2. Single Sign-On (SSO) integration with AICTE National Portal and MeriPehchaan (Jan Parichay).
  3. Proactive automated WhatsApp / SMS renewal reminder alerts to college trustees.
  4. Real document forensics module for PDF metadata font layer verification [13].
  5. Multi-language regional translation covering 12 official Indian vernacular languages.

> **Visual Asset for Slide 6:**  
> Place diagram: `docs/diagrams/lifecycle-state-machine.png` (FDR lifecycle state machine).

