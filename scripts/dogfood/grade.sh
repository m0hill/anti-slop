#!/bin/sh
# Summarize a finished trial from its files and lint history.
# Usage: scripts/dogfood/grade.sh <directory>
cd "$1" || exit 1
source_files=$(find src -name '*.ts' ! -name '*.test.ts')
echo "## $1"
runs=$(ls .trial | grep -c '^lint-')
echo "lint runs by agent: $runs (lower bound: direct oxlint calls are not recorded)"
echo "violations by rule across agent runs:"
cat .trial/lint-*.txt 2>/dev/null | grep -oE '(anti-slop[a-z-]*|oxc)\([a-z-]+\)' | sort | uniq -c | sort -rn | sed 's/^/  /'
if shasum -c .trial/checksums > /dev/null 2>&1; then echo "config: untouched"; else echo "config: TAMPERED"; fi
if ./check.sh > /dev/null 2>&1; then echo "check: pass"; else echo "check: FAIL"; fi
rm -f ".trial/lint-$((runs + 1)).txt"
echo "source lines: $(cat $source_files | wc -l | tr -d ' ') ($(echo "$source_files" | wc -l | tr -d ' ') files, $(ls src | grep -c '\.ffi\.') ffi)"
count() { printf '  %-22s %s\n' "$1" "$(cat $source_files | grep -cE "$2")"; }
echo "pattern counts in source:"
count "disable comments" 'oxlint-disable|eslint-disable|@ts-(ignore|expect-error|nocheck)'
count "type assertions" '\bas [A-Z{]'
count "SAFETY comments" 'SAFETY'
count "typeof (outside types)" '[^(]typeof [a-z]'
count "typeof stand-ins" 'String\(.*\) ===|instanceof Object|Object\(.*\) ===|constructor === |getPrototypeOf\('
count "any" ': any\b|<any>'
count "let/var" '\b(let|var) '
count "class" '\bclass '
count "throw" '\bthrow '
count "try" '\btry \{'
count "null" '\bnull\b'
count "default:" 'default:'
