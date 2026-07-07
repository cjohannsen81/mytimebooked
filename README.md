# MyTimeBooked 🏡

A local services booking marketplace — find and book trusted help for your home and family: housekeeping, babysitting, dog walking, pet sitting, lawn & garden, handyman work, senior care, and tutoring.

Sister project to [CoachBooked](https://github.com/cjohannsen81/coachbooked), sharing the same single-VM deployment architecture with a fresh design and a service-jobs domain model.

## Stack

- **Backend**: Node.js + Express + Prisma + PostgreSQL (Docker)
- **Frontend**: React + Vite + React Router + TailwindCSS
- **Auth**: JWT with bcrypt
- **Deploy**: Single GCP VM — nginx + PM2, GitHub Actions on push to `main`

## Features

### For customers
- Browse providers by service category, city, or keyword
- View provider profiles with services, rates, reviews, and open time slots
- Book a time slot with an address and notes
- Track pending / confirmed / completed bookings
- Leave a review after a completed job

### For providers (pros)
- Sign up as a pro with headline, bio, city, and experience
- List services with hourly rates and minimum hours
- Publish availability windows
- Accept, decline, complete, or cancel booking requests
- Dashboard with upcoming jobs and earnings summary

## Quick start (local dev)

### 1. Database

```bash
docker run -d --name mytimebooked-pg \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=mytimebooked -p 5432:5432 postgres:16
```

### 2. Backend

```bash
cd server
cp .env.example .env
npm install
npx prisma migrate deploy
npm run seed
npm run dev
# API on http://localhost:4000
```

### 3. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
# App on http://localhost:5173
```

Demo logins (seeded): `demo@mytimebooked.com / password123` (customer), `maria.santos@mytimebooked.com / password123` (pro).

## Environment variables

### Server (`server/.env`)
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mytimebooked?schema=public"
JWT_SECRET="change-me-to-a-long-random-string-in-production"
CLIENT_URL="http://localhost:5173"
PORT=4000
```

### Client (`client/.env`)
```
VITE_API_URL="http://localhost:4000/api"
```

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register as customer or provider |
| POST | /api/auth/login | Log in |
| GET | /api/auth/me | Current user |
| GET | /api/providers | List/search providers (`?category=&q=`) |
| GET | /api/providers/:id | Provider profile with services, slots, reviews |
| GET/PUT | /api/providers/me | Own provider profile (create/update) |
| POST/PUT/DELETE | /api/providers/me/services[/:id] | Manage services |
| GET | /api/availability/:providerId | Provider's future open windows |
| POST/DELETE | /api/availability[/:id] | Manage availability windows |
| POST | /api/bookings | Book a job |
| GET | /api/bookings/me | My bookings (role-aware) |
| PATCH | /api/bookings/:id/status | Confirm / decline / complete / cancel |
| POST | /api/reviews | Review a completed booking |

## Production deployment

One-time VM bootstrap (fresh Ubuntu 22.04/24.04):

```bash
curl -fsSL https://raw.githubusercontent.com/cjohannsen81/mytimebooked/main/bootstrap.sh | bash
```

After that, every push to `main` deploys via `.github/workflows/deploy.yml` (requires repo secrets `VM_USER`, `VM_HOST`, `VM_SSH_KEY`).

Once DNS for mytimebooked.com points at the VM:

```bash
sudo certbot certonly --webroot -w /var/www/certbot \
  -d mytimebooked.com -d www.mytimebooked.com
sudo chmod 755 /etc/letsencrypt/live /etc/letsencrypt/archive
```

The next deploy auto-switches nginx to the HTTPS config.

## Notes / next steps

- Payments are offline for v1 (pay the pro directly); Stripe Connect is the natural next step, mirroring CoachBooked.
- Transactional email (booking confirmations, password reset) not yet wired.
- All times stored in UTC, displayed in the browser's local timezone.
