# Reviewer Q&A

**Q1. Why does this need GenLayer?** `resolve_claim` interprets bounded
natural-language criteria against live web evidence inside consensus; a normal
EVM contract cannot do that.

**Q2. Why not escrow + OpenAI API?** That makes the API operator the arbiter.
SureLayer requires independent validator evaluations before settlement.

**Q3. What stops a malicious Leader?** Validators rerun evidence retrieval and
evaluation and compare four stable decision fields. A mismatched Leader result
is rejected.

**Q4. What do validators independently verify?** The same claim, criteria,
source references, bounded source bodies, evidence condition, verdict,
criteria boolean, and unique supporting-source count.

**Q5. What happens when validators disagree?** Consensus does not authorize the
settlement; the claim remains `CHALLENGED` and can enter timeout recovery.

**Q6. Can unavailable evidence make someone lose a bond unfairly?** Missing,
empty, contradictory, stale, injected, or ambiguous evidence cannot become a
binary supported/breached result; it is `INCONCLUSIVE` or unresolved.

**Q7. Why is `INCONCLUSIVE` necessary?** It prevents the protocol from inventing
certainty when a binary economic decision is not supported by reliable data.

**Q8. Can the issuer challenge themselves?** No. `challenger == issuer` is a
rejected transition and creates no challenge liability.

**Q9. Can someone withdraw twice?** No. Credit is zeroed and `total_credits`
reduced before the external transfer. Direct Mode tests the second call, and
the final hosted `SUPPORTED`, `BREACHED`, and `INCONCLUSIVE` branches all
ended with zero credits after their eligible withdrawals.

**Q10. What if the webpage changes?** Semantics are resolution-time evidence.
The URL is not an archive; changed or ambiguous content can become
`INCONCLUSIVE`. Optional artifact hashes are metadata, not a webpage archive.

**Q11. What if the webpage contains prompt injection?** The contract marks
known injection markers, treats fetched text as data, and explicitly tells the
model not to follow claim/evidence instructions. Direct prompt-injection tests
settle conservatively.

**Q12. What if a transaction is Accepted but not Finalized?** The UI says
`Consensus pending`; it does not show a settled success.

**Q13. What if it Finalizes with execution error?** The client inspects the
stable SDK receipt's leader execution result (`SUCCESS`/`ERROR`) and shows a
failure without assuming state changed. No resubmission is automatic, and an
unresolved transaction ID is persisted so a retry cannot bypass lifecycle
checking after a page refresh.

**Q14. Who has admin power over verdicts?** No administrator exists in the
contract. Resolution and timeout recovery are permissionless within their
rules.

**Q15. Can the backend change a resolution?** No. It only performs typed reads;
the contract is the state source and there is no write proxy.

**Q16. Where is the economic consequence?** Real payable GEN enters the
contract; the accepted verdict credits one side, and `withdraw_credit` emits
the corresponding native transfer.

**Q17. Are 1 GEN and 0.5 GEN real values?** Yes: `u256(10**18)` and
`u256(5 * 10**17)` are compared with `gl.message.value`.

**Q18. Which outcomes were demonstrated on hosted validators?** The hosted
verification exercise covered `SUPPORTED`, `BREACHED`, and `INCONCLUSIVE`
branches with separate test accounts and completed eligible withdrawals. The
records were labeled protocol-test claims, not adoption data. Controlled-time
unchallenged and timeout paths remain Direct Mode because production windows
must not be shortened for QA.

**Q19. What is only Direct Mode?** Controlled time paths (unchallenged and
timeout), deterministic forced `BREACHED`/`INCONCLUSIVE` cases, malicious
Leader/validator disagreement, and adversarial parser/evidence fixtures.

**Q20. Largest limitation?** Evidence is evaluated from bounded public web
content at resolution time, so pages can change or disappear and hosted
providers can produce `INCONCLUSIVE` or consensus failure. The timeout path
protects bonded funds, but it does not make sources immutable or guarantee a
binary verdict.
