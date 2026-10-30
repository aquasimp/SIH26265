# DECISIONS.md: Architectural & Product Decision Record

This document records key design, technical, and domain decisions made autonomously during the engineering of the **AICTE Security Deposit / FDR Portal Prototype (SIH26265)**.

---

## ADR-01: Dual Repository Layer (SQLite via Prisma + Deterministic In-Memory Fallback)
- **Context**: The app must be fully deployable locally (fast, inspectable SQLite database) and deployable on serverless environments (e.g. Vercel) where SQLite write access may be restricted.
- **Decision**: Implement a repository pattern (`src/lib/store/db.ts`). When running in a standard Node environment with SQLite available, Prisma/better-sqlite3 is utilized. When running in a serverless environment or when SQLite file writing is disallowed, it automatically falls back to an in-memory mutable store initialized with the exact same deterministic seed dataset.
- **Consequence**: Zero deploy-time surprises; tests and browser demos work immediately with `npm run dev`.

---

## ADR-02: Deterministic Synthetic Dataset (Fixed Seed, 60 Institutions, 140 FDRs)
- **Context**: The problem statement requires realistic data spanning varied banks, regions, and edge cases, but forbids using real college names or claiming real live bank credentials.
- **Decision**: Create a deterministic pseudorandom seed script (`src/lib/store/seedData.ts`) generating 60 fictional technical institutions (e.g., "Aryavarta Institute of Technology", "Sahyadri College of Engineering & Research") across 8 AICTE regions (Northern, Western, Southern, Eastern, South-Western, Central, North-Western, North-Eastern). Generate 140 FDRs across Indian banks (SBI, PNB, Canara, Bank of Baroda, Union Bank, HDFC, ICICI, Axis).
- **Edge cases covered**:
  - FDRs expiring in < 7 days and < 30 days.
  - Already matured instruments awaiting renewal.
  - Duplicate FDR numbers pledged by two distinct institutions.
  - State Bank of India record paired with an HDFC IFSC code (`HDFC0001234`).
  - Active release request blocked by an unresolved lien or discrepancy flag.
  - Overdue renewal pending for > 60 days.
- **Labeling**: Prominently marked as **SYNTHETIC DATA** in the UI footer and navigation banner.

---

## ADR-03: Provenance-First Field Verification Architecture
- **Context**: Government audit workflows must distinguish what an applicant claimed from what a trusted external authority (the bank) confirmed.
- **Decision**: Every critical financial field (`fdrNumber`, `bankName`, `branchName`, `ifscCode`, `amount`, `maturityDate`, `lienMarked`) carries a dual-state provenance model:
  1. `institutionDeclared`: Parsed from OCR or entered by institution.
  2. `bankConfirmed`: Retrieved from the Core Banking Solution (CBS) API or verification response.
- **Labeling**: Clearly labeled `MOCK CBS VERIFICATION SERVICE` in both the UI and backend code.

---

## ADR-04: Transparent Attention Score Formula (No Black-Box AI)
- **Context**: Officers need a triage mechanism to prioritize urgent instruments without relying on non-auditable or opaque "AI" scores.
- **Decision**: Implement an explicit, transparent 100-point Attention Score formula:
  $$\text{Score} = w_{\text{maturity}} + w_{\text{discrepancies}} + w_{\text{verification}} + w_{\text{renewal}}$$
  - **Maturity Urgency** (0 to 40 pts): Overdue = 40; $\le 7$ days = 35; $\le 30$ days = 25; $\le 90$ days = 15; $> 90$ days = 0.
  - **Discrepancy Severity** (0 to 30 pts): Any Critical unaddressed flag = 30; High = 20; Advisory = 10; None = 0.
  - **Verification Status** (0 to 20 pts): Mismatch / Failed = 20; Pending / Unverified = 15; Bank Confirmed = 0.
  - **Renewal / Overdue Status** (0 to 10 pts): Overdue renewal = 10; On schedule = 0.
- **UX**: Clicking the attention score badge opens a mathematical breakdown modal displaying the formula and exact point weights for that instrument.

---

## ADR-05: Hard Release Gate on Open Discrepancies
- **Context**: Regulatory integrity requires that no security deposit be refunded or discharged while any compliance flag, audit observation, or verification failure is open.
- **Decision**: Enforce an inviolable gate at both the API level and UI level. In `/api/fdrs/[id]/release`, if any discrepancy has `resolved === false`, the release action returns HTTP 422 with a descriptive error payload. In the UI, the "Authorize Release" button is disabled and displays an explanatory tooltip.

---

## ADR-06: Cryptographic Tamper-Evident Audit Trail (SHA-256 Hash Chaining)
- **Context**: Financial regulatory records must demonstrate that audit logs have not been manipulated or deleted retroactively.
- **Decision**: Implement a linear blockchain-style hash chain for audit events. Each event calculates:
  $$\text{currentHash} = \text{SHA256}(\text{prevHash} + \text{timestamp} + \text{entityId} + \text{action} + \text{actorId} + \text{payload})$$
  The UI includes an audit chain verification validator that walks the chain and highlights any cryptographic breaks.

---

## ADR-07: Design System — Treasury Terminal & Indian Typography
- **Context**: The portal must avoid generic "SaaS marketing slop" (purple gradients, rounded-2xl cards, floating blobs, emoji icons, empty hero cards).
- **Decision**:
  - Palette: Warm paper background (`#F9F8F6` light / `#121316` dark), deep ink text (`#1C1D21` / `#EDEDEE`), muted border rules (`#E2E0D8` / `#282A30`), and a sovereign burnt saffron accent (`#C25E00`) with bottle green (`#1B5E20`) for verified statuses.
  - Typography: Editorial serif / condensed grotesk for titles (`Fraunces` or `Cinzel` / `Outfit`), high-legibility sans for UI (`Inter`), and tabular monospace (`JetBrains Mono`) for all amounts, IFSC codes, dates, and ref numbers.
  - Digit Grouping: Standard Indian numbering format (`12,50,000` instead of `1,250,000`).
  - Dates: Standard Indian institutional format `DD MMM YYYY` (e.g., `15 Oct 2026`).

---

## ADR-08: OCR-Assisted Intake Architecture
- **Context**: Manual typing of FDR details is prone to clerical errors and takes days. We need demo-ready real OCR extraction with visual region mapping.
- **Decision**: Provide client-side and API-based OCR parsing with pre-calibrated sample FDR templates for demo scenarios. Display an animated laser scanning sweep over the document, draw bounding boxes around detected regions, display confidence percentages per field, and mandate human confirmation before submission.

