# IRRI Website — Full-Stack Project Plan

**Project Name:** `irri-website`  
**Website Domain:** `https://www.irri.edu.com`  
**Institution:** International Rabindra Research Institute  
**Bengali Name:** আন্তর্জাতিক রবীন্দ্র রিসার্চ ইনস্টিটিউট  
**Acronym:** IRRI

---

## 1. Core Instruction for Codex

Build a **production-ready, scalable, CMS-driven full-stack university website** for **International Rabindra Research Institute (IRRI)**.

This project must be built as **two separate applications**:

```txt
irri-website/
├── frontend/   # Next.js 15 App Router/ Node.js App Router website + admin dashboard UI
└── backend/    # Node.js TypeScript REST API + Prisma + PostgreSQL
```

Do **not** build it as a simple static website.

The frontend and backend must be cleanly separated and communicate through REST APIs.

---

## 2. Technology Stack

### 2.1 Frontend

Use:

- Next.js 15 App Router/ Node.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod validation
- Auth.js / NextAuth for frontend session handling
- Next/Image for image optimization
- Server Components where appropriate
- Client Components only when interactivity is required
- SEO metadata API
- Responsive, accessible, semantic HTML

### 2.2 Backend

Use:

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod validation
- bcrypt for password hashing
- JWT/session-compatible authentication flow
- Role-based access control
- Multer for upload handling
- Cloudinary or local upload adapter
- Centralized error handling
- Audit logging
- Pagination, filtering, searching, sorting
- Secure HTTP headers, CORS, rate limiting

---

## 3. Important Architecture Decision

Although the frontend uses **Next.js 15 App Router**, the backend must remain a separate API server.

Recommended architecture:

```txt
Browser
  ↓
Next.js/ Node.js Frontend
  ↓ REST API calls
Express Backend API
  ↓
Prisma ORM
  ↓
PostgreSQL Database
```

Authentication approach:

```txt
User submits login form
  ↓
NextAuth Credentials Provider in frontend
  ↓
Calls backend /api/v1/auth/login
  ↓
Backend verifies email/password using bcrypt
  ↓
Backend returns safe user payload + token/session data
  ↓
NextAuth stores session securely
```

The backend must still protect all admin APIs by validating authenticated requests and checking user roles.

---

## 4. Institution Data

Use the following data in the seed file and default CMS content.

### 4.1 Basic Identity

```txt
English Name: International Rabindra Research Institute
Bengali Name: আন্তর্জাতিক রবীন্দ্র রিসার্চ ইনস্টিটিউট
Acronym: IRRI
Location: Patisar, Atrai, Naogaon, Rajshahi Division, Bangladesh
Established as private research institute: 2014
Operation started after approval: 2018
Domain: https://www.irri.edu.com
```

### 4.2 Motto

```txt
English Motto:
To reach excellence through practicing our own history and culture.

Bengali Motto:
নিজস্ব ইতিহাস ও সংস্কৃতি চর্চার মাধ্যমে উৎকর্ষ অর্জন।
```

### 4.3 Mission

```txt
To promote the thoughts, knowledge, literature, music, philosophy, and cultural legacy of Nobel Laureate Rabindranath Tagore worldwide through research, education, documentation, and academic practice.
```

### 4.4 Vision

```txt
To build students, researchers, and scholars at Honors, Masters, and PhD levels who can achieve excellence by practicing their own history, culture, literature, and humanistic values.
```

### 4.5 Administration Data

```txt
1. Sheikh Rezaul Islam — President / Present Acting Chairman — MP, Naogaon-6
2. Late Israfil Alam — Founder Chairman — Former MP
3. Professor Farhana Akter — Director General (DG)
4. SM Faruq Bokth — Secretary
5. Mr. Hamidur Rahman — Deputy Director
```

---

## 5. Required Public Pages

Create the following public pages:

```txt
1. Home
2. About
3. History
4. Mission & Vision
5. Administration
6. Academic Programs
7. Courses
8. Research
9. Publications
10. Gallery
11. News
12. Notices
13. Events
14. Contact
```

Every public page must support:

- SEO title
- Meta description
- Open Graph metadata
- Clean responsive layout
- Loading state
- Empty state where needed
- Error state where needed
- Slug-based route where needed
- English/Bengali-ready content structure

---

## 6. Homepage Requirements

The homepage must use a premium academic design.

Required sections:

```txt
1. Responsive Navbar
2. Hero section
3. Institute at a Glance
4. Mission and Vision
5. Rabindranath Tagore Legacy
6. Administration / Leadership
7. Academic and Research Focus
8. Gallery Preview
9. Latest News
10. Latest Notices
11. Events Preview
12. Contact CTA
13. Footer
```

### 6.1 Hero Section

Hero must include:

- Institute English name
- Institute Bengali name
- Short mission-based subtitle
- CTA button: Explore Programs
- CTA button: Learn About IRRI
- Elegant background image or gradient
- Premium academic mood using deep green, gold, white, and neutral colors

Suggested hero subtitle:

```txt
Promoting the thoughts, literature, music, philosophy, and cultural legacy of Rabindranath Tagore through research, education, and academic practice.
```

---

## 7. Admin Dashboard Requirements

Create a secure admin dashboard with:

```txt
/admin/login
/admin/dashboard
/admin/profile
/admin/institution
/admin/pages
/admin/administration
/admin/departments
/admin/programs
/admin/courses
/admin/news
/admin/notices
/admin/events
/admin/gallery
/admin/publications
/admin/media
/admin/contact-messages
/admin/audit-logs
/admin/users
/admin/settings
```

### 7.1 Admin Features

Admin dashboard must include:

- Login/logout
- Protected dashboard
- Role-based access
- Sidebar navigation
- Top admin navbar
- Stats cards
- Data tables
- Search, filter, sort
- Pagination
- Create form
- Update form
- Delete confirmation modal
- Status management: Draft, Published, Archived
- SEO fields
- Media upload
- Contact message inbox
- Audit log viewer
- User management for SUPER_ADMIN and ADMIN

### 7.2 Roles

Use these roles:

```txt
SUPER_ADMIN
ADMIN
EDITOR
MODERATOR
```

Recommended permissions:

```txt
SUPER_ADMIN:
- Full access to everything
- Can create/update/delete users
- Can view audit logs
- Can change institution settings

ADMIN:
- Can manage most CMS content
- Can manage media
- Can view contact messages
- Cannot delete SUPER_ADMIN

EDITOR:
- Can create/update content
- Can publish assigned content if allowed
- Cannot manage users or system settings

MODERATOR:
- Can review notices/news/contact messages
- Can archive inappropriate or outdated content
- Cannot manage users or institution profile
```

---

## 8. Frontend Folder Structure

Create this folder structure for the frontend.

```txt
frontend/
├── public/
│   ├── images/
│   ├── icons/
│   ├── logos/
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   │
│   │   ├── (public)/
│   │   │   ├── about/page.tsx
│   │   │   ├── history/page.tsx
│   │   │   ├── mission-vision/page.tsx
│   │   │   ├── administration/page.tsx
│   │   │   ├── academic-programs/page.tsx
│   │   │   ├── courses/page.tsx
│   │   │   ├── research/page.tsx
│   │   │   ├── publications/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── gallery/page.tsx
│   │   │   ├── news/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── notices/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── events/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   └── contact/page.tsx
│   │   │
│   │   ├── (auth)/
│   │   │   └── admin/
│   │   │       └── login/page.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── institution/page.tsx
│   │   │   ├── pages/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── administration/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── departments/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── programs/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── news/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── notices/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── events/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── gallery/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── albums/new/page.tsx
│   │   │   │   └── albums/[id]/edit/page.tsx
│   │   │   ├── publications/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── media/page.tsx
│   │   │   ├── contact-messages/page.tsx
│   │   │   ├── audit-logs/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/route.ts
│   │
│   ├── features/
│   │   ├── home/
│   │   │   ├── components/
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── InstituteGlance.tsx
│   │   │   │   ├── MissionVisionSection.tsx
│   │   │   │   ├── TagoreLegacySection.tsx
│   │   │   │   ├── LeadershipSection.tsx
│   │   │   │   ├── AcademicResearchSection.tsx
│   │   │   │   ├── GalleryPreview.tsx
│   │   │   │   ├── LatestNews.tsx
│   │   │   │   ├── LatestNotices.tsx
│   │   │   │   └── ContactCTA.tsx
│   │   │   └── services/home.service.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── components/LoginForm.tsx
│   │   │   ├── services/auth.service.ts
│   │   │   ├── schemas/auth.schema.ts
│   │   │   └── types/auth.type.ts
│   │   │
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   │   ├── AdminSidebar.tsx
│   │   │   │   ├── AdminTopbar.tsx
│   │   │   │   ├── DashboardStats.tsx
│   │   │   │   ├── AdminPageHeader.tsx
│   │   │   │   └── AdminDataTable.tsx
│   │   │   └── hooks/useAdminGuard.ts
│   │   │
│   │   ├── institution/
│   │   ├── page-builder/
│   │   ├── people/
│   │   ├── departments/
│   │   ├── programs/
│   │   ├── courses/
│   │   ├── news/
│   │   ├── notices/
│   │   ├── events/
│   │   ├── gallery/
│   │   ├── publications/
│   │   ├── media/
│   │   └── contact/
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── shared/
│   │   │   ├── SiteHeader.tsx
│   │   │   ├── SiteFooter.tsx
│   │   │   ├── Container.tsx
│   │   │   ├── SectionHeader.tsx
│   │   │   ├── PageHero.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   └── forms/
│   │       ├── FormInput.tsx
│   │       ├── FormTextarea.tsx
│   │       ├── FormSelect.tsx
│   │       ├── FormDatePicker.tsx
│   │       ├── FormImageUpload.tsx
│   │       └── FormRichTextEditor.tsx
│   │
│   ├── config/
│   │   ├── site.ts
│   │   ├── nav.ts
│   │   └── env.ts
│   │
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── auth.ts
│   │   ├── utils.ts
│   │   ├── seo.ts
│   │   ├── permissions.ts
│   │   └── validators.ts
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── usePagination.ts
│   │   └── useUpload.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   └── types/
│       ├── api.type.ts
│       ├── auth.type.ts
│       ├── cms.type.ts
│       └── global.d.ts
│
├── .env.local
├── .env.example
├── next.config.ts
├── components.json
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 9. Backend Folder Structure

Create this folder structure for the backend.

```txt
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── db.ts
│   │   ├── cors.ts
│   │   ├── cloudinary.ts
│   │   ├── multer.ts
│   │   └── security.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.route.ts
│   │   │   ├── auth.validation.ts
│   │   │   ├── auth.interface.ts
│   │   │   └── auth.utils.ts
│   │   │
│   │   ├── user/
│   │   │   ├── user.model.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.route.ts
│   │   │   ├── user.validation.ts
│   │   │   └── user.interface.ts
│   │   │
│   │   ├── institution/
│   │   │   ├── institution.controller.ts
│   │   │   ├── institution.service.ts
│   │   │   ├── institution.route.ts
│   │   │   ├── institution.validation.ts
│   │   │   └── institution.interface.ts
│   │   │
│   │   ├── page/
│   │   │   ├── page.controller.ts
│   │   │   ├── page.service.ts
│   │   │   ├── page.route.ts
│   │   │   ├── page.validation.ts
│   │   │   └── page.interface.ts
│   │   │
│   │   ├── person/
│   │   │   ├── person.controller.ts
│   │   │   ├── person.service.ts
│   │   │   ├── person.route.ts
│   │   │   ├── person.validation.ts
│   │   │   └── person.interface.ts
│   │   │
│   │   ├── department/
│   │   │   ├── department.controller.ts
│   │   │   ├── department.service.ts
│   │   │   ├── department.route.ts
│   │   │   ├── department.validation.ts
│   │   │   └── department.interface.ts
│   │   │
│   │   ├── program/
│   │   │   ├── program.controller.ts
│   │   │   ├── program.service.ts
│   │   │   ├── program.route.ts
│   │   │   ├── program.validation.ts
│   │   │   └── program.interface.ts
│   │   │
│   │   ├── course/
│   │   │   ├── course.controller.ts
│   │   │   ├── course.service.ts
│   │   │   ├── course.route.ts
│   │   │   ├── course.validation.ts
│   │   │   └── course.interface.ts
│   │   │
│   │   ├── news/
│   │   │   ├── news.controller.ts
│   │   │   ├── news.service.ts
│   │   │   ├── news.route.ts
│   │   │   ├── news.validation.ts
│   │   │   └── news.interface.ts
│   │   │
│   │   ├── notice/
│   │   │   ├── notice.controller.ts
│   │   │   ├── notice.service.ts
│   │   │   ├── notice.route.ts
│   │   │   ├── notice.validation.ts
│   │   │   └── notice.interface.ts
│   │   │
│   │   ├── event/
│   │   │   ├── event.controller.ts
│   │   │   ├── event.service.ts
│   │   │   ├── event.route.ts
│   │   │   ├── event.validation.ts
│   │   │   └── event.interface.ts
│   │   │
│   │   ├── gallery/
│   │   │   ├── gallery.controller.ts
│   │   │   ├── gallery.service.ts
│   │   │   ├── gallery.route.ts
│   │   │   ├── gallery.validation.ts
│   │   │   └── gallery.interface.ts
│   │   │
│   │   ├── publication/
│   │   │   ├── publication.controller.ts
│   │   │   ├── publication.service.ts
│   │   │   ├── publication.route.ts
│   │   │   ├── publication.validation.ts
│   │   │   └── publication.interface.ts
│   │   │
│   │   ├── category/
│   │   │   ├── category.controller.ts
│   │   │   ├── category.service.ts
│   │   │   ├── category.route.ts
│   │   │   ├── category.validation.ts
│   │   │   └── category.interface.ts
│   │   │
│   │   ├── media/
│   │   │   ├── media.controller.ts
│   │   │   ├── media.service.ts
│   │   │   ├── media.route.ts
│   │   │   ├── media.validation.ts
│   │   │   └── media.interface.ts
│   │   │
│   │   ├── contact/
│   │   │   ├── contact.controller.ts
│   │   │   ├── contact.service.ts
│   │   │   ├── contact.route.ts
│   │   │   ├── contact.validation.ts
│   │   │   └── contact.interface.ts
│   │   │
│   │   ├── audit-log/
│   │   │   ├── auditLog.controller.ts
│   │   │   ├── auditLog.service.ts
│   │   │   ├── auditLog.route.ts
│   │   │   └── auditLog.interface.ts
│   │   │
│   │   └── setting/
│   │       ├── setting.controller.ts
│   │       ├── setting.service.ts
│   │       ├── setting.route.ts
│   │       ├── setting.validation.ts
│   │       └── setting.interface.ts
│   │
│   ├── middlewares/
│   │   ├── auth.ts
│   │   ├── authorize.ts
│   │   ├── validateRequest.ts
│   │   ├── globalErrorHandler.ts
│   │   ├── notFound.ts
│   │   ├── upload.ts
│   │   ├── rateLimiter.ts
│   │   └── requestLogger.ts
│   │
│   ├── routes/
│   │   └── index.ts
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── password.ts
│   │   ├── jwt.ts
│   │   ├── slug.ts
│   │   ├── pagination.ts
│   │   └── audit.ts
│   │
│   ├── utils/
│   │   ├── catchAsync.ts
│   │   ├── sendResponse.ts
│   │   ├── AppError.ts
│   │   ├── generateSlug.ts
│   │   ├── pick.ts
│   │   ├── sanitize.ts
│   │   └── queryBuilder.ts
│   │
│   ├── constants/
│   │   ├── role.ts
│   │   ├── status.ts
│   │   ├── pagination.ts
│   │   └── messages.ts
│   │
│   └── types/
│       ├── express.d.ts
│       └── global.d.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── uploads/
├── logs/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 10. Backend API Versioning

All backend routes must use this prefix:

```txt
/api/v1
```

Example:

```txt
/api/v1/auth/login
/api/v1/news
/api/v1/notices
/api/v1/events
/api/v1/publications
```

---

## 11. API Endpoint Plan

### 11.1 Auth

```txt
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
POST   /api/v1/auth/change-password
```

### 11.2 Institution Profile

```txt
GET    /api/v1/institution
PATCH  /api/v1/institution
```

### 11.3 Pages

```txt
GET    /api/v1/pages
POST   /api/v1/pages
GET    /api/v1/pages/:slug
PATCH  /api/v1/pages/:id
DELETE /api/v1/pages/:id
```

### 11.4 People / Administration / Faculty / Staff

```txt
GET    /api/v1/people
POST   /api/v1/people
GET    /api/v1/people/:id
PATCH  /api/v1/people/:id
DELETE /api/v1/people/:id
```

Support query filters:

```txt
?type=ADMINISTRATION
?type=FACULTY
?type=RESEARCHER
?type=STAFF
?status=PUBLISHED
```

### 11.5 Departments

```txt
GET    /api/v1/departments
POST   /api/v1/departments
GET    /api/v1/departments/:slug
PATCH  /api/v1/departments/:id
DELETE /api/v1/departments/:id
```

### 11.6 Programs

```txt
GET    /api/v1/programs
POST   /api/v1/programs
GET    /api/v1/programs/:slug
PATCH  /api/v1/programs/:id
DELETE /api/v1/programs/:id
```

### 11.7 Courses

```txt
GET    /api/v1/courses
POST   /api/v1/courses
GET    /api/v1/courses/:slug
PATCH  /api/v1/courses/:id
DELETE /api/v1/courses/:id
```

### 11.8 News

```txt
GET    /api/v1/news
POST   /api/v1/news
GET    /api/v1/news/:slug
PATCH  /api/v1/news/:id
DELETE /api/v1/news/:id
```

### 11.9 Notices

```txt
GET    /api/v1/notices
POST   /api/v1/notices
GET    /api/v1/notices/:slug
PATCH  /api/v1/notices/:id
DELETE /api/v1/notices/:id
```

### 11.10 Events

```txt
GET    /api/v1/events
POST   /api/v1/events
GET    /api/v1/events/:slug
PATCH  /api/v1/events/:id
DELETE /api/v1/events/:id
```

### 11.11 Gallery

```txt
GET    /api/v1/gallery/albums
POST   /api/v1/gallery/albums
GET    /api/v1/gallery/albums/:slug
PATCH  /api/v1/gallery/albums/:id
DELETE /api/v1/gallery/albums/:id

POST   /api/v1/gallery/images
PATCH  /api/v1/gallery/images/:id
DELETE /api/v1/gallery/images/:id
```

### 11.12 Publications

```txt
GET    /api/v1/publications
POST   /api/v1/publications
GET    /api/v1/publications/:slug
PATCH  /api/v1/publications/:id
DELETE /api/v1/publications/:id
```

### 11.13 Media

```txt
GET    /api/v1/media
POST   /api/v1/media/upload
GET    /api/v1/media/:id
DELETE /api/v1/media/:id
```

### 11.14 Contact Messages

```txt
POST   /api/v1/contact-messages
GET    /api/v1/contact-messages
GET    /api/v1/contact-messages/:id
PATCH  /api/v1/contact-messages/:id
DELETE /api/v1/contact-messages/:id
```

### 11.15 Audit Logs

```txt
GET    /api/v1/audit-logs
GET    /api/v1/audit-logs/:id
```

---

## 12. Prisma Schema

Create `backend/prisma/schema.prisma`.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  SUPER_ADMIN
  ADMIN
  EDITOR
  MODERATOR
}

enum PublishStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum PersonType {
  ADMINISTRATION
  FACULTY
  RESEARCHER
  STAFF
}

enum ProgramLevel {
  HONORS
  MASTERS
  PHD
  FELLOWSHIP
  CERTIFICATE
}

model User {
  id            String     @id @default(cuid())
  name          String
  email         String     @unique
  password      String
  role          UserRole   @default(EDITOR)
  image         String?
  isActive      Boolean    @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  newsPosts     NewsPost[]
  notices       Notice[]
  events        Event[]
  publications  Publication[]
  mediaAssets   MediaAsset[]
  auditLogs     AuditLog[]

  @@index([role])
  @@index([isActive])
}

model InstitutionProfile {
  id                String   @id @default(cuid())
  nameEn            String
  nameBn            String
  acronym           String
  domain            String?
  location          String
  establishedYear   Int?
  operationYear     Int?
  mottoEn           String
  mottoBn           String
  mission           String
  vision            String
  description       String?
  logoUrl           String?
  heroImageUrl      String?
  email             String?
  phone             String?
  address           String?
  facebookUrl       String?
  youtubeUrl        String?
  linkedinUrl       String?
  seoTitle          String?
  seoDescription    String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Page {
  id              String        @id @default(cuid())
  title           String
  titleBn         String?
  slug            String        @unique
  excerpt         String?
  content         String
  contentBn       String?
  featuredImage   String?
  status          PublishStatus @default(DRAFT)
  seoTitle        String?
  seoDescription  String?
  publishedAt     DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([status])
  @@index([slug])
}

model Person {
  id              String        @id @default(cuid())
  name            String
  nameBn          String?
  slug            String        @unique
  designation     String
  designationBn   String?
  type            PersonType
  bio             String?
  imageUrl        String?
  email           String?
  phone           String?
  order           Int           @default(0)
  status          PublishStatus @default(PUBLISHED)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([type])
  @@index([status])
  @@index([order])
}

model Department {
  id              String        @id @default(cuid())
  name            String
  nameBn          String?
  slug            String        @unique
  description     String?
  imageUrl        String?
  status          PublishStatus @default(DRAFT)
  seoTitle        String?
  seoDescription  String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  programs        Program[]
  courses         Course[]

  @@index([status])
}

model Program {
  id              String        @id @default(cuid())
  title           String
  titleBn         String?
  slug            String        @unique
  level           ProgramLevel
  duration        String?
  description     String?
  eligibility     String?
  departmentId    String?
  department      Department?   @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  status          PublishStatus @default(DRAFT)
  seoTitle        String?
  seoDescription  String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  courses         Course[]

  @@index([level])
  @@index([status])
  @@index([departmentId])
}

model Course {
  id              String        @id @default(cuid())
  title           String
  titleBn         String?
  slug            String        @unique
  code            String?
  credit          Float?
  description     String?
  programId       String?
  program         Program?      @relation(fields: [programId], references: [id], onDelete: SetNull)
  departmentId    String?
  department      Department?   @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  status          PublishStatus @default(DRAFT)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([status])
  @@index([programId])
  @@index([departmentId])
}

model Category {
  id              String        @id @default(cuid())
  name            String
  slug            String        @unique
  description     String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  newsPosts       NewsPost[]
  publications    Publication[]
}

model NewsPost {
  id              String        @id @default(cuid())
  title           String
  titleBn         String?
  slug            String        @unique
  excerpt         String?
  content         String
  contentBn       String?
  featuredImage   String?
  status          PublishStatus @default(DRAFT)
  seoTitle        String?
  seoDescription  String?
  publishedAt     DateTime?
  authorId        String?
  author          User?         @relation(fields: [authorId], references: [id], onDelete: SetNull)
  categoryId      String?
  category        Category?     @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([status])
  @@index([slug])
  @@index([publishedAt])
}

model Notice {
  id              String        @id @default(cuid())
  title           String
  titleBn         String?
  slug            String        @unique
  content         String
  contentBn       String?
  attachmentUrl   String?
  status          PublishStatus @default(DRAFT)
  publishedAt     DateTime?
  authorId        String?
  author          User?         @relation(fields: [authorId], references: [id], onDelete: SetNull)
  seoTitle        String?
  seoDescription  String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([status])
  @@index([publishedAt])
}

model Event {
  id              String        @id @default(cuid())
  title           String
  titleBn         String?
  slug            String        @unique
  description     String
  descriptionBn   String?
  location        String?
  startDate       DateTime
  endDate         DateTime?
  featuredImage   String?
  status          PublishStatus @default(DRAFT)
  authorId        String?
  author          User?         @relation(fields: [authorId], references: [id], onDelete: SetNull)
  seoTitle        String?
  seoDescription  String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([status])
  @@index([startDate])
}

model GalleryAlbum {
  id              String         @id @default(cuid())
  title           String
  titleBn         String?
  slug            String         @unique
  description     String?
  coverImage      String?
  status          PublishStatus  @default(DRAFT)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  images          GalleryImage[]

  @@index([status])
}

model GalleryImage {
  id              String        @id @default(cuid())
  title           String?
  altText         String?
  imageUrl        String
  order           Int           @default(0)
  albumId         String
  album           GalleryAlbum  @relation(fields: [albumId], references: [id], onDelete: Cascade)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([albumId])
}

model Publication {
  id              String        @id @default(cuid())
  title           String
  titleBn         String?
  slug            String        @unique
  abstract        String?
  authors         String?
  publishedYear   Int?
  fileUrl         String?
  coverImage      String?
  status          PublishStatus @default(DRAFT)
  seoTitle        String?
  seoDescription  String?
  authorId        String?
  author          User?         @relation(fields: [authorId], references: [id], onDelete: SetNull)
  categoryId      String?
  category        Category?     @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([status])
  @@index([publishedYear])
}

model MediaAsset {
  id              String   @id @default(cuid())
  fileName        String
  originalName    String
  mimeType        String
  size            Int
  url             String
  publicId        String?
  altText         String?
  uploadedById    String?
  uploadedBy      User?    @relation(fields: [uploadedById], references: [id], onDelete: SetNull)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([mimeType])
  @@index([uploadedById])
}

model ContactMessage {
  id              String   @id @default(cuid())
  name            String
  email           String
  phone           String?
  subject         String?
  message         String
  isRead          Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([isRead])
  @@index([createdAt])
}

model AuditLog {
  id              String   @id @default(cuid())
  userId          String?
  user            User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  action          String
  entity          String
  entityId        String?
  oldValue        Json?
  newValue        Json?
  ipAddress       String?
  userAgent       String?
  createdAt       DateTime @default(now())

  @@index([userId])
  @@index([entity])
  @@index([createdAt])
}
```

---

## 13. Seed File Requirements

Create `backend/prisma/seed.ts`.

Seed must create:

```txt
1. Default SUPER_ADMIN user
2. InstitutionProfile
3. Administration people
4. Default pages
5. Default categories
6. Sample departments
7. Sample programs
8. Sample courses
9. Sample news
10. Sample notices
11. Sample events
12. Sample gallery album
13. Sample publications
```

### 13.1 Default Admin User

Use environment variables:

```env
SEED_ADMIN_NAME="Super Admin"
SEED_ADMIN_EMAIL="admin@irri.edu.com"
SEED_ADMIN_PASSWORD="ChangeMe123!"
```

Never hardcode production passwords in the seed file.  
Read the password from `.env`.

### 13.2 Seed Institution Profile

Use the IRRI data from Section 4.

### 13.3 Seed Administration People

Use:

```txt
Sheikh Rezaul Islam
Late Israfil Alam
Professor Farhana Akter
SM Faruq Bokth
Mr. Hamidur Rahman
```

Set `type = ADMINISTRATION`.

---

## 14. Backend Service Layer Rules

Every module must follow this flow:

```txt
route → validation middleware → controller → service → prisma → response
```

Example:

```txt
notice.route.ts
  ↓
validateRequest(noticeValidation.createNoticeSchema)
  ↓
notice.controller.ts
  ↓
notice.service.ts
  ↓
prisma.notice
  ↓
sendResponse()
```

Controllers should only handle request/response logic.

Services should handle:

- Database query
- Business logic
- Slug generation
- Status filtering
- Permission-aware logic
- Audit log creation
- Pagination result

---

## 15. Validation Requirements

Use Zod for all backend inputs.

Every create/update API must have:

```txt
createSchema
updateSchema
querySchema, where needed
```

Example validation files:

```txt
news.validation.ts
notice.validation.ts
event.validation.ts
person.validation.ts
program.validation.ts
course.validation.ts
contact.validation.ts
```

Frontend forms must also use Zod schemas with React Hook Form.

---

## 16. Pagination, Filtering, Search, Sorting

All list APIs must support:

```txt
?page=1
?limit=10
?search=keyword
?sortBy=createdAt
?sortOrder=desc
?status=PUBLISHED
```

Response shape:

```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPage": 10
  }
}
```

---

## 17. Standard API Response

Use a shared `sendResponse.ts`.

```ts
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
  };
};
```

---

## 18. Error Handling

Create centralized error handling.

Required files:

```txt
AppError.ts
globalErrorHandler.ts
notFound.ts
catchAsync.ts
```

Handle:

- Zod errors
- Prisma validation errors
- Prisma unique constraint errors
- Authentication errors
- Authorization errors
- Not found errors
- Upload errors
- Unknown server errors

Never expose stack traces in production.

---

## 19. Security Requirements

Implement:

```txt
1. bcrypt password hashing
2. Secure authentication flow
3. Role-based access control
4. Helmet security headers
5. Strict CORS configuration
6. Rate limiting for auth and contact APIs
7. Request size limit
8. File upload MIME type validation
9. File size limit
10. Input validation with Zod
11. Output sanitization where needed
12. Protected admin API routes
13. Environment variable validation
14. No secrets committed to Git
15. Audit logs for create/update/delete actions
16. Secure cookie/session strategy in frontend
17. CSRF-aware auth setup
18. Proper HTTP status codes
```

### 19.1 Recommended Rate Limits

```txt
Auth login:
- 5 attempts per 15 minutes per IP

Contact message:
- 5 submissions per hour per IP

General API:
- 100 requests per 15 minutes per IP
```

### 19.2 Upload Security

Allowed image types:

```txt
image/jpeg
image/png
image/webp
image/avif
```

Allowed document types:

```txt
  // PDF
  "application/pdf",

  // Microsoft Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Microsoft Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // Microsoft PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // OpenDocument formats
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",

  // Text-based documents
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/rtf",
  "text/rtf",

  // Data/document files
  "application/json",
  "application/xml",
  "text/xml",

  // eBook / publication
  "application/epub+zip",
```

Recommended max file size:

```txt
Images: 5MB
Documents: 10MB
```

---

## 20. Performance Requirements

Frontend must be super fast.

Implement:

```txt
1. Server Components for read-heavy public pages
2. Static rendering where possible
3. Revalidation for CMS content
4. Next/Image for image optimization
5. Lazy loading for gallery images
6. Code splitting by route
7. Minimize client components
8. Use skeleton loading only where needed
9. Cache public API responses where safe
10. Optimize database queries with select/include
11. Add indexes in Prisma schema
12. Avoid N+1 queries
13. Compress backend responses
14. Use pagination everywhere
15. Use CDN-friendly media URLs
```

Recommended public content cache:

```txt
Homepage: revalidate every 60 seconds
News list: revalidate every 60 seconds
Notice list: revalidate every 60 seconds
Static pages: revalidate every 300 seconds
Gallery: revalidate every 120 seconds
```

---

## 21. SEO Requirements

Every public page must include:

```txt
1. title
2. description
3. canonical URL
4. Open Graph title
5. Open Graph description
6. Open Graph image
7. Twitter card metadata
8. Semantic heading structure
9. Clean slug URLs
10. Alt text for images
```

Generate:

```txt
/sitemap.xml
/robots.txt
```

Suggested title pattern:

```txt
Page Name | International Rabindra Research Institute
```

---

## 22. Bilingual-Ready Content Strategy

The system must be bilingual-ready for English and Bengali.

Use fields such as:

```txt
title
titleBn
content
contentBn
name
nameBn
description
descriptionBn
```

Initial UI can be English-first, but database and components must support Bengali content.

Recommended future route strategy:

```txt
/en/about
/bn/about
```

For now, structure components so language switching can be added later without rewriting the CMS.

---

## 23. UI / UX Design Direction

Design style:

```txt
Premium academic institution style
White background
Deep green primary color
Gold accent color
Neutral gray text
Clean typography
Professional spacing
Card-based sections
Elegant image gallery
Mobile-first layout
```

### 23.1 Color Tokens

Add CSS variables:

```css
:root {
Primary (Brand Color):  #6366F1
Secondary (Pressed):    #4338CA
Accent (Success):       #10B981
Warning / Error:        #EF4444
App Background:         #F9FAFB
Card / Surface:         #FFFFFF
Dark Text:              #111827
Muted Text:             #6B7280
}
```

### 23.2 Design Rules

Use:

- Consistent section spacing
- Clear typography hierarchy
- Large hero heading
- Professional cards
- Clean admin dashboard
- Accessible contrast
- Responsive grid layouts
- Minimal animation
- No cluttered design
- No unnecessary colors

---

## 24. Public Website Component Plan

### 24.1 Shared Public Components

```txt
SiteHeader
MobileNav
SiteFooter`
Container
PageHero
SectionHeader
Breadcrumb
ContentBlock
SEOJsonLd
```

### 24.2 Content Components

```txt
PersonCard
ProgramCard
CourseCard
NewsCard
NoticeCard
EventCard
PublicationCard
GalleryGrid
ContactForm
```

### 24.3 State Components

```txt
LoadingSpinner
SkeletonCard
EmptyState
ErrorMessage
```

---

## 25. Admin Dashboard Component Plan

### 25.1 Layout Components

```txt
AdminSidebar
AdminTopbar
AdminShell
AdminPageHeader
AdminBreadcrumb
```

### 25.2 Data Components

```txt
AdminDataTable
TableSearch
TableFilter
TablePagination
StatusBadge
RowActions
DeleteConfirmDialog
```

### 25.3 Form Components

```txt
TextInputField
TextareaField
SelectField
DatePickerField
ImageUploadField
FileUploadField
RichTextEditor
SlugInput
SeoFields
StatusSelect
SubmitButton
```

---

## 26. CRUD Implementation Pattern

Each CMS module should include:

```txt
1. List page
2. Create page
3. Edit page
4. Delete action
5. Status update
6. SEO fields
7. Slug field
8. Validation
9. Loading state
10. Error state
11. Empty state
```

Example for News:

```txt
/admin/news
/admin/news/new
/admin/news/[id]/edit
/news
/news/[slug]
```

Backend:

```txt
GET    /api/v1/news
POST   /api/v1/news
GET    /api/v1/news/:slug
PATCH  /api/v1/news/:id
DELETE /api/v1/news/:id
```

---

## 27. Media Upload System

Media upload must support:

```txt
1. Image upload
2. PDF/document upload
3. File type validation
4. File size validation
5. Alt text
6. Media library list
7. Delete media
8. Uploaded by user tracking
```

Media storage options:

```txt
Option 1: Cloudinary
Option 2: Local /uploads folder for development
```

Create upload adapter so storage can be changed later without rewriting business logic.

---

## 28. Contact Form

Public contact page must have:

```txt
Name
Email
Phone
Subject
Message
Submit button
Success message
Error message
```

Backend must:

```txt
1. Validate input
2. Rate limit submissions
3. Store message in database
4. Mark messages as read/unread in admin dashboard
```

Admin inbox must show:

```txt
Name
Email
Phone
Subject
Message
Read status
Created date
```

---

## 29. Audit Log Requirements

For every protected create/update/delete action, save:

```txt
userId
action
entity
entityId
oldValue
newValue
ipAddress
userAgent
createdAt
```

Example actions:

```txt
CREATE_NEWS
UPDATE_NEWS
DELETE_NEWS
PUBLISH_NOTICE
ARCHIVE_EVENT
UPLOAD_MEDIA
DELETE_MEDIA
```

Only `SUPER_ADMIN` and `ADMIN` should view audit logs.

---

## 30. Environment Variables

### 30.1 Frontend `.env.local`

```env
NEXT_PUBLIC_SITE_URL="https://www.irri.edu.com"
NEXT_PUBLIC_API_BASE_URL="http://localhost:5000/api/v1"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-secure-secret"
```

### 30.2 Backend `.env`

```env
NODE_ENV="development"
PORT=5000

DATABASE_URL="postgresql://postgres:password@localhost:5432/irri_website?schema=public"

JWT_SECRET="replace-with-secure-secret"
JWT_EXPIRES_IN="7d"

FRONTEND_URL="http://localhost:3000"

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

SEED_ADMIN_NAME="Super Admin"
SEED_ADMIN_EMAIL="admin@irri.edu.com"
SEED_ADMIN_PASSWORD="ChangeMe123!"
```

Create `.env.example` files for both frontend and backend.

---

## 31. README Requirements

Create a root `README.md` and separate README files inside `frontend/` and `backend/`.

Root README must include:

```txt
1. Project overview
2. Tech stack
3. Folder structure
4. Prerequisites
5. Environment setup
6. Database setup
7. How to run backend
8. How to run frontend
9. How to seed database
10. Default admin login info
11. Deployment notes
12. Security notes
```

---

## 32. Development Commands

### 32.1 Root Commands

If using npm workspaces, add:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace=backend\" \"npm run dev --workspace=frontend\"",
    "dev:frontend": "npm run dev --workspace=frontend",
    "dev:backend": "npm run dev --workspace=backend"
  }
}
```

### 32.2 Backend Commands

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint .",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "seed": "tsx prisma/seed.ts"
  }
}
```

### 32.3 Frontend Commands

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## 33. Implementation Phases

### Phase 1: Project Setup

Tasks:

```txt
1. Create root project folder: irri-website
2. Create frontend with Next.js 15 + TypeScript
3. Create backend with Express + TypeScript
4. Configure Tailwind CSS and shadcn/ui
5. Configure Prisma and PostgreSQL
6. Add environment variable validation
7. Add base README files
```

Acceptance criteria:

```txt
Frontend runs on http://localhost:3000
Backend runs on http://localhost:5000
Backend health check works
Database connection works
```

### Phase 2: Database and Seed

Tasks:

```txt
1. Create Prisma schema
2. Run migration
3. Create seed file
4. Seed IRRI institution data
5. Seed admin user
6. Seed public content
```

Acceptance criteria:

```txt
Database tables are created
Seed command works
Admin user can be created
IRRI data exists in database
```

### Phase 3: Backend Core

Tasks:

```txt
1. Setup Express app
2. Setup global middleware
3. Setup CORS
4. Setup security headers
5. Setup rate limiter
6. Setup global error handler
7. Setup route registry
8. Setup response helper
9. Setup query builder
10. Setup audit log helper
```

Acceptance criteria:

```txt
All route modules can be registered
Invalid routes return 404
Errors return clean JSON
```

### Phase 4: Authentication and Authorization

Tasks:

```txt
1. Create auth module
2. Add bcrypt password check
3. Add login endpoint
4. Add current user endpoint
5. Add backend auth middleware
6. Add role authorization middleware
7. Add frontend NextAuth Credentials Provider
8. Protect admin dashboard
```

Acceptance criteria:

```txt
Admin can login
Unauthorized users cannot access admin dashboard
Role checks work
Logout works
```

### Phase 5: CMS Backend Modules

Build CRUD APIs for:

```txt
InstitutionProfile
Page
Person
Department
Program
Course
NewsPost
Notice
Event
GalleryAlbum
GalleryImage
Publication
Category
MediaAsset
ContactMessage
AuditLog
```

Acceptance criteria:

```txt
CRUD works
Pagination works
Search works
Status filtering works
Audit log works for protected actions
```

### Phase 6: Public Frontend

Build:

```txt
Home
About
History
Mission & Vision
Administration
Academic Programs
Courses
Research
Publications
Gallery
News
Notices
Events
Contact
```

Acceptance criteria:

```txt
All public pages are responsive
All pages fetch CMS data
Slug pages work
SEO metadata works
Contact form works
```

### Phase 7: Admin Dashboard Frontend

Build:

```txt
Dashboard
Institution profile management
Page management
Administration people management
Department management
Program management
Course management
News management
Notice management
Event management
Gallery management
Publication management
Media library
Contact inbox
Audit logs
User management
Settings
```

Acceptance criteria:

```txt
Admin can create/update/delete CMS data
Forms validate correctly
Tables paginate correctly
Protected routes work
```

### Phase 8: Polish, Security, Performance

Tasks:

```txt
1. Improve UI spacing
2. Add empty states
3. Add loading skeletons
4. Add error states
5. Improve mobile responsiveness
6. Add SEO metadata
7. Add sitemap
8. Add robots.txt
9. Optimize images
10. Check accessibility
11. Check security headers
12. Check rate limiting
13. Check production build
```

Acceptance criteria:

```txt
Frontend build succeeds
Backend build succeeds
No TypeScript errors
No major accessibility issues
No obvious security gaps
Pages load fast
```

---

## 34. Quality Rules for Codex

Follow these rules while generating code:

```txt
1. Do not create all logic inside page files.
2. Keep reusable logic in services, lib, hooks, and components.
3. Do not duplicate form components.
4. Use Zod schemas for validation.
5. Use TypeScript types strictly.
6. Avoid any usage of `any` unless absolutely necessary.
7. Use meaningful file names.
8. Use meaningful component names.
9. Use clean imports with path aliases.
10. Use consistent API response format.
11. Use proper HTTP status codes.
12. Keep UI clean and professional.
13. Never expose password or secret values.
14. Keep frontend and backend separate.
15. Keep public pages SEO-friendly.
16. Keep admin pages user-friendly.
17. Add comments only where logic is complex.
18. Prefer small, maintainable files.
```

---

## 35. Path Aliases

### 35.1 Frontend

Use:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/components/*": ["./src/components/*"],
    "@/features/*": ["./src/features/*"],
    "@/lib/*": ["./src/lib/*"],
    "@/types/*": ["./src/types/*"]
  }
}
```

### 35.2 Backend

Use:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/modules/*": ["./src/modules/*"],
    "@/middlewares/*": ["./src/middlewares/*"],
    "@/utils/*": ["./src/utils/*"],
    "@/lib/*": ["./src/lib/*"],
    "@/config/*": ["./src/config/*"]
  }
}
```

---

## 36. Deployment Plan

Recommended deployment:

```txt
Frontend:
- Vercel

Backend:
- Render / Railway / VPS

Database:
- Supabase PostgreSQL / Neon / Railway PostgreSQL

Media:
- Cloudinary
```

Production environment must use:

```txt
HTTPS
Secure cookies
Production CORS origin
Strong secrets
Database backups
Rate limiting
Logging
```

---

## 37. Final Deliverables

Codex must create:

```txt
1. Root project folder: irri-website
2. Separate frontend folder
3. Separate backend folder
4. Complete frontend folder structure
5. Complete backend folder structure
6. Prisma schema
7. Prisma seed file with IRRI data
8. Public website pages
9. Admin dashboard pages
10. Backend API route handlers
11. Authentication flow
12. Role-based access control
13. CRUD forms
14. Reusable frontend components
15. Reusable backend services
16. Upload system
17. Contact message system
18. Audit log system
19. SEO setup
20. README files
21. .env.example files
```

---

## 38. Definition of Done

The project is complete only when:

```txt
1. Frontend runs without errors
2. Backend runs without errors
3. PostgreSQL database connects successfully
4. Prisma migration works
5. Seed command works
6. Admin can login
7. Admin dashboard is protected
8. Public website pages are visible
9. CRUD operations work
10. Contact form stores messages
11. Media upload works
12. Audit logs are created
13. SEO metadata exists
14. Mobile responsive design is complete
15. Production build succeeds
```

---

## 39. Final Note for Codex

Build this project as a real-world scalable CMS application for an academic/research institute.

The final website should look premium, trustworthy, academic, fast, secure, and easy to manage by non-technical admins.

Most important:

```txt
Keep frontend and backend separate.
Use clean feature-based architecture.
Use CMS-driven content.
Do not hardcode public content except seed/default fallback.
Make the website fast, secure, responsive, SEO-friendly, and professional.
```
