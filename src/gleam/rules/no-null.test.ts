import { RuleTester } from "oxlint/plugins-dev";

import { noNullRule } from "./no-null.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const boundary = "src/clock.ffi.ts";

const error = { messageId: "null" };

tester.run("anti-slop-gleam/no-null", noNullRule, {
	valid: [
		"const name: string | undefined = undefined;",
		"const label = \"null\";",
		"const pattern = /null/u;",
		"const value = 0;",
		"const match = pattern.exec(text); if (match === null) skip();",
		"if (null != value) use(value);",
		{ filename: boundary, code: "export function find(id: string): User | undefined { return lookup(id) ?? undefined; } const empty: string | null = null;" },
	],
	invalid: [
		{ code: "const name = null;", errors: [error] },
		{ code: "type Name = string | null;", errors: [error] },
		{ code: "const fallback = value ?? null;", errors: [error] },
		{ code: "const isEmpty = value === null || null;", errors: [error] },
		{ code: "function find(id: string): User | null { return null; }", errors: [error, error] },
	],
});
