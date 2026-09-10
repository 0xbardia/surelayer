# Feature Specification: SureLayer Economic Assurance Protocol

**Feature Branch**: `001-surelayer-protocol`

**Created**: 2026-09-08

**Status**: Implementation-aligned review draft

**Input**: User description: Build SureLayer from the repository state into a
submission-grade GenLayer dApp for economically assured AI-agent claims.

## Clarifications recorded during implementation review

- **Configuration source**: the deployed contract uses a parameterless
  constructor with explicit default bond/window values. `get_config()` is the
  runtime authority; the frontend does not treat local defaults as deployment
  truth.
- **Evidence cardinality**: each side may provide zero to four bounded source
  URLs. A challenged claim with no reliable evidence resolves to
  `INCONCLUSIVE`, not to a fabricated binary verdict.
- **Unchallenged finalization**: only the issuer may finalize an OPEN claim at
  or after the challenge deadline. Timeout recovery for a challenged claim is
  permissionless.
- **Stable client lifecycle**: the target is stable `genlayer-js` 1.1.8 on
  Studionet, so writes wait for `FINALIZED` and require
  `FINISHED_WITH_RETURN`; v2 RC-only helpers are not mixed into the stable
  deployment.

## User Scenarios & Testing

### User Story 1 - Create and Assure a Claim (Priority: P1)

An issuer connects a wallet, writes a specific bounded claim about an AI
output, defines the warranty criteria, provides a small set of evidence source
URLs and an optional artifact hash, and locks a GEN claim bond. The issuer can
see exactly what is locked, when the challenge window ends, and what outcomes
are possible.

**Why this priority**: A real warranty cannot exist without a claim backed by
real economic value. This is the minimum useful protocol slice.

**Independent Test**: A funded issuer can submit a valid claim, wait for the
transaction's actual consensus/execution outcome, then read the final claim
state and bond amount from the protocol.

**Acceptance Scenarios**:

1. **Given** a connected wallet with enough GEN, **when** the issuer submits a
   bounded claim with a bond at or above the configured minimum, **then** the
   payable contract call records the issuer, criteria, bounded evidence list,
   bond, creation time, deadline, and OPEN state only after the transaction
   reaches the displayed finality point.
2. **Given** a claim with an empty, oversized, malformed, or over-limit field,
   **when** the issuer submits it, **then** the contract rejects it with a
   specific recoverable error and no bond is treated as locked.
3. **Given** a claim submission is processing, **when** the wallet or
   consensus layer fails, **then** the UI distinguishes signing, processing,
   rejected, undetermined, canceled, and finalized outcomes and never shows a
   successful claim optimistically.

---

### User Story 2 - Challenge and Resolve a Warranty (Priority: P1)

A challenger opens an eligible claim before its deadline by posting the
configured challenge bond and bounded reason/evidence. The Intelligent
Contract independently evaluates the warranty criteria, claim, issuer
evidence, and challenger evidence through GenLayer consensus. It records one
of SUPPORTED, BREACHED, or INCONCLUSIVE, along with a bounded decision summary
and stable evidence-related fields.

**Why this priority**: Adjudication is the product's core differentiator and
must remain a real consensus decision rather than a backend boolean.

**Independent Test**: A valid open claim can be challenged exactly once; a
resolution can be reached through independent leader/validator evidence checks;
the resulting terminal state and economic credits match the verdict.

**Acceptance Scenarios**:

1. **Given** an OPEN claim before its challenge deadline, **when** a different
   wallet posts exactly the configured challenge bond with valid reason and
   evidence, **then** the claim becomes CHALLENGED and records one active
   challenge.
2. **Given** a claim is OPEN after its challenge deadline, **when** someone
   attempts to challenge it, **then** the contract rejects the call and does
   not alter liabilities or state.
3. **Given** a CHALLENGED claim, **when** the adjudication transaction runs,
   **then** the leader fetches and extracts bounded source data, validators
   independently repeat or source-ground the decision, and only a consensual
   structured result is persisted.
4. **Given** evidence is unavailable, contradictory, changed, malformed, or
   contains prompt-injection text, **when** validators cannot establish a
   reliable binary outcome, **then** the recorded verdict is INCONCLUSIVE or
   the transaction follows the defined recoverable consensus-failure path.
5. **Given** a malicious leader returns valid-looking JSON with a false
   verdict, **when** validators independently evaluate the evidence, **then**
   they reject the result and the false verdict is not persisted.

---

### User Story 3 - Receive the Correct Economic Outcome (Priority: P1)

After a final verdict, or after an eligible unchallenged/timeout recovery,
participants see their available GEN credit and can withdraw it once. The
protocol makes the economic consequence explicit before any irreversible
action.

**Why this priority**: Bond custody is the assurance mechanism. A correct
verdict without safe settlement is not a usable warranty.

**Independent Test**: Direct contract tests can run supported, breached,
 inconclusive, unchallenged, timeout, and withdrawal paths and prove that each
bond is credited exactly once and withdrawn at most once.

**Acceptance Scenarios**:

1. **Given** a SUPPORTED final verdict, **then** the issuer receives credit for
   the claim bond and challenge bond, while the challenger receives no verdict
   credit beyond any returned amount defined by the state machine.
2. **Given** a BREACHED final verdict, **then** the challenger receives credit
   for its challenge bond and the issuer's claim bond.
3. **Given** an INCONCLUSIVE final verdict, **then** issuer and challenger each
   receive credit for their own bond only.
4. **Given** an OPEN claim past its deadline, **when** the issuer calls
   unchallenged finalization, **then** the claim enters a terminal finalized
   state and the issuer receives its claim bond credit exactly once.
5. **Given** a CHALLENGED claim that cannot complete resolution within the
   documented timeout, **when** the timeout recovery condition is met, **then**
   both parties recover their own bond credits and no verdict settlement can
   later run.
6. **Given** a participant has available credit, **when** they withdraw it,
   **then** the credit is consumed before the external transfer is emitted and
   a second withdrawal attempt cannot pay them again.

---

### User Story 4 - Inspect the Protocol (Priority: P2)

A visitor can understand the protocol, browse bounded pages of claims, open a
claim detail page, inspect its evidence, artifact hash, state timeline,
deadline, verdict, and economic outcome, and see whether displayed state is
final, processing, demo-labeled, unavailable, or empty.

**Why this priority**: Assurance depends on legible evidence and state, not a
black-box button. Inspection also makes security assumptions reviewable.

**Independent Test**: With real configured reads or an explicitly labeled
empty network, a visitor can navigate landing, claims, detail, and credit
views without fake production data, dead controls, or horizontal overflow.

**Acceptance Scenarios**:

1. **Given** no configured live contract, **when** a visitor browses the app,
   **then** the UI identifies the network/configuration as unavailable or
   demonstration-only and does not invent claims, totals, addresses, or
   transaction history.
2. **Given** a readable live contract, **when** a visitor opens the claims
   page, **then** bounded pagination, loading, empty, and RPC error states are
   available and claim text/evidence is rendered as text rather than HTML.
3. **Given** a claim detail route, **when** the visitor views it, **then** the
   page shows claim identity, issuer/challenger addresses, criteria, bounded
   evidence links, state transitions, deadlines, verdict, finality, and
   economic consequence without exposing secrets.

---

### User Story 5 - Challenge or Withdraw with Clear Wallet Finality (Priority: P2)

A participant connects a wallet and uses the product to challenge an eligible
claim or withdraw an eligible credit. Before signing, the interface explains
the exact GEN value, protocol fee distinction, what can be lost, and when the
action becomes final. After signing, it follows the actual GenLayer
transaction lifecycle and offers retry/recovery guidance.

**Why this priority**: Participants need a coherent product flow across wallet
signing, consensus, finality, and recovery rather than raw transaction hashes.

**Independent Test**: Browser tests can exercise connect/disconnect states,
form validation, signing rejection, processing, final, failed, undetermined,
and retry states with a test provider or clearly isolated test fixture.

**Acceptance Scenarios**:

1. **Given** a wallet is not connected, **when** a participant selects a write
   action, **then** the product explains the required connection and never
   attempts a privileged server-side write.
2. **Given** a participant enters challenge data, **when** they submit it,
   **then** visible labels, inline errors, a focusable error summary, and a
   confirmation step explain the bond and deadline before wallet signing.
3. **Given** the wallet rejects a signature or the transaction is canceled,
   **then** the UI preserves entered data where safe, explains the failure,
   and provides a retry without claiming state changed.
4. **Given** a submitted transaction, **then** the interface shows processing
   stages and only enables final-state actions after the configured finality
   read confirms them.

## Edge Cases

- Unknown claim IDs and out-of-range pagination return a typed not-found/empty
  response rather than a server exception.
- Unicode claim, criteria, reason, and evidence text is accepted within byte or
  character bounds and is rendered safely.
- URLs must use an allowed HTTP(S) shape, have bounded length, and be stored as
  references; arbitrary backend fetching is not part of the product path.
- A zero-value claim or challenge, a second challenge, a challenge by the
  issuer, a challenge after the deadline, a second resolution, a terminal-state
  write, and an unauthorized withdrawal all fail safely.
- Timestamp equality at the deadline follows one documented rule: challenge
  is allowed only strictly before the deadline; finalization is allowed at or
  after it.
- Evidence source failure, empty response, redirect changes, malformed JSON,
  contradictory sources, stale pages, and prompt injection all degrade to
  bounded failure or INCONCLUSIVE behavior.
- Validator disagreement or exhausted consensus rotation does not mutate
  settlement state; the timeout path eventually unlocks both original bonds.
- RPC outage, stale contract configuration, wallet network mismatch, missing
  fee profile, insufficient GEN, and fee rejection are distinct user-facing
  errors with retry or configuration guidance.
- All user-controlled text and URLs are untrusted: no raw HTML execution,
  open redirects, arbitrary server-side URL fetches, or secret-bearing logs.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST represent a warranty as a bounded claim with a
  unique ID, issuer, statement, optional artifact reference/hash, criteria,
  bounded evidence sources, bond, timestamps, and explicit state.
- **FR-002**: The contract MUST accept a claim bond through real GEN payable
  semantics and reject values below the configured minimum.
- **FR-003**: The contract MUST enforce maximum lengths, source counts, URL
  shapes, non-zero values, and page sizes at the protocol boundary.
- **FR-004**: The contract MUST allow at most one active challenge per claim,
  enforce the challenge deadline, and require a configured challenge bond.
- **FR-005**: The adjudication decision MUST execute in a GenLayer
  non-deterministic consensus path where validators independently inspect the
  bounded claim criteria and evidence.
- **FR-006**: The validator MUST verify substance rather than only parsing or
  validating the leader's output shape, and it MUST reject malicious leader
  decisions that fail independent evidence evaluation.
- **FR-007**: The resolution result MUST be structured with one of SUPPORTED,
  BREACHED, or INCONCLUSIVE plus bounded summary and stable decision metadata;
  subjective prose MUST NOT be the equivalence key.
- **FR-008**: Unavailable, contradictory, ambiguous, changed, malformed, or
  prompt-injected evidence MUST never be treated as protocol instructions and
  MUST not force a fabricated binary outcome.
- **FR-009**: The state machine MUST include OPEN, CHALLENGED, SUPPORTED,
  BREACHED, INCONCLUSIVE, UNCHALLENGED_FINALIZED, and a challenged timeout
  recovery terminal state, with no terminal transition reuse.
- **FR-010**: Settlement MUST implement the stated economic outcomes and make
  each claim bond and challenge bond creditable exactly once.
- **FR-011**: The contract MUST expose pull-based credit accounting and a
  one-time withdrawal path that prevents unauthorized or duplicate withdrawals.
- **FR-012**: The contract MUST expose bounded, paginated reads for protocol
  configuration, claim summaries, claim detail, evidence, timeline, credits,
  liabilities, and state meanings.
- **FR-013**: The contract MUST provide unchallenged finalization after the
  challenge window and a non-censorable challenged timeout/failsafe recovery.
- **FR-014**: Tracked liabilities MUST never exceed the contract assets they
  represent, and accounting updates MUST be ordered safely around external
  value transfers according to current GenLayer semantics.
- **FR-015**: The application MUST normalize transaction lifecycle state and
  distinguish submission, consensus processing, accepted/decided, finalized,
  undetermined, canceled, failed, and execution result states.
- **FR-016**: Wallet writes MUST be signed by the participant's provider; no
  privileged private key or server wallet may be required for user actions.
- **FR-017**: The backend MUST provide typed, validated health, configuration,
  status, and contract-read access without becoming a competing source of
  truth or fetching arbitrary user URLs.
- **FR-018**: The application MUST offer landing, claims list, claim detail,
  create, challenge, credits, and withdrawal experiences with loading, empty,
  error, retry, wallet, finality, and unavailable states.
- **FR-019**: User-controlled text MUST render safely without HTML execution;
  external links MUST be validated and opened with safe attributes where
  applicable.
- **FR-020**: The product MUST be responsive at desktop, mobile, and narrow
  widths, keyboard navigable, screen-reader legible, visible-focus compliant,
  reduced-motion aware, and free of critical console/network/runtime errors.
- **FR-021**: Production code MUST not depend on demo fixtures, fabricated
  chain data, fake metrics, or a fallback mock contract.
- **FR-022**: The repository MUST document the GenLayer necessity gate,
  contract state machine, threat model, security findings, testing evidence,
  deployment context, current limitations, and reviewer-facing submission
  narrative.

### Key Entities

- **Claim**: The issuer's bounded statement, criteria, artifact reference/hash,
  evidence sources, claim bond, deadlines, state, and timeline.
- **Challenge**: One challenger address, reason, bounded evidence, challenge
  bond, and timestamp linked to a Claim.
- **Resolution**: A consensus-approved verdict, stable evidence decision fields,
  bounded summary, timestamp, and settlement marker linked to a Claim.
- **Credit**: Pull-based GEN liability owed to an address with withdrawal
  eligibility and consumed status represented by the credit balance.
- **Protocol Configuration**: Minimum bonds, challenge window, resolution
  timeout, input bounds, and versioned network metadata.
- **Transaction Observation**: A client-side projection of submitted hash,
  consensus status, execution result, finality, retry state, and user-facing
  guidance; it is never treated as contract state until read back.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of contract state writes in the tested lifecycle require a
  finality-aware consensus result before the application presents definitive
  success.
- **SC-002**: Direct and adversarial contract tests cover every public method,
  every state transition, every settlement branch, duplicate withdrawal, all
  listed invalid-input classes, malicious leader output, validator disagreement,
  and evidence failure modes with zero known P0/P1 failures.
- **SC-003**: For supported, breached, inconclusive, unchallenged, and timeout
  scenarios, an invariant check demonstrates that each bond is credited once,
  withdrawn at most once, and total tracked liabilities remain bounded by
  controlled assets.
- **SC-004**: A first-time participant can identify the claim bond, challenge
  bond, fee distinction, loss condition, deadline, and finality rule before
  confirming every financially meaningful action.
- **SC-005**: The primary browse, create, challenge, detail, and credit routes
  render without horizontal overflow at 375 px, 768 px, 1024 px, and 1440 px
  viewport widths at 100% and 125% zoom.
- **SC-006**: Chromium QA records no critical console errors, unhandled promise
  rejections, hydration/runtime errors, failed application requests, or broken
  assets across representative desktop, mobile, and narrow-mobile flows.
- **SC-007**: Keyboard-only and reduced-motion checks complete the primary
  browse and form flows, with visible focus, accessible names, inline errors,
  error-summary focus, and status announcements present.
- **SC-008**: A clean production build starts with required environment
  configuration, fails clearly when required configuration is absent, and never
  exposes server-only secrets to browser output.
- **SC-009**: The final deployed source checksum, contract address, constructor
  values, transaction evidence, every public read-method result, and
  representative lifecycle write results are recorded without fabrication.

## Assumptions

- GenLayer's current target environment provides real GEN payable methods,
  current consensus/Equivalence Principle APIs, and a supported Studio or
  testnet deployment path; any environment mismatch is documented as a blocker.
- Users supply their own compatible browser wallet and are responsible for
  signing and paying protocol fees plus bond value.
- External evidence is referenced by bounded URLs and evaluated by the
  Intelligent Contract; the application does not proxy arbitrary evidence.
- The initial product uses one contract deployment and no competing database;
  derived caches may be discarded and rebuilt from contract reads.
- Live chain activity is shown only when the configured contract is readable.
  Empty or missing deployments are labeled explicitly rather than filled with
  sample activity.
- The v1 protocol supports one active challenge per claim and does not include
  administrative verdict overrides, appeals, slashing, or multi-party dispute
  rounds beyond the defined timeout recovery.
