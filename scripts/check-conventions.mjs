// Fail when a rule enabled in the shipped config is missing from the conventions agents read.
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = "src/config.json";
const conventionsPath = "skills/install-anti-slop-gleam/references/conventions.md";

const config = JSON.parse(readFileSync(join(root, configPath), "utf8"));
const conventions = readFileSync(join(root, conventionsPath), "utf8");
const missing = Object.entries(config.rules)
  .filter(([, setting]) => (Array.isArray(setting) ? setting[0] : setting) !== "off")
  .map(([rule]) => rule.slice(rule.indexOf("/") + 1))
  .filter((name) => !conventions.includes(`\`${name}\``));

if (missing.length > 0) {
  throw new Error(`${conventionsPath} does not mention these rules enabled in ${configPath}:\n${missing.join("\n")}`);
}
console.log("The conventions mention every enabled rule.");
