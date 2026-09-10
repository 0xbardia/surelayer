# Phase 0 Research: SureLayer

## Decisions

### Intelligent Contract API

Use the current `py-genlayer` contract header and `genlayer` APIs. Persistent state uses explicit class-level annotations, `@allow_storage @dataclass`, `TreeMap`, and bounded scalar fields. Public read/write/payable methods are the contract boundary. User-facing failures use `gl.vm.UserError`.

### Nondeterministic resolution

`resolve_claim` runs a bounded evaluator inside `gl.nondet.exec_prompt` and `gl.nondet.web.get`. The custom validator independently fetches/evaluates the same claim, criteria, and evidence, then compares stable decision fields only: verdict, evidence state, criteria result, and supporting-source count. It never accepts a leader result because it is well-shaped. Natural-language summary is persisted only after consensus and is not an equivalence field.

### Evidence handling

URLs are validated and bounded at write time. The contract fetches only the stored bounded source set during nondeterministic execution, checks HTTP status/body availability, truncates extracted text, and labels unavailable or contradictory evidence. Evidence is explicitly delimited as untrusted data in the evaluator prompt. Raw pages are not stored on-chain.

### Economic design

Payable claim and challenge methods use real `gl.message.value`. Settlement credits are pull-based. Credits and locked liabilities are updated before the external transfer in `withdraw_credit`. Terminal transitions are one-way. An issuer can finalize an unchallenged claim after the deadline; anyone can recover both bonds after a challenged resolution deadline if consensus has not completed.

### Application integration

Use `genlayer-js` 1.1.8 for typed reads and transaction lifecycle normalization. Use `LATEST_FINAL` for irreversible/accounting views. Browser writes require a user wallet/provider; the app never contains a private key. The server provides read/status/health routes but does not adjudicate claims.

### Testing

Use `genlayer-test` 0.30.0rc2 direct mode for fast state-machine and accounting tests, including mocked web/LLM responses and direct validator invocation. Studio mode is an integration gate and requires an available Studio/authenticated wallet session. Direct mode cannot prove multi-validator network consensus, so the adversarial validator tests are required evidence of validator behavior, not a substitute for Studio finalization.

## Official sources consulted

- [Intelligent Contract basics](https://docs.genlayer.com/developers/intelligent-contracts/first-contract)
- [Storage](https://docs.genlayer.com/developers/intelligent-contracts/features/storage)
- [Equivalence Principle and custom validators](https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle)
- [Non-determinism](https://docs.genlayer.com/developers/intelligent-contracts/features/non-determinism)
- [Web access](https://docs.genlayer.com/developers/intelligent-contracts/features/web-access)
- [LLM calls](https://docs.genlayer.com/developers/intelligent-contracts/features/calling-llms)
- [Value transfers](https://docs.genlayer.com/developers/intelligent-contracts/features/value-transfers)
- [Transaction context](https://docs.genlayer.com/developers/intelligent-contracts/features/transaction-context)
- [Messages and lifecycle](https://docs.genlayer.com/developers/intelligent-contracts/features/messages)
- [Error handling](https://docs.genlayer.com/developers/intelligent-contracts/features/error-handling)
- [Contract testing](https://docs.genlayer.com/developers/intelligent-contracts/testing)
- [GenLayer Studio](https://docs.genlayer.com/developers/intelligent-contracts/tools/genlayer-studio)
- [GenLayer deployment](https://docs.genlayer.com/developers/intelligent-contracts/deploying)
- [genlayer-js](https://docs.genlayer.com/api-references/genlayer-js)
- [Reading data](https://docs.genlayer.com/developers/decentralized-applications/reading-data)
- [Writing data](https://docs.genlayer.com/developers/decentralized-applications/writing-data)
- [Transaction querying](https://docs.genlayer.com/developers/decentralized-applications/querying-a-transaction)
