# Phase 2: Core CMS

## Completion checklist

| Task | Status | Delivery |
| --- | --- | --- |
| 2.1 News | COMPLETED | Published news, admin workflow, and regression coverage. See [News task report](PHASE_2_NEWS.md). |
| 2.2 Pages | COMPLETED | CRUD, previews, bilingual text, SEO, and public routes. Navigation slugs are reserved against renaming. |
| 2.3 Notices | COMPLETED | CRUD, configurable publication date, and published-only public listing and details. |
| 2.4 Events | COMPLETED | CRUD, UTC inputs and display, end-after-start validation, and public details. |
| 2.5 Publications | COMPLETED | CRUD, the existing author, abstract, date, SEO and document URL fields, and public details. |
| 2.6 People and Departments | COMPLETED | CRUD, profile type and ordering, visibility, and public pages. |
| 2.7 Programs and Courses | COMPLETED | CRUD, department and program selectors, foreign key checks, and public pages. |
| 2.8 Gallery and Categories | COMPLETED | Album and category CRUD. Public albums render existing images. Categories have no content references in the current schema. |
| 2.9 Dashboard | COMPLETED | Database counts, recent news, links to filtered records, and role-limited inbox metrics. |
| 2.10 Contact inbox | COMPLETED | Real messages, search, pagination, read filtering, and read/unread actions. |
| 2.11 Users and settings | COMPLETED | Safe user listing, super-admin-only role and status updates with a last-active-admin guard, and editable institution settings. |
| 2.12 Audit | COMPLETED | Admin-only search, entity filtering, pagination, and transactional logs for CMS, inbox, institution and account changes. |

## Contracts and operating notes

- No schema or migration change. New authenticated content routes are under `/api/v1/admin`; the public list and detail routes for the status-bearing models expose only published records.
- Published pages with slugs `about`, `history`, `mission-vision` and `research` appear on the named navigation routes. Other published Pages records are available at `/pages/<slug>`. A custom slug edit changes its public URL and does not create a redirect.
- Program and course relationships use the existing optional foreign keys. Date/time inputs and display use UTC.
- Deployment secrets and unapproved settings have no editor. The approved settings surface uses the existing institution profile fields. User write permissions are enforced in the API and the last-super-admin check runs in a serializable transaction.
- Notice numbers and expiry, publication categories, and additional inbox statuses have no corresponding fields or confirmed workflow in the current model. Existing publication links and gallery images remain supported. Persistent upload and media selection are Phase 3. The media inventory reads real database records.
- Publishing a record loads its current database content on the next request. Existing seeded or editorial records remain in the database and can be reviewed and updated through the CMS.

## Verification

Use the disposable local database setup in [Phase 1](PHASE_1.md). Build both workspaces. Set `NODE_ENV=test` for the backend integration process and set `PHASE1_VERIFY_FRONTEND=1` to exercise the built Next.js app on port 3301. Run:

```powershell
node --test backend/tests/phase1.test.mjs
```

The suite exercises every content resource, relationship validation, slug changes, draft and archived visibility, dashboard, inbox actions, user and role protection, institution settings, and audit filtering. It opens the authenticated admin screens and submits the actual News and Pages server-action forms.

Backend and frontend production builds, the PostgreSQL-backed HTTP suite, and `git diff --check` passed locally. The standalone lint command stopped because the repository has no backend ESLint configuration.

No production deployment is included. Phase 3 can start separately.
