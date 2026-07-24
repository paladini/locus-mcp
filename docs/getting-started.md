# Getting Started

Locus is an agent-first MCP server that exposes language-server intelligence through six focused tools. This guide covers installation, prerequisites, and your first MCP setup.

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 22+ | Required for the MCP server and CLI |
| npm | 10+ | Bundled with Node.js |
| Language servers | Per language | See [Configuration](./configuration.md#language-servers) |

### Installing language servers

Locus ships with built-in configs for common languages. Install the servers you need:

```bash
# TypeScript / JavaScript
npm install -g typescript-language-server typescript

# Python
pip install pyright

# Go
go install golang.org/x/tools/gopls@latest

# Rust
rustup component add rust-analyzer
```

Verify installations with:

```bash
npx locus check
```

## Installation

### From source (development)

```bash
git clone https://github.com/paladini/locus-mcp.git
cd locus
npm install
npm run build
```

Use the local CLI:

```bash
node packages/mcp/dist/bin.js --help
```

### From npm (when published)

```bash
npm install -g @locus-dev/mcp
```

## Initialize a project

From your project root:

```bash
npx locus init
```

This creates `locus.toml` and `locus.json` with detected languages and default server entries.

## First MCP setup

### Cursor

Add to `.cursor/mcp.json` in your project (or global Cursor MCP settings):

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

For local development:

```json
{
  "mcpServers": {
    "locus": {
      "command": "node",
      "args": ["packages/mcp/dist/bin.js", "serve"],
      "cwd": "/absolute/path/to/locus/repo"
    }
  }
}
```

Restart Cursor (or reload MCP servers) after saving the config.

### Claude Code

Add the same block to your Claude Code MCP settings. Set `cwd` to the project you want Locus to analyze.

## Warm-up and smoke test

Pre-warm language servers before heavy agent sessions:

```bash
npx locus warm
```

Quick sanity check:

```bash
npx locus check    # binaries installed?
npx locus warm     # servers start?
```

In your agent, call the `status` tool to confirm readiness before using `locate`, `refs`, or `hover`.

## Next steps

- [Configuration](./configuration.md) — customize `locus.toml`, `.lsp.json` compat, server overrides
- [Tools reference](./tools.md) — all six MCP tools with examples
- [Contributing](./contributing.md) — development setup and test commands
