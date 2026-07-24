import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  findConfigFile,
  loadConfig,
  createRegistry,
  detectProjectLanguages,
  configToToml,
  configToJson,
  generateDefaultConfig,
} from "../src/index.js";

describe("findConfigFile", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "locus-config-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("finds locus.toml in start directory", () => {
    writeFileSync(join(tempDir, "locus.toml"), 'root = "."\n');
    assert.equal(findConfigFile(tempDir), join(tempDir, "locus.toml"));
  });

  it("finds locus.json when toml is absent", () => {
    writeFileSync(join(tempDir, "locus.json"), '{"root":"."}');
    assert.equal(findConfigFile(tempDir), join(tempDir, "locus.json"));
  });

  it("finds .lsp.json for Claude/Open Plugins compat", () => {
    writeFileSync(join(tempDir, ".lsp.json"), '{"languageServer":{"command":"custom-lsp"}}');
    assert.equal(findConfigFile(tempDir), join(tempDir, ".lsp.json"));
  });

  it("prefers locus.toml over locus.json", () => {
    writeFileSync(join(tempDir, "locus.toml"), 'root = "."\n');
    writeFileSync(join(tempDir, "locus.json"), '{"root":"."}');
    assert.equal(findConfigFile(tempDir), join(tempDir, "locus.toml"));
  });

  it("walks up to parent directory", () => {
    const sub = join(tempDir, "src", "nested");
    mkdirSync(sub, { recursive: true });
    writeFileSync(join(tempDir, "locus.json"), '{"root":"."}');
    assert.equal(findConfigFile(sub), join(tempDir, "locus.json"));
  });
});

describe("loadConfig .lsp.json compatibility", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "locus-lspjson-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("converts languageServer block to server entry", () => {
    writeFileSync(
      join(tempDir, ".lsp.json"),
      JSON.stringify({
        languageServer: {
          command: "custom-ts-lsp",
          args: ["--stdio"],
          extensionToLanguage: { ts: "typescript", ".tsx": "typescriptreact" },
        },
      }),
    );

    const { config, rootPath } = loadConfig(tempDir);
    assert.equal(rootPath, tempDir);
    assert.ok(config.servers?.some((s) => s.command === "custom-ts-lsp"));
    assert.ok(config.servers?.some((s) => s.extensions.includes(".ts")));
  });

  it("merges servers array from .lsp.json", () => {
    writeFileSync(
      join(tempDir, ".lsp.json"),
      JSON.stringify({
        servers: [
          {
            id: "ruby",
            languageId: "ruby",
            extensions: [".rb"],
            command: "solargraph",
            args: ["stdio"],
          },
        ],
      }),
    );

    const { config } = loadConfig(tempDir);
    assert.ok(config.servers?.some((s) => s.id === "ruby"));
    assert.ok(config.servers?.some((s) => s.command === "solargraph"));
  });

  it("loads locus.toml with warm array", () => {
    writeFileSync(join(tempDir, "locus.toml"), 'root = "."\nwarm = ["typescript", "python"]\n');
    const { config } = loadConfig(tempDir);
    assert.deepEqual(config.warm, ["typescript", "python"]);
  });
});

describe("createRegistry", () => {
  it("uses builtins when servers array is empty", () => {
    const registry = createRegistry({});
    assert.ok(registry.getByExtension(".ts"));
    assert.ok(registry.getByExtension(".py"));
  });

  it("uses custom servers when provided", () => {
    const registry = createRegistry({
      servers: [
        {
          id: "custom",
          languageId: "typescript",
          extensions: [".ts"],
          command: "my-lsp",
        },
      ],
    });
    const server = registry.getByExtension(".ts");
    assert.equal(server?.command, "my-lsp");
  });
});

describe("detectProjectLanguages", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "locus-detect-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("detects typescript from tsconfig.json", () => {
    writeFileSync(join(tempDir, "tsconfig.json"), "{}");
    const langs = detectProjectLanguages(tempDir);
    assert.ok(langs.includes("typescript"));
  });

  it("detects python from pyproject.toml", () => {
    writeFileSync(join(tempDir, "pyproject.toml"), "[project]\nname = 'test'\n");
    const langs = detectProjectLanguages(tempDir);
    assert.ok(langs.includes("python"));
  });

  it("returns empty array for unknown project", () => {
    assert.deepEqual(detectProjectLanguages(tempDir), []);
  });
});

describe("config serialization", () => {
  it("configToToml includes root and warm", () => {
    const toml = configToToml({ root: "/proj", warm: ["typescript"] });
    assert.match(toml, /root = "\/proj"/);
    assert.match(toml, /warm = \["typescript"\]/);
  });

  it("configToJson produces valid JSON", () => {
    const config = generateDefaultConfig(process.cwd());
    const parsed = JSON.parse(configToJson(config));
    assert.ok(parsed.root);
    assert.ok(Array.isArray(parsed.servers));
  });
});
