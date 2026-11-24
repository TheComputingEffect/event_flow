# EventFlow — Reliability Rules (for AI-assisted coding)

> **Audience:** Claude (or any developer) writing EventFlow code.
> **Status:** v0.1 · 24 Nov 2026 · SDLC Step 3, Topic 7 (agreed with TCE).
> **How to use:** keep in the repo at `docs/rules/RELIABILITY_RULES.md` and reference it from `CLAUDE.md`. Read it with `PERFORMANCE_RULES.md`.
> Every rule here is **mandatory**. If a rule cannot be followed, stop and ask; do not silently skip it.
> Goal: **never lose or double money data, keep working when things fail, recover fast.**

---

## 0. Targets

| Target | Value | Meaning |
|---|---|---|
| Uptime | **99.5 %** | Down at most ~3.5 h a month, including updates |
| RPO | **5 minutes** | Most data we may lose in a disaster |
| RTO | **1 hour** | Time to be back up after a disaster |
| Duplicate money rows | **0** | No payment, expense or crew payment is ever saved twice |
| Lost offline entries | **0** | Every offline entry is either synced or visibly marked "couldn't sync" |

Stack: Java 21 + Spring Boot 3 + JPA + PostgreSQL 16 · React Native + Expo (web first).

---

## 1. Transactions: all or nothing

- Every action that changes more than one row runs in **one** `@Transactional` service method. If any step fails, everything rolls back.
- These must be single transactions (with a test that forces a failure in the last step and checks nothing was saved):

| Action | Rows changed together |
|---|---|
| `POST /quotations/{id}/approve` | quote status · new event · event_items copied · advance payment |
| `POST /events/{id}/cancel` | event status · refund payment · unpaid event_crew removed |
| `POST /crew/{id}/payments` (+ edit/delete) | crew_payment · allocations · Salary expenses |
| Lent item add/edit/delete | event_item · its "Lent item" expense |
| `POST /events` with advance | event · client (if new) · payment |
| `POST /quotations/{id}/apply-to-event` | event amount · change_history |
| Any edit/delete of money | the row · change_history |

- Transactions stay short: **no HTTP calls, push sending or PDF generation inside them.** Do those after commit (`@TransactionalEventListener(phase = AFTER_COMMIT)`).
- Never catch and swallow an exception inside a transaction (this was quotation gap Q-5). Let it roll back and return a clear error.

---

## 2. No double saves (idempotency)

### 2.1 App-made IDs
- Payments, expenses, crew payments, event advances, refunds: the **app generates the UUID** (`crypto.randomUUID()` / `expo-crypto`) when the form opens, and **reuses the same ID on every retry**.
- Server: insert with the given ID. If the ID already exists **for this company** with the same content, return the existing row with `200` (not an error). If it exists with different content, return `409 ID_CONFLICT`.
- Implement with a primary-key check inside the transaction (`INSERT ... ON CONFLICT (id) DO NOTHING` then read back), never "check then insert" in two transactions.

### 2.2 UI
- Save buttons are disabled from the first tap until the response (or offline save) completes.

### 2.3 Concurrent edits
- `events` and `quotations` have a `version` column (`@Version`). PATCH requests must send it; a stale version returns `409 STALE_VERSION`. The app shows "This was changed elsewhere. Reload."
- **Quote numbers:** take the next number with `SELECT ... FOR UPDATE` on the company's `quotation_settings` row inside the create transaction. Unique index `(company_id, quotation_number)` as the safety net.
- **Crew payments:** lock the crew member row (`SELECT ... FOR UPDATE` on `crew_members`) while computing allocations, so two payments can't settle the same wage.

### 2.4 Database safety nets
- Keep every constraint from the system design doc (unique keys, `CHECK` amount signs, foreign keys with `RESTRICT`). Never remove a constraint to "fix" an error.

---

## 3. Offline sync (outbox)

### 3.1 On the phone
- Offline-capable actions: record payment, add/edit/delete expense, crew payment. Everything else shows "You're offline".
- Each offline action is written to a local **outbox** (IndexedDB on web, SQLite on apps) **before** the UI shows it as saved:
  `{ id, type, op, payload, createdOffline, status: WAITING | SYNCING | SYNCED | FAILED, error }`
- The outbox is kept per user and survives app close, the 60-minute sign-out and device sign-out (E-17). It is cleared only after `SYNCED`.
- Sync runs on: app open, sign-in, network back online, pull-to-refresh, and the "Retry" tap. **Never on a timer** (60-minute sign-out rule).
- Send all waiting entries in one `POST /sync`, oldest first, max 100 per call.
- Offline rows are shown with a "waiting to sync" badge until synced.

### 3.2 On the server (`POST /sync`)
- Process each entry in **its own transaction**; one failure must not roll back the others.
- Same ID already saved → `ALREADY_SAVED` (counts as success).
- Validation failures (event cancelled or deleted, future date, category inactive…) → `FAILED` with a clear `error.code` and message.
- For any `FAILED` entry, create one notification: "N entries couldn't sync. Tap to retry." (dedupe key per batch).
- Offline edits of an existing row use the row's `version`; a stale version → `FAILED` with `STALE_VERSION`, shown to the owner to redo.

### 3.3 Never lose an entry
- A `FAILED` entry stays in the outbox until the owner retries or deletes it **explicitly**. The app never drops it silently.

---

## 4. Never lose data

### 4.1 Backups (configured in Setup/Deployment, verified every month)

| Backup | Frequency | Kept for |
|---|---|---|
| Continuous WAL archive (point-in-time recovery) | every few minutes | 7 days |
| Full daily | nightly, ~2 AM IST | 7 days |
| Weekly | Sunday | 4 weeks |
| Monthly | 1st of month | 12 months |

- At least one copy is stored **in a different region or provider**.
- Backups are **encrypted**.
- **Monthly restore test** into a separate database: restore, run a row-count and totals check script, record the result. A failed test is treated as an incident.
- Developers never take ad-hoc dumps of production to their laptops.

### 4.2 No hard deletes of money or history
- Payments, expenses and crew payments use **soft delete** (`deleted_at`). Every query and total excludes them.
- Every create/edit/delete of money rows, events, quotes and settings writes `change_history` **in the same transaction**.
- `change_history` is append-only: no UPDATE or DELETE on it, ever.

### 4.3 Database changes
- All schema changes are **Flyway migrations** in Git, reviewed like code. Never change Production by hand.
- Migrations must be **backward compatible** with the app version currently running (add column → deploy code → later drop old column), so a deploy never breaks running apps.
- Big data changes run in batches, not one huge transaction.

---

## 5. Staying up

### 5.1 Health and restart
- `GET /api/v1/health` (Actuator) checks the app and the database connection. Returns `UP`/`DOWN` only; no internal details.
- The app runs with an automatic restart policy (container or service manager).
- An external uptime monitor calls `/health` every minute and alerts on 2 failures in a row.
- Graceful shutdown: `server.shutdown=graceful`, finish in-flight requests (30 s) before stopping.

### 5.2 Timeouts (nothing waits forever)

| Where | Timeout |
|---|---|
| Database statement | `statement_timeout = 5s` (reports/exports: 30 s, set per query) |
| DB connection from pool | 3 s |
| Any outgoing HTTP call (push, storage) | connect 3 s · read 10 s |
| App → API request | 15 s, then show "Couldn't reach server. Try again." (offline-capable actions go to the outbox) |

- Outgoing calls retry at most 3 times with backoff (1 s, 2 s, 4 s), only for safe or idempotent operations.

### 5.3 Background jobs
- Jobs: Upcoming → Pending (hourly), reminders (balance due, crew owed, lent return, event coming), notification creation.
- Every job is **safe to run twice** (dedupe keys on notifications; status changes check the current status first).
- Only one instance runs each job at a time: **ShedLock** (database lock) on every `@Scheduled` method, so adding a second server later never doubles reminders.
- A job failure for one company is logged and skipped; it does not stop other companies.

### 5.4 Errors
- One global exception handler returns the standard error envelope (`{success:false, error:{code, message}}`). **Never** send stack traces or SQL to the client.
- Unexpected errors return `500 INTERNAL_ERROR` with the request ID, so support can find it in logs.
- Every request has an `X-Request-Id` (generated if absent), put in the logging MDC and returned in the response.
- Logs are structured JSON with `requestId`, `companyId`, `userId`, path, status and duration. **Never log PINs, tokens, or full bank details.**
- Error tracking captures every backend exception and every app crash with the request ID (tool chosen in the third-party services topic, e.g. Sentry).
- App: an error boundary on every screen shows a friendly message with "Try again"; one broken screen never crashes the whole app.

---

## 6. Tests that prove reliability (Step 8)

- [ ] Approve, cancel and crew-pay: force a failure in the last step → nothing saved
- [ ] Same payment ID sent twice (sequential and in parallel) → one row
- [ ] Two parallel quote creates → two different numbers, no error
- [ ] Two parallel crew payments for one member → wages never over-allocated
- [ ] Stale `version` on PATCH → 409
- [ ] Offline: record 5 payments offline, sign out, sign in, go online → 5 synced, 0 duplicates
- [ ] Sync batch with one bad entry → others saved, one `FAILED`, notification created
- [ ] Kill the app server mid-request → restarts automatically, `/health` back to `UP`, no partial data
- [ ] Database slow query → times out at 5 s with a clean error
- [ ] Scheduled job run twice → no duplicate notifications
- [ ] Monthly restore test procedure run once on Staging before launch

---

## 7. Code-review checklist (every pull request)

- [ ] Multi-row changes inside one transaction; no swallowed exceptions
- [ ] No HTTP/push/PDF work inside a transaction (after-commit instead)
- [ ] Money creates accept an app-made ID and are idempotent
- [ ] `version` checked on event/quote updates
- [ ] Locks used for quote numbers and crew allocations
- [ ] Soft delete + `change_history` for money rows, in the same transaction
- [ ] Schema change is a backward-compatible Flyway migration
- [ ] New scheduled job: idempotent + ShedLock
- [ ] Errors use the standard envelope; nothing sensitive in logs
- [ ] Frontend: offline actions go through the outbox; no timer-based sync
