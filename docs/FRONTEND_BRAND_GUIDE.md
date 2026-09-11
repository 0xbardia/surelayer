# SureLayer — assurance instrument

## Identity

The refined mark is an angular S built from layered paths that register around a
shared commitment node. The open geometry suggests evidence becoming one
economic record without implying that the mark guarantees truth. The hero
repeats this assurance-imprint motif as a conceptual protocol instrument, with
the live protocol read kept separate and explicit.

Assets: `/brand/surelayer-logo.svg` (primary pairing),
`/brand/surelayer-mark.svg` (icon), `/icon.svg` (dark app/favicon tile).
The React BrandMark uses the same two paths. Keep at least half a mark of clear
space; use the icon from 24px upward. Navbar is 40px desktop / 32px mobile.
Do not stretch, rotate, add glow, or use the mark as a verdict indicator.
The SVG wordmark uses Arial; the website pairs the mark with its native sans.

## Palette and type

| Token | Value | Purpose |
|---|---|---|
| Ink | #14201b | Primary text, hero, account balance panel |
| Paper | #f0ede3 | Page background |
| Surface | #fcfaf4 | Cards, form surfaces |
| Brass | #b4823f | Rules, borders, decorative geometry |
| Brass dark | #704815 | Accessible accent text on light surfaces |
| Muted | #687068 | Supporting text |
| Moss | #286b5b | Supported/finalized |
| Rust | #a6442a | Breached/errors |

Georgia is the editorial display face. Native system sans handles forms,
navigation and explanatory text; native monospace handles identifiers. No
remote font request or additional font dependency. Body remains 16px, with
13px minimum form help. Long evidence/addresses wrap rather than truncate.
Controls use 6px radius, major surfaces 14px; the hero and ledger panels use
one architectural corner. Spacing follows 8px increments with small optical
adjustments. Brass is an accent and structural signal, never a fill for long
copy.

## Motion

Motion tokens: 120ms micro feedback, 180ms controls, 360ms standard interaction,
520ms section entry, and 760ms emphasis. The hero uses SVG assurance traces,
registration rings, and staged instrument labels; the animation is conceptual
and does not represent live validator telemetry. CSS view-timeline story
reveals are a progressive enhancement with visible fallback. There is no scroll
hijack or animation dependency. Reduced-motion removes non-essential movement
while keeping all protocol information visible.

## Application language

Navigation shows the active route with a brass underline and aria-current.
Claims use a ledger/index treatment with a commitment rule, readable title, ID,
bond and named status. Detail is a digital assurance record beside an economic
position sidebar; evidence remains linked, text-safe and fully readable.
Timeline uses connected points. Create introduces a commitment with a live
draft instrument preview; Challenge presents issuer position versus challenger
commitment without changing wallet or protocol logic. Account balances use an
ink ledger surface and never use invented values.

Signing and consensus pending use a neutral brass pending surface with a
three-node transaction orb. Rejection
and uncertainty retain explicit warnings. Success requires the existing final
receipt check; no visual motion advances protocol state. Status always has text
in addition to color. Transaction hashes wrap and remain visible while pending.

Verdict moments use a restrained record field: SUPPORTED is moss, BREACHED is
rust, and INCONCLUSIVE is slate. None is presented as a reward animation or an
alarm; the economic outcome and evidence summary remain the focus.

## Accessibility and performance

Preserve semantic controls, form labels, visible focus and keyboard access.
Buttons remain at least 46px high; mobile inputs remain 16px. Native details
provide FAQ disclosure. Test 1280x900, 393x851, 320x568 and 1024x720.
No dependency added; vector marks are sub-kilobyte, motion uses transform,
opacity, and SVG stroke offset, and the initial layout reserves space for the
hero illustration. Keep page entry short and never make motion necessary to
understand a state.

## Operations

`SURELAYER_TEST_BUILD=1` isolates browser-test output in `.next-test`; production
continues using `.next`. It does not alter runtime contract configuration.
Contract, RPC adapter and .env are outside the visual upgrade scope.
