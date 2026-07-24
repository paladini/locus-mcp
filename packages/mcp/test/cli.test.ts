import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runCli } from "../src/cli.js";

describe("cli init", () => {
  it("creates config files in new directory", async () => {
    const dir = join(tmpdir(), `locus-cli-init-${Date.now()}`);
    try {
      await runCli(["init", "--cwd", dir]);
      const { existsSync } = await import("node:fs");
      assert.ok(existsSync(join(dir, "locus.toml")));
      assert.ok(existsSync(join(dir, "locus.json")));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
