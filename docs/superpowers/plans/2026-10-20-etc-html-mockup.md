# ETC Phase 1 HTML Mockup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A clickable, multi-page HTML + Tailwind mockup of the whole ETC public website, with real crests and Higgsfield imagery hosted on DigitalOcean Spaces under `ETC/`.

**Architecture:** Static HTML pages share one chrome. `partials.js` injects the header, quick links and footer. Content-driven pages (test detail, notices, resources, FAQs) render from one `data.js` object that mirrors the future CMS models. Behaviours are attached via `data-*` attributes in `app.js`. All scripts are classic (non-module), so the pages also open from `file://`.

**Tech Stack:** HTML5, Tailwind Play CDN `3.4.16`, vanilla JS (ES2020), Google Fonts (Source Serif 4, Inter), Node 24 (`node --test`), `@aws-sdk/client-s3`, Higgsfield MCP (`gpt_image_2_5`, `upscale_image`), Python + PyMuPDF/Pillow for crest prep.

**Spec:** `docs/superpowers/specs/2026-10-20-etc-html-mockup-design.md`

## Global Constraints

- Colour tokens exactly as spec §4 (`green-700 #1F5E45`, `gold-500 #B8913A`, `mint-50 #EEF5F0`, `cream-50 #FAF6EA`, `ink #12261E`, …).
- Fonts: Source Serif 4 for headings, Inter for body. Light mode only.
- Spaces bucket `sbsi-cdn`, endpoint `https://sgp1.digitaloceanspaces.com`. Every object key must start with `ETC/mockup/`. Uploads are `public-read` with `Cache-Control: public, max-age=31536000`.
- Public URL base: `https://sbsi-cdn.sgp1.digitaloceanspaces.com/ETC/mockup/`.
- Secrets live only in `.env.local`, which is never committed.
- Fee note, verbatim: *"As per ETC Institutional Profile 2026; always confirm in the official announcement."*
- Sample notices carry a visible **Sample** chip. Unknown names and contacts stay as `[placeholder]` text.
- No AI likenesses of real officials and no invented partner logos. The crests are upscaled, never regenerated.
- Portal links use `href="#portal-registration|admit-card|results"`, `target="_blank"` and `rel="noopener"`, plus an sr-only "(official ETC portal, opens in new tab)".
- Breakpoints: verified at 375 px and 1440 px. Zero console errors.

## Review Focus

1. **Unknown or missing `?test=` slug** on `test.html`: should show a friendly "Test not found" with a link to `tests.html`, not a blank page. → Task 7 test `renderTestDetail returns not-found for unknown slug`.
2. **Spaces image fails to load** (offline or 403): the image should fall back to `assets/img/<file>`. → Task 4 test `mediaUrl/localUrl map every key`, plus the `onerror` swap in `app.js`.
3. **Filters that match nothing** (news, resources, FAQ search): should show an empty-state message, not an empty grid. → Task 9 test `filterNotices returns [] for unmatched` and the empty-state markup check.
4. **Invalid form submit** (enquiry, contact): focus moves to the first error, and errors are linked via `aria-describedby`; no success state appears. → Task 10 test `validateForm flags required and email`.
5. **Broken internal links** after pages are added: every `*.html` href in the pages and in `partials.js` must exist. → Task 11 `links.test.mjs`.

---

## File Structure

```
.env.example / .env.local      Spaces + DB variable names / values
package.json                   scripts: test, upload
scripts/upload-to-spaces.mjs   CLI + exported toEtcKey(), contentTypeFor()
scripts/prep_crests.py         crest crop/cleanup (Python, PyMuPDF + Pillow)
mockup/
  *.html                       one per template (spec §3)
  assets/js/tailwind.config.js window.tailwind.config with tokens
  assets/js/media.js           ETC.media manifest + ETC.mediaUrl(key), ETC.localUrl(key)
  assets/js/data.js            ETC.data { tests, notices, resources, faqs, clients, stats }
  assets/js/lib.js             pure functions (filters, lookups, validation), node-testable
  assets/js/partials.js        header / quick links / footer injection
  assets/js/render.js          DOM renderers for data-driven pages
  assets/js/app.js             behaviours: nav, carousel, tabs, accordion, counters, reveal, forms, img fallback
  assets/css/site.css          the few rules Tailwind can't express
  assets/img/                  local fallback copies (brand/ + photos)
tests/
  helpers/load.mjs             loads classic scripts into a vm with a fake window
  upload.test.mjs  data.test.mjs  lib.test.mjs  links.test.mjs
```

**Script load order on every page:** Tailwind CDN → `tailwind.config.js` → `media.js` → `data.js` → `lib.js` → `partials.js` → `render.js` → `app.js` (all `defer`, except Tailwind and its config, which load in `<head>`).

---

### Task 1: Project scaffold and Spaces uploader

**Files:**
- Create: `package.json`, `.env.example`, `.env.local`, `scripts/upload-to-spaces.mjs`, `tests/upload.test.mjs`

**Interfaces:**
- Produces: `toEtcKey(relPath: string) → string`, which returns `"ETC/mockup/" + relPath` with forward slashes. It throws `Error("Refusing key outside ETC/mockup/")` if the result contains `..`, is absolute, or doesn't start with that prefix.
- Produces: `contentTypeFor(file: string) → string` (png→image/png, jpg/jpeg→image/jpeg, webp→image/webp, svg→image/svg+xml, pdf→application/pdf, default application/octet-stream).
- Produces: CLI `npm run upload -- <localDir> <remoteSubdir>` uploads every file in `localDir` to `ETC/mockup/<remoteSubdir>/<file>` and prints each public URL.

- [ ] **Step 1:** `npm init -y`; set `"type":"module"`, scripts `"test":"node --test tests/"` and `"upload":"node --env-file=.env.local scripts/upload-to-spaces.mjs"`; `npm i @aws-sdk/client-s3`.
- [ ] **Step 2:** Write `.env.example`, with names only: `DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME DB_SSLMODE SPACES_ENDPOINT SPACES_REGION SPACES_BUCKET SPACES_KEY SPACES_SECRET SPACES_CDN_BASE`. Write `.env.local` with the real values; region `sgp1`, CDN base from Global Constraints.
- [ ] **Step 3: Write failing tests** in `tests/upload.test.mjs`:
  - `toEtcKey("images/hero.png") === "ETC/mockup/images/hero.png"`
  - `toEtcKey("brand\\etc.png") === "ETC/mockup/brand/etc.png"`
  - `toEtcKey("../x.png")` throws; `toEtcKey("/abs.png")` throws
  - `contentTypeFor("a.JPG") === "image/jpeg"`, `contentTypeFor("a.pdf") === "application/pdf"`
- [ ] **Step 4:** `npm test`. Expected: FAIL (module not found).
- [ ] **Step 5:** Implement both exports and the CLI in `scripts/upload-to-spaces.mjs`. Run the CLI only when `import.meta.url` matches `process.argv[1]`. Use `PutObjectCommand` with `ACL:"public-read"` and the cache header.
- [ ] **Step 6:** `npm test`. Expected: PASS. Then `git status` must not list `.env.local`.
- [ ] **Step 7:** Commit `chore: scaffold project and Spaces uploader`.

### Task 2: Brand crests

**Files:**
- Create: `scripts/prep_crests.py`, `mockup/assets/img/brand/etc-crest.png`, `mockup/assets/img/brand/hec-crest.png`

**Interfaces:**
- Produces: Spaces objects `ETC/mockup/brand/etc-crest.png` and `ETC/mockup/brand/hec-crest.png`, transparent background, ≥ 1000 px tall.

- [ ] **Step 1:** Upload the two extracted JPEGs (295×320, 295×310) to Higgsfield (`media_upload` → PUT → `media_confirm`). Preflight `upscale_image` with `get_cost:true`, then run it at `2k`.
- [ ] **Step 2:** Download the results. `prep_crests.py <in> <out>` flood-fills near-white (≥ 245 on all channels) connected to the border to alpha 0, then trims to the bounding box.
- [ ] **Step 3:** Verify visually (Read the PNGs on a dark and a light background). Expected: crisp wreath, crescent and lettering; no white halo.
- [ ] **Step 4:** `npm run upload -- mockup/assets/img/brand brand`, then curl both URLs. Expected: HTTP 200, `content-type: image/png`.
- [ ] **Step 5:** Commit `feat: add upscaled ETC and HEC crests`.

### Task 3: Photography

**Files:**
- Create: `mockup/assets/img/*.jpg` (14 files)

**Interfaces:**
- Produces: these keys and filenames, used by Task 4:

| key | file | prompt subject (documentary, natural light, Pakistani context, slight green grade, no text or logos) |
|---|---|---|
| heroExam | hero-exam-hall.jpg (16:9) | Wide calm exam hall, rows of students in shalwar kameez and shirts writing on OMR sheets, invigilator at the back |
| heroCampus | hero-campus.jpg (16:9) | Students walking across a Pakistani university quad, red-brick and white arches, morning |
| heroLaw | hero-law.jpg (16:9) | Young law graduate in black coat and white bands on courthouse steps |
| testLat | test-lat.jpg (4:3) | Intermediate student studying with law books |
| testLawgat | test-lawgat.jpg (4:3) | Law books, gavel, scales of justice on a wooden desk |
| testHat | test-hat.jpg (4:3) | Postgraduate student in a university library |
| testHaat | test-haat.jpg (4:3) | Doctoral researcher in a laboratory |
| testUsat | test-usat.jpg (4:3) | Intermediate students in a classroom preparing for a test |
| institutions | institutions.jpg (16:9) | Panel of university officials in a meeting room reviewing documents |
| qualityOmr | quality-omr.jpg (4:3) | OMR answer sheets feeding through a scanner, close-up |
| qualitySealed | quality-sealed.jpg (4:3) | Sealed, labelled exam-paper boxes in a secure room |
| candidateCentre | candidate-centre.jpg (4:3) | Candidate showing an admit card and CNIC at a test-centre entrance |
| aboutBuilding | about-building.jpg (16:9) | Modern government institutional building in Islamabad with Margalla Hills behind |
| noticeDefault | notice-default.jpg (16:9) | Notice board with pinned printed notices, shallow depth of field |

- [ ] **Step 1:** Preflight cost: `generate_image` with `get_cost:true` for one 16:9 image. Total = per-image × 14 must be ≤ 150 credits; otherwise stop and ask the user.
- [ ] **Step 2:** Generate all 14 (batch tool, ≤ 12 per call), wait with `jobs_wait`, show them with `show_generation_by_ids`.
- [ ] **Step 3:** Review each image. Regenerate any with garbled text, distorted hands or faces, or non-Pakistani context (max 2 retries each).
- [ ] **Step 4:** Download into `mockup/assets/img/` as JPEG, max 2000 px wide, quality 82 (Pillow). Then `npm run upload -- mockup/assets/img images`, excluding `brand/`. Every URL must return 200.
- [ ] **Step 5:** Commit `feat: add generated photography`.

### Task 4: Design system and shared chrome

**Files:**
- Create: `assets/js/tailwind.config.js`, `assets/js/media.js`, `assets/js/partials.js`, `assets/js/app.js` (core), `assets/css/site.css`, `mockup/404.html`, `tests/helpers/load.mjs`, `tests/lib.test.mjs` (media part)

**Interfaces:**
- Produces: `tailwind.config.theme.extend.colors` = `green{950,900,700,500}`, `gold{500,300}`, `mint{50}`, `cream{50}`, `ink`, `muted`, `status{open,closing,result,closed}`; `fontFamily.serif = ['"Source Serif 4"', 'Georgia', 'serif']`, `fontFamily.sans = ['Inter', 'system-ui', 'sans-serif']`.
- Produces: `ETC.media` (keys from Task 3 plus `etcCrest`, `hecCrest` → `{ file, alt }`), `ETC.mediaUrl(key) → CDN url`, `ETC.localUrl(key) → "assets/img/..."`.
- Produces: page contract: `<body data-page="home|about|tests|test|candidate|institutions|quality|news|notice|resources|faqs|contact|404">` with `<div id="site-header"></div>` and `<div id="site-footer"></div>`. `partials.js` fills both on `DOMContentLoaded` and sets `aria-current="page"` on the matching nav item.
- Produces: `<img data-media="heroExam">` gets `src`/`alt` from the manifest, and switches to `localUrl` once on `error`.
- Produces: `app.js` behaviours keyed on `[data-menu-toggle]`, `[data-mega]`, `[data-carousel]`, `[data-tabs]`, `[data-accordion]`, `[data-counter]`, `[data-reveal]`. All honour `prefers-reduced-motion`.
- Produces: `tests/helpers/load.mjs` `loadScripts(paths: string[]) → window`: runs classic scripts in `vm` with a minimal `window`/`document` stub and returns `window` (so `window.ETC` is reachable).

- [ ] **Step 1: Failing test** (`tests/lib.test.mjs`): load `media.js`; for every key, `mediaUrl(k)` starts with the CDN base and `localUrl(k)` starts with `assets/img/`; there are exactly 16 keys.
- [ ] **Step 2:** `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `media.js` and `load.mjs`. `npm test`. Expected: PASS.
- [ ] **Step 4:** Build the chrome in `partials.js`:
  - Utility bar.
  - Header with both crests and an 8-item mega-menu (spec §3.2), using a mobile drawer below `lg`.
  - Gold-ruled quick-links bar.
  - Footer.
  - A skip link to `#main`.
- [ ] **Step 5:** Build `404.html` using the chrome, with a page-hero band and breadcrumb pattern (`<nav aria-label="Breadcrumb">`).
- [ ] **Step 6: Verify in the browser** at 1440 and 375:
  - The mega-menu opens on click, Escape closes it, and focus is trapped in the drawer.
  - The crests load from Spaces.
  - The console is clean.
- [ ] **Step 7:** Commit `feat: design tokens, shared chrome and 404`.

### Task 5: Content data and pure helpers

**Files:**
- Create: `assets/js/data.js`, `assets/js/lib.js`, `tests/data.test.mjs`; Modify: `tests/lib.test.mjs`

**Interfaces:**
- Produces: `ETC.data.tests[]`, matching the slide-8 Test profile: `{ slug, code, name, category, audience, purpose, eligibility, measures, frequency, fee, resultsUse, pattern: {sections:[{name, items, detail}]}, syllabus: string[], categories?: [{code, stream, subjects}], tos?: {...}, image, notices: string[], resources: string[] }`.
  - Slugs: `lat, law-gat, hat, haat, usat, customized`.
  - Fees: `lat 2000, law-gat 3000, hat 2000, haat 3000, usat 2000, customized null`.
- Produces: `ETC.data.notices[]` `{ id, title, type: "Admission"|"Schedule"|"Result"|"Recruitment"|"General", test, published: "YYYY-MM-DD", deadline?, status: "open"|"closing"|"result"|"closed", sample: true, summary, body: string[], attachments: [{label, size}] }`. At least 10 notices.
- Produces: `ETC.data.resources[]` `{ id, title, type: "Syllabus"|"Sample paper"|"Guide"|"Policy", test, date, size }`. At least 12.
- Produces: `ETC.data.faqs[]` `{ q, a, category: "Registration"|"Test day"|"Results"|"Fees"|"Accessibility"|"Institutions" }`. At least 18.
- Produces: `ETC.data.clients{ federal[], provincial[], universities[], other[] }` (from profile §17.2), and `ETC.data.stats[] {value, label, note}` (8 figures from §4.1).
- Produces in `lib.js`: `getTest(slug) → test|null`, `filterNotices(list, {type?, test?, q?}) → notice[]` (newest first), `filterResources(list, {type?, test?, q?})`, `searchFaqs(list, q, category?)`, `formatFee(n) → "Rs. 2,000" | "By agreement"`, `formatDate(iso) → "20 Oct 2026"`, `validateForm(fields: {name, value, required?, type?}[]) → {valid, errors:{[name]:message}}`.

- [ ] **Step 1: Failing tests** (`data.test.mjs`):
  - All 6 slugs present and unique.
  - Each test has the non-empty fields above (customized: `fee === null`).
  - USAT has 6 categories `USAT-E, USAT-M, USAT-CS, USAT-GS, USAT-COM, USAT-A`.
  - Every notice has `sample === true` and a valid `status`.
  - Every `notice.test` and `resource.test` is a valid slug or `"general"`.
  - Stats include `1852391` and `230685`.
- [ ] **Step 2: Failing tests** (`lib.test.mjs`):
  - `getTest("nope") === null`.
  - `filterNotices(n, {type:"Result"})` contains only Result notices, sorted newest first.
  - `filterNotices(n, {q:"zzzz"})` returns `[]`.
  - `formatFee(2000) === "Rs. 2,000"`; `formatFee(null) === "By agreement"`.
  - `formatDate("2026-10-20") === "20 Oct 2026"`.
  - `validateForm([{name:"email", value:"x", required:true, type:"email"}]).errors.email` is truthy; the `required` empty case is flagged; valid input gives `valid === true`.
- [ ] **Step 3:** `npm test`. Expected: FAIL.
- [ ] **Step 4:** Write `data.js` from the profile (§9 products, §9.6 USAT tables, §17.2 clients, §4.1 stats) and `lib.js`.
- [ ] **Step 5:** `npm test`. Expected: PASS.
- [ ] **Step 6:** Commit `feat: content data model and helpers`.

### Task 6: Homepage

**Files:**
- Create: `mockup/index.html`; Modify: `assets/js/render.js` (create), `assets/js/app.js`

**Interfaces:**
- Consumes: `ETC.data.tests`, `notices`, `stats`, `clients`; `filterNotices`, `formatFee`, `formatDate`.
- Produces: `ETC.render.noticeRow(notice) → HTML string` and `ETC.render.testCard(test) → HTML string` (reused in Tasks 7 and 9).

- [ ] **Step 1:** Build the 11 modules in spec §3.1 order:
  - Hero carousel uses `heroExam`/`heroCampus`/`heroLaw`, with prev/next and pause buttons and `aria-live="polite"`.
  - Quick actions overlap the hero (`-mt-16`).
  - Notices show the latest 5.
  - Tests use `testCard` ×6.
  - Counters use `data-counter`.
  - The story section uses `bg-green-900`.
  - The quote band uses `bg-cream-50`.
  - The clients marquee is CSS-only, and pauses on hover and under reduced motion.
- [ ] **Step 2: Verify in the browser** at 1440 and 375:
  - Screenshot each fold.
  - The carousel autoplays and pauses.
  - Counters finish on the exact values.
  - The console is clean.
  - Contrast of the headline over the hero overlay is ≥ 4.5:1 (overlay `green-950/70`).
- [ ] **Step 3:** Commit `feat: homepage`.

### Task 7: About, tests directory and test-detail template

**Files:**
- Create: `mockup/about.html`, `mockup/tests.html`, `mockup/test.html`; Modify: `render.js`, `tests/lib.test.mjs`

**Interfaces:**
- Produces: `ETC.render.testDetail(slug) → { title, html } | { notFound: true }`. `test.html` reads `new URLSearchParams(location.search).get("test")` and sets `document.title` to `"<code> — <name> | ETC"`.

- [ ] **Step 1: Failing test:** `renderTestDetail returns not-found for unknown slug`. The test loads `render.js` too and asserts that `testDetail("x").notFound === true` and that `testDetail("usat").html` includes `"USAT-COM"` and `"Common Core"`.
- [ ] **Step 2:** `npm test`. Expected: FAIL. Implement. Expected: PASS.
- [ ] **Step 3:** Build `test.html`:
  - Page hero with the test image.
  - Sticky in-page nav for the 6 sections (spec §3, row 4).
  - Fee line with the verbatim fee note.
  - Portal buttons.
  - Related notices and resources.
  - The not-found state.
- [ ] **Step 4:** Build `tests.html` (filter chips by purpose, then cards, then a comparison table) and `about.html` (all sections in spec §3 row 2; leadership photo placeholders show initials on a `mint-50` tile with "Photograph to be provided").
- [ ] **Step 5: Verify in the browser:**
  - All 6 `test.html?test=` pages, plus `?test=x`.
  - About anchors.
  - At 375 px, tables scroll horizontally inside a wrapper, not the page.
- [ ] **Step 6:** Commit `feat: about, tests directory and test detail template`.

### Task 8: Candidate services, institutions and quality

**Files:**
- Create: `mockup/candidate-services.html`, `mockup/institutions.html`, `mockup/quality.html`; Modify: `app.js` (form wiring, stepper)

**Interfaces:**
- Consumes: `validateForm`. Produces: `[data-validate]` form behaviour:
  - On submit, run `validateForm`.
  - On failure, render errors under fields (`id="<name>-error"`, linked with `aria-describedby`, `aria-invalid="true"`) and focus the first invalid field.
  - On success, replace the form with a success panel (`role="status"`).

- [ ] **Step 1:** Candidate Services: 4 service cards (portal links), sample schedule table, test-day journey (7 steps), rights and responsibilities, unfair means, accessibility, and an integration-boundary notice.
- [ ] **Step 2:** Institutions: 6 services, test types, 5-step engagement, clients by sector, and an enquiry form with fields `organization, contactPerson, email, phone, service (select of 6), candidates (number), timeline (select), message`. All are required except phone.
- [ ] **Step 3:** Quality:
  - 13-step stepper (`[data-stepper]`: buttons 1–13, with the panel showing stage, what happens, and In-house/External).
  - Bloom's table.
  - Item-bank horizontal bars for the 12 banks (CSS widths ∝ items).
  - Pilot vs post-hoc comparison.
  - Committees, review, monitoring, security, ISO.
- [ ] **Step 4: Verify in the browser:**
  - Submitting the empty enquiry form shows errors and focuses `organization`.
  - A valid submission shows the success panel.
  - The stepper works with the keyboard (arrow keys).
- [ ] **Step 5:** Commit `feat: candidate services, institutions and quality pages`.

### Task 9: News, notice detail and resources

**Files:**
- Create: `mockup/news.html`, `mockup/notice.html`, `mockup/resources.html`; Modify: `render.js`, `app.js`

**Interfaces:**
- Produces: `[data-filter="notices"|"resources"]` controls (selects + search input) that re-render the list via `filterNotices`/`filterResources`, and show an empty state ("No notices match your filters." with a Reset button) when the result is `[]`. Pagination: 6 per page.
- Produces: `notice.html?id=<id>`, which renders the notice detail, or a not-found state.

- [ ] **Step 1:** Build `news.html` (filters for type, test and search; list uses `noticeRow`; pagination), `notice.html` (meta, Sample chip, body, attachments, related notices, print button) and `resources.html` (search plus type and test filters; PDF cards showing size and date).
- [ ] **Step 2: Verify in the browser:**
  - The "Result" filter shows only Result notices.
  - Searching "zzzz" shows the empty state and Reset restores the list.
  - `notice.html?id=bad` shows not-found.
- [ ] **Step 3:** Commit `feat: news, notice detail and resources`.

### Task 10: FAQs and contact

**Files:**
- Create: `mockup/faqs.html`, `mockup/contact.html`

- [ ] **Step 1:** FAQs: search input plus category tabs feeding `searchFaqs`, rendered as a `[data-accordion]` (buttons with `aria-expanded`), with an empty state.
- [ ] **Step 2:** Contact:
  - Support-route cards (helpline `[placeholder]`, email `[placeholder]`, call centre).
  - Office card ("Higher Education Commission, Sector H-9, Islamabad" marked `[to be confirmed]`).
  - Map placeholder tile.
  - `[data-validate]` form with `name, email, subject (select), message`.
- [ ] **Step 3: Verify in the browser:** FAQ search for "admit" filters the list; the contact form errors and success state behave as in Task 8.
- [ ] **Step 4:** Commit `feat: FAQs and contact pages`.

### Task 11: Link integrity and final QA

**Files:**
- Create: `tests/links.test.mjs`

- [ ] **Step 1: Test** `every internal href resolves`: it scans `mockup/*.html` and `assets/js/partials.js` + `render.js` for `href="([^"#?]+\.html)`, and asserts each resolves to a file in `mockup/`. A second assertion checks that every page in spec §3 exists. Run `npm test`. Expected: PASS (fix any failures).
- [ ] **Step 2: Image check:** curl every `mediaUrl` and confirm HTTP 200.
- [ ] **Step 3: Full sweep in the browser** of all 13 pages at 1440 and 375:
  - Screenshots.
  - `read_console_messages onlyErrors` returns none.
  - Keyboard tab-through of the header on 2 pages.
- [ ] **Step 4:** Commit `test: link integrity and final QA`.
