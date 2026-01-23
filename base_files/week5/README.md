# Week 5 Base Files (Issues 16-23)

This folder is the Week 5 snapshot. It starts from Week 4 and introduces the **Gmail ingestion pipeline** that powers auto-detection of subscriptions.

## Week 5 Goal

Turn read‑only Gmail signals into structured subscription candidates, then save them safely with deduplication.

## Issues Covered (Current)

### Issue 16: Gmail OAuth (Read-only)
- Secure OAuth flow with read‑only scope
- Token encryption at rest

### Issue 17: Fetch Transactional Emails
- Gmail search queries for subscription signals
- Pagination + rate‑limit handling

### Issue 18: Parse Emails
- Rule‑based parsing to extract service, amount, cycle, etc.

### Issue 19: Save Email-based Subscriptions
- Deduplication + mapping to schema

### Issue 20: Email Ingestion UI Feedback
- Status endpoints to power UI feedback (server side)

### Issue 21: Free Trial Highlighting
- Trial ending soon highlight + badges

### Issue 22: Filters & Sorting
- Trial filter option + refined sorting controls

### Issue 23: Final UI Polish
- Subtle UI refinements for subscriptions view

---

## Progress Checklist

Backend (Week 5)
- [x] Gmail OAuth (read-only) with token encryption + refresh
- [x] Fetch transactional emails (`/api/gmail/emails`)
- [x] Parse emails into candidates (`/api/gmail/parse`)
- [x] Save deduped subscriptions (`/api/gmail/save`)

Frontend (Week 5)
- [x] Settings page wired to Gmail connect/disconnect
- [x] Email ingestion controls (fetch/parse/save) with counts
- [x] Trial ending soon highlight + badges
- [x] Trial filter + refined sorting UI
- [x] Subscriptions UI polish
- [ ] Dedicated Email Ingestion UI page (optional polish)

## Credits (Merged PRs)

| Issue | Focus Area                         | Contributors (PRs)        |
| ----: | ---------------------------------- | ------------------------- |
|  **16** | Gmail OAuth (Read-only)           | Krishna200608 (**#249**)  |
|  **17** | Fetch Transactional Emails        | Krishna200608 (**#250**)  |
|  **18** | Parse Emails                      | Krishna200608 (**#251**)  |
|  **19** | Save Email-based Subscriptions    | ishanrajsingh (**#242**)  |
|  **20** | Email Ingestion UI Feedback       | ishanrajsingh (**#243**)  |
|  **21** | Free Trial Highlighting           | Krishna200608 (**#267**)  |
|  **22** | Filters & Sorting UI              | Krishna200608 (**#268**)  |
|  **23** | Final UI Polish                   | Krishna200608 (**#269**)  |
|  **Maintainer** | Settings UX + Gmail controls hardening | Aryan-coder06 (manual integration) |

## Structure

- `client/` — UI layer (Week 4 baseline, ready for Week 5 upgrades).
- `server/` — Gmail OAuth + ingestion pipeline.

## Run Locally

### Using pnpm

```bash
cd base_files/week5/client
pnpm install --no-frozen-lockfile
pnpm dev
```

```bash
cd base_files/week5/server
pnpm install --no-frozen-lockfile
pnpm dev
```

### Using npm

```bash
cd base_files/week5/client
npm install
npm run dev
```

```bash
cd base_files/week5/server
npm install
npm run dev
```

> Tip: copy `base_files/week5/server/envExample` to `.env` and fill Google OAuth values before starting the server.

## Notes
- Totals on Dashboard/Subscriptions can be displayed in USD/INR/EUR/GBP using the conversion table in `base_files/week5/client/src/lib/utils.ts`. Update rates as needed.
