# Phase 1: Technical Foundations

This phase covers tasks 1.1–1.6 in `CODEX_PHASES.md` and the stabilization work in `plan.md`.

## Configuration and database

Use the workspace env templates and generate separate backend JWT and frontend Auth.js secrets. Only the website and API URLs belong in `NEXT_PUBLIC_*`. Both apps report configuration errors by variable name. Use `prisma:deploy` on a fresh database. Follow the baseline procedure in the root README for an existing database without migration history.

The initial migration represents the checked-in schema without changing existing models. The standard seed preserves an existing administrator and institution profile when rerun. The sample seed is restricted to disposable local databases named with an `_sample` suffix.

## Authentication and permission checks

The Auth.js credentials provider sends the login request to Express. The backend access token stays in the encrypted HTTP-only Auth.js session cookie. The admin layout checks the session through `/auth/me`. A disabled user or expired token loses access. Each protected backend request loads the current role from PostgreSQL. Sign-out clears the application session. Directly issued bearer tokens expire independently.

| Route or operation | Backend access |
| --- | --- |
| `GET /auth/me` | Active authenticated user |
| CMS create and media upload | Super admin, admin, editor |
| CMS update | Super admin, admin, editor, moderator |
| CMS delete | Super admin, admin |
| Read contact inbox | Super admin, admin, moderator |
| Read audit log | Super admin, admin |
| Audit log writes | Internal audit writer |

CMS write inputs reject protected columns and nested relation mutations. List queries and record paths have validation, and API error bodies retain `success` and `message`. Login and contact have separate rate limits. Auth.js handles CSRF protection for the credential and sign-out endpoints. The protected Express API uses bearer authentication. Existing React content rendering escapes text. Any future rich HTML renderer needs sanitization.

Uploads retain the existing file type allowlist and 10 MiB limit. MIME metadata alone cannot prove file contents. Persistent storage and complete file lifecycle management belong to the media phase. Vercel rate limit counters are per instance with the current in-memory store.

## Verification procedure

Build the backend and apply the migration to a disposable localhost PostgreSQL database named `irri_phase1`. Set `DATABASE_URL`, `JWT_SECRET`, `SEED_ADMIN_EMAIL`, and `SEED_ADMIN_PASSWORD` in the shell, then run the standard backend seed.

```powershell
npm run build --workspace=backend
npm run prisma:deploy --workspace=backend
npm run seed --workspace=backend
node --test backend/tests/phase1.test.mjs
```

To include the Auth.js HTTP flow, build the frontend with `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1`. Set the same frontend environment for the test and set `PHASE1_VERIFY_FRONTEND=1`. The test uses local ports 5000 and 3301.

## Results

| Task | Status | Verification |
| --- | --- | --- |
| 1.1 Environment configuration | COMPLETED | Frontend and backend builds with local test configuration |
| 1.2 Prisma foundation | COMPLETED | Initial migration on a fresh PostgreSQL database and two separate seed runs |
| 1.3 Authentication | COMPLETED | Real credentials, protected admin route, session response, logout, and expired or disabled account checks |
| 1.4 Backend authorization | COMPLETED | Allowed admin read, denied editor audit read and delete, current role lookup, protected-field rejection |
| 1.5 API errors and validation | COMPLETED | Invalid query, missing or invalid bearer token, forbidden role, and protected-field response checks |
| 1.6 Security baseline | COMPLETED | CORS, rate limiting, HTTP headers, Auth.js CSRF, upload rules, and sanitized API errors reviewed |

Both production builds and the HTTP integration test passed. The frontend build used network access for existing Google Fonts and `NEXT_IGNORE_INCORRECT_LOCKFILE=1` to bypass Next.js's unsuccessful automatic SWC lockfile patch. The standalone lint scripts still require ESLint configuration. No remote staging environment was provisioned.
