# QA

QA is evidence about the current source and configured runtime, not a promise
that an arbitrary contract or external evidence URL will always resolve.

## Local gates

```bash
npm run typecheck
npm run test:contract
npm run build
npm run e2e
npm run verify:runtime
npm audit --audit-level=high
```

The Playwright suite starts an isolated production server with configuration
explicitly disabled. It covers landing, claims, claim detail, create, account,
wallet/error boundaries, keyboard focus, reduced motion, responsive widths,
horizontal overflow, console errors, page errors, failed requests, and server
errors. Reports and screenshots are written to ignored `test-results/`.

The capture-only GenLayer routing check covers all application write methods:

```bash
node scripts/verify-genlayer-write-routing.mjs
```

It verifies the protocol router destination, `addTransaction` submission path,
decoded Intelligent Contract recipient, method, arguments, payable value, and
chain ID without sending a transaction.

## Production smoke checks

For a configured deployment, run:

```bash
npm run verify:runtime
curl -fsS https://<your-app>/api/health
```

Then inspect the public app in Chromium at desktop, mobile, narrow mobile, and
an effective 125% desktop layout. Check `/`, `/claims`, `/claims/<id>`,
`/create`, and `/account`.

For the V4 signature surface, also review the assurance instrument hero, dark
protocol trace, verdict fields, issuance preview, pending transaction states,
empty states, focus treatment, and `prefers-reduced-motion`. Confirm that the
conceptual consensus animation is clearly labeled and never implies live
validator data.

Do not automate or repeat economic writes merely to create screenshots. A
wallet signature, EVM submission, GenLayer consensus decision, and finalized
execution result are separate states. A transaction hash alone is not a
successful protocol result.

## Review checklist

- Runtime contract/network/chain matches `.env` and `/api/config`.
- Health reports RPC and contract readability honestly.
- Reads are finalized and no stale contract-specific state is shown.
- Wallet writes stop at the user-signature boundary and target the decoded
  configured Intelligent Contract recipient.
- Pending writes survive refresh and never become duplicate submissions.
- Claims, evidence, URLs, errors, and verdict states render as untrusted data.
- No critical console, hydration, network, CSP, or mixed-content error exists.
- Responsive layouts have no horizontal overflow and preserve visible focus.
