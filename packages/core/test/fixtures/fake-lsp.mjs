/**
 * Minimal fake language server for unit tests.
 * Speaks JSON-RPC over stdin/stdout with Content-Length framing.
 */
const CRLF = "\r\n";
let buffer = "";
let contentLength = -1;

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  while (parseMessages()) {
    /* drain */
  }
});

function parseMessages() {
  if (contentLength < 0) {
    const headerEnd = buffer.indexOf(`${CRLF}${CRLF}`);
    if (headerEnd === -1) return false;

    const header = buffer.slice(0, headerEnd);
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) {
      buffer = buffer.slice(headerEnd + 4);
      return true;
    }

    contentLength = Number.parseInt(match[1], 10);
    buffer = buffer.slice(headerEnd + 4);
  }

  if (buffer.length < contentLength) return false;

  const body = buffer.slice(0, contentLength);
  buffer = buffer.slice(contentLength);
  contentLength = -1;

  try {
    handleMessage(JSON.parse(body));
  } catch {
    /* ignore malformed input in tests */
  }

  return true;
}

function handleMessage(message) {
  if (message.method && message.id === undefined) {
    return;
  }

  if (message.id === undefined) return;

  const { id, method, params } = message;
  let result = null;

  switch (method) {
    case "initialize":
      result = {
        capabilities: {},
        serverInfo: { name: "fake-lsp", version: "1.0.0" },
      };
      break;
    case "workspace/symbol":
      result = [
        {
          name: params?.query ?? "Symbol",
          kind: 12,
          location: {
            uri: "file:///proj/src/index.ts",
            range: {
              start: { line: 4, character: 2 },
              end: { line: 4, character: 10 },
            },
          },
        },
      ];
      break;
    case "textDocument/documentSymbol":
      result = [
        {
          name: "Greeter",
          kind: 5,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 5, character: 1 },
          },
          selectionRange: {
            start: { line: 0, character: 6 },
            end: { line: 0, character: 13 },
          },
        },
      ];
      break;
    case "textDocument/references":
      result = [
        {
          uri: "file:///proj/src/index.ts",
          range: {
            start: { line: 10, character: 4 },
            end: { line: 10, character: 12 },
          },
        },
      ];
      break;
    case "textDocument/implementation":
      result = [
        {
          uri: "file:///proj/src/impl.ts",
          range: {
            start: { line: 1, character: 0 },
            end: { line: 1, character: 8 },
          },
        },
      ];
      break;
    case "textDocument/hover":
      result = { contents: { kind: "markdown", value: "**string**" } };
      break;
    case "textDocument/prepareRename":
      result = {
        range: {
          start: { line: 4, character: 2 },
          end: { line: 4, character: 10 },
        },
      };
      break;
    case "textDocument/rename":
      result = {
        changes: {
          "file:///proj/src/index.ts": [
            {
              range: {
                start: { line: 4, character: 2 },
                end: { line: 4, character: 10 },
              },
              newText: params?.newName ?? "renamed",
            },
          ],
        },
      };
      break;
    case "textDocument/definition":
      result = {
        uri: "file:///proj/src/types.ts",
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 6 },
        },
      };
      break;
    case "shutdown":
      result = null;
      break;
    default:
      result = null;
  }

  send({ jsonrpc: "2.0", id, result });
}

function send(message) {
  const body = JSON.stringify(message);
  const header = `Content-Length: ${Buffer.byteLength(body, "utf8")}${CRLF}${CRLF}`;
  process.stdout.write(header + body, "utf8");
}
