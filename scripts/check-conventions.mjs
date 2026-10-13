// Fail when a rule enabled by a shipped config is missing from the conventions agents read.
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pairs = [
  ["src/configs/recommended.json", "skills/install-anti-slop/references/agent-conventions.md"],
  ["src/configs/gleam.json", "skills/install-anti-slop/references/agent-conventions-gleam.md"],
];

const missing = pairs.flatMap(([configPath, conventionsPath]) => {
  const config = JSON.parse(readFileSync(join(root, configPath), "utf8"));
  const conventions = readFileSync(join(root, conventionsPath), "utf8");
  return Object.entries(config.rules)
    .filter(([, setting]) => (Array.isArray(setting) ? setting[0] : setting) !== "off")
    .map(([rule]) => rule.slice(rule.indexOf("/") + 1))
    .filter((name) => !conventions.includes(`\`${name}\``))
    .map((name) => `${name} (enabled in ${configPath}, missing from ${conventionsPath})`);
});

if (missing.length > 0) throw new Error(`Conventions do not list every enabled rule:\n${missing.join("\n")}`);
console.log("Conventions list every enabled rule.");
