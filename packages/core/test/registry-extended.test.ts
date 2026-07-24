import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LanguageServerRegistry, BUILTIN_SERVERS } from "../src/index.js";

describe("LanguageServerRegistry", () => {
  it("getById returns matching server", () => {
    const registry = new LanguageServerRegistry({ servers: BUILTIN_SERVERS });
    const ts = registry.getById("typescript");
    assert.ok(ts);
    assert.equal(ts!.command, "typescript-language-server");
  });

  it("getByLanguageId returns matching server", () => {
    const registry = new LanguageServerRegistry({ servers: BUILTIN_SERVERS });
    const py = registry.getByLanguageId("python");
    assert.ok(py);
    assert.equal(py!.extensions.includes(".py"), true);
  });

  it("getByExtension normalizes extension without dot", () => {
    const registry = new LanguageServerRegistry({ servers: BUILTIN_SERVERS });
    assert.ok(registry.getByExtension("go"));
    assert.ok(registry.getByExtension(".go"));
  });

  it("applies overrides to existing servers", () => {
    const registry = new LanguageServerRegistry({
      servers: BUILTIN_SERVERS,
      overrides: {
        typescript: { command: "custom-ts-lsp", args: ["--stdio"] },
      },
    });

    const ts = registry.getById("typescript");
    assert.equal(ts!.command, "custom-ts-lsp");
    assert.deepEqual(ts!.args, ["--stdio"]);
  });

  it("returns a copy from list()", () => {
    const registry = new LanguageServerRegistry({ servers: BUILTIN_SERVERS });
    const list = registry.list();
    list.pop();
    assert.equal(registry.list().length, BUILTIN_SERVERS.length);
  });

  it("ignores overrides for unknown ids", () => {
    const registry = new LanguageServerRegistry({
      servers: BUILTIN_SERVERS,
      overrides: { unknown: { command: "noop" } },
    });
    assert.equal(registry.list().length, BUILTIN_SERVERS.length);
  });
});
