---

description: "Executable implementation tasks for SureLayer"
---

# Tasks: SureLayer protocol and dApp

**Input**: Design documents from `/specs/001-surelayer-protocol/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Required by the product brief; contract, adversarial validator, backend, build, and browser tests are included.

## Phase 1: Setup

- [x] T001 Create the repository ignore/env baseline in `.gitignore`, `.env.example`, and `.env`
- [x] T002 [P] Add the Next.js/React/TypeScript package manifest and scripts in `package.json`
- [x] T003 [P] Add the final visual tokens and component state rules in `docs/DESIGN_SYSTEM.md`
- [x] T004 [P] Add required durable documentation under `docs/`

## Phase 2: Foundational

- [x] T005 Implement bounded protocol constants, state names, and error helpers in `contracts/SureLayer.py`
- [x] T006 Implement persistent claim/credit storage and deterministic transition helpers in `contracts/SureLayer.py`
- [x] T007 Implement public view methods and bounded pagination in `contracts/SureLayer.py`
- [x] T008 Implement environment parsing, public contract metadata, and safe error types in `src/lib/config.ts` and `src/lib/errors.ts`
- [x] T009 Implement the GenLayer read/write adapter with finality-aware transaction status in `src/lib/genlayer.ts`
- [x] T010 [P] Add health/status/claims route handler scaffolding in `src/app/api/health/route.ts`, `src/app/api/status/route.ts`, and `src/app/api/claims/route.ts`

## Phase 3: User Story 1 — Issue a bonded warranty (Priority: P1)

**Goal**: An issuer can create a bounded claim with real GEN, understand its deadline/economics, and see the claim in final chain state.

**Independent test**: Direct contract tests create a valid claim, reject invalid/underfunded inputs, and verify the OPEN record, bond, deadline, and liabilities; browser tests verify the no-config and configured form states without fake data.

### Tests

- [x] T011 [P] [US1] Add direct deployment/configuration and initial-state tests in `tests/test_surelayer_contract.py`
- [x] T012 [P] [US1] Add create-claim validation, bounds, URL, Unicode, and insufficient-bond tests in `tests/test_surelayer_contract.py`

### Implementation

- [x] T013 [US1] Implement payable `create_claim` and claim ID allocation in `contracts/SureLayer.py`
- [x] T014 [US1] Implement claim browse/detail read projections in `src/app/api/claims/route.ts` and `src/app/api/claims/[id]/route.ts`
- [x] T015 [US1] Build the landing and claims browse pages with explicit live/configuration/empty states in `src/app/page.tsx` and `src/app/claims/page.tsx`
- [x] T016 [US1] Build the bounded create-warranty form with bond/deadline/finality copy in `src/app/create/page.tsx` and `src/components/CreateClaimForm.tsx`

## Phase 4: User Story 2 — Challenge and independently resolve (Priority: P1)

**Goal**: A challenger can post a challenge bond; GenLayer consensus independently evaluates the evidence and records SUPPORTED, BREACHED, or INCONCLUSIVE.

**Independent test**: Direct tests exercise valid/invalid challenge transitions, mocked evidence conditions, captured-validator malicious leader cases, disagreement, unavailable/contradictory/prompt-injection evidence, and resolution finality boundaries.

### Tests

- [x] T017 [P] [US2] Add challenge deadline, duplicate, sender, bond, and evidence-bound tests in `tests/test_surelayer_contract.py`
- [x] T018 [P] [US2] Add independent validator tests for malicious leader output, invalid JSON, mismatched stable fields, prompt injection, unavailable evidence, and disagreement in `tests/test_surelayer_validator.py`

### Implementation

- [x] T019 [US2] Implement bounded evidence normalization, prompt-injection separation, nondeterministic evaluator, and custom validator in `contracts/SureLayer.py`
- [x] T020 [US2] Implement payable `challenge_claim` and public `resolve_claim` with consensus result handling in `contracts/SureLayer.py`
- [x] T021 [US2] Add challenge form, evidence display, resolution progress/finality status, and detail timeline in `src/app/claims/[id]/page.tsx` and `src/components/ChallengeForm.tsx`
- [x] T022 [US2] Add typed transaction submission/status polling without optimistic terminal state in `src/components/TransactionStatus.tsx` and `src/lib/genlayer.ts`

## Phase 5: User Story 3 — Receive the economic outcome (Priority: P1)

**Goal**: Terminal settlement is exactly once, credits are withdrawable, unchallenged claims can be finalized, and challenged claims have a timeout recovery path.

**Independent test**: Direct tests cover supported/breached/inconclusive settlement, unchallenged finalization, challenge timeout recovery, accounting invariants, duplicate settlement, duplicate withdrawal, and unknown IDs.

### Tests

- [x] T023 [P] [US3] Add settlement and liability invariant tests for every verdict/timeout/finalization path in `tests/test_surelayer_contract.py`
- [x] T024 [P] [US3] Add withdrawal, unauthorized action, second withdrawal, pagination boundary, and timestamp-boundary tests in `tests/test_surelayer_contract.py`

### Implementation

- [x] T025 [US3] Implement credit settlement, unchallenged finalization, timeout recovery, and pull withdrawal in `contracts/SureLayer.py`
- [x] T026 [US3] Add credit/status reads and safe withdrawal action in `src/app/account/page.tsx` and `src/components/AccountPanel.tsx` (the single-panel implementation replaces the initially planned split component)
- [x] T027 [US3] Add explicit terminal outcome and error/retry/empty/loading states across claim/account views in `src/components/StateNotice.tsx`

## Phase 6: Product shell, backend, and security

- [x] T028 [P] Add accessible layout, navigation, typography, responsive CSS, reduced-motion rules, and semantic status styles in `src/app/layout.tsx` and `src/app/globals.css`
- [x] T029 [P] Add typed status/health/read normalization and RPC failure logging without secrets in `src/app/api/status/route.ts`, `src/app/api/health/route.ts`, and `src/lib/errors.ts` (the logging helper lives with public error types)
- [x] T030 [P] Add security headers, safe external-link handling, and no-HTML claim/evidence rendering in `next.config.ts`, `src/app/layout.tsx`, and relevant components
- [x] T031 Add architecture, GenLayer fit, security, development, testing, QA, and roadmap documentation in `docs/ARCHITECTURE.md`, `docs/GENLAYER_FIT.md`, `SECURITY.md`, `docs/DEVELOPMENT.md`, `docs/TESTING.md`, `docs/QA.md`, and `docs/ROADMAP.md`

## Phase 7: Verification and deployment evidence

- [x] T032 Run direct contract and validator tests; record results and any fixes in `docs/TESTING.md`
- [x] T033 Run the production build and start the server from current source; record result in `docs/QA.md`
- [x] T034 Add Chromium E2E coverage for routes, forms, errors, keyboard focus, mobile/narrow layouts, 100%/125% zoom, console, network, and overflow in `e2e/surelayer.spec.ts`
- [x] T035 Run Playwright against the production server and store temporary screenshots/log summaries under ignored `test-results/`; update `docs/QA.md`
- [x] T036 Run dependency/security/static review and Ponytail review; fix P0/P1 findings and record residual risks in `SECURITY.md`
- [x] T037 Deploy the exact final source to GenLayer Studio if authenticated wallet/signature access is available; record the public compatibility result in `docs/DEPLOYMENT.md` without committing raw operational evidence
- [x] T038 Call every public read method and execute representative cross-account write lifecycles against the final Studio deployment; update app env and rebuild, with exact hosted evidence in `docs/DEPLOYMENT.md`
- [x] T039 Run Spec Kit consistency/convergence review against the final source/docs/tests and record durable conclusions in the maintained documentation
- [x] T040 Update completed task checkboxes and `docs/ROADMAP.md` only from captured evidence; produce the final acceptance report

## Dependencies and execution order

- Setup precedes Foundational.
- Foundational precedes all user stories.
- US1 establishes claims; US2 depends on the claim shape but can be tested with its own fixtures; US3 depends on both state transitions and credit storage.
- Product shell can proceed after the read adapter exists; deployment evidence is last and is invalidated by any later contract change.
- T032–T040 run only after implementation changes have stabilized; any contract source change repeats focused tests and redeployment verification. T041 records final-audit convergence; T042 remains an external Studio gate and must not be marked complete without direct final-source evidence.

## Parallel opportunities

- T002–T004 can run in parallel.
- T010, T011–T012, T017–T018, T023–T024, and T028–T030 are parallel only when they touch separate files and the foundational API is stable.
- T034 can be written while documentation is completed, but execution waits for the production build.

## Implementation strategy

Ship the contract and direct tests first as the MVP. Add read-only app visibility next, then wallet writes and settlement UI. Finish with browser/security QA and only then attempt final Studio deployment. No mock contract path is permitted in production.

## Phase 8: Rejection-audit convergence

- [x] T041 Reconcile final-source source parity, all public reads, production configuration, and reviewer checks after the rejection audit per Constitution VII (partial historical evidence corrected)
- [x] T042 Execute the final-source cross-account challenge, consensus resolution, settlement, and withdrawal lifecycle using the official exact-wei SDK path per SC-009; claims `1`–`3` cover `SUPPORTED`, `BREACHED`, and `INCONCLUSIVE`, with all credits withdrawn and final stats zero
