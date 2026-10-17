# Rules

Every rule here exists for the same reason: to make TypeScript code easier to follow by giving each problem one obvious solution. Each section says what the rule catches, why, and what to write instead.

All rules skip IO files (`*.io.ts`, explained in the [README](../README.md#io-files)). In test files, most of them are turned off; see [Tests](#tests) at the end.

- [no-throw](#no-throw)
- [no-try-catch](#no-try-catch)
- [no-null](#no-null)
- [no-classes](#no-classes)
- [no-enums](#no-enums)
- [no-loops](#no-loops)
- [no-mutable-bindings](#no-mutable-bindings)
- [no-shared-mutation](#no-shared-mutation)
- [no-ambient-capabilities](#no-ambient-capabilities)
- [no-module-mocking](#no-module-mocking)
- [Type-aware rules](#type-aware-rules)

## no-throw

**Catches:** `throw`.

**Why:** A function that throws hides its failures. Its signature says it returns a `User`, but it might not, and nothing tells the caller to handle that. Returning a `Result` puts the failure in the type, so the caller has to deal with it.

```ts
// Rejected
function findUser(id: UserId): User {
  const user = users.get(id);
  if (user === undefined) throw new Error("not found");
  return user;
}

// Instead
function findUser(id: UserId): Result<User, UserError> {
  const user = users.get(id);
  if (user === undefined) return err({ kind: "UserNotFound", id });
  return ok(user);
}
```

For a real bug, where the program should crash, call a `panic` helper defined in an IO file.

## no-try-catch

**Catches:** `try` statements.

**Why:** If nothing in the program throws, nothing needs catching. Libraries and Node APIs still throw, so it gets wrapped once, in an IO file, and the rest of the code only sees `Result` values.

```ts
// Rejected
try {
  const data = JSON.parse(text);
} catch { ... }

// Instead, in json.io.ts
export function parseJson(text: string): Result<unknown, JsonError> {
  try { return ok(JSON.parse(text)); }
  catch (cause) { return err({ kind: "InvalidJson", cause }); }
}
```

A promise that might reject can be converted where you await it, with no IO file:

```ts
const response = await fetch(url).then(ok, (cause: unknown) => err({ kind: "NetworkError", cause }));
```

## no-null

**Catches:** `null` values and the `null` type.

**Why:** JavaScript has two values for "nothing", `null` and `undefined`. Allowing both means every check has to think about both. This rule keeps only `undefined`.

```ts
// Rejected
function middleName(person: Person): string | null { ... }

// Instead
function middleName(person: Person): string | undefined { ... }
```

**Allowed:** comparing with `null`, so you can still handle APIs that return it. Convert it where it arrives: `headers.get(name) ?? undefined`, or check `match === null`.

## no-classes

**Catches:** classes, and `this` outside a class.

**Why:** A class bundles data, behavior, and hidden state into one thing. Plain types plus functions keep them separate: the data is visible, and each function says exactly what it takes and returns.

```ts
// Rejected
class Cart {
  items: Item[] = [];
  add(item: Item) { this.items.push(item); }
}

// Instead
type Cart = { readonly items: readonly Item[] };
const addItem = (cart: Cart, item: Item): Cart => ({ items: [...cart.items, item] });
```

The message changes with the case:
- **A class that extends `Error`** should become a failure variant such as `{ kind: "NotFound", id }`, returned in a `Result`.
- **A class a framework requires**, such as a web component, goes in an IO file.

## no-enums

**Catches:** `enum`, `const enum`, and `declare enum`.

**Why:** TypeScript enums are a special feature with odd runtime behavior. A union of strings does the same job, is plain data, and works with exhaustive `switch` checks.

```ts
// Rejected
enum Status { Active, Suspended }

// Instead
type Status = "active" | "suspended";
```

## no-loops

**Catches:** `while`, `do...while`, C-style `for (let i = 0; ...)`, and `for...in`.

**Why:** These loops need a counter or flag that changes on every pass, and their end condition is easy to get wrong. Collection methods say what the loop is for.

```ts
// Rejected
for (let i = 0; i < users.length; i++) names.push(users[i].name);

// Instead
const names = users.map((user) => user.name);
```

**Allowed:** `for (const item of items)` and every collection method.

For work that repeats until something happens, such as polling, paging, or retrying, use recursion with a counter, and stop with a failure at a named limit. A remote service that never finishes should not hang the program.

```ts
async function fetchAll(client: Client, page: number, items: Item[]): Promise<Result<Item[], FetchError>> {
  if (page >= MAX_PAGES) return err({ kind: "TooManyPages" });
  const batch = await client.fetchPage(page);
  if (!batch.ok) return batch;
  const all = [...items, ...batch.value.items];
  return batch.value.hasMore ? fetchAll(client, page + 1, all) : ok(all);
}
```

## no-mutable-bindings

**Catches:** `let`, `var`, and reassigning a variable (`x = ...`, `x++`).

**Why:** When a name can hold different values over time, you have to trace the code to know what it holds right now. With `const`, every name means one thing.

```ts
// Rejected
let total = 0;
for (const item of items) total += item.price;

// Instead
const total = items.reduce((sum, item) => sum + item.price, 0);
```

**Long-lived state.** Sometimes state really does change over time, for example a connection that event handlers open and close. For that case the rule asks you to keep all such state in one object:

```ts
// Rejected: two loose variables that callbacks change
function connect(open: () => Socket) {
  let socket: Socket | undefined;
  let retries = 0;
  ...
}

// Instead: one place to look for everything that changes
type Connection = { socket: Socket | undefined; retries: number };

function connect(open: () => Socket) {
  const state: Connection = { socket: undefined, retries: 0 };
  ...
}
```

Keep the `state` object inside the function that sets it up. At module level it would be shared, and `no-shared-mutation` would reject changing it.

These variables are reported together, once per function, because the fix for all of them is the same `state` object.

## no-shared-mutation

**Catches:** changing a value that came from somewhere else:
- writing a property (`user.name = ...`);
- `delete`;
- array methods that change the array in place (`push`, `sort`, `splice`, ...);
- `Object.assign(target, ...)`.

It catches these only on parameters, imports, and module-level variables.

**Why:** If a function changes an object it was given, every other piece of code holding that object sees the change too. Returning a new value keeps the change where it was made.

```ts
// Rejected
function rename(user: User, name: string) { user.name = name; }

// Instead
const rename = (user: User, name: string): User => ({ ...user, name });
```

**Allowed:** changing values you created in the same function, such as building up a local array before returning it. `Map` and `Set` methods are not checked, because names like `set`, `add`, and `delete` are also common in ordinary APIs.

## no-ambient-capabilities

**Catches:** reaching for the outside world directly:

| Category | Examples |
|---|---|
| Clock | `Date.now()`, `new Date()`, `performance.now()` |
| Randomness | `Math.random()`, `crypto.randomUUID()` |
| Timers | `setTimeout`, `setInterval` |
| Network | global `fetch`, `WebSocket` |
| Environment | `process` |
| I/O modules | `node:fs`, `node:http`, `node:child_process`, ... |

**Why:** Code that reads the clock or the network directly is hard to test and hard to reason about, because its result depends on something outside its inputs. Taking these as parameters makes every input visible, and tests can pass fakes.

```ts
// Rejected
function isExpired(session: Session) { return session.expiresAt < Date.now(); }

// Instead
function isExpired(session: Session, now: () => number) { return session.expiresAt < now(); }
```

The real clock, `fetch`, and so on are created once, in the program's entry point (an IO file), and passed in.

**Allowed:** `new Date(value)` with an argument, which only parses a date. Type-only imports such as `import type { Stats } from "node:fs"` are also allowed.

## no-module-mocking

**Catches:** `vi.mock`, `jest.mock`, `vi.doMock`, and `jest.unstable_mockModule`.

**Why:** Module mocking swaps out an import behind the code's back, so a test can pass while the real wiring is broken. Since every dependency is already a parameter, tests should just pass a fake one. This is the one rule that only matters in tests, and it stays on there.

```ts
// Rejected
vi.mock("./clock");

// Instead
const result = isExpired(session, () => 1_000);
```

## Type-aware rules

`config.json` also turns on Oxlint's built-in `typescript/*` rules. These need type information, which the rules above do not have. The most important ones:

| Rule | What it does |
|---|---|
| `switch-exhaustiveness-check` | Every `switch` over a union handles every member, with no `default` hiding a missing one. Adding a new variant then shows every place that must handle it. |
| `strict-boolean-expressions` | Conditions must be real booleans: write `text.length > 0`, not `text`. This avoids bugs where `0` or `""` counts as false. An optional boolean such as `context?.hasUI` is fine. |
| `no-unsafe-*` | `any` must not spread. Parse untyped input with a schema library where it enters. |
| `no-floating-promises`, `no-misused-promises` | Every promise is awaited or returned. |
| `no-unnecessary-condition` | No checks for things the types already rule out. |

The rest cover `throw` and `reject` with non-errors, and string building with values that do not print well.

## Tests

Tests need things these rules forbid. They repeat actions, use fakes that record calls, wait on real timers, and copy wire data that contains `null`. So in `*.test.*` and `*.spec.*` files these rules are off:
- `no-throw`
- `no-try-catch`
- `no-null`
- `no-loops`
- `no-mutable-bindings`
- `no-shared-mutation`
- `no-ambient-capabilities`

Three stay on: `no-classes` (a fake can be a plain object), `no-enums`, and `no-module-mocking`.
