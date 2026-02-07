# What to do next – Woo-Huahua

Use this as a simple checklist so you’re not lost.

---

## Right now (both must be running)

1. **Backend**  
   In a terminal:
   ```bash
   cd backend
   npm run dev
   ```
   Leave it running. You should see: `Ready on http://localhost:3000`.

2. **Frontend**  
   In a **second** terminal:
   ```bash
   npm run dev
   ```
   (from the project root, e.g. `Lau-website`).  
   Leave it running. You should see something like: `Local: http://localhost:8080`.

3. **Open the site**  
   In your browser go to: **http://localhost:8080**  
   (That’s the frontend. The backend is on port 3000 and is used by the frontend in the background.)

---

## Test login and signup (frontend → backend)

4. **Sign up**  
   - Go to **http://localhost:8080/signup**  
   - Fill in the form (email + password are required by the backend; other fields are for your UI only).  
   - Submit. You’ll be redirected to a **“Check your email”** page.

5. **Verify email**  
   - On the “Check your email” page you’ll see a **“Verify now”** link (or open it from your email when you add real email later).  
   - Click that link to verify. You can also copy the verification URL from the backend terminal and open it in the browser.

6. **Log in**  
   - Go to **http://localhost:8080/login** (or click “Go to sign in” from the verify page).  
   - Use the same email and password you used for signup.  
   - Submit. You’ll be signed in and redirected to the **dashboard**.  
   - The app stores your session (JWT); the dashboard is protected and will send you to login if you’re not signed in.

---

## After that

7. **Protected pages**  
   Use the stored token (e.g. in `localStorage`) to call other backend APIs that require login (you’ll add those later).

8. **More backend features**  
   When you’re ready, add things like password reset, profile, pets, etc., following your project plan.

---

## If something doesn’t work

- **“Network” or “Failed to fetch”**  
  Make sure the **backend** is running on port 3000 and that nothing is blocking it (firewall, etc.).

- **Frontend can’t reach backend**  
  In the project root (not inside `backend`), create a file named `.env` and add:
  ```env
  VITE_API_URL=http://localhost:3000
  ```
  Then restart the frontend (`npm run dev`).

- **Login/signup returns an error**  
  Check the backend terminal for errors. Check the browser dev tools (F12 → Network) to see the request and response.

You’re not lost: just follow the list from step 1. When one step works, move to the next.
