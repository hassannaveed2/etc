import { test } from "node:test";
import assert from "node:assert/strict";
import { toEtcKey, contentTypeFor } from "../scripts/upload-to-spaces.mjs";

test("toEtcKey prefixes relative paths with ETC/mockup/", () => {
  assert.equal(toEtcKey("images/hero.png"), "ETC/mockup/images/hero.png");
});

test("toEtcKey normalises Windows separators", () => {
  assert.equal(toEtcKey("brand\\etc.png"), "ETC/mockup/brand/etc.png");
});

test("toEtcKey refuses parent-directory escapes", () => {
  assert.throws(() => toEtcKey("../x.png"), /Refusing key outside ETC\/mockup\//);
  assert.throws(() => toEtcKey("images/../../x.png"), /Refusing key outside ETC\/mockup\//);
});

test("toEtcKey refuses absolute paths", () => {
  assert.throws(() => toEtcKey("/abs.png"), /Refusing key outside ETC\/mockup\//);
  assert.throws(() => toEtcKey("C:\\abs.png"), /Refusing key outside ETC\/mockup\//);
});

test("contentTypeFor maps common extensions case-insensitively", () => {
  assert.equal(contentTypeFor("a.JPG"), "image/jpeg");
  assert.equal(contentTypeFor("a.png"), "image/png");
  assert.equal(contentTypeFor("a.webp"), "image/webp");
  assert.equal(contentTypeFor("a.svg"), "image/svg+xml");
  assert.equal(contentTypeFor("a.pdf"), "application/pdf");
  assert.equal(contentTypeFor("a.bin"), "application/octet-stream");
});
