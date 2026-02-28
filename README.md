# Zodex - Secure Blog Platform

A production-ready blog platform with user authentication, private dashboard, public blog feed, and social features (likes & comments).

## Live Demo

- **Frontend:** [Deployed URL]
- **Backend:** [Deployed URL]

## Tech Stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Backend  | NestJS 10, TypeScript (strict), Prisma 7    |
| Database | PostgreSQL (Neon serverless)                 |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Auth     | JWT + Passport, bcrypt password hashing     |

## Architecture

### Backend

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema with indexes
├── src/
│   ├── prisma/                # Global Prisma module (injectable service)
│   ├── auth/                  # JWT auth: register, login, profile
│   ├── blogs/                 # Blog CRUD, public feed, public detail
│   ├── comments/              # Comment CRUD per blog
│   ├── likes/                 # Like toggle with duplicate prevention
│   ├── blog-jobs/             # Async summary generation (in-process queue)
│   ├── health/                # Health check with DB connectivity
│   └── common/                # Guards, filters, decorators
```

**Key design decisions:**

- **Prisma ORM** with Neon serverless adapter for database access. Global `PrismaModule` makes the service injectable everywhere.
- **Modular architecture** — each feature is a self-contained NestJS module with its own controller, service, and DTOs.
- **N+1 prevention** — public feed and blog detail use Prisma `include` and `_count` to fetch related data in minimal queries (2 queries for feed: data + count).
- **Rate limiting** — global ThrottlerGuard (60 req/min default), with tighter limits on auth endpoints (5 registrations/min, 10 logins/min).
- **Async job processing** — blog summary auto-generation runs in an in-process queue with retry logic (3 attempts). Does not block the HTTP response.
- **Validation** — class-validator DTOs with `whitelist` and `forbidNonWhitelisted` to reject unexpected fields.

### Frontend

```
frontend/
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── feed/              # Public blog feed with pagination
│   │   ├── blog/[slug]/       # Blog detail with comments & likes
│   │   ├── dashboard/         # Protected: stats, blog management
│   │   ├── login/             # Auth pages
│   │   └── register/
│   ├── components/            # Reusable UI components
│   │   ├── blog-card.tsx      # Blog preview card
│   │   ├── comment-item.tsx   # Comment display
│   │   ├── like-button.tsx    # Like with optimistic UI
│   │   └── navbar.tsx         # Navigation with auth state
│   └── lib/                   # Utilities
│       ├── api.ts             # Type-safe API client
│       ├── auth.ts            # Token management
│       └── types.ts           # Shared TypeScript interfaces
```

**Key design decisions:**

- **Reusable components** — `BlogCard`, `CommentItem`, `LikeButton` are extracted for reuse and isolation.
- **Optimistic UI** — likes update immediately, revert on failure.
- **API abstraction** — single `ApiClient` class with typed methods, centralized error handling.
- **Auth guard** — `DashboardLayout` checks authentication client-side before rendering protected content (shows spinner during check).
- **Loading states** — skeleton loaders for feed, blog detail, and dashboard.
- **Error states** — user-friendly error messages with retry actions.

### Database Schema

```
User ──┬── Blog ──┬── Comment
       │          └── Like
       ├── Comment
       └── Like

Indexes:
  - Blog: (authorId), (isPublished, createdAt)
  - Comment: (blogId), (createdAt)
  - Like: unique(blogId, userId)
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)

### 1. Clone and install

```bash
git clone <repo-url>
cd Zodex

cd backend && npm install
cd ../frontend && npm install
```

### 2. Backend environment

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
DIRECT_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=your-secure-random-secret-min-32-chars
JWT_EXPIRATION=7d
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### 3. Database setup

```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

### 4. Frontend environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 5. Run

```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## API Endpoints

### Auth
| Method | Path                | Auth     | Description          |
| ------ | ------------------- | -------- | -------------------- |
| POST   | /api/auth/register  | Public   | Register new user    |
| POST   | /api/auth/login     | Public   | Login                |
| GET    | /api/auth/me        | Required | Get current profile  |

### Public
| Method | Path                       | Auth     | Description              |
| ------ | -------------------------- | -------- | ------------------------ |
| GET    | /api/public/feed           | Public   | Paginated published feed |
| GET    | /api/public/blogs/:slug    | Optional | Blog by slug             |

### Dashboard (Protected)
| Method | Path                                     | Auth     | Description        |
| ------ | ---------------------------------------- | -------- | ------------------ |
| GET    | /api/dashboard/blogs                     | Required | User's blogs       |
| GET    | /api/dashboard/blogs/:id                 | Required | Blog by ID         |
| POST   | /api/dashboard/blogs                     | Required | Create blog        |
| PUT    | /api/dashboard/blogs/:id                 | Required | Update blog        |
| PATCH  | /api/dashboard/blogs/:id/toggle-publish  | Required | Toggle publish     |
| DELETE | /api/dashboard/blogs/:id                 | Required | Delete blog        |

### Social
| Method | Path                              | Auth     | Description        |
| ------ | --------------------------------- | -------- | ------------------ |
| POST   | /api/blogs/:id/likes/toggle       | Required | Toggle like        |
| GET    | /api/blogs/:id/likes              | Optional | Like status/count  |
| POST   | /api/blogs/:id/comments           | Required | Add comment        |
| GET    | /api/blogs/:id/comments           | Public   | List comments      |
| DELETE | /api/blogs/:id/comments/:commentId| Required | Delete own comment |

### Health
| Method | Path            | Auth   | Description              |
| ------ | --------------- | ------ | ------------------------ |
| GET    | /api/health     | Public | Health + DB connectivity |

## Tradeoffs Made

1. **In-process job queue vs. BullMQ/Redis** — used an in-process queue for blog summary generation to avoid requiring Redis infrastructure. Structured with retry logic (3 attempts) and proper logging. In production, this should use BullMQ + Redis for persistence, horizontal scaling, and dead-letter queues.

2. **Client-side auth vs. cookie-based SSR auth** — JWT stored in localStorage with client-side route protection. Server-side middleware can't validate localStorage tokens. This is a pragmatic tradeoff for SPA-style apps. For production, JWT should be stored in httpOnly cookies to enable server-side validation and prevent XSS token theft.

3. **Neon serverless adapter** — uses `@prisma/adapter-neon` with WebSocket connections instead of direct TCP. Great for serverless/edge deployments, but adds slight latency for connection handshakes. Direct PostgreSQL connections would be faster for persistent server deployments.

4. **Auto-generated slugs** — slugs are generated from titles with a random suffix to guarantee uniqueness without checking the database. This avoids race conditions but produces less aesthetic URLs. A production system could implement sequential suffixes (e.g., `my-blog`, `my-blog-2`).

5. **Summary generation** — auto-extracts first 2-3 sentences as summary. A production system would integrate an LLM API for intelligent summarization.

## What I Would Improve

- **Refresh tokens** — implement token rotation with short-lived access tokens (15 min) and long-lived refresh tokens (7 days) stored in httpOnly cookies.
- **Role-based access** — add `role` field to User (ADMIN, AUTHOR, READER) with proper guards.
- **Redis caching** — cache public feed and popular blog pages to reduce database load.
- **Full-text search** — add PostgreSQL full-text search for blog content discovery.
- **Image uploads** — integrate S3/Cloudflare R2 for blog cover images and user avatars.
- **Rich text editor** — replace textarea with Tiptap or ProseMirror for WYSIWYG editing.
- **E2E tests** — add Playwright tests for critical flows (auth, blog creation, feed).
- **CI/CD** — GitHub Actions pipeline with lint, type-check, test, and deploy stages.
- **Structured logging** — integrate Pino with request correlation IDs for production observability.

## Scaling to 1M Users

### Database Layer
- **Read replicas** — route read-heavy queries (feed, blog detail) to PostgreSQL read replicas.
- **Connection pooling** — use PgBouncer or Neon's built-in pooler to handle thousands of concurrent connections.
- **Partitioning** — partition the `comments` and `likes` tables by `blogId` range for better query performance.
- **Materialized views** — pre-compute feed data (blog + author + counts) as a materialized view, refreshed periodically.

### Application Layer
- **Horizontal scaling** — deploy multiple NestJS instances behind a load balancer. The app is stateless (JWT auth, no sessions).
- **Redis caching** — cache the public feed (TTL 60s), individual blog pages (TTL 5min), and like counts (TTL 30s). Invalidate on writes.
- **CDN** — serve the Next.js frontend from Vercel's edge network. Use stale-while-revalidate for blog pages.
- **BullMQ + Redis** — move job processing to dedicated worker instances. Add rate-limited queue for summary generation.

### API Performance
- **Rate limiting** — per-user rate limits with Redis-backed sliding window (already have basic throttling).
- **Pagination cursors** — switch from offset-based to cursor-based pagination for consistent results under high write throughput.
- **GraphQL** — consider GraphQL for the feed to reduce over-fetching and allow clients to request exactly the data they need.

### Monitoring
- **APM** — Datadog or New Relic for request tracing, slow query detection, and error tracking.
- **Alerts** — set up alerts for p99 latency > 500ms, error rate > 1%, and database connection pool exhaustion.
