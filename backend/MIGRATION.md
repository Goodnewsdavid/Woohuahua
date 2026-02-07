# Prisma migration instructions

## Prerequisites

- Node.js 18+
- PostgreSQL server
- `DATABASE_URL` set (see `.env.example`)

## 0. Create the database (do this first)

Prisma does not create the database. Create it before running migrations:

**Option A – command line (recommended):**
```bash
createdb -U postgres woo_huahua_db
```
Use the same user as in your `DATABASE_URL`.

**Option B – with psql:**
```bash
psql -U postgres -c "CREATE DATABASE woo_huahua_db;"
```

## 1. Install dependencies

From the `backend` directory:

```bash
npm install
```

## 2. Configure database

Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL connection string:

```bash
cp .env.example .env
```

Edit `.env` and set:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
```

## 3. Generate Prisma Client

```bash
npm run db:generate
```

This creates/updates the Prisma Client in `node_modules/.prisma/client` and types from `schema.prisma`.

## 4. Run migrations

**Development (creates a new migration and applies it):**

```bash
npm run db:migrate
```

Or with name in one go: `npx prisma migrate dev --name init`. When prompted for a name, use e.g. `init`.

**Production (apply existing migrations only):**

```bash
npm run db:migrate:deploy
```

**Alternative – push schema without migration files (prototyping only):**

```bash
npm run db:push
```

## 5. Optional: open Prisma Studio

```bash
npm run db:studio
```

Opens a browser UI at `http://localhost:5555` to view and edit data.

---

## Rules (application layer)

- **Soft deletes:** Users are never hard-deleted. Set `user.deletedAt = new Date()` instead of deleting.
- **Exclude deleted users:** In all queries that return users, filter by `deletedAt: null` so deleted users are not returned by default. Example:

  ```ts
  await prisma.user.findMany({ where: { deletedAt: null } });
  await prisma.user.findUnique({ where: { id, deletedAt: null } });
  ```

- **Foreign keys:** All relations use `onDelete: Restrict` so referenced users are not deleted.
- **Indexes:** `userId` and `token` are indexed on `EmailVerification`, `PasswordReset`, and `Session` for performance.
