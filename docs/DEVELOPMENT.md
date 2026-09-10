# Development

## Requirements

- Node 20+
- npm
- Python 3.12+
- Chromium for Playwright
- `uv` (or an equivalent Python environment manager) for contract tests

## Setup

```bash
npm ci
cp .env.example .env
# Set a compatible public contract and RPC in .env for live reads.
npm run dev
```

Create the contract-test environment once:

```bash
uv venv .venv
uv pip install --python .venv/bin/python genlayer-test==0.30.0rc2
```

## Commands

```bash
npm run typecheck
npm run test:contract
npm run build
npm run start
npm run e2e
npm run verify:runtime
```

`npm run e2e` builds and starts an isolated unconfigured test server. Its
reports and screenshots go to ignored `test-results/`; they are not source
documentation.

## Environment

`src/lib/config.ts` reads and validates these values at process start:

- `GENLAYER_NETWORK` — SDK network name, such as `studionet`.
- `GENLAYER_CHAIN_ID` — numeric chain ID matching the SDK network.
- `GENLAYER_CONTRACT_ADDRESS` — deployed, non-zero Intelligent Contract.
- `GENLAYER_RPC_URL` — credential-free public GenLayer RPC endpoint.
- `APP_URL` — absolute HTTP(S) application origin.
- `PROTOCOL_TEST_CLAIM_IDS` — optional IDs visibly labeled as protocol tests.

The public browser subset comes from the server runtime configuration endpoint;
the contract address is not a `NEXT_PUBLIC_*` build-time constant. Invalid
configuration fails clearly and never falls back to an old address, localhost,
demo state, or a mock contract.

## Switching a deployed contract

1. Deploy a compatible SureLayer Intelligent Contract.
2. Edit `.env` and set `GENLAYER_CONTRACT_ADDRESS=<new contract>`.
3. Restart only the application process: `pm2 restart surelayer`.
4. Run `npm run verify:runtime`.
5. Recheck the public application.

A contract-address-only change requires a restart but not a rebuild. A source
change still requires the normal build and deployment procedure.

The raw EVM destination of a wallet request may be GenLayer ConsensusMain or a
protocol Ghost/router. The GenLayer payload must decode to the configured
SureLayer Intelligent Contract recipient and expected method/arguments/value.
Use `node scripts/verify-genlayer-write-routing.mjs` for a capture-only check;
it does not submit a transaction.

## Working rules

Keep the contract source and application integration separate. A change to
`contracts/SureLayer.py` changes the deployed protocol and requires new direct
tests, a new deployment, fresh read/write compatibility checks, and an explicit
review. Do not put wallet keys or other credentials in the repository.
