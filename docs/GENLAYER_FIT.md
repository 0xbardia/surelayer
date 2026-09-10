# Why SureLayer needs GenLayer

## Necessity gate

SureLayer is not `backend → LLM → boolean → contract`. The economic verdict is
computed by the Intelligent Contract's GenLayer consensus path.

| Operation | Deterministic or non-deterministic | Owner |
|---|---|---|
| Validate lengths, URL scheme, source count, and bond values | Deterministic | Contract |
| Check caller, state, deadline, and one-way transitions | Deterministic | Contract |
| Store claim/challenge/resolution fields and liabilities | Deterministic | Contract |
| Fetch bounded external evidence | Non-deterministic | Leader and each validator |
| Interpret criteria against claim and evidence | Non-deterministic | Leader and each validator |
| Compare stable decision fields and accept/reject the proposal | Consensus validation | GenLayer runtime |
| Credit and withdraw settled obligations | Deterministic | Contract |

## What validators independently inspect

Each validator receives the leader result but does not trust it. It independently
fetches the bounded issuer/challenger URLs, caps each response, classifies
unavailable/empty/injected evidence, and runs the structured evaluator. It then
compares only fields that should converge:

- `verdict`
- `evidence_state`
- `criteria_met`
- `supporting_source_count`

Natural-language summaries are intentionally not equality keys. If the leader
is malicious, malformed, or semantically different, the validator rejects the
result. If evidence cannot support a reliable binary decision, the evaluator
uses `INCONCLUSIVE`; if validators disagree, the challenged state remains
recoverable through timeout.

## On-chain state

The contract stores bounded claim/challenge data, evidence references, state and
deadline timestamps, the structured resolution fields, `settlement_done`,
`total_locked`, `total_credits`, and per-address credits. It does not store raw
web pages or subjective reasoning beyond the bounded summary.

## Why an ordinary EVM contract is insufficient

A conventional EVM contract can enforce a bond, a deadline, and a precomputed
verdict. It cannot natively retrieve changing web evidence and ask a validator
set to independently interpret natural-language warranty criteria. Moving that
interpretation to a centralized server would make the server the real arbiter;
the contract would only custody funds after trusting an opaque boolean.

## Why a centralized LLM weakens the model

A backend LLM creates one operator-controlled evidence fetch, prompt, model,
and result. Users would have to trust that server not to alter evidence, censor
challenges, or redirect a verdict. GenLayer puts the semantic operation inside
the consensus execution path and makes the stable economic decision fields
subject to independent validator checking.

## Current official basis

The implementation follows the current official guidance for [non-deterministic
execution](https://docs.genlayer.com/developers/intelligent-contracts/features/non-determinism),
the [Equivalence Principle](https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle),
[web access](https://docs.genlayer.com/developers/intelligent-contracts/features/web-access),
[LLM calls](https://docs.genlayer.com/developers/intelligent-contracts/features/calling-llms),
and [transaction finality](https://docs.genlayer.com/developers/decentralized-applications/querying-a-transaction).
