#!/bin/sh
# Create a scratch trial project that lints with this checkout's rules.
# Usage: scripts/dogfood/setup.sh <directory> <plain|gleam>
set -eu
repo=$(cd "$(dirname "$0")/../.." && pwd)
directory=$1
arm=$2
rm -rf "$directory"
mkdir -p "$directory/src" "$directory/.trial"

# Trials extend the same shipped configs that installs use, so results describe what users get.
configs="\"$repo/src/configs/recommended.json\""
[ "$arm" = gleam ] && configs="$configs, \"$repo/src/configs/gleam.json\""
echo "{ \"extends\": [$configs] }" > "$directory/.oxlintrc.json"

# Trial projects carry the same agent conventions the install skill offers to add.
cp "$repo/skills/install-anti-slop/references/agent-conventions.md" "$directory/AGENTS.md"
[ "$arm" = gleam ] && { echo; cat "$repo/skills/install-anti-slop/references/agent-conventions-gleam.md"; } >> "$directory/AGENTS.md"

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
$repo/node_modules/.bin/oxlint -c .oxlintrc.json "\$@" src > ".trial/lint-\$run.txt" 2>&1
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
