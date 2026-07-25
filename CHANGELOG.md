# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4] - 2026-07-24

### Added

- Package READMEs for `@paladini/locus-mcp` and `@paladini/locus-core` with setup, usage, and troubleshooting

## [0.1.3] - 2026-07-24

### Fixed

- Publish workflow: reliable GitHub Packages auth and dual-registry publish
- Publish workflow: skip npm republish when version already exists; optional `NPM_TOKEN` bootstrap for first release

## [0.1.2] - 2026-07-24

### Added

- First public npm release under `@paladini/locus-core` and `@paladini/locus-mcp`
- Official MCP Registry metadata (`server.json`, `mcpName`)
- Glama directory metadata (`glama.json`)
- MCPB bundle for Claude Desktop and Smithery (`npm run pack:mcpb`)
- Unified publish workflow: npm, GitHub Packages, MCP Registry, GitHub Release
- Directory submissions checklist (`docs/directory-submissions.md`)

### Changed

- Renamed npm scope from `@locus-dev` to `@paladini`
- Updated all docs and install commands to `npx @paladini/locus-mcp`
