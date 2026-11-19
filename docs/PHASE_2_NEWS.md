# Phase 2, Task 2.1: News CMS

**Status:** COMPLETED

News is the reference module for the rest of Phase 2. Admins can list, search, filter, sort, paginate, create, edit, preview, publish, unpublish, archive, and delete news from `/admin/news`. The editor supports Bengali content and SEO fields.

The existing `NewsPost` database model is unchanged. The public list and slug routes return only published posts. Authenticated reads and writes for the editor use `/api/v1/admin/news`. The original write routes remain available with the same role checks and news validation. Editors can create and update, moderators can update, and only admins and super admins can delete. The editor forwards the JWT on the server.

The homepage and public news pages read directly from the API. Unpublishing or archiving is reflected on the next request. Slug edits change the public URL immediately. Redirects for old slugs are outside this task.

Use the disposable PostgreSQL setup in [Phase 1](PHASE_1.md) to run the integration suite. Set `PHASE1_VERIFY_FRONTEND=1` to include the built frontend. The suite verifies validation, conflicts, role checks, draft and archive visibility, and the actual editor-to-publication flow.

Backend build, frontend production build, frontend TypeScript check, and the PostgreSQL-backed HTTP suite passed. The suite submits the actual admin forms for creation, editing, unpublishing, and deletion, and checks the admin preview and public output. Next.js may return HTTP 200 for a streamed not-found page, so the public UI test checks that the content is absent. The backend returns 404 for unpublished detail requests.

Next task in the execution plan is 2.2, Pages CMS.
