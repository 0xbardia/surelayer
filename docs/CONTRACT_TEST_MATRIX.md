# Contract test matrix

Command: `npm run test:contract` (`.venv/bin/pytest -q`)
Current result: **45 passed** after the final audit coverage addition.
Static result: `.venv/bin/genvm-lint contracts/SureLayer.py` → **3 checks passed**.

| Invariant / method | Actual test(s) |
|---|---|
| Constructor/configuration and initial state | `test_deploy_config_and_create_claim` |
| Claim bond: 0, 1 wei, `1e18-1` reject | `test_claim_bond_exact_wei_boundary_rejects_insufficient_values` |
| Claim bond: exactly `1e18` accepted | `test_claim_bond_exactly_one_gen_is_accepted` |
| Challenge bond: `5e17-1` reject, exact `5e17` accept | `test_challenge_bond_exact_wei_boundary` |
| Valid claim creation and stored bond | `test_deploy_config_and_create_claim` |
| Insufficient claim bond | `test_create_rejects_insufficient_bond`; boundary test |
| Empty/oversized fields and source count | `test_bounds_and_url_validation` |
| Malformed/private/credential evidence URLs | `test_rejects_private_or_credential_bearing_evidence_urls` |
| Duplicate source URL rejection | `test_duplicate_source_urls_are_rejected` |
| Maximum Unicode inputs | `test_maximum_unicode_inputs_and_duplicate_challenge_are_bounded` |
| Valid challenge | `test_challenge_bond_exact_wei_boundary`; settlement tests |
| Self-challenge | `test_issuer_cannot_self_challenge_or_create_challenge_liability` |
| Duplicate challenge | `test_maximum_unicode_inputs_and_duplicate_challenge_are_bounded` |
| Challenge after deadline | `test_challenge_guards_views_and_deadline_boundary` |
| Resolution before challenge / invalid resolution state | `test_terminal_guards_unknown_timeline_and_unauthorized_withdrawal` |
| `SUPPORTED` settlement | `test_challenge_and_supported_settlement` |
| `BREACHED` settlement | `test_breached_and_inconclusive_economic_outcomes` |
| `INCONCLUSIVE` settlement | `test_breached_and_inconclusive_economic_outcomes`; `test_non_available_evidence_state_cannot_settle_as_supported` |
| Malicious Leader output | `test_invalid_and_mismatched_leader_results_are_rejected` |
| Validator substantive disagreement | `test_validator_rejects_substantive_disagreement_without_mutating_settlement` |
| Unavailable evidence | `test_prompt_injection_and_unavailable_sources_degrade_to_inconclusive` |
| Contradictory evidence | `test_non_available_evidence_state_cannot_settle_as_supported` |
| Prompt injection | `test_prompt_injection_and_unavailable_sources_degrade_to_inconclusive` |
| Invalid JSON / trailing prose / wrong types / confusables / refusal | `test_structured_output_attacks_fail_without_settlement`; `test_malformed_llm_result_does_not_settle` |
| Same URL across parties fetched once | `test_same_source_across_parties_is_evaluated_once` |
| Timeout recovery before/at/after boundary | `test_challenge_and_timeout_recovery`; `test_timeout_recovery_is_allowed_at_exact_deadline` |
| Unchallenged finalization before/after boundary and authorization | `test_unchallenged_finalization_and_pagination` |
| Withdrawal settlement | `test_challenge_and_supported_settlement` |
| Double withdrawal | `test_challenge_and_supported_settlement` |
| Unauthorized withdrawal | `test_terminal_guards_unknown_timeline_and_unauthorized_withdrawal` |
| Double settlement / terminal immutability | `test_terminal_guards_unknown_timeline_and_unauthorized_withdrawal` |
| Unknown claim and timeline/evidence reads | `test_challenge_guards_views_and_deadline_boundary`; terminal test |
| Pagination boundaries | `test_unchallenged_finalization_and_pagination` |
| Liability/balance invariant | economic assertions in all settlement, timeout, and withdrawal tests; `_assert_liabilities` runs after each mutation |
| Pickling/storage runtime validation | autouse `enable_storage_pickling_validation` fixture in `tests/conftest.py` |
| Finalized/timeout timeline attribution | `test_challenge_guards_views_and_deadline_boundary`; `test_timeout_timeline_is_permissionless_not_consensus` |
| Evidence delimiter injection and required stable field | `test_prompt_delimiter_injection_is_treated_as_untrusted_evidence`; `test_structured_output_attacks_fail_without_settlement` |

## Coverage note

The suite is Direct Mode with controlled time and mocked evidence/LLM only for
test isolation. Hosted Studio evidence is recorded separately and is never
used to make Direct Mode tests pass. The exact final source also has a real
two-account hosted create → challenge → resolve → withdraw record for
`SUPPORTED`, `BREACHED`, and `INCONCLUSIVE`; the final stats are zero
liabilities and zero balance. Controlled time remains local-only so production
challenge and resolution windows are not shortened for QA.
