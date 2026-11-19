# Phase 3: Media and editorial workflow

## Delivery

| Task | Implementation |
| --- | --- |
| 3.1 Storage decision | Approved Vercel Blob Private, linked to the backend. See [storage decision](MEDIA_STORAGE_DECISION.md). |
| 3.2 Storage service | Private Blob and local development adapters, randomized object keys, stable application URLs, cleanup on failed writes, and a persistent retry queue for obsolete objects. |
| 3.3 Media library | Upload, search, type filters, paging, image previews, PDF downloads, replacement, reference-aware deletion, and pickers for page images, portraits, publication PDFs and gallery albums. |
| 3.4 Images | Bounded image decoding, original preservation, 640 px WebP thumbnails, alt text, captions, and gallery ordering. |
| 3.5 File safety | Extension, MIME and signature checks for JPEG, PNG, WebP and PDF. Up to 4 MiB per file. PDF delivery is download-only. Malware scanning requires a provider decision and is not configured. |
| 3.6 Editorial | Draft, review, approval, publication, archive and return-to-draft transitions. The backend checks roles, and records actions, timestamps, comments and the acting user. |
| 3.7 Preview and schedule | Authenticated draft and media preview. Approved items can be scheduled through a persistent PostgreSQL queue when `CRON_SECRET` is configured. |
| 3.8 Public integration | Published-only detail, related department programs and program courses, and redirects to the current slug once the record is public again. |

## Editorial rules

- Editors and administrators can submit drafts. Moderators and administrators can approve or return items under review. Admins and Super Admins can publish, schedule or archive.
- Return a reviewed, published or archived record to draft before editing it. Returning a published record to draft removes it and any exclusively linked managed media from the public site until it is published again.
- Media replacement preserves the application URL. Deletion is rejected while a media file is linked. Replace linked files with the same media type. Existing legacy links must be unlinked before replacement where their public URL differs.
- Scheduling uses UTC and publishes at or after the chosen time on the next daily run. The included Vercel cron runs during the 02:00 UTC hour. Transaction failures leave jobs queued for retry. A job whose scheduler no longer has publication rights is cancelled and audited. [Vercel Cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing)

## Release order

1. Verify the target database backup and migration history, following the initial migration baseline procedure in the root README if needed.
2. Apply the Phase 3 migration with `npm run prisma:deploy --workspace=backend`.
3. Confirm that the backend production environment has the private Blob token and set a strong server-only `CRON_SECRET` before enabling scheduled publication.
4. Deploy the backend and frontend together, then verify publishing, media visibility, and cron delivery through the production domains.

The Phase 2 release was pushed and promoted before Phase 3 work. This migration was applied to the disposable test database during development. The production database was not migrated in that release.

## Verification

- Backend and frontend production builds passed. The PostgreSQL and Next.js HTTP suite passed with the Phase 3 migration, including upload, private preview, replacement, linked-file deletion protection, review, scheduling, and published-only access.
- The linked Private Blob store passed a write, unauthenticated access denial, a byte-for-byte read in a fresh process, and cleanup using a disposable fixture.
- The live Phase 2 site served the homepage, login, News, Notices and Academic Programs. Unauthenticated access to the admin dashboard redirected to sign-in. The promoted backend passed its PostgreSQL readiness check.
- Compatible Blob and Sharp releases addressed the new dependency findings. Repository-wide npm audit still reports findings in other dependencies. Live Phase 3 migrations and the live cron invocation were not exercised.
- The regenerated lockfile retains the Linux Sharp binaries and passed an isolated Linux-targeted npm install dry run.
