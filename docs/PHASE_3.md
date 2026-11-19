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

## Production release

On 19 November 2026, the production schema matched the initial Prisma schema but had no applied migration records. An access-restricted local backup archive was created and verified before recording the initial baseline and applying `20261119120000_media_editorial`. Prisma reported no schema difference after migration.

Vercel production deployments:

- [Frontend deployment](https://vercel.com/zabirarkam27s-projects/irri-frontend/3Q9p8FXw4Ya5P2eow2J6LE64r9G5)
- [Backend deployment](https://vercel.com/zabirarkam27s-projects/irri-backend/3PPtw6Mois6h4UxrTn7S1hJ9Uqnv)

`CRON_SECRET` is configured as a sensitive production backend variable. The Vercel project lists `/api/v1/editorial/run` at `0 2 * * *`. The live route rejected an anonymous request, and an authenticated manual run completed with zero due or failed jobs. This verified the route and its credentials before the next automatic invocation.

## Verification

- Backend and frontend production builds passed. The PostgreSQL and Next.js HTTP suite passed with the Phase 3 migration, including upload, private preview, replacement, linked-file deletion protection, review, scheduling, and published-only access.
- The linked Private Blob store passed a write, unauthenticated access denial, a byte-for-byte read in a fresh process, and cleanup using a disposable fixture.
- The live backend passed PostgreSQL readiness. The live frontend returned 401 from the authenticated media library endpoint without a session.
- Compatible dependency updates and removal of an unused legacy Auth.js package lowered the repository-wide npm audit count from 30 to 9, with zero critical findings remaining. Six high and three moderate findings remain. No forced major upgrades were applied.
- The regenerated lockfile retains the Linux Sharp binaries and passed an isolated Linux-targeted npm install dry run.
