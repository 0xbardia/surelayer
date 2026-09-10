# Implementation Plan: SureLayer protocol and dApp

**Branch**: `001-surelayer-protocol`  **Date**: 2026-09-08  **Spec**: `specs/001-surelayer-protocol/spec.md`

## Summary

Build a contract-first SureLayer warranty protocol. The Intelligent Contract stores bounded claims and challenges, accepts real GEN bonds, resolves challenged claims through GenLayer non-deterministic leader/validator evidence evaluation, and settles through pull-based credits. A small Next.js application reads final chain state, lets a connected wallet sign writes, and represents transaction finality honestly. No backend LLM or demo contract path is used.

## Technical Context

**Language/Version**: GenLayer Python SDK from the pinned contract dependency; TypeScript/React/Next.js on Node 20+

**Primary Dependencies**: `py-genlayer` contract SDK, `genlayer-test` direct tests, `genlayer-js` 1.1.8 for app reads/writes, Next.js 16, React 19, Playwright Chromium

**Storage**: GenLayer contract storage (`TreeMap`, persistent dataclass, bounded strings); no application database

**Testing**: `pytest`/`genlayer-test` 0.30.0rc2 direct mode, mocked web/LLM/adversarial validator tests, Next.js production build, Playwright Chromium

**Target Platform**: GenLayer Studionet deployment plus a single Next.js server

**Project Type**: Full-stack web application with one Intelligent Contract

**Performance Goals**: bounded contract work; paginated reads; server health/read requests fail clearly and do not mask RPC errors

**Constraints**: no privileged wallet, no unbounded storage/loops, no raw webpage persistence, final state only for irreversible UI, no fabricated live data

**Scale/Scope**: small auditable protocol; one active challenge per claim; bounded page size and evidence set; no speculative indexing service

## Constitution Check

Passed before implementation:

- Contract-first: the state machine, economics, public interface, and threat model precede UI code.
- Real consensus: resolution is a GenLayer non-deterministic operation with an independent validator; the app never substitutes a backend boolean.
- Security before convenience: bounded inputs, explicit transitions, pull credits, finality-aware UI, untrusted evidence handling, and no admin override are required.
- Evidence is untrusted: web content is data, prompt-injection text is not instructions, and ambiguous evidence returns `INCONCLUSIVE`.
- No fabrication/hidden centralization: live data is shown only from configured chain reads; missing configuration is an explicit state.
- Bounded execution: source count, source length, aggregate prompt, result length, page size, and deadlines are bounded.
- Evidence-based completion: deployment, Studio reads, browser QA, and finality claims require captured evidence.

Re-checked after design: the plan keeps contract state authoritative, separates nondeterministic evaluation from deterministic settlement, and leaves deployment as an external-evidence gate rather than assuming it.

## Project Structure

```text
contracts/SureLayer.py                 # final Intelligent Contract
tests/test_surelayer_contract.py      # direct-mode contract/economic/validator tests
src/app/                              # Next.js pages and route handlers
src/components/                       # small client interaction components
src/lib/                              # config, types, GenLayer read/write adapter
e2e/                                   # Playwright production-browser checks
docs/                                 # durable architecture, security, QA, and design docs
specs/001-surelayer-protocol/         # Spec Kit artifacts
```

**Structure Decision**: one Next.js application and one contract, with a thin typed adapter rather than a separate API service or database. Route handlers provide health/status/claim read normalization; wallet writes remain client-signed.

## Delivery Phases

1. Implement the contract, validator, bounds, transitions, settlement, timeout, and direct tests.
2. Add the typed GenLayer adapter, environment validation, health/status routes, and safe error normalization.
3. Add the design system, landing page, claim browsing/detail, create/challenge/withdraw flows, and finality states.
4. Add documentation, build checks, Playwright Chromium QA, accessibility checks, and security headers.
5. Deploy the exact contract source to Studio if the available session can complete required authentication/signatures; record the public address/configuration result and call every read method. If an external wallet/auth step blocks this, record it as the only incomplete gate.

## Complexity Tracking

No constitution violations. Deliberate simplifications: one active challenge per claim, newline-delimited bounded source strings instead of nested storage arrays, and no database/indexer. These keep accounting and audit scope small; add neither unless measured requirements demand them.
