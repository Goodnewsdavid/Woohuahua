# Admin UI – Setup

The admin interface is under `/admin/*` in the same Vite + React app. Admins use the same login API; access is role-based (`ADMIN` only).

## 1. Backend: Prisma

Run once (from project root or `backend/`):

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

Or for development with a local DB:

```bash
cd backend
npx prisma migrate dev
```

This applies the migration that adds:

- **Dispute** model (for Disputes & Complaints)
- **escalationResolvedAt** on `ChatSession` and `CallSession`

## 2. Create an admin user

Admin accounts are created manually (no self-signup). Options:

- **Option A – DB:** In Prisma Studio or SQL, set `role = 'ADMIN'` for a user.
- **Option B – Seed:** In `backend/prisma/seed.ts`, create or update a user with `role: 'ADMIN'` and run `npx prisma db seed`.

## 3. Run the app

- **Backend:** `cd backend && npm run dev` (e.g. http://localhost:3000)
- **Frontend:** from project root, `npm run dev` (e.g. http://localhost:8080)

Frontend env: ensure `VITE_API_URL=http://localhost:3000` in `.env` at project root if needed.

## 4. Use the admin UI

- Open **http://localhost:8080/admin/login** (or use “Admin Login” on the main login page).
- Sign in with an account that has `role = 'ADMIN'`.
- You’ll be redirected to **/admin/dashboard**. From there you can use Users, Pets, Disputes, Escalations, and Audit Logs.

## Routes

| Path | Description |
|------|-------------|
| `/admin/login` | Admin-only login (same API; rejects non-ADMIN). |
| `/admin/dashboard` | Overview cards (users, pets, open disputes, pending escalations). |
| `/admin/users` | User management (search, deactivate, soft-delete). |
| `/admin/pets` | Read-only pets and microchips. |
| `/admin/disputes` | Disputes & complaints (filter, timeline, status update). |
| `/admin/escalations` | AI chat/call escalations (mark resolved). |
| `/admin/logs` | Audit view from existing data (chat, call, user). |

All admin routes (except `/admin/login`) require a valid JWT with `role === 'ADMIN'`; the backend checks this on `/api/admin/*`.
