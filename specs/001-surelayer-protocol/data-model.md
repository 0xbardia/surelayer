# Data Model: SureLayer

## Persistent protocol state

### `ClaimRecord`

One bounded record is stored per numeric string claim ID. It contains issuer, statement, artifact reference/hash, criteria, bounded issuer sources, bond, timestamps, state, and challenge/resolution fields. The contract stores sources as a bounded newline-delimited string to avoid an unnecessary nested storage type.

States are numeric in storage and exposed as names:

`OPEN` → `CHALLENGED` → one of `SUPPORTED`, `BREACHED`, `INCONCLUSIVE`, or `TIMEOUT_RECOVERED`; `OPEN` can also become `UNCHALLENGED_FINALIZED` after its challenge deadline.

### `claims`

`TreeMap[str, ClaimRecord]`, keyed by the decimal claim ID. Claim IDs are allocated monotonically and never reused.

### `credits`

`TreeMap[str, u256]` of withdrawable GEN credits, keyed by normalized address text. A credit is created only by a terminal settlement and is zeroed before withdrawal.

### Protocol counters

`next_claim_id`, `total_locked`, `total_credits`, and immutable configuration values are explicit storage fields. `total_locked` tracks claim/challenge bonds not yet credited; `total_credits` tracks credits not yet withdrawn. The core liability invariant is `total_locked + total_credits <= self.balance` after every deterministic state mutation.

## Client projections

The read adapter maps contract tuples/objects to typed `Claim`, `ProtocolConfig`, `ProtocolStats`, `TimelineEvent`, and `CreditBalance` values. It does not invent missing fields. Unknown states and RPC failures remain explicit errors.

## Transition table

| Current | Action | Guard | Result |
|---|---|---|---|
| OPEN | challenge | exact challenge bond; before deadline; no active challenge | CHALLENGED |
| OPEN | finalize | issuer; deadline elapsed | UNCHALLENGED_FINALIZED; issuer credit |
| CHALLENGED | resolve | before resolution deadline; independent consensus | SUPPORTED/BREACHED/INCONCLUSIVE; one settlement |
| CHALLENGED | recover timeout | resolution deadline elapsed | TIMEOUT_RECOVERED; both bonds returned |
| terminal | any terminal action | always | reject/no mutation |

## Non-persistent evaluation result

The nondeterministic evaluator returns bounded JSON with `verdict`, `evidence_state`, `criteria_met`, `supporting_source_count`, and `summary`. Only the normalized decision and bounded summary cross into deterministic storage after consensus.
