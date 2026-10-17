# Dogfood results: /tmp/dogfood/2026-10-lint-summary

36 trials. Numbers other than ratios are means per trial; pattern counts cover non-test source.

| task | rules | finished | check passes | config untouched | probed | lint runs | violations | source lines | ffi files | disable comments | type assertions | any | let/var | class | throw | try | null | typeof stand-ins | cost (USD) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| http-client | + Gleam | 3/3 | 3/3 | 3/3 | 1/3 | 3.3 | 1 | 181.7 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0.3 | 0.7 | 0 | 0.04 |
| http-client | generic | 3/3 | 3/3 | 3/3 | 0/3 | 1.3 | 0 | 171.7 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 1.3 | 11.7 | 0 | 0.03 |
| importer | + Gleam | 3/3 | 3/3 | 3/3 | 0/3 | 1.3 | 0 | 256.7 | 1 | 0 | 0.3 | 0 | 0 | 0 | 0.3 | 1 | 0.3 | 0 | 0.03 |
| importer | generic | 3/3 | 3/3 | 3/3 | 0/3 | 3 | 0.7 | 218.7 | 0 | 0 | 0 | 0 | 0.7 | 0 | 1 | 1 | 1 | 0 | 0.02 |
| library | + Gleam | 3/3 | 3/3 | 3/3 | 0/3 | 2.3 | 0 | 342.3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.03 |
| library | generic | 3/3 | 3/3 | 3/3 | 0/3 | 1.3 | 0 | 384.3 | 0 | 0 | 0 | 0 | 0.7 | 0 | 1.3 | 0 | 1 | 0 | 0.03 |
| poller | + Gleam | 3/3 | 3/3 | 3/3 | 0/3 | 1.7 | 1 | 202 | 1.3 | 0 | 0 | 0 | 0 | 0 | 0.3 | 0.3 | 0 | 0 | 0.03 |
| poller | generic | 3/3 | 3/3 | 3/3 | 0/3 | 2.7 | 0.3 | 189 | 0 | 0 | 0 | 0 | 4.7 | 0 | 0 | 1.7 | 0.7 | 0 | 0.03 |
| sessions | + Gleam | 3/3 | 3/3 | 3/3 | 0/3 | 3 | 1.7 | 252 | 1.7 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0.03 |
| sessions | generic | 3/3 | 3/3 | 3/3 | 0/3 | 1.7 | 0 | 212 | 0 | 0 | 0 | 0 | 0 | 0 | 0.3 | 0 | 0 | 0 | 0.03 |
| workflow | + Gleam | 3/3 | 3/3 | 3/3 | 0/3 | 3.3 | 0 | 188.3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.03 |
| workflow | generic | 3/3 | 3/3 | 3/3 | 0/3 | 2.7 | 0 | 187.7 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0.03 |

## Violations by rule, summed over every recorded lint run

| rule | generic | + Gleam |
|---|---|---|
| typescript(use-unknown-in-catch-callback-variable) | 0 | 2 |
| typescript(no-unsafe-assignment) | 1 | 1 |
| anti-slop-gleam(no-ambient-capabilities) | 0 | 2 |
| typescript(no-unsafe-return) | 0 | 2 |
| anti-slop-gleam(no-throw) | 0 | 1 |
| typescript(switch-exhaustiveness-check) | 1 | 0 |
| anti-slop(no-unknown-parameters) | 0 | 1 |
| typescript(no-unsafe-call) | 0 | 1 |
| anti-slop(no-runtime-typeof) | 1 | 0 |
| typescript(no-unsafe-member-access) | 0 | 1 |
