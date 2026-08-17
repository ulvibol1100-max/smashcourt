# SmashCourt

Badminton racket e-commerce platform — Nike-inspired storefront with admin dashboard, cash-on-delivery checkout, and JWT auth.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router, Zustand, Tailwind CSS v4 |
| Backend | Node.js, Express, TypeScript, Prisma |
| Database | PostgreSQL 16 |
| Auth | JWT access token + httpOnly refresh cookie |
| DevOps | Docker Compose (Postgres, Adminer, API) |

## Project Structure

```
Badminton_Web/
├── apps/
│   ├── api/          # Express REST API
│   └── web/          # React storefront + admin
├── docker-compose.yml
└── package.json      # npm workspaces root
```

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
cp .env.example apps/api/.env
```

### 3. Start database (Docker)

```bash
docker compose up db adminer -d
```

Adminer UI: http://localhost:8080 (System: PostgreSQL, Server: `db`, User/Password/DB: `smashcourt`)

### 4. Run database migrations and seed

```bash
cd apps/api
npx prisma migrate dev --name init
npm run db:seed
```

### 5. Start development servers

From the repo root:

```bash
npm run dev:all
```

- Storefront: http://localhost:5173
- API: http://localhost:3001
- Health check: http://localhost:3001/health

### Full Docker stack

```bash
docker compose up --build
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smashcourt.com | admin123 |
| Customer | customer@smashcourt.com | customer123 |

Discount code: `WELCOME10` (10% off)

## API Endpoints

| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/refresh` | Cookie |
| GET | `/products` | Public |
| GET | `/products/:id` | Public |
| POST | `/products` | Admin |
| GET/PATCH/DELETE | `/cart/*` | Customer |
| POST | `/orders` | Customer |
| GET | `/orders` | Customer/Admin |
| PATCH | `/orders/:id/status` | Admin |
| GET/PATCH | `/users/me` | Customer |
| GET | `/admin/dashboard/summary` | Admin |
| GET | `/admin/customers` | Admin |
| GET | `/admin/inventory` | Admin |
| POST | `/admin/discounts` | Admin |
| GET | `/notifications` | Admin |

## Design Notes

Place custom font files in `apps/web/public/fonts/` and update `@font-face` rules in `apps/web/src/index.css`:

- **Trixy** — headings
- **PostampGrotFSK** — body/UI
- **Resist Mono** — labels, prices, SKUs

## Architecture Decisions

- **REST** over GraphQL (simpler CRUD, matches spec)
- **Express** over NestJS (lighter scaffold)
- **Zustand** over Redux Toolkit (minimal state needs)
- **Product variants** as fields on a single product (weight, grip size, string tension)
- **Self-run delivery** with geolocation pin + manual address fallback
- **English-only** storefront (i18n can be added later)

## Production (AWS)

- S3 for product images
- RDS for PostgreSQL
- EC2/ECS or Elastic Beanstalk for API
- CloudFront as CDN
