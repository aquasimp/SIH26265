const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const diagrams = [
  {
    name: 'architecture-diagram.png',
    code: `
flowchart TD
    subgraph Client ["Client Presentation Layer (Next.js 14 App Router / Tailwind CSS)"]
        UI_Head["Header: Role Switcher (5 Roles), Search (Cmd+K), Language (EN / HI)"]
        UI_Dash["Treasury Command Console: Real-Time KPIs, Glass Folders, 12-Mo Maturity Ladder"]
        UI_Repo["Central Repository: Multi-Facet Filters, Validity Gauges, Provenance Badges"]
        UI_Intake["OCR-Assisted Intake: Laser Scanner Sweep, Field Confidence, Bounding Boxes"]
        UI_Release["Release Governance Board: Multi-Tier Discharge Queue & Hard Gate Block"]
        UI_Audit["Cryptographic Audit Trail: SHA-256 Block Explorer & Chain Verifier"]
    end

    subgraph API ["REST API Layer (Route Handlers / Zod Strong Schemas)"]
        API_Fdr["/api/fdrs (CRUD, Validation, Filters)"]
        API_Verify["/api/fdrs/[id]/verify (Core Banking Verification)"]
        API_Release["/api/fdrs/[id]/release (3-Stage Gated Release)"]
        API_Ocr["/api/ocr-extract (Region Mapping & Confidence)"]
        API_Audit["/api/audit-trail (Block Integrity Validator)"]
        API_Settings["/api/settings (Regulatory Governance Thresholds)"]
    end

    subgraph Rules ["Pure Deterministic Rules Engines (Zero Black-Box AI)"]
        Rule_Discrepancy["Discrepancy Engine (8 Regulatory Rules: IFSC, Collision, Temporal, etc.)"]
        Rule_Attention["Attention Score Calculator (100-pt Weighted Transparent Formula)"]
        Rule_Escalation["Escalation Scheduler (Scrutiny: 5d -> RO: 10d -> Bureau Head: 15d)"]
        Rule_HardGate["Hard Release Gate (Inviolable Block on Any Open Discrepancy)"]
    end

    subgraph Services ["Service Adapters & Cryptography"]
        Adapter_MockCBS["Mock Core Banking (CBS) Gateway (Explicit MOCK, Latency Sim)"]
        Adapter_HashChain["SHA-256 Block Chaining Engine (Linear Tamper-Evident Ledger)"]
        Adapter_RBAC["Server-Side RBAC Enforcement Guard (Role x Privilege Matrix)"]
    end

    subgraph Storage ["Persistence Layer (Dual-Engine Architecture)"]
        Store_Memory["Deterministic Seed Store (60 Institutions, 140 FDRs, Fixed Seed)"]
        Store_Prisma["SQLite Engine via Prisma / better-sqlite3"]
    end

    UI_Head --> API_Fdr
    UI_Dash --> API_Fdr
    UI_Repo --> API_Fdr
    UI_Intake --> API_Ocr
    UI_Release --> API_Release
    UI_Audit --> API_Audit

    API_Fdr --> Adapter_RBAC
    API_Verify --> Adapter_RBAC
    API_Release --> Adapter_RBAC

    API_Fdr --> Rule_Discrepancy
    API_Fdr --> Rule_Attention
    API_Verify --> Adapter_MockCBS
    API_Verify --> Rule_Discrepancy
    API_Release --> Rule_HardGate

    Rule_Discrepancy --> Adapter_HashChain
    Rule_HardGate --> Adapter_HashChain
    API_Release --> Adapter_HashChain
    API_Fdr --> Adapter_HashChain

    Adapter_HashChain --> Store_Memory
    Rule_Discrepancy --> Store_Memory
    Rule_Attention --> Store_Memory
    Store_Memory <--> Store_Prisma
    `
  },
  {
    name: 'data-flow-diagram.png',
    code: `
flowchart LR
    A["1. Institution Uploads FDR Scan"] --> B["2. OCR Pre-parsing & Confidence Heatmap"]
    B --> C["3. Officer Scrutiny & Ledger Commit"]
    C --> D["4. Core Banking System (CBS) Query (MOCK)"]
    D --> E{"5. CBS Dual-Source Provenance Match?"}
    E -- Match --> F["Status: ACTIVE / Pledged"]
    E -- Mismatch / Unpledged --> G["Flag Discrepancy & Status: DEFICIENT"]
    G --> H["Dynamic Attention Scoring & Triage"]
    F --> H
    H --> I{"6. Maturity Horizon Check"}
    I -- Within 90/60/30/15/7d --> J["Issue Statutory Expiry Alerts"]
    I -- Expired / Lapsed --> K["Escalate to RO / Bureau Head"]
    J --> L["7. Institution Renewal or Release Filing"]
    K --> L
    L --> M{"8. Hard Release Gate Check"}
    M -- Open Flags > 0 --> N["RELEASE BLOCKED (HTTP 422)"]
    M -- All Flags Resolved --> O["RO Endorsement -> Bureau Head Sanction"]
    O --> P["9. SHA-256 Cryptographic Block Sealed"]
    N --> P
    G --> P
    C --> P
    `
  },
  {
    name: 'lifecycle-state-machine.png',
    code: `
stateDiagram-v2
    [*] --> DRAFT: Institution Prepares Filing
    DRAFT --> SUBMITTED: OCR Extraction & Document Upload
    SUBMITTED --> PENDING_VERIFICATION: Initial Scrutiny Queue
    PENDING_VERIFICATION --> ACTIVE: CBS Confirmed & Lien Verified
    PENDING_VERIFICATION --> DEFICIENT: Discrepancy Flagged (IFSC / Amount / Lien)
    DEFICIENT --> ACTIVE: Discrepancy Overridden / Resolved by Officer
    ACTIVE --> EXPIRING: Horizon <= 90 Days
    EXPIRING --> MATURED: Maturity Date Reached
    EXPIRING --> RENEWAL_SUBMITTED: Replacement Certificate Filed
    MATURED --> RENEWAL_SUBMITTED: Overdue Renewal Filed
    MATURED --> RELEASE_REQUESTED: Lock-in Completed & Refund Claimed
    RENEWAL_SUBMITTED --> RENEWED: Verified & Linked to Old Instrument
    RENEWED --> ACTIVE: New Cycle Active
    RELEASE_REQUESTED --> RELEASE_RECOMMENDED: RO Scrutiny & Inspection Clear
    RELEASE_RECOMMENDED --> RELEASED: Bureau Head Final Sanction Order
    RELEASED --> [*]: Closed & Archived
    `
  },
  {
    name: 'release-gate-flow.png',
    code: `
flowchart TD
    Req["Phase 1: Institution Request (INSTITUTION_USER)<br/>Submits Release Affidavit & Justification"] --> Check1{"Discrepancy Check"}
    Check1 -- Open Discrepancy > 0 --> Block1["BLOCKED (HTTP 422)<br/>Action Disabled with Tooltip"]
    Check1 -- 0 Open Discrepancies --> RO["Phase 2: Regional Office Scrutiny (REGIONAL_OFFICER)<br/>Physical Site Clearance & Student Due Review"]
    
    RO --> Check2{"Discrepancy Check"}
    Check2 -- Open Discrepancy > 0 --> Block2["BLOCKED (HTTP 422)<br/>Recommendation Inadmissible"]
    Check2 -- 0 Open Discrepancies --> RO_Rec["RO Endorsement Issued<br/>Forwarded to Regulation Bureau HQ"]

    RO_Rec --> Check3{"Discrepancy Check"}
    Check3 -- Open Discrepancy > 0 --> Block3["BLOCKED (HTTP 422)<br/>Sanction Withheld"]
    Check3 -- 0 Open Discrepancies --> BH["Phase 3: Final Sanction (BUREAU_HEAD)<br/>Sole Authority under AICTE Financial Powers"]
    
    BH --> Sanction["Official AICTE Sanction Order Emitted<br/>Status: RELEASED | Audit Block Appended"]
    `
  }
];

async function generateDiagrams() {
  console.log('Launching browser to render diagrams...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const outDir = path.join(__dirname, '../docs/diagrams');
  fs.mkdirSync(outDir, { recursive: true });

  for (const diag of diagrams) {
    console.log('Rendering', diag.name, '...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 2 });

    const html = '<!DOCTYPE html>' +
      '<html><head><meta charset="utf-8">' +
      '<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>' +
      '<style>' +
      'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #ffffff; margin: 0; padding: 30px; display: flex; justify-content: center; align-items: center; }' +
      '.mermaid { background: #faf8f5; padding: 24px; border: 1px solid #e0ddd5; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }' +
      '</style></head><body>' +
      '<div class="mermaid">' +
      diag.code +
      '</div>' +
      '<script>mermaid.initialize({ startOnLoad: true, theme: "neutral" });</script>' +
      '</body></html>';

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1500));

    const element = await page.$('.mermaid');
    if (element) {
      await element.screenshot({ path: path.join(outDir, diag.name) });
      console.log('Saved', diag.name);
    } else {
      console.error('Could not find .mermaid element for', diag.name);
    }
    await page.close();
  }

  await browser.close();
  console.log('All diagrams generated successfully.');
}

generateDiagrams().catch(console.error);
