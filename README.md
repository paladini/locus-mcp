# Locus

[![npm version](https://img.shields.io/npm/v/@locus-dev/mcp)](https://www.npmjs.com/package/@locus-dev/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org/)
[![CI](https://github.com/paladini/locus-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/paladini/locus-mcp/actions/workflows/ci.yml)

Locus is an open-source [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that connects AI coding agents to [Language Server Protocol (LSP)](https://microsoft.github.io/language-server-protocol/) backends. It exposes six tools for symbol lookup, references, types, and diagnostics. Your MCP host (Cursor, Codex, Claude Code) still handles file edits, grep, and terminal commands.

The MCP server is the product. The CLI exists to initialize config, check language-server binaries, and run `serve` — which your host spawns automatically. The agent is the end user; you configure Locus once per project.

## The problem

Most agents navigate code by reading whole files and grepping text. That works for string search, but it misses what the compiler knows: which `processOrder` overload you mean, where a symbol is actually defined, or whether a patch introduces type errors.

Language servers already solve this for human developers. Locus exposes the same information to agents through a fixed set of six MCP tools with compact, line-oriented output.

## Quick start

1. Add Locus to your MCP host (configs below).
2. Run one-time project setup:

```bash
npx @locus-dev/mcp init    # generate locus.toml + locus.json
npx @locus-dev/mcp check   # verify language-server binaries
```

3. Start coding. The host spawns `npx @locus-dev/mcp serve` automatically.

**Prerequisites:** Node.js 22+ and language servers on your `PATH`. See [docs/getting-started.md](docs/getting-started.md#installing-language-servers).

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

For Claude Code and other hosts, see [docs/usage.md](docs/usage.md).

## Tools

| Tool | Description |
|------|-------------|
| [`locate`](docs/tools.md#locate) | Find a symbol by name or list symbols in a file |
| [`refs`](docs/tools.md#refs) | All references or implementations at a position |
| [`hover`](docs/tools.md#hover) | Type information and documentation |
| [`diagnostics`](docs/tools.md#diagnostics) | File or workspace errors and warnings |
| [`status`](docs/tools.md#status) | Language-server readiness and missing binaries |
| [`rename`](docs/tools.md#rename) | Preview a rename (dry-run by default; apply via host edits) |

Full reference with examples: [docs/tools.md](docs/tools.md)

## When to use Locus

- Your agent greps for function or class names instead of using go-to-definition.
- You want LSP-accurate references before a refactor.
- Your MCP host already handles edits well and you only need navigation and diagnostics.
- You want a small, predictable tool surface (six tools, compact output).

## When not to use Locus

- **String search only** — use your host's grep for logs, config keys, and comments.
- **Symbolic editing inside MCP** — Locus does not edit code. Use host Edit tools, or consider [Serena](https://github.com/oraios/serena) if you want MCP-native symbol replacement and refactoring.
- **Agent memory across sessions** — Locus has no memory store.
- **Raw LSP passthrough** — use a generic LSP bridge if you need uncommon LSP methods.

Serena and Locus both use LSP. Serena exposes more tools (symbolic editing, memory, refactoring). Locus is navigation and diagnostics only — six tools, `npx` install, meant to complement a capable host. See [docs/comparison.md](docs/comparison.md).

## Documentation

| Guide | Description |
|-------|-------------|
| [Usage](docs/usage.md) | Host setup, MCP vs CLI, agent workflows |
| [Positioning](docs/positioning.md) | Scope, trade-offs, when to choose alternatives |
| [Comparison](docs/comparison.md) | Locus vs Serena, bridges, grep |
| [FAQ](docs/faq.md) | Common questions |
| [Getting started](docs/getting-started.md) | Install, prerequisites, first setup |
| [Tools](docs/tools.md) | All six MCP tools with examples |
| [Configuration](docs/configuration.md) | locus.toml, locus.json, .lsp.json |
| [Contributing](docs/contributing.md) | Dev setup and tests |

## License

[MIT](LICENSE)
