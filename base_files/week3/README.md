# Week 3 Base Files (Issues 8–9)

This folder is the Week 3 snapshot. It starts from Week 2 and focuses on UI integration with the backend APIs.

## Week 3 Goal

Week 3 is about turning the dashboard into a usable product interface. Compared to Week 2, the difficulty is higher because you must connect UI to live APIs and handle real user input and state. Expect more edge cases and validation work than the previous week.

## ✅ Issues Covered (Current)

### Issue 8: Subscription Listing UI (Frontend/UI) + Navbar [FOR MORE ENHANCED UI STRUCTURE]
- Fetch subscription data from the GET API.
- Show name, amount, billing cycle, category, and renewal date.
- Clearly distinguish trial vs paid subscriptions.
- Responsive layout for smaller screens.
- More details on the exact Issue page

### Issue 9: Add Subscription Form UI (Frontend/Forms)
- Controlled inputs with basic validation.
- Clear labels and placeholders.
- Submit to POST API without full page reload.
- More details on the exact Issue page

## 📌 Structure

- `client/` — Next.js UI based on Week 2, now ready for listing and form integration.
- `server/` — Week 2 backend APIs used by the UI.

## ▶ How It Works

- The UI should call `/api/subscriptions` for listing.
- The form should POST to `/api/subscriptions`.
- Data should be scoped to the authenticated user.
- Server auth accepts a `Bearer <token>` header; for local dev you may pass `x-user-id` to simulate a user.

## ▶ Run Locally

### Using pnpm

```bash
cd base_files/week3/client
pnpm install --no-frozen-lockfile
pnpm dev
```

### Using npm

```bash
cd base_files/week3/client
npm install
npm run dev
```

If you are implementing Week 3 issues, use this folder as the reference snapshot.

---

## 🤝 Credits (Merged PRs)

| ✅ Issue | Focus Area | Contributors (PRs) |
|---:|---|---|
| **8** | Subscription Listing UI + Navbar | Krishna200608 (**#165**) |
| **9** | Add Subscription Form UI | Krishna200608 (**#166**) |

### 📝 Other Submissions (Pending/Not Merged)
- Issue 9 (Form UI): dwivediprashant (**#168**) — pending review
