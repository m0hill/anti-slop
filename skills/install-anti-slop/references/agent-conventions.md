## Lint conventions

This project's lint rules ban some common TypeScript shortcuts. These are the intended replacements.

- Parse untyped input with the project's schema library where it enters, and pass the raw value straight to the schema. For a `fetch` body: `response.json().then((body) => PageSchema.safeParse(body))`. Do not annotate a parameter `unknown` or copy the value into an `unknown` variable to pass it along.
- Give every repeat-until operation (polling, pagination, retries) a named limit, and return a failure when it is reached. A remote service that never finishes must not hang the caller.
- Retry only requests that are safe to repeat. Retrying a `POST` that creates something can create it twice.
- `node:assert/strict` assertions narrow types. After `assert.equal(result.ok, false)`, read `result.error` directly; a second check is reported as unnecessary. To check a whole value, use `assert.deepEqual(result, { ok: false, error: { ... } })`. Do not write helpers that only re-narrow a result.
