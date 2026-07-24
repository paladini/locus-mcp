import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import type { LspClient } from "@locus-dev/core";
import { SymbolResolver } from "@locus-dev/core";
import type { LocusServerContext } from "../src/context.js";
import { handleLocate } from "../src/tools/locate.js";
import { handleRefs } from "../src/tools/refs.js";
import { handleHover } from "../src/tools/hover.js";
import { handleDiagnostics } from "../src/tools/diagnostics.js";
import { handleStatus } from "../src/tools/status.js";
import { handleRename } from "../src/tools/rename.js";
import { filePathToUri } from "@locus-dev/core";

const ROOT = resolve("/proj");

function mockClient(overrides: Partial<LspClient> = {}): LspClient {
  return {
    serverState: "ready",
    workspaceSymbol: async (query: string) => {
      if (query.includes("Greeter") || query === "Greeter") {
        return [
          {
            name: "Greeter",
            kind: 5,
            location: {
              uri: filePathToUri(resolve(ROOT, "src/index.ts")),
              range: { start: { line: 0, character: 6 }, end: { line: 0, character: 13 } },
            },
          },
        ];
      }
      return [];
    },
    documentSymbol: async () => [],
    references: async () => [],
    implementation: async () => [],
    hover: async () => ({ contents: "type Info" }),
    prepareRename: async () => ({ range: { start: { line: 0, character: 0 }, end: { line: 0, character: 4 } } }),
    rename: async () => ({
      changes: {
        [filePathToUri(resolve(ROOT, "src/index.ts"))]: [
          { range: { start: { line: 0, character: 0 }, end: { line: 0, character: 4 } }, newText: "newName" },
        ],
      },
    }),
    didOpen: async () => {},
    getDiagnostics: () => [],
    getOpenDocuments: () => [],
    ...overrides,
  } as unknown as LspClient;
}

function mockContext(clientOverrides?: Partial<LspClient>): LocusServerContext {
  const client = mockClient(clientOverrides);
  return {
    rootPath: ROOT,
    configs: [{ id: "ts", languageId: "typescript", extensions: [".ts"], command: "fake-lsp" }],
    manager: {
      getClientForFile: async () => client,
      status: async () => [
        {
          languageId: "typescript",
          extensions: [".ts"],
          command: "fake-lsp",
          state: "ready",
          binaryAvailable: true,
          openDocuments: 0,
          warmed: false,
        },
      ],
    } as LocusServerContext["manager"],
    resolver: new SymbolResolver({ rootPath: ROOT }),
  };
}

function resultText(result: { content: Array<{ text: string }> }): string {
  return result.content[0]!.text;
}

describe("handleLocate", () => {
  it("returns error when neither name nor file provided", async () => {
    const result = await handleLocate(mockContext(), {});
    assert.match(resultText(result), /status: error/);
    assert.equal(result.isError, true);
  });

  it("locates symbol by name", async () => {
    const result = await handleLocate(mockContext(), { name: "Greeter" });
    assert.match(resultText(result), /status: ok/);
    assert.match(resultText(result), /Greeter/);
  });

  it("returns ambiguous_symbol status", async () => {
    const ctx = mockContext({
      workspaceSymbol: async () => [
        {
          name: "foo",
          kind: 12,
          containerName: "A",
          location: {
            uri: filePathToUri(resolve(ROOT, "src/a.ts")),
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: 3 } },
          },
        },
        {
          name: "foo",
          kind: 12,
          containerName: "B",
          location: {
            uri: filePathToUri(resolve(ROOT, "src/b.ts")),
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: 3 } },
          },
        },
      ],
    });
    const result = await handleLocate(ctx, { name: "foo" });
    assert.match(resultText(result), /status: ambiguous_symbol/);
    assert.equal(result.isError, true);
  });

  it("returns document symbol overview for file only", async () => {
    const ctx = mockContext({
      documentSymbol: async () => [
        {
          name: "MyClass",
          kind: 5,
          containerName: undefined,
          location: {
            uri: filePathToUri(resolve(ROOT, "src/index.ts")),
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: 7 } },
          },
        },
      ],
    });

    const result = await handleLocate(ctx, { file: "src/index.ts" });
    assert.match(resultText(result), /status: ok/);
    assert.match(resultText(result), /MyClass/);
  });

  it("maps LSP errors to server_unavailable", async () => {
    const ctx = mockContext({
      workspaceSymbol: async () => {
        throw new Error("server_unavailable");
      },
    });
    const result = await handleLocate(ctx, { name: "UnknownSymbol" });
    assert.match(resultText(result), /status: server_unavailable/);
  });
});

describe("handleRefs", () => {
  it("requires line/character or position", async () => {
    const result = await handleRefs(mockContext(), { file: "src/index.ts" });
    assert.match(resultText(result), /status: error/);
  });

  it("returns references with position shorthand", async () => {
    const ctx = mockContext({
      references: async () => [
        {
          uri: filePathToUri(resolve(ROOT, "src/index.ts")),
          range: { start: { line: 2, character: 4 }, end: { line: 2, character: 10 } },
        },
      ],
    });

    const result = await handleRefs(ctx, { file: "src/index.ts", position: "src/index.ts:3:5" });
    assert.match(resultText(result), /status: ok/);
    assert.match(resultText(result), /index\.ts:3:5/);
  });

  it("returns implementations when requested", async () => {
    const ctx = mockContext({
      implementation: async () => [
        {
          uri: filePathToUri(resolve(ROOT, "src/impl.ts")),
          range: { start: { line: 0, character: 0 }, end: { line: 0, character: 4 } },
        },
      ],
    });

    const result = await handleRefs(ctx, {
      file: "src/index.ts",
      line: 0,
      character: 0,
      implementations: true,
    });
    assert.match(resultText(result), /status: ok/);
    assert.match(resultText(result), /impl\.ts/);
  });
});

describe("handleHover", () => {
  it("returns hover for file position", async () => {
    const result = await handleHover(mockContext(), {
      file: "src/index.ts",
      line: 0,
      character: 0,
    });
    assert.match(resultText(result), /status: ok/);
    assert.match(resultText(result), /type Info/);
  });

  it("resolves symbol by name before hover", async () => {
    const result = await handleHover(mockContext(), { name: "Greeter", file: "src/index.ts" });
    assert.match(resultText(result), /status: ok/);
  });
});

describe("handleDiagnostics", () => {
  it("returns file diagnostics", async () => {
    const uri = filePathToUri(resolve(ROOT, "src/index.ts"));
    const ctx = mockContext({
      getDiagnostics: () => [
        {
          range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
          message: "Type error",
          severity: 1,
        },
      ],
      getOpenDocuments: () => [{ uri, languageId: "typescript", version: 1, text: "" }],
    });

    const result = await handleDiagnostics(ctx, { file: "src/index.ts" });
    assert.match(resultText(result), /status: ok/);
    assert.match(resultText(result), /Type error/);
  });
});

describe("handleStatus", () => {
  it("returns formatted server status", async () => {
    const result = await handleStatus(mockContext(), {});
    assert.match(resultText(result), /status: ok/);
    assert.match(resultText(result), /typescript/);
    assert.equal(result.isError, false);
  });
});

describe("handleRename", () => {
  it("returns dry-run preview by default", async () => {
    const result = await handleRename(mockContext(), {
      file: "src/index.ts",
      line: 0,
      character: 0,
      new_name: "Renamed",
    });
    assert.match(resultText(result), /status: ok/);
    assert.match(resultText(result), /Dry run/);
  });

  it("returns error when rename not possible", async () => {
    const ctx = mockContext({ prepareRename: async () => null });
    const result = await handleRename(ctx, {
      file: "src/index.ts",
      line: 0,
      character: 0,
      new_name: "X",
    });
    assert.match(resultText(result), /status: no_results/);
  });
});
