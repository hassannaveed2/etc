import { test, expect } from "vitest";
import { ALLOWED, createStatement } from "../../scripts/create-databases.mjs";

test("only ETC's staging and shadow databases can be created", () => {
  expect(ALLOWED).toEqual(["ETCStaging", "ETCShadow"]);
  expect(createStatement("ETCStaging")).toBe(
    "CREATE DATABASE IF NOT EXISTS `ETCStaging` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
  );
});

test("any other name is refused, including production and other projects", () => {
  for (const name of ["ETC", "defaultdb", "ETCStaging`; DROP DATABASE x; --"]) {
    expect(() => createStatement(name)).toThrow(/Refusing to create database/);
  }
});
