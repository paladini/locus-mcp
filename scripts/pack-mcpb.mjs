#!/usr/bin/env node
/**
 * Pack Locus MCP as a Claude Desktop Extension (.mcpb bundle).
 * Run: npm run pack:mcpb
 */

import { cp, mkdir, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const staging = join(root, ".mcpb-staging");
const output = join(root, "locus-mcp.mcpb");
const mcpDist = join(root, "packages", "mcp", "dist");

async function main() {
  console.log("Packing locus-mcp MCPB bundle...");

  await rm(staging, { recursive: true, force: true });
  await mkdir(staging, { recursive: true });

  await cp(mcpDist, join(staging, "dist"), { recursive: true });
  await cp(join(root, "mcpb", "manifest.json"), join(staging, "manifest.json"));

  console.log("  Running mcpb pack...");
  execSync(`npx --yes @anthropic-ai/mcpb@latest pack "${staging}" "${output}"`, {
    cwd: root,
    stdio: "inherit",
  });

  await rm(staging, { recursive: true, force: true });
  console.log(`  Created: ${output}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
