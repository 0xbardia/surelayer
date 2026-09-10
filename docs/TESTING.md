# Testing strategy

SureLayer uses a contract-first test pyramid.

## Contract and validator tests

`npm run test:contract` runs the direct GenLayer test suite. It covers:

- configuration, bounds, URL safety, and exact payable values;
- claim and challenge transitions, deadlines, sender checks, and duplicates;
- supported, breached, inconclusive, unchallenged, and timeout settlement;
- credit accounting, withdrawal ordering, and duplicate-withdrawal rejection;
- malicious leader output, validator disagreement, unavailable evidence, and
  prompt-injection handling.

Direct mode provides deterministic state-machine coverage and controlled test
time. It does not claim to reproduce multi-validator network consensus.

## Runtime and integration checks

`npm run verify:runtime` validates the local `.env`, runtime/public config,
health, deployed schema, required reads, and live finalized read calls. It
fails rather than using old configuration or mock data.

`node scripts/verify-genlayer-write-routing.mjs` captures, but does not submit,
one generated request for each application write. It decodes the GenLayer
protocol payload and verifies the configured Intelligent Contract recipient,
method, arguments, value, router, and chain.

## Application tests

`npm run typecheck` checks the application source. `npm run build` checks the
production artifact. `npm run e2e` runs Chromium against an isolated local
production server and checks routes, truthful configuration errors, finality
states, pending-write recovery, keyboard focus, reduced motion, responsive
layouts, console/page errors, and failed requests.

The browser suite uses controlled wallet/provider fixtures where needed. It
does not hold a private key and does not replace user authorization for an
economic write.

## Fresh checkout expectation

A new developer should be able to run `npm ci`, copy `.env.example` to `.env`,
configure a compatible public contract, and run the commands above. Generated
builds, browser output, Python environments, logs, and local environment files
are intentionally not part of the repository.
