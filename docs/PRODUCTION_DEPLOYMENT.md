# Production deployment

This is a host-neutral production runbook. Keep machine-specific paths,
reverse-proxy configuration, process dumps, logs, and private environment
files outside the public repository.

## Runtime configuration

Create `.env` on the host from `.env.example` and set the deployed public
network, chain, contract, RPC, and application origin. The production source
of truth for the contract is:

```text
GENLAYER_CONTRACT_ADDRESS=<compatible deployed contract>
```

The server validates the address and related network values at startup. The
browser receives only the explicit public configuration allowlist. It never
receives private environment values or signing credentials.

## Build and process

Install from the lockfile and build the application from the reviewed source:

```bash
npm ci
npm run typecheck
npm run build
```

Run `next start` under the host's process manager and put it behind HTTPS. A
PM2 deployment may use a named process such as `surelayer`; keep its
environment precedence documented and do not duplicate the contract address in
an ecosystem file when `.env` is the intended source of truth.

After the process starts:

```bash
npm run verify:runtime
```

The verifier checks `/api/config`, `/api/health`, the deployed schema, and
representative finalized reads. It must be run after every environment-only
contract switch.

## Contract switch without rebuild

1. Deploy a compatible SureLayer Intelligent Contract.
2. Edit `.env`:

   ```text
   GENLAYER_CONTRACT_ADDRESS=<new contract>
   ```

3. Restart only the SureLayer process:

   ```bash
   pm2 restart surelayer
   ```

4. Run `npm run verify:runtime`.
5. Verify the public HTTPS application.

A rebuild is **not** required for a contract-address-only change. The address
is read at process start and delivered to browser code through runtime config,
not compiled into a `NEXT_PUBLIC_*` contract constant.

## Health and security checks

Confirm that:

- `/api/health` distinguishes configuration, RPC, and contract-read failures;
- `/api/config` contains only public-safe, explicitly allowlisted fields;
- HTTPS redirects and certificates are valid;
- security headers, including CSP and HSTS, are present;
- no localhost or private host reference is used by the public browser;
- logs do not contain environment values, wallet secrets, or raw credentials;
- the contract recipient and chain remain the intended values after restart.

Do not reboot a shared host as part of an application deployment. If using PM2,
save and document the process state according to the host's normal startup
mechanism without changing unrelated applications.

The current public demo, when available, is
<https://surelayer.bydx.fun>.
