# International Rabindra Research Institute Website

CMS-driven website and admin dashboard for the International Rabindra Research Institute (IRRI). The project is split into a Next.js frontend and an Express/Prisma backend that communicate through REST APIs.

## Live Links

- Website: https://irri-edu-bd.vercel.app
- Admin: https://irri-edu-bd.vercel.app/admin/login
- Repository: https://github.com/zabirarkam27/irri.edu.bd

## Tech Stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, Auth.js/NextAuth
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL
- Validation and security: Zod, bcrypt, JWT, Helmet, CORS, rate limiting

## Project Structure

```txt
frontend/   Public website and admin dashboard
backend/    REST API, Prisma schema, seed scripts
```

## Prerequisites

- Node.js 22 LTS or newer
- npm
- PostgreSQL database

## Environment Setup

Copy the example files and update the values for your machine:

```powershell
copy frontend\.env.example frontend\.env.local
copy backend\.env.example backend\.env
```

Important values:

- `backend/.env`: set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, and seed admin credentials.
- `frontend/.env.local`: set `NEXT_PUBLIC_API_BASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`.
- Never commit real `.env` files or production secrets.

## Installation

Install all workspace dependencies from the repository root:

```powershell
npm install
```

Generate the Prisma client:

```powershell
npm run prisma:generate --workspace=backend
```

Apply the tracked migrations to a new, empty PostgreSQL database:

```powershell
npm run prisma:deploy --workspace=backend
```

Seed the first admin user and starter content:

```powershell
npm run seed --workspace=backend
```

## Development

Start frontend and backend together:

```powershell
npm run dev
```

Or run them separately:

```powershell
npm run dev:frontend
npm run dev:backend
```

Local URLs:

- Frontend: http://localhost:3000
- Admin login: http://localhost:3000/admin/login
- Backend: http://localhost:5000
- Health check: http://localhost:5000/health

## Admin Setup

The seed script reads the default admin credentials from `backend/.env`:

```env
SEED_ADMIN_EMAIL="admin@irri.edu.com"
SEED_ADMIN_PASSWORD=""
```

Set an email you control and a unique password of at least 12 characters. Generate separate random values for `JWT_SECRET` and `NEXTAUTH_SECRET` by running the following once for each secret:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Use `npm run prisma:migrate --workspace=backend -- --name <change>` to create future migrations on a development database. For an existing database without migration history, take a verified backup and compare its schema with the initial migration before baselining. Mark the initial migration applied with `prisma migrate resolve --applied 20261119000000_initial` only after confirming the schema matches. Do not use reset on an existing database.

`/health` checks the API process. `/ready` checks PostgreSQL connectivity. The optional sample seed requires a local disposable database whose name ends in `_sample`.

## Useful Commands

```powershell
npm run build
npm run lint
npm run prisma:studio --workspace=backend
```

## Deployment Notes

- Deploy the frontend on Vercel.
- Deploy the backend with a Node.js host that can reach the PostgreSQL database.
- Set production environment variables in the hosting dashboard.
- Use strong secrets, HTTPS-only URLs, secure CORS origins, and regular database backups.
