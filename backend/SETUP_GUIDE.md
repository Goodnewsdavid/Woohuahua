# Backend setup guide (PostgreSQL + Next.js)

Follow these steps in order. You only need to do **Part 1** once per machine; **Part 2** once per project; **Part 3** whenever you pull the project or change the database.

---

## Part 1: Install PostgreSQL on your computer (one-time)

### Step 1.1 – Download PostgreSQL

1. Go to: **https://www.postgresql.org/download/windows/**
2. Click **“Download the installer”** (from EDB).
3. Download the **latest version** (e.g. PostgreSQL 17) for Windows x86-64.
4. Run the installer.

### Step 1.2 – Run the installer

1. Click **Next** through the welcome screen.
2. **Installation directory**: leave default, click **Next**.
3. **Select components**: keep **PostgreSQL Server**, **pgAdmin 4**, and **Command Line Tools** checked. Click **Next**.
4. **Data directory**: leave default, click **Next**.
5. **Password**: choose a password for the `postgres` user.
   - **Write it down** (e.g. `postgres123` for learning – use something stronger later).
   - You will need this for `DATABASE_URL` in Step 2.2.
6. **Port**: leave **5432**, click **Next**.
7. **Locale**: leave default, click **Next**.
8. Click **Next** again, then **Finish**.

### Step 1.3 – Check that PostgreSQL is running

1. Press **Win + R**, type `services.msc`, press Enter.
2. Find **“postgresql-x64-17”** (or similar, number = your version).
3. Status should be **“Running”**. If not, right‑click → **Start**.

You can also open **pgAdmin 4** from the Start menu; if it connects to the server, PostgreSQL is running.

---

## Part 2: Create the database and connect your project (once per project)

### Step 2.1 – Create the database `woo_huahua_db`

**Option A – Using pgAdmin (easiest if you’re new)**

1. Open **pgAdmin 4** from the Start menu.
2. In the left tree, expand **Servers** → **PostgreSQL 17** (or your version).
3. When asked for the postgres password, enter the password you set in Step 1.2.
4. Right‑click **Databases** → **Create** → **Database**.
5. **Database** name: `woo_huahua_db`.
6. Click **Save**.

**Option B – Using command line**

1. Open **Command Prompt** or **PowerShell**.
2. Go to PostgreSQL’s `bin` folder (adjust version if different):
   ```bat
   cd "C:\Program Files\PostgreSQL\17\bin"
   ```
3. Create the database (replace `YOUR_POSTGRES_PASSWORD` with your real password):
   ```bat
   psql -U postgres -c "CREATE DATABASE woo_huahua_db;"
   ```
4. When prompted, enter the postgres password.

### Step 2.2 – Set your `.env` file

1. In your project, open the **backend** folder.
2. Copy `.env.example` and name the copy **`.env`** (same folder as `.env.example`).
3. Open **`.env`** and set:

- **USER** → `postgres`  
- **PASSWORD** → the password you set for the `postgres` user in Step 1.2  
- **Database name** is already `woo_huahua_db` in the example  

Example (replace `YourPassword` with your real password):

```env
DATABASE_URL="postgresql://postgres:YourPassword@localhost:5432/woo_huahua_db"
JWT_SECRET="your-jwt-secret-change-in-production"
```

4. Save the file.  
   **Important:** Never commit `.env` to Git (it should already be in `.gitignore`).

### Step 2.3 – Install dependencies and create tables

In a terminal, go to the **backend** folder and run:

```bash
cd c:\Users\user\OneDrive\Desktop\Lau-website\backend
npm install
npx prisma generate
npx prisma migrate dev --name init
```

- **`npm install`** – installs packages (Next.js, Prisma, bcrypt, etc.).
- **`prisma generate`** – generates the Prisma client.
- **`prisma migrate dev`** – creates all tables (User, Session, EmailVerification, etc.) in `woo_huahua_db`.

If it asks to create a new migration, type **Y** and Enter.  
When it finishes, your database is ready.

---

## Part 3: Run the backend (every time you work on the project)

### Step 3.1 – Start the dev server

In the **backend** folder:

```bash
npm run dev
```

You should see something like: **“Ready on http://localhost:3000”**.

### Step 3.2 – Test that the API works

1. Open **Postman**, **Thunder Client** (VS Code), or **curl**.
2. Test **signup**:

   - **Method:** POST  
   - **URL:** `http://localhost:3000/api/auth/signup`  
   - **Body (JSON):**
     ```json
     {
       "email": "test@example.com",
       "password": "password123"
     }
     ```

3. You should get a success response and, in the terminal where `npm run dev` is running, a line like: **“Verification URL: ...”**.

If that works, PostgreSQL is set up correctly and your backend is running.

---

## Part 3.5: Dummy data for client demo (optional)

To show the client how the design looks with sample pets (e.g. on **My Pets**), you can seed the database with dummy data:

1. In the **backend** folder, run:
   ```bash
   npm run db:seed
   ```
2. This adds a demo user (if needed) and **3 sample pets** (Bella, Max, Luna) for that user.
3. **Demo login:** email `test@gmail.com`, password `demo12345` (if the demo user was created by the seed). If you already had a user with that email, the seed only adds pets to that account—log in with your existing password.
4. Open **My Pets** (or Dashboard) to see the dummy pets.

**When you publish:** Use a production database without running the seed, or delete the demo user/pets. Real users will then see only their own data.

---

## Part 4: Deployment / production

### Environment variables

For **production**, set these (e.g. in your host’s dashboard or CI):

| Variable        | Description |
|----------------|-------------|
| `DATABASE_URL` | PostgreSQL connection string for the production database. |
| `JWT_SECRET`   | Long random string (e.g. 32+ chars). **Never** use the dev value in production. |
| `FRONTEND_URL` | Full origin of the frontend (e.g. `https://your-app.vercel.app`) for CORS and reset links. |

### Database migrations in production

After deploying schema changes, run migrations against the **production** database (with `DATABASE_URL` pointing at prod):

```bash
npx prisma migrate deploy
```

Use `migrate deploy` in production (not `migrate dev`). Run this from CI or a one-off deploy step.

### Building the backend

```bash
cd backend
npm ci
npx prisma generate
npm run build
```

Then start with `npm start` (or your host’s start command). The frontend must call this API’s URL (see below).

### Building the frontend

In the **frontend** (project root or `frontend` folder, depending on your layout):

1. Set **`VITE_API_URL`** to your backend API base URL (e.g. `https://api.yoursite.com` or your Next.js API URL).
2. Build:

   ```bash
   npm run build
   ```

3. Serve the built files (e.g. `dist/`) with any static host (Vercel, Netlify, Nginx, etc.).

### Hosting options (summary)

- **Backend:** Any Node.js host that runs Next.js (Vercel, Railway, Render, your own server). Ensure the production DB is created and `DATABASE_URL` is set; run `prisma migrate deploy` on deploy.
- **Frontend:** Any static host. Set `VITE_API_URL` so the app talks to your backend.
- **CORS:** Backend `middleware.ts` uses `FRONTEND_URL` for `Access-Control-Allow-Origin`. Set `FRONTEND_URL` in production to your frontend origin.

---

## Quick reference

| Task                     | Command (in `backend` folder)     |
|--------------------------|-----------------------------------|
| Install packages         | `npm install`                     |
| Create/update DB tables  | `npx prisma migrate dev`          |
| Regenerate Prisma client | `npx prisma generate`             |
| Start backend            | `npm run dev`                     |
| Production DB migrations| `npx prisma migrate deploy`       |
| Add dummy pets (demo)    | `npm run db:seed`                 |
| Open DB in a GUI         | `npx prisma studio` (browser)     |

---

## Common issues

**“Can’t connect to PostgreSQL” / “password authentication failed”**

- Check that the password in `.env` matches the postgres user password.
- Make sure PostgreSQL service is **Running** in `services.msc`.

**“Database woo_huahua_db does not exist”**

- Create the database (Step 2.1) and try again.

**“Port 5432” or “address already in use”**

- Another program may be using port 5432, or another PostgreSQL instance is running. In `services.msc`, check for multiple PostgreSQL services.

**Prisma errors after changing `schema.prisma`**

- Run:
  ```bash
  npx prisma generate
  npx prisma migrate dev --name describe_your_change
  ```

If you hit an error not listed here, copy the **exact message** and the step you were on – that will make it easier to fix.

---

## How to delete a user from the database

The **User** table is linked to **Session** and **EmailVerification**. You must delete those related rows first, then the user. Otherwise you’ll get a foreign key error like:  
`update or delete on table "User" violates foreign key constraint "EmailVerification_userId_fkey"`.

### Option 1: Query Tool in pgAdmin

1. In pgAdmin, right‑click **woo_huahua_db** → **Query Tool**.
2. Run these in order (replace the email with the one you want to remove):

```sql
-- 1) Delete this user's sessions
DELETE FROM "Session"
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'user@example.com');

-- 2) Delete this user's email verification records
DELETE FROM "EmailVerification"
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'user@example.com');

-- 3) Delete the user
DELETE FROM "User" WHERE email = 'user@example.com';
```

3. Run each block (F5 or Execute). The user and their related rows will be removed.

### Option 2: Delete from the grid (pgAdmin)

1. Right‑click **User** → **View/Edit Data** → **All Rows**.
2. Select the row to delete and click the **trash** icon, then **Save** (floppy disk).
3. If you see the foreign key error, use **Option 1** instead so you delete **Session** and **EmailVerification** first, then **User**.
