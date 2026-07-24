# Contributing

We welcome contributions to Locus. Please read this guide before opening a pull request.

## Code of conduct

Be respectful and constructive. Focus on technical merit and user impact.

## How to contribute

1. **Check existing issues** — avoid duplicate work
2. **Fork and branch** — use descriptive branch names (`fix/init-mkdir`, `docs/tools-examples`)
3. **Develop** — follow the setup in [docs/contributing.md](docs/contributing.md)
4. **Test** — run `npm run build`, `npm run typecheck`, and `npm test`
5. **Submit a PR** — describe what changed and why

## Development requirements

- Node.js 22+
- All documentation and user-facing text in **English**
- MIT license applies to contributions

## Commit messages

Use clear, imperative subject lines:

```
fix: create directory in locus init when missing
docs: add MCP tools reference with examples
test: cover .lsp.json config compatibility
```

## Scope guidelines

- **In scope**: bug fixes, tests, docs, performance, adapter improvements
- **Discuss first**: new MCP tools, breaking config changes, major architecture shifts

## Questions

Open a GitHub issue for bugs, feature requests, or design questions.

Detailed developer docs: [docs/contributing.md](docs/contributing.md)
