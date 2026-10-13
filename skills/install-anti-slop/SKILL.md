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

3. Register the generic plugin, configure ignores, and enable all generic rules. For `oxlint.config.ts` or `.oxlintrc.json`, merge these fields with the existing configuration:

   ```ts
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
   jsPlugins: [
     { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
   ],
   ```

   Keep every existing ignore. Adjust the final pattern when the plugin was copied elsewhere. Inspect the repository for other project-local agent tooling directories and add them rather than linting installed skills, hooks, or generated agent configuration as application source. Do not broadly ignore all dot-directories, because some repositories keep owned source or checks in them.

   For Vite+, add these fields to `lint.ignorePatterns` and `lint.jsPlugins`. Also merge the same patterns into `fmt.ignorePatterns` so `vp check` does not reformat installed agent assets or the vendored plugin. Merge existing entries instead of replacing them.

   `no-runtime-typeof` and `no-unknown-parameters` assume a runtime schema library such as Zod, Valibot, ArkType, or Effect Schema. If the repository has none, recommend adding Zod and ask before changing dependencies. Without one, agents work around these rules with harder-to-read equivalents of `typeof`.

   Enable these rules at `"error"`, including the native Oxlint companion rule:

   ```json
   {
     "oxc/no-accumulating-spread": "error",
     "anti-slop/no-array-filter-map": "error",
     "anti-slop/no-reduce-accumulator-copy": "error",
     "anti-slop/no-chained-type-assertions": "error",
     "anti-slop/no-conditional-empty-object-spread": "error",
     "anti-slop/no-known-value-widening": "error",
     "anti-slop/no-module-mocking": "error",
     "anti-slop/no-object-parameters": "error",
     "anti-slop/no-reflect-apply": "error",
     "anti-slop/no-reflect-get": "error",
     "anti-slop/no-runtime-typeof": "error",
     "anti-slop/no-shape-in-symbol-names": "error",
     "anti-slop/no-unknown-parameters": "error",
     "anti-slop/no-unknown-returns": "error",
     "anti-slop/no-unknown-type-aliases": "error",
     "anti-slop/no-unsafe-dictionary-type": "error",
     "anti-slop/no-widen-then-assert": "error",
     "anti-slop/require-safety-comment-for-type-assertion": "error"
   }
   ```

   Enable type-aware linting with the generic rules. The anti-slop rules read syntax only, and these built-in rules catch what syntax cannot: `any` escaping a schema, unhandled promises, and non-exhaustive `switch` statements. Set `options.typeAware` to `true` (under `lint` in Vite+) and enable at `"error"`:

   ```json
   {
     "typescript/await-thenable": "error",
     "typescript/no-base-to-string": "error",
     "typescript/no-floating-promises": [
       "error",
       { "allowForKnownSafeCalls": [{ "from": "package", "name": ["describe", "it", "suite", "test"], "package": "node:test" }] }
     ],
     "typescript/no-misused-promises": "error",
     "typescript/no-redundant-type-constituents": "error",
     "typescript/no-unnecessary-condition": "error",
     "typescript/no-unnecessary-type-assertion": "error",
     "typescript/no-unsafe-argument": "error",
     "typescript/no-unsafe-assignment": "error",
     "typescript/no-unsafe-call": "error",
     "typescript/no-unsafe-enum-comparison": "error",
     "typescript/no-unsafe-member-access": "error",
     "typescript/no-unsafe-return": "error",
     "typescript/only-throw-error": "error",
     "typescript/prefer-promise-reject-errors": "error",
     "typescript/restrict-plus-operands": "error",
     "typescript/restrict-template-expressions": "error",
     "typescript/strict-boolean-expressions": "error",
     "typescript/switch-exhaustiveness-check": [
       "error",
       { "allowDefaultCaseForExhaustiveSwitch": false, "requireDefaultForNonUnion": true }
     ],
     "typescript/use-unknown-in-catch-callback-variable": "error"
   }
   ```

   The `no-floating-promises` option allows `node:test` registration calls, which return promises the runner does not need awaited. If the repository uses another test runner whose `describe` or `it` returns a promise, add the equivalent entry.

   Type-aware rules read the nearest `tsconfig.json`. If it lacks `strict`, `exactOptionalPropertyTypes`, or `noUncheckedIndexedAccess`, recommend enabling them and ask before changing it; without `noUncheckedIndexedAccess`, `no-unnecessary-condition` reports necessary `undefined` checks on indexed reads. Keep a rule the user asks to defer at `"warn"` rather than dropping it.

   For `no-array-filter-map`, prefer lazy `.values().filter(...).map(...).toArray()` pipelines only when the target runtime supports iterator helpers; otherwise use an appropriate single `flatMap` or locally mutating reducer. Review callback order, indexes, sparse arrays, `thisArg`, and filtering semantics rather than mechanically rewriting chains. Unknown receiver types are deliberately not inferred by this AST/scope rule.

   Pair `no-reduce-accumulator-copy` with native `oxc/no-accumulating-spread`: the custom rule catches supported non-spread copies such as `Object.assign({}, acc, item)`, `Array.from(acc)`, and array accumulator `concat`/`slice` calls. Mutating a fresh local accumulator is allowed; copying individual input items is also allowed. Named callbacks, indirect helpers, and nested accumulator properties are not fully analyzed, so do not claim all quadratic reducers are ruled out.

   If the repository declares `effect` in a package manifest, or the user explicitly requests Effect rules, also register the opt-in Effect plugin:

   ```ts
   jsPlugins: [
     {
       name: "anti-slop-effect",
       specifier: "./tools/oxlint/anti-slop/effect/index.ts",
     },
   ],
   rules: {
     "anti-slop-effect/no-manual-effect-error-tag": "error",
     "anti-slop-effect/no-manual-tag-comparison": "error",
     "anti-slop-effect/no-manual-tagged-construction": "error",
     "anti-slop-effect/no-service-constructor-imports": "error",
     "anti-slop-effect/prefer-effect-match": "error",
   },
   ```

   Merge these entries with the generic plugin configuration rather than replacing it. Do not enable the Effect plugin merely because Effect appears transitively in a lockfile; require a direct package-manifest dependency or an explicit user request. The rule covers relative project imports. Report package-alias imports as a current limitation rather than pretending they are enforced.

   Register the opt-in Gleam dialect plugin only when the user explicitly requests it; it bans classes, `null`, exceptions, loops, mutable bindings, and shared mutation, so existing code rarely passes without migration:

   ```ts
   jsPlugins: [
     {
       name: "anti-slop-gleam",
       specifier: "./tools/oxlint/anti-slop/gleam/index.ts",
     },
   ],
   rules: {
     "anti-slop-gleam/no-classes": "error",
     "anti-slop-gleam/no-enums": "error",
     "anti-slop-gleam/no-loops": "error",
     "anti-slop-gleam/no-mutable-bindings": "error",
     "anti-slop-gleam/no-null": "error",
     "anti-slop-gleam/no-shared-mutation": "error",
     "anti-slop-gleam/no-throw": "error",
     "anti-slop-gleam/no-try-catch": "error",
   },
   ```

   The Gleam rules skip `*.ffi.*` boundary modules. Boundary modules decode untyped input with the repository's schema library. Ask before moving code into boundary modules or adding overrides for other paths. When the Gleam plugin is enabled, ask whether to disable `no-reduce-accumulator-copy` and `oxc/no-accumulating-spread`, which steer reducers toward mutation.

   Complete when the generic and type-aware rules and eligible Effect and Gleam rules are registered and existing configuration is preserved.

4. Offer to add [the agent conventions](references/agent-conventions.md) to the repository's `AGENTS.md` (or the agent instruction file it already uses). Lint messages reach an agent only after it writes the banned pattern; these conventions name the intended replacements up front, including ones no rule can check, such as limits on polling. Add the section verbatim, then adapt names such as `PageSchema` to the repository's own. Do not overwrite existing instructions.

   Complete when the user has accepted or declined the conventions and any accepted section is added.

5. Run the repository's lint command and typecheck. For Vite+, run the repository's full `vp check` command after adding both lint and format ignores. If findings appear in owned project source, report them and fix them only when the user asked for migration/cleanup. Do not suppress rules, weaken rule severity, add unsafe casts, or mechanically launder types to make lint pass.

   Complete when checks have run and every failure is resolved or reported with its diagnostics.

6. Record provenance in `UPSTREAM.md` beside the vendored entry point: source repository, exact source commit or recoverable pristine snapshot when available, installed plugin paths, and intentional deviations. Verify that the revision identifies the actual copied assets; a package version or the current upstream HEAD alone is insufficient. If provenance cannot be established, record it as unknown rather than guessing.

   Review the final diff and report the installed path, source identity, dependency/configuration changes, and check results. Complete when the record and report describe the files actually installed and any remaining findings.
