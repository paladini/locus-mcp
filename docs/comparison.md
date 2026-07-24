# Locus vs Alternatives

A practical comparison for teams choosing an **MCP + LSP code intelligence** stack for AI agents.

## Summary

| | **Locus** | **Serena** | **mcp-language-server** | **cclsp** |
|---|-----------|------------|-------------------------|-----------|
| Tagline | Ground truth for your coding agent | The IDE for your coding agent | Generic LSP bridge | Claude Code LSP plugin |
| Primary goal | Semantic navigation layer | Full agent IDE (edit + refactor + memory) | Generic LSP-over-MCP | Host-native LSP for Claude Code |
| End user | AI agent (human installs) | AI agent (human installs) | AI agent / experimenter | Claude Code user |
| MCP tools | **6 curated tools** | Many (find, edit, refactor, memory, …) | Variable / generic | Host-specific |
| Symbolic editing | **No** — use host Edit | Yes (`replace_symbol_body`, etc.) | Depends on bridge | Limited |
| Agent memory | **No** | Yes | No | No |
| Symbol-first API | Yes | Yes | Partial | Yes |
| Compact LLM output | Yes (line format) | Mixed | Often verbose JSON | Mixed |
| Complements host Edit/Grep | **Yes — by design** | Replaces more IDE duties | MCP-only | Claude Code only |
| Host adapters | Cursor hooks + Claude skill (roadmap) | Context profiles per host | MCP-only | Claude Code |
| Config formats | locus.toml, locus.json, .lsp.json | Project-specific | Varies | cclsp config |
| npm package | `@locus-dev/mcp` | `serena` (uv/Python) | Community packages | N/A |
| License | MIT | MIT | Varies | Check upstream |

## Locus

**Best for:** Teams whose MCP host (Cursor, Claude Code, Codex) already handles edits and search, and who want a **thin, predictable LSP navigation layer** with minimal context overhead.

**Strengths:**

- Six well-documented tools (`locate`, `refs`, `hover`, `diagnostics`, `status`, `rename`)
- Symbol resolver with qualified names and ambiguity handling
- Compact line-oriented output (`src/foo.ts:12:4: symbol | snippet`)
- `.lsp.json` compatibility for Claude/Open Plugins projects
- CLI for init, check, warm, serve
- Dual publish to npm and GitHub Packages

**Trade-offs:**

- **No symbolic editing** — agents apply changes through host Edit tools
- **No agent memory** — no long-lived project knowledge store
- Smaller tool surface by design — not a full LSP passthrough
- Rename is preview-only by default; host applies the patch

**Positioning:** Locus complements grep and host tools; it does not try to be the agent's IDE.

## Serena

**Best for:** Teams that want **IDE-grade editing, refactoring, and memory** inside MCP — a broad toolkit that replaces more of what a human IDE would do for the agent.

**Strengths:**

- Rich symbolic editing (`find_symbol`, `replace_symbol_body`, `insert_after_symbol`, …)
- Agent memory for long-lived workflows
- Context profiles tuned per host (Claude Code, IDE assistants, etc.)
- 30+ languages via LSP backends
- Large community and active maintenance (Oraios)

**Trade-offs:**

- Many tools — higher context cost and overlap with capable hosts
- Overlaps with Cursor/Claude Code native edit tools unless configured carefully
- Different install path (Python/`uv`) vs Locus (Node.js/npm)

**Compared to Locus:** Serena owns **"The IDE for your coding agent."** Locus owns **"Ground truth for your coding agent."** If your host already edits well, Locus adds semantics without a second IDE. If you want symbolic edits and memory in one MCP stack, Serena is the closer fit.

**They are complementary categories, not drop-in substitutes.** Running both at full tool surface is usually redundant; pick based on whether you need navigation-only or full IDE replacement.

## mcp-language-server

**Best for:** Experimentation with generic LSP-over-MCP bridges or access to uncommon LSP methods.

**Compared to Locus:** Generic bridges often expose raw LSP methods or large JSON payloads. Locus adds a **symbol layer**, formatting, status codes, and a fixed six-tool contract tuned for agents.

## cclsp

**Best for:** Claude Code users wanting a dedicated LSP integration without MCP.

**Compared to Locus:** cclsp is host-native; Locus is **MCP-native** and works across Cursor, Claude Code, Codex, VS Code, and other MCP hosts with the same config.

## When to choose Locus

Choose Locus when you:

- Run AI agents in **Cursor**, **Claude Code**, **Codex**, or other MCP hosts that already edit and grep well
- Want **ground-truth LSP semantics** without managing raw LSP JSON-RPC in the agent loop
- Prefer **grep + Locus** over grep alone for refactors and navigation
- Need **compact tool output** to preserve context window for reasoning
- Do **not** need symbolic editing or agent memory from MCP

## When to choose Serena

Choose Serena when you:

- Want **symbolic editing and refactoring** as MCP tools
- Need **agent memory** across sessions
- Prefer one broad IDE toolkit over relying on host-native edits

## When to combine tools

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

- [Positioning deep dive](./positioning.md)
- [FAQ](./faq.md)
- [Getting started](./getting-started.md)
- [Tools reference](./tools.md)
