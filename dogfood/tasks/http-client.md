Task: implement a client in `src/` that syncs issues from a remote HTTP API.

- The API is `GET {baseUrl}/issues?cursor={cursor}`. The first request has no `cursor` parameter. A successful response is JSON: `{ "issues": [...], "next": "<cursor>" | null }`. Each issue is `{ "id": number, "title": string, "state": "open" | "closed", "labels": string[], "updated_at": "<ISO timestamp>" }`.
- The server is unreliable: it may respond with 429 or any 5xx status, return a body that is not JSON, return JSON of the wrong shape, or the request itself may fail with a network error.
- Retry 429 and 5xx responses and network errors up to 3 times per page, waiting 100 ms, then 200 ms, then 400 ms. When a 429 response has a `Retry-After` header in seconds, wait that long instead. Do not retry other 4xx responses, non-JSON bodies, or wrongly shaped bodies.
- `syncIssues` fetches every page and returns all issues, or a failure that tells callers which page cursor failed and why (status code, invalid body, network error, retries exhausted).
- Also export `summarize(issues)`, which returns open and closed counts and the number of open issues per label.
- Take `fetch` and a `sleep` function as dependencies so tests run without network access or real waiting. Do not call the global `fetch` in tests.
- Design the types and module structure as you see fit. Export the public API from `src/client.ts`.
- Write tests with `node:test` in `src/*.test.ts` covering pagination, each retry and failure case, and `summarize`.
