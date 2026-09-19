# SureLayer Open-Source Audit

Audit started: 2026-09-10 16:11 UTC
Scope: repository hygiene and public-release readiness only. The deployed
Intelligent Contract and production configuration were not changed.

## Baseline before cleanup

- Production URL: `https://surelayer.bydx.fun`
- Runtime network: GenLayer Studionet
- Runtime chain ID: `61999`
- Historical baseline runtime contract: `0x5B0866dB817C7C99345D1e9EbEF3ae0627e00e93`
- Contract source SHA-256: `fe46c7b846b961ecc858d6f2669fa989b46549efbae9729e02958978a8081f81`
- Runtime health: application, RPC, and contract readability all reported OK.
- Runtime/public configuration: matched the active `.env` contract, network,
  and chain.
- Production process: the PM2 application named `surelayer` was online. The
  private host bind address and port are intentionally not recorded in this
  public document.
- Build artifact: the existing production build was present; its build ID
  artifact was timestamped `2026-09-10 14:24:23 UTC`.
- Existing quality baseline: TypeScript, production build, contract tests,
  browser tests, runtime verification, dependency audit, and public Chromium
  smoke checks had passed in the current working state before this cleanup.
- Git state: the repository is initialized but has zero commits and zero
  tracked files. There is no repository history to rewrite or audit.

## Inventory summary

| Classification | Current examples | Public-release decision |
|---|---|---|
| Required source | `src/`, `contracts/`, `public/` | Retain; contract source remains unchanged. |
| Required tests | `tests/`, `e2e/` | Retain; redirect generated output to ignored paths. |
| Required configuration | package manifest/lockfile, Next, TypeScript, Playwright, `.env.example` | Retain and document. |
| Durable documentation | architecture, contract, GenLayer, design, security, testing docs | Retain or sanitize. |
| Generated/local | `.next-test/`, browser reports, caches, bytecode, `node_modules/`, `.venv/` | Remove disposable outputs; keep host-only runtime installations ignored. |
| Private | `.env` | Retain locally for production; never publish or track. |
| Historical/internal | raw evidence and one-off audit/submission reports | Remove or consolidate into durable public guidance. |
| Local tooling | `.agents/`, `.specify/`, agent instruction files | Remove from the public tree after this audit. |

The complete candidate matrix was used temporarily during the audit and is not
part of the repository.

## Initial findings

1. The application source uses the server-side runtime contract configuration;
   no active `NEXT_PUBLIC_*` contract variable was found.
2. `docs/evidence/` contains generated screenshots, raw browser/network data,
   process diagnostics, and deployment traces that are not required to build
   or understand SureLayer.
3. Several historical documents duplicate durable contract, architecture, and
   testing material while containing private host paths, process details, raw
   hashes, or superseded deployment references.
4. The working tree had no `LICENSE` file at baseline. The rights holder later
   authorized Apache License 2.0, which is completed in the license-closure
   pass documented below.

## Hygiene requirements for the final tree

- `.env` and all local variants remain ignored; `.env.example` is the only
  environment file intended for publication.
- No private keys, seed phrases, credentials, cookies, API tokens, or secret
  RPC values may appear in source, docs, tests, fixtures, logs, or assets.
- Public documentation may explain blockchain architecture and the public demo
  URL, but will omit unnecessary server IPs, internal ports, absolute machine
  paths, PM2 IDs, and raw operational dumps.
- The final repository will be tested from a clean copy using the lockfile.

## Final audit

This section is completed after cleanup, scans, clean-copy verification, and
production regression checks.

## Cleanup completed

- Removed generated browser/pytest/compiler output and local agent/spec tooling.
- Removed the raw evidence bundle and one-off incident, submission, research,
  and historical deployment reports.
- Redirected Playwright reports to ignored `test-results/`; the public QA helper
  no longer writes screenshots into the repository.
- Removed production-specific host paths, IP/port details, process IDs, raw
  transaction evidence, test-wallet identifiers, and superseded contract
  addresses from the public documentation set.
- Retained the deployed contract source, application source, tests, public
  assets, lockfile, specifications, and durable architecture/security/design
  documentation. `contracts/SureLayer.py` was not modified.

## Final verification

- `.env` remains local and ignored; `.env.example` contains placeholders only.
- No `NEXT_PUBLIC_*` contract configuration or hardcoded historical contract
  address remains in active source, public docs, or the production build.
- Secret scan found no private-key material, seed phrase, real credential,
  token, cookie, or secret-bearing RPC URL. The only credential-shaped match is
  the intentional `user:pass@example.test` negative test fixture for URL
  validation.
- `npm ci` in a new temporary copy, `npm run typecheck`, and an unconfigured
  `npm run build` all passed. The temporary copy was removed afterward.
- `npm run test:contract`: 45 passed.
- `npm run e2e`: 51 passed across desktop, mobile, and narrow projects,
  including responsive, accessibility, finality, and pending-write regression
  coverage.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- The capture-only GenLayer routing verifier passed all six writes and sent no
  transaction.
- `npm run verify:runtime` passed after the production restart. Backend/public
  configuration and live reads matched the unchanged Studionet contract and
  chain.
- Public Chromium verification passed at 1280×900, 393×851, 320×568, and
  1024×720. Checked routes returned HTTP 200 with no console errors, page
  errors, failed requests, server errors, stale localhost requests, or
  horizontal overflow.
- After the final build, only the SureLayer PM2 process was restarted. Public
  HTTPS, redirect behavior, health, configuration, status, claims, and
  security headers remained healthy.
- The shared reverse-proxy configuration syntax check passed and the
  SureLayer TLS certificate was valid for the public hostname at audit time;
  unrelated shared-host deprecation warnings were not changed.
- The PM2 saved dump contains the SureLayer process without deployment
  configuration overrides. The host's generated PM2 systemd unit is enabled
  but currently inactive; no reboot was attempted on the shared host. This is
  an operational follow-up, not a repository secret or source dependency.

## License closure and release decision

- The root `LICENSE` contains the complete canonical Apache License 2.0 text.
- `package.json` declares `Apache-2.0`.
- `README.md`, `CONTRIBUTING.md`, and `SECURITY.md` identify the same license.
- No copyright owner or legal entity was invented in the license file.
- The direct production dependencies were reviewed; no copied third-party
  source or additional mandatory notice was identified.
- The repository has not been published automatically.

The final license-closure verification also confirmed that `LICENSE` is
byte-for-byte identical to the canonical Apache-2.0 text available on the
audit host. A fresh temporary copy passed lockfile installation, TypeScript,
and an unconfigured production build. The repository's contract tests (45),
Playwright suite (51), production build, high-severity dependency audit, and
Markdown link check passed without changing the deployed contract or
production `.env`.
