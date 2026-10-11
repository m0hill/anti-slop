# Dogfood trials

Give fresh coding agents the same task under different rule sets, then compare their code and lint history.

```sh
scripts/dogfood/setup.sh /tmp/dogfood/importer-gleam gleam   # or: plain
# Run an agent with prompt.md, substituting {{directory}} and the contents of tasks/<task>.md for {{task}}.
scripts/dogfood/grade.sh /tmp/dogfood/importer-gleam
```

- `plain` enables every generic rule. `gleam` adds the Gleam dialect plugin, drops the rules that conflict with it, and exempts `*.ffi.*` boundary files from the Gleam rules. Both arms have Zod installed as the schema library.
- `check.sh` saves each lint run in `.trial/`, so `grade.sh` reports violations by rule across the whole session, not only the agent's own account.
- `grade.sh` also flags config tampering, suppression comments, and pattern counts such as assertions, `typeof` stand-ins, `null`, and `throw`.
