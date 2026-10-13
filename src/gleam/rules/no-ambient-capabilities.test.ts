import { RuleTester } from "oxlint/plugins-dev";

import { noAmbientCapabilitiesRule } from "./no-ambient-capabilities.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const boundary = "src/main.ffi.ts";
const error = { messageId: "ambient" };

tester.run("anti-slop-gleam/no-ambient-capabilities", noAmbientCapabilitiesRule, {
	valid: [
		"export function sync(fetch: typeof fetch, url: string) { return fetch(url); }",
		"export function stamp(now: () => Date) { return now().toISOString(); }",
		"const parsed = new Date(text);",
		"const client = { fetch: request };",
		"client.fetch(url);",
		"type Sleep = typeof setTimeout;",
		"import type { Stats } from \"node:fs\";",
		"import { z } from \"zod\";",
		"const random = seeded.random();",
		{ filename: boundary, code: "import { readFile } from \"node:fs/promises\"; run({ fetch, now: () => new Date(), random: Math.random, env: process.env });" },
	],
	invalid: [
		{ code: "const response = await fetch(url);", errors: [{ ...error, data: { name: "fetch", capability: "the network" } }] },
		{ code: "run({ fetch });", errors: [error] },
		{ code: "const request = fetch;", errors: [error] },
		{ code: "const started = Date.now();", errors: [{ ...error, data: { name: "Date.now", capability: "the clock" } }] },
		{ code: "const today = new Date();", errors: [error] },
		{ code: "const label = Date();", errors: [error] },
		{ code: "const elapsed = performance.now();", errors: [error] },
		{ code: "const roll = Math.random();", errors: [{ ...error, data: { name: "Math.random", capability: "randomness" } }] },
		{ code: "const id = crypto.randomUUID();", errors: [error] },
		{ code: "setTimeout(done, 100);", errors: [{ ...error, data: { name: "setTimeout", capability: "timers" } }] },
		{ code: "const port = process.env.PORT;", errors: [{ ...error, data: { name: "process", capability: "the process environment" } }] },
		{ code: "import { readFile } from \"node:fs/promises\";", errors: [{ ...error, data: { name: "node:fs/promises", capability: "the fs/promises module" } }] },
		{ code: "import fs from \"fs\";", errors: [error] },
		{ code: "const fs = await import(\"node:fs\");", errors: [error] },
		{ code: "const { exec } = require(\"child_process\");", errors: [error] },
	],
});
