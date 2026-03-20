# MiniLearning Platform — Architecture Documentation

## Overview

MiniLearning is a full-stack teaching platform consisting of three applications:

- **backend/** — Node.js/Express REST API (TypeScript)
- **frontend/** — React SPA for students and instructors (Vite + TypeScript)
- **admin/** — React SPA for administrators (Vite + TypeScript)

All applications run locally. No external services are required.

---

## Module Boundaries and Dependencies

### Backend

The backend follows a **feature/module-based architecture** with strict layering
within each module:
```
src/
├── db/                        # Database connection, migrations, seed
├── middleware/                # Cross-cutting HTTP concerns
│   ├── requireAuth.ts         # JWT verification
│   ├── authorize.ts           # Role/type enforcement
│   └── errorHandler.ts        # Unified error handling
├── utils/                     # Shared utilities
│   ├── response.ts            # Unified JSON response shape
│   └── logger.ts              # Structured logging
└── modules/
    ├── auth/                  # Registration, login, token issuance
    ├── users/                 # User identity (extended by auth)
    ├── courses/               # Course CRUD, publish/unpublish
    ├── sessions/              # Session scheduling and completion
    ├── enrollments/           # Student enrollment in courses
    └── payouts/               # Virtual balance and payout requests
```

Each module contains exactly four layers:

| Layer | File | Responsibility |
|---|---|---|
| HTTP | `*.routes.ts` | Route definitions, middleware composition |
| Controller | `*.controller.ts` | Parse request, call service, send response |
| Service | `*.service.ts` | Business logic and invariant enforcement |
| Repository | `*.repository.ts` | All database queries |

**Dependency rule:** Controllers may only call services. Services may only call
repositories. Repositories may only call the database. No layer may skip another.

### Module Dependency Graph
```
auth ──────────────────────────────► users (findUserById)
courses ───────────────────────────► (self-contained)
sessions ──────────────────────────► courses (ownership check)
enrollments ───────────────────────► courses (published check)
payouts ───────────────────────────► sessions (eligible session query)
```

### Frontend & Admin

Both SPAs follow a service-based API access pattern:
```
src/
├── api/          # One service file per backend module
├── store/        # Zustand auth store (persisted to localStorage)
├── components/   # Shared UI primitives (Button, Card, Badge, Input)
├── layouts/      # Route-level shell components with navigation
└── pages/        # One folder per user role
```

---

## Auth and Authorisation Approach

### Authentication

- JWT-based, stateless, local only.
- Tokens are signed with `JWT_SECRET` and expire in 7 days.
- The token payload contains only `userId`.
- Tokens are stored in `localStorage` on the client.

### Authorisation Middleware Chain

Protected routes compose three middleware functions in sequence:
```
requireAuth → attachUser → requireRole('admin') | requireType('instructor')
```

1. **`requireAuth`** — Verifies the JWT signature and expiry. Attaches `userId`
   to the request. Returns `401` if missing or invalid.

2. **`attachUser`** — Loads the full user record from the database using `userId`.
   Attaches the user object to the request. Returns `404` if the user no longer
   exists.

3. **`requireRole(role)`** — Checks `user.role`. Used to restrict endpoints to
   `admin` only. Returns `403` if the role does not match.

4. **`requireType(type)`** — Checks `user.type`. Used to restrict endpoints to
   `instructor` or `student` only. Returns `403` if the type does not match.

### Role and Type Model

| Field | Values | Purpose |
|---|---|---|
| `role` | `admin`, `user` | Platform-level access control |
| `type` | `student`, `instructor`, `null` | Domain-level access control |

Admins have `role = 'admin'` and `type = null`. They access the platform
through a separate admin application on a different port.

---

## Payout and Session Invariants

The payout system enforces the following invariants at the service and
database layers:

### Invariant 1 — Only completed, unpaid sessions are eligible

When an instructor requests a payout, the system queries only sessions that are:
- `status = 'completed'`
- Not already linked to a `pending` or `approved` payout request

This prevents double-counting sessions across multiple payout requests.

### Invariant 2 — Payout snapshots the eligible amount

When a payout request is created, the system:
1. Queries all eligible sessions atomically inside a database transaction.
2. Snapshots the computed balance as `amount` on the `payout_requests` record.
3. Links each eligible session to the payout via `payout_request_sessions`.

This means the payout amount is locked at request time and cannot drift if
course prices change later.

### Invariant 3 — Approval atomically marks sessions as paid

When an admin approves a payout request, the system executes two operations
inside a single database transaction:
1. Sets `payout_requests.status = 'approved'`.
2. Sets `sessions.status = 'paid'` for all sessions linked to that request.

If either operation fails, both are rolled back. Sessions are never marked
paid without a corresponding approved payout record.

### Invariant 4 — Rejected requests do not affect session status

Rejecting a payout request sets `payout_requests.status = 'rejected'` only.
The linked sessions remain `completed` and become eligible for a new payout
request.

---

## Cross-Cutting Concerns

### Validation

All write endpoints validate request bodies using **Zod schemas** defined in
the controller layer. Invalid requests return a `422` status with structured
field errors. Validation is enforced before any service or database call.

### Error Handling

All errors flow through a single `errorHandler` middleware registered at the
bottom of the Express app. The handler recognises:

- `ZodError` — returns `422` with field-level error details.
- `AppError` — returns the specified status code and message.
- Unknown errors — returns `500` with a generic message.

All responses follow a unified JSON shape:
```json
// Success
{ "status": "success", "message": "...", "data": {} }

// Error
{ "status": "error", "message": "...", "errors": {} }
```

### Logging

Structured JSON logging is implemented via a custom `log` utility. Key events
logged include:
- Server startup and database connection.
- Payout request creation, approval, and rejection.
- All unhandled errors with request path.
- HTTP request/response via Morgan in development.

---

## Trade-offs and What Would Change at 10x Scale

### What works well now

- Layered architecture makes each module independently testable.
- PostgreSQL transactions enforce payout invariants without application-level locks.
- Zod validation provides type-safe request parsing with zero runtime surprises.
- Separate admin app reduces attack surface for privileged operations.

### What would need to change at 10x scale

| Area | Current | At 10x |
|---|---|---|
| **Auth** | JWT in localStorage | HttpOnly cookies, refresh token rotation |
| **Database** | Single PostgreSQL instance | Read replicas, connection pooling via PgBouncer |
| **Payouts** | Synchronous DB transaction | Async job queue (BullMQ) with idempotency keys |
| **Logging** | Console JSON | Centralised aggregation (Datadog, Loki) |
| **API** | Monolithic Express app | Extract payouts/auth into separate services |
| **Frontend** | Vite dev server | CDN-hosted static builds with env-based API URLs |
| **Testing** | Manual | Jest unit tests per service, Playwright E2E for critical flows |
| **Migrations** | Single script | Versioned migrations via node-pg-migrate or Flyway |
| **Admin auth** | Shared JWT secret | Separate admin auth with MFA enforcement |
| **Rate limiting** | None | express-rate-limit on auth and payout endpoints |