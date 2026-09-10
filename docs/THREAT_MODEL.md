# SureLayer Threat Model

**Review scope**: Intelligent Contract, evidence consensus, GEN custody,
backend read surface, wallet writes, frontend rendering, deployment evidence.

## Assets

- Issuer claim bonds and challenger bonds held by the contract.
- Pull-based credit balances and the protocol's accounting invariants.
- Final claim state and verdict integrity.
- User wallet authority, transaction intent, and finality disclosures.
- Evidence provenance and the distinction between data and instructions.
- Contract address, runtime source, constructor values, and deployment evidence.

## Actors and trust assumptions

| Actor | Capability | Trust assumption |
|---|---|---|
| Issuer | Creates claims and may finalize an unchallenged claim | May lie; inputs are untrusted |
| Challenger | Challenges once with a bond and evidence | May grief or submit malicious evidence |
| Leader | Proposes one non-deterministic resolution | Untrusted and potentially malicious |
| Validators | Independently verify leader result | Consensus majority follows GenLayer protocol |
| Evidence host | Serves HTTP content | Fully untrusted; can change or inject text |
| Browser wallet | Signs user transactions | User controls it; provider may reject or be stale |
| RPC/Studio | Reports reads and transaction lifecycle | May be unavailable or return errors; client verifies |
| Backend | Provides typed reads/health | No custody, no verdict authority, no arbitrary URL fetch |
| Frontend | Renders untrusted chain/user data | Must not execute or fabricate data |

The protocol trusts the current GenLayer consensus and runtime implementation
for execution/finality, but it does not trust one leader, one evidence page, a
browser claim, or a backend boolean.

## Trust boundaries

1. Wallet/browser ↔ GenLayer RPC: user-signed writes cross this boundary; the
   app does not hold user keys.
2. Frontend ↔ backend: all request parameters and returned chain data are
   untrusted and schema-validated.
3. Intelligent Contract ↔ evidence web: bodies are untrusted data inside a
   bounded non-deterministic task, never executable instructions.
4. Leader ↔ validators: only stable substantive decision fields converge;
   leader prose is not trusted.
5. Contract state ↔ external EOA transfer: accounting is updated before a
   finalized external message; credits are pull-based.
6. Source ↔ deployment evidence: a source hash and final address bind the
   deployed artifact to the reviewed artifact; any contract edit invalidates
   prior evidence.

## Threats and controls

### T-01: Malicious leader fabricates a verdict

- **Impact**: Wrong bond redistribution.
- **Control**: `run_nondet_unsafe` validator independently fetches/evaluates
  the same evidence and compares stable verdict/evidence/criteria fields.
- **Test**: Inject a valid-looking false leader result and assert validator
  rejection; ensure no leader-output-only validator exists.

### T-02: Prompt injection in evidence

- **Impact**: A webpage tells an LLM to ignore protocol criteria or pay a party.
- **Control**: Explicit trusted/untrusted delimiters, instruction hierarchy,
  bounded extraction, no tool execution from evidence, and independent
  validator evaluation.
- **Test**: Evidence body containing `ignore previous instructions` cannot
  change protocol instructions; malformed/injected content yields disagreement
  or INCONCLUSIVE.

### T-03: Source is unavailable, empty, changed, or contradictory

- **Impact**: False certainty or consensus livelock.
- **Control**: Status/error checks, bounded content, explicit evidence states,
  INCONCLUSIVE fallback, and public timeout recovery.
- **Test**: Mock 4xx/5xx/empty/conflicting bodies and validator disagreement.

### T-04: Double settlement

- **Impact**: Contract promises exceed custody; insolvency.
- **Control**: Explicit terminal state, `settlement_done` marker, single transition
  guard, decrement locked liabilities once, and invariant assertions/tests.
- **Test**: Repeat resolve/finalize/timeout calls after every terminal state.

### T-05: Double withdrawal or unauthorized withdrawal

- **Impact**: Credit theft or duplicate payment.
- **Control**: Caller-keyed pull credits, zero-before-transfer ordering,
  `total_credits` update before external message, no withdrawal parameter for a
  target address.
- **Test**: second withdrawal, other-account withdrawal, zero credit, and
  external transfer failure behavior.

### T-06: Deadline bypass or state rollback

- **Impact**: Challenge after expiry or settlement after timeout.
- **Control**: Deterministic transaction time, strict-before challenge rule,
  issuer-only at/after unchallenged finalization, permissionless timeout
  recovery, and terminal state checks.
- **Test**: exact timestamp boundary, backward/forward warp, and terminal calls.

### T-07: Resolution censorship / permanent lock

- **Impact**: Funds remain trapped indefinitely.
- **Control**: Anyone may resolve; anyone may call timeout recovery after a
  bounded deadline; timeout is terminal and returns original bonds only.
- **Test**: challenged claim with no resolution and recovery after timeout.

### T-08: Input and resource denial of service

- **Impact**: Oversized prompts, loops, storage, or source counts exhaust
  execution and fees.
- **Control**: all text/URL/source/page/prompt/body/summary bounds; no scan over
  all claims; paginated reads; no raw webpage storage.
- **Test**: maximum fields, Unicode, maximum pages, oversized and too-many
  sources, malformed URLs.

### T-09: Backend SSRF or authority drift

- **Impact**: Server accesses internal hosts or becomes a hidden oracle.
- **Control**: backend never fetches user evidence URLs; it only reads the
  configured contract/RPC and exposes typed metadata/status.
- **Test**: no arbitrary URL endpoint; security review of outbound calls and
  environment exposure.

### T-10: Frontend XSS/open redirect

- **Impact**: User/evidence text executes code or redirects to a phishing site.
- **Control**: React text rendering, no `dangerouslySetInnerHTML`, strict
  `http(s)` external-link validation without embedded credentials,
  `noopener,noreferrer`, and CSP/security headers.
- **Test**: render hostile markup/URLs and inspect DOM/network behavior.

### T-11: Fake finality or transaction spoofing

- **Impact**: UI tells users a bond settled when only an EVM submission exists.
- **Control**: normalize stored GenLayer status and execution result; read
  `LATEST_FINAL` before enabling irreversible actions; preserve transaction
  hash/status details.
- **Test**: simulated pending/accepted/undetermined/canceled/finalized paths.

### T-12: Stale/misconfigured deployment

- **Impact**: Frontend reads or writes an unintended contract.
- **Control**: required env validation, network/chain ID checks, source hash and
  address documentation, health endpoint reporting configuration readability.
- **Test**: missing address, mismatched chain, unreadable contract, and build
  startup behavior.

### T-13: Hidden privileged control

- **Impact**: A server/admin can rewrite verdicts or drain funds.
- **Control**: no admin method, no server signing key, no verdict override,
  documented public methods only.
- **Test**: enumerate public schema and audit sources for privileged wallet use.

### T-14: Public read API exhaustion

- **Impact**: Repeated callers consume RPC quota or degrade a small deployment.
- **Control**: IDs, offsets, limits, and response shapes are bounded; the
  backend never proxies arbitrary URLs. Public hosting must add an edge/RPC
  quota appropriate to its deployment topology; a per-process limiter is not
  claimed as a distributed control.
- **Test**: exercise oversized/invalid query values and confirm bounded
  responses, safe errors, and no arbitrary outbound URL behavior.

## Residual risk

- Consensus can remain undetermined if validators cannot agree; timeout returns
  both original bonds but does not create a semantic verdict.
- Web evidence is time-dependent and URL ownership is not guaranteed. SureLayer
  proves a bounded consensus decision at resolution time, not permanent source
  truth.
- Final-source hosted lifecycle evidence now covers `SUPPORTED`, `BREACHED`,
  and `INCONCLUSIVE` with different issuer/challenger accounts, exact wei
  values, and completed withdrawals. Unchallenged finalization and challenged
  timeout recovery remain controlled-time Direct Mode paths because production
  windows remain 86,400 seconds.
- Protocol fee requirements and transaction lifecycle names can change with
  GenLayer releases; the SDK/runtime versions and fee profile must be pinned and
  re-researched before upgrades.
- A user can still make a bad claim or choose weak evidence; the protocol makes
  the warranty economically contestable, not universally truthful.

## Security review exit criteria

No P0/P1 finding remains open in contract custody, validator independence,
secret handling, XSS/SSRF, or false finality. All residual risks above appear in
the user-facing limitations and GenLayer submission narrative.
