# Dogfood results: /tmp/dogfood/2026-10-rules-list

36 trials. Numbers other than ratios are means per trial; pattern counts cover non-test source.

| task | rules | finished | check passes | config untouched | probed | lint runs | violations | source lines | ffi files | disable comments | type assertions | any | let/var | class | throw | try | null | typeof stand-ins | cost (USD) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| http-client | + Gleam | 3/3 | 3/3 | 3/3 | 2/3 | 4.3 | 1.7 | 195 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 1.3 | 0.3 | 0 | 0.03 |
| http-client | generic | 3/3 | 3/3 | 3/3 | 1/3 | 2.3 | 0 | 166.3 | 0 | 0 | 0 | 0 | 6 | 0 | 0.7 | 1.3 | 10 | 0 | 0.03 |
| importer | + Gleam | 3/3 | 3/3 | 3/3 | 1/3 | 4 | 1 | 203 | 1 | 0 | 0.7 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0.04 |
| importer | generic | 3/3 | 3/3 | 3/3 | 0/3 | 1.3 | 0.3 | 215 | 0 | 0 | 0 | 0 | 0 | 0 | 0.7 | 1 | 0 | 0 | 0.03 |
| library | + Gleam | 3/3 | 3/3 | 3/3 | 1/3 | 3 | 0 | 321 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.04 |
| library | generic | 3/3 | 3/3 | 3/3 | 0/3 | 2.7 | 0 | 384 | 0 | 0 | 0 | 0 | 0.7 | 0 | 1.7 | 0 | 0.7 | 0 | 0.04 |
| poller | + Gleam | 3/3 | 3/3 | 3/3 | 1/3 | 4 | 1 | 213.3 | 1.7 | 0 | 0 | 0 | 0 | 0 | 0.3 | 0.7 | 0 | 0 | 0.04 |
| poller | generic | 3/3 | 3/3 | 3/3 | 0/3 | 2.7 | 0.7 | 200.7 | 0 | 0 | 0 | 0 | 5 | 0 | 0.7 | 1 | 2 | 0 | 0.03 |
| sessions | + Gleam | 3/3 | 3/3 | 3/3 | 1/3 | 4 | 3 | 249.3 | 2.3 | 0 | 0 | 0 | 0.3 | 0 | 0 | 1.3 | 0 | 0 | 0.04 |
| sessions | generic | 3/3 | 3/3 | 3/3 | 0/3 | 2.3 | 0.7 | 234.3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.03 |
| workflow | + Gleam | 3/3 | 3/3 | 3/3 | 0/3 | 3.3 | 1.7 | 194 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.03 |
| workflow | generic | 3/3 | 3/3 | 3/3 | 2/3 | 3 | 0 | 207.7 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0.03 |

## Violations by rule, summed over every recorded lint run

| rule | generic | + Gleam |
|---|---|---|
| typescript(no-unnecessary-condition) | 2 | 5 |
| anti-slop(require-safety-comment-for-type-assertion) | 0 | 5 |
| typescript(no-unsafe-member-access) | 0 | 3 |
| anti-slop(no-shape-in-symbol-names) | 0 | 3 |
| anti-slop-gleam(no-ambient-capabilities) | 0 | 3 |
| typescript(switch-exhaustiveness-check) | 0 | 3 |
| anti-slop(no-unknown-parameters) | 1 | 1 |
| typescript(no-base-to-string) | 0 | 1 |
| typescript(no-unsafe-argument) | 0 | 1 |
| typescript(no-unsafe-return) | 1 | 0 |
| anti-slop(no-known-value-widening) | 1 | 0 |
