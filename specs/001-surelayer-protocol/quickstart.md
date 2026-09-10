# SureLayer quickstart

## Contract tests

```bash
uv venv .venv
uv pip install --python .venv/bin/python genlayer-test==0.30.0rc2
.venv/bin/pytest -q
```

Direct tests download/use the GenLayer runner selected by the contract dependency header. They do not claim network consensus; validator adversarial tests call the captured validator independently.

## Web application

```bash
npm install
cp .env.example .env
npm run dev
```

Set the public contract address only after a final Studio deployment. With no configured address the app must show an explicit configuration/empty state rather than demo data.

## Production verification

```bash
npm run build
npm run start
npm run e2e
```

The Playwright suite exercises landing, browse, detail, create, and status/error states at desktop, mobile, narrow mobile, and 125% zoom. It records console/page errors and fails on horizontal overflow or unexpected network failures. Wallet signatures are intentionally not automated without a user-controlled wallet.

## Studio

Deploy the exact `contracts/SureLayer.py` source through the current Studio workflow, wait for finalization, record the public compatibility result in `docs/DEPLOYMENT.md`, configure the app, restart it, and call every public read method against that final address. A rebuild is not required for a contract-address-only change. Wallet/auth/signature prompts are external gates and must not be bypassed or fabricated.
