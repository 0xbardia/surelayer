# SureLayer Design System

This system is derived from the current local UI/UX Pro Max searches and
persisted source at [`design-system/surelayer/MASTER.md`](../design-system/surelayer/MASTER.md).

## Direction

**Swiss financial infrastructure**: calm, editorial, evidence-first, and
high-contrast. The interface should feel closer to underwriting software and a
public ledger than to an AI launch page.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--ink` | `#15232B` | Primary text and dark surfaces |
| `--ink-soft` | `#2D3B42` | Secondary dark text |
| `--paper` | `#F6F3EC` | Page background |
| `--surface` | `#FFFCF7` | Cards and form surfaces |
| `--line` | `#D8D2C5` | Borders and dividers |
| `--brass` | `#B7791F` | Trust accent and primary focus |
| `--brass-dark` | `#855A17` | Brass text on light surfaces |
| `--moss` | `#286B5B` | Supported/healthy state |
| `--moss-soft` | `#E4F1EC` | Supported state surface |
| `--rust` | `#A6442A` | Breached/error state |
| `--rust-soft` | `#F8E8E1` | Breached/error state surface |
| `--slate` | `#65747A` | Muted text, never for essential body text |

Purple/cyan gradients, glow effects, decorative blobs, robot illustrations,
emoji icons, fake metrics, and glassmorphism are deliberately excluded.

## Typography

- IBM Plex Sans, 400–700, for all UI and body copy.
- IBM Plex Mono, 400–500, for addresses, amounts, IDs, and transaction states.
- Body text starts at 16px with 1.55–1.7 line height.
- Headings use a compact scale with natural wrapping; never force orphan words.

## Layout and spacing

- 4/8px spacing rhythm: 4, 8, 16, 24, 32, 48, 64.
- Content max width: 1180px; readable text max width: 68ch.
- Mobile-first breakpoints: 375, 768, 1024, 1440px.
- Cards use 1px borders and restrained shadows; radius is 10px for controls and
  14px for major panels.
- No horizontal scroll; URLs and hashes wrap with `overflow-wrap: anywhere`.

## Interaction and states

- One primary action per screen; dangerous value actions require a confirmation
  step with bond, fees, loss case, deadline, and finality.
- Interactive targets are at least 44px high, with 8px minimum gaps.
- Every input has a visible label, helper copy, inline error, and `aria-describedby`.
- Failed form submit moves focus to a linked error summary and retains inline
  errors.
- Every async write has signing, processing, final/decided, failed,
  undetermined, canceled, and retry states.
- Color is paired with a label/icon; state is never color-only.
- `prefers-reduced-motion` disables non-essential reveals. Motion is limited to
  short opacity/translate feedback with 150–300ms transitions.
- Focus rings use a 2px brass outline with 2px offset and remain visible under
  sticky UI.

## Component patterns

- `StatusMark`: label + semantic color + simple SVG symbol.
- `BondBreakdown`: GEN amount, protocol fee note, deadline, and loss outcome.
- `EvidenceList`: numbered sources, host, safe external-link affordance, and
  unavailable/empty state.
- `StateTimeline`: deterministic event rows with timestamps and finality.
- `ClaimTable`: bounded page rows, responsive stacked mobile layout, and empty
  or unavailable states.
- `TransactionPanel`: real hash/status, never a fabricated success message.
