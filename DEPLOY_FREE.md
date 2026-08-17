# Free student deployment: Vercel + Render + Neon

This project is prepared for a free student/demo deployment. It uses Vercel for the React website, Render for the Express API, and Neon for PostgreSQL.

## 1. Put the project on GitHub

Create a new empty GitHub repository, then run these commands from the project folder in VS Code:

```powershell
git init
git add .
git commit -m "Prepare SmashCourt for deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/smashcourt.git
git push -u origin main
```

Do not upload `.env` files or database passwords to GitHub. They are already ignored by `.gitignore`.

## 2. Create the free Neon database

1. Sign up at https://neon.com.
2. Create a project called `smashcourt` and choose PostgreSQL.
3. Open **Connect** and copy the complete connection string beginning with `postgresql://`.
4. Keep it private. You will paste it into Render as `DATABASE_URL`.

## 3. Deploy the API to Render

1. Sign up at https://render.com with GitHub.
2. Select **New** > **Blueprint** and choose the SmashCourt repository.
3. Render reads `render.yaml` and creates the `smashcourt-api` service.
4. Set these variables before deploying:

```text
DATABASE_URL=<paste the Neon connection string>
CORS_ORIGIN=https://YOUR-VERCEL-SITE.vercel.app
```

5. Click **Apply** and deploy.
6. Copy the public API URL, for example `https://smashcourt-api.onrender.com`.
7. Open `https://YOUR-RENDER-URL/health`. It should return JSON with `status: "ok"`.

The API applies the Prisma migration automatically and seeds demo products and accounts on its first start. Change the demo admin password after presenting your project.

## 4. Deploy the website to Vercel

1. Sign up at https://vercel.com with GitHub.
2. Select **Add New** > **Project**, then import the SmashCourt repository.
3. Set **Root Directory** to `apps/web`.
4. In **Environment Variables**, add:

```text
VITE_API_URL=https://YOUR-RENDER-URL
```

5. Click **Deploy**.
6. Copy the Vercel website URL.

## 5. Fix CORS and redeploy API

In Render, update `CORS_ORIGIN` with the exact Vercel URL, for example:

```text
https://smashcourt-your-name.vercel.app
```

Save the variable and redeploy the API. Then test registration, login, cart, and an order from the Vercel website.

## Free-plan behavior

- Render free web services sleep after 15 minutes without traffic. The first request can take about one minute.
- Neon free databases have limited storage and scale down while idle.
- Vercel Hobby is for personal/student, non-commercial projects.

## Production note

The API stores uploaded files locally. Render free services use temporary storage, so uploaded product images will disappear after a restart. Keep using remote image URLs for the demo, or add cloud storage before using this as a real shop.
