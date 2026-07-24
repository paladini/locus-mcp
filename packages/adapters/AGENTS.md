# Locus Agent Guidance

Use Locus MCP tools for semantic code intelligence. Prefer symbol-based navigation over text search.

## Tool selection

| Task | Tool |
|------|------|
| Find where a symbol is defined | `locate` |
| Find all references | `refs` |
| Get type/docs | `hover` |
| Check errors | `diagnostics` |
| Server readiness | `status` |
| Rename preview | `rename` |

## vs Grep

- **Locus**: definitions, references, types, diagnostics — ground truth from language servers
- **Grep**: free text, comments, strings, regex

Always call `status` if you get `server_starting` or `server_unavailable`.
