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
