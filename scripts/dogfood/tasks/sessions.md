Task: implement login sessions for a small server in `src/`. There is no database; keep state in memory.

- Users log in with a username and password, checked against a provided list of `{ username, passwordHash }` records. Hash passwords with SHA-256 (hex) from `node:crypto`.
- A successful login creates a session with a random, unguessable token. Sessions expire a configurable number of minutes after they were created; read the default from the `SESSION_TTL_MINUTES` environment variable, falling back to 30.
- `validate(token)` returns the session's username, or a failure saying whether the token is unknown or expired.
- `logout(token)` ends a session.
- Rate-limit failed logins: after 5 failed attempts for a username within 15 minutes, reject further attempts for that username until the oldest of those attempts is more than 15 minutes old, even with the right password.
- Append one line per login attempt (time, username, outcome) to an audit log file at a configurable path.
- Design the types, state handling, and module structure as you see fit. Export the public API from `src/auth.ts`.
- Write tests with `node:test` in `src/*.test.ts` covering successful login, wrong passwords, unknown users, expiry, logout, the rate limit, and the audit log.
