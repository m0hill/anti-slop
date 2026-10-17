// Copy the plugin source, without tests, into the install skill. `--check` fails if the copy is stale.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "src");
const destination = join(root, "skills/install-anti-slop-gleam/assets/anti-slop-gleam");
const isShipped = (path) => !path.endsWith(".test.ts");

// Shipped files under `base`, as paths relative to it.
function files(base) {
  return readdirSync(base, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && isShipped(entry.name))
    .map((entry) => relative(base, join(entry.parentPath, entry.name)));
}

if (process.argv.includes("--check")) {
  const expected = files(source).sort();
  const actual = existsSync(destination) ? files(destination).sort() : [];
  const stale =
    JSON.stringify(expected) !== JSON.stringify(actual) ||
    expected.some((path) => readFileSync(join(source, path), "utf8") !== readFileSync(join(destination, path), "utf8"));
  if (stale) throw new Error("The skill's copy of src is stale; run `pnpm sync:skill`.");
  console.log("The skill's copy of src is current.");
} else {
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true, filter: isShipped });
  console.log(`Copied src to ${relative(root, destination)}.`);
}
