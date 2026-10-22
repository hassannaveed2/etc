import { expect, test } from "vitest";
import { sanitizeRichText } from "@/lib/sanitize";

test("scripts and event handlers are removed", () => {
  expect(sanitizeRichText('<p onclick="x">Hi<script>alert(1)</script></p>')).toBe("<p>Hi</p>");
  expect(sanitizeRichText('<img src=x onerror="alert(1)"><p>ok</p>')).toBe("<p>ok</p>");
});

test("javascript: links lose their href", () => {
  expect(sanitizeRichText('<a href="javascript:alert(1)">x</a>')).toBe("<a>x</a>");
});

test("safe links keep their href and get rel=noopener noreferrer", () => {
  expect(sanitizeRichText('<a href="https://hec.gov.pk">HEC</a>')).toBe('<a href="https://hec.gov.pk" rel="noopener noreferrer">HEC</a>');
  expect(sanitizeRichText('<a href="mailto:info@etc.gov.pk" target="_blank">mail</a>')).toBe('<a href="mailto:info@etc.gov.pk" rel="noopener noreferrer">mail</a>');
});

test("only the allow-listed blocks survive (h1 unwrapped, h3 kept)", () => {
  expect(sanitizeRichText("<h1>T</h1><img src=x><h3>S</h3>")).toBe("T<h3>S</h3>");
  expect(sanitizeRichText("<h2>A</h2><ul><li><strong>b</strong> <em>i</em></li></ul><blockquote>q</blockquote><br>")).toBe(
    "<h2>A</h2><ul><li><strong>b</strong> <em>i</em></li></ul><blockquote>q</blockquote><br />",
  );
});

test("styles, classes and iframes are dropped", () => {
  expect(sanitizeRichText('<p style="color:red" class="x">a</p><iframe src="https://evil"></iframe>')).toBe("<p>a</p>");
});
