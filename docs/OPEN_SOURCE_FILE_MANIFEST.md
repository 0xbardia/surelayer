# Public repository file manifest

This is the intended public source tree. Local `.env`, dependency installs,
build output, Python environments, browser output, caches, and Git metadata are
omitted intentionally and are covered by `.gitignore`.

```text
surelayer/
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
├── README.md
├── SECURITY.md
├── LICENSE                         # complete Apache License 2.0 text
├── package.json
├── package-lock.json
├── next-env.d.ts
├── next.config.ts
├── playwright.config.ts
├── tsconfig.json
├── contracts/
│   └── SureLayer.py
├── design-system/
│   └── surelayer/MASTER.md
├── e2e/
│   ├── create-transaction-regression.spec.ts
│   └── surelayer.spec.ts
├── public/
│   └── brand/
│       ├── surelayer-logo.svg
│       └── surelayer-mark.svg
├── scripts/
│   ├── verify-genlayer-write-routing.mjs
│   ├── verify-premium-browser.js
│   └── verify-runtime-config.mjs
├── specs/
│   └── 001-surelayer-protocol/
│       ├── checklists/requirements.md
│       ├── contracts/contract-interface.md
│       ├── contracts/http-interface.md
│       ├── data-model.md
│       ├── plan.md
│       ├── quickstart.md
│       ├── research.md
│       ├── spec.md
│       └── tasks.md
├── src/
│   ├── app/
│   │   ├── account/page.tsx
│   │   ├── api/claims/[id]/route.ts
│   │   ├── api/claims/route.ts
│   │   ├── api/config/route.ts
│   │   ├── api/credit/route.ts
│   │   ├── api/health/route.ts
│   │   ├── api/status/route.ts
│   │   ├── claims/[id]/page.tsx
│   │   ├── claims/page.tsx
│   │   ├── create/page.tsx
│   │   ├── error.tsx
│   │   ├── globals.css
│   │   ├── icon.svg
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   ├── page.tsx
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── AccountPanel.tsx
│   │   ├── BrandMark.tsx
│   │   ├── ChallengeForm.tsx
│   │   ├── ClaimDetailView.tsx
│   │   ├── ClaimsExplorer.tsx
│   │   ├── CreateClaimForm.tsx
│   │   ├── PrimaryNav.tsx
│   │   ├── ProtocolStatus.tsx
│   │   ├── StateNotice.tsx
│   │   ├── TransactionStatus.tsx
│   │   └── WalletButton.tsx
│   └── lib/
│       ├── config.ts
│       ├── errors.ts
│       ├── genlayer.ts
│       ├── json.ts
│       └── protocol.ts
└── tests/
    ├── conftest.py
    ├── test_surelayer_contract.py
    └── test_surelayer_validator.py
```

## Durable documentation

`docs/` retains architecture, contract behavior, GenLayer rationale, threat
model, development/setup, testing, QA, deployment guidance, frontend design,
reviewer guidance, the feature matrix, and this open-source audit. The source
specification under `specs/` remains available for protocol reasoning and
traceability.

## Removed categories

- raw browser screenshots, JSON/YAML captures, console/network dumps, and
  process/DNS/header diagnostics;
- one-off incident, submission, research, Spec Kit, and historical deployment
  reports that duplicated durable documentation or exposed operational details;
- local agent/spec tooling and instruction files;
- generated test builds, reports, screenshots, Python bytecode, caches, and
  compiler state.

The removed evidence was not a runtime dependency. Tests now write disposable
output under ignored `test-results/`, and public documentation records the
repeatable verification commands instead of committing host-specific captures.
