# Render Deployment Guide

## Render Services Needed
1. **PostgreSQL** (Render hosted) — free tier: 1 database, 1 row limit, sleeps after 90 days
2. **Web Service** (Node.js) — free tier: sleeps after 15 min inactivity

## Alternative: Neon PostgreSQL (RECOMMENDED)
Use the existing Neon database (already has all schema):
- Connection: already configured in Render as DATABASE_URL env var
- Note: Neon free tier does NOT sleep — better for demo

## Manual Render Setup

### 1. Create Web Service
- Connect GitHub repo: `hodlmybeer21/caseflow`
- Branch: `main`
- Root directory: leave empty (monorepo root)
- Build command: `pnpm install --frozen-lockfile && pnpm run build`
- Start command: `node packages/api/dist/index.js`
- Environment: Node

### 2. Environment Variables
Add in Render dashboard:
- `DATABASE_URL` = Neon connection string (from /etc/environment: `postgresql://neondb_owner:npg_yxvYdq53bAOh@ep-silent-tree-an3h4ihl-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require`)
- `SESSION_SECRET` = generate with `openssl rand -hex 64`
- `NODE_ENV` = production

### 3. Health Check
- Path: `/health`
- Render auto-checks this after each deploy

## GitHub Push → Deploy (CI/CD)
Render has auto-deploy from GitHub enabled. Every push to `main` triggers a deploy.

## Current Status
🚧 In progress — caseflow repo does not yet exist on GitHub.
