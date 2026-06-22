# Validation Scripts

These scripts convert workflow constraints into executable checks.

## Commands

- `scripts/check-architecture [repo-root]`
  - Enforces dependency direction and layer boundary heuristics.
- `scripts/check-ddd [repo-root]`
  - Verifies DDD documentation minima.
- `scripts/check-doc-sync [repo-root] [all|staged]`
  - Ensures code changes are synced with RFC (or tiny-change record) and `.ai/current.md`.
- `scripts/check-naming [repo-root]`
  - Enforces outbound implementation filename suffixes.

## Typical usage

```bash
./scripts/check-architecture
./scripts/check-ddd
./scripts/check-doc-sync
./scripts/check-naming
```

For staged-only checks:

```bash
./scripts/check-doc-sync . staged
```
