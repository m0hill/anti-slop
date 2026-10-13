Task: implement a client in `src/` that runs export jobs on a remote HTTP API and downloads their results.

- `POST {baseUrl}/exports` starts a job and responds with JSON `{ "jobId": string }`.
- `GET {baseUrl}/exports/{jobId}` responds with JSON `{ "status": "queued" | "running" | "done" | "failed", "progress": number, "error"?: string }`. Poll it every 500 ms until the job is done or failed.
- A done job's rows are paged: `GET {baseUrl}/exports/{jobId}/rows?page={n}` (starting at 1) responds with `{ "rows": [{ "id": string, "values": Record<string, string> }], "hasMore": boolean }`. Fetch pages until `hasMore` is false.
- Any request may fail with a network error, a non-2xx status, or a body that is not the expected JSON. Retry network errors and 5xx responses up to 2 times with a 250 ms wait; fail on anything else.
- `runExport` starts a job, waits for it, downloads every row, and returns the rows, or a failure that tells callers what went wrong and at which step.
- Take `fetch` and a `sleep` function as dependencies so tests run without network access or real waiting.
- Design the types and module structure as you see fit. Export the public API from `src/exports.ts`.
- Write tests with `node:test` in `src/*.test.ts` covering the happy path and each failure.
