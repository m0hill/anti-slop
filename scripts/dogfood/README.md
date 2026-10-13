# Dogfood trials

Give fresh coding agents the same tasks under both rule sets, several times each, then compare their code and lint history.

```sh
scripts/dogfood/run.sh 2026-10-baseline 3 importer library http-client workflow poller sessions
node scripts/dogfood/report.mjs /tmp/dogfood/2026-10-baseline --out scripts/dogfood/results/2026-10-baseline.md
```

`run.sh` creates one trial project per task, rule set, and run, launches `claude -p` in each (Haiku by default; set `DOGFOOD_MODEL`), and prints the report. Commit the report under `results/` so later rule changes can be compared against it.

- Trials extend the shipped `src/configs/recommended.json`, and the Gleam arm also `gleam.json`, so they test exactly what installs get. Both arms have Zod installed as the schema library.
- Each trial gets `AGENTS.md` from the install skill's agent conventions, plus the Gleam conventions in the Gleam arm, and the prompt tells the agent to read it.
- Agents run without user settings, skills, or MCP servers, and their shell is limited to `./check.sh` and deleting files in `src/`. `check.sh` saves each lint run in `.trial/`, so the report counts violations across the whole session, not only the agent's own account.
- The report also shows config tampering, suppression comments, pattern counts such as assertions, `typeof` stand-ins, `null`, and `throw`, and cost.
- For a single trial, run `setup.sh <directory> <plain|gleam>` and give an agent `prompt.md` with `{{directory}}` and the task substituted.
