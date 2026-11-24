# EventFlow app

Read and follow `docs/CODING_RULES.md` (mandatory), plus `docs/PERFORMANCE_RULES.md` and `docs/RELIABILITY_RULES.md`.

- API types: `npm run gen:api` (from `docs/EventFlow_API_Contract_v0.1.yaml`). Never hand-write API shapes.
- Checks before done: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build:web`.
