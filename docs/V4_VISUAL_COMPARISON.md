# SureLayer Signature V4 — visual comparison

Date: 2026-09-11  
Baseline: production V3 captures taken before the V4 source edits  
After: local production build with safe, explicitly labelled fixture data for
populated application surfaces

The comparison is visual only. Fixture data was intercepted in Chromium and
never submitted to the chain or bundled into the application. Runtime contract
configuration and protocol logic were not changed.

## Evidence

Baseline captures are listed in [`SIGNATURE_V4_AUDIT.md`](./SIGNATURE_V4_AUDIT.md)
and remain local ignored QA output under `.playwright-cli/`.

After captures are local ignored QA output under `.playwright-cli/`:

- `v4-after-home-{1600x1000,1440x900,1280x900,393x851,320x568}.png`
- `v4-after-claims-{1600x1000,1440x900,1280x900,393x851,320x568}.png`
- `v4-after-detail-{1600x1000,1440x900,1280x900,393x851,320x568}.png`
- `v4-after-create-{1600x1000,1440x900,1280x900,393x851,320x568}.png`
- `v4-after-account-{1600x1000,1440x900,1280x900,393x851,320x568}.png`
- `v4-after-create-preview-filled.png`

Final public spot-checks after the narrow-mobile polish pass:

- `v4-final-home-320x568.png`
- `v4-final-home-393x851.png`
- `v4-final-home-1440x900.png`
- `v4-production-detail-1440-loaded.png`
- `v4-production-detail-393-loaded.png`

## Route comparison

### Home

Before: a strong V3 editorial hero, but the protocol illustration read as a
supporting panel and the lower page repeated a heading-plus-grid rhythm.

After: the first viewport is split into an editorial claim and a dark
Convergence Ledger scene. The four traces, decision plane, bond/evidence labels,
and live-read disclaimer make the protocol idea legible without pretending to
show validator telemetry. The landing now moves through premise, trace,
settlement register, and one dark GenLayer section rather than a uniform stack.

### Claims

Before: polished rows still read like a card grid, with weak column context.

After: the index has a ruled register header, a compact assurance mark per row,
aligned bond/age metadata, and a separate recorded-state rail. Mobile preserves
the record hierarchy while intentionally reflowing the row.

### Claim detail

Before: a clear editorial document beside an economic sidebar, but the verdict
and timeline were visually separate from the protocol path.

After: the page reads as a digital assurance record. The certificate-like
header, state imprint, economic position, and reusable protocol trace connect
bond, evidence, recorded verdict, and settlement while preserving the existing
truthful state copy.

### Create

Before: a well-structured form beside a preflight card, with the live draft
preview below the initial viewport.

After: the form is an issuance workstation with numbered define/bond/finalize
rhythm and a live Draft Instrument preview. The preview mirrors claim,
criteria, bond, challenge bond, evidence count, window, and network as the user
types; it never invents an ID or transaction state.

### Account

Before: an effective disconnected-wallet split, but close to a conventional
dashboard composition.

After: the account is framed as a settlement ledger. The available-credit field
has the dominant typographic weight, the wallet boundary is explicit, and the
dark ledger surface carries the same assurance mark and material language as
the landing.

## V4 conclusion

The material change is not additional decoration. It is a shared visual grammar
— convergence traces and ledger marks — expressed through different page
compositions: editorial landing, protocol index, assurance record, issuance
workstation, and settlement ledger. Motion remains CSS/SVG-only, reduced-motion
users receive complete static information, and no new dependency or live-data
assumption was introduced.

The final 320px pass tightened only the narrow hero rhythm so the primary issue
action is fully visible in the opening viewport; desktop and wider mobile
composition remain unchanged.
