# Locus Positioning

What Locus is, what it is not, and when to choose it over alternatives.

## What Locus is

Locus is an MCP server that forwards a subset of LSP capabilities to AI coding agents. It exposes six tools — `locate`, `refs`, `hover`, `diagnostics`, `status`, and `rename` — and returns compact, line-oriented text instead of raw LSP JSON.

Install with `npx @locus-dev/mcp`. The host spawns `serve`; the agent calls MCP tools during sessions.

## Scope

Locus handles navigation and diagnostics only. It does not edit files, run refactors, or store agent memory. Those jobs belong to your MCP host (Edit, Grep, terminal) or to tools like Serena that expose symbolic editing over MCP.

The narrow scope is intentional: fewer tools to document and select, smaller tool definitions in context, and no overlap with hosts that already edit well.

Built-in language adapters: TypeScript/JavaScript, Python, Go, Rust. Extend via `locus.json` or `.lsp.json`. Serena ships adapters for many more languages out of the box.

## The problem it addresses

Agents often navigate code by reading entire files and grepping strings. That approach:

1. Uses context on irrelevant lines.
2. Misses overloads, re-exports, and import aliases.
3. Guesses types instead of asking the language server.

Locus gives agents the same symbol resolution, references, hover types, and diagnostics that IDEs use — through MCP, on demand.

## Who uses what

| Role | Responsibility |
|------|----------------|
| Human | Install Node.js, language servers, and MCP config once per project |
| AI agent | Call `locate`, `refs`, `hover`, `diagnostics`, `status`, `rename` during sessions |
| MCP host | Edit files, run terminals, grep — the agent's primary workspace |

## Locus vs Serena

Both connect agents to LSP. They differ in scope and install path.

| | Serena | Locus |
|---|--------|-------|
| Install | `uv tool install serena-agent` (Python) | `npx @locus-dev/mcp` (Node.js) |
| MCP tools | Many (find, edit, refactor, memory, …) | Six (navigation + diagnostics) |
| Symbolic editing | Yes (`replace_symbol_body`, etc.) | No — use host Edit |
| Agent memory | Yes | No |
| Best fit | One MCP stack for editing + semantics | Host already edits well; need LSP navigation |

Serena can be more token-efficient for large symbolic refactors — one `replace_symbol_body` call versus many host-side edits. Choose Serena when you want refactoring and memory inside MCP. Choose Locus when your host handles edits and you want a thin LSP layer.

Running both at full tool surface is usually redundant. Pick based on whether you need navigation-only or full symbolic editing.

## Locus vs generic LSP bridges

Projects like **mcp-language-server** expose LSP over MCP with variable or raw method surfaces. That flexibility can mean large JSON payloads and unpredictable tool catalogs.

Locus adds a symbol layer: qualified names, fuzzy fallback, status codes (`ok`, `ambiguous_symbol`, `server_starting`, …), and line output agents can scan quickly.

Use a generic bridge when you need passthrough access to uncommon LSP methods. Use Locus when you want a fixed six-tool contract tuned for agents.

## Locus vs native LSP in the host

Cursor, VS Code, and Claude Code embed language intelligence for humans in the UI. Agents do not automatically get that — they use whatever MCP tools the host exposes (often Read, Grep, Edit, Shell).

Locus is an explicit MCP server so agents can request LSP results on demand, in a format tuned for LLMs, with portable config (`locus.toml`, `.lsp.json`).

Skip Locus if your host already exposes equivalent semantic MCP tools with compact output. Add Locus when agents still grep and read blindly despite a capable editor underneath.

## Locus vs grep

Grep remains essential for logs, comments, config keys, and string literals. Locus does not replace ripgrep.

| Task | Tool |
|------|------|
| Find symbol definition | Locus `locate` |
| Find all references | Locus `refs` |
| Search string / regex across repo | Host Grep |
| Type at a position | Locus `hover` |
| Compiler errors before edit | Locus `diagnostics` |
| Rename impact preview | Locus `rename` (apply via host edits) |

Use grep and Locus together, not one instead of the other.

## Decision checklist

Choose **Locus** when:

- Your MCP host already handles edits, terminal, and search well
- Agents waste context reading whole files or grepping for symbols
- You want six predictable MCP tools with compact output
- You need `.lsp.json` compatibility or multi-host config portability

Choose **Serena** when:

- You want symbolic editing and refactoring inside MCP
- You need agent memory across long sessions
- You prefer one broad toolkit over host-native edits

Choose **grep only** when:

- Tasks are string search, config trawling, or non-code files
- No language server exists for the language

Choose **generic LSP bridge** when:

- You need raw or uncommon LSP methods not covered by Locus tools

## See also

- [comparison.md](./comparison.md) — feature table vs Serena, mcp-language-server, cclsp
- [usage.md](./usage.md) — MCP setup for Cursor, Codex, Claude Code
- [faq.md](./faq.md) — common questions
