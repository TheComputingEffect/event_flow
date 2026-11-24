# EventFlow — Performance Rules (for AI-assisted coding)

> **Audience:** Claude (or any developer) writing EventFlow code.
> **Status:** v0.1 · 24 Nov 2026 · SDLC Step 3, Topic 6 (agreed with TCE).
> **How to use:** attach this file to every coding session, or reference it from the repo's `CLAUDE.md`.
> Every rule here is **mandatory**. If a rule cannot be followed, stop and ask; do not silently skip it.
> Related: `EventFlow_SystemDesign_Part1_Architecture_DB_v0.1.html` (tables, indexes) and `EventFlow_API_Contract_v0.1.yaml` (APIs).

---

## 0. Targets (what "fast enough" means)

| Target | Value |
|---|---|
| Scale to design for (year 1) | 500 companies · 50 owners using the app at the same moment · ~100 events and ~1,000 payments per company per year |
| Load-test scale (2×) | 1,000 companies · 200 events and 2,000 payments each · 100 simulated users |
| API speed | **p95 < 300 ms** on the server for every API |
| Home screen | **< 2 s** on a throttled "Fast 4G" connection |
| Errors under load | **< 0.1 %** |
| Starting servers | App ~2 vCPU / 4 GB · managed PostgreSQL ~2 vCPU / 4 GB (final in Topic 9) |

Stack: **Java 21 + Spring Boot 3 + Spring Data JPA (Hibernate) + PostgreSQL 16** · **React Native + Expo (TypeScript)**, web build first.

---

## 1. Backend — database access

### 1.1 Every list is paged
- Every endpoint that returns a list takes `page` (default 0) and `size` (default 20, **max 100**). Enforce the max on the server.
- Use `Pageable` / `Slice`. Never return `findAll()` without a page on a company-scoped table.
- Only exceptions: small settings lists (event types, crew roles, expense categories, item groups). Even these are capped at 500 rows.

### 1.2 No N+1 queries
N+1 = loading N parents, then one more query per parent for its children.
- Load related data together: `JOIN FETCH`, `@EntityGraph`, or a second query with `WHERE parent_id IN (:ids)`.
- All `@ManyToOne` / `@OneToOne` are `fetch = FetchType.LAZY`. Never EAGER.
- Never call a lazy collection inside a loop over results.
- Set `spring.jpa.open-in-view=false`.

```java
// ❌ N+1: one query per event
events.forEach(e -> e.getPayments().size());

// ✅ one query for all payments of the page
List<UUID> ids = page.map(Event::getId).toList();
Map<UUID, List<PaymentView>> byEvent = paymentRepo.findByEventIdIn(ids)
    .stream().collect(groupingBy(PaymentView::eventId));
```

### 1.3 Query-count limits (enforced by tests)
Each API has a maximum number of SQL statements. A test fails if it is exceeded (use Hibernate `Statistics` or `datasource-proxy` in integration tests).

| API | Max SQL statements |
|---|---|
| `GET /dashboard/home` | 8 |
| `GET /events/{id}` | 6 |
| `GET /events`, `/quotations`, `/crew`, `/money/*` lists | 4 |
| Any write (`POST`/`PATCH`/`DELETE`) | 10 |
| `POST /sync` | 10 per entry |

### 1.4 Read only what the screen needs
- List and summary endpoints use **DTO projections** (interface or record projections, or `SELECT new ...`), not full entities.
- Never send entity objects directly as JSON.

### 1.5 Totals are calculated in the database
- Received, balance, expenses, profit, owed: compute with `SUM(...)`/`GROUP BY` in SQL, never by loading rows into Java and adding them up.
- Money columns are `NUMERIC(14,2)`; Java uses `BigDecimal`; JSON sends strings (`"15000.00"`). Never `double`/`float`.
- Soft-deleted rows (`deleted_at IS NOT NULL`) are always excluded from totals.
- Do **not** add stored/cached totals tables unless a load test shows a screen missing its target. If added: update them in the same transaction as the write.

```sql
-- Event totals in one query
SELECT e.id,
       COALESCE(SUM(p.amount) FILTER (WHERE p.deleted_at IS NULL), 0) AS received
FROM events e
LEFT JOIN payments p ON p.event_id = e.id
WHERE e.company_id = :companyId AND e.id IN (:ids)
GROUP BY e.id;
```

### 1.6 Indexes
- Every index from the system design doc is created in the first Flyway migration.
- **Every new filter or sort** on a list must have a supporting index starting with `company_id`. Add it in the same pull request as the query.
- Check new queries with `EXPLAIN ANALYZE` on Staging-sized data. A sequential scan on a large table is a review blocker.

### 1.7 Connections and transactions
- HikariCP pool: `maximum-pool-size=10` to start (tune from monitoring).
- Read-only service methods: `@Transactional(readOnly = true)`.
- Keep transactions short. **No HTTP calls, PDF generation or push sending inside a database transaction.**

---

## 2. Backend — caching

| What | Where | Rule |
|---|---|---|
| Feature flags, business profile, quotation settings, settings lists | Server memory (**Caffeine**) | Key always includes `companyId`. TTL 10 min. **Evict on every write** to that data. |
| Settings lists (`/event-types`, `/items`, …) | Phone, with **ETag** | Server returns `ETag`; on `If-None-Match` match, answer `304` with no body. |
| Quote PDFs | Storage (Topic 8) | A quote **version** never changes: generate once, keyed by `quotationId + versionNo`, reuse. |
| Anything money-related (totals, balances) | **Not cached** on the server | Always fresh from the database. |

- Never share cache entries between companies.
- Redis is **not** used in Phase 1. It is added only when there is more than one app server.

---

## 3. Backend — keep slow work off the request

- Run in the background (`@Async` or scheduled jobs), never while the owner waits:
  report PDF exports over ~1 s, notification creation, push sending, reminder scheduling, the hourly Upcoming → Pending job.
- Scheduled jobs process companies **in batches** (e.g. 100 at a time) and never load all rows into memory.
- Enable HTTP compression:
  ```properties
  server.compression.enabled=true
  server.compression.mime-types=application/json,application/pdf,text/html
  server.compression.min-response-size=1024
  ```
- Logos: resize on upload (max 512 px, PNG/JPG, max 1 MB).

---

## 4. Frontend (React Native + Expo)

### 4.1 Data fetching
- Use **TanStack Query** for all server data. No hand-written `useEffect` fetch loops.
- Show cached data first, refresh in the background (`staleTime`: 30 s for screens, 10 min for settings lists).
- **One API call per screen** (e.g. Home = only `GET /dashboard/home`; Event detail = only `GET /events/{id}`). Do not stitch a screen from several calls.
- **One API call per user action.**
- **No polling, no timers that call the API.** This is also required by the 60-minute sign-out rule. Refresh only on screen open, pull-to-refresh, or after a push.
- After a write, update or invalidate only the affected queries.

### 4.2 Feels instant
- Payments, expenses and crew payments are shown as saved immediately (optimistic update), then confirmed by the server. The same path handles offline saves.
- Show skeletons while loading; never a blank screen.

### 4.3 Rendering
- Long lists use `FlatList` (or FlashList) with `keyExtractor`; never `.map()` inside a `ScrollView` for lists that can grow.
- Lazy-load screens (load each screen's code only when it is opened).
- Memoize list rows (`React.memo`) and avoid creating new functions or objects in row props.
- Keep the web bundle lean: no heavy libraries for small tasks; check bundle size in CI.

### 4.4 API code
- Generate types and API client from `EventFlow_API_Contract_v0.1.yaml` (e.g. `openapi-typescript`). Do not hand-write API shapes.
- Money is a string in JSON; format with Indian grouping (`₹1,50,000.00`); do maths only with a decimal library, never JS numbers.

---

## 5. Monitoring (set up in Step 5, Setup)

- Spring Boot Actuator + Micrometer: response time per API (p50, p95, p99), error rate, JVM memory, DB pool usage.
- PostgreSQL: enable `pg_stat_statements` and `log_min_duration_statement = 200` (log any query over 200 ms).
- Every request has a trace id returned in the `X-Request-Id` header and written in logs.
- Alert: **p95 > 500 ms for 5 minutes**, or error rate > 1 %.

---

## 6. Proof: load test before UAT (Step 8) and before launch (Step 11)

1. Seed Staging with the **2× data** in section 0 (script kept in the repo).
2. Run **k6** with 100 virtual users following real journeys: open Home → open Events → open an event → record payment → open Money → open a quote.
3. Measure Home on a throttled "Fast 4G" profile.
4. **Pass:** p95 < 300 ms on every API · Home < 2 s · errors < 0.1 %.
5. If it fails: fix (query, index, N+1, payload), re-run only the failing journey, then the full test once before sign-off.
6. Repeat the full test on the production-sized server in Pre-launch.

---

## 7. Code-review checklist (every pull request)

- [ ] Lists paged, `size` capped at 100
- [ ] No N+1; query-count test added or updated for new or changed APIs
- [ ] DTO projection for lists; no entities in JSON
- [ ] Totals computed with SQL `SUM`; `BigDecimal` only; money sent as strings
- [ ] Every new filter or sort has an index starting with `company_id` (migration included)
- [ ] No slow work (PDF, push, HTTP) inside a request transaction
- [ ] Cache keys include `companyId`; writes evict the cache
- [ ] Frontend: one call per screen and per action, TanStack Query, `FlatList`, no polling or timers
- [ ] Nothing here breaks the 60-minute sign-out (no background API calls)

---

## 8. How we grow (only when monitoring says so)

1. Bigger app or database server.
2. Second app server behind a load balancer (works because the app keeps no session in memory).
3. Redis for shared cache.
4. Read-only database copy for reports and Stats.

No rewrite is needed at any stage. Do not build steps 2–4 in Phase 1.
