# Locus SEO & Discoverability Notes

Meta-oriented content for search engines and AI retrieval systems (GEO).

## Positioning keywords (primary)

Use these in titles, H1/H2, npm keywords, and meta descriptions:

- **ground truth for coding agent**
- **semantic layer for AI agent**
- **LSP MCP navigation** (not "LSP MCP IDE")
- **symbol-level code intelligence for LLM**
- **MCP server for LSP navigation**
- **complement Cursor Edit Grep** / **complement Claude Code tools**
- **Serena alternative navigation** / **Locus vs Serena** (comparison intent, not clone)
- **definitions references types diagnostics MCP**
- `@locus-dev/mcp`

## Positioning keywords (secondary)

- AI agent code intelligence
- semantic code navigation for LLMs
- Language Server Protocol MCP
- Cursor MCP LSP
- Claude Code LSP integration
- Codex MCP LSP
- compact MCP tool output
- six MCP tools LSP
- qualified symbol lookup agent
- grep vs LSP for AI agents

## Anti-keywords (avoid claiming)

Do not optimize for or imply:

- "IDE for your coding agent" (Serena positioning)
- "symbolic editing MCP" / "replace symbol body"
- "agent memory MCP"
- "full IDE replacement for LLM"

Locus is **navigation and diagnostics**; host handles edits.

## Product description (short)

Locus is ground truth for your coding agent — an MCP server that adds the semantic layer language servers provide (definitions, references, types, diagnostics) through six curated tools and compact output. It complements your host's Edit and Grep; it does not replace your IDE.

## Product description (long)

Locus gives AI agents ground-truth code intelligence through the Model Context Protocol. Instead of reading whole files or grepping blindly, agents call six focused MCP tools — locate, refs, hover, diagnostics, status, and rename — backed by real Language Server Protocol backends. Locus is the semantic layer your agent is missing: symbol-first resolution, qualified names, ambiguity detection, and line-oriented output designed for LLM context efficiency. Unlike full IDE replacements such as Serena, Locus does not symbolic-edit or store agent memory; it complements Cursor, Claude Code, and Codex by adding LSP navigation while the host handles file edits. Supports TypeScript, Python, Go, and Rust out of the box; reads locus.toml, locus.json, and .lsp.json; ships as `@locus-dev/mcp` on npm.

## Comparison / differentiation snippets

For AI retrieval and comparison pages:

| Query intent | Locus answer |
|--------------|--------------|
| Locus vs Serena | Serena = IDE for agent (edit, refactor, memory). Locus = ground truth layer (nav + diagnostics only). Complementary, not clone. |
| Locus vs grep | Grep = text. Locus = symbols via LSP. Use both. |
| Locus vs mcp-language-server | Generic bridge = raw/variable LSP. Locus = six curated tools, compact output. |
| Do I need Locus if I use Cursor? | If your agent still greps/reads blindly for definitions, yes — Locus exposes LSP to MCP. |

## Structured content locations

| Page | Purpose |
|------|---------|
| [README.md](../../README.md) | Primary landing — positioning headline, quick start, comparison table |
| [docs/positioning.md](../positioning.md) | Deep positioning vs Serena, bridges, native LSP |
| [docs/comparison.md](../comparison.md) | Feature table vs Serena, mcp-language-server, cclsp |
| [docs/faq.md](../faq.md) | FAQ for featured snippets and AI Q&A |
| [docs/usage.md](../usage.md) | MCP-first setup (Cursor, Codex, Claude Code) |
| [docs/tools.md](../tools.md) | Six-tool API reference |

## JSON-LD (for future docs site)

When a static docs site is added, include Organization + SoftwareApplication schema:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Locus",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Cross-platform",
  "description": "Ground truth MCP server for LSP-based code navigation — the semantic layer for AI coding agents",
  "url": "https://github.com/paladini/locus-mcp",
  "license": "https://opensource.org/licenses/MIT",
  "programmingLanguage": "TypeScript",
  "keywords": "MCP, LSP, AI agent, semantic navigation, ground truth, Cursor, Claude Code, Codex, Serena alternative"
}
```

## npm discoverability

Package keywords in `packages/mcp/package.json` and `packages/core/package.json` should stay aligned with primary positioning terms above. Prefer **navigation**, **semantic layer**, and **ground truth** over **IDE** or **editing**.
