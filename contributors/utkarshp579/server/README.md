# utkarshp579 — SubSentry Server

## Setup

- Copy `envExample` to `.env` and fill values.
- Install deps: `npm install`
- Run dev server: `npm run dev`

## Issue 7 — Fetch Subscriptions

### Endpoint

- `GET /api/subscriptions`

### Auth

This endpoint is protected. Send a JWT in the `Authorization` header:

- `Authorization: Bearer <token>`

The server reads the user id from the verified token payload (`sub`, `userId`, or `id`) and returns **only that user's subscriptions**.

### Example response

```json
{
  "success": true,
  "message": "Subscriptions retrieved successfully",
  "data": [],
  "count": 0
}
```

### Quick token for local testing

```bash
node -e "import jwt from 'jsonwebtoken'; console.log(jwt.sign({sub:'user-1'}, process.env.JWT_SECRET))"
```

## Tests

- Run: `npm test`
