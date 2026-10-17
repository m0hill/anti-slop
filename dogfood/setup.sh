#!/bin/sh
# Create a scratch trial project.
# Usage: dogfood/setup.sh <directory> <generic|fp>
#   fp       lints with this checkout's config and gets its conventions as AGENTS.md.
#   generic  lints with the generic anti-slop rules this project replaced, read from git at
#            $DOGFOOD_GENERIC_REF (default: the generic-rules tag), and gets their conventions.
set -eu
repo=$(cd "$(dirname "$0")/.." && pwd)
directory=$1
arm=$2
rm -rf "$directory"
mkdir -p "$directory/src" "$directory/.trial"

case $arm in
  fp)
    config=$repo/src/config.json
    conventions=$repo/skills/install-fp-rules/references/conventions.md
    ;;
  generic)
    ref=${DOGFOOD_GENERIC_REF:-generic-rules}
    # Extracted inside the repository so the plugin resolves @oxlint/plugins from its node_modules.
    generic=$repo/dogfood/.generic/$ref
    if [ ! -d "$generic" ]; then
      mkdir -p "$generic"
      git -C "$repo" archive "$ref" src skills/install-anti-slop/references | tar -x -C "$generic"
    fi
    config=$generic/src/configs/recommended.json
    conventions=$generic/skills/install-anti-slop/references/agent-conventions.md
    ;;
  *) echo "The rule set must be generic or fp" >&2; exit 1 ;;
esac
echo "{ \"extends\": [\"$config\"] }" > "$directory/.oxlintrc.json"
cp "$conventions" "$directory/AGENTS.md"

cat > "$directory/tsconfig.json" <<JSON
{
  "compilerOptions": {
    "target": "ES2024", "module": "NodeNext", "moduleResolution": "NodeNext", "strict": true,
    "exactOptionalPropertyTypes": true, "noUncheckedIndexedAccess": true, "noEmit": true,
    "allowImportingTsExtensions": true, "verbatimModuleSyntax": true, "skipLibCheck": true,
    "typeRoots": ["$repo/node_modules/@types"], "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
JSON

# check.sh records every lint run in .trial/ so grading does not rely on the agent's own report.
cat > "$directory/check.sh" <<SH
#!/bin/sh
cd "\$(dirname "\$0")"
run=\$(( \$(ls .trial | grep -c '^lint-') + 1 ))
echo "== lint"
$repo/node_modules/.bin/oxlint -c .oxlintrc.json --format default "\$@" src > ".trial/lint-\$run.txt" 2>&1
status=\$?
cat ".trial/lint-\$run.txt"
[ \$status -eq 0 ] || exit 1
echo "== typecheck"; $repo/node_modules/.bin/tsc -p tsconfig.json || exit 1
echo "== test"; node --test 'src/**/*.test.ts' || exit 1
SH
chmod +x "$directory/check.sh"
# Zod stands in for the schema library a real project would have; oxlint-tsgolint runs the type-aware rules.
tsgolint=$(node -p "require('$repo/package.json').devDependencies['oxlint-tsgolint']")
echo "{ \"type\": \"module\", \"dependencies\": { \"zod\": \"4.6.6\" }, \"devDependencies\": { \"oxlint-tsgolint\": \"$tsgolint\" } }" > "$directory/package.json"
(cd "$directory" && pnpm install --silent --prefer-offline > /dev/null)
(cd "$directory" && shasum .oxlintrc.json tsconfig.json check.sh AGENTS.md > .trial/checksums)
echo "Created $arm trial at $directory"
