# Dogfood results: /tmp/dogfood/2026-10-baseline

36 trials. Numbers other than ratios are means per trial; pattern counts cover non-test source.

| task | rules | finished | check passes | config untouched | probed | lint runs | violations | source lines | ffi files | disable comments | type assertions | any | let/var | class | throw | try | null | typeof stand-ins | cost (USD) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| http-client | + Gleam | 3/3 | 3/3 | 3/3 | 0/3 | 2.7 | 11 | 185.7 | 2 | 0 | 0.3 | 0 | 0 | 0 | 0 | 1.3 | 0.3 | 0 | 0.04 |
| http-client | generic | 3/3 | 3/3 | 3/3 | 2/3 | 3.3 | 0 | 153.7 | 0 | 0 | 0 | 0 | 6.3 | 0 | 0 | 1 | 12.7 | 0 | 0.03 |
| importer | + Gleam | 3/3 | 3/3 | 3/3 | 2/3 | 2 | 0 | 210 | 1 | 0 | 0 | 0 | 0.3 | 0 | 0 | 1 | 0 | 0 | 0.03 |
| importer | generic | 3/3 | 3/3 | 3/3 | 0/3 | 2 | 1.3 | 191.7 | 0 | 0 | 0 | 0 | 0.7 | 0 | 0.7 | 1 | 0 | 0 | 0.03 |
| library | + Gleam | 3/3 | 3/3 | 3/3 | 2/3 | 3.3 | 0 | 337.3 | 0 | 0 | 0.3 | 0 | 0 | 0 | 0.3 | 0 | 0 | 0 | 0.04 |
| library | generic | 3/3 | 3/3 | 3/3 | 1/3 | 2 | 0.3 | 329.3 | 0 | 0 | 0 | 0 | 0.3 | 0.7 | 1.3 | 0 | 2.3 | 0 | 0.03 |
| poller | + Gleam | 3/3 | 3/3 | 3/3 | 0/3 | 3 | 0.3 | 200 | 2 | 0 | 0.3 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0.03 |
| poller | generic | 3/3 | 3/3 | 3/3 | 2/3 | 3.3 | 0.3 | 199.3 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 1 | 2.3 | 0 | 0.03 |
| sessions | + Gleam | 3/3 | 3/3 | 3/3 | 1/3 | 2.7 | 2 | 225.7 | 1 | 0 | 0.3 | 0 | 0 | 0 | 0 | 1.7 | 0 | 0 | 0.06 |
| sessions | generic | 3/3 | 3/3 | 3/3 | 0/3 | 2 | 0.7 | 176 | 0 | 0 | 0 | 0 | 0.7 | 0 | 0.3 | 0 | 0.7 | 0 | 0.03 |
| workflow | + Gleam | 3/3 | 3/3 | 3/3 | 2/3 | 3.3 | 0 | 201.3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.03 |
| workflow | generic | 3/3 | 3/3 | 3/3 | 3/3 | 5.3 | 0 | 219.7 | 0 | 0 | 0 | 0 | 1.7 | 0 | 0 | 0 | 0 | 0 | 0.04 |

## Violations by rule, summed over every recorded lint run

| rule | generic | + Gleam |
|---|---|---|
| anti-slop-gleam(no-null) | 0 | 30 |
| anti-slop(no-shape-in-symbol-names) | 4 | 0 |
| anti-slop-gleam(no-throw) | 0 | 2 |
| anti-slop(no-array-filter-map) | 0 | 2 |
| typescript(strict-boolean-expressions) | 0 | 2 |
| typescript(no-base-to-string) | 0 | 1 |
| typescript(no-unnecessary-condition) | 1 | 0 |
| anti-slop(no-object-parameters) | 0 | 1 |
| anti-slop(no-known-value-widening) | 1 | 0 |
| anti-slop-gleam(no-shared-mutation) | 0 | 1 |
| anti-slop(require-safety-comment-for-type-assertion) | 0 | 1 |
| typescript(no-unsafe-member-access) | 1 | 0 |
| anti-slop(no-conditional-empty-object-spread) | 1 | 0 |
