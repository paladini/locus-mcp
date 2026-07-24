import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  LanguageServerRegistry,
  BUILTIN_SERVERS,
  SymbolResolver,
  formatSymbolLocation,
  formatLocationRef,
  loadConfig,
  generateDefaultConfig,
  filePathToUri,
  uriToFilePath,
} from "../src/index.js";
import { join, resolve } from "node:path";

describe("registry", () => {
  it("lists built-in servers", () => {
    const registry = new LanguageServerRegistry({ servers: BUILTIN_SERVERS });
    assert.ok(registry.list().length >= 4);
    assert.ok(registry.getByExtension(".ts"));
    assert.ok(registry.getByExtension(".py"));
    assert.ok(registry.getByExtension(".go"));
    assert.ok(registry.getByExtension(".rs"));
  });
});

describe("symbol resolver", () => {
  it("parses qualified names", () => {
    const resolver = new SymbolResolver({ rootPath: "/proj" });
    assert.deepEqual(resolver.parseQualifiedName("Foo.bar"), {
      container: "Foo",
      member: "bar",
    });
    assert.deepEqual(resolver.parseQualifiedName("bar"), { member: "bar" });
  });
});

describe("format", () => {
  it("formats symbol location", () => {
    const formatted = formatSymbolLocation(
      {
        name: "greet",
        qualifiedName: "Greeter.greet",
        kind: 6,
        filePath: "/proj/src/index.ts",
        relativePath: "src/index.ts",
        line: 4,
        character: 2,
      },
      "/proj",
    );
    assert.match(formatted, /src\/index\.ts:5:3/);
    assert.match(formatted, /Greeter\.greet/);
  });

  it("formats location ref", () => {
    const uri = filePathToUri(resolve("/proj/src/foo.ts"));
    const formatted = formatLocationRef(
      {
        uri,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 5 },
        },
      },
      "/proj",
    );
    assert.match(formatted, /foo\.ts:1:1/);
  });
});

describe("config", () => {
  it("generates default config", () => {
    const root = resolve(join(import.meta.dirname, "..", ".."));
    const config = generateDefaultConfig(root);
    assert.ok(config.root);
    assert.ok(config.servers?.length);
  });

  it("loads config from repo root", () => {
    const root = resolve(join(import.meta.dirname, "..", "..", ".."));
    const { rootPath } = loadConfig(root);
    assert.ok(rootPath);
  });
});

describe("uri helpers", () => {
  it("round-trips file paths", () => {
    const path = resolve("/tmp/test file.ts");
    const uri = filePathToUri(path);
    const back = uriToFilePath(uri);
    assert.ok(back.includes("test"));
  });
});
