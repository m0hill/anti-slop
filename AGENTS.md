# Repository guidance

- `src/` is the plugin. The skill's `assets/` copy is generated; run `pnpm sync:skill` after changing `src/`.
- The plugin source follows its own dialect: `pnpm lint` checks `src/` with `src/config.json`.
- Keep rules free of application-specific names, paths, or exceptions.
- Use Oxlint's ESTree and scope APIs; do not add another parser.
- Every rule skips `*.ffi.*` files through `isBoundaryFile`. A rule message names the replacement to write, not just what is wrong.
- Give each behavior change RuleTester cases in the rule's `.test.ts` file.
- When a rule is added or enabled in `src/config.json`, mention it in `skills/install-anti-slop-gleam/references/conventions.md`; `pnpm check` fails otherwise.
- Run `pnpm check` before committing.
