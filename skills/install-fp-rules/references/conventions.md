## TypeScript conventions

This project's lint rules keep TypeScript in a functional style: failures are values, data is never changed in place, and side effects stay at the edges. These are its building blocks.

### Results and failures

- Functions that can fail return the project's `Result` from `src/result.ts`; create it if it is missing:

  ```ts
  export type Result<Value, Error> =
    | { readonly ok: true; readonly value: Value }
    | { readonly ok: false; readonly error: Error };
  export const ok = <Value>(value: Value): Result<Value, never> => ({ ok: true, value });
  export const err = <Error>(error: Error): Result<never, Error> => ({ ok: false, error });
  ```

- Model each failure as a union variant with a `kind` and the ids a caller needs: `{ kind: "BookNotAvailable", bookId }`. After each step that can fail, return early: `const member = findMember(state, id); if (!member.ok) return member;`.
- Return expected failures, such as invalid input, a missing record, or a refused request, as values. Let bugs crash instead of turning them into results.
- Turn an awaited promise's rejection into a `Result` where you await it: `await promise.then(ok, (cause: unknown) => err(...))`.
- Represent absence as `undefined`. Convert a foreign `null` where it arrives: `headers.get(name) ?? undefined`.

### Data and state

- Model data as types and discriminated unions, and behavior as exported functions that take the data as their first argument.
- Parse untyped input with the project's schema library where it enters, and pass the raw value straight to the schema: `response.json().then((body) => PageSchema.safeParse(body))`. Write each data shape once, as a schema, and derive its type: `type Page = z.infer<typeof PageSchema>`.
- Pass state in and return the new state. Update with spreads (`{ ...book, status }`), `toSorted`, and `new Map([...map, [key, value]])`; build a local `const` value when that reads better.
- Keep state that callbacks or event handlers change over time, such as a server handle or a session flag, in one `const state = { ... }` object owned by the function that registers them, and change it only through that object. Keep the decisions about the next state in plain functions that take the old state and return the new one.

### Side effects and foreign code

- Take the clock, randomness, timers, network, environment, and file access as parameters (`now: () => Date`, `fetch: typeof fetch`, `sleep: (ms: number) => Promise<void>`). Create the real ones in an `.io.ts` entry point and pass them in; tests pass fakes.
- Wrap foreign code that throws, returns `null`, or needs a class in a thin `*.io.ts` file that returns `Result` or `undefined`. When a framework expects a thrown error, such as a tool or route handler, keep the logic returning a `Result` and throw once, in a small `.io.ts` helper that unwraps it. Keep domain logic out of `.io.ts` files; the lint rules do not check them.

### Repetition

- Repeat with recursion that takes a counter and fails at a named limit. Every repeat-until operation (polling, pagination, retries) needs one, so a remote service that never finishes cannot hang the caller. Work that ends when its input runs out, such as draining a queue, needs no counter: recurse until the queue is empty.
- Retry only requests that are safe to repeat. Retrying a `POST` that creates something can create it twice.

### Tests

- Tests may use loops, `let`, `throw`, `try`, `null` in fixtures of wire data, real timers, and fakes that record their calls.
- `node:assert/strict` assertions narrow types. After `assert.equal(result.ok, false)`, read `result.error` directly; a second check is reported as unnecessary. To check a whole value, use `assert.deepEqual(result, { ok: false, error: { ... } })`.
- Type fixtures with the schema's input type, so a fixture that drifts from the schema fails typecheck: `const reply = (body: z.input<typeof PageSchema>) => new Response(JSON.stringify(body))`.

### What the lint rules reject

Read this list instead of writing throwaway files to discover the rules.

- Functional style, outside `*.io.*` files: `no-throw` (return a `Result`), `no-try-catch` (wrap throwing code in an `.io.ts` file), `no-null` (use `undefined`), `no-classes` (types plus functions; `Error` subclasses become failure variants, and classes a framework requires go in `.io.ts`), `no-enums` (string literal unions), `no-loops` (collection methods, `for...of`, or bounded recursion), `no-mutable-bindings` (`const` only; long-lived state goes in one `state` object), `no-shared-mutation` (return new values instead of changing parameters, imports, or module state), and `no-ambient-capabilities` (take the clock, randomness, timers, `fetch`, `process`, and file access as parameters).
- Tests: `no-module-mocking` rejects `vi.mock` and `jest.mock`; pass fakes through parameters.
- Untyped data: `no-unsafe-argument`, `no-unsafe-assignment`, `no-unsafe-call`, `no-unsafe-member-access`, `no-unsafe-return`, `no-redundant-type-constituents`. Parse with the schema where data enters; pass parsed types onward, never `any`.
- Conditions: `strict-boolean-expressions` requires booleans in conditions (`text.length > 0`, `value !== undefined`); an optional boolean such as `context?.hasUI` is allowed. `no-unnecessary-condition` rejects checks the types already rule out, and `no-unnecessary-type-assertion` rejects assertions that change nothing.
- Switches: `switch-exhaustiveness-check` requires a `case` for every union member and rejects `default` on a switch that already covers them; stack `case` labels that share a branch.
- Promises and errors: `no-floating-promises`, `no-misused-promises`, `await-thenable`, `only-throw-error`, `prefer-promise-reject-errors`, `use-unknown-in-catch-callback-variable`. Await or return every promise, throw and reject only `Error` objects, and type rejection parameters `unknown`.
- Strings and math: `restrict-template-expressions`, `restrict-plus-operands`, `no-base-to-string`. Interpolate and add only strings and numbers; format other values explicitly.
