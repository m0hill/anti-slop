# anti-slop-gleam

Oxlint rules that restrict TypeScript to a small dialect modeled on [Gleam](https://gleam.run/documentation/conventions-patterns-and-anti-patterns/). The dialect has no exceptions, `null`, classes, enums, loops, mutable bindings, or shared mutation, and no direct use of the clock, randomness, network, or files. Failure is a returned `Result`, data is types and discriminated unions, and behavior is plain module functions.

It is built for coding agents. A smaller language leaves an agent fewer ways to write the same thing wrong, and every lint message names the replacement to use.

This is a fork of [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop) that keeps only the dialect. The fork's earlier generic and Effect rules live on in git history at the `generic-rules` tag.

## What the dialect looks like

```ts
// Rejected: throws, returns null, reads the clock directly.
function findSession(id: SessionId): Session | null {
  const session = sessions.get(id);
  if (session === undefined) throw new Error(`missing ${id}`);
  return session.expiresAt < Date.now() ? null : session;
}

// Accepted: failure is a value, and the clock is a parameter.
function findSession(sessions: Sessions, id: SessionId, now: () => number): Result<Session, SessionError> {
  const session = sessions.get(id);
  if (session === undefined) return err({ kind: "SessionNotFound", id });
  if (session.expiresAt < now()) return err({ kind: "SessionExpired", id });
  return ok(session);
}
```

Code that cannot follow the dialect, such as a library that throws or a framework that needs a class, goes in a boundary module named `*.ffi.ts`, the counterpart of Gleam's `@external`. The rules skip these files. A boundary module wraps the foreign API and exports plain functions that return `Result` or `undefined`. The program's entry point is usually one too: it creates the real clock, `fetch`, and file access and passes them in.

## Rules

Every rule below skips `*.ffi.*` files.

| Rule | Rejects | Write instead |
|---|---|---|
| `no-throw` | `throw` | return a `Result`; for a broken invariant, call a `panic` helper from a boundary module |
| `no-try-catch` | `try` statements | wrap throwing code in a boundary module, or convert a rejection inline with `.then(ok, (cause: unknown) => err(...))` |
| `no-null` | `null` values and types | `undefined`; convert foreign `null` where it arrives with `?? undefined`. Comparisons such as `match === null` stay valid |
| `no-classes` | classes and `this` | types plus module functions. `Error` subclasses become failure variants; a class a framework requires goes in a boundary module |
| `no-enums` | `enum`, `const enum`, `declare enum` | string literal or discriminated unions |
| `no-loops` | `while`, `do...while`, C-style `for`, `for...in` | collection methods, `for...of`, or recursion that fails at a named limit |
| `no-mutable-bindings` | `let`, `var`, and reassignment | `const`. State that callbacks change goes in one `const state = { ... }` object, reported once per function |
| `no-shared-mutation` | property writes, `delete`, array mutators, and `Object.assign` on parameters, imports, or module state | return a new value. Values created locally may still be built up in place |
| `no-ambient-capabilities` | the clock, randomness, timers, global `fetch`, `process`, and I/O modules such as `node:fs` | take them as parameters; tests pass fakes |
| `no-module-mocking` | `vi.mock`, `jest.mock`, and their variants | pass fakes through the same parameters |

Each rule's file in [`src/rules/`](src/rules) holds its full behavior, and the test beside it shows accepted and rejected code.

`src/config.json` also turns on Oxlint's type-aware `typescript/*` rules, which see what syntax cannot:
- `switch-exhaustiveness-check` stands in for Gleam's exhaustive `case`. It requires a `case` for every union member and rejects a `default` that hides a missing one.
- `strict-boolean-expressions` requires real booleans in conditions, but allows an optional boolean such as `context?.hasUI`.
- The `no-unsafe-*` rules keep `any` from escaping a parse.
- `no-floating-promises` and its relatives catch unhandled promises.

### Tests

Tests need what the dialect forbids: they repeat actions, use fakes that record calls, wait on real timers, and reproduce wire data that contains `null`. In `*.test.*` and `*.spec.*` files the config therefore turns off every dialect rule except three: `no-classes` (a fake can be an object literal), `no-enums`, and `no-module-mocking`.

## Install

The plugin is meant to be vendored. Copy it into the repository, then read it and change it to suit you. The install skill does this:

```bash
npx skills add m0hill/anti-slop --skill install-anti-slop-gleam
```

Then ask your agent to install anti-slop-gleam. The skill:
- copies `src/` (without tests) to `tools/oxlint/anti-slop-gleam/`;
- installs `oxlint`, `@oxlint/plugins`, and `oxlint-tsgolint` at matching versions;
- extends `config.json` and runs lint;
- offers to add the conventions to `AGENTS.md`;
- records the source commit in `UPSTREAM.md`.

It can also update an existing copy without discarding local changes.

To install by hand, copy `src/` yourself, install those three packages as exactly pinned development dependencies, and extend the config:

```json
{
  "extends": ["./tools/oxlint/anti-slop-gleam/config.json"],
  "ignorePatterns": ["tools/oxlint/anti-slop-gleam/**", ".claude/**", ".codex/**", ".pi/**"]
}
```

Also set up the following:
- Run Oxlint with `--format default`. Without it, Oxlint prints nothing on a clean run, so an agent cannot tell a pass from a run that checked nothing.
- Enable `strict`, `exactOptionalPropertyTypes`, and `noUncheckedIndexedAccess` in `tsconfig.json`.
- Add a schema library such as [Zod](https://zod.dev) to parse untyped input. Its `safeParse` already returns a result value.
- Add a project-owned `Result` type. [`conventions.md`](skills/install-anti-slop-gleam/references/conventions.md) shows one.

### Agent conventions

Lint messages reach an agent only after it writes a rejected pattern. [`conventions.md`](skills/install-anti-slop-gleam/references/conventions.md) describes the dialect up front, including practices no rule can check, such as limits on polling and retries. Put it in the repository's `AGENTS.md`.

## Limits

The rules read syntax and lexical scope through Oxlint's ESTree API, without type information. They resolve names within a file but not across imports. For example, `no-shared-mutation` treats every parameter as shared, and does not check `Map` and `Set` methods, because `set`, `add`, and `delete` also name ordinary service methods. The type-aware `typescript/*` rules cover what needs types.

## Repository layout

| Path | Contents |
|---|---|
| `src/index.ts` | the plugin, which registers every rule |
| `src/config.json` | the configuration installs extend |
| `src/rules/` | one file per rule, with its RuleTester suite beside it |
| `src/shared/` | helpers for boundary files and scope lookup |
| `skills/install-anti-slop-gleam/` | the install skill, its conventions, and a synced copy of `src/` |
| `scripts/` | the skill sync and the check that the conventions mention every rule |
| `dogfood/` | the agent trials that compare this dialect with the generic rules, and their results |

## Development

```bash
pnpm install
pnpm check
```

`pnpm check` lints `src/` with its own config, runs every rule's tests, typechecks, and verifies that the skill's copy of `src/` is current and that the conventions mention every enabled rule. After changing `src/`, run `pnpm sync:skill`.

## License

MIT
