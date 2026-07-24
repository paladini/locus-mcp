import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { handleLspError, parsePosition } from "../src/tools/helpers.js";

describe("handleLspError", () => {
  it("maps server_starting message", () => {
    const result = handleLspError(new Error("server_starting"));
    assert.equal(result.status, "server_starting");
    assert.match(result.message ?? "", /still starting/);
  });

  it("maps server_unavailable message", () => {
    const result = handleLspError(new Error("server_unavailable"));
    assert.equal(result.status, "server_unavailable");
    assert.match(result.message ?? "", /locus check/);
  });

  it("maps timeout errors to server_starting", () => {
    const result = handleLspError(new Error("Request timed out after 5000ms"));
    assert.equal(result.status, "server_starting");
  });

  it("maps unknown errors to error status", () => {
    const result = handleLspError(new Error("unexpected failure"));
    assert.equal(result.status, "error");
    assert.equal(result.message, "unexpected failure");
  });

  it("handles non-Error values", () => {
    const result = handleLspError("string error");
    assert.equal(result.status, "error");
    assert.equal(result.message, "string error");
  });
});

describe("parsePosition", () => {
  it("returns undefined for empty input", () => {
    assert.equal(parsePosition(undefined), undefined);
    assert.equal(parsePosition(""), undefined);
  });

  it("parses path:line:col with 1-based coordinates", () => {
    const pos = parsePosition("src/foo.ts:10:5");
    assert.deepEqual(pos, { file: "src/foo.ts", line: 9, character: 4 });
  });

  it("returns undefined for invalid format", () => {
    assert.equal(parsePosition("not-a-position"), undefined);
    assert.equal(parsePosition("file.ts"), undefined);
    assert.equal(parsePosition("file.ts:abc:1"), undefined);
  });

  it("handles Windows-style paths with drive letter", () => {
    const pos = parsePosition("C:/proj/src/foo.ts:1:1");
    assert.equal(pos?.file, "C:/proj/src/foo.ts");
    assert.equal(pos?.line, 0);
    assert.equal(pos?.character, 0);
  });
});
