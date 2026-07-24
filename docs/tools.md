# MCP Tools Reference

Locus exposes exactly six MCP tools. Prefer these over text search when you need definitions, references, types, or compiler diagnostics.

## Tool overview

| Tool | Purpose |
|------|---------|
| `locate` | Find symbol by name or document overview |
| `refs` | References or implementations |
| `hover` | Type info and documentation |
| `diagnostics` | File or workspace diagnostics |
| `status` | Server readiness and missing binaries |
| `rename` | Preview rename (dry-run by default) |

All tools return text with a leading `status:` line. Non-`ok` statuses set MCP `isError` where appropriate.

---

## locate

Find a symbol by name (including qualified names like `MyClass.method`) or list symbols in a file.

**Input**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | one of name/file | Symbol or qualified name |
| `file` | string | one of name/file | File path for document symbol overview |

**Examples**

Find a class:

```json
{ "name": "Greeter" }
```

Find a method:

```json
{ "name": "Greeter.greet" }
```

List symbols in a file:

```json
{ "file": "src/index.ts" }
```

**Sample output**

```
status: ok

src/index.ts:5:3: Greeter.greet | greet(name: string): string {
```

**Ambiguous result**

```
status: ambiguous_symbol
Multiple symbols match "process"

src/a.ts:10:4: ModuleA.process
src/b.ts:3:1: ModuleB.process
```

---

## refs

Find references or implementations at a position.

**Input**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | string | yes* | File containing the symbol |
| `line` | number | yes* | 0-based line |
| `character` | number | yes* | 0-based character |
| `position` | string | alt | Shorthand `path:line:col` (1-based) |
| `implementations` | boolean | no | Find implementations instead of references |
| `include_declaration` | boolean | no | Include declaration (default true) |
| `limit` | number | no | Max results (default 50) |

\*Required unless `position` is provided.

**Example**

```json
{
  "file": "src/index.ts",
  "line": 4,
  "character": 10
}
```

Or with shorthand:

```json
{
  "file": "src/index.ts",
  "position": "src/index.ts:5:11"
}
```

**Sample output**

```
status: ok
3 result(s)

src/index.ts:12:4: const g = new Greeter()
src/app.ts:8:2: greeter.greet('world')
```

---

## hover

Get type information and documentation for a symbol or position.

**Input**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Resolve symbol by name (requires `file`) |
| `file` | string | File path |
| `line` | number | 0-based line |
| `character` | number | 0-based character |
| `position` | string | Shorthand `path:line:col` |

**Example — by position**

```json
{
  "file": "src/index.ts",
  "line": 4,
  "character": 10
}
```

**Example — by name**

```json
{
  "name": "Greeter",
  "file": "src/index.ts"
}
```

**Sample output**

```
status: ok

```typescript
class Greeter {
  greet(name: string): string
}
```
```

---

## diagnostics

Get compiler or linter diagnostics for a file or open workspace documents.

**Input**

| Parameter | Type | Description |
|-----------|------|-------------|
| `file` | string | Specific file (relative to project root) |
| `workspace` | boolean | Collect from all open documents |

**Example — single file**

```json
{ "file": "src/index.ts" }
```

**Example — workspace**

```json
{ "workspace": true }
```

**Sample output**

```
status: ok
2 diagnostic(s)

# src/index.ts
## error
12:4: Type 'string' is not assignable to type 'number'.
## warning
3:1: 'unused' is declared but never used.
```

---

## status

Check language server readiness, warm state, and missing binaries. Call this when other tools return `server_starting` or `server_unavailable`.

**Input**

No parameters.

**Example**

```json
{}
```

**Sample output**

```
status: ok

# Locus LSP Status

- **typescript** (typescript-language-server): ready, binary installed, warmed=true, docs=1
- **python** (pyright-langserver): stopped, binary installed, warmed=false, docs=0
- **go** (gopls): stopped, binary MISSING, warmed=false, docs=0
```

---

## rename

Preview or plan a symbol rename. Defaults to dry-run; set `apply=true` to get the full edit plan (host agent applies edits).

**Input**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `new_name` | string | yes | Target symbol name |
| `file` | string | yes* | File containing symbol |
| `line` | number | yes* | 0-based line |
| `character` | number | yes* | 0-based character |
| `position` | string | alt | Shorthand `path:line:col` |
| `apply` | boolean | no | Return apply plan (default false) |

**Example**

```json
{
  "file": "src/index.ts",
  "line": 4,
  "character": 6,
  "new_name": "Welcomer"
}
```

**Sample output**

```
status: ok
Dry run — set apply=true to execute

# Rename preview

## src/index.ts (3 edits)
- L5: Welcomer
- L12: Welcomer
- L20: Welcomer
```

---

## Agent guidance

- Use **Locus** for definitions, references, types, and diagnostics.
- Use **Grep** for free text, comments, strings, and regex patterns.
- Call `status` after edits if diagnostics seem stale.
- On `ambiguous_symbol`, pick the qualified name from the list and retry `locate`.
