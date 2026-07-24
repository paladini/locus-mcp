# Locus — MCP Server for LSP Code Intelligence

[![npm version](https://img.shields.io/npm/v/@locus-dev/mcp)](https://www.npmjs.com/package/@locus-dev/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org/)
[![CI](https://github.com/paladini/locus-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/paladini/locus-mcp/actions/workflows/ci.yml)

**Agent-first MCP server for Language Server Protocol (LSP) code intelligence.**

Locus connects AI coding agents — Cursor, Claude Code, VS Code, and other MCP hosts — to language servers for ground-truth semantic navigation: definitions, references, types, diagnostics, and rename preview. Six curated MCP tools, a symbol-first API, and compact line-oriented output designed for LLM context efficiency.

> Keywords: MCP server for LSP · AI agent code intelligence · semantic navigation · Cursor MCP · Claude Code LSP · `@locus-dev/mcp`

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

### Install from npm

```bash
npm install -g @locus-dev/mcp
# or run without install:
npx @locus-dev/mcp --help
```

### From source

```bash
git clone https://github.com/paladini/locus-mcp.git
cd locus-mcp
npm install
npm run build

# Initialize config in your project
npx locus init

# Verify language server binaries
npx locus check

# Pre-warm servers before agent sessions
npx locus warm
```

### Prerequisites

- **Node.js 22+**
- Language servers on your `PATH` (see [Getting Started](docs/getting-started.md#installing-language-servers))

## MCP configuration

### Cursor

Add to `.cursor/mcp.json`:

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

Local development:

```json
{
  "mcpServers": {
    "locus": {
      "command": "node",
      "args": ["packages/mcp/dist/bin.js", "serve"],
      "cwd": "/absolute/path/to/locus-mcp"
    }
  }
}
```

### Claude Code

Use the same MCP block in Claude Code settings. Set `cwd` to the project root you want analyzed.

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
