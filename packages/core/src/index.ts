/**
 * Core LSP client, registry, and symbol utilities for {@link https://jsr.io/@paladini/locus-mcp | Locus MCP}.
 *
 * **Runtimes:** Node.js 22+ (npm) · Deno/Bun via JSR (`@paladini/locus-core`).
 *
 * @packageDocumentation
 */
export * from "./lsp-client/types.js";
export * from "./lsp-client/connection.js";
export * from "./lsp-client/client.js";
export * from "./lsp-client/manager.js";
export * from "./registry/registry.js";
export * from "./registry/builtins.js";
export * from "./symbol-layer/resolver.js";
export * from "./format/format.js";
export * from "./config/config.js";
