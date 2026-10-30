# RESEARCH.md: Regulatory Foundations & Indian Banking Verification Norms

**Problem Statement:** SIH26265 — Streamline of Security Deposit / FDR Portal  
**Target Bureau:** All India Council for Technical Education (AICTE), Regulation Bureau  
**Scope:** Regulatory policies, banking workflows, fraud typologies, and comparative government deposit architectures.

---

## 1. AICTE Approval Process Handbook (APH) Framework

### 1.1 Mandatory Submission & Purpose
- **Context & Requirement**: In accordance with the AICTE Approval Process Handbook (e.g., Chapter I & II norms), any Trust, Society, or Section 8 Company applying for the establishment of a new technical institution, new programs, or extension of approval must deposit a Security Deposit / Corpus Fund in the form of a Fixed Deposit Receipt (FDR) or approved electronic mode.  
  *Status:* **VERIFIED** — [AICTE Approval Process Handbook, sistecgn.ac.in](https://sistecgn.ac.in) / [aicte.gov.in](https://aicte.gov.in).
- **Amount Slabs**: The statutory deposit varies strictly by discipline, level (Diploma, UG, PG), and institutional classification (e.g., General vs. Special Category: Women, Minority, North Eastern States, PwD). Typical amounts historically range from ₹15,00,000 to ₹50,00,000+ per approved technical department.  
  *Status:* **VERIFIED** — [AICTE APH Schedule of Norms](https://aicte.gov.in). Configurable in portal system settings.
- **Tenure & Lock-in**: Security deposits are typically placed for a fixed block period of **8 to 10 years** (traditionally 10 years for standalone new colleges, or program lifecycle).  
  *Status:* **VERIFIED** — [tnkpsc.com / AICTE Regulations](https://tnkpsc.com).

### 1.2 Joint Holding & Lien Pledge
- **Joint Account Mandate**: The FDR is explicitly required to be created in the **joint name** of the Chairman/Secretary of the Trust/Society and the **Regional Officer, AICTE** (e.g., "Secretary, XYZ Trust AND Regional Officer, AICTE Western Regional Office").  
  *Status:* **VERIFIED** — [AICTE APH Chapter I & Regulations](https://tnkpsc.com).
- **Lien Marking**: The issuing bank must formally endorse a **Lien in favour of Regional Officer, AICTE** in their Core Banking Solution (CBS), preventing any premature withdrawal, loan against deposit, or encashment without written NOC from AICTE.  
  *Status:* **VERIFIED** — Standard public sector banking guidelines & AICTE Letter of Approval preconditions.

### 1.3 Release, Discharge & Forfeiture Preconditions
- **Conditions for Refund/Release**: Release of the deposit after tenure completion requires:
  1. Completion of mandated lock-in period (e.g. 10 years).
  2. Functioning of the institution from its approved permanent site.
  3. No pending grievances, vigilance complaints, court orders, or unpaid student/faculty dues.
  4. Submission of prescribed Affidavits, original deposit receipt/surrender certificate, and regional inspection clearance.  
  *Status:* **VERIFIED** — [AICTE Circulars on Release of FDRs, aicte.gov.in](https://aicte.gov.in).
- **Approval Authority**: Only the **Competent Authority** (Head of Regulation Bureau / Member Secretary, AICTE) is authorized to execute the final discharge order. Regional Officers provide scrutiny and recommendation only.  
  *Status:* **VERIFIED** — AICTE delegation of financial powers.

---

## 2. Indian Banking FDR Verification in Practice

### 2.1 Deposit Anatomy & IFSC Validation
- **Deposit Fields**: An authentic FDR comprises: (1) FDR / Deposit Receipt Number, (2) Customer Information File (CIF) / Account Number, (3) Issuing Bank & Branch, (4) IFSC Code, (5) Date of Issue, (6) Maturity Date, (7) Principal Amount (Rupees), (8) Cumulative / Quarterly Interest Option, (9) Depositor Names, (10) Joint Holder / Beneficiary Lien Flag.
- **IFSC Architecture**: An Indian Financial System Code (IFSC) is an 11-character alphanumeric code:
  - First 4 characters: Bank code (e.g., `SBIN` = State Bank of India, `PUNB` = Punjab National Bank, `HDFC` = HDFC Bank).
  - 5th character: Always `0` (reserved for future use).
  - Last 6 characters: Specific branch identifier.  
  *Status:* **VERIFIED** — Reserve Bank of India (RBI) IFSC Directory. A receipt citing "State Bank of India" with an IFSC beginning with `HDFC` is an immediate deterministic discrepancy.

### 2.2 Lien Confirmation & Bank Communication Channels
- **Bank Confirmation Letter**: Banks issue a formal *Lien Confirmation Letter* on official stationery, bearing serial reference number, CBS deposit reference, lien amount, beneficiary name ("Regional Officer, AICTE"), authorized officer signature, and employee code.  
  *Status:* **VERIFIED** — [Indian Commodity & Clearing Exchanges Lien Guidelines / Bank Formats](https://icexindia.com).
- **Verification Routes**:
  - *Current Reality*: Manual physical letters or email confirmations between Regional Offices and Branch Managers, leading to 30–90 day verification lags.
  - *SFMS / e-PBG / e-FDR Parallels*: Structured Financial Messaging System (SFMS) messages (e.g. MT760 / MT767) used in Government e-Marketplace (GeM) and CPPP allow direct bank-to-treasury electronic confirmation.  
  *Status:* **ASSUMPTION / DESIGN TARGET** — The prototype models a modern CBS API integration (clearly labeled `MOCK`) with fallback to Scrutiny Officer manual verification.

---

## 3. Public Deposit Tracking UX & Workflow Benchmarks

### 3.1 Government e-Marketplace (GeM) e-PBG Module
- **Workflow**: Automated intake via bank SFMS -> Real-time status dashboard -> Automated expiry alerts (at 90, 60, 30 days) -> Hard block against tender finalization or contract closure if guarantee is deficient or expired.
- **Key UX Takeaway**: Provenance tracking (Buyer View vs. Bank Broadcast View) and clear indicators of bank confirmation status.

### 3.2 Public Financial Management System (PFMS)
- **Workflow**: Dual-signatory workflow (Maker-Checker-Approver), immutable transaction logs, strict validation against central bank IFSC databases, and proactive exception queues.
- **Key UX Takeaway**: Dense tabular financial ledgers, audit trail with hash-sealed event logs, and role-segregated authorization gates.

---

## 4. Common FDR Fraud & Discrepancy Typologies

| Typology Code | Typology Description | Real-World Precedent / Risk | Detection Mechanism in Portal |
|---|---|---|---|
| `FD-01` | **Forged Physical FDR Receipt** | High-profile CBI probes into counterfeit municipal/contractor deposit certificates ([CBI cases, Indian Kanoon](https://indiankanoon.org)). | Mock Bank CBS cross-reference; check against verified bank database. |
| `FD-02` | **Tampered Maturity / Short Lock-in** | Institution deposits 1-year renewable deposit rather than mandated 10-year cumulative deposit. | Strict formula: `Maturity Date - Issue Date >= Mandated Tenure Months` (e.g. 120 months). |
| `FD-03` | **Amount / Currency Discrepancy** | Declared requirement is ₹35,00,000, but paper receipt is for ₹3,50,000 (missing zero). | Zod validation & automated delta check: `|Declared - Actual| == 0`. |
| `FD-04` | **Bank Name vs. IFSC Mismatch** | Form lists "State Bank of India" but IFSC is `CBIN0280123` or fake code. | Deterministic prefix check against RBI IFSC master table. |
| `FD-05` | **Duplicate FDR Re-use** | Same physical FDR pledged to AICTE and also pledged to State Technical University or local body. | Cross-institution duplicate check on `Bank + FDR Number` across entire national repository. |
| `FD-06` | **Lien Not Marked in CBS** | Deposit opened solely in Trust name without joint holding or lien lock; Trust pre-closes deposit secretly. | Bank confirmation payload explicitly requires `lien_marked == true` and beneficiary match. |
| `FD-07` | **Maturity Before Issue Date** | Inverted dates or typographical error in intake. | Temporal validation: `maturityDate > issueDate`. |
| `FD-08` | **Suspicious Document Metadata** | PDF digital creation date predates the physical instrument issue date or contains suspicious editing software tags. | Advisory flag highlighting file metadata anomalies for human scrutiny. |

---

## 5. Architectural Parameters: Verified vs. Configurable Assumptions

- **VERIFIED Statutory Norms**:
  - Deposit must be jointly held with AICTE Regional Officer.
  - Release can only be sanctioned by Bureau Head / Competent Authority.
  - No release while complaints or discrepancies remain unresolved.
- **CONFIGURABLE Operational Assumptions (Stored in System Settings)**:
  - Expiry alert schedule: Default intervals at **90, 60, 30, 15, and 7 days** prior to maturity.
  - Escalation idle window: Scrutiny Officer (5 days) -> Regional Officer (10 days) -> Bureau Head (15 days).
  - Attention Score weights: Days to maturity (40%), Open discrepancy severity (30%), Verification status (20%), Overdue renewal status (10%).
  - Mandatory minimum deposit tenure: Default **120 months (10 years)** for new institutions, editable per institution category.
