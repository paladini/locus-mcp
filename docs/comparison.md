# Locus vs Alternatives

A practical comparison for teams choosing an **MCP + LSP code intelligence** stack for AI agents.

## Summary

| | **Locus** | **Serena** | **mcp-language-server** | **cclsp** |
|---|-----------|------------|-------------------------|-----------|
| Primary goal | Agent-first semantic navigation | Symbolic editing for agents | Generic LSP bridge | Claude Code LSP plugin |
| MCP tools | 6 curated tools | Many tools | Variable / generic | Host-specific |
| Symbol-first API | Yes | Yes | Partial | Yes |
| Compact LLM output | Yes (line format) | Mixed | Often verbose JSON | Mixed |
| Host adapters | Cursor hooks + Claude skill (roadmap) | Limited | MCP-only | Claude Code |
| Config formats | locus.toml, locus.json, .lsp.json | Project-specific | Varies | cclsp config |
| npm package | `@locus-dev/mcp` | Varies | Community packages | N/A |
| License | MIT | Check upstream | Varies | Check upstream |

## Locus

**Best for:** Teams that want a **minimal MCP surface** with predictable, compact responses for LLM context efficiency.

**Strengths:**

- Six well-documented tools (`locate`, `refs`, `hover`, `diagnostics`, `status`, `rename`)
- Symbol resolver with qualified names and ambiguity handling
- `.lsp.json` compatibility for Claude/Open Plugins projects
- CLI for init, check, warm, serve
- Dual publish to npm and GitHub Packages

**Trade-offs:**

- Smaller tool surface by design — not a full LSP passthrough
- Host-side file edits for rename apply (preview by default)

## Serena

**Best for:** Projects already standardized on Serena's workflow and broader editing primitives.

**Compared to Locus:** Serena typically exposes more tools and editing capabilities. Locus optimizes for **navigation and diagnostics** with strict tool count limits.

## mcp-language-server

**Best for:** Experimentation with generic LSP-over-MCP bridges.

**Compared to Locus:** Generic bridges often expose raw LSP methods or large JSON payloads. Locus adds a **symbol layer**, formatting, and status codes tuned for agents.

## cclsp

**Best for:** Claude Code users wanting a dedicated LSP integration without MCP.

**Compared to Locus:** cclsp is host-native; Locus is **MCP-native** and works across Cursor, Claude Code, VS Code, and other MCP hosts.

## When to choose Locus

Choose Locus when you:

- Run AI agents in **Cursor**, **Claude Code**, or other MCP hosts
- Want **ground-truth LSP semantics** without managing language servers in the agent loop
- Prefer **grep + Locus** over grep alone for refactors and navigation
- Need **compact tool output** to preserve context window for reasoning

## When to combine tools

| Task | Tool |
|------|------|
| Find symbol definition | Locus `locate` |
| Find all references | Locus `refs` |
| Search string / regex | grep / ripgrep |
| Type info at cursor | Locus `hover` |
| Compiler errors | Locus `diagnostics` |
| Rename preview | Locus `rename` |

## See also

- [FAQ](./faq.md)
- [Getting started](./getting-started.md)
- [Tools reference](./tools.md)
