// Summarize finished trials from their files and lint history, grouped by task and rule set.
// Usage: node scripts/dogfood/report.mjs <round-directory> [--out results.md]
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [root, flag, out] = process.argv.slice(2);
if (root === undefined) throw new Error("Usage: report.mjs <round-directory> [--out results.md]");

const patterns = {
  "disable comments": /oxlint-disable|eslint-disable|@ts-(ignore|expect-error|nocheck)/g,
  "type assertions": /\bas [A-Z{]/g,
  any: /: any\b|<any>/g,
  "let/var": /\b(let|var) /g,
  class: /\bclass /g,
  throw: /\bthrow /g,
  try: /\btry \{/g,
  null: /\bnull\b/g,
  "typeof stand-ins": /String\(.*\) ===|instanceof Object|Object\(.*\) ===|constructor === |getPrototypeOf\(/g,
};

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.name.endsWith(".ts") ? [path] : [];
  });
}

function lintLogs(directory) {
  return readdirSync(join(directory, ".trial")).filter((name) => name.startsWith("lint-"));
}

function passesCheck(directory) {
  const before = lintLogs(directory).length;
  try {
    execFileSync("./check.sh", { cwd: directory, stdio: "ignore" });
    return true;
  } catch {
    return false;
  } finally {
    rmSync(join(directory, ".trial", `lint-${before + 1}.txt`), { force: true });
  }
}

function measure(directory) {
  const logs = lintLogs(directory);
  const violations = {};
  for (const log of logs) {
    const text = readFileSync(join(directory, ".trial", log), "utf8");
    for (const [rule] of text.matchAll(/(?:anti-slop[a-z-]*|oxc|typescript)\([a-z-]+\)/g)) {
      violations[rule] = (violations[rule] ?? 0) + 1;
    }
  }
  const files = sourceFiles(join(directory, "src"));
  const source = files.filter((path) => !path.includes(".test.")).map((path) => readFileSync(path, "utf8")).join("\n");
  const transcriptPath = join(directory, ".trial", "transcript.json");
  const transcript = existsSync(transcriptPath) ? JSON.parse(readFileSync(transcriptPath, "utf8") || "{}") : {};
  let untouched = true;
  try {
    execFileSync("shasum", ["-c", ".trial/checksums"], { cwd: directory, stdio: "ignore" });
  } catch {
    untouched = false;
  }
  return {
    finished: transcript.is_error === false,
    passes: passesCheck(directory),
    untouched,
    lintRuns: logs.length,
    violations,
    lines: source.split("\n").length,
    ffiFiles: files.filter((path) => path.includes(".ffi.")).length,
    counts: Object.fromEntries(Object.entries(patterns).map(([name, pattern]) => [name, source.match(pattern)?.length ?? 0])),
    costUsd: transcript.total_cost_usd ?? 0,
  };
}

const trials = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const match = /^(.+)-(plain|gleam)-(\d+)$/.exec(entry.name);
    return match && { task: match[1], arm: match[2], metrics: measure(join(root, entry.name)) };
  })
  .filter(Boolean);

const groups = new Map();
for (const trial of trials) {
  const key = `${trial.task}\t${trial.arm}`;
  groups.set(key, [...(groups.get(key) ?? []), trial.metrics]);
}

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const format = (value) => (Number.isInteger(value) ? String(value) : value.toFixed(1));
const ratio = (items, test) => `${items.filter(test).length}/${items.length}`;
const total = (items) => items.map((item) => Object.values(item.violations).reduce((sum, n) => sum + n, 0));

const header = ["task", "rules", "finished", "check passes", "config untouched", "lint runs", "violations", "source lines", "ffi files", ...Object.keys(patterns), "cost (USD)"];
const rows = [...groups].sort(([a], [b]) => a.localeCompare(b)).map(([key, items]) => {
  const [task, arm] = key.split("\t");
  return [
    task,
    arm === "plain" ? "generic" : "+ Gleam",
    ratio(items, (item) => item.finished),
    ratio(items, (item) => item.passes),
    ratio(items, (item) => item.untouched),
    format(mean(items.map((item) => item.lintRuns))),
    format(mean(total(items))),
    format(mean(items.map((item) => item.lines))),
    format(mean(items.map((item) => item.ffiFiles))),
    ...Object.keys(patterns).map((name) => format(mean(items.map((item) => item.counts[name])))),
    mean(items.map((item) => item.costUsd)).toFixed(2),
  ];
});

const byRule = {};
for (const trial of trials) {
  for (const [rule, count] of Object.entries(trial.metrics.violations)) {
    byRule[rule] ??= { plain: 0, gleam: 0 };
    byRule[rule][trial.arm] += count;
  }
}
const ruleRows = Object.entries(byRule)
  .sort(([, a], [, b]) => b.plain + b.gleam - (a.plain + a.gleam))
  .map(([rule, counts]) => [rule, String(counts.plain), String(counts.gleam)]);

const table = (head, body) =>
  [`| ${head.join(" | ")} |`, `|${head.map(() => "---").join("|")}|`, ...body.map((row) => `| ${row.join(" | ")} |`)].join("\n");

const report = [
  `# Dogfood results: ${root}`,
  "",
  `${trials.length} trials. Numbers other than ratios are means per trial; pattern counts cover non-test source.`,
  "",
  table(header, rows),
  "",
  "## Violations by rule, summed over every recorded lint run",
  "",
  table(["rule", "generic", "+ Gleam"], ruleRows),
  "",
].join("\n");

if (flag === "--out" && out !== undefined) writeFileSync(out, report);
process.stdout.write(report);
