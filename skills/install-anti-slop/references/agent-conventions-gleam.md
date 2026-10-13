## Gleam dialect conventions

This project's lint rules restrict TypeScript to a small, Gleam-like dialect. These are the dialect's building blocks.

- Functions that can fail return the project's `Result` from `src/result.ts`; create it if it is missing:

  ```ts
  export type Result<Value, Error> =
    | { readonly ok: true; readonly value: Value }
    | { readonly ok: false; readonly error: Error };
  export const ok = <Value>(value: Value): Result<Value, never> => ({ ok: true, value });
  export const err = <Error>(error: Error): Result<never, Error> => ({ ok: false, error });
  ```

- Model each failure as a union variant with a `kind` and the ids a caller needs: `{ kind: "BookNotAvailable", bookId }`. After each step that can fail, return early: `const member = findMember(state, id); if (!member.ok) return member;`.
- Model data as types and discriminated unions, and behavior as exported functions that take the data as their first argument.
- Pass state in and return the new state. Update with spreads (`{ ...book, status }`), `toSorted`, and `new Map([...map, [key, value]])`; build a local `const` value when that reads better.
- Represent absence as `undefined`. Convert a foreign `null` where it arrives: `headers.get(name) ?? undefined`.
- Wrap foreign code that throws, returns `null`, or needs a class in a thin `*.ffi.ts` module that returns `Result` or `undefined`. Create the real clock, randomness, network, and file access in a `.ffi.ts` entry point and pass them in. Keep domain logic out of `.ffi.ts` files; the dialect's rules do not check them.
- Repeat with recursion that takes a counter and fails at a named limit. Tests may use loops, `let`, and `null` in fixtures of wire data.

### What the Gleam rules reject

Outside `*.ffi.*` files: `no-throw` (return a `Result`), `no-try-catch` (wrap throwing code in a `.ffi.ts` module), `no-null` (use `undefined`), `no-classes` (types plus functions), `no-enums` (string literal unions), `no-loops` (collection methods, `for...of`, or bounded recursion), `no-mutable-bindings` (`const` only), `no-shared-mutation` (return new values instead of changing parameters, imports, or module state), and `no-ambient-capabilities` (take the clock, randomness, timers, `fetch`, `process`, and file access as parameters).
