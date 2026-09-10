# SQLite persistence — engine choice

## Decision

Use **`node:sqlite`** (built-in Node.js module).

| Criterion | `node:sqlite` | `better-sqlite3` |
|-----------|---------------|------------------|
| Extra native dependency | No | Yes (compile / prebuilds) |
| Node required | **≥ 22.5** (historically experimental; we document **≥ 22**) | ≥ 18 typical |
| Sync API | Yes (`DatabaseSync`) | Yes |
| npm packaging | Simpler for CLI | More install friction |

## Requirements

- **Node.js ≥ 22** (aligned with the agent runtime; `package.json` engines updated).
- No extra native binaries → better DX for `npx campus`.

## Note

If `node:sqlite` is unavailable in an environment, the documented fallback is
to keep the legacy JSON cache until the runtime meets the minimum.
