# Contract deployment and compatibility

This document describes the public workflow for deploying a compatible
SureLayer Intelligent Contract. It intentionally contains no private wallet,
host, process, or deployment-transaction data.

## Before deployment

Run the local contract checks and record the source hash outside the chain
workflow:

```bash
npm run test:contract
.venv/bin/genvm-lint contracts/SureLayer.py
sha256sum contracts/SureLayer.py
```

Do not change or redeploy the existing production contract as part of ordinary
application work. Any contract source change invalidates compatibility claims
for the existing address.

## Deploy through GenLayer Studio

Use the current official GenLayer Studio deployment flow with an authorized
wallet. Select the intended network, upload the exact `contracts/SureLayer.py`
source, wait for the deployment to reach the network's final state, and record
the resulting public Intelligent Contract address. Never put a private key,
seed phrase, or wallet export in this repository.

## Verify the deployed interface

Configure a local `.env` with the deployed public address:

```text
GENLAYER_NETWORK=studionet
GENLAYER_CHAIN_ID=61999
GENLAYER_CONTRACT_ADDRESS=<deployed address>
GENLAYER_RPC_URL=<credential-free RPC URL>
APP_URL=http://localhost:3000
```

Then run:

```bash
npm run verify:runtime
```

The verifier checks the runtime/public configuration, health, schema, required
read methods, and live finalized reads. It exits non-zero on configuration,
schema, or readability mismatch.

The public contract interface is documented in
[CONTRACT_SPEC.md](CONTRACT_SPEC.md). The required views are configuration,
state names, protocol stats, credits, claim detail, evidence, timeline, and
bounded pagination. The required writes are claim creation, challenge,
resolution, unchallenged finalization, timeout recovery, and credit withdrawal.

## GenLayer transaction routing

For wallet writes, inspect the generated request at the signing boundary. The
raw EVM `to` may be ConsensusMain or a Ghost/protocol router. That is expected
GenLayer architecture. The acceptance target is the decoded GenLayer
Intelligent Contract recipient, which must equal the configured address; the
encoded method, arguments, payable value, and chain ID must also match.

```bash
node scripts/verify-genlayer-write-routing.mjs
```

This command uses a capture-only provider and does not submit an economic
transaction.

## Application configuration switch

After deploying a compatible address:

1. Edit `.env` and set `GENLAYER_CONTRACT_ADDRESS=<new contract>`.
2. Restart only the SureLayer application process.
3. Run `npm run verify:runtime`.
4. Verify the public dApp and health endpoint.

Changing only this address does not require a rebuild because the browser gets
the public value from server runtime configuration. A source or dependency
change still requires a production build.
