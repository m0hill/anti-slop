#!/usr/bin/env node
// Copy the bundled plugin into the current repository. Usage: install.mjs [destination] [--force]
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(skillRoot, "assets/anti-slop-gleam");
const options = process.argv.slice(2);
const destination = resolve(process.cwd(), options.find((option) => !option.startsWith("--")) ?? "tools/oxlint/anti-slop-gleam");
const force = options.includes("--force");

if (existsSync(destination) && !force) {
  console.error(`Refusing to overwrite ${destination}. Re-run with --force only after reviewing the existing files.`);
  process.exit(1);
}

mkdirSync(dirname(destination), { recursive: true });
cpSync(source, destination, { recursive: true, force });
console.log(`Copied the plugin to ${destination}`);
console.log(`Extend ${destination}/config.json from the repository's Oxlint configuration.`);
