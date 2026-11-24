# EventFlow app (frontend)

React Native + Expo (SDK 58), TypeScript strict, web (PWA) first. Built against the real API in
`docs/EventFlow_API_Contract_v0.1.yaml`; no mock data in the app.

## Run

```bash
npm install
cp .env.example .env        # set EXPO_PUBLIC_API_URL if the API is not on localhost:8080
npm run web                 # dev server
npm run build:web           # static build in dist/
```

Until the Sign in page exists the token store is empty, so Home shows "You're not signed in."

## Checks

```bash
npm run lint && npm run typecheck && npm test
npm run gen:api             # regenerate src/api/schema.d.ts after changing the YAML
```

Proposed contract fields for Home are listed in `docs/CONTRACT_CHANGES.md`.
