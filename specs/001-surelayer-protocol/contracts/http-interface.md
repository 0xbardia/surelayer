# HTTP interface

The Next.js server exposes read-only normalization, not a competing protocol:

- `GET /api/health` returns application, RPC, and contract configuration/readability status.
- `GET /api/status` returns configured network/contract metadata and a final protocol stats read when configured.
- `GET /api/claims?offset=0&limit=12` returns a bounded final-state page.
- `GET /api/claims/:id` returns one final-state claim plus evidence/timeline projections.

Errors use a stable public shape:

```json
{
  "error": {
    "code": "RPC_UNAVAILABLE",
    "message": "The network could not be reached. Retry without resubmitting a wallet transaction."
  }
}
```

No route accepts arbitrary URLs, fetches user evidence, or returns secrets. Wallet writes are initiated by the browser and signed by the user.
