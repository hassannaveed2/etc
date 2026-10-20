// Run the mockup's classic (non-module) browser scripts inside a vm sandbox,
// so their pure parts can be tested in Node without a browser.
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../mockup");

export function loadScripts(paths) {
  const noop = () => {};
  const document = {
    readyState: "loading",
    addEventListener: noop,
    querySelector: () => null,
    querySelectorAll: () => [],
  };
  const sandbox = { console, document, location: { search: "", pathname: "/" }, addEventListener: noop };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  for (const p of paths) {
    const file = path.join(ROOT, p);
    vm.runInContext(readFileSync(file, "utf8"), ctx, { filename: file });
  }
  return sandbox;
}
