# Directory Submissions Checklist

Track visibility submissions for Locus across MCP directories and community lists. Update status as submissions are completed.

## Submission Details

Use these details for all directory submissions:

| Field | Value |
|-------|-------|
| **Name** | locus-mcp |
| **Title** | Locus — LSP Code Intelligence |
| **Description** | Lightweight MCP server for LSP code intelligence — symbol lookup, references, types, and diagnostics for AI coding agents. |
| **npm package** | `@paladini/locus-mcp` |
| **MCP Registry name** | `io.github.paladini/locus-mcp` |
| **Repository** | https://github.com/paladini/locus-mcp |
| **License** | MIT |
| **Transport** | stdio |
| **Install command** | `npx -y @paladini/locus-mcp serve` |
| **Author** | Fernando Paladini |

## GitHub Repository Topics

Add these topics to https://github.com/paladini/locus-mcp/settings (improves Glama and directory discovery):

- `mcp`
- `model-context-protocol`
- `lsp`

## Official Registry

| Directory | URL | Status | Notes |
|-----------|-----|--------|-------|
| MCP Registry | https://registry.modelcontextprotocol.io | **Pending** | `io.github.paladini/locus-mcp` v0.1.2 — automated via `server.json` + publish workflow |

## AI Tool Directories

| Directory | URL | Status | Notes |
|-----------|-----|--------|-------|
| Glama | https://glama.ai/mcp/servers | **Pending sync** | `glama.json` + GitHub topics; indexes after MCP Registry (~minutes) |
| PulseMCP | https://www.pulsemcp.com | **Pending sync** | Auto-sync from registry; expect 24–48h; email hello@pulsemcp.com if delayed |
| mcp.so | https://mcp.so/submit | **Ready** | Submit `https://github.com/paladini/locus-mcp` after GitHub sign-in |
| Smithery | https://smithery.ai/new | **Ready** | Upload `locus-mcp.mcpb` from GitHub Release; CLI: `smithery mcp publish ./locus-mcp.mcpb -n paladini/locus-mcp` |
| Cursor Directory (MCP manual) | https://cursor.directory/mcp/new | **Ready** | npm: `@paladini/locus-mcp`, install: `npx -y @paladini/locus-mcp serve` |
| Cursor Directory (Plugin) | https://cursor.directory/plugins/new | **Optional** | Auto scan `https://github.com/paladini/locus-mcp` after GitHub sign-in |

## Community Lists

| List | URL | Status | Notes |
|------|-----|--------|-------|
| awesome-mcp-servers (punkpeye) | https://github.com/punkpeye/awesome-mcp-servers | **PR ready** | Submit after npm + registry are live |
| awesome-mcp-servers (wong2 / mcpservers.org) | https://github.com/wong2/awesome-mcp-servers | **PR ready** | Submit after npm + registry are live |
| modelcontextprotocol/servers | https://github.com/modelcontextprotocol/servers | **N/A** | No longer accepts community listings — use MCP Registry instead |

## awesome-mcp-servers PR Template

```markdown
### Locus

- **Description:** Lightweight MCP server for LSP code intelligence — symbol lookup, references, types, and diagnostics. Six focused tools for AI coding agents.
- **npm:** `@paladini/locus-mcp`
- **Install:** `npx -y @paladini/locus-mcp serve`
- **Repository:** https://github.com/paladini/locus-mcp
```

## Post-Publish Verification

After the first `v0.1.2` tag push, verify:

- [ ] npm: https://www.npmjs.com/package/@paladini/locus-mcp shows v0.1.2
- [ ] npm: https://www.npmjs.com/package/@paladini/locus-core shows v0.1.2
- [ ] MCP Registry: search `io.github.paladini/locus-mcp` at https://registry.modelcontextprotocol.io
- [ ] GitHub Packages: both packages visible under repo Packages tab
- [ ] GitHub Release: `locus-mcp.mcpb` attached at https://github.com/paladini/locus-mcp/releases/tag/v0.1.2
- [ ] Glama: https://glama.ai/mcp/servers/paladini/locus-mcp returns 200 (after sync)
- [ ] Cursor deeplink installs successfully (user test)
- [ ] Claude Desktop `.mcpb` installs and connects (user test)
- [ ] mcp.so submission completed
- [ ] Smithery MCPB publish completed
- [ ] awesome-mcp-servers PR opened
- [ ] PulseMCP auto-index (wait 24–48h after registry publish)

## Social Launch (Optional)

- [ ] Product Hunt launch post drafted
- [ ] Dev.to / blog post about LSP-powered AI agents
- [ ] README badges for npm version and MCP Registry
