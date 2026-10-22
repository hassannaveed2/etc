# ETC Website — Next.js Build (Public Site + Admin Panel): Design Spec

- **Date:** 2026-10-22
- **Status:** Draft for review
- **Builds on:** the approved HTML mockup (`mockup/`, spec `2026-10-20-etc-html-mockup-design.md`), the ETC Institutional Profile 2026 and the Phase 1 scope slides (WordPress/PHP wording in the slides is disregarded per client direction).
- **Decisions already taken:**
  - Custom admin panel inside the same Next.js app.
  - Hosting on a DigitalOcean droplet (sgp1) managed by Ploi.
  - Admin scope is the slide-8 content types plus practical extras.
  - Rendering approach A: cached server rendering, refreshed on publish.

## 1. Goal and success criteria

Turn the approved mockup into ETC's production website, plus an admin panel that lets ETC staff run the content without developers.

Done means:

1. All 13 page templates from the mockup render from the database, are visually faithful to the approved mockup, and keep its behaviour:
   - mega-menu, mobile drawer, hero carousel, filters, tabs, accordion, stepper, counters, forms;
   - accessibility (WCAG 2.1 AA, including the contrast tokens);
   - responsiveness from 360 px to 1440 px and wider.
2. ETC staff can sign in to `/admin`, create, edit, publish and unpublish every editable content type, upload media, and read form submissions. A published change appears on the public site within 2 seconds without a rebuild.
3. Enquiry and contact forms are stored in the database, shown in the admin panel and emailed to a configured ETC address.
4. The app is deployed to a Ploi-managed staging site from the `staging` branch with migrations applied automatically, and is ready to point at production.
5. Unit and end-to-end tests pass in CI on every push.

**Out of scope (slide 12):**
- registration, payments, admit cards, results or CBT (these link out to the official portals);
- AI proctoring and biometrics;
- legacy API integration;
- mobile apps;
- full Urdu localisation;
- marketing.

The Institutional Profile booklet (`profile/`) stays a separate static deliverable.

## 2. Architecture

```
ETC-web/
  web/                     ← new Next.js application (everything below lives here)
    app/
      (site)/              public site — layout with header/quick links/footer
        page.tsx           /
        about/  tests/  tests/[slug]/  candidate-services/  institutions/  quality/
        news/  news/[slug]/  resources/  faqs/  contact/
        not-found.tsx
      admin/               admin panel (own layout, auth-protected)
        login/  (dashboard)  tests/  notices/  resources/  faqs/  hero/  schedule/
        stats/  clients/  leaders/  media/  enquiries/  messages/  settings/  users/  audit/
      api/health/route.ts  liveness for Ploi
      sitemap.ts  robots.ts
    components/site/       header, mega-menu, drawer, carousel, cards, filters, forms …
    components/admin/      shell, data table, form fields, rich-text editor, media picker …
    lib/                   db (Prisma client), content queries, cache tags, auth, rbac,
                           validation (zod), sanitize, spaces (S3), mail, rate-limit, audit
    prisma/schema.prisma   + migrations/ + seed.ts
    tests/unit  tests/e2e
  mockup/  profile/  docs/  scripts/   (unchanged)
```

**Stack:**

| Area | Choice |
|---|---|
| Framework | Next.js 15 (App Router, React 19, TypeScript strict) |
| Styling | Tailwind CSS 4, design tokens moved from `mockup/assets/js/tailwind.config.js` into `@theme`, including the AA-corrected gold-600, status and focus values |
| Fonts | Source Serif 4 and Inter via `next/font` (self-hosted at build time) |
| Data | Prisma 6 on the DigitalOcean MySQL 8 cluster (SSL required) |
| Validation | zod, shared by forms, server actions and the seed |
| Auth | Auth.js v5: credentials provider, bcrypt password hashes, JWT session (8 h) carrying `role` |
| Uploads | Browser uploads go straight to Spaces using a presigned PUT URL issued by the server. Keys are forced under `ETC/uploads/<yyyy>/<mm>/<uuid>-<slug>.<ext>` (same prefix guard as `scripts/upload-to-spaces.mjs`) |
| Images | `next/image` with Spaces as a remote pattern; `sharp` on the server |
| Mail | Nodemailer over SMTP from environment variables. If SMTP isn't configured, submissions are still stored and the send is skipped and logged |
| Rich text | TipTap editor for notice bodies and leadership messages. HTML is sanitised on save (allow-list: headings h2–h4, paragraphs, lists, bold/italic, links, blockquote) |

**Rendering and caching (approach A):**
- Public pages are Server Components that call typed query functions in `lib/content/*`.
- Each query is wrapped in `unstable_cache` with a tag per content type: `tests`, `notices`, `resources`, `faqs`, `hero`, `schedule`, `stats`, `clients`, `leaders` and `settings`.
- Every admin mutation calls `revalidateTag(type)` (and `revalidatePath` for detail pages), so a published change goes live immediately.
- Filtered lists (news, resources, test directory) read their filters from `searchParams` on the server. Interactive pieces are small client components.

## 3. Data model (Prisma, MySQL)

| Model | Key fields |
|---|---|
| `User` | name, email (unique), passwordHash, role (`ADMIN`/`EDITOR`), active, lastLoginAt |
| `Media` | key, url, mime, size, width, height, alt, uploadedById |
| `Test` | slug (unique), code, name, short, category (`ADMISSIONS`/`POSTGRADUATE`/`LICENSING`/`RECRUITMENT`), level, audience, purpose, eligibility, measures, frequency, frequencyNote, fee (Int, null = by agreement), resultsUse, patternNote, reliability, syllabus (Json string[]), categories (Json, USAT streams), tos (Json, USAT Table of Specifications), imageId, sortOrder, published, seoTitle, seoDescription |
| `TestSection` | testId, name, items (string, null = "as published"), detail, order |
| `Notice` | slug (unique), title, type (`ADMISSION`/`SCHEDULE`/`RESULT`/`RECRUITMENT`/`GENERAL`), testId?, publishedAt, deadline?, status (`OPEN`/`CLOSING`/`RESULT`/`CLOSED`), summary, bodyHtml, published, seoTitle, seoDescription |
| `NoticeAttachment` | noticeId, mediaId, label, order |
| `Resource` | title, type (`SYLLABUS`/`SAMPLE_PAPER`/`GUIDE`/`POLICY`), testId?, mediaId (PDF), date, published |
| `Faq` | category (`REGISTRATION`/`TEST_DAY`/`RESULTS`/`FEES`/`ACCESSIBILITY`/`INSTITUTIONS`), question, answer, order, published |
| `HeroSlide` | eyebrow, title, body, imageId, cta1Label/Href, cta2Label/Href, order, published |
| `ScheduleEntry` | testId, session, regCloses, testDate, status, published |
| `Stat` | value (Int), label, note, order (homepage "ETC in numbers") |
| `Client` | name, sector (`FEDERAL`/`PROVINCIAL`/`UNIVERSITY`/`OTHER`), order |
| `Leader` | role (`CHAIRMAN`/`EXECUTIVE_DIRECTOR`/`CEO`, unique), name, title, photoId, quote, messageHtml |
| `Setting` | key (unique), value — helpline, supportEmail, address, officeHours, portal registration/admit-card/results URLs, enquiry and contact notification emails |
| `Enquiry` | organization, contactPerson, email, phone?, service, candidates, timeline, message, status (`NEW`/`IN_PROGRESS`/`CLOSED`), ipHash, createdAt |
| `ContactMessage` | name, email, subject, message, status, ipHash, createdAt |
| `AuditLog` | userId, action, entity, entityId, summary, createdAt |

- **Seed (`prisma/seed.ts`):**
  - imports the approved mockup content (tests including the USAT tables, sample notices marked "Sample", resources, FAQs, clients, stats, schedule, leadership with Dr Muhammad Imtiaz Haider and his photo, and settings placeholders);
  - registers the existing Spaces images as `Media`;
  - creates the first `ADMIN` from `ADMIN_EMAIL` / `ADMIN_PASSWORD` environment variables (never committed).
- **Databases.** The DigitalOcean cluster is shared with about 45 other projects' databases. ETC code only ever touches its own:

  | Database | Purpose |
  |---|---|
  | `ETC` | Production |
  | `ETCStaging` | Staging site and local development (follows the cluster's `name`/`nameStaging` convention) |
  | `ETCShadow` | Prisma's shadow database for `migrate dev`, so Prisma never creates temporary databases on the shared cluster |

  The `etc` user has the privilege to create these; this was verified on 2026-10-22.
- **CI:** CI does not use the cluster. GitHub Actions runs a MySQL 8 service container that is migrated and seeded for each run.

## 4. Public site

Routes mirror the mockup. `test.html?test=x` becomes `/tests/[slug]` and `notice.html?id=x` becomes `/news/[slug]`. Each mockup HTML section becomes a React component with the same Tailwind classes. Behaviour carries over:

- **Header:** utility bar, crests, mega-menu (click to open, Escape and outside-click to close, closes after in-page links), mobile drawer with focus trap, quick-links bar fed by the portal URLs in Settings.
- **Homepage:** hero carousel (silent while auto-rotating, pause control), counters fed by `Stat`, notices, schedule, tests, journeys, quality story, services, Chairman quote fed by `Leader`, clients marquee.
- **Filters:** `/news?type=&test=&period=&q=` and `/resources?type=&test=&q=`. These render on the server with URL state, an empty state and pagination. The pagination keeps focus on the result count.
- **Forms:** enquiry and contact forms use server actions with zod validation, accessible inline errors and a summary, a honeypot field, and rate limiting (5 per hour per IP). Success shows a status panel.
- **SEO:**
  - per-page `generateMetadata`, with editable titles and descriptions for tests and notices;
  - Open Graph images from the hero or test image;
  - `sitemap.xml` listing every published test and notice;
  - `robots.txt`, with indexing disabled on staging via `NEXT_PUBLIC_SITE_ENV`.
- **Not found:** the branded 404 for unknown routes, tests and notices.

## 5. Admin panel (UX)

The admin is a calm, dense, keyboard-friendly workspace in the ETC palette, so it feels part of the same institution but is optimised for work, not marketing.

- **Layout:** left sidebar with crest, nav groups (Content, Inbox, Library, Settings, plus Users and Audit for admins), a collapsed rail on narrow screens, and a top bar with "View site" and the account menu.
- **Dashboard:**
  - counts of published and draft items per type;
  - new enquiries and messages, with badges;
  - "Closing soon" notices;
  - recently edited items;
  - quick actions: New notice, Upload resource, Edit hero.
- **List screens:** searchable, filterable data table (status chips, test, type), sortable columns, paging, row actions (Edit, Publish/Unpublish, Duplicate, Delete for admins only). Empty states explain the next step.
- **Edit screens:**
  - a two-column form, with fields on the left and Status, Publishing, SEO and Preview on the right;
  - a sticky save bar showing unsaved changes;
  - inline zod errors linked to fields;
  - a "View on site" link after publishing;
  - a confirm dialog for destructive actions;
  - a warning when leaving with unsaved edits.
- **Field types:** the rich-text editor; a media picker (library grid plus drag-and-drop upload with progress, alt text required for images); repeatable rows for test sections, syllabus items, USAT categories and notice attachments. The USAT Table of Specifications is edited as a grid.
- **Inbox:** enquiries and messages, each with status workflow, a detail view, mailto reply and CSV export.
- **Roles:**

  | Role | Can do |
  |---|---|
  | `EDITOR` | Create, edit, publish and unpublish all content; upload media; work the inbox |
  | `ADMIN` | Everything an editor can, plus delete, users, settings and the audit log |

  Every mutation writes an `AuditLog` entry.
- **Accessibility:** the same standards as the public site (labels, focus, keyboard tables and dialogs, AA contrast).

## 6. Security

- `middleware.ts` guards `/admin/**` (everything except `/admin/login`). Each server action re-checks the session and role, rather than trusting the UI.
- **Login:** rate-limited to 5 attempts per 15 minutes per IP and email, with a generic error message. Passwords must be at least 12 characters and are hashed with bcrypt at cost 12. Inactive users are blocked.
- **Uploads:**
  - type and size allow-list: PDF ≤ 15 MB; JPG, PNG and WebP ≤ 5 MB;
  - the server issues the presigned URL only after checking the role and allow-list, and keys can never leave `ETC/uploads/`.
- **Rich text:** HTML is sanitised on save and rendered without scripts.
- **Security headers:**
  - HSTS, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy`, and `frame-ancestors 'none'`;
  - a Content-Security-Policy restricting script, style, image and font sources to self, Spaces and Google Fonts at build time.
- **Secrets:** environment variables only (`.env.local` in development, Ploi's environment in production). Connections to the database use SSL. IP addresses are stored only as salted hashes. No personal data appears in logs.
- **Credentials:** the database and Spaces keys shared in chat are rotated before production go-live.

## 7. Testing and quality

- **Unit tests (Vitest):**
  - zod schemas;
  - content query shaping (filters, sorting, status);
  - sanitiser allow-list;
  - Spaces key guard;
  - role checks;
  - rate limiter;
  - date and fee formatting (ported from the mockup's 39 tests);
  - the contrast test for the tokens.
- **End-to-end tests (Playwright, against a freshly seeded database: the CI container, or `ETCStaging` locally):**
  - every public route renders and the 404s work;
  - the mega-menu and drawer work by keyboard;
  - news, resources and FAQ filters work, including their empty states;
  - enquiry form validation and submission work, and the enquiry appears in the admin panel;
  - an admin can sign in, create a notice and publish it, and it then shows on `/news`;
  - an editor cannot reach Users;
  - an upload completes and the file appears in the media library.
- **Accessibility:** axe checks in end-to-end tests on every public template and the main admin screens.
- **CI (GitHub Actions):** typecheck, lint, unit tests, build and end-to-end tests on push to `staging` and `main`.

## 8. Deployment (Ploi)

- **Server:** Ubuntu droplet in sgp1 provisioned by Ploi, with Node 22 LTS, Nginx as reverse proxy, PM2 running a single instance (the in-memory rate limiter assumes one instance) and Let's Encrypt TLS.
- **Sites:**
  - **staging:** branch `staging`, subdomain to be supplied by the client or Ploi, with noindex;
  - **production:** branch `main`, enabled at go-live.
- **Deploy script:** `cd web && npm ci && npx prisma migrate deploy && npm run build && pm2 reload etc-web`. Health check at `/api/health` (includes a database ping).
- **Backups:** the managed MySQL cluster's daily backups. Media is durable in Spaces.

## 9. Milestones

1. **Foundation:**
   - scaffold `web/`;
   - tokens, fonts and the base layout;
   - Prisma schema, migrations and seed on `ETCStaging`;
   - Auth.js login and the admin shell;
   - CI skeleton.
2. **Public site:** all 13 templates reading from the database, with the interactions and SEO from §4 and end-to-end tests for the public routes.
3. **Admin panel:** content CRUD for every model, the media library, inbox, settings, users and audit, with cache revalidation.
4. **Forms, mail and hardening:** server-action forms, SMTP, rate limits, security headers and the accessibility pass.
5. **Staging on Ploi:** server, environment, deploy script, smoke test and handover notes.

Each milestone ends with a review on staging before the next begins.
