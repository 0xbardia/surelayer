# Reviewer demo

Use the public demo at <https://surelayer.bydx.fun> when it is available. The
demo is live chain state, so its claim count and verdict mix may change. Do not
expect a fixed claim ID or treat protocol-test records as customer adoption.

1. Open the landing page and follow the explanation from bounded claim to
   evidence, consensus, finality, and credits.
2. Open **Browse claims** and inspect the rows, status labels, bond, and
   pagination state returned by the configured contract.
3. Open a populated claim, if one exists, and inspect the issuer, criteria,
   evidence references, timeline, deadline, verdict, and economic outcome.
4. Open **Create** and review the bond, protocol-fee distinction, evidence
   bounds, and wallet-signing boundary. Do not sign an economic transaction
   unless you are an authorized test participant.
5. Open **Account** to review connected/disconnected states, credits, and the
   withdrawal boundary.
6. Use [GENLAYER_REJECTION_DEFENSE.md](GENLAYER_REJECTION_DEFENSE.md) and
   [CONTRACT_SPEC.md](CONTRACT_SPEC.md) for the protocol rationale.

The UI should be judged on truthful state communication, not on a fabricated
demo dataset. A pending or unresolved consensus operation must remain visibly
pending or unresolved.
