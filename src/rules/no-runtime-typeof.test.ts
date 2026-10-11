import { RuleTester } from "oxlint/plugins-dev";

import { noRuntimeTypeofRule } from "./no-runtime-typeof.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "runtimeTypeof" };
const disguised = { messageId: "typeofEquivalent" };
const allowInTypeGuards = [{ allowInTypeGuards: true }];

tester.run("anti-slop/no-runtime-typeof", noRuntimeTypeofRule, {
	valid: [
		'const isServer = typeof document === "undefined";',
		'const hasStorage = typeof localStorage !== "undefined";',
		'if (typeof globalThis.crypto === "undefined") throw new Error("no crypto");',
		'const missing = "undefined" === typeof process;',
		"const value = input;",
		"const same = String(left) === right;",
		'const named = String(code) === "200";',
		"const isDate = value instanceof Date;",
		"function check(String: (value: string) => string, value: string) { return String(value) === value; }",
		{
			code: "const isString = (value: unknown): value is string => String(value) === value;",
			options: allowInTypeGuards,
		},
		{
			code: 'function isString(value: unknown): value is string { return typeof value === "string"; }',
			options: allowInTypeGuards,
		},
		{
			code: 'const isString = (value: unknown): value is string => typeof value === "string";',
			options: allowInTypeGuards,
		},
		{
			code: 'function assertString(value: unknown): asserts value is string { if (typeof value !== "string") throw new Error(); }',
			options: allowInTypeGuards,
		},
	],
	invalid: [
		{ code: "if (String(input) === input) use(input);", errors: [disguised] },
		{ code: "if (input !== Number(input)) skip();", errors: [disguised] },
		{ code: "const isObject = Object(input) === input;", errors: [disguised] },
		{ code: "const isRecord = input instanceof Object;", errors: [disguised] },
		{ code: "const isString = (value: unknown): value is string => String(value) === value;", errors: [disguised] },
		{ code: 'if (typeof input === "string") use(input);', errors: [error] },
		{ code: "if (typeof input === undefined) use(input);", errors: [error] },
		{
			code: 'function isString(value: unknown): value is string { return typeof value === "string"; }',
			errors: [error],
		},
		{
			code: 'function parse(value: unknown): string { if (typeof value !== "string") throw new Error(); return value; }',
			options: allowInTypeGuards,
			errors: [error],
		},
		{
			code: 'function isString(value: unknown): value is string { const check = () => typeof value === "string"; return check(); }',
			options: allowInTypeGuards,
			errors: [error],
		},
	],
});
