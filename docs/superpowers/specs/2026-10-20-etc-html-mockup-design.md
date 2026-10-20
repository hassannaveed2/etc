# ETC Website — Phase 1 HTML Mockup: Design Spec

- **Date:** 2026-10-20
- **Status:** Approved in conversation; pending written-spec review
- **Sources:** *ETC Institutional Profile 2026* (PDF, 30 pp.), *ETC Website Scope & Technology Presentation* (12 slides), reference site https://www.ets.org/

## 1. Purpose and success criteria

Build a clickable, multi-page **HTML mockup of the entire public frontend** of the Education Testing Council (ETC) website, for ETC approval before the production build in **Next.js**.

The mockup succeeds when:

1. Every page template in the agreed sitemap (Section 3) exists, is linked from navigation, and renders without console errors.
2. It reads clearly as an official HEC/ETC (Government of Pakistan) site, using the real ETC and HEC crests.
3. It is responsive from 360 px to 1440 px+, and meets WCAG 2.1 AA for contrast, keyboard navigation, focus visibility and form labelling.
4. Its markup and Tailwind classes can be lifted directly into Next.js components, and its test data object maps one-to-one onto the future CMS "Test profile" model.
5. All images are hosted on DigitalOcean Spaces under `ETC/`.

### Out of scope (from slide 12)

These are linked to, never rebuilt: registration, payments, admit-card generation, result processing, CBT/exam delivery, AI proctoring and biometrics, legacy API integration, mobile apps, full Urdu localization, and digital marketing. The database is **not** used in this phase.

## 2. Audiences and journeys (slide 2)

- **Candidate journey:** find a test → review eligibility and syllabus → see current notices → proceed to the official ETC/HEC portal.
- **Institutional journey:** understand ETC capabilities → review services and the quality approach → submit an enquiry.
- **Global quick links**, shown on every page: Registration · Roll Number Slip · Results · Help & FAQs. Portal URLs are placeholders (`#portal-*`) labelled "Official ETC portal".

## 3. Sitemap and page templates

| # | File | Template | Key content |
|---|------|----------|-------------|
| 1 | `index.html` | Home | See §3.1 |
| 2 | `about.html` | About ETC | Overview, journey timeline (2017 → 2022 → today), legal mandate (SC 31 Aug 2018, Paras 8/15), vision and mission, 8 core values, values in practice, Board of Governors table, 5 functional groups, 3 core departments, leadership messages (Chairman, ED HEC, CEO), strategic roadmap |
| 3 | `tests.html` | Tests directory | Cards for LAT, LAW-GAT, HAT-General, HAAT-Subject, USAT and Customized; filter by purpose (Admissions / Licensing / Scholarships / Postgraduate) and level; comparison table (who, purpose, fee, frequency) |
| 4 | `test.html?test={lat\|law-gat\|hat\|haat\|usat\|customized}` | Test detail (one template) | Sticky in-page nav: Overview/purpose · Eligibility and target candidates · Test pattern and syllabus · Fees and official notices · Schedule and preparation PDFs · Registration/results links. USAT adds 6 category tabs, the Part I/II structure, and the Common Core Table of Specifications |
| 5 | `candidate-services.html` | Candidate Services | Register / Admit Card / Results / Schedule cards; upcoming-test schedule table; instructions; candidate rights and responsibilities (§18); unfair-means policy; accessibility and special accommodations; test-day journey (7 steps); an "integration boundary" notice |
| 6 | `institutions.html` | Institutional Solutions | 6 assessment services; types of tests (MCQ, descriptive, skill, physical, psychological); 5-step customized engagement; client and partner list by sector; **enquiry form** (organization, contact person, email, phone, service category, estimated candidates, timeline, message) |
| 7 | `quality.html` | Quality & Methods | Interactive 13-step workflow stepper; Bloom's taxonomy; item bank (12 subject banks, bar chart); pilot vs post-hoc analysis; reliability and validity (public-facing summary); 5 QC committees; 4-way question review; 3-tier monitoring; test security; ISO plans. No sensitive methods |
| 8 | `news.html` | News & Notices list | Filters: category (Admission, Schedule, Result, Recruitment, General), related test, date; status chips; pagination |
| 9 | `notice.html` | Notice detail | Title, type, published date, deadline, status, body, attachments (PDF), related notices, share/print |
| 10 | `resources.html` | Resources | Search box; filters by test and type (Syllabus, Sample paper, Guide, Policy); PDF cards with size and date |
| 11 | `faqs.html` | Help & FAQs | Search; category tabs; accordion |
| 12 | `contact.html` | Contact & Support | Contact form; support routes (helpline, email, call centre); office information (HEC, Islamabad); map placeholder |
| 13 | `404.html` | Not found | Search and key links |

### 3.1 Homepage modules (slide 4 order, ETS-inspired presentation)

1. **Hero:** full-bleed documentary photo with a deep-green overlay, a gold eyebrow line ("Higher Education Commission · Pakistan"), a large serif headline, and *Find a Test* / *About ETC* buttons. A 3-slide carousel (pause control, keyboard accessible).
2. **Candidate quick actions:** 4 cards overlapping the hero's bottom edge.
3. **Latest announcements:** 4–5 notices with date, type and status chip, plus a "View all notices" link.
4. **Tests directory:** 6 test cards (name, full name, audience, frequency, fee).
5. **Two journeys:** candidate and institution split panel.
6. **ETC in numbers:** animated counters (1,852,391 candidates; 261 projects; 230,685 items; 103 centres; 40 cities; 530 experts).
7. **"How we protect every result":** dark-green story section with 3 pillars (Built to a blueprint / Tested before it counts / Checked after every test) and a link to Quality & Methods.
8. **Institutional services:** 6 services, plus a CTA to the enquiry form.
9. **Leadership quote:** Chairman's quote on a cream band, with a photo placeholder.
10. **Clients and partners:** text-only names in a scrolling row (no invented logos).
11. **Footer.**

### 3.2 Global chrome

- **Utility bar:** "An HEC initiative", helpline placeholder, accessibility link.
- **Header:** ETC crest + HEC crest, wordmark, mega-menu with 8 sections (About, Tests & Assessments, Candidate Services, Institutional Solutions, Quality & Methods, News & Notices, Resources, Contact), and a search icon. Mobile menu is an off-canvas drawer.
- **Quick-links bar:** the 4 global links.
- **Footer:** crest, short mandate statement, sitemap columns, contact placeholders, policies (Privacy, Terms, Accessibility, Unfair Means), copyright, tagline.
- **Breadcrumbs** and a **page hero band** on all inner pages.

## 4. Visual system

| Token | Value | Use |
|-------|-------|-----|
| `green-950` | `#0B231A` | Darkest bands |
| `green-900` | `#0F2E22` | Story sections, footer |
| `green-700` | `#1F5E45` | Primary brand, headings, buttons |
| `green-500` | `#2E7D5B` | Table headers, hover |
| `gold-500` | `#B8913A` | Accent rules, buttons on dark, large accents (not small text) |
| `gold-600` | `#7E6224` | Eyebrows and small gold text (AA on white, mint, cream, gold-100) |
| `focus` | `#8A6A24` on light, `#D9BE7C` on dark | Focus ring (≥ 3:1) |
| `gold-300` | `#D9BE7C` | Accent on dark backgrounds |
| `mint-50` | `#EEF5F0` | Tiles and surfaces |
| `cream-50` | `#FAF6EA` | Alternate tiles, quote band |
| `ink` | `#12261E` | Body text |
| `muted` | `#56655E` | Secondary text |
| Status | open `#1F7A4D`, closing `#955800`, result `#1D5C96`, closed `#5B6270` (all ≥ 4.5:1 on their chip tint; enforced by tests/contrast.test.mjs) | Notice chips |

- **Typography:** *Source Serif 4* for display and headings, *Inter* for UI and body (Google Fonts). Eyebrows are letter-spaced uppercase gold, matching the PDF's "S E C T I O N" style.
- **Layout:** max width 1280 px; 12-column grid; generous whitespace.
- **Components:** button (primary, secondary, ghost, on-dark), chip, card, stat tile, data table (green header, zebra mint rows), tabs, accordion, stepper, form field with inline error, notice row, breadcrumb, page hero, CTA band, pagination.
- **Motion:** subtle fade-up on scroll, count-up numbers, hero crossfade. Everything is disabled under `prefers-reduced-motion`.
- **Theme:** light mode only.

## 5. Content rules

- All factual text comes from the Institutional Profile, edited for the web.
- Fees are shown as listed (LAT Rs 2,000; LAW-GAT Rs 3,000; HAT Rs 2,000; HAAT Rs 3,000; USAT Rs 2,000) with the note *"As per ETC Institutional Profile 2026; always confirm in the official announcement."*
- Notices, dates and schedules are realistic but marked **Sample**.
- Unknowns stay as visible placeholders: leader names and photos, helpline, email, address details, portal URLs.
- No AI-generated likenesses of real officials, and no fabricated partner logos.

## 6. Imagery and media

- **Generator:** Higgsfield, model `gpt_image_2_5`, documentary photography style: natural light, warm with a slight green grade, Pakistani context, no text or logos in the image.
- **Image list (~14):**
  - Hero ×3: exam hall; students on campus; law graduate.
  - Test cards ×5: LAT, LAW-GAT, HAT, HAAT, USAT.
  - Institutions: university and HR panel.
  - Quality ×2: OMR scanning; sealed papers.
  - Candidate services: candidate at a test centre.
  - About: institutional building.
  - Notice default: notice board or documents.
- Credit cost is checked with `get_cost` before generating.
- **Crests:** the ETC and HEC crests are extracted from the PDF and **upscaled** (not regenerated); backgrounds are cleaned to transparent where feasible.
- **Hosting:** uploaded to Spaces bucket `sbsi-cdn` at `ETC/mockup/images/<name>.<ext>` and `ETC/mockup/brand/…`, `public-read`, with long cache headers. Pages reference `https://sbsi-cdn.sgp1.digitaloceanspaces.com/ETC/mockup/...`. A local copy is kept in `mockup/assets/img/` as a fallback. Writes are restricted to the `ETC/` prefix; the bucket is shared with other projects.

## 7. Project structure

```
ETC-web/
  .gitignore            (ignores .env.local)
  .env.example          (variable names, no values)
  .env.local            (DB + Spaces secrets; never committed)
  docs/superpowers/specs/…
  mockup/
    *.html
    assets/
      js/tailwind.config.js   (design tokens)
      js/data.js              (tests, notices, resources, FAQs)
      js/app.js               (nav, carousel, tabs, accordion, filters, counters, forms)
      js/partials.js          (shared header/footer injection)
      css/site.css            (small additions beyond Tailwind)
      img/                    (local fallback copies)
  scripts/
    upload-to-spaces.mjs      (@aws-sdk/client-s3; reads .env.local; ETC/ prefix only)
  package.json
```

Tailwind is loaded via the Play CDN (`cdn.tailwindcss.com`, pinned version) for the mockup only; the Next.js build will use the compiled Tailwind config with the same tokens.

## 8. Behaviour

- Header and footer are injected from one JS partial so all pages stay consistent. In Next.js this becomes the layout component.
- The test detail, news list, notice detail, resources and FAQs pages render from `data.js`, mirroring the slide-8 CMS models (Test profiles, News and notices, Resources).
- Forms (enquiry, contact) do client-side validation with accessible errors, then show a success state. Nothing is sent anywhere.
- External portal links open in a new tab, with an external-link icon and an sr-only label.

## 9. Verification

- Open every page in the browser pane at 1440 px and 375 px; capture screenshots.
- Zero console errors per page; every nav and footer link resolves to an existing page.
- Keyboard pass on header, mega-menu, carousel, tabs, accordion and forms.
- Contrast spot-checks for text on green, gold and image overlays.
- All image URLs return HTTP 200 from Spaces.

## 10. Security notes

- Credentials live only in `.env.local`, which is git-ignored. `.env.example` documents the names.
- The DB and Spaces keys were shared in chat; **rotate both** after setup.
- The upload script refuses any key outside the `ETC/` prefix.
