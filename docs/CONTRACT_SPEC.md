# SureLayer Intelligent Contract Specification

**Status:** implementation-aligned and reviewed 2026-09-09
**Source:** [`contracts/SureLayer.py`](../contracts/SureLayer.py)

SureLayer is a bounded economic warranty state machine. The contract is the
source of truth for claims, challenges, consensus results, liabilities, and
withdrawable credits. The application never adjudicates a claim.

## Configuration

The current contract has a parameterless constructor with explicit defaults:

| Field | Default | Purpose |
|---|---:|---|
| `min_claim_bond` | `1 GEN` (`10^18` wei) | Minimum issuer bond; larger values are allowed |
| `challenge_bond` | `0.5 GEN` (`5 * 10^17` wei) | Exact challenge bond |
| `challenge_window_seconds` | `86,400` | Time in which an OPEN claim may be challenged |
| `resolution_timeout_seconds` | `86,400` | Time after challenge before timeout recovery |

`get_config()` is the configuration authority for the frontend. These defaults
are not a substitute for reading the deployed contract.

## Bounds

| Input | Limit |
|---|---:|
| Claim statement | 1–1,200 characters |
| Warranty criteria | 1–2,000 characters |
| Artifact reference | 0–500 characters |
| Artifact hash | 0–128 characters |
| Evidence source URL | 1–512 characters |
| Sources per side | 0–4 |
| Challenge reason | 1–1,200 characters |
| Fetched body per source | 2,400 characters |
| Combined evidence prompt | 8,000 characters |
| Resolution summary | 800 characters |
| Claim page size | 1–25 records |
| Claim page offset | ≤ 10,000 records |

Source lists may be empty to support a claim that relies on its artifact and
criteria alone. If a challenged decision cannot establish reliable evidence,
the economic result is `INCONCLUSIVE` rather than guessed certainty.

URLs must use `http://` or `https://`, have a non-empty host, fit the length
bound, and contain no control, quote, or angle-bracket characters. The contract
stores references, never raw webpages.

## State machine

| Numeric state | Name | Terminal | Entry |
|---:|---|---|---|
| 1 | `OPEN` | No | `create_claim` with a valid payable bond |
| 2 | `CHALLENGED` | No | `challenge_claim` strictly before deadline |
| 3 | `SUPPORTED` | Yes | Consensus establishes all criteria |
| 4 | `BREACHED` | Yes | Consensus establishes a criterion breach |
| 5 | `INCONCLUSIVE` | Yes | Evidence is unavailable, ambiguous, contradictory, injected, or not reliable enough |
| 6 | `UNCHALLENGED_FINALIZED` | Yes | Issuer finalizes at/after challenge deadline |
| 7 | `TIMEOUT_RECOVERED` | Yes | Anyone recovers both bonds at/after resolution deadline |

Only `OPEN` accepts a challenge. Only `CHALLENGED` accepts resolution or
timeout recovery. Every terminal state rejects later settlement actions.

## Persistent state

All persistent fields are explicitly declared and use current GenLayer storage
primitives. Claims are held in `TreeMap[str, ClaimRecord]` keyed by decimal ID;
credits are held in `TreeMap[str, u256]` keyed by normalized address text.

`ClaimRecord` stores identity/content, issuer evidence, bond/deadline data,
challenge data, normalized resolution fields, and `settlement_done`. Sources
are bounded newline-delimited references; public views split them back into
bounded lists.

The stable resolution fields are:

```json
{
  "verdict": "SUPPORTED | BREACHED | INCONCLUSIVE",
  "evidence_state": "AVAILABLE | UNAVAILABLE | EMPTY | CONTRADICTORY | AMBIGUOUS | PROMPT_INJECTION",
  "criteria_met": true,
  "supporting_source_count": 0,
  "summary": "bounded factual explanation"
}
```

Natural-language summary is persisted for inspection but is not an
Equivalence Principle comparison key.

## Economic invariants

1. After every successful deterministic state change,
   `total_locked + total_credits <= self.balance`.
2. A claim bond enters `total_locked` once at creation and leaves once at
   settlement, unchallenged finalization, or timeout recovery.
3. A challenge bond enters `total_locked` once at challenge and leaves once at
   settlement or timeout recovery.
4. `_settle` runs only for `CHALLENGED` records whose
   `settlement_done` flag is false.
5. Pull withdrawal zeroes the caller credit and decrements `total_credits`
   before emitting the external GEN transfer.
6. `withdraw_credit()` has no target-address parameter; callers can withdraw
   only their own keyed credit.
7. There is no admin withdrawal, verdict override, upgrade hook, or privileged
   settlement path.

## Non-deterministic adjudication

`resolve_claim` copies bounded record values into the evaluation closure and
calls `gl.vm.run_nondet_unsafe(leader_fn, validator_fn)`. Both leader and
validator independently fetch the stored issuer/challenger URLs with
`gl.nondet.web.get`, cap bodies, classify unavailable/empty/injected data, and
run the structured evaluation prompt with `gl.nondet.exec_prompt`.

The prompt separates trusted protocol instructions from claim text, criteria,
challenge text, URLs, and fetched bodies. Evidence is explicitly untrusted
data; prompt-injection markers and unreliable sources cannot authorize a
verdict. The validator independently computes the result and compares only
`verdict`, `evidence_state`, `criteria_met`, and
`supporting_source_count`, and `artifact_integrity`. A well-shaped but malicious leader output is not
accepted. Consensus disagreement leaves the claim challenged; the public
timeout path prevents permanent custody lock.

## Public interface

### Views

- `get_config()` — deployed constants and input bounds.
- `get_claim(claim_id)` — bounded detail tuple.
- `list_claims(offset, limit)` — bounded summary pagination.
- `get_claim_evidence(claim_id)` — issuer URLs, issuer hashes, challenger URLs,
  and challenger hashes.
- `get_claim_timeline(claim_id)` — bounded state transition events.
- `get_credit(address)` and `get_my_credit()` — pull credit balances.
- `get_protocol_stats()` — count, locked liabilities, credits, contract balance.
- `state_name(state)` — numeric state to human-readable meaning.

### Payable writes

- `create_claim(statement, artifact_ref, artifact_hash, criteria,
  issuer_sources, issuer_hashes)` — requires `value >= min_claim_bond`; each
  source URL is paired with a canonical SHA-256 commitment; returns the ID.
- `challenge_claim(claim_id, reason, challenger_sources, challenger_hashes)` —
  requires the exact challenge bond and an OPEN claim before its deadline; each
  source URL is paired with a canonical SHA-256 commitment; issuer cannot
  challenge its own claim.

### Writes

- `resolve_claim(claim_id)` — permissionless while challenged and before the
  resolution deadline; runs real GenLayer consensus and settles once.
- `finalize_unchallenged(claim_id)` — issuer-only at/after the challenge
  deadline; credits the original claim bond.
- `recover_challenge_timeout(claim_id)` — permissionless at/after the
  resolution deadline; returns each original bond to its owner.
- `withdraw_credit()` — caller-only pull withdrawal.

## Client finality

The application uses `LATEST_FINAL` for reads that drive irreversible UI and
the stable SDK's `waitForTransactionReceipt({ status: FINALIZED })` for writes.
It additionally requires `FINISHED_WITH_RETURN`. Submission, consensus
processing, finalization, undetermined/canceled outcomes, and execution errors
remain distinct user-facing states. A transaction hash alone never updates a
claim projection.

## Explicit non-goals

The v1 contract has no admin verdict override, admin withdrawal, upgrade hook,
appeal layer, slashing, multi-challenge order book, raw page storage,
arbitrary backend evidence proxy, or centralized adjudication service.
