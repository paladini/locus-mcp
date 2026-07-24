# Getting Started

Locus is an **MCP server** that exposes language-server intelligence through six focused tools. Your AI agent calls those tools — not the CLI. This guide gets you from zero to a working MCP setup.

> **Start here for the full picture:** [Usage Guide (MCP-first)](./usage.md)

## 1. Configure MCP in your agent host

Pick your host and add Locus. The host spawns `locus serve` over stdio; the agent then calls MCP tools like `locate` and `refs`.

| Host | Config file | Guide section |
|------|-------------|---------------|
| **Cursor** | `.cursor/mcp.json` | [usage.md — Cursor](./usage.md#setup-cursor) |
| **Codex** | `~/.codex/config.toml` or `.codex/config.toml` | [usage.md — Codex](./usage.md#setup-codex) |
| **Claude Code** | MCP settings | [usage.md — Claude Code](./usage.md#setup-claude-code-brief) |

**Cursor (published package):**

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

**Codex:**

```toml
[mcp_servers.locus]
command = "npx"
args = ["-y", "@locus-dev/mcp", "serve"]
cwd = "/absolute/path/to/your/project"
```

Reload MCP servers after saving config.

## 2. One-time project setup (CLI)

Run these in your **project root** — not in agent terminals during normal use:

```bash
npx locus init    # create locus.toml + locus.json
npx locus check   # verify language-server binaries
npx locus warm    # optional: pre-start servers before heavy sessions
```

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 22+ | Required for the MCP server and CLI |
| npm | 10+ | Bundled with Node.js |
| Language servers | Per language | See below |

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

Verify installations:

```bash
npx locus check
```

## Installation options

### From npm (recommended)

```bash
npm install -g @locus-dev/mcp
# or run without install:
npx @locus-dev/mcp --help
```

### From source (development)

```bash
git clone https://github.com/paladini/locus-mcp.git
cd locus-mcp
npm install
npm run build
```

Local MCP config uses `node packages/mcp/dist/bin.js serve` — see [usage.md](./usage.md).

## Verify everything works

1. **CLI check:** `npx locus check` — all needed binaries found?
2. **Optional warm-up:** `npx locus warm` — pre-start language servers
3. **Agent smoke test:** In your agent, ask it to call the Locus `status` MCP tool

Example prompt:

> Call the Locus MCP tool `status` and tell me which language servers are ready.

If `status` returns readiness info, MCP is wired correctly. The agent should use tools like `locate` and `refs` — not shell commands.

## Next steps

- [Usage Guide](./usage.md) — MCP vs CLI, agent workflows, troubleshooting
- [Configuration](./configuration.md) — customize `locus.toml`, `.lsp.json`, server overrides
- [Tools reference](./tools.md) — all six MCP tools with examples
- [Contributing](./contributing.md) — development setup and test commands
