import { test } from "node:test";
import assert from "node:assert/strict";
import { loadScripts } from "./helpers/load.mjs";

const CDN = "https://sbsi-cdn.sgp1.digitaloceanspaces.com/ETC/mockup/";

test("media manifest has exactly the 16 planned keys", () => {
  const { ETC } = loadScripts(["assets/js/media.js"]);
  assert.equal(Object.keys(ETC.media).length, 16);
  for (const k of ["etcCrest", "hecCrest", "heroExam", "heroCampus", "heroLaw", "testLat", "testLawgat",
    "testHat", "testHaat", "testUsat", "institutions", "qualityOmr", "qualitySealed", "candidateCentre",
    "aboutBuilding", "noticeDefault"]) {
    assert.ok(ETC.media[k], `missing media key ${k}`);
    assert.ok(ETC.media[k].alt, `missing alt for ${k}`);
  }
});

const lib = () => loadScripts(["assets/js/data.js", "assets/js/lib.js"]).ETC;

test("getTest returns null for an unknown slug", () => {
  const ETC = lib();
  assert.equal(ETC.getTest("nope"), null);
  assert.equal(ETC.getTest("usat").code, "USAT");
});

test("filterNotices by type returns only that type, newest first", () => {
  const ETC = lib();
  const res = ETC.filterNotices(ETC.data.notices, { type: "Result" });
  assert.ok(res.length > 0);
  assert.ok(res.every((n) => n.type === "Result"));
  for (let i = 1; i < res.length; i++) assert.ok(res[i - 1].published >= res[i].published);
});

test("filterNotices by test and query", () => {
  const ETC = lib();
  assert.ok(ETC.filterNotices(ETC.data.notices, { test: "usat" }).every((n) => n.test === "usat"));
  const q = ETC.filterNotices(ETC.data.notices, { q: "law-gat" });
  assert.ok(q.length > 0 && q.every((n) => (n.title + " " + n.summary + " " + n.test).toLowerCase().includes("law-gat")));
});

test("filterNotices returns [] for an unmatched query", () => {
  const ETC = lib();
  assert.equal(ETC.filterNotices(ETC.data.notices, { q: "zzzz" }).length, 0);
});

test("filterResources by type and test", () => {
  const ETC = lib();
  const r = ETC.filterResources(ETC.data.resources, { type: "Syllabus", test: "usat" });
  assert.ok(r.length > 0 && r.every((x) => x.type === "Syllabus" && x.test === "usat"));
  assert.equal(ETC.filterResources(ETC.data.resources, { q: "zzzz" }).length, 0);
});

test("searchFaqs matches question or answer text within a category", () => {
  const ETC = lib();
  const r = ETC.searchFaqs(ETC.data.faqs, "admit");
  assert.ok(r.length > 0 && r.every((f) => (f.q + f.a).toLowerCase().includes("admit")));
  assert.ok(ETC.searchFaqs(ETC.data.faqs, "", "Fees").every((f) => f.category === "Fees"));
  assert.equal(ETC.searchFaqs(ETC.data.faqs, "zzzz").length, 0);
});

test("formatFee and formatDate", () => {
  const ETC = lib();
  assert.equal(ETC.formatFee(2000), "Rs. 2,000");
  assert.equal(ETC.formatFee(null), "By agreement");
  assert.equal(ETC.formatDate("2026-10-20"), "20 Oct 2026");
});

test("validateForm flags required and email", () => {
  const ETC = lib();
  const bad = ETC.validateForm([
    { name: "email", value: "x", required: true, type: "email" },
    { name: "org", value: "  ", required: true },
    { name: "phone", value: "" },
  ]);
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.email);
  assert.ok(bad.errors.org);
  assert.equal(bad.errors.phone, undefined);
  const good = ETC.validateForm([{ name: "email", value: "a@b.pk", required: true, type: "email" }]);
  assert.equal(good.valid, true);
  assert.deepEqual(Object.keys(good.errors), []);
});

test("mediaUrl/localUrl map every key to CDN and local fallback", () => {
  const { ETC } = loadScripts(["assets/js/media.js"]);
  for (const k of Object.keys(ETC.media)) {
    assert.ok(ETC.mediaUrl(k).startsWith(CDN), `${k}: ${ETC.mediaUrl(k)}`);
    assert.ok(ETC.localUrl(k).startsWith("assets/img/"), `${k}: ${ETC.localUrl(k)}`);
  }
  assert.equal(ETC.mediaUrl("etcCrest"), CDN + "brand/etc-crest.png");
  assert.equal(ETC.localUrl("heroExam"), "assets/img/hero-exam-hall.jpg");
});
