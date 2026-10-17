---
name: install-fp-rules
description: Install, configure, or update the vendored fp Oxlint plugin, which keeps TypeScript in a functional style: no exceptions, null, classes, loops, or mutation, and side effects only in `*.io.ts` files. Use when adding the rules to a repository, picking up upstream fixes, or migrating an existing installation while preserving local customizations.
---

# Install or update the fp lint rules

The plugin is vendored code: the target repository owns its copy of the rules, messages, and configuration. Preserve those choices when bringing in upstream changes.

## Choose the path

Read the repository's agent instructions and `git status`. Identify its package manager, Oxlint or Vite+ configuration, and any existing installation, including renamed or relocated copies referenced by `jsPlugins` or `extends`.

- **Existing installation:** follow [Update a vendored installation](references/update.md) instead of the steps below.
- **No installation:** follow the steps below. If the user asked for an update but no installation exists, confirm the target before installing.

## Fresh install

1. Copy the plugin from this skill. From the target repository, run:

   ```bash
   node <skill-directory>/scripts/install.mjs
   ```

   This creates `tools/oxlint/fp/`. Pass another relative destination as the first argument when the repository has an established tooling layout. The script refuses to replace an existing directory; route existing copies through the update procedure instead of `--force`.

2. Install dependencies at versions read from the package registry or lockfile, not remembered ones:
   - If the repository already depends on `oxlint`, install `@oxlint/plugins` at exactly that version. Otherwise query `npm view oxlint version` and install that version of both.
   - Install `oxlint-tsgolint`, which runs the type-aware rules, at the version from `npm view oxlint-tsgolint version` unless the repository already has it.
   - Install all three as exactly pinned development dependencies. Do not change the package manager or unrelated dependency ranges.

3. Extend the shipped configuration and add ignores. For `.oxlintrc.json` or `oxlint.config.ts`, merge these fields into the existing configuration:

   ```ts
   extends: ["./tools/oxlint/fp/config.json"],
   ignorePatterns: [
     ".agent/**", ".agents/**", ".claude/**", ".codex/**", ".continue/**", ".cursor/**",
     ".gemini/**", ".opencode/**", ".pi/**", ".roo/**", ".windsurf/**",
     "tools/oxlint/fp/**",
   ],
   ```

   Keep every existing ignore, `extends` entry, and rule setting. Adjust the paths if the plugin was copied elsewhere, and add any other agent tooling directories the repository has; do not ignore every dot-directory. Do not copy the rule list out of `config.json`; extending it keeps future updates in one place. For Vite+, put both fields under `lint`, and merge the ignores into `fmt.ignorePatterns` too.

   Then check the surrounding setup, and ask before changing any of it:
   - The repository's lint script should pass `--format default` to `oxlint`. Without a terminal, Oxlint prints nothing when lint passes, and agents write throwaway rule-breaking files to find out whether it ran.
   - The nearest `tsconfig.json` should enable `strict`, `exactOptionalPropertyTypes`, and `noUncheckedIndexedAccess`. Without the last one, `no-unnecessary-condition` reports necessary `undefined` checks on indexed reads.
   - The repository should have a schema library to parse untyped input. If it has none, recommend Zod; its `safeParse` already returns a result value.
   - `config.json` relaxes most rules in `*.test.*` and `*.spec.*` files. If tests are named differently, add a matching override. `no-floating-promises` allows `node:test` registration calls; add the equivalent entry for another runner whose `describe` or `it` returns a promise.

   Existing code rarely passes without migration. Ask before moving code into `.io.ts` files, and before adding overrides for paths other than tests.

4. Offer to add [the conventions](references/conventions.md) to the repository's `AGENTS.md` or the agent instruction file it already uses. Lint messages reach an agent only after it writes a rejected pattern; the conventions name the replacements up front, including practices no rule can check, such as limits on polling. Add the section verbatim, then adapt example names such as `PageSchema`. Do not overwrite existing instructions.

5. Run the repository's lint command and typecheck (for Vite+, `vp check`). Report findings in project source, and fix them only if the user asked for migration. Do not suppress rules, lower severities, or add casts to make lint pass.

6. Record provenance in `UPSTREAM.md` beside the vendored copy: source repository, the exact commit the copied files come from, installed paths, and intentional deviations. If the commit cannot be established, record it as unknown rather than guessing. Report the installed path, source commit, dependency and configuration changes, and check results.
