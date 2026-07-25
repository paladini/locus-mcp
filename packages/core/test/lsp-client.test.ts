import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { LspClient } from "../src/lsp-client/client.js";
import { filePathToUri } from "../src/lsp-client/connection.js";
import type { LanguageServerConfig } from "../src/registry/registry.js";
import type { LspConnection } from "../src/lsp-client/connection.js";

function createMockConnection(handlers: {
  onStart?: () => void;
  onStop?: () => void;
  onRequest?: (method: string, params?: unknown) => unknown;
  onNotify?: (method: string, params?: unknown) => void;
}): LspConnection {
  return {
    start: async () => {
      handlers.onStart?.();
    },
    stop: async () => {
      handlers.onStop?.();
    },
    request: async (method, params) => handlers.onRequest?.(method, params),
    notify: (method, params) => {
      handlers.onNotify?.(method, params);
    },
    isRunning: true,
  } as unknown as LspConnection;
}

describe("LspClient (mocked connection)", () => {
  let tempDir: string;
  let rootPath: string;
  let client: LspClient;
  let notifications: Array<{ method: string; params: unknown }>;
  let originalCreateConnection: LspClient["createConnection"];

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "locus-lsp-client-"));
    rootPath = tempDir;
    writeFileSync(join(tempDir, "index.ts"), "export class Greeter {\n  greet() {}\n}\n");
    notifications = [];

    originalCreateConnection = (LspClient.prototype as unknown as { createConnection: LspClient["createConnection"] })
      .createConnection;
    (LspClient.prototype as unknown as { createConnection: () => LspConnection }).createConnection = function () {
      return createMockConnection({
        onRequest: (method) => {
          switch (method) {
            case "initialize":
              return { capabilities: {}, serverInfo: { name: "mock-lsp", version: "1.0.0" } };
            case "workspace/symbol":
              return [
                {
                  name: "Greeter",
                  kind: 5,
                  location: {
                    uri: filePathToUri(join(rootPath, "index.ts")),
                    range: {
                      start: { line: 0, character: 6 },
                      end: { line: 0, character: 13 },
                    },
                  },
                },
              ];
            case "textDocument/documentSymbol":
              return [
                {
                  name: "Greeter",
                  kind: 5,
                  range: {
                    start: { line: 0, character: 0 },
                    end: { line: 1, character: 1 },
                  },
                  selectionRange: {
                    start: { line: 0, character: 6 },
                    end: { line: 0, character: 13 },
                  },
                },
              ];
            case "textDocument/references":
              return [
                {
                  uri: filePathToUri(join(rootPath, "index.ts")),
                  range: { start: { line: 1, character: 2 }, end: { line: 1, character: 7 } },
                },
              ];
            case "textDocument/implementation":
              return [
                {
                  uri: filePathToUri(join(rootPath, "impl.ts")),
                  range: { start: { line: 0, character: 0 }, end: { line: 0, character: 4 } },
                },
              ];
            case "textDocument/hover":
              return { contents: { kind: "markdown", value: "**string**" } };
            case "textDocument/prepareRename":
              return {
                range: { start: { line: 0, character: 6 }, end: { line: 0, character: 13 } },
              };
            case "textDocument/rename":
              return {
                changes: {
                  [filePathToUri(join(rootPath, "index.ts"))]: [
                    {
                      range: { start: { line: 0, character: 6 }, end: { line: 0, character: 13 } },
                      newText: "Renamed",
                    },
                  ],
                },
              };
            case "textDocument/definition":
              return {
                uri: filePathToUri(join(rootPath, "types.ts")),
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 6 } },
              };
            default:
              return null;
          }
        },
        onNotify: (method, params) => {
          notifications.push({ method, params: params ?? {} });
        },
      });
    };

    client = new LspClient({
      rootPath,
      serverConfig: {
        id: "mock",
        languageId: "typescript",
        extensions: [".ts"],
        command: "mock-lsp",
      },
      requestTimeoutMs: 5000,
    });
  });

  afterEach(async () => {
    if (originalCreateConnection) {
      (LspClient.prototype as unknown as { createConnection: typeof originalCreateConnection }).createConnection =
        originalCreateConnection;
    }
    await client.stop();
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("starts and reports ready state", async () => {
    assert.equal(client.serverState, "stopped");
    await client.start();
    assert.equal(client.serverState, "ready");
    assert.equal(client.info?.name, "mock-lsp");
  });

  it("does not restart when already ready", async () => {
    await client.start();
    await client.start();
    assert.equal(client.serverState, "ready");
  });

  it("opens documents and tracks state", async () => {
    await client.start();
    const filePath = join(tempDir, "index.ts");
    await client.didOpen(filePath);

    const docs = client.getOpenDocuments();
    assert.equal(docs.length, 1);
    assert.match(docs[0]!.uri, /^file:\/\//);
    assert.ok(notifications.some((n) => n.method === "textDocument/didOpen"));
  });

  it("updates document on didChange", async () => {
    await client.start();
    const filePath = join(tempDir, "index.ts");
    await client.didOpen(filePath);
    await client.didChange(filePath, "export class Updated {}\n");

    const docs = client.getOpenDocuments();
    assert.match(docs[0]!.text, /Updated/);
    assert.ok(notifications.some((n) => n.method === "textDocument/didChange"));
  });

  it("returns workspace symbols", async () => {
    await client.start();
    const symbols = await client.workspaceSymbol("Greeter");
    assert.equal(symbols.length, 1);
    assert.equal(symbols[0]!.name, "Greeter");
  });

  it("returns document symbols with flattened hierarchy", async () => {
    await client.start();
    const symbols = await client.documentSymbol(join(tempDir, "index.ts"));
    assert.ok(symbols.length >= 1);
    assert.equal(symbols[0]!.name, "Greeter");
  });

  it("returns references for a position", async () => {
    await client.start();
    const refs = await client.references(join(tempDir, "index.ts"), 1, 2);
    assert.equal(refs.length, 1);
  });

  it("returns implementations for a position", async () => {
    await client.start();
    const impls = await client.implementation(join(tempDir, "index.ts"), 1, 2);
    assert.equal(impls.length, 1);
  });

  it("returns hover markdown content", async () => {
    await client.start();
    const hover = await client.hover(join(tempDir, "index.ts"), 0, 6);
    assert.ok(hover?.contents);
  });

  it("prepares and executes rename", async () => {
    await client.start();
    const prepared = await client.prepareRename(join(tempDir, "index.ts"), 0, 6);
    assert.ok(prepared?.range);

    const edit = await client.rename(join(tempDir, "index.ts"), 0, 6, "Renamed");
    assert.ok(edit?.changes);
  });

  it("returns definition location", async () => {
    await client.start();
    const def = await client.definition(join(tempDir, "index.ts"), 0, 6);
    assert.ok(def);
  });

  it("debounces publishDiagnostics notifications", async () => {
    await client.start();
    const uri = filePathToUri(join(tempDir, "index.ts"));

    (client as unknown as { handleDiagnostics: (p: unknown) => void }).handleDiagnostics({
      uri,
      diagnostics: [
        {
          range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
          message: "test",
        },
      ],
    });

    assert.equal(client.getDiagnostics(uri).length, 0);
    await new Promise((r) => setTimeout(r, 200));
    assert.equal(client.getDiagnostics(uri).length, 1);
  });

  it("throws server_unavailable when unavailable", async () => {
    await client.start();
    await client.stop();
    (client as unknown as { state: string }).state = "unavailable";

    await assert.rejects(() => client.workspaceSymbol("x"), /server_unavailable/);
  });

  it("throws server_starting when still starting", async () => {
    await client.start();
    (client as unknown as { state: string }).state = "starting";

    await assert.rejects(() => client.workspaceSymbol("x"), /server_starting/);
  });

  it("sets unavailable state after failed start", async () => {
    (LspClient.prototype as unknown as { createConnection: () => LspConnection }).createConnection = function () {
      return createMockConnection({
        onStart: () => {
          throw new Error("spawn failed");
        },
      });
    };

    const badClient = new LspClient({
      rootPath,
      serverConfig: {
        id: "bad",
        languageId: "typescript",
        extensions: [".ts"],
        command: "bad",
      },
    });

    await assert.rejects(() => badClient.start());
    assert.equal(badClient.serverState, "unavailable");
    await badClient.stop();
  });
});

describe("relativePath", () => {
  it("returns posix-style relative paths", async () => {
    const { relativePath } = await import("../src/lsp-client/client.js");
    const root = resolve("/proj");
    const uri = filePathToUri(join(root, "src", "foo.ts"));
    assert.equal(relativePath(root, uri), "src/foo.ts");
  });
});
