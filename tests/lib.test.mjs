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

test("mediaUrl/localUrl map every key to CDN and local fallback", () => {
  const { ETC } = loadScripts(["assets/js/media.js"]);
  for (const k of Object.keys(ETC.media)) {
    assert.ok(ETC.mediaUrl(k).startsWith(CDN), `${k}: ${ETC.mediaUrl(k)}`);
    assert.ok(ETC.localUrl(k).startsWith("assets/img/"), `${k}: ${ETC.localUrl(k)}`);
  }
  assert.equal(ETC.mediaUrl("etcCrest"), CDN + "brand/etc-crest.png");
  assert.equal(ETC.localUrl("heroExam"), "assets/img/hero-exam-hall.jpg");
});
