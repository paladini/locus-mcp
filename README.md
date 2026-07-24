# Locus — MCP Server for LSP Code Intelligence

[![npm version](https://img.shields.io/npm/v/@locus-dev/mcp)](https://www.npmjs.com/package/@locus-dev/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org/)
[![CI](https://github.com/paladini/locus-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/paladini/locus-mcp/actions/workflows/ci.yml)

**Agent-first MCP server for Language Server Protocol (LSP) code intelligence.**

Locus connects AI coding agents — Cursor, Codex, Claude Code, and other MCP hosts — to language servers for ground-truth semantic navigation: definitions, references, types, diagnostics, and rename preview. Six curated MCP tools, a symbol-first API, and compact line-oriented output designed for LLM context efficiency.

> Keywords: MCP server for LSP · AI agent code intelligence · semantic navigation · Cursor MCP · Claude Code LSP · `@locus-dev/mcp`

## For agent users: configure MCP, not CLI

**MCP is the product.** Your agent calls six MCP tools (`locate`, `refs`, `hover`, `diagnostics`, `status`, `rename`) — it does **not** run `locus locate` in a terminal.

The CLI is how you **set up and launch** the MCP server:

| Command | Purpose |
|---------|---------|
| `locus serve` | Starts the MCP server (stdio) — **this is what Cursor/Codex spawn** |
| `locus init` | Generate project config (one-time setup) |
| `locus check` | Verify language-server binaries |
| `locus warm` | Pre-start language servers (optional) |

**Full guide:** [docs/usage.md](docs/usage.md)

### Cursor

```json
{
  "mcpServers": {
    "locus": {
      "command": "npx",
      "args": ["-y", "@locus-dev/mcp", "serve"],
      "cwd": "/absolute/path/to/your/project"
    }
  }
}
```

### Codex

```toml
[mcp_servers.locus]
command = "npx"
args = ["-y", "@locus-dev/mcp", "serve"]
cwd = "/absolute/path/to/your/project"
```

Add to `~/.codex/config.toml` or `.codex/config.toml`. See [docs/usage.md](docs/usage.md) for step-by-step setup.

## What is Locus?

Locus is an open-source [Model Context Protocol](https://modelcontextprotocol.io) bridge between AI agents and [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) backends. Agents call high-level tools instead of raw LSP JSON-RPC, getting accurate symbol resolution with minimal context overhead.

## Why Locus?

| Capability | grep / ripgrep | Typical LSP bridges | Serena | **Locus** |
|------------|----------------|---------------------|--------|-----------|
| Semantic symbol lookup | no | partial | yes | **yes** |
| ≤6 curated MCP tools | n/a | rare | no | **yes** |
| Compact agent output | yes | rare | mixed | **yes** |
| Qualified name resolution | no | rare | yes | **yes** |
| Host adapters (hooks/skills) | n/a | no | no | **yes** (roadmap) |
| `.lsp.json` compatibility | n/a | rare | no | **yes** |

See the full [comparison guide](docs/comparison.md) vs Serena, mcp-language-server, and cclsp.

## Features

- **Six MCP tools** — `locate`, `refs`, `hover`, `diagnostics`, `status`, `rename`
- **Symbol-first navigation** — qualified names (`Foo.bar`), ambiguity detection, fuzzy fallback
- **Multi-language** — TypeScript, Python, Go, Rust (extensible via config)
- **Compact output** — `src/foo.ts:12:4: symbolName | snippet`
- **CLI** — `init`, `check`, `warm`, `serve`
- **Config discovery** — `locus.toml`, `locus.json`, `.lsp.json`

## Quick start

1. **Configure MCP** in your agent host — see [docs/usage.md](docs/usage.md) (Cursor, Codex, Claude Code)
2. **One-time project setup:**

```bash
npx locus init    # generate locus.toml + locus.json
npx locus check   # verify language-server binaries
npx locus warm    # optional: pre-start servers
```

Your MCP host spawns `locus serve` automatically. You do not run it manually during agent sessions.

### Prerequisites

- **Node.js 22+**
- Language servers on your `PATH` (see [Getting Started](docs/getting-started.md#installing-language-servers))

## Tools

| Tool | Purpose |
|------|---------|
| [`locate`](docs/tools.md#locate) | Find symbol by name or document overview |
| [`refs`](docs/tools.md#refs) | References / implementations |
| [`hover`](docs/tools.md#hover) | Type info and docs |
| [`diagnostics`](docs/tools.md#diagnostics) | File or workspace diagnostics |
| [`status`](docs/tools.md#status) | Server readiness and missing binaries |
| [`rename`](docs/tools.md#rename) | Preview rename (dry-run default) |

Full examples: [docs/tools.md](docs/tools.md)

## Configuration

Locus discovers config by walking up from the working directory:

1. `locus.toml` — project root and warm languages
2. `locus.json` — full server definitions
3. `.lsp.json` — Claude/Open Plugins compatibility

Example `locus.json`:

```json
{
  "root": ".",
  "warm": ["typescript", "python"],
  "servers": []
}
```

Built-in servers: TypeScript/JS (`typescript-language-server`), Python (`pyright-langserver`), Go (`gopls`), Rust (`rust-analyzer`).

Details: [docs/configuration.md](docs/configuration.md)

## CLI

```bash
locus serve [--cwd path]   # MCP server (stdio)
locus init [--cwd path]    # Generate locus.toml + locus.json
locus check [--cwd path]   # Verify LSP binaries
locus warm [--cwd path]    # Pre-warm language servers
```

## Output format

References and definitions use a compact line format:

```
src/foo.ts:12:4: const result = bar()
```

Hover returns markdown. Diagnostics are grouped by severity. Responses include discriminated status codes: `ok`, `no_results`, `server_starting`, `server_unavailable`, `ambiguous_symbol`, `error`.

## FAQ

**How is Locus different from grep?** Grep finds text; Locus finds symbols via LSP.

**Which hosts are supported?** Any MCP host — Cursor, Claude Code, VS Code, and others.

**Where are packages published?** npm (`@locus-dev/mcp`, `@locus-dev/core`) and GitHub Packages.

More answers: [docs/faq.md](docs/faq.md)

## Documentation

| Guide | Description |
|-------|-------------|
| [**Usage (MCP-first)**](docs/usage.md) | **Primary guide** — MCP vs CLI, host setup, agent workflows |
| [Getting Started](docs/getting-started.md) | Install, prerequisites, first MCP setup |
| [Configuration](docs/configuration.md) | locus.toml, .lsp.json, language servers |
| [Tools](docs/tools.md) | All six MCP tools with examples |
| [FAQ](docs/faq.md) | Common questions (SEO/GEO friendly) |
| [Comparison](docs/comparison.md) | Locus vs Serena vs alternatives |
| [Contributing](docs/contributing.md) | Dev setup and test commands |
| [Publishing](docs/publishing.md) | Maintainer release guide |
| [Design notes](docs/design.md) | Architecture overview |

## Monorepo structure

```
packages/core/      @locus-dev/core — LSP client, registry, symbols, format
packages/mcp/       @locus-dev/mcp — MCP server + CLI
packages/adapters/  Cursor hooks + Claude skill (stubs in v0.1)
evals/              Evaluation fixtures
docs/               User and contributor guides
```

## Development

```bash
npm install
npm run build
npm run typecheck
npm test
```

See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/contributing.md](docs/contributing.md).

## License

[MIT](LICENSE)
