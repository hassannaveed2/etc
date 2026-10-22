# ETC Website (Next.js + Admin Panel) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the approved HTML mockup into ETC's production Next.js website, with a custom admin panel, a MySQL content store, Spaces media and a Ploi deployment.

**Architecture:**
- One Next.js 15 App Router app in `web/`.
- Public pages are Server Components. They read through typed, tag-cached query functions in `lib/content/*`.
- Admin mutations are server actions built by a single `defineAction` factory. Each one:
  - checks session and role;
  - validates with the shared zod schemas;
  - writes an audit entry;
  - calls `revalidateTag`.
- Static prose from the mockup is ported verbatim into JSX. Everything listed in the spec's data model comes from the database.

**Tech Stack:**
- Next.js 15, React 19, TypeScript strict, Tailwind CSS 4 (`@theme`), `next/font`.
- Prisma 6 (MySQL 8), zod 4.
- Auth.js v5 (credentials, JWT) with bcryptjs.
- AWS SDK v3 S3 client and presigner (Spaces), sharp, nodemailer, sanitize-html, TipTap.
- Vitest, Playwright, @axe-core/playwright.
- GitHub Actions; Ploi with PM2 and Nginx.

**Spec:** `docs/superpowers/specs/2026-10-22-etc-nextjs-site-design.md`. Executors read the spec and this plan together.

## Global Constraints

**Versions and platform**
- Next.js 15 App Router, React 19, TypeScript `strict: true`. Node 22 LTS everywhere: local, CI and Ploi.
- Tailwind CSS 4. Tokens live once, in `web/styles/tokens.css` `@theme`, with exactly the mockup values:
  - green 950 `#0B231A`, 900 `#0F2E22`, 800 `#174634`, 700 `#1F5E45`, 600 `#276E51`, 500 `#2E7D5B`, 100 `#DCEBE2`;
  - gold 600 `#7E6224`, 500 `#B8913A`, 300 `#D9BE7C`, 100 `#F3E9CF`;
  - mint 50 `#EEF5F0`, 100 `#E2EEE6`;
  - cream 50 `#FAF6EA`, 100 `#F4ECD6`;
  - ink `#12261E`, muted `#56655E`, line `#D7E2DB`;
  - status: open `#1F7A4D`, closing `#955800`, result `#1D5C96`, closed `#5B6270`;
  - focus ring `#8A6A24` on light backgrounds, `#D9BE7C` on dark.
- Fonts: Source Serif 4 (`--font-serif`) and Inter (`--font-sans`) via `next/font/google`. They are self-hosted at build time.

**Databases (shared cluster)**
- The DigitalOcean MySQL cluster is shared with about 45 other projects. Code and scripts only ever touch `ETC`, `ETCStaging` and `ETCShadow`.
- Never `DROP DATABASE`. Never run `prisma migrate reset` against the cluster.
- Seed is idempotent:
  - per content model, insert only when its table is empty;
  - settings upsert by key without overwriting existing values;
  - the admin user is upserted by email and never has its password changed.
- E2E tests never reset `ETCStaging`. Rows they create have titles or emails starting `E2E ` / `e2e+` and are deleted in `afterAll`.

**Spaces (shared bucket)**
- The `sbsi-cdn` bucket is shared. App uploads are only ever written under `ETC/uploads/`; seed media points at the existing `ETC/mockup/` objects.
- Bucket CORS must be merged with the existing rules, never replaced. Apply it only after the user confirms.

**Secrets and personal data**
- Secrets live only in `web/.env.local` (git-ignored) and in Ploi's environment.
- `web/.env.example` lists names only.
- The chairman's photo is not uploaded to Spaces. It is served from `web/public/img/leaders/`.

**Dates**
- Date-only fields (`publishedAt`, `deadline`, `regCloses`, `testDate`, resource `date`) are `@db.Date` and are formatted from their UTC parts. Today's date is computed in `Asia/Karachi`.

**URLs and filters**
- URL filter values are lowercase params:
  - `?type=admission|schedule|result|recruitment|general`;
  - resources `?type=syllabus|sample-paper|guide|policy`;
  - `?test=<test slug>|general`;
  - `?period=30|90|year`;
  - `?q=`, `?page=`.
- Mockup URLs map to new routes:
  - `test.html?test=x` → `/tests/x`;
  - `notice.html?id=n-foo` → `/news/foo` (the `n-` prefix is dropped);
  - `x.html` → `/x`;
  - `index.html` → `/`.

**Copy**
- Copy carries over verbatim from `mockup/*.html` and `mockup/assets/js/*.js`.
- Public form errors use the mockup wording:
  - `"<Label> is required."`
  - `"Enter an email address like name@example.com."`
  - `"Enter a number greater than zero."`
- Sample content shows the mockup "Sample" chip (`isSample`).

**Roles and policy**
- Roles: `EDITOR` can create, edit, publish and unpublish content, upload media and work the inbox. `ADMIN` can do all of that plus delete, users, settings and audit.
- Every server action re-checks the session against the database, so the user must still be active and their current role is used.
- Passwords are at least 12 characters, hashed with bcryptjs at cost 12. JWT sessions last 8 h.
- Login is limited to 5 attempts per 15 min per IP + email. Public forms are limited to 5 per hour per IP. PM2 runs a single instance.
- Upload allow-list: PDF ≤ 15 MB; JPG, PNG and WebP ≤ 5 MB.
- Sanitised rich text allows only `h2 h3 h4 p br ul ol li strong b em i a blockquote`. Links must be `http`, `https` or `mailto`, and are given `rel="noopener noreferrer"`.

**Process**
- Commits are small, one per task step that says "Commit", and every commit message ends with:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- The work happens on `staging`. Do not push without the user's go-ahead.

## Review Focus

These five inputs are implied by the spec but not exercised by any task's main tests. Each now has a pinning test in the task that owns the code.

1. **Spreadsheet formula injection.** A public form value starting with `=`, `+`, `-` or `@` (for example `=HYPERLINK(...)`) is exported to CSV as plain text, prefixed with `'`. Pinned in Task 24.
2. **Deleting media that is still in use.** Deleting media used by a test, resource, notice attachment, hero slide or leader is refused, with a message naming where it is used. Public pages never show a broken image or link. Pinned in Task 18.
3. **Two editors saving the same record.** The second save is refused with "Someone else saved this item while you were editing. Reload to see their changes." instead of silently overwriting. Pinned in Task 17.
4. **Garbage or out-of-range paging and filter params.** `?page=999`, `?page=abc`, `?type=foo` and `?test=<unknown>` clamp or ignore the bad value and render normally. They never 500. Pinned in Task 6 (unit) and Task 13 (e2e).
5. **A non-Latin title that yields an empty slug.** An Urdu title produces an empty auto-slug. The form shows "Enter a URL slug using English letters, numbers and hyphens." instead of saving an unreachable item. Pinned in Task 6 (unit) and Task 19 (e2e).

---

## File structure (locked)

```
web/
  package.json  tsconfig.json  next.config.ts  eslint.config.mjs  postcss.config.mjs
  vitest.config.ts  playwright.config.ts  .env.example  ecosystem.config.cjs
  auth.config.ts            edge-safe Auth.js config (pages, authorized callback)
  auth.ts                   Auth.js instance with Credentials provider
  middleware.ts             auth guard for /admin + CSP nonce + security headers
  styles/tokens.css         @theme tokens (single source)
  app/globals.css           tailwind import + tokens + ported site.css rules
  app/layout.tsx            <html>, fonts, skip link
  app/(site)/layout.tsx     Header, QuickLinks, Footer
  app/(site)/{page,about,tests,tests/[slug],candidate-services,institutions,quality,
              news,news/[slug],resources,faqs,contact}/page.tsx   + not-found.tsx
  app/admin/login/page.tsx
  app/admin/(panel)/layout.tsx  + page.tsx (dashboard)
  app/admin/(panel)/{tests,notices,resources,faqs,hero,schedule,stats,clients,leaders,
              media,enquiries,messages,settings,users,audit}/…  (page.tsx, [id]/page.tsx, new/page.tsx, actions.ts)
  app/api/health/route.ts   app/api/admin/uploads/route.ts   app/admin/(panel)/{enquiries,messages}/export/route.ts
  app/sitemap.ts  app/robots.ts
  components/site/…  components/admin/…  components/ui/icon.tsx
  lib/env.ts  lib/db.ts  lib/cache.ts  lib/labels.ts  lib/format.ts  lib/slug.ts  lib/filters.ts
  lib/content/{tests,notices,resources,faqs,home,leaders,settings}.ts
  lib/validation/{content,forms,admin}.ts
  lib/auth/{password,credentials,session}.ts  lib/rbac.ts  lib/rate-limit.ts  lib/ip.ts
  lib/admin/{action,audit,lock,media-usage,csv}.ts
  lib/spaces.ts  lib/mail.ts  lib/sanitize.ts  lib/csp.ts
  prisma/schema.prisma  prisma/migrations/  prisma/seed.ts  prisma/seed-data/{mockup.json,hero.ts,leaders.ts,settings.ts}
  prisma/certs/ca-certificate.crt   (DigitalOcean cluster CA — public, committed)
  scripts/{create-databases.mjs,port-mockup-data.mjs,spaces-cors.mjs,smoke.mjs}
  public/brand/{etc-crest.png,hec-crest.png}  public/img/leaders/imtiaz-haider.jpg
  tests/unit/*.test.ts  tests/integration/*.test.ts  tests/e2e/*.spec.ts  tests/e2e/global-setup.ts
deploy/ploi-deploy.sh  docs/handover/staging.md  .github/workflows/web.yml
```

npm scripts in `web/package.json`:
- `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`);
- `test` (`vitest run tests/unit`), `test:int` (`vitest run tests/integration`), `e2e` (`playwright test`);
- `db:migrate` (`prisma migrate dev`), `db:deploy` (`prisma migrate deploy`), `db:seed` (`tsx prisma/seed.ts`).

The root `package.json` and the mockup tests (`npm test` at the root, 39 tests) stay unchanged and must keep passing.

---

## Milestone 1: Foundation

### Task 1: Scaffold `web/` with tokens, fonts, base CSS and the test harness

**Files:**
- Create: everything in `web/` at the config level, plus `styles/tokens.css`, `app/globals.css`, `app/layout.tsx`, a placeholder `app/(site)/page.tsx`, and `public/brand/*` copied from `mockup/assets/img/brand/`.
- Test: `web/tests/unit/contrast.test.ts`

**Interfaces:**
- Produces:
  - Tailwind utility names identical to the mockup (`bg-green-700`, `text-gold-600`, `bg-status-open/10`, `max-w-site`, `tracking-eyebrow`, `shadow-card`, `shadow-lift`, `animate-marquee`, `font-serif`, `font-sans`);
  - the CSS classes `.eyebrow`, `.on-dark`, `.pattern-dots`, `.data-table`, `.table-wrap`, `.no-scrollbar`, `.crest-roundel` and `.marquee`, plus the `[data-reveal]` and `[data-carousel]` rules, ported from `mockup/assets/css/site.css`.

- [ ] **Step 1: Scaffold the app**

  Run:
  ```bash
  npx create-next-app@15 web --ts --eslint --tailwind --app --no-src-dir --import-alias "@/*" --use-npm
  ```
  Then install the dev dependencies:
  ```bash
  npm i -D vitest @vitejs/plugin-react vite-tsconfig-paths tsx @playwright/test @axe-core/playwright
  ```
  Set `"strict": true` and add the npm scripts listed above.

- [ ] **Step 2: Write the failing contrast test**

  Port `tests/contrast.test.mjs` to `web/tests/unit/contrast.test.ts`. The colours are read by regex from `web/styles/tokens.css` (`--color-gold-600: #7E6224;`) and the focus ring from `web/app/globals.css`. Keep all of the mockup's assertions, including:

  ```ts
  test("gold-600 small text meets 4.5:1 on white, mint-50, cream-50 and gold-100", ...)
  test("status chip text meets 4.5:1 on its own 10% tint and on mint-50", ...)
  test("focus ring on light surfaces meets 3:1 non-text contrast", ...) // ring parsed from `:focus-visible { outline: 3px solid #8A6A24`
  ```

- [ ] **Step 3: Run the test to see it fail**

  Run: `cd web && npx vitest run tests/unit/contrast.test.ts`
  Expected: FAIL with ENOENT for `styles/tokens.css`.

- [ ] **Step 4: Write the tokens and base CSS**

  - Write `styles/tokens.css` as `@theme { --color-…; --font-serif; --font-sans; --max-width-site: 80rem; --tracking-eyebrow: .22em; --shadow-card; --shadow-lift; --animate-marquee: marquee 60s linear infinite; @keyframes marquee … }`.
  - Write `app/globals.css`: `@import "tailwindcss"; @import "../styles/tokens.css";`, followed by every rule from `mockup/assets/css/site.css` verbatim.
  - In `app/layout.tsx`:
    - load the fonts with `variable: "--font-serif"` and `"--font-sans"`;
    - set `<html lang="en">`;
    - add a skip link to `#main`.

- [ ] **Step 5: Run the tests and the build**

  Run: `cd web && npx vitest run && npm run typecheck && npm run build`
  Expected: 3 tests pass; the build succeeds.

- [ ] **Step 6: Commit**

  `git add web && git commit -m "feat(web): scaffold Next.js app with ETC tokens, fonts and base CSS"`

---

### Task 2: Prisma schema, databases and the first migration

**Files:**
- Create:
  - `web/prisma/schema.prisma`;
  - `web/prisma/migrations/<ts>_init/`;
  - `web/lib/db.ts`, `web/lib/env.ts`;
  - `web/scripts/create-databases.mjs`;
  - `web/.env.example`;
  - `web/prisma/certs/ca-certificate.crt`.
- Test: `web/tests/unit/env.test.ts`

**Interfaces:**
- Produces:
  - `prisma` (a singleton `PrismaClient`) from `@/lib/db`;
  - `getEnv(): Env` from `@/lib/env`. This is zod-parsed and cached. It throws an `Error` listing every missing or invalid variable name, never the values;
  - the Prisma enums `Role`, `TestCategory`, `NoticeType`, `Status`, `ResourceType`, `FaqCategory`, `ClientSector`, `LeaderRole`, `InboxStatus` and `AuditAction`.

**Schema decisions** (on top of spec §3):
- Every model has `id Int @id @default(autoincrement())`. Content models have `createdAt` and `updatedAt @updatedAt @db.DateTime(3)`. `updatedAt` is the lock version used in Task 17.
- `Status` enum: `OPEN | CLOSING | RESULT | CLOSED`. It is shared by `Notice.status` and `ScheduleEntry.status`.
- `AuditAction` enum: `CREATE | UPDATE | DELETE | PUBLISH | UNPUBLISH | LOGIN | UPLOAD | STATUS`.
- `InboxStatus` enum: `NEW | IN_PROGRESS | CLOSED`.
- `Notice.isSample` and `Resource.isSample` are `Boolean @default(false)`.
- `Resource.mediaId`, `Test.imageId`, `HeroSlide.imageId` and `Leader.photoId` are required or optional exactly as in spec §3, with `onDelete: Restrict`.
- `Media.key` is `@unique`. Seed media uses key `mockup/<path>`; local files use key `local/<path>`.
- Long text (`purpose`, `bodyHtml`, `messageHtml`, `answer`, `message`) is `@db.Text`. Json columns are `syllabus`, `categories` and `tos`.
- The datasource has `shadowDatabaseUrl = env("SHADOW_DATABASE_URL")`.

**Environment variables** (`.env.example`, names only):
- Database: `DATABASE_URL`, `SHADOW_DATABASE_URL`.
- Auth: `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`.
- Spaces: `SPACES_ENDPOINT`, `SPACES_REGION`, `SPACES_BUCKET`, `SPACES_KEY`, `SPACES_SECRET`, `SPACES_CDN_BASE`.
- Privacy: `IP_HASH_SALT`.
- Mail: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
- Site: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_ENV` (`development|staging|production`).

`DATABASE_URL` takes the form `mysql://etc:<pw>@<host>:25060/ETCStaging?sslcert=./certs/ca-certificate.crt&sslaccept=strict`.

- [ ] **Step 1: Write the failing env test**

  ```ts
  test("getEnv reports missing names without values", () => {
    expect(() => parseEnv({ DATABASE_URL: "mysql://x" })).toThrow(/AUTH_SECRET/);
    expect(() => parseEnv({ DATABASE_URL: "mysql://u:secretpw@h/db" })).not.toThrow(/secretpw/);
  });
  test("SMTP vars are optional; SITE_ENV defaults to development", () => {
    expect(parseEnv(minimalValidEnv).NEXT_PUBLIC_SITE_ENV).toBe("development");
  });
  ```

  `parseEnv(raw: Record<string, string | undefined>): Env` is exported for tests. `getEnv()` calls it with `process.env`.

- [ ] **Step 2: Run the test to see it fail, then implement `lib/env.ts` and `lib/db.ts`**

  `lib/db.ts` uses the standard `globalThis` singleton so dev hot-reload doesn't open new connections.

- [ ] **Step 3: Write the schema and `scripts/create-databases.mjs`**

  - The script uses `mysql2`.
  - It has a hard-coded allow-list `["ETCStaging", "ETCShadow"]` and runs `CREATE DATABASE IF NOT EXISTS` for each.
  - It refuses any other name.
  - It has no DROP statement anywhere.
  - It reads `DB_*` from `../.env.local` (the root file that already exists).

- [ ] **Step 4: Get the CA certificate, then create the databases and migrate**

  - Check that `web/prisma/certs/ca-certificate.crt` exists. If it doesn't, **stop and ask the user** to download it: DigitalOcean → Databases → cluster → "Download CA certificate".
  - Then run:
    ```bash
    node --env-file=../.env.local scripts/create-databases.mjs && npx prisma migrate dev --name init
    ```
  - Expected: "ETCStaging ok", "ETCShadow ok", then "Your database is now in sync with your schema."

- [ ] **Step 5: Run the tests**

  Run: `npx vitest run && npm run typecheck`
  Expected: PASS.

- [ ] **Step 6: Commit**

  Commit the schema, migration, `lib/env.ts`, `lib/db.ts`, the script, the example env and the CA certificate.

---

### Task 3: Shared labels, the zod content schemas and an idempotent seed

**Files:**
- Create:
  - `web/lib/labels.ts`, `web/lib/validation/content.ts`;
  - `web/lib/auth/password.ts` (moved here because the seed needs it; it is tested in Task 4);
  - `web/scripts/port-mockup-data.mjs`;
  - `web/prisma/seed-data/mockup.json` (generated), `hero.ts`, `leaders.ts`, `settings.ts`;
  - `web/prisma/seed.ts`;
  - `web/public/img/leaders/imtiaz-haider.jpg` (copied from `profile/img/headshot.jpg`).
- Test: `web/tests/unit/seed-data.test.ts`, `web/tests/integration/seed.test.ts`

**Interfaces:**
- Produces, in `lib/labels.ts`:
  - `TEST_CATEGORY`, `NOTICE_TYPE`, `RESOURCE_TYPE`, `FAQ_CATEGORY`, `STATUS` and `CLIENT_SECTOR`. Each has the shape `Record<Enum, { label: string; param: string }>`. The labels are the mockup strings ("Admissions", "Sample paper", "Test day" and so on). `STATUS` labels are "Open", "Closing soon", "Result" and "Closed".
  - `fromParam<E>(map, param: string | undefined): E | undefined`.
- Produces, in `lib/validation/content.ts`:
  - `testInput`, `testSectionInput`, `noticeInput`, `noticeAttachmentInput`, `resourceInput`, `faqInput`, `heroSlideInput`, `scheduleEntryInput`, `statInput`, `clientInput`, `leaderInput`, `settingsInput`;
  - `SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/`;
  - the `SETTINGS_KEYS` tuple: `helpline`, `supportEmail`, `address`, `officeHours`, `portalRegistrationUrl`, `portalAdmitCardUrl`, `portalResultsUrl`, `enquiryNotifyEmail`, `contactNotifyEmail`.
- Produces `seed(prisma: PrismaClient, env: { ADMIN_EMAIL; ADMIN_PASSWORD; ADMIN_NAME }): Promise<SeedReport>` from `prisma/seed.ts`. `SeedReport` is `Record<model, "inserted" | "skipped">`.

- [ ] **Step 1: Port the mockup data**

  `scripts/port-mockup-data.mjs` loads `mockup/assets/js/{media,data}.js` in a `vm` context, as `tests/helpers/load.mjs` does, and writes `prisma/seed-data/mockup.json`. It maps:
  - mockup categories and types to enums (`"Sample paper"` → `SAMPLE_PAPER`);
  - notice `id` to `slug` (the `n-` prefix is stripped);
  - each notice `body: string[]` to `bodyHtml` (`<p>…</p>` joined);
  - `test: "general"` to `null`;
  - `image` keys to `mockup/images/<file>` media keys.

  Then run `node scripts/port-mockup-data.mjs` and commit the JSON.

- [ ] **Step 2: Hand-port the content that isn't in `data.js`**

  - `hero.ts`: the three slides from the `mockup/index.html` lines 29–96. Copy the eyebrow, title, body, both CTAs and the image key.
  - `leaders.ts`:
    - three leaders (`CHAIRMAN`, `EXECUTIVE_DIRECTOR`, `CEO`), all "Dr Muhammad Imtiaz Haider";
    - titles "Chairman, Board of Governors", "Executive Director, HEC" and "Chief Executive Officer";
    - quotes and messages from `mockup/about.html#leadership` and the homepage quote;
    - photo media key `local/img/leaders/imtiaz-haider.jpg` with url `/img/leaders/imtiaz-haider.jpg`.
  - `settings.ts`: the placeholders currently in the mockup footer and contact page. The portal URLs are `#portal-registration`, `#portal-admit-card` and `#portal-results`.

- [ ] **Step 3: Write the failing seed-data test**

  ```ts
  test("every mockup record passes the admin schemas", () => {
    for (const t of data.tests) expect(testInput.safeParse(t).success).toBe(true);
    // same for notices, resources, faqs, schedule, stats, clients, hero, leaders, settings
  });
  test("counts match the mockup", () => {
    expect(data.tests).toHaveLength(6);
    expect(data.faqs).toHaveLength(19);
    expect(data.stats).toHaveLength(8);
    expect(data.schedule).toHaveLength(5);
    expect(data.resources).toHaveLength(17);
  });
  test("USAT keeps its 6 categories and 13 TOS rows", () => {
    const usat = data.tests.find(t => t.slug === "usat")!;
    expect(usat.categories).toHaveLength(6);
    expect(usat.tos.rows).toHaveLength(13);
  });
  ```

- [ ] **Step 4: Run the test to see it fail, then write the schemas until it passes**

  Run: `npx vitest run tests/unit/seed-data.test.ts`

- [ ] **Step 5: Write the integration test, then `prisma/seed.ts`**

  The integration test runs only when `DATABASE_URL` is set, using `describe.skipIf`.

  ```ts
  test("seed is idempotent and never overwrites", async () => {
    const first = await seed(prisma, env);
    await prisma.setting.update({ where: { key: "helpline" }, data: { value: "E2E edited" } });
    const second = await seed(prisma, env);
    expect(Object.values(second).every(v => v === "skipped")).toBe(true);
    expect((await prisma.setting.findUnique({ where: { key: "helpline" } }))!.value).toBe("E2E edited");
    // restore helpline in afterAll
  });
  ```

  - `seed.ts` registers `Media` rows for the 16 `ETC.media` images, the two crests (`local/brand/…`) and a placeholder PDF key `mockup/files/sample.pdf`.
  - All sample resources and attachments point at that PDF, with `isSample: true`.
  - Upload the placeholder once with the existing root script:
    ```bash
    npm run upload -- <dir-with-sample.pdf> files
    ```
  - Wire `"prisma": { "seed": "tsx prisma/seed.ts" }`. Hash the admin password with `hashPassword` from `lib/auth/password.ts`.

- [ ] **Step 6: Run the seed and the tests**

  Run: `npx prisma db seed && npx vitest run tests/unit tests/integration`
  Expected: the seed report shows `inserted` the first time and `skipped` on a second run; all tests pass.

- [ ] **Step 7: Commit**

---

### Task 4: Authentication, RBAC, rate limiting and the admin shell

**Files:**
- Create:
  - `web/lib/auth/credentials.ts`, `web/lib/auth/session.ts`;
  - `web/lib/rbac.ts`, `web/lib/rate-limit.ts`, `web/lib/ip.ts`;
  - `web/auth.config.ts`, `web/auth.ts`, `web/middleware.ts`, `web/app/api/auth/[...nextauth]/route.ts`;
  - `web/app/admin/login/page.tsx` + `actions.ts`;
  - `web/app/admin/(panel)/layout.tsx`, `web/app/admin/(panel)/page.tsx` (placeholder dashboard);
  - `web/components/admin/{Sidebar,TopBar,AccountMenu}.tsx`.
- Test: `web/tests/unit/{password,rbac,rate-limit,credentials,ip}.test.ts`, `web/tests/e2e/admin-auth.spec.ts`

**Interfaces:**
- `lib/auth/password.ts` (created in Task 3):
  - `hashPassword(pw: string): Promise<string>` (bcryptjs, cost 12);
  - `verifyPassword(pw, hash): Promise<boolean>`;
  - `PASSWORD_MIN = 12`.
- `lib/rbac.ts`:
  - `type Permission = "content:write" | "content:delete" | "media:upload" | "media:delete" | "inbox:work" | "settings:manage" | "users:manage" | "audit:read"`;
  - `can(role: Role, p: Permission): boolean`. `EDITOR` gets `content:write`, `media:upload` and `inbox:work`. `ADMIN` gets everything.
- `lib/rate-limit.ts`:
  - `createRateLimiter({ limit, windowMs, now? }): { hit(key: string): { ok: boolean; retryAfterSec: number }; reset(key: string): void }`. Sliding window, in memory;
  - exports `loginLimiter` (5 per 15 min) and `formLimiter` (5 per 60 min).
- `lib/ip.ts`:
  - `getClientIp(h: Headers): string`. Uses the first entry of `x-forwarded-for`, then `x-real-ip`, then `"0.0.0.0"`;
  - `hashIp(ip: string, salt: string): string` (sha256 hex).
- `lib/auth/credentials.ts`:
  - `verifyCredentials(input: { email; password; ip }, deps = defaultDeps): Promise<SessionUser | null>`;
  - `SessionUser = { id: number; name: string; email: string; role: Role }`. The limiter key is `` `${ip}|${email.toLowerCase()}` ``. On success it updates `lastLoginAt` and audits `LOGIN`.
- `lib/auth/session.ts`:
  - `getCurrentUser(): Promise<SessionUser | null>`. Reads the Auth.js session, then reloads the user from the database, and returns `null` if the user is missing or inactive;
  - `requireUser(p?: Permission): Promise<SessionUser>`. Redirects to `/admin/login`, or throws `ForbiddenError` if the user lacks the permission.

- [ ] **Step 1: Write the failing unit tests**

  ```ts
  // password
  test("hashes verify and use cost 12", async () => { const h = await hashPassword("correct horse battery"); expect(h).toMatch(/^\$2[aby]\$12\$/); expect(await verifyPassword("correct horse battery", h)).toBe(true); });
  // rbac
  test("editor cannot delete or manage users", () => { expect(can("EDITOR","content:delete")).toBe(false); expect(can("EDITOR","users:manage")).toBe(false); expect(can("EDITOR","content:write")).toBe(true); expect(can("ADMIN","audit:read")).toBe(true); });
  // rate-limit
  test("6th hit inside window is refused and frees after window", () => { let t=0; const l=createRateLimiter({limit:5,windowMs:1000,now:()=>t}); for(let i=0;i<5;i++) expect(l.hit("k").ok).toBe(true); expect(l.hit("k")).toEqual({ok:false,retryAfterSec:1}); t=1001; expect(l.hit("k").ok).toBe(true); });
  // credentials
  test("wrong password, unknown email and inactive user all return null", ...);
  test("6th attempt is refused even with the right password", ...);
  test("email is matched case-insensitively", ...);
  // ip
  test("first x-forwarded-for entry wins", () => expect(getClientIp(new Headers({"x-forwarded-for":"1.2.3.4, 10.0.0.1"}))).toBe("1.2.3.4"));
  ```

- [ ] **Step 2: Run the tests to see them fail, then implement the four new `lib` modules**

  Run: `npx vitest run tests/unit` → FAIL. Implement until it passes. The password tests pass already from Task 3.

- [ ] **Step 3: Wire up Auth.js**

  - `auth.config.ts`:
    - `pages: { signIn: "/admin/login" }`, `session: { strategy: "jwt", maxAge: 8 * 3600 }`;
    - the `authorized` callback returns `false` for `/admin/**` except `/admin/login` when there's no session;
    - the `jwt` and `session` callbacks copy `id` and `role`.
  - `auth.ts` adds the Credentials provider. Its `authorize` calls `verifyCredentials` with the IP from `headers()`.
  - `middleware.ts` exports `auth` from `NextAuth(authConfig)` with matcher `["/admin/:path*"]`. Task 27 extends it.

- [ ] **Step 4: Build the login page and the admin shell**

  - The login page has email and password fields. On any failure it shows the single generic message "Email or password is incorrect, or the account is locked. Try again in 15 minutes."
  - The shell layout follows spec §5:
    - a sidebar with the ETC crest;
    - nav groups Content (Tests, Notices, Resources, FAQs, Hero, Schedule, Stats, Clients, Leaders), Inbox (Enquiries, Messages), Library (Media) and Settings (Settings, plus Users and Audit only when `can(role, …)`);
    - a rail below `lg`;
    - a top bar with "View site", which opens `/` in a new tab, and an account menu with Sign out.

- [ ] **Step 5: Write the e2e test**

  ```ts
  test("anonymous /admin redirects to login", async ({ page }) => { await page.goto("/admin"); await expect(page).toHaveURL(/\/admin\/login/); });
  test("admin signs in and sees the dashboard", async ({ page }) => { await login(page, ADMIN); await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible(); });
  test("wrong password shows the generic error", ...);
  ```

  - `playwright.config.ts`: `webServer: { command: "npm run build && npm run start", port: 3000 }`, `globalSetup: tests/e2e/global-setup.ts`.
  - The global setup creates `e2e+editor@etc.test` as an `EDITOR` with a fixed test password defined in `tests/e2e/fixtures.ts`.

- [ ] **Step 6: Run the tests**

  Run: `npx vitest run && npx playwright test tests/e2e/admin-auth.spec.ts`
  Expected: PASS.

- [ ] **Step 7: Commit**

---

### Task 5: CI workflow

**Files:**
- Create: `.github/workflows/web.yml`

The workflow:
- runs on push to `staging` and `main`, and on `pull_request`;
- uses `ubuntu-latest` with Node 22 and an npm cache keyed on `web/package-lock.json`;
- runs a `mysql:8.0` service with root password `root` and database `etc_ci`.

Steps, all with `working-directory: web`:
1. `npm ci`
2. `npx prisma migrate deploy`
3. `npx prisma db seed`
4. `npm run typecheck`
5. `npm run lint`
6. `npm test`
7. `npm run test:int`
8. `npx playwright install --with-deps chromium`
9. `npm run e2e`

Environment:
- `DATABASE_URL=mysql://root:root@127.0.0.1:3306/etc_ci`;
- a dummy `AUTH_SECRET`;
- `ADMIN_EMAIL=e2e+admin@etc.test` and an `ADMIN_PASSWORD` set from a repository secret `CI_ADMIN_PASSWORD`, falling back to a literal test value;
- `IP_HASH_SALT=ci`;
- `NEXT_PUBLIC_SITE_ENV=staging`.

Spaces variables are absent, so upload e2e tests skip themselves.

The existing root mockup job is untouched. Add a separate job that runs the root `npm test`.

- [ ] **Step 1: Write the workflow.**
- [ ] **Step 2: Lint it locally.** Run `npx --yes action-validator .github/workflows/web.yml`. If that isn't available, check the YAML parses with `node -e "require('yaml').parse(...)"`.
- [ ] **Step 3: Commit.** CI runs on the first push, which happens only when the user says so.

---

## Milestone 2: Public site

### Task 6: Pure helpers (formatting, slugs, filters, paging)

**Files:**
- Create: `web/lib/format.ts`, `web/lib/slug.ts`, `web/lib/filters.ts`
- Test: `web/tests/unit/{format,slug,filters}.test.ts`. Port every relevant assertion from the root `tests/lib.test.mjs` and `tests/data.test.mjs`.

**Interfaces:**
- `format.ts`:
  - `formatFee(fee: number | null): string` gives `"Rs. 2,000"` or `"By agreement"`;
  - `formatDate(d: Date | string): string` gives `"15 Oct 2026"`, from UTC parts;
  - `todayInKarachi(now?: Date): Date` returns UTC midnight of today's date in Pakistan;
  - `FEE_NOTE = "As per ETC Institutional Profile 2026; always confirm in the official announcement."`
- `slug.ts`:
  - `slugify(input: string): string` produces lowercase ASCII with hyphens, at most 80 characters, and `""` when nothing usable remains.
- `filters.ts`:
  - `type SP = Record<string, string | string[] | undefined>`;
  - `parsePage(raw): number` returns an integer ≥ 1, defaulting to 1;
  - `paginate(total: number, page: number, perPage: number): { page: number; pages: number; skip: number; take: number }`. `pages` is at least 1 and `page` is clamped to `[1, pages]`;
  - `parseNoticeFilters(sp: SP, testSlugs: string[]): { type?: NoticeType; test?: string | "general"; period?: "30" | "90" | "year"; q?: string; page: number }`;
  - `sinceDate(period, today: Date): Date | null`;
  - `noticeWhere(f, today): Prisma.NoticeWhereInput`. It always includes `published: true`. `q` matches `title` or `summary` with `contains`;
  - `parseResourceFilters(sp, testSlugs)` and `resourceWhere(f)`;
  - `searchFaqs<T extends { question: string; answer: string; category: FaqCategory }>(list: T[], q: string, category?: FaqCategory): T[]` for client-side use;
  - `NEWS_PER_PAGE = 8`, `RESOURCES_PER_PAGE = 12`.

- [ ] **Step 1: Write the failing tests**

  ```ts
  expect(formatFee(2000)).toBe("Rs. 2,000"); expect(formatFee(null)).toBe("By agreement");
  expect(formatDate("2026-10-15")).toBe("15 Oct 2026"); expect(formatDate(new Date("2026-01-05T00:00:00Z"))).toBe("5 Jan 2026");
  expect(todayInKarachi(new Date("2026-10-21T20:30:00Z")).toISOString()).toBe("2026-10-22T00:00:00.000Z");
  expect(sinceDate("30", new Date("2026-10-22"))!.toISOString().slice(0,10)).toBe("2026-09-22");
  expect(sinceDate("year", new Date("2026-10-22"))!.toISOString().slice(0,10)).toBe("2026-01-01");
  expect(slugify("USAT December 2026: Registration Open!")).toBe("usat-december-2026-registration-open");
  // Review Focus 5
  expect(slugify("داخلہ ٹیسٹ کا اعلان")).toBe("");
  // Review Focus 4
  expect(parsePage("abc")).toBe(1); expect(parsePage("-3")).toBe(1); expect(parsePage(["2","5"])).toBe(2);
  expect(paginate(17, 999, 8)).toEqual({ page: 3, pages: 3, skip: 16, take: 8 });
  expect(paginate(0, 1, 8)).toEqual({ page: 1, pages: 1, skip: 0, take: 8 });
  expect(parseNoticeFilters({ type: "foo", test: "nope", period: "7" }, ["usat"])).toEqual({ page: 1 });
  expect(parseNoticeFilters({ type: "result", test: "usat", q: "  dec " }, ["usat"])).toEqual({ type: "RESULT", test: "usat", q: "dec", page: 1 });
  expect(noticeWhere({ test: "general", page: 1 }, today)).toMatchObject({ published: true, testId: null });
  expect(searchFaqs(faqs, "admit", undefined).map(f => f.category)).toContain("TEST_DAY");
  ```

- [ ] **Step 2: Run the tests to see them fail. Implement the helpers. Run them to see them pass.**
- [ ] **Step 3: Commit**

---

### Task 7: The cached content query layer

**Files:**
- Create: `web/lib/cache.ts`, `web/lib/content/{tests,notices,resources,faqs,home,leaders,settings}.ts`
- Test: `web/tests/integration/content.test.ts`

**Interfaces:**
- `lib/cache.ts`:
  - `TAGS = { tests, notices, resources, faqs, hero, schedule, stats, clients, leaders, settings, media } as const`;
  - `type Tag`;
  - `cached<A extends unknown[], R>(fn: (...a: A) => Promise<R>, key: string, tags: Tag[]): (...a: A) => Promise<R>`. This is a thin `unstable_cache` wrapper with `revalidate: 3600` as a safety net.
- Each function below is wrapped with `cached` and returns plain serialisable objects (dates as ISO `YYYY-MM-DD` strings):
  - `getPublishedTests(): TestCard[]`, `getTestBySlug(slug): TestDetail | null`, `getTestOptions(): { slug; code }[]`;
  - `getLatestNotices(n): NoticeRow[]`, `searchNotices(f, today): { items: NoticeRow[]; total; page; pages }`, `getNoticeBySlug(slug): NoticeDetail | null`, `getNoticesForTest(testId, n)`;
  - `searchResources(f): { items: ResourceCard[]; total; page; pages }`, `getResourcesForTest(testId)`;
  - `getFaqs(): FaqItem[]`;
  - `getHeroSlides()`, `getStats()`, `getSchedule(): ScheduleItem[]` (sorted by `regCloses`), `getClients(): Record<ClientSector, string[]>`;
  - `getLeader(role)`, `getLeaders()`;
  - `getSettings(): SiteSettings`. Missing keys fall back to `prisma/seed-data/settings.ts` defaults.
- The DTO types (`TestCard`, `TestDetail`, `NoticeRow`, `NoticeDetail`, `ResourceCard`, `ScheduleItem`, `FaqItem`, `SiteSettings`) are exported from each module.
  - Media references resolve to `{ url: string; alt: string; width?: number; height?: number }`.
  - Resource cards carry `fileUrl`, `sizeLabel` (for example `"420 KB"`) and `isSample`.

- [ ] **Step 1: Write the failing integration test against the seeded database**

  ```ts
  test("published tests come back in sortOrder with fees", async () => { const t = await getPublishedTests(); expect(t.map(x=>x.slug)).toEqual(["lat","law-gat","hat","haat","usat","customized"]); });
  test("unpublished notice is invisible to list and detail", async () => { /* create E2E notice published:false; expect searchNotices total unchanged; getNoticeBySlug null */ });
  test("searchNotices clamps page", async () => { const r = await searchNotices({ page: 999 }, today); expect(r.page).toBe(r.pages); });
  test("getTestBySlug('usat') includes sections in order, 6 categories, tos rows", ...);
  ```

  `unstable_cache` outside a Next request: export the uncached functions as `_getX` for tests, and run the tests through the `_` variants.

- [ ] **Step 2: Run the test to see it fail. Implement. Run it to see it pass.**
- [ ] **Step 3: Commit**

---

### Task 8: Site chrome (header, mega-menu, drawer, quick links, footer, 404)

**Files:**
- Create:
  - `web/components/ui/icon.tsx`, with `Icon({ name, className })` and every path from `mockup/assets/js/partials.js` `PATHS`;
  - `web/components/site/{Header,MegaMenu,MobileDrawer,QuickLinks,Footer,PortalLink,Brand}.tsx`;
  - `web/lib/nav.ts`, which is `NAV` from `partials.js` with the routes mapped;
  - `web/app/(site)/layout.tsx`, `web/app/(site)/not-found.tsx`.
- Test: `web/tests/e2e/chrome.spec.ts`

**Interfaces:**
- `NAV: { id; label; href; blurb; links: [label: string, href: string][] }[]`
- `PortalLink({ which: "registration" | "admitCard" | "results", children?, className? })` takes its URL from `getSettings()`. It renders `target="_blank" rel="noopener"`, the external icon and the sr-only text " (official ETC portal, opens in new tab)".
- `Header({ active?: NavId })` is a server component. `MegaMenu` and `MobileDrawer` are client components.

**Behaviour** is ported from `mockup/assets/js/app.js`:
- The mega-menu opens on click. Escape closes it and returns focus to the trigger. An outside click closes it, and so does following a link inside the panel. It uses `aria-expanded`.
- The drawer traps focus, restores focus on close, and locks body scroll.
- The active section is set from the pathname. The mockup's `ACTIVE` map applies: `/tests/*` → tests, `/news/*` → news, `/faqs` → candidate.

- [ ] **Step 1: Write the failing e2e test**

  ```ts
  test("mega-menu opens by keyboard and Escape returns focus", async ({ page }) => { await page.goto("/"); const t = page.getByRole("button", { name: "Tests & Assessments" }); await t.focus(); await page.keyboard.press("Enter"); await expect(t).toHaveAttribute("aria-expanded","true"); await page.keyboard.press("Escape"); await expect(t).toBeFocused(); await expect(t).toHaveAttribute("aria-expanded","false"); });
  test("drawer traps focus at 375px", ...);
  test("unknown route shows the branded 404 with status 404", async ({ page }) => { const r = await page.goto("/nope"); expect(r!.status()).toBe(404); await expect(page.getByRole("heading", { level: 1 })).toHaveText(/* mockup/404.html h1 */); });
  ```

- [ ] **Step 2: Run the test to see it fail. Port the markup and classes from `partials.js` `renderHeader` and `renderFooter` and from `404.html`. Run it to see it pass.**
- [ ] **Step 3: Commit**

---

### Task 9: Shared site components and interactions

**Files:**
- Create in `web/components/site/`:
  - `StatusChip`, `SampleChip`, `NoticeRow`, `TestCard`, `ScheduleItem`, `ResourceCard`;
  - `Counter`, `Reveal`, `Accordion`, `Tabs`, `Carousel`, `ShareButtons`, `PrintButton`, `Pagination`, `EmptyState`, `SectionHeading`.
- Test: `web/tests/unit/components.test.tsx` (Vitest + `@testing-library/react`, jsdom environment for this file only)

**Interfaces:**
- The card components take the DTOs from Task 7 and render the exact markup of `render.js`: `R.noticeRow`, `R.testCard`, `R.scheduleItem`, `R.resourceCard` and `R.statusChip`.
- `Counter({ value, suffix? })` counts up once on intersection. With reduced motion it shows the final value straight away. The final value is always in the server HTML, for no-JS and screen readers.
- `Carousel({ slides })`:
  - auto-rotates every 7 s;
  - the live region is silent while rotating and announces only after manual navigation;
  - the pause button toggles `aria-label` between "Pause slideshow" and "Play slideshow";
  - rotation stops when reduced motion is set.
- `Accordion` and `Tabs` follow the mockup's ARIA patterns (`data-accordion`, `data-tabs` in `app.js`): arrow keys move between tabs, and Home and End jump to the ends.
- `Pagination({ page, pages, makeHref })` renders links. Its "Showing x–y of n" text is a `role="status"` element with `tabIndex=-1`, which receives focus after navigation.

- [ ] **Step 1: Write the failing unit tests**
  - Status chip label and class per status: `OPEN` → `bg-status-open/10 text-status-open` "Open".
  - `ResourceCard` shows "Sample" when `isSample`.
  - `Counter` server HTML contains `1,852,391`.
  - `Tabs` responds to ArrowRight, Home and End.
  - `Carousel` pause toggles its label.
- [ ] **Step 2: Run the tests to see them fail. Implement. Run them to see them pass.**
- [ ] **Step 3: Commit**

---

### Task 10: Homepage

**Files:**
- Create: `web/app/(site)/page.tsx`, `web/components/site/home/{Hero,QuickActions,Announcements,UpcomingDates,FindYourTest,Journeys,Numbers,Protect,Services,ChairmanQuote,ClientsMarquee}.tsx`
- Test: `web/tests/e2e/public-routes.spec.ts` (created here, extended in Tasks 11–15)

**Data sources:**
- Hero ← `getHeroSlides`
- Announcements ← `getLatestNotices(5)`
- UpcomingDates ← `getSchedule`
- FindYourTest ← `getPublishedTests`
- Numbers ← `getStats`
- ChairmanQuote ← `getLeader("CHAIRMAN")`
- ClientsMarquee ← `getClients`

Everything else is static JSX ported from `mockup/index.html`.

- [ ] **Step 1: Write the failing e2e test**

  ```ts
  test("home renders DB content", async ({ page }) => { await page.goto("/"); await expect(page.getByRole("heading", { level: 1, name: "A fair test opens a door." })).toBeVisible(); await expect(page.getByText("Candidates tested")).toBeVisible(); await expect(page.getByText("Dr Muhammad Imtiaz Haider")).toBeVisible(); });
  test("hero pause control toggles", ...);
  ```

- [ ] **Step 2: Run the test to see it fail. Port the sections. Run it to see it pass.**
- [ ] **Step 3: Compare with the mockup at 375 px and 1440 px**

  1. Run the mockup server (`etc-mockup`, port 5173) next to `npm run dev`.
  2. Screenshot both at 375 px and at 1440 px.
  3. Fix any visible differences.

- [ ] **Step 4: Commit**

---

### Task 11: About, Quality, Institutions and Candidate services

**Files:**
- Create: `web/app/(site)/{about,quality,institutions,candidate-services}/page.tsx`, plus section components under `components/site/<page>/`.
- Modify: `web/tests/e2e/public-routes.spec.ts`

**Content:**
- About's leadership section reads from `getLeaders()`.
- The Institutions clients list reads from `getClients()`.
- Candidate services' schedule table reads from `getSchedule()`.
- Portal links use `PortalLink`.
- All other prose is ported verbatim, keeping the anchor ids used by `NAV`: `#overview`, `#history`, `#mandate`, `#vision`, `#governance`, `#leadership`, `#workflow`, `#item-bank`, `#psychometrics`, `#qa`, `#security`, `#services`, `#process`, `#clients`, `#enquiry`, `#schedule`, `#register`, `#admit-card`, `#results`, `#test-day` and `#accessibility`.
- The Institutions enquiry form markup is rendered by `components/site/forms/EnquiryForm.tsx`. It is a client component taking `action` as a prop; Task 26 supplies the action. Until then, it posts to a stub that returns `{ ok: false, formError: "Not available yet." }`.

- [ ] **Step 1: Write the failing e2e test.** Each page returns 200, has one `h1`, and every `NAV` anchor id exists on its page.
- [ ] **Step 2: Run it to see it fail. Port the pages. Run it to see it pass.**
- [ ] **Step 3: Commit**

---

### Task 12: Test directory and test detail

**Files:**
- Create: `web/app/(site)/tests/page.tsx`, `web/app/(site)/tests/[slug]/page.tsx`, `web/components/site/tests/{TestFilters,TestDetail,UsatCategories,TosTable}.tsx`
- Modify: `web/tests/e2e/public-routes.spec.ts`

**Behaviour:**
- The directory filters by `?category=` and `?level=` using the mockup's chip UI, filtered on the server.
- Detail pages use `generateStaticParams` from the published slugs, with `dynamicParams = true`. An unknown or unpublished slug calls `notFound()`.
- The detail page ports `R.testDetail`:
  - pattern sections, with `items === null` rendered as "As published";
  - syllabus;
  - USAT categories and the TOS `data-table` inside a focusable `.table-wrap` with an sr-only caption;
  - related notices and resources;
  - the fee with `FEE_NOTE`;
  - share and print controls.

- [ ] **Step 1: Write the failing e2e test**

  ```ts
  test("/tests/usat shows the TOS table with Common Core total 45", async ({ page }) => { await page.goto("/tests/usat"); const row = page.getByRole("row", { name: /Common Core total/ }); await expect(row).toContainText("45"); });
  test("/tests/customized shows By agreement", ...);
  test("/tests/unknown is 404", ...);
  ```

- [ ] **Step 2: Run it to see it fail. Implement. Run it to see it pass.**
- [ ] **Step 3: Commit**

---

### Task 13: News list and notice detail

**Files:**
- Create: `web/app/(site)/news/page.tsx`, `web/app/(site)/news/[slug]/page.tsx`, `web/components/site/news/{NoticeFilters,NoticeDetail}.tsx`
- Modify: `web/tests/e2e/public-routes.spec.ts`

**Behaviour:**
- `NoticeFilters` is a GET `<form>` with a type select, a test select, a period select and a search box. It works without JavaScript; with JavaScript it submits on change. It has a "Reset filters" link to `/news`.
- The list shows `NoticeRow`s, `Pagination` (`NEWS_PER_PAGE`) and an `EmptyState` with the mockup copy.
- The detail page shows title, chips, dates, `bodyHtml` (already sanitised on save; rendered with `dangerouslySetInnerHTML`), attachment links to the media `url`, share and print. An unknown slug calls `notFound()`.

- [ ] **Step 1: Write the failing e2e test**

  ```ts
  test("filter by type=result shows only results and keeps URL state", async ({ page }) => { await page.goto("/news?type=result"); for (const chip of await page.getByTestId("status-chip").all()) await expect(chip).toHaveText("Result"); await expect(page.getByLabel("Type")).toHaveValue("result"); });
  test("no matches shows empty state", async ({ page }) => { await page.goto("/news?q=zzzzzz"); await expect(page.getByText(/No notices match/)).toBeVisible(); });
  // Review Focus 4
  test("garbage params render normally", async ({ page }) => { for (const q of ["?page=999","?page=abc","?type=foo","?test=nope&period=7"]) { const r = await page.goto("/news"+q); expect(r!.status()).toBe(200); } });
  test("/news/usat-reg-dec-2026 renders body and attachment", ...);
  ```

- [ ] **Step 2: Run it to see it fail. Implement. Run it to see it pass.**
- [ ] **Step 3: Commit**

---

### Task 14: Resources, FAQs and Contact

**Files:**
- Create:
  - `web/app/(site)/{resources,faqs,contact}/page.tsx`;
  - `web/components/site/resources/ResourceFilters.tsx`;
  - `web/components/site/faqs/FaqBrowser.tsx` (client, uses `searchFaqs`);
  - `web/components/site/forms/ContactForm.tsx`, which, like `EnquiryForm`, takes `action` as a prop with the stub until Task 26.
- Modify: `web/tests/e2e/public-routes.spec.ts`

**Behaviour:**
- Resources mirrors News: a GET form, `RESOURCES_PER_PAGE` and an empty state. Cards link to the PDF `url` with `download`, and show the size and the "Sample" chip.
- The FAQ browser has live search and category tabs. It uses the accordion, announces the result count in `role="status"`, and shows an empty state.
- The Contact page shows the support routes and office details from `getSettings()`, plus the form.

- [ ] **Step 1: Write the failing e2e test**
  - `/resources?type=policy` shows 3 cards;
  - typing "admit card" in the FAQ search leaves only matching items, and the status reads "2 questions" (or the actual count from the seed);
  - FAQ search "zzzz" shows the empty state;
  - `/contact` shows the helpline from settings.
- [ ] **Step 2: Run it to see it fail. Implement. Run it to see it pass.**
- [ ] **Step 3: Commit**

---

### Task 15: SEO, sitemap and robots, plus the link and accessibility sweep

**Files:**
- Create: `web/app/sitemap.ts`, `web/app/robots.ts`, `web/lib/seo.ts`
- Modify: `metadata` / `generateMetadata` on every page
- Test: `web/tests/e2e/seo.spec.ts`, `web/tests/e2e/a11y-public.spec.ts`, `web/tests/e2e/links.spec.ts`

**Interfaces:**
- `pageMetadata({ title, description, path, image? }): Metadata`:
  - the title template is `"%s | Education Testing Council"`;
  - canonical is `NEXT_PUBLIC_SITE_URL + path`;
  - Open Graph uses the image or the first hero image.
- Test and notice pages use `seoTitle ?? name/title` and `seoDescription ?? short/summary`.
- `robots()` returns `{ rules: { userAgent: "*", disallow: "/" } }` unless `NEXT_PUBLIC_SITE_ENV === "production"`. In production it disallows `/admin`.
- When the environment isn't production, the layout also sets `<meta name="robots" content="noindex">`.
- The sitemap lists the 11 static routes plus every published test and notice. `lastModified` is `updatedAt`.

- [ ] **Step 1: Write the failing e2e tests**
  - `/sitemap.xml` contains `/tests/usat` and `/news/usat-reg-dec-2026`.
  - With `NEXT_PUBLIC_SITE_ENV=staging`, `/robots.txt` contains `Disallow: /`.
  - Every public template has zero axe violations of serious or critical impact, at 375 and 1280 widths:

    ```ts
    for (const path of ["/","/about","/tests","/tests/usat","/candidate-services","/institutions","/quality","/news","/news/usat-reg-dec-2026","/resources","/faqs","/contact","/nope"]) { … new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa"]).analyze() … }
    ```

  - The link crawl follows every internal `<a href>` reachable from `/` (one level deep across all 13 templates) and expects no 404. This is the port of the root `tests/links.test.mjs`.
- [ ] **Step 2: Run them to see them fail. Implement. Run them to see them pass.**
- [ ] **Step 3: Commit, then ask the user to review milestone 2 in the browser before starting milestone 3**

---

## Milestone 3: Admin panel

### Task 16: Admin UI kit

**Files:**
- Create in `web/components/admin/`:
  - `DataTable.tsx` (server-friendly: search box, filter selects, sortable headers via URL params `?q=&sort=&dir=&page=`, row actions menu, empty state);
  - `PageHeader.tsx`, `EditLayout.tsx` (two-column: `main` and `aside` slots);
  - `SaveBar.tsx` (sticky; shows "Unsaved changes" when dirty; save, cancel);
  - `ConfirmDialog.tsx` (native `<dialog>`; focus on Cancel);
  - `Toast.tsx`, `StatusBadge.tsx`;
  - `fields/{TextField,TextArea,Select,Toggle,DateField,NumberField,SlugField,RichTextField,MediaField,Repeater,FieldError,ErrorSummary}.tsx`;
  - `useUnsavedGuard.ts`.
- Test: `web/tests/unit/admin-kit.test.tsx`

**Interfaces:**
- Every field takes `{ name, label, defaultValue, error?: string, hint?, required? }`. The error is linked via `aria-describedby`.
- `ErrorSummary({ errors: Record<string,string> })` gets focus on render. Each item links to `#field-<name>`.
- `SlugField({ sourceName })` auto-fills `slugify(source)` until the user edits the slug by hand.
- `Repeater<T>({ name, items, render, newItem, min?, max? })` provides add, remove, and move up and down. It serialises as `name.0.field` input names; `formDataToObject(fd: FormData): unknown` in `lib/admin/form-data.ts` rebuilds the nested arrays.
- `RichTextField` uses TipTap (StarterKit limited to the allowed nodes, plus Link). It submits HTML through a hidden input.
- `useUnsavedGuard(dirty: boolean)` adds a `beforeunload` handler, and a click-capture confirm on internal links while the form is dirty.

- [ ] **Step 1: Write the failing unit tests**

  ```ts
  expect(formDataToObject(fd({ "title":"A", "sections.0.name":"X", "sections.1.name":"Y", "published":"on" }))).toEqual({ title:"A", sections:[{name:"X"},{name:"Y"}], published:"on" });
  // ErrorSummary focuses and links to #field-title; SlugField stops auto-filling after manual edit; Repeater move-up reorders.
  ```

- [ ] **Step 2: Run them to see them fail. Implement. Run them to see them pass.**
- [ ] **Step 3: Commit**

---

### Task 17: The action factory, audit log and optimistic locking

**Files:**
- Create: `web/lib/admin/action.ts`, `web/lib/admin/audit.ts`, `web/lib/admin/lock.ts`
- Test: `web/tests/unit/action.test.ts`, `web/tests/integration/lock.test.ts`

**Interfaces:**
- `type ActionResult<T = undefined> = { ok: true; data: T; message?: string } | { ok: false; formError?: string; fieldErrors?: Record<string, string> }`
- `createActionFactory(deps: { getUser(): Promise<SessionUser | null>; audit(e: AuditEntry): Promise<void>; revalidateTag(t: string): void; revalidatePath(p: string): void })`.
  It returns `defineAction`:

  ```ts
  defineAction<S extends z.ZodType, T>(o: {
    permission: Permission; schema: S; entity: string; action: AuditAction; tags: Tag[];
    run(input: z.infer<S>, ctx: { user: SessionUser }): Promise<T>;
    entityId?(data: T, input: z.infer<S>): string; summary?(data: T, input: z.infer<S>): string;
    paths?(data: T, input: z.infer<S>): string[];
  }): (input: unknown) => Promise<ActionResult<T>>
  ```

  `lib/admin/action.ts` also exports `defineAction` bound to the real dependencies.
- `AuditEntry = { userId: number; action: AuditAction; entity: string; entityId?: string; summary: string }`
- `class StaleError extends Error`
- `updateLocked<M>(delegate: { updateMany(args): Promise<{ count: number }> }, id: number, expectedUpdatedAt: string, data: object): Promise<void>`. This runs `updateMany({ where: { id, updatedAt: new Date(expectedUpdatedAt) }, data })` and throws `StaleError` when the count is 0.
- Error mapping inside `defineAction`:

  | Condition | Result |
  |---|---|
  | no user | `formError: "Your session has expired. Sign in again."` |
  | `!can(...)` | `formError: "You don't have permission to do that."` |
  | `ZodError` | `fieldErrors` keyed by `issue.path.join(".")` |
  | Prisma `P2002` | `fieldErrors[<target field>] = "This <field> is already used."` |
  | `StaleError` | `formError: "Someone else saved this item while you were editing. Reload to see their changes."` |
  | Prisma `P2003` / `P2014` on delete | `formError: "This item is still linked to other content."` |
  | anything else | `formError: "Something went wrong. Your changes were not saved."` and `console.error` with the entity only (no input values) |

- [ ] **Step 1: Write the failing unit tests, with fake dependencies**

  ```ts
  test("no session → formError, run not called", ...);
  test("EDITOR on content:delete → permission error", ...);
  test("zod error → fieldErrors['sections.0.name']", ...);
  test("success → audit once with summary, revalidateTag for each tag, revalidatePath for each path", ...);
  test("failure → no audit, no revalidate", ...);
  test("P2002 on slug → fieldErrors.slug === 'This slug is already used.'", ...);
  // Review Focus 3
  test("StaleError → the reload message", ...);
  ```

- [ ] **Step 2: Write the failing integration test for locking**

  Create an E2E FAQ, then call `updateLocked` twice with the same `updatedAt`. The second call throws `StaleError`.

- [ ] **Step 3: Run them to see them fail. Implement. Run them to see them pass.**
- [ ] **Step 4: Commit**

---

### Task 18: Spaces uploads and the media library

**Files:**
- Create:
  - `web/lib/spaces.ts`;
  - `web/app/api/admin/uploads/route.ts`;
  - `web/app/admin/(panel)/media/{page.tsx,actions.ts}`;
  - `web/components/admin/media/{MediaLibrary,MediaPicker,UploadDropzone}.tsx`;
  - `web/lib/admin/media-usage.ts`;
  - `web/scripts/spaces-cors.mjs`;
  - `web/tests/e2e/fixtures/e2e-sample.pdf` (a one-page PDF smaller than 10 KB).
- Modify: `web/next.config.ts`. Add `images.remotePatterns` for `https://sbsi-cdn.sgp1.digitaloceanspaces.com/ETC/**`.
- Test: `web/tests/unit/spaces.test.ts`, `web/tests/integration/media-usage.test.ts`, `web/tests/e2e/admin-media.spec.ts`

**Interfaces:**
- `lib/spaces.ts`:
  - `UPLOAD_RULES = { "application/pdf": { ext: "pdf", max: 15 * 1024 * 1024 }, "image/jpeg": { ext: "jpg", max: 5 * 1024 * 1024 }, "image/png": { ext: "png", max: 5 * 1024 * 1024 }, "image/webp": { ext: "webp", max: 5 * 1024 * 1024 } }`;
  - `checkUpload({ mime, size, filename }): { ok: true } | { ok: false; error: string }`;
  - `buildUploadKey(filename: string, mime: string, now: Date, id: string): string`;
  - `assertEtcUploadKey(key: string): void`. It throws `"Refusing key outside ETC/uploads/"` unless the key matches `^ETC/uploads/\d{4}/\d{2}/[a-z0-9-]+\.(pdf|jpg|png|webp)$`;
  - `presignPut(key, mime): Promise<{ url: string; headers: Record<string,string> }>`. It signs `Content-Type` and `x-amz-acl: public-read` and expires in 300 s;
  - `headObject(key): Promise<{ size: number } | null>`;
  - `publicUrl(key): string`, which is `SPACES_CDN_BASE + "/" + key`.
- `POST /api/admin/uploads` takes `{ filename, mime, size }`.
  - It requires `media:upload` and `checkUpload`.
  - It returns `{ key, url, headers }`.
  - Otherwise it returns 400 `{ error }`, or 401 or 403.
- The actions in `media/actions.ts`:
  - `confirmUpload({ key, mime, size, width?, height?, alt })`:
    - `alt` is required (at least 1 character) for images;
    - it asserts the key and checks `headObject(key).size === size`;
    - it creates the `Media` row and audits `UPLOAD`;
  - `updateMediaAlt({ id, alt })`;
  - `deleteMedia({ id })`:
    - requires `media:delete` and `findMediaUsage`;
    - deletes the object only for `ETC/uploads/` keys. `mockup/` and `local/` keys are never deleted from storage.
- `findMediaUsage(mediaId): Promise<string[]>` returns labels such as `"Test: USAT"`, `"Resource: LAT candidate guide"`, `"Notice attachment: …"`, `"Hero slide: …"` and `"Leader: Chairman"`.
- The UI:
  - `MediaPicker({ name, accept: "image" | "pdf", value?: MediaRef })` opens a dialog. The dialog has a library grid (searchable, newest first) and an `UploadDropzone` that uses XHR PUT so upload progress can be shown. The picker reads the image's width and height before confirming.
  - `MediaLibrary` is the full page: grid or list, an alt-text edit, Delete (admins), and a "Used by" panel.
- Bucket CORS, `scripts/spaces-cors.mjs`:
  - it calls `GetBucketCors` and prints the current rules;
  - it builds a merged config that adds one rule: AllowedOrigins `[http://localhost:3000, <staging origin>, <production origin>]`, AllowedMethods `[PUT]`, AllowedHeaders `[content-type, x-amz-acl]`, MaxAgeSeconds 3000;
  - it prints a diff;
  - it calls `PutBucketCors` only with `--apply`.
  - **The executor runs it without `--apply`, shows the user the diff, and applies it only after the user says yes.**

- [ ] **Step 1: Write the failing unit tests**

  ```ts
  expect(buildUploadKey("USAT Syllabus (E).PDF","application/pdf",new Date("2026-10-22T10:00:00Z"),"3f2a")).toBe("ETC/uploads/2026/10/3f2a-usat-syllabus-e.pdf");
  expect(buildUploadKey("داخلہ.pdf","application/pdf",d,"ab")).toBe("ETC/uploads/2026/10/ab-file.pdf");
  expect(() => assertEtcUploadKey("ETC/mockup/x.jpg")).toThrow("Refusing key outside ETC/uploads/");
  expect(() => assertEtcUploadKey("ETC/uploads/2026/10/../../x.pdf")).toThrow();
  expect(checkUpload({ mime:"application/pdf", size: 15*1024*1024+1, filename:"a.pdf" })).toEqual({ ok:false, error:"PDFs must be 15 MB or smaller." });
  expect(checkUpload({ mime:"image/png", size: 5*1024*1024+1, filename:"a.png" })).toEqual({ ok:false, error:"Images must be 5 MB or smaller." });
  expect(checkUpload({ mime:"image/svg+xml", size: 10, filename:"a.svg" })).toEqual({ ok:false, error:"Only PDF, JPG, PNG or WebP files can be uploaded." });
  expect(checkUpload({ mime:"application/pdf", size: 10, filename:"a.exe" }).ok).toBe(false);
  ```

- [ ] **Step 2: Write the failing media-usage integration test (Review Focus 2)**

  - Create an E2E media item and attach it to an E2E resource.
  - Expect `findMediaUsage` to return `["Resource: E2E …"]`.
  - Expect `deleteMedia` to return `formError: "This file is used by Resource: E2E …. Remove it there first."`.

- [ ] **Step 3: Run them to see them fail. Implement `lib/spaces.ts`, the route, the actions, the components and the CORS script. Run them to see them pass.**

- [ ] **Step 4: Run the CORS dry-run and get the user's OK**

  Run: `node --env-file=../.env.local scripts/spaces-cors.mjs`. Show the user the diff and wait for a yes before running it with `--apply`.

- [ ] **Step 5: Write the e2e test**

  The test uses `test.skip(!process.env.SPACES_KEY)`. An admin uploads `tests/e2e/fixtures/e2e-sample.pdf`; the file appears in the library; then the test deletes it.

- [ ] **Step 6: Commit**

---

### Task 19: Notices CRUD (rich text, sanitising, attachments)

**Files:**
- Create:
  - `web/lib/sanitize.ts`;
  - `web/lib/validation/admin.ts`. This holds the form-side schemas, which extend the content schemas with `updatedAt` for locking and `z.coerce` for form strings;
  - `web/app/admin/(panel)/notices/{page.tsx,new/page.tsx,[id]/page.tsx,actions.ts}`;
  - `web/components/admin/notices/NoticeForm.tsx`.
- Test: `web/tests/unit/sanitize.test.ts`, `web/tests/e2e/admin-notices.spec.ts`

**Interfaces:**
- `sanitizeRichText(html: string): string` uses `sanitize-html` with the allow-list from Global Constraints.
- The actions:
  - `saveNotice(input)` creates when there's no `id`, otherwise calls `updateLocked`. It sanitises `bodyHtml`, replaces the attachments in a transaction, and uses tags `[notices]` and paths `["/news", "/news/<slug>", "/"]`;
  - `setNoticePublished({ id, published })` audits `PUBLISH` or `UNPUBLISH`;
  - `duplicateNotice({ id })` creates a copy with title "Copy of …", slug `<slug>-copy` (then `-copy-2` and so on) and `published: false`;
  - `deleteNotice({ id })` requires `content:delete`.
- The list has columns Title, Type, Test, Status chip, Published (date), Deadline and State (Published or Draft), with filters for type, test, state and search.
- The form:
  - main column: title, slug (`SlugField`), type, test, status, published date, deadline, summary, body (rich text), attachments (a `Repeater` of label plus a PDF `MediaPicker`);
  - aside: Publishing toggle, SEO title and description with character counters (60 and 160), "View on site" once it's published, and the `isSample` toggle.

- [ ] **Step 1: Write the failing sanitise test**

  ```ts
  expect(sanitizeRichText('<p onclick="x">Hi<script>alert(1)</script></p>')).toBe("<p>Hi</p>");
  expect(sanitizeRichText('<a href="javascript:alert(1)">x</a>')).toBe("<a>x</a>");
  expect(sanitizeRichText('<a href="https://hec.gov.pk">HEC</a>')).toBe('<a href="https://hec.gov.pk" rel="noopener noreferrer">HEC</a>');
  expect(sanitizeRichText('<h1>T</h1><img src=x><h3>S</h3>')).toBe("T<h3>S</h3>");
  ```

- [ ] **Step 2: Write the failing e2e test**

  ```ts
  test("admin creates and publishes a notice and it appears on /news", async ({ page }) => { await login(page, ADMIN); await page.goto("/admin/notices/new"); await page.getByLabel("Title").fill("E2E Test notice"); /* type, summary, body */ await page.getByLabel("Published").check(); await page.getByRole("button", { name: "Save" }).click(); await expect(page.getByText("Saved")).toBeVisible(); await page.goto("/news?q=E2E"); await expect(page.getByText("E2E Test notice")).toBeVisible(); });
  test("missing summary shows inline error and summary", ...);
  // Review Focus 5
  test("Urdu title with empty slug shows the slug error and does not save", async ({ page }) => { …fill("داخلہ ٹیسٹ کا اعلان")… await expect(page.getByText("Enter a URL slug using English letters, numbers and hyphens.")).toBeVisible(); });
  test("editor sees no Delete action", ...);
  ```

  The slug message comes from `noticeInput.slug`: `z.string().regex(SLUG_RE, "Enter a URL slug using English letters, numbers and hyphens.")`.

- [ ] **Step 3: Run them to see them fail. Implement. Run them to see them pass. Clean up the E2E rows in `afterAll`.**
- [ ] **Step 4: Commit**

---

### Task 20: Tests CRUD (sections, syllabus, USAT categories, TOS grid)

**Files:**
- Create:
  - `web/app/admin/(panel)/tests/{page.tsx,new/page.tsx,[id]/page.tsx,actions.ts}`;
  - `web/components/admin/tests/{TestForm,TosGrid,CategoriesEditor}.tsx`.
- Test: `web/tests/unit/tos.test.ts`, `web/tests/e2e/admin-tests.spec.ts`

**Interfaces:**
- `TosGrid({ name, value: { levels: string[]; rows: { area: string; v: number[]; total: number; subtotal?: boolean }[] } })`:
  - an editable table with a number input per cell;
  - each row total is computed live and is read-only;
  - you can add or remove rows and toggle subtotal;
  - the levels header is editable.
- `computeTosTotals(tos): tos` lives in `lib/admin/tos.ts`. It sets each row's `total` to the sum of `v`. It is called on save, so totals are never trusted from the client.
- The actions:
  - `saveTest` replaces the sections in a transaction, with tags `[tests, schedule, notices, resources]` and paths `["/tests", "/tests/<slug>", "/"]`;
  - `setTestPublished`, `deleteTest` (admin only; blocked with the P2003 message when notices, resources or schedule entries reference it), and `reorderTests({ ids: number[] })`.
- The form groups fields into sections: Overview, Eligibility & measures, Pattern (sections repeater), Syllabus (string repeater), Streams (categories editor, shown when there are categories or the user clicks "Add streams"), Table of specifications, Fee (number, or a "By agreement" checkbox that sets `null`), Image, and SEO.

- [ ] **Step 1: Write the failing unit test**

  ```ts
  expect(computeTosTotals({ levels:["K","U"], rows:[{ area:"A", v:[1,2], total:99 }] }).rows[0].total).toBe(3);
  ```

- [ ] **Step 2: Write the failing e2e test**

  In the admin, edit USAT's first TOS cell from 1 to 2 and save. `/tests/usat` then shows the row total as 6. Restore the value in `afterAll`.

- [ ] **Step 3: Run them to see them fail. Implement. Run them to see them pass.**
- [ ] **Step 4: Commit**

---

### Task 21: Resources and FAQs CRUD

**Files:**
- Create: `web/app/admin/(panel)/{resources,faqs}/{page.tsx,new/page.tsx,[id]/page.tsx,actions.ts}`, `web/components/admin/{resources/ResourceForm,faqs/FaqForm}.tsx`
- Test: `web/tests/e2e/admin-resources-faqs.spec.ts`

**Interfaces:**
- `saveResource` requires a PDF media item. It has tags `[resources, tests]` and paths `["/resources", "/tests/<test slug>"]`.
- `saveFaq` and `reorderFaqs({ category, ids })` have tags `[faqs]` and paths `["/faqs"]`.
- Publish and unpublish work as for notices. Deleting is admin only.
- The FAQ list is grouped by category, with up and down reordering.

- [ ] **Step 1: Write the failing e2e test**
  - An editor creates an E2E FAQ in Fees. It shows on `/faqs` under the Fees tab.
  - The editor unpublishes it, and it disappears.
  - An "Upload resource" quick flow with an existing seed PDF appears on `/resources?q=E2E`.
- [ ] **Step 2: Run it to see it fail. Implement. Run it to see it pass.**
- [ ] **Step 3: Commit**

---

### Task 22: Homepage content (hero, schedule, stats, clients)

**Files:**
- Create: `web/app/admin/(panel)/{hero,schedule,stats,clients}/{page.tsx,actions.ts}` and the matching `[id]` and `new` pages where a record has more than three fields (hero, schedule).
- Test: `web/tests/e2e/admin-home.spec.ts`

**Interfaces:**
- Stats and Clients are inline-editable list editors on one page each, with add, edit, delete and drag or up-down reorder. They have one `saveStats({ items, updatedAt })` / `saveClients({ items })` bulk action each, run in a transaction, with tags `[stats]` and `[clients]` and path `["/"]`, plus `/institutions` for clients.
- Hero has a full form: eyebrow, title, body, image (`MediaPicker` image), two CTAs, order and published. Saving with zero published slides is refused with "Keep at least one hero slide published."
- Schedule has a form with test, session, registration closes, test date, status and published. The validation `testDate >= regCloses` gives the error "Test date must be on or after the registration closing date." Tags are `[schedule]`; paths are `["/", "/candidate-services"]`.

- [ ] **Step 1: Write the failing e2e tests**
  - Change the stat "Cities" from 40 to 41; the homepage shows 41. Restore it afterwards.
  - Unpublishing the last published hero slide shows the refusal message.
  - A schedule entry with the test date before the closing date shows the date error.
- [ ] **Step 2: Run them to see them fail. Implement. Run them to see them pass.**
- [ ] **Step 3: Commit**

---

### Task 23: Leaders and Settings

**Files:**
- Create: `web/app/admin/(panel)/{leaders,settings}/{page.tsx,actions.ts}`, plus `leaders/[role]/page.tsx`
- Test: `web/tests/e2e/admin-leaders-settings.spec.ts`

**Interfaces:**
- `saveLeader` takes name, title, photo (image `MediaPicker`), quote and `messageHtml` (rich text, sanitised). It has tags `[leaders]` and paths `["/", "/about"]`. There is no create or delete; the three roles are fixed.
- `saveSettings(input: settingsInput)` requires `settings:manage` (admin). It upserts each key, with tags `[settings]`, and calls `revalidatePath("/", "layout")`. Validation:
  - the portal URL fields must be `https://` URLs, or start with `#` during staging;
  - the notification emails must be valid email addresses.
- The Settings page has these groups: Contact details, Official portals and Notifications.

- [ ] **Step 1: Write the failing e2e tests**
  - An admin changes the helpline to "E2E 051-0000000"; the footer and `/contact` show it. Restore it afterwards.
  - An editor visiting `/admin/settings` gets the 403 page "You don't have access to this page."
  - Editing the Chairman's quote shows on the homepage.
- [ ] **Step 2: Run them to see them fail. Implement. Run them to see them pass.**
- [ ] **Step 3: Commit**

---

### Task 24: Inbox (enquiries and messages) with CSV export

**Files:**
- Create:
  - `web/lib/admin/csv.ts`;
  - `web/app/admin/(panel)/{enquiries,messages}/{page.tsx,[id]/page.tsx,actions.ts,export/route.ts}`.
- Test: `web/tests/unit/csv.test.ts`, `web/tests/e2e/admin-inbox.spec.ts`

**Interfaces:**
- `toCsv(rows: Record<string, unknown>[], columns: { key: string; header: string }[]): string`:
  - begins with a UTF-8 BOM;
  - uses CRLF line endings;
  - quotes every field and doubles inner quotes;
  - formats dates as `YYYY-MM-DD HH:mm` in PKT;
  - prefixes a cell with `'` when it starts with `=`, `+`, `-`, `@`, a tab or a carriage return.
- `setInboxStatus({ kind: "enquiry" | "message", id, status })` requires `inbox:work` and audits `STATUS`.
- The list screens show status chips (New, In progress, Closed), a filter by status and search. The new count feeds the sidebar badge, from `getInboxCounts()` in `lib/admin/inbox.ts`.
- The detail view shows all fields, a `mailto:` "Reply by email" link with subject `Re: <subject or service>`, and the status buttons.
- `GET …/export` requires `inbox:work`. It respects the current filters, returns `text/csv` with `Content-Disposition: attachment; filename="enquiries-YYYY-MM-DD.csv"`, and never includes `ipHash`.

- [ ] **Step 1: Write the failing unit tests**

  ```ts
  const csv = toCsv([{ a: 'He said "hi"', b: "=HYPERLINK(\"http://x\")", c: "-5" }], [{key:"a",header:"A"},{key:"b",header:"B"},{key:"c",header:"C"}]);
  expect(csv.startsWith("﻿\"A\",\"B\",\"C\"\r\n")).toBe(true);
  expect(csv).toContain('"He said ""hi"""');
  // Review Focus 1
  expect(csv).toContain(`"'=HYPERLINK(""http://x"")"`);
  expect(csv).toContain(`"'-5"`);
  ```

- [ ] **Step 2: Write the failing e2e test**

  Insert an E2E enquiry directly with Prisma. It appears in `/admin/enquiries` with "New". Setting it to In progress updates the chip. The export download contains its organisation name.

- [ ] **Step 3: Run them to see them fail. Implement. Run them to see them pass.**
- [ ] **Step 4: Commit**

---

### Task 25: Users, audit log and dashboard

**Files:**
- Create:
  - `web/app/admin/(panel)/users/{page.tsx,new/page.tsx,[id]/page.tsx,actions.ts}`;
  - `web/app/admin/(panel)/audit/page.tsx`;
  - `web/app/admin/(panel)/page.tsx` (the real dashboard);
  - `web/lib/admin/dashboard.ts`.
- Test: `web/tests/e2e/admin-users-dashboard.spec.ts`

**Interfaces:**
- `createUser({ name, email, role, password })` and `updateUser({ id, name, role, active, password? })` require `users:manage`.
  - Passwords must be at least `PASSWORD_MIN` characters: "Use at least 12 characters."
  - You can't deactivate or demote yourself: "You can't remove your own admin access."
  - The last active `ADMIN` can't be demoted or deactivated: "At least one active admin is required."
- The audit page requires `audit:read`. It is paged at 50 per page and filters by user, entity and action.
- `getDashboard(): Promise<{ counts: Record<entity, { published: number; draft: number }>; inbox: { enquiries: number; messages: number }; closingSoon: NoticeRow[]; recent: AuditLog[] }>`:
  - "closing soon" means a deadline within 14 days of `todayInKarachi()`;
  - "recent" is the last 10 audit entries.
- The dashboard UI has a stat card grid, an inbox card with badges, a closing-soon list, a recent activity list, and quick actions: New notice (`/admin/notices/new`), Upload resource (`/admin/resources/new`) and Edit hero (`/admin/hero`).

- [ ] **Step 1: Write the failing e2e tests**
  - An editor visiting `/admin/users` gets 403, and the sidebar has no Users link (spec §7).
  - An admin creates the E2E user `e2e+tmp@etc.test` as an editor; it can sign in. The admin deactivates it, and its next action fails with "Your session has expired. Sign in again."
  - The last-admin guard message appears when the only admin tries to demote themselves.
  - The dashboard shows the published test count of 6.
- [ ] **Step 2: Run them to see them fail. Implement. Run them to see them pass.**
- [ ] **Step 3: Commit, then ask the user to review milestone 3 on localhost before starting milestone 4**

---

## Milestone 4: Forms, mail and hardening

### Task 26: Public form actions, mail, honeypot and rate limits

**Files:**
- Create: `web/lib/validation/forms.ts`, `web/lib/mail.ts`, `web/app/(site)/actions.ts`
- Modify: `EnquiryForm.tsx`, `ContactForm.tsx` (swap the stub actions for the real ones)
- Test: `web/tests/unit/forms.test.ts`, `web/tests/unit/mail.test.ts`, `web/tests/e2e/forms.spec.ts`

**Interfaces:**
- `enquiryInput`:
  - required: organization, contactPerson, email, service, candidates (int > 0), timeline, message;
  - `phone` is optional;
  - `service` must be one of the 6 mockup options; `timeline` one of the 4.
- `contactInput`: name, email, subject (one of the 7 mockup options) and message. Lengths are capped: message 5000, other fields 200.
- The field labels for the messages are the mockup labels: "Organization", "Contact person", "Official email", "Service", "Estimated candidates", "Timeline", "Message", "Full name", "Email" and "Subject".
- `submitEnquiry(prev: FormState, fd: FormData): Promise<FormState>` and `submitContact(...)` work like this:
  1. If the honeypot field `website` is non-empty, return a fake success and store nothing.
  2. `formLimiter.hit("form|" + ip)`. When refused: `formError: "You've sent several messages in the last hour. Please try again later or call the helpline."`
  3. Validate with zod.
  4. Store the row with `ipHash`.
  5. Call `sendNotification`.
  6. Return `{ status: "success" }`.

  `FormState = { status: "idle" | "error" | "success"; fieldErrors?: Record<string,string>; formError?: string; values?: Record<string,string> }`. Values are echoed back on error so nothing typed is lost.
- `sendNotification({ to, subject, text, replyTo }): Promise<"sent" | "skipped" | "failed">`:
  - it returns `"skipped"` (and logs "SMTP not configured; notification skipped") when `SMTP_HOST` is empty;
  - it never throws to the caller;
  - the body text includes the fields but not the IP.
- The recipient comes from the setting `enquiryNotifyEmail` or `contactNotifyEmail`. If that's empty, the send is skipped.
- The forms use `useActionState`. The success panel uses the mockup's `data-success-title` / `data-success-text` copy and gets focus. On error, the `ErrorSummary` gets focus.

- [ ] **Step 1: Write the failing unit tests**

  ```ts
  expect(enquiryInput.safeParse({...valid, candidates:"0"}).error!.issues[0].message).toBe("Enter a number greater than zero.");
  expect(contactInput.safeParse({...valid, email:"bad"}).error!.issues[0].message).toBe("Enter an email address like name@example.com.");
  expect(contactInput.safeParse({...valid, name:""}).error!.issues[0].message).toBe("Full name is required.");
  test("sendNotification without SMTP returns skipped", ...); test("transport error returns failed and does not throw", ...);
  ```

- [ ] **Step 2: Write the failing e2e tests**
  - Submitting the empty enquiry form shows the summary with 7 errors, and focus moves to the summary.
  - A valid submission (organisation "E2E Org") shows the success panel, and the row appears in `/admin/enquiries`. This covers the spec §7 flow.
  - Filling the honeypot gives success but no row.
  - The 6th contact submission in an hour shows the rate-limit message. The test resets the limiter between tests through a test-only route, `POST /api/test/reset-limits`, which exists only when `NEXT_PUBLIC_SITE_ENV !== "production"` **and** `E2E === "1"`.
- [ ] **Step 3: Run them to see them fail. Implement. Run them to see them pass.**
- [ ] **Step 4: Commit**

---

### Task 27: Security headers, CSP, health check and the admin accessibility pass

**Files:**
- Create: `web/lib/csp.ts`, `web/app/api/health/route.ts`
- Modify:
  - `web/middleware.ts`: add the nonce and headers to every route, and run the auth guard for `/admin/**`. Matcher: everything except `_next/static`, `_next/image` and `favicon.ico`.
  - `web/next.config.ts`: `poweredByHeader: false`.
- Test: `web/tests/unit/csp.test.ts`, `web/tests/e2e/security.spec.ts`, `web/tests/e2e/a11y-admin.spec.ts`

**Interfaces:**
- `buildCsp(nonce: string, opts: { dev: boolean }): string` builds:

  ```
  default-src 'self';
  script-src 'self' 'nonce-<n>' 'strict-dynamic'   (+ 'unsafe-eval' in dev);
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://sbsi-cdn.sgp1.digitaloceanspaces.com;
  font-src 'self';
  connect-src 'self' https://sbsi-cdn.sgp1.digitaloceanspaces.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none'
  ```

- `securityHeaders(): Record<string, string>` returns:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`;
  - `X-Content-Type-Options: nosniff`;
  - `Referrer-Policy: strict-origin-when-cross-origin`;
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`;
  - `X-Frame-Options: DENY`.
- The middleware sets `x-nonce` on the request headers, which the root layout reads for any inline script, and sets the CSP on the response.
- `GET /api/health` runs `SELECT 1` with a 2 s timeout. It returns `200 { ok: true, db: "up", version }` or `503 { ok: false, db: "down" }`, with `Cache-Control: no-store`.

- [ ] **Step 1: Write the failing unit tests**

  ```ts
  expect(buildCsp("abc",{dev:false})).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
  expect(buildCsp("abc",{dev:false})).not.toContain("unsafe-eval");
  expect(buildCsp("abc",{dev:false})).toContain("frame-ancestors 'none'");
  ```

- [ ] **Step 2: Write the failing e2e tests**
  - Both `/` and `/admin/login` responses carry the CSP and all five headers.
  - The homepage has no CSP violations in the console. This is the check that the carousel, mega-menu and TipTap still work under the CSP.
  - `/api/health` returns 200 `{ ok: true }`.
  - axe finds zero serious or critical violations on `/admin/login`, the dashboard, the notices list, the notice edit page, the media library and the enquiry detail page.
- [ ] **Step 3: Run them to see them fail. Implement. Run them to see them pass.**
- [ ] **Step 4: Run the full suite**

  Run: `cd web && npm run typecheck && npm run lint && npm test && npm run test:int && npm run e2e`. Then `cd .. && npm test` for the 39 mockup tests.
  Expected: everything passes.

- [ ] **Step 5: Commit, then ask the user to review milestone 4**

---

## Milestone 5: Staging on Ploi

### Task 28: Deployment files, smoke test and handover

**Files:**
- Create:
  - `web/ecosystem.config.cjs`:
    - `{ apps: [{ name: "etc-web", cwd: __dirname, script: "node_modules/next/dist/bin/next", args: "start -p 3000", instances: 1, exec_mode: "fork", max_memory_restart: "600M", env: { NODE_ENV: "production" } }] }`;
  - `deploy/ploi-deploy.sh`, which is the spec §8 script, plus `cd {SITE_DIRECTORY}` and `set -e`, with PM2 `startOrReload` on the first deploy;
  - `web/scripts/smoke.mjs`;
  - `docs/handover/staging.md`.
- Test: `web/tests/unit/smoke.test.ts`

**Interfaces:**
- `smoke(baseUrl: string, fetchImpl = fetch): Promise<{ path: string; status: number; ok: boolean }[]>`:
  - it checks `/api/health` (200 and `ok`), `/`, `/tests/usat`, `/news`, `/resources`, `/faqs` and `/contact` (200 each);
  - `/nope` must be 404;
  - `/robots.txt` must contain `Disallow: /` on staging;
  - `/admin` must redirect to `/admin/login`;
  - the CLI form, `node scripts/smoke.mjs https://<staging>`, exits 1 on any failure.
- The handover doc `docs/handover/staging.md` covers these steps in order. The user does them in Ploi, with me guiding:
  1. Create the server (DigitalOcean sgp1, Node 22).
  2. Create the site with root `web`.
  3. Connect the repository with branch `staging`.
  4. Paste the environment variables: the full list from `.env.example`, with `DATABASE_URL` pointing at `ETCStaging`, `NEXT_PUBLIC_SITE_ENV=staging`, a new `AUTH_SECRET` from `openssl rand -base64 32`, and a new `IP_HASH_SALT`.
  5. Set the deploy script.
  6. Set the Nginx proxy to `127.0.0.1:3000`, with `client_max_body_size 1m` (uploads go straight to Spaces).
  7. Issue the Let's Encrypt certificate.
  8. Add the DigitalOcean database trusted source: the droplet's IP.
  9. Add the staging origin to the Spaces CORS rule (Task 18 script, with the user's OK).
  10. Run the first deploy, then `npx prisma db seed`.
  11. Run the smoke test.
  12. Provide the SMTP credentials when available.
  13. Rotate the database and Spaces keys before production.

  It also includes the production checklist: branch `main`, database `ETC`, `NEXT_PUBLIC_SITE_ENV=production` and the go-live DNS.

- [ ] **Step 1: Write the failing unit test with a fake fetch**

  ```ts
  test("smoke flags a 500 and passes a healthy site", async () => { const r = await smoke("https://x", fakeFetch({ "/news": 500 })); expect(r.find(x=>x.path==="/news")!.ok).toBe(false); });
  test("staging robots must disallow", ...);
  ```

- [ ] **Step 2: Run it to see it fail. Implement `smoke.mjs`. Run it to see it pass.**
- [ ] **Step 3: Write `ecosystem.config.cjs`, `deploy/ploi-deploy.sh` and the handover doc. Check the script locally with `bash -n deploy/ploi-deploy.sh`.**
- [ ] **Step 4: Rehearse production mode locally**

  Run: `cd web && npm run build && npx pm2 start ecosystem.config.cjs && node scripts/smoke.mjs http://localhost:3000 && npx pm2 delete etc-web`
  Expected: every smoke check passes.

- [ ] **Step 5: Commit, then guide the user through Ploi**

  Walk through `docs/handover/staging.md` with the user. This needs their Ploi access, a staging subdomain and the SMTP details. Once staging is live, run `node scripts/smoke.mjs https://<staging>` against it.
