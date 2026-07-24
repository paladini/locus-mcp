# Contributing to Locus

Thank you for your interest in contributing. This document covers development setup, testing, and the contribution workflow.

## Development setup

### Prerequisites

- Node.js 22+
- npm 10+
- Git
- Language servers for integration tests (optional but recommended):
  - `typescript-language-server` — `npm install -g typescript-language-server typescript`
  - `pyright-langserver` — `pip install pyright`

### Clone and install

```bash
git clone https://github.com/paladini/locus-mcp.git
cd locus
npm install
npm run build
```

### Project structure

```
packages/core/      @locus-dev/core — LSP client, registry, symbols, format
packages/mcp/       @locus-dev/mcp — MCP server + CLI (locus binary)
packages/adapters/  Cursor hooks + Claude skill stubs
evals/fixtures/     Integration test fixtures (TypeScript, Python)
docs/               User and contributor documentation
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile all workspaces |
| `npm run typecheck` | Type-check without emit |
| `npm test` | Run unit and integration tests |
| `npm run lint` | Lint via TypeScript (no emit) |

### Package-level tests

```bash
npm run test -w @locus-dev/core
npm run test -w @locus-dev/mcp
```

### CLI during development

```bash
node packages/mcp/dist/bin.js check
node packages/mcp/dist/bin.js init --cwd ./evals/fixtures/typescript
node packages/mcp/dist/bin.js warm --cwd ./evals/fixtures/typescript
node packages/mcp/dist/bin.js serve --cwd ./evals/fixtures/typescript
```

Integration tests skip automatically when LSP binaries are not on `PATH`.

## Writing tests

- Unit tests live in `packages/*/test/*.test.ts`
- Use Node.js built-in test runner (`node:test`) with `tsx` for TypeScript
- Mock `LspClient` for symbol resolver tests; use real LSP only in integration tests
- Fixtures are under `evals/fixtures/`

## Code guidelines

- Keep the MCP surface at six tools — discuss new tools in an issue first
- Match existing TypeScript style (ESM, strict types)
- User-facing strings and documentation must be in English
- Prefer minimal, focused diffs

## Pull request process

1. Fork the repository and create a feature branch
2. Make your changes with tests where appropriate
3. Ensure `npm run build`, `npm run typecheck`, and `npm test` pass
4. Open a PR with a clear description and test plan

See [CONTRIBUTING.md](../CONTRIBUTING.md) at the repo root for the standard open-source contribution checklist.

## Reporting issues

Include:

- Node.js version (`node -v`)
- OS and shell
- Output of `locus check`
- MCP host (Cursor, Claude Code, etc.)
- Minimal reproduction steps

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).
