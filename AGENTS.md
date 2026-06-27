# AGENTS.md

## Development

- Use the repo toolchain: `source ~/.nvm/nvm.sh`, `nvm use`, `pnpm install`.
- Prefer existing patterns in `src/`, `components/`, and `setup/`; keep changes scoped.
- Use `apply_patch` for manual edits. Do not overwrite unrelated user changes.
- When changing counter logic, component props, config shape, defaults, errors, or examples, update both languages:
  `README.md`, `docs/README.zh-CN.md`, `docs/manual.md`, and `docs/manual.zh-CN.md`.
- Keep demo slides and `demo/slidev-addon-counter.config.ts` aligned with documented behavior when examples or APIs change.
- Add or update focused tests in `src/counter.spec.ts` for behavior changes.

## Checks

- Before considering work complete, run `pnpm check`.
- Before publishing, verify `package.json` `files` includes every public doc linked from README, then run `pnpm check` and inspect `pnpm pack --dry-run`.
- Treat build warnings as something to report, even when the command exits successfully.
