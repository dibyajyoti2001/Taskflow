# TaskFlow Lite

A team task board with JWT authentication, role-based access control, and a Kanban view. Built as a full-stack demonstration using a monorepo architecture.

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
# Backend
cp apps/api/.env.example apps/api/.env
# Edit JWT_SECRET to a random string ≥ 32 characters

# Frontend
cp apps/web/.env.example apps/web/.env
```

### 3. Start both apps

```bash
npm run dev (from their root)         # starts API on :4000 and web on :3000
```

### 4. Run tests

```bash
npm run test                    # all workspaces
cd apps/api && npm run test     # API tests only (requires running MongoDB)
```

---

## Architecture Overview

```
taskflow/
├── apps/
│   ├── api/          # Node.js + Express REST API
│   └── web/          # Next.js App Router frontend
└── packages/
    └── shared/       # Shared Zod schemas, TypeScript types, constants
```

### Why a monorepo?

A single `packages/shared` package is the single source of truth for:

- **Zod schemas** — used in Express middleware (server validation) AND React Hook Form (client validation). No schema drift.
- **TypeScript DTOs** — the same `TaskDto`, `BoardDto` types power both the API response serialization and the React component props.
- **Constants** — `BOARD_ROLES`, `TASK_STATUSES` are defined once, used everywhere.

### Backend: Controller → Service → Repository

```
HTTP Request
  → Router (route definition + middleware wiring)
  → Validate Middleware (Zod, 400 on failure)
  → Auth Middleware (JWT extraction)
  → Controller (HTTP marshalling only)
  → Service (business logic + RBAC)
  → Repository (Mongoose queries)
  → MongoDB
```

**Why this layering?**

| Layer      | Responsibility                    | What it does NOT do       |
| ---------- | --------------------------------- | ------------------------- |
| Controller | Parse req, call service, send res | Business logic, DB access |
| Service    | Business rules, RBAC enforcement  | HTTP concerns, DB queries |
| Repository | DB queries                        | Business logic            |

This means a second engineer can locate a bug immediately: wrong HTTP response → controller; wrong permission → service; wrong query → repository.

### Frontend: Feature-based modules

```
features/
├── auth/     # Login, register, JWT storage
├── boards/   # Board CRUD, member management
└── tasks/    # Task CRUD, Kanban view, status filter
```

Each feature owns its own `api/`, `hooks/`, and `components/` directories. This prevents the "god component" anti-pattern where one file handles data fetching, business logic, and rendering.

**TanStack Query** manages all server state. Components never call `apiClient` directly — they go through hooks. This means cache invalidation happens in one place.

---

## API Contract

All responses conform to:

```ts
// Success
{ "success": true, "data": T }

// Error
{ "success": false, "error": { "code": string, "message": string, "details"?: unknown } }
```

### Auth

| Method | Path                 | Auth   | Body                        |
| ------ | -------------------- | ------ | --------------------------- |
| POST   | `/api/auth/register` | —      | `{ name, email, password }` |
| POST   | `/api/auth/login`    | —      | `{ email, password }`       |
| GET    | `/api/auth/me`       | Bearer | —                           |

### Boards

| Method | Path                                   | Min Role                  | Body                              |
| ------ | -------------------------------------- | ------------------------- | --------------------------------- |
| GET    | `/api/boards`                          | member                    | —                                 |
| POST   | `/api/boards`                          | — (creator becomes owner) | `{ name, description? }`          |
| GET    | `/api/boards/:boardId`                 | viewer                    | —                                 |
| PUT    | `/api/boards/:boardId`                 | editor                    | `{ name?, description? }`         |
| DELETE | `/api/boards/:boardId`                 | owner                     | —                                 |
| POST   | `/api/boards/:boardId/members`         | owner                     | `{ email, role: editor\|viewer }` |
| PUT    | `/api/boards/:boardId/members/:userId` | owner                     | `{ role }`                        |
| DELETE | `/api/boards/:boardId/members/:userId` | owner                     | —                                 |

### Tasks

| Method | Path                                 | Min Role | Body / Query                                     |
| ------ | ------------------------------------ | -------- | ------------------------------------------------ |
| GET    | `/api/boards/:boardId/tasks`         | viewer   | `?status=todo\|in_progress\|done` (optional)     |
| POST   | `/api/boards/:boardId/tasks`         | editor   | `{ title, description?, status? }`               |
| GET    | `/api/boards/:boardId/tasks/:taskId` | viewer   | —                                                |
| PUT    | `/api/boards/:boardId/tasks/:taskId` | editor   | `{ title?, description?, status?, assigneeId? }` |
| DELETE | `/api/boards/:boardId/tasks/:taskId` | editor   | —                                                |

**Kanban view**: `GET /tasks` without `?status` returns `{ todo: [], in_progress: [], done: [] }`. With `?status=todo`, returns a flat `TaskDto[]` of that column only.

---

## RBAC Design

Authorization is enforced at the **service layer**, not just middleware. Even if a route is accidentally exposed without the RBAC middleware, the service call still checks the user's board membership and role before executing.

| Action                         | Owner | Editor | Viewer |
| ------------------------------ | ----- | ------ | ------ |
| Read board & tasks             | ✓     | ✓      | ✓      |
| Create / update / delete tasks | ✓     | ✓      | ✗      |
| Add / remove board members     | ✓     | ✗      | ✗      |
| Update member roles            | ✓     | ✗      | ✗      |
| Delete board                   | ✓     | ✗      | ✗      |

---

## Key Design Decisions & Tradeoffs

### 1. JWT in `localStorage` vs HttpOnly cookie

**Decision**: localStorage with `Authorization: Bearer` header.

**Tradeoff**: Simpler to implement for a demo API consumed by multiple clients (browser, potential mobile). In production, HttpOnly cookies with SameSite + CSRF protection is safer against XSS. We prioritized ergonomics for a code challenge; the cookie approach would be one config change in the axios interceptor.

### 2. Members embedded in Board document (vs. separate collection)

**Decision**: `board.members[]` is an array subdocument.

**Tradeoff**: Reads are fast — one query fetches the board + all member roles. The downside is updates to a single member require a `$` positional operator query. This is fine at ≤ ~100 members per board. Beyond that, a separate `BoardMember` collection with compound index on `(boardId, userId)` would be better.

### 3. Kanban grouped in the API (vs. frontend grouping)

**Decision**: The API returns `{ todo: [], in_progress: [], done: [] }` when no status filter is applied.

**Tradeoff**: The API does more work (grouping in service layer), but the frontend is simpler and there's no risk of a Kanban view being accidentally constructed from a partial dataset. The alternative — send all tasks and group in the browser — is fine for small boards but wastes bandwidth at scale.

### 4. Express over NestJS

**Decision**: Explicit Express with manual Controller/Service/Repository wiring.

**Tradeoff**: More boilerplate than NestJS decorators, but every architectural decision is visible in the code. No framework magic means a reviewer can see exactly what each layer does. For a code challenge, this communicates understanding rather than framework familiarity.

### 5. No refresh tokens (demo scope)

**Decision**: Single JWT, 7-day expiry.

**Tradeoff**: A proper auth system would use short-lived access tokens (15min) + long-lived refresh tokens (30 days) stored in HttpOnly cookies. This was descoped for the demo. The `signToken`/`verifyToken` utilities are isolated, so adding refresh tokens requires only a new route and a token rotation table.

---

## Automated Tests

Tests are written with **Jest + Supertest** against the real Express app. The test philosophy:

> Test **behaviors** (registration creates a user, viewer cannot create tasks), not **implementations** (does UserModel.create get called).

Test coverage focuses on:

1. Happy paths for auth flows
2. 409 Conflict for duplicate registration
3. 401 for missing/invalid JWT
4. 403 for RBAC violations (editor tries to add members, viewer tries to create tasks)
5. 400 for invalid payloads
6. Kanban grouping and status filter correctness

Run with: `cd apps/api && npm test`

---

## Scaling to 100,000 Users

> What would you change first, and why?

At 100,000 users with typical SaaS usage patterns (assume 10,000 daily active, 100 concurrent at peak), here are the bottlenecks in order of urgency:

### 1. MongoDB indexing

The indexes already defined (`members.userId`, `boardId + status`, `boardId + createdAt`) will carry us a long way. The first query to slow down will be `GET /boards` for power users with many board memberships. A covered query on `members.userId` already handles this, but we'd add **query explain plans** to CI to catch regressions.

### 2. Connection pooling

A single Node.js process holds a Mongoose connection pool (default: 5 connections). At 100K users, we'd scale horizontally with 3–5 API instances behind a load balancer. Each instance needs its own pool, and MongoDB Atlas connection limits become relevant. Solution: **PgBouncer-style connection pooling** or **Atlas connection string with max pool tuning**.

### 3. JWT → stateless session is already correct

JWT-based auth scales horizontally without shared session state. No change needed here. We'd add token **rotation with refresh tokens** for security, but that's a security improvement, not a scaling one.

### 4. Read-heavy caching

Board details and task lists are read far more than they're written. Add a **Redis layer** in front of MongoDB for:

- `GET /boards/:boardId` → cache for 60s, invalidate on any write
- `GET /boards/:boardId/tasks` → cache for 30s, invalidate on task mutations

This reduces MongoDB load by ~70% for typical read patterns.

### 5. Task history / audit log

At scale, product teams want "who moved this task to Done?" Add a `TaskEvent` collection with an append-only event log. This also unlocks activity feeds and undo functionality. Architecture change: task updates go through an event bus (BullMQ + Redis) rather than direct DB writes.

### 6. Real-time updates

At 100K users, polling every 60 seconds generates 100K × (60/60) = 100K requests/minute at peak. Replace with **WebSockets** (Socket.io or native WS) or **Server-Sent Events** for board-level subscriptions. Scope: one room per boardId, push events on task/member mutations.

### 7. Horizontal scaling of the monolith → services

At 100K+ users with diverse load patterns, split the monolith:

- **Auth service** (stateless, very high read/write)
- **Board service** (moderate, low write frequency)
- **Task service** (high write frequency, benefits from independent scaling)
- **Notification service** (async, can be slow)

This split is easy because the Controller → Service → Repository pattern already enforces boundaries. Each service maps 1:1 to an existing module.

### Summary

| Priority | Change                                          | Impact                         |
| -------- | ----------------------------------------------- | ------------------------------ |
| 1        | Tune MongoDB indexes, add explain-plan CI check | Free performance win           |
| 2        | Horizontal API scaling + connection pool tuning | Handles concurrent load        |
| 3        | Redis caching layer                             | 70% read load reduction        |
| 4        | Refresh token rotation                          | Security at scale              |
| 5        | WebSockets for real-time                        | Eliminates polling at scale    |
| 6        | Service decomposition                           | Independent scaling per domain |
