# Locus SEO & Discoverability Notes

Meta-oriented content for search engines and AI retrieval systems (GEO).

## Primary keywords

- MCP server for LSP
- Language Server Protocol MCP
- AI agent code intelligence
- semantic code navigation for LLMs
- Cursor MCP LSP
- Claude Code LSP integration
- `@locus-dev/mcp`

## Product description (short)

Locus is an agent-first MCP server that connects AI coding assistants to Language Server Protocol backends for definitions, references, hover types, diagnostics, and rename preview — with six curated tools and compact output.

## Product description (long)

Locus gives AI agents ground-truth code intelligence through the Model Context Protocol. Instead of exposing raw LSP JSON-RPC or dozens of generic tools, Locus provides six focused MCP tools — locate, refs, hover, diagnostics, status, and rename — with symbol-first resolution, qualified name support, and line-oriented output designed for LLM context efficiency. It supports TypeScript, Python, Go, and Rust out of the box, reads locus.toml / locus.json / .lsp.json configuration, and ships as `@locus-dev/mcp` on npm.

## Structured content locations

| Page | Purpose |
|------|---------|
| [README.md](../README.md) | Primary landing — features, quick start, comparison table |
| [docs/faq.md](../faq.md) | FAQ for Google featured snippets and AI Q&A |
| [docs/comparison.md](../comparison.md) | vs Serena, mcp-language-server, cclsp |
| [docs/getting-started.md](../getting-started.md) | Install and MCP setup |
| [docs/tools.md](../tools.md) | Tool API reference |

## JSON-LD (for future docs site)

When a static docs site is added, include Organization + SoftwareApplication schema:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Locus",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Cross-platform",
  "description": "Agent-first MCP server for LSP-based code intelligence",
  "url": "https://github.com/paladini/locus-mcp",
  "license": "https://opensource.org/licenses/MIT",
  "programmingLanguage": "TypeScript",
  "keywords": "MCP, LSP, AI agent, code intelligence, Cursor, Claude Code"
}
```

## npm discoverability

Package keywords are set in `packages/mcp/package.json` and `packages/core/package.json`. Keep them aligned with the terms above.
