#!/bin/sh
# Run a batch of trials: every task under both rule sets (generic and gleam), several times each.
# Usage: dogfood/run.sh <round> <runs> <task>...
# Environment: DOGFOOD_ROOT (default /tmp/dogfood), DOGFOOD_AGENT (claude or codex, default claude),
#              DOGFOOD_MODEL (default haiku for claude, gpt-6-luna for codex), DOGFOOD_PARALLEL (default 6).
set -eu
dogfood=$(cd "$(dirname "$0")" && pwd)
round=$1
runs=$2
shift 2
root=${DOGFOOD_ROOT:-/tmp/dogfood}/$round
agent=${DOGFOOD_AGENT:-claude}
case $agent in
  claude) model=${DOGFOOD_MODEL:-haiku} ;;
  codex) model=${DOGFOOD_MODEL:-gpt-6-luna} ;;
  *) echo "DOGFOOD_AGENT must be claude or codex" >&2; exit 1 ;;
esac
mkdir -p "$root"

for task in "$@"; do
  [ -f "$dogfood/tasks/$task.md" ] || { echo "No task $dogfood/tasks/$task.md" >&2; exit 1; }
  for arm in generic gleam; do
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

echo "Running $(wc -l < "$root/trials.txt" | tr -d ' ') trials with $agent $model"
# Agents run without user settings, skills, or MCP servers. Their shell is unrestricted, as in a
# real project: restricting it made agents leave behind lint-probe files they could not delete.
# Codex runs in its workspace-write sandbox, which still lets it delete files in the trial.
xargs -P "${DOGFOOD_PARALLEL:-6}" -I {} sh -c '
  cd "$1" || exit 1
  if [ "$3" = codex ]; then
    codex exec --json --model "$2" --ignore-user-config --ignore-rules --skip-git-repo-check \
      --ephemeral --sandbox workspace-write --cd "$1" - \
      < .trial/prompt.md > .trial/transcript.jsonl 2> .trial/stderr.txt
  else
    claude -p --model "$2" --output-format stream-json --verbose --no-session-persistence \
      --setting-sources project,local --disable-slash-commands --strict-mcp-config \
      --allowedTools Read Write Edit Glob Grep Bash \
      < .trial/prompt.md > .trial/transcript.jsonl 2> .trial/stderr.txt
  fi
  echo "done $1"
' _ {} "$model" "$agent" < "$root/trials.txt"

node "$dogfood/report.mjs" "$root"
