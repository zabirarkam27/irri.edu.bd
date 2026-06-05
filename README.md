# International Rabindra Research Institute Website

Production-oriented CMS website scaffold for International Rabindra Research Institute (IRRI). The project is split into a Next.js frontend and an Express/Prisma backend that communicate over REST APIs.

## Live Site

- Vercel: https://irri-edu-bd.vercel.app

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, Auth.js-compatible credentials flow
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, Zod, bcrypt, JWT
- Security: Helmet, CORS, rate limits, RBAC middleware, centralized errors

## Structure

```txt
frontend/   Next.js public website and admin dashboard
backend/    Express REST API, Prisma schema, seed data
```

## Setup

1. Install dependencies: `npm install`
2. Copy env files: `copy frontend\.env.example frontend\.env.local` and `copy backend\.env.example backend\.env`
3. Update database and secrets in `backend/.env`
4. Generate Prisma client: `npm run prisma:generate --workspace=backend`
5. Run migrations: `npm run prisma:migrate --workspace=backend`
6. Seed data: `npm run seed --workspace=backend`
7. Start both apps: `npm run dev`

## Local URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

## Default Admin

The seed command reads admin credentials from environment variables:

```env
SEED_ADMIN_EMAIL="admin@irri.edu.com"
SEED_ADMIN_PASSWORD="ChangeMe123!"
```

Change these before production use.

## Security Notes

Never commit real `.env` files or production secrets. Use strong JWT/Auth secrets, HTTPS, strict CORS origins, secure cookies, and database backups in production.
