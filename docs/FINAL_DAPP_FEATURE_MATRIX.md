# SureLayer public feature matrix

This matrix describes the maintained product surface and its verification
path. Live values always come from the configured Intelligent Contract; the
repository does not include customer data or generated evidence bundles.

| Feature | Frontend | Backend/runtime | Contract dependency | Verification | Status |
|---|---|---|---|---|---|
| Landing | Product explanation, protocol flow, truthful CTA | Runtime status | None for copy; live status when configured | Chromium `/` | Covered |
| Wallet connect | Connect/disconnect and account state | None; browser wallet only | User account | Chromium wallet fixtures | Covered |
| Network detection | Wrong/disconnected network states | Runtime chain config | Configured chain ID | Browser/provider fixtures | Covered |
| Claims browse | Bounded rows, pagination, empty/error states | `/api/claims` final reads | `list_claims`, `get_protocol_stats` | Runtime verifier + Chromium | Covered |
| Claim detail | Claim, evidence, timeline, economics, verdict | `/api/claims/:id` | `get_claim`, evidence, timeline, state names | Runtime verifier + Chromium | Covered |
| Create claim | Bounds, evidence, bond, deadline, wallet boundary | Runtime config only | `create_claim` payable | Contract tests + routing capture + browser regression | Covered |
| Challenge | Eligibility, reason/evidence, exact bond, wallet boundary | Runtime config only | `challenge_claim` payable | Contract tests + routing capture | Covered |
| Resolution state | Pending, final, error, timeout and verdict display | Finality-aware status normalization | `resolve_claim` | Contract tests + browser finality fixtures | Covered |
| Unchallenged path | Deadline and finalization representation | Finalized reads | `finalize_unchallenged` | Contract tests + UI states | Covered |
| Timeout path | Recovery visibility and non-finality copy | Finalized reads | `recover_challenge_timeout` | Contract tests + UI states | Covered |
| Credits | Available balance, zero state, withdrawal boundary | `/api/credit` | `get_credit`, `get_my_credit`, `withdraw_credit` | Contract tests + account browser checks | Covered |
| Evidence display | Safe, readable external references | No evidence proxy | Stored bounded references | Contract bounds + Chromium rendering | Covered |
| Health/status | Honest configuration, RPC, and contract state | `/api/health`, `/api/status`, `/api/config` | Config and protocol reads | Runtime verifier | Covered |
| Errors | Recoverable validation, RPC, wallet, tracking, execution states | Typed public errors | Protocol rejection/finality | Contract and browser tests | Covered |
| Responsive | Desktop, mobile, narrow, focus, reduced motion | None | None | Playwright Chromium | Covered |
| Accessibility | Labels, focus, semantic state, readable values | None | None | Playwright keyboard/responsive checks | Covered |
| Runtime env switch | Browser consumes current process configuration | `.env` → runtime config | New compatible address | Restart + `npm run verify:runtime` | Covered |

## Truthful boundaries

The application does not claim a settled outcome from wallet approval or an
EVM transaction hash. It waits for the GenLayer transaction's required final
state and execution result. Wallet signing and real economic lifecycle tests
remain user-controlled boundaries.
