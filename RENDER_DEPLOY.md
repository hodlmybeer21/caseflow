# CaseFlow Deployment — Render + Neon

## What you need to do (Tyler)

### Step 1: Create Render Web Service
1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub: `hodlmybeer21/caseflow`
4. Settings:
   - **Name:** `caseflow`
   - **Branch:** `master`
   - **Root directory:** (leave empty — monorepo root)
   - **Environment:** Node
   - **Build command:** `npm install -g pnpm && pnpm install --frozen-lockfile && pnpm run build`
   - **Start command:** `node packages/api/dist/index.js`

### Step 2: Add Environment Variables
In Render dashboard → Environment tab:
- `DATABASE_URL` = `postgresql://neondb_owner:npg_yxvYdq53bAOh@ep-silent-tree-an3h4ihl-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require`
- `SESSION_SECRET` = run `openssl rand -hex 64` locally and paste result
- `NODE_ENV` = `production`
- `PORT` = (Render sets this automatically — don't hardcode)

### Step 3: Deploy
Click **Create Web Service** → Render clones the repo, runs build, starts server.

### Step 4: Test
- Health check: `https://caseflow.onrender.com/health` → `{"status":"ok"}`
- App: `https://caseflow.onrender.com/` → should show login page

---

## Troubleshooting

### Deploy fails
Check Render logs (click on deploy → Logs tab). Common issues:
- Build fails → check node/pnpm version compatibility
- Start fails → check DATABASE_URL is correct

### Static files 404
If `/` returns 404, the frontend bundle path is wrong. The api serves static files from `/app/packages/client/dist/public`.

### Database schema not created
Schema is in `packages/db/schema.ts`. Run manually:
```bash
pnpm run db:push
```
Or use Drizzle Studio: `pnpm run db:studio`

### First login
Create an admin user via the API:
```bash
curl -X POST https://caseflow.onrender.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpassword","role":"admin","displayName":"Admin","email":"admin@caseflow.com"}'
```

---

## Architecture
- **API:** Express 5 on Node.js, port from `PORT` env var
- **DB:** Neon PostgreSQL (already provisioned with schema)
- **Frontend:** React 19, served by Express static files
- **Auth:** Session-based with bcryptjs password hashing
- **Monorepo:** pnpm workspaces

## Database (Neon — already set up)
Existing Neon DB has all BrewAsset data. Schema is compatible.

## Cost
- Neon: free (no cold starts)
- Render: free tier (sleeps after 15 min inactivity, demo-quality only)
