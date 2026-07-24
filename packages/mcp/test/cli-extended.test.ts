import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runCli } from "../src/cli.js";

describe("cli help", () => {
  it("prints help for --help flag", async () => {
    let output = "";
    const log = console.log;
    console.log = (msg: string) => {
      output += msg;
    };

    try {
      await runCli(["--help"]);
      assert.match(output, /locus serve/);
      assert.match(output, /locus init/);
    } finally {
      console.log = log;
    }
  });

  it("prints help for unknown command fallback", async () => {
    let stderr = "";
    let stdout = "";
    const error = console.error;
    const log = console.log;
    const exit = mock.method(process, "exit", () => {});

    console.error = (msg: string) => {
      stderr += msg;
    };
    console.log = (msg: string) => {
      stdout += msg;
    };

    try {
      await runCli(["not-a-command"]);
      assert.match(stderr, /Unknown command/);
      assert.match(stdout, /locus serve/);
      assert.equal(exit.mock.callCount(), 1);
    } finally {
      console.error = error;
      console.log = log;
      exit.mock.restore();
    }
  });
});

describe("cli init idempotent", () => {
  it("does not overwrite existing config files", async () => {
    const dir = join(tmpdir(), `locus-cli-idempotent-${Date.now()}`);
    try {
      await runCli(["init", "--cwd", dir]);
      await runCli(["init", "--cwd", dir]);

      const { readFileSync } = await import("node:fs");
      const toml = readFileSync(join(dir, "locus.toml"), "utf8");
      assert.match(toml, /root/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("cli check", () => {
  it("exits with code 1 when binaries missing", async () => {
    const dir = mkdtempSync(join(tmpdir(), "locus-cli-check-"));
    const exit = mock.method(process, "exit", () => {});

    try {
      await runCli(["check", "--cwd", dir]);
      assert.ok(exit.mock.callCount() >= 1);
      const code = exit.mock.calls[0]?.arguments[0];
      assert.equal(code, 1);
    } finally {
      exit.mock.restore();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("cli warm", () => {
  it("runs warm without throwing", async () => {
    const dir = mkdtempSync(join(tmpdir(), "locus-cli-warm-"));
    try {
      await runCli(["init", "--cwd", dir]);
      await runCli(["warm", "--cwd", dir]);
    } finally {
      await new Promise((r) => setTimeout(r, 100));
      rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    }
  });
});
