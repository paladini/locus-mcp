# Publishing Guide

This document describes how maintainers release `@locus-dev/core` and `@locus-dev/mcp` to **npmjs.org** and **GitHub Packages**.

The publish workflow follows the dual-registry pattern used in [harness-score](https://github.com/paladini/harness-score/blob/main/.github/workflows/release.yml).

## Prerequisites

- npm account with publish access to the `@locus-dev` scope on npmjs.org
- GitHub repository `paladini/locus-mcp` with Packages enabled
- Maintainer access to configure repository secrets

## Required secrets

| Secret | Registry | Purpose |
|--------|----------|---------|
| `NPM_TOKEN` | npmjs.org | Publish `@locus-dev/core` and `@locus-dev/mcp` (classic token with bypass 2FA for CI, or configure [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers)) |
| `GITHUB_TOKEN` | GitHub Packages | Provided automatically in Actions; workflow sets `packages: write` |

### npm Trusted Publishing (optional)

Instead of `NPM_TOKEN`, you can configure npm Trusted Publishing for each package:

1. npmjs.com → package → **Settings** → **Trusted Publisher** → **GitHub Actions**
2. User: `paladini`, Repository: `locus-mcp`, Workflow: `publish.yml`

If using Trusted Publishing, remove the `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` env block from the npm job or ensure the secret is unset so OIDC is used.

## Version bump checklist

Update version in **all** of these locations:

1. `packages/core/package.json` → `"version"`
2. `packages/mcp/package.json` → `"version"`
3. Root `package.json` → `"version"` (informational; root is private)
4. `packages/mcp/src/server.ts` → server version string in `createLocusServer`
5. `CHANGELOG.md` (if present) → new section

Keep `@locus-dev/core` and `@locus-dev/mcp` versions in sync for each release.

## Release process (automated)

Publishing is automated via [`.github/workflows/publish.yml`](../.github/workflows/publish.yml).

Triggers:

- Push a version tag: `v*` (e.g. `v0.1.1`)
- Publish a GitHub Release
- Manual **workflow_dispatch**

Steps:

1. Merge all changes to `main`
2. Run verification locally:

   ```bash
   npm run build
   npm run typecheck
   npm test
   ```

3. Bump versions and commit
4. Tag and push:

   ```bash
   git tag v0.1.1
   git push origin main
   git push origin v0.1.1
   ```

5. GitHub Actions will:
   - Build and test the monorepo
   - Publish both packages to **npmjs.org** (`--access public --provenance`)
   - Publish both packages to **GitHub Packages** (`npm.pkg.github.com`)

## Manual publishing (fallback)

Build first:

```bash
npm run build
npm test
```

### npmjs.org

```bash
npm publish -w @locus-dev/core --access public
npm publish -w @locus-dev/mcp --access public
```

### GitHub Packages

Create or update `~/.npmrc`:

```ini
@locus-dev:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT
```

Then:

```bash
npm publish -w @locus-dev/core --registry https://npm.pkg.github.com
npm publish -w @locus-dev/mcp --registry https://npm.pkg.github.com
```

See [`.npmrc.example`](../.npmrc.example) for consumer configuration.

## Installing from GitHub Packages

Consumers need a GitHub PAT with `read:packages` scope:

```bash
npm install @locus-dev/mcp --registry https://npm.pkg.github.com
```

Or configure `.npmrc` in the project (see `.npmrc.example`).

## Dry-run (local)

```bash
npm run build
npm pack -w @locus-dev/core
npm pack -w @locus-dev/mcp
```

Inspect the generated `.tgz` files before publishing.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| npm 403 on publish | Verify `NPM_TOKEN` or Trusted Publisher config; ensure `@locus-dev` scope access |
| GitHub Packages 409 | Version already published — bump version |
| `@locus-dev/mcp` fails peer install | Publish `@locus-dev/core` first, or keep versions aligned |
| Workflow not triggered | Tag must match `v*` pattern; check Actions permissions |
