# SureLayer Signature V4 Audit

Date: 2026-09-11  
Audited surfaces: `https://surelayer.bydx.fun`  
Runtime contract: public deployment value from the existing runtime configuration  
Network: GenLayer Studionet · chain 61999

## Position

V3 is a credible, production-quality foundation. It has a warm paper/ink
palette, a clear editorial voice, truthful finality language, a custom mark,
and route-specific compositions. The product already reads as a serious
protocol rather than a generic dashboard.

The V4 opportunity is not another layer of decoration. It is to make the
relationships between claim, bond, evidence, convergence, verdict, and
settlement feel authored as one visual system. Today those ideas are explained
well, but they do not yet leave a strong enough visual imprint after the first
visit.

## Route audit

### `/` — editorial landing

Strengths:

- The hero explains the product in one viewport and avoids fake traction.
- The dark assurance instrument is a useful proprietary starting point.
- The long-form copy is precise about consensus, evidence, and finality.

Remaining weaknesses:

- The hero is still recognisable as a headline-plus-panel composition; the
  protocol object feels adjacent to the story instead of carrying it.
- The instrument traces are visually attractive but mostly static. They do not
  establish a memorable convergence rhythm or a clear relationship to the
  later story section.
- Several landing sections use the same heading-plus-grid grammar. The page
  reads as a stack of good sections rather than one deliberate narrative.
- The outcome and security sections are informative but visually quieter than
  their economic importance.

V4 opportunity: make convergence the recurring punctuation mark, use the hero
as a protocol scene, and vary the rhythm between quiet editorial passages,
ledger lines, and one dark consensus field.

### `/claims` — protocol ledger

Strengths:

- The page correctly frames rows as finalized chain state.
- The index uses a restrained ledger treatment and keeps statements readable.
- The empty/error language is honest and deployment-aware.

Remaining weaknesses:

- The current rows still read like polished cards rather than a distinctive
  protocol register.
- Secondary information is visually subordinate to the point that evidence,
  challenge, and update context disappear in a populated list.
- The loading state is structurally correct but not yet a branded reading
  state.

V4 opportunity: turn the list into a true assurance register with ruled rows,
  stronger numeric alignment, a clear state rail, and a compact trace mark per
  record.

### `/claims/1` — assurance record

Strengths:

- The page has the right “digital warranty record” direction.
- State, economic position, evidence, resolution, and timeline are all
  present without hiding protocol uncertainty.
- The verdict panel already separates recorded outcome from pending state.

Remaining weaknesses:

- The record still relies on boxed blocks at the moments where typography and
  rules could create more authority.
- Verdict treatment is good but not yet a signature reveal or a calm permanent
  decision frame.
- Timeline and economic position are useful but not visually connected to the
  same convergence/settlement language as the landing.

V4 opportunity: establish a certificate-like header, an assurance mark that
  resolves with the verdict, and a protocol trace that carries from evidence to
  settlement.

### `/create` — issuance workstation

Strengths:

- The form keeps transaction truth visible and preserves the fixed post-success
  cleanup protection.
- The live preview is already a useful bridge between form input and economic
  commitment.
- Preflight language clearly distinguishes submission from finality.

Remaining weaknesses:

- The form still feels like a traditional form placed beside a summary rather
  than an issuance instrument.
- The preview appears as a separate dark card and could better mirror the
  structure being authored.
- Input groups have limited visual rhythm between “define”, “bond”, and
  “finalize”.

V4 opportunity: treat the form as a precise issuance desk, with a live paper
  record that updates in place and makes the bond/evidence/window hierarchy
  unmistakable before signing.

### `/account` — settlement ledger

Strengths:

- The disconnected wallet boundary is clear and appropriately non-custodial.
- Available credit is given appropriate typographic weight.
- Empty credit is truthful rather than padded with fake activity.

Remaining weaknesses:

- The two-column balance/action composition is still close to a familiar SaaS
  dashboard split.
- The account does not yet feel like the final page of the same protocol trace.
- The zero state could use a more intentional assurance/ledger mark without
  inventing activity.

V4 opportunity: make the page a settlement ledger with one dominant value,
  compact wallet metadata, and a deliberate withdrawal boundary.

## Locked V4 art direction

**Visual world:** the Convergence Ledger — an institutional assurance record
  rendered with editorial typography and precise kinetic line work.

**Primary motif:** convergence. Independent ruled traces enter a decision
  plane and settle into a single assurance imprint. This represents the
  protocol relationship without claiming to show live validator telemetry.

**Supporting motif:** ledger / assurance marks. Small registration marks,
  ruled rails, and imprint geometry identify economic state and carry continuity
  between landing, records, forms, and account surfaces.

The palette remains warm and restrained: paper and bone canvas, graphite and
near-black protocol fields, mineral grey structure, and rare brass for
assurance. Semantic verdict colours remain calm and legible. No neon, purple
AI gradients, glassmorphism, stock imagery, or decorative blockchain motifs.

## V4 system goals

- Give the first viewport a signature protocol scene rather than a generic
  hero panel.
- Make the landing narrative feel composed through changes in density and
  surface, not a repeated card grid.
- Give claims, claim detail, create, challenge, and account distinct layouts
  while sharing the same mark, ruled geometry, and type system.
- Use motion to communicate state: traces converge, bonds register, and final
  outcomes settle. No fake validator telemetry or progress percentages.
- Keep all existing runtime configuration, wallet, finality, persistence,
  error, and contract behavior untouched.

## Motion direction

Motion will use native CSS/SVG and the existing stack. Foreground marks move
  quickly; structural traces resolve more slowly; background geometry remains
  nearly still. Route entry, trace drawing, hover focus, pending states, and
  verdict reveal use a small shared timing vocabulary. Reduced-motion users see
  the complete state immediately with non-essential movement removed.

## Rollout and risk controls

1. Capture production V3 screenshots at the required widths before any source
   edit.
2. Add the smallest token/motif layer and refine existing components rather
   than introduce a new visual dependency.
3. Refine landing composition, then bring the assurance register language to
   application surfaces.
4. Run TypeScript, existing contract regression tests, E2E/Playwright, build,
   dependency audit, and production Chromium checks.
5. Compare V4 screenshots against this baseline and perform a subtraction pass
   before deployment.

The contract source, deployed address, runtime `.env` architecture, GenLayer
write routing, and transaction semantics are out of scope and must remain
unchanged.

## Baseline evidence

Production screenshots captured before V4 edits:

- `.playwright-cli/v4-before-home-1600.png`, `-1440.png`, `-1280.png`,
  `-393.png`, `-320.png`
- `.playwright-cli/v4-before-claims-1600.png`, `-1440.png`, `-1280.png`,
  `-393.png`, `-320.png`
- `.playwright-cli/v4-before-detail-1600.png`, `-1440.png`, `-1280.png`,
  `-393.png`, `-320.png`
- `.playwright-cli/v4-before-create-1600.png`, `-1440.png`, `-1280.png`,
  `-393.png`, `-320.png`
- `.playwright-cli/v4-before-account-1600.png`, `-1440.png`, `-1280.png`,
  `-393.png`, `-320.png`

The evidence directory is local QA output and remains ignored; the durable
comparison will be summarized in `docs/V4_VISUAL_COMPARISON.md`.
