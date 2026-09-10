# SureLayer rejection defense

## The 60-second answer

1. **Exact decision:** `resolve_claim` decides whether the committed warranty
   criteria are `SUPPORTED`, `BREACHED`, or safely `INCONCLUSIVE`.
2. **Evidence:** the Intelligent Contract independently fetches bounded issuer
   and challenger URLs, classifies availability/injection/ambiguity, and asks
   the adjudicator to interpret the claim and criteria.
3. **Agreement:** validators independently repeat the fetch/evaluation and
   compare only `verdict`, `evidence_state`, `criteria_met`, and
   `supporting_source_count`. Summary prose is not an equality key.
4. **Value:** the accepted result deterministically moves real GEN liabilities
   between `total_locked`, per-address credits, and the pull withdrawal path.
5. **Why not EVM:** a normal contract can escrow GEN, but cannot natively
   retrieve and interpret changing natural-language evidence with independent
   validator execution.
6. **Why not a backend:** a backend LLM would become the trusted arbiter and
   could change the fetch, prompt, model, or boolean before the contract sees
   it. SureLayer has no backend verdict endpoint or privileged override.

## Strongest removal tests

| Alternative | What it can reproduce | Trust guarantee it cannot reproduce |
|---|---|---|
| Frontend → centralized backend → one LLM → database | Claim forms, a stored explanation, and a reported boolean | The backend operator controls retrieval, prompt, model result, and settlement input; there is no independent validator decision tied to the bond ledger |
| Frontend → ordinary EVM escrow → centralized oracle | Bond custody, deadlines, and deterministic payout after an oracle answer | The oracle is a trusted arbitrator; an ordinary contract cannot independently inspect natural-language evidence |
| Frontend → external AI API → on-chain result | A signed or submitted record of an off-chain answer | The API response is authoritative only because its operator is trusted; storing it later does not recreate independent consensus |
| Ordinary escrow → trusted arbitrator | Human arbitration and deterministic transfers | It replaces GenLayer validators with one privileged party and changes the protocol trust model |

The irreplaceable operation is `resolve_claim`: the committed statement and
warranty criteria are already stored, the claim/challenge bonds are already
locked, and leader plus validators independently retrieve and interpret the
bounded evidence. Only the accepted stable fields can reach deterministic
settlement. No backend route, operator, or browser can write a verdict. This
is a protocol-level guarantee rather than a claim that any model is infallible.

## Rejection tests applied

| Attack | Result |
|---|---|
| Malicious Leader says `SUPPORTED` while independent result is `BREACHED` | Validator returns false; Direct Mode test `test_invalid_and_mismatched_leader_results_are_rejected` |
| Valid JSON with false stable fields | Rejected without settlement; `test_structured_output_attacks_fail_without_settlement` |
| Prompt-injection evidence | Classified as `PROMPT_INJECTION` and settles only as `INCONCLUSIVE` in Direct Mode |
| Unavailable/empty/contradictory evidence | Conservative `INCONCLUSIVE` or unresolved consensus; no binary guess |
| Validator disagreement / consensus execution error | Claim remains `CHALLENGED`; timeout recovery remains available |
| Duplicate source URL | Rejected within one party; duplicate references across parties are fetched once |

## Trust boundary

The contract owns the committed text, criteria, source references, deadlines,
state, verdict fields, and economic settlement. The server only reads and
normalizes that state. The browser only requests user signatures. External web
pages are data, not instructions; the prompt places protocol instructions
outside explicit untrusted-data delimiters.

## Evidence semantics

Evidence is evaluated at **resolution time**. A URL is not an immutable archive.
`artifact_hash` is an optional hash supplied by the issuer for the referenced
artifact; the contract does not claim to archive or prove a webpage merely
because a URL is stored. If a page changes, disappears, or cannot be reliably
interpreted when validators fetch it, the protocol may return `INCONCLUSIVE` or
leave the challenge unresolved until timeout.
