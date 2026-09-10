# Contract interface

Public views:

- `get_config()`
- `get_claim(claim_id)`
- `list_claims(offset, limit)`
- `get_claim_evidence(claim_id)`
- `get_claim_timeline(claim_id)`
- `get_credit(address)`
- `get_my_credit()`
- `get_protocol_stats()`
- `state_name(state)`

Public writes:

- `create_claim(statement, artifact_ref, artifact_hash, criteria, issuer_sources)` payable; requires at least the configured claim bond. The deployed contract uses documented default configuration constants and exposes them through `get_config()`.
- `challenge_claim(claim_id, reason, challenger_sources)` payable; requires the exact challenge bond and an open claim before its deadline.
- `resolve_claim(claim_id)`; callable by any address while challenged and before the resolution deadline; consensus determines the verdict.
- `finalize_unchallenged(claim_id)`; issuer-only after the challenge deadline.
- `recover_challenge_timeout(claim_id)`; callable by any address after the resolution deadline.
- `withdraw_credit()`; caller-only pull withdrawal.
