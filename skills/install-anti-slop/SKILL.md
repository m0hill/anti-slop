---
name: install-anti-slop
description: Install, configure, update, or upgrade vendored anti-slop Oxlint plugins. Use when adding anti-slop, picking up upstream rules or fixes, or migrating an existing installation while preserving local customizations.
---

# Install or update anti-slop

Anti-slop is vendored code: the target repository owns its rules, diagnostics, tests, and configuration. Preserve those choices when bringing in upstream changes.

## Choose the path

Read the repository's agent instructions and `git status`. Identify its package manager, Oxlint/Vite+ configuration, and any existing anti-slop entry points, including renamed or relocated copies referenced by `jsPlugins`.

- **Existing installation — update, upgrade, migrate, or reconfigure:** read [Update a vendored installation](references/update.md) and follow that procedure instead of the fresh-install steps below.
- **No installation — fresh install:** follow the procedure below. If the user requested an update but no installation can be found, confirm the target before installing.

Complete when the operation and target path are established and pre-existing work is identified.

## Fresh install

1. Copy the bundled plugin from this skill. Run from the target repository:

   ```bash
   node <skill-directory>/scripts/install.mjs
   ```

   This creates `tools/oxlint/anti-slop/`. Pass another relative destination as the first argument when the repository has an established tooling layout. The script refuses to replace an existing destination; route existing copies through the update procedure rather than `--force`.

   Complete when the files exist at the agreed destination without replacing an existing copy.

2. Install current compatible dependencies rather than trusting versions remembered by the agent:
   - If the repository already depends on `oxlint`, read its installed version from the package manager or lockfile and install `@oxlint/plugins` at exactly that version. Pin it exactly rather than by range so future upgrades move both packages together.
   - Only when the repository has no `oxlint` dependency, query `npm view oxlint version` and `npm view @oxlint/plugins version`, then install the same current version of both packages.
   - `oxlint` is a development dependency. The copied source imports `@oxlint/plugins`, so install it as a development dependency for a local-only plugin.
   - Install `oxlint-tsgolint` as an exactly pinned development dependency; it runs the type-aware rules in step 3. Query `npm view oxlint-tsgolint version` unless the repository already depends on it.
   - Do not replace the package manager or rewrite unrelated dependency ranges.

   Complete when matching compatible versions are installed and unrelated dependency ranges are preserved.

3. Register the plugin by extending its shipped configuration, and configure ignores. The copy contains `configs/recommended.json` (every generic rule, `oxc/no-accumulating-spread`, and Oxlint's type-aware rules), `configs/effect.json`, and `configs/gleam.json`. Plugin paths inside them are relative to the files, so they work wherever the plugin was copied. For `oxlint.config.ts` or `.oxlintrc.json`, merge these fields with the existing configuration:

   ```ts
   extends: ["./tools/oxlint/anti-slop/configs/recommended.json"],
   ignorePatterns: [
     ".agent/**",
     ".agents/**",
     ".claude/**",
     ".codex/**",
     ".continue/**",
     ".cursor/**",
     ".gemini/**",
     ".opencode/**",
     ".pi/**",
     ".roo/**",
     ".windsurf/**",
     "tools/oxlint/anti-slop/**",
   ],
   ```

   Keep every existing ignore, `extends` entry, and rule setting; the repository's own `rules` and `overrides` take precedence over the extended files. Adjust the paths when the plugin was copied elsewhere. Inspect the repository for other project-local agent tooling directories and add them rather than linting installed skills, hooks, or generated agent configuration as application source. Do not broadly ignore all dot-directories, because some repositories keep owned source or checks in them. Do not copy rule lists out of the shipped files; extending them keeps future updates to one place.

   For Vite+, add `extends` and `ignorePatterns` under `lint`. Also merge the same patterns into `fmt.ignorePatterns` so `vp check` does not reformat installed agent assets or the vendored plugin. Merge existing entries instead of replacing them.

   `no-runtime-typeof` and `no-unknown-parameters` assume a runtime schema library such as Zod, Valibot, ArkType, or Effect Schema. If the repository has none, recommend adding Zod and ask before changing dependencies. Without one, agents work around these rules with harder-to-read equivalents of `typeof`.

   `recommended.json` enables type-aware linting, which reads the nearest `tsconfig.json`. If it lacks `strict`, `exactOptionalPropertyTypes`, or `noUncheckedIndexedAccess`, recommend enabling them and ask before changing it; without `noUncheckedIndexedAccess`, `no-unnecessary-condition` reports necessary `undefined` checks on indexed reads. Its `no-floating-promises` option allows `node:test` registration calls; if the repository uses another test runner whose `describe` or `it` returns a promise, override the rule with the equivalent entry. Keep a rule the user asks to defer at `"warn"` rather than dropping it.

   For `no-array-filter-map`, prefer lazy `.values().filter(...).map(...).toArray()` pipelines only when the target runtime supports iterator helpers; otherwise use an appropriate single `flatMap` or locally mutating reducer. Review callback order, indexes, sparse arrays, `thisArg`, and filtering semantics rather than mechanically rewriting chains. Unknown receiver types are deliberately not inferred by this AST/scope rule.

   Pair `no-reduce-accumulator-copy` with native `oxc/no-accumulating-spread`: the custom rule catches supported non-spread copies such as `Object.assign({}, acc, item)`, `Array.from(acc)`, and array accumulator `concat`/`slice` calls. Mutating a fresh local accumulator is allowed; copying individual input items is also allowed. Named callbacks, indirect helpers, and nested accumulator properties are not fully analyzed, so do not claim all quadratic reducers are ruled out.

   If the repository declares `effect` in a package manifest, or the user explicitly requests Effect rules, also extend `configs/effect.json` after `recommended.json`. Do not enable the Effect plugin merely because Effect appears transitively in a lockfile; require a direct package-manifest dependency or an explicit user request. The rule covers relative project imports. Report package-alias imports as a current limitation rather than pretending they are enforced.

   Extend the opt-in `configs/gleam.json` after `recommended.json` only when the user explicitly requests the Gleam dialect. It bans classes, `null`, exceptions, loops, mutable bindings, shared mutation, and direct clock, randomness, network, and file access, so existing code rarely passes without migration. It turns off `no-reduce-accumulator-copy` and `oxc/no-accumulating-spread`, which steer reducers toward mutation, and turns off `no-loops` and `no-mutable-bindings` in `*.test.*` and `*.spec.*` files so tests can repeat actions and fakes can change state. If the repository names tests differently, add a matching override. The Gleam rules skip `*.ffi.*` boundary modules. Ask before moving code into boundary modules or adding overrides for paths other than tests.

   Complete when the shipped configurations are extended, eligible Effect and Gleam configurations are included, and existing configuration is preserved.

4. Offer to add [the agent conventions](references/agent-conventions.md) to the repository's `AGENTS.md` (or the agent instruction file it already uses). When the Gleam dialect is enabled, add [its conventions](references/agent-conventions-gleam.md) too. Lint messages reach an agent only after it writes the banned pattern; these conventions name the intended replacements up front, including ones no rule can check, such as limits on polling. Add the section verbatim, then adapt names such as `PageSchema` to the repository's own. Do not overwrite existing instructions.

   Complete when the user has accepted or declined the conventions and any accepted section is added.

5. Run the repository's lint command and typecheck. For Vite+, run the repository's full `vp check` command after adding both lint and format ignores. If findings appear in owned project source, report them and fix them only when the user asked for migration/cleanup. Do not suppress rules, weaken rule severity, add unsafe casts, or mechanically launder types to make lint pass.

   Complete when checks have run and every failure is resolved or reported with its diagnostics.

6. Record provenance in `UPSTREAM.md` beside the vendored entry point: source repository, exact source commit or recoverable pristine snapshot when available, installed plugin paths, and intentional deviations. Verify that the revision identifies the actual copied assets; a package version or the current upstream HEAD alone is insufficient. If provenance cannot be established, record it as unknown rather than guessing.

   Review the final diff and report the installed path, source identity, dependency/configuration changes, and check results. Complete when the record and report describe the files actually installed and any remaining findings.
