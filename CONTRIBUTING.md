# Contributing to SureLayer

Thanks for taking an evidence-first approach to protocol work.

## Setup

```bash
npm ci
cp .env.example .env
npm run dev
```

For contract tests:

```bash
uv venv .venv
uv pip install --python .venv/bin/python genlayer-test==0.30.0rc2
```

## Before opening a change

Run the checks relevant to the change, and normally the full local gate:

```bash
npm run typecheck
npm run test:contract
npm run build
npm run e2e
npm audit --audit-level=high
```

Keep changes small, preserve the runtime `.env` configuration model, and do
not add mock production state. User-controlled wallet writes must remain at the
wallet-signature boundary and must represent GenLayer finality honestly.

## Contract warning

Do not edit `contracts/SureLayer.py` as part of an application-only change. A
contract edit changes the deployed protocol and requires a new deployment,
source-hash review, interface compatibility check, and fresh network evidence.
It must never be presented as equivalent to an existing deployment.

The raw EVM destination of a GenLayer wallet request may be a consensus/router
contract. Tests should decode the protocol payload and verify the intended
Intelligent Contract recipient, method, arguments, value, and chain instead of
assuming the raw `to` field is the application contract.

## Documentation and QA

Update durable architecture, contract, security, or testing documentation when
behavior changes. Do not add raw screenshots, process dumps, `.env` files,
wallet data, or temporary audit transcripts; browser output belongs in ignored
`test-results/`.

Use keyboard navigation and responsive Chromium checks for UI changes. Preserve
labels, visible focus, status text, reduced-motion behavior, and safe rendering
of external evidence.

## Security reports

Do not disclose a vulnerability in a public issue with secrets, private keys,
wallet credentials, or personal data. Follow [SECURITY.md](SECURITY.md) for
responsible reporting.

## License

SureLayer is licensed under the Apache License 2.0. See [LICENSE](LICENSE).
