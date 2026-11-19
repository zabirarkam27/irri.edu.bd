# Media storage decision

**Approved choice:** Vercel Blob Private. The store `irri-private-media` is linked to the backend production environment in `iad1`.

| Option | Fit and trade-offs |
| --- | --- |
| Vercel Blob Private | Stores images and PDFs as private objects. Vercel integrates the server token with the existing backend and caches objects within its delivery infrastructure. App-proxied delivery uses both storage and Function transfer. Server uploads are constrained by the Function payload limit, so this release caps each file at 4 MiB. [Private storage](https://vercel.com/docs/vercel-blob/private-storage) · [Usage and pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing) · [Server upload limits](https://vercel.com/docs/vercel-blob/server-upload) |
| Cloudflare R2 | S3-compatible private buckets and portable tooling. Pricing is based on stored data and operations; R2 does not charge internet egress. Images and PDFs need app-managed validation, thumbnails, authorization and delivery integration. [R2 documentation](https://developers.cloudflare.com/r2/) · [R2 pricing](https://developers.cloudflare.com/r2/pricing/) |
| Cloudinary | Media-focused storage, authenticated assets and image transformation delivery. Authenticated derivatives must be prepared before delivery. Access and plan details affect protected documents and transformations. [Access control](https://cloudinary.com/documentation/control_access_to_media) · [Plans](https://cloudinary.com/pricing) |

The project issues random, immutable storage keys and app URLs based on media record IDs. Only the server knows Blob credentials. Unlinked files and files linked solely to unpublished records require an authenticated preview. Public delivery resolves references against published content on every request. PDF responses are attachments with sniffing disabled. Images use generated WebP thumbnails in library and gallery listings, and retain original files.

For provider migration, export original and thumbnail objects with authenticated SDK calls, copy them to the next provider's private store, and verify bytes before switching the storage adapter. Preserve the media IDs and application URLs. Legacy files keep their old links until they are moved or replaced.
