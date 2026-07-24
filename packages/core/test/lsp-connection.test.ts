import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { resolve, join } from "node:path";
import { LspConnection, filePathToUri, uriToFilePath } from "../src/lsp-client/connection.js";

const ROOT = resolve("/proj");

describe("LspConnection helpers", () => {
  it("filePathToUri produces valid file URIs", () => {
    const uri = filePathToUri(join(ROOT, "src", "index.ts"));
    assert.match(uri, /^file:\/\//);
  });

  it("uriToFilePath round-trips paths with spaces", () => {
    const path = resolve("/tmp/my project/app.ts");
    const uri = filePathToUri(path);
    const back = uriToFilePath(uri);
    assert.ok(back.includes("app.ts"));
  });

  it("handles Windows-style drive paths", () => {
    const uri = filePathToUri("C:/Users/test/project/file.ts");
    assert.match(uri, /^file:\/\//);
    const back = uriToFilePath(uri);
    assert.ok(back.includes("file.ts"));
  });
});

describe("JSON-RPC message framing", () => {
  it("parses Content-Length framed messages", () => {
    const messages: unknown[] = [];
    const pending = new Map<number, { resolve: (v: unknown) => void }>();

    const handler = {
      onNotification: (method: string, params: unknown) => {
        messages.push({ method, params });
      },
    };

    let buffer = "";
    let contentLength = -1;

    function feed(data: string) {
      buffer += data;
      while (true) {
        if (contentLength < 0) {
          const headerEnd = buffer.indexOf("\r\n\r\n");
          if (headerEnd === -1) return;
          const match = buffer.slice(0, headerEnd).match(/Content-Length:\s*(\d+)/i);
          if (!match) {
            buffer = buffer.slice(headerEnd + 4);
            continue;
          }
          contentLength = Number.parseInt(match[1]!, 10);
          buffer = buffer.slice(headerEnd + 4);
        }
        if (buffer.length < contentLength) return;
        const body = buffer.slice(0, contentLength);
        buffer = buffer.slice(contentLength);
        contentLength = -1;
        const message = JSON.parse(body) as { id?: number; method?: string; result?: unknown; params?: unknown };
        if (message.method && message.id === undefined) {
          handler.onNotification(message.method, message.params);
        } else if (message.id !== undefined) {
          pending.get(message.id)?.resolve(message.result);
        }
      }
    }

    const requestBody = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
    feed(`Content-Length: ${Buffer.byteLength(requestBody)}\r\n\r\n${requestBody}`);

    const responseBody = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      result: { serverInfo: { name: "test" } },
    });
    feed(`Content-Length: ${Buffer.byteLength(responseBody)}\r\n\r\n${responseBody}`);

    const notifyBody = JSON.stringify({
      jsonrpc: "2.0",
      method: "textDocument/publishDiagnostics",
      params: { uri: filePathToUri(join(ROOT, "a.ts")), diagnostics: [] },
    });
    feed(`Content-Length: ${Buffer.byteLength(notifyBody)}\r\n\r\n${notifyBody}`);

    assert.equal(messages.length, 1);
    assert.equal((messages[0] as { method: string }).method, "textDocument/publishDiagnostics");
  });

  it("serializes outbound messages with Content-Length header", () => {
    const chunks: string[] = [];
    const fakeStdin = { write: (data: string) => chunks.push(data) };

    const message = { jsonrpc: "2.0", id: 1, method: "shutdown", params: {} };
    const body = JSON.stringify(message);
    const header = `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n`;
    fakeStdin.write(header + body);

    assert.match(chunks[0]!, /Content-Length: \d+/);
    assert.ok(chunks[0]!.includes('"shutdown"'));
  });
});

describe("LspConnection error paths", () => {
  it("request throws when process is not running", async () => {
    const connection = new LspConnection({
      command: "noop",
      cwd: ROOT,
    });

    await assert.rejects(() => connection.request("initialize", {}), /not running/);
  });

  it("notify throws when process is not running", () => {
    const connection = new LspConnection({
      command: "noop",
      cwd: ROOT,
    });

    assert.throws(() => connection.notify("initialized", {}), /not running/);
  });
});
