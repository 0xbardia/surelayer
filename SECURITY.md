# Security policy

SureLayer handles user-signed wallet actions and real GEN bonds. Treat the
repository, deployment configuration, wallet, RPC provider, and external
evidence as separate trust boundaries.

## Reporting

Please do not publish an exploitable vulnerability, secret, private key, seed
phrase, wallet export, credential, or personal data in an issue. Use the
project's private security contact once one has been configured by the
maintainer. Until then, contact the repository owner through the private
channel associated with the project and provide a minimal reproducible report.

Include affected version/commit, impact, reproduction steps, and a proposed
mitigation when safe. Do not attempt attacks against the public deployment or
other users' wallets.

## Security boundaries

- `contracts/SureLayer.py` is the authority for claim state, deadlines,
  liabilities, credits, and settlement. The server cannot override a verdict.
- The browser requests wallet signatures; the server never stores a private
  key or signs on behalf of a user.
- GenLayer leader and validator consensus is required for semantic resolution.
  Consensus disagreement can leave a claim unresolved until the documented
  timeout path; the UI must not call that success.
- Evidence URLs are mutable, bounded public references. Web content is
  untrusted data, not protocol instructions or an immutable archive.
- The server exposes typed, read-only data and public runtime metadata. It does
  not fetch arbitrary user URLs or act as an evidence oracle.

## Contributor checks

Before submitting security-relevant work, run:

```bash
npm run typecheck
npm run test:contract
npm run build
npm run e2e
npm audit --audit-level=high
```

Review for environment leakage, unsafe external links, HTML injection, SSRF,
false finality, duplicate writes, stale contract configuration, and missing
security headers. Never add real environment values to fixtures, screenshots,
logs, or documentation.

## Known limitations

Consensus and public RPC providers can be unavailable. A URL can change or
disappear after a claim is created. An `INCONCLUSIVE` result or timeout is an
honest protocol outcome, not a reason to substitute demo data. Protocol and
SDK behavior should be re-verified before upgrades.

## License

SureLayer is licensed under the Apache License 2.0. See [LICENSE](LICENSE).
