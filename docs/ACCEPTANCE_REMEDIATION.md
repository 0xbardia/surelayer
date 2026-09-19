# SureLayer Acceptance Remediation

This record covers the final-contract integration work. The frozen contract
source was not changed or redeployed.

## 1. Evidence poisoning

- Per-source rejection is preserved: unusable, empty, unavailable, and
  prompt-injection sources do not poison usable evidence or authorize a false
  verdict.
- Covered by the validator tests `test_valid_plus_unreachable_source_can_still_support`,
  `test_valid_plus_empty_source_can_still_support`,
  `test_valid_plus_prompt_injection_source_can_still_support`,
  `test_challenger_dead_url_cannot_grief_supported_claim`, and
  `test_issuer_dead_url_cannot_escape_breached_claim`.
- Live evidence-poisoning record: claim 6, resolution
  `0xe05bf00a37f6acc4b034e0040ce375a7aa3637709549bdee3ce5b5d63198b4a5`.

## 2. Artifact binding

- Artifact references require a paired canonical SHA-256 commitment.
- Resolution fetches the artifact and records `VERIFIED` only when the fetched
  bytes match the commitment; leader and validator adjudication remain
  separate.
- Covered by `test_artifact_commitment_requires_a_canonical_pair` and
  `test_verified_artifact_integrity_is_returned_after_resolution`.

## 3. Evidence pinning

- Create and challenge forms serialize up to four URL/hash pairs in the final
  ABI. Hashes must be `sha256:` followed by 64 lowercase hexadecimal digits;
  there is no server-side URL-fetch proxy.
- Resolution verifies the committed source bytes before adjudication.
- Covered by `test_evidence_commitments_round_trip_as_url_hash_pairs`, the
  validator source-integrity tests, and the create/challenge serialization
  E2E checks.

## 4. CI

- Workflow: `.github/workflows/ci.yml`.
- Triggers: `push` and `pull_request`.
- Direct-mode command explicitly enforces both
  `tests/test_surelayer_validator.py` and `tests/test_surelayer_contract.py`.
- The workflow also runs `npm ci`, `npm run typecheck`, and `npm run build`;
  it contains no production secrets, deployment, or funded transaction step.

## 5. Live lifecycle record — Reviewer #5 CLOSED

- Final contract: `0x4F8a90c42E04f194415fdd86aE26D379a5fACF51`.
- Independently completed live record: claim 2 `SUPPORTED`, resolution
  `0xe63613dcda225ae433ba4290369e4a0056e5dc6fd505f4d957ceaa5c6bd4ab92`.
  The issuer received 1.5 GEN and withdrew successfully.
- Independently completed live record: claim 3 `BREACHED`, resolution
  `0xb1f7cb6d74ca0d34725c85c128458455e3c84edde330929c6812f0bc609ab0b6`.
  The challenger received 1.5 GEN and withdrew successfully.
- Independently completed live record: claim 5 `INCONCLUSIVE`, resolution
  `0x66be8209e8f8257f2673b08d477c0eca9a96237dd8fa7ff062f52d58698de9a2`.
  The issuer received 1 GEN, the challenger received 0.5 GEN, and both
  withdrew successfully.
- Independently completed live evidence-poisoning record: claim 6, resolution
  `0xe05bf00a37f6acc4b034e0040ce375a7aa3637709549bdee3ce5b5d63198b4a5`.
  It settled `SUPPORTED` with one usable source while another was unavailable.

Reviewer #5 is CLOSED. Production cutover/readback is a separate release gate
and does not reopen the certified lifecycle review.

The local runtime and routing checks resolve writes to the final Intelligent
Contract. A fresh production readback was not completed in this run because
the configured public Studionet RPC returned its daily rate-limit error.
