# Cursor PostToolUse Hook (stub)

Syncs file edits to Locus LSP and surfaces diagnostics on the next agent turn.

## Setup

1. Copy `.cursor/hooks.json` to your project (or merge into existing hooks).
2. Ensure `locus` MCP server is configured in Cursor settings.

## Hook behavior

After `Write` or `Edit` tool use:
- Sends `textDocument/didChange` to Locus via CLI (future: direct IPC)
- Queues compact diagnostics for injection into agent context

## Status

MVP stub — full implementation planned for v0.2.
