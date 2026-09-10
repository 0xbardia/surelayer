# SureLayer Design System

This is the final implementation system for SureLayer, derived from the local
UI/UX Pro Max searches run on 2026-09-08. It intentionally avoids default AI
visual language and treats the product as trust infrastructure: editorial,
financial, evidence-first, and calm under risk.

## Direction

Swiss financial software with generous whitespace, strong typography, clear
ledger-like data, and restrained motion. The interface should make a bond,
deadline, evidence state, and finality state legible before a wallet signs.

## Tokens

| Role | Value | CSS variable |
|---|---|---|
| Primary text | `#15232B` | `--ink` |
| Secondary text | `#2D3B42` | `--ink-soft` |
| Page background | `#F6F3EC` | `--paper` |
| Surface | `#FFFDF8` | `--surface` |
| Border | `#D8D2C5` | `--line` |
| Trust accent | `#B7791F` | `--brass` |
| Trust accent text | `#855A17` | `--brass-dark` |
| Supported/healthy | `#286B5B` | `--moss` |
| Supported surface | `#E4F1EC` | `--moss-soft` |
| Breached/error | `#A6442A` | `--rust` |
| Breached/error surface | `#F8E8E1` | `--rust-soft` |
| Muted text | `#65747A` | `--slate` |

Do not use purple/cyan gradients, glow effects, decorative blobs, robot art,
glassmorphism, fake metrics, partner logos, or emoji icons.

## Typography and layout

- IBM Plex Sans for body/UI; IBM Plex Mono for addresses, GEN amounts, IDs,
  and lifecycle labels.
- Body starts at 16px with 1.55 line height; headings use compact natural
  wrapping and avoid forced orphan words.
- 4/8px rhythm: 4, 8, 16, 24, 32, 48, 64.
- Content max width 1180px; readable prose max width about 68ch.
- 1px borders, restrained shadows, 10px controls and 14px major panels; URLs
  and hashes use `overflow-wrap: anywhere`.
- Responsive checkpoints: 320, 375, 768, 1024, 1440px.

## Interaction and accessibility

- Every interactive target is at least 44px high and has a visible focus ring.
- Labels, helper text, inline validation, error summary focus, and
  `aria-live` status updates are required for forms and transactions.
- Color is always paired with text; state is never color-only.
- Financial actions explain amount, fee distinction, loss case, deadline, and
  finality before wallet confirmation.
- Motion is limited to short 150–300ms transitions; reduced motion removes
  non-essential animation.
- Empty, loading, unavailable, failed, undetermined, canceled, and finalized
  states are designed states, not generic fallback copy.

## Component patterns

- `ClaimTable`: bounded page rows, stacked mobile layout, clear empty state.
- `BondBreakdown`: GEN amount, protocol fee note, deadline, and loss outcome.
- `EvidenceList`: safe external links, bounded references, explicit source
  availability language.
- `StateTimeline`: deterministic event rows with timestamps and finality.
- `TransactionPanel`: real hash/status only; never optimistic settlement.
