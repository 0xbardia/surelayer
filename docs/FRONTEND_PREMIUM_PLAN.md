# SureLayer premium frontend plan

Date: 2026-09-10. Scope: presentation only, existing Next.js application.

## Audit before implementation

Production inspected in Chromium at 1280x900: homepage and create form.
Source reviewed: layout, landing, shared CSS, claims/detail, form and finality components.
The existing warm palette is credible but sections have nearly identical weight;
the SL square is generic; the hero seal adds little explanation; heavy sans
headings and plain outlined cards lack editorial contrast. CSS names IBM Plex
without loading it. Forms and dense evidence need stronger grouping. Motion is
limited to a loading bar; signing and pending notices visually resemble errors.

## Direction: The assurance ledger

Parchment and warm white, near-black ink, restrained aged brass. Georgia display
type paired with system sans and monospace data: deliberate, fast, no font fetch.
A custom angular S formed by interlocking proof layers becomes the navbar mark,
favicon and hero motif. It suggests agreement and commitment without a shield.
The hero pairs an editorial promise with a dark architectural protocol diagram;
diagram labels explain concepts and never imply a live verdict or fake activity.

## Rollout

A. Draw vector mark/wordmark, set palette/type/spacing and motion tokens.
B. Upgrade hero, sequential protocol diagram, outcome ledger, GenLayer section,
CTA and footer while preserving navigation and accurate existing explanations.
C. Upgrade claims, detail/evidence/timeline, economic position, forms, account,
empty/error and transaction status surfaces through shared components and CSS.
D. Verify four viewports, keyboard/reduced motion and all transaction regressions;
build, restart SureLayer only, inspect public routes and runtime verification.

## Motion

180ms control feedback, 420ms entry, brief stagger for conceptual proof layers.
Only opacity/transform for animated layout; no perpetual decorative motion.
Native CSS view-timeline reveals are progressive enhancements with visible
fallback. Reduced motion disables motion and smooth scrolling. No new library.

## Risk controls and acceptance

Keep contract, .env, shared RPC/write adapter and runtime config byte-identical.
Preserve form names, handlers, confirmations and pending transaction protection.
No economic writes during QA. Preserve explicit uncertainty and all status labels.
Use min-width:0 and overflow-wrap for wallet IDs/evidence; test 320px and 125%.
Retain contrast, focus rings and keyboard/native controls. Verify build before
deploy, all 51 browser tests, and live B reads after restart. The local test
harness builds into `.next-test`; the final production build remains in `.next`
and is deployed unchanged. No backend or contract feature work.

Baseline frozen hashes:
- SureLayer.py: fe46c7b846b961ecc858d6f2669fa989b46549efbae9729e02958978a8081f81
- config.ts: d5a2296901cc95f403d596f9d1ca7e47859dc70a39f4e0381b9100c9d3507b05
- genlayer.ts: 773b77bd80a32cc5975f6173e77e7b82025f24c138630688342d969b0fea9239
- Production static baseline: 1,224,935 bytes. No dependencies will be added.
