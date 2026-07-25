import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { LspClient } from "@paladini/locus-core";
import type { LspConnection } from "@paladini/locus-core";
import { createLocusServer } from "../src/server.js";

function mockConnection(): LspConnection {
  return {
    start: async () => {},
    stop: async () => {},
    request: async (method) => {
      if (method === "initialize") {
        return { capabilities: {}, serverInfo: { name: "mock", version: "1.0" } };
      }
      if (method === "workspace/symbol") return [];
      if (method === "textDocument/documentSymbol") return [];
      return null;
    },
    notify: () => {},
    isRunning: true,
  } as unknown as LspConnection;
}

describe("createLocusServer", () => {
  let tempDir: string;
  let client: Client;
  let transport: InMemoryTransport;
  let originalCreateConnection: LspClient["createConnection"];

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "locus-server-"));
    writeFileSync(join(tempDir, "locus.json"), JSON.stringify({ warm: ["typescript"] }));

    originalCreateConnection = (LspClient.prototype as unknown as { createConnection: LspClient["createConnection"] })
      .createConnection;
    (LspClient.prototype as unknown as { createConnection: () => LspConnection }).createConnection =
      function () {
        return mockConnection();
      };
  });

  afterEach(async () => {
    await client?.close();
    await transport?.close();

    if (originalCreateConnection) {
      (LspClient.prototype as unknown as { createConnection: typeof originalCreateConnection }).createConnection =
        originalCreateConnection;
    }

    rmSync(tempDir, { recursive: true, force: true });
  });

  async function connectServer() {
    const { server } = await createLocusServer(tempDir);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    transport = clientTransport;

    await server.connect(serverTransport);

    client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
    await client.connect(clientTransport);
  }

  it("registers exactly six tools", async () => {
    await connectServer();
    const { tools } = await client.listTools();

    assert.equal(tools.length, 6);
    const names = tools.map((t) => t.name).sort();
    assert.deepEqual(names, ["diagnostics", "hover", "locate", "refs", "rename", "status"]);
  });

  it("dispatches locate tool and returns no_results", async () => {
    await connectServer();
    const result = await client.callTool({ name: "locate", arguments: { name: "MissingSymbol" } });
    const text = (result.content as Array<{ text: string }>)[0]!.text;
    assert.match(text, /status: no_results/);
  });

  it("returns error for unknown tool", async () => {
    await connectServer();
    const result = await client.callTool({ name: "nonexistent", arguments: {} });
    const text = (result.content as Array<{ text: string }>)[0]!.text;
    assert.match(text, /Unknown tool/);
    assert.equal(result.isError, true);
  });

  it("dispatches status tool successfully", async () => {
    await connectServer();
    const result = await client.callTool({ name: "status", arguments: {} });
    const text = (result.content as Array<{ text: string }>)[0]!.text;
    assert.match(text, /status: ok/);
    assert.match(text, /typescript/);
  });
});
