# AICTE Central Treasury FDR Portal — Bug Audit & Resolution Report

This document records the comprehensive QA audit, root-cause analyses, visual verifications, and architectural fixes executed across the entire application under branch `fix/ui-qa-responsive`.

---

## Summary Matrix

| Bug ID | Screen | Viewport | Severity | Summary | Status |
|---|---|---|---|---|---|
| **BUG-001** | Dashboard Queue | All (320px–1440px) | High | Validity ring text overflow for horizons > 365 days (`2679d` collision) | **FIXED** |
| **BUG-002** | Dashboard Queue | All (320px–1440px) | Medium | Expired state ring too faint; "MAT / EXPIRED" text illegible (<11px) | **FIXED** |
| **BUG-003** | Dashboard Queue | All (320px–1440px) | High | Duplicate identical rows for `FDR-2024-COLLISION-991` without institutional attribution | **FIXED** |
| **BUG-004** | Dashboard Queue & Repo | All (320px–1440px) | Medium | Severity colors inconsistent across score badge, discrepancy chip, and ring | **FIXED** |
| **BUG-005** | Dashboard Queue | All (320px–1440px) | Low | Clean / Verified rows scored (e.g. 36 MODERATE) without explainability popover | **FIXED** |
| **BUG-006** | Dashboard Queue | All (320px–1440px) | Medium | Table sorting scrambled & "Showing Top 10" label hardcoded | **FIXED** |
| **BUG-007** | Global Date Utility | All | Medium | Date calculation prone to timezone offset shifts and day-boundary errors | **FIXED** |
| **BUG-008** | Dashboard, Repo, Release, Desk | Mobile (320px–768px) | High | Wide data tables causing horizontal page scroll on mobile | **FIXED** |
| **BUG-009** | Header Navigation | Mobile (320px–640px) | High | Header elements overflowing horizontally; missing responsive collapse | **FIXED** |
| **BUG-010** | Global Layout | Mobile (320px–768px) | Medium | Missing mobile navigation drawer and bottom action bar | **FIXED** |
| **BUG-011** | Intake / Form Inputs | Mobile (iOS) | Medium | Inputs below 16px font-size triggering involuntary iOS mobile zoom | **FIXED** |
| **BUG-012** | Global Modals / Dialogs | Mobile (320px–414px) | Medium | Modals overflowing screen boundaries on small mobile viewports | **FIXED** |
| **BUG-013** | Metrics Page | Mobile (320px–768px) | Medium | Operational benchmark comparative table clipped on mobile screens | **FIXED** |

---

## Detailed Bug Records

### BUG-001: Validity Ring Text Overflow
- **Screen**: Immediate Regulatory Attention Queue (`/` & `/repository`)
- **Viewport**: All viewports (320px to 1440px)
- **Severity**: High (Visual defect & data illegibility)
- **Repro Steps**:
  1. Open Treasury Dashboard on any viewport.
  2. Locate instruments with validity > 365 days (e.g., `2679d`).
  3. Observe the inner SVG ring text colliding with the outer circumference stroke, with "LEFT" cramped below.
- **Root Cause**:
  `CircularValidityRing.tsx` used unconstrained text positioning without proportional coordinate scaling and rendered raw day counts for multi-year instruments without compact unit formatting.
- **Fix Description**:
  - Implemented `formatCompactDuration(days)` in `src/lib/formatters.ts`: durations $\ge 365$ days render human-friendly compact units (e.g. `7y 4m`, `6y 9m`), while durations $< 365$ days render `NNNd`.
  - Added full day count in tooltip (`title`) and `aria-label` for accessibility.
  - Refactored `CircularValidityRing.tsx` to an SVG coordinate space `viewBox="0 0 48 48"` with center-anchored text (`text-anchor="middle"`) and tabular numerals (`font-variant-numeric: tabular-nums`).
- **Before Screenshot**: `media_1793341754939_12b7adfa.jpg`
- **After Screenshot**: `screenshots/table-after.png`, `screenshots/audit/table-after-fixed.png`

---

### BUG-002: Expired State Ring Legibility & AA Contrast
- **Screen**: Immediate Regulatory Attention Queue (`/`)
- **Viewport**: All viewports
- **Severity**: Medium (WCAG AA Accessibility failure)
- **Repro Steps**:
  1. View rows with status `MATURED` / expired instruments (e.g. `FDR-2016-PNB-54109`).
  2. Inspect the validity ring; observe faint grey stroke and micro-text (`< 9px`) for `MAT / EXPIRED`.
- **Root Cause**:
  Ring rendered 0% circumference stroke with faint muted gray styling (`#78716c`), causing poor contrast against paper background. Text size was below minimum legible threshold.
- **Fix Description**:
  - Rendered a full 100% stroke in high-visibility danger color (`var(--status-danger)` / `#dc2626`).
  - Added soft red radial fill tint (`rgba(220, 38, 38, 0.12)`).
  - Styled `MAT` with bold 11px font (weight 800) and `EXPIRED` with 7.5px font (weight 800) in dark red (`#991b1b`), achieving $>7:1$ contrast ratio meeting WCAG AAA.
- **Before Screenshot**: `media_1793341752457_af8407b2.png`
- **After Screenshot**: `screenshots/table-after.png`, `screenshots/audit/table-after-fixed.png`

---

### BUG-003: Duplicate Collision Rows Attribution
- **Screen**: Immediate Regulatory Attention Queue (`/`)
- **Viewport**: All viewports
- **Severity**: High (Misleading duplicate display)
- **Repro Steps**:
  1. Load Dashboard Attention Queue table.
  2. Inspect rows for `FDR-2024-COLLISION-991`.
  3. Observe two identical rows with the same bank, amount, date, and flag back-to-back with no distinguishing metadata, appearing as an accidental double-render.
- **Root Cause**:
  In seed data, the two collision entries were created to simulate a cross-institutional duplicate deposit, but omitted institutional attribution (`institutionName` and `institutionId`), making them appear identical in the UI.
- **Fix Description**:
  - Enhanced `FdrInstrument` type with optional `institutionName`.
  - Updated seed data and DB to explicitly attribute each collision record:
    - Row A: *D.Y. Patil College of Engineering, Pune* (`1-1029384751`)
    - Row B: *Government College of Technology, Coimbatore* (`1-9876543210`)
  - Added collision detection indicator `COLLISION (2 Inst.)` in the UI to clearly explain the cross-institutional link.
  - Added automated unit test suite `tests/fdrDuplicates.test.ts` (4 passing tests) to guarantee collision records have distinct IDs and keys.
- **Before Screenshot**: `media_1793341752457_af8407b2.png`
- **After Screenshot**: `screenshots/table-after.png`, `screenshots/audit/table-after-fixed.png`

---

### BUG-004: Inconsistent Severity Color Mapping
- **Screen**: Dashboard Queue & Repository Table
- **Viewport**: All viewports
- **Severity**: Medium (Visual inconsistency)
- **Repro Steps**:
  1. Inspect row `FDR-2016-PNB-54109` (Score `70 CRITICAL`).
  2. Discrepancy chip displayed a yellow warning badge (`EXPIRED_INSTRUMENT`) while the score badge was red.
  3. Compare with other critical rows displaying red chips.
- **Root Cause**:
  Components independently hardcoded color classes without a single source of truth for severity mapping across score badges, discrepancy chips, and validity rings.
- **Fix Description**:
  - Created `src/lib/severity.ts` defining canonical `SeverityTier` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `OK`) with unified semantic tokens (`bg`, `text`, `border`, `ringColor`).
  - Implemented mapping helpers `mapScoreToSeverity`, `mapFlagSeverityToTier`, and `mapUrgencyToTier`.
  - Applied single severity mapping uniformly across `AttentionQueueTable.tsx`, `CircularValidityRing.tsx`, and `src/app/repository/page.tsx`.
- **Before Screenshot**: `media_1793341752457_af8407b2.png`
- **After Screenshot**: `screenshots/table-after.png`

---

### BUG-005: Score Explainability Tooltip/Popover
- **Screen**: Immediate Regulatory Attention Queue (`/`)
- **Viewport**: All viewports
- **Severity**: Low (UX / regulatory transparency)
- **Repro Steps**:
  1. Inspect row `FDR-2016-SBI-88129` showing status `Clean / Verified` with score `36 MODERATE`.
  2. Users were confused why a "Clean" record possessed an attention score.
- **Root Cause**:
  Attention score is a deterministic composite of 4 factors: Maturity Urgency (40%), Discrepancy Severity (30%), Core Banking Verification (20%), and Renewal State (10%). `FDR-2016-SBI-88129` is expiring in 5 days, driving urgency points despite having no discrepancies.
- **Fix Description**:
  - Implemented interactive, accessible `ScoreFactorBadge` popover component in `AttentionQueueTable.tsx`.
  - Clicking the badge opens a structured breakdown displaying each of the 4 factors, individual point contributions, and exact rationale.
- **Before Screenshot**: `media_1793341752457_af8407b2.png`
- **After Screenshot**: `screenshots/audit/score-popover-1440.png`

---

### BUG-006: Attention Queue Sorting & Count Label Mismatch
- **Screen**: Immediate Regulatory Attention Queue (`/`)
- **Viewport**: All viewports
- **Severity**: Medium (Data correctness)
- **Repro Steps**:
  1. Inspect the order of attention scores in the table: rows with score `60` appeared before `70` and `90`.
  2. Header displayed static text "Showing Top 10" regardless of fetched count.
- **Root Cause**:
  Row sort relied on static `attentionScore` field from seed data, which was out of sync with dynamic `calculateAttentionScore(fdr)`. Header had hardcoded "Showing Top 10".
- **Fix Description**:
  - Dynamically sorted rows by `calculateAttentionScore(fdr).totalScore` descending ($90 \rightarrow 70 \rightarrow 60 \rightarrow 36$).
  - Updated header to render dynamic count: `Showing Top {instruments.length}`.
  - Added skeleton pulse state during async fetch.
- **Before Screenshot**: `media_1793341752457_af8407b2.png`
- **After Screenshot**: `screenshots/audit/table-after-fixed.png`

---

### BUG-007: Shared Date Utility & Timezone Edge Cases
- **Screen**: Global Date Formatter
- **Viewport**: All viewports
- **Severity**: Medium (Temporal calculation drift)
- **Repro Steps**:
  1. Run date comparisons across different client timezones (e.g. UTC vs IST +5:30).
  2. Day boundaries shifted "Matured Nd ago" or "Expiring in Nd" by $\pm 1$ day.
- **Root Cause**:
  `new Date("YYYY-MM-DD")` in JavaScript parses ISO date-only strings as UTC midnight, which in positive timezone offsets like IST produces previous day local time (e.g., 5:30 AM).
- **Fix Description**:
  - Implemented `parseDateParts()` in `src/lib/formatters.ts` parsing year, month, and day integers directly.
  - Used UTC midnight math `Date.UTC(y, m-1, d)` for day-difference calculations.
  - Added unit test suite `tests/formatters.test.ts` (22 tests) covering leap years, month boundaries, and offset immunity.
- **Verification**: 22 unit tests passing cleanly.

---

### BUG-008: Wide Data Tables Causing Mobile Horizontal Overflow
- **Screen**: Dashboard Queue, Repository, Release Workflow, Institution Desk
- **Viewport**: Mobile (< 768px: 320px, 360px, 390px, 414px)
- **Severity**: High (Mobile responsiveness breakage)
- **Repro Steps**:
  1. Open app at 320px or 390px viewport.
  2. Wide tables forced entire viewport `scrollWidth` to $> 700px`, causing horizontal scroll and unreadable clipped cards.
- **Root Cause**:
  Data tables with 6–7 columns lacked container queries or mobile presentation alternatives.
- **Fix Description**:
  - Implemented dual presentation pattern: below 768px (`block md:hidden`), wide tables automatically convert into stacked high-density cards highlighting key facts (FDR number, amount in Indian format, validity ring, attention score, discrepancy chips, and action button).
  - Above 768px (`hidden md:block`), full responsive tables are retained.
  - Verified across all viewports: zero horizontal scroll (`hasOverflow: false`).
- **Screenshots**:
  - `screenshots/mobile-390-queue.png`
  - `screenshots/audit/dashboard-mobile-390.png`
  - `screenshots/audit/repository-mobile-390.png`
  - `screenshots/audit/release-workflow-mobile-390.png`

---

### BUG-009: Header Controls Collapsing & Spacing on Mobile
- **Screen**: Global Navigation Header
- **Viewport**: Mobile (< 640px)
- **Severity**: High (Header layout breaking and overflowing)
- **Repro Steps**:
  1. Load application at 390px or 320px width.
  2. Header elements (role switcher, search bar with keyboard shortcut, EN/HI toggle, status badge) caused `scrollWidth: 432px`.
- **Root Cause**:
  Fixed widths, `min-w-[420px]` search bar, and multiple uncollapsible controls in `Header.tsx`.
- **Fix Description**:
  - Refactored `src/components/layout/Header.tsx`:
    - Responsive search bar: collapses to search icon trigger on mobile, expanding into `CommandPalette` (`⌘K`).
    - Title fluid sizing: `text-sm sm:text-base md:text-lg`.
    - Moved secondary controls into mobile navigation drawer.
    - All touch targets increased to minimum $44 \times 44\text{px}$.
- **Screenshots**: `screenshots/audit/dashboard-mobile-390.png`

---

### BUG-010: Missing Mobile Navigation Drawer and Bottom Bar
- **Screen**: Global App Shell
- **Viewport**: Mobile (320px–768px)
- **Severity**: Medium (Mobile usability)
- **Repro Steps**:
  1. Browse app on mobile viewport.
  2. Sidebar is hidden (`hidden lg:flex`), leaving users with no primary navigation between routes.
- **Root Cause**:
  Application was designed with a desktop sidebar without a mobile navigation equivalent.
- **Fix Description**:
  - Created `src/components/layout/MobileNav.tsx`:
    - Sliding drawer from left with focus trap, backdrop click, Escape key dismiss, and route transition closure.
    - Fixed bottom navigation bar with 5 primary touch actions (Console, Repo, Intake, Release, Menu).
    - Integrated safe-area insets (`padding-bottom: env(safe-area-inset-bottom)`).
- **Screenshots**: `screenshots/audit/mobile-drawer-open-390.png`

---

### BUG-011: iOS Mobile Input Font-Size Auto-Zoom
- **Screen**: OCR Intake, Settings, Search
- **Viewport**: Mobile (iOS WebKit / Safari)
- **Severity**: Medium (Mobile UX degradation)
- **Repro Steps**:
  1. Focus an `<input>` styled with `text-xs` (12px) on iOS Safari.
  2. Browser forcibly zooms the screen into the input, breaking layout until manually zoomed out.
- **Root Cause**:
  iOS Safari requires input font size $\ge 16\text{px}$ to prevent automatic viewport zoom on focus.
- **Fix Description**:
  - Added global mobile rule in `src/app/globals.css`:
    ```css
    @media (max-width: 640px) {
      input, select, textarea {
        font-size: 16px !important;
      }
    }
    ```
  - Configured `viewport` export in `src/app/layout.tsx` with `width: "device-width", initialScale: 1, maximumScale: 5`.

---

### BUG-012: Full-Screen Modal Sheets on Mobile
- **Screen**: Dossier Modal, Attention Score Modal, Command Palette, Demo Walkthrough
- **Viewport**: Mobile (320px–414px)
- **Severity**: Medium (Modal overflow and clipping)
- **Repro Steps**:
  1. Open any modal at 390px viewport.
  2. Modals with fixed padding and centered placement overflowed viewport height and clipped action buttons.
- **Root Cause**:
  Fixed centered modal containers with `vh` units instead of `dvh` and desktop-oriented corner radii.
- **Fix Description**:
  - Converted modals to bottom-anchored mobile sheets on small viewports:
    - Container: `flex items-end sm:items-center p-0 sm:p-4`.
    - Window: `rounded-t-2xl sm:rounded-lg max-h-[92dvh] flex flex-col`.
    - Scrollable bodies with `overflow-y-auto`.
    - Minimum $44 \times 44\text{px}$ touch targets for close and action buttons.
- **Screenshots**: `screenshots/audit/demo-modal-1440.png`, `screenshots/audit/command-palette-1440.png`

---

### BUG-013: Operational Benchmark Table Mobile Adaptation
- **Screen**: Regulatory Metrics & Benchmarks (`/metrics`)
- **Viewport**: Mobile (< 768px)
- **Severity**: Medium (Table horizontal scrolling)
- **Repro Steps**:
  1. Open `/metrics` at 390px or 320px viewport.
  2. Comparative table with 4 columns required awkward horizontal scrolling.
- **Root Cause**:
  Standard HTML `<table>` without card presentation fallback on mobile.
- **Fix Description**:
  - Added responsive stacked card view for mobile (`block md:hidden`), presenting each regulatory stage with traditional vs automated metrics and efficiency gains.
  - Kept full tabular view on tablet/desktop (`hidden md:block`).
- **Screenshots**: `screenshots/audit/metrics-mobile-390.png`, `screenshots/audit/metrics-desktop-1440.png`

---

## Verification Audit Results

### 1. Viewport Horizontal Scroll Crawl
Tested using Puppeteer Chrome across all 12 responsive breakpoints:

| Viewport | Dimensions | Orientation | DPR | Horizontal Overflow | Result |
|---|---|---|---|---|---|
| 320 Mobile | 320 x 568 | Portrait | 2x | None (`scrollWidth === clientWidth`) | **PASS** |
| 320 Mobile | 568 x 320 | Landscape | 2x | None (`scrollWidth === clientWidth`) | **PASS** |
| 360 Android | 360 x 740 | Portrait | 3x | None (`scrollWidth === clientWidth`) | **PASS** |
| 360 Android | 740 x 360 | Landscape | 3x | None (`scrollWidth === clientWidth`) | **PASS** |
| 390 iPhone | 390 x 844 | Portrait | 3x | None (`scrollWidth === clientWidth`) | **PASS** |
| 390 iPhone | 844 x 390 | Landscape | 3x | None (`scrollWidth === clientWidth`) | **PASS** |
| 414 iPhone Plus | 414 x 896 | Portrait | 3x | None (`scrollWidth === clientWidth`) | **PASS** |
| 414 iPhone Plus | 896 x 414 | Landscape | 3x | None (`scrollWidth === clientWidth`) | **PASS** |
| 768 iPad | 768 x 1024 | Portrait | 2x | None (`scrollWidth === clientWidth`) | **PASS** |
| 768 iPad | 1024 x 768 | Landscape | 2x | None (`scrollWidth === clientWidth`) | **PASS** |
| 1024 Tablet | 1024 x 1366 | Portrait | 2x | None (`scrollWidth === clientWidth`) | **PASS** |
| 1440 Desktop | 1440 x 900 | Landscape | 1x | None (`scrollWidth === clientWidth`) | **PASS** |

### 2. Automated Quality Gates
- **Unit Tests**: 45 passed (7 test suites, 0 failures).
- **TypeScript**: 0 errors (`npx tsc --noEmit`).
- **ESLint**: 0 warnings, 0 errors (`npm run lint`).
- **Production Build**: 17 static routes generated successfully (`npm run build`).
- **Console Errors**: 0 console errors logged across all crawled screens and viewports.

