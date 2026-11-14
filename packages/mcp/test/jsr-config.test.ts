import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("jsr.json", () => {
  it("matches package.json version and exports entry", () => {
    const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
    const jsr = JSON.parse(readFileSync(join(pkgDir, "jsr.json"), "utf8"));
    assert.equal(jsr.name, "@paladini/locus-mcp");
    assert.equal(jsr.version, pkg.version);
    assert.equal(jsr.exports["."], "./src/index.ts");
  });
});