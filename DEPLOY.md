# Deploy: Netlify (frontend) + Railway (backend)

This guide gets the frontend on **Netlify** and the backend on **Railway** so they work together.

---

## 1. Deploy backend to Railway

### 1.1 Create the project

1. Go to [railway.app](https://railway.app) and sign in.
2. **New Project** → **Deploy from GitHub repo** (connect GitHub if needed).
3. Select this repo (**Lau-website**).
4. Railway will detect the repo. We need to deploy **only the backend**:
   - In the new service, go to **Settings**.
   - Set **Root Directory** to `backend`.
   - Set **Build Command** to: `npm install && npx prisma generate && npm run build`
   - Set **Start Command** to: `npm start`
   - (Or leave defaults if Railway detects Next.js.)

### 1.2 Add PostgreSQL (Railway)

1. In the same project, click **New** → **Database** → **PostgreSQL**.
2. After it’s created, open the Postgres service → **Variables** (or **Connect**).
3. Copy **DATABASE_URL** (e.g. `postgresql://postgres:xxx@xxx.railway.app:5432/railway`).
4. In your **backend service** (the API), go to **Variables** and add:
   - `DATABASE_URL` = (the URL you just copied)

### 1.3 Backend environment variables (Railway)

In the **backend service** → **Variables**, add (or reuse from `.env`):

| Variable | Example / notes |
|----------|------------------|
| `DATABASE_URL` | From Railway Postgres (above). |
| `JWT_SECRET` | Long random string (e.g. from `openssl rand -base64 32`). |
| `FRONTEND_URL` | Your Netlify URL, e.g. `https://your-app.netlify.app` (no trailing slash). |
| `BACKEND_URL` | Leave empty for now; set after deploy (see below). |
| `STRIPE_SECRET_KEY` | Your live key `sk_live_...`. |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Dashboard → Webhooks (after you add the webhook URL). |
| `STRIPE_REGISTRATION_PRICE_PENCE` | `2499` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your Gmail address. |
| `SMTP_PASS` | Gmail App Password. |
| `EMAIL_FROM` | `Woo-Huahua Microchipping Database <your@gmail.com>` |
| `OPENAI_API_KEY` | If you use AI chat. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | For `npx prisma db seed` (optional; can run once from your machine). |

**After first deploy:** Railway gives you a URL like `https://your-backend.up.railway.app`. Set:

- **BACKEND_URL** = `https://your-backend.up.railway.app`  
  (Used in verification emails and Stripe success URL.)

Then run migrations once (from your machine or Railway shell):

```bash
cd backend
DATABASE_URL="your-railway-database-url" npx prisma migrate deploy
```

(Or in Railway: add a one-off run or use **Settings → Deploy → Run Command** if available.)

---

## 2. Deploy frontend to Netlify

### 2.1 Connect the repo

1. Go to [netlify.com](https://netlify.com) and sign in.
2. **Add new site** → **Import an existing project** → **GitHub** → select **Lau-website**.
3. Netlify will use the repo root. Settings should match `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** (leave empty; build runs from root).

### 2.2 Frontend environment variable (Netlify)

1. **Site settings** → **Environment variables** → **Add a variable**.
2. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** Your Railway backend URL, e.g. `https://your-backend.up.railway.app`
   - No trailing slash.

3. **Save**, then trigger a **new deploy** (Deploys → Trigger deploy) so the new variable is used in the build.

---

## 3. Stripe (production)

1. **Stripe Dashboard** → **Developers** → **Webhooks** → **Add endpoint**.
2. **Endpoint URL:** `https://your-backend.up.railway.app/api/payments/webhook`
3. **Events:** `checkout.session.completed`.
4. Copy the **Signing secret** (`whsec_...`) and add it in Railway as **STRIPE_WEBHOOK_SECRET**.

---

## 4. Checklist

- [ ] Railway: backend deployed, **Root Directory** = `backend`, **DATABASE_URL** and other vars set.
- [ ] Railway: **BACKEND_URL** = your Railway backend URL.
- [ ] Railway: **FRONTEND_URL** = your Netlify URL.
- [ ] Netlify: **VITE_API_URL** = your Railway backend URL; new deploy after adding it.
- [ ] Migrations run on production DB (`npx prisma migrate deploy` with production `DATABASE_URL`).
- [ ] Stripe webhook added for production URL; **STRIPE_WEBHOOK_SECRET** in Railway.

After that, the Netlify site will call the Railway API and emails/Stripe will use the correct URLs.
