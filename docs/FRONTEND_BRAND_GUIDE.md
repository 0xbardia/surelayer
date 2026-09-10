# SureLayer — the assurance ledger

## Identity

The custom mark combines an angular S and three interlocking proof layers.
The open geometry suggests independently evaluated parts becoming one economic
commitment. It avoids a shield or a seal that could imply guaranteed truth.
The hero is explicitly a protocol concept, with a separate live read beneath it.

Assets: `/brand/surelayer-logo.svg` (primary pairing),
`/brand/surelayer-mark.svg` (icon), `/icon.svg` (dark app/favicon tile).
The React BrandMark uses the same two paths. Keep at least half a mark of clear
space; use the icon from 24px upward. Navbar is 40px desktop / 32px mobile.
Do not stretch, rotate, add glow, or use the mark as a verdict indicator.
The SVG wordmark uses Arial; the website pairs the mark with its native sans.

## Palette and type

| Token | Value | Purpose |
|---|---|---|
| Ink | #202923 | Primary text, hero, account balance panel |
| Paper | #f5f2e9 | Page background |
| Surface | #fffdf7 | Cards, form surfaces |
| Brass | #aa7939 | Rules, borders, decorative geometry |
| Brass dark | #80591f | Accessible accent text on light surfaces |
| Muted | #61685f | Supporting text |
| Moss | #286b5b | Supported/finalized |
| Rust | #a6442a | Breached/errors |

Georgia is the editorial display face. Native system sans handles forms,
navigation and explanatory text; native monospace handles identifiers. No
remote font request or additional font dependency. Body remains 16px, with
13px minimum form help. Long evidence/addresses wrap rather than truncate.
Controls use 6px radius, major surfaces 12px; the hero has one architectural
28px corner. Spacing follows 8px increments with small optical adjustments.

## Motion

Control feedback: 180ms. Page/status entry: 420ms, 12px travel. Hero layers:
600ms with 80ms stagger, once. CSS view-timeline section reveals are progressive
enhancements with visible fallback. Pending spinner signals ongoing work only.
No looping marketing animation, scroll hijack, animation library or event
dependency. Reduced-motion disables transitions, animations and smooth scroll.

## Application language

Navigation shows the active route with a brass underline and aria-current.
Claims have a commitment rule, readable title, ID, bond and named status.
Detail is an editorial document beside an economic position sidebar; evidence
remains linked, text-safe and fully readable. Timeline uses connected points.
Forms introduce the commitment without changing any wallet or protocol logic.
Account balances have an ink surface and never use invented values.

Signing and consensus pending use a neutral brass pending surface. Rejection
and uncertainty retain explicit warnings. Success requires the existing final
receipt check; no visual motion advances protocol state. Status always has text
in addition to color. Transaction hashes wrap and remain visible while pending.

## Accessibility and performance

Preserve semantic controls, form labels, visible focus and keyboard access.
Buttons remain at least 46px high; mobile inputs remain 16px. Native details
provide FAQ disclosure. Test 1280x900, 393x851, 320x568 and 1024x720.
No dependency added; vector marks are sub-kilobyte, motion uses transform and
opacity, and the initial layout reserves space for the hero illustration.

## Operations

`SURELAYER_TEST_BUILD=1` isolates browser-test output in `.next-test`; production
continues using `.next`. It does not alter runtime contract configuration.
Contract, RPC adapter and .env are outside the visual upgrade scope.
