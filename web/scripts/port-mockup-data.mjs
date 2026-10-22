// One-off: converts the approved mockup's content (mockup/assets/js/{media,data}.js) into
// prisma/seed-data/mockup.json, in the shape the admin schemas accept.
// Usage (from web/): node scripts/port-mockup-data.mjs
import { readFileSync, writeFileSync, statSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MOCKUP = path.resolve(HERE, "../../mockup");
const OUT = path.resolve(HERE, "../prisma/seed-data/mockup.json");
const CDN = "https://sbsi-cdn.sgp1.digitaloceanspaces.com/ETC/mockup/";

function loadMockup() {
  const noop = () => {};
  const sandbox = { console, document: { addEventListener: noop }, addEventListener: noop };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  for (const f of ["assets/js/media.js", "assets/js/data.js"]) {
    vm.runInContext(readFileSync(path.join(MOCKUP, f), "utf8"), ctx, { filename: f });
  }
  return sandbox.ETC;
}

const upper = (s) => s.toUpperCase().replace(/[^A-Z]+/g, "_").replace(/^_|_$/g, "");
const CATEGORY = { Admissions: "ADMISSIONS", Postgraduate: "POSTGRADUATE", Licensing: "LICENSING", Recruitment: "RECRUITMENT" };
const SECTOR = { federal: "FEDERAL", provincial: "PROVINCIAL", universities: "UNIVERSITY", other: "OTHER" };
const testSlug = (t) => (t && t !== "general" ? t : null);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function main() {
  const ETC = loadMockup();
  const d = ETC.data;

  const media = [];
  for (const [name, m] of Object.entries(ETC.media)) {
    if (m.file.startsWith("brand/")) continue; // crests are served locally from public/brand
    const local = path.join(MOCKUP, "assets/img", m.file);
    const meta = await sharp(local).metadata();
    media.push({
      ref: name,
      key: `mockup/images/${m.file}`,
      url: `${CDN}images/${m.file}`,
      mime: "image/jpeg",
      size: statSync(local).size,
      width: meta.width,
      height: meta.height,
      alt: m.alt,
    });
  }

  const tests = d.tests.map((t, i) => ({
    slug: t.slug,
    code: t.code,
    name: t.name,
    short: t.short,
    category: CATEGORY[t.category],
    level: t.level,
    audience: t.audience,
    purpose: t.purpose,
    eligibility: t.eligibility,
    measures: t.measures,
    frequency: t.frequency,
    frequencyNote: t.frequencyNote,
    fee: t.fee,
    resultsUse: t.resultsUse,
    patternNote: t.pattern.note,
    reliability: t.reliability,
    syllabus: t.syllabus,
    categories: t.categories ?? null,
    tos: t.tos ?? null,
    sortOrder: i,
    published: true,
    seoTitle: null,
    seoDescription: null,
    sections: t.pattern.sections.map((s) => ({ name: s.name, items: s.items == null ? null : String(s.items), detail: s.detail })),
    imageRef: t.image,
  }));

  const notices = d.notices.map((n) => ({
    slug: n.id.replace(/^n-/, ""),
    title: n.title,
    type: upper(n.type),
    publishedAt: n.published,
    deadline: n.deadline ?? null,
    status: upper(n.status),
    summary: n.summary,
    bodyHtml: n.body.map((p) => `<p>${esc(p)}</p>`).join(""),
    published: true,
    isSample: true,
    seoTitle: null,
    seoDescription: null,
    attachments: n.attachments.map((a) => ({ label: a.label })),
    testSlug: testSlug(n.test),
  }));

  const resources = d.resources.map((r) => ({
    title: r.title,
    type: upper(r.type),
    date: r.date,
    published: true,
    isSample: true,
    testSlug: testSlug(r.test),
  }));

  const faqs = d.faqs.map((f, i) => ({ category: upper(f.category), question: f.q, answer: f.a, order: i, published: true }));

  const clients = Object.entries(d.clients).flatMap(([sector, names]) =>
    names.map((name, i) => ({ name, sector: SECTOR[sector], order: i })),
  );

  const stats = d.stats.map((s, i) => ({ value: s.value, label: s.label, note: s.note, order: i }));

  const schedule = d.schedule.map((s) => ({
    session: s.session,
    regCloses: s.regCloses,
    testDate: s.testDate,
    status: upper(s.status),
    published: true,
    testSlug: s.test,
  }));

  const out = { media, tests, notices, resources, faqs, clients, stats, schedule };
  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(Object.entries(out).map(([k, v]) => `${k}: ${v.length}`).join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
