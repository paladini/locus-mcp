# Frequently Asked Questions

## What is Locus?

An open-source MCP server that connects AI coding agents to language servers. Agents call six tools — `locate`, `refs`, `hover`, `diagnostics`, `status`, `rename` — for definitions, references, types, and compiler diagnostics.

## Who is the end user?

The AI agent. Humans install Node.js, language servers, and MCP config once. The agent calls MCP tools during sessions.

## How is Locus different from grep?

Grep finds text patterns. Locus finds symbols — functions, classes, types — using LSP. Use grep for strings, logs, and config keys. Use Locus when you need go-to-definition, references, or type info.

## How does Locus compare to Serena?

Both use LSP. Serena is a broader MCP toolkit: symbolic editing, refactoring, memory, and many tools. Locus is navigation and diagnostics only — six tools, meant to complement a host that already handles edits.

Serena can be better for large symbolic refactors (one `replace_symbol_body` vs many host edits) and ships with 40+ language backends. Locus is simpler to add when you only need LSP navigation. See [comparison.md](./comparison.md).

## Is Locus a lighter Serena?

Not a drop-in substitute. Locus covers a narrower scope on purpose:

| | Locus | Serena |
|---|-------|--------|
| Install | `npx @locus-dev/mcp` | `uv tool install serena-agent` |
| Tools | 6 | Many |
| Scope | Navigation + diagnostics | Edit + refactor + memory + navigation |
| Languages (built-in) | 4 | 40+ |

Choose Locus when your host already edits well. Choose Serena when you want editing and memory inside MCP.

## Which language servers are supported?

Built-in: TypeScript/JavaScript (`typescript-language-server`), Python (`pyright-langserver`), Go (`gopls`), Rust (`rust-analyzer`). Override or extend via `locus.json` or `.lsp.json`.

## Do I need language servers installed?

Yes. Run `locus check` to verify binaries on your PATH.

## What MCP tools does Locus expose?

Six: `locate`, `refs`, `hover`, `diagnostics`, `status`, `rename`. Reference: [tools.md](./tools.md).

## Can I use Locus with Cursor or Claude Code?

Yes. Add `npx @locus-dev/mcp serve` to your MCP config with `cwd` set to your project root. See [usage.md](./usage.md).

## Does the agent run CLI commands?

No. The agent calls MCP tools. The CLI (`init`, `check`, `warm`, `serve`) is for human setup and for the host to spawn the MCP server.

## What config files does Locus read?

Walks up from cwd:

1. `locus.toml` — project root and warm languages
2. `locus.json` — full server definitions
3. `.lsp.json` — Claude/Open Plugins compatibility

## Is Locus on npm?

Yes: `@locus-dev/mcp` (CLI + MCP server) and `@locus-dev/core` (library). Also on GitHub Packages. See [publishing.md](./publishing.md).

## How do I contribute?

See [CONTRIBUTING.md](../CONTRIBUTING.md) and [contributing.md](./contributing.md). Run `npm test` before opening a PR.

## What license?

MIT — see [LICENSE](../LICENSE).
