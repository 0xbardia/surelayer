# SureLayer

Economic assurance for AI-agent claims, resolved by GenLayer consensus.

SureLayer lets an issuer put real GEN behind a bounded claim, lets another
party challenge it with a bond, and records an evidence-based outcome through
a GenLayer Intelligent Contract. The result is a legible economic warranty,
not an unverified backend promise.

## How it works

1. An issuer submits a statement, warranty criteria, optional artifact
   references, and bounded evidence while locking the configured claim bond.
2. A different wallet may challenge the claim before its deadline with the
   exact challenge bond.
3. `resolve_claim` fetches the stored evidence and evaluates it through
   GenLayer's non-deterministic consensus path. Validators independently
   check the substantive decision fields.
4. A consensual result settles one of `SUPPORTED`, `BREACHED`, or
   `INCONCLUSIVE`. An unchallenged claim and a timed-out challenged claim have
   explicit recovery paths.
5. Settlement creates pull-based credits. Each participant withdraws their own
   credit once; the contract remains the source of truth throughout.

`INCONCLUSIVE` is intentional: unavailable, contradictory, ambiguous, changed,
or prompt-injected evidence must not be turned into false certainty.

## Why GenLayer

The semantic operation is part of the Intelligent Contract execution. A leader
proposes a structured assessment, while validators independently retrieve and
evaluate the same bounded evidence before stable fields can settle the ledger.
A conventional EVM contract can hold a bond, but it cannot natively perform
this evidence interpretation. A centralized LLM would make its operator the
arbiter.

The browser and server use GenLayerJS for reads and wallet writes. A raw wallet
EVM transaction may target GenLayer ConsensusMain or another protocol routing
contract. The authoritative SureLayer target is the embedded Intelligent
Contract recipient and method in the GenLayer transaction payload.

## Repository layout

```text
contracts/SureLayer.py          # Intelligent Contract; do not edit casually
src/app/                        # Next.js routes and read-only API handlers
src/components/                 # wallet, forms, claims, status, and account UI
src/lib/                        # runtime config, typed reads, writes, and models
tests/                          # direct contract and validator tests
e2e/                            # Playwright browser regression tests
scripts/                        # runtime and GenLayer routing verification
docs/                           # durable architecture, security, QA, and design docs
specs/                          # protocol specification and implementation plan
public/                         # logo and other public assets
```

## Local setup

Requirements: Node 20+, npm, Python 3.12+, and Chromium for browser tests.

```bash
npm ci
cp .env.example .env
# Edit .env with a compatible deployed contract and public RPC endpoint.
npm run dev
```

Runtime configuration is read from `.env` when the server process starts:

- `GENLAYER_NETWORK` — SDK network name, normally `studionet`.
- `GENLAYER_CHAIN_ID` — numeric chain ID matching the SDK network.
- `GENLAYER_CONTRACT_ADDRESS` — non-zero deployed Intelligent Contract address.
- `GENLAYER_RPC_URL` — credential-free public GenLayer RPC endpoint.
- `APP_URL` — public origin used by metadata and local routing.
- `PROTOCOL_TEST_CLAIM_IDS` — optional IDs explicitly labeled as protocol-test
  records in the UI.

The server validates this configuration and exposes only an explicit public
allowlist through `/api/config`. No private key, mnemonic, signing credential,
or secret RPC value belongs in `.env`.

## Switching SureLayer Contract

1. Deploy a compatible SureLayer Intelligent Contract.
2. Edit `.env`:

   ```text
   GENLAYER_CONTRACT_ADDRESS=<new contract>
   ```

3. Restart only the application: `pm2 restart surelayer`.
4. Run `npm run verify:runtime`.
5. Verify `https://surelayer.bydx.fun` (or your configured `APP_URL`).

Changing only the contract address does not require a rebuild. The runtime
value flows from `.env` to the server configuration layer, API responses, and
browser wallet/read adapters. A normal source change still requires the normal
production build and release process.

## Testing and build

```bash
npm run typecheck
npm run test:contract
npm run build
npm run e2e
npm run verify:runtime
```

For contract tests, create the local environment once:

```bash
uv venv .venv
uv pip install --python .venv/bin/python genlayer-test==0.30.0rc2
```

The direct suite proves state transitions, accounting, bounds, and adversarial
validator behavior. It does not replace a real multi-validator network test.
Playwright tests run against an isolated unconfigured local production server;
wallet signing remains a user-controlled boundary. The routing verifier is
capture-only and submits no transaction:

```bash
node scripts/verify-genlayer-write-routing.mjs
```

## Deployment notes

Deploy `contracts/SureLayer.py` through the current GenLayer Studio workflow,
wait for finality, verify the public read schema, and configure the resulting
address in `.env`. The contract's public interface and economic lifecycle are
documented in [docs/CONTRACT_SPEC.md](docs/CONTRACT_SPEC.md). Contract source
changes require fresh deployment and fresh integration evidence; they are not
an application-only configuration change.

For a public deployment, put the Next.js process behind HTTPS and a suitable
process manager/reverse proxy for your host. Keep host paths, process dumps,
private environment files, and credentials outside the repository.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Contract specification](docs/CONTRACT_SPEC.md)
- [Why GenLayer](docs/GENLAYER_FIT.md)
- [Threat model](docs/THREAT_MODEL.md)
- [Security policy](SECURITY.md)
- [Development](docs/DEVELOPMENT.md)
- [Testing](docs/TESTING.md)
- [QA](docs/QA.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Production deployment](docs/PRODUCTION_DEPLOYMENT.md)
- [Frontend brand guide](docs/FRONTEND_BRAND_GUIDE.md)
- [Frontend premium plan](docs/FRONTEND_PREMIUM_PLAN.md)
- [Feature matrix](docs/FINAL_DAPP_FEATURE_MATRIX.md)
- [Contract test matrix](docs/CONTRACT_TEST_MATRIX.md)
- [Reviewer QA](docs/REVIEWER_QA.md)
- [Roadmap](docs/ROADMAP.md)
- [Contributing](CONTRIBUTING.md)

## Public demo and limitations

The current public demo is [surelayer.bydx.fun](https://surelayer.bydx.fun).
It is a live deployment, not a substitute for configuring and verifying your
own compatible contract. Evidence is evaluated from bounded public web content
at resolution time; URLs are not immutable archives. Consensus may remain
undetermined, in which case timeout recovery protects the original bonds but
does not invent a verdict. Protocol fees and GenLayer SDK behavior can change
and should be re-verified before upgrades.

## License

Licensed under the Apache License 2.0.
See [LICENSE](LICENSE) for details.
