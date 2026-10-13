## Lint conventions

This project's lint rules ban some common TypeScript shortcuts. These are the intended replacements.

- Parse untyped input with the project's schema library where it enters, and pass the raw value straight to the schema. For a `fetch` body: `response.json().then((body) => PageSchema.safeParse(body))`. Do not annotate a parameter `unknown` or copy the value into an `unknown` variable to pass it along.
- Write each data shape once, as a schema, and derive its type: `type Page = z.infer<typeof PageSchema>`. When several kinds of id pass through the same functions, brand them (`z.string().brand<"JobId">()`) so one cannot be passed as another.
- Take the clock, randomness, timers, network, and environment as parameters (`now: () => Date`, `fetch: typeof fetch`, `sleep: (ms: number) => Promise<void>`) instead of calling them directly. The program's entry point passes in the real ones; tests pass fakes.
- Return expected failures, such as invalid input, a missing record, or a refused request, as values. Let bugs crash instead of turning them into results.
- Give every repeat-until operation (polling, pagination, retries) a named limit, and return a failure when it is reached. A remote service that never finishes must not hang the caller.
- Retry only requests that are safe to repeat. Retrying a `POST` that creates something can create it twice.
- `node:assert/strict` assertions narrow types. After `assert.equal(result.ok, false)`, read `result.error` directly; a second check is reported as unnecessary. To check a whole value, use `assert.deepEqual(result, { ok: false, error: { ... } })`. Do not write helpers that only re-narrow a result.
- Type test fixtures with the schema's input type, so a fixture that drifts from the schema fails typecheck: `const reply = (body: z.input<typeof PageSchema>) => new Response(JSON.stringify(body))`. Write invalid bodies inline at the one test that needs them.

### What the lint rules reject

Read this list instead of writing throwaway files to discover the rules.

- Untyped data: `no-runtime-typeof`, `no-unknown-parameters`, `no-unknown-returns`, `no-unknown-type-aliases`, `no-unsafe-dictionary-type`, `no-unsafe-argument`, `no-unsafe-assignment`, `no-unsafe-call`, `no-unsafe-member-access`, `no-unsafe-return`, `no-redundant-type-constituents`. Parse with the schema where data enters; pass parsed types onward, never `unknown`, `any`, or `Record<string, unknown>`.
- Type assertions: `no-chained-type-assertions`, `no-widen-then-assert`, `require-safety-comment-for-type-assertion`, `no-unnecessary-type-assertion`. Avoid `as`; when one is unavoidable, use a single `as` with a `// SAFETY:` comment stating the checked invariant.
- Annotations: `no-known-value-widening` rejects annotating a value with a broader type than it has; name object types as aliases. `no-object-parameters` rejects `object` parameters; accept a named type.
- Names: `no-shape-in-symbol-names` rejects "shape" in names; name the domain role.
- Collections: `no-array-filter-map` rejects `.filter(...).map(...)`; use one `flatMap`. `no-reduce-accumulator-copy` and `no-accumulating-spread` reject copying a `reduce` accumulator on each step.
- Objects: `no-conditional-empty-object-spread` rejects `...(cond ? { a } : {})`; build the object, then add the property when present.
- Indirection: `no-reflect-apply` and `no-reflect-get` reject `Reflect.apply` and `Reflect.get`; call and read directly.
- Tests: `no-module-mocking` rejects `vi.mock` and `jest.mock`; pass fakes through parameters.
- Conditions: `strict-boolean-expressions` requires booleans in conditions (`text.length > 0`, `value !== undefined`); an optional boolean such as `context?.hasUI` is allowed. `no-unnecessary-condition` rejects checks the types already rule out. `no-unsafe-enum-comparison` rejects comparing an enum with a plain value.
- Switches: `switch-exhaustiveness-check` requires a `case` for every union member and rejects `default` on a switch that already covers them; stack `case` labels that share a branch.
- Promises and errors: `no-floating-promises`, `no-misused-promises`, `await-thenable`, `only-throw-error`, `prefer-promise-reject-errors`, `use-unknown-in-catch-callback-variable`. Await or return every promise, throw and reject only `Error` objects, and type `.catch` parameters `unknown`.
- Strings and math: `restrict-template-expressions`, `restrict-plus-operands`, `no-base-to-string`. Interpolate and add only strings and numbers; format other values explicitly.
