# Roadmap

SureLayer's current release covers the first bounded assurance loop:

- bonded claims and one challenge per claim;
- GenLayer leader/validator evidence evaluation;
- `SUPPORTED`, `BREACHED`, and `INCONCLUSIVE` outcomes;
- unchallenged finalization and challenged timeout recovery;
- pull-based credits and one-time withdrawal;
- finalized read projections, wallet-bound writes, runtime configuration, and
  responsive browser QA.

The project deliberately has no indexer, admin verdict override, privileged
withdrawal, evidence archive, or centralized adjudication endpoint. These are
not implied roadmap commitments; they would change the trust and review scope.

Any future contract-source change reopens contract tests, deployment
compatibility checks, security review, and the public runtime verification. A
frontend-only release may change presentation without changing the deployed
protocol address or state machine.
