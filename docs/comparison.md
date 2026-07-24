# Locus vs Alternatives

A factual comparison for choosing an MCP + LSP stack for AI agents.

## At a glance

| | **Locus** | **Serena** | **mcp-language-server** | **cclsp** |
|---|-----------|------------|-------------------------|-----------|
| Primary goal | LSP navigation for agents | Full agent IDE (edit + refactor + memory) | Generic LSP-over-MCP | Host-native LSP for Claude Code |
| Install | `npx @locus-dev/mcp` (Node.js 22+) | `uv tool install serena-agent` (Python) | Community packages | Host plugin |
| MCP tools | 6 fixed tools | Many (find, edit, refactor, memory, …) | Variable / generic | Host-specific |
| Symbolic editing | No — use host Edit | Yes | Depends on bridge | Limited |
| Agent memory | No | Yes | No | No |
| Compact output | Line-oriented text | Mixed | Often verbose JSON | Mixed |
| Complements host Edit/Grep | Yes | Partially — overlaps with host | MCP-only | Claude Code only |
| Built-in languages | 4 (TS/JS, Python, Go, Rust) | 40+ via LSP backends | Varies | Varies |
| Config | locus.toml, locus.json, .lsp.json | Project-specific | Varies | cclsp config |
| License | MIT | MIT | Varies | Check upstream |

## Locus

**Fits when:** Your MCP host (Cursor, Claude Code, Codex) already handles edits and search, and you want a thin LSP navigation layer.

**Provides:**

- Six documented tools: `locate`, `refs`, `hover`, `diagnostics`, `status`, `rename`
- Symbol resolver with qualified names and ambiguity handling
- Compact line output (`src/foo.ts:12:4: symbol | snippet`)
- `.lsp.json` compatibility
- CLI: `init`, `check`, `warm`, `serve`

**Does not provide:**

- Symbolic editing or refactoring execution
- Agent memory
- Passthrough to arbitrary LSP methods
- Rename apply (preview only; host applies the patch)

## Serena

**Fits when:** You want editing, refactoring, and memory inside MCP — a broader toolkit that covers more of what an IDE would do for the agent.

**Provides:**

- Symbolic editing (`find_symbol`, `replace_symbol_body`, `insert_after_symbol`, …)
- Agent memory for long sessions
- 40+ languages via LSP backends
- Context profiles per host

**Trade-offs:**

- Larger tool surface — more overlap with capable hosts like Cursor
- Python/`uv` install path vs Node.js/npm for Locus
- Can be more token-efficient for large symbolic refactors than many host-side edits

**Compared to Locus:** Serena covers editing and memory; Locus covers navigation and diagnostics only. If your host already edits well, Locus adds semantics without a second IDE inside MCP.

## mcp-language-server

**Fits when:** You need generic LSP-over-MCP access or uncommon LSP methods.

**Compared to Locus:** Generic bridges often expose raw LSP methods or large JSON payloads. Locus adds a symbol layer, formatted output, status codes, and a fixed six-tool contract.

## cclsp

**Fits when:** You use Claude Code and want host-native LSP without a separate MCP server.

**Compared to Locus:** cclsp is host-native; Locus is MCP-native and works across Cursor, Claude Code, Codex, and other MCP hosts with the same config.

## Task routing

| Task | Tool |
|------|------|
| Find symbol definition | Locus `locate` |
| Find all references | Locus `refs` |
| Search string / regex | Host Grep / ripgrep |
| Edit a file | Host Edit / Write tools |
| Type info at cursor | Locus `hover` |
| Compiler errors | Locus `diagnostics` |
| Rename preview | Locus `rename` |
| Replace function body symbolically | Serena (or host Edit) |

## See also

- [Understanding Locus](./positioning.md)
- [FAQ](./faq.md)
- [Getting started](./getting-started.md)
- [Tools reference](./tools.md)
