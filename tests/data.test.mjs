import { test } from "node:test";
import assert from "node:assert/strict";
import { loadScripts } from "./helpers/load.mjs";

const { ETC } = loadScripts(["assets/js/data.js"]);
const D = ETC.data;
const SLUGS = ["lat", "law-gat", "hat", "haat", "usat", "customized"];
const REQUIRED = ["slug", "code", "name", "category", "audience", "purpose", "eligibility", "measures", "frequency", "resultsUse", "image"];

test("all six test slugs are present and unique", () => {
  const slugs = D.tests.map((t) => t.slug);
  assert.deepEqual([...slugs].sort(), [...SLUGS].sort());
  assert.equal(new Set(slugs).size, slugs.length);
});

test("each test profile has the CMS fields filled", () => {
  for (const t of D.tests) {
    for (const f of REQUIRED) assert.ok(t[f], `${t.slug}.${f} is empty`);
    assert.ok(Array.isArray(t.pattern.sections) && t.pattern.sections.length > 0, `${t.slug}.pattern.sections`);
    assert.ok(Array.isArray(t.syllabus) && t.syllabus.length > 0, `${t.slug}.syllabus`);
  }
});

test("fees match the Institutional Profile; customized is by agreement", () => {
  const fee = Object.fromEntries(D.tests.map((t) => [t.slug, t.fee]));
  assert.deepEqual(fee, { lat: 2000, "law-gat": 3000, hat: 2000, haat: 3000, usat: 2000, customized: null });
});

test("USAT has the six stream categories", () => {
  const usat = D.tests.find((t) => t.slug === "usat");
  // spread: arrays from the vm realm have a different prototype than this realm's
  assert.deepEqual([...usat.categories.map((c) => c.code)], ["USAT-E", "USAT-M", "USAT-CS", "USAT-GS", "USAT-COM", "USAT-A"]);
  assert.equal(usat.tos.rows.at(-1).total, 45);
});

test("notices are all marked sample with a valid status and type", () => {
  assert.ok(D.notices.length >= 10);
  for (const n of D.notices) {
    assert.equal(n.sample, true, n.id);
    assert.ok(["open", "closing", "result", "closed"].includes(n.status), `${n.id} status ${n.status}`);
    assert.ok(["Admission", "Schedule", "Result", "Recruitment", "General"].includes(n.type), `${n.id} type ${n.type}`);
    assert.match(n.published, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.equal(new Set(D.notices.map((n) => n.id)).size, D.notices.length);
});

test("notice and resource test references are valid slugs or general", () => {
  const ok = new Set([...SLUGS, "general"]);
  for (const n of D.notices) assert.ok(ok.has(n.test), `notice ${n.id} -> ${n.test}`);
  for (const r of D.resources) assert.ok(ok.has(r.test), `resource ${r.id} -> ${r.test}`);
});

test("resources and FAQs meet minimum counts and types", () => {
  assert.ok(D.resources.length >= 12);
  for (const r of D.resources) assert.ok(["Syllabus", "Sample paper", "Guide", "Policy"].includes(r.type), r.id);
  assert.ok(D.faqs.length >= 18);
  for (const f of D.faqs) assert.ok(["Registration", "Test day", "Results", "Fees", "Accessibility", "Institutions"].includes(f.category), f.q);
});

test("headline stats come from the profile", () => {
  const values = D.stats.map((s) => s.value);
  assert.ok(values.includes(1852391));
  assert.ok(values.includes(230685));
  assert.equal(D.stats.length, 8);
});

test("clients are grouped by sector", () => {
  for (const k of ["federal", "provincial", "universities", "other"]) assert.ok(D.clients[k].length > 0, k);
});
