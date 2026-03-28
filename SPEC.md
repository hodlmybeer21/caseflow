# CaseFlow — Beverage Distribution POS

## What it is
Modern point-of-sale and inventory management system for beverage distributors.
Track customers, reps, brands, inventory, events, promo staff, and account assets.

## Tech Stack
- **Backend:** Express 5 (CommonJS bundle) on Node.js 20
- **ORM:** Drizzle ORM with PostgreSQL
- **Database:** Neon PostgreSQL (free tier, already provisioned)
- **Frontend:** React 19 + Vite 5 + Tailwind CSS v4
- **Auth:** Express-session with SHA-256 password hashing
- **Deployment:** Render.com (web service) + Neon (database)
- **Package manager:** pnpm (monorepo workspace)

## Architecture

```
caseflow/
├── SPEC.md                      # This file
├── package.json                  # pnpm workspace root
├── pnpm-workspace.yaml
├── packages/
│   ├── db/                      # Drizzle schema + Neon connection
│   │   ├── package.json
│   │   ├── drizzle.config.ts
│   │   ├── schema.ts             # All table definitions
│   │   └── connection.ts         # Neon PostgreSQL connection
│   ├── api/                      # Express 5 backend
│   │   ├── package.json
│   │   ├── build.ts              # esbuild bundle script
│   │   ├── dist/
│   │   │   ├── index.js          # START COMMAND: node packages/api/dist/index.js
│   │   │   └── index.cjs         # CommonJS bundle (internal)
│   │   └── src/
│   │       ├── index.ts          # Entry: creates HTTP server
│   │       ├── app.ts            # Express app setup
│   │       ├── routes/           # All API routes
│   │       ├── lib/              # Auth, db client, utils
│   │       └── middleware/
│   └── client/                    # React frontend
│       ├── package.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── api/              # API client
│           ├── components/       # Reusable UI components
│           └── pages/            # Route pages
```

## Key Lessons from BrewAsset
1. **Bundle format:** Use `index.js` (NOT `index.cjs`) for Render's startCommand
2. **Static path:** Hardcode `/app/artifacts/client/dist/public` — do NOT use `process.cwd()` (broken in esbuild bundle)
3. **PORT env:** Render provides `PORT` env var — Express listens on this
4. **DATABASE_URL:** Set in Render env vars — Neon connection string
5. **Neon SSL:** Use `?sslmode=require` in connection string

## Database Schema (from BrewAsset, cleaned up)

### users
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| username | varchar(50) UNIQUE | login name |
| email | varchar(255) UNIQUE | for password reset |
| password_hash | varchar(255) | SHA-256 |
| role | varchar(20) | 'admin' \| 'manager' \| 'rep' \| 'staff' |
| display_name | varchar(100) | |
| created_at | timestamp | |

### customers
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | varchar(255) | company/account name |
| rep_username | varchar(50) FK | assigned rep |
| active | boolean | |
| created_at | timestamp | |

### brands
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | varchar(255) | |
| category | varchar(100) | beer, wine, spirits, etc. |
| created_at | timestamp | |

### inventory
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| brand_id | int FK | |
| quantity | int | |
| updated_at | timestamp | |

### events
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| customer_id | int FK | |
| event_type | varchar(100) | tasting, demo, promo |
| event_date | date | |
| notes | text | |
| created_at | timestamp | |

### promo_staff
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | varchar(255) | |
| event_id | int FK | |
| active | boolean | |

### account_assets
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| customer_id | int FK | |
| brand_id | int FK | |
| asset_type | varchar(50) | cooler, tap, signage |
| serial_number | varchar(100) | |
| placed_date | date | |
| created_at | timestamp | |

### transfers
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| from_account_id | int FK | |
| to_account_id | int FK | |
| brand_id | int FK | |
| quantity | int | |
| transferred_at | timestamp | |

### pos_requests
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| customer_id | int FK | |
| brand_id | int FK | |
| quantity | int | |
| status | varchar(20) | pending/approved/fulfilled |
| requested_at | timestamp | |

## API Routes

### Auth
- `POST /api/auth/login` — username + password → session cookie
- `POST /api/auth/logout` — destroy session
- `GET /api/auth/me` — current user info
- `POST /api/auth/forgot-password` — send reset email
- `POST /api/auth/reset-password` — token + new password

### Users (admin only)
- `GET /api/users` — list all users
- `POST /api/users` — create user
- `PATCH /api/users/:id` — update user
- `DELETE /api/users/:id` — deactivate user

### Customers
- `GET /api/customers` — list (filtered by rep if rep role)
- `POST /api/customers` — create
- `PATCH /api/customers/:id` — update
- `DELETE /api/customers/:id` — deactivate

### Brands
- `GET /api/brands` — list all
- `POST /api/brands` — create
- `PATCH /api/brands/:id` — update
- `DELETE /api/brands/:id` — deactivate

### Inventory
- `GET /api/inventory` — list all inventory items
- `POST /api/inventory` — add stock record
- `PATCH /api/inventory/:id` — update quantity

### Events
- `GET /api/events` — list events
- `POST /api/events` — create event
- `PATCH /api/events/:id` — update
- `GET /api/events/:id/report` — event report

### Promo Staff
- `GET /api/promo-staff` — list
- `POST /api/promo-staff` — create
- `PATCH /api/promo-staff/:id` — update

### Account Assets
- `GET /api/account-assets` — list
- `POST /api/account-assets` — create
- `PATCH /api/account-assets/:id` — update
- `DELETE /api/account-assets/:id` — remove

### Transfers
- `GET /api/transfers` — list
- `POST /api/transfers` — create transfer

### POS Requests
- `GET /api/requests` — list pending
- `POST /api/requests` — create request
- `PATCH /api/requests/:id` — approve/fulfill

## Frontend Pages
1. **Login** — username/password, forgot password link
2. **Dashboard** — overview stats (customers, inventory, pending requests)
3. **Customers** — list, search, add/edit, view account assets
4. **Brands** — list, add/edit
5. **Inventory** — stock levels by brand
6. **Events** — calendar/list view, create, event reports
7. **Promo Staff** — manage promo staff assignments
8. **POS Requests** — pending requests queue with approve/fulfill
9. **Settings** — user management (admin), password change

## Render Deployment Config
- **Start command:** `node packages/api/dist/index.js`
- **Build command:** `pnpm install --frozen-lockfile && pnpm --filter @caseflow/api run build`
- **Env vars:**
  - `DATABASE_URL` = Neon connection string (Neon free tier)
  - `SESSION_SECRET` = random 64-char hex string
  - `PORT` = Render-provided (do not hardcode)
- **Health check:** GET `/health` → `{ "status": "ok" }`
- **Static files:** Served by Express from `/app/artifacts/client/dist/public`
- **Free tier:** Render's free tier sleeps after 15 min inactivity — acceptable for demo

## Design
- Clean, professional SaaS aesthetic
- Navy/dark blue primary with amber accent
- Tailwind CSS v4 with custom theme
- Mobile-responsive
- Dark mode support (future)

## Resend Email (password reset)
- Use Resend API for transactional email
- API key stored in `/etc/environment`
- Password reset flow: generate JWT token → send email with reset link
