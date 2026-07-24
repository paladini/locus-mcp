# Configuration

Locus discovers configuration by walking up from the current working directory. The first match wins within each directory; file priority is `locus.toml` → `locus.json` → `.lsp.json`.

## locus.toml

Minimal TOML config for project root and warm languages:

```toml
# Locus configuration
root = "."

warm = ["typescript", "python"]
```

Server definitions live in `locus.json` (see below). TOML is preferred for human-edited project settings.

## locus.json

Full server configuration example:

```json
{
  "root": ".",
  "warm": ["typescript", "python"],
  "servers": [
    {
      "id": "typescript",
      "languageId": "typescript",
      "extensions": [".ts", ".tsx", ".js", ".jsx"],
      "command": "typescript-language-server",
      "args": ["--stdio"]
    },
    {
      "id": "python",
      "languageId": "python",
      "extensions": [".py", ".pyi"],
      "command": "pyright-langserver",
      "args": ["--stdio"]
    }
  ]
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `root` | string | Project root path (default: directory containing config) |
| `warm` | string[] | Language IDs to pre-start via `locus warm` |
| `servers` | array | Language server definitions |

### Server entry fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Unique identifier |
| `languageId` | yes | LSP language ID sent on document open |
| `extensions` | yes | File extensions this server handles |
| `command` | yes | Executable name or path |
| `args` | no | CLI arguments (use `["--stdio"]` for stdio servers) |

When `servers` is omitted or empty, Locus uses built-in defaults.

## .lsp.json compatibility

Locus reads `.lsp.json` for compatibility with Claude Code Open Plugins and similar manifests.

### Legacy `languageServer` block

```json
{
  "languageServer": {
    "command": "typescript-language-server",
    "args": ["--stdio"],
    "extensionToLanguage": {
      "ts": "typescript",
      "tsx": "typescriptreact"
    }
  }
}
```

Locus converts this into an additional server entry merged with defaults.

### `servers` array

```json
{
  "servers": [
    {
      "id": "ruby",
      "languageId": "ruby",
      "extensions": [".rb"],
      "command": "solargraph",
      "args": ["stdio"]
    }
  ]
}
```

Custom servers from `.lsp.json` are appended to the configured server list.

## Built-in language servers

| Language | Command | Extensions |
|----------|---------|------------|
| TypeScript/JS | `typescript-language-server` | `.ts`, `.tsx`, `.js`, `.jsx`, … |
| Python | `pyright-langserver` | `.py`, `.pyi` |
| Go | `gopls` | `.go` |
| Rust | `rust-analyzer` | `.rs` |

Run `locus check` to verify each binary is on your `PATH`.

### Windows notes

If you install Pyright via pip, ensure the Python Scripts directory is on `PATH` (e.g. `%LOCALAPPDATA%\Python\pythoncore-3.14-64\Scripts`).

## CLI environment

All commands accept `--cwd <path>` to set the project root:

```bash
locus serve --cwd /path/to/project
locus init --cwd /path/to/project
locus check --cwd /path/to/project
locus warm --cwd /path/to/project
```

The MCP server uses the host-provided working directory when launched via MCP config `cwd`.

## Output status codes

Tool responses include a discriminated status:

| Status | Meaning |
|--------|---------|
| `ok` | Success |
| `no_results` | Valid query, nothing found |
| `server_starting` | LSP still indexing — retry or call `warm` |
| `server_unavailable` | Binary missing or server crashed |
| `ambiguous_symbol` | Multiple matches — narrow the query |
| `error` | Invalid input or unexpected failure |
