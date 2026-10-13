# anti-slop

[![skills.sh](https://skills.sh/b/dmmulroy/anti-slop)](https://skills.sh/dmmulroy/anti-slop)

Opinionated Oxlint rules that reject low-evidence and low-signal TypeScript and JavaScript patterns.

Anti-slop is first and foremost the ruleset I use with my work, projects, and team. It reflects my preferences and taste rather than attempting to be a universal coding standard.

**This project is meant to be vendored**, not treated as a fixed npm dependency. There is no official npm package. Copy the rules into your repository, read them, and change them to match your team's standards. The bundled agent skill handles the initial copy and configuration; after that, the vendored files are yours to maintain and make your own. Community-maintained forks and packages are welcome, but their compatibility and release lifecycle belong to their maintainers.

## Install with an agent skill

```bash
npx skills add dmmulroy/anti-slop --skill install-anti-slop
```

Then ask your coding agent to install or configure anti-slop in the current repository. The skill copies the plugin, installs compatible Oxlint dependencies—matching an existing Oxlint version when present—merges the plugin into the existing lint configuration, enables every generic rule, and validates the result. In repositories that depend directly on Effect, it also enables the opt-in Effect rule group.

### Update an existing installation

Ask your agent to **update anti-slop while preserving local customizations**, optionally naming an upstream revision or selected fixes. The same skill stages incoming source separately, uses a three-way merge when the original upstream snapshot is recoverable, and otherwise ports reviewed changes conservatively. It preserves local rules and configuration, asks about conflicting policy and enabling new rules, and records provenance for future updates. It does not force-replace the vendored directory.

For latest upstream, ask the agent to retrieve and identify that revision; an already-installed skill bundle may be older. The copy script itself does not fetch or merge updates.

To inspect available skills first:

```bash
npx skills add dmmulroy/anti-slop --list
```

## Manual local installation

Copy `src/` into the target repository, for example at `tools/oxlint/anti-slop/`. If the repository already uses `oxlint`, install `@oxlint/plugins` at exactly the resolved Oxlint version. Otherwise, install the same current version of both packages. Keep both versions exact so upgrades move them together. Also install `oxlint-tsgolint`, which runs Oxlint's type-aware rules.

Register the copied entry point in `oxlint.config.ts`:

```ts
import { defineConfig } from "oxlint";

export default defineConfig({
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
  rules: {
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
});
```

### Type-aware rules

The anti-slop rules read syntax only; Oxlint gives JS plugins no type information. Oxlint's built-in type-aware rules close the gaps syntax cannot see, such as `any` escaping a schema, unhandled promises, and non-exhaustive `switch` statements. Enable them alongside the plugin:

```ts
export default defineConfig({
  options: { typeAware: true },
  rules: {
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
});
```

`switch-exhaustiveness-check` requires every member of a union to have its own `case`, even when a `default` exists, so adding a variant breaks every `switch` that must handle it:

```ts
switch (payment.kind) {
  case "card": return chargeCard(payment);
  default: return chargeBank(payment); // reported: "bank" is not matched
}
```

Its options also reject a `default` on a `switch` that already handles every member, and require one on a `switch` over a non-union type such as `string`. Group variants that share a branch with stacked `case` labels instead of a `default`.

`node:test` runs `describe`, `it`, and `test` without awaiting their returned promises, so `no-floating-promises` allows those calls; add the equivalent entry for another test runner whose registration functions return promises.

Type-aware rules read the nearest `tsconfig.json`. Enable `strict`, `exactOptionalPropertyTypes`, and `noUncheckedIndexedAccess` there; without `noUncheckedIndexedAccess`, `no-unnecessary-condition` reports necessary `undefined` checks on indexed reads as always false.

The same `ignorePatterns`, `jsPlugins`, and rules work under `lint` in a Vite+ config. Merge the ignore patterns into Vite+'s `fmt.ignorePatterns` as well so `vp check` does not reformat installed agent assets or the vendored plugin. Preserve existing ignores and add any other project-local agent tooling directories detected in the repository; do not broadly ignore every dot-directory.

### Agent conventions

Lint messages reach an agent only after it writes a banned pattern. [`agent-conventions.md`](skills/install-anti-slop/references/agent-conventions.md) names the intended replacements up front, including practices no rule can check, such as limits on polling and pagination. Add it to the repository's `AGENTS.md`; the install skill offers to.

### Optional Effect rules

Effect-specific rules live in a separate plugin so projects that do not use Effect do not inherit Effect architecture policy. Register the Effect entry point only in repositories that use Effect:

```ts
export default defineConfig({
  jsPlugins: [
    { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
    {
      name: "anti-slop-effect",
      specifier: "./tools/oxlint/anti-slop/effect/index.ts"
    }
  ],
  rules: {
    "anti-slop-effect/no-manual-effect-error-tag": "error",
    "anti-slop-effect/no-manual-tag-comparison": "error",
    "anti-slop-effect/no-manual-tagged-construction": "error",
    "anti-slop-effect/no-service-constructor-imports": "error",
    "anti-slop-effect/prefer-effect-match": "error"
  }
});
```

### Optional Gleam dialect rules

The Gleam plugin restricts TypeScript to a small dialect modeled on [Gleam](https://gleam.run/documentation/conventions-patterns-and-anti-patterns/): no exceptions, `null`, classes, enums, loops, mutable bindings, mutation of shared values, or ambient clocks, randomness, network, and file access. Failure is returned as a `Result`, data is modeled with types and discriminated unions, and behavior lives in module functions. Constraining the language leaves agents fewer ways to write the same thing wrong.

Every rule exempts boundary modules named `*.ffi.ts` (or any `*.ffi.{js,jsx,ts,tsx,mts,cts,mjs,cjs}`), the dialect's equivalent of Gleam's `@external`. Boundary modules wrap throwing, nullable, or class-based foreign APIs and export typed functions that return `Result` values. Use Oxlint `overrides` to relax rules for other paths, such as tests.

Decode untyped input with a schema library. If the project has none, add [Zod](https://zod.dev): `schema.safeParse(value)` already returns a result value instead of throwing, which fits the dialect. Without a schema library, agents satisfy `no-runtime-typeof` with harder-to-read equivalents of `typeof`.

```ts
export default defineConfig({
  jsPlugins: [
    { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
    {
      name: "anti-slop-gleam",
      specifier: "./tools/oxlint/anti-slop/gleam/index.ts"
    }
  ],
  rules: {
    "anti-slop-gleam/no-ambient-capabilities": "error",
    "anti-slop-gleam/no-classes": "error",
    "anti-slop-gleam/no-enums": "error",
    "anti-slop-gleam/no-loops": "error",
    "anti-slop-gleam/no-mutable-bindings": "error",
    "anti-slop-gleam/no-null": "error",
    "anti-slop-gleam/no-shared-mutation": "error",
    "anti-slop-gleam/no-throw": "error",
    "anti-slop-gleam/no-try-catch": "error"
  }
});
```

The rules expect a project-owned `Result` type, for example:

```ts
export type Result<Value, Error> =
  | { readonly ok: true; readonly value: Value }
  | { readonly ok: false; readonly error: Error };
```

Keep the type-aware rules enabled with this plugin: `typescript/switch-exhaustiveness-check` supplies Gleam's exhaustive `case`. `no-reduce-accumulator-copy` and `oxc/no-accumulating-spread` steer reducers toward mutating their accumulator, which `no-shared-mutation` rejects because the accumulator is a parameter; prefer `for...of` or a small `fold` helper over `reduce`.

## Rules

### Generic rules

- `no-array-filter-map` — rejects adjacent eager array filter/map passes while allowing lazy iterator pipelines.
- `no-reduce-accumulator-copy` — rejects non-spread accumulator copies inside reducers; complements native `oxc/no-accumulating-spread`.
- `no-chained-type-assertions` — rejects nested `as` and angle-bracket assertions that fabricate evidence; chains made only of `as const` remain valid.
- `no-conditional-empty-object-spread` — reports object spreads that use a conditional `{}` branch to omit fields. It intentionally has no autofix because omission is not equivalent to assigning `undefined`.
- `no-known-value-widening` — rejects known expressions flowing into explicit `unknown`, `object`, anonymous-object, or open-dictionary targets, including known arguments passed to local `unknown` type predicates. Empty dictionary accumulators and finite-key `Record` targets remain valid.
- `no-module-mocking` — rejects Vitest and Jest `mock`, `doMock`, and `unstable_mockModule` calls in favor of real dependency seams.
- `no-object-parameters` — rejects `object`, unions containing it, and scoped or transparent generic aliases that resolve to it on function inputs.
- `no-reflect-apply` — rejects global `Reflect.apply` in favor of typed function calls.
- `no-reflect-get` — rejects global `Reflect.get` in favor of typed property access or boundary parsing.
- `no-runtime-typeof` — requires boundary parsing instead of ad hoc `typeof` narrowing, including disguised equivalents such as `String(value) === value`, `Object(value) === value`, and `value instanceof Object`. Existence probes against the string `"undefined"` are allowed, and type predicates can be enabled explicitly.
- `no-shape-in-symbol-names` — rejects the case-insensitive substring `shape` in locally owned symbol names while allowing static member names such as Zod's `schema.shape` that cannot be renamed locally.
- `no-unknown-parameters` — rejects `unknown` and unions containing it on function inputs, including members of object parameters wrapped in `Readonly`, `Partial`, or `Required`, except the explicit `cause` convention, the rejection reason of an inline `.catch(...)` or `.then(..., ...)` handler, and the exact subject of a type predicate.
- `no-unknown-returns` — rejects explicit function contracts that resolve to `unknown`, `Promise<unknown>`, or `PromiseLike<unknown>`, including scoped and transparent generic aliases.
- `no-unknown-type-aliases` — rejects scoped and transparent generic aliases whose resolved type is `unknown`.
- `no-unsafe-dictionary-type` — rejects dictionary value contracts based on `unknown`, `any`, `object`, `{}`, and semantic equivalents. Generic constraints such as `T extends Record<string, unknown>` are allowed.
- `no-widen-then-assert` — rejects immutable local flows that widen known evidence to `unknown`, `any`, `object`, or a broad record and later assert it back to a narrower type.
- `require-safety-comment-for-type-assertion` — requires each non-const assertion to have a nearby, non-empty invariant justification. Marker prefixes are configurable and default to `SAFETY`.

### Effect rules

- `no-manual-effect-error-tag` — rejects manual `_tag` comparisons and switches inside broad `Effect.catch`, `Effect.catchAll`, and `Effect.catchIf` handlers in favor of tagged error handlers.
- `no-manual-tag-comparison` — rejects direct `_tag` comparisons and `_tag` switches in favor of `Match`, `Predicate.isTagged`, or tagged-enum matching.
- `no-manual-tagged-construction` — rejects literal `_tag` object construction in favor of Schema, tagged class/error, or `Data.taggedEnum` constructors. `Match.when` and `Match.not` patterns remain allowed.
- `no-service-constructor-imports` — rejects named `make<CapabilityName>` imports from relative project modules outside `*.test.*` and `*.spec.*` files. Runtime callers should import the owning Layer and yield the contextual service instead. Package and path-alias imports, default imports, and static constructors such as `WorkspaceName.make` are outside the rule.
- `prefer-effect-match` — rejects chained literal ternaries over the same value in favor of Effect's `Match` API.

### Gleam dialect rules

All Gleam dialect rules are skipped in `*.ffi.*` boundary modules.

- `no-classes` — rejects class declarations, class expressions, and `this` outside classes in favor of types and module functions.
- `no-enums` — rejects `enum`, `const enum`, and `declare enum` in favor of literal or discriminated unions.
- `no-ambient-capabilities` — rejects direct use of the clock (`Date.now()`, `new Date()`), randomness, timers, global `fetch`, `process`, and I/O modules such as `node:fs`. Take them as parameters and pass the real ones in from a `.ffi.ts` entry point, as Effect does with services and layers; tests then pass fakes. `new Date(value)` and type-only imports remain valid.
- `no-loops` — rejects `while`, `do...while`, C-style `for`, and `for...in`; `for...of` and collection methods remain valid. Repeat-until work such as retries, polling, or pagination recurses with a counter parameter and fails at a named limit. Gleam recursion runs in constant stack space; JavaScript recursion does not, and an unbounded remote loop never ends.
- `no-mutable-bindings` — rejects `let`, `var`, and reassignment or update of bindings, including destructuring assignment. Property writes are covered by `no-shared-mutation`.
- `no-null` — rejects `null` literals and `null` types; model absence with `undefined` or a `Result` error. Foreign `null` needs no boundary module: convert it where it arrives with `?? undefined`, or narrow it with an equality comparison such as `match === null`.
- `no-shared-mutation` — rejects property writes, `delete`, array mutators such as `push` and `sort`, and `Object.assign` targets rooted in a parameter, import, or module-level binding. Values created locally may still be built up in place. Map and Set methods are not checked because `set`, `add`, and `delete` also name ordinary service methods.
- `no-throw` — rejects `throw` in favor of returning a `Result`. Unrecoverable invariants call a `panic` helper defined in a boundary module.
- `no-try-catch` — rejects `try` statements; catch foreign exceptions once in a boundary module and return a `Result`.

### Analysis boundaries

The rules use Oxlint's ESTree and lexical-scope APIs rather than a TypeScript type checker. They resolve same-file aliases—including block-scoped aliases, forward references, and transparent generic aliases—but do not infer imported type definitions or cross-file call signatures. Rules that inspect calls therefore document when enforcement is intentionally local.

## Violation examples

Each snippet below is rejected by the named rule.

### `no-array-filter-map`

```ts
const users: User[] = loadUsers();
const emails = users.filter(user => user.active).map(user => user.email);
const found = users.map(lookup).filter(value => value !== undefined);
```

Prefer lazy iterator helpers where the target runtime supports them:

```ts
const emails = users.values()
  .filter(user => user.active)
  .map(user => user.email)
  .toArray();
```

A single `flatMap(user => user.active ? [user.email] : [])` or a reducer that pushes into a fresh local array is also allowed. Iterator helpers avoid intermediate arrays and per-item wrapper arrays, but are not guaranteed to be faster. Check runtime support; TypeScript library declarations do not polyfill them.

This AST/scope rule recognizes array literals, direct array/tuple annotations, immutable local aliases, and supported array-preserving method chains. Unknown receivers (including imported factory results and unannotated parameters), type aliases, and property-based array types are not inferred. Iterator pipelines are not flagged. Both `filter().map()` and `map().filter()` are covered, regardless of predicate. There is no autofix: callback ordering, indexes, `thisArg`, sparse arrays, and truthiness filtering must be reviewed before changing APIs.

### `no-reduce-accumulator-copy`

```ts
items.reduce((acc, item) => Object.assign({}, acc, { [item.id]: item }), {});
items.reduce((acc, item) => acc.concat([item]), []);
items.reduce((acc, item) => {
  const next = acc.slice();
  next.push(item);
  return next;
}, []);
```

Instead, mutate a fresh, locally owned accumulator and return it:

```ts
items.reduce((acc, item) => {
  acc.push(item);
  return acc;
}, []);
```

`Object.assign(acc, item)` is also allowed. Copying individual input items is not copying accumulated state.

The rule covers inline `reduce`/`reduceRight` callbacks, including index parameters, and immutable local accumulator aliases. It detects global `Object.assign` with an object-literal target and the accumulator as a source, global `Array.from(acc)`, and array accumulator calls to `concat`, `slice`, `toSpliced`, `toSorted`, `toReversed`, and `with`. Array copy methods require local array evidence for the initial value so string concatenation and unknown custom collections are not flagged. Like the native rule, reducer method names are syntactic evidence, not proof of the receiver's runtime type. Named callbacks, nested functions, indirect copy helpers, nested accumulator properties, and reassigned aliases are outside its scope. Copying a bounded accumulator is not necessarily quadratic, but these patterns are rejected because growing accumulators can be.

Enable native `oxc/no-accumulating-spread` alongside it for array/object spreads in reducers and supported loops. Neither rule proves that every possible quadratic reduction is absent. No automatic mutation rewrite is provided because accumulator ownership cannot be established syntactically.

### `no-chained-type-assertions`

```ts
const user = input as object as User;
```

### `no-conditional-empty-object-spread`

```ts
const options = {
  ...(timeout !== undefined ? { timeout } : {}),
};
```

### `no-known-value-widening`

```ts
const handlers: Record<string, Handler> = {
  start: startHandler,
};
```

This discards the known `start` key. Preserve inference or use `satisfies Record<string, Handler>` instead.

Known values must not be widened back to `unknown` through a local type predicate:

```ts
function isUser(value: unknown): value is User {
  return UserSchema.safeParse(value).success;
}

declare const user: User;
isUser(user);
```

Call the predicate at the unparsed boundary, while the argument is still `unknown`.

### `no-module-mocking`

```ts
vi.mock("./user-store");
```

### `no-object-parameters`

```ts
function save(value: object) {}
```

### `no-reflect-apply`

```ts
const value = Reflect.apply(operation, owner, args);
```

### `no-reflect-get`

```ts
const value = Reflect.get(owner, key);
```

### `no-runtime-typeof`

```ts
if (typeof input === "string") {
  useName(input);
}
```

Parse with the project's schema library instead, and add Zod if there is none. Without one, agents tend to satisfy the rule with equivalents such as `value?.constructor === String`. Projects that cannot add a schema library can permit `typeof` checks directly inside type predicate and
assertion functions while continuing to reject ad hoc checks elsewhere:

```json
{
  "anti-slop/no-runtime-typeof": [
    "error",
    { "allowInTypeGuards": true }
  ]
}
```

The option defaults to `false`. Existence probes such as `typeof document === "undefined"` are always allowed because they establish whether a binding exists rather than narrow its representation.

### `no-shape-in-symbol-names`

```ts
interface UserShape {
  id: string;
}
```

Static member reads such as `schema.shape` are allowed because the member name belongs to the value's owner and cannot be renamed locally.

### Effect: `no-service-constructor-imports`

```ts
import { makeIssueService } from "./issue-service.ts";
```

Import the owning Layer and yield `IssueService` instead. Focused `*.test.*` and `*.spec.*` files may import the constructor directly.

### Effect: tagged values and matching

Direct tag checks are rejected by `no-manual-tag-comparison`:

```ts
if (result._tag === "Ready") useReady(result);
```

Use `Predicate.isTagged` for a predicate or `Match` for branching:

```ts
if (Predicate.isTagged("Ready")(result)) useReady(result);
```

Literal tag objects are rejected by `no-manual-tagged-construction`:

```ts
const result = { _tag: "Ready", value };
```

Use the existing Schema, tagged class/error, or `Data.taggedEnum` constructor instead, such as `Ready.make({ value })`. Object patterns passed directly to `Match.when` and `Match.not` remain allowed.

Manual tag branching in broad catch handlers is rejected by `no-manual-effect-error-tag`:

```ts
program.pipe(
  Effect.catch((error) =>
    error._tag === "NotFound" ? recover : Effect.fail(error)
  )
);
```

Use the selective error operator:

```ts
program.pipe(Effect.catchTag("NotFound", () => recover));
```

For a tagged `error.reason`, use `Effect.catchReason` or `Effect.catchReasons`.

Repeated literal ternaries over the same value are rejected by `prefer-effect-match`:

```ts
const label = kind === "a" ? "A" : kind === "b" ? "B" : "Other";
```

Use `Match`:

```ts
const label = Match.value(kind).pipe(
  Match.when("a", () => "A"),
  Match.when("b", () => "B"),
  Match.orElse(() => "Other")
);
```

These rules are syntactic. They recognize direct `Effect.catch*` and `Match.when`/`Match.not` calls under those exact identifiers and do not resolve import aliases or verify that similarly named objects came from Effect. `prefer-effect-match` compares the source text of the repeatedly tested expression; it does not infer its type or prove exhaustiveness.

### Gleam: failure and absence

```ts
function findUser(id: UserId): User | null {
  const user = users.get(id);
  if (user === undefined) throw new Error(`missing ${id}`);
  return user;
}
```

Return the failure instead:

```ts
function findUser(id: UserId): Result<User, UserNotFound> {
  const user = users.get(id);
  if (user === undefined) return { ok: false, error: { kind: "UserNotFound", id } };
  return { ok: true, value: user };
}
```

### `no-unknown-parameters`

```ts
function handle(input: unknown) {}
```

A type predicate may accept `unknown` for the parameter it narrows; other `unknown`
parameters on the same function remain rejected. An inline promise rejection handler
may accept `unknown` for its reason, which has no earlier boundary to parse it at:

```ts
load().catch((error: unknown) => report(error));
```

### `no-unknown-returns`

```ts
function loadUser(): unknown {
  return input;
}
```

### `no-unknown-type-aliases`

```ts
type ExternalValue = unknown;
```

### `no-unsafe-dictionary-type`

```ts
type Metadata = Record<string, unknown>;
type OtherMetadata = { [key: string]: object };
```

### `no-widen-then-assert`

```ts
const loaded: User = loadUser();
const stored: unknown = loaded;
const user = stored as User;
```

### `require-safety-comment-for-type-assertion`

```ts
const userId = value as UserId;
```

Add a specific justification immediately before a necessary assertion:

```ts
// SAFETY: parseUserId validated the identifier before branding it.
const userId = value as UserId;
```

`SAFETY` remains the default marker. Comments immediately above exported declarations are recognized. Repositories with an established convention can configure one or more alternatives; every marker must still be followed by a colon and a non-empty justification:

```json
{
  "anti-slop/require-safety-comment-for-type-assertion": [
    "error",
    { "markers": ["INVARIANT", "SAFETY"] }
  ]
}
```

## Development

```bash
pnpm install
pnpm check
```

`src/` is canonical. After changing production source, run `pnpm sync:skill-assets`; CI checks that the skill's bundled copy remains identical. `pnpm check` runs Oxlint, every RuleTester suite, TypeScript typechecking, and the skill-asset drift check.

## License

MIT
