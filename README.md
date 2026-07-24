# Locus

[![npm version](https://img.shields.io/npm/v/@locus-dev/mcp)](https://www.npmjs.com/package/@locus-dev/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org/)

**Agent-first MCP server for LSP-based code intelligence.**

Locus gives AI agents ground-truth semantic navigation — definitions, references, types, and diagnostics — through a minimal surface of six MCP tools, a symbol-first API, and compact output designed for LLM context efficiency.

## Why Locus?

| Capability | Typical LSP bridges | Serena | Locus |
|------------|---------------------|--------|-------|
| ≤6 curated tools | rare | no | **yes** |
| Symbol-first navigation | rare | yes | **yes** |
| Compact agent output | rare | mixed | **yes** |
| Host adapters (hooks/skills) | no | no | **yes** (v0.2) |

## Quick start

```bash
git clone https://github.com/paladini/locus-mcp.git
cd locus
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
      "cwd": "/absolute/path/to/locus"
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

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/getting-started.md) | Install, prerequisites, first MCP setup |
| [Configuration](docs/configuration.md) | locus.toml, .lsp.json, language servers |
| [Tools](docs/tools.md) | All six MCP tools with examples |
| [Contributing](docs/contributing.md) | Dev setup and test commands |
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
