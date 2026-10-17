# fp

Lint rules that keep TypeScript in a simple, functional style.

## Why

Coding agents write TypeScript fast, but TypeScript offers many ways to do the same thing, and many of them hide bugs:
- exceptions nobody catches;
- two kinds of "nothing" (`null` and `undefined`);
- objects changed behind your back;
- code that quietly reads the clock or the network.

These rules remove those options and leave the core ideas of functional programming:
- **Failures are values.** Functions return a `Result` instead of throwing, so the type says what can go wrong.
- **Data is immutable.** Types and unions instead of classes and enums. Values are never changed in place; you make a new one.
- **Side effects stay at the edges.** The clock, randomness, network, and files are passed in as parameters. Most code is then pure: the same input always gives the same output, and tests need no mocks.
- **One way to repeat.** Collection methods and `for...of`. Repeat-until work uses recursion with a limit.

Every lint message says what to write instead, so an agent that breaks a rule learns the fix right away.

## The rules

| Rule | Bans | Use instead |
|---|---|---|
| `no-throw` | `throw`, `Promise.reject` | return a `Result` |
| `no-try-catch` | `try` | wrap throwing code once, in an IO file |
| `no-null` | `null` | `undefined` |
| `no-classes` | classes, `this` | types and functions |
| `no-enums` | `enum` | string unions |
| `no-loops` | `while`, `for (;;)`, `for...in` | collection methods, `for...of`, recursion |
| `no-mutable-bindings` | `let`, `var`, reassignment | `const` |
| `no-shared-mutation` | changing parameters, imports, or module state | return a new value |
| `no-ambient-capabilities` | `Date.now()`, `Math.random()`, `fetch`, `process`, `node:fs`, ... | take them as parameters |
| `no-module-mocking` | `vi.mock`, `jest.mock` | pass fakes as parameters |

The config also turns on Oxlint's type-aware TypeScript rules, for example the one that makes every `switch` handle every case.

**[docs/rules.md](docs/rules.md)** explains each rule with examples.

## IO files

Real programs still have to call code that throws, returns `null`, or needs a class, and something has to actually read the clock and talk to the network. That code goes in files named `*.io.ts`, which the rules skip. This is the "functional core, imperative shell" idea: a pure core, with a thin layer around it that does the side effects.

An IO file is a thin wrapper. It calls the outside API, catches its errors, and exports plain functions that return `Result` or `undefined`. The program's entry point is usually an IO file too: it creates the real clock and `fetch` and passes them in.

Keep IO files small. Anything in them is not checked.

## Install

Copy `src/` into your project, for example to `tools/oxlint/fp/`. Then install these three packages at matching versions:
- `oxlint`
- `@oxlint/plugins`
- `oxlint-tsgolint`

Finally, extend the config:

```json
{
  "extends": ["./tools/oxlint/fp/config.json"],
  "ignorePatterns": ["tools/oxlint/fp/**"]
}
```

Or let an agent do it with the [install skill](skills/install-fp-rules/SKILL.md).

Then:
1. Add [conventions.md](skills/install-fp-rules/references/conventions.md) to your `AGENTS.md`. It tells agents how to write this style before they hit a lint error.
2. Run Oxlint with `--format default`, so a clean run still prints something.
3. Turn on `strict`, `exactOptionalPropertyTypes`, and `noUncheckedIndexedAccess` in `tsconfig.json`.
4. Use a schema library such as [Zod](https://zod.dev) to check data coming into the program.

## Project layout

```
src/
  index.ts       registers the rules
  config.json    the config projects extend
  rules/         one file per rule, with its tests beside it
  shared/        small helpers the rules share
docs/rules.md    what each rule does and why
skills/          install skill for agents, with a copy of src/
scripts/         keeps the skill copy and the conventions in sync
dogfood/         trials where agents write code under these rules
```

## Development

```bash
pnpm install
pnpm check       # lint, test, typecheck, and sync checks
pnpm sync:skill  # run after changing src/
```

The rules' own source follows the rules and is linted with `src/config.json`.

## Origin

This started as a fork of [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop). The earlier general-purpose and Effect rules were removed; they are kept in git history under the `generic-rules` tag, and the dogfood trials use them as a comparison.

## License

MIT
