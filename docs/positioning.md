# Locus Positioning

How Locus fits in the AI coding agent ecosystem — what it is, what it is not, and when to choose it over alternatives.

## One-line positioning

**Locus is ground truth for your coding agent — without the weight of a full IDE toolkit: lightweight LSP intelligence through six curated MCP tools (definitions, references, types, diagnostics) that grep and file reads cannot provide.**

**Taglines:**

- Ground truth for your coding agent — without the weight of a full IDE toolkit
- Lightweight LSP intelligence for AI agents
- 6 tools. Symbol-first. No IDE replacement.

## The problem Locus solves

Modern AI agents navigate code through a blunt toolkit:

1. **Read entire files** — expensive in context and often irrelevant.
2. **Grep for strings** — fast but semantically blind; misses overloads, imports, and re-exports.
3. **Guess types** — leads to plausible but wrong patches.

Human developers solved this decades ago with **language servers** (LSP): go-to-definition, find references, hover types, diagnostics. Locus exposes that ground truth to agents through a **minimal MCP surface** — six tools, compact output, predictable behavior.

Locus does **not** try to be the agent's IDE. It does **not** symbolic-edit, refactor bodies, or maintain long-lived memory. Those are different products with different trade-offs (see Serena below).

## Lightweight + efficiency as core differentiators

Locus is deliberately **lighter** than full MCP IDE bridges like Serena. That is a feature, not a missing feature list.

### Where Locus is lighter

| Dimension | Locus advantage |
|-----------|-----------------|
| **Install** | `npx @locus-dev/mcp` vs Serena's `uv tool install serena-agent` + Python ecosystem |
| **Tool surface** | 6 curated MCP tools vs Serena's many tools (edit, memory, shell, refactor, …) |
| **Scope** | Navigation + diagnostics only — no IDE replacement, no symbolic edit toolkit |
| **Agent cognitive load** | Smaller tool menu → faster tool selection, less context pollution from tool definitions |
| **Runtime** | Lean TypeScript MCP bridge vs full Python agent toolkit |

### What "lightweight" means — and what it does not mean

**Means:** Locus is lighter to **adopt, configure, and operate daily**. One npm package, six predictable tools, no second IDE inside your agent loop.

**Does not mean:** Locus always uses fewer tokens than Serena for every task. Serena's symbolic edit tools can be **more token-efficient** for large refactors — one `replace_symbol_body` call vs many host-side edits. Serena also ships with **40+ language** backends; Locus ships **four built-ins** (TypeScript/JavaScript, Python, Go, Rust), extensible via config.

Position honestly: choose Locus for **efficient daily navigation** when your host already handles edits; choose Serena when you want **one heavy MCP stack** for symbolic editing and memory.

## End users are agents

Following the Serena-style framing with a deliberate twist:

| Role | Responsibility |
|------|----------------|
| **Human** | Install Node.js, language servers, and MCP config once per project |
| **AI agent** | Call `locate`, `refs`, `hover`, `diagnostics`, `status`, `rename` during sessions |
| **MCP host** | Edit files, run terminals, grep — the agent's primary workspace |

Marketing and docs should speak **to what agents gain**, not only to human operators setting up config. Humans are the installer; agents are the consumer.

## Locus vs Serena

Both use LSP. Both target MCP hosts. The positioning diverges sharply.

| Dimension | **Serena** | **Locus** |
|-----------|------------|-----------|
| Tagline | "The IDE for your coding agent" | "Ground truth for your coding agent" |
| Scope | Retrieval **and** editing, refactoring, memory | **Navigation and diagnostics only** |
| Tool surface | Many tools (find symbol, replace body, insert after symbol, …) | **Six curated tools** |
| Relationship to host | Replaces more IDE responsibilities inside the agent | **Complements** host Edit/Grep/terminal |
| Memory / project knowledge | Yes (long-lived agent workflows) | **No** |
| Output philosophy | Feature-rich toolkit | **Compact, line-oriented, context-efficient** |
| Best when | You want one MCP stack to cover editing + semantics | You already trust Cursor/Claude Code/Codex for edits and want a thin LSP layer |

**They are complementary, not clones.** A team can run Serena for symbolic edits *or* Locus for navigation — rarely both at full surface in the same session (tool overlap and context cost). Choose based on whether your host already covers editing well.

Locus is honest about what it lacks: no `replace_symbol_body`, no agent memory, no 40-language marketing claim without your servers installed. What it delivers is **reliable LSP semantics with minimal MCP ceremony**.

## Locus vs generic LSP bridges

Projects like **mcp-language-server** expose LSP over MCP with variable or raw method surfaces. That flexibility costs agents:

- Large JSON payloads in context
- Unpredictable tool catalogs
- No symbol-first resolver or ambiguity handling

Locus adds a **symbol layer** on top of LSP: qualified names, fuzzy fallback, discriminated status codes (`ok`, `ambiguous_symbol`, `server_starting`, …), and a line format agents can scan quickly.

**Choose a generic bridge** when you need passthrough access to obscure LSP methods. **Choose Locus** when you want opinionated, agent-tuned navigation with a fixed six-tool contract.

## Locus vs native LSP in the host

Cursor, VS Code, and Claude Code already embed language intelligence for **humans** clicking in the UI. Agents do not automatically inherit that — they get whatever MCP tools the host exposes (often Read, Grep, Edit, Shell).

Locus is an **explicit MCP server** so agents can request LSP results on demand, in a format tuned for LLMs, across hosts that share the same config (`locus.toml`, `.lsp.json`).

**Skip Locus** if your host already exposes equivalent semantic MCP tools with compact output. **Add Locus** when agents are still grep-and-read blind despite a capable editor underneath.

## Locus vs grep-only

Grep remains essential for logs, comments, config keys, and string literals. Locus does not replace ripgrep.

| Task | Tool |
|------|------|
| Find symbol definition | Locus `locate` |
| Find all references | Locus `refs` |
| Search string / regex across repo | Host Grep |
| Type at a position | Locus `hover` |
| Compiler errors before edit | Locus `diagnostics` |
| Rename impact preview | Locus `rename` (apply via host edits) |

Position Locus as **grep + LSP**, not **grep replacement**.

## Go-to-market for end users

### Primary message

> Your agent reads and greps blindly. Locus gives it the same ground truth your language server gives you — definitions, references, types, diagnostics — in six MCP tools, without the weight of a full IDE toolkit.

### Secondary messages

- **For Cursor / Claude Code / Codex users:** Add one MCP server with `npx`; keep using your host for edits.
- **For teams with context budgets:** Six tools, compact line output, minimal cognitive load vs dozens of MCP primitives.
- **For teams comparing Serena:** Locus is navigation-only — lighter install, smaller tool menu, complements rather than replaces your host.
- **For polyglot repos:** One config (`locus.json`, `.lsp.json`) across TypeScript, Python, Go, Rust — extensible to more servers.

### What not to claim

- Not an IDE replacement
- Not symbolic editing or refactoring execution
- Not agent memory or project onboarding wizard
- Not "works with 40 languages out of the box" without installing each language server

### Audience segments

1. **Agent power users** — already hit grep/read limits on refactors; want LSP accuracy.
2. **Platform / tooling teams** — need a stable, documented MCP contract (`@locus-dev/mcp`) to recommend to users.
3. **Eval-conscious teams** — six tools simplify benchmarking navigation tasks (see `evals/`).

### Distribution

- **npm:** `@locus-dev/mcp` — `npx -y @locus-dev/mcp serve`
- **Docs entry points:** README → [usage.md](./usage.md) → [comparison.md](./comparison.md) → [faq.md](./faq.md)
- **SEO / GEO:** [seo/discoverability.md](./seo/discoverability.md)

## Decision checklist

Choose **Locus** when:

- [ ] Your MCP host already handles edits, terminal, and search well
- [ ] Agents waste context reading whole files or grepping for symbols
- [ ] You want ≤6 predictable MCP tools with compact output
- [ ] You need `.lsp.json` compatibility or multi-host config portability

Choose **Serena** when:

- [ ] You want symbolic editing and refactoring inside MCP
- [ ] You need agent memory across long sessions
- [ ] You prefer one broad toolkit over host-native edits

Choose **grep only** when:

- [ ] Tasks are string search, config trawling, or non-code files
- [ ] No language server exists for the language

Choose **generic LSP bridge** when:

- [ ] You need raw or uncommon LSP methods not covered by Locus tools

## See also

- [comparison.md](./comparison.md) — feature table vs Serena, mcp-language-server, cclsp
- [usage.md](./usage.md) — MCP-first setup for Cursor, Codex, Claude Code
- [faq.md](./faq.md) — common questions
- [seo/discoverability.md](./seo/discoverability.md) — keywords and meta descriptions
