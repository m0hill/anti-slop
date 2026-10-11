You are working in the TypeScript project at {{directory}} (Node 24, ESM, `.ts` files run directly through Node type stripping; dependencies in `package.json` are installed; no other package installs are available). Work only inside that directory.

{{task}}

Done means `./check.sh` passes (lint, typecheck, tests). Run lint only through `./check.sh` or `./check.sh --fix`, which records each run. Do not add lint-disable or `@ts-` suppression comments, and do not edit `.oxlintrc.json`, `tsconfig.json`, `check.sh`, or anything in `.trial/`.

When finished, reply with:
1. The list of files you created.
2. Every lint error you hit: rule name, what you had written, and what you changed in response.
3. Candidly, which lint rules (if any) were confusing, got in the way, or pushed you toward worse code, and why.
