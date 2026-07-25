import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LspConnection } from "../src/lsp-client/connection.js";

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const FAKE_LSP = join(FIXTURE_DIR, "fake-lsp.mjs");
const HANG_LSP = join(FIXTURE_DIR, "hang-lsp.mjs");

describe("LspConnection with fake-lsp", () => {
  let connection: LspConnection;

  afterEach(async () => {
    if (connection) {
      try {
        await connection.stop();
      } catch {
        /* ignore */
      }
    }
  });

  it("starts process and completes initialize", async () => {
    connection = new LspConnection({
      command: process.execPath,
      args: [FAKE_LSP],
      cwd: process.cwd(),
      requestTimeoutMs: 5000,
    });

    await connection.start();
    assert.equal(connection.isRunning, true);

    const result = (await connection.request("initialize", {
      processId: null,
      rootUri: "file:///proj",
      capabilities: {},
    })) as { serverInfo?: { name: string } };

    assert.equal(result.serverInfo?.name, "fake-lsp");
  });

  it("returns workspace symbols from fake server", async () => {
    connection = new LspConnection({
      command: process.execPath,
      args: [FAKE_LSP],
      cwd: process.cwd(),
      requestTimeoutMs: 5000,
    });

    await connection.start();
    const symbols = (await connection.request("workspace/symbol", { query: "Greeter" })) as Array<{
      name: string;
    }>;

    assert.ok(Array.isArray(symbols));
    assert.equal(symbols[0]?.name, "Greeter");
  });

  it("sends notifications while running", async () => {
    connection = new LspConnection({
      command: process.execPath,
      args: [FAKE_LSP],
      cwd: process.cwd(),
      requestTimeoutMs: 5000,
    });

    await connection.start();
    assert.doesNotThrow(() => connection.notify("initialized", {}));
  });

  it("rejects requests that exceed timeout", async () => {
    connection = new LspConnection({
      command: process.execPath,
      args: [HANG_LSP],
      cwd: process.cwd(),
      requestTimeoutMs: 200,
    });

    await connection.start();
    await assert.rejects(() => connection.request("initialize", {}), /timed out/);
    await connection.stop();
  });

  it("stop clears running state", async () => {
    connection = new LspConnection({
      command: process.execPath,
      args: [FAKE_LSP],
      cwd: process.cwd(),
      requestTimeoutMs: 5000,
    });

    await connection.start();
    await connection.stop();
    assert.equal(connection.isRunning, false);
    await assert.rejects(() => connection.request("shutdown", {}), /not running/);
  });
});
