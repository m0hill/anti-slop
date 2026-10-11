#!/bin/sh
# Create a scratch trial project that lints with this checkout's rules.
# Usage: scripts/dogfood/setup.sh <directory> <plain|gleam>
set -eu
repo=$(cd "$(dirname "$0")/../.." && pwd)
directory=$1
arm=$2
rm -rf "$directory"
mkdir -p "$directory/src" "$directory/.trial"

node - "$repo" "$arm" > "$directory/.oxlintrc.json" <<'NODE'
const [repo, arm] = process.argv.slice(2);
const generic = [
  "no-array-filter-map", "no-chained-type-assertions", "no-conditional-empty-object-spread",
  "no-known-value-widening", "no-module-mocking", "no-object-parameters", "no-reflect-apply",
  "no-reflect-get", "no-runtime-typeof", "no-shape-in-symbol-names", "no-unknown-parameters",
  "no-unknown-returns", "no-unknown-type-aliases", "no-unsafe-dictionary-type", "no-widen-then-assert",
  "require-readable-spacing", "require-safety-comment-for-type-assertion",
  ...(arm === "gleam" ? [] : ["no-reduce-accumulator-copy"]),
];
const gleam = [
  "no-classes", "no-enums", "no-loops", "no-mutable-bindings", "no-null", "no-shared-mutation",
  "no-switch-catch-all", "no-throw", "no-try-catch",
];
const config = {
  jsPlugins: [{ name: "anti-slop", specifier: `${repo}/src/index.ts` }],
  rules: Object.fromEntries(generic.map((rule) => [`anti-slop/${rule}`, "error"])),
};
if (arm === "plain") config.rules["oxc/no-accumulating-spread"] = "error";
if (arm === "gleam") {
  config.jsPlugins.push({ name: "anti-slop-gleam", specifier: `${repo}/src/gleam/index.ts` });
  for (const rule of gleam) config.rules[`anti-slop-gleam/${rule}`] = "error";
  config.overrides = [{
    files: ["**/*.ffi.*"],
    rules: { "anti-slop/no-runtime-typeof": "off", "anti-slop/no-unknown-parameters": "off" },
  }];
}
console.log(JSON.stringify(config, null, 2));
NODE

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
echo '{ "type": "module" }' > "$directory/package.json"
(cd "$directory" && shasum .oxlintrc.json tsconfig.json check.sh > .trial/checksums)
echo "Created $arm trial at $directory"
