# Week 6 Base Files (Issues 24-26)

This folder is the Week 6 snapshot. It starts from Week 5 and focuses on **advanced backend intelligence**: vendor resolution, analytics, and alert rules.

## Week 6 Goal

Level-up ingestion and insights: add vendor confidence scoring, real analytics, and renewal alert rules.

## Issues Covered

### Issue 24: Gmail Ingestion v2 — Vendor Resolver + Confidence Scoring (Competitive)
- Vendor normalization + confidence scoring
- Dedupe hash + explainability signals

### Issue 25: Analytics Engine — Spend Trends + Category Insights
- Aggregation pipelines for spend + category analytics
- Trend series for dashboard

### Issue 26: Renewal Alert Rules + Upcoming Notifications API
- User-defined rule window (3/7/14 days)
- Upcoming renewals API (no notifications yet)

---

## Progress Checklist

Backend (Week 6)
- [x] Vendor resolver + confidence scoring
- [x] Candidate deduping and metadata
- [x] Analytics overview endpoint
- [x] Alerts rule endpoints + upcoming renewals

Frontend (Week 6)
- [x] Dashboard reads `/api/analytics/overview` for summary widgets
- [x] Settings page provides Alert Rules controls + Upcoming preview
- [x] Analytics page shows spend trends + category breakdown
- [x] Renewals page shows upcoming renewals window from `/api/alerts/upcoming`
- [x] Profile page shows Clerk account summary

## Credits (Merged PRs)

| Issue | Focus Area | Contributors (PRs) |
| ----: | ---------- | ------------------ |
| **24** | Vendor Resolver + Confidence | Krishna200608 (**#279**), dwivediprashant (**#288**), ishanrajsingh (**#283**) |
| **25** | Analytics Engine | Krishna200608 (**#280**), dwivediprashant (**#287**) |
| **26** | Renewal Alerts API | Krishna200608 (**#281**), dwivediprashant (**#286**), Chithra582 (**#285**), ishanrajsingh (**#284**) |

## Structure

- `client/` — UI layer (Week 5 baseline).
- `server/` — Gmail ingestion + analytics/alerts (Week 6 target).

## Run Locally

### Using pnpm

```bash
cd base_files/week6/client
pnpm install --no-frozen-lockfile
pnpm dev
```

```bash
cd base_files/week6/server
pnpm install --no-frozen-lockfile
pnpm dev
```

### Using npm

```bash
cd base_files/week6/client
npm install
npm run dev
```

```bash
cd base_files/week6/server
npm install
npm run dev
```

> Tip: copy `base_files/week6/server/envExample` to `.env` and fill Google OAuth values before starting the server.

## Notes
- Week 6 is backend-heavy; UI additions include analytics, renewals, and profile views.
- Maintainer enhancement: completed Week 6 UI pages and aligned visuals with the new analytics/alerts APIs.
