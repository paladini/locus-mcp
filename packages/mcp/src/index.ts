/**
 * MCP server and CLI for LSP-backed code intelligence in AI agents.
 *
 * **Runtimes:** Node.js 22+ (npm) · Deno/Bun via JSR (`@paladini/locus-mcp`).
 *
 * @packageDocumentation
 */
export { createLocusServer, type LocusServerContext } from "./server.js";
export { runCli } from "./cli.js";
