# Proposed API contract changes — Home (US-03)

**Status:** PROPOSED · awaiting backend approval · 24 Nov 2026
**From:** frontend (Home page) · **For:** backend developer
**File changed:** `EventFlow_API_Contract_v0.1.yaml` (all fields added as **optional**, marked "PROPOSED for Home — awaiting backend approval")

The Home design (`EventFlow Redesign (4).pdf`, pages 2, 16, 17, 18) shows numbers the contract does not return yet.
All are counts or totals the server already has; the app must not calculate them (CODING_RULES §2, BR-xx live in the backend).
Until they arrive, the app hides only the line or pill that needs them.

| Schema · field | Type | Shown as (design) | Notes |
|---|---|---|---|
| `DashboardHome.received.paymentCount` | integer | "3 payments" pill (p.2) | Payments received this month (BR-11) |
| `DashboardHome.toCollect.collected` | Money | "₹15,000 of ₹88,000 collected" (p.16) | Received so far on the events that make up To collect (BR-14b) |
| `DashboardHome.toCollect.billed` | Money | same line, and the To collect bar | Agreed total of those events (BR-14b) |
| `DashboardHome.toCollect.clientCount` | integer | "3 clients" pill (p.16) | Clients with a balance due (`byClient` may be shortened) |
| `DashboardHome.expenses.count` | integer | "2 expenses" pill, "2 expenses · ₹3,500 in total" (p.17) | Expenses this month (BR-12) |
| `DashboardHome.events.upcomingCount` | integer | "4 upcoming" big text and Events mini tile (p.18) | Total upcoming (the `upcoming` list may be shorter) |
| `BalanceDueRow.received` | Money | "₹0 of ₹45,000 received" and the row bar (p.16) | Per event |
| `BalanceDueRow.agreed` | Money | same | Per event |
| `Expense.eventClientName` | string, nullable | "Meera's event" (p.17) | Null for general expenses |
| `Expense.crewMemberName` | string, nullable | "Salary · Karthik" (p.17) | Null unless a Salary expense |

## Not changed (used as-is)

- `GET /dashboard/home` with no `month` (server uses the current month).
- `GET /events/{id}/reminder` → `ReminderMessage.whatsappUrl` (US-11a).

## Questions for backend

1. `toCollect.byClient` and `events.upcoming`: how many rows at most? The app shows whatever is returned.
2. Should `expenses.recent` be all of this month's expenses or the latest N? The app shows what is returned and links "See all" to Money.
