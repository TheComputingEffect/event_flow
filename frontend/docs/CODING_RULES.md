# EventFlow — Coding Rules for AI Agents

> **Audience:** Claude or any AI coding agent (and human developers) building EventFlow.
> **Status:** v0.1 · 24 Nov 2026 · from SDLC Step 3 (System Design).
> **How to use:** put this file at the repo root as `CLAUDE.md` (or reference it from there) so the agent reads it every session.
> Every rule is **mandatory**. When a rule and a request conflict, or something is unclear, **stop and ask**. Never guess silently.

---

## 0. Read these first (source of truth, in order)

| # | File | What it decides |
|---|---|---|
| 1 | `EventFlow_PRD_Phase1_v1.0.html` | **What** to build: stories, acceptance criteria, edge cases (E-xx) |
| 2 | `EventFlow_BRD_Phase1_v1.0.html` | **Business rules** (BR-xx): money, profit, wages |
| 3 | `EventFlow_UI_Final_v4.pdf` | **How it looks** (with the UI changes listed in PRD §2) |
| 4 | `EventFlow_SystemDesign_Part1_Architecture_DB_v0.1.html` | Architecture, modules, **tables and columns**, constraints, indexes |
| 5 | `EventFlow_API_Contract_v0.1.yaml` | **Every API**: paths, requests, responses, error codes |
| 6 | `PERFORMANCE_RULES.md` | Speed rules (mandatory) |
| 7 | `RELIABILITY_RULES.md` | No double saves, transactions, offline sync (mandatory) |
| 8 | `quotation-module.zip` | Existing quotation code to **reuse**, not rewrite (gaps in PRD §8) |

- If two documents disagree, **stop and ask**. Do not pick one yourself.
- Never invent a feature, screen, field, table or API that is not in these files.
- **Approved changes not yet in the files:**
  - The **"Keep me signed in"** box is removed. Everyone is signed out after **60 minutes of no activity**. Ignore `keepSignedIn` in the API contract.
  - **No SMS OTP** in Phase 1.

---

## 1. The golden rules

1. **Simple first.** Write the simplest code that meets the acceptance criteria. No clever tricks, no "just in case" features (YAGNI: You Aren't Gonna Need It).
2. **Reuse before you write.** Before creating anything, search the codebase for an existing component, hook, service, util or type that does it. Use or extend it.
3. **One way to do each thing.** One API client, one money formatter, one date formatter, one error format, one form pattern, one list pattern. Never add a second way.
4. **Small steps.** One story (or one part of a story) per task. Small, reviewable changes beat one giant change.
5. **Follow the contract.** Backend and frontend both follow the API YAML exactly. Need a new or changed API? **Update the YAML first, get it approved, then code.**
6. **Tests prove it works.** Every story's acceptance criteria and edge cases get tests before the task is called done.
7. **Leave it cleaner.** Readable names, no dead code, no commented-out code, no leftover `console.log` / `System.out`.
8. **Ask, don't assume.** Unclear requirement, missing data, conflicting rules: ask one clear question.

---

## 2. Keep logic simple

- Functions do **one thing**, aim for **under 30 lines**. Files aim for **under 300 lines**; split when bigger.
- Max **3 levels of nesting**. Use early returns instead of deep `if/else`.
- Names say what things are: `calculateBalance`, `EventCard`, `usePayments`. No `data2`, `temp`, `handleStuff`, `utils2`.
- No magic numbers or strings: put them in named constants (`MAX_PAGE_SIZE = 100`, `IDLE_SIGN_OUT_MINUTES = 60`).
- Prefer plain code over patterns. Add an interface, factory, or abstraction only when there are **at least two real uses** today.
- No premature generalization: copy once is fine; when the **third** copy appears, extract a shared piece (rule of three).
- Comments explain **why**, not what. Business rules get a reference: `// BR-25: apply oldest event first`.
- Business rules live in **one place** (backend service). The frontend never re-implements profit, balance or wage maths; it shows what the API returns.

---

## 3. Reuse: where shared code lives

### 3.1 Backend (Java 21 + Spring Boot 3)

```
com.tce.eventflow
├── common/          ← shared by all modules (small and stable)
│   ├── api/         ApiResponse, ApiError, PagedResponse, GlobalExceptionHandler
│   ├── money/       Money helpers (BigDecimal, scale 2, rounding)
│   ├── tenant/      CompanyContext (company from token), RLS setup, Hibernate filter
│   ├── audit/       ChangeHistoryWriter
│   ├── time/        Clock + India time zone helpers
│   └── pdf/         PDF builder (reused by quotes and reports)
├── auth/   events/   payments/   expenses/   crew/
├── quotations/   money/   notifications/   settings/   audit/
```

- Each module has the same shape: `XController` → `XService` → `XRepository`, plus `dto/` (records) and `XEntity`.
- **Controllers are thin:** validate input, call one service method, return the response. No business logic in controllers.
- **Modules talk only through public services**, never through another module's repository or tables (e.g. Quotations calls `EventsService.createFromQuote(...)`).
- Use the existing `ApiResponse` / `ApiError` / `PagedResponse` / `GlobalExceptionHandler` from the quotation module. Do not create new response wrappers.
- Settings lists (event types, crew roles, expense categories, item groups) share **one generic "named list" service and controller pattern**. Don't write four copies.
- Reuse the quotation module's calculation engine (subtotal, discount, round-off), versions and PDF layout. Adapt it (company id, UUIDs, fixes Q-1 to Q-10); don't rewrite it.

### 3.2 Frontend (React Native + Expo, TypeScript)

```
src/
├── api/            generated client + types from the API YAML (never hand-written)
├── components/ui/  Button, Card, Input, AmountInput, Chip, Badge, Sheet, EmptyState, Skeleton, ListItem
├── components/     shared business pieces: MoneyText, StatusBadge, ClientRow, EventCard, PaymentRow
├── features/       one folder per module: home, events, calendar, payments, expenses, crew, quotations, money, notifications, settings, auth
├── hooks/          shared hooks (useOffline, useOutbox, useDebounce)
├── storage/        ONE storage layer (IndexedDB on web, SQLite on apps)
├── theme/          colours, spacing, fonts (from the final UI); no hard-coded colours
└── utils/          formatMoney, formatDate, phone, validation
```

- **Every screen is built from `components/ui`.** If a UI piece repeats on 2+ screens, it becomes a shared component.
- One `formatMoney` (₹ with Indian grouping: `₹1,50,000`), one `formatDate` (`Sun, 1 Nov 2026`). Never format inline.
- Forms: one pattern (e.g. React Hook Form + Zod), schemas shared per form. Same validation messages everywhere.
- Data: **TanStack Query** hooks per feature (`useEvent(id)`, `useRecordPayment()`), built on the generated API client.
- Platform differences (web vs app) live **only** in `storage/` and small platform files (`*.web.ts` / `*.native.ts`), never scattered through screens.

---

## 4. Non-negotiables (security and money)

Full detail comes in `SECURITY_RULES.md`; until then these are mandatory:

- **Company isolation:** `company_id` comes **only** from the signed-in token, never from the request. Every query is filtered by company, and PostgreSQL row-level security is on for every company table. Another company's record answers **404**.
- **PIN:** stored with **bcrypt**, never in plain text or logs. 5 wrong tries → locked 15 minutes. Block 0000, 1234 and four same digits. First login forces a PIN change.
- **Sessions:** access token 15 min, rotating refresh token stored hashed, **one active device per user**, **signed out after 60 minutes idle**. No background API calls that would keep a session alive.
- **Feature flags** checked on the server (403 `FEATURE_DISABLED`), not only hidden in the app.
- **Money:** `NUMERIC(14,2)` in the database, `BigDecimal` in Java, **strings** in JSON, a decimal library in TypeScript. Never `float`/`double`/JS `number` for money maths.
- **Totals are calculated, never stored or typed in** (received, balance, profit, owed).
- **Secrets** (DB password, JWT keys) come from environment variables. Never in code, Git, logs or the app bundle.
- **Validate every input** on the server (Bean Validation); parameterized queries only (no string-built SQL).
- Never log PINs, tokens or bank account numbers. Never send stack traces to the app.

---

## 5. Data and API rules (summary)

- IDs are **UUIDs**. Payments, expenses and crew payments use an **ID created by the app** (offline-safe, idempotent).
- Every schema change is a **Flyway migration**. Never edit an applied migration; add a new one.
- Use the tables and columns from the System Design doc. A new column or table needs approval and a doc update.
- Every list API is paged (`page`, `size` ≤ 100).
- Error codes come from the contract (`STALE_VERSION`, `FEATURE_DISABLED`, …). Add a new code only with a contract update.
- Edits and deletes of money rows: **soft delete** + **change history** in the same transaction.
- Multi-row actions run in one transaction (see `RELIABILITY_RULES.md` §1).

---

## 6. Dependencies

- Prefer what the stack already gives you (Spring Boot, JPA, Expo SDK, TanStack Query).
- A new library needs a reason: it is well-maintained, widely used, and saves real work. State the reason in the PR. No library for something a few lines of code can do.
- Pin exact versions. Never add two libraries that do the same job (e.g. two date libraries, two HTTP clients).

---

## 7. Testing

| Layer | What | Tool |
|---|---|---|
| Backend unit | Business rules: balance, profit (both), wages allocation, discount, round-off, refunds | JUnit 5 |
| Backend integration | Each API against a real PostgreSQL: happy path, edge cases (E-xx), company isolation, query-count limits | Spring Boot Test + Testcontainers |
| Frontend unit | Utils (money, dates, validation), hooks | Jest |
| Frontend component | Key screens and forms | React Native Testing Library |
| End to end (later) | Main journeys from PRD §4 | Playwright (web) |

- Every acceptance criterion and every listed edge case has at least one test, named after it: `US10_overpayment_needs_confirmation`, `E16_same_offline_payment_saved_once`.
- **Every API has a test proving another company cannot read or change its data.**
- Never delete, skip or weaken a test to make it pass. Fix the code.
- All tests must pass before a task is called done.

---

## 8. Workflow for each task (vibe coding)

1. **Restate** the task in 2–3 lines: which story (US-xx), which APIs, which screens, which business rules (BR-xx).
2. **Plan** briefly: files to create or change, and which existing code you will reuse. For anything bigger than one story, share the plan and wait for approval.
3. **Check the contract:** the APIs needed exist in the YAML. If not, stop and propose the YAML change.
4. **Write the code** in small steps, following the rules above.
5. **Write the tests** (acceptance criteria + edge cases).
6. **Run** build, lint, type check and tests. Fix all failures.
7. **Self-review** against the checklists in §11, `PERFORMANCE_RULES.md` §7 and `RELIABILITY_RULES.md` §7.
8. **Summarize:** what changed, what was reused, tests added, anything left open or assumed.

- Do not change files unrelated to the task. Do not "tidy up" other modules in passing.
- Do not refactor and add features in the same change.
- If you get stuck after two attempts, stop and explain what failed instead of trying random fixes.

---

## 9. Git and branches

- Branch flow (company rule): **feature branch → pull request → `staging` → `main`**. **Never push directly to `staging` or `main`.**
- Branch names: `feature/US-10-record-payment`, `fix/E-16-duplicate-sync`, `chore/setup-flyway`.
- Small commits with clear messages: `feat(payments): record payment with overpayment warning (US-10)`.
- One story or fix per pull request. The PR description lists the story, the APIs touched, the tests added and screenshots for UI changes.
- Never commit secrets, `.env` files, build output or `node_modules`.

---

## 10. Code style

- **Java:** Java 21 features where they make code simpler (records for DTOs, `var` for obvious types). Constructor injection only (no field `@Autowired`). Formatter: Spotless (Google Java Format).
- **TypeScript:** `strict: true`; no `any` (use `unknown` and narrow). Functional components and hooks only. ESLint + Prettier.
- Lint and format run automatically before commit and in CI. Code that fails lint is not done.
- English for all names, comments and messages. User-facing text follows the PRD wording exactly.

---

## 11. Definition of done (checklist for every task)

- [ ] Matches the PRD story and acceptance criteria; UI matches the final UI (plus PRD §2 changes)
- [ ] Reused existing components, services and utils; no duplicate logic added
- [ ] Simple: small functions, clear names, no unused code, no speculative features
- [ ] APIs exactly as in the YAML (or the YAML was updated and approved first)
- [ ] Company isolation, money and session rules (§4) respected
- [ ] Performance and reliability checklists passed
- [ ] Tests added for criteria and edge cases, including the company isolation test; all tests green
- [ ] Lint, format and type check clean
- [ ] Short summary written: what changed, what was reused, what is open

---

## Appendix — How TCE gives tasks to the agent (for humans)

- Start each session with: *"Read CLAUDE.md and the files in §0. Then do: \<task\>."*
- One task at a time, named by story: *"Build US-10 Record payment: backend API and screen."*
- Good order to build in: Setup → Auth (US-01/02) → Settings lists → Clients → Events (US-04 to US-09) → Payments → Expenses → Offline sync → Crew → Quotations (integrate) → Home → Money & Stats → Notifications.
- Ask for the **plan first** on bigger tasks, approve it, then let it code.
- After each task, review its summary and run the app yourself before merging.
- When the agent asks a question that changes the product, answer it and update the PRD or contract so the next session knows.
