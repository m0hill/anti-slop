# Dogfood trials

Fresh coding agents get the same tasks under two rule sets, several times each. The report compares their code and lint history.

- **fp**: this checkout's `src/config.json`, with `conventions.md` as `AGENTS.md`.
- **generic**: the generic anti-slop rules this project replaced, with their own conventions. They are no longer in the tree; `setup.sh` extracts them from git at the `generic-rules` tag (override with `DOGFOOD_GENERIC_REF`) into `dogfood/.generic/`.

```sh
dogfood/run.sh 2026-11-round 3 importer library http-client workflow poller sessions
node dogfood/report.mjs /tmp/dogfood/2026-11-round --out dogfood/results/2026-11-round.md
```

`run.sh` creates one trial project per task, rule set, and run under `DOGFOOD_ROOT` (default `/tmp/dogfood`), runs the agent in each, and prints the report. The agent is `claude -p` with Haiku by default, or `codex exec` with GPT-6-Luna when `DOGFOOD_AGENT=codex`; set `DOGFOOD_MODEL` to change the model. Commit the report under `results/` so later rule changes can be compared against it.

## What a trial records

- Both rule sets have Zod installed as the schema library, and the prompt (`prompt.md`) tells the agent to read `AGENTS.md`.
- Agents run without user settings, skills, or MCP servers. `.trial/transcript.jsonl` records every command they run.
- `check.sh` runs lint, typecheck, and tests, and saves each lint run in `.trial/`, so the report counts violations across the whole session rather than relying on the agent's own account. Runs of `oxlint` outside `check.sh` are not recorded, so lint-run counts are a lower bound.
- Agents sometimes write throwaway files to see what the linter rejects. The report counts these "probe" trials and leaves out, from violation and pattern counts, any file named like a probe or scratch file and any file deleted before the end.
- The report also shows config tampering, suppression comments, counts of patterns such as assertions, `typeof` stand-ins, `null`, and `throw`, and cost.

For a single trial, run `setup.sh <directory> <generic|fp>` and give an agent `prompt.md` with `{{directory}}` and the task substituted.

## Results

Each file in `results/` is one round. Rounds from 2026-10 predate the split and the rename: their "+ Gleam" arm ran these rules (then called the Gleam dialect, with `*.ffi.ts` files) on top of the generic rules. The fp arm now runs them alone.
