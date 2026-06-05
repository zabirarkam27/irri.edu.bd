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

- Node.js 20 or newer
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

Run database migrations:

```powershell
npm run prisma:migrate --workspace=backend
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

## Default Admin

The seed script reads the default admin credentials from `backend/.env`:

```env
SEED_ADMIN_EMAIL="admin@irri.edu.com"
SEED_ADMIN_PASSWORD="ChangeMe123!"
```

Change the email and password before seeding any production database.

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
