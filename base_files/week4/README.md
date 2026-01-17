# Week 4 Base Files (Issues 11–13)

This folder is the Week 4 snapshot. It starts from Week 3 and continues the project into analytics and insight-driven features.

## Week 4 Goal

Week 4 is about turning raw subscription data into **meaningful insight**. The UI and backend should start answering questions like “How much do I spend monthly?” rather than just listing subscriptions.

## ✅ Issues Covered (Current)

### Issue 11: Auth Landing Page (Competitive)
- Build a premium landing experience for sign-in and sign-up.
- Strong visual branding, modern layout, and responsive composition.

### Issue 12: Monthly Spend Calculation
- Normalize all subscriptions into monthly spend.
- Handle mixed billing cycles safely.

### Issue 13: Yearly Spend Calculation
- Aggregate yearly spend across subscriptions.
- Keep logic clean and reusable from monthly math.

---

## 🤝 Credits (Merged PRs)

| ✅ Issue | Focus Area | Contributors (PRs) |
|---:|---|---|
| **11** | Auth Landing Page (Competitive) | Krishna200608 (**#200**) |
| **12** | Monthly Spend Calculation | Krishna200608 (**#201**) |
| **13** | Yearly Spend Calculation | Krishna200608 (**#203**) |

### 📝 Other Submissions (Pending/Not Merged)
- Issue 12 (Monthly Spend): Chithra582 (**#198**) — pending review
- Issue 13 (Yearly Spend): Chithra582 (**#199**), Siddharthjagtap346 (**#202**) — pending review

## 📌 Structure

- `client/` — UI layer (Week 3 baseline, ready for Week 4 upgrades).
- `server/` — Backend APIs with subscription data, ready for analytics logic.

## ▶ Run Locally

### Using pnpm

```bash
cd base_files/week4/client
pnpm install --no-frozen-lockfile
pnpm dev
```

### Using npm

```bash
cd base_files/week4/client
npm install
npm run dev
```

If you are implementing Week 4 issues, use this folder as the reference snapshot.
