# Zodex - Secure Blog Platform

A production-style blogging platform built with **NestJS**, **Prisma**, **PostgreSQL**, and **Next.js 15** (App Router).

## Architecture

```
Zodex/
├── backend/          # NestJS API server
│   ├── prisma/       # Database schema & migrations
│   └── src/
│       ├── auth/     # JWT authentication (register, login, guards)
│       ├── blogs/    # Blog CRUD + public feed
│       ├── comments/ # Comment system
│       ├── likes/    # Like toggle (one per user per blog)
│       ├── prisma/   # Database service (global)
│       └── common/   # Shared decorators & guards
└── frontend/         # Next.js 15 App Router
    └── src/
        ├── app/      # Pages (feed, blog, dashboard, auth)
        ├── components/
        └── lib/      # API client, auth helpers, types
```

## Tech Stack

| Layer    | Technology                     |
| -------- | ------------------------------ |
| Backend  | NestJS 10, Prisma 6, Supabase (PostgreSQL) |
| Auth     | JWT + Passport, bcryptjs       |
| Frontend | Next.js 15, React 19, Tailwind CSS 4 |
| Security | Rate limiting, input validation, CORS |

## Prerequisites

- **Node.js** >= 18
- **Supabase** project (free tier works) — [supabase.com/dashboard](https://supabase.com/dashboard)

## Setup

### 1. Supabase Database

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **Settings → Database → Connection string**
3. Copy both connection strings into `backend/.env`:

```env
# Transaction mode (pooler, port 6543) — used by the app at runtime
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Session mode (direct, port 5432) — used by Prisma for migrations
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### 2. Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run start:dev
```

The API runs at `http://localhost:4000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## API Endpoints

### Auth
| Method | Route               | Auth | Description      |
| ------ | ------------------- | ---- | ---------------- |
| POST   | `/api/auth/register` | No   | Register user    |
| POST   | `/api/auth/login`    | No   | Login user       |
| GET    | `/api/auth/me`       | Yes  | Get profile      |

### Public
| Method | Route                        | Auth | Description          |
| ------ | ---------------------------- | ---- | -------------------- |
| GET    | `/api/public/feed`           | No   | Paginated blog feed  |
| GET    | `/api/public/blogs/:slug`    | Opt  | Blog detail by slug  |

### Dashboard (Protected)
| Method | Route                                      | Auth | Description       |
| ------ | ------------------------------------------ | ---- | ----------------- |
| GET    | `/api/dashboard/blogs`                     | Yes  | List my blogs     |
| GET    | `/api/dashboard/blogs/:id`                 | Yes  | Get my blog       |
| POST   | `/api/dashboard/blogs`                     | Yes  | Create blog       |
| PUT    | `/api/dashboard/blogs/:id`                 | Yes  | Update blog       |
| PATCH  | `/api/dashboard/blogs/:id/toggle-publish`  | Yes  | Toggle publish    |
| DELETE | `/api/dashboard/blogs/:id`                 | Yes  | Delete blog       |

### Comments & Likes
| Method | Route                              | Auth | Description    |
| ------ | ---------------------------------- | ---- | -------------- |
| GET    | `/api/blogs/:id/comments`          | No   | List comments  |
| POST   | `/api/blogs/:id/comments`          | Yes  | Add comment    |
| DELETE | `/api/blogs/:id/comments/:cid`     | Yes  | Delete comment |
| POST   | `/api/blogs/:id/likes/toggle`      | Yes  | Toggle like    |
| GET    | `/api/blogs/:id/likes`             | Opt  | Like status    |

## Database Schema

- **User**: id, email (unique), name, password (hashed), timestamps
- **Blog**: id, title, slug (unique), content, excerpt, isPublished, publishedAt, authorId, timestamps
- **Comment**: id, content, authorId, blogId, timestamps
- **Like**: id, userId, blogId (unique constraint on userId+blogId)

Indexes on foreign keys, composite indexes on `(isPublished, createdAt)` and `(userId, blogId)` for optimized feed queries.

## Key Features

- **JWT Authentication** with bcrypt password hashing (12 rounds)
- **Rate Limiting** (60 requests/minute via @nestjs/throttler)
- **Input Validation** (class-validator with whitelist + forbidNonWhitelisted)
- **Ownership Guards** - only blog authors can edit/delete their content
- **Unique Slug Generation** with collision avoidance
- **Optimized Queries** - $transaction for count+data, selective includes, indexed columns
- **Like Toggle** - enforced one-like-per-user via unique constraint
- **Cascade Deletes** - comments and likes removed when blog is deleted
- **Pagination** - cursor-free offset pagination with metadata
