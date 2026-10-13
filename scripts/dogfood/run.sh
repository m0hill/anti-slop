#!/bin/sh
# Run a batch of trials: every task under both rule sets, several times each.
# Usage: scripts/dogfood/run.sh <round> <runs> <task>...
# Environment: DOGFOOD_ROOT (default /tmp/dogfood), DOGFOOD_MODEL (default haiku),
#              DOGFOOD_PARALLEL (default 6).
set -eu
dogfood=$(cd "$(dirname "$0")" && pwd)
round=$1
runs=$2
shift 2
root=${DOGFOOD_ROOT:-/tmp/dogfood}/$round
model=${DOGFOOD_MODEL:-haiku}
mkdir -p "$root"

for task in "$@"; do
  [ -f "$dogfood/tasks/$task.md" ] || { echo "No task $dogfood/tasks/$task.md" >&2; exit 1; }
  for arm in plain gleam; do
    run=1
    while [ "$run" -le "$runs" ]; do
      directory=$root/$task-$arm-$run
      "$dogfood/setup.sh" "$directory" "$arm" > /dev/null
      node -e '
        const fs = require("fs");
        const [prompt, directory, task] = process.argv.slice(1);
        process.stdout.write(fs.readFileSync(prompt, "utf8")
          .replace("{{directory}}", directory)
          .replace("{{task}}", fs.readFileSync(task, "utf8").trim()));
      ' "$dogfood/prompt.md" "$directory" "$dogfood/tasks/$task.md" > "$directory/.trial/prompt.md"
      echo "$directory"
      run=$((run + 1))
    done
  done
done > "$root/trials.txt"

echo "Running $(wc -l < "$root/trials.txt" | tr -d ' ') trials with $model"
# Each agent sees only the trial directory: no user settings, skills, or MCP servers, and its
# shell is limited to ./check.sh so every lint run is recorded.
xargs -P "${DOGFOOD_PARALLEL:-6}" -I {} sh -c '
  cd "$1" && claude -p --model "$2" --output-format json --no-session-persistence \
    --setting-sources project,local --disable-slash-commands --strict-mcp-config \
    --allowedTools Read Write Edit Glob Grep "Bash(./check.sh:*)" "Bash(rm src/:*)" \
    < .trial/prompt.md > .trial/transcript.json 2> .trial/stderr.txt
  echo "done $1"
' _ {} "$model" < "$root/trials.txt"

node "$dogfood/report.mjs" "$root"
