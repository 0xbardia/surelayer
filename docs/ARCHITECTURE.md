# SureLayer architecture

## Source of truth

The GenLayer Intelligent Contract owns every protocol fact: claim content,
challenge eligibility, evidence references, verdict fields, deadlines,
liabilities, credits, and terminal state. The frontend and server do not
maintain a shadow database or infer settlement from a transaction hash.

```text
wallet ──signed write──> GenLayer consensus ──> SureLayer state machine
                              │                         │
                              ├─ leader evaluates       ├─ final reads
                              └─ validators re-evaluate └─ pull credits
                                                             │
Next.js read routes <──────────── RPC <──────────────────────┘
```

## Contract layer

`contracts/SureLayer.py` is one bounded contract. It uses explicit persistent
fields, an `@allow_storage` dataclass, `TreeMap` claim/credit storage, payable
GEN methods, `run_nondet_unsafe` for substantive consensus, and a pull-based
withdrawal path. Raw web pages never enter persistent storage.

The state machine is `OPEN → CHALLENGED → {SUPPORTED, BREACHED,
INCONCLUSIVE}` or `OPEN → UNCHALLENGED_FINALIZED`. A challenged claim can also
enter `TIMEOUT_RECOVERED`. Terminal states reject further settlement.

## Server layer

The Next.js route handlers are read-only adapters:

- `/api/health` separates application, RPC, and contract readability.
- `/api/config` exposes the allowlisted runtime public configuration.
- `/api/status` returns configuration and finalized protocol stats.
- `/api/claims` returns bounded finalized pages.
- `/api/claims/:id` returns a claim, evidence references, and timeline.
- `/api/credit` reads one validated wallet credit.

Inputs are bounded and parsed before use. The server never fetches arbitrary
evidence URLs, signs a user transaction, adjudicates a claim, or exposes a
private key.

## Browser layer

Reads use GenLayerJS `LATEST_FINAL`. Writes fetch `/api/config` immediately
before using the connected EIP-1193 wallet, pass the wallet account into
GenLayerJS, verify the configured chain before signing, and wait for
`FINALIZED` plus `FINISHED_WITH_RETURN`. Signing,
processing, rejected, unresolved, and final states remain distinct in the UI.

The raw EVM destination of a write can be GenLayer ConsensusMain or a Ghost
router. That is protocol transport, not the application recipient. The
GenLayer payload carries the SureLayer Intelligent Contract address and method;
that decoded recipient is the target that must match runtime configuration.

## Deliberate non-goals

There is no indexer, database, admin verdict override, privileged withdrawal,
backend evidence proxy, multi-challenge order book, or speculative token
wrapper. These would widen the trust surface without helping the first
assurance loop.
