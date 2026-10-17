# Dogfood results: /tmp/dogfood/2026-10-codex-luna

36 trials. Numbers other than ratios are means per trial; pattern counts cover non-test source.

| task | rules | finished | check passes | config untouched | probed | lint runs | violations | source lines | ffi files | disable comments | type assertions | any | let/var | class | throw | try | null | typeof stand-ins | cost (USD) | tokens (k) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| http-client | + Gleam | 3/3 | 3/3 | 3/3 | 0/3 | 3.7 | 6.7 | 128 | 0.7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1.7 | 0 | 0.00 | 433 |
| http-client | generic | 3/3 | 3/3 | 3/3 | 0/3 | 3.3 | 3.3 | 122.3 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 2 | 9 | 0 | 0.00 | 309 |
| importer | + Gleam | 3/3 | 3/3 | 3/3 | 0/3 | 3.7 | 13 | 121 | 1 | 0 | 0 | 0 | 0.3 | 0 | 0 | 1 | 2 | 0 | 0.00 | 415 |
| importer | generic | 3/3 | 3/3 | 3/3 | 0/3 | 2.3 | 2 | 127 | 0 | 0 | 0 | 0 | 1.3 | 0 | 0 | 1 | 1 | 0 | 0.00 | 256 |
| library | + Gleam | 3/3 | 3/3 | 3/3 | 0/3 | 2.3 | 6.7 | 125 | 0 | 0 | 0.3 | 0 | 0 | 0 | 0 | 0 | 0.3 | 0 | 0.00 | 236 |
| library | generic | 3/3 | 3/3 | 3/3 | 0/3 | 2 | 1 | 149.3 | 0 | 0 | 0 | 0 | 0.3 | 1 | 1.3 | 0 | 0 | 0 | 0.00 | 222 |
| poller | + Gleam | 3/3 | 3/3 | 3/3 | 0/3 | 3.7 | 7.3 | 118 | 0.3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.00 | 337 |
| poller | generic | 3/3 | 3/3 | 3/3 | 0/3 | 3.7 | 19 | 112.3 | 0 | 0 | 0 | 0 | 5.7 | 0 | 0 | 2.7 | 2.3 | 0 | 0.00 | 378 |
| sessions | + Gleam | 3/3 | 3/3 | 3/3 | 0/3 | 2.7 | 3.3 | 101 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.00 | 257 |
| sessions | generic | 3/3 | 3/3 | 3/3 | 0/3 | 1.3 | 1 | 97 | 0 | 0 | 0 | 0 | 0.3 | 0 | 0 | 0 | 0 | 0 | 0.00 | 164 |
| workflow | + Gleam | 3/3 | 3/3 | 3/3 | 0/3 | 3 | 0.7 | 109 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.00 | 210 |
| workflow | generic | 3/3 | 3/3 | 3/3 | 0/3 | 1.7 | 1 | 99.3 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0.00 | 197 |

## Violations by rule, summed over every recorded lint run

| rule | generic | + Gleam |
|---|---|---|
| typescript(no-unnecessary-condition) | 14 | 24 |
| typescript(no-unsafe-assignment) | 15 | 17 |
| typescript(no-base-to-string) | 14 | 15 |
| typescript(no-unsafe-member-access) | 12 | 15 |
| typescript(no-unsafe-call) | 12 | 10 |
| anti-slop(require-safety-comment-for-type-assertion) | 2 | 11 |
| anti-slop-gleam(no-shared-mutation) | 0 | 8 |
| typescript(strict-boolean-expressions) | 6 | 0 |
| typescript(no-unnecessary-type-assertion) | 2 | 2 |
| anti-slop(no-shape-in-symbol-names) | 0 | 4 |
| anti-slop(no-known-value-widening) | 2 | 1 |
| anti-slop(no-runtime-typeof) | 0 | 3 |
| typescript(no-unsafe-argument) | 2 | 0 |
| anti-slop-gleam(no-ambient-capabilities) | 0 | 2 |
| anti-slop(no-unknown-parameters) | 0 | 1 |
| typescript(no-redundant-type-constituents) | 1 | 0 |
