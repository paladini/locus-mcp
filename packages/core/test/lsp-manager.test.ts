import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { LspManager } from "../src/lsp-client/manager.js";
import { LspClient } from "../src/lsp-client/client.js";
import type { LanguageServerConfig } from "../src/registry/registry.js";
import type { LspConnection } from "../src/lsp-client/connection.js";

function testConfigs(): LanguageServerConfig[] {
  return [
    {
      id: "fake-ts",
      languageId: "typescript",
      extensions: [".ts", ".tsx"],
      command: "node",
      args: ["fake-lsp.mjs"],
    },
    {
      id: "missing",
      languageId: "ruby",
      extensions: [".rb"],
      command: "nonexistent-ruby-lsp-xyz",
    },
  ];
}

function mockConnection(): LspConnection {
  return {
    start: async () => {},
    stop: async () => {},
    request: async (method) => {
      if (method === "initialize") {
        return { capabilities: {}, serverInfo: { name: "mock", version: "1.0" } };
      }
      return null;
    },
    notify: () => {},
    isRunning: true,
  } as unknown as LspConnection;
}

describe("LspManager", () => {
  let tempDir: string;
  let manager: LspManager;
  let originalCreateConnection: LspClient["createConnection"];

  afterEach(async () => {
    if (originalCreateConnection) {
      (LspClient.prototype as unknown as { createConnection: typeof originalCreateConnection }).createConnection =
        originalCreateConnection;
    }
    await manager?.stopAll();
    if (tempDir) rmSync(tempDir, { recursive: true, force: true });
  });

  it("resolves config by extension and file path", () => {
    tempDir = mkdtempSync(join(tmpdir(), "locus-manager-"));
    manager = new LspManager(tempDir, testConfigs());

    assert.equal(manager.configForExtension("ts")?.id, "fake-ts");
    assert.equal(manager.configForFile("src/app.ts")?.languageId, "typescript");
    assert.equal(manager.configForFile("Gemfile"), undefined);
  });

  it("creates and starts client for matching file", async () => {
    tempDir = mkdtempSync(join(tmpdir(), "locus-manager-"));
    manager = new LspManager(tempDir, testConfigs());

    originalCreateConnection = (LspClient.prototype as unknown as { createConnection: LspClient["createConnection"] })
      .createConnection;
    (LspClient.prototype as unknown as { createConnection: () => LspConnection }).createConnection =
      function () {
        return mockConnection();
      };

    const client = await manager.getClientForFile("index.ts");
    assert.ok(client);
    assert.equal(client!.serverState, "ready");
  });

  it("returns client even when binary is missing", async () => {
    tempDir = mkdtempSync(join(tmpdir(), "locus-manager-"));
    manager = new LspManager(tempDir, testConfigs());

    originalCreateConnection = (LspClient.prototype as unknown as { createConnection: LspClient["createConnection"] })
      .createConnection;
    (LspClient.prototype as unknown as { createConnection: () => LspConnection }).createConnection =
      function () {
        return {
          ...mockConnection(),
          start: async () => {
            throw new Error("spawn failed");
          },
        } as unknown as LspConnection;
      };

    const client = await manager.getClientForFile("script.rb");
    assert.ok(client);
    assert.equal(client!.serverState, "unavailable");
  });

  it("warms configured language servers", async () => {
    tempDir = mkdtempSync(join(tmpdir(), "locus-manager-"));
    manager = new LspManager(tempDir, testConfigs());

    originalCreateConnection = (LspClient.prototype as unknown as { createConnection: LspClient["createConnection"] })
      .createConnection;
    (LspClient.prototype as unknown as { createConnection: () => LspConnection }).createConnection =
      function () {
        return mockConnection();
      };

    await manager.warm(["typescript"]);
    const statuses = await manager.status();
    const ts = statuses.find((s) => s.languageId === "typescript");
    assert.ok(ts);
    assert.equal(ts!.warmed, true);
    assert.equal(ts!.state, "ready");
  });

  it("reports binary availability in status", async () => {
    tempDir = mkdtempSync(join(tmpdir(), "locus-manager-"));
    manager = new LspManager(tempDir, testConfigs());

    const statuses = await manager.status();
    const ts = statuses.find((s) => s.languageId === "typescript");
    const ruby = statuses.find((s) => s.languageId === "ruby");

    assert.equal(ts!.binaryAvailable, true);
    assert.equal(ruby!.binaryAvailable, false);
  });

  it("stops all clients and clears warmed state", async () => {
    tempDir = mkdtempSync(join(tmpdir(), "locus-manager-"));
    manager = new LspManager(tempDir, testConfigs());

    originalCreateConnection = (LspClient.prototype as unknown as { createConnection: LspClient["createConnection"] })
      .createConnection;
    (LspClient.prototype as unknown as { createConnection: () => LspConnection }).createConnection =
      function () {
        return mockConnection();
      };

    await manager.warm(["typescript"]);
    await manager.stopAll();

    const statuses = await manager.status();
    for (const s of statuses) {
      assert.equal(s.state, "stopped");
      assert.equal(s.warmed, false);
    }
  });

  it("reuses existing client instance", async () => {
    tempDir = mkdtempSync(join(tmpdir(), "locus-manager-"));
    manager = new LspManager(tempDir, testConfigs());

    originalCreateConnection = (LspClient.prototype as unknown as { createConnection: LspClient["createConnection"] })
      .createConnection;
    (LspClient.prototype as unknown as { createConnection: () => LspConnection }).createConnection =
      function () {
        return mockConnection();
      };

    const first = await manager.getClientForFile("a.ts");
    const second = await manager.getClientForFile("b.ts");
    assert.equal(first, second);
  });
});
