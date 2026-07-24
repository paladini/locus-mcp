# Frequently Asked Questions (FAQ)

Answers to common questions about Locus — an **MCP server for LSP** that gives **AI agents code intelligence** through language servers.

## What is Locus?

Locus is an open-source [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that connects AI coding agents (Cursor, Claude Code, VS Code) to [Language Server Protocol (LSP)](https://microsoft.github.io/language-server-protocol/) backends. Agents get semantic navigation — definitions, references, types, diagnostics — without raw LSP JSON-RPC in the context window.

## How is Locus different from grep or ripgrep?

Grep finds text patterns. Locus finds **symbols** — functions, classes, types — with LSP accuracy. Use `locate` for semantic lookup; use grep for string search. They complement each other.

## How does Locus compare to Serena?

Serena is **the IDE for your coding agent** — symbolic editing, refactoring, and memory. Locus is **ground truth for your coding agent** — definitions, references, types, and diagnostics only. Locus complements your host's Edit/Grep; Serena replaces more IDE duties inside MCP. See [comparison.md](./comparison.md) and [positioning.md](./positioning.md).

## Which language servers are supported?

Built-in adapters: TypeScript/JavaScript (`typescript-language-server`), Python (`pyright-langserver`), Go (`gopls`), Rust (`rust-analyzer`). Override or extend via `locus.json` or `.lsp.json`.

## Do I need language servers installed?

Yes. Run `locus check` to verify binaries on your PATH. Integration tests skip automatically when binaries are missing.

## What MCP tools does Locus expose?

Six tools: `locate`, `refs`, `hover`, `diagnostics`, `status`, `rename`. Full reference: [tools.md](./tools.md).

## Can I use Locus with Cursor or Claude Code?

Yes. Add Locus to your MCP config with `npx @locus-dev/mcp serve` and set `cwd` to your project root. See [usage.md](./usage.md) for Cursor, Codex, and Claude Code setup.

## What config files does Locus read?

In order of discovery (walks up from cwd):

1. `locus.toml` — project root and warm languages
2. `locus.json` — full server definitions
3. `.lsp.json` — Claude/Open Plugins compatibility

## Is Locus published on npm?

Yes: `@locus-dev/mcp` (CLI + MCP server) and `@locus-dev/core` (library). Also available on GitHub Packages. See [publishing.md](./publishing.md).

## How do I contribute?

See [CONTRIBUTING.md](../CONTRIBUTING.md) and [contributing.md](./contributing.md). Run `npm test` before opening a PR.

## What license is Locus under?

MIT — see [LICENSE](../LICENSE).
